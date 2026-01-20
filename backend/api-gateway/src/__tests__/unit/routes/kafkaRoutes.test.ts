/**
 * @file Kafka路由单元测试
 * @description 测试Kafka管理API路由
 * @module __tests__/unit/routes/kafkaRoutes.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-12-29
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import kafkaRoutes from '../../../routes/kafkaRoutes';
import { kafkaService } from '../../../services/kafkaService';

// Mock Kafka服务
vi.mock('../../../services/kafkaService', () => ({
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
        initialized: true,
        producerConnected: true,
        consumerCount: 0,
      };

      vi.mocked(kafkaService.getStatus).mockReturnValue(mockStatus);

      const response = await request(app).get('/api/kafka/status');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockStatus,
      });
      expect(kafkaService.getStatus).toHaveBeenCalled();
    });

    it('应该处理服务状态获取失败', async () => {
      vi.mocked(kafkaService.getStatus).mockImplementation(() => {
        throw new Error('Failed to get status');
      });

      const response = await request(app).get('/api/kafka/status');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: '获取Kafka状态失败',
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
        data: { topics: mockTopics },
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
        error: '获取主题列表失败',
      });
    });
  });

  describe('GET /api/kafka/topics/:topic/metadata', () => {
    it('应该返回指定主题的元数据', async () => {
      const topicName = 'test-topic';
      const mockMetadata = {
        name: topicName,
        partitions: 3,
        replicationFactor: 2,
      };

      vi.mocked(kafkaService.getTopicMetadata).mockResolvedValue(mockMetadata);

      const response = await request(app).get(`/api/kafka/topics/${topicName}/metadata`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { topic: topicName, metadata: mockMetadata },
      });
      expect(kafkaService.getTopicMetadata).toHaveBeenCalledWith(topicName);
    });

    it('应该处理获取主题元数据失败', async () => {
      const topicName = 'non-existent-topic';

      vi.mocked(kafkaService.getTopicMetadata).mockRejectedValue(
        new Error('Topic not found')
      );

      const response = await request(app).get(`/api/kafka/topics/${topicName}/metadata`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: '获取主题元数据失败',
      });
    });
  });

  describe('POST /api/kafka/topics', () => {
    it('应该成功创建主题', async () => {
      const topicData = {
        topic: 'new-topic',
        partitions: 3,
        replicationFactor: 2,
      };

      vi.mocked(kafkaService.createTopic).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/kafka/topics')
        .send(topicData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: '主题创建成功',
        data: { topic: 'new-topic', partitions: 3, replicationFactor: 2 },
      });
      expect(kafkaService.createTopic).toHaveBeenCalledWith(
        topicData.topic,
        topicData.partitions,
        topicData.replicationFactor
      );
    });

    it('应该验证请求体参数', async () => {
      const invalidData = {
        // 缺少topic
      };

      const response = await request(app)
        .post('/api/kafka/topics')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: '主题名称不能为空',
      });
    });

    it('应该处理主题创建失败', async () => {
      const topicData = {
        topic: 'new-topic',
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
        error: '创建主题失败',
      });
    });
  });

  describe('DELETE /api/kafka/topics/:topicName', () => {
    it('应该成功删除主题', async () => {
      const topicName = 'test-topic';

      vi.mocked(kafkaService.deleteTopic).mockResolvedValue(undefined);

      const response = await request(app).delete(`/api/kafka/topics/${topicName}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: '主题删除成功',
        data: { topic: topicName },
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
        error: '删除主题失败',
      });
    });
  });

  describe('POST /api/kafka/messages/send', () => {
    it('应该成功发送消息', async () => {
      const messageData = {
        topic: 'test-topic',
        message: JSON.stringify({ test: 'data' }),
        key: 'test-key',
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
        message: '消息发送成功',
        data: { topic: 'test-topic', key: 'test-key' },
      });
      expect(kafkaService.sendMessage).toHaveBeenCalledWith(messageData);
    });

    it('应该验证消息参数', async () => {
      const invalidData = {
        topic: 'test-topic',
        // 缺少message
      };

      const response = await request(app)
        .post('/api/kafka/messages/send')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: '主题和消息内容不能为空',
      });
    });

    it('应该处理消息发送失败', async () => {
      const messageData = {
        topic: 'test-topic',
        message: JSON.stringify({ test: 'data' }),
      };

      vi.mocked(kafkaService.sendMessage).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/kafka/messages/send')
        .send(messageData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: '消息发送失败',
      });
    });
  });

  describe('POST /api/kafka/messages/batch', () => {
    it('应该成功批量发送消息', async () => {
      const batchData = {
        messages: [
          { topic: 'test-topic', message: 'message1' },
          { topic: 'test-topic', message: 'message2' },
        ],
      };

      vi.mocked(kafkaService.sendBatchMessages).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/kafka/messages/batch')
        .send(batchData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: '批量消息发送成功',
        data: { count: 2 },
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
        error: '消息列表不能为空',
      });
    });
  });

  describe('POST /api/kafka/subscribe', () => {
    it('应该成功订阅主题', async () => {
      const subscribeData = {
        topics: ['test-topic'],
        groupId: 'test-group',
      };

      vi.mocked(kafkaService.subscribe).mockResolvedValue('consumer-123');

      const response = await request(app)
        .post('/api/kafka/subscribe')
        .send(subscribeData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: '订阅成功',
        data: { consumerId: 'consumer-123', topics: ['test-topic'], groupId: 'test-group' },
      });
      expect(kafkaService.subscribe).toHaveBeenCalledWith(
        subscribeData,
        expect.any(Function)
      );
    });

    it('应该验证订阅参数', async () => {
      const invalidData = {
        // 缺少topics和groupId
      };

      const response = await request(app)
        .post('/api/kafka/subscribe')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: '主题列表不能为空',
      });
    });
  });

  describe('DELETE /api/kafka/subscribe/:consumerId', () => {
    it('应该成功取消订阅', async () => {
      const consumerId = 'consumer-123';

      vi.mocked(kafkaService.unsubscribe).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/kafka/subscribe/${consumerId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: '取消订阅成功',
        data: { consumerId },
      });
      expect(kafkaService.unsubscribe).toHaveBeenCalledWith(consumerId);
    });

    it('应该验证取消订阅参数', async () => {
      const consumerId = 'consumer-123';

      vi.mocked(kafkaService.unsubscribe).mockRejectedValue(new Error('Consumer not found'));

      const response = await request(app)
        .delete(`/api/kafka/subscribe/${consumerId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: '取消订阅失败',
      });
    });
  });
});
