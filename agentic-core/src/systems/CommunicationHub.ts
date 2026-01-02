/**
 * YYC³餐饮行业智能化平台 - 通信中心
 * 负责管理智能代理与其他系统和组件的通信
 *
 * 功能特性:
 * - 消息接收和发送
 * - 通信协议处理
 * - 消息路由
 * - 通信历史记录
 */

import { EventEmitter } from 'events';
import { AgentConfig, AgenticCore } from '../AgenticCore';

export interface Message {
  id: string;
  type: 'request' | 'response' | 'event' | 'command';
  content: any;
  sender: string;
  recipient: string;
  timestamp: number;
  correlationId?: string;
  priority: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  send: (message: Message) => Promise<boolean>;
  receive: (handler: (message: Message) => void) => void;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export interface CommunicationStats {
  totalMessages: number;
  sent: number;
  received: number;
  pending: number;
  errors: number;
}

export class CommunicationHub extends EventEmitter {
  private channels: Map<string, CommunicationChannel> = new Map();
  private messageHistory: Message[] = [];
  private pendingMessages: Map<string, Message> = new Map();
  private config!: AgentConfig;
  private agenticCore: AgenticCore;

  constructor(agenticCore: AgenticCore) {
    super();
    this.agenticCore = agenticCore;
  }

  /**
   * 初始化通信中心
   */
  public async initialize(config: AgentConfig): Promise<void> {
    this.config = config;
    this.channels.clear();
    this.messageHistory = [];
    this.pendingMessages.clear();

    // 注册默认通信通道
    await this.registerDefaultChannels();

    console.log(`CommunicationHub initialized with ${this.channels.size} channels`);
  }

  /**
   * 关闭通信中心
   */
  public async shutdown(): Promise<void> {
    // 断开所有通道
    for (const [id, channel] of this.channels.entries()) {
      if (channel.connected) {
        await channel.disconnect();
      }
    }

    this.channels.clear();
    this.messageHistory = [];
    this.pendingMessages.clear();
    console.log('CommunicationHub shutdown');
  }

  /**
   * 注册通信通道
   */
  public registerChannel(channel: CommunicationChannel): void {
    if (this.channels.has(channel.id)) {
      console.warn(`Channel ${channel.id} already registered, overwriting`);
    }

    this.channels.set(channel.id, channel);
    
    // 连接通道
    if (!channel.connected) {
      channel.connect().then(connected => {
        if (connected) {
          this.emit('channelConnected', channel);
        } else {
          this.emit('channelConnectionFailed', channel);
        }
      });
    }

    // 设置消息接收处理
    channel.receive((message) => this.handleIncomingMessage(message));

    this.emit('channelRegistered', channel);
  }

  /**
   * 注册默认通信通道
   */
  private async registerDefaultChannels(): Promise<void> {
    // 内部消息通道
    this.registerChannel({
      id: 'internal',
      name: '内部通信通道',
      type: 'internal',
      connected: true,
      send: async (message) => {
        // 内部消息直接处理
        this.handleIncomingMessage(message);
        return true;
      },
      receive: () => {}, // 内部通道不需要接收处理
      connect: async () => true,
      disconnect: async () => {}
    });

    // 这里可以添加更多默认通道
    // 例如：WebSocket、REST API等
  }

  /**
   * 发送消息
   */
  public async sendMessage(message: Message): Promise<boolean> {
    // 找到目标通道
    // 这里简化处理，实际应该根据消息类型和接收者选择合适的通道
    const channel = this.channels.get('internal');
    if (!channel || !channel.connected) {
      console.error('No available channel to send message');
      return false;
    }

    // 添加到待处理消息
    this.pendingMessages.set(message.id, message);

    try {
      const success = await channel.send(message);
      if (success) {
        this.pendingMessages.delete(message.id);
        this.recordMessage(message);
        this.emit('messageSent', message);
      }
      return success;
    } catch (error) {
      console.error('Failed to send message:', error);
      this.pendingMessages.delete(message.id);
      return false;
    }
  }

  /**
   * 处理传入消息
   */
  private handleIncomingMessage(message: Message): void {
    // 记录消息
    this.recordMessage(message);
    
    // 路由消息
    this.routeMessage(message);

    // 发出消息接收事件
    this.emit('messageReceived', message);
  }

  /**
   * 路由消息
   */
  private routeMessage(message: Message): void {
    // 根据消息类型和接收者进行路由
    // 这里可以实现更复杂的路由逻辑
    switch (message.type) {
      case 'request':
        this.emit('requestReceived', message);
        break;
      case 'response':
        this.emit('responseReceived', message);
        break;
      case 'event':
        this.emit('eventReceived', message);
        break;
      case 'command':
        this.emit('commandReceived', message);
        break;
    }
  }

  /**
   * 记录消息
   */
  private recordMessage(message: Message): void {
    this.messageHistory.push(message);
    
    // 限制历史记录数量
    if (this.messageHistory.length > 1000) {
      this.messageHistory.shift();
    }
  }

  /**
   * 获取通信统计信息
   */
  public getStats(): CommunicationStats {
    const sent = this.messageHistory.filter(m => m.type !== 'request').length;
    const received = this.messageHistory.filter(m => m.type === 'request').length;
    
    return {
      totalMessages: this.messageHistory.length,
      sent,
      received,
      pending: this.pendingMessages.size,
      errors: 0 // 这里可以添加错误统计
    };
  }

  /**
   * 获取消息历史
   */
  public getMessageHistory(limit: number = 100): Message[] {
    return this.messageHistory.slice(-limit);
  }

  /**
   * 获取待处理消息
   */
  public getPendingMessages(): Message[] {
    return Array.from(this.pendingMessages.values());
  }

  /**
   * 处理消息
   */
  public async processMessages(): Promise<void> {
    // 处理所有待处理消息
    for (const [id, message] of this.pendingMessages.entries()) {
      const channel = this.channels.get('internal');
      if (channel && channel.connected) {
        try {
          const success = await channel.send(message);
          if (success) {
            this.pendingMessages.delete(id);
            this.emit('messageSent', message);
          }
        } catch (error) {
          console.error('Failed to process message:', error);
        }
      }
    }
  }

  /**
   * 生成消息
   */
  public createMessage(
    type: Message['type'],
    content: any,
    sender: string,
    recipient: string,
    priority: Message['priority'] = 'medium',
    metadata: Record<string, any> = {}
  ): Message {
    return {
      id: this.generateId(),
      type,
      content,
      sender,
      recipient,
      timestamp: Date.now(),
      priority,
      metadata
    };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
