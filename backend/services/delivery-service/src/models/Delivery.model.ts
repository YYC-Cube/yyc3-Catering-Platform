/**
 * @file 配送主记录模型
 * @description 定义配送的核心数据结构和关系
 * @module models/Delivery
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { DeliveryStatus } from '../enums/deliveryStatus';
import { DeliveryAssignment } from './DeliveryAssignment.model';
import { DeliveryStatusHistory } from './DeliveryStatusHistory.model';
import { DeliveryRating } from './DeliveryRating.model';

@Table({
  tableName: 'deliveries',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Delivery extends Model<Delivery> {
  // 主键
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  // 订单ID（外键）
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  order_id!: string;

  // 配送地址
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  delivery_address!: string;

  // 配送经度
  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: false,
  })
  delivery_longitude!: number;

  // 配送纬度
  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: false,
  })
  delivery_latitude!: number;

  // 餐厅经度
  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: false,
  })
  restaurant_longitude!: number;

  // 餐厅纬度
  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: false,
  })
  restaurant_latitude!: number;

  // 预计配送时间（分钟）
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  estimated_delivery_time!: number;

  // 实际配送时间（分钟）
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  actual_delivery_time!: number | null;

  // 配送费用
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  delivery_fee!: number;

  // 配送状态
  @Column({
    type: DataType.ENUM(...Object.values(DeliveryStatus)),
    defaultValue: DeliveryStatus.PENDING,
    allowNull: false,
  })
  status!: DeliveryStatus;

  // 配送备注
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string | null;

  // 导航属性
  @HasMany(() => DeliveryAssignment)
  assignments!: DeliveryAssignment[];

  @HasMany(() => DeliveryStatusHistory)
  status_history!: DeliveryStatusHistory[];

  @HasMany(() => DeliveryRating)
  ratings!: DeliveryRating[];
}