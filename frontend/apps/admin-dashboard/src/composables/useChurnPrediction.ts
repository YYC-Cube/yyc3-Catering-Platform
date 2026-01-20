/**
 * @fileoverview YYC³餐饮管理系统 - 客户流失预警机制
 * @description 实现客户流失预测和预警功能
 * @module churn-prediction
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export interface ChurnPrediction {
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  churnProbability: number
  riskLevel: 'high' | 'medium' | 'low'
  riskFactors: string[]
  predictedChurnDate: Date
  recommendations: string[]
  assignedTo: string | null
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  lifecycleStage: string
  lastOrderDate: Date | null
  orderCount: number
  totalSpent: number
  satisfactionScore: number
  registeredAt: Date
  recentOrders: any[]
  recentInteractions: any[]
}

class ChurnPredictionModel {
  private readonly HIGH_RISK_THRESHOLD = 0.7
  private readonly MEDIUM_RISK_THRESHOLD = 0.4
  private readonly INACTIVE_DAYS_THRESHOLD = 30
  private readonly FREQUENCY_DROP_THRESHOLD = 0.5
  private readonly SPENDING_DROP_THRESHOLD = 0.5
  private readonly SATISFACTION_THRESHOLD = 3.5

  predictChurn(customer: Customer): ChurnPrediction {
    const riskFactors: string[] = []
    let churnProbability = 0

    const daysSinceLastOrder = this.getDaysSince(customer.lastOrderDate)
    const frequencyDrop = this.calculateFrequencyDrop(customer)
    const spendingDrop = this.calculateSpendingDrop(customer)

    if (this.isInactive(customer, 30)) {
      churnProbability += 0.2
      riskFactors.push('30天未消费')
    }

    if (this.isInactive(customer, 60)) {
      churnProbability += 0.3
      riskFactors.push('60天未消费')
    }

    if (frequencyDrop <= -this.FREQUENCY_DROP_THRESHOLD) {
      churnProbability += 0.25
      riskFactors.push(`消费频次下降${Math.abs(frequencyDrop * 100).toFixed(0)}%`)
    }

    if (spendingDrop <= -this.SPENDING_DROP_THRESHOLD) {
      churnProbability += 0.15
      riskFactors.push(`消费金额下降${Math.abs(spendingDrop * 100).toFixed(0)}%`)
    }

    if (customer.satisfactionScore < this.SATISFACTION_THRESHOLD) {
      churnProbability += 0.1
      riskFactors.push(`满意度评分${customer.satisfactionScore}分`)
    }

    if (customer.lifecycleStage === 'dormant') {
      churnProbability += 0.15
      riskFactors.push('处于休眠状态')
    }

    churnProbability = Math.min(churnProbability, 1.0)

    const riskLevel = this.getRiskLevel(churnProbability)
    const predictedChurnDate = this.predictChurnDate(churnProbability)
    const recommendations = this.generateRecommendations(riskFactors)

    return {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      churnProbability: Math.round(churnProbability * 100) / 100,
      riskLevel,
      riskFactors,
      predictedChurnDate,
      recommendations,
      assignedTo: null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  batchPredict(customers: Customer[]): ChurnPrediction[] {
    return customers.map(customer => this.predictChurn(customer))
  }

  private isInactive(customer: Customer, days: number): boolean {
    if (!customer.lastOrderDate) return true
    const daysSinceLastOrder = this.getDaysSince(customer.lastOrderDate)
    return daysSinceLastOrder > days
  }

  private getDaysSince(date: Date | null): number {
    if (!date) return Infinity
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  }

  private calculateFrequencyDrop(customer: Customer): number {
    const currentFrequency = this.calculateMonthlyFrequency(customer, 30)
    const previousFrequency = this.calculateMonthlyFrequency(customer, 90)

    if (previousFrequency === 0) return 0

    return (currentFrequency - previousFrequency) / previousFrequency
  }

  private calculateSpendingDrop(customer: Customer): number {
    const currentSpending = this.calculateMonthlySpending(customer, 30)
    const previousSpending = this.calculateMonthlySpending(customer, 90)

    if (previousSpending === 0) return 0

    return (currentSpending - previousSpending) / previousSpending
  }

  private calculateMonthlyFrequency(customer: Customer, days: number): number {
    if (days <= 0) return 0

    const recentOrders = customer.recentOrders?.filter(order => {
      const orderDate = new Date(order.createdAt)
      const daysSinceOrder = this.getDaysSince(orderDate)
      return daysSinceOrder <= days
    }) || []

    return (recentOrders.length / days) * 30
  }

  private calculateMonthlySpending(customer: Customer, days: number): number {
    if (days <= 0) return 0

    const recentOrders = customer.recentOrders?.filter(order => {
      const orderDate = new Date(order.createdAt)
      const daysSinceOrder = this.getDaysSince(orderDate)
      return daysSinceOrder <= days
    }) || []

    const totalSpent = recentOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
    return (totalSpent / days) * 30
  }

  private getRiskLevel(probability: number): 'high' | 'medium' | 'low' {
    if (probability >= this.HIGH_RISK_THRESHOLD) return 'high'
    if (probability >= this.MEDIUM_RISK_THRESHOLD) return 'medium'
    return 'low'
  }

  private predictChurnDate(probability: number): Date {
    const daysToChurn = Math.floor(90 * (1 - probability))
    return new Date(Date.now() + daysToChurn * 24 * 60 * 60 * 1000)
  }

  private generateRecommendations(riskFactors: string[]): string[] {
    const recommendations: string[] = []

    if (riskFactors.some(f => f.includes('30天未消费') || f.includes('60天未消费'))) {
      recommendations.push('发送唤醒优惠券')
      recommendations.push('安排客服回访')
      recommendations.push('个性化推荐优惠活动')
    }

    if (riskFactors.some(f => f.includes('消费频次下降'))) {
      recommendations.push('了解消费下降原因')
      recommendations.push('提供专属优惠')
      recommendations.push('推荐热门商品')
    }

    if (riskFactors.some(f => f.includes('消费金额下降'))) {
      recommendations.push('了解消费下降原因')
      recommendations.push('提供套餐优惠')
      recommendations.push('推荐高价值商品')
    }

    if (riskFactors.some(f => f.includes('满意度'))) {
      recommendations.push('安排满意度调研')
      recommendations.push('改进服务质量')
      recommendations.push('提供补偿方案')
    }

    if (riskFactors.some(f => f.includes('休眠状态'))) {
      recommendations.push('发送专属唤醒优惠')
      recommendations.push('VIP客服对接')
      recommendations.push('定制化服务方案')
    }

    if (recommendations.length === 0) {
      recommendations.push('定期跟进客户')
      recommendations.push('保持客户互动')
      recommendations.push('提升服务质量')
    }

    return recommendations
  }

  getChurnStatistics(predictions: ChurnPrediction[]): any {
    const total = predictions.length
    const highRisk = predictions.filter(p => p.riskLevel === 'high').length
    const mediumRisk = predictions.filter(p => p.riskLevel === 'medium').length
    const lowRisk = predictions.filter(p => p.riskLevel === 'low').length

    const avgChurnProbability = predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.churnProbability, 0) / predictions.length
      : 0

    const riskFactorCounts: Record<string, number> = {}
    predictions.forEach(p => {
      p.riskFactors.forEach(factor => {
        if (!riskFactorCounts[factor]) {
          riskFactorCounts[factor] = 0
        }
        riskFactorCounts[factor]++
      })
    })

    const topRiskFactors = Object.entries(riskFactorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor, count]) => ({
        factor,
        count,
        percentage: Math.round((count / total) * 100)
      }))

    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      highRiskPercentage: Math.round((highRisk / total) * 100),
      mediumRiskPercentage: Math.round((mediumRisk / total) * 100),
      lowRiskPercentage: Math.round((lowRisk / total) * 100),
      avgChurnProbability: Math.round(avgChurnProbability * 100) / 100,
      topRiskFactors
    }
  }

  getTrendAnalysis(predictions: ChurnPrediction[]): any {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const currentWeek = predictions.filter(p => p.createdAt >= oneWeekAgo)
    const previousWeek = predictions.filter(p => p.createdAt >= twoWeeksAgo && p.createdAt < oneWeekAgo)
    const currentMonth = predictions.filter(p => p.createdAt >= oneMonthAgo)

    const currentWeekHighRisk = currentWeek.filter(p => p.riskLevel === 'high').length
    const previousWeekHighRisk = previousWeek.filter(p => p.riskLevel === 'high').length

    const weekTrend = previousWeekHighRisk > 0
      ? ((currentWeekHighRisk - previousWeekHighRisk) / previousWeekHighRisk) * 100
      : 0

    return {
      currentWeekCount: currentWeek.length,
      previousWeekCount: previousWeek.length,
      currentMonthCount: currentMonth.length,
      currentWeekHighRisk,
      previousWeekHighRisk,
      weekTrend: Math.round(weekTrend * 10) / 10,
      avgChurnProbability: {
        currentWeek: this.calculateAvgProbability(currentWeek),
        previousWeek: this.calculateAvgProbability(previousWeek),
        currentMonth: this.calculateAvgProbability(currentMonth)
      }
    }
  }

  private calculateAvgProbability(predictions: ChurnPrediction[]): number {
    if (predictions.length === 0) return 0
    return predictions.reduce((sum, p) => sum + p.churnProbability, 0) / predictions.length
  }
}

const churnPredictionModel = new ChurnPredictionModel()

export function useChurnPrediction() {
  const loading = ref(false)
  const churnPredictions = ref<ChurnPrediction[]>([])
  const churnStatistics = ref<any>(null)
  const trendAnalysis = ref<any>(null)

  const predictCustomerChurn = (customer: Customer): ChurnPrediction => {
    try {
      const prediction = churnPredictionModel.predictChurn(customer)
      return prediction
    } catch (error) {
      console.error('Predict churn failed:', error)
      ElMessage.error('预测客户流失失败')
      throw error
    }
  }

  const batchPredictChurn = async (customers: Customer[]) => {
    loading.value = true
    try {
      const predictions = churnPredictionModel.batchPredict(customers)
      churnPredictions.value = predictions
      churnStatistics.value = churnPredictionModel.getChurnStatistics(predictions)
      trendAnalysis.value = churnPredictionModel.getTrendAnalysis(predictions)
      return predictions
    } catch (error) {
      console.error('Batch predict churn failed:', error)
      ElMessage.error('批量预测流失失败')
      return []
    } finally {
      loading.value = false
    }
  }

  const assignAlert = (alertId: string, assignedTo: string): void => {
    const alert = churnPredictions.value.find(p => p.customerId === alertId)
    if (alert) {
      alert.assignedTo = assignedTo
      alert.status = 'in_progress'
      alert.updatedAt = new Date()
      ElMessage.success('预警已分配')
    }
  }

  const resolveAlert = (alertId: string, resolutionNotes: string): void => {
    const alert = churnPredictions.value.find(p => p.customerId === alertId)
    if (alert) {
      alert.status = 'resolved'
      alert.updatedAt = new Date()
      ElMessage.success('预警已解决')
    }
  }

  const closeAlert = (alertId: string): void => {
    const alert = churnPredictions.value.find(p => p.customerId === alertId)
    if (alert) {
      alert.status = 'closed'
      alert.updatedAt = new Date()
      ElMessage.success('预警已关闭')
    }
  }

  const getHighRiskAlerts = (): ChurnPrediction[] => {
    return churnPredictions.value.filter(p => p.riskLevel === 'high' && p.status === 'pending')
  }

  const getMediumRiskAlerts = (): ChurnPrediction[] => {
    return churnPredictions.value.filter(p => p.riskLevel === 'medium' && p.status === 'pending')
  }

  const getLowRiskAlerts = (): ChurnPrediction[] => {
    return churnPredictions.value.filter(p => p.riskLevel === 'low' && p.status === 'pending')
  }

  const getAlertsByStatus = (status: string): ChurnPrediction[] => {
    return churnPredictions.value.filter(p => p.status === status)
  }

  const getRiskLevelColor = (riskLevel: string): string => {
    const colors: Record<string, string> = {
      high: '#F56C6C',
      medium: '#E6A23C',
      low: '#E6A23C'
    }
    return colors[riskLevel] || '#909399'
  }

  const getRiskLevelLabel = (riskLevel: string): string => {
    const labels: Record<string, string> = {
      high: '高危',
      medium: '中危',
      low: '低危'
    }
    return labels[riskLevel] || '未知'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#F56C6C',
      in_progress: '#E6A23C',
      resolved: '#67C23A',
      closed: '#909399'
    }
    return colors[status] || '#909399'
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: '待处理',
      in_progress: '处理中',
      resolved: '已解决',
      closed: '已关闭'
    }
    return labels[status] || '未知'
  }

  const getUrgency = (prediction: ChurnPrediction): string => {
    const daysUntilChurn = Math.floor(
      (prediction.predictedChurnDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilChurn <= 7) return '紧急'
    if (daysUntilChurn <= 14) return '高'
    if (daysUntilChurn <= 30) return '中'
    return '低'
  }

  const getUrgencyColor = (urgency: string): string => {
    const colors: Record<string, string> = {
      紧急: '#F56C6C',
      高: '#E6A23C',
      中: '#409EFF',
      低: '#67C23A'
    }
    return colors[urgency] || '#909399'
  }

  return {
    loading,
    churnPredictions,
    churnStatistics,
    trendAnalysis,
    predictCustomerChurn,
    batchPredictChurn,
    assignAlert,
    resolveAlert,
    closeAlert,
    getHighRiskAlerts,
    getMediumRiskAlerts,
    getLowRiskAlerts,
    getAlertsByStatus,
    getRiskLevelColor,
    getRiskLevelLabel,
    getStatusColor,
    getStatusLabel,
    getUrgency,
    getUrgencyColor
  }
}
