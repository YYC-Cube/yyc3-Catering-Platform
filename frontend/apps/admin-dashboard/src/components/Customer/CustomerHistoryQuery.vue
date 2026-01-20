<template>
  <div class="customer-history-query">
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>客户历史记录查询</span>
          <el-button-group>
            <el-button size="small" @click="refreshHistory">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button size="small" @click="exportHistory">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="history-content">
        <div class="filter-section">
          <el-form :inline="true" :model="filters" class="filter-form">
            <el-form-item label="记录类型">
              <el-select v-model="filters.type" placeholder="全部类型" clearable @change="handleFilterChange">
                <el-option label="订单记录" value="order" />
                <el-option label="积分记录" value="points" />
                <el-option label="优惠券记录" value="coupon" />
                <el-option label="评价记录" value="review" />
                <el-option label="投诉记录" value="complaint" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateChange"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadHistory">
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

        <el-tabs v-model="activeTab" class="history-tabs">
          <el-tab-pane label="订单记录" name="orders">
            <div class="order-history">
              <el-table :data="orderHistory" v-loading="loading" stripe>
                <el-table-column prop="orderNumber" label="订单号" width="180" />
                <el-table-column prop="orderTime" label="下单时间" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.orderTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="订单金额" width="120">
                  <template #default="{ row }">
                    <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="items" label="菜品数量" width="100">
                  <template #default="{ row }">
                    {{ row.items.length }}项
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="订单状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getOrderStatusType(row.status)" size="small">
                      {{ getOrderStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="paymentMethod" label="支付方式" width="100" />
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" text type="primary" @click="viewOrderDetail(row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  v-model:current-page="orderPagination.page"
                  v-model:page-size="orderPagination.pageSize"
                  :total="orderPagination.total"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleOrderSizeChange"
                  @current-change="handleOrderPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="积分记录" name="points">
            <div class="points-history">
              <el-table :data="pointsHistory" v-loading="loading" stripe>
                <el-table-column prop="transactionId" label="交易编号" width="180" />
                <el-table-column prop="transactionTime" label="交易时间" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.transactionTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="交易类型" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getPointsTypeColor(row.type)" size="small">
                      {{ getPointsTypeLabel(row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="points" label="积分变动" width="120">
                  <template #default="{ row }">
                    <span :class="{ 'positive': row.points > 0, 'negative': row.points < 0 }">
                      {{ row.points > 0 ? '+' : '' }}{{ row.points }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="balance" label="余额" width="120" />
                <el-table-column prop="description" label="说明" min-width="200" />
                <el-table-column prop="operator" label="操作人" width="100" />
              </el-table>

              <div class="pagination">
                <el-pagination
                  v-model:current-page="pointsPagination.page"
                  v-model:page-size="pointsPagination.pageSize"
                  :total="pointsPagination.total"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handlePointsSizeChange"
                  @current-change="handlePointsPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="优惠券记录" name="coupons">
            <div class="coupon-history">
              <el-table :data="couponHistory" v-loading="loading" stripe>
                <el-table-column prop="couponCode" label="优惠券码" width="150" />
                <el-table-column prop="couponName" label="优惠券名称" width="150" />
                <el-table-column prop="receivedTime" label="领取时间" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.receivedTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="usedTime" label="使用时间" width="180">
                  <template #default="{ row }">
                    {{ row.usedTime ? formatDateTime(row.usedTime) : '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="discount" label="优惠金额" width="120">
                  <template #default="{ row }">
                    ¥{{ row.discount.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getCouponStatusType(row.status)" size="small">
                      {{ getCouponStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="expireTime" label="过期时间" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.expireTime) }}
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  v-model:current-page="couponPagination.page"
                  v-model:page-size="couponPagination.pageSize"
                  :total="couponPagination.total"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleCouponSizeChange"
                  @current-change="handleCouponPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="评价记录" name="reviews">
            <div class="review-history">
              <el-table :data="reviewHistory" v-loading="loading" stripe>
                <el-table-column prop="reviewId" label="评价编号" width="150" />
                <el-table-column prop="reviewTime" label="评价时间" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.reviewTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="orderNumber" label="订单号" width="150" />
                <el-table-column prop="rating" label="评分" width="100">
                  <template #default="{ row }">
                    <el-rate v-model="row.rating" disabled show-score />
                  </template>
                </el-table-column>
                <el-table-column prop="content" label="评价内容" min-width="200" />
                <el-table-column prop="reply" label="商家回复" min-width="200">
                  <template #default="{ row }">
                    {{ row.reply || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getReviewStatusType(row.status)" size="small">
                      {{ getReviewStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  v-model:current-page="reviewPagination.page"
                  v-model:page-size="reviewPagination.pageSize"
                  :total="reviewPagination.total"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleReviewSizeChange"
                  @current-change="handleReviewPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="投诉记录" name="complaints">
            <div class="complaint-history">
              <el-table :data="complaintHistory" v-loading="loading" stripe>
                <el-table-column prop="complaintId" label="投诉编号" width="150" />
                <el-table-column prop="complaintTime" label="投诉时间" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.complaintTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="投诉类型" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getComplaintTypeColor(row.type)" size="small">
                      {{ getComplaintTypeLabel(row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="content" label="投诉内容" min-width="200" />
                <el-table-column prop="status" label="处理状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getComplaintStatusType(row.status)" size="small">
                      {{ getComplaintStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="handler" label="处理人" width="100" />
                <el-table-column prop="handleTime" label="处理时间" width="180">
                  <template #default="{ row }">
                    {{ row.handleTime ? formatDateTime(row.handleTime) : '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="reply" label="处理结果" min-width="200" />
              </el-table>

              <div class="pagination">
                <el-pagination
                  v-model:current-page="complaintPagination.page"
                  v-model:page-size="complaintPagination.pageSize"
                  :total="complaintPagination.total"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleComplaintSizeChange"
                  @current-change="handleComplaintPageChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Download,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'

interface OrderHistory {
  orderNumber: string
  orderTime: string
  amount: number
  items: any[]
  status: string
  paymentMethod: string
}

interface PointsHistory {
  transactionId: string
  transactionTime: string
  type: string
  points: number
  balance: number
  description: string
  operator: string
}

interface CouponHistory {
  couponCode: string
  couponName: string
  receivedTime: string
  usedTime?: string
  discount: number
  status: string
  expireTime: string
}

interface ReviewHistory {
  reviewId: string
  reviewTime: string
  orderNumber: string
  rating: number
  content: string
  reply?: string
  status: string
}

interface ComplaintHistory {
  complaintId: string
  complaintTime: string
  type: string
  content: string
  status: string
  handler?: string
  handleTime?: string
  reply?: string
}

const props = defineProps<{
  customerId: string
}>()

const loading = ref(false)
const activeTab = ref('orders')
const dateRange = ref<[Date, Date] | null>(null)

const filters = reactive({
  type: ''
})

const orderHistory = ref<OrderHistory[]>([])
const pointsHistory = ref<PointsHistory[]>([])
const couponHistory = ref<CouponHistory[]>([])
const reviewHistory = ref<ReviewHistory[]>([])
const complaintHistory = ref<ComplaintHistory[]>([])

const orderPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const pointsPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const couponPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const reviewPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const complaintPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatDateTime = (timestamp: string) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const getOrderStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    completed: 'success',
    cancelled: 'info',
    refunded: 'warning'
  }
  return typeMap[status] || 'primary'
}

const getOrderStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return labelMap[status] || '未知'
}

const getPointsTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    earn: 'success',
    redeem: 'warning',
    expire: 'info',
    adjust: 'primary'
  }
  return colorMap[type] || 'info'
}

const getPointsTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    earn: '获得',
    redeem: '兑换',
    expire: '过期',
    adjust: '调整'
  }
  return labelMap[type] || '未知'
}

const getCouponStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    unused: 'success',
    used: 'info',
    expired: 'warning'
  }
  return typeMap[status] || 'info'
}

const getCouponStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期'
  }
  return labelMap[status] || '未知'
}

const getReviewStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    published: 'success',
    hidden: 'info',
    deleted: 'danger'
  }
  return typeMap[status] || 'info'
}

const getReviewStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    published: '已发布',
    hidden: '已隐藏',
    deleted: '已删除'
  }
  return labelMap[status] || '未知'
}

const getComplaintTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    service: 'warning',
    food: 'danger',
    environment: 'info',
    other: 'primary'
  }
  return colorMap[type] || 'info'
}

const getComplaintTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    service: '服务',
    food: '食品',
    environment: '环境',
    other: '其他'
  }
  return labelMap[type] || '未知'
}

const getComplaintStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success',
    closed: 'info'
  }
  return typeMap[status] || 'info'
}

const getComplaintStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return labelMap[status] || '未知'
}

const loadHistory = async () => {
  loading.value = true
  try {
    const params = {
      type: filters.type || undefined,
      startTime: dateRange.value?.[0]?.toISOString(),
      endTime: dateRange.value?.[1]?.toISOString()
    }

    const response = await fetch(`/api/customers/${props.customerId}/history?${new URLSearchParams(params as any)}`).then(res => res.json())
    if (response.success) {
      orderHistory.value = response.data.orders || []
      pointsHistory.value = response.data.points || []
      couponHistory.value = response.data.coupons || []
      reviewHistory.value = response.data.reviews || []
      complaintHistory.value = response.data.complaints || []
    }
  } catch (error) {
    console.error('Load history failed:', error)
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  loadHistory()
}

const handleDateChange = () => {
  loadHistory()
}

const resetFilters = () => {
  filters.type = ''
  dateRange.value = null
  loadHistory()
}

const refreshHistory = () => {
  loadHistory()
}

const exportHistory = async () => {
  try {
    const response = await fetch(`/api/customers/${props.customerId}/history/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: activeTab.value,
        startTime: dateRange.value?.[0]?.toISOString(),
        endTime: dateRange.value?.[1]?.toISOString()
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customer-history-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

const viewOrderDetail = (order: OrderHistory) => {
  ElMessage.info('查看订单详情功能开发中...')
}

const handleOrderSizeChange = (size: number) => {
  orderPagination.pageSize = size
  orderPagination.page = 1
  loadHistory()
}

const handleOrderPageChange = (page: number) => {
  orderPagination.page = page
  loadHistory()
}

const handlePointsSizeChange = (size: number) => {
  pointsPagination.pageSize = size
  pointsPagination.page = 1
  loadHistory()
}

const handlePointsPageChange = (page: number) => {
  pointsPagination.page = page
  loadHistory()
}

const handleCouponSizeChange = (size: number) => {
  couponPagination.pageSize = size
  couponPagination.page = 1
  loadHistory()
}

const handleCouponPageChange = (page: number) => {
  couponPagination.page = page
  loadHistory()
}

const handleReviewSizeChange = (size: number) => {
  reviewPagination.pageSize = size
  reviewPagination.page = 1
  loadHistory()
}

const handleReviewPageChange = (page: number) => {
  reviewPagination.page = page
  loadHistory()
}

const handleComplaintSizeChange = (size: number) => {
  complaintPagination.pageSize = size
  complaintPagination.page = 1
  loadHistory()
}

const handleComplaintPageChange = (page: number) => {
  complaintPagination.page = page
  loadHistory()
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-history-query {
  .history-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .history-content {
      .filter-section {
        margin-bottom: $spacing-4;
        padding: $spacing-4;
        background: $background-light;
        border-radius: $border-radius-md;
      }

      .history-tabs {
        .order-history,
        .points-history,
        .coupon-history,
        .review-history,
        .complaint-history {
          .amount {
            font-weight: 600;
            color: $primary-color;
          }

          .positive {
            color: $success-color;
            font-weight: 600;
          }

          .negative {
            color: $danger-color;
            font-weight: 600;
          }

          .pagination {
            padding: $spacing-4;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
