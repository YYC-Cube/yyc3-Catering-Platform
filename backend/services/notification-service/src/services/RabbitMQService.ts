/**
 * @file RabbitMQ服务
 * @description 处理与RabbitMQ的通信，包括消息的发送和接收
 * @module services/RabbitMQService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import amqp from 'amqplib';
import { connectRabbitMQ, getChannel, sendToQueue } from '../config/rabbitmq';
import { logger } from '../config/logger';
import { NotificationAttributes } from '../models/Notification';

/**
 * RabbitMQ服务类
 */
export class RabbitMQService {
  private exchangeName = 'notification_exchange';
  private notificationQueue = 'notification_queue';

  /**
   * 初始化RabbitMQ服务
   */
  public async initialize(): Promise<void> {
    try {
      await connectRabbitMQ();
      logger.info('RabbitMQ初始化成功');
    } catch (error: any) {
      logger.error('RabbitMQ初始化失败:', error);
      throw new Error(`RabbitMQ初始化失败: ${error.message}`);
    }
  }

  /**
   * 发送通知到消息队列
   * @param notificationData 通知数据
   */
  public async sendNotificationToQueue(notificationData: NotificationAttributes): Promise<void> {
    try {
      await sendToQueue(this.notificationQueue, notificationData);
      logger.info('通知已发送到消息队列');
    } catch (error: any) {
      logger.error('发送通知到消息队列失败:', error);
      throw new Error(`发送通知到消息队列失败: ${error.message}`);
    }
  }

  /**
   * 消费消息队列中的通知
   * @param onMessageReceived 消息接收回调函数
   */
  public async consumeNotificationQueue(
    onMessageReceived: (notificationData: NotificationAttributes) => Promise<void>
  ): Promise<void> {
    try {
      const channel = await getChannel();
      await channel.assertExchange(this.exchangeName, 'direct', { durable: true });
      await channel.assertQueue(this.notificationQueue, { durable: true });
      await channel.bindQueue(this.notificationQueue, this.exchangeName, 'notification');
      
      await channel.consume(this.notificationQueue, async (message: amqp.ConsumeMessage | null) => {
        if (message) {
          try {
            const notificationData = JSON.parse(message.content.toString()) as NotificationAttributes;
            await onMessageReceived(notificationData);
            channel.ack(message);
            logger.info('通知消息已处理完成', { notificationId: notificationData.id });
          } catch (error: any) {
            logger.error('处理通知消息失败:', error);
            channel.nack(message, false, false);
          }
        }
      });
      
      logger.info('已开始消费通知消息队列');
    } catch (error: any) {
      logger.error('消费通知消息队列失败:', error);
      throw new Error(`消费通知消息队列失败: ${error.message}`);
    }
  }
}

// 导出RabbitMQ服务实例
export const rabbitMQService = new RabbitMQService();
