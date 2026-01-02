/**
 * @file 订单模型
 * @description 定义订单数据结构
 * @author YYC³
 * @version 1.0.0
 */
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, HasMany, HasOne, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { OrderItem } from './OrderItem.model';
import { OrderPayment } from './OrderPayment.model';
import { OrderStatusHistory } from './OrderStatusHistory.model';

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// 支付状态枚举
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

// 配送类型枚举
export enum DeliveryType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
  DINE_IN = 'dine_in'
}

@Table({
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  paranoid: true
})
export class Order extends Model<Order> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  user_id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true
  })
  restaurant_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    defaultValue: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({
    type: DataType.ENUM(...Object.values(DeliveryType)),
    allowNull: false
  })
  delivery_type: DeliveryType;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    defaultValue: PaymentStatus.UNPAID
  })
  payment_status: PaymentStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  subtotal: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  tax: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  delivery_fee: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  discount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  total_amount: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  delivery_address: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true
  })
  delivery_phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  delivery_contact: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  scheduled_time: Date;

  @Column({
    type: DataType.STRING(500),
    allowNull: true
  })
  notes: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  is_cancelled: boolean;

  @Column({
    type: DataType.BIGINT,
    allowNull: true
  })
  cancelled_by: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: true
  })
  cancellation_reason: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  // 关联关系
  @HasMany(() => OrderItem)
  order_items: OrderItem[];

  @HasOne(() => OrderPayment)
  payment: OrderPayment;

  @HasMany(() => OrderStatusHistory)
  status_history: OrderStatusHistory[];
}