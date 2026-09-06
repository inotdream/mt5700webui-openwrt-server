package main

import "testing"

// nrBandARFCN 曾经把 LTE 的 EARFCN 范围填给了 NR 频段（例如 n41 写成 39650-41589），
// 而 validatePairs 校验不过时会退化成下发解锁命令。结果是除 n77/n78 之外的
// NR 锁频点/锁小区配置到点后实际执行的是 AT^NRFREQLOCK=0，锁永远上不去。
func TestNRLockAcceptsRealWorldARFCN(t *testing.T) {
	cases := []struct {
		name  string
		band  string
		arfcn string
	}{
		{"n41 中国移动 2.6G", "41", "504990"},
		{"n1 2.1G", "1", "427970"},
		{"n3 1.8G", "3", "368500"},
		{"n5 850M", "5", "176300"},
		{"n8 900M", "8", "187850"},
		{"n28 700M 广电", "28", "154600"},
		{"n78 3.5G", "78", "633888"},
		{"n79 4.9G", "79", "718000"},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			s := &Scheduler{log: NewLogger(LevelError)}
			cmd, _, ok := s.nrCommand(BandLock{Type: 1, Bands: c.band, ARFCNs: c.arfcn})
			if !ok {
				t.Fatalf("频段 %s 频点 %s: 没有生成命令", c.band, c.arfcn)
			}
			if cmd == "AT^NRFREQLOCK=0" {
				t.Fatalf("频段 %s 频点 %s: 被误判为不匹配, 退化成了解锁命令", c.band, c.arfcn)
			}
		})
	}
}

// 频段与频点确实对不上时仍然要挡住，否则会把模组锁到不存在的小区上。
func TestNRLockRejectsMismatchedARFCN(t *testing.T) {
	s := &Scheduler{log: NewLogger(LevelError)}
	// 39650 是 LTE B41 的 EARFCN，不是 NR n41 的频点
	cmd, _, ok := s.nrCommand(BandLock{Type: 1, Bands: "41", ARFCNs: "39650"})
	if !ok || cmd != "AT^NRFREQLOCK=0" {
		t.Fatalf("频段频点不匹配时应退化为解锁, 实际: %q", cmd)
	}
}

func TestLTELockStillUsesEARFCN(t *testing.T) {
	s := &Scheduler{log: NewLogger(LevelError)}
	cmd, _, ok := s.lteCommand(BandLock{Type: 2, Bands: "41", ARFCNs: "41332", PCIs: "420"})
	want := `AT^LTEFREQLOCK=2,0,1,"41","41332","420"`
	if !ok || cmd != want {
		t.Fatalf("LTE 锁小区命令不对\n want: %s\n  got: %s", want, cmd)
	}
}

// SCS 推断关系到能不能对上 SSB：FDD 与低频段是 15kHz，sub-6 的 TDD 中高频是 30kHz，
// 毫米波是 120kHz。旧实现只把 n28/n71 当 15kHz，n1/n3/n5/n8 会被错推成 30kHz。
func TestAutoDetectSCSFollowsBandType(t *testing.T) {
	cases := map[string]string{
		"1": "0", "3": "0", "5": "0", "8": "0", "28": "0", "71": "0",
		"41": "1", "48": "1", "77": "1", "78": "1", "79": "1",
		"257": "3", "260": "3",
	}
	for band, want := range cases {
		if got := autoDetectSCS([]string{band})[0]; got != want {
			t.Errorf("频段 n%s 的 SCS 推断: want %s, got %s", band, want, got)
		}
	}
}

// 锁小区时 SCS 必须跟着频段数量一起带上，且顺序要对应。
func TestNRCellLockCarriesPerBandSCS(t *testing.T) {
	s := &Scheduler{log: NewLogger(LevelError)}
	cmd, _, ok := s.nrCommand(BandLock{
		Type: 2, Bands: "78,28", ARFCNs: "633888,154600", PCIs: "100,200",
	})
	want := `AT^NRFREQLOCK=2,0,2,"78,28","633888,154600","1,0","100,200"`
	if !ok || cmd != want {
		t.Fatalf("NR 锁小区命令不对\n want: %s\n  got: %s", want, cmd)
	}
}

// hasService 早期直接匹配 ": 0,1"，把 +CxREG 应答里的第一个字段当成了注册状态。
// 那个字段其实是 URC 上报模式，真机开了上报就是 1 或 2，于是一直判定为无服务，
// 定时锁频会在 schedule_timeout 到点后把用户锁好的频段自动解开。
func TestRegisteredIgnoresURCReportingMode(t *testing.T) {
	cases := []struct {
		name string
		text string
		want bool
	}{
		{"未开上报 已注册", "+CREG: 0,1", true},
		{"开了上报 已注册", "+CREG: 1,1", true},
		{"带位置信息 已注册", `+CREG: 2,1,"5A01","1F23",7`, true},
		{"带位置信息 漫游", `+CREG: 2,5,"5A01","1F23",7`, true},
		{"SA 已注册", `+C5GREG: 2,1,"5A01","1F23",11`, true},
		{"LTE 已注册", `+CEREG: 2,1,"5A01","1F23",7`, true},
		{"搜网中", "+CREG: 2,2", false},
		{"注册被拒", "+CREG: 1,3", false},
		{"未注册", "+CREG: 0,0", false},
		{"状态未知", "+CREG: 2,4", false},
		{"空应答", "OK", false},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := registered(c.text); got != c.want {
				t.Fatalf("registered(%q) = %v, 期望 %v", c.text, got, c.want)
			}
		})
	}
}
