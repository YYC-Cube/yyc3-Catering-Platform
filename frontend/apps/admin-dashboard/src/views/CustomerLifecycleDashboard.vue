<template>
  <div class="customer-lifecycle-dashboard">
    <div class="dashboard-header">
      <h1>客户生命周期管理看板</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadDashboardData"
        />
        <el-button type="primary" @click="loadDashboardData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button @click="exportDashboard">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="metrics-row">
      <el-col :span="4" v-for="metric in overviewMetrics" :key="metric.key">
        <el-card class="metric-card" :class="metric.type">
          <div class="metric-content">
            <div class="metric-icon" :style="{ backgroundColor: metric.color }">
              <el-icon :size="32">
                <component :is="metric.icon" />
              </el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-trend" v-if="metric.trend !== undefined">
                <el-icon :size="14" :color="getTrendColor(metric.trendType)">
                  <component :is="getTrendIcon(metric.trendType)" />
                </el-icon>
                <span>{{ metric.trend }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>生命周期阶段分布</span>
              <el-radio-group v-model="stageViewType" size="small">
                <el-radio-button label="pie">饼图</el-radio-button>
                <el-radio-button label="bar">柱状图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="stageDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>客户价值分布（RFM）</span>
            </div>
          </template>
          <div ref="valueDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>生命周期流转趋势</span>
            </div>
          </template>
          <div ref="flowTrendChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>客户留存率趋势</span>
            </div>
          </template>
          <div ref="retentionRateChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>客户生命周期价值（CLV）分布</span>
            </div>
          </template>
          <div ref="clvDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="alerts-row">
      <el-col :span="24">
        <el-card class="alerts-card">
          <template #header>
            <div class="card-header">
              <span>流失预警</span>
              <div class="header-actions">
                <el-radio-group v-model="alertRiskLevel" size="small" @change="filterAlerts">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="high">高危</el-radio-button>
                  <el-radio-button label="medium">中危</el-radio-button>
                  <el-radio-button label="low">低危</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <el-table :data="filteredAlerts" style="width: 100%">
            <el-table-column prop="customerName" label="客户名称" width="120" />
            <el-table-column prop="churnProbability" label="流失概率" width="100">
              <template #default="{ row }">
                <el-tag :type="getChurnProbabilityType(row.churnProbability)">
                  {{ (row.churnProbability * 100).toFixed(0) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="riskLevel" label="风险等级" width="80">
              <template #default="{ row }">
                <el-tag :type="getRiskLevelType(row.riskLevel)">
                  {{ getRiskLevelLabel(row.riskLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="riskFactors" label="风险因素" width="200">
              <template #default="{ row }">
                <el-tag
                  v-for="factor in row.riskFactors"
                  :key="factor"
                  size="small"
                  style="margin-right: 5px;"
                >
                  {{ factor }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="predictedChurnDate" label="预计流失日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.predictedChurnDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  type="primary"
                  size="small"
                  @click="assignAlert(row)"
                >
                  分配处理
                </el-button>
                <el-button
                  v-if="row.status === 'in_progress'"
                  type="success"
                  size="small"
                  @click="resolveAlert(row)"
                >
                  标记解决
                </el-button>
                <el-button
                  size="small"
                  @click="viewCustomerDetail(row)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="care-reminders-row">
      <el-col :span="24">
        <el-card class="care-reminders-card">
          <template #header>
            <div class="card-header">
              <span>关怀提醒</span>
              <div class="header-actions">
                <el-radio-group v-model="careReminderStatus" size="small" @change="filterCareReminders">
                  <el-radio-button label="pending">待处理</el-radio-button>
                  <el-radio-button label="sent">已发送</el-radio-button>
                  <el-radio-button label="all">全部</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <el-table :data="filteredCareReminders" style="width: 100%">
            <el-table-column prop="customerName" label="客户名称" width="120" />
            <el-table-column prop="careType" label="关怀类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">
                  {{ getCareTypeLabel(row.careType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="关怀内容" min-width="200" show-overflow-tooltip />
            <el-table-column prop="channels" label="发送渠道" width="150">
              <template #default="{ row }">
                <el-tag
                  v-for="channel in row.channels"
                  :key="channel"
                  size="small"
                  style="margin-right: 5px;"
                >
                  {{ getChannelLabel(channel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="scheduledAt" label="计划发送时间" width="150">
              <template #default="{ row }">
                {{ formatDateTime(row.scheduledAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getCareStatusType(row.status)">
                  {{ getCareStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  type="primary"
                  size="small"
                  @click="sendCareReminder(row)"
                >
                  发送
                </el-button>
                <el-button
                  size="small"
                  @click="viewReminderDetail(row)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAssignDialog" title="分配流失预警" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="assignForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="处理人员">
          <el-select v-model="assignForm.assignedTo" placeholder="请选择处理人员">
            <el-option
              v-for="user in staffList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="assignForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认分配</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showResolveDialog" title="标记预警已解决" width="500px">
      <el-form :model="resolveForm" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="resolveForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="解决说明">
          <el-input
            v-model="resolveForm.resolutionNotes"
            type="textarea"
            :rows="4"
            placeholder="请输入解决说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResolveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResolve">确认解决</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  Refresh,
  Download,
  User,
  TrendCharts,
  Warning,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import { useLifecycleRuleEngine } from '@/composables/useLifecycleRuleEngine'
import { useRFMModel } from '@/composables/useRFMModel'
import { useCareReminder } from '@/composables/useCareReminder'
import { useChurnPrediction } from '@/composables/useChurnPrediction'

const { loadRules } = useLifecycleRuleEngine()
const { batchAnalyze, getScoreColor } = useRFMModel()
const {
  pendingReminders,
  sentReminders,
  loadPendingReminders,
  loadSentReminders,
  sendReminder,
  getCareTypeLabel,
  getChannelLabel
} = useCareReminder()
const {
  churnPredictions,
  batchPredictChurn,
  assignAlert,
  resolveAlert,
  getRiskLevelLabel,
  getRiskLevelColor,
  getStatusLabel,
  getStatusColor,
  getUrgency
} = useChurnPrediction()

const loading = ref(false)
const dateRange = ref<[Date, Date] | null>(null)
const stageViewType = ref('pie')
const alertRiskLevel = ref('all')
const careReminderStatus = ref('pending')
const showAssignDialog = ref(false)
const showResolveDialog = ref(false)

const stageDistributionChart = ref<HTMLElement | null>(null)
const valueDistributionChart = ref<HTMLElement | null>(null)
const flowTrendChart = ref<HTMLElement | null>(null)
const retentionRateChart = ref<HTMLElement | null>(null)
const clvDistributionChart = ref<HTMLElement | null>(null)

let stageChartInstance: echarts.ECharts | null = null
let valueChartInstance: echarts.ECharts | null = null
let flowChartInstance: echarts.ECharts | null = null
let retentionChartInstance: echarts.ECharts | null = null
let clvChartInstance: echarts.ECharts | null = null

const overviewMetrics = computed(() => [
  {
    key: 'total',
    label: '总客户数',
    value: '12,580',
    icon: User,
    type: 'primary',
    color: '#409EFF',
    trend: 8.5,
    trendType: 'up'
  },
  {
    key: 'active',
    label: '活跃客户',
    value: '8,245',
    icon: TrendCharts,
    type: 'success',
    color: '#67C23A',
    trend: 12.3,
    trendType: 'up'
  },
  {
    key: 'churned',
    label: '流失客户',
    value: '425',
    icon: Warning,
    type: 'danger',
    color: '#F56C6C',
    trend: -5.2,
    trendType: 'down'
  },
  {
    key: 'retention',
    label: '客户留存率',
    value: '96.6%',
    icon: TrendCharts,
    type: 'warning',
    color: '#E6A23C',
    trend: 2.1,
    trendType: 'up'
  },
  {
    key: 'clv',
    label: '平均CLV',
    value: '¥2,580',
    icon: TrendCharts,
    type: 'info',
    color: '#909399',
    trend: 15.8,
    trendType: 'up'
  },
  {
    key: 'satisfaction',
    label: '客户满意度',
    value: '4.3',
    icon: TrendCharts,
    type: 'success',
    color: '#67C23A',
    trend: 3.5,
    trendType: 'up'
  }
])

const filteredAlerts = computed(() => {
  let alerts = churnPredictions.value
  if (alertRiskLevel.value !== 'all') {
    alerts = alerts.filter(a => a.riskLevel === alertRiskLevel.value)
  }
  return alerts
})

const filteredCareReminders = computed(() => {
  if (careReminderStatus.value === 'pending') {
    return pendingReminders.value
  } else if (careReminderStatus.value === 'sent') {
    return sentReminders.value
  }
  return [...pendingReminders.value, ...sentReminders.value]
})

const assignForm = ref({
  customerId: '',
  customerName: '',
  assignedTo: '',
  notes: ''
})

const resolveForm = ref({
  customerId: '',
  customerName: '',
  resolutionNotes: ''
})

const staffList = ref([
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' }
])

const loadDashboardData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadPendingReminders(),
      loadSentReminders()
    ])

    await nextTick()
    initCharts()
  } catch (error) {
    console.error('Load dashboard data failed:', error)
    ElMessage.error('加载看板数据失败')
  } finally {
    loading.value = false
  }
}

const initCharts = () => {
  initStageDistributionChart()
  initValueDistributionChart()
  initFlowTrendChart()
  initRetentionRateChart()
  initCLVDistributionChart()
}

const initStageDistributionChart = () => {
  if (!stageDistributionChart.value) return

  if (stageChartInstance) {
    stageChartInstance.dispose()
  }

  stageChartInstance = echarts.init(stageDistributionChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '生命周期阶段',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 2500, name: '潜在客户', itemStyle: { color: '#909399' } },
          { value: 1887, name: '新客户', itemStyle: { color: '#409EFF' } },
          { value: 5032, name: '活跃客户', itemStyle: { color: '#67C23A' } },
          { value: 1887, name: '忠诚客户', itemStyle: { color: '#E6A23C' } },
          { value: 1005, name: '休眠客户', itemStyle: { color: '#F56C6C' } },
          { value: 269, name: '流失客户', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }

  stageChartInstance.setOption(option)
}

const initValueDistributionChart = () => {
  if (!valueDistributionChart.value) return

  if (valueChartInstance) {
    valueChartInstance.dispose()
  }

  valueChartInstance = echarts.init(valueDistributionChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['超级VIP', 'VIP', '会员', '普通', '低价值'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '客户数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 629, itemStyle: { color: '#F56C6C' } },
          { value: 1887, itemStyle: { color: '#E6A23C' } },
          { value: 3774, itemStyle: { color: '#409EFF' } },
          { value: 5032, itemStyle: { color: '#67C23A' } },
          { value: 1258, itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }

  valueChartInstance.setOption(option)
}

const initFlowTrendChart = () => {
  if (!flowTrendChart.value) return

  if (flowChartInstance) {
    flowChartInstance.dispose()
  }

  flowChartInstance = echarts.init(flowTrendChart.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['流入', '流出']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '流入',
        type: 'line',
        stack: 'Total',
        areaStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          width: 1
        },
        showSymbol: false,
        data: [820, 932, 901, 934, 1290, 1330]
      },
      {
        name: '流出',
        type: 'line',
        stack: 'Total',
        areaStyle: {
          color: '#F56C6C'
        },
        lineStyle: {
          width: 1
        },
        showSymbol: false,
        data: [120, 132, 101, 134, 90, 230]
      }
    ]
  }

  flowChartInstance.setOption(option)
}

const initRetentionRateChart = () => {
  if (!retentionRateChart.value) return

  if (retentionChartInstance) {
    retentionChartInstance.dispose()
  }

  retentionChartInstance = echarts.init(retentionRateChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '留存率',
        type: 'line',
        data: [95.2, 96.1, 95.8, 96.5, 97.2, 96.6],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      }
    ]
  }

  retentionChartInstance.setOption(option)
}

const initCLVDistributionChart = () => {
  if (!clvDistributionChart.value) return

  if (clvChartInstance) {
    clvChartInstance.dispose()
  }

  clvChartInstance = echarts.init(clvDistributionChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['<1000', '1000-2000', '2000-3000', '3000-4000', '4000-5000', '>5000'],
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '客户数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 2516, itemStyle: { color: '#909399' } },
          { value: 3774, itemStyle: { color: '#67C23A' } },
          { value: 3145, itemStyle: { color: '#409EFF' } },
          { value: 1887, itemStyle: { color: '#E6A23C' } },
          { value: 942, itemStyle: { color: '#F56C6C' } },
          { value: 316, itemStyle: { color: '#E6A23C' } }
        ]
      }
    ]
  }

  clvChartInstance.setOption(option)
}

const filterAlerts = () => {
}

const filterCareReminders = () => {
}

const assignAlert = (alert: any) => {
  assignForm.value = {
    customerId: alert.customerId,
    customerName: alert.customerName,
    assignedTo: '',
    notes: ''
  }
  showAssignDialog.value = true
}

const confirmAssign = () => {
  if (!assignForm.value.assignedTo) {
    ElMessage.warning('请选择处理人员')
    return
  }

  assignAlert(assignForm.value.customerId, assignForm.value.assignedTo)
  showAssignDialog.value = false
  ElMessage.success('分配成功')
}

const resolveAlert = (alert: any) => {
  resolveForm.value = {
    customerId: alert.customerId,
    customerName: alert.customerName,
    resolutionNotes: ''
  }
  showResolveDialog.value = true
}

const confirmResolve = () => {
  if (!resolveForm.value.resolutionNotes) {
    ElMessage.warning('请输入解决说明')
    return
  }

  resolveAlert(resolveForm.value.customerId, resolveForm.value.resolutionNotes)
  showResolveDialog.value = false
  ElMessage.success('标记成功')
}

const sendCareReminder = async (reminder: any) => {
  try {
    await sendReminder(reminder)
  } catch (error) {
    console.error('Send care reminder failed:', error)
  }
}

const viewCustomerDetail = (alert: any) => {
  ElMessage.info('查看客户详情功能开发中')
}

const viewReminderDetail = (reminder: any) => {
  ElMessage.info('查看提醒详情功能开发中')
}

const exportDashboard = () => {
  ElMessage.info('导出报告功能开发中')
}

const getTrendColor = (trendType: string): string => {
  return trendType === 'up' ? '#67C23A' : '#F56C6C'
}

const getTrendIcon = (trendType: string): any => {
  return trendType === 'up' ? ArrowUp : ArrowDown
}

const getChurnProbabilityType = (probability: number): string => {
  if (probability >= 0.7) return 'danger'
  if (probability >= 0.4) return 'warning'
  return 'info'
}

const getRiskLevelType = (riskLevel: string): string => {
  if (riskLevel === 'high') return 'danger'
  if (riskLevel === 'medium') return 'warning'
  return 'info'
}

const getStatusType = (status: string): string => {
  if (status === 'pending') return 'warning'
  if (status === 'in_progress') return 'primary'
  if (status === 'resolved') return 'success'
  return 'info'
}

const getCareStatusType = (status: string): string => {
  if (status === 'pending') return 'warning'
  if (status === 'sent') return 'success'
  return 'info'
}

const getCareStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待发送',
    sent: '已发送',
    failed: '发送失败'
  }
  return labels[status] || '未知'
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadDashboardData()
})

onBeforeUnmount(() => {
  if (stageChartInstance) stageChartInstance.dispose()
  if (valueChartInstance) valueChartInstance.dispose()
  if (flowChartInstance) flowChartInstance.dispose()
  if (retentionChartInstance) retentionChartInstance.dispose()
  if (clvChartInstance) clvChartInstance.dispose()
})
</script>

<style scoped>
.customer-lifecycle-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.metrics-row,
.charts-row,
.alerts-row,
.care-reminders-row {
  margin-bottom: 20px;
}

.metric-card {
  cursor: pointer;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.alerts-card,
.care-reminders-card {
  min-height: 500px;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>
