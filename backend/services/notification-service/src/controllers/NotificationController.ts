/**
 * @file 通知控制器
 * @description 处理通知相关的API请求和响应
 * @module controllers/NotificationController
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Request, Response } from 'express';
import { notificationService } from '../services/NotificationService';
import { NotificationType } from '../enums/NotificationType';
import { logger } from '../config/logger';

/**
 * 通知控制器类
 */
export class NotificationController {
  private notificationService;

  /**
   * 构造函数
   * @param notificationService 通知服务实例（可选）
   */
  constructor(service = notificationService) {
    this.notificationService = service;
  }

  /**
   * 获取用户通知列表
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, type, isRead } = req.query;

      const notifications = await this.notificationService.getUserNotifications(
        userId,
        Number(page),
        Number(limit),
        type as NotificationType,
        isRead !== undefined ? Boolean(isRead) : undefined
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      logger.error('获取用户通知列表失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '获取通知列表失败',
      });
    }
  }

  /**
   * 获取通知详情
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationById(id);

      if (!notification) {
        res.status(404).json({
          success: false,
          error: '通知不存在',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      logger.error('获取通知详情失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '获取通知详情失败',
      });
    }
  }

  /**
   * 标记通知为已读
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedNotification = await this.notificationService.markAsRead(id);

      if (!updatedNotification) {
        res.status(404).json({
          success: false,
          error: '通知不存在',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedNotification,
      });
    } catch (error: any) {
      logger.error('标记通知为已读失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '标记通知为已读失败',
      });
    }
  }

  /**
   * 标记所有通知为已读
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      await this.notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: '所有通知已标记为已读',
      });
    } catch (error: any) {
      logger.error('标记所有通知为已读失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '标记所有通知为已读失败',
      });
    }
  }

  /**
   * 删除通知
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.notificationService.deleteNotification(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: '通知不存在',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '通知已删除',
      });
    } catch (error: any) {
      logger.error('删除通知失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '删除通知失败',
      });
    }
  }

  /**
   * 获取用户通知偏好
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async getUserNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const preference = await this.notificationService.getUserNotificationPreference(userId);

      if (!preference) {
        res.status(404).json({
          success: false,
          error: '用户通知偏好不存在',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: preference,
      });
    } catch (error: any) {
      logger.error('获取用户通知偏好失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '获取用户通知偏好失败',
      });
    }
  }

  /**
   * 更新用户通知偏好
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async updateUserNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const preferenceData = req.body;

      const updatedPreference = await this.notificationService.updateUserNotificationPreference(
        userId,
        preferenceData
      );

      res.status(200).json({
        success: true,
        data: updatedPreference,
      });
    } catch (error: any) {
      logger.error('更新用户通知偏好失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '更新用户通知偏好失败',
      });
    }
  }

  /**
   * 发送通知（API方式）
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationData = req.body;
      const notification = await this.notificationService.sendNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification,
        message: '通知发送成功',
      });
    } catch (error: any) {
      logger.error('发送通知失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '发送通知失败',
      });
    }
  }

  /**
   * 发送通知到队列（API方式）
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async sendNotificationToQueue(req: Request, res: Response): Promise<void> {
    try {
      const notificationData = req.body;
      // 这里可以直接调用发送到队列的方法，如果notificationService有提供的话
      // 或者复用sendNotification方法
      const notification = await this.notificationService.sendNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification,
        message: '通知已发送到队列',
      });
    } catch (error: any) {
      logger.error('发送通知到队列失败:', error);
      res.status(500).json({
        success: false,
        error: error.message || '发送通知到队列失败',
      });
    }
  }
}
