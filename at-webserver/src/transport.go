package main

import (
	"errors"
	"net"
	"strconv"
	"time"
)

// Transport 是一条到模组的字节通道。Read 必须是真正阻塞的：
// 空闲时不消耗 CPU，由 runtime 的 netpoller 负责唤醒。
type Transport interface {
	Read(p []byte) (int, error)
	Write(p []byte) (int, error)
	Close() error
	// SetReadDeadline 用于探测 AT 口时限时读取。
	SetReadDeadline(t time.Time) error
	Describe() string
}

var (
	errSerialUnsupported = errors.New("当前平台不支持串口")
	errNoSerialPort      = errors.New("没有找到任何 /dev/ttyUSB* 设备")
	errNoATPort          = errors.New("候选串口都没有正常应答 AT")
)

type tcpTransport struct {
	conn         net.Conn
	addr         string
	writeTimeout time.Duration
}

func dialTCP(host string, port int, timeout time.Duration) (Transport, error) {
	addr := net.JoinHostPort(host, strconv.Itoa(port))
	conn, err := net.DialTimeout("tcp", addr, timeout)
	if err != nil {
		return nil, err
	}
	if tc, ok := conn.(*net.TCPConn); ok {
		// 模组侧的 AT 端口偶发静默断链，靠 keepalive 尽快发现。
		_ = tc.SetKeepAlive(true)
		_ = tc.SetKeepAlivePeriod(30 * time.Second)
		_ = tc.SetNoDelay(true)
	}
	return &tcpTransport{conn: conn, addr: addr, writeTimeout: timeout}, nil
}

func (t *tcpTransport) Read(p []byte) (int, error) { return t.conn.Read(p) }

func (t *tcpTransport) Write(p []byte) (int, error) {
	if err := t.conn.SetWriteDeadline(time.Now().Add(t.writeTimeout)); err != nil {
		return 0, err
	}
	defer func() { _ = t.conn.SetWriteDeadline(time.Time{}) }()
	return t.conn.Write(p)
}

func (t *tcpTransport) SetReadDeadline(deadline time.Time) error {
	return t.conn.SetReadDeadline(deadline)
}

func (t *tcpTransport) Close() error     { return t.conn.Close() }
func (t *tcpTransport) Describe() string { return "网络 " + t.addr }

// openTransport 按配置建立一条到模组的连接。
func openTransport(cfg ATConfig, log *Logger) (Transport, error) {
	if cfg.Type != "SERIAL" {
		return dialTCP(cfg.Network.Host, cfg.Network.Port, cfg.Network.Timeout)
	}
	if cfg.Serial.Port == autoSerialPort {
		return detectATPort(cfg.Serial, log)
	}
	return openSerial(cfg.Serial)
}

// setReadDeadline 给探测用；不支持 deadline 的传输一律视为不可探测，
// 否则 Read 可能永久阻塞。
func setReadDeadline(tp Transport, deadline time.Time) bool {
	return tp.SetReadDeadline(deadline) == nil
}
