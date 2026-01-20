<template>
  <div class="order-status-tracker">
    <el-card class="tracker-card">
      <template #header>
        <div class="card-header">
          <span>订单状态跟踪</span>
          <el-button-group>
            <el-button size="small" @click="refreshStatus">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button size="small" @click="toggleAutoRefresh">
              <el-icon><Timer /></el-icon>
              {{ autoRefresh ? '停止' : '自动' }}
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="tracker-content">
        <el-steps :active="currentStepIndex" finish-status="success" align-center>
          <el-step
            v-for="(step, index) in statusSteps"
            :key="step.status"
            :title="step.label"
            :description="step.description"
            :status="getStepStatus(step.status)"
          >
            <template #icon>
              <el-icon :size="24">
                <component :is="step.icon" />
              </el-icon>
            </template>
          </el-step>
        </el-steps>

        <div class="status-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="event in statusHistory"
              :key="event.id"
              :timestamp="formatDateTime(event.timestamp)"
              :type="getEventType(event.status)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="event-header">
                  <span class="event-status">{{ getStatusLabel(event.status) }}</span>
                  <span class="event-operator">{{ event.operator || '系统' }}</span>
                </div>
                <div v-if="event.note" class="event-note">{{ event.note }}</div>
                <div v-if="event.duration" class="event-duration">
                  耗时: {{ formatDuration(event.duration) }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="status-metrics">
          <el-row :gutter="16">
            <el-col :span="6" v-for="metric in metrics" :key="metric.key">
              <div class="metric-item">
                <div class="metric-icon" :class="metric.type">
                  <el-icon :size="20">
                    <component :is="metric.icon" />
                  </el-icon>
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="blocked" class="blocked-alert">
          <el-alert
            title="订单被阻塞"
            type="error"
            :description="blockReason"
            show-icon
            :closable="false"
          />
        </div>

        <div class="action-buttons">
          <el-button
            v-for="action in availableActions"
            :key="action.status"
            :type="action.type"
            :loading="actionLoading"
            @click="handleAction(action)"
          >
            <el-icon><component :is="action.icon" /></el-icon>
            {{ action.label }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Timer,
  ShoppingCart,
  Check,
  Loading,
  CircleCheck,
  CircleClose,
  Clock,
  User,
  Timer as TimerIcon,
  Warning
} from '@element-plus/icons-vue'
import { OrderStatus, type Order } from '@/api/order-management'

interface Props {
  order: Order
}

interface StatusEvent {
  id: number
  status: OrderStatus
  timestamp: string
  operator?: string
  note?: string
  duration?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  statusChanged: [status: OrderStatus]
}>()

const loading = ref(false)
const autoRefresh = ref(false)
const actionLoading = ref(false)
const statusHistory = ref<StatusEvent[]>([])
const blocked = ref(false)
const blockReason = ref('')
let refreshTimer: number | null = null

const statusSteps = computed(() => [
  {
    status: OrderStatus.PENDING,
    label: '待确认',
    description: '订单已创建，等待确认',
    icon: ShoppingCart
  },
  {
    status: OrderStatus.CONFIRMED,
    label: '已确认',
    description: '订单已确认，开始准备',
    icon: Check
  },
  {
    status: OrderStatus.PREPARING,
    label: '制作中',
    description: '正在制作订单',
    icon: Loading
  },
  {
    status: OrderStatus.READY,
    label: '已完成',
    description: '订单制作完成',
    icon: CircleCheck
  },
  {
    status: OrderStatus.SERVED,
    label: '已上餐',
    description: '订单已送达客户',
    icon: CircleCheck
  }
])

const currentStepIndex = computed(() => {
  const statusOrder = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED
  ]
  const currentIndex = statusOrder.indexOf(props.order.status)
  return currentIndex >= 0 ? currentIndex : 0
})

const metrics = computed(() => [
  {
    key: 'totalTime',
    label: '总耗时',
    value: formatDuration(calculateTotalDuration()),
    icon: TimerIcon,
    type: 'primary'
  },
  {
    key: 'preparationTime',
    label: '制作时间',
    value: formatDuration(calculatePreparationTime()),
    icon: Timer,
    type: 'success'
  },
  {
    key: 'waitingTime',
    label: '等待时间',
    value: formatDuration(calculateWaitingTime()),
    icon: Clock,
    type: 'warning'
  },
  {
    key: 'operator',
    label: '操作员',
    value: getLastOperator(),
    icon: User,
    type: 'info'
  }
])

const availableActions = computed(() => {
  const actions: Array<{
    status: OrderStatus
    label: string
    icon: any
    type: string
  }> = []

  switch (props.order.status) {
    case OrderStatus.PENDING:
      actions.push({
        status: OrderStatus.CONFIRMED,
        label: '确认订单',
        icon: Check,
        type: 'success'
      })
      actions.push({
        status: OrderStatus.CANCELLED,
        label: '取消订单',
        icon: CircleClose,
        type: 'danger'
      })
      break
    case OrderStatus.CONFIRMED:
      actions.push({
        status: OrderStatus.PREPARING,
        label: '开始制作',
        icon: Loading,
        type: 'primary'
      })
      actions.push({
        status: OrderStatus.CANCELLED,
        label: '取消订单',
        icon: CircleClose,
        type: 'danger'
      })
      break
    case OrderStatus.PREPARING:
      actions.push({
        status: OrderStatus.READY,
        label: '完成制作',
        icon: CircleCheck,
        type: 'success'
      })
      break
    case OrderStatus.READY:
      actions.push({
        status: OrderStatus.SERVED,
        label: '上餐',
        icon: CircleCheck,
        type: 'success'
      })
      break
  }

  return actions
})

const loadStatusHistory = async () => {
  loading.value = true
  try {
    const { getOrderStatusHistory } = await import('@/api/order-management')
    const response = await getOrderStatusHistory(props.order.id)
    if (response.success) {
      statusHistory.value = response.data || []
    }
  } catch (error) {
    console.error('Load status history failed:', error)
  } finally {
    loading.value = false
  }
}

const refreshStatus = async () => {
  await loadStatusHistory()
  ElMessage.success('状态已刷新')
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshTimer = window.setInterval(() => {
      loadStatusHistory()
    }, 5000)
    ElMessage.success('已开启自动刷新')
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    ElMessage.info('已停止自动刷新')
  }
}

const handleAction = async (action: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单状态更改为"${action.label}"吗？`,
      '确认操作',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    actionLoading.value = true
    const { updateOrderStatus } = await import('@/api/order-management')
    const response = await updateOrderStatus(props.order.id, action.status)
    
    if (response.success) {
      ElMessage.success('订单状态更新成功')
      emit('statusChanged', action.status)
      await loadStatusHistory()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('订单状态更新失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const getStepStatus = (status: OrderStatus) => {
  if (status === props.order.status) return 'process'
  const statusOrder = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED
  ]
  const currentIndex = statusOrder.indexOf(props.order.status)
  const stepIndex = statusOrder.indexOf(status)
  return stepIndex < currentIndex ? 'success' : 'wait'
}

const getEventType = (status: OrderStatus) => {
  const typeMap: Record<OrderStatus, any> = {
    [OrderStatus.PENDING]: 'info',
    [OrderStatus.CONFIRMED]: 'primary',
    [OrderStatus.PREPARING]: 'warning',
    [OrderStatus.READY]: 'success',
    [OrderStatus.SERVED]: 'success',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'danger',
    [OrderStatus.REFUNDED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: OrderStatus) => {
  const labelMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '待确认',
    [OrderStatus.CONFIRMED]: '已确认',
    [OrderStatus.PREPARING]: '制作中',
    [OrderStatus.READY]: '已完成',
    [OrderStatus.SERVED]: '已上餐',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款'
  }
  return labelMap[status] || status
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${Math.round(minutes)}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}小时${mins}分钟`
}

const calculateTotalDuration = () => {
  if (statusHistory.value.length < 2) return 0
  const firstEvent = statusHistory.value[0]
  const lastEvent = statusHistory.value[statusHistory.value.length - 1]
  const startTime = new Date(firstEvent.timestamp).getTime()
  const endTime = new Date(lastEvent.timestamp).getTime()
  return (endTime - startTime) / (1000 * 60)
}

const calculatePreparationTime = () => {
  const preparingEvent = statusHistory.value.find(e => e.status === OrderStatus.PREPARING)
  const readyEvent = statusHistory.value.find(e => e.status === OrderStatus.READY)
  if (!preparingEvent || !readyEvent) return 0
  const startTime = new Date(preparingEvent.timestamp).getTime()
  const endTime = new Date(readyEvent.timestamp).getTime()
  return (endTime - startTime) / (1000 * 60)
}

const calculateWaitingTime = () => {
  const pendingEvent = statusHistory.value.find(e => e.status === OrderStatus.PENDING)
  const confirmedEvent = statusHistory.value.find(e => e.status === OrderStatus.CONFIRMED)
  if (!pendingEvent || !confirmedEvent) return 0
  const startTime = new Date(pendingEvent.timestamp).getTime()
  const endTime = new Date(confirmedEvent.timestamp).getTime()
  return (endTime - startTime) / (1000 * 60)
}

const getLastOperator = () => {
  if (statusHistory.value.length === 0) return '-'
  return statusHistory.value[statusHistory.value.length - 1].operator || '-'
}

onMounted(() => {
  loadStatusHistory()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.order-status-tracker {
  .tracker-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tracker-content {
      .status-timeline {
        margin: $spacing-6 0;

        .timeline-content {
          .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-2;

            .event-status {
              font-weight: 600;
              color: $text-primary;
            }

            .event-operator {
              font-size: $font-size-sm;
              color: $text-secondary;
            }
          }

          .event-note {
            color: $text-secondary;
            font-size: $font-size-sm;
            margin-bottom: $spacing-1;
          }

          .event-duration {
            color: $text-tertiary;
            font-size: $font-size-xs;
          }
        }
      }

      .status-metrics {
        margin: $spacing-6 0;

        .metric-item {
          display: flex;
          align-items: center;
          gap: $spacing-3;
          padding: $spacing-3;
          background: $background-light;
          border-radius: $border-radius-md;

          .metric-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: $border-radius-md;

            &.primary {
              background: $primary-light;
              color: $primary-color;
            }

            &.success {
              background: $success-light;
              color: $success-color;
            }

            &.warning {
              background: $warning-light;
              color: $warning-color;
            }

            &.info {
              background: $info-light;
              color: $info-color;
            }
          }

          .metric-info {
            flex: 1;

            .metric-value {
              font-size: $font-size-lg;
              font-weight: 600;
              color: $text-primary;
            }

            .metric-label {
              font-size: $font-size-sm;
              color: $text-secondary;
            }
          }
        }
      }

      .blocked-alert {
        margin: $spacing-6 0;
      }

      .action-buttons {
        display: flex;
        gap: $spacing-3;
        margin-top: $spacing-6;
      }
    }
  }
}
</style>
