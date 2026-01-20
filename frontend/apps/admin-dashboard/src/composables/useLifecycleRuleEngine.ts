/**
 * @fileoverview YYC³餐饮管理系统 - 客户生命周期规则引擎
 * @description 实现客户生命周期自动流转规则引擎
 * @module lifecycle-rule-engine
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export interface LifecycleRule {
  id: string
  name: string
  description: string
  fromStage: string[]
  toStage: string
  conditions: RuleCondition[]
  priority: number
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RuleCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface RuleResult {
  rule: LifecycleRule
  matched: boolean
  timestamp: Date
}

export interface CustomerEvent {
  type: 'order' | 'register' | 'interaction' | 'satisfaction' | 'custom'
  customerId: string
  data: any
  timestamp: Date
}

export interface Customer {
  id: string
  name: string
  lifecycleStage: string
  lastOrderDate: Date | null
  orderCount: number
  totalSpent: number
  satisfactionScore: number
  registeredAt: Date
  [key: string]: any
}

class LifecycleRuleEngine {
  private rules: LifecycleRule[]
  private eventCallbacks: Map<string, Function[]>

  constructor() {
    this.rules = []
    this.eventCallbacks = new Map()
    this.initializeDefaultRules()
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'RULE_001',
        name: '潜在客户转新客户',
        description: '首次消费后自动转为新客户',
        fromStage: ['potential'],
        toStage: 'new_customer',
        conditions: [
          {
            field: 'event.type',
            operator: 'eq',
            value: 'order'
          },
          {
            field: 'orderCount',
            operator: 'gte',
            value: 1,
            logicalOperator: 'AND'
          }
        ],
        priority: 1,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'RULE_002',
        name: '新客户转活跃客户',
        description: '消费3次且消费7天后转为活跃客户',
        fromStage: ['new_customer'],
        toStage: 'active',
        conditions: [
          {
            field: 'orderCount',
            operator: 'gte',
            value: 3
          },
          {
            field: 'daysSinceFirstOrder',
            operator: 'gte',
            value: 7,
            logicalOperator: 'AND'
          },
          {
            field: 'daysSinceLastOrder',
            operator: 'lte',
            value: 30,
            logicalOperator: 'AND'
          }
        ],
        priority: 2,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'RULE_003',
        name: '活跃客户转忠诚客户',
        description: '消费10次且累计消费2000元后转为忠诚客户',
        fromStage: ['active'],
        toStage: 'loyal',
        conditions: [
          {
            field: 'orderCount',
            operator: 'gte',
            value: 10
          },
          {
            field: 'totalSpent',
            operator: 'gte',
            value: 2000,
            logicalOperator: 'AND'
          },
          {
            field: 'daysSinceLastOrder',
            operator: 'lte',
            value: 90,
            logicalOperator: 'AND'
          },
          {
            field: 'satisfactionScore',
            operator: 'gte',
            value: 4.5,
            logicalOperator: 'AND'
          }
        ],
        priority: 3,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'RULE_004',
        name: '活跃客户转休眠客户',
        description: '超过30天未消费转为休眠客户',
        fromStage: ['active'],
        toStage: 'dormant',
        conditions: [
          {
            field: 'daysSinceLastOrder',
            operator: 'gt',
            value: 30
          }
        ],
        priority: 4,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'RULE_005',
        name: '忠诚客户转休眠客户',
        description: '超过60天未消费转为休眠客户',
        fromStage: ['loyal'],
        toStage: 'dormant',
        conditions: [
          {
            field: 'daysSinceLastOrder',
            operator: 'gt',
            value: 60
          }
        ],
        priority: 5,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'RULE_006',
        name: '休眠客户转流失客户',
        description: '超过90天未消费且唤醒失败3次转为流失客户',
        fromStage: ['dormant'],
        toStage: 'churned',
        conditions: [
          {
            field: 'daysSinceLastOrder',
            operator: 'gt',
            value: 90
          },
          {
            field: 'wakeupAttempts',
            operator: 'gte',
            value: 3,
            logicalOperator: 'AND'
          }
        ],
        priority: 6,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'RULE_007',
        name: '休眠客户转活跃客户',
        description: '休眠客户重新消费后转为活跃客户',
        fromStage: ['dormant'],
        toStage: 'active',
        conditions: [
          {
            field: 'event.type',
            operator: 'eq',
            value: 'order'
          }
        ],
        priority: 7,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'RULE_008',
        name: '流失客户转新客户',
        description: '流失客户重新消费后转为新客户',
        fromStage: ['churned'],
        toStage: 'new_customer',
        conditions: [
          {
            field: 'event.type',
            operator: 'eq',
            value: 'order'
          }
        ],
        priority: 8,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  async evaluate(customer: Customer, event: CustomerEvent): Promise<RuleResult[]> {
    const applicableRules = this.rules.filter(rule =>
      rule.fromStage.includes(customer.lifecycleStage) && rule.enabled
    )

    const results: RuleResult[] = []
    for (const rule of applicableRules) {
      const matched = await this.evaluateConditions(rule.conditions, customer, event)
      if (matched) {
        results.push({
          rule,
          matched: true,
          timestamp: new Date()
        })
      }
    }

    return results.sort((a, b) => b.rule.priority - a.rule.priority)
  }

  private async evaluateConditions(
    conditions: RuleCondition[],
    customer: Customer,
    event: CustomerEvent
  ): Promise<boolean> {
    if (conditions.length === 0) return true

    let result = true
    let currentOperator: 'AND' | 'OR' = 'AND'

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, customer, event)
      currentOperator = condition.logicalOperator || 'AND'

      if (currentOperator === 'AND') {
        result = result && conditionResult
      } else {
        result = result || conditionResult
      }
    }

    return result
  }

  private evaluateCondition(
    condition: RuleCondition,
    customer: Customer,
    event: CustomerEvent
  ): boolean {
    const fieldValue = this.getFieldValue(condition.field, customer, event)

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value
      case 'ne':
        return fieldValue !== condition.value
      case 'gt':
        return fieldValue > condition.value
      case 'lt':
        return fieldValue < condition.value
      case 'gte':
        return fieldValue >= condition.value
      case 'lte':
        return fieldValue <= condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      default:
        return false
    }
  }

  private getFieldValue(field: string, customer: Customer, event: CustomerEvent): any {
    const fieldPath = field.split('.')
    let value: any = { ...customer, event }

    for (const key of fieldPath) {
      value = value?.[key]
    }

    if (field === 'daysSinceLastOrder' && customer.lastOrderDate) {
      return Math.floor(
        (Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    if (field === 'daysSinceFirstOrder' && customer.registeredAt) {
      return Math.floor(
        (Date.now() - new Date(customer.registeredAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    return value
  }

  addRule(rule: LifecycleRule): void {
    this.rules.push(rule)
    this.sortRules()
  }

  updateRule(ruleId: string, updates: Partial<LifecycleRule>): void {
    const index = this.rules.findIndex(r => r.id === ruleId)
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates, updatedAt: new Date() }
      this.sortRules()
    }
  }

  deleteRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId)
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.enabled = true
      rule.updatedAt = new Date()
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.enabled = false
      rule.updatedAt = new Date()
    }
  }

  getRules(): LifecycleRule[] {
    return [...this.rules]
  }

  getRule(ruleId: string): LifecycleRule | undefined {
    return this.rules.find(r => r.id === ruleId)
  }

  private sortRules(): void {
    this.rules.sort((a, b) => b.priority - a.priority)
  }

  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, [])
    }
    this.eventCallbacks.get(event)?.push(callback)
  }

  emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event) || []
    callbacks.forEach(callback => callback(data))
  }
}

const ruleEngine = new LifecycleRuleEngine()

export function useLifecycleRuleEngine() {
  const loading = ref(false)
  const rules = ref<LifecycleRule[]>([])
  const transitionHistory = ref<any[]>([])

  const loadRules = async () => {
    loading.value = true
    try {
      rules.value = ruleEngine.getRules()
    } catch (error) {
      console.error('Load rules failed:', error)
      ElMessage.error('加载规则失败')
    } finally {
      loading.value = false
    }
  }

  const evaluateCustomer = async (customer: Customer, event: CustomerEvent) => {
    loading.value = true
    try {
      const results = await ruleEngine.evaluate(customer, event)
      if (results.length > 0) {
        const topResult = results[0]
        await executeTransition(customer, topResult)
      }
      return results
    } catch (error) {
      console.error('Evaluate customer failed:', error)
      ElMessage.error('评估客户失败')
      return []
    } finally {
      loading.value = false
    }
  }

  const executeTransition = async (customer: Customer, result: RuleResult) => {
    try {
      const transition = {
        customerId: customer.id,
        fromStage: customer.lifecycleStage,
        toStage: result.rule.toStage,
        ruleId: result.rule.id,
        reason: result.rule.description,
        timestamp: result.timestamp
      }

      transitionHistory.value.unshift(transition)
      
      ruleEngine.emit('stageTransition', transition)
      
      ElMessage.success(`客户 ${customer.name} 已从 ${customer.lifecycleStage} 转为 ${result.rule.toStage}`)
    } catch (error) {
      console.error('Execute transition failed:', error)
      ElMessage.error('执行流转失败')
    }
  }

  const addRule = (rule: LifecycleRule) => {
    ruleEngine.addRule(rule)
    loadRules()
    ElMessage.success('规则添加成功')
  }

  const updateRule = (ruleId: string, updates: Partial<LifecycleRule>) => {
    ruleEngine.updateRule(ruleId, updates)
    loadRules()
    ElMessage.success('规则更新成功')
  }

  const deleteRule = (ruleId: string) => {
    ruleEngine.deleteRule(ruleId)
    loadRules()
    ElMessage.success('规则删除成功')
  }

  const toggleRule = (ruleId: string, enabled: boolean) => {
    if (enabled) {
      ruleEngine.enableRule(ruleId)
    } else {
      ruleEngine.disableRule(ruleId)
    }
    loadRules()
  }

  return {
    loading,
    rules,
    transitionHistory,
    loadRules,
    evaluateCustomer,
    addRule,
    updateRule,
    deleteRule,
    toggleRule
  }
}
