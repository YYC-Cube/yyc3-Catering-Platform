/**
 * @file 支付控制器
 * @description 处理支付相关的HTTP请求和响应
 * @module controllers/PaymentController
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import logger from '../config/logger';
import { paymentService } from '../services/PaymentService';
import { PaymentStatus, PaymentMethod } from '../models/Payment.model';
import { RefundReason } from '../models/PaymentRefund.model';

// 支付控制器类
export class PaymentController {
  /**
   * 创建支付
   * @param req Express请求对象
   * @param res Express响应对象
   * @returns Promise<void>
   */
  public async createPayment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('创建支付请求', { body: req.body });

      // 验证请求参数
      const { order_id, user_id, amount, payment_method, metadata } = req.body;
      if (!order_id || !user_id || !amount || !payment_method) {
        res.status(400).json({ success: false, error: '缺少必要参数' });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({ success: false, error: '支付金额必须大于0' });
        return;
      }

      // 验证支付方式
      if (!Object.values(PaymentMethod).includes(payment_method)) {
        res.status(400).json({ success: false, error: '不支持的支付方式' });
        return;
      }

      // 创建支付
      const payment = await paymentService.createPayment({
        order_id,
        user_id,
        amount,
        payment_method,
        metadata,
      });

      logger.info('支付创建成功', { payment_id: payment.id });
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      logger.error('创建支付失败', { error: (error as Error).message, body: req.body });
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  /**
   * 处理支付回调
   * @param req Express请求对象
   * @param res Express响应对象
   * @returns Promise<void>
   */
  public async processPaymentCallback(req: Request, res: Response): Promise<void> {
    try {
      logger.info('支付回调请求', { body: req.body, query: req.query });

      // 获取回调参数（兼容不同支付渠道的参数格式）
      const callbackParams = req.body || req.query;
      const { transaction_id, order_id, status, amount, payment_method, channel, channel_response } = callbackParams;

      if (!transaction_id || !order_id || !status || !amount) {
        res.status(400).json({ success: false, error: '回调参数不完整' });
        return;
      }

      // 处理支付回调
      const updatedPayment = await paymentService.processPaymentCallback({
        transaction_id,
        order_id,
        status,
        amount: Number(amount),
        payment_method: payment_method || channel || '',
        channel: channel || payment_method || '',
        channel_response: channel_response || callbackParams,
      });

      logger.info('支付回调处理成功', { payment_id: updatedPayment.id });
      res.status(200).json({ success: true, message: '回调处理成功', data: updatedPayment });
    } catch (error) {
      logger.error('处理支付回调失败', { error: (error as Error).message, body: req.body, query: req.query });
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  /**
   * 获取支付详情
   * @param req Express请求对象
   * @param res Express响应对象
   * @returns Promise<void>
   */
  public async getPaymentDetails(req: Request, res: Response): Promise<void> {
    try {
      logger.info('获取支付详情请求', { params: req.params });

      const { payment_id } = req.params;
      if (!payment_id) {
        res.status(400).json({ success: false, error: '缺少支付ID参数' });
        return;
      }

      const payment = await paymentService.getPaymentStatus(payment_id);

      logger.info('获取支付详情成功', { payment_id });
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      logger.error('获取支付详情失败', { error: (error as Error).message, params: req.params });
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  /**
   * 发起退款
   * @param req Express请求对象
   * @param res Express响应对象
   * @returns Promise<void>
   */
  public async createRefund(req: Request, res: Response): Promise<void> {
    try {
      logger.info('发起退款请求', { body: req.body });

      // 验证请求参数
      const { payment_id, order_id, amount, reason, reason_details, metadata } = req.body;
      if (!payment_id || !order_id || !amount || !reason) {
        res.status(400).json({ success: false, error: '缺少必要参数' });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({ success: false, error: '退款金额必须大于0' });
        return;
      }

      // 验证退款原因
      if (!Object.values(RefundReason).includes(reason)) {
        res.status(400).json({ success: false, error: '不支持的退款原因' });
        return;
      }

      // 发起退款
      const refund = await paymentService.createRefund({
        payment_id,
        order_id,
        amount,
        reason,
        reason_details,
        metadata,
      });

      logger.info('退款发起成功', { refund_id: refund.id });
      res.status(201).json({ success: true, data: refund });
    } catch (error) {
      logger.error('发起退款失败', { error: (error as Error).message, body: req.body });
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  /**
   * 取消支付
   * @param req Express请求对象
   * @param res Express响应对象
   * @returns Promise<void>
   */
  public async cancelPayment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('取消支付请求', { params: req.params });

      const { payment_id } = req.params;
      if (!payment_id) {
        res.status(400).json({ success: false, error: '缺少支付ID参数' });
        return;
      }

      const cancelledPayment = await paymentService.cancelPayment(payment_id);

      logger.info('支付取消成功', { payment_id });
      res.status(200).json({ success: true, data: cancelledPayment });
    } catch (error) {
      logger.error('取消支付失败', { error: (error as Error).message, params: req.params });
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  /**
   * 查询支付状态
   * @param req Express请求对象
   * @param res Express响应对象
   * @returns Promise<void>
   */
  public async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      logger.info('查询支付状态请求', { params: req.params });

      const { payment_id } = req.params;
      if (!payment_id) {
        res.status(400).json({ success: false, error: '缺少支付ID参数' });
        return;
      }

      const payment = await paymentService.getPaymentStatus(payment_id);

      logger.info('查询支付状态成功', { payment_id, status: payment.status });
      res.status(200).json({ success: true, data: { status: payment.status, amount: payment.amount } });
    } catch (error) {
      logger.error('查询支付状态失败', { error: (error as Error).message, params: req.params });
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}

// 导出支付控制器实例
export const paymentController = new PaymentController();