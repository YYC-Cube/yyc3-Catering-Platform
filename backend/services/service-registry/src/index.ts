/**
 * @file 服务注册与发现模块入口
 * @description 导出服务注册与发现相关的所有功能
 * @module service-registry
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 导出Consul客户端
export {
  ConsulClient,
  ConsulClientFactory,
  ConsulConfig,
  ServiceRegistration,
  HealthCheck,
  ServiceInstance,
} from './consul-client';

// 导出服务注册管理器
export {
  ServiceRegistryManager,
  ServiceRegistryManagerFactory,
  ServiceConfig,
} from './service-registry-manager';

// 导出服务发现客户端
export {
  ServiceDiscoveryClient,
  ServiceDiscoveryClientFactory,
  ServiceDiscoveryConfig,
  LoadBalancingStrategy,
} from './service-discovery-client';

/**
 * 快速初始化服务注册
 */
export const initServiceRegistry = async (config: ServiceConfig): Promise<boolean> => {
  const manager = ServiceRegistryManagerFactory.getInstance();
  return await manager.registerService(config);
};

/**
 * 快速初始化服务发现
 */
export const initServiceDiscovery = (
  serviceName: string,
  strategy?: LoadBalancingStrategy
): ServiceDiscoveryClient => {
  return ServiceDiscoveryClientFactory.getOrCreate(serviceName, { strategy });
};

/**
 * 快速调用服务
 */
export const callService = async <T = any>(
  serviceName: string,
  path: string,
  options?: RequestInit
): Promise<T> => {
  const client = ServiceDiscoveryClientFactory.getOrCreate(serviceName);
  return await client.callService<T>(path, options);
};
