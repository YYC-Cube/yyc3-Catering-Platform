/**
 * @file kafkaService.test.ts
 * @description Kafka服务单元测试
 * @module tests/unit/services/kafkaService.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('kafkajs', () => ({
  Kafka: vi.fn().mockImplementation(() => ({
    producer: vi.fn(),
    consumer: vi.fn(),
    admin: vi.fn(),
  })),
}));

import { KafkaService, createKafkaService } from '../../../services/kafkaService';

describe('KafkaService', () => {
  let kafkaService: KafkaService;
  let mockKafka: any;
  let mockProducer: any;
  let mockConsumer: any;
  let mockAdmin: any;

  beforeEach(async () => {
    mockProducer = {
      connect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };

    mockConsumer = {
      connect: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockResolvedValue(undefined),
      run: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };

    mockAdmin = {
      connect: vi.fn().mockResolvedValue(undefined),
      createTopics: vi.fn().mockResolvedValue(undefined),
      deleteTopics: vi.fn().mockResolvedValue(undefined),
      listTopics: vi.fn().mockResolvedValue(['topic1', 'topic2']),
      fetchTopicMetadata: vi.fn().mockResolvedValue({ topics: [] }),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };

    mockKafka = {
      producer: vi.fn().mockReturnValue(mockProducer),
      consumer: vi.fn().mockReturnValue(mockConsumer),
      admin: vi.fn().mockReturnValue(mockAdmin),
    };

    const { Kafka } = await import('kafkajs');
    vi.mocked(Kafka).mockReturnValue(mockKafka);

    kafkaService = new KafkaService({
      brokers: ['localhost:9092'],
      clientId: 'test-client',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('构造函数', () => {
    it('应该正确创建KafkaService实例', () => {
      expect(kafkaService).toBeInstanceOf(KafkaService);
      expect(kafkaService['isInitialized']).toBe(false);
    });
  });

  describe('initialize', () => {
    it('应该成功初始化Kafka服务', async () => {
      await kafkaService.initialize();

      expect(mockKafka.producer).toHaveBeenCalled();
      expect(mockProducer.connect).toHaveBeenCalled();
      expect(kafkaService['isInitialized']).toBe(true);
    });

    it('应该在初始化失败时抛出错误', async () => {
      mockProducer.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(kafkaService.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('sendMessage', () => {
    beforeEach(async () => {
      await kafkaService.initialize();
    });

    it('应该成功发送消息', async () => {
      const result = await kafkaService.sendMessage({
        topic: 'test-topic',
        message: { key: 'value' },
        key: 'test-key',
      });

      expect(result).toBe(true);
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'test-topic',
        messages: [
          {
            key: 'test-key',
            value: JSON.stringify({ key: 'value' }),
            partition: undefined,
            headers: undefined,
            timestamp: expect.any(String),
          },
        ],
      });
    });

    it('应该在服务未初始化时返回false', async () => {
      const uninitializedService = new KafkaService({
        brokers: ['localhost:9092'],
        clientId: 'test-client',
      });

      const result = await uninitializedService.sendMessage({
        topic: 'test-topic',
        message: { key: 'value' },
      });

      expect(result).toBe(false);
    });

    it('应该在发送失败时返回false', async () => {
      mockProducer.send.mockRejectedValue(new Error('Send failed'));

      const result = await kafkaService.sendMessage({
        topic: 'test-topic',
        message: { key: 'value' },
      });

      expect(result).toBe(false);
    });
  });

  describe('sendBatchMessages', () => {
    beforeEach(async () => {
      await kafkaService.initialize();
    });

    it('应该成功批量发送消息', async () => {
      const messages = [
        {
          topic: 'topic1',
          message: { id: 1 },
          key: 'key1',
        },
        {
          topic: 'topic2',
          message: { id: 2 },
          key: 'key2',
        },
        {
          topic: 'topic1',
          message: { id: 3 },
          key: 'key3',
        },
      ];

      const result = await kafkaService.sendBatchMessages(messages);

      expect(result).toBe(true);
      expect(mockProducer.send).toHaveBeenCalledTimes(2);
    });

    it('应该在服务未初始化时返回false', async () => {
      const uninitializedService = new KafkaService({
        brokers: ['localhost:9092'],
        clientId: 'test-client',
      });

      const result = await uninitializedService.sendBatchMessages([
        {
          topic: 'test-topic',
          message: { key: 'value' },
        },
      ]);

      expect(result).toBe(false);
    });

    it('应该在批量发送失败时返回false', async () => {
      mockProducer.send.mockRejectedValue(new Error('Batch send failed'));

      const result = await kafkaService.sendBatchMessages([
        {
          topic: 'test-topic',
          message: { key: 'value' },
        },
      ]);

      expect(result).toBe(false);
    });
  });

  describe('subscribe', () => {
    beforeEach(async () => {
      await kafkaService.initialize();
    });

    it('应该成功订阅主题', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const consumerId = await kafkaService.subscribe(
        {
          topics: ['test-topic'],
          groupId: 'test-group',
        },
        handler
      );

      expect(consumerId).toBe('test-group-test-topic');
      expect(mockKafka.consumer).toHaveBeenCalledWith({
        groupId: 'test-group',
      });
      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topics: ['test-topic'],
        fromBeginning: false,
      });
      expect(mockConsumer.run).toHaveBeenCalled();
    });

    it('应该在消费者已存在时返回现有消费者ID', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);

      const consumerId1 = await kafkaService.subscribe(
        {
          topics: ['test-topic'],
          groupId: 'test-group',
        },
        handler
      );

      const consumerId2 = await kafkaService.subscribe(
        {
          topics: ['test-topic'],
          groupId: 'test-group',
        },
        handler
      );

      expect(consumerId1).toBe(consumerId2);
      expect(mockKafka.consumer).toHaveBeenCalledTimes(1);
    });

    it('应该在订阅失败时抛出错误', async () => {
      mockConsumer.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(
        kafkaService.subscribe(
          {
            topics: ['test-topic'],
            groupId: 'test-group',
          },
          vi.fn()
        )
      ).rejects.toThrow('Connection failed');
    });
  });

  describe('unsubscribe', () => {
    beforeEach(async () => {
      await kafkaService.initialize();
    });

    it('应该成功取消订阅', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const consumerId = await kafkaService.subscribe(
        {
          topics: ['test-topic'],
          groupId: 'test-group',
        },
        handler
      );

      await kafkaService.unsubscribe(consumerId);

      expect(mockConsumer.disconnect).toHaveBeenCalled();
      expect(kafkaService['consumers'].has(consumerId)).toBe(false);
    });

    it('应该在消费者不存在时返回', async () => {
      await expect(kafkaService.unsubscribe('non-existent')).resolves.not.toThrow();
    });
  });

  describe('createTopic', () => {
    it('应该成功创建主题', async () => {
      await kafkaService.createTopic('new-topic', 3, 2);

      expect(mockKafka.admin).toHaveBeenCalled();
      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.createTopics).toHaveBeenCalledWith({
        topics: [
          {
            topic: 'new-topic',
            numPartitions: 3,
            replicationFactor: 2,
          },
        ],
        waitForLeaders: true,
      });
      expect(mockAdmin.disconnect).toHaveBeenCalled();
    });

    it('应该在创建失败时抛出错误', async () => {
      mockAdmin.createTopics.mockRejectedValue(new Error('Create failed'));

      await expect(kafkaService.createTopic('new-topic')).rejects.toThrow('Create failed');
    });
  });

  describe('deleteTopic', () => {
    it('应该成功删除主题', async () => {
      await kafkaService.deleteTopic('old-topic');

      expect(mockKafka.admin).toHaveBeenCalled();
      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.deleteTopics).toHaveBeenCalledWith({
        topics: ['old-topic'],
      });
      expect(mockAdmin.disconnect).toHaveBeenCalled();
    });

    it('应该在删除失败时抛出错误', async () => {
      mockAdmin.deleteTopics.mockRejectedValue(new Error('Delete failed'));

      await expect(kafkaService.deleteTopic('old-topic')).rejects.toThrow('Delete failed');
    });
  });

  describe('listTopics', () => {
    it('应该成功获取主题列表', async () => {
      const topics = await kafkaService.listTopics();

      expect(topics).toEqual(['topic1', 'topic2']);
      expect(mockKafka.admin).toHaveBeenCalled();
      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.listTopics).toHaveBeenCalled();
      expect(mockAdmin.disconnect).toHaveBeenCalled();
    });

    it('应该在获取失败时抛出错误', async () => {
      mockAdmin.listTopics.mockRejectedValue(new Error('List failed'));

      await expect(kafkaService.listTopics()).rejects.toThrow('List failed');
    });
  });

  describe('getTopicMetadata', () => {
    it('应该成功获取主题元数据', async () => {
      const metadata = await kafkaService.getTopicMetadata('test-topic');

      expect(metadata).toEqual({ topics: [] });
      expect(mockKafka.admin).toHaveBeenCalled();
      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.fetchTopicMetadata).toHaveBeenCalledWith({
        topics: ['test-topic'],
      });
      expect(mockAdmin.disconnect).toHaveBeenCalled();
    });

    it('应该在获取失败时抛出错误', async () => {
      mockAdmin.fetchTopicMetadata.mockRejectedValue(new Error('Metadata failed'));

      await expect(kafkaService.getTopicMetadata('test-topic')).rejects.toThrow('Metadata failed');
    });
  });

  describe('close', () => {
    it('应该成功关闭Kafka服务', async () => {
      await kafkaService.initialize();

      const handler = vi.fn().mockResolvedValue(undefined);
      await kafkaService.subscribe(
        {
          topics: ['test-topic'],
          groupId: 'test-group',
        },
        handler
      );

      await kafkaService.close();

      expect(mockConsumer.disconnect).toHaveBeenCalled();
      expect(mockProducer.disconnect).toHaveBeenCalled();
      expect(kafkaService['isInitialized']).toBe(false);
      expect(kafkaService['consumers'].size).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('应该返回正确的服务状态', () => {
      const status = kafkaService.getStatus();

      expect(status).toEqual({
        initialized: false,
        producerConnected: false,
        consumerCount: 0,
      });
    });

    it('应该在初始化后返回正确的服务状态', async () => {
      await kafkaService.initialize();

      const status = kafkaService.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.producerConnected).toBe(true);
    });

    it('应该在订阅后返回正确的消费者数量', async () => {
      await kafkaService.initialize();

      const handler = vi.fn().mockResolvedValue(undefined);
      await kafkaService.subscribe(
        {
          topics: ['test-topic'],
          groupId: 'test-group',
        },
        handler
      );

      const status = kafkaService.getStatus();

      expect(status.consumerCount).toBe(1);
    });
  });
});

describe('createKafkaService', () => {
  it('应该创建KafkaService实例', () => {
    const config = {
      brokers: ['localhost:9092'],
      clientId: 'test-client',
    };

    const service = createKafkaService(config);

    expect(service).toBeInstanceOf(KafkaService);
  });
});
