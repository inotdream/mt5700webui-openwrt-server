package main

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Broadcaster 把消息推给所有 WebSocket 客户端。
type Broadcaster interface {
	Broadcast(msg any)
}

type wsPush struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

var (
	clipRe = regexp.MustCompile(`\+CLIP: *"([^"]+)"`)
	cmtiRe = regexp.MustCompile(`^\+CMTI: "(ME|SM)",(\d+)`)
)

const (
	// callDedupWindow 内同一号码的重复来电不再通知。
	callDedupWindow = 30 * time.Second
	// signalChangeThreshold 是触发信号通知的最小 RSRP 变化量(dBm)。
	signalChangeThreshold = 1.0
	partialSMSTTL         = time.Hour
	maxPartialSMS         = 100
)

type partialSMS struct {
	sender   string
	total    int
	parts    map[int]string
	received time.Time
}

// Dispatcher 处理模组的主动上报：来电、新短信、存储满、信号变化、PDCP 统计。
type Dispatcher struct {
	client   *ATClient
	notifier *Notifier
	ws       Broadcaster
	log      *Logger

	// 来电状态
	lastCallNumber string
	lastCallAt     time.Time
	callState      string

	// 信号状态
	lastRSRP    float64
	haveRSRP    bool
	lastSysMode string

	memoryFullNotified bool

	partials map[string]*partialSMS
}

func NewDispatcher(client *ATClient, notifier *Notifier, ws Broadcaster, log *Logger) *Dispatcher {
	return &Dispatcher{
		client:    client,
		notifier:  notifier,
		ws:        ws,
		log:       log,
		callState: "idle",
		partials:  make(map[string]*partialSMS),
	}
}

// Run 单 goroutine 串行处理上报，直到 ctx 结束。
func (d *Dispatcher) Run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case u := <-d.client.Unsolicited():
			if u.broadcast {
				d.ws.Broadcast(wsPush{Type: "raw_data", Data: u.line})
			}
			d.safeHandle(ctx, u.line)
		}
	}
}

// safeHandle 保证某一条上报解析失败时只丢这一条，不会拖垮整个上报分发。
func (d *Dispatcher) safeHandle(ctx context.Context, line string) {
	defer guard(d.log, "主动上报处理")
	d.handle(ctx, line)
}

// handle 按固定优先级找到第一个能处理该行的处理器，与旧实现的顺序一致。
func (d *Dispatcher) handle(ctx context.Context, line string) {
	switch {
	case isCallLine(line):
		d.handleCall(line)
	case isMemoryFullLine(line):
		d.handleMemoryFull()
	case cmtiRe.MatchString(line):
		d.handleNewSMS(ctx, line)
	case strings.Contains(line, "^CERSSI:") || strings.Contains(line, "^HCSQ:"):
		d.handleSignal(ctx, line)
	case strings.HasPrefix(line, "^PDCPDATAINFO:"):
		d.handlePDCP(line)
	}
}

func isCallLine(line string) bool {
	switch line {
	case "RING", "IRING", "^IRING", "NO CARRIER":
		return true
	}
	return strings.HasPrefix(line, "+CLIP:") || strings.Contains(line, "^CEND:")
}

func isMemoryFullLine(line string) bool {
	return strings.Contains(line, "CMS ERROR: 322") ||
		strings.Contains(line, "MEMORY FULL") ||
		strings.Contains(line, "^SMMEMFULL")
}

// ============= 来电 =============

func (d *Dispatcher) handleCall(line string) {
	switch {
	case line == "RING" || line == "IRING" || line == "^IRING":
		d.callState = "ringing"

	case strings.HasPrefix(line, "+CLIP:"):
		m := clipRe.FindStringSubmatch(line)
		if m == nil {
			return
		}
		number := m[1]
		now := time.Now()

		sameCall := number == d.lastCallNumber &&
			now.Sub(d.lastCallAt) <= callDedupWindow &&
			d.callState != "idle"
		if sameCall {
			return
		}

		d.lastCallNumber = number
		d.lastCallAt = now
		d.callState = "ringing"

		ts := now.Format("2006-01-02 15:04:05")
		d.notifier.Notify(Notification{
			Sender:  senderCall,
			Content: fmt.Sprintf("时间：%s\n号码：%s\n状态：来电振铃", ts, number),
			Kind:    KindCall,
		})
		d.ws.Broadcast(wsPush{Type: "incoming_call", Data: map[string]any{
			"time":   ts,
			"number": number,
			"state":  "ringing",
		}})

	case strings.Contains(line, "^CEND:") || line == "NO CARRIER":
		if d.lastCallNumber != "" {
			ts := time.Now().Format("2006-01-02 15:04:05")
			d.notifier.Notify(Notification{
				Sender:  senderCall,
				Content: fmt.Sprintf("时间：%s\n号码：%s\n状态：通话结束", ts, d.lastCallNumber),
				Kind:    KindCall,
			})
			d.ws.Broadcast(wsPush{Type: "incoming_call", Data: map[string]any{
				"time":   ts,
				"number": d.lastCallNumber,
				"state":  "ended",
			}})
		}
		d.lastCallNumber = ""
		d.lastCallAt = time.Time{}
		d.callState = "idle"
	}
}

// ============= 存储空间满 =============

func (d *Dispatcher) handleMemoryFull() {
	if d.memoryFullNotified {
		return
	}
	d.memoryFullNotified = true
	d.notifier.Notify(Notification{Kind: KindMemoryFull, MemoryFull: true})
}

// ============= 新短信 =============

func (d *Dispatcher) handleNewSMS(ctx context.Context, line string) {
	m := cmtiRe.FindStringSubmatch(line)
	if m == nil {
		return
	}
	storage, index := m[1], m[2]
	d.log.Infof("收到新短信，存储区: %s，索引: %s", storage, index)

	resp, err := d.client.SendCommand(ctx, "AT+CMGR="+index)
	if err != nil {
		d.log.Warnf("读取短信 %s 失败: %v", index, err)
		return
	}

	for _, sms := range parseSMSResponse(resp, d.log) {
		if sms.Partial != nil {
			d.assemblePartial(sms)
			continue
		}
		d.notifier.Notify(Notification{Sender: sms.Sender, Content: sms.Content, Kind: KindSMS})
		d.ws.Broadcast(wsPush{Type: "new_sms", Data: map[string]any{
			"sender":  sms.Sender,
			"content": sms.Content,
			"time":    sms.Date.Format("2006-01-02 15:04:05"),
		}})
	}
}

// parseSMSResponse 从 +CMGR/+CMGL 的应答里取出 PDU 并解码。
func parseSMSResponse(resp ATResponse, log *Logger) []SMS {
	var out []SMS
	for i := 0; i < len(resp.Lines); i++ {
		if !strings.HasPrefix(resp.Lines[i], "+CMG") || i+1 >= len(resp.Lines) {
			continue
		}
		pdu := strings.TrimSpace(resp.Lines[i+1])
		i++
		if pdu == "" || !isHex(pdu) {
			continue
		}
		sms, err := DecodeIncomingPDU(pdu)
		if err != nil {
			log.Warnf("PDU 解析失败: %v", err)
			continue
		}
		out = append(out, sms)
	}
	return out
}

func isHex(s string) bool {
	for _, c := range s {
		switch {
		case c >= '0' && c <= '9', c >= 'A' && c <= 'F', c >= 'a' && c <= 'f':
		default:
			return false
		}
	}
	return len(s) > 0
}

// assemblePartial 拼装长短信，收齐全部分段后再推送。
func (d *Dispatcher) assemblePartial(sms SMS) {
	now := time.Now()
	for k, v := range d.partials {
		if now.Sub(v.received) > partialSMSTTL {
			d.log.Warnf("清理过期的分段短信: %s", k)
			delete(d.partials, k)
		}
	}
	if len(d.partials) >= maxPartialSMS {
		var oldestKey string
		var oldest time.Time
		for k, v := range d.partials {
			if oldestKey == "" || v.received.Before(oldest) {
				oldestKey, oldest = k, v.received
			}
		}
		d.log.Warnf("分段短信缓存超限，删除最旧的: %s", oldestKey)
		delete(d.partials, oldestKey)
	}

	key := fmt.Sprintf("%s_%d", sms.Sender, sms.Partial.Reference)
	entry, ok := d.partials[key]
	if !ok {
		entry = &partialSMS{
			sender:   sms.Sender,
			total:    sms.Partial.PartsCount,
			parts:    make(map[int]string),
			received: now,
		}
		d.partials[key] = entry
	}
	entry.parts[sms.Partial.PartNumber] = sms.Content

	if entry.total <= 0 || len(entry.parts) < entry.total {
		return
	}

	var sb strings.Builder
	for i := 1; i <= entry.total; i++ {
		sb.WriteString(entry.parts[i])
	}
	delete(d.partials, key)
	full := sb.String()

	d.notifier.Notify(Notification{Sender: sms.Sender, Content: full, Kind: KindSMS})
	d.ws.Broadcast(wsPush{Type: "new_sms", Data: map[string]any{
		"sender":     sms.Sender,
		"content":    full,
		"time":       sms.Date.Format("2006-01-02 15:04:05"),
		"isComplete": true,
	}})
}

// ============= 信号 =============

func (d *Dispatcher) handleSignal(ctx context.Context, line string) {
	line = strings.SplitN(line, "\n", 2)[0]

	var rsrp float64
	var sysMode string
	var ok bool

	switch {
	case strings.Contains(line, "^CERSSI:"):
		parts := splitFields(line, "^CERSSI:")
		// 第 19/20/21 个字段是 RSRP/RSRQ/SINR，字段不足就跳过。
		if len(parts) >= 20 {
			if v, err := strconv.ParseFloat(parts[18], 64); err == nil {
				rsrp, sysMode, ok = v, "4G/5G", true
			}
		}

	case strings.Contains(line, "^HCSQ:"):
		parts := splitFields(line, "^HCSQ:")
		if len(parts) >= 4 {
			raw, err := strconv.ParseFloat(parts[1], 64)
			if err == nil {
				rsrp = -140 + raw
				sysMode = strings.Trim(parts[0], `"`)
				ok = true
			}
		}
	}

	if !ok {
		return
	}

	changed := !d.haveRSRP ||
		abs(rsrp-d.lastRSRP) >= signalChangeThreshold ||
		sysMode != d.lastSysMode
	if !changed {
		return
	}

	modeSwitched := sysMode != d.lastSysMode
	d.lastRSRP, d.haveRSRP, d.lastSysMode = rsrp, true, sysMode
	d.notifySignal(ctx, rsrp, modeSwitched)
}

func splitFields(line, prefix string) []string {
	body := line
	if i := strings.Index(line, prefix); i >= 0 {
		body = line[i+len(prefix):]
	}
	parts := strings.Split(strings.TrimSpace(body), ",")
	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}
	return parts
}

func abs(f float64) float64 {
	if f < 0 {
		return -f
	}
	return f
}

func signalLevel(rsrp float64) string {
	switch {
	case rsrp >= -85:
		return "优秀"
	case rsrp >= -95:
		return "良好"
	case rsrp >= -105:
		return "一般"
	default:
		return "较差"
	}
}

// monscInfo 是 AT^MONSC 返回的服务小区信息。
type monscInfo struct {
	RAT    string
	ARFCN  string
	CellID string
	PCI    string
	TAC    string
	RSRP   string
	RSRQ   string
	SINR   string
	RSSI   string
}

func (d *Dispatcher) queryMONSC(ctx context.Context) monscInfo {
	info := monscInfo{RAT: "未知"}

	resp, err := d.client.SendCommand(ctx, "AT^MONSC")
	if err != nil {
		return info
	}
	for _, line := range resp.Lines {
		if !strings.HasPrefix(line, "^MONSC:") {
			continue
		}
		parts := splitFields(line, "^MONSC:")
		if len(parts) < 2 {
			return info
		}
		info.RAT = strings.Trim(parts[0], `"`)

		switch info.RAT {
		case "NR":
			if len(parts) >= 11 {
				info.ARFCN, info.CellID = parts[3], parts[5]
				info.PCI, info.TAC = hexToDec(parts[6]), parts[7]
				info.RSRP, info.RSRQ, info.SINR = parts[8], parts[9], parts[10]
			}
		case "LTE":
			if len(parts) >= 10 {
				info.ARFCN, info.CellID = parts[3], parts[4]
				info.PCI, info.TAC = hexToDec(parts[5]), parts[6]
				info.RSRP, info.RSRQ, info.RSSI = parts[7], parts[8], parts[9]
			}
		}
		return info
	}
	return info
}

// hexToDec 把 MONSC 里以十六进制表示的 PCI 转成十进制。
func hexToDec(s string) string {
	if v, err := strconv.ParseInt(strings.TrimSpace(s), 16, 64); err == nil {
		return strconv.FormatInt(v, 10)
	}
	return s
}

func (d *Dispatcher) notifySignal(ctx context.Context, rsrp float64, modeSwitched bool) {
	info := d.queryMONSC(ctx)

	var b strings.Builder
	if modeSwitched {
		b.WriteString("⚡ 网络切换提醒\n")
	}
	fmt.Fprintf(&b, "📶 信号变动通知\n时间: %s\n制式: %s\n信号: %s\n",
		time.Now().Format("2006-01-02 15:04:05"), info.RAT, signalLevel(rsrp))

	switch info.RAT {
	case "NR":
		fmt.Fprintf(&b, "RSRP: %s dBm\nRSRQ: %s dB\nSINR: %s dB\n",
			orUnknown(info.RSRP), orUnknown(info.RSRQ), orUnknown(info.SINR))
	case "LTE":
		fmt.Fprintf(&b, "RSRP: %s dBm\nRSRQ: %s dB\nRSSI: %s dBm\n",
			orUnknown(info.RSRP), orUnknown(info.RSRQ), orUnknown(info.RSSI))
	default:
		d.notifier.Notify(Notification{Sender: senderSignal, Content: b.String(), Kind: KindSignal})
		return
	}

	fmt.Fprintf(&b, "\n📡 小区信息:\n频点: %s\nPCI: %s\nTAC: %s\n小区ID: %s",
		orUnknown(info.ARFCN), orUnknown(info.PCI), orUnknown(info.TAC), orUnknown(info.CellID))

	d.notifier.Notify(Notification{Sender: senderSignal, Content: b.String(), Kind: KindSignal})
}

func orUnknown(s string) string {
	if strings.TrimSpace(s) == "" {
		return "未知"
	}
	return s
}

// ============= PDCP 统计 =============

// pdcpFields 与前端期望的字段名一一对应，顺序即 ^PDCPDATAINFO 的字段顺序。
var pdcpFields = []struct {
	name  string
	tenth bool // 该字段以 0.1 为单位，需要除以 10
}{
	{"id", false},
	{"pduSessionId", false},
	{"discardTimerLen", false},
	{"avgDelay", true},
	{"minDelay", true},
	{"maxDelay", true},
	{"highPriQueMaxBuffTime", true},
	{"lowPriQueMaxBuffTime", true},
	{"highPriQueBuffPktNums", false},
	{"lowPriQueBuffPktNums", false},
	{"ulPdcpRate", false},
	{"dlPdcpRate", false},
	{"ulDiscardCnt", false},
	{"dlDiscardCnt", false},
}

func (d *Dispatcher) handlePDCP(line string) {
	parts := splitFields(line, "^PDCPDATAINFO:")
	if len(parts) < len(pdcpFields) {
		return
	}

	data := make(map[string]any, len(pdcpFields))
	for i, f := range pdcpFields {
		v, err := strconv.ParseFloat(parts[i], 64)
		if err != nil {
			return
		}
		if f.tenth {
			data[f.name] = v / 10
		} else {
			data[f.name] = int64(v)
		}
	}
	d.ws.Broadcast(wsPush{Type: "pdcp_data", Data: data})
}
