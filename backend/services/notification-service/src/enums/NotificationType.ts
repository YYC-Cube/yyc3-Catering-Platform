/**
 * @file 通知类型枚举
 * @description 定义通知服务支持的通知类型
 * @module enums/NotificationType
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export enum NotificationType {
  // 系统通知
  SYSTEM = 'SYSTEM',
  // 订单状态通知
  ORDER_STATUS = 'ORDER_STATUS',
  // 支付状态通知
  PAYMENT_STATUS = 'PAYMENT_STATUS',
  // 配送状态通知
  DELIVERY_STATUS = 'DELIVERY_STATUS',
  // 促销活动通知
  PROMOTION = 'PROMOTION',
  // 用户账户通知
  ACCOUNT = 'ACCOUNT',
  // 餐厅通知
  RESTAURANT = 'RESTAURANT',
  // 评论通知
  REVIEW = 'REVIEW',
  // 消息通知
  MESSAGE = 'MESSAGE',
  // 其他通知
  OTHER = 'OTHER',
}