/**
 * @file 配送状态枚举
 * @description 定义配送过程中的各种状态
 * @module enums/deliveryStatus
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export enum DeliveryStatus {
  // 待处理
  PENDING = 'pending',
  // 已分配骑手
  ASSIGNED = 'assigned',
  // 骑手已接单
  ACCEPTED = 'accepted',
  // 骑手前往餐厅
  EN_ROUTE_TO_RESTAURANT = 'en_route_to_restaurant',
  // 骑手已到达餐厅
  ARRIVED_AT_RESTAURANT = 'arrived_at_restaurant',
  // 骑手已取餐
  PICKED_UP = 'picked_up',
  // 骑手配送中
  EN_ROUTE_TO_DELIVERY = 'en_route_to_delivery',
  // 已送达
  DELIVERED = 'delivered',
  // 配送失败
  FAILED = 'failed',
  // 已取消
  CANCELLED = 'cancelled'
}