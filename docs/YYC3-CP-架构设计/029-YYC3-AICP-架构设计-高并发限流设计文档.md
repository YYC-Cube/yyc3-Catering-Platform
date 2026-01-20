---
@file: 029-YYC3-AICP-架构设计-高并发限流设计文档.md
@description: YYC3-AICP 高并发场景下的限流、熔断、降级方案，保障系统高可用与稳定性
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [架构设计],[高并发],[限流熔断]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 029-YYC3-AICP-架构设计-高并发限流设计文档

## 概述

本文档详细描述YYC3-YYC3-AICP-架构设计-高并发限流设计文档相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范高并发限流设计文档相关的业务标准与技术落地要求
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

### 3. 高并发限流设计文档

#### 3.1 高并发限流架构设计

##### 3.1.1 架构概述

高并发限流系统采用多层级限流策略，从接入层到应用层全面保护系统：

- **接入层限流**：在 Nginx/网关层进行初步限流，过滤恶意流量
- **应用层限流**：在应用服务层进行细粒度限流，保护核心服务
- **分布式限流**：使用 Redis 实现跨实例的分布式限流
- **熔断降级**：当服务异常时自动熔断，提供降级方案

##### 3.1.2 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端请求 (Client)                         │
└───────────────────────────┬───────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                      接入层限流 (Gateway Layer)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Nginx / API Gateway                                        │ │
│  │  - IP 限流                                                   │ │
│  │  - 连接数限流                                                 │ │
│  │  - 请求速率限流                                               │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────┼───────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                    应用层限流 (Application Layer)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  订单服务    │  │  用户服务    │  │  支付服务    │          │
│  │  - 接口限流  │  │  - 接口限流  │  │  - 接口限流  │          │
│  │  - 用户限流  │  │  - 用户限流  │  │  - 用户限流  │          │
│  │  - 熔断降级  │  │  - 熔断降级  │  │  - 熔断降级  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                       │
│                    ┌──────▼──────┐                               │
│                    │  限流中间件  │                               │
│                    └──────┬──────┘                               │
└───────────────────────────┼───────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                  分布式限流 (Distributed Layer)                   │
│                    ┌──────▼──────┐                               │
│                    │    Redis    │                               │
│                    │  - 计数器   │                               │
│                    │  - 令牌桶   │                               │
│                    │  - 漏桶     │                               │
│                    └──────┬──────┘                               │
└───────────────────────────┼───────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                    监控告警 (Monitoring Layer)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Prometheus  │  │  Grafana    │  │ AlertManager│          │
│  │  指标采集    │  │  可视化展示  │  │  告警通知    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

##### 3.1.3 核心组件

1. **Nginx 限流模块**
   - `limit_req`：基于请求速率的限流
   - `limit_conn`：基于连接数的限流
   - `limit_req_zone`：限流区域配置

2. **应用层限流中间件**
   - 接口级别限流
   - 用户级别限流
   - IP 级别限流

3. **Redis 分布式限流**
   - 基于计数器的限流
   - 基于令牌桶的限流
   - 基于漏桶的限流

4. **熔断器**
   - 状态管理（关闭、打开、半开）
   - 熔断规则配置
   - 自动恢复机制

5. **降级策略**
   - 静态降级
   - 动态降级
   - 自动降级

#### 3.2 限流算法设计

##### 3.2.1 固定窗口算法

**原理**：将时间划分为固定大小的窗口，统计每个窗口内的请求数量。

**优点**：
- 实现简单
- 内存占用小

**缺点**：
- 边界效应（窗口边界可能出现突发流量）
- 限流不够平滑

**实现**：

```typescript
class FixedWindowRateLimiter {
  private counters: Map<string, number> = new Map();
  private lastResetTime: Map<string, number> = new Map();
  
  constructor(
    private readonly windowSize: number, // 窗口大小（毫秒）
    private readonly maxRequests: number  // 最大请求数
  ) {}
  
  allow(key: string): boolean {
    const now = Date.now();
    const lastReset = this.lastResetTime.get(key) || 0;
    
    if (now - lastReset >= this.windowSize) {
      this.counters.set(key, 0);
      this.lastResetTime.set(key, now);
    }
    
    const count = (this.counters.get(key) || 0) + 1;
    
    if (count > this.maxRequests) {
      return false;
    }
    
    this.counters.set(key, count);
    return true;
  }
  
  reset(key: string): void {
    this.counters.delete(key);
    this.lastResetTime.delete(key);
  }
}
```

##### 3.2.2 滑动窗口算法

**原理**：将时间划分为更小的滑动窗口，统计滑动窗口内的请求数量。

**优点**：
- 限流更平滑
- 无边界效应

**缺点**：
- 实现较复杂
- 内存占用较大

**实现**：

```typescript
class SlidingWindowRateLimiter {
  private windows: Map<string, number[]> = new Map();
  
  constructor(
    private readonly windowSize: number, // 窗口大小（毫秒）
    private readonly maxRequests: number  // 最大请求数
  ) {}
  
  allow(key: string): boolean {
    const now = Date.now();
    const timestamps = this.windows.get(key) || [];
    
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.windowSize
    );
    
    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.windows.set(key, validTimestamps);
    return true;
  }
  
  reset(key: string): void {
    this.windows.delete(key);
  }
}
```

##### 3.2.3 漏桶算法

**原理**：请求以恒定速率流出，超出容量的请求被丢弃。

**优点**：
- 平滑流量
- 防止突发流量

**缺点**：
- 无法应对突发流量
- 可能丢失请求

**实现**：

```typescript
class LeakyBucketRateLimiter {
  private buckets: Map<string, Bucket> = new Map();
  
  constructor(
    private readonly capacity: number,      // 桶容量
    private readonly leakRate: number       // 漏水速率（请求/秒）
  ) {}
  
  allow(key: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key) || {
      water: 0,
      lastLeak: now
    };
    
    const timePassed = (now - bucket.lastLeak) / 1000;
    const leaked = Math.min(bucket.water, timePassed * this.leakRate);
    bucket.water -= leaked;
    bucket.lastLeak = now;
    
    if (bucket.water < this.capacity) {
      bucket.water += 1;
      this.buckets.set(key, bucket);
      return true;
    }
    
    return false;
  }
  
  reset(key: string): void {
    this.buckets.delete(key);
  }
}

interface Bucket {
  water: number;
  lastLeak: number;
}
```

##### 3.2.4 令牌桶算法

**原理**：以恒定速率向桶中添加令牌，请求需要获取令牌才能通过。

**优点**：
- 可以应对突发流量
- 限流平滑

**缺点**：
- 实现较复杂
- 需要维护令牌状态

**实现**：

```typescript
class TokenBucketRateLimiter {
  private buckets: Map<string, Bucket> = new Map();
  
  constructor(
    private readonly capacity: number,      // 桶容量
    private readonly refillRate: number    // 填充速率（令牌/秒）
  ) {}
  
  allow(key: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key) || {
      tokens: this.capacity,
      lastRefill: now
    };
    
    const timePassed = (now - bucket.lastRefill) / 1000;
    const refilled = Math.min(
      this.capacity - bucket.tokens,
      timePassed * this.refillRate
    );
    bucket.tokens += refilled;
    bucket.lastRefill = now;
    
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(key, bucket);
      return true;
    }
    
    return false;
  }
  
  reset(key: string): void {
    this.buckets.delete(key);
  }
}
```

#### 3.3 熔断降级设计

##### 3.3.1 熔断机制

熔断器有三种状态：

1. **关闭状态（Closed）**
   - 正常处理请求
   - 记录失败率
   - 失败率超过阈值时打开熔断器

2. **打开状态（Open）**
   - 拒绝所有请求
   - 等待冷却时间
   - 冷却时间结束后进入半开状态

3. **半开状态（Half-Open）**
   - 允许部分请求通过
   - 如果请求成功，关闭熔断器
   - 如果请求失败，重新打开熔断器

##### 3.3.2 熔断器实现

```typescript
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerConfig {
  failureThreshold: number;      // 失败阈值
  successThreshold: number;      // 成功阈值（半开状态）
  timeout: number;               // 超时时间（毫秒）
  resetTimeout: number;          // 重置超时（毫秒）
}

class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  
  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig
  ) {}
  
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        if (fallback) {
          return fallback();
        }
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
      this.state = CircuitBreakerState.HALF_OPEN;
      this.successCount = 0;
    }
    
    try {
      const result = await Promise.race([
        fn(),
        this.timeoutPromise(this.config.timeout)
      ]);
      
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }
  
  private onSuccess(): void {
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    }
  }
  
  private timeoutPromise<T>(timeout: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'));
      }, timeout);
    });
  }
  
  getState(): CircuitBreakerState {
    return this.state;
  }
  
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }
}
```

##### 3.3.3 降级策略

1. **静态降级**
   - 返回默认值
   - 返回缓存数据
   - 返回错误提示

2. **动态降级**
   - 根据系统负载动态调整
   - 根据用户等级动态调整
   - 根据业务优先级动态调整

3. **自动降级**
   - 熔断器自动触发
   - 限流自动触发
   - 超时自动触发

**降级实现**：

```typescript
class FallbackStrategy {
  private fallbackCache: Map<string, any> = new Map();
  
  async executeWithFallback<T>(
    key: string,
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await fn();
      this.fallbackCache.set(key, result);
      return result;
    } catch (error) {
      if (fallback) {
        return fallback();
      }
      
      const cached = this.fallbackCache.get(key);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }
  
  async executeWithDefault<T>(
    fn: () => Promise<T>,
    defaultValue: T
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      return defaultValue;
    }
  }
  
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.sleep(delay * (i + 1));
        }
      }
    }
    
    throw lastError;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 3.4 分布式限流实现

##### 3.4.1 Redis 分布式限流

**基于计数器的限流**：

```typescript
class RedisRateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly windowSize: number,
    private readonly maxRequests: number
  ) {}
  
  async allow(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    const pipeline = this.redis.pipeline();
    
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.pexpire(key, this.windowSize);
    
    const results = await pipeline.exec();
    const count = results![1][1] as number;
    
    if (count >= this.maxRequests) {
      return false;
    }
    
    return true;
  }
  
  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

**基于令牌桶的限流**：

```typescript
class RedisTokenBucket {
  constructor(
    private readonly redis: Redis,
    private readonly capacity: number,
    private readonly refillRate: number
  ) {}
  
  async allow(key: string): Promise<boolean> {
    const now = Date.now();
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      
      local bucket = redis.call('hmget', key, 'tokens', 'lastRefill')
      local tokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now
      
      local timePassed = (now - lastRefill) / 1000
      local refilled = math.min(capacity - tokens, timePassed * refillRate)
      tokens = tokens + refilled
      
      if tokens >= 1 then
        tokens = tokens - 1
        redis.call('hmset', key, 'tokens', tokens, 'lastRefill', now)
        redis.call('expire', key, 3600)
        return 1
      else
        redis.call('hmset', key, 'tokens', tokens, 'lastRefill', now)
        redis.call('expire', key, 3600)
        return 0
      end
    `;
    
    const result = await this.redis.eval(script, {
      keys: [key],
      arguments: [this.capacity, this.refillRate, now]
    });
    
    return result === 1;
  }
}
```

##### 3.4.2 Nginx 限流配置

```nginx
http {
    # 定义限流区域
    limit_req_zone $binary_remote_addr zone=ip_limit:10m rate=10r/s;
    limit_req_zone $request_uri zone=uri_limit:10m rate=100r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    
    server {
        # IP 限流
        limit_req zone=ip_limit burst=20 nodelay;
        
        # URI 限流
        limit_req zone=uri_limit burst=50 nodelay;
        
        # 连接数限流
        limit_conn conn_limit 10;
        
        # 限流响应
        limit_req_status 429;
        limit_conn_status 429;
        
        location /api/ {
            # 自定义限流响应
            limit_req_status 429;
            error_page 429 = @rate_limited;
        }
        
        location @rate_limited {
            default_type application/json;
            return 429 '{"error": "Too Many Requests"}';
        }
    }
}
```

##### 3.4.3 应用层限流中间件

```typescript
class RateLimitMiddleware {
  private limiters: Map<string, RateLimiter> = new Map();
  
  constructor(private readonly config: RateLimitConfig) {}
  
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.generateKey(req);
      const limiter = this.getLimiter(key);
      
      if (!limiter.allow()) {
        return res.status(429).json({
          error: 'Too Many Requests',
          retryAfter: limiter.getRetryAfter()
        });
      }
      
      next();
    };
  }
  
  private generateKey(req: Request): string {
    const ip = req.ip;
    const path = req.path;
    const userId = req.user?.id;
    
    if (userId) {
      return `user:${userId}:${path}`;
    }
    
    return `ip:${ip}:${path}`;
  }
  
  private getLimiter(key: string): RateLimiter {
    if (!this.limiters.has(key)) {
      const limiter = new SlidingWindowRateLimiter(
        this.config.windowSize,
        this.config.maxRequests
      );
      this.limiters.set(key, limiter);
    }
    
    return this.limiters.get(key)!;
  }
}

interface RateLimitConfig {
  windowSize: number;
  maxRequests: number;
}
```

#### 3.5 监控与告警

##### 3.5.1 限流指标监控

```typescript
class RateLimitMetrics {
  private metrics: Map<string, Metric> = new Map();
  
  record(key: string, allowed: boolean): void {
    const metric = this.metrics.get(key) || {
      total: 0,
      allowed: 0,
      denied: 0
    };
    
    metric.total++;
    if (allowed) {
      metric.allowed++;
    } else {
      metric.denied++;
    }
    
    this.metrics.set(key, metric);
  }
  
  getMetrics(key: string): Metric | undefined {
    return this.metrics.get(key);
  }
  
  getAllMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }
  
  reset(key?: string): void {
    if (key) {
      this.metrics.delete(key);
    } else {
      this.metrics.clear();
    }
  }
}

interface Metric {
  total: number;
  allowed: number;
  denied: number;
}
```

##### 3.5.2 熔断状态监控

```typescript
class CircuitBreakerMetrics {
  private states: Map<string, CircuitBreakerState> = new Map();
  private failureCounts: Map<string, number> = new Map();
  
  recordState(name: string, state: CircuitBreakerState): void {
    this.states.set(name, state);
  }
  
  recordFailure(name: string): void {
    const count = this.failureCounts.get(name) || 0;
    this.failureCounts.set(name, count + 1);
  }
  
  getState(name: string): CircuitBreakerState | undefined {
    return this.states.get(name);
  }
  
  getFailureCount(name: string): number {
    return this.failureCounts.get(name) || 0;
  }
  
  getAllStates(): Map<string, CircuitBreakerState> {
    return new Map(this.states);
  }
}
```

##### 3.5.3 告警规则配置

```yaml
groups:
  - name: rate_limit_alerts
    rules:
      - alert: HighRateLimitDenials
        expr: |
          sum(rate(rate_limit_denials_total[5m])) 
          / sum(rate(rate_limit_total[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "限流拒绝率过高"
          description: "限流拒绝率超过 10%"
      
      - alert: CircuitBreakerOpen
        expr: circuit_breaker_state == 1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "熔断器打开"
          description: "服务 {{ $labels.service }} 熔断器已打开"
      
      - alert: HighFailureRate
        expr: |
          sum(rate(circuit_breaker_failures_total[5m])) 
          / sum(rate(circuit_breaker_requests_total[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "失败率过高"
          description: "服务 {{ $labels.service }} 失败率超过 50%"
```

#### 3.6 最佳实践

##### 3.6.1 限流策略配置

1. **分层限流**
   - 接入层：粗粒度限流，保护整个系统
   - 应用层：细粒度限流，保护核心服务
   - 数据层：连接池限流，保护数据库

2. **动态调整**
   - 根据系统负载动态调整限流阈值
   - 根据业务优先级动态调整限流策略
   - 根据用户等级动态调整限流配额

3. **优雅降级**
   - 限流时返回友好的错误提示
   - 提供降级方案，保证核心功能可用
   - 记录限流日志，便于后续分析

##### 3.6.2 熔断降级配置

1. **合理设置阈值**
   - 失败阈值：根据业务容忍度设置
   - 超时时间：根据接口响应时间设置
   - 重置时间：根据恢复速度设置

2. **提供降级方案**
   - 返回缓存数据
   - 返回默认值
   - 返回错误提示

3. **监控熔断状态**
   - 实时监控熔断器状态
   - 及时发现异常
   - 快速响应问题

##### 3.6.3 性能优化

1. **减少锁竞争**
   - 使用无锁算法
   - 使用分段锁
   - 使用乐观锁

2. **减少网络开销**
   - 使用本地缓存
   - 批量处理请求
   - 压缩传输数据

3. **异步处理**
   - 异步记录指标
   - 异步发送告警
   - 异步清理数据

### 4. 实施计划

#### 4.1 阶段一：基础设施搭建（1-2 周）

- 部署 Redis 集群
- 配置 Nginx 限流
- 部署监控系统
- 配置告警规则

#### 4.2 阶段二：核心服务接入（2-3 周）

- 接入订单服务限流
- 接入用户服务限流
- 接入支付服务限流
- 配置熔断降级策略

#### 4.3 阶段三：全面推广（3-4 周）

- 接入所有微服务
- 完善限流策略
- 培训开发团队
- 建立运维流程

#### 4.4 阶段四：优化完善（持续）

- 优化限流算法
- 优化性能
- 完善告警规则
- 持续改进

### 5. 监控指标

#### 5.1 限流指标

- **限流总量**：被限流的请求总数
- **限流率**：被限流请求占总请求的比例
- **限流响应时间**：限流判断的响应时间
- **限流分布**：按接口、用户、IP 分布

#### 5.2 熔断指标

- **熔断次数**：熔断器打开的次数
- **熔断时长**：熔断器打开的时长
- **失败率**：请求失败率
- **恢复时间**：从熔断到恢复的时间

#### 5.3 降级指标

- **降级次数**：触发降级的次数
- **降级率**：降级请求占总请求的比例
- **降级响应时间**：降级请求的响应时间
- **降级成功率**：降级请求的成功率

### 6. 附录

#### 6.1 术语表

| 术语 | 说明 |
|------|------|
| 限流 | 限制请求的速率 |
| 熔断 | 当服务异常时自动切断请求 |
| 降级 | 当服务不可用时提供替代方案 |
| 固定窗口 | 固定时间窗口的限流算法 |
| 滑动窗口 | 滑动时间窗口的限流算法 |
| 漏桶 | 基于漏桶的限流算法 |
| 令牌桶 | 基于令牌桶的限流算法 |
| 熔断器 | 实现熔断机制的组件 |

#### 6.2 参考资料

- [Nginx 限流文档](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)
- [Redis 限流最佳实践](https://redis.io/docs/manual/patterns/distributed-locks/)
- [Hystrix 熔断器](https://github.com/Netflix/Hystrix)
- [Sentinel 限流熔断](https://github.com/alibaba/Sentinel)

#### 6.3 相关文档

- [024-YYC3-AICP-架构设计-数据库设计文档.md](./024-YYC3-AICP-架构设计-数据库设计文档.md)
- [025-YYC3-AICP-架构设计-安全架构设计文档.md](./025-YYC3-AICP-架构设计-安全架构设计文档.md)
- [026-YYC3-AICP-架构设计-微服务拆分设计文档.md](./026-YYC3-AICP-架构设计-微服务拆分设计文档.md)
- [027-YYC3-AICP-架构设计-缓存架构设计文档.md](./027-YYC3-AICP-架构设计-缓存架构设计文档.md)
- [028-YYC3-AICP-架构设计-分布式链路设计文档.md](./028-YYC3-AICP-架构设计-分布式链路设计文档.md)

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
