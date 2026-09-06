package main

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"sync"
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

// nrBandARFCN 是 3GPP TS 38.104 主要频段的 NR-ARFCN 下行范围。
// 注意 NR-ARFCN 与 LTE 的 EARFCN 是两套完全不同的编号：sub-3GHz 段
// ARFCN = 频率/5kHz，3GHz 以上段 ARFCN = 600000 + (频率-3000MHz)/15kHz。
var nrBandARFCN = map[int][2]int{
	1: {422000, 434000}, 2: {386000, 398000}, 3: {361000, 376000},
	5: {173800, 178800}, 7: {524000, 538000}, 8: {185000, 192000},
	12: {145800, 149200}, 20: {158200, 164200}, 25: {386000, 399000},
	28: {151600, 160600}, 34: {402000, 405000}, 38: {514000, 524000},
	39: {376000, 384000}, 40: {460000, 480000}, 41: {499200, 537999},
	48: {636667, 646666}, 66: {422000, 440000}, 71: {123400, 130400},
	77: {620000, 680000}, 78: {620000, 653333}, 79: {693334, 733333},
	257: {2054166, 2104165}, 258: {2016667, 2070832},
	260: {2229166, 2279165}, 261: {2070833, 2084999},
}

// nr30kHzBands 是 SSB 默认按 30kHz 子载波间隔的频段（sub-6 的 TDD 中高频段），
// nrMmWaveBands 走 120kHz，其余（FDD 与低频段）按 15kHz。
var nr30kHzBands = map[int]bool{41: true, 48: true, 77: true, 78: true, 79: true}
var nrMmWaveBands = map[int]bool{257: true, 258: true, 260: true, 261: true}

// Scheduler 按时段切换锁频设置，并在长时间无服务时自动解锁恢复。
// 配置可以在运行期被 WebUI 改写，因此 cfg 与运行状态都由 mu 保护。
type Scheduler struct {
	client   *ATClient
	notifier *Notifier
	log      *Logger

	mu  sync.RWMutex
	cfg ScheduleConfig

	lastServiceAt time.Time
	currentMode   string
	switchCount   int
	lastApplied   lockPair
	applied       bool
	lastSwitchAt  time.Time
	announced     bool
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

// Config 返回当前生效的配置副本。
func (s *Scheduler) Config() ScheduleConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.cfg
}

// SetConfig 热替换配置。下一个检测周期就会按新配置判断是否需要重新下发，
// 不需要重启服务，也不会打断当前的 WebSocket 连接。
func (s *Scheduler) SetConfig(cfg ScheduleConfig) {
	s.mu.Lock()
	s.cfg = cfg
	s.announced = false
	s.mu.Unlock()
}

func (s *Scheduler) Run(ctx context.Context) {
	// 即使当前未启用也要保持轮询：用户可能在 WebUI 里随时打开开关，
	// 早期实现在这里直接 return，导致开关打开后必须重启服务才生效。
	for {
		cfg := s.Config()
		if !sleepCtx(ctx, cfg.CheckInterval) {
			return
		}

		cfg = s.Config()
		s.announce(cfg)
		if !cfg.Enabled || !s.client.Connected() {
			continue
		}

		// 扫频会独占模组几分钟，期间注册状态查不到、扫描本身也会让模组暂时离网。
		// 如果照常计时，一次全频段扫描就足以让"无服务超时"到点，把用户锁好的
		// 频段自动解开。这里跳过这一轮，并把计时起点推到现在，给网络恢复留时间。
		if s.client.LongCommandActive() {
			s.mu.Lock()
			s.lastServiceAt = time.Now()
			s.mu.Unlock()
			s.log.Debugf("扫频占用模组，跳过本轮定时锁频检测")
			continue
		}

		s.safeTick(ctx, cfg)
	}
}

// scanRecoveryGrace 是扫频结束后留给模组重新驻留的时间，这段时间内不做
// 无服务判定。代价只是自动解锁最多晚这么久触发，比误解锁划算得多。
const scanRecoveryGrace = 60 * time.Second

// modemBusyRecently 判断模组是不是正被扫频占着、或者刚扫完还没缓过来。
func (s *Scheduler) modemBusyRecently() bool {
	if s.client.LongCommandActive() {
		return true
	}
	end := s.client.LongCommandEndedAt()
	return !end.IsZero() && time.Since(end) < scanRecoveryGrace
}

// safeTick 保证单次检测出问题时只丢这一轮，不会让整个服务退出。
func (s *Scheduler) safeTick(ctx context.Context, cfg ScheduleConfig) {
	defer guard(s.log, "定时锁频")
	s.tick(ctx, cfg)
}

// announce 在配置变化后打印一次当前编排，避免每个周期都刷日志。
func (s *Scheduler) announce(cfg ScheduleConfig) {
	s.mu.Lock()
	if s.announced {
		s.mu.Unlock()
		return
	}
	s.announced = true
	s.mu.Unlock()

	if !cfg.Enabled {
		s.log.Infof("定时锁频未启用")
		return
	}
	s.log.Infof("定时锁频已启用：检测间隔 %s，无服务超时 %s", cfg.CheckInterval, cfg.NoServiceLimit)
	s.log.Infof("  夜间模式 %s (%s-%s)，日间模式 %s",
		enabledText(cfg.NightEnabled), cfg.NightStart, cfg.NightEnd, enabledText(cfg.DayEnabled))
}

func enabledText(b bool) string {
	if b {
		return "启用"
	}
	return "禁用"
}

func (s *Scheduler) tick(ctx context.Context, cfg ScheduleConfig) {
	target := s.targetMode(cfg, time.Now())
	want := s.lockFor(cfg, target)

	s.mu.RLock()
	mode, applied, last := s.currentMode, s.applied, s.lastApplied
	s.mu.RUnlock()

	// 除了跨时段，配置被改写导致目标锁参数变化时也要重新下发，
	// 否则在 WebUI 里改完当前时段的频段要等到下次换时段才生效。
	if target != mode || !applied || want != last {
		switch {
		case target != "":
			s.log.Infof("时段切换: %s -> %s", orNone(mode), target)
			s.applyLock(ctx, cfg, want, target)
		case applied:
			s.log.Infof("当前时段无需锁频，解锁所有频段")
			s.applyLock(ctx, cfg, unlockConfig(), "解锁")
		}
		s.mu.Lock()
		s.currentMode = target
		s.lastApplied = want
		s.applied = true
		s.lastSwitchAt = time.Now()
		s.mu.Unlock()
	}

	if s.hasService(ctx) {
		s.mu.Lock()
		s.lastServiceAt = time.Now()
		s.mu.Unlock()
		return
	}

	// 扫频独占模组，期间查不到注册状态；扫完之后模组还要重新驻留。
	// 这段时间查不到网是正常的，不能算进无服务时长，否则一次全频段扫描
	// 就足以让超时到点，把用户锁好的频段自动解开。
	// 注意这个判断必须放在这里而不是只放在 Run 的循环里：本轮检测很可能是在
	// 扫频开始前就进来了、一直阻塞在命令锁上，扫完才拿到"搜网中"的应答。
	if s.modemBusyRecently() {
		s.log.Debugf("刚扫过频，跳过无服务判定")
		s.mu.Lock()
		s.lastServiceAt = time.Now()
		s.mu.Unlock()
		return
	}

	s.mu.RLock()
	down := time.Since(s.lastServiceAt)
	s.mu.RUnlock()
	if down < cfg.NoServiceLimit {
		s.log.Debugf("无服务已持续 %s", down.Truncate(time.Second))
		return
	}

	// 锁频锁到了没有覆盖的小区会一直无服务，这时解锁比守着配置更重要。
	// 这里不重置 currentMode / lastApplied，避免解锁后立刻又锁回去形成来回抖动。
	s.log.Warnf("网络无服务已持续 %s，解锁频段恢复", down.Truncate(time.Second))
	s.applyLock(ctx, cfg, unlockConfig(), "恢复")
	s.mu.Lock()
	s.lastServiceAt = time.Now()
	s.mu.Unlock()
}

func orNone(s string) string {
	if s == "" {
		return "无"
	}
	return s
}

// targetMode 返回当前时刻应该使用的模式，"" 表示不锁频。
func (s *Scheduler) targetMode(cfg ScheduleConfig, now time.Time) string {
	night := s.isNight(cfg, now)
	switch {
	case night && cfg.NightEnabled:
		return "夜间"
	case !night && cfg.DayEnabled:
		return "日间"
	}
	return ""
}

func (s *Scheduler) isNight(cfg ScheduleConfig, now time.Time) bool {
	start, okStart := parseHHMM(cfg.NightStart)
	end, okEnd := parseHHMM(cfg.NightEnd)
	if !okStart || !okEnd {
		s.log.Warnf("夜间时段配置无法解析: %q-%q", cfg.NightStart, cfg.NightEnd)
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

func (s *Scheduler) lockFor(cfg ScheduleConfig, mode string) lockPair {
	switch mode {
	case "夜间":
		return lockPair{LTE: cfg.NightLTE, NR: cfg.NightNR}
	case "日间":
		return lockPair{LTE: cfg.DayLTE, NR: cfg.DayNR}
	}
	return unlockConfig()
}

// hasService 通过注册状态判断是否有网络服务。
func (s *Scheduler) hasService(ctx context.Context) bool {
	// C5GREG 覆盖 SA 组网，CEREG 覆盖 LTE 与 NSA，CREG 兜底。
	for _, cmd := range []string{"AT+C5GREG?", "AT+CEREG?", "AT+CREG?"} {
		resp, err := s.client.SendCommand(ctx, cmd)
		if err != nil {
			continue
		}
		if registered(resp.Text()) {
			return true
		}
	}
	return false
}

// regStatusPattern 匹配 +CREG/+CGREG/+CEREG/+C5GREG 的查询应答。
// 按 3GPP 27.007，查询应答是 "+CxREG: <n>,<stat>[,...]"，其中 <n> 只是 URC
// 上报模式（0/1/2），真正的注册状态是第二个字段。早期实现直接匹配 ": 0,1"，
// 在开了 URC 上报（n=1/2）的设备上永远判定为无服务，锁频会在超时后被自动解除。
var regStatusPattern = regexp.MustCompile(`\+C[A-Z0-9]*REG:\s*\d+\s*,\s*(\d+)`)

// registered 判断注册状态字段是否表示已驻网：1=已注册本地网络，5=已注册漫游网络。
func registered(text string) bool {
	for _, m := range regStatusPattern.FindAllStringSubmatch(text, -1) {
		if m[1] == "1" || m[1] == "5" {
			return true
		}
	}
	return false
}

// applyLock 下发一次完整的锁频切换。
func (s *Scheduler) applyLock(ctx context.Context, sched ScheduleConfig, cfg lockPair, mode string) {
	s.mu.Lock()
	s.switchCount++
	count := s.switchCount
	s.mu.Unlock()
	s.log.Infof("开始切换到%s锁频设置 (第 %d 次)", mode, count)

	var done []string

	if sched.ToggleAirplane {
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

	if sched.ToggleAirplane {
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
			lockSummary("LTE", cfg.LTE), lockSummary("NR", cfg.NR), actions, count),
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
		if !s.Config().UnlockLTE {
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
		if !s.Config().UnlockNR {
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
		// ARFCN 按 64 位解析：配置校验允许到 4294967295，
		// 32 位平台上 Atoi 解不动大于 2^31 的值，会被误判成"不是数字"
		arfcn, err2 := strconv.ParseInt(arfcns[i], 10, 64)
		if err1 != nil || err2 != nil {
			log.Warnf("%s 锁频参数不是数字: 频段 %q 频点 %q", kind, bands[i], arfcns[i])
			return false
		}
		r, known := table[band]
		if known && (arfcn < int64(r[0]) || arfcn > int64(r[1])) {
			log.Warnf("%s 频段 %d 与频点 %d 不匹配(应在 %d-%d)", kind, band, arfcn, r[0], r[1])
			return false
		}
	}
	return true
}

// autoDetectSCS 在未显式配置时按频段推断 SSB 的子载波间隔类型。
// 取值含义见 AT 手册 13.13.3：0=15kHz 1=30kHz 3=120kHz。
func autoDetectSCS(bands []string) []string {
	out := make([]string, 0, len(bands))
	for _, b := range bands {
		band, err := strconv.Atoi(b)
		switch {
		case err != nil:
			out = append(out, "1")
		case nrMmWaveBands[band]:
			out = append(out, "3")
		case nr30kHzBands[band]:
			out = append(out, "1")
		default:
			out = append(out, "0")
		}
	}
	return out
}
