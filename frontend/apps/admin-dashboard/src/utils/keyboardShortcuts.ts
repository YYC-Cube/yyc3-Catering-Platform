/**
 * YYC³餐饮行业智能化平台 - 键盘快捷键工具
 */

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  category?: string
}

export interface KeyboardShortcutCategory {
  name: string
  shortcuts: KeyboardShortcut[]
}

class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut[]> = new Map()
  private isInitialized = false
  private helpVisible = false

  constructor() {
    this.init()
  }

  private init() {
    if (this.isInitialized || typeof window === 'undefined') return

    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    this.isInitialized = true
  }

  /**
   * 注册键盘快捷键
   */
  register(shortcut: KeyboardShortcut): () => void {
    // 验证快捷键配置
    if (!shortcut.key || typeof shortcut.key !== 'string') {
      console.warn('⚠️ Invalid keyboard shortcut config - missing or invalid key:', shortcut)
      return () => {} // 返回空的注销函数
    }

    const key = this.getKeyString(shortcut)

    if (!this.shortcuts.has(key)) {
      this.shortcuts.set(key, [])
    }

    this.shortcuts.get(key)!.push(shortcut)

    // 返回注销函数
    return () => {
      const shortcuts = this.shortcuts.get(key)
      if (shortcuts) {
        const index = shortcuts.indexOf(shortcut)
        if (index > -1) {
          shortcuts.splice(index, 1)
        }
        if (shortcuts.length === 0) {
          this.shortcuts.delete(key)
        }
      }
    }
  }

  /**
   * 批量注册快捷键
   */
  registerBatch(shortcuts: KeyboardShortcut[]): () => void {
    const unregisterFunctions = shortcuts.map(shortcut => this.register(shortcut))

    return () => {
      unregisterFunctions.forEach(unregister => unregister())
    }
  }

  /**
   * 根据分类注册快捷键
   */
  registerCategory(category: KeyboardShortcutCategory): () => void {
    return this.registerBatch(category.shortcuts)
  }

  /**
   * 注销所有快捷键
   */
  unregisterAll() {
    this.shortcuts.clear()
  }

  /**
   * 获取所有快捷键
   */
  getAllShortcuts(): KeyboardShortcut[] {
    const allShortcuts: KeyboardShortcut[] = []
    this.shortcuts.forEach(shortcuts => {
      allShortcuts.push(...shortcuts)
    })
    return allShortcuts
  }

  /**
   * 按分类获取快捷键
   */
  getShortcutsByCategory(): Map<string, KeyboardShortcut[]> {
    const categorized = new Map<string, KeyboardShortcut[]>()

    this.shortcuts.forEach(shortcuts => {
      shortcuts.forEach(shortcut => {
        const category = shortcut.category || '其他'
        if (!categorized.has(category)) {
          categorized.set(category, [])
        }
        categorized.get(category)!.push(shortcut)
      })
    })

    return categorized
  }

  /**
   * 显示/隐藏快捷键帮助
   */
  toggleHelp() {
    this.helpVisible = !this.helpVisible
    this.emitHelpChangeEvent()
  }

  /**
   * 显示快捷键帮助
   */
  showHelp() {
    this.helpVisible = true
    this.emitHelpChangeEvent()
  }

  /**
   * 隐藏快捷键帮助
   */
  hideHelp() {
    this.helpVisible = false
    this.emitHelpChangeEvent()
  }

  /**
   * 检查帮助是否可见
   */
  isHelpVisible(): boolean {
    return this.helpVisible
  }

  /**
   * 获取快捷键显示文本
   */
  getShortcutDisplayText(shortcut: KeyboardShortcut): string {
    const parts: string[] = []

    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.metaKey) parts.push('Meta')

    parts.push(shortcut.key.toUpperCase())

    return parts.join(' + ')
  }

  private handleKeyDown(event: KeyboardEvent) {
    // 如果在输入框中，忽略某些快捷键
    const target = event.target as HTMLElement
    const isInputElement = target.tagName === 'INPUT' ||
                         target.tagName === 'TEXTAREA' ||
                         target.contentEditable === 'true'

    const key = this.getKeyString({
      key: event.key,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    })

    const shortcuts = this.shortcuts.get(key)
    if (shortcuts) {
      for (const shortcut of shortcuts) {
        // 在输入框中，除非明确允许，否则不触发快捷键
        if (isInputElement && !this.allowInInput(shortcut)) {
          continue
        }

        event.preventDefault()
        event.stopPropagation()

        try {
          shortcut.action()
        } catch (error) {
          console.error('键盘快捷键执行错误:', error)
        }

        break // 只执行第一个匹配的快捷键
      }
    }
  }

  private allowInInput(shortcut: KeyboardShortcut): boolean {
    // 某些快捷键在输入框中也被允许
    const allowedInInput = [
      'Escape', // 关闭弹窗
      'Enter',  // 确认操作
      'Tab',    // 切换焦点
    ]

    return allowedInInput.includes(shortcut.key) ||
           shortcut.category === '全局操作'
  }

  private getKeyString(shortcut: {
    key: string
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
  }): string {
    const parts: string[] = []

    if (shortcut.ctrlKey) parts.push('ctrl')
    if (shortcut.shiftKey) parts.push('shift')
    if (shortcut.altKey) parts.push('alt')
    if (shortcut.metaKey) parts.push('meta')

    parts.push(shortcut.key.toLowerCase())

    return parts.join('+')
  }

  private helpChangeListeners: ((visible: boolean) => void)[] = []

  /**
   * 监听帮助显示状态变化
   */
  onHelpChange(listener: (visible: boolean) => void): () => void {
    this.helpChangeListeners.push(listener)

    return () => {
      const index = this.helpChangeListeners.indexOf(listener)
      if (index > -1) {
        this.helpChangeListeners.splice(index, 1)
      }
    }
  }

  private emitHelpChangeEvent() {
    this.helpChangeListeners.forEach(listener => {
      try {
        listener(this.helpVisible)
      } catch (error) {
        console.error('帮助状态变化监听器执行错误:', error)
      }
    })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    }
    this.unregisterAll()
    this.helpChangeListeners = []
    this.isInitialized = false
  }
}

// 创建全局实例
export const keyboardShortcuts = new KeyboardShortcutManager()

// 导出一些常用的快捷键配置
export const commonShortcuts: KeyboardShortcutCategory[] = [
  {
    name: '基础操作',
    shortcuts: [
      {
        key: 's',
        ctrlKey: true,
        description: '保存当前操作',
        action: () => {
          // 触发保存操作
          console.log('保存操作')
        },
        category: '基础操作'
      },
      {
        key: 'z',
        ctrlKey: true,
        description: '撤销操作',
        action: () => {
          // 触发撤销操作
          console.log('撤销操作')
        },
        category: '基础操作'
      },
      {
        key: 'y',
        ctrlKey: true,
        description: '重做操作',
        action: () => {
          // 触发重做操作
          console.log('重做操作')
        },
        category: '基础操作'
      }
    ]
  },
  {
    name: '导航操作',
    shortcuts: [
      {
        key: 'h',
        ctrlKey: true,
        description: '显示/隐藏帮助',
        action: () => {
          keyboardShortcuts.toggleHelp()
        },
        category: '导航操作'
      },
      {
        key: '/',
        ctrlKey: true,
        description: '全局搜索',
        action: () => {
          // 触发全局搜索
          console.log('全局搜索')
        },
        category: '导航操作'
      },
      {
        key: 'p',
        ctrlKey: true,
        description: '打开用户设置',
        action: () => {
          // 打开用户设置
          console.log('打开用户设置')
        },
        category: '导航操作'
      }
    ]
  },
  {
    name: '快捷功能',
    shortcuts: [
      {
        key: 'F5',
        description: '刷新页面',
        action: () => {
          window.location.reload()
        },
        category: '快捷功能'
      },
      {
        key: 'F11',
        description: '全屏切换',
        action: () => {
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            document.documentElement.requestFullscreen()
          }
        },
        category: '快捷功能'
      },
      {
        key: 'Escape',
        description: '关闭弹窗/取消操作',
        action: () => {
          // 关闭弹窗或取消操作
          const modals = document.querySelectorAll('.el-overlay-dialog, .el-drawer, .el-message-box')
          modals.forEach(modal => {
            const closeBtn = modal.querySelector('.el-dialog__headerbtn, .el-drawer__close-btn, .el-message-box__headerbtn')
            if (closeBtn) {
              (closeBtn as HTMLElement).click()
            }
          })
        },
        category: '快捷功能'
      }
    ]
  }
]

// 在应用启动时注册常用快捷键
export function initCommonShortcuts() {
  commonShortcuts.forEach(category => {
    keyboardShortcuts.registerCategory(category)
  })
}

// Vue 3 插件形式
export const KeyboardShortcutsPlugin = {
  install(app: any) {
    app.config.globalProperties.$keyboardShortcuts = keyboardShortcuts
    app.provide('keyboardShortcuts', keyboardShortcuts)

    // 初始化常用快捷键
    initCommonShortcuts()
  }
}

// 组合式 API
export function useKeyboardShortcuts() {
  return keyboardShortcuts
}

export default keyboardShortcuts