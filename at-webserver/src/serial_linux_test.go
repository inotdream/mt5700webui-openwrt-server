//go:build linux

package main

import (
	"errors"
	"fmt"
	"os"
	"syscall"
	"testing"
	"time"
	"unsafe"
)

// openPTY 打开一对伪终端，返回 master 文件与 slave 设备路径。
// slave 就是被测代码眼里的"串口"，行为与 ttyUSB 走同一套 tty 层逻辑。
func openPTY(t *testing.T) (*os.File, string) {
	t.Helper()

	fd, err := syscall.Open("/dev/ptmx", syscall.O_RDWR|syscall.O_NOCTTY|syscall.O_NONBLOCK, 0)
	if err != nil {
		t.Skipf("无法打开 /dev/ptmx: %v", err)
	}

	unlock := 0
	if _, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(fd), syscall.TIOCSPTLCK, uintptr(unsafe.Pointer(&unlock))); errno != 0 {
		_ = syscall.Close(fd)
		t.Fatalf("TIOCSPTLCK 失败: %v", errno)
	}

	var n uint32
	if _, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(fd), syscall.TIOCGPTN, uintptr(unsafe.Pointer(&n))); errno != 0 {
		_ = syscall.Close(fd)
		t.Fatalf("TIOCGPTN 失败: %v", errno)
	}

	master := os.NewFile(uintptr(fd), "ptmx")
	t.Cleanup(func() { _ = master.Close() })
	return master, fmt.Sprintf("/dev/pts/%d", n)
}

// 串口空闲时 Read 必须阻塞等数据，而不是立刻返回 EOF。
//
// 这是 3.0.2 串口模式完全不可用的根因：VMIN=0/VTIME=0 让内核 n_tty_read 在检查
// O_NONBLOCK 之前就因 timeout==0 返回 0 字节，Go 把 0 字节读当成 io.EOF，
// 读循环第一次 Read 就退出，日志表现为"已连接 → 模组连接中断: EOF"每 2 秒循环。
func TestSerialReadWaitsForData(t *testing.T) {
	master, slavePath := openPTY(t)

	tp, err := openSerial(SerialConfig{Port: slavePath, Baudrate: 115200, Timeout: 2 * time.Second})
	if err != nil {
		t.Fatalf("打开串口失败: %v", err)
	}
	defer tp.Close()

	type result struct {
		n   int
		err error
		buf []byte
	}
	done := make(chan result, 1)
	go func() {
		buf := make([]byte, 64)
		n, err := tp.Read(buf)
		done <- result{n, err, buf[:n]}
	}()

	select {
	case r := <-done:
		t.Fatalf("没有数据时 Read 不该返回，却得到 n=%d err=%v", r.n, r.err)
	case <-time.After(300 * time.Millisecond):
	}

	if _, err := master.Write([]byte("\r\nOK\r\n")); err != nil {
		t.Fatalf("向 master 写入失败: %v", err)
	}

	select {
	case r := <-done:
		if r.err != nil {
			t.Fatalf("有数据后 Read 出错: %v", r.err)
		}
		if string(r.buf) != "\r\nOK\r\n" {
			t.Fatalf("读到的内容 = %q, 期望 \\r\\nOK\\r\\n", r.buf)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("写入数据后 Read 仍未返回")
	}
}

// 探测 AT 口靠 SetReadDeadline 限时，超时要得到 deadline 错误而不是 EOF。
func TestSerialReadDeadlineIsNotEOF(t *testing.T) {
	_, slavePath := openPTY(t)

	tp, err := openSerial(SerialConfig{Port: slavePath, Baudrate: 115200, Timeout: 2 * time.Second})
	if err != nil {
		t.Fatalf("打开串口失败: %v", err)
	}
	defer tp.Close()

	if err := tp.SetReadDeadline(time.Now().Add(150 * time.Millisecond)); err != nil {
		t.Fatalf("SetReadDeadline 失败: %v", err)
	}

	start := time.Now()
	n, err := tp.Read(make([]byte, 16))
	elapsed := time.Since(start)

	if n != 0 || !errors.Is(err, os.ErrDeadlineExceeded) {
		t.Fatalf("超时应返回 deadline 错误, 得到 n=%d err=%v", n, err)
	}
	if elapsed < 100*time.Millisecond {
		t.Fatalf("Read 在 %v 就返回了，没有真正等到 deadline", elapsed)
	}
}

// 探测成功后交给读循环的传输不能残留读 deadline，否则第一次 Read 就报 i/o timeout。
func TestProbeATClearsReadDeadline(t *testing.T) {
	master, slavePath := openPTY(t)

	tp, err := openSerial(SerialConfig{Port: slavePath, Baudrate: 115200, Timeout: 2 * time.Second})
	if err != nil {
		t.Fatalf("打开串口失败: %v", err)
	}
	defer tp.Close()

	// 模拟模组：收到 AT 就回 OK。
	go func() {
		buf := make([]byte, 16)
		_ = master.SetReadDeadline(time.Now().Add(2 * time.Second))
		if _, err := master.Read(buf); err == nil {
			_, _ = master.Write([]byte("\r\nOK\r\n"))
		}
	}()

	if !probeAT(tp) {
		t.Fatal("模组回了 OK，探测应当成功")
	}

	done := make(chan error, 1)
	go func() {
		_, err := tp.Read(make([]byte, 64))
		done <- err
	}()

	// 超过探测超时(800ms)后仍应阻塞：deadline 已被清除。
	select {
	case err := <-done:
		t.Fatalf("探测后的 Read 不该自行返回，却得到 err=%v", err)
	case <-time.After(1200 * time.Millisecond):
	}

	if _, err := master.Write([]byte("\r\n+CMTI: \"ME\",1\r\n")); err != nil {
		t.Fatalf("向 master 写入失败: %v", err)
	}
	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("有数据后 Read 出错: %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("写入数据后 Read 仍未返回")
	}
}

// 写入串口的数据必须原样到达另一端，且不能被行规程加工（比如 \r 变 \n）。
func TestSerialWriteIsRaw(t *testing.T) {
	master, slavePath := openPTY(t)

	tp, err := openSerial(SerialConfig{Port: slavePath, Baudrate: 115200, Timeout: 2 * time.Second})
	if err != nil {
		t.Fatalf("打开串口失败: %v", err)
	}
	defer tp.Close()

	if _, err := tp.Write([]byte("AT+CSQ\r")); err != nil {
		t.Fatalf("写入失败: %v", err)
	}

	_ = master.SetReadDeadline(time.Now().Add(2 * time.Second))
	buf := make([]byte, 32)
	n, err := master.Read(buf)
	if err != nil {
		t.Fatalf("master 读取失败: %v", err)
	}
	if got := string(buf[:n]); got != "AT+CSQ\r" {
		t.Fatalf("另一端收到 %q, 期望 AT+CSQ\\r", got)
	}
}
