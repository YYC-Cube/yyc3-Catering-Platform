/**
 * @fileoverview 路由配置优化工具
 * @description 提供路由预加载、分组加载等性能优化功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 */

import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由分组定义
 */
export enum RouteGroup {
  CORE = 'core',
  ORDER = 'order',
  MENU = 'menu',
  KITCHEN = 'kitchen',
  ANALYTICS = 'analytics',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
  AI = 'ai',
  OTHER = 'other'
}

/**
 * 路由优先级定义
 */
export enum RoutePriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

/**
 * 增强的路由元信息
 */
export interface EnhancedRouteMeta {
  title?: string
  requiresAuth?: boolean
  keepAlive?: boolean
  icon?: string
  permissions?: string[]
  group?: RouteGroup
  priority?: RoutePriority
  preload?: boolean
  chunkName?: string
}

/**
 * 路由预加载配置
 */
export interface PreloadConfig {
  enabled: boolean
  idleTimeout: number
  maxConcurrent: number
}

/**
 * 默认预加载配置
 */
const defaultPreloadConfig: PreloadConfig = {
  enabled: true,
  idleTimeout: 2000,
  maxConcurrent: 3
}

/**
 * 路由分组映射
 */
export const routeGroupMapping: Record<string, RouteGroup> = {
  '/dashboard': RouteGroup.CORE,
  '/login': RouteGroup.CORE,
  
  '/orders': RouteGroup.ORDER,
  '/orders/list': RouteGroup.ORDER,
  '/orders/analysis': RouteGroup.ORDER,
  
  '/menu': RouteGroup.MENU,
  '/menu/items': RouteGroup.MENU,
  '/menu/categories': RouteGroup.MENU,
  '/menu/recommendations': RouteGroup.MENU,
  
  '/kitchen': RouteGroup.KITCHEN,
  '/kitchen/display': RouteGroup.KITCHEN,
  '/kitchen/efficiency': RouteGroup.KITCHEN,
  
  '/analytics': RouteGroup.ANALYTICS,
  
  '/customers/list': RouteGroup.CUSTOMER,
  '/customers/analysis': RouteGroup.CUSTOMER,
  
  '/chain/stores': RouteGroup.SYSTEM,
  '/chain/operations': RouteGroup.SYSTEM,
  '/chain/performance': RouteGroup.SYSTEM,
  
  '/safety/traceability': RouteGroup.SYSTEM,
  '/safety/checks': RouteGroup.SYSTEM,
  
  '/reports/sales': RouteGroup.ANALYTICS,
  '/reports/finance': RouteGroup.ANALYTICS,
  '/reports/operations': RouteGroup.ANALYTICS,
  
  '/payment/config': RouteGroup.OTHER,
  '/payment/transactions': RouteGroup.OTHER,
  '/payment/refunds': RouteGroup.OTHER,
  
  '/system/users': RouteGroup.SYSTEM,
  '/system/roles': RouteGroup.SYSTEM,
  '/system/settings': RouteGroup.SYSTEM,
  
  '/ai/dashboard': RouteGroup.AI,
  '/ai/assistant': RouteGroup.AI,
  '/ai/decision': RouteGroup.AI,
  '/ai/knowledge': RouteGroup.AI,
  '/ai/learning': RouteGroup.AI,
  '/ai/collaboration': RouteGroup.AI,
  '/ai/robot': RouteGroup.AI,
  
  '/inventory': RouteGroup.OTHER,
  '/members': RouteGroup.OTHER,
  '/marketing': RouteGroup.OTHER,
  '/subscription': RouteGroup.OTHER,
  '/billing': RouteGroup.OTHER
}

/**
 * 路由优先级映射
 */
export const routePriorityMapping: Record<string, RoutePriority> = {
  '/dashboard': RoutePriority.HIGH,
  '/login': RoutePriority.HIGH,
  
  '/orders': RoutePriority.HIGH,
  '/orders/list': RoutePriority.HIGH,
  
  '/menu': RoutePriority.HIGH,
  '/menu/items': RoutePriority.HIGH,
  
  '/kitchen': RoutePriority.HIGH,
  '/kitchen/display': RoutePriority.HIGH,
  
  '/analytics': RoutePriority.MEDIUM,
  
  '/customers/list': RoutePriority.MEDIUM,
  
  '/ai/dashboard': RoutePriority.MEDIUM,
  '/ai/assistant': RoutePriority.MEDIUM,
  
  '/system/settings': RoutePriority.LOW,
  '/ui-components-test': RoutePriority.LOW
}

/**
 * 增强路由配置
 */
export function enhanceRoute(
  route: RouteRecordRaw,
  group?: RouteGroup,
  priority?: RoutePriority
): RouteRecordRaw {
  const path = typeof route.path === 'string' ? route.path : ''
  
  return {
    ...route,
    meta: {
      ...route.meta,
      group: group || routeGroupMapping[path],
      priority: priority || routePriorityMapping[path]
    }
  }
}

/**
 * 获取路由分组
 */
export function getRouteGroup(path: string): RouteGroup {
  return routeGroupMapping[path] || RouteGroup.OTHER
}

/**
 * 获取路由优先级
 */
export function getRoutePriority(path: string): RoutePriority {
  return routePriorityMapping[path] || RoutePriority.LOW
}

/**
 * 按分组过滤路由
 */
export function filterRoutesByGroup(
  routes: RouteRecordRaw[],
  group: RouteGroup
): RouteRecordRaw[] {
  return routes.filter(route => {
    const meta = route.meta as EnhancedRouteMeta
    return meta?.group === group
  })
}

/**
 * 按优先级过滤路由
 */
export function filterRoutesByPriority(
  routes: RouteRecordRaw[],
  priority: RoutePriority
): RouteRecordRaw[] {
  return routes.filter(route => {
    const meta = route.meta as EnhancedRouteMeta
    return meta?.priority === priority
  })
}

/**
 * 获取高优先级路由列表
 */
export function getHighPriorityRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return filterRoutesByPriority(routes, RoutePriority.HIGH)
}

/**
 * 获取中优先级路由列表
 */
export function getMediumPriorityRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return filterRoutesByPriority(routes, RoutePriority.MEDIUM)
}

/**
 * 路由预加载管理器
 */
export class RoutePreloader {
  private config: PreloadConfig
  private preloadQueue: Set<string> = new Set()
  private isPreloading: boolean = false
  private idleCallbackId: number | null = null

  constructor(config: Partial<PreloadConfig> = {}) {
    this.config = { ...defaultPreloadConfig, ...config }
  }

  /**
   * 启动预加载监听
   */
  startIdleListener() {
    if (!this.config.enabled) return

    if ('requestIdleCallback' in window) {
      this.idleCallbackId = window.requestIdleCallback(
        () => this.preloadHighPriorityRoutes(),
        { timeout: this.config.idleTimeout }
      )
    } else {
      setTimeout(() => this.preloadHighPriorityRoutes(), this.config.idleTimeout)
    }
  }

  /**
   * 停止预加载监听
   */
  stopIdleListener() {
    if (this.idleCallbackId !== null) {
      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(this.idleCallbackId)
      }
      this.idleCallbackId = null
    }
  }

  /**
   * 预加载高优先级路由
   */
  private async preloadHighPriorityRoutes() {
    if (this.isPreloading) return
    
    this.isPreloading = true
    const routes = getHighPriorityRoutes(this.getAllRoutes())
    
    for (let i = 0; i < Math.min(routes.length, this.config.maxConcurrent); i++) {
      const route = routes[i]
      const path = typeof route.path === 'string' ? route.path : ''
      
      if (path && !this.preloadQueue.has(path)) {
        this.preloadQueue.add(path)
        await this.preloadRoute(route)
      }
    }
    
    this.isPreloading = false
  }

  /**
   * 预加载单个路由
   */
  private async preloadRoute(route: RouteRecordRaw): Promise<void> {
    try {
      const component = route.component
      if (typeof component === 'function') {
        await (component as () => Promise<any>)()
      }
    } catch (error) {
      console.error(`Failed to preload route ${route.path}:`, error)
    }
  }

  /**
   * 获取所有路由（需要从router实例获取）
   */
  private getAllRoutes(): RouteRecordRaw[] {
    return []
  }

  /**
   * 手动触发预加载
   */
  async preloadRoutes(routes: RouteRecordRaw[]) {
    for (const route of routes) {
      await this.preloadRoute(route)
    }
  }

  /**
   * 清空预加载队列
   */
  clearQueue() {
    this.preloadQueue.clear()
  }

  /**
   * 获取预加载状态
   */
  getPreloadStatus(): { queue: string[]; isPreloading: boolean } {
    return {
      queue: Array.from(this.preloadQueue),
      isPreloading: this.isPreloading
    }
  }
}

/**
 * 创建全局预加载器实例
 */
export const routePreloader = new RoutePreloader()

/**
 * 路由性能监控
 */
export class RoutePerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  /**
   * 记录路由加载时间
   */
  recordLoadTime(path: string, duration: number) {
    if (!this.metrics.has(path)) {
      this.metrics.set(path, [])
    }
    this.metrics.get(path)!.push(duration)
  }

  /**
   * 获取路由平均加载时间
   */
  getAverageLoadTime(path: string): number {
    const times = this.metrics.get(path)
    if (!times || times.length === 0) return 0
    
    const sum = times.reduce((acc, time) => acc + time, 0)
    return sum / times.length
  }

  /**
   * 获取所有路由性能指标
   */
  getAllMetrics(): Record<string, { avg: number; count: number }> {
    const result: Record<string, { avg: number; count: number }> = {}
    
    this.metrics.forEach((times, path) => {
      result[path] = {
        avg: this.getAverageLoadTime(path),
        count: times.length
      }
    })
    
    return result
  }

  /**
   * 清除性能数据
   */
  clear() {
    this.metrics.clear()
  }
}

/**
 * 创建全局性能监控实例
 */
export const routePerformanceMonitor = new RoutePerformanceMonitor()

/**
 * 路由懒加载包装器
 */
export function lazyLoad<T = any>(
  importFn: () => Promise<T>,
  options?: {
    timeout?: number
    retries?: number
  }
): () => Promise<T> {
  const timeout = options?.timeout || 10000
  const retries = options?.retries || 2

  return async () => {
    let lastError: Error | null = null
    
    for (let i = 0; i <= retries; i++) {
      try {
        const result = await Promise.race([
          importFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Route load timeout')), timeout)
          )
        ])
        return result
      } catch (error) {
        lastError = error as Error
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }
    
    throw lastError
  }
}
