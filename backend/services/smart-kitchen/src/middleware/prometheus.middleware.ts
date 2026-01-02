/**
 * @file Prometheus监控中间件
 * @description 收集API性能指标并暴露给Prometheus
 * @module middleware/prometheus
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Gauge, register } from 'prom-client';

// 初始化所有指标
const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const activeRequestsGauge = new Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests',
});

const orderProcessingTimeHistogram = new Histogram({
  name: 'order_processing_time_seconds',
  help: 'Order processing time in seconds',
  labelNames: ['order_type', 'priority'],
});

/**
 * @description Express中间件：收集HTTP请求指标
 */
export const prometheusMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  const route = req.route?.path || req.originalUrl;
  
  activeRequestsGauge.inc();
  
  res.on('finish', () => {
    const duration = process.hrtime(startTime);
    const durationSeconds = duration[0] + duration[1] / 1e9;
    
    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    });
    
    httpRequestDurationHistogram.observe(
      { method: req.method, route, status_code: res.statusCode.toString() },
      durationSeconds
    );
    
    activeRequestsGauge.dec();
  });
  
  next();
};

/**
 * @description 暴露Prometheus指标的路由处理函数
 */
export const metricsHandler = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

/**
 * @description 记录订单处理时间的工具函数
 */
export const recordOrderProcessingTime = (
  orderType: string,
  priority: number,
  startTime: [number, number]
) => {
  const duration = process.hrtime(startTime);
  const durationSeconds = duration[0] + duration[1] / 1e9;
  
  orderProcessingTimeHistogram.observe(
    { order_type: orderType, priority: priority.toString() },
    durationSeconds
  );
};

// 导出指标供其他模块使用
export const metrics = {
  httpRequestCounter,
  httpRequestDurationHistogram,
  activeRequestsGauge,
  orderProcessingTimeHistogram,
};
