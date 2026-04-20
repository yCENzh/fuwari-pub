---
title: "常见异常"
published: 2025-06-06
description: "开源万岁~"
tags: [MC,server]
category: "GeyserWiki"
draft: false
series: "GEYSER用户手册"
---

# 常见异常

通常，用户在使用 **Geyser** 时会遇到无法连接到服务器类似的错误，这个页面帮助你尝试解决这些异常。如果你仍然没有解决，请不妨加入 [我们的 Discord](https://discord.geysermc.org) 以获得支持。

### Floodgate

有关 **Floodgate** 的帮助，请见: [这里](../floodgate-wiki/wen-ti)。

### 控制台报错

#### 无法获取本地附件缓存 Unrecognized token 'Read': was expecting (JSON String, Number, Array, Object or token 'null', 'true' or 'false') at \[Source: (String)"Read timed out"; line: 1, column: 5] 非法的本地下载和加载请求: zh\_cn&#x20;

每次开启Geyser前自行给服务器搭建能够垂直向上攀爬的工具连接海外代理下载，或者加入首页提供的群的群文件下载别人下载好的语言文件放入locates。 这最多导致服务器内语言文件丢失，跟无法进入服务器没有半毛钱关系。

### 无法正常连接到服务器! (服务器在好友选项卡没有显示或者在连接服务器时出现 "无法连接到世界")

* 如果你不使用像 **TCPShield** 的反向代理，请保证你的 `enable-proxy-protocol` 选项是设置为 **false** 的。

#### 如果服务器没有在好友选项卡显示

* _如果你使用的是 Windows 10, iOS, 或者 Android_: 尝试以添加服务器形式连接。
* _如果你使用的是 Xbox One_: 尝试使用 [BedrockConnect](https://github.com/GeyserMC/Geyser/wiki/Using-Geyser-with-Consoles) 连接。
* _如果你使用的是 PS4_: [请使用使用一个 LAN 代理](https://github.com/GeyserMC/Geyser/wiki/Using-Geyser-with-Consoles#playstation-4)
* _如果你使用的是 Nintendo Switch_: 目前没有方法可以使用好友选项卡连接，但你仍然可以使用 [BedrockConnect](https://github.com/GeyserMC/Geyser/wiki/Using-Geyser-with-Consoles) 以添加服务器形式连接。

如果 Geyser 服务器就在本地：尝试将 `localhost` 或者 `0.0.0.0` 作为IP，以添加服务器形式进行连接。如果这没有效果，或者你的 Geyser 服务器不在同一个电脑，那么请使用：你 **本地** 的 IPv4 地址。

#### [点击这里](chang-jian-yi-chang/xiu-fu-wu-fa-lian-jie-zhi-shi-jie) 以修复 "无法连接至世界" 且后台无报错

**在启动时提示 `java.net.BindException: Address already in use: bind`**&#x20;

这代表 **Geyser** 服务器所开设的端口已被占用，请确保你关闭了所有占用该端口的软件，然后再试。如果这没有起作用，通常重启你的电脑即可解决该问题。

**\[...] `has been compiled by a more recent version of the Java Runtime (class file version 60.0)`**

点击这个链接以了解如何升级到 **Java 16**: [https://paper.readthedocs.io/en/latest/java-update/index.html](https://paper.readthedocs.io/en/latest/java-update/index.html).

**您的服务商可能没有及时打开UDP端口**

这通常和你的主机端的端口有关。最常见的是，跟Java版的常用的 TCP 协议的端口不同，你的主机很有可能没有开放基岩版所使用的 UDP 协议的端口。一个确认此问题的方法是关闭你的服务器，然后选择其他 基岩版服务端，例如 **Nukkit**（你不一定非要用 **Nukkit**）以检查是否是该问题导致的。

### 卡在 "正在连接服务器" 且后台没有报错

你或许需要升级你的 Java，如果确实是这样，请访问 [AdoptOpenJDK.net](https://adoptopenjdk.net)。

有时这会发生在网络较差的环境中。 Geyser 配置中有一个 `mtu` 选项； 慢慢降低这个数字（以 100 为基准），每次修改后重新启动，并重新测试加入。

如果您收到“无法连接到世界”而没有提示新的连接的控制台记录，则此选项很可能没有作用。

### 登录失败

_**如果你正在使用一个插件版本：**_ 在你的 Geyser 配置，将你的 bedrock 的 ip 设置为 `127.0.0.1`。

**Cannot reply to EncryptionRequestPacket without profile and access token**

出现这个消息一般有两个原因:

_Floodgate 问题_:

如果您配置启用了 Floodgate 可能会出现此消息。 通常，这意味着您的 Floodgate 配置是错误的，或与其他插件冲突。如果您曾将 **Floodgate** 的密钥文件复制到 **同一服务器** 上的 **Geyser** 文件夹，那么 **Geyser** 文件夹内的密钥文件就是多余的。您可以放心的删除复制到 **Geyser** 文件夹中的密钥文件，重新启动服务器。

_服务器是正版模式而你的 Geyser 设置的是离线模式_:

如果你的配置如上所述，那么简单来说，**Geyser** 自然不会正常运作。如果你将服务器设置为正版认证，那么你的 **Geyser** 配置也应该是相同的。 正版认证的服务器将会要求您使用 **Java正版账户** 进行登录认证，如果你在登陆 **Geyser** 的时候没有使用正版账户认证，那么你将无法加入服务器。如果你的配置没有问题却仍然遇到这个报错，那么有可能是您的登录凭据无效（如密码错误）或者是连接正版认证服务器时连接超时。

**Connection Refused: \<INSERT IP AND/OR DOMAIN>**

连接被拒绝通常意味着请求该端口时无法连接 **Java** 服务器，或者服务器拒绝访问网络级别的外部连接。后者可能会发生在类似 **TCPShield** 等 **DDOS** 防护插件上，如果您没有类似的 **DDOS** 防护插件，请确保您尝试连接的服务器连接 IP 或域名在配置中拼写正确，已启动且端口转发正确。

如果您从旧版本的 **Geyser** 进行更新，请将您的远程地址设置为`auto`，然后重试。

**Floodgate Misconfiguration**

请查看 [这个页面](../floodgate-wiki/wen-ti) 查看更多信息

**Mojang Resetting Account Credentials**

不幸的是，这是我们无法控制的事情，当您在服务器上将 **Geyser** 作为插件运行，很可能出现这种情况，异地登陆会让 **Mojang** 判定您的账户可能被盗号，并因此重置登录凭据。 如果您在本地运行 **Geyser**，这不应该发生。我们推荐由我们制作的插件 [Floodgate](https://github.com/GeyserMC/Floodgate), 它允许基岩版客户端在不需要 Java 版帐户的情况下加入您的服务器。 [点击了解这个插件](https://github.com/GeyserMC/Geyser/wiki/Floodgate) 以获得更多帮助。

### 基岩版客户端提示 "无效IP地址"

目前尚不清楚为什么，即使对于有效的域名也会发生这种情况。尝试使用 IPv4 地址。

### 基岩版客户端在使用指令时出现卡顿或者崩溃

在你的 Geyser 配置文件中关闭 `command-suggestions` 选项。 关闭这个设置后基岩版玩家将无法进行命令补全，但是可以防止因此造成的游戏卡顿或崩溃。 如果你是服务器的管理员，你可以准备一份命令白名单让玩家使用， 这将会把非必要的命令从TAB补全中移除，对于Java版玩家来说也是一样。他还有其他好处。这是一个可以做到此功能的插件： [CommandWhitelist](https://www.spigotmc.org/resources/commandwhitelist-spigot-waterfall-velocity.81326/)

### BungeeCord 在基岩版玩家加入后卡顿或者崩溃

请确保你的 **BungeeCord** 的 `config.yml` 配置文件中将 `ip-forward` 设置为 `true` 并在你的所有子服的 `spigot.yml` 配置文件中将 `bungeecord` 设置为 `true`。

### Failed to load locale asset cache: Unrecognized token 'Cannot'

这与启动时无法下载区域设置文件相关的任何其他内容通常是由 java 尝试使用 IPv6 连接而 Mojang 仅使用 IPv4 引起的，因此使用在启动命令添加此标识来固定使用ipv4： `-Djava.net.preferIPv4Stack=true`, 就像这样: `java -Xms1024M -Djava.net.preferIPv4Stack=true -jar Geyser.jar`

### Outdated client! Please use 1.x.x

**Java** 版服务器太新，**Geyser** 对它来说有点旧了。请确保你的 **Geyser** 是最新版本，如果是，请耐心等待 **Geyser** 完成更新。

### Outdated server! I'm still on 1.x.x

更新你的 **Java** 版服务器或者使用 [ViaVersion](https://viaversion.com) 插件。 你也可以尝试 [VIAaaS](https://github.com/ViaVersion/VIAaaS)。

### Query: Incorrect Magic!

看这里： [https://www.spigotmc.org/threads/query-incorrect-magic-and-high-cpu-usage.159386/#post-2709057](https://www.spigotmc.org/threads/query-incorrect-magic-and-high-cpu-usage.159386/#post-2709057)

\*如果您不使用 TCPShield 等反向代理，请确保将 `enable-proxy-protocol` 设置为 false.

### 只在安装 Floodgate 的 BungeeCord 服务器上有效

如果您使用 Floodgate，请确保将其安装在所有 Spigot 子服上，如下所示：

1. `Bungee: Geyser 和 Floodgate`
2. `大厅: floodgate`
3. `子服-1: floodgate`
4. `子服-2: floodgate` 其他的同理。
5. 请保证你的 `key.pem` 和 `config.yml` 在所有的服务器上使用的是相同的配置。

如果您的玩家无法从大厅连接到另一个子服，请检查控制台。

**可能造成该问题的插件：**

* `HamsterAPI`

# 修复 “无法连接至世界”

_无法连接至世界_ 是许多人在使用 Geyser 时遇到的共同问题，下面我们将一步一步教你如何解决这一问题。

## 在我们开始之前...

### ...Java 玩家同样也无法加入！

这 **肯定不是** Geyser的问题。**Geyser** 不会对 **Java版服务器** 进行任何改动。**Floodgate** 也只对 **基岩版玩家** 修改登录流程。所以，请联系你的服务商，向他们寻求解决服务器连接的问题。

### ...我刚刚更新了Geyser，现在它没法正常工作了！

如果这在你更新了插件版的Geyser后出现，请确保你是关闭了你的服务器，然后替换了 Geyser jar 文件，然后重新开启你的服务器。

### ...控制台有一堆报错！

请阅读 [常见异常]()。如果你的问题并不在那个页面出现，请加入我们的 [Discord](https://discord.geysermc.org) 以寻求帮助。

### ...你被无限的重启困扰了吗？

特别是手机用户，有时，你只需要重启你的游戏客户端就可以解决这个问题了。

## 是服务器的问题还是客户端的问题？

将你的 **Java** 版服务器 **IP** 和基岩版的 **IP** 放在 [https://mcsrvstat.us/](https://mcsrvstat.us) 网站查询。这是首先确定服务器是否正常工作的好办法。

## 一般排除步骤

### 确保你使用正确的 IP 连接

您应该连接到 Java 服务器 IP 和基岩端口。 例如，如果您转发了 19132 端口，则在从基岩版连接时应指定端口 19132。

### 我正在使用一个云主机 或者 VPS！

在您确保您的操作一切都是按照我们所述的话，我们建议向你的服务商寻求帮助。

### 端口转发

您的服务器需要进行端口转发。通常，您可以使用 Minecraft Java版的端口转发相关教程获取帮助；但是，您需要将其中的 TCP 替换为 UDP，并且默认情况下，将端口 25565 替换为 19132。

### 在 DNS 选项/端口转发中使用 TCP 而不是 UDP

Minecraft Java版使用 TCP 进行连接； Minecraft 基岩版使用 UDP。 仅使用 TCP 转发您的基岩版端口将不起作用，它必须是 UDP。 使用`TCP/UDP`（两种协议）转发你的基岩版端口也应该有效，但不推荐使用，除非 Java 版和基岩版共享同一个端口。

### 基岩版端口值小于 10000

从以前的数据上看，拥有一个较低的基岩版端口值会导致问题。 将其设置为 **10000** 或更高似乎是更为稳妥的。

### 更改配置文件 'bedrock' 项的 'address'

除了少数的服务商只开放给您指定的端口或者其他特殊情况，您通常不需要更改 Geyser 配置的这一部分。 但是，在极少数情况下，它确实可以解决问题。

## 对于服务商

### 翼龙面板

如果您在使用翼龙面板时遇到此错误，请尝试编辑 Geyser 配置并将端口更改为除“19132”之外的其他值（例如“25566”）。

### 在同一网络上的另一台计算机上使用 Geyser

#### 只能在主机上连接，不能以其他任何方式连接

您的防火墙很可能屏蔽了 Geyser 的端口。 尝试在其中添加基岩版所连接的端口，或出于测试目的禁用防火墙。

## 在同一台电脑上使用 Geyser

### Windows 10

_这只会影响尝试从 Windows 10 版加入 Geyser 且与 Geyser 服务器在同一台电脑上的人。_

这是由未解除环回限制(Loopback restrictions)引起的问题。 默认情况下，微软应用对其所有本地连接的应用程序都有此限制。 **Geyser** 将尝试自动解决此问题；但是，如果您在使用 **Geyser** 时若仍然遇到连接问题，您可以通过在管理员模式下在 **Windows PowerShell** 中输入以下内容来解除它：（如果正常执行，它应该返回“OK.”）

```
CheckNetIsolation LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"
```

如果这不起作用，您可以尝试以下步骤：

1. 按住Windows键+ R
2. 在提示中输入`hdwwiz.exe`，然后回车然后下一步
3. 手动安装硬件
4. 选择 网络适配器 > 下一步 > 左边选择 "Microsoft" > 右边选择 "Microsoft KM-TEST 环回适配器" 然后点击 下一步 直到完成。
