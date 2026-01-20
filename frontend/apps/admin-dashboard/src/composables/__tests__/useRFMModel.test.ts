/**
 * YYC³餐饮行业智能化平台 - RFM模型单元测试
 * @fileoverview 测试RFM客户价值评估模型的各种功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useRFMModel } from '@/composables/useRFMModel'

// 模拟客户仓库
const mockCustomerRepository = {
  findById: vi.fn()
}

// 模拟RFM仓库
const mockRFMRepository = {
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

describe('useRFMModel', () => {
  let rfmModel: ReturnType<typeof useRFMModel>

  beforeEach(() => {
    vi.clearAllMocks()
    
    rfmModel = useRFMModel({
      customerRepository: mockCustomerRepository,
      rfmRepository: mockRFMRepository,
      getDaysSince: mockGetDaysSince,
      generateId: mockGenerateId
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化RFM模型', () => {
      expect(rfmModel).toBeDefined()
      expect(rfmModel.recencyWeights).toBeDefined()
      expect(rfmModel.frequencyWeights).toBeDefined()
      expect(rfmModel.monetaryWeights).toBeDefined()
    })

    it('应该设置默认评分权重', () => {
      expect(rfmModel.recencyWeights).toEqual({ 7: 5, 14: 4, 30: 3, 60: 2, 90: 1 })
      expect(rfmModel.frequencyWeights).toEqual({ 20: 5, 10: 4, 5: 3, 2: 2, 1: 1 })
      expect(rfmModel.monetaryWeights).toEqual({ 5000: 5, 2000: 4, 1000: 3, 500: 2, 0: 1 })
    })
  })

  describe('RFM评分计算', () => {
    it('应该正确计算超级VIP客户RFM评分', async () => {
      const customer = {
        id: '1',
        name: '张三',
        totalOrders: 25,
        totalSpent: 6000,
        lastOrderAt: new Date('2026-01-18')
      }

      mockRFMRepository.save.mockResolvedValue(customer)

      const rfmScore = await rfmModel.calculateRFMScore(customer)

      expect(rfmScore.recencyScore).toBe(5)
      expect(rfmScore.frequencyScore).toBe(5)
      expect(rfmScore.monetaryScore).toBe(5)
      expect(rfmScore.rfmScore).toBe(15)
      expect(rfmScore.customerLevel).toBe('超级VIP')
      expect(mockRFMRepository.save).toHaveBeenCalledWith(rfmScore)
    })

    it('应该正确计算VIP客户RFM评分', async () => {
      const customer = {
        id: '2',
        name: '李四',
        totalOrders: 15,
        totalSpent: 3000,
        lastOrderAt: new Date('2026-01-15')
      }

      mockRFMRepository.save.mockResolvedValue(customer)

      const rfmScore = await rfmModel.calculateRFMScore(customer)

      expect(rfmScore.recencyScore).toBe(5)
      expect(rfmScore.frequencyScore).toBe(4)
      expect(rfmScore.monetaryScore).toBe(4)
      expect(rfmScore.rfmScore).toBe(13)
      expect(rfmScore.customerLevel).toBe('VIP')
    })

    it('应该正确计算会员客户RFM评分', async () => {
      const customer = {
        id: '3',
        name: '王五',
        totalOrders: 8,
        totalSpent: 1200,
        lastOrderAt: new Date('2026-01-10')
      }

      mockRFMRepository.save.mockResolvedValue(customer)

      const rfmScore = await rfmModel.calculateRFMScore(customer)

      expect(rfmScore.recencyScore).toBe(5)
      expect(rfmScore.frequencyScore).toBe(3)
      expect(rfmScore.monetaryScore).toBe(3)
      expect(rfmScore.rfmScore).toBe(11)
      expect(rfmScore.customerLevel).toBe('VIP')
    })

    it('应该正确计算普通客户RFM评分', async () => {
      const customer = {
        id: '4',
        name: '赵六',
        totalOrders: 3,
        totalSpent: 600,
        lastOrderAt: new Date('2026-01-05')
      }

      mockRFMRepository.save.mockResolvedValue(customer)

      const rfmScore = await rfmModel.calculateRFMScore(customer)

      expect(rfmScore.recencyScore).toBe(5)
      expect(rfmScore.frequencyScore).toBe(2)
      expect(rfmScore.monetaryScore).toBe(2)
      expect(rfmScore.rfmScore).toBe(9)
      expect(rfmScore.customerLevel).toBe('会员')
    })

    it('应该正确计算低价值客户RFM评分', async () => {
      const customer = {
        id: '5',
        name: '钱七',
        totalOrders: 1,
        totalSpent: 200,
        lastOrderAt: new Date('2025-12-20')
      }

      mockRFMRepository.save.mockResolvedValue(customer)

      const rfmScore = await rfmModel.calculateRFMScore(customer)

      expect(rfmScore.recencyScore).toBe(3)
      expect(rfmScore.frequencyScore).toBe(1)
      expect(rfmScore.monetaryScore).toBe(1)
      expect(rfmScore.rfmScore).toBe(5)
      expect(rfmScore.customerLevel).toBe('普通')
    })

    it('应该正确处理没有订单记录的客户', async () => {
      const customer = {
        id: '6',
        name: '孙八',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: null
      }

      mockRFMRepository.save.mockResolvedValue(customer)

      const rfmScore = await rfmModel.calculateRFMScore(customer)

      expect(rfmScore.recencyScore).toBe(1)
      expect(rfmScore.frequencyScore).toBe(1)
      expect(rfmScore.monetaryScore).toBe(1)
      expect(rfmScore.rfmScore).toBe(3)
      expect(rfmScore.customerLevel).toBe('低价值')
    })
  })

  describe('Recency评分', () => {
    it('应该正确计算7天内Recency评分', () => {
      const lastOrderAt = new Date('2026-01-18')
      const score = rfmModel.calculateRecencyScore(lastOrderAt)

      expect(score).toBe(5)
    })

    it('应该正确计算14天内Recency评分', () => {
      const lastOrderAt = new Date('2026-01-10')
      const score = rfmModel.calculateRecencyScore(lastOrderAt)

      expect(score).toBe(4)
    })

    it('应该正确计算30天内Recency评分', () => {
      const lastOrderAt = new Date('2026-01-01')
      const score = rfmModel.calculateRecencyScore(lastOrderAt)

      expect(score).toBe(3)
    })

    it('应该正确计算60天内Recency评分', () => {
      const lastOrderAt = new Date('2025-12-01')
      const score = rfmModel.calculateRecencyScore(lastOrderAt)

      expect(score).toBe(2)
    })

    it('应该正确计算90天以上Recency评分', () => {
      const lastOrderAt = new Date('2025-10-01')
      const score = rfmModel.calculateRecencyScore(lastOrderAt)

      expect(score).toBe(1)
    })

    it('应该正确处理null的lastOrderAt', () => {
      const score = rfmModel.calculateRecencyScore(null)

      expect(score).toBe(1)
    })
  })

  describe('Frequency评分', () => {
    it('应该正确计算20次以上Frequency评分', () => {
      const score = rfmModel.calculateFrequencyScore(25)

      expect(score).toBe(5)
    })

    it('应该正确计算10-19次Frequency评分', () => {
      const score = rfmModel.calculateFrequencyScore(15)

      expect(score).toBe(4)
    })

    it('应该正确计算5-9次Frequency评分', () => {
      const score = rfmModel.calculateFrequencyScore(7)

      expect(score).toBe(3)
    })

    it('应该正确计算2-4次Frequency评分', () => {
      const score = rfmModel.calculateFrequencyScore(3)

      expect(score).toBe(2)
    })

    it('应该正确计算1次Frequency评分', () => {
      const score = rfmModel.calculateFrequencyScore(1)

      expect(score).toBe(1)
    })

    it('应该正确计算0次Frequency评分', () => {
      const score = rfmModel.calculateFrequencyScore(0)

      expect(score).toBe(1)
    })
  })

  describe('Monetary评分', () => {
    it('应该正确计算5000元以上Monetary评分', () => {
      const score = rfmModel.calculateMonetaryScore(6000)

      expect(score).toBe(5)
    })

    it('应该正确计算2000-4999元Monetary评分', () => {
      const score = rfmModel.calculateMonetaryScore(3000)

      expect(score).toBe(4)
    })

    it('应该正确计算1000-1999元Monetary评分', () => {
      const score = rfmModel.calculateMonetaryScore(1500)

      expect(score).toBe(3)
    })

    it('应该正确计算500-999元Monetary评分', () => {
      const score = rfmModel.calculateMonetaryScore(700)

      expect(score).toBe(2)
    })

    it('应该正确计算0-499元Monetary评分', () => {
      const score = rfmModel.calculateMonetaryScore(300)

      expect(score).toBe(1)
    })

    it('应该正确计算0元Monetary评分', () => {
      const score = rfmModel.calculateMonetaryScore(0)

      expect(score).toBe(1)
    })
  })

  describe('客户等级划分', () => {
    it('应该正确划分超级VIP客户', () => {
      const level = rfmModel.getCustomerLevel(15)

      expect(level).toBe('超级VIP')
    })

    it('应该正确划分VIP客户', () => {
      const level = rfmModel.getCustomerLevel(12)

      expect(level).toBe('VIP')
    })

    it('应该正确划分会员客户', () => {
      const level = rfmModel.getCustomerLevel(8)

      expect(level).toBe('会员')
    })

    it('应该正确划分普通客户', () => {
      const level = rfmModel.getCustomerLevel(5)

      expect(level).toBe('普通')
    })

    it('应该正确划分低价值客户', () => {
      const level = rfmModel.getCustomerLevel(3)

      expect(level).toBe('低价值')
    })
  })

  describe('批量计算RFM评分', () => {
    it('应该正确批量计算RFM评分', async () => {
      const customers = [
        {
          id: '1',
          name: '张三',
          totalOrders: 25,
          totalSpent: 6000,
          lastOrderAt: new Date('2026-01-18')
        },
        {
          id: '2',
          name: '李四',
          totalOrders: 15,
          totalSpent: 3000,
          lastOrderAt: new Date('2026-01-15')
        }
      ]

      mockCustomerRepository.findById
        .mockResolvedValueOnce(customers[0])
        .mockResolvedValueOnce(customers[1])
      mockRFMRepository.save.mockResolvedValue({})

      const results = await rfmModel.batchCalculateRFMScores(['1', '2'])

      expect(results).toHaveLength(2)
      expect(results[0].customerId).toBe('1')
      expect(results[1].customerId).toBe('2')
      expect(mockCustomerRepository.findById).toHaveBeenCalledTimes(2)
    })

    it('应该跳过不存在的客户', async () => {
      mockCustomerRepository.findById.mockResolvedValue(null)

      const results = await rfmModel.batchCalculateRFMScores(['999'])

      expect(results).toHaveLength(0)
      expect(mockCustomerRepository.findById).toHaveBeenCalledWith('999')
    })
  })

  describe('RFM统计', () => {
    it('应该正确计算RFM统计信息', async () => {
      const rfmScores = [
        {
          id: '1',
          customerId: '1',
          recencyScore: 5,
          frequencyScore: 5,
          monetaryScore: 5,
          rfmScore: 15,
          customerLevel: '超级VIP',
          calculatedAt: new Date()
        },
        {
          id: '2',
          customerId: '2',
          recencyScore: 4,
          frequencyScore: 4,
          monetaryScore: 4,
          rfmScore: 12,
          customerLevel: 'VIP',
          calculatedAt: new Date()
        },
        {
          id: '3',
          customerId: '3',
          recencyScore: 3,
          frequencyScore: 3,
          monetaryScore: 3,
          rfmScore: 9,
          customerLevel: '会员',
          calculatedAt: new Date()
        }
      ]

      mockRFMRepository.findByDateRange.mockResolvedValue(rfmScores)

      const statistics = await rfmModel.getRFMStatistics()

      expect(statistics.totalCustomers).toBe(3)
      expect(statistics.averageRFMScore).toBe(12)
      expect(statistics.customerLevelDistribution).toHaveLength(5)
      expect(statistics.recencyDistribution).toHaveLength(5)
      expect(statistics.frequencyDistribution).toHaveLength(5)
      expect(statistics.monetaryDistribution).toHaveLength(5)
    })

    it('应该正确计算客户等级分布', async () => {
      const rfmScores = [
        {
          id: '1',
          customerId: '1',
          recencyScore: 5,
          frequencyScore: 5,
          monetaryScore: 5,
          rfmScore: 15,
          customerLevel: '超级VIP',
          calculatedAt: new Date()
        },
        {
          id: '2',
          customerId: '2',
          recencyScore: 4,
          frequencyScore: 4,
          monetaryScore: 4,
          rfmScore: 12,
          customerLevel: 'VIP',
          calculatedAt: new Date()
        },
        {
          id: '3',
          customerId: '3',
          recencyScore: 3,
          frequencyScore: 3,
          monetaryScore: 3,
          rfmScore: 9,
          customerLevel: '会员',
          calculatedAt: new Date()
        }
      ]

      mockRFMRepository.findByDateRange.mockResolvedValue(rfmScores)

      const statistics = await rfmModel.getRFMStatistics()

      const levelDistribution = statistics.customerLevelDistribution
      const superVipLevel = levelDistribution.find(l => l.level === '超级VIP')
      const vipLevel = levelDistribution.find(l => l.level === 'VIP')
      const memberLevel = levelDistribution.find(l => l.level === '会员')

      expect(superVipLevel?.count).toBe(1)
      expect(superVipLevel?.percentage).toBeCloseTo(33.33, 1)
      expect(vipLevel?.count).toBe(1)
      expect(vipLevel?.percentage).toBeCloseTo(33.33, 1)
      expect(memberLevel?.count).toBe(1)
      expect(memberLevel?.percentage).toBeCloseTo(33.33, 1)
    })

    it('应该正确计算评分分布', async () => {
      const rfmScores = [
        {
          id: '1',
          customerId: '1',
          recencyScore: 5,
          frequencyScore: 5,
          monetaryScore: 5,
          rfmScore: 15,
          customerLevel: '超级VIP',
          calculatedAt: new Date()
        },
        {
          id: '2',
          customerId: '2',
          recencyScore: 4,
          frequencyScore: 4,
          monetaryScore: 4,
          rfmScore: 12,
          customerLevel: 'VIP',
          calculatedAt: new Date()
        },
        {
          id: '3',
          customerId: '3',
          recencyScore: 3,
          frequencyScore: 3,
          monetaryScore: 3,
          rfmScore: 9,
          customerLevel: '会员',
          calculatedAt: new Date()
        }
      ]

      mockRFMRepository.findByDateRange.mockResolvedValue(rfmScores)

      const statistics = await rfmModel.getRFMStatistics()

      const recencyDistribution = statistics.recencyDistribution
      const score5 = recencyDistribution.find(d => d.score === 5)
      const score4 = recencyDistribution.find(d => d.score === 4)
      const score3 = recencyDistribution.find(d => d.score === 3)

      expect(score5?.count).toBe(1)
      expect(score5?.percentage).toBeCloseTo(33.33, 1)
      expect(score4?.count).toBe(1)
      expect(score4?.percentage).toBeCloseTo(33.33, 1)
      expect(score3?.count).toBe(1)
      expect(score3?.percentage).toBeCloseTo(33.33, 1)
    })
  })

  describe('权重管理', () => {
    it('应该正确更新Recency权重', () => {
      const newWeights = { 5: 5, 10: 4, 20: 3, 40: 2, 60: 1 }
      rfmModel.updateRecencyWeights(newWeights)

      expect(rfmModel.recencyWeights).toEqual(newWeights)
    })

    it('应该正确更新Frequency权重', () => {
      const newWeights = { 30: 5, 20: 4, 10: 3, 5: 2, 1: 1 }
      rfmModel.updateFrequencyWeights(newWeights)

      expect(rfmModel.frequencyWeights).toEqual(newWeights)
    })

    it('应该正确更新Monetary权重', () => {
      const newWeights = { 10000: 5, 5000: 4, 2000: 3, 1000: 2, 0: 1 }
      rfmModel.updateMonetaryWeights(newWeights)

      expect(rfmModel.monetaryWeights).toEqual(newWeights)
    })
  })
})
