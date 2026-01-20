/**
 * @file OrderService.ts
 * @description 订单服务类 - 处理智能厨房系统中的订单管理核心业务逻辑
 * @module services
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */
import { Order, OrderStatus, OrderQueue, CookingTimeEstimate, OrderAssignment, OrderModel } from '../models/Order';
import { KitchenResource } from '../models/KitchenResource';

import { DishRepository } from '../repositories/DishRepository';
import { KitchenResourceRepository } from '../repositories/KitchenResourceRepository';
import { ChefRepository, ChefEntity } from '../repositories/ChefRepository';
import { EventEmitter } from 'events';
import { cacheService } from './CacheService';

/**
 * @class OrderService
 * @description 订单服务类 - 负责订单的创建、查询、状态更新、取消、智能分配等核心业务逻辑
 * @extends EventEmitter 支持事件通知机制
 */
export class OrderService extends EventEmitter {
  constructor(
    private dishRepository: DishRepository,
    private kitchenResourceRepository: KitchenResourceRepository,
    private chefRepository: ChefRepository
  ) {
    super();
  }

  /**
   * @method getOrderQueue
   * @description 获取指定餐厅的订单队列
   * @param restaurantId - 餐厅ID (必填)
   * @param status - 订单状态筛选 (可选)
   * @param limit - 每页订单数量 (默认: 50, 范围: 1-100)
   * @param offset - 分页偏移量 (默认: 0)
   * @returns Promise<OrderQueue> - 包含订单列表、总数和处理时间的队列信息
   * @throws {Error} 当餐厅ID为空时抛出错误
   */
  async getOrderQueue(
    restaurantId: string,
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<OrderQueue> {
    // 验证输入参数
    // 允许空restaurantId用于Dashboard全局数据查询
    // if (!restaurantId) {
    //   throw new Error('餐厅ID不能为空');
    // }
    
    if (limit <= 0 || limit > 100) {
      limit = 50; // 限制查询数量在1-100之间
    }
    
    if (offset < 0) {
      offset = 0; // 偏移量不能为负数
    }

    const cacheKey = `order-queue:${restaurantId || 'all'}:${status || 'all'}:${limit}:${offset}`;
    
    return await cacheService.getWithCache<OrderQueue>(cacheKey, async () => {
      const queryConditions: any = {
        ...(status && { status: status as OrderStatus })
      };

      // 如果有restaurantId，添加到查询条件
      if (restaurantId) {
        queryConditions.where = { restaurantId };
      }

      // 并行执行查询，提高性能
      const [orders, totalCount] = await Promise.all([
        OrderModel.find({
          ...queryConditions,
          order: {
            createdAt: 'ASC',
            priority: 'DESC'
          },
          take: limit,
          skip: offset,
          relations: ['dishes', 'customer', 'assignedChef']
        }),
        OrderModel.count(queryConditions)
      ]);

      return {
        orders,
        totalCount,
        currentStatus: status || 'all',
        processingTime: this.calculateAverageProcessingTime(orders)
      };
    }, 60); // 缓存60秒
  }

  /**
   * @method createOrder
   * @description 创建新订单
   * @param orderData - 订单数据对象
   * @returns Promise<Order> - 创建成功的订单对象
   * @throws {Error} 当订单数据无效、餐厅ID为空或订单不含菜品时抛出错误
   * @emits orderCreated - 订单创建成功后触发事件
   */
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    // 输入验证
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('订单数据无效');
    }
    
    if (!orderData.restaurantId) {
      throw new Error('餐厅ID不能为空');
    }
    
    if (!orderData.dishes || !Array.isArray(orderData.dishes) || orderData.dishes.length === 0) {
      throw new Error('订单必须包含至少一道菜品');
    }
    
    if (orderData.totalAmount !== undefined && (typeof orderData.totalAmount !== 'number' || orderData.totalAmount < 0)) {
      throw new Error('订单金额必须为正数');
    }

    // 创建订单
    const order = await OrderModel.save({
      ...orderData,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: orderData.priority || 0 // 设置默认优先级
    });

    try {
      // 计算预估制作时间
      const cookingTime = await this.estimateCookingTime(order.id);

      // 更新订单的预估完成时间
      order.estimatedCompletionTime = new Date(
        Date.now() + cookingTime.totalEstimatedMinutes * 60 * 1000
      );

      await OrderModel.save(order);

      // 发送订单创建事件
      this.emit('orderCreated', order);

      // 检查是否需要立即分配厨师（异步执行，不阻塞主线程）
      this.checkAndAssignChef(order).catch(error => {
        console.error('分配厨师失败:', error);
        // 可以添加告警逻辑
      });

      return order;
    } catch (error) {
      console.error('创建订单失败:', error);
      // 回滚订单状态或添加错误标记
      await OrderModel.save({
        ...order,
        status: OrderStatus.CANCELLED,
        reason: '订单创建过程中发生错误'
      });
      throw error;
    }
  }

  /**
   * @method updateOrderStatus
   * @description 更新订单状态
   * @param orderId - 订单ID (必填)
   * @param status - 新的订单状态 (必填)
   * @param notes - 状态更新备注 (可选)
   * @returns Promise<Order> - 更新后的订单对象
   * @throws {Error} 当订单ID无效、订单不存在或状态转换无效时抛出错误
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> {
    // 输入验证
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('订单ID无效');
    }
    
    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw new Error('订单状态无效');
    }
    
    if (notes && typeof notes !== 'string') {
      throw new Error('订单备注必须是字符串');
    }

    const order = await OrderModel.findOne({
      where: { id: orderId },
      relations: ['dishes', 'customer', 'assignedChef']
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 状态转换验证
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new Error(`无效的状态转换: ${order.status} -> ${status}`);
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();

    if (notes) {
      order.notes = notes;
    }

    // 状态变更时间记录
    switch (status) {
      case OrderStatus.IN_PROGRESS:
        order.cookingStartTime = new Date();
        break;
      case OrderStatus.COMPLETED:
        order.actualCompletionTime = new Date();
        // 计算实际耗时
        if (order.cookingStartTime) {
          order.actualProcessingTime = Math.ceil(
            (order.actualCompletionTime.getTime() - order.cookingStartTime.getTime()) / (1000 * 60)
          );
        }
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = new Date();
        break;
    }

    try {
      await OrderModel.save(order);
    } catch (error) {
      console.error('更新订单状态失败:', error);
      throw new Error('更新订单状态失败');
    }

    // 清除订单队列缓存
    if (order.restaurantId) {
      const cacheKeyPattern = `order-queue:${order.restaurantId}:*`;
      await cacheService.deletePattern(cacheKeyPattern);
    }

    // 发送状态变更事件
    this.emit('orderStatusChanged', {
      order,
      previousStatus,
      newStatus: status
    });

    // 如果订单完成或取消，释放相关资源（异步执行，不阻塞主流程）
    if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) {
      this.releaseKitchenResources(order).catch(error => {
        console.error('释放厨房资源失败:', error);
        // 可以添加告警逻辑
      });
    }

    return order;
  }
  
  /**
   * @method isValidStatusTransition
   * @description 验证订单状态转换是否有效
   * @private
   * @param currentStatus - 当前订单状态
   * @param newStatus - 新的订单状态
   * @returns boolean - 状态转换是否有效的标志
   */
  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [], // 已完成订单不能再转换状态
      [OrderStatus.CANCELLED]: []   // 已取消订单不能再转换状态
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * @method intelligentOrderAssignment
   * @description 智能订单分配 - 根据厨师技能、订单复杂度和资源可用性分配订单
   * @param restaurantId - 餐厅ID (必填)
   * @param orders - 待分配的订单ID列表 (必填)
   * @returns Promise<OrderAssignment[]> - 订单分配结果列表
   */
  async intelligentOrderAssignment(
    restaurantId: string,
    orders: string[]
  ): Promise<OrderAssignment[]> {
    const assignments: OrderAssignment[] = [];

    // 获取可用的厨房资源
    const availableResources = await this.kitchenResourceRepository.getAvailableResources(restaurantId);

    // 获取可用厨师
    const availableChefs = await this.chefRepository.getAvailableChefs(restaurantId);

    for (const orderId of orders) {
      const order = await OrderModel.findOne({
        where: { id: orderId },
        relations: ['dishes']
      });

      if (!order) {
        continue;
      }

      // 计算订单复杂度和优先级
      const orderComplexity = await this.calculateOrderComplexity(order);
      const orderPriority = this.calculateOrderPriority(order);

      // 找到最合适的厨师
      const bestChef = await this.findBestChef(availableChefs, orderComplexity, orderPriority);

      if (bestChef) {
        // 分配订单给厨师
        await this.assignOrderToChef(order, bestChef);

        assignments.push({
          orderId: order.id,
          chefId: bestChef.id,
          chefName: bestChef.name,
          estimatedStartTime: new Date(),
          estimatedCompletionTime: new Date(
            Date.now() + orderComplexity.estimatedCookingTime * 60 * 1000
          ),
          priority: order.priority,
          assignedResources: orderComplexity.requiredResources
        });

        // 更新厨师可用性
        bestChef.isAvailable = false;
        await this.chefRepository.updateChefAvailability(bestChef.id, false);
      }
    }

    return assignments;
  }

  /**
   * @method estimateCookingTime
   * @description 预估订单烹饪时间
   * @param orderId - 订单ID (必填)
   * @returns Promise<CookingTimeEstimate> - 包含预估烹饪时间和复杂度的对象
   */
  async estimateCookingTime(orderId: string): Promise<CookingTimeEstimate> {
    // 输入验证
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('订单ID无效');
    }

    const order = await OrderModel.findOne({
      where: { id: orderId },
      relations: ['dishes']
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    let totalPrepTime = 0;
    let totalCookingTime = 0;
    const dishBreakdown: Array<{
      dishId: string;
      dishName: string;
      prepTime: number;
      cookingTime: number;
      totalTime: number;
    }> = [];

    // 收集所有菜品ID
    const dishIds = order.dishes
      .filter(orderDish => orderDish?.dishId)
      .map(orderDish => orderDish.dishId as string);

    // 批量获取菜品信息（性能优化：减少数据库查询次数）
    const dishesMap = new Map();
    if (dishIds.length > 0) {
      const dishes = await this.dishRepository.findByIds(dishIds);
      dishes.forEach(dish => {
        dishesMap.set(dish.id, dish);
      });
    }

    // 计算每道菜的制作时间
    for (const orderDish of order.dishes) {
      if (orderDish?.dishId) {
        const dish = dishesMap.get(orderDish.dishId);

        if (dish) {
          const prepTime = dish.preparationTime * (orderDish.quantity || 1);
          const cookingTime = dish.cookingTime * (orderDish.quantity || 1);
          const totalTime = prepTime + cookingTime;

          totalPrepTime += prepTime;
          totalCookingTime += cookingTime;

          dishBreakdown.push({
            dishId: dish.id,
            dishName: dish.name,
            prepTime,
            cookingTime,
            totalTime
          });
        }
      }
    }

    // 并行计算厨房负载和厨师技能水平（性能优化：减少等待时间）
    const [kitchenLoad, averageChefSkill] = await Promise.all([
      this.calculateKitchenLoad(order.restaurantId),
      this.getAverageChefSkill(order.restaurantId)
    ]);

    // 考虑厨房当前负载
    const loadFactor = Math.max(1, kitchenLoad.currentOrders / kitchenLoad.capacity);

    // 考虑厨师技能水平
    const skillFactor = Math.max(0.5, 1 - (averageChefSkill - 3) * 0.1); // 3-5星技能，1-5星映射为0.5-1的因子

    // 计算最终预估时间
    const baseTime = totalPrepTime + totalCookingTime;
    const adjustedTime = baseTime * loadFactor * skillFactor;
    const totalEstimatedMinutes = Math.ceil(adjustedTime);

    return {
      orderId,
      totalEstimatedMinutes,
      preparationTime: Math.ceil(totalPrepTime * loadFactor * skillFactor),
      cookingTime: Math.ceil(totalCookingTime * loadFactor * skillFactor),
      dishBreakdown,
      factors: {
        kitchenLoad: loadFactor,
        chefSkill: skillFactor,
        orderComplexity: order.dishes.length
      }
    };
  }

  /**
   * @method getOrderById
   * @description 根据ID获取订单
   * @param orderId - 订单ID (必填)
   * @returns Promise<Order | null> - 订单对象或null（如果订单不存在）
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    return await OrderModel.findOne({
      where: { id: orderId },
      relations: ['dishes', 'customer', 'assignedChef', 'restaurant']
    });
  }

  /**
   * @method cancelOrder
   * @description 取消订单
   * @param orderId - 订单ID (必填)
   * @param reason - 取消原因 (可选)
   * @returns Promise<Order> - 取消后的订单对象
   * @throws {Error} 当订单ID无效或订单不存在时抛出错误
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    // 输入验证
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('订单ID无效');
    }
    
    if (reason && typeof reason !== 'string') {
      throw new Error('取消原因必须是字符串');
    }

    const order = await OrderModel.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 只有待处理或进行中的订单可以取消
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new Error('订单不能取消');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = reason || '客户请求';
    order.updatedAt = new Date();

    try {
      await OrderModel.save(order);
    } catch (error) {
      console.error('取消订单失败:', error);
      throw new Error('取消订单失败');
    }

    // 释放已分配的厨房资源（异步执行，不阻塞主流程）
    this.releaseKitchenResources(order).catch(error => {
      console.error('释放厨房资源失败:', error);
      // 可以添加告警逻辑
    });

    // 发送取消事件
    this.emit('orderCancelled', { order, reason });

    return order;
  }

  /**
   * 私有辅助方法
   */
  /**
   * @method calculateOrderComplexity
   * @description 计算订单复杂度
   * @private
   * @param order - 订单对象
   * @returns Promise<{complexityScore: number, estimatedCookingTime: number, requiredResources: string[]}> - 包含复杂度分数、预估烹饪时间和所需资源的对象
   */
  private async calculateOrderComplexity(order: Order): Promise<{
    complexityScore: number;
    estimatedCookingTime: number;
    requiredResources: string[];
  }> {
    let totalComplexity = 0;
    let totalTime = 0;
    const requiredResources = new Set<string>();

    // 收集所有菜品ID
    const dishIds = order.dishes
      .filter(orderDish => orderDish?.dishId)
      .map(orderDish => orderDish.dishId as string);

    // 优化：使用缓存减少数据库查询
    const dishesMap = new Map();
    if (dishIds.length > 0) {
      // 尝试从缓存获取菜品信息
      const cachedDishes = await Promise.all(
        dishIds.map(id => cacheService.get<typeof this.dishRepository.findByIds>('dish:' + id))
      );
      
      // 找出需要从数据库获取的菜品ID
      const missingIds = dishIds.filter((id, index) => !cachedDishes[index]);
      
      if (missingIds.length > 0) {
        const dbDishes = await this.dishRepository.findByIds(missingIds);
        dbDishes.forEach(dish => {
          dishesMap.set(dish.id, dish);
          // 缓存菜品信息，有效期1小时
          cacheService.set('dish:' + dish.id, dish, 3600);
        });
      }
      
      // 合并缓存和数据库结果
      dishIds.forEach((id, index) => {
        if (cachedDishes[index]) {
          dishesMap.set(id, cachedDishes[index]);
        }
      });
    }

    // 计算复杂度、时间和所需资源
    for (const orderDish of order.dishes) {
      if (orderDish?.dishId) {
        const dish = dishesMap.get(orderDish.dishId);
        if (dish) {
          const quantity = orderDish.quantity || 1;
          totalComplexity += dish.complexityScore * quantity;
          totalTime += (dish.preparationTime + dish.cookingTime) * quantity;

          // 添加所需资源
          (dish.requiredEquipment || []).forEach((equipment: string) => {
            requiredResources.add(equipment);
          });
        }
      }
    }

    return {
      complexityScore: totalComplexity,
      estimatedCookingTime: totalTime,
      requiredResources: Array.from(requiredResources)
    };
  }

  /**
   * @method calculateOrderPriority
   * @description 计算订单优先级
   * @private
   * @param order - 订单对象
   * @returns number - 订单优先级分数
   */
  private calculateOrderPriority(order: Order): number {
    let priority = 1; // 基础优先级

    // VIP客户优先级
    if (order.customer?.isVip) {
      priority += 2;
    }

    // 订单金额优先级
    if (order.totalAmount > 200) {
      priority += 1;
    }

    // 等待时间优先级（等待越久优先级越高）
    const waitTime = Date.now() - order.createdAt.getTime();
    if (waitTime > 30 * 60 * 1000) { // 超过30分钟
      priority += 1;
    }

    return priority;
  }

  /**
   * @method findBestChef
   * @description 查找最适合的厨师
   * @private
   * @param availableChefs - 可用厨师列表
   * @param orderComplexity - 订单复杂度信息
   * @param orderPriority - 订单优先级
   * @returns Promise<ChefEntity | null> - 最适合的厨师或null
   */
  private async findBestChef(
      availableChefs: ChefEntity[],
      orderComplexity: { complexityScore: number },
      orderPriority: number
    ): Promise<ChefEntity | null> {
      let bestChef: ChefEntity | null = null;
      let bestScore = -1;

    // 优化：使用更高效的匹配算法和参数计算
    for (const chef of availableChefs) {
      if (!chef.isAvailable) continue;

      // 计算厨师匹配分数
      // 避免除以0的情况
      const complexityScore = Math.max(orderComplexity.complexityScore, 1);
      const skillMatch = Math.min(1, chef.skillLevel / complexityScore);
      // 避免currentOrders或maxOrders为0的情况
      const workLoadScore = 1 - (chef.currentOrders / Math.max(chef.maxOrders, 1));
      const experienceBonus = chef.experienceYears * 0.1;

      // 考虑订单优先级的影响
      const priorityBonus = orderPriority * 0.1;

      const totalScore = (skillMatch * 0.4) + (workLoadScore * 0.4) + (experienceBonus * 0.2) + priorityBonus;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestChef = chef;
      }
    }

    return bestChef;
  }

  /**
   * @method assignOrderToChef
   * @description 将订单分配给厨师
   * @private
   * @param order - 订单对象
   * @param chef - 厨师对象
   * @returns Promise<void>
   */
  private async assignOrderToChef(order: Order, chef: ChefEntity): Promise<void> {
    order.assignedChefId = chef.id;
    order.status = OrderStatus.IN_PROGRESS;
    order.cookingStartTime = new Date();
    await OrderModel.save(order);
    
    // 更新厨师工作负载和可用性，保持与releaseKitchenResources方法的一致性
    await this.chefRepository.updateChefWorkload(chef.id, 1);
    await this.chefRepository.updateChefAvailability(chef.id, false);
    
    // 清除相关缓存
    if (order.restaurantId) {
      const cacheKeyPattern = `order-queue:${order.restaurantId}:*`;
      await cacheService.deletePattern(cacheKeyPattern);
    }
  }

  /**
   * @method releaseKitchenResources
   * @description 释放订单占用的厨房资源
   * @private
   * @param order - 订单对象
   * @returns Promise<void>
   */
  private async releaseKitchenResources(order: Order): Promise<void> {
    if (order.assignedChefId) {
      const chef = await this.chefRepository.findById(order.assignedChefId);
      if (chef) {
        // 使用chefRepository的updateChefWorkload和updateChefAvailability方法
        await this.chefRepository.updateChefWorkload(chef.id, -1);
        await this.chefRepository.updateChefAvailability(chef.id, true);
      }
    }
    
    // 清除相关缓存
    if (order.restaurantId) {
      const cacheKeyPattern = `order-queue:${order.restaurantId}:*`;
      await cacheService.deletePattern(cacheKeyPattern);
    }
  }

  /**
   * @method calculateKitchenLoad
   * @description 计算厨房当前负载
   * @private
   * @param restaurantId - 餐厅ID
   * @returns Promise<{currentOrders: number, capacity: number, averageProcessingTime: number}> - 包含当前订单数、容量和平均处理时间的对象
   */
  private async calculateKitchenLoad(restaurantId: string): Promise<{
    currentOrders: number;
    capacity: number;
    averageProcessingTime: number;
  }> {
    const currentOrders = await OrderModel.count({
      where: {
        restaurantId,
        status: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS]
      }
    });

    return {
      currentOrders,
      capacity: 50, // 假设厨房同时处理50个订单
      averageProcessingTime: 25 // 平均处理时间（分钟）
    };
  }

  /**
   * @method getAverageChefSkill
   * @description 计算餐厅厨师的平均技能水平
   * @private
   * @param restaurantId - 餐厅ID
   * @returns Promise<number> - 平均技能水平
   */
  private async getAverageChefSkill(restaurantId: string): Promise<number> {
    const chefs = await this.chefRepository.findByRestaurant(restaurantId);

    if (chefs.length === 0) return 3; // 默认中等技能

    const totalSkill = chefs.reduce((sum, chef) => sum + chef.skillLevel, 0);
    return totalSkill / chefs.length;
  }

  /**
   * @method calculateAverageProcessingTime
   * @description 计算订单平均处理时间
   * @private
   * @param orders - 订单列表
   * @returns number - 平均处理时间（分钟）
   */
  private calculateAverageProcessingTime(orders: Order[]): number {
    // 类型安全检查
    if (!Array.isArray(orders) || orders.length === 0) return 0;

    const completedOrders = orders.filter(
      order => order.status === OrderStatus.COMPLETED && order.actualCompletionTime
    );

    if (completedOrders.length === 0) return 0;

    const totalTime = completedOrders.reduce((sum, order) => {
      // 安全地处理可能的空值
      if (!order.actualCompletionTime) return sum;
      return sum + (order.actualCompletionTime.getTime() - order.createdAt.getTime());
    }, 0);

    return totalTime / completedOrders.length / (1000 * 60); // 转换为分钟
  }

  /**
   * @method checkAndAssignChef
   * @description 检查并分配厨师
   * @private
   * @param order - 订单对象
   * @returns Promise<void>
   */
  private async checkAndAssignChef(order: Order): Promise<void> {
    const availableChefs = await this.chefRepository.getAvailableChefs(order.restaurantId);

    if (availableChefs.length > 0) {
      const orderComplexity = await this.calculateOrderComplexity(order);
      const orderPriority = this.calculateOrderPriority(order);

      const bestChef = await this.findBestChef(availableChefs, orderComplexity, orderPriority);

      if (bestChef) {
        await this.assignOrderToChef(order, bestChef);
      }
    }
  }
}