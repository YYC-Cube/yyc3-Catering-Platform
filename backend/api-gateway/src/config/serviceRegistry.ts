/**
 * @file 服务注册与发现
 * @description 实现微服务的注册、发现和健康检查
 * @module config/serviceRegistry
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import axios from 'axios';
import logger from './logger';

// 服务实例接口
export interface ServiceInstance {
  id: string;
  name: string;
  url: string;
  host: string;
  port: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
  metadata: Record<string, any>;
}

// 服务注册信息接口
export interface ServiceRegistration {
  name: string;
  url: string;
  host: string;
  port: number;
  metadata?: Record<string, any>;
  healthCheckUrl?: string;
  healthCheckInterval?: number;
}

// 负载均衡策略
export type LoadBalanceStrategy = 'round-robin' | 'random' | 'least-connections';

/**
 * 服务注册表类
 */
export class ServiceRegistry {
  private services: Map<string, ServiceInstance[]> = new Map();
  private healthCheckTimers: Map<string, NodeJS.Timeout> = new Map();
  private roundRobinCounters: Map<string, number> = new Map();
  private loadBalanceStrategy: LoadBalanceStrategy = 'round-robin';

  /**
   * 注册服务
   * @param registration 服务注册信息
   */
  register(registration: ServiceRegistration): void {
    const instance: ServiceInstance = {
      id: `${registration.name}-${registration.host}-${registration.port}`,
      name: registration.name,
      url: registration.url,
      host: registration.host,
      port: registration.port,
      health: 'unknown',
      lastHealthCheck: new Date(),
      metadata: registration.metadata || {},
    };

    if (!this.services.has(registration.name)) {
      this.services.set(registration.name, []);
    }

    const instances = this.services.get(registration.name)!;
    const existingIndex = instances.findIndex(inst => inst.id === instance.id);

    if (existingIndex >= 0) {
      instances[existingIndex] = instance;
      logger.info('服务更新: %s (%s)', registration.name, instance.id);
    } else {
      instances.push(instance);
      logger.info('服务注册: %s (%s)', registration.name, instance.id);
    }

    // 启动健康检查
    if (registration.healthCheckUrl) {
      this.startHealthCheck(instance, registration.healthCheckUrl, registration.healthCheckInterval || 30000);
    }
  }

  /**
   * 注销服务
   * @param serviceName 服务名称
   * @param instanceId 实例ID
   */
  unregister(serviceName: string, instanceId: string): void {
    const instances = this.services.get(serviceName);
    if (!instances) {
      logger.warn('服务不存在: %s', serviceName);
      return;
    }

    const index = instances.findIndex(inst => inst.id === instanceId);
    if (index >= 0) {
      instances.splice(index, 1);
      logger.info('服务注销: %s (%s)', serviceName, instanceId);

      // 停止健康检查
      const timerKey = `${serviceName}-${instanceId}`;
      const timer = this.healthCheckTimers.get(timerKey);
      if (timer) {
        clearInterval(timer);
        this.healthCheckTimers.delete(timerKey);
      }

      // 如果没有实例了，删除服务
      if (instances.length === 0) {
        this.services.delete(serviceName);
      }
    }
  }

  /**
   * 获取服务实例
   * @param serviceName 服务名称
   * @returns 服务实例
   */
  getInstance(serviceName: string): ServiceInstance | null {
    const instances = this.services.get(serviceName);
    if (!instances || instances.length === 0) {
      logger.warn('服务实例不存在: %s', serviceName);
      return null;
    }

    // 过滤健康的实例
    const healthyInstances = instances.filter(inst => inst.health === 'healthy');
    if (healthyInstances.length === 0) {
      logger.warn('服务没有健康的实例: %s', serviceName);
      return null;
    }

    // 根据负载均衡策略选择实例
    switch (this.loadBalanceStrategy) {
      case 'round-robin':
        return this.roundRobinSelect(serviceName, healthyInstances);
      case 'random':
        return this.randomSelect(healthyInstances);
      case 'least-connections':
        return this.leastConnectionsSelect(healthyInstances);
      default:
        return this.roundRobinSelect(serviceName, healthyInstances);
    }
  }

  /**
   * 获取所有服务实例
   * @param serviceName 服务名称
   * @returns 所有服务实例
   */
  getAllInstances(serviceName: string): ServiceInstance[] {
    return this.services.get(serviceName) || [];
  }

  /**
   * 获取所有服务
   * @returns 所有服务名称
   */
  getAllServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * 获取服务状态
   * @param serviceName 服务名称
   * @returns 服务状态
   */
  getServiceStatus(serviceName: string): {
    total: number;
    healthy: number;
    unhealthy: number;
    unknown: number;
  } {
    const instances = this.services.get(serviceName) || [];
    return {
      total: instances.length,
      healthy: instances.filter(inst => inst.health === 'healthy').length,
      unhealthy: instances.filter(inst => inst.health === 'unhealthy').length,
      unknown: instances.filter(inst => inst.health === 'unknown').length,
    };
  }

  /**
   * 设置负载均衡策略
   * @param strategy 负载均衡策略
   */
  setLoadBalanceStrategy(strategy: LoadBalanceStrategy): void {
    this.loadBalanceStrategy = strategy;
    logger.info('负载均衡策略已更新: %s', strategy);
  }

  /**
   * 轮询选择实例
   * @param serviceName 服务名称
   * @param instances 实例列表
   * @returns 选中的实例
   */
  private roundRobinSelect(serviceName: string, instances: ServiceInstance[]): ServiceInstance {
    let counter = this.roundRobinCounters.get(serviceName) || 0;
    const instance = instances[counter % instances.length];
    counter++;
    this.roundRobinCounters.set(serviceName, counter);
    return instance;
  }

  /**
   * 随机选择实例
   * @param instances 实例列表
   * @returns 选中的实例
   */
  private randomSelect(instances: ServiceInstance[]): ServiceInstance {
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }

  /**
   * 最少连接选择实例
   * @param instances 实例列表
   * @returns 选中的实例
   */
  private leastConnectionsSelect(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, inst) => {
      const minConnections = min.metadata.connections || 0;
      const instConnections = inst.metadata.connections || 0;
      return instConnections < minConnections ? inst : min;
    });
  }

  /**
   * 启动健康检查
   * @param instance 服务实例
   * @param healthCheckUrl 健康检查URL
   * @param interval 检查间隔
   */
  private startHealthCheck(instance: ServiceInstance, healthCheckUrl: string, interval: number): void {
    const timerKey = `${instance.name}-${instance.id}`;

    // 清除已有的定时器
    const existingTimer = this.healthCheckTimers.get(timerKey);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    const timer = setInterval(async () => {
      try {
        const response = await axios.get(healthCheckUrl, {
          timeout: 5000,
        });

        if (response.status === 200) {
          instance.health = 'healthy';
          instance.lastHealthCheck = new Date();
          logger.debug('健康检查成功: %s (%s)', instance.name, instance.id);
        } else {
          instance.health = 'unhealthy';
          logger.warn('健康检查失败: %s (%s) - 状态码: %d', instance.name, instance.id, response.status);
        }
      } catch (error) {
        instance.health = 'unhealthy';
        logger.error('健康检查异常: %s (%s) - %s', instance.name, instance.id, error);
      }
    }, interval);

    this.healthCheckTimers.set(timerKey, timer);
  }

  /**
   * 停止所有健康检查
   */
  stopAllHealthChecks(): void {
    this.healthCheckTimers.forEach(timer => clearInterval(timer));
    this.healthCheckTimers.clear();
    logger.info('所有健康检查已停止');
  }
}

// 创建服务注册表单例
export const serviceRegistry = new ServiceRegistry();

// 注册默认服务
export const registerDefaultServices = (): void => {
  const defaultServices: ServiceRegistration[] = [
    {
      name: 'user',
      url: process.env.USER_SERVICE_URL || 'http://localhost:3201',
      host: 'localhost',
      port: 3201,
      healthCheckUrl: `${process.env.USER_SERVICE_URL || 'http://localhost:3201'}/health`,
      healthCheckInterval: 30000,
    },
    {
      name: 'restaurant',
      url: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3202',
      host: 'localhost',
      port: 3202,
      healthCheckUrl: `${process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3202'}/health`,
      healthCheckInterval: 30000,
    },
    {
      name: 'order',
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3203',
      host: 'localhost',
      port: 3203,
      healthCheckUrl: `${process.env.ORDER_SERVICE_URL || 'http://localhost:3203'}/health`,
      healthCheckInterval: 30000,
    },
    {
      name: 'payment',
      url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3204',
      host: 'localhost',
      port: 3204,
      healthCheckUrl: `${process.env.PAYMENT_SERVICE_URL || 'http://localhost:3204'}/health`,
      healthCheckInterval: 30000,
    },
    {
      name: 'delivery',
      url: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3205',
      host: 'localhost',
      port: 3205,
      healthCheckUrl: `${process.env.DELIVERY_SERVICE_URL || 'http://localhost:3205'}/health`,
      healthCheckInterval: 30000,
    },
    {
      name: 'notification',
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3206',
      host: 'localhost',
      port: 3206,
      healthCheckUrl: `${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3206'}/health`,
      healthCheckInterval: 30000,
    },
    {
      name: 'analytics',
      url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3207',
      host: 'localhost',
      port: 3207,
      healthCheckUrl: `${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3207'}/health`,
      healthCheckInterval: 30000,
    },
  ];

  defaultServices.forEach(service => {
    serviceRegistry.register(service);
  });

  logger.info('默认服务注册完成');
};
