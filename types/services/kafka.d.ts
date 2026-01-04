/**
 * @file 消息队列服务类型定义
 * @description Kafka 相关类型定义
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * Kafka 消息接口
 */
export interface KafkaMessage {
  topic: string;
  partition?: number;
  key?: string;
  value: unknown;
  headers?: Record<string, string>;
  timestamp?: number;
}

/**
 * Kafka 配置接口
 */
export interface KafkaConfig {
  brokers: string[];
  clientId?: string;
  groupId?: string;
  ssl?: boolean;
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
  producer: {
    acks?: 0 | 1 | 'all';
    retries?: number;
    maxInFlightRequests?: number;
    compressionType?: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
  };
  consumer: {
    autoCommit?: boolean;
    autoOffsetReset?: 'earliest' | 'latest' | 'none';
    sessionTimeout?: number;
    heartbeatInterval?: number;
  };
}

/**
 * 消息生产者接口
 */
export interface IMessageProducer {
  produce(message: KafkaMessage): Promise<void>;
  produceBatch(messages: KafkaMessage[]): Promise<void>;
}

/**
 * 消息消费者接口
 */
export interface IMessageConsumer {
  subscribe(topic: string, handler: (message: KafkaMessage) => Promise<void>): void;
  unsubscribe(topic: string): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

/**
 * 消息处理结果
 */
export interface MessageHandlerResult {
  success: boolean;
  error?: Error;
  retryCount?: number;
}
