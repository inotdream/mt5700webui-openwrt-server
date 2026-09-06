import { Toast } from '@douyinfe/semi-ui';
import {
  extractPDCP,
  extractURCs,
  isUnsolicitedText,
  type PDCPData,
  type URCData,
} from '@/modem/urc';
import type { ScanPush } from '@/modem/cellscan';
import {
  createMockModemState,
  createMockPDCPData,
  isMockModeEnabled,
  MOCK_SCAN_CELLS,
  resolveMockATCommand,
  seedMockSentMessages,
  type MockModemState,
} from './mockAT';

export type { PDCPData, URCData } from '@/modem/urc';

// AT指令响应接口
interface PushEventData {
  number?: string;
  sender?: string;
  content?: string;
  time?: string;
  message?: string; // 添加 message 字段用于 memory_full 消息
  state?: string; // 添加 state 字段用于来电状态
}

interface BaseATResponse {
  success: boolean;
  error?: string;
}

interface CommandATResponse extends BaseATResponse {
  type?: never;
  data?: string;
}

// 添加信号数据接口
interface SignalData {
  rssi?: number;
  rsrp?: number;
  rsrq?: number;
  sinr?: number;
  rscp?: number;
  networkMode?: string; // 'LTE' | 'NR' | 'WCDMA'
}

interface PushATResponse extends BaseATResponse {
  type:
    | 'incoming_call'
    | 'new_sms'
    | 'pdcp_data'
    | 'memory_full'
    | 'signal_data'
    | 'urc_data'
    | 'cellscan';
  data: PushEventData | PDCPData | SignalData | URCData | ScanPush;
}

// 服务端推送的类型，data 已经是结构化对象，直接转发给订阅者。
// cellscan 是扫频进度：这条命令要跑几分钟，服务端异步执行、边扫边推。
const PUSH_TYPES = ['incoming_call', 'new_sms', 'pdcp_data', 'memory_full', 'cellscan'] as const;

// 服务端拒绝未认证连接时的固定应答，命令应答不会长这样。
const AUTH_REJECTIONS = ['Authentication failed', 'Authentication timeout', 'Invalid authentication'];

// 连接状态里带上这条错误，界面据此弹出密钥输入框。
export const AUTH_REQUIRED_ERROR = '需要连接密钥';

const isAuthRejection = (parsedData: any): boolean =>
  typeof parsedData?.error === 'string' && AUTH_REJECTIONS.includes(parsedData.error);

export type ATResponse = CommandATResponse | PushATResponse;

export type ATConnectionState =
  | 'idle'
  | 'connecting'
  | 'authenticating'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export interface ATConnectionSnapshot {
  state: ATConnectionState;
  reconnectAttempt: number;
  maxReconnectAttempts: number;
  error?: string;
}

// 页面就是路由器发出来的，配置缺失时用当前主机比写死一个网段更靠得住。
const fallbackHost = (): string =>
  (typeof window !== 'undefined' && window.location.hostname) || '192.168.1.1';

const storedHost = (): string => localStorage.getItem('atHost') || fallbackHost();

const storedPort = (): number => Number(localStorage.getItem('atPort')) || 8765;

// https 页面里浏览器会以混合内容为由掐掉 ws://，连不上就连认证被拒都收不到。
const wsScheme = (): string =>
  typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';

// AT指令适配器接口
export interface ATAdapter {
  sendCommand(command: string): Promise<ATResponse>;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  subscribeSMS?(callback: (response: ATResponse) => void): void;
  unsubscribeSMS?(callback: (response: ATResponse) => void): void;
}

// WebSocket AT指令适配器实现
export class WebSocketATAdapter implements ATAdapter {
  private connected: boolean = false;
  private ws: WebSocket | null = null;
  private host: string = storedHost();
  private port: number = storedPort();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private reconnectDelay: number = 2000; // 重连延迟时间（毫秒）
  private reconnectTimer: NodeJS.Timeout | null = null;
  // 服务端每条命令必答：模组不吭声时 2 秒返回，最坏情况被 WebSocket 侧的 5 秒兜底。
  // 这里必须等得比服务端久，否则超时后迟到的应答会被算到下一条命令头上（应答按先后顺序匹配）。
  private commandTimeout: number = 6000; // 命令超时时间（毫秒）
  private heartbeatInterval: number = 20000; // 心跳间隔时间（毫秒），与服务器端保持一致
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastCommand: string = ''; // 记录最后发送的命令
  private pendingCommands: Map<
    string,
    {
      resolve: (value: ATResponse) => void;
      timer: NodeJS.Timeout;
    }
  > = new Map();
  private smsCallbacks: ((response: ATResponse) => void)[] = [];
  private smsCollecting: boolean = false; // 是否正在收集短信大数据
  private smsBuffer: string[] = []; // 短信数据缓存
  private smsResolve: ((value: ATResponse) => void) | null = null; // 短信命令的resolve
  private smsTimer: NodeJS.Timeout | null = null; // 短信命令的超时定时器
  private authenticated: boolean = false; // 是否已认证
  private requireAuth: boolean = false; // 是否需要认证
  private authKey: string = ''; // 认证密钥
  private connectResolve: ((value: boolean) => void) | null = null; // 连接的resolve
  private connectReject: ((reason?: any) => void) | null = null; // 连接的reject
  private connectTimeout: NodeJS.Timeout | null = null; // 连接超时定时器
  private connectingPromise: Promise<boolean> | null = null; // 正在连接的Promise
  private connectSuccessCallbacks: (() => void)[] = []; // 连接成功的回调列表
  private connectionStateCallbacks = new Set<(snapshot: ATConnectionSnapshot) => void>();
  private connectionSnapshot: ATConnectionSnapshot = {
    state: 'idle',
    reconnectAttempt: 0,
    maxReconnectAttempts: this.maxReconnectAttempts,
  };
  private configReady: Promise<void>;
  private commandQueue: Promise<any> = Promise.resolve(); // 命令队列，确保命令串行执行

  constructor(options: { skipConfig?: boolean } = {}) {
    if (options.skipConfig) {
      this.configReady = Promise.resolve();
      return;
    }

    // 连接前必须等配置加载完成，避免 require_auth 与地址仍是旧值。
    this.configReady = this.loadConfig()
      .then((config) => {
        const isConfigEnabled = config.status === 'true';
        this.requireAuth = config.require_auth === true;

        if (isConfigEnabled) {
          // 如果配置文件启用，强制使用配置文件的值
          this.host = config.at.host;
          this.port = config.at.port;

          // 保存到 localStorage
          localStorage.setItem('atHost', this.host);
          localStorage.setItem('atPort', this.port.toString());
          // 设置配置锁定状态
          localStorage.setItem('configLocked', 'true');
        } else {
          // 如果配置文件未启用，使用 localStorage 的值或默认值
          this.host = storedHost();
          this.port = storedPort();

          // 清除配置锁定状态
          localStorage.setItem('configLocked', 'false');
        }
      })
      .catch((error) => {
        console.error('加载配置文件失败:', error);
        // 加载失败时使用 localStorage 的值或默认值
        this.host = storedHost();
        this.port = storedPort();
        localStorage.setItem('configLocked', 'false');
      });
  }

  private async fetchConfigResource(url: string, timeout: number = 3000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private async loadConfig(): Promise<{ at: { host: string; port: number }; status: string; require_auth?: boolean }> {
    try {
      // 优先从 cgi-bin/at-ws-info 获取配置
      try {
        const cgiResponse = await this.fetchConfigResource('/cgi-bin/at-ws-info');
        if (cgiResponse.ok) {
          const cgiData = await cgiResponse.json();
          if (cgiData.success && cgiData.data) {
            console.log('从 CGI 加载 AT 服务器配置:', cgiData.data);
            // 保存 require_auth 状态
            this.requireAuth = cgiData.data.require_auth === true || cgiData.data.require_auth === 1;
            console.log('是否需要密钥认证:', this.requireAuth);
            // 转换为与 config.json 相同的格式
            return {
              at: {
                host: cgiData.data.host,
                port: cgiData.data.port,
              },
              status: 'true', // CGI 配置始终启用
              require_auth: this.requireAuth,
            };
          }
        }
      } catch (cgiError) {
        console.log('从 CGI 加载配置失败，尝试 config.json:', cgiError);
      }

      // 如果 CGI 失败，回退到 config.json（随前端一起部署在 /5700/ 下）
      const response = await this.fetchConfigResource(`${import.meta.env.BASE_URL}config.json`);
      if (!response.ok) {
        throw new Error('Failed to load config.json');
      }
      const config = await response.json();
      console.log('从 config.json 加载 AT 服务器配置');
      return config;
    } catch (error) {
      console.error('加载配置文件失败:', error);
      throw error;
    }
  }

  public static clearStoredConfig(): void {
    localStorage.removeItem('atHost');
    localStorage.removeItem('atPort');
  }

  public static saveConfig(host: string, port: number): void {
    localStorage.setItem('atHost', host);
    localStorage.setItem('atPort', port.toString());
  }

  public static isConfigLocked(): boolean {
    return localStorage.getItem('configLocked') === 'true';
  }

  public static setConfigLocked(locked: boolean): void {
    localStorage.setItem('configLocked', locked.toString());
  }

  private setConnectionState(state: ATConnectionState, error?: string): void {
    const next: ATConnectionSnapshot = {
      state,
      reconnectAttempt: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      ...(error ? { error } : {}),
    };

    if (
      this.connectionSnapshot.state === next.state &&
      this.connectionSnapshot.reconnectAttempt === next.reconnectAttempt &&
      this.connectionSnapshot.maxReconnectAttempts === next.maxReconnectAttempts &&
      this.connectionSnapshot.error === next.error
    ) {
      return;
    }

    this.connectionSnapshot = next;
    this.connectionStateCallbacks.forEach((callback) => {
      try {
        callback({ ...next });
      } catch (callbackError) {
        console.error('连接状态回调执行失败:', callbackError);
      }
    });
  }

  private clearConnectTimeout(): void {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
  }

  private resolvePendingConnection(): void {
    this.clearConnectTimeout();
    const resolve = this.connectResolve;
    this.connectResolve = null;
    this.connectReject = null;
    resolve?.(true);
  }

  private rejectPendingConnection(error: Error): void {
    this.clearConnectTimeout();
    const reject = this.connectReject;
    this.connectResolve = null;
    this.connectReject = null;
    reject?.(error);
  }

  public getConnectionState(): ATConnectionState {
    return this.connectionSnapshot.state;
  }

  public getConnectionSnapshot(): ATConnectionSnapshot {
    return { ...this.connectionSnapshot };
  }

  public onConnectionStateChange(
    callback: (snapshot: ATConnectionSnapshot) => void,
  ): () => void {
    this.connectionStateCallbacks.add(callback);
    callback(this.getConnectionSnapshot());
    return () => {
      this.connectionStateCallbacks.delete(callback);
    };
  }

  private setupWebSocket(socket: WebSocket): void {
    socket.onopen = () => {
      if (this.ws !== socket) {
        socket.close();
        return;
      }

      console.log('WebSocket连接已建立');
      this.connected = true;

      if (this.requireAuth) {
        this.setConnectionState('authenticating');
        console.log('发送认证密钥...');
        socket.send(JSON.stringify({ auth_key: this.authKey }));
        return;
      }

      this.authenticated = true;
      this.reconnectAttempts = 0;
      this.setConnectionState('connected');
      this.startHeartbeat();
      this.resolvePendingConnection();
      this.notifyConnectSuccess();
    };

    socket.onclose = () => {
      if (this.ws !== socket) return;

      console.log('WebSocket连接已关闭');
      const wasConnected = this.connectionSnapshot.state === 'connected';
      this.ws = null;
      this.connected = false;
      this.authenticated = false;
      this.stopHeartbeat();
      this.rejectPendingConnection(new Error('AT WebSocket 连接已断开'));
      this.handleDisconnect(wasConnected);
    };

    socket.onerror = (error) => {
      if (this.ws !== socket) return;

      console.error('WebSocket错误:', error);
      // AT 服务端只提供明文 ws，https 页面下必须有 TLS 前置代理才连得上，
      // 否则这里是唯一的线索，报个笼统的失败会让人以为是设备没开服务。
      const message =
        wsScheme() === 'wss'
          ? '连接AT服务器失败：当前页面是 HTTPS，AT 服务只提供明文 WebSocket，请改用 http:// 访问'
          : '连接AT服务器失败';
      this.setConnectionState('error', message);
      this.rejectPendingConnection(new Error(message));
      if (this.reconnectAttempts === 0) {
        Toast.error(message);
      }
      if (socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      if (this.ws !== socket) return;

      try {
        const data = event.data;
        if (typeof data === 'string') {
          this.handleWebSocketMessage(data);
        }
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    };
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleDisconnect(wasConnected: boolean): void {
    this.clearPendingCommands('连接已断开');

    // 认证连接断开后等待用户重新认证，避免无密钥循环重连。
    if (this.requireAuth) {
      console.log('连接断开，需要密钥认证，不自动重连');
      if (this.connectionSnapshot.state !== 'error') {
        this.setConnectionState('disconnected');
      }
      if (wasConnected) {
        Toast.warning('连接已断开，请重新刷新页面或重新认证');
      }
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.setConnectionState('reconnecting');
      Toast.warning(
        `连接断开，${this.reconnectDelay / 1000}秒后尝试重新连接(${this.reconnectAttempts}/${
          this.maxReconnectAttempts
        })`,
      );

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect().catch((error) => {
          console.error('AT WebSocket 自动重连失败:', error);
        });
      }, this.reconnectDelay);
      return;
    }

    const message = '自动重连失败，请检查设备连接';
    this.setConnectionState('error', message);
    Toast.error('重连次数已达上限，请手动重新连接');
  }

  private clearPendingCommands(error: string): void {
    this.pendingCommands.forEach((command) => {
      clearTimeout(command.timer);
      command.resolve({
        success: false,
        error: error,
      });
    });
    this.pendingCommands.clear();
  }

  private handleResponse(response: any): void {
    // 查找匹配的命令并处理响应
    for (const [commandId, command] of this.pendingCommands) {
      clearTimeout(command.timer);
      command.resolve({
        success: response.success,
        data: response.data,
        error: response.error,
      });
      this.pendingCommands.delete(commandId);
      break; // 只处理最早的一个命令
    }
  }

  private isErrorResponse(data: string): boolean {
    return data.includes('ERROR');
  }

  async connect(authKey?: string): Promise<boolean> {
    if (this.isReady()) {
      console.log('WebSocket 已连接，复用现有连接');
      this.setConnectionState('connected');
      return true;
    }

    if (this.connectingPromise) {
      console.log('WebSocket 正在连接中，等待现有连接完成...');
      return this.connectingPromise;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.setConnectionState(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');
    const connection = this._doConnect(authKey);
    this.connectingPromise = connection;

    try {
      return await connection;
    } finally {
      if (this.connectingPromise === connection) {
        this.connectingPromise = null;
      }
    }
  }

  private async _doConnect(authKey?: string): Promise<boolean> {
    await this.configReady;

    if (this.requireAuth) {
      if (authKey) {
        this.authKey = authKey;
      } else {
        const cachedKey = this.getAuthKey();
        if (cachedKey) {
          this.authKey = cachedKey;
        } else {
          this.setConnectionState('authenticating');
          throw new Error('REQUIRE_AUTH_KEY');
        }
      }
    }

    const isIPv6 = this.host.includes(':');
    const formattedHost = isIPv6 ? `[${this.host}]` : this.host;
    let socket: WebSocket;

    try {
      socket = new WebSocket(`${wsScheme()}://${formattedHost}:${this.port}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接调制解调器失败';
      this.setConnectionState('error', message);
      Toast.error('连接调制解调器失败');
      throw error;
    }

    this.ws = socket;
    this.setupWebSocket(socket);

    return new Promise<boolean>((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;
      this.clearConnectTimeout();

      this.connectTimeout = setTimeout(() => {
        if (this.ws !== socket || this.isReady()) return;

        const error = new Error('连接超时');
        this.setConnectionState('error', error.message);
        this.rejectPendingConnection(error);
        Toast.error('连接超时，请检查设备连接');
        socket.close();
      }, 10000);
    });
  }

  // 获取缓存的认证密钥
  private getAuthKey(): string {
    const key = localStorage.getItem('at_ws_auth_key');
    const expiry = localStorage.getItem('at_ws_auth_key_expiry');
    
    if (key && expiry) {
      const expiryTime = parseInt(expiry);
      if (Date.now() < expiryTime) {
        return key;
      } else {
        // 密钥已过期，清除
        localStorage.removeItem('at_ws_auth_key');
        localStorage.removeItem('at_ws_auth_key_expiry');
      }
    }
    
    return '';
  }

  // 设置认证密钥（公共方法）
  public setAuthKey(key: string, rememberDays: number = 0): void {
    this.authKey = key;
    
    if (rememberDays > 0) {
      // 保存密钥和过期时间
      localStorage.setItem('at_ws_auth_key', key);
      const expiryTime = Date.now() + rememberDays * 24 * 60 * 60 * 1000;
      localStorage.setItem('at_ws_auth_key_expiry', expiryTime.toString());
    } else {
      // 不记住，清除缓存
      localStorage.removeItem('at_ws_auth_key');
      localStorage.removeItem('at_ws_auth_key_expiry');
    }
  }

  // 清除认证密钥
  public clearAuthKey(): void {
    this.authKey = '';
    this.authenticated = false;
    localStorage.removeItem('at_ws_auth_key');
    localStorage.removeItem('at_ws_auth_key_expiry');
  }

  // 检查是否需要认证
  public isAuthRequired(): boolean {
    return this.requireAuth;
  }

  public isReady(): boolean {
    return this.connected && (!this.requireAuth || this.authenticated);
  }


  // 触发连接成功回调
  private notifyConnectSuccess(): void {
    console.log(`触发 ${this.connectSuccessCallbacks.length} 个连接成功回调`);
    // 使用 setTimeout 确保回调在下一个事件循环中执行
    setTimeout(() => {
      this.connectSuccessCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('连接成功回调执行失败:', error);
        }
      });
    }, 0);
  }

  // 注册连接成功回调
  public onConnectSuccess(callback: () => void): () => void {
    this.connectSuccessCallbacks.push(callback);
    // 返回注销函数
    return () => {
      const index = this.connectSuccessCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectSuccessCallbacks.splice(index, 1);
      }
    };
  }

  async disconnect(): Promise<void> {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      this.clearPendingCommands('连接已手动断开');
      this.stopHeartbeat();
      this.rejectPendingConnection(new Error('连接已手动断开'));

      const socket = this.ws;
      this.ws = null;
      socket?.close();

      this.connected = false;
      this.authenticated = false;
      this.reconnectAttempts = 0;
      this.connectingPromise = null;
      this.setConnectionState('disconnected');
    } catch (error) {
      this.setConnectionState('error', '断开连接失败');
      Toast.error('断开连接失败');
    }
  }

  async sendCommand(command: string): Promise<ATResponse> {
    // 🔒 使用队列确保命令串行执行，避免 PDCP 等主动上报数据干扰
    return this.commandQueue = this.commandQueue
      .then(async () => {
        if (!this.connected || !this.ws) {
          return {
            success: false,
            error: '未连接到调制解调器',
          };
        }

        // 短信列表可能被拆成多条消息返回，单独收集
        if (command.trim() === 'AT+CMGL=4') {
          this.smsCollecting = true;
          this.smsBuffer = [];
          return new Promise<ATResponse>((resolve) => {
            this.smsResolve = resolve;
            this.smsTimer = setTimeout(() => {
              this.finishSMSCollect({ success: false, error: '短信数据收集超时' });
            }, 10000);
            const formattedCommand = command.endsWith('\r') ? command : command + '\r';
            this.ws?.send(formattedCommand);
          });
        }

        try {
          // 记录最后发送的命令
          this.lastCommand = command;

          const response = await new Promise<ATResponse>((resolve) => {
            const commandId = Date.now().toString();
            const timer = setTimeout(() => {
              this.pendingCommands.delete(commandId);
              resolve({
                success: false,
                error: '命令执行超时',
              });
            }, this.commandTimeout);

            this.pendingCommands.set(commandId, { resolve, timer });

            const formattedCommand = command.endsWith('\r') ? command : command + '\r';
            this.ws?.send(formattedCommand);
          });

          await new Promise(resolve => setTimeout(resolve, 20));
          
          return response;
        } catch (error) {
          return {
            success: false,
            error: `执行命令失败: ${error}`,
          };
        }
      })
      .catch((error) => {
        // 捕获错误但不中断队列，确保后续命令继续执行
        console.error('命令执行出错:', error);
        return {
          success: false,
          error: error?.message || '命令执行失败',
        };
      });
  }

  // 修改配置后立即使用新地址重新连接。
  public async setConnection(host: string, port: number): Promise<boolean> {
    this.host = host.replace(/^\[|\]$/g, '');
    this.port = port;
    localStorage.setItem('atHost', this.host);
    localStorage.setItem('atPort', port.toString());

    await this.disconnect();
    return this.connect();
  }

  // 订阅短信通知
  public subscribeSMS(callback: (response: ATResponse) => void): void {
    this.smsCallbacks.push(callback);
  }

  // 取消订阅短信通知
  public unsubscribeSMS(callback: (response: ATResponse) => void): void {
    const index = this.smsCallbacks.indexOf(callback);
    if (index > -1) {
      this.smsCallbacks.splice(index, 1);
    }
  }

  private handleWebSocketMessage(data: string): void {
    // 心跳：服务端每 30 秒发一次 ping，也会回应我们发的 ping。
    if (data === 'ping' || data === 'pong') return;

    let parsedData: any;
    try {
      parsedData = JSON.parse(data);
    } catch {
      this.handleTextMessage(data);
      return;
    }

    // 认证握手
    if (this.requireAuth && !this.authenticated) {
      if (this.handleAuthHandshake(parsedData)) return;
    } else if (isAuthRejection(parsedData)) {
      // 配置接口没报告需要密钥（旧版本 CGI），但服务端要求认证。
      this.handleAuthRequired();
      return;
    }

    // 服务端已经把这几类上报解析成结构化数据，直接转发给订阅者。
    if (PUSH_TYPES.includes(parsedData.type)) {
      this.emitPush({ success: true, type: parsedData.type, data: parsedData.data });
      return;
    }

    // raw_data 里只有主动上报：服务端只在没有命令等应答时才推它。
    // 解析完就到此为止，绝不能拿去匹配等待中的命令，否则整条队列会串号。
    if (parsedData.type === 'raw_data' && typeof parsedData.data === 'string') {
      this.dispatchRawData(parsedData.data);
      return;
    }

    if (this.smsCollecting) {
      if (parsedData.success === false) {
        this.finishSMSCollect({ success: false, error: parsedData.error || '读取短信失败' });
      } else {
        this.collectSMSChunk(typeof parsedData.data === 'string' ? parsedData.data : data);
      }
      return;
    }

    // 应答和当前命令对不上就丢弃：宁可让这条命令超时，也不能污染下一条。
    if (typeof parsedData.data === 'string' && !this.matchesLastCommand(parsedData.data)) {
      return;
    }

    this.handleResponse({
      success: parsedData.success ?? false,
      data: parsedData.data as string,
      error: parsedData.error,
    } as CommandATResponse);
  }

  // handleTextMessage 处理非 JSON 消息。服务端只会发 ping/pong，
  // 其余裸文本按旧实现当作命令应答，但主动上报要挡掉。
  private handleTextMessage(data: string): void {
    if (this.smsCollecting) {
      this.collectSMSChunk(data);
      return;
    }

    if (isUnsolicitedText(data)) {
      console.log('忽略非 JSON 的主动上报数据:', data.substring(0, 50));
      return;
    }

    console.log('非JSON格式数据，作为普通AT命令响应处理:', data);
    this.handleResponse({ success: !data.includes('ERROR'), data } as CommandATResponse);
  }

  private matchesLastCommand(data: string): boolean {
    // 提取命令前缀（如 AT^DSFLOWQRY -> ^DSFLOWQRY）
    const expectedPrefix = this.lastCommand.match(/AT([^\s=?]*)/)?.[1];
    if (!expectedPrefix) return true;
    if (data.includes(expectedPrefix) || data.includes('OK') || data.includes('ERROR')) return true;

    console.warn(`响应与命令 ${this.lastCommand} 不匹配，已丢弃:`, data.substring(0, 80));
    return false;
  }

  private emitPush(response: PushATResponse): void {
    this.smsCallbacks.forEach((callback) => {
      try {
        callback(response);
      } catch (callbackError) {
        console.error('执行推送回调函数失败:', callbackError);
      }
    });
  }

  private dispatchRawData(text: string): void {
    const { entries, rest } = extractPDCP(text);
    entries.forEach((entry) => this.emitPush({ success: true, type: 'pdcp_data', data: entry }));
    extractURCs(rest).forEach((urc) => this.emitPush({ success: true, type: 'urc_data', data: urc }));
  }

  private handleAuthHandshake(parsedData: any): boolean {
    if (parsedData.success && parsedData.message === '认证成功') {
      this.authenticated = true;
      this.reconnectAttempts = 0;
      this.setConnectionState('connected');
      this.startHeartbeat();
      console.log('密钥验证成功，已连接到AT服务器');
      this.resolvePendingConnection();
      this.notifyConnectSuccess();
      return true;
    }

    if (parsedData.error || parsedData.message === '认证失败') {
      const message = parsedData.message || '密钥认证失败';
      console.error('认证失败:', message);
      this.authenticated = false;
      this.connected = false;
      this.setConnectionState('error', message);
      Toast.error(message);
      this.rejectPendingConnection(new Error(message));
      this.ws?.close();
      return true;
    }

    return false;
  }

  private handleAuthRequired(): void {
    this.requireAuth = true;
    this.authenticated = false;
    this.connected = false;
    this.setConnectionState('error', AUTH_REQUIRED_ERROR);
    this.rejectPendingConnection(new Error('REQUIRE_AUTH_KEY'));
    this.ws?.close();
  }

  // AT+CMGL=4 的应答可能被拆成多条消息，见到 OK/ERROR 才算读完。
  private collectSMSChunk(content: string): void {
    if (!content.includes('OK') && !content.includes('ERROR')) {
      this.smsBuffer.push(content);
      return;
    }

    const allData = [...this.smsBuffer, content].join('\n');
    this.finishSMSCollect({ success: !allData.includes('ERROR'), data: allData });
  }

  private finishSMSCollect(response: ATResponse): void {
    if (this.smsTimer) clearTimeout(this.smsTimer);
    this.smsTimer = null;
    this.smsCollecting = false;
    this.smsBuffer = [];
    const resolve = this.smsResolve;
    this.smsResolve = null;
    resolve?.(response);
  }

  // PDU解析辅助方法
  private parsePDU(pdu: string): {
    sender: string;
    timestamp: string;
    content: string;
  } | null {
    try {
      if (!pdu || pdu.length < 20) return null;

      // 解析PDU长度
      const pduLength = parseInt(pdu.substring(0, 2), 16);
      if (pduLength <= 0 || pduLength > pdu.length) return null;

      // 解析发送者号码
      const senderLength = parseInt(pdu.substring(2, 4), 16);
      if (senderLength <= 0 || senderLength > pdu.length - 6) return null;

      const senderType = pdu.substring(4, 6);
      let sender = '';
      if (senderType === '91') {
        // 国际格式
        const senderNumber = pdu.substring(6, 6 + senderLength);
        sender = '+' + senderNumber.split('').reduce((acc, curr, idx) => {
          if (idx % 2 === 0) {
            return acc + curr;
          }
          return acc + curr + (idx < senderLength - 1 ? '' : '');
        }, '');
      } else {
        // 本地格式
        sender = pdu.substring(6, 6 + senderLength);
      }

      // 解析时间戳
      const timestampStart = 6 + senderLength + 2; // +2 for protocol identifier and data coding scheme
      if (timestampStart + 14 > pdu.length) return null;
      const timestamp = pdu.substring(timestampStart, timestampStart + 14);
      const year = '20' + timestamp.substring(0, 2);
      const month = timestamp.substring(2, 4);
      const day = timestamp.substring(4, 6);
      const hour = timestamp.substring(6, 8);
      const minute = timestamp.substring(8, 10);
      const second = timestamp.substring(10, 12);
      const formattedTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

      // 解析内容
      const contentStart = timestampStart + 14;
      if (contentStart >= pdu.length) return null;
      const content = this.decodePDUContent(pdu.substring(contentStart));

      return {
        sender,
        timestamp: formattedTimestamp,
        content
      };
    } catch (error) {
      console.error('PDU解析失败:', error);
      return null;
    }
  }

  // PDU内容解码
  private decodePDUContent(pduContent: string): string {
    try {
      let result = '';
      for (let i = 0; i < pduContent.length; i += 2) {
        const byte = parseInt(pduContent.substring(i, i + 2), 16);
        if (byte === 0) break;
        result += String.fromCharCode(byte);
      }
      return result;
    } catch (error) {
      console.error('PDU内容解码失败:', error);
      return '';
    }
  }
}

class MockWebSocketATAdapter extends WebSocketATAdapter {
  private mockConnected = false;
  private mockConnectionGeneration = 0;
  private mockConnectingPromise: Promise<boolean> | null = null;
  private mockState: MockModemState = createMockModemState();
  private mockSnapshot: ATConnectionSnapshot = {
    state: 'idle',
    reconnectAttempt: 0,
    maxReconnectAttempts: 0,
  };
  private mockStateCallbacks = new Set<(snapshot: ATConnectionSnapshot) => void>();
  private mockConnectCallbacks = new Set<() => void>();
  private mockMessageCallbacks = new Set<(response: ATResponse) => void>();
  private mockPDCPSequence = 0;
  private mockPDCPTimer: ReturnType<typeof setInterval> | null = null;
  private mockScanTimer: ReturnType<typeof setInterval> | null = null;
  private mockSignalTimer: ReturnType<typeof setInterval> | null = null;
  private mockSignalRsrp = -82;
  private mockScanFound: string[] = [];
  private mockCommandQueue: Promise<void> = Promise.resolve();

  constructor() {
    super({ skipConfig: true });
    seedMockSentMessages();
  }

  private setMockConnectionState(state: ATConnectionState, error?: string): void {
    const next: ATConnectionSnapshot = {
      state,
      reconnectAttempt: 0,
      maxReconnectAttempts: 0,
      ...(error ? { error } : {}),
    };

    if (this.mockSnapshot.state === next.state && this.mockSnapshot.error === next.error) return;
    this.mockSnapshot = next;
    this.mockStateCallbacks.forEach((callback) => {
      try {
        callback({ ...next });
      } catch (callbackError) {
        console.error('Mock 连接状态回调执行失败:', callbackError);
      }
    });
  }

  private emitMockResponse(response: ATResponse): void {
    this.mockMessageCallbacks.forEach((callback) => {
      try {
        callback(response);
      } catch (callbackError) {
        console.error('Mock 消息回调执行失败:', callbackError);
      }
    });
  }

  // 真机的信号是靠 ^HCSQ 主动上报的，演示模式也照着推一条，
  // 否则信号趋势图在演示里永远是空的。
  private startMockSignal(): void {
    if (this.mockSignalTimer) return;
    const emit = () => {
      if (!this.mockConnected) return;
      // 在一个合理区间里缓慢游走，看起来像真的在调天线
      this.mockSignalRsrp = Math.max(
        -110,
        Math.min(-70, this.mockSignalRsrp + (Math.random() - 0.5) * 6),
      );
      const sinr = Math.max(0, Math.min(30, 13 + (Math.random() - 0.5) * 8));
      // ^HCSQ 上报的是档位原值，这里按 convertRsrp/convertSinr 的换算反推：
      // RSRP 档位 = dBm + 140，SINR 档位 = (dB + 20) / 0.2
      this.emitMockResponse({
        success: true,
        type: 'urc_data',
        data: {
          type: 'HCSQ',
          raw: '^HCSQ mock',
          parsed: {
            networkMode: 'NR',
            rsrp: Math.round(this.mockSignalRsrp + 140),
            sinr: Math.round((sinr + 20) / 0.2),
            rsrq: Math.round((-11 + 20) / 0.5),
          },
        },
      });
    };
    emit();
    this.mockSignalTimer = setInterval(emit, 1500);
  }

  private startMockPDCP(interval: number = 750): void {
    this.stopMockPDCP();
    const reportInterval = Math.max(250, Math.min(interval, 5000));
    const emit = () => {
      if (!this.mockConnected) return;
      this.emitMockResponse({
        success: true,
        type: 'pdcp_data',
        data: createMockPDCPData(this.mockPDCPSequence++),
      });
    };
    emit();
    this.mockPDCPTimer = setInterval(emit, reportInterval);
  }

  private stopMockPDCP(): void {
    if (!this.mockPDCPTimer) return;
    clearInterval(this.mockPDCPTimer);
    this.mockPDCPTimer = null;
  }

  // handleMockScan 模拟 ^CELLSCAN：立刻受理，然后按节奏推送扫到的小区，
  // 命中扫频相关命令时返回应答，否则返回 null 交回普通命令表。
  private handleMockScan(commandLine: string): ATResponse | null {
    const upper = commandLine.toUpperCase();
    if (!upper.startsWith('AT^CELLSCAN')) return null;

    if (upper === 'AT^CELLSCAN=STATE') {
      const state = this.mockScanTimer ? `RUNNING,${this.mockScanFound.length}` : 'IDLE';
      return { success: true, data: `^CELLSCAN: ${state}\r\nOK` };
    }

    if (upper === 'AT^CELLSCAN=ABORT') {
      if (!this.mockScanTimer) return { success: false, error: '当前没有正在进行的扫频' };
      this.finishMockScan('aborted');
      return { success: true, data: 'OK' };
    }

    if (this.mockScanTimer) return { success: false, error: '扫频正在进行中，请先取消' };

    this.mockScanFound = [];
    this.mockScanTimer = setInterval(() => {
      const next = MOCK_SCAN_CELLS[this.mockScanFound.length];
      if (!next) {
        this.finishMockScan('done');
        return;
      }
      this.mockScanFound.push(next);
      this.emitMockResponse({
        success: true,
        type: 'cellscan',
        data: { state: 'running', cell: next, count: this.mockScanFound.length },
      });
    }, 900);

    return { success: true, data: '^CELLSCAN: STARTED\r\nOK' };
  }

  private finishMockScan(state: 'done' | 'aborted'): void {
    if (this.mockScanTimer) {
      clearInterval(this.mockScanTimer);
      this.mockScanTimer = null;
    }
    this.emitMockResponse({
      success: true,
      type: 'cellscan',
      data: { state, lines: [...this.mockScanFound], count: this.mockScanFound.length },
    });
  }

  public async connect(_authKey?: string): Promise<boolean> {
    if (this.mockConnected) {
      this.setMockConnectionState('connected');
      this.startMockPDCP();
      this.startMockSignal();
      return true;
    }
    if (this.mockConnectingPromise) return this.mockConnectingPromise;

    const generation = ++this.mockConnectionGeneration;
    this.setMockConnectionState('connecting');
    const connection = (async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (generation !== this.mockConnectionGeneration) return false;
      this.mockConnected = true;
      this.setMockConnectionState('connected');
      this.startMockPDCP();
      this.startMockSignal();
      setTimeout(() => {
        this.mockConnectCallbacks.forEach((callback) => {
          try {
            callback();
          } catch (callbackError) {
            console.error('Mock 连接成功回调执行失败:', callbackError);
          }
        });
      }, 0);
      return true;
    })();
    this.mockConnectingPromise = connection;

    try {
      return await connection;
    } finally {
      if (this.mockConnectingPromise === connection) this.mockConnectingPromise = null;
    }
  }

  public async disconnect(): Promise<void> {
    this.mockConnectionGeneration += 1;
    this.mockConnectingPromise = null;
    this.mockConnected = false;
    this.stopMockPDCP();
    this.setMockConnectionState('disconnected');
  }

  public async sendCommand(command: string): Promise<ATResponse> {
    const execution = this.mockCommandQueue.then(async () => {
      if (!this.mockConnected) {
        return { success: false, error: 'Mock 调制解调器未连接' } as ATResponse;
      }

      await new Promise((resolve) => setTimeout(resolve, 35));
      const commandLine = command.trim().split(/[\r\n]/)[0];

      // 扫频在真实环境里由服务端异步执行、结果分批推送，演示模式照同样的
      // 节奏模拟，否则面板会一直停在"扫描中"。
      const scan = this.handleMockScan(commandLine);
      if (scan) return scan;

      const response = resolveMockATCommand(command, this.mockState) as ATResponse;

      if (/^AT\^PDCPDATAINFO=1(?:,(\d+))?$/i.test(commandLine)) {
        const interval = Number(commandLine.match(/,(\d+)$/)?.[1]) || 750;
        this.startMockPDCP(interval);
      } else if (/^AT\^PDCPDATAINFO=0$/i.test(commandLine)) {
        this.stopMockPDCP();
      }

      return response;
    });

    this.mockCommandQueue = execution.then(
      () => undefined,
      () => undefined,
    );
    return execution;
  }

  public setAuthKey(_key: string, _rememberDays: number = 0): void {}

  public clearAuthKey(): void {}

  public isAuthRequired(): boolean {
    return false;
  }

  public isReady(): boolean {
    return this.mockConnected;
  }

  public getConnectionState(): ATConnectionState {
    return this.mockSnapshot.state;
  }

  public getConnectionSnapshot(): ATConnectionSnapshot {
    return { ...this.mockSnapshot };
  }

  public onConnectionStateChange(
    callback: (snapshot: ATConnectionSnapshot) => void,
  ): () => void {
    this.mockStateCallbacks.add(callback);
    callback(this.getConnectionSnapshot());
    return () => {
      this.mockStateCallbacks.delete(callback);
    };
  }

  public onConnectSuccess(callback: () => void): () => void {
    this.mockConnectCallbacks.add(callback);
    return () => {
      this.mockConnectCallbacks.delete(callback);
    };
  }

  public subscribeSMS(callback: (response: ATResponse) => void): void {
    this.mockMessageCallbacks.add(callback);
  }

  public unsubscribeSMS(callback: (response: ATResponse) => void): void {
    this.mockMessageCallbacks.delete(callback);
  }

  public async setConnection(_host: string, _port: number): Promise<boolean> {
    return this.mockConnected || this.connect();
  }
}

// AT指令服务类
export class ATService {
  private static instance: ATService | null = null; // 确保初始化为 null
  private adapter: ATAdapter;
  private newSMSSubscribers: Set<(response: ATResponse) => void> = new Set();

  private constructor() {
    this.adapter = isMockModeEnabled()
      ? new MockWebSocketATAdapter()
      : new WebSocketATAdapter();
  }

  public static getInstance(): ATService {
    if (!ATService.instance) {
      ATService.instance = new ATService();
    }
    return ATService.instance;
  }

  public async connect(authKey?: string): Promise<boolean> {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).connect(authKey);
    }
    return this.adapter.connect();
  }

  public async disconnect(): Promise<void> {
    return this.adapter.disconnect();
  }

  // 设置认证密钥
  public setAuthKey(key: string, rememberDays: number = 0): void {
    if (this.adapter instanceof WebSocketATAdapter) {
      (this.adapter as WebSocketATAdapter).setAuthKey(key, rememberDays);
    }
  }

  // 清除认证密钥
  public clearAuthKey(): void {
    if (this.adapter instanceof WebSocketATAdapter) {
      (this.adapter as WebSocketATAdapter).clearAuthKey();
    }
  }

  // 检查是否需要认证
  public isAuthRequired(): boolean {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).isAuthRequired();
    }
    return false;
  }

  public isReady(): boolean {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).isReady();
    }
    return false;
  }

  public getConnectionState(): ATConnectionState {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).getConnectionState();
    }
    return 'disconnected';
  }

  public getConnectionSnapshot(): ATConnectionSnapshot {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).getConnectionSnapshot();
    }
    return {
      state: 'disconnected',
      reconnectAttempt: 0,
      maxReconnectAttempts: 0,
    };
  }

  public onConnectionStateChange(
    callback: (snapshot: ATConnectionSnapshot) => void,
  ): () => void {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).onConnectionStateChange(callback);
    }
    callback(this.getConnectionSnapshot());
    return () => {};
  }

  // 注册连接成功回调
  public onConnectSuccess(callback: () => void): () => void {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).onConnectSuccess(callback);
    }
    // 如果不是 WebSocket 适配器，返回空函数
    return () => {};
  }

  public async sendCommand(command: string): Promise<ATResponse> {
    try {
      const response = await this.adapter.sendCommand(command);

      return response;
    } catch (error) {
      console.error('发送AT命令失败:', error);
      return {
        success: false,
        error: `发送AT命令失败: ${error}`,
      };
    }
  }

  // 网络相关AT指令
  public async getSignalStrength(): Promise<ATResponse> {
    return this.sendCommand('AT+CSQ');
  }

  public async getNetworkRegistration(): Promise<ATResponse> {
    await this.sendCommand('AT+CREG=2'); // 先设置为详细信息模式
    return this.sendCommand('AT+CREG?'); // 然后查询状态
  }

  // 短信相关AT指令
  public async sendSMS(number: string, message: string): Promise<ATResponse> {
    await this.sendCommand('AT+CMGF=0'); // 设置文本模式
    return this.sendCommand(`AT+CMGS="${number}"\r${message}\x1A`);
  }

  public async readSMS(index: number): Promise<ATResponse> {
    try {
      // 设置PDU模式
      const cmgfResponse = await this.sendCommand('AT+CMGF=0');
      if (!cmgfResponse.success) {
        console.warn('设置PDU模式失败，但继续执行:', cmgfResponse.error);
      }

      // 等待一段时间确保命令执行完成
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 读取指定索引的短信
      console.log(`读取短信索引 ${index}`);
      const response = await this.sendCommand(`AT+CMGR=${index}`);

      return response;
    } catch (error) {
      console.error(`读取短信索引 ${index} 失败:`, error);
      return {
        success: false,
        error: `读取短信失败: ${error}`,
      };
    }
  }

  // 设置短信服务中心号码
  public async setSMSCenter(number: string): Promise<ATResponse> {
    return this.sendCommand(`AT+CSCA="${number}"`);
  }

  // 获取短信服务中心号码
  public async getSMSCenter(): Promise<ATResponse> {
    return this.sendCommand('AT+CSCA?');
  }

  // 设置短信服务类型
  public async setSMSService(service: number): Promise<ATResponse> {
    return this.sendCommand(`AT+CSMS=${service}`);
  }

  // 获取短信服务类型
  public async getSMSService(): Promise<ATResponse> {
    return this.sendCommand('AT+CSMS?');
  }

  // 设置短信文本模式参数
  public async setSMSTextParameters(
    fo: number,
    vp: number,
    pid: number,
    dcs: number,
  ): Promise<ATResponse> {
    return this.sendCommand(`AT+CSMP=${fo},${vp},${pid},${dcs}`);
  }

  // 获取短信文本模式参数
  public async getSMSTextParameters(): Promise<ATResponse> {
    return this.sendCommand('AT+CSMP?');
  }

  // 按状态读取短信
  public async listSMSByStatus(status: number): Promise<ATResponse> {
    return this.sendCommand(`AT+CMGL=${status}`);
  }

  // 获取所有短信，先检查模式再设置
  public async listAllSMS(): Promise<ATResponse> {
    try {
      console.log('开始执行listAllSMS');

      // 先检查当前模式
      const modeResponse = await this.sendCommand('AT+CMGF?');
      if (modeResponse.success && 'data' in modeResponse && typeof modeResponse.data === 'string' && !modeResponse.data.includes('+CMGF: 0')) {
        // 只有不是PDU模式时才设置
        console.log('当前不是PDU模式，设置为PDU模式');
        await this.sendCommand('AT+CMGF=0');
      }

      // 获取所有短信
      console.log('发送AT+CMGL=4命令获取所有短信');
      const response = await this.sendCommand('AT+CMGL=4');

      return response;
    } catch (error) {
      console.error('获取所有短信失败:', error);
      return {
        success: false,
        error: `获取所有短信失败: ${error}`
      };
    }
  }

  // 存储短信
  public async storeSMS(number: string, message: string): Promise<ATResponse> {
    await this.sendCommand('AT+CMGF=1'); // 设置文本模式
    return this.sendCommand(`AT+CMGW="${number}"\r${message}\x1A`);
  }

  // 从存储器发送短信
  public async sendStoredSMS(index: number): Promise<ATResponse> {
    return this.sendCommand(`AT+CMSS=${index}`);
  }

  // 设置短信存储器
  public async setSMSStorage(mem1?: string, mem2?: string, mem3?: string): Promise<ATResponse> {
    const command = `AT+CPMS=${mem1 ? `"${mem1}"` : ''}${mem2 ? `,"${mem2}"` : ''}${
      mem3 ? `,"${mem3}"` : ''
    }`;
    return this.sendCommand(command);
  }

  // 查询短信存储器状态
  public async getSMSStorage(): Promise<ATResponse> {
    return this.sendCommand('AT+CPMS?');
  }

  // 设置短信格式（PDU/Text）
  public async setSMSFormat(mode: 0 | 1): Promise<ATResponse> {
    return this.sendCommand(`AT+CMGF=${mode}`);
  }

  // 删除短信
  public async deleteSMS(index: number, delflag?: number): Promise<ATResponse> {
    const command = `AT+CMGD=${index}${delflag !== undefined ? `,${delflag}` : ''}`;
    return this.sendCommand(command);
  }

  // 获取IMEI
  public async getIMEI(): Promise<ATResponse> {
    const response = await this.sendCommand('AT+CGSN');
    if (response.success && typeof response.data === 'string') {
      const imei = response.data.replace(/OK/i, '').trim();
      return {
        success: true,
        data: imei,
      };
    }
    return response;
  }

  public async setConnection(host: string, port: number): Promise<boolean> {
    if (this.adapter instanceof WebSocketATAdapter) {
      return (this.adapter as WebSocketATAdapter).setConnection(host, port);
    }
    return false;
  }

  public getHost(): string {
    return localStorage.getItem('atHost') || '192.168.1.1';
  }

  public getPort(): number {
    return Number(localStorage.getItem('atPort')) || 8765;
  }

  public isConfigLocked(): boolean {
    return localStorage.getItem('configLocked') === 'true';
  }

  public subscribe(callback: (response: ATResponse) => void): void {
    console.log('添加新的通知订阅');
    if (this.adapter instanceof WebSocketATAdapter) {
      (this.adapter as WebSocketATAdapter).subscribeSMS(callback);
    }
  }

  public unsubscribe(callback: (response: ATResponse) => void): void {
    console.log('移除通知订阅');
    if (this.adapter instanceof WebSocketATAdapter) {
      (this.adapter as WebSocketATAdapter).unsubscribeSMS(callback);
    }
  }

  // 设置PDCP数据上报
  public async setPDCPDataReport(enable: boolean, interval?: number): Promise<ATResponse> {
    const command = enable
      ? `AT^PDCPDATAINFO=1${interval ? `,${interval}` : ''}`
      : 'AT^PDCPDATAINFO=0';
    return this.sendCommand(command);
  }

  // 添加到 ATService 类中
  public async getCSRegStatus(): Promise<ATResponse> {
    await this.sendCommand('AT+CREG=2'); // 设置详细信息模式
    return this.sendCommand('AT+CREG?');
  }

  public async getPSRegStatus(): Promise<ATResponse> {
    try {
      // 先设置为支持详细信息的模式
      await this.sendCommand('AT+CGREG=2');

      // 查询PS域注册状态
      const response = await this.sendCommand('AT+CGREG?');
      if (response.success && typeof response.data === 'string') {
        console.log('PS域注册状态响应:', response.data);
        const matches = response.data.match(
          /\+CGREG:\s*(\d+),(\d+)(?:,([^,]*),([^,]*)(?:,(\d+))?)?/,
        );
        if (matches) {
          const [_, n, stat, lac, ci, act] = matches;
          const status = parseInt(stat);

          // 返回PS域注册状态数据
          return {
            success: true,
            data: JSON.stringify({
              stat: status,
              lac: lac?.replace(/"/g, '') || '',
              ci: ci?.replace(/"/g, '') || '',
              act: act ? parseInt(act) : -1,
            }),
          };
        }
      }
      return response;
    } catch (error) {
      console.error('获取PS域注册状态失败:', error);
      return {
        success: false,
        error: `获取PS域注册状态失败: ${error}`,
      };
    }
  }

  // 发起呼叫
  public async makeCall(phoneNumber: string): Promise<ATResponse> {
    return this.sendCommand(`ATD${phoneNumber};`);
  }

  // 接听来电
  public async answerCall(): Promise<ATResponse> {
    return this.sendCommand('ATA');
  }

  // 挂断电话
  public async hangupCall(): Promise<ATResponse> {
    return this.sendCommand('ATH');
  }

  // 发送DTMF音
  public async sendDTMF(dtmf: string, duration?: number): Promise<ATResponse> {
    const command = duration ? `AT+VTS=${dtmf},${duration}` : `AT+VTS=${dtmf}`;
    return this.sendCommand(command);
  }

  // 挂断所有呼叫
  public async hangupAllCalls(): Promise<ATResponse> {
    return this.sendCommand('AT+CHUP');
  }

  // 设置来电指示扩展上报格式
  public async setCallRingExtendedFormat(enable: boolean): Promise<ATResponse> {
    return this.sendCommand(`AT+CRC=${enable ? 1 : 0}`);
  }

  // 设置IMS业务能力开关
  public async setIMSSwitch(enable: boolean): Promise<ATResponse> {
    return this.sendCommand(`AT^IMSSWITCH=${enable ? 1 : 0}`);
  }

  // 查询IMS业务能力开关状态
  public async queryIMSSwitch(): Promise<ATResponse> {
    return this.sendCommand('AT^IMSSWITCH?');
  }

  // 查询当前呼叫状态
  public async queryCallState(): Promise<ATResponse> {
    return this.sendCommand('AT+CLCC');
  }
}
