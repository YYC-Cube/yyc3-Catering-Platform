/**
 * @fileoverview YYC³菜单管理路由
 * @description 菜单相关API路由定义
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { MenuController } from '../controllers/menu-controller';

// 创建菜单控制器实例
const menuController = new MenuController();

/**
 * 菜单API路由处理函数
 */
export const menuRoutes = {
  /**
   * 菜品管理路由
   */
  'POST /api/v1/menu/items': async (request: Request) => {
    try {
      const body = await request.json();
      const result = await menuController.createMenuItem(body);

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? (error instanceof Error ? error.message : "未知错误") : '未知错误',
        code: 'CREATE_MENU_ITEM_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/menu/items': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams);

      // 转换查询参数
      const filters = {
        page: parseInt(query.page) || undefined,
        limit: parseInt(query.limit) || undefined,
        category: query.category || undefined,
        status: query.status || undefined,
        spicyLevel: query.spicyLevel || undefined,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        tags: query.tags ? query.tags.split(',') : undefined,
        ingredients: query.ingredients ? query.ingredients.split(',') : undefined,
        isRecommended: query.isRecommended === 'true',
        isPopular: query.isPopular === 'true',
        isNew: query.isNew === 'true',
        search: query.search || undefined,
        sortBy: query.sortBy || undefined,
        sortOrder: query.sortOrder || undefined,
        restaurantId: query.restaurantId || undefined,
      };

      const result = await menuController.getMenuItems(filters);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_MENU_ITEMS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/menu/items/:id': async (request: Request, params: { id: string }) => {
    try {
      const result = await menuController.getMenuItemById(params.id);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_MENU_ITEM_ERROR',
      }), {
        status: (error instanceof Error ? error.message : "未知错误").includes('不存在') ? 404 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'PUT /api/v1/menu/items/:id': async (request: Request, params: { id: string }) => {
    try {
      const body = await request.json();
      const result = await menuController.updateMenuItem(params.id, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'UPDATE_MENU_ITEM_ERROR',
      }), {
        status: (error instanceof Error ? error.message : "未知错误").includes('不存在') ? 404 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'DELETE /api/v1/menu/items/:id': async (request: Request, params: { id: string }) => {
    try {
      const result = await menuController.deleteMenuItem(params.id);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'DELETE_MENU_ITEM_ERROR',
      }), {
        status: (error instanceof Error ? error.message : "未知错误").includes('不存在') ? 404 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 批量操作路由
   */
  'PATCH /api/v1/menu/items/batch/status': async (request: Request) => {
    try {
      const body = await request.json();
      const { ids, status } = body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('菜品ID列表不能为空');
      }

      const result = await menuController.batchUpdateMenuItemStatus(ids, status);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'BATCH_UPDATE_STATUS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 搜索路由
   */
  'GET /api/v1/menu/search': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const keyword = url.searchParams.get('keyword');

      if (!keyword || keyword.trim().length === 0) {
        throw new Error('搜索关键词不能为空');
      }

      const filters = {
        category: url.searchParams.get('category') || undefined,
        minPrice: url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')) : undefined,
        maxPrice: url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')) : undefined,
        page: parseInt(url.searchParams.get('page')) || undefined,
        limit: parseInt(url.searchParams.get('limit')) || undefined,
      };

      const result = await menuController.searchMenuItems(keyword, filters);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'SEARCH_MENU_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 推荐和热门菜品路由
   */
  'GET /api/v1/menu/recommended': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit')) || 10;

      const result = await menuController.getRecommendedMenuItems(limit);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_RECOMMENDED_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/menu/popular': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit')) || 10;

      const result = await menuController.getPopularMenuItems(limit);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_POPULAR_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/menu/new': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit')) || 10;

      const result = await menuController.getNewMenuItems(limit);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_NEW_ITEMS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 统计路由
   */
  'GET /api/v1/menu/stats/categories': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId') || undefined;

      const result = await menuController.getCategoryStats(restaurantId);

      return new Response(JSON.stringify({
        success: true,
        data: result,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_CATEGORY_STATS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/menu/stats/sales': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const itemId = url.searchParams.get('itemId') || undefined;
      const startDate = url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')) : undefined;
      const endDate = url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')) : undefined;

      const result = await menuController.getMenuItemSalesStats(itemId, startDate, endDate);

      return new Response(JSON.stringify({
        success: true,
        data: result,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_SALES_STATS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};