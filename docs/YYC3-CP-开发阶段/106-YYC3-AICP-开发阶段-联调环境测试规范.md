---
@file: 106-YYC3-AICP-开发阶段-联调环境测试规范.md
@description: YYC3-AICP 联调环境的测试流程、用例、问题排查的完整规范
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [开发阶段],[联调测试],[环境规范]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 106-YYC3-AICP-开发阶段-联调环境测试规范

## 概述

本文档详细描述YYC3-YYC3-AICP-开发阶段-联调环境测试规范相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范联调环境测试规范相关的业务标准与技术落地要求
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

### 3. 联调环境测试规范

#### 3.1 联调环境概述

##### 3.1.1 联调环境定义

联调环境是介于开发环境和测试环境之间的专用环境，用于前后端团队进行接口联调、功能集成测试和问题排查。联调环境具有以下特点：

- **环境隔离**：独立于开发和测试环境，避免相互干扰
- **数据可控**：使用测试数据，可随时重置
- **配置灵活**：支持快速切换配置，便于调试
- **实时监控**：提供详细的日志和监控信息
- **版本管理**：支持多版本并存，便于对比测试

##### 3.1.2 联调环境架构

```
┌─────────────────────────────────────────────────────────────┐
│                      联调环境架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  前端应用     │    │  API网关     │    │  后端服务     │   │
│  │  (Admin)     │    │  (Gateway)   │    │  (Services)  │   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             │                               │
│                    ┌────────▼────────┐                       │
│                    │  负载均衡器      │                       │
│                    └────────┬────────┘                       │
│                             │                               │
│         ┌───────────────────┼───────────────────┐           │
│         │                   │                   │           │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐    │
│  │ PostgreSQL  │    │   Redis     │    │   Kafka     │    │
│  │  (测试数据)  │    │  (缓存)     │    │ (消息队列)   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Prometheus  │    │   Grafana    │    │    ELK       │   │
│  │  (监控指标)   │    │  (监控面板)   │    │  (日志收集)   │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

##### 3.1.3 联调环境访问

- **前端访问**：`http://joint-debug.yyc3-catering.com:3000`
- **API网关**：`http://joint-debug.yyc3-catering.com:8080`
- **监控面板**：`http://joint-debug.yyc3-catering.com:3001`
- **日志查询**：`http://joint-debug.yyc3-catering.com:5601`

#### 3.2 联调环境配置

##### 3.2.1 环境变量配置

```bash
# 联调环境配置文件
# .env.joint-debug

# 应用配置
NODE_ENV=joint-debug
APP_NAME=yyc3-catering-platform
APP_VERSION=1.0.0

# 服务端口
PORT=8080
ADMIN_PORT=3000
CUSTOMER_PORT=3001
STAFF_PORT=3002

# 数据库配置
DB_HOST=joint-debug-db.yyc3-catering.com
DB_PORT=5432
DB_NAME=yyc3_joint_debug
DB_USER=yyc3_debug
DB_PASSWORD=joint_debug_password

# Redis配置
REDIS_HOST=joint-debug-redis.yyc3-catering.com
REDIS_PORT=6379
REDIS_PASSWORD=joint_debug_redis_password
REDIS_DB=0

# Kafka配置
KAFKA_BROKERS=joint-debug-kafka.yyc3-catering.com:9092
KAFKA_CLIENT_ID=yyc3-joint-debug
KAFKA_GROUP_ID=yyc3-joint-debug-group

# API网关配置
GATEWAY_HOST=joint-debug-gateway.yyc3-catering.com
GATEWAY_PORT=8080
GATEWAY_PROTOCOL=http

# 监控配置
PROMETHEUS_HOST=joint-debug-prometheus.yyc3-catering.com
PROMETHEUS_PORT=9090
GRAFANA_HOST=joint-debug-grafana.yyc3-catering.com
GRAFANA_PORT=3001

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_OUTPUT=stdout

# CORS配置
CORS_ORIGIN=http://joint-debug.yyc3-catering.com:3000
CORS_CREDENTIALS=true

# JWT配置
JWT_SECRET=joint_debug_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_MAX_SIZE=10MB
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,pdf,doc,docx

# 第三方服务配置
# 邮件服务（联调环境使用测试邮箱）
SMTP_HOST=smtp.test.com
SMTP_PORT=587
SMTP_USER=test@yyc3.com
SMTP_PASS=test_password

# 短信服务（联调环境使用测试短信）
SMS_API_KEY=test_sms_key
SMS_API_SECRET=test_sms_secret
SMS_TEST_MODE=true

# 支付服务（联调环境使用测试支付）
PAYMENT_API_KEY=test_payment_key
PAYMENT_API_SECRET=test_payment_secret
PAYMENT_TEST_MODE=true
PAYMENT_MOCK_SUCCESS=true

# AI服务配置
OPENAI_API_KEY=test_openai_key
OPENAI_MODEL=gpt-4-turbo
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7
AI_MOCK_MODE=true

# 联调特定配置
DEBUG_MODE=true
ENABLE_SWAGGER=true
ENABLE_PROFILING=true
ENABLE_REQUEST_LOGGING=true
ENABLE_RESPONSE_LOGGING=true
ENABLE_SQL_LOGGING=true
ENABLE_CACHE_LOGGING=true
```

##### 3.2.2 Docker Compose配置

```yaml
# docker-compose.joint-debug.yml
version: '3.8'

services:
  # API网关
  gateway:
    image: yyc3/gateway:latest
    container_name: yyc3-joint-debug-gateway
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=joint-debug
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=yyc3_joint_debug
      - DB_USER=yyc3_debug
      - DB_PASSWORD=joint_debug_password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=joint_debug_redis_password
      - KAFKA_BROKERS=kafka:9092
      - LOG_LEVEL=debug
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      kafka:
        condition: service_started
    networks:
      - joint-debug-network
    volumes:
      - ./logs/gateway:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL数据库
  postgres:
    image: postgres:14-alpine
    container_name: yyc3-joint-debug-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=yyc3_joint_debug
      - POSTGRES_USER=yyc3_debug
      - POSTGRES_PASSWORD=joint_debug_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    networks:
      - joint-debug-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U yyc3_debug"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: yyc3-joint-debug-redis
    ports:
      - "6379:6379"
    command: redis-server --requirepass joint_debug_redis_password --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - joint-debug-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Kafka消息队列
  kafka:
    image: confluentinc/cp-kafka:latest
    container_name: yyc3-joint-debug-kafka
    ports:
      - "9092:9092"
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    depends_on:
      - zookeeper
    networks:
      - joint-debug-network

  # Zookeeper
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    container_name: yyc3-joint-debug-zookeeper
    ports:
      - "2181:2181"
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181
      - ZOOKEEPER_TICK_TIME=2000
    networks:
      - joint-debug-network

  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    container_name: yyc3-joint-debug-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    networks:
      - joint-debug-network

  # Grafana监控面板
  grafana:
    image: grafana/grafana:latest
    container_name: yyc3-joint-debug-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    networks:
      - joint-debug-network

  # Elasticsearch
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: yyc3-joint-debug-elasticsearch
    ports:
      - "9200:9200"
      - "9300:9300"
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - joint-debug-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Logstash
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: yyc3-joint-debug-logstash
    ports:
      - "5044:5044"
      - "9600:9600"
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch
    networks:
      - joint-debug-network

  # Kibana
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: yyc3-joint-debug-kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - joint-debug-network

networks:
  joint-debug-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
  elasticsearch_data:
```

##### 3.2.3 启动联调环境

```bash
# 启动联调环境
docker-compose -f docker-compose.joint-debug.yml up -d

# 查看服务状态
docker-compose -f docker-compose.joint-debug.yml ps

# 查看服务日志
docker-compose -f docker-compose.joint-debug.yml logs -f

# 停止联调环境
docker-compose -f docker-compose.joint-debug.yml down

# 停止并清理数据
docker-compose -f docker-compose.joint-debug.yml down -v
```

#### 3.3 联调测试流程

##### 3.3.1 联调前准备

**1. 环境检查清单**

```bash
#!/bin/bash
# 联调环境检查脚本

echo "=== 联调环境检查 ==="

# 检查Docker服务
echo "检查Docker服务..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker服务未启动"
    exit 1
fi
echo "✅ Docker服务正常"

# 检查Docker Compose
echo "检查Docker Compose..."
if ! docker-compose --version > /dev/null 2>&1; then
    echo "❌ Docker Compose未安装"
    exit 1
fi
echo "✅ Docker Compose正常"

# 检查端口占用
echo "检查端口占用..."
ports=(8080 3000 3001 3002 5432 6379 9090 3001 5601)
for port in "${ports[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "⚠️  端口 $port 已被占用"
    else
        echo "✅ 端口 $port 可用"
    fi
done

# 检查环境变量文件
echo "检查环境变量文件..."
if [ ! -f .env.joint-debug ]; then
    echo "❌ 环境变量文件不存在"
    exit 1
fi
echo "✅ 环境变量文件存在"

# 检查Docker镜像
echo "检查Docker镜像..."
images=("yyc3/gateway:latest" "postgres:14-alpine" "redis:7-alpine")
for image in "${images[@]}"; do
    if docker images | grep -q "$image"; then
        echo "✅ 镜像 $image 已存在"
    else
        echo "⚠️  镜像 $image 不存在，将自动下载"
    fi
done

echo "=== 环境检查完成 ==="
```

**2. 数据库初始化**

```bash
#!/bin/bash
# 数据库初始化脚本

echo "=== 初始化联调数据库 ==="

# 连接到数据库
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug << EOF
-- 创建测试数据
INSERT INTO users (email, password, name, role, status) VALUES
('admin@yyc3.com', '\$2b\$10\$test', '管理员', 'admin', 'active'),
('staff@yyc3.com', '\$2b\$10\$test', '员工', 'staff', 'active'),
('customer@yyc3.com', '\$2b\$10\$test', '客户', 'customer', 'active');

-- 创建测试订单
INSERT INTO orders (user_id, total_amount, status, created_at) VALUES
(1, 100.00, 'pending', NOW()),
(2, 200.00, 'completed', NOW()),
(3, 150.00, 'processing', NOW());

-- 创建测试菜单
INSERT INTO menu_items (name, price, category, status) VALUES
('测试菜品1', 50.00, 'main', 'active'),
('测试菜品2', 30.00, 'appetizer', 'active'),
('测试菜品3', 20.00, 'dessert', 'active');

EOF

echo "✅ 数据库初始化完成"
```

**3. 缓存预热**

```bash
#!/bin/bash
# 缓存预热脚本

echo "=== 缓存预热 ==="

# 预热用户数据
curl -X POST http://localhost:8080/api/v1/cache/warmup \
  -H "Content-Type: application/json" \
  -d '{
    "type": "users",
    "keys": ["1", "2", "3"]
  }'

# 预热菜单数据
curl -X POST http://localhost:8080/api/v1/cache/warmup \
  -H "Content-Type: application/json" \
  -d '{
    "type": "menu",
    "keys": ["all"]
  }'

# 预热配置数据
curl -X POST http://localhost:8080/api/v1/cache/warmup \
  -H "Content-Type: application/json" \
  -d '{
    "type": "config",
    "keys": ["all"]
  }'

echo "✅ 缓存预热完成"
```

##### 3.3.2 联调测试流程

**阶段1：接口联调**

```bash
#!/bin/bash
# 接口联调测试脚本

echo "=== 接口联调测试 ==="

# 1. 用户认证接口测试
echo "测试用户认证接口..."
LOGIN_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yyc3.com",
    "password": "test123"
  }')

echo "登录响应: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "获取Token: $TOKEN"

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ 登录失败"
    exit 1
fi
echo "✅ 登录成功"

# 2. 用户信息接口测试
echo "测试用户信息接口..."
USER_INFO=$(curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN")

echo "用户信息: $USER_INFO"

USER_ID=$(echo $USER_INFO | jq -r '.data.id')
echo "用户ID: $USER_ID"

# 3. 订单接口测试
echo "测试订单接口..."
ORDER_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"menu_id": 1, "quantity": 2},
      {"menu_id": 2, "quantity": 1}
    ],
    "total_amount": 130.00
  }')

echo "订单响应: $ORDER_RESPONSE"

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.id')
echo "订单ID: $ORDER_ID"

# 4. 菜单接口测试
echo "测试菜单接口..."
MENU_RESPONSE=$(curl -X GET http://localhost:8080/api/v1/menu \
  -H "Authorization: Bearer $TOKEN")

echo "菜单响应: $MENU_RESPONSE"

# 5. 支付接口测试
echo "测试支付接口..."
PAYMENT_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/orders/$ORDER_ID/pay \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "alipay",
    "amount": 130.00
  }')

echo "支付响应: $PAYMENT_RESPONSE"

echo "✅ 接口联调测试完成"
```

**阶段2：功能集成测试**

```bash
#!/bin/bash
# 功能集成测试脚本

echo "=== 功能集成测试 ==="

# 1. 完整订单流程测试
echo "测试完整订单流程..."

# 登录
LOGIN_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@yyc3.com", "password": "test123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

# 获取菜单
MENU_RESPONSE=$(curl -X GET http://localhost:8080/api/v1/menu \
  -H "Authorization: Bearer $TOKEN")

# 创建订单
ORDER_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"menu_id": 1, "quantity": 2}
    ],
    "total_amount": 100.00
  }')

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.id')

# 支付订单
PAYMENT_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/orders/$ORDER_ID/pay \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_method": "alipay", "amount": 100.00}')

# 查询订单状态
ORDER_STATUS=$(curl -X GET http://localhost:8080/api/v1/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN")

echo "订单状态: $ORDER_STATUS"

# 2. 实时消息测试
echo "测试实时消息功能..."

# 连接WebSocket
wscat -c ws://localhost:8080/api/v1/ws?token=$TOKEN

# 3. 文件上传测试
echo "测试文件上传功能..."

UPLOAD_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.jpg")

echo "上传响应: $UPLOAD_RESPONSE"

echo "✅ 功能集成测试完成"
```

**阶段3：性能测试**

```bash
#!/bin/bash
# 性能测试脚本

echo "=== 性能测试 ==="

# 1. 并发测试
echo "执行并发测试..."

cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // 测试健康检查接口
  let healthRes = http.get('http://localhost:8080/health');
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 测试登录接口
  let loginRes = http.post('http://localhost:8080/api/v1/auth/login',
    JSON.stringify({
      email: 'admin@yyc3.com',
      password: 'test123'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
EOF

k6 run load-test.js

# 2. 响应时间测试
echo "执行响应时间测试..."

for i in {1..10}; do
  START_TIME=$(date +%s%N)
  curl -s http://localhost:8080/health > /dev/null
  END_TIME=$(date +%s%N)
  DURATION=$((($END_TIME - $START_TIME) / 1000000))
  echo "请求 $i: ${DURATION}ms"
done

echo "✅ 性能测试完成"
```

##### 3.3.3 联调后清理

```bash
#!/bin/bash
# 联调后清理脚本

echo "=== 联调后清理 ==="

# 1. 清理测试数据
echo "清理测试数据..."
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug << EOF
DELETE FROM orders WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM users WHERE email LIKE '%test%';
EOF

# 2. 清理缓存
echo "清理缓存..."
docker exec -it yyc3-joint-debug-redis redis-cli -a joint_debug_redis_password FLUSHDB

# 3. 清理日志
echo "清理日志..."
find ./logs -name "*.log" -mtime +7 -delete

# 4. 清理临时文件
echo "清理临时文件..."
find ./tmp -type f -mtime +1 -delete

echo "✅ 清理完成"
```

#### 3.4 联调测试用例

##### 3.4.1 用户认证模块

**测试用例1：用户登录**

```yaml
测试用例: 用户登录
前置条件: 用户已注册
测试步骤:
  1. 发送登录请求
  2. 验证响应状态码
  3. 验证返回的Token
  4. 验证用户信息
预期结果:
  - 响应状态码为200
  - 返回有效的JWT Token
  - 用户信息正确
测试数据:
  email: admin@yyc3.com
  password: test123
```

**测试用例2：Token刷新**

```yaml
测试用例: Token刷新
前置条件: 用户已登录
测试步骤:
  1. 使用刷新Token请求新Token
  2. 验证响应状态码
  3. 验证新Token有效性
预期结果:
  - 响应状态码为200
  - 返回新的访问Token
  - 新Token可以正常使用
```

##### 3.4.2 订单管理模块

**测试用例1：创建订单**

```yaml
测试用例: 创建订单
前置条件: 用户已登录，菜单数据存在
测试步骤:
  1. 选择菜品
  2. 提交订单
  3. 验证订单创建成功
  4. 验证订单状态
预期结果:
  - 订单创建成功
  - 订单状态为pending
  - 订单金额正确
测试数据:
  items:
    - menu_id: 1
      quantity: 2
    - menu_id: 2
      quantity: 1
  total_amount: 130.00
```

**测试用例2：订单支付**

```yaml
测试用例: 订单支付
前置条件: 订单已创建
测试步骤:
  1. 选择支付方式
  2. 提交支付请求
  3. 验证支付成功
  4. 验证订单状态更新
预期结果:
  - 支付成功
  - 订单状态更新为paid
  - 生成支付记录
```

##### 3.4.3 菜单管理模块

**测试用例1：获取菜单**

```yaml
测试用例: 获取菜单
前置条件: 菜单数据已初始化
测试步骤:
  1. 请求菜单列表
  2. 验证响应数据
  3. 验证菜单分类
预期结果:
  - 返回完整的菜单列表
  - 菜单分类正确
  - 菜单信息完整
```

**测试用例2：菜单搜索**

```yaml
测试用例: 菜单搜索
前置条件: 菜单数据已初始化
测试步骤:
  1. 输入搜索关键词
  2. 提交搜索请求
  3. 验证搜索结果
预期结果:
  - 返回匹配的菜品
  - 搜索结果准确
  - 响应时间合理
```

#### 3.5 联调问题排查

##### 3.5.1 常见问题及解决方案

**问题1：接口返回401未授权**

```bash
# 问题描述
# 调用API时返回401状态码

# 排查步骤
# 1. 检查Token是否存在
TOKEN="your_token_here"
if [ -z "$TOKEN" ]; then
    echo "Token不存在，请先登录"
fi

# 2. 检查Token是否过期
DECODED=$(echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null)
EXPIRES_AT=$(echo $DECODED | jq -r '.exp')
CURRENT_TIME=$(date +%s)

if [ $CURRENT_TIME -gt $EXPIRES_AT ]; then
    echo "Token已过期，请重新登录"
fi

# 3. 检查Token格式
if [[ ! $TOKEN =~ ^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$ ]]; then
    echo "Token格式不正确"
fi

# 解决方案
# 1. 重新登录获取新Token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yyc3.com", "password": "test123"}'

# 2. 使用刷新Token获取新Token
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "your_refresh_token"}'
```

**问题2：接口响应超时**

```bash
# 问题描述
# 调用API时响应超时

# 排查步骤
# 1. 检查服务状态
docker-compose ps

# 2. 检查服务日志
docker-compose logs gateway

# 3. 检查网络连接
ping -c 3 localhost
curl -v http://localhost:8080/health

# 4. 检查数据库连接
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug -c "SELECT 1;"

# 5. 检查Redis连接
docker exec -it yyc3-joint-debug-redis redis-cli -a joint_debug_redis_password PING

# 解决方案
# 1. 重启服务
docker-compose restart gateway

# 2. 增加超时时间
curl -X GET http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  --max-time 30

# 3. 检查数据库查询性能
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug << EOF
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1;
EOF
```

**问题3：数据库连接失败**

```bash
# 问题描述
# 无法连接到数据库

# 排查步骤
# 1. 检查数据库服务状态
docker-compose ps postgres

# 2. 检查数据库日志
docker-compose logs postgres

# 3. 检查数据库连接配置
cat .env.joint-debug | grep DB_

# 4. 测试数据库连接
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug -c "SELECT version();"

# 解决方案
# 1. 重启数据库服务
docker-compose restart postgres

# 2. 检查数据库连接数
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug << EOF
SELECT count(*) FROM pg_stat_activity;
EOF

# 3. 增加数据库连接池大小
# 修改.env.joint-debug文件
DB_POOL_MIN=10
DB_POOL_MAX=50

# 4. 检查数据库性能
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug << EOF
SELECT * FROM pg_stat_activity WHERE state = 'active';
EOF
```

**问题4：Redis连接失败**

```bash
# 问题描述
# 无法连接到Redis

# 排查步骤
# 1. 检查Redis服务状态
docker-compose ps redis

# 2. 检查Redis日志
docker-compose logs redis

# 3. 检查Redis连接配置
cat .env.joint-debug | grep REDIS_

# 4. 测试Redis连接
docker exec -it yyc3-joint-debug-redis redis-cli -a joint_debug_redis_password PING

# 解决方案
# 1. 重启Redis服务
docker-compose restart redis

# 2. 检查Redis内存使用
docker exec -it yyc3-joint-debug-redis redis-cli -a joint_debug_redis_password INFO memory

# 3. 清理Redis缓存
docker exec -it yyc3-joint-debug-redis redis-cli -a joint_debug_redis_password FLUSHDB

# 4. 检查Redis连接数
docker exec -it yyc3-joint-debug-redis redis-cli -a joint_debug_redis_password INFO clients
```

##### 3.5.2 日志分析

```bash
#!/bin/bash
# 日志分析脚本

echo "=== 日志分析 ==="

# 1. 查看错误日志
echo "查看错误日志..."
docker-compose logs gateway | grep ERROR

# 2. 查看警告日志
echo "查看警告日志..."
docker-compose logs gateway | grep WARN

# 3. 查看慢查询日志
echo "查看慢查询日志..."
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug << EOF
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF

# 4. 查看API响应时间
echo "查看API响应时间..."
docker-compose logs gateway | grep "duration" | awk '{print $NF}'

# 5. 查看错误率
echo "查看错误率..."
TOTAL_REQUESTS=$(docker-compose logs gateway | grep "GET\|POST" | wc -l)
ERROR_REQUESTS=$(docker-compose logs gateway | grep "status\":5[0-9][0-9] | wc -l)
ERROR_RATE=$(echo "scale=2; $ERROR_REQUESTS * 100 / $TOTAL_REQUESTS" | bc)
echo "错误率: ${ERROR_RATE}%"

echo "=== 日志分析完成 ==="
```

##### 3.5.3 监控指标

```bash
#!/bin/bash
# 监控指标检查脚本

echo "=== 监控指标检查 ==="

# 1. 检查服务健康状态
echo "检查服务健康状态..."
curl -s http://localhost:8080/health | jq .

# 2. 检查CPU使用率
echo "检查CPU使用率..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}"

# 3. 检查内存使用率
echo "检查内存使用率..."
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"

# 4. 检查磁盘使用率
echo "检查磁盘使用率..."
df -h

# 5. 检查网络连接数
echo "检查网络连接数..."
netstat -an | grep ESTABLISHED | wc -l

# 6. 检查数据库连接数
echo "检查数据库连接数..."
docker exec -it yyc3-joint-debug-postgres psql -U yyc3_debug -d yyc3_joint_debug << EOF
SELECT count(*) FROM pg_stat_activity;
EOF

# 7. 检查Redis命中率
echo "检查Redis命中率..."
docker exec -it yyc3-joint-debug-redis redis-cli -a joint_debug_redis_password INFO stats | grep keyspace

echo "=== 监控指标检查完成 ==="
```

#### 3.6 联调最佳实践

##### 3.6.1 联调规范

**1. 版本管理**

- 前后端版本必须保持一致
- 使用Git标签标记联调版本
- 记录每次联调的版本信息

```bash
# 创建联调版本标签
git tag -a v1.0.0-joint-debug -m "联调版本 v1.0.0"
git push origin v1.0.0-joint-debug

# 查看版本信息
git show v1.0.0-joint-debug
```

**2. 接口文档**

- 联调前必须完成接口文档
- 接口变更必须及时更新文档
- 使用Swagger/OpenAPI规范

```yaml
# 接口文档示例
openapi: 3.0.0
info:
  title: YYC3餐饮平台API
  version: 1.0.0
  description: YYC3餐饮平台联调接口文档

paths:
  /api/v1/auth/login:
    post:
      summary: 用户登录
      description: 用户登录接口
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 6
              required:
                - email
                - password
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      token:
                        type: string
                      user:
                        type: object
```

**3. 数据管理**

- 使用测试数据，避免使用生产数据
- 联调后及时清理测试数据
- 定期备份数据库

```bash
# 备份数据库
docker exec yyc3-joint-debug-postgres pg_dump -U yyc3_debug yyc3_joint_debug > backup.sql

# 恢复数据库
docker exec -i yyc3-joint-debug-postgres psql -U yyc3_debug yyc3_joint_debug < backup.sql
```

##### 3.6.2 联调工具

**1. API测试工具**

- Postman：用于API测试和调试
- Thunder Client：VS Code插件，轻量级API测试
- curl：命令行工具，适合脚本化测试

```bash
# 使用curl测试API
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yyc3.com", "password": "test123"}' \
  -w "\n响应时间: %{time_total}s\n"
```

**2. 监控工具**

- Prometheus：监控指标收集
- Grafana：监控数据可视化
- ELK Stack：日志收集和分析

```bash
# 访问Grafana监控面板
open http://localhost:3001

# 访问Kibana日志查询
open http://localhost:5601
```

**3. 调试工具**

- Chrome DevTools：前端调试
- VS Code Debugger：代码调试
- Docker Logs：容器日志查看

```bash
# 查看服务日志
docker-compose logs -f gateway

# 实时查看日志并过滤错误
docker-compose logs -f gateway | grep ERROR
```

##### 3.6.3 联调检查清单

**联调前检查**

- [ ] 环境配置正确
- [ ] 数据库已初始化
- [ ] 缓存已预热
- [ ] 服务已启动
- [ ] 接口文档已更新
- [ ] 测试数据已准备
- [ ] 监控工具已配置

**联调中检查**

- [ ] 接口响应正常
- [ ] 数据格式正确
- [ ] 错误处理完善
- [ ] 性能指标达标
- [ ] 日志记录完整
- [ ] 监控指标正常

**联调后检查**

- [ ] 测试数据已清理
- [ ] 日志已归档
- [ ] 问题已记录
- [ ] 文档已更新
- [ ] 版本已标记
- [ ] 环境已重置

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
