<template>
  <div class="customer-status-tracker">
    <el-card class="status-card">
      <template #header>
        <div class="card-header">
          <span>客户状态跟踪</span>
          <el-button-group>
            <el-button size="small" @click="refreshStatus">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button size="small" @click="showAddStatusDialog = true">
              <el-icon><Plus /></el-icon>
              添加状态
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="status-content">
        <div class="current-status">
          <el-alert
            :title="`当前状态: ${getCurrentStatusLabel()}`"
            :type="getCurrentStatusType()"
            :description="getCurrentStatusDescription()"
            show-icon
            :closable="false"
          />
        </div>

        <div class="status-timeline">
          <h3>状态变化历史</h3>
          <el-timeline>
            <el-timeline-item
              v-for="event in statusHistory"
              :key="event.id"
              :timestamp="formatDateTime(event.timestamp)"
              :type="getStatusEventType(event.status)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="event-header">
                  <span class="event-status">{{ getStatusLabel(event.status) }}</span>
                  <span class="event-operator">{{ event.operator || '系统' }}</span>
                </div>
                <div v-if="event.note" class="event-note">{{ event.note }}</div>
                <div v-if="event.duration" class="event-duration">
                  持续时间: {{ formatDuration(event.duration) }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="status-metrics">
          <el-row :gutter="16">
            <el-col :span="6" v-for="metric in statusMetrics" :key="metric.key">
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

        <div class="status-predictions">
          <h3>状态预测</h3>
          <el-alert
            v-if="prediction"
            :title="`预测: ${prediction.label}`"
            :type="prediction.type"
            :description="prediction.description"
            show-icon
          />
          <el-empty v-else description="暂无预测数据" />
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showAddStatusDialog"
      title="添加状态记录"
      width="500px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="休眠" value="inactive" />
            <el-option label="流失" value="churned" />
            <el-option label="黑名单" value="blacklisted" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="formData.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="formData.operator" placeholder="请输入操作人姓名" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddStatusDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Plus,
  User,
  TrendCharts,
  Clock,
  Star
} from '@element-plus/icons-vue'

interface StatusEvent {
  id: number
  status: string
  timestamp: string
  operator?: string
  note?: string
  duration?: number
}

interface StatusMetric {
  key: string
  label: string
  value: string | number
  icon: any
  type: string
}

interface StatusPrediction {
  label: string
  type: string
  description: string
}

const props = defineProps<{
  customerId: string
}>()

const formRef = ref()
const showAddStatusDialog = ref(false)
const submitting = ref(false)

const statusHistory = ref<StatusEvent[]>([
  {
    id: 1,
    status: 'active',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    operator: '系统',
    note: '客户注册',
    duration: 30 * 24 * 60 * 60
  },
  {
    id: 2,
    status: 'active',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    operator: '系统',
    note: '客户活跃',
    duration: 7 * 24 * 60 * 60
  },
  {
    id: 3,
    status: 'active',
    timestamp: new Date().toISOString(),
    operator: '系统',
    note: '客户活跃'
  }
])

const prediction = ref<StatusPrediction | null>({
  label: '保持活跃',
  type: 'success',
  description: '基于客户行为分析，预测客户在未来30天内保持活跃状态的概率为85%'
})

const formData = reactive({
  status: '',
  note: '',
  operator: ''
})

const formRules = {
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  note: [
    { required: true, message: '请输入备注', trigger: 'blur' }
  ],
  operator: [
    { required: true, message: '请输入操作人姓名', trigger: 'blur' }
  ]
}

const statusMetrics = computed<StatusMetric[]>(() => [
  {
    key: 'active_days',
    label: '活跃天数',
    value: 45,
    icon: TrendCharts,
    type: 'primary'
  },
  {
    key: 'total_orders',
    label: '总订单数',
    value: 23,
    icon: User,
    type: 'success'
  },
  {
    key: 'avg_interval',
    label: '平均间隔',
    value: '3.2天',
    icon: Clock,
    type: 'warning'
  },
  {
    key: 'loyalty_score',
    label: '忠诚度',
    value: 8.5,
    icon: Star,
    type: 'info'
  }
])

const getCurrentStatusLabel = () => {
  if (statusHistory.value.length === 0) return '未知'
  return getStatusLabel(statusHistory.value[0].status)
}

const getCurrentStatusType = () => {
  if (statusHistory.value.length === 0) return 'info'
  const status = statusHistory.value[0].status
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    churned: 'danger',
    blacklisted: 'error'
  }
  return typeMap[status] || 'info'
}

const getCurrentStatusDescription = () => {
  if (statusHistory.value.length === 0) return '暂无状态信息'
  const currentEvent = statusHistory.value[0]
  return `最后更新: ${formatDateTime(currentEvent.timestamp)}`
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '活跃',
    inactive: '休眠',
    churned: '流失',
    blacklisted: '黑名单'
  }
  return labelMap[status] || '未知'
}

const getStatusEventType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    churned: 'danger',
    blacklisted: 'error'
  }
  return typeMap[status] || 'primary'
}

const formatDateTime = (timestamp: string) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)

  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

const refreshStatus = async () => {
  try {
    ElMessage.loading('刷新状态数据...')
    const response = await fetch(`/api/customers/${props.customerId}/status`).then(res => res.json())
    if (response.success) {
      statusHistory.value = response.data.history
      prediction.value = response.data.prediction
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('Refresh status failed:', error)
    ElMessage.error('刷新失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const response = await fetch(`/api/customers/${props.customerId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('状态添加成功')
      showAddStatusDialog.value = false
      await refreshStatus()
    }
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formData.status = ''
  formData.note = ''
  formData.operator = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  refreshStatus()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-status-tracker {
  .status-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-content {
      .current-status {
        margin-bottom: $spacing-4;
      }

      .status-timeline {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .timeline-content {
          .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-1;

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
            margin-bottom: $spacing-1;
          }

          .event-duration {
            font-size: $font-size-sm;
            color: $text-placeholder;
          }
        }
      }

      .status-metrics {
        margin-bottom: $spacing-6;

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
              margin-bottom: $spacing-1;
            }

            .metric-label {
              font-size: $font-size-sm;
              color: $text-secondary;
            }
          }
        }
      }

      .status-predictions {
        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }
      }
    }
  }
}
</style>
