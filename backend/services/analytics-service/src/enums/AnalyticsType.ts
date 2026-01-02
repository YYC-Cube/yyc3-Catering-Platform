/**
 * @file 分析数据类型枚举
 * @description 定义分析数据的类型
 * @module enums/AnalyticsType
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

/**
 * 分析数据类型枚举
 */
export enum AnalyticsType {
  /** 用户分析 */
  USER = 'user',
  /** 订单分析 */
  ORDER = 'order',
  /** 支付分析 */
  PAYMENT = 'payment',
  /** 产品分析 */
  PRODUCT = 'product',
  /** 营销分析 */
  MARKETING = 'marketing',
  /** 运营分析 */
  OPERATION = 'operation',
  /** 客户分析 */
  CUSTOMER = 'customer',
  /** 库存分析 */
  INVENTORY = 'inventory',
  /** 配送分析 */
  DELIVERY = 'delivery',
  /** 系统分析 */
  SYSTEM = 'system'
}
