/**
 * @file 智能表单系统核心服务
 * @description 实现动态表单配置、智能字段识别和表单数据管理功能
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 */

import { ref, reactive, computed } from 'vue'

// 创建模拟API服务
const mockApi = {
  form: {
    getFormConfigs: async () => {
      // 模拟表单配置数据
      return {
        data: [
          {
            id: 'form_001',
            name: 'customer_feedback',
            title: '顾客反馈表单',
            description: '收集顾客对餐厅服务的反馈',
            fields: [
              {
                id: 'field_001',
                name: 'customer_name',
                label: '顾客姓名',
                type: 'text',
                required: true,
                placeholder: '请输入您的姓名',
                order: 1
              },
              {
                id: 'field_002',
                name: 'contact_number',
                label: '联系方式',
                type: 'text',
                required: false,
                placeholder: '请输入您的电话或微信',
                order: 2
              },
              {
                id: 'field_003',
                name: 'feedback_type',
                label: '反馈类型',
                type: 'select',
                required: true,
                options: [
                  { value: 'praise', label: '表扬' },
                  { value: 'suggestion', label: '建议' },
                  { value: 'complaint', label: '投诉' },
                  { value: 'other', label: '其他' }
                ],
                order: 3
              },
              {
                id: 'field_004',
                name: 'feedback_content',
                label: '反馈内容',
                type: 'textarea',
                required: true,
                placeholder: '请详细描述您的反馈...',
                order: 4
              },
              {
                id: 'field_005',
                name: 'satisfaction',
                label: '满意度评分',
                type: 'radio',
                required: true,
                options: [
                  { value: '5', label: '非常满意' },
                  { value: '4', label: '满意' },
                  { value: '3', label: '一般' },
                  { value: '2', label: '不满意' },
                  { value: '1', label: '非常不满意' }
                ],
                order: 5
              }
            ],
            createdAt: new Date('2024-10-01'),
            updatedAt: new Date('2024-10-10'),
            createdBy: 'system'
          }
        ]
      }
    },
    getFormSubmissions: async () => {
      // 模拟表单提交数据
      return {
        data: [
          {
            id: 'submission_001',
            formId: 'form_001',
            data: {
              customer_name: '张三',
              contact_number: '13800138000',
              feedback_type: 'praise',
              feedback_content: '服务非常好，菜品也很美味！',
              satisfaction: '5'
            },
            submitterId: 'user_001',
            submitTime: new Date('2024-10-12'),
            status: 'approved'
          },
          {
            id: 'submission_002',
            formId: 'form_001',
            data: {
              customer_name: '李四',
              contact_number: '13900139000',
              feedback_type: 'suggestion',
              feedback_content: '希望能增加更多素食选项',
              satisfaction: '4'
            },
            submitterId: 'user_002',
            submitTime: new Date('2024-10-13'),
            status: 'approved'
          }
        ]
      }
    },
    createFormConfig: async (config) => {
      // 模拟创建表单配置
      return {
        data: {
          ...config,
          id: `form_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    },
    updateFormConfig: async (id, config) => {
      // 模拟更新表单配置
      return {
        data: {
          id,
          ...config,
          updatedAt: new Date()
        }
      }
    },
    deleteFormConfig: async () => {
      // 模拟删除表单配置
      return { success: true }
    },
    submitFormData: async (submission) => {
      // 模拟提交表单数据
      return {
        data: {
          ...submission,
          id: `submission_${Date.now()}`,
          submitTime: new Date()
        }
      }
    }
  }
}

// 定义类型
interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'datetime' | 'textarea' | 'file' | 'image'
  required: boolean
  defaultValue?: any
  placeholder?: string
  options?: { value: any; label: string }[]
  validationRules?: any[]
  dependentFields?: string[]
  visibleCondition?: string
  width?: number
  order: number
}

interface FormConfig {
  id: string
  name: string
  title: string
  description?: string
  fields: FormField[]
  layout?: string
  theme?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  submitterId?: string
  submitTime: Date
  status: 'pending' | 'approved' | 'rejected' | 'draft'
}

interface SmartSuggestion {
  fieldId: string
  suggestions: string[]
  confidence: number
}

// 智能表单系统服务
class IntelligentFormService {
  // 状态管理
  private formConfigs = ref<FormConfig[]>([])
  private formSubmissions = ref<FormSubmission[]>([])
  private smartSuggestions = reactive<Record<string, SmartSuggestion>>({})

  /**
   * 初始化智能表单系统
   */
  async initialize() {
    try {
      // 加载表单配置
      await this.loadFormConfigs()
      // 加载表单提交数据
      await this.loadFormSubmissions()
    } catch (error) {
      console.error('智能表单系统初始化失败:', error)
    }
  }

  /**
   * 加载表单配置
   */
  private async loadFormConfigs() {
    try {
      const response = await mockApi.form.getFormConfigs()
      this.formConfigs.value = response.data
    } catch (error) {
      console.error('加载表单配置失败:', error)
    }
  }

  /**
   * 加载表单提交数据
   */
  private async loadFormSubmissions() {
    try {
      const response = await mockApi.form.getFormSubmissions()
      this.formSubmissions.value = response.data
    } catch (error) {
      console.error('加载表单提交数据失败:', error)
    }
  }

  /**
   * 创建表单配置
   */
  async createFormConfig(config: Omit<FormConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormConfig | null> {
    try {
      const response = await mockApi.form.createFormConfig(config)
      const newConfig = response.data
      this.formConfigs.value.push(newConfig)
      return newConfig
    } catch (error) {
      console.error('创建表单配置失败:', error)
      return null
    }
  }

  /**
   * 更新表单配置
   */
  async updateFormConfig(id: string, config: Partial<FormConfig>): Promise<FormConfig | null> {
    try {
      const response = await mockApi.form.updateFormConfig(id, config)
      const updatedConfig = response.data
      const index = this.formConfigs.value.findIndex(c => c.id === id)
      if (index !== -1) {
        this.formConfigs.value[index] = updatedConfig
      }
      return updatedConfig
    } catch (error) {
      console.error('更新表单配置失败:', error)
      return null
    }
  }

  /**
   * 删除表单配置
   */
  async deleteFormConfig(id: string): Promise<boolean> {
    try {
      await mockApi.form.deleteFormConfig(id)
      this.formConfigs.value = this.formConfigs.value.filter(c => c.id !== id)
      // 删除相关的表单提交数据
      this.formSubmissions.value = this.formSubmissions.value.filter(s => s.formId !== id)
      return true
    } catch (error) {
      console.error('删除表单配置失败:', error)
      return false
    }
  }

  /**
   * 提交表单数据
   */
  async submitFormData(formId: string, data: Record<string, any>, submitterId?: string): Promise<FormSubmission | null> {
    try {
      // 验证表单数据
      const isValid = await this.validateFormData(formId, data)
      if (!isValid) {
        throw new Error('表单数据验证失败')
      }
      
      const submission: Omit<FormSubmission, 'id' | 'submitTime'> = {
        formId,
        data,
        submitterId,
        status: 'pending'
      }
      
      const response = await mockApi.form.submitFormData(submission)
      const newSubmission = response.data
      this.formSubmissions.value.push(newSubmission)
      return newSubmission
    } catch (error) {
      console.error('提交表单数据失败:', error)
      return null
    }
  }

  /**
   * 验证表单数据
   */
  async validateFormData(formId: string, data: Record<string, any>): Promise<boolean> {
    try {
      const formConfig = this.formConfigs.value.find(c => c.id === formId)
      if (!formConfig) return false
      
      // 检查必填字段
      const requiredFields = formConfig.fields.filter(field => field.required)
      for (const field of requiredFields) {
        if (!data[field.name] && data[field.name] !== 0 && data[field.name] !== false) {
          console.error(`必填字段 ${field.label} 不能为空`)
          return false
        }
      }
      
      // 检查字段类型
      for (const field of formConfig.fields) {
        if (data[field.name] !== undefined) {
          const value = data[field.name]
          switch (field.type) {
            case 'number':
              if (typeof value !== 'number' && isNaN(Number(value))) {
                console.error(`字段 ${field.label} 必须是数字`)
                return false
              }
              break
            case 'date':
            case 'time':
            case 'datetime':
              if (!(value instanceof Date) && isNaN(Date.parse(value))) {
                console.error(`字段 ${field.label} 必须是有效的日期/时间`)
                return false
              }
              break
            case 'checkbox':
              if (!Array.isArray(value)) {
                console.error(`字段 ${field.label} 必须是数组`)
                return false
              }
              break
          }
        }
      }
      
      // 执行自定义验证规则
      for (const field of formConfig.fields) {
        if (field.validationRules && field.validationRules.length > 0 && data[field.name] !== undefined) {
          for (const rule of field.validationRules) {
            if (typeof rule === 'function' && !rule(data[field.name])) {
              console.error(`字段 ${field.label} 验证失败`)
              return false
            }
          }
        }
      }
      
      return true
    } catch (error) {
      console.error('验证表单数据失败:', error)
      return false
    }
  }

  /**
   * 获取智能建议
   */
  async getSmartSuggestions(formId: string, fieldId: string, input: string): Promise<string[]> {
    try {
      // 模拟智能建议API调用
      // 实际实现中，这里应该调用NLP服务获取智能建议
      const formConfig = this.formConfigs.value.find(c => c.id === formId)
      if (!formConfig) return []
      
      const field = formConfig.fields.find(f => f.id === fieldId)
      if (!field) return []
      
      // 基于历史提交数据生成智能建议
      const historicalValues = this.formSubmissions.value
        .filter(s => s.formId === formId && s.data[field.name])
        .map(s => s.data[field.name])
        .filter((value, index, self) => self.indexOf(value) === index) // 去重
        .filter(value => value.toString().toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5)
      
      return historicalValues
    } catch (error) {
      console.error('获取智能建议失败:', error)
      return []
    }
  }

  /**
   * 分析表单数据
   */
  async analyzeFormData(formId: string): Promise<any> {
    try {
      const formConfig = this.formConfigs.value.find(c => c.id === formId)
      if (!formConfig) return {}
      
      const formSubmissions = this.formSubmissions.value.filter(s => s.formId === formId)
      const totalSubmissions = formSubmissions.length
      
      // 计算字段填充率
      const fieldFillRates = formConfig.fields.map(field => {
        const filledCount = formSubmissions.filter(s => s.data[field.name] !== undefined && s.data[field.name] !== '').length
        const fillRate = totalSubmissions > 0 ? (filledCount / totalSubmissions) * 100 : 0
        return {
          fieldId: field.id,
          fieldName: field.name,
          fieldLabel: field.label,
          fillRate: Math.round(fillRate * 100) / 100, // 保留两位小数
          filledCount,
          totalCount: totalSubmissions
        }
      })
      
      // 计算字段值分布
      const fieldValueDistributions: Record<string, any> = {}
      formConfig.fields.forEach(field => {
        const valueCounts: Record<string, number> = {}
        formSubmissions.forEach(submission => {
          const value = submission.data[field.name]
          if (value !== undefined && value !== '') {
            const key = JSON.stringify(value)
            valueCounts[key] = (valueCounts[key] || 0) + 1
          }
        })
        
        const distribution = Object.entries(valueCounts)
          .map(([value, count]) => ({ value: JSON.parse(value), count, percentage: Math.round((count / totalSubmissions) * 10000) / 100 }))
          .sort((a, b) => b.count - a.count)
        
        fieldValueDistributions[field.id] = distribution
      })
      
      // 计算表单提交趋势
      const submissionTrend = formSubmissions
        .map(submission => ({
          date: new Date(submission.submitTime).toISOString().split('T')[0],
          count: 1
        }))
        .reduce((acc, curr) => {
          acc[curr.date] = (acc[curr.date] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      
      return {
        formId,
        formName: formConfig.name,
        totalSubmissions,
        fieldFillRates,
        fieldValueDistributions,
        submissionTrend,
        averageSubmissionTime: this.calculateAverageSubmissionTime(formId)
      }
    } catch (error) {
      console.error('分析表单数据失败:', error)
      return {}
    }
  }

  /**
   * 计算平均提交时间
   */
  private calculateAverageSubmissionTime(formId: string): number {
    // 模拟计算平均提交时间
    // 实际实现中，这里应该基于表单字段数量和复杂程度估算
    const formConfig = this.formConfigs.value.find(c => c.id === formId)
    if (!formConfig) return 0
    
    // 简单估算：每个字段平均需要5秒完成
    return formConfig.fields.length * 5
  }

  /**
   * 获取菜品列表（用于表单与菜单系统集成）
   * @returns 菜品列表
   */
  async getMenuItems(): Promise<any[]> {
    // 实际项目中应该调用后端API
    return new Promise((resolve) => {
      setTimeout(() => {
        const menuItems = [
          { id: 1, name: '宫保鸡丁', category: '川菜', price: 28.00 },
          { id: 2, name: '麻婆豆腐', category: '川菜', price: 18.00 },
          { id: 3, name: '糖醋排骨', category: '沪菜', price: 38.00 },
          { id: 4, name: '西湖牛肉羹', category: '浙菜', price: 22.00 },
          { id: 5, name: '北京烤鸭', category: '京菜', price: 168.00 }
        ];
        resolve(menuItems);
      }, 500);
    });
  }

  /**
   * 获取表单配置
   */
  getFormConfig(id: string): FormConfig | undefined {
    return this.formConfigs.value.find(c => c.id === id)
  }

  /**
   * 获取所有表单配置
   */
  getFormConfigs(): FormConfig[] {
    return this.formConfigs.value
  }

  /**
   * 获取表单提交数据
   */
  getFormSubmissions(formId: string): FormSubmission[] {
    return this.formSubmissions.value.filter(s => s.formId === formId)
  }

  /**
   * 获取所有表单提交数据
   */
  getAllFormSubmissions(): FormSubmission[] {
    return this.formSubmissions.value
  }
}

// 导出单例实例
export const intelligentFormService = new IntelligentFormService()
