use async_trait::async_trait;
use std::error::Error;
use std::io::ErrorKind;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::time::timeout;
use tokio_serial::{SerialPortBuilderExt, SerialStream};

use crate::config::{NetworkConfig, SerialConfig};

fn should_reset_connection(error: &std::io::Error) -> bool {
    matches!(
        error.kind(),
        ErrorKind::BrokenPipe
            | ErrorKind::ConnectionAborted
            | ErrorKind::ConnectionReset
            | ErrorKind::NotConnected
            | ErrorKind::UnexpectedEof
            | ErrorKind::ConnectionRefused
            | ErrorKind::TimedOut
    )
}

async fn write_with_timeout<W>(writer: &mut W, data: &[u8]) -> std::io::Result<usize>
where
    W: AsyncWriteExt + Unpin,
{
    timeout(Duration::from_secs(2), writer.write(data))
        .await
        .unwrap_or_else(|_| Err(std::io::Error::new(ErrorKind::TimedOut, "write timed out")))
}

async fn read_with_timeout<R>(reader: &mut R, timeout_dur: Duration) -> std::io::Result<Vec<u8>>
where
    R: AsyncReadExt + Unpin,
{
    let mut buf = vec![0u8; 1024];
    match timeout(timeout_dur, reader.read(&mut buf)).await {
        Ok(Ok(n)) => {
            if n == 0 {
                return Err(std::io::Error::new(
                    ErrorKind::UnexpectedEof,
                    "connection closed",
                ));
            }
            buf.truncate(n);
            Ok(buf)
        }
        Ok(Err(err)) => Err(err),
        Err(_) => Err(std::io::Error::new(ErrorKind::TimedOut, "read timed out")),
    }
}

// ========== AT 连接抽象 ==========

#[async_trait]
pub trait ATConnection: Send {
    async fn connect(&mut self) -> Result<(), Box<dyn Error + Send + Sync>>;
    async fn send(&mut self, data: &[u8]) -> Result<usize, Box<dyn Error + Send + Sync>>;
    async fn receive(&mut self) -> Result<Vec<u8>, Box<dyn Error + Send + Sync>>;
    fn is_connected(&self) -> bool;
}

// ========== 串口连接实现 ==========

pub struct SerialATConn {
    pub config: SerialConfig,
    stream: Option<SerialStream>,
}

impl SerialATConn {
    pub fn new(config: SerialConfig) -> Self {
        Self {
            config,
            stream: None,
        }
    }
}

#[async_trait]
impl ATConnection for SerialATConn {
    async fn connect(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        let port = tokio_serial::new(&self.config.port, self.config.baudrate)
            .timeout(Duration::from_secs(self.config.timeout))
            .open_native_async()?;
        self.stream = Some(port);
        Ok(())
    }

    async fn send(&mut self, data: &[u8]) -> Result<usize, Box<dyn Error + Send + Sync>> {
        if let Some(stream) = &mut self.stream {
            match write_with_timeout(stream, data).await {
                Ok(n) => Ok(n),
                Err(err) => {
                    self.stream = None;
                    if should_reset_connection(&err) {
                        return Err("Disconnected".into());
                    }
                    Err(Box::new(err))
                }
            }
        } else {
            Err("Disconnected".into())
        }
    }

    async fn receive(&mut self) -> Result<Vec<u8>, Box<dyn Error + Send + Sync>> {
        if let Some(stream) = &mut self.stream {
            match read_with_timeout(stream, Duration::from_millis(25)).await {
                Ok(data) => Ok(data),
                Err(err) if matches!(err.kind(), ErrorKind::WouldBlock | ErrorKind::TimedOut) => {
                    Ok(Vec::new())
                }
                Err(err) => {
                    self.stream = None;
                    if should_reset_connection(&err) {
                        return Err("Disconnected".into());
                    }
                    Err(Box::new(err))
                }
            }
        } else {
            Err("Disconnected".into())
        }
    }

    fn is_connected(&self) -> bool {
        self.stream.is_some()
    }
}

// ========== 网络 TCP 连接实现 ==========

pub struct NetworkATConn {
    pub config: NetworkConfig,
    stream: Option<TcpStream>,
}

impl NetworkATConn {
    pub fn new(config: NetworkConfig) -> Self {
        Self {
            config,
            stream: None,
        }
    }
}

#[async_trait]
impl ATConnection for NetworkATConn {
    async fn connect(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        let addr = format!("{}:{}", self.config.host, self.config.port);
        let stream = timeout(
            Duration::from_secs(self.config.timeout),
            TcpStream::connect(addr),
        )
        .await??;
        self.stream = Some(stream);
        Ok(())
    }

    async fn send(&mut self, data: &[u8]) -> Result<usize, Box<dyn Error + Send + Sync>> {
        if let Some(stream) = &mut self.stream {
            match write_with_timeout(stream, data).await {
                Ok(n) => Ok(n),
                Err(err) => {
                    self.stream = None;
                    if should_reset_connection(&err) {
                        return Err("Disconnected".into());
                    }
                    Err(Box::new(err))
                }
            }
        } else {
            Err("Disconnected".into())
        }
    }

    async fn receive(&mut self) -> Result<Vec<u8>, Box<dyn Error + Send + Sync>> {
        if let Some(stream) = &mut self.stream {
            match read_with_timeout(stream, Duration::from_millis(25)).await {
                Ok(data) => Ok(data),
                Err(err) if matches!(err.kind(), ErrorKind::WouldBlock | ErrorKind::TimedOut) => {
                    Ok(Vec::new())
                }
                Err(err) => {
                    self.stream = None;
                    if should_reset_connection(&err) {
                        return Err("Disconnected".into());
                    }
                    Err(Box::new(err))
                }
            }
        } else {
            Err("Disconnected".into())
        }
    }

    fn is_connected(&self) -> bool {
        self.stream.is_some()
    }
}

// ========== TomModem 外部命令实现 ==========

pub struct TomModemATConn {
    pub port: String,
    pub timeout: u64,
    pub feature: String,
    is_connected: bool,
    response: Option<String>,
}

impl TomModemATConn {
    pub fn new(port: String, timeout: u64, feature: String) -> Self {
        Self {
            port,
            timeout,
            feature,
            is_connected: false,
            response: None,
        }
    }
}

#[async_trait]
impl ATConnection for TomModemATConn {
    async fn connect(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        self.is_connected = true;
        Ok(())
    }

    async fn send(&mut self, data: &[u8]) -> Result<usize, Box<dyn Error + Send + Sync>> {
        if !self.is_connected {
            return Err("Disconnected".into());
        }

        let command = String::from_utf8_lossy(data).trim().to_string();
        let mut args = vec![self.port.clone(), "-c".to_string(), command.clone()];

        if !self.feature.is_empty() && self.feature != "NONE" {
            args.push(format!("-{}", self.feature));
        }

        let output = timeout(
            Duration::from_secs(self.timeout),
            tokio::process::Command::new("tom_modem").args(&args).output(),
        )
        .await??;

        if output.status.success() {
            let response = String::from_utf8_lossy(&output.stdout).to_string();
            self.response = Some(response);
            Ok(data.len())
        } else {
            let error = String::from_utf8_lossy(&output.stderr);
            Err(format!("tom_modem执行失败: {}", error).into())
        }
    }

    async fn receive(&mut self) -> Result<Vec<u8>, Box<dyn Error + Send + Sync>> {
        if let Some(response) = &self.response {
            let data = response.clone().into_bytes();
            self.response = None;
            Ok(data)
        } else {
            Ok(Vec::new())
        }
    }

    fn is_connected(&self) -> bool {
        self.is_connected
    }
}