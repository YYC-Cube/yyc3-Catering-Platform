/**
 * @file AI助手验证模式定义
 * @description 定义AI助手相关API的请求验证模式
 * @module schemas/validation
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-10
 */

import { z } from 'zod';

// 销售预测请求验证模式
export const salesForecastSchema = z.object({
  context: z.object({
    restaurantId: z.string().uuid(),
    timeRange: z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    historicalData: z.array(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      sales: z.number().min(0),
      orders: z.number().min(0),
      customers: z.number().min(0)
    })).optional(),
    factors: z.object({
      promotions: z.boolean().optional(),
      holidays: z.boolean().optional(),
      weather: z.boolean().optional(),
      events: z.boolean().optional()
    }).optional()
  })
});

// 库存优化请求验证模式
export const inventoryOptimizationSchema = z.object({
  context: z.object({
    restaurantId: z.string().uuid(),
    currentInventory: z.array(z.object({
      itemId: z.string().uuid(),
      itemName: z.string().min(1),
      category: z.string().min(1),
      currentStock: z.number().min(0),
      minimumStock: z.number().min(0),
      maximumStock: z.number().min(1),
      unitCost: z.number().min(0),
      leadTime: z.number().min(0),
      usageRate: z.number().min(0),
      expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    })).optional(),
    salesData: z.array(z.object({
      itemId: z.string().uuid(),
      salesQuantity: z.number().min(0),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).optional(),
    supplierInfo: z.array(z.object({
      supplierId: z.string().uuid(),
      supplierName: z.string().min(1),
      deliveryTime: z.number().min(0),
      reliability: z.number().min(0).max(10)
    })).optional()
  })
});

// 客户行为分析请求验证模式
export const customerBehaviorAnalysisSchema = z.object({
  context: z.object({
    restaurantId: z.string().uuid(),
    customerData: z.array(z.object({
      customerId: z.string().uuid(),
      visitCount: z.number().min(0),
      totalSpent: z.number().min(0),
      favoriteItems: z.array(z.string().uuid()),
      visitTimes: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        amountSpent: z.number().min(0)
      }))
    })).optional(),
    timeRange: z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).optional()
  })
});

// 菜单优化请求验证模式
export const menuOptimizationSchema = z.object({
  context: z.object({
    restaurantId: z.string().uuid(),
    menuItems: z.array(z.object({
      itemId: z.string().uuid(),
      name: z.string().min(1),
      category: z.string().min(1),
      price: z.number().min(0),
      cost: z.number().min(0),
      popularity: z.number().min(0).max(100),
      profitMargin: z.number().min(0).max(100),
      ingredients: z.array(z.object({
        ingredientId: z.string().uuid(),
        name: z.string().min(1),
        quantity: z.number().min(0),
        unitCost: z.number().min(0)
      }))
    })).optional(),
    salesData: z.array(z.object({
      itemId: z.string().uuid(),
      salesCount: z.number().min(0),
      revenue: z.number().min(0),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).optional(),
    season: z.string().optional(),
    dietaryTrends: z.array(z.string()).optional()
  })
});

// 运营效率优化请求验证模式
export const operationalEfficiencySchema = z.object({
  context: z.object({
    restaurantId: z.string().uuid(),
    operationalData: z.object({
      dailySales: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        sales: z.number().min(0),
        customers: z.number().min(0),
        orders: z.number().min(0)
      })).optional(),
      staffSchedule: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        shift: z.string().min(1),
        staffCount: z.number().min(0),
        laborCost: z.number().min(0)
      })).optional(),
      peakHours: z.array(z.object({
        day: z.string().min(1),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/)
      })).optional()
    }).optional(),
    goals: z.object({
      reduceLaborCost: z.boolean().optional(),
      improveCustomerService: z.boolean().optional(),
      optimizeTableTurnover: z.boolean().optional()
    }).optional()
  })
});

// 导出所有验证模式
export const aiAssistantSchemas = {
  salesForecast: salesForecastSchema,
  inventoryOptimization: inventoryOptimizationSchema,
  customerBehaviorAnalysis: customerBehaviorAnalysisSchema,
  menuOptimization: menuOptimizationSchema,
  operationalEfficiency: operationalEfficiencySchema
};
