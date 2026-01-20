<template>
  <div class="customer-analytics">
    <div class="analytics-header">
      <div class="header-title">
        <h3>客户分析</h3>
        <p>了解客户行为和价值贡献</p>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button :type="viewMode === 'growth' ? 'primary' : 'default'" @click="viewMode = 'growth'">
            增长
          </el-button>
          <el-button :type="viewMode === 'segments' ? 'primary' : 'default'" @click="viewMode = 'segments'">
            分段
          </el-button>
          <el-button :type="viewMode === 'behavior' ? 'primary' : 'default'" @click="viewMode = 'behavior'">
            行为
          </el-button>
          <el-button :type="viewMode === 'value' ? 'primary' : 'default'" @click="viewMode = 'value'">
            价值
          </el-button>
          <el-button :type="viewMode === 'geo' ? 'primary' : 'default'" @click="viewMode = 'geo'">
            地理
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="analytics-content">
      <div v-if="viewMode === 'growth'" class="growth-view">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card title="客户增长趋势">
              <div class="growth-controls">
                <el-radio-group v-model="growthGranularity" @change="loadGrowthData">
                  <el-radio-button label="day">日增长</el-radio-button>
                  <el-radio-button label="week">周增长</el-radio-button>
                  <el-radio-button label="month">月增长</el-radio-button>
                </el-radio-group>
              </div>
              <div ref="growthChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="客户来源分析">
              <div ref="sourceChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="客户留存率">
              <div ref="retentionChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="客户流失分析">
              <div ref="churnChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'segments'" class="segments-view">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card title="客户分段概览">
              <div class="segment-overview">
                <div v-for="segment in customerSegments" :key="segment.name" class="segment-item">
                  <div class="segment-header">
                    <span class="segment-name">{{ segment.name }}</span>
                    <el-tag :type="segment.tagType" size="small">{{ segment.count }}人</el-tag>
                  </div>
                  <div class="segment-metrics">
                    <div class="metric">
                      <span class="label">占比:</span>
                      <span class="value">{{ segment.percentage }}%</span>
                    </div>
                    <div class="metric">
                      <span class="label">平均消费:</span>
                      <span class="value">¥{{ segment.avgSpent }}</span>
                    </div>
                    <div class="metric">
                      <span class="label">消费频次:</span>
                      <span class="value">{{ segment.frequency }}次/月</span>
                    </div>
                  </div>
                  <el-progress :percentage="segment.percentage" :color="segment.color" />
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-card title="分段特征分析">
              <div ref="segmentRadarChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="RFM客户价值矩阵">
              <div ref="rfmMatrixChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'behavior'" class="behavior-view">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card title="消费频次分布">
              <div ref="frequencyChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="消费金额分布">
              <div ref="amountChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="消费时间偏好">
              <div ref="timePreferenceChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="菜品偏好分析">
              <div ref="dishPreferenceChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="客户行为路径">
              <div ref="behaviorPathChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'value'" class="value-view">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in valueMetrics" :key="metric.key">
            <el-card class="value-metric-card">
              <div class="metric-content">
                <div class="metric-icon" :style="{ backgroundColor: metric.color }">
                  <el-icon :size="24">
                    <component :is="metric.icon" />
                  </el-icon>
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>
                  <div class="metric-change" :class="metric.change >= 0 ? 'positive' : 'negative'">
                    {{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}%
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="16">
            <el-card title="客户价值趋势">
              <div ref="valueTrendChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card title="高价值客户TOP10">
              <el-table :data="topValueCustomers" style="width: 100%" max-height="400">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="name" label="客户姓名" />
                <el-table-column prop="ltv" label="终身价值" width="100">
                  <template #default="{ row }">
                    ¥{{ row.ltv.toLocaleString() }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="客户生命周期价值分析">
              <div ref="ltvChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'geo'" class="geo-view">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card title="客户地理分布">
              <div ref="geoChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card title="区域销售排行">
              <el-table :data="regionSales" style="width: 100%" max-height="400">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="region" label="区域" />
                <el-table-column prop="customers" label="客户数" width="80" />
                <el-table-column prop="revenue" label="销售额" width="100">
                  <template #default="{ row }">
                    ¥{{ row.revenue.toLocaleString() }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="配送区域分析">
              <div ref="deliveryChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="区域对比分析">
              <div ref="regionCompareChart" class="chart-container"></div>
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
import { User, Money, TrendCharts, Star } from '@element-plus/icons-vue'

interface CustomerSegment {
  name: string
  count: number
  percentage: number
  avgSpent: number
  frequency: number
  tagType: string
  color: string
}

interface ValueMetric {
  key: string
  label: string
  value: string | number
  change: number
  icon: string
  color: string
}

interface TopValueCustomer {
  name: string
  ltv: number
}

interface RegionSale {
  region: string
  customers: number
  revenue: number
}

const viewMode = ref('growth')
const growthGranularity = ref('month')

const growthChart = ref()
const sourceChart = ref()
const retentionChart = ref()
const churnChart = ref()
const segmentRadarChart = ref()
const rfmMatrixChart = ref()
const frequencyChart = ref()
const amountChart = ref()
const timePreferenceChart = ref()
const dishPreferenceChart = ref()
const behaviorPathChart = ref()
const valueTrendChart = ref()
const ltvChart = ref()
const geoChart = ref()
const deliveryChart = ref()
const regionCompareChart = ref()

const customerSegments = ref<CustomerSegment[]>([
  {
    name: '核心客户',
    count: 125,
    percentage: 25,
    avgSpent: 850,
    frequency: 8,
    tagType: 'danger',
    color: '#F56C6C'
  },
  {
    name: '重要客户',
    count: 175,
    percentage: 35,
    avgSpent: 520,
    frequency: 5,
    tagType: 'warning',
    color: '#E6A23C'
  },
  {
    name: '普通客户',
    count: 150,
    percentage: 30,
    avgSpent: 280,
    frequency: 2,
    tagType: 'primary',
    color: '#409EFF'
  },
  {
    name: '潜在客户',
    count: 50,
    percentage: 10,
    avgSpent: 120,
    frequency: 1,
    tagType: 'info',
    color: '#909399'
  }
])

const valueMetrics = ref<ValueMetric[]>([
  {
    key: 'totalCustomers',
    label: '客户总数',
    value: 500,
    change: 12.5,
    icon: 'User',
    color: '#409EFF'
  },
  {
    key: 'avgLTV',
    label: '平均终身价值',
    value: '¥3,250',
    change: 8.3,
    icon: 'Money',
    color: '#67C23A'
  },
  {
    key: 'retentionRate',
    label: '客户保留率',
    value: '85.2%',
    change: 2.1,
    icon: 'TrendCharts',
    color: '#E6A23C'
  },
  {
    key: 'satisfaction',
    label: '客户满意度',
    value: '4.6/5.0',
    change: 5.5,
    icon: 'Star',
    color: '#F56C6C'
  }
])

const topValueCustomers = ref<TopValueCustomer[]>([
  { name: '张三', ltv: 15800 },
  { name: '李四', ltv: 12500 },
  { name: '王五', ltv: 11200 },
  { name: '赵六', ltv: 9800 },
  { name: '钱七', ltv: 8900 },
  { name: '孙八', ltv: 8200 },
  { name: '周九', ltv: 7800 },
  { name: '吴十', ltv: 7500 },
  { name: '郑十一', ltv: 7200 },
  { name: '王十二', ltv: 6900 }
])

const regionSales = ref<RegionSale[]>([
  { region: '朝阳区', customers: 180, revenue: 285000 },
  { region: '海淀区', customers: 150, revenue: 245000 },
  { region: '西城区', customers: 95, revenue: 168000 },
  { region: '东城区', customers: 75, revenue: 125000 }
])

const initGrowthChart = () => {
  if (!growthChart.value) return
  
  const chart = echarts.init(growthChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增客户', '活跃客户', '流失客户']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增客户',
        type: 'line',
        smooth: true,
        data: [45, 52, 48, 55, 62, 58, 65, 70, 68, 75, 80, 85],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '活跃客户',
        type: 'line',
        smooth: true,
        data: [320, 335, 345, 355, 368, 375, 385, 395, 405, 415, 425, 435],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '流失客户',
        type: 'line',
        smooth: true,
        data: [12, 15, 13, 18, 16, 14, 17, 15, 19, 16, 18, 15],
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }
  chart.setOption(option)
}

const initSourceChart = () => {
  if (!sourceChart.value) return
  
  const chart = echarts.init(sourceChart.value)
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
        name: '客户来源',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 180, name: '线上推广', itemStyle: { color: '#409EFF' } },
          { value: 120, name: '线下活动', itemStyle: { color: '#67C23A' } },
          { value: 95, name: '口碑推荐', itemStyle: { color: '#E6A23C' } },
          { value: 65, name: '社交媒体', itemStyle: { color: '#F56C6C' } },
          { value: 40, name: '其他', itemStyle: { color: '#909399' } }
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

const initRetentionChart = () => {
  if (!retentionChart.value) return
  
  const chart = echarts.init(retentionChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第1月', '第2月', '第3月', '第4月', '第5月', '第6月']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '留存率',
        type: 'line',
        smooth: true,
        data: [100, 75, 62, 55, 48, 42],
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initChurnChart = () => {
  if (!churnChart.value) return
  
  const chart = echarts.init(churnChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
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
        name: '流失率',
        type: 'bar',
        data: [3.8, 4.5, 3.8, 5.1, 4.3, 3.5],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#F56C6C' },
            { offset: 1, color: '#F89898' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initSegmentRadarChart = () => {
  if (!segmentRadarChart.value) return
  
  const chart = echarts.init(segmentRadarChart.value)
  const option = {
    tooltip: {},
    legend: {
      data: ['核心客户', '重要客户', '普通客户', '潜在客户']
    },
    radar: {
      indicator: [
        { name: '消费金额', max: 100 },
        { name: '消费频次', max: 100 },
        { name: '最近消费', max: 100 },
        { name: '客户忠诚度', max: 100 },
        { name: '推荐意愿', max: 100 }
      ]
    },
    series: [
      {
        name: '客户分段',
        type: 'radar',
        data: [
          {
            value: [95, 90, 85, 95, 90],
            name: '核心客户',
            itemStyle: { color: '#F56C6C' }
          },
          {
            value: [75, 70, 80, 75, 70],
            name: '重要客户',
            itemStyle: { color: '#E6A23C' }
          },
          {
            value: [50, 45, 60, 50, 45],
            name: '普通客户',
            itemStyle: { color: '#409EFF' }
          },
          {
            value: [25, 20, 40, 25, 20],
            name: '潜在客户',
            itemStyle: { color: '#909399' }
          }
        ]
      }
    ]
  }
  chart.setOption(option)
}

const initRfmMatrixChart = () => {
  if (!rfmMatrixChart.value) return
  
  const chart = echarts.init(rfmMatrixChart.value)
  const data = [
    [10, 8.04],
    [8, 6.95],
    [13, 7.58],
    [9, 8.81],
    [11, 8.33],
    [14, 9.96],
    [6, 7.24],
    [4, 4.26],
    [12, 10.84],
    [7, 4.82],
    [5, 5.68]
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `RFM: (${params.data[0].toFixed(2)}, ${params.data[1].toFixed(2)})`
      }
    },
    grid: {
      left: '3%',
      right: '7%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      name: '最近消费',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      splitLine: {
        show: false
      }
    },
    yAxis: {
      name: '消费频次',
      nameLocation: 'middle',
      nameGap: 40,
      type: 'value',
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: 'RFM',
        type: 'scatter',
        data: data,
        symbolSize: (data: number[]) => {
          return Math.sqrt(data[0] * data[1]) * 3
        },
        itemStyle: {
          color: '#409EFF',
          shadowBlur: 10,
          shadowColor: 'rgba(64, 158, 255, 0.5)'
        }
      }
    ]
  }
  chart.setOption(option)
}

const initFrequencyChart = () => {
  if (!frequencyChart.value) return
  
  const chart = echarts.init(frequencyChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1次', '2次', '3次', '4次', '5次', '6次', '7次', '8次', '9次', '10次+']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '客户数',
        type: 'bar',
        data: [85, 120, 95, 75, 55, 35, 20, 10, 3, 2],
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

const initAmountChart = () => {
  if (!amountChart.value) return
  
  const chart = echarts.init(amountChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['0-50', '50-100', '100-200', '200-300', '300-500', '500-800', '800+']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '客户数',
        type: 'bar',
        data: [120, 180, 125, 45, 20, 8, 2],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67C23A' },
            { offset: 0.5, color: '#95d475' },
            { offset: 1, color: '#b3e19d' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initTimePreferenceChart = () => {
  if (!timePreferenceChart.value) return
  
  const chart = echarts.init(timePreferenceChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['早餐', '午餐', '下午茶', '晚餐', '夜宵']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: [85, 280, 95, 320, 45],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#E6A23C' },
            { offset: 0.5, color: '#f0c78a' },
            { offset: 1, color: '#f3d19e' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initDishPreferenceChart = () => {
  if (!dishPreferenceChart.value) return
  
  const chart = echarts.init(dishPreferenceChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}单 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '菜品偏好',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 320, name: '热菜', itemStyle: { color: '#409EFF' } },
          { value: 180, name: '主食', itemStyle: { color: '#67C23A' } },
          { value: 120, name: '凉菜', itemStyle: { color: '#E6A23C' } },
          { value: 85, name: '汤品', itemStyle: { color: '#F56C6C' } },
          { value: 65, name: '饮品', itemStyle: { color: '#909399' } },
          { value: 45, name: '甜点', itemStyle: { color: '#C0C4CC' } }
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

const initBehaviorPathChart = () => {
  if (!behaviorPathChart.value) return
  
  const chart = echarts.init(behaviorPathChart.value)
  const option = {
    title: {
      text: '客户行为路径',
      left: 'center'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'none',
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
          { name: '浏览菜单', x: 300, y: 300, itemStyle: { color: '#409EFF' } },
          { name: '加入购物车', x: 500, y: 300, itemStyle: { color: '#67C23A' } },
          { name: '下单', x: 700, y: 300, itemStyle: { color: '#E6A23C' } },
          { name: '支付', x: 900, y: 300, itemStyle: { color: '#F56C6C' } },
          { name: '评价', x: 1100, y: 300, itemStyle: { color: '#909399' } },
          { name: '再次购买', x: 1300, y: 300, itemStyle: { color: '#C0C4CC' } }
        ],
        links: [
          { source: '浏览菜单', target: '加入购物车' },
          { source: '加入购物车', target: '下单' },
          { source: '下单', target: '支付' },
          { source: '支付', target: '评价' },
          { source: '评价', target: '再次购买' }
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

const initValueTrendChart = () => {
  if (!valueTrendChart.value) return
  
  const chart = echarts.init(valueTrendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '平均LTV',
        type: 'line',
        smooth: true,
        data: [2800, 2850, 2900, 2950, 3000, 3050, 3100, 3150, 3200, 3225, 3250, 3250],
        itemStyle: { color: '#67C23A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initLtvChart = () => {
  if (!ltvChart.value) return
  
  const chart = echarts.init(ltvChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['核心客户', '重要客户', '普通客户', '潜在客户']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第1月', '第2月', '第3月', '第4月', '第5月', '第6月', '第7月', '第8月', '第9月', '第10月', '第11月', '第12月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '核心客户',
        type: 'line',
        smooth: true,
        data: [850, 1700, 2550, 3400, 4250, 5100, 5950, 6800, 7650, 8500, 9350, 10200],
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '重要客户',
        type: 'line',
        smooth: true,
        data: [520, 1040, 1560, 2080, 2600, 3120, 3640, 4160, 4680, 5200, 5720, 6240],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '普通客户',
        type: 'line',
        smooth: true,
        data: [280, 560, 840, 1120, 1400, 1680, 1960, 2240, 2520, 2800, 3080, 3360],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '潜在客户',
        type: 'line',
        smooth: true,
        data: [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440],
        itemStyle: { color: '#909399' }
      }
    ]
  }
  chart.setOption(option)
}

const initGeoChart = () => {
  if (!geoChart.value) return
  
  const chart = echarts.init(geoChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人'
    },
    visualMap: {
      min: 0,
      max: 200,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true
    },
    series: [
      {
        name: '客户分布',
        type: 'map',
        mapType: 'china',
        roam: true,
        emphasis: {
          label: {
            show: true
          }
        },
        data: [
          { name: '北京', value: 500 },
          { name: '天津', value: 80 },
          { name: '河北', value: 120 },
          { name: '山西', value: 60 },
          { name: '内蒙古', value: 40 }
        ]
      }
    ]
  }
  chart.setOption(option)
}

const initDeliveryChart = () => {
  if (!deliveryChart.value) return
  
  const chart = echarts.init(deliveryChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['3公里内', '3-5公里', '5-7公里', '7-10公里', '10公里以上']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: [185, 145, 95, 55, 20],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 0.5, color: '#66b1ff' },
            { offset: 1, color: '#8cc5ff' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initRegionCompareChart = () => {
  if (!regionCompareChart.value) return
  
  const chart = echarts.init(regionCompareChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['客户数', '销售额']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['朝阳区', '海淀区', '西城区', '东城区']
    },
    yAxis: [
      {
        type: 'value',
        name: '客户数',
        position: 'left'
      },
      {
        type: 'value',
        name: '销售额',
        position: 'right',
        axisLabel: {
          formatter: '¥{value}'
        }
      }
    ],
    series: [
      {
        name: '客户数',
        type: 'bar',
        data: [180, 150, 95, 75],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '销售额',
        type: 'line',
        yAxisIndex: 1,
        data: [285000, 245000, 168000, 125000],
        itemStyle: { color: '#67C23A' }
      }
    ]
  }
  chart.setOption(option)
}

const loadGrowthData = async () => {
  ElMessage.info('加载增长数据...')
}

watch(viewMode, async (newMode) => {
  await nextTick()
  
  if (newMode === 'growth') {
    initGrowthChart()
    initSourceChart()
    initRetentionChart()
    initChurnChart()
  } else if (newMode === 'segments') {
    initSegmentRadarChart()
    initRfmMatrixChart()
  } else if (newMode === 'behavior') {
    initFrequencyChart()
    initAmountChart()
    initTimePreferenceChart()
    initDishPreferenceChart()
    initBehaviorPathChart()
  } else if (newMode === 'value') {
    initValueTrendChart()
    initLtvChart()
  } else if (newMode === 'geo') {
    initGeoChart()
    initDeliveryChart()
    initRegionCompareChart()
  }
})

onMounted(async () => {
  await nextTick()
  initGrowthChart()
  initSourceChart()
  initRetentionChart()
  initChurnChart()
})
</script>

<style scoped lang="scss">
.customer-analytics {
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

    .growth-controls {
      margin-bottom: 20px;
      text-align: center;
    }

    .segment-overview {
      .segment-item {
        padding: 15px;
        background: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 15px;

        .segment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .segment-name {
            font-size: 16px;
            font-weight: bold;
            color: #303133;
          }
        }

        .segment-metrics {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;

          .metric {
            font-size: 14px;
            color: #606266;

            .value {
              font-weight: bold;
              color: #303133;
            }
          }
        }
      }
    }

    .value-metric-card {
      .metric-content {
        display: flex;
        align-items: center;

        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 15px;
        }

        .metric-info {
          flex: 1;

          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }

          .metric-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 5px;
          }

          .metric-change {
            font-size: 12px;

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
}
</style>
