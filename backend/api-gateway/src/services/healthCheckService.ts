/**
 * @fileoverview 健康检查服务
 * @description 定期检查所有微服务的健康状态
 * @module services/healthCheckService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import axios from 'axios';
import { serviceRegistry } from '../config/serviceRegistry';
import { logger } from '../config/logger';

/**
 * 健康检查结果接口
 */
export interface HealthCheckResult {
  serviceName: string;
  instanceId: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'timeout';
  responseTime: number;
  timestamp: Date;
  error?: string;
}

/**
 * 健康检查配置接口
 */
export interface HealthCheckConfig {
  /** 检查间隔（毫秒） */
  interval: number;
  /** 超时时间（毫秒） */
  timeout: number;
  /** 是否启用 */
  enabled: boolean;
  /** 失败阈值 */
  failureThreshold: number;
}

/**
 * 健康检查服务类
 */
export class HealthCheckService {
  private config: HealthCheckConfig;
  private checkTimer?: NodeJS.Timeout;
  private failureCount: Map<string, number> = new Map();
  private results: Map<string, HealthCheckResult[]> = new Map();

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = {
      interval: config.interval || 30000, // 默认30秒
      timeout: config.timeout || 5000, // 默认5秒
      enabled: config.enabled !== false,
      failureThreshold: config.failureThreshold || 3, // 默认3次失败
    };
  }

  /**
   * 启动健康检查
   */
  start(): void {
    if (!this.config.enabled) {
      logger.info('健康检查服务未启用');
      return;
    }

    if (this.checkTimer) {
      logger.warn('健康检查服务已在运行');
      return;
    }

    // 立即执行一次检查
    this.checkAllServices();

    // 设置定时检查
    this.checkTimer = setInterval(() => {
      this.checkAllServices();
    }, this.config.interval);

    logger.info('健康检查服务已启动', {
      interval: `${this.config.interval}ms`,
      timeout: `${this.config.timeout}ms`,
    });
  }

  /**
   * 停止健康检查
   */
  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = undefined;
      logger.info('健康检查服务已停止');
    }
  }

  /**
   * 检查所有服务
   */
  private async checkAllServices(): Promise<void> {
    const services = serviceRegistry.getAllServices();

    logger.debug('开始健康检查', { serviceCount: services.length });

    const checkPromises = services.map(serviceName =>
      this.checkService(serviceName)
    );

    await Promise.allSettled(checkPromises);

    logger.debug('健康检查完成');
  }

  /**
   * 检查单个服务
   * @param serviceName 服务名称
   */
  private async checkService(serviceName: string): Promise<void> {
    const instances = serviceRegistry.getAllInstances(serviceName);

    if (instances.length === 0) {
      logger.debug('服务没有实例', { serviceName });
      return;
    }

    const checkPromises = instances.map(instance =>
      this.checkInstance(instance)
    );

    await Promise.allSettled(checkPromises);
  }

  /**
   * 检查服务实例
   * @param instance 服务实例
   */
  private async checkInstance(instance: any): Promise<void> {
    const startTime = Date.now();
    const healthCheckUrl = `${instance.url}/health`;

    try {
      const response = await axios.get(healthCheckUrl, {
        timeout: this.config.timeout,
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        // 健康检查成功
        this.recordSuccess(instance, responseTime);
        logger.debug('健康检查成功', {
          serviceName: instance.name,
          instanceId: instance.id,
          responseTime: `${responseTime}ms`,
        });
      } else {
        // 健康检查失败
        this.recordFailure(instance, `HTTP ${response.status}`);
        logger.warn('健康检查失败', {
          serviceName: instance.name,
          instanceId: instance.id,
          status: response.status,
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // 健康检查异常
      this.recordFailure(instance, errorMessage);
      logger.error('健康检查异常', {
        serviceName: instance.name,
        instanceId: instance.id,
        error: errorMessage,
      });
    }
  }

  /**
   * 记录成功
   * @param instance 服务实例
   * @param responseTime 响应时间
   */
  private recordSuccess(instance: any, responseTime: number): void {
    const key = `${instance.name}-${instance.id}`;
    this.failureCount.set(key, 0);

    const result: HealthCheckResult = {
      serviceName: instance.name,
      instanceId: instance.id,
      url: instance.url,
      status: 'healthy',
      responseTime,
      timestamp: new Date(),
    };

    this.addResult(result);
  }

  /**
   * 记录失败
   * @param instance 服务实例
   * @param error 错误信息
   */
  private recordFailure(instance: any, error: string): void {
    const key = `${instance.name}-${instance.id}`;
    const failures = (this.failureCount.get(key) || 0) + 1;
    this.failureCount.set(key, failures);

    const result: HealthCheckResult = {
      serviceName: instance.name,
      instanceId: instance.id,
      url: instance.url,
      status: 'unhealthy',
      responseTime: this.config.timeout,
      timestamp: new Date(),
      error,
    };

    this.addResult(result);

    // 如果失败次数超过阈值，记录警告
    if (failures >= this.config.failureThreshold) {
      logger.warn('服务健康检查连续失败', {
        serviceName: instance.name,
        instanceId: instance.id,
        failures,
        threshold: this.config.failureThreshold,
      });
    }
  }

  /**
   * 添加检查结果
   * @param result 检查结果
   */
  private addResult(result: HealthCheckResult): void {
    const key = result.serviceName;
    if (!this.results.has(key)) {
      this.results.set(key, []);
    }

    const results = this.results.get(key)!;
    results.push(result);

    // 只保留最近100条记录
    if (results.length > 100) {
      results.shift();
    }
  }

  /**
   * 获取服务的健康检查结果
   * @param serviceName 服务名称
   * @returns 健康检查结果
   */
  getResults(serviceName?: string): HealthCheckResult[] {
    if (serviceName) {
      return this.results.get(serviceName) || [];
    }

    const allResults: HealthCheckResult[] = [];
    this.results.forEach(results => {
      allResults.push(...results);
    });

    return allResults;
  }

  /**
   * 获取服务的健康统计
   * @param serviceName 服务名称
   * @returns 健康统计
   */
  getHealthStats(serviceName?: string): {
    total: number;
    healthy: number;
    unhealthy: number;
    averageResponseTime: number;
  } {
    const results = this.getResults(serviceName);

    if (results.length === 0) {
      return {
        total: 0,
        healthy: 0,
        unhealthy: 0,
        averageResponseTime: 0,
      };
    }

    const healthy = results.filter(r => r.status === 'healthy').length;
    const unhealthy = results.filter(r => r.status === 'unhealthy').length;
    const totalResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0);
    const averageResponseTime = totalResponseTime / results.length;

    return {
      total: results.length,
      healthy,
      unhealthy,
      averageResponseTime: Math.round(averageResponseTime),
    };
  }

  /**
   * 清除检查结果
   * @param serviceName 服务名称
   */
  clearResults(serviceName?: string): void {
    if (serviceName) {
      this.results.delete(serviceName);
      this.failureCount.delete(serviceName);
    } else {
      this.results.clear();
      this.failureCount.clear();
    }
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config };

    // 如果服务正在运行，重启以应用新配置
    if (this.checkTimer) {
      this.stop();
      this.start();
    }

    logger.info('健康检查配置已更新', this.config);
  }
}

// 创建健康检查服务单例
export const healthCheckService = new HealthCheckService({
  interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),
  enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
  failureThreshold: parseInt(process.env.HEALTH_CHECK_FAILURE_THRESHOLD || '3'),
});
