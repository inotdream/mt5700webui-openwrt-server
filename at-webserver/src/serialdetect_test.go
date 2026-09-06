package main

import (
	"reflect"
	"testing"
)

func TestOrderSerialCandidatesPrefersPCUI(t *testing.T) {
	// PCUI（ttyUSB1）必须排第一：SerialB/SerialC 有时也回 OK，
	// 先撞上它们会拿到一个能用但功能不全的 AT 口。
	got := orderSerialCandidates([]string{
		"/dev/ttyUSB0", "/dev/ttyUSB1", "/dev/ttyUSB2", "/dev/ttyUSB3", "/dev/ttyUSB4",
	})
	want := []string{
		"/dev/ttyUSB1", "/dev/ttyUSB0", "/dev/ttyUSB2", "/dev/ttyUSB3", "/dev/ttyUSB4",
	}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("探测顺序 = %v, 期望 %v", got, want)
	}
}

func TestOrderSerialCandidatesNumericSort(t *testing.T) {
	// 字符串排序会把 ttyUSB10 排到 ttyUSB2 前面，这里要按数字序。
	got := orderSerialCandidates([]string{
		"/dev/ttyUSB10", "/dev/ttyUSB2", "/dev/ttyUSB0",
	})
	want := []string{"/dev/ttyUSB0", "/dev/ttyUSB2", "/dev/ttyUSB10"}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("探测顺序 = %v, 期望 %v", got, want)
	}
}

func TestOrderSerialCandidatesWithoutPCUI(t *testing.T) {
	got := orderSerialCandidates([]string{"/dev/ttyUSB3", "/dev/ttyUSB0"})
	want := []string{"/dev/ttyUSB0", "/dev/ttyUSB3"}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("探测顺序 = %v, 期望 %v", got, want)
	}
}

func TestOrderSerialCandidatesEmpty(t *testing.T) {
	if got := orderSerialCandidates(nil); len(got) != 0 {
		t.Errorf("空输入应返回空, 得到 %v", got)
	}
}

func TestTTYUSBIndex(t *testing.T) {
	cases := []struct {
		in   string
		want int
		ok   bool
	}{
		{"/dev/ttyUSB0", 0, true},
		{"/dev/ttyUSB12", 12, true},
		{"/dev/ttyACM0", 0, false},
		{"/dev/ttyUSBx", 0, false},
	}
	for _, c := range cases {
		got, ok := ttyUSBIndex(c.in)
		if ok != c.ok || (ok && got != c.want) {
			t.Errorf("ttyUSBIndex(%q) = %d,%v, 期望 %d,%v", c.in, got, ok, c.want, c.ok)
		}
	}
}
