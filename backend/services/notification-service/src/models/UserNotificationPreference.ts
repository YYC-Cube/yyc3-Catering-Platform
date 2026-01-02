/**
 * @file 用户通知偏好模型
 * @description 存储用户的通知偏好设置
 * @module models/UserNotificationPreference
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Model, DataTypes, Optional, Association, Sequelize } from 'sequelize';
import { Notification } from './Notification';

// 用户通知偏好接口定义
export interface UserNotificationPreferenceAttributes {
  id: string;
  userId: string;
  systemNotifications: boolean;
  orderStatusNotifications: boolean;
  paymentNotifications: boolean;
  promotionNotifications: boolean;
  reservationNotifications: boolean;
  reviewNotifications: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户通知偏好的可选属性接口
export interface UserNotificationPreferenceCreationAttributes
  extends Optional<
    UserNotificationPreferenceAttributes,
    'id' | 'createdAt' | 'updatedAt'
  > {}

// 用户通知偏好模型类
export class UserNotificationPreference extends Model<
  UserNotificationPreferenceAttributes,
  UserNotificationPreferenceCreationAttributes
> implements UserNotificationPreferenceAttributes {
  public id!: string;
  public userId!: string;
  public systemNotifications!: boolean;
  public orderStatusNotifications!: boolean;
  public paymentNotifications!: boolean;
  public promotionNotifications!: boolean;
  public reservationNotifications!: boolean;
  public reviewNotifications!: boolean;
  public emailEnabled!: boolean;
  public smsEnabled!: boolean;
  public pushEnabled!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 关联定义
  public static associations: {
    notifications: Association<UserNotificationPreference, Notification>;
  };
}

// 初始化用户通知偏好模型
export function initUserNotificationPreference(sequelize: Sequelize) {
  UserNotificationPreference.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      systemNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'system_notifications',
      },
      orderStatusNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'order_status_notifications',
      },
      paymentNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'payment_notifications',
      },
      promotionNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'promotion_notifications',
      },
      reservationNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'reservation_notifications',
      },
      reviewNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'review_notifications',
      },
      emailEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'email_enabled',
      },
      smsEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'sms_enabled',
      },
      pushEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'push_enabled',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        onUpdate: 'NOW',
        field: 'updated_at',
      },
    },
    {
      tableName: 'user_notification_preferences',
      sequelize,
      indexes: [
        {
          unique: true,
          fields: ['user_id'],
          name: 'idx_user_notification_preferences_user_id',
        },
      ],
    }
  );
}
