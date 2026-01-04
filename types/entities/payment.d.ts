/**
 * @file 支付实体类型定义
 * @description 统一的支付类型定义
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MOBILE_PAYMENT = 'mobile_payment',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTOCURRENCY = 'cryptocurrency'
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

/**
 * 支付接口
 */
export interface Payment {
  id: string;
  orderId: string;
  restaurantId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string;
  metadata?: Record<string, unknown>;
}

/**
 * 支付请求
 */
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 支付响应
 */
export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  paymentUrl?: string;
  qrCode?: string;
  transactionId?: string;
  amount: number;
  currency: string;
  message?: string;
}

/**
 * 退款请求
 */
export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 退款接口
 */
export interface Refund {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  reason?: string;
  status: PaymentStatus;
  refundId?: string;
  createdAt: Date | string;
  processedAt?: Date | string;
}
