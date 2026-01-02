/**
 * @file 服务发现客户端
 * @description 提供服务发现和负载均衡功能
 * @module service-registry
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { ConsulClient, ServiceInstance } from './consul-client';
import { logger } from '../libs/logger';

/**
 * 负载均衡策略
 */
export type LoadBalancingStrategy = 'random' | 'round-robin' | 'least-connections' | 'weighted';

/**
 * 服务发现配置
 */
export interface ServiceDiscoveryConfig {
  /** 服务名称 */
  serviceName: string;
  /** 负载均衡策略 */
  strategy?: LoadBalancingStrategy;
  /** 缓存TTL（毫秒） */
  cacheTTL?: number;
  /** 健康检查间隔（毫秒） */
  healthCheckInterval?: number;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}

/**
 * 服务实例缓存
 */
interface ServiceCache {
  instances: ServiceInstance[];
  timestamp: number;
}

/**
 * 服务发现客户端类
 */
export class ServiceDiscoveryClient {
  private consul: ConsulClient;
  private config: ServiceDiscoveryConfig;
  private cache: Map<string, ServiceCache> = new Map();
  private roundRobinIndex: Map<string, number> = new Map();
  private connections: Map<string, number> = new Map();

  constructor(consul: ConsulClient, config: ServiceDiscoveryConfig) {
    this.consul = consul;
    this.config = {
      strategy: 'random',
      cacheTTL: 30000, // 30秒
      healthCheckInterval: 10000, // 10秒
      retryCount: 3,
      retryDelay: 1000,
      ...config,
    };

    // 启动健康检查
    this.startHealthCheck();

    logger.info('Service discovery client initialized', {
      serviceName: this.config.serviceName,
      strategy: this.config.strategy,
    });
  }

  /**
   * 发现服务实例
   */
  public async discover(): Promise<ServiceInstance[]> {
    const cacheKey = this.config.serviceName;
    const now = Date.now();

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < this.config.cacheTTL!) {
      logger.debug('Using cached service instances', {
        serviceName: this.config.serviceName,
        instanceCount: cached.instances.length,
      });
      return cached.instances;
    }

    // 从Consul获取服务实例
    try {
      const instances = await this.consul.discoverService(this.config.serviceName);

      // 更新缓存
      this.cache.set(cacheKey, {
        instances,
        timestamp: now,
      });

      logger.debug('Service instances discovered', {
        serviceName: this.config.serviceName,
        instanceCount: instances.length,
      });

      return instances;
    } catch (error) {
      logger.error('Failed to discover service instances', {
        serviceName: this.config.serviceName,
        error: error.message,
      });

      // 如果有缓存，返回缓存数据
      if (cached) {
        logger.warn('Using stale cached instances due to discovery failure');
        return cached.instances;
      }

      throw error;
    }
  }

  /**
   * 获取单个服务实例（负载均衡）
   */
  public async getInstance(): Promise<ServiceInstance | null> {
    const instances = await this.discover();

    if (instances.length === 0) {
      logger.warn('No healthy instances available', {
        serviceName: this.config.serviceName,
      });
      return null;
    }

    switch (this.config.strategy) {
      case 'random':
        return this.getRandomInstance(instances);
      case 'round-robin':
        return this.getRoundRobinInstance(instances);
      case 'least-connections':
        return this.getLeastConnectionsInstance(instances);
      case 'weighted':
        return this.getWeightedInstance(instances);
      default:
        return instances[0];
    }
  }

  /**
   * 随机选择实例
   */
  private getRandomInstance(instances: ServiceInstance[]): ServiceInstance {
    return instances[Math.floor(Math.random() * instances.length)];
  }

  /**
   * 轮询选择实例
   */
  private getRoundRobinInstance(instances: ServiceInstance[]): ServiceInstance {
    const currentIndex = this.roundRobinIndex.get(this.config.serviceName) || 0;
    const instance = instances[currentIndex % instances.length];
    this.roundRobinIndex.set(this.config.serviceName, currentIndex + 1);
    return instance;
  }

  /**
   * 最少连接选择实例
   */
  private getLeastConnectionsInstance(instances: ServiceInstance[]): ServiceInstance {
    let minConnections = Infinity;
    let selectedInstance = instances[0];

    for (const instance of instances) {
      const connections = this.connections.get(instance.ID) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }

    return selectedInstance;
  }

  /**
   * 加权选择实例
   */
  private getWeightedInstance(instances: ServiceInstance[]): ServiceInstance {
    // 从元数据中获取权重
    const weightedInstances = instances.map((instance) => ({
      instance,
      weight: parseInt(instance.Meta.weight || '1', 10),
    }));

    const totalWeight = weightedInstances.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const { instance, weight } of weightedInstances) {
      random -= weight;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[0];
  }

  /**
   * 调用服务
   */
  public async callService<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryCount!; attempt++) {
      try {
        const instance = await this.getInstance();

        if (!instance) {
          throw new Error('No healthy instances available');
        }

        const url = `http://${instance.Address}:${instance.Port}${path}`;

        logger.debug('Calling service', {
          url,
          attempt: attempt + 1,
          maxRetries: this.config.retryCount,
        });

        // 增加连接计数
        this.incrementConnection(instance.ID);

        const response = await fetch(url, options);

        // 减少连接计数
        this.decrementConnection(instance.ID);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        logger.warn('Service call failed', {
          serviceName: this.config.serviceName,
          attempt: attempt + 1,
          error: error.message,
        });

        if (attempt < this.config.retryCount! - 1) {
          await this.sleep(this.config.retryDelay!);
        }
      }
    }

    throw lastError;
  }

  /**
   * 增加连接计数
   */
  private incrementConnection(instanceId: string): void {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, current + 1);
  }

  /**
   * 减少连接计数
   */
  private decrementConnection(instanceId: string): void {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, Math.max(0, current - 1));
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    setInterval(async () => {
      try {
        await this.discover();
      } catch (error) {
        logger.error('Health check failed', {
          serviceName: this.config.serviceName,
          error: error.message,
        });
      }
    }, this.config.healthCheckInterval!);
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.delete(this.config.serviceName);
    logger.debug('Service cache cleared', {
      serviceName: this.config.serviceName,
    });
  }

  /**
   * 获取服务统计信息
   */
  public getStats() {
    const cache = this.cache.get(this.config.serviceName);
    return {
      serviceName: this.config.serviceName,
      cachedInstances: cache?.instances.length || 0,
      cacheAge: cache ? Date.now() - cache.timestamp : 0,
      connections: Object.fromEntries(this.connections),
      strategy: this.config.strategy,
    };
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 关闭客户端
   */
  public async close(): Promise<void> {
    this.cache.clear();
    this.connections.clear();
    this.roundRobinIndex.clear();
    logger.info('Service discovery client closed');
  }
}

/**
 * 服务发现客户端工厂
 */
export class ServiceDiscoveryClientFactory {
  private static instances: Map<string, ServiceDiscoveryClient> = new Map();

  /**
   * 获取或创建服务发现客户端
   */
  static getOrCreate(
    serviceName: string,
    config?: Partial<ServiceDiscoveryConfig>
  ): ServiceDiscoveryClient {
    let client = this.instances.get(serviceName);

    if (!client) {
      const consul = ConsulClientFactory.fromEnv();
      client = new ServiceDiscoveryClient(consul, {
        serviceName,
        ...config,
      });
      this.instances.set(serviceName, client);
    }

    return client;
  }

  /**
   * 关闭所有客户端
   */
  static async closeAll(): Promise<void> {
    const promises = Array.from(this.instances.values()).map((client) => client.close());
    await Promise.all(promises);
    this.instances.clear();
  }

  /**
   * 重置工厂
   */
  static reset(): void {
    this.instances.clear();
  }
}

/**
 * 导入ConsulClientFactory
 */
import { ConsulClientFactory } from './consul-client';
