# 🔖 YYC³ Redis缓存服务

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

## 📋 文档信息

| 属性 | 内容 |
|------|------|
| **服务名称** | YYC³ Redis缓存服务 |
| **版本** | 1.0.0 |
| **创建时间** | 2025-01-30 |
| **作者** | YYC³ Team |
| **许可证** | MIT |

---

## 📖 概述

YYC³ Redis缓存服务是一个高性能、功能丰富的Redis缓存客户端，专为餐饮平台设计。它提供了多种缓存策略、分层缓存、缓存预热、分布式锁等高级功能，帮助开发者轻松实现高效的缓存管理。

### 核心特性

- ✅ **多种缓存策略**：支持LRU、LFU、TTL、标签和分层缓存策略
- ✅ **分层缓存**：支持多级缓存，自动提升热点数据
- ✅ **缓存预热**：支持批量预热缓存，提升系统启动性能
- ✅ **分布式锁**：基于Redis实现的分布式锁机制
- ✅ **装饰器支持**：提供装饰器简化缓存操作
- ✅ **标签管理**：支持按标签批量失效缓存
- ✅ **统计监控**：提供详细的缓存统计信息
- ✅ **类型安全**：完整的TypeScript类型定义
- ✅ **日志记录**：集成Winston日志系统
- ✅ **连接池管理**：自动管理Redis连接

---

## 🏗️ 技术架构

### 技术栈

- **Redis**: 7.0+
- **ioredis**: 5.3.2
- **TypeScript**: 5.3.3
- **Winston**: 3.11.0
- **Lodash**: 4.17.21

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              缓存策略管理器 (CacheStrategyManager)            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   LRU   │  │   LFU   │  │   TTL   │  │  Tagged │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            分层缓存管理器 (HierarchicalCacheManager)         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   L1 Cache  │  │   L2 Cache  │  │   L3 Cache  │          │
│  │  (Memory)   │  │  (Redis)    │  │  (Database) │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            Redis缓存客户端 (RedisCacheClient)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 连接池管理   │  │ 缓存操作    │  │ 标签管理    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Redis Server                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 安装依赖

```bash
cd backend/services/redis-cache
pnpm install
```

### 基础使用

```typescript
import { createCacheClient } from '@yyc3/redis-cache';

// 初始化缓存客户端
const cacheClient = await createCacheClient({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  db: 0,
});

// 设置缓存
await cacheClient.set('user:123', { name: '张三', age: 30 }, { ttl: 3600 });

// 获取缓存
const user = await cacheClient.get('user:123');
console.log(user); // { name: '张三', age: 30 }

// 删除缓存
await cacheClient.delete('user:123');

// 关闭连接
await cacheClient.disconnect();
```

### 使用缓存策略

```typescript
import { createCacheClient, createCacheStrategyManager } from '@yyc3/redis-cache';

const cacheClient = await createCacheClient({
  host: 'localhost',
  port: 6379,
});

// 创建TTL策略管理器
const strategyManager = createCacheStrategyManager(cacheClient, 'ttl');

// 使用策略获取缓存
const user = await strategyManager.get('user:123', async () => {
  // 缓存未命中时，从数据库加载
  return await database.getUser('123');
}, { ttl: 3600 });

console.log(user);
```

### 使用装饰器

```typescript
import { Cacheable, CacheEvict, createCacheClient, createCacheKeyGenerator } from '@yyc3/redis-cache';

const cacheClient = await createCacheClient({ host: 'localhost', port: 6379 });
const keyGenerator = createCacheKeyGenerator({ prefix: 'yyc3' });

class UserService {
  @Cacheable(cacheClient, keyGenerator, { ttl: 3600, keyPrefix: 'user' })
  async getUser(userId: string) {
    // 这个方法的结果会被缓存
    return await database.getUser(userId);
  }

  @CacheEvict(cacheClient, keyGenerator, { keyPrefix: 'user' })
  async updateUser(userId: string, data: any) {
    // 更新用户后，清除相关缓存
    return await database.updateUser(userId, data);
  }
}
```

---

## 📚 使用指南

### 1. 缓存策略

#### TTL策略（基于时间的过期）

```typescript
const ttlManager = createCacheStrategyManager(cacheClient, 'ttl', {
  defaultTTL: 3600, // 默认1小时
  refreshThreshold: 0.2, // TTL剩余20%时自动刷新
});

// 自动刷新缓存
const data = await ttlManager.get('key', async () => {
  return await fetchData();
});
```

#### LRU策略（最近最少使用）

```typescript
const lruManager = createCacheStrategyManager(cacheClient, 'lru', {
  maxSize: 10000, // 最大缓存10000个键
});

// LRU自动淘汰最久未使用的数据
await lruManager.set('key', data);
```

#### LFU策略（最不经常使用）

```typescript
const lfuManager = createCacheStrategyManager(cacheClient, 'lfu', {
  maxSize: 10000,
});

// LFU自动淘汰访问频率最低的数据
await lfuManager.set('key', data);
```

#### 标签策略

```typescript
// 设置带标签的缓存
await cacheClient.set('user:123', userData, {
  tags: ['user', 'profile'],
});

// 按标签批量删除
await cacheClient.deleteByTags(['user']);
```

### 2. 分层缓存

```typescript
import { createHierarchicalCacheManager } from '@yyc3/redis-cache';

const hierarchicalManager = createHierarchicalCacheManager();

// 添加L1缓存（内存）
hierarchicalManager.addLevel('L1', { strategy: 'lru', maxSize: 1000 }, l1CacheClient);

// 添加L2缓存（Redis）
hierarchicalManager.addLevel('L2', { strategy: 'ttl', defaultTTL: 3600 }, l2CacheClient);

// 自动从L1 -> L2 -> 数据库查找
const data = await hierarchicalManager.get('key', async () => {
  return await database.get('key');
});
```

### 3. 缓存预热

```typescript
// 预热热门菜品
const warmupConfig = {
  keys: ['dish:1', 'dish:2', 'dish:3'],
  loader: async (key) => {
    return await database.getDish(key.split(':')[1]);
  },
  concurrency: 5,
};

await strategyManager.warmup(warmupConfig);
```

### 4. 分布式锁

```typescript
import { createCacheLock, createCacheKeyGenerator } from '@yyc3/redis-cache';

const lock = createCacheLock(cacheClient, keyGenerator);

// 获取锁
const acquired = await lock.acquire('update-order:123', 30);
if (acquired) {
  try {
    // 执行需要加锁的操作
    await updateOrder('123');
  } finally {
    // 释放锁
    await lock.release('update-order:123');
  }
}

// 或者使用withLock自动管理锁
await lock.withLock('update-order:123', async () => {
  await updateOrder('123');
}, 30);
```

### 5. 缓存键生成

```typescript
import { createCacheKeyGenerator } from '@yyc3/redis-cache';

const keyGenerator = createCacheKeyGenerator({
  prefix: 'yyc3',
  separator: ':',
  version: 'v1',
});

// 生成用户缓存键
const userKey = keyGenerator.user('123', 'profile');
// yyc3:user:123:profile:v1

// 生成订单缓存键
const orderKey = keyGenerator.order('456', 'status');
// yyc3:order:456:status:v1

// 生成列表缓存键
const listKey = keyGenerator.list('dish', { page: 1, size: 10, category: 'hot' });
// yyc3:list:dish:abc123:v1
```

### 6. 缓存统计

```typescript
// 获取缓存统计信息
const stats = await strategyManager.getStatistics();
console.log(`
  命中率: ${(stats.hitRate * 100).toFixed(2)}%
  命中次数: ${stats.hits}
  未命中次数: ${stats.misses}
  淘汰次数: ${stats.evictions}
  缓存大小: ${stats.size}
  内存使用: ${stats.memoryUsage}
`);

// 重置统计信息
strategyManager.resetStatistics();
```

---

## 📊 监控指标

### 缓存性能指标

- **命中率 (Hit Rate)**: 缓存命中次数 / 总访问次数
- **响应时间 (Response Time)**: 缓存操作的平均响应时间
- **内存使用 (Memory Usage)**: Redis内存使用情况
- **键数量 (Key Count)**: 当前缓存的键数量
- **淘汰次数 (Evictions)**: 缓存淘汰的总次数

### 监控端点

```typescript
// 获取Prometheus格式的指标
const metrics = await cacheClient.getPrometheusMetrics();
console.log(metrics);
```

---

## 🔒 安全性

### 连接安全

```typescript
const cacheClient = await createCacheClient({
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD, // 使用环境变量
  db: 0,
  tls: {
    // 启用TLS加密
    rejectUnauthorized: true,
  },
});
```

### 键命名安全

```typescript
// 使用前缀避免键冲突
const keyGenerator = createCacheKeyGenerator({
  prefix: 'yyc3', // 项目前缀
  version: 'v1', // 版本号
});
```

---

## 🧪 测试

```bash
# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行集成测试
pnpm test:integration
```

### 测试示例

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createCacheClient } from '@yyc3/redis-cache';

describe('RedisCacheClient', () => {
  let cacheClient;

  beforeEach(async () => {
    cacheClient = await createCacheClient({
      host: 'localhost',
      port: 6379,
      db: 1, // 使用测试数据库
    });
  });

  afterEach(async () => {
    await cacheClient.flushAll();
    await cacheClient.disconnect();
  });

  it('应该成功设置和获取缓存', async () => {
    await cacheClient.set('test:key', 'test-value');
    const value = await cacheClient.get('test:key');
    expect(value).toBe('test-value');
  });

  it('应该正确处理TTL过期', async () => {
    await cacheClient.set('test:key', 'test-value', { ttl: 1 });
    const value1 = await cacheClient.get('test:key');
    expect(value1).toBe('test-value');

    await new Promise(resolve => setTimeout(resolve, 1100));
    const value2 = await cacheClient.get('test:key');
    expect(value2).toBeNull();
  });
});
```

---

## 📝 配置说明

### Redis配置

```typescript
interface RedisConfig {
  host: string;              // Redis主机地址
  port: number;              // Redis端口
  password?: string;         // Redis密码
  db?: number;               // 数据库编号
  tls?: any;                 // TLS配置
  keyPrefix?: string;        // 键前缀
  defaultTTL?: number;       // 默认TTL（秒）
  maxRetriesPerRequest?: number; // 最大重试次数
  lazyConnect?: boolean;     // 是否延迟连接
  keepAlive?: number;        // 保持连接时间（毫秒）
}
```

### 缓存策略配置

```typescript
interface CacheStrategyConfig {
  strategy: CacheStrategy;   // 策略类型
  maxSize?: number;          // 最大缓存数量
  maxMemory?: number;        // 最大内存使用（MB）
  defaultTTL?: number;       // 默认过期时间（秒）
  refreshThreshold?: number; // 刷新阈值（TTL的百分比）
}
```

---

## 🚨 故障排查

### 常见问题

#### 1. 连接失败

**问题**: 无法连接到Redis服务器

**解决方案**:
- 检查Redis服务是否运行: `redis-cli ping`
- 检查主机地址和端口配置
- 检查防火墙设置
- 检查密码是否正确

#### 2. 内存不足

**问题**: Redis内存使用过高

**解决方案**:
- 设置合理的`maxMemory`配置
- 使用LRU或LFU策略自动淘汰
- 定期清理过期数据
- 使用分层缓存减少Redis压力

#### 3. 缓存穿透

**问题**: 大量请求查询不存在的数据

**解决方案**:
- 使用布隆过滤器
- 缓存空值（设置较短的TTL）
- 使用互斥锁防止缓存击穿

#### 4. 缓存雪崩

**问题**: 大量缓存同时失效

**解决方案**:
- 设置随机的TTL偏移量
- 使用分层缓存
- 实现缓存预热机制

---

## 📈 性能优化

### 优化建议

1. **合理设置TTL**: 根据数据更新频率设置合适的过期时间
2. **使用批量操作**: 减少网络往返次数
3. **选择合适的策略**: 根据业务场景选择LRU、LFU或TTL策略
4. **监控缓存命中率**: 定期分析缓存效果，调整策略
5. **使用Pipeline**: 批量执行命令提升性能

### 性能基准

| 操作 | QPS | 延迟 (P99) |
|------|-----|-----------|
| SET | 100,000+ | < 1ms |
| GET | 150,000+ | < 1ms |
| MGET | 80,000+ | < 2ms |
| DELETE | 120,000+ | < 1ms |

---

## 🔗 资源链接

- **Redis官方文档**: https://redis.io/documentation
- **ioredis文档**: https://github.com/luin/ioredis
- **YYC³团队文档**: https://github.com/YYC-Cube/docs

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📄 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系我们

- **技术支持**: <admin@0379.email>
- **问题反馈**: GitHub Issues
- **文档更新**: <admin@0379.email>

---

## 📌 备注

1. **版本管理**: 本服务遵循语义化版本规范
2. **兼容性**: 支持Redis 7.0+版本
3. **生产环境**: 建议使用Redis Cluster或Sentinel保证高可用
4. **监控**: 建议集成Prometheus和Grafana进行监控

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
