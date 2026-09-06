package main

import (
	"fmt"
	"io"
	"os"
	"runtime/debug"
	"sync/atomic"
	"time"
)

type LogLevel int32

const (
	LevelDebug LogLevel = iota
	LevelInfo
	LevelWarn
	LevelError
)

// Logger 是一个极简的分级日志器。启动阶段用 Info，进入稳态后收紧到 Warn，
// 与旧 Python 实现的行为保持一致，避免 procd 日志被刷爆。
type Logger struct {
	level atomic.Int32
	out   io.Writer
}

func NewLogger(level LogLevel) *Logger {
	l := &Logger{out: os.Stdout}
	l.level.Store(int32(level))
	return l
}

func (l *Logger) SetLevel(level LogLevel) { l.level.Store(int32(level)) }

func (l *Logger) enabled(level LogLevel) bool {
	return int32(level) >= l.level.Load()
}

func (l *Logger) logf(level LogLevel, tag, format string, args ...any) {
	if !l.enabled(level) {
		return
	}
	fmt.Fprintf(l.out, "%s [%s] %s\n", time.Now().Format("2006-01-02 15:04:05"), tag, fmt.Sprintf(format, args...))
}

func (l *Logger) Debugf(format string, args ...any) { l.logf(LevelDebug, "DEBUG", format, args...) }
func (l *Logger) Infof(format string, args ...any)  { l.logf(LevelInfo, "INFO", format, args...) }
func (l *Logger) Warnf(format string, args ...any)  { l.logf(LevelWarn, "WARN", format, args...) }
func (l *Logger) Errorf(format string, args ...any) { l.logf(LevelError, "ERROR", format, args...) }

// guard 拦住后台 goroutine 里的 panic。这个服务常驻在路由器上，
// 一条畸形的模组上报把整个进程带走，比这条上报处理失败严重得多。
// 用法：defer guard(log, "定时锁频")
func guard(log *Logger, name string) {
	if r := recover(); r != nil {
		log.Errorf("%s 出现内部错误，已拦截避免服务退出: %v\n%s", name, r, debug.Stack())
	}
}
