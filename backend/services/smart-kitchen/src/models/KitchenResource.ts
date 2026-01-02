/**
 * @file 厨房资源模型定义
 * @description 定义厨房资源相关的数据结构和接口
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

// 厨房资源类型枚举
export enum KitchenResourceType {
  STOVE = 'stove',
  OVEN = 'oven',
  GRILL = 'grill',
  FRYER = 'fryer',
  COOKTOP = 'cooktop',
  STEAMER = 'steamer'
}

// 厨房资源接口
export interface KitchenResource {
  id: string;
  restaurantId: string;
  name: string;
  type: KitchenResourceType;
  capacity: number;
  availableCapacity: number;
  status: 'available' | 'in_use' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

// KitchenResource类实现
export class KitchenResource {
  static find: any;
  static update: any;
  static create: any;
}

// 导出全局可用
(globalThis as any).KitchenResource = KitchenResource;
(globalThis as any).KitchenResourceType = KitchenResourceType;