/**
 * @file Kafka消息队列服务
 * @description 提供Kafka连接、消息发送和接收功能
 * @module services/kafkaService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Kafka, Producer, Consumer, KafkaMessage, EachMessagePayload } from 'kafkajs';
import logger from '../config/logger';

/**
 * Kafka配置接口
 */
export interface KafkaConfig {
  /** Kafka brokers地址 */
  brokers: string[];
  /** 客户端ID */
  clientId: string;
  /** 消费者组ID */
  groupId?: string;
}

/**
 * 消息发送选项
 */
export interface ProducerOptions {
  /** 主题名称 */
  topic: string;
  /** 消息内容 */
  message: any;
  /** 消息键 */
  key?: string;
  /** 分区 */
  partition?: number;
  /** 消息头 */
  headers?: Record<string, string>;
}

/**
 * 消息接收选项
 */
export interface ConsumerOptions {
  /** 主题列表 */
  topics: string[];
  /** 消费者组ID */
  groupId: string;
  /** 从头开始消费 */
  fromBeginning?: boolean;
}

/**
 * 消息处理回调
 */
export type MessageHandler = (message: KafkaMessage) => Promise<void>;

/**
 * Kafka服务类
 */
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private config: KafkaConfig;
  private isInitialized: boolean = false;

  /**
   * 构造函数
   * @param config Kafka配置
   */
  constructor(config: KafkaConfig) {
    this.config = config;
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });
  }

  /**
   * 初始化Kafka服务
   */
  async initialize(): Promise<void> {
    try {
      logger.info('初始化Kafka服务...', { brokers: this.config.brokers });

      // 创建生产者
      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000,
      });

      await this.producer.connect();
      this.isInitialized = true;

      logger.info('Kafka服务初始化成功');
    } catch (error) {
      logger.error('Kafka服务初始化失败', { error });
      throw error;
    }
  }

  /**
   * 发送消息
   * @param options 发送选项
   * @returns Promise<boolean>
   */
  async sendMessage(options: ProducerOptions): Promise<boolean> {
    if (!this.isInitialized || !this.producer) {
      logger.error('Kafka服务未初始化');
      return false;
    }

    try {
      const messageValue = JSON.stringify(options.message);

      await this.producer.send({
        topic: options.topic,
        messages: [
          {
            key: options.key,
            value: messageValue,
            partition: options.partition,
            headers: options.headers,
            timestamp: Date.now().toString(),
          },
        ],
      });

      logger.info('Kafka消息发送成功', {
        topic: options.topic,
        key: options.key,
      });

      return true;
    } catch (error) {
      logger.error('Kafka消息发送失败', {
        topic: options.topic,
        error,
      });
      return false;
    }
  }

  /**
   * 批量发送消息
   * @param options 发送选项数组
   * @returns Promise<boolean>
   */
  async sendBatchMessages(options: ProducerOptions[]): Promise<boolean> {
    if (!this.isInitialized || !this.producer) {
      logger.error('Kafka服务未初始化');
      return false;
    }

    try {
      const topicMessagesMap = new Map<string, any[]>();

      // 按主题分组消息
      options.forEach((opt) => {
        if (!topicMessagesMap.has(opt.topic)) {
          topicMessagesMap.set(opt.topic, []);
        }
        topicMessagesMap.get(opt.topic)!.push({
          key: opt.key,
          value: JSON.stringify(opt.message),
          partition: opt.partition,
          headers: opt.headers,
          timestamp: Date.now().toString(),
        });
      });

      // 批量发送
      for (const [topic, messages] of topicMessagesMap) {
        await this.producer.send({ topic, messages });
      }

      logger.info('Kafka批量消息发送成功', {
        count: options.length,
      });

      return true;
    } catch (error) {
      logger.error('Kafka批量消息发送失败', { error });
      return false;
    }
  }

  /**
   * 订阅消息
   * @param options 消费选项
   * @param handler 消息处理函数
   * @returns Promise<string> 消费者ID
   */
  async subscribe(
    options: ConsumerOptions,
    handler: MessageHandler
  ): Promise<string> {
    try {
      const consumerId = `${options.groupId}-${options.topics.join('-')}`;

      // 检查是否已存在消费者
      if (this.consumers.has(consumerId)) {
        logger.warn('消费者已存在', { consumerId });
        return consumerId;
      }

      // 创建消费者
      const consumer = this.kafka.consumer({
        groupId: options.groupId,
      });

      await consumer.connect();
      await consumer.subscribe({
        topics: options.topics,
        fromBeginning: options.fromBeginning || false,
      });

      // 开始消费
      await consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            logger.debug('接收到Kafka消息', {
              topic: payload.topic,
              partition: payload.partition,
              offset: payload.message.offset,
            });

            await handler(payload.message);
          } catch (error) {
            logger.error('处理Kafka消息失败', {
              topic: payload.topic,
              error,
            });
            throw error;
          }
        },
      });

      this.consumers.set(consumerId, consumer);

      logger.info('Kafka订阅成功', {
        consumerId,
        topics: options.topics,
      });

      return consumerId;
    } catch (error) {
      logger.error('Kafka订阅失败', {
        topics: options.topics,
        error,
      });
      throw error;
    }
  }

  /**
   * 取消订阅
   * @param consumerId 消费者ID
   */
  async unsubscribe(consumerId: string): Promise<void> {
    try {
      const consumer = this.consumers.get(consumerId);
      if (!consumer) {
        logger.warn('消费者不存在', { consumerId });
        return;
      }

      await consumer.disconnect();
      this.consumers.delete(consumerId);

      logger.info('Kafka取消订阅成功', { consumerId });
    } catch (error) {
      logger.error('Kafka取消订阅失败', { consumerId, error });
    }
  }

  /**
   * 创建主题
   * @param topic 主题名称
   * @param partitions 分区数
   * @param replicationFactor 副本因子
   */
  async createTopic(
    topic: string,
    partitions: number = 1,
    replicationFactor: number = 1
  ): Promise<void> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      await admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: partitions,
            replicationFactor,
          },
        ],
        waitForLeaders: true,
      });

      await admin.disconnect();

      logger.info('Kafka主题创建成功', { topic, partitions });
    } catch (error) {
      logger.error('Kafka主题创建失败', { topic, error });
      throw error;
    }
  }

  /**
   * 删除主题
   * @param topic 主题名称
   */
  async deleteTopic(topic: string): Promise<void> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      await admin.deleteTopics({
        topics: [topic],
      });

      await admin.disconnect();

      logger.info('Kafka主题删除成功', { topic });
    } catch (error) {
      logger.error('Kafka主题删除失败', { topic, error });
      throw error;
    }
  }

  /**
   * 获取主题列表
   * @returns Promise<string[]>
   */
  async listTopics(): Promise<string[]> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      const topics = await admin.listTopics();

      await admin.disconnect();

      return topics;
    } catch (error) {
      logger.error('获取Kafka主题列表失败', { error });
      throw error;
    }
  }

  /**
   * 获取主题元数据
   * @param topic 主题名称
   */
  async getTopicMetadata(topic: string): Promise<any> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      const metadata = await admin.fetchTopicMetadata({ topics: [topic] });

      await admin.disconnect();

      return metadata;
    } catch (error) {
      logger.error('获取Kafka主题元数据失败', { topic, error });
      throw error;
    }
  }

  /**
   * 关闭Kafka服务
   */
  async close(): Promise<void> {
    try {
      // 关闭所有消费者
      for (const [consumerId, consumer] of this.consumers) {
        await consumer.disconnect();
        logger.info('Kafka消费者已关闭', { consumerId });
      }
      this.consumers.clear();

      // 关闭生产者
      if (this.producer) {
        await this.producer.disconnect();
        logger.info('Kafka生产者已关闭');
      }

      this.isInitialized = false;
      logger.info('Kafka服务已关闭');
    } catch (error) {
      logger.error('关闭Kafka服务失败', { error });
      throw error;
    }
  }

  /**
   * 获取服务状态
   */
  getStatus(): {
    initialized: boolean;
    producerConnected: boolean;
    consumerCount: number;
  } {
    return {
      initialized: this.isInitialized,
      producerConnected: this.producer !== null,
      consumerCount: this.consumers.size,
    };
  }
}

/**
 * 创建Kafka服务实例
 * @param config Kafka配置
 * @returns Kafka服务实例
 */
export function createKafkaService(config: KafkaConfig): KafkaService {
  return new KafkaService(config);
}

/**
 * 默认Kafka配置
 */
export const defaultKafkaConfig: KafkaConfig = {
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  clientId: process.env.KAFKA_CLIENT_ID || 'api-gateway',
  groupId: process.env.KAFKA_GROUP_ID || 'api-gateway-group',
};

/**
 * Kafka服务单例
 */
export const kafkaService = createKafkaService(defaultKafkaConfig);
