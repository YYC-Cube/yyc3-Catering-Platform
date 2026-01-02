/**
 * @file 邮件服务
 * @description 处理电子邮件通知的发送
 * @module services/EmailService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import nodemailer from 'nodemailer';
import { logger } from '../config/logger';
import { Notification } from '../models/Notification';
import { NotificationType } from '../enums/NotificationType';

/**
 * 邮件服务类
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  /**
   * 构造函数
   */
  constructor() {
    // 创建邮件传输器
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASSWORD || 'password',
      },
    });
  }

  /**
   * 发送邮件
   * @param notification 通知对象
   */
  public async sendEmail(notification: Notification): Promise<void> {
    try {
      const emailContent = this.generateEmailContent(notification);
      
      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_FROM || '"YYC³餐饮平台" <noreply@yyc3.com>',
        to: notification.data?.email,
        subject: emailContent.subject,
        html: emailContent.html,
      };
      
      await this.transporter.sendMail(mailOptions);
      logger.info('邮件发送成功', { to: notification.data?.email, notificationId: notification.id });
    } catch (error: any) {
      logger.error('邮件发送失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }
  }

  /**
   * 生成邮件内容
   * @param notification 通知对象
   * @returns 邮件主题和HTML内容
   */
  private generateEmailContent(notification: Notification): { subject: string; html: string } {
    let subject = 'YYC³餐饮平台通知';
    let content = notification.content;
    
    // 根据通知类型定制主题
    switch (notification.type) {
      case NotificationType.SYSTEM:
        subject = '系统通知 - YYC³餐饮平台';
        break;
      case NotificationType.ORDER_STATUS:
        subject = '订单状态更新 - YYC³餐饮平台';
        break;
      case NotificationType.PAYMENT_STATUS:
        subject = '支付通知 - YYC³餐饮平台';
        break;
      case NotificationType.PROMOTION:
        subject = '优惠活动通知 - YYC³餐饮平台';
        break;
      case NotificationType.RESTAURANT:
        subject = '预订确认 - YYC³餐饮平台';
        break;
      case NotificationType.REVIEW:
        subject = '评论提醒 - YYC³餐饮平台';
        break;
      default:
        subject = '通知 - YYC³餐饮平台';
    }
    
    // 生成HTML邮件内容
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-top: 0;">${subject}</h2>
          <p style="color: #666; line-height: 1.6;">${content}</p>
          ${notification.data ? `<div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 4px;">${JSON.stringify(notification.data)}</div>` : ''}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>这是YYC³餐饮平台的自动通知邮件，请不要直接回复。</p>
            <p>如果您有任何问题，请联系我们的客服团队。</p>
          </div>
        </div>
      </div>
    `;
    
    return { subject, html };
  }

  /**
   * 验证邮件配置
   */
  public async verifyConfig(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('邮件服务配置验证成功');
    } catch (error: any) {
      logger.error('邮件服务配置验证失败:', error);
      throw new Error(`邮件服务配置验证失败: ${error.message}`);
    }
  }
}
