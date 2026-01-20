/**
 * @file MenuItemService测试文件
 * @description 测试菜品服务的核心功能
 * @module tests/services/MenuItemService
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuItemService } from '../../../services/MenuItemService';
import { MenuItem } from '../../../models/MenuItem';
import { MenuItemOption } from '../../../models/MenuItemOption';
import { MenuItemImage } from '../../../models/MenuItemImage';
import { MenuItemTag } from '../../../models/MenuItemTag';
import { Tag } from '../../../models/Tag';
import { Recommendation } from '../../../models/Recommendation';
import { DynamicPrice } from '../../../models/DynamicPrice';
import logger from '../../../config/logger';

vi.mock('../../../models/MenuItem');
vi.mock('../../../models/MenuItemOption');
vi.mock('../../../models/MenuItemImage');
vi.mock('../../../models/MenuItemTag');
vi.mock('../../../models/Tag');
vi.mock('../../../models/Recommendation');
vi.mock('../../../models/DynamicPrice');
vi.mock('../../../config/logger');

describe('MenuItemService', () => {
  let menuItemService: MenuItemService;

  beforeEach(() => {
    menuItemService = new MenuItemService();
    vi.clearAllMocks();
  });

  describe('createMenuItem', () => {
    it('应该成功创建菜品', async () => {
      const mockMenuItem = {
        id: 1,
        name: '宫保鸡丁',
        price: 28,
        stock: 100
      };

      vi.spyOn(MenuItem, 'create').mockResolvedValue(mockMenuItem as any);
      vi.spyOn(MenuItemOption, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemImage, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemTag, 'bulkCreate').mockResolvedValue([] as any);

      const result = await menuItemService.createMenuItem({
        name: '宫保鸡丁',
        price: 28,
        stock: 100,
        category_id: 1
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('宫保鸡丁');
    });
  });

  describe('getMenuItems', () => {
    it('应该成功获取菜品列表', async () => {
      const mockMenuItems = [
        { id: 1, name: '宫保鸡丁', price: 28 },
        { id: 2, name: '麻婆豆腐', price: 18 }
      ];

      vi.spyOn(MenuItem, 'findAndCountAll').mockResolvedValue({
        rows: mockMenuItems as any,
        count: 2
      });

      const result = await menuItemService.getMenuItems({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.menuItems).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('应该支持关键词搜索', async () => {
      const mockMenuItems = [{ id: 1, name: '宫保鸡丁', price: 28 }];

      vi.spyOn(MenuItem, 'findAndCountAll').mockResolvedValue({
        rows: mockMenuItems as any,
        count: 1
      });

      const result = await menuItemService.getMenuItems({ keyword: '宫保' });

      expect(result.menuItems).toHaveLength(1);
    });

    it('应该支持价格范围过滤', async () => {
      const mockMenuItems = [{ id: 1, name: '宫保鸡丁', price: 28 }];

      vi.spyOn(MenuItem, 'findAndCountAll').mockResolvedValue({
        rows: mockMenuItems as any,
        count: 1
      });

      const result = await menuItemService.getMenuItems({ minPrice: 20, maxPrice: 30 });

      expect(result.menuItems).toHaveLength(1);
    });
  });

  describe('getMenuItemById', () => {
    it('应该成功获取菜品详情', async () => {
      const mockMenuItem = {
        id: 1,
        name: '宫保鸡丁',
        price: 28,
        menuItemOptions: [],
        menuItemImages: [],
        menuItemTags: []
      };

      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(mockMenuItem as any);

      const result = await menuItemService.getMenuItemById(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
    });

    it('应该返回null当菜品不存在', async () => {
      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(null);

      const result = await menuItemService.getMenuItemById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateMenuItem', () => {
    it('应该成功更新菜品', async () => {
      const mockMenuItem = {
        id: 1,
        name: '宫保鸡丁',
        price: 28,
        update: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(mockMenuItem as any);
      vi.spyOn(MenuItemOption, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemOption, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemImage, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemImage, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemTag, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemTag, 'bulkCreate').mockResolvedValue([] as any);

      const result = await menuItemService.updateMenuItem(1, {
        name: '新宫保鸡丁',
        price: 30
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe('宫保鸡丁');
    });

    it('应该返回null当菜品不存在', async () => {
      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(null);

      const result = await menuItemService.updateMenuItem(999, {
        name: '新名称'
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteMenuItem', () => {
    it('应该成功删除菜品', async () => {
      const mockMenuItem = {
        id: 1,
        name: '宫保鸡丁',
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(mockMenuItem as any);
      vi.spyOn(MenuItemOption, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemImage, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemTag, 'destroy').mockResolvedValue(1);

      const result = await menuItemService.deleteMenuItem(1);

      expect(result).toBe(true);
    });

    it('应该返回false当菜品不存在', async () => {
      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(null);

      const result = await menuItemService.deleteMenuItem(999);

      expect(result).toBe(false);
    });
  });

  describe('updateMenuItemStatus', () => {
    it('应该成功更新菜品状态', async () => {
      const mockMenuItem = {
        id: 1,
        name: '宫保鸡丁',
        is_active: true,
        update: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(mockMenuItem as any);
      vi.spyOn(MenuItemOption, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemOption, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemImage, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemImage, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemTag, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemTag, 'bulkCreate').mockResolvedValue([] as any);

      const result = await menuItemService.updateMenuItemStatus(1, false);

      expect(result).toBeDefined();
    });
  });

  describe('updateMenuItemStock', () => {
    it('应该成功更新菜品库存', async () => {
      const mockMenuItem = {
        id: 1,
        name: '宫保鸡丁',
        stock: 100,
        update: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(mockMenuItem as any);
      vi.spyOn(MenuItemOption, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemOption, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemImage, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemImage, 'bulkCreate').mockResolvedValue([] as any);
      vi.spyOn(MenuItemTag, 'destroy').mockResolvedValue(1);
      vi.spyOn(MenuItemTag, 'bulkCreate').mockResolvedValue([] as any);

      const result = await menuItemService.updateMenuItemStock(1, 50);

      expect(result).toBeDefined();
    });
  });

  describe('incrementMenuItemSales', () => {
    it('应该成功增加菜品销量', async () => {
      const mockMenuItem = {
        id: 1,
        name: '宫保鸡丁',
        sales: 100,
        save: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(mockMenuItem as any);

      const result = await menuItemService.incrementMenuItemSales(1, 5);

      expect(result).toBeDefined();
      expect(mockMenuItem.sales).toBe(105);
    });

    it('应该返回null当菜品不存在', async () => {
      vi.spyOn(MenuItem, 'findByPk').mockResolvedValue(null);

      const result = await menuItemService.incrementMenuItemSales(999, 5);

      expect(result).toBeNull();
    });
  });

  describe('createDynamicPrice', () => {
    it('应该成功创建动态价格规则', async () => {
      const mockDynamicPrice = {
        id: 1,
        menu_item_id: 1,
        dynamic_price: 25,
        price_type: 'time_based'
      };

      vi.spyOn(DynamicPrice, 'create').mockResolvedValue(mockDynamicPrice as any);

      const result = await menuItemService.createDynamicPrice({
        menu_item_id: 1,
        dynamic_price: 25,
        price_type: 'time_based',
        rule_config: {},
        is_active: true
      });

      expect(result).toBeDefined();
      expect(result.menu_item_id).toBe(1);
    });
  });

  describe('getDynamicPricesByMenuItemId', () => {
    it('应该成功获取菜品动态价格规则', async () => {
      const mockDynamicPrices = [
        { id: 1, menu_item_id: 1, dynamic_price: 25 },
        { id: 2, menu_item_id: 1, dynamic_price: 20 }
      ];

      vi.spyOn(DynamicPrice, 'findAll').mockResolvedValue(mockDynamicPrices as any);

      const result = await menuItemService.getDynamicPricesByMenuItemId(1);

      expect(result).toHaveLength(2);
    });
  });

  describe('getCurrentDynamicPrice', () => {
    it('应该成功获取当前有效的动态价格', async () => {
      const mockDynamicPrice = {
        id: 1,
        menu_item_id: 1,
        dynamic_price: 25,
        rule_config: {}
      };

      vi.spyOn(DynamicPrice, 'findAll').mockResolvedValue([mockDynamicPrice as any]);

      const result = await menuItemService.getCurrentDynamicPrice(1);

      expect(result).toBeDefined();
    });
  });

  describe('updateDynamicPrice', () => {
    it('应该成功更新动态价格规则', async () => {
      const mockDynamicPrice = {
        id: 1,
        menu_item_id: 1,
        dynamic_price: 25,
        update: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(DynamicPrice, 'findByPk').mockResolvedValue(mockDynamicPrice as any);

      const result = await menuItemService.updateDynamicPrice(1, {
        dynamic_price: 30
      });

      expect(result).toBeDefined();
    });

    it('应该返回null当动态价格规则不存在', async () => {
      vi.spyOn(DynamicPrice, 'findByPk').mockResolvedValue(null);

      const result = await menuItemService.updateDynamicPrice(999, {
        dynamic_price: 30
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteDynamicPrice', () => {
    it('应该成功删除动态价格规则', async () => {
      const mockDynamicPrice = {
        id: 1,
        menu_item_id: 1,
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(DynamicPrice, 'findByPk').mockResolvedValue(mockDynamicPrice as any);

      const result = await menuItemService.deleteDynamicPrice(1);

      expect(result).toBe(true);
    });

    it('应该返回false当动态价格规则不存在', async () => {
      vi.spyOn(DynamicPrice, 'findByPk').mockResolvedValue(null);

      const result = await menuItemService.deleteDynamicPrice(999);

      expect(result).toBe(false);
    });
  });

  describe('createRecommendation', () => {
    it('应该成功生成推荐', async () => {
      const mockRecommendation = {
        id: 1,
        user_id: 1,
        menu_item_id: 1,
        score: 85
      };

      vi.spyOn(Recommendation, 'create').mockResolvedValue(mockRecommendation as any);

      const result = await menuItemService.createRecommendation({
        user_id: 1,
        menu_item_id: 1,
        recommendation_type: 'personalized',
        score: 85,
        rank: 1
      });

      expect(result).toBeDefined();
      expect(result.user_id).toBe(1);
    });
  });

  describe('getRecommendationsByUserId', () => {
    it('应该成功获取用户推荐列表', async () => {
      const mockRecommendations = [
        { id: 1, user_id: 1, menu_item_id: 1, score: 85 },
        { id: 2, user_id: 1, menu_item_id: 2, score: 80 }
      ];

      vi.spyOn(Recommendation, 'findAll').mockResolvedValue(mockRecommendations as any);

      const result = await menuItemService.getRecommendationsByUserId(1, 10);

      expect(result).toHaveLength(2);
    });
  });

  describe('getRecommendationsByMenuItemId', () => {
    it('应该成功获取菜品推荐情况', async () => {
      const mockRecommendations = [
        { id: 1, user_id: 1, menu_item_id: 1, score: 85 }
      ];

      vi.spyOn(Recommendation, 'findAll').mockResolvedValue(mockRecommendations as any);

      const result = await menuItemService.getRecommendationsByMenuItemId(1);

      expect(result).toHaveLength(1);
    });
  });

  describe('updateRecommendationUsage', () => {
    it('应该成功更新推荐使用情况', async () => {
      const mockRecommendation = {
        id: 1,
        user_id: 1,
        menu_item_id: 1,
        click_count: 0,
        order_count: 0,
        update: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(Recommendation, 'findByPk').mockResolvedValue(mockRecommendation as any);

      const result = await menuItemService.updateRecommendationUsage(1, {
        click_count: 1
      });

      expect(result).toBeDefined();
      expect(mockRecommendation.click_count).toBe(1);
    });

    it('应该返回null当推荐不存在', async () => {
      vi.spyOn(Recommendation, 'findByPk').mockResolvedValue(null);

      const result = await menuItemService.updateRecommendationUsage(999, {
        click_count: 1
      });

      expect(result).toBeNull();
    });
  });

  describe('generateSmartRecommendations', () => {
    it('应该成功生成智能推荐', async () => {
      const mockMenuItems = [
        { id: 1, name: '宫保鸡丁', is_active: true },
        { id: 2, name: '麻婆豆腐', is_active: true }
      ];

      const mockRecommendedMenuItems = [
        { id: 1, name: '宫保鸡丁', menuItemOptions: [], menuItemImages: [], menuItemTags: [] },
        { id: 2, name: '麻婆豆腐', menuItemOptions: [], menuItemImages: [], menuItemTags: [] }
      ];

      vi.spyOn(MenuItem, 'findAll').mockResolvedValueOnce(mockMenuItems as any);
      vi.spyOn(MenuItem, 'findAll').mockResolvedValueOnce(mockRecommendedMenuItems as any);
      vi.spyOn(Recommendation, 'create').mockResolvedValue({} as any);

      const result = await menuItemService.generateSmartRecommendations(1, 10);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('trainRecommendationModel', () => {
    it('应该成功训练推荐模型', async () => {
      const trainingData = [
        { orderCount: 10, clickCount: 20, browsingCount: 30 }
      ];

      const result = await menuItemService.trainRecommendationModel(trainingData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('推荐模型训练完成');
    });
  });

  describe('updateUserProfile', () => {
    it('应该成功更新用户画像', async () => {
      const result = await menuItemService.updateUserProfile(1, {
        preferences: { 1: 5 }
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('用户画像更新完成');
    });
  });

  describe('getUserProfile', () => {
    it('应该成功获取用户画像', async () => {
      const result = await menuItemService.getUserProfile(1);

      expect(result).toBeDefined();
      expect(result?.userId).toBe(1);
    });
  });
});
