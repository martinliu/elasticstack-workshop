---
title: "环境确认"
date: 2017-10-17T15:26:15Z
draft: false
weight: 12
---

在浏览器中访问 Kibana 控制台页面，在 Kibana 的开发者工具中输入如下查询命令，点击每一条命令之后的三角形执行按钮，查看并思考查询结果的含义。

```python

GET _search

GET /

GET /_cluster/stats

GET /_cat/nodes?v

GET /_cat/indices?v

GET /_cat/shards
```

删除掉黄色方块区域里的旧代码，复制以上代码，进行测试，输入光标移动到每一行之后，点击右边的三角形按钮。

![](/media/15689026783274.jpg)

 {{% panel status="success" title="成功" %}}
Kibana 开发者工具能正常查询和使用，和周边的同学讨论每一行查询结果的含义。
 {{% /panel %}}


