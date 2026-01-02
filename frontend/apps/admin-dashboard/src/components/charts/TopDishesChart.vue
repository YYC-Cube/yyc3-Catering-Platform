<template>
  <div class="top-dishes-chart">
    <div class="chart-header">
      <h3>热销菜品TOP10</h3>
      <el-select v-model="timeRange" size="small" style="width: 120px">
        <el-option label="今日" value="today" />
        <el-option label="本周" value="week" />
        <el-option label="本月" value="month" />
      </el-select>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

interface DishData {
  name: string
  quantity: number
  revenue?: number
}

interface Props {
  data?: DishData[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
})

const chartRef = ref<HTMLElement>()
const timeRange = ref('week')
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return

  const sortedData = [...props.data]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  const dishNames = sortedData.map(item => item.name)
  const quantities = sortedData.map(item => item.quantity)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = sortedData[params.dataIndex]
        return `${data.name}<br/>销量: ${data.quantity}${data.revenue ? `<br/>收入: ¥${data.revenue}` : ''}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#999'
      }
    },
    yAxis: {
      type: 'category',
      data: dishNames,
      axisLine: {
        lineStyle: {
          color: '#e6e6e6'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: quantities,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ffd700' },
            { offset: 1, color: '#ffb347' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: '#666',
          fontSize: 12
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

watch(() => props.data, updateChart, { deep: true })
watch(timeRange, updateChart)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})
</script>

<style lang="scss" scoped>
.top-dishes-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .chart-container {
    height: 400px;
  }
}
</style>