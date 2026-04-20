---
title: "假人 | LeavesMC 文档"
published: 2025-03-25
description: "随笔记录~LeavesMC"
image: "https://docs.leavesmc.org/logo.svg"
tags: [LeavesMC,Bot,Minecraft]
category: "记录"
draft: false
series: "LeavesMC"
---

# 假人

Leaves 提供了类似 Carpet 的假人支持，假人的命令为 `/bot`。

## 什么是假人

假人是一个 **玩家实体**，怪物会被它吸引并攻击它，它也可以模拟部分玩家操作。比如：

- 区块随机刻  
- 生物生成  
- 物品使用  
- 方块破坏  
- ……

## 权限

- `bukkit.command.bot` — 允许玩家使用 `/bot` 命令。

## 创建假人

在游戏内执行命令：  

/bot create <假人名> [皮肤名]

或在控制台执行命令：  

/bot create <假人名> <皮肤名> <世界名>   


- `<假人名>`：必填，需符合 Minecraft 玩家名规范  
- `[皮肤名]`：可选，假人使用该皮肤；未填写则使用假人名对应皮肤  

游戏内创建的假人会继承创建者的位置与视角（Rotation 与 Pos）。

> **提示**  
> 若玩家未离开假人位置，碰撞会导致假人偏移。  
> 若假人创建后未出现，请检查服务器与 Mojang 皮肤服务器的连接。

> **危险**  
> 假人不会穿过传送门，需将假人放置在目标世界；若强行切换世界，假人可能无法正常工作。

## 移除假人

假人无法复活，死亡后即使 `keepInventory=true` 也会掉落所有物品并移除（而非像 Carpet 那样断开连接）。  
默认情况下，服务器关闭前会移除所有假人，可在配置中修改是否重启后自动还原。  

手动移除：  

/bot remove <假人名>

定时移除：  

/bot remove <假人名> 时 [秒]


## 假人加载/保存

可手动保存/加载假人，相当于玩家上下线，信息保持一致：  

/bot save <假人名> /bot load <假人名>


## 假人配置

每个假人拥有独立配置项，不影响他人。  
查看配置：  

/bot config <假人名> <配置项名>

修改配置：  

/bot config <假人名> <配置项名> [修改值]


| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| always_send_data | 布尔 | 配置文件指定 | 是否始终向同世界玩家发送数据，使其可见 |
| simulation_distance | 整数 | 世界设定 | 控制假人强加载的区块范围 |
| skip_sleep | 布尔 | 配置文件指定 | 睡眠计数时是否跳过假人 |
| spawn_phantom | 布尔 | 配置文件指定 | 是否允许假人生成幻翼 |
| tick_type | 枚举<NETWORK, ENTITY_LIST> | 配置文件指定 | 实体刻计算方式：NETWORK 等同真人，ENTITY_LIST 类似 Carpet |

> **提示**  
> tick_type 会影响基于假人时序的机器设计，请查询机器作者说明。

## 假人动作

假人目前支持 15 种动作，可同时执行多个，互不干扰。

- 查看动作列表：  

/bot action <假人名> list

- 开始动作：  

/bot action <假人名> <动作名> [动作参数]

- 停止动作：  

/bot action <假人名> stop <序号/all>


### 动作通用参数
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| TickDelay | 整数 | 20 | 每次操作成功后的等待 tick 数 |
| DoNumber | 整数 | -1 | 动作执行次数，-1 为无限 |
| X/Y/Z | 浮点 | 0.0 | 坐标 |

### 所有动作

| 动作名 | 参数 | 描述 |
|--------|------|------|
| attack | [TickDelay] [DoNumber] | 攻击视线前方碰撞箱内实体 |
| break | [TickDelay] [DoNumber] | 挖掘视线前方方块 |
| drop | 无 | 扔出背包全部物品 |
| fish | [TickDelay] [DoNumber] | 自动钓鱼 |
| jump | [TickDelay] [DoNumber] | 跳跃 |
| look | <X> <Y> <Z> | 看向指定坐标 |
| rotate | 无 | 看向玩家位置 |
| sneak | 无 | 切换潜行 |
| swim | 无 | 在水中自动浮起 |
| use | [TickDelay] [DoNumber] | 使用主手物品（不对方块/实体） |
| use_offhand | [TickDelay] [DoNumber] | 使用副手物品（不对方块/实体） |
| use_on | [TickDelay] [DoNumber] | 对方块使用主手物品 |
| use_on_offhand | [TickDelay] [DoNumber] | 对方块使用副手物品 |
| use_to | [TickDelay] [DoNumber] | 对实体使用主手物品（可进载具） |
| use_to_offhand | [TickDelay] [DoNumber] | 对实体使用副手物品（可进载具） |

> **PS:孩子别乱玩**  
> 使用带有 GUI 的物品/方块/生物（箱子、工作台、驴等）行为未定义。

## 假人列表

查看全部或指定世界的假人：  

/bot list [世界]

不填世界时默认显示 world/world_nether/world_the_end，填写自定义世界名可查看该世界假人。
