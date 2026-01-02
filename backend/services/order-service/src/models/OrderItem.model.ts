/**
 * @file 订单项模型
 * @description 定义订单项数据结构
 * @author YYC³
 * @version 1.0.0
 */
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, HasMany, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Order } from './Order.model';
import { OrderItemOption } from './OrderItemOption.model';

@Table({
  tableName: 'order_items',
  timestamps: true,
  underscored: true,
  paranoid: true
})
export class OrderItem extends Model<OrderItem> {
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
    type: DataType.BIGINT,
    allowNull: false
  })
  menu_item_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: true
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1
  })
  quantity: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  image_url: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  // 关联关系
  @HasMany(() => OrderItemOption)
  options: OrderItemOption[];
}