<template>
  <div class="customer-order-history">
    <div class="history-header">
      <h3>客户订单历史</h3>
      <div class="filter-section">
        <el-select v-model="filterStatus" placeholder="订单状态" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="待付款" value="pending" />
          <el-option label="已付款" value="paid" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号"
          style="width: 200px;"
          clearable
        />
      </div>
    </div>

    <div class="history-content">
      <el-table :data="filteredOrders" stripe style="width: 100%">
        <el-table-column label="订单号" prop="orderNumber" width="180" />
        <el-table-column label="下单时间" prop="orderTime" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column label="订单金额" prop="totalAmount" width="120" align="right">
          <template #default="{ row }">
            ¥{{ (row.totalAmount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态" prop="status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewOrderDetail(row.id)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="orders.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="orders.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <div class="empty-state" v-else>
        <el-empty description="暂无订单记录" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps<{
  customerId: number
}>()

// 订单数据
const orders = ref([
  { id: 1, orderNumber: 'ORD20240101001', orderTime: '2024-01-01T10:30:00', totalAmount: 128.50, status: 'completed' },
  { id: 2, orderNumber: 'ORD20240102002', orderTime: '2024-01-02T14:20:00', totalAmount: 89.90, status: 'completed' },
  { id: 3, orderNumber: 'ORD20240105003', orderTime: '2024-01-05T09:15:00', totalAmount: 156.80, status: 'completed' },
  { id: 4, orderNumber: 'ORD20240110004', orderTime: '2024-01-10T18:45:00', totalAmount: 99.00, status: 'completed' },
])

// 筛选条件
const filterStatus = ref('')
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    paid: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 查看订单详情
const viewOrderDetail = (orderId: number) => {
  ElMessage.info(`查看订单 ${orderId} 详情`)
  // 这里可以添加跳转到订单详情页的逻辑
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 过滤订单
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const statusMatch = filterStatus.value ? order.status === filterStatus.value : true
    const keywordMatch = searchKeyword.value ? order.orderNumber.includes(searchKeyword.value) : true
    return statusMatch && keywordMatch
  })
})
</script>

<style scoped>
.customer-order-history {
  width: 100%;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.filter-section {
  display: flex;
  align-items: center;
}

.history-content {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}
</style>