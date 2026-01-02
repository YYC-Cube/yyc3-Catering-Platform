/**
 * YYC³餐饮行业智能化平台 - 仪表板相关类型定义
 */

// 核心指标类型
export interface CoreMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  unit?: string;
}

export interface CoreMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  orderChange?: number;
  revenueChange?: number;
}

// 营收数据类型
export interface RevenueData {
  date: string;
  amount: number;
  orders: number;
  customers: number;
}

// 订单数据类型
export interface Order {
  id: string;
  tableNumber: string;
  customerName?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  total?: number;
  items: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

export interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopDish {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface CustomerFlow {
  hour: number;
  count: number;
}

// 桌台数据类型
export interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity: number;
  area: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TableStatus = Table[];

// 厨房状态类型
export interface KitchenStatus {
  id: string;
  orderId: string;
  items: KitchenItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  priority: 'normal' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface KitchenItem {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready';
  note?: string;
}

export interface KitchenStats {
  inProgress: number;
  pending: number;
  completed: number;
  avgPrepTime: number;
  total?: number;
  items?: KitchenStatus[];
}

// 预警信息类型
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// 图表数据类型
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}
