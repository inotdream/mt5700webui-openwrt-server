export const MOCK_SMS_CACHE_KEY = 'sms_sent_messages_cache_mock';

export interface MockCommandResponse {
  success: boolean;
  data?: string;
  error?: string;
}

interface MockLockItem {
  band: number;
  arfcn?: string;
  scs?: number;
  pci?: string;
}

interface MockLockConfig {
  lockType: number;
  mobility: number;
  items: MockLockItem[];
}

interface MockPDPContext {
  cid: number;
  type: string;
  apn: string;
  address: string;
  active: boolean;
}

interface MockReceivedSMS {
  index: number;
  pdu: string;
}

export interface MockPDCPData {
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

export interface MockModemState {
  cfun: number;
  imei: string;
  simSlot: number;
  simHotPlug: boolean;
  pinEnabled: boolean;
  nicRate: number;
  powerControl: boolean;
  nrCa: boolean;
  nrVonr: number;
  nrDss: { rateMatchingLTE: number; additionalDMRS: number };
  sysCfg: {
    acqorder: string;
    band: string;
    roam: number;
    srvdomain: number;
    lteband: string;
  };
  therm: {
    enabled: boolean;
    caMimoSwitch: boolean;
    interval: number;
  };
  imsOn: boolean;
  smsFormat: number;
  smsCenter: string;
  smsStorage: { read: string; write: string; receive: string; total: number };
  receivedSMS: MockReceivedSMS[];
  sentSequence: number;
  dial: {
    enabled: number;
    mode: number;
    protocol: string;
    apn: string;
    username: string;
    password: string;
    authType: number;
  };
  usbMode: number;
  interfaceMode: number;
  postRoute: number;
  dmzHost: string;
  pdpContexts: MockPDPContext[];
  lteLock: MockLockConfig;
  nrLock: MockLockConfig;
  option5g: {
    nrSaSupportFlag: number;
    nrDcMode: number;
    gcAccessMode: number;
  };
  flow: {
    lastDsTime: number;
    lastTxFlow: number;
    lastRxFlow: number;
    totalDsTime: number;
    totalTxFlow: number;
    totalRxFlow: number;
  };
  metricTick: number;
  fota: {
    phase: 'idle' | 'checking' | 'downloading' | 'downloaded' | 'updating';
    queryCount: number;
    progress: number;
    url: string;
  };
}

const RECEIVED_SMS: MockReceivedSMS[] = [
  {
    index: 1,
    pdu: '00000D91683108108300F00008628062801000231E6D4191CF7EDF8BA15DF24E8E4ECA65E596F670B981EA52A8523765B03002',
  },
  {
    index: 2,
    pdu: '00000D91683108108300F00008628062905100231C8BBE59075DF26210529F63A5516500200035004700207F517EDC3002',
  },
  {
    index: 3,
    pdu: '00000791680180F600086280526124002340672C67085957991052694F596D4191CF0020003100320038002E003600470042FF0C67096548671F81F300200030003800206708002000330031002065E53002',
  },
  {
    index: 4,
    pdu: '00000D91683119325476F8000862804271820023345DE168C06E0553555DF27ECF53D152307FA491CCFF0C73B0573A91CD70B9770B00200035004700204FE153F7548C6E295EA63002',
  },
  {
    index: 5,
    pdu: '00000D91683119325476F8000862804281600023284ECA665A00200037002070B95230673A623F5DE168C0FF0C8BB05F975E266D4B8BD5753581113002',
  },
];

const MOCK_SENT_MESSAGES = [
  {
    index: -101,
    content: '收到，我会提前 10 分钟到。',
    number: '13912345678',
    time: '26/08/24,18:10:00',
    type: 'sent',
  },
  {
    index: -102,
    content: '网络状态已确认，当前运行正常。',
    number: '13800138000',
    time: '26/08/26,09:18:00',
    type: 'sent',
  },
];

const ok = (data: string = 'OK'): MockCommandResponse => ({ success: true, data });

const splitArguments = (raw: string): string[] => {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (const char of raw) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
};

const toHex = (value: number): string => Math.max(0, Math.floor(value)).toString(16).toUpperCase();

const formatLockResponse = (prefix: '^LTEFREQLOCK' | '^NRFREQLOCK', config: MockLockConfig): string => {
  if (config.lockType === 0) return `${prefix}: 0\nOK`;
  const lines = [`${prefix}: ${config.lockType}`, `${config.mobility},${config.items.length}`];
  config.items.forEach((item) => {
    if (prefix === '^LTEFREQLOCK') {
      if (config.lockType === 3) lines.push(`${item.band}`);
      else if (config.lockType === 1) lines.push(`${item.band},${item.arfcn || ''}`);
      else lines.push(`${item.band},${item.arfcn || ''},${item.pci || ''}`);
      return;
    }
    if (config.lockType === 3) lines.push(`${item.band}`);
    else if (config.lockType === 1) lines.push(`${item.band},${item.arfcn || ''},${item.scs ?? 1}`);
    else lines.push(`${item.band},${item.arfcn || ''},${item.scs ?? 1},${item.pci || ''}`);
  });
  lines.push('OK');
  return lines.join('\n');
};

const updateLockConfig = (
  raw: string,
  type: 'LTE' | 'NR',
  current: MockLockConfig,
): MockLockConfig => {
  const args = splitArguments(raw);
  const lockType = Number(args[0]);
  if (!Number.isFinite(lockType)) return current;
  if (lockType === 0) return { lockType: 0, mobility: 0, items: [] };

  const mobility = Number(args[1]) || 0;
  const count = Number(args[2]) || 0;
  const bands = (args[3] || '').split(',').map(Number);
  const arfcns = (args[4] || '').split(',');
  const scsOrPci = (args[5] || '').split(',');
  const pcis = (args[6] || '').split(',');
  const items: MockLockItem[] = [];

  for (let index = 0; index < count; index += 1) {
    if (!Number.isFinite(bands[index])) continue;
    if (type === 'LTE') {
      items.push({
        band: bands[index],
        ...(lockType !== 3 ? { arfcn: arfcns[index] || '' } : {}),
        ...(lockType === 2 ? { pci: scsOrPci[index] || '' } : {}),
      });
    } else {
      items.push({
        band: bands[index],
        ...(lockType !== 3
          ? { arfcn: arfcns[index] || '', scs: Number(scsOrPci[index]) || 0 }
          : {}),
        ...(lockType === 2 ? { pci: pcis[index] || '' } : {}),
      });
    }
  }

  return { lockType, mobility, items };
};

const formatCMGL = (messages: MockReceivedSMS[]): string => {
  if (messages.length === 0) return 'NO SMS';
  const lines: string[] = [];
  messages.forEach((message) => {
    lines.push(`+CMGL: ${message.index},1,,${Math.floor(message.pdu.length / 2)}`);
    lines.push(message.pdu);
  });
  lines.push('OK');
  return lines.join('\n');
};

const formatPDPContexts = (state: MockModemState): string =>
  [
    ...state.pdpContexts
      .sort((a, b) => a.cid - b.cid)
      .map(
        (context) =>
          `+CGDCONT: ${context.cid},"${context.type}","${context.apn}","${context.address}",0,0`,
      ),
    'OK',
  ].join('\n');

const formatPDPActivation = (state: MockModemState): string =>
  [
    ...state.pdpContexts
      .sort((a, b) => a.cid - b.cid)
      .map((context) => `+CGACT: ${context.cid},${context.active ? 1 : 0}`),
    'OK',
  ].join('\n');

const getFotaState = (state: MockModemState): number => {
  if (state.fota.phase === 'idle') return 10;
  if (state.fota.phase === 'checking') {
    state.fota.queryCount += 1;
    if (state.fota.queryCount === 1) return 11;
    if (state.fota.queryCount === 2) return 12;
    state.fota.phase = 'downloading';
    return 30;
  }
  if (state.fota.phase === 'downloading') {
    if (state.fota.progress >= 100) {
      state.fota.phase = 'downloaded';
      return 40;
    }
    return 30;
  }
  if (state.fota.phase === 'downloaded') return 40;
  return 50;
};

// 演示用的定时锁频配置。真实环境下这份 JSON 由后端从 UCI 读出来
// （at-webserver/src/schedconfig.go），这里照它的结构给一份，好让面板能显示。
export const createMockSchedule = () => ({
  enabled: true,
  check_interval: 60,
  timeout: 180,
  unlock_lte: true,
  unlock_nr: true,
  toggle_airplane: true,
  night: {
    enabled: true,
    start: '23:00',
    end: '07:00',
    lte: { type: 3, bands: '3,8', arfcns: '', scs_types: '', pcis: '' },
    nr: { type: 2, bands: '78', arfcns: '633888', scs_types: '1', pcis: '100' },
  },
  day: {
    enabled: true,
    lte: { type: 0, bands: '', arfcns: '', scs_types: '', pcis: '' },
    nr: { type: 1, bands: '41', arfcns: '504990', scs_types: '1', pcis: '' },
  },
  status: {
    current_mode: '日间',
    next_switch: '23:00',
    switch_count: 3,
    applied: true,
  },
});

// 手册 5.35 的扫频结果样例，字段数按手册示例给（末尾空字段省略）。
export const MOCK_SCAN_CELLS = [
  '^CELLSCAN: 3,"46000",504990,334,29,5A01,1F23,,,,1,-85,-11,20,',
  '^CELLSCAN: 3,"46000",633888,100,4E,5A01,1F24,,,,1,-95,-13,12,',
  '^CELLSCAN: 3,"46001",627264,201,4E,5A03,3F02,,,,1,-102,-15,4,',
  '^CELLSCAN: 2,"46001",41332,177,29,5A02,2F10,-98,,,,,,,60',
  '^CELLSCAN: 2,"46000",1850,55,3,5A04,2F55,-105,,,,,,,32',
];

/** 读取演示模式的附加参数，支持写在 ?a=b 或 #/path?a=b 两处。 */
const mockParam = (name: string): string => {
  if (typeof window === 'undefined') return '';
  const search = new URLSearchParams(window.location.search).get(name);
  if (search) return search;
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  return new URLSearchParams(hashQuery).get(name) || '';
};

export const isMockModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const searchEnabled = new URLSearchParams(window.location.search).get('mock') === '1';
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  return searchEnabled || new URLSearchParams(hashQuery).get('mock') === '1';
};

export const seedMockSentMessages = (): void => {
  if (typeof window === 'undefined' || !isMockModeEnabled()) return;
  if (localStorage.getItem(MOCK_SMS_CACHE_KEY) === null) {
    localStorage.setItem(MOCK_SMS_CACHE_KEY, JSON.stringify(MOCK_SENT_MESSAGES));
  }
};

export const createMockModemState = (): MockModemState => ({
  cfun: 1,
  imei: '861234567890123',
  simSlot: 0,
  simHotPlug: true,
  pinEnabled: false,
  nicRate: 2,
  powerControl: true,
  nrCa: true,
  nrVonr: 3,
  nrDss: { rateMatchingLTE: 0, additionalDMRS: 0 },
  sysCfg: {
    acqorder: '08030201',
    band: '3FFFFFFF',
    roam: 1,
    srvdomain: 2,
    lteband: '7FFFFFFFFFFFFFFF',
  },
  therm: { enabled: true, caMimoSwitch: true, interval: 2 },
  imsOn: true,
  smsFormat: 0,
  smsCenter: '+8613800138000',
  smsStorage: { read: 'SM', write: 'SM', receive: 'SM', total: 50 },
  receivedSMS: RECEIVED_SMS.map((message) => ({ ...message })),
  sentSequence: 42,
  dial: {
    enabled: 1,
    mode: 2,
    protocol: 'IPV4V6',
    apn: 'cmnet',
    username: '',
    password: '',
    authType: 0,
  },
  usbMode: 1,
  interfaceMode: 2,
  postRoute: 1,
  dmzHost: '192.168.8.100',
  pdpContexts: [
    { cid: 1, type: 'IPV4V6', apn: 'cmnet', address: '10.23.48.2', active: true },
    { cid: 5, type: 'IPV4V6', apn: 'ims', address: '0.0.0.0', active: true },
    { cid: 8, type: 'IP', apn: '3gnet', address: '10.23.48.3', active: false },
  ],
  lteLock: {
    lockType: 2,
    mobility: 0,
    items: [{ band: 3, arfcn: '1650', pci: '101' }],
  },
  nrLock: {
    lockType: 2,
    mobility: 0,
    items: [{ band: 78, arfcn: '636648', scs: 1, pci: '506' }],
  },
  option5g: { nrSaSupportFlag: 1, nrDcMode: 3, gcAccessMode: 2 },
  flow: {
    lastDsTime: 3600,
    lastTxFlow: 38 * 1024 * 1024,
    lastRxFlow: 1630 * 1024 * 1024,
    totalDsTime: 12 * 86400 + 8 * 3600 + 26 * 60,
    totalTxFlow: Math.floor(16.4 * 1024 * 1024 * 1024),
    totalRxFlow: Math.floor(128.6 * 1024 * 1024 * 1024),
  },
  metricTick: 0,
  fota: { phase: 'idle', queryCount: 0, progress: 0, url: '' },
});

export const createMockPDCPData = (sequence: number): MockPDCPData => {
  const downlinkRates = [2850000, 4120000, 6380000, 5240000, 7810000, 4560000];
  const uplinkRates = [380000, 640000, 910000, 720000, 1180000, 560000];
  const index = sequence % downlinkRates.length;
  const timestamp = Date.now();
  return {
    id: sequence + 1,
    pduSessionId: 1,
    discardTimerLen: 100,
    avgDelay: 8 + (sequence % 4),
    minDelay: 3,
    maxDelay: 18 + (sequence % 6),
    highPriQueMaxBuffTime: 4,
    lowPriQueMaxBuffTime: 7,
    highPriQueBuffPktNums: 2 + (sequence % 3),
    lowPriQueBuffPktNums: 4 + (sequence % 5),
    ulPdcpRate: uplinkRates[index],
    dlPdcpRate: downlinkRates[index],
    ulDiscardCnt: 0,
    dlDiscardCnt: sequence % 11 === 0 ? 1 : 0,
    timestamp1: timestamp,
    timestamp2: timestamp,
  };
};

export const resolveMockATCommand = (
  command: string,
  state: MockModemState,
): MockCommandResponse => {
  const normalized = command.replace(/\x1A/g, '').trim();
  const commandLine = normalized.split(/[\r\n]/)[0].trim();

  if (commandLine === 'AT' || commandLine === 'ATE0') return ok();
  if (commandLine === 'ATI') {
    return ok('Manufacturer: Quectel\nModel: MT5700M-CN\nRevision: M5700MCNCBR02A02T1G\nOK');
  }
  if (commandLine === 'AT+CGMR') return ok('M5700MCNCBR02A02T1G\nOK');
  if (commandLine === 'AT+CGSN') return ok(`${state.imei}\nOK`);
  if (commandLine === 'AT+CONNECT?') return ok('+CONNECT: 0\nOK');
  if (commandLine === 'AT+CSQ') return ok('+CSQ: 27,99\nOK');
  if (commandLine === 'AT+CREG?') return ok('+CREG: 2,1,"5A01","1F23",7\nOK');
  if (commandLine === 'AT+CGREG?') return ok('+CGREG: 2,1,"5A01","1F23",7\nOK');
  if (commandLine === 'AT^NWTIME?') return ok('^NWTIME: 26/08/26,14:28:36+32,0\nOK');
  // 演示模式下可以用 ?simlock=pin / puk 模拟一张被锁的卡，看解锁弹窗的效果。
  const simLock = mockParam('simlock');
  if (commandLine === 'AT+CPIN?') {
    if (simLock === 'pin') return ok('+CPIN: SIM PIN\nOK');
    if (simLock === 'puk') return ok('+CPIN: SIM PUK\nOK');
    return ok('+CPIN: READY\nOK');
  }
  // 手册 6.6.3：11 表示卡初始化完成、可接入网络；2 表示卡被 PIN/PUK 锁定。
  if (commandLine === 'AT^SIMSQ?') {
    return ok(simLock ? '^SIMSQ: 1,2\nOK' : '^SIMSQ: 1,11\nOK');
  }
  if (commandLine.startsWith('AT+CPIN=')) {
    // 手册 20.2：16 = incorrect password，CMEE=2 下回的是描述字符串
    const args = commandLine.slice('AT+CPIN='.length).split(',').map((v) => v.trim().replace(/"/g, ''));
    const expected = simLock === 'puk' ? '12345678' : '1234';
    return args[0] === expected ? ok() : { success: false, error: '+CME ERROR: incorrect password' };
  }

  // 手册 13.27：NSA 辅连接服务小区，2CC；PCI 为十六进制。
  // 两条频点都能对上 ^HFREQINFO 报的 NR 载波，信号会并进各自的载波卡片。
  if (commandLine === 'AT^MONSSC') {
    return ok('^MONSSC: NR,636648,64,-70,-20,-10,0\n^MONSSC: NR,633400,2,-68,-10,1,1\nOK');
  }
  // 手册 13.18：LTE CA 辅小区
  if (commandLine === 'AT^CASCELLINFO?') {
    return ok('^CASCELLINFO: 1,417,-60,-80,-5,3,23925,1650,8225,8675,5,5\nOK');
  }
  // 手册 11.7：查询应答比 URC 多一个 enable 字段
  if (commandLine === 'AT^LENDC?') return ok('^LENDC: 1,1,1,1,1\nOK');
  // 手册 5.27：第一个字段是上报模式，不是注册状态
  if (commandLine === 'AT+C5GREG?') {
    return ok('+C5GREG: 2,1,"0000C3","000000010000001A",11,4,"01.010203"\nOK');
  }
  // 手册 13.23：4G 下 stxpwr 填无效值 999
  if (commandLine === 'AT^TXPOWER?') return ok('^TXPOWER: 999,21,18,20,23\nOK');
  // 手册 13.24：每 5 个字段一个载波
  if (commandLine === 'AT^NTXPOWER?') return ok('^NTXPOWER: 23,3,23,22,3549720,21,2,20,21,2593330\nOK');
  // 手册 7.8.5：IPv6 用 16 个点分十进制字节表示
  if (commandLine === 'AT+CGPADDR') {
    return ok(
      '+CGPADDR: 8,"10.101.2.15"\n' +
        '+CGPADDR: 9,"32.8.0.2.0.2.0.1.255.255.255.255.255.255.255.255"\nOK',
    );
  }

  // 定时锁频配置：真实环境里由后端拦下这条伪命令，从 UCI 读写
  if (commandLine === 'AT+SCHED?') {
    return ok(`+SCHED: ${JSON.stringify(createMockSchedule())}\r\nOK`);
  }
  if (commandLine.startsWith('AT+SCHED=')) return ok('+SCHED: OK\r\nOK');

  if (commandLine === 'AT^HCSQ?') {
    return ok(
      '^HCSQ: "LTE",54,24,45,155\n^HCSQ: "NR",58,165,22,65535\nOK',
    );
  }
  if (commandLine === 'AT^EONS=2') return ok('^EONS: 1,46000,"CMCC","中国移动",3\nOK');
  if (commandLine === 'AT^MONSC') {
    return ok('^MONSC: NR,460,00,636648,0,10321,1FA,2F01,-82,-9\nOK');
  }
  if (commandLine === 'AT^HFREQINFO?') {
    // 3CC 演示：NR n78 主载波 + NR n78 辅载波 + LTE B3 辅载波，
    // 频点与 ^MONSSC / ^CASCELLINFO 一一对应，信号并进各自的载波卡片
    return ok(
      '^HFREQINFO: 1,7,78,636648,3549720,100000,650048,3750720,100000,78,633400,3501000,100000,633400,3501000,100000\n' +
        '^HFREQINFO: 2,4,3,1650,184500,20000,19650,175000,20000\nOK',
    );
  }
  if (commandLine === 'AT^DSAMBR=1' || commandLine === 'AT^DSAMBR=8') {
    return ok('^DSAMBR: 8,500000,100000,"cmnet"\nOK');
  }
  if (commandLine === 'AT+CGEQOSRDP=8' || commandLine === 'AT+CGEQOSRDP=1') {
    return ok('+CGEQOSRDP: 8,9,0,0,0,0,0,0,0,0,0,0\nOK');
  }
  if (commandLine === 'AT^DHCPV6?') {
    return ok(
      '^DHCPV6: 2409:8a1e:3a20:120::2,ffff:ffff:ffff:ffff::,fe80::1,fe80::1,2409:8088::a,2409:8088::b\nOK',
    );
  }
  if (commandLine === 'AT^DHCP?') {
    return ok('^DHCP: 0230170A,00FFFFFF,0130170A,0130170A,050505DF,1D1D1D77\nOK');
  }
  if (commandLine === 'AT^IPV6CAP?') return ok('^IPV6CAP: 7\nOK');
  if (commandLine === 'AT^DSFLOWQRY') {
    const bump = 4 * 1024 * 1024 + (state.metricTick % 4) * 1024 * 1024;
    state.metricTick += 1;
    state.flow.lastDsTime += 5;
    state.flow.lastTxFlow = Math.floor(bump * 0.16);
    state.flow.lastRxFlow = bump;
    state.flow.totalDsTime += 5;
    state.flow.totalTxFlow += state.flow.lastTxFlow;
    state.flow.totalRxFlow += state.flow.lastRxFlow;
    return ok(
      `^DSFLOWQRY: ${toHex(state.flow.lastDsTime)},${toHex(state.flow.lastTxFlow)},${toHex(
        state.flow.lastRxFlow,
      )},${toHex(state.flow.totalDsTime)},${toHex(state.flow.totalTxFlow)},${toHex(
        state.flow.totalRxFlow,
      )}\nOK`,
    );
  }
  if (commandLine === 'AT^DSFLOWCLR') {
    state.flow = {
      lastDsTime: 0,
      lastTxFlow: 0,
      lastRxFlow: 0,
      totalDsTime: 0,
      totalTxFlow: 0,
      totalRxFlow: 0,
    };
    return ok();
  }
  if (commandLine === 'AT^CHIPTEMP?') {
    const drift = state.metricTick % 3;
    return ok(
      `^CHIPTEMP: ${432 + drift},${445 + drift},${451 + drift},398,401,407,${
        428 + drift
      },431,${439 + drift},442,419,423\nOK`,
    );
  }
  if (commandLine === 'AT^MCS=1') {
    return ok('^MCS: 1,1,0,25,23,1,21,19\n^MCS: 2,0,0,18,17\nOK');
  }
  if (commandLine === 'AT^MCS=0') return ok('^MCS: 1,1,0,18,16,1,16,14\nOK');

  if (commandLine === 'AT^LTEFREQLOCK?') {
    return ok(formatLockResponse('^LTEFREQLOCK', state.lteLock));
  }
  if (commandLine === 'AT^NRFREQLOCK?') {
    return ok(formatLockResponse('^NRFREQLOCK', state.nrLock));
  }
  if (commandLine.startsWith('AT^LTEFREQLOCK=')) {
    state.lteLock = updateLockConfig(commandLine.slice('AT^LTEFREQLOCK='.length), 'LTE', state.lteLock);
    return ok();
  }
  if (commandLine.startsWith('AT^NRFREQLOCK=')) {
    state.nrLock = updateLockConfig(commandLine.slice('AT^NRFREQLOCK='.length), 'NR', state.nrLock);
    return ok();
  }
  if (commandLine === 'AT^C5GOPTION?') {
    const value = state.option5g;
    return ok(`^C5GOPTION: ${value.nrSaSupportFlag},${value.nrDcMode},${value.gcAccessMode}\nOK`);
  }
  if (commandLine.startsWith('AT^C5GOPTION=')) {
    const values = commandLine.slice('AT^C5GOPTION='.length).split(',').map(Number);
    if (values.length >= 3) {
      state.option5g = {
        nrSaSupportFlag: values[0],
        nrDcMode: values[1],
        gcAccessMode: values[2],
      };
    }
    return ok();
  }
  if (commandLine === 'AT^MONNC') {
    return ok(
      '^MONNC: LTE,1650,0065,-88,-10,46\n' +
        '^MONNC: LTE,37900,012C,-96,-13,34\n' +
        '^MONNC: NR,636648,01FA,-656,-72,112\n' +
        '^MONNC: NR,632448,0087,-720,-88,80\nOK',
    );
  }
  if (commandLine === 'AT^NRSSBID?') {
    return ok(
      '^NRSSBID: 636648,1A2B3C,506,85,50,1,0,90,1,80,2,70,3,60,255,32767,255,32767,255,32767,255,32767,1,506,632448,88,45,0,90,1,80,2,70,255,32767\nOK',
    );
  }

  if (commandLine === 'AT^SETAUTODIAL?') {
    const value = state.dial;
    return ok(
      `^SETAUTODIAL:${value.enabled},${value.mode},"${value.protocol}","${value.apn}","${value.username}","${value.password}",${value.authType}\nOK`,
    );
  }
  if (commandLine.startsWith('AT^SETAUTODIAL=')) {
    const args = splitArguments(commandLine.slice('AT^SETAUTODIAL='.length));
    state.dial.enabled = Number(args[0]) || 0;
    if (args[1] !== undefined && args[1] !== '') state.dial.mode = Number(args[1]) || 2;
    if (args.length >= 7) {
      state.dial.protocol = args[2] || state.dial.protocol;
      state.dial.apn = args[3] || '';
      state.dial.username = args[4] || '';
      state.dial.password = args[5] || '';
      state.dial.authType = Number(args[6]) || 0;
    }
    return ok();
  }
  if (commandLine === 'AT^SETMODE?') return ok(String(state.usbMode));
  if (commandLine.startsWith('AT^SETMODE=')) {
    state.usbMode = Number(commandLine.slice('AT^SETMODE='.length)) || 0;
    return ok();
  }
  if (commandLine === 'AT^TDCFG?') {
    return ok(
      `Mode : ${state.interfaceMode}\nPostRoute : ${state.postRoute}\nDmz: ${
        state.dmzHost || 'not cfg'
      }\nOK`,
    );
  }
  if (commandLine.startsWith('AT^TDCFG=')) {
    const args = splitArguments(commandLine.slice('AT^TDCFG='.length));
    const key = (args[1] || '').toLowerCase();
    const value = args[2] || '';
    if (key === 'mode') state.interfaceMode = Number(value) || 0;
    if (key === 'postroute') state.postRoute = Number(value) || 0;
    if (key === 'dmz') state.dmzHost = value === '0' ? '' : value;
    return ok();
  }
  if (commandLine === 'AT+CGDCONT?') return ok(formatPDPContexts(state));
  if (commandLine === 'AT+CGACT?') return ok(formatPDPActivation(state));
  if (commandLine.startsWith('AT+CGDCONT=')) {
    const args = splitArguments(commandLine.slice('AT+CGDCONT='.length));
    const cid = Number(args[0]);
    if (args.length === 1) {
      state.pdpContexts = state.pdpContexts.filter((context) => context.cid !== cid);
      return ok();
    }
    const existing = state.pdpContexts.find((context) => context.cid === cid);
    const next: MockPDPContext = {
      cid,
      type: args[1] || 'IPV4V6',
      apn: args[2] || '',
      address: args[3] || '0.0.0.0',
      active: existing?.active || false,
    };
    state.pdpContexts = [...state.pdpContexts.filter((context) => context.cid !== cid), next];
    return ok();
  }
  if (commandLine.startsWith('AT+CGACT=')) {
    const [active, cid] = commandLine.slice('AT+CGACT='.length).split(',').map(Number);
    const context = state.pdpContexts.find((item) => item.cid === cid);
    if (context) context.active = active === 1;
    return ok();
  }

  if (commandLine === 'AT^SCICHG?') return ok(`^SCICHG: ${state.simSlot},${1 - state.simSlot}\nOK`);
  if (commandLine.startsWith('AT^SCICHG=')) {
    state.simSlot = Number(commandLine.slice('AT^SCICHG='.length).split(',')[0]) || 0;
    return ok();
  }
  if (commandLine === 'AT^TDSIMHP?') return ok(`^TDSIMHP: ${state.simHotPlug ? 1 : 0}\nOK`);
  if (commandLine.startsWith('AT^TDSIMHP=')) {
    state.simHotPlug = commandLine.endsWith('=1');
    return ok();
  }
  if (commandLine === 'AT+CLCK="SC",2') return ok(`+CLCK: ${state.pinEnabled ? 1 : 0}\nOK`);
  if (/^AT\+CLCK="SC",[01],/.test(commandLine)) {
    state.pinEnabled = commandLine.startsWith('AT+CLCK="SC",1,');
    return ok();
  }
  if (commandLine === 'AT+CFUN?') return ok(`+CFUN: ${state.cfun}\nOK`);
  if (commandLine.startsWith('AT+CFUN=')) {
    state.cfun = Number(commandLine.slice('AT+CFUN='.length)) || 0;
    return ok();
  }
  if (commandLine === 'AT^TDPCIELANCFG?') return ok(`^TDPCIELANCFG: ${state.nicRate}\nOK`);
  if (commandLine.startsWith('AT^TDPCIELANCFG=')) {
    state.nicRate = Number(commandLine.slice('AT^TDPCIELANCFG='.length)) || 1;
    return ok();
  }
  if (commandLine === 'AT^TDPMCFG?') return ok(`^TDPMCFG: ${state.powerControl ? 1 : 0}\nOK`);
  if (commandLine.startsWith('AT^TDPMCFG=')) {
    state.powerControl = commandLine.endsWith('=1');
    return ok();
  }
  if (commandLine === 'AT^NRRCCAPQRY=3') return ok(`^NRRCCAPQRY: 3,${state.nrCa ? 1 : 0}\nOK`);
  if (commandLine === 'AT^NRRCCAPQRY=2') return ok(`^NRRCCAPQRY: 2,${state.nrVonr}\nOK`);
  if (commandLine === 'AT^NRRCCAPQRY=5') {
    return ok(
      `^NRRCCAPQRY: 5,${state.nrDss.rateMatchingLTE},${state.nrDss.additionalDMRS}\nOK`,
    );
  }
  if (commandLine.startsWith('AT^NRRCCAPCFG=3,')) {
    state.nrCa = commandLine.endsWith(',1');
    return ok();
  }
  if (commandLine.startsWith('AT^NRRCCAPCFG=2,')) {
    state.nrVonr = Number(commandLine.split(',')[1]) || 0;
    return ok();
  }
  if (commandLine.startsWith('AT^NRRCCAPCFG=5,')) {
    const values = commandLine.split(',').slice(1).map(Number);
    state.nrDss = { rateMatchingLTE: values[0] || 0, additionalDMRS: values[1] || 0 };
    return ok();
  }
  if (commandLine === 'AT^SYSCFGEX?') {
    const value = state.sysCfg;
    return ok(
      `^SYSCFGEX: "${value.acqorder}",${value.band},${value.roam},${value.srvdomain},${value.lteband},\nOK`,
    );
  }
  if (commandLine.startsWith('AT^SYSCFGEX=')) {
    const args = splitArguments(commandLine.slice('AT^SYSCFGEX='.length));
    if (args.length >= 5) {
      state.sysCfg = {
        acqorder: args[0],
        band: args[1],
        roam: Number(args[2]) || 0,
        srvdomain: Number(args[3]) || 0,
        lteband: args[4],
      };
    }
    return ok();
  }
  if (commandLine === 'AT^NTXPOWER?') {
    return ok('^NTXPOWER: 23,21,20,19,3720,22,20,18,17,3550\nOK');
  }
  if (commandLine === 'AT^THERMAUTOFUN?') {
    return ok(
      `^THERMAUTOFUN: ${state.therm.enabled ? 1 : 0} ${
        state.therm.caMimoSwitch ? 1 : 0
      } ${state.therm.interval}\nOK`,
    );
  }
  if (commandLine.startsWith('AT^THERMAUTOFUN=')) {
    const values = commandLine.slice('AT^THERMAUTOFUN='.length).split(',').map(Number);
    if (values.length >= 3) {
      state.therm = {
        enabled: values[0] === 1,
        caMimoSwitch: values[1] === 1,
        interval: values[2],
      };
    }
    return ok();
  }
  if (commandLine === 'AT^THERMLDLOGSW?') return ok('^THERMLDLOGSW: 1 1\nOK');
  if (commandLine === 'AT^THERMLDAUTOPARA?') return ok('^THERMLDAUTOPARA: 55,60,65,70,75,80\nOK');
  if (commandLine === 'AT^THERMLDAUTOSTATUS?') return ok('^THERMLDAUTOSTATUS: 1,2,3,4,5,1\nOK');
  if (commandLine.startsWith('AT^PHYNUM=IMEI,')) {
    state.imei = commandLine.slice('AT^PHYNUM=IMEI,'.length).trim();
    return ok();
  }

  if (commandLine === 'AT^IMSSWITCH?') return ok(`^IMSSWITCH: ${state.imsOn ? 1 : 0},0,0\nOK`);
  if (commandLine.startsWith('AT^IMSSWITCH=')) {
    state.imsOn = commandLine.slice('AT^IMSSWITCH='.length).startsWith('1');
    return ok();
  }
  if (commandLine === 'AT+CMGF?') return ok(`+CMGF: ${state.smsFormat}\nOK`);
  if (commandLine.startsWith('AT+CMGF=')) {
    state.smsFormat = Number(commandLine.slice('AT+CMGF='.length)) || 0;
    return ok();
  }
  if (commandLine === 'AT+CSCA?') return ok(`+CSCA: "${state.smsCenter}",145\nOK`);
  if (commandLine.startsWith('AT+CSCA=')) {
    const match = commandLine.match(/AT\+CSCA="([^"]+)"/);
    if (match) state.smsCenter = match[1];
    return ok();
  }
  if (commandLine === 'AT+CPMS?') {
    const used = state.receivedSMS.length;
    const storage = state.smsStorage;
    return ok(
      `+CPMS: "${storage.read}",${used},${storage.total},"${storage.write}",${used},${
        storage.total
      },"${storage.receive}",${used},${storage.total}\nOK`,
    );
  }
  if (commandLine.startsWith('AT+CPMS=')) {
    const values = splitArguments(commandLine.slice('AT+CPMS='.length)).filter(Boolean);
    state.smsStorage = {
      ...state.smsStorage,
      read: values[0] || state.smsStorage.read,
      write: values[1] || values[0] || state.smsStorage.write,
      receive: values[2] || values[0] || state.smsStorage.receive,
    };
    return ok();
  }
  if (commandLine === 'AT+CMGL=4') return ok(formatCMGL(state.receivedSMS));
  if (commandLine.startsWith('AT+CMGR=')) {
    const index = Number(commandLine.slice('AT+CMGR='.length));
    const message = state.receivedSMS.find((item) => item.index === index);
    return message ? ok(`+CMGR: 1,,${Math.floor(message.pdu.length / 2)}\n${message.pdu}\nOK`) : ok('NO SMS');
  }
  if (commandLine === 'AT+CMGD=1,4') {
    state.receivedSMS = [];
    return ok();
  }
  if (commandLine.startsWith('AT+CMGD=')) {
    const index = Number(commandLine.slice('AT+CMGD='.length).split(',')[0]);
    state.receivedSMS = state.receivedSMS.filter((message) => message.index !== index);
    return ok();
  }
  if (commandLine.startsWith('AT+CMGS=')) {
    state.sentSequence += 1;
    return ok(`+CMGS: ${state.sentSequence}\nOK`);
  }

  if (commandLine === 'AT^FOTASTATE?') return ok(`^FOTASTATE: ${getFotaState(state)}\nOK`);
  if (commandLine.startsWith('AT^FOTAOEMDL=')) {
    const match = commandLine.match(/AT\^FOTAOEMDL="([^"]+)"/);
    state.fota = {
      phase: 'checking',
      queryCount: 0,
      progress: 0,
      url: match?.[1] || '',
    };
    return ok();
  }
  if (commandLine === 'AT^FOTADLQ') {
    if (state.fota.phase === 'downloading') {
      const increments = [17, 22, 26, 19, 16];
      const increment = increments[Math.min(state.fota.queryCount, increments.length - 1)] || 18;
      state.fota.queryCount += 1;
      state.fota.progress = Math.min(100, state.fota.progress + increment);
    }
    return ok(`^FOTADLQ: 100,${state.fota.progress}\nOK`);
  }
  if (commandLine === 'AT^FOTADL=1') {
    state.fota.phase = 'downloading';
    return ok();
  }
  if (commandLine === 'AT^FWUP') {
    state.fota.phase = 'updating';
    return ok();
  }

  if (
    commandLine.startsWith('AT^PDCPDATAINFO=') ||
    commandLine === 'AT^FOTAMODE=0,1,0,1' ||
    commandLine === 'AT+CEUS=0' ||
    commandLine === 'AT+CEUS=1' ||
    commandLine === 'AT^IPFILTERSWITCH=0' ||
    commandLine === 'AT^HVSST=1,0' ||
    commandLine === 'AT^HVSST=1,1' ||
    commandLine === 'AT^RESET' ||
    commandLine === 'AT&F' ||
    commandLine.startsWith('AT+CPIN=') ||
    commandLine.startsWith('AT+CPWD=') ||
    commandLine.startsWith('ATD') ||
    commandLine === 'ATA' ||
    commandLine === 'ATH' ||
    commandLine === 'AT+CHUP'
  ) {
    return ok();
  }

  return ok(`MOCK: ${commandLine}\nOK`);
};
