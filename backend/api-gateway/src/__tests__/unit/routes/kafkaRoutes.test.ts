/**
 * @file Kafka路由单元测试
 * @description 测试Kafka管理API路由
 * @module __tests__/unit/routes/kafkaRoutes.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import kafkaRoutes from '../../routes/kafkaRoutes';
import { kafkaService } from '../../services/kafkaService';

// Mock Kafka服务
vi.mock('../../services/kafkaService', () => ({
  kafkaService: {
    getStatus: vi.fn(),
    createTopic: vi.fn(),
    deleteTopic: vi.fn(),
    listTopics: vi.fn(),
    getTopicMetadata: vi.fn(),
    sendMessage: vi.fn(),
    sendBatchMessages: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

describe('Kafka Routes Unit Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // 创建Express应用
    app = express();
    app.use(express.json());
    app.use('/api/kafka', kafkaRoutes);

    // 清除所有mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/kafka/status', () => {
    it('应该返回Kafka服务状态', async () => {
      const mockStatus = {
        connected: true,
        brokers: ['localhost:9092'],
        topics: 10,
      };

      vi.mocked(kafkaService.getStatus).mockResolvedValue(mockStatus);

      const response = await request(app).get('/api/kafka/status');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockStatus,
      });
      expect(kafkaService.getStatus).toHaveBeenCalled();
    });

    it('应该处理服务状态获取失败', async () => {
      vi.mocked(kafkaService.getStatus).mockRejectedValue(
        new Error('Failed to get status')
      );

      const response = await request(app).get('/api/kafka/status');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to get Kafka status',
      });
    });
  });

  describe('GET /api/kafka/topics', () => {
    it('应该返回所有主题列表', async () => {
      const mockTopics = ['topic1', 'topic2', 'topic3'];

      vi.mocked(kafkaService.listTopics).mockResolvedValue(mockTopics);

      const response = await request(app).get('/api/kafka/topics');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockTopics,
      });
      expect(kafkaService.listTopics).toHaveBeenCalled();
    });

    it('应该处理获取主题列表失败', async () => {
      vi.mocked(kafkaService.listTopics).mockRejectedValue(
        new Error('Failed to list topics')
      );

      const response = await request(app).get('/api/kafka/topics');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to list topics',
      });
    });
  });

  describe('GET /api/kafka/topics/:topicName', () => {
    it('应该返回指定主题的元数据', async () => {
      const topicName = 'test-topic';
      const mockMetadata = {
        name: topicName,
        partitions: 3,
        replicationFactor: 2,
      };

      vi.mocked(kafkaService.getTopicMetadata).mockResolvedValue(mockMetadata);

      const response = await request(app).get(`/api/kafka/topics/${topicName}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockMetadata,
      });
      expect(kafkaService.getTopicMetadata).toHaveBeenCalledWith(topicName);
    });

    it('应该处理获取主题元数据失败', async () => {
      const topicName = 'non-existent-topic';

      vi.mocked(kafkaService.getTopicMetadata).mockRejectedValue(
        new Error('Topic not found')
      );

      const response = await request(app).get(`/api/kafka/topics/${topicName}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to get topic metadata',
      });
    });
  });

  describe('POST /api/kafka/topics', () => {
    it('应该成功创建主题', async () => {
      const topicData = {
        name: 'new-topic',
        partitions: 3,
        replicationFactor: 2,
      };

      vi.mocked(kafkaService.createTopic).mockResolvedValue({
        success: true,
        message: 'Topic created successfully',
      });

      const response = await request(app)
        .post('/api/kafka/topics')
        .send(topicData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Topic created successfully',
      });
      expect(kafkaService.createTopic).toHaveBeenCalledWith(
        topicData.name,
        topicData.partitions,
        topicData.replicationFactor
      );
    });

    it('应该验证请求体参数', async () => {
      const invalidData = {
        name: 'test-topic',
        // 缺少partitions和replicationFactor
      };

      const response = await request(app)
        .post('/api/kafka/topics')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Name, partitions, and replicationFactor are required',
      });
    });

    it('应该处理主题创建失败', async () => {
      const topicData = {
        name: 'new-topic',
        partitions: 3,
        replicationFactor: 2,
      };

      vi.mocked(kafkaService.createTopic).mockRejectedValue(
        new Error('Failed to create topic')
      );

      const response = await request(app)
        .post('/api/kafka/topics')
        .send(topicData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to create topic',
      });
    });
  });

  describe('DELETE /api/kafka/topics/:topicName', () => {
    it('应该成功删除主题', async () => {
      const topicName = 'test-topic';

      vi.mocked(kafkaService.deleteTopic).mockResolvedValue({
        success: true,
        message: 'Topic deleted successfully',
      });

      const response = await request(app).delete(`/api/kafka/topics/${topicName}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Topic deleted successfully',
      });
      expect(kafkaService.deleteTopic).toHaveBeenCalledWith(topicName);
    });

    it('应该处理主题删除失败', async () => {
      const topicName = 'non-existent-topic';

      vi.mocked(kafkaService.deleteTopic).mockRejectedValue(
        new Error('Failed to delete topic')
      );

      const response = await request(app).delete(`/api/kafka/topics/${topicName}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to delete topic',
      });
    });
  });

  describe('POST /api/kafka/topics/create', () => {
    it('应该批量创建多个主题', async () => {
      const topicsData = {
        topics: [
          { name: 'topic1', partitions: 3, replicationFactor: 2 },
          { name: 'topic2', partitions: 5, replicationFactor: 2 },
        ],
      };

      vi.mocked(kafkaService.createTopic)
        .mockResolvedValueOnce({ success: true, message: 'Topic 1 created' })
        .mockResolvedValueOnce({ success: true, message: 'Topic 2 created' });

      const response = await request(app)
        .post('/api/kafka/topics/create')
        .send(topicsData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Topics created successfully',
        results: [
          { success: true, message: 'Topic 1 created' },
          { success: true, message: 'Topic 2 created' },
        ],
      });
    });

    it('应该处理部分主题创建失败', async () => {
      const topicsData = {
        topics: [
          { name: 'topic1', partitions: 3, replicationFactor: 2 },
          { name: 'topic2', partitions: 5, replicationFactor: 2 },
        ],
      };

      vi.mocked(kafkaService.createTopic)
        .mockResolvedValueOnce({ success: true, message: 'Topic 1 created' })
        .mockRejectedValueOnce(new Error('Failed to create topic 2'));

      const response = await request(app)
        .post('/api/kafka/topics/create')
        .send(topicsData);

      expect(response.status).toBe(207); // Multi-Status
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.results).toHaveLength(2);
    });
  });

  describe('POST /api/kafka/messages/send', () => {
    it('应该成功发送单条消息', async () => {
      const messageData = {
        topic: 'test-topic',
        key: 'test-key',
        value: JSON.stringify({ test: 'data' }),
      };

      vi.mocked(kafkaService.sendMessage).mockResolvedValue({
        success: true,
        offset: 100,
      });

      const response = await request(app)
        .post('/api/kafka/messages/send')
        .send(messageData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { success: true, offset: 100 },
      });
      expect(kafkaService.sendMessage).toHaveBeenCalledWith(
        messageData.topic,
        { key: messageData.key, value: messageData.value }
      );
    });

    it('应该验证消息参数', async () => {
      const invalidData = {
        topic: 'test-topic',
        // 缺少key和value
      };

      const response = await request(app)
        .post('/api/kafka/messages/send')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Topic, key, and value are required',
      });
    });

    it('应该处理消息发送失败', async () => {
      const messageData = {
        topic: 'test-topic',
        key: 'test-key',
        value: JSON.stringify({ test: 'data' }),
      };

      vi.mocked(kafkaService.sendMessage).mockRejectedValue(
        new Error('Failed to send message')
      );

      const response = await request(app)
        .post('/api/kafka/messages/send')
        .send(messageData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to send message',
      });
    });
  });

  describe('POST /api/kafka/messages/batch', () => {
    it('应该成功批量发送消息', async () => {
      const batchData = {
        topic: 'test-topic',
        messages: [
          { key: 'msg1', value: 'value1' },
          { key: 'msg2', value: 'value2' },
        ],
      };

      vi.mocked(kafkaService.sendBatchMessages).mockResolvedValue([
        { success: true, offset: 100 },
        { success: true, offset: 101 },
      ]);

      const response = await request(app)
        .post('/api/kafka/messages/batch')
        .send(batchData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [
          { success: true, offset: 100 },
          { success: true, offset: 101 },
        ],
      });
    });

    it('应该验证批量消息参数', async () => {
      const invalidData = {
        topic: 'test-topic',
        // 缺少messages数组
      };

      const response = await request(app)
        .post('/api/kafka/messages/batch')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Topic and messages array are required',
      });
    });
  });

  describe('POST /api/kafka/subscribe', () => {
    it('应该成功订阅主题', async () => {
      const subscribeData = {
        topic: 'test-topic',
        groupId: 'test-group',
      };

      vi.mocked(kafkaService.subscribe).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/kafka/subscribe')
        .send(subscribeData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Subscribed to topic successfully',
      });
      expect(kafkaService.subscribe).toHaveBeenCalledWith(
        subscribeData.topic,
        expect.any(Function)
      );
    });

    it('应该验证订阅参数', async () => {
      const invalidData = {
        // 缺少topic和groupId
      };

      const response = await request(app)
        .post('/api/kafka/subscribe')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Topic and groupId are required',
      });
    });
  });

  describe('POST /api/kafka/unsubscribe', () => {
    it('应该成功取消订阅', async () => {
      const unsubscribeData = {
        topic: 'test-topic',
      };

      vi.mocked(kafkaService.unsubscribe).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/kafka/unsubscribe')
        .send(unsubscribeData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Unsubscribed from topic successfully',
      });
      expect(kafkaService.unsubscribe).toHaveBeenCalledWith(unsubscribeData.topic);
    });

    it('应该验证取消订阅参数', async () => {
      const invalidData = {
        // 缺少topic
      };

      const response = await request(app)
        .post('/api/kafka/unsubscribe')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Topic is required',
      });
    });
  });
});
