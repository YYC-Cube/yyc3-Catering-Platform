<template>
  <div ref="chartContainer" class="metric-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { SystemMetric } from '@/api/system-monitor'

interface Props {
  metric: SystemMetric
}

const props = defineProps<Props>()
const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)
  updateChart()

  // 响应窗口大小变化
  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (!chart || !props.metric) return

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${props.metric.name}: ${data.value}${props.metric.unit}`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '5%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.metric.history.map(item =>
        new Date(item.timestamp).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      ),
      show: false
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: Math.max(...props.metric.history.map(item => item.value)) * 1.2
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: props.metric.history.map(item => item.value),
        lineStyle: {
          width: 2,
          color: getLineColor()
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: getAreaColor(0.3)
              },
              {
                offset: 1,
                color: getAreaColor(0.1)
              }
            ]
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

const getLineColor = () => {
  switch (props.metric.status) {
    case 'normal':
      return '#67c23a'
    case 'warning':
      return '#e6a23c'
    case 'critical':
      return '#f56c6c'
    default:
      return '#409eff'
  }
}

const getAreaColor = (opacity: number) => {
  const baseColor = getLineColor()
  return baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0')
}

const handleResize = () => {
  chart?.resize()
}

const disposeChart = () => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', handleResize)
}

// 监听指标数据变化
watch(() => props.metric, updateChart, { deep: true })

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  disposeChart()
})
</script>

<style scoped>
.metric-chart {
  width: 100%;
  height: 100%;
}
</style>