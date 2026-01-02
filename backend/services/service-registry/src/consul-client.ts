/**
 * @file Consul客户端封装
 * @description 提供Consul服务注册与发现的客户端功能
 * @module service-registry
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../libs/logger';

/**
 * Consul配置接口
 */
export interface ConsulConfig {
  /** Consul服务器地址 */
  host: string;
  /** Consul服务器端口 */
  port: number;
  /** 认证token */
  token?: string;
  /** 使用的数据中心 */
  datacenter?: string;
  /** HTTP/HTTPS */
  scheme?: 'http' | 'https';
}

/**
 * 服务注册信息接口
 */
export interface ServiceRegistration {
  /** 服务ID（唯一标识） */
  id: string;
  /** 服务名称 */
  name: string;
  /** 服务标签 */
  tags?: string[];
  /** 服务地址 */
  address: string;
  /** 服务端口 */
  port: number;
  /** 健康检查配置 */
  check?: HealthCheck;
  /** 元数据 */
  meta?: Record<string, string>;
}

/**
 * 健康检查配置接口
 */
export interface HealthCheck {
  /** 检查类型 */
  type: 'http' | 'tcp' | 'script' | 'grpc';
  /** 检查间隔 */
  interval: string;
  /** 超时时间 */
  timeout: string;
  /** 失败阈值 */
  deregisterCriticalServiceAfter?: string;
  /** HTTP检查URL */
  http?: string;
  /** TCP检查地址 */
  tcp?: string;
  /** 脚本路径 */
  script?: string;
  /** GRPC检查地址 */
  grpc?: string;
}

/**
 * 服务实例信息接口
 */
export interface ServiceInstance {
  /** 服务ID */
  ID: string;
  /** 服务名称 */
  Service: string;
  /** 服务标签 */
  Tags: string[];
  /** 服务地址 */
  Address: string;
  /** 服务端口 */
  Port: number;
  /** 元数据 */
  Meta: Record<string, string>;
  /** 服务状态 */
  Status: string;
}

/**
 * Consul客户端类
 */
export class ConsulClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: ConsulConfig) {
    this.baseUrl = `${config.scheme || 'http'}://${config.host}:${config.port}/v1`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Consul-Token': config.token || '',
      },
      timeout: 5000,
    });

    logger.info('Consul client initialized', {
      host: config.host,
      port: config.port,
      datacenter: config.datacenter,
    });
  }

  /**
   * 注册服务
   */
  public async registerService(service: ServiceRegistration): Promise<boolean> {
    try {
      const response = await this.client.put('/agent/service/register', {
        ID: service.id,
        Name: service.name,
        Tags: service.tags || [],
        Address: service.address,
        Port: service.port,
        Check: service.check ? this.formatHealthCheck(service.check) : undefined,
        Meta: service.meta || {},
      });

      logger.info('Service registered successfully', {
        serviceId: service.id,
        serviceName: service.name,
        address: `${service.address}:${service.port}`,
      });

      return response.status === 200;
    } catch (error) {
      logger.error('Failed to register service', {
        serviceId: service.id,
        serviceName: service.name,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 注销服务
   */
  public async deregisterService(serviceId: string): Promise<boolean> {
    try {
      const response = await this.client.put(`/agent/service/deregister/${serviceId}`);

      logger.info('Service deregistered successfully', {
        serviceId,
      });

      return response.status === 200;
    } catch (error) {
      logger.error('Failed to deregister service', {
        serviceId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 发现服务
   */
  public async discoverService(serviceName: string): Promise<ServiceInstance[]> {
    try {
      const response = await this.client.get<ServiceInstance[]>(
        `/health/service/${serviceName}`,
        {
          params: {
            passing: true,
          },
        }
      );

      const instances = response.data.map((item) => ({
        ID: item.Service.ID,
        Service: item.Service.Service,
        Tags: item.Service.Tags,
        Address: item.Service.Address,
        Port: item.Service.Port,
        Meta: item.Service.Meta,
        Status: item.Checks[0]?.Status || 'unknown',
      }));

      logger.debug('Service discovery completed', {
        serviceName,
        instanceCount: instances.length,
      });

      return instances;
    } catch (error) {
      logger.error('Failed to discover service', {
        serviceName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 获取单个服务实例（负载均衡）
   */
  public async getOneServiceInstance(
    serviceName: string,
    strategy: 'random' | 'round-robin' | 'least-connections' = 'random'
  ): Promise<ServiceInstance | null> {
    const instances = await this.discoverService(serviceName);

    if (instances.length === 0) {
      logger.warn('No healthy instances found', { serviceName });
      return null;
    }

    if (instances.length === 1) {
      return instances[0];
    }

    switch (strategy) {
      case 'random':
        return instances[Math.floor(Math.random() * instances.length)];
      case 'round-robin':
        // 简单实现：使用时间戳
        const index = Math.floor(Date.now() / 1000) % instances.length;
        return instances[index];
      case 'least-connections':
        // 需要额外的连接跟踪，这里简化为随机
        return instances[Math.floor(Math.random() * instances.length)];
      default:
        return instances[0];
    }
  }

  /**
   * 获取所有服务
   */
  public async getAllServices(): Promise<string[]> {
    try {
      const response = await this.client.get('/catalog/services');
      const services = Object.keys(response.data);

      logger.debug('Retrieved all services', {
        serviceCount: services.length,
      });

      return services;
    } catch (error) {
      logger.error('Failed to get all services', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 获取服务详情
   */
  public async getServiceDetails(serviceName: string): Promise<ServiceInstance[]> {
    try {
      const response = await this.client.get(`/catalog/service/${serviceName}`);

      const instances = response.data.map((item: any) => ({
        ID: item.ServiceID,
        Service: item.ServiceName,
        Tags: item.ServiceTags || [],
        Address: item.ServiceAddress,
        Port: item.ServicePort,
        Meta: item.ServiceMeta || {},
        Status: 'unknown',
      }));

      return instances;
    } catch (error) {
      logger.error('Failed to get service details', {
        serviceName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 健康检查
   */
  public async healthCheck(serviceId: string): Promise<boolean> {
    try {
      const response = await this.client.get(`/agent/health/service/id/${serviceId}`);
      return response.status === 200;
    } catch (error) {
      logger.error('Health check failed', {
        serviceId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * 设置键值对
   */
  public async setKV(key: string, value: string): Promise<boolean> {
    try {
      const response = await this.client.put(`/kv/${key}`, value);
      return response.status === 200;
    } catch (error) {
      logger.error('Failed to set KV', {
        key,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 获取键值对
   */
  public async getKV(key: string): Promise<string | null> {
    try {
      const response = await this.client.get(`/kv/${key}`);
      if (response.data && response.data.length > 0) {
        // Base64解码
        return Buffer.from(response.data[0].Value, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      logger.error('Failed to get KV', {
        key,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 删除键值对
   */
  public async deleteKV(key: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/kv/${key}`);
      return response.status === 200;
    } catch (error) {
      logger.error('Failed to delete KV', {
        key,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 格式化健康检查配置
   */
  private formatHealthCheck(check: HealthCheck): any {
    const formatted: any = {
      Interval: check.interval,
      Timeout: check.timeout,
      DeregisterCriticalServiceAfter: check.deregisterCriticalServiceAfter,
    };

    switch (check.type) {
      case 'http':
        formatted.HTTP = check.http;
        break;
      case 'tcp':
        formatted.TCP = check.tcp;
        break;
      case 'script':
        formatted.Script = check.script;
        break;
      case 'grpc':
        formatted.GRPC = check.grpc;
        break;
    }

    return formatted;
  }

  /**
   * 关闭客户端
   */
  public async close(): Promise<void> {
    logger.info('Consul client closed');
  }
}

/**
 * Consul客户端工厂
 */
export class ConsulClientFactory {
  private static instance: ConsulClient | null = null;

  /**
   * 从环境变量创建Consul客户端
   */
  static fromEnv(): ConsulClient {
    if (!this.instance) {
      const config: ConsulConfig = {
        host: process.env.CONSUL_HOST || 'localhost',
        port: parseInt(process.env.CONSUL_PORT || '8500', 10),
        token: process.env.CONSUL_TOKEN,
        datacenter: process.env.CONSUL_DATACENTER || 'dc1',
        scheme: (process.env.CONSUL_SCHEME as 'http' | 'https') || 'http',
      };

      this.instance = new ConsulClient(config);
    }

    return this.instance;
  }

  /**
   * 创建自定义配置的Consul客户端
   */
  static create(config: ConsulConfig): ConsulClient {
    return new ConsulClient(config);
  }

  /**
   * 重置实例
   */
  static reset(): void {
    this.instance = null;
  }
}
