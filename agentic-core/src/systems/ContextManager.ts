/**
 * YYC³餐饮行业智能化平台 - 上下文管理系统
 * 负责管理智能代理的上下文信息
 *
 * 功能特性:
 * - 上下文信息管理
 * - 上下文更新和同步
 * - 上下文历史记录
 * - 上下文验证
 */

import { EventEmitter } from 'events';
import { AgentConfig, ContextData } from '../AgenticCore';

export interface ContextHistory {
  id: string;
  context: ContextData;
  timestamp: number;
  source: string;
  changes: Record<string, any>;
}

export interface ContextValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ContextManager extends EventEmitter {
  private currentContext: ContextData | null = null;
  private contextHistory: ContextHistory[] = [];
  private config!: AgentConfig;

  constructor() {
    super();
  }

  /**
   * 初始化上下文管理系统
   */
  public async initialize(config: AgentConfig): Promise<void> {
    this.config = config;
    this.currentContext = null;
    this.contextHistory = [];

    console.log('ContextManager initialized');
  }

  /**
   * 关闭上下文管理系统
   */
  public async shutdown(): Promise<void> {
    // 清理资源
    this.currentContext = null;
    this.contextHistory = [];
    console.log('ContextManager shutdown');
  }

  /**
   * 更新上下文
   */
  public updateContext(context: ContextData): void {
    // 验证上下文
    const validation = this.validateContext(context);
    if (!validation.valid) {
      console.warn('Invalid context:', validation.errors);
      // 仍然接受上下文，但发出警告
    }

    // 记录上下文历史
    let changes: Record<string, any> = {};
    if (this.currentContext) {
      // 计算上下文变化
      changes = this.calculateChanges(this.currentContext, context);
    }

    const history: ContextHistory = {
      id: this.generateId(),
      context: { ...context },
      timestamp: Date.now(),
      source: 'update',
      changes
    };

    this.contextHistory.push(history);

    // 更新当前上下文
    this.currentContext = { ...context };
    
    // 限制历史记录数量
    if (this.contextHistory.length > 100) {
      this.contextHistory.shift();
    }

    this.emit('contextUpdated', { context, changes, history });
  }

  /**
   * 获取当前上下文
   */
  public getContext(): ContextData | null {
    return this.currentContext;
  }

  /**
   * 刷新上下文
   */
  public async refreshContext(): Promise<void> {
    if (!this.currentContext) {
      return;
    }

    // 这里可以实现上下文的自动刷新逻辑
    // 例如从外部系统获取最新信息
    const refreshedContext = {
      ...this.currentContext,
      timestamp: Date.now()
    };

    this.updateContext(refreshedContext);
  }

  /**
   * 验证上下文
   */
  public validateContext(context: ContextData): ContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本验证
    if (!context.timestamp) {
      errors.push('Timestamp is required');
    }

    if (!context.environment) {
      warnings.push('Environment information is missing');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 计算上下文变化
   */
  private calculateChanges(oldContext: ContextData, newContext: ContextData): Record<string, any> {
    const changes: Record<string, any> = {};

    // 比较基本字段
    for (const key of Object.keys(newContext)) {
      const oldValue = (oldContext as any)[key];
      const newValue = (newContext as any)[key];

      // 简单的深度比较
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          old: oldValue,
          new: newValue
        };
      }
    }

    return changes;
  }

  /**
   * 获取上下文历史
   */
  public getHistory(limit: number = 10): ContextHistory[] {
    return this.contextHistory.slice(-limit);
  }

  /**
   * 获取特定时间点的上下文
   */
  public getContextAtTime(timestamp: number): ContextData | null {
    // 找到最接近指定时间的上下文
    let closestContext: ContextData | null = null;
    let closestTime = Infinity;

    for (const history of this.contextHistory) {
      const timeDiff = Math.abs(history.timestamp - timestamp);
      if (timeDiff < closestTime) {
        closestTime = timeDiff;
        closestContext = history.context;
      }
    }

    return closestContext;
  }

  /**
   * 重置上下文
   */
  public resetContext(): void {
    this.currentContext = null;
    this.contextHistory = [];
    this.emit('contextReset');
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
