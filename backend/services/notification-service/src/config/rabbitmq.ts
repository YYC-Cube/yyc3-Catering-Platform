/**
 * @file RabbitMQ配置
 * @description 配置和管理RabbitMQ连接和消息队列
 * @module config/rabbitmq
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import * as amqp from 'amqplib';
import { logger } from './logger';

let channel: amqp.Channel | null = null;
let connection: any | null = null;

/**
 * 连接到RabbitMQ
 */
export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    connection = await amqp.connect(url);
    if (connection && typeof connection.createChannel === 'function') {
      channel = await connection.createChannel();
      
      // 创建通知队列
      const queueName = process.env.RABBITMQ_NOTIFICATION_QUEUE || 'notification_queue';
      if (channel && typeof channel.assertQueue === 'function') {
        await channel.assertQueue(queueName, {
          durable: true, // 持久化队列
        });
        
        logger.info('RabbitMQ连接成功');
      }
    }
  } catch (error) {
    logger.error('RabbitMQ连接失败: %s', (error as Error).message);
    // 重试连接
    setTimeout(connectRabbitMQ, 5000);
  }
};

/**
 * 获取RabbitMQ通道
 * @returns RabbitMQ通道
 */
export const getChannel = (): amqp.Channel => {
  if (!channel) {
    throw new Error('RabbitMQ通道未初始化');
  }
  return channel;
};

/**
 * 发送消息到队列
 * @param queueName 队列名称
 * @param message 消息内容
 */
export const sendToQueue = async (queueName: string, message: any): Promise<void> => {
  try {
    const channel = getChannel();
    const isSent = channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true, // 持久化消息
    });
    
    if (!isSent) {
      // 如果消息发送失败，将其重新加入队列
      await new Promise((resolve) => channel?.once('drain', resolve));
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    }
    
    logger.info('消息发送到队列成功: %s', queueName);
  } catch (error) {
    logger.error('消息发送到队列失败: %s', (error as Error).message);
    throw error;
  }
};

/**
 * 关闭RabbitMQ连接
 */
export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel && typeof channel.close === 'function') {
      await channel.close();
    }
    if (connection && typeof connection.close === 'function') {
      await connection.close();
    }
    logger.info('RabbitMQ连接已关闭');
  } catch (error) {
    logger.error('关闭RabbitMQ连接失败: %s', (error as Error).message);
  }
};

/**
 * 消费队列中的消息
 * @param queueName 队列名称
 * @param callback 处理消息的回调函数
 */
export const consumeQueue = async (queueName: string, callback: (message: any) => Promise<void>): Promise<void> => {
  try {
    const channel = getChannel();
    await channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const messageContent = JSON.parse(msg.content.toString());
          await callback(messageContent);
          channel.ack(msg); // 确认消息已处理
        } catch (error) {
          logger.error('处理队列消息失败: %s', (error as Error).message);
          channel.nack(msg, false, false); // 拒绝消息，不重新入队
        }
      }
    });
    
    logger.info('开始消费队列: %s', queueName);
  } catch (error) {
    logger.error('消费队列失败: %s', (error as Error).message);
    throw error;
  }
};