/**
 * @file RabbitMQ服务
 * @description 提供RabbitMQ连接、消息发送和接收功能
 * @module rabbitmq/rabbitmq.service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import amqp, { Channel, Connection, ConsumeMessage, Options } from 'amqplib';
import logger from '../logger/logger.service';

/**
 * RabbitMQ服务类
 */
export class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private readonly exchangeName: string;
  private readonly serviceName: string;

  /**
   * 构造函数
   * @param url RabbitMQ连接URL
   * @param exchangeName 交换机名称
   * @param serviceName 服务名称
   */
  constructor(url: string, exchangeName: string, serviceName: string) {
    this.url = url;
    this.exchangeName = exchangeName;
    this.serviceName = serviceName;
  }

  /**
   * 连接到RabbitMQ
   * @returns Promise<void>
   */
  async connect(): Promise<void> {
    try {
      logger.info('连接到RabbitMQ...', { url: this.url });
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // 声明交换机
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      logger.info('RabbitMQ连接成功');

      // 监听连接错误
      this.connection.on('error', (error) => {
        logger.error('RabbitMQ连接错误', { error });
      });

      this.connection.on('close', () => {
        logger.error('RabbitMQ连接关闭');
        this.reconnect();
      });
    } catch (error) {
      logger.error('连接RabbitMQ失败', { error });
      // 尝试重新连接
      this.reconnect();
    }
  }

  /**
   * 重新连接
   */
  private reconnect(): void {
    logger.info('尝试重新连接RabbitMQ...');
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('重新连接RabbitMQ失败', { error });
        this.reconnect();
      }
    }, 5000);
  }

  /**
   * 发送消息
   * @param routingKey 路由键
   * @param message 消息内容
   * @returns Promise<boolean>
   */
  async sendMessage(routingKey: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        logger.error('RabbitMQ通道未初始化');
        return false;
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.publish(
        this.exchangeName,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
          appId: this.serviceName,
        }
      );

      if (result) {
        logger.info('消息发送成功', { routingKey, message });
      } else {
        logger.error('消息发送失败', { routingKey, message });
      }

      return result;
    } catch (error) {
      logger.error('发送消息失败', { routingKey, error });
      return false;
    }
  }

  /**
   * 订阅消息
   * @param routingKey 路由键
   * @param queueName 队列名称
   * @param callback 回调函数
   * @returns Promise<string> 消费者标签
   */
  async subscribe(
    routingKey: string,
    queueName: string,
    callback: (message: any, ack: () => void, nack: () => void) => void
  ): Promise<string> {
    try {
      if (!this.channel) {
        logger.error('RabbitMQ通道未初始化');
        throw new Error('RabbitMQ通道未初始化');
      }

      // 声明队列
      const queue = await this.channel.assertQueue(queueName, {
        durable: true,
      });

      // 绑定队列到交换机
      await this.channel.bindQueue(queue.queue, this.exchangeName, routingKey);

      // 消费消息
      const consumerTag = await this.channel.consume(
        queue.queue,
        (msg: ConsumeMessage | null) => {
          if (msg) {
            try {
              const message = JSON.parse(msg.content.toString());
              logger.info('接收到消息', { routingKey, message });

              // 处理消息
              callback(message, () => {
                this.channel?.ack(msg!);
              }, () => {
                this.channel?.nack(msg!, false, true);
              });
            } catch (error) {
              logger.error('处理消息失败', { error });
              this.channel?.nack(msg!, false, true);
            }
          }
        },
        {
          noAck: false,
        }
      );

      logger.info('订阅消息成功', { routingKey, queueName });
      return consumerTag.consumerTag;
    } catch (error) {
      logger.error('订阅消息失败', { routingKey, queueName, error });
      throw error;
    }
  }

  /**
   * 取消订阅
   * @param consumerTag 消费者标签
   * @returns Promise<void>
   */
  async unsubscribe(consumerTag: string): Promise<void> {
    try {
      if (!this.channel) {
        logger.error('RabbitMQ通道未初始化');
        return;
      }

      await this.channel.cancel(consumerTag);
      logger.info('取消订阅成功', { consumerTag });
    } catch (error) {
      logger.error('取消订阅失败', { consumerTag, error });
    }
  }

  /**
   * 关闭连接
   * @returns Promise<void>
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      logger.info('RabbitMQ连接已关闭');
    } catch (error) {
      logger.error('关闭RabbitMQ连接失败', { error });
    }
  }
}

/**
 * 消息队列事件类型
 */
export enum MessageQueueEvents {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  RESTAURANT_CREATED = 'restaurant.created',
  RESTAURANT_UPDATED = 'restaurant.updated',
  RESTAURANT_DELETED = 'restaurant.deleted',
  
  MENU_ITEM_CREATED = 'menu_item.created',
  MENU_ITEM_UPDATED = 'menu_item.updated',
  MENU_ITEM_DELETED = 'menu_item.deleted',
  
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_COMPLETED = 'order.completed',
  
  PAYMENT_SUCCESSFUL = 'payment.successful',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_READ = 'notification.read',
  
  ANALYTICS_RECORDED = 'analytics.recorded',
}

/**
 * 消息队列配置
 */
export interface RabbitMQConfig {
  url: string;
  exchangeName: string;
  serviceName: string;
}

/**
 * 创建RabbitMQ服务实例
 * @param config 配置
 * @returns RabbitMQService
 */
export function createRabbitMQService(config: RabbitMQConfig): RabbitMQService {
  return new RabbitMQService(config.url, config.exchangeName, config.serviceName);
}
