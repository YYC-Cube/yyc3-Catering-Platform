/**
 * @file 通知服务
 * @description 实现通知的核心业务逻辑
 * @module services/NotificationService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Notification, NotificationAttributes } from '../models/Notification';
import { UserNotificationPreference, UserNotificationPreferenceAttributes } from '../models/UserNotificationPreference';
import { NotificationType } from '../enums/NotificationType';
import { logger } from '../config/logger';
import { rabbitMQService } from './RabbitMQService';
import { EmailService } from './EmailService';
import { SMSService } from './SMSService';
import { PushNotificationService } from './PushNotificationService';

/**
 * 通知服务类
 */
export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;
  private pushNotificationService: PushNotificationService;

  /**
   * 构造函数
   */
  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.pushNotificationService = new PushNotificationService();
  }

  /**
   * 创建并发送通知
   * @param notificationData 通知数据
   * @returns 创建的通知
   */
  public async sendNotification(notificationData: NotificationAttributes): Promise<Notification> {
    try {
      // 保存通知到数据库
      const notification = await Notification.create(notificationData);
      logger.info('通知已创建:', { notificationId: notification.id });

      // 获取用户通知偏好
      const preference = await this.getUserNotificationPreference(notification.userId);

      // 根据用户偏好发送通知
      await this.deliverNotification(notification, preference);

      return notification;
    } catch (error: any) {
      logger.error('发送通知失败:', error);
      throw new Error(`发送通知失败: ${error.message}`);
    }
  }

  /**
   * 按照用户偏好发送通知
   * @param notification 通知对象
   * @param preference 用户通知偏好
   */
  private async deliverNotification(
    notification: Notification,
    preference: UserNotificationPreferenceAttributes | null
  ): Promise<void> {
    // 如果没有用户偏好，使用默认设置
    const shouldSend = (notificationType: NotificationType): boolean => {
      if (!preference) return true;

      switch (notificationType) {
        case NotificationType.SYSTEM: return preference.systemNotifications;
        case NotificationType.ORDER_STATUS: return preference.orderStatusNotifications;
        case NotificationType.PAYMENT_STATUS: return preference.paymentNotifications;
        case NotificationType.PROMOTION: return preference.promotionNotifications;
        case NotificationType.RESTAURANT: return preference.reservationNotifications;
        case NotificationType.REVIEW: return preference.reviewNotifications;
        default: return true;
      }
    };

    // 根据通知类型检查是否需要发送
    if (!shouldSend(notification.type)) {
      logger.info(`通知类型 ${notification.type} 已被用户禁用`, { userId: notification.userId });
      return;
    }

    // 根据通知渠道发送
    const promises: Promise<void>[] = [];

    if ((preference?.emailEnabled ?? true) && notification.data?.email) {
      promises.push(this.emailService.sendEmail(notification));
    }

    if ((preference?.smsEnabled ?? true) && notification.data?.phone) {
      promises.push(this.smsService.sendSMS(notification));
    }

    if ((preference?.pushEnabled ?? true) && notification.data?.pushToken) {
      promises.push(this.pushNotificationService.sendPushNotification(notification));
    }

    // 并行发送所有通知
    await Promise.all(promises);
  }

  /**
   * 获取用户通知列表
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @param type 通知类型（可选）
   * @param isRead 是否已读（可选）
   * @returns 通知列表和分页信息
   */
  public async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: NotificationType,
    isRead?: boolean
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: any = { userId };

      if (type) {
        where.type = type;
      }

      if (isRead !== undefined) {
        where.isRead = isRead;
      }

      const offset = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.findAll({
          where,
          order: [['createdAt', 'DESC']],
          limit,
          offset,
        }),
        Notification.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        notifications,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      logger.error('获取用户通知列表失败:', error);
      throw new Error(`获取用户通知列表失败: ${error.message}`);
    }
  }

  /**
   * 根据ID获取通知
   * @param id 通知ID
   * @returns 通知对象或null
   */
  public async getNotificationById(id: string): Promise<Notification | null> {
    try {
      return await Notification.findByPk(id);
    } catch (error: any) {
      logger.error('获取通知详情失败:', error);
      throw new Error(`获取通知详情失败: ${error.message}`);
    }
  }

  /**
   * 标记通知为已读
   * @param id 通知ID
   * @returns 更新后的通知或null
   */
  public async markAsRead(id: string): Promise<Notification | null> {
    try {
      const notification = await Notification.findByPk(id);

      if (!notification) {
        return null;
      }

      notification.isRead = true;
      await notification.save();

      return notification;
    } catch (error: any) {
      logger.error('标记通知为已读失败:', error);
      throw new Error(`标记通知为已读失败: ${error.message}`);
    }
  }

  /**
   * 标记所有通知为已读
   * @param userId 用户ID
   */
  public async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
    } catch (error: any) {
      logger.error('标记所有通知为已读失败:', error);
      throw new Error(`标记所有通知为已读失败: ${error.message}`);
    }
  }

  /**
   * 删除通知
   * @param id 通知ID
   * @returns 是否删除成功
   */
  public async deleteNotification(id: string): Promise<boolean> {
    try {
      const result = await Notification.destroy({ where: { id } });
      return result > 0;
    } catch (error: any) {
      logger.error('删除通知失败:', error);
      throw new Error(`删除通知失败: ${error.message}`);
    }
  }

  /**
   * 获取用户通知偏好
   * @param userId 用户ID
   * @returns 用户通知偏好或null
   */
  public async getUserNotificationPreference(userId: string): Promise<UserNotificationPreferenceAttributes | null> {
    try {
      const preference = await UserNotificationPreference.findOne({ where: { userId } });
      return preference;
    } catch (error: any) {
      logger.error('获取用户通知偏好失败:', error);
      throw new Error(`获取用户通知偏好失败: ${error.message}`);
    }
  }

  /**
   * 更新用户通知偏好
   * @param userId 用户ID
   * @param preferenceData 偏好数据
   * @returns 更新后的用户通知偏好
   */
  public async updateUserNotificationPreference(
    userId: string,
    preferenceData: Partial<UserNotificationPreferenceAttributes>
  ): Promise<UserNotificationPreference> {
    try {
      const [preference] = await UserNotificationPreference.upsert(
        { 
          ...preferenceData, 
          userId, 
          systemNotifications: preferenceData.systemNotifications ?? true,
          orderStatusNotifications: preferenceData.orderStatusNotifications ?? true,
          paymentNotifications: preferenceData.paymentNotifications ?? true,
          promotionNotifications: preferenceData.promotionNotifications ?? true,
          reviewNotifications: preferenceData.reviewNotifications ?? true,
          reservationNotifications: preferenceData.reservationNotifications ?? true,
          emailEnabled: preferenceData.emailEnabled ?? true,
          smsEnabled: preferenceData.smsEnabled ?? true,
          pushEnabled: preferenceData.pushEnabled ?? true
        },
        { returning: true }
      );
      return preference;
    } catch (error: any) {
      logger.error('更新用户通知偏好失败:', error);
      throw new Error(`更新用户通知偏好失败: ${error.message}`);
    }
  }

  /**
   * 处理来自消息队列的通知
   * @param notificationData 通知数据
   */
  public async handleQueueNotification(notificationData: NotificationAttributes): Promise<void> {
    try {
      await this.sendNotification(notificationData);
    } catch (error: any) {
      logger.error('处理队列通知失败:', error);
      // 可以在这里添加重试逻辑
    }
  }
}

// 导出通知服务实例
export const notificationService = new NotificationService();
