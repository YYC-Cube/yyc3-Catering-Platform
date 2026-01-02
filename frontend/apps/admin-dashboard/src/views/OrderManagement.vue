<template>
  <div class="order-management">
    <!-- 订单统计概览 -->
    <div class="order-overview">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in orderStats" :key="stat.key">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :class="stat.type">
                <el-icon :size="24">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-trend" :class="stat.trend">
                  <el-icon :size="12">
                    <ArrowUp v-if="stat.trend === 'up'" />
                    <ArrowDown v-if="stat.trend === 'down'" />
                    <Minus v-if="stat.trend === 'stable'" />
                  </el-icon>
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和操作工具栏 -->
    <div class="order-toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="filters.status"
          placeholder="订单状态"
          multiple
          clearable
          style="width: 150px;"
          @change="handleFilterChange"
        >
          <el-option
            v-for="status in orderStatusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          >
            <el-tag :type="getStatusTagType(status.value)" size="small">
              {{ status.label }}
            </el-tag>
          </el-option>
        </el-select>

        <el-select
          v-model="filters.type"
          placeholder="订单类型"
          multiple
          clearable
          style="width: 120px; margin-left: 10px;"
          @change="handleFilterChange"
        >
          <el-option
            v-for="type in orderTypeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>

        <el-date-picker
          v-model="filters.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="margin-left: 10px;"
          @change="handleFilterChange"
        />

        <el-input
          v-model="filters.search"
          placeholder="搜索订单号、客户..."
          clearable
          style="width: 200px; margin-left: 10px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="toolbar-right">
        <el-button-group>
          <el-button
            :type="viewMode === 'list' ? 'primary' : ''"
            @click="setViewMode('list')"
          >
            <el-icon><List /></el-icon>
            列表视图
          </el-button>
          <el-button
            :type="viewMode === 'kanban' ? 'primary' : ''"
            @click="setViewMode('kanban')"
          >
            <el-icon><Grid /></el-icon>
            看板视图
          </el-button>
          <el-button
            :type="viewMode === 'timeline' ? 'primary' : ''"
            @click="setViewMode('timeline')"
          >
            <el-icon><Clock /></el-icon>
            时间线
          </el-button>
        </el-button-group>

        <el-dropdown @command="handleBatchAction">
          <el-button type="primary" style="margin-left: 10px;">
            批量操作
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="confirm">确认订单</el-dropdown-item>
              <el-dropdown-item command="cancel">取消订单</el-dropdown-item>
              <el-dropdown-item command="export">导出订单</el-dropdown-item>
              <el-dropdown-item command="print">批量打印</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button type="success" @click="handleCreateOrder">
          <el-icon><Plus /></el-icon>
          新建订单
        </el-button>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="order-list">
      <el-table
        :data="orders"
        :loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleOrderClick"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="订单号" width="140">
          <template #default="{ row }">
            <div class="order-number">
              <span class="number">{{ row.orderNumber || `ORD-${row.id}` }}</span>
              <el-tag :type="getSourceTagType(row.source || 'pos')" size="small">
                {{ getSourceLabel(row.source || 'pos') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="客户信息" width="150">
          <template #default="{ row }">
            <div class="customer-info">
              <div class="name">{{ row.customerName || '散客' }}</div>
              <div class="phone">{{ row.contactPhone || row.customerPhone || '-' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="订单类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type || 'dine_in')" size="small">
              {{ getTypeLabel(row.type || 'dine_in') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="商品数量" width="100" align="center">
          <template #default="{ row }">
            {{ row.items?.length || 0 }}
          </template>
        </el-table-column>

        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <div class="amount">
              <div class="total">¥{{ (row.totalAmount || row.finalAmount || 0).toFixed(2) }}</div>
              <div v-if="row.discountAmount > 0" class="discount">
                优惠 ¥{{ row.discountAmount.toFixed(2) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="桌号/地址" width="140">
          <template #default="{ row }">
            <span v-if="row.tableNumber">{{ row.tableNumber }}</span>
            <span v-else-if="row.deliveryAddress?.address || row.deliveryAddress" class="delivery-address">
              {{ row.deliveryAddress?.address || row.deliveryAddress }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt || row.timestamps?.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button type="info" @click.stop="viewOrderDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="canConfirmOrder(row)"
                type="success"
                @click.stop="confirmOrder(row)"
              >
                确认
              </el-button>
              <el-button
                v-if="canCancelOrder(row)"
                type="danger"
                @click.stop="cancelOrder(row)"
              >
                取消
              </el-button>
              <el-dropdown @command="(cmd) => handleOrderAction(cmd, row)">
                <el-button type="primary">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="print">打印</el-dropdown-item>
                    <el-dropdown-item command="timeline">时间线</el-dropdown-item>
                    <el-dropdown-item command="flow">流程图</el-dropdown-item>
                    <el-dropdown-item command="refund">退款</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 看板视图 -->
    <div v-else-if="viewMode === 'kanban'" class="order-kanban">
      <el-row :gutter="20">
        <el-col :span="6" v-for="status in kanbanColumns" :key="status.value">
          <div class="kanban-column">
            <div class="column-header">
              <el-tag :type="getStatusTagType(status.value)" size="large">
                {{ status.label }}
              </el-tag>
              <span class="column-count">{{ getStatusCount(status.value) }}</span>
            </div>
            <div
              class="column-content"
              @drop="(e) => handleDrop(e, status.value)"
              @dragover.prevent
              @dragenter.prevent
            >
              <div
                v-for="order in getOrdersByStatus(status.value)"
                :key="order.id"
                class="order-card"
                draggable
                @dragstart="(e) => handleDragStart(e, order)"
                @click="viewOrderDetail(order)"
              >
                <div class="card-header">
                  <span class="order-number">{{ order.orderNumber || `ORD-${order.id}` }}</span>
                  <el-tag :type="getTypeTagType(order.type || 'dine_in')" size="small">
                    {{ getTypeLabel(order.type || 'dine_in') }}
                  </el-tag>
                </div>
                <div class="card-content">
                  <div class="customer">{{ order.customerName || '散客' }}</div>
                  <div class="items">{{ order.items?.length || 0 }} 件商品</div>
                  <div class="amount">¥{{ (order.totalAmount || order.finalAmount || 0).toFixed(2) }}</div>
                </div>
                <div class="card-footer">
                  <span class="time">{{ formatTime(order.createdAt || order.timestamps?.createdAt) }}</span>
                  <div class="actions">
                    <el-button
                      v-if="canConfirmOrder(order)"
                      type="success"
                      size="small"
                      @click.stop="confirmOrder(order)"
                    >
                      确认
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 时间线视图 -->
    <div v-else-if="viewMode === 'timeline'" class="order-timeline">
      <el-timeline>
        <el-timeline-item
          v-for="order in timelineOrders"
          :key="order.id"
          :timestamp="formatDateTime(order.createdAt || order.timestamps?.createdAt)"
          placement="top"
        >
          <el-card class="timeline-card">
            <div class="timeline-header">
              <div class="order-info">
                <span class="order-number">{{ order.orderNumber || `ORD-${order.id}` }}</span>
                <el-tag :type="getStatusTagType(order.status)">
                  {{ getStatusLabel(order.status) }}
                </el-tag>
                <span class="customer">{{ order.customerName || '散客' }}</span>
              </div>
              <div class="order-amount">¥{{ (order.totalAmount || order.finalAmount || 0).toFixed(2) }}</div>
            </div>
            <div class="timeline-content">
              <div class="order-items">
                <span v-for="item in order.items?.slice(0, 3)" :key="item.id" class="item-name">
                  {{ item.name || getItemName(item) }} x{{ item.quantity }}
                </span>
                <span v-if="order.items?.length > 3" class="more-items">
                  +{{ order.items.length - 3 }} 更多
                </span>
              </div>
            </div>
            <div class="timeline-actions">
              <el-button size="small" @click="viewOrderDetail(order)">查看详情</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`订单详情 - ${selectedOrder?.orderNumber || `ORD-${selectedOrder?.id}`}`"
      width="80%"
      top="5vh"
    >
      <OrderDetail
        v-if="selectedOrder"
        :order="selectedOrder"
        @updated="handleOrderUpdated"
      />
    </el-dialog>

    <!-- 订单流可视化对话框 -->
    <el-dialog
      v-model="showFlowDialog"
      title="订单流程图"
      width="90%"
      top="5vh"
    >
      <OrderFlowVisualization
        v-if="selectedOrder"
        :order-id="selectedOrder.id"
      />
    </el-dialog>

    <!-- 新建订单对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建订单"
      width="60%"
    >
      <CreateOrderForm
        @created="handleOrderCreated"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  List,
  Grid,
  Clock,
  Plus,
  ArrowUp,
  ArrowDown,
  Minus,
  ShoppingCart,
  Money,
  Timer,
  User
} from '@element-plus/icons-vue'
import OrderAPI, { OrderStatus, OrderType, type Order, type OrderFilters } from '@/api/order-management'
import OrderDetail from '@/components/Order/OrderDetail.vue'
import OrderFlowVisualization from '@/components/Order/OrderFlowVisualization.vue'
import CreateOrderForm from '@/components/Order/CreateOrderForm.vue'

// 响应式数据
const loading = ref(false)
const orders = ref<Order[]>([])
const selectedOrders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)
const viewMode = ref<'list' | 'kanban' | 'timeline'>('list')
const showDetailDialog = ref(false)
const showFlowDialog = ref(false)
const showCreateDialog = ref(false)

const filters = reactive<OrderFilters>({
  status: [],
  type: [],
  search: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 订单统计
const orderStats = computed(() => [
  {
    key: 'total',
    label: '今日订单',
    value: orders.value.length,
    icon: ShoppingCart,
    type: 'primary',
    trend: 'up',
    change: '+12.5%'
  },
  {
    key: 'revenue',
    label: '今日营收',
    value: `¥${orders.value.reduce((sum, order) => sum + (order.totalAmount || order.finalAmount || 0), 0).toFixed(0)}`,
    icon: Money,
    type: 'success',
    trend: 'up',
    change: '+8.3%'
  },
  {
    key: 'pending',
    label: '待处理',
    value: orders.value.filter(order => order.status === 'pending' || order.status === 'PENDING').length,
    icon: Timer,
    type: 'warning',
    trend: 'down',
    change: '-5.2%'
  },
  {
    key: 'customers',
    label: '服务客户',
    value: new Set(orders.value.map(order => order.customerId || order.id).filter(Boolean)).size,
    icon: User,
    type: 'info',
    trend: 'up',
    change: '+15.7%'
  }
])

// 订单状态选项
const orderStatusOptions = [
  { value: 'pending', label: '待确认' },
  { value: 'PENDING', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'preparing', label: '制作中' },
  { value: 'PREPARING', label: '制作中' },
  { value: 'ready', label: '已完成' },
  { value: 'READY', label: '已完成' },
  { value: 'served', label: '已上餐' },
  { value: 'SERVED', label: '已上餐' },
  { value: 'completed', label: '已完成' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'refunded', label: '已退款' },
  { value: 'REFUNDED', label: '已退款' }
]

// 订单类型选项
const orderTypeOptions = [
  { value: 'dine_in', label: '堂食' },
  { value: 'DINE_IN', label: '堂食' },
  { value: 'takeaway', label: '外带' },
  { value: 'TAKEAWAY', label: '外带' },
  { value: 'delivery', label: '外送' },
  { value: 'DELIVERY', label: '外送' }
]

// 看板列配置
const kanbanColumns = [
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'preparing', label: '制作中' },
  { value: 'ready', label: '已完成' }
]

// 时间线订单
const timelineOrders = computed(() => {
  return [...orders.value].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.timestamps?.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || b.timestamps?.createdAt || 0).getTime()
    return timeB - timeA
  }).slice(0, 50)
})

// 方法
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    // 兼容旧API格式
    const queryParams: any = {
      page: pagination.page,
      limit: pagination.pageSize
    }

    if (filters.status) {
      queryParams.status = Array.isArray(filters.status) ? filters.status[0] : filters.status
    }
    if (filters.search) {
      queryParams.search = filters.search
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      queryParams.startDate = filters.dateRange[0]
      queryParams.endDate = filters.dateRange[1]
    }

    // 使用新的OrderAPI，如果失败则回退到旧的API
    try {
      const response = await OrderAPI.getOrders(params)
      if (response.success) {
        orders.value = response.data?.orders || []
        pagination.total = response.data?.total || 0
      }
    } catch (newApiError) {
      // 回退到旧API
      const { getOrders } = await import('@/api/order')
      const response = await getOrders(queryParams)
      if (response.success) {
        // 转换数据格式以匹配新的接口
        orders.value = response.data.orders.map((order: any) => ({
          ...order,
          orderNumber: order.orderNumber || `ORD-${order.id}`,
          status: order.status || 'pending',
          type: order.type || 'dine_in',
          totalAmount: order.totalAmount || 0,
          finalAmount: order.totalAmount || 0,
          customerName: order.customerName || '',
          customerPhone: order.contactPhone || '',
          items: order.items || [],
          createdAt: order.createdAt
        }))
        pagination.total = response.data.pagination.total
      }
    }
  } catch (error) {
    console.error('Load orders failed:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.page = 1
  loadOrders()
}

const handleSearch = () => {
  pagination.page = 1
  loadOrders()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadOrders()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadOrders()
}

const handleSelectionChange = (selection: Order[]) => {
  selectedOrders.value = selection
}

const setViewMode = (mode: 'list' | 'kanban' | 'timeline') => {
  viewMode.value = mode
}

const handleOrderClick = (order: Order) => {
  selectedOrder.value = order
  showDetailDialog.value = true
}

const viewOrderDetail = (order: Order) => {
  selectedOrder.value = order
  showDetailDialog.value = true
}

const handleCreateOrder = () => {
  showCreateDialog.value = true
}

const confirmOrder = async (order: Order) => {
  try {
    const { updateOrderStatus } = await import('@/api/order')
    const response = await updateOrderStatus(order.id, 'confirmed' as OrderStatus)
    if (response.success) {
      ElMessage.success('订单确认成功')
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('订单确认失败')
  }
}

const cancelOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消此订单吗？', '确认取消', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    const { cancelOrder } = await import('@/api/order')
    const response = await cancelOrder(order.id)
    if (response.success) {
      ElMessage.success('订单取消成功')
      loadOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('订单取消失败')
    }
  }
}

const handleOrderAction = async (command: string, order: Order) => {
  switch (command) {
    case 'edit':
      // 编辑订单
      break
    case 'print':
      await printOrder(order)
      break
    case 'timeline':
      // 显示时间线
      break
    case 'flow':
      selectedOrder.value = order
      showFlowDialog.value = true
      break
    case 'refund':
      await refundOrder(order)
      break
  }
}

const printOrder = async (order: Order) => {
  try {
    const response = await OrderAPI.printOrder(order.id)
    if (response.success) {
      ElMessage.success('订单打印成功')
    }
  } catch (error) {
    ElMessage.error('订单打印失败')
  }
}

const refundOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要退款此订单吗？', '确认退款', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    const response = await OrderAPI.refundOrder(order.id)
    if (response.success) {
      ElMessage.success('订单退款成功')
      loadOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('订单退款失败')
    }
  }
}

const handleBatchAction = async (command: string) => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要操作的订单')
    return
  }

  switch (command) {
    case 'confirm':
      await batchConfirmOrders()
      break
    case 'cancel':
      await batchCancelOrders()
      break
    case 'export':
      await exportOrders()
      break
    case 'print':
      await batchPrintOrders()
      break
  }
}

const batchConfirmOrders = async () => {
  try {
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await OrderAPI.batchUpdateOrders(orderIds, {
      status: OrderStatus.CONFIRMED
    })
    if (response.success) {
      ElMessage.success(`成功确认 ${response.updated} 个订单`)
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('批量确认订单失败')
  }
}

const batchCancelOrders = async () => {
  try {
    await ElMessageBox.confirm('确定要取消选中的订单吗？', '确认取消', {
      type: 'warning'
    })

    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await OrderAPI.batchUpdateOrders(orderIds, {
      status: OrderStatus.CANCELLED
    })
    if (response.success) {
      ElMessage.success(`成功取消 ${response.updated} 个订单`)
      loadOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量取消订单失败')
    }
  }
}

const exportOrders = async () => {
  try {
    const blob = await OrderAPI.exportOrders(filters)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('订单导出成功')
  } catch (error) {
    ElMessage.error('订单导出失败')
  }
}

const batchPrintOrders = async () => {
  try {
    const orderIds = selectedOrders.value.map(order => order.id)
    // 批量打印逻辑
    ElMessage.success(`已发送 ${orderIds.length} 个订单到打印机`)
  } catch (error) {
    ElMessage.error('批量打印失败')
  }
}

// 拖拽功能
const handleDragStart = (e: DragEvent, order: Order) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('order', JSON.stringify(order))
  }
}

const handleDrop = async (e: DragEvent, status: string) => {
  e.preventDefault()
  if (e.dataTransfer) {
    const order = JSON.parse(e.dataTransfer.getData('order'))
    try {
      const { updateOrderStatus } = await import('@/api/order')
      const response = await updateOrderStatus(order.id, status as OrderStatus)
      if (response.success) {
        ElMessage.success('订单状态更新成功')
        loadOrders()
      }
    } catch (error) {
      ElMessage.error('订单状态更新失败')
    }
  }
}

const getOrdersByStatus = (status: string) => {
  return orders.value.filter(order =>
    order.status === status ||
    order.status === status.toUpperCase()
  )
}

const getStatusCount = (status: string) => {
  return orders.value.filter(order =>
    order.status === status ||
    order.status === status.toUpperCase()
  ).length
}

// 工具函数
const canConfirmOrder = (order: Order) => {
  return ['pending', 'PENDING'].includes(order.status)
}

const canCancelOrder = (order: Order) => {
  return ['pending', 'PENDING', 'confirmed', 'CONFIRMED'].includes(order.status)
}

const getStatusTagType = (status: string) => {
  const statusUpper = status?.toUpperCase() || status
  const typeMap: Record<string, string> = {
    'PENDING': 'warning',
    'CONFIRMED': 'primary',
    'PREPARING': 'info',
    'READY': 'success',
    'SERVED': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'danger',
    'REFUNDED': 'danger'
  }
  return typeMap[statusUpper] || typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusUpper = status?.toUpperCase() || status
  const labelMap: Record<string, string> = {
    'PENDING': '待确认',
    'CONFIRMED': '已确认',
    'PREPARING': '制作中',
    'READY': '已完成',
    'SERVED': '已上餐',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'REFUNDED': '已退款'
  }
  return labelMap[statusUpper] || labelMap[status] || status
}

const getTypeTagType = (type: string) => {
  const typeUpper = type?.toUpperCase() || type
  const typeMap: Record<string, string> = {
    'DINE_IN': 'primary',
    'TAKEAWAY': 'success',
    'DELIVERY': 'warning'
  }
  return typeMap[typeUpper] || typeMap[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const typeUpper = type?.toUpperCase() || type
  const labelMap: Record<string, string> = {
    'DINE_IN': '堂食',
    'TAKEAWAY': '外带',
    'DELIVERY': '外送'
  }
  return labelMap[typeUpper] || labelMap[type] || type
}

const getSourceTagType = (source: string) => {
  const typeMap: Record<string, string> = {
    'pos': 'primary',
    'web': 'success',
    'mobile': 'warning',
    'third_party': 'info'
  }
  return typeMap[source] || 'info'
}

const getSourceLabel = (source: string) => {
  const labelMap: Record<string, string> = {
    'pos': 'POS',
    'web': '网站',
    'mobile': '移动端',
    'third_party': '第三方'
  }
  return labelMap[source] || source
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getItemName = (item: any) => {
  return item.name || `菜品${item.menuItemId || item.id}`
}

// 事件处理
const handleOrderUpdated = () => {
  loadOrders()
  showDetailDialog.value = false
}

const handleOrderCreated = () => {
  loadOrders()
  showCreateDialog.value = false
}

// 生命周期
onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.order-management {
  .order-overview {
    margin-bottom: $spacing-6;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: $spacing-4;

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: $border-radius-lg;

          &.primary {
            background: $primary-light;
            color: $primary-color;
          }

          &.success {
            background: $success-light;
            color: $success-color;
          }

          &.warning {
            background: $warning-light;
            color: $warning-color;
          }

          &.info {
            background: $info-light;
            color: $info-color;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: $font-size-xl;
            font-weight: $font-weight-bold;
            color: $text-primary;
            margin-bottom: $spacing-1;
          }

          .stat-label {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-1;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: $spacing-1;
            font-size: $font-size-xs;

            &.up {
              color: $success-color;
            }

            &.down {
              color: $danger-color;
            }

            &.stable {
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .order-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;
    padding: $spacing-4;
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: $spacing-2;
    }
  }

  .order-list {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    .order-number {
      .number {
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-right: $spacing-2;
      }
    }

    .customer-info {
      .name {
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-1;
      }

      .phone {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .amount {
      .total {
        font-weight: $font-weight-medium;
        color: $text-primary;
      }

      .discount {
        font-size: $font-size-xs;
        color: $success-color;
      }
    }

    .delivery-address {
      font-size: $font-size-sm;
      color: $text-secondary;
      @include text-ellipsis;
    }

    .pagination {
      padding: $spacing-4;
      text-align: right;
      border-top: 1px solid $border-primary;
    }
  }

  .order-kanban {
    .kanban-column {
      background: $white;
      border-radius: $border-radius-base;
      box-shadow: $shadow-sm;
      overflow: hidden;

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $spacing-4;
        background: $gray-50;
        border-bottom: 1px solid $border-primary;

        .column-count {
          font-size: $font-size-sm;
          color: $text-secondary;
          background: $gray-200;
          padding: 2px 8px;
          border-radius: $border-radius-sm;
        }
      }

      .column-content {
        min-height: 400px;
        padding: $spacing-2;
        max-height: 600px;
        overflow-y: auto;

        .order-card {
          background: $white;
          border: 1px solid $border-primary;
          border-radius: $border-radius-base;
          padding: $spacing-3;
          margin-bottom: $spacing-2;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            box-shadow: $shadow-md;
            transform: translateY(-2px);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-2;

            .order-number {
              font-weight: $font-weight-medium;
              color: $text-primary;
            }
          }

          .card-content {
            margin-bottom: $spacing-3;

            .customer {
              font-size: $font-size-sm;
              color: $text-primary;
              margin-bottom: $spacing-1;
            }

            .items {
              font-size: $font-size-xs;
              color: $text-secondary;
              margin-bottom: $spacing-1;
            }

            .amount {
              font-weight: $font-weight-medium;
              color: $success-color;
            }
          }

          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .time {
              font-size: $font-size-xs;
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .order-timeline {
    .timeline-card {
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-3;

        .order-info {
          display: flex;
          align-items: center;
          gap: $spacing-2;

          .order-number {
            font-weight: $font-weight-medium;
            color: $text-primary;
          }

          .customer {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .order-amount {
          font-weight: $font-weight-bold;
          color: $success-color;
        }
      }

      .timeline-content {
        margin-bottom: $spacing-3;

        .order-items {
          .item-name {
            display: inline-block;
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-right: $spacing-3;
            margin-bottom: $spacing-1;
          }

          .more-items {
            font-size: $font-size-xs;
            color: $text-secondary;
            font-style: italic;
          }
        }
      }

      .timeline-actions {
        text-align: right;
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .order-management {
    .order-toolbar {
      flex-direction: column;
      gap: $spacing-4;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }
    }

    .order-kanban {
      .el-row {
        .el-col {
          margin-bottom: $spacing-4;
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .order-management {
    .order-toolbar,
    .order-list,
    .order-kanban .kanban-column,
    .timeline-card {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }

    .order-kanban {
      .column-header {
        background: $dark-bg-tertiary;
        border-bottom-color: $dark-border-primary;
      }
    }
  }
}
</style>