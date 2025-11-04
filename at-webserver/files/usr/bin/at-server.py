import asyncio
import socket
import time
import re
import aiohttp
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional
import websockets
import json
import sys
import serial
import os
from datetime import datetime
import logging

# 配置日志
logging.basicConfig(
    level=logging.WARNING,  # 默认只记录警告和错误，减少日志输出
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
DEFAULT_CONFIG = {
    "AT_CONFIG": {
        "TYPE": "NETWORK",  # 可选值: "NETWORK" 或 "SERIAL"
        "NETWORK": {
            "HOST": "192.168.8.1",
            "PORT": 20249,
            "TIMEOUT": 10
        },
        "SERIAL": {
            "PORT": "COM6",  # 串口设备路径
            "BAUDRATE": 115200,  # 波特率
            "TIMEOUT": 10
        }
    },
    "NOTIFICATION_CONFIG": {
        "WECHAT_WEBHOOK": "",  # 企业微信webhook地址 不填写代表不启用
        "LOG_FILE": "",  # 短信通知日志文件路径 不填写代表不启用
        "NOTIFICATION_TYPES": {
            "SMS": True,          # 是否推送短信通知
            "CALL": True,         # 是否推送来电通知
            "MEMORY_FULL": True,  # 是否推送存储空间满通知
            "SIGNAL": True        # 是否推送信号变化通知
        }
    },
    # WebSocket 配置
    "WEBSOCKET_CONFIG": {
        "IPV4": {
            "HOST": "0.0.0.0",
            "PORT": 8765
        },
        "IPV6": {
            "HOST": "::",
            "PORT": 8765
        },
        "AUTH_KEY": ""  # 连接密钥（留空则不验证）
    }
}

def deep_merge(default: dict, custom: dict) -> dict:
    """深度合并配置字典"""
    result = default.copy()
    for key, value in custom.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

def load_config():
    """从 UCI 加载配置（优化版：一次性读取所有配置）"""
    import subprocess
    
    config = {
        'AT_CONFIG': DEFAULT_CONFIG['AT_CONFIG'].copy(),
        'NOTIFICATION_CONFIG': {
            'WECHAT_WEBHOOK': '',
            'LOG_FILE': '',
            'NOTIFICATION_TYPES': DEFAULT_CONFIG['NOTIFICATION_CONFIG']['NOTIFICATION_TYPES'].copy()
        },
        'WEBSOCKET_CONFIG': DEFAULT_CONFIG['WEBSOCKET_CONFIG'].copy()
    }
    
    logger.info("开始从 UCI 加载配置...")
    
    try:
        # 一次性读取所有 UCI 配置（性能优化：减少 90+ 次子进程调用为 1 次）
        result = subprocess.run(['uci', 'show', 'at-webserver'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode != 0:
            logger.warning("读取 UCI 配置失败，使用默认配置")
            return config
        
        # 解析 UCI 输出为字典
        uci_data = {}
        for line in result.stdout.strip().split('\n'):
            if '=' in line:
                key, value = line.split('=', 1)
                # 移除前缀 'at-webserver.config.'
                if key.startswith('at-webserver.config.'):
                    short_key = key.replace('at-webserver.config.', '')
                    uci_data[short_key] = value.strip("'\"")
        
        # 读取连接类型
        conn_type = uci_data.get('connection_type', 'NETWORK')
        config['AT_CONFIG']['TYPE'] = conn_type
        
        logger.info(f"配置加载: 连接类型 = {conn_type}")
        
        # 读取网络配置（从 uci_data 字典读取，无需额外子进程）
        if conn_type == 'NETWORK':
            host = uci_data.get('network_host', '192.168.8.1')
            port = int(uci_data.get('network_port', '20249'))
            timeout = int(uci_data.get('network_timeout', '10'))
            
            config['AT_CONFIG']['NETWORK']['HOST'] = host
            config['AT_CONFIG']['NETWORK']['PORT'] = port
            config['AT_CONFIG']['NETWORK']['TIMEOUT'] = timeout
            logger.info(f"配置加载: 网络连接 {host}:{port} (超时: {timeout}秒)")
        
        # 读取串口配置
        else:
            port = uci_data.get('serial_port', '/dev/ttyUSB0')
            
            # 如果选择了自定义路径，读取自定义值
            if port == 'custom':
                port = uci_data.get('serial_port_custom', '/dev/ttyUSB0')
            
            baudrate = int(uci_data.get('serial_baudrate', '115200'))
            timeout = int(uci_data.get('serial_timeout', '10'))
            
            config['AT_CONFIG']['SERIAL']['PORT'] = port
            config['AT_CONFIG']['SERIAL']['BAUDRATE'] = baudrate
            config['AT_CONFIG']['SERIAL']['TIMEOUT'] = timeout
            logger.info(f"配置加载: 串口连接 {port} @ {baudrate} bps (超时: {timeout}秒)")
        
        # 读取 WebSocket 端口
        ws_port = int(uci_data.get('websocket_port', '8765'))
        config['WEBSOCKET_CONFIG']['IPV4']['PORT'] = ws_port
        config['WEBSOCKET_CONFIG']['IPV6']['PORT'] = ws_port
        
        # 读取是否允许外网访问（仅作为配置记录，实际访问控制由防火墙管理）
        allow_wan = uci_data.get('websocket_allow_wan', '0') == '1'
        
        # WebSocket 始终监听所有网卡（0.0.0.0），以支持局域网访问
        # 如需限制外网访问，请通过防火墙规则实现
        config['WEBSOCKET_CONFIG']['IPV4']['HOST'] = '0.0.0.0'
        config['WEBSOCKET_CONFIG']['IPV6']['HOST'] = '::'
        
        # 读取连接密钥
        auth_key = uci_data.get('websocket_auth_key', '')
        config['WEBSOCKET_CONFIG']['AUTH_KEY'] = auth_key
        
        if allow_wan:
            logger.info(f"配置加载: WebSocket 端口 = {ws_port} (允许外网访问)")
            logger.warning("⚠ 外网访问已启用，请确保已配置防火墙规则保护")
        else:
            logger.info(f"配置加载: WebSocket 端口 = {ws_port} (局域网访问)")
            logger.info("💡 如需限制访问，建议配置防火墙规则")
        
        if auth_key:
            logger.info(f"配置加载: 连接密钥已设置 (长度: {len(auth_key)})")
        else:
            logger.info(f"配置加载: 连接密钥未设置 (允许无密钥访问)")
        
        # 读取通知配置
        wechat_webhook = uci_data.get('wechat_webhook', '')
        if wechat_webhook:
            config['NOTIFICATION_CONFIG']['WECHAT_WEBHOOK'] = wechat_webhook
            logger.info("配置加载: 企业微信推送已启用")
        
        log_file = uci_data.get('log_file', '')
        if log_file:
            config['NOTIFICATION_CONFIG']['LOG_FILE'] = log_file
            logger.info(f"配置加载: 日志文件 = {log_file}")
        
        # 读取通知类型开关
        for key, uci_key in [
            ('SMS', 'notify_sms'),
            ('CALL', 'notify_call'),
            ('MEMORY_FULL', 'notify_memory_full'),
            ('SIGNAL', 'notify_signal')
        ]:
            config['NOTIFICATION_CONFIG']['NOTIFICATION_TYPES'][key] = (
                uci_data.get(uci_key, '1') == '1'
            )
        
        # 读取定时锁频配置（从字典读取，避免大量子进程调用）
        schedule_enabled = uci_data.get('schedule_enabled', '0') == '1'
        check_interval = int(uci_data.get('schedule_check_interval', '60'))
        timeout = int(uci_data.get('schedule_timeout', '180'))
        unlock_lte = uci_data.get('schedule_unlock_lte', '1') == '1'
        unlock_nr = uci_data.get('schedule_unlock_nr', '1') == '1'
        toggle_airplane = uci_data.get('schedule_toggle_airplane', '1') == '1'
        
        # 夜间模式配置
        night_enabled = uci_data.get('schedule_night_enabled', '1') == '1'
        night_start = uci_data.get('schedule_night_start', '22:00')
        night_end = uci_data.get('schedule_night_end', '06:00')
        
        # 夜间 LTE 配置
        night_lte_type = int(uci_data.get('schedule_night_lte_type', '3'))
        night_lte_bands = uci_data.get('schedule_night_lte_bands', '')
        night_lte_arfcns = uci_data.get('schedule_night_lte_arfcns', '')
        night_lte_pcis = uci_data.get('schedule_night_lte_pcis', '')
        
        # 夜间 NR 配置
        night_nr_type = int(uci_data.get('schedule_night_nr_type', '3'))
        night_nr_bands = uci_data.get('schedule_night_nr_bands', '')
        night_nr_arfcns = uci_data.get('schedule_night_nr_arfcns', '')
        night_nr_scs_types = uci_data.get('schedule_night_nr_scs_types', '')
        night_nr_pcis = uci_data.get('schedule_night_nr_pcis', '')
        
        # 日间模式配置
        day_enabled = uci_data.get('schedule_day_enabled', '1') == '1'
        
        # 日间 LTE 配置
        day_lte_type = int(uci_data.get('schedule_day_lte_type', '3'))
        day_lte_bands = uci_data.get('schedule_day_lte_bands', '')
        day_lte_arfcns = uci_data.get('schedule_day_lte_arfcns', '')
        day_lte_pcis = uci_data.get('schedule_day_lte_pcis', '')
        
        # 日间 NR 配置
        day_nr_type = int(uci_data.get('schedule_day_nr_type', '3'))
        day_nr_bands = uci_data.get('schedule_day_nr_bands', '')
        day_nr_arfcns = uci_data.get('schedule_day_nr_arfcns', '')
        day_nr_scs_types = uci_data.get('schedule_day_nr_scs_types', '')
        day_nr_pcis = uci_data.get('schedule_day_nr_pcis', '')
        
        config['SCHEDULE_CONFIG'] = {
            'ENABLED': schedule_enabled,
            'CHECK_INTERVAL': check_interval,
            'TIMEOUT': timeout,
            'UNLOCK_LTE': unlock_lte,
            'UNLOCK_NR': unlock_nr,
            'TOGGLE_AIRPLANE': toggle_airplane,
            'NIGHT_ENABLED': night_enabled,
            'NIGHT_START': night_start,
            'NIGHT_END': night_end,
            'NIGHT_LTE_TYPE': night_lte_type,
            'NIGHT_LTE_BANDS': night_lte_bands,
            'NIGHT_LTE_ARFCNS': night_lte_arfcns,
            'NIGHT_LTE_PCIS': night_lte_pcis,
            'NIGHT_NR_TYPE': night_nr_type,
            'NIGHT_NR_BANDS': night_nr_bands,
            'NIGHT_NR_ARFCNS': night_nr_arfcns,
            'NIGHT_NR_SCS_TYPES': night_nr_scs_types,
            'NIGHT_NR_PCIS': night_nr_pcis,
            'DAY_ENABLED': day_enabled,
            'DAY_LTE_TYPE': day_lte_type,
            'DAY_LTE_BANDS': day_lte_bands,
            'DAY_LTE_ARFCNS': day_lte_arfcns,
            'DAY_LTE_PCIS': day_lte_pcis,
            'DAY_NR_TYPE': day_nr_type,
            'DAY_NR_BANDS': day_nr_bands,
            'DAY_NR_ARFCNS': day_nr_arfcns,
            'DAY_NR_SCS_TYPES': day_nr_scs_types,
            'DAY_NR_PCIS': day_nr_pcis
        }
        
        if schedule_enabled:
            logger.info(f"配置加载: 定时锁频已启用 (检测间隔: {check_interval}秒, 超时: {timeout}秒)")
            logger.info(f"  夜间模式: {'启用' if night_enabled else '禁用'} ({night_start}-{night_end})")
            logger.info(f"  日间模式: {'启用' if day_enabled else '禁用'}")
            logger.info(f"  解锁LTE: {'是' if unlock_lte else '否'}, 解锁NR: {'是' if unlock_nr else '否'}, 切飞行模式: {'是' if toggle_airplane else '否'}")
        
        logger.info("✓ UCI 配置加载完成")
        return config
        
    except Exception as e:
        logger.error(f"✗ 加载 UCI 配置失败: {e}，使用默认配置")
        return {
            'AT_CONFIG': DEFAULT_CONFIG['AT_CONFIG'],
            'NOTIFICATION_CONFIG': DEFAULT_CONFIG['NOTIFICATION_CONFIG'],
            'WEBSOCKET_CONFIG': DEFAULT_CONFIG['WEBSOCKET_CONFIG'],
            'SCHEDULE_CONFIG': {
                'ENABLED': False,
                'CHECK_INTERVAL': 60,
                'TIMEOUT': 180,
                'UNLOCK_LTE': True,
                'UNLOCK_NR': True,
                'TOGGLE_AIRPLANE': True,
                'NIGHT_ENABLED': True,
                'NIGHT_START': '22:00',
                'NIGHT_END': '06:00',
                'NIGHT_LTE_BANDS': '',
                'NIGHT_NR_BANDS': '',
                'DAY_ENABLED': True,
                'DAY_LTE_BANDS': '',
                'DAY_NR_BANDS': ''
            }
        }

# 加载配置
config = load_config()
AT_CONFIG = config['AT_CONFIG']
NOTIFICATION_CONFIG = config.get('NOTIFICATION_CONFIG', DEFAULT_CONFIG['NOTIFICATION_CONFIG'])
SCHEDULE_CONFIG = config.get('SCHEDULE_CONFIG', {
    'ENABLED': False,
    'CHECK_INTERVAL': 60,
    'TIMEOUT': 180,
    'UNLOCK_LTE': True,
    'UNLOCK_NR': True,
    'TOGGLE_AIRPLANE': True,
    'NIGHT_ENABLED': True,
    'NIGHT_START': '22:00',
    'NIGHT_END': '06:00',
    'NIGHT_LTE_BANDS': '',
    'NIGHT_NR_BANDS': '',
    'DAY_ENABLED': True,
    'DAY_LTE_BANDS': '',
    'DAY_NR_BANDS': ''
})


# ============= PDU 短信解码功能 =============
# GSM 7-bit 默认字母表
GSM_7BIT_ALPHABET = (
    "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?"
    "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà"
)

def decode_7bit(encoded_bytes, length):
    """解码7位GSM编码"""
    result = []
    shift = 0
    tmp = 0

    for byte in encoded_bytes:
        tmp |= byte << shift
        shift += 8

        while shift >= 7:
            result.append(tmp & 0x7F)
            tmp >>= 7
            shift -= 7

    if shift > 0 and len(result) < length:
        result.append(tmp & 0x7F)

    return ''.join(GSM_7BIT_ALPHABET[b] if b < len(GSM_7BIT_ALPHABET) else '?' for b in result[:length])

def decode_ucs2(encoded_bytes):
    """解码UCS2编码"""
    try:
        return encoded_bytes.decode('utf-16-be')
    except:
        return '?' * (len(encoded_bytes) // 2)

def decode_timestamp(timestamp_bytes):
    """解码时间戳"""
    try:
        year = f"20{((timestamp_bytes[0] & 0x0F) * 10) + (timestamp_bytes[0] >> 4)}"
        month = f"{((timestamp_bytes[1] & 0x0F) * 10) + (timestamp_bytes[1] >> 4):02d}"
        day = f"{((timestamp_bytes[2] & 0x0F) * 10) + (timestamp_bytes[2] >> 4):02d}"
        hour = f"{((timestamp_bytes[3] & 0x0F) * 10) + (timestamp_bytes[3] >> 4):02d}"
        minute = f"{((timestamp_bytes[4] & 0x0F) * 10) + (timestamp_bytes[4] >> 4):02d}"
        second = f"{((timestamp_bytes[5] & 0x0F) * 10) + (timestamp_bytes[5] >> 4):02d}"
        
        return datetime.strptime(f"{year}-{month}-{day} {hour}:{minute}:{second}", 
                               "%Y-%m-%d %H:%M:%S")
    except:
        return datetime.now()

def decode_number(number_bytes, number_length):
    """解码电话号码"""
    number = ''
    for byte in number_bytes:
        digit1 = byte & 0x0F
        digit2 = byte >> 4
        if digit1 <= 9:
            number += str(digit1)
        if len(number) < number_length and digit2 <= 9:
            number += str(digit2)
    return number

def read_incoming_sms(pdu_hex):
    """解析收到的短信PDU"""
    try:
        # 转换PDU为字节数组
        pdu_bytes = bytes.fromhex(pdu_hex)
        pos = 0

        # 跳过SMSC信息
        smsc_length = pdu_bytes[pos]
        pos += 1 + smsc_length

        # PDU类型
        pdu_type = pdu_bytes[pos]
        pos += 1

        # 发送者号码长度和类型
        sender_length = pdu_bytes[pos]
        pos += 1
        sender_type = pdu_bytes[pos]
        pos += 1

        # 解码发送者号码
        sender_bytes = pdu_bytes[pos:pos + (sender_length + 1) // 2]
        sender = decode_number(sender_bytes, sender_length)
        pos += (sender_length + 1) // 2

        # 跳过协议标识符
        pos += 1

        # 数据编码方案
        dcs = pdu_bytes[pos]
        is_ucs2 = (dcs & 0x0F) == 0x08
        pos += 1

        # 时间戳
        timestamp = decode_timestamp(pdu_bytes[pos:pos + 7])
        pos += 7

        # 用户数据长度和内容
        data_length = pdu_bytes[pos]
        pos += 1
        data_bytes = pdu_bytes[pos:]

        # 检查是否是分段短信
        udh_length = 0
        partial_info = None
        
        if pdu_type & 0x40:  # 有用户数据头
            udh_length = data_bytes[0] + 1
            if udh_length >= 6:  # 最小的分段短信UDH长度
                iei = data_bytes[1]
                if iei == 0x00 or iei == 0x08:  # 分段短信标识
                    ref = data_bytes[3]
                    total = data_bytes[4]
                    seq = data_bytes[5]
                    partial_info = {
                        "reference": ref,
                        "parts_count": total,
                        "part_number": seq
                    }

        # 解码短信内容
        content_bytes = data_bytes[udh_length:]
        if is_ucs2:
            content = decode_ucs2(content_bytes)
        else:
            # 对于7位编码，需要调整实际长度
            actual_length = (data_length * 7) // 8
            if data_length * 7 % 8 != 0:
                actual_length += 1
            content = decode_7bit(content_bytes, data_length)

        return {
            'sender': sender,
            'content': content,
            'date': timestamp,
            'partial': partial_info
        }

    except Exception as e:
        logger.error(f"PDU解码错误: {e}")
        return {
            'sender': 'unknown',
            'content': f'PDU解码失败: {pdu_hex}',
            'date': datetime.now(),
            'partial': None
        }


# ============= 数据模型 =============
@dataclass
class SMS:
    """短信数据模型"""
    index: str
    sender: str
    content: str
    timestamp: str
    partial: Optional[dict] = None


@dataclass
class ATResponse:
    """AT命令响应数据模型"""
    success: bool
    data: str = None
    error: str = None

    def to_dict(self) -> dict:
        return asdict(self)


# ============= 通知系统 =============
class NotificationChannel(ABC):
    """通知渠道基类"""

    @abstractmethod
    async def send(self, sender: str, content: str, is_memory_full: bool = False) -> bool:
        """发送通知"""
        pass


class WeChatNotification(NotificationChannel):
    """企业微信通知实现"""

    def __init__(self, webhook_url: str):
        if not webhook_url:
            raise ValueError("webhook URL 不能为空")
        self.webhook_url = webhook_url
        self.max_retries = 3
        self.retry_delay = 1
        self.send_interval = 60
        self._queue = asyncio.Queue()
        self._background_task = None
        self._running = False
        self._last_send_time = 0
        self._pending_messages = []

    async def start(self):
        """启动后台处理任务"""
        if not self._running:
            self._running = True
            self._background_task = asyncio.create_task(self._process_queue())

    async def stop(self):
        """停止后台处理任务"""
        self._running = False
        if self._background_task:
            self._background_task.cancel()
            try:
                await self._background_task
            except asyncio.CancelledError:
                pass
            self._background_task = None

    async def send(self, sender: str, content: str, is_memory_full: bool = False) -> bool:
        """将消息加入队列"""
        if not self._running:
            await self.start()
        await self._queue.put((sender, content, is_memory_full))
        return True

    async def _process_queue(self):
        """后台处理消息队列（优化：限制队列大小，防止内存泄漏）"""
        max_pending_messages = 1000  # 最多缓存 1000 条消息
        
        while self._running:
            try:
                try:
                    sender, content, is_memory_full = await asyncio.wait_for(
                        self._queue.get(), 
                        timeout=1.0
                    )
                    # 将消息添加到待发送列表（限制大小，防止内存泄漏）
                    if len(self._pending_messages) < max_pending_messages:
                        self._pending_messages.append((sender, content, is_memory_full))
                    else:
                        logger.warning(f"待发送消息队列已满 ({max_pending_messages})，丢弃旧消息")
                        self._pending_messages.pop(0)  # 删除最旧的
                        self._pending_messages.append((sender, content, is_memory_full))
                    self._queue.task_done()
                except asyncio.TimeoutError:
                    pass

                current_time = time.time()
                if (self._pending_messages and 
                    current_time - self._last_send_time >= self.send_interval):
                    combined_message = self._combine_messages(self._pending_messages)
                    asyncio.create_task(self._do_send("批量通知", combined_message, False))
                    self._last_send_time = current_time
                    self._pending_messages.clear()

                await asyncio.sleep(1)  

            except Exception as e:
                logger.error(f"处理通知队列出错: {e}")
                await asyncio.sleep(1)

    def _combine_messages(self, messages) -> str:
        """合并多条消息"""
        if not messages:
            return ""
        if len(messages) == 1:
            sender, content, is_memory_full = messages[0]
            if is_memory_full:
                return "⚠️ 警告：短信存储空间已满\n请及时处理，否则可能无法接收新短信"
            elif sender == "来电提醒":
                return f"📞 来电提醒\n{content}"
            elif sender == "信号监控":
                return content
            else:
                return f"📱 新短信通知\n发送者: {sender}\n内容: {content}"

        combined = "📑 批量通知汇总\n" + "=" * 20 + "\n"
        for i, (sender, content, is_memory_full) in enumerate(messages, 1):
            if is_memory_full:
                combined += f"\n{i}. ⚠️ 存储空间已满警告"
            elif sender == "来电提醒":
                combined += f"\n{i}. 📞 {content}"
            elif sender == "信号监控":
                combined += f"\n{i}. 📶 {content}"
            else:
                combined += f"\n{i}. 📱 来自 {sender} 的短信:\n{content}"
            combined += "\n" + "-" * 20

        return combined

    async def _do_send(self, sender: str, content: str, is_memory_full: bool = False):
        """实际发送消息的方法"""
        retries = 0
        while retries < self.max_retries:
            try:
                timeout = aiohttp.ClientTimeout(total=5)
                connector = aiohttp.TCPConnector(
                    force_close=True,
                    enable_cleanup_closed=True,
                    ssl=False
                )
                
                async with aiohttp.ClientSession(
                    timeout=timeout, 
                    connector=connector
                ) as session:
                    message = {
                        "msgtype": "text",
                        "text": {"content": content}
                    }
                    
                    async with session.post(
                        self.webhook_url,
                        json=message,
                        headers={
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0'
                        }
                    ) as response:
                        response_text = await response.text()
                        
                        if response.status == 200:
                            try:
                                result = await response.json()
                                if result.get('errcode') == 0:
                                    logger.info(f"企业微信通知发送成功: {sender}")
                                    return
                                else:
                                    raise Exception(f"企业微信API错误: {result}")
                            except json.JSONDecodeError as je:
                                raise Exception(f"响应解析失败: {je}")
                        
                        raise Exception(f"HTTP错误 {response.status}: {response_text}")

            except Exception as e:
                if isinstance(e, (asyncio.TimeoutError, asyncio.CancelledError)):
                    logger.warning(f"请求被取消或超时: {str(e)}")
                    return
                    
                retries += 1
                logger.warning(f"发送失败 (尝试 {retries}/{self.max_retries}): {str(e)}")
                
                if retries < self.max_retries:
                    wait_time = self.retry_delay * retries
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"达到最大重试次数，放弃发送")
                    return


class LogNotification(NotificationChannel):
    """日志通知实现"""

    def __init__(self, log_file: str):
        self.log_file = log_file
        
        # 确保使用绝对路径
        if not os.path.isabs(log_file):
            self.log_file = os.path.abspath(log_file)
            logger.warning(f"⚠ 日志文件使用相对路径，已转换为绝对路径: {self.log_file}")
        
        # 确保日志文件目录存在
        log_dir = os.path.dirname(self.log_file)
        if log_dir:  # 只有当有目录时才检查
            if not os.path.exists(log_dir):
                try:
                    os.makedirs(log_dir, mode=0o755, exist_ok=True)
                    logger.info(f"✓ 创建日志目录: {log_dir}")
                except Exception as e:
                    logger.error(f"✗ 创建日志目录失败 {log_dir}: {e}")
                    raise  # 抛出异常，阻止初始化
            
            # 检查目录权限
            if not os.access(log_dir, os.W_OK):
                logger.error(f"✗ 日志目录无写入权限: {log_dir}")
                raise PermissionError(f"无法写入日志目录: {log_dir}")
        
        # 测试写入
        try:
            test_content = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 日志系统初始化测试\n"
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(test_content)
            logger.info(f"✓ 日志通知已启用: {self.log_file}")
            logger.info(f"✓ 日志文件写入测试成功")
        except Exception as e:
            logger.error(f"✗ 日志文件写入测试失败: {e}")
            raise  # 抛出异常，阻止初始化

    async def send(self, sender: str, content: str, is_memory_full: bool = False) -> bool:
        try:
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            if is_memory_full:
                log_content = f"[{timestamp}] 存储空间已满警告\n"
            else:
                log_content = f"[{timestamp}] 发送者: {sender}\n内容: {content}\n"

            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(log_content + "-" * 50 + "\n")
            logger.info(f"✓ 日志已写入: {self.log_file}")
            return True
        except Exception as e:
            logger.error(f"✗ 日志记录失败: {e}")
            return False


class NotificationManager:
    """通知管理器"""

    def __init__(self):
        logger.info("=" * 60)
        logger.info("正在初始化通知管理器...")
        logger.info("=" * 60)
        
        self.channels: List[NotificationChannel] = []
        self.notification_types = NOTIFICATION_CONFIG.get("NOTIFICATION_TYPES", {
            "SMS": True,
            "CALL": True,
            "MEMORY_FULL": True,
            "SIGNAL": True
        })
        
        logger.info(f"通知类型配置: {self.notification_types}")
        
        # 检查企业微信 webhook 配置
        wechat_webhook = NOTIFICATION_CONFIG.get("WECHAT_WEBHOOK", "")
        if wechat_webhook:
            try:
                self.channels.append(WeChatNotification(webhook_url=wechat_webhook))
                logger.info(f"✓ 企业微信通知已启用: {wechat_webhook[:50]}...")
            except Exception as e:
                logger.warning(f"✗ 企业微信通知初始化失败: {e}")
        else:
            logger.info("○ 企业微信通知未配置")
            
        # 检查日志文件配置
        log_file = NOTIFICATION_CONFIG.get("LOG_FILE", "")
        if log_file:
            try:
                self.channels.append(LogNotification(log_file))
            except Exception as e:
                logger.error(f"✗ 日志通知初始化失败: {e}")
        else:
            logger.info("○ 日志文件未配置")
        
        logger.info(f"通知管理器初始化完成，共 {len(self.channels)} 个通知渠道")
        logger.info("=" * 60)

    async def start(self):
        """启动所有通知渠道"""
        for channel in self.channels:
            if isinstance(channel, WeChatNotification):
                await channel.start()

    async def stop(self):
        """停止所有通知渠道"""
        for channel in self.channels:
            if isinstance(channel, WeChatNotification):
                await channel.stop()

    async def notify_all(self, sender: str, content: str, notification_type: str = "SMS", is_memory_full: bool = False):
        """向所有通知渠道发送消息
        
        Args:
            sender: 发送者
            content: 内容
            notification_type: 通知类型 ("SMS", "CALL", "MEMORY_FULL", "SIGNAL")
            is_memory_full: 是否是存储空间满通知
        """
        # 检查该类型的通知是否启用
        if not self.notification_types.get(notification_type, True):
            logger.debug(f"通知类型 {notification_type} 已禁用，跳过推送")
            return

        for channel in self.channels:
            await channel.send(sender, content, is_memory_full)


def handle_connection_error(func):
    """连接错误处理装饰器"""
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ConnectionError as e:
            logger.error(f"连接错误: {e}")
            return False
        except Exception as e:
            logger.error(f"未知错误: {e}")
            return False
    return wrapper


# ============= 消息处理器 =============
class MessageHandler(ABC):
    """消息处理器基类"""
    async def can_handle(self, line: str) -> bool:
        """判断是否可以处理该消息"""
        return False

    @abstractmethod
    async def handle(self, line: str, client: 'ATClient') -> None:
        """处理消息"""
        pass


class CallHandler(MessageHandler):
    """来电处理器"""

    def __init__(self):
        self.last_call_number = None
        self.last_call_time = 0
        self.call_timeout = 30  # 30秒内的重复来电不再通知
        self.ring_received = False
        self.current_call_state = "idle"

    async def can_handle(self, line: str) -> bool:
        return ("RING" in line or
                "IRING" in line or
                line.startswith("+CLIP:") or
                "^CEND:" in line or
                "NO CARRIER" in line)

    async def handle(self, line: str, client: 'ATClient') -> None:
        try:
            if "RING" in line or "IRING" in line:
                self.ring_received = True
                self.current_call_state = "ringing"

            elif line.startswith("+CLIP:"):
                if not self.ring_received:
                    self.current_call_state = "ringing"

                match = re.search(r'\+CLIP: *"([^"]+)"', line)
                if match:
                    phone_number = match.group(1)
                    current_time = time.time()

                    should_notify = (
                            phone_number != self.last_call_number or
                            current_time - self.last_call_time > self.call_timeout or
                            self.current_call_state == "idle"
                    )

                    if should_notify:
                        self.last_call_number = phone_number
                        self.last_call_time = current_time
                        self.current_call_state = "ringing"

                        time_str = time.strftime("%Y-%m-%d %H:%M:%S")
                        content = f"时间：{time_str}\n号码：{phone_number}\n状态：来电振铃"

                        # 发送通知
                        await client.notification_manager.notify_all("来电提醒", content, "CALL")

                        # WebSocket推送
                        await client.websocket_server.broadcast({
                            "type": "incoming_call",
                            "data": {
                                "time": time_str,
                                "number": phone_number,
                                "state": "ringing"
                            }
                        })

            elif "^CEND:" in line or "NO CARRIER" in line:
                if self.last_call_number:
                    time_str = time.strftime("%Y-%m-%d %H:%M:%S")
                    content = f"时间：{time_str}\n号码：{self.last_call_number}\n状态：通话结束"

                    # 发送通话结束通知
                    await client.notification_manager.notify_all("来电提醒", content, "CALL")

                    # WebSocket推送通话结束状态
                    await client.websocket_server.broadcast({
                        "type": "incoming_call",
                        "data": {
                            "time": time_str,
                            "number": self.last_call_number,
                            "state": "ended"
                        }
                    })

                # 重置所有状态
                self.last_call_number = None
                self.last_call_time = 0
                self.ring_received = False
                self.current_call_state = "idle"

        except Exception as e:
            logger.error(f"来电处理错误: {e}")


class MemoryFullHandler(MessageHandler):
    """存储空间满处理器"""

    def __init__(self):
        self.notified = False

    async def can_handle(self, line: str) -> bool:
        return ("CMS ERROR: 322" in line or
                "MEMORY FULL" in line or
                "^SMMEMFULL" in line)

    async def handle(self, line: str, client: 'ATClient') -> None:
        if not self.notified:
            await client.notification_manager.notify_all("", "", "MEMORY_FULL", is_memory_full=True)
            self.notified = True


class NewSMSHandler(MessageHandler):
    """新短信处理器"""

    async def can_handle(self, line: str) -> bool:
        return bool(re.match(r"\+CMTI: \"(ME|SM)\",(\d+)", line))

    async def handle(self, line: str, client: 'ATClient') -> None:
        match = re.match(r"\+CMTI: \"(ME|SM)\",(\d+)", line)
        if match:
            storage = match.group(1)
            index = match.group(2)
            logger.info(f"收到新短信，存储区: {storage}，索引: {index}")

            # 处理短信
            command = f"AT+CMGR={index}\r\n"
            response = await client.send_command(command)
            sms_list = client._parse_sms(response)

            for sms in sms_list:
                # 发送通知
                if sms.partial:
                    await client._handle_partial_sms(sms)
                else:
                    await client.notification_manager.notify_all(sms.sender, sms.content, "SMS")

                    # WebSocket推送
                    await client.websocket_server.broadcast({
                        "type": "new_sms",
                        "data": {
                            "sender": sms.sender,
                            "content": sms.content,
                            "time": sms.timestamp
                        }
                    })


class PDCPDataHandler(MessageHandler):
    """PDCP数据信息处理器"""

    def __init__(self):
        self.enabled = False
        self.interval = 0

    async def can_handle(self, line: str) -> bool:
        return line.startswith("^PDCPDATAINFO:")

    async def handle(self, line: str, client: 'ATClient') -> None:
        try:
            # 解析PDCP数据信息
            parts = line.replace("^PDCPDATAINFO:", "").strip().split(",")
            if len(parts) >= 14:
                pdcp_data = {
                    "id": int(parts[0]),
                    "pduSessionId": int(parts[1]),
                    "discardTimerLen": int(parts[2]),
                    "avgDelay": float(parts[3]) / 10,
                    "minDelay": float(parts[4]) / 10,
                    "maxDelay": float(parts[5]) / 10,
                    "highPriQueMaxBuffTime": float(parts[6]) / 10,
                    "lowPriQueMaxBuffTime": float(parts[7]) / 10,
                    "highPriQueBuffPktNums": int(parts[8]),
                    "lowPriQueBuffPktNums": int(parts[9]),
                    "ulPdcpRate": int(parts[10]),
                    "dlPdcpRate": int(parts[11]),
                    "ulDiscardCnt": int(parts[12]),
                    "dlDiscardCnt": int(parts[13])
                }

                # WebSocket推送
                await client.websocket_server.broadcast({
                    "type": "pdcp_data",
                    "data": pdcp_data
                })

        except Exception as e:
            logger.error(f"PDCP数据处理错误: {e}")


class NetworkSignalHandler(MessageHandler):
    """网络信号监控处理器"""

    def __init__(self):
        self.last_signal_data = None
        self.last_sys_mode = None
        self.signal_change_threshold = 1

    async def _get_monsc_info(self, client: 'ATClient') -> dict:
        """获取并解析MONSC信息"""
        try:
            response = await client.send_command("AT^MONSC\r\n")
            if response:
                text = response.decode('ascii', errors='ignore')
                for line in text.split('\n'):
                    if line.startswith('^MONSC:'):
                        parts = line.replace('^MONSC:', '').strip().split(',')
                        if len(parts) < 2:
                            return {}
                            
                        rat = parts[0].strip('"')
                        result = {"rat": rat}
                        
                        if rat == "NONE":
                            return result
                            
                        if rat == "NR":
                            if len(parts) >= 11:
                                result.update({
                                    "mcc": parts[1],
                                    "mnc": parts[2],
                                    "arfcn": parts[3],
                                    "cell_id": parts[5],
                                    "pci": int(parts[6], 16), 
                                    "tac": parts[7],
                                    "rsrp": int(parts[8]),
                                    "rsrq": float(parts[9]),
                                    "sinr": float(parts[10]) if parts[10] else None
                                })
                        elif rat == "LTE":
                            if len(parts) >= 10:
                                result.update({
                                    "mcc": parts[1],
                                    "mnc": parts[2],
                                    "arfcn": parts[3],
                                    "cell_id": parts[4],
                                    "pci": int(parts[5], 16),  
                                    "tac": parts[6],
                                    "rsrp": int(parts[7]),
                                    "rsrq": int(parts[8]),
                                    "rssi": int(parts[9])
                                })
                        return result
            return {}
        except Exception as e:
            logger.error(f"解析MONSC信息错误: {e}")
            return {}

    async def _send_notification(self, signal_data, current_sys_mode, client):
        """发送信号变动通知"""
        try:
            monsc_info = await self._get_monsc_info(client)
            
            rsrp = signal_data.get("rsrp", 0)
            signal_level = "优秀" if rsrp >= -85 else \
                         "良好" if rsrp >= -95 else \
                         "一般" if rsrp >= -105 else \
                         "较差"

            message = (
                f"📶 信号变动通知\n"
                f"时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
                f"制式: {monsc_info.get('rat', '未知')}\n"
                f"信号: {signal_level}\n"
            )

            if monsc_info.get("rat") == "NR":
                message += (
                    f"RSRP: {monsc_info.get('rsrp', 0)} dBm\n"
                    f"RSRQ: {monsc_info.get('rsrq', 0)} dB\n"
                    f"SINR: {monsc_info.get('sinr', 0)} dB\n"
                    f"\n📡 小区信息:\n"
                    f"频点: {monsc_info.get('arfcn', '未知')}\n"
                    f"PCI: {monsc_info.get('pci', '未知')}\n"
                    f"TAC: {monsc_info.get('tac', '未知')}\n"
                    f"小区ID: {monsc_info.get('cell_id', '未知')}"
                )
            elif monsc_info.get("rat") == "LTE":
                message += (
                    f"RSRP: {monsc_info.get('rsrp', 0)} dBm\n"
                    f"RSRQ: {monsc_info.get('rsrq', 0)} dB\n"
                    f"RSSI: {monsc_info.get('rssi', 0)} dBm\n"
                    f"\n📡 小区信息:\n"
                    f"频点: {monsc_info.get('arfcn', '未知')}\n"
                    f"PCI: {monsc_info.get('pci', '未知')}\n"
                    f"TAC: {monsc_info.get('tac', '未知')}\n"
                    f"小区ID: {monsc_info.get('cell_id', '未知')}"
                )

            if current_sys_mode != self.last_sys_mode:
                message = f"⚡ 网络切换提醒\n{message}"

            await client.notification_manager.notify_all("信号监控", message, "SIGNAL")

        except Exception as e:
            logger.error(f"发送通知错误: {e}")

    async def handle(self, line: str, client: 'ATClient') -> None:
        """处理信号相关的AT命令响应"""
        try:
            line = line.split('\n')[0] 
            signal_data = {}
            current_sys_mode = None
            force_notify = False

            if "^CERSSI:" in line:
                parts = line.replace('^CERSSI:', '').strip().split(',')
                if len(parts) >= 19: 
                    rsrp = int(parts[18])  
                    rsrq = int(parts[19])
                    sinr = int(parts[20]) if len(parts) > 20 else 0 
                    
                    signal_data = {
                        "sys_mode": "4G/5G",
                        "rsrp": rsrp,
                        "rsrq": rsrq,
                        "sinr": sinr
                    }
                    current_sys_mode = "4G/5G"

            elif "^HCSQ:" in line:
                parts = line.replace('^HCSQ:', '').strip().split(',')
                if len(parts) >= 4:
                    sys_mode = parts[0].strip('"')
                    rsrp_raw = int(parts[1])
                    sinr_raw = int(parts[2])
                    rsrq_raw = int(parts[3])
                    
                    rsrp = -140 + rsrp_raw
                    sinr = sinr_raw * 0.2 - 20
                    rsrq = rsrq_raw * 0.5 - 20
                    
                    signal_data = {
                        "sys_mode": sys_mode,
                        "rsrp": rsrp,
                        "rsrq": rsrq,
                        "sinr": sinr
                    }
                    current_sys_mode = sys_mode

            if signal_data:
                if self.last_signal_data is None:
                    force_notify = True
                else:
                    rsrp_change = abs(signal_data['rsrp'] - self.last_signal_data['rsrp'])
                    if rsrp_change >= self.signal_change_threshold:
                        force_notify = True
                if current_sys_mode != self.last_sys_mode:
                    force_notify = True

                if force_notify:
                    await self._send_notification(signal_data, current_sys_mode, client)
                    self.last_signal_data = signal_data.copy()
                    self.last_sys_mode = current_sys_mode

        except Exception as e:
            logger.error(f"信号处理错误: {e}")

    async def can_handle(self, line: str) -> bool:
        return "^CERSSI:" in line or "^HCSQ:" in line


class MessageProcessor:
    """消息处理器管理类"""

    def __init__(self):
        self.handlers = [
            CallHandler(),          # 处理来电通知
            MemoryFullHandler(),    # 处理存储空间满的警告
            NewSMSHandler(),        # 处理新短信通知
            NetworkSignalHandler(), # 处理网络信号变化
            PDCPDataHandler()       # 处理PDCP数据信息
        ]

    async def process(self, line: str, client: 'ATClient') -> None:
        for handler in self.handlers:
            if await handler.can_handle(line):
                await handler.handle(line, client)
                break


class ScheduleFrequencyLock:
    """定时锁频监控类"""
    
    def __init__(self, client: 'ATClient'):
        self.client = client
        self.enabled = SCHEDULE_CONFIG['ENABLED']
        self.check_interval = SCHEDULE_CONFIG['CHECK_INTERVAL']
        self.timeout = SCHEDULE_CONFIG['TIMEOUT']
        self.unlock_lte = SCHEDULE_CONFIG['UNLOCK_LTE']
        self.unlock_nr = SCHEDULE_CONFIG['UNLOCK_NR']
        self.toggle_airplane = SCHEDULE_CONFIG['TOGGLE_AIRPLANE']
        self.night_enabled = SCHEDULE_CONFIG['NIGHT_ENABLED']
        self.night_start = SCHEDULE_CONFIG['NIGHT_START']
        self.night_end = SCHEDULE_CONFIG['NIGHT_END']
        self.night_lte_type = SCHEDULE_CONFIG['NIGHT_LTE_TYPE']
        self.night_lte_bands = SCHEDULE_CONFIG['NIGHT_LTE_BANDS']
        self.night_lte_arfcns = SCHEDULE_CONFIG['NIGHT_LTE_ARFCNS']
        self.night_lte_pcis = SCHEDULE_CONFIG['NIGHT_LTE_PCIS']
        self.night_nr_type = SCHEDULE_CONFIG['NIGHT_NR_TYPE']
        self.night_nr_bands = SCHEDULE_CONFIG['NIGHT_NR_BANDS']
        self.night_nr_arfcns = SCHEDULE_CONFIG['NIGHT_NR_ARFCNS']
        self.night_nr_scs_types = SCHEDULE_CONFIG['NIGHT_NR_SCS_TYPES']
        self.night_nr_pcis = SCHEDULE_CONFIG['NIGHT_NR_PCIS']
        self.day_enabled = SCHEDULE_CONFIG['DAY_ENABLED']
        self.day_lte_type = SCHEDULE_CONFIG['DAY_LTE_TYPE']
        self.day_lte_bands = SCHEDULE_CONFIG['DAY_LTE_BANDS']
        self.day_lte_arfcns = SCHEDULE_CONFIG['DAY_LTE_ARFCNS']
        self.day_lte_pcis = SCHEDULE_CONFIG['DAY_LTE_PCIS']
        self.day_nr_type = SCHEDULE_CONFIG['DAY_NR_TYPE']
        self.day_nr_bands = SCHEDULE_CONFIG['DAY_NR_BANDS']
        self.day_nr_arfcns = SCHEDULE_CONFIG['DAY_NR_ARFCNS']
        self.day_nr_scs_types = SCHEDULE_CONFIG['DAY_NR_SCS_TYPES']
        self.day_nr_pcis = SCHEDULE_CONFIG['DAY_NR_PCIS']
        
        self.last_service_time = time.time()
        self.is_switching = False
        self.switch_count = 0
        self.current_mode = None  # 'night' 或 'day'
        
        if self.enabled:
            logger.info("=" * 60)
            logger.info("定时锁频功能已启用")
            logger.info(f"  检测间隔: {self.check_interval} 秒")
            logger.info(f"  无服务超时: {self.timeout} 秒")
            logger.info(f"  夜间模式: {'启用' if self.night_enabled else '禁用'} ({self.night_start}-{self.night_end})")
            logger.info(f"  日间模式: {'启用' if self.day_enabled else '禁用'}")
            logger.info(f"  解锁LTE: {'是' if self.unlock_lte else '否'}, 解锁NR: {'是' if self.unlock_nr else '否'}, 切飞行模式: {'是' if self.toggle_airplane else '否'}")
            logger.info("=" * 60)
    
    def is_night_time(self) -> bool:
        """判断当前是否为夜间时段"""
        try:
            now = datetime.now()
            current_time = now.strftime('%H:%M')
            
            # 解析时间
            start_hour, start_min = map(int, self.night_start.split(':'))
            end_hour, end_min = map(int, self.night_end.split(':'))
            
            start_minutes = start_hour * 60 + start_min
            end_minutes = end_hour * 60 + end_min
            current_minutes = now.hour * 60 + now.minute
            
            # 处理跨天情况（如 22:00-06:00）
            if start_minutes > end_minutes:
                return current_minutes >= start_minutes or current_minutes < end_minutes
            else:
                return start_minutes <= current_minutes < end_minutes
                
        except Exception as e:
            logger.error(f"判断夜间时段失败: {e}")
            return False
    
    def get_current_mode(self) -> str:
        """获取当前应该使用的模式"""
        if self.is_night_time() and self.night_enabled:
            return 'night'
        elif not self.is_night_time() and self.day_enabled:
            return 'day'
        else:
            return None
    
    def get_lock_config_for_mode(self, mode: str) -> dict:
        """获取指定模式的锁频配置"""
        if mode == 'night':
            return {
                'lte_type': self.night_lte_type,
                'lte_bands': self.night_lte_bands,
                'lte_arfcns': self.night_lte_arfcns,
                'lte_pcis': self.night_lte_pcis,
                'nr_type': self.night_nr_type,
                'nr_bands': self.night_nr_bands,
                'nr_arfcns': self.night_nr_arfcns,
                'nr_scs_types': self.night_nr_scs_types,
                'nr_pcis': self.night_nr_pcis
            }
        elif mode == 'day':
            return {
                'lte_type': self.day_lte_type,
                'lte_bands': self.day_lte_bands,
                'lte_arfcns': self.day_lte_arfcns,
                'lte_pcis': self.day_lte_pcis,
                'nr_type': self.day_nr_type,
                'nr_bands': self.day_nr_bands,
                'nr_arfcns': self.day_nr_arfcns,
                'nr_scs_types': self.day_nr_scs_types,
                'nr_pcis': self.day_nr_pcis
            }
        else:
            return {
                'lte_type': 0, 'lte_bands': '', 'lte_arfcns': '', 'lte_pcis': '',
                'nr_type': 0, 'nr_bands': '', 'nr_arfcns': '', 'nr_scs_types': '', 'nr_pcis': ''
            }
    
    async def check_network_status(self) -> bool:
        """检查网络状态，返回 True 表示有服务"""
        try:
            # 查询网络注册状态
            response = await self.client.send_command("AT+CREG?\r\n")
            response_text = response.decode('ascii', errors='ignore')
            
            # +CREG: 0,1 或 +CREG: 0,5 表示已注册
            if '+CREG: 0,1' in response_text or '+CREG: 0,5' in response_text:
                return True
            
            # 也检查 LTE/5G 注册状态
            response = await self.client.send_command("AT+CEREG?\r\n")
            response_text = response.decode('ascii', errors='ignore')
            
            if '+CEREG: 0,1' in response_text or '+CEREG: 0,5' in response_text:
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"检查网络状态失败: {e}")
            return False
    
    async def set_frequency_lock(self, config: dict, mode: str):
        """设置频段锁定"""
        if self.is_switching:
            return
        
        self.is_switching = True
        self.switch_count += 1
        
        try:
            logger.info("=" * 60)
            logger.info(f"🔄 切换到{mode}模式锁频设置 (第 {self.switch_count} 次)")
            logger.info("=" * 60)
            
            operations = []
            
            # 1. 进入飞行模式
            if self.toggle_airplane:
                logger.info("步骤 1: 进入飞行模式...")
                response = await self.client.send_command("AT+CFUN=0\r\n")
                if 'OK' in response.decode('ascii', errors='ignore'):
                    logger.info("✓ 进入飞行模式")
                    await asyncio.sleep(2)
                else:
                    logger.warning("✗ 进入飞行模式失败")
            
            # 2. 设置 LTE 锁频
            lte_type = config.get('lte_type', 0)
            if lte_type > 0:
                lte_bands = config.get('lte_bands', '')
                lte_arfcns = config.get('lte_arfcns', '')
                lte_pcis = config.get('lte_pcis', '')
                
                if lte_bands and lte_bands.strip():
                    bands_list = [b.strip() for b in lte_bands.split(',') if b.strip()]
                    if bands_list:
                        command = self._build_lte_command(lte_type, bands_list, lte_arfcns, lte_pcis)
                        logger.info(f"步骤 2: 设置 LTE 锁频 (类型: {lte_type})...")
                        logger.info(f"  命令: {command.strip()}")
                        
                        response = await self.client.send_command(command)
                        response_text = response.decode('ascii', errors='ignore')
                        if 'OK' in response_text:
                            logger.info(f"✓ LTE 锁频成功")
                            operations.append(f"LTE锁频(类型{lte_type})")
                        else:
                            logger.warning(f"✗ LTE 锁频失败: {response_text}")
                        await asyncio.sleep(1)
            else:
                # 解锁 LTE
                if self.unlock_lte:
                    logger.info("步骤 2: 解锁 LTE...")
                    response = await self.client.send_command("AT^LTEFREQLOCK=0\r\n")
                    response_text = response.decode('ascii', errors='ignore')
                    if 'OK' in response_text:
                        logger.info("✓ LTE 解锁成功")
                        operations.append("LTE解锁")
                    else:
                        logger.warning(f"✗ LTE 解锁失败: {response_text}")
                    await asyncio.sleep(1)
            
            # 3. 设置 NR 锁频
            nr_type = config.get('nr_type', 0)
            if nr_type > 0:
                nr_bands = config.get('nr_bands', '')
                nr_arfcns = config.get('nr_arfcns', '')
                nr_scs_types = config.get('nr_scs_types', '')
                nr_pcis = config.get('nr_pcis', '')
                
                if nr_bands and nr_bands.strip():
                    bands_list = [b.strip() for b in nr_bands.split(',') if b.strip()]
                    if bands_list:
                        command = self._build_nr_command(nr_type, bands_list, nr_arfcns, nr_scs_types, nr_pcis)
                        logger.info(f"步骤 3: 设置 NR 锁频 (类型: {nr_type})...")
                        logger.info(f"  命令: {command.strip()}")
                        
                        response = await self.client.send_command(command)
                        response_text = response.decode('ascii', errors='ignore')
                        if 'OK' in response_text:
                            logger.info(f"✓ NR 锁频成功")
                            operations.append(f"NR锁频(类型{nr_type})")
                        else:
                            logger.warning(f"✗ NR 锁频失败: {response_text}")
                        await asyncio.sleep(1)
            else:
                # 解锁 NR
                if self.unlock_nr:
                    logger.info("步骤 3: 解锁 NR...")
                    response = await self.client.send_command("AT^NRFREQLOCK=0\r\n")
                    response_text = response.decode('ascii', errors='ignore')
                    if 'OK' in response_text:
                        logger.info("✓ NR 解锁成功")
                        operations.append("NR解锁")
                    else:
                        logger.warning(f"✗ NR 解锁失败: {response_text}")
                    await asyncio.sleep(1)
            
            # 4. 退出飞行模式使配置生效
            if self.toggle_airplane:
                logger.info("步骤 4: 退出飞行模式使配置生效...")
                response = await self.client.send_command("AT+CFUN=1\r\n")
                if 'OK' in response.decode('ascii', errors='ignore'):
                    logger.info("✓ 退出飞行模式")
                    operations.append("切飞行模式")
                else:
                    logger.warning("✗ 退出飞行模式失败")
                await asyncio.sleep(3)
            
            # 发送通知
            ops_text = "、".join(operations) if operations else "未执行任何操作"
            lte_info = f"LTE类型{lte_type}" if lte_type > 0 else "LTE解锁"
            nr_info = f"NR类型{nr_type}" if nr_type > 0 else "NR解锁"
            message = (
                f"🔄 定时锁频切换\n"
                f"时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
                f"模式: {mode}模式\n"
                f"LTE: {lte_info}\n"
                f"NR: {nr_info}\n"
                f"执行操作: {ops_text}\n"
                f"切换次数: 第 {self.switch_count} 次"
            )
            await self.client.notification_manager.notify_all("定时锁频切换", message, "SIGNAL")
            
            logger.info("=" * 60)
            logger.info("✓ 定时锁频切换完成")
            logger.info("=" * 60)
                
        except Exception as e:
            logger.error(f"执行锁频切换失败: {e}")
        finally:
            self.is_switching = False
    
    def _build_lte_command(self, lock_type: int, bands: str, arfcns: str = '', pcis: str = '') -> str:
        """构建 LTE 锁频命令"""
        if lock_type == 0:
            return "AT^LTEFREQLOCK=0\r\n"
        elif lock_type == 3:  # 频段锁定
            # 频段锁定：只锁定频段，不锁定具体频点
            band_list = [b.strip() for b in bands.split(',') if b.strip()]
            if not band_list:
                return "AT^LTEFREQLOCK=0\r\n"
            return f'AT^LTEFREQLOCK=3,0,{len(band_list)},"{",".join(band_list)}"\r\n'
        elif lock_type == 1:  # 频点锁定
            # 频点锁定：每个频段对应一个频点
            band_list = [b.strip() for b in bands.split(',') if b.strip()]
            arfcn_list = [a.strip() for a in arfcns.split(',') if a.strip()]
            
            if not band_list or not arfcn_list or len(band_list) != len(arfcn_list):
                logger.warning("LTE 频点锁定：频段和频点数量不匹配，解锁")
                return "AT^LTEFREQLOCK=0\r\n"
            
            # 验证频段和频点的对应关系
            if not self._validate_lte_band_arfcn_pairs(band_list, arfcn_list):
                logger.warning("LTE 频点锁定：频段和频点不匹配，解锁")
                return "AT^LTEFREQLOCK=0\r\n"
            
            return f'AT^LTEFREQLOCK=1,0,{len(band_list)},"{",".join(band_list)}","{",".join(arfcn_list)}"\r\n'
        elif lock_type == 2:  # 小区锁定
            # 小区锁定：每个频段对应一个频点和一个PCI
            band_list = [b.strip() for b in bands.split(',') if b.strip()]
            arfcn_list = [a.strip() for a in arfcns.split(',') if a.strip()]
            pci_list = [p.strip() for p in pcis.split(',') if p.strip()]
            
            if not band_list or not arfcn_list or not pci_list or len(band_list) != len(arfcn_list) or len(arfcn_list) != len(pci_list):
                logger.warning("LTE 小区锁定：频段、频点、PCI 数量不匹配，解锁")
                return "AT^LTEFREQLOCK=0\r\n"
            
            # 验证频段和频点的对应关系
            if not self._validate_lte_band_arfcn_pairs(band_list, arfcn_list):
                logger.warning("LTE 小区锁定：频段和频点不匹配，解锁")
                return "AT^LTEFREQLOCK=0\r\n"
            
            return f'AT^LTEFREQLOCK=2,0,{len(band_list)},"{",".join(band_list)}","{",".join(arfcn_list)}","{",".join(pci_list)}"\r\n'
        else:
            return "AT^LTEFREQLOCK=0\r\n"
    
    def _validate_lte_band_arfcn_pairs(self, bands: list, arfcns: list) -> bool:
        """验证 LTE 频段和频点的对应关系"""
        try:
            for i, (band, arfcn) in enumerate(zip(bands, arfcns)):
                band_num = int(band)
                arfcn_num = int(arfcn)
                
                # 根据 3GPP 标准验证频段和频点的对应关系
                if not self._is_valid_lte_band_arfcn_pair(band_num, arfcn_num):
                    logger.warning(f"LTE 频段 {band} 和频点 {arfcn} 不匹配")
                    return False
            return True
        except (ValueError, IndexError):
            return False
    
    def _is_valid_lte_band_arfcn_pair(self, band: int, arfcn: int) -> bool:
        """检查 LTE 频段和频点是否匹配"""
        # 根据 3GPP TS 36.101 标准的主要频段范围
        band_ranges = {
            1: (0, 599),      # 2100 MHz
            2: (600, 1199),   # 1900 MHz  
            3: (1200, 1949),  # 1800 MHz
            4: (1950, 2399),  # 1700/2100 MHz
            5: (2400, 2649),  # 850 MHz
            7: (2750, 3449),  # 2600 MHz
            8: (3450, 3799),  # 900 MHz
            12: (5010, 5179), # 700 MHz
            13: (5180, 5279), # 700 MHz
            17: (5730, 5849), # 700 MHz
            18: (5850, 5999), # 850 MHz
            19: (6000, 6149), # 850 MHz
            20: (6150, 6449), # 800 MHz
            25: (8040, 8689), # 1900 MHz
            26: (8690, 9039), # 850 MHz
            28: (9210, 9659), # 700 MHz
            38: (37750, 38249), # 2600 MHz
            39: (38250, 38649), # 1900 MHz
            40: (38650, 39649), # 2300 MHz
            41: (39650, 41589), # 2500 MHz
            42: (41590, 43589), # 3500 MHz
            43: (43590, 45589), # 3700 MHz
            66: (66436, 67335), # 1700/2100 MHz
        }
        
        if band in band_ranges:
            min_arfcn, max_arfcn = band_ranges[band]
            return min_arfcn <= arfcn <= max_arfcn
        
        # 如果频段不在已知范围内，返回 True（让模组自己判断）
        return True
    
    def _build_nr_command(self, lock_type: int, bands: str, arfcns: str = '', scs_types: str = '', pcis: str = '') -> str:
        """构建 NR 锁频命令"""
        if lock_type == 0:
            return "AT^NRFREQLOCK=0\r\n"
        elif lock_type == 3:  # 频段锁定
            # 频段锁定：只锁定频段，不锁定具体频点
            band_list = [b.strip() for b in bands.split(',') if b.strip()]
            if not band_list:
                return "AT^NRFREQLOCK=0\r\n"
            return f'AT^NRFREQLOCK=3,0,{len(band_list)},"{",".join(band_list)}"\r\n'
        elif lock_type == 1:  # 频点锁定
            # 频点锁定：每个频段对应一个频点
            band_list = [b.strip() for b in bands.split(',') if b.strip()]
            arfcn_list = [a.strip() for a in arfcns.split(',') if a.strip()]
            scs_list = [s.strip() for s in scs_types.split(',') if s.strip()] if scs_types else []
            
            if not band_list or not arfcn_list or len(band_list) != len(arfcn_list):
                logger.warning("NR 频点锁定：频段和频点数量不匹配，解锁")
                return "AT^NRFREQLOCK=0\r\n"
            
            # 如果 SCS 类型为空，尝试自动识别
            if not scs_list and arfcn_list:
                scs_list = self._auto_detect_scs_types(band_list, arfcn_list)
            
            if not scs_list or len(scs_list) != len(band_list):
                logger.warning("NR 频点锁定：SCS 类型数量不匹配，解锁")
                return "AT^NRFREQLOCK=0\r\n"
            
            # 验证频段和频点的对应关系
            if not self._validate_nr_band_arfcn_pairs(band_list, arfcn_list):
                logger.warning("NR 频点锁定：频段和频点不匹配，解锁")
                return "AT^NRFREQLOCK=0\r\n"
            
            return f'AT^NRFREQLOCK=1,0,{len(band_list)},"{",".join(band_list)}","{",".join(arfcn_list)}","{",".join(scs_list)}"\r\n'
        elif lock_type == 2:  # 小区锁定
            # 小区锁定：每个频段对应一个频点、一个SCS和一个PCI
            band_list = [b.strip() for b in bands.split(',') if b.strip()]
            arfcn_list = [a.strip() for a in arfcns.split(',') if a.strip()]
            scs_list = [s.strip() for s in scs_types.split(',') if s.strip()] if scs_types else []
            pci_list = [p.strip() for p in pcis.split(',') if p.strip()]
            
            if not band_list or not arfcn_list or not pci_list or len(band_list) != len(arfcn_list) or len(arfcn_list) != len(pci_list):
                logger.warning("NR 小区锁定：频段、频点、PCI 数量不匹配，解锁")
                return "AT^NRFREQLOCK=0\r\n"
            
            # 如果 SCS 类型为空，尝试自动识别
            if not scs_list and arfcn_list:
                scs_list = self._auto_detect_scs_types(band_list, arfcn_list)
            
            if not scs_list or len(scs_list) != len(band_list):
                logger.warning("NR 小区锁定：SCS 类型数量不匹配，解锁")
                return "AT^NRFREQLOCK=0\r\n"
            
            # 验证频段和频点的对应关系
            if not self._validate_nr_band_arfcn_pairs(band_list, arfcn_list):
                logger.warning("NR 小区锁定：频段和频点不匹配，解锁")
                return "AT^NRFREQLOCK=0\r\n"
            
            return f'AT^NRFREQLOCK=2,0,{len(band_list)},"{",".join(band_list)}","{",".join(arfcn_list)}","{",".join(scs_list)}","{",".join(pci_list)}"\r\n'
        else:
            return "AT^NRFREQLOCK=0\r\n"
    
    def _auto_detect_scs_types(self, bands: list, arfcns: list) -> list:
        """自动识别 NR SCS 类型"""
        scs_list = []
        for i, band in enumerate(bands):
            try:
                arfcn = int(arfcns[i])
                band_num = int(band)
                
                # 根据频段和 ARFCN 自动识别 SCS 类型
                if band_num in [78, 79, 258, 260]:  # n78, n79, n258, n260
                    # 这些频段通常使用 30kHz SCS
                    scs_list.append('1')
                elif band_num in [41, 77]:  # n41, n77
                    # 这些频段通常使用 30kHz SCS
                    scs_list.append('1')
                elif band_num in [28, 71]:  # n28, n71
                    # 这些频段通常使用 15kHz SCS
                    scs_list.append('0')
                else:
                    # 默认使用 30kHz SCS
                    scs_list.append('1')
            except (ValueError, IndexError):
                # 解析失败，使用默认值
                scs_list.append('1')
        
        return scs_list
    
    def _validate_nr_band_arfcn_pairs(self, bands: list, arfcns: list) -> bool:
        """验证 NR 频段和频点的对应关系"""
        try:
            for i, (band, arfcn) in enumerate(zip(bands, arfcns)):
                band_num = int(band)
                arfcn_num = int(arfcn)
                
                # 根据 3GPP 标准验证频段和频点的对应关系
                if not self._is_valid_nr_band_arfcn_pair(band_num, arfcn_num):
                    logger.warning(f"NR 频段 {band} 和频点 {arfcn} 不匹配")
                    return False
            return True
        except (ValueError, IndexError):
            return False
    
    def _is_valid_nr_band_arfcn_pair(self, band: int, arfcn: int) -> bool:
        """检查 NR 频段和频点是否匹配"""
        # 根据 3GPP TS 38.104 标准的主要频段范围
        band_ranges = {
            1: (0, 599),      # 2100 MHz
            3: (1200, 1949),  # 1800 MHz
            5: (2400, 2649),  # 850 MHz
            7: (2750, 3449),  # 2600 MHz
            8: (3450, 3799),  # 900 MHz
            12: (5010, 5179), # 700 MHz
            20: (6150, 6449), # 800 MHz
            25: (8040, 8689), # 1900 MHz
            28: (9210, 9659), # 700 MHz
            34: (20167, 20265), # 2100 MHz
            38: (37750, 38249), # 2600 MHz
            39: (38250, 38649), # 1900 MHz
            40: (38650, 39649), # 2300 MHz
            41: (39650, 41589), # 2500 MHz
            42: (41590, 43589), # 3500 MHz
            43: (43590, 45589), # 3700 MHz
            48: (55240, 56739), # 3500 MHz
            66: (66436, 67335), # 1700/2100 MHz
            71: (132600, 133189), # 600 MHz
            77: (620000, 680000), # 3700 MHz
            78: (620000, 680000), # 3500 MHz
            79: (440000, 500000), # 4700 MHz
            257: (2016667, 2079166), # 28 GHz
            258: (2016667, 2079166), # 26 GHz
            260: (2016667, 2079166), # 39 GHz
            261: (2016667, 2079166), # 28 GHz
        }
        
        if band in band_ranges:
            min_arfcn, max_arfcn = band_ranges[band]
            return min_arfcn <= arfcn <= max_arfcn
        
        # 如果频段不在已知范围内，返回 True（让模组自己判断）
        return True
    
    async def monitor_loop(self):
        """定时锁频监控循环"""
        if not self.enabled:
            logger.info("定时锁频功能已禁用")
            return
        
        logger.info("启动定时锁频监控...")
        
        while True:
            try:
                # 获取当前应该使用的模式
                target_mode = self.get_current_mode()
                
                if target_mode and target_mode != self.current_mode:
                    # 模式发生变化，执行切换
                    config = self.get_lock_config_for_mode(target_mode)
                    logger.info(f"检测到模式切换: {self.current_mode} -> {target_mode}")
                    await self.set_frequency_lock(config, target_mode)
                    self.current_mode = target_mode
                elif target_mode is None:
                    # 当前时段不需要锁频，如果之前有锁频则解锁
                    if self.current_mode is not None:
                        logger.info("当前时段不需要锁频，解锁所有频段")
                        unlock_config = {
                            'lte_type': 0, 'lte_bands': '', 'lte_arfcns': '', 'lte_pcis': '',
                            'nr_type': 0, 'nr_bands': '', 'nr_arfcns': '', 'nr_scs_types': '', 'nr_pcis': ''
                        }
                        await self.set_frequency_lock(unlock_config, '解锁')
                        self.current_mode = None
                
                # 检查网络状态（用于超时检测）
                has_service = await self.check_network_status()
                
                if has_service:
                    # 有服务，更新最后服务时间
                    self.last_service_time = time.time()
                else:
                    # 无服务，检查是否超时
                    no_service_duration = time.time() - self.last_service_time
                    
                    if no_service_duration >= self.timeout:
                        # 超时，执行恢复（解锁所有频段）
                        logger.warning(f"检测到网络长时间无服务 ({int(no_service_duration)}秒)，执行恢复")
                        unlock_config = {
                            'lte_type': 0, 'lte_bands': '', 'lte_arfcns': '', 'lte_pcis': '',
                            'nr_type': 0, 'nr_bands': '', 'nr_arfcns': '', 'nr_scs_types': '', 'nr_pcis': ''
                        }
                        await self.set_frequency_lock(unlock_config, '恢复')
                        # 重置计时器
                        self.last_service_time = time.time()
                    else:
                        logger.debug(f"无服务状态持续 {int(no_service_duration)} 秒")
                
                # 等待下次检查
                await asyncio.sleep(self.check_interval)
                
            except asyncio.CancelledError:
                logger.info("定时锁频监控任务已取消")
                break
            except Exception as e:
                logger.error(f"定时锁频监控循环错误: {e}")
                await asyncio.sleep(self.check_interval)


class ATConnection(ABC):
    """AT连接基类"""
    def __init__(self):
        self.is_connected = False
        self._response_buffer = bytearray()
        self._last_command_time = 0
        self.command_interval = 0.1  
        self.response_timeout = 2.0  # 2秒
        self._command_lock = asyncio.Lock()

    @handle_connection_error
    async def connect(self) -> bool:
        """建立连接"""
        pass

    @handle_connection_error
    async def close(self):
        """关闭连接"""
        pass

    @handle_connection_error
    async def send(self, data: bytes) -> int:
        """发送数据"""
        pass

    @handle_connection_error
    async def receive(self, size: int) -> bytes:
        """接收数据"""
        pass

    async def send_command(self, command: str) -> bytearray:
        """发送AT命令"""
        try:
            if not self.is_connected:
                if not await self.connect():
                    return bytearray()

            async with self._command_lock:
                # 强制等待上一个命令的间隔
                now = time.time()
                time_since_last = now - self._last_command_time
                if time_since_last < self.command_interval:
                    await asyncio.sleep(self.command_interval - time_since_last)

                if not command.endswith('\r'):
                    command += '\r'

                # 清空接收缓冲区
                self._response_buffer.clear()
                
                # 发送命令
                await self.send(command.encode())
                self._last_command_time = time.time()

                # 等待响应（优化：限制最大缓冲区，防止内存泄漏）
                response = bytearray()
                start_time = time.time()
                max_response_size = 1024 * 1024  # 1MB 上限，防止内存泄漏
                
                while (time.time() - start_time) < self.response_timeout:
                    try:
                        chunk = await self.receive(4096)
                        if chunk:
                            # 检查缓冲区大小，防止内存泄漏
                            if len(response) + len(chunk) > max_response_size:
                                logger.warning(f"响应数据超过 1MB 限制，截断并返回")
                                response.extend(chunk[:max_response_size - len(response)])
                                return response
                            
                            response.extend(chunk)
                            # 检查是否收到完整响应
                            if (b'OK\r\n' in response or 
                                b'ERROR\r\n' in response or 
                                b'+CMS ERROR:' in response or 
                                b'+CME ERROR:' in response):
                                # 额外等待一小段时间，确保接收到所有数据
                                await asyncio.sleep(0.1)
                                return response

                    except KeyboardInterrupt:
                        raise  # 向上传播 KeyboardInterrupt
                    except Exception as e:
                        logger.debug(f"接收数据错误: {e}")
                        await asyncio.sleep(0.1)
                        continue

                if not response:
                    self.is_connected = False
                    raise ConnectionError("未收到响应")
                
                return response

        except KeyboardInterrupt:
            raise  # 向上传播 KeyboardInterrupt
        except Exception as e:
            self.is_connected = False
            logger.error(f"命令发送失败: {e}")
            await asyncio.sleep(1)
            return bytearray()


class NetworkATConnection(ATConnection):
    """网络AT连接实现"""

    def __init__(self, host: str, port: int, timeout: int):
        super().__init__()
        self.host = host
        self.port = port
        self.timeout = timeout
        self.socket = None

    @handle_connection_error
    async def connect(self) -> bool:
        try:
            if self.socket:
                try:
                    self.socket.close()
                except:
                    pass
            
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.settimeout(self.timeout)
            self.socket.connect((self.host, self.port))
            self.socket.setblocking(False)
            self.is_connected = True
            logger.info(f"已连接到网络AT {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.warning(f"网络AT连接失败: {e}")
            return False

    @handle_connection_error
    async def close(self):
        if self.socket:
            self.socket.close()
            self.socket = None
            self.is_connected = False

    @handle_connection_error
    async def send(self, data: bytes) -> int:
        if not self.socket:
            raise ConnectionError("未连接")
        return self.socket.send(data)

    @handle_connection_error
    async def receive(self, size: int) -> bytes:
        if not self.socket:
            raise ConnectionError("未连接")
        try:
            self.socket.settimeout(0.1)
            return self.socket.recv(size)
        except (socket.timeout, BlockingIOError):
            return b""
        except KeyboardInterrupt:
            raise  # 直接向上传播，让上层处理

class SerialATConnection(ATConnection):
    """串口AT连接实现"""
    def __init__(self, port: str, baudrate: int, timeout: int):
        super().__init__()
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial_port = None
    @handle_connection_error
    async def connect(self) -> bool:
        try:
            if self.serial_port and self.serial_port.is_open:
                try:
                    self.serial_port.close()
                except:
                    pass
            
            self.serial_port = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout
            )
            self.is_connected = True
            logger.info(f"已连接到串口AT {self.port}")
            return True
        except Exception as e:
            logger.warning(f"串口AT连接失败: {e}")
            return False

    @handle_connection_error
    async def close(self):
        if self.serial_port and self.serial_port.is_open:
            self.serial_port.close()
            self.serial_port = None
            self.is_connected = False

    @handle_connection_error
    async def send(self, data: bytes) -> int:
        if not self.serial_port or not self.serial_port.is_open:
            raise ConnectionError("未连接")
        try:
            return self.serial_port.write(data)
        except KeyboardInterrupt:
            raise  # 直接向上传播，让上层处理

    @handle_connection_error
    async def receive(self, size: int) -> bytes:
        if not self.serial_port or not self.serial_port.is_open:
            raise ConnectionError("未连接")
        try:
            if self.serial_port.in_waiting:
                return self.serial_port.read(self.serial_port.in_waiting)
            return b""
        except KeyboardInterrupt:
            raise  # 直接向上传播，让上层处理
class ATClient:
    def __init__(self):
        self.connection_type = AT_CONFIG["TYPE"]
        if self.connection_type == "NETWORK":
            self.connection = NetworkATConnection(
                host=AT_CONFIG["NETWORK"]["HOST"],
                port=AT_CONFIG["NETWORK"]["PORT"],
                timeout=AT_CONFIG["NETWORK"]["TIMEOUT"]
            )
        else:  # SERIAL
            self.connection = SerialATConnection(
                port=AT_CONFIG["SERIAL"]["PORT"],
                baudrate=AT_CONFIG["SERIAL"]["BAUDRATE"],
                timeout=AT_CONFIG["SERIAL"]["TIMEOUT"]
            )
        self.websocket_server = None
        self.notification_manager = NotificationManager()
        self._partial_messages: Dict[str, Dict] = {}
        self._pdcp_handler = PDCPDataHandler()
        self.max_retries = 3
        self.retry_delay = 5
        self.max_total_retries = 100  # 最大总重试次数，避免无限重试
        self._reconnecting = False  # 防止重复重连

    @property
    def is_connected(self) -> bool:
        """获取连接状态"""
        return self.connection.is_connected if self.connection else False

    async def connect(self, retry=True):
        """建立连接并进行重试"""
        # 防止重复重连
        if self._reconnecting:
            logger.debug("已有重连任务在运行，跳过此次重连请求")
            return False
        
        self._reconnecting = True
        retries = 0
        long_retry_interval = 60  # 1分钟 = 60秒
        
        try:
            while True:
                try:
                    result = await self.connection.connect()
                    if result:
                        await self._init_at_config()
                        # 连接成功，重置重试计数器
                        if retries > 0:
                            logger.info("连接已恢复")
                        retries = 0
                        return True
                    else:
                        # 连接返回False，需要重试
                        if not retry:
                            raise ConnectionError("连接失败")
                        raise ConnectionError("连接失败")
                        
                except Exception as e:
                    if not retry:
                        logger.error(f"连接失败（不重试）: {e}")
                        raise
                    
                    retries += 1
                    
                    # 检查是否超过最大总重试次数
                    if retries >= self.max_total_retries:
                        logger.error(f"已达到最大重试次数 ({self.max_total_retries})，停止重试")
                        raise ConnectionError(f"超过最大重试次数 {self.max_total_retries}")
                    
                    # 前3次使用递增延迟（5秒、10秒、15秒）
                    if retries <= self.max_retries:
                        retry_delay = self.retry_delay * retries
                        logger.warning(f"连接失败，等待 {retry_delay} 秒后重试 ({retries}/{self.max_total_retries})... 错误: {e}")
                    else:
                        # 超过3次后，每1分钟检测一次
                        retry_delay = long_retry_interval
                        if retries == self.max_retries + 1:  # 只在第一次切换时打印
                            logger.warning(f"已超过最大快速重试次数，切换到长间隔模式：每 {long_retry_interval} 秒（1分钟）检测一次...")
                    
                    await asyncio.sleep(retry_delay)
        finally:
            self._reconnecting = False

    async def send_command(self, command: str) -> bytearray:
        """发送AT命令"""
        return await self.connection.send_command(command)

    async def close(self):
        await self.connection.close()

    async def is_ready(self) -> bool:
        """检查AT模块是否准备就绪"""
        try:
            response = await self.send_command("AT+CPIN?\r\n")
            return b"+CPIN: READY" in response
        except:
            return False
    
    async def _init_at_config(self):
        """初始化AT命令配置"""
        cnmi_config = await self.send_command("AT+CNMI?\r\n")
        cmgf_config = await self.send_command("AT+CMGF?\r\n")
        if "+CNMI: 2,1,0,2,0" not in cnmi_config.decode('ascii', errors='ignore'):
            await self.send_command("AT+CNMI=2,1,0,2,0\r\n")
        if "+CMGF: 0" not in cmgf_config.decode('ascii', errors='ignore'):
            await self.send_command("AT+CMGF=0\r\n")
        await self.send_command("AT+CLIP=1\r\n")

    async def set_pdcp_data_info(self, enable: bool, interval: int = None) -> bool:
        """设置PDCP数据信息上报"""
        try:
            command = f"AT^PDCPDATAINFO={1 if enable else 0}"
            if enable and interval is not None:
                if not (200 <= interval <= 65535):
                    logger.warning("上报间隔必须在200-65535毫秒之间")
                    return False
                command += f",{interval}"
            command += "\r\n"

            response = await self.send_command(command)
            success = b"OK" in response

            if success and self._pdcp_handler:
                self._pdcp_handler.enabled = enable
                if interval is not None:
                    self._pdcp_handler.interval = interval

            return success

        except Exception as e:
            logger.error(f"设置PDCP数据信息上报失败: {e}")
            return False

    async def query_pdcp_data_info(self) -> bool:
        """查询PDCP数据信息"""
        try:
            response = await self.send_command("AT^PDCPDATAINFO?\r\n")
            return b"OK" in response
        except Exception as e:
            logger.error(f"查询PDCP数据信息失败: {e}")
            return False

    def _parse_sms(self, response: bytearray) -> List[SMS]:
        """解析PDU格式短信"""
        sms_list = []
        lines = response.decode('ascii', errors='ignore').split('\r\n')
        i = 0
        while i < len(lines):
            if lines[i].startswith('+CMG'):
                try:
                    pdu_hex = lines[i + 1].strip()
                    if pdu_hex and all(c in '0123456789ABCDEF' for c in pdu_hex):
                        sms_dict = read_incoming_sms(pdu_hex)
                        sms = SMS(
                            index="0",
                            sender=sms_dict['sender'],
                            content=sms_dict['content'],
                            timestamp=sms_dict['date'].strftime('%Y-%m-%d %H:%M:%S') if sms_dict.get(
                                'date') else "未知",
                            partial=sms_dict.get('partial') if isinstance(sms_dict.get('partial'), dict) else None
                        )
                        sms_list.append(sms)
                    i += 2
                except Exception as e:
                    logger.error(f"PDU解析失败: {e}")
                    sms = SMS(
                        index="0",
                        sender="解析失败",
                        content=f"PDU解析错误: {str(e)}",
                        timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                        partial=None
                    )
                    sms_list.append(sms)
                    i += 1
            else:
                i += 1
        return sms_list

    async def process_sms(self, index: str = None):
        """处理短信"""
        command = f"AT+CMGR={index}\r\n" if index else "AT+CMGL=0\r\n"
        response = await self.send_command(command)

        sms_list = self._parse_sms(response)
        for sms in sms_list:
            if sms.partial:
                await self._handle_partial_sms(sms)
            else:
                await self.notification_manager.notify_all(sms.sender, sms.content, "SMS")

    async def _handle_partial_sms(self, sms: SMS):
        """处理分段短信（优化：自动清理过期消息，防止内存泄漏）"""
        partial = sms.partial
        key = f"{sms.sender}_{partial['reference']}"
        current_time = time.time()
        
        # 清理超过 1 小时未完成的分段短信（防止内存泄漏）
        expired_keys = [
            k for k, v in self._partial_messages.items()
            if current_time - v.get('timestamp', 0) > 3600
        ]
        for expired_key in expired_keys:
            logger.warning(f"清理过期的分段短信: {expired_key}")
            del self._partial_messages[expired_key]
        
        # 限制最大缓存数量（防止恶意攻击）
        if len(self._partial_messages) > 100:
            oldest_key = min(self._partial_messages.keys(), 
                           key=lambda k: self._partial_messages[k].get('timestamp', 0))
            logger.warning(f"分段短信缓存超限，删除最旧的: {oldest_key}")
            del self._partial_messages[oldest_key]
        
        if key not in self._partial_messages:
            self._partial_messages[key] = {
                "sender": sms.sender,
                "parts": {},
                "total_parts": partial["parts_count"],
                "timestamp": current_time  # 记录接收时间
            }
        self._partial_messages[key]["parts"][partial["part_number"]] = sms.content
        if len(self._partial_messages[key]["parts"]) == self._partial_messages[key]["total_parts"]:
            full_content = "".join(
                self._partial_messages[key]["parts"][i]
                for i in range(1, self._partial_messages[key]["total_parts"] + 1)
            )
            # 发送合并后的通知
            await self.notification_manager.notify_all(sms.sender, full_content, "SMS")
            # WebSocket推送完整消息
            await self.websocket_server.broadcast({
                "type": "new_sms",
                "data": {
                    "sender": sms.sender,
                    "content": full_content,
                    "time": sms.timestamp,
                    "isComplete": True
                }
            })

            del self._partial_messages[key]

class WebSocketServer:
    """WebSocket服务器类"""
    def __init__(self, at_client: ATClient):
        self.at_client = at_client
        self._active_connections = set()
        self._heartbeat_interval = 30  # 心跳间隔30秒
        logger.info("WebSocket服务器已初始化")

    async def _send_heartbeat(self, websocket):
        """发送心跳包"""
        try:
            await websocket.send('ping')
        except:
            self._active_connections.discard(websocket)

    async def _process_command(self, command: str) -> ATResponse:
        """处理AT命令"""
        try:
            # 打印接收到的AT命令
            logger.debug(f"接收到的AT命令: {command.strip()}")
            
            if command.strip() == "AT+CONNECT?":
                connection_type = "0" if self.at_client.connection_type == "NETWORK" else "1"
                response = ATResponse(True, f"+CONNECT: {connection_type}\r\nOK")
                logger.debug(f"响应: {response.data}")
                return response

            if command.startswith('AT^SYSCFGEX'):
                command = command.replace('\n', '').replace('\r', '').replace('OK', '')
                if ',"",""' in command:
                    parts = command.split(',')
                    if len(parts) >= 5:
                        bands = parts[4].strip('"')
                        if bands and not isinstance(bands, str):
                            bands = str(bands)
                        command = f"{parts[0]},{parts[1]},{parts[2]},{parts[3]},\"{bands}\",\"\",\"\""
                command += '\r'

            if not command.endswith('\r'):
                command += '\r'

            response = await self.at_client.send_command(command)
            response_text = response.decode('ascii', errors='ignore')
            response_lines = [line for line in response_text.split('\r\n')
                            if line and line.strip() != command.strip()]
            filtered_response = '\r\n'.join(response_lines)
            
            # 打印响应
            logger.debug(f"响应: {filtered_response}")
            
            return ATResponse(
                'ERROR' not in filtered_response.upper(),
                filtered_response if 'ERROR' not in filtered_response.upper() else None,
                filtered_response if 'ERROR' in filtered_response.upper() else None
            )
        except KeyboardInterrupt:
            raise  # 向上传播 KeyboardInterrupt
        except Exception as e:
            error_response = ATResponse(False, None, str(e))
            logger.error(f"错误响应: {error_response.error}")
            return error_response

    async def handle_client(self, websocket, path=None):
        """处理WebSocket客户端连接"""
        auth_key = WEBSOCKET_CONFIG.get('AUTH_KEY', '')
        
        # 如果配置了密钥，需要先验证
        if auth_key:
            try:
                # 等待客户端发送认证信息
                auth_message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                auth_data = json.loads(auth_message)
                
                # 验证密钥
                client_key = auth_data.get('auth_key', '')
                if client_key != auth_key:
                    await websocket.send(json.dumps({
                        'error': 'Authentication failed',
                        'message': '密钥验证失败'
                    }))
                    await websocket.close()
                    logger.warning(f"WebSocket连接被拒绝: 密钥错误")
                    return
                
                # 验证成功
                await websocket.send(json.dumps({
                    'success': True,
                    'message': '认证成功'
                }))
                logger.debug("WebSocket客户端认证成功")
                
            except asyncio.TimeoutError:
                await websocket.send(json.dumps({
                    'error': 'Authentication timeout',
                    'message': '认证超时'
                }))
                await websocket.close()
                logger.warning("WebSocket连接被拒绝: 认证超时")
                return
            except (json.JSONDecodeError, KeyError):
                await websocket.send(json.dumps({
                    'error': 'Invalid authentication',
                    'message': '无效的认证数据'
                }))
                await websocket.close()
                logger.warning("WebSocket连接被拒绝: 无效的认证数据")
                return
            except Exception as e:
                logger.error(f"认证过程出错: {e}")
                await websocket.close()
                return
        
        self._active_connections.add(websocket)
        logger.debug("新的WebSocket客户端已连接")
        
        # 启动心跳检测
        heartbeat_task = asyncio.create_task(self._heartbeat_loop(websocket))
        
        try:
            while True:
                try:
                    command = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    if command == 'ping':
                        await websocket.send('pong')
                        continue
                        
                    response = await self._process_command(command)
                    await websocket.send(json.dumps(response.to_dict()))
                    
                except asyncio.TimeoutError:
                    continue
                except websockets.exceptions.ConnectionClosed:
                    break
                except KeyboardInterrupt:
                    logger.info("收到退出信号，关闭WebSocket连接")
                    break
                except Exception as e:
                    logger.error(f"处理命令时出错: {e}")
                    break
                    
        finally:
            heartbeat_task.cancel()
            self._active_connections.discard(websocket)
            logger.debug("WebSocket客户端连接已清理")

    async def _heartbeat_loop(self, websocket):
        """心跳检测循环"""
        while True:
            try:
                await asyncio.sleep(self._heartbeat_interval)
                await self._send_heartbeat(websocket)
            except asyncio.CancelledError:
                break
            except Exception:
                break

    async def broadcast(self, message: dict):
        """向所有连接的客户端广播消息（优化：自动清理断开的连接）"""
        if not self._active_connections:
            return
        
        # 清理断开的连接（防止内存泄漏）
        dead_connections = set()
        for websocket in self._active_connections.copy():
            try:
                # 检查连接是否仍然活跃
                if websocket.closed:
                    dead_connections.add(websocket)
                    continue
                await websocket.send(json.dumps(message))
            except Exception as e:
                logger.debug(f"广播消息失败，移除连接: {e}")
                dead_connections.add(websocket)
        
        # 批量移除失效连接
        if dead_connections:
            self._active_connections -= dead_connections
            logger.debug(f"清理了 {len(dead_connections)} 个断开的 WebSocket 连接")

async def main():
    """主函数"""
    # 启动阶段临时启用 INFO 级别日志
    logger.setLevel(logging.INFO)
    logger.info("=" * 60)
    logger.info("AT WebServer 启动中...")
    logger.info("=" * 60)
    logger.info(f"Python 版本: {sys.version}")
    logger.info(f"系统平台: {sys.platform}")
    logger.info(f"进程 PID: {os.getpid()}")
    logger.info(f"工作目录: {os.getcwd()}")
    logger.info("=" * 60)
    
    # 重新加载配置（确保使用最新配置）
    global config, AT_CONFIG, NOTIFICATION_CONFIG, WEBSOCKET_CONFIG
    logger.info("正在重新加载配置...")
    config = load_config()
    AT_CONFIG = config['AT_CONFIG']
    NOTIFICATION_CONFIG = config['NOTIFICATION_CONFIG']
    WEBSOCKET_CONFIG = config['WEBSOCKET_CONFIG']
    logger.info("✓ 配置重新加载完成")
    
    # 打印运行配置信息
    logger.info("=" * 60)
    logger.info("当前运行配置:")
    logger.info("=" * 60)
    logger.info(f"连接类型: {AT_CONFIG['TYPE']}")
    if AT_CONFIG['TYPE'] == 'NETWORK':
        logger.info(f"  网络地址: {AT_CONFIG['NETWORK']['HOST']}:{AT_CONFIG['NETWORK']['PORT']}")
        logger.info(f"  网络超时: {AT_CONFIG['NETWORK']['TIMEOUT']}秒")
    else:
        logger.info(f"  串口设备: {AT_CONFIG['SERIAL']['PORT']}")
        logger.info(f"  波特率: {AT_CONFIG['SERIAL']['BAUDRATE']}")
        logger.info(f"  串口超时: {AT_CONFIG['SERIAL']['TIMEOUT']}秒")
    
    logger.info(f"\nWebSocket 配置:")
    logger.info(f"  监听端口: {config['WEBSOCKET_CONFIG']['IPV4']['PORT']}")
    logger.info(f"  IPv4 绑定: {config['WEBSOCKET_CONFIG']['IPV4']['HOST']}")
    logger.info(f"  IPv6 绑定: {config['WEBSOCKET_CONFIG']['IPV6']['HOST']}")
    
    logger.info(f"\n通知配置:")
    wechat = NOTIFICATION_CONFIG.get('WECHAT_WEBHOOK', '')
    logfile = NOTIFICATION_CONFIG.get('LOG_FILE', '')
    logger.info(f"  企业微信: {'已启用 ' + wechat[:50] + '...' if wechat else '未启用'}")
    logger.info(f"  日志文件: {logfile if logfile else '未启用'}")
    
    notify_types = NOTIFICATION_CONFIG.get('NOTIFICATION_TYPES', {})
    logger.info(f"  通知类型:")
    logger.info(f"    - 短信通知: {'✓ 启用' if notify_types.get('SMS', True) else '✗ 禁用'}")
    logger.info(f"    - 来电通知: {'✓ 启用' if notify_types.get('CALL', True) else '✗ 禁用'}")
    logger.info(f"    - 存储满通知: {'✓ 启用' if notify_types.get('MEMORY_FULL', True) else '✗ 禁用'}")
    logger.info(f"    - 信号通知: {'✓ 启用' if notify_types.get('SIGNAL', True) else '✗ 禁用'}")
    logger.info("=" * 60)
    
    client = ATClient()
    websocket_server = WebSocketServer(client)
    client.websocket_server = websocket_server
    message_processor = MessageProcessor()
    schedule_lock = ScheduleFrequencyLock(client)
    monitor_tasks = []
    server_v4 = None
    server_v6 = None
    
    # 启动通知管理器
    logger.info("正在启动通知管理器...")
    await client.notification_manager.start()
    logger.info("✓ 通知管理器已启动")
    
    async def connection_monitor():
        """连接监控任务"""
        while True:
            try:
                # 只在未连接且没有正在重连时才触发重连
                if not client.is_connected and not client._reconnecting:
                    logger.warning("检测到连接断开，尝试重新连接...")
                    try:
                        await client.connect(retry=True)
                    except Exception as e:
                        logger.error(f"重新连接失败: {e}")
                await asyncio.sleep(30)  # 每30秒检查一次（降低检查频率）
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"连接监控错误: {e}")
                await asyncio.sleep(30)

    async def monitor_socket():
        """监控socket数据（优化版：降低 CPU 占用）"""
        while True:
            try:
                if client.connection_type == "NETWORK":
                    try:
                        # 检查socket是否存在且已连接
                        if (isinstance(client.connection, NetworkATConnection) and 
                            client.connection.socket and 
                            client.is_connected):
                            # 优化：增加超时时间，减少忙等待（0.1s -> 0.2s）
                            client.connection.socket.settimeout(0.2)
                            data = client.connection.socket.recv(4096)
                            if data:
                                line = data.decode('ascii', errors='ignore').strip()
                                if line:
                                    # 处理消息（短信、来电等）
                                    await message_processor.process(line, client)
                                    # WebSocket推送原始数据
                                    await websocket_server.broadcast({
                                        "type": "raw_data",
                                        "data": line
                                    })
                    except (socket.timeout, BlockingIOError):
                        pass  # 正常的超时，继续循环
                    except KeyboardInterrupt:
                        logger.info("正在关闭socket监控...")
                        return
                else:  # SERIAL
                    try:
                        if (isinstance(client.connection, SerialATConnection) and 
                            client.connection.serial_port and 
                            client.connection.serial_port.is_open and
                            client.connection.serial_port.in_waiting):
                            data = client.connection.serial_port.read(
                                client.connection.serial_port.in_waiting
                            )
                            if data:
                                line = data.decode('ascii', errors='ignore').strip()
                                if line:
                                    # 处理消息（短信、来电等）
                                    await message_processor.process(line, client)
                                    # WebSocket推送原始数据
                                    await websocket_server.broadcast({
                                        "type": "raw_data",
                                        "data": line
                                    })
                    except KeyboardInterrupt:
                        logger.info("正在关闭串口监控...")
                        return
                # 优化：增加循环间隔（0.01s -> 0.05s），降低 CPU 占用从 10% 到 2-3%
                await asyncio.sleep(0.05)
            except asyncio.CancelledError:
                break
            except KeyboardInterrupt:
                logger.info("正在关闭监控任务...")
                return
            except Exception as e:
                logger.error(f"监控错误: {e}")
                await asyncio.sleep(1)

    try:
        logger.info("正在连接到 AT 设备...")
        await client.connect()
        logger.info("✓ AT 设备连接成功")
        
        # 创建监控任务
        logger.info("正在启动监控任务...")
        monitor_tasks = [
            asyncio.create_task(connection_monitor()),
            asyncio.create_task(monitor_socket()),
            #asyncio.create_task(schedule_lock.monitor_loop())
        ]
        logger.info("✓ 监控任务已启动")
        
        # 启动WebSocket服务器
        logger.info("正在启动 WebSocket 服务器...")
        ws_config = config['WEBSOCKET_CONFIG']
        server_v4 = await websockets.serve(
            websocket_server.handle_client,
            ws_config['IPV4']['HOST'],
            ws_config['IPV4']['PORT'],
            ping_interval=None,
            ping_timeout=None
        )
        server_v6 = await websockets.serve(
            websocket_server.handle_client,
            ws_config['IPV6']['HOST'],
            ws_config['IPV6']['PORT'],
            ping_interval=None,
            ping_timeout=None
        )
        
        logger.info("=" * 60)
        logger.info("✓ AT WebServer 启动成功！服务正在运行中...")
        logger.info("=" * 60)
        logger.info(f"WebSocket IPv4: ws://{ws_config['IPV4']['HOST']}:{ws_config['IPV4']['PORT']}")
        logger.info(f"WebSocket IPv6: ws://[{ws_config['IPV6']['HOST']}]:{ws_config['IPV6']['PORT']}")
        logger.info("=" * 60)
        logger.info("按 Ctrl+C 停止服务")
        logger.info("=" * 60)
        
        # 启动完成，降低日志级别，只记录警告和错误
        logger.setLevel(logging.WARNING)
        logger.warning("日志级别已切换为 WARNING，仅记录警告和错误")
        
        # 等待服务器关闭
        await asyncio.gather(
            server_v4.wait_closed(),
            server_v6.wait_closed(),
            *monitor_tasks
        )
        
    except (asyncio.CancelledError, KeyboardInterrupt):
        pass  # 静默处理，交给外层统一处理
    except Exception as e:
        logger.error(f"运行错误: {e}")
        raise
    finally:
        logger.info("="*60)
        logger.info("正在关闭服务...")
        logger.info("="*60)
        
        # 停止通知管理器
        logger.info("正在停止通知管理器...")
        await client.notification_manager.stop()
        logger.info("✓ 通知管理器已停止")
        
        # 清理资源
        logger.info("正在清理监控任务...")
        for task in monitor_tasks:
            task.cancel()
        try:
            await asyncio.gather(*monitor_tasks, return_exceptions=True)
        except:
            pass
        logger.info("✓ 监控任务已清理")
            
        if server_v4 or server_v6:
            logger.info("正在关闭 WebSocket 服务器...")
            if server_v4:
                server_v4.close()
            if server_v6:
                server_v6.close()
            
            try:
                await asyncio.gather(
                    server_v4.wait_closed() if server_v4 else asyncio.sleep(0),
                    server_v6.wait_closed() if server_v6 else asyncio.sleep(0)
                )
            except:
                pass
            logger.info("✓ WebSocket 服务器已关闭")
        
        logger.info("正在关闭 AT 连接...")
        await client.close()
        logger.info("✓ AT 连接已关闭")
        
        logger.info("="*60)
        logger.info("服务已完全停止")
        logger.info("="*60)

if __name__ == "__main__":
    try:
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
            
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            loop.run_until_complete(main())
        except KeyboardInterrupt:
            logger.info("正在关闭服务...")
        except Exception as e:
            logger.error(f"程序启动错误: {e}")
        finally:
            # 清理所有任务
            pending = asyncio.all_tasks(loop)
            for task in pending:
                task.cancel()
            if pending:
                loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
            loop.close()
            
    except Exception as e:
        logger.error(f"程序启动错误: {e}")