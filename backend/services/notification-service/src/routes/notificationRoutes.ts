/**
 * @file 通知路由
 * @description 定义通知服务的API端点
 * @module routes/notificationRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationType } from '../enums/NotificationType';

const router = express.Router();
const notificationController = new NotificationController();

/**
 * @route POST /api/notifications
 * @description 创建并发送通知
 * @access 私有（需要认证）
 */
router.post('/', notificationController.sendNotification);

/**
 * @route GET /api/notifications
 * @description 获取当前用户的通知列表
 * @access 私有（需要认证）
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route GET /api/notifications/:id
 * @description 获取通知详情
 * @access 私有（需要认证）
 */
router.get('/:id', notificationController.getNotificationById);

/**
 * @route PUT /api/notifications/:id/read
 * @description 标记通知为已读
 * @access 私有（需要认证）
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @route PUT /api/notifications/read-all
 * @description 标记所有通知为已读
 * @access 私有（需要认证）
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @description 删除通知
 * @access 私有（需要认证）
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * @route GET /api/notifications/preferences
 * @description 获取当前用户的通知偏好
 * @access 私有（需要认证）
 */
router.get('/preferences', notificationController.getUserNotificationPreferences);

/**
 * @route PUT /api/notifications/preferences
 * @description 更新当前用户的通知偏好
 * @access 私有（需要认证）
 */
router.put('/preferences', notificationController.updateUserNotificationPreferences);

/**
 * @route POST /api/notifications/queue
 * @description 发送通知到消息队列（异步处理）
 * @access 私有（需要认证）
 */
router.post('/queue', notificationController.sendNotificationToQueue);

export default router;
