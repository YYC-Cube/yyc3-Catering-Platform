<template>
  <div class="menu-analytics">
    <div class="analytics-header">
      <div class="header-title">
        <h3>菜单分析</h3>
        <p>优化菜单结构和定价策略</p>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button :type="viewMode === 'performance' ? 'primary' : 'default'" @click="viewMode = 'performance'">
            表现
          </el-button>
          <el-button :type="viewMode === 'profitability' ? 'primary' : 'default'" @click="viewMode = 'profitability'">
            盈利
          </el-button>
          <el-button :type="viewMode === 'optimization' ? 'primary' : 'default'" @click="viewMode = 'optimization'">
            优化
          </el-button>
          <el-button :type="viewMode === 'matrix' ? 'primary' : 'default'" @click="viewMode = 'matrix'">
            矩阵
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="showOptimizationDialog = true">
          <el-icon><MagicStick /></el-icon>
          优化建议
        </el-button>
      </div>
    </div>

    <div class="analytics-content">
      <div v-if="viewMode === 'performance'" class="performance-view">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card title="菜品销量排行">
              <el-table :data="topDishes" style="width: 100%" v-loading="loading">
                <el-table-column type="index" label="排名" width="80" />
                <el-table-column prop="dishName" label="菜品名称" />
                <el-table-column prop="categoryName" label="类别" width="100" />
                <el-table-column prop="sales" label="销量" width="100" sortable />
                <el-table-column prop="revenue" label="收入" width="120" sortable>
                  <template #default="{ row }">
                    ¥{{ row.revenue.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="rating" label="评分" width="100" sortable>
                  <template #default="{ row }">
                    <el-rate v-model="row.rating" disabled show-score />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="类别销售对比">
              <div ref="categorySalesChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="菜品评价分析">
              <div ref="ratingChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="菜品复购率">
              <div ref="repurchaseChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'profitability'" class="profitability-view">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in profitMetrics" :key="metric.key">
            <el-card class="profit-metric-card">
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
            <el-card title="类别毛利率分析">
              <div ref="categoryMarginChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="菜品毛利率排行">
              <el-table :data="highMarginDishes" style="width: 100%" max-height="350">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="dishName" label="菜品名称" />
                <el-table-column prop="margin" label="毛利率" width="100" sortable>
                  <template #default="{ row }">
                    <el-tag :type="row.margin >= 60 ? 'success' : row.margin >= 40 ? 'warning' : 'danger'" size="small">
                      {{ row.margin }}%
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="profit" label="利润" width="100" sortable>
                  <template #default="{ row }">
                    ¥{{ row.profit.toLocaleString() }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="成本结构分析">
              <div ref="costStructureChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'optimization'" class="optimization-view">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card title="滞销菜品识别">
              <el-table :data="slowMovingDishes" style="width: 100%">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="dishName" label="菜品名称" />
                <el-table-column prop="sales" label="销量" width="80" sortable />
                <el-table-column prop="daysSinceLastSale" label="未售天数" width="100" sortable />
                <el-table-column prop="inventory" label="库存" width="80" />
                <el-table-column label="建议操作" width="150">
                  <template #default="{ row }">
                    <el-button size="small" type="danger" @click="handleRemoveDish(row)">
                      下架
                    </el-button>
                    <el-button size="small" type="warning" @click="handlePromoteDish(row)">
                      促销
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="新菜品表现">
              <el-table :data="newDishes" style="width: 100%">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="dishName" label="菜品名称" />
                <el-table-column prop="launchDate" label="上线日期" width="120" />
                <el-table-column prop="sales" label="销量" width="80" sortable />
                <el-table-column prop="rating" label="评分" width="100">
                  <template #default="{ row }">
                    <el-rate v-model="row.rating" disabled show-score />
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'hot' ? 'success' : row.status === 'normal' ? 'warning' : 'danger'" size="small">
                      {{ row.status === 'hot' ? '热门' : row.status === 'normal' ? '正常' : '冷门' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="价格弹性分析">
              <div ref="priceElasticityChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card title="菜单结构优化建议">
              <div class="optimization-suggestions">
                <el-alert
                  v-for="(suggestion, index) in menuOptimizationSuggestions"
                  :key="index"
                  :title="suggestion.title"
                  :type="suggestion.type"
                  :description="suggestion.description"
                  :closable="false"
                  style="margin-bottom: 15px;"
                >
                  <template #default>
                    <div class="suggestion-content">
                      <div class="suggestion-title">{{ suggestion.title }}</div>
                      <div class="suggestion-description">{{ suggestion.description }}</div>
                      <div class="suggestion-impact">
                        <span class="impact-label">预期影响:</span>
                        <span :class="suggestion.impact > 0 ? 'positive' : 'negative'">
                          {{ suggestion.impact > 0 ? '+' : '' }}{{ suggestion.impact }}%
                        </span>
                      </div>
                    </div>
                  </template>
                </el-alert>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else-if="viewMode === 'matrix'" class="matrix-view">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card title="BCG矩阵分析">
              <div ref="bcgMatrixChart" class="large-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card title="明星菜品">
              <el-table :data="starDishes" style="width: 100%">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="dishName" label="菜品名称" />
                <el-table-column prop="marketShare" label="市场份额" width="100" sortable>
                  <template #default="{ row }">
                    {{ row.marketShare }}%
                  </template>
                </el-table-column>
                <el-table-column prop="growthRate" label="增长率" width="100" sortable>
                  <template #default="{ row }">
                    <span class="positive">+{{ row.growthRate }}%</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card title="问题菜品">
              <el-table :data="problemDishes" style="width: 100%">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="dishName" label="菜品名称" />
                <el-table-column prop="marketShare" label="市场份额" width="100" sortable>
                  <template #default="{ row }">
                    {{ row.marketShare }}%
                  </template>
                </el-table-column>
                <el-table-column prop="growthRate" label="增长率" width="100" sortable>
                  <template #default="{ row }">
                    <span class="negative">{{ row.growthRate }}%</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <el-dialog v-model="showOptimizationDialog" title="菜单优化建议" width="70%">
      <el-alert
        title="基于销售数据和客户反馈的智能建议"
        type="info"
        :closable="false"
        style="margin-bottom: 20px;"
      />

      <el-table :data="optimizationRecommendations" style="width: 100%">
        <el-table-column prop="type" label="建议类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRecommendationTypeColor(row.type)" size="small">
              {{ getRecommendationTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dishName" label="菜品名称" />
        <el-table-column prop="reason" label="建议原因" min-width="200" />
        <el-table-column prop="potentialImpact" label="预期影响" width="120">
          <template #default="{ row }">
            <span :class="row.potentialImpact > 0 ? 'positive' : 'negative'">
              {{ row.potentialImpact > 0 ? '+' : '' }}{{ row.potentialImpact }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.confidence" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleApplyRecommendation(row)">
              应用
            </el-button>
            <el-button size="small" @click="handleIgnoreRecommendation(row)">
              忽略
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showOptimizationDialog = false">关闭</el-button>
          <el-button type="primary" @click="handleApplyAllRecommendations">
            应用全部
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { MagicStick, Money, TrendCharts, PieChart } from '@element-plus/icons-vue'

interface TopDish {
  rank: number
  dishName: string
  categoryName: string
  sales: number
  revenue: number
  rating: number
}

interface ProfitMetric {
  key: string
  label: string
  value: string | number
  change: number
  icon: string
  color: string
}

interface HighMarginDish {
  dishName: string
  margin: number
  profit: number
}

interface SlowMovingDish {
  dishName: string
  sales: number
  daysSinceLastSale: number
  inventory: number
}

interface NewDish {
  dishName: string
  launchDate: string
  sales: number
  rating: number
  status: 'hot' | 'normal' | 'cold'
}

interface MenuOptimizationSuggestion {
  title: string
  type: 'success' | 'warning' | 'info'
  description: string
  impact: number
}

interface OptimizationRecommendation {
  type: string
  dishName: string
  reason: string
  potentialImpact: number
  confidence: number
}

interface StarDish {
  dishName: string
  marketShare: number
  growthRate: number
}

const loading = ref(false)
const viewMode = ref('performance')
const showOptimizationDialog = ref(false)

const categorySalesChart = ref()
const ratingChart = ref()
const repurchaseChart = ref()
const categoryMarginChart = ref()
const costStructureChart = ref()
const priceElasticityChart = ref()
const bcgMatrixChart = ref()

const topDishes = ref<TopDish[]>([
  { rank: 1, dishName: '红烧肉', categoryName: '热菜', sales: 580, revenue: 29000, rating: 4.8 },
  { rank: 2, dishName: '宫保鸡丁', categoryName: '热菜', sales: 520, revenue: 26000, rating: 4.7 },
  { rank: 3, dishName: '麻婆豆腐', categoryName: '热菜', sales: 480, revenue: 14400, rating: 4.6 },
  { rank: 4, dishName: '清蒸鱼', categoryName: '热菜', sales: 420, revenue: 25200, rating: 4.9 },
  { rank: 5, dishName: '糖醋排骨', categoryName: '热菜', sales: 380, revenue: 22800, rating: 4.5 }
])

const profitMetrics = ref<ProfitMetric[]>([
  {
    key: 'overallMargin',
    label: '整体毛利率',
    value: '52.3%',
    change: 2.1,
    icon: 'Money',
    color: '#67C23A'
  },
  {
    key: 'avgDishMargin',
    label: '平均菜品毛利率',
    value: '48.5%',
    change: 1.8,
    icon: 'TrendCharts',
    color: '#409EFF'
  },
  {
    key: 'costRatio',
    label: '成本占比',
    value: '47.7%',
    change: -1.5,
    icon: 'PieChart',
    color: '#E6A23C'
  },
  {
    key: 'profitGrowth',
    label: '利润增长率',
    value: '15.2%',
    change: 8.5,
    icon: 'Money',
    color: '#F56C6C'
  }
])

const highMarginDishes = ref<HighMarginDish[]>([
  { dishName: '清蒸鱼', margin: 72, profit: 18144 },
  { dishName: '红烧肉', margin: 68, profit: 19720 },
  { dishName: '宫保鸡丁', margin: 65, profit: 16900 },
  { dishName: '糖醋排骨', margin: 62, profit: 14136 },
  { dishName: '麻婆豆腐', margin: 58, profit: 8352 }
])

const slowMovingDishes = ref<SlowMovingDish[]>([
  { dishName: '凉拌黄瓜', sales: 15, daysSinceLastSale: 30, inventory: 50 },
  { dishName: '素炒豆芽', sales: 12, daysSinceLastSale: 25, inventory: 40 },
  { dishName: '清炒时蔬', sales: 10, daysSinceLastSale: 20, inventory: 35 },
  { dishName: '凉拌木耳', sales: 8, daysSinceLastSale: 18, inventory: 30 },
  { dishName: '素炒土豆丝', sales: 6, daysSinceLastSale: 15, inventory: 25 }
])

const newDishes = ref<NewDish[]>([
  { dishName: '香辣蟹', launchDate: '2024-12-01', sales: 180, rating: 4.7, status: 'hot' },
  { dishName: '水煮鱼', launchDate: '2024-12-05', sales: 150, rating: 4.6, status: 'hot' },
  { dishName: '干锅花菜', launchDate: '2024-12-10', sales: 95, rating: 4.4, status: 'normal' },
  { dishName: '蒜蓉粉丝蒸扇贝', launchDate: '2024-12-15', sales: 45, rating: 4.5, status: 'normal' },
  { dishName: '椒盐虾', launchDate: '2024-12-20', sales: 25, rating: 4.3, status: 'cold' }
])

const menuOptimizationSuggestions = ref<MenuOptimizationSuggestion[]>([
  {
    title: '下架滞销菜品',
    type: 'warning',
    description: '建议下架凉拌黄瓜、素炒豆芽等5款滞销菜品，可减少库存积压约¥2,500',
    impact: 3.2
  },
  {
    title: '推出春季特色菜品',
    type: 'success',
    description: '根据季节性需求，建议推出春笋炒肉、香椿炒蛋等春季特色菜品',
    impact: 8.5
  },
  {
    title: '调整热销菜品价格',
    type: 'info',
    description: '红烧肉、宫保鸡丁等热销菜品可适当提价3-5%，预计增加收入¥3,800',
    impact: 5.2
  },
  {
    title: '优化菜单结构',
    type: 'success',
    description: '增加凉菜和饮品品类，丰富菜单选择，提升客单价',
    impact: 6.8
  }
])

const optimizationRecommendations = ref<OptimizationRecommendation[]>([
  {
    type: 'remove',
    dishName: '凉拌黄瓜',
    reason: '近30天仅售15份，库存积压严重',
    potentialImpact: 2.5,
    confidence: 85
  },
  {
    type: 'price_up',
    dishName: '红烧肉',
    reason: '热销菜品，价格弹性低，可适当提价',
    potentialImpact: 3.2,
    confidence: 78
  },
  {
    type: 'promote',
    dishName: '香辣蟹',
    reason: '新菜品表现优秀，建议加大推广',
    potentialImpact: 5.8,
    confidence: 82
  },
  {
    type: 'bundle',
    dishName: '宫保鸡丁+米饭',
    reason: '组合套餐可提升客单价',
    potentialImpact: 4.5,
    confidence: 75
  },
  {
    type: 'new',
    dishName: '春笋炒肉',
    reason: '春季特色菜品，符合季节需求',
    potentialImpact: 6.2,
    confidence: 80
  }
])

const starDishes = ref<StarDish[]>([
  { dishName: '红烧肉', marketShare: 12.5, growthRate: 8.5 },
  { dishName: '宫保鸡丁', marketShare: 10.8, growthRate: 7.2 },
  { dishName: '清蒸鱼', marketShare: 9.5, growthRate: 9.8 },
  { dishName: '香辣蟹', marketShare: 5.2, growthRate: 15.6 }
])

const problemDishes = ref<StarDish[]>([
  { dishName: '凉拌黄瓜', marketShare: 0.8, growthRate: -15.2 },
  { dishName: '素炒豆芽', marketShare: 0.6, growthRate: -12.8 },
  { dishName: '清炒时蔬', marketShare: 0.5, growthRate: -10.5 },
  { dishName: '椒盐虾', marketShare: 0.3, growthRate: -8.2 }
])

const initCategorySalesChart = () => {
  if (!categorySalesChart.value) return
  
  const chart = echarts.init(categorySalesChart.value)
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
      data: ['甜点', '饮品', '汤品', '凉菜', '主食', '热菜']
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [520, 680, 920, 850, 1250, 1580],
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

const initRatingChart = () => {
  if (!ratingChart.value) return
  
  const chart = echarts.init(ratingChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}个'
    },
    series: [
      {
        name: '评分分布',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 320, name: '5星', itemStyle: { color: '#67C23A' } },
          { value: 480, name: '4星', itemStyle: { color: '#409EFF' } },
          { value: 150, name: '3星', itemStyle: { color: '#E6A23C' } },
          { value: 35, name: '2星', itemStyle: { color: '#F56C6C' } },
          { value: 15, name: '1星', itemStyle: { color: '#909399' } }
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

const initRepurchaseChart = () => {
  if (!repurchaseChart.value) return
  
  const chart = echarts.init(repurchaseChart.value)
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
      data: ['红烧肉', '宫保鸡丁', '麻婆豆腐', '清蒸鱼', '糖醋排骨']
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
        name: '复购率',
        type: 'bar',
        data: [65, 58, 52, 48, 45],
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

const initCategoryMarginChart = () => {
  if (!categoryMarginChart.value) return
  
  const chart = echarts.init(categoryMarginChart.value)
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
      data: ['凉菜', '汤品', '主食', '热菜', '饮品', '甜点']
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
        name: '毛利率',
        type: 'bar',
        data: [72, 68, 58, 52, 65, 75],
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

const initCostStructureChart = () => {
  if (!costStructureChart.value) return
  
  const chart = echarts.init(costStructureChart.value)
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
        name: '成本结构',
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

const initPriceElasticityChart = () => {
  if (!priceElasticityChart.value) return
  
  const chart = echarts.init(priceElasticityChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['价格', '销量']
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
        name: '价格',
        position: 'left',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '销量',
        position: 'right'
      }
    ],
    series: [
      {
        name: '价格',
        type: 'line',
        smooth: true,
        data: [50, 50, 52, 51, 53, 52],
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '销量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [480, 495, 470, 485, 460, 475],
        itemStyle: { color: '#409EFF' }
      }
    ]
  }
  chart.setOption(option)
}

const initBcgMatrixChart = () => {
  if (!bcgMatrixChart.value) return
  
  const chart = echarts.init(bcgMatrixChart.value)
  const data = [
    [12.5, 8.5, '红烧肉'],
    [10.8, 7.2, '宫保鸡丁'],
    [9.5, 9.8, '清蒸鱼'],
    [5.2, 15.6, '香辣蟹'],
    [0.8, -15.2, '凉拌黄瓜'],
    [0.6, -12.8, '素炒豆芽'],
    [8.5, 3.2, '糖醋排骨'],
    [6.8, 2.5, '麻婆豆腐']
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.data[2]}<br/>市场份额: ${params.data[0]}%<br/>增长率: ${params.data[1]}%`
      }
    },
    grid: {
      left: '3%',
      right: '7%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      name: '市场份额',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      splitLine: {
        show: false
      }
    },
    yAxis: {
      name: '增长率',
      nameLocation: 'middle',
      nameGap: 40,
      type: 'value',
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: 'BCG矩阵',
        type: 'scatter',
        data: data,
        symbolSize: (data: number[]) => {
          return Math.sqrt(data[0] * 10) * 8
        },
        itemStyle: (params: any) => {
          const growth = params.data[1]
          if (growth > 10) return { color: '#67C23A' }
          if (growth > 0) return { color: '#409EFF' }
          return { color: '#F56C6C' }
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.data[2]
        }
      }
    ]
  }
  chart.setOption(option)
}

const getRecommendationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    remove: '下架',
    price_up: '提价',
    promote: '推广',
    bundle: '套餐',
    new: '上新'
  }
  return typeMap[type] || type
}

const getRecommendationTypeColor = (type: string) => {
  const typeMap: Record<string, any> = {
    remove: 'danger',
    price_up: 'warning',
    promote: 'success',
    bundle: 'primary',
    new: 'info'
  }
  return typeMap[type] || ''
}

const handleRemoveDish = async (row: SlowMovingDish) => {
  try {
    await ElMessageBox.confirm(
      `确定要下架菜品"${row.dishName}"吗？`,
      '确认下架',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success('菜品已下架')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handlePromoteDish = async (row: SlowMovingDish) => {
  ElMessage.success(`已将"${row.dishName}"加入促销计划`)
}

const handleApplyRecommendation = async (row: OptimizationRecommendation) => {
  ElMessage.success(`已应用建议：${row.dishName}`)
}

const handleIgnoreRecommendation = async (row: OptimizationRecommendation) => {
  ElMessage.info(`已忽略建议：${row.dishName}`)
}

const handleApplyAllRecommendations = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要应用全部建议吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success('已应用全部建议')
    showOptimizationDialog.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

watch(viewMode, async (newMode) => {
  await nextTick()
  
  if (newMode === 'performance') {
    initCategorySalesChart()
    initRatingChart()
    initRepurchaseChart()
  } else if (newMode === 'profitability') {
    initCategoryMarginChart()
    initCostStructureChart()
  } else if (newMode === 'optimization') {
    initPriceElasticityChart()
  } else if (newMode === 'matrix') {
    initBcgMatrixChart()
  }
})

onMounted(async () => {
  await nextTick()
  initCategorySalesChart()
  initRatingChart()
  initRepurchaseChart()
})
</script>

<style scoped lang="scss">
.menu-analytics {
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

    .profit-metric-card {
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

    .optimization-suggestions {
      .suggestion-content {
        .suggestion-title {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        .suggestion-description {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }

        .suggestion-impact {
          font-size: 14px;

          .impact-label {
            color: #909399;
            margin-right: 8px;
          }

          .positive {
            color: #67c23a;
            font-weight: bold;
          }

          .negative {
            color: #f56c6c;
            font-weight: bold;
          }
        }
      }
    }

    .positive {
      color: #67c23a;
    }

    .negative {
      color: #f56c6c;
    }
  }
}
</style>
