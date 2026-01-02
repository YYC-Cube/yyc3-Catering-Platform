/**
 * @file 服务注册管理器
 * @description 自动管理服务的注册、注销和健康检查
 * @module service-registry
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { ConsulClient, ServiceRegistration, HealthCheck } from './consul-client';
import { logger } from '../libs/logger';

/**
 * 服务配置接口
 */
export interface ServiceConfig {
  /** 服务ID */
  id: string;
  /** 服务名称 */
  name: string;
  /** 服务地址 */
  address: string;
  /** 服务端口 */
  port: number;
  /** 服务标签 */
  tags?: string[];
  /** 元数据 */
  meta?: Record<string, string>;
  /** 健康检查配置 */
  healthCheck?: Partial<HealthCheck>;
  /** 自动重试 */
  autoRetry?: boolean;
  /** 重试间隔（毫秒） */
  retryInterval?: number;
  /** 最大重试次数 */
  maxRetries?: number;
}

/**
 * 服务注册管理器类
 */
export class ServiceRegistryManager {
  private consul: ConsulClient;
  private registeredServices: Map<string, ServiceRegistration> = new Map();
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();
  private isShuttingDown: boolean = false;

  constructor(consul: ConsulClient) {
    this.consul = consul;
    this.setupGracefulShutdown();
  }

  /**
   * 注册服务
   */
  public async registerService(config: ServiceConfig): Promise<boolean> {
    if (this.isShuttingDown) {
      logger.warn('Service registry is shutting down, skipping registration');
      return false;
    }

    const healthCheck: HealthCheck = {
      type: 'http',
      http: `http://${config.address}:${config.port}/health`,
      interval: '10s',
      timeout: '5s',
      deregisterCriticalServiceAfter: '30s',
      ...config.healthCheck,
    };

    const registration: ServiceRegistration = {
      id: config.id,
      name: config.name,
      address: config.address,
      port: config.port,
      tags: config.tags,
      meta: config.meta,
      check: healthCheck,
    };

    try {
      const success = await this.consul.registerService(registration);

      if (success) {
        this.registeredServices.set(config.id, registration);
        logger.info('Service registered successfully', {
          serviceId: config.id,
          serviceName: config.name,
          address: `${config.address}:${config.port}`,
        });

        // 清除重试定时器
        this.clearRetryTimer(config.id);

        return true;
      } else {
        throw new Error('Registration returned false');
      }
    } catch (error) {
      logger.error('Failed to register service', {
        serviceId: config.id,
        serviceName: config.name,
        error: error.message,
      });

      // 自动重试
      if (config.autoRetry !== false) {
        this.scheduleRetry(config);
      }

      return false;
    }
  }

  /**
   * 注销服务
   */
  public async deregisterService(serviceId: string): Promise<boolean> {
    try {
      const success = await this.consul.deregisterService(serviceId);

      if (success) {
        this.registeredServices.delete(serviceId);
        this.clearRetryTimer(serviceId);

        logger.info('Service deregistered successfully', {
          serviceId,
        });
      }

      return success;
    } catch (error) {
      logger.error('Failed to deregister service', {
        serviceId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * 注销所有服务
   */
  public async deregisterAllServices(): Promise<void> {
    const serviceIds = Array.from(this.registeredServices.keys());

    logger.info('Deregistering all services', {
      count: serviceIds.length,
    });

    const promises = serviceIds.map((id) => this.deregisterService(id));
    await Promise.allSettled(promises);
  }

  /**
   * 更新服务状态
   */
  public async updateService(serviceId: string, updates: Partial<ServiceConfig>): Promise<boolean> {
    const existing = this.registeredServices.get(serviceId);

    if (!existing) {
      logger.warn('Service not found for update', { serviceId });
      return false;
    }

    // 先注销旧服务
    await this.deregisterService(serviceId);

    // 重新注册服务
    const updatedConfig: ServiceConfig = {
      id: serviceId,
      name: existing.name,
      address: updates.address || existing.address,
      port: updates.port || existing.port,
      tags: updates.tags || existing.tags,
      meta: updates.meta || existing.meta,
      healthCheck: updates.healthCheck,
    };

    return await this.registerService(updatedConfig);
  }

  /**
   * 获取已注册的服务列表
   */
  public getRegisteredServices(): ServiceRegistration[] {
    return Array.from(this.registeredServices.values());
  }

  /**
   * 检查服务是否已注册
   */
  public isServiceRegistered(serviceId: string): boolean {
    return this.registeredServices.has(serviceId);
  }

  /**
   * 安排重试
   */
  private scheduleRetry(config: ServiceConfig): void {
    const retryInterval = config.retryInterval || 5000;
    const maxRetries = config.maxRetries || 10;

    let retryCount = 0;

    const retryTimer = setInterval(async () => {
      if (this.isShuttingDown) {
        this.clearRetryTimer(config.id);
        return;
      }

      retryCount++;

      logger.info('Retrying service registration', {
        serviceId: config.id,
        retryCount,
        maxRetries,
      });

      const success = await this.registerService({
        ...config,
        maxRetries: 0, // 避免递归重试
      });

      if (success || retryCount >= maxRetries) {
        this.clearRetryTimer(config.id);
      }
    }, retryInterval);

    this.retryTimers.set(config.id, retryTimer);
  }

  /**
   * 清除重试定时器
   */
  private clearRetryTimer(serviceId: string): void {
    const timer = this.retryTimers.get(serviceId);
    if (timer) {
      clearInterval(timer);
      this.retryTimers.delete(serviceId);
    }
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down service registry`);
      this.isShuttingDown = true;

      // 注销所有服务
      await this.deregisterAllServices();

      // 关闭Consul客户端
      await this.consul.close();

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * 关闭管理器
   */
  public async close(): Promise<void> {
    this.isShuttingDown = true;
    await this.deregisterAllServices();
    await this.consul.close();
  }
}

/**
 * 服务注册管理器工厂
 */
export class ServiceRegistryManagerFactory {
  private static instance: ServiceRegistryManager | null = null;

  /**
   * 获取单例实例
   */
  static getInstance(consul?: ConsulClient): ServiceRegistryManager {
    if (!this.instance) {
      const consulClient = consul || ConsulClientFactory.fromEnv();
      this.instance = new ServiceRegistryManager(consulClient);
    }
    return this.instance;
  }

  /**
   * 重置实例
   */
  static reset(): void {
    this.instance = null;
  }
}

/**
 * 导入ConsulClientFactory
 */
import { ConsulClientFactory } from './consul-client';
