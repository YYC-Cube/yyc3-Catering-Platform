/**
 * @file 用户分析数据模型
 * @description 定义用户行为分析数据的结构
 * @module models/UserAnalytics
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, Index } from 'sequelize-typescript';

/**
 * 用户分析数据模型接口
 */
export interface UserAnalyticsInterface {
  id?: number;
  userId: number;
  event: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: Date;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: Record<string, any>;
  additionalData?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 用户分析数据模型
 */
@Table({
  tableName: 'user_analytics',
  timestamps: true,
  paranoid: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
})
export class UserAnalytics extends Model<UserAnalytics, UserAnalyticsInterface> {
  /**
   * 主键
   */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  /**
   * 用户ID
   */
  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId!: number;

  /**
   * 事件名称
   */
  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'event',
  })
  event!: string;

  /**
   * 事件类别
   */
  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'category',
  })
  category!: string;

  /**
   * 事件标签
   */
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'label',
  })
  label?: string;

  /**
   * 事件值
   */
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'value',
  })
  value?: number;

  /**
   * 事件时间戳
   */
  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'timestamp',
  })
  timestamp!: Date;

  /**
   * 会话ID
   */
  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'session_id',
  })
  sessionId!: string;

  /**
   * IP地址
   */
  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: 'ip_address',
  })
  ipAddress?: string;

  /**
   * 用户代理
   */
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'user_agent',
  })
  userAgent?: string;

  /**
   * 地理位置
   */
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'location',
  })
  location?: string;

  /**
   * 设备信息
   */
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'device_info',
  })
  deviceInfo?: Record<string, any>;

  /**
   * 附加数据
   */
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'additional_data',
  })
  additionalData?: Record<string, any>;

  /**
   * 创建时间
   */
  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  /**
   * 更新时间
   */
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt!: Date;
}
