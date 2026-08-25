//go:build linux && (amd64 || 386 || arm || arm64 || mips || mipsle || mips64 || mips64le || riscv64 || loong64 || s390x)

package main

// Go 的 stdlib syscall 包在 Linux 上没有导出这两个常量，只能自己定义。
// 取值来自内核的 include/uapi/asm-generic/termbits.h，绝大多数架构共用这一份。
// 故意用编译期常量而不是引入 golang.org/x/sys：后者会把所有平台的常量表
// 一起 vendor 进来（约 7MB）。没列进构建标签的架构会直接编译失败，
// 这比悄悄用错的数值安全。
const (
	cbaudMask  = 0x100F     // CBAUD：c_cflag 里表示波特率的位
	crtsctsBit = 0x80000000 // CRTSCTS：硬件流控
)
