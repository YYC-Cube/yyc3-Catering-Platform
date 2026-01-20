/**
 * @fileoverview 支付管理组件单元测试
 * @description 测试支付管理组件的功能
 * @module PaymentManagement.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import PaymentManagement from '@/views/PaymentManagement.vue'
import { PaymentAPI, PaymentMethod, PaymentStatus } from '@/api/payment'

vi.mock('@/api/payment', () => ({
  PaymentAPI: vi.fn().mockImplementation(() => ({
    getPaymentConfigs: vi.fn(() => Promise.resolve({
      success: true,
      data: [
        {
          id: 1,
          method: PaymentMethod.ALIPAY,
          name: '支付宝配置',
          displayName: '支付宝',
          description: '支付宝支付配置',
          enabled: true,
          config: {
            appId: 'test_app_id',
            merchantId: 'test_merchant_id',
            apiKey: 'test_api_key',
            apiSecret: 'test_api_secret',
            notifyUrl: 'https://example.com/notify',
            returnUrl: 'https://example.com/return',
            supportedCurrencies: ['CNY'],
            minAmount: 0.01,
            maxAmount: 100000,
            feeRate: 0.006,
            fixedFee: 0
          },
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          method: PaymentMethod.WECHAT,
          name: '微信支付配置',
          displayName: '微信支付',
          description: '微信支付配置',
          enabled: true,
          config: {
            appId: 'test_app_id',
            merchantId: 'test_merchant_id',
            apiKey: 'test_api_key',
            apiSecret: 'test_api_secret',
            notifyUrl: 'https://example.com/notify',
            returnUrl: 'https://example.com/return',
            supportedCurrencies: ['CNY'],
            minAmount: 0.01,
            maxAmount: 100000,
            feeRate: 0.006,
            fixedFee: 0
          },
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    })),
    getPaymentTransactions: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        items: [
          {
            id: 1,
            transactionId: 'TXN001',
            orderId: 'ORD001',
            paymentMethod: PaymentMethod.ALIPAY,
            amount: 100,
            currency: 'CNY',
            status: PaymentStatus.SUCCESS,
            paymentTime: '2024-01-01T12:00:00Z',
            createdAt: '2024-01-01T12:00:00Z'
          },
          {
            id: 2,
            transactionId: 'TXN002',
            orderId: 'ORD002',
            paymentMethod: PaymentMethod.WECHAT,
            amount: 200,
            currency: 'CNY',
            status: PaymentStatus.SUCCESS,
            paymentTime: '2024-01-01T13:00:00Z',
            createdAt: '2024-01-01T13:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      }
    })),
    getRefundRecords: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        items: [
          {
            id: 1,
            refundId: 'REF001',
            transactionId: 'TXN001',
            orderId: 'ORD001',
            amount: 50,
            reason: '用户申请退款',
            status: 'success',
            processedAt: '2024-01-01T14:00:00Z',
            createdAt: '2024-01-01T14:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      }
    })),
    getPaymentStats: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        totalTransactions: 2,
        totalRevenue: { CNY: 300 },
        totalRefunds: { CNY: 50 },
        netRevenue: { CNY: 250 },
        successRate: 1,
        averageOrderValue: { CNY: 150 },
        transactionsByMethod: {
          [PaymentMethod.ALIPAY]: { count: 1, amount: 100, successRate: 1 },
          [PaymentMethod.WECHAT]: { count: 1, amount: 200, successRate: 1 },
          [PaymentMethod.UNIONPAY]: { count: 0, amount: 0, successRate: 0 },
          [PaymentMethod.CASH]: { count: 0, amount: 0, successRate: 0 },
          [PaymentMethod.CREDIT_CARD]: { count: 0, amount: 0, successRate: 0 },
          [PaymentMethod.DEBIT_CARD]: { count: 0, amount: 0, successRate: 0 },
          [PaymentMethod.DIGITAL_WALLET]: { count: 0, amount: 0, successRate: 0 },
          [PaymentMethod.MEMBER_BALANCE]: { count: 0, amount: 0, successRate: 0 }
        },
        dailyStats: [
          {
            date: '2024-01-01',
            revenue: 300,
            transactions: 2,
            refunds: 1
          }
        ],
        monthlyStats: [
          {
            month: '2024-01',
            revenue: 300,
            transactions: 2,
            refunds: 1
          }
        ]
      }
    })),
    createPaymentConfig: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 3,
        method: PaymentMethod.ALIPAY,
        name: '新支付宝配置',
        displayName: '新支付宝',
        description: '新支付宝支付配置',
        enabled: true,
        config: {
          appId: 'new_app_id',
          merchantId: 'new_merchant_id',
          apiKey: 'new_api_key',
          apiSecret: 'new_api_secret',
          notifyUrl: 'https://example.com/notify',
          returnUrl: 'https://example.com/return',
          supportedCurrencies: ['CNY'],
          minAmount: 0.01,
          maxAmount: 100000,
          feeRate: 0.006,
          fixedFee: 0
        },
        createdAt: '2024-01-01T00:00:00Z'
      }
    })),
    updatePaymentConfig: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 1,
        method: PaymentMethod.ALIPAY,
        name: '更新后的支付宝配置',
        displayName: '支付宝',
        description: '更新后的支付宝支付配置',
        enabled: true,
        config: {
          appId: 'updated_app_id',
          merchantId: 'updated_merchant_id',
          apiKey: 'updated_api_key',
          apiSecret: 'updated_api_secret',
          notifyUrl: 'https://example.com/notify',
          returnUrl: 'https://example.com/return',
          supportedCurrencies: ['CNY'],
          minAmount: 0.01,
          maxAmount: 100000,
          feeRate: 0.006,
          fixedFee: 0
        },
        createdAt: '2024-01-01T00:00:00Z'
      }
    })),
    deletePaymentConfig: vi.fn(() => Promise.resolve({
      success: true
    })),
    togglePaymentConfig: vi.fn(() => Promise.resolve({
      success: true
    })),
    testPaymentConfig: vi.fn(() => Promise.resolve({
      success: true
    })),
    createRefund: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 2,
        refundId: 'REF002',
        transactionId: 'TXN002',
        orderId: 'ORD002',
        amount: 100,
        reason: '用户申请退款',
        status: 'success',
        processedAt: '2024-01-01T15:00:00Z',
        createdAt: '2024-01-01T15:00:00Z'
      }
    })),
    exportTransactions: vi.fn(() => Promise.resolve({
      success: true,
      data: new Blob()
    })),
    exportRefunds: vi.fn(() => Promise.resolve({
      success: true,
      data: new Blob()
    }))
  }))
}))

describe('PaymentManagement组件', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(PaymentManagement, {
      global: {
        plugins: [pinia, ElementPlus],
        stubs: {
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-button': true,
          'el-button-group': true,
          'el-icon': true,
          'el-tag': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-switch': true,
          'el-divider': true,
          'el-alert': true,
          'el-tooltip': true,
          'el-popover': true,
          'el-progress': true,
          'el-statistic': true,
          'el-badge': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-timeline': true,
          'el-timeline-item': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-empty': true
        }
      }
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('组件渲染', () => {
    it('应该正确渲染支付管理页面', () => {
      expect(wrapper.find('.payment-management').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toBe('支付管理')
    })

    it('应该显示统计卡片', () => {
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
    })

    it('应该显示功能标签页', () => {
      const tabs = wrapper.find('.el-tabs')
      expect(tabs.exists()).toBe(true)
    })
  })

  describe('支付配置管理', () => {
    it('应该正确加载支付配置', async () => {
      await wrapper.vm.loadPaymentConfigs()
      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
    })

    it('应该显示支付配置列表', () => {
      const configTable = wrapper.find('.el-table')
      expect(configTable.exists()).toBe(true)
    })

    it('应该正确显示支付方式图标', () => {
      const methodIcons = wrapper.findAll('.method-icon')
      expect(methodIcons.length).toBeGreaterThan(0)
    })

    it('应该正确显示支付配置状态', () => {
      const statusTags = wrapper.findAll('.el-tag')
      expect(statusTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示手续费', () => {
      const feeRates = wrapper.findAll('span')
      const hasFeeRate = feeRates.some(span => span.text().includes('%'))
      expect(hasFeeRate).toBe(true)
    })

    it('应该正确显示创建时间', () => {
      const createdAtCells = wrapper.findAll('td')
      const hasCreatedAt = createdAtCells.some(cell => cell.text().includes('2024-01-01'))
      expect(hasCreatedAt).toBe(true)
    })
  })

  describe('交易记录管理', () => {
    it('应该正确加载交易记录', async () => {
      await wrapper.vm.loadTransactions()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该显示交易记录列表', () => {
      const transactionTable = wrapper.find('.el-table')
      expect(transactionTable.exists()).toBe(true)
    })

    it('应该正确显示交易号', () => {
      const transactionIdCells = wrapper.findAll('td')
      const hasTransactionId = transactionIdCells.some(cell => cell.text().includes('TXN'))
      expect(hasTransactionId).toBe(true)
    })

    it('应该正确显示订单号', () => {
      const orderIdCells = wrapper.findAll('td')
      const hasOrderId = orderIdCells.some(cell => cell.text().includes('ORD'))
      expect(hasOrderId).toBe(true)
    })

    it('应该正确显示支付方式', () => {
      const paymentMethodTags = wrapper.findAll('.el-tag')
      expect(paymentMethodTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示金额', () => {
      const amountCells = wrapper.findAll('td')
      const hasAmount = amountCells.some(cell => cell.text().includes('¥'))
      expect(hasAmount).toBe(true)
    })

    it('应该正确显示支付状态', () => {
      const statusTags = wrapper.findAll('.el-tag')
      expect(statusTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示支付时间', () => {
      const paymentTimeCells = wrapper.findAll('td')
      const hasPaymentTime = paymentTimeCells.some(cell => cell.text().includes('12:00:00'))
      expect(hasPaymentTime).toBe(true)
    })
  })

  describe('退款记录管理', () => {
    it('应该正确加载退款记录', async () => {
      await wrapper.vm.loadRefunds()
      expect(wrapper.vm.refunds.length).toBeGreaterThan(0)
    })

    it('应该显示退款记录列表', () => {
      const refundTable = wrapper.find('.el-table')
      expect(refundTable.exists()).toBe(true)
    })

    it('应该正确显示退款号', () => {
      const refundIdCells = wrapper.findAll('td')
      const hasRefundId = refundIdCells.some(cell => cell.text().includes('REF'))
      expect(hasRefundId).toBe(true)
    })

    it('应该正确显示退款金额', () => {
      const amountCells = wrapper.findAll('td')
      const hasAmount = amountCells.some(cell => cell.text().includes('¥'))
      expect(hasAmount).toBe(true)
    })

    it('应该正确显示退款状态', () => {
      const statusTags = wrapper.findAll('.el-tag')
      expect(statusTags.length).toBeGreaterThan(0)
    })
  })

  describe('支付配置操作', () => {
    it('应该正确创建支付配置', async () => {
      wrapper.vm.configForm = {
        id: 0,
        method: PaymentMethod.ALIPAY,
        name: '新支付宝配置',
        displayName: '新支付宝',
        description: '新支付宝支付配置',
        enabled: true,
        config: {
          appId: 'new_app_id',
          merchantId: 'new_merchant_id',
          apiKey: 'new_api_key',
          apiSecret: 'new_api_secret',
          notifyUrl: 'https://example.com/notify',
          returnUrl: 'https://example.com/return',
          supportedCurrencies: ['CNY'],
          minAmount: 0.01,
          maxAmount: 100000,
          feeRate: 0.006,
          fixedFee: 0
        }
      }
      
      await wrapper.vm.confirmConfig()
      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
    })

    it('应该正确更新支付配置', async () => {
      const config = wrapper.vm.paymentConfigs[0]
      wrapper.vm.configForm = {
        id: config.id,
        method: config.method,
        name: '更新后的支付宝配置',
        displayName: config.displayName,
        description: '更新后的支付宝支付配置',
        enabled: config.enabled,
        config: { ...config.config }
      }
      
      await wrapper.vm.confirmConfig()
      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
    })

    it('应该正确删除支付配置', async () => {
      const config = wrapper.vm.paymentConfigs[0]
      await wrapper.vm.handleDeleteConfig(config)
      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
    })

    it('应该正确启用/禁用支付配置', async () => {
      const config = wrapper.vm.paymentConfigs[0]
      const originalEnabled = config.enabled
      
      await wrapper.vm.handleToggleConfig(config)
      expect(config.enabled).toBe(!originalEnabled)
    })

    it('应该正确测试支付配置', async () => {
      const config = wrapper.vm.paymentConfigs[0]
      await wrapper.vm.testPaymentConfig(config)
      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
    })
  })

  describe('交易记录操作', () => {
    it('应该正确查看交易详情', async () => {
      const transaction = wrapper.vm.transactions[0]
      await wrapper.vm.viewTransaction(transaction)
      expect(wrapper.vm.selectedTransaction).toBeDefined()
    })

    it('应该正确创建退款', async () => {
      const transaction = wrapper.vm.transactions[0]
      wrapper.vm.refundForm = {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        reason: '用户申请退款'
      }
      
      await wrapper.vm.confirmRefund()
      expect(wrapper.vm.refunds.length).toBeGreaterThan(0)
    })

    it('应该正确导出交易记录', async () => {
      await wrapper.vm.exportTransactions()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })
  })

  describe('筛选和搜索', () => {
    it('应该正确搜索交易记录', async () => {
      wrapper.vm.transactionFilter.search = 'TXN001'
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该正确按支付方式筛选交易记录', async () => {
      wrapper.vm.transactionFilter.paymentMethod = PaymentMethod.ALIPAY
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该正确按状态筛选交易记录', async () => {
      wrapper.vm.transactionFilter.status = PaymentStatus.SUCCESS
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该正确按时间范围筛选交易记录', async () => {
      wrapper.vm.transactionFilter.dateRange = ['2024-01-01 00:00:00', '2024-01-01 23:59:59']
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该正确重置交易记录筛选', async () => {
      wrapper.vm.transactionFilter.search = 'TXN001'
      wrapper.vm.transactionFilter.paymentMethod = PaymentMethod.ALIPAY
      wrapper.vm.transactionFilter.status = PaymentStatus.SUCCESS
      
      await wrapper.vm.resetTransactionFilter()
      expect(wrapper.vm.transactionFilter.search).toBe('')
      expect(wrapper.vm.transactionFilter.paymentMethod).toBe('')
      expect(wrapper.vm.transactionFilter.status).toBe('')
    })
  })

  describe('分页功能', () => {
    it('应该正确处理交易记录分页', async () => {
      wrapper.vm.transactionPagination.page = 2
      await wrapper.vm.handleTransactionPageChange(2)
      expect(wrapper.vm.transactionPagination.page).toBe(2)
    })

    it('应该正确处理交易记录每页数量变化', async () => {
      wrapper.vm.transactionPagination.limit = 50
      await wrapper.vm.handleTransactionPageSizeChange(50)
      expect(wrapper.vm.transactionPagination.limit).toBe(50)
    })

    it('应该正确处理退款记录分页', async () => {
      wrapper.vm.refundPagination.page = 2
      await wrapper.vm.handleRefundPageChange(2)
      expect(wrapper.vm.refundPagination.page).toBe(2)
    })

    it('应该正确处理退款记录每页数量变化', async () => {
      wrapper.vm.refundPagination.limit = 50
      await wrapper.vm.handleRefundPageSizeChange(50)
      expect(wrapper.vm.refundPagination.limit).toBe(50)
    })
  })

  describe('标签页切换', () => {
    it('应该正确切换到交易记录标签页', async () => {
      await wrapper.vm.handleTabChange('transactions')
      expect(wrapper.vm.activeTab).toBe('transactions')
    })

    it('应该正确切换到退款记录标签页', async () => {
      await wrapper.vm.handleTabChange('refunds')
      expect(wrapper.vm.activeTab).toBe('refunds')
    })

    it('应该正确切换到支付配置标签页', async () => {
      await wrapper.vm.handleTabChange('configs')
      expect(wrapper.vm.activeTab).toBe('configs')
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化数字', () => {
      const formatted = wrapper.vm.formatNumber(1234567.89)
      expect(formatted).toBe('1,234,567.89')
    })

    it('应该正确格式化日期时间', () => {
      const formatted = wrapper.vm.formatDateTime('2024-01-01T12:00:00Z')
      expect(formatted).toContain('2024-01-01')
      expect(formatted).toContain('12:00:00')
    })

    it('应该正确获取支付方式名称', () => {
      const name = wrapper.vm.getPaymentMethodName(PaymentMethod.ALIPAY)
      expect(name).toBe('支付宝')
    })

    it('应该正确获取支付状态名称', () => {
      const name = wrapper.vm.getPaymentStatusName(PaymentStatus.SUCCESS)
      expect(name).toBe('成功')
    })

    it('应该正确获取支付状态类型', () => {
      const type = wrapper.vm.getPaymentStatusType(PaymentStatus.SUCCESS)
      expect(type).toBe('success')
    })

    it('应该正确获取退款状态名称', () => {
      const name = wrapper.vm.getRefundStatusName('success')
      expect(name).toBe('成功')
    })

    it('应该正确获取退款状态类型', () => {
      const type = wrapper.vm.getRefundStatusType('success')
      expect(type).toBe('success')
    })
  })

  describe('加载状态', () => {
    it('应该正确显示加载状态', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(true)
    })

    it('应该正确隐藏加载状态', async () => {
      wrapper.vm.loading = false
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('统计数据', () => {
    it('应该正确加载支付统计', async () => {
      await wrapper.vm.loadPaymentStats()
      expect(wrapper.vm.paymentStats).toBeDefined()
    })

    it('应该正确显示总收入', () => {
      const revenue = wrapper.vm.paymentStats?.totalRevenue?.CNY || 0
      expect(revenue).toBe(300)
    })

    it('应该正确显示交易笔数', () => {
      const totalTransactions = wrapper.vm.paymentStats?.totalTransactions || 0
      expect(totalTransactions).toBe(2)
    })

    it('应该正确显示成功率', () => {
      const successRate = wrapper.vm.paymentStats?.successRate || 0
      expect(successRate).toBe(1)
    })

    it('应该正确显示退款金额', () => {
      const totalRefunds = wrapper.vm.paymentStats?.totalRefunds?.CNY || 0
      expect(totalRefunds).toBe(50)
    })
  })
})
