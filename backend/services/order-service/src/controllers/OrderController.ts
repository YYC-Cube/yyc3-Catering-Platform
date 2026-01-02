/**
 * @file 订单控制器
 * @description 处理订单相关的HTTP请求
 * @author YYC³
 * @version 1.0.0
 */
import { Request, Response } from 'express';
import { orderService, CreateOrderParams, UpdateOrderStatusParams, GetOrdersParams } from '../services/OrderService';
import { OrderStatus, PaymentStatus } from '../models/Order.model';
import logger from '../config/logger';

export class OrderController {
  // 创建订单
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const params: CreateOrderParams = req.body;
      const order = await orderService.createOrder(params);
      
      logger.info(`Order ${order.id} created successfully`);
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      logger.error('Error creating order:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // 获取订单详情
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id, 10);
      
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, error: 'Invalid order ID' });
        return;
      }

      const order = await orderService.getOrderById(orderId);
      
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      logger.info(`Retrieved order ${orderId} details`);
      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      logger.error('Error getting order details:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 获取订单列表
  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const params: GetOrdersParams = {
        user_id: req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined,
        restaurant_id: req.query.restaurant_id ? parseInt(req.query.restaurant_id as string, 10) : undefined,
        status: req.query.status as OrderStatus | undefined,
        delivery_type: req.query.delivery_type as any,
        payment_status: req.query.payment_status as PaymentStatus | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
        end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined
      };

      const result = await orderService.getOrders(params);
      
      logger.info(`Retrieved ${result.orders.length} orders out of ${result.total}`);
      res.status(200).json({
        success: true,
        data: result.orders,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: any) {
      logger.error('Error getting orders:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 更新订单状态
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { status, changed_by, note } = req.body;
      
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, error: 'Invalid order ID' });
        return;
      }

      if (!status) {
        res.status(400).json({ success: false, error: 'Status is required' });
        return;
      }

      const params: UpdateOrderStatusParams = {
        order_id: orderId,
        status,
        changed_by,
        note
      };

      const order = await orderService.updateOrderStatus(params);
      
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      logger.info(`Updated order ${orderId} status to ${status}`);
      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      logger.error('Error updating order status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 更新支付状态
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { status, transaction_id } = req.body;
      
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, error: 'Invalid order ID' });
        return;
      }

      if (!status) {
        res.status(400).json({ success: false, error: 'Payment status is required' });
        return;
      }

      const payment = await orderService.updatePaymentStatus(orderId, status, transaction_id);
      
      if (!payment) {
        res.status(404).json({ success: false, error: 'Payment record not found' });
        return;
      }

      logger.info(`Updated payment status for order ${orderId} to ${status}`);
      res.status(200).json({ success: true, data: payment });
    } catch (error: any) {
      logger.error('Error updating payment status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 取消订单
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { user_id, reason } = req.body;
      
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, error: 'Invalid order ID' });
        return;
      }

      if (!user_id || !reason) {
        res.status(400).json({ success: false, error: 'User ID and reason are required' });
        return;
      }

      const order = await orderService.cancelOrder(orderId, user_id, reason);
      
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      logger.info(`Cancelled order ${orderId}`);
      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      logger.error('Error cancelling order:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const orderController = new OrderController();