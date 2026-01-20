<template>
  <div class="dashboard">
    <!-- 页面标题和操作栏 -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">经营数据看板</h1>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="onDateRangeChange"
            style="margin-right: 12px;"
          />
          <el-button type="primary" @click="refreshData">
            <i class="icon-refresh"></i>
            刷新数据
          </el-button>
          <el-button @click="exportReport">
            <i class="icon-download"></i>
            导出报表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <MetricCard
        title="总收入"
        :value="coreMetrics.totalRevenue"
        :change="coreMetrics.revenueChange || 0"
        change-type="increase"
        icon="money"
        color="success"
        :loading="metricsLoading"
      />
      <MetricCard
        title="订单数"
        :value="coreMetrics.totalOrders"
        :change="coreMetrics.orderChange || 0"
        change-type="increase"
        icon="shopping-cart"
        color="primary"
        :loading="metricsLoading"
      />
      <MetricCard
        title="平均客单价"
        :value="coreMetrics.averageOrderValue"
        change="0"
        change-type="neutral"
        icon="chart-line"
        color="warning"
        :loading="metricsLoading"
      />
      <MetricCard
        title="客户数量"
        :value="coreMetrics.customerCount"
        change="0"
        change-type="neutral"
        icon="users"
        color="info"
        :loading="metricsLoading"
      />
    </div>

    <!-- 快捷操作和待办事项 -->
    <div class="quick-actions-section">
      <div class="quick-actions-wrapper">
        <QuickActions />
      </div>
      <div class="todo-list-wrapper">
        <TodoList />
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- 营收趋势图 -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>营收趋势</h3>
            <el-radio-group v-model="revenuePeriod" size="small" @change="loadRevenueData">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
            </el-radio-group>
          </div>
          <RevenueChart
            :data="revenueData.map(item => ({ date: item.date, revenue: item.amount }))"
            :period="revenuePeriod"
            :loading="revenueLoading"
          />
        </div>

        <!-- 订单状态分布 -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>订单状态分布</h3>
            <el-switch
              v-model="showRealTimeOrders"
              active-text="实时"
              inactive-text="历史"
              @change="loadOrderDistribution"
            />
          </div>
          <OrderStatusChart
            :data="orderDistribution"
            :real-time="showRealTimeOrders"
            :loading="orderDistributionLoading"
          />
        </div>
      </div>

      <div class="chart-row">
        <!-- 菜品销售排行 -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>菜品销售排行</h3>
            <el-select
              v-model="topDishesPeriod"
              placeholder="选择时间范围"
              size="small"
              @change="loadTopDishes"
            >
              <el-option label="今日" value="today" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
            </el-select>
          </div>
          <TopDishesChart
            :data="topDishes"
            :loading="topDishesLoading"
          />
        </div>

        <!-- 客流量分析 -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>客流量分析</h3>
            <el-tooltip content="按小时段分析客流量分布" placement="top">
              <i class="icon-info"></i>
            </el-tooltip>
          </div>
          <CustomerFlowChart
            :data="customerFlow"
            :loading="customerFlowLoading"
          />
        </div>
      </div>
    </div>

    <!-- 实时监控区域 -->
    <div class="monitoring-section">
      <div class="section-header">
        <h3>实时运营监控</h3>
        <div class="status-indicator">
          <div class="indicator-dot" :class="{ active: isMonitoringActive }"></div>
          <span>{{ isMonitoringActive ? '监控中' : '监控暂停' }}</span>
        </div>
      </div>

      <div class="monitoring-grid">
        <!-- 实时订单 -->
        <div class="monitoring-card">
          <div class="card-header">
            <h4>实时订单</h4>
            <el-badge :value="pendingOrdersCount" :max="99" class="pending-badge">
              <i class="icon-orders"></i>
            </el-badge>
          </div>
          <div class="card-content">
            <div class="order-list">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="order-item"
                :class="`status-${order.status}`"
              >
                <div class="order-info">
                  <span class="order-number">{{ order.id }}</span>
                  <span class="customer-name">{{ order.customerName || '未指定' }}</span>
                  <span class="table-number">桌号{{ order.tableNumber }}</span>
                </div>
                <div class="order-meta">
                  <span class="order-amount">¥{{ order.total || 0 }}</span>
                  <span class="order-time">{{ formatDateTime(order.createdAt) }}</span>
                  <el-button
                    size="small"
                    type="primary"
                    @click="viewOrderDetail(order.id)"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
            <div v-if="recentOrders.length === 0" class="no-data">
              暂无新订单
            </div>
          </div>
        </div>

        <!-- 厨房状态 -->
        <div class="monitoring-card">
          <div class="card-header">
            <h4>厨房状态</h4>
            <el-badge :value="busyCount" :max="99" class="kitchen-badge">
              <i class="icon-kitchen"></i>
            </el-badge>
          </div>
          <div class="card-content">
            <div class="kitchen-stats">
              <div class="stat-item">
                <span class="stat-label">进行中</span>
                <span class="stat-value">{{ kitchenMetrics.inProgress }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">待制作</span>
                <span class="stat-value">{{ kitchenMetrics.pending }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已完成</span>
                <span class="stat-value">{{ kitchenMetrics.completed }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均制作时间</span>
                <span class="stat-value">{{ kitchenMetrics.avgPrepTime }}分钟</span>
              </div>
            </div>
            <div class="kitchen-progress">
              <el-progress
                :percentage="kitchenUtilization"
                :color="getKitchenUtilizationColor(kitchenUtilization)"
                :format="formatKitchenUtilization"
              />
            </div>
          </div>
        </div>

        <!-- 桌台占用情况 -->
        <div class="monitoring-card">
          <div class="card-header">
            <h4>桌台占用情况</h4>
            <el-button size="small" @click="refreshTableStatus">
              <i class="icon-refresh"></i>
            </el-button>
          </div>
          <div class="card-content">
            <div class="table-stats">
              <div class="table-grid">
                <div
                  v-for="table in tableStatus"
                  :key="table.id"
                  class="table-item"
                  :class="getTableStatusClass(table.status)"
                  @click="viewTableDetail(table)"
                >
                  <div class="table-number">{{ table.number }}</div>
                  <div class="table-status">{{ getTableStatusText(table.status) }}</div>
                  <div v-if="table.status === 'occupied'" class="occupied-time">
                    占用中
                  </div>
                </div>
              </div>
            </div>
            <div class="table-summary">
              <div class="summary-item">
                <span>占用率: {{ tableOccupancyRate }}%</span>
              </div>
              <div class="summary-item">
                <span>空闲: {{ tableStats.available }} 桌</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警信息 -->
    <div v-if="alerts.length > 0" class="alerts-section">
      <div class="section-header">
        <h3>系统预警</h3>
        <el-button size="small" @click="clearAllAlerts">
          清除所有
        </el-button>
      </div>
      <div class="alerts-list">
        <el-alert
          v-for="alert in alerts"
          :key="alert.id"
          :title="alert.title"
          :description="alert.message"
          :type="alert.type"
          :closable="true"
          @close="dismissAlert(alert.id)"
          show-icon
        />
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <OrderDetailDialog
      v-model="showOrderDetail"
      :order-id="selectedOrderId"
      @order-updated="onOrderUpdated"
    />

    <!-- 性能监控仪表板 - 开发环境显示 -->
    <!-- <PerformanceMonitor
      v-if="showPerformanceMonitor"
      :auto-start="true"
      :show-logs="false"
      class="performance-monitor-dashboard"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MetricCard from '@/components/MetricCard.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import TodoList from '@/components/dashboard/TodoList.vue'
import RevenueChart from '@/components/charts/RevenueChart.vue'
import OrderStatusChart from '@/components/charts/OrderStatusChart.vue'
import TopDishesChart from '@/components/charts/TopDishesChart.vue'
import CustomerFlowChart from '@/components/charts/CustomerFlowChart.vue'
import OrderDetailDialog from '@/components/OrderDetailDialog.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useTableStore } from '@/stores/table'
import { useAlertStore } from '@/stores/alert'
import { useKitchenStore } from '@/stores/kitchen'
import type { Order, Table } from '@/types/dashboard'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const dashboardStore = useDashboardStore()
const tableStore = useTableStore()
const alertStore = useAlertStore()
const kitchenStore = useKitchenStore()

// 响应式状态
const dateRange = ref<[string, string]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  new Date().toISOString().split('T')[0]
])
const revenuePeriod = ref('day')
const showRealTimeOrders = ref(true)
const topDishesPeriod = ref('today')
const isMonitoringActive = ref(true)
const showOrderDetail = ref(false)
const selectedOrderId = ref('')

// 性能监控状态

// 加载状态
const metricsLoading = ref(false)
const revenueLoading = ref(false)
const orderDistributionLoading = ref(false)
const topDishesLoading = ref(false)
const customerFlowLoading = ref(false)

// 计算属性
const coreMetrics = computed(() => dashboardStore.coreMetrics)
const revenueData = computed(() => dashboardStore.revenueData)
const orderDistribution = computed(() => dashboardStore.orderDistribution)
const topDishes = computed(() => dashboardStore.topDishes)
const customerFlow = computed(() => dashboardStore.customerFlow)
const recentOrders = computed(() => dashboardStore.recentOrders)
const tableStatus = computed(() => tableStore.tableStatus)
const alerts = computed(() => alertStore.alerts)

// 厨房统计数据模拟
const kitchenMetrics = computed(() => ({
  inProgress: kitchenStore.kitchenStats.inProgress,
  pending: kitchenStore.kitchenStats.pending,
  completed: kitchenStore.kitchenStats.completed,
  avgPrepTime: kitchenStore.kitchenStats.avgPrepTime
}))

const pendingOrdersCount = computed(() =>
  recentOrders.value.filter(order => ['pending', 'confirmed'].includes(order.status)).length
)

const busyCount = computed(() => kitchenMetrics.inProgress + kitchenMetrics.pending)

const kitchenUtilization = computed(() => {
  const total = kitchenMetrics.inProgress + kitchenMetrics.pending + kitchenMetrics.completed
  return total > 0 ? Math.round((kitchenMetrics.inProgress / total) * 100) : 0
})

const tableOccupancyRate = computed(() => {
  const total = tableStatus.value.length
  const occupied = tableStatus.value.filter(table => table.status === 'occupied').length
  return total > 0 ? Math.round((occupied / total) * 100) : 0
})

const tableStats = computed(() => ({
  available: tableStatus.value.filter(table => table.status === 'available').length,
  occupied: tableStatus.value.filter(table => table.status === 'occupied').length,
  reserved: tableStatus.value.filter(table => table.status === 'reserved').length
}))

// 方法
const onDateRangeChange = () => {
  loadAllData()
}

const refreshData = async () => {
  try {
    await Promise.all([
      loadCoreMetrics(),
      loadRevenueData(),
      loadOrderDistribution(),
      loadTopDishes(),
      loadCustomerFlow()
    ])

    ElMessage.success('数据刷新成功')
  } catch (error: any) {
    ElMessage.error('数据刷新失败')
  }
}

const exportReport = async () => {
  try {
    await dashboardStore.exportReport('excel', {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    })
    ElMessage.success('报表导出成功')
  } catch (error) {
    ElMessage.error('报表导出失败')
  }
}

const loadCoreMetrics = async () => {
  try {
    metricsLoading.value = true
    await Promise.all([
      dashboardStore.loadDashboardData({
        startDate: dateRange.value[0],
        endDate: dateRange.value[1]
      }),
      kitchenStore.loadKitchenStats()
    ])
  } finally {
    metricsLoading.value = false
  }
}

const loadRevenueData = async () => {
  try {
    revenueLoading.value = true
    await dashboardStore.loadDashboardData({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      period: revenuePeriod.value as 'day' | 'week' | 'month'
    })
  } finally {
    revenueLoading.value = false
  }
}

const loadOrderDistribution = async () => {
  try {
    orderDistributionLoading.value = true
    await dashboardStore.loadDashboardData({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    })
  } finally {
    orderDistributionLoading.value = false
  }
}

const loadTopDishes = async () => {
  try {
    topDishesLoading.value = true
    await dashboardStore.loadDashboardData({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      period: topDishesPeriod.value as 'today' | 'week' | 'month'
    })
  } finally {
    topDishesLoading.value = false
  }
}

const loadCustomerFlow = async () => {
  try {
    customerFlowLoading.value = true
    await dashboardStore.loadDashboardData({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    })
  } finally {
    customerFlowLoading.value = false
  }
}

const refreshTableStatus = async () => {
  await tableStore.refreshTableStatus()
}

const viewOrderDetail = (orderId: string) => {
  selectedOrderId.value = orderId
  showOrderDetail.value = true
}

const viewTableDetail = (table: Table) => {
  router.push(`/tables/${table.id}`)
}

const onOrderUpdated = () => {
  // 订单更新后刷新相关数据
  loadCoreMetrics()
  loadOrderDistribution()
}

const clearAllAlerts = () => {
  alertStore.clearAllAlerts()
}

const dismissAlert = (alertId: string) => {
  alertStore.dismissAlert(alertId)
}

const getKitchenUtilizationColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const formatKitchenUtilization = (percentage: number) => {
  return `厨房利用率 ${percentage}%`
}

const getTableStatusClass = (status: string) => {
  return `table-${status}`
}

const getTableStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    available: '空闲',
    occupied: '使用中',
    reserved: '已预订',
    maintenance: '维护中'
  }
  return statusMap[status] || '未知'
}

const formatTime = (time: string) => {
  return formatDateTime(time, 'HH:mm')
}

const formatOccupiedTime = (time: string) => {
  const now = new Date()
  const occupied = new Date(time)
  const diff = now.getTime() - occupied.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
}

const loadAllData = async () => {
  await Promise.all([
    loadCoreMetrics(),
    loadRevenueData(),
    loadOrderDistribution(),
    loadTopDishes(),
    loadCustomerFlow(),
    tableStore.loadTableStatus()
  ])
}

// WebSocket 连接用于实时数据更新
let wsConnection: WebSocket | null = null
let wsReconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 3

const connectWebSocket = () => {
  try {
    wsConnection = new WebSocket(`${import.meta.env?.VITE_WS_URL || 'ws://localhost:3000'}/dashboard`)

    wsConnection.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      await handleWebSocketMessage(data)
    }

    wsConnection.onclose = () => {
      // 断线重连逻辑
      if (wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        wsReconnectAttempts++
        setTimeout(connectWebSocket, 5000)
      } else {
        console.warn('WebSocket连接失败，已达到最大重连次数，切换到轮询模式')
        // 可以在这里启动轮询作为备用方案
      }
    }

    wsConnection.onerror = (error: Event) => {
      console.warn('WebSocket连接失败，将使用HTTP轮询获取实时数据:', error)
      // 不显示错误，只是警告
    }
  } catch (error: any) {
    console.warn('无法建立WebSocket连接，将使用HTTP轮询获取实时数据:', error)
    // 不显示错误，只是警告
  }
}

const handleWebSocketMessage = async (data: any) => {
      switch (data.type) {
        case 'new_order':
          dashboardStore.addOrder(data.payload as Order)
          break
        case 'order_updated':
          dashboardStore.updateOrderStatus(data.payload.id, data.payload.status)
          break
        case 'kitchen_update':
          // 暂时忽略厨房更新，因为store中没有此方法
          console.log('Kitchen update received:', data.payload)
          break
        case 'table_status_changed':
          tableStore.updateTableStatus(data.payload.id, data.payload.status)
          break
        case 'alert':
          alertStore.addAlert(data.payload)
          break
      }
    }

// 自动刷新定时器
let refreshTimer: NodeJS.Timeout | null = null

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }

  refreshTimer = setInterval(async () => {
    if (isMonitoringActive.value) {
      await loadAllData()
    }
  }, 30000) // 30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 生命周期
onMounted(async () => {
  // 加载初始数据
  await loadAllData()

  // 建立WebSocket连接
  connectWebSocket()

  // 启动自动刷新
  startAutoRefresh()
})

onUnmounted(() => {
  // 断开WebSocket连接
  if (wsConnection) {
    wsConnection.close()
  }

  // 停止自动刷新
  stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: var(--spacing-lg);
  background-color: var(--background-color-secondary);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color-primary);
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.charts-section {
  margin-bottom: var(--spacing-xl);

  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .chart-container {
    background-color: var(--background-color-primary);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);

    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);

      h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color-primary);
        margin: 0;
      }
    }
  }
}

.monitoring-section {
  background-color: var(--background-color-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);

    h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color-primary);
      margin: 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .indicator-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--text-color-tertiary);

        &.active {
          background-color: var(--success-color);
          animation: pulse 2s infinite;
        }
      }

      span {
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
      }
    }
  }

  .monitoring-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-lg);

    .monitoring-card {
      background-color: var(--background-color-secondary);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-md);
      border: 1px solid var(--border-color-light);

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-md);

        h4 {
          font-size: var(--font-size-md);
          font-weight: var(--font-weight-semibold);
          color: var(--text-color-primary);
          margin: 0;
        }

        .pending-badge :deep(.el-badge__content) {
          background-color: var(--warning-color);
        }

        .kitchen-badge :deep(.el-badge__content) {
          background-color: var(--error-color);
        }
      }

      .card-content {
        .order-list {
          max-height: 300px;
          overflow-y: auto;

          .order-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-sm);
            border-radius: var(--border-radius-sm);
            margin-bottom: var(--spacing-xs);
            background-color: var(--background-color-primary);

            &.status-pending {
              border-left: 3px solid var(--warning-color);
            }

            &.status-confirmed {
              border-left: 3px solid var(--primary-color);
            }

            &.status-preparing {
              border-left: 3px solid var(--info-color);
            }

            .order-info {
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);

              .order-number {
                font-weight: var(--font-weight-semibold);
                color: var(--text-color-primary);
              }

              .customer-name {
                color: var(--text-color-secondary);
              }

              .table-number {
                font-size: var(--font-size-sm);
                color: var(--text-color-tertiary);
              }
            }

            .order-meta {
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);

              .order-amount {
                font-weight: var(--font-weight-semibold);
                color: var(--success-color);
              }

              .order-time {
                font-size: var(--font-size-sm);
                color: var(--text-color-tertiary);
              }
            }
          }
        }

        .kitchen-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);

          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-sm);
            background-color: var(--background-color-primary);
            border-radius: var(--border-radius-sm);

            .stat-label {
              font-size: var(--font-size-sm);
              color: var(--text-color-secondary);
            }

            .stat-value {
              font-weight: var(--font-weight-semibold);
              color: var(--text-color-primary);
            }
          }
        }

        .kitchen-progress {
          margin-top: var(--spacing-md);
        }

        .table-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);

          .table-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--spacing-sm);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            transition: all var(--transition-duration-fast);

            &:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow-md);
            }

            &.table-available {
              background-color: var(--success-color-light);
              color: var(--success-color-dark);
            }

            &.table-occupied {
              background-color: var(--warning-color-light);
              color: var(--warning-color-dark);
            }

            &.table-reserved {
              background-color: var(--info-color-light);
              color: var(--info-color-dark);
            }

            &.table-maintenance {
              background-color: var(--error-color-light);
              color: var(--error-color-dark);
            }

            .table-number {
              font-weight: var(--font-weight-semibold);
              font-size: var(--font-size-md);
            }

            .table-status {
              font-size: var(--font-size-xs);
            }

            .occupied-time {
              font-size: var(--font-size-xs);
              margin-top: 2px;
            }
          }
        }

        .table-summary {
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-sm);
          background-color: var(--background-color-primary);
          border-radius: var(--border-radius-sm);

          .summary-item {
            font-size: var(--font-size-sm);
            color: var(--text-color-secondary);
          }
        }
      }

      .no-data {
        text-align: center;
        color: var(--text-color-tertiary);
        padding: var(--spacing-xl);
      }
    }
  }
}

.alerts-section {
  background-color: var(--background-color-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);

    h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color-primary);
      margin: 0;
    }
  }

  .alerts-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    :deep(.el-alert) {
      margin-bottom: 0;
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

// 响应式设计
@media (max-width: 1200px) {
  .charts-section .chart-row {
    grid-template-columns: 1fr;
  }

  .monitoring-section .monitoring-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: var(--spacing-md);
  }

  .dashboard-header .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);

    .header-actions {
      justify-content: center;
    }
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .monitoring-card .card-content .order-list .order-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }
}

// 性能监控仪表板样式
.performance-monitor-dashboard {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 300px;
  z-index: 9999;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);

  :deep(.performance-monitor) {
    .monitor-header {
      padding: 12px 16px;
      background: rgba(79, 70, 229, 0.05);
      border-radius: 12px 12px 0 0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 12px;

      .metric-card {
        padding: 8px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(79, 70, 229, 0.1);
        border-radius: 8px;

        .metric-header {
          margin-bottom: 4px;

          .metric-title {
            font-size: 12px;
            font-weight: 600;
          }

          .metric-grade {
            font-size: 10px;
            padding: 2px 6px;
          }
        }

        .metric-content {
          .metric-chart {
            height: 60px;

            .fps-display .fps-value {
              font-size: 1.2rem;
            }

            .network-stats .stat-item .stat-value {
              font-size: 1rem;
            }
          }

          .metric-details {
            .detail-item {
              font-size: 10px;

              .detail-label {
                font-size: 9px;
              }

              .detail-value {
                font-size: 10px;
              }
            }
          }
        }
      }
    }

    .suggestions-section {
      display: none; // 在迷你版本中隐藏建议
    }

    .logs-section {
      display: none; // 在迷你版本中隐藏日志
    }
  }
}

.quick-actions-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.quick-actions-wrapper,
.todo-list-wrapper {
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

@media (max-width: $breakpoint-lg) {
  .quick-actions-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: $breakpoint-md) {
  .quick-actions-section {
    gap: var(--spacing-md);
  }

  .quick-actions-wrapper,
  .todo-list-wrapper {
    padding: var(--spacing-md);
  }
}
</style>