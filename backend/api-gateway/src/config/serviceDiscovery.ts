/**
 * @file 服务发现配置
 * @description 管理所有微服务的URL配置
 * @module config/serviceDiscovery
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 定义服务类型
export interface ServiceConfig {
  url: string;
  timeout: number;
}

// 服务配置映射
export const services: Record<string, ServiceConfig> = {
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3201',
    timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },
  restaurant: {
    url: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3202',
    timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },
  order: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3203',
    timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },
  payment: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3204',
    timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },
  delivery: {
    url: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3205',
    timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },
  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3206',
    timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3207',
    timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
  },
};

/**
 * 获取服务配置
 * @param serviceName 服务名称
 * @returns 服务配置
 */
export const getServiceConfig = (serviceName: string): ServiceConfig => {
  if (!services[serviceName]) {
    throw new Error(`Service ${serviceName} not found in service discovery`);
  }
  return services[serviceName];
};