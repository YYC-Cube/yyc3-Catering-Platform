/**
 * @file AI服务类
 * @description 处理AI聊天消息的核心服务
 * @module services/AIService
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { ContextManager } from './ContextManager'

// 消息类型定义
export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  status: 'sending' | 'sent' | 'received' | 'error'
  suggestions?: string[]
}

// AI响应类型
export interface AIResponse {
  message: string
  suggestions?: string[]
}

/**
 * AI服务类 - 处理AI聊天消息的核心服务
 */
export class AIService {
  private static instance: AIService
  private contextManager: ContextManager
  private apiEndpoint: string = 'http://localhost:3100/api/ai/chat'

  /**
   * 私有构造函数 - 实现单例模式
   */
  private constructor() {
    this.contextManager = ContextManager.getInstance()
  }

  /**
   * 获取单例实例
   * @returns {AIService} AI服务实例
   */
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * 处理用户消息
   * @param {string} message - 用户消息内容
   * @param {string} userId - 用户ID
   * @returns {Promise<AIResponse>} AI响应结果
   */
  public async processMessage(message: string, userId: string): Promise<AIResponse> {
    try {
      // 获取当前上下文
      const context = this.contextManager.getContext(userId)

      // 构建请求参数
      const requestBody = {
        message,
        context,
        userId
      }

      // 调用AI API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 可以添加认证令牌
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // 更新上下文
      this.contextManager.updateContext(userId, message, data.message)

      // 格式化响应
      return {
        message: data.message,
        suggestions: data.suggestions || []
      }
    } catch (error) {
      console.error('AI服务处理消息失败:', error)
      
      // 模拟AI响应（开发环境下）
      return this.generateMockResponse(message)
    }
  }

  /**
   * 生成模拟AI响应（用于开发测试）
   * @param {string} message - 用户消息
   * @returns {AIResponse} 模拟AI响应
   */
  private generateMockResponse(message: string): AIResponse {
    const lowerMessage = message.toLowerCase()
    let responseMessage = ''
    const suggestions: string[] = []

    // 简单的模拟回复逻辑
    if (lowerMessage.includes('菜单') || lowerMessage.includes('菜品')) {
      responseMessage = '我们的招牌菜有：糖醋排骨、宫保鸡丁、麻婆豆腐和鱼香肉丝。您需要查看详细菜单吗？'
      suggestions = ['查看完整菜单', '推荐特色菜', '了解今日特价']
    } else if (lowerMessage.includes('预订') || lowerMessage.includes('预约')) {
      responseMessage = '您可以通过我们的预约系统预订餐桌。需要我帮您预订吗？'
      suggestions = ['立即预订', '查看预订状态', '取消预订']
    } else if (lowerMessage.includes('价格') || lowerMessage.includes('多少钱')) {
      responseMessage = '我们的菜品价格从18元起，套餐价格更优惠。您想了解具体的菜品价格吗？'
      suggestions = ['查看价格表', '了解会员优惠', '咨询套餐信息']
    } else if (lowerMessage.includes('营业时间')) {
      responseMessage = '我们的营业时间是：周一至周日 10:00 - 22:00。'
      suggestions = ['查看详细营业时间', '了解特殊节假日安排']
    } else if (lowerMessage.includes('外卖') || lowerMessage.includes('配送')) {
      responseMessage = '我们提供外卖配送服务，可通过美团、饿了么或我们的官方小程序下单。'
      suggestions = ['立即外卖点餐', '查看配送范围', '了解配送费']
    } else {
      responseMessage = `您好！我是YYC³ AI助手，很高兴为您服务。您说的是："${message}"。\n\n我可以帮助您：\n• 查看菜单和菜品信息\n• 预订餐桌\n• 了解价格和优惠\n• 咨询营业时间\n• 处理外卖订单`
      suggestions = ['查看菜单', '预订餐桌', '了解营业时间', '咨询价格']
    }

    return {
      message: responseMessage,
      suggestions
    }
  }

  /**
   * 清除用户上下文
   * @param {string} userId - 用户ID
   */
  public clearContext(userId: string): void {
    this.contextManager.clearContext(userId)
  }

  /**
   * 设置API端点
   * @param {string} endpoint - API端点URL
   */
  public setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint
  }

  /**
   * 获取当前上下文
   * @param {string} userId - 用户ID
   * @returns {Array<{role: string, content: string}>} 上下文消息列表
   */
  public getContext(userId: string): Array<{role: string, content: string}> {
    return this.contextManager.getContext(userId)
  }
}
