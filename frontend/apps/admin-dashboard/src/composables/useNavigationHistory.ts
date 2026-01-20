/**
 * @fileoverview 导航历史记录管理工具
 * @description 提供导航历史记录、回退、前进等功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * 导航历史记录项
 */
export interface NavigationHistoryItem {
  path: string
  title: string
  timestamp: number
  query?: Record<string, any>
}

/**
 * 导航历史配置
 */
export interface NavigationHistoryConfig {
  maxItems: number
  persistToStorage: boolean
  storageKey: string
}

/**
 * 默认配置
 */
const defaultConfig: NavigationHistoryConfig = {
  maxItems: 50,
  persistToStorage: true,
  storageKey: 'yyc3-navigation-history'
}

/**
 * 导航历史管理器
 */
export class NavigationHistoryManager {
  private config: NavigationHistoryConfig
  private history: NavigationHistoryItem[] = []
  private currentIndex: number = -1

  constructor(config: Partial<NavigationHistoryConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.loadFromStorage()
  }

  /**
   * 添加导航记录
   */
  add(item: NavigationHistoryItem) {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    this.history.push(item)
    this.currentIndex = this.history.length - 1

    if (this.history.length > this.config.maxItems) {
      this.history.shift()
      this.currentIndex--
    }

    this.saveToStorage()
  }

  /**
   * 回退到上一页
   */
  back(): NavigationHistoryItem | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  /**
   * 前进到下一页
   */
  forward(): NavigationHistoryItem | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  /**
   * 获取当前项
   */
  getCurrent(): NavigationHistoryItem | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex]
    }
    return null
  }

  /**
   * 获取上一项
   */
  getPrevious(): NavigationHistoryItem | null {
    if (this.currentIndex > 0) {
      return this.history[this.currentIndex - 1]
    }
    return null
  }

  /**
   * 获取下一项
   */
  getNext(): NavigationHistoryItem | null {
    if (this.currentIndex < this.history.length - 1) {
      return this.history[this.currentIndex + 1]
    }
    return null
  }

  /**
   * 获取所有历史记录
   */
  getAll(): NavigationHistoryItem[] {
    return [...this.history]
  }

  /**
   * 获取最近N条记录
   */
  getRecent(count: number): NavigationHistoryItem[] {
    return this.history.slice(-count)
  }

  /**
   * 清空历史记录
   */
  clear() {
    this.history = []
    this.currentIndex = -1
    this.saveToStorage()
  }

  /**
   * 从指定位置开始清除
   */
  clearFrom(index: number) {
    this.history = this.history.slice(0, index)
    this.currentIndex = Math.min(this.currentIndex, this.history.length - 1)
    this.saveToStorage()
  }

  /**
   * 搜索历史记录
   */
  search(keyword: string): NavigationHistoryItem[] {
    const lowerKeyword = keyword.toLowerCase()
    return this.history.filter(item =>
      item.title.toLowerCase().includes(lowerKeyword) ||
      item.path.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * 检查是否可以回退
   */
  canGoBack(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 检查是否可以前进
   */
  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage() {
    if (!this.config.persistToStorage) return

    try {
      localStorage.setItem(
        this.config.storageKey,
        JSON.stringify(this.history)
      )
    } catch (error) {
      console.error('Failed to save navigation history:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage() {
    if (!this.config.persistToStorage) return

    try {
      const stored = localStorage.getItem(this.config.storageKey)
      if (stored) {
        this.history = JSON.parse(stored)
        this.currentIndex = this.history.length - 1
      }
    } catch (error) {
      console.error('Failed to load navigation history:', error)
    }
  }

  /**
   * 获取历史记录统计
   */
  getStats() {
    return {
      total: this.history.length,
      currentIndex: this.currentIndex,
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward()
    }
  }
}

/**
 * 创建全局导航历史管理器实例
 */
export const navigationHistoryManager = new NavigationHistoryManager()

/**
 * 导航历史Composable
 */
export function useNavigationHistory() {
  const router = useRouter()
  const route = useRoute()
  const history = ref<NavigationHistoryItem[]>([])

  /**
   * 添加当前路由到历史记录
   */
  function addToHistory() {
    const item: NavigationHistoryItem = {
      path: route.path,
      title: (route.meta?.title as string) || route.path,
      timestamp: Date.now(),
      query: route.query
    }

    navigationHistoryManager.add(item)
    history.value = navigationHistoryManager.getAll()
  }

  /**
   * 回退到上一页
   */
  function goBack() {
    const previous = navigationHistoryManager.back()
    if (previous) {
      router.push({ path: previous.path, query: previous.query })
    }
  }

  /**
   * 前进到下一页
   */
  function goForward() {
    const next = navigationHistoryManager.forward()
    if (next) {
      router.push({ path: next.path, query: next.query })
    }
  }

  /**
   * 跳转到指定历史记录
   */
  function goTo(index: number) {
    const item = navigationHistoryManager.getAll()[index]
    if (item) {
      router.push({ path: item.path, query: item.query })
    }
  }

  /**
   * 清空历史记录
   */
  function clearHistory() {
    navigationHistoryManager.clear()
    history.value = []
  }

  /**
   * 搜索历史记录
   */
  function searchHistory(keyword: string): NavigationHistoryItem[] {
    return navigationHistoryManager.search(keyword)
  }

  /**
   * 获取最近访问的页面
   */
  function getRecentPages(count: number = 10): NavigationHistoryItem[] {
    return navigationHistoryManager.getRecent(count)
  }

  /**
   * 检查是否可以回退
   */
  function canGoBack(): boolean {
    return navigationHistoryManager.canGoBack()
  }

  /**
   * 检查是否可以前进
   */
  function canGoForward(): boolean {
    return navigationHistoryManager.canGoForward()
  }

  /**
   * 格式化时间
   */
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  /**
   * 获取历史记录统计
   */
  function getHistoryStats() {
    return navigationHistoryManager.getStats()
  }

  return {
    history,
    addToHistory,
    goBack,
    goForward,
    goTo,
    clearHistory,
    searchHistory,
    getRecentPages,
    canGoBack,
    canGoForward,
    formatTime,
    getHistoryStats
  }
}
