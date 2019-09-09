---
title: "本地安装"
date: 2017-10-17T15:26:15Z
draft: false
weight: 8
---

## 环境需求

笔记本电脑的软硬件需求如下。

建议的硬件配置：

* 4~8GB内存
* 2核以上CPU
* SSD硬盘
* Wifi无线上网

软件配置需求：

* VirtualBox 用于运行实验环境的虚拟机
* Centos 7 用于安装和运行elastic产品
* 虚拟机最小配置，1vCPU+4GB内存+80GB硬盘+NAT网络





## 准备虚拟机环境


网络端口准备，下面的描述以MacOS为例，Windows操作系统请理解后做相应配置。

### 1 确定IP地址

登录虚拟机的控制台确认虚拟机的Ip地址，使用的命令 `ip add s`。



```
[root@localhost ~]# ip add s
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:4c:fc:fd brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global noprefixroute dynamic enp0s3
       valid_lft 82892sec preferred_lft 82892sec
    inet6 fe80::eb9e:f469:c79a:b9b0/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
[root@localhost ~]#

```

### 2 设置VirtualBox网络端口转发

增加3条端口转发规则。如下图所示：


![9591568016572_.pic_hd](/media/9591568016572_.pic_hd.jpg)



操作系统准备





## Configure



```
scp -P 2233 elasticsearch-7.3.1-linux-x86_64.tar.gz  root@127.0.0.1:/root/es.tar.gz
tar  -zxvf  es.tar.gz -C /usr/local/

```

/root/elasticsearch-7.3.1/jdk


export JAVA_HOME=/var/elasticsearch-7.3.1/jdk
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH


adduser esuser
passwd esuser


chown -R esuaer /usr/local/elasticsearch-7.3.1

You may specify options in config.toml (or config.yaml/config.json) of your site to make use of this theme's features.

For an example of `config.toml`, see [config.toml](https://github.com/thingsym/hugo-theme-techdoc/blob/master/exampleSite/config.toml) in exampleSite.

See [the Configuration documentation](../configuration/).

## Preview site



network.host: [_local_, 172.30.6.1]



vim /etc/sysctl.conf

vm.max_map_count=655360


sysctl -p


vim /etc/security/limits.conf

* soft nofile 65536
* hard nofile 131072
* soft nproc 2048
* hard nproc 4096 


## 安装Kibana



scp -P 2233 kibana-7.3.1-linux-x86_64.tar.gz   root@127.0.0.1:/root/

