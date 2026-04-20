---
title: "理解配置"
published: 2025-06-07
description: "开源万岁~"
tags: [MC,server]
category: "GeyserWiki"
draft: false
series: "GEYSER用户手册"
---

# 理解配置

这个页面主要为你介绍 **Geyser** 配置各个选项的作用，尽管配置文件中已经介绍，我们还在这里为你带来更详细的讲解。

```yaml title="默认 Geyser 配置" collapse={1-200}
# --------------------------------
# Geyser 配置文件
#
# Minecraft 基岩版和 Java 版之间的桥梁
#
# GitHub: https://github.com/GeyserMC/Geyser
# Discord: https://discord.gg/geysermc
# Wiki: https://wiki.geysermc.org/
#
# 注意：请查看 https://wiki.geysermc.org/geyser/setup/ 获取最新安装指南
# 许多视频教程已过时，大多数情况下需要特定托管配置
# --------------------------------

bedrock:
  # 监听的IP地址（通常无需更改，除非要限制连接IP）
  #address: 0.0.0.0
  # 监听的端口
  port: 19132
  # 某些托管服务要求基岩版使用与Java相同的端口
  # 此选项使基岩版端口始终与Java端口相同（仅插件版本）
  clone-remote-port: false
  # 广播给基岩版客户端的MOTD信息（若passthrough-motd设为true则无效）
  motd1: "Geyser"
  motd2: "Another Geyser server."
  # 发送给基岩版客户端的服务器名称（显示在暂停菜单和设置菜单）
  server-name: "Geyser"
  # 网络流量压缩级别（值越高CPU使用越高但带宽越小）
  compression-level: 6
  # 向客户端广播的连接端口（仅当Geyser运行端口与实际连接端口不同时需要）
  # broadcast-port: 19132
  # 是否启用PROXY协议（除非在Geyser前运行UDP反向代理，否则不要启用）
  enable-proxy-protocol: false
  # 允许的PROXY协议代理IP地址/子网列表
  #proxy-protocol-whitelisted-ips: [ "127.0.0.1", "172.18.0.0/16", "https://example.com/whitelist.txt" ]

remote:
  # 远程(Java版)服务器IP地址
  # "auto"表示独立版设为127.0.0.1，插件版推荐保持"auto"
  address: auto
  # 远程(Java版)服务器端口
  port: 25565
  # 认证类型：offline, online 或 floodgate
  # 如果安装了Floodgate且地址设为"auto"，将自动使用"floodgate"
  auth-type: online
  # 连接服务器时是否使用PROXY协议
  # 仅当：1) 服务器支持PROXY协议 2) 在代理主配置中启用时有用
  use-proxy-protocol: false
  # 将基岩客户端连接时使用的主机名转发给Java服务器
  forward-hostname: false

# Floodgate使用的加密公钥文件路径
floodgate-key-file: key.pem

# 仅在线认证模式有效
# 存储应保存Java账户登录信息的基岩玩家列表
# 保存可重用的令牌（不保存邮箱或密码）
saved-user-logins:
  - ThisExampleUsernameShouldBeLongEnoughToNeverBeAnXboxUsername
  - ThisOtherExampleUsernameShouldAlsoBeLongEnough

# 等待用户授权Geyser访问微软账户的秒数
# 在此期间允许用户断开连接
pending-authentication-timeout: 120

# 是否启用命令建议（解决基岩客户端首次打开命令提示符时冻结问题）
command-suggestions: true

# 以下选项启用"ping透传" - 从Java服务器获取MOTD和玩家数量
# 将远程服务器的MOTD中继给基岩玩家
passthrough-motd: true
# 将玩家数量和最大玩家数从远程服务器中继给基岩玩家
passthrough-player-counts: true
# 启用旧版ping透传（仅当MOTD或玩家数量显示不正常时需要）
legacy-ping-passthrough: false
# ping远程服务器的间隔（秒），仅适用于独立版或旧版ping透传
ping-passthrough-interval: 3

# 是否将玩家ping转发给服务器（更准确但可能导致超时）
forward-player-ping: false

# 最大玩家数（当前仅为视觉显示，不实际限制）
max-players: 100

# 是否在控制台输出调试信息
debug-mode: false

# 冷却指示器显示方式
# 注意：启用后部分用户可能看到黑框，可在基岩版设置中调整
# 可选 title, actionbar 或 false
show-cooldown: title

# 是否向玩家显示坐标
show-coordinates: true

# 是否阻止基岩玩家进行脚手架式搭桥
disable-bedrock-scaffolding: false

# 表情符号处理方式（解决副手交换问题）
emote-offhand-workaround: "disabled"

# 默认区域设置（未设置则使用系统语言）
# default-locale: en_us

# 图像缓存天数（0为禁用）
cache-images: 0

# 是否显示自定义头颅（低性能设备可能导致卡顿）
allow-custom-skulls: true

# 每个玩家可见的自定义头颅最大数量（-1表示无限制）
max-visible-custom-skulls: 128

# 显示自定义头颅的半径（方块数）
custom-skull-render-distance: 32

# 是否添加基岩版不存在的物品和方块
# 禁用后熔炉矿车将映射为漏斗矿车
add-non-bedrock-items: true

# 允许在下界Y127以上建造/显示方块
# 通过将下界维度ID改为末地ID实现（整个下界使用红色雾效）
above-bedrock-nether-building: false

# 是否强制客户端加载所有资源包
force-resource-packs: true

# 是否解锁Xbox成就
xbox-achievements-enabled: false

# 是否在服务器日志中记录玩家IP地址
log-player-ip-addresses: true

# 当新Geyser版本支持当前不支持的基岩版本时是否提醒
notify-on-new-bedrock-update: true

# 标记不可用库存槽位的物品（默认为屏障方块）
unusable-space-block: minecraft:barrier

# bStats统计（匿名收集基本信息）
metrics:
  # 是否启用统计
  enabled: true
  # 服务器UUID（不要更改）
  uuid: generateduuid

# 高级选项 - 除非了解用途，否则不要更改！

# 计分板更新阈值（每秒超过此值限制为4次更新/秒）
scoreboard-packet-threshold: 20

# 是否允许ProxyPass和Waterdog连接
enable-proxy-connections: false

# 最大传输单元（默认1400）
mtu: 1400

# 是否直接连接Java服务器（不创建TCP连接）
use-direct-connection: true

# 是否禁用压缩（需要use-direct-connection为true）
disable-compression: true

# 配置文件版本
config-version: 4
```

### 基岩版部分

这些选项适用于 **Geyser** 基岩端方面。

**`address`**: **Geyser** 所开启的地址。一般情况下，你不需要修改这里，**保持原样即可**。

**`port`**: **Geyser** 所开启的端口。默认和基岩版的默认端口一样，为 `19132`。

**`clone-remote-port`**: 服务器每次开启时，Geyser 所开启的端口和 **Java版**服务器是否保持一致。**独立版无法使用此选项**。

**`motd1`**: **Geyser** 所开启的服务器显示的 **MOTD** 的第一行。

**`motd2`**: **Geyser** 所开启的服务器显示的 **MOTD** 的第二行。**请务必注意该选项只在基岩版客户端 好友 选项卡显示 Geyser 服务器时有效。**

**`server-name`**: 基岩版客户端在 **暂停页面** 所显示的世界名称。

**`compression-level`**: 一个数字值，表示压缩传出流量的程度。 可以是 **-1** 到 **9** 之间的任意数字；任何其他值都将替换为最接近的可接受值。数字越大，使用的 **CPU** 处理越多，但使用的 **带宽** 越少。

### 远程服务器部分 (Java版 部分)

这些选项适用于 **Java** 版服务器。

**`address`**: 你所要连接的 **Minecraft:Java** 版服务器的地址。默认情况下，这个选项被设置为 `auto`。如果一直设置为 `auto`，那么 **Geyser** 会自动同步 **Java版服务器** 的 **IP、端口和Floodgate配置信息**。在独立版，将其设置为 `auto` 将代表设置成 `127.0.0.1`。

**`port`**: 你在 `address` 选项所要连接的 **Minecraft:Java** 版服务器的端口。

**`auth-type`**: 登录到 **Minecraft:Java** 版服务器的方式，包括 `online`, `offline`和 `floodgate`。

**请务必注意您的 `auth-type` 选项必须和对应 Java 版服务器保持一致 (除了你的 Java 版服务器是盗版服务器，而你在这里设置为正版的情况)。尝试不用正版登录方式进入正版服务器是行不通的。如果你希望你的正版服务器的基岩版玩家无需使用 Java正版账号 登录，请查看 Floodgate Wiki。**

**`use-proxy-protocol`**: 是否在连接到服务器时使用 PROXY/HAProxy 协议，这一般在以下情况有用：

* 你的服务器支持 PROXY 协议（大多数情况下是不支持的）。
* 你的 **Java** 版服务器使用 **Velocity** 或者 **BungeeCord** 代理端并且其对应配置也是开启的。

**`forward-hostname`**: 是否将 **Geyser** 服务器的 **IP/端口** 和 **Java版服务器** 保持一致。

### 通用选项

通用选项一般适用于 **Geyser** 本身的修改。

**`floodgate-key-file`**: **Floodgate** 生成的 **key** 文件的路径。你必须安装 [Floodgate](https://github.com/GeyserMC/Floodgate/wiki/) 且 `auth-type` 选项设置成  `floodgate`，否则该选项没有意义。

**`userAuths`**: <mark style="color:red;">**此选项已被移除！**</mark>一个放置你自己的 **Minecraft:Java版** 正版账号的选项，这样你每次登录 **Geyser** 服务器将会自动进入服务器，不需要输入你的正版账号信息。 **我只建议你在个人使用 Geyser 时配置此选项，我想没人会愿意把自己的正版账号共享给其他人使用。**

如果你的 **Xbox** 账号名称是 **Notch**，你的 **Java版正版账号** 的邮箱地址是s`foobar2000@gmail.com` 然后你的密码是 `hunter2` ，那么你就需要按下面这样的格式填写配置:

```
userAuths:
  Notch: # MCPE/Xbox 账号名称
    email: foobar2000@gmail.com
    password: "hunter2"
    microsoft-account: true
```

账号名称前面是两个空格，**email** 等前面是四个空格。

**`saved-user-logins`**: 只在 **Geyser** 的 `auth-type` 为 `online` 模式下有效，将会储存对应基岩版玩家的 Java 版正版账号相关信息。我们不会明文储存其账号和密码，而是使用一个类似密码的家伙加密储存它，但将你的该文件传输给他人时还是小心为妙！

一个示例：

```
saved-user-logins:
  - jeb_
  - Dinnerbone
```

**`command-suggestions`**: 如果你的服务器指令提示太多，基岩版客户端在玩家首次打开聊天框并输入指令时会出现卡顿或者崩溃。这个配置选项可以关闭指令提示功能，以解决卡顿问题。自从 **1.16.100** 版本更新&#x540E;**: 指令提示造成的崩溃问题已经大幅度解决，在大多数情况下你不需要关闭这个选项。**

**`passthrough-motd`**: 是否直接显示 **Java** 版服务器的 **MOTD**。如果设置为是，那么 `motd1` 和 `motd2` 选项在 **基岩版客户端** 的 **MOTD不会显示**。

**`passthrough-protocol-name`**: 是否直接显示自定义的 **Java** 版自定义版本信息。 (例如 BungeeCord \[X.X], Paper 1.X) - 这通常在你的Java版服务器使用自定义版本信息功能情况下才有用，如果你不知道你的服务器是否有使用相关功能，你可以前往 **MCSrvStatus** 查看你的服务器版本信息以确认。\<mcsrvstat.us>

**`passthrough-players`**: 是否直接显示 **Java** 版服务器的人数。

**`legacy-ping-passthrough`**: 如果启用，则通过模拟 **Minecraft** 客户端而不是使用服务器的 **API** 手动 **ping** 服务器。**你应当&#x20;**_**只在你**_**&#x20;的MOTD人数不正确情况下再考虑开启此选项。**&#x7531;于这个选项开启通常会在 **BungeeCord** 等上出现问题。此选项在独立版无效。

**`ping-passthrough-interval`**: 接上一个选项，虚拟的 Minecraft 客户端应该尝试 ping 远Java版服务器以更新信息的频率，**以秒为单位**（设置为 **1** 将每秒 ping 一次服务器；设置为 **3** 将每三秒 ping 一次服务器）。 仅与独立和传统 ping 直通相关。 如果您遇到超时或 BrokenPipe 错误，请增加该数字。

**`max-players`**: 在 ping Geyser服务器时显示的最多玩家数量。这个选项实际上不是真的去限制玩家上限。当服务器玩家满员时，人数上限也会跟着提升，而基岩版客户端本身在检测到服务器满员时会直接不尝试连接到服务器。

**`debug-mode`**: **debug** 信息是否在控制台输出。这在你遇到错误或者需要技术信息时有用。

**`general-thread-pool`**: **Geyse**r 将能够使用的线程数量。越高并不总是代表越好 :P。

**`allow-third-party-capes`**: 是否为基岩版玩家显示第三方 (Optifine, 5zig, LabyMod等) 的披风。

**`allow-third-party-ears`**: 是否为基岩版玩家显示第三方 Deadmau5-style ears。目前只支持 MinecraftCapes。

**`show-cooldown`**: 基岩版客户端目前并没有 **Java版 1.9+** 的 **PvP** 机制。为了解决这个问题，Geyser 发送虚假的 Title 以代替攻击冷却条。如果你的服务器使用 1.8 的 PvP 机制，那么此攻击冷却条将不会显示。此选项可以填写 `false` (不发送攻击冷却条)， `title`/`true` (以 Title 形式显示攻击冷却条)，或者`actionbar` (以底部条显示攻击冷却条)。填写其他值等于填写 `false`。

**`show-coordinates`**: 基岩版有一个可以在屏幕的左上角显示坐标的选项。 此选项启用或禁用此功能。

**`emote-offhand-workaround`**: 从 **Java 版 1.9** 开始，客户端可以使用所设置的按键 **在主手和副手中切换物品**（默认是 F）。基岩版没有这个功能，所以这个选项弥补了它。如果设置，当基岩版玩家使用任意表情时，他就会交换副手和主手物品，就像Java版的一样。 这里可以填写为三个值：

* `disabled` - 默认值，不使用此解决方案。
* `no-emotes` - 表情将不会发送给其他基岩版玩家，同时进行主手和副手的切换物品。这也代表表情功能在 Geyser服务器 中关闭。
* `emotes-and-offhand` - 表情发送给其他基岩版玩家同时也会进行主手和副手切换物品。

**`default-locale`**: 如果无法查找玩家的语言，那么 **Geyse**r 给玩家设置的语言。[点击这里](chang-jian-wen-ti) 以查看你的语言的代码。

**`chunk-caching`**: 为每位基岩版玩家提供区块缓存，这将以增加 **RAM** 内存为代价而带来 额外音效支持和修复移动问题。在 **Spigot** 上使用将会始终启用此选项，因为我们可以使用服务器的 **API** 来获取区块信息而没有其他任何增加的资源损耗。 _Geyser 不推荐你关闭这个选项。_

**`cache-images`**: 指定图片将被缓存到本地的天数以节省从 **互联网** 下载它们的时间。 如果设置成 **0** 则是被禁用。（默认值：0）

**`allow-custom-skulls`**: 允许 **Geyser** 翻译自定义头颅皮肤。这会在一些低端/老的设备上造成严重的卡顿问题。

**`above-nether-bedrock-building`**: 基岩版的下界最高高度是127，玩家无法在 **128** 格以上高度放置方块 - 开启这个选项以后，Geyser 会把下界维度翻译成末地维度，虽然这么做会导致下界的天空是末地的样子，但目前只能通过这种方法解决你在下界放置 **128** 格以上高度放置方块的问题。

**`force-resource-packs`**: 如果 Geyser 加载了资源包，那么将强制玩家使用改资源包。如果设置为 **false**，那么玩家可以拒绝该资源包并断开与服务器的连接。

**`xbox-achievements-enabled`**: 是否在玩家游戏时解锁 Xbox 成就。这将导致你的服务器的指定指令无法使用，因为”作弊“选项将会被关闭。**如果开启，像 /gamemode 和 /give 这样的指令在基岩版将无法使用。**

### 高级选项

**`scoreboard-packet-threshold`**: Geyser 会在每个记分板数据包之后更新记分板，但是当 Geyser 试图每秒处理大量记分板数据包时会导致严重的延迟。 此选项允许您指定在每秒多少个计分板数据包之后，计分板更新将被限制到每秒四次更新。

**`enable-proxy-connections`**: 允许来自 **ProxyPass** 和 **Waterdog** 的连接。 查看 [https://www.spigotmc.org/wiki/firewall-guide/](https://www.spigotmc.org/wiki/firewall-guide/) 以获取帮助 - 使用  UDP 而不是 TCP。**如果你使用 BungeeCord 或者 Velocity 这样的代理端，则不需要开启本选项。**

**`mtu`**: [https://en.wikipedia.org/wiki/Maximum\_transmission\_unit](https://en.wikipedia.org/wiki/Maximum_transmission_unit) - ~~互联网支持的最大 MTU 为 1492，但可能会导致数据包碎片问题。~~ 1400 是默认值。

**`use-direct-connection`**: 是否直接连接到 **Java** 服务器而不建立 **TCP** 连接。只有当某个插件的数据包或网络无法与 **Geyser** 正常工作时，才应考虑关闭此功能。 如果在插件版本上启用，**Geyser** 配置下的Java版服务器地址和端口部分将被忽略。 如果在插件版本上禁用，将有可能导致性能会下降，延迟会增加。
