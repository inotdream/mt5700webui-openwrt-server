package main

import (
	"encoding/json"
	"strings"
	"testing"
	"time"
)

func validDTO() schedConfigDTO {
	return schedConfigDTO{
		Enabled: true, CheckInterval: 60, Timeout: 180,
		UnlockLTE: true, UnlockNR: true, ToggleAirplane: true,
		Night: schedPeriodDTO{
			Enabled: true, Start: "22:00", End: "06:00",
			LTE: bandLockDTO{Type: 3, Bands: "3,8"},
			NR:  bandLockDTO{Type: 2, Bands: "78", ARFCNs: "633888", SCSTypes: "1", PCIs: "100"},
		},
		Day: schedPeriodDTO{Enabled: true, LTE: bandLockDTO{Type: 0}, NR: bandLockDTO{Type: 0}},
	}
}

func TestScheduleDTORoundTrip(t *testing.T) {
	in := validDTO()
	got := scheduleToDTO(in.toSchedule())
	got.Status = nil
	if got != in {
		t.Fatalf("DTO 往返不一致\n want: %+v\n  got: %+v", in, got)
	}
}

func TestScheduleConfigRejectsBadInput(t *testing.T) {
	cases := []struct {
		name   string
		mutate func(*schedConfigDTO)
		want   string
	}{
		{"检测间隔过小", func(d *schedConfigDTO) { d.CheckInterval = 5 }, "10 秒"},
		{"超时过小", func(d *schedConfigDTO) { d.Timeout = 10 }, "30 秒"},
		{"时间格式错误", func(d *schedConfigDTO) { d.Night.Start = "22点" }, "HH:MM"},
		{"启用锁定但无频段", func(d *schedConfigDTO) { d.Night.LTE = bandLockDTO{Type: 3} }, "没有填频段"},
		{"锁定类型越界", func(d *schedConfigDTO) { d.Night.LTE.Type = 9 }, "0-3"},
		{"超过 20 组", func(d *schedConfigDTO) {
			d.Night.LTE = bandLockDTO{Type: 3, Bands: strings.TrimSuffix(strings.Repeat("3,", 21), ",")}
		}, "20 组"},
		{"频点数量不一致", func(d *schedConfigDTO) {
			d.Night.NR = bandLockDTO{Type: 1, Bands: "78,41", ARFCNs: "633888"}
		}, "数量"},
		{"NR PCI 越界", func(d *schedConfigDTO) { d.Night.NR.PCIs = "2000" }, "0-1007"},
		{"LTE PCI 越界", func(d *schedConfigDTO) {
			d.Night.LTE = bandLockDTO{Type: 2, Bands: "41", ARFCNs: "41332", PCIs: "600"}
		}, "0-503"},
		{"频段与频点不匹配", func(d *schedConfigDTO) {
			// 39650 是 LTE B41 的 EARFCN，不是 NR n41 的频点
			d.Night.NR = bandLockDTO{Type: 1, Bands: "41", ARFCNs: "39650"}
		}, "不匹配"},
		{"频点非数字", func(d *schedConfigDTO) {
			d.Night.NR = bandLockDTO{Type: 1, Bands: "78", ARFCNs: "abc"}
		}, "有效的非负整数"},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			d := validDTO()
			c.mutate(&d)
			err := d.validate()
			if err == nil {
				t.Fatalf("期望校验失败, 但通过了")
			}
			if !strings.Contains(err.Error(), c.want) {
				t.Fatalf("错误信息里应包含 %q, 实际: %v", c.want, err)
			}
		})
	}
}

func TestScheduleConfigAcceptsValidInput(t *testing.T) {
	if err := validDTO().validate(); err != nil {
		t.Fatalf("合法配置被拒: %v", err)
	}
	// 未启用的时段即使填了非法值也不该拦（LuCI 里留着上次的配置很常见）
	d := validDTO()
	d.Day.Enabled = false
	d.Day.NR = bandLockDTO{Type: 1, Bands: "78", ARFCNs: "1"}
	if err := d.validate(); err != nil {
		t.Fatalf("未启用时段不应参与校验: %v", err)
	}
}

// 写入 UCI 用的键名必须和 LuCI 界面读写的那一套完全一致，否则两边各存一份。
func TestScheduleUCIKeysMatchLuCI(t *testing.T) {
	entries := validDTO().uciEntries()
	got := make(map[string]string, len(entries))
	for _, kv := range entries {
		got[kv[0]] = kv[1]
	}
	for _, key := range []string{
		"schedule_enabled", "schedule_check_interval", "schedule_timeout",
		"schedule_unlock_lte", "schedule_unlock_nr", "schedule_toggle_airplane",
		"schedule_night_enabled", "schedule_night_start", "schedule_night_end",
		"schedule_night_lte_type", "schedule_night_lte_bands", "schedule_night_lte_arfcns",
		"schedule_night_lte_pcis", "schedule_night_nr_type", "schedule_night_nr_bands",
		"schedule_night_nr_arfcns", "schedule_night_nr_scs_types", "schedule_night_nr_pcis",
		"schedule_day_enabled", "schedule_day_lte_type", "schedule_day_nr_type",
	} {
		if _, ok := got[key]; !ok {
			t.Errorf("缺少 UCI 键 %s", key)
		}
	}
	if got["schedule_night_nr_bands"] != "78" || got["schedule_night_start"] != "22:00" {
		t.Errorf("值写错了: %v", got)
	}
}

func TestNextSwitchAt(t *testing.T) {
	cfg := ScheduleConfig{NightStart: "22:00", NightEnd: "06:00"}
	cases := map[string]string{
		"12:00": "22:00", // 日间 -> 夜间开始
		"23:30": "06:00", // 夜间 -> 次日夜间结束
		"05:00": "06:00",
		"22:30": "06:00",
	}
	for now, want := range cases {
		m, _ := parseHHMM(now)
		at := time.Date(2025, 8, 25, m/60, m%60, 0, 0, time.Local)
		if got := nextSwitchAt(cfg, at); got != want {
			t.Errorf("%s 的下次切换 = %s, 期望 %s", now, got, want)
		}
	}
}

// 配置写进来之后，下一个周期必须按新配置重新下发，而不是等到跨时段。
func TestSetConfigTriggersReapply(t *testing.T) {
	s := NewScheduler(ScheduleConfig{
		Enabled: true, NightEnabled: true, NightStart: "00:00", NightEnd: "23:59",
		NightNR: BandLock{Type: 3, Bands: "78"},
	}, nil, nil, NewLogger(LevelError))

	cfg := s.Config()
	target := s.targetMode(cfg, time.Now())
	if target != "夜间" {
		t.Fatalf("测试前提不成立, 当前时段为 %q", target)
	}
	first := s.lockFor(cfg, target)

	s.SetConfig(ScheduleConfig{
		Enabled: true, NightEnabled: true, NightStart: "00:00", NightEnd: "23:59",
		NightNR: BandLock{Type: 3, Bands: "41"},
	})
	second := s.lockFor(s.Config(), target)
	if first == second {
		t.Fatalf("改了夜间频段但目标锁参数没变, 不会触发重新下发")
	}
}

func TestScheduleQueryReturnsJSON(t *testing.T) {
	ws := NewWSServer(nil, "", NewLogger(LevelError))
	ws.AttachScheduler(NewScheduler(validDTO().toSchedule(), nil, nil, NewLogger(LevelError)))

	resp := ws.handleScheduleCommand("AT+SCHED?")
	if resp == nil || !resp.Success || resp.Data == nil {
		t.Fatalf("查询定时锁频配置失败: %+v", resp)
	}
	// 应答要按普通 AT 应答的形状包装，否则会被前端的响应匹配校验丢弃
	if !strings.HasPrefix(*resp.Data, schedResponsePrefix) || !strings.HasSuffix(*resp.Data, "OK") {
		t.Fatalf("应答缺少 AT 应答外壳: %q", *resp.Data)
	}
	body := strings.TrimSuffix(strings.TrimPrefix(*resp.Data, schedResponsePrefix), "\r\nOK")

	var dto schedConfigDTO
	if err := json.Unmarshal([]byte(body), &dto); err != nil {
		t.Fatalf("应答不是合法 JSON: %v", err)
	}
	if !dto.Enabled || dto.Night.Start != "22:00" || dto.Night.NR.Bands != "78" {
		t.Fatalf("配置内容不对: %+v", dto)
	}
	if dto.Status == nil || dto.Status.NextSwitch == "" {
		t.Fatalf("应答里缺少运行状态: %+v", dto.Status)
	}
}

func TestScheduleSetRejectsInvalidBeforeWriting(t *testing.T) {
	ws := NewWSServer(nil, "", NewLogger(LevelError))
	ws.AttachScheduler(NewScheduler(ScheduleConfig{}, nil, nil, NewLogger(LevelError)))

	// 校验不过时必须在调用 uci 之前就返回，测试环境里没有 uci 命令，
	// 一旦走到落盘就会报 executable file not found 而不是这里的中文提示。
	resp := ws.handleScheduleCommand(`AT+SCHED={"check_interval":1,"timeout":180}`)
	if resp == nil || resp.Success || resp.Error == nil {
		t.Fatalf("非法配置应被拒: %+v", resp)
	}
	if !strings.Contains(*resp.Error, "10 秒") {
		t.Fatalf("应返回校验失败原因, 实际: %s", *resp.Error)
	}
}

func TestNonScheduleCommandIsNotIntercepted(t *testing.T) {
	ws := NewWSServer(nil, "", NewLogger(LevelError))
	if resp := ws.handleScheduleCommand("AT^NRFREQLOCK?"); resp != nil {
		t.Fatalf("普通 AT 命令不应被伪命令处理器拦截: %+v", resp)
	}
}
