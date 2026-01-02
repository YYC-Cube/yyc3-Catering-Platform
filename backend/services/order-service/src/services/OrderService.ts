/**
 * @file 订单服务
 * @description 处理订单相关业务逻辑
 * @author YYC³
 * @version 1.0.0
 */
import { Order, OrderStatus, PaymentStatus, DeliveryType } from '../models/Order.model';
import { OrderItem } from '../models/OrderItem.model';
import { OrderItemOption } from '../models/OrderItemOption.model';
import { OrderPayment } from '../models/OrderPayment.model';
import { OrderStatusHistory } from '../models/OrderStatusHistory.model';
import logger from '../config/logger';

// 创建订单参数接口
export interface CreateOrderParams {
  user_id: number;
  restaurant_id?: number;
  delivery_type: DeliveryType;
  delivery_address?: string;
  delivery_phone?: string;
  delivery_contact?: string;
  scheduled_time?: Date;
  notes?: string;
  order_items: Array<{
    menu_item_id: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image_url?: string;
    options?: Array<{
      option_id: number;
      name: string;
      price: number;
      quantity: number;
    }>;
  }>;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total_amount: number;
}

// 更新订单状态参数接口
export interface UpdateOrderStatusParams {
  order_id: number;
  status: OrderStatus;
  changed_by?: number;
  note?: string;
}

// 分页查询参数接口
export interface GetOrdersParams {
  user_id?: number;
  restaurant_id?: number;
  status?: OrderStatus;
  delivery_type?: DeliveryType;
  payment_status?: PaymentStatus;
  page?: number;
  limit?: number;
  start_date?: Date;
  end_date?: Date;
}

export class OrderService {
  // 创建订单
  async createOrder(params: CreateOrderParams): Promise<Order> {
    try {
      logger.info(`Creating order for user ${params.user_id}`);
      
      // 开始事务
      const order = await Order.sequelize?.transaction(async (transaction) => {
        // 创建订单主记录
        const newOrder = await Order.create({
          user_id: params.user_id,
          restaurant_id: params.restaurant_id,
          delivery_type: params.delivery_type,
          delivery_address: params.delivery_address,
          delivery_phone: params.delivery_phone,
          delivery_contact: params.delivery_contact,
          scheduled_time: params.scheduled_time,
          notes: params.notes,
          subtotal: params.subtotal,
          tax: params.tax,
          delivery_fee: params.delivery_fee,
          discount: params.discount,
          total_amount: params.total_amount
        }, { transaction });

        // 创建订单项
        for (const item of params.order_items) {
          const orderItem = await OrderItem.create({
            order_id: newOrder.id,
            menu_item_id: item.menu_item_id,
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url
          }, { transaction });

          // 创建订单项选项
          if (item.options && item.options.length > 0) {
            await OrderItemOption.bulkCreate(
              item.options.map(option => ({
                order_item_id: orderItem.id,
                option_id: option.option_id,
                name: option.name,
                price: option.price,
                quantity: option.quantity
              })),
              { transaction }
            );
          }
        }

        // 创建订单支付记录
        await OrderPayment.create({
          order_id: newOrder.id,
          payment_method: 'wallet', // 默认支付方式
          amount: params.total_amount
        }, { transaction });

        // 创建订单状态历史记录
        await OrderStatusHistory.create({
          order_id: newOrder.id,
          status: OrderStatus.PENDING,
          note: 'Order created'
        }, { transaction });

        return newOrder;
      });

      if (!order) {
        throw new Error('Failed to create order');
      }

      logger.info(`Order ${order.id} created successfully for user ${params.user_id}`);
      return order;
    } catch (error) {
      logger.error(`Error creating order for user ${params.user_id}:`, error);
      throw error;
    }
  }

  // 根据ID获取订单详情
  async getOrderById(orderId: number): Promise<Order | null> {
    try {
      logger.info(`Getting order details for order ${orderId}`);
      
      const order = await Order.findByPk(orderId, {
        include: [
          { model: OrderItem, include: [OrderItemOption] },
          { model: OrderPayment },
          { model: OrderStatusHistory }
        ]
      });

      if (!order) {
        logger.warn(`Order ${orderId} not found`);
      }

      return order;
    } catch (error) {
      logger.error(`Error getting order ${orderId}:`, error);
      throw error;
    }
  }

  // 更新订单状态
  async updateOrderStatus(params: UpdateOrderStatusParams): Promise<Order | null> {
    try {
      logger.info(`Updating order ${params.order_id} status to ${params.status}`);
      
      // 开始事务
      const order = await Order.sequelize?.transaction(async (transaction) => {
        // 更新订单状态
        const updatedOrder = await Order.findByPk(params.order_id, { transaction });
        
        if (!updatedOrder) {
          throw new Error(`Order ${params.order_id} not found`);
        }

        updatedOrder.status = params.status;
        await updatedOrder.save({ transaction });

        // 创建订单状态历史记录
        await OrderStatusHistory.create({
          order_id: params.order_id,
          status: params.status,
          note: params.note,
          changed_by: params.changed_by
        }, { transaction });

        return updatedOrder;
      });

      if (!order) {
        throw new Error('Failed to update order status');
      }

      logger.info(`Order ${params.order_id} status updated to ${params.status}`);
      return order;
    } catch (error) {
      logger.error(`Error updating order ${params.order_id} status:`, error);
      throw error;
    }
  }

  // 更新支付状态
  async updatePaymentStatus(orderId: number, status: PaymentStatus, transactionId?: string): Promise<OrderPayment | null> {
    try {
      logger.info(`Updating payment status for order ${orderId} to ${status}`);
      
      const payment = await OrderPayment.findOne({ where: { order_id: orderId } });
      
      if (!payment) {
        logger.warn(`Payment record not found for order ${orderId}`);
        return null;
      }

      payment.status = status;
      
      if (status === PaymentStatus.PAID) {
        payment.paid_at = new Date();
        if (transactionId) {
          payment.transaction_id = transactionId;
        }
      } else if (status === PaymentStatus.REFUNDED) {
        payment.refunded_at = new Date();
      }

      await payment.save();

      // 如果支付成功，更新订单状态
      if (status === PaymentStatus.PAID) {
        await this.updateOrderStatus({
          order_id: orderId,
          status: OrderStatus.CONFIRMED,
          note: 'Payment completed, order confirmed'
        });
      }

      logger.info(`Payment status updated for order ${orderId}`);
      return payment;
    } catch (error) {
      logger.error(`Error updating payment status for order ${orderId}:`, error);
      throw error;
    }
  }

  // 获取订单列表
  async getOrders(params: GetOrdersParams): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    try {
      logger.info(`Getting orders with params: ${JSON.stringify(params)}`);
      
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;
      
      const whereConditions: any = {};
      
      if (params.user_id) whereConditions.user_id = params.user_id;
      if (params.restaurant_id) whereConditions.restaurant_id = params.restaurant_id;
      if (params.status) whereConditions.status = params.status;
      if (params.delivery_type) whereConditions.delivery_type = params.delivery_type;
      if (params.start_date) whereConditions.created_at = { [Order.sequelize?.Op.gte]: params.start_date };
      if (params.end_date) whereConditions.created_at = { ...whereConditions.created_at, [Order.sequelize?.Op.lte]: params.end_date };
      
      const { rows: orders, count: total } = await Order.findAndCountAll({
        where: whereConditions,
        include: [
          { model: OrderItem },
          { model: OrderPayment, where: params.payment_status ? { status: params.payment_status } : {} }
        ],
        order: [['created_at', 'DESC']],
        offset,
        limit
      });

      logger.info(`Retrieved ${orders.length} orders out of ${total}`);
      
      return {
        orders,
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error getting orders:', error);
      throw error;
    }
  }

  // 取消订单
  async cancelOrder(orderId: number, userId: number, reason: string): Promise<Order | null> {
    try {
      logger.info(`Cancelling order ${orderId} by user ${userId}`);
      
      // 开始事务
      const order = await Order.sequelize?.transaction(async (transaction) => {
        const updatedOrder = await Order.findByPk(orderId, { transaction });
        
        if (!updatedOrder) {
          throw new Error(`Order ${orderId} not found`);
        }

        // 检查是否可以取消订单
        if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(updatedOrder.status)) {
          throw new Error(`Order ${orderId} cannot be cancelled`);
        }

        // 更新订单状态
        updatedOrder.status = OrderStatus.CANCELLED;
        updatedOrder.is_cancelled = true;
        updatedOrder.cancelled_by = userId;
        updatedOrder.cancellation_reason = reason;
        await updatedOrder.save({ transaction });

        // 创建订单状态历史记录
        await OrderStatusHistory.create({
          order_id: orderId,
          status: OrderStatus.CANCELLED,
          note: reason,
          changed_by: userId
        }, { transaction });

        // 更新支付状态为已退款（如果已支付）
        const payment = await OrderPayment.findOne({ where: { order_id: orderId }, transaction });
        if (payment && payment.status === PaymentStatus.PAID) {
          payment.status = PaymentStatus.REFUNDED;
          payment.refunded_at = new Date();
          payment.refund_reason = reason;
          await payment.save({ transaction });
        }

        return updatedOrder;
      });

      if (!order) {
        throw new Error('Failed to cancel order');
      }

      logger.info(`Order ${orderId} cancelled successfully`);
      return order;
    } catch (error) {
      logger.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }
}

export const orderService = new OrderService();