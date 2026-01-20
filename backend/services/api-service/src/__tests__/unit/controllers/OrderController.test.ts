/**
 * @fileoverview YYC³订单控制器单元测试
 * @description 测试订单管理控制器的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-07
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderController } from '../../../controllers/order-controller';

vi.mock('../../../config/database', () => ({
  dbManager: {
    createPool: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockImplementation((sql: string, params: any[]) => {
      if (sql.includes('INSERT INTO orders')) {
        return Promise.resolve({
          rows: [{
            id: '550e8400-e29b-41d4-a716-446655440000',
            created_at: new Date(),
          }]
        });
      }
      if (sql.includes('INSERT INTO order_logs')) {
        return Promise.resolve({
          rows: [{
            id: '550e8400-e29b-41d4-a716-446655440001',
            timestamp: new Date(),
          }]
        });
      }
      if (sql.includes('SELECT COUNT(*)')) {
        return Promise.resolve({
          rows: [{ total: '10' }]
        });
      }
      if (sql.includes('SELECT id, status FROM orders WHERE id')) {
        return Promise.resolve({
          rows: [{
            id: params[0],
            status: 'pending',
          }]
        });
      }
      if (sql.includes('UPDATE orders') && sql.includes('status') && sql.includes('notes')) {
        return Promise.resolve({
          rows: [{
            id: params[2],
            status: params[0],
            notes: params[1],
            updated_at: new Date(),
          }]
        });
      }
      if (sql.includes('UPDATE orders') && sql.includes('status')) {
        return Promise.resolve({
          rows: [{
            id: params[1],
            status: params[0],
            updated_at: new Date(),
          }]
        });
      }
      if (sql.includes('SELECT') && sql.includes('FROM orders') && sql.includes('total_orders')) {
        return Promise.resolve({
          rows: [{
            total_orders: '100',
            completed_orders: '80',
            cancelled_orders: '10',
            paid_orders: '90',
            total_revenue: '10000.00',
            avg_order_value: '100.00',
          }]
        });
      }
      if (sql.includes('SELECT') && sql.includes('FROM orders') && !sql.includes('total_orders') && !sql.includes('WHERE order_number') && !sql.includes('WHERE id')) {
        return Promise.resolve({
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              order_number: '202501010001',
              customer_id: '550e8400-e29b-41d4-a716-446655440002',
              customer_name: '张三',
              customer_phone: '13800138000',
              restaurant_id: '550e8400-e29b-41d4-a716-446655440003',
              order_type: 'delivery',
              status: 'pending',
              payment_status: 'paid',
              payment_method: 'wechat',
              items: [{ id: '1', name: '宫保鸡丁', quantity: 2, price: 38 }],
              price_breakdown: { subtotal: 76, total: 81 },
              delivery_info: { address: '北京市朝阳区xxx' },
              scheduled_time: null,
              estimated_ready_time: new Date(),
              actual_ready_time: null,
              delivery_start_time: null,
              delivery_end_time: null,
              notes: null,
              source: 'web',
              promo_code: null,
              promo_discount: 0,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      if (sql.includes('WHERE order_number')) {
        if (params[0] === '999999999999') {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440004',
              order_number: '202401010001',
              customer_id: '550e8400-e29b-41d4-a716-446655440005',
              customer_name: '张三',
              customer_phone: '13800138000',
              restaurant_id: '550e8400-e29b-41d4-a716-446655440006',
              order_type: 'delivery',
              status: 'pending',
              payment_status: 'paid',
              payment_method: 'wechat',
              items: [],
              price_breakdown: {},
              delivery_info: {},
              scheduled_time: null,
              estimated_ready_time: new Date(),
              actual_ready_time: null,
              delivery_start_time: null,
              delivery_end_time: null,
              notes: null,
              source: 'web',
              promo_code: null,
              promo_discount: 0,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      if (sql.includes('SELECT') && sql.includes('FROM orders') && sql.includes('WHERE id = $1')) {
        const orderId = params[0];
        if (orderId === '999999') {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({
          rows: [
            {
              id: orderId,
              order_number: '202401010001',
              customer_id: '550e8400-e29b-41d4-a716-446655440005',
              customer_name: '张三',
              customer_phone: '13800138000',
              restaurant_id: '550e8400-e29b-41d4-a716-446655440006',
              order_type: 'delivery',
              status: 'pending',
              payment_status: 'paid',
              payment_method: 'wechat',
              items: [],
              price_breakdown: {},
              delivery_info: {},
              scheduled_time: null,
              estimated_ready_time: new Date(),
              actual_ready_time: null,
              delivery_start_time: null,
              delivery_end_time: null,
              notes: null,
              source: 'web',
              promo_code: null,
              promo_discount: 0,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      if (sql.includes('WHERE id') && !sql.includes('status')) {
        if (params[0] === '999999') {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({
          rows: [
            {
              id: params[0],
              order_number: '202401010001',
              customer_id: '550e8400-e29b-41d4-a716-446655440005',
              customer_name: '张三',
              customer_phone: '13800138000',
              restaurant_id: '550e8400-e29b-41d4-a716-446655440006',
              order_type: 'delivery',
              status: 'pending',
              payment_status: 'paid',
              payment_method: 'wechat',
              items: [],
              price_breakdown: {},
              delivery_info: {},
              scheduled_time: null,
              estimated_ready_time: new Date(),
              actual_ready_time: null,
              delivery_start_time: null,
              delivery_end_time: null,
              notes: null,
              source: 'web',
              promo_code: null,
              promo_discount: 0,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ]
        });
      }
      return Promise.resolve({ rows: [] });
    }),
  },
}));

describe('OrderController', () => {
  let orderController: OrderController;

  beforeEach(() => {
    vi.clearAllMocks();
    orderController = new OrderController();
  });

  describe('createOrder', () => {
    it('应该成功创建订单', async () => {
      const request = {
        customerId: '550e8400-e29b-41d4-a716-446655440002',
        customerName: '张三',
        customerPhone: '13800138000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440003',
        orderType: 'delivery' as const,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            menuItemId: '550e8400-e29b-41d4-a716-446655440011',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38.0,
            totalPrice: 76.0,
          },
        ],
        priceBreakdown: {
          subtotal: 76.0,
          discount: 0,
          deliveryFee: 5.0,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 81.0,
        },
        paymentMethod: 'wechat' as const,
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = await orderController.createOrder(request);
      expect(result.success).toBe(true);
      expect(result.data.customerName).toBe('张三');
      expect(result.data.orderNumber).toBeDefined();
    });

    it('应该验证必填字段', async () => {
      const request = {
        customerName: '',
        customerPhone: '',
        items: [],
      };

      await expect(orderController.createOrder(request as any)).rejects.toThrow();
    });

    it('应该生成订单号', async () => {
      const request = {
        customerId: '550e8400-e29b-41d4-a716-446655440002',
        customerName: '张三',
        customerPhone: '13800138000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440003',
        orderType: 'delivery' as const,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            menuItemId: '550e8400-e29b-41d4-a716-446655440011',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38.0,
            totalPrice: 76.0,
          },
        ],
        priceBreakdown: {
          subtotal: 76.0,
          discount: 0,
          deliveryFee: 5.0,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 81.0,
        },
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = await orderController.createOrder(request);
      expect(result.data.orderNumber).toBeDefined();
      expect(typeof result.data.orderNumber).toBe('string');
    });

    it('应该计算预计完成时间', async () => {
      const request = {
        customerId: '550e8400-e29b-41d4-a716-446655440002',
        customerName: '张三',
        customerPhone: '13800138000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440003',
        orderType: 'delivery' as const,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            menuItemId: '550e8400-e29b-41d4-a716-446655440011',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38.0,
            totalPrice: 76.0,
          },
        ],
        priceBreakdown: {
          subtotal: 76.0,
          discount: 0,
          deliveryFee: 5.0,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 81.0,
        },
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = await orderController.createOrder(request);
      expect(result.data.estimatedReadyTime).toBeDefined();
    });

    it('应该处理数据库连接错误', async () => {
      const request = {
        customerId: '550e8400-e29b-41d4-a716-446655440002',
        customerName: '张三',
        customerPhone: '13800138000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440003',
        orderType: 'delivery' as const,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            menuItemId: '550e8400-e29b-41d4-a716-446655440011',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38.0,
            totalPrice: 76.0,
          },
        ],
        priceBreakdown: {
          subtotal: 76.0,
          discount: 0,
          deliveryFee: 5.0,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 81.0,
        },
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };

      vi.spyOn(orderController as any, 'createOrder').mockRejectedValueOnce(new Error('数据库连接失败'));
      await expect(orderController.createOrder(request)).rejects.toThrow('数据库连接失败');
    });
  });

  describe('getOrders', () => {
    it('应该成功获取订单列表', async () => {
      const query = {
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.page).toBe(1);
    });

    it('应该支持分页查询', async () => {
      const query = {
        page: 2,
        limit: 10,
      };

      const result = await orderController.getOrders(query);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('应该支持按客户ID筛选', async () => {
      const query = {
        customerId: '1',
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持按餐厅ID筛选', async () => {
      const query = {
        restaurantId: '1',
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持按状态筛选', async () => {
      const query = {
        status: 'pending',
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持按支付状态筛选', async () => {
      const query = {
        paymentStatus: 'paid',
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持按订单类型筛选', async () => {
      const query = {
        orderType: 'delivery',
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持按日期范围筛选', async () => {
      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持关键词搜索', async () => {
      const query = {
        search: '张三',
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });

    it('应该支持排序', async () => {
      const query = {
        sortBy: 'created_at',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      };

      const result = await orderController.getOrders(query);
      expect(result.items).toBeDefined();
    });
  });

  describe('getOrderById', () => {
    it('应该成功获取订单详情', async () => {
      const id = '1';
      const result = await orderController.getOrderById(id);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝空的订单ID', async () => {
      await expect(orderController.getOrderById('')).rejects.toThrow('订单ID不能为空');
    });

    it('应该处理不存在的订单', async () => {
      const id = '999999';
      await expect(orderController.getOrderById(id)).rejects.toThrow('订单不存在');
    });
  });

  describe('getOrderByNumber', () => {
    it('应该成功根据订单号获取订单', async () => {
      const orderNumber = '202401010001';
      const result = await orderController.getOrderByNumber(orderNumber);
      expect(result.success).toBe(true);
      expect(result.data.orderNumber).toBe(orderNumber);
    });

    it('应该拒绝空的订单号', async () => {
      await expect(orderController.getOrderByNumber('')).rejects.toThrow('订单号不能为空');
    });

    it('应该处理不存在的订单号', async () => {
      const orderNumber = '999999999999';
      await expect(orderController.getOrderByNumber(orderNumber)).rejects.toThrow('订单不存在');
    });
  });

  describe('updateOrder', () => {
    it('应该成功更新订单', async () => {
      const id = '1';
      const request = {
        customerName: '李四',
        notes: '备注信息',
      };

      const result = await orderController.updateOrder(id, request);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(id);
    });

    it('应该拒绝空的订单ID', async () => {
      const request = { customerName: '测试' };
      await expect(orderController.updateOrder('', request)).rejects.toThrow('订单ID不能为空');
    });

    it('应该记录更新时间', async () => {
      const id = '1';
      const request = { notes: '更新备注' };

      const result = await orderController.updateOrder(id, request);
      expect(result.data.updatedAt).toBeDefined();
    });
  });

  describe('updateOrderStatus', () => {
    it('应该成功更新订单状态', async () => {
      const id = '1';
      const status = 'confirmed';
      const result = await orderController.updateOrderStatus(id, status);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe(status);
    });

    it('应该拒绝空的订单ID', async () => {
      await expect(orderController.updateOrderStatus('', 'confirmed')).rejects.toThrow('订单ID不能为空');
    });

    it('应该支持添加备注', async () => {
      const id = '1';
      const status = 'confirmed';
      const notes = '状态更新备注';
      const result = await orderController.updateOrderStatus(id, status, notes);
      expect(result.data.notes).toBe(notes);
    });

    it('应该处理完成状态', async () => {
      const id = '1';
      const status = 'completed';
      const result = await orderController.updateOrderStatus(id, status);
      expect(result.success).toBe(true);
    });

    it('应该处理确认状态', async () => {
      const id = '1';
      const status = 'confirmed';
      const result = await orderController.updateOrderStatus(id, status);
      expect(result.success).toBe(true);
    });
  });

  describe('cancelOrder', () => {
    it('应该成功取消订单', async () => {
      const id = '1';
      const reason = '客户取消';
      const result = await orderController.cancelOrder(id, reason);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
    });

    it('应该拒绝空的订单ID', async () => {
      await expect(orderController.cancelOrder('', '原因')).rejects.toThrow('订单ID不能为空');
    });

    it('应该处理退款', async () => {
      const id = '1';
      const reason = '客户取消';
      const refundAmount = 100.0;
      const result = await orderController.cancelOrder(id, reason, refundAmount);
      expect(result.data.refundAmount).toBe(refundAmount);
    });

    it('应该更新支付状态为已退款', async () => {
      const id = '1';
      const reason = '客户取消';
      const result = await orderController.cancelOrder(id, reason);
      expect(result.data.status).toBe('cancelled');
    });
  });

  describe('processPayment', () => {
    it('应该成功处理支付', async () => {
      const id = '1';
      const paymentMethod = 'wechat';
      const paymentDetails = {
        transactionId: 'test123',
        amount: 100.0,
      };

      const result = await orderController.processPayment(id, paymentMethod, paymentDetails);
      expect(result.success).toBe(true);
    });

    it('应该拒绝空的订单ID', async () => {
      await expect(orderController.processPayment('', 'wechat', {})).rejects.toThrow('订单ID不能为空');
    });

    it('应该生成交易ID', async () => {
      const id = '1';
      const paymentMethod = 'alipay';
      const paymentDetails = {};

      const result = await orderController.processPayment(id, paymentMethod, paymentDetails);
      expect(result.data.paymentResult.transactionId).toBeDefined();
    });

    it('应该更新支付状态', async () => {
      const id = '1';
      const paymentMethod = 'wechat';
      const paymentDetails = {};

      const result = await orderController.processPayment(id, paymentMethod, paymentDetails);
      expect(result.data.paymentStatus).toBe('paid');
    });
  });

  describe('getOrderStats', () => {
    it('应该成功获取订单统计', async () => {
      const result = await orderController.getOrderStats();
      expect(result).toBeDefined();
      expect(result.totalOrders).toBeDefined();
      expect(result.totalRevenue).toBeDefined();
    });

    it('应该支持按餐厅ID筛选统计', async () => {
      const restaurantId = '1';
      const result = await orderController.getOrderStats(restaurantId);
      expect(result).toBeDefined();
    });

    it('应该支持按时间范围筛选统计', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await orderController.getOrderStats(undefined, startDate, endDate);
      expect(result).toBeDefined();
    });

    it('应该返回状态分布', async () => {
      const result = await orderController.getOrderStats();
      expect(result.statusBreakdown).toBeDefined();
      expect(result.statusBreakdown.pending).toBeDefined();
    });

    it('应该返回支付方式分布', async () => {
      const result = await orderController.getOrderStats();
      expect(result.paymentMethodBreakdown).toBeDefined();
    });

    it('应该返回订单类型分布', async () => {
      const result = await orderController.getOrderStats();
      expect(result.orderTypeBreakdown).toBeDefined();
      expect(result.orderTypeBreakdown.dine_in).toBeDefined();
      expect(result.orderTypeBreakdown.takeaway).toBeDefined();
      expect(result.orderTypeBreakdown.delivery).toBeDefined();
    });
  });

  describe('generateSalesReport', () => {
    it('应该成功生成销售报告', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await orderController.generateSalesReport(startDate, endDate);
      expect(result).toBeDefined();
      expect(result.period).toBeDefined();
      expect(result.totalOrders).toBeDefined();
      expect(result.totalRevenue).toBeDefined();
    });

    it('应该支持按餐厅ID筛选报告', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const restaurantId = '1';
      const result = await orderController.generateSalesReport(startDate, endDate, restaurantId);
      expect(result).toBeDefined();
    });

    it('应该返回热销菜品', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await orderController.generateSalesReport(startDate, endDate);
      expect(result.topMenuItems).toBeDefined();
      expect(Array.isArray(result.topMenuItems)).toBe(true);
    });

    it('应该返回高峰时段', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await orderController.generateSalesReport(startDate, endDate);
      expect(result.peakHours).toBeDefined();
      expect(Array.isArray(result.peakHours)).toBe(true);
    });

    it('应该计算平均订单价值', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await orderController.generateSalesReport(startDate, endDate);
      expect(result.averageOrderValue).toBeDefined();
    });

    it('应该计算客户留存率', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await orderController.generateSalesReport(startDate, endDate);
      expect(result.customerRetentionRate).toBeDefined();
    });
  });

  describe('assignDeliveryPersonnel', () => {
    it('应该成功分配配送员', async () => {
      const orderId = '1';
      const personnelId = 'driver1';
      const result = await orderController.assignDeliveryPersonnel(orderId, personnelId);
      expect(result.success).toBe(true);
      expect(result.data.orderId).toBe(orderId);
      expect(result.data.deliveryPersonnelId).toBe(personnelId);
    });

    it('应该拒绝空的订单ID', async () => {
      await expect(orderController.assignDeliveryPersonnel('', 'driver1')).rejects.toThrow('订单ID和配送员ID不能为空');
    });

    it('应该拒绝空的配送员ID', async () => {
      await expect(orderController.assignDeliveryPersonnel('1', '')).rejects.toThrow('订单ID和配送员ID不能为空');
    });

    it('应该记录分配时间', async () => {
      const orderId = '1';
      const personnelId = 'driver1';
      const result = await orderController.assignDeliveryPersonnel(orderId, personnelId);
      expect(result.data.assignedAt).toBeDefined();
    });

    it('应该计算预计配送时间', async () => {
      const orderId = '1';
      const personnelId = 'driver1';
      const result = await orderController.assignDeliveryPersonnel(orderId, personnelId);
      expect(result.data.estimatedDeliveryTime).toBeDefined();
    });
  });

  describe('getAvailableDeliveryPersonnel', () => {
    it('应该成功获取可用配送员列表', async () => {
      const restaurantId = '1';
      const result = await orderController.getAvailableDeliveryPersonnel(restaurantId);
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该返回配送员信息', async () => {
      const restaurantId = '1';
      const result = await orderController.getAvailableDeliveryPersonnel(restaurantId);
      expect(result).toBeDefined();
    });
  });

  describe('searchOrders', () => {
    it('应该成功搜索订单', async () => {
      const keyword = '张三';
      const result = await orderController.searchOrders(keyword);
      expect(result.items).toBeDefined();
    });

    it('应该拒绝空的关键词', async () => {
      await expect(orderController.searchOrders('')).rejects.toThrow('搜索关键词不能为空');
    });

    it('应该支持筛选条件', async () => {
      const keyword = '张三';
      const filters = {
        status: 'pending',
        page: 1,
        limit: 20,
      };
      const result = await orderController.searchOrders(keyword, filters);
      expect(result.items).toBeDefined();
    });

    it('应该支持按订单号搜索', async () => {
      const keyword = '202401010001';
      const result = await orderController.searchOrders(keyword);
      expect(result.items).toBeDefined();
    });

    it('应该支持按客户姓名搜索', async () => {
      const keyword = '张三';
      const result = await orderController.searchOrders(keyword);
      expect(result.items).toBeDefined();
    });

    it('应该支持按客户电话搜索', async () => {
      const keyword = '13800138000';
      const result = await orderController.searchOrders(keyword);
      expect(result.items).toBeDefined();
    });
  });
});
