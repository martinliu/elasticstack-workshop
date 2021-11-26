---
title: "MacOS 本地安装"
date: 2020-05-31T15:26:15Z
draft: false
weight: 10
---

对于 MacOS 和 Linux 操作系统而言，使用  `.tar.gz` 格式的安装包是最简单的，适合于测试/开发环境的搭建。

## 下载 Elasticsearch 软件包

在目标测试目录中，使用 wget 在命令行里下载 ，或者使用图形化下载工具。

```shell
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.13.0-darwin-x86_64.tar.gz
tar -xzf elasticsearch-7.13.0-darwin-x86_64.tar.gz
cd elasticsearch-7.13.0/
```

查看 Elasticsearch 的目录结构。

## 下载 Kibana 软件包

返回上级目录。下载 Kibana 软件。

```sh
wget https://artifacts.elastic.co/downloads/kibana/kibana-7.13.0-linux-x86_64.tar.gz
tar -xzf kibana-7.13.0-linux-x86_64.tar.gz
cd kibana-7.13.0-linux-x86_64/ 
```

查看 Kibana 的目录结构。

## 启动 Elasticsearch 服务器

进入 `elasticsearch-7.13.0` 目录中，执行下面的命令。

```sh
 ./bin/elasticsearch
```

以上命令的输出如下：

```sh
[2021-05-31T21:54:47,942][INFO ][o.e.n.Node               ] [mbp.local] version[7.13.0], pid[68215], build[default/tar/5ca8591c6fcdb1260ce95b08a8e023559635c6f3/2021-05-19T22:22:26.081971330Z], OS[Mac OS X/10.15.7/x86_64], JVM[AdoptOpenJDK/OpenJDK 64-Bit Server VM/16/16+36]
[2021-05-31T21:54:47,945][INFO ][o.e.n.Node               ] [mbp.local] JVM home [/Users/martin/Downloads/elk/workshop/elasticsearch-7.13.0/jdk.app/Contents/Home], using bundled JDK [true]
[2021-05-31T21:54:47,945][INFO ][o.e.n.Node               ] [mbp.local] JVM arguments [-Xshare:auto, -Des.networkaddress.cache.ttl=60, -Des.networkaddress.cache.negative.ttl=10, -XX:+AlwaysPreTouch, -Xss1m, -Djava.awt.headless=true, -Dfile.encoding=UTF-8, -Djna.nosys=true, -XX:-OmitStackTraceInFastThrow, -XX:+ShowCodeDetailsInExceptionMessages, -Dio.netty.noUnsafe=true, -Dio.netty.noKeySetOptimization=true, -Dio.netty.recycler.maxCapacityPerThread=0, -Dio.netty.allocator.numDirectArenas=0, -Dlog4j.shutdownHookEnabled=false, -Dlog4j2.disable.jmx=true, -Djava.locale.providers=SPI,COMPAT, --add-opens=java.base/java.io=ALL-UNNAMED, -XX:+UseG1GC, -Djava.io.tmpdir=/var/folders/t5/mrnyyq9n10v5k_g0hbv1lxfc0000gn/T/elasticsearch-5756711792284881036, -XX:+HeapDumpOnOutOfMemoryError, -XX:HeapDumpPath=data, -XX:ErrorFile=logs/hs_err_pid%p.log, -Xlog:gc*,gc+age=trace,safepoint:file=logs/gc.log:utctime,pid,tags:filecount=32,filesize=64m, -Xms16384m, -Xmx16384m, -XX:MaxDirectMemorySize=8589934592, -XX:InitiatingHeapOccupancyPercent=30, -XX:G1ReservePercent=25, -Des.path.home=/Users/martin/Downloads/elk/workshop/elasticsearch-7.13.0, -Des.path.conf=/Users/martin/Downloads/elk/workshop/elasticsearch-7.13.0/config, -Des.distribution.flavor=default, -Des.distribution.type=tar, -Des.bundled_jdk=true]
[2021-05-31T21:54:50,661][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [aggs-matrix-stats]
[2021-05-31T21:54:50,661][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [analysis-common]
[2021-05-31T21:54:50,662][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [constant-keyword]
[2021-05-31T21:54:50,662][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [frozen-indices]
[2021-05-31T21:54:50,662][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [ingest-common]
[2021-05-31T21:54:50,662][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [ingest-geoip]
[2021-05-31T21:54:50,662][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [ingest-user-agent]
[2021-05-31T21:54:50,663][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [kibana]
[2021-05-31T21:54:50,663][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [lang-expression]
[2021-05-31T21:54:50,663][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [lang-mustache]
[2021-05-31T21:54:50,663][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [lang-painless]
[2021-05-31T21:54:50,663][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [mapper-extras]
[2021-05-31T21:54:50,664][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [mapper-version]
[2021-05-31T21:54:50,664][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [parent-join]
[2021-05-31T21:54:50,664][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [percolator]
[2021-05-31T21:54:50,665][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [rank-eval]
[2021-05-31T21:54:50,665][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [reindex]
[2021-05-31T21:54:50,665][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [repositories-metering-api]
[2021-05-31T21:54:50,665][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [repository-encrypted]
[2021-05-31T21:54:50,666][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [repository-url]
[2021-05-31T21:54:50,666][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [runtime-fields-common]
[2021-05-31T21:54:50,666][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [search-business-rules]
[2021-05-31T21:54:50,666][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [searchable-snapshots]
[2021-05-31T21:54:50,667][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [snapshot-repo-test-kit]
[2021-05-31T21:54:50,667][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [spatial]
[2021-05-31T21:54:50,667][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [transform]
[2021-05-31T21:54:50,667][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [transport-netty4]
[2021-05-31T21:54:50,667][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [unsigned-long]
[2021-05-31T21:54:50,667][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [vectors]
[2021-05-31T21:54:50,668][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [wildcard]
[2021-05-31T21:54:50,668][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-aggregate-metric]
[2021-05-31T21:54:50,668][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-analytics]
[2021-05-31T21:54:50,668][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-async]
[2021-05-31T21:54:50,668][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-async-search]
[2021-05-31T21:54:50,668][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-autoscaling]
[2021-05-31T21:54:50,669][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-ccr]
[2021-05-31T21:54:50,669][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-core]
[2021-05-31T21:54:50,669][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-data-streams]
[2021-05-31T21:54:50,669][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-deprecation]
[2021-05-31T21:54:50,669][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-enrich]
[2021-05-31T21:54:50,670][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-eql]
[2021-05-31T21:54:50,670][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-fleet]
[2021-05-31T21:54:50,670][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-graph]
[2021-05-31T21:54:50,670][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-identity-provider]
[2021-05-31T21:54:50,670][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-ilm]
[2021-05-31T21:54:50,670][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-logstash]
[2021-05-31T21:54:50,671][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-ml]
[2021-05-31T21:54:50,671][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-monitoring]
[2021-05-31T21:54:50,671][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-ql]
[2021-05-31T21:54:50,671][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-rollup]
[2021-05-31T21:54:50,671][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-security]
[2021-05-31T21:54:50,671][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-shutdown]
[2021-05-31T21:54:50,672][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-sql]
[2021-05-31T21:54:50,672][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-stack]
[2021-05-31T21:54:50,672][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-text-structure]
[2021-05-31T21:54:50,672][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-voting-only-node]
[2021-05-31T21:54:50,672][INFO ][o.e.p.PluginsService     ] [mbp.local] loaded module [x-pack-watcher]
[2021-05-31T21:54:50,673][INFO ][o.e.p.PluginsService     ] [mbp.local] no plugins loaded
[2021-05-31T21:54:50,704][INFO ][o.e.e.NodeEnvironment    ] [mbp.local] using [1] data paths, mounts [[/System/Volumes/Data (/dev/disk1s1)]], net usable_space [169.7gb], net total_space [465.6gb], types [apfs]
[2021-05-31T21:54:50,704][INFO ][o.e.e.NodeEnvironment    ] [mbp.local] heap size [16gb], compressed ordinary object pointers [true]
[2021-05-31T21:54:50,728][INFO ][o.e.n.Node               ] [mbp.local] node name [mbp.local], node ID [6P87C-WDSg-AaKnOERVVpw], cluster name [elasticsearch], roles [transform, data_frozen, master, remote_cluster_client, data, ml, data_content, data_hot, data_warm, data_cold, ingest]
[2021-05-31T21:54:54,459][INFO ][o.e.x.m.p.l.CppLogMessageHandler] [mbp.local] [controller/68253] [Main.cc@117] controller (64 bit): Version 7.13.0 (Build a62594307178cf) Copyright (c) 2021 Elasticsearch BV
[2021-05-31T21:54:54,873][INFO ][o.e.x.s.a.s.FileRolesStore] [mbp.local] parsed [0] roles from file [/Users/martin/Downloads/elk/workshop/elasticsearch-7.13.0/config/roles.yml]
[2021-05-31T21:54:55,494][INFO ][o.e.i.g.LocalDatabases   ] [mbp.local] initialized default databases [[GeoLite2-Country.mmdb, GeoLite2-City.mmdb, GeoLite2-ASN.mmdb]], config databases [[]] and watching [/Users/martin/Downloads/elk/workshop/elasticsearch-7.13.0/config/ingest-geoip] for changes
[2021-05-31T21:54:55,495][INFO ][o.e.i.g.DatabaseRegistry ] [mbp.local] initialized database registry, using geoip-databases directory [/var/folders/t5/mrnyyq9n10v5k_g0hbv1lxfc0000gn/T/elasticsearch-5756711792284881036/geoip-databases/6P87C-WDSg-AaKnOERVVpw]
[2021-05-31T21:54:56,115][INFO ][o.e.t.NettyAllocator     ] [mbp.local] creating NettyAllocator with the following configs: [name=elasticsearch_configured, chunk_size=1mb, suggested_max_allocation_size=1mb, factors={es.unsafe.use_netty_default_chunk_and_page_size=false, g1gc_enabled=true, g1gc_region_size=8mb}]
[2021-05-31T21:54:56,179][INFO ][o.e.d.DiscoveryModule    ] [mbp.local] using discovery type [zen] and seed hosts providers [settings]
[2021-05-31T21:54:56,585][INFO ][o.e.g.DanglingIndicesState] [mbp.local] gateway.auto_import_dangling_indices is disabled, dangling indices will not be automatically detected or imported and must be managed manually
[2021-05-31T21:54:56,994][INFO ][o.e.n.Node               ] [mbp.local] initialized
[2021-05-31T21:54:56,995][INFO ][o.e.n.Node               ] [mbp.local] starting ...
[2021-05-31T21:54:57,083][INFO ][o.e.x.s.c.f.PersistentCache] [mbp.local] persistent cache index loaded
[2021-05-31T21:54:57,229][INFO ][o.e.t.TransportService   ] [mbp.local] publish_address {127.0.0.1:9300}, bound_addresses {[::1]:9300}, {127.0.0.1:9300}
[2021-05-31T21:54:57,511][WARN ][o.e.b.BootstrapChecks    ] [mbp.local] the default discovery settings are unsuitable for production use; at least one of [discovery.seed_hosts, discovery.seed_providers, cluster.initial_master_nodes] must be configured
[2021-05-31T21:54:57,519][INFO ][o.e.c.c.ClusterBootstrapService] [mbp.local] no discovery configuration found, will perform best-effort cluster bootstrapping after [3s] unless existing master is discovered
[2021-05-31T21:55:00,522][INFO ][o.e.c.c.Coordinator      ] [mbp.local] setting initial configuration to VotingConfiguration{6P87C-WDSg-AaKnOERVVpw}
[2021-05-31T21:55:01,544][INFO ][o.e.c.s.MasterService    ] [mbp.local] elected-as-master ([1] nodes joined)[{mbp.local}{6P87C-WDSg-AaKnOERVVpw}{WmbHdAXdTD6wYaDf321K_Q}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw} elect leader, _BECOME_MASTER_TASK_, _FINISH_ELECTION_], term: 1, version: 1, delta: master node changed {previous [], current [{mbp.local}{6P87C-WDSg-AaKnOERVVpw}{WmbHdAXdTD6wYaDf321K_Q}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}]}
[2021-05-31T21:55:01,645][INFO ][o.e.c.c.CoordinationState] [mbp.local] cluster UUID set to [HSQXAjC-RbqPDMdXpGqX1g]
[2021-05-31T21:55:01,748][INFO ][o.e.c.s.ClusterApplierService] [mbp.local] master node changed {previous [], current [{mbp.local}{6P87C-WDSg-AaKnOERVVpw}{WmbHdAXdTD6wYaDf321K_Q}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}]}, term: 1, version: 1, reason: Publication{term=1, version=1}
[2021-05-31T21:55:01,805][INFO ][o.e.h.AbstractHttpServerTransport] [mbp.local] publish_address {127.0.0.1:9200}, bound_addresses {[::1]:9200}, {127.0.0.1:9200}
[2021-05-31T21:55:01,805][INFO ][o.e.n.Node               ] [mbp.local] started
[2021-05-31T21:55:01,872][INFO ][o.e.x.c.t.IndexTemplateRegistry] [mbp.local] adding legacy template [.ml-anomalies-] for [ml], because it doesn't exist
[2021-05-31T21:55:01,873][INFO ][o.e.x.c.t.IndexTemplateRegistry] [mbp.local] adding legacy template [.ml-state] for [ml], because it doesn't exist
[2021-05-31T21:55:01,873][INFO ][o.e.x.c.t.IndexTemplateRegistry] [mbp.local] adding legacy template [.ml-notifications-000001] for [ml], because it doesn't exist
[2021-05-31T21:55:01,873][INFO ][o.e.x.c.t.IndexTemplateRegistry] [mbp.local] adding legacy template [.ml-stats] for [ml], because it doesn't exist
[2021-05-31T21:55:01,934][INFO ][o.e.g.GatewayService     ] [mbp.local] recovered [0] indices into cluster_state
[2021-05-31T21:55:02,082][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.ml-notifications-000001] for index patterns [.ml-notifications-000001]
[2021-05-31T21:55:02,194][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.ml-stats] for index patterns [.ml-stats-*]
[2021-05-31T21:55:02,292][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.ml-state] for index patterns [.ml-state*]
[2021-05-31T21:55:02,403][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.ml-anomalies-] for index patterns [.ml-anomalies-*]
[2021-05-31T21:55:02,499][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding component template [logs-settings]
[2021-05-31T21:55:02,606][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding component template [synthetics-mappings]
[2021-05-31T21:55:02,699][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding component template [metrics-settings]
[2021-05-31T21:55:02,795][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding component template [metrics-mappings]
[2021-05-31T21:55:02,889][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding component template [synthetics-settings]
[2021-05-31T21:55:03,001][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding component template [logs-mappings]
[2021-05-31T21:55:03,199][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding index template [.watch-history-13] for index patterns [.watcher-history-13*]
[2021-05-31T21:55:03,327][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding index template [ilm-history] for index patterns [ilm-history-5*]
[2021-05-31T21:55:03,426][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding index template [.slm-history] for index patterns [.slm-history-5*]
[2021-05-31T21:55:03,585][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.monitoring-alerts-7] for index patterns [.monitoring-alerts-7]
[2021-05-31T21:55:03,689][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.monitoring-es] for index patterns [.monitoring-es-7-*]
[2021-05-31T21:55:03,777][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.monitoring-kibana] for index patterns [.monitoring-kibana-7-*]
[2021-05-31T21:55:03,894][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.monitoring-logstash] for index patterns [.monitoring-logstash-7-*]
[2021-05-31T21:55:03,988][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding template [.monitoring-beats] for index patterns [.monitoring-beats-7-*]
[2021-05-31T21:55:04,088][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding index template [metrics] for index patterns [metrics-*-*]
[2021-05-31T21:55:04,307][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding index template [synthetics] for index patterns [synthetics-*-*]
[2021-05-31T21:55:04,545][INFO ][o.e.c.m.MetadataIndexTemplateService] [mbp.local] adding index template [logs] for index patterns [logs-*-*]
[2021-05-31T21:55:04,794][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [ml-size-based-ilm-policy]
[2021-05-31T21:55:04,945][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [logs]
[2021-05-31T21:55:05,100][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [metrics]
[2021-05-31T21:55:05,285][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [synthetics]
[2021-05-31T21:55:05,509][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [watch-history-ilm-policy]
[2021-05-31T21:55:05,792][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [ilm-history-ilm-policy]
[2021-05-31T21:55:06,314][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [slm-history-ilm-policy]
[2021-05-31T21:55:06,435][INFO ][o.e.x.i.a.TransportPutLifecycleAction] [mbp.local] adding index lifecycle policy [.fleet-actions-results-ilm-policy]
[2021-05-31T21:55:06,690][INFO ][o.e.l.LicenseService     ] [mbp.local] license [8959c6a8-faee-4010-ac6c-1478729ae20c] mode [basic] - valid
[2021-05-31T21:55:06,691][INFO ][o.e.x.s.s.SecurityStatusChangeListener] [mbp.local] Active license is now [BASIC]; Security is disabled
[2021-05-31T21:55:06,692][WARN ][o.e.x.s.s.SecurityStatusChangeListener] [mbp.local] Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.13/security-minimal-setup.html to enable security.
```

不要退出和关闭以上命令行。保持 Elasticsearch 服务器的正常运行。

打开一个新的命令窗口，用 curl 命令验证， Elasticsearch 服务的状态。

```sh
➜  ~ curl http://localhost:9200
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



## 启动 Kibana 服务器

打开一个新的命令窗口，进入 Kibana 的目录中，运行下面的命令。

```sh
 ./bin/kibana
```

在以上命令输出结果停止的时候，不要退出，保持 Kibana 服务器持续运行。

在浏览器中，输入网址：http://localhost:5601 ，将看到如下的界面。

![](https://elasticstack-1300734579.cos.ap-nanjing.myqcloud.com/2021-05-31-2021-05-31_22-14-01.png)

------

注释：

* 参考 Elasticsearch 7.13  [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/targz.html)
* 参考 Kibana 7.13 [官方文档](https://www.elastic.co/guide/en/kibana/7.13/targz.html)
