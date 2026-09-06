package main

import (
	"bufio"
	"context"
	"encoding/json"
	"io"
	"net"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

// fakeModem 是一个最小的 AT 模组模拟器：回显命令、回复固定应答，
// 并且可以按需插入主动上报，用来验证命令应答与上报的解复用是否正确。
type fakeModem struct {
	ln net.Listener

	mu       sync.Mutex
	conn     net.Conn
	received []string
	scanning bool
	scanStop chan struct{}
	// scanDropsService 模拟真机行为：扫频会把驻留的小区打散，
	// 扫描中和刚扫完的一小段时间里注册状态是"搜网中"。
	scanDropsService bool
	scanEndedAt      time.Time
}

func (m *fakeModem) unregisterWhileScanning() {
	m.mu.Lock()
	m.scanDropsService = true
	m.mu.Unlock()
}

// registrationReply 按当前是否在扫频返回不同的注册状态。
func (m *fakeModem) registrationReply(prefix string) string {
	m.mu.Lock()
	searching := m.scanDropsService && (m.scanning || time.Since(m.scanEndedAt) < 300*time.Millisecond)
	m.mu.Unlock()
	if searching {
		// 27.007 <stat>=2：没有注册，正在搜网。
		return "\r\n" + prefix + ": 2,2\r\n\r\nOK\r\n"
	}
	return "\r\n" + prefix + `: 2,1,"5A01","1F23",7` + "\r\n\r\nOK\r\n"
}

func newFakeModem(t *testing.T) *fakeModem {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("监听失败: %v", err)
	}
	m := &fakeModem{ln: ln}
	go m.accept()
	t.Cleanup(func() { _ = ln.Close() })
	return m
}

func (m *fakeModem) port() int { return m.ln.Addr().(*net.TCPAddr).Port }

func (m *fakeModem) accept() {
	for {
		conn, err := m.ln.Accept()
		if err != nil {
			return
		}
		m.mu.Lock()
		m.conn = conn
		m.mu.Unlock()
		go m.serve(conn)
	}
}

func (m *fakeModem) serve(conn net.Conn) {
	defer conn.Close()
	r := bufio.NewReader(conn)
	for {
		line, err := r.ReadString('\r')
		if err != nil {
			if err != io.EOF {
				return
			}
			return
		}
		cmd := strings.TrimSpace(line)
		if cmd == "" {
			continue
		}

		m.mu.Lock()
		m.received = append(m.received, cmd)
		m.mu.Unlock()

		// 真实模组默认开回显，这里一并模拟，用来验证回显过滤。
		m.write(conn, cmd+"\r\n")
		if m.handleScan(conn, cmd) {
			continue
		}
		m.write(conn, m.reply(cmd))
	}
}

// handleScan 模拟 ^CELLSCAN：结果分多行慢慢吐，收到 abcd 立即收尾。
// 返回 true 表示这条命令已由扫频逻辑处理，不再走固定应答表。
func (m *fakeModem) handleScan(conn net.Conn, cmd string) bool {
	switch {
	case strings.HasPrefix(cmd, "AT^CELLSCAN"):
		m.mu.Lock()
		if m.scanning {
			m.mu.Unlock()
			m.write(conn, "\r\nERROR\r\n")
			return true
		}
		m.scanning = true
		stop := make(chan struct{})
		m.scanStop = stop
		m.mu.Unlock()
		go m.emitScan(conn, stop)
		return true
	case cmd == cellScanAbortToken:
		m.mu.Lock()
		stop := m.scanStop
		m.scanStop = nil
		m.mu.Unlock()
		if stop != nil {
			close(stop)
		}
		return true
	}
	return false
}

func (m *fakeModem) emitScan(conn net.Conn, stop chan struct{}) {
	cells := []string{
		`^CELLSCAN: 3,"46000",504990,334,29,5A01,1F23,,,,1,-85,-11,20,`,
		`^CELLSCAN: 3,"46000",627264,201,4E,5A01,1F24,,,,1,-95,-13,12,`,
		`^CELLSCAN: 2,"46001",1850,177,3,5A02,2F10,-98,,,,,,,60`,
	}
	for _, cell := range cells {
		select {
		case <-stop:
			m.finishScan(conn)
			return
		case <-time.After(120 * time.Millisecond):
		}
		m.write(conn, "\r\n"+cell+"\r\n")
	}
	m.finishScan(conn)
}

// finishScan 对应手册里"打断完成后输出 OK，按照扫描完成处理"。
func (m *fakeModem) finishScan(conn net.Conn) {
	m.mu.Lock()
	m.scanning = false
	m.scanStop = nil
	m.scanEndedAt = time.Now()
	m.mu.Unlock()
	m.write(conn, "\r\nOK\r\n")
}

func (m *fakeModem) reply(cmd string) string {
	switch {
	case cmd == "AT+CREG?":
		return m.registrationReply("+CREG")
	case cmd == "AT+CEREG?":
		return m.registrationReply("+CEREG")
	case cmd == "AT+C5GREG?":
		return m.registrationReply("+C5GREG")
	case cmd == "AT+CNMI?":
		return "\r\n+CNMI: 2,1,0,2,0\r\n\r\nOK\r\n"
	case cmd == "AT+CMGF?":
		return "\r\n+CMGF: 0\r\n\r\nOK\r\n"
	case cmd == "AT+CSQ":
		return "\r\n+CSQ: 20,99\r\n\r\nOK\r\n"
	case cmd == "AT^HCSQ?":
		return "\r\n^HCSQ: \"LTE\",55,30,20\r\n\r\nOK\r\n"
	case strings.HasPrefix(cmd, "AT+CMGR="):
		return "\r\n+CMGR: 0,,24\r\n" + ucs2PDU + "\r\n\r\nOK\r\n"
	case cmd == "AT+BADCMD":
		return "\r\n+CME ERROR: 100\r\n"
	default:
		return "\r\nOK\r\n"
	}
}

func (m *fakeModem) write(conn net.Conn, s string) {
	_, _ = conn.Write([]byte(s))
}

// pushURC 模拟模组主动上报。
func (m *fakeModem) pushURC(t *testing.T, line string) {
	t.Helper()
	deadline := time.Now().Add(3 * time.Second)
	for {
		m.mu.Lock()
		conn := m.conn
		m.mu.Unlock()
		if conn != nil {
			m.write(conn, "\r\n"+line+"\r\n")
			return
		}
		if time.Now().After(deadline) {
			t.Fatal("模组连接未建立，无法推送上报")
		}
		time.Sleep(20 * time.Millisecond)
	}
}

func (m *fakeModem) commands() []string {
	m.mu.Lock()
	defer m.mu.Unlock()
	return append([]string(nil), m.received...)
}

// testRig 把被测服务完整拉起来：假模组 + ATClient + Dispatcher + WebSocket 服务。
type testRig struct {
	modem  *fakeModem
	ws     *WSServer
	client *ATClient
	addr   string
}

func newTestRig(t *testing.T, authKey string, notify NotificationConfig) *testRig {
	t.Helper()

	modem := newFakeModem(t)
	log := NewLogger(LevelError)

	cfg := ATConfig{
		Type:    "NETWORK",
		Network: NetworkConfig{Host: "127.0.0.1", Port: modem.port(), Timeout: 2 * time.Second},
	}

	client := NewATClient(cfg, log)
	ws := NewWSServer(client, authKey, log)
	notifier := NewNotifier(notify, log)
	dispatcher := NewDispatcher(client, notifier, ws, log)

	ctx, cancel := context.WithCancel(context.Background())
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("监听 WebSocket 失败: %v", err)
	}

	var wg sync.WaitGroup
	for _, fn := range []func(context.Context){client.Run, notifier.Run, dispatcher.Run} {
		wg.Add(1)
		go func(f func(context.Context)) { defer wg.Done(); f(ctx) }(fn)
	}
	wg.Add(1)
	go func() { defer wg.Done(); _ = ws.ServeListener(ctx, ln) }()

	t.Cleanup(func() {
		cancel()
		_ = ln.Close()
		wg.Wait()
	})

	// 等初始化命令跑完，避免测试命令和它抢 cmdMu 造成时序抖动。
	waitFor(t, 5*time.Second, func() bool {
		return client.Connected() && len(modem.commands()) >= 3
	}, "AT 初始化未完成")

	return &testRig{modem: modem, ws: ws, client: client, addr: ln.Addr().String()}
}

func waitFor(t *testing.T, timeout time.Duration, cond func() bool, msg string) {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if cond() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal(msg)
}

func (r *testRig) dial(t *testing.T) *websocket.Conn {
	t.Helper()
	conn, _, err := websocket.DefaultDialer.Dial("ws://"+r.addr, nil)
	if err != nil {
		t.Fatalf("WebSocket 连接失败: %v", err)
	}
	t.Cleanup(func() { _ = conn.Close() })
	return conn
}

// readText 读一条文本消息，跳过服务端 30 秒心跳的 "ping"。
// 超时给得宽一些：-race 下整体慢很多，5 秒会偶发误判成失败。
func readText(t *testing.T, conn *websocket.Conn) string {
	t.Helper()
	_ = conn.SetReadDeadline(time.Now().Add(15 * time.Second))
	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			t.Fatalf("读取 WebSocket 消息失败: %v", err)
		}
		if string(payload) == "ping" {
			continue
		}
		return string(payload)
	}
}

func readPush(t *testing.T, conn *websocket.Conn, wantType string) map[string]any {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		var push struct {
			Type string         `json:"type"`
			Data map[string]any `json:"data"`
		}
		raw := readText(t, conn)
		if err := json.Unmarshal([]byte(raw), &push); err != nil {
			continue
		}
		if push.Type == wantType {
			return push.Data
		}
	}
	t.Fatalf("未收到类型为 %s 的推送", wantType)
	return nil
}

func sendCmd(t *testing.T, conn *websocket.Conn, cmd string) atCommandResponse {
	t.Helper()
	if err := conn.WriteMessage(websocket.TextMessage, []byte(cmd)); err != nil {
		t.Fatalf("发送命令失败: %v", err)
	}
	var resp atCommandResponse
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		raw := readText(t, conn)
		if err := json.Unmarshal([]byte(raw), &resp); err != nil {
			continue
		}
		// 推送消息没有 success 字段，会被解析成零值，靠 data/error 判定。
		if resp.Data != nil || resp.Error != nil {
			return resp
		}
	}
	t.Fatalf("命令 %s 未收到应答", cmd)
	return resp
}

func TestCommandRoundTrip(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	resp := sendCmd(t, conn, "AT+CSQ")
	if !resp.Success {
		t.Fatalf("命令应当成功, 得到 %+v", resp)
	}
	if resp.Data == nil || !strings.Contains(*resp.Data, "+CSQ: 20,99") {
		t.Fatalf("应答内容不对: %+v", resp.Data)
	}
	// 模组回显的 "AT+CSQ" 必须被过滤掉，否则前端解析会多出一行。
	if strings.Contains(*resp.Data, "AT+CSQ") {
		t.Errorf("应答里不该包含命令回显: %q", *resp.Data)
	}
	if !strings.Contains(*resp.Data, "OK") {
		t.Errorf("应答里应当包含 OK: %q", *resp.Data)
	}
}

func TestCommandErrorIsReportedAsFailure(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	resp := sendCmd(t, conn, "AT+BADCMD")
	if resp.Success {
		t.Errorf("+CME ERROR 应当被判为失败: %+v", resp)
	}
	if resp.Error == nil || !strings.Contains(*resp.Error, "+CME ERROR: 100") {
		t.Errorf("错误信息不对: %+v", resp.Error)
	}
}

func TestConnectQueryIsHandledLocally(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	resp := sendCmd(t, conn, "AT+CONNECT?")
	if !resp.Success || resp.Data == nil || *resp.Data != "+CONNECT: 0\r\nOK" {
		t.Fatalf("AT+CONNECT? 应答不对: %+v", resp.Data)
	}
}

func TestPingPong(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	if err := conn.WriteMessage(websocket.TextMessage, []byte("ping")); err != nil {
		t.Fatalf("发送心跳失败: %v", err)
	}
	_ = conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	_, payload, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("读取心跳应答失败: %v", err)
	}
	if string(payload) != "pong" {
		t.Errorf("心跳应答 = %q, 期望 pong", payload)
	}
}

// 新短信上报要触发一次 AT+CMGR 读取，并把解码结果推给前端。
func TestNewSMSFlow(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{
		Types: NotifyTypes{SMS: true, Call: true, MemoryFull: true, Signal: true},
	})
	conn := rig.dial(t)

	rig.modem.pushURC(t, `+CMTI: "ME",5`)

	data := readPush(t, conn, "new_sms")
	if data["sender"] != "13800138000" {
		t.Errorf("发送方 = %v, 期望 13800138000", data["sender"])
	}
	if data["content"] != "测试" {
		t.Errorf("正文 = %v, 期望 测试", data["content"])
	}

	waitFor(t, 3*time.Second, func() bool {
		for _, c := range rig.modem.commands() {
			if c == "AT+CMGR=5" {
				return true
			}
		}
		return false
	}, "未向模组发出 AT+CMGR=5")
}

func TestIncomingCallPush(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{
		Types: NotifyTypes{Call: true},
	})
	conn := rig.dial(t)

	rig.modem.pushURC(t, "RING")
	rig.modem.pushURC(t, `+CLIP: "13912345678",129,,,,0`)

	data := readPush(t, conn, "incoming_call")
	if data["number"] != "13912345678" {
		t.Errorf("来电号码 = %v, 期望 13912345678", data["number"])
	}
	if data["state"] != "ringing" {
		t.Errorf("状态 = %v, 期望 ringing", data["state"])
	}
}

func TestPDCPPush(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	rig.modem.pushURC(t, "^PDCPDATAINFO: 1,5,100,12,3,45,20,10,7,2,1000,50000,0,0")

	data := readPush(t, conn, "pdcp_data")
	if got := data["dlPdcpRate"]; got != float64(50000) {
		t.Errorf("dlPdcpRate = %v, 期望 50000", got)
	}
	// 时延字段以 0.1 为单位，需要除以 10。
	if got := data["avgDelay"]; got != 1.2 {
		t.Errorf("avgDelay = %v, 期望 1.2", got)
	}
}

// 这是旧实现真正的病根：查询 ^HCSQ? 的应答不能被当成主动上报截走，
// 否则前端的信号显示永远拿不到数据。
func TestSignalQueryResponseNotSwallowed(t *testing.T) {
	rig := newTestRig(t, "", NotificationConfig{})
	conn := rig.dial(t)

	resp := sendCmd(t, conn, "AT^HCSQ?")
	if !resp.Success || resp.Data == nil {
		t.Fatalf("AT^HCSQ? 应当成功: %+v", resp)
	}
	if !strings.Contains(*resp.Data, `^HCSQ: "LTE",55,30,20`) {
		t.Errorf("查询应答被主动上报处理器吞掉了: %q", *resp.Data)
	}
}

func TestAuthSuccessMessageMatchesFrontend(t *testing.T) {
	rig := newTestRig(t, "s3cret", NotificationConfig{})
	conn := rig.dial(t)

	if err := conn.WriteMessage(websocket.TextMessage, []byte(`{"auth_key":"s3cret"}`)); err != nil {
		t.Fatalf("发送认证失败: %v", err)
	}

	var res authResult
	if err := json.Unmarshal([]byte(readText(t, conn)), &res); err != nil {
		t.Fatalf("解析认证应答失败: %v", err)
	}
	// 前端逐字比对 message == "认证成功"，改动这个字符串会导致连不上。
	if !res.Success || res.Message != "认证成功" {
		t.Fatalf("认证应答 = %+v, 期望 success=true message=认证成功", res)
	}

	if resp := sendCmd(t, conn, "AT+CSQ"); !resp.Success {
		t.Errorf("认证后命令应当可用: %+v", resp)
	}
}

func TestAuthRejectsWrongKey(t *testing.T) {
	rig := newTestRig(t, "s3cret", NotificationConfig{})
	conn := rig.dial(t)

	if err := conn.WriteMessage(websocket.TextMessage, []byte(`{"auth_key":"wrong"}`)); err != nil {
		t.Fatalf("发送认证失败: %v", err)
	}

	var res authResult
	if err := json.Unmarshal([]byte(readText(t, conn)), &res); err != nil {
		t.Fatalf("解析认证应答失败: %v", err)
	}
	if res.Success || res.Message != "密钥验证失败" {
		t.Fatalf("错误密钥应被拒绝, 得到 %+v", res)
	}
}

func TestUnauthenticatedClientGetsNoBroadcast(t *testing.T) {
	rig := newTestRig(t, "s3cret", NotificationConfig{})
	conn := rig.dial(t)

	// 不认证，直接等推送；只应当收到认证失败/超时，不该收到 raw_data。
	rig.modem.pushURC(t, "^PDCPDATAINFO: 1,5,100,12,3,45,20,10,7,2,1000,50000,0,0")

	_ = conn.SetReadDeadline(time.Now().Add(500 * time.Millisecond))
	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			return // 超时或被关闭，符合预期
		}
		if strings.Contains(string(payload), "pdcp_data") {
			t.Fatal("未认证的客户端收到了推送")
		}
	}
}

func TestSyscfgexNormalization(t *testing.T) {
	cases := []struct{ in, want string }{
		{`AT^SYSCFGEX="0302",3fffffff,2,4,"800C5",,`, `AT^SYSCFGEX="0302",3fffffff,2,4,"800C5",,`},
		{"AT^SYSCFGEX=\"03\",3fffffff,1,2,\"40\",\"\",\"\"\r\n", `AT^SYSCFGEX="03",3fffffff,1,2,"40","",""`},
		{"AT+CSQ", "AT+CSQ"},
	}
	for _, c := range cases {
		if got := normalizeSyscfgex(c.in); got != c.want {
			t.Errorf("normalizeSyscfgex(%q) = %q, 期望 %q", c.in, got, c.want)
		}
	}
}

func TestNightWindowCrossesMidnight(t *testing.T) {
	s := NewScheduler(ScheduleConfig{
		NightStart: "22:00", NightEnd: "06:00",
		NightEnabled: true, DayEnabled: true,
	}, nil, nil, NewLogger(LevelError))

	cases := []struct {
		hour, min int
		night     bool
	}{
		{23, 0, true}, {2, 30, true}, {5, 59, true},
		{6, 0, false}, {12, 0, false}, {21, 59, false}, {22, 0, true},
	}
	for _, c := range cases {
		at := time.Date(2025, 8, 25, c.hour, c.min, 0, 0, time.Local)
		if got := s.isNight(s.Config(), at); got != c.night {
			t.Errorf("%02d:%02d isNight = %v, 期望 %v", c.hour, c.min, got, c.night)
		}
	}
}

func TestScheduleBandLockCommands(t *testing.T) {
	log := NewLogger(LevelError)
	s := NewScheduler(ScheduleConfig{UnlockLTE: true, UnlockNR: true}, nil, nil, log)

	// 频段锁定
	cmd, _, ok := s.lteCommand(BandLock{Type: 3, Bands: "3,8"})
	if !ok || cmd != `AT^LTEFREQLOCK=3,0,2,"3,8"` {
		t.Errorf("LTE 频段锁定命令 = %q", cmd)
	}

	// 频点锁定，SCS 未配置时自动推断
	cmd, _, ok = s.nrCommand(BandLock{Type: 1, Bands: "78", ARFCNs: "630000"})
	if !ok || cmd != `AT^NRFREQLOCK=1,0,1,"78","630000","1"` {
		t.Errorf("NR 频点锁定命令 = %q", cmd)
	}

	// 频段与频点明显不匹配时应当退回解锁，而不是把模组锁死
	cmd, _, ok = s.lteCommand(BandLock{Type: 1, Bands: "3", ARFCNs: "999999"})
	if !ok || cmd != "AT^LTEFREQLOCK=0" {
		t.Errorf("不匹配的参数应退回解锁, 得到 %q", cmd)
	}

	// Type=0 时按开关决定是否下发解锁
	cmd, _, ok = s.lteCommand(BandLock{Type: 0})
	if !ok || cmd != "AT^LTEFREQLOCK=0" {
		t.Errorf("解锁命令 = %q", cmd)
	}
}
