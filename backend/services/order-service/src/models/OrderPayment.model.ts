/**
 * @file 订单支付模型
 * @description 定义订单支付数据结构
 * @author YYC³
 * @version 1.0.0
 */
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Order, PaymentStatus } from './Order.model';

// 支付方式枚举
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay',
  CASH = 'cash',
  WALLET = 'wallet'
}

@Table({
  tableName: 'order_payments',
  timestamps: true,
  underscored: true,
  paranoid: true
})
export class OrderPayment extends Model<OrderPayment> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true
  })
  order_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
    allowNull: false
  })
  payment_method: PaymentMethod;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    defaultValue: PaymentStatus.UNPAID
  })
  status: PaymentStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  amount: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  transaction_id: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: true
  })
  payment_details: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  paid_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  refunded_at: Date;

  @Column({
    type: DataType.STRING(500),
    allowNull: true
  })
  refund_reason: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}