package main

import (
	"testing"
	"time"
)

// 发送方 13800138000，时间戳 2025-08-25 12:00:00，UCS2 正文 "测试"。
const ucs2PDU = "00040B913108108300F0000852805221000023046D4B8BD5"

// 同一个头，DCS=00，GSM 7-bit 正文 "hello"（E8329BFD06 是该编码的经典样例）。
const gsm7PDU = "00040B913108108300F0000052805221000023" + "05" + "E8329BFD06"

func TestDecodeUCS2PDU(t *testing.T) {
	sms, err := DecodeIncomingPDU(ucs2PDU)
	if err != nil {
		t.Fatalf("解码失败: %v", err)
	}
	if sms.Sender != "13800138000" {
		t.Errorf("发送方 = %q, 期望 13800138000", sms.Sender)
	}
	if sms.Content != "测试" {
		t.Errorf("正文 = %q, 期望 测试", sms.Content)
	}
	want := time.Date(2025, 8, 25, 12, 0, 0, 0, time.Local)
	if !sms.Date.Equal(want) {
		t.Errorf("时间 = %v, 期望 %v", sms.Date, want)
	}
	if sms.Partial != nil {
		t.Errorf("不该被识别为分段短信: %+v", sms.Partial)
	}
}

func TestDecodeGSM7PDU(t *testing.T) {
	sms, err := DecodeIncomingPDU(gsm7PDU)
	if err != nil {
		t.Fatalf("解码失败: %v", err)
	}
	if sms.Content != "hello" {
		t.Errorf("正文 = %q, 期望 hello", sms.Content)
	}
}

func TestDecodeConcatenatedPDU(t *testing.T) {
	// PDU 类型 0x44 表示带 UDH；UDH 为 05 00 03 2A 02 01
	// 即 8 位分段头：reference=0x2A(42), 共 2 段, 当前第 1 段。
	// 正文为 UCS2 "测"（6D4B），UDL = UDH 6 字节 + 正文 2 字节 = 8。
	pdu := "00440B913108108300F0000852805221000023" + "08" + "0500032A0201" + "6D4B"
	sms, err := DecodeIncomingPDU(pdu)
	if err != nil {
		t.Fatalf("解码失败: %v", err)
	}
	if sms.Partial == nil {
		t.Fatal("应该识别出分段信息")
	}
	if sms.Partial.Reference != 42 || sms.Partial.PartsCount != 2 || sms.Partial.PartNumber != 1 {
		t.Errorf("分段信息 = %+v, 期望 ref=42 total=2 seq=1", sms.Partial)
	}
	if sms.Content != "测" {
		t.Errorf("正文 = %q, 期望 测", sms.Content)
	}
}

// 畸形 PDU 绝不能让进程崩掉，只能返回错误。
func TestDecodeMalformedPDU(t *testing.T) {
	for _, in := range []string{"", "ZZ", "00", "0004", "00040B91", "00040B9131"} {
		if _, err := DecodeIncomingPDU(in); err == nil {
			t.Errorf("输入 %q 应当返回错误", in)
		}
	}
}

func TestDecodeAlphanumericSender(t *testing.T) {
	// TOA=0xD0 表示字母数字发送方，4 字节打包 7 位字符 -> "hello" 的前若干位。
	// 这里用 0x0A 位长度(=5 个字符) 验证不会退化成一串数字。
	pdu := "0004" + "0A" + "D0" + "E8329BFD06" + "00" + "08" + "52805221000023" + "02" + "6D4B"
	sms, err := DecodeIncomingPDU(pdu)
	if err != nil {
		t.Fatalf("解码失败: %v", err)
	}
	if sms.Sender != "hello" {
		t.Errorf("发送方 = %q, 期望 hello", sms.Sender)
	}
}

func TestGSM7Extension(t *testing.T) {
	// 0x1B 0x65 是扩展表里的欧元符号。
	got := septetsToString([]byte{0x1B, 0x65, 'a'})
	if got != "€a" {
		t.Errorf("扩展表解码 = %q, 期望 €a", got)
	}
}
