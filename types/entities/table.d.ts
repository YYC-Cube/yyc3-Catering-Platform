/**
 * @file 桌台实体类型定义
 * @description 统一的桌台类型定义
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 桌台状态枚举
 */
export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance'
}

/**
 * 桌台类型枚举
 */
export enum TableType {
  STANDARD = 'standard',
  BOOTH = 'booth',
  PRIVATE_ROOM = 'private_room',
  OUTDOOR = 'outdoor',
  BAR = 'bar',
  COUNTER = 'counter'
}

/**
 * 桌台接口
 */
export interface Table {
  id: string;
  restaurantId: string;
  number: string;
  name?: string;
  type: TableType;
  status: TableStatus;
  capacity: number;
  currentOccupancy: number;
  area?: string;
  floor?: number;
  isAccessible?: boolean;
  images?: string[];
  amenities?: string[];
  qrCode?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastOccupiedAt?: Date | string;
}

/**
 * 桌台预约接口
 */
export interface TableReservation {
  id: string;
  restaurantId: string;
  tableId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationTime: Date | string;
  duration?: number;
  specialRequests?: string;
  status: TableStatus;
  confirmed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * 桌台创建请求
 */
export interface CreateTableRequest {
  restaurantId: string;
  number: string;
  name?: string;
  type: TableType;
  capacity: number;
  area?: string;
  floor?: number;
  isAccessible?: boolean;
  amenities?: string[];
}

/**
 * 桌台查询参数
 */
export interface TableQueryParams {
  restaurantId?: string;
  status?: TableStatus;
  type?: TableType;
  minCapacity?: number;
  maxCapacity?: number;
  area?: string;
  floor?: number;
  isAccessible?: boolean;
}
