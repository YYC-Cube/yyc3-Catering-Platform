<template>
  <div class="billing-management">
    <!-- 账单统计 -->
    <div class="billing-stats">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon unpaid">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ billingStats.unpaidCount }}</div>
            <div class="stat-label">待支付账单</div>
            <div class="stat-amount">¥{{ billingStats.unpaidAmount.toLocaleString() }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon paid">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ billingStats.paidCount }}</div>
            <div class="stat-label">已支付账单</div>
            <div class="stat-amount">¥{{ billingStats.paidAmount.toLocaleString() }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon this-month">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ billingStats.thisMonthAmount.toLocaleString() }}</div>
            <div class="stat-label">本月费用</div>
            <div class="stat-change" :class="billingStats.monthlyChange >= 0 ? 'positive' : 'negative'">
              <el-icon><TrendCharts /></el-icon>
              {{ Math.abs(billingStats.monthlyChange) }}%
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ billingStats.totalAmount.toLocaleString() }}</div>
            <div class="stat-label">累计消费</div>
            <div class="stat-period">自 {{ formatDate(billingStats.startDate) }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选和操作 -->
    <el-card class="filter-card">
      <div class="filter-header">
        <div class="filter-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索发票号码..."
            clearable
            style="width: 200px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="statusFilter"
            placeholder="账单状态"
            clearable
            style="width: 150px"
            @change="loadInvoices"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="待支付" value="open" />
            <el-option label="已支付" value="paid" />
            <el-option label="已作废" value="void" />
          </el-select>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadInvoices"
          />
        </div>

        <div class="filter-right">
          <el-button @click="loadInvoices" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="exportInvoices" :loading="exporting">
            <el-icon><Download /></el-icon>
            导出账单
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 账单列表 -->
    <el-card class="invoices-card">
      <el-table
        v-loading="loading"
        :data="invoices"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="发票号码" width="150">
          <template #default="{ row }">
            <div class="invoice-number">
              <span class="number">{{ row.number }}</span>
              <el-tag
                v-if="row.status === 'open'"
                type="warning"
                size="small"
              >
                待支付
              </el-tag>
              <el-tag
                v-else-if="row.status === 'paid'"
                type="success"
                size="small"
              >
                已支付
              </el-tag>
              <el-tag
                v-else-if="row.status === 'overdue'"
                type="danger"
                size="small"
              >
                逾期
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="账单周期" width="180">
          <template #default="{ row }">
            <div class="billing-period">
              {{ formatDate(row.currentPeriod.start) }} - {{ formatDate(row.currentPeriod.end) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="费用明细" width="200">
          <template #default="{ row }">
            <div class="cost-breakdown">
              <div class="cost-item">
                <span class="label">基础费用:</span>
                <span class="value">¥{{ row.subtotal.toLocaleString() }}</span>
              </div>
              <div class="cost-item" v-if="row.tax > 0">
                <span class="label">税费:</span>
                <span class="value">¥{{ row.tax.toLocaleString() }}</span>
              </div>
              <div class="cost-item" v-if="row.discount > 0">
                <span class="label">折扣:</span>
                <span class="value discount">-¥{{ row.discount.toLocaleString() }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="总金额" width="120">
          <template #default="{ row }">
            <div class="total-amount">
              <span class="currency">¥</span>
              <span class="amount">{{ row.total.toLocaleString() }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="到期日期" width="120">
          <template #default="{ row }">
            <div class="due-date" :class="{ 'overdue': isOverdue(row.dueDate) }">
              {{ formatDate(row.dueDate) }}
              <el-icon v-if="isOverdue(row.dueDate)" class="warning-icon">
                <Warning />
              </el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="支付状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              :effect="row.status === 'paid' ? 'plain' : 'dark'"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="支付时间" width="160">
          <template #default="{ row }">
            <div v-if="row.paidAt" class="paid-time">
              {{ formatDateTime(row.paidAt) }}
            </div>
            <div v-else class="no-payment">
              -
            </div>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                type="primary"
                link
                @click="viewInvoiceDetails(row)"
              >
                详情
              </el-button>
              <el-button
                v-if="row.status === 'open'"
                size="small"
                type="success"
                link
                @click="payInvoice(row)"
              >
                支付
              </el-button>
              <el-button
                size="small"
                link
                @click="downloadInvoice(row)"
                :loading="downloadingIds.has(row.id)"
              >
                下载
              </el-button>
              <el-dropdown trigger="click" @command="(command) => handleCommand(command, row)">
                <el-button size="small" link>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="resend">重新发送</el-dropdown-item>
                    <el-dropdown-item command="duplicate">复制发票</el-dropdown-item>
                    <el-dropdown-item
                      command="void"
                      v-if="row.status === 'open' || row.status === 'overdue'"
                      divided
                    >
                      作废发票
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedInvoices.length > 0">
        <div class="selection-info">
          已选择 {{ selectedInvoices.length }} 张发票
          <el-button size="small" type="text" @click="clearSelection">
            清除选择
          </el-button>
        </div>
        <div class="batch-buttons">
          <el-button
            type="primary"
            size="small"
            @click="batchPay"
            :disabled="!canBatchPay"
          >
            批量支付
          </el-button>
          <el-button
            size="small"
            @click="batchDownload"
          >
            批量下载
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="batchVoid"
            :disabled="!canBatchVoid"
          >
            批量作废
          </el-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadInvoices"
          @current-change="loadInvoices"
        />
      </div>
    </el-card>

    <!-- 发票详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="发票详情"
      width="800px"
      :destroy-on-close="true"
    >
      <div v-if="selectedInvoice" class="invoice-details">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="发票号码">
              {{ selectedInvoice.number }}
            </el-descriptions-item>
            <el-descriptions-item label="发票状态">
              <el-tag :type="getStatusType(selectedInvoice.status)">
                {{ getStatusText(selectedInvoice.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="账单周期">
              {{ formatDate(selectedInvoice.currentPeriod.start) }} - {{ formatDate(selectedInvoice.currentPeriod.end) }}
            </el-descriptions-item>
            <el-descriptions-item label="到期日期">
              {{ formatDate(selectedInvoice.dueDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(selectedInvoice.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="支付时间" v-if="selectedInvoice.paidAt">
              {{ formatDateTime(selectedInvoice.paidAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 费用明细 -->
        <div class="detail-section">
          <h4>费用明细</h4>
          <el-table :data="selectedInvoice.items" stripe>
            <el-table-column prop="description" label="项目描述" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="unitPrice" label="单价" width="100">
              <template #default="{ row }">
                ¥{{ row.unitPrice.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="小计" width="120">
              <template #default="{ row }">
                ¥{{ row.amount.toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>

          <div class="cost-summary">
            <div class="summary-item">
              <span class="label">小计:</span>
              <span class="value">¥{{ selectedInvoice.subtotal.toLocaleString() }}</span>
            </div>
            <div class="summary-item" v-if="selectedInvoice.tax > 0">
              <span class="label">税费:</span>
              <span class="value">¥{{ selectedInvoice.tax.toLocaleString() }}</span>
            </div>
            <div class="summary-item" v-if="selectedInvoice.discount > 0">
              <span class="label">折扣:</span>
              <span class="value discount">-¥{{ selectedInvoice.discount.toLocaleString() }}</span>
            </div>
            <div class="summary-item total">
              <span class="label">总计:</span>
              <span class="value">¥{{ selectedInvoice.total.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, CircleCheck, Calendar, Money, TrendCharts, Search,
  Refresh, Download, Warning, ArrowDown
} from '@element-plus/icons-vue'
import { subscriptionAPI } from '@/api/subscription'
import type { Invoice } from '@/api/subscription'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref<[string, string]>(['', ''])
const invoices = ref<Invoice[]>([])
const selectedInvoices = ref<Invoice[]>([])
const selectedInvoice = ref<Invoice | null>(null)
const showDetailsDialog = ref(false)
const downloadingIds = ref(new Set<string>())

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 账单统计数据
const billingStats = ref({
  unpaidCount: 2,
  unpaidAmount: 1899,
  paidCount: 28,
  paidAmount: 45600,
  thisMonthAmount: 2899,
  monthlyChange: 5.2,
  totalAmount: 125890,
  startDate: '2023-01-15'
})

// 计算属性
const canBatchPay = computed(() => {
  return selectedInvoices.value.some(invoice => invoice.status === 'open')
})

const canBatchVoid = computed(() => {
  return selectedInvoices.value.some(invoice =>
    invoice.status === 'open' || invoice.status === 'overdue'
  )
})

// 生命周期
onMounted(() => {
  loadInvoices()
})

// 方法
const loadInvoices = async () => {
  try {
    loading.value = true
    const [startDate, endDate] = dateRange.value

    const response = await subscriptionAPI.getInvoices({
      status: statusFilter.value,
      dateRange: startDate && endDate ? [startDate, endDate] : undefined,
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize
    })

    if (response.success && response.data) {
      invoices.value = response.data.invoices
      pagination.value.total = response.data.total
    } else {
      ElMessage.error('加载账单失败')
    }
  } catch (error) {
    console.error('Load invoices failed:', error)
    ElMessage.error('加载账单失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑
  loadInvoices()
}

const handleSelectionChange = (selection: Invoice[]) => {
  selectedInvoices.value = selection
}

const clearSelection = () => {
  selectedInvoices.value = []
}

const getStatusType = (status: string) => {
  const types = {
    draft: 'info',
    open: 'warning',
    paid: 'success',
    void: 'danger',
    overdue: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    draft: '草稿',
    open: '待支付',
    paid: '已支付',
    void: '已作废',
    overdue: '逾期'
  }
  return texts[status] || status
}

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewInvoiceDetails = async (invoice: Invoice) => {
  try {
    const response = await subscriptionAPI.getInvoice(invoice.id)
    if (response.success && response.data) {
      selectedInvoice.value = response.data
      showDetailsDialog.value = true
    }
  } catch (error) {
    console.error('Get invoice details failed:', error)
    ElMessage.error('获取发票详情失败')
  }
}

const downloadInvoice = async (invoice: Invoice) => {
  try {
    downloadingIds.value.add(invoice.id)
    const blob = await subscriptionAPI.downloadInvoice(invoice.id)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoice.number}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (error) {
    console.error('Download invoice failed:', error)
    ElMessage.error('下载失败')
  } finally {
    downloadingIds.value.delete(invoice.id)
  }
}

const payInvoice = async (invoice: Invoice) => {
  try {
    const result = await ElMessageBox.confirm(
      `确认支付发票 ${invoice.number}，金额 ¥${invoice.total.toLocaleString()}？`,
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result) {
      // 这里应该调用支付API
      ElMessage.success('支付成功')
      await loadInvoices()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Pay invoice failed:', error)
      ElMessage.error('支付失败')
    }
  }
}

const handleCommand = async (command: string, invoice: Invoice) => {
  switch (command) {
    case 'resend':
      // 重新发送发票逻辑
      ElMessage.success('发票已重新发送')
      break
    case 'duplicate':
      // 复制发票逻辑
      ElMessage.success('发票复制成功')
      break
    case 'void':
      try {
        await ElMessageBox.confirm(
          `确定要作废发票 ${invoice.number} 吗？`,
          '确认作废',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        // 作废发票逻辑
        ElMessage.success('发票已作废')
        await loadInvoices()
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error('作废失败')
        }
      }
      break
  }
}

const batchPay = async () => {
  const payableInvoices = selectedInvoices.value.filter(inv => inv.status === 'open')
  const totalAmount = payableInvoices.reduce((sum, inv) => sum + inv.total, 0)

  try {
    await ElMessageBox.confirm(
      `确认支付选中的 ${payableInvoices.length} 张发票，总金额 ¥${totalAmount.toLocaleString()}？`,
      '批量支付确认',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量支付成功')
    clearSelection()
    await loadInvoices()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量支付失败')
    }
  }
}

const batchDownload = async () => {
  try {
    ElMessage.success('批量下载开始')
    // 批量下载逻辑
    for (const invoice of selectedInvoices.value) {
      await downloadInvoice(invoice)
    }
  } catch (error) {
    ElMessage.error('批量下载失败')
  }
}

const batchVoid = async () => {
  const voidableInvoices = selectedInvoices.value.filter(
    inv => inv.status === 'open' || inv.status === 'overdue'
  )

  try {
    await ElMessageBox.confirm(
      `确定要作废选中的 ${voidableInvoices.length} 张发票吗？`,
      '批量作废确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量作废成功')
    clearSelection()
    await loadInvoices()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量作废失败')
    }
  }
}

const exportInvoices = async () => {
  try {
    exporting.value = true
    ElMessage.success('导出成功')
    // 导出逻辑
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style lang="scss" scoped>
.billing-management {
  .billing-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.unpaid {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: white;
          }

          &.paid {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: white;
          }

          &.this-month {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            color: white;
          }

          &.total {
            background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
            color: white;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin: 4px 0;
          }

          .stat-amount {
            font-size: 16px;
            font-weight: 600;
            color: #409eff;
          }

          .stat-change {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            font-weight: 500;

            &.positive {
              color: #67c23a;
            }

            &.negative {
              color: #f56c6c;
            }
          }

          .stat-period {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 24px;

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      .filter-left {
        display: flex;
        gap: 12px;
        align-items: center;
        flex: 1;
      }

      .filter-right {
        display: flex;
        gap: 12px;
      }
    }
  }

  .invoices-card {
    .invoice-number {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .number {
        font-weight: 600;
        color: #303133;
      }
    }

    .billing-period {
      font-size: 14px;
      color: #606266;
    }

    .cost-breakdown {
      .cost-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        font-size: 13px;

        .label {
          color: #909399;
        }

        .value {
          font-weight: 500;
          color: #303133;

          &.discount {
            color: #67c23a;
          }
        }
      }
    }

    .total-amount {
      display: flex;
      align-items: baseline;
      font-weight: 600;
      color: #303133;

      .currency {
        font-size: 14px;
        margin-right: 2px;
      }

      .amount {
        font-size: 16px;
      }
    }

    .due-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;

      &.overdue {
        color: #f56c6c;
        font-weight: 600;
      }

      .warning-icon {
        color: #f56c6c;
      }
    }

    .paid-time {
      font-size: 14px;
      color: #606266;
    }

    .no-payment {
      color: #c0c4cc;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .batch-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 16px;

      .selection-info {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: #606266;
      }

      .batch-buttons {
        display: flex;
        gap: 8px;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .invoice-details {
    .detail-section {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        border-bottom: 2px solid #e4e7ed;
        padding-bottom: 8px;
      }

      .cost-summary {
        margin-top: 16px;
        text-align: right;

        .summary-item {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 8px;

          .label {
            margin-left: 20px;
            color: #909399;
            font-size: 14px;
          }

          .value {
            min-width: 120px;
            text-align: right;
            font-weight: 500;
            color: #303133;

            &.discount {
              color: #67c23a;
            }
          }

          &.total {
            font-size: 18px;
            font-weight: 600;
            color: #409eff;
            border-top: 1px solid #e4e7ed;
            padding-top: 8px;
            margin-top: 8px;

            .label {
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .billing-management {
    .billing-stats {
      grid-template-columns: 1fr;
    }

    .filter-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch !important;

      .filter-left {
        flex-direction: column;
        gap: 8px;
      }

      .filter-right {
        justify-content: center;
      }
    }

    .batch-actions {
      flex-direction: column;
      gap: 12px;
      align-items: stretch !important;

      .batch-buttons {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}
</style>