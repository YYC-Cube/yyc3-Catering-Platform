/**
 * @file 配送评分模型
 * @description 记录用户对配送服务的评分和反馈
 * @module models/DeliveryRating
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Delivery } from './Delivery.model';

@Table({
  tableName: 'delivery_ratings',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class DeliveryRating extends Model<DeliveryRating> {
  // 主键
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  // 配送ID（外键）
  @ForeignKey(() => Delivery)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  delivery_id!: string;

  // 用户ID
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id!: string;

  // 骑手ID
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  rider_id!: string;

  // 配送速度评分（1-5分）
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  speed_rating!: number;

  // 配送服务评分（1-5分）
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  service_rating!: number;

  // 骑手态度评分（1-5分）
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rider_attitude_rating!: number;

  // 平均评分
  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  average_rating!: number;

  // 评论内容
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comment!: string | null;

  // 是否匿名评价
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_anonymous!: boolean;

  // 导航属性
  @BelongsTo(() => Delivery)
  delivery!: Delivery;
}