/**
 * @file 订单状态历史模型
 * @description 定义订单状态变更历史数据结构
 * @author YYC³
 * @version 1.0.0
 */
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Order, OrderStatus } from './Order.model';

@Table({
  tableName: 'order_status_histories',
  timestamps: true,
  underscored: true
})
export class OrderStatusHistory extends Model<OrderStatusHistory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  order_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false
  })
  status: OrderStatus;

  @Column({
    type: DataType.STRING(500),
    allowNull: true
  })
  note: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true
  })
  changed_by: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}