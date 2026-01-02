/**
 * @file 支付服务路由配置
 * @description 定义支付服务的API端点
 * @module routes/paymentRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { paymentController } from '../controllers/PaymentController';

// 创建路由实例
const router = Router();

/**
 * @route POST /api/payments
 * @description 创建支付记录
 * @access 私有
 * @returns {Promise<Response>} 创建的支付记录
 */
router.post('/payments', paymentController.createPayment);

/**
 * @route POST /api/payments/callback
 * @description 处理支付回调
 * @access 公开 (由支付渠道调用)
 * @returns {Promise<Response>} 支付回调处理结果
 */
router.post('/payments/callback', paymentController.processPaymentCallback);

/**
 * @route GET /api/payments/:payment_id
 * @description 获取支付详情
 * @access 私有
 * @param {string} payment_id - 支付ID
 * @returns {Promise<Response>} 支付详情
 */
router.get('/payments/:payment_id', paymentController.getPaymentDetails);

/**
 * @route POST /api/payments/:payment_id/refund
 * @description 发起退款
 * @access 私有
 * @param {string} payment_id - 支付ID
 * @returns {Promise<Response>} 创建的退款记录
 */
router.post('/payments/:payment_id/refund', paymentController.createRefund);

/**
 * @route POST /api/payments/:payment_id/cancel
 * @description 取消支付
 * @access 私有
 * @param {string} payment_id - 支付ID
 * @returns {Promise<Response>} 取消后的支付记录
 */
router.post('/payments/:payment_id/cancel', paymentController.cancelPayment);

/**
 * @route GET /api/payments/:payment_id/status
 * @description 查询支付状态
 * @access 私有
 * @param {string} payment_id - 支付ID
 * @returns {Promise<Response>} 支付状态
 */
router.get('/payments/:payment_id/status', paymentController.getPaymentStatus);

// 导出路由
module.exports = router;