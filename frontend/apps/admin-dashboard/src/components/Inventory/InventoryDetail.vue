<template>
  <div class="inventory-detail">
    <el-card shadow="hover" class="detail-card">
      <template #header>
        <div class="card-header">
          <h2>库存详情</h2>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="handleEdit">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button size="small" @click="handleRefresh">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else-if="inventoryData" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称" :span="2">
            <div class="product-info">
              <el-image
                v-if="inventoryData.avatar"
                :src="inventoryData.avatar"
                class="product-avatar"
                fit="cover"
              />
              <span class="product-name">{{ inventoryData.name }}</span>
              <el-tag
                :type="inventoryData.status === 'in_stock' ? 'success' : 'danger'"
                size="small"
                class="status-tag"
              >
                {{ inventoryData.status === 'in_stock' ? '库存充足' : '库存不足' }}
              </el-tag>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="商品编码">{{ inventoryData.code }}</el-descriptions-item>
          <el-descriptions-item label="商品分类">{{ inventoryData.category || '未分类' }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">{{ inventoryData.stock }}</el-descriptions-item>
          <el-descriptions-item label="安全库存">{{ inventoryData.safeStock }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ inventoryData.unit }}</el-descriptions-item>
          <el-descriptions-item label="成本价">{{ inventoryData.costPrice }}</el-descriptions-item>
          <el-descriptions-item label="销售价">{{ inventoryData.sellingPrice }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ inventoryData.supplier || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="产地">{{ inventoryData.origin || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="保质期" :span="2">
            {{ inventoryData.shelfLife || '未知' }}{{ inventoryData.shelfLifeUnit || '' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(inventoryData.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(inventoryData.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ inventoryData.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 库存变动记录 -->
        <div class="stock-history">
          <h3 class="section-title">
            <el-icon><Clock /></el-icon> 库存变动记录
          </h3>
          <el-table
            :data="stockHistory"
            stripe
            border
            size="small"
            style="width: 100%"
          >
            <el-table-column prop="type" label="变动类型" width="120">
              <template #default="scope">
                <el-tag
                  :type="scope.row.type === 'in' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.type === 'in' ? '入库' : '出库' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="beforeStock" label="变动前" width="100" />
            <el-table-column prop="afterStock" label="变动后" width="100" />
            <el-table-column prop="reason" label="变动原因" width="200" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="createTime" label="操作时间" width="180" />
          </el-table>

          <div class="pagination-container" v-if="stockHistory.length > 0">
            <el-pagination
              layout="total, prev, pager, next, jumper"
              :total="totalHistory"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
              small
            />
          </div>
        </div>
      </div>

      <div v-else class="empty-container">
        <el-empty description="暂无库存数据" />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑库存信息"
      width="800px"
      :before-close="handleEditClose"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-width="120px"
        size="large"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input
                v-model="editFormData.name"
                placeholder="请输入商品名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品编码" prop="code">
              <el-input
                v-model="editFormData.code"
                placeholder="请输入商品编码"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前库存" prop="stock">
              <el-input-number
                v-model="editFormData.stock"
                :min="0"
                :step="1"
                placeholder="请输入当前库存"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全库存" prop="safeStock">
              <el-input-number
                v-model="editFormData.safeStock"
                :min="0"
                :step="1"
                placeholder="请输入安全库存"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input
                v-model="editFormData.unit"
                placeholder="请输入单位"
                maxlength="10"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成本价" prop="costPrice">
              <el-input-number
                v-model="editFormData.costPrice"
                :min="0"
                :step="0.01"
                :precision="2"
                placeholder="请输入成本价"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售价" prop="sellingPrice">
              <el-input-number
                v-model="editFormData.sellingPrice"
                :min="0"
                :step="0.01"
                :precision="2"
                placeholder="请输入销售价"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-input
                v-model="editFormData.supplier"
                placeholder="请输入供应商"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="editFormData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditClose">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit" :loading="editSubmitting">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, onMounted, watch } from 'vue'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Refresh, Clock } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps<{
  inventoryId?: string
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'update', data: any): void
  (e: 'refresh'): void
}>()

// 状态管理
const loading = ref(true)
const inventoryData = ref<any>(null)
const stockHistory = ref<any[]>([])
const totalHistory = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 编辑弹窗相关
const editDialogVisible = ref(false)
const editFormRef = ref<InstanceType<typeof ElForm>>()
const editSubmitting = ref(false)

// 表单数据
const editFormData = reactive({
  name: '',
  code: '',
  stock: 0,
  safeStock: 0,
  unit: '',
  costPrice: 0,
  sellingPrice: 0,
  supplier: '',
  remark: ''
})

// 表单验证规则
const editFormRules = reactive({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商品名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入商品编码', trigger: 'blur' },
    { min: 2, max: 20, message: '商品编码长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入当前库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '当前库存不能小于 0', trigger: 'blur' }
  ],
  safeStock: [
    { required: true, message: '请输入安全库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '安全库存不能小于 0', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' },
    { min: 1, max: 10, message: '单位长度在 1 到 10 个字符', trigger: 'blur' }
  ]
})

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 加载库存详情
const loadInventoryDetail = async () => {
  if (!props.inventoryId) return

  try {
    loading.value = true
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    inventoryData.value = {
      id: props.inventoryId,
      name: '示例商品',
      code: 'PROD-001',
      category: '食材',
      stock: 100,
      safeStock: 20,
      unit: 'kg',
      costPrice: 25.5,
      sellingPrice: 45.0,
      supplier: '示例供应商',
      origin: '本地',
      shelfLife: 30,
      shelfLifeUnit: '天',
      status: 'in_stock',
      avatar: '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      remark: '这是一个示例商品'
    }
    
    // 加载库存变动记录
    loadStockHistory()
  } catch (error) {
    console.error('加载库存详情失败:', error)
    ElMessage.error('加载库存详情失败')
  } finally {
    loading.value = false
  }
}

// 加载库存变动记录
const loadStockHistory = async () => {
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟数据
    stockHistory.value = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      type: i % 2 === 0 ? 'in' : 'out',
      quantity: i % 2 === 0 ? 50 : 20,
      beforeStock: 100 - (i * 10),
      afterStock: 100 - (i * 10) + (i % 2 === 0 ? 50 : -20),
      reason: i % 2 === 0 ? '采购入库' : '销售出库',
      operator: '管理员',
      createTime: new Date(Date.now() - i * 86400000).toISOString()
    }))
    
    totalHistory.value = 5
  } catch (error) {
    console.error('加载库存变动记录失败:', error)
    ElMessage.error('加载库存变动记录失败')
  }
}

// 处理页面变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadStockHistory()
}

// 处理刷新
const handleRefresh = () => {
  loadInventoryDetail()
  emit('refresh')
}

// 处理编辑
const handleEdit = () => {
  if (!inventoryData.value) return
  
  // 初始化编辑表单数据
  Object.assign(editFormData, {
    name: inventoryData.value.name,
    code: inventoryData.value.code,
    stock: inventoryData.value.stock,
    safeStock: inventoryData.value.safeStock,
    unit: inventoryData.value.unit,
    costPrice: inventoryData.value.costPrice,
    sellingPrice: inventoryData.value.sellingPrice,
    supplier: inventoryData.value.supplier,
    remark: inventoryData.value.remark
  })
  
  editDialogVisible.value = true
}

// 处理编辑关闭
const handleEditClose = () => {
  editDialogVisible.value = false
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
}

// 处理编辑提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editSubmitting.value = true
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新本地数据
    Object.assign(inventoryData.value, editFormData)
    
    // 关闭弹窗
    handleEditClose()
    
    // 显示成功消息
    ElMessage.success('库存信息更新成功')
    
    // 触发更新事件
    emit('update', inventoryData.value)
  } catch (error) {
    console.error('更新库存信息失败:', error)
    ElMessage.error('更新库存信息失败')
  } finally {
    editSubmitting.value = false
  }
}

// 监听inventoryId变化
watch(
  () => props.inventoryId,
  (newId) => {
    if (newId) {
      loadInventoryDetail()
    }
  },
  { immediate: true }
)

// 组件挂载时加载数据
onMounted(() => {
  if (props.inventoryId) {
    loadInventoryDetail()
  }
})
</script>

<style scoped>
.inventory-detail {
  padding: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.detail-content {
  padding: 20px 0;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
}

.status-tag {
  margin-left: 10px;
}

.stock-history {
  margin-top: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty-container {
  padding: 40px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .inventory-detail {
    padding: 10px;
  }
  
  .product-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .status-tag {
    margin-left: 0;
  }
}
</style>