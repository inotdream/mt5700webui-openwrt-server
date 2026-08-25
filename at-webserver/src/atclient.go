package main

import (
	"bytes"
	"context"
	"errors"
	"strings"
	"sync"
	"time"
)

const (
	// commandGap 是两条 AT 命令之间的最小间隔，模组来不及处理会丢命令。
	commandGap = 100 * time.Millisecond
	// commandTimeout 与旧实现一致：2 秒没等到结束码就返回已收到的部分。
	commandTimeout = 2 * time.Second

	readBufSize      = 4096
	maxResponseLines = 2048
	maxResidualBytes = 64 * 1024
)

var (
	errNotConnected = errors.New("AT 通道未连接")
	errNoResponse   = errors.New("模组无响应")
)

// ATResponse 是一条命令的应答，按行保存（已剔除空行与命令回显）。
type ATResponse struct {
	Lines []string
}

// Text 还原成前端期望的 \r\n 分隔文本。
func (r ATResponse) Text() string { return strings.Join(r.Lines, "\r\n") }

func (r ATResponse) OK() bool { return r.has("OK") }

func (r ATResponse) HasError() bool {
	return strings.Contains(strings.ToUpper(r.Text()), "ERROR")
}

func (r ATResponse) has(token string) bool {
	for _, l := range r.Lines {
		if l == token {
			return true
		}
	}
	return false
}

// Contains 判断应答里是否出现某个片段。
func (r ATResponse) Contains(sub string) bool { return strings.Contains(r.Text(), sub) }

// unsolicited 是一条模组主动上报。broadcast 为真表示需要作为 raw_data 推给前端。
type unsolicited struct {
	line      string
	broadcast bool
}

type pendingCmd struct {
	echo  string
	lines []string
	done  chan struct{}
	once  sync.Once
}

func (p *pendingCmd) finish() { p.once.Do(func() { close(p.done) }) }

// ATClient 维护到模组的唯一连接。
//
// 与旧 Python 实现最重要的区别：这里只有一个 goroutine 读取通道，命令应答和
// 主动上报在同一处解复用。旧实现里 monitor_socket 和 send_command 各自 recv
// 同一个 socket，会互相吃掉对方的数据，这是 AT 命令偶发超时/返回空的根因。
type ATClient struct {
	cfg ATConfig
	log *Logger

	urc chan unsolicited

	connMu sync.RWMutex
	tp     Transport

	cmdMu     sync.Mutex
	lastCmdAt time.Time

	pendMu  sync.Mutex
	pending *pendingCmd
}

func NewATClient(cfg ATConfig, log *Logger) *ATClient {
	return &ATClient{
		cfg: cfg,
		log: log,
		urc: make(chan unsolicited, 256),
	}
}

// Unsolicited 返回主动上报通道。
func (c *ATClient) Unsolicited() <-chan unsolicited { return c.urc }

func (c *ATClient) ConnectionType() string { return c.cfg.Type }

func (c *ATClient) Connected() bool {
	c.connMu.RLock()
	defer c.connMu.RUnlock()
	return c.tp != nil
}

// Run 负责连接、重连与读循环，直到 ctx 结束。
func (c *ATClient) Run(ctx context.Context) {
	backoff := 5 * time.Second
	const maxBackoff = 60 * time.Second

	for ctx.Err() == nil {
		tp, err := openTransport(c.cfg, c.log)
		if err != nil {
			c.log.Warnf("连接模组失败，%s 后重试: %v", backoff, err)
			if !sleepCtx(ctx, backoff) {
				return
			}
			if backoff < maxBackoff {
				backoff += 5 * time.Second
			}
			continue
		}

		c.log.Infof("已连接到 %s", tp.Describe())
		backoff = 5 * time.Second

		c.connMu.Lock()
		c.tp = tp
		c.connMu.Unlock()

		readDone := make(chan error, 1)
		go func() { readDone <- c.readLoop(tp) }()

		// 初始化命令要在读循环起来之后发，否则等不到应答。
		initCtx, cancelInit := context.WithCancel(ctx)
		go c.initModem(initCtx)

		select {
		case err := <-readDone:
			if err != nil && ctx.Err() == nil {
				c.log.Warnf("模组连接中断: %v", err)
			}
		case <-ctx.Done():
			_ = tp.Close()
			<-readDone
		}

		cancelInit()
		c.teardown(tp)

		if ctx.Err() == nil && !sleepCtx(ctx, 2*time.Second) {
			return
		}
	}
}

// teardown 清理连接并让等待中的命令立刻失败，而不是干等超时。
func (c *ATClient) teardown(tp Transport) {
	c.connMu.Lock()
	if c.tp == tp {
		c.tp = nil
	}
	c.connMu.Unlock()
	_ = tp.Close()

	c.pendMu.Lock()
	p := c.pending
	c.pendMu.Unlock()
	if p != nil {
		p.finish()
	}
}

func (c *ATClient) initModem(ctx context.Context) {
	// 短信走 PDU 模式并开启新短信主动上报，来电开启号码显示。
	if resp, err := c.SendCommand(ctx, "AT+CNMI?"); err != nil || !resp.Contains("+CNMI: 2,1,0,2,0") {
		if _, err := c.SendCommand(ctx, "AT+CNMI=2,1,0,2,0"); err != nil {
			c.log.Warnf("设置短信上报模式失败: %v", err)
		}
	}
	if resp, err := c.SendCommand(ctx, "AT+CMGF?"); err != nil || !resp.Contains("+CMGF: 0") {
		if _, err := c.SendCommand(ctx, "AT+CMGF=0"); err != nil {
			c.log.Warnf("设置短信 PDU 模式失败: %v", err)
		}
	}
	if _, err := c.SendCommand(ctx, "AT+CLIP=1"); err != nil {
		c.log.Warnf("开启来电号码显示失败: %v", err)
	}
}

// SendCommand 串行地发送一条 AT 命令并等待结束码。
func (c *ATClient) SendCommand(ctx context.Context, command string) (ATResponse, error) {
	c.cmdMu.Lock()
	defer c.cmdMu.Unlock()

	if gap := commandGap - time.Since(c.lastCmdAt); gap > 0 {
		if !sleepCtx(ctx, gap) {
			return ATResponse{}, ctx.Err()
		}
	}

	c.connMu.RLock()
	tp := c.tp
	c.connMu.RUnlock()
	if tp == nil {
		return ATResponse{}, errNotConnected
	}

	if !strings.HasSuffix(command, "\r") {
		command += "\r"
	}

	p := &pendingCmd{echo: strings.TrimSpace(command), done: make(chan struct{})}
	c.pendMu.Lock()
	c.pending = p
	c.pendMu.Unlock()
	defer func() {
		c.pendMu.Lock()
		if c.pending == p {
			c.pending = nil
		}
		c.pendMu.Unlock()
	}()

	if _, err := tp.Write([]byte(command)); err != nil {
		c.log.Warnf("写入 AT 命令失败: %v", err)
		_ = tp.Close() // 让读循环退出并触发重连
		return ATResponse{}, err
	}
	c.lastCmdAt = time.Now()

	timer := time.NewTimer(commandTimeout)
	defer timer.Stop()

	select {
	case <-p.done:
	case <-timer.C:
	case <-ctx.Done():
		return ATResponse{}, ctx.Err()
	}

	c.pendMu.Lock()
	lines := p.lines
	c.pendMu.Unlock()

	if len(lines) == 0 {
		return ATResponse{}, errNoResponse
	}
	return ATResponse{Lines: lines}, nil
}

// readLoop 是唯一读取模组的地方。Read 阻塞在 netpoller 上，空闲时不占 CPU。
func (c *ATClient) readLoop(tp Transport) error {
	buf := make([]byte, readBufSize)
	var residual []byte

	for {
		n, err := tp.Read(buf)
		if n > 0 {
			residual = c.consume(append(residual, buf[:n]...))
		}
		if err != nil {
			return err
		}
	}
}

// consume 从缓冲里切出完整行并派发，返回尚未成行的剩余字节。
func (c *ATClient) consume(data []byte) []byte {
	for {
		i := bytes.IndexByte(data, '\n')
		if i < 0 {
			break
		}
		c.handleLine(strings.TrimSpace(string(data[:i])))
		data = data[i+1:]
	}

	// AT+CMGS 的输入提示符 "> " 后面没有换行，需要单独识别成一次应答结束，
	// 否则要白等满 2 秒超时。
	if rest := strings.TrimSpace(string(data)); rest == ">" {
		c.pendMu.Lock()
		p := c.pending
		if p != nil {
			p.lines = append(p.lines, ">")
		}
		c.pendMu.Unlock()
		if p != nil {
			p.finish()
			return nil
		}
	}

	if len(data) > maxResidualBytes {
		c.log.Warnf("丢弃 %d 字节无法成行的数据", len(data))
		return nil
	}
	// 复制一份，避免一直复用底层大数组。
	return append([]byte(nil), data...)
}

func (c *ATClient) handleLine(line string) {
	if line == "" {
		return
	}

	c.pendMu.Lock()
	p := c.pending
	if p != nil {
		if line != p.echo && len(p.lines) < maxResponseLines {
			p.lines = append(p.lines, line)
		}
	}
	c.pendMu.Unlock()

	if p == nil {
		// 空闲期收到的任何数据都视为主动上报：交给处理器，并按原样推给前端。
		c.emit(unsolicited{line: line, broadcast: true})
		return
	}

	// 有命令在等待时，只把「绝不可能是查询结果」的行也交给处理器。
	// 比如 ^HCSQ: 既是主动上报也是 AT^HCSQ? 的应答，不能在这里截走，
	// 否则前端的信号显示会拿不到数据。
	if isExclusiveURC(line) {
		c.emit(unsolicited{line: line, broadcast: false})
	}

	if isTerminator(line) {
		p.finish()
	}
}

func (c *ATClient) emit(u unsolicited) {
	select {
	case c.urc <- u:
	default:
		c.log.Warnf("主动上报队列已满，丢弃: %s", u.line)
	}
}

// isTerminator 判断是否为 AT 命令的结束码。
func isTerminator(line string) bool {
	switch line {
	case "OK", "ERROR", "ABORTED":
		return true
	}
	return strings.HasPrefix(line, "+CMS ERROR:") || strings.HasPrefix(line, "+CME ERROR:")
}

// isExclusiveURC 只匹配不可能出现在查询应答里的主动上报。
func isExclusiveURC(line string) bool {
	switch line {
	case "RING", "IRING", "^IRING", "NO CARRIER":
		return true
	}
	switch {
	case strings.HasPrefix(line, "+CMTI:"),
		strings.HasPrefix(line, "^CEND:"),
		strings.HasPrefix(line, "^SMMEMFULL"),
		strings.Contains(line, "MEMORY FULL"),
		strings.Contains(line, "CMS ERROR: 322"):
		return true
	// 带引号的 +CLIP: 是来电上报；AT+CLIP? 的应答形如 "+CLIP: 1,1"，不会命中。
	case strings.HasPrefix(line, "+CLIP:") && strings.Contains(line, `"`):
		return true
	}
	return false
}

// sleepCtx 等待一段时间，ctx 结束时提前返回 false。
func sleepCtx(ctx context.Context, d time.Duration) bool {
	if d <= 0 {
		return ctx.Err() == nil
	}
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-t.C:
		return true
	case <-ctx.Done():
		return false
	}
}
