<template>
  <div class="customer-status-tracker">
    <el-card class="status-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">客户状态跟踪</span>
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <div class="status-overview">
        <div class="status-item active">
          <div class="status-count">{{ statistics.active || 0 }}</div>
          <div class="status-label">活跃客户</div>
        </div>
        <div class="status-item inactive">
          <div class="status-count">{{ statistics.inactive || 0 }}</div>
          <div class="status-label">非活跃客户</div>
        </div>
        <div class="status-item blacklisted">
          <div class="status-count">{{ statistics.blacklisted || 0 }}</div>
          <div class="status-label">黑名单客户</div>
        </div>
        <div class="status-item total">
          <div class="status-count">{{ statistics.total || 0 }}</div>
          <div class="status-label">客户总数</div>
        </div>
      </div>
    </el-card>

    <el-card class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="客户姓名">
          <el-input v-model="filters.name" placeholder="请输入客户姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="黑名单" value="blacklisted" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="filters.registerDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="customerList" stripe v-loading="loading" border>
        <el-table-column prop="name" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalSpent" label="累计消费" width="120">
          <template #default="{ row }">
            ¥{{ row.totalSpent?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalOrders" label="订单数" width="80" />
        <el-table-column prop="points" label="积分" width="80" />
        <el-table-column prop="lastVisitAt" label="最后访问" width="160">
          <template #default="{ row }">
            {{ formatDate(row.lastVisitAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button type="warning" link size="small" @click="handleChangeStatus(row)">
              修改状态
            </el-button>
            <el-button type="info" link size="small" @click="handleViewHistory(row)">
              状态历史
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="statusDialogVisible" title="修改客户状态" width="500px">
      <el-form :model="statusForm" :rules="statusRules" ref="statusFormRef" label-width="100px">
        <el-form-item label="客户姓名">
          <el-input v-model="statusForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="getStatusType(statusForm.currentStatus)" size="small">
            {{ getStatusText(statusForm.currentStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态" prop="newStatus">
          <el-select v-model="statusForm.newStatus" placeholder="请选择新状态">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="黑名单" value="blacklisted" />
          </el-select>
        </el-form-item>
        <el-form-item label="变更原因" prop="reason">
          <el-input
            v-model="statusForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入变更原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStatusSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="historyDialogVisible" title="客户状态历史" width="800px">
      <el-table :data="statusHistoryList" stripe border max-height="400">
        <el-table-column prop="oldStatus" label="旧状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.oldStatus" :type="getStatusType(row.oldStatus)" size="small">
              {{ getStatusText(row.oldStatus) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="newStatus" label="新状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.newStatus)" size="small">
              {{ getStatusText(row.newStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="changedBy" label="变更人" width="120" />
        <el-table-column prop="changedAt" label="变更时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.changedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="变更原因" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getCustomers, updateCustomerStatus, getCustomerStatusHistory, getCustomerStatistics } from '@/api/customer'
import type { Customer, CustomerStatusHistory } from '@/api/customer'

const loading = ref(false)
const submitting = ref(false)
const statusDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const statusFormRef = ref()

const statistics = reactive({
  active: 0,
  inactive: 0,
  blacklisted: 0,
  total: 0
})

const filters = reactive({
  name: '',
  phone: '',
  status: '',
  registerDateRange: []
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const customerList = ref<Customer[]>([])
const statusHistoryList = ref<CustomerStatusHistory[]>([])

const statusForm = reactive({
  customerId: '',
  customerName: '',
  currentStatus: '',
  newStatus: '',
  reason: ''
})

const statusRules = {
  newStatus: [
    { required: true, message: '请选择新状态', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入变更原因', trigger: 'blur' },
    { min: 5, message: '变更原因至少5个字符', trigger: 'blur' }
  ]
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    active: 'success',
    inactive: 'info',
    blacklisted: 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    blacklisted: '黑名单'
  }
  return textMap[status] || status
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadStatistics = async () => {
  try {
    const data = await getCustomerStatistics()
    Object.assign(statistics, data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadCustomerList = async () => {
  loading.value = true
  try {
    const params = {
      keyword: filters.name,
      phone: filters.phone,
      status: filters.status,
      page: pagination.page,
      size: pagination.size
    }

    if (filters.registerDateRange && filters.registerDateRange.length === 2) {
      Object.assign(params, {
        registerDateStart: filters.registerDateRange[0],
        registerDateEnd: filters.registerDateRange[1]
      })
    }

    const result = await getCustomers(params)
    customerList.value = result.data || []
    pagination.total = result.total || 0
  } catch (error) {
    ElMessage.error('加载客户列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadStatistics()
  loadCustomerList()
}

const handleSearch = () => {
  pagination.page = 1
  loadCustomerList()
}

const handleReset = () => {
  filters.name = ''
  filters.phone = ''
  filters.status = ''
  filters.registerDateRange = []
  pagination.page = 1
  loadCustomerList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadCustomerList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadCustomerList()
}

const handleViewDetail = (row: Customer) => {
  ElMessage.info('查看详情功能待实现')
}

const handleChangeStatus = (row: Customer) => {
  statusForm.customerId = row.id
  statusForm.customerName = row.name
  statusForm.currentStatus = row.status
  statusForm.newStatus = ''
  statusForm.reason = ''
  statusDialogVisible.value = true
}

const handleStatusSubmit = async () => {
  if (!statusFormRef.value) return

  try {
    await statusFormRef.value.validate()
    submitting.value = true

    await updateCustomerStatus(statusForm.customerId, statusForm.newStatus as any)

    ElMessage.success('状态修改成功')
    statusDialogVisible.value = false
    refreshData()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '状态修改失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleViewHistory = async (row: Customer) => {
  try {
    const result = await getCustomerStatusHistory(row.id)
    statusHistoryList.value = result.data || []
    historyDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载状态历史失败')
    console.error(error)
  }
}

onMounted(() => {
  loadStatistics()
  loadCustomerList()
})
</script>

<style scoped lang="scss">
.customer-status-tracker {
  padding: 20px;

  .status-card,
  .filter-card,
  .table-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .status-overview {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;

    .status-item {
      text-align: center;

      .status-count {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .status-label {
        font-size: 14px;
        color: #909399;
      }

      &.active .status-count {
        color: #67c23a;
      }

      &.inactive .status-count {
        color: #909399;
      }

      &.blacklisted .status-count {
        color: #f56c6c;
      }

      &.total .status-count {
        color: #409eff;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
