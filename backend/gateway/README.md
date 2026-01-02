# 🔖 YYC³ API Gateway

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

## 📋 概述

YYC³ API Gateway 是一个企业级的统一API网关，为 YYC³ 餐饮平台提供路由转发、身份认证、请求限流、缓存、熔断、监控等功能。该网关采用模块化设计，支持动态路由配置，能够有效保护后端服务，提升系统性能和可靠性。

## ✨ 核心特性

- **统一路由**: 集中管理所有后端服务的路由规则
- **身份认证**: 基于 JWT 的统一身份认证机制
- **请求限流**: 多级限流策略，防止服务过载
- **智能缓存**: 基于 Redis 的响应缓存，提升响应速度
- **熔断保护**: 熔断器机制，防止级联故障
- **监控告警**: 集成 Prometheus 监控，实时追踪服务状态
- **日志记录**: 完整的请求/响应日志，便于问题排查
- **安全防护**: Helmet、CORS 等安全中间件，保护 API 安全
- **服务发现**: 集成 Consul，实现服务自动注册和发现
- **数据加密**: 支持请求数据加密传输

## 🏗️ 技术架构

### 架构图

```
客户端
  ↓
API Gateway (端口: 8080)
  ├─ 认证中间件
  ├─ 限流中间件
  ├─ 缓存中间件
  ├─ 熔断中间件
  └─ 路由代理
  ↓
后端服务
  ├─ 用户服务 (端口: 3001)
  ├─ 菜单服务 (端口: 3002)
  ├─ 订单服务 (端口: 3003)
  └─ AI 服务 (端口: 3004)
```

### 核心组件

| 组件 | 说明 |
|------|------|
| GatewayApp | 网关主应用类 |
| AuthenticationMiddleware | 身份认证中间件 |
| RateLimiterMiddleware | 请求限流中间件 |
| CacheMiddleware | 缓存中间件 |
| CircuitBreakerMiddleware | 熔断器中间件 |
| MetricsMiddleware | 监控指标中间件 |
| LoggingMiddleware | 日志记录中间件 |
| EncryptionMiddleware | 数据加密中间件 |

## 🚀 快速开始

### 安装依赖

```bash
cd backend/gateway
pnpm install
```

### 配置环境变量

创建 `.env` 文件：

```bash
# 服务器配置
GATEWAY_HOST=0.0.0.0
GATEWAY_PORT=8080
NODE_ENV=development

# JWT 配置
JWT_SECRET=your-jwt-secret-key

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=1

# Consul 配置
CONSUL_HOST=localhost
CONSUL_PORT=8500

# CORS 配置
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# 日志配置
LOG_LEVEL=info
```

### 启动网关

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start
```

### 访问网关

- **网关地址**: http://localhost:8080
- **健康检查**: http://localhost:8080/api/v1/health
- **路由信息**: http://localhost:8080/api/v1/routes
- **服务状态**: http://localhost:8080/api/v1/services
- **监控指标**: http://localhost:8080/metrics

## 📖 使用指南

### 1. 路由配置

路由配置在 `src/config/gateway.config.ts` 中：

```typescript
routes: [
  {
    path: '/api/v1/users',
    target: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 30000,
    retries: 3,
    authentication: true,
    rateLimit: {
      maxRequests: 50,
      windowMs: 60000
    }
  }
]
```

### 2. 身份认证

网关会自动验证 JWT token，并在请求头中添加用户信息：

```typescript
// 客户端请求
fetch('http://localhost:8080/api/v1/users', {
  headers: {
    'Authorization': 'Bearer <jwt-token>'
  }
});

// 后端服务接收的用户信息
req.headers['x-user-id']      // 用户ID
req.headers['x-user-email']   // 用户邮箱
req.headers['x-user-role']    // 用户角色
```

### 3. 请求限流

网关提供多级限流策略：

- **全局限流**: 所有请求共享限流配额
- **路由限流**: 每个路由独立的限流配额
- **用户限流**: 基于用户ID的限流

### 4. 响应缓存

为 GET 请求启用缓存：

```typescript
{
  path: '/api/v1/menus',
  target: 'http://localhost:3002',
  cache: {
    enabled: true,
    ttl: 300000 // 5分钟
  }
}
```

### 5. 熔断保护

配置熔断器参数：

```typescript
{
  path: '/api/v1/orders',
  target: 'http://localhost:3003',
  circuitBreaker: {
    enabled: true,
    threshold: 5,      // 失败阈值
    timeout: 60000     // 熔断超时
  }
}
```

## 📊 监控指标

### Prometheus 指标

| 指标名称 | 类型 | 说明 |
|---------|------|------|
| `gateway_requests_total` | Counter | 请求总数 |
| `gateway_request_duration_seconds` | Histogram | 请求持续时间 |
| `gateway_errors_total` | Counter | 错误总数 |
| `gateway_circuit_breaker_state` | Gauge | 熔断器状态 |
| `gateway_cache_hits_total` | Counter | 缓存命中数 |

### Grafana 仪表盘

访问 http://localhost:3000 查看 Grafana 仪表盘。

## 🔧 API 文档

### 健康检查

**GET** `/api/v1/health`

响应示例：

```json
{
  "status": "healthy",
  "timestamp": "2025-01-30T00:00:00.000Z",
  "version": "1.0.0",
  "service": "yyc3-gateway",
  "uptime": 3600
}
```

### 路由信息

**GET** `/api/v1/routes`

响应示例：

```json
{
  "success": true,
  "data": [
    {
      "path": "/api/v1/users",
      "target": "http://localhost:3001",
      "methods": ["GET", "POST", "PUT", "DELETE"],
      "authentication": true,
      "rateLimit": {
        "maxRequests": 50,
        "windowMs": 60000
      }
    }
  ]
}
```

### 服务状态

**GET** `/api/v1/services`

响应示例：

```json
{
  "success": true,
  "data": {
    "http://localhost:3001": {
      "status": "healthy",
      "lastCheck": "2025-01-30T00:00:00.000Z"
    }
  }
}
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 代码检查
pnpm lint

# 类型检查
pnpm typecheck
```

## 📊 性能指标

- **请求处理延迟**: < 10ms
- **并发处理能力**: > 10000 请求/秒
- **内存占用**: < 200MB
- **CPU 使用率**: < 5%

## 🔒 安全性

- **JWT 认证**: 基于令牌的身份认证
- **Helmet**: HTTP 头安全防护
- **CORS**: 跨域资源共享控制
- **限流保护**: 防止 DDoS 攻击
- **数据加密**: 支持请求数据加密

## 📝 配置说明

### 认证配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `enabled` | 是否启用认证 | true |
| `jwt.secret` | JWT 密钥 | - |
| `jwt.algorithms` | JWT 算法 | ['HS256'] |
| `excludePaths` | 排除路径 | ['/api/v1/health'] |

### 限流配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `enabled` | 是否启用限流 | true |
| `windowMs` | 时间窗口 | 60000 |
| `maxRequests` | 最大请求数 | 100 |
| `strategy` | 限流策略 | 'fixed' |

### 缓存配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `enabled` | 是否启用缓存 | true |
| `type` | 缓存类型 | 'redis' |
| `ttl` | 缓存过期时间 | 300000 |

## 🐛 故障排查

### 问题1: 无法连接到后端服务

**症状**: 代理请求返回 502 错误

**解决方案**:
1. 检查后端服务是否正常运行
2. 验证路由配置中的 target 地址是否正确
3. 查看网关日志获取详细错误信息

### 问题2: 认证失败

**症状**: 返回 401 Unauthorized

**解决方案**:
1. 检查 JWT token 是否有效
2. 验证 JWT_SECRET 配置是否正确
3. 确认请求路径不在 excludePaths 中

### 问题3: 限流触发

**症状**: 返回 429 Too Many Requests

**解决方案**:
1. 调整限流配置的 maxRequests 参数
2. 将客户端 IP 添加到白名单
3. 实现指数退避重试机制

## 📚 更多资源

- [Express 官方文档](https://expressjs.com/)
- [http-proxy-middleware 文档](https://github.com/chimurai/http-proxy-middleware)
- [Redis 官方文档](https://redis.io/docs/)
- [Consul 官方文档](https://www.consul.io/docs)
- [YYC³ 团队规范文档](../../../docs/YYC³团队标准化规范文档.md)

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📄 文档标尾 (Footer)

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
