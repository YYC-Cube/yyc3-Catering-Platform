<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 离线状态指示器组件
 * @description 显示网络连接状态，提供离线提示和重连功能
 * @module OfflineIndicator
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <Transition name="slide-down">
    <div v-if="isVisible" class="offline-indicator" :class="indicatorClasses">
      <div class="indicator-content">
        <div class="indicator-icon">
          <el-icon :size="20">
            <component :is="statusIcon" />
          </el-icon>
        </div>
        <div class="indicator-text">
          <div class="text-main">{{ statusText }}</div>
          <div v-if="isReconnecting" class="text-sub">正在尝试重新连接...</div>
        </div>
        <div v-if="isOffline" class="indicator-actions">
          <el-button
            type="primary"
            size="small"
            @click="handleRetry"
            :loading="isReconnecting"
          >
            重试
          </el-button>
        </div>
        <el-button
          type="text"
          size="small"
          @click="handleClose"
          class="close-btn"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Connection, CircleClose, Loading, Close } from '@element-plus/icons-vue'
import { useOfflineNavigation, OfflineStatus } from '@/composables/useOfflineNavigation'

interface Props {
  show?: boolean
  autoHide?: boolean
  hideDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  autoHide: false,
  hideDelay: 3000
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const {
  status,
  isOnline,
  isOffline,
  isReconnecting,
  initialize,
  getStatusText,
  getStatusIcon
} = useOfflineNavigation()

const isVisible = ref(false)
const hideTimer = ref<number | null>(null)

const indicatorClasses = computed(() => ({
  'is-online': isOnline.value,
  'is-offline': isOffline.value,
  'is-reconnecting': isReconnecting.value
}))

const statusText = computed(() => getStatusText())

const statusIcon = computed(() => {
  const iconName = getStatusIcon()
  const iconMap: Record<string, any> = {
    Connection,
    CircleClose,
    Loading
  }
  return iconMap[iconName] || Connection
})

function handleRetry() {
  window.location.reload()
}

function handleClose() {
  isVisible.value = false
  emit('close')
}

function handleStatusChange(newStatus: OfflineStatus) {
  if (newStatus === OfflineStatus.OFFLINE) {
    isVisible.value = true
  } else if (newStatus === OfflineStatus.ONLINE && props.autoHide) {
    if (hideTimer.value) clearTimeout(hideTimer.value)
    
    hideTimer.value = window.setTimeout(() => {
      isVisible.value = false
    }, props.hideDelay)
  }
}

initialize()
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-notification);
  background: var(--color-bg-primary);
  border-bottom: 2px solid var(--color-border-primary);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  transition: all 0.3s ease;

  &.is-online {
    border-color: var(--color-success);
    background: var(--color-success-light);
  }

  &.is-offline {
    border-color: var(--color-danger);
    background: var(--color-danger-light);
  }

  &.is-reconnecting {
    border-color: var(--color-warning);
    background: var(--color-warning-light);
  }
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 1200px;
  margin: 0 auto;
}

.indicator-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-full);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all 0.2s ease;

  .is-online & {
    color: var(--color-success);
  }

  .is-offline & {
    color: var(--color-danger);
  }

  .is-reconnecting & {
    color: var(--color-warning);
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.indicator-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.text-main {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-primary);
}

.text-sub {
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
}

.indicator-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.close-btn {
  color: var(--color-text-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (max-width: $breakpoint-md) {
  .offline-indicator {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .indicator-content {
    gap: var(--spacing-sm);
  }

  .indicator-icon {
    width: 32px;
    height: 32px;

    .el-icon {
      font-size: 16px;
    }
  }

  .text-main {
    font-size: var(--font-size-body-small);
  }

  .text-sub {
    font-size: var(--font-size-body-tiny);
  }
}

@media (max-width: $breakpoint-sm) {
  .offline-indicator {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .indicator-content {
    gap: var(--spacing-xs);
  }

  .indicator-icon {
    width: 28px;
    height: 28px;

    .el-icon {
      font-size: 14px;
    }
  }

  .text-main {
    font-size: var(--font-size-body-tiny);
  }

  .text-sub {
    display: none;
  }

  .indicator-actions {
    .el-button {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-body-tiny);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .offline-indicator {
    transition: none;
  }

  .indicator-icon {
    &.is-reconnecting {
      animation: none;
    }
  }

  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: none;
  }
}
</style>
