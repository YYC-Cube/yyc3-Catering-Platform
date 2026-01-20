<template>
  <div class="menu-batch-operations">
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
            :title="`已选择 ${selectedItems.length} 个菜品`"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="selection-details">
                <span>总价值: ¥{{ totalValue.toFixed(2) }}</span>
                <span>上架: {{ availableCount }}</span>
                <span>下架: {{ unavailableCount }}</span>
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
                  @click="batchUpdateStatus(true)"
                >
                  <el-icon><Check /></el-icon>
                  批量上架
                </el-button>
                <el-button
                  type="warning"
                  :loading="loading"
                  @click="batchUpdateStatus(false)"
                >
                  <el-icon><CloseBold /></el-icon>
                  批量下架
                </el-button>
              </div>
            </el-collapse-item>

            <el-collapse-item title="价格调整" name="price">
              <div class="price-adjustment">
                <el-radio-group v-model="priceAdjustmentType">
                  <el-radio label="fixed">固定价格</el-radio>
                  <el-radio label="percentage">百分比调整</el-radio>
                </el-radio-group>
                <el-input-number
                  v-model="priceAdjustmentValue"
                  :precision="priceAdjustmentType === 'percentage' ? 0 : 2"
                  :min="0"
                  :max="priceAdjustmentType === 'percentage' ? 100 : undefined"
                  placeholder="调整值"
                />
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="batchAdjustPrice"
                >
                  <el-icon><Edit /></el-icon>
                  应用价格调整
                </el-button>
              </div>
            </el-collapse-item>

            <el-collapse-item title="分类调整" name="category">
              <div class="category-adjustment">
                <el-tree-select
                  v-model="newCategoryId"
                  :data="categoryTree"
                  :props="{ label: 'name', value: 'id' }"
                  placeholder="选择目标分类"
                  check-strictly
                  clearable
                />
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="batchUpdateCategory"
                >
                  <el-icon><FolderOpened /></el-icon>
                  更新分类
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

            <el-collapse-item title="打印操作" name="print">
              <div class="operation-buttons">
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="printMenu"
                >
                  <el-icon><Printer /></el-icon>
                  打印菜单
                </el-button>
                <el-button
                  type="success"
                  :loading="loading"
                  @click="printQRCode"
                >
                  <el-icon><QrCode /></el-icon>
                  打印二维码
                </el-button>
              </div>
            </el-collapse-item>

            <el-collapse-item title="删除操作" name="delete">
              <div class="operation-buttons">
                <el-button
                  type="danger"
                  :loading="loading"
                  @click="batchDelete"
                >
                  <el-icon><Delete /></el-icon>
                  批量删除
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showPreviewDialog"
      title="操作预览"
      width="800px"
    >
      <div class="preview-content">
        <el-table :data="previewData" max-height="400">
          <el-table-column prop="name" label="菜品名称" />
          <el-table-column prop="currentPrice" label="当前价格">
            <template #default="{ row }">
              ¥{{ row.currentPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="newPrice" label="新价格">
            <template #default="{ row }">
              <span :class="{ 'price-change': row.newPrice !== row.currentPrice }">
                ¥{{ row.newPrice.toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="change" label="变化">
            <template #default="{ row }">
              <el-tag :type="row.change > 0 ? 'danger' : 'success'" size="small">
                {{ row.change > 0 ? '+' : '' }}{{ row.change.toFixed(2) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showPreviewDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmOperation" :loading="loading">
          确认操作
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Close,
  Check,
  CloseBold,
  Edit,
  FolderOpened,
  Download,
  Document,
  Printer,
  QrCode,
  Delete
} from '@element-plus/icons-vue'

interface MenuItem {
  id: number
  name: string
  price: number
  category: string
  available: boolean
}

interface CategoryTree {
  id: number
  name: string
  children?: CategoryTree[]
}

interface PreviewData {
  name: string
  currentPrice: number
  newPrice: number
  change: number
}

const props = defineProps<{
  selectedItems: MenuItem[]
}>()

const emit = defineEmits<{
  'clear-selection': []
  'operation-complete': []
}>()

const loading = ref(false)
const activeGroups = ref(['status'])
const priceAdjustmentType = ref('fixed')
const priceAdjustmentValue = ref(0)
const newCategoryId = ref<number | null>(null)
const showPreviewDialog = ref(false)
const previewData = ref<PreviewData[]>([])
const pendingOperation = ref<string>('')

const categoryTree = ref<CategoryTree[]>([
  {
    id: 1,
    name: '主食',
    children: [
      { id: 11, name: '米饭类' },
      { id: 12, name: '面食类' }
    ]
  },
  {
    id: 2,
    name: '汤品',
    children: [
      { id: 21, name: '清汤' },
      { id: 22, name: '浓汤' }
    ]
  },
  {
    id: 3,
    name: '小菜' },
  {
    id: 4,
    name: '饮料' },
  {
    id: 5,
    name: '甜点' }
])

const totalValue = computed(() => {
  return props.selectedItems.reduce((sum, item) => sum + item.price, 0)
})

const availableCount = computed(() => {
  return props.selectedItems.filter(item => item.available).length
})

const unavailableCount = computed(() => {
  return props.selectedItems.filter(item => !item.available).length
})

const clearSelection = () => {
  emit('clear-selection')
}

const batchUpdateStatus = async (status: boolean) => {
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${props.selectedItems.length} 个菜品${status ? '上架' : '下架'}吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await fetch('/api/menu/items/batch/status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id),
        available: status
      })
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success(`${status ? '上架' : '下架'}成功`)
      emit('operation-complete')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch update status failed:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    loading.value = false
  }
}

const batchAdjustPrice = async () => {
  if (priceAdjustmentValue.value === 0) {
    ElMessage.warning('请输入调整值')
    return
  }

  previewData.value = props.selectedItems.map(item => {
    let newPrice = item.price
    if (priceAdjustmentType.value === 'fixed') {
      newPrice = priceAdjustmentValue.value
    } else {
      newPrice = item.price * (1 + priceAdjustmentValue.value / 100)
    }
    return {
      name: item.name,
      currentPrice: item.price,
      newPrice: newPrice,
      change: newPrice - item.price
    }
  })

  pendingOperation.value = 'price'
  showPreviewDialog.value = true
}

const batchUpdateCategory = async () => {
  if (!newCategoryId.value) {
    ElMessage.warning('请选择目标分类')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${props.selectedItems.length} 个菜品移动到新分类吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await fetch('/api/menu/items/batch/category', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id),
        categoryId: newCategoryId.value
      })
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('分类更新成功')
      emit('operation-complete')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch update category failed:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    loading.value = false
  }
}

const confirmOperation = async () => {
  try {
    loading.value = true

    if (pendingOperation.value === 'price') {
      const response = await fetch('/api/menu/items/batch/price', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: previewData.value.map(preview => ({
            itemId: props.selectedItems.find(item => item.name === preview.name)!.id,
            newPrice: preview.newPrice
          }))
        })
      }).then(res => res.json())

      if (response.success) {
        ElMessage.success('价格调整成功')
        emit('operation-complete')
      }
    }

    showPreviewDialog.value = false
  } catch (error) {
    console.error('Confirm operation failed:', error)
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

const exportToExcel = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/menu/items/export/excel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id)
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'menu-items.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const exportToPDF = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/menu/items/export/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id)
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'menu-items.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const exportToCSV = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/menu/items/export/csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id)
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'menu-items.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const printMenu = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/menu/items/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id)
      })
    }).then(res => res.json())

    if (response.success) {
      window.open(response.data.printUrl, '_blank')
      ElMessage.success('打印任务已发送')
    }
  } catch (error) {
    console.error('Print failed:', error)
    ElMessage.error('打印失败')
  } finally {
    loading.value = false
  }
}

const printQRCode = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/menu/items/qrcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id)
      })
    }).then(res => res.json())

    if (response.success) {
      window.open(response.data.qrCodeUrl, '_blank')
      ElMessage.success('二维码已生成')
    }
  } catch (error) {
    console.error('Generate QR code failed:', error)
    ElMessage.error('生成失败')
  } finally {
    loading.value = false
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${props.selectedItems.length} 个菜品吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    loading.value = true
    const response = await fetch('/api/menu/items/batch/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemIds: props.selectedItems.map(item => item.id)
      })
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('删除成功')
      emit('operation-complete')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch delete failed:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.menu-batch-operations {
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
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }

      .operation-groups {
        .price-adjustment,
        .category-adjustment {
          display: flex;
          gap: $spacing-2;
          align-items: center;
        }

        .operation-buttons {
          display: flex;
          gap: $spacing-2;
          flex-wrap: wrap;
        }
      }
    }
  }

  .preview-content {
    .price-change {
      color: $primary-color;
      font-weight: 600;
    }
  }
}
</style>
