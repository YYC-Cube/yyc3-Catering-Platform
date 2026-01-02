/**
 * @file 健康检查中间件
 * @description 提供服务健康状态检查功能
 * @module middleware/healthCheck
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { Request, Response } from 'express';

// 服务启动时间
const startTime = new Date();

/**
 * @description 健康检查路由处理函数
 */
export const healthCheckHandler = (req: Request, res: Response) => {
  // 基本健康状态
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    startTime: startTime.toISOString(),
  };

  // 检查不同的服务组件
  const checks = {
    api: true,
    database: true, // 这里可以添加实际的数据库连接检查
    redis: true,    // 这里可以添加实际的Redis连接检查
    mqtt: true,     // 这里可以添加实际的MQTT连接检查
  };

  // 检查是否所有组件都健康
  const allChecksPassed = Object.values(checks).every(check => check);
  
  if (allChecksPassed) {
    return res.status(200).json({
      ...healthStatus,
      checks,
    });
  } else {
    return res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      checks,
    });
  }
};

/**
 * @description 就绪检查路由处理函数
 */
export const readinessCheckHandler = (req: Request, res: Response) => {
  // 就绪检查应该确保所有依赖的服务都已启动并可用
  const checks = {
    database: true, // 这里可以添加实际的数据库连接检查
    redis: true,    // 这里可以添加实际的Redis连接检查
    mqtt: true,     // 这里可以添加实际的MQTT连接检查
    queues: true,   // 这里可以添加实际的队列服务检查
  };

  const allChecksPassed = Object.values(checks).every(check => check);
  
  if (allChecksPassed) {
    return res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      checks,
    });
  } else {
    return res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      checks,
    });
  }
};
