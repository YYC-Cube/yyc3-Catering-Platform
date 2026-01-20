<template>
  <div class="sales-analytics">
    <div class="analytics-header">
      <div class="header-title">
        <h3>销售分析</h3>
        <p>深入了解销售趋势和收入表现</p>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button :type="viewMode === 'overview' ? 'primary' : 'default'" @click="viewMode = 'overview'">
            总览
          </el-button>
          <el-button :type="viewMode === 'trends' ? 'primary' : 'default'" @click="viewMode = 'trends'">
            趋势
          </el-button>
          <el-button :type="viewMode === 'products' ? 'primary' : 'default'" @click="viewMode = 'products'">
            商品
          </el-button>
          <el-button :type="viewMode === 'forecast' ? 'primary' : 'default'" @click="viewMode = 'forecast'">
            预测
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="analytics-content">
      <div v-if="viewMode === 'overview'" class="overview-view">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card title="销售收入趋势">
              <div ref="revenueChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card title="销售分布">
              <div ref="distributionChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="按小时销售分析">
              <div ref="hourlyChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="支付方式分布">
              <div ref="paymentChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'trends'" class="trends-view">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card title="销售趋势分析">
              <div class="trend-controls">
                <el-radio-group v-model="trendGranularity" @change="loadTrendData">
                  <el-radio-button label="day">日趋势</el-radio-button>
                  <el-radio-button label="week">周趋势</el-radio-button>
                  <el-radio-button label="month">月趋势</el-radio-button>
                </el-radio-group>
              </div>
              <div ref="trendsChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="同比增长分析">
              <div ref="yoyChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="环比增长分析">
              <div ref="momChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'products'" class="products-view">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card title="热销商品排行">
              <el-table :data="topProducts" style="width: 100%" v-loading="loading">
                <el-table-column type="index" label="排名" width="80" />
                <el-table-column prop="itemName" label="商品名称" />
                <el-table-column prop="categoryName" label="类别" width="120" />
                <el-table-column prop="quantity" label="销量" width="100" sortable />
                <el-table-column prop="revenue" label="收入" width="120" sortable>
                  <template #default="{ row }">
                    ¥{{ row.revenue.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="profit" label="利润" width="120" sortable>
                  <template #default="{ row }">
                    ¥{{ row.profit.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="growth" label="增长率" width="100" sortable>
                  <template #default="{ row }">
                    <span :class="row.growth >= 0 ? 'text-success' : 'text-danger'">
                      {{ row.growth >= 0 ? '+' : '' }}{{ row.growth }}%
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card title="类别销售对比">
              <div ref="categoryChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="商品关联分析">
              <div ref="associationChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'forecast'" class="forecast-view">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card title="销售预测">
              <div class="forecast-controls">
                <el-form :inline="true">
                  <el-form-item label="预测周期">
                    <el-select v-model="forecastDays" @change="loadForecastData">
                      <el-option label="7天" :value="7" />
                      <el-option label="15天" :value="15" />
                      <el-option label="30天" :value="30" />
                      <el-option label="60天" :value="60" />
                      <el-option label="90天" :value="90" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="预测模型">
                    <el-select v-model="forecastModel" @change="loadForecastData">
                      <el-option label="ARIMA" value="arima" />
                      <el-option label="Prophet" value="prophet" />
                      <el-option label="LSTM" value="lstm" />
                      <el-option label="集成模型" value="ensemble" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
              <div ref="forecastChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="预测准确度">
              <div class="accuracy-metrics">
                <div class="metric-item">
                  <div class="metric-label">MAE (平均绝对误差)</div>
                  <div class="metric-value">{{ forecastAccuracy.mae }}</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">RMSE (均方根误差)</div>
                  <div class="metric-value">{{ forecastAccuracy.rmse }}</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">MAPE (平均绝对百分比误差)</div>
                  <div class="metric-value">{{ forecastAccuracy.mape }}%</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">R² (决定系数)</div>
                  <div class="metric-value">{{ forecastAccuracy.r2 }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="预测建议">
              <div class="forecast-suggestions">
                <el-alert
                  v-for="(suggestion, index) in forecastSuggestions"
                  :key="index"
                  :title="suggestion.title"
                  :type="suggestion.type"
                  :description="suggestion.description"
                  :closable="false"
                  style="margin-bottom: 10px;"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

interface ProductSales {
  rank: number
  itemName: string
  categoryName: string
  quantity: number
  revenue: number
  profit: number
  growth: number
}

interface ForecastAccuracy {
  mae: number
  rmse: number
  mape: number
  r2: number
}

interface ForecastSuggestion {
  title: string
  type: 'success' | 'warning' | 'info'
  description: string
}

const loading = ref(false)
const viewMode = ref('overview')
const trendGranularity = ref('day')
const forecastDays = ref(30)
const forecastModel = ref('ensemble')

const revenueChart = ref()
const distributionChart = ref()
const hourlyChart = ref()
const paymentChart = ref()
const trendsChart = ref()
const yoyChart = ref()
const momChart = ref()
const categoryChart = ref()
const associationChart = ref()
const forecastChart = ref()

const topProducts = ref<ProductSales[]>([])
const forecastAccuracy = reactive<ForecastAccuracy>({
  mae: 1250,
  rmse: 1890,
  mape: 8.5,
  r2: 0.92
})

const forecastSuggestions = ref<ForecastSuggestion[]>([
  {
    title: '预计下周销量增长15%',
    type: 'success',
    description: '基于历史数据和当前趋势，建议增加库存准备'
  },
  {
    title: '热销商品库存预警',
    type: 'warning',
    description: '红烧肉套餐预计3天后库存不足，建议提前补货'
  },
  {
    title: '新菜品推广建议',
    type: 'info',
    description: '根据客户偏好分析，建议推出春季特色菜品'
  }
])

const initRevenueChart = () => {
  if (!revenueChart.value) return
  
  const chart = echarts.init(revenueChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach((item: any) => {
          result += `${item.marker}${item.seriesName}: ¥${item.value.toLocaleString()}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['收入', '利润']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: [12500, 13200, 11800, 14500, 16800, 19200, 18500],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        data: [3750, 3960, 3540, 4350, 5040, 5760, 5550],
        itemStyle: { color: '#67C23A' }
      }
    ]
  }
  chart.setOption(option)
}

const initDistributionChart = () => {
  if (!distributionChart.value) return
  
  const chart = echarts.init(distributionChart.value)
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
        name: '销售分布',
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
          { value: 45000, name: '堂食', itemStyle: { color: '#409EFF' } },
          { value: 32000, name: '外卖', itemStyle: { color: '#67C23A' } },
          { value: 18000, name: '打包', itemStyle: { color: '#E6A23C' } },
          { value: 12000, name: '团购', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

const initHourlyChart = () => {
  if (!hourlyChart.value) return
  
  const chart = echarts.init(hourlyChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = params[0].axisValue + ':00<br/>'
        params.forEach((item: any) => {
          result += `${item.marker}${item.seriesName}: ${item.value}单<br/>`
        })
        return result
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => i)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: [5, 3, 2, 1, 2, 8, 25, 45, 68, 85, 92, 88, 95, 90, 82, 78, 85, 92, 88, 75, 55, 35, 15, 8],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initPaymentChart = () => {
  if (!paymentChart.value) return
  
  const chart = echarts.init(paymentChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '支付方式',
        type: 'pie',
        radius: '70%',
        data: [
          { value: 52000, name: '微信支付', itemStyle: { color: '#09BB07' } },
          { value: 38000, name: '支付宝', itemStyle: { color: '#1677FF' } },
          { value: 15000, name: '现金', itemStyle: { color: '#E6A23C' } },
          { value: 2000, name: '其他', itemStyle: { color: '#909399' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

const initTrendsChart = () => {
  if (!trendsChart.value) return
  
  const chart = echarts.init(trendsChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '订单数', '客单价']
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: [
      {
        type: 'value',
        name: '收入',
        position: 'left',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: [125000, 132000, 145000, 138000, 152000, 168000, 175000, 182000, 178000, 195000, 210000, 225000],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [2500, 2640, 2900, 2760, 3040, 3360, 3500, 3640, 3560, 3900, 4200, 4500],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '客单价',
        type: 'line',
        smooth: true,
        data: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  chart.setOption(option)
}

const initCategoryChart = () => {
  if (!categoryChart.value) return
  
  const chart = echarts.init(categoryChart.value)
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
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['凉菜', '汤品', '主食', '热菜', '饮品', '甜点']
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [850, 920, 1250, 1580, 680, 520],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initAssociationChart = () => {
  if (!associationChart.value) return
  
  const chart = echarts.init(associationChart.value)
  const option = {
    title: {
      text: '商品关联网络',
      left: 'center'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'force',
        symbolSize: 50,
        roam: true,
        label: {
          show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20
        },
        data: [
          { name: '红烧肉', itemStyle: { color: '#409EFF' } },
          { name: '米饭', itemStyle: { color: '#67C23A' } },
          { name: '宫保鸡丁', itemStyle: { color: '#E6A23C' } },
          { name: '麻婆豆腐', itemStyle: { color: '#F56C6C' } },
          { name: '清蒸鱼', itemStyle: { color: '#909399' } },
          { name: '青菜', itemStyle: { color: '#C0C4CC' } }
        ],
        links: [
          { source: '红烧肉', target: '米饭', value: 0.8 },
          { source: '宫保鸡丁', target: '米饭', value: 0.7 },
          { source: '麻婆豆腐', target: '米饭', value: 0.6 },
          { source: '清蒸鱼', target: '青菜', value: 0.5 },
          { source: '红烧肉', target: '青菜', value: 0.4 }
        ],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        }
      }
    ]
  }
  chart.setOption(option)
}

const initForecastChart = () => {
  if (!forecastChart.value) return
  
  const chart = echarts.init(forecastChart.value)
  
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 15 + i)
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  })
  
  const historicalData = Array.from({ length: 15 }, () => Math.floor(Math.random() * 5000) + 10000)
  const forecastData = Array.from({ length: 15 }, (_, i) => {
    const base = historicalData[historicalData.length - 1]
    const trend = (i + 1) * 100
    const noise = Math.floor(Math.random() * 500) - 250
    return base + trend + noise
  })
  
  const lowerBound = forecastData.map(v => v * 0.9)
  const upperBound = forecastData.map(v => v * 1.1)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach((item: any) => {
          if (item.seriesName === '历史数据' || item.seriesName === '预测数据') {
            result += `${item.marker}${item.seriesName}: ¥${item.value.toLocaleString()}<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['历史数据', '预测数据', '置信区间']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '历史数据',
        type: 'line',
        data: [...historicalData, ...Array(15).fill(null)],
        itemStyle: { color: '#409EFF' },
        lineStyle: { width: 3 }
      },
      {
        name: '预测数据',
        type: 'line',
        data: [...Array(15).fill(null), ...forecastData],
        itemStyle: { color: '#67C23A' },
        lineStyle: { type: 'dashed', width: 3 }
      },
      {
        name: '置信区间',
        type: 'line',
        data: [...Array(15).fill(null), ...upperBound],
        lineStyle: { opacity: 0 },
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(103, 194, 58, 0.1)'
          },
          data: [[
            {
              xAxis: dates[15]
            },
            {
              xAxis: dates[29]
            }
          ]]
        }
      }
    ]
  }
  chart.setOption(option)
}

const loadTopProducts = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/analytics/sales/products')
    const data = await response.json()
    if (data.success) {
      topProducts.value = data.data.items
    }
  } catch (error) {
    ElMessage.error('加载商品数据失败')
  } finally {
    loading.value = false
  }
}

const loadTrendData = async () => {
  ElMessage.info('加载趋势数据...')
}

const loadForecastData = async () => {
  ElMessage.info('加载预测数据...')
  await nextTick()
  initForecastChart()
}

watch(viewMode, async (newMode) => {
  await nextTick()
  
  if (newMode === 'overview') {
    initRevenueChart()
    initDistributionChart()
    initHourlyChart()
    initPaymentChart()
  } else if (newMode === 'trends') {
    initTrendsChart()
  } else if (newMode === 'products') {
    loadTopProducts()
    initCategoryChart()
    initAssociationChart()
  } else if (newMode === 'forecast') {
    loadForecastData()
  }
})

onMounted(async () => {
  await nextTick()
  initRevenueChart()
  initDistributionChart()
  initHourlyChart()
  initPaymentChart()
})
</script>

<style scoped lang="scss">
.sales-analytics {
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-title {
      h3 {
        margin: 0 0 5px 0;
        font-size: 20px;
        color: #303133;
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .analytics-content {
    .chart-container {
      width: 100%;
      height: 350px;
    }

    .large-chart-container {
      width: 100%;
      height: 500px;
    }

    .trend-controls,
    .forecast-controls {
      margin-bottom: 20px;
      text-align: center;
    }

    .accuracy-metrics {
      .metric-item {
        display: flex;
        justify-content: space-between;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 10px;

        .metric-label {
          font-size: 14px;
          color: #606266;
        }

        .metric-value {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
        }
      }
    }

    .text-success {
      color: #67c23a;
    }

    .text-danger {
      color: #f56c6c;
    }
  }
}
</style>
