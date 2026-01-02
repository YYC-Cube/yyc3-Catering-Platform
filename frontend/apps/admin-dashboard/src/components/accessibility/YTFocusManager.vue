<!--
 YYC³餐饮管理系统 - 焦点管理组件
 基于WCAG 2.1 AA标准实现
 依托: YYC³系统色设计令牌 + 可访问性标准
-->
<template>
  <div
    ref="containerRef"
    class="yt-focus-manager"
    :class="focusManagerClasses"
    @keydown="handleKeyNavigation"
    tabindex="-1"
  >
    <!-- 跳转链接 -->
    <div v-if="showSkipLinks" class="skip-links">
      <a
        v-for="link in skipLinks"
        :key="link.target"
        :href="link.target"
        class="skip-link"
        @click="handleSkipLink(link)"
      >
        {{ link.text }}
      </a>
    </div>

    <!-- 焦点指示器 -->
    <div
      v-if="showFocusIndicator && currentFocusedElement"
      class="focus-indicator"
      :style="focusIndicatorStyle"
      aria-hidden="true"
    />

    <!-- 键盘导航提示 -->
    <div
      v-if="showKeyboardHelp && keyboardHelpVisible"
      class="keyboard-help"
      role="tooltip"
      aria-live="polite"
    >
      <div class="keyboard-help-content">
        <h4>键盘快捷键</h4>
        <ul>
          <li v-for="shortcut in keyboardShortcuts" :key="shortcut.key">
            <kbd>{{ shortcut.key }}</kbd>
            <span>{{ shortcut.description }}</span>
          </li>
        </ul>
        <button @click="hideKeyboardHelp" class="close-help">
          关闭 (ESC)
        </button>
      </div>
    </div>

    <!-- 主要内容 -->
    <slot
      :focused-element="currentFocusedElement"
      :focus-next="focusNext"
      :focus-previous="focusPrevious"
      :set-focus="setFocus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface SkipLink {
  target: string
  text: string
}

interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
}

interface Props {
  // 焦点管理
  focusTrap?: boolean
  restoreFocus?: boolean
  initialFocus?: string
  showSkipLinks?: boolean

  // 视觉反馈
  showFocusIndicator?: boolean
  focusIndicatorColor?: string

  // 键盘帮助
  showKeyboardHelp?: boolean
  keyboardHelpTrigger?: string[]

  // 可访问性选项
  announceFocusChanges?: boolean
  respectReducedMotion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  focusTrap: false,
  restoreFocus: true,
  initialFocus: '',
  showSkipLinks: true,
  showFocusIndicator: true,
  focusIndicatorColor: 'var(--color-primary)',
  showKeyboardHelp: true,
  keyboardHelpTrigger: () => ['F1', '?'],
  announceFocusChanges: true,
  respectReducedMotion: true
})

// 响应式数据
const containerRef = ref<HTMLElement>()
const currentFocusedElement = ref<HTMLElement>()
const previousFocusedElement = ref<HTMLElement>()
const keyboardHelpVisible = ref(false)
const focusableElements = ref<HTMLElement[]>([])

// 跳转链接配置
const skipLinks = ref<SkipLink[]>([
  { target: '#main-content', text: '跳转到主要内容' },
  { target: '#main-navigation', text: '跳转到主导航' },
  { target: '#main-search', text: '跳转到搜索' },
  { target: '#order-status', text: '跳转到订单状态' }
])

// 键盘快捷键配置
const keyboardShortcuts = ref<KeyboardShortcut[]>([
  {
    key: 'Tab / Shift+Tab',
    description: '在元素间导航',
    action: () => {}
  },
  {
    key: 'Enter / Space',
    description: '激活按钮或链接',
    action: () => {}
  },
  {
    key: 'Arrow Keys',
    description: '在列表和菜单中导航',
    action: () => {}
  },
  {
    key: 'ESC',
    description: '关闭对话框或取消操作',
    action: () => hideKeyboardHelp()
  },
  {
    key: 'Alt + H',
    description: '显示键盘帮助',
    action: () => showKeyboardHelp()
  },
  {
    key: 'Home / End',
    description: '跳转到列表开头或结尾',
    action: () => {}
  }
])

// 计算属性
const focusManagerClasses = computed(() => [
  'yt-focus-manager',
  {
    'yt-focus-manager--trap': props.focusTrap,
    'yt-focus-manager--show-indicator': props.showFocusIndicator,
    'yt-focus-manager--reduced-motion': props.respectReducedMotion && prefersReducedMotion.value
  }
])

const focusIndicatorStyle = computed(() => {
  if (!currentFocusedElement.value) return {}

  const rect = currentFocusedElement.value.getBoundingClientRect()
  const containerRect = containerRef.value?.getBoundingClientRect()

  return {
    left: `${rect.left - (containerRect?.left || 0)}px`,
    top: `${rect.top - (containerRect?.top || 0)}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderColor: props.focusIndicatorColor
  }
})

const prefersReducedMotion = computed(() => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 方法
const updateFocusableElements = () => {
  if (!containerRef.value) return

  const selector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]:not([disabled])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])'
  ].join(', ')

  focusableElements.value = Array.from(
    containerRef.value.querySelectorAll(selector)
  ) as HTMLElement[]
}

const handleKeyNavigation = (event: KeyboardEvent) => {
  const { key, altKey, ctrlKey, shiftKey } = event

  // 处理键盘快捷键
  if (altKey && key === 'h') {
    event.preventDefault()
    showKeyboardHelp()
    return
  }

  if (key === 'Escape') {
    if (keyboardHelpVisible.value) {
      event.preventDefault()
      hideKeyboardHelp()
      return
    }

    if (props.restoreFocus && previousFocusedElement.value) {
      event.preventDefault()
      restorePreviousFocus()
      return
    }
  }

  // 焦点陷阱逻辑
  if (props.focusTrap) {
    const elements = focusableElements.value
    const currentIndex = elements.indexOf(currentFocusedElement.value!)

    switch (key) {
      case 'Tab':
        event.preventDefault()
        if (shiftKey) {
          focusPrevious()
        } else {
          focusNext()
        }
        break

      case 'Home':
        event.preventDefault()
        setFocus(elements[0])
        break

      case 'End':
        event.preventDefault()
        setFocus(elements[elements.length - 1])
        break
    }
  }
}

const focusNext = () => {
  const elements = focusableElements.value
  const currentIndex = elements.indexOf(currentFocusedElement.value!)
  const nextIndex = (currentIndex + 1) % elements.length
  setFocus(elements[nextIndex])
}

const focusPrevious = () => {
  const elements = focusableElements.value
  const currentIndex = elements.indexOf(currentFocusedElement.value!)
  const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1
  setFocus(elements[prevIndex])
}

const setFocus = (element: HTMLElement | null) => {
  if (!element || element === currentFocusedElement.value) return

  // 保存当前焦点元素
  previousFocusedElement.value = currentFocusedElement.value

  // 设置新焦点
  currentFocusedElement.value = element
  element.focus()

  // 通知焦点变化
  if (props.announceFocusChanges) {
    announceFocusChange(element)
  }

  // 触觉反馈 (如果支持)
  if (navigator.vibrate) {
    navigator.vibrate(30)
  }
}

const announceFocusChange = (element: HTMLElement) => {
  const announcement = getFocusAnnouncement(element)
  if (announcement) {
    const announcementElement = document.createElement('div')
    announcementElement.setAttribute('aria-live', 'polite')
    announcementElement.setAttribute('aria-atomic', 'true')
    announcementElement.className = 'sr-only'
    announcementElement.textContent = announcement

    document.body.appendChild(announcementElement)

    setTimeout(() => {
      document.body.removeChild(announcementElement)
    }, 1000)
  }
}

const getFocusAnnouncement = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase()
  const role = element.getAttribute('role')
  const label = element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent

  if (role) {
    switch (role) {
      case 'button':
        return `按钮 ${label || '未标记'}`
      case 'link':
        return `链接 ${label || '未标记'}`
      case 'navigation':
        return '导航区域'
      case 'main':
        return '主要内容区域'
      case 'complementary':
        return '辅助信息区域'
      case 'contentinfo':
        return '页脚信息'
      default:
        return `${role} 区域`
    }
  }

  switch (tagName) {
    case 'button':
      return `按钮 ${label || '未标记'}`
    case 'a':
      return `链接 ${label || '未标记'}`
    case 'input':
      const inputType = element.getAttribute('type') || 'text'
      return `输入框 ${element.getAttribute('placeholder') || inputType}`
    case 'select':
      return `下拉菜单 ${label || '未标记'}`
    case 'textarea':
      return `文本区域 ${element.getAttribute('placeholder') || '未标记'}`
    default:
      return label || `${tagName} 元素`
  }
}

const restorePreviousFocus = () => {
  if (previousFocusedElement.value) {
    setFocus(previousFocusedElement.value)
  }
}

const handleSkipLink = (link: SkipLink) => {
  const target = document.querySelector(link.target) as HTMLElement
  if (target) {
    target.focus()
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

const showKeyboardHelp = () => {
  keyboardHelpVisible.value = true
}

const hideKeyboardHelp = () => {
  keyboardHelpVisible.value = false
}

// 焦点观察器
const setupFocusObserver = () => {
  const observer = new MutationObserver(() => {
    updateFocusableElements()
  })

  if (containerRef.value) {
    observer.observe(containerRef.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'aria-hidden']
    })
  }

  return observer
}

// 生命周期
onMounted(() => {
  updateFocusableElements()
  setupFocusObserver()

  // 设置初始焦点
  if (props.initialFocus) {
    const initialElement = document.querySelector(props.initialFocus) as HTMLElement
    if (initialElement) {
      nextTick(() => {
        setFocus(initialElement)
      })
    }
  }

  // 监听焦点变化
  document.addEventListener('focusin', handleGlobalFocusChange, true)
  window.addEventListener('resize', updateFocusableElements)
})

onUnmounted(() => {
  document.removeEventListener('focusin', handleGlobalFocusChange, true)
  window.removeEventListener('resize', updateFocusableElements)
})

const handleGlobalFocusChange = (event: FocusEvent) => {
  const target = event.target as HTMLElement

  // 检查焦点是否在容器内
  if (containerRef.value?.contains(target)) {
    currentFocusedElement.value = target
  } else if (props.focusTrap && currentFocusedElement.value) {
    // 如果启用了焦点陷阱，焦点离开容器时将其拉回
    event.preventDefault()
    currentFocusedElement.value?.focus()
  }
}

// 监听容器变化
watch(() => props.focusTrap, (newValue) => {
  if (newValue) {
    updateFocusableElements()
  }
})

// 暴露方法
defineExpose({
  setFocus,
  focusNext,
  focusPrevious,
  updateFocusableElements,
  currentFocusedElement,
  focusableElements,
  showKeyboardHelp,
  hideKeyboardHelp
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss';

.yt-focus-manager {
  position: relative;

  // 焦点指示器
  .focus-indicator {
    position: absolute;
    pointer-events: none;
    border: 2px solid var(--color-primary);
    border-radius: 4px;
    z-index: var(--z-index-focus-indicator);
    transition: all 0.2s ease-out;

    &--reduced-motion {
      transition: none;
    }
  }

  // 跳转链接
  .skip-links {
    position: fixed;
    top: -40px;
    left: 0;
    z-index: var(--z-index-skip-links);

    .skip-link {
      position: absolute;
      left: 6px;
      background: var(--color-primary);
      color: white;
      padding: 8px 12px;
      text-decoration: none;
      border-radius: $border-radius-base;
      font-weight: $font-weight-medium;
      font-size: $font-size-body-small;

      &:focus {
        top: 6px;
      }

      &:hover {
        background: var(--color-primary-dark);
      }
    }
  }

  // 键盘帮助
  .keyboard-help {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: $border-radius-lg;
    padding: var(--spacing-xl);
    box-shadow: $shadow-xl;
    z-index: var(--z-index-modal);
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;

    .keyboard-help-content {
      h4 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
        font-size: $font-size-h4;
        font-weight: $font-weight-semibold;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--spacing-lg) 0;

        li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--color-border);

          &:last-child {
            border-bottom: none;
          }

          kbd {
            background: var(--color-darker);
            color: var(--color-text-primary);
            padding: 2px 6px;
            border-radius: $border-radius-sm;
            font-family: monospace;
            font-size: $font-size-body-small;
            border: 1px solid var(--color-border);
          }

          span {
            color: var(--color-text-secondary);
            font-size: $font-size-body-normal;
            margin-left: var(--spacing-md);
          }
        }
      }

      .close-help {
        background: var(--color-primary);
        color: white;
        border: none;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: $border-radius-base;
        cursor: pointer;
        font-size: $font-size-body-normal;

        &:hover, &:focus {
          background: var(--color-primary-dark);
        }

        &:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
      }
    }
  }

  // 高对比度模式
  @media (prefers-contrast: high) {
    .focus-indicator {
      border-width: 3px;
      border-color: #000000;
    }

    .skip-link {
      border: 2px solid #000000;
    }
  }

  // 暗色模式
  @media (prefers-color-scheme: dark) {
    .keyboard-help {
      background: var(--color-surface-dark);
      border-color: var(--color-border);

      .keyboard-help-content {
        kbd {
          background: var(--color-darker);
          border-color: var(--color-border);
        }
      }
    }
  }
}

// 屏幕阅读器专用样式
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>