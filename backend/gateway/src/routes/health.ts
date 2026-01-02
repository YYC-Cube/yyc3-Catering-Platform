/**
 * @file 健康检查路由
 * @description YYC³餐饮行业智能化平台 - 健康检查API
 * @module routes/health
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { Router, Request, Response } from 'express';
import { config } from '../config/app';
import { logger } from '../utils/logger';
import { getDatabaseManager } from '../config/database';

// 创建路由实例
const router = Router();

/**
 * 健康检查路由 - 基本检查
 */
router.get('/', (req: Request, res: Response): void => {
  try {
    res.status(200).json({
      success: true,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: config.app.version,
      environment: config.app.environment
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({
      success: false,
      message: 'Service is unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 健康检查路由 - 详细检查（包含数据库连接）
 */
router.get('/detailed', async (req: Request, res: Response): Promise<void> => {
  try {
    // 数据库健康检查
    const dbHealth = await getDatabaseManager().healthCheck();

    // 检查所有服务是否健康
    const isHealthy = dbHealth.master && dbHealth.redis;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? 'Service is healthy' : 'Service is unhealthy',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: config.app.version,
      environment: config.app.environment,
      health: {
        database: {
          master: dbHealth.master,
          replicas: dbHealth.replicas
        },
        redis: dbHealth.redis
      }
    });
  } catch (error) {
    logger.error('Detailed health check failed', { error });
    res.status(503).json({
      success: false,
      message: 'Service is unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 健康检查路由 - 环境信息
 */
router.get('/info', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Environment information',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: config.app.version,
    environment: config.app.environment,
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    uptime: `${Math.round(process.uptime())}s`
  });
});

export const healthCheck: Router = router;
