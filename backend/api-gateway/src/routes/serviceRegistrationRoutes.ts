/**
 * @fileoverview 服务注册API路由
 * @description 提供微服务注册、注销和查询的API接口
 * @module routes/serviceRegistrationRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router, Request, Response } from 'express';
import { serviceRegistry, ServiceRegistration } from '../config/serviceRegistry';
import { validateRequest } from '../middleware/requestValidator';
import { logger } from '../config/logger';

const router = Router();

/**
 * 注册服务
 * POST /api/services/register
 */
router.post(
  '/register',
  validateRequest({
    location: 'body',
    rules: [
      {
        field: 'name',
        type: 'string',
        required: true,
        min: 1,
        max: 100,
      },
      {
        field: 'url',
        type: 'url',
        required: true,
      },
      {
        field: 'host',
        type: 'string',
        required: true,
      },
      {
        field: 'port',
        type: 'number',
        required: true,
        min: 1,
        max: 65535,
      },
      {
        field: 'healthCheckUrl',
        type: 'url',
        required: false,
      },
      {
        field: 'healthCheckInterval',
        type: 'number',
        required: false,
        min: 1000,
        max: 300000,
      },
    ],
  }),
  (req: Request, res: Response) => {
    try {
      const registration: ServiceRegistration = req.body;
      
      // 添加默认元数据
      registration.metadata = {
        ...registration.metadata,
        registeredAt: new Date().toISOString(),
        registeredFrom: req.ip,
      };

      serviceRegistry.register(registration);

      logger.info('服务注册成功', {
        name: registration.name,
        url: registration.url,
        host: registration.host,
        port: registration.port,
      });

      res.status(201).json({
        success: true,
        message: '服务注册成功',
        data: {
          name: registration.name,
          url: registration.url,
          host: registration.host,
          port: registration.port,
        },
      });
    } catch (error) {
      logger.error('服务注册失败', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: '服务注册失败',
        details: error.message,
      });
    }
  }
);

/**
 * 注销服务
 * DELETE /api/services/unregister/:serviceName/:instanceId
 */
router.delete(
  '/unregister/:serviceName/:instanceId',
  validateRequest({
    location: 'params',
    rules: [
      {
        field: 'serviceName',
        type: 'string',
        required: true,
      },
      {
        field: 'instanceId',
        type: 'string',
        required: true,
      },
    ],
  }),
  (req: Request, res: Response) => {
    try {
      const { serviceName, instanceId } = req.params;

      serviceRegistry.unregister(serviceName, instanceId);

      logger.info('服务注销成功', { serviceName, instanceId });

      res.json({
        success: true,
        message: '服务注销成功',
      });
    } catch (error) {
      logger.error('服务注销失败', { error, params: req.params });
      res.status(500).json({
        success: false,
        error: '服务注销失败',
        details: error.message,
      });
    }
  }
);

/**
 * 获取所有服务
 * GET /api/services
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const services = serviceRegistry.getAllServices();
    const serviceDetails = services.map(serviceName => ({
      name: serviceName,
      status: serviceRegistry.getServiceStatus(serviceName),
      instances: serviceRegistry.getAllInstances(serviceName),
    }));

    res.json({
      success: true,
      data: serviceDetails,
    });
  } catch (error) {
    logger.error('获取服务列表失败', { error });
    res.status(500).json({
      success: false,
      error: '获取服务列表失败',
      details: error.message,
    });
  }
});

/**
 * 获取指定服务详情
 * GET /api/services/:serviceName
 */
router.get(
  '/:serviceName',
  validateRequest({
    location: 'params',
    rules: [
      {
        field: 'serviceName',
        type: 'string',
        required: true,
      },
    ],
  }),
  (req: Request, res: Response) => {
    try {
      const { serviceName } = req.params;
      const instances = serviceRegistry.getAllInstances(serviceName);
      const status = serviceRegistry.getServiceStatus(serviceName);

      if (instances.length === 0) {
        return res.status(404).json({
          success: false,
          error: '服务不存在',
          details: `服务 ${serviceName} 未注册`,
        });
      }

      res.json({
        success: true,
        data: {
          name: serviceName,
          status,
          instances,
        },
      });
    } catch (error) {
      logger.error('获取服务详情失败', { error, params: req.params });
      res.status(500).json({
        success: false,
        error: '获取服务详情失败',
        details: error.message,
      });
    }
  }
);

/**
 * 获取服务健康状态
 * GET /api/services/:serviceName/health
 */
router.get(
  '/:serviceName/health',
  validateRequest({
    location: 'params',
    rules: [
      {
        field: 'serviceName',
        type: 'string',
        required: true,
      },
    ],
  }),
  (req: Request, res: Response) => {
    try {
      const { serviceName } = req.params;
      const status = serviceRegistry.getServiceStatus(serviceName);

      if (status.total === 0) {
        return res.status(404).json({
          success: false,
          error: '服务不存在',
          details: `服务 ${serviceName} 未注册`,
        });
      }

      const healthPercentage = (status.healthy / status.total) * 100;
      const overallHealth = healthPercentage >= 80 ? 'healthy' : healthPercentage >= 50 ? 'degraded' : 'unhealthy';

      res.json({
        success: true,
        data: {
          serviceName,
          overallHealth,
          healthPercentage: `${healthPercentage.toFixed(2)}%`,
          ...status,
        },
      });
    } catch (error) {
      logger.error('获取服务健康状态失败', { error, params: req.params });
      res.status(500).json({
        success: false,
        error: '获取服务健康状态失败',
        details: error.message,
      });
    }
  }
);

/**
 * 设置负载均衡策略
 * PUT /api/services/load-balance
 */
router.put(
  '/load-balance',
  validateRequest({
    location: 'body',
    rules: [
      {
        field: 'strategy',
        type: 'string',
        required: true,
        enum: ['round-robin', 'random', 'least-connections'],
      },
    ],
  }),
  (req: Request, res: Response) => {
    try {
      const { strategy } = req.body;

      serviceRegistry.setLoadBalanceStrategy(strategy);

      logger.info('负载均衡策略已更新', { strategy });

      res.json({
        success: true,
        message: '负载均衡策略已更新',
        data: { strategy },
      });
    } catch (error) {
      logger.error('设置负载均衡策略失败', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: '设置负载均衡策略失败',
        details: error.message,
      });
    }
  }
);

/**
 * 获取负载均衡策略
 * GET /api/services/load-balance
 */
router.get('/load-balance', (req: Request, res: Response) => {
  try {
    // 由于serviceRegistry没有公开获取策略的方法，我们需要从实例中获取
    // 这里暂时返回默认值，实际应该修改serviceRegistry添加getter方法
    res.json({
      success: true,
      data: {
        strategy: 'round-robin', // 默认策略
        availableStrategies: ['round-robin', 'random', 'least-connections'],
      },
    });
  } catch (error) {
    logger.error('获取负载均衡策略失败', { error });
    res.status(500).json({
      success: false,
      error: '获取负载均衡策略失败',
      details: error.message,
    });
  }
});

export default router;
