/**
 * @file OrderService单元测试
 * @description 测试OrderService的核心功能
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '../services/OrderService';
import { Order, OrderStatus, OrderModel } from '../models/Order';
  
// 模拟OrderModel模型的静态方法
vi.spyOn(OrderModel, 'find').mockImplementation(() => {
  return {
    where: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    relations: vi.fn().mockResolvedValue([])
  } as any;
});
vi.spyOn(OrderModel, 'count').mockResolvedValue(0);
vi.spyOn(OrderModel, 'findOne').mockResolvedValue(null);
vi.spyOn(OrderModel, 'save').mockResolvedValue(null);

// 定义所需的接口

// 定义所需的接口
interface DishRepository {
  findById: any;
  findByIds: any;
}

interface KitchenResourceRepository {
  getAvailableResources: any;
  updateResourceUsage: any;
  releaseResource: any;
}

interface ChefRepository {
  getAvailableChefs: any;
  findById: any;
  findByRestaurant: any;
  updateChefWorkload: any;
  updateChefAvailability: any;
}

// 创建模拟仓库
const createMockRepositories = () => {
  const mockDishRepository = {
    findById: vi.fn(),
    findByIds: vi.fn(),
  };

  const mockKitchenResourceRepository = {
    getAvailableResources: vi.fn(),
    updateResourceUsage: vi.fn(),
    releaseResource: vi.fn(),
  };

  const mockChefRepository = {
    getAvailableChefs: vi.fn(),
    findById: vi.fn(),
    findByRestaurant: vi.fn(),
    updateChefWorkload: vi.fn(),
    updateChefAvailability: vi.fn(),
  };

  return {
    mockDishRepository,
    mockKitchenResourceRepository,
    mockChefRepository,
  };
};

describe('OrderService', () => {
  let orderService: OrderService;
  let mockDishRepository: DishRepository;
  let mockKitchenResourceRepository: KitchenResourceRepository;
  let mockChefRepository: ChefRepository;

  beforeEach(() => {
    // 创建新的模拟仓库实例
    const { mockDishRepository: mdr, mockKitchenResourceRepository: mkcr, mockChefRepository: mcr } = createMockRepositories();
    mockDishRepository = mdr;
    mockKitchenResourceRepository = mkcr;
    mockChefRepository = mcr;

    // 创建OrderService实例
    orderService = new OrderService(mockDishRepository, mockKitchenResourceRepository, mockChefRepository);

    // 清除所有模拟的调用历史
    vi.clearAllMocks();
    
    // 重新设置OrderModel模型的静态方法模拟
    vi.spyOn(OrderModel, 'find').mockResolvedValue([]);
    vi.spyOn(OrderModel, 'count').mockResolvedValue(0);
    vi.spyOn(OrderModel, 'findOne').mockResolvedValue(null);
    vi.spyOn(OrderModel, 'save').mockResolvedValue(null);
    
    // 设置mockChefRepository默认返回值
    mockChefRepository.findByRestaurant.mockResolvedValue([]);
    mockChefRepository.getAvailableChefs.mockResolvedValue([]);
  });

  describe('getOrderQueue', () => {
    it('应该获取订单队列', async () => {
      // 设置模拟返回值
      const mockOrders: any[] = [];
      const mockCount = 0;
      
      // 执行测试
      const result = await orderService.getOrderQueue('restaurant-1', OrderStatus.PENDING, 10, 0);
      
      // 验证结果结构
      expect(result).toHaveProperty('orders');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('currentStatus');
    });
  });

  describe('createOrder', () => {
    it('应该创建新订单', async () => {
      // 设置模拟返回值
      const mockDish = {
        id: 'order-dish-1',
        dishId: 'dish-1',
        name: 'Test Dish',
        quantity: 1,
        price: 50,
        cookingTime: 10,
        complexity: 2
      };
      
      const mockOrder = {
        id: 'new-order-1',
        restaurantId: 'restaurant-1',
        customerId: 'customer-1',
        dishes: [mockDish],
        totalAmount: 50,
        status: OrderStatus.PENDING,
        priority: 5,
        estimatedCookingTime: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (mockDishRepository.findById as any).mockResolvedValue(mockDish);
      (mockDishRepository.findByIds as any).mockResolvedValue([mockDish]);
      (OrderModel.save as any).mockResolvedValue(mockOrder);
      // 模拟OrderModel.findOne，确保它正确处理relations参数
      (OrderModel.findOne as any).mockImplementation((options: any) => {
        // 不管relations参数是什么，只要id匹配就返回mockOrder
        if (options.where.id === 'new-order-1') {
          return Promise.resolve({
            ...mockOrder,
            dishes: [{ id: 'order-dish-1', dishId: 'dish-1', name: 'Test Dish', quantity: 1, price: 50, cookingTime: 10 }]
          });
        }
        return Promise.resolve(null);
      });
      (mockChefRepository.findByRestaurant as any).mockResolvedValue([]);
      
      // 执行测试
      const orderData = {
        restaurantId: 'restaurant-1',
        customerId: 'customer-1',
        dishes: [
          {
            id: 'order-dish-1',
            dishId: 'dish-1',
            name: 'Test Dish',
            quantity: 1,
            price: 50,
            cookingTime: 10
          }
        ],
        totalAmount: 50
      };
      
      const result = await orderService.createOrder(orderData);
      
      // 验证结果
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('应该在订单不存在时抛出错误', async () => {
      // 执行测试并验证错误
      await expect(orderService.updateOrderStatus('non-existent-order', OrderStatus.COMPLETED)).rejects.toThrow('订单不存在');
    });
  });

  describe('cancelOrder', () => {
    it('应该在订单不存在时抛出错误', async () => {
      // 执行测试并验证错误
      await expect(orderService.cancelOrder('non-existent-order')).rejects.toThrow('订单不存在');
    });
  });

  describe('calculateOrderPriority', () => {
    it('应该计算正确的订单优先级', () => {
      // 准备测试数据
      const vipOrder = {
        customer: { isVip: true },
        totalAmount: 300,
        createdAt: new Date() // 确保createdAt存在
      };

      const highAmountOrder = {
        customer: { isVip: false },
        totalAmount: 300,
        createdAt: new Date() // 确保createdAt存在
      };

      const regularOrder = {
        customer: { isVip: false },
        totalAmount: 100,
        createdAt: new Date() // 确保createdAt存在
      };

      // 执行测试
      const calculateOrderPriority = (orderService as any).calculateOrderPriority;
      const vipPriority = calculateOrderPriority(vipOrder);
      const highAmountPriority = calculateOrderPriority(highAmountOrder);
      const regularPriority = calculateOrderPriority(regularOrder);

      // 验证结果
      expect(vipPriority).toBe(4); // 基础1 + VIP2 + 金额1
      expect(highAmountPriority).toBe(2); // 基础1 + 金额1
      expect(regularPriority).toBe(1); // 基础1
    });
  });
});
