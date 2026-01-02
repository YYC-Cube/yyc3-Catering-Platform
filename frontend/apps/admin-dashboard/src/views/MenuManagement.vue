<template>
  <div class="menu-management">
    <div class="page-header">
      <h1>菜单管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          添加菜品
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="菜品分类">
          <el-select v-model="filterForm.category" placeholder="选择分类" clearable>
            <el-option label="主食" value="主食" />
            <el-option label="汤品" value="汤品" />
            <el-option label="小菜" value="小菜" />
            <el-option label="饮料" value="饮料" />
            <el-option label="甜点" value="甜点" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.available" placeholder="选择状态" clearable>
            <el-option label="上架" :value="true" />
            <el-option label="下架" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.search"
            placeholder="搜索菜品名称"
            @input="handleSearch"
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadMenuItems">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 菜单列表 -->
    <el-card class="menu-list-card">
      <el-table
        v-loading="loading"
        :data="menuItems"
        style="width: 100%"
        row-key="id"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="菜品名称" min-width="150">
          <template #default="{ row }">
            <div class="item-name">
              <span>{{ row.name }}</span>
              <el-tag v-if="!row.available" type="info" size="small">已下架</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="available" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.available"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="preparationTime" label="制作时间" width="120">
          <template #default="{ row }">
            <span>{{ row.preparationTime || '-' }}分钟</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingItem ? '编辑菜品' : '添加菜品'"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="菜品分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="主食" value="主食" />
            <el-option label="汤品" value="汤品" />
            <el-option label="小菜" value="小菜" />
            <el-option label="饮料" value="饮料" />
            <el-option label="甜点" value="甜点" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :precision="2"
            :min="0"
            placeholder="请输入价格"
          />
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl">
          <el-input v-model="formData.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入菜品描述"
          />
        </el-form-item>
        <el-form-item label="制作时间">
          <el-input-number
            v-model="formData.preparationTime"
            :min="1"
            placeholder="分钟"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="formData.available"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingItem ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { MenuAPI } from '../api/menu'
import type { MenuItem, CreateMenuItemRequest } from '../api/menu'

// 响应式数据
const loading = ref(false)
const showCreateDialog = ref(false)
const submitting = ref(false)
const editingItem = ref<MenuItem | null>(null)
const formRef = ref()

// 筛选表单
const filterForm = reactive({
  category: '',
  available: undefined as boolean | undefined,
  search: ''
})

// 表单数据
const formData = reactive({
  name: '',
  category: '',
  price: 0,
  imageUrl: '',
  description: '',
  preparationTime: undefined as number | undefined,
  available: true
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择菜品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ]
}

// 菜单数据
const menuItems = ref<MenuItem[]>([])

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 加载菜单数据
const loadMenuItems = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      category: filterForm.category || undefined,
      available: filterForm.available,
      search: filterForm.search || undefined
    }

    const response = await MenuAPI.getMenuItems(params)

    if (response.success) {
      menuItems.value = response.data.items
      pagination.total = response.data.pagination.total
      pagination.totalPages = response.data.pagination.totalPages
    } else {
      ElMessage.error(response.message || '获取菜单数据失败')
    }
  } catch (error) {
    console.error('Load menu items failed:', error)
    ElMessage.error('获取菜单数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadMenuItems()
}

// 重置筛选
const resetFilter = () => {
  filterForm.category = ''
  filterForm.available = undefined
  filterForm.search = ''
  pagination.page = 1
  loadMenuItems()
}

// 状态变更处理
const handleStatusChange = async (row: MenuItem) => {
  try {
    const response = await MenuAPI.updateMenuItem(row.id, { available: row.available })

    if (response.success) {
      ElMessage.success(`菜品${row.available ? '上架' : '下架'}成功`)
    } else {
      // 恢复原状态
      row.available = !row.available
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    console.error('Update status failed:', error)
    row.available = !row.available
    ElMessage.error('状态更新失败')
  }
}

// 编辑菜品
const handleEdit = (item: MenuItem) => {
  editingItem.value = { ...item }
  Object.assign(formData, item)
  showCreateDialog.value = true
}

// 删除菜品
const handleDelete = async (item: MenuItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜品"${item.name}"吗？`,
      '确认删除',
      {
        type: 'warning'
      }
    )

    const response = await MenuAPI.deleteMenuItem(item.id)

    if (response.success) {
      ElMessage.success('删除成功')
      loadMenuItems()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingItem.value) {
      // 更新
      const response = await MenuAPI.updateMenuItem(editingItem.value.id, formData)

      if (response.success) {
        ElMessage.success('更新成功')
        showCreateDialog.value = false
        loadMenuItems()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      // 创建
      const response = await MenuAPI.createMenuItem(formData as CreateMenuItemRequest)

      if (response.success) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        loadMenuItems()
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  editingItem.value = null
  Object.assign(formData, {
    name: '',
    category: '',
    price: 0,
    imageUrl: '',
    description: '',
    preparationTime: undefined,
    available: true
  })
  formRef.value?.resetFields()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.limit = val
  pagination.page = 1
  loadMenuItems()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadMenuItems()
}

// 格式化日期时间
const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadMenuItems()
})
</script>

<style scoped>
.menu-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .el-form-item {
    margin-bottom: 16px;
    min-width: 200px;

    @media (max-width: 768px) {
      min-width: 100%;
      margin-bottom: 12px;
    }
  }
}

.menu-list-card {
  min-height: 400px;
}

.item-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  font-weight: bold;
  color: #e6a23c;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    .el-pagination {
      justify-content: center;

      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}
</style>