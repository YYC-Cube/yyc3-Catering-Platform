/**
 * YYC³餐饮行业智能化平台 - 性能优化工具
 */

// 缓存管理
class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private defaultTTL = 5 * 60 * 1000 // 5分钟

  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl
    }
    this.cache.set(key, entry)
  }

  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // 获取缓存统计
  getStats(): CacheStats {
    let expired = 0
    const now = Date.now()

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++
      }
    }

    return {
      total: this.cache.size,
      active: this.cache.size - expired,
      expired
    }
  }
}

// 内存缓存实例
export const memoryCache = new CacheManager()

// 定期清理缓存
setInterval(() => {
  memoryCache.cleanup()
}, 60 * 1000) // 每分钟清理一次

// 接口定义
interface CacheEntry {
  value: any
  timestamp: number
  ttl: number
}

interface CacheStats {
  total: number
  active: number
  expired: number
}

interface PerformanceMetrics {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

interface ResourceTiming {
  name: string
  url: string
  duration: number
  size: number
  type: string
}

// 性能监控类
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private resourceTimings: ResourceTiming[] = []
  private observers: PerformanceObserver[] = []

  // 开始性能测量
  start(name: string, metadata?: Record<string, any>): void {
    this.metrics.push({
      name,
      startTime: performance.now(),
      metadata
    })
  }

  // 结束性能测量
  end(name: string): number | null {
    const index = this.metrics.findIndex(m => m.name === name && !m.endTime)
    if (index === -1) return null

    const metric = this.metrics[index]
    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    return metric.duration
  }

  // 获取性能指标
  getMetrics(name?: string): PerformanceMetrics[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return this.metrics.filter(m => m.duration !== undefined)
  }

  // 清除性能指标
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics = this.metrics.filter(m => m.name !== name)
    } else {
      this.metrics = []
    }
  }

  // 获取平均性能
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return 0

    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    return total / metrics.length
  }

  // 监控资源加载
  observeResources(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming
            this.resourceTimings.push({
              name: resource.name,
              url: new URL(resource.name).pathname,
              duration: resource.responseEnd - resource.startTime,
              size: resource.transferSize || 0,
              type: this.getResourceType(resource.name)
            })
          }
        }
      })

      observer.observe({ entryTypes: ['resource'] })
      this.observers.push(observer)
    }
  }

  // 监控长任务
  observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime
            })
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
      this.observers.push(observer)
    }
  }

  // 获取资源类型
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()
    const typeMap: Record<string, string> = {
      'js': 'script',
      'css': 'stylesheet',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'gif': 'image',
      'svg': 'image',
      'woff': 'font',
      'woff2': 'font',
      'ttf': 'font'
    }
    return typeMap[extension || ''] || 'other'
  }

  // 获取资源统计
  getResourceStats(): {
    total: number
    totalSize: number
    totalDuration: number
    byType: Record<string, { count: number; size: number; duration: number }>
  } {
    const stats = {
      total: this.resourceTimings.length,
      totalSize: 0,
      totalDuration: 0,
      byType: {} as Record<string, { count: number; size: number; duration: number }>
    }

    for (const timing of this.resourceTimings) {
      stats.totalSize += timing.size
      stats.totalDuration += timing.duration

      if (!stats.byType[timing.type]) {
        stats.byType[timing.type] = { count: 0, size: 0, duration: 0 }
      }

      stats.byType[timing.type].count++
      stats.byType[timing.type].size += timing.size
      stats.byType[timing.type].duration += timing.duration
    }

    return stats
  }

  // 断开观察者
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// 性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 内存使用监控
export function getMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance) {
    return (performance as any).memory as MemoryInfo
  }
  return null
}

// 网络状态监控
export function getNetworkConnection(): NetworkInformation | null {
  if ('connection' in navigator) {
    return (navigator as any).connection as NetworkInformation
  }
  return null
}

// 懒加载图片
export function lazyLoadImages(): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img)
    })
  }
}

// 虚拟滚动辅助函数
export function calculateVisibleItems<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): { visible: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 1 // 缓冲一项
  const endIndex = Math.min(startIndex + visibleCount, items.length)

  return {
    visible: items.slice(startIndex, endIndex),
    startIndex,
    endIndex
  }
}

// 请求缓存装饰器
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    // 尝试从缓存获取
    const cached = memoryCache.get(key)
    if (cached !== null) {
      return cached
    }

    // 执行原函数
    try {
      const result = await fn(...args)
      memoryCache.set(key, result, ttl)
      return result
    } catch (error) {
      throw error
    }
  }) as T
}

// 重试机制
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        throw lastError
      }

      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= backoff
    }
  }

  throw lastError!
}

// 批处理函数
export function batchProcess<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10,
  delay: number = 100
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = []
    let index = 0

    const processBatch = async () => {
      const batch = items.slice(index, index + batchSize)
      if (batch.length === 0) {
        resolve(results)
        return
      }

      try {
        const batchResults = await processor(batch)
        results.push(...batchResults)
        index += batchSize

        // 继续处理下一批
        setTimeout(processBatch, delay)
      } catch (error) {
        reject(error)
      }
    }

    processBatch()
  })
}

// 性能标记
export function mark(name: string): void {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(name)
  }
}

// 性能测量
export function measure(name: string, startMark: string, endMark?: string): number | null {
  if ('performance' in window && 'measure' in performance) {
    try {
      performance.measure(name, startMark, endMark)
      const entries = performance.getEntriesByName(name, 'measure')
      if (entries.length > 0) {
        return entries[entries.length - 1].duration
      }
    } catch (error) {
      console.warn('Performance measure failed:', error)
    }
  }
  return null
}

// 清除性能标记
export function clearMarks(name?: string): void {
  if ('performance' in window && 'clearMarks' in performance) {
    performance.clearMarks(name)
  }
}

// 清除性能测量
export function clearMeasures(name?: string): void {
  if ('performance' in window && 'clearMeasures' in performance) {
    performance.clearMeasures(name)
  }
}

// 获取页面加载性能
export function getPageLoadMetrics(): PageLoadMetrics | null {
  if (!('performance' in window) || !('timing' in performance)) {
    return null
  }

  const timing = performance.timing
  const navigation = performance.navigation

  return {
    // 导航相关
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    loadComplete: timing.loadEventEnd - timing.navigationStart,
    firstPaint: 0, // 需要Paint Timing API
    firstContentfulPaint: 0, // 需要Paint Timing API

    // 网络相关
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnect: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,

    // 处理相关
    domProcessing: timing.domComplete - timing.domLoading,

    // 导航类型
    navigationType: navigation.type,
    redirectCount: navigation.redirectCount
  }
}

// 接口定义
interface PageLoadMetrics {
  domContentLoaded: number
  loadComplete: number
  firstPaint: number
  firstContentfulPaint: number
  dnsLookup: number
  tcpConnect: number
  request: number
  response: number
  domProcessing: number
  navigationType: number
  redirectCount: number
}

// 初始化性能监控
export function initPerformanceMonitoring(): void {
  // 监控资源加载
  performanceMonitor.observeResources()

  // 监控长任务
  performanceMonitor.observeLongTasks()

  // 懒加载图片
  lazyLoadImages()

  // 监控内存使用（如果支持）
  if (getMemoryUsage()) {
    setInterval(() => {
      const memory = getMemoryUsage()
      if (memory && memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
        console.warn('High memory usage detected:', memory)
        // 可以在这里触发内存清理
        memoryCache.cleanup()
      }
    }, 30000) // 每30秒检查一次
  }
}