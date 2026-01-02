<template>
  <div class="data-analytics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>数据分析</h1>
          <p>全方位的业务数据洞察与分析</p>
        </div>
        <div class="header-actions">
          <el-select v-model="selectedDateRange" @change="onDateRangeChange" class="date-range-selector">
            <el-option label="今天" value="today" />
            <el-option label="昨天" value="yesterday" />
            <el-option label="本周" value="this_week" />
            <el-option label="上周" value="last_week" />
            <el-option label="本月" value="this_month" />
            <el-option label="上月" value="last_month" />
            <el-option label="本季度" value="this_quarter" />
            <el-option label="上季度" value="last_quarter" />
            <el-option label="本年" value="this_year" />
            <el-option label="上年" value="last_year" />
            <el-option label="自定义" value="custom" />
          </el-select>

          <el-date-picker
            v-if="selectedDateRange === 'custom'"
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onCustomDateChange"
            class="custom-date-picker"
          />

          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>

          <el-button @click="exportData">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>

          <el-button @click="showDashboardSettings = true">
            <el-icon><Setting /></el-icon>
            仪表板设置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-overview">
      <el-row :gutter="20">
        <el-col :span="6" v-for="metric in coreMetrics" :key="metric.key">
          <el-card class="metric-card" :class="metric.trend">
            <div class="metric-content">
              <div class="metric-icon" :style="{ backgroundColor: metric.color }">
                <el-icon :size="24">
                  <component :is="metric.icon" />
                </el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ formatMetricValue(metric.value, metric.format) }}</div>
                <div class="metric-label">{{ metric.label }}</div>
                <div class="metric-change" v-if="metric.change !== undefined">
                  <el-icon v-if="metric.change > 0"><ArrowUp /></el-icon>
                  <el-icon v-else-if="metric.change < 0"><ArrowDown /></el-icon>
                  <span>{{ Math.abs(metric.change) }}%</span>
                  <span class="change-period">较上期</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分析标签页 -->
    <el-tabs v-model="activeTab" @tab-change="onTabChange" class="analytics-tabs">
      <!-- 销售分析 -->
      <el-tab-pane label="销售分析" name="sales">
        <div class="tab-content">
          <div class="tab-header">
            <div class="tab-title">
              <h3>销售数据分析</h3>
              <p>深入了解销售趋势和收入表现</p>
            </div>
            <div class="tab-actions">
              <el-button-group>
                <el-button :type="salesView === 'overview' ? 'primary' : 'default'" @click="salesView = 'overview'">
                  总览
                </el-button>
                <el-button :type="salesView === 'trends' ? 'primary' : 'default'" @click="salesView = 'trends'">
                  趋势
                </el-button>
                <el-button :type="salesView === 'products' ? 'primary' : 'default'" @click="salesView = 'products'">
                  商品
                </el-button>
                <el-button :type="salesView === 'forecast' ? 'primary' : 'default'" @click="salesView = 'forecast'">
                  预测
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 销售总览 -->
          <div v-if="salesView === 'overview'" class="sales-overview">
            <el-row :gutter="20">
              <el-col :span="16">
                <el-card title="销售收入趋势">
                  <div ref="salesRevenueChart" class="chart-container"></div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card title="销售分布">
                  <div ref="salesDistributionChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <el-card title="按小时销售分析">
                  <div ref="hourlySalesChart" class="chart-container"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card title="支付方式分布">
                  <div ref="paymentMethodChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 销售趋势 -->
          <div v-else-if="salesView === 'trends'" class="sales-trends">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card title="销售趋势分析">
                  <div ref="salesTrendsChart" class="large-chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 商品销售 -->
          <div v-else-if="salesView === 'products'" class="product-sales">
            <el-row :gutter="20">
              <el-col :span="16">
                <el-card title="热销商品排行">
                  <el-table :data="topSellingItems" style="width: 100%">
                    <el-table-column prop="rank" label="排名" width="80" />
                    <el-table-column prop="itemName" label="商品名称" />
                    <el-table-column prop="quantity" label="销量" width="100" />
                    <el-table-column prop="revenue" label="收入" width="120">
                      <template #default="{ row }">
                        ¥{{ row.revenue.toLocaleString() }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="growth" label="增长" width="100">
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
                  <div ref="categorySalesChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 销售预测 -->
          <div v-else-if="salesView === 'forecast'" class="sales-forecast">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card title="销售预测">
                  <div ref="salesForecastChart" class="large-chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>

      <!-- 客户分析 -->
      <el-tab-pane label="客户分析" name="customer">
        <div class="tab-content">
          <div class="tab-header">
            <div class="tab-title">
              <h3>客户数据分析</h3>
              <p>了解客户行为和价值贡献</p>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-card title="客户增长趋势">
                <div ref="customerGrowthChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card title="客户分段">
                <div ref="customerSegmentsChart" class="chart-container"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="16">
              <el-card title="客户地理分布">
                <div ref="customerGeoChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card title="客户关键指标">
                <div class="customer-metrics">
                  <div class="metric-item">
                    <div class="metric-label">客户保留率</div>
                    <div class="metric-value">{{ customerMetrics.retention }}%</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">平均消费频次</div>
                    <div class="metric-value">{{ customerMetrics.frequency }}次/月</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">客户终身价值</div>
                    <div class="metric-value">¥{{ customerMetrics.ltv.toLocaleString() }}</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">满意度评分</div>
                    <div class="metric-value">{{ customerMetrics.satisfaction }}/5.0</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 菜单分析 -->
      <el-tab-pane label="菜单分析" name="menu">
        <div class="tab-content">
          <div class="tab-header">
            <div class="tab-title">
              <h3>菜单数据分析</h3>
              <p>优化菜单结构和定价策略</p>
            </div>
            <div class="tab-actions">
              <el-button @click="showMenuOptimization = true">
                <el-icon><MagicStick /></el-icon>
                菜单优化建议
              </el-button>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-card title="类别表现分析">
                <div ref="categoryPerformanceChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card title="盈利能力分析">
                <div ref="profitabilityChart" class="chart-container"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
              <el-card title="商品表现矩阵">
                <div ref="itemPerformanceMatrix" class="large-chart-container"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 运营分析 -->
      <el-tab-pane label="运营分析" name="operational">
        <div class="tab-content">
          <div class="tab-header">
            <div class="tab-title">
              <h3>运营数据分析</h3>
              <p>监控运营效率和服务质量</p>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-card title="桌位利用率">
                <div ref="tableUtilizationChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card title="员工效率">
                <div ref="staffEfficiencyChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card title="厨房效率">
                <div ref="kitchenEfficiencyChart" class="chart-container"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
              <el-card title="运营成本分析">
                <div ref="operationalCostsChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card title="服务质量指标">
                <div class="quality-metrics">
                  <div class="quality-item">
                    <div class="quality-label">平均评分</div>
                    <el-rate v-model="qualityMetrics.rating" disabled show-score />
                  </div>
                  <div class="quality-item">
                    <div class="quality-label">投诉率</div>
                    <div class="quality-value">{{ qualityMetrics.complaintRate }}%</div>
                  </div>
                  <div class="quality-item">
                    <div class="quality-label">解决时间</div>
                    <div class="quality-value">{{ qualityMetrics.resolutionTime }}分钟</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 预测分析 -->
      <el-tab-pane label="预测分析" name="predictive">
        <div class="tab-content">
          <div class="tab-header">
            <div class="tab-title">
              <h3>预测分析</h3>
              <p>基于历史数据的智能预测</p>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-card title="销量预测">
                <div ref="salesPredictionChart" class="chart-container"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card title="客户预测">
                <div ref="customerPredictionChart" class="chart-container"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
              <el-card title="需求预测与库存建议">
                <div ref="demandForecastChart" class="large-chart-container"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 仪表板设置对话框 -->
    <el-dialog v-model="showDashboardSettings" title="仪表板设置" width="80%">
      <div class="dashboard-settings">
        <el-form :model="dashboardSettings" label-width="120px">
          <el-form-item label="默认时间范围">
            <el-select v-model="dashboardSettings.defaultDateRange">
              <el-option label="今天" value="today" />
              <el-option label="本周" value="this_week" />
              <el-option label="本月" value="this_month" />
              <el-option label="本季度" value="this_quarter" />
            </el-select>
          </el-form-item>

          <el-form-item label="刷新间隔">
            <el-select v-model="dashboardSettings.refreshInterval">
              <el-option label="手动" :value="0" />
              <el-option label="5分钟" :value="5" />
              <el-option label="15分钟" :value="15" />
              <el-option label="30分钟" :value="30" />
              <el-option label="1小时" :value="60" />
            </el-select>
          </el-form-item>

          <el-form-item label="显示指标">
            <el-checkbox-group v-model="dashboardSettings.visibleMetrics">
              <el-checkbox label="revenue" border>收入</el-checkbox>
              <el-checkbox label="orders" border>订单</el-checkbox>
              <el-checkbox label="customers" border>客户</el-checkbox>
              <el-checkbox label="conversion" border>转化率</el-checkbox>
              <el-checkbox label="satisfaction" border>满意度</el-checkbox>
              <el-checkbox label="efficiency" border>效率</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDashboardSettings = false">取消</el-button>
          <el-button type="primary" @click="saveDashboardSettings">保存设置</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 菜单优化建议对话框 -->
    <el-dialog v-model="showMenuOptimization" title="菜单优化建议" width="70%">
      <div class="menu-optimization">
        <el-alert
          title="基于销售数据和客户反馈的智能建议"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <el-table :data="menuRecommendations" style="width: 100%">
          <el-table-column prop="type" label="建议类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getRecommendationTypeColor(row.type)">
                {{ getRecommendationTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="itemName" label="商品名称" />
          <el-table-column prop="reason" label="建议原因" />
          <el-table-column prop="potentialImpact" label="预期影响" width="120">
            <template #default="{ row }">
              <span :class="row.potentialImpact > 0 ? 'text-success' : 'text-danger'">
                {{ row.potentialImpact > 0 ? '+' : '' }}{{ row.potentialImpact }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="置信度" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.confidence" :stroke-width="6" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showMenuOptimization = false">关闭</el-button>
          <el-button type="primary" @click="applyMenuOptimization">应用建议</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Refresh,
  Download,
  Setting,
  ArrowUp,
  ArrowDown,
  TrendCharts,
  User,
  Money,
  ShoppingCart,
  Clock,
  MagicStick
} from '@element-plus/icons-vue'
import {
  getSalesAnalytics,
  getCustomerAnalytics,
  getMenuAnalytics,
  getOperationalAnalytics,
  getPredictiveAnalytics,
  getDashboardData,
  exportData as exportAnalyticsData,
  DateRange,
  AnalysisType
} from '@/api/analytics'

// 响应式数据
const loading = ref(false)
const activeTab = ref('sales')
const selectedDateRange = ref<DateRange>('this_month')
const customDateRange = ref<[Date, Date] | null>(null)
const salesView = ref('overview')
const showDashboardSettings = ref(false)
const showMenuOptimization = ref(false)

// 核心指标
const coreMetrics = ref([
  {
    key: 'revenue',
    label: '总收入',
    value: 125800,
    change: 12.5,
    format: 'currency',
    icon: 'Money',
    color: '#409EFF',
    trend: 'up'
  },
  {
    key: 'orders',
    label: '订单数',
    value: 1856,
    change: 8.3,
    format: 'number',
    icon: 'ShoppingCart',
    color: '#67C23A',
    trend: 'up'
  },
  {
    key: 'customers',
    label: '客户数',
    value: 342,
    change: -2.1,
    format: 'number',
    icon: 'User',
    color: '#E6A23C',
    trend: 'down'
  },
  {
    key: 'satisfaction',
    label: '满意度',
    value: 4.6,
    change: 3.2,
    format: 'rating',
    icon: 'TrendCharts',
    color: '#F56C6C',
    trend: 'up'
  }
])

// 热销商品
const topSellingItems = ref([
  { rank: 1, itemName: '宫保鸡丁', quantity: 342, revenue: 12680, growth: 15.2 },
  { rank: 2, itemName: '红烧肉', quantity: 286, revenue: 11240, growth: 8.7 },
  { rank: 3, itemName: '清蒸鲈鱼', quantity: 198, revenue: 15680, growth: -5.3 },
  { rank: 4, itemName: '麻婆豆腐', quantity: 174, revenue: 6980, growth: 12.1 },
  { rank: 5, itemName: '糖醋里脊', quantity: 156, revenue: 7240, growth: 6.4 }
])

// 客户指标
const customerMetrics = ref({
  retention: 78.5,
  frequency: 3.2,
  ltv: 2850,
  satisfaction: 4.6
})

// 质量指标
const qualityMetrics = ref({
  rating: 4.3,
  complaintRate: 2.1,
  resolutionTime: 15
})

// 菜单优化建议
const menuRecommendations = ref([
  {
    type: 'promote',
    itemName: '清蒸鲈鱼',
    reason: '高利润但销量下降',
    potentialImpact: 12.5,
    confidence: 85
  },
  {
    type: 'price_adjust',
    itemName: '红烧肉',
    reason: '需求旺盛可适当提价',
    potentialImpact: 8.3,
    confidence: 92
  },
  {
    type: 'improve',
    itemName: '麻婆豆腐',
    reason: '客户评分偏低',
    potentialImpact: -3.2,
    confidence: 76
  }
])

// 仪表板设置
const dashboardSettings = reactive({
  defaultDateRange: 'this_month',
  refreshInterval: 30,
  visibleMetrics: ['revenue', 'orders', 'customers', 'satisfaction']
})

// 图表引用
const chartRefs = {
  salesRevenueChart: ref<HTMLElement>(),
  salesDistributionChart: ref<HTMLElement>(),
  hourlySalesChart: ref<HTMLElement>(),
  paymentMethodChart: ref<HTMLElement>(),
  salesTrendsChart: ref<HTMLElement>(),
  categorySalesChart: ref<HTMLElement>(),
  salesForecastChart: ref<HTMLElement>(),
  customerGrowthChart: ref<HTMLElement>(),
  customerSegmentsChart: ref<HTMLElement>(),
  customerGeoChart: ref<HTMLElement>(),
  categoryPerformanceChart: ref<HTMLElement>(),
  profitabilityChart: ref<HTMLElement>(),
  itemPerformanceMatrix: ref<HTMLElement>(),
  tableUtilizationChart: ref<HTMLElement>(),
  staffEfficiencyChart: ref<HTMLElement>(),
  kitchenEfficiencyChart: ref<HTMLElement>(),
  operationalCostsChart: ref<HTMLElement>(),
  salesPredictionChart: ref<HTMLElement>(),
  customerPredictionChart: ref<HTMLElement>(),
  demandForecastChart: ref<HTMLElement>()
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initSalesCharts()
    initCustomerCharts()
    initMenuCharts()
    initOperationalCharts()
    initPredictiveCharts()
  })
}

// 初始化销售图表
const initSalesCharts = () => {
  // 销售收入趋势图
  if (chartRefs.salesRevenueChart.value) {
    const chart = echarts.init(chartRefs.salesRevenueChart.value)
    const option = {
      title: { text: '销售收入趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: { type: 'value' },
      series: [{
        data: [82000, 95000, 108000, 125000, 118000, 125800],
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 }
      }]
    }
    chart.setOption(option)
  }

  // 销售分布饼图
  if (chartRefs.salesDistributionChart.value) {
    const chart = echarts.init(chartRefs.salesDistributionChart.value)
    const option = {
      title: { text: '销售分布' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '50%',
        data: [
          { value: 10480, name: '堂食' },
          { value: 5280, name: '外带' },
          { value: 5340, name: '外卖' }
        ]
      }]
    }
    chart.setOption(option)
  }

  // 按小时销售分析
  if (chartRefs.hourlySalesChart.value) {
    const chart = echarts.init(chartRefs.hourlySalesChart.value)
    const option = {
      title: { text: '按小时销售分析' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
      },
      yAxis: { type: 'value' },
      series: [{
        data: [120, 180, 250, 380, 560, 820, 1200, 1800, 2200, 2800, 3200, 3500, 3800, 4200, 4500, 4800, 5200, 4800, 4200, 3800, 2800, 1800, 1200, 800],
        type: 'bar'
      }]
    }
    chart.setOption(option)
  }
}

// 初始化客户图表
const initCustomerCharts = () => {
  // 客户增长趋势
  if (chartRefs.customerGrowthChart.value) {
    const chart = echarts.init(chartRefs.customerGrowthChart.value)
    const option = {
      title: { text: '客户增长趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '新客户',
          type: 'bar',
          data: [45, 52, 48, 58, 63, 72]
        },
        {
          name: '老客户',
          type: 'bar',
          data: [180, 195, 210, 225, 240, 270]
        }
      ]
    }
    chart.setOption(option)
  }

  // 客户分段
  if (chartRefs.customerSegmentsChart.value) {
    const chart = echarts.init(chartRefs.customerSegmentsChart.value)
    const option = {
      title: { text: '客户分段' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'doughnut',
        radius: ['50%', '70%'],
        data: [
          { value: 68, name: 'VIP客户' },
          { value: 156, name: '常客' },
          { value: 95, name: '偶尔消费' },
          { value: 23, name: '新客户' }
        ]
      }]
    }
    chart.setOption(option)
  }
}

// 初始化菜单图表
const initMenuCharts = () => {
  // 类别表现分析
  if (chartRefs.categoryPerformanceChart.value) {
    const chart = echarts.init(chartRefs.categoryPerformanceChart.value)
    const option = {
      title: { text: '类别表现分析' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['热菜', '凉菜', '汤类', '主食', '饮品', '甜点']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: [45000, 28000, 15000, 12000, 18000, 7800]
        },
        {
          name: '利润',
          type: 'bar',
          data: [18000, 11200, 6000, 4800, 7200, 3120]
        }
      ]
    }
    chart.setOption(option)
  }

  // 盈利能力分析
  if (chartRefs.profitabilityChart.value) {
    const chart = echarts.init(chartRefs.profitabilityChart.value)
    const option = {
      title: { text: '盈利能力分析' },
      tooltip: { trigger: 'item' },
      radar: {
        indicator: [
          { name: '热菜', max: 100 },
          { name: '凉菜', max: 100 },
          { name: '汤类', max: 100 },
          { name: '主食', max: 100 },
          { name: '饮品', max: 100 },
          { name: '甜点', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{
          value: [85, 72, 65, 58, 78, 45],
          name: '利润率'
        }]
      }]
    }
    chart.setOption(option)
  }
}

// 初始化运营图表
const initOperationalCharts = () => {
  // 桌位利用率
  if (chartRefs.tableUtilizationChart.value) {
    const chart = echarts.init(chartRefs.tableUtilizationChart.value)
    const option = {
      title: { text: '桌位利用率' },
      tooltip: { formatter: '{a} <br/>{b}: {c}%' },
      series: [{
        name: '利用率',
        type: 'gauge',
        detail: { formatter: '{value}%' },
        data: [{ value: 78.5, name: '当前' }]
      }]
    }
    chart.setOption(option)
  }

  // 员工效率
  if (chartRefs.staffEfficiencyChart.value) {
    const chart = echarts.init(chartRefs.staffEfficiencyChart.value)
    const option = {
      title: { text: '员工效率' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['服务员A', '服务员B', '服务员C', '服务员D', '服务员E']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [85, 92, 78, 88, 95],
        itemStyle: { color: '#67C23A' }
      }]
    }
    chart.setOption(option)
  }

  // 厨房效率
  if (chartRefs.kitchenEfficiencyChart.value) {
    const chart = echarts.init(chartRefs.kitchenEfficiencyChart.value)
    const option = {
      title: { text: '厨房效率' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['备菜', '烹饪', '装盘', '出餐']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'line',
        data: [8.5, 12.3, 3.2, 2.1],
        smooth: true
      }]
    }
    chart.setOption(option)
  }
}

// 初始化预测图表
const initPredictiveCharts = () => {
  // 销量预测
  if (chartRefs.salesPredictionChart.value) {
    const chart = echarts.init(chartRefs.salesPredictionChart.value)
    const option = {
      title: { text: '销量预测' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '实际',
          type: 'line',
          data: [125800, null, null, null, null, null]
        },
        {
          name: '预测',
          type: 'line',
          data: [null, 132000, 138000, 142000, 145000, 150000],
          lineStyle: { type: 'dashed' }
        }
      ]
    }
    chart.setOption(option)
  }

  // 客户预测
  if (chartRefs.customerPredictionChart.value) {
    const chart = echarts.init(chartRefs.customerPredictionChart.value)
    const option = {
      title: { text: '客户预测' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [365, 378, 392, 405, 418, 432]
      }]
    }
    chart.setOption(option)
  }
}

// 事件处理函数
const onDateRangeChange = (value: DateRange) => {
  if (value !== 'custom') {
    customDateRange.value = null
    refreshData()
  }
}

const onCustomDateChange = (dates: [Date, Date]) => {
  if (dates) {
    refreshData()
  }
}

const onTabChange = (tabName: string) => {
  nextTick(() => {
    // 根据标签页初始化对应的图表
    switch (tabName) {
      case 'sales':
        initSalesCharts()
        break
      case 'customer':
        initCustomerCharts()
        break
      case 'menu':
        initMenuCharts()
        break
      case 'operational':
        initOperationalCharts()
        break
      case 'predictive':
        initPredictiveCharts()
        break
    }
  })
}

const refreshData = async () => {
  loading.value = true
  try {
    // 这里可以调用API获取数据
    // await getDashboardData({ dateRange: selectedDateRange.value })

    // 模拟数据更新
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 重新初始化图表
    initCharts()

    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

const exportData = async () => {
  try {
    await ElMessageBox.confirm('确定要导出数据分析报告吗？', '确认导出', {
      type: 'warning'
    })

    // 调用导出API
    // const result = await exportAnalyticsData({ type: AnalysisType.SALES, format: 'excel', dateRange: selectedDateRange.value })

    ElMessage.success('报告导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    }
  }
}

const saveDashboardSettings = () => {
  // 保存设置到本地存储
  localStorage.setItem('dashboardSettings', JSON.stringify(dashboardSettings))
  showDashboardSettings.value = false
  ElMessage.success('设置已保存')
}

const applyMenuOptimization = () => {
  ElMessage.success('菜单优化建议已应用')
  showMenuOptimization.value = false
}

// 工具函数
const formatMetricValue = (value: number, format: string) => {
  switch (format) {
    case 'currency':
      return `¥${value.toLocaleString()}`
    case 'number':
      return value.toLocaleString()
    case 'percentage':
      return `${value}%`
    case 'rating':
      return `${value.toFixed(1)}`
    default:
      return value.toString()
  }
}

const getRecommendationTypeColor = (type: string) => {
  const colors = {
    promote: 'success',
    improve: 'warning',
    remove: 'danger',
    price_adjust: 'info'
  }
  return colors[type] || 'info'
}

const getRecommendationTypeText = (type: string) => {
  const texts = {
    promote: '推广',
    improve: '改进',
    remove: '移除',
    price_adjust: '调价'
  }
  return texts[type] || type
}

// 监听窗口大小变化
const handleResize = () => {
  Object.values(chartRefs).forEach(ref => {
    if (ref.value) {
      const chart = echarts.getInstanceByDom(ref.value)
      if (chart) {
        chart.resize()
      }
    }
  })
}

// 生命周期
onMounted(() => {
  initCharts()

  // 加载保存的设置
  const savedSettings = localStorage.getItem('dashboardSettings')
  if (savedSettings) {
    Object.assign(dashboardSettings, JSON.parse(savedSettings))
  }

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

// 清理
const cleanup = () => {
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  Object.values(chartRefs).forEach(ref => {
    if (ref.value) {
      const chart = echarts.getInstanceByDom(ref.value)
      if (chart) {
        chart.dispose()
      }
    }
  })
}

// 在组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped lang="scss">
.data-analytics {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;

    .title-section {
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .date-range-selector {
        width: 120px;
      }

      .custom-date-picker {
        width: 240px;
      }
    }
  }
}

.metrics-overview {
  margin-bottom: 20px;

  .metric-card {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    &.up {
      border-left: 4px solid #67C23A;
    }

    &.down {
      border-left: 4px solid #F56C6C;
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
        color: white;
      }

      .metric-info {
        flex: 1;

        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;

          .change-period {
            color: #909399;
          }

          .text-success {
            color: #67C23A;
          }

          .text-danger {
            color: #F56C6C;
          }
        }
      }
    }
  }
}

.analytics-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  :deep(.el-tabs__header) {
    margin: 0;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-tabs__content) {
    padding: 20px;
  }

  .tab-content {
    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #EBEEF5;

      .tab-title {
        h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        p {
          margin: 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }
}

.chart-container {
  height: 300px;
  width: 100%;
}

.large-chart-container {
  height: 400px;
  width: 100%;
}

.customer-metrics {
  .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      border-bottom: none;
    }

    .metric-label {
      color: #606266;
      font-size: 14px;
    }

    .metric-value {
      font-weight: 600;
      color: #303133;
    }
  }
}

.quality-metrics {
  .quality-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .quality-label {
      margin-bottom: 8px;
      color: #606266;
      font-size: 14px;
    }

    .quality-value {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.dashboard-settings {
  .el-form-item {
    margin-bottom: 24px;
  }
}

.menu-optimization {
  .el-table {
    margin-top: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .data-analytics {
    padding: 16px;
  }

  .page-header .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .metrics-overview {
    .el-col {
      margin-bottom: 16px;
    }
  }

  .analytics-tabs .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .chart-container,
  .large-chart-container {
    height: 250px;
  }
}
</style>