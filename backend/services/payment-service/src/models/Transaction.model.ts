/**
 * @file 支付交易模型
 * @description 定义支付交易记录的数据结构、关联关系和业务规则
 * @module models/Transaction
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 交易类型枚举
export enum TransactionType {
  PAYMENT = 'payment',      // 支付
  REFUND = 'refund',        // 退款
  AUTHORIZATION = 'authorization',// 授权
  CAPTURE = 'capture',      // 捕获
  VOID = 'void',            // 撤销
  SETTLEMENT = 'settlement',// 结算
}

// 交易状态枚举
export enum TransactionStatus {
  INITIATED = 'initiated',  // 已发起
  PROCESSING = 'processing',// 处理中
  COMPLETED = 'completed',  // 已完成
  FAILED = 'failed',        // 失败
  CANCELLED = 'cancelled',  // 已取消
  PENDING = 'pending',      // 待处理
}

// 交易模型属性接口
interface TransactionAttributes {
  id: string;
  payment_id?: string;
  order_id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  transaction_id: string;
  channel: string;
  channel_response?: Record<string, any>;
  channel_error?: Record<string, any>;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// 交易模型创建属性接口（可选属性）
interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'created_at' | 'updated_at' | 'payment_id' | 'reference_id'> {}

// 交易模型类
export class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: string;
  public payment_id?: string;
  public order_id!: string;
  public type!: TransactionType;
  public status!: TransactionStatus;
  public amount!: number;
  public currency!: string;
  public transaction_id!: string;
  public channel!: string;
  public channel_response?: Record<string, any>;
  public channel_error?: Record<string, any>;
  public reference_id?: string;
  public metadata?: Record<string, any>;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联关系
  // Transaction.belongsTo(Payment, { foreignKey: 'payment_id' });
}

// 定义交易模型
Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'payment_id',
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
      defaultValue: TransactionStatus.INITIATED,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY',
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'transaction_id',
    },
    channel: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    channel_response: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'channel_response',
    },
    channel_error: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'channel_error',
    },
    reference_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'reference_id',
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
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      { fields: ['payment_id'] },
      { fields: ['order_id'] },
      { fields: ['transaction_id'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['channel'] },
    ],
  }
);

export default Transaction;