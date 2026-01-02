/**
 * @fileoverview YYC³订单管理控制器
 * @description 订单CRUD操作和业务逻辑控制器
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { z } from 'zod';
import { orderSchema } from '../models/order';
import { dbManager } from '../config/database';
import type {
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderQuery,
  OrderListResponse,
  OrderStats,
  OrderSalesReport,
  DeliveryPersonnel,
  OrderDeliveryAssignment,
} from '../models/order';

/**
 * 订单控制器类
 */
export class OrderController {
  /**
   * 创建订单
   */
  async createOrder(request: CreateOrderRequest): Promise<any> {
    try {
      // 验证请求数据
      const validatedData = orderSchema.parse(request);

      // 确保数据库连接池已创建
      await dbManager.createPool();

      // 生成UUID和订单号
      const id = crypto.randomUUID();
      const orderNumber = this.generateOrderNumber();
      const now = new Date();

      // 计算预计完成时间
      const estimatedReadyTime = this.calculateEstimatedReadyTime(validatedData.items);

      // 计算价格明细
      const priceBreakdown = this.calculatePriceBreakdown(validatedData.items, validatedData.promoCode);

      // 插入订单到数据库
      const result = await dbManager.query(`
        INSERT INTO orders (
          id, order_number, customer_id, customer_name, customer_phone,
          restaurant_id, order_type, status, payment_status, payment_method,
          items, price_breakdown, delivery_info, scheduled_time,
          estimated_ready_time, notes, source, promo_code, promo_discount
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING id, created_at
      `, [
        id,
        orderNumber,
        validatedData.customerId || null,
        validatedData.customerName,
        validatedData.customerPhone,
        validatedData.restaurantId || null,
        validatedData.orderType || 'dine_in',
        'pending',
        'pending',
        validatedData.paymentMethod || null,
        JSON.stringify(validatedData.items),
        JSON.stringify(priceBreakdown),
        JSON.stringify(validatedData.deliveryInfo || {}),
        validatedData.scheduledTime || null,
        estimatedReadyTime,
        validatedData.notes || null,
        validatedData.source || 'web',
        validatedData.promoCode || null,
        validatedData.promoDiscount || 0
      ]);

      const order = {
        id: result.rows[0].id,
        orderNumber,
        ...validatedData,
        status: 'pending',
        paymentStatus: 'pending',
        estimatedReadyTime,
        priceBreakdown,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].created_at,
      };

      console.log('✅ 订单创建成功:', order);

      // TODO: 扣减库存
      console.log('📦 需要扣减库存:', order.items);

      // TODO: 发送订单确认通知
      console.log('📧 发送订单确认通知:', orderNumber);

      return {
        success: true,
        data: order,
        message: '订单创建成功',
      };
    } catch (error) {
      console.error('❌ 创建订单失败:', error);
      throw new Error(`创建订单失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 获取订单列表
   */
  async getOrders(query: OrderQuery): Promise<OrderListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
        customerId,
        restaurantId,
        status,
        paymentStatus,
        orderType,
        startDate,
        endDate,
        search,
      } = query;

      // 计算分页参数
      const offset = (page - 1) * limit;

      // 确保数据库连接池已创建
      await dbManager.createPool();

      // 构建查询条件
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      if (customerId) {
        conditions.push(`customer_id = $${paramIndex++}`);
        params.push(customerId);
      }

      if (restaurantId) {
        conditions.push(`restaurant_id = $${paramIndex++}`);
        params.push(restaurantId);
      }

      if (status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(status);
      }

      if (paymentStatus) {
        conditions.push(`payment_status = $${paramIndex++}`);
        params.push(paymentStatus);
      }

      if (orderType) {
        conditions.push(`order_type = $${paramIndex++}`);
        params.push(orderType);
      }

      if (startDate) {
        conditions.push(`created_at >= $${paramIndex++}`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`created_at <= $${paramIndex++}`);
        params.push(endDate);
      }

      if (search) {
        conditions.push(`(order_number ILIKE $${paramIndex++} OR customer_name ILIKE $${paramIndex++} OR customer_phone ILIKE $${paramIndex++})`);
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // 构建WHERE子句
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // 验证排序字段
      const allowedSortFields = ['created_at', 'updated_at', 'order_number', 'total_amount', 'status', 'payment_status'];
      const validSortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const validSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // 查询总数
      const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
      const countResult = await dbManager.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // 查询数据
      const dataQuery = `
        SELECT
          id, order_number, customer_id, customer_name, customer_phone,
          restaurant_id, order_type, status, payment_status, payment_method,
          items, price_breakdown, delivery_info, scheduled_time,
          estimated_ready_time, actual_ready_time, delivery_start_time, delivery_end_time,
          notes, source, promo_code, promo_discount, created_at, updated_at
        FROM orders
        ${whereClause}
        ORDER BY ${validSortField} ${validSortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      params.push(limit, offset);
      const dataResult = await dbManager.query(dataQuery, params);

      // 处理JSON字段
      const items = dataResult.rows.map(row => ({
        id: row.id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        restaurantId: row.restaurant_id,
        orderType: row.order_type,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        items: row.items,
        priceBreakdown: row.price_breakdown,
        deliveryInfo: row.delivery_info,
        scheduledTime: row.scheduled_time,
        estimatedReadyTime: row.estimated_ready_time,
        actualReadyTime: row.actual_ready_time,
        deliveryStartTime: row.delivery_start_time,
        deliveryEndTime: row.delivery_end_time,
        notes: row.notes,
        source: row.source,
        promoCode: row.promo_code,
        promoDiscount: parseFloat(row.promo_discount),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      const totalPages = Math.ceil(total / limit);

      console.log(`✅ 查询订单列表: 返回 ${items.length} 条记录，总共 ${total} 条`);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error('❌ 获取订单列表失败:', error);
      throw new Error(`获取订单列表失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 根据ID获取订单详情
   */
  async getOrderById(id: string): Promise<any> {
    try {
      if (!id) {
        throw new Error('订单ID不能为空');
      }

      // TODO: 从数据库查询订单详情
      console.log('🔍 查询订单详情:', id);

      // 模拟数据
      const order = null;

      if (!order) {
        throw new Error('订单不存在');
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error('❌ 获取订单详情失败:', error);
      throw new Error(`获取订单详情失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 根据订单号获取订单
   */
  async getOrderByNumber(orderNumber: string): Promise<any> {
    try {
      if (!orderNumber) {
        throw new Error('订单号不能为空');
      }

      await dbManager.createPool();

      const result = await dbManager.query(`
        SELECT
          id, order_number, customer_id, customer_name, customer_phone,
          restaurant_id, order_type, status, payment_status, payment_method,
          items, price_breakdown, delivery_info, scheduled_time,
          estimated_ready_time, actual_ready_time, delivery_start_time, delivery_end_time,
          notes, source, promo_code, promo_discount, created_at, updated_at
        FROM orders
        WHERE order_number = $1
      `, [orderNumber]);

      if (result.rows.length === 0) {
        throw new Error('订单不存在');
      }

      const row = result.rows[0];
      const order = {
        id: row.id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        restaurantId: row.restaurant_id,
        orderType: row.order_type,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        items: row.items,
        priceBreakdown: row.price_breakdown,
        deliveryInfo: row.delivery_info,
        scheduledTime: row.scheduled_time,
        estimatedReadyTime: row.estimated_ready_time,
        actualReadyTime: row.actual_ready_time,
        deliveryStartTime: row.delivery_start_time,
        deliveryEndTime: row.delivery_end_time,
        notes: row.notes,
        source: row.source,
        promoCode: row.promo_code,
        promoDiscount: parseFloat(row.promo_discount),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      console.log('✅ 根据订单号查询订单成功:', orderNumber);

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error('❌ 根据订单号查询失败:', error);
      throw new Error(`根据订单号查询失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 更新订单
   */
  async updateOrder(id: string, request: UpdateOrderRequest): Promise<any> {
    try {
      if (!id) {
        throw new Error('订单ID不能为空');
      }

      // TODO: 验证订单是否存在
      console.log('📝 更新订单:', id, request);

      const updateData = {
        ...request,
        updatedAt: new Date(),
      };

      // TODO: 更新数据库中的订单信息
      console.log('📝 订单更新数据:', updateData);

      // TODO: 记录操作日志
      console.log('📝 记录操作日志:', { orderId: id, action: 'update', data: updateData });

      return {
        success: true,
        data: { id, ...updateData },
        message: '订单更新成功',
      };
    } catch (error) {
      console.error('❌ 更新订单失败:', error);
      throw new Error(`更新订单失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: string, notes?: string): Promise<any> {
    try {
      if (!id) {
        throw new Error('订单ID不能为空');
      }

      // TODO: 验证状态转换是否合法
      console.log('📝 更新订单状态:', { id, status, notes });

      const updateData = {
        status,
        notes,
        updatedAt: new Date(),
      };

      // 特殊状态处理
      if (status === 'completed') {
        updateData.actualReadyTime = new Date();
      } else if (status === 'confirmed') {
        // 确认订单时的处理逻辑
        console.log('✅ 订单已确认，开始制作');
      }

      // TODO: 更新数据库
      console.log('📝 订单状态更新:', updateData);

      // TODO: 发送状态更新通知
      console.log('📧 发送状态更新通知:', { id, status });

      return {
        success: true,
        data: { id, status, notes },
        message: '订单状态更新成功',
      };
    } catch (error) {
      console.error('❌ 更新订单状态失败:', error);
      throw new Error(`更新订单状态失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(id: string, reason: string, refundAmount?: number): Promise<any> {
    try {
      if (!id) {
        throw new Error('订单ID不能为空');
      }

      // TODO: 验证订单状态是否可以取消
      console.log('🚫 取消订单:', { id, reason, refundAmount });

      // TODO: 恢复库存
      console.log('📦 恢复库存:', id);

      // TODO: 处理退款
      if (refundAmount && refundAmount > 0) {
        console.log('💰 处理退款:', { orderId: id, amount: refundAmount });
      }

      // TODO: 更新订单状态
      const updateData = {
        status: 'cancelled' as const,
        paymentStatus: 'refunded' as const,
        notes: reason,
        updatedAt: new Date(),
      };

      // TODO: 更新数据库
      console.log('📝 订单取消数据:', updateData);

      // TODO: 发送取消通知
      console.log('📧 发送取消通知:', { id, reason });

      return {
        success: true,
        data: { id, status: 'cancelled', reason, refundAmount },
        message: '订单取消成功',
      };
    } catch (error) {
      console.error('❌ 取消订单失败:', error);
      throw new Error(`取消订单失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 处理支付
   */
  async processPayment(id: string, paymentMethod: string, paymentDetails: any): Promise<any> {
    try {
      if (!id) {
        throw new Error('订单ID不能为空');
      }

      // TODO: 获取订单信息
      console.log('💳 处理支付:', { id, paymentMethod });

      // TODO: 调用支付网关
      console.log('🔗 调用支付网关:', paymentDetails);

      // 模拟支付结果
      const paymentResult = {
        success: true,
        transactionId: crypto.randomUUID(),
        amount: 100.00,
        currency: 'CNY',
      };

      // TODO: 更新订单支付状态
      const updateData = {
        paymentStatus: paymentResult.success ? 'paid' : 'failed',
        paymentMethod,
        updatedAt: new Date(),
      };

      // TODO: 更新数据库
      console.log('📝 支付状态更新:', updateData);

      // TODO: 发送支付成功通知
      if (paymentResult.success) {
        console.log('📧 发送支付成功通知:', { id, transactionId: paymentResult.transactionId });
      }

      return {
        success: paymentResult.success,
        data: {
          orderId: id,
          paymentResult,
          ...updateData,
        },
        message: paymentResult.success ? '支付成功' : '支付失败',
      };
    } catch (error) {
      console.error('❌ 处理支付失败:', error);
      throw new Error(`处理支付失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 获取订单统计
   */
  async getOrderStats(
    restaurantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OrderStats> {
    try {
      // TODO: 从数据库查询订单统计
      console.log('📊 查询订单统计:', { restaurantId, startDate, endDate });

      // 模拟数据
      const stats: OrderStats = {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        statusBreakdown: {
          pending: 0,
          confirmed: 0,
          preparing: 0,
          ready: 0,
          delivering: 0,
          completed: 0,
          cancelled: 0,
          refunded: 0,
        },
        paymentMethodBreakdown: {},
        orderTypeBreakdown: {
          dine_in: 0,
          takeaway: 0,
          delivery: 0,
        },
        dailyStats: [],
      };

      return stats;
    } catch (error) {
      console.error('❌ 获取订单统计失败:', error);
      throw new Error(`获取订单统计失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 生成销售报告
   */
  async generateSalesReport(
    startDate: Date,
    endDate: Date,
    restaurantId?: string
  ): Promise<OrderSalesReport> {
    try {
      // TODO: 从数据库查询销售数据
      console.log('📊 生成销售报告:', { startDate, endDate, restaurantId });

      // 模拟数据
      const report: OrderSalesReport = {
        period: { startDate, endDate },
        totalOrders: 0,
        totalRevenue: 0,
        topMenuItems: [],
        peakHours: [],
        averageOrderValue: 0,
        customerRetentionRate: 0,
      };

      return report;
    } catch (error) {
      console.error('❌ 生成销售报告失败:', error);
      throw new Error(`生成销售报告失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 分配送员
   */
  async assignDeliveryPersonnel(orderId: string, personnelId: string): Promise<any> {
    try {
      if (!orderId || !personnelId) {
        throw new Error('订单ID和配送员ID不能为空');
      }

      // TODO: 验证订单和配送员
      console.log('🚚 分配送员:', { orderId, personnelId });

      const assignment: OrderDeliveryAssignment = {
        orderId,
        deliveryPersonnelId: personnelId,
        assignedAt: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后
        status: 'assigned',
      };

      // TODO: 保存分配记录
      console.log('📝 保存配送分配:', assignment);

      // TODO: 通知配送员
      console.log('📱 通知配送员:', assignment);

      return {
        success: true,
        data: assignment,
        message: '配送员分配成功',
      };
    } catch (error) {
      console.error('❌ 分配送员失败:', error);
      throw new Error(`分配配送员失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 获取可用的配送员
   */
  async getAvailableDeliveryPersonnel(restaurantId: string): Promise<DeliveryPersonnel[]> {
    try {
      // TODO: 从数据库查询可用配送员
      console.log('🔍 查询可用配送员:', { restaurantId });

      // 模拟数据
      const personnel: DeliveryPersonnel[] = [];

      return personnel;
    } catch (error) {
      console.error('❌ 获取可用配送员失败:', error);
      throw new Error(`获取可用配送员失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 搜索订单
   */
  async searchOrders(keyword: string, filters?: Partial<OrderQuery>): Promise<OrderListResponse> {
    try {
      if (!keyword || keyword.trim().length === 0) {
        throw new Error('搜索关键词不能为空');
      }

      const searchQuery = {
        ...filters,
        search: keyword.trim(),
      };

      // TODO: 实现全文搜索
      console.log('🔍 搜索订单:', searchQuery);

      return this.getOrders(searchQuery);
    } catch (error) {
      console.error('❌ 搜索订单失败:', error);
      throw new Error(`搜索订单失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 生成订单号
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    const timeStr = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).slice(2, 5).toUpperCase();
    return `YYC${dateStr}${timeStr}${randomStr}`;
  }

  /**
   * 计算预计完成时间
   */
  private calculateEstimatedReadyTime(items: any[]): Date {
    // 基于菜品数量和平均制作时间计算
    const baseTime = 15; // 基础准备时间(分钟)
    const perItemTime = 3; // 每个菜品额外时间(分钟)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalMinutes = baseTime + (totalItems * perItemTime);

    return new Date(Date.now() + totalMinutes * 60 * 1000);
  }

  /**
   * 计算价格明细
   */
  private calculatePriceBreakdown(items: any[], promoCode?: string): any {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discount = 0;
    if (promoCode) {
      // TODO: 实现优惠券逻辑
      discount = 0;
    }

    const tax = subtotal * 0.1; // 10% 税率
    const deliveryFee = 5; // 配送费
    const total = subtotal - discount + tax + deliveryFee;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: string, notes?: string): Promise<any> {
    try {
      if (!id) {
        throw new Error('订单ID不能为空');
      }

      await dbManager.createPool();

      // 先检查订单是否存在
      const existingResult = await dbManager.query('SELECT id, status FROM orders WHERE id = $1', [id]);
      if (existingResult.rows.length === 0) {
        throw new Error('订单不存在');
      }

      const oldStatus = existingResult.rows[0].status;

      // 更新订单状态
      const result = await dbManager.query(`
        UPDATE orders
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, updated_at
      `, [status, id]);

      // 添加状态变更日志
      await this.addOrderLog(id, 'status_changed', `订单状态从 ${oldStatus} 变更为 ${status}`, null, '系统');

      console.log(`✅ 订单状态更新成功: ${id} -> ${status}`);

      return {
        success: true,
        data: { id, status, updatedAt: result.rows[0].updated_at },
        message: '订单状态更新成功',
      };
    } catch (error) {
      console.error('❌ 更新订单状态失败:', error);
      throw new Error(`更新订单状态失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 添加订单日志
   */
  async addOrderLog(
    orderId: string,
    action: string,
    description: string,
    operatorId?: string,
    operatorName?: string,
    metadata?: any
  ): Promise<any> {
    try {
      if (!orderId || !action) {
        throw new Error('订单ID和操作类型不能为空');
      }

      await dbManager.createPool();

      const result = await dbManager.query(`
        INSERT INTO order_logs (order_id, action, description, operator_id, operator_name, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, timestamp
      `, [
        orderId,
        action,
        description,
        operatorId || null,
        operatorName || null,
        JSON.stringify(metadata || {})
      ]);

      console.log(`✅ 订单日志添加成功: ${orderId} - ${action}`);

      return {
        success: true,
        data: {
          id: result.rows[0].id,
          orderId,
          action,
          description,
          timestamp: result.rows[0].timestamp,
        },
        message: '订单日志添加成功',
      };
    } catch (error) {
      console.error('❌ 添加订单日志失败:', error);
      throw new Error(`添加订单日志失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 获取订单统计
   */
  async getOrderStats(
    restaurantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OrderStats> {
    try {
      await dbManager.createPool();

      const conditions = [];
      const params = [];
      let paramIndex = 1;

      if (restaurantId) {
        conditions.push(`restaurant_id = $${paramIndex++}`);
        params.push(restaurantId);
      }

      if (startDate) {
        conditions.push(`created_at >= $${paramIndex++}`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`created_at <= $${paramIndex++}`);
        params.push(endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await dbManager.query(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
          COALESCE(SUM((price_breakdown->>'total')::decimal), 0) as total_revenue,
          COALESCE(AVG((price_breakdown->>'total')::decimal), 0) as avg_order_value
        FROM orders
        ${whereClause}
      `, params);

      const stats: OrderStats = {
        totalOrders: parseInt(result.rows[0].total_orders),
        completedOrders: parseInt(result.rows[0].completed_orders),
        cancelledOrders: parseInt(result.rows[0].cancelled_orders),
        paidOrders: parseInt(result.rows[0].paid_orders),
        totalRevenue: parseFloat(result.rows[0].total_revenue),
        avgOrderValue: parseFloat(result.rows[0].avg_order_value),
      };

      console.log('✅ 获取订单统计成功');

      return stats;
    } catch (error) {
      console.error('❌ 获取订单统计失败:', error);
      throw new Error(`获取订单统计失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }

  /**
   * 获取销量报告
   */
  async getSalesReport(
    startDate: Date,
    endDate: Date,
    restaurantId?: string
  ): Promise<OrderSalesReport[]> {
    try {
      await dbManager.createPool();

      const conditions = ['created_at >= $1', 'created_at <= $2'];
      const params = [startDate, endDate];
      let paramIndex = 3;

      if (restaurantId) {
        conditions.push(`restaurant_id = $${paramIndex++}`);
        params.push(restaurantId);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const result = await dbManager.query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as order_count,
          COALESCE(SUM((price_breakdown->>'total')::decimal), 0) as revenue,
          COALESCE(AVG((price_breakdown->>'total')::decimal), 0) as avg_order_value
        FROM orders
        ${whereClause}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `, params);

      const salesReport: OrderSalesReport[] = result.rows.map(row => ({
        date: row.date,
        orderCount: parseInt(row.order_count),
        revenue: parseFloat(row.revenue),
        avgOrderValue: parseFloat(row.avg_order_value),
      }));

      console.log(`✅ 获取销量报告成功: 返回 ${salesReport.length} 天的数据`);

      return salesReport;
    } catch (error) {
      console.error('❌ 获取销量报告失败:', error);
      throw new Error(`获取销量报告失败: ${(error instanceof Error ? error.message : "未知错误")}`);
    }
  }
}