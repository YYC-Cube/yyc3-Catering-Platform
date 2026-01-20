/**
 * @fileoverview 快捷键管理工具
 * @description 提供全局快捷键管理和快捷键提示功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

/**
 * 快捷键定义
 */
export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
  category?: string
}

/**
 * 快捷键分类
 */
export enum ShortcutCategory {
  NAVIGATION = '导航',
  ACTIONS = '操作',
  SYSTEM = '系统',
  SEARCH = '搜索'
}

/**
 * 快捷键配置
 */
interface ShortcutConfig {
  enabled: boolean
  showHelp: boolean
  preventDefault: boolean
}

/**
 * 默认配置
 */
const defaultConfig: ShortcutConfig = {
  enabled: true,
  showHelp: true,
  preventDefault: true
}

/**
 * 快捷键管理器
 */
export class ShortcutManager {
  private config: ShortcutConfig
  private shortcuts: Map<string, Shortcut[]> = new Map()
  private isActive: boolean = true
  private helpVisible: boolean = false

  constructor(config: Partial<ShortcutConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * 注册快捷键
   */
  register(shortcut: Shortcut) {
    const key = this.getShortcutKey(shortcut)
    
    if (!this.shortcuts.has(key)) {
      this.shortcuts.set(key, [])
    }
    
    this.shortcuts.get(key)!.push(shortcut)
  }

  /**
   * 批量注册快捷键
   */
  registerBatch(shortcuts: Shortcut[]) {
    shortcuts.forEach(shortcut => this.register(shortcut))
  }

  /**
   * 注销快捷键
   */
  unregister(shortcut: Shortcut) {
    const key = this.getShortcutKey(shortcut)
    const shortcuts = this.shortcuts.get(key)
    
    if (shortcuts) {
      const index = shortcuts.indexOf(shortcut)
      if (index > -1) {
        shortcuts.splice(index, 1)
      }
    }
  }

  /**
   * 清空所有快捷键
   */
  clear() {
    this.shortcuts.clear()
  }

  /**
   * 启用快捷键
   */
  enable() {
    this.isActive = true
  }

  /**
   * 禁用快捷键
   */
  disable() {
    this.isActive = false
  }

  /**
   * 切换帮助显示
   */
  toggleHelp() {
    this.helpVisible = !this.helpVisible
  }

  /**
   * 显示帮助
   */
  showHelp() {
    this.helpVisible = true
  }

  /**
   * 隐藏帮助
   */
  hideHelp() {
    this.helpVisible = false
  }

  /**
   * 获取快捷键键值
   */
  private getShortcutKey(shortcut: Shortcut): string {
    const parts = []
    
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.shift) parts.push('shift')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.meta) parts.push('meta')
    
    parts.push(shortcut.key.toLowerCase())
    
    return parts.join('+')
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isActive || !this.config.enabled) return

    const key = event.key.toLowerCase()
    const parts: string[] = []
    
    if (event.ctrlKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    if (event.metaKey) parts.push('meta')
    
    parts.push(key)
    
    const shortcutKey = parts.join('+')
    const shortcuts = this.shortcuts.get(shortcutKey)
    
    if (shortcuts && shortcuts.length > 0) {
      if (this.config.preventDefault) {
        event.preventDefault()
      }
      
      shortcuts.forEach(shortcut => shortcut.action())
    }
  }

  /**
   * 获取所有快捷键
   */
  getAllShortcuts(): Shortcut[] {
    const allShortcuts: Shortcut[] = []
    
    this.shortcuts.forEach(shortcuts => {
      allShortcuts.push(...shortcuts)
    })
    
    return allShortcuts
  }

  /**
   * 按分类获取快捷键
   */
  getShortcutsByCategory(category: ShortcutCategory): Shortcut[] {
    return this.getAllShortcuts().filter(
      shortcut => shortcut.category === category
    )
  }

  /**
   * 获取帮助状态
   */
  isHelpVisible(): boolean {
    return this.helpVisible
  }
}

/**
 * 创建全局快捷键管理器实例
 */
export const shortcutManager = new ShortcutManager()

/**
 * 快捷键Composable
 */
export function useShortcuts() {
  const router = useRouter()
  const isHelpVisible = ref(false)

  /**
   * 注册常用快捷键
   */
  function registerCommonShortcuts() {
    shortcutManager.registerBatch([
      {
        key: 'g',
        ctrl: true,
        description: '打开全局搜索',
        category: ShortcutCategory.SEARCH,
        action: () => {
          ElMessage.info('打开全局搜索')
        }
      },
      {
        key: 'h',
        alt: true,
        description: '显示快捷键帮助',
        category: ShortcutCategory.SYSTEM,
        action: () => {
          isHelpVisible.value = !isHelpVisible.value
        }
      },
      {
        key: 'ArrowLeft',
        alt: true,
        description: '返回上一页',
        category: ShortcutCategory.NAVIGATION,
        action: () => {
          router.back()
        }
      },
      {
        key: 'ArrowRight',
        alt: true,
        description: '前进下一页',
        category: ShortcutCategory.NAVIGATION,
        action: () => {
          router.forward()
        }
      },
      {
        key: '1',
        alt: true,
        description: '跳转到工作台',
        category: ShortcutCategory.NAVIGATION,
        action: () => {
          router.push('/dashboard')
        }
      },
      {
        key: '2',
        alt: true,
        description: '跳转到订单管理',
        category: ShortcutCategory.NAVIGATION,
        action: () => {
          router.push('/orders/list')
        }
      },
      {
        key: '3',
        alt: true,
        description: '跳转到菜单管理',
        category: ShortcutCategory.NAVIGATION,
        action: () => {
          router.push('/menu/items')
        }
      },
      {
        key: '4',
        alt: true,
        description: '跳转到厨房管理',
        category: ShortcutCategory.NAVIGATION,
        action: () => {
          router.push('/kitchen')
        }
      },
      {
        key: 'Escape',
        description: '关闭弹窗/帮助',
        category: ShortcutCategory.SYSTEM,
        action: () => {
          if (isHelpVisible.value) {
            isHelpVisible.value = false
          }
        }
      },
      {
        key: 's',
        ctrl: true,
        description: '保存当前内容',
        category: ShortcutCategory.ACTIONS,
        action: () => {
          ElMessage.success('保存成功')
        }
      },
      {
        key: 'f',
        ctrl: true,
        description: '查找内容',
        category: ShortcutCategory.SEARCH,
        action: () => {
          ElMessage.info('打开查找')
        }
      }
    ])
  }

  /**
   * 格式化快捷键显示
   */
  function formatShortcut(shortcut: Shortcut): string {
    const parts: string[] = []
    
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.meta) parts.push('⌘')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join(' + ')
  }

  /**
   * 获取分类名称
   */
  function getCategoryName(category: ShortcutCategory): string {
    const names: Record<ShortcutCategory, string> = {
      [ShortcutCategory.NAVIGATION]: '导航',
      [ShortcutCategory.ACTIONS]: '操作',
      [ShortcutCategory.SYSTEM]: '系统',
      [ShortcutCategory.SEARCH]: '搜索'
    }
    
    return names[category] || category
  }

  /**
   * 按分类分组快捷键
   */
  function getGroupedShortcuts(): Map<ShortcutCategory, Shortcut[]> {
    const grouped = new Map<ShortcutCategory, Shortcut[]>()
    
    const allShortcuts = shortcutManager.getAllShortcuts()
    
    allShortcuts.forEach(shortcut => {
      const category = shortcut.category || ShortcutCategory.SYSTEM
      
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      
      grouped.get(category)!.push(shortcut)
    })
    
    return grouped
  }

  return {
    shortcutManager,
    isHelpVisible,
    registerCommonShortcuts,
    formatShortcut,
    getCategoryName,
    getGroupedShortcuts
  }
}

/**
 * 快捷键帮助组件
 */
export function useShortcutHelp() {
  const { isHelpVisible, formatShortcut, getCategoryName, getGroupedShortcuts } = useShortcuts()

  const groupedShortcuts = computed(() => getGroupedShortcuts())

  return {
    isHelpVisible,
    groupedShortcuts,
    formatShortcut,
    getCategoryName
  }
}
