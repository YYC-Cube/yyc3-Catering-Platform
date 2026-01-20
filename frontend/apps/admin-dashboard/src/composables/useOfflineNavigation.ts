/**
 * @fileoverview 离线导航支持工具
 * @description 提供离线检测、缓存管理、离线页面等功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 */

/**
 * 离线状态
 */
export enum OfflineStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  RECONNECTING = 'reconnecting'
}

/**
 * 离线配置
 */
export interface OfflineConfig {
  enableCache: boolean
  cacheKey: string
  cacheExpiry: number
  showOfflineAlert: boolean
  autoRetry: boolean
  retryInterval: number
  maxRetries: number
}

/**
 * 默认配置
 */
const defaultConfig: OfflineConfig = {
  enableCache: true,
  cacheKey: 'yyc3-offline-cache',
  cacheExpiry: 3600000,
  showOfflineAlert: true,
  autoRetry: true,
  retryInterval: 5000,
  maxRetries: 10
}

/**
 * 离线管理器
 */
export class OfflineManager {
  private config: OfflineConfig
  private status: OfflineStatus = OfflineStatus.ONLINE
  private retryCount: number = 0
  private retryTimer: number | null = null
  private listeners: Array<(status: OfflineStatus) => void> = []

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.initialize()
  }

  /**
   * 初始化离线管理器
   */
  private initialize() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      this.updateStatus(navigator.onLine ? OfflineStatus.ONLINE : OfflineStatus.OFFLINE)
    }
  }

  /**
   * 处理在线事件
   */
  private handleOnline = () => {
    console.log('Network is online')
    this.updateStatus(OfflineStatus.ONLINE)
    this.stopRetry()
  }

  /**
   * 处理离线事件
   */
  private handleOffline = () => {
    console.log('Network is offline')
    this.updateStatus(OfflineStatus.OFFLINE)
    
    if (this.config.autoRetry) {
      this.startRetry()
    }
  }

  /**
   * 更新状态
   */
  private updateStatus(newStatus: OfflineStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.notifyListeners(newStatus)
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(status: OfflineStatus) {
    this.listeners.forEach(listener => listener(status))
  }

  /**
   * 开始重试
   */
  private startRetry() {
    if (this.retryTimer) return

    this.retryTimer = window.setInterval(() => {
      this.retryCount++
      
      if (this.retryCount > this.config.maxRetries) {
        this.stopRetry()
        return
      }

      this.updateStatus(OfflineStatus.RECONNECTING)
      this.checkConnection()
    }, this.config.retryInterval)
  }

  /**
   * 停止重试
   */
  private stopRetry() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer)
      this.retryTimer = null
    }
    this.retryCount = 0
  }

  /**
   * 检查连接
   */
  private async checkConnection() {
    try {
      const response = await fetch(window.location.href, {
        method: 'HEAD',
        cache: 'no-store'
      })
      
      if (response.ok) {
        this.handleOnline()
      }
    } catch (error) {
      console.log('Connection check failed:', error)
    }
  }

  /**
   * 获取当前状态
   */
  getStatus(): OfflineStatus {
    return this.status
  }

  /**
   * 是否在线
   */
  isOnline(): boolean {
    return this.status === OfflineStatus.ONLINE
  }

  /**
   * 是否离线
   */
  isOffline(): boolean {
    return this.status === OfflineStatus.OFFLINE
  }

  /**
   * 是否正在重连
   */
  isReconnecting(): boolean {
    return this.status === OfflineStatus.RECONNECTING
  }

  /**
   * 添加状态监听器
   */
  addListener(listener: (status: OfflineStatus) => void) {
    this.listeners.push(listener)
  }

  /**
   * 移除状态监听器
   */
  removeListener(listener: (status: OfflineStatus) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 缓存数据
   */
  cacheData(key: string, data: any): void {
    if (!this.config.enableCache) return

    try {
      const cache = this.getCache()
      cache[key] = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(this.config.cacheKey, JSON.stringify(cache))
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }

  /**
   * 获取缓存数据
   */
  getCachedData(key: string): any | null {
    if (!this.config.enableCache) return null

    try {
      const cache = this.getCache()
      const item = cache[key]
      
      if (!item) return null

      const age = Date.now() - item.timestamp
      if (age > this.config.cacheExpiry) {
        delete cache[key]
        localStorage.setItem(this.config.cacheKey, JSON.stringify(cache))
        return null
      }

      return item.data
    } catch (error) {
      console.error('Failed to get cached data:', error)
      return null
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.config.cacheKey)
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  /**
   * 获取缓存
   */
  private getCache(): Record<string, any> {
    try {
      const cached = localStorage.getItem(this.config.cacheKey)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      console.error('Failed to get cache:', error)
      return {}
    }
  }

  /**
   * 清理
   */
  destroy() {
    this.stopRetry()
    this.listeners = []
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
  }
}

/**
 * 创建全局离线管理器实例
 */
export const offlineManager = new OfflineManager()

/**
 * 离线导航Composable
 */
export function useOfflineNavigation() {
  const status = ref<OfflineStatus>(OfflineStatus.ONLINE)
  const isOnline = ref(true)
  const isOffline = ref(false)
  const isReconnecting = ref(false)

  /**
   * 初始化离线导航
   */
  function initialize() {
    status.value = offlineManager.getStatus()
    updateFlags()

    offlineManager.addListener((newStatus) => {
      status.value = newStatus
      updateFlags()
    })
  }

  /**
   * 更新标志
   */
  function updateFlags() {
    isOnline.value = offlineManager.isOnline()
    isOffline.value = offlineManager.isOffline()
    isReconnecting.value = offlineManager.isReconnecting()
  }

  /**
   * 缓存数据
   */
  function cacheData(key: string, data: any): void {
    offlineManager.cacheData(key, data)
  }

  /**
   * 获取缓存数据
   */
  function getCachedData(key: string): any | null {
    return offlineManager.getCachedData(key)
  }

  /**
   * 清除缓存
   */
  function clearCache(): void {
    offlineManager.clearCache()
  }

  /**
   * 获取状态文本
   */
  function getStatusText(): string {
    switch (status.value) {
      case OfflineStatus.ONLINE:
        return '网络连接正常'
      case OfflineStatus.OFFLINE:
        return '网络连接已断开'
      case OfflineStatus.RECONNECTING:
        return '正在重新连接...'
      default:
        return '未知状态'
    }
  }

  /**
   * 获取状态图标
   */
  function getStatusIcon(): string {
    switch (status.value) {
      case OfflineStatus.ONLINE:
        return 'Connection'
      case OfflineStatus.OFFLINE:
        return 'CircleClose'
      case OfflineStatus.RECONNECTING:
        return 'Loading'
      default:
        return 'Warning'
    }
  }

  return {
    status,
    isOnline,
    isOffline,
    isReconnecting,
    initialize,
    cacheData,
    getCachedData,
    clearCache,
    getStatusText,
    getStatusIcon
  }
}
