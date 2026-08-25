package main

import (
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// autoSerialPort 是 serial_port 的哨兵值，表示自动探测 AT 口。
const autoSerialPort = "auto"

// preferredATPort 是模组默认的 PCUI 口。
//
// 按《MT5700M-CN 5G 系列模组 Linux 内核驱动集成指导》的端口映射：
//
//	ttyUSB0 = Application Interface
//	ttyUSB1 = PCUI          <- AT 命令口
//	ttyUSB2 = SerialB
//	ttyUSB3 = SerialC
//	ttyUSB4 = GPS
//
// 所以探测顺序把 ttyUSB1 放在最前面。SerialB/SerialC 有时也会回 OK，
// 先撞上它们会拿到一个能用但不完整的 AT 口。
const preferredATPort = "/dev/ttyUSB1"

// atProbeTimeout 是单个端口的探测超时。GPS 口只吐 NMEA 不回 OK，靠超时排除。
const atProbeTimeout = 800 * time.Millisecond

// listSerialCandidates 按探测优先级返回候选串口。
func listSerialCandidates() []string {
	matches, err := filepath.Glob("/dev/ttyUSB*")
	if err != nil {
		return nil
	}
	return orderSerialCandidates(matches)
}

// orderSerialCandidates 把 PCUI 排到最前，其余按编号升序。
func orderSerialCandidates(ports []string) []string {
	ordered := make([]string, 0, len(ports))
	rest := make([]string, 0, len(ports))

	for _, p := range ports {
		if p == preferredATPort {
			ordered = append(ordered, p)
			continue
		}
		rest = append(rest, p)
	}

	sort.Slice(rest, func(i, j int) bool {
		ni, oki := ttyUSBIndex(rest[i])
		nj, okj := ttyUSBIndex(rest[j])
		if oki && okj {
			return ni < nj
		}
		return rest[i] < rest[j]
	})

	return append(ordered, rest...)
}

// ttyUSBIndex 取出 /dev/ttyUSBn 里的 n，用于数字序排序（避免 ttyUSB10 排在 ttyUSB2 前面）。
func ttyUSBIndex(path string) (int, bool) {
	name := strings.TrimPrefix(path, "/dev/ttyUSB")
	if name == path {
		return 0, false
	}
	n, err := strconv.Atoi(name)
	return n, err == nil
}

// detectATPort 逐个探测候选串口，返回第一个能正常应答 AT 的设备。
func detectATPort(cfg SerialConfig, log *Logger) (Transport, error) {
	candidates := listSerialCandidates()
	if len(candidates) == 0 {
		return nil, errNoSerialPort
	}

	log.Infof("自动探测 AT 口，候选: %s", strings.Join(candidates, " "))

	for _, port := range candidates {
		probe := cfg
		probe.Port = port

		tp, err := openSerial(probe)
		if err != nil {
			log.Infof("  %s 打开失败: %v", port, err)
			continue
		}
		if probeAT(tp) {
			log.Infof("  %s 应答正常，选用该端口", port)
			return tp, nil
		}
		log.Infof("  %s 无有效应答，跳过", port)
		_ = tp.Close()
	}

	return nil, errNoATPort
}

// probeAT 往端口发一条 AT 并等 OK。能回 OK 才算是可用的 AT 口。
func probeAT(tp Transport) bool {
	if _, err := tp.Write([]byte("AT\r")); err != nil {
		return false
	}

	deadline := time.Now().Add(atProbeTimeout)
	buf := make([]byte, 256)
	var seen strings.Builder

	for time.Now().Before(deadline) {
		if !setReadDeadline(tp, deadline) {
			return false
		}
		n, err := tp.Read(buf)
		if n > 0 {
			seen.Write(buf[:n])
			text := seen.String()
			if strings.Contains(text, "OK") {
				return true
			}
			if strings.Contains(text, "ERROR") {
				// 能回 ERROR 说明这个口也在解析 AT，同样可用。
				return true
			}
		}
		if err != nil {
			return false
		}
	}
	return false
}
