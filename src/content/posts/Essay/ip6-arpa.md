---
title: IPv6反解域名的获取及SSL签发
published: 2025-08-08
description: "使用tunnelbroker免费获得ipv6反解域名并托管到cloudflare,通过更改CA为arpa签发SSL"
tags: [tunnelbroker, SSL, cloudflare, ipv6]
category: 记录
draft: false
---

# IPv6反解域名的获取及SSL签发

## 什么是IPv6反解域名

例如b.1.9.0.9.1.0.0.0.7.4.0.1.0.0.2.ip6.arpa  
这是一个 IPv6 反向解析（Reverse DNS）域名，遵循 ip6.arpa 格式  
它是把 IPv6 地址每个十六进制数字倒序排列，加上 .ip6.arpa 后缀，用于 DNS 反查时将域名解析回原 IPv6 地址  

当你拥有一整个ipv6地址段,在有rDNS委派的前提下,就可以将他作为反解域名来使用

> 视频教程:【什么?25年还能免费获得ipv6反解域名?还能托管到cloudflare-哔哩哔哩】 https://b23.tv/bN09agW

## 怎么申请

<https://tunnelbroker.net/>

打开tb官网,点击注册（需要使用域名邮箱）

创建隧道。需要一台启用了ICMP信令的VPS，节点一般选择Hongkong（香港）

填上IP后，TunnelBroker会向其发送Ping请求

如果TunnelBroker收到了回应，并且该IP没有被其他隧道绑定，就会弹出绿色，可绑定的标志

如果该IP曾被绑定，则需要进行HTTP验证

## 托管到cloudflare

找到configured tunnels选项卡,其中的name找到为你分配的隧道,复制tb为你分配的路由IPv6（Routed /64或/48）

以 2001:470:24:386::/64 为例（我们只需要 2001:470:24:386 这部分即可）

首先把省略的部分扩写回来，也就是加0，每项4位，通过 : 分割，则为 2001047000240386

然后倒过来，则为 6830420007401002

最后，加上 . 和 .ip6.arpa ，则为 6.8.3.0.4.2.0.0.0.7.4.0.1.0.0.2.ip6.arpa

将其托管到Cloudflare

查看Cloudflare要求你设置的NS服务器，回到TunnelBroker进行设置

等待域被激活即可

## 签发SSL

cloudflare默认的GTS无法为 ip6.arpa 签发ssl,其他大部分CA也是

通过cloudflare api将Cloudflare SSL提供商改为 ssl.com 可以解决这个问题

获取必要信息，使用PATCH发起更改SSL提供商请求

参考博客https://cuojue.org/read/Cloudflare-certificate-authority.html

```
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/你的域名区域ID/ssl/universal/settings" \
     -H "X-Auth-Email: 你的CF邮箱" \
     -H "X-Auth-Key: 你的APIKEY" \
     -H "Content-Type: application/json" \
     --data '{"enabled":true,"certificate_authority":"ssl_com"}'
```

若返回JSON为{"result":{"enabled":true,"certificate_authority":"ssl_com"},"success":true,"errors":[...]}则表示更改CA成功

:::note
如果自己创建ssl.com的账户尝试签发SSL会拒签。故该域名应该仅能在Cloudflare CDN下使用  
我说的应该,如有错误欢迎指出
:::
