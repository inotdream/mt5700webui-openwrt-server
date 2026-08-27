# AT WebServer API 文档

## WebSocket 配置信息 API

### 端点
```
GET /cgi-bin/at-ws-info
```

### 描述
获取当前 AT WebServer 的 WebSocket 配置信息，用于前端动态获取 WebSocket 连接地址。

### 请求示例
```bash
curl http://192.168.1.1/cgi-bin/at-ws-info
```

### 响应格式
```json
{
  "success": true,
  "data": {
    "host": "192.168.1.1",
    "port": 8765,
    "allow_wan": 0,
    "require_auth": false,
    "ws_url": "ws://192.168.1.1:8765",
    "timestamp": 1729756800
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 请求是否成功 |
| data.host | string | WebSocket 主机地址 |
| data.port | number | WebSocket 端口号 |
| data.allow_wan | number | 是否允许外网访问 (0=否, 1=是) |
| data.require_auth | boolean | 连接后是否需要先发送密钥 |
| data.ws_url | string | 完整的 WebSocket URL |
| data.timestamp | number | Unix 时间戳 |

### 认证握手

服务端配了密钥时，连接后的**第一条消息**必须是密钥，10 秒内不发就断开：

```javascript
ws.onopen = () => ws.send(JSON.stringify({ auth_key: 'your-key' }));
```

| 服务端应答 | error 字段 | 含义 |
|------|------|------|
| `{"success":true,"message":"认证成功"}` | - | 通过，后续可发命令 |
| `{"error":"Authentication failed","message":"密钥验证失败"}` | Authentication failed | 密钥不对，连接随即关闭 |
| `{"error":"Authentication timeout","message":"认证超时"}` | Authentication timeout | 10 秒内没收到密钥 |
| `{"error":"Invalid authentication","message":"无效的认证数据"}` | Invalid authentication | 首条消息不是合法 JSON |

`require_auth` 为 `false` 时可以直接发命令。但这个标志来自 UCI 配置，和服务端进程的实际状态
可能不一致（例如改了配置没重启服务）；这种情况下首条命令会被当成密钥处理，拿到
`Authentication failed`。前端应据此判断需要认证，再按上面的握手重连。

### 前端使用示例

#### JavaScript (原生)
```javascript
async function getWebSocketInfo() {
    const response = await fetch('/cgi-bin/at-ws-info');
    const result = await response.json();
    
    if (result.success) {
        const ws = new WebSocket(result.data.ws_url);
        ws.onopen = () => console.log('WebSocket 已连接');
    }
}

getWebSocketInfo();
```

#### JavaScript (jQuery)
```javascript
$.getJSON('/cgi-bin/at-ws-info', function(result) {
    if (result.success) {
        var ws = new WebSocket(result.data.ws_url);
        ws.onopen = function() {
            console.log('WebSocket 已连接');
        };
    }
});
```

#### Vue.js
```javascript
export default {
    data() {
        return {
            wsInfo: null,
            ws: null
        }
    },
    async mounted() {
        const response = await fetch('/cgi-bin/at-ws-info');
        const result = await response.json();
        
        if (result.success) {
            this.wsInfo = result.data;
            this.ws = new WebSocket(this.wsInfo.ws_url);
        }
    }
}
```

#### React
```javascript
import { useState, useEffect } from 'react';

function App() {
    const [wsInfo, setWsInfo] = useState(null);

    useEffect(() => {
        fetch('/cgi-bin/at-ws-info')
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setWsInfo(result.data);
                    const ws = new WebSocket(result.data.ws_url);
                    ws.onopen = () => console.log('WebSocket 已连接');
                }
            });
    }, []);

    return (
        <div>
            {wsInfo && <p>WebSocket URL: {wsInfo.ws_url}</p>}
        </div>
    );
}
```

### 注意事项

1. **CORS 支持**：API 已启用 CORS，允许跨域访问
2. **动态主机**：当允许外网访问时，API 会自动返回当前访问的主机名
3. **缓存**：建议在每次需要连接时重新获取配置，而不是缓存
4. **错误处理**：请务必处理 API 请求失败的情况

### 错误处理示例
```javascript
async function getWebSocketInfo() {
    try {
        const response = await fetch('/cgi-bin/at-ws-info');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error('获取配置失败');
        }
        
        return result.data;
    } catch (error) {
        console.error('获取 WebSocket 配置失败:', error);
        // 使用默认配置作为后备
        return {
            host: window.location.hostname,
            port: 8765,
            ws_url: `ws://${window.location.hostname}:8765`
        };
    }
}
```

### 安全建议

1. 在生产环境中，建议限制此 API 的访问权限
2. 如果不需要外网访问，请在配置中禁用 `allow_wan`
3. 定期检查服务日志，监控异常访问

## WebSocket 命令协议

认证通过后（或未启用密钥时），每条文本消息被当作一条 AT 命令转发给模组，
应答为 JSON，按**先进先出**顺序与命令一一对应：

```json
{ "success": true,  "data": "+CSQ: 27,99\r\nOK", "error": null }
{ "success": false, "data": null, "error": "+CME ERROR: operation not allowed" }
```

- 模组 2 秒未回结束码时返回已收到的部分内容；服务端每条命令必答。
- 服务端每 30 秒发一次 `ping` 心跳，客户端应回 `pong`（收到客户端的 `ping` 也会回 `pong`）。
- 服务端初始化模组时会下发 `AT+CMEE=2`（手册 3.14），失败应答里是可读的错误描述而非数字编号。

### 伪命令

以下命令由服务端拦截处理，不会下发给模组：

| 命令 | 说明 |
|------|------|
| `AT+CONNECT?` | 查询 AT 通道类型，应答 `+CONNECT: 0`（网络）或 `+CONNECT: 1`（串口） |
| `AT+SCHED?` | 读取定时锁频配置与运行状态，应答 `+SCHED: {json}`，JSON 结构见 `schedconfig.go` 的 DTO |
| `AT+SCHED={json}` | 写入定时锁频配置：校验 → `uci set`/`commit` 落盘 → 调度器热生效，无需重启服务。`enabled` 总开关只能在 LuCI 修改 |
| `AT^CELLSCAN[...]` | 启动小区扫频（手册 5.35）。立即应答 `^CELLSCAN: STARTED`，结果通过 `cellscan` 推送异步返回 |
| `AT^CELLSCAN=ABORT` | 打断进行中的扫频（翻译成手册要求的 `abcd` 直写模组，绕过命令队列） |
| `AT^CELLSCAN=STATE` | 查询扫频状态，应答 `^CELLSCAN: RUNNING,<已扫到数量>` 或 `^CELLSCAN: IDLE`，供页面刷新后恢复界面 |

扫频期间模组被独占，其它 AT 命令会直接收到
`{"success":false,"error":"正在扫频，模组暂时无法响应其它命令，请先取消扫频"}`；
`AT+SCHED?` 与上述扫频伪命令不受影响。扫频超时由 UCI `cellscan_timeout` 控制（秒，默认 180）。

### 服务端推送

推送为 JSON：`{"type":"...","data":...}`，与命令应答互不干扰：

| type | data | 说明 |
|------|------|------|
| `raw_data` | string | 模组主动上报原文，一条一行。`^REJINFO`（网络拒绝原因，手册 13.14）与带逗号的 `+CUSD`（USSD 回复，手册 5.22）即使在命令执行期间也会透传 |
| `incoming_call` | object | 来电（号码、状态） |
| `new_sms` | object | 新短信（已解析 PDU） |
| `memory_full` | object | 短信存储满 |
| `pdcp_data` | object | PDCP 速率统计（`AT^PDCPDATAINFO=1` 开启后周期推送） |
| `cellscan` | object | 扫频进度：`{state, cell?, lines?, count, error?}`。`state=running` 时 `cell` 为单条 `^CELLSCAN:` 结果；`done`/`aborted`/`error` 为终态，`lines` 带全量结果。`aborted` 时已扫到的结果依然有效（手册 5.35.2） |

