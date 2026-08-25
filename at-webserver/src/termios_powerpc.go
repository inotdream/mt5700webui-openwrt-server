//go:build linux && (ppc || ppc64 || ppc64le)

package main

// PowerPC 的 CBAUD 位域与 asm-generic 不同，见内核 arch/powerpc/include/uapi/asm/termbits.h。
const (
	cbaudMask  = 0xFF
	crtsctsBit = 0x80000000
)
