//go:build !linux

package main

// 目标平台只有 OpenWrt/Linux；这个桩仅为了在开发机上也能编译和跑测试。
func openSerial(SerialConfig) (Transport, error) {
	return nil, errSerialUnsupported
}
