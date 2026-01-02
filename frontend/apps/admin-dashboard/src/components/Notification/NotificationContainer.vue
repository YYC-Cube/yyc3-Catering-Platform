<template>
  <teleport to="body">
    <transition name="notification-fade" appear>
      <div v-if="notifications.length > 0" class="notification-container">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification-item', `notification-${notification.type}`]"
          @click="removeNotification(notification.id)"
        >
          <div class="notification-icon">
            <el-icon>
              <component :is="getNotificationIcon(notification.type)" />
            </el-icon>
          </div>
          <div class="notification-content">
            <div class="notification-title" v-if="notification.title">
              {{ notification.title }}
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
          </div>
          <div class="notification-close" @click.stop="removeNotification(notification.id)">
            <el-icon><Close /></el-icon>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import {
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
  Close
} from '@element-plus/icons-vue'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

const removeNotification = (id: string) => {
  notificationStore.removeNotification(id)
}

const getNotificationIcon = (type: string) => {
  const iconMap = {
    success: SuccessFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    info: InfoFilled
  }
  return iconMap[type as keyof typeof iconMap] || InfoFilled
}
</script>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  pointer-events: all;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }

  &.notification-success {
    border-left-color: var(--el-color-success);
    .notification-icon {
      color: var(--el-color-success);
    }
  }

  &.notification-warning {
    border-left-color: var(--el-color-warning);
    .notification-icon {
      color: var(--el-color-warning);
    }
  }

  &.notification-error {
    border-left-color: var(--el-color-danger);
    .notification-icon {
      color: var(--el-color-danger);
    }
  }

  &.notification-info {
    border-left-color: var(--el-color-info);
    .notification-icon {
      color: var(--el-color-info);
    }
  }
}

.notification-icon {
  flex-shrink: 0;
  font-size: 20px;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.notification-message {
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  word-wrap: break-word;
}

.notification-close {
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s ease;
}

.notification-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-fade-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .notification-item {
    min-width: auto;
    max-width: none;
  }
}

@media (prefers-color-scheme: dark) {
  .notification-item {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
  }
}
</style>
