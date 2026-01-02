/**
 * YYC³餐饮行业智能化平台 - 通信服务
 * 提供微服务间安全稳定的通信机制
 * @module common/services/CommunicationService
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger, LogLevel } from './LoggerService';
import { EventBusService, getEventBus } from './EventBusService';

/**
 * 通信服务配置选项
 */
export interface CommunicationServiceConfig {
  timeout: number;
  retryCount: number;
  retryDelay: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  /** 是否启用事件发布 */
  enableEventBus?: boolean;
}

/**
 * 服务间通信请求配置
 */
export interface ServiceRequestConfig extends AxiosRequestConfig {
  serviceName: string;
  endpoint: string;
  requiresAuth?: boolean;
  timeout?: number;
}

/**
 * 服务间通信响应
 */
export interface ServiceResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

/**
 * 通信服务类
 * 提供安全、可靠的微服务间通信机制
 */
export class CommunicationService {
  private axiosInstance: AxiosInstance;
  private logger: Logger;
  private config: CommunicationServiceConfig;
  private serviceConfigs: Map<string, string>;
  private circuitBreakerStates: Map<string, { isOpen: boolean; lastFailure: number }>;
  private failureCounts: Map<string, number>;
  private eventBus: EventBusService | null = null;
  private enableEventBus: boolean = false;

  /**
   * 构造函数
   * @param config 通信服务配置
   * @param serviceConfigs 服务配置映射
   */
  constructor(config: Partial<CommunicationServiceConfig> = {}) {
    this.logger = new Logger('CommunicationService', {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false
    });
    this.config = {
      timeout: 5000,
      retryCount: 3,
      retryDelay: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 30000,
      ...config
    };

    this.serviceConfigs = new Map();
    this.circuitBreakerStates = new Map();
    this.failureCounts = new Map();
    this.enableEventBus = config.enableEventBus || false;
    
    // 初始化事件总线
    if (this.enableEventBus) {
      this.eventBus = getEventBus({
        logLevel: this.config.logLevel || LogLevel.INFO
      });
    }
    
    this.logger.info('CommunicationService initialized successfully', this.config);

    // 创建axios实例
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': process.env['SERVICE_NAME'] || 'unknown'
      }
    });

    // 添加请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error(`请求错误: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // 添加响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`收到响应: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error(`响应错误: ${error.message} ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 注册服务配置
   * @param serviceName 服务名称
   * @param baseUrl 服务基础URL
   */
  registerService(serviceName: string, baseUrl: string): void {
    this.serviceConfigs.set(serviceName, baseUrl);
    this.logger.info(`Service registered: ${serviceName} -> ${baseUrl}`, { serviceName, baseUrl });
  }

  /**
   * 发送GET请求
   * @param config 请求配置
   */
  async get<T = any>(config: ServiceRequestConfig): Promise<ServiceResponse<T>> {
    this.logger.debug(`Sending GET request to ${config.serviceName}${config.endpoint}`, { params: config.params });
    return this.sendRequest<T>({ ...config, method: 'GET' });
  }

  /**
   * 发送POST请求
   * @param config 请求配置
   */
  async post<T = any>(config: ServiceRequestConfig): Promise<ServiceResponse<T>> {
    this.logger.debug(`Sending POST request to ${config.serviceName}${config.endpoint}`, { data: config.data });
    return this.sendRequest<T>({ ...config, method: 'POST' });
  }

  /**
   * 发送PUT请求
   * @param config 请求配置
   */
  async put<T = any>(config: ServiceRequestConfig): Promise<ServiceResponse<T>> {
    this.logger.debug(`Sending PUT request to ${config.serviceName}${config.endpoint}`, { data: config.data });
    return this.sendRequest<T>({ ...config, method: 'PUT' });
  }

  /**
   * 发送DELETE请求
   * @param config 请求配置
   */
  async delete<T = any>(config: ServiceRequestConfig): Promise<ServiceResponse<T>> {
    this.logger.debug(`Sending DELETE request to ${config.serviceName}${config.endpoint}`);
    return this.sendRequest<T>({ ...config, method: 'DELETE' });
  }

  /**
   * 发送请求的核心方法
   * @param config 请求配置
   */
  private async sendRequest<T = any>(config: ServiceRequestConfig): Promise<ServiceResponse<T>> {
    const { serviceName, endpoint, requiresAuth = true, ...axiosConfig } = config;
    
    // 检查服务配置是否存在
    const baseUrl = this.serviceConfigs.get(serviceName);
    if (!baseUrl) {
      const errorMsg = `服务 ${serviceName} 未注册`;
      this.logger.error(errorMsg, { serviceName, endpoint });
      throw new Error(errorMsg);
    }

    // 构建完整URL
    const url = `${baseUrl}${endpoint}`;
    
    // 检查断路器状态
    const circuitKey = `${serviceName}${endpoint}`;
    if (this.isCircuitOpen(circuitKey)) {
      const errorMsg = `服务 ${serviceName} 断路器已打开，暂时无法访问`;
      this.logger.warn(errorMsg, { serviceName, endpoint });
      throw new Error(errorMsg);
    }

    // 添加认证信息
    if (requiresAuth) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        'Authorization': this.generateServiceAuthToken()
      };
    }

    let lastError: Error = new Error('请求失败');
    
    // 实现重试机制
    for (let i = 0; i < this.config.retryCount; i++) {
      try {
        const response = await this.axiosInstance.request<T>({
          ...axiosConfig,
          url,
          data: axiosConfig.data
        });

        // 重置失败计数和断路器状态
        this.resetFailureCount(circuitKey);
        
        this.logger.info(`Request successful`, { method: axiosConfig.method, url, status: response.status });
        
        // 发布请求成功事件
        if (this.enableEventBus && this.eventBus) {
          this.eventBus.publish('communication.request.success', {
            method: axiosConfig.method,
            url,
            status: response.status,
            serviceName: config.serviceName,
            endpoint: config.endpoint,
            requestId: this.generateRequestId()
          }, process.env['SERVICE_NAME'] || 'unknown');
        }
        
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        };
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`请求失败 (尝试 ${i + 1}/${this.config.retryCount}): ${error.message}`, { method: axiosConfig.method, url, attempt: i + 1 });
        
        // 更新失败计数和断路器状态
        this.incrementFailureCount(circuitKey);
        
        // 如果不是最后一次尝试，等待后重试
        if (i < this.config.retryCount - 1) {
          const delay = this.config.retryDelay * Math.pow(2, i);
          this.logger.debug(`Retrying after ${delay}ms`, { method: axiosConfig.method, url, delay });
          await this.delay(delay); // 指数退避
        }
      }
    }

    this.logger.error(`Request failed after ${this.config.retryCount} retries`, { method: axiosConfig.method, url, error: lastError.message });
    
    // 发布请求失败事件
    if (this.enableEventBus && this.eventBus) {
      this.eventBus.publish('communication.request.failed', {
        method: axiosConfig.method,
        url,
        error: lastError.message,
        serviceName: config.serviceName,
        endpoint: config.endpoint,
        retryCount: this.config.retryCount,
        requestId: this.generateRequestId()
      }, process.env['SERVICE_NAME'] || 'unknown');
    }
    
    throw lastError;
  }

  /**
   * 生成服务间认证令牌
   */
  private generateServiceAuthToken(): string {
    // 在实际项目中，这里应该实现基于JWT或其他认证机制的令牌生成
    // 为了演示，我们使用一个简单的基于时间戳和密钥的认证方式
    const timestamp = Date.now();
    const secretKey = process.env['SERVICE_SECRET_KEY'] || 'default_secret_key';
    const signature = Buffer.from(`${timestamp}:${secretKey}`).toString('base64');
    return `ServiceToken ${timestamp}:${signature}`;
  }

  /**
   * 检查断路器是否打开
   * @param key 断路器键
   */
  private isCircuitOpen(key: string): boolean {
    const state = this.circuitBreakerStates.get(key);
    if (!state) {
      return false;
    }

    // 如果断路器打开，但超时时间已过，则允许尝试恢复
    if (state.isOpen && Date.now() - state.lastFailure > this.config.circuitBreakerTimeout) {
      this.circuitBreakerStates.set(key, { isOpen: false, lastFailure: state.lastFailure });
      this.logger.info(`Circuit breaker closed for ${key} (timeout expired)`);
      return false;
    }

    return state.isOpen;
  }

  /**
   * 增加失败计数
   * @param key 断路器键
   */
  private incrementFailureCount(key: string): void {
    const count = (this.failureCounts.get(key) || 0) + 1;
    this.failureCounts.set(key, count);
    
    this.logger.debug(`Circuit breaker failures for ${key}: ${count}/${this.config.circuitBreakerThreshold}`);
    
    // 如果失败次数超过阈值，打开断路器
    if (count >= this.config.circuitBreakerThreshold) {
      this.circuitBreakerStates.set(key, { isOpen: true, lastFailure: Date.now() });
      this.logger.warn(`Circuit breaker opened for ${key}`, { failures: count, threshold: this.config.circuitBreakerThreshold });
    }
  }

  /**
   * 重置失败计数
   * @param key 断路器键
   */
  private resetFailureCount(key: string): void {
    this.failureCounts.set(key, 0);
    this.circuitBreakerStates.set(key, { isOpen: false, lastFailure: Date.now() });
    this.logger.debug(`Circuit breaker reset for ${key}`);
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 延迟执行
   * @param ms 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
