/**
 * @file 分析数据模型
 * @description 定义分析数据的基本结构
 * @module models/AnalyticsData
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, Index } from 'sequelize-typescript';
import { AnalyticsType } from '../enums/AnalyticsType';

/**
 * 分析数据模型接口
 */
export interface AnalyticsDataInterface {
  id?: number;
  type: AnalyticsType;
  data: Record<string, any>;
  timestamp: Date;
  source: string;
  userId?: number;
  orderId?: string;
  productId?: string;
  campaignId?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 分析数据模型
 */
@Table({
  tableName: 'analytics_data',
  timestamps: true,
  paranoid: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
})
export class AnalyticsData extends Model<AnalyticsData, AnalyticsDataInterface> {
  /**
   * 主键
   */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  /**
   * 分析数据类型
   */
  @Index
  @Column({
    type: DataType.ENUM(...Object.values(AnalyticsType)),
    allowNull: false,
    field: 'type',
  })
  type!: AnalyticsType;

  /**
   * 分析数据内容
   */
  @Column({
    type: DataType.JSONB,
    allowNull: false,
    field: 'data',
  })
  data!: Record<string, any>;

  /**
   * 数据产生时间
   */
  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'timestamp',
  })
  timestamp!: Date;

  /**
   * 数据来源
   */
  @Index
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'source',
  })
  source!: string;

  /**
   * 用户ID（可选）
   */
  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'user_id',
  })
  userId?: number;

  /**
   * 订单ID（可选）
   */
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'order_id',
  })
  orderId?: string;

  /**
   * 产品ID（可选）
   */
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'product_id',
  })
  productId?: string;

  /**
   * 营销活动ID（可选）
   */
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'campaign_id',
  })
  campaignId?: string;

  /**
   * 标签（可选）
   */
  @Column({
    type: DataType.ARRAY(DataType.STRING(100)),
    allowNull: true,
    field: 'tags',
  })
  tags?: string[];

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
