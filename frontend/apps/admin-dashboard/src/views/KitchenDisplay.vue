<!--
 YYC³餐饮管理系统 - 厨房显示组件
 依托: YYC³系统色设计令牌
-->
<template>
  <div class="kitchen-display">
    <div class="kitchen-header">
      <div class="header-left">
        <h2 class="kitchen-title">厨房显示</h2>
        <div class="kitchen-info">
          <el-tag type="info" size="small">
            <el-icon><Clock /></el-icon>
            {{ currentTime }}
          </el-tag>
          <el-tag type="success" size="small">
            <el-icon><Document /></el-icon>
            待处理: {{ pendingOrders.length }}
          </el-tag>
          <el-tag type="warning" size="small">
            <el-icon><Warning /></el-icon>
            进行中: {{ inProgressOrders.length }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button 
            :type="viewMode === 'orders' ? 'primary' : 'default'" 
            @click="viewMode = 'orders'"
          >
            <el-icon><List /></el-icon>
            订单视图
          </el-button>
          <el-button 
            :type="viewMode === 'stations' ? 'primary' : 'default'" 
            @click="viewMode = 'stations'"
          >
            <el-icon><Monitor /></el-icon>
            工位视图
          </el-button>
          <el-button 
            :type="viewMode === 'summary' ? 'primary' : 'default'" 
            @click="viewMode = 'summary'"
          >
            <el-icon><DataAnalysis /></el-icon>
            汇总视图
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="refreshOrders">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-if="viewMode === 'orders'" class="orders-view">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="order in sortedOrders" :key="order.id">
          <el-card class="order-card" :class="getOrderCardClass(order)">
            <template #header>
              <div class="order-card-header">
                <div class="order-info">
                  <span class="order-number">订单 #{{ order.orderNumber }}</span>
                  <el-tag :type="getPriorityType(order.priority)" size="small">
                    {{ order.priority }}
                  </el-tag>
                </div>
                <div class="order-time">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(order.orderTime) }}
                </div>
              </div>
            </template>
            <div class="order-content">
              <div class="customer-info">
                <el-icon><User /></el-icon>
                {{ order.customerName }}
              </div>
              <div class="order-items">
                <div v-for="item in order.items" :key="item.id" class="order-item">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-quantity">×{{ item.quantity }}</span>
                  <el-tag 
                    v-if="item.status" 
                    :type="getItemStatusType(item.status)" 
                    size="small"
                  >
                    {{ item.status }}
                  </el-tag>
                </div>
              </div>
              <div class="order-actions">
                <el-button 
                  v-if="order.status === 'pending'" 
                  type="primary" 
                  size="small"
                  @click="startOrder(order)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  开始制作
                </el-button>
                <el-button 
                  v-if="order.status === 'in_progress'" 
                  type="success" 
                  size="small"
                  @click="completeOrder(order)"
                >
                  <el-icon><Check /></el-icon>
                  完成制作
                </el-button>
                <el-button 
                  v-if="order.status === 'in_progress'" 
                  type="warning" 
                  size="small"
                  @click="pauseOrder(order)"
                >
                  <el-icon><VideoPause /></el-icon>
                  暂停
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-if="viewMode === 'stations'" class="stations-view">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="station in kitchenStations" :key="station.id">
          <el-card class="station-card">
            <template #header>
              <div class="station-header">
                <span class="station-name">{{ station.name }}</span>
                <el-tag :type="getStationStatusType(station.status)" size="small">
                  {{ station.status }}
                </el-tag>
              </div>
            </template>
            <div class="station-content">
              <div v-if="station.currentOrder" class="current-order">
                <div class="order-header">
                  <span class="order-number">订单 #{{ station.currentOrder.orderNumber }}</span>
                  <el-tag type="info" size="small">
                    {{ station.currentOrder.priority }}
                  </el-tag>
                </div>
                <div class="order-items">
                  <div v-for="item in station.currentOrder.items" :key="item.id" class="order-item">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-quantity">×{{ item.quantity }}</span>
                  </div>
                </div>
                <div class="order-actions">
                  <el-button 
                    v-if="station.currentOrder.status === 'in_progress'" 
                    type="success" 
                    size="small"
                    @click="completeStationOrder(station)"
                  >
                    <el-icon><Check /></el-icon>
                    完成
                  </el-button>
                </div>
              </div>
              <div v-else class="station-idle">
                <el-icon><CircleCheck /></el-icon>
                <p>工位空闲</p>
                <el-button type="primary" size="small" @click="assignOrder(station)">
                  <el-icon><Plus /></el-icon>
                  分配订单
                </el-button>
              </div>
              <div class="station-stats">
                <div class="stat-item">
                  <span class="stat-label">今日完成</span>
                  <span class="stat-value">{{ station.todayCompleted }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">平均用时</span>
                  <span class="stat-value">{{ station.avgTime }}分钟</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-if="viewMode === 'summary'" class="summary-view">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="summary-card">
            <template #header>
              <span>厨房运营汇总</span>
            </template>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="8">
                <div class="summary-item">
                  <div class="item-icon" style="background: #409EFF">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="item-content">
                    <div class="item-label">总订单数</div>
                    <div class="item-value">{{ totalOrders }}</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <div class="summary-item">
                  <div class="item-icon" style="background: #67C23A">
                    <el-icon><Check /></el-icon>
                  </div>
                  <div class="item-content">
                    <div class="item-label">已完成</div>
                    <div class="item-value">{{ completedOrders }}</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <div class="summary-item">
                  <div class="item-icon" style="background: #E6A23C">
                    <el-icon><Clock /></el-icon>
                  </div>
                  <div class="item-content">
                    <div class="item-label">平均用时</div>
                    <div class="item-value">{{ avgOrderTime }}分钟</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <div class="summary-item">
                  <div class="item-icon" style="background: #F56C6C">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="item-content">
                    <div class="item-label">超时订单</div>
                    <div class="item-value">{{ timeoutOrders }}</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <div class="summary-item">
                  <div class="item-icon" style="background: #909399">
                    <el-icon><TrendCharts /></el-icon>
                  </div>
                  <div class="item-content">
                    <div class="item-label">完成率</div>
                    <div class="item-value">{{ completionRate }}%</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <div class="summary-item">
                  <div class="item-icon" style="background: #67C23A">
                    <el-icon><Monitor /></el-icon>
                  </div>
                  <div class="item-content">
                    <div class="item-label">活跃工位</div>
                    <div class="item-value">{{ activeStations }}/{{ totalStations }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      v-model="showOrderDetail"
      title="订单详情"
      width="600px"
    >
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            #{{ selectedOrder.orderNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="客户姓名">
            {{ selectedOrder.customerName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ selectedOrder.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="订单时间">
            {{ formatTime(selectedOrder.orderTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(selectedOrder.priority)">
              {{ selectedOrder.priority }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getOrderStatusType(selectedOrder.status)">
              {{ selectedOrder.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="特殊要求" :span="2">
            {{ selectedOrder.specialRequests || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-items">
          <h4>订单明细</h4>
          <el-table :data="selectedOrder.items" border>
            <el-table-column prop="name" label="菜品名称" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column prop="status" label="制作状态">
              <template #default="{ row }">
                <el-tag :type="getItemStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="showOrderDetail = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showStationDialog"
      title="分配订单到工位"
      width="500px"
    >
      <el-form :model="stationForm" label-width="100px">
        <el-form-item label="选择工位">
          <el-select v-model="stationForm.stationId" placeholder="请选择工位">
            <el-option 
              v-for="station in availableStations" 
              :key="station.id" 
              :label="station.name" 
              :value="station.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStationDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmStationAssignment">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, Document, Warning, List, Monitor, DataAnalysis, Refresh, VideoPlay, Check, VideoPause, CircleCheck, Plus, TrendCharts, User } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

interface OrderItem {
  id: string
  name: string
  quantity: number
  status: 'pending' | 'in_progress' | 'completed'
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  orderTime: Date
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  items: OrderItem[]
  specialRequests?: string
}

interface KitchenStation {
  id: string
  name: string
  status: 'idle' | 'busy' | 'maintenance'
  currentOrder?: Order
  todayCompleted: number
  avgTime: number
}

const viewMode = ref<'orders' | 'stations' | 'summary'>('orders')
const currentTime = ref('')
const showOrderDetail = ref(false)
const showStationDialog = ref(false)
const selectedOrder = ref<Order | null>(null)
const stationForm = ref({
  stationId: ''
})

const orders = ref<Order[]>([])
const kitchenStations = ref<KitchenStation[]>([])

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
const inProgressOrders = computed(() => orders.value.filter(o => o.status === 'in_progress'))
const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
})

const totalOrders = computed(() => orders.value.length)
const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed').length)
const avgOrderTime = computed(() => {
  const completed = orders.value.filter(o => o.status === 'completed')
  if (completed.length === 0) return 0
  const totalTime = completed.reduce((sum, o) => {
    const duration = dayjs().diff(dayjs(o.orderTime), 'minute')
    return sum + duration
  }, 0)
  return Math.round(totalTime / completed.length)
})

const timeoutOrders = computed(() => {
  const threshold = 30
  return orders.value.filter(o => {
    const duration = dayjs().diff(dayjs(o.orderTime), 'minute')
    return o.status !== 'completed' && duration > threshold
  }).length
})

const completionRate = computed(() => {
  if (totalOrders.value === 0) return 0
  return ((completedOrders.value / totalOrders.value) * 100).toFixed(1)
})

const activeStations = computed(() => kitchenStations.value.filter(s => s.status === 'busy').length)
const totalStations = computed(() => kitchenStations.value.length)

const availableStations = computed(() => {
  return kitchenStations.value.filter(s => s.status === 'idle')
})

let timer: number | null = null

onMounted(() => {
  updateCurrentTime()
  timer = window.setInterval(updateCurrentTime, 1000)
  loadOrders()
  loadKitchenStations()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

function updateCurrentTime() {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

function loadOrders() {
  orders.value = generateMockOrders()
}

function loadKitchenStations() {
  kitchenStations.value = generateMockStations()
}

function generateMockOrders(): Order[] {
  return [
    {
      id: '1',
      orderNumber: 'ORD001',
      customerName: '张三',
      phone: '13800138000',
      orderTime: new Date(Date.now() - 5 * 60000),
      priority: 'high',
      status: 'pending',
      items: [
        { id: '1-1', name: '宫保鸡丁', quantity: 2, status: 'pending' },
        { id: '1-2', name: '鱼香肉丝', quantity: 1, status: 'pending' }
      ],
      specialRequests: '少放辣'
    },
    {
      id: '2',
      orderNumber: 'ORD002',
      customerName: '李四',
      phone: '13800138001',
      orderTime: new Date(Date.now() - 10 * 60000),
      priority: 'medium',
      status: 'in_progress',
      items: [
        { id: '2-1', name: '麻婆豆腐', quantity: 1, status: 'in_progress' },
        { id: '2-2', name: '水煮鱼', quantity: 2, status: 'pending' }
      ]
    },
    {
      id: '3',
      orderNumber: 'ORD003',
      customerName: '王五',
      phone: '13800138002',
      orderTime: new Date(Date.now() - 15 * 60000),
      priority: 'low',
      status: 'pending',
      items: [
        { id: '3-1', name: '回锅肉', quantity: 1, status: 'pending' }
      ]
    },
    {
      id: '4',
      orderNumber: 'ORD004',
      customerName: '赵六',
      phone: '13800138003',
      orderTime: new Date(Date.now() - 20 * 60000),
      priority: 'high',
      status: 'pending',
      items: [
        { id: '4-1', name: '红烧茄子', quantity: 2, status: 'pending' },
        { id: '4-2', name: '清炒时蔬', quantity: 1, status: 'pending' }
      ],
      specialRequests: '多放葱花'
    },
    {
      id: '5',
      orderNumber: 'ORD005',
      customerName: '孙七',
      phone: '13800138004',
      orderTime: new Date(Date.now() - 25 * 60000),
      priority: 'medium',
      status: 'in_progress',
      items: [
        { id: '5-1', name: '糖醋排骨', quantity: 1, status: 'completed' },
        { id: '5-2', name: '酸辣汤', quantity: 1, status: 'in_progress' }
      ]
    }
  ]
}

function generateMockStations(): KitchenStation[] {
  return [
    {
      id: '1',
      name: '工位1',
      status: 'busy',
      currentOrder: orders.value[1],
      todayCompleted: 15,
      avgTime: 18
    },
    {
      id: '2',
      name: '工位2',
      status: 'busy',
      currentOrder: orders.value[4],
      todayCompleted: 12,
      avgTime: 22
    },
    {
      id: '3',
      name: '工位3',
      status: 'idle',
      todayCompleted: 18,
      avgTime: 15
    },
    {
      id: '4',
      name: '工位4',
      status: 'idle',
      todayCompleted: 20,
      avgTime: 16
    }
  ]
}

function getOrderCardClass(order: Order): string {
  const classes = ['order-card']
  if (order.status === 'pending') {
    classes.push('order-pending')
  } else if (order.status === 'in_progress') {
    classes.push('order-in-progress')
  } else if (order.status === 'completed') {
    classes.push('order-completed')
  }
  return classes.join(' ')
}

function getPriorityType(priority: string): string {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

function getOrderStatusType(status: string): string {
  const types: Record<string, string> = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    paused: 'info'
  }
  return types[status] || 'info'
}

function getItemStatusType(status: string): string {
  const types: Record<string, string> = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success'
  }
  return types[status] || 'info'
}

function getStationStatusType(status: string): string {
  const types: Record<string, string> = {
    idle: 'success',
    busy: 'warning',
    maintenance: 'danger'
  }
  return types[status] || 'info'
}

function formatTime(time: Date): string {
  return dayjs(time).format('HH:mm')
}

function startOrder(order: Order) {
  order.status = 'in_progress'
  order.items.forEach(item => {
    if (item.status === 'pending') {
      item.status = 'in_progress'
    }
  })
  ElMessage.success(`订单 #${order.orderNumber} 开始制作`)
}

function completeOrder(order: Order) {
  order.status = 'completed'
  order.items.forEach(item => {
    item.status = 'completed'
  })
  ElMessage.success(`订单 #${order.orderNumber} 已完成`)
}

function pauseOrder(order: Order) {
  order.status = 'paused'
  ElMessage.info(`订单 #${order.orderNumber} 已暂停`)
}

function completeStationOrder(station: KitchenStation) {
  if (station.currentOrder) {
    station.currentOrder.status = 'completed'
    station.currentOrder.items.forEach(item => {
      item.status = 'completed'
    })
    station.currentOrder = undefined
    station.status = 'idle'
    station.todayCompleted++
    ElMessage.success(`工位 ${station.name} 订单已完成`)
  }
}

function assignOrder(station: KitchenStation) {
  showStationDialog.value = true
  stationForm.value.stationId = station.id
}

function confirmStationAssignment() {
  const station = kitchenStations.value.find(s => s.id === stationForm.value.stationId)
  if (station) {
    const pendingOrder = pendingOrders.value[0]
    if (pendingOrder) {
      station.currentOrder = pendingOrder
      station.status = 'busy'
      pendingOrder.status = 'in_progress'
      pendingOrder.items.forEach(item => {
        item.status = 'in_progress'
      })
      ElMessage.success(`订单 #${pendingOrder.orderNumber} 已分配到 ${station.name}`)
    }
  }
  showStationDialog.value = false
}

function refreshOrders() {
  loadOrders()
  loadKitchenStations()
  ElMessage.success('数据已刷新')
}

function viewOrderDetail(order: Order) {
  selectedOrder.value = order
  showOrderDetail.value = true
}
</script>

<style scoped lang="scss">
.kitchen-display {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.kitchen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .kitchen-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .kitchen-info {
      display: flex;
      gap: 10px;
    }
  }

  .header-right {
    display: flex;
    gap: 10px;
  }
}

.orders-view,
.stations-view,
.summary-view {
  margin-top: 20px;
}

.order-card {
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.order-pending {
    border-left: 4px solid #409EFF;
  }

  &.order-in-progress {
    border-left: 4px solid #E6A23C;
    background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  }

  &.order-completed {
    border-left: 4px solid #67C23A;
    opacity: 0.6;
  }
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .order-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .order-number {
      font-weight: 600;
      font-size: 16px;
    }
  }

  .order-time {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #909399;
    font-size: 14px;
  }
}

.order-content {
  .customer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    padding: 10px;
    background: #f0f9ff;
    border-radius: 4px;
    font-size: 14px;
    color: #409EFF;
  }

  .order-items {
    margin-bottom: 15px;

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .item-name {
        font-weight: 500;
      }

      .item-quantity {
        color: #909399;
      }
    }
  }

  .order-actions {
    display: flex;
    gap: 10px;
  }
}

.station-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .station-name {
    font-weight: 600;
    font-size: 16px;
  }
}

.station-content {
  .current-order {
    margin-bottom: 15px;
    padding: 15px;
    background: #fff7e6;
    border-radius: 4px;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ffe6e6;

      .order-number {
        font-weight: 600;
      }
    }

    .order-items {
      .order-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #ffe6e6;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .order-actions {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
  }

  .station-idle {
    text-align: center;
    padding: 30px;
    color: #909399;

    .el-icon {
      font-size: 48px;
      color: #67C23A;
      margin-bottom: 10px;
    }

    p {
      margin: 0;
      font-size: 16px;
    }
  }

  .station-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-bottom: 5px;
      }

      .stat-value {
        display: block;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}

.summary-card {
  .summary-item {
    display: flex;
    align-items: center;
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 8px;
    background: #f9fafc;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .item-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      .el-icon {
        font-size: 28px;
        color: white;
      }
    }

    .item-content {
      flex: 1;

      .item-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 5px;
      }

      .item-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}

.order-detail {
  .detail-items {
    margin-top: 20px;

    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
}

@media (max-width: 768px) {
  .kitchen-header {
    flex-direction: column;
    align-items: flex-start;

    .header-left,
    .header-right {
      width: 100%;
      justify-content: center;
    }

    .kitchen-info {
      flex-wrap: wrap;
    }
  }

  .order-card,
  .station-card {
    margin-bottom: 15px;
  }
}
</style>
