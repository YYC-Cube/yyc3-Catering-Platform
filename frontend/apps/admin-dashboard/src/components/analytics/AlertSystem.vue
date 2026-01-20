/**
 * @fileoverview 异常预警组件
 * @description 提供数据分析异常预警功能，包括实时监控、阈值设置、预警通知等
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

<template>
  <div class="alert-system">
    <!-- 预警概览卡片 -->
    <el-card class="alert-overview" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>预警概览</span>
          <el-button type="primary" size="small" @click="showAlertSettings = true">
            <el-icon><Setting /></el-icon>
            预警设置
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6" v-for="alert in alertOverview" :key="alert.type">
          <div class="alert-metric" :class="alert.severity">
            <div class="metric-icon">
              <el-icon :size="24">
                <component :is="alert.icon" />
              </el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ alert.count }}</div>
              <div class="metric-label">{{ alert.label }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 预警列表 -->
    <el-card class="alert-list" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>预警列表</span>
          <div class="header-actions">
            <el-select v-model="alertFilter" size="small" @change="filterAlerts">
              <el-option label="全部预警" value="all" />
              <el-option label="严重" value="critical" />
              <el-option label="警告" value="warning" />
              <el-option label="提示" value="info" />
            </el-select>
            <el-button type="primary" size="small" @click="refreshAlerts" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredAlerts" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)" size="small">
              {{ getSeverityText(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="预警类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="预警标题" min-width="200" />
        <el-table-column prop="description" label="预警描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="currentValue" label="当前值" width="120">
          <template #default="{ row }">
            {{ formatValue(row.currentValue, row.unit) }}
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值" width="120">
          <template #default="{ row }">
            {{ formatValue(row.threshold, row.unit) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="触发时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'resolved' ? 'success' : 'warning'" size="small">
              {{ row.status === 'resolved' ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewAlertDetail(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status !== 'resolved'"
              type="success"
              size="small"
              @click="resolveAlert(row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalAlerts"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 预警趋势图 -->
    <el-card class="alert-trends" shadow="hover">
      <template #header>
        <span>预警趋势</span>
      </template>
      <div ref="alertTrendsChart" class="chart-container"></div>
    </el-card>

    <!-- 预警设置对话框 -->
    <el-dialog v-model="showAlertSettings" title="预警设置" width="80%">
      <el-tabs v-model="settingsTab">
        <!-- 阈值设置 -->
        <el-tab-pane label="阈值设置" name="thresholds">
          <el-table :data="thresholdSettings" style="width: 100%">
            <el-table-column prop="metric" label="指标名称" width="200" />
            <el-table-column prop="description" label="指标描述" min-width="200" />
            <el-table-column label="严重阈值" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.criticalThreshold"
                  :min="0"
                  :precision="2"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="警告阈值" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.warningThreshold"
                  :min="0"
                  :precision="2"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="100" />
            <el-table-column label="启用" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="saveThreshold(row)">
                  保存
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notifications">
          <el-form :model="notificationSettings" label-width="150px">
            <el-form-item label="启用通知">
              <el-switch v-model="notificationSettings.enabled" />
            </el-form-item>
            <el-form-item label="通知方式">
              <el-checkbox-group v-model="notificationSettings.channels">
                <el-checkbox label="email">邮件通知</el-checkbox>
                <el-checkbox label="sms">短信通知</el-checkbox>
                <el-checkbox label="push">推送通知</el-checkbox>
                <el-checkbox label="webhook">Webhook</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="通知频率">
              <el-select v-model="notificationSettings.frequency">
                <el-option label="立即通知" value="immediate" />
                <el-option label="每小时汇总" value="hourly" />
                <el-option label="每日汇总" value="daily" />
                <el-option label="每周汇总" value="weekly" />
              </el-select>
            </el-form-item>
            <el-form-item label="严重程度过滤">
              <el-checkbox-group v-model="notificationSettings.severityFilter">
                <el-checkbox label="critical">严重</el-checkbox>
                <el-checkbox label="warning">警告</el-checkbox>
                <el-checkbox label="info">提示</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="邮件收件人">
              <el-input
                v-model="notificationSettings.emailRecipients"
                type="textarea"
                :rows="3"
                placeholder="多个邮箱用逗号分隔"
              />
            </el-form-item>
            <el-form-item label="Webhook URL">
              <el-input v-model="notificationSettings.webhookUrl" placeholder="输入Webhook URL" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 历史记录 -->
        <el-tab-pane label="历史记录" name="history">
          <el-table :data="alertHistory" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="type" label="预警类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTypeColor(row.type)" size="small">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="预警标题" min-width="200" />
            <el-table-column prop="resolvedAt" label="处理时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.resolvedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="resolutionTime" label="处理耗时" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.resolutionTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="resolvedBy" label="处理人" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAlertSettings = false">取消</el-button>
          <el-button type="primary" @click="saveAllSettings">保存所有设置</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预警详情对话框 -->
    <el-dialog v-model="showAlertDetail" title="预警详情" width="60%">
      <div v-if="selectedAlert" class="alert-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预警ID">
            {{ selectedAlert.id }}
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityType(selectedAlert.severity)" size="small">
              {{ getSeverityText(selectedAlert.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预警类型">
            <el-tag :type="getTypeColor(selectedAlert.type)" size="small">
              {{ getTypeText(selectedAlert.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedAlert.status === 'resolved' ? 'success' : 'warning'" size="small">
              {{ selectedAlert.status === 'resolved' ? '已处理' : '待处理' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预警标题" :span="2">
            {{ selectedAlert.title }}
          </el-descriptions-item>
          <el-descriptions-item label="预警描述" :span="2">
            {{ selectedAlert.description }}
          </el-descriptions-item>
          <el-descriptions-item label="当前值">
            {{ formatValue(selectedAlert.currentValue, selectedAlert.unit) }}
          </el-descriptions-item>
          <el-descriptions-item label="阈值">
            {{ formatValue(selectedAlert.threshold, selectedAlert.unit) }}
          </el-descriptions-item>
          <el-descriptions-item label="偏差">
            <span :class="getDeviationClass(selectedAlert.deviation)">
              {{ selectedAlert.deviation > 0 ? '+' : '' }}{{ selectedAlert.deviation.toFixed(2) }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="触发时间">
            {{ formatDateTime(selectedAlert.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="相关数据" :span="2">
            <div v-if="selectedAlert.relatedData" class="related-data">
              <el-table :data="selectedAlert.relatedData" size="small" style="width: 100%">
                <el-table-column prop="metric" label="指标" />
                <el-table-column prop="value" label="值" />
                <el-table-column prop="change" label="变化" />
              </el-table>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions">
          <el-button type="primary" @click="resolveAlert(selectedAlert)">
            标记为已处理
          </el-button>
          <el-button @click="exportAlertDetail(selectedAlert)">
            导出详情
          </el-button>
          <el-button @click="showAlertDetail = false">
            关闭
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Refresh, Warning, InfoFilled, CircleClose } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 预警严重程度枚举
enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

// 预警类型枚举
enum AlertType {
  REVENUE = 'revenue',
  ORDERS = 'orders',
  CUSTOMERS = 'customers',
  SATISFACTION = 'satisfaction',
  INVENTORY = 'inventory',
  STAFF = 'staff',
  KITCHEN = 'kitchen',
  OPERATIONAL = 'operational'
}

// 预警接口
interface Alert {
  id: number
  severity: AlertSeverity
  type: AlertType
  title: string
  description: string
  currentValue: number
  threshold: number
  unit: string
  deviation: number
  createdAt: string
  status: 'pending' | 'resolved'
  relatedData?: Array<{
    metric: string
    value: number
    change: number
  }>
}

// 阈值设置接口
interface ThresholdSetting {
  metric: string
  description: string
  criticalThreshold: number
  warningThreshold: number
  unit: string
  enabled: boolean
}

// 响应式数据
const loading = ref(false)
const showAlertSettings = ref(false)
const showAlertDetail = ref(false)
const settingsTab = ref('thresholds')
const alertFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const totalAlerts = ref(0)
const selectedAlert = ref<Alert | null>(null)

// 预警概览
const alertOverview = ref([
  {
    type: 'critical',
    label: '严重预警',
    count: 3,
    severity: 'critical',
    icon: 'CircleClose'
  },
  {
    type: 'warning',
    label: '警告预警',
    count: 8,
    severity: 'warning',
    icon: 'Warning'
  },
  {
    type: 'info',
    label: '提示预警',
    count: 15,
    severity: 'info',
    icon: 'InfoFilled'
  },
  {
    type: 'resolved',
    label: '已处理',
    count: 45,
    severity: 'resolved',
    icon: 'CircleCheck'
  }
])

// 预警列表
const alerts = ref<Alert[]>([
  {
    id: 1,
    severity: AlertSeverity.CRITICAL,
    type: AlertType.REVENUE,
    title: '收入异常下降',
    description: '今日收入较昨日下降超过20%，需要关注',
    currentValue: 85000,
    threshold: 100000,
    unit: '元',
    deviation: -15.5,
    createdAt: '2025-01-20 10:30:00',
    status: 'pending',
    relatedData: [
      { metric: '订单数', value: 120, change: -18.5 },
      { metric: '客单价', value: 708, change: 3.2 }
    ]
  },
  {
    id: 2,
    severity: AlertSeverity.WARNING,
    type: AlertType.CUSTOMERS,
    title: '客户流失预警',
    description: '本周客户流失率超过10%，需要采取措施',
    currentValue: 12.5,
    threshold: 10,
    unit: '%',
    deviation: 2.5,
    createdAt: '2025-01-20 09:15:00',
    status: 'pending'
  },
  {
    id: 3,
    severity: AlertSeverity.INFO,
    type: AlertType.SATISFACTION,
    title: '客户满意度下降',
    description: '客户满意度评分下降至4.2，低于平均水平',
    currentValue: 4.2,
    threshold: 4.5,
    unit: '分',
    deviation: -0.3,
    createdAt: '2025-01-20 08:45:00',
    status: 'pending'
  }
])

// 阈值设置
const thresholdSettings = ref<ThresholdSetting[]>([
  {
    metric: 'dailyRevenue',
    description: '日收入',
    criticalThreshold: 80000,
    warningThreshold: 100000,
    unit: '元',
    enabled: true
  },
  {
    metric: 'dailyOrders',
    description: '日订单数',
    criticalThreshold: 100,
    warningThreshold: 150,
    unit: '单',
    enabled: true
  },
  {
    metric: 'customerRetention',
    description: '客户保留率',
    criticalThreshold: 70,
    warningThreshold: 80,
    unit: '%',
    enabled: true
  },
  {
    metric: 'customerSatisfaction',
    description: '客户满意度',
    criticalThreshold: 4.0,
    warningThreshold: 4.5,
    unit: '分',
    enabled: true
  },
  {
    metric: 'inventoryTurnover',
    description: '库存周转率',
    criticalThreshold: 2,
    warningThreshold: 3,
    unit: '次/月',
    enabled: true
  },
  {
    metric: 'staffEfficiency',
    description: '员工效率',
    criticalThreshold: 70,
    warningThreshold: 80,
    unit: '%',
    enabled: true
  }
])

// 通知设置
const notificationSettings = reactive({
  enabled: true,
  channels: ['email', 'push'],
  frequency: 'immediate',
  severityFilter: ['critical', 'warning'],
  emailRecipients: 'admin@yyc3.com, manager@yyc3.com',
  webhookUrl: ''
})

// 预警历史
const alertHistory = ref([
  {
    id: 101,
    type: AlertType.REVENUE,
    title: '收入异常下降',
    resolvedAt: '2025-01-19 15:30:00',
    resolutionTime: 180,
    resolvedBy: '张经理'
  },
  {
    id: 102,
    type: AlertType.CUSTOMERS,
    title: '客户流失预警',
    resolvedAt: '2025-01-19 14:20:00',
    resolutionTime: 120,
    resolvedBy: '李主管'
  }
])

// 图表引用
const alertTrendsChart = ref<HTMLElement>()

// 计算属性
const filteredAlerts = computed(() => {
  let result = alerts.value

  if (alertFilter.value !== 'all') {
    result = result.filter(alert => alert.severity === alertFilter.value)
  }

  return result
})

// 方法
const refreshAlerts = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('预警数据已刷新')
  } catch (error) {
    console.error('刷新预警数据失败:', error)
    ElMessage.error('刷新预警数据失败')
  } finally {
    loading.value = false
  }
}

const filterAlerts = () => {
  currentPage.value = 1
}

const viewAlertDetail = (alert: Alert) => {
  selectedAlert.value = alert
  showAlertDetail.value = true
}

const resolveAlert = async (alert: Alert) => {
  try {
    await ElMessageBox.confirm('确定要标记此预警为已处理吗？', '确认处理', {
      type: 'warning'
    })

    alert.status = 'resolved'
    ElMessage.success('预警已标记为已处理')
    showAlertDetail.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理预警失败:', error)
      ElMessage.error('处理预警失败')
    }
  }
}

const saveThreshold = async (threshold: ThresholdSetting) => {
  try {
    ElMessage.success(`阈值设置已保存: ${threshold.description}`)
  } catch (error) {
    console.error('保存阈值失败:', error)
    ElMessage.error('保存阈值失败')
  }
}

const saveAllSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要保存所有设置吗？', '确认保存', {
      type: 'warning'
    })

    ElMessage.success('所有设置已保存')
    showAlertSettings.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存设置失败:', error)
      ElMessage.error('保存设置失败')
    }
  }
}

const exportAlertDetail = (alert: Alert) => {
  ElMessage.success('预警详情已导出')
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const getSeverityType = (severity: string) => {
  const types = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return types[severity] || 'info'
}

const getSeverityText = (severity: string) => {
  const texts = {
    critical: '严重',
    warning: '警告',
    info: '提示'
  }
  return texts[severity] || severity
}

const getTypeColor = (type: string) => {
  const colors = {
    revenue: 'danger',
    orders: 'warning',
    customers: 'primary',
    satisfaction: 'success',
    inventory: 'info',
    staff: 'warning',
    kitchen: 'danger',
    operational: 'primary'
  }
  return colors[type] || 'info'
}

const getTypeText = (type: string) => {
  const texts = {
    revenue: '收入',
    orders: '订单',
    customers: '客户',
    satisfaction: '满意度',
    inventory: '库存',
    staff: '员工',
    kitchen: '厨房',
    operational: '运营'
  }
  return texts[type] || type
}

const formatValue = (value: number, unit: string) => {
  if (unit === '元') {
    return `¥${value.toLocaleString()}`
  } else if (unit === '%') {
    return `${value.toFixed(1)}%`
  } else if (unit === '分') {
    return `${value.toFixed(1)}分`
  } else {
    return `${value.toLocaleString()}${unit}`
  }
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

const getDeviationClass = (deviation: number) => {
  if (deviation > 0) {
    return 'text-success'
  } else if (deviation < 0) {
    return 'text-danger'
  } else {
    return ''
  }
}

// 初始化预警趋势图
const initAlertTrendsChart = () => {
  nextTick(() => {
    if (alertTrendsChart.value) {
      const chart = echarts.init(alertTrendsChart.value)
      const option = {
        title: { text: '预警趋势' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['严重预警', '警告预警', '提示预警'] },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '严重预警',
            type: 'line',
            data: [2, 1, 3, 2, 4, 1, 3],
            itemStyle: { color: '#F56C6C' }
          },
          {
            name: '警告预警',
            type: 'line',
            data: [5, 6, 4, 7, 5, 8, 6],
            itemStyle: { color: '#E6A23C' }
          },
          {
            name: '提示预警',
            type: 'line',
            data: [10, 12, 8, 11, 9, 13, 10],
            itemStyle: { color: '#909399' }
          }
        ]
      }
      chart.setOption(option)
    }
  })
}

// 生命周期
onMounted(() => {
  initAlertTrendsChart()
  totalAlerts.value = alerts.value.length
})

onUnmounted(() => {
  if (alertTrendsChart.value) {
    const chart = echarts.getInstanceByDom(alertTrendsChart.value)
    if (chart) {
      chart.dispose()
    }
  }
})
</script>

<style lang="scss" scoped>
.alert-system {
  padding: 20px;

  .alert-overview {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-metric {
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

      &.critical {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
        color: white;
      }

      &.warning {
        background: linear-gradient(135deg, #feca57 0%, #ff9f43 100%);
        color: white;
      }

      &.info {
        background: linear-gradient(135deg, #54a0ff 0%, #2e86de 100%);
        color: white;
      }

      &.resolved {
        background: linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%);
        color: white;
      }

      .metric-icon {
        margin-right: 15px;
        font-size: 32px;
      }

      .metric-info {
        .metric-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .metric-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }

  .alert-list {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .alert-trends {
    .chart-container {
      height: 400px;
    }
  }

  .alert-detail {
    .related-data {
      margin-top: 10px;
    }

    .detail-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.text-success {
  color: #67C23A;
}

.text-danger {
  color: #F56C6C;
}
</style>
