import { describe, it, expect, beforeEach, vi } from 'vitest';
import { menuRoutes } from '../../../routes/menu-routes';
import { MenuController } from '../../../controllers/menu-controller';

vi.mock('../../../controllers/menu-controller', () => {
  const mockMenuController = {
    createMenuItem: vi.fn(),
    getMenuItems: vi.fn(),
    getMenuItemById: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    batchUpdateMenuItemStatus: vi.fn(),
    searchMenuItems: vi.fn(),
    getRecommendedMenuItems: vi.fn(),
    getPopularMenuItems: vi.fn(),
    getNewMenuItems: vi.fn(),
    getCategoryStats: vi.fn(),
    getMenuItemSalesStats: vi.fn(),
  };
  
  return {
    MenuController: vi.fn().mockImplementation(() => mockMenuController),
    ...mockMenuController,
  };
});

const menuController = new MenuController();

describe('Menu Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/menu/items', () => {
    it('应该成功创建菜单项', async () => {
      const mockCreatedItem = {
        success: true,
        data: {
          id: '1',
          name: '宫保鸡丁',
          price: 38,
          category: '热菜',
          status: 'available'
        },
        message: '菜单项创建成功',
      };
      vi.mocked(menuController.createMenuItem).mockResolvedValue(mockCreatedItem);

      const request = new Request('http://example.com/api/v1/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '宫保鸡丁',
          price: 38,
          category: '热菜'
        })
      });

      const response = await menuRoutes['POST /api/v1/menu/items'](request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('宫保鸡丁');
      expect(menuController.createMenuItem).toHaveBeenCalled();
    });

    it('应该处理创建菜单项时的错误', async () => {
      const mockError = new Error('创建菜单项失败');
      vi.mocked(menuController.createMenuItem).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '宫保鸡丁',
          price: 38
        })
      });

      const response = await menuRoutes['POST /api/v1/menu/items'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/v1/menu/items', () => {
    it('应该成功获取菜单项列表', async () => {
      const mockMenuItems = {
        success: true,
        data: [
          { id: '1', name: '宫保鸡丁', price: 38, category: '热菜' },
          { id: '2', name: '麻婆豆腐', price: 28, category: '热菜' }
        ],
        pagination: { total: 2, page: 1, pageSize: 10 }
      };
      vi.mocked(menuController.getMenuItems).mockResolvedValue(mockMenuItems as any);

      const request = new Request('http://example.com/api/v1/menu/items?page=1&limit=10', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/items'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(menuController.getMenuItems).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 10
      }));
    });

    it('应该处理获取菜单项时的错误', async () => {
      const mockError = new Error('数据库查询失败');
      vi.mocked(menuController.getMenuItems).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/menu/items', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/items'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/v1/menu/items/:id', () => {
    it('应该成功获取单个菜单项', async () => {
      const mockMenuItem = {
        success: true,
        data: {
          id: '1',
          name: '宫保鸡丁',
          price: 38,
          category: '热菜',
          status: 'available'
        }
      };
      vi.mocked(menuController.getMenuItemById).mockResolvedValue(mockMenuItem);

      const request = new Request('http://example.com/api/v1/menu/items/1', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/items/:id'](request, { id: '1' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('宫保鸡丁');
      expect(menuController.getMenuItemById).toHaveBeenCalledWith('1');
    });

    it('应该处理菜单项不存在的情况', async () => {
      const mockError = new Error('菜单项不存在');
      vi.mocked(menuController.getMenuItemById).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/menu/items/999', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/items/:id'](request, { id: '999' });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/v1/menu/items/:id', () => {
    it('应该成功更新菜单项', async () => {
      const mockUpdatedItem = {
        success: true,
        data: {
          id: '1',
          name: '宫保鸡丁（特辣）',
          price: 42,
          category: '热菜',
          status: 'available'
        },
        message: '菜单项更新成功',
      };
      vi.mocked(menuController.updateMenuItem).mockResolvedValue(mockUpdatedItem);

      const request = new Request('http://example.com/api/v1/menu/items/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '宫保鸡丁（特辣）',
          price: 42
        })
      });

      const response = await menuRoutes['PUT /api/v1/menu/items/:id'](request, { id: '1' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('宫保鸡丁（特辣）');
      expect(menuController.updateMenuItem).toHaveBeenCalledWith('1', expect.any(Object));
    });

    it('应该处理更新菜单项时的错误', async () => {
      const mockError = new Error('菜单项不存在');
      vi.mocked(menuController.updateMenuItem).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/menu/items/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '宫保鸡丁' })
      });

      const response = await menuRoutes['PUT /api/v1/menu/items/:id'](request, { id: '999' });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/menu/items/:id', () => {
    it('应该成功删除菜单项', async () => {
      const mockDeletedItem = {
        success: true,
        data: {
          id: '1',
          name: '宫保鸡丁',
          deleted: true
        },
        message: '菜单项删除成功',
      };
      vi.mocked(menuController.deleteMenuItem).mockResolvedValue(mockDeletedItem);

      const request = new Request('http://example.com/api/v1/menu/items/1', {
        method: 'DELETE'
      });

      const response = await menuRoutes['DELETE /api/v1/menu/items/:id'](request, { id: '1' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
      expect(menuController.deleteMenuItem).toHaveBeenCalledWith('1');
    });

    it('应该处理删除菜单项时的错误', async () => {
      const mockError = new Error('菜单项不存在');
      vi.mocked(menuController.deleteMenuItem).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/menu/items/999', {
        method: 'DELETE'
      });

      const response = await menuRoutes['DELETE /api/v1/menu/items/:id'](request, { id: '999' });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/menu/items/batch/status', () => {
    it('应该成功批量更新菜单项状态', async () => {
      const mockBatchResult = {
        success: true,
        data: {
          updatedCount: 3,
          status: 'unavailable'
        },
        message: '成功更新3个菜品状态',
      };
      vi.mocked(menuController.batchUpdateMenuItemStatus).mockResolvedValue(mockBatchResult);

      const request = new Request('http://example.com/api/v1/menu/items/batch/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['1', '2', '3'],
          status: 'unavailable'
        })
      });

      const response = await menuRoutes['PATCH /api/v1/menu/items/batch/status'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.updatedCount).toBe(3);
      expect(menuController.batchUpdateMenuItemStatus).toHaveBeenCalledWith(['1', '2', '3'], 'unavailable');
    });

    it('应该处理批量更新时的错误', async () => {
      const request = new Request('http://example.com/api/v1/menu/items/batch/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [],
          status: 'unavailable'
        })
      });

      const response = await menuRoutes['PATCH /api/v1/menu/items/batch/status'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('菜品ID列表不能为空');
    });
  });

  describe('GET /api/v1/menu/search', () => {
    it('应该成功搜索菜单项', async () => {
      const mockSearchResults = {
        items: [
          { id: '1', name: '宫保鸡丁', price: 38, category: '热菜' }
        ],
        total: 1,
        page: 1,
        limit: 10
      };
      vi.mocked(menuController.searchMenuItems).mockResolvedValue(mockSearchResults as any);

      const request = new Request('http://example.com/api/v1/menu/search?keyword=宫保', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/search'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(menuController.searchMenuItems).toHaveBeenCalledWith('宫保', expect.any(Object));
    });

    it('应该处理搜索关键词为空的情况', async () => {
      const request = new Request('http://example.com/api/v1/menu/search?keyword=', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/search'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('搜索关键词不能为空');
    });
  });

  describe('GET /api/v1/menu/recommended', () => {
    it('应该成功获取推荐菜品', async () => {
      const mockRecommendedItems = {
        items: [
          { id: '1', name: '宫保鸡丁', price: 38, isRecommended: true }
        ],
        total: 1
      };
      vi.mocked(menuController.getRecommendedMenuItems).mockResolvedValue(mockRecommendedItems as any);

      const request = new Request('http://example.com/api/v1/menu/recommended?limit=10', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/recommended'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(menuController.getRecommendedMenuItems).toHaveBeenCalledWith(10);
    });
  });

  describe('GET /api/v1/menu/popular', () => {
    it('应该成功获取热门菜品', async () => {
      const mockPopularItems = {
        items: [
          { id: '1', name: '宫保鸡丁', price: 38, isPopular: true }
        ],
        total: 1
      };
      vi.mocked(menuController.getPopularMenuItems).mockResolvedValue(mockPopularItems as any);

      const request = new Request('http://example.com/api/v1/menu/popular?limit=10', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/popular'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(menuController.getPopularMenuItems).toHaveBeenCalledWith(10);
    });
  });

  describe('GET /api/v1/menu/new', () => {
    it('应该成功获取新菜品', async () => {
      const mockNewItems = {
        items: [
          { id: '1', name: '宫保鸡丁', price: 38, isNew: true }
        ],
        total: 1
      };
      vi.mocked(menuController.getNewMenuItems).mockResolvedValue(mockNewItems as any);

      const request = new Request('http://example.com/api/v1/menu/new?limit=10', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/new'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(menuController.getNewMenuItems).toHaveBeenCalledWith(10);
    });
  });

  describe('GET /api/v1/menu/stats/categories', () => {
    it('应该成功获取分类统计', async () => {
      const mockCategoryStats = [
        { id: '1', name: '热菜', itemCount: 15 },
        { id: '2', name: '凉菜', itemCount: 8 }
      ];
      vi.mocked(menuController.getCategoryStats).mockResolvedValue(mockCategoryStats as any);

      const request = new Request('http://example.com/api/v1/menu/stats/categories?restaurantId=rest1', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/stats/categories'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(menuController.getCategoryStats).toHaveBeenCalledWith('rest1');
    });
  });

  describe('GET /api/v1/menu/stats/sales', () => {
    it('应该成功获取销售统计', async () => {
      const mockSalesStats = {
        itemId: '1',
        itemName: '宫保鸡丁',
        totalSales: 100,
        totalRevenue: 3800,
        averageDailySales: 10
      };
      vi.mocked(menuController.getMenuItemSalesStats).mockResolvedValue(mockSalesStats as any);

      const request = new Request('http://example.com/api/v1/menu/stats/sales?itemId=1&startDate=2024-01-01&endDate=2024-01-31', {
        method: 'GET'
      });

      const response = await menuRoutes['GET /api/v1/menu/stats/sales'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalSales).toBe(100);
      expect(menuController.getMenuItemSalesStats).toHaveBeenCalledWith('1', expect.any(Date), expect.any(Date));
    });
  });
});
