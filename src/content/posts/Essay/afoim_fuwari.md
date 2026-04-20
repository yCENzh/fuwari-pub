---
title: 对于afoim/fuwari的个人解析
published: 2025-08-20
description: 记一次自己对于afoim/fuwari二改内容的分析
tags: [记录, fuwari]
category: 记录
draft: false
---

# 话说在前

> 本章为 对于github/afoim/fuwari的二改项目的实现解析,以当前仓库`25-08-15`最新一次commit`6936133`为准

这篇文章是经群U启发而来的

里面所有内容均个人理解,如有不对,欢迎指出~虽然我没评论区~

# 功能实现

## 网站信息

位于`src/config.ts`,~说真的感觉没必要提这一句~

永久暗色并隐藏切换面板
```js title="config.ts"
forceDarkMode: true, // 强制加载暗色主题css
```

## 域名检测

当你尝试直接fork而不修改的时候会发现每次访问都会有非官方域名的警告

其功能具体实现于`src/layout/Layout.astro`,具体我也不赘述了,相信应该都看得懂

> 这版位于第276行,在head里面的一个script,若找不到建议搜索关键词

```html title="Layout.astro"
...
    <head>
        ...
        <!-- 域名检测脚本 -->
		<script is:inline define:vars={{officialSites: ["https://www.2x.nz", "https://www.072103.xyz"]}}>
			// 域名检测功能
			function checkDomain() {
				try {
					// 获取当前访问的完整URL
					const currentUrl = window.location.href;
					// 获取当前域名
					const currentDomain = window.location.hostname;
					
					// 获取所有官方域名
					const officialDomains = officialSites.map(site => {
						try {
							return new URL(site).hostname;
						} catch (e) {
							return null;
						}
					}).filter(domain => domain !== null);
					
					// 检查当前域名是否为官方域名或本地开发环境
					const isOfficialDomain = officialDomains.includes(currentDomain);
					const isLocalDev = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
					
					// 如果当前域名不是官方域名且不是本地开发环境
					if (!isOfficialDomain && !isLocalDev) {
						// 创建警告弹窗
						const shouldRedirect = confirm(
							`⚠️ 域名安全警告\n\n` +
							`您当前访问的域名：${currentDomain}\n` +
							`官方域名：${officialDomains.join(', ')}\n\n` +
							`您可能正在访问非官方网站，存在安全风险！\n\n` +
							`点击"确定"跳转到官方网站\n` +
							`点击"取消"继续访问当前网站（不推荐）`
						);
						
						// 如果用户选择跳转到官方网站
						if (shouldRedirect) {
							// 构建官方网站的对应页面URL（使用第一个官方网站）
							const currentPath = window.location.pathname + window.location.search + window.location.hash;
							const officialPageUrl = officialSites[0] + currentPath;
							// 跳转到官方网站
							window.location.href = officialPageUrl;
						}
					}
				} catch (error) {
					// 如果检测过程中出现错误，静默处理，不影响正常访问
					console.warn('域名检测失败:', error);
				}
			}
			
			// 页面加载完成后执行域名检测
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', checkDomain);
			} else {
				checkDomain();
			}
		</script>
		...
```

## Giscus评论区

具体实现于`src/pages/posts/[...slug].astro`
```html title="[...slug].astro"
<!-- Giscus 评论区 -->
<script src="https://giscus.app/client.js"
        data-repo="afoim/giscus-fuwari"
        data-repo-id="R_kgDOOi8quw"
        data-category="Announcements"
        data-category-id="DIC_kwDOOi8qu84CprDV"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="noborder_gray"
        data-lang="zh-CN"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

## umami
> ~挺神金的~

### 配置umami

在`src/layout/Layout.astro`中配置umami分析,~其实你如果只要umami分析,不用显示访问量之类的到这就行了~
```html title="Layout.astro"
        <!-- Umami分析（自建） -->
		<script defer src="https://umami.2x.nz/script.js" data-website-id="4b4e430d-a12c-4a5c-8cf9-df48eb20fd6d"></script>
```

### 显示访问量

首先是在`src/config.ts`里面定义了umami的相关配置
```js title="config.ts"
import type {
    ...
	UmamiConfig,
} from "./types/config";
...
export const umamiConfig: UmamiConfig = {
	enable: true,
	baseUrl: "https://umami.2x.nz",
	shareId: "ZyDjOrmjaBTlmGtd",
	timezone: "Asia/Shanghai",
};
...
```
以及在`src/types/config.ts`里面相关配置
```js title="config.ts"
export type UmamiConfig = {
	enable: boolean;
	baseUrl: string;
	shareId: string;
	timezone: string;
};
```

> 啊没错,这就是2x所说的页面会加载3次的那个,天才o3给出的解决办法是在config定义然后再导入,然后2x就搁那夸起o3了,~所以说挺无语的~

然后显示出访问量的部分在于`src/components/PostCard.astro`,以及`./PostMeta.astro`,`./widget/Profile.astro`

奥对,还有`‎public/js/umami-share.js`

这里就不贴出来了,毕竟这几个文件里面大部分都是umami的,看不懂就去问ai,~懒得写了~

> Umami并没有给配置来更改CORS,这个访问量统计是2x逆向出来的,~讲人话就是调API~

## 时间戳

这个精确到秒的时间戳,似乎不需要改,原本就支持?也可能是我之前改过相关逻辑的原因,但我翻commit好像确实原本就支持

## 背景图及透明卡片

- 在SiteConfig类型中添加background配置选项
- 新增透明背景颜色变量--card-bg-transparent和--float-panel-bg-transparent
- 实现背景图片加载检测及卡片透明效果切换
- 添加背景图片样式配置,包括位置、大小、重复方式等

```diff title="Layout.astro"
 			let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
 			offset = offset - offset % 4;
 			document.documentElement.style.setProperty('--banner-height-extend', `${offset}px`);
+
+// Background image loading detection
+			const bgUrl = getComputedStyle(document.documentElement).getPropertyValue('--bg-url').trim();
+			const bgEnable = getComputedStyle(document.documentElement).getPropertyValue('--bg-enable').trim();
+
+			if (bgUrl && bgUrl !== 'none' && bgEnable === '1') {
+				const img = new Image();
+				const urlMatch = bgUrl.match(/url\(["']?([^"')]+)["']?\)/);
+				if (urlMatch) {
+					img.onload = function() {
+// 背景图片完全加载后，显示背景并启用卡片透明效果
+						document.body.classList.add('bg-loaded');
+						document.documentElement.style.setProperty('--card-bg', 'var(--card-bg-transparent)');
+						document.documentElement.style.setProperty('--float-panel-bg', 'var(--float-panel-bg-transparent)');
+					};
+					img.onerror = function() {
+// Keep cards opaque if background image fails to load
+						console.warn('Background image failed to load, keeping cards opaque');
+					};
+					img.src = urlMatch[1];
+				}
+			}
 		</script>
 		<style define:vars={{
configHue,
'page-width': `${PAGE_WIDTH}rem`,
-		}}></style>  <!-- defines global css variables. This will be applied to <html> <body> and some other elements idk why -->
+'bg-url': siteConfig.background.src ? `url(${siteConfig.background.src})` : 'none',
+'bg-enable': siteConfig.background.enable ? '1' : '0',
+'bg-position': siteConfig.background.position || 'center',
+'bg-size': siteConfig.background.size || 'cover',
+'bg-repeat': siteConfig.background.repeat || 'no-repeat',
+'bg-attachment': siteConfig.background.attachment || 'fixed',
+'bg-opacity': (siteConfig.background.opacity || 0.3).toString()
+		}}>
+			:root {
+				--bg-url: var(--bg-url);
+--bg-enable: var(--bg-enable);
+--bg-position: var(--bg-position);
+--bg-size: var(--bg-size);
+--bg-repeat: var(--bg-repeat);
+--bg-attachment: var(--bg-attachment);
+--bg-opacity: var(--bg-opacity);
+			}
+
+/* Background image configuration */
+body {
+				--bg-url: var(--bg-url);
+--bg-enable: var(--bg-enable);
+--bg-position: var(--bg-position);
+--bg-size: var(--bg-size);
+--bg-repeat: var(--bg-repeat);
+--bg-attachment: var(--bg-attachment);
+--bg-opacity: var(--bg-opacity);
+			}
+
+body::before {
+				content: '' !important;
+position: fixed !important;
+top: 0 !important;
+left: 0 !important;
+width: 100% !important;
+height: 100% !important;
+background-image: var(--bg-url) !important;
+background-position: var(--bg-position) !important;
+background-size: var(--bg-size) !important;
+background-repeat: var(--bg-repeat) !important;
+background-attachment: var(--bg-attachment) !important;
+opacity: 0 !important;
+pointer-events: none !important;
+z-index: -1 !important;
+display: block !important;
+transition: opacity 0.3s ease-in-out !important;
+			}
+
+body.bg-loaded::before {
+				opacity: calc(var(--bg-opacity) * var(--bg-enable)) !important;
+			}
+</style>  <!-- defines global css variables. This will be applied to <html> <body> and some other elements idk why -->
```

```diff title="src/types/config.ts"
+  background: {
+		enable: boolean;
+		src: string;
+		position?: "top" | "center" | "bottom";
+		size?: "cover" | "contain" | "auto";
+		repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
+		attachment?: "fixed" | "scroll" | "local";
+		opacity?: number;
	};
```

```diff title="src/styles/variables.styl"
+  --card-bg-transparent: hsl(var(--hue) 10% 10% / 0.6);
+  --float-panel-bg-transparent: hsl(var(--hue) 10% 10% / 0.6);
```

```js title="src/config.ts"
    background: {
		enable: true, // Enable background image
		src: "https://pic.2x.nz/?img=h", // Background image URL (supports HTTPS)
		position: "center", // Background position: 'top', 'center', 'bottom'
		size: "cover", // Background size: 'cover', 'contain', 'auto'
		repeat: "no-repeat", // Background repeat: 'no-repeat', 'repeat', 'repeat-x', 'repeat-y'
		attachment: "fixed", // Background attachment: 'fixed', 'scroll', 'local'
		opacity: 0.5, // Background opacity (0-1)
	},
```

## 友链
我友链具体思路就是,spec里面新建一个friends.md,然后去pages里面写单独的friends.astro,友链的页面就是这么写的(2x的直接写的astro,没有md)

也就是说2x的友链页面全写在`src/pages/friends.astro`

可选,去做i18n,去i18n里面写Key值就是,然后最后到config.ts里面引用

## 赞助

思路同上,位于`src/pages/donate.astro`

## 页脚

在`src/components/Footer.astro`

# 写在最后

> 暂时就写到这吧,毕竟也想不出来能写什么,大部分commit都是修bug和优化

重要的改动上面也写了,至于什么时候更新这篇文章,随缘吧

The end Ciallo~