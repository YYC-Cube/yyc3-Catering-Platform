/**
 * YYC³餐饮行业智能化平台 - 客户状态跟踪组件单元测试
 * @fileoverview 测试客户状态跟踪组件的各种功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import CustomerStatusTracker from '../CustomerStatusTracker.vue'
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
  ElForm: {
    name: 'ElForm',
    template: '<div><slot /></div>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select><slot /></select>'
  },
  ElOption: {
    name: 'ElOption',
    template: '<option><slot /></option>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  },
  ElTable: {
    name: 'ElTable',
    template: '<table><slot /></table>'
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<td><slot /></td>'
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue"><slot /></div>',
    props: ['modelValue']
  },
  ElTag: {
    name: 'ElTag',
    template: '<span><slot /></span>'
  }
}))

// 模拟API
vi.mock('@/api/customer', () => ({
  getCustomers: vi.fn(),
  getCustomerDetail: vi.fn(),
  updateCustomer: vi.fn(),
  updateCustomerStatus: vi.fn(),
  getCustomerStatistics: vi.fn(),
  getCustomerStatusHistory: vi.fn()
}))

const mockCustomers = [
  {
    id: '1',
    name: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    status: 'active',
    totalSpent: 1000,
    totalOrders: 10,
    points: 500,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  },
  {
    id: '2',
    name: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    status: 'inactive',
    totalSpent: 2000,
    totalOrders: 20,
    points: 1000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  }
]

const mockStatistics = {
  totalCustomers: 100,
  activeCustomers: 80,
  inactiveCustomers: 15,
  blacklistedCustomers: 5
}

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

describe('CustomerStatusTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始化', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该在挂载时加载统计数据', async () => {
      vi.mocked(customerAPI.getCustomerStatistics).mockResolvedValue(mockStatistics)

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      await wrapper.vm.loadStatistics()

      expect(customerAPI.getCustomerStatistics).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.statistics).toEqual(mockStatistics)
    })

    it('应该在挂载时加载客户列表', async () => {
      vi.mocked(customerAPI.getCustomers).mockResolvedValue({
        data: mockCustomers,
        total: mockCustomers.length
      })

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      await wrapper.vm.loadCustomerList()

      expect(customerAPI.getCustomers).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.customerList).toEqual(mockCustomers)
    })
  })

  describe('统计数据', () => {
    it('应该正确显示客户统计数据', async () => {
      vi.mocked(customerAPI.getCustomerStatistics).mockResolvedValue(mockStatistics)

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      await wrapper.vm.loadStatistics()

      expect(wrapper.vm.statistics.totalCustomers).toBe(100)
      expect(wrapper.vm.statistics.activeCustomers).toBe(80)
      expect(wrapper.vm.statistics.inactiveCustomers).toBe(15)
      expect(wrapper.vm.statistics.blacklistedCustomers).toBe(5)
    })
  })

  describe('客户列表', () => {
    it('应该正确加载客户列表', async () => {
      vi.mocked(customerAPI.getCustomers).mockResolvedValue({
        data: mockCustomers,
        total: mockCustomers.length
      })

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      await wrapper.vm.loadCustomerList()

      expect(wrapper.vm.customerList).toHaveLength(2)
      expect(wrapper.vm.customerList[0].name).toBe('张三')
      expect(wrapper.vm.customerList[1].name).toBe('李四')
    })

    it('应该支持关键词搜索', async () => {
      vi.mocked(customerAPI.getCustomers).mockResolvedValue({
        data: mockCustomers.slice(0, 1),
        total: 1
      })

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.filters.keyword = '张三'
      await wrapper.vm.loadCustomerList()

      expect(customerAPI.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: '张三'
        })
      )
    })

    it('应该支持状态筛选', async () => {
      vi.mocked(customerAPI.getCustomers).mockResolvedValue({
        data: mockCustomers.slice(0, 1),
        total: 1
      })

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.filters.status = 'active'
      await wrapper.vm.loadCustomerList()

      expect(customerAPI.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active'
        })
      )
    })
  })

  describe('状态修改', () => {
    it('应该正确打开状态修改对话框', () => {
      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.handleChangeStatus(mockCustomers[0])

      expect(wrapper.vm.statusDialogVisible).toBe(true)
      expect(wrapper.vm.statusForm.customerId).toBe('1')
      expect(wrapper.vm.statusForm.currentStatus).toBe('active')
    })

    it('应该正确提交状态修改', async () => {
      vi.mocked(customerAPI.updateCustomerStatus).mockResolvedValue({
        ...mockCustomers[0],
        status: 'inactive'
      })

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.statusForm.customerId = '1'
      wrapper.vm.statusForm.newStatus = 'inactive'
      wrapper.vm.statusForm.reason = '客户要求'

      await wrapper.vm.handleStatusSubmit()

      expect(customerAPI.updateCustomerStatus).toHaveBeenCalledWith('1', 'inactive')
      expect(ElMessage.success).toHaveBeenCalledWith('状态修改成功')
      expect(wrapper.vm.statusDialogVisible).toBe(false)
    })

    it('应该正确取消状态修改', () => {
      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.statusDialogVisible = true
      wrapper.vm.handleStatusCancel()

      expect(wrapper.vm.statusDialogVisible).toBe(false)
    })
  })

  describe('状态历史', () => {
    it('应该正确打开状态历史对话框', async () => {
      vi.mocked(customerAPI.getCustomerStatusHistory).mockResolvedValue(mockStatusHistory)

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      await wrapper.vm.handleViewHistory(mockCustomers[0])

      expect(wrapper.vm.historyDialogVisible).toBe(true)
      expect(wrapper.vm.historyCustomerId).toBe('1')
      expect(customerAPI.getCustomerStatusHistory).toHaveBeenCalledWith('1')
    })

    it('应该正确显示状态历史记录', async () => {
      vi.mocked(customerAPI.getCustomerStatusHistory).mockResolvedValue(mockStatusHistory)

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      await wrapper.vm.handleViewHistory(mockCustomers[0])

      expect(wrapper.vm.statusHistory).toHaveLength(1)
      expect(wrapper.vm.statusHistory[0].fromStatus).toBe('inactive')
      expect(wrapper.vm.statusHistory[0].toStatus).toBe('active')
    })
  })

  describe('重置筛选', () => {
    it('应该正确重置筛选条件', () => {
      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.filters.keyword = '张三'
      wrapper.vm.filters.status = 'active'

      wrapper.vm.handleReset()

      expect(wrapper.vm.filters.keyword).toBe('')
      expect(wrapper.vm.filters.status).toBe('')
    })
  })

  describe('分页', () => {
    it('应该正确处理分页变化', async () => {
      vi.mocked(customerAPI.getCustomers).mockResolvedValue({
        data: mockCustomers,
        total: 20
      })

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.pagination.page = 2
      await wrapper.vm.loadCustomerList()

      expect(customerAPI.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2
        })
      )
    })

    it('应该正确处理每页数量变化', async () => {
      vi.mocked(customerAPI.getCustomers).mockResolvedValue({
        data: mockCustomers,
        total: 20
      })

      const wrapper = mount(CustomerStatusTracker, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true
          }
        }
      })

      wrapper.vm.pagination.size = 20
      await wrapper.vm.loadCustomerList()

      expect(customerAPI.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 20
        })
      )
    })
  })
})
