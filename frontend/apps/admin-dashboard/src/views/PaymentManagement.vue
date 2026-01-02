<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 支付管理页面
 * @description 支付配置管理、交易记录查看、退款处理等功能
 * @module PaymentManagement
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
-->
<template>
  <div class="payment-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">支付管理</h1>
        <p class="page-description">管理支付方式配置、查看交易记录、处理退款申请</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateConfigDialog">
          <el-icon><Plus /></el-icon>
          添加支付方式
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon revenue">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatNumber(paymentStats.totalRevenue?.CNY || 0) }}</div>
                <div class="stat-label">总收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon transactions">
                <el-icon><CreditCard /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(paymentStats.totalTransactions || 0) }}</div>
                <div class="stat-label">交易笔数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon success-rate">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ (paymentStats.successRate * 100).toFixed(1) }}%</div>
                <div class="stat-label">成功率</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon refunds">
                <el-icon><RefreshLeft /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatNumber(paymentStats.totalRefunds?.CNY || 0) }}</div>
                <div class="stat-label">退款金额</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 功能标签页 -->
    <el-card class="main-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 支付配置 -->
        <el-tab-pane label="支付配置" name="configs">
          <div class="tab-header">
            <div class="tab-title">支付方式配置</div>
            <div class="tab-actions">
              <el-button @click="loadPaymentConfigs">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-table :data="paymentConfigs" v-loading="configsLoading">
            <el-table-column prop="displayName" label="支付方式" width="200">
              <template #default="{ row }">
                <div class="payment-method">
                  <el-icon class="method-icon">
                    <CreditCard v-if="row.method === 'credit_card'" />
                    <Money v-else-if="row.method === 'cash'" />
                    <Iphone v-else-if="row.method === 'alipay'" />
                    <ChatDotRound v-else-if="row.method === 'wechat'" />
                    <CreditCard v-else />
                  </el-icon>
                  <span>{{ row.displayName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="配置名称" />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'">
                  {{ row.enabled ? '已启用' : '已禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="手续费" width="120">
              <template #default="{ row }">
                <span v-if="row.config.feeRate">{{ (row.config.feeRate * 100).toFixed(2) }}%</span>
                <span v-else-if="row.config.fixedFee">¥{{ row.config.fixedFee }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="testPaymentConfig(row)">
                  测试
                </el-button>
                <el-button size="small" type="primary" @click="editPaymentConfig(row)">
                  编辑
                </el-button>
                <el-button
                  size="small"
                  :type="row.enabled ? 'warning' : 'success'"
                  @click="togglePaymentConfig(row)"
                >
                  {{ row.enabled ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="deletePaymentConfig(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 交易记录 -->
        <el-tab-pane label="交易记录" name="transactions">
          <div class="tab-header">
            <div class="tab-title">交易记录管理</div>
            <div class="tab-actions">
              <el-button @click="exportTransactions">
                <el-icon><Download /></el-icon>
                导出记录
              </el-button>
              <el-button @click="loadTransactions">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <!-- 筛选条件 -->
          <div class="filter-container">
            <el-form :model="transactionFilter" inline>
              <el-form-item label="搜索">
                <el-input
                  v-model="transactionFilter.search"
                  placeholder="订单号/交易号"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="支付方式">
                <el-select v-model="transactionFilter.paymentMethod" placeholder="全部" clearable style="width: 150px">
                  <el-option label="支付宝" value="alipay" />
                  <el-option label="微信支付" value="wechat" />
                  <el-option label="现金" value="cash" />
                  <el-option label="银行卡" value="credit_card" />
                  <el-option label="会员余额" value="member_balance" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="transactionFilter.status" placeholder="全部" clearable style="width: 120px">
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="failed" />
                  <el-option label="处理中" value="processing" />
                  <el-option label="已退款" value="refunded" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="transactionFilter.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 350px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTransactionSearch">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetTransactionFilter">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="transactions" v-loading="transactionsLoading">
            <el-table-column prop="transactionId" label="交易号" width="180" />
            <el-table-column prop="orderId" label="订单号" width="180" />
            <el-table-column label="支付方式" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ getPaymentMethodName(row.paymentMethod) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getPaymentStatusType(row.status)">
                  {{ getPaymentStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="paymentTime" label="支付时间" width="180">
              <template #default="{ row }">
                {{ row.paymentTime ? formatDateTime(row.paymentTime) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="退款金额" width="100">
              <template #default="{ row }">
                <span v-if="row.refundAmount" class="refund-amount">¥{{ row.refundAmount.toFixed(2) }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewTransaction(row)">
                  详情
                </el-button>
                <el-button
                  v-if="row.status === 'success' && !row.refundAmount"
                  size="small"
                  type="warning"
                  @click="createRefund(row)"
                >
                  退款
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="transactionPagination.page"
              v-model:page-size="transactionPagination.limit"
              :total="transactionPagination.total"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleTransactionPageSizeChange"
              @current-change="handleTransactionPageChange"
            />
          </div>
        </el-tab-pane>

        <!-- 退款记录 -->
        <el-tab-pane label="退款记录" name="refunds">
          <div class="tab-header">
            <div class="tab-title">退款记录管理</div>
            <div class="tab-actions">
              <el-button @click="exportRefunds">
                <el-icon><Download /></el-icon>
                导出记录
              </el-button>
              <el-button @click="loadRefunds">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-table :data="refunds" v-loading="refundsLoading">
            <el-table-column prop="refundId" label="退款号" width="180" />
            <el-table-column prop="transactionId" label="原交易号" width="180" />
            <el-table-column prop="orderId" label="订单号" width="180" />
            <el-table-column prop="amount" label="退款金额" width="120">
              <template #default="{ row }">
                <span class="refund-amount">¥{{ row.amount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="退款原因" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getRefundStatusType(row.status)">
                  {{ getRefundStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="processedAt" label="处理时间" width="180">
              <template #default="{ row }">
                {{ row.processedAt ? formatDateTime(row.processedAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewRefund(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="refundPagination.page"
              v-model:page-size="refundPagination.limit"
              :total="refundPagination.total"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleRefundPageSizeChange"
              @current-change="handleRefundPageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建/编辑支付配置对话框 -->
    <el-dialog
      :title="isEditingConfig ? '编辑支付配置' : '创建支付配置'"
      v-model="configDialogVisible"
      width="800px"
    >
      <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="120px">
        <el-form-item label="支付方式" prop="method">
          <el-select v-model="configForm.method" placeholder="选择支付方式" :disabled="isEditingConfig" style="width: 200px">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联支付" value="unionpay" />
            <el-option label="现金" value="cash" />
            <el-option label="信用卡" value="credit_card" />
            <el-option label="借记卡" value="debit_card" />
            <el-option label="数字钱包" value="digital_wallet" />
            <el-option label="会员余额" value="member_balance" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="configForm.name" placeholder="输入配置名称" />
        </el-form-item>
        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="configForm.displayName" placeholder="输入用户看到的名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="configForm.description" type="textarea" rows="3" placeholder="输入描述信息" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="configForm.enabled" />
        </el-form-item>

        <!-- 动态配置字段 -->
        <template v-if="configForm.method && configForm.method !== 'cash'">
          <el-divider content-position="left">接口配置</el-divider>
          <el-form-item label="应用ID" prop="config.appId">
            <el-input v-model="configForm.config.appId" placeholder="应用ID" />
          </el-form-item>
          <el-form-item label="商户ID" prop="config.merchantId">
            <el-input v-model="configForm.config.merchantId" placeholder="商户ID" />
          </el-form-item>
          <el-form-item label="API密钥" prop="config.apiKey">
            <el-input v-model="configForm.config.apiKey" type="password" placeholder="API密钥" show-password />
          </el-form-item>
          <el-form-item label="回调地址" prop="config.notifyUrl">
            <el-input v-model="configForm.config.notifyUrl" placeholder="异步回调地址" />
          </el-form-item>
        </template>

        <el-divider content-position="left">费用配置</el-divider>
        <el-form-item label="费率类型">
          <el-radio-group v-model="feeType">
            <el-radio label="percentage">按比例</el-radio>
            <el-radio label="fixed">固定费用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="feeType === 'percentage'" label="费率 (%)" prop="config.feeRate">
          <el-input-number
            v-model="configForm.config.feeRate"
            :min="0"
            :max="100"
            :precision="4"
            :step="0.01"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item v-else label="固定费用 (¥)" prop="config.fixedFee">
          <el-input-number
            v-model="configForm.config.fixedFee"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="最小金额">
          <el-input-number
            v-model="configForm.config.minAmount"
            :min="0"
            :precision="2"
            placeholder="最小支付金额"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="最大金额">
          <el-input-number
            v-model="configForm.config.maxAmount"
            :min="0"
            :precision="2"
            placeholder="最大支付金额"
            style="width: 200px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfigForm" :loading="configFormLoading">
          {{ isEditingConfig ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog title="创建退款" v-model="refundDialogVisible" width="500px">
      <el-form :model="refundForm" :rules="refundRules" ref="refundFormRef" label-width="100px">
        <el-form-item label="原交易号">
          <el-input v-model="refundForm.transactionId" readonly />
        </el-form-item>
        <el-form-item label="可退金额">
          <el-input :value="`¥${selectedTransaction?.amount?.toFixed(2) || '0.00'}`" readonly />
        </el-form-item>
        <el-form-item label="退款金额" prop="amount">
          <el-input-number
            v-model="refundForm.amount"
            :min="0.01"
            :max="selectedTransaction?.amount || 0"
            :precision="2"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="退款原因" prop="reason">
          <el-input v-model="refundForm.reason" type="textarea" rows="3" placeholder="请输入退款原因" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRefundForm" :loading="refundFormLoading">
          确认退款
        </el-button>
      </template>
    </el-dialog>

    <!-- 交易详情对话框 -->
    <el-dialog title="交易详情" v-model="transactionDetailVisible" width="800px">
      <div v-if="selectedTransaction" class="transaction-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="交易号">{{ selectedTransaction.transactionId }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ selectedTransaction.orderId }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ getPaymentMethodName(selectedTransaction.paymentMethod) }}</el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ selectedTransaction.amount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getPaymentStatusType(selectedTransaction.status)">
              {{ getPaymentStatusName(selectedTransaction.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ selectedTransaction.paymentTime ? formatDateTime(selectedTransaction.paymentTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款金额" v-if="selectedTransaction.refundAmount">
            ¥{{ selectedTransaction.refundAmount.toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="退款时间" v-if="selectedTransaction.refundedAt">
            {{ formatDateTime(selectedTransaction.refundedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="失败原因" v-if="selectedTransaction.failureReason" :span="2">
            {{ selectedTransaction.failureReason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPaymentConfigs,
  createPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
  togglePaymentConfig,
  testPaymentConfig,
  getPaymentTransactions,
  createRefund,
  getRefundRecords,
  getPaymentStats,
  exportTransactions,
  exportRefunds
} from '@/api/payment'
import type {
  PaymentConfig,
  PaymentTransaction,
  PaymentStats,
  RefundRecord,
  CreatePaymentConfigRequest,
  UpdatePaymentConfigRequest,
  CreateRefundRequest
} from '@/api/payment'

// 响应式数据
const activeTab = ref('configs')
const configsLoading = ref(false)
const transactionsLoading = ref(false)
const refundsLoading = ref(false)
const configFormLoading = ref(false)
const refundFormLoading = ref(false)

// 统计数据
const paymentStats = reactive<PaymentStats>({
  totalTransactions: 0,
  totalRevenue: {},
  totalRefunds: {},
  netRevenue: {},
  successRate: 0,
  averageOrderValue: {},
  transactionsByMethod: {} as any,
  dailyStats: [],
  monthlyStats: []
})

// 支付配置数据
const paymentConfigs = ref<PaymentConfig[]>([])
const configDialogVisible = ref(false)
const isEditingConfig = ref(false)
const configFormRef = ref()
const feeType = ref('percentage')

const configForm = reactive<CreatePaymentConfigRequest & { id?: number }>({
  method: 'alipay',
  name: '',
  displayName: '',
  description: '',
  enabled: true,
  config: {
    appId: '',
    merchantId: '',
    apiKey: '',
    apiSecret: '',
    publicKey: '',
    privateKey: '',
    notifyUrl: '',
    returnUrl: '',
    supportedCurrencies: ['CNY'],
    minAmount: 0,
    maxAmount: 0,
    feeRate: 0,
    fixedFee: 0
  }
})

const configRules = {
  method: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  displayName: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  'config.appId': [{ required: true, message: '请输入应用ID', trigger: 'blur' }],
  'config.merchantId': [{ required: true, message: '请输入商户ID', trigger: 'blur' }],
  'config.apiKey': [{ required: true, message: '请输入API密钥', trigger: 'blur' }]
}

// 交易记录数据
const transactions = ref<PaymentTransaction[]>([])
const transactionPagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const transactionFilter = reactive({
  search: '',
  paymentMethod: '',
  status: '',
  dateRange: null as [string, string] | null
})

// 退款记录数据
const refunds = ref<RefundRecord[]>([])
const refundPagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 退款表单
const refundDialogVisible = ref(false)
const refundFormRef = ref()
const selectedTransaction = ref<PaymentTransaction | null>(null)

const refundForm = reactive<CreateRefundRequest>({
  transactionId: '',
  amount: 0,
  reason: ''
})

const refundRules = {
  amount: [{ required: true, message: '请输入退款金额', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入退款原因', trigger: 'blur' }]
}

// 交易详情
const transactionDetailVisible = ref(false)

// 方法
const loadPaymentStats = async () => {
  try {
    const response = await getPaymentStats()
    if (response.success && response.data) {
      Object.assign(paymentStats, response.data)
    }
  } catch (error) {
    console.error('Load payment stats failed:', error)
  }
}

const loadPaymentConfigs = async () => {
  configsLoading.value = true
  try {
    const response = await getPaymentConfigs()
    if (response.success && response.data) {
      paymentConfigs.value = response.data
    }
  } catch (error) {
    console.error('Load payment configs failed:', error)
    ElMessage.error('加载支付配置失败')
  } finally {
    configsLoading.value = false
  }
}

const loadTransactions = async () => {
  transactionsLoading.value = true
  try {
    const params = {
      page: transactionPagination.page,
      limit: transactionPagination.limit,
      search: transactionFilter.search || undefined,
      paymentMethod: transactionFilter.paymentMethod as any || undefined,
      status: transactionFilter.status as any || undefined,
      startDate: transactionFilter.dateRange?.[0],
      endDate: transactionFilter.dateRange?.[1]
    }

    const response = await getPaymentTransactions(params)
    if (response.success && response.data) {
      transactions.value = response.data.items
      transactionPagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Load transactions failed:', error)
    ElMessage.error('加载交易记录失败')
  } finally {
    transactionsLoading.value = false
  }
}

const loadRefunds = async () => {
  refundsLoading.value = true
  try {
    const params = {
      page: refundPagination.page,
      limit: refundPagination.limit
    }

    const response = await getRefundRecords(params)
    if (response.success && response.data) {
      refunds.value = response.data.items
      refundPagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Load refunds failed:', error)
    ElMessage.error('加载退款记录失败')
  } finally {
    refundsLoading.value = false
  }
}

const showCreateConfigDialog = () => {
  isEditingConfig.value = false
  Object.assign(configForm, {
    method: 'alipay',
    name: '',
    displayName: '',
    description: '',
    enabled: true,
    config: {
      appId: '',
      merchantId: '',
      apiKey: '',
      apiSecret: '',
      publicKey: '',
      privateKey: '',
      notifyUrl: '',
      returnUrl: '',
      supportedCurrencies: ['CNY'],
      minAmount: 0,
      maxAmount: 0,
      feeRate: 0,
      fixedFee: 0
    }
  })
  feeType.value = 'percentage'
  configDialogVisible.value = true
}

const editPaymentConfig = (config: PaymentConfig) => {
  isEditingConfig.value = true
  Object.assign(configForm, config)
  feeType.value = config.config.feeRate ? 'percentage' : 'fixed'
  configDialogVisible.value = true
}

const saveConfigForm = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()
    configFormLoading.value = true

    const formData = { ...configForm }
    if (feeType.value === 'percentage') {
      formData.config.fixedFee = 0
    } else {
      formData.config.feeRate = 0
    }

    let response
    if (isEditingConfig.value) {
      response = await updatePaymentConfig(formData.id!, formData as UpdatePaymentConfigRequest)
    } else {
      response = await createPaymentConfig(formData as CreatePaymentConfigRequest)
    }

    if (response.success) {
      ElMessage.success(isEditingConfig.value ? '更新成功' : '创建成功')
      configDialogVisible.value = false
      loadPaymentConfigs()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('Save config form failed:', error)
  } finally {
    configFormLoading.value = false
  }
}

const deletePaymentConfig = async (config: PaymentConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除支付配置"${config.displayName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await deletePaymentConfig(config.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadPaymentConfigs()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete payment config failed:', error)
    }
  }
}

const togglePaymentConfig = async (config: PaymentConfig) => {
  try {
    const response = await togglePaymentConfig(config.id, !config.enabled)
    if (response.success) {
      ElMessage.success(config.enabled ? '禁用成功' : '启用成功')
      loadPaymentConfigs()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('Toggle payment config failed:', error)
  }
}

const testPaymentConfig = async (config: PaymentConfig) => {
  try {
    const response = await testPaymentConfig(config.id)
    if (response.success) {
      ElMessage.success('测试成功')
    } else {
      ElMessage.error(response.message || '测试失败')
    }
  } catch (error) {
    console.error('Test payment config failed:', error)
    ElMessage.error('测试失败')
  }
}

const handleTransactionSearch = () => {
  transactionPagination.page = 1
  loadTransactions()
}

const resetTransactionFilter = () => {
  Object.assign(transactionFilter, {
    search: '',
    paymentMethod: '',
    status: '',
    dateRange: null
  })
  handleTransactionSearch()
}

const handleTransactionPageSizeChange = (size: number) => {
  transactionPagination.limit = size
  transactionPagination.page = 1
  loadTransactions()
}

const handleTransactionPageChange = (page: number) => {
  transactionPagination.page = page
  loadTransactions()
}

const handleRefundPageSizeChange = (size: number) => {
  refundPagination.limit = size
  refundPagination.page = 1
  loadRefunds()
}

const handleRefundPageChange = (page: number) => {
  refundPagination.page = page
  loadRefunds()
}

const viewTransaction = (transaction: PaymentTransaction) => {
  selectedTransaction.value = transaction
  transactionDetailVisible.value = true
}

const createRefund = (transaction: PaymentTransaction) => {
  selectedTransaction.value = transaction
  Object.assign(refundForm, {
    transactionId: transaction.transactionId,
    amount: transaction.amount,
    reason: ''
  })
  refundDialogVisible.value = true
}

const saveRefundForm = async () => {
  if (!refundFormRef.value) return

  try {
    await refundFormRef.value.validate()
    refundFormLoading.value = true

    const response = await createRefund(refundForm)
    if (response.success) {
      ElMessage.success('退款申请成功')
      refundDialogVisible.value = false
      loadTransactions()
      loadRefunds()
    } else {
      ElMessage.error(response.message || '退款申请失败')
    }
  } catch (error) {
    console.error('Save refund form failed:', error)
  } finally {
    refundFormLoading.value = false
  }
}

const viewRefund = (refund: RefundRecord) => {
  // 显示退款详情逻辑
  console.log('View refund:', refund)
}

const exportTransactions = async () => {
  try {
    const params = {
      startDate: transactionFilter.dateRange?.[0],
      endDate: transactionFilter.dateRange?.[1],
      paymentMethod: transactionFilter.paymentMethod as any || undefined,
      status: transactionFilter.status as any || undefined
    }

    const response = await exportTransactions(params)
    if (response.success && response.data?.downloadUrl) {
      window.open(response.data.downloadUrl, '_blank')
      ElMessage.success('导出成功')
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('Export transactions failed:', error)
    ElMessage.error('导出失败')
  }
}

const exportRefunds = async () => {
  try {
    const response = await exportRefunds()
    if (response.success && response.data?.downloadUrl) {
      window.open(response.data.downloadUrl, '_blank')
      ElMessage.success('导出成功')
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('Export refunds failed:', error)
    ElMessage.error('导出失败')
  }
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  if (tabName === 'configs') {
    loadPaymentConfigs()
  } else if (tabName === 'transactions') {
    loadTransactions()
  } else if (tabName === 'refunds') {
    loadRefunds()
  }
}

// 工具函数
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getPaymentMethodName = (method: string) => {
  const names: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    unionpay: '银联',
    cash: '现金',
    credit_card: '信用卡',
    debit_card: '借记卡',
    digital_wallet: '数字钱包',
    member_balance: '会员余额'
  }
  return names[method] || method
}

const getPaymentStatusName = (status: string) => {
  const names: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    success: '成功',
    failed: '失败',
    cancelled: '已取消',
    refunded: '已退款',
    partially_refunded: '部分退款'
  }
  return names[status] || status
}

const getPaymentStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    success: 'success',
    failed: 'danger',
    cancelled: 'info',
    refunded: 'warning',
    partially_refunded: 'warning'
  }
  return types[status] || 'info'
}

const getRefundStatusName = (status: string) => {
  const names: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    success: '成功',
    failed: '失败',
    cancelled: '已取消'
  }
  return names[status] || status
}

const getRefundStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    success: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

// 生命周期
onMounted(() => {
  loadPaymentStats()
  loadPaymentConfigs()
})
</script>

<style lang="scss" scoped>
.payment-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-description {
      color: #909399;
      margin: 0;
    }
  }
}

.stats-container {
  margin-bottom: 20px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        .el-icon {
          font-size: 24px;
          color: #fff;
        }

        &.revenue {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }

        &.transactions {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }

        &.success-rate {
          background: linear-gradient(135deg, #e6a23c, #eebe77);
        }

        &.refunds {
          background: linear-gradient(135deg, #f56c6c, #f78989);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.main-content {
  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .tab-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .filter-container {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .payment-method {
    display: flex;
    align-items: center;

    .method-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }

  .amount {
    font-weight: 600;
    color: #67c23a;
  }

  .refund-amount {
    font-weight: 600;
    color: #f56c6c;
  }
}

.transaction-detail {
  .el-descriptions {
    margin-bottom: 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .payment-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;

    .header-actions {
      margin-top: 16px;
    }
  }

  .stats-container {
    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }

  .filter-container {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}
</style>