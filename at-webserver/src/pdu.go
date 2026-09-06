package main

import (
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode/utf16"
)

// gsm7Alphabet 是 GSM 03.38 默认字母表（按码位索引）。
var gsm7Alphabet = []rune(
	"@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
		"¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà")

// gsm7Extension 是 0x1B 转义后的扩展表，缺了它 € { } [ ] 等字符会显示成乱码。
var gsm7Extension = map[byte]rune{
	0x0A: '\f', 0x14: '^', 0x28: '{', 0x29: '}', 0x2F: '\\',
	0x3C: '[', 0x3D: '~', 0x3E: ']', 0x40: '|', 0x65: '€',
}

// PartialInfo 描述长短信分段信息。
type PartialInfo struct {
	Reference  int `json:"reference"`
	PartsCount int `json:"parts_count"`
	PartNumber int `json:"part_number"`
}

// SMS 是一条解码后的短信。
type SMS struct {
	Sender  string
	Content string
	Date    time.Time
	Partial *PartialInfo
}

// unpackSeptets 把 8 位字节流还原成 7 位码位序列。
func unpackSeptets(data []byte, count int) []byte {
	out := make([]byte, 0, count)
	var acc uint32
	var bits uint

	for _, b := range data {
		acc |= uint32(b) << bits
		bits += 8
		for bits >= 7 {
			if len(out) == count {
				return out
			}
			out = append(out, byte(acc&0x7F))
			acc >>= 7
			bits -= 7
		}
	}
	if bits > 0 && len(out) < count {
		out = append(out, byte(acc&0x7F))
	}
	return out
}

// septetsToString 按默认字母表(含扩展表)翻译码位序列。
func septetsToString(septets []byte) string {
	var sb strings.Builder
	sb.Grow(len(septets))

	for i := 0; i < len(septets); i++ {
		c := septets[i]
		if c == 0x1B && i+1 < len(septets) {
			if r, ok := gsm7Extension[septets[i+1]]; ok {
				sb.WriteRune(r)
				i++
				continue
			}
		}
		if int(c) < len(gsm7Alphabet) {
			sb.WriteRune(gsm7Alphabet[c])
		} else {
			sb.WriteByte('?')
		}
	}
	return sb.String()
}

func decodeUCS2(data []byte) string {
	units := make([]uint16, 0, len(data)/2)
	for i := 0; i+1 < len(data); i += 2 {
		units = append(units, uint16(data[i])<<8|uint16(data[i+1]))
	}
	return string(utf16.Decode(units))
}

// bcdDigit 还原一个半字节交换的 BCD 字节，返回两位数字。
func bcdDigit(b byte) int {
	return int(b&0x0F)*10 + int(b>>4)
}

func decodeTimestamp(ts []byte) time.Time {
	if len(ts) < 7 {
		return time.Now()
	}
	year := 2000 + bcdDigit(ts[0])
	month := bcdDigit(ts[1])
	day := bcdDigit(ts[2])
	hour := bcdDigit(ts[3])
	minute := bcdDigit(ts[4])
	second := bcdDigit(ts[5])

	if month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 60 {
		return time.Now()
	}
	// 时区字节存在但沿用本地时区解释，与旧实现保持一致。
	return time.Date(year, time.Month(month), day, hour, minute, second, 0, time.Local)
}

// decodeNumber 解码 BCD 电话号码，digits 为号码位数。
func decodeNumber(data []byte, digits int) string {
	var sb strings.Builder
	sb.Grow(digits)
	for _, b := range data {
		lo, hi := b&0x0F, b>>4
		if lo <= 9 {
			sb.WriteByte('0' + lo)
		}
		if sb.Len() < digits && hi <= 9 {
			sb.WriteByte('0' + hi)
		}
	}
	return sb.String()
}

// decodeAddress 解码地址字段，区分数字号码与字母数字发送方（如 "CMCC"）。
func decodeAddress(data []byte, digits int, toa byte) string {
	// TON = 101 表示 alphanumeric，内容是打包的 7 位字符而不是 BCD 数字。
	if (toa>>4)&0x07 == 0x05 {
		septets := (digits * 4) / 7
		return septetsToString(unpackSeptets(data, septets))
	}
	return decodeNumber(data, digits)
}

// DecodeIncomingPDU 解析 SMS-DELIVER PDU（AT+CMGR / AT+CMGL 的输出）。
func DecodeIncomingPDU(pduHex string) (SMS, error) {
	raw, err := hex.DecodeString(strings.TrimSpace(pduHex))
	if err != nil {
		return SMS{}, fmt.Errorf("PDU 不是合法的十六进制: %w", err)
	}

	// cut 从 pos 处安全截取 n 字节，越界即视为 PDU 截断。
	pos := 0
	cut := func(n int) ([]byte, error) {
		if n < 0 || pos+n > len(raw) {
			return nil, errors.New("PDU 数据不完整")
		}
		b := raw[pos : pos+n]
		pos += n
		return b, nil
	}
	next := func() (byte, error) {
		b, err := cut(1)
		if err != nil {
			return 0, err
		}
		return b[0], nil
	}

	smscLen, err := next()
	if err != nil {
		return SMS{}, err
	}
	if _, err := cut(int(smscLen)); err != nil {
		return SMS{}, err
	}

	pduType, err := next()
	if err != nil {
		return SMS{}, err
	}

	senderDigits, err := next()
	if err != nil {
		return SMS{}, err
	}
	senderTOA, err := next()
	if err != nil {
		return SMS{}, err
	}
	senderBytes, err := cut((int(senderDigits) + 1) / 2)
	if err != nil {
		return SMS{}, err
	}
	sender := decodeAddress(senderBytes, int(senderDigits), senderTOA)

	if _, err := next(); err != nil { // 协议标识符 PID
		return SMS{}, err
	}
	dcs, err := next()
	if err != nil {
		return SMS{}, err
	}
	tsBytes, err := cut(7)
	if err != nil {
		return SMS{}, err
	}
	udl, err := next()
	if err != nil {
		return SMS{}, err
	}
	ud := raw[pos:]

	// DCS bit3-2 选编码：00=GSM7 01=8bit 10=UCS2
	encoding := (dcs >> 2) & 0x03

	var udhLen int
	var partial *PartialInfo
	if pduType&0x40 != 0 && len(ud) > 0 {
		udhLen = int(ud[0]) + 1
		if udhLen > len(ud) {
			return SMS{}, errors.New("UDH 长度超出用户数据")
		}
		partial = parseUDHConcat(ud[1:udhLen])
	}

	var content string
	switch encoding {
	case 0x02: // UCS2
		content = decodeUCS2(ud[udhLen:])
	case 0x01: // 8-bit，按原样当作 Latin-1 处理
		var sb strings.Builder
		for _, b := range ud[udhLen:] {
			sb.WriteRune(rune(b))
		}
		content = sb.String()
	default: // GSM 7-bit
		// 7 位编码里 UDH 也按码位计数，且正文需要对齐到 7 位边界，
		// 所以要从整个用户数据解包后再跳过 UDH 占用的码位。
		udhSeptets := (udhLen*8 + 6) / 7
		total := int(udl)
		if total < udhSeptets {
			total = udhSeptets
		}
		septets := unpackSeptets(ud, total)
		if udhSeptets <= len(septets) {
			septets = septets[udhSeptets:]
		} else {
			septets = nil
		}
		content = septetsToString(septets)
	}

	return SMS{
		Sender:  sender,
		Content: content,
		Date:    decodeTimestamp(tsBytes),
		Partial: partial,
	}, nil
}

// parseUDHConcat 从 UDH 中取出长短信分段信息（IEI 0x00 为 8 位序号，0x08 为 16 位）。
func parseUDHConcat(udh []byte) *PartialInfo {
	for i := 0; i+1 < len(udh); {
		iei := udh[i]
		ieLen := int(udh[i+1])
		body := i + 2
		if body+ieLen > len(udh) {
			return nil
		}
		switch {
		case iei == 0x00 && ieLen >= 3:
			return &PartialInfo{
				Reference:  int(udh[body]),
				PartsCount: int(udh[body+1]),
				PartNumber: int(udh[body+2]),
			}
		case iei == 0x08 && ieLen >= 4:
			return &PartialInfo{
				Reference:  int(udh[body])<<8 | int(udh[body+1]),
				PartsCount: int(udh[body+2]),
				PartNumber: int(udh[body+3]),
			}
		}
		i = body + ieLen
	}
	return nil
}
