/**
 * @file 服务注册与发现使用示例
 * @description 演示如何在微服务中使用服务注册与发现功能
 * @module service-registry/examples
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { initServiceRegistry, initServiceDiscovery, callService } from '../src';

/**
 * 示例1: 注册服务
 */
async function example1_registerService() {
  console.log('=== 示例1: 注册服务 ===');

  const success = await initServiceRegistry({
    id: 'order-service-1',
    name: 'order-service',
    address: '192.168.1.100',
    port: 3001,
    tags: ['microservice', 'order'],
    meta: {
      version: '1.0.0',
      environment: 'production',
    },
    check: {
      http: 'http://192.168.1.100:3001/health',
      interval: '10s',
      timeout: '5s',
    },
  });

  console.log('服务注册结果:', success);
}

/**
 * 示例2: 使用服务发现调用其他服务
 */
async function example2_serviceDiscovery() {
  console.log('=== 示例2: 服务发现 ===');

  // 初始化服务发现客户端
  const discoveryClient = initServiceDiscovery('user-service', 'round-robin');

  // 获取服务实例
  const instance = await discoveryClient.getInstance();
  console.log('获取到的服务实例:', instance);

  // 调用服务
  const userData = await discoveryClient.callService('/api/users/123', {
    method: 'GET',
  });
  console.log('用户数据:', userData);

  // 获取统计信息
  const stats = discoveryClient.getStats();
  console.log('服务统计信息:', stats);
}

/**
 * 示例3: 快速调用服务
 */
async function example3_quickCall() {
  console.log('=== 示例3: 快速调用服务 ===');

  try {
    const result = await callService('product-service', '/api/products', {
      method: 'GET',
    });
    console.log('产品列表:', result);
  } catch (error) {
    console.error('调用失败:', error.message);
  }
}

/**
 * 示例4: 订单服务完整示例
 */
class OrderService {
  private serviceName = 'order-service';
  private discoveryClient: any;

  constructor() {
    // 初始化服务发现
    this.discoveryClient = initServiceDiscovery('user-service', 'least-connections');
  }

  /**
   * 创建订单
   */
  async createOrder(userId: string, productIds: string[]) {
    console.log('创建订单:', { userId, productIds });

    // 1. 调用用户服务验证用户
    const user = await this.discoveryClient.callService(`/api/users/${userId}`, {
      method: 'GET',
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 调用产品服务获取产品信息
    const products = await callService('product-service', '/api/products', {
      method: 'POST',
      body: JSON.stringify({ ids: productIds }),
      headers: { 'Content-Type': 'application/json' },
    });

    // 3. 计算订单金额
    const totalAmount = products.reduce((sum: number, p: any) => sum + p.price, 0);

    // 4. 创建订单
    const order = {
      id: `order-${Date.now()}`,
      userId,
      products,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('订单创建成功:', order);
    return order;
  }

  /**
   * 获取订单统计信息
   */
  getStats() {
    return this.discoveryClient.getStats();
  }
}

/**
 * 示例5: 不同负载均衡策略对比
 */
async function example5_loadBalancingStrategies() {
  console.log('=== 示例5: 负载均衡策略对比 ===');

  const strategies = ['random', 'round-robin', 'least-connections', 'weighted'];

  for (const strategy of strategies) {
    console.log(`\n使用策略: ${strategy}`);

    const client = initServiceDiscovery('user-service', strategy as any);

    // 模拟多次请求
    for (let i = 0; i < 5; i++) {
      try {
        const instance = await client.getInstance();
        console.log(`  请求 ${i + 1}: ${instance.Address}:${instance.Port}`);
      } catch (error) {
        console.log(`  请求 ${i + 1}: 失败 - ${error.message}`);
      }
    }
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 示例1: 注册服务
    await example1_registerService();

    console.log('\n');

    // 示例2: 服务发现
    await example2_serviceDiscovery();

    console.log('\n');

    // 示例3: 快速调用
    await example3_quickCall();

    console.log('\n');

    // 示例4: 订单服务
    const orderService = new OrderService();
    const order = await orderService.createOrder('user-123', ['prod-1', 'prod-2']);
    console.log('\n订单服务统计:', orderService.getStats());

    console.log('\n');

    // 示例5: 负载均衡策略
    await example5_loadBalancingStrategies();
  } catch (error) {
    console.error('示例执行失败:', error);
  }
}

// 运行示例
if (require.main === module) {
  main();
}

export {
  example1_registerService,
  example2_serviceDiscovery,
  example3_quickCall,
  OrderService,
  example5_loadBalancingStrategies,
};
