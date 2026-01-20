<template>
  <div class="kitchen-efficiency">
    <el-card class="efficiency-card">
      <template #header>
        <div class="card-header">
          <span>厨房效率分析</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              @change="loadEfficiencyData"
            />
            <el-button size="small" @click="loadEfficiencyData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div class="efficiency-content">
        <el-row :gutter="20" class="metrics-row">
          <el-col :span="6" v-for="metric in efficiencyMetrics" :key="metric.key">
            <div class="metric-card" :class="metric.trend">
              <div class="metric-icon">
                <el-icon :size="32">
                  <component :is="metric.icon" />
                </el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metric.value }}</div>
                <div class="metric-label">{{ metric.label }}</div>
                <div class="metric-change">
                  <el-icon :size="12">
                    <ArrowUp v-if="metric.trend === 'up'" />
                    <ArrowDown v-if="metric.trend === 'down'" />
                    <Minus v-if="metric.trend === 'stable'" />
                  </el-icon>
                  {{ metric.change }}
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="charts-row">
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <span>订单处理时间趋势</span>
                </div>
              </template>
              <div ref="preparationTimeChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <span>任务完成量趋势</span>
                </div>
              </template>
              <div ref="completionChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="charts-row">
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <span>各岗位效率对比</span>
                </div>
              </template>
              <div ref="stationEfficiencyChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <span>高峰时段分析</span>
                </div>
              </template>
              <div ref="peakHoursChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="analysis-card">
          <template #header>
            <div class="chart-header">
              <span>效率分析报告</span>
            </div>
          </template>
          <div class="analysis-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="平均准备时间">
                {{ analysisData.averagePreparationTime }} 分钟
              </el-descriptions-item>
              <el-descriptions-item label="平均完成时间">
                {{ analysisData.averageCompletionTime }} 分钟
              </el-descriptions-item>
              <el-descriptions-item label="任务完成率">
                {{ analysisData.completionRate }}%
              </el-descriptions-item>
              <el-descriptions-item label="准时完成率">
                {{ analysisData.onTimeRate }}%
              </el-descriptions-item>
              <el-descriptions-item label="超时任务数">
                {{ analysisData.overdueTasks }}
              </el-descriptions-item>
              <el-descriptions-item label="取消任务数">
                {{ analysisData.cancelledTasks }}
              </el-descriptions-item>
              <el-descriptions-item label="高峰时段">
                {{ analysisData.peakHours }}
              </el-descriptions-item>
              <el-descriptions-item label="效率评分">
                <el-rate v-model="analysisData.efficiencyScore" disabled show-score />
              </el-descriptions-item>
            </el-descriptions>

            <el-divider>优化建议</el-divider>

            <div class="suggestions">
              <el-alert
                v-for="(suggestion, index) in efficiencySuggestions"
                :key="index"
                :title="suggestion.title"
                :type="suggestion.type"
                :description="suggestion.description"
                show-icon
                :closable="false"
                style="margin-bottom: 10px"
              />
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  ArrowUp,
  ArrowDown,
  Minus,
  Timer,
  TrendCharts,
  Clock,
  DataLine,
  Warning
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const dateRange = ref<[Date, Date]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date()
])

const efficiencyMetrics = reactive([
  {
    key: 'preparationTime',
    label: '平均准备时间',
    value: '12.5分钟',
    icon: Timer,
    trend: 'down',
    change: '-8.3%'
  },
  {
    key: 'completionRate',
    label: '任务完成率',
    value: '95.2%',
    icon: TrendCharts,
    trend: 'up',
    change: '+2.1%'
  },
  {
    key: 'onTimeRate',
    label: '准时完成率',
    value: '92.8%',
    icon: Clock,
    trend: 'up',
    change: '+3.5%'
  },
  {
    key: 'efficiencyScore',
    label: '效率评分',
    value: '4.5/5.0',
    icon: DataLine,
    trend: 'up',
    change: '+0.3'
  }
])

const analysisData = reactive({
  averagePreparationTime: 12.5,
  averageCompletionTime: 15.2,
  completionRate: 95.2,
  onTimeRate: 92.8,
  overdueTasks: 23,
  cancelledTasks: 8,
  peakHours: '11:30-13:30, 18:00-20:00',
  efficiencyScore: 4.5
})

const efficiencySuggestions = reactive([
  {
    title: '优化高峰期人员配置',
    type: 'warning',
    description: '在11:30-13:30和18:00-20:00高峰时段，建议增加热菜岗位人员配置，可提升15%的处理效率。'
  },
  {
    title: '提升凉菜岗位效率',
    type: 'info',
    description: '凉菜岗位平均准备时间较长，建议优化备菜流程，提前准备常用凉菜。'
  },
  {
    title: '减少超时任务',
    type: 'error',
    description: '本周有23个超时任务，主要集中在热菜岗位，建议加强该岗位培训和流程优化。'
  }
])

const preparationTimeChart = ref<HTMLElement>()
const completionChart = ref<HTMLElement>()
const stationEfficiencyChart = ref<HTMLElement>()
const peakHoursChart = ref<HTMLElement>()

let preparationTimeChartInstance: echarts.ECharts | null = null
let completionChartInstance: echarts.ECharts | null = null
let stationEfficiencyChartInstance: echarts.ECharts | null = null
let peakHoursChartInstance: echarts.ECharts | null = null

const loadEfficiencyData = async () => {
  try {
    ElMessage.loading('加载效率数据...')
    
    const response = await fetch('/api/kitchen/efficiency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: dateRange.value[0].toISOString(),
        endDate: dateRange.value[1].toISOString()
      })
    }).then(res => res.json())

    if (response.success) {
      updateMetrics(response.data)
      updateCharts(response.data)
      ElMessage.success('数据加载成功')
    }
  } catch (error) {
    console.error('Load efficiency data failed:', error)
    ElMessage.error('数据加载失败')
  }
}

const updateMetrics = (data: any) => {
  efficiencyMetrics[0].value = `${data.averagePreparationTime.toFixed(1)}分钟`
  efficiencyMetrics[1].value = `${data.completionRate.toFixed(1)}%`
  efficiencyMetrics[2].value = `${data.onTimeRate.toFixed(1)}%`
  efficiencyMetrics[3].value = `${data.efficiencyScore.toFixed(1)}/5.0`

  analysisData.averagePreparationTime = data.averagePreparationTime
  analysisData.averageCompletionTime = data.averageCompletionTime
  analysisData.completionRate = data.completionRate
  analysisData.onTimeRate = data.onTimeRate
  analysisData.overdueTasks = data.overdueTasks
  analysisData.cancelledTasks = data.cancelledTasks
  analysisData.peakHours = data.peakHours
  analysisData.efficiencyScore = data.efficiencyScore
}

const updateCharts = (data: any) => {
  updatePreparationTimeChart(data.preparationTimeTrend)
  updateCompletionChart(data.completionTrend)
  updateStationEfficiencyChart(data.stationEfficiency)
  updatePeakHoursChart(data.peakHoursData)
}

const updatePreparationTimeChart = (data: any[]) => {
  if (!preparationTimeChartInstance || !data) return

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>平均时间: ${params[0].value}分钟`
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '分钟'
    },
    series: [{
      data: data.map(item => item.value),
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      }
    }]
  }

  preparationTimeChartInstance.setOption(option)
}

const updateCompletionChart = (data: any[]) => {
  if (!completionChartInstance || !data) return

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>完成量: ${params[0].value}`
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '任务数'
    },
    series: [{
      data: data.map(item => item.value),
      type: 'bar',
      itemStyle: {
        color: '#67C23A'
      }
    }]
  }

  completionChartInstance.setOption(option)
}

const updateStationEfficiencyChart = (data: any[]) => {
  if (!stationEfficiencyChartInstance || !data) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value',
      name: '效率(%)'
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.station)
    },
    series: [{
      type: 'bar',
      data: data.map(item => ({
        value: item.value,
        itemStyle: {
          color: item.value >= 90 ? '#67C23A' : item.value >= 80 ? '#E6A23C' : '#F56C6C'
        }
      }))
    }]
  }

  stationEfficiencyChartInstance.setOption(option)
}

const updatePeakHoursChart = (data: any[]) => {
  if (!peakHoursChartInstance || !data) return

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>任务数: ${params[0].value}`
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.hour)
    },
    yAxis: {
      type: 'value',
      name: '任务数'
    },
    series: [{
      data: data.map(item => item.value),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(103, 194, 58, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(103, 194, 58, 0.05)'
          }]
        }
      },
      markLine: {
        data: [
          { type: 'average', name: '平均值' }
        ]
      }
    }]
  }

  peakHoursChartInstance.setOption(option)
}

const initCharts = () => {
  if (preparationTimeChart.value) {
    preparationTimeChartInstance = echarts.init(preparationTimeChart.value)
  }
  if (completionChart.value) {
    completionChartInstance = echarts.init(completionChart.value)
  }
  if (stationEfficiencyChart.value) {
    stationEfficiencyChartInstance = echarts.init(stationEfficiencyChart.value)
  }
  if (peakHoursChart.value) {
    peakHoursChartInstance = echarts.init(peakHoursChart.value)
  }

  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  preparationTimeChartInstance?.resize()
  completionChartInstance?.resize()
  stationEfficiencyChartInstance?.resize()
  peakHoursChartInstance?.resize()
}

onMounted(() => {
  initCharts()
  loadEfficiencyData()
})

onUnmounted(() => {
  preparationTimeChartInstance?.dispose()
  completionChartInstance?.dispose()
  stationEfficiencyChartInstance?.dispose()
  peakHoursChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.kitchen-efficiency {
  .efficiency-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: $spacing-2;
      }
    }

    .efficiency-content {
      .metrics-row {
        margin-bottom: $spacing-6;

        .metric-card {
          display: flex;
          align-items: center;
          gap: $spacing-4;
          padding: $spacing-4;
          background: $background-light;
          border-radius: $border-radius-lg;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: $shadow-md;
          }

          .metric-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border-radius: $border-radius-lg;
            background: $primary-light;
            color: $primary-color;
          }

          .metric-info {
            flex: 1;

            .metric-value {
              font-size: $font-size-xl;
              font-weight: 600;
              color: $text-primary;
              margin-bottom: $spacing-1;
            }

            .metric-label {
              font-size: $font-size-sm;
              color: $text-secondary;
              margin-bottom: $spacing-1;
            }

            .metric-change {
              display: flex;
              align-items: center;
              gap: $spacing-1;
              font-size: $font-size-xs;

              &.up {
                color: $success-color;
              }

              &.down {
                color: $success-color;
              }

              &.stable {
                color: $text-tertiary;
              }
            }
          }
        }
      }

      .charts-row {
        margin-bottom: $spacing-6;

        .chart-card {
          .chart-header {
            font-weight: 600;
            color: $text-primary;
          }

          .chart-container {
            height: 300px;
          }
        }
      }

      .analysis-card {
        .chart-header {
          font-weight: 600;
          color: $text-primary;
        }

        .analysis-content {
          .suggestions {
            margin-top: $spacing-4;
          }
        }
      }
    }
  }
}
</style>
