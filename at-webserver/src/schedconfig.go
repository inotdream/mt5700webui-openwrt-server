package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

// 定时锁频配置通过 WebSocket 上的伪 AT 命令读写，沿用 AT+CONNECT? 的做法：
// 这样配置接口自动继承了 WebSocket 的密钥认证，不需要再开一个无认证的 HTTP 口。
const (
	schedQueryCommand   = "AT+SCHED?"
	schedSetPrefix      = "AT+SCHED="
	schedResponsePrefix = "+SCHED: "
)

// bandLockDTO 与 UCI 里的 schedule_*_{lte,nr}_* 一组选项一一对应。
type bandLockDTO struct {
	Type     int    `json:"type"`
	Bands    string `json:"bands"`
	ARFCNs   string `json:"arfcns"`
	SCSTypes string `json:"scs_types"`
	PCIs     string `json:"pcis"`
}

type schedPeriodDTO struct {
	Enabled bool        `json:"enabled"`
	Start   string      `json:"start,omitempty"`
	End     string      `json:"end,omitempty"`
	LTE     bandLockDTO `json:"lte"`
	NR      bandLockDTO `json:"nr"`
}

type schedStatusDTO struct {
	CurrentMode string `json:"current_mode"`
	NextSwitch  string `json:"next_switch"`
	SwitchCount int    `json:"switch_count"`
	Applied     bool   `json:"applied"`
}

type schedConfigDTO struct {
	Enabled        bool `json:"enabled"`
	CheckInterval  int  `json:"check_interval"`
	Timeout        int  `json:"timeout"`
	UnlockLTE      bool `json:"unlock_lte"`
	UnlockNR       bool `json:"unlock_nr"`
	ToggleAirplane bool `json:"toggle_airplane"`

	Night schedPeriodDTO `json:"night"`
	Day   schedPeriodDTO `json:"day"`

	// Status 只在查询时返回，写入时忽略。
	Status *schedStatusDTO `json:"status,omitempty"`
}

func toBandLockDTO(l BandLock) bandLockDTO {
	return bandLockDTO{Type: l.Type, Bands: l.Bands, ARFCNs: l.ARFCNs, SCSTypes: l.SCSTypes, PCIs: l.PCIs}
}

func (d bandLockDTO) toBandLock() BandLock {
	return BandLock{Type: d.Type, Bands: d.Bands, ARFCNs: d.ARFCNs, SCSTypes: d.SCSTypes, PCIs: d.PCIs}
}

func scheduleToDTO(cfg ScheduleConfig) schedConfigDTO {
	return schedConfigDTO{
		Enabled:        cfg.Enabled,
		CheckInterval:  int(cfg.CheckInterval / time.Second),
		Timeout:        int(cfg.NoServiceLimit / time.Second),
		UnlockLTE:      cfg.UnlockLTE,
		UnlockNR:       cfg.UnlockNR,
		ToggleAirplane: cfg.ToggleAirplane,
		Night: schedPeriodDTO{
			Enabled: cfg.NightEnabled, Start: cfg.NightStart, End: cfg.NightEnd,
			LTE: toBandLockDTO(cfg.NightLTE), NR: toBandLockDTO(cfg.NightNR),
		},
		Day: schedPeriodDTO{
			Enabled: cfg.DayEnabled,
			LTE:     toBandLockDTO(cfg.DayLTE), NR: toBandLockDTO(cfg.DayNR),
		},
	}
}

func (d schedConfigDTO) toSchedule() ScheduleConfig {
	return ScheduleConfig{
		Enabled:        d.Enabled,
		CheckInterval:  time.Duration(d.CheckInterval) * time.Second,
		NoServiceLimit: time.Duration(d.Timeout) * time.Second,
		UnlockLTE:      d.UnlockLTE,
		UnlockNR:       d.UnlockNR,
		ToggleAirplane: d.ToggleAirplane,
		NightEnabled:   d.Night.Enabled,
		NightStart:     d.Night.Start,
		NightEnd:       d.Night.End,
		NightLTE:       d.Night.LTE.toBandLock(),
		NightNR:        d.Night.NR.toBandLock(),
		DayEnabled:     d.Day.Enabled,
		DayLTE:         d.Day.LTE.toBandLock(),
		DayNR:          d.Day.NR.toBandLock(),
	}
}

// validate 在落盘前挡住会让模组锁到不存在小区上的配置。
// 取值范围依据 AT 手册 13.12/13.13：锁的个数 1~20，LTE PCI 0~503，NR PCI 0~1007。
func (d schedConfigDTO) validate() error {
	if d.CheckInterval < 10 {
		return fmt.Errorf("检测间隔不能小于 10 秒")
	}
	if d.Timeout < 30 {
		return fmt.Errorf("无服务超时不能小于 30 秒")
	}
	if _, ok := parseHHMM(d.Night.Start); !ok {
		return fmt.Errorf("夜间开始时间格式应为 HH:MM，当前为 %q", d.Night.Start)
	}
	if _, ok := parseHHMM(d.Night.End); !ok {
		return fmt.Errorf("夜间结束时间格式应为 HH:MM，当前为 %q", d.Night.End)
	}
	for _, p := range []struct {
		label string
		item  schedPeriodDTO
	}{{"夜间", d.Night}, {"日间", d.Day}} {
		if !p.item.Enabled {
			continue
		}
		if err := p.item.LTE.validate(p.label+" LTE", lteBandARFCN, 503); err != nil {
			return err
		}
		if err := p.item.NR.validate(p.label+" NR", nrBandARFCN, 1007); err != nil {
			return err
		}
	}
	return nil
}

func (d bandLockDTO) validate(label string, table map[int][2]int, maxPCI int) error {
	if d.Type == 0 {
		return nil
	}
	if d.Type < 0 || d.Type > 3 {
		return fmt.Errorf("%s 锁定类型只能是 0-3，当前为 %d", label, d.Type)
	}

	bands := splitList(d.Bands)
	if len(bands) == 0 {
		return fmt.Errorf("%s 已启用锁定但没有填频段", label)
	}
	if len(bands) > 20 {
		return fmt.Errorf("%s 最多只能锁 20 组，当前 %d 组", label, len(bands))
	}
	if err := allNumeric(label+" 频段", bands, 65535); err != nil {
		return err
	}
	if d.Type == 3 {
		return nil
	}

	arfcns := splitList(d.ARFCNs)
	if len(arfcns) != len(bands) {
		return fmt.Errorf("%s 频点数量(%d)与频段数量(%d)不一致", label, len(arfcns), len(bands))
	}
	if err := allNumeric(label+" 频点", arfcns, 4294967295); err != nil {
		return err
	}
	for i := range bands {
		band, _ := strconv.Atoi(bands[i])
		// ARFCN 用 64 位解析：32 位平台上 Atoi 解不动大于 2^31 的值
		arfcn, _ := strconv.ParseInt(arfcns[i], 10, 64)
		if r, known := table[band]; known && (arfcn < int64(r[0]) || arfcn > int64(r[1])) {
			return fmt.Errorf("%s 频段 %d 与频点 %d 不匹配（该频段频点范围 %d-%d）", label, band, arfcn, r[0], r[1])
		}
	}

	if scs := splitList(d.SCSTypes); len(scs) > 0 {
		if len(scs) != len(bands) {
			return fmt.Errorf("%s SCS 数量(%d)与频段数量(%d)不一致", label, len(scs), len(bands))
		}
		if err := allNumeric(label+" SCS", scs, 4); err != nil {
			return err
		}
	}
	if d.Type == 1 {
		return nil
	}

	pcis := splitList(d.PCIs)
	if len(pcis) != len(bands) {
		return fmt.Errorf("%s PCI 数量(%d)与频段数量(%d)不一致", label, len(pcis), len(bands))
	}
	return allNumeric(label+" PCI", pcis, int64(maxPCI))
}

// allNumeric 校验一组字符串都是 0~max 的整数。
// 用 int64：ARFCN 的上限 4294967295 超过 32 位 int，路由器上
// armv7/mips 这类 32 位平台编译时会直接溢出报错。
func allNumeric(label string, values []string, max int64) error {
	for _, v := range values {
		n, err := strconv.ParseInt(v, 10, 64)
		if err != nil || n < 0 {
			return fmt.Errorf("%s %q 不是有效的非负整数", label, v)
		}
		if n > max {
			return fmt.Errorf("%s %d 超出范围（0-%d）", label, n, max)
		}
	}
	return nil
}

// uciEntries 把配置摊平成 uci key/value，键名与 LuCI 界面使用的完全一致，
// 两边改的是同一份配置。
func (d schedConfigDTO) uciEntries() [][2]string {
	flag := func(b bool) string {
		if b {
			return "1"
		}
		return "0"
	}
	out := [][2]string{
		{"schedule_enabled", flag(d.Enabled)},
		{"schedule_check_interval", strconv.Itoa(d.CheckInterval)},
		{"schedule_timeout", strconv.Itoa(d.Timeout)},
		{"schedule_unlock_lte", flag(d.UnlockLTE)},
		{"schedule_unlock_nr", flag(d.UnlockNR)},
		{"schedule_toggle_airplane", flag(d.ToggleAirplane)},
		{"schedule_night_enabled", flag(d.Night.Enabled)},
		{"schedule_night_start", d.Night.Start},
		{"schedule_night_end", d.Night.End},
		{"schedule_day_enabled", flag(d.Day.Enabled)},
	}
	for _, p := range []struct {
		prefix string
		item   schedPeriodDTO
	}{{"schedule_night", d.Night}, {"schedule_day", d.Day}} {
		for _, l := range []struct {
			kind string
			lock bandLockDTO
		}{{"lte", p.item.LTE}, {"nr", p.item.NR}} {
			base := p.prefix + "_" + l.kind
			out = append(out,
				[2]string{base + "_type", strconv.Itoa(l.lock.Type)},
				[2]string{base + "_bands", l.lock.Bands},
				[2]string{base + "_arfcns", l.lock.ARFCNs},
				[2]string{base + "_scs_types", l.lock.SCSTypes},
				[2]string{base + "_pcis", l.lock.PCIs},
			)
		}
	}
	return out
}

// writeScheduleUCI 落盘配置。用 exec 直接传参，不经过 shell，避免值里的引号被解释。
func writeScheduleUCI(ctx context.Context, d schedConfigDTO) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	for _, kv := range d.uciEntries() {
		arg := "at-webserver.config." + kv[0] + "=" + kv[1]
		if out, err := exec.CommandContext(ctx, "uci", "set", arg).CombinedOutput(); err != nil {
			return fmt.Errorf("写入 %s 失败: %v %s", kv[0], err, strings.TrimSpace(string(out)))
		}
	}
	if out, err := exec.CommandContext(ctx, "uci", "commit", "at-webserver").CombinedOutput(); err != nil {
		return fmt.Errorf("提交配置失败: %v %s", err, strings.TrimSpace(string(out)))
	}
	return nil
}

// nextSwitchAt 返回下一次时段切换的时刻，夜间时段的两个端点就是切换点。
func nextSwitchAt(cfg ScheduleConfig, now time.Time) string {
	cur := now.Hour()*60 + now.Minute()
	best := -1
	for _, v := range []string{cfg.NightStart, cfg.NightEnd} {
		m, ok := parseHHMM(v)
		if !ok {
			continue
		}
		if m > cur && (best < 0 || m < best) {
			best = m
		}
	}
	if best < 0 {
		// 今天剩下的时间里没有切换点了，取明天最早的那个
		for _, v := range []string{cfg.NightStart, cfg.NightEnd} {
			if m, ok := parseHHMM(v); ok && (best < 0 || m < best) {
				best = m
			}
		}
	}
	if best < 0 {
		return ""
	}
	return fmt.Sprintf("%02d:%02d", best/60, best%60)
}

// Status 汇报调度器的运行状态，供 WebUI 展示。
func (s *Scheduler) Status() schedStatusDTO {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return schedStatusDTO{
		CurrentMode: s.currentMode,
		NextSwitch:  nextSwitchAt(s.cfg, time.Now()),
		SwitchCount: s.switchCount,
		Applied:     s.applied,
	}
}

// handleScheduleCommand 处理定时锁频的伪 AT 命令，返回 nil 表示不是这类命令。
func (s *WSServer) handleScheduleCommand(command string) *atCommandResponse {
	trimmed := strings.TrimSpace(command)

	switch {
	case trimmed == schedQueryCommand:
		if s.sched == nil {
			return errResponse("当前构建未启用定时锁频")
		}
		dto := scheduleToDTO(s.sched.Config())
		status := s.sched.Status()
		dto.Status = &status
		payload, err := json.Marshal(dto)
		if err != nil {
			return errResponse("序列化定时锁频配置失败: " + err.Error())
		}
		// 前端会校验应答里带有命令前缀（at.ts matchesLastCommand），
		// 所以这里按普通 AT 应答的样子加上 "+SCHED: "。
		return &atCommandResponse{Success: true, Data: ptr(schedResponsePrefix + string(payload) + "\r\nOK")}

	case strings.HasPrefix(trimmed, schedSetPrefix):
		if s.sched == nil {
			return errResponse("当前构建未启用定时锁频")
		}
		var dto schedConfigDTO
		if err := json.Unmarshal([]byte(strings.TrimPrefix(trimmed, schedSetPrefix)), &dto); err != nil {
			return errResponse("定时锁频配置不是有效的 JSON: " + err.Error())
		}
		if err := dto.validate(); err != nil {
			return errResponse(err.Error())
		}
		if err := writeScheduleUCI(context.Background(), dto); err != nil {
			return errResponse(err.Error())
		}
		s.sched.SetConfig(dto.toSchedule())
		s.log.Infof("定时锁频配置已由 WebUI 更新: 启用=%v 夜间=%v 日间=%v",
			dto.Enabled, dto.Night.Enabled, dto.Day.Enabled)
		return &atCommandResponse{Success: true, Data: ptr(schedResponsePrefix + "OK\r\nOK")}
	}

	return nil
}

func errResponse(msg string) *atCommandResponse {
	return &atCommandResponse{Success: false, Error: &msg}
}

func ptr[T any](v T) *T { return &v }
