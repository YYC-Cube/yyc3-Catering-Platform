<!--
 YYC³餐饮管理系统 - 屏幕阅读器通知组件
 基于WCAG 2.1 AA标准实现
 依托: YYC³系统色设计令牌 + 可访问性标准
-->
<template>
  <div
    ref="announcerRef"
    class="yt-announcer"
    aria-live="assertive"
    aria-atomic="true"
    role="status"
    :aria-busy="isAnnouncing"
  >
    <!-- 动态通知内容 -->
    <div
      v-for="announcement in announcements"
      :key="announcement.id"
      class="announcement"
      :class="`announcement--${announcement.type}`"
      :aria-label="announcement.message"
    >
      {{ announcement.message }}
    </div>

    <!-- 状态指示器 -->
    <div
      v-if="showStatusIndicator"
      class="status-indicator"
      :class="statusClasses"
      :aria-label="statusMessage"
      role="img"
      :aria-hidden="!isAnnouncing"
    >
      <div class="status-icon">{{ statusIcon }}</div>
      <div class="status-text" v-if="showStatusText">{{ statusMessage }}</div>
    </div>

    <!-- 进度通知 -->
    <div
      v-if="showProgress && currentProgress"
      class="progress-announcement"
      role="progressbar"
      :aria-valuenow="currentProgress.value"
      :aria-valuemin="currentProgress.min"
      :aria-valuemax="currentProgress.max"
      :aria-label="currentProgress.label"
    >
      {{ currentProgress.message }}
    </div>

    <!-- 错误和成功通知 -->
    <div
      v-if="errorNotification"
      class="error-notification"
      role="alert"
      aria-live="assertive"
    >
      {{ errorNotification }}
    </div>

    <div
      v-if="successNotification"
      class="success-notification"
      role="status"
      aria-live="polite"
    >
      {{ successNotification }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

interface Announcement {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: number
  timestamp: number
}

interface ProgressInfo {
  value: number
  min: number
  max: number
  label: string
  message: string
}

interface Props {
  // 显示选项
  showStatusIndicator?: boolean
  showStatusText?: boolean
  showProgress?: boolean
  autoClear?: boolean
  clearDelay?: number

  // 通知配置
  maxAnnouncements?: number
  defaultPriority?: number

  // 视觉反馈
  enableAnimations?: boolean
  respectReducedMotion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatusIndicator: true,
  showStatusText: true,
  showProgress: true,
  autoClear: true,
  clearDelay: 5000,
  maxAnnouncements: 3,
  defaultPriority: 1,
  enableAnimations: true,
  respectReducedMotion: true
})

// 响应式数据
const announcerRef = ref<HTMLElement>()
const announcements = ref<Announcement[]>([])
const currentProgress = ref<ProgressInfo>()
const errorNotification = ref<string>()
const successNotification = ref<string>()
const isAnnouncing = ref(false)

// 计算属性
const statusClasses = computed(() => [
  'status-indicator',
  {
    'status-indicator--announcing': isAnnouncing.value,
    'status-indicator--error': !!errorNotification.value,
    'status-indicator--success': !!successNotification.value,
    'status-indicator--progress': !!currentProgress.value
  }
])

const statusMessage = computed(() => {
  if (errorNotification.value) return `错误：${errorNotification.value}`
  if (successNotification.value) return `成功：${successNotification.value}`
  if (currentProgress.value) return currentProgress.value.message
  if (isAnnouncing.value) return '正在处理中...'
  return '就绪'
})

const statusIcon = computed(() => {
  if (errorNotification.value) return '⚠️'
  if (successNotification.value) return '✅'
  if (currentProgress.value) return '⏳'
  if (isAnnouncing.value) return '🔄'
  return '👂'
})

const prefersReducedMotion = computed(() => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 方法
const announce = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', priority: number = props.defaultPriority) => {
  const announcement: Announcement = {
    id: `announcement-${Date.now()}-${Math.random()}`,
    message,
    type,
    priority,
    timestamp: Date.now()
  }

  // 添加到通知列表
  announcements.value.push(announcement)

  // 按优先级和时间排序
  announcements.value.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    return b.timestamp - a.timestamp
  })

  // 限制通知数量
  if (announcements.value.length > props.maxAnnouncements) {
    announcements.value = announcements.value.slice(0, props.maxAnnouncements)
  }

  // 设置 announcing 状态
  isAnnouncing.value = true

  // 触觉反馈
  if (navigator.vibrate) {
    switch (type) {
      case 'error':
        navigator.vibrate([200, 100, 200])
        break
      case 'success':
        navigator.vibrate([100, 50, 100])
        break
      case 'warning':
        navigator.vibrate([150])
        break
      default:
        navigator.vibrate([50])
    }
  }

  // 自动清除
  if (props.autoClear) {
    setTimeout(() => {
      clearAnnouncement(announcement.id)
    }, props.clearDelay)
  }

  // 触发通知事件
  nextTick(() => {
    dispatchCustomEvent('announced', {
      message,
      type,
      priority,
      id: announcement.id
    })
  })
}

const clearAnnouncement = (id: string) => {
  const index = announcements.value.findIndex(a => a.id === id)
  if (index > -1) {
    announcements.value.splice(index, 1)
  }

  // 如果没有更多通知，重置 announcing 状态
  if (announcements.value.length === 0) {
    isAnnouncing.value = false
  }
}

const clearAllAnnouncements = () => {
  announcements.value = []
  isAnnouncing.value = false
}

// 专门的通知方法
const announceSuccess = (message: string) => {
  successNotification.value = message
  announce(message, 'success', 3)

  setTimeout(() => {
    successNotification.value = undefined
  }, props.clearDelay)
}

const announceError = (message: string) => {
  errorNotification.value = message
  announce(message, 'error', 5)

  setTimeout(() => {
    errorNotification.value = undefined
  }, props.clearDelay)
}

const announceWarning = (message: string) => {
  announce(message, 'warning', 4)
}

const announceInfo = (message: string) => {
  announce(message, 'info', 2)
}

// 进度通知
const announceProgress = (progress: ProgressInfo) => {
  currentProgress.value = progress

  const message = `进度：${progress.value}/${progress.max} - ${progress.message}`
  announce(message, 'info', 1)

  // 如果进度完成，自动清除
  if (progress.value >= progress.max) {
    setTimeout(() => {
      currentProgress.value = undefined
    }, 2000)
  }
}

// 状态通知
const announceStatusChange = (status: string, oldValue?: string) => {
  const message = oldValue
    ? `状态从 ${oldValue} 更改为 ${status}`
    : `状态变更为 ${status}`

  announce(message, 'info', 3)
}

// 导航通知
const announceNavigation = (destination: string, from?: string) => {
  const message = from
    ? `从 ${from} 导航到 ${destination}`
    : `导航到 ${destination}`

  announce(message, 'info', 2)
}

// 表单通知
const announceFormValidation = (fieldName: string, isValid: boolean, message?: string) => {
  const statusText = isValid ? '有效' : '无效'
  const fullMessage = message
    ? `${fieldName}：${message}`
    : `${fieldName} 验证${statusText}`

  announce(fullMessage, isValid ? 'success' : 'error', 4)
}

// YYC³餐饮系统专用通知
const announceOrderStatus = (orderId: string, status: string, previousStatus?: string) => {
  const message = previousStatus
    ? `订单 ${orderId} 状态从 ${previousStatus} 更改为 ${status}`
    : `订单 ${orderId} 状态为 ${status}`

  announce(message, 'info', 3)
}

const announceKitchenUpdate = (orderId: string, dishName: string, status: string) => {
  const message = `订单 ${orderId} 的菜品 ${dishName} ${status}`
  announce(message, 'info', 4)
}

const announceTableStatus = (tableId: string, status: string, partySize?: number) => {
  const message = partySize
    ? `餐桌 ${tableId} ${status}，${partySize} 人`
    : `餐桌 ${tableId} ${status}`

  announce(message, 'info', 3)
}

const announceInventoryAlert = (itemName: string, currentLevel: number, minLevel: number) => {
  const message = `库存警告：${itemName} 当前库存 ${currentLevel}，低于最小库存 ${minLevel}`
  announce(message, 'warning', 5)
}

// 自定义事件
const dispatchCustomEvent = (eventType: string, detail: any) => {
  const event = new CustomEvent(`yt-announcer:${eventType}`, {
    detail,
    bubbles: true,
    composed: true
  })
  document.dispatchEvent(event)
}

// 监听全局事件
onMounted(() => {
  // 监听全局通知事件
  document.addEventListener('yt-announce', (event: any) => {
    const { message, type, priority } = event.detail
    announce(message, type, priority)
  })

  document.addEventListener('yt-announce-success', (event: any) => {
    announceSuccess(event.detail.message)
  })

  document.addEventListener('yt-announce-error', (event: any) => {
    announceError(event.detail.message)
  })

  document.addEventListener('yt-announce-warning', (event: any) => {
    announceWarning(event.detail.message)
  })

  document.addEventListener('yt-announce-info', (event: any) => {
    announceInfo(event.detail.message)
  })

  // 监听进度事件
  document.addEventListener('yt-announce-progress', (event: any) => {
    announceProgress(event.detail)
  })

  // 监听 YYC³特定事件
  document.addEventListener('yt-order-status-change', (event: any) => {
    announceOrderStatus(event.detail.orderId, event.detail.status, event.detail.previousStatus)
  })

  document.addEventListener('yt-kitchen-update', (event: any) => {
    announceKitchenUpdate(event.detail.orderId, event.detail.dishName, event.detail.status)
  })

  document.addEventListener('yt-table-status-change', (event: any) => {
    announceTableStatus(event.detail.tableId, event.detail.status, event.detail.partySize)
  })

  document.addEventListener('yt-inventory-alert', (event: any) => {
    announceInventoryAlert(event.detail.itemName, event.detail.currentLevel, event.detail.minLevel)
  })
})

// 监听通知变化，更新 announcing 状态
watch(announcements, (newAnnouncements) => {
  isAnnouncing.value = newAnnouncements.length > 0
}, { deep: true })

// 暴露方法
defineExpose({
  announce,
  announceSuccess,
  announceError,
  announceWarning,
  announceInfo,
  announceProgress,
  announceStatusChange,
  announceNavigation,
  announceFormValidation,
  announceOrderStatus,
  announceKitchenUpdate,
  announceTableStatus,
  announceInventoryAlert,
  clearAnnouncement,
  clearAllAnnouncements,
  announcements,
  isAnnouncing,
  currentProgress,
  errorNotification,
  successNotification
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss';

.yt-announcer {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;

  // 状态指示器 (可选，用于调试)
  .status-indicator {
    position: fixed;
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: $border-radius-lg;
    padding: var(--spacing-md);
    box-shadow: $shadow-lg;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    z-index: var(--z-index-notification);
    min-width: 200px;
    transition: all $transition-base;

    &--announcing {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary-dark);

      .status-icon {
        animation: pulse 1.5s ease-in-out infinite;
      }
    }

    &--error {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--color-danger);
      color: var(--color-danger);

      .status-icon {
        animation: shake 0.5s ease-in-out;
      }
    }

    &--success {
      background: rgba(16, 185, 129, 0.1);
      border-color: var(--color-success);
      color: var(--color-success);
    }

    &--progress {
      background: rgba(79, 70, 229, 0.1);
      border-color: var(--color-primary);
      color: var(--color-primary);

      .status-icon {
        animation: spin 2s linear infinite;
      }
    }

    .status-icon {
      font-size: $font-size-lg;
      line-height: 1;
    }

    .status-text {
      flex: 1;
      font-size: $font-size-body-small;
      font-weight: $font-weight-medium;
    }
  }

  // 进度通知
  .progress-announcement {
    // 被隐藏但可以被屏幕阅读器读取
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

  // 错误通知
  .error-notification,
  .success-notification {
    // 被隐藏但可以被屏幕阅读器读取
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
}

// 动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  .status-indicator {
    transition: none;

    .status-icon {
      animation: none;
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .status-indicator {
    border-width: 2px;
    border-color: currentColor;
  }
}

// 暗色模式
@media (prefers-color-scheme: dark) {
  .status-indicator {
    background: var(--color-surface-dark);
    border-color: var(--color-border);

    &--announcing {
      background: var(--color-primary);
      color: white;
    }

    &--error {
      background: rgba(239, 68, 68, 0.2);
    }

    &--success {
      background: rgba(16, 185, 129, 0.2);
    }

    &--progress {
      background: rgba(79, 70, 229, 0.2);
    }
  }
}
</style>