/**
 * @file Kafka管理路由
 * @description 提供Kafka主题和消息管理的API接口
 * @module routes/kafkaRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { kafkaService } from '../services/kafkaService';
import logger from '../config/logger';

const router = Router();

/**
 * @route GET /api/kafka/status
 * @description 获取Kafka服务状态
 * @access 私有
 */
router.get('/status', async (req, res) => {
  try {
    const status = kafkaService.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('获取Kafka状态失败', { error });
    res.status(500).json({
      success: false,
      error: '获取Kafka状态失败',
    });
  }
});

/**
 * @route POST /api/kafka/topics
 * @description 创建Kafka主题
 * @access 私有
 * @body { topic: string, partitions?: number, replicationFactor?: number }
 */
router.post('/topics', async (req, res) => {
  try {
    const { topic, partitions, replicationFactor } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: '主题名称不能为空',
      });
    }

    await kafkaService.createTopic(topic, partitions, replicationFactor);

    res.status(201).json({
      success: true,
      message: '主题创建成功',
      data: { topic, partitions, replicationFactor },
    });
  } catch (error) {
    logger.error('创建Kafka主题失败', { error });
    res.status(500).json({
      success: false,
      error: '创建主题失败',
    });
  }
});

/**
 * @route DELETE /api/kafka/topics/:topic
 * @description 删除Kafka主题
 * @access 私有
 */
router.delete('/topics/:topic', async (req, res) => {
  try {
    const { topic } = req.params;

    await kafkaService.deleteTopic(topic);

    res.json({
      success: true,
      message: '主题删除成功',
      data: { topic },
    });
  } catch (error) {
    logger.error('删除Kafka主题失败', { error });
    res.status(500).json({
      success: false,
      error: '删除主题失败',
    });
  }
});

/**
 * @route GET /api/kafka/topics
 * @description 获取所有Kafka主题列表
 * @access 私有
 */
router.get('/topics', async (req, res) => {
  try {
    const topics = await kafkaService.listTopics();

    res.json({
      success: true,
      data: { topics },
    });
  } catch (error) {
    logger.error('获取Kafka主题列表失败', { error });
    res.status(500).json({
      success: false,
      error: '获取主题列表失败',
    });
  }
});

/**
 * @route GET /api/kafka/topics/:topic/metadata
 * @description 获取Kafka主题元数据
 * @access 私有
 */
router.get('/topics/:topic/metadata', async (req, res) => {
  try {
    const { topic } = req.params;

    const metadata = await kafkaService.getTopicMetadata(topic);

    res.json({
      success: true,
      data: { topic, metadata },
    });
  } catch (error) {
    logger.error('获取Kafka主题元数据失败', { error });
    res.status(500).json({
      success: false,
      error: '获取主题元数据失败',
    });
  }
});

/**
 * @route POST /api/kafka/messages/send
 * @description 发送Kafka消息
 * @access 私有
 * @body { topic: string, message: any, key?: string, partition?: number }
 */
router.post('/messages/send', async (req, res) => {
  try {
    const { topic, message, key, partition } = req.body;

    if (!topic || !message) {
      return res.status(400).json({
        success: false,
        error: '主题和消息内容不能为空',
      });
    }

    const result = await kafkaService.sendMessage({
      topic,
      message,
      key,
      partition,
    });

    if (result) {
      res.json({
        success: true,
        message: '消息发送成功',
        data: { topic, key },
      });
    } else {
      res.status(500).json({
        success: false,
        error: '消息发送失败',
      });
    }
  } catch (error) {
    logger.error('发送Kafka消息失败', { error });
    res.status(500).json({
      success: false,
      error: '发送消息失败',
    });
  }
});

/**
 * @route POST /api/kafka/messages/batch
 * @description 批量发送Kafka消息
 * @access 私有
 * @body { messages: Array<{ topic: string, message: any, key?: string }> }
 */
router.post('/messages/batch', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: '消息列表不能为空',
      });
    }

    const result = await kafkaService.sendBatchMessages(messages);

    if (result) {
      res.json({
        success: true,
        message: '批量消息发送成功',
        data: { count: messages.length },
      });
    } else {
      res.status(500).json({
        success: false,
        error: '批量消息发送失败',
      });
    }
  } catch (error) {
    logger.error('批量发送Kafka消息失败', { error });
    res.status(500).json({
      success: false,
      error: '批量发送消息失败',
    });
  }
});

/**
 * @route POST /api/kafka/subscribe
 * @description 订阅Kafka主题
 * @access 私有
 * @body { topics: string[], groupId: string, fromBeginning?: boolean }
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { topics, groupId, fromBeginning } = req.body;

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        error: '主题列表不能为空',
      });
    }

    if (!groupId) {
      return res.status(400).json({
        success: false,
        error: '消费者组ID不能为空',
      });
    }

    // 注意：这里只是示例，实际使用时需要实现消息处理逻辑
    const consumerId = await kafkaService.subscribe(
      { topics, groupId, fromBeginning },
      async (message) => {
        // 消息处理逻辑
        logger.info('处理Kafka消息', { message });
      }
    );

    res.json({
      success: true,
      message: '订阅成功',
      data: { consumerId, topics, groupId },
    });
  } catch (error) {
    logger.error('订阅Kafka主题失败', { error });
    res.status(500).json({
      success: false,
      error: '订阅失败',
    });
  }
});

/**
 * @route DELETE /api/kafka/subscribe/:consumerId
 * @description 取消订阅Kafka主题
 * @access 私有
 */
router.delete('/subscribe/:consumerId', async (req, res) => {
  try {
    const { consumerId } = req.params;

    await kafkaService.unsubscribe(consumerId);

    res.json({
      success: true,
      message: '取消订阅成功',
      data: { consumerId },
    });
  } catch (error) {
    logger.error('取消订阅Kafka主题失败', { error });
    res.status(500).json({
      success: false,
      error: '取消订阅失败',
    });
  }
});

export default router;
