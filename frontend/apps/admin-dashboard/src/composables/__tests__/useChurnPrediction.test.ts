/**
 * YYC³餐饮行业智能化平台 - 客户流失预测单元测试
 * @fileoverview 测试客户流失预测模型的各种功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useChurnPrediction } from '@/composables/useChurnPrediction'

// 模拟客户仓库
const mockCustomerRepository = {
  findById: vi.fn()
}

// 模拟流失预测仓库
const mockChurnRepository = {
  save: vi.fn(),
  findByDateRange: vi.fn()
}

// 模拟工具函数
const mockGetDaysSince = vi.fn((date) => {
  if (!date) return 999
  const now = new Date()
  const target = new Date(date)
  const diffTime = Math.abs(now.getTime() - target.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const mockGenerateId = vi.fn(() => 'test-id')

describe('useChurnPrediction', () => {
  let churnPrediction: ReturnType<typeof useChurnPrediction>

  beforeEach(() => {
    vi.clearAllMocks()
    
    churnPrediction = useChurnPrediction({
      customerRepository: mockCustomerRepository,
      churnRepository: mockChurnRepository,
      getDaysSince: mockGetDaysSince,
      generateId: mockGenerateId
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化流失预测模型', () => {
      expect(churnPrediction).toBeDefined()
      expect(churnPrediction.riskFactors).toBeDefined()
      expect(Array.isArray(churnPrediction.riskFactors)).toBe(true)
    })

    it('应该初始化默认风险因素', () => {
      expect(churnPrediction.riskFactors.length).toBeGreaterThan(0)
      
      const inactive30Days = churnPrediction.riskFactors.find(f => f.factor === '30天未消费')
      expect(inactive30Days).toBeDefined()
      expect(inactive30Days?.weight).toBe(0.2)
      expect(inactive30Days?.threshold).toBe(30)
    })
  })

  describe('流失预测', () => {
    it('应该正确预测高流失风险客户', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        totalOrders: 5,
        totalSpent: 500,
        lastOrderAt: new Date('2025-10-20')
      }

      mockChurnRepository.save.mockResolvedValue(customer)

      const prediction = await churnPrediction.predictChurn(customer)

      expect(prediction.customerId).toBe('1')
      expect(prediction.customerName).toBe('张三')
      expect(prediction.churnProbability).toBeGreaterThanOrEqual(0.7)
      expect(prediction.riskLevel).toBe('high')
      expect(prediction.riskFactors).toContain('90天未消费')
      expect(mockChurnRepository.save).toHaveBeenCalledWith(prediction)
    })

    it('应该正确预测中等流失风险客户', async () => {
      const customer = {
        id: '2',
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        totalOrders: 10,
        totalSpent: 1000,
        lastOrderAt: new Date('2025-12-20')
      }

      mockChurnRepository.save.mockResolvedValue(customer)

      const prediction = await churnPrediction.predictChurn(customer)

      expect(prediction.customerId).toBe('2')
      expect(prediction.churnProbability).toBeGreaterThanOrEqual(0.4)
      expect(prediction.churnProbability).toBeLessThan(0.7)
      expect(prediction.riskLevel).toBe('medium')
      expect(prediction.riskFactors).toContain('60天未消费')
    })

    it('应该正确预测低流失风险客户', async () => {
      const customer = {
        id: '3',
        name: '王五',
        phone: '13800138003',
        email: 'wangwu@example.com',
        totalOrders: 20,
        totalSpent: 5000,
        lastOrderAt: new Date('2026-01-18')
      }

      mockChurnRepository.save.mockResolvedValue(customer)

      const prediction = await churnPrediction.predictChurn(customer)

      expect(prediction.customerId).toBe('3')
      expect(prediction.churnProbability).toBeLessThan(0.4)
      expect(prediction.riskLevel).toBe('low')
      expect(prediction.riskFactors.length).toBe(0)
    })

    it('应该正确计算流失概率', async () => {
      const customer = {
        id: '4',
        name: '赵六',
        phone: '13800138004',
        email: 'zhaoliu@example.com',
        totalOrders: 3,
        totalSpent: 300,
        lastOrderAt: new Date('2025-11-20')
      }

      mockChurnRepository.save.mockResolvedValue(customer)

      const prediction = await churnPrediction.predictChurn(customer)

      expect(prediction.churnProbability).toBeGreaterThanOrEqual(0)
      expect(prediction.churnProbability).toBeLessThanOrEqual(1)
    })

    it('应该正确生成风险因素', async () => {
      const customer = {
        id: '5',
        name: '钱七',
        phone: '13800138005',
        email: 'qianqi@example.com',
        totalOrders: 2,
        totalSpent: 200,
        lastOrderAt: new Date('2025-10-20')
      }

      mockChurnRepository.save.mockResolvedValue(customer)

      const prediction = await churnPrediction.predictChurn(customer)

      expect(prediction.riskFactors).toContain('90天未消费')
      expect(prediction.riskFactors).toContain('60天未消费')
      expect(prediction.riskFactors).toContain('30天未消费')
    })

    it('应该正确生成建议', async () => {
      const customer = {
        id: '6',
        name: '孙八',
        phone: '13800138006',
        email: 'sunba@example.com',
        totalOrders: 5,
        totalSpent: 500,
        lastOrderAt: new Date('2025-10-20')
      }

      mockChurnRepository.save.mockResolvedValue(customer)

      const prediction = await churnPrediction.predictChurn(customer)

      expect(prediction.recommendations).toBeDefined()
      expect(Array.isArray(prediction.recommendations)).toBe(true)
      expect(prediction.recommendations.length).toBeGreaterThan(0)
    })

    it('应该正确预测流失日期', async () => {
      const customer = {
        id: '7',
        name: '周九',
        phone: '13800138007',
        email: 'zhoujiu@example.com',
        totalOrders: 5,
        totalSpent: 500,
        lastOrderAt: new Date('2025-10-20')
      }

      mockChurnRepository.save.mockResolvedValue(customer)

      const prediction = await churnPrediction.predictChurn(customer)

      expect(prediction.predictedChurnDate).toBeDefined()
      expect(prediction.predictedChurnDate).toBeInstanceOf(Date)
    })
  })

  describe('批量预测', () => {
    it('应该正确批量预测客户流失', async () => {
      const customers = [
        {
          id: '1',
          name: '张三',
          phone: '13800138001',
          email: 'zhangsan@example.com',
          totalOrders: 5,
          totalSpent: 500,
          lastOrderAt: new Date('2025-10-20')
        },
        {
          id: '2',
          name: '李四',
          phone: '13800138002',
          email: 'lisi@example.com',
          totalOrders: 20,
          totalSpent: 5000,
          lastOrderAt: new Date('2026-01-18')
        }
      ]

      mockChurnRepository.save.mockResolvedValue({})

      const results = await churnPrediction.batchPredictChurn(['1', '2'])

      expect(results).toHaveLength(2)
      expect(results[0].customerId).toBe('1')
      expect(results[1].customerId).toBe('2')
      expect(mockChurnRepository.save).toHaveBeenCalledTimes(2)
    })

    it('应该跳过不存在的客户', async () => {
      mockCustomerRepository.findById.mockResolvedValue(null)

      const results = await churnPrediction.batchPredictChurn(['999'])

      expect(results).toHaveLength(0)
      expect(mockCustomerRepository.findById).toHaveBeenCalledWith('999')
    })
  })

  describe('风险等级', () => {
    it('应该正确划分高风险等级', () => {
      const riskLevel = churnPrediction.getRiskLevel(0.8)

      expect(riskLevel).toBe('high')
    })

    it('应该正确划分中风险等级', () => {
      const riskLevel = churnPrediction.getRiskLevel(0.5)

      expect(riskLevel).toBe('medium')
    })

    it('应该正确划分低风险等级', () => {
      const riskLevel = churnPrediction.getRiskLevel(0.2)

      expect(riskLevel).toBe('low')
    })

    it('应该正确处理边界值', () => {
      expect(churnPrediction.getRiskLevel(0.7)).toBe('high')
      expect(churnPrediction.getRiskLevel(0.4)).toBe('medium')
    })
  })

  describe('流失日期预测', () => {
    it('应该正确预测流失日期', () => {
      const churnProbability = 0.8
      const daysSinceLastOrder = 90

      const predictedDate = churnPrediction.predictChurnDate(churnProbability, daysSinceLastOrder)

      expect(predictedDate).toBeInstanceOf(Date)
      expect(predictedDate.getTime()).toBeGreaterThan(Date.now())
    })

    it('应该根据流失概率调整预测日期', () => {
      const highRiskDate = churnPrediction.predictChurnDate(0.8, 90)
      const lowRiskDate = churnPrediction.predictChurnDate(0.2, 90)

      expect(highRiskDate.getTime()).toBeLessThan(lowRiskDate.getTime())
    })
  })

  describe('建议生成', () => {
    it('应该为30天未消费客户生成建议', () => {
      const riskFactors = ['30天未消费']
      const riskLevel = 'medium'

      const recommendations = churnPrediction.generateRecommendations(riskFactors, riskLevel)

      expect(recommendations).toContain('发送关怀短信')
      expect(recommendations).toContain('提供专属优惠券')
    })

    it('应该为60天未消费客户生成建议', () => {
      const riskFactors = ['60天未消费']
      const riskLevel = 'high'

      const recommendations = churnPrediction.generateRecommendations(riskFactors, riskLevel)

      expect(recommendations).toContain('安排客户回访')
      expect(recommendations).toContain('提供会员优惠')
    })

    it('应该为90天未消费客户生成建议', () => {
      const riskFactors = ['90天未消费']
      const riskLevel = 'high'

      const recommendations = churnPrediction.generateRecommendations(riskFactors, riskLevel)

      expect(recommendations).toContain('立即联系客户了解情况')
      expect(recommendations).toContain('提供专属优惠套餐')
    })

    it('应该为消费下降客户生成建议', () => {
      const riskFactors = ['消费频次下降50%', '消费金额下降50%']
      const riskLevel = 'medium'

      const recommendations = churnPrediction.generateRecommendations(riskFactors, riskLevel)

      expect(recommendations).toContain('了解客户需求变化')
      expect(recommendations).toContain('优化产品和服务')
    })

    it('应该为高风险客户优先生成建议', () => {
      const riskFactors = ['30天未消费']
      const riskLevel = 'high'

      const recommendations = churnPrediction.generateRecommendations(riskFactors, riskLevel)

      expect(recommendations[0]).toBe('立即联系客户了解情况')
    })

    it('应该去重建议', () => {
      const riskFactors = ['30天未消费', '60天未消费']
      const riskLevel = 'high'

      const recommendations = churnPrediction.generateRecommendations(riskFactors, riskLevel)

      const uniqueRecommendations = [...new Set(recommendations)]
      expect(recommendations).toEqual(uniqueRecommendations)
    })
  })

  describe('流失统计', () => {
    it('应该正确计算流失统计信息', async () => {
      const predictions = [
        {
          id: '1',
          customerId: '1',
          customerName: '张三',
          customerPhone: '13800138001',
          customerEmail: 'zhangsan@example.com',
          churnProbability: 0.8,
          riskLevel: 'high',
          riskFactors: ['90天未消费'],
          predictedChurnDate: new Date('2026-03-20'),
          recommendations: ['立即联系客户了解情况'],
          assignedTo: null,
          status: 'pending',
          createdAt: new Date('2026-01-20'),
          updatedAt: new Date('2026-01-20')
        },
        {
          id: '2',
          customerId: '2',
          customerName: '李四',
          customerPhone: '13800138002',
          customerEmail: 'lisi@example.com',
          churnProbability: 0.5,
          riskLevel: 'medium',
          riskFactors: ['60天未消费'],
          predictedChurnDate: new Date('2026-02-20'),
          recommendations: ['安排客户回访'],
          assignedTo: null,
          status: 'in_progress',
          createdAt: new Date('2026-01-20'),
          updatedAt: new Date('2026-01-20')
        },
        {
          id: '3',
          customerId: '3',
          customerName: '王五',
          customerPhone: '13800138003',
          customerEmail: 'wangwu@example.com',
          churnProbability: 0.2,
          riskLevel: 'low',
          riskFactors: [],
          predictedChurnDate: new Date('2026-04-20'),
          recommendations: [],
          assignedTo: null,
          status: 'resolved',
          createdAt: new Date('2026-01-20'),
          updatedAt: new Date('2026-01-20')
        }
      ]

      mockChurnRepository.findByDateRange.mockResolvedValue(predictions)

      const statistics = await churnPrediction.getChurnStatistics()

      expect(statistics.totalPredictions).toBe(3)
      expect(statistics.highRiskCount).toBe(1)
      expect(statistics.mediumRiskCount).toBe(1)
      expect(statistics.lowRiskCount).toBe(1)
      expect(statistics.pendingCount).toBe(1)
      expect(statistics.inProgressCount).toBe(1)
      expect(statistics.resolvedCount).toBe(1)
      expect(statistics.averageChurnProbability).toBeCloseTo(0.5, 1)
    })

    it('应该正确计算流失趋势', async () => {
      const predictions = [
        {
          id: '1',
          customerId: '1',
          customerName: '张三',
          customerPhone: '13800138001',
          customerEmail: 'zhangsan@example.com',
          churnProbability: 0.8,
          riskLevel: 'high',
          riskFactors: ['90天未消费'],
          predictedChurnDate: new Date('2026-03-20'),
          recommendations: ['立即联系客户了解情况'],
          assignedTo: null,
          status: 'resolved',
          createdAt: new Date('2026-01-20'),
          updatedAt: new Date('2026-01-20')
        },
        {
          id: '2',
          customerId: '2',
          customerName: '李四',
          customerPhone: '13800138002',
          customerEmail: 'lisi@example.com',
          churnProbability: 0.5,
          riskLevel: 'medium',
          riskFactors: ['60天未消费'],
          predictedChurnDate: new Date('2026-02-20'),
          recommendations: ['安排客户回访'],
          assignedTo: null,
          status: 'pending',
          createdAt: new Date('2026-01-19'),
          updatedAt: new Date('2026-01-19')
        }
      ]

      mockChurnRepository.findByDateRange.mockResolvedValue(predictions)

      const statistics = await churnPrediction.getChurnStatistics()

      expect(statistics.churnTrend).toBeDefined()
      expect(Array.isArray(statistics.churnTrend)).toBe(true)
      expect(statistics.churnTrend.length).toBeGreaterThan(0)
    })
  })

  describe('风险因素管理', () => {
    it('应该正确添加风险因素', () => {
      const newRiskFactor = {
        factor: '测试风险因素',
        weight: 0.15,
        threshold: 100
      }

      churnPrediction.addRiskFactor(newRiskFactor)

      expect(churnPrediction.riskFactors).toContainEqual(newRiskFactor)
    })

    it('应该正确更新风险因素', () => {
      const updatedRiskFactor = {
        factor: '30天未消费',
        weight: 0.25,
        threshold: 30
      }

      churnPrediction.updateRiskFactor('30天未消费', updatedRiskFactor)

      const riskFactor = churnPrediction.riskFactors.find(f => f.factor === '30天未消费')
      expect(riskFactor).toEqual(updatedRiskFactor)
    })

    it('应该正确删除风险因素', () => {
      const initialLength = churnPrediction.riskFactors.length
      churnPrediction.removeRiskFactor('30天未消费')

      expect(churnPrediction.riskFactors.length).toBe(initialLength - 1)
      expect(churnPrediction.riskFactors.find(f => f.factor === '30天未消费')).toBeUndefined()
    })
  })
})
