<template>
  <div class="order-flow-visualization">
    <el-card class="flow-card">
      <template #header>
        <div class="card-header">
          <span>订单流程可视化</span>
          <div class="header-controls">
            <el-select
              v-model="selectedTimeRange"
              placeholder="时间范围"
              style="width: 150px; margin-right: 10px"
              @change="updateVisualization"
            >
              <el-option label="今天" value="today" />
              <el-option label="昨天" value="yesterday" />
              <el-option label="最近7天" value="week" />
              <el-option label="最近30天" value="month" />
            </el-select>
            <el-button @click="refreshData" :loading="loading">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 订单状态流程图 -->
      <div class="flow-diagram">
        <h3>订单状态流程</h3>
        <div class="status-flow">
          <div
            v-for="(status, index) in orderStatuses"
            :key="status.value"
            class="status-node"
            :class="{ active: statusCounts[status.value] > 0 }"
          >
            <div class="status-icon">
              <el-icon :size="24">
                <component :is="status.icon" />
              </el-icon>
            </div>
            <div class="status-info">
              <div class="status-name">{{ status.label }}</div>
              <div class="status-count">{{ statusCounts[status.value] || 0 }}单</div>
            </div>
            <div
              v-if="index < orderStatuses.length - 1"
              class="status-arrow"
            >
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单时间线 -->
      <div class="timeline-section">
        <h3>实时订单时间线</h3>
        <div class="timeline-container">
          <el-timeline>
            <el-timeline-item
              v-for="order in recentOrders"
              :key="order.id"
              :timestamp="formatDateTime(order.createdAt)"
              :type="getTimelineType(order.status)"
              placement="top"
            >
              <el-card class="timeline-order-card">
                <div class="timeline-order-header">
                  <span class="order-number">{{ order.orderNumber }}</span>
                  <el-tag :type="getStatusType(order.status)" size="small">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                </div>
                <div class="timeline-order-info">
                  <div>桌号: {{ order.tableNumber }}</div>
                  <div>客户: {{ order.customerName }}</div>
                  <div>金额: ¥{{ order.totalAmount }}</div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <!-- 流程统计图表 -->
      <div class="flow-stats">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <h4>订单状态分布</h4>
              <div ref="statusChartRef" class="chart"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <h4>订单处理时间</h4>
              <div ref="processingTimeChartRef" class="chart"></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { ArrowRight, Clock, Check, Warning, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { OrderAPI } from '@/api/order'
import type { Order } from '@/api/order'

const orderStatuses = [
  { value: 'pending', label: '待确认', icon: Clock },
  { value: 'confirmed', label: '已确认', icon: Check },
  { value: 'preparing', label: '制作中', icon: Warning },
  { value: 'ready', label: '待取餐', icon: CircleCheck },
  { value: 'completed', label: '已完成', icon: CircleCheck },
  { value: 'cancelled', label: '已取消', icon: CircleClose }
]

const selectedTimeRange = ref('today')
const loading = ref(false)
const statusChartRef = ref()
const processingTimeChartRef = ref()

const statusCounts = reactive<Record<string, number>>({})
const recentOrders = ref<Order[]>([])
const statusChart = ref()
const processingTimeChart = ref()

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    confirmed: 'primary',
    preparing: 'warning',
    ready: 'success',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    preparing: '制作中',
    ready: '待取餐',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

const getTimelineType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    confirmed: 'primary',
    preparing: 'warning',
    ready: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const loadOrderData = async () => {
  try {
    loading.value = true

    // 获取订单统计数据
    const statsResult = await OrderAPI.getOrderStats({
      timeRange: selectedTimeRange.value
    })

    if (statsResult.success && statsResult.data) {
      // 更新状态计数
      Object.keys(statusCounts).forEach(key => delete statusCounts[key])
      Object.assign(statusCounts, statsResult.data.statusCounts || {})
    }

    // 获取最近订单
    const ordersResult = await OrderAPI.getOrders({
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    if (ordersResult.success && ordersResult.data) {
      recentOrders.value = ordersResult.data.orders
    }
  } catch (error) {
    console.error('Load order data failed:', error)
    ElMessage.error('加载订单数据失败')
  } finally {
    loading.value = false
  }
}

const initStatusChart = () => {
  if (!statusChartRef.value) return

  statusChart.value = echarts.init(statusChartRef.value)

  const data = orderStatuses.map(status => ({
    name: status.label,
    value: statusCounts[status.value] || 0
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}单 ({d}%)'
    },
    series: [
      {
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
        data: data
      }
    ]
  }

  statusChart.value.setOption(option)
}

const initProcessingTimeChart = () => {
  if (!processingTimeChartRef.value) return

  processingTimeChart.value = echarts.init(processingTimeChartRef.value)

  // 模拟处理时间数据
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const avgTimes = hours.map(() => Math.floor(Math.random() * 30) + 10)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: hours.map(h => `${h}:00`),
      axisLabel: {
        formatter: '{value}'
      }
    },
    yAxis: {
      type: 'value',
      name: '平均处理时间(分钟)',
      axisLabel: {
        formatter: '{value}分钟'
      }
    },
    series: [
      {
        data: avgTimes,
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  processingTimeChart.value.setOption(option)
}

const updateVisualization = () => {
  loadOrderData().then(() => {
    nextTick(() => {
      initStatusChart()
      initProcessingTimeChart()
    })
  })
}

const refreshData = () => {
  updateVisualization()
}

onMounted(() => {
  loadOrderData().then(() => {
    nextTick(() => {
      initStatusChart()
      initProcessingTimeChart()
    })
  })

  // 响应式处理
  window.addEventListener('resize', () => {
    statusChart.value?.resize()
    processingTimeChart.value?.resize()
  })
})
</script>

<style scoped>
.order-flow-visualization {
  padding: 20px;
}

.flow-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.header-controls {
  display: flex;
  align-items: center;
}

.flow-diagram {
  margin-bottom: 30px;
}

.flow-diagram h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.status-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 10px;
  overflow-x: auto;
}

.status-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  position: relative;
}

.status-node.active {
  transform: scale(1.05);
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.status-node.active .status-icon {
  background: #409EFF;
  color: white;
}

.status-info {
  text-align: center;
}

.status-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.status-count {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.status-node.active .status-count {
  color: #409EFF;
}

.status-arrow {
  margin: 0 10px;
  color: #ccc;
  font-size: 24px;
  margin-top: -40px;
}

.timeline-section {
  margin-bottom: 30px;
}

.timeline-section h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.timeline-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}

.timeline-order-card {
  margin-bottom: 10px;
}

.timeline-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-number {
  font-weight: bold;
  color: #2c3e50;
}

.timeline-order-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.flow-stats h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.chart-container {
  text-align: center;
}

.chart-container h4 {
  margin-bottom: 15px;
  color: #666;
}

.chart {
  width: 100%;
  height: 300px;
}
</style>