---
@file: 027-YYC3-AICP-架构设计-缓存架构设计文档.md
@description: YYC3-AICP 缓存策略、缓存层级、缓存失效处理的设计方案，提升系统性能
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [架构设计],[缓存设计],[性能优化]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 027-YYC3-AICP-架构设计-缓存架构设计文档

## 概述

本文档详细描述YYC3-YYC3-AICP-架构设计-缓存架构设计文档相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范缓存架构设计文档相关的业务标准与技术落地要求
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

### 3. 缓存架构设计文档

#### 3.1 缓存架构概述

##### 3.1.1 缓存层次结构

**多级缓存架构**
```
┌─────────────────────────────────────────────────────────┐
│                    应用层                               │
├─────────────────────────────────────────────────────────┤
│  本地缓存（L1）      │  分布式缓存（L2）      │  数据库  │
│  ┌──────────────┐   │  ┌──────────────┐   │  ┌──────┐ │
│  │  应用内存    │   │  │  Redis       │   │  │  PG  │ │
│  │  Caffeine    │   │  │  Cluster     │   │  │      │ │
│  └──────────────┘   │  └──────────────┘   │  └──────┘ │
└─────────────────────────────────────────────────────────┘
```

**缓存层级说明：**
- **L1缓存（本地缓存）**：应用进程内缓存，访问速度最快，容量有限
- **L2缓存（分布式缓存）**：跨应用实例共享，容量较大，访问速度中等
- **L3缓存（数据库）**：持久化存储，容量最大，访问速度最慢

##### 3.1.2 缓存选型

**本地缓存选型：Caffeine**
```typescript
import Caffeine from 'caffeine';

interface CacheConfig {
  maximumSize: number;
  expireAfterWrite: number;
  expireAfterAccess: number;
  recordStats: boolean;
}

class LocalCache<T> {
  private cache: any;
  
  constructor(config: CacheConfig) {
    this.cache = Caffeine.newBuilder()
      .maximumSize(config.maximumSize)
      .expireAfterWrite(config.expireAfterWrite)
      .expireAfterAccess(config.expireAfterAccess)
      .recordStats(config.recordStats)
      .build();
  }
  
  get(key: string): T | undefined {
    return this.cache.getIfPresent(key);
  }
  
  put(key: string, value: T): void {
    this.cache.put(key, value);
  }
  
  invalidate(key: string): void {
    this.cache.invalidate(key);
  }
  
  invalidateAll(): void {
    this.cache.invalidateAll();
  }
  
  getStats(): CacheStats {
    return this.cache.stats();
  }
}

interface CacheStats {
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
}
```

**分布式缓存选型：Redis**
```typescript
import { createClient } from 'redis';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: number;
  enableReadyCheck: boolean;
}

class DistributedCache {
  private client: ReturnType<typeof createClient>;
  
  constructor(config: RedisConfig) {
    this.client = createClient({
      socket: {
        host: config.host,
        port: config.port
      },
      password: config.password,
      database: config.db,
      maxRetriesPerRequest: config.maxRetriesPerRequest,
      enableReadyCheck: config.enableReadyCheck
    });
    
    this.client.connect();
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }
  
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const values = await this.client.mGet(keys);
    return values.map(v => v ? JSON.parse(v) : null);
  }
  
  async mset(items: Array<{ key: string; value: any }>): Promise<void> {
    const pipeline = this.client.multi();
    for (const item of items) {
      pipeline.set(item.key, JSON.stringify(item.value));
    }
    await pipeline.exec();
  }
  
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }
  
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }
}
```

#### 3.2 缓存策略设计

##### 3.2.1 缓存穿透防护

**布隆过滤器**
```typescript
import BloomFilter from 'bloom-filters';

class BloomFilterCache {
  private bloomFilter: any;
  private cache: DistributedCache;
  
  constructor(
    private readonly redis: DistributedCache,
    private readonly expectedItems: number,
    private readonly falsePositiveRate: number
  ) {
    this.bloomFilter = BloomFilter.create(
      this.expectedItems,
      this.falsePositiveRate
    );
    this.cache = redis;
  }
  
  async get<T>(key: string): Promise<T | null> {
    if (!this.bloomFilter.has(key)) {
      return null;
    }
    
    const value = await this.cache.get<T>(key);
    
    if (value === null) {
      this.bloomFilter.add(key);
    }
    
    return value;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.bloomFilter.add(key);
    await this.cache.set(key, value, ttl);
  }
  
  async preload(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.bloomFilter.add(key);
    }
  }
}
```

**空值缓存**
```typescript
class NullValueCache {
  private cache: DistributedCache;
  private readonly NULL_VALUE = '__NULL__';
  private readonly NULL_TTL = 300;
  
  constructor(redis: DistributedCache) {
    this.cache = redis;
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get<string>(key);
    
    if (value === this.NULL_VALUE) {
      return null;
    }
    
    return value as T;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (value === null || value === undefined) {
      await this.cache.set(key, this.NULL_VALUE, this.NULL_TTL);
    } else {
      await this.cache.set(key, value, ttl);
    }
  }
}
```

##### 3.2.2 缓存击穿防护

**互斥锁**
```typescript
class MutexLockCache {
  private cache: DistributedCache;
  private readonly LOCK_PREFIX = 'lock:';
  private readonly LOCK_TTL = 10;
  
  constructor(redis: DistributedCache) {
    this.cache = redis;
  }
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const value = await this.cache.get<T>(key);
    
    if (value !== null) {
      return value;
    }
    
    const lockKey = this.LOCK_PREFIX + key;
    const lockValue = generateId();
    
    const acquired = await this.acquireLock(lockKey, lockValue);
    
    if (acquired) {
      try {
        const newValue = await fetcher();
        await this.cache.set(key, newValue, ttl);
        return newValue;
      } finally {
        await this.releaseLock(lockKey, lockValue);
      }
    } else {
      await this.waitForLock(lockKey);
      return this.get(key, fetcher, ttl);
    }
  }
  
  private async acquireLock(
    lockKey: string,
    lockValue: string
  ): Promise<boolean> {
    const result = await this.cache.client.set(
      lockKey,
      lockValue,
      { NX: true, EX: this.LOCK_TTL }
    );
    return result === 'OK';
  }
  
  private async releaseLock(
    lockKey: string,
    lockValue: string
  ): Promise<void> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.cache.client.eval(script, {
      keys: [lockKey],
      arguments: [lockValue]
    });
  }
  
  private async waitForLock(lockKey: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
```

**逻辑过期**
```typescript
interface CacheValue<T> {
  data: T;
  expireTime: number;
}

class LogicalExpireCache {
  private cache: DistributedCache;
  private localCache: LocalCache<CacheValue<any>>;
  
  constructor(
    redis: DistributedCache,
    localCache: LocalCache<CacheValue<any>>
  ) {
    this.cache = redis;
    this.localCache = localCache;
  }
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const localValue = this.localCache.get<CacheValue<T>>(key);
    
    if (localValue) {
      if (Date.now() < localValue.expireTime) {
        return localValue.data;
      }
      
      this.refreshCache(key, fetcher, ttl);
      return localValue.data;
    }
    
    const remoteValue = await this.cache.get<CacheValue<T>>(key);
    
    if (remoteValue) {
      this.localCache.put(key, remoteValue);
      
      if (Date.now() >= remoteValue.expireTime) {
        this.refreshCache(key, fetcher, ttl);
      }
      
      return remoteValue.data;
    }
    
    const newValue = await fetcher();
    const cacheValue = {
      data: newValue,
      expireTime: Date.now() + ttl * 1000
    };
    
    await this.cache.set(key, cacheValue, ttl * 2);
    this.localCache.put(key, cacheValue);
    
    return newValue;
  }
  
  private async refreshCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const newValue = await fetcher();
      const cacheValue = {
        data: newValue,
        expireTime: Date.now() + ttl * 1000
      };
      
      await this.cache.set(key, cacheValue, ttl * 2);
      this.localCache.put(key, cacheValue);
    } catch (error) {
      console.error('Failed to refresh cache:', error);
    }
  }
}
```

##### 3.2.3 缓存雪崩防护

**随机过期时间**
```typescript
class RandomTTLCache {
  private cache: DistributedCache;
  private readonly TTL_VARIANCE = 0.1;
  
  constructor(redis: DistributedCache) {
    this.cache = redis;
  }
  
  async set(key: string, value: any, baseTTL: number): Promise<void> {
    const variance = baseTTL * this.TTL_VARIANCE;
    const randomTTL = baseTTL + (Math.random() - 0.5) * variance * 2;
    await this.cache.set(key, value, Math.floor(randomTTL));
  }
}
```

**多级缓存**
```typescript
class MultiLevelCache<T> {
  private l1Cache: LocalCache<T>;
  private l2Cache: DistributedCache;
  
  constructor(
    l1Cache: LocalCache<T>,
    l2Cache: DistributedCache
  ) {
    this.l1Cache = l1Cache;
    this.l2Cache = l2Cache;
  }
  
  async get(key: string): Promise<T | null> {
    const l1Value = this.l1Cache.get(key);
    if (l1Value !== undefined) {
      return l1Value;
    }
    
    const l2Value = await this.l2Cache.get<T>(key);
    if (l2Value !== null) {
      this.l1Cache.put(key, l2Value);
      return l2Value;
    }
    
    return null;
  }
  
  async set(key: string, value: T, ttl: number): Promise<void> {
    this.l1Cache.put(key, value);
    await this.l2Cache.set(key, value, ttl);
  }
  
  async invalidate(key: string): Promise<void> {
    this.l1Cache.invalidate(key);
    await this.l2Cache.del(key);
  }
  
  async invalidateAll(): Promise<void> {
    this.l1Cache.invalidateAll();
    await this.l2Cache.client.flushDb();
  }
}
```

#### 3.3 缓存失效策略

##### 3.3.1 主动失效

**定时刷新**
```typescript
class ScheduledRefreshCache {
  private cache: DistributedCache;
  private refreshTasks: Map<string, NodeJS.Timeout> = new Map();
  
  constructor(redis: DistributedCache) {
    this.cache = redis;
  }
  
  async setWithRefresh(
    key: string,
    value: any,
    ttl: number,
    fetcher: () => Promise<any>,
    refreshInterval: number
  ): Promise<void> {
    await this.cache.set(key, value, ttl);
    
    const taskId = setInterval(async () => {
      try {
        const newValue = await fetcher();
        await this.cache.set(key, newValue, ttl);
      } catch (error) {
        console.error(`Failed to refresh cache for key: ${key}`, error);
      }
    }, refreshInterval);
    
    this.refreshTasks.set(key, taskId);
  }
  
  stopRefresh(key: string): void {
    const taskId = this.refreshTasks.get(key);
    if (taskId) {
      clearInterval(taskId);
      this.refreshTasks.delete(key);
    }
  }
}
```

**事件驱动失效**
```typescript
interface CacheInvalidationEvent {
  type: 'invalidate' | 'update';
  key: string;
  value?: any;
  timestamp: Date;
}

class EventDrivenCache {
  private cache: DistributedCache;
  private eventQueue: MessageQueue;
  
  constructor(
    redis: DistributedCache,
    eventQueue: MessageQueue
  ) {
    this.cache = redis;
    this.eventQueue = eventQueue;
    this.subscribeToInvalidationEvents();
  }
  
  async invalidate(key: string): Promise<void> {
    await this.cache.del(key);
    
    const event: CacheInvalidationEvent = {
      type: 'invalidate',
      key,
      timestamp: new Date()
    };
    
    await this.eventQueue.publish('cache.invalidation', event);
  }
  
  async update(key: string, value: any, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl);
    
    const event: CacheInvalidationEvent = {
      type: 'update',
      key,
      value,
      timestamp: new Date()
    };
    
    await this.eventQueue.publish('cache.invalidation', event);
  }
  
  private subscribeToInvalidationEvents(): void {
    this.eventQueue.subscribe('cache.invalidation', async (event) => {
      if (event.type === 'invalidate') {
        await this.cache.del(event.key);
      } else if (event.type === 'update') {
        await this.cache.set(event.key, event.value);
      }
    });
  }
}
```

##### 3.3.2 被动失效

**TTL过期**
```typescript
class TTLCache {
  private cache: DistributedCache;
  private readonly DEFAULT_TTL = 3600;
  
  constructor(redis: DistributedCache) {
    this.cache = redis;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const effectiveTTL = ttl || this.DEFAULT_TTL;
    await this.cache.set(key, value, effectiveTTL);
  }
  
  async get<T>(key: string): Promise<T | null> {
    return await this.cache.get<T>(key);
  }
  
  async extendTTL(key: string, additionalTTL: number): Promise<void> {
    await this.cache.expire(key, additionalTTL);
  }
  
  async getTTL(key: string): Promise<number> {
    return await this.cache.ttl(key);
  }
}
```

**LRU淘汰**
```typescript
class LRUCache<T> {
  private cache: Map<string, { value: T; accessTime: number }>;
  private readonly maxSize: number;
  
  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.accessTime = Date.now();
      return entry.value;
    }
    return undefined;
  }
  
  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      accessTime: Date.now()
    });
  }
  
  private evictLRU(): void {
    let lruKey: string | null = null;
    let minAccessTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessTime < minAccessTime) {
        minAccessTime = entry.accessTime;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  size(): number {
    return this.cache.size;
  }
}
```

#### 3.4 缓存预热与更新

##### 3.4.1 缓存预热

**系统启动预热**
```typescript
class CacheWarmupService {
  private cache: MultiLevelCache<any>;
  private dataSources: Map<string, () => Promise<any>>;
  
  constructor(
    cache: MultiLevelCache<any>,
    dataSources: Map<string, () => Promise<any>>
  ) {
    this.cache = cache;
    this.dataSources = dataSources;
  }
  
  async warmup(): Promise<void> {
    console.log('Starting cache warmup...');
    
    const warmupTasks = Array.from(this.dataSources.entries()).map(
      async ([key, fetcher]) => {
        try {
          const value = await fetcher();
          await this.cache.set(key, value, 3600);
          console.log(`Warmed up cache for key: ${key}`);
        } catch (error) {
          console.error(`Failed to warm up cache for key: ${key}`, error);
        }
      }
    );
    
    await Promise.all(warmupTasks);
    console.log('Cache warmup completed');
  }
}
```

**定时预热**
```typescript
class ScheduledWarmupCache {
  private cache: MultiLevelCache<any>;
  private warmupSchedule: Map<string, WarmupConfig>;
  private scheduler: NodeJS.Timeout | null = null;
  
  constructor(
    cache: MultiLevelCache<any>,
    warmupSchedule: Map<string, WarmupConfig>
  ) {
    this.cache = cache;
    this.warmupSchedule = warmupSchedule;
  }
  
  start(): void {
    this.scheduler = setInterval(() => {
      this.performWarmup();
    }, 60000);
  }
  
  stop(): void {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
  }
  
  private async performWarmup(): Promise<void> {
    const now = new Date();
    
    for (const [key, config] of this.warmupSchedule.entries()) {
      if (this.shouldWarmup(now, config)) {
        try {
          const value = await config.fetcher();
          await this.cache.set(key, value, config.ttl);
          config.lastWarmup = now;
        } catch (error) {
          console.error(`Failed to warm up cache for key: ${key}`, error);
        }
      }
    }
  }
  
  private shouldWarmup(now: Date, config: WarmupConfig): boolean {
    if (!config.lastWarmup) {
      return true;
    }
    
    const elapsed = now.getTime() - config.lastWarmup.getTime();
    return elapsed >= config.interval;
  }
}

interface WarmupConfig {
  fetcher: () => Promise<any>;
  ttl: number;
  interval: number;
  lastWarmup?: Date;
}
```

##### 3.4.2 缓存更新

**写穿透**
```typescript
class WriteThroughCache {
  private cache: DistributedCache;
  private database: Database;
  
  constructor(
    cache: DistributedCache,
    database: Database
  ) {
    this.cache = cache;
    this.database = database;
  }
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const value = await this.database.get<T>(key);
    if (value !== null) {
      await this.cache.set(key, value, 3600);
    }
    
    return value;
  }
  
  async set(key: string, value: any): Promise<void> {
    await this.database.set(key, value);
    await this.cache.set(key, value, 3600);
  }
  
  async delete(key: string): Promise<void> {
    await this.database.delete(key);
    await this.cache.del(key);
  }
}
```

**写回**
```typescript
class WriteBackCache {
  private cache: LocalCache<any>;
  private database: Database;
  private dirtyKeys: Set<string> = new Set();
  private flushInterval: NodeJS.Timeout;
  
  constructor(
    cache: LocalCache<any>,
    database: Database,
    flushIntervalMs: number = 5000
  ) {
    this.cache = cache;
    this.database = database;
    
    this.flushInterval = setInterval(() => {
      this.flush();
    }, flushIntervalMs);
  }
  
  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const value = await this.database.get<T>(key);
    if (value !== null) {
      this.cache.put(key, value);
    }
    
    return value;
  }
  
  async set(key: string, value: any): Promise<void> {
    this.cache.put(key, value);
    this.dirtyKeys.add(key);
  }
  
  async delete(key: string): Promise<void> {
    this.cache.invalidate(key);
    this.dirtyKeys.delete(key);
    await this.database.delete(key);
  }
  
  async flush(): Promise<void> {
    if (this.dirtyKeys.size === 0) {
      return;
    }
    
    const keysToFlush = Array.from(this.dirtyKeys);
    
    for (const key of keysToFlush) {
      const value = this.cache.get(key);
      if (value !== undefined) {
        await this.database.set(key, value);
      }
      this.dirtyKeys.delete(key);
    }
  }
  
  destroy(): void {
    clearInterval(this.flushInterval);
    this.flush();
  }
}
```

#### 3.5 缓存监控与优化

##### 3.5.1 缓存监控

**缓存指标收集**
```typescript
interface CacheMetrics {
  hitCount: number;
  missCount: number;
  hitRate: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  evictionCount: number;
  size: number;
}

class CacheMonitor {
  private hits: number = 0;
  private misses: number = 0;
  private latencies: number[] = [];
  private evictions: number = 0;
  
  recordHit(latency: number): void {
    this.hits++;
    this.recordLatency(latency);
  }
  
  recordMiss(latency: number): void {
    this.misses++;
    this.recordLatency(latency);
  }
  
  recordEviction(): void {
    this.evictions++;
  }
  
  private recordLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > 1000) {
      this.latencies.shift();
    }
  }
  
  getMetrics(): CacheMetrics {
    const sortedLatencies = [...this.latencies].sort((a, b) => a - b);
    const total = this.hits + this.misses;
    
    return {
      hitCount: this.hits,
      missCount: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      avgLatency: this.calculateAverage(this.latencies),
      p95Latency: this.calculatePercentile(sortedLatencies, 95),
      p99Latency: this.calculatePercentile(sortedLatencies, 99),
      evictionCount: this.evictions,
      size: 0
    };
  }
  
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
  
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }
  
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.latencies = [];
    this.evictions = 0;
  }
}
```

**缓存健康检查**
```typescript
class CacheHealthChecker {
  private cache: DistributedCache;
  private monitor: CacheMonitor;
  
  constructor(
    cache: DistributedCache,
    monitor: CacheMonitor
  ) {
    this.cache = cache;
    this.monitor = monitor;
  }
  
  async checkHealth(): Promise<HealthStatus> {
    const metrics = this.monitor.getMetrics();
    const checks: HealthCheck[] = [];
    
    checks.push(await this.checkConnectivity());
    checks.push(this.checkHitRate(metrics));
    checks.push(this.checkLatency(metrics));
    checks.push(await this.checkMemory());
    
    const overallStatus = checks.every(check => check.status === 'pass')
      ? 'healthy'
      : checks.some(check => check.status === 'fail')
      ? 'unhealthy'
      : 'degraded';
    
    return {
      status: overallStatus,
      checks
    };
  }
  
  private async checkConnectivity(): Promise<HealthCheck> {
    try {
      await this.cache.client.ping();
      return {
        name: 'connectivity',
        status: 'pass',
        message: 'Cache is reachable',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        name: 'connectivity',
        status: 'fail',
        message: `Cache is unreachable: ${error.message}`,
        timestamp: new Date()
      };
    }
  }
  
  private checkHitRate(metrics: CacheMetrics): HealthCheck {
    const threshold = 0.8;
    
    if (metrics.hitRate >= threshold) {
      return {
        name: 'hit_rate',
        status: 'pass',
        message: `Hit rate is ${metrics.hitRate.toFixed(2)}`,
        timestamp: new Date()
      };
    } else {
      return {
        name: 'hit_rate',
        status: 'degraded',
        message: `Hit rate is ${metrics.hitRate.toFixed(2)}, below threshold ${threshold}`,
        timestamp: new Date()
      };
    }
  }
  
  private checkLatency(metrics: CacheMetrics): HealthCheck {
    const threshold = 100;
    
    if (metrics.p95Latency <= threshold) {
      return {
        name: 'latency',
        status: 'pass',
        message: `P95 latency is ${metrics.p95Latency.toFixed(2)}ms`,
        timestamp: new Date()
      };
    } else {
      return {
        name: 'latency',
        status: 'degraded',
        message: `P95 latency is ${metrics.p95Latency.toFixed(2)}ms, above threshold ${threshold}ms`,
        timestamp: new Date()
      };
    }
  }
  
  private async checkMemory(): Promise<HealthCheck> {
    const info = await this.cache.client.info('memory');
    const usedMemory = this.parseMemoryInfo(info);
    const maxMemory = 1024 * 1024 * 1024;
    const usage = usedMemory / maxMemory;
    const threshold = 0.8;
    
    if (usage <= threshold) {
      return {
        name: 'memory',
        status: 'pass',
        message: `Memory usage is ${(usage * 100).toFixed(2)}%`,
        timestamp: new Date()
      };
    } else {
      return {
        name: 'memory',
        status: 'degraded',
        message: `Memory usage is ${(usage * 100).toFixed(2)}%, above threshold ${threshold * 100}%`,
        timestamp: new Date()
      };
    }
  }
  
  private parseMemoryInfo(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  timestamp: Date;
}
```

##### 3.5.2 缓存优化

**热点数据识别**
```typescript
class HotDataDetector {
  private accessCounts: Map<string, number> = new Map();
  private accessTimestamps: Map<string, number[]> = new Map();
  private readonly windowSize: number;
  private readonly hotThreshold: number;
  
  constructor(
    windowSize: number = 60,
    hotThreshold: number = 100
  ) {
    this.windowSize = windowSize * 1000;
    this.hotThreshold = hotThreshold;
  }
  
  recordAccess(key: string): void {
    const now = Date.now();
    
    this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
    
    const timestamps = this.accessTimestamps.get(key) || [];
    timestamps.push(now);
    this.accessTimestamps.set(key, timestamps);
    
    this.cleanupOldAccesses(key, now);
  }
  
  private cleanupOldAccesses(key: string, now: number): void {
    const timestamps = this.accessTimestamps.get(key);
    if (!timestamps) return;
    
    const validTimestamps = timestamps.filter(
      ts => now - ts <= this.windowSize
    );
    
    this.accessTimestamps.set(key, validTimestamps);
    this.accessCounts.set(key, validTimestamps.length);
  }
  
  isHot(key: string): boolean {
    const count = this.accessCounts.get(key) || 0;
    return count >= this.hotThreshold;
  }
  
  getHotKeys(): string[] {
    const hotKeys: string[] = [];
    for (const [key, count] of this.accessCounts.entries()) {
      if (count >= this.hotThreshold) {
        hotKeys.push(key);
      }
    }
    return hotKeys.sort((a, b) => {
      return (this.accessCounts.get(b) || 0) - (this.accessCounts.get(a) || 0);
    });
  }
  
  getAccessCount(key: string): number {
    return this.accessCounts.get(key) || 0;
  }
  
  reset(): void {
    this.accessCounts.clear();
    this.accessTimestamps.clear();
  }
}
```

**缓存容量优化**
```typescript
class CacheCapacityOptimizer {
  private cache: DistributedCache;
  private hotDataDetector: HotDataDetector;
  private readonly capacityLimit: number;
  
  constructor(
    cache: DistributedCache,
    hotDataDetector: HotDataDetector,
    capacityLimit: number
  ) {
    this.cache = cache;
    this.hotDataDetector = hotDataDetector;
    this.capacityLimit = capacityLimit;
  }
  
  async optimize(): Promise<void> {
    const currentUsage = await this.getCurrentUsage();
    
    if (currentUsage > this.capacityLimit * 0.9) {
      await this.evictColdData();
    }
  }
  
  private async getCurrentUsage(): Promise<number> {
    const info = await this.cache.client.info('memory');
    return this.parseMemoryInfo(info);
  }
  
  private async evictColdData(): Promise<void> {
    const hotKeys = new Set(this.hotDataDetector.getHotKeys());
    
    const keys = await this.cache.client.keys('*');
    
    for (const key of keys) {
      if (!hotKeys.has(key)) {
        await this.cache.del(key);
      }
    }
  }
  
  private parseMemoryInfo(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}
```

#### 3.6 缓存应用场景

##### 3.6.1 用户数据缓存

```typescript
class UserDataCache {
  private cache: MultiLevelCache<User>;
  private readonly PREFIX = 'user:';
  private readonly TTL = 3600;
  
  constructor(cache: MultiLevelCache<User>) {
    this.cache = cache;
  }
  
  private getKey(userId: string): string {
    return this.PREFIX + userId;
  }
  
  async getUser(userId: string): Promise<User | null> {
    const key = this.getKey(userId);
    return await this.cache.get(key);
  }
  
  async setUser(user: User): Promise<void> {
    const key = this.getKey(user.id);
    await this.cache.set(key, user, this.TTL);
  }
  
  async invalidateUser(userId: string): Promise<void> {
    const key = this.getKey(userId);
    await this.cache.invalidate(key);
  }
  
  async batchGetUsers(userIds: string[]): Promise<Map<string, User>> {
    const keys = userIds.map(id => this.getKey(id));
    const values = await Promise.all(
      keys.map(key => this.cache.get(key))
    );
    
    const result = new Map<string, User>();
    userIds.forEach((userId, index) => {
      const user = values[index];
      if (user) {
        result.set(userId, user);
      }
    });
    
    return result;
  }
}
```

##### 3.6.2 商品数据缓存

```typescript
class ProductDataCache {
  private cache: MultiLevelCache<Product>;
  private readonly PREFIX = 'product:';
  private readonly TTL = 7200;
  
  constructor(cache: MultiLevelCache<Product>) {
    this.cache = cache;
  }
  
  private getKey(productId: string): string {
    return this.PREFIX + productId;
  }
  
  async getProduct(productId: string): Promise<Product | null> {
    const key = this.getKey(productId);
    return await this.cache.get(key);
  }
  
  async setProduct(product: Product): Promise<void> {
    const key = this.getKey(product.id);
    await this.cache.set(key, product, this.TTL);
  }
  
  async invalidateProduct(productId: string): Promise<void> {
    const key = this.getKey(productId);
    await this.cache.invalidate(key);
  }
  
  async batchGetProducts(productIds: string[]): Promise<Map<string, Product>> {
    const keys = productIds.map(id => this.getKey(id));
    const values = await Promise.all(
      keys.map(key => this.cache.get(key))
    );
    
    const result = new Map<string, Product>();
    productIds.forEach((productId, index) => {
      const product = values[index];
      if (product) {
        result.set(productId, product);
      }
    });
    
    return result;
  }
  
  async searchProducts(
    query: string,
    fetcher: () => Promise<Product[]>
  ): Promise<Product[]> {
    const cacheKey = `search:${query}`;
    
    const cached = await this.cache.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const products = await fetcher();
    await this.cache.set(cacheKey, products, this.TTL);
    
    return products;
  }
}
```

##### 3.6.3 会话缓存

```typescript
class SessionCache {
  private cache: DistributedCache;
  private readonly PREFIX = 'session:';
  private readonly TTL = 1800;
  
  constructor(cache: DistributedCache) {
    this.cache = cache;
  }
  
  private getKey(sessionId: string): string {
    return this.PREFIX + sessionId;
  }
  
  async createSession(userId: string): Promise<string> {
    const sessionId = generateId();
    const session: Session = {
      id: sessionId,
      userId,
      createdAt: new Date(),
      lastAccessedAt: new Date()
    };
    
    const key = this.getKey(sessionId);
    await this.cache.set(key, session, this.TTL);
    
    return sessionId;
  }
  
  async getSession(sessionId: string): Promise<Session | null> {
    const key = this.getKey(sessionId);
    const session = await this.cache.get<Session>(key);
    
    if (session) {
      session.lastAccessedAt = new Date();
      await this.cache.set(key, session, this.TTL);
    }
    
    return session;
  }
  
  async updateSession(sessionId: string, data: Partial<Session>): Promise<void> {
    const key = this.getKey(sessionId);
    const session = await this.cache.get<Session>(key);
    
    if (session) {
      Object.assign(session, data);
      session.lastAccessedAt = new Date();
      await this.cache.set(key, session, this.TTL);
    }
  }
  
  async deleteSession(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.cache.del(key);
  }
  
  async extendSession(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.cache.expire(key, this.TTL);
  }
}

interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  lastAccessedAt: Date;
  data?: Record<string, any>;
}
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
