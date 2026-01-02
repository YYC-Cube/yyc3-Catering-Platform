/**
 * @fileoverview YYC³菜单管理数据模型
 * @description 餐厅菜单、菜品分类、菜品信息的数据模型定义
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { z } from 'zod';

/**
 * 菜品分类枚举
 */
export enum MenuCategory {
  APPETIZER = 'appetizer',      // 开胃菜
  SOUP = 'soup',              // 汤品
  MAIN_COURSE = 'main_course', // 主菜
  DESSERT = 'dessert',         // 甜品
  BEVERAGE = 'beverage',      // 饮品
  SPECIAL = 'special',        // 特色菜
  SET_MEAL = 'set_meal',      // 套餐
  SIDE_DISH = 'side_dish',    // 配菜
}

/**
 * 菜品状态枚举
 */
export enum MenuItemStatus {
  AVAILABLE = 'available',     // 可供应
  UNAVAILABLE = 'unavailable', // 暂时无货
  SEASONAL = 'seasonal',       // 季节性供应
  DISCONTINUED = 'discontinued', // 已下架
}

/**
 * 菜品辣度等级
 */
export enum SpicyLevel {
  NONE = 'none',        // 不辣
  MILD = 'mild',        // 微辣
  MEDIUM = 'medium',    // 中辣
  HOT = 'hot',          // 重辣
  EXTRA_HOT = 'extra_hot', // 特辣
}

/**
 * 菜品价格类型
 */
export enum PriceType {
  FIXED = 'fixed',      // 固定价格
  RANGE = 'range',      // 价格区间
  MARKET = 'market',    // 时价
}

/**
 * 营养成分接口
 */
export interface NutritionInfo {
  calories: number;        // 卡路里
  protein: number;         // 蛋白质 (g)
  carbs: number;          // 碳水化合物 (g)
  fat: number;            // 脂肪 (g)
  fiber: number;          // 纤维 (g)
  sodium: number;         // 钠 (mg)
  sugar: number;          // 糖 (g)
  allergens?: string[];   // 过敏原
}

/**
 * 菜品图片接口
 */
export interface MenuItemImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;        // 是否为主图
  sortOrder: number;      // 排序
  createdAt: Date;
}

/**
 * 菜品规格选项
 */
export interface MenuItemOption {
  id: string;
  name: string;           // 选项名称
  type: 'single' | 'multiple'; // 单选/多选
  required: boolean;      // 是否必选
  choices: MenuItemChoice[]; // 选项列表
  maxChoices?: number;    // 最多选择数量
}

/**
 * 选项选择
 */
export interface MenuItemChoice {
  id: string;
  name: string;           // 显示名称
  price: number;          // 价格
  description?: string;   // 描述
}

/**
 * 菜品评价统计
 */
export interface MenuItemRating {
  average: number;        // 平均评分
  count: number;          // 评价数量
  distribution: {         // 评分分布
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * 菜品信息验证模式
 */
export const menuItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '菜品名称不能为空').max(100, '菜品名称不能超过100字符'),
  description: z.string().max(500, '菜品描述不能超过500字符').optional(),
  category: z.nativeEnum(MenuCategory),
  status: z.nativeEnum(MenuItemStatus).default(MenuItemStatus.AVAILABLE),
  priceType: z.nativeEnum(PriceType).default(PriceType.FIXED),
  price: z.number().min(0, '价格不能为负数'),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  originalPrice: z.number().min(0).optional(), // 原价
  images: z.array(z.object({
    id: z.string().uuid(),
    url: z.string().url(),
    alt: z.string(),
    isMain: z.boolean(),
    sortOrder: z.number().min(0),
  })).optional(),
  spicyLevel: z.nativeEnum(SpicyLevel).default(SpicyLevel.NONE),
  prepTime: z.number().min(0, '准备时间不能为负数'), // 准备时间(分钟)
  tags: z.array(z.string()).optional(), // 标签
  ingredients: z.array(z.string()).optional(), // 主要食材
  allergens: z.array(z.string()).optional(), // 过敏原
  nutrition: z.object({
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0),
    sodium: z.number().min(0),
    sugar: z.number().min(0),
    allergens: z.array(z.string()).optional(),
  }).optional(),
  options: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    type: z.enum(['single', 'multiple']),
    required: z.boolean(),
    choices: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      price: z.number().min(0),
      description: z.string().optional(),
    })),
    maxChoices: z.number().min(1).optional(),
  })).optional(),
  rating: z.object({
    average: z.number().min(0).max(5),
    count: z.number().min(0),
    distribution: z.object({
      1: z.number().min(0),
      2: z.number().min(0),
      3: z.number().min(0),
      4: z.number().min(0),
      5: z.number().min(0),
    }),
  }).optional(),
  sortOrder: z.number().default(0),
  isRecommended: z.boolean().default(false), // 是否推荐
  isPopular: z.boolean().default(false), // 是否热门
  isNew: z.boolean().default(false), // 是否新品
  isSeasonal: z.boolean().default(false), // 是否季节限定
  seasonStart: z.date().optional(), // 季节开始时间
  seasonEnd: z.date().optional(), // 季节结束时间
  restaurantId: z.string().uuid(), // 所属餐厅ID
  createdBy: z.string().uuid(), // 创建者ID
  updatedBy: z.string().uuid().optional(), // 更新者ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

/**
 * 菜品创建请求类型
 */
export type CreateMenuItemRequest = Omit<
  z.infer<typeof menuItemSchema>,
  'id' | 'createdAt' | 'updatedAt' | 'rating'
>;

/**
 * 菜品更新请求类型
 */
export type UpdateMenuItemRequest = Partial<Omit<
  z.infer<typeof menuItemSchema>,
  'id' | 'restaurantId' | 'createdBy' | 'createdAt' | 'updatedAt'
>>;

/**
 * 菜品查询参数
 */
export interface MenuItemQuery {
  category?: MenuCategory;
  status?: MenuItemStatus;
  spicyLevel?: SpicyLevel;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  ingredients?: string[];
  isRecommended?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  restaurantId?: string;
}

/**
 * 菜品响应数据类型
 */
export type MenuItemResponse = z.infer<typeof menuItemSchema>;

/**
 * 菜品列表响应类型
 */
export interface MenuItemListResponse {
  items: MenuItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 菜品分类统计类型
 */
export interface CategoryStats {
  category: MenuCategory;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  popularItems: string[]; // 热门菜品ID
}

/**
 * 菜品销量统计类型
 */
export interface MenuItemSalesStats {
  itemId: string;
  itemName: string;
  totalSold: number;
  totalRevenue: number;
  avgOrderQuantity: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
}