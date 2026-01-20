---
@file: 151-YYC3-AICP-运维阶段-运维手册.md
@description: YYC3-AICP 系统日常运维的完整指南，包含监控、告警、故障处理、维护
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [运维阶段],[运维手册],[日常维护]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 151-YYC3-AICP-运维阶段-运维手册

## 概述

本文档详细描述YYC3-YYC3-AICP-运维阶段-运维手册相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范运维手册相关的业务标准与技术落地要求
- 为项目相关人员提供清晰的参考依据
- 保障相关模块开发、实施、运维的一致性与规范性

### 2. 设计原则

#### 2.1 五高原则
- **高可用性**：确保系统7x24小时稳定运行
- **高性能**：优化响应时间和处理能力
- **高安全性**：保护用户数据和隐私安全
- **高扩展性**：支持业务快速扩展
- **高可维护性**：便于后续维护和升级

#### 2.2 五标体系
- **标准化**：统一的技术和流程标准
- **规范化**：严格的开发和管理规范
- **自动化**：提高开发效率和质量
- **智能化**：利用AI技术提升能力
- **可视化**：直观的监控和管理界面

#### 2.3 五化架构
- **流程化**：标准化的开发流程
- **文档化**：完善的文档体系
- **工具化**：高效的开发工具链
- **数字化**：数据驱动的决策
- **生态化**：开放的生态系统

### 3. 运维手册

#### 3.1 系统监控

##### 3.1.1 监控架构

YYC³-AICP 采用基于 Prometheus + Grafana 的监控架构，提供全方位的系统监控能力。

**监控组件**
- **Prometheus**: 指标采集和存储
- **Grafana**: 可视化展示
- **Alertmanager**: 告警管理
- **Node Exporter**: 系统指标采集
- **cAdvisor**: 容器指标采集

##### 3.1.2 监控指标

**应用层指标**
- HTTP 请求量、响应时间、错误率
- 数据库连接数、查询时间
- 缓存命中率、内存使用率
- 消息队列积压量、消费延迟

**系统层指标**
- CPU 使用率、内存使用率、磁盘 I/O
- 网络流量、连接数
- 磁盘空间使用率

**业务层指标**
- 订单量、交易额
- 用户活跃度、注册量
- 支付成功率、退款率

##### 3.1.3 监控配置

**Prometheus 配置**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - source_labels: [__address__]
        regex: '(.*):10250'
        replacement: '${1}:9100'
        target_label: __address__

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

**告警规则**

```yaml
groups:
- name: api_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(yyc3_catering_http_requests_total{status_code=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "API错误率过高"
      description: "API在过去5分钟内错误率超过5%"

  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(yyc3_catering_http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API响应延迟过高"
      description: "API P95响应时间超过1秒"

- name: system_alerts
  rules:
  - alert: HighCPUUsage
    expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "CPU使用率过高"
      description: "CPU使用率超过80%"

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "内存使用率过高"
      description: "内存使用率超过85%"
```

##### 3.1.4 Grafana 仪表板

**全局概览仪表板**
- 显示平台整体运行状态
- 包含核心业务指标、系统资源使用情况、应用性能指标

**应用性能仪表板**
- 按微服务显示应用性能指标
- 包含响应时间、错误率、吞吐量等

**系统资源仪表板**
- 显示服务器和容器的系统资源使用情况
- 包含 CPU、内存、磁盘、网络等指标

**数据库仪表板**
- 显示数据库的运行状态和性能指标
- 包含连接数、查询延迟、表空间等指标

**业务指标仪表板**
- 显示核心业务指标
- 包含订单量、交易额、用户活跃度等指标

#### 3.2 日志管理

##### 3.2.1 日志架构

YYC³-AICP 采用 ELK Stack (Elasticsearch + Logstash + Kibana) + Fluentd 架构，提供完整的日志收集、存储、分析和可视化能力。

**日志组件**
- **Fluentd**: 日志收集
- **Elasticsearch**: 日志存储和检索
- **Kibana**: 日志可视化
- **Logstash**: 日志处理（可选）

##### 3.2.2 日志分类

**应用日志**
- 访问日志
- 错误日志
- 慢查询日志
- 业务日志
- 审计日志

**系统日志**
- 系统日志
- 内核日志
- 服务日志
- 安全日志
- 审计日志

**中间件日志**
- 数据库日志
- 缓存日志
- 消息队列日志
- 搜索引擎日志
- 负载均衡日志

**审计日志**
- 用户操作日志
- 管理员操作日志
- 数据变更日志
- 权限变更日志
- 安全事件日志

##### 3.2.3 日志收集配置

**Fluentd 配置**

```yaml
# fluentd.conf
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/fluentd-containers.log.pos
  tag kubernetes.*
  read_from_head true
  <parse>
    @type json
  </parse>
</source>

<filter kubernetes.**>
  @type kubernetes_metadata
</filter>

<match **>
  @type elasticsearch
  host elasticsearch.logging
  port 9200
  logstash_format true
  logstash_prefix fluentd
  logstash_dateformat %Y.%m.%d
  include_tag_key true
  type_name fluentd
  flush_interval 1s
</match>
```

**Elasticsearch 索引配置**

```json
{
  "index_patterns": ["yyc3-*-logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "yyc3-logs-policy",
      "index.lifecycle.rollover_alias": "yyc3-logs",
      "index.refresh_interval": "5s"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text", "analyzer": "standard" },
        "service": { "type": "keyword" },
        "hostname": { "type": "keyword" },
        "environment": { "type": "keyword" },
        "request_id": { "type": "keyword" },
        "user_id": { "type": "keyword" },
        "duration": { "type": "long" },
        "status": { "type": "integer" },
        "method": { "type": "keyword" },
        "path": { "type": "keyword" },
        "error": { "type": "text", "analyzer": "standard" }
      }
    }
  }
}
```

##### 3.2.4 日志查询

**Kibana 查询示例**

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-1h"
            }
          }
        },
        {
          "term": {
            "level": "ERROR"
          }
        }
      ]
    }
  }
}
```

**常用查询命令**

```bash
# 查看错误日志
docker-compose logs gateway | grep ERROR

# 查看警告日志
docker-compose logs gateway | grep WARN

# 查看慢查询日志
docker exec -it postgres psql -U postgres -d yyc3 << EOF
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF

# 查看API响应时间
docker-compose logs gateway | grep "duration" | awk '{print $NF}'

# 查看错误率
TOTAL_REQUESTS=$(docker-compose logs gateway | grep "GET\|POST" | wc -l)
ERROR_REQUESTS=$(docker-compose logs gateway | grep "status\":5[0-9][0-9] | wc -l)
ERROR_RATE=$(echo "scale=2; $ERROR_REQUESTS * 100 / $TOTAL_REQUESTS" | bc)
echo "错误率: ${ERROR_RATE}%"
```

#### 3.3 故障处理

##### 3.3.1 故障分级

**P0 - 严重故障**
- 系统完全不可用
- 数据丢失或严重损坏
- 影响所有用户
- 响应时间: 15分钟

**P1 - 重大故障**
- 核心功能不可用
- 影响大部分用户
- 性能严重下降
- 响应时间: 30分钟

**P2 - 一般故障**
- 非核心功能不可用
- 影响部分用户
- 性能轻微下降
- 响应时间: 2小时

**P3 - 轻微故障**
- 功能异常但不影响使用
- 影响少量用户
- 响应时间: 4小时

##### 3.3.2 故障处理流程

**1. 故障发现**
- 监控告警触发
- 用户反馈
- 主动巡检发现

**2. 故障响应**
- 立即响应告警
- 评估故障级别
- 通知相关人员

**3. 故障排查**
- 收集日志和监控数据
- 定位故障根因
- 制定解决方案

**4. 故障修复**
- 执行修复方案
- 验证修复效果
- 恢复服务

**5. 故障复盘**
- 分析故障原因
- 总结经验教训
- 制定改进措施

##### 3.3.3 常见故障处理

**服务不可用**

```bash
# 检查服务状态
kubectl get pods -n yyc3-production

# 查看服务日志
kubectl logs -f <pod-name> -n yyc3-production

# 重启服务
kubectl rollout restart deployment/<service-name> -n yyc3-production

# 查看事件
kubectl get events -n yyc3-production --sort-by='.lastTimestamp'
```

**数据库连接失败**

```bash
# 检查数据库状态
kubectl exec -it postgres-0 -n yyc3-production -- pg_isready

# 查看数据库日志
kubectl logs postgres-0 -n yyc3-production

# 检查连接数
kubectl exec -it postgres-0 -n yyc3-production -- psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 重启数据库
kubectl delete pod postgres-0 -n yyc3-production
```

**缓存失效**

```bash
# 检查 Redis 状态
kubectl exec -it redis-0 -n yyc3-production -- redis-cli ping

# 查看缓存命中率
kubectl exec -it redis-0 -n yyc3-production -- redis-cli info stats | grep keyspace

# 清空缓存
kubectl exec -it redis-0 -n yyc3-production -- redis-cli FLUSHALL

# 重启 Redis
kubectl delete pod redis-0 -n yyc3-production
```

#### 3.4 数据备份与恢复

##### 3.4.1 备份策略

**数据库备份**

```bash
# 全量备份
kubectl exec postgres-0 -n yyc3-production -- pg_dump -U postgres yyc3 > backup_$(date +%Y%m%d).sql

# 增量备份
kubectl exec postgres-0 -n yyc3-production -- pg_dump -U postgres --format=custom --file=/backup/incremental_$(date +%Y%m%d_%H%M%S).dump yyc3

# 定时备份（CronJob）
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: yyc3-production
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres -U postgres yyc3 > /backup/backup_$(date +%Y%m%d).sql
            volumeMounts:
            - name: backup
              mountPath: /backup
          volumes:
          - name: backup
            persistentVolumeClaim:
              claimName: postgres-backup-pvc
          restartPolicy: OnFailure
```

**文件备份**

```bash
# 备份配置文件
kubectl get configmaps -n yyc3-production -o yaml > configmaps_backup_$(date +%Y%m%d).yaml

# 备份密钥
kubectl get secrets -n yyc3-production -o yaml > secrets_backup_$(date +%Y%m%d).yaml

# 备份部署配置
kubectl get deployments -n yyc3-production -o yaml > deployments_backup_$(date +%Y%m%d).yaml
```

##### 3.4.2 恢复流程

**数据库恢复**

```bash
# 从备份恢复
kubectl exec -i postgres-0 -n yyc3-production -- psql -U postgres yyc3 < backup_20250105.sql

# 从增量备份恢复
kubectl exec -i postgres-0 -n yyc3-production -- pg_restore -U postgres -d yyc3 /backup/incremental_20250105_120000.dump

# 验证数据
kubectl exec -it postgres-0 -n yyc3-production -- psql -U postgres -c "SELECT count(*) FROM users;"
```

**配置恢复**

```bash
# 恢复配置文件
kubectl apply -f configmaps_backup_20250105.yaml

# 恢复密钥
kubectl apply -f secrets_backup_20250105.yaml

# 恢复部署配置
kubectl apply -f deployments_backup_20250105.yaml
```

#### 3.5 性能优化

##### 3.5.1 数据库优化

**索引优化**

```sql
-- 创建索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_orders_user_id_created_at ON orders(user_id, created_at DESC);

-- 分析索引使用情况
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 删除未使用的索引
DROP INDEX CONCURRENTLY idx_unused_index;
```

**查询优化**

```sql
-- 查看慢查询
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 分析查询计划
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = '123' ORDER BY created_at DESC LIMIT 10;
```

##### 3.5.2 缓存优化

**Redis 优化**

```bash
# 查看内存使用情况
kubectl exec -it redis-0 -n yyc3-production -- redis-cli info memory

# 查看键空间统计
kubectl exec -it redis-0 -n yyc3-production -- redis-cli info keyspace

# 优化内存配置
kubectl exec -it redis-0 -n yyc3-production -- redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

##### 3.5.3 应用优化

**Node.js 优化**

```javascript
// 启用集群模式
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // 启动应用
  require('./app.js');
}
```

#### 3.6 安全管理

##### 3.6.1 访问控制

**Kubernetes RBAC**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: yyc3-production
  name: developer
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-binding
  namespace: yyc3-production
subjects:
- kind: User
  name: developer
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io
```

##### 3.6.2 密钥管理

**使用 Kubernetes Secrets**

```bash
# 创建密钥
kubectl create secret generic db-secret \
  --from-literal=username=postgres \
  --from-literal=password=secretpassword \
  -n yyc3-production

# 使用密钥
apiVersion: v1
kind: Pod
metadata:
  name: app
  namespace: yyc3-production
spec:
  containers:
  - name: app
    image: app:latest
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

#### 3.7 日常维护

##### 3.7.1 日常检查清单

**每日检查**
- [ ] 检查系统告警
- [ ] 检查服务状态
- [ ] 检查磁盘空间
- [ ] 检查数据库性能
- [ ] 检查备份状态

**每周检查**
- [ ] 检查系统日志
- [ ] 检查安全日志
- [ ] 检查性能指标
- [ ] 检查资源使用情况
- [ ] 检查依赖更新

**每月检查**
- [ ] 检查系统容量
- [ ] 检查备份恢复测试
- [ ] 检查安全漏洞
- [ ] 检查性能优化
- [ ] 检查文档更新

##### 3.7.2 维护脚本

**系统健康检查脚本**

```bash
#!/bin/bash
# 系统健康检查脚本

echo "=== 系统健康检查 ==="

# 检查 Pod 状态
echo "检查 Pod 状态..."
kubectl get pods -n yyc3-production | grep -v Running

# 检查磁盘空间
echo "检查磁盘空间..."
kubectl exec -it postgres-0 -n yyc3-production -- df -h

# 检查数据库连接
echo "检查数据库连接..."
kubectl exec -it postgres-0 -n yyc3-production -- pg_isready

# 检查 Redis 状态
echo "检查 Redis 状态..."
kubectl exec -it redis-0 -n yyc3-production -- redis-cli ping

echo "=== 健康检查完成 ==="
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
