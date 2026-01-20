/**
 * @fileoverview YYC³餐饮管理系统 - 客户价值评估模型（RFM）
 * @description 实现RFM客户价值评估模型
 * @module rfm-model
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export interface RFMScore {
  recencyScore: number
  frequencyScore: number
  monetaryScore: number
  totalScore: number
  customerLevel: string
  levelLabel: string
  levelColor: string
}

export interface CustomerRFMData {
  customerId: string
  customerName: string
  lastOrderDate: Date | null
  orderCount: number
  totalSpent: number
  averageOrderValue: number
  registeredAt: Date
}

export interface RFMAnalysisResult {
  customerId: string
  customerName: string
  rfmScore: RFMScore
  segment: string
  segmentLabel: string
  recommendations: string[]
}

class RFMModel {
  private readonly RECENCY_WEIGHT = 0.3
  private readonly FREQUENCY_WEIGHT = 0.4
  private readonly MONETARY_WEIGHT = 0.3

  calculateRFMScore(customer: CustomerRFMData): RFMScore {
    const recencyScore = this.calculateRecencyScore(customer.lastOrderDate)
    const frequencyScore = this.calculateFrequencyScore(customer.orderCount, customer.registeredAt)
    const monetaryScore = this.calculateMonetaryScore(customer.totalSpent, customer.registeredAt)

    const totalScore =
      recencyScore * this.RECENCY_WEIGHT +
      frequencyScore * this.FREQUENCY_WEIGHT +
      monetaryScore * this.MONETARY_WEIGHT

    const customerLevel = this.getCustomerLevel(totalScore)

    return {
      recencyScore,
      frequencyScore,
      monetaryScore,
      totalScore: Math.round(totalScore * 10) / 10,
      customerLevel: customerLevel.level,
      levelLabel: customerLevel.label,
      levelColor: customerLevel.color
    }
  }

  private calculateRecencyScore(lastOrderDate: Date | null): number {
    if (!lastOrderDate) return 1

    const daysSinceLastOrder = Math.floor(
      (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastOrder <= 7) return 5
    if (daysSinceLastOrder <= 14) return 4
    if (daysSinceLastOrder <= 30) return 3
    if (daysSinceLastOrder <= 60) return 2
    return 1
  }

  private calculateFrequencyScore(orderCount: number, registeredAt: Date): number {
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(registeredAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    const monthsSinceRegistration = Math.max(1, daysSinceRegistration / 30)
    const monthlyOrders = orderCount / monthsSinceRegistration

    if (monthlyOrders >= 8) return 5
    if (monthlyOrders >= 5) return 4
    if (monthlyOrders >= 3) return 3
    if (monthlyOrders >= 1) return 2
    return 1
  }

  private calculateMonetaryScore(totalSpent: number, registeredAt: Date): number {
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(registeredAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    const monthsSinceRegistration = Math.max(1, daysSinceRegistration / 30)
    const monthlySpent = totalSpent / monthsSinceRegistration

    if (monthlySpent >= 1000) return 5
    if (monthlySpent >= 500) return 4
    if (monthlySpent >= 300) return 3
    if (monthlySpent >= 100) return 2
    return 1
  }

  private getCustomerLevel(totalScore: number): { level: string; label: string; color: string } {
    if (totalScore >= 4.5) {
      return { level: 'super_vip', label: '超级VIP', color: '#F56C6C' }
    }
    if (totalScore >= 3.5) {
      return { level: 'vip', label: 'VIP', color: '#E6A23C' }
    }
    if (totalScore >= 2.5) {
      return { level: 'member', label: '会员', color: '#409EFF' }
    }
    if (totalScore >= 1.5) {
      return { level: 'regular', label: '普通', color: '#67C23A' }
    }
    return { level: 'low_value', label: '低价值', color: '#909399' }
  }

  analyzeCustomer(customer: CustomerRFMData): RFMAnalysisResult {
    const rfmScore = this.calculateRFMScore(customer)
    const segment = this.getCustomerSegment(rfmScore)
    const recommendations = this.generateRecommendations(rfmScore, segment)

    return {
      customerId: customer.customerId,
      customerName: customer.customerName,
      rfmScore,
      segment,
      segmentLabel: this.getSegmentLabel(segment),
      recommendations
    }
  }

  private getCustomerSegment(rfmScore: RFMScore): string {
    if (rfmScore.customerLevel === 'super_vip' || rfmScore.customerLevel === 'vip') {
      if (rfmScore.recencyScore >= 4 && rfmScore.frequencyScore >= 4) {
        return 'high_value_loyal'
      }
      return 'high_value'
    }

    if (rfmScore.recencyScore >= 4 && rfmScore.frequencyScore >= 4) {
      return 'frequent'
    }

    if (rfmScore.recencyScore >= 4) {
      return 'new_active'
    }

    if (rfmScore.frequencyScore >= 4) {
      return 'loyal'
    }

    if (rfmScore.recencyScore <= 2 && rfmScore.frequencyScore <= 2) {
      return 'at_risk'
    }

    if (rfmScore.recencyScore <= 2) {
      return 'dormant'
    }

    return 'regular'
  }

  private getSegmentLabel(segment: string): string {
    const labels: Record<string, string> = {
      high_value_loyal: '高价值忠诚客户',
      high_value: '高价值客户',
      frequent: '高频客户',
      new_active: '新活跃客户',
      loyal: '忠诚客户',
      at_risk: '流失风险客户',
      dormant: '休眠客户',
      regular: '普通客户'
    }
    return labels[segment] || '未知'
  }

  private generateRecommendations(rfmScore: RFMScore, segment: string): string[] {
    const recommendations: string[] = []

    if (segment === 'high_value_loyal') {
      recommendations.push('提供VIP专属服务')
      recommendations.push('邀请参与新品体验')
      recommendations.push('发放专属优惠券')
    } else if (segment === 'high_value') {
      recommendations.push('提升消费频次')
      recommendations.push('推荐高价值商品')
      recommendations.push('提供会员升级')
    } else if (segment === 'frequent') {
      recommendations.push('提升客单价')
      recommendations.push('推荐套餐组合')
      recommendations.push('发放积分奖励')
    } else if (segment === 'new_active') {
      recommendations.push('引导二次消费')
      recommendations.push('介绍会员权益')
      recommendations.push('发放新客优惠券')
    } else if (segment === 'loyal') {
      recommendations.push('保持服务质量')
      recommendations.push('定期关怀')
      recommendations.push('发放忠诚奖励')
    } else if (segment === 'at_risk') {
      recommendations.push('立即联系客户')
      recommendations.push('了解流失原因')
      recommendations.push('提供挽留优惠')
    } else if (segment === 'dormant') {
      recommendations.push('发送唤醒优惠券')
      recommendations.push('个性化推荐')
      recommendations.push('安排客服回访')
    } else {
      recommendations.push('提升消费频次')
      recommendations.push('增加客户互动')
      recommendations.push('优化产品推荐')
    }

    return recommendations
  }

  batchCalculate(customers: CustomerRFMData[]): RFMAnalysisResult[] {
    return customers.map(customer => this.analyzeCustomer(customer))
  }

  getSegmentStatistics(results: RFMAnalysisResult[]): any {
    const segmentCounts: Record<string, number> = {}
    const segmentScores: Record<string, number[]> = {}

    results.forEach(result => {
      if (!segmentCounts[result.segment]) {
        segmentCounts[result.segment] = 0
        segmentScores[result.segment] = []
      }
      segmentCounts[result.segment]++
      segmentScores[result.segment].push(result.rfmScore.totalScore)
    })

    const total = results.length
    const statistics = Object.keys(segmentCounts).map(segment => {
      const scores = segmentScores[segment]
      const avgScore = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0

      return {
        segment,
        segmentLabel: this.getSegmentLabel(segment),
        count: segmentCounts[segment],
        percentage: Math.round((segmentCounts[segment] / total) * 100),
        avgRFMScore: Math.round(avgScore * 10) / 10
      }
    })

    return statistics.sort((a, b) => b.count - a.count)
  }
}

const rfmModel = new RFMModel()

export function useRFMModel() {
  const loading = ref(false)
  const currentRFMScore = ref<RFMScore | null>(null)
  const analysisResults = ref<RFMAnalysisResult[]>([])
  const segmentStatistics = ref<any[]>([])

  const calculateCustomerRFM = (customer: CustomerRFMData): RFMScore => {
    try {
      const score = rfmModel.calculateRFMScore(customer)
      currentRFMScore.value = score
      return score
    } catch (error) {
      console.error('Calculate RFM score failed:', error)
      ElMessage.error('计算RFM评分失败')
      throw error
    }
  }

  const analyzeCustomer = (customer: CustomerRFMData): RFMAnalysisResult => {
    try {
      const result = rfmModel.analyzeCustomer(customer)
      return result
    } catch (error) {
      console.error('Analyze customer failed:', error)
      ElMessage.error('分析客户失败')
      throw error
    }
  }

  const batchAnalyze = async (customers: CustomerRFMData[]) => {
    loading.value = true
    try {
      const results = rfmModel.batchCalculate(customers)
      analysisResults.value = results
      segmentStatistics.value = rfmModel.getSegmentStatistics(results)
      return results
    } catch (error) {
      console.error('Batch analyze failed:', error)
      ElMessage.error('批量分析失败')
      return []
    } finally {
      loading.value = false
    }
  }

  const getRecencyLabel = (score: number): string => {
    const labels = ['>60天', '31-60天', '15-30天', '8-14天', '0-7天']
    return labels[score - 1] || '未知'
  }

  const getFrequencyLabel = (score: number): string => {
    const labels = ['0次/月', '1-2次/月', '3-4次/月', '5-7次/月', '≥8次/月']
    return labels[score - 1] || '未知'
  }

  const getMonetaryLabel = (score: number): string => {
    const labels = ['<100元/月', '100-299元/月', '300-499元/月', '500-999元/月', '≥1000元/月']
    return labels[score - 1] || '未知'
  }

  const getScoreColor = (score: number): string => {
    if (score >= 4.5) return '#F56C6C'
    if (score >= 3.5) return '#E6A23C'
    if (score >= 2.5) return '#409EFF'
    if (score >= 1.5) return '#67C23A'
    return '#909399'
  }

  const getLevelIcon = (level: string): string => {
    const icons: Record<string, string> = {
      super_vip: 'Crown',
      vip: 'Star',
      member: 'User',
      regular: 'UserFilled',
      low_value: 'User'
    }
    return icons[level] || 'User'
  }

  return {
    loading,
    currentRFMScore,
    analysisResults,
    segmentStatistics,
    calculateCustomerRFM,
    analyzeCustomer,
    batchAnalyze,
    getRecencyLabel,
    getFrequencyLabel,
    getMonetaryLabel,
    getScoreColor,
    getLevelIcon
  }
}
