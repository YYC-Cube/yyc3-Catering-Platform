/**
 * YYC³餐饮管理系统 - Dashboard API测试
 * 测试Dashboard API服务的功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { dashboardApi } from '../dashboard'

vi.mock('axios')

describe('Dashboard API', () => {
  const mockAxios = axios as any

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCoreMetrics', () => {
    it('应该成功获取核心指标数据', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalRevenue: 28500,
          totalOrders: 125,
          averageOrderValue: 228,
          customerCount: 89,
          orderChange: 12.5,
          revenueChange: 8.3
        }
      }

      mockAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockResponse })
      })

      const result = await dashboardApi.getCoreMetrics()

      expect(result.success).toBe(true)
      expect(result.data.totalRevenue).toBe(28500)
      expect(result.data.totalOrders).toBe(125)
    })

    it('应该正确传递过滤参数', async () => {
      const mockResponse = {
        success: true,
        data: {}
      }

      const mockGet = vi.fn().mockResolvedValue({ data: mockResponse })
      mockAxios.create.mockReturnValue({
        get: mockGet
      })

      const filters = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        period: 'month'
      }

      await dashboardApi.getCoreMetrics(filters)

      expect(mockGet).toHaveBeenCalledWith('/dashboard/metrics', {
        params: filters
      })
    })

    it('应该处理API错误', async () => {
      mockAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('Network error'))
      })

      await expect(dashboardApi.getCoreMetrics()).rejects.toThrow('Network error')
    })
  })

  describe('getRevenueData', () => {
    it('应该成功获取营收数据', async () => {
      const mockResponse = {
        success: true,
        data: [
          { date: '2025-01-01', amount: 3000, orders: 15, customers: 20 },
          { date: '2025-01-02', amount: 3500, orders: 18, customers: 25 }
        ]
      }

      mockAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockResponse })
      })

      const result = await dashboardApi.getRevenueData()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].amount).toBe(3000)
    })
  })

  describe('getOrderDistribution', () => {
    it('应该成功获取订单分布数据', async () => {
      const mockResponse = {
        success: true,
        data: [
          { status: 'pending', count: 12, percentage: 10 },
          { status: 'completed', count: 105, percentage: 82 }
        ]
      }

      mockAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockResponse })
      })

      const result = await dashboardApi.getOrderDistribution()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].status).toBe('pending')
    })
  })

  describe('getTopDishes', () => {
    it('应该成功获取热门菜品数据', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 'dish-1', name: '招牌红烧肉', sales: 45, revenue: 2700, percentage: 35 }
        ]
      }

      mockAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockResponse })
      })

      const result = await dashboardApi.getTopDishes()

      expect(result.success).toBe(true)
      expect(result.data[0].name).toBe('招牌红烧肉')
      expect(result.data[0].sales).toBe(45)
    })
  })

  describe('getCustomerFlow', () => {
    it('应该成功获取客流数据', async () => {
      const mockResponse = {
        success: true,
        data: [
          { hour: 10, count: 15 },
          { hour: 11, count: 20 }
        ]
      }

      mockAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockResponse })
      })

      const result = await dashboardApi.getCustomerFlow()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].hour).toBe(10)
    })
  })

  describe('exportReport', () => {
    it('应该成功导出Excel报表', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const mockResponse = { data: mockBlob }

      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      mockAxios.create.mockReturnValue({
        post: mockPost
      })

      const result = await dashboardApi.exportReport('excel')

      expect(result).toBeInstanceOf(Blob)
      expect(mockPost).toHaveBeenCalledWith('/dashboard/export', {
        format: 'excel',
        filters: undefined
      }, {
        responseType: 'blob'
      })
    })

    it('应该正确传递导出参数', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' })
      const mockResponse = { data: mockBlob }

      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      mockAxios.create.mockReturnValue({
        post: mockPost
      })

      const filters = {
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      }

      await dashboardApi.exportReport('csv', filters)

      expect(mockPost).toHaveBeenCalledWith('/dashboard/export', {
        format: 'csv',
        filters
      }, {
        responseType: 'blob'
      })
    })

    it('应该处理导出错误', async () => {
      mockAxios.create.mockReturnValue({
        post: vi.fn().mockRejectedValue(new Error('Export failed'))
      })

      await expect(dashboardApi.exportReport('excel')).rejects.toThrow('Export failed')
    })
  })

  describe('认证token处理', () => {
    it('应该在请求中添加认证token', async () => {
      const token = 'test-token-123'
      localStorage.setItem('auth_token', token)

      const mockResponse = {
        success: true,
        data: {}
      }

      const mockGet = vi.fn().mockResolvedValue({ data: mockResponse })
      mockAxios.create.mockReturnValue({
        get: mockGet
      })

      await dashboardApi.getCoreMetrics()

      const axiosInstance = mockAxios.create.mock.results[0].value
      const requestInterceptor = axiosInstance.interceptors.request.handlers[0]

      const config = {}
      requestInterceptor.fulfilled(config)

      expect(config.headers.Authorization).toBe(`Bearer ${token}`)
    })
  })
})
