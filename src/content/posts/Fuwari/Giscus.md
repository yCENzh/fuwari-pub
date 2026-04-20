---
title: Giscus在astro上的实现方案
published: 2025-08-21
description: 对于astro项目添加Giscus评论系统并为其配置自适应主题
tags: [Guide, Fuwari, Astro, Giscus]
category: Fuwari
series: Fuwari
---

# 话说在前

说不了一点,懒得水了

# 普通导入

> 如果你不需要那些七七八八的东西就普通导入就行

## 准备工作

1. 先去找到你要存放评论的仓库,必须是`public`,然后开启了`discussion`

2. 打开[giscus官网](https://giscus.app/zh-CN),默认设置即可,然后复制配置文件
```html
<script src="https://giscus.app/client.js"
        data-repo="yCENzh/Fuwari-yCENzh"
        data-repo-id="114514"
        data-category="Announcements"
        data-category-id="1919810"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

## Astro配置

接下来对项目动刀,打开`src/components/`目录下创建一个`.astro`文件,名字随意,这里以`src/components/misc/Giscus.astro`为例,粘贴复制好的配置,保存退出
```
<script src="https://giscus.app/client.js"
        data-repo="yCENzh/Fuwari-yCENzh"
        data-repo-id="R_kgDOPe85cQ"
        data-category="Announcements"
        data-category-id="DIC_kwDOPe85cc4CuYZG"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

在你想要放评论区的地方导入元素,以本框架`Fuwari`为例,元素位置放在许可证卡片下~(好像叫版权信息)~,修改动态路由`src/pages/posts/[...slug].astro`
```astro title="[...slug].astro"
import Giscus from "../../components/misc/Giscus.astro"; // 导入Giscus
...
    <div>
	    <div>
    		...
            
		    {licenseConfig.enable && <License ...></License>}
		    
		    <Giscus /> // Giscus
	    </div>
    </div>
...
```

# 初入门径

> Giscus自带的`preferred_color_scheme`只会监听`系统级`的主题变化,并不会监听`Fuwari`的`setTheme`函数,会导致手动切换Fuwari主题时,Giscus并不会同步更新,因此这里手动写出逻辑,并添加comments元数据来控制评论区是否显示

对`Giscus.astro`进行修改(请手动替换成自己的配置)
```astro title="Giscus.astro"
---
interface Props {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  lang?: string;
}

const {
  repo = "yCENzh/Fuwari-yCENzh" // 替换成你自己的
  repoId = "114514" // 替换成你自己的
  category = "Announcements" // 替换成你自己的
  categoryId = "1919810" // 替换成你自己的
  mapping = 'pathname',
  reactionsEnabled = true,
  emitMetadata = false,
  inputPosition = 'bottom',
  lang = 'zh-CN'
} = Astro.props;
---

<div id="giscus-container"></div>

<script define:vars={{ repo, repoId, category, categoryId, mapping, reactionsEnabled, emitMetadata, inputPosition, lang }}>
  function loadGiscus() {
    const container = document.getElementById('giscus-container');
    if (!container) return;

    // 获取当前主题
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'light';

    // 创建Giscus脚本
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', reactionsEnabled ? '1' : '0');
    script.setAttribute('data-emit-metadata', emitMetadata ? '1' : '0');
    script.setAttribute('data-input-position', inputPosition);
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', lang);
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    container.appendChild(script);
  }

  // 监听主题变化
  function updateGiscusTheme() {
    const giscusFrame = document.querySelector('iframe[src*="giscus"]');
    if (giscusFrame) {
      const isDark = document.documentElement.classList.contains('dark');
      const theme = isDark ? 'dark' : 'light';

      giscusFrame.contentWindow.postMessage({
        giscus: {
          setConfig: {
            theme: theme
          }
        }
      }, 'https://giscus.app');
    }
  }

  // 监听DOM变化来检测主题切换
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateGiscusTheme();
      }
    });
  });

  // 页面加载时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGiscus);
  } else {
    loadGiscus();
  }

  // 开始观察主题变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
</script>
```

在`src/pages/posts/[...slug].astro`中导入
> 也就是在你所需要的地方添加,例如我的在 文章页面-许可证卡片下
```astro title="[...slug].astro"
---
import { getCollection } from 'astro:content'
import MainGridLayout from '@layouts/MainGridLayout.astro'
import License from '@components/misc/License.astro'
import Giscus from '@components/misc/Giscus.astro'  // 导入 Giscus
// ... 其他导入
---

<MainGridLayout banner={entry.data.image} title={entry.data.title}>
  <div slot="main" class="flex w-full flex-col">
    <div class="mb-6">
      <!-- 文章内容 -->
      <Content />
    </div>

    <div class="flex w-full flex-col gap-4">
      <!-- 其他组件 -->
      
      <!-- 版权信息 -->
      {licenseConfig.enable && (
        <License 
          title={entry.data.title} 
          pubDate={entry.data.published}
          url={Astro.url.href}
        />
      )}
      
      <!-- 渲染评论区 -->
      <Giscus />
    </div>
  </div>
  
  <!-- 侧边栏等其他内容 -->
</MainGridLayout>
```

# 说在最后
由于个人习惯性将各种杂七杂八的分开文件写,再统一导入,当然你也可以直接将Giscus.astro的内容直接写入你想要的地方,不用新建文件,个人习惯而已

The end Ciallo~