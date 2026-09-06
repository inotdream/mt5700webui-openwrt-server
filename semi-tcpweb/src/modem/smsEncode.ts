import * as PDU from 'node-pdu';

// 发送短信的 PDU 编码。
//
// 这里直接用 node-pdu 拼 SMS-SUBMIT，而不是自己拼字节：项目里原本那份手写实现
// 的 GSM 7bit 打包方向是反的（3GPP 23.038 要求低位在前），而且完全没有长度概念，
// 超过一条的短信会拼出非法 PDU，发送时只报一句"发送失败"。
// node-pdu 已经是依赖（收短信时用它解析），编码侧复用同一套实现最省心，
// 还顺带拿到了自动选字符集与长短信分片。
//
// 有两个坑必须按下面这样写：
//   1. validityPeriod 要配合 SubmitType({ validityPeriodFormat: 2 })。只传
//      validityPeriod 的话，node-pdu 会写入 VP 字节却不置 VPF 标志位，
//      收端按错误的偏移解析，整条短信都是乱码。
//   2. AT+CMGS 要的长度是不含短信中心地址的 TPDU 字节数，SCA 长度得自己减掉；
//      SCA.getOffset() 返回的不是字节数，不能拿来算。

// 相对格式的有效期（3GPP 23.040 TP-VPF=2）。
const VPF_RELATIVE = 2;
const DEFAULT_VALIDITY_SECONDS = 24 * 3600;

export interface SubmitPart {
  /** 完整 PDU（含短信中心地址），直接跟在 AT+CMGS 后面发 */
  pdu: string;
  /** AT+CMGS=<length> 里的长度：TPDU 字节数，不含短信中心地址 */
  tpduLength: number;
}

interface SubmitOptions {
  smsc?: string;
  destination: string;
  message: string;
  validitySeconds?: number;
}

const buildSubmit = (opts: SubmitOptions) => {
  const params: Record<string, unknown> = {
    type: new PDU.utils.SubmitType({ validityPeriodFormat: VPF_RELATIVE }),
    validityPeriod: new PDU.utils.VP({
      interval: opts.validitySeconds ?? DEFAULT_VALIDITY_SECONDS,
    }),
  };

  // 不带短信中心地址时 SCA 为 00，表示用 SIM 卡里配置的那个。
  if (opts.smsc) {
    const sca = new PDU.utils.SCA(true);
    sca.setPhone(opts.smsc, true, true);
    params.serviceCenterAddress = sca;
  }

  return new PDU.Submit(opts.destination, opts.message, params);
};

/** 把一条消息编成待发送的 PDU 分片，长短信会自动拆成多条并带上拼接头。 */
export const buildSubmitParts = (opts: SubmitOptions): SubmitPart[] => {
  const submit = buildSubmit(opts);
  const scaOctets = submit.serviceCenterAddress.toString().length / 2;

  return submit.getPartStrings().map((pdu) => ({
    pdu,
    tpduLength: pdu.length / 2 - scaOctets,
  }));
};

export interface MessageStats {
  /** 实际会用的字符集，中文等非 GSM 字符会自动切到 UCS2 */
  encoding: '7bit' | 'UCS2';
  /** 会拆成几条发送 */
  parts: number;
  chars: number;
}

/**
 * 统计一条消息会怎么发出去，用于输入框旁边的提示。
 * 分片数直接问 node-pdu，保证和真正发送时一致。
 */
export const messageStats = (message: string): MessageStats => {
  if (!message) return { encoding: '7bit', parts: 0, chars: 0 };

  const submit = buildSubmit({ destination: '+10000000000', message });
  // DCS 0x08 是 UCS2（3GPP 23.038）。
  const ucs2 = submit.dataCodingScheme.toString().toUpperCase() === '08';

  return {
    encoding: ucs2 ? 'UCS2' : '7bit',
    parts: submit.getParts().length,
    chars: message.length,
  };
};
