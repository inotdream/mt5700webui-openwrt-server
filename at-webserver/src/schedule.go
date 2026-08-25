package main

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// lteBandARFCN 是 3GPP TS 36.101 主要频段的 EARFCN 范围，用于在下发前
// 挡掉明显对不上的频段/频点组合，避免把模组锁到一个不存在的小区上。
var lteBandARFCN = map[int][2]int{
	1: {0, 599}, 2: {600, 1199}, 3: {1200, 1949}, 4: {1950, 2399}, 5: {2400, 2649},
	7: {2750, 3449}, 8: {3450, 3799}, 12: {5010, 5179}, 13: {5180, 5279},
	17: {5730, 5849}, 18: {5850, 5999}, 19: {6000, 6149}, 20: {6150, 6449},
	25: {8040, 8689}, 26: {8690, 9039}, 28: {9210, 9659}, 38: {37750, 38249},
	39: {38250, 38649}, 40: {38650, 39649}, 41: {39650, 41589}, 42: {41590, 43589},
	43: {43590, 45589}, 66: {66436, 67335},
}

// nrBandARFCN 是 3GPP TS 38.104 主要频段的 NR-ARFCN 范围。
var nrBandARFCN = map[int][2]int{
	1: {0, 599}, 3: {1200, 1949}, 5: {2400, 2649}, 7: {2750, 3449}, 8: {3450, 3799},
	12: {5010, 5179}, 20: {6150, 6449}, 25: {8040, 8689}, 28: {9210, 9659},
	34: {20167, 20265}, 38: {37750, 38249}, 39: {38250, 38649}, 40: {38650, 39649},
	41: {39650, 41589}, 42: {41590, 43589}, 43: {43590, 45589}, 48: {55240, 56739},
	66: {66436, 67335}, 71: {132600, 133189}, 77: {620000, 680000},
	78: {620000, 680000}, 79: {440000, 500000},
	257: {2016667, 2079166}, 258: {2016667, 2079166},
	260: {2016667, 2079166}, 261: {2016667, 2079166},
}

// nr15kHzBands 里的频段按 15kHz 子载波间隔处理，其余默认 30kHz。
var nr15kHzBands = map[int]bool{28: true, 71: true}

// Scheduler 按时段切换锁频设置，并在长时间无服务时自动解锁恢复。
type Scheduler struct {
	cfg      ScheduleConfig
	client   *ATClient
	notifier *Notifier
	log      *Logger

	lastServiceAt time.Time
	currentMode   string
	switchCount   int
}

func NewScheduler(cfg ScheduleConfig, client *ATClient, notifier *Notifier, log *Logger) *Scheduler {
	return &Scheduler{
		cfg:           cfg,
		client:        client,
		notifier:      notifier,
		log:           log,
		lastServiceAt: time.Now(),
	}
}

func (s *Scheduler) Run(ctx context.Context) {
	if !s.cfg.Enabled {
		s.log.Infof("定时锁频未启用")
		return
	}

	s.log.Infof("定时锁频已启用：检测间隔 %s，无服务超时 %s", s.cfg.CheckInterval, s.cfg.NoServiceLimit)
	s.log.Infof("  夜间模式 %s (%s-%s)，日间模式 %s",
		enabledText(s.cfg.NightEnabled), s.cfg.NightStart, s.cfg.NightEnd, enabledText(s.cfg.DayEnabled))

	for {
		if !sleepCtx(ctx, s.cfg.CheckInterval) {
			return
		}
		if !s.client.Connected() {
			continue
		}
		s.tick(ctx)
	}
}

func enabledText(b bool) string {
	if b {
		return "启用"
	}
	return "禁用"
}

func (s *Scheduler) tick(ctx context.Context) {
	target := s.targetMode(time.Now())

	switch {
	case target != "" && target != s.currentMode:
		s.log.Infof("时段切换: %s -> %s", orNone(s.currentMode), target)
		s.applyLock(ctx, s.lockFor(target), target)
		s.currentMode = target

	case target == "" && s.currentMode != "":
		s.log.Infof("当前时段无需锁频，解锁所有频段")
		s.applyLock(ctx, unlockConfig(), "解锁")
		s.currentMode = ""
	}

	if s.hasService(ctx) {
		s.lastServiceAt = time.Now()
		return
	}

	down := time.Since(s.lastServiceAt)
	if down < s.cfg.NoServiceLimit {
		s.log.Debugf("无服务已持续 %s", down.Truncate(time.Second))
		return
	}

	// 锁频锁到了没有覆盖的小区会一直无服务，这时解锁比守着配置更重要。
	// 这里不重置 currentMode，避免解锁后立刻又锁回去形成来回抖动。
	s.log.Warnf("网络无服务已持续 %s，解锁频段恢复", down.Truncate(time.Second))
	s.applyLock(ctx, unlockConfig(), "恢复")
	s.lastServiceAt = time.Now()
}

func orNone(s string) string {
	if s == "" {
		return "无"
	}
	return s
}

// targetMode 返回当前时刻应该使用的模式，"" 表示不锁频。
func (s *Scheduler) targetMode(now time.Time) string {
	night := s.isNight(now)
	switch {
	case night && s.cfg.NightEnabled:
		return "夜间"
	case !night && s.cfg.DayEnabled:
		return "日间"
	}
	return ""
}

func (s *Scheduler) isNight(now time.Time) bool {
	start, okStart := parseHHMM(s.cfg.NightStart)
	end, okEnd := parseHHMM(s.cfg.NightEnd)
	if !okStart || !okEnd {
		s.log.Warnf("夜间时段配置无法解析: %q-%q", s.cfg.NightStart, s.cfg.NightEnd)
		return false
	}

	cur := now.Hour()*60 + now.Minute()
	if start > end { // 跨零点，例如 22:00-06:00
		return cur >= start || cur < end
	}
	return cur >= start && cur < end
}

func parseHHMM(v string) (int, bool) {
	h, m, ok := strings.Cut(strings.TrimSpace(v), ":")
	if !ok {
		return 0, false
	}
	hour, err1 := strconv.Atoi(strings.TrimSpace(h))
	minute, err2 := strconv.Atoi(strings.TrimSpace(m))
	if err1 != nil || err2 != nil || hour < 0 || hour > 23 || minute < 0 || minute > 59 {
		return 0, false
	}
	return hour*60 + minute, true
}

type lockPair struct {
	LTE BandLock
	NR  BandLock
}

func unlockConfig() lockPair {
	return lockPair{LTE: BandLock{Type: 0}, NR: BandLock{Type: 0}}
}

func (s *Scheduler) lockFor(mode string) lockPair {
	switch mode {
	case "夜间":
		return lockPair{LTE: s.cfg.NightLTE, NR: s.cfg.NightNR}
	case "日间":
		return lockPair{LTE: s.cfg.DayLTE, NR: s.cfg.DayNR}
	}
	return unlockConfig()
}

// hasService 通过注册状态判断是否有网络服务。
func (s *Scheduler) hasService(ctx context.Context) bool {
	for _, cmd := range []string{"AT+CREG?", "AT+CEREG?"} {
		resp, err := s.client.SendCommand(ctx, cmd)
		if err != nil {
			continue
		}
		text := resp.Text()
		// 第二个参数 1=已注册本地网络，5=已注册漫游网络。
		if strings.Contains(text, ": 0,1") || strings.Contains(text, ": 0,5") {
			return true
		}
	}
	return false
}

// applyLock 下发一次完整的锁频切换。
func (s *Scheduler) applyLock(ctx context.Context, cfg lockPair, mode string) {
	s.switchCount++
	s.log.Infof("开始切换到%s锁频设置 (第 %d 次)", mode, s.switchCount)

	var done []string

	if s.cfg.ToggleAirplane {
		if resp, err := s.client.SendCommand(ctx, "AT+CFUN=0"); err == nil && resp.OK() {
			s.log.Infof("已进入飞行模式")
			if !sleepCtx(ctx, 2*time.Second) {
				return
			}
		} else {
			s.log.Warnf("进入飞行模式失败")
		}
	}

	if cmd, action, ok := s.lteCommand(cfg.LTE); ok {
		if s.runLockCommand(ctx, cmd, action) {
			done = append(done, action)
		}
		if !sleepCtx(ctx, time.Second) {
			return
		}
	}

	if cmd, action, ok := s.nrCommand(cfg.NR); ok {
		if s.runLockCommand(ctx, cmd, action) {
			done = append(done, action)
		}
		if !sleepCtx(ctx, time.Second) {
			return
		}
	}

	if s.cfg.ToggleAirplane {
		if resp, err := s.client.SendCommand(ctx, "AT+CFUN=1"); err == nil && resp.OK() {
			s.log.Infof("已退出飞行模式")
			done = append(done, "切飞行模式")
		} else {
			s.log.Warnf("退出飞行模式失败")
		}
		if !sleepCtx(ctx, 3*time.Second) {
			return
		}
	}

	actions := "未执行任何操作"
	if len(done) > 0 {
		actions = strings.Join(done, "、")
	}
	s.notifier.Notify(Notification{
		Sender: senderSignal,
		Kind:   KindSignal,
		Content: fmt.Sprintf("🔄 定时锁频切换\n时间: %s\n模式: %s\nLTE: %s\nNR: %s\n执行操作: %s\n切换次数: 第 %d 次",
			time.Now().Format("2006-01-02 15:04:05"), mode,
			lockSummary("LTE", cfg.LTE), lockSummary("NR", cfg.NR), actions, s.switchCount),
	})
	s.log.Infof("定时锁频切换完成: %s", actions)
}

func lockSummary(kind string, l BandLock) string {
	if l.Type > 0 && strings.TrimSpace(l.Bands) != "" {
		return fmt.Sprintf("%s类型%d", kind, l.Type)
	}
	return kind + "解锁"
}

func (s *Scheduler) runLockCommand(ctx context.Context, cmd, action string) bool {
	s.log.Infof("下发 %s: %s", action, cmd)
	resp, err := s.client.SendCommand(ctx, cmd)
	if err != nil {
		s.log.Warnf("%s 失败: %v", action, err)
		return false
	}
	if !resp.OK() {
		s.log.Warnf("%s 失败: %s", action, resp.Text())
		return false
	}
	s.log.Infof("%s 成功", action)
	return true
}

// lteCommand 返回要下发的 LTE 锁频命令。ok 为 false 表示这一步不需要做。
func (s *Scheduler) lteCommand(l BandLock) (cmd, action string, ok bool) {
	if l.Type <= 0 {
		if !s.cfg.UnlockLTE {
			return "", "", false
		}
		return "AT^LTEFREQLOCK=0", "LTE解锁", true
	}

	bands := splitList(l.Bands)
	if len(bands) == 0 {
		return "", "", false
	}

	switch l.Type {
	case 3: // 频段锁定
		return fmt.Sprintf(`AT^LTEFREQLOCK=3,0,%d,"%s"`, len(bands), strings.Join(bands, ",")),
			fmt.Sprintf("LTE锁频(类型%d)", l.Type), true

	case 1, 2: // 频点锁定 / 小区锁定
		arfcns := splitList(l.ARFCNs)
		if len(arfcns) != len(bands) {
			s.log.Warnf("LTE 锁频：频段与频点数量不一致(%d/%d)，改为解锁", len(bands), len(arfcns))
			return "AT^LTEFREQLOCK=0", "LTE解锁", true
		}
		if !validatePairs(bands, arfcns, lteBandARFCN, "LTE", s.log) {
			return "AT^LTEFREQLOCK=0", "LTE解锁", true
		}
		if l.Type == 1 {
			return fmt.Sprintf(`AT^LTEFREQLOCK=1,0,%d,"%s","%s"`,
					len(bands), strings.Join(bands, ","), strings.Join(arfcns, ",")),
				"LTE锁频(类型1)", true
		}
		pcis := splitList(l.PCIs)
		if len(pcis) != len(bands) {
			s.log.Warnf("LTE 小区锁定：PCI 数量与频段不一致(%d/%d)，改为解锁", len(bands), len(pcis))
			return "AT^LTEFREQLOCK=0", "LTE解锁", true
		}
		return fmt.Sprintf(`AT^LTEFREQLOCK=2,0,%d,"%s","%s","%s"`,
				len(bands), strings.Join(bands, ","), strings.Join(arfcns, ","), strings.Join(pcis, ",")),
			"LTE锁频(类型2)", true
	}

	return "AT^LTEFREQLOCK=0", "LTE解锁", true
}

// nrCommand 返回要下发的 NR 锁频命令。
func (s *Scheduler) nrCommand(l BandLock) (cmd, action string, ok bool) {
	if l.Type <= 0 {
		if !s.cfg.UnlockNR {
			return "", "", false
		}
		return "AT^NRFREQLOCK=0", "NR解锁", true
	}

	bands := splitList(l.Bands)
	if len(bands) == 0 {
		return "", "", false
	}

	switch l.Type {
	case 3:
		return fmt.Sprintf(`AT^NRFREQLOCK=3,0,%d,"%s"`, len(bands), strings.Join(bands, ",")),
			fmt.Sprintf("NR锁频(类型%d)", l.Type), true

	case 1, 2:
		arfcns := splitList(l.ARFCNs)
		if len(arfcns) != len(bands) {
			s.log.Warnf("NR 锁频：频段与频点数量不一致(%d/%d)，改为解锁", len(bands), len(arfcns))
			return "AT^NRFREQLOCK=0", "NR解锁", true
		}

		scs := splitList(l.SCSTypes)
		if len(scs) == 0 {
			scs = autoDetectSCS(bands)
		}
		if len(scs) != len(bands) {
			s.log.Warnf("NR 锁频：SCS 数量与频段不一致(%d/%d)，改为解锁", len(bands), len(scs))
			return "AT^NRFREQLOCK=0", "NR解锁", true
		}
		if !validatePairs(bands, arfcns, nrBandARFCN, "NR", s.log) {
			return "AT^NRFREQLOCK=0", "NR解锁", true
		}

		if l.Type == 1 {
			return fmt.Sprintf(`AT^NRFREQLOCK=1,0,%d,"%s","%s","%s"`,
					len(bands), strings.Join(bands, ","), strings.Join(arfcns, ","), strings.Join(scs, ",")),
				"NR锁频(类型1)", true
		}
		pcis := splitList(l.PCIs)
		if len(pcis) != len(bands) {
			s.log.Warnf("NR 小区锁定：PCI 数量与频段不一致(%d/%d)，改为解锁", len(bands), len(pcis))
			return "AT^NRFREQLOCK=0", "NR解锁", true
		}
		return fmt.Sprintf(`AT^NRFREQLOCK=2,0,%d,"%s","%s","%s","%s"`,
				len(bands), strings.Join(bands, ","), strings.Join(arfcns, ","),
				strings.Join(scs, ","), strings.Join(pcis, ",")),
			"NR锁频(类型2)", true
	}

	return "AT^NRFREQLOCK=0", "NR解锁", true
}

func splitList(v string) []string {
	var out []string
	for _, part := range strings.Split(v, ",") {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// validatePairs 检查每个频段与频点是否落在同一个 3GPP 频段范围内。
// 未收录的频段一律放行，交给模组自己判断。
func validatePairs(bands, arfcns []string, table map[int][2]int, kind string, log *Logger) bool {
	for i := range bands {
		band, err1 := strconv.Atoi(bands[i])
		arfcn, err2 := strconv.Atoi(arfcns[i])
		if err1 != nil || err2 != nil {
			log.Warnf("%s 锁频参数不是数字: 频段 %q 频点 %q", kind, bands[i], arfcns[i])
			return false
		}
		r, known := table[band]
		if known && (arfcn < r[0] || arfcn > r[1]) {
			log.Warnf("%s 频段 %d 与频点 %d 不匹配(应在 %d-%d)", kind, band, arfcn, r[0], r[1])
			return false
		}
	}
	return true
}

// autoDetectSCS 在未显式配置时按频段推断子载波间隔类型。
func autoDetectSCS(bands []string) []string {
	out := make([]string, 0, len(bands))
	for _, b := range bands {
		band, err := strconv.Atoi(b)
		if err == nil && nr15kHzBands[band] {
			out = append(out, "0")
			continue
		}
		out = append(out, "1")
	}
	return out
}
