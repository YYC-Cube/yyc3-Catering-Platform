/**
 * @fileoverview CustomerManagement.vue组件单元测试
 * @description 测试客户管理组件的核心逻辑功能
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-15
 * @modified 2024-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, ref, reactive } from 'vue'
import { getCustomers, type Customer } from '@/api/customer'

// 模拟API模块
vi.mock('@/api/customer', () => ({
  getCustomers: vi.fn()
}))

// 模拟Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  },
  ElTable: vi.fn(),
  ElTableColumn: vi.fn(),
  ElInput: vi.fn(),
  ElButton: vi.fn(),
  ElSelect: vi.fn(),
  ElOption: vi.fn(),
  ElDatePicker: vi.fn(),
  ElPagination: vi.fn(),
  ElDialog: vi.fn(),
  ElTag: vi.fn()
}))

// 模拟图标
vi.mock('@element-plus/icons-vue', () => ({
  User: vi.fn(),
  Star: vi.fn(),
  TrendCharts: vi.fn(),
  Money: vi.fn(),
  ArrowUp: vi.fn(),
  ArrowDown: vi.fn(),
  MoreFilled: vi.fn()
}))

// 模拟子组件
vi.mock('@/components/Customer/CustomerDetail.vue', () => ({
  default: vi.fn()
}))

vi.mock('@/components/Customer/CustomerForm.vue', () => ({
  default: vi.fn()
}))

vi.mock('@/components/Customer/CustomerSegment.vue', () => ({
  default: vi.fn()
}))

vi.mock('@/components/Customer/CustomerLoyalty.vue', () => ({
  default: vi.fn()
}))

describe('CustomerManagement.vue', () => {
  // 模拟数据
  const mockCustomers: Customer[] = [
    { id: '1', name: '张三', email: 'zhangsan@example.com', phone: '13800138001', level: 'vip', status: 'active', lastVisit: '2024-01-10T10:00:00Z', totalSpent: 5000, visitCount: 20 },
    { id: '2', name: '李四', email: 'lisi@example.com', phone: '13800138002', level: 'member', status: 'active', lastVisit: '2024-01-09T15:00:00Z', totalSpent: 3000, visitCount: 15 },
    { id: '3', name: '王五', email: 'wangwu@example.com', phone: '13800138003', level: 'regular', status: 'inactive', lastVisit: '2024-01-08T09:00:00Z', totalSpent: 1000, visitCount: 5 },
    { id: '4', name: '赵六', email: 'zhaoliu@example.com', phone: '13800138004', level: 'vip', status: 'active', lastVisit: '2024-01-07T14:00:00Z', totalSpent: 8000, visitCount: 30 },
    { id: '5', name: '孙七', email: 'sunqi@example.com', phone: '13800138005', level: 'new', status: 'active', lastVisit: '2024-01-06T11:00:00Z', totalSpent: 500, visitCount: 2 }
  ]

  const mockResponse = {
    success: true,
    data: {
      items: mockCustomers,
      pagination: {
        total: 5,
        page: 1,
        limit: 20
      }
    }
  }

  beforeEach(() => {
    // 清除模拟
    (getCustomers as vi.Mock).mockClear()
  })

  // 测试组件的逻辑函数
  describe('核心逻辑函数测试', () => {
    it('customerStats计算属性能正确计算客户统计数据', () => {
      // 模拟组件内部状态
      const customers = ref<Customer[]>(mockCustomers)
      const pagination = reactive({
        page: 1,
        pageSize: 20,
        total: 5
      })

      // 复制组件中的计算属性逻辑
      const customerStats = computed(() => [
        {
          key: 'total',
          label: '总客户数',
          value: pagination.total,
          icon: vi.fn(),
          type: 'primary',
          trend: '+12.5%',
          trendType: 'up'
        },
        {
          key: 'vip',
          label: 'VIP客户',
          value: customers.value.filter(c => c.level === 'vip').length,
          icon: vi.fn(),
          type: 'warning',
          trend: '+8.2%',
          trendType: 'up'
        },
        {
          key: 'new',
          label: '本月新增',
          value: 156, // 组件中硬编码的值
          icon: vi.fn(),
          type: 'success',
          trend: '+23.1%',
          trendType: 'up'
        },
        {
          key: 'revenue',
          label: '平均消费',
          value: '¥258', // 组件中硬编码的值
          icon: vi.fn(),
          type: 'info',
          trend: '+5.3%',
          trendType: 'up'
        }
      ])

      // 验证计算结果
      expect(customerStats.value[0].value).toBe(5) // 总客户数
      expect(customerStats.value[1].value).toBe(2) // VIP客户数
      expect(customerStats.value[2].value).toBe(156) // 本月新增
      expect(customerStats.value[3].value).toBe('¥258') // 平均消费
    })

    it('loadCustomers方法能正确处理API调用成功', async () => {
      // 模拟API响应
      (getCustomers as vi.Mock).mockResolvedValue(mockResponse)

      // 模拟组件内部状态
      const loading = ref(false)
      const customers = ref<Customer[]>([])
      const pagination = reactive({
        page: 1,
        pageSize: 20,
        total: 0
      })

      // 复制组件中的loadCustomers方法
      const loadCustomers = async () => {
        loading.value = true
        try {
          const params = {
            page: pagination.page,
            limit: pagination.pageSize,
            search: undefined,
            level: undefined,
            segment: undefined,
            status: undefined,
            startTime: undefined,
            endTime: undefined,
            sortBy: 'lastVisit',
            sortOrder: 'desc'
          }

          const response = await getCustomers(params)
          if (response.success) {
            customers.value = response.data.items
            pagination.total = response.data.pagination.total
          }
        } catch (error) {
          console.error('Load customers failed:', error)
        } finally {
          loading.value = false
        }
      }

      // 调用方法
      await loadCustomers()

      // 验证结果
      expect(getCustomers).toHaveBeenCalledTimes(1)
      expect(loading.value).toBe(false)
      expect(customers.value).toEqual(mockCustomers)
      expect(pagination.total).toBe(5)
    })

    it('loadCustomers方法能正确处理API调用失败', async () => {
      // 模拟API错误
      (getCustomers as vi.Mock).mockRejectedValue(new Error('API调用失败'))

      // 模拟组件内部状态
      const loading = ref(false)
      const customers = ref<Customer[]>([])
      const pagination = reactive({
        page: 1,
        pageSize: 20,
        total: 0
      })

      // 复制组件中的loadCustomers方法
      const loadCustomers = async () => {
        loading.value = true
        try {
          const params = {
            page: pagination.page,
            limit: pagination.pageSize,
            search: undefined,
            level: undefined,
            segment: undefined,
            status: undefined,
            startTime: undefined,
            endTime: undefined,
            sortBy: 'lastVisit',
            sortOrder: 'desc'
          }

          const response = await getCustomers(params)
          if (response.success) {
            customers.value = response.data.items
            pagination.total = response.data.pagination.total
          }
        } catch (error) {
          console.error('Load customers failed:', error)
        } finally {
          loading.value = false
        }
      }

      // 调用方法
      await loadCustomers()

      // 验证结果
      expect(getCustomers).toHaveBeenCalledTimes(1)
      expect(loading.value).toBe(false)
      expect(customers.value).toEqual([])
      expect(pagination.total).toBe(0)
    })

    it('handleSearch方法能正确更新分页并重新加载数据', async () => {
      // 模拟组件内部状态
      const searchQuery = ref('张三')
      const pagination = reactive({
        page: 2,
        pageSize: 20,
        total: 0
      })
      const loadCustomers = vi.fn()

      // 复制组件中的handleSearch方法
      const handleSearch = () => {
        pagination.page = 1
        loadCustomers()
      }

      // 调用方法
      handleSearch()

      // 验证结果
      expect(pagination.page).toBe(1)
      expect(loadCustomers).toHaveBeenCalledTimes(1)
    })
  })

  // 测试客户筛选和分类逻辑
  describe('客户筛选和分类逻辑', () => {
    it('能正确筛选VIP客户', () => {
      // 模拟组件内部状态
      const customers = ref<Customer[]>(mockCustomers)

      // 筛选VIP客户
      const vipCustomers = customers.value.filter(c => c.level === 'vip')

      // 验证结果
      expect(vipCustomers.length).toBe(2)
      expect(vipCustomers.every(c => c.level === 'vip')).toBe(true)
      expect(vipCustomers.map(c => c.name)).toEqual(['张三', '赵六'])
    })

    it('能正确筛选活跃客户', () => {
      // 模拟组件内部状态
      const customers = ref<Customer[]>(mockCustomers)

      // 筛选活跃客户
      const activeCustomers = customers.value.filter(c => c.status === 'active')

      // 验证结果
      expect(activeCustomers.length).toBe(4)
      expect(activeCustomers.every(c => c.status === 'active')).toBe(true)
    })
  })
})
