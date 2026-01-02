<template>
  <div class="notification-center">
    <!-- 通知铃铛 -->
    <el-badge
      :value="unreadCount"
      :hidden="unreadCount === 0"
      :max="99"
      class="notification-bell"
      @click="toggleNotificationPanel"
    >
      <el-icon :size="20" class="bell-icon" :class="{ 'bell-shake': hasNewNotification }">
        <Bell />
      </el-icon>
    </el-badge>

    <!-- 通知面板 -->
    <transition name="notification-panel">
      <div v-if="showPanel" class="notification-panel" @click.stop>
        <!-- 面板头部 -->
        <div class="panel-header">
          <div class="header-title">
            <h3>通知中心</h3>
            <el-badge :value="unreadCount" type="primary" v-if="unreadCount > 0" />
          </div>
          <div class="header-actions">
            <el-button text @click="markAllAsRead" :disabled="unreadCount === 0">
              全部已读
            </el-button>
            <el-button text @click="showSettings = true">
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-button text @click="toggleNotificationPanel">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="notification-tabs">
          <!-- 全部通知 -->
          <el-tab-pane label="全部" name="all">
            <div class="notification-list" ref="notificationListRef">
              <div v-if="notifications.length === 0" class="empty-state">
                <el-icon :size="48" color="#C0C4CC">
                  <Bell />
                </el-icon>
                <p>暂无通知</p>
              </div>

              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{
                  'unread': notification.status === 'unread',
                  'priority-high': notification.priority === 'high' || notification.priority === 'urgent',
                  [`type-${notification.type}`]: true
                }"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-icon">
                  <el-icon :size="20" :color="getNotificationColor(notification.type)">
                    <component :is="getNotificationIcon(notification.type)" />
                  </el-icon>
                </div>

                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>

                  <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
                    <el-button
                      v-for="action in notification.actions"
                      :key="action.id"
                      :type="getActionType(action.style)"
                      size="small"
                      @click.stop="handleActionClick(notification, action)"
                    >
                      <el-icon v-if="action.icon">
                        <component :is="action.icon" />
                      </el-icon>
                      {{ action.label }}
                    </el-button>
                  </div>
                </div>

                <div class="notification-status">
                  <el-dropdown @command="(command) => handleNotificationCommand(command, notification)">
                    <el-button text>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="mark_read" v-if="notification.status === 'unread'">
                          标记已读
                        </el-dropdown-item>
                        <el-dropdown-item command="mark_unread" v-if="notification.status === 'read'">
                          标记未读
                        </el-dropdown-item>
                        <el-dropdown-item command="archive">
                          归档
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <!-- 加载更多 -->
              <div v-if="hasMore" class="load-more">
                <el-button text @click="loadMoreNotifications" :loading="loading">
                  加载更多
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <!-- 未读通知 -->
          <el-tab-pane label="未读" name="unread">
            <div class="notification-list">
              <div v-if="unreadNotifications.length === 0" class="empty-state">
                <el-icon :size="48" color="#C0C4CC">
                  <Check />
                </el-icon>
                <p>没有未读通知</p>
              </div>

              <div
                v-for="notification in unreadNotifications"
                :key="notification.id"
                class="notification-item unread"
                @click="handleNotificationClick(notification)"
              >
                <!-- 同上 -->
              </div>
            </div>
          </el-tab-pane>

          <!-- 系统通知 -->
          <el-tab-pane label="系统" name="system">
            <div class="notification-list">
              <!-- 系统通知列表 -->
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 面板底部 -->
        <div class="panel-footer">
          <el-button text @click="viewAllNotifications">
            查看所有通知
          </el-button>
        </div>
      </div>
    </transition>

    <!-- 通知设置对话框 -->
    <el-dialog v-model="showSettings" title="通知设置" width="600px">
      <NotificationSettings v-if="showSettings" @close="showSettings = false" />
    </el-dialog>

    <!-- 通知详情对话框 -->
    <el-dialog v-model="showDetail" title="通知详情" width="500px">
      <NotificationDetail v-if="selectedNotification" :notification="selectedNotification" @close="showDetail = false" />
    </el-dialog>

    <!-- 遮罩层 -->
    <div v-if="showPanel" class="notification-overlay" @click="toggleNotificationPanel"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Setting,
  Close,
  MoreFilled,
  Check,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  ShoppingCart,
  Kitchen,
  CreditCard,
  Monitor,
  Promotion
} from '@element-plus/icons-vue'
import {
  notificationApi,
  getNotifications,
  markAsRead,
  markAsUnread,
  bulkOperationNotifications,
  deleteNotification,
  Notification,
  NotificationType,
  NotificationStatus
} from '@/api/notification'
import NotificationSettings from './NotificationSettings.vue'
import NotificationDetail from './NotificationDetail.vue'

const router = useRouter()

// 响应式数据
const showPanel = ref(false)
const showSettings = ref(false)
const showDetail = ref(false)
const activeTab = ref('all')
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20
const selectedNotification = ref<Notification | null>(null)
const notificationListRef = ref<HTMLElement>()
const hasNewNotification = ref(false)

// 通知查询参数
const queryParams = reactive({
  page: 1,
  limit: pageSize,
  status: undefined as NotificationStatus | undefined
})

// 计算属性
const unreadNotifications = computed(() =>
  notifications.value.filter(n => n.status === 'unread')
)

// 方法
const toggleNotificationPanel = () => {
  showPanel.value = !showPanel.value

  if (showPanel.value) {
    loadNotifications()
    // 点击外部关闭
    nextTick(() => {
      document.addEventListener('click', handleDocumentClick)
    })
  } else {
    document.removeEventListener('click', handleDocumentClick)
  }
}

const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.notification-center')) {
    showPanel.value = false
    document.removeEventListener('click', handleDocumentClick)
  }
}

const loadNotifications = async () => {
  loading.value = true

  try {
    const response = await getNotifications(queryParams)

    if (response.success && response.data) {
      if (queryParams.page === 1) {
        notifications.value = response.data.items
      } else {
        notifications.value.push(...response.data.items)
      }

      hasMore.value = response.data.items.length === pageSize
      updateUnreadCount()
    }
  } catch (error) {
    console.error('Load notifications failed:', error)
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}

const loadMoreNotifications = () => {
  if (!loading.value && hasMore.value) {
    currentPage.value++
    queryParams.page = currentPage.value
    loadNotifications()
  }
}

const updateUnreadCount = async () => {
  try {
    const response = await notificationApi.getNotificationStats()
    if (response.success && response.data) {
      unreadCount.value = response.data.unread
    }
  } catch (error) {
    console.error('Update unread count failed:', error)
  }
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName

  switch (tabName) {
    case 'all':
      queryParams.status = undefined
      break
    case 'unread':
      queryParams.status = NotificationStatus.UNREAD
      break
    case 'system':
      queryParams.status = undefined
      // 可以添加类型过滤
      break
  }

  queryParams.page = 1
  currentPage.value = 1
  loadNotifications()
}

const handleNotificationClick = async (notification: Notification) => {
  // 标记为已读
  if (notification.status === 'unread') {
    await markAsRead(notification.id)
    notification.status = NotificationStatus.READ
    updateUnreadCount()
  }

  // 显示详情
  selectedNotification.value = notification
  showDetail.value = true

  // 如果有链接，跳转
  if (notification.data?.url) {
    router.push(notification.data.url)
    toggleNotificationPanel()
  }
}

const handleActionClick = async (notification: Notification, action: any) => {
  try {
    if (action.url) {
      router.push(action.url)
      toggleNotificationPanel()
    } else if (action.action) {
      // 执行自定义动作
      window.dispatchEvent(new CustomEvent('notification-action', {
        detail: { notification, action }
      }))
    }
  } catch (error) {
    console.error('Handle action click failed:', error)
    ElMessage.error('操作失败')
  }
}

const handleNotificationCommand = async (command: string, notification: Notification) => {
  try {
    switch (command) {
      case 'mark_read':
        await markAsRead(notification.id)
        notification.status = NotificationStatus.READ
        updateUnreadCount()
        break
      case 'mark_unread':
        await markAsUnread(notification.id)
        notification.status = NotificationStatus.UNREAD
        updateUnreadCount()
        break
      case 'archive':
        await bulkOperationNotifications({
          notificationIds: [notification.id],
          action: 'archive'
        })
        notifications.value = notifications.value.filter(n => n.id !== notification.id)
        updateUnreadCount()
        break
      case 'delete':
        await ElMessageBox.confirm('确定要删除这个通知吗？', '确认删除', {
          type: 'warning'
        })
        await deleteNotification(notification.id)
        notifications.value = notifications.value.filter(n => n.id !== notification.id)
        updateUnreadCount()
        break
    }
  } catch (error) {
    console.error('Handle notification command failed:', error)
    ElMessage.error('操作失败')
  }
}

const markAllAsRead = async () => {
  try {
    const unreadIds = notifications.value
      .filter(n => n.status === 'unread')
      .map(n => n.id)

    if (unreadIds.length === 0) return

    await bulkOperationNotifications({
      notificationIds: unreadIds,
      action: 'mark_read'
    })

    notifications.value.forEach(n => {
      if (n.status === 'unread') {
        n.status = NotificationStatus.READ
      }
    })

    updateUnreadCount()
    ElMessage.success('已标记全部为已读')
  } catch (error) {
    console.error('Mark all as read failed:', error)
    ElMessage.error('标记失败')
  }
}

const viewAllNotifications = () => {
  router.push('/notifications')
  toggleNotificationPanel()
}

const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    [NotificationType.INFO]: InfoFilled,
    [NotificationType.SUCCESS]: SuccessFilled,
    [NotificationType.WARNING]: WarningFilled,
    [NotificationType.ERROR]: CircleCloseFilled,
    [NotificationType.ORDER]: ShoppingCart,
    [NotificationType.KITCHEN]: Kitchen,
    [NotificationType.PAYMENT]: CreditCard,
    [NotificationType.SYSTEM]: Monitor,
    [NotificationType.MARKETING]: Promotion
  }
  return iconMap[type] || InfoFilled
}

const getNotificationColor = (type: NotificationType) => {
  const colorMap = {
    [NotificationType.INFO]: '#409EFF',
    [NotificationType.SUCCESS]: '#67C23A',
    [NotificationType.WARNING]: '#E6A23C',
    [NotificationType.ERROR]: '#F56C6C',
    [NotificationType.ORDER]: '#909399',
    [NotificationType.KITCHEN]: '#FF9800',
    [NotificationType.PAYMENT]: '#4CAF50',
    [NotificationType.SYSTEM]: '#606266',
    [NotificationType.MARKETING]: '#E91E63'
  }
  return colorMap[type] || '#909399'
}

const getActionType = (style?: string) => {
  const typeMap = {
    'primary': 'primary',
    'secondary': 'default',
    'danger': 'danger',
    'warning': 'warning'
  }
  return typeMap[style as keyof typeof typeMap] || 'default'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString()
}

// WebSocket 连接
const connectWebSocket = () => {
  const userId = parseInt(localStorage.getItem('user_id') || '1', 10)
  notificationApi.connectWebSocket(userId)

  // 监听新通知
  notificationApi.subscribe('notification', (data: any) => {
    const newNotification = data.notification
    notifications.value.unshift(newNotification)
    updateUnreadCount()

    // 显示铃铛动画
    hasNewNotification.value = true
    setTimeout(() => {
      hasNewNotification.value = false
    }, 1000)

    // 显示浏览器通知
    if (Notification.permission === 'granted' && !newNotification.isSilent) {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id.toString()
      })
    }
  })

  // 监听通知更新
  notificationApi.subscribe('notification_update', (data: any) => {
    const index = notifications.value.findIndex(n => n.id === data.notificationId)
    if (index !== -1) {
      Object.assign(notifications.value[index], data.updates)
    }
    updateUnreadCount()
  })
}

// 请求浏览器通知权限
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

// 监听路由变化
watch(() => router.currentRoute.value, () => {
  if (showPanel.value) {
    toggleNotificationPanel()
  }
})

// 生命周期
onMounted(() => {
  updateUnreadCount()
  connectWebSocket()
  requestNotificationPermission()
})

onUnmounted(() => {
  notificationApi.disconnectWebSocket()
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.notification-center {
  position: relative;
  display: inline-block;
}

.notification-bell {
  cursor: pointer;
  padding: $spacing-2;
  border-radius: $border-radius-base;
  transition: $transition-colors;

  &:hover {
    background: $gray-100;
  }

  .bell-icon {
    transition: $transition-transform;

    &.bell-shake {
      animation: bell-shake 0.5s ease-in-out;
    }
  }
}

@keyframes bell-shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: $z-index-modal-backdrop;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 600px;
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-2xl;
  border: 1px solid $border-primary;
  z-index: $z-index-modal;
  overflow: hidden;
  margin-top: $spacing-2;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-6;
    border-bottom: 1px solid $border-primary;
    background: $gray-50;

    .header-title {
      display: flex;
      align-items: center;
      gap: $spacing-3;

      h3 {
        margin: 0;
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: $spacing-2;
    }
  }

  .notification-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      background: $white;
    }

    :deep(.el-tabs__content) {
      padding: 0;
      max-height: 400px;
      overflow-y: auto;
    }
  }

  .notification-list {
    max-height: 400px;
    overflow-y: auto;

    .empty-state {
      text-align: center;
      padding: $spacing-8;
      color: $text-secondary;

      p {
        margin-top: $spacing-4;
        font-size: $font-size-sm;
      }
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: $spacing-3;
      padding: $spacing-4 $spacing-6;
      border-bottom: 1px solid $border-primary;
      cursor: pointer;
      transition: $transition-colors;
      position: relative;

      &:hover {
        background: $gray-50;
      }

      &.unread {
        background: rgba($primary-color, 0.05);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 40px;
          background: $primary-color;
          border-radius: 0 $border-radius-sm $border-radius-sm 0;
        }
      }

      &.priority-high {
        border-left: 4px solid $danger-color;
      }

      .notification-icon {
        flex-shrink: 0;
        margin-top: $spacing-1;
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-size: $font-size-sm;
          font-weight: $font-weight-medium;
          color: $text-primary;
          margin-bottom: $spacing-1;
          @include text-ellipsis;
        }

        .notification-message {
          font-size: $font-size-xs;
          color: $text-secondary;
          line-height: $line-height-normal;
          margin-bottom: $spacing-2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notification-time {
          font-size: $font-size-xs;
          color: $text-placeholder;
          margin-bottom: $spacing-2;
        }

        .notification-actions {
          display: flex;
          gap: $spacing-2;
          flex-wrap: wrap;
        }
      }

      .notification-status {
        flex-shrink: 0;
        opacity: 0;
        transition: $transition-opacity;

        .notification-item:hover & {
          opacity: 1;
        }
      }
    }

    .load-more {
      text-align: center;
      padding: $spacing-4;
      border-top: 1px solid $border-primary;
    }
  }

  .panel-footer {
    padding: $spacing-3 $spacing-6;
    border-top: 1px solid $border-primary;
    background: $gray-50;
    text-align: center;
  }
}

// 动画
.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: all $transition-base;
  transform-origin: top right;
}

.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .notification-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
    margin-top: 0;
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .notification-panel {
    background: $dark-bg-secondary;
    border-color: $dark-border-primary;

    .panel-header {
      background: $dark-bg-tertiary;
      border-bottom-color: $dark-border-primary;

      .header-title h3 {
        color: $dark-text-primary;
      }
    }

    .notification-item {
      border-bottom-color: $dark-border-primary;

      &:hover {
        background: $dark-bg-tertiary;
      }

      &.unread {
        background: rgba($primary-color, 0.1);
      }

      .notification-content {
        .notification-title {
          color: $dark-text-primary;
        }

        .notification-message {
          color: $dark-text-secondary;
        }

        .notification-time {
          color: $dark-text-placeholder;
        }
      }
    }

    .panel-footer {
      background: $dark-bg-tertiary;
      border-top-color: $dark-border-primary;
    }
  }
}
</style>