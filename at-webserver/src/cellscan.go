package main

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"
)

// 手册 5.35 AT^CELLSCAN-小区扫频。
//
// 扫频和别的 AT 命令有三点不一样，所以单独走一条通路：
//  1. 慢。全 Band 扫描要几十秒到几分钟，远超默认的 2 秒命令超时。
//  2. 结果是一行行陆续吐出来的，等全部结束再显示体验很差。
//  3. 手册规定扫频过程中下发小写 abcd 可以打断。这条打断必须绕过命令锁，
//     否则它只会排在扫频后面，等扫完了才发出去。
//
// 因此扫频在后台 goroutine 里跑：WebSocket 读循环立刻空出来接收打断命令，
// 扫描结果通过 cellscan 推送实时送给前端。
const (
	// cellScanAbortToken 是手册规定的打断字符串，必须是小写。
	cellScanAbortToken = "abcd"
	// defaultScanTimeout 是一次扫频的兜底超时。
	defaultScanTimeout = 3 * time.Minute
)

type cellScanState struct {
	mu      sync.Mutex
	running bool
	aborted bool
	lines   []string
}

// scanPush 是推给前端的扫频消息。state 取值 running/done/aborted/error。
type scanPush struct {
	State string   `json:"state"`
	Cell  string   `json:"cell,omitempty"`
	Lines []string `json:"lines,omitempty"`
	Count int      `json:"count"`
	Error string   `json:"error,omitempty"`
}

// isCellScan 判断是否为扫频命令（含打断伪命令）。
func isCellScan(command string) bool {
	return strings.HasPrefix(strings.ToUpper(strings.TrimSpace(command)), "AT^CELLSCAN")
}

// isCellScanAbort 匹配打断伪命令 AT^CELLSCAN=ABORT。它不会下发给模组，
// 而是翻译成手册要求的 abcd。
func isCellScanAbort(command string) bool {
	return strings.EqualFold(strings.TrimSpace(command), "AT^CELLSCAN=ABORT")
}

// isCellScanState 匹配状态查询伪命令。扫频在服务端异步跑，页面刷新后前端
// 并不知道还有一次扫频在进行，只会看到所有命令都被"正在扫频"挡回来，
// 有了这条就能恢复出"扫描中"的界面并把取消按钮给回用户。
func isCellScanState(command string) bool {
	return strings.EqualFold(strings.TrimSpace(command), "AT^CELLSCAN=STATE")
}

// handleCellScanCommand 处理扫频相关命令，非扫频命令返回 nil 交回原有通路。
func (s *WSServer) handleCellScanCommand(command string) *atCommandResponse {
	switch {
	case isCellScanState(command):
		return s.cellScanState()
	case isCellScanAbort(command):
		return s.abortCellScan()
	case isCellScan(command):
		return s.startCellScan(strings.TrimSpace(command))
	}
	return nil
}

func (s *WSServer) cellScanState() *atCommandResponse {
	s.scan.mu.Lock()
	running, count := s.scan.running, len(s.scan.lines)
	s.scan.mu.Unlock()

	if !running {
		return ptr(okResponse("^CELLSCAN: IDLE\r\nOK"))
	}
	return ptr(okResponse(fmt.Sprintf("^CELLSCAN: RUNNING,%d\r\nOK", count)))
}

func (s *WSServer) startCellScan(command string) *atCommandResponse {
	s.scan.mu.Lock()
	if s.scan.running {
		s.scan.mu.Unlock()
		return errResponse("扫频正在进行中，请先取消")
	}
	s.scan.running = true
	s.scan.aborted = false
	s.scan.lines = nil
	s.scan.mu.Unlock()

	go s.runCellScan(command)

	// 立刻应答，让前端的命令队列不被这条几分钟的命令堵住；真正的结果走推送。
	return ptr(okResponse("^CELLSCAN: STARTED\r\nOK"))
}

func (s *WSServer) runCellScan(command string) {
	// recover 只在被 defer 直接调用的函数里有效，所以 guard 必须自己是那个
	// 被 defer 的函数；又因为 defer 是后进先出，先注册它才能在清理之后执行。
	defer guard(s.log, "扫频")
	// running 必须无条件复位：万一这里出了意外还留着 true，
	// 之后所有 AT 命令都会被"正在扫频"挡住，只能重启服务才能恢复。
	defer func() {
		s.scan.mu.Lock()
		stuck := s.scan.running
		s.scan.running = false
		s.scan.aborted = false
		s.scan.lines = nil
		s.scan.mu.Unlock()
		if stuck {
			s.Broadcast(wsPush{Type: "cellscan", Data: scanPush{State: "error", Error: "扫频异常结束"}})
		}
	}()

	timeout := s.scanTimeout
	if timeout <= 0 {
		timeout = defaultScanTimeout
	}
	s.log.Infof("开始扫频: %s (超时 %s)", command, timeout)

	ctx, cancel := context.WithTimeout(context.Background(), timeout+10*time.Second)
	defer cancel()

	resp, err := s.client.SendLongCommand(ctx, command, timeout, s.onScanLine)

	s.scan.mu.Lock()
	lines := append([]string(nil), s.scan.lines...)
	aborted := s.scan.aborted
	s.scan.running = false
	s.scan.aborted = false
	s.scan.lines = nil
	s.scan.mu.Unlock()

	switch {
	case err != nil:
		s.log.Warnf("扫频失败: %v", err)
		s.Broadcast(wsPush{Type: "cellscan", Data: scanPush{State: "error", Error: err.Error(), Lines: lines, Count: len(lines)}})
	case resp.HasError():
		s.log.Warnf("扫频被模组拒绝: %s", resp.Text())
		s.Broadcast(wsPush{Type: "cellscan", Data: scanPush{State: "error", Error: resp.Text(), Lines: lines, Count: len(lines)}})
	default:
		state := "done"
		if aborted {
			// 手册：打断完成后输出 OK，按扫描完成处理，已扫到的结果依然有效。
			state = "aborted"
		}
		s.log.Infof("扫频结束(%s): 共 %d 个小区", state, len(lines))
		s.Broadcast(wsPush{Type: "cellscan", Data: scanPush{State: state, Lines: lines, Count: len(lines)}})
	}
}

// onScanLine 由 AT 客户端的读循环回调，只挑出 ^CELLSCAN: 结果行往前端推。
func (s *WSServer) onScanLine(line string) {
	line = strings.TrimSpace(line)
	if !strings.HasPrefix(line, "^CELLSCAN:") {
		return
	}

	s.scan.mu.Lock()
	s.scan.lines = append(s.scan.lines, line)
	count := len(s.scan.lines)
	s.scan.mu.Unlock()

	s.Broadcast(wsPush{Type: "cellscan", Data: scanPush{State: "running", Cell: line, Count: count}})
}

func (s *WSServer) abortCellScan() *atCommandResponse {
	// 全程持锁：扫频若在"判断还在跑"和"写打断字符串"之间正好结束，
	// abcd 就会插进下一条命令的数据流里。
	s.scan.mu.Lock()
	defer s.scan.mu.Unlock()

	if !s.scan.running {
		return errResponse("当前没有正在进行的扫频")
	}

	if err := s.client.Interrupt(cellScanAbortToken); err != nil {
		return errResponse("打断扫频失败: " + err.Error())
	}
	s.scan.aborted = true
	s.log.Infof("已下发扫频打断字符串")
	return ptr(okResponse("OK"))
}

// scanInProgress 用于在扫频期间挡住其它 AT 命令：模组此时被扫频独占，
// 放进去只会堆在命令锁后面然后超时，不如直接给个说得清的错误。
func (s *WSServer) scanInProgress() bool {
	s.scan.mu.Lock()
	defer s.scan.mu.Unlock()
	return s.scan.running
}
