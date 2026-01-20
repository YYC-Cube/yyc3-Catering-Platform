/**
 * @fileoverview YYC³菜单模型单元测试
 * @description 测试菜单数据模型的Zod验证模式
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import {
  menuItemSchema,
  MenuCategory,
  MenuItemStatus,
  SpicyLevel,
  PriceType,
  type CreateMenuItemRequest,
  type UpdateMenuItemRequest,
  type MenuItemQuery,
  type MenuItemResponse,
  type MenuItemListResponse,
  type CategoryStats,
  type MenuItemSalesStats,
} from '../../../models/menu';

describe('菜单模型测试', () => {
  describe('枚举类型测试', () => {
    it('应该正确定义菜单分类枚举', () => {
      expect(MenuCategory.APPETIZER).toBe('appetizer');
      expect(MenuCategory.SOUP).toBe('soup');
      expect(MenuCategory.MAIN_COURSE).toBe('main_course');
      expect(MenuCategory.DESSERT).toBe('dessert');
      expect(MenuCategory.BEVERAGE).toBe('beverage');
      expect(MenuCategory.SPECIAL).toBe('special');
      expect(MenuCategory.SET_MEAL).toBe('set_meal');
      expect(MenuCategory.SIDE_DISH).toBe('side_dish');
    });

    it('应该正确定义菜品状态枚举', () => {
      expect(MenuItemStatus.AVAILABLE).toBe('available');
      expect(MenuItemStatus.UNAVAILABLE).toBe('unavailable');
      expect(MenuItemStatus.SEASONAL).toBe('seasonal');
      expect(MenuItemStatus.DISCONTINUED).toBe('discontinued');
    });

    it('应该正确定义辣度等级枚举', () => {
      expect(SpicyLevel.NONE).toBe('none');
      expect(SpicyLevel.MILD).toBe('mild');
      expect(SpicyLevel.MEDIUM).toBe('medium');
      expect(SpicyLevel.HOT).toBe('hot');
      expect(SpicyLevel.EXTRA_HOT).toBe('extra_hot');
    });

    it('应该正确定义价格类型枚举', () => {
      expect(PriceType.FIXED).toBe('fixed');
      expect(PriceType.RANGE).toBe('range');
      expect(PriceType.MARKET).toBe('market');
    });
  });

  describe('菜单项Schema验证测试', () => {
    const validMenuItem = {
      name: '宫保鸡丁',
      description: '经典川菜，麻辣鲜香',
      category: MenuCategory.MAIN_COURSE,
      status: MenuItemStatus.AVAILABLE,
      priceType: PriceType.FIXED,
      price: 38,
      spicyLevel: SpicyLevel.MEDIUM,
      prepTime: 15,
      tags: ['川菜', '辣'],
      ingredients: ['鸡肉', '花生', '干辣椒'],
      allergens: ['花生'],
      nutrition: {
        calories: 450,
        protein: 25,
        carbs: 15,
        fat: 20,
        fiber: 3,
        sodium: 800,
        sugar: 5,
      },
      restaurantId: '550e8400-e29b-41d4-a716-446655440000',
      createdBy: '550e8400-e29b-41d4-a716-446655440001',
    };

    it('应该验证有效的菜单项数据', () => {
      const result = menuItemSchema.safeParse(validMenuItem);
      expect(result.success).toBe(true);
    });

    it('应该拒绝缺少必填字段的菜单项', () => {
      const invalidItem = { ...validMenuItem };
      delete (invalidItem as any).name;
      const result = menuItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('应该拒绝菜品名称为空的菜单项', () => {
      const invalidItem = { ...validMenuItem, name: '' };
      const result = menuItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('菜品名称不能为空');
      }
    });

    it('应该拒绝菜品名称超过100字符的菜单项', () => {
      const invalidItem = { ...validMenuItem, name: 'a'.repeat(101) };
      const result = menuItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('应该拒绝描述超过500字符的菜单项', () => {
      const invalidItem = { ...validMenuItem, description: 'a'.repeat(501) };
      const result = menuItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('应该拒绝价格为负数的菜单项', () => {
      const invalidItem = { ...validMenuItem, price: -10 };
      const result = menuItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('应该拒绝准备时间为负数的菜单项', () => {
      const invalidItem = { ...validMenuItem, prepTime: -5 };
      const result = menuItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('应该拒绝无效的UUID格式', () => {
      const invalidItem = { ...validMenuItem, restaurantId: 'invalid-uuid' };
      const result = menuItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('应该接受带有价格区间的菜单项', () => {
      const itemWithRange = {
        ...validMenuItem,
        priceType: PriceType.RANGE,
        priceRange: {
          min: 30,
          max: 50,
        },
      };
      const result = menuItemSchema.safeParse(itemWithRange);
      expect(result.success).toBe(true);
    });

    it('应该接受带有图片的菜单项', () => {
      const itemWithImages = {
        ...validMenuItem,
        images: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            url: 'https://example.com/image.jpg',
            alt: '宫保鸡丁图片',
            isMain: true,
            sortOrder: 0,
          },
        ],
      };
      const result = menuItemSchema.safeParse(itemWithImages);
      expect(result.success).toBe(true);
    });

    it('应该拒绝无效的图片URL', () => {
      const itemWithInvalidImage = {
        ...validMenuItem,
        images: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            url: 'not-a-url',
            alt: '宫保鸡丁图片',
            isMain: true,
            sortOrder: 0,
          },
        ],
      };
      const result = menuItemSchema.safeParse(itemWithInvalidImage);
      expect(result.success).toBe(false);
    });

    it('应该接受带有选项的菜单项', () => {
      const itemWithOptions = {
        ...validMenuItem,
        options: [
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            name: '辣度选择',
            type: 'single' as const,
            required: false,
            choices: [
              {
                id: '550e8400-e29b-41d4-a716-446655440004',
                name: '微辣',
                price: 0,
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440005',
                name: '中辣',
                price: 0,
              },
            ],
          },
        ],
      };
      const result = menuItemSchema.safeParse(itemWithOptions);
      expect(result.success).toBe(true);
    });

    it('应该接受带有评价统计的菜单项', () => {
      const itemWithRating = {
        ...validMenuItem,
        rating: {
          average: 4.5,
          count: 100,
          distribution: {
            1: 5,
            2: 10,
            3: 20,
            4: 35,
            5: 30,
          },
        },
      };
      const result = menuItemSchema.safeParse(itemWithRating);
      expect(result.success).toBe(true);
    });

    it('应该拒绝超出范围的评分', () => {
      const itemWithInvalidRating = {
        ...validMenuItem,
        rating: {
          average: 6,
          count: 100,
          distribution: {
            1: 5,
            2: 10,
            3: 20,
            4: 35,
            5: 30,
          },
        },
      };
      const result = menuItemSchema.safeParse(itemWithInvalidRating);
      expect(result.success).toBe(false);
    });

    it('应该接受带有推荐标记的菜单项', () => {
      const recommendedItem = {
        ...validMenuItem,
        isRecommended: true,
        isPopular: true,
        isNew: true,
        isSeasonal: true,
        seasonStart: new Date('2024-06-01'),
        seasonEnd: new Date('2024-08-31'),
      };
      const result = menuItemSchema.safeParse(recommendedItem);
      expect(result.success).toBe(true);
    });

    it('应该应用默认值', () => {
      const minimalItem = {
        name: '测试菜品',
        category: MenuCategory.MAIN_COURSE,
        price: 30,
        prepTime: 15,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };
      const result = menuItemSchema.safeParse(minimalItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(MenuItemStatus.AVAILABLE);
        expect(result.data.priceType).toBe(PriceType.FIXED);
        expect(result.data.spicyLevel).toBe(SpicyLevel.NONE);
        expect(result.data.sortOrder).toBe(0);
        expect(result.data.isRecommended).toBe(false);
        expect(result.data.isPopular).toBe(false);
        expect(result.data.isNew).toBe(false);
        expect(result.data.isSeasonal).toBe(false);
      }
    });
  });

  describe('类型定义测试', () => {
    it('应该正确定义CreateMenuItemRequest类型', () => {
      const createRequest: CreateMenuItemRequest = {
        name: '新菜品',
        category: MenuCategory.MAIN_COURSE,
        price: 40,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };
      expect(createRequest).toBeDefined();
    });

    it('应该正确定义UpdateMenuItemRequest类型', () => {
      const updateRequest: UpdateMenuItemRequest = {
        name: '更新后的菜品名',
        price: 45,
      };
      expect(updateRequest).toBeDefined();
    });

    it('应该正确定义MenuItemQuery类型', () => {
      const query: MenuItemQuery = {
        category: MenuCategory.MAIN_COURSE,
        status: MenuItemStatus.AVAILABLE,
        minPrice: 20,
        maxPrice: 100,
        tags: ['川菜'],
        search: '鸡',
        page: 1,
        limit: 20,
        sortBy: 'price',
        sortOrder: 'asc',
      };
      expect(query).toBeDefined();
    });

    it('应该正确定义MenuItemResponse类型', () => {
      const response: MenuItemResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '宫保鸡丁',
        category: MenuCategory.MAIN_COURSE,
        status: MenuItemStatus.AVAILABLE,
        priceType: PriceType.FIXED,
        price: 38,
        spicyLevel: SpicyLevel.MEDIUM,
        prepTime: 15,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(response).toBeDefined();
    });

    it('应该正确定义MenuItemListResponse类型', () => {
      const listResponse: MenuItemListResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };
      expect(listResponse).toBeDefined();
    });

    it('应该正确定义CategoryStats类型', () => {
      const stats: CategoryStats = {
        category: MenuCategory.MAIN_COURSE,
        count: 50,
        avgPrice: 40,
        minPrice: 20,
        maxPrice: 100,
        popularItems: ['item1', 'item2', 'item3'],
      };
      expect(stats).toBeDefined();
    });

    it('应该正确定义MenuItemSalesStats类型', () => {
      const salesStats: MenuItemSalesStats = {
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        itemName: '宫保鸡丁',
        totalSold: 1000,
        totalRevenue: 38000,
        avgOrderQuantity: 1.5,
        dailyAverage: 50,
        weeklyAverage: 350,
        monthlyAverage: 1500,
      };
      expect(salesStats).toBeDefined();
    });
  });

  describe('边界条件测试', () => {
    it('应该接受最小长度的菜品名称', () => {
      const item = {
        name: 'a',
        category: MenuCategory.MAIN_COURSE,
        price: 30,
        prepTime: 15,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };
      const result = menuItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('应该接受最大长度的菜品名称', () => {
      const item = {
        name: 'a'.repeat(100),
        category: MenuCategory.MAIN_COURSE,
        price: 30,
        prepTime: 15,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };
      const result = menuItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('应该接受零价格', () => {
      const item = {
        name: '免费菜品',
        category: MenuCategory.MAIN_COURSE,
        price: 0,
        prepTime: 15,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };
      const result = menuItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('应该接受零准备时间', () => {
      const item = {
        name: '即时菜品',
        category: MenuCategory.MAIN_COURSE,
        price: 30,
        prepTime: 0,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };
      const result = menuItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('应该接受所有辣度等级', () => {
      const spicyLevels = [
        SpicyLevel.NONE,
        SpicyLevel.MILD,
        SpicyLevel.MEDIUM,
        SpicyLevel.HOT,
        SpicyLevel.EXTRA_HOT,
      ];

      spicyLevels.forEach(level => {
        const item = {
          name: '辣味菜品',
          category: MenuCategory.MAIN_COURSE,
          price: 30,
          spicyLevel: level,
          prepTime: 15,
          restaurantId: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440001',
        };
        const result = menuItemSchema.safeParse(item);
        expect(result.success).toBe(true);
      });
    });

    it('应该接受所有菜品状态', () => {
      const statuses = [
        MenuItemStatus.AVAILABLE,
        MenuItemStatus.UNAVAILABLE,
        MenuItemStatus.SEASONAL,
        MenuItemStatus.DISCONTINUED,
      ];

      statuses.forEach(status => {
        const item = {
          name: '测试菜品',
          category: MenuCategory.MAIN_COURSE,
          price: 30,
          status: status,
          prepTime: 15,
          restaurantId: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440001',
        };
        const result = menuItemSchema.safeParse(item);
        expect(result.success).toBe(true);
      });
    });
  });
});
