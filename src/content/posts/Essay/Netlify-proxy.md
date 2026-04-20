---
title: Netlify反代教程
published: 2025-08-09
description: "Netlify还是太权威了"
image: "https://www.netlify.com/assets/logos/full/large/lightmode/logo-netlify-large-fullcolor-lightmode.svg"
tags: [github, 开源, netlify, 反代]
category: 记录
draft: false
---

# 使用 Netlify 反代你的个人网站（零成本、零备案、IPv6 友好）

> 适用场景  
- 家宽拿不到公网 IPv4，只能拿到 IPv6；  
- 想给内网/树莓群晖上的服务一个公网域名；  
- 需要一个完全免费的 HTTPS 反代/CDN。

整个流程 10 分钟搞定，完全白嫖，不需要备案。

---

1. 前置条件

项目	说明	
本地服务	能监听某个端口（如 80/5000/8000 均可），最好已配置好 IPv6 DDNS	
域名	任意支持 CNAME 的域名（可在 Cloudflare、Porkbun、阿里云等托管）	
GitHub 账号	用来托管配置文件	
浏览器 + 终端	Chrome / Edge + 自带终端即可	

---

2. 注册 Netlify 并准备仓库

1. 打开 [https://app.netlify.com](https://app.netlify.com) → 注册账号并登录。
2. 打开 GitHub → 新建一个空仓库，名称随意，例如 `netlify-proxy-demo`。
3. 在仓库根目录新建文件 `netlify.toml`，内容如下：

```toml
[[redirects]]
  from = "/*"
  to = "http://[你的IPv6地址]:5000/:splat"   # 也可填域名，如 http://nas.example.com:5000/
  status = 200
  force = true
```

注意：
- 冒号后面的 `/` 不能丢；
- 如果你想反代 域名，把 `[你的IPv6地址]` 换成 `nas.example.com` 即可；
- 如果本地服务跑在 80 端口，把 5000 改成 80。

4. `git add . && git commit -m "init" && git push`。

---

3. 在 Netlify 部署

1. 回到 Netlify 控制台 → Add new site → Import from Git → 选择刚才的 GitHub 仓库。
2. 直接点 Deploy site，几秒后就能得到一个 `https://xxx-123.netlify.app` 的二级域名。
3. 打开浏览器访问 `https://xxx-123.netlify.app`，如果能看到你的本地网页，说明反代成功。

---

4. 绑定自定义域名（可选但推荐）

1. Netlify 控制台 → Domain management → Add custom domain → 输入你的域名，如 `blog.example.com`。
2. 按提示到你的 DNS 服务商处添加一条 CNAME 记录：

主机记录	记录类型	记录值	
blog	CNAME	xxx-123.netlify.app	

3. 等待 DNS 生效（通常 1 分钟～5 分钟），浏览器访问 `https://blog.example.com` 即可。

---

5. 一键启用 HTTPS & HTTP/2

Netlify 会自动帮你申请 Let’s Encrypt 证书，无需任何额外操作。

如需强制 HTTPS：

Domain management → HTTPS → Force HTTPS 打开即可。

---

6. 常见问题 FAQ

问题	解决思路	
页面空白 / 502	检查 `netlify.toml` 中地址、端口是否正确；本地防火墙放行 IPv6 端口	
样式错乱	本地服务需返回正确的 `Content-Type`，或加 `--header "Host: xxx"` 调试	
想反代 HTTPS？	本地服务需监听 443 并提供证书，再把 `http://` 改成 `https://`	
想反代 IPv4？	把 `to = "http://公网IPv4:端口/"` 即可，但这就失去“IPv6 友好”意义了	

---

7. 小结

优点	缺点	
免费、自动 HTTPS、全球 CDN	每月 100 GB 流量限制（个人站足够）	
支持 IPv6 回源	不支持 WebSocket	
配置简单，10 分钟上线	无法自定义 Nginx 规则	

至此，你就拥有了一个 零成本、零备案、IPv6 友好 的个人网站反代/CDN。

Enjoy!