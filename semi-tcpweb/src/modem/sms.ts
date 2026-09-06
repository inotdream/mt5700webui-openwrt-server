import * as PDU from 'node-pdu';
import { isMockModeEnabled, MOCK_SMS_CACHE_KEY } from '@/services/mockAT';

export const SMS_CACHE_KEY = isMockModeEnabled()
  ? MOCK_SMS_CACHE_KEY
  : 'sms_sent_messages_cache';
export const MAX_SMS_CACHE = 1000;

export interface SMS {
  index: number;
  content: string;
  number: string;
  time: string;
  type: 'sent' | 'received';
  isConcatenated?: boolean;
  concatenatedRef?: number;
  concatenatedSeq?: number;
  concatenatedTotal?: number;
}

export function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  let normalized = phoneNumber.replace(/^\+/, '');
  if (normalized.startsWith('86') && normalized.length > 2) {
    const rest = normalized.substring(2);
    if (/^\d+$/.test(rest)) return rest;
  }
  if (/^\d+$/.test(normalized)) return normalized;
  const digits = normalized.replace(/\D/g, '');
  return digits || normalized;
}

export function isValidPhoneNumber(number: string): boolean {
  return /^\d{5,19}$/.test(normalizePhoneNumber(number));
}

export function formatPDUTime(timestamp: Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleString('zh-CN');
  const formatted = date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const [datePart, timePart] = formatted.split(' ');
  const [year, month, day] = datePart.split('/');
  return `${year.slice(-2)}/${month}/${day},${timePart}`;
}

export function parseMessageTime(timeStr: string): Date {
  if (!timeStr) return new Date();
  const raw = String(timeStr).trim();
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{2}),(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const year = 2000 + parseInt(match[1], 10);
    return new Date(year, parseInt(match[2], 10) - 1, parseInt(match[3], 10), parseInt(match[4], 10), parseInt(match[5], 10), parseInt(match[6], 10));
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function processPDUMessage(current: { index?: string; pdu?: string }, out: SMS[]) {
  if (!current.index || !current.pdu) return;
  const messageIndex = parseInt(current.index, 10);
  if (out.some((m) => m.index === messageIndex)) return;
  const cleanPdu = current.pdu.replace(/\r/g, '');
  if (cleanPdu.length < 20) return;
  try {
    const pduResult = PDU.parse(cleanPdu);
    if (!(pduResult instanceof PDU.Deliver)) return;
    const phoneNumber = pduResult._address?._phone || '';
    const messageText = pduResult._data?.getText() || '';
    let isConcatenated = false;
    let concatenatedInfo: { ref: number; total: number; seq: number } | null = null;
    const ieData = pduResult._data?._parts?.[0]?.header?.ies?.[0]?.data;
    if (ieData?.maxMsgNum && ieData?.msgRef && ieData?.msgSeqNo) {
      concatenatedInfo = { ref: ieData.msgRef, total: ieData.maxMsgNum, seq: ieData.msgSeqNo };
      isConcatenated = true;
    }
    let timestamp: Date | null = null;
    if (pduResult._serviceCenterTimeStamp?.time) {
      const utc = pduResult._serviceCenterTimeStamp.time * 1000;
      const tzOff = pduResult._serviceCenterTimeStamp.tzOff || 0;
      timestamp = new Date(utc + (tzOff + new Date().getTimezoneOffset()) * 60 * 1000);
    }
    if (phoneNumber && messageText) {
      out.push({
        index: messageIndex,
        content: messageText,
        number: normalizePhoneNumber(phoneNumber),
        time: formatPDUTime(timestamp || new Date()),
        type: 'received',
        isConcatenated,
        ...(isConcatenated && concatenatedInfo
          ? {
              concatenatedRef: concatenatedInfo.ref,
              concatenatedSeq: concatenatedInfo.seq,
              concatenatedTotal: concatenatedInfo.total,
            }
          : {}),
      });
    }
  } catch {
    /* ignore malformed PDU */
  }
}

export function parseCMGL(data: string): SMS[] {
  const smsMessages: SMS[] = [];
  let parsedData = data;
  try {
    const jsonData = JSON.parse(data);
    if (jsonData.success && jsonData.data) parsedData = jsonData.data;
  } catch {
    const match = parsedData.match(/\+CMGL:.*?(?=\+CMGL:|$)/gs);
    if (match) parsedData = match.join('\n');
  }
  const lines = parsedData.split(/\r?\n/).filter((line) => line.trim());
  let current: { index?: string; status?: string; pdu?: string } | null = null;
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line || line === 'OK' || line.startsWith('AT+')) continue;
    if (line.startsWith('+CMGL:')) {
      if (current?.index && current.pdu) processPDUMessage(current, smsMessages);
      const matches = line.match(/\+CMGL: (\d+),(\d+),,(\d+)/);
      current = matches ? { index: matches[1], status: matches[2] } : null;
    } else if (current && !current.pdu) {
      if (/^[0-9A-F]+$/i.test(line)) {
        current.pdu = line;
        processPDUMessage(current, smsMessages);
        current = null;
      } else {
        current = null;
      }
    }
  }
  if (current?.index && current.pdu) processPDUMessage(current, smsMessages);
  return mergeConcatenated(smsMessages);
}

function mergeConcatenated(messages: SMS[]): SMS[] {
  const groups = new Map<string, SMS[]>();
  const others: SMS[] = [];
  messages.forEach((msg) => {
    if (msg.isConcatenated && msg.concatenatedRef != null) {
      const key = `${msg.number}-${msg.concatenatedRef}-${msg.concatenatedTotal}`;
      const list = groups.get(key) || [];
      list.push(msg);
      groups.set(key, list);
    } else {
      others.push(msg);
    }
  });
  groups.forEach((parts) => {
    const sorted = [...parts].sort((a, b) => (a.concatenatedSeq || 0) - (b.concatenatedSeq || 0));
    const first = sorted[0];
    const complete = first.concatenatedTotal ? sorted.length >= first.concatenatedTotal : true;
    others.push({
      ...first,
      content: sorted.map((p) => p.content).join(''),
      isConcatenated: true,
    });
    if (!complete) {
      /* keep merged even if incomplete so user can still read fragments */
    }
  });
  return others;
}

export function getCachedSentMessages(): SMS[] {
  try {
    const cached = localStorage.getItem(SMS_CACHE_KEY);
    if (!cached) return [];
    const messages = JSON.parse(cached);
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

export function saveSentMessageToCache(message: SMS) {
  const cached = getCachedSentMessages();
  cached.push(message);
  if (cached.length > MAX_SMS_CACHE) cached.splice(0, cached.length - MAX_SMS_CACHE);
  localStorage.setItem(SMS_CACHE_KEY, JSON.stringify(cached));
}

export function clearSentMessageCache() {
  localStorage.removeItem(SMS_CACHE_KEY);
}

export function setCachedSentMessages(messages: SMS[]) {
  localStorage.setItem(SMS_CACHE_KEY, JSON.stringify(messages));
}
