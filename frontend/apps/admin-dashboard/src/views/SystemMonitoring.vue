<template>
  <div class="system-monitoring">
    <!-- 系统概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6" v-for="card in overviewCards" :key="card.key">
          <el-card class="overview-card" :class="card.status">
            <div class="card-content">
              <div class="card-icon">
                <el-icon :size="24"><component :is="card.icon" /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">{{ card.title }}</div>
                <div class="card-value">{{ card.value }}</div>
                <div class="card-trend" v-if="card.trend">
                  <el-icon :size="12" :color="card.trendColor">
                    <component :is="card.trendIcon" />
                  </el-icon>
                  <span>{{ card.trend }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="monitoring-tabs">
      <!-- 系统指标 -->
      <el-tab-pane label="系统指标" name="metrics">
        <div class="metrics-section">
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-select
                v-model="metricFilters.categories"
                placeholder="选择分类"
                multiple
                collapse-tags
                style="width: 200px;"
                @change="loadMetrics"
              >
                <el-option
                  v-for="category in metricCategories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                />
              </el-select>

              <el-select
                v-model="metricFilters.timeRange"
                placeholder="时间范围"
                style="width: 150px; margin-left: 10px;"
                @change="loadMetrics"
              >
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
              </el-select>
            </div>

            <div class="toolbar-right">
              <el-button @click="refreshMetrics">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="primary" @click="exportMetrics">
                导出数据
              </el-button>
            </div>
          </div>

          <!-- 指标网格 -->
          <div class="metrics-grid">
            <el-row :gutter="20">
              <el-col :span="12" v-for="metric in systemMetrics" :key="metric.id">
                <el-card class="metric-card">
                  <div class="metric-header">
                    <div class="metric-title">{{ metric.name }}</div>
                    <el-tag :type="getMetricStatusType(metric.status)" size="small">
                      {{ getMetricStatusLabel(metric.status) }}
                    </el-tag>
                  </div>
                  <div class="metric-value">
                    <span class="value">{{ metric.value }}</span>
                    <span class="unit">{{ metric.unit }}</span>
                  </div>
                  <div class="metric-chart">
                    <MetricChart :metric="metric" />
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>

      <!-- 系统告警 -->
      <el-tab-pane label="系统告警" name="alerts">
        <div class="alerts-section">
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model="alertFilters.search"
                placeholder="搜索告警..."
                clearable
                style="width: 300px;"
                @input="handleAlertSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="alertFilters.severity"
                placeholder="严重程度"
                multiple
                collapse-tags
                style="width: 200px; margin-left: 10px;"
                @change="loadAlerts"
              >
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="严重" value="critical" />
              </el-select>

              <el-select
                v-model="alertFilters.status"
                placeholder="状态"
                multiple
                style="width: 150px; margin-left: 10px;"
                @change="loadAlerts"
              >
                <el-option label="活跃" value="active" />
                <el-option label="已确认" value="acknowledged" />
                <el-option label="已解决" value="resolved" />
              </el-select>
            </div>

            <div class="toolbar-right">
              <el-button type="primary" @click="showCreateRuleDialog = true">
                创建规则
              </el-button>
              <el-button @click="refreshAlerts">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <!-- 告警列表 -->
          <div class="alerts-list">
            <el-table
              :data="alerts"
              :loading="loading"
              stripe
              @selection-change="handleAlertSelection"
            >
              <el-table-column type="selection" width="55" />

              <el-table-column label="标题" min-width="200">
                <template #default="{ row }">
                  <div class="alert-title">
                    <el-icon :size="16" :color="getAlertSeverityColor(row.severity)">
                      <component :is="getAlertSeverityIcon(row.severity)" />
                    </el-icon>
                    <span>{{ row.title }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="严重程度" width="100">
                <template #default="{ row }">
                  <el-tag :type="getAlertSeverityTagType(row.severity)" size="small">
                    {{ getAlertSeverityLabel(row.severity) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getAlertStatusTagType(row.status)" size="small">
                    {{ getAlertStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="来源" prop="source" width="120" />

              <el-table-column label="时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.timestamp) }}
                </template>
              </el-table-column>

              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'active'"
                    type="primary"
                    size="small"
                    text
                    @click="acknowledgeAlert(row)"
                  >
                    确认
                  </el-button>

                  <el-button
                    v-if="row.status !== 'resolved'"
                    type="success"
                    size="small"
                    text
                    @click="resolveAlert(row)"
                  >
                    解决
                  </el-button>

                  <el-button
                    type="info"
                    size="small"
                    text
                    @click="viewAlertDetails(row)"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="alertPagination.page"
                v-model:page-size="alertPagination.pageSize"
                :total="alertPagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleAlertSizeChange"
                @current-change="handleAlertPageChange"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 系统日志 -->
      <el-tab-pane label="系统日志" name="logs">
        <div class="logs-section">
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model="logFilters.search"
                placeholder="搜索日志..."
                clearable
                style="width: 300px;"
                @input="handleLogSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="logFilters.level"
                placeholder="日志级别"
                multiple
                collapse-tags
                style="width: 150px; margin-left: 10px;"
                @change="loadLogs"
              >
                <el-option label="Debug" value="debug" />
                <el-option label="Info" value="info" />
                <el-option label="Warn" value="warn" />
                <el-option label="Error" value="error" />
                <el-option label="Fatal" value="fatal" />
              </el-select>

              <el-date-picker
                v-model="logDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="margin-left: 10px;"
                @change="handleLogDateChange"
              />
            </div>

            <div class="toolbar-right">
              <el-button @click="refreshLogs">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="primary" @click="exportLogs">
                导出日志
              </el-button>
            </div>
          </div>

          <!-- 日志列表 -->
          <div class="logs-list">
            <el-table
              :data="logs"
              :loading="loading"
              stripe
              @row-click="viewLogDetails"
            >
              <el-table-column label="时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.timestamp) }}
                </template>
              </el-table-column>

              <el-table-column label="级别" width="80">
                <template #default="{ row }">
                  <el-tag :type="getLogLevelTagType(row.level)" size="small">
                    {{ row.level.toUpperCase() }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="分类" prop="category" width="120" />

              <el-table-column label="来源" prop="source" width="150" />

              <el-table-column label="消息" min-width="300" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="log-message" :class="`log-${row.level}`">
                    {{ row.message }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="info"
                    size="small"
                    text
                    @click.stop="viewLogDetails(row)"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="logPagination.page"
                v-model:page-size="logPagination.pageSize"
                :total="logPagination.total"
                :page-sizes="[20, 50, 100, 200]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleLogSizeChange"
                @current-change="handleLogPageChange"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 性能分析 -->
      <el-tab-pane label="性能分析" name="performance">
        <div class="performance-section">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-select
                v-model="performanceFilters.period"
                placeholder="分析周期"
                style="width: 150px;"
                @change="loadPerformanceReport"
              >
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
              </el-select>
            </div>

            <div class="toolbar-right">
              <el-button @click="refreshPerformanceReport">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="primary" @click="exportPerformanceReport">
                导出报告
              </el-button>
            </div>
          </div>

          <PerformanceReportComponent
            v-if="performanceReport"
            :report="performanceReport"
          />
        </div>
      </el-tab-pane>

      <!-- 系统健康 -->
      <el-tab-pane label="系统健康" name="health">
        <div class="health-section">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-button @click="checkSystemHealth">
                <el-icon><Refresh /></el-icon>
                立即检查
              </el-button>
            </div>
          </div>

          <SystemHealthCheck
            v-if="systemHealth"
            :health="systemHealth"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 告警详情对话框 -->
    <el-dialog
      v-model="showAlertDetail"
      title="告警详情"
      width="600px"
    >
      <AlertDetail
        v-if="selectedAlert"
        :alert="selectedAlert"
        @acknowledged="handleAlertAcknowledged"
        @resolved="handleAlertResolved"
      />
    </el-dialog>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="showLogDetail"
      title="日志详情"
      width="800px"
    >
      <LogDetail
        v-if="selectedLog"
        :log="selectedLog"
      />
    </el-dialog>

    <!-- 创建告警规则对话框 -->
    <el-dialog
      v-model="showCreateRuleDialog"
      title="创建告警规则"
      width="600px"
    >
      <AlertRuleForm
        @created="handleRuleCreated"
        @cancel="showCreateRuleDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Search,
  Monitor,
  Cpu,
  MemoryCard,
  HardDrive,
  Connection,
  Warning,
  InfoFilled,
  SuccessFilled,
  CircleCloseFilled,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue'
import {
  systemMonitorAPI,
  type SystemMetric,
  type SystemAlert,
  type SystemLog,
  type SystemHealth,
  type PerformanceReport,
  AlertSeverity,
  LogLevel
} from '@/api/system-monitor'
import MetricChart from '@/components/Charts/MetricChart.vue'
import AlertDetail from '@/components/System/AlertDetail.vue'
import LogDetail from '@/components/System/LogDetail.vue'
import AlertRuleForm from '@/components/System/AlertRuleForm.vue'
import PerformanceReportComponent from '@/components/System/PerformanceReport.vue'
import SystemHealthCheck from '@/components/System/SystemHealthCheck.vue'

// 响应式数据
const activeTab = ref('metrics')
const loading = ref(false)
const wsConnection = ref<WebSocket | null>(null)

const systemMetrics = ref<SystemMetric[]>([])
const alerts = ref<SystemAlert[]>([])
const logs = ref<SystemLog[]>([])
const systemHealth = ref<SystemHealth | null>(null)
const performanceReport = ref<PerformanceReport | null>(null)

// 过滤器
const metricFilters = reactive({
  categories: [] as string[],
  timeRange: '24h'
})

const alertFilters = reactive({
  search: '',
  severity: [] as string[],
  status: [] as string[]
})

const logFilters = reactive({
  search: '',
  level: [] as string[],
  startTime: '',
  endTime: ''
})

const performanceFilters = reactive({
  period: '24h'
})

// 分页
const alertPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const logPagination = reactive({
  page: 1,
  pageSize: 50,
  total: 0
})

// 对话框状态
const showAlertDetail = ref(false)
const showLogDetail = ref(false)
const showCreateRuleDialog = ref(false)
const selectedAlert = ref<SystemAlert | null>(null)
const selectedLog = ref<SystemLog | null>(null)
const logDateRange = ref<[Date, Date] | null>(null)

// 概览卡片
const overviewCards = computed(() => [
  {
    key: 'status',
    title: '系统状态',
    value: '正常',
    status: 'healthy',
    icon: Monitor,
    trend: '99.9%',
    trendIcon: ArrowUp,
    trendColor: '#67c23a'
  },
  {
    key: 'uptime',
    title: '运行时间',
    value: '15天 8小时',
    status: 'healthy',
    icon: SuccessFilled,
    trend: null,
    trendIcon: null,
    trendColor: null
  },
  {
    key: 'responseTime',
    title: '响应时间',
    value: '245ms',
    status: 'normal',
    icon: Connection,
    trend: '-12%',
    trendIcon: ArrowDown,
    trendColor: '#67c23a'
  },
  {
    key: 'activeUsers',
    title: '在线用户',
    value: '1,284',
    status: 'normal',
    icon: InfoFilled,
    trend: '+5.2%',
    trendIcon: ArrowUp,
    trendColor: '#409eff'
  }
])

// 指标分类
const metricCategories = [
  { value: 'cpu', label: 'CPU' },
  { value: 'memory', label: '内存' },
  { value: 'disk', label: '磁盘' },
  { value: 'network', label: '网络' },
  { value: 'database', label: '数据库' },
  { value: 'application', label: '应用' }
]

// 方法
const loadMetrics = async () => {
  try {
    loading.value = true
    const response = await systemMonitorAPI.getSystemMetrics({
      categories: metricFilters.categories as any,
      timeRange: metricFilters.timeRange
    })
    if (response.success) {
      systemMetrics.value = response.data
    }
  } catch (error) {
    console.error('Load metrics failed:', error)
    ElMessage.error('加载系统指标失败')
  } finally {
    loading.value = false
  }
}

const loadAlerts = async () => {
  try {
    loading.value = true
    const response = await systemMonitorAPI.getSystemAlerts({
      page: alertPagination.page,
      limit: alertPagination.pageSize,
      severity: alertFilters.severity as AlertSeverity[],
      status: alertFilters.status,
      search: alertFilters.search || undefined
    })
    if (response.success) {
      alerts.value = response.data.items
      alertPagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Load alerts failed:', error)
    ElMessage.error('加载系统告警失败')
  } finally {
    loading.value = false
  }
}

const loadLogs = async () => {
  try {
    loading.value = true
    const response = await systemMonitorAPI.getSystemLogs({
      page: logPagination.page,
      limit: logPagination.pageSize,
      level: logFilters.level as LogLevel[],
      search: logFilters.search || undefined,
      startTime: logFilters.startTime,
      endTime: logFilters.endTime
    })
    if (response.success) {
      logs.value = response.data.items
      logPagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Load logs failed:', error)
    ElMessage.error('加载系统日志失败')
  } finally {
    loading.value = false
  }
}

const loadSystemHealth = async () => {
  try {
    const response = await systemMonitorAPI.getSystemHealth()
    if (response.success) {
      systemHealth.value = response.data
    }
  } catch (error) {
    console.error('Load system health failed:', error)
  }
}

const loadPerformanceReport = async () => {
  try {
    loading.value = true
    const response = await systemMonitorAPI.getPerformanceReport({
      period: performanceFilters.period
    })
    if (response.success) {
      performanceReport.value = response.data
    }
  } catch (error) {
    console.error('Load performance report failed:', error)
    ElMessage.error('加载性能报告失败')
  } finally {
    loading.value = false
  }
}

const refreshMetrics = () => {
  loadMetrics()
}

const refreshAlerts = () => {
  loadAlerts()
}

const refreshLogs = () => {
  loadLogs()
}

const refreshPerformanceReport = () => {
  loadPerformanceReport()
}

const checkSystemHealth = () => {
  loadSystemHealth()
}

// 告警操作
const acknowledgeAlert = async (alert: SystemAlert) => {
  try {
    await systemMonitorAPI.acknowledgeAlert(alert.id)
    ElMessage.success('告警已确认')
    loadAlerts()
  } catch (error) {
    ElMessage.error('确认告警失败')
  }
}

const resolveAlert = async (alert: SystemAlert) => {
  try {
    await systemMonitorAPI.resolveAlert(alert.id)
    ElMessage.success('告警已解决')
    loadAlerts()
  } catch (error) {
    ElMessage.error('解决告警失败')
  }
}

const viewAlertDetails = (alert: SystemAlert) => {
  selectedAlert.value = alert
  showAlertDetail.value = true
}

const viewLogDetails = (log: SystemLog) => {
  selectedLog.value = log
  showLogDetail.value = true
}

// 搜索和过滤
const handleAlertSearch = () => {
  alertPagination.page = 1
  loadAlerts()
}

const handleLogSearch = () => {
  logPagination.page = 1
  loadLogs()
}

const handleLogDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    logFilters.startTime = dates[0].toISOString()
    logFilters.endTime = dates[1].toISOString()
  } else {
    logFilters.startTime = ''
    logFilters.endTime = ''
  }
  logPagination.page = 1
  loadLogs()
}

// 分页处理
const handleAlertSelection = (selection: SystemAlert[]) => {
  // 处理告警选择
}

const handleAlertSizeChange = (size: number) => {
  alertPagination.pageSize = size
  alertPagination.page = 1
  loadAlerts()
}

const handleAlertPageChange = (page: number) => {
  alertPagination.page = page
  loadAlerts()
}

const handleLogSizeChange = (size: number) => {
  logPagination.pageSize = size
  logPagination.page = 1
  loadLogs()
}

const handleLogPageChange = (page: number) => {
  logPagination.page = page
  loadLogs()
}

// 事件处理
const handleAlertAcknowledged = () => {
  showAlertDetail.value = false
  loadAlerts()
}

const handleAlertResolved = () => {
  showAlertDetail.value = false
  loadAlerts()
}

const handleRuleCreated = () => {
  showCreateRuleDialog.value = false
  loadAlerts()
}

// 导出功能
const exportMetrics = () => {
  // 导出指标数据
  ElMessage.info('导出功能开发中...')
}

const exportLogs = () => {
  // 导出日志
  ElMessage.info('导出功能开发中...')
}

const exportPerformanceReport = () => {
  // 导出性能报告
  ElMessage.info('导出功能开发中...')
}

// WebSocket实时更新
const connectWebSocket = () => {
  const ws = systemMonitorAPI.connectWebSocket()
  ws.onopen = () => {
    console.log('System monitoring WebSocket connected')
  }
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    } catch (error) {
      console.error('WebSocket message parse error:', error)
    }
  }
  ws.onclose = () => {
    console.log('System monitoring WebSocket disconnected')
    // 5秒后重连
    setTimeout(connectWebSocket, 5000)
  }
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

const handleWebSocketMessage = async (data: any) => {
  switch (data.type) {
    case 'metric_update':
      // 更新指标
      if (activeTab.value === 'metrics') {
        loadMetrics()
      }
      break
    case 'alert_created':
      // 新告警
      ElMessage.warning(`新告警: ${data.data.title}`)
      if (activeTab.value === 'alerts') {
        loadAlerts()
      }
      break
    case 'system_status_change':
      // 系统状态变化
      ElMessage.info(`系统状态: ${data.data.status}`)
      break
  }
}

// 工具函数
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getMetricStatusType = (status: string) => {
  const typeMap = {
    normal: 'success',
    warning: 'warning',
    critical: 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getMetricStatusLabel = (status: string) => {
  const labelMap = {
    normal: '正常',
    warning: '警告',
    critical: '严重'
  }
  return labelMap[status as keyof typeof labelMap] || '未知'
}

const getAlertSeverityColor = (severity: string) => {
  const colorMap = {
    low: '#909399',
    medium: '#e6a23c',
    high: '#f56c6c',
    critical: '#ff4757'
  }
  return colorMap[severity as keyof typeof colorMap] || '#909399'
}

const getAlertSeverityIcon = (severity: string) => {
  const iconMap = {
    low: InfoFilled,
    medium: Warning,
    high: CircleCloseFilled,
    critical: CircleCloseFilled
  }
  return iconMap[severity as keyof typeof iconMap] || InfoFilled
}

const getAlertSeverityTagType = (severity: string) => {
  const typeMap = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return typeMap[severity as keyof typeof typeMap] || 'info'
}

const getAlertSeverityLabel = (severity: string) => {
  const labelMap = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return labelMap[severity as keyof typeof labelMap] || '未知'
}

const getAlertStatusTagType = (status: string) => {
  const typeMap = {
    active: 'danger',
    acknowledged: 'warning',
    resolved: 'success'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getAlertStatusLabel = (status: string) => {
  const labelMap = {
    active: '活跃',
    acknowledged: '已确认',
    resolved: '已解决'
  }
  return labelMap[status as keyof typeof labelMap] || '未知'
}

const getLogLevelTagType = (level: string) => {
  const typeMap = {
    debug: 'info',
    info: 'info',
    warn: 'warning',
    error: 'danger',
    fatal: 'danger'
  }
  return typeMap[level as keyof typeof typeMap] || 'info'
}

// 生命周期
onMounted(() => {
  // 加载初始数据
  loadMetrics()
  loadAlerts()
  loadSystemHealth()
  loadPerformanceReport()

  // 建立WebSocket连接
  connectWebSocket()
})

onUnmounted(() => {
  // 断开WebSocket连接
  systemMonitorAPI.disconnectWebSocket()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.system-monitoring {
  .overview-section {
    margin-bottom: $spacing-6;

    .overview-card {
      .card-content {
        display: flex;
        align-items: center;
        gap: $spacing-4;

        .card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: $border-radius-lg;
          background: $primary-light;
          color: $primary-color;
        }

        .card-info {
          flex: 1;

          .card-title {
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
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }
      }

      &.healthy .card-icon {
        background: $success-light;
        color: $success-color;
      }

      &.warning .card-icon {
        background: $warning-light;
        color: $warning-color;
      }

      &.danger .card-icon {
        background: $danger-light;
        color: $danger-color;
      }
    }
  }

  .monitoring-tabs {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0;
      background: $gray-50;
    }

    :deep(.el-tabs__content) {
      padding: $spacing-6;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;
    padding: $spacing-4;
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: $spacing-2;
    }
  }

  .metrics-section {
    .metrics-grid {
      .metric-card {
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $spacing-4;

          .metric-title {
            font-weight: $font-weight-medium;
            color: $text-primary;
          }
        }

        .metric-value {
          display: flex;
          align-items: baseline;
          gap: $spacing-1;
          margin-bottom: $spacing-4;

          .value {
            font-size: $font-size-2xl;
            font-weight: $font-weight-bold;
            color: $text-primary;
          }

          .unit {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .metric-chart {
          height: 120px;
        }
      }
    }
  }

  .alerts-section,
  .logs-section {
    .alerts-list,
    .logs-list {
      background: $white;
      border-radius: $border-radius-base;
      box-shadow: $shadow-sm;
      overflow: hidden;

      .alert-title {
        display: flex;
        align-items: center;
        gap: $spacing-2;
      }

      .log-message {
        font-family: $font-family-mono;
        font-size: $font-size-sm;

        &.log-error,
        &.log-fatal {
          color: $danger-color;
        }

        &.log-warn {
          color: $warning-color;
        }

        &.log-debug {
          color: $text-placeholder;
        }
      }

      .pagination {
        padding: $spacing-4;
        text-align: right;
        border-top: 1px solid $border-primary;
      }
    }
  }

  .performance-section,
  .health-section {
    .toolbar {
      margin-bottom: $spacing-6;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .system-monitoring {
    .overview-section {
      .el-row {
        .el-col {
          margin-bottom: $spacing-4;
        }
      }
    }

    .toolbar {
      flex-direction: column;
      gap: $spacing-4;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }
    }

    .monitoring-tabs {
      :deep(.el-tabs__content) {
        padding: $spacing-4;
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .system-monitoring {
    .overview-card,
    .toolbar,
    .alerts-list,
    .logs-list {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }

    .alert-title {
      color: $dark-text-primary;
    }
  }
}
</style>