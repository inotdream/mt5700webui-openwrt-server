package main

import (
	"bufio"
	"context"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

// BandLock 描述一组锁频参数。Type: 0=解锁 1=频点 2=小区 3=频段
type BandLock struct {
	Type     int
	Bands    string
	ARFCNs   string
	SCSTypes string
	PCIs     string
}

type NetworkConfig struct {
	Host    string
	Port    int
	Timeout time.Duration
}

type SerialConfig struct {
	Port     string
	Baudrate int
	Timeout  time.Duration
}

type ATConfig struct {
	// Type 为 "NETWORK" 或 "SERIAL"
	Type    string
	Network NetworkConfig
	Serial  SerialConfig
}

type NotifyTypes struct {
	SMS        bool
	Call       bool
	MemoryFull bool
	Signal     bool
}

type NotificationConfig struct {
	WeChatWebhook string
	LogFile       string
	Types         NotifyTypes
}

type WebSocketConfig struct {
	Port     int
	AuthKey  string
	AllowWAN bool
	// ScanTimeout 是一次 ^CELLSCAN 全网扫频允许跑多久，全 Band 扫描很慢。
	ScanTimeout time.Duration
}

type ScheduleConfig struct {
	Enabled        bool
	CheckInterval  time.Duration
	NoServiceLimit time.Duration
	UnlockLTE      bool
	UnlockNR       bool
	ToggleAirplane bool

	NightEnabled bool
	NightStart   string
	NightEnd     string
	NightLTE     BandLock
	NightNR      BandLock

	DayEnabled bool
	DayLTE     BandLock
	DayNR      BandLock
}

type Config struct {
	Enabled      bool
	AT           ATConfig
	Notification NotificationConfig
	WebSocket    WebSocketConfig
	Schedule     ScheduleConfig
}

func defaultConfig() Config {
	return Config{
		Enabled: true,
		AT: ATConfig{
			Type:    "NETWORK",
			Network: NetworkConfig{Host: "192.168.8.1", Port: 20249, Timeout: 10 * time.Second},
			// AT 命令走 PCUI 口，在 MT5700M-CN 上默认枚举为 ttyUSB1；
			// ttyUSB0 是 Application Interface，对 AT 的支持不完整。
			Serial: SerialConfig{Port: preferredATPort, Baudrate: 115200, Timeout: 10 * time.Second},
		},
		Notification: NotificationConfig{
			Types: NotifyTypes{SMS: true, Call: true, MemoryFull: true, Signal: true},
		},
		WebSocket: WebSocketConfig{Port: 8765, ScanTimeout: defaultScanTimeout},
		Schedule: ScheduleConfig{
			CheckInterval:  60 * time.Second,
			NoServiceLimit: 180 * time.Second,
			UnlockLTE:      true,
			UnlockNR:       true,
			ToggleAirplane: true,
			NightEnabled:   true,
			NightStart:     "22:00",
			NightEnd:       "06:00",
			NightLTE:       BandLock{Type: 3},
			NightNR:        BandLock{Type: 3},
			DayEnabled:     true,
			DayLTE:         BandLock{Type: 3},
			DayNR:          BandLock{Type: 3},
		},
	}
}

// uciValues 用一次 `uci show` 调用取回整个配置段，避免旧版本里几十次 uci get 子进程。
func uciValues(ctx context.Context) (map[string]string, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	out, err := exec.CommandContext(ctx, "uci", "show", "at-webserver").Output()
	if err != nil {
		return nil, err
	}

	const prefix = "at-webserver.config."
	values := make(map[string]string)
	scanner := bufio.NewScanner(strings.NewReader(string(out)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		key, raw, ok := strings.Cut(line, "=")
		if !ok || !strings.HasPrefix(key, prefix) {
			continue
		}
		values[strings.TrimPrefix(key, prefix)] = unquoteUCI(raw)
	}
	return values, scanner.Err()
}

// unquoteUCI 还原 uci show 的单引号包裹，包括 '\” 这种内嵌引号的转义写法。
func unquoteUCI(raw string) string {
	raw = strings.TrimSpace(raw)
	if len(raw) >= 2 && raw[0] == '\'' && raw[len(raw)-1] == '\'' {
		raw = raw[1 : len(raw)-1]
		raw = strings.ReplaceAll(raw, `'\''`, `'`)
	}
	return raw
}

type uciReader map[string]string

func (u uciReader) str(key, def string) string {
	if v, ok := u[key]; ok && v != "" {
		return v
	}
	return def
}

func (u uciReader) int(key string, def int) int {
	if v, ok := u[key]; ok {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil {
			return n
		}
	}
	return def
}

func (u uciReader) bool(key string, def bool) bool {
	v, ok := u[key]
	if !ok {
		return def
	}
	switch strings.TrimSpace(v) {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	}
	return def
}

// seconds 读取一个以秒为单位的整数配置，并夹到合理下限以免出现忙循环。
func (u uciReader) seconds(key string, def time.Duration, min time.Duration) time.Duration {
	d := time.Duration(u.int(key, int(def/time.Second))) * time.Second
	if d < min {
		return min
	}
	return d
}

// LoadConfig 从 UCI 读取配置；读取失败时返回默认配置，让服务仍能起来。
func LoadConfig(ctx context.Context) (Config, error) {
	cfg := defaultConfig()

	values, err := uciValues(ctx)
	if err != nil {
		return cfg, err
	}
	u := uciReader(values)

	cfg.Enabled = u.bool("enabled", true)

	cfg.AT.Type = strings.ToUpper(u.str("connection_type", "NETWORK"))
	if cfg.AT.Type != "SERIAL" {
		cfg.AT.Type = "NETWORK"
	}

	cfg.AT.Network.Host = u.str("network_host", cfg.AT.Network.Host)
	cfg.AT.Network.Port = u.int("network_port", cfg.AT.Network.Port)
	cfg.AT.Network.Timeout = u.seconds("network_timeout", cfg.AT.Network.Timeout, time.Second)

	serialPort := u.str("serial_port", cfg.AT.Serial.Port)
	if serialPort == "custom" {
		serialPort = u.str("serial_port_custom", preferredATPort)
	}
	// "auto" 是哨兵值，交给 detectATPort 逐个探测，不当成设备路径。
	cfg.AT.Serial.Port = serialPort
	cfg.AT.Serial.Baudrate = u.int("serial_baudrate", cfg.AT.Serial.Baudrate)
	cfg.AT.Serial.Timeout = u.seconds("serial_timeout", cfg.AT.Serial.Timeout, time.Second)

	cfg.WebSocket.Port = u.int("websocket_port", cfg.WebSocket.Port)
	cfg.WebSocket.AuthKey = u.str("websocket_auth_key", "")
	cfg.WebSocket.AllowWAN = u.bool("websocket_allow_wan", false)
	// 第三个参数是下限而不是缺省值：写成 defaultScanTimeout 的话，用户配的任何
	// 小于 3 分钟的值都会被悄悄抬回 3 分钟，这个选项就等于不起作用。
	cfg.WebSocket.ScanTimeout = u.seconds("cellscan_timeout", cfg.WebSocket.ScanTimeout, 10*time.Second)

	cfg.Notification.WeChatWebhook = u.str("wechat_webhook", "")
	cfg.Notification.LogFile = u.str("log_file", "")
	cfg.Notification.Types = NotifyTypes{
		SMS:        u.bool("notify_sms", true),
		Call:       u.bool("notify_call", true),
		MemoryFull: u.bool("notify_memory_full", true),
		Signal:     u.bool("notify_signal", true),
	}

	s := &cfg.Schedule
	s.Enabled = u.bool("schedule_enabled", false)
	s.CheckInterval = u.seconds("schedule_check_interval", s.CheckInterval, 10*time.Second)
	s.NoServiceLimit = u.seconds("schedule_timeout", s.NoServiceLimit, 30*time.Second)
	s.UnlockLTE = u.bool("schedule_unlock_lte", true)
	s.UnlockNR = u.bool("schedule_unlock_nr", true)
	s.ToggleAirplane = u.bool("schedule_toggle_airplane", true)

	s.NightEnabled = u.bool("schedule_night_enabled", true)
	s.NightStart = u.str("schedule_night_start", s.NightStart)
	s.NightEnd = u.str("schedule_night_end", s.NightEnd)
	s.NightLTE = u.bandLock("schedule_night_lte")
	s.NightNR = u.bandLock("schedule_night_nr")

	s.DayEnabled = u.bool("schedule_day_enabled", true)
	s.DayLTE = u.bandLock("schedule_day_lte")
	s.DayNR = u.bandLock("schedule_day_nr")

	return cfg, nil
}

func (u uciReader) bandLock(prefix string) BandLock {
	return BandLock{
		Type:     u.int(prefix+"_type", 3),
		Bands:    u.str(prefix+"_bands", ""),
		ARFCNs:   u.str(prefix+"_arfcns", ""),
		SCSTypes: u.str(prefix+"_scs_types", ""),
		PCIs:     u.str(prefix+"_pcis", ""),
	}
}
