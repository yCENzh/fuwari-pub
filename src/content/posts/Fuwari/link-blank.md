---
title: Fuwari链接外部跳转
published: 2025-08-14
description: 通过使用rehypeExternalLinks插件让Fuwari链接外部跳转
tags: [Guide, Fuwari, Link, astro]
category: Fuwari
series: Fuwari
---

## 话说在前

用 `Fuwari` 模板搭建博客的各位肯定遇到过这种情况:

> 网站内的链接点击直接在内部跳转,而不是新标签页打开 ( 就很烦

那么,在灌水的时候也是看到群U分享了一个很好用的插件可以解决这个问题a

## 使用方法

1. 使用包管理器安装rehype-external-links插件

> 以pnpm举例

```bash
pnpm add rehype-external-links
```

2. 修改astro.config.mjs,导入并配置
```js title="astro.config.mjs"
其他导入...

// 导入rehype-external-links插件
import rehypeExternalLinks from 'rehype-external-links';

...

  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
        target: '_blank',
        },
      ],
...
```

3. 你不会以为还有吧?没了,就这么简单(

> 推上去之后,现在网站内的链接应该就会以新标签页形式打开了

The end Ciallo~