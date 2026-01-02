/**
 * YYC³餐饮行业智能化平台 - API缓存管理
 */

import { memoryCache } from './performance'

// 缓存配置
interface CacheConfig {
  ttl: number // 生存时间（毫秒）
  maxSize?: number // 最大缓存条目数
  strategy?: 'lru' | 'fifo' | 'lfu' // 缓存策略
}

// 缓存条目
interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  hitCount: number
  lastAccess: number
}

// 请求信息
interface RequestInfo {
  url: string
  method: string
  headers?: Record<string, string>
  body?: any
}

// 响应信息
interface ResponseInfo<T = any> {
  data: T
  status: number
  headers?: Record<string, string>
  cached: boolean
}

// 默认缓存配置
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  strategy: 'lru'
}

// API缓存管理器
export class APICacheManager {
  private cache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private accessOrder: string[] = [] // 用于LRU策略

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
  }

  // 生成缓存键
  private generateKey(request: RequestInfo): string {
    const keyParts = [
      request.method.toUpperCase(),
      request.url,
      JSON.stringify(request.headers || {}),
      request.body ? JSON.stringify(request.body) : ''
    ]
    return btoa(keyParts.join('|')).replace(/[+=/]/g, '')
  }

  // 设置缓存
  set<T = any>(request: RequestInfo, response: ResponseInfo<T>, ttl?: number): void {
    const key = this.generateKey(request)
    const now = Date.now()

    // 如果缓存已满，移除最旧的条目
    if (this.cache.size >= (this.config.maxSize || 100)) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data: response.data,
      timestamp: now,
      ttl: ttl || this.config.ttl,
      hitCount: 0,
      lastAccess: now
    }

    this.cache.set(key, entry)
    this.updateAccessOrder(key)
  }

  // 获取缓存
  get<T = any>(request: RequestInfo): ResponseInfo<T> | null {
    const key = this.generateKey(request)
    const entry = this.cache.get(key) as CacheEntry<T>

    if (!entry) {
      return null
    }

    const now = Date.now()

    // 检查是否过期
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      return null
    }

    // 更新访问信息
    entry.hitCount++
    entry.lastAccess = now
    this.updateAccessOrder(key)

    return {
      data: entry.data,
      status: 200, // 缓存的响应总是成功
      cached: true
    }
  }

  // 删除缓存
  delete(request: RequestInfo): boolean {
    const key = this.generateKey(request)
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.removeFromAccessOrder(key)
    }
    return deleted
  }

  // 清空缓存
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
    })
  }

  // 移除最旧的缓存条目
  private evictOldest(): void {
    if (this.accessOrder.length === 0) return

    const oldestKey = this.accessOrder[0]
    this.cache.delete(oldestKey)
    this.removeFromAccessOrder(oldestKey)
  }

  // 更新访问顺序
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key)
    this.accessOrder.push(key)
  }

  // 从访问顺序中移除
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  // 获取缓存统计
  getStats(): CacheStats {
    const now = Date.now()
    let expired = 0
    let totalHitCount = 0
    let totalSize = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++
      }
      totalHitCount += entry.hitCount
      totalSize += this.estimateSize(entry.data)
    }

    return {
      total: this.cache.size,
      active: this.cache.size - expired,
      expired,
      hitRate: totalHitCount > 0 ? totalHitCount / (totalHitCount + 1) : 0, // 简化计算
      totalSize,
      maxAge: Math.max(...Array.from(this.cache.values()).map(e => now - e.timestamp))
    }
  }

  // 估算数据大小（字节）
  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2 // 粗略估算
  }

  // 获取缓存配置
  getConfig(): CacheConfig {
    return { ...this.config }
  }

  // 更新缓存配置
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// 缓存统计接口
interface CacheStats {
  total: number
  active: number
  expired: number
  hitRate: number
  totalSize: number
  maxAge: number
}

// 智能缓存装饰器
export function withAPICache<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  cacheManager: APICacheManager,
  requestExtractor: (...args: Parameters<T>) => RequestInfo,
  shouldCache: (result: any) => boolean = () => true,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const request = requestExtractor(...args)

    // 尝试从缓存获取
    const cached = cacheManager.get(request)
    if (cached) {
      return cached.data
    }

    // 执行API调用
    try {
      const result = await apiFunction(...args)

      // 只有在应该缓存的情况下才缓存
      if (shouldCache(result)) {
        cacheManager.set(request, { data: result, status: 200, cached: false }, ttl)
      }

      return result
    } catch (error) {
      throw error
    }
  }) as T
}

// 预取缓存
export class CachePrefetcher {
  private prefetchQueue: Array<{
    request: RequestInfo
    fetcher: () => Promise<any>
    priority: number
  }> = []
  private isProcessing = false

  // 添加预取任务
  addPrefetch(
    request: RequestInfo,
    fetcher: () => Promise<any>,
    priority: number = 0
  ): void {
    this.prefetchQueue.push({ request, fetcher, priority })
    this.prefetchQueue.sort((a, b) => b.priority - a.priority)
  }

  // 处理预取队列
  async processPrefetch(cacheManager: APICacheManager): Promise<void> {
    if (this.isProcessing || this.prefetchQueue.length === 0) return

    this.isProcessing = true

    while (this.prefetchQueue.length > 0) {
      const task = this.prefetchQueue.shift()!

      try {
        // 检查是否已缓存
        if (!cacheManager.get(task.request)) {
          const result = await task.fetcher()
          cacheManager.set(task.request, { data: result, status: 200, cached: false })
        }
      } catch (error) {
        console.warn('Prefetch failed:', error)
      }

      // 避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    this.isProcessing = false
  }
}

// 缓存失效策略
export class CacheInvalidator {
  private invalidationRules: Array<{
    pattern: RegExp | string
    action: 'delete' | 'refresh'
    refreshFetcher?: () => Promise<any>
  }> = []

  // 添加失效规则
  addRule(
    pattern: RegExp | string,
    action: 'delete' | 'refresh',
    refreshFetcher?: () => Promise<any>
  ): void {
    this.invalidationRules.push({ pattern, action, refreshFetcher })
  }

  // 执行失效
  async invalidate(
    cacheManager: APICacheManager,
    trigger: string
  ): Promise<void> {
    for (const rule of this.invalidationRules) {
      if (this.matchesPattern(trigger, rule.pattern)) {
        if (rule.action === 'delete') {
          // 删除匹配的缓存
          for (const key of cacheManager.getStats()) {
            // 这里需要更复杂的逻辑来匹配URL模式
          }
        } else if (rule.action === 'refresh' && rule.refreshFetcher) {
          // 刷新缓存
          try {
            const result = await rule.refreshFetcher()
            // 更新缓存
          } catch (error) {
            console.warn('Cache refresh failed:', error)
          }
        }
      }
    }
  }

  // 检查是否匹配模式
  private matchesPattern(trigger: string, pattern: RegExp | string): boolean {
    if (pattern instanceof RegExp) {
      return pattern.test(trigger)
    }
    return trigger.includes(pattern)
  }
}

// 创建默认缓存管理器
export const defaultAPICache = new APICacheManager({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 200,
  strategy: 'lru'
})

// 创建预取器
export const cachePrefetcher = new CachePrefetcher()

// 创建缓存失效器
export const cacheInvalidator = new CacheInvalidator()

// 缓存中间件
export function createCacheMiddleware(cacheManager: APICacheManager) {
  return async (
    request: RequestInfo,
    next: () => Promise<any>
  ): Promise<any> => {
    // 尝试从缓存获取
    const cached = cacheManager.get(request)
    if (cached) {
      return cached.data
    }

    // 执行请求
    const result = await next()

    // 缓存成功的响应
    if (result && typeof result === 'object') {
      cacheManager.set(request, { data: result, status: 200, cached: false })
    }

    return result
  }
}

// 定期清理缓存
setInterval(() => {
  defaultAPICache.cleanup()
}, 60 * 1000) // 每分钟清理一次

// 监听页面可见性变化，页面隐藏时清理缓存
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时可以清理一些缓存
      defaultAPICache.cleanup()
    }
  })
}

// 监听内存压力
if ('memory' in performance) {
  setInterval(() => {
    const memory = (performance as any).memory as MemoryInfo
    if (memory && memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
      // 内存使用率过高时清理缓存
      defaultAPICache.clear()
      console.warn('High memory usage, cleared API cache')
    }
  }, 30000) // 每30秒检查一次
}