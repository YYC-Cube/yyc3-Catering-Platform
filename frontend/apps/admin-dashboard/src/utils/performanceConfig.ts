/**
 * YYC³餐饮行业智能化平台 - 性能配置和监控
 */

import { PerformanceMonitor } from './lazyLoad'

// 定义MemoryInfo类型
interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// 性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 性能配置
export const PERFORMANCE_CONFIG = {
  // 图片优化
  imageOptimization: {
    lazyLoading: true,
    placeholderSize: 50,
    qualityThreshold: 85,
    formats: ['webp', 'avif', 'jpg', 'png'] as const,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    compression: 0.8
  },

  // 虚拟滚动
  virtualScrolling: {
    itemHeight: 60,
    bufferSize: 5,
    threshold: 100
  },

  // 缓存策略
  caching: {
    imageCacheTime: 24 * 60 * 60 * 1000, // 24小时
    apiCacheTime: 5 * 60 * 1000, // 5分钟
    componentCacheTime: 10 * 60 * 1000 // 10分钟
  },

  // 代码分割
  codeSplitting: {
    chunkSize: 244 * 1024, // 244KB
    prefetchThreshold: 2,
    preloadThreshold: 3
  },

  // 渲染优化
  rendering: {
    maxConcurrentAnimations: 3,
    animationFrameRate: 60,
    debounceDelay: 100,
    throttleDelay: 16
  }
}

// 网络性能监控
export class NetworkPerformanceMonitor {
  private static instance: NetworkPerformanceMonitor
  private metrics = {
    totalRequests: 0,
    totalSize: 0,
    averageResponseTime: 0,
    errorRate: 0,
    slowRequests: 0
  }

  static getInstance(): NetworkPerformanceMonitor {
    if (!NetworkPerformanceMonitor.instance) {
      NetworkPerformanceMonitor.instance = new NetworkPerformanceMonitor()
    }
    return NetworkPerformanceMonitor.instance
  }

  private constructor() {
    this.setupFetchInterceptor()
  }

  private setupFetchInterceptor() {
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const startTime = performance.now()
      this.metrics.totalRequests++

      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        const responseTime = endTime - startTime

        // 获取响应大小
        const contentLength = response.headers.get('content-length')
        const size = contentLength ? parseInt(contentLength) : 0

        this.updateMetrics(responseTime, size, false)
        return response
      } catch (error) {
        const endTime = performance.now()
        const responseTime = endTime - startTime

        this.updateMetrics(responseTime, 0, true)
        throw error
      }
    }
  }

  private updateMetrics(responseTime: number, size: number, isError: boolean) {
    this.metrics.totalSize += size

    // 更新平均响应时间
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime
    this.metrics.averageResponseTime = totalTime / this.metrics.totalRequests

    // 更新错误率
    if (isError) {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests
    } else {
      this.metrics.errorRate = this.metrics.errorRate * (this.metrics.totalRequests - 1) / this.metrics.totalRequests
    }

    // 统计慢请求（超过2秒）
    if (responseTime > 2000) {
      this.metrics.slowRequests++
    }
  }

  getMetrics() {
    return { ...this.metrics }
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      totalSize: 0,
      averageResponseTime: 0,
      errorRate: 0,
      slowRequests: 0
    }
  }
}

// 渲染性能监控
export class RenderPerformanceMonitor {
  private frameCount = 0
  private lastFrameTime = 0
  private fps = 0
  private longFrames = 0

  constructor() {
    this.startMonitoring()
  }

  private startMonitoring() {
    const measureFrame = (timestamp: number) => {
      if (this.lastFrameTime) {
        const frameTime = timestamp - this.lastFrameTime

        // 计算FPS
        this.frameCount++
        if (this.frameCount >= 60) {
          this.fps = Math.round(1000 / (frameTime / this.frameCount))
          this.frameCount = 0
          this.lastFrameTime = timestamp

          // 检测长帧（超过16.67ms）
          if (frameTime > 16.67) {
            this.longFrames++
          }
        }
      } else {
        this.lastFrameTime = timestamp
      }

      requestAnimationFrame(measureFrame)
    }

    requestAnimationFrame(measureFrame)
  }

  getFPS(): number {
    return this.fps
  }

  getLongFrames(): number {
    return this.longFrames
  }

  getPerformanceGrade(): 'excellent' | 'good' | 'fair' | 'poor' {
    if (this.fps >= 55 && this.longFrames === 0) return 'excellent'
    if (this.fps >= 45 && this.longFrames <= 5) return 'good'
    if (this.fps >= 30 && this.longFrames <= 10) return 'fair'
    return 'poor'
  }
}

// 内存使用监控
export class MemoryMonitor {
  private memoryInfo: MemoryInfo | null = null

  constructor() {
    if (this.isMemoryAPIAvailable()) {
      this.startMonitoring()
    }
  }

  private isMemoryAPIAvailable(): boolean {
    return 'memory' in performance
  }

  private startMonitoring() {
    setInterval(() => {
      this.updateMemoryInfo()
    }, 5000) // 每5秒更新一次
  }

  private updateMemoryInfo() {
    if (this.isMemoryAPIAvailable()) {
      this.memoryInfo = (performance as any).memory
    }
  }

  getMemoryUsage() {
    if (!this.memoryInfo) return null

    const total = this.memoryInfo.usedJSHeapSize + this.memoryInfo.totalJSHeapSize
    const used = this.memoryInfo.usedJSHeapSize
    const limit = this.memoryInfo.jsHeapSizeLimit

    return {
      used,
      total,
      limit,
      usage: used / limit
    }
  }

  isMemoryLeakDetected(): boolean {
    const usage = this.getMemoryUsage()
    return usage ? usage.usage > 0.8 : false
  }
}

// 性能优化建议生成器
export class PerformanceOptimizer {
  private networkMonitor = NetworkPerformanceMonitor.getInstance()
  private renderMonitor = new RenderPerformanceMonitor()
  private memoryMonitor = new MemoryMonitor()

  generateOptimizationSuggestions(): string[] {
    const suggestions: string[] = []

    // 网络性能优化建议
    const networkMetrics = this.networkMonitor.getMetrics()
    if (networkMetrics.averageResponseTime > 2000) {
      suggestions.push('API响应时间较慢，建议优化网络请求或启用缓存')
    }

    if (networkMetrics.errorRate > 0.05) {
      suggestions.push('网络错误率较高，建议检查网络连接和API可用性')
    }

    if (networkMetrics.slowRequests > 10) {
      suggestions.push('慢请求数量较多，建议优化请求大小或使用CDN')
    }

    // 渲染性能优化建议
    const fps = this.renderMonitor.getFPS()
    const longFrames = this.renderMonitor.getLongFrames()

    if (fps < 30) {
      suggestions.push('FPS较低，建议减少DOM操作或使用虚拟滚动')
    }

    if (longFrames > 20) {
      suggestions.push('长帧数量较多，建议优化动画和计算密集型操作')
    }

    // 内存使用优化建议
    if (this.memoryMonitor.isMemoryLeakDetected()) {
      suggestions.push('内存使用率过高，可能存在内存泄漏，建议检查事件监听器和定时器清理')
    }

    // 通用优化建议
    const performanceMetrics = performanceMonitor.getMetrics()
    Object.entries(performanceMetrics).forEach(([name, { avg }]) => {
      if (avg > 100) {
        suggestions.push(`${name} 操作平均耗时 ${avg.toFixed(2)}ms，建议优化性能`)
      }
    })

    return suggestions
  }
}

// 性能报告生成器
export class PerformanceReporter {
  private networkMonitor = NetworkPerformanceMonitor.getInstance()
  private renderMonitor = new RenderPerformanceMonitor()
  private memoryMonitor = new MemoryMonitor()
  private performanceMonitor = performanceMonitor

  generateReport() {
    const networkMetrics = this.networkMonitor.getMetrics()
    const renderMetrics = {
      fps: this.renderMonitor.getFPS(),
      longFrames: this.renderMonitor.getLongFrames(),
      grade: this.renderMonitor.getPerformanceGrade()
    }
    const memoryMetrics = this.memoryMonitor.getMemoryUsage()
    const customMetrics = this.performanceMonitor.getMetrics()

    return {
      timestamp: new Date().toISOString(),
      network: networkMetrics,
      render: renderMetrics,
      memory: memoryMetrics,
      custom: customMetrics,
      recommendations: this.generateRecommendations(networkMetrics, renderMetrics, memoryMetrics, customMetrics)
    }
  }

  private generateRecommendations(network: any, render: any, memory: any, custom: Record<string, { avg: number }>) {
    const recommendations: string[] = []

    if (network.averageResponseTime > 1000) {
      recommendations.push('启用API响应缓存以减少网络延迟')
    }

    if (render.fps < 45) {
      recommendations.push('优化DOM操作和动画性能')
    }

    if (memory && memory.usage > 0.7) {
      recommendations.push('清理未使用的事件监听器和定时器')
    }

    Object.entries(custom).forEach(([name, { avg }]) => {
      if (avg > 200) {
        recommendations.push(`优化${name}操作性能`)
      }
    })

    return recommendations
  }
}

// 性能配置导出
export default {
  PERFORMANCE_CONFIG,
  NetworkPerformanceMonitor,
  RenderPerformanceMonitor,
  MemoryMonitor,
  PerformanceOptimizer,
  PerformanceReporter,
  performanceMonitor
}
