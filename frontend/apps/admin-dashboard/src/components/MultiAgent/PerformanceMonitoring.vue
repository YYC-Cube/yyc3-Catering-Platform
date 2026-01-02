<template>
  <div class="performance-monitoring">
    <!-- 性能概览 -->
    <div class="performance-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon cpu">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ systemMetrics.cpu }}%</div>
                <div class="metric-label">CPU使用率</div>
                <div class="metric-trend" :class="getCpuTrend()">
                  <el-icon><CaretTop v-if="systemMetrics.cpu > 70" /><CaretBottom v-else /></el-icon>
                  {{ getCpuStatus() }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon memory">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ systemMetrics.memory }}%</div>
                <div class="metric-label">内存使用率</div>
                <div class="metric-trend" :class="getMemoryTrend()">
                  <el-icon><CaretTop v-if="systemMetrics.memory > 80" /><CaretBottom v-else /></el-icon>
                  {{ getMemoryStatus() }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon response">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ systemMetrics.responseTime }}ms</div>
                <div class="metric-label">平均响应时间</div>
                <div class="metric-trend" :class="getResponseTrend()">
                  <el-icon><CaretTop v-if="systemMetrics.responseTime > 1000" /><CaretBottom v-else /></el-icon>
                  {{ getResponseStatus() }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon throughput">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ systemMetrics.throughput }}</div>
                <div class="metric-label">吞吐量</div>
                <div class="metric-trend positive">
                  <el-icon><CaretTop /></el-icon>
                  正常
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 实时监控 -->
    <el-row :gutter="20">
      <!-- 性能趋势图 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <div class="chart-header">
            <h3>性能趋势图</h3>
            <div class="chart-controls">
              <el-radio-group v-model="chartTimeRange" size="small" @change="updateChart">
                <el-radio-button label="1h">1小时</el-radio-button>
                <el-radio-button label="6h">6小时</el-radio-button>
                <el-radio-button label="24h">24小时</el-radio-button>
                <el-radio-button label="7d">7天</el-radio-button>
              </el-radio-group>
              <el-button size="small" @click="refreshChart">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>
          <div ref="performanceChart" class="performance-chart"></div>
        </el-card>
      </el-col>

      <!-- 智能体状态分布 -->
      <el-col :span="8">
        <el-card class="chart-card">
          <div class="chart-header">
            <h3>智能体状态分布</h3>
          </div>
          <div ref="agentStatusChart" class="agent-status-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细监控 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 智能体性能排行 -->
      <el-col :span="12">
        <el-card class="ranking-card">
          <div class="ranking-header">
            <h3>智能体性能排行</h3>
            <el-select v-model="rankingMetric" size="small" @change="updateRanking">
              <el-option label="成功率" value="successRate" />
              <el-option label="响应时间" value="responseTime" />
              <el-option label="任务完成数" value="tasksCompleted" />
              <el-option label="可靠性" value="reliability" />
            </el-select>
          </div>
          <div class="ranking-list">
            <div
              v-for="(agent, index) in agentRanking"
              :key="agent.id"
              class="ranking-item"
              :class="{ 'top-performer': index < 3 }"
            >
              <div class="ranking-position">
                <span class="position-number">{{ index + 1 }}</span>
                <el-medal
                  v-if="index === 0"
                  type="gold"
                  class="medal"
                />
                <el-medal
                  v-if="index === 1"
                  type="silver"
                  class="medal"
                />
                <el-medal
                  v-if="index === 2"
                  type="bronze"
                  class="medal"
                />
              </div>
              <div class="ranking-info">
                <div class="agent-name">{{ agent.name }}</div>
                <div class="agent-type">{{ agent.type }}</div>
              </div>
              <div class="ranking-value">
                <div class="value-main">{{ getRankingValue(agent) }}</div>
                <div class="value-unit">{{ getRankingUnit(agent) }}</div>
              </div>
              <div class="ranking-trend">
                <el-progress
                  :percentage="getRankingProgress(agent)"
                  :show-text="false"
                  :stroke-width="6"
                  :color="getRankingColor(index)"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 系统告警 -->
      <el-col :span="12">
        <el-card class="alerts-card">
          <div class="alerts-header">
            <h3>系统告警</h3>
            <div class="alerts-controls">
              <el-badge :value="alertCount" :max="99" class="alert-badge">
                <el-button size="small" @click="showAlertSettings = true">
                  <el-icon><Setting /></el-icon>
                </el-button>
              </el-badge>
              <el-button size="small" @click="clearAlerts">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="alerts-list">
            <div
              v-for="alert in recentAlerts"
              :key="alert.id"
              class="alert-item"
              :class="alert.severity"
            >
              <div class="alert-icon">
                <el-icon v-if="alert.severity === 'critical'"><WarningFilled /></el-icon>
                <el-icon v-else-if="alert.severity === 'high'"><Warning /></el-icon>
                <el-icon v-else><InfoFilled /></el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-description">{{ alert.description }}</div>
                <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
              </div>
              <div class="alert-actions">
                <el-button size="small" type="text" @click="handleAlert(alert)">
                  处理
                </el-button>
                <el-button size="small" type="text" @click="dismissAlert(alert)">
                  忽略
                </el-button>
              </div>
            </div>

            <div v-if="recentAlerts.length === 0" class="no-alerts">
              <el-icon><SuccessFilled /></el-icon>
              <p>系统运行正常，暂无告警</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务执行监控 -->
    <el-card class="task-monitoring-card" style="margin-top: 20px;">
      <div class="task-header">
        <h3>任务执行监控</h3>
        <div class="task-controls">
          <el-button size="small" @click="exportTaskData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
      <el-table :data="taskMonitoringData" stripe>
        <el-table-column prop="taskId" label="任务ID" width="120" />
        <el-table-column prop="title" label="任务名称" min-width="200" />
        <el-table-column prop="assignedAgent" label="执行智能体" width="150" />
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :show-text="false" />
            <span class="progress-text">{{ row.progress }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getTaskStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="执行时间" width="120" />
        <el-table-column prop="estimatedTime" label="预计完成" width="150" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="monitorTask(row)">
              监控
            </el-button>
            <el-button size="small" type="danger" link @click="cancelTask(row)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 告警设置对话框 -->
    <el-dialog
      v-model="showAlertSettings"
      title="告警设置"
      width="60%"
    >
      <AlertSettings
        v-if="showAlertSettings"
        @save="saveAlertSettings"
        @cancel="showAlertSettings = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Cpu, Monitor, Timer, TrendCharts, CaretTop, CaretBottom,
  Refresh, Setting, Delete, Download, WarningFilled, Warning,
  InfoFilled, SuccessFilled
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { multiAgentAPI } from '@/api/multi-agent'
import AlertSettings from './AlertSettings.vue'

// 响应式数据
const performanceChart = ref<HTMLElement>()
const agentStatusChart = ref<HTMLElement>()
const chartTimeRange = ref('1h')
const rankingMetric = ref('successRate')
const showAlertSettings = ref(false)

// 系统指标
const systemMetrics = ref({
  cpu: 45,
  memory: 62,
  responseTime: 850,
  throughput: 1250
})

// 智能体排行
const agentRanking = ref([
  { id: '1', name: '厨房助手AI', type: 'AI智能体', successRate: 95, responseTime: 680, tasksCompleted: 142, reliability: 98 },
  { id: '2', name: '烹饪机器人A', type: '机器人智能体', successRate: 92, responseTime: 720, tasksCompleted: 128, reliability: 96 },
  { id: '3', name: '调度虚拟体', type: '虚拟智能体', successRate: 89, responseTime: 450, tasksCompleted: 156, reliability: 94 },
  { id: '4', name: '厨师长张', type: '人类智能体', successRate: 88, responseTime: 1200, tasksCompleted: 98, reliability: 92 },
  { id: '5', name: '温度传感器A', type: '环境智能体', successRate: 85, responseTime: 320, tasksCompleted: 203, reliability: 90 }
])

// 告警数据
const recentAlerts = ref([
  {
    id: '1',
    severity: 'high',
    title: 'CPU使用率过高',
    description: '服务器CPU使用率达到85%，建议检查负载',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    severity: 'medium',
    title: '响应时间增加',
    description: '平均响应时间超过1000ms，可能存在性能问题',
    timestamp: new Date(Date.now() - 600000)
  }
])

// 任务监控数据
const taskMonitoringData = ref([
  {
    taskId: 'TASK-001',
    title: '食材预处理任务',
    assignedAgent: '厨房助手AI',
    progress: 75,
    status: '进行中',
    duration: '12分钟',
    estimatedTime: '预计5分钟后完成'
  },
  {
    taskId: 'TASK-002',
    title: '餐具清洁任务',
    assignedAgent: '烹饪机器人A',
    progress: 45,
    status: '进行中',
    duration: '8分钟',
    estimatedTime: '预计10分钟后完成'
  }
])

const alertCount = computed(() => recentAlerts.value.length)

// 图表实例
let performanceChartInstance: echarts.ECharts | null = null
let agentStatusChartInstance: echarts.ECharts | null = null
let refreshInterval: number | null = null

// 生命周期
onMounted(() => {
  nextTick(() => {
    initCharts()
    startRealTimeMonitoring()
  })
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (performanceChartInstance) {
    performanceChartInstance.dispose()
  }
  if (agentStatusChartInstance) {
    agentStatusChartInstance.dispose()
  }
})

// 方法
const initCharts = () => {
  initPerformanceChart()
  initAgentStatusChart()
}

const initPerformanceChart = () => {
  if (!performanceChart.value) return

  performanceChartInstance = echarts.init(performanceChart.value)

  const option = {
    title: {
      text: '系统性能指标',
      textStyle: { fontSize: 14, color: '#303133' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['CPU使用率', '内存使用率', '响应时间'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      splitLine: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '使用率(%)',
        position: 'left',
        max: 100
      },
      {
        type: 'value',
        name: '响应时间(ms)',
        position: 'right',
        max: 2000
      }
    ],
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        data: generateMockData('cpu'),
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '内存使用率',
        type: 'line',
        data: generateMockData('memory'),
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '响应时间',
        type: 'line',
        yAxisIndex: 1,
        data: generateMockData('response'),
        smooth: true,
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }

  performanceChartInstance.setOption(option)
}

const initAgentStatusChart = () => {
  if (!agentStatusChart.value) return

  agentStatusChartInstance = echarts.init(agentStatusChart.value)

  const option = {
    title: {
      text: '智能体状态分布',
      textStyle: { fontSize: 14, color: '#303133' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      bottom: 0
    },
    series: [
      {
        name: '智能体状态',
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
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 38, name: '活跃', itemStyle: { color: '#67c23a' } },
          { value: 12, name: '空闲', itemStyle: { color: '#909399' } },
          { value: 8, name: '忙碌', itemStyle: { color: '#e6a23c' } },
          { value: 3, name: '离线', itemStyle: { color: '#f56c6c' } },
          { value: 1, name: '错误', itemStyle: { color: '#ff4757' } }
        ]
      }
    ]
  }

  agentStatusChartInstance.setOption(option)
}

const generateMockData = (type: string) => {
  const now = new Date()
  const data = []
  const hours = chartTimeRange.value === '1h' ? 1 : chartTimeRange.value === '6h' ? 6 : chartTimeRange.value === '24h' ? 24 : 168
  const points = hours * 12 // 每5分钟一个数据点

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000)
    let value

    switch (type) {
      case 'cpu':
        value = 40 + Math.random() * 30 + Math.sin(i * 0.1) * 10
        break
      case 'memory':
        value = 50 + Math.random() * 25 + Math.cos(i * 0.15) * 8
        break
      case 'response':
        value = 600 + Math.random() * 400 + Math.sin(i * 0.08) * 150
        break
      default:
        value = Math.random() * 100
    }

    data.push([time, Math.round(value)])
  }

  return data
}

const startRealTimeMonitoring = () => {
  refreshInterval = setInterval(() => {
    updateSystemMetrics()
    updateChartData()
  }, 5000) // 每5秒更新一次
}

const updateSystemMetrics = () => {
  // 模拟实时数据更新
  systemMetrics.value = {
    cpu: Math.round(40 + Math.random() * 30),
    memory: Math.round(50 + Math.random() * 25),
    responseTime: Math.round(600 + Math.random() * 400),
    throughput: Math.round(1000 + Math.random() * 500)
  }
}

const updateChartData = () => {
  if (performanceChartInstance) {
    const option = performanceChartInstance.getOption()
    if (option && option.series) {
      // 移除最旧的数据点，添加新的数据点
      option.series.forEach((series: any) => {
        if (series.data && series.data.length > 0) {
          series.data.shift()
          const now = new Date()
          let value

          if (series.name === 'CPU使用率') {
            value = 40 + Math.random() * 30
          } else if (series.name === '内存使用率') {
            value = 50 + Math.random() * 25
          } else if (series.name === '响应时间') {
            value = 600 + Math.random() * 400
          }

          series.data.push([now, Math.round(value)])
        }
      })
      performanceChartInstance.setOption(option)
    }
  }
}

const refreshChart = () => {
  if (performanceChartInstance) {
    const option = {
      series: [
        { data: generateMockData('cpu') },
        { data: generateMockData('memory') },
        { data: generateMockData('response') }
      ]
    }
    performanceChartInstance.setOption(option)
  }
}

const updateChart = () => {
  refreshChart()
}

const updateRanking = () => {
  // 根据选择的指标重新排序
  agentRanking.value.sort((a, b) => {
    const aValue = (a as any)[rankingMetric.value]
    const bValue = (b as any)[rankingMetric.value]

    if (rankingMetric.value === 'responseTime') {
      return aValue - bValue // 响应时间越小越好
    }
    return bValue - aValue // 其他指标越大越好
  })
}

const exportTaskData = () => {
  ElMessage.info('导出功能开发中')
}

const monitorTask = (task: any) => {
  ElMessage.info(`监控任务 ${task.taskId}`)
}

const cancelTask = (task: any) => {
  ElMessage.info(`取消任务 ${task.taskId}`)
}

const handleAlert = (alert: any) => {
  ElMessage.info(`处理告警: ${alert.title}`)
}

const dismissAlert = (alert: any) => {
  const index = recentAlerts.value.findIndex(a => a.id === alert.id)
  if (index > -1) {
    recentAlerts.value.splice(index, 1)
  }
}

const clearAlerts = () => {
  recentAlerts.value = []
  ElMessage.success('告警已清空')
}

const saveAlertSettings = () => {
  showAlertSettings.value = false
  ElMessage.success('告警设置已保存')
}

// 辅助方法
const getCpuTrend = () => {
  return systemMetrics.value.cpu > 70 ? 'negative' : 'positive'
}

const getCpuStatus = () => {
  return systemMetrics.value.cpu > 70 ? '过高' : '正常'
}

const getMemoryTrend = () => {
  return systemMetrics.value.memory > 80 ? 'negative' : 'positive'
}

const getMemoryStatus = () => {
  return systemMetrics.value.memory > 80 ? '过高' : '正常'
}

const getResponseTrend = () => {
  return systemMetrics.value.responseTime > 1000 ? 'negative' : 'positive'
}

const getResponseStatus = () => {
  return systemMetrics.value.responseTime > 1000 ? '过慢' : '正常'
}

const getRankingValue = (agent: any) => {
  return agent[rankingMetric.value]
}

const getRankingUnit = (agent: any) => {
  const units: Record<string, string> = {
    successRate: '%',
    responseTime: 'ms',
    tasksCompleted: '个',
    reliability: '%'
  }
  return units[rankingMetric.value] || ''
}

const getRankingProgress = (agent: any) => {
  const value = agent[rankingMetric.value]

  if (rankingMetric.value === 'responseTime') {
    // 响应时间越小越好，反转为进度条
    return Math.max(0, 100 - (value / 20))
  }

  return Math.min(100, value)
}

const getRankingColor = (index: number) => {
  if (index === 0) return '#ffd700'
  if (index === 1) return '#c0c0c0'
  if (index === 2) return '#cd7f32'
  return '#409eff'
}

const getTaskStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '进行中': 'warning',
    '已完成': 'success',
    '已取消': 'info',
    '失败': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return time.toLocaleDateString()
  }
}
</script>

<style lang="scss" scoped>
.performance-monitoring {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  .performance-overview {
    margin-bottom: 24px;

    .metric-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .metric-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.cpu {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.memory {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          &.response {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }

          &.throughput {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
          }
        }

        .metric-info {
          flex: 1;

          .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .metric-label {
            font-size: 14px;
            color: #909399;
            margin: 4px 0;
          }

          .metric-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            font-weight: 500;

            &.positive {
              color: #67c23a;
            }

            &.negative {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }

  .chart-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .chart-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .performance-chart {
      height: 400px;
      width: 100%;
    }

    .agent-status-chart {
      height: 300px;
      width: 100%;
    }
  }

  .ranking-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .ranking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        margin-bottom: 12px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.top-performer {
          background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
          border: 1px solid #ffecb3;
        }

        .ranking-position {
          width: 40px;
          text-align: center;
          position: relative;

          .position-number {
            font-size: 18px;
            font-weight: 700;
            color: #303133;
          }

          .medal {
            position: absolute;
            top: -10px;
            right: -5px;
            font-size: 16px;
          }
        }

        .ranking-info {
          flex: 1;

          .agent-name {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .agent-type {
            font-size: 12px;
            color: #909399;
          }
        }

        .ranking-value {
          text-align: center;

          .value-main {
            font-size: 16px;
            font-weight: 700;
            color: #303133;
          }

          .value-unit {
            font-size: 12px;
            color: #909399;
          }
        }

        .ranking-trend {
          width: 100px;
        }
      }
    }
  }

  .alerts-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .alerts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .alerts-controls {
        display: flex;
        align-items: center;
        gap: 8px;

        .alert-badge {
          margin-right: 8px;
        }
      }
    }

    .alerts-list {
      max-height: 400px;
      overflow-y: auto;

      .alert-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        margin-bottom: 12px;
        border-left: 4px solid #e4e7ed;

        &.critical {
          border-left-color: #f56c6c;
          background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
        }

        &.high {
          border-left-color: #e6a23c;
          background: linear-gradient(135deg, #fdf6ec 0%, #ffffff 100%);
        }

        &.medium {
          border-left-color: #409eff;
          background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
        }

        .alert-icon {
          margin-top: 2px;
          color: #f56c6c;
        }

        .alert-content {
          flex: 1;

          .alert-title {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .alert-description {
            font-size: 13px;
            color: #606266;
            margin-bottom: 6px;
            line-height: 1.4;
          }

          .alert-time {
            font-size: 12px;
            color: #909399;
          }
        }

        .alert-actions {
          display: flex;
          gap: 8px;
        }
      }

      .no-alerts {
        text-align: center;
        padding: 40px;
        color: #67c23a;

        .el-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      }
    }
  }

  .task-monitoring-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .task-controls {
        display: flex;
        gap: 8px;
      }
    }

    .progress-text {
      font-size: 12px;
      color: #606266;
      margin-left: 8px;
    }
  }
}

@media (max-width: 768px) {
  .performance-monitoring {
    padding: 16px;

    .performance-overview {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .chart-header {
      flex-direction: column !important;
      gap: 12px;
      align-items: stretch !important;
    }

    .ranking-header,
    .alerts-header,
    .task-header {
      flex-direction: column !important;
      gap: 12px;
      align-items: stretch !important;
    }
  }
}
</style>