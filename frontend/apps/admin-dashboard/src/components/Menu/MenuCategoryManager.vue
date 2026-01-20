<template>
  <div class="menu-category-manager">
    <el-card class="category-card">
      <template #header>
        <div class="card-header">
          <span>菜单分类管理</span>
          <el-button type="primary" size="small" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>
      </template>

      <div class="category-content">
        <div class="category-tree">
          <el-tree
            ref="treeRef"
            :data="categoryTree"
            :props="treeProps"
            :expand-on-click-node="false"
            :highlight-current="true"
            node-key="id"
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <div class="node-content">
                  <el-icon v-if="data.icon" class="node-icon">
                    <component :is="data.icon" />
                  </el-icon>
                  <span class="node-label">{{ data.name }}</span>
                  <el-tag v-if="data.itemCount > 0" size="small" type="info">
                    {{ data.itemCount }}项
                  </el-tag>
                </div>
                <div class="node-actions">
                  <el-button
                    size="small"
                    link
                    type="primary"
                    @click.stop="handleEdit(data)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    link
                    type="primary"
                    @click.stop="handleAddChild(data)"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    link
                    type="danger"
                    @click.stop="handleDelete(data)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>

        <div class="category-detail">
          <div v-if="selectedCategory" class="detail-content">
            <h3>{{ selectedCategory.name }}</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="分类ID">
                {{ selectedCategory.id }}
              </el-descriptions-item>
              <el-descriptions-item label="父分类">
                {{ selectedCategory.parentId ? getParentName(selectedCategory.parentId) : '无' }}
              </el-descriptions-item>
              <el-descriptions-item label="排序">
                {{ selectedCategory.sortOrder }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="selectedCategory.available ? 'success' : 'info'">
                  {{ selectedCategory.available ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="描述">
                {{ selectedCategory.description || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="包含菜品">
                {{ selectedCategory.itemCount }}项
              </el-descriptions-item>
            </el-descriptions>

            <div class="category-actions">
              <el-button type="primary" @click="handleEdit(selectedCategory)">
                <el-icon><Edit /></el-icon>
                编辑分类
              </el-button>
              <el-button @click="handleToggleStatus(selectedCategory)">
                <el-icon><Switch /></el-icon>
                {{ selectedCategory.available ? '禁用' : '启用' }}
              </el-button>
            </div>
          </div>
          <div v-else class="empty-detail">
            <el-empty description="请选择分类查看详情" />
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showCreateDialog"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      width="500px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="categoryTree"
            :props="treeProps"
            placeholder="请选择父分类（可选）"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="formData.icon" placeholder="请选择图标" clearable>
            <el-option label="餐具" value="Dish" />
            <el-option label="汉堡" value="Hamburger" />
            <el-option label="咖啡" value="Coffee" />
            <el-option label="饮料" value="Goblet" />
            <el-option label="甜点" value="IceCream" />
            <el-option label="水果" value="Cherry" />
            <el-option label="蔬菜" value="Vegetables" />
            <el-option label="肉类" value="Chicken" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            placeholder="请输入排序值"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="formData.available"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingCategory ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Switch,
  Dish,
  Hamburger,
  Coffee,
  Goblet,
  IceCream,
  Cherry,
  Vegetables,
  Chicken
} from '@element-plus/icons-vue'

interface MenuCategory {
  id: number
  name: string
  parentId: number | null
  icon: string
  sortOrder: number
  available: boolean
  description?: string
  itemCount: number
  children?: MenuCategory[]
}

const treeRef = ref()
const formRef = ref()
const showCreateDialog = ref(false)
const submitting = ref(false)
const editingCategory = ref<MenuCategory | null>(null)
const selectedCategory = ref<MenuCategory | null>(null)

const treeProps = {
  children: 'children',
  label: 'name'
}

const formData = reactive({
  name: '',
  parentId: null as number | null,
  icon: '',
  sortOrder: 0,
  description: '',
  available: true
})

const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

const categoryTree = ref<MenuCategory[]>([
  {
    id: 1,
    name: '主食',
    parentId: null,
    icon: 'Dish',
    sortOrder: 1,
    available: true,
    description: '各类主食菜品',
    itemCount: 15,
    children: [
      {
        id: 11,
        name: '米饭类',
        parentId: 1,
        icon: 'Dish',
        sortOrder: 1,
        available: true,
        description: '各种米饭菜品',
        itemCount: 8
      },
      {
        id: 12,
        name: '面食类',
        parentId: 1,
        icon: 'Dish',
        sortOrder: 2,
        available: true,
        description: '各种面食菜品',
        itemCount: 7
      }
    ]
  },
  {
    id: 2,
    name: '汤品',
    parentId: null,
    icon: 'Goblet',
    sortOrder: 2,
    available: true,
    description: '各类汤品',
    itemCount: 10,
    children: [
      {
        id: 21,
        name: '清汤',
        parentId: 2,
        icon: 'Goblet',
        sortOrder: 1,
        available: true,
        description: '清淡汤品',
        itemCount: 5
      },
      {
        id: 22,
        name: '浓汤',
        parentId: 2,
        icon: 'Goblet',
        sortOrder: 2,
        available: true,
        description: '浓郁汤品',
        itemCount: 5
      }
    ]
  },
  {
    id: 3,
    name: '小菜',
    parentId: null,
    icon: 'Vegetables',
    sortOrder: 3,
    available: true,
    description: '各类小菜',
    itemCount: 12
  },
  {
    id: 4,
    name: '饮料',
    parentId: null,
    icon: 'Coffee',
    sortOrder: 4,
    available: true,
    description: '各类饮料',
    itemCount: 8
  },
  {
    id: 5,
    name: '甜点',
    parentId: null,
    icon: 'IceCream',
    sortOrder: 5,
    available: true,
    description: '各类甜点',
    itemCount: 6
  }
])

const getParentName = (parentId: number) => {
  const findParent = (nodes: MenuCategory[]): MenuCategory | null => {
    for (const node of nodes) {
      if (node.id === parentId) {
        return node
      }
      if (node.children) {
        const found = findParent(node.children)
        if (found) return found
      }
    }
    return null
  }
  const parent = findParent(categoryTree.value)
  return parent ? parent.name : '未知'
}

const handleNodeClick = (data: MenuCategory) => {
  selectedCategory.value = data
}

const handleEdit = (data: MenuCategory) => {
  editingCategory.value = data
  formData.name = data.name
  formData.parentId = data.parentId
  formData.icon = data.icon
  formData.sortOrder = data.sortOrder
  formData.description = data.description || ''
  formData.available = data.available
  showCreateDialog.value = true
}

const handleAddChild = (data: MenuCategory) => {
  editingCategory.value = null
  formData.parentId = data.id
  formData.name = ''
  formData.icon = ''
  formData.sortOrder = 0
  formData.description = ''
  formData.available = true
  showCreateDialog.value = true
}

const handleDelete = async (data: MenuCategory) => {
  if (data.itemCount > 0) {
    ElMessage.warning('该分类下还有菜品，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${data.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    await loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete category failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleToggleStatus = async (data: MenuCategory) => {
  try {
    const newStatus = !data.available
    ElMessage.success(newStatus ? '已启用' : '已禁用')
    data.available = newStatus
  } catch (error) {
    console.error('Toggle status failed:', error)
    ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingCategory.value) {
      ElMessage.success('更新成功')
    } else {
      ElMessage.success('创建成功')
    }

    showCreateDialog.value = false
    await loadCategories()
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  editingCategory.value = null
  formData.name = ''
  formData.parentId = null
  formData.icon = ''
  formData.sortOrder = 0
  formData.description = ''
  formData.available = true
  formRef.value?.resetFields()
}

const loadCategories = async () => {
  try {
    ElMessage.loading('加载分类数据...')
    const response = await fetch('/api/menu/categories').then(res => res.json())
    if (response.success) {
      categoryTree.value = response.data
      ElMessage.success('加载成功')
    }
  } catch (error) {
    console.error('Load categories failed:', error)
    ElMessage.error('加载失败')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.menu-category-manager {
  .category-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: $spacing-4;
      min-height: 500px;

      .category-tree {
        border-right: 1px solid $border-color;
        padding-right: $spacing-4;

        :deep(.el-tree) {
          .el-tree-node__content {
            height: 48px;

            &:hover {
              background: $background-light;
            }
          }
        }

        .tree-node {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding-right: $spacing-2;

          .node-content {
            display: flex;
            align-items: center;
            gap: $spacing-2;
            flex: 1;

            .node-icon {
              color: $primary-color;
            }

            .node-label {
              font-weight: 500;
              color: $text-primary;
            }
          }

          .node-actions {
            display: flex;
            gap: $spacing-1;
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:hover .node-actions {
            opacity: 1;
          }
        }
      }

      .category-detail {
        .detail-content {
          h3 {
            margin: 0 0 $spacing-4 0;
            font-size: $font-size-lg;
            font-weight: 600;
            color: $text-primary;
          }

          .category-actions {
            display: flex;
            gap: $spacing-2;
            margin-top: $spacing-4;
          }
        }

        .empty-detail {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      }
    }
  }
}
</style>
