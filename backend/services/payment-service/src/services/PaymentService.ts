/**
 * @file 支付服务业务逻辑层
 * @description 处理支付相关的核心业务逻辑，包括创建支付、处理回调、退款等功能
 * @module services/PaymentService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import Payment, { PaymentStatus, PaymentMethod } from '../models/Payment.model';
import PaymentRefund, { RefundStatus, RefundReason } from '../models/PaymentRefund.model';
import Transaction, { TransactionType, TransactionStatus } from '../models/Transaction.model';

// 创建支付请求参数接口
interface CreatePaymentParams {
  order_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  metadata?: Record<string, any>;
}

// 处理支付回调请求参数接口
interface ProcessPaymentCallbackParams {
  transaction_id: string;
  order_id: string;
  status: string;
  amount: number;
  payment_method: string;
  channel: string;
  channel_response: Record<string, any>;
}

// 发起退款请求参数接口
interface CreateRefundParams {
  payment_id: string;
  order_id: string;
  amount: number;
  reason: RefundReason;
  reason_details?: string;
  metadata?: Record<string, any>;
}

// 支付服务类
export class PaymentService {
  /**
   * 创建支付记录
   * @param params 创建支付参数
   * @returns Promise<Payment> 创建的支付记录
   */
  public async createPayment(params: CreatePaymentParams): Promise<Payment> {
    try {
      logger.info('创建支付记录', { params });

      // 检查订单是否存在（实际项目中应该调用订单服务API）
      // const orderExists = await this.checkOrderExists(params.order_id);
      // if (!orderExists) {
      //   throw new Error('订单不存在');
      // }

      // 创建支付记录
      const payment = await Payment.create({
        id: uuidv4(),
        order_id: params.order_id,
        user_id: params.user_id,
        amount: params.amount,
        status: PaymentStatus.PENDING,
        payment_method: params.payment_method,
        metadata: params.metadata,
      });

      // 创建交易记录
      await Transaction.create({
        id: uuidv4(),
        payment_id: payment.id,
        order_id: params.order_id,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.INITIATED,
        amount: params.amount,
        currency: 'CNY',
        transaction_id: uuidv4(), // 生成临时交易ID，后续由支付渠道返回实际ID
        channel: params.payment_method,
        metadata: params.metadata,
      });

      logger.info('支付记录创建成功', { payment_id: payment.id });
      return payment;
    } catch (error) {
      logger.error('创建支付记录失败', { error: error.message, params });
      throw error;
    }
  }

  /**
   * 处理支付回调
   * @param params 支付回调参数
   * @returns Promise<Payment> 更新后的支付记录
   */
  public async processPaymentCallback(params: ProcessPaymentCallbackParams): Promise<Payment> {
    try {
      logger.info('处理支付回调', { params });

      // 根据订单ID查询支付记录
      const payment = await Payment.findOne({
        where: { order_id: params.order_id },
      });

      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 验证金额是否匹配
      if (payment.amount !== params.amount) {
        throw new Error('支付金额不匹配');
      }

      // 更新支付状态
      let paymentStatus: PaymentStatus;
      switch (params.status) {
        case 'SUCCESS':
          paymentStatus = PaymentStatus.COMPLETED;
          break;
        case 'FAILED':
          paymentStatus = PaymentStatus.FAILED;
          break;
        case 'CANCELLED':
          paymentStatus = PaymentStatus.CANCELLED;
          break;
        default:
          paymentStatus = PaymentStatus.PENDING;
      }

      // 更新支付记录
      await payment.update({
        status: paymentStatus,
        transaction_id: params.transaction_id,
        payment_channel: params.channel,
        payment_time: new Date(),
        ...(paymentStatus === PaymentStatus.FAILED && { failure_reason: params.channel_response.error_message }),
      });

      // 创建交易记录
      await Transaction.create({
        id: uuidv4(),
        payment_id: payment.id,
        order_id: params.order_id,
        type: TransactionType.PAYMENT,
        status: paymentStatus === PaymentStatus.COMPLETED ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
        amount: params.amount,
        currency: 'CNY',
        transaction_id: params.transaction_id,
        channel: params.channel,
        channel_response: params.channel_response,
        ...(paymentStatus === PaymentStatus.FAILED && { channel_error: params.channel_response }),
      });

      // 如果支付成功，调用订单服务更新订单状态
      if (paymentStatus === PaymentStatus.COMPLETED) {
        await this.updateOrderStatus(params.order_id, 'PAID');
      }

      logger.info('支付回调处理成功', { payment_id: payment.id, status: paymentStatus });
      return payment;
    } catch (error) {
      logger.error('处理支付回调失败', { error: error.message, params });
      throw error;
    }
  }

  /**
   * 发起退款
   * @param params 退款参数
   * @returns Promise<PaymentRefund> 创建的退款记录
   */
  public async createRefund(params: CreateRefundParams): Promise<PaymentRefund> {
    try {
      logger.info('发起退款', { params });

      // 查询支付记录
      const payment = await Payment.findByPk(params.payment_id);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 检查退款金额是否合法
      if (params.amount <= 0) {
        throw new Error('退款金额必须大于0');
      }

      if (params.amount > payment.amount - (payment.refund_amount || 0)) {
        throw new Error('退款金额超过可退金额');
      }

      // 创建退款记录
      const refund = await PaymentRefund.create({
        id: uuidv4(),
        payment_id: params.payment_id,
        order_id: params.order_id,
        refund_amount: params.amount,
        status: RefundStatus.PROCESSING,
        reason: params.reason,
        reason_details: params.reason_details,
        metadata: params.metadata,
      });

      // 创建退款交易记录
      await Transaction.create({
        id: uuidv4(),
        payment_id: params.payment_id,
        order_id: params.order_id,
        type: TransactionType.REFUND,
        status: TransactionStatus.PROCESSING,
        amount: params.amount,
        currency: 'CNY',
        transaction_id: uuidv4(), // 生成临时交易ID
        channel: payment.payment_method,
        metadata: params.metadata,
      });

      // TODO: 调用支付渠道API发起实际退款
      // const channelRefundResult = await this.callPaymentChannelRefund({
      //   payment_id: params.payment_id,
      //   amount: params.amount,
      //   reason: params.reason,
      // });

      // 更新退款记录状态
      await refund.update({
        status: RefundStatus.COMPLETED,
        refund_transaction_id: uuidv4(), // 替换为支付渠道返回的退款交易ID
        refund_channel: payment.payment_method,
        refund_time: new Date(),
      });

      // 更新支付记录的退款金额
      await payment.update({
        refund_amount: (payment.refund_amount || 0) + params.amount,
        ...(payment.amount === (payment.refund_amount || 0) + params.amount && { status: PaymentStatus.REFUNDED }),
      });

      // 如果全额退款，调用订单服务更新订单状态
      if (payment.amount === (payment.refund_amount || 0) + params.amount) {
        await this.updateOrderStatus(params.order_id, 'REFUNDED');
      }

      logger.info('退款发起成功', { refund_id: refund.id });
      return refund;
    } catch (error) {
      logger.error('发起退款失败', { error: error.message, params });
      throw error;
    }
  }

  /**
   * 查询支付状态
   * @param payment_id 支付ID
   * @returns Promise<Payment> 支付记录
   */
  public async getPaymentStatus(payment_id: string): Promise<Payment> {
    try {
      logger.info('查询支付状态', { payment_id });

      const payment = await Payment.findByPk(payment_id);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      return payment;
    } catch (error) {
      logger.error('查询支付状态失败', { error: error.message, payment_id });
      throw error;
    }
  }

  /**
   * 取消支付
   * @param payment_id 支付ID
   * @returns Promise<Payment> 更新后的支付记录
   */
  public async cancelPayment(payment_id: string): Promise<Payment> {
    try {
      logger.info('取消支付', { payment_id });

      const payment = await Payment.findByPk(payment_id);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.PROCESSING) {
        throw new Error('支付状态不允许取消');
      }

      // 更新支付状态
      await payment.update({
        status: PaymentStatus.CANCELLED,
      });

      // 创建交易记录
      await Transaction.create({
        id: uuidv4(),
        payment_id: payment_id,
        order_id: payment.order_id,
        type: TransactionType.VOID,
        status: TransactionStatus.COMPLETED,
        amount: payment.amount,
        currency: 'CNY',
        transaction_id: uuidv4(),
        channel: payment.payment_method,
        metadata: { reason: '用户取消支付' },
      });

      // 调用订单服务更新订单状态
      await this.updateOrderStatus(payment.order_id, 'CANCELLED');

      logger.info('支付取消成功', { payment_id });
      return payment;
    } catch (error) {
      logger.error('取消支付失败', { error: error.message, payment_id });
      throw error;
    }
  }

  /**
   * 检查订单是否存在
   * @param order_id 订单ID
   * @returns Promise<boolean> 订单是否存在
   */
  private async checkOrderExists(order_id: string): Promise<boolean> {
    try {
      // TODO: 调用订单服务API检查订单是否存在
      // const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/orders/${order_id}`);
      // return response.status === 200;
      return true; // 模拟订单存在
    } catch (error) {
      logger.error('检查订单存在性失败', { error: error.message, order_id });
      return false;
    }
  }

  /**
   * 更新订单状态
   * @param order_id 订单ID
   * @param status 新状态
   * @returns Promise<void>
   */
  private async updateOrderStatus(order_id: string, status: string): Promise<void> {
    try {
      // TODO: 调用订单服务API更新订单状态
      // await axios.patch(`${process.env.ORDER_SERVICE_URL}/orders/${order_id}/status`, {
      //   status,
      // });
      logger.info('订单状态更新成功', { order_id, status });
    } catch (error) {
      logger.error('更新订单状态失败', { error: error.message, order_id, status });
      // 不抛出错误，避免影响支付流程
    }
  }
}

// 导出支付服务实例
export const paymentService = new PaymentService();