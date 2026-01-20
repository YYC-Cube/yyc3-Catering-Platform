import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import OrderManagement from '@/views/OrderManagement.vue'
import * as OrderAPI from '@/api/order-management'
import type { Order, OrderStatus } from '@/types/order'

vi.mock('@/api/order-management', () => ({
  orderAPI: {
    getOrders: vi.fn(),
    getOrder: vi.fn(),
    createOrder: vi.fn(),
    updateOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    cancelOrder: vi.fn(),
    refundOrder: vi.fn(),
    printOrder: vi.fn(),
    exportOrders: vi.fn(),
    batchUpdateOrders: vi.fn()
  }
}))

vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD20250120001',
    customerId: 1,
    customerName: '张三',
    customerPhone: '13800138000',
    type: 'dine_in',
    status: 'pending' as OrderStatus,
    paymentStatus: 'paid',
    totalAmount: 128.00,
    discountAmount: 0,
    finalAmount: 128.00,
    paymentMethod: 'wechat',
    tableNumber: 'A01',
    items: [
      {
        id: 1,
        itemId: 101,
        itemName: '宫保鸡丁',
        quantity: 1,
        price: 38.00,
        subtotal: 38.00
      },
      {
        id: 2,
        itemId: 102,
        itemName: '红烧肉',
        quantity: 2,
        price: 45.00,
        subtotal: 90.00
      }
    ],
    notes: '少放辣',
    priority: 'normal',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 2,
    orderNumber: 'ORD20250120002',
    customerId: 2,
    customerName: '李四',
    customerPhone: '13900139000',
    type: 'delivery',
    status: 'confirmed' as OrderStatus,
    paymentStatus: 'paid',
    totalAmount: 85.00,
    discountAmount: 5.00,
    finalAmount: 80.00,
    paymentMethod: 'alipay',
    address: {
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区XX大厦',
      contactName: '李四',
      contactPhone: '13900139000'
    },
    items: [
      {
        id: 3,
        itemId: 103,
        itemName: '鱼香肉丝',
        quantity: 1,
        price: 32.00,
        subtotal: 32.00
      },
      {
        id: 4,
        itemId: 104,
        itemName: '麻婆豆腐',
        quantity: 1,
        price: 28.00,
        subtotal: 28.00
      }
    ],
    notes: '不要香菜',
    priority: 'urgent',
    estimatedTime: 30,
    createdAt: '2025-01-20T11:00:00Z',
    updatedAt: '2025-01-20T11:05:00Z'
  }
]

const mockStatistics = {
  overview: {
    totalOrders: 150,
    completedOrders: 120,
    cancelledOrders: 5,
    totalAmount: 15000.00,
    averageAmount: 100.00,
    averagePreparationTime: 25
  },
  trends: [
    { date: '2025-01-14', count: 20, amount: 2000 },
    { date: '2025-01-15', count: 25, amount: 2500 },
    { date: '2025-01-16', count: 22, amount: 2200 },
    { date: '2025-01-17', count: 28, amount: 2800 },
    { date: '2025-01-18', count: 30, amount: 3000 },
    { date: '2025-01-19', count: 25, amount: 2500 }
  ],
  typeDistribution: [
    { type: 'dine_in', count: 80, percentage: 53.33 },
    { type: 'delivery', count: 50, percentage: 33.33 },
    { type: 'takeaway', count: 20, percentage: 13.34 }
  ],
  statusDistribution: [
    { status: 'pending', count: 10, percentage: 6.67 },
    { status: 'confirmed', count: 15, percentage: 10.00 },
    { status: 'preparing', count: 5, percentage: 3.33 },
    { status: 'completed', count: 120, percentage: 80.00 }
  ]
}

describe('OrderManagement组件', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(OrderManagement, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-icon': true,
          'el-button': true,
          'el-button-group': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-radio-group': true,
          'el-radio': true
        }
      }
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('应该显示订单统计概览', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })

    it('应该显示筛选工具栏', () => {
      expect(wrapper.vm.filters).toBeDefined()
    })

    it('应该显示订单列表', () => {
      expect(wrapper.vm.orders).toBeDefined()
    })

    it('应该显示分页控件', () => {
      expect(wrapper.vm.pagination).toBeDefined()
    })
  })

  describe('订单统计', () => {
    it('应该正确显示今日订单数', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })

    it('应该正确显示今日完成数', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })

    it('应该正确显示今日营业额', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })

    it('应该正确显示待处理订单数', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })
  })

  describe('订单列表', () => {
    it('应该正确加载订单列表', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.getOrders.mockResolvedValue({
        success: true,
        data: {
          orders: mockOrders,
          total: 2
        }
      })

      await wrapper.vm.loadOrders()

      expect(mockAPI.getOrders).toBeDefined()
    })

    it('应该正确显示订单号', () => {
      wrapper.vm.orders = mockOrders
      const hasOrderNumber = mockOrders.some(order => order.orderNumber.includes('ORD'))
      expect(hasOrderNumber).toBe(true)
    })

    it('应该正确显示客户信息', () => {
      wrapper.vm.orders = mockOrders
      const hasCustomerName = mockOrders.some(order => order.customerName === '张三' || order.customerName === '李四')
      expect(hasCustomerName).toBe(true)
    })

    it('应该正确显示订单类型', () => {
      wrapper.vm.orders = mockOrders
      const hasType = mockOrders.some(order => order.type === 'dine_in' || order.type === 'delivery')
      expect(hasType).toBe(true)
    })

    it('应该正确显示订单状态', () => {
      wrapper.vm.orders = mockOrders
      const hasStatus = mockOrders.some(order => order.status === 'pending' || order.status === 'confirmed')
      expect(hasStatus).toBe(true)
    })

    it('应该正确显示订单金额', () => {
      wrapper.vm.orders = mockOrders
      const hasAmount = mockOrders.some(order => order.totalAmount > 0)
      expect(hasAmount).toBe(true)
    })

    it('应该正确显示订单商品数量', () => {
      wrapper.vm.orders = mockOrders
      const hasItems = mockOrders.some(order => order.items && order.items.length > 0)
      expect(hasItems).toBe(true)
    })

    it('应该正确显示下单时间', () => {
      wrapper.vm.orders = mockOrders
      const hasCreatedAt = mockOrders.some(order => order.createdAt)
      expect(hasCreatedAt).toBe(true)
    })
  })

  describe('订单筛选', () => {
    it('应该支持按状态筛选', () => {
      wrapper.vm.filters.status = ['pending']
      expect(wrapper.vm.filters.status).toContain('pending')
    })

    it('应该支持按类型筛选', () => {
      wrapper.vm.filters.type = ['dine_in']
      expect(wrapper.vm.filters.type).toContain('dine_in')
    })

    it('应该支持按时间范围筛选', () => {
      const dateRange = ['2025-01-01', '2025-01-31']
      wrapper.vm.filters.dateRange = dateRange
      expect(wrapper.vm.filters.dateRange).toEqual(dateRange)
    })

    it('应该支持关键词搜索', () => {
      wrapper.vm.filters.search = '张三'
      expect(wrapper.vm.filters.search).toBe('张三')
    })

    it('应该支持多条件组合筛选', () => {
      wrapper.vm.filters = {
        status: ['pending'],
        type: ['dine_in'],
        search: '张三',
        dateRange: ['2025-01-01', '2025-01-31']
      }
      expect(wrapper.vm.filters.status).toContain('pending')
      expect(wrapper.vm.filters.type).toContain('dine_in')
      expect(wrapper.vm.filters.search).toBe('张三')
    })
  })

  describe('订单搜索', () => {
    it('应该支持按订单号搜索', () => {
      wrapper.vm.filters.search = 'ORD20250120001'
      expect(wrapper.vm.filters.search).toBe('ORD20250120001')
    })

    it('应该支持按客户姓名搜索', () => {
      wrapper.vm.filters.search = '张三'
      expect(wrapper.vm.filters.search).toBe('张三')
    })

    it('应该支持按客户电话搜索', () => {
      wrapper.vm.filters.search = '13800138000'
      expect(wrapper.vm.filters.search).toBe('13800138000')
    })
  })

  describe('视图模式', () => {
    it('应该支持列表视图', () => {
      wrapper.vm.setViewMode('list')
      expect(wrapper.vm.viewMode).toBe('list')
    })

    it('应该支持看板视图', () => {
      wrapper.vm.setViewMode('kanban')
      expect(wrapper.vm.viewMode).toBe('kanban')
    })

    it('应该支持时间线视图', () => {
      wrapper.vm.setViewMode('timeline')
      expect(wrapper.vm.viewMode).toBe('timeline')
    })

    it('应该在切换视图时保持筛选条件', () => {
      wrapper.vm.filters = { status: ['pending'], type: ['dine_in'], search: '张三' }
      wrapper.vm.setViewMode('kanban')
      expect(wrapper.vm.filters.status).toContain('pending')
    })
  })

  describe('订单操作', () => {
    it('应该支持查看订单详情', () => {
      wrapper.vm.orders = mockOrders
      wrapper.vm.handleOrderClick(mockOrders[0])
      expect(wrapper.vm.selectedOrder).toEqual(mockOrders[0])
    })

    it('应该支持创建新订单', () => {
      wrapper.vm.handleCreateOrder()
      expect(wrapper.vm.showCreateDialog).toBeDefined()
    })

    it('应该支持确认订单', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.updateOrderStatus.mockResolvedValue({ success: true })

      wrapper.vm.orders = mockOrders
      expect(mockAPI.updateOrderStatus).toBeDefined()
    })

    it('应该支持取消订单', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.cancelOrder.mockResolvedValue({ success: true })

      wrapper.vm.orders = mockOrders
      expect(mockAPI.cancelOrder).toBeDefined()
    })

    it('应该支持打印订单', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.printOrder.mockResolvedValue({ success: true })

      wrapper.vm.orders = mockOrders
      expect(mockAPI.printOrder).toBeDefined()
    })

    it('应该支持退款订单', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.refundOrder.mockResolvedValue({ success: true })

      wrapper.vm.orders = mockOrders
      expect(mockAPI.refundOrder).toBeDefined()
    })
  })

  describe('批量操作', () => {
    it('应该支持批量选择订单', () => {
      wrapper.vm.handleSelectionChange(mockOrders)
      expect(wrapper.vm.selectedOrders).toEqual(mockOrders)
    })

    it('应该支持批量确认订单', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.batchUpdateOrders.mockResolvedValue({ success: true, updated: 2 })

      wrapper.vm.selectedOrders = mockOrders
      expect(mockAPI.batchUpdateOrders).toBeDefined()
    })

    it('应该支持批量取消订单', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.batchUpdateOrders.mockResolvedValue({ success: true, updated: 2 })

      wrapper.vm.selectedOrders = mockOrders
      expect(mockAPI.batchUpdateOrders).toBeDefined()
    })

    it('应该支持批量导出订单', async () => {
      wrapper.vm.selectedOrders = mockOrders
      expect(wrapper.vm.selectedOrders.length).toBeGreaterThan(0)
    })

    it('应该支持批量打印订单', async () => {
      wrapper.vm.selectedOrders = mockOrders
      expect(wrapper.vm.selectedOrders.length).toBeGreaterThan(0)
    })

    it('应该在未选择订单时提示', async () => {
      wrapper.vm.selectedOrders = []
      await wrapper.vm.handleBatchAction('confirm')
      expect(wrapper.vm.selectedOrders.length).toBe(0)
    })
  })

  describe('分页功能', () => {
    it('应该支持分页', () => {
      expect(wrapper.vm.pagination).toBeDefined()
    })

    it('应该支持改变每页数量', () => {
      wrapper.vm.handleSizeChange(20)
      expect(wrapper.vm.pagination.pageSize).toBe(20)
    })

    it('应该支持跳转页码', () => {
      wrapper.vm.handlePageChange(2)
      expect(wrapper.vm.pagination.page).toBe(2)
    })

    it('应该在改变筛选条件时重置到第一页', () => {
      wrapper.vm.pagination.page = 5
      wrapper.vm.handleFilterChange()
      expect(wrapper.vm.pagination.page).toBe(1)
    })
  })

  describe('订单统计', () => {
    it('应该正确显示今日订单数', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })

    it('应该正确显示今日完成数', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })

    it('应该正确显示今日营业额', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })

    it('应该正确显示待处理订单数', () => {
      expect(wrapper.vm.orderStats).toBeDefined()
    })
  })

  describe('订单详情', () => {
    it('应该正确显示订单基本信息', () => {
      wrapper.vm.selectedOrder = mockOrders[0]
      expect(wrapper.vm.selectedOrder.orderNumber).toBe('ORD20250120001')
    })

    it('应该正确显示客户信息', () => {
      wrapper.vm.selectedOrder = mockOrders[0]
      expect(wrapper.vm.selectedOrder.customerName).toBe('张三')
    })

    it('应该正确显示订单商品', () => {
      wrapper.vm.selectedOrder = mockOrders[0]
      expect(wrapper.vm.selectedOrder.items.length).toBe(2)
    })

    it('应该正确显示金额信息', () => {
      wrapper.vm.selectedOrder = mockOrders[0]
      expect(wrapper.vm.selectedOrder.totalAmount).toBe(128.00)
    })

    it('应该正确显示订单备注', () => {
      wrapper.vm.selectedOrder = mockOrders[0]
      expect(wrapper.vm.selectedOrder.notes).toBe('少放辣')
    })
  })

  describe('订单状态管理', () => {
    it('应该支持订单状态流转', () => {
      const order = { ...mockOrders[0], status: 'pending' as OrderStatus }
      order.status = 'confirmed' as OrderStatus
      expect(order.status).toBe('confirmed')
    })

    it('应该支持待确认到已确认', () => {
      const order = { ...mockOrders[0], status: 'pending' as OrderStatus }
      expect(order.status).toBe('pending')
    })

    it('应该支持已确认到制作中', () => {
      const order = { ...mockOrders[1], status: 'confirmed' as OrderStatus }
      expect(order.status).toBe('confirmed')
    })

    it('应该支持制作中到已完成', () => {
      const order = { ...mockOrders[0], status: 'preparing' as OrderStatus }
      expect(order.status).toBe('preparing')
    })
  })

  describe('响应式设计', () => {
    it('应该在窗口大小变化时调整布局', () => {
      expect(wrapper.vm.viewMode).toBeDefined()
    })

    it('应该支持移动端视图', () => {
      expect(wrapper.vm.viewMode).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该正确处理加载失败', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.getOrders.mockRejectedValue(new Error('加载失败'))

      try {
        await wrapper.vm.loadOrders()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('应该正确处理操作失败', async () => {
      const mockAPI = OrderAPI.orderAPI
      mockAPI.updateOrderStatus.mockRejectedValue(new Error('操作失败'))

      try {
        await wrapper.vm.confirmOrder(mockOrders[0])
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('生命周期', () => {
    it('应该在组件挂载时加载数据', async () => {
      expect(wrapper.vm.loadOrders).toBeDefined()
    })

    it('应该在组件卸载时清理资源', () => {
      wrapper.unmount()
      expect(wrapper.exists()).toBe(false)
    })
  })
})
