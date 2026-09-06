package main

import (
	"context"
	"strings"
	"sync"
	"testing"
	"time"
)

// 定时锁频必须真的把命令下发到模组。旧实现有两处让它完全不生效：
// 监控任务被注释掉了，而且构建命令时把 list 当 str 传进去会抛 AttributeError。
func TestSchedulerAppliesLockToModem(t *testing.T) {
	modem := newFakeModem(t)
	log := NewLogger(LevelError)

	client := NewATClient(ATConfig{
		Type:    "NETWORK",
		Network: NetworkConfig{Host: "127.0.0.1", Port: modem.port(), Timeout: 2 * time.Second},
	}, log)
	notifier := NewNotifier(NotificationConfig{}, log)

	scheduler := NewScheduler(ScheduleConfig{
		Enabled:        true,
		CheckInterval:  200 * time.Millisecond,
		NoServiceLimit: time.Hour, // 本例不测超时恢复
		ToggleAirplane: true,
		UnlockLTE:      true,
		UnlockNR:       true,
		// 让当前时间必定落在夜间时段内
		NightEnabled: true,
		NightStart:   "00:00",
		NightEnd:     "23:59",
		NightLTE:     BandLock{Type: 3, Bands: "3,8"},
		NightNR:      BandLock{Type: 3, Bands: "78"},
		DayEnabled:   false,
	}, client, notifier, log)

	ctx, cancel := context.WithCancel(context.Background())
	var wg sync.WaitGroup
	for _, fn := range []func(context.Context){client.Run, notifier.Run, scheduler.Run} {
		wg.Add(1)
		go func(f func(context.Context)) { defer wg.Done(); f(ctx) }(fn)
	}
	t.Cleanup(func() { cancel(); wg.Wait() })

	want := []string{
		"AT+CFUN=0",
		`AT^LTEFREQLOCK=3,0,2,"3,8"`,
		`AT^NRFREQLOCK=3,0,1,"78"`,
		"AT+CFUN=1",
	}

	waitFor(t, 20*time.Second, func() bool {
		got := strings.Join(modem.commands(), "\n")
		for _, w := range want {
			if !strings.Contains(got, w) {
				return false
			}
		}
		return true
	}, "定时锁频没有把预期命令下发到模组，实际收到:\n"+strings.Join(modem.commands(), "\n"))

	// 顺序也要对：先进飞行模式，再锁频，最后退出飞行模式。
	got := modem.commands()
	idx := func(cmd string) int {
		for i, c := range got {
			if c == cmd {
				return i
			}
		}
		return -1
	}
	if a, b := idx("AT+CFUN=0"), idx(`AT^LTEFREQLOCK=3,0,2,"3,8"`); a < 0 || b < 0 || a > b {
		t.Errorf("应当先进飞行模式再锁 LTE，实际顺序: %v", got)
	}
	if a, b := idx(`AT^NRFREQLOCK=3,0,1,"78"`), idx("AT+CFUN=1"); a < 0 || b < 0 || a > b {
		t.Errorf("应当锁完 NR 再退出飞行模式，实际顺序: %v", got)
	}
}

// 未启用时不能碰模组，否则会莫名其妙地改用户的锁频设置。
func TestSchedulerDisabledSendsNothing(t *testing.T) {
	modem := newFakeModem(t)
	log := NewLogger(LevelError)

	client := NewATClient(ATConfig{
		Type:    "NETWORK",
		Network: NetworkConfig{Host: "127.0.0.1", Port: modem.port(), Timeout: 2 * time.Second},
	}, log)
	scheduler := NewScheduler(ScheduleConfig{Enabled: false, CheckInterval: 100 * time.Millisecond},
		client, NewNotifier(NotificationConfig{}, log), log)

	ctx, cancel := context.WithCancel(context.Background())
	var wg sync.WaitGroup
	for _, fn := range []func(context.Context){client.Run, scheduler.Run} {
		wg.Add(1)
		go func(f func(context.Context)) { defer wg.Done(); f(ctx) }(fn)
	}
	t.Cleanup(func() { cancel(); wg.Wait() })

	time.Sleep(1500 * time.Millisecond)
	for _, c := range modem.commands() {
		if strings.Contains(c, "FREQLOCK") || strings.Contains(c, "CFUN") {
			t.Errorf("定时锁频未启用却下发了 %q", c)
		}
	}
}
