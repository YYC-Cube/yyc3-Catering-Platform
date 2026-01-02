/**
 * YYC³餐饮行业智能化平台 - O2O线上线下系统服务
 * 处理线上订餐、配送管理、订单同步等O2O业务
 */

import { EventEmitter } from 'events';
import {
  O2OOrder,
  O2OOrderStatus,
  DeliveryStatus,
  OrderSource,
  PaymentMethod,
  DeliveryInfo,
  OrderItem,
  OrderCustomer
} from '../models/O2OOrder';
import { OrderRepository } from '../repositories/OrderRepository';
import { DeliveryService } from './DeliveryService';
import { PaymentService } from './PaymentService';
import { InventoryService } from '../services/InventoryService';
import { NotificationService } from '../services/NotificationService';

export interface O2OOrderRequest {
  source: OrderSource;
  customerId?: string;
  customer: OrderCustomer;
  items: Array<{
    dishId: string;
    quantity: number;
    price: number;
    customizations?: Record<string, any>;
  }>;
  deliveryInfo: DeliveryInfo;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  scheduledTime?: Date;
  estimatedPrepTime?: number;
}

export interface OrderFilter {
  status?: O2OOrderStatus[];
  source?: OrderSource[];
  customerId?: string;
  deliveryDriverId?: string;
  dateRange?: [Date, Date];
  search?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderStatusDistribution: Record<O2OOrderStatus, number>;
  sourceDistribution: Record<OrderSource, number>;
  peakHours: Array<{ hour: number; orderCount: number }>;
  deliveryPerformance: {
    averageDeliveryTime: number;
    onTimeRate: number;
    driverEfficiency: Record<string, number>;
  };
}

export class O2OOrderService extends EventEmitter {
  private orderRepository: OrderRepository;
  private deliveryService: DeliveryService;
  private paymentService: PaymentService;
  private inventoryService: InventoryService;
  private notificationService: NotificationService;

  // 订单状态机配置
  private orderStatusTransitions: Record<O2OOrderStatus, O2OOrderStatus[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready_for_pickup', 'cancelled'],
    'ready_for_pickup': ['out_for_delivery', 'picked_up', 'cancelled'],
    'out_for_delivery': ['delivered', 'failed'],
    'picked_up': ['completed'],
    'delivered': ['completed'],
    'completed': [],
    'cancelled': [],
    'failed': ['pending', 'cancelled']
  };

  constructor(dependencies: {
    orderRepository: OrderRepository;
    deliveryService: DeliveryService;
    paymentService: PaymentService;
    inventoryService: InventoryService;
    notificationService: NotificationService;
  }) {
    super();
    this.orderRepository = dependencies.orderRepository;
    this.deliveryService = dependencies.deliveryService;
    this.paymentService = dependencies.paymentService;
    this.inventoryService = dependencies.inventoryService;
    this.notificationService = dependencies.notificationService;
  }

  /**
   * 创建新订单
   */
  async createOrder(orderRequest: O2OOrderRequest): Promise<O2OOrder> {
    try {
      // 验证订单数据
      await this.validateOrderRequest(orderRequest);

      // 检查库存
      await this.checkInventoryAvailability(orderRequest.items);

      // 计算订单金额
      const orderAmount = await this.calculateOrderAmount(orderRequest);

      // 创建订单实体
      const order = await this.buildOrder(orderRequest, orderAmount);

      // 处理支付
      const paymentResult = await this.processPayment(order);

      if (!paymentResult.success) {
        throw new Error(`Payment failed: ${paymentResult.message}`);
      }

      // 保存订单
      const savedOrder = await this.orderRepository.create(order);

      // 扣减库存
      await this.reserveInventory(order.items);

      // 发送订单确认通知
      await this.sendOrderNotifications(savedOrder, 'order_created');

      // 如果是外卖订单，创建配送任务
      if (order.deliveryInfo.type === 'delivery') {
        await this.createDeliveryTask(savedOrder);
      }

      // 发送事件
      this.emit('orderCreated', savedOrder);

      return savedOrder;

    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: O2OOrderStatus,
    updatedBy: string,
    notes?: string
  ): Promise<O2OOrder> {
    try {
      // 获取当前订单
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // 验证状态转换
      if (!this.isValidStatusTransition(order.status, newStatus)) {
        throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
      }

      // 更新订单状态
      const previousStatus = order.status;
      order.status = newStatus;
      order.updatedAt = new Date();
      order.updatedBy = updatedBy;

      if (notes) {
        order.notes = (order.notes || '') + `\n[${new Date().toISOString()}] ${notes}`;
      }

      // 处理状态变更的特殊逻辑
      await this.handleStatusChange(order, previousStatus, newStatus);

      // 保存更新
      const updatedOrder = await this.orderRepository.update(order);

      // 发送状态变更通知
      await this.sendOrderNotifications(updatedOrder, 'status_changed');

      // 发送事件
      this.emit('orderStatusChanged', {
        order: updatedOrder,
        previousStatus,
        newStatus,
        updatedBy
      });

      return updatedOrder;

    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<O2OOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // 检查是否可以取消
      if (!this.canCancelOrder(order)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      // 处理退款
      if (order.paymentStatus === 'completed') {
        await this.processRefund(order);
      }

      // 释放库存
      await this.releaseInventory(order.items);

      // 取消配送任务
      if (order.deliveryInfo.type === 'delivery') {
        await this.cancelDeliveryTask(orderId);
      }

      // 更新订单状态
      return await this.updateOrderStatus(orderId, 'cancelled', cancelledBy, reason);

    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  /**
   * 获取订单列表
   */
  async getOrders(filter: OrderFilter = {}, pagination: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = { page: 1, limit: 20 }): Promise<{
    orders: O2OOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      return await this.orderRepository.findWithFilter(filter, pagination);
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   */
  async getOrderById(orderId: string): Promise<O2OOrder | null> {
    try {
      return await this.orderRepository.findById(orderId);
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  }

  /**
   * 获取订单统计信息
   */
  async getOrderStatistics(dateRange?: [Date, Date]): Promise<OrderStatistics> {
    try {
      const stats = await this.orderRepository.getStatistics(dateRange);

      // 获取配送性能数据
      const deliveryStats = await this.deliveryService.getPerformanceStats(dateRange);

      return {
        ...stats,
        deliveryPerformance: deliveryStats
      };

    } catch (error) {
      console.error('Get order statistics error:', error);
      throw error;
    }
  }

  /**
   * 同步外部平台订单
   */
  async syncExternalOrders(): Promise<{
    synced: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const result = {
        synced: 0,
        failed: 0,
        errors: [] as string[]
      };

      // 获取待同步的外部订单
      const externalOrders = await this.getExternalOrders();

      for (const externalOrder of externalOrders) {
        try {
          // 转换外部订单格式
          const internalOrder = await this.convertExternalOrder(externalOrder);

          // 检查是否已存在
          const existingOrder = await this.orderRepository.findByExternalId(
            externalOrder.platform,
            externalOrder.externalId
          );

          if (existingOrder) {
            // 更新现有订单
            await this.updateExternalOrder(existingOrder, internalOrder);
          } else {
            // 创建新订单
            await this.createOrder(internalOrder);
          }

          result.synced++;

        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync order ${externalOrder.externalId}: ${error}`);
        }
      }

      return result;

    } catch (error) {
      console.error('Sync external orders error:', error);
      throw error;
    }
  }

  /**
   * 批量更新订单状态
   */
  async batchUpdateOrderStatus(
    orderIds: string[],
    newStatus: O2OOrderStatus,
    updatedBy: string
  ): Promise<{
    success: string[];
    failed: Array<{ orderId: string; error: string }>;
  }> {
    try {
      const result = {
        success: [] as string[],
        failed: [] as Array<{ orderId: string; error: string }>
      };

      for (const orderId of orderIds) {
        try {
          await this.updateOrderStatus(orderId, newStatus, updatedBy);
          result.success.push(orderId);
        } catch (error) {
          result.failed.push({
            orderId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return result;

    } catch (error) {
      console.error('Batch update order status error:', error);
      throw error;
    }
  }

  /**
   * 获取配送中订单
   */
  async getDeliveringOrders(driverId?: string): Promise<O2OOrder[]> {
    try {
      return await this.orderRepository.findDeliveringOrders(driverId);
    } catch (error) {
      console.error('Get delivering orders error:', error);
      throw error;
    }
  }

  /**
   * 处理订单完成
   */
  async completeOrder(orderId: string, completedBy: string): Promise<O2OOrder> {
    try {
      const order = await this.updateOrderStatus(orderId, 'completed', completedBy);

      // 确认库存扣减
      await this.confirmInventoryDeduction(order.items);

      // 发送完成通知
      await this.sendOrderNotifications(order, 'order_completed');

      // 记录完成事件
      this.emit('orderCompleted', order);

      return order;

    } catch (error) {
      console.error('Complete order error:', error);
      throw error;
    }
  }

  /**
   * 私有方法
   */
  private async validateOrderRequest(orderRequest: O2OOrderRequest): Promise<void> {
    // 验证客户信息
    if (!orderRequest.customer) {
      throw new Error('Customer information is required');
    }

    // 验证订单项
    if (!orderRequest.items || orderRequest.items.length === 0) {
      throw new Error('At least one item is required');
    }

    // 验证配送信息
    if (!orderRequest.deliveryInfo) {
      throw new Error('Delivery information is required');
    }

    // 验证支付方式
    if (!orderRequest.paymentMethod) {
      throw new Error('Payment method is required');
    }

    // 验证预约时间
    if (orderRequest.scheduledTime && orderRequest.scheduledTime <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }
  }

  private async checkInventoryAvailability(items: Array<{
    dishId: string;
    quantity: number;
  }>): Promise<void> {
    for (const item of items) {
      const availability = await this.inventoryService.checkAvailability(
        item.dishId,
        item.quantity
      );

      if (!availability.available) {
        throw new Error(`Insufficient inventory for item ${item.dishId}`);
      }
    }
  }

  private async calculateOrderAmount(orderRequest: O2OOrderRequest): Promise<{
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
  }> {
    let subtotal = 0;

    // 计算商品小计
    for (const item of orderRequest.items) {
      subtotal += item.price * item.quantity;
    }

    // 计算税费
    const tax = subtotal * 0.1; // 假设10%税率

    // 计算配送费
    const deliveryFee = orderRequest.deliveryInfo.type === 'delivery' ?
      await this.calculateDeliveryFee(orderRequest.deliveryInfo) : 0;

    // 计算折扣
    let discount = 0;
    if (orderRequest.couponCode) {
      discount = await this.calculateDiscount(orderRequest.couponCode, subtotal);
    }

    const total = subtotal + tax + deliveryFee - discount;

    return {
      subtotal,
      tax,
      deliveryFee,
      discount,
      total: Math.max(0, total)
    };
  }

  private async buildOrder(
    orderRequest: O2OOrderRequest,
    orderAmount: any
  ): Promise<O2OOrder> {
    const orderNumber = await this.generateOrderNumber();

    return {
      id: this.generateId(),
      orderNumber,
      source: orderRequest.source,
      customerId: orderRequest.customerId,
      customer: orderRequest.customer,
      items: orderRequest.items.map(item => ({
        id: this.generateId(),
        dishId: item.dishId,
        dishName: '', // 将通过查询填充
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        customizations: item.customizations || {}
      })),
      deliveryInfo: orderRequest.deliveryInfo,
      paymentMethod: orderRequest.paymentMethod,
      couponCode: orderRequest.couponCode,
      notes: orderRequest.notes,
      scheduledTime: orderRequest.scheduledTime,
      estimatedPrepTime: orderRequest.estimatedPrepTime || 15, // 默认15分钟
      amount: orderAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async processPayment(order: O2OOrder): Promise<{
    success: boolean;
    transactionId?: string;
    message?: string;
  }> {
    try {
      return await this.paymentService.processPayment({
        orderId: order.id,
        amount: order.amount.total,
        method: order.paymentMethod,
        customer: order.customer
      });
    } catch (error) {
      console.error('Process payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  private async reserveInventory(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      await this.inventoryService.reserve(item.dishId, item.quantity, item.id);
    }
  }

  private async releaseInventory(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      await this.inventoryService.release(item.dishId, item.quantity, item.id);
    }
  }

  private async confirmInventoryDeduction(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      await this.inventoryService.confirmDeduction(item.dishId, item.quantity, item.id);
    }
  }

  private async sendOrderNotifications(order: O2OOrder, event: string): Promise<void> {
    try {
      // 发送客户通知
      await this.notificationService.sendCustomerNotification(order, event);

      // 发送内部通知
      await this.notificationService.sendInternalNotification(order, event);

    } catch (error) {
      console.error('Send order notifications error:', error);
    }
  }

  private async createDeliveryTask(order: O2OOrder): Promise<void> {
    try {
      await this.deliveryService.createDeliveryTask({
        orderId: order.id,
        pickupAddress: await this.getRestaurantAddress(),
        deliveryAddress: order.deliveryInfo.address!,
        customer: order.customer,
        estimatedTime: order.estimatedPrepTime
      });
    } catch (error) {
      console.error('Create delivery task error:', error);
    }
  }

  private async cancelDeliveryTask(orderId: string): Promise<void> {
    try {
      await this.deliveryService.cancelDeliveryTask(orderId);
    } catch (error) {
      console.error('Cancel delivery task error:', error);
    }
  }

  private async processRefund(order: O2OOrder): Promise<void> {
    try {
      await this.paymentService.processRefund({
        orderId: order.id,
        amount: order.amount.total,
        originalTransactionId: order.paymentTransactionId,
        reason: 'Order cancelled'
      });
    } catch (error) {
      console.error('Process refund error:', error);
    }
  }

  private isValidStatusTransition(
    currentStatus: O2OOrderStatus,
    newStatus: O2OOrderStatus
  ): boolean {
    const allowedTransitions = this.orderStatusTransitions[currentStatus];
    return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
  }

  private canCancelOrder(order: O2OOrder): boolean {
    // 只能取消pending或confirmed状态的订单
    return ['pending', 'confirmed'].includes(order.status);
  }

  private async handleStatusChange(
    order: O2OOrder,
    previousStatus: O2OOrderStatus,
    newStatus: O2OOrderStatus
  ): Promise<void> {
    // 处理不同状态变更的特殊逻辑
    switch (newStatus) {
      case 'preparing':
        order.preparationStartTime = new Date();
        break;

      case 'ready_for_pickup':
        order.readyTime = new Date();
        break;

      case 'out_for_delivery':
        order.deliveryStartTime = new Date();
        await this.deliveryService.startDelivery(order.id);
        break;

      case 'delivered':
        order.deliveryTime = new Date();
        await this.deliveryService.completeDelivery(order.id);
        break;

      case 'cancelled':
        order.cancelledTime = new Date();
        break;
    }
  }

  private async calculateDeliveryFee(deliveryInfo: DeliveryInfo): Promise<number> {
    // 基于距离、重量等因素计算配送费
    const baseFee = 5.00;
    const distanceFee = deliveryInfo.distance ? deliveryInfo.distance * 2 : 0;
    return baseFee + distanceFee;
  }

  private async calculateDiscount(couponCode: string, subtotal: number): Promise<number> {
    // 查询优惠券并计算折扣金额
    // 这里简化处理，实际应该查询优惠券系统
    if (couponCode === 'SAVE10') {
      return Math.min(10, subtotal * 0.1); // 最多10元或10%折扣
    }
    return 0;
  }

  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `O2O${timestamp}${random}`;
  }

  private async getRestaurantAddress(): Promise<string> {
    // 获取餐厅地址，这里简化处理
    return '北京市朝阳区三里屯路19号';
  }

  private async getExternalOrders(): Promise<any[]> {
    // 从外部平台获取订单
    // 这里简化处理，实际应该调用外部平台API
    return [];
  }

  private async convertExternalOrder(externalOrder: any): Promise<O2OOrderRequest> {
    // 转换外部订单格式
    throw new Error('External order conversion not implemented');
  }

  private async updateExternalOrder(existingOrder: O2OOrder, newData: O2OOrder): Promise<void> {
    // 更新现有订单
    throw new Error('External order update not implemented');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}