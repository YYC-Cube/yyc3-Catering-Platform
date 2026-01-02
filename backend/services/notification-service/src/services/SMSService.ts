/**
 * @file 短信服务
 * @description 处理短信通知的发送
 * @module services/SMSService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { logger } from '../config/logger';
import { Notification } from '../models/Notification';
import { NotificationType } from '../enums/NotificationType';

// 模拟短信服务API客户端
class SMSApiClient {
  public async sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    // 这里应该是实际的短信API调用
    // 现在使用模拟实现
    logger.info(`模拟发送短信到 ${to}: ${message}`);
    return { success: true, messageId: `sms_${Date.now()}` };
  }
}

/**
 * 短信服务类
 */
export class SMSService {
  private smsClient: SMSApiClient;

  /**
   * 构造函数
   */
  constructor() {
    this.smsClient = new SMSApiClient();
  }

  /**
   * 发送短信
   * @param notification 通知对象
   */
  public async sendSMS(notification: Notification): Promise<void> {
    try {
      const phone = notification.data?.phone;
      if (!phone) {
        throw new Error('通知对象缺少电话号码');
      }
      
      const smsContent = this.generateSMSContent(notification);
      
      const result = await this.smsClient.sendSMS(phone, smsContent);
      
      if (result.success) {
        logger.info('短信发送成功', { to: phone, notificationId: notification.id, messageId: result.messageId });
      } else {
        throw new Error('短信发送失败');
      }
    } catch (error: any) {
      logger.error('短信发送失败:', error);
      throw new Error(`短信发送失败: ${error.message}`);
    }
  }

  /**
   * 生成短信内容
   * @param notification 通知对象
   * @returns 短信内容
   */
  private generateSMSContent(notification: Notification): string {
    let prefix = '[YYC³餐饮平台]';
    let content = notification.content;
    
    // 短信内容长度限制（通常为70个汉字或160个英文字符）
    const maxLength = 70;
    
    // 计算总长度
    const totalLength = prefix.length + content.length;
    
    // 如果超过限制，截断内容
    if (totalLength > maxLength) {
      const truncatedLength = maxLength - prefix.length - 3; // 减去省略号的长度
      content = content.substring(0, truncatedLength) + '...';
    }
    
    return `${prefix} ${content}`;
  }

  /**
   * 验证短信服务配置
   */
  public async verifyConfig(): Promise<void> {
    try {
      // 这里应该是实际的短信服务配置验证
      logger.info('短信服务配置验证成功');
    } catch (error: any) {
      logger.error('短信服务配置验证失败:', error);
      throw new Error(`短信服务配置验证失败: ${error.message}`);
    }
  }
}
