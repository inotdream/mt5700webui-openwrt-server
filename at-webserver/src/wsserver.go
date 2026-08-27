package main

import (
	"context"
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	wsHeartbeat    = 30 * time.Second
	wsAuthTimeout  = 10 * time.Second
	wsReadLimit    = 64 * 1024
	wsWriteTimeout = 10 * time.Second
	wsOutBuffer    = 128
)

// atCommandResponse 是发给前端的命令应答。字段名与旧实现严格一致，
// 前端按 {success, data, error} 解析，且按 FIFO 顺序匹配自己的待答命令。
type atCommandResponse struct {
	Success bool    `json:"success"`
	Data    *string `json:"data"`
	Error   *string `json:"error"`
}

type authResult struct {
	Success bool   `json:"success,omitempty"`
	Error   string `json:"error,omitempty"`
	Message string `json:"message"`
}

// WSServer 提供 WebSocket 接口：转发 AT 命令，并推送模组的主动上报。
type WSServer struct {
	client  *ATClient
	log     *Logger
	authKey string
	sched   *Scheduler

	scan        cellScanState
	scanTimeout time.Duration

	mu      sync.RWMutex
	clients map[*wsClient]struct{}
}

func NewWSServer(client *ATClient, authKey string, log *Logger) *WSServer {
	return &WSServer{
		client:  client,
		log:     log,
		authKey: authKey,
		clients: make(map[*wsClient]struct{}),
	}
}

// AttachScheduler 让 WebUI 能通过 WebSocket 读写定时锁频配置。
func (s *WSServer) AttachScheduler(sched *Scheduler) {
	s.sched = sched
}

// SetScanTimeout 设置一次 ^CELLSCAN 允许跑多久。
func (s *WSServer) SetScanTimeout(d time.Duration) {
	if d > 0 {
		s.scanTimeout = d
	}
}

type wsClient struct {
	conn      *websocket.Conn
	out       chan []byte
	closeOnce sync.Once
	closed    chan struct{}
}

func (c *wsClient) close() {
	c.closeOnce.Do(func() {
		close(c.closed)
		_ = c.conn.Close()
	})
}

// trySend 用于推送类消息：客户端来不及收就丢弃，不能拖慢整个上报链路。
func (c *wsClient) trySend(msg []byte) bool {
	select {
	case c.out <- msg:
		return true
	case <-c.closed:
		return false
	default:
		return false
	}
}

// sendBlocking 用于命令应答：丢了会让前端的 FIFO 匹配错位，所以宁可等。
func (c *wsClient) sendBlocking(msg []byte, timeout time.Duration) bool {
	t := time.NewTimer(timeout)
	defer t.Stop()
	select {
	case c.out <- msg:
		return true
	case <-c.closed:
		return false
	case <-t.C:
		return false
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	// 页面来自 http://路由器，WebSocket 连的是 路由器:8765，属于跨源，必须放行。
	CheckOrigin: func(*http.Request) bool { return true },
}

// Listen 绑定监听端口。":port" 会拿到一个双栈套接字，IPv4 和 IPv6 都能连，
// 不需要像旧实现那样在同一端口上起两个 server。
func (s *WSServer) Listen(ctx context.Context, port int) (net.Listener, error) {
	lc := net.ListenConfig{}
	return lc.Listen(ctx, "tcp", ":"+strconv.Itoa(port))
}

// ServeListener 在已有监听器上提供服务。
func (s *WSServer) ServeListener(ctx context.Context, ln net.Listener) error {
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleUpgrade)

	srv := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdownCtx)
		s.closeAll()
	}()

	if err := srv.Serve(ln); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func (s *WSServer) closeAll() {
	s.mu.Lock()
	for c := range s.clients {
		c.close()
	}
	s.clients = make(map[*wsClient]struct{})
	s.mu.Unlock()
}

func (s *WSServer) handleUpgrade(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		s.log.Warnf("WebSocket 升级失败: %v", err)
		return
	}
	conn.SetReadLimit(wsReadLimit)

	// 认证握手是严格的一问一答，此时还没有并发写者，直接同步读写。
	// 这样拒绝消息一定能在关闭连接之前送达，前端才能显示具体原因。
	if !s.authenticate(conn) {
		closeGracefully(conn)
		return
	}

	c := &wsClient{
		conn:   conn,
		out:    make(chan []byte, wsOutBuffer),
		closed: make(chan struct{}),
	}
	defer c.close()

	go s.writeLoop(c)

	s.mu.Lock()
	s.clients[c] = struct{}{}
	s.mu.Unlock()
	defer func() {
		s.mu.Lock()
		delete(s.clients, c)
		s.mu.Unlock()
	}()

	s.log.Debugf("WebSocket 客户端已连接: %s", r.RemoteAddr)
	s.readLoop(c)
	s.log.Debugf("WebSocket 客户端已断开: %s", r.RemoteAddr)
}

// authenticate 复刻旧实现的认证握手。前端逐字比对 message 字段，不能改这些字符串。
func (s *WSServer) authenticate(conn *websocket.Conn) bool {
	if s.authKey == "" {
		return true
	}

	if err := conn.SetReadDeadline(time.Now().Add(wsAuthTimeout)); err != nil {
		return false
	}
	_, payload, err := conn.ReadMessage()
	if err != nil {
		s.log.Warnf("WebSocket 连接被拒绝: 认证超时或读取失败")
		writeJSONSync(conn, authResult{Error: "Authentication timeout", Message: "认证超时"})
		return false
	}
	_ = conn.SetReadDeadline(time.Time{})

	var body struct {
		AuthKey string `json:"auth_key"`
	}
	if err := json.Unmarshal(payload, &body); err != nil {
		s.log.Warnf("WebSocket 连接被拒绝: 无效的认证数据")
		writeJSONSync(conn, authResult{Error: "Invalid authentication", Message: "无效的认证数据"})
		return false
	}
	if body.AuthKey != s.authKey {
		s.log.Warnf("WebSocket 连接被拒绝: 密钥错误")
		writeJSONSync(conn, authResult{Error: "Authentication failed", Message: "密钥验证失败"})
		return false
	}

	writeJSONSync(conn, authResult{Success: true, Message: "认证成功"})
	s.log.Debugf("WebSocket 客户端认证成功")
	return true
}

func writeJSONSync(conn *websocket.Conn, v any) {
	msg, err := json.Marshal(v)
	if err != nil {
		return
	}
	_ = conn.SetWriteDeadline(time.Now().Add(wsWriteTimeout))
	_ = conn.WriteMessage(websocket.TextMessage, msg)
	_ = conn.SetWriteDeadline(time.Time{})
}

// closeGracefully 发一个关闭帧再断开，让前端拿到正常关闭而不是 1006 异常。
func closeGracefully(conn *websocket.Conn) {
	_ = conn.SetWriteDeadline(time.Now().Add(time.Second))
	_ = conn.WriteMessage(websocket.CloseMessage,
		websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	_ = conn.Close()
}

func (s *WSServer) sendJSON(c *wsClient, v any) {
	msg, err := json.Marshal(v)
	if err != nil {
		s.log.Errorf("序列化 WebSocket 消息失败: %v", err)
		return
	}
	c.sendBlocking(msg, wsWriteTimeout)
}

// writeLoop 是这条连接唯一的写入者，同时负责 30 秒一次的心跳。
func (s *WSServer) writeLoop(c *wsClient) {
	ticker := time.NewTicker(wsHeartbeat)
	defer ticker.Stop()
	defer c.close()

	for {
		select {
		case <-c.closed:
			return
		case msg := <-c.out:
			if err := c.writeText(msg); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.writeText([]byte("ping")); err != nil {
				return
			}
		}
	}
}

func (c *wsClient) writeText(msg []byte) error {
	if err := c.conn.SetWriteDeadline(time.Now().Add(wsWriteTimeout)); err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, msg)
}

// readLoop 顺序处理客户端消息。串行是刻意的：前端没有请求 ID，
// 靠应答顺序匹配命令，并发处理会串号。
func (s *WSServer) readLoop(c *wsClient) {
	for {
		msgType, payload, err := c.conn.ReadMessage()
		if err != nil {
			return
		}
		if msgType != websocket.TextMessage {
			continue
		}

		command := string(payload)
		if command == "ping" {
			if !c.sendBlocking([]byte("pong"), wsWriteTimeout) {
				return
			}
			continue
		}

		s.sendJSON(c, s.runCommand(command))
	}
}

// runCommand 把前端发来的字符串当作 AT 命令执行并整理成应答。
func (s *WSServer) runCommand(command string) atCommandResponse {
	s.log.Debugf("收到 AT 命令: %s", strings.TrimSpace(command))

	// AT+CONNECT? 不是真的 AT 命令，用来让前端知道当前走网络还是串口。
	if strings.TrimSpace(command) == "AT+CONNECT?" {
		kind := "0"
		if s.client.ConnectionType() == "SERIAL" {
			kind = "1"
		}
		return okResponse("+CONNECT: " + kind + "\r\nOK")
	}

	// AT+SCHED? / AT+SCHED= 同样不是真命令，用来读写定时锁频配置。
	if resp := s.handleScheduleCommand(command); resp != nil {
		return *resp
	}

	// 扫频要跑几分钟，单独走异步通路，否则会把这条读循环和命令锁一起占死。
	if resp := s.handleCellScanCommand(command); resp != nil {
		return *resp
	}

	if s.scanInProgress() {
		return *errResponse("正在扫频，模组暂时无法响应其它命令，请先取消扫频")
	}

	command = normalizeSyscfgex(command)

	ctx, cancel := context.WithTimeout(context.Background(), commandTimeout+3*time.Second)
	defer cancel()

	resp, err := s.client.SendCommand(ctx, command)
	if err != nil {
		msg := err.Error()
		s.log.Debugf("AT 命令失败: %s -> %v", strings.TrimSpace(command), err)
		return atCommandResponse{Success: false, Error: &msg}
	}

	text := resp.Text()
	if resp.HasError() {
		return atCommandResponse{Success: false, Error: &text}
	}
	return atCommandResponse{Success: true, Data: &text}
}

func okResponse(data string) atCommandResponse {
	return atCommandResponse{Success: true, Data: &data}
}

// normalizeSyscfgex 修补前端发来的 AT^SYSCFGEX：把频段参数重新加上引号，
// 并补齐末尾两个空参数。逻辑与旧实现保持一致。
func normalizeSyscfgex(command string) string {
	if !strings.HasPrefix(command, "AT^SYSCFGEX") {
		return command
	}

	cleaned := strings.NewReplacer("\r", "", "\n", "", "OK", "").Replace(command)
	if strings.Contains(cleaned, `,"",""`) {
		if parts := strings.Split(cleaned, ","); len(parts) >= 5 {
			bands := strings.Trim(parts[4], `"`)
			cleaned = strings.Join(parts[:4], ",") + `,"` + bands + `","",""`
		}
	}
	return cleaned
}

// Broadcast 把一条消息推给所有已认证的客户端。
func (s *WSServer) Broadcast(msg any) {
	payload, err := json.Marshal(msg)
	if err != nil {
		s.log.Errorf("序列化推送消息失败: %v", err)
		return
	}

	s.mu.RLock()
	targets := make([]*wsClient, 0, len(s.clients))
	for c := range s.clients {
		targets = append(targets, c)
	}
	s.mu.RUnlock()

	for _, c := range targets {
		if !c.trySend(payload) {
			s.log.Debugf("客户端发送队列已满，丢弃一条推送")
		}
	}
}
