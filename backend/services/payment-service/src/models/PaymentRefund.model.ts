/**
 * @file 支付退款模型
 * @description 定义支付退款记录的数据结构、关联关系和业务规则
 * @module models/PaymentRefund
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 退款状态枚举
export enum RefundStatus {
  PENDING = 'pending',      // 待处理
  PROCESSING = 'processing',// 处理中
  COMPLETED = 'completed',  // 已完成
  FAILED = 'failed',        // 失败
  CANCELLED = 'cancelled',  // 已取消
}

// 退款原因枚举
export enum RefundReason {
  USER_REQUEST = 'user_request',   // 用户请求
  ORDER_CANCELLED = 'order_cancelled',// 订单取消
  PRODUCT_ISSUE = 'product_issue',  // 商品问题
  SERVICE_ISSUE = 'service_issue',  // 服务问题
  DUPLICATE_PAYMENT = 'duplicate_payment',// 重复支付
  OVERCHARGE = 'overcharge',       // 多收费用
  SYSTEM_ERROR = 'system_error',   // 系统错误
}

// 退款模型属性接口
interface PaymentRefundAttributes {
  id: string;
  payment_id: string;
  order_id: string;
  refund_amount: number;
  status: RefundStatus;
  reason: RefundReason;
  reason_details?: string;
  refund_transaction_id?: string;
  refund_channel?: string;
  refund_time?: Date;
  failure_reason?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// 退款模型创建属性接口（可选属性）
interface PaymentRefundCreationAttributes extends Optional<PaymentRefundAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 退款模型类
export class PaymentRefund extends Model<PaymentRefundAttributes, PaymentRefundCreationAttributes> implements PaymentRefundAttributes {
  public id!: string;
  public payment_id!: string;
  public order_id!: string;
  public refund_amount!: number;
  public status!: RefundStatus;
  public reason!: RefundReason;
  public reason_details?: string;
  public refund_transaction_id?: string;
  public refund_channel?: string;
  public refund_time?: Date;
  public failure_reason?: string;
  public metadata?: Record<string, any>;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // 关联关系
  // PaymentRefund.belongsTo(Payment, { foreignKey: 'payment_id' });
}

// 定义退款模型
PaymentRefund.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'payment_id',
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      field: 'refund_amount',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RefundStatus)),
      allowNull: false,
      defaultValue: RefundStatus.PENDING,
    },
    reason: {
      type: DataTypes.ENUM(...Object.values(RefundReason)),
      allowNull: false,
    },
    reason_details: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'reason_details',
    },
    refund_transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'refund_transaction_id',
    },
    refund_channel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'refund_channel',
    },
    refund_time: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'refund_time',
    },
    failure_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'failure_reason',
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
    tableName: 'payment_refunds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['payment_id'] },
      { fields: ['order_id'] },
      { fields: ['refund_transaction_id'] },
      { fields: ['status'] },
      { fields: ['reason'] },
    ],
  }
);

export default PaymentRefund;