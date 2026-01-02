/**
 * @fileoverview YYC³ API网关熔断器中间件
 * @description 实现基于状态机的熔断器模式，防止服务雪崩
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-08
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { CircuitBreakerState, RouteConfig } from '../types/gateway';

export class CircuitBreakerMiddleware {
  private circuitBreakers: Map<string, CircuitBreakerState>;
  private failureThreshold: number;
  private resetTimeout: number;

  constructor() {
    this.circuitBreakers = new Map();
    this.failureThreshold = 5; // 默认失败阈值
    this.resetTimeout = 60000; // 默认重置超时时间（60秒）
  }

  /**
   * 创建针对特定服务的熔断器中间件
   * @param serviceUrl 服务URL
   * @param config 熔断器配置
   */
  createCircuitBreaker(serviceUrl: string, config?: { enabled?: boolean; threshold?: number; timeout?: number }) {
    // 如果熔断器未启用，直接返回next
    if (config?.enabled === false) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    // 获取配置的阈值和超时时间，使用默认值如果未提供
    const threshold = config?.threshold || this.failureThreshold;
    const timeout = config?.timeout || this.resetTimeout;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const circuitState = this.getCircuitState(serviceUrl);

        // 根据熔断器状态决定请求处理方式
        switch (circuitState.state) {
          case 'closed':
            // 熔断器关闭，正常处理请求
            await this.handleClosedState(serviceUrl, threshold, timeout, req, res, next);
            break;
          case 'open':
            // 熔断器打开，检查是否可以尝试半开状态
            if (this.canAttemptHalfOpen(circuitState, timeout)) {
              // 转换为半开状态并尝试请求
              await this.handleHalfOpenState(serviceUrl, threshold, timeout, req, res, next);
            } else {
              // 返回服务不可用
              this.handleServiceUnavailable(res, serviceUrl);
            }
            break;
          case 'half-open':
            // 熔断器半开，尝试请求
            await this.handleHalfOpenState(serviceUrl, threshold, timeout, req, res, next);
            break;
          default:
            // 默认处理
            next();
        }
      } catch (error) {
        console.error('Circuit breaker error:', error);
        // 发生错误时，确保熔断器状态正确
        this.recordFailure(serviceUrl);
        next(error);
      }
    };
  }

  /**
   * 处理熔断器关闭状态的请求
   */
  private async handleClosedState(
    serviceUrl: string,
    threshold: number,
    timeout: number,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // 保存原始的res.send方法，用于捕获响应状态
      const originalSend = res.send;
      let statusCode: number;

      // 重写res.send方法以捕获状态码
      res.send = function (this: Response, body: any) {
        statusCode = this.statusCode;
        return originalSend.call(this, body);
      } as typeof res.send;

      // 调用下一个中间件（通常是代理）
      await next();

      // 检查响应状态码，如果是5xx错误，记录失败
      if (statusCode && statusCode >= 500) {
        this.recordFailure(serviceUrl);
        // 检查是否达到阈值，转换为打开状态
        this.checkThresholdAndOpen(serviceUrl, threshold, timeout);
      } else {
        // 成功响应，重置失败计数
        this.resetCircuit(serviceUrl);
      }
    } catch (error) {
      // 请求处理失败，记录失败
      this.recordFailure(serviceUrl);
      this.checkThresholdAndOpen(serviceUrl, threshold, timeout);
      throw error;
    }
  }

  /**
   * 处理熔断器半开状态的请求
   */
  private async handleHalfOpenState(
    serviceUrl: string,
    threshold: number,
    timeout: number,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // 保存原始的res.send方法
      const originalSend = res.send;
      let statusCode: number;

      res.send = function (this: Response, body: any) {
        statusCode = this.statusCode;
        return originalSend.call(this, body);
      } as typeof res.send;

      // 尝试请求
      await next();

      // 检查响应状态码
      if (statusCode && statusCode >= 500) {
        // 请求失败，转换为打开状态
        this.openCircuit(serviceUrl, timeout);
      } else {
        // 请求成功，转换为关闭状态
        this.resetCircuit(serviceUrl);
      }
    } catch (error) {
      // 请求失败，转换为打开状态
      this.openCircuit(serviceUrl, timeout);
      throw error;
    }
  }

  /**
   * 处理服务不可用的情况
   */
  private handleServiceUnavailable(res: Response, serviceUrl: string) {
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
      message: `Circuit breaker is open for ${serviceUrl}`,
      retryAfter: this.resetTimeout / 1000
    });
  }

  /**
   * 获取服务的熔断器状态
   */
  private getCircuitState(serviceUrl: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(serviceUrl)) {
      this.circuitBreakers.set(serviceUrl, {
        state: 'closed',
        failures: 0
      });
    }
    return this.circuitBreakers.get(serviceUrl)!;
  }

  /**
   * 记录失败
   */
  private recordFailure(serviceUrl: string) {
    const state = this.getCircuitState(serviceUrl);
    state.failures++;
    state.lastFailureTime = new Date();
  }

  /**
   * 重置熔断器
   */
  private resetCircuit(serviceUrl: string) {
    this.circuitBreakers.set(serviceUrl, {
      state: 'closed',
      failures: 0
    });
  }

  /**
   * 打开熔断器
   */
  private openCircuit(serviceUrl: string, timeout: number) {
    const state = this.getCircuitState(serviceUrl);
    state.state = 'open';
    state.nextAttempt = new Date(Date.now() + timeout);
  }

  /**
   * 检查是否达到阈值并打开熔断器
   */
  private checkThresholdAndOpen(serviceUrl: string, threshold: number, timeout: number) {
    const state = this.getCircuitState(serviceUrl);
    if (state.failures >= threshold) {
      this.openCircuit(serviceUrl, timeout);
    }
  }

  /**
   * 检查是否可以尝试半开状态
   */
  private canAttemptHalfOpen(state: CircuitBreakerState, timeout: number): boolean {
    if (state.state !== 'open' || !state.nextAttempt) {
      return false;
    }
    return new Date() >= state.nextAttempt;
  }

  /**
   * 获取所有服务的状态
   */
  async getServicesStatus() {
    const servicesStatus: Array<{
      service: string;
      circuitState: CircuitBreakerState;
      lastChecked: Date;
    }> = [];

    for (const [serviceUrl, state] of this.circuitBreakers.entries()) {
      servicesStatus.push({
        service: serviceUrl,
        circuitState: state,
        lastChecked: new Date()
      });
    }

    return servicesStatus;
  }
}
