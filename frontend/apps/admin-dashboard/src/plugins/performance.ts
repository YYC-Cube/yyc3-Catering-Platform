/**
 * YYC³餐饮行业智能化平台 - 全局性能监控插件
 * 集成性能监控到Vue应用中
 */

import { App, Plugin } from 'vue'
import { performanceMonitor, PERFORMANCE_CONFIG } from '@/utils/performanceConfig'
import { NetworkPerformanceMonitor, RenderPerformanceMonitor, MemoryMonitor } from '@/utils/performanceConfig'

// 性能监控选项
interface PerformancePluginOptions {
  enableAutoMonitoring?: boolean
  enableRouteTracking?: boolean
  enableComponentTracking?: boolean
  enableNetworkTracking?: boolean
  enableRenderTracking?: boolean
  enableMemoryTracking?: boolean
  reportInterval?: number
  maxReports?: number
  customMetrics?: Record<string, () => number>
  onPerformanceReport?: (report: any) => void
  onPerformanceWarning?: (warning: string) => void
  onPerformanceError?: (error: string) => void
}

// 默认选项
const defaultOptions: PerformancePluginOptions = {
  enableAutoMonitoring: true,
  enableRouteTracking: true,
  enableComponentTracking: false,
  enableNetworkTracking: true,
  enableRenderTracking: true,
  enableMemoryTracking: true,
  reportInterval: 30000, // 30秒
  maxReports: 100,
  customMetrics: {},
  onPerformanceReport: null,
  onPerformanceWarning: null,
  onPerformanceError: null
}

class PerformancePlugin {
  private options: PerformancePluginOptions
  private app: App | null = null
  private networkMonitor: NetworkPerformanceMonitor | null = null
  private renderMonitor: RenderPerformanceMonitor | null = null
  private memoryMonitor: MemoryMonitor | null = null
  private reportTimer: NodeJS.Timeout | null = null
  private routeStartTime: number = 0
  private componentRenderTimes: Map<string, number[]> = new Map()
  private reports: any[] = []
  private isMonitoring = false

  constructor(options: PerformancePluginOptions = {}) {
    this.options = { ...defaultOptions, ...options }
  }

  // 插件安装
  install(app: App) {
    this.app = app
    this.setupGlobalProperties(app)
    this.setupDirectives(app)
    this.setupErrorHandling()

    if (this.options.enableAutoMonitoring) {
      this.startMonitoring()
    }
  }

  // 设置全局属性
  private setupGlobalProperties(app: App) {
    app.config.globalProperties.$performance = {
      monitor: this,
      startMeasure: (name: string) => performanceMonitor.startMeasure(name),
      endMeasure: (name: string) => performanceMonitor.endMeasure(name),
      getMetrics: () => performanceMonitor.getMetrics(),
      getCurrentReport: () => this.generateReport(),
      startComponentTracking: (componentName: string) => this.startComponentTracking(componentName),
      endComponentTracking: (componentName: string) => this.endComponentTracking(componentName),
      getComponentMetrics: (componentName: string) => this.getComponentMetrics(componentName)
    }
  }

  // 设置性能指令
  private setupDirectives(app: App) {
    // 性能追踪指令
    app.directive('perf-track', {
      mounted: (el, binding) => {
        const componentName = binding.value || el.tagName.toLowerCase()
        this.startComponentTracking(componentName)
      },
      unmounted: (el, binding) => {
        const componentName = binding.value || el.tagName.toLowerCase()
        this.endComponentTracking(componentName)
      }
    })

    // 懒加载指令
    app.directive('lazy-load', {
      mounted: (el, binding) => {
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const src = binding.value
                if (src && el.tagName === 'IMG') {
                  el.src = src
                  el.classList.add('loaded')
                }
                observer.unobserve(el)
              }
            })
          }, {
            rootMargin: '50px'
          })

          observer.observe(el)
        }
      }
    })
  }

  // 设置错误处理
  private setupErrorHandling() {
    if (this.app) {
      this.app.config.errorHandler = (err, instance, info) => {
        console.error('Performance Error:', err, info)
        this.reportError(`Component Error: ${err.message}`)
      }
    }
  }

  // 开始监控
  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true

    // 初始化各种监控器
    if (this.options.enableNetworkTracking) {
      this.networkMonitor = NetworkPerformanceMonitor.getInstance()
    }

    if (this.options.enableRenderTracking) {
      this.renderMonitor = new RenderPerformanceMonitor()
    }

    if (this.options.enableMemoryTracking) {
      this.memoryMonitor = new MemoryMonitor()
    }

    // 启动定时报告
    if (this.options.reportInterval > 0) {
      this.reportTimer = setInterval(() => {
        this.generateAndReport()
      }, this.options.reportInterval)
    }

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    // 监听页面卸载
    window.addEventListener('beforeunload', this.cleanup)

    console.log('Performance monitoring started')
  }

  // 停止监控
  stopMonitoring() {
    if (!this.isMonitoring) return

    this.isMonitoring = false

    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = null
    }

    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    window.removeEventListener('beforeunload', this.cleanup)

    console.log('Performance monitoring stopped')
  }

  // 开始组件追踪
  startComponentTracking(componentName: string) {
    const measureName = `component-${componentName}`
    performanceMonitor.startMeasure(measureName)
  }

  // 结束组件追踪
  endComponentTracking(componentName: string) {
    const measureName = `component-${componentName}`
    performanceMonitor.endMeasure(measureName)

    const metrics = performanceMonitor.getMetrics()
    if (metrics[measureName]) {
      if (!this.componentRenderTimes.has(componentName)) {
        this.componentRenderTimes.set(componentName, [])
      }
      this.componentRenderTimes.get(componentName)!.push(metrics[measureName].avg)
    }
  }

  // 获取组件指标
  getComponentMetrics(componentName: string) {
    const times = this.componentRenderTimes.get(componentName) || []
    if (times.length === 0) return null

    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      latest: times[times.length - 1]
    }
  }

  // 开始路由追踪
  startRouteTracking() {
    if (this.options.enableRouteTracking) {
      this.routeStartTime = performance.now()
    }
  }

  // 结束路由追踪
  endRouteTracking(routeName: string) {
    if (this.options.enableRouteTracking && this.routeStartTime > 0) {
      const routeTime = performance.now() - this.routeStartTime
      performanceMonitor.endMeasure(`route-${routeName}`)
      console.log(`Route ${routeName} loaded in ${routeTime.toFixed(2)}ms`)
      this.routeStartTime = 0
    }
  }

  // 生成报告
  generateReport() {
    const report: any = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      custom: performanceMonitor.getMetrics(),
      components: this.getComponentReport(),
      customMetrics: {}
    }

    // 添加自定义指标
    Object.entries(this.options.customMetrics || {}).forEach(([name, fn]) => {
      try {
        report.customMetrics[name] = fn()
      } catch (error) {
        console.warn(`Failed to compute custom metric ${name}:`, error)
      }
    })

    // 添加网络指标
    if (this.networkMonitor) {
      report.network = this.networkMonitor.getMetrics()
    }

    // 添加渲染指标
    if (this.renderMonitor) {
      report.render = {
        fps: this.renderMonitor.getFPS(),
        longFrames: this.renderMonitor.getLongFrames(),
        grade: this.renderMonitor.getPerformanceGrade()
      }
    }

    // 添加内存指标
    if (this.memoryMonitor) {
      report.memory = this.memoryMonitor.getMemoryUsage()
    }

    return report
  }

  // 获取组件报告
  private getComponentReport() {
    const componentReport: Record<string, any> = {}
    this.componentRenderTimes.forEach((times, componentName) => {
      componentReport[componentName] = {
        count: times.length,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times)
      }
    })
    return componentReport
  }

  // 生成并发送报告
  private generateAndReport() {
    if (!this.isMonitoring) return

    const report = this.generateReport()
    this.reports.push(report)

    // 限制报告数量
    if (this.reports.length > (this.options.maxReports || 100)) {
      this.reports = this.reports.slice(-this.options.maxReports!)
    }

    // 调用回调函数
    if (this.options.onPerformanceReport) {
      this.options.onPerformanceReport(report)
    }

    // 检查性能警告
    this.checkPerformanceWarnings(report)
  }

  // 检查性能警告
  private checkPerformanceWarnings(report: any) {
    const warnings: string[] = []

    // 检查FPS
    if (report.render && report.render.fps < 30) {
      warnings.push(`Low FPS detected: ${report.render.fps}`)
    }

    // 检查内存使用
    if (report.memory && report.memory.usage > 0.8) {
      warnings.push(`High memory usage: ${(report.memory.usage * 100).toFixed(1)}%`)
    }

    // 检查网络性能
    if (report.network && report.network.averageResponseTime > 2000) {
      warnings.push(`Slow network response: ${report.network.averageResponseTime}ms`)
    }

    // 发送警告
    warnings.forEach(warning => {
      this.reportWarning(warning)
    })
  }

  // 报告错误
  reportError(error: string) {
    console.error('Performance Error:', error)
    if (this.options.onPerformanceError) {
      this.options.onPerformanceError(error)
    }
  }

  // 报告警告
  reportWarning(warning: string) {
    console.warn('Performance Warning:', warning)
    if (this.options.onPerformanceWarning) {
      this.options.onPerformanceWarning(warning)
    }
  }

  // 获取历史报告
  getReports() {
    return [...this.reports]
  }

  // 清理报告
  clearReports() {
    this.reports = []
  }

  // 导出报告
  exportReports() {
    const data = {
      reports: this.reports,
      config: this.options,
      exportTime: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-reports-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 可见性变化处理
  private onVisibilityChange = () => {
    if (document.hidden) {
      // 页面隐藏时暂停监控
      if (this.isMonitoring) {
        this.pauseMonitoring()
      }
    } else {
      // 页面显示时恢复监控
      if (this.isMonitoring) {
        this.resumeMonitoring()
      }
    }
  }

  // 暂停监控
  private pauseMonitoring() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = null
    }
  }

  // 恢复监控
  private resumeMonitoring() {
    if (this.options.reportInterval > 0) {
      this.reportTimer = setInterval(() => {
        this.generateAndReport()
      }, this.options.reportInterval)
    }
  }

  // 清理
  private cleanup = () => {
    this.stopMonitoring()
    this.componentRenderTimes.clear()
  }

  // 获取当前状态
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      reportsCount: this.reports.length,
      componentsTracked: this.componentRenderTimes.size,
      options: this.options
    }
  }
}

// 创建插件实例
export function createPerformancePlugin(options: PerformancePluginOptions = {}): Plugin {
  const performanceManager = new PerformancePlugin(options)

  return {
    install(app: App) {
      performanceManager.install(app)

      // 暴露管理器实例
      app.config.globalProperties.$performanceManager = performanceManager
    }
  }
}

// 导出管理器类和配置
export { PerformancePlugin, PERFORMANCE_CONFIG }
export default createPerformancePlugin