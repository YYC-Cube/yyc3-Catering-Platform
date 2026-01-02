<!--
  YYC³餐饮行业智能化平台 - 性能监控仪表板
  实时监控应用性能指标，提供优化建议
-->
<template>
  <div class="performance-monitor" :class="monitorClasses">
    <!-- 监控控制栏 -->
    <div class="monitor-header">
      <div class="header-left">
        <h3 class="monitor-title">
          <el-icon><DataAnalysis /></el-icon>
          性能监控仪表板
        </h3>
        <div class="monitor-status" :class="{ active: isMonitoring }">
          <div class="status-indicator"></div>
          <span>{{ isMonitoring ? '监控中' : '已停止' }}</span>
        </div>
      </div>

      <div class="header-controls">
        <el-button-group>
          <el-button
            :type="isMonitoring ? 'danger' : 'primary'"
            size="small"
            @click="toggleMonitoring"
          >
            <el-icon><VideoPlay v-if="!isMonitoring" /><VideoPause v-else /></el-icon>
            {{ isMonitoring ? '暂停' : '开始' }}
          </el-button>
          <el-button size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button size="small" @click="exportReport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 性能指标卡片 -->
    <div class="metrics-grid">
      <!-- 渲染性能 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">
            <el-icon><Monitor /></el-icon>
            渲染性能
          </div>
          <div class="metric-grade" :class="renderPerformanceGrade">
            {{ getGradeLabel(renderPerformanceGrade) }}
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-chart">
            <div class="fps-display">
              <div class="fps-value">{{ fps }}</div>
              <div class="fps-label">FPS</div>
            </div>
            <canvas ref="fpsChartRef" class="fps-chart"></canvas>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span class="detail-label">长帧数量</span>
              <span class="detail-value">{{ longFrames }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">平均帧时间</span>
              <span class="detail-value">{{ averageFrameTime }}ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 网络性能 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">
            <el-icon><Connection /></el-icon>
            网络性能
          </div>
          <div class="metric-status" :class="networkStatus">
            {{ getNetworkStatusLabel(networkStatus) }}
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-chart">
            <div class="network-stats">
              <div class="stat-item">
                <div class="stat-value">{{ networkMetrics.totalRequests }}</div>
                <div class="stat-label">总请求数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatBytes(networkMetrics.totalSize) }}</div>
                <div class="stat-label">总传输量</div>
              </div>
            </div>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span class="detail-label">平均响应时间</span>
              <span class="detail-value">{{ networkMetrics.averageResponseTime }}ms</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">错误率</span>
              <span class="detail-value">{{ (networkMetrics.errorRate * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内存使用 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">
            <el-icon><Cpu /></el-icon>
            内存使用
          </div>
          <div class="metric-status" :class="memoryStatus">
            {{ getMemoryStatusLabel(memoryStatus) }}
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-chart">
            <div class="memory-usage-chart">
              <div class="memory-progress">
                <div
                  class="memory-progress-bar"
                  :style="{ width: (memoryUsage?.usage || 0) * 100 + '%' }"
                ></div>
              </div>
              <div class="memory-text">
                {{ ((memoryUsage?.usage || 0) * 100).toFixed(1) }}%
              </div>
            </div>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span class="detail-label">已使用</span>
              <span class="detail-value">{{ formatBytes(memoryUsage?.used || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">限制</span>
              <span class="detail-value">{{ formatBytes(memoryUsage?.limit || 0) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义指标 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">
            <el-icon><Timer /></el-icon>
            操作性能
          </div>
        </div>
        <div class="metric-content">
          <div class="custom-metrics">
            <div
              v-for="(metric, name) in customMetrics"
              :key="name"
              class="custom-metric-item"
            >
              <div class="metric-name">{{ name }}</div>
              <div class="metric-stats">
                <span class="metric-avg">{{ metric.avg.toFixed(2) }}ms</span>
                <span class="metric-count">({{ metric.count }}次)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能优化建议 -->
    <div class="suggestions-section" v-if="suggestions.length > 0">
      <div class="section-header">
        <h4 class="section-title">
          <el-icon><Lightbulb /></el-icon>
          优化建议
        </h4>
        <el-badge :value="suggestions.length" type="warning" />
      </div>
      <div class="suggestions-list">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          :class="getSuggestionSeverity(suggestion)"
        >
          <div class="suggestion-icon">
            <el-icon><Warning v-if="getSuggestionSeverity(suggestion) === 'high'" /><InfoFilled v-else /></el-icon>
          </div>
          <div class="suggestion-content">
            <div class="suggestion-text">{{ suggestion }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时日志 -->
    <div class="logs-section" v-if="showLogs">
      <div class="section-header">
        <h4 class="section-title">
          <el-icon><Document /></el-icon>
          实时日志
        </h4>
        <el-button size="small" @click="clearLogs">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
      <div class="logs-container">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-entry"
          :class="log.level"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  NetworkPerformanceMonitor,
  RenderPerformanceMonitor,
  MemoryMonitor,
  PerformanceOptimizer,
  PerformanceReporter
} from '@/utils/performanceConfig'
import { performanceMonitor } from '@/utils/performanceConfig'

// 类型定义
interface LogEntry {
  timestamp: number
  level: 'info' | 'warn' | 'error'
  message: string
}

interface CustomMetric {
  avg: number
  count: number
}

// Props
const props = withDefaults(defineProps<{
  autoStart?: boolean
  showLogs?: boolean
  refreshInterval?: number
}>(), {
  autoStart: true,
  showLogs: false,
  refreshInterval: 1000
})

// 响应式数据
const isMonitoring = ref(false)
const fps = ref(60)
const longFrames = ref(0)
const averageFrameTime = ref(0)
const renderPerformanceGrade = ref<'excellent' | 'good' | 'fair' | 'poor'>('excellent')
const networkStatus = ref<'excellent' | 'good' | 'fair' | 'poor'>('excellent')
const memoryStatus = ref('normal')
const suggestions = ref<string[]>([])
const logs = ref<LogEntry[]>([])
const fpsChartRef = ref<HTMLCanvasElement>()

// 性能监控器实例
let networkMonitor: NetworkPerformanceMonitor
let renderMonitor: RenderPerformanceMonitor
let memoryMonitor: MemoryMonitor
let optimizer: PerformanceOptimizer
let reporter: PerformanceReporter
let refreshTimer: NodeJS.Timeout | null = null

// 计算属性
const monitorClasses = computed(() => ({
  'monitoring': isMonitoring.value,
  'has-logs': props.showLogs
}))

const networkMetrics = computed(() => {
  return networkMonitor ? networkMonitor.getMetrics() : {
    totalRequests: 0,
    totalSize: 0,
    averageResponseTime: 0,
    errorRate: 0,
    slowRequests: 0
  }
})

const memoryUsage = computed(() => {
  return memoryMonitor ? memoryMonitor.getMemoryUsage() : null
})

const customMetrics = computed(() => {
  return performanceMonitor ? performanceMonitor.getMetrics() : {}
})

// 方法
const initMonitors = () => {
  networkMonitor = NetworkPerformanceMonitor.getInstance()
  renderMonitor = new RenderPerformanceMonitor()
  memoryMonitor = new MemoryMonitor()
  optimizer = new PerformanceOptimizer()
  reporter = new PerformanceReporter()
}

const startMonitoring = () => {
  if (isMonitoring.value) return

  isMonitoring.value = true
  addLog('info', '开始性能监控')

  // 启动定时刷新
  refreshTimer = setInterval(() => {
    updateMetrics()
  }, props.refreshInterval)

  // 初始化FPS图表
  initFPSChart()
}

const stopMonitoring = () => {
  if (!isMonitoring.value) return

  isMonitoring.value = false
  addLog('info', '停止性能监控')

  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const toggleMonitoring = () => {
  if (isMonitoring.value) {
    stopMonitoring()
  } else {
    startMonitoring()
  }
}

const updateMetrics = () => {
  // 更新渲染性能
  fps.value = renderMonitor.getFPS()
  longFrames.value = renderMonitor.getLongFrames()
  renderPerformanceGrade.value = renderMonitor.getPerformanceGrade()
  averageFrameTime.value = fps.value > 0 ? (1000 / fps.value) : 0

  // 更新网络状态
  const networkData = networkMetrics.value
  if (networkData.averageResponseTime > 2000 || networkData.errorRate > 0.1) {
    networkStatus.value = 'poor'
  } else if (networkData.averageResponseTime > 1000 || networkData.errorRate > 0.05) {
    networkStatus.value = 'fair'
  } else if (networkData.averageResponseTime > 500 || networkData.errorRate > 0.01) {
    networkStatus.value = 'good'
  } else {
    networkStatus.value = 'excellent'
  }

  // 更新内存状态
  if (memoryMonitor.isMemoryLeakDetected()) {
    memoryStatus.value = 'critical'
  } else if (memoryUsage.value && memoryUsage.value.usage > 0.7) {
    memoryStatus.value = 'warning'
  } else {
    memoryStatus.value = 'normal'
  }

  // 更新优化建议
  suggestions.value = optimizer.generateOptimizationSuggestions()

  // 更新FPS图表
  updateFPSChart()
}

const initFPSChart = () => {
  nextTick(() => {
    if (!fpsChartRef.value) return

    const canvas = fpsChartRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  })
}

const updateFPSChart = () => {
  if (!fpsChartRef.value) return

  const canvas = fpsChartRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 简单的FPS曲线图实现
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 这里可以添加更复杂的图表绘制逻辑
  ctx.strokeStyle = '#4F46E5'
  ctx.lineWidth = 2
  ctx.beginPath()

  const height = canvas.height
  const width = canvas.width
  const fpsHeight = (fps.value / 60) * height

  ctx.moveTo(0, height - fpsHeight)
  ctx.lineTo(width, height - fpsHeight)
  ctx.stroke()
}

const refreshData = () => {
  updateMetrics()
  addLog('info', '刷新性能数据')
}

const exportReport = () => {
  const report = reporter.generateReport()
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('性能报告已导出')
  addLog('info', '导出性能报告')
}

const addLog = (level: LogEntry['level'], message: string) => {
  logs.value.unshift({
    timestamp: Date.now(),
    level,
    message
  })

  // 保持日志数量在合理范围内
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100)
  }
}

const clearLogs = () => {
  logs.value = []
  addLog('info', '清空日志')
}

// 工具方法
const getGradeLabel = (grade: string) => {
  const labels = {
    excellent: '优秀',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }
  return labels[grade as keyof typeof labels] || '未知'
}

const getNetworkStatusLabel = (status: string) => {
  const labels = {
    excellent: '优秀',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }
  return labels[status as keyof typeof labels] || '未知'
}

const getMemoryStatusLabel = (status: string) => {
  const labels = {
    normal: '正常',
    warning: '警告',
    critical: '危险'
  }
  return labels[status as keyof typeof labels] || '未知'
}

const getSuggestionSeverity = (suggestion: string) => {
  if (suggestion.includes('严重') || suggestion.includes('危险')) {
    return 'high'
  }
  return 'medium'
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 监听器
watch(() => props.autoStart, (newVal) => {
  if (newVal && !isMonitoring.value) {
    startMonitoring()
  }
})

// 生命周期
onMounted(() => {
  initMonitors()
  if (props.autoStart) {
    startMonitoring()
  }
})

onUnmounted(() => {
  stopMonitoring()
})

// 暴露方法
defineExpose({
  startMonitoring,
  stopMonitoring,
  refreshData,
  exportReport,
  getMetrics: () => ({
    render: { fps: fps.value, grade: renderPerformanceGrade.value },
    network: networkMetrics.value,
    memory: memoryUsage.value,
    suggestions: suggestions.value
  })
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.performance-monitor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: $border-radius-lg;
  border: 1px solid var(--color-border);

  .monitor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--spacing-4);
    border-bottom: 1px solid var(--color-border);

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);

      .monitor-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: $font-size-heading-3;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .monitor-status {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        padding: var(--spacing-1) var(--spacing-2);
        border-radius: $border-radius-full;
        font-size: $font-size-body-small;
        font-weight: 500;
        background: var(--color-fill-color-light);
        color: var(--color-text-secondary);

        &.active {
          background: var(--color-success-light);
          color: var(--color-success);

          .status-indicator {
            background: var(--color-success);
          }
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-text-placeholder);
          animation: pulse 2s ease-in-out infinite;
        }
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-4);

    .metric-card {
      padding: var(--spacing-4);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: $border-radius-md;
      transition: box-shadow 0.2s ease;

      &:hover {
        box-shadow: $shadow-md;
      }

      .metric-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-3);

        .metric-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .metric-grade,
        .metric-status {
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: $border-radius-sm;
          font-size: $font-size-body-small;
          font-weight: 500;

          &.excellent {
            background: var(--color-success-light);
            color: var(--color-success);
          }

          &.good {
            background: var(--color-info-light);
            color: var(--color-info);
          }

          &.fair {
            background: var(--color-warning-light);
            color: var(--color-warning);
          }

          &.poor {
            background: var(--color-danger-light);
            color: var(--color-danger);
          }

          &.normal {
            background: var(--color-success-light);
            color: var(--color-success);
          }

          &.warning {
            background: var(--color-warning-light);
            color: var(--color-warning);
          }

          &.critical {
            background: var(--color-danger-light);
            color: var(--color-danger);
          }
        }
      }

      .metric-content {
        .metric-chart {
          height: 120px;
          margin-bottom: var(--spacing-3);

          .fps-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;

            .fps-value {
              font-size: 2rem;
              font-weight: 700;
              color: var(--color-primary);
            }

            .fps-label {
              font-size: $font-size-body-small;
              color: var(--color-text-secondary);
            }
          }

          .fps-chart {
            width: 100%;
            height: 100%;
          }

          .network-stats {
            display: flex;
            justify-content: space-around;
            height: 100%;
            align-items: center;

            .stat-item {
              text-align: center;

              .stat-value {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--color-primary);
                margin-bottom: var(--spacing-1);
              }

              .stat-label {
                font-size: $font-size-body-small;
                color: var(--color-text-secondary);
              }
            }
          }

          .memory-usage-chart {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            gap: var(--spacing-2);

            .memory-progress {
              height: 8px;
              background: var(--color-fill-color-light);
              border-radius: 4px;
              overflow: hidden;

              .memory-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, var(--color-success), var(--color-warning));
                transition: width 0.3s ease;
              }
            }

            .memory-text {
              text-align: center;
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--color-primary);
            }
          }

          .custom-metrics {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-2);

            .custom-metric-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: var(--spacing-2);
              background: var(--color-surface);
              border-radius: $border-radius-sm;

              .metric-name {
                font-size: $font-size-body-small;
                color: var(--color-text-secondary);
              }

              .metric-stats {
                display: flex;
                align-items: center;
                gap: var(--spacing-1);

                .metric-avg {
                  font-weight: 600;
                  color: var(--color-primary);
                }

                .metric-count {
                  font-size: $font-size-body-small;
                  color: var(--color-text-placeholder);
                }
              }
            }
          }
        }

        .metric-details {
          display: flex;
          justify-content: space-between;

          .detail-item {
            text-align: center;

            .detail-label {
              display: block;
              font-size: $font-size-body-small;
              color: var(--color-text-secondary);
              margin-bottom: var(--spacing-1);
            }

            .detail-value {
              font-weight: 600;
              color: var(--color-text-primary);
            }
          }
        }
      }
    }
  }

  .suggestions-section,
  .logs-section {
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-3);

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: $font-size-heading-4;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }
  }

  .suggestions-section {
    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      .suggestion-item {
        display: flex;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: $border-radius-md;
        border-left: 4px solid;

        &.high {
          background: var(--color-danger-light);
          border-left-color: var(--color-danger);

          .suggestion-icon {
            color: var(--color-danger);
          }
        }

        &.medium {
          background: var(--color-warning-light);
          border-left-color: var(--color-warning);

          .suggestion-icon {
            color: var(--color-warning);
          }
        }

        .suggestion-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .suggestion-content {
          .suggestion-text {
            color: var(--color-text-primary);
            line-height: 1.5;
          }
        }
      }
    }
  }

  .logs-section {
    .logs-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--color-border);
      border-radius: $border-radius-md;
      background: var(--color-surface);

      .log-entry {
        display: flex;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        border-bottom: 1px solid var(--color-border);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: $font-size-body-small;

        &:last-child {
          border-bottom: none;
        }

        &.error {
          background: var(--color-danger-light);
        }

        &.warn {
          background: var(--color-warning-light);
        }

        .log-time {
          color: var(--color-text-placeholder);
          flex-shrink: 0;
        }

        .log-level {
          color: var(--color-primary);
          font-weight: 600;
          flex-shrink: 0;
          width: 50px;
        }

        .log-message {
          color: var(--color-text-primary);
          flex: 1;
        }
      }
    }
  }
}

// 动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .performance-monitor {
    padding: var(--spacing-3);

    .monitor-header {
      flex-direction: column;
      gap: var(--spacing-3);
      align-items: stretch;

      .header-left {
        justify-content: center;
      }
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .performance-monitor {
    border-width: 2px;

    .metric-card {
      border-width: 2px;
    }
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  .status-indicator {
    animation: none;
  }

  .metric-card {
    transition: none;
  }

  .memory-progress-bar {
    transition: none;
  }
}
</style>