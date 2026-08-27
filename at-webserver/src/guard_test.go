package main

import (
	"strings"
	"testing"
)

// guard 靠 recover 兜住后台 goroutine 的 panic，而 recover 只有被 defer 直接
// 调用时才有效。写成 defer func(){ ...; guard(...) }() 是拦不住的，这里把这个
// 约定钉死，避免以后改动时悄悄失效——一旦失效，一次 panic 就会带走整个服务。
func TestGuardRecoversPanic(t *testing.T) {
	var buf strings.Builder
	log := NewLogger(LevelError)
	log.out = &buf

	func() {
		defer guard(log, "测试任务")
		panic("boom")
	}()

	if !strings.Contains(buf.String(), "测试任务") {
		t.Fatalf("panic 没有被记录: %q", buf.String())
	}
}
