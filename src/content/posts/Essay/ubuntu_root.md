---
title: Ubuntu切换至默认root用户
published: 2025-09-21
description: 其实准确来说是linux通用,彻底删除sudo也不是不行(bushi
tags: [Essay, 随笔, 记录, Ubuntu, root]
category: 记录
series: 随笔
---

# 话说在前

~终于又有水文章的机会了,不容易啊~

> `@鈴奈咲桜:`linux安装包管理器一定要加sudo,不然包失败的,macOS也一样

对于日常使用来说,其实你是否root用户登录没什么区别,别提什么不安全,~跟你sudo就能逃过一劫一样~,个人感觉默认root还更方便

# 具体过程

Ubuntu原版镜像默认不是并拒绝root用户登录,可以看一下自己当前什么用户,印象里好像是叫`ubuntu`
```bash
whoami
```

对于有临时需求的可以直接`sudo -i`
```bash
sudo -i
```
- 这会切换到 root 用户,并加载 root 的环境变量,并且不需要设置 root 密码
```bash
sudo su
```
- 同样切换到 root 用户,但环境变量可能略有不同

## root本地化

> ~怎么感觉我可以脑补一下踩坑的过程了~

那么如何实现登录即root用户呢,首先就是为root设个密码,Ubuntu默认root用户无有效密码,拒绝ssh登录,只能sudo
```bash
sudo passwd root
```
输入两遍 12345678 ,仪式感拉满(bushi

看起来可能一切顺利,切换到root问题就来了
```bash
su -
# 输入密码,进去是 tty,行,也不是不能玩
startx
```
--屏幕一黑,风扇狂转,桌面没起来,只剩一只孤独的光标在左上角眨😐

:::note
root 默认被 GDM3 禁止图形会话,PAM 一脚把你踢出去
:::

那么就改 PAM,放 root 进门
```bash
sudo nano /etc/pam.d/gdm-password
```
找到这行
```bash
auth required pam_succeed_if.so user != root quiet_success
```
前面加`#`
```bash
# auth required pam_succeed_if.so user != root quiet_success
```
Ctrl+O,Ctrl+X,root登录封印解除🤔

到这就没了 吗?既然都要用root了,那不如再对GDM3动一刀
```bash
sudo nano /etc/gdm3/custom.conf
```
取消注释并改成
```bash
[security]
AllowRoot=true

[daemon]
AutomaticLoginEnable=true
AutomaticLogin=root
```
F10 保存,开机自动 root 桌面,仪式感+1

重启,成功进入root桌面
> 壁纸出来了,终端图标闪啊闪,**UID=0**正式上线😋

## 既然都过河了,那就拆个桥吧

把sudo卸了
```bash
apt remove --purge -y sudo
apt autoremove -y
```
`sudo: command not found`,这下舒服了

### 删除原用户
```bash
# 先打包留念
tar -czf /root/ubuntu_backup.tgz -C /home ubuntu
# 再删账户+home目录
deluser --remove-home ubuntu
```
直接左脑右脑一起root😋

### 数据怎么办
~直接不要了,这里又是个坑~

如果你想保留数据,但是懒,最简单的办法就是只删账户不删文件,也就是没有`--remove-home`
```bash
deluser ubuntu
```

你要是不想留着home,那就备份再删了
```
# 0. 确保你在 root 桌面终端,这里的ubuntu就是用户名

# 1. 完整打包（压缩包留着，随时解压）
tar -czf /root/ubuntu_backup.tgz -C /home ubuntu

# 2. 校验一下
ls -lh /root/ubuntu_backup.tgz

# 3. 确认没问题后再删用户+目录
deluser --remove-home ubuntu
```
> ~至少空间节省了好吧~以后需要某个文件就直接`tar -xzf /root/ubuntu_backup.tgz -C /tmp`拿出来

#### 迁移
直接移过去多简单 吗?
```
deluser OLD_USER
rsync -a /home/OLD_USER/ /root/old_user_backup/
chown -R root:root /root/old_user_backup
```
> 以后 root 桌面里就能直接打开 /root/old_user_backup 继续用

但事实上,刚才的 rsync/tar 只是“快速搬运”,对桌面环境来说太粗暴--很多配置硬编码了旧用户名和绝对路径,直接搬到 /root 后
1. 桌面设置(GNOME dconf)里还写 /home/ubuntu/...
2. 浏览器,VS Code,JetBrains,系列缓存里全是旧路径
3. 快捷方式,最近文件,SSHkey路径,git配置都会失效

那么我们需要迁移的则不是原用户,而是`root`,思路就是
1. 保留 /home/原用户名 不动(路径不变，配置不死)
2. 把目录所有者改成 root
3. 把 root 的 HOME 指向这里(这就是NTR)
4. 删除原用户账户(不删数据)

先记录旧用户名(别问为什么要变量,问就是习惯
```bash
OLD_USER=ubuntu
```

首先把整盘 HOME 改属主(不移动文件)
```bash
chown -R root:root /home/$OLD_USER
```

然后让 root 以后就把这里当家
```bash
usermod -d /home/$OLD_USER -m root
```
> -m 会把 root 原 /root 里需要的东西自动搬过来(.bashrc .profile 等)

可以做个软链接,防止某些脚本硬编码 /root
```bash
ln -s /home/$OLD_USER /root
```

那么现在可以安全删账户了(不删目录)
```bash
deluser $OLD_USER
```
> 重启后 root 自动进桌面,打开文件管理器,看到的应该还是原来那些文件,并且终端里 echo $HOME 应该输出 /home/ubuntu

## 一劳永逸
~究竟是谁把我变的这么懒的~
```bash
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.lockdown disable-lock-screen true
```
合上笔记本再打开,直接桌面,连输密码都省了😋

最后,玩机有风险,操作需谨慎

The end Ciallo~