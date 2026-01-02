/**
 * YYC³餐饮行业智能化平台 - 记忆管理系统
 * 负责管理智能代理的短期和长期记忆
 *
 * 功能特性:
 * - 短期记忆存储
 * - 长期记忆存储
 * - 记忆检索和关联
 * - 记忆清理和优化
 */

import { EventEmitter } from 'events';
import { AgentConfig } from '../AgenticCore';

export interface Memory {
  id: string;
  type: 'short_term' | 'long_term';
  content: any;
  metadata: Record<string, any>;
  created: number;
  accessed: number;
  priority: number;
  tags: string[];
}

export interface MemoryQuery {
  type?: 'short_term' | 'long_term';
  tags?: string[];
  startTime?: number;
  endTime?: number;
  keywords?: string[];
  limit?: number;
}

export interface MemoryStats {
  total: number;
  shortTerm: number;
  longTerm: number;
  oldest: number;
  newest: number;
}

export class MemoryManager extends EventEmitter {
  private shortTermMemory: Map<string, Memory> = new Map();
  private longTermMemory: Map<string, Memory> = new Map();
  private config!: AgentConfig;
  private readonly SHORT_TERM_THRESHOLD = 3600000; // 1小时

  constructor() {
    super();
  }

  /**
   * 初始化记忆管理系统
   */
  public async initialize(config: AgentConfig): Promise<void> {
    this.config = config;
    this.shortTermMemory.clear();
    this.longTermMemory.clear();

    console.log('MemoryManager initialized');
  }

  /**
   * 关闭记忆管理系统
   */
  public async shutdown(): Promise<void> {
    // 清理资源
    this.shortTermMemory.clear();
    this.longTermMemory.clear();
    console.log('MemoryManager shutdown');
  }

  /**
   * 存储经验
   */
  public async storeExperience(example: { input: any; output: any; feedback?: number }): Promise<string> {
    const memory: Memory = {
      id: this.generateId(),
      type: 'short_term',
      content: example,
      metadata: {
        hasFeedback: example.feedback !== undefined
      },
      created: Date.now(),
      accessed: Date.now(),
      priority: example.feedback ? Math.abs(example.feedback) : 0.5,
      tags: ['experience', 'learning']
    };

    return this.storeMemory(memory);
  }

  /**
   * 存储记忆
   */
  public storeMemory(memory: Memory): string {
    const memoryMap = memory.type === 'short_term' ? this.shortTermMemory : this.longTermMemory;
    
    if (memoryMap.has(memory.id)) {
      console.warn(`Memory ${memory.id} already exists, overwriting`);
    }
    
    memoryMap.set(memory.id, memory);
    this.emit('memoryStored', memory);
    
    // 自动清理短期记忆
    if (memory.type === 'short_term') {
      this.cleanupShortTermMemory();
    }
    
    return memory.id;
  }

  /**
   * 检索记忆
   */
  public retrieveMemory(query: MemoryQuery): Memory[] {
    const allMemories = [...this.shortTermMemory.values(), ...this.longTermMemory.values()];
    let results = allMemories;
    
    // 类型过滤
    if (query.type) {
      results = results.filter(memory => memory.type === query.type);
    }
    
    // 标签过滤
    if (query.tags && query.tags.length > 0) {
      results = results.filter(memory => 
        query.tags?.some(tag => memory.tags.includes(tag))
      );
    }
    
    // 时间范围过滤
    if (query.startTime) {
      const startTime = query.startTime;
      results = results.filter(memory => memory.created >= startTime);
    }
    if (query.endTime) {
      const endTime = query.endTime;
      results = results.filter(memory => memory.created <= endTime);
    }
    
    // 关键词过滤 (简单实现)
    if (query.keywords && query.keywords.length > 0) {
      results = results.filter(memory => {
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        return query.keywords?.some(keyword => contentStr.includes(keyword.toLowerCase()));
      });
    }
    
    // 排序：按访问时间和优先级
    results.sort((a, b) => {
      if (b.accessed !== a.accessed) {
        return b.accessed - a.accessed;
      }
      return b.priority - a.priority;
    });
    
    // 限制数量
    if (query.limit) {
      results = results.slice(0, query.limit);
    }
    
    // 更新访问时间
    results.forEach(memory => {
      memory.accessed = Date.now();
      const memoryMap = memory.type === 'short_term' ? this.shortTermMemory : this.longTermMemory;
      memoryMap.set(memory.id, memory);
    });
    
    return results;
  }

  /**
   * 清理短期记忆
   */
  private cleanupShortTermMemory(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // 找出过期的记忆
    for (const [key, memory] of this.shortTermMemory.entries()) {
      if (now - memory.created > this.SHORT_TERM_THRESHOLD) {
        expiredKeys.push(key);
      }
    }
    
    // 清理过期记忆
    expiredKeys.forEach(key => {
      const memory = this.shortTermMemory.get(key);
      if (memory) {
        // 可以选择将重要的短期记忆转换为长期记忆
        if (memory.priority > 0.7) {
          const longTermMemory: Memory = {
            ...memory,
            id: this.generateId(),
            type: 'long_term'
          };
          this.longTermMemory.set(longTermMemory.id, longTermMemory);
        }
        this.shortTermMemory.delete(key);
        this.emit('memoryExpired', memory);
      }
    });
    
    // 限制短期记忆数量
    if (this.shortTermMemory.size > 1000) {
      const memories = Array.from(this.shortTermMemory.values());
      memories.sort((a, b) => a.priority - b.priority);
      
      const toRemove = this.shortTermMemory.size - 1000;
      for (let i = 0; i < toRemove && i < memories.length; i++) {
        const memory = memories[i];
        if (memory) {
          this.shortTermMemory.delete(memory.id);
          this.emit('memoryRemoved', memory);
        }
      }
    }
  }

  /**
   * 删除记忆
   */
  public deleteMemory(id: string): boolean {
    let deleted = false;
    
    if (this.shortTermMemory.has(id)) {
      const memory = this.shortTermMemory.get(id)!;
      this.shortTermMemory.delete(id);
      this.emit('memoryRemoved', memory);
      deleted = true;
    } else if (this.longTermMemory.has(id)) {
      const memory = this.longTermMemory.get(id)!;
      this.longTermMemory.delete(id);
      this.emit('memoryRemoved', memory);
      deleted = true;
    }
    
    return deleted;
  }

  /**
   * 获取记忆统计信息
   */
  public getStats(): MemoryStats {
    const shortTerm = Array.from(this.shortTermMemory.values());
    const longTerm = Array.from(this.longTermMemory.values());
    const allMemories = [...shortTerm, ...longTerm];
    
    const stats: MemoryStats = {
      total: allMemories.length,
      shortTerm: shortTerm.length,
      longTerm: longTerm.length,
      oldest: allMemories.length > 0 ? Math.min(...allMemories.map(m => m.created)) : 0,
      newest: allMemories.length > 0 ? Math.max(...allMemories.map(m => m.created)) : 0
    };
    
    return stats;
  }

  /**
   * 关联记忆
   */
  public associateMemories(sourceId: string, targetId: string): void {
    // 简单的关联实现
    // 可以根据需要扩展为更复杂的记忆关联算法
    const source = this.shortTermMemory.get(sourceId) || this.longTermMemory.get(sourceId);
    const target = this.shortTermMemory.get(targetId) || this.longTermMemory.get(targetId);
    
    if (source && target) {
      // 互相添加引用标签
      if (!source.tags.includes(`related_${targetId}`)) {
        source.tags.push(`related_${targetId}`);
      }
      if (!target.tags.includes(`related_${sourceId}`)) {
        target.tags.push(`related_${sourceId}`);
      }
      
      // 更新记忆
      const sourceMap = source.type === 'short_term' ? this.shortTermMemory : this.longTermMemory;
      const targetMap = target.type === 'short_term' ? this.shortTermMemory : this.longTermMemory;
      
      sourceMap.set(sourceId, source);
      targetMap.set(targetId, target);
      
      this.emit('memoriesAssociated', { source, target });
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
