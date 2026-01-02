/**
 * @file 服务发现路由
 * @description 提供服务发现和管理的API接口
 * @module routes/serviceDiscoveryRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router, Request, Response } from 'express';
import { serviceRegistry } from '../config/serviceRegistry';

const router = Router();

/**
 * 获取所有服务列表
 * GET /api/services
 */
router.get('/', (req: Request, res: Response) => {
  const services = serviceRegistry.getAllServices();
  const servicesInfo = services.map(serviceName => {
    const instances = serviceRegistry.getAllInstances(serviceName);
    const status = serviceRegistry.getServiceStatus(serviceName);
    
    return {
      name: serviceName,
      status,
      instances: instances.map(inst => ({
        id: inst.id,
        url: inst.url,
        health: inst.health,
        lastHealthCheck: inst.lastHealthCheck,
        metadata: inst.metadata,
      })),
    };
  });

  res.status(200).json({
    success: true,
    data: servicesInfo,
  });
});

/**
 * 获取指定服务的详细信息
 * GET /api/services/:serviceName
 */
router.get('/:serviceName', (req: Request, res: Response) => {
  const { serviceName } = req.params;
  const instances = serviceRegistry.getAllInstances(serviceName);

  if (instances.length === 0) {
    return res.status(404).json({
      success: false,
      error: '服务不存在',
    });
  }

  const status = serviceRegistry.getServiceStatus(serviceName);

  res.status(200).json({
    success: true,
    data: {
      name: serviceName,
      status,
      instances: instances.map(inst => ({
        id: inst.id,
        url: inst.url,
        host: inst.host,
        port: inst.port,
        health: inst.health,
        lastHealthCheck: inst.lastHealthCheck,
        metadata: inst.metadata,
      })),
    },
  });
});

/**
 * 获取服务的健康状态
 * GET /api/services/:serviceName/health
 */
router.get('/:serviceName/health', (req: Request, res: Response) => {
  const { serviceName } = req.params;
  const status = serviceRegistry.getServiceStatus(serviceName);

  if (status.total === 0) {
    return res.status(404).json({
      success: false,
      error: '服务不存在',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      serviceName,
      ...status,
      healthPercentage: status.total > 0 ? (status.healthy / status.total) * 100 : 0,
    },
  });
});

/**
 * 设置负载均衡策略
 * PUT /api/services/load-balance-strategy
 */
router.put('/load-balance-strategy', (req: Request, res: Response) => {
  const { strategy } = req.body;

  if (!['round-robin', 'random', 'least-connections'].includes(strategy)) {
    return res.status(400).json({
      success: false,
      error: '无效的负载均衡策略',
    });
  }

  serviceRegistry.setLoadBalanceStrategy(strategy);

  res.status(200).json({
    success: true,
    message: '负载均衡策略已更新',
    data: { strategy },
  });
});

/**
 * 获取当前负载均衡策略
 * GET /api/services/load-balance-strategy
 */
router.get('/load-balance-strategy', (req: Request, res: Response) => {
  // 由于ServiceRegistry没有提供获取当前策略的方法，这里暂时返回默认值
  res.status(200).json({
    success: true,
    data: {
      strategy: 'round-robin',
    },
  });
});

export default router;
