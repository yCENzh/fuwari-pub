---
title: Fuwari许可证卡片断词点修复
published: 2025-08-17
description: 通过添加break-all和block确保许可证卡片字符正确换行
tags: [Guide, Fuwari, Link, astro]
category: Fuwari
series: Fuwari
---

# 原因

> 早就看这换行不爽了,今天终于有时间改了

从之前就发现当网站URL过长的时候,例如原本的域名过长或者像我fuwari一样文章套了多层路径,下方的许可证卡片所展示的原文链接在移动端UA下不会正确换行~~(至少我的dpi是这样的)~~  
今天也是终于抽出时间来改一下

## 解决方法

> 由于问题是在移动端没有合适的断词点导致的,这里选择手动添加CSS类在需要时断行

### 1. 使用 `wrap-break-word` 和 `overflow-wrap`

```css title="/src/components/misc/License.astro"
<a href={postUrl} class="link text-(--primary) wrap-break-word overflow-wrap">
    {postUrl}
</a>
```

### 2. 使用 `break-all` 和 `block`

> 也是我所使用的方案

```css title="/src/components/misc/License.astro"
    <a href={postUrl} class="link text-(--primary) break-all block">
        {postUrl}
    </a>
</div>
```

### 3. 你也可以为了兼容使用多个属性

```css title="/src/components/misc/License.astro"
<a href={postUrl} class="link text-(--primary) break-all word-break overflow-wrap">
    {postUrl}
</a>
```

> 如果你不想显示完整URL,也可以考虑只显示域名或使用省略号

The end  
编辑者yCENzh