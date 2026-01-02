/**
 * @file Kafka服务集成测试
 * @description 测试Kafka服务的各项功能
 * @module __tests__/integration/kafkaService.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { KafkaService, createKafkaService } from '../../src/services/kafkaService';
import { logger } from '../../src/utils/logger';

describe('KafkaService Integration Tests', () => {
  let kafkaService: KafkaService;
  const testTopic = 'test-topic';
  const testGroupId = 'test-consumer-group';

  beforeAll(async () => {
    // 创建Kafka服务实例
    kafkaService = createKafkaService({
      brokers: ['localhost:9092'],
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
      expect(kafkaService.isConnected()).toBe(true);
    });

    it('应该获取正确的服务状态', async () => {
      const status = await kafkaService.getStatus();
      expect(status).toHaveProperty('connected', true);
      expect(status).toHaveProperty('brokers');
      expect(status.brokers).toHaveLength(1);
    });
  });

  describe('主题管理', () => {
    it('应该成功创建主题', async () => {
      const result = await kafkaService.createTopic(testTopic, 3, 1);
      expect(result.success).toBe(true);
    });

    it('应该能够列出所有主题', async () => {
      const topics = await kafkaService.listTopics();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics).toContain(testTopic);
    });

    it('应该获取主题元数据', async () => {
      const metadata = await kafkaService.getTopicMetadata(testTopic);
      expect(metadata).toBeDefined();
      expect(metadata.name).toBe(testTopic);
      expect(metadata.partitions).toHaveLength(3);
    });

    it('应该能够删除主题', async () => {
      const deleteResult = await kafkaService.deleteTopic(testTopic);
      expect(deleteResult.success).toBe(true);

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
      const message = {
        key: 'test-key',
        value: JSON.stringify({ test: 'data' }),
      };

      const result = await kafkaService.sendMessage(testTopic, message);
      expect(result.success).toBe(true);
      expect(result.offset).toBeDefined();
    });

    it('应该成功批量发送消息', async () => {
      const messages = [
        { key: 'batch-1', value: JSON.stringify({ id: 1 }) },
        { key: 'batch-2', value: JSON.stringify({ id: 2 }) },
        { key: 'batch-3', value: JSON.stringify({ id: 3 }) },
      ];

      const results = await kafkaService.sendBatchMessages(testTopic, messages);
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('应该处理发送失败的情况', async () => {
      const invalidTopic = 'invalid-topic';
      const message = {
        key: 'test-key',
        value: JSON.stringify({ test: 'data' }),
      };

      const result = await kafkaService.sendMessage(invalidTopic, message);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
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
      const messageHandler = (message: any) => {
        messageReceived = true;
        receivedMessage = message;
      };

      await kafkaService.subscribe(testTopic, messageHandler);

      // 发送测试消息
      await kafkaService.sendMessage(testTopic, {
        key: 'test-key',
        value: JSON.stringify({ test: 'subscription' }),
      });

      // 等待消息被接收（最多5秒）
      await new Promise(resolve => setTimeout(resolve, 5000));

      expect(messageReceived).toBe(true);
      expect(receivedMessage).toBeDefined();
      expect(receivedMessage.value).toBeDefined();
    });

    it('应该能够取消订阅', async () => {
      let callCount = 0;
      const messageHandler = () => {
        callCount++;
      };

      await kafkaService.subscribe(testTopic, messageHandler);
      await kafkaService.unsubscribe(testTopic);

      // 发送测试消息
      await kafkaService.sendMessage(testTopic, {
        key: 'test-key',
        value: JSON.stringify({ test: 'unsubscribe' }),
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
      const result = await kafkaService.sendMessage('non-existent-topic', {
        key: 'test',
        value: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量消息', async () => {
      const messageCount = 100;
      const messages = Array.from({ length: messageCount }, (_, i) => ({
        key: `perf-${i}`,
        value: JSON.stringify({ id: i, timestamp: Date.now() }),
      }));

      const startTime = Date.now();
      const results = await kafkaService.sendBatchMessages(testTopic, messages);
      const endTime = Date.now();

      const duration = endTime - startTime;
      const throughput = messageCount / (duration / 1000);

      expect(results).toHaveLength(messageCount);
      expect(results.every(r => r.success)).toBe(true);
      expect(throughput).toBeGreaterThan(100); // 至少100条/秒
    });
  });

  describe('并发测试', () => {
    it('应该能够并发发送消息', async () => {
      const concurrentCount = 10;
      const promises = Array.from({ length: concurrentCount }, (_, i) =>
        kafkaService.sendMessage(testTopic, {
          key: `concurrent-${i}`,
          value: JSON.stringify({ id: i }),
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(concurrentCount);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('应该能够并发创建主题', async () => {
      const topicCount = 5;
      const topics = Array.from({ length: topicCount }, (_, i) => `concurrent-topic-${i}`);

      const promises = topics.map(topic =>
        kafkaService.createTopic(topic, 3, 1)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(topicCount);
      expect(results.every(r => r.success)).toBe(true);

      // 清理创建的主题
      await Promise.all(topics.map(topic => kafkaService.deleteTopic(topic)));
    });
  });
});
