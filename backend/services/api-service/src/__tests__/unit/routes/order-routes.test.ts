import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orderRoutes } from '../../../routes/order-routes';
import { OrderController } from '../../../controllers/order-controller';

vi.mock('../../../controllers/order-controller', () => {
  const mockOrderController = {
    createOrder: vi.fn(),
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    getOrderByNumber: vi.fn(),
    updateOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    cancelOrder: vi.fn(),
    processPayment: vi.fn(),
    getOrderStats: vi.fn(),
    generateSalesReport: vi.fn(),
    assignDeliveryPersonnel: vi.fn(),
    getAvailableDeliveryPersonnel: vi.fn(),
    searchOrders: vi.fn(),
  };
  
  return {
    OrderController: vi.fn().mockImplementation(() => mockOrderController),
    ...mockOrderController,
  };
});

const orderController = new OrderController();

describe('Order Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/orders', () => {
    it('应该成功创建订单', async () => {
      const mockCreatedOrder = {
        success: true,
        data: {
          id: 'order123',
          orderNumber: 'ORD202501150001',
          customerId: 'user123',
          customerName: '张三',
          customerPhone: '13800138000',
          items: [
            { menuItemId: '1', quantity: 2, price: 38 },
            { menuItemId: '2', quantity: 1, price: 28 }
          ],
          totalAmount: 104,
          status: 'pending',
          paymentStatus: 'pending',
        },
        message: '订单创建成功',
      };
      vi.mocked(orderController.createOrder).mockResolvedValue(mockCreatedOrder);

      const request = new Request('http://example.com/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'user123',
          customerName: '张三',
          customerPhone: '13800138000',
          items: [
            { menuItemId: '1', quantity: 2 },
            { menuItemId: '2', quantity: 1 }
          ],
          deliveryInfo: {
            address: '北京市朝阳区xxx',
            deliveryTime: '2024-01-15T12:00:00Z'
          }
        })
      });

      const response = await orderRoutes['POST /api/v1/orders'](request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('order123');
      expect(orderController.createOrder).toHaveBeenCalled();
    });

    it('应该处理创建订单时的验证错误', async () => {
      const mockError = new Error('订单项不能为空');
      vi.mocked(orderController.createOrder).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'user123',
          items: [],
          deliveryInfo: {
            address: '北京市朝阳区xxx'
          }
        })
      });

      const response = await orderRoutes['POST /api/v1/orders'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('订单项不能为空');
    });
  });

  describe('GET /api/v1/orders', () => {
    it('应该成功获取订单列表', async () => {
      const mockOrders = {
        items: [
          { id: 'order1', orderNumber: 'ORD001', customerId: 'user123', totalAmount: 104, status: 'pending' },
          { id: 'order2', orderNumber: 'ORD002', customerId: 'user123', totalAmount: 56, status: 'completed' }
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      vi.mocked(orderController.getOrders).mockResolvedValue(mockOrders);

      const request = new Request('http://example.com/api/v1/orders?page=1&limit=10&status=pending', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(orderController.getOrders).toHaveBeenCalled();
    });

    it('应该处理获取订单列表时的错误', async () => {
      const mockError = new Error('数据库查询失败');
      vi.mocked(orderController.getOrders).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/orders', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('应该成功获取单个订单详情', async () => {
      const mockOrder = {
        success: true,
        data: {
          id: 'order123',
          orderNumber: 'ORD001',
          customerId: 'user123',
          customerName: '张三',
          customerPhone: '13800138000',
          items: [
            { menuItemId: '1', quantity: 2, price: 38 }
          ],
          totalAmount: 76,
          status: 'pending',
          createdAt: '2024-01-15T10:00:00Z'
        }
      };
      vi.mocked(orderController.getOrderById).mockResolvedValue(mockOrder);

      const request = new Request('http://example.com/api/v1/orders/order123', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/:id'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('order123');
      expect(orderController.getOrderById).toHaveBeenCalledWith('order123');
    });

    it('应该处理不存在的订单', async () => {
      const mockError = new Error('订单不存在');
      vi.mocked(orderController.getOrderById).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/orders/999', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/:id'](request, { id: '999' });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders/number/:orderNumber', () => {
    it('应该成功根据订单号获取订单', async () => {
      const mockOrder = {
        success: true,
        data: {
          id: 'order123',
          orderNumber: 'ORD202501150001',
          customerId: 'user123',
          status: 'pending'
        }
      };
      vi.mocked(orderController.getOrderByNumber).mockResolvedValue(mockOrder);

      const request = new Request('http://example.com/api/v1/orders/number/ORD202501150001', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/number/:orderNumber'](request, { orderNumber: 'ORD202501150001' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(orderController.getOrderByNumber).toHaveBeenCalledWith('ORD202501150001');
    });
  });

  describe('PUT /api/v1/orders/:id', () => {
    it('应该成功更新订单', async () => {
      const mockUpdatedOrder = {
        success: true,
        data: {
          id: 'order123',
          status: 'confirmed',
          deliveryInfo: {
            address: '北京市朝阳区新地址'
          }
        },
        message: '订单更新成功',
      };
      vi.mocked(orderController.updateOrder).mockResolvedValue(mockUpdatedOrder);

      const request = new Request('http://example.com/api/v1/orders/order123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryInfo: {
            address: '北京市朝阳区新地址',
            deliveryTime: '2024-01-15T13:00:00Z'
          }
        })
      });

      const response = await orderRoutes['PUT /api/v1/orders/:id'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(orderController.updateOrder).toHaveBeenCalledWith('order123', expect.any(Object));
    });

    it('应该处理更新不存在的订单', async () => {
      const mockError = new Error('订单不存在');
      vi.mocked(orderController.updateOrder).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/orders/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryInfo: { address: '新地址' } })
      });

      const response = await orderRoutes['PUT /api/v1/orders/:id'](request, { id: '999' });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/orders/:id', () => {
    it('应该成功取消订单', async () => {
      const mockCancelledOrder = {
        success: true,
        data: {
          id: 'order123',
          status: 'cancelled',
          reason: '客户请求删除'
        },
        message: '订单取消成功',
      };
      vi.mocked(orderController.cancelOrder).mockResolvedValue(mockCancelledOrder);

      const request = new Request('http://example.com/api/v1/orders/order123', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: '客户请求删除'
        })
      });

      const response = await orderRoutes['DELETE /api/v1/orders/:id'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('cancelled');
      expect(orderController.cancelOrder).toHaveBeenCalledWith('order123', '客户请求删除', undefined);
    });
  });

  describe('PATCH /api/v1/orders/:id/status', () => {
    it('应该成功更新订单状态', async () => {
      const mockUpdatedStatus = {
        success: true,
        data: {
          id: 'order123',
          status: 'preparing',
          notes: '开始准备'
        },
        message: '订单状态更新成功',
      };
      vi.mocked(orderController.updateOrderStatus).mockResolvedValue(mockUpdatedStatus);

      const request = new Request('http://example.com/api/v1/orders/order123/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'preparing', notes: '开始准备' })
      });

      const response = await orderRoutes['PATCH /api/v1/orders/:id/status'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('preparing');
      expect(orderController.updateOrderStatus).toHaveBeenCalledWith('order123', 'preparing', '开始准备');
    });

    it('应该处理无效的订单状态', async () => {
      const mockError = new Error('无效的订单状态');
      vi.mocked(orderController.updateOrderStatus).mockRejectedValue(mockError);

      const request = new Request('http://example.com/api/v1/orders/order123/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid_status' })
      });

      const response = await orderRoutes['PATCH /api/v1/orders/:id/status'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/v1/orders/:id/cancel', () => {
    it('应该成功取消订单', async () => {
      const mockCancelledOrder = {
        success: true,
        data: {
          id: 'order123',
          status: 'cancelled'
        },
        message: '订单取消成功',
      };
      vi.mocked(orderController.cancelOrder).mockResolvedValue(mockCancelledOrder);

      const request = new Request('http://example.com/api/v1/orders/order123/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: '客户取消',
          refundAmount: 100
        })
      });

      const response = await orderRoutes['POST /api/v1/orders/:id/cancel'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(orderController.cancelOrder).toHaveBeenCalledWith('order123', '客户取消', 100);
    });
  });

  describe('POST /api/v1/orders/:id/payment', () => {
    it('应该成功处理支付', async () => {
      const mockPaymentResult = {
        success: true,
        data: {
          orderId: 'order123',
          paymentResult: {
            success: true,
            transactionId: 'txn123',
            amount: 100.00,
            currency: 'CNY'
          },
          paymentStatus: 'paid'
        },
        message: '支付成功',
      };
      vi.mocked(orderController.processPayment).mockResolvedValue(mockPaymentResult);

      const request = new Request('http://example.com/api/v1/orders/order123/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'wechat',
          paymentDetails: {
            transactionId: 'txn123'
          }
        })
      });

      const response = await orderRoutes['POST /api/v1/orders/:id/payment'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(orderController.processPayment).toHaveBeenCalledWith('order123', 'wechat', expect.any(Object));
    });

    it('应该处理支付失败', async () => {
      const mockPaymentResult = {
        success: false,
        data: {
          orderId: 'order123',
          paymentResult: {
            success: false
          }
        },
        message: '支付失败',
      };
      vi.mocked(orderController.processPayment).mockResolvedValue(mockPaymentResult);

      const request = new Request('http://example.com/api/v1/orders/order123/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'wechat',
          paymentDetails: {}
        })
      });

      const response = await orderRoutes['POST /api/v1/orders/:id/payment'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/v1/orders/:id/assign-delivery', () => {
    it('应该成功分配配送员', async () => {
      const mockAssignment = {
        success: true,
        data: {
          orderId: 'order123',
          deliveryPersonnelId: 'driver1',
          assignedAt: '2024-01-15T10:00:00Z',
          estimatedDeliveryTime: '2024-01-15T10:30:00Z',
          status: 'assigned'
        },
        message: '配送员分配成功',
      };
      vi.mocked(orderController.assignDeliveryPersonnel).mockResolvedValue(mockAssignment);

      const request = new Request('http://example.com/api/v1/orders/order123/assign-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnelId: 'driver1'
        })
      });

      const response = await orderRoutes['POST /api/v1/orders/:id/assign-delivery'](request, { id: 'order123' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(orderController.assignDeliveryPersonnel).toHaveBeenCalledWith('order123', 'driver1');
    });
  });

  describe('GET /api/v1/orders/delivery/personnel/available', () => {
    it('应该成功获取可用配送员列表', async () => {
      const mockPersonnel = [
        { id: 'driver1', name: '张三', status: 'available' },
        { id: 'driver2', name: '李四', status: 'available' }
      ];
      vi.mocked(orderController.getAvailableDeliveryPersonnel).mockResolvedValue(mockPersonnel as any);

      const request = new Request('http://example.com/api/v1/orders/delivery/personnel/available?restaurantId=rest1', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/delivery/personnel/available'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(orderController.getAvailableDeliveryPersonnel).toHaveBeenCalledWith('rest1');
    });
  });

  describe('GET /api/v1/orders/search', () => {
    it('应该成功搜索订单', async () => {
      const mockSearchResults = {
        items: [
          { id: 'order1', orderNumber: 'ORD001', customerId: 'user123', status: 'pending' }
        ],
        total: 1,
        page: 1,
        limit: 10
      };
      vi.mocked(orderController.searchOrders).mockResolvedValue(mockSearchResults);

      const request = new Request('http://example.com/api/v1/orders/search?keyword=张三', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/search'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(orderController.searchOrders).toHaveBeenCalledWith('张三', expect.any(Object));
    });

    it('应该处理搜索关键词为空的情况', async () => {
      const request = new Request('http://example.com/api/v1/orders/search?keyword=', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/search'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('搜索关键词不能为空');
    });
  });

  describe('GET /api/v1/orders/stats', () => {
    it('应该成功获取订单统计', async () => {
      const mockStats = {
        totalOrders: 100,
        totalRevenue: 10000,
        avgOrderValue: 100,
        statusBreakdown: {
          pending: 10,
          confirmed: 20,
          preparing: 15,
          ready: 10,
          delivering: 5,
          completed: 35,
          cancelled: 5,
          refunded: 0
        }
      };
      vi.mocked(orderController.getOrderStats).mockResolvedValue(mockStats);

      const request = new Request('http://example.com/api/v1/orders/stats?restaurantId=rest1&startDate=2024-01-01&endDate=2024-01-31', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/stats'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalOrders).toBe(100);
      expect(orderController.getOrderStats).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/orders/reports/sales', () => {
    it('应该成功生成销售报告', async () => {
      const mockReport = {
        period: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        totalOrders: 100,
        totalRevenue: 10000,
        topMenuItems: [],
        peakHours: [],
        averageOrderValue: 100,
        customerRetentionRate: 0.8
      };
      vi.mocked(orderController.generateSalesReport).mockResolvedValue(mockReport);

      const request = new Request('http://example.com/api/v1/orders/reports/sales?startDate=2024-01-01&endDate=2024-01-31', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/reports/sales'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalOrders).toBe(100);
      expect(orderController.generateSalesReport).toHaveBeenCalled();
    });

    it('应该处理缺少日期参数的情况', async () => {
      const request = new Request('http://example.com/api/v1/orders/reports/sales?startDate=2024-01-01', {
        method: 'GET'
      });

      const response = await orderRoutes['GET /api/v1/orders/reports/sales'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('开始日期和结束日期不能为空');
    });
  });

  describe('PATCH /api/v1/orders/batch/status', () => {
    it('应该成功批量更新订单状态', async () => {
      const mockUpdateResult = {
        success: true,
        data: {
          id: 'order123',
          status: 'confirmed'
        },
        message: '订单状态更新成功',
      };
      vi.mocked(orderController.updateOrderStatus).mockResolvedValue(mockUpdateResult);

      const request = new Request('http://example.com/api/v1/orders/batch/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: ['order1', 'order2', 'order3'],
          status: 'confirmed',
          notes: '批量确认'
        })
      });

      const response = await orderRoutes['PATCH /api/v1/orders/batch/status'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.total).toBe(3);
      expect(data.data.successCount).toBe(3);
      expect(orderController.updateOrderStatus).toHaveBeenCalledTimes(3);
    });

    it('应该处理批量更新时的部分失败', async () => {
      const mockSuccessResult = {
        success: true,
        data: { id: 'order1', status: 'confirmed' },
        message: '订单状态更新成功',
      };
      const mockError = new Error('订单不存在');
      
      vi.mocked(orderController.updateOrderStatus)
        .mockResolvedValueOnce(mockSuccessResult)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccessResult);

      const request = new Request('http://example.com/api/v1/orders/batch/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: ['order1', 'order2', 'order3'],
          status: 'confirmed',
          notes: '批量确认'
        })
      });

      const response = await orderRoutes['PATCH /api/v1/orders/batch/status'](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.total).toBe(3);
      expect(data.data.successCount).toBe(2);
      expect(data.data.failCount).toBe(1);
    });

    it('应该处理订单ID列表为空的情况', async () => {
      const request = new Request('http://example.com/api/v1/orders/batch/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: [],
          status: 'confirmed'
        })
      });

      const response = await orderRoutes['PATCH /api/v1/orders/batch/status'](request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('订单ID列表不能为空');
    });
  });
});
