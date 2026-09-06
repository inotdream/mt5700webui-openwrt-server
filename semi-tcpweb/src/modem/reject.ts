// 手册 13.14 ^REJINFO-注册或业务请求或网络 DETACH 过程网络拒绝原因值主动上报。
//
// 格式：
//   ^REJINFO:<PLMN ID>,<Service Domain>,<Reject Cause>,<Rat Type>,<Reject Type>,
//            <Original Reject Cause>,<Lac>,<Rac>,<Cell Id>[,<Esm Reject Cause>]
// 举例：
//   ^REJINFO:46000,1,40,2,3,40,"0026F8","FF","0A444202"
//
// 锁频锁错小区导致掉网时，这条上报能直接区分"被网络拒绝"和"根本没覆盖"。

export interface RejectInfo {
  plmn: string;
  domain: number;
  domainText: string;
  cause: number;
  causeText: string;
  rat: number;
  ratText: string;
  rejectType: number;
  rejectTypeText: string;
  originalCause: number;
  lac: string;
  rac: string;
  cellId: string;
  esmCause?: number;
  raw: string;
  at: number;
}

// 手册 13.14.3 <Service Domain>
const DOMAINS: Record<number, string> = { 0: 'CS 域', 1: 'PS 域', 2: 'CS+PS 域' };

// 手册 13.14.3 <Rat Type>
const RATS: Record<number, string> = {
  0: 'GERAN(2G)',
  1: 'UTRAN(3G)',
  2: 'E-UTRAN(4G)',
  5: 'NR-5GC(5G SA)',
  6: '其他',
};

// 手册 13.14.3 <Reject Type>
const REJECT_TYPES: Record<number, string> = {
  0: 'LAU 被拒',
  1: '鉴权失败',
  2: '业务请求被拒',
  3: '网络 detach 被拒',
  4: 'ATTACH 被拒',
  5: 'RAU 被拒',
  6: 'TAU 被拒',
};

// 原因值来自 3GPP TS 24.008 / 24.301 / 24.501；手册只说明"上报协议中明确规定的
// 拒绝原因值"，没有逐条列出，这里按协议给出释义，未收录的原样显示编号。
const CAUSES: Record<number, string> = {
  2: 'IMSI 未在 HSS 登记',
  3: '非法终端',
  5: 'IMEI 不被接受',
  6: '非法设备',
  7: '不允许使用分组域业务',
  8: '不允许使用分组域和非分组域业务',
  9: '网络无法识别终端身份',
  10: '已被网络隐式分离',
  11: '不允许使用该 PLMN',
  12: '不允许在该跟踪区注册',
  13: '该跟踪区不允许漫游',
  14: '该 PLMN 不提供分组域业务',
  15: '跟踪区内没有合适的小区',
  16: 'MSC 暂时不可达',
  17: '网络故障',
  18: 'CS 域不可用',
  19: 'ESM 流程失败',
  20: 'MAC 校验失败',
  21: '同步失败',
  22: '网络拥塞',
  23: '终端安全能力不匹配',
  24: '安全模式被拒绝',
  25: '未授权接入该 CSG',
  26: '非 EPS 鉴权不可接受',
  27: '不允许使用 N1 模式',
  28: '受限的服务区域',
  31: '需要重定向到 4G 核心网',
  35: '该 PLMN 未授权所请求的业务',
  39: 'CS 业务暂时不可用',
  40: '没有激活的 EPS 承载',
  42: '严重网络故障',
  43: 'LADN 不可用',
  62: '没有可用的网络切片',
  65: '已达到 PDU 会话数量上限',
  67: '切片与 DNN 资源不足',
  71: '不允许通过非 3GPP 接入 5G 核心网',
  72: '服务网络未授权',
  95: '消息语义错误',
  96: '必选信元无效',
  97: '消息类型不存在或未实现',
  98: '消息类型与协议状态不匹配',
  99: '信元不存在或未实现',
  100: '条件信元错误',
  101: '消息与协议状态不匹配',
  111: '协议错误',
  // 以下为手册 13.14.2 明确列出的模组内部扩展值
  256: '鉴权失败（模组内部扩展）',
  258: '联合注册中 CS 失败（其他原因）',
  301: 'CS/PS 注册网络无响应',
  302: 'CS/PS 注册建链异常',
  303: 'CS/PS 注册建链异常',
};

// 手册 13.14.2：USIM 鉴权失败的原因值从 65537 开始，共 65537~65543。
const USIM_CAUSE_MIN = 65537;
const USIM_CAUSE_MAX = 65543;

export const rejectCauseText = (cause: number): string => {
  if (CAUSES[cause]) return CAUSES[cause];
  if (cause >= USIM_CAUSE_MIN && cause <= USIM_CAUSE_MAX) return `USIM 鉴权失败（#${cause}）`;
  return `未知原因（#${cause}）`;
};

const unquote = (v: string): string => (v || '').trim().replace(/^"|"$/g, '');

/** 解析一行 ^REJINFO 上报，不匹配时返回 null。手册正文用了全角冒号，两种都收。 */
export const parseRejInfo = (line: string): RejectInfo | null => {
  const match = line.match(/\^REJINFO[：:]\s*(.+)/);
  if (!match) return null;

  const f = match[1].split(',').map((v) => v.trim());
  if (f.length < 6) return null;

  const num = (v: string): number => {
    const n = Number(unquote(v));
    return Number.isFinite(n) ? n : 0;
  };

  const cause = num(f[2]);
  const rat = num(f[3]);
  const domain = num(f[1]);
  const rejectType = num(f[4]);

  return {
    plmn: unquote(f[0]),
    domain,
    domainText: DOMAINS[domain] ?? `域 ${domain}`,
    cause,
    causeText: rejectCauseText(cause),
    rat,
    ratText: RATS[rat] ?? `制式 ${rat}`,
    rejectType,
    rejectTypeText: REJECT_TYPES[rejectType] ?? `类型 ${rejectType}`,
    originalCause: num(f[5]),
    lac: unquote(f[6] || ''),
    rac: unquote(f[7] || ''),
    cellId: unquote(f[8] || ''),
    // 手册：当 LNAS 注册被拒绝 #19 时才会带上这个值。
    esmCause: f[9] !== undefined ? num(f[9]) : undefined,
    raw: line.trim(),
    at: Date.now(),
  };
};
