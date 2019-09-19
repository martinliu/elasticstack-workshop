---
title: "本地安装"
date: 2017-10-17T15:26:15Z
draft: false
weight: 8
---

## 环境需求

笔记本电脑的软硬件需求如下。

硬件配置：

* 8GB内存
* 2核以上CPU
* SSD硬盘
* Wifi/有线网络，可以上Internet

软件配置：

* MacOS、Windows 或者 Linux 操作系统都可以
* SSH终端登录软件，例如 iTerm2、Terminal、 [cmder for Windows 10](https://cmder.net/)
* VirtualBox 6.0 用于运行实验环境的虚拟机
* Centos 7.6 用于安装和运行Elastic产品
* 最小虚拟机资源配置
    * CPU - 1 Core
    * RAM - 4 GB
    * 硬盘 - 80 GB
    * 网络 - NAT
* 操作系统 root 用户的密码



## 准备虚拟机练习环境


在练习的过程中主要使用笔记本电脑的网络端口准备，下面的描述以MacOS为例，Windows操作系统请理解后做相应配置。

### 确定虚拟机的IP地址

如果你安装CentOS 7操作系统时，使用了静态ip地址，请依然用下面的步骤再次确认ip地址正确且可以链接。

登录虚拟机的控制台后，使用的命令 `ip add s` 确认虚拟机的Ip地址。如下图所示：

![](/media/9601568016714_.pic_hd.jpg)


 {{% panel status="success" title="成功" %}}
 记录虚拟机的Ip地址备用。
 {{% /panel %}}

### 设置VirtualBox网络端口转发

确保笔记本电脑和虚拟机的网络端口可连接。增加3条端口转发规则。如下图所示：

![9591568016572_.pic_hd](/media/9591568016572_.pic_hd.jpg)

测试从笔记本电脑的操作系统ssh登录到虚拟操作系统。

 ```bash
 ~ ssh root@127.0.0.1 -p 2233
Last login: Mon Sep  9 19:29:26 2019 from 10.0.2.2
[root@bogon ~]#
 ```


设置虚拟机主机名 `hostnamectl set-hostname node-1 --static`， 在/etc/hosts 文件配置本机 主机名 dns 解析。
```bash
[root@bogon config]# hostnamectl set-hostname node-1 --static
[root@bogon config]# vi /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.0.2.15   node-1
 ```

 {{% panel status="success" title="成功" %}}
 确保 root 用户能正常ssh登录虚拟机操作系统。
 {{% /panel %}}



## 导入elasticsearch和kibana安装包文件

使用scp命令或者同等软件将rpm安装包上传到练习虚拟机中。

```bash
scp -P 2233  elasticsearch-7.3.2-x86_64.rpm root@127.0.0.1:/root/
scp -P 2233  kibana-7.3.2-x86_64.rpm root@127.0.0.1:/root/
```

## 安装 Elasticsearch 

登录虚拟机操作系统执行安装 ` rpm -ivh elasticsearch-7.3.2-x86_64.rpm ` 命令，并启动服务和关闭防火墙服务。

```bash
~ ssh root@127.0.0.1 -p 2233
Last login: Thu Sep 19 18:57:31 2019 from 10.0.2.2
[root@node-1 ~]# ls
anaconda-ks.cfg  elasticsearch-7.3.2-x86_64.rpm
[root@node-1 ~]# rpm -ivh elasticsearch-7.3.2-x86_64.rpm 
warning: elasticsearch-7.3.2-x86_64.rpm: Header V4 RSA/SHA512 Signature, key ID d88e42b4: NOKEY
Preparing...                          ################################# [100%]
Creating elasticsearch group... OK
Creating elasticsearch user... OK
Updating / installing...
   1:elasticsearch-0:7.3.2-1          ################################# [100%]
### NOT starting on installation, please execute the following statements to configure elasticsearch service to start automatically using systemd
 sudo systemctl daemon-reload
 sudo systemctl enable elasticsearch.service
### You can start elasticsearch service by executing
 sudo systemctl start elasticsearch.service
Created elasticsearch keystore in /etc/elasticsearch
[root@node-1 ~]#

[root@node-1 ~]# systemctl stop firewalld
[root@node-1 ~]# systemctl disable firewalld

```

配置 Elasticsearch 服务器参数， `vi /etc/elasticsearch/elasticsearch.yml` 确保配置文件中有如下四行配置。

```yml
cluster.name: my-elk
node.name: node-1
network.host: 0.0.0.0
cluster.initial_master_nodes: node-1
```



用命令  `systemctl start elasticsearch` 启动 Elasticsearch 服务器

在虚拟机的命令行验证服务 `curl http://127.0.0.1:9200` 

```bash
[root@node-1 ~]# systemctl enable elasticsearch
Created symlink from /etc/systemd/system/multi-user.target.wants/elasticsearch.service to /usr/lib/systemd/system/elasticsearch.service.
[root@node-1 ~]# systemctl start elasticsearch
[root@node-1 ~]# systemctl status elasticsearch
● elasticsearch.service - Elasticsearch
   Loaded: loaded (/usr/lib/systemd/system/elasticsearch.service; enabled; vendor preset: disabled)
   Active: active (running) since Thu 2019-09-19 19:55:48 CST; 1h 34min ago
     Docs: http://www.elastic.co
 Main PID: 12869 (java)
   CGroup: /system.slice/elasticsearch.service
           ├─12869 /usr/share/elasticsearch/jdk/bin/java -Xms1g -Xmx1g -XX:+UseConcMarkSweepGC -XX:C...
           └─12948 /usr/share/elasticsearch/modules/x-pack-ml/platform/linux-x86_64/bin/controller

Sep 19 19:55:48 node-1 systemd[1]: Stopped Elasticsearch.
Sep 19 19:55:48 node-1 systemd[1]: Started Elasticsearch.
Sep 19 19:55:49 node-1 elasticsearch[12869]: OpenJDK 64-Bit Server VM warning: Option UseConcMark...se.
Hint: Some lines were ellipsized, use -l to show in full.

[root@node-1 ~]# curl 127.0.0.1:9200
{
  "name" : "node-1",
  "cluster_name" : "my-elk",
  "cluster_uuid" : "IMvIAEvNTBmlYINm_iI5bA",
  "version" : {
    "number" : "7.3.2",
    "build_flavor" : "default",
    "build_type" : "rpm",
    "build_hash" : "1c1faf1",
    "build_date" : "2019-09-06T14:40:30.409026Z",
    "build_snapshot" : false,
    "lucene_version" : "8.1.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```




在笔记本电脑的浏览器里输入网址 `http://127.0.0.1:9200` 验证 Elasticsearch 服务是否可以访问。

![](/media/15689001330273.jpg)

 {{% panel status="success" title="成功" %}}
 1. 在虚拟机操作系统的命令行里 curl 127.0.0.1:9200 正常返回
 2. 在笔记本电脑的浏览器里 http://127.0.0.1:9200 能看到与上面相同的信息
 {{% /panel %}}


## 安装 Kibana



执行Kibana 服务器安装命令 `rpm -ivh kibana-7.3.2-x86_64.rpm`

```bash
[root@node-1 ~]# rpm -ivh kibana-7.3.2-x86_64.rpm
warning: kibana-7.3.2-x86_64.rpm: Header V4 RSA/SHA512 Signature, key ID d88e42b4: NOKEY
Preparing...                          ################################# [100%]
Updating / installing...
   1:kibana-7.3.2-1                   ################################# [100%]
[root@node-1 ~]#

```

确保 Kibana 配置文件  `vi /etc/kibana/kibana.yml`  中有下面几行参数：

```yml
server.host: "10.0.2.15"
server.name: "node-1"
elasticsearch.hosts: ["http://localhost:9200"]
i18n.locale: "zh-CN"
```

在本机的浏览器访问 Kibana 服务器。选择使用 `我们的样例数据 `。
![9571568015382_.pic_hd](/media/9571568015382_.pic_hd.jpg)

添加三组样例数据。

![9581568015418_.pic_hd](/media/9581568015418_.pic_hd.jpg)

点击左侧导航栏的仪表板按钮，看到如下仪表板清单。

![](/media/15689013007062.jpg)


 {{% panel status="success" title="成功" %}}
 笔记本电脑的浏览器可以正常访问 Kibana 服务器。
 {{% /panel %}}

 {{% panel status="danger" title="危险" %}}
 * Elasticsearch 服务器没有开启默认的用户名和密码的安全认证模式，在生产环境中是完全不可取的。
 * 以上的网络配置和各种服务器配置也是精简版本的，仅限于课堂学习，生产环境的服务器配置需要按照实际情况设计。
 {{% /panel %}}


