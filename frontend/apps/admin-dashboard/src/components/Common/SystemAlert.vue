<template>
  <teleport to="body">
    <transition name="alert-fade" appear>
      <div v-if="alerts.length > 0" class="system-alert-container">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          :class="['system-alert', `alert-${alert.level}`]"
          role="alert"
          :aria-live="alert.level === 'error' ? 'assertive' : 'polite'"
        >
          <div class="alert-icon">
            <el-icon :size="24">
              <component :is="getAlertIcon(alert.level)" />
            </el-icon>
          </div>
          
          <div class="alert-content">
            <div class="alert-header" v-if="alert.title || alert.timestamp">
              <h3 class="alert-title" v-if="alert.title">{{ alert.title }}</h3>
              <div class="alert-timestamp" v-if="alert.timestamp">
                {{ formatTimestamp(alert.timestamp) }}
              </div>
            </div>
            
            <div class="alert-message">
              {{ alert.message }}
            </div>
            
            <div class="alert-actions" v-if="alert.actions && alert.actions.length > 0">
              <el-button
                v-for="action in alert.actions"
                :key="action.key"
                :type="action.type || 'default'"
                :size="action.size || 'small'"
                @click="handleAction(alert, action)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </div>
          
          <div 
            v-if="alert.closable !== false"
            class="alert-close"
            @click="closeAlert(alert.id)"
            :title="'关闭 (Esc)'"
          >
            <el-icon><Close /></el-icon>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useSystemAlertStore } from '@/stores/systemAlert'
import {
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
  Close
} from '@element-plus/icons-vue'

interface SystemAlert {
  id: string
  level: 'info' | 'warning' | 'error' | 'success'
  title?: string
  message: string
  timestamp?: number
  closable?: boolean
  autoClose?: boolean
  duration?: number
  actions?: Array<{
    key: string
    label: string
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'large' | 'default' | 'small'
    action: (alert: SystemAlert) => void | Promise<void>
  }>
}

const systemAlertStore = useSystemAlertStore()

const alerts = computed(() => systemAlertStore.alerts)

const getAlertIcon = (level: string) => {
  const iconMap = {
    success: SuccessFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    info: InfoFilled
  }
  return iconMap[level as keyof typeof iconMap] || InfoFilled
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const closeAlert = (id: string) => {
  systemAlertStore.removeAlert(id)
}

const handleAction = async (alert: SystemAlert, action: any) => {
  try {
    await action.action(alert)
    // 如果操作成功，可以关闭警告
    if (action.autoClose !== false) {
      closeAlert(alert.id)
    }
  } catch (error) {
    console.error('System alert action failed:', error)
    // 可以显示错误信息
    systemAlertStore.addAlert({
      level: 'error',
      title: '操作失败',
      message: `执行 "${action.label}" 操作时发生错误`,
      duration: 5000
    })
  }
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && alerts.value.length > 0) {
    // 关闭最新的警告
    const latestAlert = alerts.value[alerts.value.length - 1]
    if (latestAlert.closable !== false) {
      closeAlert(latestAlert.id)
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.system-alert-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.system-alert {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-left: 4px solid;
  pointer-events: all;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;

  &.alert-info {
    border-left-color: var(--el-color-info);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    
    .alert-icon {
      color: var(--el-color-info);
    }
  }

  &.alert-success {
    border-left-color: var(--el-color-success);
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    
    .alert-icon {
      color: var(--el-color-success);
    }
  }

  &.alert-warning {
    border-left-color: var(--el-color-warning);
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    
    .alert-icon {
      color: var(--el-color-warning);
    }
  }

  &.alert-error {
    border-left-color: var(--el-color-danger);
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    
    .alert-icon {
      color: var(--el-color-danger);
    }
  }
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 16px;
}

.alert-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.alert-timestamp {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  margin-top: 2px;
}

.alert-message {
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  margin-bottom: 16px;
  word-wrap: break-word;
}

.alert-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.alert-close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--el-text-color-secondary);

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: var(--el-text-color-primary);
  }
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.4s ease;
}

.alert-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.alert-fade-move {
  transition: transform 0.4s ease;
}

// 响应式设计
@media (max-width: 768px) {
  .system-alert-container {
    padding: 8px;
  }

  .system-alert {
    padding: 12px 16px;
    gap: 12px;
  }

  .alert-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .alert-title {
    font-size: 15px;
  }

  .alert-message {
    font-size: 13px;
  }

  .alert-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .system-alert {
    &.alert-info {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    }

    &.alert-success {
      background: linear-gradient(135deg, #14532d 0%, #166534 100%);
    }

    &.alert-warning {
      background: linear-gradient(135deg, #713f12 0%, #854d0e 100%);
    }

    &.alert-error {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
    }

    .alert-title,
    .alert-message {
      color: rgba(255, 255, 255, 0.9);
    }

    .alert-timestamp {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .system-alert {
    border-width: 2px;
    border-style: solid;
  }
}

// 动画性能优化
@media (prefers-reduced-motion: reduce) {
  .alert-fade-enter-active,
  .alert-fade-leave-active,
  .alert-fade-move {
    transition: none;
  }
}
</style>
