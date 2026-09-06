package main

import (
	"context"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

// 扫频要跑几十秒到几分钟。如果按普通命令处理，WebSocket 读循环会一直卡在
// runCommand 里，手册规定的 abcd 打断根本读不到；命令锁也会被独占。
// 这里验证扫频立刻返回、结果通过推送流式送达、并且期间还能收命令。
func TestCellScanStreamsResultsAsynchronously(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	resp := sendCmd(t, conn, "AT^CELLSCAN")
	if !resp.Success || resp.Data == nil {
		t.Fatalf("扫频未被受理: %+v", resp)
	}
	if !strings.Contains(*resp.Data, "STARTED") {
		t.Fatalf("扫频应立刻返回受理应答，实际: %q", *resp.Data)
	}

	first := readPush(t, conn, "cellscan")
	if first["state"] != "running" {
		t.Fatalf("首条推送应为 running，实际: %v", first["state"])
	}
	if cell, _ := first["cell"].(string); !strings.HasPrefix(cell, "^CELLSCAN:") {
		t.Fatalf("running 推送应带上扫到的小区，实际: %q", cell)
	}

	done := waitForScanEnd(t, conn)
	if done["state"] != "done" {
		t.Fatalf("扫频应正常结束，实际: %v", done["state"])
	}
	if count, _ := done["count"].(float64); count != 3 {
		t.Fatalf("应扫到 3 个小区，实际: %v", done["count"])
	}
	lines, _ := done["lines"].([]any)
	if len(lines) != 3 {
		t.Fatalf("结束推送应带完整结果，实际 %d 条", len(lines))
	}
}

// 手册 5.35.2：扫频过程中下发小写 abcd 可打断，打断完成后输出 OK，
// 按扫描完成处理——也就是说已经扫到的结果依然有效，不能丢。
func TestCellScanAbortKeepsPartialResults(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	sendCmd(t, conn, "AT^CELLSCAN")
	if first := readPush(t, conn, "cellscan"); first["state"] != "running" {
		t.Fatalf("首条推送应为 running，实际: %v", first["state"])
	}

	if resp := sendCmd(t, conn, "AT^CELLSCAN=ABORT"); !resp.Success {
		t.Fatalf("打断命令应被受理: %+v", resp)
	}

	end := waitForScanEnd(t, conn)
	if end["state"] != "aborted" {
		t.Fatalf("应标记为已打断，实际: %v", end["state"])
	}
	if count, _ := end["count"].(float64); count < 1 {
		t.Fatalf("打断前扫到的结果不能丢，实际: %v", end["count"])
	}

	var sawAbort bool
	for _, c := range rig.modem.commands() {
		if c == cellScanAbortToken {
			sawAbort = true
		}
	}
	if !sawAbort {
		t.Fatalf("模组没收到打断字符串 %q，实际收到: %v", cellScanAbortToken, rig.modem.commands())
	}
}

func TestCellScanAbortWithoutScanIsRejected(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	resp := sendCmd(t, conn, "AT^CELLSCAN=ABORT")
	if resp.Success {
		t.Fatal("没有扫频在跑时打断应当报错")
	}
	if resp.Error == nil || !strings.Contains(*resp.Error, "没有正在进行的扫频") {
		t.Fatalf("错误提示不明确: %+v", resp.Error)
	}
}

// 扫频期间模组被独占，其它命令与其排在命令锁后面白等到超时，
// 不如直接给一个说得清原因的错误。
func TestCommandsDuringScanGetClearError(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	sendCmd(t, conn, "AT^CELLSCAN")
	resp := sendCmd(t, conn, "AT+CSQ")
	if resp.Success {
		t.Fatal("扫频期间的普通命令不应当成功")
	}
	if resp.Error == nil || !strings.Contains(*resp.Error, "正在扫频") {
		t.Fatalf("错误提示应说明是扫频占用，实际: %+v", resp.Error)
	}

	sendCmd(t, conn, "AT^CELLSCAN=ABORT")
	waitForScanEnd(t, conn)

	// 扫频结束后必须恢复正常，不能把通道永久挡住。
	if resp := sendCmd(t, conn, "AT+CSQ"); !resp.Success {
		t.Fatalf("扫频结束后命令应恢复: %+v", resp)
	}
}

// waitForScanEnd 跳过中途的 running 推送，取最终状态。
func waitForScanEnd(t *testing.T, conn *websocket.Conn) map[string]any {
	t.Helper()
	for i := 0; i < 20; i++ {
		push := readPush(t, conn, "cellscan")
		if push["state"] != "running" {
			return push
		}
	}
	t.Fatal("扫频始终没有结束")
	return nil
}

// ^REJINFO（手册 13.14）和 +CUSD（手册 5.22）没有对应的结构化推送，
// 前端只能靠 raw_data 收到。它们又是纯 URC，命令执行期间到达时必须既不被
// 那条命令的应答吃掉，也不能因为"独占型上报"而被静默丢弃。
func TestPassthroughURCReachesClientDuringCommand(t *testing.T) {
	cases := []struct {
		name string
		line string
	}{
		{"网络拒绝原因", `^REJINFO:46000,1,40,2,3,40,"0026F8","FF","0A444202"`},
		{"USSD 网络回复", `+CUSD: 1,"AAD86C3602",15`},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			rig := newTestRig(t, "", NotificationConfig{})
			conn := rig.dial(t)

			rig.modem.pushURC(t, c.line)

			deadline := time.Now().Add(5 * time.Second)
			for time.Now().Before(deadline) {
				var push struct {
					Type string `json:"type"`
					Data string `json:"data"`
				}
				if err := json.Unmarshal([]byte(readText(t, conn)), &push); err != nil {
					continue
				}
				if push.Type == "raw_data" && push.Data == c.line {
					return
				}
			}
			t.Fatalf("前端没有收到 %s", c.line)
		})
	}
}

// AT+CUSD? 的应答是单字段的 "+CUSD: 1"，不能被当成 USSD 网络回复截走，
// 否则查询命令永远拿不到自己的结果。
func TestCusdQueryResponseIsNotTreatedAsURC(t *testing.T) {
	if isPassthroughURC("+CUSD: 1") {
		t.Fatal("AT+CUSD? 的应答被误判为主动上报")
	}
	if !isPassthroughURC(`+CUSD: 1,"AAD86C3602",15`) {
		t.Fatal("USSD 网络回复应当被识别为主动上报")
	}
}

// 扫频要独占模组好几分钟，其间注册状态查不到、模组本身也会暂时离网。
// 如果定时锁频照常计时，一次全频段扫描就能让"无服务超时"到点，
// 把用户锁好的频段自动解开——锁了一晚上，扫一次频就白锁了。
func TestScanDoesNotTriggerScheduledUnlock(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	// 扫描期间与刚扫完时，模组报"搜网中"，模拟扫频把驻留小区打散的真实情况。
	rig.modem.unregisterWhileScanning()

	cfg := ScheduleConfig{
		Enabled:        true,
		CheckInterval:  50 * time.Millisecond,
		NoServiceLimit: 150 * time.Millisecond,
		UnlockLTE:      true,
		UnlockNR:       true,
		NightEnabled:   true,
		NightStart:     "00:00",
		NightEnd:       "23:59",
		NightNR:        BandLock{Type: 1, Bands: "78", ARFCNs: "633888"},
	}
	sched := NewScheduler(cfg, rig.client, nil, NewLogger(LevelError))

	// 等 Run 真正退出再结束用例，否则这个 goroutine 会带着自己的 AT 通道
	// 漏进下一个用例，在 -race 下拖慢它、造成偶发超时。
	ctx, cancel := context.WithCancel(context.Background())
	stopped := make(chan struct{})
	go func() {
		defer close(stopped)
		sched.Run(ctx)
	}()
	defer func() {
		cancel()
		<-stopped
	}()

	// 等首轮锁频下发完，并且已经开始例行查注册状态，说明调度器进入了稳定周期。
	// applyLock 内部带秒级 sleep，不等到这一步就开扫，测试窗口会在调度器
	// 做出反应之前就结束，看起来"没问题"其实什么都没测到。
	waitFor(t, 5*time.Second, func() bool {
		return hasCommand(rig.modem.commands(), `AT^NRFREQLOCK=1,`)
	}, "定时锁频没有下发初始锁频命令")
	waitFor(t, 5*time.Second, func() bool {
		return countCommand(rig.modem.commands(), "AT+C5GREG?") >= 1
	}, "定时锁频没有开始检测注册状态")
	mark := len(rig.modem.commands())

	sendCmd(t, conn, "AT^CELLSCAN")
	waitForScanEnd(t, conn)

	// 扫完之后要给调度器足够多的检测周期去误判，否则测不出问题。
	waitFor(t, 5*time.Second, func() bool {
		return countCommand(rig.modem.commands()[mark:], "AT+C5GREG?") >= 2
	}, "扫频结束后调度器没有恢复检测")

	after := rig.modem.commands()[mark:]
	if hasCommand(after, "AT^NRFREQLOCK=0") || hasCommand(after, "AT^LTEFREQLOCK=0") {
		t.Fatalf("扫频被当成了无服务，锁频被自动解除: %v", after)
	}
}

func countCommand(cmds []string, want string) int {
	n := 0
	for _, c := range cmds {
		if c == want {
			n++
		}
	}
	return n
}

func hasCommand(cmds []string, prefix string) bool {
	for _, c := range cmds {
		if strings.HasPrefix(c, prefix) {
			return true
		}
	}
	return false
}
