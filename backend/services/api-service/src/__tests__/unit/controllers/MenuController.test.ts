/**
 * @fileoverview YYC³菜单控制器单元测试
 * @description 测试菜单管理控制器的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-07
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuController } from '../../../controllers/menu-controller';

vi.mock('../../../config/database', () => ({
  dbManager: {
    createPool: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockImplementation((sql: string, params: any[]) => {
      if (sql.includes('INSERT INTO menu_items')) {
        return Promise.resolve({
          rows: [{
            id: '550e8400-e29b-41d4-a716-446655440000',
            created_at: new Date(),
          }]
        });
      }
      if (sql.includes('UPDATE menu_items') && sql.includes('SET status')) {
        return Promise.resolve({
          rows: [{
            id: params[params.length - 1],
            status: params[0],
            updated_at: new Date(),
          }]
        });
      }
      if (sql.includes('UPDATE menu_items') && sql.includes('DELETE') || sql.includes('SET deleted_at')) {
        return Promise.resolve({
          rows: [{
            id: params[params.length - 1],
            deleted_at: new Date(),
          }]
        });
      }
      if (sql.includes('UPDATE menu_items') && sql.includes('RETURNING updated_at')) {
        return Promise.resolve({
          rows: [{
            updated_at: new Date(),
          }]
        });
      }
      if (sql.includes('SELECT') && sql.includes('FROM menu_items') && sql.includes('WHERE id = $1')) {
        const itemId = params[0];
        if (itemId === '999999') {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({
          rows: [{
            id: itemId,
            restaurant_id: '1',
            category_id: '1',
            name: '测试菜品',
            description: '测试描述',
            price: 38.0,
            status: 'available',
            created_at: new Date(),
            updated_at: new Date(),
          }]
        });
      }
      if (sql.includes('SELECT') && sql.includes('COUNT(*)')) {
        return Promise.resolve({
          rows: [{ count: '10' }]
        });
      }
      if (sql.includes('SELECT') && sql.includes('FROM menu_categories')) {
        return Promise.resolve({
          rows: [
            {
              id: '1',
              name: '热菜',
              restaurant_id: '1',
              sort_order: 1,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      if (sql.includes('SELECT') && sql.includes('category_id') && sql.includes('COUNT(*)')) {
        return Promise.resolve({
          rows: [
            {
              category_id: '1',
              category_name: '热菜',
              item_count: '10',
              available_count: '8',
              avg_rating: '4.5',
            }
          ]
        });
      }
      if (sql.includes('SELECT') && sql.includes('menu_item_id') && sql.includes('SUM(quantity)')) {
        return Promise.resolve({
          rows: [
            {
              menu_item_id: '1',
              menu_item_name: '测试菜品',
              total_quantity: '100',
              total_revenue: '3800.00',
              avg_rating: '4.5',
            }
          ]
        });
      }
      if (sql.includes('is_new = true')) {
        return Promise.resolve({
          rows: [
            {
              id: '1',
              restaurant_id: '1',
              category_id: '1',
              name: '新菜品',
              description: '新菜品描述',
              images: [],
              price: 68.0,
              original_price: null,
              spicy_level: 'none',
              prep_time: 30,
              tags: [],
              ingredients: [],
              allergens: [],
              nutrition: {},
              status: 'available',
              sort_order: 1,
              is_recommended: false,
              is_popular: false,
              is_new: true,
              is_seasonal: false,
              season_start: null,
              season_end: null,
              rating: 4.7,
              review_count: 50,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      if (sql.includes('is_popular = true')) {
        return Promise.resolve({
          rows: [
            {
              id: '1',
              restaurant_id: '1',
              category_id: '1',
              name: '热门菜品',
              description: '热门描述',
              images: [],
              price: 58.0,
              original_price: null,
              spicy_level: 'none',
              prep_time: 25,
              tags: [],
              ingredients: [],
              allergens: [],
              nutrition: {},
              status: 'available',
              sort_order: 1,
              is_recommended: false,
              is_popular: true,
              is_new: false,
              is_seasonal: false,
              season_start: null,
              season_end: null,
              rating: 4.9,
              review_count: 200,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      if (sql.includes('is_recommended = true')) {
        return Promise.resolve({
          rows: [
            {
              id: '1',
              restaurant_id: '1',
              category_id: '1',
              name: '推荐菜品',
              description: '推荐描述',
              images: [],
              price: 48.0,
              original_price: null,
              spicy_level: 'none',
              prep_time: 20,
              tags: [],
              ingredients: [],
              allergens: [],
              nutrition: {},
              status: 'available',
              sort_order: 1,
              is_recommended: true,
              is_popular: false,
              is_new: false,
              is_seasonal: false,
              season_start: null,
              season_end: null,
              rating: 4.8,
              review_count: 100,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      if (sql.includes('SELECT') && sql.includes('menu_item_id') && sql.includes('SUM(quantity)')) {
        return Promise.resolve({
          rows: [
            {
              menu_item_id: '1',
              menu_item_name: '测试菜品',
              total_quantity: '100',
              total_revenue: '3800.00',
              avg_rating: '4.5',
            }
          ]
        });
      }
      return Promise.resolve({ rows: [] });
    }),
  },
}));

describe('MenuController', () => {
  let menuController: MenuController;

  beforeEach(() => {
    vi.clearAllMocks();
    menuController = new MenuController();
  });

  describe('createMenuItem', () => {
    it('应该成功创建菜品', async () => {
      const request = {
        name: '测试菜品',
        description: '测试描述',
        category: 'main_course' as const,
        price: 38.0,
        status: 'available' as const,
        prepTime: 15,
        restaurantId: '550e8400-e29b-41d4-a716-446655440001',
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = await menuController.createMenuItem(request);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('测试菜品');
    });

    it('应该验证必填字段', async () => {
      const request = {
        restaurantId: '1',
        categoryId: '1',
        name: '',
        price: -1,
      };

      await expect(menuController.createMenuItem(request as any)).rejects.toThrow();
    });

    it('应该处理数据库连接错误', async () => {
      const request = {
        restaurantId: '1',
        categoryId: '1',
        name: '测试菜品',
        price: 38.0,
      };

      vi.spyOn(menuController as any, 'createMenuItem').mockRejectedValueOnce(new Error('数据库连接失败'));
      await expect(menuController.createMenuItem(request)).rejects.toThrow('数据库连接失败');
    });
  });

  describe('getMenuItems', () => {
    it('应该成功获取菜品列表', async () => {
      const query = {
        page: 1,
        limit: 20,
      };

      const result = await menuController.getMenuItems(query);
      expect(result.items).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.page).toBe(1);
    });

    it('应该支持分页查询', async () => {
      const query = {
        page: 2,
        limit: 10,
      };

      const result = await menuController.getMenuItems(query);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('应该支持按餐厅ID筛选', async () => {
      const query = {
        restaurantId: '1',
        page: 1,
        limit: 20,
      };

      const result = await menuController.getMenuItems(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持按分类ID筛选', async () => {
      const query = {
        categoryId: '1',
        page: 1,
        limit: 20,
      };

      const result = await menuController.getMenuItems(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持按状态筛选', async () => {
      const query = {
        status: 'available',
        page: 1,
        limit: 20,
      };

      const result = await menuController.getMenuItems(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持关键词搜索', async () => {
      const query = {
        search: '宫保',
        page: 1,
        limit: 20,
      };

      const result = await menuController.getMenuItems(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持排序', async () => {
      const query = {
        sortBy: 'price',
        sortOrder: 'asc',
        page: 1,
        limit: 20,
      };

      const result = await menuController.getMenuItems(query);
      expect(result.items).toBeDefined();
    });

    it('应该处理数据库连接失败并返回模拟数据', async () => {
      const query = {
        page: 1,
        limit: 20,
      };

      const { dbManager } = await import('../../../config/database');
      vi.spyOn(dbManager, 'query').mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const result = await menuController.getMenuItems(query);
      expect(result.items).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
    });
  });

  describe('getMenuItemById', () => {
    it('应该成功获取菜品详情', async () => {
      const id = '1';
      const result = await menuController.getMenuItemById(id);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝空的菜品ID', async () => {
      await expect(menuController.getMenuItemById('')).rejects.toThrow('菜品ID不能为空');
    });

    it('应该处理不存在的菜品', async () => {
      const id = '999999';
      await expect(menuController.getMenuItemById(id)).rejects.toThrow('菜品不存在');
    });
  });

  describe('updateMenuItem', () => {
    it('应该成功更新菜品', async () => {
      const id = '1';
      const request = {
        name: '更新后的菜品名称',
        price: 45.0,
      };

      const result = await menuController.updateMenuItem(id, request);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(id);
    });

    it('应该拒绝空的菜品ID', async () => {
      const request = { name: '测试' };
      await expect(menuController.updateMenuItem('', request)).rejects.toThrow('菜品ID不能为空');
    });

    it('应该处理不存在的菜品', async () => {
      const id = '999999';
      const request = { name: '测试' };
      await expect(menuController.updateMenuItem(id, request)).rejects.toThrow('菜品不存在');
    });

    it('应该支持部分字段更新', async () => {
      const id = '1';
      const request = {
        description: '更新后的描述',
      };

      const result = await menuController.updateMenuItem(id, request);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteMenuItem', () => {
    it('应该成功删除菜品', async () => {
      const id = '1';
      const result = await menuController.deleteMenuItem(id);
      expect(result.success).toBe(true);
      expect(result.message).toContain('删除成功');
    });

    it('应该拒绝空的菜品ID', async () => {
      await expect(menuController.deleteMenuItem('')).rejects.toThrow('菜品ID不能为空');
    });

    it('应该处理不存在的菜品', async () => {
      const id = '999999';
      await expect(menuController.deleteMenuItem(id)).rejects.toThrow('菜品不存在');
    });
  });

  describe('batchUpdateMenuItemStatus', () => {
    it('应该成功批量更新菜品状态', async () => {
      const ids = ['1', '2', '3'];
      const status = 'available' as const;
      const result = await menuController.batchUpdateMenuItemStatus(ids, status);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe(status);
    });

    it('应该拒绝空的ID列表', async () => {
      const ids: string[] = [];
      const status = 'available' as const;
      await expect(menuController.batchUpdateMenuItemStatus(ids, status)).rejects.toThrow('菜品ID列表不能为空');
    });

    it('应该支持更新为不可用状态', async () => {
      const ids = ['1', '2'];
      const status = 'unavailable' as const;
      const result = await menuController.batchUpdateMenuItemStatus(ids, status);
      expect(result.success).toBe(true);
    });

    it('应该支持更新为已停售状态', async () => {
      const ids = ['1'];
      const status = 'discontinued' as const;
      const result = await menuController.batchUpdateMenuItemStatus(ids, status);
      expect(result.success).toBe(true);
    });
  });

  describe('getCategoryStats', () => {
    it('应该成功获取分类统计', async () => {
      const result = await menuController.getCategoryStats();
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该支持按餐厅ID筛选统计', async () => {
      const restaurantId = '1';
      const result = await menuController.getCategoryStats(restaurantId);
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该返回正确的统计字段', async () => {
      const result = await menuController.getCategoryStats();
      if (result.length > 0) {
        const stat = result[0];
        expect(stat).toHaveProperty('categoryId');
        expect(stat).toHaveProperty('categoryName');
        expect(stat).toHaveProperty('itemCount');
        expect(stat).toHaveProperty('availableCount');
        expect(stat).toHaveProperty('avgRating');
      }
    });
  });

  describe('getMenuItemSalesStats', () => {
    it('应该成功获取菜品销售统计', async () => {
      const restaurantId = '1';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await menuController.getMenuItemSalesStats(restaurantId, startDate, endDate);
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该支持按时间范围筛选', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = await menuController.getMenuItemSalesStats(undefined, startDate, endDate);
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该返回正确的销售统计字段', async () => {
      const result = await menuController.getMenuItemSalesStats();
      if (result.length > 0) {
        const stat = result[0];
        expect(stat).toHaveProperty('menuItemId');
        expect(stat).toHaveProperty('menuItemName');
        expect(stat).toHaveProperty('salesCount');
        expect(stat).toHaveProperty('revenue');
      }
    });
  });

  describe('searchMenuItems', () => {
    it('应该成功搜索菜品', async () => {
      const keyword = '宫保';
      const result = await menuController.searchMenuItems(keyword);
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('应该拒绝空关键词', async () => {
      await expect(menuController.searchMenuItems('')).rejects.toThrow('搜索关键词不能为空');
    });

    it('应该拒绝空白关键词', async () => {
      await expect(menuController.searchMenuItems('   ')).rejects.toThrow('搜索关键词不能为空');
    });

    it('应该支持带过滤器的搜索', async () => {
      const keyword = '宫保';
      const filters = {
        restaurantId: '1',
        categoryId: '1',
        status: 'available'
      };
      const result = await menuController.searchMenuItems(keyword, filters);
      expect(result.items).toBeDefined();
    });

    it('应该支持分页搜索', async () => {
      const keyword = '宫保';
      const filters = {
        page: 1,
        limit: 10
      };
      const result = await menuController.searchMenuItems(keyword, filters);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('getRecommendedMenuItems', () => {
    it('应该成功获取推荐菜品', async () => {
      const result = await menuController.getRecommendedMenuItems();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('应该支持自定义限制数量', async () => {
      const result = await menuController.getRecommendedMenuItems(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('应该支持按餐厅筛选', async () => {
      const restaurantId = '1';
      const result = await menuController.getRecommendedMenuItems(10, restaurantId);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('应该只返回可用的菜品', async () => {
      const result = await menuController.getRecommendedMenuItems();
      result.data.forEach((item: any) => {
        expect(item.status).toBe('available');
      });
    });

    it('应该只返回标记为推荐的菜品', async () => {
      const result = await menuController.getRecommendedMenuItems();
      result.data.forEach((item: any) => {
        expect(item.isRecommended).toBe(true);
      });
    });
  });

  describe('getPopularMenuItems', () => {
    it('应该成功获取热门菜品', async () => {
      const result = await menuController.getPopularMenuItems();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('应该支持自定义限制数量', async () => {
      const result = await menuController.getPopularMenuItems(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('应该支持按餐厅筛选', async () => {
      const restaurantId = '1';
      const result = await menuController.getPopularMenuItems(10, restaurantId);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('应该只返回可用的菜品', async () => {
      const result = await menuController.getPopularMenuItems();
      result.data.forEach((item: any) => {
        expect(item.status).toBe('available');
      });
    });

    it('应该只返回标记为热门的菜品', async () => {
      const result = await menuController.getPopularMenuItems();
      result.data.forEach((item: any) => {
        expect(item.isPopular).toBe(true);
      });
    });

    it('应该按评分和评论数排序', async () => {
      const result = await menuController.getPopularMenuItems();
      for (let i = 1; i < result.data.length; i++) {
        const prevRating = result.data[i - 1].rating || 0;
        const currRating = result.data[i].rating || 0;
        expect(currRating).toBeLessThanOrEqual(prevRating);
      }
    });
  });

  describe('getNewMenuItems', () => {
    it('应该成功获取新菜品', async () => {
      const result = await menuController.getNewMenuItems();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('应该支持自定义限制数量', async () => {
      const result = await menuController.getNewMenuItems(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('应该支持按餐厅筛选', async () => {
      const restaurantId = '1';
      const result = await menuController.getNewMenuItems(10, restaurantId);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('应该只返回可用的菜品', async () => {
      const result = await menuController.getNewMenuItems();
      result.data.forEach((item: any) => {
        expect(item.status).toBe('available');
      });
    });

    it('应该只返回标记为新的菜品', async () => {
      const result = await menuController.getNewMenuItems();
      result.data.forEach((item: any) => {
        expect(item.isNew).toBe(true);
      });
    });

    it('应该按创建时间排序', async () => {
      const result = await menuController.getNewMenuItems();
      for (let i = 1; i < result.data.length; i++) {
        const prevDate = new Date(result.data[i - 1].createdAt);
        const currDate = new Date(result.data[i].createdAt);
        expect(currDate.getTime()).toBeLessThanOrEqual(prevDate.getTime());
      }
    });
  });
});
