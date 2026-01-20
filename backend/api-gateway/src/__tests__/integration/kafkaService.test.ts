/**
 * @file Kafka服务集成测试
 * @description 测试Kafka服务的各项功能
 * @module __tests__/integration/kafkaService.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-12-29
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { KafkaService, createKafkaService } from '../../services/kafkaService';
import logger from '../../config/logger';

describe('KafkaService Integration Tests', () => {
  let kafkaService: KafkaService;
  const testTopic = 'test-topic';
  const testGroupId = 'test-consumer-group';

  beforeAll(async () => {
    // 创建Kafka服务实例
    kafkaService = createKafkaService({
      brokers: ['localhost:29092'],
      clientId: 'test-kafka-client',
      groupId: testGroupId,
    });

    // 初始化服务
    await kafkaService.initialize();
  });

  afterAll(async () => {
    // 清理测试主题
    try {
      await kafkaService.deleteTopic(testTopic);
    } catch (error) {
      logger.warn('清理测试主题失败:', error);
    }

    // 关闭服务
    await kafkaService.close();
  });

  beforeEach(async () => {
    // 每个测试前清理消息
    // 注意：实际测试中可能需要更复杂的清理逻辑
  });

  afterEach(() => {
    // 每个测试后的清理
  });

  describe('服务初始化', () => {
    it('应该成功初始化Kafka服务', () => {
      expect(kafkaService).toBeDefined();
      const status = kafkaService.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.producerConnected).toBe(true);
    });

    it('应该获取正确的服务状态', async () => {
      const status = await kafkaService.getStatus();
      expect(status).toHaveProperty('initialized', true);
      expect(status).toHaveProperty('producerConnected', true);
      expect(status).toHaveProperty('consumerCount');
    });
  });

  describe('主题管理', () => {
    it('应该成功创建主题', async () => {
      await expect(kafkaService.createTopic(testTopic, 3, 1)).resolves.not.toThrow();
    });

    it('应该能够列出所有主题', async () => {
      const topics = await kafkaService.listTopics();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics).toContain(testTopic);
    });

    it('应该获取主题元数据', async () => {
      const metadata = await kafkaService.getTopicMetadata(testTopic);
      expect(metadata).toBeDefined();
      expect(metadata.topics).toBeDefined();
      expect(metadata.topics).toHaveLength(1);
      expect(metadata.topics[0].name).toBe(testTopic);
    });

    it('应该能够删除主题', async () => {
      await expect(kafkaService.deleteTopic(testTopic)).resolves.not.toThrow();

      // 验证主题已被删除
      const topics = await kafkaService.listTopics();
      expect(topics).not.toContain(testTopic);
    });
  });

  describe('消息发送', () => {
    beforeAll(async () => {
      // 确保测试主题存在
      await kafkaService.createTopic(testTopic, 3, 1);
    });

    it('应该成功发送单条消息', async () => {
      const result = await kafkaService.sendMessage({
        topic: testTopic,
        message: { test: 'data' },
        key: 'test-key'
      });
      expect(result).toBe(true);
    });

    it('应该成功批量发送消息', async () => {
      const messages = [
        { topic: testTopic, message: { id: 1 }, key: 'batch-1' },
        { topic: testTopic, message: { id: 2 }, key: 'batch-2' },
        { topic: testTopic, message: { id: 3 }, key: 'batch-3' },
      ];

      const result = await kafkaService.sendBatchMessages(messages);
      expect(result).toBe(true);
    });

    it('应该处理发送失败的情况', async () => {
      // 测试发送到未连接的Kafka服务
      const disconnectedService = createKafkaService({
        brokers: ['invalid-host:9999'],
        clientId: 'disconnected-client',
        groupId: 'disconnected-group',
      });

      try {
        await disconnectedService.initialize();
      } catch (error) {
        // 初始化失败是预期的
      }

      const result = await disconnectedService.sendMessage({
        topic: testTopic,
        message: { test: 'data' },
        key: 'test-key'
      });
      expect(result).toBe(false);

      await disconnectedService.close();
    });
  });

  describe('消息消费', () => {
    let messageReceived = false;
    let receivedMessage: any = null;

    beforeEach(() => {
      messageReceived = false;
      receivedMessage = null;
    });

    it('应该成功订阅主题并接收消息', async () => {
      let messageReceived = false;
      let receivedMessage: any = null;
      
      const messageHandler = (message: any) => {
        messageReceived = true;
        receivedMessage = message;
        logger.info('测试接收到消息', { message: message.value?.toString() });
      };

      const consumerId = await kafkaService.subscribe({
        topics: [testTopic],
        groupId: testGroupId
      }, messageHandler);

      // 等待消费者完全启动
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 发送测试消息
      await kafkaService.sendMessage({
        topic: testTopic,
        message: { test: 'subscription' },
        key: 'test-key'
      });

      // 等待消息被接收（最多10秒）
      let attempts = 0;
      const maxAttempts = 20;
      while (!messageReceived && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      expect(messageReceived).toBe(true);
      expect(receivedMessage).toBeDefined();
      expect(receivedMessage.value).toBeDefined();
      
      // 清理
      await kafkaService.unsubscribe(consumerId);
    });

    it('应该能够取消订阅', async () => {
      let callCount = 0;
      const messageHandler = () => {
        callCount++;
      };

      const consumerId = await kafkaService.subscribe({
        topics: [testTopic],
        groupId: testGroupId
      }, messageHandler);
      
      await kafkaService.unsubscribe(consumerId);

      // 发送测试消息
      await kafkaService.sendMessage({
        topic: testTopic,
        message: { test: 'unsubscribe' },
        key: 'test-key'
      });

      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 验证消息未被处理（因为已取消订阅）
      expect(callCount).toBe(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的broker连接', async () => {
      const invalidService = createKafkaService({
        brokers: ['invalid-host:9999'],
        clientId: 'invalid-client',
        groupId: 'invalid-group',
      });

      try {
        await invalidService.initialize();
        expect(false).toBe(true); // 不应该到达这里
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        await invalidService.close();
      }
    });

    it('应该处理发送到不存在主题的情况', async () => {
      const newTopic = 'auto-created-topic';
      
      // 确保主题不存在
      try {
        await kafkaService.deleteTopic(newTopic);
      } catch (error) {
        // 主题不存在，忽略错误
      }

      // 发送消息到不存在的主题，Kafka会自动创建
      const result = await kafkaService.sendMessage({
        topic: newTopic,
        message: { test: 'data' },
        key: 'test'
      });
      
      // 验证发送成功（Kafka自动创建了主题）
      expect(result).toBe(true);
      
      // 验证主题确实被创建了
      const topics = await kafkaService.listTopics();
      expect(topics).toContain(newTopic);
      
      // 清理
      await kafkaService.deleteTopic(newTopic);
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量消息', async () => {
      const messageCount = 100;
      const messages = Array.from({ length: messageCount }, (_, i) => ({
        topic: testTopic,
        message: { id: i, timestamp: Date.now() },
        key: `perf-${i}`
      }));

      const startTime = Date.now();
      const result = await kafkaService.sendBatchMessages(messages);
      const endTime = Date.now();

      const duration = endTime - startTime;
      const throughput = messageCount / (duration / 1000);

      expect(result).toBe(true);
      expect(throughput).toBeGreaterThan(100); // 至少100条/秒
    });
  });

  describe('并发测试', () => {
    it('应该能够并发发送消息', async () => {
      const concurrentCount = 10;
      const promises = Array.from({ length: concurrentCount }, (_, i) =>
        kafkaService.sendMessage({
          topic: testTopic,
          message: { id: i },
          key: `concurrent-${i}`
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(concurrentCount);
      expect(results.every(r => r === true)).toBe(true);
    });

    it('应该能够并发创建主题', async () => {
      const topicCount = 5;
      const topics = Array.from({ length: topicCount }, (_, i) => `concurrent-topic-${i}`);

      const promises = topics.map(topic =>
        kafkaService.createTopic(topic, 3, 1)
      );

      await expect(Promise.all(promises)).resolves.not.toThrow();

      // 清理创建的主题
      await Promise.all(topics.map(topic => kafkaService.deleteTopic(topic)));
    });
  });
});
