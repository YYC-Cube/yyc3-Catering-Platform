/**
 * @file 菜单实体类型定义
 * @description 统一的菜单类型定义
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 菜单分类枚举
 */
export enum MenuCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SOUP = 'soup',
  SALAD = 'salad',
  SIDE_DISH = 'side_dish',
  SPECIAL = 'special'
}

/**
 * 菜品状态枚举
 */
export enum MenuItemStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  SEASONAL = 'seasonal'
}

/**
 * 菜品过敏原信息
 */
export interface AllergenInfo {
  gluten?: boolean;
  dairy?: boolean;
  nuts?: boolean;
  eggs?: boolean;
  soy?: boolean;
  fish?: boolean;
  shellfish?: boolean;
  others?: string[];
}

/**
 * 营养信息
 */
export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
}

/**
 * 菜品项接口
 */
export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: MenuCategory;
  status: MenuItemStatus;
  price: number;
  discountPrice?: number;
  currency?: string;
  images?: string[];
  allergens?: AllergenInfo;
  nutrition?: NutritionInfo;
  preparationTime?: number;
  spicyLevel?: number;
  tags?: string[];
  ingredients?: string[];
  customizable?: boolean;
  customizations?: {
    id: string;
    name: string;
    type: 'single' | 'multiple';
    options: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * 菜单分类信息
 */
export interface MenuCategoryInfo {
  id: string;
  restaurantId: string;
  name: string;
  category: MenuCategory;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * 菜单创建请求
 */
export interface CreateMenuItemRequest {
  restaurantId: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  discountPrice?: number;
  images?: string[];
  allergens?: AllergenInfo;
  nutrition?: NutritionInfo;
  preparationTime?: number;
  spicyLevel?: number;
  tags?: string[];
  ingredients?: string[];
  customizable?: boolean;
}

/**
 * 菜单更新请求
 */
export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  category?: MenuCategory;
  status?: MenuItemStatus;
  price?: number;
  discountPrice?: number;
  images?: string[];
  allergens?: AllergenInfo;
  nutrition?: NutritionInfo;
  preparationTime?: number;
  spicyLevel?: number;
  tags?: string[];
  ingredients?: string[];
}

/**
 * 菜单查询参数
 */
export interface MenuQueryParams {
  restaurantId?: string;
  category?: MenuCategory;
  status?: MenuItemStatus;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  searchKeyword?: string;
  spicyLevel?: number;
}
