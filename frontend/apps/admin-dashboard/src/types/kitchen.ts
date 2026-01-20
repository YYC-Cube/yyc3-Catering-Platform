/**
 * @fileoverview YYC³餐饮平台 - 厨房管理类型定义
 * @description 厨房管理模块相关数据结构
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export interface KitchenEquipment {
  id: string;
  equipmentCode: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  status: EquipmentStatus;
  location: string;
  purchaseDate: string;
  warrantyDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceInterval: number;
  power: number;
  specifications: Record<string, any>;
  images: string[];
  description?: string;
  responsiblePersonId: string;
  createdAt: string;
  updatedAt?: string;
}

export type EquipmentType = 
  | 'cooking'
  | 'refrigeration'
  | 'baking'
  | 'dishwashing'
  | 'cutting'
  | 'mixing'
  | 'other';

export type EquipmentStatus = 
  | 'normal'
  | 'maintenance'
  | 'repair'
  | 'scrapped';

export interface KitchenEmployee {
  id: string;
  employeeCode: string;
  name: string;
  avatar?: string;
  position: EmployeePosition;
  status: EmployeeStatus;
  phone: string;
  email?: string;
  hireDate: string;
  skills: string[];
  certifications: Certification[];
  currentTasks: number;
  totalTasksCompleted: number;
  efficiency: number;
  averageTime: number;
  workSchedule: WorkSchedule[];
  createdAt: string;
  updatedAt?: string;
}

export type EmployeePosition = 
  | 'chef'
  | 'sous_chef'
  | 'line_cook'
  | 'prep_cook'
  | 'dishwasher'
  | 'other';

export type EmployeeStatus = 
  | 'online'
  | 'busy'
  | 'break'
  | 'offline';

export interface Certification {
  id: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  issuer: string;
}

export interface WorkSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  station?: string;
}

export interface KitchenTask {
  id: string;
  taskId: string;
  orderNo: string;
  orderType?: string;
  itemName: string;
  quantity: number;
  station: TaskStation;
  priority: TaskPriority;
  status: TaskStatus;
  tableNumber: string;
  estimatedTime?: number;
  actualTime?: number;
  startedAt?: string;
  completedAt?: string;
  assignedTo?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TaskStation = 
  | 'hot_dish'
  | 'cold_dish'
  | 'soup'
  | 'bar'
  | 'dessert'
  | 'general';

export type TaskPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export type TaskStatus = 
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface KitchenInventory {
  id: string;
  itemCode: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  supplier: string;
  lastRestockDate: string;
  expiryDate?: string;
  status: InventoryStatus;
  location: string;
  createdAt: string;
  updatedAt?: string;
}

export type InventoryCategory = 
  | 'vegetables'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'dry_goods'
  | 'spices'
  | 'other';

export type InventoryStatus = 
  | 'normal'
  | 'low_stock'
  | 'out_of_stock'
  | 'expired';

export interface HygieneRecord {
  id: string;
  recordCode: string;
  type: HygieneType;
  area: string;
  inspectorId: string;
  inspectorName: string;
  checkDate: string;
  checkTime: string;
  items: HygieneCheckItem[];
  result: HygieneResult;
  score: number;
  issues: HygieneIssue[];
  photos: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type HygieneType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special';

export interface HygieneCheckItem {
  id: string;
  item: string;
  standard: string;
  result: 'pass' | 'fail';
  notes?: string;
}

export type HygieneResult = 
  | 'pass'
  | 'fail'
  | 'conditional';

export interface HygieneIssue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'resolved';
  dueDate: string;
  assignedTo?: string;
}

export interface SafetyRecord {
  id: string;
  recordCode: string;
  type: SafetyType;
  location: string;
  reporterId: string;
  reporterName: string;
  incidentDate: string;
  incidentTime: string;
  description: string;
  severity: SafetySeverity;
  status: SafetyStatus;
  photos: string[];
  witnesses: string[];
  actions: SafetyAction[];
  createdAt: string;
  updatedAt?: string;
}

export type SafetyType = 
  | 'fire'
  | 'injury'
  | 'equipment'
  | 'food_poisoning'
  | 'other';

export type SafetySeverity = 
  | 'minor'
  | 'moderate'
  | 'severe'
  | 'critical';

export type SafetyStatus = 
  | 'reported'
  | 'investigating'
  | 'resolved'
  | 'closed';

export interface SafetyAction {
  id: string;
  action: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedDate?: string;
}

export interface KitchenStats {
  activeTasks: number;
  completedToday: number;
  efficiencyRate: number;
  averagePreparationTime: number;
  totalEmployees: number;
  onlineEmployees: number;
  totalEquipment: number;
  normalEquipment: number;
  maintenanceEquipment: number;
  lowStockItems: number;
  expiredItems: number;
}

export interface KitchenAnalytics {
  taskDistribution: TaskDistributionData[];
  stationDistribution: StationDistributionData[];
  staffEfficiency: StaffEfficiencyData[];
  peakHours: PeakHourData[];
  equipmentUtilization: EquipmentUtilizationData[];
  inventoryTrends: InventoryTrendData[];
}

export interface TaskDistributionData {
  status: string;
  count: number;
  percentage: number;
}

export interface StationDistributionData {
  station: string;
  count: number;
  percentage: number;
}

export interface StaffEfficiencyData {
  employeeId: string;
  employeeName: string;
  tasksCompleted: number;
  averageTime: number;
  efficiency: number;
}

export interface PeakHourData {
  hour: number;
  taskCount: number;
  orderCount: number;
}

export interface EquipmentUtilizationData {
  equipmentId: string;
  equipmentName: string;
  usageHours: number;
  utilizationRate: number;
}

export interface InventoryTrendData {
  date: string;
  itemCount: number;
  value: number;
}

export interface KitchenDisplay {
  id: string;
  displayName: string;
  station: string;
  type: 'task' | 'order' | 'custom';
  layout: DisplayLayout;
  filters: DisplayFilter[];
  refreshInterval: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DisplayLayout {
  columns: number;
  rows: number;
  cardSize: 'small' | 'medium' | 'large';
  showDetails: boolean;
  showTimer: boolean;
}

export interface DisplayFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
}
