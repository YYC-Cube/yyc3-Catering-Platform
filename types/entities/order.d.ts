/**
 * @file 订单实体类型定义
 * @description 统一的订单类型定义
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

import type { PaymentStatus } from './payment';

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * 订单项类型
 */
export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  note?: string;
  customizations?: {
    name: string;
    value: string;
    price: number;
  }[];
}

/**
 * 订单地址信息
 */
export interface OrderAddress {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * 基础订单接口
 */
export interface BaseOrder {
  id: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * 订单接口 - 完整版本
 */
export interface Order extends BaseOrder {
  restaurantId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  tableNumber?: string;
  type: 'dine_in' | 'takeout' | 'delivery';
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  address?: OrderAddress;
  estimatedDeliveryTime?: Date | string;
  actualDeliveryTime?: Date | string;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 订单创建请求
 */
export interface CreateOrderRequest {
  restaurantId: string;
  type: 'dine_in' | 'takeout' | 'delivery';
  tableNumber?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    note?: string;
    customizations?: Record<string, string>;
  }>;
  address?: OrderAddress;
  note?: string;
}

/**
 * 订单更新请求
 */
export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  note?: string;
  items?: OrderItem[];
}

/**
 * 订单查询参数
 */
export interface OrderQueryParams {
  restaurantId?: string;
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  type?: 'dine_in' | 'takeout' | 'delivery';
  startDate?: Date | string;
  endDate?: Date | string;
  minTotal?: number;
  maxTotal?: number;
}
