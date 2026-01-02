/**
 * @file 订单项选项模型
 * @description 定义订单项选项数据结构
 * @author YYC³
 * @version 1.0.0
 */
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { OrderItem } from './OrderItem.model';

@Table({
  tableName: 'order_item_options',
  timestamps: true,
  underscored: true,
  paranoid: true
})
export class OrderItemOption extends Model<OrderItemOption> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => OrderItem)
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  order_item_id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  option_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  name: string;

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

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}