/**
 * YYC³餐饮行业智能化平台 - 事件总线服务
 * 提供微服务间异步事件驱动通信机制
 * @module common/services/EventBusService
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import { EventEmitter } from 'events';
import { Logger, LogLevel } from './LoggerService';

/**
 * 事件定义接口
 */
export interface Event {
  /** 事件名称 */
  name: string;
  /** 事件数据 */
  data: any;
  /** 事件源服务 */
  source: string;
  /** 事件时间戳 */
  timestamp: number;
  /** 事件ID */
  id: string;
}

/**
 * 事件总线配置选项
 */
export interface EventBusConfig {
  /** 日志级别 */
  logLevel: LogLevel;
  /** 最大监听器数量 */
  maxListeners: number;
}

/**
 * 事件订阅选项
 */
export interface SubscriptionOptions {
  /** 订阅者名称 */
  subscriberName: string;
  /** 是否为一次性订阅 */
  once?: boolean;
  /** 错误处理函数 */
  errorHandler?: (error: Error) => void;
}

/**
 * 事件总线服务类
 * 提供事件的发布、订阅、取消订阅等功能
 */
export class EventBusService {
  private eventEmitter: EventEmitter;
  private logger: Logger;
  private config: EventBusConfig;
  private subscribers: Map<string, Set<string>>;

  /**
   * 构造函数
   * @param config 事件总线配置
   */
  constructor(config: Partial<EventBusConfig> = {}) {
    this.logger = new Logger('EventBusService', {
      level: config.logLevel || LogLevel.INFO,
      enableConsole: true,
      enableFile: false
    });
    
    this.config = {
      logLevel: LogLevel.INFO,
      maxListeners: 100,
      ...config
    };

    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(this.config.maxListeners);
    this.subscribers = new Map();

    this.logger.info('EventBusService initialized successfully', this.config);
  }

  /**
   * 生成唯一事件ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 发布事件
   * @param eventName 事件名称
   * @param data 事件数据
   * @param source 事件源（默认使用环境变量中的服务名称）
   */
  publish(eventName: string, data: any, source?: string): void {
    const event: Event = {
      name: eventName,
      data,
      source: source || process.env['SERVICE_NAME'] || 'unknown',
      timestamp: Date.now(),
      id: this.generateEventId()
    };

    this.logger.info(`Publishing event: ${eventName}`, {
      eventId: event.id,
      source: event.source,
      dataLength: JSON.stringify(data).length
    });

    // 异步发布事件
    process.nextTick(() => {
      try {
        this.eventEmitter.emit(eventName, event);
        this.eventEmitter.emit('*', event); // 通配符事件，用于监听所有事件
      } catch (error: any) {
        this.logger.error(`Error publishing event: ${eventName}`, {
          eventId: event.id,
          error: error.message
        });
      }
    });
  }

  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @param options 订阅选项
   */
  subscribe(
    eventName: string,
    handler: (event: Event) => void,
    options: SubscriptionOptions
  ): () => void {
    const { subscriberName, once = false, errorHandler } = options;

    // 记录订阅信息
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }
    this.subscribers.get(eventName)?.add(subscriberName);

    this.logger.info(`Subscribed to event: ${eventName}`, {
      subscriber: subscriberName,
      once
    });

    // 包装处理函数以添加错误处理
    const wrappedHandler = (event: Event) => {
      try {
        handler(event);
      } catch (error: any) {
        this.logger.error(`Error handling event: ${eventName}`, {
          eventId: event.id,
          subscriber: subscriberName,
          error: error.message,
          stack: error.stack
        });
        
        // 调用自定义错误处理函数
        if (errorHandler) {
          try {
            errorHandler(error);
          } catch (err: any) {
            this.logger.error(`Error in custom error handler: ${eventName}`, {
              eventId: event.id,
              subscriber: subscriberName,
              error: err.message
            });
          }
        }
      }
    };

    // 注册事件处理函数
    if (once) {
      this.eventEmitter.once(eventName, wrappedHandler);
    } else {
      this.eventEmitter.on(eventName, wrappedHandler);
    }

    // 返回取消订阅函数
    return () => {
      this.unsubscribe(eventName, wrappedHandler, subscriberName);
    };
  }

  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @param subscriberName 订阅者名称
   */
  private unsubscribe(eventName: string, handler: Function, subscriberName: string): void {
    this.eventEmitter.removeListener(eventName, handler);
    
    // 更新订阅者记录
    const eventSubscribers = this.subscribers.get(eventName);
    if (eventSubscribers) {
      eventSubscribers.delete(subscriberName);
      
      // 如果没有订阅者了，移除该事件的记录
      if (eventSubscribers.size === 0) {
        this.subscribers.delete(eventName);
      }
    }

    this.logger.info(`Unsubscribed from event: ${eventName}`, {
      subscriber: subscriberName
    });
  }

  /**
   * 获取事件总线状态
   */
  getStatus(): any {
    return {
      eventNames: this.eventEmitter.eventNames(),
      subscribers: Object.fromEntries(
        Array.from(this.subscribers.entries()).map(([event, subscribers]) => [
          event, Array.from(subscribers)
        ])
      ),
      maxListeners: this.config.maxListeners,
      currentListeners: this.eventEmitter.listenerCount("") // 大致数量
    };
  }

  /**
   * 清理事件总线
   */
  cleanup(): void {
    this.eventEmitter.removeAllListeners();
    this.subscribers.clear();
    this.logger.info('EventBusService cleaned up successfully');
  }
}

/**
 * 事件总线单例实例
 */
let eventBusInstance: EventBusService | null = null;

/**
 * 获取事件总线实例
 * @param config 事件总线配置（仅第一次调用时有效）
 */
export const getEventBus = (config?: Partial<EventBusConfig>): EventBusService => {
  if (!eventBusInstance) {
    eventBusInstance = new EventBusService(config);
  }
  return eventBusInstance;
};
