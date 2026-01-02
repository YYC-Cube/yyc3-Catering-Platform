/**
 * @file 通知模型
 * @description 定义通知服务的通知数据模型
 * @module models/Notification
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Model, DataTypes, Sequelize } from 'sequelize';
import { NotificationType } from '../enums/NotificationType';

/**
 * 通知模型接口
 */
export interface NotificationAttributes {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: any;
  isRead: boolean;
  isSent: boolean;
  sentAt?: Date;
  readAt?: Date;
  retryCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 通知模型类
 */
export class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: string;
  public userId!: string;
  public type!: NotificationType;
  public title!: string;
  public content!: string;
  public data?: any;
  public isRead!: boolean;
  public isSent!: boolean;
  public sentAt?: Date;
  public readAt?: Date;
  public retryCount!: number;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date;
}

/**
 * 初始化通知模型
 * @param sequelize Sequelize实例
 */
export const initNotificationModel = (sequelize: Sequelize): void => {
  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM(...Object.values(NotificationType)),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'notifications',
      modelName: 'Notification',
      timestamps: true,
      paranoid: true,
      indexes: [
      { fields: ['userId'], name: 'idx_notifications_user_id' },
      { fields: ['type'], name: 'idx_notifications_type' },
      { fields: ['isRead'], name: 'idx_notifications_is_read' },
      { fields: ['isSent'], name: 'idx_notifications_is_sent' },
      { fields: ['createdAt'], name: 'idx_notifications_created_at' },
    ],
    }
  );
};