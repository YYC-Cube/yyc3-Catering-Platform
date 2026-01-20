<template>
  <div class="customer-churn-prediction">
    <el-card class="churn-card">
      <template #header>
        <div class="card-header">
          <span>客户流失预测</span>
          <el-button-group>
            <el-button size="small" @click="refreshPrediction">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showConfigDialog = true">
              <el-icon><Setting /></el-icon>
              配置模型
            </el-button>
            <el-button size="small" @click="exportPrediction">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="churn-content">
        <div class="churn-overview">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="overview-card high-risk">
                <div class="card-icon">
                  <el-icon :size="40"><WarningFilled /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">高风险客户</div>
                  <div class="card-value">{{ churnStats.highRisk }}</div>
                  <div class="card-trend">
                    <el-icon :size="14"><Top /></el-icon>
                    <span>较上月 +{{ churnStats.highRiskTrend }}%</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card medium-risk">
                <div class="card-icon">
                  <el-icon :size="40"><Warning /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">中风险客户</div>
                  <div class="card-value">{{ churnStats.mediumRisk }}</div>
                  <div class="card-trend">
                    <el-icon :size="14"><Bottom /></el-icon>
                    <span>较上月 -{{ churnStats.mediumRiskTrend }}%</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card low-risk">
                <div class="card-icon">
                  <el-icon :size="40"><InfoFilled /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">低风险客户</div>
                  <div class="card-value">{{ churnStats.lowRisk }}</div>
                  <div class="card-trend">
                    <el-icon :size="14"><Minus /></el-icon>
                    <span>较上月持平</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card total">
                <div class="card-icon">
                  <el-icon :size="40"><User /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">总客户数</div>
                  <div class="card-value">{{ churnStats.totalCustomers }}</div>
                  <div class="card-trend">
                    <el-icon :size="14"><Top /></el-icon>
                    <span>较上月 +{{ churnStats.totalTrend }}%</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="churn-factors">
          <h3>流失风险因素分析</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="factor-chart">
                <div class="chart-title">主要流失原因</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="factor-chart">
                <div class="chart-title">流失风险分布</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="churn-customers">
          <h3>高风险客户列表</h3>
          <div class="filter-bar">
            <el-form :inline="true" :model="filters" class="filter-form">
              <el-form-item label="风险等级">
                <el-select v-model="filters.riskLevel" placeholder="全部" clearable>
                  <el-option label="高风险" value="high" />
                  <el-option label="中风险" value="medium" />
                  <el-option label="低风险" value="low" />
                </el-select>
              </el-form-item>
              <el-form-item label="流失概率">
                <el-select v-model="filters.probabilityRange" placeholder="全部" clearable>
                  <el-option label=">80%" value="very_high" />
                  <el-option label="60%-80%" value="high" />
                  <el-option label="40%-60%" value="medium" />
                  <el-option label="<40%" value="low" />
                </el-select>
              </el-form-item>
              <el-form-item label="干预状态">
                <el-select v-model="filters.interventionStatus" placeholder="全部" clearable>
                  <el-option label="未干预" value="none" />
                  <el-option label="干预中" value="in_progress" />
                  <el-option label="已干预" value="completed" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadCustomers">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="customerList" stripe>
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="name" label="客户姓名" width="120" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column label="风险等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getRiskTagType(row.riskLevel)" size="small">
                  {{ getRiskLabel(row.riskLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="流失概率" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.churnProbability"
                  :color="getProgressColor(row.churnProbability)"
                  :show-text="false"
                />
                <span class="probability-text">{{ row.churnProbability }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="主要风险因素" min-width="200">
              <template #default="{ row }">
                <div class="risk-factors">
                  <el-tag
                    v-for="factor in row.riskFactors"
                    :key="factor"
                    size="small"
                    class="factor-tag"
                  >
                    {{ factor }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="预计流失时间" width="120">
              <template #default="{ row }">
                {{ formatRelativeTime(row.predictedChurnDate) }}
              </template>
            </el-table-column>
            <el-table-column label="干预状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getInterventionTagType(row.interventionStatus)" size="small">
                  {{ getInterventionLabel(row.interventionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="viewDetail(row)">
                  详情
                </el-button>
                <el-button size="small" text type="primary" @click="analyzeRisk(row)">
                  分析
                </el-button>
                <el-button size="small" text type="warning" @click="intervene(row)">
                  干预
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <div class="churn-interventions">
          <h3>干预建议</h3>
          <div class="intervention-list">
            <div
              v-for="intervention in interventionSuggestions"
              :key="intervention.id"
              class="intervention-item"
            >
              <div class="intervention-header">
                <div class="intervention-title">{{ intervention.title }}</div>
                <el-tag :type="getInterventionPriorityTagType(intervention.priority)" size="small">
                  {{ intervention.priority }}
                </el-tag>
              </div>
              <div class="intervention-content">
                <div class="intervention-description">{{ intervention.description }}</div>
                <div class="intervention-metrics">
                  <div class="metric-item">
                    <span class="label">适用客户:</span>
                    <span class="value">{{ intervention.customerCount }}人</span>
                  </div>
                  <div class="metric-item">
                    <span class="label">预期挽回率:</span>
                    <span class="value">{{ intervention.expectedRetentionRate }}%</span>
                  </div>
                  <div class="metric-item">
                    <span class="label">成本预估:</span>
                    <span class="value">¥{{ intervention.estimatedCost }}</span>
                  </div>
                </div>
              </div>
              <div class="intervention-actions">
                <el-button size="small" type="primary" @click="applyIntervention(intervention)">
                  应用
                </el-button>
                <el-button size="small" @click="viewInterventionDetail(intervention)">
                  详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showConfigDialog"
      title="流失预测模型配置"
      width="800px"
      @closed="resetConfigForm"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        :rules="configRules"
        label-width="150px"
      >
        <el-form-item label="预测模型" prop="modelType">
          <el-select v-model="configForm.modelType" placeholder="请选择模型">
            <el-option label="逻辑回归" value="logistic_regression" />
            <el-option label="随机森林" value="random_forest" />
            <el-option label="XGBoost" value="xgboost" />
            <el-option label="神经网络" value="neural_network" />
          </el-select>
        </el-form-item>
        <el-form-item label="训练周期" prop="trainingPeriod">
          <el-input-number
            v-model="configForm.trainingPeriod"
            :min="30"
            :max="365"
            :step="1"
          />
          <span class="unit">天</span>
        </el-form-item>
        <el-form-item label="预测周期" prop="predictionPeriod">
          <el-input-number
            v-model="configForm.predictionPeriod"
            :min="7"
            :max="90"
            :step="1"
          />
          <span class="unit">天</span>
        </el-form-item>
        <el-form-item label="高风险阈值" prop="highRiskThreshold">
          <el-slider
            v-model="configForm.highRiskThreshold"
            :min="60"
            :max="100"
            :step="5"
            show-input
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item label="中风险阈值" prop="mediumRiskThreshold">
          <el-slider
            v-model="configForm.mediumRiskThreshold"
            :min="30"
            :max="60"
            :step="5"
            show-input
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item label="风险因素权重">
          <div class="factor-weights">
            <div class="weight-item">
              <span class="factor-label">消费频率下降:</span>
              <el-slider
                v-model="configForm.frequencyDeclineWeight"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
              />
            </div>
            <div class="weight-item">
              <span class="factor-label">消费金额下降:</span>
              <el-slider
                v-model="configForm.amountDeclineWeight"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
              />
            </div>
            <div class="weight-item">
              <span class="factor-label">投诉增加:</span>
              <el-slider
                v-model="configForm.complaintIncreaseWeight"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
              />
            </div>
            <div class="weight-item">
              <span class="factor-label">互动减少:</span>
              <el-slider
                v-model="configForm.interactionDeclineWeight"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="自动预警">
          <el-switch v-model="configForm.autoAlert" />
          <span class="unit">开启后自动发送预警通知</span>
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
  Download,
  WarningFilled,
  Warning,
  InfoFilled,
  User,
  Top,
  Bottom,
  Minus,
  Search
} from '@element-plus/icons-vue'

interface ChurnStats {
  highRisk: number
  highRiskTrend: number
  mediumRisk: number
  mediumRiskTrend: number
  lowRisk: number
  lowRiskTrend: number
  totalCustomers: number
  totalTrend: number
}

interface ChurnCustomer {
  id: string
  name: string
  phone: string
  riskLevel: 'high' | 'medium' | 'low'
  churnProbability: number
  riskFactors: string[]
  predictedChurnDate: string
  interventionStatus: 'none' | 'in_progress' | 'completed'
}

interface InterventionSuggestion {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  description: string
  customerCount: number
  expectedRetentionRate: number
  estimatedCost: number
}

const showConfigDialog = ref(false)
const saving = ref(false)
const configFormRef = ref()

const churnStats = ref<ChurnStats>({
  highRisk: 45,
  highRiskTrend: 12.5,
  mediumRisk: 128,
  mediumRiskTrend: 8.3,
  lowRisk: 827,
  lowRiskTrend: 0,
  totalCustomers: 1000,
  totalTrend: 5.2
})

const customerList = ref<ChurnCustomer[]>([
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    riskLevel: 'high',
    churnProbability: 85,
    riskFactors: ['消费频率下降', '投诉增加', '互动减少'],
    predictedChurnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    interventionStatus: 'none'
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139000',
    riskLevel: 'high',
    churnProbability: 78,
    riskFactors: ['消费金额下降', '互动减少'],
    predictedChurnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    interventionStatus: 'in_progress'
  },
  {
    id: '3',
    name: '王五',
    phone: '13700137000',
    riskLevel: 'medium',
    churnProbability: 52,
    riskFactors: ['消费频率下降'],
    predictedChurnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    interventionStatus: 'none'
  }
])

const interventionSuggestions = ref<InterventionSuggestion[]>([
  {
    id: '1',
    title: '发送专属优惠券',
    priority: 'high',
    description: '向高风险客户发送专属优惠券，激励其再次消费',
    customerCount: 45,
    expectedRetentionRate: 35,
    estimatedCost: 4500
  },
  {
    id: '2',
    title: '电话回访关怀',
    priority: 'high',
    description: '对高风险客户进行电话回访，了解客户需求并提供帮助',
    customerCount: 30,
    expectedRetentionRate: 45,
    estimatedCost: 3000
  },
  {
    id: '3',
    title: '会员权益升级',
    priority: 'medium',
    description: '为符合条件的客户升级会员等级，提供更多权益',
    customerCount: 50,
    expectedRetentionRate: 28,
    estimatedCost: 8000
  }
])

const filters = reactive({
  riskLevel: '',
  probabilityRange: '',
  interventionStatus: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 100
})

const configForm = reactive({
  modelType: 'random_forest',
  trainingPeriod: 90,
  predictionPeriod: 30,
  highRiskThreshold: 80,
  mediumRiskThreshold: 60,
  frequencyDeclineWeight: 0.4,
  amountDeclineWeight: 0.3,
  complaintIncreaseWeight: 0.2,
  interactionDeclineWeight: 0.1,
  autoAlert: true
})

const configRules = {
  modelType: [
    { required: true, message: '请选择预测模型', trigger: 'change' }
  ],
  trainingPeriod: [
    { required: true, message: '请输入训练周期', trigger: 'blur' }
  ],
  predictionPeriod: [
    { required: true, message: '请输入预测周期', trigger: 'blur' }
  ],
  highRiskThreshold: [
    { required: true, message: '请设置高风险阈值', trigger: 'blur' }
  ],
  mediumRiskThreshold: [
    { required: true, message: '请设置中风险阈值', trigger: 'blur' }
  ]
}

const getRiskTagType = (level: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return typeMap[level] || 'info'
}

const getRiskLabel = (level: string) => {
  const labelMap: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return labelMap[level] || level
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#f56c6c'
  if (percentage >= 60) return '#e6a23c'
  if (percentage >= 40) return '#409eff'
  return '#67c23a'
}

const getInterventionTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    none: 'info',
    in_progress: 'warning',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}

const getInterventionLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    none: '未干预',
    in_progress: '干预中',
    completed: '已干预'
  }
  return labelMap[status] || status
}

const getInterventionPriorityTagType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const formatRelativeTime = (timestamp: string) => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = time - now

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return '已流失'
  if (days === 0) return '今天'
  if (days < 7) return `${days}天后`
  if (days < 30) return `${Math.floor(days / 7)}周后`
  return `${Math.floor(days / 30)}月后`
}

const refreshPrediction = async () => {
  try {
    ElMessage.loading('刷新流失预测数据...')
    const response = await fetch('/api/customers/churn').then(res => res.json())
    if (response.success) {
      churnStats.value = response.data.stats
      customerList.value = response.data.customers
      interventionSuggestions.value = response.data.interventions
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('Refresh prediction failed:', error)
    ElMessage.error('刷新失败')
  }
}

const loadCustomers = async () => {
  try {
    const response = await fetch('/api/customers/churn/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
    }).then(res => res.json())
    if (response.success) {
      customerList.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('Load customers failed:', error)
    ElMessage.error('加载客户列表失败')
  }
}

const viewDetail = (customer: ChurnCustomer) => {
  ElMessage.info(`查看客户 ${customer.name} 的详情`)
}

const analyzeRisk = (customer: ChurnCustomer) => {
  ElMessage.info(`分析客户 ${customer.name} 的流失风险`)
}

const intervene = async (customer: ChurnCustomer) => {
  try {
    await ElMessageBox.confirm(
      `确定要对客户 ${customer.name} 进行干预吗？`,
      '干预确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('干预任务已创建')
    await refreshPrediction()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Intervene failed:', error)
      ElMessage.error('干预失败')
    }
  }
}

const applyIntervention = async (intervention: InterventionSuggestion) => {
  try {
    await ElMessageBox.confirm(
      `确定要应用干预建议"${intervention.title}"吗？`,
      '应用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    ElMessage.success('干预建议已应用')
    await refreshPrediction()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Apply intervention failed:', error)
      ElMessage.error('应用失败')
    }
  }
}

const viewInterventionDetail = (intervention: InterventionSuggestion) => {
  ElMessage.info(`查看干预建议 ${intervention.title} 的详情`)
}

const exportPrediction = async () => {
  try {
    const response = await fetch('/api/customers/churn/export').then(res => res.blob())
    const url = window.URL.createObjectURL(response)
    const a = document.createElement('a')
    a.href = url
    a.download = `流失预测报告_${new Date().getTime()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export prediction failed:', error)
    ElMessage.error('导出失败')
  }
}

const saveConfig = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()
    saving.value = true

    ElMessage.success('保存成功')
    showConfigDialog.value = false
    await refreshPrediction()
  } catch (error) {
    console.error('Save config failed:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetConfigForm = () => {
  configForm.modelType = 'random_forest'
  configForm.trainingPeriod = 90
  configForm.predictionPeriod = 30
  configForm.highRiskThreshold = 80
  configForm.mediumRiskThreshold = 60
  configForm.frequencyDeclineWeight = 0.4
  configForm.amountDeclineWeight = 0.3
  configForm.complaintIncreaseWeight = 0.2
  configForm.interactionDeclineWeight = 0.1
  configForm.autoAlert = true
  configFormRef.value?.resetFields()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadCustomers()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadCustomers()
}

onMounted(() => {
  refreshPrediction()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-churn-prediction {
  .churn-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .churn-content {
      .churn-overview {
        margin-bottom: $spacing-6;

        .overview-card {
          display: flex;
          align-items: center;
          gap: $spacing-4;
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;
          transition: all 0.3s;

          &:hover {
            box-shadow: $shadow-md;
            transform: translateY(-2px);
          }

          &.high-risk {
            border-left: 4px solid $danger-color;
          }

          &.medium-risk {
            border-left: 4px solid $warning-color;
          }

          &.low-risk {
            border-left: 4px solid $success-color;
          }

          &.total {
            border-left: 4px solid $primary-color;
          }

          .card-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border-radius: $border-radius-lg;
            background: $background-light;
            color: $primary-color;
          }

          .card-info {
            flex: 1;

            .card-label {
              font-size: $font-size-sm;
              color: $text-secondary;
              margin-bottom: $spacing-1;
            }

            .card-value {
              font-size: $font-size-xl;
              font-weight: $font-weight-bold;
              color: $text-primary;
              margin-bottom: $spacing-1;
            }

            .card-trend {
              display: flex;
              align-items: center;
              gap: $spacing-1;
              font-size: $font-size-xs;
              color: $text-secondary;
            }
          }
        }
      }

      .churn-factors {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .factor-chart {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;

          .chart-title {
            font-size: $font-size-base;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: $spacing-3;
          }

          .chart-placeholder {
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .churn-customers {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .filter-bar {
          margin-bottom: $spacing-4;
          padding: $spacing-3;
          background: $background-light;
          border-radius: $border-radius-sm;

          .filter-form {
            margin: 0;
          }
        }

        .risk-factors {
          display: flex;
          flex-wrap: wrap;
          gap: $spacing-1;

          .factor-tag {
            margin: 0;
          }
        }

        .probability-text {
          margin-left: $spacing-2;
          font-size: $font-size-sm;
          font-weight: 600;
        }

        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: $spacing-4;
        }
      }

      .churn-interventions {
        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .intervention-list {
          display: flex;
          flex-direction: column;
          gap: $spacing-3;

          .intervention-item {
            padding: $spacing-4;
            background: $white;
            border: 1px solid $border-color;
            border-radius: $border-radius-md;

            .intervention-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: $spacing-3;

              .intervention-title {
                font-size: $font-size-base;
                font-weight: 600;
                color: $text-primary;
              }
            }

            .intervention-content {
              margin-bottom: $spacing-3;

              .intervention-description {
                font-size: $font-size-sm;
                color: $text-secondary;
                margin-bottom: $spacing-3;
                line-height: 1.5;
              }

              .intervention-metrics {
                display: flex;
                gap: $spacing-4;

                .metric-item {
                  .label {
                    font-size: $font-size-xs;
                    color: $text-secondary;
                    margin-right: $spacing-1;
                  }

                  .value {
                    font-size: $font-size-sm;
                    font-weight: 600;
                    color: $text-primary;
                  }
                }
              }
            }

            .intervention-actions {
              display: flex;
              gap: $spacing-2;
            }
          }
        }
      }
    }
  }

  .unit {
    margin-left: $spacing-2;
    color: $text-secondary;
  }

  .factor-weights {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;

    .weight-item {
      display: flex;
      align-items: center;
      gap: $spacing-2;

      .factor-label {
        width: 150px;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
}
</style>
