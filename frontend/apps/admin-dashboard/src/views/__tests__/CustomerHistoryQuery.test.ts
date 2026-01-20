/**
 * YYC³餐饮行业智能化平台 - 客户历史查询组件单元测试
 * @fileoverview 测试客户历史查询组件的各种功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import CustomerHistoryQuery from '../CustomerHistoryQuery.vue'
import * as customerAPI from '@/api/customer'

// 模拟ElementPlus组件
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElCard: {
    name: 'ElCard',
    template: '<div><slot /></div>'
  },
  ElTabs: {
    name: 'ElTabs',
    template: '<div><slot /></div>',
    props: ['modelValue']
  },
  ElTabPane: {
    name: 'ElTabPane',
    template: '<div><slot /></div>',
    props: ['name', 'label']
  },
  ElTable: {
    name: 'ElTable',
    template: '<table><slot /></table>'
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<td><slot /></td>'
  },
  ElTag: {
    name: 'ElTag',
    template: '<span><slot /></span>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<input type="date" />'
  }
}))

// 模拟API
vi.mock('@/api/customer', () => ({
  getCustomerDetail: vi.fn(),
  getCustomerOrderHistory: vi.fn(),
  getCustomerPointsHistory: vi.fn(),
  getCustomerStatusHistory: vi.fn(),
  getCustomerVisitHistory: vi.fn()
}))

const mockCustomer = {
  id: '1',
  name: '张三',
  phone: '13800138001',
  email: 'zhangsan@example.com',
  status: 'active',
  totalSpent: 1000,
  totalOrders: 10,
  points: 500,
  avatar: 'https://example.com/avatar.jpg',
  memberLevelId: '1',
  memberLevelName: 'VIP会员',
  firstOrderAt: '2026-01-01T00:00:00Z',
  lastOrderAt: '2026-01-20T00:00:00Z',
  lastVisitAt: '2026-01-20T00:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-20T00:00:00Z'
}

const mockOrderHistory = [
  {
    id: '1',
    customerId: '1',
    orderNo: 'ORD202601200001',
    totalAmount: 100,
    status: 'completed',
    createdAt: '2026-01-20T00:00:00Z'
  },
  {
    id: '2',
    customerId: '1',
    orderNo: 'ORD202601190001',
    totalAmount: 200,
    status: 'completed',
    createdAt: '2026-01-19T00:00:00Z'
  }
]

const mockPointsHistory = [
  {
    id: '1',
    customerId: '1',
    points: 100,
    type: 'earn',
    reason: '消费获得积分',
    createdAt: '2026-01-20T00:00:00Z'
  },
  {
    id: '2',
    customerId: '1',
    points: -50,
    type: 'redeem',
    reason: '积分兑换',
    createdAt: '2026-01-19T00:00:00Z'
  }
]

const mockStatusHistory = [
  {
    id: '1',
    customerId: '1',
    fromStatus: 'inactive',
    toStatus: 'active',
    reason: '客户重新激活',
    changedBy: 'admin',
    changedAt: '2026-01-20T00:00:00Z'
  }
]

const mockVisitHistory = [
  {
    id: '1',
    customerId: '1',
    visitTime: '2026-01-20T10:00:00Z',
    ipAddress: '192.168.1.1',
    device: 'iPhone 14',
    browser: 'Safari'
  },
  {
    id: '2',
    customerId: '1',
    visitTime: '2026-01-19T15:30:00Z',
    ipAddress: '192.168.1.1',
    device: 'iPhone 14',
    browser: 'Safari'
  }
]

describe('CustomerHistoryQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始化', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该在挂载时加载客户详情', async () => {
      vi.mocked(customerAPI.getCustomerDetail).mockResolvedValue(mockCustomer)

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      await wrapper.vm.loadCustomerDetail()

      expect(customerAPI.getCustomerDetail).toHaveBeenCalledWith('1')
      expect(wrapper.vm.customer).toEqual(mockCustomer)
    })
  })

  describe('客户信息', () => {
    it('应该正确显示客户基本信息', async () => {
      vi.mocked(customerAPI.getCustomerDetail).mockResolvedValue(mockCustomer)

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      await wrapper.vm.loadCustomerDetail()

      expect(wrapper.vm.customer.name).toBe('张三')
      expect(wrapper.vm.customer.phone).toBe('13800138001')
      expect(wrapper.vm.customer.email).toBe('zhangsan@example.com')
      expect(wrapper.vm.customer.status).toBe('active')
    })

    it('应该正确显示客户统计信息', async () => {
      vi.mocked(customerAPI.getCustomerDetail).mockResolvedValue(mockCustomer)

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      await wrapper.vm.loadCustomerDetail()

      expect(wrapper.vm.customer.totalSpent).toBe(1000)
      expect(wrapper.vm.customer.totalOrders).toBe(10)
      expect(wrapper.vm.customer.points).toBe(500)
    })
  })

  describe('订单历史', () => {
    it('应该正确加载订单历史', async () => {
      vi.mocked(customerAPI.getCustomerOrderHistory).mockResolvedValue({
        data: mockOrderHistory,
        total: mockOrderHistory.length
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      await wrapper.vm.loadOrderHistory()

      expect(customerAPI.getCustomerOrderHistory).toHaveBeenCalledWith('1', expect.any(Object))
      expect(wrapper.vm.orderHistory).toHaveLength(2)
    })

    it('应该支持日期范围筛选', async () => {
      vi.mocked(customerAPI.getCustomerOrderHistory).mockResolvedValue({
        data: mockOrderHistory.slice(0, 1),
        total: 1
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      wrapper.vm.orderDateRange = ['2026-01-20', '2026-01-20']
      await wrapper.vm.loadOrderHistory()

      expect(customerAPI.getCustomerOrderHistory).toHaveBeenCalledWith('1', {
        startDate: '2026-01-20',
        endDate: '2026-01-20'
      })
    })
  })

  describe('积分历史', () => {
    it('应该正确加载积分历史', async () => {
      vi.mocked(customerAPI.getCustomerPointsHistory).mockResolvedValue({
        data: mockPointsHistory,
        total: mockPointsHistory.length
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      await wrapper.vm.loadPointsHistory()

      expect(customerAPI.getCustomerPointsHistory).toHaveBeenCalledWith('1', expect.any(Object))
      expect(wrapper.vm.pointsHistory).toHaveLength(2)
    })

    it('应该支持积分类型筛选', async () => {
      vi.mocked(customerAPI.getCustomerPointsHistory).mockResolvedValue({
        data: mockPointsHistory.slice(0, 1),
        total: 1
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      wrapper.vm.pointsType = 'earn'
      await wrapper.vm.loadPointsHistory()

      expect(customerAPI.getCustomerPointsHistory).toHaveBeenCalledWith('1', {
        type: 'earn'
      })
    })
  })

  describe('状态历史', () => {
    it('应该正确加载状态历史', async () => {
      vi.mocked(customerAPI.getCustomerStatusHistory).mockResolvedValue({
        data: mockStatusHistory,
        total: mockStatusHistory.length
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      await wrapper.vm.loadStatusHistory()

      expect(customerAPI.getCustomerStatusHistory).toHaveBeenCalledWith('1', expect.any(Object))
      expect(wrapper.vm.statusHistory).toHaveLength(1)
    })
  })

  describe('访问记录', () => {
    it('应该正确加载访问记录', async () => {
      vi.mocked(customerAPI.getCustomerVisitHistory).mockResolvedValue({
        data: mockVisitHistory,
        total: mockVisitHistory.length
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      await wrapper.vm.loadVisitHistory()

      expect(customerAPI.getCustomerVisitHistory).toHaveBeenCalledWith('1', expect.any(Object))
      expect(wrapper.vm.visitHistory).toHaveLength(2)
    })

    it('应该支持日期范围筛选', async () => {
      vi.mocked(customerAPI.getCustomerVisitHistory).mockResolvedValue({
        data: mockVisitHistory.slice(0, 1),
        total: 1
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      wrapper.vm.visitDateRange = ['2026-01-20', '2026-01-20']
      await wrapper.vm.loadVisitHistory()

      expect(customerAPI.getCustomerVisitHistory).toHaveBeenCalledWith('1', {
        startDate: '2026-01-20',
        endDate: '2026-01-20'
      })
    })
  })

  describe('标签页切换', () => {
    it('应该正确切换标签页', async () => {
      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      wrapper.vm.activeTab = 'orders'
      expect(wrapper.vm.activeTab).toBe('orders')

      wrapper.vm.activeTab = 'points'
      expect(wrapper.vm.activeTab).toBe('points')

      wrapper.vm.activeTab = 'status'
      expect(wrapper.vm.activeTab).toBe('status')

      wrapper.vm.activeTab = 'visits'
      expect(wrapper.vm.activeTab).toBe('visits')
    })
  })

  describe('刷新数据', () => {
    it('应该正确刷新当前标签页数据', async () => {
      vi.mocked(customerAPI.getCustomerOrderHistory).mockResolvedValue({
        data: mockOrderHistory,
        total: mockOrderHistory.length
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      wrapper.vm.activeTab = 'orders'
      await wrapper.vm.refreshData()

      expect(customerAPI.getCustomerOrderHistory).toHaveBeenCalled()
    })
  })

  describe('导出数据', () => {
    it('应该正确导出当前标签页数据', async () => {
      vi.mocked(customerAPI.getCustomerOrderHistory).mockResolvedValue({
        data: mockOrderHistory,
        total: mockOrderHistory.length
      })

      const wrapper = mount(CustomerHistoryQuery, {
        props: {
          customerId: '1'
        },
        global: {
          stubs: {
            ElCard: true,
            ElTabs: true,
            ElTabPane: true,
            ElTable: true,
            ElTableColumn: true,
            ElTag: true,
            ElButton: true,
            ElDatePicker: true
          }
        }
      })

      wrapper.vm.activeTab = 'orders'
      await wrapper.vm.exportData()

      expect(ElMessage.success).toHaveBeenCalledWith('导出成功')
    })
  })
})
