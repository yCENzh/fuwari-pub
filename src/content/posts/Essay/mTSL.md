---
title: mTSL使用基本教程
published: 2024-12-19
description: 记一次mTLS基本教程
tags: [记录, mTLS, cloudflare, workers]
category: 记录
draft: false
---

# mTLS

## 什么是双向TLS

### 基本概念

双向TLS（Mutual TLS，简称mTLS）是一种双向身份验证机制：
- **单向TLS**：仅服务器向客户端证明身份
- **双向TLS**：服务器和客户端相互验证身份

### 工作原理

```
客户端 <---> 服务器
  ↓           ↓
客户端证书   服务器证书
  ↓           ↓
  CA验证    CA验证
```

## 证书准备

### 创建CA

```bash
# 创建工作目录
mkdir -p ~/mtls/{ca,server,client}
cd ~/mtls

# 生成CA私钥
openssl genrsa -out ca/ca.key 4096

# 生成CA证书
openssl req -new -x509 -days 3650 -key ca/ca.key -out ca/ca.crt \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/OU=IT/CN=MyCA"

# 查看CA证书信息
openssl x509 -in ca/ca.crt -text -noout
```

### 生成服务器证书

```bash
# 生成服务器私钥
openssl genrsa -out server/server.key 2048

# 创建证书签名请求（CSR）
openssl req -new -key server/server.key -out server/server.csr \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/OU=IT/CN=example.com"

# 创建扩展配置文件
cat > server/server_ext.cnf <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = example.com
DNS.2 = *.example.com
IP.1 = 192.168.1.100
EOF

# 使用CA签发服务器证书
openssl x509 -req -days 365 \
  -in server/server.csr \
  -CA ca/ca.crt \
  -CAkey ca/ca.key \
  -CAcreateserial \
  -out server/server.crt \
  -extfile server/server_ext.cnf
```

### 生成客户端证书

```bash
# 生成客户端私钥
openssl genrsa -out client/client.key 2048

# 创建客户端CSR
openssl req -new -key client/client.key -out client/client.csr \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/OU=IT/CN=client1"

# 签发客户端证书
openssl x509 -req -days 365 \
  -in client/client.csr \
  -CA ca/ca.crt \
  -CAkey ca/ca.key \
  -CAcreateserial \
  -out client/client.crt

# 生成PKCS12格式
openssl pkcs12 -export \
  -out client/client.p12 \
  -inkey client/client.key \
  -in client/client.crt \
  -certfile ca/ca.crt \
  -passout pass:123456
```

## 服务器配置

### Nginx配置

```nginx
# /etc/nginx/sites-available/mtls
server {
    listen 443 ssl;
    server_name example.com;

    # SSL证书配置
    ssl_certificate /path/to/server/server.crt;
    ssl_certificate_key /path/to/server/server.key;

    # 客户端证书验证
    ssl_client_certificate /path/to/ca/ca.crt;
    ssl_verify_client on;
    ssl_verify_depth 2;

    # SSL协议和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Session配置
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;

    location / {
        # 传递客户端证书信息到后端
        proxy_set_header X-SSL-Client-Cert $ssl_client_cert;
        proxy_set_header X-SSL-Client-S-DN $ssl_client_s_dn;
        proxy_set_header X-SSL-Client-Verify $ssl_client_verify;
        
        proxy_pass http://backend;
    }

    # 可选：根据客户端证书CN进行访问控制
    location /admin {
        if ($ssl_client_s_dn !~ "CN=admin") {
            return 403;
        }
        proxy_pass http://backend;
    }
}
```

### Apache配置

```apache
<VirtualHost *:443>
    ServerName example.com
    DocumentRoot /var/www/html

    # 启用SSL
    SSLEngine on
    SSLCertificateFile /path/to/server/server.crt
    SSLCertificateKeyFile /path/to/server/server.key

    # 客户端证书验证
    SSLCACertificateFile /path/to/ca/ca.crt
    SSLVerifyClient require
    SSLVerifyDepth 2

    # SSL协议配置
    SSLProtocol all -SSLv2 -SSLv3
    SSLCipherSuite HIGH:!aNULL:!MD5

    <Directory /var/www/html>
        # 基于客户端证书的访问控制
        SSLRequire %{SSL_CLIENT_S_DN_CN} eq "client1" \
                or %{SSL_CLIENT_S_DN_CN} eq "client2"
    </Directory>
</VirtualHost>
```

### Node.js配置

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// 配置选项
const options = {
    key: fs.readFileSync('server/server.key'),
    cert: fs.readFileSync('server/server.crt'),
    ca: fs.readFileSync('ca/ca.crt'),
    requestCert: true,
    rejectUnauthorized: true
};

// 中间件：验证客户端证书
app.use((req, res, next) => {
    const cert = req.socket.getPeerCertificate();
    
    if (req.client.authorized) {
        console.log(`Client CN: ${cert.subject.CN}`);
        next();
    } else {
        res.status(401).send('Client certificate required');
    }
});

app.get('/', (req, res) => {
    res.send('mTLS connection successful!');
});

https.createServer(options, app).listen(443, () => {
    console.log('Server running on https://localhost:443');
});
```

## Cloudflare

### Cloudflare mTLS设置

#### 登录Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的域名

#### 配置SSL/TLS

```yaml
SSL/TLS → Overview:
  - 加密模式: Full (strict)

SSL/TLS → Client Certificates:
  1. 点击 "Create Certificate"
  2. 生成或上传客户端CA证书
  3. 配置证书参数:
     - Certificate name: "My mTLS CA"
     - Certificate: [粘贴ca.crt内容]
     - Private key: [保持为空，只需要公钥]
```

#### 创建mTLS规则

```yaml
SSL/TLS → Client Certificates → Create mTLS Rule:
  名称: "Require Client Cert"
  
  如果传入请求匹配:
    - 主机名: example.com
    - URI路径: /api/*
  
  则:
    - 需要客户端证书: 开启
    - CA证书: "My mTLS CA"
```

### 使用Cloudflare API配置

```bash
# 设置环境变量
export CF_EMAIL="your-email@example.com"
export CF_API_KEY="your-api-key"
export CF_ZONE_ID="your-zone-id"

# 上传客户端CA证书
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/client_certificates" \
     -H "X-Auth-Email: $CF_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{
       "certificate": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
       "name": "My mTLS CA"
     }'

# 创建mTLS规则
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/firewall/rules" \
     -H "X-Auth-Email: $CF_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{
       "filter": {
         "expression": "(http.host eq \"example.com\" and http.request.uri.path contains \"/api\")"
       },
       "action": "challenge",
       "products": ["waf"],
       "description": "Require client certificate for API"
     }'
```

### Cloudflare Workers中验证mTLS

```javascript
// workers.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 获取客户端证书信息
  const tlsInfo = request.cf.tlsClientAuth
  
  if (!tlsInfo || !tlsInfo.certPresented) {
    return new Response('Client certificate required', { status: 401 })
  }
  
  // 验证证书信息
  if (tlsInfo.certVerified) {
    const certInfo = {
      subject: tlsInfo.certSubjectDN,
      issuer: tlsInfo.certIssuerDN,
      serial: tlsInfo.certSerial,
      notBefore: tlsInfo.certNotBefore,
      notAfter: tlsInfo.certNotAfter
    }
    
    // 基于证书信息的访问控制
    if (certInfo.subject.includes('CN=authorized-client')) {
      return new Response(JSON.stringify({
        message: 'Access granted',
        clientInfo: certInfo
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  return new Response('Unauthorized', { status: 403 })
}
```

## 客户端配置

### cURL测试

```bash
# 基本测试
curl --cert client/client.crt \
     --key client/client.key \
     --cacert ca/ca.crt \
     https://example.com

# 详细调试
curl -v \
     --cert client/client.crt \
     --key client/client.key \
     --cacert ca/ca.crt \
     --resolve example.com:443:192.168.1.100 \
     https://example.com
```

### Python客户端

```python
import requests
import ssl

# 配置客户端证书
cert = ('client/client.crt', 'client/client.key')
ca_cert = 'ca/ca.crt'

# 发送请求
response = requests.get(
    'https://example.com',
    cert=cert,
    verify=ca_cert
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

# 使用Session保持连接
session = requests.Session()
session.cert = cert
session.verify = ca_cert

# 多个请求
for i in range(5):
    resp = session.get(f'https://example.com/api/data/{i}')
    print(f"Request {i}: {resp.status_code}")
```

### Node.js客户端

```javascript
const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'example.com',
    port: 443,
    path: '/',
    method: 'GET',
    key: fs.readFileSync('client/client.key'),
    cert: fs.readFileSync('client/client.crt'),
    ca: fs.readFileSync('ca/ca.crt'),
    rejectUnauthorized: true
};

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
```

### 浏览器配置

#### Chrome/Edge
```bash
# Windows
certutil -addstore -user Root ca/ca.crt
certutil -addstore -user My client/client.p12

# macOS
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain ca/ca.crt
security import client/client.p12 -k ~/Library/Keychains/login.keychain -P 123456

# Linux
pk12util -i client/client.p12 -d sql:$HOME/.pki/nssdb -W 123456
certutil -A -n "MyCA" -t "TCu,Cu,Tu" -i ca/ca.crt -d sql:$HOME/.pki/nssdb
```

## 故障排查

### 常见错误及解决方案

1. 证书验证失败
```bash
# 检查证书链
openssl verify -CAfile ca/ca.crt server/server.crt
openssl verify -CAfile ca/ca.crt client/client.crt

# 检查证书有效期
openssl x509 -in client/client.crt -noout -dates
```

2. SSL握手失败
```bash
# 测试SSL连接
openssl s_client -connect example.com:443 \
  -cert client/client.crt \
  -key client/client.key \
  -CAfile ca/ca.crt \
  -showcerts
```

3. 权限问题
```bash
# 设置正确的文件权限
chmod 400 server/server.key
chmod 400 client/client.key
chmod 644 server/server.crt
chmod 644 client/client.crt
chmod 644 ca/ca.crt
```

### 日志分析

#### Nginx日志
```nginx
# nginx.conf
http {
    log_format mtls '$remote_addr - $ssl_client_s_dn [$time_local] '
                     '"$request" $status $body_bytes_sent '
                     '"$http_user_agent" $ssl_protocol/$ssl_cipher';
    
    access_log /var/log/nginx/mtls_access.log mtls;
    error_log /var/log/nginx/mtls_error.log debug;
}
```

#### 分析工具
```bash
# 监控证书过期
#!/bin/bash
for cert in ~/mtls/**/*.crt; do
    echo "Checking $cert:"
    openssl x509 -in "$cert" -noout -enddate
done

# 自动续期脚本
#!/bin/bash
DAYS_BEFORE_EXPIRY=30
CERT_FILE="server/server.crt"

EXPIRY_DATE=$(openssl x509 -in $CERT_FILE -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt $DAYS_BEFORE_EXPIRY ]; then
    echo "Certificate expires in $DAYS_LEFT days. Renewing..."
    # 执行续期命令
fi
```

## 实践

### 监控和告警

```javascript
// 监控脚本示例
const checkCertificateExpiry = () => {
    const certPath = 'server/server.crt';
    const cert = fs.readFileSync(certPath);
    const x509 = new crypto.X509Certificate(cert);
    
    const expiryDate = new Date(x509.validTo);
    const daysUntilExpiry = Math.floor((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 30) {
        // 发送告警
        console.warn(`Certificate expires in ${daysUntilExpiry} days!`);
    }
};

// 每天检查一次
setInterval(checkCertificateExpiry, 24 * 60 * 60 * 1000);
```

## 说在最后

~我也不知道说什么~最好中午弄,因为早晚会出事

The end Ciallo~