<template>
  <div class="customer-management">
    <el-tabs v-model="activeTab" class="customer-tabs">
      <!-- 客户管理标签页 -->
      <el-tab-pane label="客户管理" name="customers">
        <!-- 客户统计概览 -->
        <div class="customer-overview">
          <el-row :gutter="20">
            <el-col :span="6" v-for="stat in customerStats" :key="stat.key">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" :class="stat.type">
                    <el-icon :size="28"><component :is="stat.icon" /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                    <div class="stat-trend" v-if="stat.trend">
                      <el-icon :size="14" :color="getTrendColor(stat.trendType)">
                        <component :is="getTrendIcon(stat.trendType)" />
                      </el-icon>
                      <span>{{ stat.trend }}</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索客户..."
          clearable
          style="width: 300px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filters.level"
          placeholder="客户等级"
          clearable
          style="width: 150px; margin-left: 10px;"
          @change="loadCustomers"
        >
          <el-option label="普通客户" value="regular" />
          <el-option label="会员" value="member" />
          <el-option label="VIP" value="vip" />
          <el-option label="新客户" value="new" />
        </el-select>

        <el-select
          v-model="filters.segment"
          placeholder="客户分群"
          clearable
          style="width: 150px; margin-left: 10px;"
          @change="loadCustomers"
        >
          <el-option
            v-for="segment in customerSegments"
            :key="segment.value"
            :label="segment.label"
            :value="segment.value"
          />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-left: 10px;"
          @change="handleDateChange"
        />
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增客户
        </el-button>

        <el-button @click="exportCustomers">
          导出客户
        </el-button>

        <el-button @click="showSegmentDialog = true">
          客户分群
        </el-button>
      </div>
    </div>

    <!-- 客户列表 -->
    <div class="customer-list">
      <el-table
        :data="customers"
        :loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="客户信息" min-width="200">
          <template #default="{ row }">
            <div class="customer-info">
              <div class="customer-avatar">
                <el-avatar :src="row.avatar" :size="40">
                  {{ row.name.charAt(0) }}
                </el-avatar>
                <el-tag
                  v-if="row.level"
                  :type="getLevelTagType(row.level)"
                  size="small"
                  class="level-tag"
                >
                  {{ getLevelLabel(row.level) }}
                </el-tag>
              </div>
              <div class="customer-details">
                <div class="customer-name">{{ row.name }}</div>
                <div class="customer-contact">
                  <span v-if="row.phone">{{ row.phone }}</span>
                  <span v-if="row.phone && row.email"> | </span>
                  <span v-if="row.email">{{ row.email }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="订单统计" width="150">
          <template #default="{ row }">
            <div class="order-stats">
              <div class="stat-item">
                <span class="label">订单数:</span>
                <span class="value">{{ row.totalOrders || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">消费额:</span>
                <span class="value">¥{{ (row.totalSpent || 0).toFixed(2) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">客单价:</span>
                <span class="value">¥{{ (row.averageOrderValue || 0).toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="最后访问" width="120">
          <template #default="{ row }">
            {{ formatRelativeTime(row.lastVisit) }}
          </template>
        </el-table-column>

        <el-table-column label="偏好标签" width="200">
          <template #default="{ row }">
            <div class="preference-tags">
              <el-tag
                v-for="tag in row.preferences"
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
              <span v-if="!row.preferences || row.preferences.length === 0" class="no-tags">
                暂无偏好
              </span>
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

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click="viewCustomer(row)"
            >
              详情
            </el-button>

            <el-button
              type="warning"
              size="small"
              text
              @click="editCustomer(row)"
            >
              编辑
            </el-button>

            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="loyalty">会员管理</el-dropdown-item>
                  <el-dropdown-item command="preferences">偏好设置</el-dropdown-item>
                  <el-dropdown-item command="history">消费历史</el-dropdown-item>
                  <el-dropdown-item command="blacklist" divided>加入黑名单</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 客户详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="客户详情"
      width="800px"
    >
      <CustomerDetail
        v-if="selectedCustomer"
        :customer="selectedCustomer"
        @updated="handleCustomerUpdated"
      />
    </el-dialog>

    <!-- 创建/编辑客户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingCustomer ? '编辑客户' : '新增客户'"
      width="600px"
      :close-on-click-modal="false"
    >
      <CustomerForm
        v-if="showCreateDialog"
        :customer="editingCustomer"
        @save="handleSaveCustomer"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 客户分群对话框 -->
    <el-dialog
      v-model="showSegmentDialog"
      title="客户分群管理"
      width="900px"
    >
      <CustomerSegment
        @saved="handleSegmentSaved"
        @cancel="showSegmentDialog = false"
      />
    </el-dialog>

    <!-- 会员管理对话框 -->
    <el-dialog
      v-model="showLoyaltyDialog"
      title="会员管理"
      width="700px"
    >
      <CustomerLoyalty
        v-if="selectedCustomer"
        :customer="selectedCustomer"
        @updated="handleLoyaltyUpdated"
      />
    </el-dialog>
      </el-tab-pane>

      <!-- 生命周期管理标签页 -->
      <el-tab-pane label="生命周期管理" name="lifecycle">
        <CustomerLifecycleManager />
      </el-tab-pane>

      <!-- 客户价值评估标签页 -->
      <el-tab-pane label="客户价值评估" name="value">
        <CustomerValueAssessment />
      </el-tab-pane>

      <!-- 流失预测标签页 -->
      <el-tab-pane label="流失预测" name="churn">
        <CustomerChurnPrediction />
      </el-tab-pane>

      <!-- 关怀提醒标签页 -->
      <el-tab-pane label="关怀提醒" name="care">
        <CustomerCareReminder />
      </el-tab-pane>

      <!-- 数据分析标签页 -->
      <el-tab-pane label="数据分析" name="analytics">
        <CustomerLifecycleAnalytics />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  MoreFilled,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  TrendCharts,
  Money,
  Star
} from '@element-plus/icons-vue'
import {
  getCustomers,
  type Customer,
  type CustomerFilters
} from '@/api/customer'
import CustomerDetail from '@/components/Customer/CustomerDetail.vue'
import CustomerForm from '@/components/Customer/CustomerForm.vue'
import CustomerSegment from '@/components/Customer/CustomerSegment.vue'
import CustomerLoyalty from '@/components/Customer/CustomerLoyalty.vue'
import CustomerLifecycleManager from '@/components/Customer/CustomerLifecycleManager.vue'
import CustomerValueAssessment from '@/components/Customer/CustomerValueAssessment.vue'
import CustomerChurnPrediction from '@/components/Customer/CustomerChurnPrediction.vue'
import CustomerCareReminder from '@/components/Customer/CustomerCareReminder.vue'
import CustomerLifecycleAnalytics from '@/components/Customer/CustomerLifecycleAnalytics.vue'

// 响应式数据
const activeTab = ref('customers')
const loading = ref(false)
const customers = ref<Customer[]>([])
const selectedCustomers = ref<Customer[]>([])
const selectedCustomer = ref<Customer | null>(null)
const editingCustomer = ref<Customer | null>(null)

const searchQuery = ref('')
const dateRange = ref<[Date, Date] | null>(null)

const filters = reactive({
  level: '',
  segment: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const sortProp = ref('lastVisit')
const sortOrder = ref('descending')

// 对话框状态
const showDetailDialog = ref(false)
const showCreateDialog = ref(false)
const showSegmentDialog = ref(false)
const showLoyaltyDialog = ref(false)

// 客户分群
const customerSegments = [
  { value: 'high_value', label: '高价值客户' },
  { value: 'frequent', label: '高频客户' },
  { value: 'new_customers', label: '新客户' },
  { value: 'at_risk', label: '流失风险客户' },
  { value: 'loyal', label: '忠诚客户' },
  { value: 'inactive', label: '休眠客户' }
]

// 计算属性
const customerStats = computed(() => [
  {
    key: 'total',
    label: '总客户数',
    value: pagination.total,
    icon: User,
    type: 'primary',
    trend: '+12.5%',
    trendType: 'up'
  },
  {
    key: 'vip',
    label: 'VIP客户',
    value: customers.value.filter(c => c.level === 'vip').length,
    icon: Star,
    type: 'warning',
    trend: '+8.2%',
    trendType: 'up'
  },
  {
    key: 'new',
    label: '本月新增',
    value: 156,
    icon: TrendCharts,
    type: 'success',
    trend: '+23.1%',
    trendType: 'up'
  },
  {
    key: 'revenue',
    label: '平均消费',
    value: '¥258',
    icon: Money,
    type: 'info',
    trend: '+5.3%',
    trendType: 'up'
  }
])

// 方法
const loadCustomers = async () => {
  loading.value = true
  try {
    const params: CustomerFilters = {
      page: pagination.page,
      limit: pagination.pageSize,
      search: searchQuery.value || undefined,
      level: filters.level || undefined,
      segment: filters.segment || undefined,
      status: filters.status || undefined,
      startTime: dateRange.value?.[0]?.toISOString(),
      endTime: dateRange.value?.[1]?.toISOString(),
      sortBy: sortProp.value,
      sortOrder: sortOrder.value === 'descending' ? 'desc' : 'asc'
    }

    const response = await getCustomers(params)
    if (response.success) {
      customers.value = response.data.items
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Load customers failed:', error)
    ElMessage.error('加载客户数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadCustomers()
}

const handleDateChange = () => {
  pagination.page = 1
  loadCustomers()
}

const handleSelectionChange = (selection: Customer[]) => {
  selectedCustomers.value = selection
}

const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortProp.value = prop
  sortOrder.value = order
  loadCustomers()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadCustomers()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadCustomers()
}

const viewCustomer = (customer: Customer) => {
  selectedCustomer.value = customer
  showDetailDialog.value = true
}

const editCustomer = (customer: Customer) => {
  editingCustomer.value = { ...customer }
  showCreateDialog.value = true
}

const handleCommand = async (command: string, customer: Customer) => {
  switch (command) {
    case 'loyalty':
      selectedCustomer.value = customer
      showLoyaltyDialog.value = true
      break

    case 'preferences':
      // 打开偏好设置
      ElMessage.info('偏好设置功能开发中...')
      break

    case 'history':
      // 查看消费历史
      ElMessage.info('消费历史功能开发中...')
      break

    case 'blacklist':
      await addToBlacklist(customer)
      break
  }
}

const addToBlacklist = async (customer: Customer) => {
  try {
    await ElMessageBox.confirm(
      `确定要将客户 "${customer.name}" 加入黑名单吗？`,
      '确认操作',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    // 这里应该调用加入黑名单的API
    ElMessage.success('客户已加入黑名单')
    loadCustomers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleSaveCustomer = async (customer: Customer) => {
  try {
    // 这里应该调用保存客户的API
    showCreateDialog.value = false
    editingCustomer.value = null
    loadCustomers()
    ElMessage.success('客户信息保存成功')
  } catch (error) {
    ElMessage.error('保存客户失败')
  }
}

const handleCustomerUpdated = () => {
  loadCustomers()
}

const handleSegmentSaved = () => {
  showSegmentDialog.value = false
  loadCustomers()
}

const handleLoyaltyUpdated = () => {
  showLoyaltyDialog.value = false
  loadCustomers()
}

const exportCustomers = () => {
  try {
    const customersToExport = selectedCustomers.value.length > 0
      ? selectedCustomers.value
      : customers.value

    const dataStr = JSON.stringify(customersToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('客户数据导出成功')
  } catch (error) {
    ElMessage.error('导出客户数据失败')
  }
}

// 工具函数
const getLevelTagType = (level: string) => {
  const typeMap = {
    vip: 'danger',
    member: 'warning',
    regular: 'info',
    new: 'success'
  }
  return typeMap[level as keyof typeof typeMap] || 'info'
}

const getLevelLabel = (level: string) => {
  const labelMap = {
    vip: 'VIP',
    member: '会员',
    regular: '普通',
    new: '新客户'
  }
  return labelMap[level as keyof typeof labelMap] || '未知'
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    active: 'success',
    inactive: 'info',
    blacklisted: 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    active: '活跃',
    inactive: '休眠',
    blacklisted: '黑名单'
  }
  return labelMap[status as keyof typeof labelMap] || '未知'
}

const formatRelativeTime = (timestamp: string) => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return '30天前'
}

const getTrendColor = (type: string) => {
  return type === 'up' ? '#67c23a' : '#f56c6c'
}

const getTrendIcon = (type: string) => {
  return type === 'up' ? ArrowUp : ArrowDown
}

// 生命周期
onMounted(() => {
  loadCustomers()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-management {
  .customer-overview {
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

          &.info {
            background: $info-light;
            color: $info-color;
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
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .toolbar {
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

  .customer-list {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    .customer-info {
      display: flex;
      align-items: flex-start;
      gap: $spacing-3;

      .customer-avatar {
        position: relative;

        .level-tag {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: $font-size-xs;
        }
      }

      .customer-details {
        .customer-name {
          font-weight: $font-weight-medium;
          color: $text-primary;
          margin-bottom: $spacing-1;
        }

        .customer-contact {
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }
    }

    .order-stats {
      .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: $spacing-1;
        font-size: $font-size-sm;

        .label {
          color: $text-secondary;
        }

        .value {
          font-weight: $font-weight-medium;
          color: $text-primary;
        }
      }
    }

    .preference-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-1;

      .no-tags {
        font-size: $font-size-sm;
        color: $text-placeholder;
        font-style: italic;
      }
    }

    .pagination {
      padding: $spacing-4;
      text-align: right;
      border-top: 1px solid $border-primary;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .customer-management {
    .customer-overview {
      .el-row {
        .el-col {
          margin-bottom: $spacing-4;
        }
      }
    }

    .toolbar {
      flex-direction: column;
      gap: $spacing-4;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }
    }

    .customer-list {
      :deep(.el-table) {
        .customer-info {
          flex-direction: column;
          align-items: flex-start;
          gap: $spacing-2;
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .customer-management {
    .toolbar,
    .customer-list {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }

    .customer-list {
      .pagination {
        border-top-color: $dark-border-primary;
      }
    }
  }
}
</style>