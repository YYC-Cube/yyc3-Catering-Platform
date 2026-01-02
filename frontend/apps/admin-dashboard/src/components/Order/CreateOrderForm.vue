<template>
  <div class="create-order-form">
    <el-form
      ref="formRef"
      :model="orderForm"
      :rules="rules"
      label-width="120px"
      size="large"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单号" prop="orderNumber">
            <el-input
              v-model="orderForm.orderNumber"
              placeholder="自动生成"
              :disabled="true"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="桌号" prop="tableId">
            <el-select
              v-model="orderForm.tableId"
              placeholder="请选择桌号"
              style="width: 100%"
            >
              <el-option
                v-for="table in availableTables"
                :key="table.id"
                :label="`${table.number} (${table.capacity}人桌)`"
                :value="table.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户姓名" prop="customerName">
            <el-input
              v-model="orderForm.customerName"
              placeholder="请输入客户姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户电话" prop="customerPhone">
            <el-input
              v-model="orderForm.customerPhone"
              placeholder="请输入客户电话"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="订单项目" prop="items">
        <div class="order-items">
          <div
            v-for="(item, index) in orderForm.items"
            :key="index"
            class="order-item"
          >
            <el-row :gutter="10">
              <el-col :span="8">
                <el-select
                  v-model="item.menuItemId"
                  placeholder="选择菜品"
                  @change="calculateItemTotal(index)"
                >
                  <el-option
                    v-for="menuItem in menuItems"
                    :key="menuItem.id"
                    :label="`${menuItem.name} - ¥${menuItem.price}`"
                    :value="menuItem.id"
                  />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="99"
                  @change="calculateItemTotal(index)"
                />
              </el-col>
              <el-col :span="6">
                <el-input
                  v-model="item.price"
                  placeholder="价格"
                  :disabled="true"
                />
              </el-col>
              <el-col :span="4">
                <el-input
                  v-model="item.subtotal"
                  placeholder="小计"
                  :disabled="true"
                />
              </el-col>
              <el-col :span="2">
                <el-button
                  type="danger"
                  icon="Delete"
                  @click="removeItem(index)"
                />
              </el-col>
            </el-row>

            <el-input
              v-model="item.notes"
              placeholder="备注"
              style="margin-top: 10px"
            />
          </div>

          <el-button
            type="primary"
            icon="Plus"
            @click="addItem"
            style="margin-top: 10px"
          >
            添加菜品
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="orderForm.notes"
          type="textarea"
          :rows="3"
          placeholder="订单备注"
        />
      </el-form-item>

      <el-form-item>
        <div class="order-summary">
          <div class="summary-item">
            <span>小计: ¥{{ orderForm.subtotal }}</span>
          </div>
          <div class="summary-item">
            <span>服务费: ¥{{ orderForm.serviceFee }}</span>
          </div>
          <div class="summary-item total">
            <span>总计: ¥{{ orderForm.totalAmount }}</span>
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitOrder">
          创建订单
        </el-button>
        <el-button @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { OrderAPI } from '@/api/order'
import type { Order, OrderItem } from '@/api/order'
import { useTableStore } from '@/stores/table'
import type { Table } from '@/types'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const formRef = ref<FormInstance>()
const availableTables = ref<Table[]>([])
const menuItems = ref([])

const orderForm = reactive({
  orderNumber: '',
  tableId: '',
  customerName: '',
  customerPhone: '',
  items: [
    {
      menuItemId: '',
      quantity: 1,
      price: 0,
      subtotal: 0,
      notes: ''
    }
  ],
  notes: '',
  subtotal: 0,
  serviceFee: 0,
  totalAmount: 0
})

const rules = reactive<FormRules>({
  tableId: [
    { required: true, message: '请选择桌号', trigger: 'change' }
  ],
  customerName: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ],
  customerPhone: [
    { required: true, message: '请输入客户电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
})

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD${timestamp}${random}`
}

const calculateItemTotal = (index: number) => {
  const item = orderForm.items[index]
  const menuItem = menuItems.value.find(m => m.id === item.menuItemId)
  if (menuItem) {
    item.price = menuItem.price
    item.subtotal = item.price * item.quantity
  }
  calculateOrderTotal()
}

const calculateOrderTotal = () => {
  orderForm.subtotal = orderForm.items.reduce((sum, item) => sum + item.subtotal, 0)
  orderForm.serviceFee = Math.floor(orderForm.subtotal * 0.1) // 10%服务费
  orderForm.totalAmount = orderForm.subtotal + orderForm.serviceFee
}

const addItem = () => {
  orderForm.items.push({
    menuItemId: '',
    quantity: 1,
    price: 0,
    subtotal: 0,
    notes: ''
  })
}

const removeItem = (index: number) => {
  if (orderForm.items.length > 1) {
    orderForm.items.splice(index, 1)
    calculateOrderTotal()
  }
}

const submitOrder = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const orderData = {
      orderNumber: orderForm.orderNumber,
      tableId: orderForm.tableId,
      customerName: orderForm.customerName,
      customerPhone: orderForm.customerPhone,
      items: orderForm.items,
      notes: orderForm.notes,
      totalAmount: orderForm.totalAmount
    }

    const result = await OrderAPI.createOrder(orderData)
    if (result.success) {
      ElMessage.success('订单创建成功')
      emit('success')
    } else {
      ElMessage.error(result.message || '订单创建失败')
    }
  } catch (error) {
    console.error('Create order failed:', error)
    ElMessage.error('订单创建失败')
  }
}

const resetForm = () => {
  if (!formRef.value) return

  formRef.value.resetFields()
  orderForm.orderNumber = generateOrderNumber()
  orderForm.items = [
    {
      menuItemId: '',
      quantity: 1,
      price: 0,
      subtotal: 0,
      notes: ''
    }
  ]
  calculateOrderTotal()
}

onMounted(async () => {
  orderForm.orderNumber = generateOrderNumber()

  // 加载可用桌位
  const tableStoreResponse = await useTableStore().getAvailableTables(); availableTables.value = tableStoreResponse || []

  // TODO: 加载菜单数据
  menuItems.value = [] // 这里需要从菜单API获取数据
})
</script>

<style scoped>
.create-order-form {
  padding: 20px;
}

.order-items {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 15px;
  background-color: #fafafa;
}

.order-item {
  margin-bottom: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.order-summary {
  text-align: right;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}

.summary-item {
  margin-bottom: 5px;
  font-size: 14px;
}

.summary-item.total {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #dcdfe6;
}
</style>