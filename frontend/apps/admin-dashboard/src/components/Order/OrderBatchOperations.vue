<template>
  <div class="order-batch-operations">
    <el-card class="operations-card">
      <template #header>
        <div class="card-header">
          <span>批量操作</span>
          <el-button size="small" @click="clearSelection">
            <el-icon><Close /></el-icon>
            清空选择
          </el-button>
        </div>
      </template>

      <div class="operations-content">
        <div class="selection-info">
          <el-alert
            :title="`已选择 ${selectedOrders.length} 个订单`"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="selection-details">
                <span>总金额: ¥{{ totalAmount.toFixed(2) }}</span>
                <span>待确认: {{ pendingCount }}</span>
                <span>已确认: {{ confirmedCount }}</span>
                <span>制作中: {{ preparingCount }}</span>
              </div>
            </template>
          </el-alert>
        </div>

        <div class="operation-groups">
          <el-collapse v-model="activeGroups">
            <el-collapse-item title="状态更新" name="status">
              <div class="operation-buttons">
                <el-button
                  type="success"
                  :loading="loading"
                  @click="batchUpdateStatus(OrderStatus.CONFIRMED)"
                >
                  <el-icon><Check /></el-icon>
                  批量确认
                </el-button>
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="batchUpdateStatus(OrderStatus.PREPARING)"
                >
                  <el-icon><Loading /></el-icon>
                  批量开始制作
                </el-button>
                <el-button
                  type="warning"
                  :loading="loading"
                  @click="batchUpdateStatus(OrderStatus.READY)"
                >
                  <el-icon><CircleCheck /></el-icon>
                  批量完成
                </el-button>
                <el-button
                  type="danger"
                  :loading="loading"
                  @click="batchCancel"
                >
                  <el-icon><CircleClose /></el-icon>
                  批量取消
                </el-button>
              </div>
            </el-collapse-item>

            <el-collapse-item title="打印操作" name="print">
              <div class="operation-buttons">
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="batchPrint('kitchen')"
                >
                  <el-icon><Printer /></el-icon>
                  打印厨房单
                </el-button>
                <el-button
                  type="success"
                  :loading="loading"
                  @click="batchPrint('customer')"
                >
                  <el-icon><Document /></el-icon>
                  打印客户单
                </el-button>
                <el-button
                  type="info"
                  :loading="loading"
                  @click="batchPrint('delivery')"
                >
                  <el-icon><Van /></el-icon>
                  打印配送单
                </el-button>
              </div>
            </el-collapse-item>

            <el-collapse-item title="导出操作" name="export">
              <div class="operation-buttons">
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="exportToExcel"
                >
                  <el-icon><Download /></el-icon>
                  导出Excel
                </el-button>
                <el-button
                  type="success"
                  :loading="loading"
                  @click="exportToPDF"
                >
                  <el-icon><Document /></el-icon>
                  导出PDF
                </el-button>
                <el-button
                  type="info"
                  :loading="loading"
                  @click="exportToCSV"
                >
                  <el-icon><Download /></el-icon>
                  导出CSV
                </el-button>
              </div>
            </el-collapse-item>

            <el-collapse-item title="其他操作" name="other">
              <div class="operation-buttons">
                <el-button
                  type="warning"
                  :loading="loading"
                  @click="batchAssignStaff"
                >
                  <el-icon><User /></el-icon>
                  分配员工
                </el-button>
                <el-button
                  type="info"
                  :loading="loading"
                  @click="batchAddTags"
                >
                  <el-icon><PriceTag /></el-icon>
                  添加标签
                </el-button>
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="batchAddNotes"
                >
                  <el-icon><Edit /></el-icon>
                  添加备注
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div class="selected-orders-list">
          <el-divider>已选订单列表</el-divider>
          <el-table
            :data="selectedOrders"
            max-height="300"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="订单号" width="140">
              <template #default="{ row }">
                {{ row.orderNumber || `ORD-${row.id}` }}
              </template>
            </el-table-column>
            <el-table-column label="客户" width="120">
              <template #default="{ row }">
                {{ row.customerName || '散客' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="金额" width="100" align="right">
              <template #default="{ row }">
                ¥{{ (row.totalAmount || row.finalAmount || 0).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeOrder(row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showAssignDialog"
      title="分配员工"
      width="500px"
    >
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="选择员工">
          <el-select v-model="assignForm.staffId" placeholder="请选择员工">
            <el-option
              v-for="staff in staffList"
              :key="staff.id"
              :label="staff.name"
              :value="staff.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showTagsDialog"
      title="添加标签"
      width="500px"
    >
      <el-form :model="tagsForm" label-width="100px">
        <el-form-item label="选择标签">
          <el-select
            v-model="tagsForm.tags"
            multiple
            placeholder="请选择标签"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTagsDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddTags">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showNotesDialog"
      title="添加备注"
      width="500px"
    >
      <el-form :model="notesForm" label-width="100px">
        <el-form-item label="备注内容">
          <el-input
            v-model="notesForm.note"
            type="textarea"
            :rows="4"
            placeholder="请输入备注内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNotesDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddNotes">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Close,
  Check,
  Loading,
  CircleCheck,
  CircleClose,
  Printer,
  Document,
  Van,
  Download,
  User,
  PriceTag,
  Edit
} from '@element-plus/icons-vue'
import { OrderStatus, type Order } from '@/api/order-management'

interface Props {
  orders: Order[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
  cleared: []
}>()

const loading = ref(false)
const selectedOrders = ref<Order[]>([])
const activeGroups = ref(['status'])
const showAssignDialog = ref(false)
const showTagsDialog = ref(false)
const showNotesDialog = ref(false)

const assignForm = ref({
  staffId: ''
})

const tagsForm = ref({
  tags: [] as string[]
})

const notesForm = ref({
  note: ''
})

const staffList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const availableTags = ref([
  '优先处理',
  'VIP客户',
  '特殊要求',
  '投诉处理',
  '退款处理'
])

const totalAmount = computed(() => {
  return selectedOrders.value.reduce(
    (sum, order) => sum + (order.totalAmount || order.finalAmount || 0),
    0
  )
})

const pendingCount = computed(() => {
  return selectedOrders.value.filter(
    order => order.status === OrderStatus.PENDING
  ).length
})

const confirmedCount = computed(() => {
  return selectedOrders.value.filter(
    order => order.status === OrderStatus.CONFIRMED
  ).length
})

const preparingCount = computed(() => {
  return selectedOrders.value.filter(
    order => order.status === OrderStatus.PREPARING
  ).length
})

const handleSelectionChange = (selection: Order[]) => {
  selectedOrders.value = selection
}

const clearSelection = () => {
  selectedOrders.value = []
  emit('cleared')
}

const removeOrder = (order: Order) => {
  const index = selectedOrders.value.findIndex(o => o.id === order.id)
  if (index > -1) {
    selectedOrders.value.splice(index, 1)
  }
}

const batchUpdateStatus = async (status: OrderStatus) => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要操作的订单')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedOrders.value.length} 个订单状态更新为"${getStatusLabel(status)}"吗？`,
      '确认操作',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    loading.value = true
    const { batchUpdateOrders } = await import('@/api/order-management')
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await batchUpdateOrders(orderIds, { status })
    
    if (response.success) {
      ElMessage.success(`成功更新 ${response.updated} 个订单`)
      emit('updated')
      clearSelection()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量更新失败')
    }
  } finally {
    loading.value = false
  }
}

const batchCancel = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要操作的订单')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要取消选中的 ${selectedOrders.value.length} 个订单吗？`,
      '确认取消',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    loading.value = true
    const { batchUpdateOrders } = await import('@/api/order-management')
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await batchUpdateOrders(orderIds, { status: OrderStatus.CANCELLED })
    
    if (response.success) {
      ElMessage.success(`成功取消 ${response.updated} 个订单`)
      emit('updated')
      clearSelection()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量取消失败')
    }
  } finally {
    loading.value = false
  }
}

const batchPrint = async (type: 'kitchen' | 'customer' | 'delivery') => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要打印的订单')
    return
  }

  loading.value = true
  try {
    const { batchPrintOrders } = await import('@/api/order-management')
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await batchPrintOrders(orderIds, type)
    
    if (response.success) {
      ElMessage.success(`已发送 ${orderIds.length} 个订单到打印机`)
    }
  } catch (error) {
    ElMessage.error('批量打印失败')
  } finally {
    loading.value = false
  }
}

const exportToExcel = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要导出的订单')
    return
  }

  loading.value = true
  try {
    const { exportOrders } = await import('@/api/order-management')
    const blob = await exportOrders({
      orderIds: selectedOrders.value.map(order => order.id),
      format: 'excel'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const exportToPDF = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要导出的订单')
    return
  }

  loading.value = true
  try {
    const { exportOrders } = await import('@/api/order-management')
    const blob = await exportOrders({
      orderIds: selectedOrders.value.map(order => order.id),
      format: 'pdf'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const exportToCSV = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要导出的订单')
    return
  }

  loading.value = true
  try {
    const { exportOrders } = await import('@/api/order-management')
    const blob = await exportOrders({
      orderIds: selectedOrders.value.map(order => order.id),
      format: 'csv'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const batchAssignStaff = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要分配的订单')
    return
  }
  showAssignDialog.value = true
}

const confirmAssign = async () => {
  loading.value = true
  try {
    const { batchUpdateOrders } = await import('@/api/order-management')
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await batchUpdateOrders(orderIds, {
      staffId: assignForm.value.staffId
    })
    
    if (response.success) {
      ElMessage.success('分配成功')
      showAssignDialog.value = false
      emit('updated')
    }
  } catch (error) {
    ElMessage.error('分配失败')
  } finally {
    loading.value = false
  }
}

const batchAddTags = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要添加标签的订单')
    return
  }
  showTagsDialog.value = true
}

const confirmAddTags = async () => {
  loading.value = true
  try {
    const { batchUpdateOrders } = await import('@/api/order-management')
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await batchUpdateOrders(orderIds, {
      tags: tagsForm.value.tags
    })
    
    if (response.success) {
      ElMessage.success('标签添加成功')
      showTagsDialog.value = false
      emit('updated')
    }
  } catch (error) {
    ElMessage.error('标签添加失败')
  } finally {
    loading.value = false
  }
}

const batchAddNotes = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要添加备注的订单')
    return
  }
  showNotesDialog.value = true
}

const confirmAddNotes = async () => {
  loading.value = true
  try {
    const { batchUpdateOrders } = await import('@/api/order-management')
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await batchUpdateOrders(orderIds, {
      notes: notesForm.value.note
    })
    
    if (response.success) {
      ElMessage.success('备注添加成功')
      showNotesDialog.value = false
      emit('updated')
    }
  } catch (error) {
    ElMessage.error('备注添加失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: OrderStatus) => {
  const typeMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'warning',
    [OrderStatus.CONFIRMED]: 'primary',
    [OrderStatus.PREPARING]: 'info',
    [OrderStatus.READY]: 'success',
    [OrderStatus.SERVED]: 'success',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'danger',
    [OrderStatus.REFUNDED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: OrderStatus) => {
  const labelMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '待确认',
    [OrderStatus.CONFIRMED]: '已确认',
    [OrderStatus.PREPARING]: '制作中',
    [OrderStatus.READY]: '已完成',
    [OrderStatus.SERVED]: '已上餐',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款'
  }
  return labelMap[status] || status
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.order-batch-operations {
  .operations-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .operations-content {
      .selection-info {
        margin-bottom: $spacing-4;

        .selection-details {
          display: flex;
          gap: $spacing-4;
          margin-top: $spacing-2;

          span {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }
      }

      .operation-groups {
        margin-bottom: $spacing-4;

        .operation-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: $spacing-3;
        }
      }

      .selected-orders-list {
        margin-top: $spacing-4;
      }
    }
  }
}
</style>
