<template>
  <div class="order-detail" v-if="order">
    <div class="order-header">
      <h2>订单详情</h2>
      <el-tag
        :type="getStatusType(order.status)"
        size="large"
      >
        {{ getStatusText(order.status) }}
      </el-tag>
    </div>

    <el-card class="order-info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">
          {{ order.orderNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="桌号">
          {{ order.tableNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名">
          {{ order.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="客户电话">
          {{ order.customerPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">
          {{ formatDateTime(order.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(order.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="order-items-card">
      <template #header>
        <div class="card-header">
          <span>订单项目</span>
        </div>
      </template>

      <el-table :data="order.items" border>
        <el-table-column prop="name" label="菜品名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="quantity" label="数量" width="100" align="center" />
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="subtotal" label="小计" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.subtotal }}
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" />
      </el-table>
    </el-card>

    <el-card class="order-summary-card">
      <template #header>
        <div class="card-header">
          <span>费用汇总</span>
        </div>
      </template>

      <div class="summary-content">
        <div class="summary-row">
          <span>菜品小计:</span>
          <span>¥{{ order.subtotal }}</span>
        </div>
        <div class="summary-row">
          <span>服务费 (10%):</span>
          <span>¥{{ order.serviceFee }}</span>
        </div>
        <div class="summary-row">
          <span>优惠:</span>
          <span v-if="order.discount">-¥{{ order.discount }}</span>
          <span v-else>¥0</span>
        </div>
        <div class="summary-row total">
          <span>总计:</span>
          <span>¥{{ order.totalAmount }}</span>
        </div>
      </div>
    </el-card>

    <el-card v-if="order.notes" class="order-notes-card">
      <template #header>
        <div class="card-header">
          <span>订单备注</span>
        </div>
      </template>

      <p>{{ order.notes }}</p>
    </el-card>

    <div class="order-actions">
      <el-button
        v-if="canEditOrder"
        type="primary"
        @click="handleEditOrder"
      >
        编辑订单
      </el-button>
      <el-button
        v-if="canCancelOrder"
        type="danger"
        @click="handleCancelOrder"
      >
        取消订单
      </el-button>
      <el-button
        v-if="canCompleteOrder"
        type="success"
        @click="handleCompleteOrder"
      >
        完成订单
      </el-button>
      <el-button
        type="info"
        @click="handlePrintOrder"
      >
        打印订单
      </el-button>
      <el-button @click="$emit('close')">
        关闭
      </el-button>
    </div>
  </div>

  <div v-else class="loading">
    <el-skeleton :rows="10" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OrderAPI } from '@/api/order'
import type { Order } from '@/api/order'

interface Props {
  orderId: string | number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  update: []
}>()

const order = ref<Order | null>(null)
const loading = ref(false)

const canEditOrder = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.status)
})

const canCancelOrder = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.status)
})

const canCompleteOrder = computed(() => {
  return order.value && ['preparing', 'ready'].includes(order.value.status)
})

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

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const loadOrderDetail = async () => {
  try {
    loading.value = true
    const result = await OrderAPI.getOrder(props.orderId)
    if (result.success && result.data) {
      order.value = result.data
    } else {
      ElMessage.error(result.message || '加载订单详情失败')
    }
  } catch (error) {
    console.error('Load order detail failed:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const handleEditOrder = () => {
  // TODO: 实现编辑订单功能
  ElMessage.info('编辑订单功能开发中')
}

const handleCancelOrder = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个订单吗？此操作不可恢复。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await OrderAPI.cancelOrder(order.value!.id, '用户取消')
    if (result.success) {
      ElMessage.success('订单已取消')
      emit('update')
      emit('close')
    } else {
      ElMessage.error(result.message || '取消订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cancel order failed:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

const handleCompleteOrder = async () => {
  try {
    const result = await OrderAPI.updateOrderStatus(order.value!.id, 'completed')
    if (result.success) {
      ElMessage.success('订单已完成')
      emit('update')
      emit('close')
    } else {
      ElMessage.error(result.message || '完成订单失败')
    }
  } catch (error) {
    console.error('Complete order failed:', error)
    ElMessage.error('完成订单失败')
  }
}

const handlePrintOrder = () => {
  // TODO: 实现打印订单功能
  ElMessage.info('打印订单功能开发中')
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-header h2 {
  margin: 0;
  color: #2c3e50;
}

.order-info-card,
.order-items-card,
.order-summary-card,
.order-notes-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
  color: #2c3e50;
}

.summary-content {
  max-width: 400px;
  margin: 0 auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
  border-top: 2px solid #e74c3c;
  margin-top: 10px;
  padding-top: 15px;
}

.order-actions {
  text-align: center;
  margin-top: 30px;
}

.order-actions .el-button {
  margin: 0 10px;
}

.loading {
  padding: 20px;
}
</style>