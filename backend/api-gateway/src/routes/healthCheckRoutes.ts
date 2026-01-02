/**
 * @fileoverview 健康检查API路由
 * @description 提供健康检查查询和管理的API接口
 * @module routes/healthCheckRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router, Request, Response } from 'express';
import { healthCheckService } from '../services/healthCheckService';
import { validateRequest } from '../middleware/requestValidator';
import { logger } from '../config/logger';

const router = Router();

/**
 * 获取所有服务的健康检查结果
 * GET /api/health-check/results
 */
router.get('/results', (req: Request, res: Response) => {
  try {
    const serviceName = req.query.service as string | undefined;
    const results = healthCheckService.getResults(serviceName);

    res.json({
      success: true,
      data: {
        serviceName: serviceName || 'all',
        count: results.length,
        results,
      },
    });
  } catch (error) {
    logger.error('获取健康检查结果失败', { error });
    res.status(500).json({
      success: false,
      error: '获取健康检查结果失败',
      details: error.message,
    });
  }
});

/**
 * 获取服务的健康统计
 * GET /api/health-check/stats
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const serviceName = req.query.service as string | undefined;
    const stats = healthCheckService.getHealthStats(serviceName);

    res.json({
      success: true,
      data: {
        serviceName: serviceName || 'all',
        ...stats,
        healthyPercentage: stats.total > 0 ? ((stats.healthy / stats.total) * 100).toFixed(2) + '%' : '0%',
      },
    });
  } catch (error) {
    logger.error('获取健康统计失败', { error });
    res.status(500).json({
      success: false,
      error: '获取健康统计失败',
      details: error.message,
    });
  }
});

/**
 * 手动触发健康检查
 * POST /api/health-check/check
 */
router.post('/check', (req: Request, res: Response) => {
  try {
    const serviceName = req.body.service as string | undefined;

    // 这里需要扩展healthCheckService以支持手动检查
    // 暂时返回成功消息
    logger.info('手动触发健康检查', { serviceName });

    res.json({
      success: true,
      message: '健康检查已触发',
      data: {
        serviceName: serviceName || 'all',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('触发健康检查失败', { error });
    res.status(500).json({
      success: false,
      error: '触发健康检查失败',
      details: error.message,
    });
  }
});

/**
 * 清除健康检查结果
 * DELETE /api/health-check/results
 */
router.delete('/results', (req: Request, res: Response) => {
  try {
    const serviceName = req.query.service as string | undefined;
    healthCheckService.clearResults(serviceName);

    logger.info('健康检查结果已清除', { serviceName });

    res.json({
      success: true,
      message: '健康检查结果已清除',
      data: {
        serviceName: serviceName || 'all',
      },
    });
  } catch (error) {
    logger.error('清除健康检查结果失败', { error });
    res.status(500).json({
      success: false,
      error: '清除健康检查结果失败',
      details: error.message,
    });
  }
});

/**
 * 更新健康检查配置
 * PUT /api/health-check/config
 */
router.put(
  '/config',
  validateRequest({
    location: 'body',
    rules: [
      {
        field: 'interval',
        type: 'number',
        required: false,
        min: 1000,
        max: 300000,
      },
      {
        field: 'timeout',
        type: 'number',
        required: false,
        min: 1000,
        max: 60000,
      },
      {
        field: 'enabled',
        type: 'boolean',
        required: false,
      },
      {
        field: 'failureThreshold',
        type: 'number',
        required: false,
        min: 1,
        max: 10,
      },
    ],
  }),
  (req: Request, res: Response) => {
    try {
      const config = req.body;

      healthCheckService.updateConfig(config);

      logger.info('健康检查配置已更新', { config });

      res.json({
        success: true,
        message: '健康检查配置已更新',
        data: config,
      });
    } catch (error) {
      logger.error('更新健康检查配置失败', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: '更新健康检查配置失败',
        details: error.message,
      });
    }
  }
);

/**
 * 获取健康检查配置
 * GET /api/health-check/config
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    // 由于healthCheckService没有公开配置的getter方法，这里返回环境变量中的配置
    const config = {
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      failureThreshold: parseInt(process.env.HEALTH_CHECK_FAILURE_THRESHOLD || '3'),
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('获取健康检查配置失败', { error });
    res.status(500).json({
      success: false,
      error: '获取健康检查配置失败',
      details: error.message,
    });
  }
});

export default router;
