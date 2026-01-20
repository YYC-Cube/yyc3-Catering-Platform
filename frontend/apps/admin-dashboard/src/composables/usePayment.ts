/**
 * @fileoverview 支付管理Composable
 * @description 管理支付管理功能的状态和逻辑
 * @module usePayment
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { 
  PaymentAPI, 
  PaymentMethod, 
  PaymentStatus, 
  RefundStatus,
  type PaymentConfig, 
  type PaymentTransaction, 
  type RefundRecord, 
  type PaymentStats,
  type CreatePaymentConfigRequest,
  type UpdatePaymentConfigRequest,
  type CreateRefundRequest,
  type PaymentQueryParams
} from '@/api/payment'

const paymentAPI = new PaymentAPI()

export function usePayment() {
  const loading = ref(false)
  const activeTab = ref<'configs' | 'transactions' | 'refunds'>('configs')

  const paymentConfigs = ref<PaymentConfig[]>([])
  const transactions = ref<PaymentTransaction[]>([])
  const refunds = ref<RefundRecord[]>([])
  const paymentStats = ref<PaymentStats | null>(null)

  const selectedConfig = ref<PaymentConfig | null>(null)
  const selectedTransaction = ref<PaymentTransaction | null>(null)
  const selectedRefund = ref<RefundRecord | null>(null)

  const showConfigDialog = ref(false)
  const showTransactionDialog = ref(false)
  const showRefundDialog = ref(false)

  const configDialogType = ref<'create' | 'edit'>('create')

  const configForm = reactive({
    id: 0,
    method: PaymentMethod.ALIPAY,
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
      maxAmount: 100000,
      feeRate: 0,
      fixedFee: 0
    }
  })

  const refundForm = reactive({
    transactionId: '',
    amount: 0,
    reason: ''
  })

  const transactionPagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const refundPagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const transactionFilter = reactive({
    search: '',
    paymentMethod: '' as PaymentMethod | '',
    status: '' as PaymentStatus | '',
    dateRange: [] as string[],
    minAmount: 0,
    maxAmount: 0
  })

  const refundFilter = reactive({
    search: '',
    status: '' as RefundStatus | '',
    dateRange: [] as string[]
  })

  const configsLoading = computed(() => loading.value && activeTab.value === 'configs')
  const transactionsLoading = computed(() => loading.value && activeTab.value === 'transactions')
  const refundsLoading = computed(() => loading.value && activeTab.value === 'refunds')

  const loadPaymentConfigs = async () => {
    try {
      loading.value = true
      const response = await paymentAPI.getPaymentConfigs()
      if (response.success && response.data) {
        paymentConfigs.value = response.data
      } else {
        ElMessage.error(response.message || '加载支付配置失败')
      }
    } catch (error) {
      ElMessage.error('加载支付配置失败')
      console.error('加载支付配置失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadTransactions = async () => {
    try {
      loading.value = true
      const params: PaymentQueryParams = {
        page: transactionPagination.page,
        limit: transactionPagination.limit,
        search: transactionFilter.search || undefined,
        paymentMethod: transactionFilter.paymentMethod || undefined,
        status: transactionFilter.status || undefined,
        startDate: transactionFilter.dateRange[0] || undefined,
        endDate: transactionFilter.dateRange[1] || undefined,
        minAmount: transactionFilter.minAmount || undefined,
        maxAmount: transactionFilter.maxAmount || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
      
      const response = await paymentAPI.getPaymentTransactions(params)
      if (response.success && response.data) {
        transactions.value = response.data.items
        transactionPagination.total = response.data.pagination.total
      } else {
        ElMessage.error(response.message || '加载交易记录失败')
      }
    } catch (error) {
      ElMessage.error('加载交易记录失败')
      console.error('加载交易记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadRefunds = async () => {
    try {
      loading.value = true
      const params: PaymentQueryParams = {
        page: refundPagination.page,
        limit: refundPagination.limit,
        search: refundFilter.search || undefined,
        startDate: refundFilter.dateRange[0] || undefined,
        endDate: refundFilter.dateRange[1] || undefined
      }
      
      const response = await paymentAPI.getRefundRecords(params)
      if (response.success && response.data) {
        refunds.value = response.data.items
        refundPagination.total = response.data.pagination.total
      } else {
        ElMessage.error(response.message || '加载退款记录失败')
      }
    } catch (error) {
      ElMessage.error('加载退款记录失败')
      console.error('加载退款记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadPaymentStats = async () => {
    try {
      const response = await paymentAPI.getPaymentStats()
      if (response.success && response.data) {
        paymentStats.value = response.data
      } else {
        ElMessage.error(response.message || '加载支付统计失败')
      }
    } catch (error) {
      ElMessage.error('加载支付统计失败')
      console.error('加载支付统计失败:', error)
    }
  }

  const handleAddConfig = () => {
    configDialogType.value = 'create'
    Object.assign(configForm, {
      id: 0,
      method: PaymentMethod.ALIPAY,
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
        maxAmount: 100000,
        feeRate: 0,
        fixedFee: 0
      }
    })
    showConfigDialog.value = true
  }

  const handleEditConfig = (config: PaymentConfig) => {
    configDialogType.value = 'edit'
    Object.assign(configForm, {
      id: config.id,
      method: config.method,
      name: config.name,
      displayName: config.displayName,
      description: config.description || '',
      enabled: config.enabled,
      config: { ...config.config }
    })
    selectedConfig.value = config
    showConfigDialog.value = true
  }

  const handleDeleteConfig = async (config: PaymentConfig) => {
    try {
      await ElMessageBox.confirm(`确定要删除支付配置 "${config.displayName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      const response = await paymentAPI.deletePaymentConfig(config.id)
      if (response.success) {
        ElMessage.success('删除成功')
        await loadPaymentConfigs()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const handleToggleConfig = async (config: PaymentConfig) => {
    try {
      const response = await paymentAPI.togglePaymentConfig(config.id, !config.enabled)
      if (response.success) {
        config.enabled = !config.enabled
        ElMessage.success(config.enabled ? '启用成功' : '禁用成功')
      } else {
        ElMessage.error(response.message || '操作失败')
      }
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const testPaymentConfig = async (config: PaymentConfig) => {
    try {
      const response = await paymentAPI.testPaymentConfig(config.id)
      if (response.success) {
        ElMessage.success('测试连接成功')
      } else {
        ElMessage.error(response.message || '测试连接失败')
      }
    } catch (error) {
      ElMessage.error('测试连接失败')
      console.error('测试连接失败:', error)
    }
  }

  const confirmConfig = async () => {
    try {
      if (configDialogType.value === 'create') {
        const request: CreatePaymentConfigRequest = {
          method: configForm.method,
          name: configForm.name,
          displayName: configForm.displayName,
          description: configForm.description,
          enabled: configForm.enabled,
          config: configForm.config
        }
        
        const response = await paymentAPI.createPaymentConfig(request)
        if (response.success) {
          ElMessage.success('创建成功')
          showConfigDialog.value = false
          await loadPaymentConfigs()
        } else {
          ElMessage.error(response.message || '创建失败')
        }
      } else {
        const request: UpdatePaymentConfigRequest = {
          name: configForm.name,
          displayName: configForm.displayName,
          description: configForm.description,
          enabled: configForm.enabled,
          config: configForm.config
        }
        
        const response = await paymentAPI.updatePaymentConfig(configForm.id, request)
        if (response.success) {
          ElMessage.success('更新成功')
          showConfigDialog.value = false
          await loadPaymentConfigs()
        } else {
          ElMessage.error(response.message || '更新失败')
        }
      }
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const viewTransaction = async (transaction: PaymentTransaction) => {
    try {
      const response = await paymentAPI.getPaymentTransaction(transaction.id)
      if (response.success && response.data) {
        selectedTransaction.value = response.data
        showTransactionDialog.value = true
      } else {
        ElMessage.error(response.message || '获取交易详情失败')
      }
    } catch (error) {
      ElMessage.error('获取交易详情失败')
      console.error('获取交易详情失败:', error)
    }
  }

  const createRefund = (transaction: PaymentTransaction) => {
    refundForm.transactionId = transaction.transactionId
    refundForm.amount = transaction.amount
    refundForm.reason = ''
    selectedTransaction.value = transaction
    showRefundDialog.value = true
  }

  const confirmRefund = async () => {
    try {
      const request: CreateRefundRequest = {
        transactionId: refundForm.transactionId,
        amount: refundForm.amount,
        reason: refundForm.reason
      }
      
      const response = await paymentAPI.createRefund(request)
      if (response.success) {
        ElMessage.success('退款申请成功')
        showRefundDialog.value = false
        await loadTransactions()
        await loadRefunds()
      } else {
        ElMessage.error(response.message || '退款申请失败')
      }
    } catch (error) {
      ElMessage.error('退款申请失败')
      console.error('退款申请失败:', error)
    }
  }

  const exportTransactions = async () => {
    try {
      const response = await paymentAPI.exportTransactions(transactionFilter)
      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `交易记录_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
        link.click()
        ElMessage.success('导出成功')
      } else {
        ElMessage.error(response.message || '导出失败')
      }
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }

  const exportRefunds = async () => {
    try {
      const response = await paymentAPI.exportRefunds(refundFilter)
      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `退款记录_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
        link.click()
        ElMessage.success('导出成功')
      } else {
        ElMessage.error(response.message || '导出失败')
      }
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }

  const handleTransactionSearch = () => {
    transactionPagination.page = 1
    loadTransactions()
  }

  const resetTransactionFilter = () => {
    Object.assign(transactionFilter, {
      search: '',
      paymentMethod: '' as PaymentMethod | '',
      status: '' as PaymentStatus | '',
      dateRange: [] as string[],
      minAmount: 0,
      maxAmount: 0
    })
    transactionPagination.page = 1
    loadTransactions()
  }

  const handleRefundSearch = () => {
    refundPagination.page = 1
    loadRefunds()
  }

  const resetRefundFilter = () => {
    Object.assign(refundFilter, {
      search: '',
      status: '' as RefundStatus | '',
      dateRange: [] as string[]
    })
    refundPagination.page = 1
    loadRefunds()
  }

  const handleTransactionPageChange = (page: number) => {
    transactionPagination.page = page
    loadTransactions()
  }

  const handleTransactionPageSizeChange = (pageSize: number) => {
    transactionPagination.limit = pageSize
    transactionPagination.page = 1
    loadTransactions()
  }

  const handleRefundPageChange = (page: number) => {
    refundPagination.page = page
    loadRefunds()
  }

  const handleRefundPageSizeChange = (pageSize: number) => {
    refundPagination.limit = pageSize
    refundPagination.page = 1
    loadRefunds()
  }

  const handleTabChange = (tabName: string) => {
    activeTab.value = tabName as any
    if (tabName === 'configs') {
      loadPaymentConfigs()
    } else if (tabName === 'transactions') {
      loadTransactions()
    } else if (tabName === 'refunds') {
      loadRefunds()
    }
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDateTime = (date: string): string => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }

  const getPaymentMethodName = (method: PaymentMethod): string => {
    const names: Record<PaymentMethod, string> = {
      [PaymentMethod.ALIPAY]: '支付宝',
      [PaymentMethod.WECHAT]: '微信支付',
      [PaymentMethod.UNIONPAY]: '银联支付',
      [PaymentMethod.CASH]: '现金',
      [PaymentMethod.CREDIT_CARD]: '银行卡',
      [PaymentMethod.DEBIT_CARD]: '借记卡',
      [PaymentMethod.DIGITAL_WALLET]: '数字钱包',
      [PaymentMethod.MEMBER_BALANCE]: '会员余额'
    }
    return names[method] || method
  }

  const getPaymentStatusName = (status: PaymentStatus): string => {
    const names: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: '待支付',
      [PaymentStatus.PROCESSING]: '处理中',
      [PaymentStatus.SUCCESS]: '成功',
      [PaymentStatus.FAILED]: '失败',
      [PaymentStatus.CANCELLED]: '已取消',
      [PaymentStatus.REFUNDED]: '已退款',
      [PaymentStatus.PARTIALLY_REFUNDED]: '部分退款'
    }
    return names[status] || status
  }

  const getPaymentStatusType = (status: PaymentStatus): string => {
    const types: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'info',
      [PaymentStatus.PROCESSING]: 'warning',
      [PaymentStatus.SUCCESS]: 'success',
      [PaymentStatus.FAILED]: 'danger',
      [PaymentStatus.CANCELLED]: 'info',
      [PaymentStatus.REFUNDED]: 'warning',
      [PaymentStatus.PARTIALLY_REFUNDED]: 'warning'
    }
    return types[status] || 'info'
  }

  const getRefundStatusName = (status: RefundStatus): string => {
    const names: Record<RefundStatus, string> = {
      [RefundStatus.PENDING]: '待处理',
      [RefundStatus.PROCESSING]: '处理中',
      [RefundStatus.SUCCESS]: '成功',
      [RefundStatus.FAILED]: '失败',
      [RefundStatus.CANCELLED]: '已取消'
    }
    return names[status] || status
  }

  const getRefundStatusType = (status: RefundStatus): string => {
    const types: Record<RefundStatus, string> = {
      [RefundStatus.PENDING]: 'info',
      [RefundStatus.PROCESSING]: 'warning',
      [RefundStatus.SUCCESS]: 'success',
      [RefundStatus.FAILED]: 'danger',
      [RefundStatus.CANCELLED]: 'info'
    }
    return types[status] || 'info'
  }

  return {
    loading,
    activeTab,
    paymentConfigs,
    transactions,
    refunds,
    paymentStats,
    selectedConfig,
    selectedTransaction,
    selectedRefund,
    showConfigDialog,
    showTransactionDialog,
    showRefundDialog,
    configDialogType,
    configForm,
    refundForm,
    transactionPagination,
    refundPagination,
    transactionFilter,
    refundFilter,
    configsLoading,
    transactionsLoading,
    refundsLoading,
    loadPaymentConfigs,
    loadTransactions,
    loadRefunds,
    loadPaymentStats,
    handleAddConfig,
    handleEditConfig,
    handleDeleteConfig,
    handleToggleConfig,
    testPaymentConfig,
    confirmConfig,
    viewTransaction,
    createRefund,
    confirmRefund,
    exportTransactions,
    exportRefunds,
    handleTransactionSearch,
    resetTransactionFilter,
    handleRefundSearch,
    resetRefundFilter,
    handleTransactionPageChange,
    handleTransactionPageSizeChange,
    handleRefundPageChange,
    handleRefundPageSizeChange,
    handleTabChange,
    formatNumber,
    formatDateTime,
    getPaymentMethodName,
    getPaymentStatusName,
    getPaymentStatusType,
    getRefundStatusName,
    getRefundStatusType
  }
}
