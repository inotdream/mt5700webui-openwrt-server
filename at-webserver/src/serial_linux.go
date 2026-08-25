//go:build linux

package main

import (
	"fmt"
	"os"
	"syscall"
	"time"
	"unsafe"
)

var baudRates = map[int]uint32{
	9600: syscall.B9600, 19200: syscall.B19200, 38400: syscall.B38400,
	57600: syscall.B57600, 115200: syscall.B115200, 230400: syscall.B230400,
	460800: syscall.B460800, 921600: syscall.B921600,
	1500000: syscall.B1500000, 3000000: syscall.B3000000, 4000000: syscall.B4000000,
}

type serialTransport struct {
	file         *os.File
	port         string
	writeTimeout time.Duration
}

// openSerial 打开串口并配置成 raw 模式。
//
// 用 O_NONBLOCK 打开后交给 os.NewFile，Go runtime 会把这个 fd 挂到 netpoller 上，
// Read 于是变成真正的事件驱动阻塞读。旧实现是靠反复查询 in_waiting 轮询的，
// 那是空载开销的主要来源。
func openSerial(cfg SerialConfig) (Transport, error) {
	speed, ok := baudRates[cfg.Baudrate]
	if !ok {
		return nil, fmt.Errorf("不支持的波特率 %d", cfg.Baudrate)
	}

	fd, err := syscall.Open(cfg.Port, syscall.O_RDWR|syscall.O_NOCTTY|syscall.O_NONBLOCK, 0)
	if err != nil {
		return nil, fmt.Errorf("打开串口 %s 失败: %w", cfg.Port, err)
	}

	if err := configureTermios(fd, speed); err != nil {
		_ = syscall.Close(fd)
		return nil, fmt.Errorf("配置串口 %s 失败: %w", cfg.Port, err)
	}

	file := os.NewFile(uintptr(fd), cfg.Port)
	if file == nil {
		_ = syscall.Close(fd)
		return nil, fmt.Errorf("无法接管串口 fd: %s", cfg.Port)
	}
	return &serialTransport{file: file, port: cfg.Port, writeTimeout: cfg.Timeout}, nil
}

func configureTermios(fd int, speed uint32) error {
	var t syscall.Termios
	if err := ioctlTermios(fd, syscall.TCGETS, &t); err != nil {
		return err
	}

	t.Iflag &^= syscall.IGNBRK | syscall.BRKINT | syscall.PARMRK | syscall.ISTRIP |
		syscall.INLCR | syscall.IGNCR | syscall.ICRNL | syscall.IXON | syscall.IXOFF
	t.Oflag &^= syscall.OPOST
	t.Lflag &^= syscall.ECHO | syscall.ECHONL | syscall.ICANON | syscall.ISIG | syscall.IEXTEN
	t.Cflag &^= syscall.CSIZE | syscall.PARENB | syscall.CSTOPB | crtsctsBit
	t.Cflag |= syscall.CS8 | syscall.CREAD | syscall.CLOCAL

	// 阻塞语义交给 netpoller，termios 层设成立即返回。
	t.Cc[syscall.VMIN] = 0
	t.Cc[syscall.VTIME] = 0

	// Linux 的 TCSETS 只认 c_cflag 里的 CBAUD 位（c_ispeed/c_ospeed 要 TCSETS2 才生效，
	// 而且 MIPS 的 syscall.Termios 里根本没有这两个字段），
	// 所以只需先清掉旧的波特率位再写入新值。
	t.Cflag = (t.Cflag &^ cbaudMask) | speed

	return ioctlTermios(fd, syscall.TCSETS, &t)
}

func ioctlTermios(fd int, req uint, t *syscall.Termios) error {
	_, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(fd), uintptr(req), uintptr(unsafe.Pointer(t)))
	if errno != 0 {
		return errno
	}
	return nil
}

func (s *serialTransport) Read(p []byte) (int, error) { return s.file.Read(p) }

func (s *serialTransport) SetReadDeadline(deadline time.Time) error {
	return s.file.SetReadDeadline(deadline)
}

func (s *serialTransport) Write(p []byte) (int, error) {
	if err := s.file.SetWriteDeadline(time.Now().Add(s.writeTimeout)); err != nil {
		// 少数驱动不支持 deadline，退化成直接写。
		return s.file.Write(p)
	}
	defer func() { _ = s.file.SetWriteDeadline(time.Time{}) }()
	return s.file.Write(p)
}

func (s *serialTransport) Close() error     { return s.file.Close() }
func (s *serialTransport) Describe() string { return "串口 " + s.port }
