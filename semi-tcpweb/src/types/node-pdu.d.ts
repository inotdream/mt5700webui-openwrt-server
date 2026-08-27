// node-pdu 自带的类型没有暴露解析后对象上的私有字段，而收短信那边要用到
// （_address/_parts 等），所以这里手写一份声明覆盖它。
// 发短信用到的 Submit 及 utils 也一并声明，只列实际用到的成员。
declare module 'node-pdu' {
  export class Deliver {
    _address?: { _phone?: string };
    _data?: {
      getText: () => string;
      _parts?: Array<{
        header?: { ies?: Array<{ data?: { maxMsgNum?: number; msgRef?: number; msgSeqNo?: number } }> };
      }>;
    };
    _serviceCenterTimeStamp?: { time?: number; tzOff?: number };
  }

  export class Submit {
    constructor(address: string, data: string, options?: Record<string, unknown>);
    readonly serviceCenterAddress: { toString(): string };
    readonly dataCodingScheme: { toString(): string };
    /** 长短信会返回多片，每片都是可以直接下发的完整 PDU */
    getPartStrings(): string[];
    getParts(): unknown[];
    toString(): string;
  }

  export namespace utils {
    class SCA {
      constructor(isAddress?: boolean);
      setPhone(phone: string, detectType?: boolean, isServiceCenter?: boolean): this;
      toString(): string;
    }
    class VP {
      constructor(options?: { interval?: number; datetime?: Date });
    }
    class SubmitType {
      constructor(params?: {
        replyPath?: number;
        userDataHeader?: number;
        statusReportRequest?: number;
        validityPeriodFormat?: number;
        rejectDuplicates?: number;
      });
    }
  }

  export function parse(pdu: string): unknown;
}
