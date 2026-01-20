<template>
  <div class="operational-analytics">
    <div class="analytics-header">
      <div class="header-title">
        <h3>运营分析</h3>
        <p>监控运营效率和服务质量</p>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button :type="viewMode === 'efficiency' ? 'primary' : 'default'" @click="viewMode = 'efficiency'">
            效率
          </el-button>
          <el-button :type="viewMode === 'cost' ? 'primary' : 'default'" @click="viewMode = 'cost'">
            成本
          </el-button>
          <el-button :type="viewMode === 'quality' ? 'primary' : 'default'" @click="viewMode = 'quality'">
            质量
          </el-button>
          <el-button :type="viewMode === 'staff' ? 'primary' : 'default'" @click="viewMode = 'staff'">
            员工
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="analytics-content">
      <div v-if="viewMode === 'efficiency'" class="efficiency-view">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in efficiencyMetrics" :key="metric.key">
            <el-card class="efficiency-metric-card">
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
          <el-col :span="12">
            <el-card title="桌位利用率">
              <div ref="tableUtilizationChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="高峰时段分析">
              <div ref="peakHoursChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="订单处理时间">
              <div ref="orderProcessingChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="出餐速度分析">
              <div ref="cookingSpeedChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="运营效率趋势">
              <div ref="efficiencyTrendChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'cost'" class="cost-view">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in costMetrics" :key="metric.key">
            <el-card class="cost-metric-card">
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
          <el-col :span="12">
            <el-card title="成本构成分析">
              <div ref="costCompositionChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="成本趋势">
              <div ref="costTrendChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="单位成本分析">
              <div ref="unitCostChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="成本控制建议">
              <div class="cost-suggestions">
                <el-alert
                  v-for="(suggestion, index) in costControlSuggestions"
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

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="成本效益分析">
              <div ref="costBenefitChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'quality'" class="quality-view">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in qualityMetrics" :key="metric.key">
            <el-card class="quality-metric-card">
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
          <el-col :span="12">
            <el-card title="客户满意度趋势">
              <div ref="satisfactionTrendChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="投诉率分析">
              <div ref="complaintRateChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="处理时效分析">
              <div ref="responseTimeChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="服务质量评分">
              <div class="quality-scores">
                <div v-for="score in qualityScores" :key="score.label" class="score-item">
                  <div class="score-label">{{ score.label }}</div>
                  <div class="score-value">
                    <el-rate v-model="score.value" disabled show-score />
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="客户反馈分析">
              <div ref="feedbackChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'staff'" class="staff-view">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in staffMetrics" :key="metric.key">
            <el-card class="staff-metric-card">
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
          <el-col :span="12">
            <el-card title="员工效率排行">
              <el-table :data="staffEfficiency" style="width: 100%" max-height="400">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="role" label="职位" width="100" />
                <el-table-column prop="ordersProcessed" label="处理订单" width="100" sortable />
                <el-table-column prop="avgTime" label="平均时间" width="100" sortable>
                  <template #default="{ row }">
                    {{ row.avgTime }}分钟
                  </template>
                </el-table-column>
                <el-table-column prop="satisfaction" label="满意度" width="100">
                  <template #default="{ row }">
                    <el-rate v-model="row.satisfaction" disabled show-score />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="员工工作量分布">
              <div ref="workloadChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="员工绩效趋势">
              <div ref="performanceTrendChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="排班优化建议">
              <div class="scheduling-suggestions">
                <el-alert
                  v-for="(suggestion, index) in schedulingSuggestions"
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

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="员工培训与发展">
              <div ref="trainingChart" class="large-chart-container"></div>
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
import { TrendCharts, Money, Star, User } from '@element-plus/icons-vue'

interface Metric {
  key: string
  label: string
  value: string | number
  change: number
  icon: string
  color: string
}

interface StaffEfficiency {
  name: string
  role: string
  ordersProcessed: number
  avgTime: number
  satisfaction: number
}

interface QualityScore {
  label: string
  value: number
}

const viewMode = ref('efficiency')

const tableUtilizationChart = ref()
const peakHoursChart = ref()
const orderProcessingChart = ref()
const cookingSpeedChart = ref()
const efficiencyTrendChart = ref()
const costCompositionChart = ref()
const costTrendChart = ref()
const unitCostChart = ref()
const costBenefitChart = ref()
const satisfactionTrendChart = ref()
const complaintRateChart = ref()
const responseTimeChart = ref()
const feedbackChart = ref()
const workloadChart = ref()
const performanceTrendChart = ref()
const trainingChart = ref()

const efficiencyMetrics = ref<Metric[]>([
  {
    key: 'tableUtilization',
    label: '桌位利用率',
    value: '78.5%',
    change: 5.2,
    icon: 'TrendCharts',
    color: '#409EFF'
  },
  {
    key: 'orderProcessing',
    label: '订单处理效率',
    value: '92.3%',
    change: 3.8,
    icon: 'TrendCharts',
    color: '#67C23A'
  },
  {
    key: 'kitchenEfficiency',
    label: '厨房效率',
    value: '85.6%',
    change: 4.5,
    icon: 'TrendCharts',
    color: '#E6A23C'
  },
  {
    key: 'staffEfficiency',
    label: '员工效率',
    value: '88.2%',
    change: 2.9,
    icon: 'User',
    color: '#F56C6C'
  }
])

const costMetrics = ref<Metric[]>([
  {
    key: 'totalCost',
    label: '总成本',
    value: '¥88,000',
    change: -2.5,
    icon: 'Money',
    color: '#409EFF'
  },
  {
    key: 'laborCost',
    label: '人工成本',
    value: '¥18,000',
    change: -1.8,
    icon: 'User',
    color: '#67C23A'
  },
  {
    key: 'materialCost',
    label: '食材成本',
    value: '¥45,000',
    change: -3.2,
    icon: 'Money',
    color: '#E6A23C'
  },
  {
    key: 'costRatio',
    label: '成本占比',
    value: '47.7%',
    change: -1.5,
    icon: 'TrendCharts',
    color: '#F56C6C'
  }
])

const qualityMetrics = ref<Metric[]>([
  {
    key: 'satisfaction',
    label: '客户满意度',
    value: '4.6/5.0',
    change: 5.5,
    icon: 'Star',
    color: '#67C23A'
  },
  {
    key: 'complaintRate',
    label: '投诉率',
    value: '1.2%',
    change: -15.8,
    icon: 'TrendCharts',
    color: '#F56C6C'
  },
  {
    key: 'responseTime',
    label: '平均响应时间',
    value: '3.2分钟',
    change: -8.5,
    icon: 'TrendCharts',
    color: '#409EFF'
  },
  {
    key: 'resolutionRate',
    label: '问题解决率',
    value: '96.5%',
    change: 2.3,
    icon: 'Star',
    color: '#E6A23C'
  }
])

const staffMetrics = ref<Metric[]>([
  {
    key: 'totalStaff',
    label: '员工总数',
    value: 45,
    change: 5.0,
    icon: 'User',
    color: '#409EFF'
  },
  {
    key: 'avgOrders',
    label: '人均订单',
    value: 41.2,
    change: 8.3,
    icon: 'TrendCharts',
    color: '#67C23A'
  },
  {
    key: 'avgTime',
    label: '平均处理时间',
    value: '4.8分钟',
    change: -5.2,
    icon: 'TrendCharts',
    color: '#E6A23C'
  },
  {
    key: 'satisfaction',
    label: '员工满意度',
    value: '4.2/5.0',
    change: 3.5,
    icon: 'Star',
    color: '#F56C6C'
  }
])

const staffEfficiency = ref<StaffEfficiency[]>([
  { name: '张三', role: '服务员', ordersProcessed: 185, avgTime: 4.2, satisfaction: 4.8 },
  { name: '李四', role: '服务员', ordersProcessed: 178, avgTime: 4.5, satisfaction: 4.7 },
  { name: '王五', role: '厨师', ordersProcessed: 165, avgTime: 5.2, satisfaction: 4.6 },
  { name: '赵六', role: '服务员', ordersProcessed: 158, avgTime: 4.8, satisfaction: 4.5 },
  { name: '钱七', role: '厨师', ordersProcessed: 152, avgTime: 5.5, satisfaction: 4.4 }
])

const qualityScores = ref<QualityScore[]>([
  { label: '服务态度', value: 4.7 },
  { label: '菜品质量', value: 4.6 },
  { label: '环境卫生', value: 4.8 },
  { label: '出餐速度', value: 4.3 },
  { label: '性价比', value: 4.5 }
])

const costControlSuggestions = ref([
  {
    title: '优化食材采购',
    type: 'success',
    description: '建议与供应商协商批量采购，预计可降低食材成本5-8%'
  },
  {
    title: '调整人员排班',
    type: 'warning',
    description: '根据客流高峰优化排班，减少闲时人力浪费'
  },
  {
    title: '降低能源消耗',
    type: 'info',
    description: '推广节能设备使用，预计可降低水电成本10%'
  }
])

const schedulingSuggestions = ref([
  {
    title: '增加高峰期人手',
    type: 'warning',
    description: '午餐和晚餐高峰期建议增加2-3名服务员'
  },
  {
    title: '优化员工培训',
    type: 'success',
    description: '定期组织技能培训，提升员工服务效率'
  },
  {
    title: '实施绩效考核',
    type: 'info',
    description: '建立完善的绩效考核体系，激励员工提升效率'
  }
])

const initTableUtilizationChart = () => {
  if (!tableUtilizationChart.value) return
  
  const chart = echarts.init(tableUtilizationChart.value)
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
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
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
        name: '桌位利用率',
        type: 'line',
        smooth: true,
        data: [65, 68, 72, 70, 78, 92, 88],
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

const initPeakHoursChart = () => {
  if (!peakHoursChart.value) return
  
  const chart = echarts.init(peakHoursChart.value)
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

const initOrderProcessingChart = () => {
  if (!orderProcessingChart.value) return
  
  const chart = echarts.init(orderProcessingChart.value)
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
      data: ['接单', '确认', '制作', '出餐', '配送', '完成']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}分钟'
      }
    },
    series: [
      {
        name: '平均时间',
        type: 'bar',
        data: [0.5, 1.2, 8.5, 1.5, 15.2, 0.3],
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

const initCookingSpeedChart = () => {
  if (!cookingSpeedChart.value) return
  
  const chart = echarts.init(cookingSpeedChart.value)
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
      data: ['凉菜', '汤品', '热菜', '主食', '饮品']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}分钟'
      }
    },
    series: [
      {
        name: '平均制作时间',
        type: 'bar',
        data: [3.2, 8.5, 12.8, 6.5, 2.8],
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

const initEfficiencyTrendChart = () => {
  if (!efficiencyTrendChart.value) return
  
  const chart = echarts.init(efficiencyTrendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['桌位利用率', '订单处理效率', '厨房效率', '员工效率']
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
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '桌位利用率',
        type: 'line',
        smooth: true,
        data: [72, 73, 74, 75, 76, 77, 78, 78, 79, 80, 81, 78],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '订单处理效率',
        type: 'line',
        smooth: true,
        data: [88, 89, 89, 90, 90, 91, 91, 92, 92, 92, 93, 92],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '厨房效率',
        type: 'line',
        smooth: true,
        data: [80, 81, 82, 82, 83, 84, 84, 85, 85, 86, 86, 85],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '员工效率',
        type: 'line',
        smooth: true,
        data: [84, 85, 85, 86, 86, 87, 87, 88, 88, 88, 89, 88],
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }
  chart.setOption(option)
}

const initCostCompositionChart = () => {
  if (!costCompositionChart.value) return
  
  const chart = echarts.init(costCompositionChart.value)
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
        name: '成本构成',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 45000, name: '食材成本', itemStyle: { color: '#F56C6C' } },
          { value: 18000, name: '人工成本', itemStyle: { color: '#409EFF' } },
          { value: 12000, name: '租金成本', itemStyle: { color: '#67C23A' } },
          { value: 8000, name: '水电成本', itemStyle: { color: '#E6A23C' } },
          { value: 5000, name: '其他成本', itemStyle: { color: '#909399' } }
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

const initCostTrendChart = () => {
  if (!costTrendChart.value) return
  
  const chart = echarts.init(costTrendChart.value)
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
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '总成本',
        type: 'line',
        smooth: true,
        data: [92000, 91000, 89500, 89000, 88500, 88000],
        itemStyle: { color: '#F56C6C' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initUnitCostChart = () => {
  if (!unitCostChart.value) return
  
  const chart = echarts.init(unitCostChart.value)
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
      type: 'category',
      data: ['堂食', '外卖', '打包', '团购']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '单位成本',
        type: 'bar',
        data: [18.5, 22.8, 16.2, 15.5],
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

const initCostBenefitChart = () => {
  if (!costBenefitChart.value) return
  
  const chart = echarts.init(costBenefitChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '成本', '利润']
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
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: [185000, 188000, 192000, 195000, 198000, 200000],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '成本',
        type: 'line',
        smooth: true,
        data: [92000, 91000, 89500, 89000, 88500, 88000],
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '利润',
        type: 'bar',
        data: [93000, 97000, 102500, 106000, 109500, 112000],
        itemStyle: { color: '#409EFF' }
      }
    ]
  }
  chart.setOption(option)
}

const initSatisfactionTrendChart = () => {
  if (!satisfactionTrendChart.value) return
  
  const chart = echarts.init(satisfactionTrendChart.value)
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
      max: 5,
      axisLabel: {
        formatter: '{value}分'
      }
    },
    series: [
      {
        name: '满意度',
        type: 'line',
        smooth: true,
        data: [4.3, 4.4, 4.4, 4.5, 4.5, 4.6],
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

const initComplaintRateChart = () => {
  if (!complaintRateChart.value) return
  
  const chart = echarts.init(complaintRateChart.value)
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
        name: '投诉率',
        type: 'line',
        smooth: true,
        data: [1.8, 1.6, 1.5, 1.4, 1.3, 1.2],
        itemStyle: { color: '#F56C6C' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initResponseTimeChart = () => {
  if (!responseTimeChart.value) return
  
  const chart = echarts.init(responseTimeChart.value)
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
        formatter: '{value}分钟'
      }
    },
    series: [
      {
        name: '响应时间',
        type: 'line',
        smooth: true,
        data: [3.8, 3.6, 3.5, 3.4, 3.3, 3.2],
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

const initFeedbackChart = () => {
  if (!feedbackChart.value) return
  
  const chart = echarts.init(feedbackChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}条 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '客户反馈',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 680, name: '好评', itemStyle: { color: '#67C23A' } },
          { value: 120, name: '中评', itemStyle: { color: '#E6A23C' } },
          { value: 25, name: '差评', itemStyle: { color: '#F56C6C' } },
          { value: 175, name: '建议', itemStyle: { color: '#409EFF' } }
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

const initWorkloadChart = () => {
  if (!workloadChart.value) return
  
  const chart = echarts.init(workloadChart.value)
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
      type: 'category',
      data: ['张三', '李四', '王五', '赵六', '钱七']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '处理订单数',
        type: 'bar',
        data: [185, 178, 165, 158, 152],
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

const initPerformanceTrendChart = () => {
  if (!performanceTrendChart.value) return
  
  const chart = echarts.init(performanceTrendChart.value)
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
        formatter: '{value}单/人'
      }
    },
    series: [
      {
        name: '人均订单',
        type: 'line',
        smooth: true,
        data: [35, 36, 37, 38, 39, 41],
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

const initTrainingChart = () => {
  if (!trainingChart.value) return
  
  const chart = echarts.init(trainingChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['培训次数', '培训时长', '员工满意度']
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
    yAxis: [
      {
        type: 'value',
        name: '次数/时长',
        position: 'left'
      },
      {
        type: 'value',
        name: '满意度',
        position: 'right',
        max: 5
      }
    ],
    series: [
      {
        name: '培训次数',
        type: 'bar',
        data: [4, 5, 4, 6, 5, 6],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '培训时长',
        type: 'line',
        smooth: true,
        data: [12, 15, 12, 18, 15, 18],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '员工满意度',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [4.0, 4.1, 4.1, 4.2, 4.2, 4.2],
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  chart.setOption(option)
}

watch(viewMode, async (newMode) => {
  await nextTick()
  
  if (newMode === 'efficiency') {
    initTableUtilizationChart()
    initPeakHoursChart()
    initOrderProcessingChart()
    initCookingSpeedChart()
    initEfficiencyTrendChart()
  } else if (newMode === 'cost') {
    initCostCompositionChart()
    initCostTrendChart()
    initUnitCostChart()
    initCostBenefitChart()
  } else if (newMode === 'quality') {
    initSatisfactionTrendChart()
    initComplaintRateChart()
    initResponseTimeChart()
    initFeedbackChart()
  } else if (newMode === 'staff') {
    initWorkloadChart()
    initPerformanceTrendChart()
    initTrainingChart()
  }
})

onMounted(async () => {
  await nextTick()
  initTableUtilizationChart()
  initPeakHoursChart()
  initOrderProcessingChart()
  initCookingSpeedChart()
  initEfficiencyTrendChart()
})
</script>

<style scoped lang="scss">
.operational-analytics {
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

    .efficiency-metric-card,
    .cost-metric-card,
    .quality-metric-card,
    .staff-metric-card {
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

    .cost-suggestions,
    .scheduling-suggestions {
      max-height: 350px;
      overflow-y: auto;
    }

    .quality-scores {
      .score-item {
        padding: 15px;
        background: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 10px;

        .score-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }

        .score-value {
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
</style>
