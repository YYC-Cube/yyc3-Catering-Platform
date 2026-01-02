<template>
  <div class="notification-detail">
    <div class="detail-header">
      <div class="detail-icon" :style="{ backgroundColor: getNotificationColor(notification.type) }">
        <el-icon :size="24" color="white">
          <component :is="getNotificationIcon(notification.type)" />
        </el-icon>
      </div>

      <div class="detail-info">
        <h3 class="detail-title">{{ notification.title }}</h3>
        <div class="detail-meta">
          <el-tag :type="getNotificationTagType(notification.type)" size="small">
            {{ getNotificationTypeLabel(notification.type) }}
          </el-tag>
          <el-tag
            :type="getPriorityTagType(notification.priority)"
            size="small"
            v-if="notification.priority !== 'normal'"
          >
            {{ getPriorityLabel(notification.priority) }}
          </el-tag>
          <span class="detail-time">{{ formatDateTime(notification.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <div class="detail-message">
        <p>{{ notification.message }}</p>
      </div>

      <div v-if="notification.data" class="detail-data">
        <h4>附加信息</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item
            v-for="(value, key) in notification.data"
            :key="key"
            :label="formatDataKey(key)"
          >
            {{ formatDataValue(value) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="notification.actions && notification.actions.length > 0" class="detail-actions">
        <h4>操作</h4>
        <div class="action-buttons">
          <el-button
            v-for="action in notification.actions"
            :key="action.id"
            :type="getActionType(action.style)"
            @click="handleActionClick(action)"
          >
            <el-icon v-if="action.icon">
              <component :is="action.icon" />
            </el-icon>
            {{ action.label }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="detail-footer">
      <div class="status-info">
        <span class="status-label">状态：</span>
        <el-tag :type="notification.status === 'read' ? 'success' : 'warning'">
          {{ notification.status === 'read' ? '已读' : '未读' }}
        </el-tag>
      </div>

      <div class="footer-actions">
        <el-button
          v-if="notification.status === 'unread'"
          @click="markAsRead"
          type="primary"
          size="small"
        >
          标记为已读
        </el-button>

        <el-button
          v-if="notification.status === 'read'"
          @click="markAsUnread"
          type="warning"
          size="small"
        >
          标记为未读
        </el-button>

        <el-button @click="archive" type="info" size="small" plain>
          归档
        </el-button>

        <el-button @click="deleteNotification" type="danger" size="small" plain>
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
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
  markAsRead,
  markAsUnread,
  bulkOperationNotifications,
  deleteNotification,
  Notification,
  NotificationType,
  NotificationPriority
} from '@/api/notification'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// 方法
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

const getNotificationTagType = (type: NotificationType) => {
  const typeMap = {
    [NotificationType.INFO]: 'info',
    [NotificationType.SUCCESS]: 'success',
    [NotificationType.WARNING]: 'warning',
    [NotificationType.ERROR]: 'danger',
    [NotificationType.ORDER]: 'info',
    [NotificationType.KITCHEN]: 'warning',
    [NotificationType.PAYMENT]: 'success',
    [NotificationType.SYSTEM]: 'info',
    [NotificationType.MARKETING]: 'warning'
  }
  return typeMap[type] || 'info'
}

const getNotificationTypeLabel = (type: NotificationType) => {
  const labelMap = {
    [NotificationType.INFO]: '信息',
    [NotificationType.SUCCESS]: '成功',
    [NotificationType.WARNING]: '警告',
    [NotificationType.ERROR]: '错误',
    [NotificationType.ORDER]: '订单',
    [NotificationType.KITCHEN]: '厨房',
    [NotificationType.PAYMENT]: '支付',
    [NotificationType.SYSTEM]: '系统',
    [NotificationType.MARKETING]: '营销'
  }
  return labelMap[type] || '未知'
}

const getPriorityTagType = (priority: NotificationPriority) => {
  const typeMap = {
    [NotificationPriority.LOW]: 'info',
    [NotificationPriority.NORMAL]: 'info',
    [NotificationPriority.HIGH]: 'warning',
    [NotificationPriority.URGENT]: 'danger'
  }
  return typeMap[priority] || 'info'
}

const getPriorityLabel = (priority: NotificationPriority) => {
  const labelMap = {
    [NotificationPriority.LOW]: '低优先级',
    [NotificationPriority.NORMAL]: '普通',
    [NotificationPriority.HIGH]: '高优先级',
    [NotificationPriority.URGENT]: '紧急'
  }
  return labelMap[priority] || '普通'
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

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDataKey = (key: string) => {
  // 格式化数据键名为中文
  const keyMap: Record<string, string> = {
    orderId: '订单ID',
    orderNo: '订单号',
    amount: '金额',
    customerName: '客户姓名',
    tableNumber: '桌号',
    itemName: '商品名称',
    quantity: '数量',
    staffName: '员工姓名',
    reason: '原因',
    action: '操作',
    url: '链接'
  }

  return keyMap[key] || key
}

const formatDataValue = (value: any) => {
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  if (value instanceof Date) {
    return formatDateTime(value.toISOString())
  }
  return String(value)
}

const handleActionClick = async (action: any) => {
  try {
    if (action.url) {
      window.open(action.url, '_blank')
    } else if (action.action) {
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('notification-action', {
        detail: { notification: props.notification, action }
      }))
    }
  } catch (error) {
    console.error('Handle action click failed:', error)
    ElMessage.error('操作失败')
  }
}

const markAsRead = async () => {
  try {
    await markAsRead(props.notification.id)
    ElMessage.success('已标记为已读')
    emit('close')
  } catch (error) {
    console.error('Mark as read failed:', error)
    ElMessage.error('标记失败')
  }
}

const markAsUnread = async () => {
  try {
    await markAsUnread(props.notification.id)
    ElMessage.success('已标记为未读')
    emit('close')
  } catch (error) {
    console.error('Mark as unread failed:', error)
    ElMessage.error('标记失败')
  }
}

const archive = async () => {
  try {
    await bulkOperationNotifications({
      notificationIds: [props.notification.id],
      action: 'archive'
    })
    ElMessage.success('已归档')
    emit('close')
  } catch (error) {
    console.error('Archive notification failed:', error)
    ElMessage.error('归档失败')
  }
}

const deleteNotification = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个通知吗？', '确认删除', {
      type: 'warning'
    })

    await deleteNotification(props.notification.id)
    ElMessage.success('删除成功')
    emit('close')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete notification failed:', error)
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.notification-detail {
  .detail-header {
    display: flex;
    align-items: flex-start;
    gap: $spacing-4;
    margin-bottom: $spacing-6;

    .detail-icon {
      width: 48px;
      height: 48px;
      border-radius: $border-radius-lg;
      @include flex-center;
      flex-shrink: 0;
    }

    .detail-info {
      flex: 1;

      .detail-title {
        margin: 0 0 $spacing-2 0;
        font-size: $font-size-xl;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        line-height: $line-height-tight;
      }

      .detail-meta {
        display: flex;
        align-items: center;
        gap: $spacing-2;
        flex-wrap: wrap;

        .detail-time {
          font-size: $font-size-xs;
          color: $text-placeholder;
        }
      }
    }
  }

  .detail-content {
    margin-bottom: $spacing-6;

    .detail-message {
      margin-bottom: $spacing-6;
      padding: $spacing-4;
      background: $gray-50;
      border-radius: $border-radius-base;
      border-left: 4px solid $primary-color;

      p {
        margin: 0;
        line-height: $line-height-relaxed;
        color: $text-regular;
      }
    }

    .detail-data {
      margin-bottom: $spacing-6;

      h4 {
        margin: 0 0 $spacing-3 0;
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
      }
    }

    .detail-actions {
      h4 {
        margin: 0 0 $spacing-3 0;
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
      }

      .action-buttons {
        display: flex;
        gap: $spacing-2;
        flex-wrap: wrap;
      }
    }
  }

  .detail-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-4;
    border-top: 1px solid $border-primary;

    .status-info {
      display: flex;
      align-items: center;
      gap: $spacing-2;

      .status-label {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .footer-actions {
      display: flex;
      gap: $spacing-2;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .notification-detail {
    .detail-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .detail-footer {
      flex-direction: column;
      gap: $spacing-3;
      align-items: flex-start;

      .footer-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .notification-detail {
    .detail-content {
      .detail-message {
        background: $dark-bg-tertiary;
        border-left-color: $primary-color;
        color: $dark-text-regular;
      }
    }

    .detail-footer {
      border-top-color: $dark-border-primary;
    }
  }
}
</style>