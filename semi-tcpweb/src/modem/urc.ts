// 模组主动上报（URC）的解析。
//
// at-webserver 只有在没有命令等待应答时才会把模组吐出的行原样推给前端，
// 形如 {"type":"raw_data","data":"^HCSQ: \"NR\",62,106,2"}，一条推送一行。
// 这里把这些行翻译成结构化数据，命令应答的解析在各页面里各管各的。

import { parseRejInfo } from './reject';
import { parseUssd } from './ussd';

export interface PDCPData {
  id: number;
  pduSessionId: number;
  discardTimerLen: number;
  avgDelay: number;
  minDelay: number;
  maxDelay: number;
  highPriQueMaxBuffTime: number;
  lowPriQueMaxBuffTime: number;
  highPriQueBuffPktNums: number;
  lowPriQueBuffPktNums: number;
  ulPdcpRate: number;
  dlPdcpRate: number;
  ulDiscardCnt: number;
  dlDiscardCnt: number;
  timestamp1: number;
  timestamp2: number;
}

export type URCType =
  | 'HCSQ'
  | 'RSSI'
  | 'CERSSI'
  | 'PLMN'
  | 'EONS'
  | 'SRVST'
  | 'LENDC'
  | 'ANLEVEL'
  | 'IMSSRVSTATUS'
  | 'DSAMBR'
  | 'REJINFO'
  | 'CUSD';

export interface URCData {
  type: URCType;
  raw: string;
  parsed?: any;
}

// 手册 5.36.1 定义 14 个字段，后端 pdcpFields 也是 14 个。
// 后面两个时间戳是某些固件的额外字段，可有可无。
const PDCP_PATTERN =
  /\^PDCPDATAINFO:\s*(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)(?:,(\d+),(\d+))?[^\r\n]*/g;

// extractPDCP 取出 ^PDCPDATAINFO 统计并返回剩余文本。
// 后端自己也会把这些行解析成 pdcp_data 推送，这里的解析是兼容只推原始行的实现。
export function extractPDCP(text: string): { entries: PDCPData[]; rest: string } {
  const entries: PDCPData[] = [];
  let rest = text;

  for (const match of text.matchAll(PDCP_PATTERN)) {
    const [line, ...values] = match;
    rest = rest.replace(line, '');
    entries.push({
      id: parseInt(values[0], 10),
      pduSessionId: parseInt(values[1], 10),
      discardTimerLen: parseInt(values[2], 10),
      // 时延类字段以 0.1ms 为单位上报。
      avgDelay: parseFloat(values[3]) / 10,
      minDelay: parseFloat(values[4]) / 10,
      maxDelay: parseFloat(values[5]) / 10,
      highPriQueMaxBuffTime: parseFloat(values[6]) / 10,
      lowPriQueMaxBuffTime: parseFloat(values[7]) / 10,
      highPriQueBuffPktNums: parseInt(values[8], 10),
      lowPriQueBuffPktNums: parseInt(values[9], 10),
      ulPdcpRate: parseInt(values[10], 10),
      dlPdcpRate: parseInt(values[11], 10),
      ulDiscardCnt: parseInt(values[12], 10),
      dlDiscardCnt: parseInt(values[13], 10),
      timestamp1: values[14] !== undefined ? parseInt(values[14], 10) : 0,
      timestamp2: values[15] !== undefined ? parseInt(values[15], 10) : 0,
    });
  }

  return { entries, rest: entries.length ? rest.replace(/^\s*[\r\n]+/gm, '').trim() : rest };
}

const urcParsers: { keyword: string; parse: (line: string) => URCData | null }[] = [
  {
    // 手册 13.5.3：字段含义随制式而变，别按位置想当然。
    //   ^HCSQ: "LTE",<rssi>,<rsrp>,<sinr>,<rsrq>
    //   ^HCSQ: "NR",<rsrp>,<sinr>,<rsrq>
    // 这里只取档位原值，换算成 dBm/dB 由调用方做。
    keyword: '^HCSQ:',
    parse: (line) => {
      const match = line.match(/\^HCSQ:\s*"?(\w+)"?((?:,\d+)+)/);
      if (!match) return null;
      const [, mode, tail] = match;
      const values = tail.split(',').slice(1).map((v) => parseInt(v, 10));
      const pick = (index: number): number | undefined => {
        const v = values[index];
        return v === undefined || v === 255 ? undefined : v;
      };
      const parsed =
        mode === 'LTE'
          ? { rssi: pick(0), rsrp: pick(1), sinr: pick(2), rsrq: pick(3) }
          : { rsrp: pick(0), sinr: pick(1), rsrq: pick(2), rssi: undefined };
      return { type: 'HCSQ', raw: line, parsed: { networkMode: mode, ...parsed } };
    },
  },
  {
    // ^RSSI: 31
    keyword: '^RSSI:',
    parse: (line) => {
      const match = line.match(/\^RSSI:\s*(\d+)/);
      if (!match) return null;
      return { type: 'RSSI', raw: line, parsed: { rssi: parseInt(match[1], 10) } };
    },
  },
  {
    // ^CERSSI: 0,0,255,...,-79,-12,1（第 19/20/21 个字段是 RSRP/RSRQ/SINR）
    keyword: '^CERSSI:',
    parse: (line) => {
      const match = line.match(/\^CERSSI:\s*(.+)/);
      if (!match) return null;
      const values = match[1].split(',');
      return {
        type: 'CERSSI',
        raw: line,
        parsed: {
          rsrp: parseInt(values[18], 10) || undefined,
          rsrq: parseInt(values[19], 10) || undefined,
          sinr: parseInt(values[20], 10) || undefined,
        },
      };
    },
  },
  {
    // ^IMSSRVSTATUS: 2,0,2,0,0,0,0,0
    keyword: '^IMSSRVSTATUS:',
    parse: (line) => {
      const match = line.match(/\^IMSSRVSTATUS:\s*(.+)/);
      if (!match) return null;
      const values = match[1].split(',').map((v) => parseInt(v.trim(), 10));
      return {
        type: 'IMSSRVSTATUS',
        raw: line,
        parsed: {
          voiceStatus: values[0],
          videoStatus: values[1],
          utStatus: values[2],
          smsStatus: values[3],
          values,
        },
      };
    },
  },
  {
    // ^DSAMBR: 8,500000,100000,"3gnet.MNC001.MCC460.GPRS"
    // 速率单位是 bps；QCI 不在这里，得用 AT+CGEQOSRDP 查。
    keyword: '^DSAMBR:',
    parse: (line) => {
      const match = line.match(/\^DSAMBR:\s*(\d+),(\d+),(\d+),"([^"]*)"/);
      if (!match) return null;
      const [, cid, maxDlRate, maxUlRate, apn] = match;
      return {
        type: 'DSAMBR',
        raw: line,
        parsed: {
          cid: parseInt(cid, 10),
          maxDownlinkRate: parseInt(maxDlRate, 10),
          maxUplinkRate: parseInt(maxUlRate, 10),
          apn,
        },
      };
    },
  },
  {
    // 手册 13.14：注册/业务请求/DETACH 被网络拒绝时的原因值上报。
    keyword: '^REJINFO',
    parse: (line) => {
      const info = parseRejInfo(line);
      return info ? { type: 'REJINFO', raw: line, parsed: info } : null;
    },
  },
  {
    // 手册 5.22：USSD 的结果是主动上报回来的，不在 AT+CUSD 的应答里。
    keyword: '+CUSD:',
    parse: (line) => {
      const reply = parseUssd(line);
      return reply ? { type: 'CUSD', raw: line, parsed: reply } : null;
    },
  },
];

export function parseURCLine(line: string): URCData | null {
  for (const parser of urcParsers) {
    if (!line.includes(parser.keyword)) continue;
    const urc = parser.parse(line);
    if (urc) return urc;
  }
  return null;
}

// extractURCs 解析文本里所有能识别的上报行，识别不了的忽略。
export function extractURCs(text: string): URCData[] {
  const found: URCData[] = [];
  for (const line of text.split(/\r?\n/)) {
    const urc = parseURCLine(line);
    if (urc) found.push(urc);
  }
  return found;
}

// 模组的主动上报关键字。裸文本（非 JSON）里出现这些说明不是命令应答，
// 拿去匹配等待中的命令只会串号。
const URC_KEYWORDS = [
  '^PDCPDATAINFO:', '^RSSI:', '^CERSSI:', '^HCSQ:', 'RING',
  '^ANLEVEL:', '^AUDEND:', '+CBM:', '+CBMI:', '+CCWA:', '+CDS:', '+CDSI:',
  '^CEND:', '+CEREG:', '+CGREG:', '+CLIP:', '+CMT:', '+CMTI:', '^CONF:',
  '^CONN:', '^CPBREADY:', '+CREG:', '^CRSSI:', '^CSNR:', '+CSSI:', '+CSSU:',
  '+CTZV:', '+CUSATEND:', '+CUSATP:', '+C5GREG:', '^DATASETRULT:', '^DSDORMANT:',
  '^DSFLOWRPT:', '^ECLREC:', '^EFSSTATE:', '^ERRRPT:', '^FOTASTATE:', '^FWLSTATE:',
  '^MODE:', '^NDISSTAT:', '^NISMSFWD:', '^NWNAME:', '^NWTIME:',
  '^ORIG:', '^RFSWITCH:', '^RSSILVL:', '^SIMRESET:', '^SIMST:', '^SMMEMFULL:',
  '^SRVST:', '^STIN:', '^SUPLCONN:', '^THERM:', '^THERMEX:', '^WAKEUPIN:',
  '+XADPCLKFREQINFO:', '^XDSTATUS:', '+XTS:', '^USIMMEX:', '^USIMICCID:',
  '^LCACELLURC:', '^PLMN:', '^IMSSRVSTATUS:', '^DCONN:', '^DSAMBR:', '^REJINFO',
  '+CUSD:', '^LENDC:',
];

export function isUnsolicitedText(text: string): boolean {
  return URC_KEYWORDS.some((keyword) => text.includes(keyword));
}
