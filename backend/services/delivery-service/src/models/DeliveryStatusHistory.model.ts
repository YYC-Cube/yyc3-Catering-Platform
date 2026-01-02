/**
 * @file 配送状态历史模型
 * @description 记录配送状态的变更历史
 * @module models/DeliveryStatusHistory
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Delivery } from './Delivery.model';
import { DeliveryStatus } from '../enums/deliveryStatus';

@Table({
  tableName: 'delivery_status_histories',
  timestamps: true,
  paranoid: false, // 状态历史不使用软删除
  underscored: true,
})
export class DeliveryStatusHistory extends Model<DeliveryStatusHistory> {
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

  // 状态变更时间
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  status_time!: Date;

  // 旧状态
  @Column({
    type: DataType.ENUM(...Object.values(DeliveryStatus)),
    allowNull: true,
  })
  old_status!: DeliveryStatus | null;

  // 新状态
  @Column({
    type: DataType.ENUM(...Object.values(DeliveryStatus)),
    allowNull: false,
  })
  new_status!: DeliveryStatus;

  // 状态变更原因
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reason!: string | null;

  // 操作员ID
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  operator_id!: string | null;

  // 操作员类型
  @Column({
    type: DataType.ENUM('system', 'rider', 'admin', 'customer'),
    allowNull: true,
  })
  operator_type!: 'system' | 'rider' | 'admin' | 'customer' | null;

  // 导航属性
  @BelongsTo(() => Delivery)
  delivery!: Delivery;
}