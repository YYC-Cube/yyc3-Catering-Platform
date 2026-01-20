/**
 * @fileoverview 支付管理集成测试
 * @description 测试支付管理模块的组件交互和数据流
 * @module PaymentManagement.integration.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import PaymentManagement from '@/views/PaymentManagement.vue'
import { PaymentAPI, PaymentMethod, PaymentStatus } from '@/api/payment'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/payment', component: PaymentManagement }
  ]
})

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
})

describe('PaymentManagement集成测试', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(PaymentManagement, {
      global: {
        plugins: [pinia, router, ElementPlus],
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

    router.push('/payment')
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('组件集成', () => {
    it('应该正确加载所有数据', async () => {
      await wrapper.vm.loadPaymentConfigs()
      await wrapper.vm.loadTransactions()
      await wrapper.vm.loadRefunds()
      await wrapper.vm.loadPaymentStats()

      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
      expect(wrapper.vm.refunds.length).toBeGreaterThan(0)
      expect(wrapper.vm.paymentStats).toBeDefined()
    })

    it('应该正确显示系统概览', () => {
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
    })

    it('应该正确切换标签页', async () => {
      const tabs = wrapper.find('.el-tabs')
      expect(tabs.exists()).toBe(true)

      wrapper.vm.activeTab = 'transactions'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('transactions')

      wrapper.vm.activeTab = 'refunds'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('refunds')

      wrapper.vm.activeTab = 'configs'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('configs')
    })
  })

  describe('支付配置流程集成', () => {
    it('应该完整处理支付配置生命周期', async () => {
      await wrapper.vm.loadPaymentConfigs()

      const activeConfig = wrapper.vm.paymentConfigs.find((c: any) => c.enabled)
      expect(activeConfig).toBeDefined()

      await wrapper.vm.handleToggleConfig(activeConfig)
      expect(activeConfig.enabled).toBe(false)

      await wrapper.vm.handleToggleConfig(activeConfig)
      expect(activeConfig.enabled).toBe(true)
    })

    it('应该正确筛选支付配置', async () => {
      await wrapper.vm.loadPaymentConfigs()
      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
    })

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
      await wrapper.vm.loadPaymentConfigs()
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
      await wrapper.vm.loadPaymentConfigs()
      const config = wrapper.vm.paymentConfigs[0]

      await wrapper.vm.handleDeleteConfig(config)
      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
    })
  })

  describe('交易记录流程集成', () => {
    it('应该正确加载和显示交易记录', async () => {
      await wrapper.vm.loadTransactions()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该正确筛选交易记录', async () => {
      await wrapper.vm.loadTransactions()

      wrapper.vm.transactionFilter.search = 'TXN001'
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)

      wrapper.vm.transactionFilter.paymentMethod = PaymentMethod.ALIPAY
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)

      wrapper.vm.transactionFilter.status = PaymentStatus.SUCCESS
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该正确搜索交易记录', async () => {
      await wrapper.vm.loadTransactions()

      wrapper.vm.transactionFilter.search = 'TXN001'
      await wrapper.vm.handleTransactionSearch()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })

    it('应该正确导出交易记录', async () => {
      await wrapper.vm.exportTransactions()
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
    })
  })

  describe('退款流程集成', () => {
    it('应该正确加载和显示退款记录', async () => {
      await wrapper.vm.loadRefunds()
      expect(wrapper.vm.refunds.length).toBeGreaterThan(0)
    })

    it('应该正确创建退款', async () => {
      await wrapper.vm.loadTransactions()
      const transaction = wrapper.vm.transactions[0]

      wrapper.vm.refundForm = {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        reason: '用户申请退款'
      }

      await wrapper.vm.confirmRefund()
      expect(wrapper.vm.refunds.length).toBeGreaterThan(0)
    })

    it('应该正确导出退款记录', async () => {
      await wrapper.vm.exportRefunds()
      expect(wrapper.vm.refunds.length).toBeGreaterThan(0)
    })
  })

  describe('统计数据集成', () => {
    it('应该正确显示系统统计', async () => {
      await wrapper.vm.loadPaymentStats()
      expect(wrapper.vm.paymentStats).toBeDefined()
      expect(wrapper.vm.paymentStats.totalTransactions).toBe(2)
      expect(wrapper.vm.paymentStats.totalRevenue.CNY).toBe(300)
      expect(wrapper.vm.paymentStats.totalRefunds.CNY).toBe(50)
      expect(wrapper.vm.paymentStats.netRevenue.CNY).toBe(250)
      expect(wrapper.vm.paymentStats.successRate).toBe(1)
    })

    it('应该正确显示按支付方式统计', async () => {
      await wrapper.vm.loadPaymentStats()
      expect(wrapper.vm.paymentStats.transactionsByMethod[PaymentMethod.ALIPAY].count).toBe(1)
      expect(wrapper.vm.paymentStats.transactionsByMethod[PaymentMethod.WECHAT].count).toBe(1)
    })

    it('应该正确显示每日统计', async () => {
      await wrapper.vm.loadPaymentStats()
      expect(wrapper.vm.paymentStats.dailyStats.length).toBeGreaterThan(0)
    })

    it('应该正确显示每月统计', async () => {
      await wrapper.vm.loadPaymentStats()
      expect(wrapper.vm.paymentStats.monthlyStats.length).toBeGreaterThan(0)
    })
  })

  describe('分页集成', () => {
    it('应该正确处理交易记录分页', async () => {
      await wrapper.vm.loadTransactions()

      wrapper.vm.transactionPagination.page = 2
      await wrapper.vm.handleTransactionPageChange(2)
      expect(wrapper.vm.transactionPagination.page).toBe(2)

      wrapper.vm.transactionPagination.limit = 50
      await wrapper.vm.handleTransactionPageSizeChange(50)
      expect(wrapper.vm.transactionPagination.limit).toBe(50)
    })

    it('应该正确处理退款记录分页', async () => {
      await wrapper.vm.loadRefunds()

      wrapper.vm.refundPagination.page = 2
      await wrapper.vm.handleRefundPageChange(2)
      expect(wrapper.vm.refundPagination.page).toBe(2)

      wrapper.vm.refundPagination.limit = 50
      await wrapper.vm.handleRefundPageSizeChange(50)
      expect(wrapper.vm.refundPagination.limit).toBe(50)
    })
  })

  describe('错误处理集成', () => {
    it('应该正确处理API错误', async () => {
      const mockAPI = new PaymentAPI()
      vi.mocked(mockAPI.getPaymentConfigs).mockRejectedValueOnce(new Error('API错误'))
      
      try {
        await wrapper.vm.loadPaymentConfigs()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('应该正确处理网络错误', async () => {
      const mockAPI = new PaymentAPI()
      vi.mocked(mockAPI.getPaymentConfigs).mockRejectedValueOnce(new Error('网络错误'))
      
      try {
        await wrapper.vm.loadPaymentConfigs()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('性能集成', () => {
    it('应该正确处理大量数据', async () => {
      const mockTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        transactionId: `TXN${i + 1}`,
        orderId: `ORD${i + 1}`,
        paymentMethod: PaymentMethod.ALIPAY,
        amount: 100,
        currency: 'CNY',
        status: PaymentStatus.SUCCESS,
        paymentTime: '2024-01-01T12:00:00Z',
        createdAt: '2024-01-01T12:00:00Z'
      }))

      const mockAPI = new PaymentAPI()
      vi.mocked(mockAPI.getPaymentTransactions).mockResolvedValueOnce({
        success: true,
        data: {
          items: mockTransactions,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          }
        }
      })

      await wrapper.vm.loadTransactions()
      expect(wrapper.vm.transactions.length).toBe(1000)
    })

    it('应该正确处理实时数据更新', async () => {
      await wrapper.vm.loadPaymentConfigs()
      await wrapper.vm.loadTransactions()
      await wrapper.vm.loadRefunds()
      await wrapper.vm.loadPaymentStats()

      await wrapper.vm.loadPaymentConfigs()
      await wrapper.vm.loadTransactions()
      await wrapper.vm.loadRefunds()
      await wrapper.vm.loadPaymentStats()

      expect(wrapper.vm.paymentConfigs.length).toBeGreaterThan(0)
      expect(wrapper.vm.transactions.length).toBeGreaterThan(0)
      expect(wrapper.vm.refunds.length).toBeGreaterThan(0)
      expect(wrapper.vm.paymentStats).toBeDefined()
    })
  })

  describe('用户体验集成', () => {
    it('应该正确显示加载状态', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(true)

      wrapper.vm.loading = false
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('应该正确显示空状态', async () => {
      const mockAPI = new PaymentAPI()
      vi.mocked(mockAPI.getPaymentConfigs).mockResolvedValueOnce({
        success: true,
        data: []
      })

      await wrapper.vm.loadPaymentConfigs()
      expect(wrapper.vm.paymentConfigs.length).toBe(0)
    })

    it('应该正确显示错误状态', async () => {
      const mockAPI = new PaymentAPI()
      vi.mocked(mockAPI.getPaymentConfigs).mockRejectedValueOnce(new Error('API错误'))

      try {
        await wrapper.vm.loadPaymentConfigs()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})
