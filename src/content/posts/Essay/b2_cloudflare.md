---
title: 利用 Cloudflare+B2 零成本搭建无限流量文件存储桶
published: 2025-08-19
description: 使用带宽联盟不计B2流量的特性通过cloudflare workers将私有存储桶文件通过cf分发
tags: [记录, B2, cloudflare, workers]
category: 记录
draft: false
---

# 话说在前

各位朋友都清楚,cloudflare搞了个带宽联盟,从backblaze B2通过 cf 传出的数据完全免费,不计入 B2 的带宽费用,这意味着,你可以将文件存储在 B2,然后通过cf分发,不产生任何下载流量费用

但是~B2公开存储要绑卡,私有却不用

🤓那我们可以通过Cloudflare Workers代理B2私有存储桶,利用宽带联盟的特性,享受Cloudflare带来的免费流量福利,妙哉~妙哉~

# 具体教程

> worker代码源自[Backblaze官方](https://www.backblaze.com/docs/cloud-storage-deliver-private-backblaze-b2-content-through-cloudflare-cdn)

## Backblaze

1. 先进入[B2主页](https://www.backblaze.com/sign-up/cloud-storage?referrer=getstarted)创建一个Backblaze账号,不用绑卡

2. 来到Backblaze主页面,点击 创作一个桶 ~为什么简中要这么翻译我也不知道~ ,类型选私密(官翻为私人),默认加密关闭,对象锁定也关了

3. 然后创建一个应用密钥(App Key),并记下keyID和applicationKey

## cloudflare workers

> 在CONFIG中可配置多个存储桶

1. 在`Workers & Pages`页面创建一个新worker,名称随意,例如B2

2. 将以下代码粘贴进去并修改配置
```js
const CONFIG = {
  // 存储桶配置
  buckets: {
    // 格式: "存储桶名": { endpoint, accessKey, secretKey, isPublic }
    "example-bucket": {
      endpoint: "https://s3.region.backblazeb2.com",  // 必须包含 https:// 前缀
      accessKey: "YOUR_ACCESS_KEY", // 你的accesskey
      secretKey: "YOUR_SECRET_KEY", // 你的secretkey
      isPublic: true  // true = 公开访问模式, false = 私有访问模式
    },
  
    // 可添加多个存储桶
    "private-docs": {
      endpoint: "https://s3.region.backblazeb2.com",
      accessKey: "ACCESS_KEY_FOR_PRIVATE", 
      secretKey: "SECRET_KEY_FOR_PRIVATE",
      isPublic: false
    }
  },
```
然后部署即可

3. (可选)绑定自定义域名,打开worker设置,域和路由,配置你的域名就好了

# 访问教程

文件访问URL格式如下：
```
https://your-domain/bucket-name/path/to/file
```
例如
```
https://b2.ciallo.ciallo/ciallo/images/ciallo.png
```

# 更多

## 配置补充

1. 多存储桶管理,可以把多个存储桶添加至同一worker,不必创建多个

2. 当设置`isPublic: false`时,访问需添加认证头
```
Authorization: Bearer YOUR_SECRET_KEY
```
## 问题排查

- `403 Forbidden`检查B2密钥是否正确,存储桶权限设置
- `404 Not Found`确认文件路径正确,注意大小写敏感
- `522超时错误`检查B2端点URL是否正确,区域是否匹配
- `存储桶不可见`确保Worker配置中的存储桶名称与B2完全一致

:::note
1. Worker响应不能超过100MB
2. 免费版每日10万次请求
3. Cloudflare默认会缓存内容 可通过添加`Cache-Control`头控制
4. 切勿将配置信息提交到公开仓库,切勿跑超大文件
:::

# 写在最后

那么B2的相关教程就写完了,这里要补充一些,B2免费10GB空间,若跑大文件高速率切记拿小号使,通过Cloudflare的CDN代理非CF的服务跑大流量,有概率会被Cloudflare限速或者直接ban掉,在TOS里这种属于滥用,封号不必我赘述了,ban域名可以通过使用特殊域名解决,例如`ipv6反解域名`~毕竟cf也封不了~😋

[ip6-arpa](/posts/guide/ip6-arpa/)

The end Ciallo~