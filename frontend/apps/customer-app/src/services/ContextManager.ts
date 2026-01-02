/**
 * @file 上下文管理器
 * @description 管理AI聊天的上下文信息
 * @module services/ContextManager
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

// 上下文项类型
export interface ContextItem {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 用户上下文类型
export interface UserContext {
  messages: ContextItem[]
  lastUpdated: Date
}

/**
 * 上下文管理器类 - 管理AI聊天的上下文信息
 */
export class ContextManager {
  private static instance: ContextManager
  private contexts: Map<string, UserContext> = new Map()
  private maxContextSize: number = 10 // 最大上下文消息数

  /**
   * 私有构造函数 - 实现单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   * @returns {ContextManager} 上下文管理器实例
   */
  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager()
    }
    return ContextManager.instance
  }

  /**
   * 获取用户上下文
   * @param {string} userId - 用户ID
   * @returns {ContextItem[]} 上下文消息列表
   */
  public getContext(userId: string): ContextItem[] {
    const context = this.contexts.get(userId)
    if (!context) {
      return []
    }
    return [...context.messages]
  }

  /**
   * 更新用户上下文
   * @param {string} userId - 用户ID
   * @param {string} userMessage - 用户消息
   * @param {string} aiMessage - AI消息
   */
  public updateContext(userId: string, userMessage: string, aiMessage: string): void {
    let context = this.contexts.get(userId)

    // 如果用户上下文不存在，创建新的上下文
    if (!context) {
      context = {
        messages: [],
        lastUpdated: new Date()
      }
    }

    // 添加新的消息对到上下文
    context.messages.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiMessage }
    )

    // 限制上下文大小
    if (context.messages.length > this.maxContextSize) {
      // 移除最旧的消息对（用户消息和AI消息）
      context.messages.splice(0, 2)
    }

    // 更新最后更新时间
    context.lastUpdated = new Date()

    // 保存上下文
    this.contexts.set(userId, context)
  }

  /**
   * 清除用户上下文
   * @param {string} userId - 用户ID
   */
  public clearContext(userId: string): void {
    this.contexts.delete(userId)
  }

  /**
   * 添加系统消息到上下文
   * @param {string} userId - 用户ID
   * @param {string} systemMessage - 系统消息
   */
  public addSystemMessage(userId: string, systemMessage: string): void {
    let context = this.contexts.get(userId)

    if (!context) {
      context = {
        messages: [],
        lastUpdated: new Date()
      }
    }

    // 系统消息总是放在最前面
    context.messages.unshift({ role: 'system', content: systemMessage })
    context.lastUpdated = new Date()

    this.contexts.set(userId, context)
  }

  /**
   * 获取所有用户上下文
   * @returns {Map<string, UserContext>} 所有用户上下文
   */
  public getAllContexts(): Map<string, UserContext> {
    return new Map(this.contexts)
  }

  /**
   * 设置最大上下文大小
   * @param {number} size - 最大上下文消息数
   */
  public setMaxContextSize(size: number): void {
    if (size > 0) {
      this.maxContextSize = size
      
      // 更新所有现有上下文以符合新的大小限制
      for (const [userId, context] of this.contexts.entries()) {
        if (context.messages.length > size) {
          // 计算需要移除的消息对数
          const messagesToRemove = (context.messages.length - size) / 2 * 2
          context.messages.splice(0, messagesToRemove)
          this.contexts.set(userId, context)
        }
      }
    }
  }

  /**
   * 清理过期上下文
   * @param {number} maxAgeInMinutes - 最大保留时间（分钟）
   */
  public cleanupExpiredContexts(maxAgeInMinutes: number): void {
    const now = new Date()
    const maxAgeInMs = maxAgeInMinutes * 60 * 1000

    for (const [userId, context] of this.contexts.entries()) {
      const ageInMs = now.getTime() - context.lastUpdated.getTime()
      if (ageInMs > maxAgeInMs) {
        this.contexts.delete(userId)
      }
    }
  }
}
