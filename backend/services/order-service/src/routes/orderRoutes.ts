/**
 * @file 订单路由
 * @description 定义订单相关的API路由
 * @author YYC³
 * @version 1.0.0
 */
import { Router } from 'express';
import { orderController } from '../controllers/OrderController';

const router = Router();

// 创建订单
router.post('/', orderController.createOrder);

// 获取订单详情
router.get('/:id', orderController.getOrderById);

// 获取订单列表
router.get('/', orderController.getOrders);

// 更新订单状态
router.patch('/:id/status', orderController.updateOrderStatus);

// 更新支付状态
router.patch('/:id/payment', orderController.updatePaymentStatus);

// 取消订单
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;