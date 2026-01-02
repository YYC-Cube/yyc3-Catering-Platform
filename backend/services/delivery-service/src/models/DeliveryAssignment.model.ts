/**
 * @file 配送分配模型
 * @description 记录配送任务的骑手分配信息
 * @module models/DeliveryAssignment
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Delivery } from './Delivery.model';
import { AssignmentStatus } from '../enums/assignmentStatus';

@Table({
  tableName: 'delivery_assignments',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class DeliveryAssignment extends Model<DeliveryAssignment> {
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

  // 骑手ID（外键）
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  rider_id!: string;

  // 分配时间
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  assignment_time!: Date;

  // 接受时间
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  accept_time!: Date | null;

  // 拒绝时间
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  reject_time!: Date | null;

  // 拒绝原因
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reject_reason!: string | null;

  // 分配状态
  @Column({
    type: DataType.ENUM(...Object.values(AssignmentStatus)),
    defaultValue: AssignmentStatus.PENDING,
    allowNull: false,
  })
  status!: AssignmentStatus;

  // 导航属性
  @BelongsTo(() => Delivery)
  delivery!: Delivery;
}