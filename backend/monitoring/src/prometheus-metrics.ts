/**
 * @file Prometheus指标导出器
 * @description 提供应用程序指标收集和导出功能
 * @module monitoring
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Registry, Counter, Histogram, Gauge, Summary, collectDefaultMetrics } from 'prom-client';
import { logger } from '../libs/logger';

/**
 * Prometheus配置
 */
export interface PrometheusConfig {
  /** 默认标签 */
  defaultLabels?: Record<string, string>;
  /** 是否收集默认指标 */
  collectDefaultMetrics?: boolean;
  /** 指标前缀 */
  prefix?: string;
  /** 端口 */
  port?: number;
  /** 路径 */
  path?: string;
}

/**
 * HTTP请求指标
 */
interface HttpRequestMetrics {
  /** 请求计数器 */
  counter: Counter<string>;
  /** 请求持续时间直方图 */
  histogram: Histogram<string>;
  /** 请求持续时间摘要 */
  summary: Summary<string>;
}

/**
 * 数据库操作指标
 */
interface DatabaseMetrics {
  /** 查询计数器 */
  counter: Counter<string>;
  /** 查询持续时间直方图 */
  histogram: Histogram<string>;
  /** 活跃连接数 */
  activeConnections: Gauge<string>;
  /** 空闲连接数 */
  idleConnections: Gauge<string>;
}

/**
 * 业务指标
 */
interface BusinessMetrics {
  /** 订单计数器 */
  orderCounter: Counter<string>;
  /** 订单金额直方图 */
  orderAmountHistogram: Histogram<string>;
  /** 用户计数器 */
  userCounter: Counter<string>;
  /** 活跃会话数 */
  activeSessions: Gauge<string>;
}

/**
 * Prometheus指标管理器
 */
export class PrometheusMetricsManager {
  private registry: Registry;
  private config: PrometheusConfig;
  private httpRequestMetrics: HttpRequestMetrics;
  private databaseMetrics: DatabaseMetrics;
  private businessMetrics: BusinessMetrics;

  constructor(config: PrometheusConfig = {}) {
    this.config = {
      collectDefaultMetrics: true,
      prefix: 'yyc3_catering',
      port: 9090,
      path: '/metrics',
      ...config,
    };

    this.registry = new Registry();

    // 设置默认标签
    if (this.config.defaultLabels) {
      this.registry.setDefaultLabels(this.config.defaultLabels);
    }

    // 收集默认指标
    if (this.config.collectDefaultMetrics) {
      collectDefaultMetrics({
        register: this.registry,
        prefix: this.config.prefix,
      });
    }

    // 初始化指标
    this.initializeMetrics();

    logger.info('Prometheus metrics manager initialized', {
      prefix: this.config.prefix,
      port: this.config.port,
      path: this.config.path,
    });
  }

  /**
   * 初始化指标
   */
  private initializeMetrics(): void {
    const prefix = this.config.prefix!;

    // HTTP请求指标
    this.httpRequestMetrics = {
      counter: new Counter({
        name: `${prefix}_http_requests_total`,
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'path', 'status_code'],
        registers: [this.registry],
      }),
      histogram: new Histogram({
        name: `${prefix}_http_request_duration_seconds`,
        help: 'HTTP request duration in seconds',
        labelNames: ['method', 'path', 'status_code'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry],
      }),
      summary: new Summary({
        name: `${prefix}_http_request_duration_summary`,
        help: 'HTTP request duration summary',
        labelNames: ['method', 'path', 'status_code'],
        percentiles: [0.5, 0.9, 0.95, 0.99],
        registers: [this.registry],
      }),
    };

    // 数据库操作指标
    this.databaseMetrics = {
      counter: new Counter({
        name: `${prefix}_database_queries_total`,
        help: 'Total number of database queries',
        labelNames: ['operation', 'table', 'status'],
        registers: [this.registry],
      }),
      histogram: new Histogram({
        name: `${prefix}_database_query_duration_seconds`,
        help: 'Database query duration in seconds',
        labelNames: ['operation', 'table'],
        buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
        registers: [this.registry],
      }),
      activeConnections: new Gauge({
        name: `${prefix}_database_active_connections`,
        help: 'Number of active database connections',
        registers: [this.registry],
      }),
      idleConnections: new Gauge({
        name: `${prefix}_database_idle_connections`,
        help: 'Number of idle database connections',
        registers: [this.registry],
      }),
    };

    // 业务指标
    this.businessMetrics = {
      orderCounter: new Counter({
        name: `${prefix}_orders_total`,
        help: 'Total number of orders',
        labelNames: ['status', 'payment_method'],
        registers: [this.registry],
      }),
      orderAmountHistogram: new Histogram({
        name: `${prefix}_order_amount`,
        help: 'Order amount distribution',
        labelNames: ['status'],
        buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
        registers: [this.registry],
      }),
      userCounter: new Counter({
        name: `${prefix}_users_total`,
        help: 'Total number of users',
        labelNames: ['action'],
        registers: [this.registry],
      }),
      activeSessions: new Gauge({
        name: `${prefix}_active_sessions`,
        help: 'Number of active user sessions',
        registers: [this.registry],
      }),
    };
  }

  /**
   * 记录HTTP请求
   */
  public recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    const labels = {
      method,
      path: this.normalizePath(path),
      status_code: statusCode.toString(),
    };

    this.httpRequestMetrics.counter.inc(labels);
    this.httpRequestMetrics.histogram.observe(labels, duration);
    this.httpRequestMetrics.summary.observe(labels, duration);
  }

  /**
   * 记录数据库查询
   */
  public recordDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    status: 'success' | 'error'
  ): void {
    this.databaseMetrics.counter.inc({ operation, table, status });
    this.databaseMetrics.histogram.observe({ operation, table }, duration);
  }

  /**
   * 更新数据库连接数
   */
  public updateDatabaseConnections(active: number, idle: number): void {
    this.databaseMetrics.activeConnections.set(active);
    this.databaseMetrics.idleConnections.set(idle);
  }

  /**
   * 记录订单
   */
  public recordOrder(
    status: string,
    paymentMethod: string,
    amount: number
  ): void {
    this.businessMetrics.orderCounter.inc({ status, payment_method: paymentMethod });
    this.businessMetrics.orderAmountHistogram.observe({ status }, amount);
  }

  /**
   * 记录用户操作
   */
  public recordUserAction(action: 'register' | 'login' | 'logout'): void {
    this.businessMetrics.userCounter.inc({ action });
  }

  /**
   * 更新活跃会话数
   */
  public updateActiveSessions(count: number): void {
    this.businessMetrics.activeSessions.set(count);
  }

  /**
   * 创建自定义计数器
   */
  public createCounter(name: string, help: string, labelNames?: string[]): Counter<string> {
    const fullName = `${this.config.prefix}_${name}`;
    return new Counter({
      name: fullName,
      help,
      labelNames,
      registers: [this.registry],
    });
  }

  /**
   * 创建自定义直方图
   */
  public createHistogram(
    name: string,
    help: string,
    labelNames?: string[],
    buckets?: number[]
  ): Histogram<string> {
    const fullName = `${this.config.prefix}_${name}`;
    return new Histogram({
      name: fullName,
      help,
      labelNames,
      buckets,
      registers: [this.registry],
    });
  }

  /**
   * 创建自定义仪表盘
   */
  public createGauge(name: string, help: string, labelNames?: string[]): Gauge<string> {
    const fullName = `${this.config.prefix}_${name}`;
    return new Gauge({
      name: fullName,
      help,
      labelNames,
      registers: [this.registry],
    });
  }

  /**
   * 获取指标数据
   */
  public async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  /**
   * 获取注册表
   */
  public getRegistry(): Registry {
    return this.registry;
  }

  /**
   * 清空所有指标
   */
  public clearMetrics(): void {
    this.registry.clear();
    this.initializeMetrics();
    logger.info('Metrics cleared');
  }

  /**
   * 规范化路径
   */
  private normalizePath(path: string): string {
    // 将动态路径参数替换为占位符
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[^/]+@\w+\.\w+/g, '/:email');
  }

  /**
   * 获取HTTP请求指标
   */
  public getHttpRequestMetrics(): HttpRequestMetrics {
    return this.httpRequestMetrics;
  }

  /**
   * 获取数据库指标
   */
  public getDatabaseMetrics(): DatabaseMetrics {
    return this.databaseMetrics;
  }

  /**
   * 获取业务指标
   */
  public getBusinessMetrics(): BusinessMetrics {
    return this.businessMetrics;
  }
}

/**
 * Prometheus指标管理器工厂
 */
export class PrometheusMetricsManagerFactory {
  private static instance: PrometheusMetricsManager;

  /**
   * 获取单例实例
   */
  static getInstance(config?: PrometheusConfig): PrometheusMetricsManager {
    if (!this.instance) {
      this.instance = new PrometheusMetricsManager(config);
    }
    return this.instance;
  }

  /**
   * 重置实例
   */
  static reset(): void {
    this.instance = undefined as any;
  }
}

/**
 * Express中间件
 */
export function prometheusMiddleware(metricsManager: PrometheusMetricsManager) {
  return (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // 转换为秒
      metricsManager.recordHttpRequest(
        req.method,
        req.path,
        res.statusCode,
        duration
      );
    });

    next();
  };
}
