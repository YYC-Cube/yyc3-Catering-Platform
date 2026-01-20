/**
 * @fileoverview YYC³订单模型单元测试
 * @description 测试订单数据模型的Zod验证模式
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import {
  orderSchema,
  OrderStatus,
  PaymentStatus,
  OrderType,
  PaymentMethod,
  type CreateOrderRequest,
  type UpdateOrderRequest,
  type OrderQuery,
  type OrderResponse,
  type OrderListResponse,
  type OrderStats,
  type OrderSalesReport,
  type DeliveryPersonnel,
  type OrderDeliveryAssignment,
} from '../../../models/order';

const validOrder = {
  customerId: '550e8400-e29b-41d4-a716-446655440000',
  customerName: '张三',
  customerPhone: '13800138000',
  restaurantId: '550e8400-e29b-41d4-a716-446655440001',
  orderType: OrderType.DELIVERY,
  status: OrderStatus.PENDING,
  paymentStatus: PaymentStatus.PENDING,
  paymentMethod: PaymentMethod.WECHAT,
  items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      menuItemId: '550e8400-e29b-41d4-a716-446655440003',
      menuItemName: '宫保鸡丁',
      quantity: 2,
      unitPrice: 38,
      totalPrice: 76,
    },
  ],
  priceBreakdown: {
    subtotal: 76,
    discount: 0,
    deliveryFee: 5,
    serviceFee: 0,
    tax: 0,
    tip: 0,
    total: 81,
  },
  deliveryInfo: {
    address: '北京市朝阳区xxx',
    deliveryFee: 5,
    contactPhone: '13800138000',
    contactName: '张三',
  },
  createdBy: '550e8400-e29b-41d4-a716-446655440000',
};

describe('订单模型测试', () => {
  describe('枚举类型测试', () => {
    it('应该正确定义订单状态枚举', () => {
      expect(OrderStatus.PENDING).toBe('pending');
      expect(OrderStatus.CONFIRMED).toBe('confirmed');
      expect(OrderStatus.PREPARING).toBe('preparing');
      expect(OrderStatus.READY).toBe('ready');
      expect(OrderStatus.DELIVERING).toBe('delivering');
      expect(OrderStatus.COMPLETED).toBe('completed');
      expect(OrderStatus.CANCELLED).toBe('cancelled');
      expect(OrderStatus.REFUNDED).toBe('refunded');
    });

    it('应该正确定义支付状态枚举', () => {
      expect(PaymentStatus.PENDING).toBe('pending');
      expect(PaymentStatus.PROCESSING).toBe('processing');
      expect(PaymentStatus.PAID).toBe('paid');
      expect(PaymentStatus.FAILED).toBe('failed');
      expect(PaymentStatus.REFUNDED).toBe('refunded');
      expect(PaymentStatus.PARTIALLY_REFUNDED).toBe('partially_refunded');
    });

    it('应该正确定义订单类型枚举', () => {
      expect(OrderType.DINE_IN).toBe('dine_in');
      expect(OrderType.TAKEAWAY).toBe('takeaway');
      expect(OrderType.DELIVERY).toBe('delivery');
    });

    it('应该正确定义支付方式枚举', () => {
      expect(PaymentMethod.CASH).toBe('cash');
      expect(PaymentMethod.CARD).toBe('card');
      expect(PaymentMethod.MOBILE_PAY).toBe('mobile_pay');
      expect(PaymentMethod.WECHAT).toBe('wechat');
      expect(PaymentMethod.ALIPAY).toBe('alipay');
      expect(PaymentMethod.BALANCE).toBe('balance');
    });
  });

  describe('订单Schema验证测试', () => {
    const validOrder = {
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      customerName: '张三',
      customerPhone: '13800138000',
      restaurantId: '550e8400-e29b-41d4-a716-446655440001',
      orderType: OrderType.DELIVERY,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.WECHAT,
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          menuItemId: '550e8400-e29b-41d4-a716-446655440003',
          menuItemName: '宫保鸡丁',
          quantity: 2,
          unitPrice: 38,
          totalPrice: 76,
        },
      ],
      priceBreakdown: {
        subtotal: 76,
        discount: 0,
        deliveryFee: 5,
        serviceFee: 0,
        tax: 0,
        tip: 0,
        total: 81,
      },
      deliveryInfo: {
        address: '北京市朝阳区xxx',
        deliveryFee: 5,
        contactPhone: '13800138000',
        contactName: '张三',
      },
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('应该验证有效的订单数据', () => {
      const result = orderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it('应该拒绝缺少必填字段的订单', () => {
      const invalidOrder = { ...validOrder };
      delete (invalidOrder as any).customerName;
      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('应该拒绝客户姓名为空的订单', () => {
      const invalidOrder = { ...validOrder, customerName: '' };
      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('应该拒绝客户电话为空的订单', () => {
      const invalidOrder = { ...validOrder, customerPhone: '' };
      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('应该拒绝订单项数量为0的订单', () => {
      const invalidOrder = {
        ...validOrder,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            menuItemId: '550e8400-e29b-41d4-a716-446655440003',
            menuItemName: '宫保鸡丁',
            quantity: 0,
            unitPrice: 38,
            totalPrice: 0,
          },
        ],
      };
      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('应该拒绝订单项单价为负数的订单', () => {
      const invalidOrder = {
        ...validOrder,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            menuItemId: '550e8400-e29b-41d4-a716-446655440003',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: -38,
            totalPrice: -76,
          },
        ],
      };
      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('应该拒绝没有订单项的订单', () => {
      const invalidOrder = { ...validOrder, items: [] };
      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('应该拒绝价格为负数的订单明细', () => {
      const invalidOrder = {
        ...validOrder,
        priceBreakdown: {
          subtotal: -76,
          discount: 0,
          deliveryFee: 5,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: -71,
        },
      };
      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('应该接受带有配送信息的订单', () => {
      const orderWithDelivery = {
        ...validOrder,
        deliveryInfo: {
          address: '北京市朝阳区xxx',
          coordinates: {
            lat: 39.9042,
            lng: 116.4074,
          },
          distance: 5.5,
          estimatedTime: 30,
          deliveryFee: 5,
          contactPhone: '13800138000',
          contactName: '张三',
          instructions: '请按门铃',
        },
      };
      const result = orderSchema.safeParse(orderWithDelivery);
      expect(result.success).toBe(true);
    });

    it('应该接受带有订单项选项的订单', () => {
      const orderWithOptions = {
        ...validOrder,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            menuItemId: '550e8400-e29b-41d4-a716-446655440003',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38,
            totalPrice: 76,
            options: [
              {
                name: '辣度选择',
                choices: [
                  { name: '微辣', price: 0 },
                  { name: '中辣', price: 0 },
                ],
              },
            ],
          },
        ],
      };
      const result = orderSchema.safeParse(orderWithOptions);
      expect(result.success).toBe(true);
    });

    it('应该接受带有评价的订单', () => {
      const orderWithReview = {
        ...validOrder,
        review: {
          rating: 5,
          comment: '非常好吃！',
          foodQuality: 5,
          serviceQuality: 5,
          deliveryQuality: 5,
          images: ['https://example.com/review.jpg'],
          createdAt: new Date(),
        },
      };
      const result = orderSchema.safeParse(orderWithReview);
      expect(result.success).toBe(true);
    });

    it('应该拒绝超出范围的评分', () => {
      const orderWithInvalidReview = {
        ...validOrder,
        review: {
          rating: 6,
          comment: '测试',
          foodQuality: 5,
          serviceQuality: 5,
          createdAt: new Date(),
        },
      };
      const result = orderSchema.safeParse(orderWithInvalidReview);
      expect(result.success).toBe(false);
    });

    it('应该接受带有预约时间的订单', () => {
      const orderWithScheduledTime = {
        ...validOrder,
        scheduledTime: new Date('2024-12-31T12:00:00Z'),
        estimatedReadyTime: new Date('2024-12-31T12:15:00Z'),
      };
      const result = orderSchema.safeParse(orderWithScheduledTime);
      expect(result.success).toBe(true);
    });

    it('应该接受带有优惠码的订单', () => {
      const orderWithPromo = {
        ...validOrder,
        promoCode: 'SAVE10',
        promoDiscount: 10,
        priceBreakdown: {
          subtotal: 76,
          discount: 10,
          deliveryFee: 5,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 71,
        },
      };
      const result = orderSchema.safeParse(orderWithPromo);
      expect(result.success).toBe(true);
    });

    it('应该应用默认值', () => {
      const minimalOrder = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        customerName: '张三',
        customerPhone: '13800138000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440001',
        orderType: OrderType.DELIVERY,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            menuItemId: '550e8400-e29b-41d4-a716-446655440003',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38,
            totalPrice: 76,
          },
        ],
        priceBreakdown: {
          subtotal: 76,
          discount: 0,
          deliveryFee: 0,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 76,
        },
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = orderSchema.safeParse(minimalOrder);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(OrderStatus.PENDING);
        expect(result.data.paymentStatus).toBe(PaymentStatus.PENDING);
        expect(result.data.source).toBe('web');
      }
    });

    it('应该接受所有订单来源', () => {
      const sources = ['web', 'mobile', 'mini_program', 'phone', 'in_store'] as const;

      sources.forEach(source => {
        const order = {
          ...validOrder,
          source: source,
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('类型定义测试', () => {
    it('应该正确定义CreateOrderRequest类型', () => {
      const createRequest: CreateOrderRequest = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        customerName: '张三',
        customerPhone: '13800138000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440001',
        orderType: OrderType.DELIVERY,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            menuItemId: '550e8400-e29b-41d4-a716-446655440003',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38,
            totalPrice: 76,
          },
        ],
        priceBreakdown: {
          subtotal: 76,
          discount: 0,
          deliveryFee: 5,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 81,
        },
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(createRequest).toBeDefined();
    });

    it('应该正确定义UpdateOrderRequest类型', () => {
      const updateRequest: UpdateOrderRequest = {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
      };
      expect(updateRequest).toBeDefined();
    });

    it('应该正确定义OrderQuery类型', () => {
      const query: OrderQuery = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440001',
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        orderType: OrderType.DELIVERY,
        paymentMethod: PaymentMethod.WECHAT,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        minTotal: 50,
        maxTotal: 200,
        search: '张三',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      expect(query).toBeDefined();
    });

    it('应该正确定义OrderResponse类型', () => {
      const response: OrderResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        orderNumber: 'ORD20240101001',
        customerId: '550e8400-e29b-41d4-a716-446655440001',
        customerName: '张三',
        customerPhone: '13800138000',
        restaurantId: '550e8400-e29b-41d4-a716-446655440002',
        orderType: OrderType.DELIVERY,
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            menuItemId: '550e8400-e29b-41d4-a716-446655440004',
            menuItemName: '宫保鸡丁',
            quantity: 2,
            unitPrice: 38,
            totalPrice: 76,
          },
        ],
        priceBreakdown: {
          subtotal: 76,
          discount: 0,
          deliveryFee: 5,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 81,
        },
        createdBy: '550e8400-e29b-41d4-a716-446655440005',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(response).toBeDefined();
    });

    it('应该正确定义OrderListResponse类型', () => {
      const listResponse: OrderListResponse = {
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

    it('应该正确定义OrderStats类型', () => {
      const stats: OrderStats = {
        totalOrders: 1000,
        totalRevenue: 100000,
        avgOrderValue: 100,
        statusBreakdown: {
          [OrderStatus.PENDING]: 50,
          [OrderStatus.CONFIRMED]: 100,
          [OrderStatus.PREPARING]: 150,
          [OrderStatus.READY]: 100,
          [OrderStatus.DELIVERING]: 200,
          [OrderStatus.COMPLETED]: 300,
          [OrderStatus.CANCELLED]: 80,
          [OrderStatus.REFUNDED]: 20,
        },
        paymentMethodBreakdown: {
          [PaymentMethod.WECHAT]: { count: 400, amount: 40000 },
          [PaymentMethod.ALIPAY]: { count: 350, amount: 35000 },
          [PaymentMethod.CASH]: { count: 250, amount: 25000 },
        },
        orderTypeBreakdown: {
          [OrderType.DINE_IN]: 300,
          [OrderType.TAKEAWAY]: 400,
          [OrderType.DELIVERY]: 300,
        },
        dailyStats: [
          {
            date: '2024-01-01',
            orders: 100,
            revenue: 10000,
          },
        ],
      };
      expect(stats).toBeDefined();
    });

    it('应该正确定义OrderSalesReport类型', () => {
      const report: OrderSalesReport = {
        period: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
        totalOrders: 10000,
        totalRevenue: 1000000,
        topMenuItems: [
          {
            menuItemId: '550e8400-e29b-41d4-a716-446655440000',
            menuItemName: '宫保鸡丁',
            quantity: 500,
            revenue: 19000,
          },
        ],
        peakHours: [
          {
            hour: 12,
            orderCount: 200,
          },
        ],
        averageOrderValue: 100,
        customerRetentionRate: 0.6,
      };
      expect(report).toBeDefined();
    });

    it('应该正确定义DeliveryPersonnel类型', () => {
      const personnel: DeliveryPersonnel = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '李四',
        phone: '13900139000',
        avatar: 'https://example.com/avatar.jpg',
        rating: 4.8,
        deliveryCount: 500,
        currentLocation: {
          lat: 39.9042,
          lng: 116.4074,
        },
        status: 'available',
      };
      expect(personnel).toBeDefined();
    });

    it('应该正确定义OrderDeliveryAssignment类型', () => {
      const assignment: OrderDeliveryAssignment = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        deliveryPersonnelId: '550e8400-e29b-41d4-a716-446655440001',
        assignedAt: new Date(),
        estimatedDeliveryTime: new Date(),
        actualDeliveryTime: new Date(),
        status: 'delivered',
      };
      expect(assignment).toBeDefined();
    });
  });

  describe('边界条件测试', () => {
    it('应该接受最小长度的客户姓名', () => {
      const order = {
        ...validOrder,
        customerName: 'a',
      };
      const result = orderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it('应该接受最小长度的客户电话', () => {
      const order = {
        ...validOrder,
        customerPhone: '1',
      };
      const result = orderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it('应该接受零价格的订单明细', () => {
      const order = {
        ...validOrder,
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            menuItemId: '550e8400-e29b-41d4-a716-446655440003',
            menuItemName: '免费菜品',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
          },
        ],
        priceBreakdown: {
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          serviceFee: 0,
          tax: 0,
          tip: 0,
          total: 0,
        },
      };
      const result = orderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it('应该接受所有订单状态', () => {
      const statuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERING,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED,
      ];

      statuses.forEach(status => {
        const order = {
          ...validOrder,
          status: status,
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });

    it('应该接受所有支付状态', () => {
      const paymentStatuses = [
        PaymentStatus.PENDING,
        PaymentStatus.PROCESSING,
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.REFUNDED,
        PaymentStatus.PARTIALLY_REFUNDED,
      ];

      paymentStatuses.forEach(paymentStatus => {
        const order = {
          ...validOrder,
          paymentStatus: paymentStatus,
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });

    it('应该接受所有订单类型', () => {
      const orderTypes = [
        OrderType.DINE_IN,
        OrderType.TAKEAWAY,
        OrderType.DELIVERY,
      ];

      orderTypes.forEach(orderType => {
        const order = {
          ...validOrder,
          orderType: orderType,
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });

    it('应该接受所有支付方式', () => {
      const paymentMethods = [
        PaymentMethod.CASH,
        PaymentMethod.CARD,
        PaymentMethod.MOBILE_PAY,
        PaymentMethod.WECHAT,
        PaymentMethod.ALIPAY,
        PaymentMethod.BALANCE,
      ];

      paymentMethods.forEach(paymentMethod => {
        const order = {
          ...validOrder,
          paymentMethod: paymentMethod,
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });

    it('应该接受所有订单项制作状态', () => {
      const prepStatuses = ['pending', 'preparing', 'ready', 'completed'] as const;

      prepStatuses.forEach(prepStatus => {
        const order = {
          ...validOrder,
          items: [
            {
              ...validOrder.items[0],
              prepStatus: prepStatus,
            },
          ],
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });
  });
});
