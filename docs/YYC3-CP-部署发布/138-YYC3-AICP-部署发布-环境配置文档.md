---
@file: 138-YYC3-AICP-部署发布-环境配置文档.md
@description: YYC3-AICP 生产、预生产环境的服务器、数据库、中间件的配置规范
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [部署发布],[环境配置],[生产环境]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 138-YYC3-AICP-部署发布-环境配置文档

## 概述

本文档详细描述YYC3-YYC3-AICP-部署发布-环境配置文档相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范环境配置文档相关的业务标准与技术落地要求
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

### 3. 环境配置文档

#### 3.1 环境架构

YYC³-AICP 采用多环境架构，包括开发环境、测试环境、预生产环境和生产环境，每个环境具有独立的配置和资源隔离。

**环境列表**

| 环境名称 | 用途 | 域名 | Kubernetes Namespace | 数据库实例 |
|---------|------|------|---------------------|-----------|
| 开发环境 | 本地开发和单元测试 | dev.yyc3.local | development | dev-mysql |
| 测试环境 | 集成测试和功能验证 | test.yyc3.com | testing | test-mysql |
| 预生产环境 | 性能测试和UAT | staging.yyc3.com | staging | staging-mysql |
| 生产环境 | 正式运行环境 | api.yyc3.com | production | prod-mysql |

#### 3.2 生产环境配置

##### 3.2.1 服务器配置

**Kubernetes 集群配置**

```yaml
# 生产环境 Kubernetes 集群配置
cluster:
  name: yyc3-production
  version: v1.28.0
  region: cn-north-1
  
  master:
    count: 3
    instanceType: c5.2xlarge
    diskSize: 100Gi
    diskType: gp3
    
  worker:
    count: 6
    instanceType: c5.4xlarge
    diskSize: 200Gi
    diskType: gp3
    autoScaling:
      enabled: true
      minReplicas: 3
      maxReplicas: 10
      targetCPUUtilizationPercentage: 70
```

**网络配置**

```yaml
network:
  vpc:
    cidr: 10.0.0.0/16
    subnets:
      public:
        - cidr: 10.0.1.0/24
          availabilityZone: cn-north-1a
        - cidr: 10.0.2.0/24
          availabilityZone: cn-north-1b
      private:
        - cidr: 10.0.10.0/24
          availabilityZone: cn-north-1a
        - cidr: 10.0.11.0/24
          availabilityZone: cn-north-1b
  
  loadBalancer:
    type: Application Load Balancer
    scheme: internet-facing
    sslCertificate: arn:aws:acm:cn-north-1:123456789012:certificate/abc123
```

##### 3.2.2 数据库配置

**MySQL 主从配置**

```yaml
# MySQL 主库配置
mysql-master:
  instanceType: db.r6g.2xlarge
  version: 8.0.35
  storage:
    size: 500Gi
    type: gp3
    iops: 12000
    throughput: 500
  parameters:
    max_connections: 1000
    innodb_buffer_pool_size: 32G
    innodb_log_file_size: 2G
    innodb_flush_log_at_trx_commit: 2
    innodb_flush_method: O_DIRECT
  backup:
    retentionPeriod: 30
    backupWindow: 03:00-04:00
    multiAZ: true

# MySQL 从库配置
mysql-slave:
  instanceType: db.r6g.xlarge
  version: 8.0.35
  storage:
    size: 500Gi
    type: gp3
  replication:
    sourceDB: mysql-master
    lag: 5
```

**数据库连接池配置**

```yaml
database:
  connectionPool:
    maxConnections: 100
    minConnections: 10
    acquireTimeoutMillis: 30000
    idleTimeoutMillis: 60000
    connectionTimeoutMillis: 20000
    maxLifetime: 1800000
  monitoring:
    enabled: true
    slowQueryThreshold: 1000
    logSlowQueries: true
```

##### 3.2.3 缓存配置

**Redis 集群配置**

```yaml
# Redis 集群配置
redis-cluster:
  mode: cluster
  version: 7.2.3
  nodeCount: 6
  nodeType: cache.r6g.large
  shards: 3
  replicas: 1
  parameterGroup:
    cluster-enabled: yes
    maxmemory-policy: allkeys-lru
    timeout: 300
  encryption:
    atRest: true
    inTransit: true
  backup:
    enabled: true
    retentionPeriod: 7
    backupWindow: 04:00-05:00
```

**缓存策略配置**

```yaml
cache:
  strategy:
    defaultTTL: 3600
    maxMemory: 2G
    evictionPolicy: allkeys-lru
  keys:
    userSession:
      ttl: 7200
      maxSize: 10000
    menuCache:
      ttl: 86400
      maxSize: 1000
    orderCache:
      ttl: 1800
      maxSize: 50000
```

##### 3.2.4 消息队列配置

**RabbitMQ 集群配置**

```yaml
# RabbitMQ 集群配置
rabbitmq-cluster:
  version: 3.12.10
  nodeCount: 3
  instanceType: c5.xlarge
  diskSize: 100Gi
  plugins:
    - rabbitmq_management
    - rabbitmq_shovel
    - rabbitmq_federation
  policies:
    ha-all:
      pattern: ".*"
      ha-mode: all
      ha-sync-mode: automatic
  queues:
    orderQueue:
      durable: true
      arguments:
        x-ha-policy: all
    notificationQueue:
      durable: true
      arguments:
        x-ha-policy: all
```

**Kafka 集群配置**

```yaml
# Kafka 集群配置
kafka-cluster:
  version: 3.6.0
  brokerCount: 3
  instanceType: i3.xlarge
  diskSize: 500Gi
  diskType: gp3
  configuration:
    num.partitions: 12
    default.replication.factor: 3
    min.insync.replicas: 2
    log.retention.hours: 168
    log.segment.bytes: 1073741824
    log.retention.check.interval.ms: 300000
  topics:
    order-events:
      partitions: 12
      replicationFactor: 3
      retentionMs: 604800000
    user-events:
      partitions: 6
      replicationFactor: 3
      retentionMs: 604800000
```

##### 3.2.5 服务配置

**API 网关配置**

```yaml
api-gateway:
  replicaCount: 3
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 2000m
      memory: 2048Mi
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 80
    targetMemoryUtilizationPercentage: 80
  rateLimit:
    enabled: true
    requestsPerSecond: 1000
    burst: 2000
  circuitBreaker:
    enabled: true
    failureThreshold: 5
    resetTimeout: 30000
```

**微服务资源配置**

```yaml
services:
  user-service:
    replicaCount: 2
    resources:
      requests:
        cpu: 250m
        memory: 256Mi
      limits:
        cpu: 1000m
        memory: 1024Mi
    autoscaling:
      minReplicas: 2
      maxReplicas: 5
      targetCPUUtilizationPercentage: 80
  
  order-service:
    replicaCount: 3
    resources:
      requests:
        cpu: 500m
        memory: 512Mi
      limits:
        cpu: 2000m
        memory: 2048Mi
    autoscaling:
      minReplicas: 3
      maxReplicas: 10
      targetCPUUtilizationPercentage: 80
  
  menu-service:
    replicaCount: 2
    resources:
      requests:
        cpu: 250m
        memory: 256Mi
      limits:
        cpu: 1000m
        memory: 1024Mi
    autoscaling:
      minReplicas: 2
      maxReplicas: 5
      targetCPUUtilizationPercentage: 80
  
  notification-service:
    replicaCount: 1
    resources:
      requests:
        cpu: 250m
        memory: 256Mi
      limits:
        cpu: 1000m
        memory: 1024Mi
    autoscaling:
      minReplicas: 1
      maxReplicas: 3
      targetCPUUtilizationPercentage: 80
```

##### 3.2.6 监控配置

**Prometheus 配置**

```yaml
prometheus:
  replicaCount: 2
  resources:
    requests:
      cpu: 500m
      memory: 2Gi
    limits:
      cpu: 2000m
      memory: 4Gi
  storage:
    size: 100Gi
    retention: 30d
  scrapeInterval: 15s
  evaluationInterval: 15s
```

**Grafana 配置**

```yaml
grafana:
  replicaCount: 2
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 2048Mi
  storage:
    size: 20Gi
  adminUser: admin
  adminPassword: ${GRAFANA_ADMIN_PASSWORD}
```

##### 3.2.7 日志配置

**ELK Stack 配置**

```yaml
elasticsearch:
  replicaCount: 3
  resources:
    requests:
      cpu: 1000m
      memory: 4Gi
    limits:
      cpu: 4000m
      memory: 16Gi
  storage:
    size: 500Gi
  retention: 30d
  indices:
    - name: yyc3-logs-*
      retention: 7d
    - name: yyc3-metrics-*
      retention: 30d

logstash:
  replicaCount: 2
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi

kibana:
  replicaCount: 2
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 2048Mi
```

#### 3.3 测试环境配置

##### 3.3.1 服务器配置

```yaml
# 测试环境 Kubernetes 集群配置
cluster:
  name: yyc3-testing
  version: v1.27.0
  region: cn-north-1
  
  master:
    count: 1
    instanceType: t3.medium
    diskSize: 50Gi
    diskType: gp2
    
  worker:
    count: 2
    instanceType: t3.large
    diskSize: 100Gi
    diskType: gp2
```

##### 3.3.2 数据库配置

```yaml
# 测试环境 MySQL 配置
mysql:
  instanceType: db.t3.medium
  version: 8.0.35
  storage:
    size: 100Gi
    type: gp2
  parameters:
    max_connections: 200
    innodb_buffer_pool_size: 4G
  backup:
    retentionPeriod: 7
    backupWindow: 02:00-03:00
```

#### 3.4 预生产环境配置

##### 3.4.1 服务器配置

```yaml
# 预生产环境 Kubernetes 集群配置
cluster:
  name: yyc3-staging
  version: v1.28.0
  region: cn-north-1
  
  master:
    count: 1
    instanceType: c5.xlarge
    diskSize: 80Gi
    diskType: gp3
    
  worker:
    count: 3
    instanceType: c5.2xlarge
    diskSize: 150Gi
    diskType: gp3
```

##### 3.4.2 数据库配置

```yaml
# 预生产环境 MySQL 配置
mysql:
  instanceType: db.r5.2xlarge
  version: 8.0.35
  storage:
    size: 300Gi
    type: gp3
  parameters:
    max_connections: 500
    innodb_buffer_pool_size: 16G
  backup:
    retentionPeriod: 14
    backupWindow: 03:00-04:00
```

#### 3.5 环境变量配置

##### 3.5.1 通用环境变量

```yaml
# 通用环境变量
common:
  timezone: Asia/Shanghai
  language: zh-CN
  encoding: UTF-8
  
  # 服务发现
  consul:
    host: consul.yyc3.svc.cluster.local
    port: 8500
    
  # 配置中心
  nacos:
    host: nacos.yyc3.svc.cluster.local
    port: 8848
    namespace: yyc3
```

##### 3.5.2 数据库环境变量

```yaml
# 数据库环境变量
database:
  mysql:
    host: mysql.yyc3.svc.cluster.local
    port: 3306
    database: yyc3_catering
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    ssl: true
    connectionTimeout: 10000
    queryTimeout: 30000
```

##### 3.5.3 缓存环境变量

```yaml
# 缓存环境变量
cache:
  redis:
    host: redis.yyc3.svc.cluster.local
    port: 6379
    password: ${REDIS_PASSWORD}
    db: 0
    ssl: true
    maxRetries: 3
    retryDelayOnFailover: 100
```

##### 3.5.4 消息队列环境变量

```yaml
# 消息队列环境变量
messageQueue:
  rabbitmq:
    host: rabbitmq.yyc3.svc.cluster.local
    port: 5672
    username: ${RABBITMQ_USERNAME}
    password: ${RABBITMQ_PASSWORD}
    vhost: /yyc3
    ssl: true
    
  kafka:
    brokers:
      - kafka-0.yyc3.svc.cluster.local:9092
      - kafka-1.yyc3.svc.cluster.local:9092
      - kafka-2.yyc3.svc.cluster.local:9092
    clientId: ${SERVICE_NAME}
    groupId: ${SERVICE_GROUP}
    ssl: true
```

#### 3.6 安全配置

##### 3.6.1 网络安全

```yaml
# 网络安全配置
networkSecurity:
  # 防火墙规则
  firewall:
    inbound:
      - port: 80
        protocol: tcp
        source: 0.0.0.0/0
      - port: 443
        protocol: tcp
        source: 0.0.0.0/0
      - port: 22
        protocol: tcp
        source: 10.0.0.0/16
    outbound:
      - destination: 0.0.0.0/0
        protocol: all
  
  # 网络策略
  networkPolicies:
    defaultDeny: true
    allowDNS: true
    allowIngress: true
    allowEgress: true
```

##### 3.6.2 访问控制

```yaml
# 访问控制配置
accessControl:
  # RBAC 配置
  rbac:
    enabled: true
    admin:
      - admin@yyc3.com
    developer:
      - dev@yyc3.com
    readonly:
      - readonly@yyc3.com
  
  # 服务账户
  serviceAccounts:
    api-gateway:
      create: true
      name: api-gateway-sa
    user-service:
      create: true
      name: user-service-sa
```

#### 3.7 备份配置

##### 3.7.1 数据库备份

```yaml
# 数据库备份配置
databaseBackup:
  enabled: true
  schedule: "0 3 * * *"
  retention: 30
  storage:
    type: s3
    bucket: yyc3-backup
    prefix: mysql/
  encryption: true
  compression: true
```

##### 3.7.2 配置备份

```yaml
# 配置备份配置
configBackup:
  enabled: true
  schedule: "0 4 * * *"
  retention: 90
  storage:
    type: s3
    bucket: yyc3-backup
    prefix: config/
  encryption: true
```

#### 3.8 灾难恢复

##### 3.8.1 跨区域复制

```yaml
# 跨区域复制配置
disasterRecovery:
  enabled: true
  primaryRegion: cn-north-1
  secondaryRegion: cn-south-1
  
  replication:
    database:
      enabled: true
      mode: async
      lag: 5
    storage:
      enabled: true
      schedule: "0 5 * * *"
  
  failover:
    enabled: true
    rto: 30
    rpo: 5
    automatic: false
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
