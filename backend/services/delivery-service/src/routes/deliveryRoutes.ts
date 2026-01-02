/**
 * @file 配送服务路由配置
 * @description 定义配送相关的API端点
 * @module routes/deliveryRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { deliveryController } from '../controllers/DeliveryController';

const router = Router();

/**
 * 创建配送
 * @route POST /api/deliveries
 * @access 私有
 */
router.post('/', deliveryController.createDelivery);

/**
 * 获取配送详情
 * @route GET /api/deliveries/:delivery_id
 * @access 私有
 */
router.get('/:delivery_id', deliveryController.getDeliveryDetails);

/**
 * 获取订单的配送信息
 * @route GET /api/deliveries/order/:order_id
 * @access 私有
 */
router.get('/order/:order_id', deliveryController.getDeliveryByOrder);

/**
 * 更新配送状态
 * @route PUT /api/deliveries/:delivery_id/status
 * @access 私有
 */
router.put('/:delivery_id/status', deliveryController.updateDeliveryStatus);

/**
 * 分配配送任务给骑手
 * @route POST /api/deliveries/:delivery_id/assign
 * @access 私有
 */
router.post('/:delivery_id/assign', deliveryController.assignDelivery);

/**
 * 骑手接受配送任务
 * @route POST /api/deliveries/assignments/:assignment_id/accept
 * @access 私有
 */
router.post('/assignments/:assignment_id/accept', deliveryController.acceptDelivery);

/**
 * 骑手拒绝配送任务
 * @route POST /api/deliveries/assignments/:assignment_id/reject
 * @access 私有
 */
router.post('/assignments/:assignment_id/reject', deliveryController.rejectDelivery);

/**
 * 创建配送评分
 * @route POST /api/deliveries/ratings
 * @access 私有
 */
router.post('/ratings', deliveryController.createDeliveryRating);

export default router;