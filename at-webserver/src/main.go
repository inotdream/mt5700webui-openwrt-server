package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"runtime"
	"sync"
	"syscall"
)

// version 由构建时通过 -ldflags "-X main.version=..." 注入。
var version = "dev"

func main() {
	var (
		showVersion = flag.Bool("version", false, "打印版本后退出")
		verbose     = flag.Bool("verbose", false, "保持 debug 级别日志")
	)
	flag.Parse()

	if *showVersion {
		fmt.Printf("at-webserver %s (%s %s/%s)\n", version, runtime.Version(), runtime.GOOS, runtime.GOARCH)
		return
	}

	log := NewLogger(LevelInfo)
	if *verbose {
		log.SetLevel(LevelDebug)
	}

	if err := run(log, *verbose); err != nil {
		log.Errorf("服务退出: %v", err)
		os.Exit(1)
	}
}

func run(log *Logger, verbose bool) error {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	log.Infof("at-webserver %s 启动中 (pid %d)", version, os.Getpid())

	cfg, err := LoadConfig(ctx)
	if err != nil {
		log.Warnf("读取 UCI 配置失败，使用默认配置: %v", err)
	}
	if !cfg.Enabled {
		log.Warnf("服务在配置中被禁用，退出")
		return nil
	}
	logConfig(log, cfg)

	client := NewATClient(cfg.AT, log)
	ws := NewWSServer(client, cfg.WebSocket.AuthKey, log)
	notifier := NewNotifier(cfg.Notification, log)
	dispatcher := NewDispatcher(client, notifier, ws, log)
	scheduler := NewScheduler(cfg.Schedule, client, notifier, log)
	ws.AttachScheduler(scheduler)
	ws.SetScanTimeout(cfg.WebSocket.ScanTimeout)

	// 先同步绑定端口：端口被占用属于启动失败，应当立刻报错而不是异步才发现。
	ln, err := ws.Listen(ctx, cfg.WebSocket.Port)
	if err != nil {
		return fmt.Errorf("监听 WebSocket 端口 %d 失败: %w", cfg.WebSocket.Port, err)
	}
	log.Infof("WebSocket 监听 :%d (IPv4 + IPv6)", cfg.WebSocket.Port)

	var wg sync.WaitGroup
	spawn := func(name string, fn func(context.Context)) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fn(ctx)
			log.Debugf("%s 已停止", name)
		}()
	}

	spawn("AT 连接", client.Run)
	spawn("通知", notifier.Run)
	spawn("上报处理", dispatcher.Run)
	spawn("定时锁频", scheduler.Run)

	serveErr := make(chan error, 1)
	wg.Add(1)
	go func() {
		defer wg.Done()
		serveErr <- ws.ServeListener(ctx, ln)
	}()

	log.Infof("启动完成，WebSocket ws://<路由器地址>:%d", cfg.WebSocket.Port)
	if !verbose {
		// 稳态只留警告和错误，避免刷满 procd 日志。
		log.SetLevel(LevelWarn)
	}

	var runErr error
	select {
	case runErr = <-serveErr:
		if runErr != nil {
			stop()
		}
	case <-ctx.Done():
	}

	wg.Wait()
	log.SetLevel(LevelInfo)
	log.Infof("服务已停止")
	return runErr
}

func logConfig(log *Logger, cfg Config) {
	if cfg.AT.Type == "SERIAL" {
		if cfg.AT.Serial.Port == autoSerialPort {
			log.Infof("AT 通道: 串口自动探测 @ %d", cfg.AT.Serial.Baudrate)
		} else {
			log.Infof("AT 通道: 串口 %s @ %d", cfg.AT.Serial.Port, cfg.AT.Serial.Baudrate)
		}
	} else {
		log.Infof("AT 通道: 网络 %s:%d", cfg.AT.Network.Host, cfg.AT.Network.Port)
	}

	log.Infof("WebSocket 端口: %d，连接密钥: %s", cfg.WebSocket.Port, presence(cfg.WebSocket.AuthKey != ""))
	if cfg.WebSocket.AllowWAN {
		log.Warnf("配置中允许外网访问 WebSocket，请确认防火墙规则已就位")
	}

	log.Infof("推送开关: 短信=%v 来电=%v 存储满=%v 信号=%v",
		cfg.Notification.Types.SMS, cfg.Notification.Types.Call,
		cfg.Notification.Types.MemoryFull, cfg.Notification.Types.Signal)
	log.Infof("定时锁频: %s", enabledText(cfg.Schedule.Enabled))
}

func presence(set bool) string {
	if set {
		return "已设置"
	}
	return "未设置"
}
