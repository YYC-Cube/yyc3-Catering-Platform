/**
 * @file 支付主记录模型
 * @description 定义支付记录的数据结构、关联关系和业务规则
 * @module models/Payment
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'pending',      // 待支付
  PROCESSING = 'processing',// 处理中
  COMPLETED = 'completed',  // 已完成
  FAILED = 'failed',        // 失败
  REFUNDED = 'refunded',    // 已退款
  CANCELLED = 'cancelled',  // 已取消
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',        // 支付宝
  WECHAT_PAY = 'wechat_pay',// 微信支付
  CREDIT_CARD = 'credit_card',// 信用卡
  DEBIT_CARD = 'debit_card',  // 借记卡
  BANK_TRANSFER = 'bank_transfer',// 银行转账
  CASH = 'cash',            // 现金
}

// 支付模型属性接口
interface PaymentAttributes {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_id?: string;
  payment_channel?: string;
  payment_time?: Date;
  failure_reason?: string;
  refund_amount?: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// 支付模型创建属性接口（可选属性）
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 支付模型类
export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public order_id!: string;
  public user_id!: string;
  public amount!: number;
  public status!: PaymentStatus;
  public payment_method!: PaymentMethod;
  public transaction_id?: string;
  public payment_channel?: string;
  public payment_time?: Date;
  public failure_reason?: string;
  public refund_amount?: number;
  public metadata?: Record<string, any>;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // 关联关系
  // Payment.hasMany(PaymentRefund, { foreignKey: 'payment_id' });
  // Payment.hasMany(Transaction, { foreignKey: 'payment_id' });
}

// 定义支付模型
Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    },
    payment_method: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'transaction_id',
    },
    payment_channel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'payment_channel',
    },
    payment_time: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_time',
    },
    failure_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'failure_reason',
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
      },
      field: 'refund_amount',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
      field: 'updated_at',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['order_id'] },
      { fields: ['user_id'] },
      { fields: ['transaction_id'] },
      { fields: ['status'] },
      { fields: ['payment_method'] },
    ],
  }
);

export default Payment;