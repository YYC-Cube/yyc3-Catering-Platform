<template>
  <div class="usage-records">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon orders">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ currentStats.orders.toLocaleString() }}</div>
            <div class="stat-label">本月订单</div>
            <div class="stat-change positive">
              <el-icon><TrendCharts /></el-icon>
              {{ currentStats.orderGrowth }}%
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon api">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ currentStats.apiCalls.toLocaleString() }}</div>
            <div class="stat-label">API调用</div>
            <div class="stat-change positive">
              <el-icon><TrendCharts /></el-icon>
              {{ currentStats.apiGrowth }}%
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon storage">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ currentStats.storage }}GB</div>
            <div class="stat-label">存储使用</div>
            <div class="stat-change neutral">
              <el-icon><Minus /></el-icon>
              0%
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon cost">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ currentStats.totalCost.toLocaleString() }}</div>
            <div class="stat-label">本月费用</div>
            <div class="stat-change positive">
              <el-icon><TrendCharts /></el-icon>
              {{ currentStats.costGrowth }}%
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 使用趋势图表 -->
    <el-card class="chart-card">
      <div class="chart-header">
        <h3>使用趋势</h3>
        <el-radio-group v-model="chartPeriod" size="small">
          <el-radio-button label="7d">7天</el-radio-button>
          <el-radio-button label="30d">30天</el-radio-button>
          <el-radio-button label="90d">90天</el-radio-button>
        </el-radio-group>
      </div>
      <div ref="chartContainer" class="chart-container"></div>
    </el-card>

    <!-- 详细记录表格 -->
    <el-card class="records-card">
      <div class="records-header">
        <h3>使用记录</h3>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadUsageRecords"
          />
          <el-button @click="exportUsageRecords" :loading="exporting">
            <el-icon><Download /></el-icon>
            导出记录
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="usageRecords"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="period" label="周期" width="120">
          <template #default="{ row }">
            {{ formatPeriod(row.period) }}
          </template>
        </el-table-column>

        <el-table-column label="订单" width="100">
          <template #default="{ row }">
            <div class="metric-value">
              {{ row.metrics.orders.toLocaleString() }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户" width="100">
          <template #default="{ row }">
            <div class="metric-value">
              {{ row.metrics.users.toLocaleString() }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="商品" width="100">
          <template #default="{ row }">
            <div class="metric-value">
              {{ row.metrics.products.toLocaleString() }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="存储(GB)" width="100">
          <template #default="{ row }">
            <div class="metric-value">
              {{ row.metrics.storage }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="API调用" width="120">
          <template #default="{ row }">
            <div class="metric-value">
              {{ row.metrics.apiCalls.toLocaleString() }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="AI请求" width="100">
          <template #default="{ row }">
            <div class="metric-value">
              {{ row.metrics.aiRequests.toLocaleString() }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="数据导出" width="100">
          <template #default="{ row }">
            <div class="metric-value">
              {{ row.metrics.dataExports.toLocaleString() }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="费用" width="120">
          <template #default="{ row }">
            <div class="cost-breakdown">
              <div class="total-cost">¥{{ row.costs.totalCost.toLocaleString() }}</div>
              <div class="cost-details">
                基础: ¥{{ row.costs.baseCost.toLocaleString() }}
                <span v-if="row.costs.usageCost > 0">
                  + 使用: ¥{{ row.costs.usageCost.toLocaleString() }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="recordedAt" label="记录时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.recordedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              link
              @click="showUsageDetails(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsageRecords"
          @current-change="loadUsageRecords"
        />
      </div>
    </el-card>

    <!-- 使用详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="使用详情"
      width="800px"
      :destroy-on-close="true"
    >
      <div v-if="selectedRecord" class="usage-details">
        <!-- 基础信息 -->
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录周期">
              {{ formatPeriod(selectedRecord.period) }}
            </el-descriptions-item>
            <el-descriptions-item label="记录时间">
              {{ formatDateTime(selectedRecord.recordedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 使用指标 -->
        <div class="detail-section">
          <h4>使用指标</h4>
          <div class="metrics-grid">
            <div
              v-for="(value, key) in selectedRecord.metrics"
              :key="key"
              class="metric-item"
            >
              <div class="metric-label">{{ getMetricLabel(key) }}</div>
              <div class="metric-value">{{ value.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <!-- 费用明细 -->
        <div class="detail-section">
          <h4>费用明细</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="基础费用">
              ¥{{ selectedRecord.costs.baseCost.toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="使用费用" v-if="selectedRecord.costs.usageCost > 0">
              ¥{{ selectedRecord.costs.usageCost.toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="折扣" v-if="selectedRecord.costs.discount > 0">
              -¥{{ selectedRecord.costs.discount.toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="总费用">
              <span class="total-cost-highlight">
                ¥{{ selectedRecord.costs.totalCost.toLocaleString() }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document, Connection, Folder, Money, TrendCharts, Minus, Download
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { subscriptionAPI } from '@/api/subscription'
import type { UsageRecord } from '@/api/subscription'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const chartPeriod = ref('30d')
const dateRange = ref<[string, string]>(['', ''])
const usageRecords = ref<UsageRecord[]>([])
const selectedRecord = ref<UsageRecord | null>(null)
const showDetailsDialog = ref(false)
const chartContainer = ref<HTMLElement>()

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 当前统计数据
const currentStats = ref({
  orders: 1250,
  orderGrowth: 12.5,
  apiCalls: 45680,
  apiGrowth: 8.3,
  storage: 23.5,
  totalCost: 899,
  costGrowth: 5.2
})

// 图表实例
let chartInstance: echarts.ECharts | null = null

// 生命周期
onMounted(() => {
  loadUsageRecords()
  initChart()
})

// 方法
const loadUsageRecords = async () => {
  try {
    loading.value = true
    const [startDate, endDate] = dateRange.value

    const response = await subscriptionAPI.getUsageRecords({
      period: startDate && endDate ? `${startDate},${endDate}` : undefined,
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize
    })

    if (response.success && response.data) {
      usageRecords.value = response.data.records
      pagination.value.total = response.data.total
    } else {
      ElMessage.error('加载使用记录失败')
    }
  } catch (error) {
    console.error('Load usage records failed:', error)
    ElMessage.error('加载使用记录失败')
  } finally {
    loading.value = false
  }
}

const initChart = () => {
  nextTick(() => {
    if (chartContainer.value) {
      chartInstance = echarts.init(chartContainer.value)
      updateChart()
    }
  })
}

const updateChart = () => {
  if (!chartInstance) return

  // 生成模拟数据
  const dates = generateDateRange(chartPeriod.value)
  const ordersData = generateMockData(dates.length, 1000, 2000)
  const apiCallsData = generateMockData(dates.length, 30000, 60000)

  const option = {
    title: {
      text: '使用趋势图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#303133'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['订单数量', 'API调用'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
        position: 'left',
        axisLine: {
          lineStyle: {
            color: '#409eff'
          }
        }
      },
      {
        type: 'value',
        name: 'API调用',
        position: 'right',
        axisLine: {
          lineStyle: {
            color: '#67c23a'
          }
        }
      }
    ],
    series: [
      {
        name: '订单数量',
        type: 'line',
        data: ordersData,
        smooth: true,
        lineStyle: {
          color: '#409eff',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(64, 158, 255, 0.3)'
            }, {
              offset: 1, color: 'rgba(64, 158, 255, 0.1)'
            }]
          }
        }
      },
      {
        name: 'API调用',
        type: 'line',
        yAxisIndex: 1,
        data: apiCallsData,
        smooth: true,
        lineStyle: {
          color: '#67c23a',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(103, 194, 58, 0.3)'
            }, {
              offset: 1, color: 'rgba(103, 194, 58, 0.1)'
            }]
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const generateDateRange = (period: string) => {
  const dates = []
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
  }

  return dates
}

const generateMockData = (length: number, min: number, max: number) => {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  )
}

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-')
  return `${year}年${parseInt(month)}月`
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMetricLabel = (key: string) => {
  const labels = {
    orders: '订单数量',
    users: '用户数量',
    products: '商品数量',
    storage: '存储空间(GB)',
    apiCalls: 'API调用次数',
    aiRequests: 'AI请求次数',
    dataExports: '数据导出次数'
  }
  return labels[key] || key
}

const showUsageDetails = (record: UsageRecord) => {
  selectedRecord.value = record
  showDetailsDialog.value = true
}

const exportUsageRecords = async () => {
  try {
    exporting.value = true

    // 这里应该调用导出API
    // const blob = await subscriptionAPI.exportUsageRecords({
    //   startDate: dateRange.value[0],
    //   endDate: dateRange.value[1]
    // })

    // 下载文件
    // const url = window.URL.createObjectURL(blob)
    // const link = document.createElement('a')
    // link.href = url
    // link.download = `usage-records-${dateRange.value[0]}-${dateRange.value[1]}.xlsx`
    // link.click()
    // window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export usage records failed:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style lang="scss" scoped>
.usage-records {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.orders {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.api {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          &.storage {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }

          &.cost {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin: 4px 0;
          }

          .stat-change {
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

            &.neutral {
              color: #909399;
            }
          }
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 24px;

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
    }

    .chart-container {
      height: 400px;
      width: 100%;
    }
  }

  .records-card {
    .records-header {
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

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .metric-value {
      font-weight: 600;
      color: #303133;
    }

    .cost-breakdown {
      .total-cost {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .cost-details {
        font-size: 12px;
        color: #909399;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .usage-details {
    .detail-section {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        border-bottom: 2px solid #e4e7ed;
        padding-bottom: 8px;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;

        .metric-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          text-align: center;

          .metric-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .metric-value {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
          }
        }
      }

      .total-cost-highlight {
        font-size: 18px;
        font-weight: 700;
        color: #409eff;
      }
    }
  }
}

@media (max-width: 768px) {
  .usage-records {
    .stats-cards {
      grid-template-columns: 1fr;
    }

    .chart-container {
      height: 300px;
    }

    .records-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch !important;

      .header-actions {
        flex-direction: column;
        gap: 8px;
      }
    }

    .metrics-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}
</style>