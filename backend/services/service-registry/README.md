# 🔖 YYC³ 服务注册与发现模块

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

## 📋 概述

YYC³ 服务注册与发现模块是一个基于 Consul 的微服务注册中心，提供服务注册、服务发现、健康检查和负载均衡功能。该模块专为 YYC³ 团队的微服务架构设计，支持多种负载均衡策略，具有高可用性和高性能特点。

## ✨ 核心特性

- **服务注册**: 自动将微服务注册到 Consul 注册中心
- **服务发现**: 动态发现和查询服务实例
- **健康检查**: 自动检测服务健康状态，剔除不健康实例
- **负载均衡**: 支持多种负载均衡策略（随机、轮询、最少连接、加权）
- **服务缓存**: 本地缓存服务实例，减少 Consul 查询
- **自动重试**: 服务调用失败时自动重试
- **优雅关闭**: 支持服务优雅关闭和注销
- **批量管理**: 支持批量注册和管理多个服务

## 🏗️ 技术架构

### 核心组件

1. **ConsulClient**: Consul 客户端，与 Consul 服务器通信
2. **ServiceRegistryManager**: 服务注册管理器，管理服务生命周期
3. **ServiceDiscoveryClient**: 服务发现客户端，提供服务发现和负载均衡

### 负载均衡策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| random | 随机选择实例 | 实例性能相近 |
| round-robin | 轮询选择实例 | 需要均匀分配请求 |
| least-connections | 最少连接选择实例 | 请求处理时间差异大 |
| weighted | 加权选择实例 | 实例性能不同 |

## 🚀 快速开始

### 安装依赖

```bash
cd backend/services/service-registry
pnpm install
```

### 环境配置

创建 `.env` 文件：

```env
# Consul 配置
CONSUL_HOST=localhost
CONSUL_PORT=8500
CONSUL_TOKEN=your-consul-token
CONSUL_SECURE=false
```

### 构建项目

```bash
pnpm build
```

### 运行示例

```bash
pnpm example
```

## 📖 使用指南

### 1. 服务注册

```typescript
import { initServiceRegistry } from '@yyc3/service-registry';

const success = await initServiceRegistry({
  id: 'order-service-1',
  name: 'order-service',
  address: '192.168.1.100',
  port: 3001,
  tags: ['microservice', 'order'],
  meta: {
    version: '1.0.0',
    environment: 'production',
  },
  check: {
    http: 'http://192.168.1.100:3001/health',
    interval: '10s',
    timeout: '5s',
  },
});
```

### 2. 服务发现

```typescript
import { initServiceDiscovery } from '@yyc3/service-registry';

// 初始化服务发现客户端
const discoveryClient = initServiceDiscovery('user-service', 'round-robin');

// 获取服务实例
const instance = await discoveryClient.getInstance();
console.log('服务实例:', instance);

// 调用服务
const userData = await discoveryClient.callService('/api/users/123', {
  method: 'GET',
});
console.log('用户数据:', userData);
```

### 3. 快速调用服务

```typescript
import { callService } from '@yyc3/service-registry';

// 快速调用服务
const result = await callService('product-service', '/api/products', {
  method: 'GET',
});
console.log('产品列表:', result);
```

### 4. 完整示例：订单服务

```typescript
import { initServiceDiscovery, callService } from '@yyc3/service-registry';

class OrderService {
  private discoveryClient = initServiceDiscovery('user-service', 'least-connections');

  async createOrder(userId: string, productIds: string[]) {
    // 1. 验证用户
    const user = await this.discoveryClient.callService(
      `/api/users/${userId}`,
      { method: 'GET' }
    );

    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 获取产品信息
    const products = await callService('product-service', '/api/products', {
      method: 'POST',
      body: JSON.stringify({ ids: productIds }),
      headers: { 'Content-Type': 'application/json' },
    });

    // 3. 创建订单
    const order = {
      id: `order-${Date.now()}`,
      userId,
      products,
      totalAmount: products.reduce((sum: number, p: any) => sum + p.price, 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return order;
  }
}
```

## 🔧 API 文档

### ServiceRegistryManager

| 方法 | 说明 | 参数 |
|------|------|------|
| `registerService` | 注册服务 | `config: ServiceConfig` |
| `deregisterService` | 注销服务 | `serviceId: string` |
| `updateService` | 更新服务 | `serviceId: string, updates: Partial<ServiceConfig>` |
| `checkServiceHealth` | 检查服务健康状态 | `serviceId: string` |
| `getRegisteredServices` | 获取已注册服务列表 | - |
| `registerServices` | 批量注册服务 | `configs: ServiceConfig[]` |
| `deregisterAllServices` | 注销所有服务 | - |
| `shutdown` | 优雅关闭 | - |

### ServiceDiscoveryClient

| 方法 | 说明 | 参数 |
|------|------|------|
| `discover` | 发现服务实例 | - |
| `getInstance` | 获取单个实例（负载均衡） | - |
| `callService` | 调用服务 | `path: string, options: RequestInit` |
| `clearCache` | 清除缓存 | - |
| `getStats` | 获取统计信息 | - |
| `close` | 关闭客户端 | - |

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

## 📊 性能指标

- **服务注册延迟**: < 100ms
- **服务发现延迟**: < 50ms（缓存命中）
- **健康检查间隔**: 10秒（可配置）
- **缓存TTL**: 30秒（可配置）
- **最大并发连接**: 1000+

## 🔒 安全性

- 支持 Consul ACL Token 认证
- 支持 HTTPS/TLS 加密通信
- 服务元数据加密存储
- 健康检查端点保护

## 📝 配置说明

### Consul 配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `CONSUL_HOST` | Consul 服务器地址 | localhost |
| `CONSUL_PORT` | Consul 服务器端口 | 8500 |
| `CONSUL_TOKEN` | Consul ACL Token | - |
| `CONSUL_SECURE` | 是否使用 HTTPS | false |

### 服务注册配置

| 配置项 | 说明 | 必填 |
|--------|------|------|
| `id` | 服务ID | 是 |
| `name` | 服务名称 | 是 |
| `address` | 服务地址 | 是 |
| `port` | 服务端口 | 是 |
| `tags` | 服务标签 | 否 |
| `meta` | 服务元数据 | 否 |
| `check` | 健康检查配置 | 否 |

### 服务发现配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `strategy` | 负载均衡策略 | random |
| `cacheTTL` | 缓存TTL（毫秒） | 30000 |
| `healthCheckInterval` | 健康检查间隔（毫秒） | 10000 |
| `retryCount` | 重试次数 | 3 |
| `retryDelay` | 重试延迟（毫秒） | 1000 |

## 🐛 故障排查

### 问题1: 服务注册失败

**症状**: 服务注册返回 false

**解决方案**:
1. 检查 Consul 服务器是否正常运行
2. 验证 Consul 连接配置是否正确
3. 检查服务ID是否已存在
4. 查看日志获取详细错误信息

### 问题2: 服务发现返回空列表

**症状**: `discover()` 返回空数组

**解决方案**:
1. 确认服务已成功注册
2. 检查服务健康检查是否通过
3. 验证服务名称是否正确
4. 清除缓存重试

### 问题3: 服务调用超时

**症状**: `callService()` 超时

**解决方案**:
1. 检查目标服务是否正常运行
2. 增加重试次数和延迟
3. 检查网络连接
4. 查看服务日志

## 📚 更多资源

- [Consul 官方文档](https://www.consul.io/docs)
- [微服务架构最佳实践](https://microservices.io/patterns/microservices.html)
- [YYC³ 团队规范文档](../../../../../docs/YYC³团队标准化规范文档.md)

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
