/**
 * @file 订单分析数据模型
 * @description 定义订单分析数据的结构
 * @module models/OrderAnalytics
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, Index } from 'sequelize-typescript';

/**
 * 订单分析数据模型接口
 */
export interface OrderAnalyticsInterface {
  id?: number;
  orderId: string;
  userId: number;
  orderDate: Date;
  totalAmount: number;
  itemsCount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryTime?: number;
  preparationTime?: number;
  deliveryLocation?: Record<string, any>;
  customerFeedback?: number;
  discountAmount: number;
  taxAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 订单分析数据模型
 */
@Table({
  tableName: 'order_analytics',
  timestamps: true,
  paranoid: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
})
export class OrderAnalytics extends Model<OrderAnalytics, OrderAnalyticsInterface> {
  /**
   * 主键
   */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  /**
   * 订单ID
   */
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'order_id',
  })
  orderId!: string;

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
   * 订单日期
   */
  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'order_date',
  })
  orderDate!: Date;

  /**
   * 订单总金额
   */
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
  })
  totalAmount!: number;

  /**
   * 订单项数量
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'items_count',
  })
  itemsCount!: number;

  /**
   * 支付方式
   */
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'payment_method',
  })
  paymentMethod!: string;

  /**
   * 支付状态
   */
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'payment_status',
  })
  paymentStatus!: string;

  /**
   * 订单状态
   */
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'order_status',
  })
  orderStatus!: string;

  /**
   * 配送时间（分钟）
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'delivery_time',
  })
  deliveryTime?: number;

  /**
   * 准备时间（分钟）
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'preparation_time',
  })
  preparationTime?: number;

  /**
   * 配送地点
   */
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'delivery_location',
  })
  deliveryLocation?: Record<string, any>;

  /**
   * 客户反馈评分（1-5）
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'customer_feedback',
  })
  customerFeedback?: number;

  /**
   * 优惠金额
   */
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'discount_amount',
  })
  discountAmount!: number;

  /**
   * 税费金额
   */
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'tax_amount',
  })
  taxAmount!: number;

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
