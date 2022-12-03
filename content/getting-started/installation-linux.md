---
title: "Linux 本地安装"
date: 2020-05-31T15:26:15Z
draft: false
weight: 12
---

在 Linux 操作系统中使用 tar.gz 文件安装和运行 Elasticsearch 和 Kibana 的方法和过程与MacOS的方法相同。唯一不同的是软件包的下载路径不同。

* https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.13.0-linux-x86_64.tar.gz
* https://artifacts.elastic.co/downloads/kibana/kibana-7.13.0-linux-x86_64.tar.gz



## 使用 Linux 桌面版

在解压缩完以上两个 tar.gz 文件后，启动 Elasticsearch 和 Kibana 服务的命令同 [MacOS 系统](/getting-started/local/installation-macos/)。

## 使用 Linux 服务器版

如果你使用的是本地或者远程的 Linux 服务器版操作系统，启动 Elasticsearch 和 Kibana 服务的命令如下：

```sh
./bin/elasticsearch -Ediscovery.type=single-node  -Enetwork.host=0.0.0.0
```

```sh
./bin/kibana  --server.host=0.0.0.0
```

使用上面两个命令启动的 Elasticsearch 和 Kibana 服务器可以从远程的桌面电脑上通过该服务器的 IP 地址进行访问。

在命令访行问 Elasticsearch 服务器：

```sh
➜  ~ curl http://192.168.100.20:9200
{
  "name" : "mbp.local",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "HSQXAjC-RbqPDMdXpGqX1g",
  "version" : {
    "number" : "7.13.0",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "5ca8591c6fcdb1260ce95b08a8e023559635c6f3",
    "build_date" : "2021-05-19T22:22:26.081971330Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.2",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}

```

注：用虚拟机的实际 IP 地址替换 192.168.100.20 ，在浏览器中访问 Kibana 服务的 URL http://192.168.100.20:5601 (替换这里的 IP 地址为实际 IP 地址)

