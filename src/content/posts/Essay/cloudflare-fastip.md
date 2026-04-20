---
title: 陈千语都能学会的Cloudflare SaaS及Workers&Pages优选教程
published: 2026-02-28
description: 全网最详细的保姆级Cloudflare优选教程
tags: [Essay, 随笔, 记录, Cloudflare]
category: 记录
series: 随笔
---

# 话说在前

Cloudflare 作为全球领先的网络性能安全服务商,以CDN加速防护,WAF及自动免费的SSL享誉行业

Cloudflare 依托于 Anycast ,让同一 IP 能在全球多节点宣告,但所有以默认接入点和开启小黄云的流量在经过 CF边缘节点 时,所分配的响应IP往往不是最优的,理论上可自动路由用户来请求至最近节点,加快访问速度,让 cloudflare 不再成为国内的"减速器"

优选IP,通过测速,追踪路由,社区分享等方式来筛选出特定地区(中国大陆)访问 Cloudflare 网络时延迟更低,丢包更少的节点 IP 或专用 CNAME 域名

结合 Cloudflare 自定义主机名(Cloudflare for SaaS)与 回退源 机制,使响应目标精准定向优质节点

# SaaS

在使用任何的 Saas 功能之前,请准备好一张`外币卡`(国内Visa卡即可过)或做好在开通 Saas 时`绕卡`的准备

:::warning
Cloudflare最近将新接入的域名SSL默认设为了完全,记得将 SSL 改为灵活
:::

- 如果你只是为了避免分到.1的话,可以直接开小号再绑域名,有可能分的就不是.1

- 其实还有种方法,cf tunnel前置代理配合一个线路好的节点，就可以自己挑全球节点了,由你的节点位置决定,而不是默认跑到美国去绕一圈,但是比较复杂,有时间再出篇文章

## 双域名版

具体的请求路线图如下

1. 浏览器 DNS 解析 fuwari.oh1.top → CNAME → cloudflare.14131413.xyz (本地 DNS 拿到 优选 IP)
2. TLS 握手: 浏览器 ↔ 最近 CF 边缘节点 (已拿到 cloudflare.14131413.xyz 的证书,握手成功)
3. 边缘节点发现 SNI =  fuwari.oh1.top ,在本机"自定义主机名表"里查到:
 - 回退源 = origin.14131413.xyz
 - 证书已签发
   于是把请求 内部转发 到 origin.14131413.xyz (不是301,是节点内部回源)
4. origin.14131413.xyz 也是橙云,所以同一台边缘节点直接拿本地缓存/回源 VPS
5. 响应包原路返回浏览器

简化就是: 

- 浏览器 → 边缘节点（优选 IP） → 本地回源决策 → 同一节点/同机房 → 源站

- 用户访问 -> 由于最终访问的域名设置了CNAME解析,所以实际上访问辅助域名的解析,并且携带 源主机名 -> 到达cloudflare.14131413.xyz进行优选 -> 优选结束,cf边缘节点识别到了携带的 源主机名 查询发现了回退源 -> 回退到回退源内容 -> 访问成功

全程只多了一次"内存查表",无额外 RTT,因此和官方线路速度几乎相同

### 具体教程

顾名思义要准备两个域名

1. 主域名: 如 oh1.top.xyz (即需加速的目标域名,没有硬性要求托管在 Cloudflare 上)

2. 辅助域名: 如 14131413.xyz (用于搭建 Cloudflare 内部“回退源”,必需托管在 Cloudflare 上)

#### 配置回退源的解析记录

进入到托管于CF的辅助域名详细界面

点击左侧栏的"DNS"下的"记录",进入到"记录"界面,然后点击那个蓝色的"添加记录"按钮,添加一个记录
- Name: 随意,如origin,后续均以origin为例
- Type: A
- Value: 网站源服务器的公网 IP 地址
- 代理状态: 打开,即右边小黄云亮起,显示,已代理,此时无法手动修改TTL

完成以上步骤之后,origin.14131413.xyz 将成为 Cloudflare 内部指向源站的"稳定代理入口" (这里以我的为例,不要再填我的了[哭笑.png])

#### 配置自定义主机名

在 Cloudflare 中创建自定义主机名,同样的在这个辅助域名管理界面的左侧栏,找到 SSL/TLS,点击其下方的 自定义主机名,进入到 自定义主机名 界面

- 在这里需要先设置好回退源,也就是将上一阶段的最后步骤得到的新的,指向你源服务器的辅助域名,填入到 回退源 内并保存,刷新等待变成绿色的 有效 状态

- 然后再点击蓝色的 添加自定义主机名 按钮,在新的界面添加自定义主机名,在新的界面中,自定义主机名一栏填写你需要加速的主域名,如 fuwari.oh1.top ,其他保持默认即可,然后点击右下角的 添加自定义主机名 保存

然后这里分两种情况,若你的要加速的域名托管于 cloudflare,则不需要进行后续的 TXT验证等操作

若并非托管于CF,操作如下

1. 添加好自定义主机名之后,主机名 会显示待定状态,这个时候需要去主域名的托管处,如我的是华为DNS国际站,找到自己的主域名,添加一条 cname 解析到辅助域名(或你不想cname也可txt验证),也就是 origin.14131413.xyz 使它生效 (填写你自己的辅助域名而不是我的)
- Name: @ 把根域cname过去即可
- Type: cname
- Value: origin.14131413.xyz 这里填上方的配置的辅助域名的回退源

- 稍等片刻,再去看一下 Cloudflare,就会看到 Cloudflare 给我们提供了对于我们 自定义主机名 的`证书验证 TXT 名称`和`证书验证 TXT 值` (如果 预验证 的话,等待刷新一下就好) 同时我们的 主机名 会显示一个蓝色的 待验证(TXT) 和一个绿色的 有效 ,如果那个绿色的有效没有出来或者是红色的报错什么的,等待上一步的 cname 解析生效即可

2. 配置SSL证书

回到主域名的DNS解析页面,添加一个新的TXT记录,名为`_acme-challenge`,用于CF自动签续证书
- Name: _acme-challenge
- Type: TXT
- Value: 复制 Cloudflare 上面给的"主机名验证 TXT 值"直接粘贴

:::note
复制 Cloudflare 给的"主机名验证 TXT 名称",左下角有个 单击以复制 ,点击一下这行字就复制了,然后将后面的域名去掉就可以了 (比如复制的是 _acme-challenge.oh1.top ,那么我应该填入的是 _acme-challenge)
:::

完成以上操作之后,稍等片刻,等待 主机名 全绿即可,可能要等挺久的

这样主域名就配置好了 CDN 的同时还带上了由CF自动续期的 SSL

至此,便配置好了 CNAME,但是这个时候还没有加速,因为还没有进行优选,可以手动添加A解析至你认为较快的节点,或直接添加cname解析至我的优选域名`cloudflare.14131413.xyz`

cname方法使用起来也比较容易,在你上述步骤都完成,且可以通过主域名成功访问到你的网站之后,在主域名解析处,将我们原本的 CNAME 记录直接替换为上面的

:::note
建站的时候,比如用 1Panel 快速建站,域名就是我们加速的主域名,比如你想让用户访问 oh1.top 就可以访问到你的网站，那么建站的时候,设置的域名就应该是这个,而不是其他的例如辅助域名
:::

## 单域名

其实很简单,手动指向回退源就行,把双域名的流程都搬到一个域名上,这个域名必须托管在CF

核心就是,让 Cloudflare 以为你在用 SaaS,但实际上回退源和自定义主机名都在同一个域名里

为什么这样可行呢?

Cloudflare 的“自定义主机名”要求:
- 必须有一个 已托管在 CF 并且橙色云朵打开 的域名做 回退源
- 自定义主机名(真正给访客看的域名)可以跟回退源同根,也可以不同根

于是我们可以 把主域名 oh1.top 本身托管到 Cloudflare (NS接入),在 oh1.top 下开一条子域 origin.oh1.top → 回退源,再把 oh1.top (或任意子域  114514.oh1.top) 当成 自定义主机名 去申请证书,证书下发后,把 114514.oh1.top  CNAME 到任意优选域名即可,因为证书已经绑定在 114514.oh1.top ,浏览器握手由 Cloudflare 边缘节点完成,后面走哪条 IP 都不影响证书链,所以不会报 TLS 警告

其具体的请求路线如下

1. 浏览器 DNS 解析 → CNAME →  优选cname  → 拿到优选 IP
2. TLS 握手: 浏览器 ↔ 最近边缘节点(证书是刚给签的,匹配无误)
3. 边缘节点发现 SNI = fuwari.oh1.top ,查到: 回退源 =  origin.oh1.top 但 origin.oh1.top 并不在本地 DNS 缓存,节点必须再解析一次
4. 节点向本地递归解析 origin.oh1.top → 拿到 回退源 IP (可能是官方随机 IP,也可能是你自己放的优选 IP)
5. 节点向该 IP 发起 二次 TLS 握手(或复用)拿到内容后返回浏览器
- 可简化为: 浏览器 → 边缘节点(优选后) → 再次 DNS 解析回退源 → 可能跨机房 → 源站
至少多 ½~1 个 RTT,在国内网络就是 0.2–0.4 s 的差距

### 具体方法

假设你就一个域名 oh1.top ,想让它直接走优选 IP
1. NS 接入 Cloudflare
把  oh1.top  的 NS 改成 Cloudflare,橙色云朵保持开启
2. 新建回退源
- DNS 里加一条
```
origin.oh1.top  A  你的源站IP 
```
- 保存后，在 SSL/TLS → 自定义主机名 → 回退源,填  origin.oh1.top 并保存
3. 添加自定义主机名
在同一页面点击 添加自定义主机名 ,填
 oh1.top (或  www.oh1.top , 114514.oh1.top ,看你打算让访客访问哪个) → 确认
4. 完成域名验证
- Cloudflare 会给出两条 TXT 记录:
```
_cf-custom-hostname.oh1.top
_cf-challenge.oh1.top
```
- 把它们加到 oh1.top 的 DNS 里,等 1-2 分钟,状态变成"有效" (如果只想用子域 114514.oh1.top ,就把 TXT 主机名前缀改成 _cf-custom-hostname.114514 即可)
5. CNAME 到优选地址
- 把  114514.oh1.top  的解析改成
```
CNAME  cloudflare.14131413.xyz
(或者任何你测过延迟低的优选域名)
```
小黄云保持开启,否则会爆红`fallback origin is not active yet`

至此便完成了 Cloudflare 的 CDN IP 优选加速,辅助域名的有关设置最好不要修改,不然重新配置,保持在 Cloudflare 处即可,然后域名记得续费 (上次有个大聪明问我为什么他的托管在cf掉了,nm一看域名过期了

# Pages 优选

- 你可以直接将你绑定到Pages的子域名直接更改NS服务器到阿里云\华为云\腾讯云云解析做线路分流解析,`直接简单一点,CNAME到**fuwari.oh1.top**`

或者使用自定义主机名的方式,同上,为源站加速的教程

# Workers 优选

这里也是分两种情况,自定义域和自定义路由

## 自定义域

同上方Pages优选

## 自定义路由

这个可就好玩多了,自定义路由页面可添加的是简化版的动态表达式,其符合的所有经过cf边缘节点的流量请求都会被转发至指定的worker

同时这个只是一个规则,需要自己去配置DNS记录到cloudflare节点,可以达成和上方Pages优选一样的效果,开启小黄云来使用自定义主机名

另一种就是直接添加一个仅DNS的cname记录来指向CF边缘节点,流量经过边缘节点匹配路由然后流量被转发至worker

如果你两个方法都试了,你会发现在单域名SaaS的情况下,访问速度总是比直接cname慢0.3s左右,这是为什么呢

1. 直接 CNAME 到 cloudflare.14131413.xyz: 浏览器 → 最近边缘节点（Colo）→ 边缘节点本地 KV 直接返回 Worker → 浏览器
- 全程无回源，边缘命中100%

2. 自定义主机名 (回退源指向 Worker): 浏览器 → 最近边缘节点 → 发现这是自定义主机名 → 回退源查询 (必须回源到回退源子域) → 回退源再触发 Worker → 边缘节点 → 浏览器
- 可以发现多了一次回退查询,如果回退源子域恰好没在你当前Colo缓存,还要再跨一次

-物理上就多了一跳,TLS也要重新握手,0.3s就是这么来的

因此worker的优选一般都是自定义路由然后再直接cname到优选节点

- 当然如果你是双域名SaaS的话其实差不多,单域名要慢一些,多一次左右的RTT

# Worker路由反代全球并优选
> 本方法的原理为通过Worker反代你的源站,然后将Worker的入口节点进行优选,此方法不是传统的优选,源站接收到的Hosts头仍然是直接指向源站的解析

创建一个Cloudflare Worker,写入代码:
```js
// 域名前缀映射配置
const domain_mappings = {
  '源站.com': '最终访问头.',
//例如：
//'gitea.072103.xyz': 'gitea.',
//则你设置Worker路由为gitea.*都将会反代到gitea.072103.xyz
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const current_host = url.host;

  // 强制使用 HTTPS
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return Response.redirect(url.href, 301);
  }

  const host_prefix = getProxyPrefix(current_host);
  if (!host_prefix) {
    return new Response('Proxy prefix not matched', { status: 404 });
  }

  // 查找对应目标域名
  let target_host = null;
  for (const [origin_domain, prefix] of Object.entries(domain_mappings)) {
    if (host_prefix === prefix) {
      target_host = origin_domain;
      break;
    }
  }

  if (!target_host) {
    return new Response('No matching target host for prefix', { status: 404 });
  }

  // 构造目标 URL
  const new_url = new URL(request.url);
  new_url.protocol = 'https:';
  new_url.host = target_host;

  // 创建新请求
  const new_headers = new Headers(request.headers);
  new_headers.set('Host', target_host);
  new_headers.set('Referer', new_url.href);

  try {
    const response = await fetch(new_url.href, {
      method: request.method,
      headers: new_headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual'
    });

    // 复制响应头并添加CORS
    const response_headers = new Headers(response.headers);
    response_headers.set('access-control-allow-origin', '*');
    response_headers.set('access-control-allow-credentials', 'true');
    response_headers.set('cache-control', 'public, max-age=600');
    response_headers.delete('content-security-policy');
    response_headers.delete('content-security-policy-report-only');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response_headers
    });
  } catch (err) {
    return new Response(`Proxy Error: ${err.message}`, { status: 502 });
  }
}

function getProxyPrefix(hostname) {
  for (const prefix of Object.values(domain_mappings)) {
    if (hostname.startsWith(prefix)) {
      return prefix;
    }
  }
  return null;
}
```
填写路由并向上方一样填一个dns解析就行了

# 针对于Cloudflare Tunnel（ZeroTrust）
请先参照 [传统SaaS优选](#SaaS) 设置完毕,源站即为 Cloudflare Tunnel,正常做完SaaS接入即可:

接下来我们需要让 **最终访问的域名** 打到 Cloudflare Tunnel 的流量正确路由,否则访问时主机名不在Tunnel中,会触发 **catch: all** 规则,总之就是没法访问,再创建一个Tunnel规则,域名为 **你最终访问的域名** ,源站指定和刚才的一致即可

最后写一条 CNAME **你自己的优选域名** 的DNS记录即可

---

# 针对于使用了各种CF规则的网站

你只需要让规则针对于你的 **最终访问域名** ,因为CF的规则是看主机名的,而不是看是由谁提供的

# 针对于虚拟主机

保险起见,建议将源站和优选域名同时绑定到你的虚拟主机,保证能通再一个个删

---

# Q&A

1. Q: 如果我的源站使用Cloudflare Tunnels　　
A: 需要在Tunnels添加两个规则,一个指向你的辅助域名,一个指向最终访问的域名,然后删除最终访问域名的DNS解析(**但是不要直接在Tunnels删,会掉白名单,导致用户访问404**),然后跳过第一步
   
   > 原理: 假设你已经配置完毕,但是Cloudflare Tunnels只设置了一个规则
   
   > 分类讨论,假如你设置的规则仅指向辅助域名,那么在优选的工作流中: 用户访问 -> 由于最终访问的域名设置了CNAME解析,所以实际上访问了origin.oh1.top,并且携带 **源主机名: oh1.top** -> 到达cloudflare.14131413.xyz进行优选 -> 优选结束,cf边缘节点识别到了携带的**源主机名: oh1.top** 查询发现了回退源 -> 回退源检测 **源主机名: oh1.top**不在白名单 -> 报错404Not Found,访问失败
   
   > 分类讨论,假如你设置的规则仅指向最终访问的域名，那么在优选的工作流中: 用户访问 -> 由于最终访问的域名设置了CNAME解析,所以实际上访问了origin.oh1.top -> 由于origin.oh1.top不在Tunnels白名单,则访问失败

---

2. Q: 如果我的源站使用了Cloudflare Origin Rule (端口回源)
   A; 需要将规则的生效主机名改为最终访问的域名，否则不触发回源策略 (会导致辅助域名无法访问，建议使用Cloudflare Tunnels)
   
   > 原理: 假设你已经配置完毕,但是Cloudflare Origin Rule (端口回源)规则的生效主机名为辅助域名
   > 那么在优选的工作流中:用户访问 -> 由于最终访问的域名设置了CNAME解析,所以实际上访问了origin.oh1.top,并且携带 **源主机名: oh1.top** -> 到达cloudflare.14131413.xyz进行优选 -> 优选结束,cf边缘节点识别到了携带的 **源主机名: oh1.top** 查询发现了回退源 -> 回退到回退源内容 -> 但是由于**源主机名：oh1.top**不在Cloudflare Origin Rule (端口回源)的规则中 -> 无法触发回源策略,访问失败
   
---

3. Q: 如果我的源站使用serv00
   A: 需要在WWW Web Site界面添加两个规则,一个指向你的辅助域名,一个指向最终访问的域名
   
   > 原理: 假设你已经配置完毕,但是serv00仅配置其中一个域名
   
   > 那么在优选的工作流中: 会导致访问错误,serv00将会拦截不在白名单的域名请求

---

竟然忘了昨天是我生日,C,感觉又少活一年