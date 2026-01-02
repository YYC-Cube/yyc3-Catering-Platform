<template>
  <div class="inventory-management">
    <!-- 库存统计概览 -->
    <div class="inventory-overview">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in inventoryStats" :key="stat.key">
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

    <!-- 库存警报 -->
    <div v-if="activeAlerts.length > 0" class="inventory-alerts">
      <el-alert
        v-for="alert in activeAlerts.slice(0, 3)"
        :key="alert.id"
        :title="alert.itemName"
        :type="getAlertType(alert.type)"
        :description="alert.message"
        show-icon
        :closable="false"
        class="alert-item"
      >
        <template #default>
          <div class="alert-content">
            <span>{{ alert.message }}</span>
            <div class="alert-actions">
              <el-button size="small" @click="acknowledgeAlert(alert.id)">
                确认
              </el-button>
              <el-button size="small" type="primary" @click="resolveAlert(alert.id)">
                解决
              </el-button>
            </div>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 筛选和操作工具栏 -->
    <div class="inventory-toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="filters.category"
          placeholder="商品分类"
          clearable
          style="width: 150px;"
          @change="handleFilterChange"
        >
          <el-option
            v-for="category in categories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>

        <el-select
          v-model="filters.status"
          placeholder="库存状态"
          multiple
          clearable
          style="width: 150px; margin-left: 10px;"
          @change="handleFilterChange"
        >
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          >
            <el-tag :type="getStatusTagType(status.value)" size="small">
              {{ status.label }}
            </el-tag>
          </el-option>
        </el-select>

        <el-checkbox
          v-model="filters.lowStock"
          style="margin-left: 10px;"
          @change="handleFilterChange"
        >
          仅显示库存不足
        </el-checkbox>

        <el-checkbox
          v-model="filters.expiring"
          style="margin-left: 10px;"
          @change="handleFilterChange"
        >
          仅显示临期商品
        </el-checkbox>

        <el-input
          v-model="filters.search"
          placeholder="搜索商品名称、编码..."
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
            :type="viewMode === 'table' ? 'primary' : ''"
            @click="setViewMode('table')"
          >
            <el-icon><List /></el-icon>
            表格视图
          </el-button>
          <el-button
            :type="viewMode === 'card' ? 'primary' : ''"
            @click="setViewMode('card')"
          >
            <el-icon><Grid /></el-icon>
            卡片视图
          </el-button>
        </el-button-group>

        <el-dropdown @command="handleBatchAction">
          <el-button type="primary" style="margin-left: 10px;">
            批量操作
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="export">导出库存</el-dropdown-item>
              <el-dropdown-item command="import">导入库存</el-dropdown-item>
              <el-dropdown-item command="adjust">批量调整</el-dropdown-item>
              <el-dropdown-item command="report">生成报告</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button type="success" @click="handleAddItem">
          <el-icon><Plus /></el-icon>
          新增商品
        </el-button>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="inventory-table">
      <el-table
        :data="inventoryItems"
        :loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleItemClick"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="item-info">
              <div class="name">{{ row.name }}</div>
              <div class="code">编码: {{ row.code }}</div>
              <div v-if="row.brand" class="brand">品牌: {{ row.brand }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="当前库存" width="120" align="center">
          <template #default="{ row }">
            <div class="stock-info" :class="getStockStatusClass(row)">
              <div class="stock-value">{{ row.currentStock }}</div>
              <div class="stock-unit">{{ getUnitLabel(row.unit) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="库存范围" width="140" align="center">
          <template #default="{ row }">
            <div class="stock-range">
              <div class="range-bar">
                <div
                  class="range-fill"
                  :style="getStockRangeStyle(row)"
                ></div>
              </div>
              <div class="range-label">{{ row.minStock }} - {{ row.maxStock }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>

        <el-table-column label="总价值" width="120" align="right">
          <template #default="{ row }">
            <div class="total-value">
              ¥{{ ((row.currentStock || 0) * (row.unitPrice || 0)).toFixed(2) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="供应商" width="120">
          <template #default="{ row }">
            {{ row.supplier || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="存放位置" width="120">
          <template #default="{ row }">
            {{ row.storageLocation || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="最后更新" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.lastUpdated) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button type="info" @click.stop="viewItemDetail(row)">
                详情
              </el-button>
              <el-button type="warning" @click.stop="adjustStock(row)">
                调整
              </el-button>
              <el-dropdown @command="(cmd) => handleItemAction(cmd, row)">
                <el-button type="primary">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="movement">变动记录</el-dropdown-item>
                    <el-dropdown-item command="batch">批次管理</el-dropdown-item>
                    <el-dropdown-item command="forecast">需求预测</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
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

    <!-- 卡片视图 -->
    <div v-else-if="viewMode === 'card'" class="inventory-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in inventoryItems" :key="item.id">
          <el-card class="inventory-card" @click="viewItemDetail(item)">
            <div class="card-header">
              <div class="item-name">{{ item.name }}</div>
              <el-tag :type="getStatusTagType(item.status)" size="small">
                {{ getStatusLabel(item.status) }}
              </el-tag>
            </div>
            <div class="card-content">
              <div class="stock-display">
                <div class="stock-number" :class="getStockStatusClass(item)">
                  {{ item.currentStock }}
                </div>
                <div class="stock-unit">{{ getUnitLabel(item.unit) }}</div>
              </div>
              <div class="stock-range">
                <div class="range-bar">
                  <div
                    class="range-fill"
                    :style="getStockRangeStyle(item)"
                  ></div>
                </div>
                <div class="range-text">{{ item.minStock }} - {{ item.maxStock }}</div>
              </div>
              <div class="item-meta">
                <div class="meta-item">
                  <span class="label">单价:</span>
                  <span class="value">¥{{ item.unitPrice?.toFixed(2) || '0.00' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">价值:</span>
                  <span class="value">¥{{ ((item.currentStock || 0) * (item.unitPrice || 0)).toFixed(2) }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <el-button-group size="small">
                <el-button type="warning" @click.stop="adjustStock(item)">
                  调整
                </el-button>
                <el-button type="info" @click.stop="viewItemDetail(item)">
                  详情
                </el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 商品详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`商品详情 - ${selectedItem?.name}`"
      width="80%"
      top="5vh"
    >
      <InventoryDetail
        v-if="selectedItem"
        :item="selectedItem"
        @updated="handleItemUpdated"
      />
    </el-dialog>

    <!-- 库存调整对话框 -->
    <el-dialog
      v-model="showAdjustDialog"
      title="库存调整"
      width="500px"
    >
      <InventoryAdjustment
        v-if="adjustingItem"
        :item="adjustingItem"
        @completed="handleAdjustmentCompleted"
        @cancel="showAdjustDialog = false"
      />
    </el-dialog>

    <!-- 新增商品对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增商品"
      width="60%"
    >
      <InventoryItemForm
        @created="handleItemCreated"
        @cancel="showAddDialog = false"
      />
    </el-dialog>

    <!-- 批量调整对话框 -->
    <el-dialog
      v-model="showBatchAdjustDialog"
      title="批量调整"
      width="600px"
    >
      <BatchAdjustment
        :items="selectedItems"
        @completed="handleBatchAdjustmentCompleted"
        @cancel="showBatchAdjustDialog = false"
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
  Plus,
  ArrowUp,
  ArrowDown,
  Minus,
  Box,
  Money,
  Warning,
  Check,
  Clock,
  DataAnalysis
} from '@element-plus/icons-vue'
import inventoryAPI, {
  InventoryStatus,
  InventoryUnit,
  AlertLevel,
  MovementType,
  type InventoryItem,
  type InventoryAlert,
  type InventoryFilters,
  type InventoryStats
} from '@/api/inventory'
import InventoryDetail from '@/components/Inventory/InventoryDetail.vue'
import InventoryAdjustment from '@/components/Inventory/InventoryAdjustment.vue'
import InventoryItemForm from '@/components/Inventory/InventoryItemForm.vue'
import BatchAdjustment from '@/components/Inventory/BatchAdjustment.vue'

// 响应式数据
const loading = ref(false)
const inventoryItems = ref<InventoryItem[]>([])
const activeAlerts = ref<InventoryAlert[]>([])
const selectedItems = ref<InventoryItem[]>([])
const selectedItem = ref<InventoryItem | null>(null)
const adjustingItem = ref<InventoryItem | null>(null)
const viewMode = ref<'table' | 'card'>('table')
const showDetailDialog = ref(false)
const showAdjustDialog = ref(false)
const showAddDialog = ref(false)
const showBatchAdjustDialog = ref(false)

const filters = reactive<InventoryFilters>({
  category: '',
  status: [],
  lowStock: false,
  expiring: false,
  search: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 库存统计
const inventoryStats = computed(() => [
  {
    key: 'totalItems',
    label: '商品总数',
    value: inventoryItems.value.length,
    icon: Box,
    type: 'primary',
    trend: 'up',
    change: '+5.2%'
  },
  {
    key: 'totalValue',
    label: '库存总价值',
    value: `¥${inventoryItems.value.reduce((sum, item) => sum + (item.currentStock || 0) * (item.unitPrice || 0), 0).toFixed(0)}`,
    icon: Money,
    type: 'success',
    trend: 'up',
    change: '+12.8%'
  },
  {
    key: 'lowStock',
    label: '库存不足',
    value: inventoryItems.value.filter(item => item.status === InventoryStatus.LOW).length,
    icon: Warning,
    type: 'warning',
    trend: 'down',
    change: '-2.1%'
  },
  {
    key: 'outOfStock',
    label: '缺货商品',
    value: inventoryItems.value.filter(item => item.status === InventoryStatus.OUT).length,
    icon: Warning,
    type: 'danger',
    trend: 'stable',
    change: '0%'
  }
])

// 分类选项
const categories = [
  { value: 'vegetables', label: '蔬菜类' },
  { value: 'meat', label: '肉类' },
  { value: 'seafood', label: '海鲜类' },
  { value: 'dairy', label: '乳制品' },
  { value: 'grains', label: '粮食类' },
  { value: 'spices', label: '调料类' },
  { value: 'beverages', label: '饮品类' },
  { value: 'others', label: '其他' }
]

// 状态选项
const statusOptions = [
  { value: InventoryStatus.NORMAL, label: '正常' },
  { value: InventoryStatus.LOW, label: '库存不足' },
  { value: InventoryStatus.OUT, label: '缺货' },
  { value: InventoryStatus.EXPIRED, label: '已过期' },
  { value: InventoryStatus.DAMAGED, label: '已损坏' }
]

// 方法
const loadInventoryItems = async () => {
  loading.value = true
  try {
    const params = {
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    const response = await inventoryAPI.getInventoryItems(params)
    if (response.success) {
      inventoryItems.value = response.data?.items || []
      pagination.total = response.data?.total || 0
    }
  } catch (error) {
    console.error('Load inventory items failed:', error)
    ElMessage.error('加载库存列表失败')
  } finally {
    loading.value = false
  }
}

const loadActiveAlerts = async () => {
  try {
    const response = await inventoryAPI.getInventoryAlerts({
      resolved: false,
      pageSize: 10
    })
    if (response.success) {
      activeAlerts.value = response.data?.alerts || []
    }
  } catch (error) {
    console.error('Load inventory alerts failed:', error)
  }
}

const handleFilterChange = () => {
  pagination.page = 1
  loadInventoryItems()
}

const handleSearch = () => {
  pagination.page = 1
  loadInventoryItems()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadInventoryItems()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadInventoryItems()
}

const handleSelectionChange = (selection: InventoryItem[]) => {
  selectedItems.value = selection
}

const setViewMode = (mode: 'table' | 'card') => {
  viewMode.value = mode
}

const handleItemClick = (item: InventoryItem) => {
  selectedItem.value = item
  showDetailDialog.value = true
}

const viewItemDetail = (item: InventoryItem) => {
  selectedItem.value = item
  showDetailDialog.value = true
}

const handleAddItem = () => {
  showAddDialog.value = true
}

const adjustStock = (item: InventoryItem) => {
  adjustingItem.value = item
  showAdjustDialog.value = true
}

const handleItemAction = async (command: string, item: InventoryItem) => {
  switch (command) {
    case 'edit':
      // 编辑商品
      break
    case 'movement':
      // 查看变动记录
      break
    case 'batch':
      // 批次管理
      break
    case 'forecast':
      // 需求预测
      await showForecast(item)
      break
    case 'delete':
      await deleteItem(item)
      break
  }
}

const showForecast = async (item: InventoryItem) => {
  try {
    const response = await inventoryAPI.forecastInventory(item.id, 30)
    if (response.success && response.data) {
      ElMessage.info(`${item.name} 未来30天预测: ${response.data.recommendations.join(', ')}`)
    }
  } catch (error) {
    ElMessage.error('获取需求预测失败')
  }
}

const deleteItem = async (item: InventoryItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除商品"${item.name}"吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    const response = await inventoryAPI.deleteInventoryItem(item.id)
    if (response.success) {
      ElMessage.success('商品删除成功')
      loadInventoryItems()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('商品删除失败')
    }
  }
}

const handleBatchAction = async (command: string) => {
  switch (command) {
    case 'export':
      await exportInventory()
      break
    case 'import':
      // 导入库存
      break
    case 'adjust':
      if (selectedItems.value.length === 0) {
        ElMessage.warning('请先选择要调整的商品')
        return
      }
      showBatchAdjustDialog.value = true
      break
    case 'report':
      await generateReport()
      break
  }
}

const exportInventory = async () => {
  try {
    const blob = await inventoryAPI.exportInventory('excel')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('库存导出成功')
  } catch (error) {
    ElMessage.error('库存导出失败')
  }
}

const generateReport = async () => {
  try {
    const blob = await inventoryAPI.generateInventoryReport('valuation')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory-valuation-${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('库存价值报告生成成功')
  } catch (error) {
    ElMessage.error('报告生成失败')
  }
}

const acknowledgeAlert = async (alertId: number) => {
  try {
    const response = await inventoryAPI.acknowledgeAlert(alertId)
    if (response.success) {
      ElMessage.success('警报确认成功')
      loadActiveAlerts()
    }
  } catch (error) {
    ElMessage.error('警报确认失败')
  }
}

const resolveAlert = async (alertId: number) => {
  try {
    const { value: solution } = await ElMessageBox.prompt('请输入解决方案', '解决警报', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    const response = await inventoryAPI.resolveAlert(alertId, solution)
    if (response.success) {
      ElMessage.success('警报解决成功')
      loadActiveAlerts()
      loadInventoryItems()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('警报解决失败')
    }
  }
}

// 事件处理
const handleItemUpdated = () => {
  loadInventoryItems()
  showDetailDialog.value = false
}

const handleAdjustmentCompleted = () => {
  loadInventoryItems()
  showAdjustDialog.value = false
}

const handleItemCreated = () => {
  loadInventoryItems()
  showAddDialog.value = false
}

const handleBatchAdjustmentCompleted = () => {
  loadInventoryItems()
  showBatchAdjustDialog.value = false
}

// 工具函数
const getStockStatusClass = (item: InventoryItem) => {
  const ratio = item.currentStock / item.minStock
  if (ratio <= 0) return 'out-of-stock'
  if (ratio < 0.5) return 'low-stock'
  return 'normal-stock'
}

const getStatusTagType = (status: InventoryStatus) => {
  const typeMap = {
    [InventoryStatus.NORMAL]: 'success',
    [InventoryStatus.LOW]: 'warning',
    [InventoryStatus.OUT]: 'danger',
    [InventoryStatus.EXPIRED]: 'danger',
    [InventoryStatus.DAMAGED]: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: InventoryStatus) => {
  const labelMap = {
    [InventoryStatus.NORMAL]: '正常',
    [InventoryStatus.LOW]: '库存不足',
    [InventoryStatus.OUT]: '缺货',
    [InventoryStatus.EXPIRED]: '已过期',
    [InventoryStatus.DAMAGED]: '已损坏'
  }
  return labelMap[status] || status
}

const getUnitLabel = (unit: InventoryUnit) => {
  const labelMap = {
    [InventoryUnit.PIECES]: '件',
    [InventoryUnit.KG]: 'kg',
    [InventoryUnit.G]: 'g',
    [InventoryUnit.L]: 'L',
    [InventoryUnit.ML]: 'ml',
    [InventoryUnit.BOX]: '盒',
    [InventoryUnit.BOTTLE]: '瓶',
    [InventoryUnit.BAG]: '袋',
    [InventoryUnit.PACK]: '包'
  }
  return labelMap[unit] || unit
}

const getAlertType = (level: AlertLevel) => {
  const typeMap = {
    [AlertLevel.INFO]: 'info',
    [AlertLevel.WARNING]: 'warning',
    [AlertLevel.CRITICAL]: 'error',
    [AlertLevel.EMERGENCY]: 'error'
  }
  return typeMap[level] || 'info'
}

const getStockRangeStyle = (item: InventoryItem) => {
  const min = item.minStock
  const max = item.maxStock
  const current = item.currentStock
  const percentage = Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100))

  let backgroundColor = '#67c23a' // 绿色
  if (percentage < 30) {
    backgroundColor = '#f56c6c' // 红色
  } else if (percentage < 60) {
    backgroundColor = '#e6a23c' // 黄色
  }

  return {
    width: `${percentage}%`,
    backgroundColor
  }
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadInventoryItems()
  loadActiveAlerts()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.inventory-management {
  .inventory-overview {
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

          &.danger {
            background: $danger-light;
            color: $danger-color;
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

  .inventory-alerts {
    margin-bottom: $spacing-6;

    .alert-item {
      margin-bottom: $spacing-3;

      .alert-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .alert-actions {
          display: flex;
          gap: $spacing-2;
        }
      }
    }
  }

  .inventory-toolbar {
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

  .inventory-table {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    .item-info {
      .name {
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-1;
      }

      .code,
      .brand {
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-bottom: $spacing-1;
      }
    }

    .stock-info {
      &.normal-stock {
        .stock-value {
          color: $success-color;
        }
      }

      &.low-stock {
        .stock-value {
          color: $warning-color;
        }
      }

      &.out-of-stock {
        .stock-value {
          color: $danger-color;
        }
      }

      .stock-value {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        margin-bottom: $spacing-1;
      }

      .stock-unit {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .stock-range {
      .range-bar {
        width: 100%;
        height: 6px;
        background: $gray-200;
        border-radius: 3px;
        margin-bottom: $spacing-1;
        overflow: hidden;

        .range-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease, background-color 0.3s ease;
        }
      }

      .range-label {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .total-value {
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    .pagination {
      padding: $spacing-4;
      text-align: right;
      border-top: 1px solid $border-primary;
    }
  }

  .inventory-cards {
    .inventory-card {
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
        margin-bottom: $spacing-3;

        .item-name {
          font-weight: $font-weight-medium;
          color: $text-primary;
        }
      }

      .card-content {
        margin-bottom: $spacing-4;

        .stock-display {
          text-align: center;
          margin-bottom: $spacing-3;

          .stock-number {
            font-size: $font-size-2xl;
            font-weight: $font-weight-bold;
            margin-bottom: $spacing-1;

            &.normal-stock {
              color: $success-color;
            }

            &.low-stock {
              color: $warning-color;
            }

            &.out-of-stock {
              color: $danger-color;
            }
          }

          .stock-unit {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .stock-range {
          margin-bottom: $spacing-3;

          .range-bar {
            width: 100%;
            height: 6px;
            background: $gray-200;
            border-radius: 3px;
            margin-bottom: $spacing-1;
            overflow: hidden;

            .range-fill {
              height: 100%;
              border-radius: 3px;
              transition: width 0.3s ease, background-color 0.3s ease;
            }
          }

          .range-text {
            font-size: $font-size-xs;
            color: $text-secondary;
            text-align: center;
          }
        }

        .item-meta {
          .meta-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: $spacing-1;

            .label {
              font-size: $font-size-sm;
              color: $text-secondary;
            }

            .value {
              font-size: $font-size-sm;
              font-weight: $font-weight-medium;
              color: $text-primary;
            }
          }
        }
      }

      .card-footer {
        text-align: center;
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .inventory-management {
    .inventory-toolbar {
      flex-direction: column;
      gap: $spacing-4;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }
    }

    .inventory-cards {
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
  .inventory-management {
    .inventory-toolbar,
    .inventory-table,
    .inventory-cards .inventory-card {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }
  }
}
</style>