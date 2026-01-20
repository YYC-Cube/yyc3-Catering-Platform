<template>
  <div class="customer-history-query">
    <el-card class="customer-info-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">客户信息</span>
          <el-button type="primary" link @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <div class="customer-info" v-loading="customerLoading">
        <div class="info-row">
          <span class="label">客户姓名：</span>
          <span class="value">{{ customerInfo.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">手机号：</span>
          <span class="value">{{ customerInfo.phone }}</span>
        </div>
        <div class="info-row">
          <span class="label">邮箱：</span>
          <span class="value">{{ customerInfo.email || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">会员等级：</span>
          <span class="value">{{ customerInfo.memberLevel || '普通会员' }}</span>
        </div>
        <div class="info-row">
          <span class="label">累计消费：</span>
          <span class="value">¥{{ customerInfo.totalSpent?.toFixed(2) || '0.00' }}</span>
        </div>
        <div class="info-row">
          <span class="label">订单数：</span>
          <span class="value">{{ customerInfo.totalOrders || 0 }}</span>
        </div>
        <div class="info-row">
          <span class="label">积分：</span>
          <span class="value">{{ customerInfo.points || 0 }}</span>
        </div>
        <div class="info-row">
          <span class="label">注册时间：</span>
          <span class="value">{{ formatDate(customerInfo.createdAt) }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="history-tabs-card">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="订单历史" name="orders">
          <div class="tab-content">
            <div class="filter-bar">
              <el-date-picker
                v-model="orderFilters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 300px"
              />
              <el-button type="primary" @click="loadOrderHistory">查询</el-button>
              <el-button @click="resetOrderFilters">重置</el-button>
            </div>

            <el-table :data="orderHistoryList" stripe v-loading="orderLoading" border>
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column prop="orderAmount" label="订单金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.orderAmount?.toFixed(2) || '0.00' }}
                </template>
              </el-table-column>
              <el-table-column prop="orderStatus" label="订单状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getOrderStatusType(row.orderStatus)" size="small">
                    {{ getOrderStatusText(row.orderStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="支付方式" width="100" />
              <el-table-column prop="createdAt" label="下单时间" width="160">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleViewOrder(row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="orderPagination.page"
                v-model:page-size="orderPagination.size"
                :total="orderPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleOrderSizeChange"
                @current-change="handleOrderPageChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="积分历史" name="points">
          <div class="tab-content">
            <div class="filter-bar">
              <el-select v-model="pointFilters.type" placeholder="积分类型" clearable style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="获得" value="earn" />
                <el-option label="消费" value="spend" />
                <el-option label="过期" value="expire" />
              </el-select>
              <el-date-picker
                v-model="pointFilters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 300px"
              />
              <el-button type="primary" @click="loadPointsHistory">查询</el-button>
              <el-button @click="resetPointFilters">重置</el-button>
            </div>

            <el-table :data="pointsHistoryList" stripe v-loading="pointsLoading" border>
              <el-table-column prop="pointsChange" label="积分变化" width="120">
                <template #default="{ row }">
                  <span :class="row.pointsChange > 0 ? 'points-positive' : 'points-negative'">
                    {{ row.pointsChange > 0 ? '+' : '' }}{{ row.pointsChange }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="pointsAfter" label="变化后积分" width="120" />
              <el-table-column prop="changeType" label="变化类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getPointsTypeTag(row.changeType)" size="small">
                    {{ getPointsTypeText(row.changeType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" show-overflow-tooltip />
              <el-table-column prop="createdAt" label="时间" width="160">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="pointsPagination.page"
                v-model:page-size="pointsPagination.size"
                :total="pointsPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handlePointsSizeChange"
                @current-change="handlePointsPageChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="状态历史" name="status">
          <div class="tab-content">
            <el-table :data="statusHistoryList" stripe v-loading="statusLoading" border>
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

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="statusPagination.page"
                v-model:page-size="statusPagination.size"
                :total="statusPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleStatusSizeChange"
                @current-change="handleStatusPageChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="访问记录" name="visits">
          <div class="tab-content">
            <div class="filter-bar">
              <el-date-picker
                v-model="visitFilters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 300px"
              />
              <el-button type="primary" @click="loadVisitHistory">查询</el-button>
              <el-button @click="resetVisitFilters">重置</el-button>
            </div>

            <el-table :data="visitHistoryList" stripe v-loading="visitLoading" border>
              <el-table-column prop="visitType" label="访问类型" width="120" />
              <el-table-column prop="deviceType" label="设备类型" width="100" />
              <el-table-column prop="ipAddress" label="IP地址" width="150" />
              <el-table-column prop="location" label="位置" width="150" />
              <el-table-column prop="visitDuration" label="停留时长" width="100">
                <template #default="{ row }">
                  {{ formatDuration(row.visitDuration) }}
                </template>
              </el-table-column>
              <el-table-column prop="visitedAt" label="访问时间" width="160">
                <template #default="{ row }">
                  {{ formatDate(row.visitedAt) }}
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="visitPagination.page"
                v-model:page-size="visitPagination.size"
                :total="visitPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleVisitSizeChange"
                @current-change="handleVisitPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCustomerDetail, getCustomerOrderHistory, getCustomerPointsHistory, getCustomerStatusHistory } from '@/api/customer'
import type { Customer, CustomerStatusHistory } from '@/api/customer'

const route = useRoute()
const router = useRouter()

const customerId = ref(route.params.id as string)

const customerLoading = ref(false)
const orderLoading = ref(false)
const pointsLoading = ref(false)
const statusLoading = ref(false)
const visitLoading = ref(false)

const activeTab = ref('orders')

const customerInfo = reactive({
  id: '',
  name: '',
  phone: '',
  email: '',
  memberLevel: '',
  totalSpent: 0,
  totalOrders: 0,
  points: 0,
  createdAt: ''
})

const orderFilters = reactive({
  dateRange: []
})

const pointFilters = reactive({
  type: '',
  dateRange: []
})

const visitFilters = reactive({
  dateRange: []
})

const orderPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const pointsPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const statusPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const visitPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const orderHistoryList = ref<any[]>([])
const pointsHistoryList = ref<any[]>([])
const statusHistoryList = ref<CustomerStatusHistory[]>([])
const visitHistoryList = ref<any[]>([])

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours}小时${minutes}分${secs}秒`
}

const getOrderStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

const getOrderStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

const getPointsTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    earn: 'success',
    spend: 'warning',
    expire: 'info'
  }
  return typeMap[type] || ''
}

const getPointsTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    earn: '获得',
    spend: '消费',
    expire: '过期'
  }
  return textMap[type] || type
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

const loadCustomerInfo = async () => {
  customerLoading.value = true
  try {
    const data = await getCustomerDetail(customerId.value)
    Object.assign(customerInfo, data)
  } catch (error) {
    ElMessage.error('加载客户信息失败')
    console.error(error)
  } finally {
    customerLoading.value = false
  }
}

const loadOrderHistory = async () => {
  orderLoading.value = true
  try {
    const params = {
      page: orderPagination.page,
      size: orderPagination.size
    }

    if (orderFilters.dateRange && orderFilters.dateRange.length === 2) {
      Object.assign(params, {
        startDate: orderFilters.dateRange[0],
        endDate: orderFilters.dateRange[1]
      })
    }

    const result = await getCustomerOrderHistory(customerId.value, params)
    orderHistoryList.value = result.data || []
    orderPagination.total = result.total || 0
  } catch (error) {
    ElMessage.error('加载订单历史失败')
    console.error(error)
  } finally {
    orderLoading.value = false
  }
}

const loadPointsHistory = async () => {
  pointsLoading.value = true
  try {
    const params = {
      page: pointsPagination.page,
      size: pointsPagination.size
    }

    if (pointFilters.type) {
      Object.assign(params, { type: pointFilters.type })
    }

    if (pointFilters.dateRange && pointFilters.dateRange.length === 2) {
      Object.assign(params, {
        startDate: pointFilters.dateRange[0],
        endDate: pointFilters.dateRange[1]
      })
    }

    const result = await getCustomerPointsHistory(customerId.value, params)
    pointsHistoryList.value = result.data || []
    pointsPagination.total = result.total || 0
  } catch (error) {
    ElMessage.error('加载积分历史失败')
    console.error(error)
  } finally {
    pointsLoading.value = false
  }
}

const loadStatusHistory = async () => {
  statusLoading.value = true
  try {
    const result = await getCustomerStatusHistory(customerId.value, {
      page: statusPagination.page,
      size: statusPagination.size
    })
    statusHistoryList.value = result.data || []
    statusPagination.total = result.total || 0
  } catch (error) {
    ElMessage.error('加载状态历史失败')
    console.error(error)
  } finally {
    statusLoading.value = false
  }
}

const loadVisitHistory = async () => {
  visitLoading.value = true
  try {
    const params = {
      page: visitPagination.page,
      size: visitPagination.size
    }

    if (visitFilters.dateRange && visitFilters.dateRange.length === 2) {
      Object.assign(params, {
        startDate: visitFilters.dateRange[0],
        endDate: visitFilters.dateRange[1]
      })
    }

    visitHistoryList.value = []
    visitPagination.total = 0
  } catch (error) {
    ElMessage.error('加载访问记录失败')
    console.error(error)
  } finally {
    visitLoading.value = false
  }
}

const resetOrderFilters = () => {
  orderFilters.dateRange = []
  orderPagination.page = 1
  loadOrderHistory()
}

const resetPointFilters = () => {
  pointFilters.type = ''
  pointFilters.dateRange = []
  pointsPagination.page = 1
  loadPointsHistory()
}

const resetVisitFilters = () => {
  visitFilters.dateRange = []
  visitPagination.page = 1
  loadVisitHistory()
}

const handleOrderSizeChange = (size: number) => {
  orderPagination.size = size
  orderPagination.page = 1
  loadOrderHistory()
}

const handleOrderPageChange = (page: number) => {
  orderPagination.page = page
  loadOrderHistory()
}

const handlePointsSizeChange = (size: number) => {
  pointsPagination.size = size
  pointsPagination.page = 1
  loadPointsHistory()
}

const handlePointsPageChange = (page: number) => {
  pointsPagination.page = page
  loadPointsHistory()
}

const handleStatusSizeChange = (size: number) => {
  statusPagination.size = size
  statusPagination.page = 1
  loadStatusHistory()
}

const handleStatusPageChange = (page: number) => {
  statusPagination.page = page
  loadStatusHistory()
}

const handleVisitSizeChange = (size: number) => {
  visitPagination.size = size
  visitPagination.page = 1
  loadVisitHistory()
}

const handleVisitPageChange = (page: number) => {
  visitPagination.page = page
  loadVisitHistory()
}

const handleViewOrder = (row: any) => {
  ElMessage.info('查看订单详情功能待实现')
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadCustomerInfo()
  loadOrderHistory()
})
</script>

<style scoped lang="scss">
.customer-history-query {
  padding: 20px;

  .customer-info-card,
  .history-tabs-card {
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

  .customer-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 10px 0;

    .info-row {
      display: flex;
      align-items: center;

      .label {
        width: 100px;
        color: #606266;
        font-weight: 500;
      }

      .value {
        color: #303133;
        font-weight: 600;
      }
    }
  }

  .tab-content {
    .filter-bar {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .points-positive {
      color: #67c23a;
      font-weight: 600;
    }

    .points-negative {
      color: #f56c6c;
      font-weight: 600;
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}
</style>
