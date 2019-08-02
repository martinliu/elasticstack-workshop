# Elastic Stack Wroshop

本工作坊包含了一系列实战练习（Lab），目标是让工程师们能快速上手Elastic Stack的各种常用业务场景，为步入其它高级应用场景打下坚实的基础。Elastic Stack的核心是Elasticsearch，本Workshop将包含其它相关组件，包括Filebeat、Metricbeat、Logstash和Kibana。

## 目录

* 获得和准备实验环境
  * 学员本地电脑环境需求
  * Workshop简介
  * Elastic Stack是什么？有什么特性？核心组件和系统结构简介
  * Workshop环境的准备
    * 在本机/云主机安装Elasticsearch和Kibana
    * 开启Elastic Cloud测试环境
    * 开启阿里云Elasticsearch服务测试环境
* Lab 1 - Elasticsearch基础操作
  * 本实验简介
  * 使用Kibana的开发者工具查看集群结构和状态
  * 索引和数据的基础操作，文档数据的CUDR（创建、查询、更新和删除）操作
  * 控制数据分片和副本
  * 在群集中增加节点
* Lab 2 - Logstash基础实战
  * 下载、配置、运行和测试Logstash
  * 测试第一条流水线
  * Logstash的插件管理，浏览、安装和升级插件
  * 使用File input插件导入csv格式文件
  * 使用JDBC input插件从MySQL数据库中同步数据
  * 使用Elasticsearch output插件将数据索引至ES集群
  * 使用csv outpu插件将Elasticsearch集群中的数据导出
* Lab 3 - Elasticsearch大数据分析实战
  * Bucket 聚合测试
  * Metric 聚合测试
  * Matrix 聚合测试
  * Wifi使用率数据分析实战
    * 使用Logstash导入样例数据
    * 确认数据导入结果
    * Metric 聚合实战：所有Wifi的下载总量、平均值、最大和最小值
    * Bucket 文本聚合实战：按用量排名应用类型、Top15应用、
    * Bucket 数值聚合实战：查询1000为单位的使用率直方图、查询三个数值区间的使用率直方图
    * Bucket 数值聚合实战：按时间段分析用户使用模式
    * Bucket 数值聚合实战：按地理位置坐标查询5公里内的Wifi、按geohash对数据分片查询
* Lab 4 - 用Logstash构建数据流水线
  * 使用CSV Filter解析csv文件
  * 使用Mutate Filter处理字段，转换、重命名、去除空格、替换和转大写等操作
  * 使用Grok Filter解析非结构化数据为结构化数据
  * 使用Geoip Filter解释Ip地址相关的详细地理信息
* Lab 5 - Beat数据采集实战
  * 使用Metricbeat采集操作系统的指标
  * 使用Packetbeat采集网卡流量数据
  * 使用Heartbeat实现服务健康检查
  * 使用Winlogbeat采集Windows操作系统指标和实践
  * 使用Auditbeat采集用户和进程活动
  * 使用Filebeat采集操作系统日志
* Lab 6 - Kibana数据可视化和分析实战
  * 使用Logstash导入测试用Apache日志数据文件
  * 在Kibana中配置必要的Index Pattern
  * 导入Kibana默认演示数据，浏览和思考那些演示用可视化仪表板
  * 使用Discover页面执行常用的数据查询，查询所导入的Apache日志
  * 使用Elasticsearch执行简单和复杂查询，自由文本、字段、逻辑组合、范围查询、分组、通配符查询、正则表达式查询
  * 使用Elasticsearch DSL执行查询
  * 使用Kiban的工具栏新建、保持和管理临时查询
  * 使用过滤器精细化查询，创建、使用、修改、删除过滤器
  * 使用可视化工具将数据查询图形展示，浏览所有可视化类型
  * 可视化实战：分析Web服务器响应代码、查询访问Top10的URL、查询带宽使用率Top5的国家、查询客户端类型排名、分析西web服务器的流量
  * 创建关于Apache的实时监控仪表板，克隆和管理仪表板
  * 使用Timeline实现时间序列分析：在指定时间段里美国和中国的平均下载字节数
  * 管理Kibana的插件，安装、删除插件
* Lab 7 - 构建基于传感器的IoT数据分析应用 
  * 创建应用所需的文档数据结构
  * 初始化MySQL数据库的表结构和初始数据
  * 构建Logstash数据处理流水线：接受Web上的JSON请求（HTTP input plugin）、丰富JSON的元数据（SQL plugin）、存储结果文档到Elasticsearch
  * 在Kibana中创建应用的可视化界面：配置Index pattern、构建可视化组件、创建可视化仪表板展示大屏幕