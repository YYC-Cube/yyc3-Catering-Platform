/**
 * @file 服务配置
 * @description 配置所有后端服务的URL和参数
 * @module config/services
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

/**
 * 服务配置接口
 */
export interface ServiceConfig {
  url: string;
  timeout: number;
  retryCount: number;
}

/**
 * 服务配置对象
 */
export const servicesConfig: Record<string, ServiceConfig> = {
  userService: {
    url: process.env['USER_SERVICE_URL'] || 'http://localhost:3201',
    timeout: 30000,
    retryCount: 3,
  },
  restaurantService: {
    url: process.env['RESTAURANT_SERVICE_URL'] || 'http://localhost:3202',
    timeout: 30000,
    retryCount: 3,
  },
  orderService: {
    url: process.env['ORDER_SERVICE_URL'] || 'http://localhost:3203',
    timeout: 30000,
    retryCount: 3,
  },
  paymentService: {
    url: process.env['PAYMENT_SERVICE_URL'] || 'http://localhost:3204',
    timeout: 30000,
    retryCount: 3,
  },
  notificationService: {
    url: process.env['NOTIFICATION_SERVICE_URL'] || 'http://localhost:3205',
    timeout: 30000,
    retryCount: 3,
  },
  analyticsService: {
    url: process.env['ANALYTICS_SERVICE_URL'] || 'http://localhost:3303',
    timeout: 30000,
    retryCount: 3,
  },
};

/**
 * 获取服务配置
 * @param serviceName 服务名称
 * @returns ServiceConfig
 */
export function getServiceConfig(serviceName: string): ServiceConfig {
  if (!servicesConfig[serviceName]) {
    throw new Error(`服务配置不存在: ${serviceName}`);
  }
  return servicesConfig[serviceName];
}
