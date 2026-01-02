<template>
  <el-dialog
    v-model="visible"
    :title="`订单详情 - ${order?.orderNo || ''}`"
    width="800px"
    append-to-body
  >
    <div v-if="order" class="order-detail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">
          {{ order.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">
          {{ order.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名">
          {{ order.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ order.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="amount">¥{{ order.totalAmount }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="order-items">
        <h4>订单明细</h4>
        <el-table :data="order.items" style="width: 100%">
          <el-table-column prop="name" label="菜品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="100">
            <template #default="{ row }">
              ¥{{ row.subtotal }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="order-remark" v-if="order.remark">
        <h4>备注</h4>
        <p>{{ order.remark }}</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="close">关闭</el-button>
      <el-button type="primary" @click="printOrder">打印订单</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface OrderItem {
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface Order {
  orderNo: string
  createTime: string
  customerName: string
  phone: string
  status: string
  totalAmount: number
  items: OrderItem[]
  remark?: string
}

interface Props {
  modelValue: boolean
  order?: Order
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'danger',
    completed: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消',
    completed: '已完成'
  }
  return textMap[status] || status
}

const close = () => {
  visible.value = false
}

const printOrder = () => {
  if (!props.order) return

  const printContent = `
    订单详情
    ================
    订单号: ${props.order.orderNo}
    下单时间: ${props.order.createTime}
    客户姓名: ${props.order.customerName}
    联系电话: ${props.order.phone}
    订单状态: ${getStatusText(props.order.status)}
    订单金额: ¥${props.order.totalAmount}

    订单明细:
    ${props.order.items.map(item =>
      `${item.name} x${item.quantity} ¥${item.price} = ¥${item.subtotal}`
    ).join('\n')}

    ${props.order.remark ? `备注: ${props.order.remark}` : ''}
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>订单详情</title>
          <style>
            body { font-family: monospace; padding: 20px; white-space: pre-wrap; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}
</script>

<style lang="scss" scoped>
.order-detail {
  .amount {
    font-weight: 600;
    color: var(--el-color-danger);
  }

  .order-items {
    margin-top: 20px;

    h4 {
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
    }
  }

  .order-remark {
    margin-top: 20px;

    h4 {
      margin-bottom: 8px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      color: var(--el-text-color-regular);
      line-height: 1.5;
    }
  }
}
</style>