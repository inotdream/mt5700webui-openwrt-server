package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// NotifyKind 对应 UCI 里的四个推送开关。
type NotifyKind string

const (
	KindSMS        NotifyKind = "SMS"
	KindCall       NotifyKind = "CALL"
	KindMemoryFull NotifyKind = "MEMORY_FULL"
	KindSignal     NotifyKind = "SIGNAL"
)

// 与旧实现一致的两个特殊发送方名字，决定了消息的排版样式。
const (
	senderCall   = "来电提醒"
	senderSignal = "信号监控"
)

type Notification struct {
	Sender     string
	Content    string
	Kind       NotifyKind
	MemoryFull bool
}

const (
	notifyInterval   = 60 * time.Second
	notifyQueueSize  = 256
	notifyMaxPending = 1000
	notifyMaxRetries = 3
)

// Notifier 负责把事件送到企业微信和本地日志文件。
//
// 企业微信侧沿用旧实现的节流策略：60 秒内的事件合并成一条发出。
// 与旧实现不同的是这里只在有待发消息时才装定时器，空闲期完全没有唤醒。
type Notifier struct {
	cfg     NotificationConfig
	log     *Logger
	queue   chan Notification
	client  *http.Client
	logFile string
}

func NewNotifier(cfg NotificationConfig, log *Logger) *Notifier {
	n := &Notifier{
		cfg:   cfg,
		log:   log,
		queue: make(chan Notification, notifyQueueSize),
		client: &http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:    2,
				IdleConnTimeout: 90 * time.Second,
			},
		},
	}

	if cfg.LogFile != "" {
		if path, err := prepareLogFile(cfg.LogFile); err != nil {
			log.Errorf("日志通知不可用: %v", err)
		} else {
			n.logFile = path
			log.Infof("日志通知已启用: %s", path)
		}
	}
	if cfg.WeChatWebhook != "" {
		log.Infof("企业微信推送已启用")
	}
	return n
}

func prepareLogFile(path string) (string, error) {
	abs, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}
	if dir := filepath.Dir(abs); dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return "", fmt.Errorf("创建日志目录 %s 失败: %w", dir, err)
		}
	}
	f, err := os.OpenFile(abs, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return "", fmt.Errorf("日志文件不可写 %s: %w", abs, err)
	}
	defer f.Close()
	return abs, nil
}

func (n *Notifier) enabled(kind NotifyKind) bool {
	switch kind {
	case KindSMS:
		return n.cfg.Types.SMS
	case KindCall:
		return n.cfg.Types.Call
	case KindMemoryFull:
		return n.cfg.Types.MemoryFull
	case KindSignal:
		return n.cfg.Types.Signal
	}
	return true
}

// Notify 记录一条事件。日志立即落盘，企业微信进入合并队列。
//
// 允许 n 为 nil：调用方多在后台 goroutine 里（定时锁频、上报分发），
// 这里一旦 panic 整个服务进程都会退出，不值得为一条通知冒这个险。
func (n *Notifier) Notify(msg Notification) {
	if n == nil || !n.enabled(msg.Kind) {
		return
	}

	if n.logFile != "" {
		if err := n.appendLog(msg); err != nil {
			n.log.Errorf("写入通知日志失败: %v", err)
		}
	}

	if n.cfg.WeChatWebhook == "" {
		return
	}
	select {
	case n.queue <- msg:
	default:
		n.log.Warnf("通知队列已满，丢弃一条: %s", msg.Sender)
	}
}

func (n *Notifier) appendLog(msg Notification) error {
	ts := time.Now().Format("2006-01-02 15:04:05")

	var b strings.Builder
	if msg.MemoryFull {
		fmt.Fprintf(&b, "[%s] 存储空间已满警告\n", ts)
	} else {
		fmt.Fprintf(&b, "[%s] 发送者: %s\n内容: %s\n", ts, msg.Sender, msg.Content)
	}
	b.WriteString(strings.Repeat("-", 50))
	b.WriteString("\n")

	f, err := os.OpenFile(n.logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.WriteString(b.String())
	return err
}

// Run 驱动企业微信的合并发送，直到 ctx 结束。
func (n *Notifier) Run(ctx context.Context) {
	if n.cfg.WeChatWebhook == "" {
		<-ctx.Done()
		return
	}

	var (
		pending  []Notification
		lastSend time.Time
		timer    *time.Timer
		timerC   <-chan time.Time
	)
	defer func() {
		if timer != nil {
			timer.Stop()
		}
	}()

	for {
		select {
		case <-ctx.Done():
			if len(pending) > 0 {
				// 退出前把攒下的消息发出去，别静默丢掉。
				sendCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
				n.send(sendCtx, combineMessages(pending))
				cancel()
			}
			return

		case msg := <-n.queue:
			if len(pending) >= notifyMaxPending {
				n.log.Warnf("待发通知超过 %d 条，丢弃最旧的一条", notifyMaxPending)
				pending = pending[1:]
			}
			pending = append(pending, msg)

			if timerC == nil {
				wait := notifyInterval - time.Since(lastSend)
				if wait < 0 {
					wait = 0
				}
				timer = time.NewTimer(wait)
				timerC = timer.C
			}

		case <-timerC:
			timerC = nil
			if len(pending) == 0 {
				continue
			}
			body := combineMessages(pending)
			pending = nil
			lastSend = time.Now()
			go n.send(ctx, body)
		}
	}
}

func (n *Notifier) send(ctx context.Context, content string) {
	payload, err := json.Marshal(map[string]any{
		"msgtype": "text",
		"text":    map[string]string{"content": content},
	})
	if err != nil {
		n.log.Errorf("序列化通知失败: %v", err)
		return
	}

	for attempt := 1; attempt <= notifyMaxRetries; attempt++ {
		err = n.postWebhook(ctx, payload)
		if err == nil {
			n.log.Infof("企业微信通知发送成功")
			return
		}
		if ctx.Err() != nil {
			return
		}
		n.log.Warnf("企业微信发送失败 (%d/%d): %v", attempt, notifyMaxRetries, err)
		if attempt < notifyMaxRetries && !sleepCtx(ctx, time.Duration(attempt)*time.Second) {
			return
		}
	}
	n.log.Errorf("企业微信通知已达最大重试次数，放弃发送")
}

func (n *Notifier) postWebhook(ctx context.Context, payload []byte) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, n.cfg.WeChatWebhook, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	var result struct {
		ErrCode int    `json:"errcode"`
		ErrMsg  string `json:"errmsg"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}
	if result.ErrCode != 0 {
		return fmt.Errorf("企业微信返回 errcode=%d errmsg=%s", result.ErrCode, result.ErrMsg)
	}
	return nil
}

// combineMessages 复刻旧实现的排版，单条与多条走不同格式。
func combineMessages(msgs []Notification) string {
	if len(msgs) == 0 {
		return ""
	}
	if len(msgs) == 1 {
		m := msgs[0]
		switch {
		case m.MemoryFull:
			return "⚠️ 警告：短信存储空间已满\n请及时处理，否则可能无法接收新短信"
		case m.Sender == senderCall:
			return "📞 来电提醒\n" + m.Content
		case m.Sender == senderSignal:
			return m.Content
		default:
			return fmt.Sprintf("📱 新短信通知\n发送者: %s\n内容: %s", m.Sender, m.Content)
		}
	}

	var b strings.Builder
	b.WriteString("📑 批量通知汇总\n")
	b.WriteString(strings.Repeat("=", 20))
	b.WriteString("\n")
	for i, m := range msgs {
		switch {
		case m.MemoryFull:
			fmt.Fprintf(&b, "\n%d. ⚠️ 存储空间已满警告", i+1)
		case m.Sender == senderCall:
			fmt.Fprintf(&b, "\n%d. 📞 %s", i+1, m.Content)
		case m.Sender == senderSignal:
			fmt.Fprintf(&b, "\n%d. 📶 %s", i+1, m.Content)
		default:
			fmt.Fprintf(&b, "\n%d. 📱 来自 %s 的短信:\n%s", i+1, m.Sender, m.Content)
		}
		b.WriteString("\n")
		b.WriteString(strings.Repeat("-", 20))
	}
	return b.String()
}
