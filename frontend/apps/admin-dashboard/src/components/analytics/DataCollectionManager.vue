<template>
  <div class="data-collection-manager">
    <el-card class="collection-card">
      <template #header>
        <div class="card-header">
          <span>数据采集管理</span>
          <el-button-group>
            <el-button size="small" @click="refreshSources">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加数据源
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="collection-overview">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in collectionMetrics" :key="metric.key">
            <div class="metric-item">
              <div class="metric-icon" :style="{ backgroundColor: metric.color }">
                <el-icon :size="24">
                  <component :is="metric.icon" />
                </el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metric.value }}</div>
                <div class="metric-label">{{ metric.label }}</div>
                <div class="metric-status" :class="metric.status">
                  {{ getStatusText(metric.status) }}
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="collection-filters">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item label="数据源类型">
            <el-select v-model="filters.sourceType" placeholder="全部" clearable>
              <el-option label="订单系统" value="order" />
              <el-option label="会员系统" value="member" />
              <el-option label="库存系统" value="inventory" />
              <el-option label="支付系统" value="payment" />
              <el-option label="评价系统" value="review" />
              <el-option label="外部API" value="external" />
            </el-select>
          </el-form-item>
          <el-form-item label="采集方式">
            <el-select v-model="filters.collectionType" placeholder="全部" clearable>
              <el-option label="实时采集" value="realtime" />
              <el-option label="批量采集" value="batch" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="全部" clearable>
              <el-option label="正常" value="success" />
              <el-option label="失败" value="failed" />
              <el-option label="待同步" value="pending" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadSources">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="dataSourceList" stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="sourceName" label="数据源名称" min-width="150" />
        <el-table-column label="数据源类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getSourceTypeTagType(row.sourceType)" size="small">
              {{ getSourceTypeText(row.sourceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="采集方式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.collectionType === 'realtime' ? 'success' : 'info'" size="small">
              {{ row.collectionType === 'realtime' ? '实时' : '批量' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="采集频率" width="120">
          <template #default="{ row }">
            {{ getFrequencyText(row.collectionFrequency) }}
          </template>
        </el-table-column>
        <el-table-column label="最后同步" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastSyncAt) }}
          </template>
        </el-table-column>
        <el-table-column label="同步状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSyncStatusTagType(row.syncStatus)" size="small">
              {{ getSyncStatusText(row.syncStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="handleToggleEnabled(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleSyncNow(row)">
              立即同步
            </el-button>
            <el-button size="small" text type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button size="small" text type="primary" @click="handleViewLogs(row)">
              日志
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="showAddDialog" :title="editingSource ? '编辑数据源' : '添加数据源'" width="60%">
      <el-form :model="sourceForm" :rules="sourceFormRules" ref="sourceFormRef" label-width="120px">
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="sourceForm.sourceName" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="数据源类型" prop="sourceType">
          <el-select v-model="sourceForm.sourceType" placeholder="请选择数据源类型">
            <el-option label="订单系统" value="order" />
            <el-option label="会员系统" value="member" />
            <el-option label="库存系统" value="inventory" />
            <el-option label="支付系统" value="payment" />
            <el-option label="评价系统" value="review" />
            <el-option label="外部API" value="external" />
          </el-select>
        </el-form-item>
        <el-form-item label="采集方式" prop="collectionType">
          <el-radio-group v-model="sourceForm.collectionType">
            <el-radio label="realtime">实时采集</el-radio>
            <el-radio label="batch">批量采集</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="采集频率" prop="collectionFrequency" v-if="sourceForm.collectionType === 'batch'">
          <el-select v-model="sourceForm.collectionFrequency" placeholder="请选择采集频率">
            <el-option label="每小时" :value="3600" />
            <el-option label="每6小时" :value="21600" />
            <el-option label="每天" :value="86400" />
            <el-option label="每周" :value="604800" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接配置" prop="connectionConfig">
          <el-input
            v-model="sourceForm.connectionConfigJson"
            type="textarea"
            :rows="6"
            placeholder='请输入连接配置JSON，例如：{"url": "http://api.example.com", "apiKey": "xxx"}'
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="sourceForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSource">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="showLogsDialog" title="同步日志" width="80%">
      <el-table :data="syncLogs" stripe max-height="500">
        <el-table-column prop="logTime" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.logTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recordsCollected" label="采集记录数" width="120" />
        <el-table-column prop="duration" label="耗时（秒）" width="120" />
        <el-table-column prop="errorMessage" label="错误信息" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Plus,
  Search,
  RefreshLeft,
  Connection,
  DataLine,
  Clock,
  SuccessFilled,
  CircleCloseFilled,
  WarningFilled
} from '@element-plus/icons-vue'

interface DataSource {
  id: string
  sourceName: string
  sourceType: string
  connectionConfig: object
  collectionType: string
  collectionFrequency?: number
  enabled: boolean
  lastSyncAt?: string
  syncStatus: string
  errorMessage?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

interface SyncLog {
  id: string
  sourceId: string
  logTime: string
  status: string
  recordsCollected: number
  duration: number
  errorMessage?: string
}

const loading = ref(false)
const showAddDialog = ref(false)
const showLogsDialog = ref(false)
const editingSource = ref<DataSource | null>(null)
const sourceFormRef = ref()

const filters = reactive({
  sourceType: '',
  collectionType: '',
  status: ''
})

const sourceForm = reactive({
  id: '',
  sourceName: '',
  sourceType: '',
  collectionType: 'realtime',
  collectionFrequency: 86400,
  connectionConfig: {} as object,
  connectionConfigJson: '',
  enabled: true
})

const sourceFormRules = {
  sourceName: [
    { required: true, message: '请输入数据源名称', trigger: 'blur' }
  ],
  sourceType: [
    { required: true, message: '请选择数据源类型', trigger: 'change' }
  ],
  collectionType: [
    { required: true, message: '请选择采集方式', trigger: 'change' }
  ],
  connectionConfigJson: [
    { required: true, message: '请输入连接配置', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        try {
          JSON.parse(value)
          callback()
        } catch (e) {
          callback(new Error('连接配置必须是有效的JSON格式'))
        }
      },
      trigger: 'blur'
    }
  ]
}

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const collectionMetrics = ref([
  {
    key: 'total',
    label: '数据源总数',
    value: 6,
    status: 'success',
    icon: 'Connection',
    color: '#409EFF'
  },
  {
    key: 'active',
    label: '活跃数据源',
    value: 5,
    status: 'success',
    icon: 'DataLine',
    color: '#67C23A'
  },
  {
    key: 'synced',
    label: '今日同步',
    value: 120,
    status: 'success',
    icon: 'SuccessFilled',
    color: '#67C23A'
  },
  {
    key: 'failed',
    label: '同步失败',
    value: 2,
    status: 'error',
    icon: 'CircleCloseFilled',
    color: '#F56C6C'
  }
])

const dataSourceList = ref<DataSource[]>([])
const syncLogs = ref<SyncLog[]>([])

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    success: '正常',
    warning: '警告',
    error: '错误'
  }
  return statusMap[status] || status
}

const getSourceTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    order: '订单系统',
    member: '会员系统',
    inventory: '库存系统',
    payment: '支付系统',
    review: '评价系统',
    external: '外部API'
  }
  return typeMap[type] || type
}

const getSourceTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    order: 'primary',
    member: 'success',
    inventory: 'warning',
    payment: 'danger',
    review: 'info',
    external: ''
  }
  return typeMap[type] || ''
}

const getFrequencyText = (frequency?: number) => {
  if (!frequency) return '-'
  const hours = frequency / 3600
  if (hours < 1) return `${Math.round(frequency / 60)}分钟`
  if (hours < 24) return `${hours}小时`
  if (hours < 168) return `${Math.round(hours / 24)}天`
  return `${Math.round(hours / 168)}周`
}

const getSyncStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '待同步'
  }
  return statusMap[status] || status
}

const getSyncStatusTagType = (status: string) => {
  const statusMap: Record<string, any> = {
    success: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return statusMap[status] || ''
}

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const loadSources = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/analytics/data-sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...filters,
        page: pagination.page,
        size: pagination.size
      })
    })
    const data = await response.json()
    if (data.success) {
      dataSourceList.value = data.data.items
      pagination.total = data.data.total
    }
  } catch (error) {
    ElMessage.error('加载数据源失败')
  } finally {
    loading.value = false
  }
}

const refreshSources = () => {
  loadSources()
}

const resetFilters = () => {
  filters.sourceType = ''
  filters.collectionType = ''
  filters.status = ''
  pagination.page = 1
  loadSources()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadSources()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadSources()
}

const handleToggleEnabled = async (row: DataSource) => {
  try {
    const response = await fetch(`/api/analytics/data-sources/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled: row.enabled })
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success(row.enabled ? '数据源已启用' : '数据源已禁用')
    } else {
      row.enabled = !row.enabled
      ElMessage.error('操作失败')
    }
  } catch (error) {
    row.enabled = !row.enabled
    ElMessage.error('操作失败')
  }
}

const handleSyncNow = async (row: DataSource) => {
  try {
    ElMessage.info('正在同步数据...')
    const response = await fetch(`/api/analytics/data-sources/${row.id}/sync`, {
      method: 'POST'
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success('数据同步成功')
      row.lastSyncAt = new Date().toISOString()
      row.syncStatus = 'success'
    } else {
      ElMessage.error('数据同步失败')
      row.syncStatus = 'failed'
    }
  } catch (error) {
    ElMessage.error('数据同步失败')
    row.syncStatus = 'failed'
  }
}

const handleEdit = (row: DataSource) => {
  editingSource.value = row
  sourceForm.id = row.id
  sourceForm.sourceName = row.sourceName
  sourceForm.sourceType = row.sourceType
  sourceForm.collectionType = row.collectionType
  sourceForm.collectionFrequency = row.collectionFrequency || 86400
  sourceForm.connectionConfig = row.connectionConfig
  sourceForm.connectionConfigJson = JSON.stringify(row.connectionConfig, null, 2)
  sourceForm.enabled = row.enabled
  showAddDialog.value = true
}

const handleSaveSource = async () => {
  try {
    await sourceFormRef.value.validate()
    
    const payload = {
      sourceName: sourceForm.sourceName,
      sourceType: sourceForm.sourceType,
      collectionType: sourceForm.collectionType,
      collectionFrequency: sourceForm.collectionType === 'batch' ? sourceForm.collectionFrequency : undefined,
      connectionConfig: JSON.parse(sourceForm.connectionConfigJson),
      enabled: sourceForm.enabled
    }

    const url = editingSource.value 
      ? `/api/analytics/data-sources/${editingSource.value.id}`
      : '/api/analytics/data-sources'
    
    const method = editingSource.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(editingSource.value ? '数据源更新成功' : '数据源添加成功')
      showAddDialog.value = false
      editingSource.value = null
      loadSources()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  }
}

const handleViewLogs = async (row: DataSource) => {
  try {
    const response = await fetch(`/api/analytics/data-sources/${row.id}/logs`)
    const data = await response.json()
    if (data.success) {
      syncLogs.value = data.data
      showLogsDialog.value = true
    }
  } catch (error) {
    ElMessage.error('加载日志失败')
  }
}

const handleDelete = async (row: DataSource) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除数据源"${row.sourceName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await fetch(`/api/analytics/data-sources/${row.id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success('数据源删除成功')
      loadSources()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadSources()
})
</script>

<style scoped lang="scss">
.data-collection-manager {
  .collection-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .collection-overview {
    margin-bottom: 20px;
    
    .metric-item {
      display: flex;
      align-items: center;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .metric-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 15px;
      }
      
      .metric-info {
        flex: 1;
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 5px;
        }
        
        .metric-status {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          
          &.success {
            background: #f0f9ff;
            color: #67c23a;
          }
          
          &.warning {
            background: #fdf6ec;
            color: #e6a23c;
          }
          
          &.error {
            background: #fef0f0;
            color: #f56c6c;
          }
        }
      }
    }
  }

  .collection-filters {
    margin-bottom: 20px;
    
    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
