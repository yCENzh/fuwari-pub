---
title: 三月七都能学会的Fuwari部署教程
published: 2026-02-26
description: fuwari的保姆级部署教程
tags: [Essay, 随笔, 记录, fuwari]
category: 记录
series: 随笔
---

> 文章创建于`2025-10-06`

~中Cia快llo~,今天是中秋节哦,大家中秋节快乐!~

# cloudflare

为什么选择`cloudflare`呢,而不是vercel,netlify,EdgeOnePages或GithubPages等平台呢

当然是`cloudflare`托管的静态资源全部不计费用拉,赛博大善人实至名归

有人肯定要问了,`eo pages`不也不计费吗,因为不备案域是真的慢啊（（（

## 部署教程

首先fork我的github项目
::github{repo="yCENzh/Fuwari-yCENzh"}

当然你fork上游也是可以的,不过部署到worker要在根目录下额外创建`wrangler.jsonc`文件

```json title="wrangler.jsonc"
{
  "name": "fuwari",
  "compatibility_date": "2025-10-06",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page" // 如果你有自定义的 /src/pages/404.astro 页面
  }
}
```

注册一个cloudflare账号,从**计算和 AI**选项卡进入**Workers 和 Pages**页面,创建应用程序在***Workers***选项卡中点击导入存储库(你用pages也是可以的,但是默认分的ip慢慢的,优选也很麻烦)

授权cloudflare访问你的github账号,然后选择你的仓库,项目名称填好之后,构建命令`pnpm build`,部署命令默认的`npx wrangler deploy`即可,剩下不用管,点击创建和部署

:::note
如果在最后部署失败了,但是构建是正常的,那么请检查一下wrangler.jsonc中的项目名称是否均为小写字母,大写及其他不可以哦
:::

进入项目设置,在**域和路由**中可以看到默认分了两个地址,一个已启用的**workers.dev**,这个域名在国内是被封禁了的,正常网络环境下无法访问,和**vercel.app**一样

点击添加路由,选择你的区域,路由是动态表达式,失败模式任意
> 假设你要部署的域名是**blog.xxx.com**,那么就在路由框里填写`blog.xxx.com/*`,后面的`/*`是必要的,如果没有则只有**blog.xxx.com**这一个URL的请求会被转发到worker

然后前往域名的`DNS`记录页面,添加一个cname记录,将你的博客域名指向`fuwari.oh1.top`
```
Name: blog.114514.com
Type: CNAME
Value: fuwari.oh1.top
```

## (可选)PR预览

在项目设置,**构建**选项卡中的**分支控制**中启用**拉取请求预览**,这样cloudflare将会为你仓库中的每一个PR请求部署一个预览URL,不过也是**worker.dev**的,国内无法直连,并且由于CF构建缓存的原因部署也比较慢,所以一般使用`netlify`进行预览

# netlify,vercel,CloudflarePages及EdgeOnePages等静态部署平台

都是同样的方法,在导入仓库后,构建命令`pnpm build`,初始化命令(也有可能翻译不一样或者直接不给出这一项)填`pnpm install`,产物目录为`dist`,静态托管平台一般都是这样

最后,大家中秋快乐,The end Ciallo~