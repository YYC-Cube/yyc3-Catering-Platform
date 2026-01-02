/**
 * @fileoverview YYC³订单管理路由
 * @description 订单相关API路由定义
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { OrderController } from '../controllers/order-controller';

// 创建订单控制器实例
const orderController = new OrderController();

/**
 * 订单API路由处理函数
 */
export const orderRoutes = {
  /**
   * 订单管理路由
   */
  'POST /api/v1/orders': async (request: Request) => {
    try {
      const body = await request.json();
      const result = await orderController.createOrder(body);

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'CREATE_ORDER_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/orders': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams);

      // 转换查询参数
      const filters = {
        page: parseInt(query.page) || undefined,
        limit: parseInt(query.limit) || undefined,
        customerId: query.customerId || undefined,
        restaurantId: query.restaurantId || undefined,
        status: query.status || undefined,
        paymentStatus: query.paymentStatus || undefined,
        orderType: query.orderType || undefined,
        paymentMethod: query.paymentMethod || undefined,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        minTotal: query.minTotal ? parseFloat(query.minTotal) : undefined,
        maxTotal: query.maxTotal ? parseFloat(query.maxTotal) : undefined,
        search: query.search || undefined,
        sortBy: query.sortBy || undefined,
        sortOrder: query.sortOrder || undefined,
      };

      const result = await orderController.getOrders(filters);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_ORDERS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/orders/:id': async (request: Request, params: { id: string }) => {
    try {
      const result = await orderController.getOrderById(params.id);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_ORDER_ERROR',
      }), {
        status: (error instanceof Error ? error.message : "未知错误").includes('不存在') ? 404 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/orders/number/:orderNumber': async (request: Request, params: { orderNumber: string }) => {
    try {
      const result = await orderController.getOrderByNumber(params.orderNumber);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'GET_ORDER_BY_NUMBER_ERROR',
      }), {
        status: (error instanceof Error ? error.message : "未知错误").includes('不存在') ? 404 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'PUT /api/v1/orders/:id': async (request: Request, params: { id: string }) => {
    try {
      const body = await request.json();
      const result = await orderController.updateOrder(params.id, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'UPDATE_ORDER_ERROR',
      }), {
        status: (error instanceof Error ? error.message : "未知错误").includes('不存在') ? 404 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'DELETE /api/v1/orders/:id': async (request: Request, params: { id: string }) => {
    try {
      // 删除订单实际上是取消订单
      const body = await request.json().catch(() => ({}));
      const reason = body.reason || '客户请求删除';
      const refundAmount = body.refundAmount;

      const result = await orderController.cancelOrder(params.id, reason, refundAmount);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'DELETE_ORDER_ERROR',
      }), {
        status: (error instanceof Error ? error.message : "未知错误").includes('不存在') ? 404 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 订单状态管理路由
   */
  'PATCH /api/v1/orders/:id/status': async (request: Request, params: { id: string }) => {
    try {
      const body = await request.json();
      const { status, notes } = body;

      if (!status) {
        throw new Error('订单状态不能为空');
      }

      const result = await orderController.updateOrderStatus(params.id, status, notes);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'UPDATE_ORDER_STATUS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'POST /api/v1/orders/:id/cancel': async (request: Request, params: { id: string }) => {
    try {
      const body = await request.json();
      const { reason, refundAmount } = body;

      if (!reason) {
        throw new Error('取消原因不能为空');
      }

      const result = await orderController.cancelOrder(params.id, reason, refundAmount);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'CANCEL_ORDER_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 支付管理路由
   */
  'POST /api/v1/orders/:id/payment': async (request: Request, params: { id: string }) => {
    try {
      const body = await request.json();
      const { paymentMethod, paymentDetails } = body;

      if (!paymentMethod) {
        throw new Error('支付方式不能为空');
      }

      const result = await orderController.processPayment(params.id, paymentMethod, paymentDetails);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'PROCESS_PAYMENT_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 配送管理路由
   */
  'POST /api/v1/orders/:id/assign-delivery': async (request: Request, params: { id: string }) => {
    try {
      const body = await request.json();
      const { personnelId } = body;

      if (!personnelId) {
        throw new Error('配送员ID不能为空');
      }

      const result = await orderController.assignDeliveryPersonnel(params.id, personnelId);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'ASSIGN_DELIVERY_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/orders/delivery/personnel/available': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');

      if (!restaurantId) {
        throw new Error('餐厅ID不能为空');
      }

      const result = await orderController.getAvailableDeliveryPersonnel(restaurantId);

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
        code: 'GET_DELIVERY_PERSONNEL_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 搜索路由
   */
  'GET /api/v1/orders/search': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const keyword = url.searchParams.get('keyword');

      if (!keyword || keyword.trim().length === 0) {
        throw new Error('搜索关键词不能为空');
      }

      const filters = {
        customerId: url.searchParams.get('customerId') || undefined,
        restaurantId: url.searchParams.get('restaurantId') || undefined,
        status: url.searchParams.get('status') || undefined,
        paymentStatus: url.searchParams.get('paymentStatus') || undefined,
        orderType: url.searchParams.get('orderType') || undefined,
        startDate: url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')) : undefined,
        endDate: url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')) : undefined,
        page: parseInt(url.searchParams.get('page')) || undefined,
        limit: parseInt(url.searchParams.get('limit')) || undefined,
      };

      const result = await orderController.searchOrders(keyword, filters);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: (error instanceof Error ? error.message : "未知错误"),
        code: 'SEARCH_ORDERS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 统计和报告路由
   */
  'GET /api/v1/orders/stats': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId') || undefined;
      const startDate = url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')) : undefined;
      const endDate = url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')) : undefined;

      const result = await orderController.getOrderStats(restaurantId, startDate, endDate);

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
        code: 'GET_ORDER_STATS_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  'GET /api/v1/orders/reports/sales': async (request: Request) => {
    try {
      const url = new URL(request.url);
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const restaurantId = url.searchParams.get('restaurantId') || undefined;

      if (!startDate || !endDate) {
        throw new Error('开始日期和结束日期不能为空');
      }

      const result = await orderController.generateSalesReport(
        new Date(startDate),
        new Date(endDate),
        restaurantId
      );

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
        code: 'GENERATE_SALES_REPORT_ERROR',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * 批量操作路由
   */
  'PATCH /api/v1/orders/batch/status': async (request: Request) => {
    try {
      const body = await request.json();
      const { orderIds, status, notes } = body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        throw new Error('订单ID列表不能为空');
      }

      if (!status) {
        throw new Error('订单状态不能为空');
      }

      // TODO: 批量更新订单状态
      console.log('📝 批量更新订单状态:', { orderIds, status, notes });

      const results = [];
      for (const orderId of orderIds) {
        try {
          const result = await orderController.updateOrderStatus(orderId, status, notes);
          results.push({ orderId, success: true, ...result });
        } catch (error) {
          results.push({ orderId, success: false, error: (error instanceof Error ? error.message : "未知错误") });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return new Response(JSON.stringify({
        success: true,
        data: {
          results,
          total: orderIds.length,
          successCount,
          failCount,
        },
        message: `批量更新完成，成功${successCount}个，失败${failCount}个`,
      }), {
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
};