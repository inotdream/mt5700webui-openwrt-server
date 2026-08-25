package main

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// withFakeUCI 在 PATH 前面放一个假的 uci，让 LoadConfig 读到指定内容。
func withFakeUCI(t *testing.T, showOutput string) {
	t.Helper()

	dir := t.TempDir()
	script := "#!/bin/sh\n" +
		"if [ \"$1\" = \"show\" ]; then\ncat <<'UCIEOF'\n" + showOutput + "\nUCIEOF\nfi\nexit 0\n"

	path := filepath.Join(dir, "uci")
	if err := os.WriteFile(path, []byte(script), 0o755); err != nil {
		t.Fatalf("写入假 uci 失败: %v", err)
	}
	t.Setenv("PATH", dir+string(os.PathListSeparator)+os.Getenv("PATH"))
}

func loadWithUCI(t *testing.T, showOutput string) Config {
	t.Helper()
	withFakeUCI(t, showOutput)
	cfg, err := LoadConfig(context.Background())
	if err != nil {
		t.Fatalf("加载配置失败: %v", err)
	}
	return cfg
}

// 串口默认值必须是 PCUI 口 ttyUSB1，不是 ttyUSB0。
func TestSerialDefaultIsPCUI(t *testing.T) {
	cfg := loadWithUCI(t, "at-webserver.config=at-webserver\n"+
		"at-webserver.config.connection_type='SERIAL'")

	if cfg.AT.Serial.Port != "/dev/ttyUSB1" {
		t.Errorf("默认串口 = %q, 期望 /dev/ttyUSB1", cfg.AT.Serial.Port)
	}
}

func TestSerialAutoSentinelIsPreserved(t *testing.T) {
	cfg := loadWithUCI(t, "at-webserver.config.connection_type='SERIAL'\n"+
		"at-webserver.config.serial_port='auto'")

	if cfg.AT.Serial.Port != autoSerialPort {
		t.Errorf("串口 = %q, 期望保留哨兵值 auto", cfg.AT.Serial.Port)
	}
}

func TestSerialCustomPathIsResolved(t *testing.T) {
	cfg := loadWithUCI(t, "at-webserver.config.connection_type='SERIAL'\n"+
		"at-webserver.config.serial_port='custom'\n"+
		"at-webserver.config.serial_port_custom='/dev/ttyS3'")

	if cfg.AT.Serial.Port != "/dev/ttyS3" {
		t.Errorf("串口 = %q, 期望 /dev/ttyS3", cfg.AT.Serial.Port)
	}
}

func TestNetworkConfigParsing(t *testing.T) {
	cfg := loadWithUCI(t, "at-webserver.config.connection_type='NETWORK'\n"+
		"at-webserver.config.network_host='192.168.8.1'\n"+
		"at-webserver.config.network_port='20249'\n"+
		"at-webserver.config.websocket_port='9000'\n"+
		"at-webserver.config.websocket_auth_key='abc123'\n"+
		"at-webserver.config.notify_sms='0'")

	if cfg.AT.Type != "NETWORK" || cfg.AT.Network.Host != "192.168.8.1" || cfg.AT.Network.Port != 20249 {
		t.Errorf("网络配置解析错误: %+v", cfg.AT)
	}
	if cfg.WebSocket.Port != 9000 || cfg.WebSocket.AuthKey != "abc123" {
		t.Errorf("WebSocket 配置解析错误: %+v", cfg.WebSocket)
	}
	if cfg.Notification.Types.SMS {
		t.Error("notify_sms='0' 应当关闭短信推送")
	}
	if !cfg.Notification.Types.Call {
		t.Error("未配置的推送开关应当默认开启")
	}
}

// 检测间隔被填成 1 秒会让锁频循环变成忙轮询，必须夹到下限。
func TestScheduleIntervalsAreClamped(t *testing.T) {
	cfg := loadWithUCI(t, "at-webserver.config.schedule_enabled='1'\n"+
		"at-webserver.config.schedule_check_interval='1'\n"+
		"at-webserver.config.schedule_timeout='2'")

	if !cfg.Schedule.Enabled {
		t.Fatal("schedule_enabled='1' 应当启用")
	}
	if cfg.Schedule.CheckInterval < 10*time.Second {
		t.Errorf("检测间隔 = %v, 应当被夹到至少 10s", cfg.Schedule.CheckInterval)
	}
	if cfg.Schedule.NoServiceLimit < 30*time.Second {
		t.Errorf("无服务超时 = %v, 应当被夹到至少 30s", cfg.Schedule.NoServiceLimit)
	}
}

func TestScheduleBandLockParsing(t *testing.T) {
	cfg := loadWithUCI(t, "at-webserver.config.schedule_enabled='1'\n"+
		"at-webserver.config.schedule_night_lte_type='1'\n"+
		"at-webserver.config.schedule_night_lte_bands='3,8'\n"+
		"at-webserver.config.schedule_night_lte_arfcns='1850,3450'\n"+
		"at-webserver.config.schedule_day_nr_type='3'\n"+
		"at-webserver.config.schedule_day_nr_bands='78'")

	if cfg.Schedule.NightLTE.Type != 1 || cfg.Schedule.NightLTE.Bands != "3,8" ||
		cfg.Schedule.NightLTE.ARFCNs != "1850,3450" {
		t.Errorf("夜间 LTE 配置解析错误: %+v", cfg.Schedule.NightLTE)
	}
	if cfg.Schedule.DayNR.Type != 3 || cfg.Schedule.DayNR.Bands != "78" {
		t.Errorf("日间 NR 配置解析错误: %+v", cfg.Schedule.DayNR)
	}
}

// uci show 会用单引号包裹并把内嵌单引号转义成 '\”。
func TestUnquoteUCI(t *testing.T) {
	cases := []struct{ in, want string }{
		{`'hello'`, "hello"},
		{`''`, ""},
		{`'a'\''b'`, "a'b"},
		{`bare`, "bare"},
		{`'https://qyapi.weixin.qq.com/x?key=A_b-1'`, "https://qyapi.weixin.qq.com/x?key=A_b-1"},
	}
	for _, c := range cases {
		if got := unquoteUCI(c.in); got != c.want {
			t.Errorf("unquoteUCI(%q) = %q, 期望 %q", c.in, got, c.want)
		}
	}
}

// uci 不存在时（比如开发机上）必须退回默认配置而不是报错退出。
func TestLoadConfigFallsBackWhenUCIMissing(t *testing.T) {
	t.Setenv("PATH", t.TempDir())

	cfg, err := LoadConfig(context.Background())
	if err == nil {
		t.Error("uci 缺失时应当返回错误以便记录日志")
	}
	if cfg.AT.Network.Host != "192.168.8.1" || cfg.WebSocket.Port != 8765 {
		t.Errorf("应当退回默认配置, 得到 %+v", cfg)
	}
	if !cfg.Enabled {
		t.Error("默认配置应当是启用状态")
	}
}
