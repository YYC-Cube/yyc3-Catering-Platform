/**
 * @fileoverview YYC³订单管理数据模型
 * @description 订单处理、订单状态、订单详情的数据模型定义
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { z } from 'zod';

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'pending',           // 待确认
  CONFIRMED = 'confirmed',       // 已确认
  PREPARING = 'preparing',       // 准备中
  READY = 'ready',              // 待取餐
  DELIVERING = 'delivering',     // 配送中
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded',         // 已退款
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  PENDING = 'pending',           // 待支付
  PROCESSING = 'processing',     // 支付中
  PAID = 'paid',                // 已支付
  FAILED = 'failed',            // 支付失败
  REFUNDED = 'refunded',         // 已退款
  PARTIALLY_REFUNDED = 'partially_refunded', // 部分退款
}

/**
 * 订单类型枚举
 */
export enum OrderType {
  DINE_IN = 'dine_in',           // 堂食
  TAKEAWAY = 'takeaway',         // 外带
  DELIVERY = 'delivery',         // 外送
}

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  CASH = 'cash',                 // 现金
  CARD = 'card',                 // 刷卡
  MOBILE_PAY = 'mobile_pay',     // 移动支付
  WECHAT = 'wechat',             // 微信支付
  ALIPAY = 'alipay',             // 支付宝
  BALANCE = 'balance',           // 余额支付
}

/**
 * 配送信息接口
 */
export interface DeliveryInfo {
  address: string;               // 配送地址
  coordinates?: {               // 坐标
    lat: number;
    lng: number;
  };
  distance?: number;             // 配送距离(km)
  estimatedTime?: number;        // 预计配送时间(分钟)
  deliveryFee: number;          // 配送费
  contactPhone: string;         // 联系电话
  contactName: string;          // 联系人
  instructions?: string;         // 配送说明
}

/**
 * 订单项接口
 */
export interface OrderItem {
  id: string;
  menuItemId: string;           // 菜品ID
  menuItemName: string;         // 菜品名称
  menuItemImage?: string;       // 菜品图片
  quantity: number;             // 数量
  unitPrice: number;            // 单价
  totalPrice: number;           // 小计
  options?: {                   // 选项
    name: string;
    choices: {
      name: string;
      price: number;
    }[];
  }[];
  specialRequests?: string;     // 特殊要求
  prepStatus: 'pending' | 'preparing' | 'ready' | 'completed'; // 制作状态
  prepTime?: number;            // 制作时间(分钟)
}

/**
 * 价格明细接口
 */
export interface PriceBreakdown {
  subtotal: number;             // 小计
  discount: number;             // 折扣
  deliveryFee: number;          // 配送费
  serviceFee: number;           // 服务费
  tax: number;                  // 税费
  tip: number;                  // 小费
  total: number;                // 总计
}

/**
 * 订单评价接口
 */
export interface OrderReview {
  rating: number;               // 评分(1-5)
  comment?: string;             // 评价内容
  foodQuality: number;          // 食物质量评分
  serviceQuality: number;       // 服务质量评分
  deliveryQuality?: number;     // 配送质量评分
  images?: string[];            // 评价图片
  createdAt: Date;              // 评价时间
}

/**
 * 订单操作日志接口
 */
export interface OrderLog {
  id: string;
  orderId: string;
  action: string;               // 操作类型
  description: string;          // 操作描述
  operatorId?: string;          // 操作人ID
  operatorName?: string;        // 操作人姓名
  timestamp: Date;              // 操作时间
  metadata?: any;               // 额外数据
}

/**
 * 订单验证模式
 */
export const orderSchema = z.object({
  id: z.string().uuid().optional(),
  orderNumber: z.string().optional(), // 订单号
  customerId: z.string().uuid(), // 客户ID
  customerName: z.string().min(1, '客户姓名不能为空'),
  customerPhone: z.string().min(1, '客户电话不能为空'),
  restaurantId: z.string().uuid(), // 餐厅ID
  orderType: z.nativeEnum(OrderType),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  items: z.array(z.object({
    id: z.string().uuid(),
    menuItemId: z.string().uuid(),
    menuItemName: z.string(),
    menuItemImage: z.string().optional(),
    quantity: z.number().min(1, '数量必须大于0'),
    unitPrice: z.number().min(0, '单价不能为负数'),
    totalPrice: z.number().min(0, '小计不能为负数'),
    options: z.array(z.object({
      name: z.string(),
      choices: z.array(z.object({
        name: z.string(),
        price: z.number(),
      })),
    })).optional(),
    specialRequests: z.string().optional(),
    prepStatus: z.enum(['pending', 'preparing', 'ready', 'completed']).default('pending'),
    prepTime: z.number().min(0).optional(),
  })).min(1, '订单至少包含一个商品'),
  priceBreakdown: z.object({
    subtotal: z.number().min(0),
    discount: z.number().min(0).default(0),
    deliveryFee: z.number().min(0).default(0),
    serviceFee: z.number().min(0).default(0),
    tax: z.number().min(0).default(0),
    tip: z.number().min(0).default(0),
    total: z.number().min(0),
  }),
  deliveryInfo: z.object({
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    distance: z.number().min(0).optional(),
    estimatedTime: z.number().min(0).optional(),
    deliveryFee: z.number().min(0),
    contactPhone: z.string(),
    contactName: z.string(),
    instructions: z.string().optional(),
  }).optional(),
  scheduledTime: z.date().optional(), // 预约时间
  estimatedReadyTime: z.date().optional(), // 预计完成时间
  actualReadyTime: z.date().optional(), // 实际完成时间
  deliveryStartTime: z.date().optional(), // 配送开始时间
  deliveryEndTime: z.date().optional(), // 配送完成时间
  review: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    foodQuality: z.number().min(1).max(5),
    serviceQuality: z.number().min(1).max(5),
    deliveryQuality: z.number().min(1).max(5).optional(),
    images: z.array(z.string()).optional(),
    createdAt: z.date(),
  }).optional(),
  notes: z.string().optional(), // 订单备注
  source: z.enum(['web', 'mobile', 'mini_program', 'phone', 'in_store']).default('web'), // 订单来源
  promoCode: z.string().optional(), // 优惠码
  promoDiscount: z.number().min(0).optional(), // 优惠金额
  createdBy: z.string().uuid(), // 创建者ID
  updatedBy: z.string().uuid().optional(), // 更新者ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

/**
 * 订单创建请求类型
 */
export type CreateOrderRequest = Omit<
  z.infer<typeof orderSchema>,
  'id' | 'orderNumber' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt' | 'review'
>;

/**
 * 订单更新请求类型
 */
export type UpdateOrderRequest = Partial<Omit<
  z.infer<typeof orderSchema>,
  'id' | 'orderNumber' | 'customerId' | 'restaurantId' | 'items' | 'priceBreakdown' | 'createdBy' | 'createdAt'
>>;

/**
 * 订单查询参数
 */
export interface OrderQuery {
  customerId?: string;
  restaurantId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  orderType?: OrderType;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
  search?: string; // 搜索订单号或客户姓名
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'total' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 订单响应数据类型
 */
export type OrderResponse = z.infer<typeof orderSchema>;

/**
 * 订单列表响应类型
 */
export interface OrderListResponse {
  items: OrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 订单统计类型
 */
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  statusBreakdown: {
    [key in OrderStatus]: number;
  };
  paymentMethodBreakdown: {
    [key in PaymentMethod]?: {
      count: number;
      amount: number;
    };
  };
  orderTypeBreakdown: {
    [key in OrderType]: number;
  };
  dailyStats: {
    date: string;
    orders: number;
    revenue: number;
  }[];
}

/**
 * 订单销量报告类型
 */
export interface OrderSalesReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalOrders: number;
  totalRevenue: number;
  topMenuItems: {
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    revenue: number;
  }[];
  peakHours: {
    hour: number;
    orderCount: number;
  }[];
  averageOrderValue: number;
  customerRetentionRate: number;
}

/**
 * 配送员信息接口
 */
export interface DeliveryPersonnel {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  deliveryCount: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'busy' | 'offline';
}

/**
 * 订单配送分配接口
 */
export interface OrderDeliveryAssignment {
  orderId: string;
  deliveryPersonnelId: string;
  assignedAt: Date;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  status: 'assigned' | 'picked_up' | 'delivering' | 'delivered';
}