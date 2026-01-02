/**
 * @fileoverview YYC³ API网关监控中间件
 * @description 实现监控指标收集、智能告警和根因分析功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-08
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { MonitoringConfig } from '../types/gateway';
import { logger } from '../utils/logger';

// 监控指标接口
export interface Metrics {
  // 请求指标
  requestCount: number;
  requestCountByMethod: Record<string, number>;
  requestCountByPath: Record<string, number>;
  errorCount: number;
  errorCountByCode: Record<number, number>;
  responseTime: number[];
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // 资源指标
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  uptime: number;
  
  // 告警状态
  activeAlerts: Alert[];
}

// 告警接口
export interface Alert {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'critical';
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  acknowledged: boolean;
  resolved: boolean;
  resolution?: Date;
  rootCause?: string;
  suggestedFix?: string;
}

// 根因分析结果接口
export interface RootCauseAnalysis {
  id: string;
  timestamp: Date;
  issue: string;
  probableCause: string;
  confidence: number;
  relatedMetrics: string[];
  suggestedActions: string[];
  affectedServices: string[];
}

export class MetricsMiddleware {
  private config: MonitoringConfig;
  private metrics: Metrics;
  private alerts: Alert[];
  private rootCauseAnalyses: RootCauseAnalysis[];
  private lastAlertCheck: number;
  private alertCheckInterval: number;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.alerts = [];
    this.rootCauseAnalyses = [];
    this.lastAlertCheck = Date.now();
    this.alertCheckInterval = 60000; // 默认每分钟检查一次告警

    // 启动定时告警检查
    this.startAlertChecker();
  }

  /**
   * 初始化监控指标
   */
  private initializeMetrics(): Metrics {
    return {
      requestCount: 0,
      requestCountByMethod: {},
      requestCountByPath: {},
      errorCount: 0,
      errorCountByCode: {},
      responseTime: [],
      avgResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: 0,
      uptime: process.uptime(),
      activeAlerts: []
    };
  }

  /**
   * 请求监控中间件
   */
  public requestMetrics = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // 增强响应方法以捕获响应状态
    const originalSend = res.send;
    res.send = ((send) => {
      return function (this: Response, body?: any): Response {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        // 更新指标
        this.updateMetrics(req, statusCode, responseTime);

        // 检查是否需要触发告警
        this.checkForAlerts(req, statusCode, responseTime);

        return send.call(this, body);
      };
    })(originalSend.bind(res));

    next();
  };

  /**
   * 更新监控指标
   */
  private updateMetrics(req: Request, statusCode: number, responseTime: number): void {
    // 更新请求计数
    this.metrics.requestCount++;

    // 更新按方法的请求计数
    const method = req.method;
    this.metrics.requestCountByMethod[method] = (this.metrics.requestCountByMethod[method] || 0) + 1;

    // 更新按路径的请求计数
    const path = req.path;
    this.metrics.requestCountByPath[path] = (this.metrics.requestCountByPath[path] || 0) + 1;

    // 更新错误计数
    if (statusCode >= 400) {
      this.metrics.errorCount++;
      this.metrics.errorCountByCode[statusCode] = (this.metrics.errorCountByCode[statusCode] || 0) + 1;
    }

    // 更新响应时间指标
    this.metrics.responseTime.push(responseTime);
    if (this.metrics.responseTime.length > 1000) {
      // 只保留最近的1000个响应时间
      this.metrics.responseTime.shift();
    }

    // 更新响应时间统计
    this.updateResponseTimeStats();

    // 更新资源指标
    this.updateResourceMetrics();
  }

  /**
   * 更新响应时间统计
   */
  private updateResponseTimeStats(): void {
    const times = this.metrics.responseTime;
    if (times.length === 0) return;

    // 计算平均值
    this.metrics.avgResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length;

    // 计算最大值和最小值
    this.metrics.maxResponseTime = Math.max(...times);
    this.metrics.minResponseTime = Math.min(...times);

    // 计算P95和P99
    const sortedTimes = [...times].sort((a, b) => a - b);
    this.metrics.p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    this.metrics.p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  }

  /**
   * 更新资源指标
   */
  private updateResourceMetrics(): void {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.uptime = process.uptime();
    
    // TODO: 实现CPU使用率监控
    // this.metrics.cpuUsage = ...;
  }

  /**
   * 检查是否需要触发告警
   */
  private checkForAlerts(req: Request, statusCode: number, responseTime: number): void {
    const now = Date.now();
    
    // 避免过于频繁的告警检查
    if (now - this.lastAlertCheck < this.alertCheckInterval) {
      return;
    }

    this.lastAlertCheck = now;

    // 检查错误率
    this.checkErrorRateAlert();

    // 检查响应时间
    this.checkResponseTimeAlert();

    // 检查资源使用情况
    this.checkResourceUsageAlert();

    // 更新活跃告警列表
    this.metrics.activeAlerts = this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * 检查错误率告警
   */
  private checkErrorRateAlert(): void {
    if (this.metrics.requestCount === 0) return;

    const errorRate = this.metrics.errorCount / this.metrics.requestCount;
    const errorRateThreshold = 0.1; // 10%错误率阈值

    if (errorRate > errorRateThreshold) {
      this.createAlert(
        'error_rate',
        'warn',
        errorRateThreshold,
        errorRate,
        `错误率过高: ${(errorRate * 100).toFixed(2)}%`
      );
    }
  }

  /**
   * 检查响应时间告警
   */
  private checkResponseTimeAlert(): void {
    const responseTimeThreshold = 2000; // 2秒阈值

    if (this.metrics.avgResponseTime > responseTimeThreshold) {
      this.createAlert(
        'avg_response_time',
        'warn',
        responseTimeThreshold,
        this.metrics.avgResponseTime,
        `平均响应时间过高: ${this.metrics.avgResponseTime.toFixed(2)}ms`
      );
    }

    if (this.metrics.p99ResponseTime > responseTimeThreshold * 2) {
      this.createAlert(
        'p99_response_time',
        'error',
        responseTimeThreshold * 2,
        this.metrics.p99ResponseTime,
        `P99响应时间过高: ${this.metrics.p99ResponseTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * 检查资源使用情况告警
   */
  private checkResourceUsageAlert(): void {
    const memoryUsage = this.metrics.memoryUsage;
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const memoryThreshold = 80; // 80%内存使用率阈值

    if (memoryUsagePercent > memoryThreshold) {
      this.createAlert(
        'memory_usage',
        'warn',
        memoryThreshold,
        memoryUsagePercent,
        `内存使用率过高: ${memoryUsagePercent.toFixed(2)}%`
      );
    }
  }

  /**
   * 创建告警
   */
  private createAlert(
    metric: string,
    level: 'info' | 'warn' | 'error' | 'critical',
    threshold: number,
    currentValue: number,
    message: string
  ): void {
    // 检查是否已有相同类型的未解决告警
    const existingAlert = this.alerts.find(
      alert => alert.metric === metric && alert.level === level && !alert.resolved
    );

    if (existingAlert) {
      // 更新现有告警
      existingAlert.currentValue = currentValue;
      existingAlert.timestamp = new Date();
      return;
    }

    // 创建根因分析
    const rootCause = this.performRootCauseAnalysis(metric, currentValue);

    // 创建新告警
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      metric,
      threshold,
      currentValue,
      message,
      acknowledged: false,
      resolved: false,
      rootCause: rootCause.probableCause,
      suggestedFix: rootCause.suggestedActions.join('; ')
    };

    this.alerts.push(alert);

    // 记录告警日志
    logger.log(level, message, { alert });

    // 记录根因分析
    this.rootCauseAnalyses.push(rootCause);
  }

  /**
   * 执行根因分析
   */
  private performRootCauseAnalysis(metric: string, currentValue: number): RootCauseAnalysis {
    let analysis: RootCauseAnalysis = {
      id: `rca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      issue: `${metric} 超出阈值`,
      probableCause: '未知原因',
      confidence: 0.5,
      relatedMetrics: [metric],
      suggestedActions: ['进一步分析系统日志'],
      affectedServices: ['gateway']
    };

    // 根据不同指标进行根因分析
    switch (metric) {
      case 'error_rate':
        analysis = this.analyzeHighErrorRate();
        break;
      case 'avg_response_time':
      case 'p99_response_time':
        analysis = this.analyzeHighResponseTime();
        break;
      case 'memory_usage':
        analysis = this.analyzeHighMemoryUsage();
        break;
      default:
        break;
    }

    return analysis;
  }

  /**
   * 分析高错误率根因
   */
  private analyzeHighErrorRate(): RootCauseAnalysis {
    // 找出最常见的错误码
    const mostCommonErrorCode = Object.entries(this.metrics.errorCountByCode)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    // 找出错误率最高的路径
    const errorRateByPath = Object.entries(this.metrics.requestCountByPath)
      .map(([path, count]) => {
        const errorCount = this.alerts
          .filter(a => a.metric.includes(path) && a.level === 'error')
          .length;
        return { path, errorRate: errorCount / count };
      })
      .sort((a, b) => b.errorRate - a.errorRate);

    const highestErrorPath = errorRateByPath[0]?.path;

    return {
      id: `rca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      issue: '高错误率',
      probableCause: mostCommonErrorCode 
        ? `错误码 ${mostCommonErrorCode} 出现频率过高` 
        : '多个路径同时出现错误',
      confidence: 0.75,
      relatedMetrics: ['errorCount', 'errorCountByCode', 'requestCountByPath'],
      suggestedActions: [
        `检查错误码 ${mostCommonErrorCode} 相关的业务逻辑`,
        `分析路径 ${highestErrorPath} 的请求处理逻辑`,
        '查看应用日志以获取更详细的错误信息',
        '检查依赖服务的可用性'
      ],
      affectedServices: ['gateway', highestErrorPath?.split('/')[3] || 'unknown']
    };
  }

  /**
   * 分析高响应时间根因
   */
  private analyzeHighResponseTime(): RootCauseAnalysis {
    // 找出响应时间最长的路径
    const responseTimeByPath = Object.entries(this.metrics.requestCountByPath)
      .map(([path, count]) => {
        // 这里简化处理，实际应该计算每个路径的平均响应时间
        return { path, requestCount: count };
      })
      .sort((a, b) => b.requestCount - a.requestCount);

    const busiestPath = responseTimeByPath[0]?.path;

    return {
      id: `rca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      issue: '高响应时间',
      probableCause: busiestPath 
        ? `路径 ${busiestPath} 请求量过大导致响应延迟` 
        : '系统资源不足或依赖服务响应缓慢',
      confidence: 0.7,
      relatedMetrics: ['avgResponseTime', 'p95ResponseTime', 'p99ResponseTime', 'requestCountByPath'],
      suggestedActions: [
        `优化路径 ${busiestPath} 的请求处理逻辑`,
        '检查系统CPU和内存使用情况',
        '分析依赖服务的响应时间',
        '考虑增加系统资源或优化缓存策略'
      ],
      affectedServices: ['gateway', busiestPath?.split('/')[3] || 'unknown']
    };
  }

  /**
   * 分析高内存使用率根因
   */
  private analyzeHighMemoryUsage(): RootCauseAnalysis {
    const memoryUsage = this.metrics.memoryUsage;
    const memoryLeakIndicators = memoryUsage.heapUsed > memoryUsage.heapTotal * 0.8;

    return {
      id: `rca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      issue: '高内存使用率',
      probableCause: memoryLeakIndicators 
        ? '可能存在内存泄漏' 
        : '系统负载过高导致内存使用增加',
      confidence: 0.6,
      relatedMetrics: ['memoryUsage', 'requestCount', 'responseTime'],
      suggestedActions: [
        '检查是否存在未释放的资源（如数据库连接、文件句柄）',
        '分析内存快照以查找泄漏源',
        '优化数据处理逻辑，避免一次性加载大量数据',
        '考虑增加系统内存或实施自动扩展'
      ],
      affectedServices: ['gateway']
    };
  }

  /**
   * 启动定时告警检查器
   */
  private startAlertChecker(): void {
    setInterval(() => {
      this.checkForAlerts(null as any, 0, 0);
    }, this.alertCheckInterval);
  }

  /**
   * 获取当前监控指标
   */
  public async getMetrics(): Promise<string> {
    // 更新资源指标
    this.updateResourceMetrics();

    // 生成Prometheus格式的指标
    let prometheusMetrics = '';

    // 请求计数指标
    prometheusMetrics += `# HELP gateway_requests_total Total number of requests\n`;
    prometheusMetrics += `# TYPE gateway_requests_total counter\n`;
    prometheusMetrics += `gateway_requests_total{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}"} ${this.metrics.requestCount}\n`;

    // 按方法的请求计数
    Object.entries(this.metrics.requestCountByMethod).forEach(([method, count]) => {
      prometheusMetrics += `gateway_requests_total{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}",method="${method}"} ${count}\n`;
    });

    // 错误计数
    prometheusMetrics += `\n# HELP gateway_errors_total Total number of errors\n`;
    prometheusMetrics += `# TYPE gateway_errors_total counter\n`;
    prometheusMetrics += `gateway_errors_total{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}"} ${this.metrics.errorCount}\n`;

    // 平均响应时间
    prometheusMetrics += `\n# HELP gateway_response_time_seconds Average response time in seconds\n`;
    prometheusMetrics += `# TYPE gateway_response_time_seconds gauge\n`;
    prometheusMetrics += `gateway_response_time_seconds{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}"} ${this.metrics.avgResponseTime / 1000}\n`;

    // P95响应时间
    prometheusMetrics += `\n# HELP gateway_response_time_p95_seconds P95 response time in seconds\n`;
    prometheusMetrics += `# TYPE gateway_response_time_p95_seconds gauge\n`;
    prometheusMetrics += `gateway_response_time_p95_seconds{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}"} ${this.metrics.p95ResponseTime / 1000}\n`;

    // P99响应时间
    prometheusMetrics += `\n# HELP gateway_response_time_p99_seconds P99 response time in seconds\n`;
    prometheusMetrics += `# TYPE gateway_response_time_p99_seconds gauge\n`;
    prometheusMetrics += `gateway_response_time_p99_seconds{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}"} ${this.metrics.p99ResponseTime / 1000}\n`;

    // 内存使用
    prometheusMetrics += `\n# HELP gateway_memory_usage_bytes Memory usage in bytes\n`;
    prometheusMetrics += `# TYPE gateway_memory_usage_bytes gauge\n`;
    prometheusMetrics += `gateway_memory_usage_bytes{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}",type="heap_used"} ${this.metrics.memoryUsage.heapUsed}\n`;
    prometheusMetrics += `gateway_memory_usage_bytes{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}",type="heap_total"} ${this.metrics.memoryUsage.heapTotal}\n`;
    prometheusMetrics += `gateway_memory_usage_bytes{service="${this.config.metrics?.labels?.service || 'yyc3-gateway'}",version="${this.config.metrics?.labels?.version || '1.0.0'}",type="rss"} ${this.metrics.memoryUsage.rss}\n`;

    return prometheusMetrics;
  }

  /**
   * 获取活跃告警
   */
  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * 获取所有告警
   */
  public getAllAlerts(): Alert[] {
    return this.alerts;
  }

  /**
   * 确认告警
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * 解决告警
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolution = new Date();
      return true;
    }
    return false;
  }

  /**
   * 获取根因分析结果
   */
  public getRootCauseAnalyses(): RootCauseAnalysis[] {
    return this.rootCauseAnalyses;
  }
}
