<template>
  <div class="customer-lifecycle-manager">
    <el-card class="lifecycle-card">
      <template #header>
        <div class="card-header">
          <span>客户生命周期管理</span>
          <el-button-group>
            <el-button size="small" @click="refreshLifecycle">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showConfigDialog = true">
              <el-icon><Setting /></el-icon>
              配置规则
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="lifecycle-content">
        <div class="lifecycle-overview">
          <el-row :gutter="20">
            <el-col :span="6" v-for="stage in lifecycleStages" :key="stage.key">
              <div class="stage-card" :class="stage.key">
                <div class="stage-header">
                  <div class="stage-icon">
                    <el-icon :size="32">
                      <component :is="stage.icon" />
                    </el-icon>
                  </div>
                  <div class="stage-info">
                    <div class="stage-name">{{ stage.name }}</div>
                    <div class="stage-count">{{ stage.count }}人</div>
                  </div>
                </div>
                <div class="stage-metrics">
                  <div class="metric-item">
                    <span class="label">转化率:</span>
                    <span class="value">{{ stage.conversionRate }}%</span>
                  </div>
                  <div class="metric-item">
                    <span class="label">平均价值:</span>
                    <span class="value">¥{{ stage.avgValue.toFixed(0) }}</span>
                  </div>
                </div>
                <div class="stage-progress">
                  <el-progress
                    :percentage="stage.percentage"
                    :color="stage.color"
                    :show-text="false"
                  />
                  <span class="progress-label">{{ stage.percentage }}%</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="lifecycle-flow">
          <h3>生命周期流转</h3>
          <div class="flow-diagram">
            <div
              v-for="(stage, index) in lifecycleStages"
              :key="stage.key"
              class="flow-node"
              :class="{ active: selectedStage?.key === stage.key }"
              @click="selectStage(stage)"
            >
              <div class="node-icon" :style="{ backgroundColor: stage.color }">
                <el-icon :size="24" color="white">
                  <component :is="stage.icon" />
                </el-icon>
              </div>
              <div class="node-label">{{ stage.name }}</div>
              <div v-if="index < lifecycleStages.length - 1" class="flow-arrow">
                <el-icon :size="20">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="lifecycle-rules">
          <h3>流转规则</h3>
          <el-table :data="transitionRules" stripe>
            <el-table-column prop="fromStage" label="从阶段" width="150">
              <template #default="{ row }">
                <el-tag :type="getStageTagType(row.fromStage)" size="small">
                  {{ getStageLabel(row.fromStage) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="toStage" label="到阶段" width="150">
              <template #default="{ row }">
                <el-tag :type="getStageTagType(row.toStage)" size="small">
                  {{ getStageLabel(row.toStage) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="condition" label="触发条件" min-width="200" />
            <el-table-column prop="action" label="自动动作" min-width="200" />
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityTagType(row.priority)" size="small">
                  {{ row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="editRule(row)">
                  编辑
                </el-button>
                <el-button size="small" text type="danger" @click="deleteRule(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="lifecycle-alerts">
          <h3>智能提醒</h3>
          <div class="alert-list">
            <div
              v-for="alert in lifecycleAlerts"
              :key="alert.id"
              class="alert-item"
              :class="alert.type"
            >
              <div class="alert-icon">
                <el-icon :size="24">
                  <component :is="getAlertIcon(alert.type)" />
                </el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-description">{{ alert.description }}</div>
                <div class="alert-time">{{ formatRelativeTime(alert.time) }}</div>
              </div>
              <div class="alert-actions">
                <el-button size="small" type="primary" @click="handleAlert(alert)">
                  处理
                </el-button>
                <el-button size="small" @click="dismissAlert(alert)">
                  忽略
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showConfigDialog"
      title="生命周期规则配置"
      width="900px"
      @closed="resetConfigForm"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        :rules="configRules"
        label-width="120px"
      >
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="configForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="从阶段" prop="fromStage">
          <el-select v-model="configForm.fromStage" placeholder="请选择起始阶段">
            <el-option
              v-for="stage in lifecycleStages"
              :key="stage.key"
              :label="stage.name"
              :value="stage.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="到阶段" prop="toStage">
          <el-select v-model="configForm.toStage" placeholder="请选择目标阶段">
            <el-option
              v-for="stage in lifecycleStages"
              :key="stage.key"
              :label="stage.name"
              :value="stage.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件" prop="condition">
          <el-input
            v-model="configForm.condition"
            type="textarea"
            :rows="3"
            placeholder="请输入触发条件，如：消费金额 > 1000 且 订单数 > 10"
          />
        </el-form-item>
        <el-form-item label="自动动作" prop="action">
          <el-input
            v-model="configForm.action"
            type="textarea"
            :rows="2"
            placeholder="请输入自动执行的动作"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="configForm.priority">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="configForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Setting,
  User,
  ChatDotRound,
  ShoppingCart,
  Star,
  Warning,
  ArrowRight,
  Bell,
  WarningFilled,
  SuccessFilled,
  InfoFilled
} from '@element-plus/icons-vue'

interface LifecycleStage {
  key: string
  name: string
  icon: any
  count: number
  conversionRate: number
  avgValue: number
  percentage: number
  color: string
}

interface TransitionRule {
  id: string
  fromStage: string
  toStage: string
  condition: string
  action: string
  priority: 'high' | 'medium' | 'low'
  enabled: boolean
}

interface LifecycleAlert {
  id: string
  type: 'warning' | 'success' | 'info'
  title: string
  description: string
  time: string
  customerId: string
  customerName: string
}

const showConfigDialog = ref(false)
const saving = ref(false)
const selectedStage = ref<LifecycleStage | null>(null)
const configFormRef = ref()

const lifecycleStages = ref<LifecycleStage[]>([
  {
    key: 'potential',
    name: '潜在客户',
    icon: User,
    count: 245,
    conversionRate: 15.5,
    avgValue: 0,
    percentage: 24.5,
    color: '#909399'
  },
  {
    key: 'intention',
    name: '意向客户',
    icon: ChatDotRound,
    count: 186,
    conversionRate: 32.3,
    avgValue: 150,
    percentage: 18.6,
    color: '#409eff'
  },
  {
    key: 'converted',
    name: '成交客户',
    icon: ShoppingCart,
    count: 312,
    conversionRate: 68.7,
    avgValue: 380,
    percentage: 31.2,
    color: '#67c23a'
  },
  {
    key: 'active',
    name: '活跃客户',
    icon: Star,
    count: 189,
    conversionRate: 85.2,
    avgValue: 520,
    percentage: 18.9,
    color: '#e6a23c'
  },
  {
    key: 'dormant',
    name: '休眠客户',
    icon: Warning,
    count: 68,
    conversionRate: 12.5,
    avgValue: 280,
    percentage: 6.8,
    color: '#f56c6c'
  }
])

const transitionRules = ref<TransitionRule[]>([
  {
    id: '1',
    fromStage: 'potential',
    toStage: 'intention',
    condition: '浏览菜品超过5次 或 添加到购物车',
    action: '发送优惠券，推送个性化推荐',
    priority: 'high',
    enabled: true
  },
  {
    id: '2',
    fromStage: 'intention',
    toStage: 'converted',
    condition: '完成首次订单',
    action: '发送欢迎短信，赠送新人礼包',
    priority: 'high',
    enabled: true
  },
  {
    id: '3',
    fromStage: 'converted',
    toStage: 'active',
    condition: '累计消费 > 500 且 订单数 > 3',
    action: '升级为会员，发送会员权益说明',
    priority: 'medium',
    enabled: true
  },
  {
    id: '4',
    fromStage: 'active',
    toStage: 'dormant',
    condition: '30天无消费记录',
    action: '发送关怀短信，提供专属优惠',
    priority: 'high',
    enabled: true
  },
  {
    id: '5',
    fromStage: 'dormant',
    toStage: 'active',
    condition: '产生新订单',
    action: '发送欢迎回归短信，提供回归优惠',
    priority: 'high',
    enabled: true
  }
])

const lifecycleAlerts = ref<LifecycleAlert[]>([
  {
    id: '1',
    type: 'warning',
    title: '客户流失预警',
    description: '张三（13800138000）30天未消费，流失风险高',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    customerId: '1',
    customerName: '张三'
  },
  {
    id: '2',
    type: 'success',
    title: '客户转化提醒',
    description: '李四（13900139000）完成首次订单，已转化为成交客户',
    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    customerId: '2',
    customerName: '李四'
  },
  {
    id: '3',
    type: 'info',
    title: '客户升级提醒',
    description: '王五（13700137000）消费达标，可升级为VIP客户',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    customerId: '3',
    customerName: '王五'
  }
])

const configForm = reactive({
  ruleName: '',
  fromStage: '',
  toStage: '',
  condition: '',
  action: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  enabled: true
})

const configRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  fromStage: [
    { required: true, message: '请选择起始阶段', trigger: 'change' }
  ],
  toStage: [
    { required: true, message: '请选择目标阶段', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请输入触发条件', trigger: 'blur' }
  ],
  action: [
    { required: true, message: '请输入自动动作', trigger: 'blur' }
  ]
}

const getStageTagType = (stage: string) => {
  const typeMap: Record<string, string> = {
    potential: 'info',
    intention: 'primary',
    converted: 'success',
    active: 'warning',
    dormant: 'danger'
  }
  return typeMap[stage] || 'info'
}

const getStageLabel = (stage: string) => {
  const stageObj = lifecycleStages.value.find(s => s.key === stage)
  return stageObj?.name || stage
}

const getPriorityTagType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getAlertIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    warning: WarningFilled,
    success: SuccessFilled,
    info: InfoFilled
  }
  return iconMap[type] || InfoFilled
}

const formatRelativeTime = (timestamp: string) => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return '30天前'
}

const selectStage = (stage: LifecycleStage) => {
  selectedStage.value = stage
}

const editRule = (rule: TransitionRule) => {
  configForm.ruleName = `编辑规则 ${rule.id}`
  configForm.fromStage = rule.fromStage
  configForm.toStage = rule.toStage
  configForm.condition = rule.condition
  configForm.action = rule.action
  configForm.priority = rule.priority
  configForm.enabled = rule.enabled
  showConfigDialog.value = true
}

const deleteRule = async (rule: TransitionRule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${rule.id}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    await refreshLifecycle()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete rule failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

const saveConfig = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()
    saving.value = true

    ElMessage.success('保存成功')
    showConfigDialog.value = false
    await refreshLifecycle()
  } catch (error) {
    console.error('Save config failed:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetConfigForm = () => {
  configForm.ruleName = ''
  configForm.fromStage = ''
  configForm.toStage = ''
  configForm.condition = ''
  configForm.action = ''
  configForm.priority = 'medium'
  configForm.enabled = true
  configFormRef.value?.resetFields()
}

const refreshLifecycle = async () => {
  try {
    ElMessage.loading('刷新生命周期数据...')
    const response = await fetch('/api/customers/lifecycle').then(res => res.json())
    if (response.success) {
      lifecycleStages.value = response.data.stages
      transitionRules.value = response.data.rules
      lifecycleAlerts.value = response.data.alerts
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('Refresh lifecycle failed:', error)
    ElMessage.error('刷新失败')
  }
}

const handleAlert = (alert: LifecycleAlert) => {
  ElMessage.info(`处理客户 ${alert.customerName} 的提醒`)
}

const dismissAlert = (alert: LifecycleAlert) => {
  const index = lifecycleAlerts.value.findIndex(a => a.id === alert.id)
  if (index !== -1) {
    lifecycleAlerts.value.splice(index, 1)
    ElMessage.success('提醒已忽略')
  }
}

onMounted(() => {
  refreshLifecycle()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-lifecycle-manager {
  .lifecycle-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .lifecycle-content {
      .lifecycle-overview {
        margin-bottom: $spacing-6;

        .stage-card {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;
          margin-bottom: $spacing-4;
          transition: all 0.3s;

          &:hover {
            box-shadow: $shadow-md;
            transform: translateY(-2px);
          }

          .stage-header {
            display: flex;
            align-items: center;
            gap: $spacing-3;
            margin-bottom: $spacing-3;

            .stage-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 60px;
              height: 60px;
              border-radius: $border-radius-lg;
              background: $background-light;
              color: $primary-color;
            }

            .stage-info {
              flex: 1;

              .stage-name {
                font-size: $font-size-base;
                font-weight: 600;
                color: $text-primary;
                margin-bottom: $spacing-1;
              }

              .stage-count {
                font-size: $font-size-lg;
                font-weight: $font-weight-bold;
                color: $primary-color;
              }
            }
          }

          .stage-metrics {
            display: flex;
            gap: $spacing-4;
            margin-bottom: $spacing-3;
            padding: $spacing-2;
            background: $background-light;
            border-radius: $border-radius-sm;

            .metric-item {
              flex: 1;
              text-align: center;

              .label {
                display: block;
                font-size: $font-size-sm;
                color: $text-secondary;
                margin-bottom: $spacing-1;
              }

              .value {
                display: block;
                font-size: $font-size-base;
                font-weight: 600;
                color: $text-primary;
              }
            }
          }

          .stage-progress {
            position: relative;

            .progress-label {
              position: absolute;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
              font-size: $font-size-sm;
              font-weight: 600;
              color: $text-primary;
            }
          }
        }
      }

      .lifecycle-flow {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .flow-diagram {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: $spacing-4;
          background: $background-light;
          border-radius: $border-radius-md;

          .flow-node {
            display: flex;
            align-items: center;
            gap: $spacing-2;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: scale(1.05);
            }

            &.active {
              .node-icon {
                box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.3);
              }
            }

            .node-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              color: white;
              transition: all 0.3s;
            }

            .node-label {
              font-size: $font-size-sm;
              font-weight: 600;
              color: $text-primary;
            }

            .flow-arrow {
              color: $text-secondary;
            }
          }
        }
      }

      .lifecycle-rules {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }
      }

      .lifecycle-alerts {
        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .alert-list {
          display: flex;
          flex-direction: column;
          gap: $spacing-3;

          .alert-item {
            display: flex;
            align-items: flex-start;
            gap: $spacing-3;
            padding: $spacing-4;
            background: $white;
            border: 1px solid $border-color;
            border-radius: $border-radius-md;
            border-left: 4px solid;

            &.warning {
              border-left-color: $warning-color;
            }

            &.success {
              border-left-color: $success-color;
            }

            &.info {
              border-left-color: $info-color;
            }

            .alert-icon {
              flex-shrink: 0;

              &.warning {
                color: $warning-color;
              }

              &.success {
                color: $success-color;
              }

              &.info {
                color: $info-color;
              }
            }

            .alert-content {
              flex: 1;

              .alert-title {
                font-weight: 600;
                color: $text-primary;
                margin-bottom: $spacing-1;
              }

              .alert-description {
                font-size: $font-size-sm;
                color: $text-secondary;
                margin-bottom: $spacing-1;
              }

              .alert-time {
                font-size: $font-size-xs;
                color: $text-placeholder;
              }
            }

            .alert-actions {
              display: flex;
              flex-direction: column;
              gap: $spacing-2;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}
</style>
