/**
 * @file DashboardController.ts
 * @description Dashboard控制器类 - 处理Dashboard数据API请求
 * @module controllers
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 */
import { Request, Response, Router } from 'express';
import { OrderService } from '../services/OrderService';
import { DishRepository } from '../repositories/DishRepository';
import { ExportController } from './ExportController';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

export interface CoreMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  completionRate: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopDish {
  id: string;
  name: string;
  category: string;
  salesCount: number;
  revenue: number;
  avgRating: number;
}

export interface CustomerFlow {
  hour: number;
  count: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  items: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export class DashboardController {
  public router: Router;

  constructor(
    private orderService: OrderService,
    private dishRepository: DishRepository
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/metrics', this.getCoreMetrics.bind(this));
    this.router.get('/revenue', this.getRevenueData.bind(this));
    this.router.get('/orders/distribution', this.getOrderDistribution.bind(this));
    this.router.get('/menu/top', this.getTopDishes.bind(this));
    this.router.get('/customer/flow', this.getCustomerFlow.bind(this));
    this.router.get('/orders/recent', this.getRecentOrders.bind(this));
    
    const exportController = new ExportController(this.orderService, this.dishRepository);
    this.router.post('/export', exportController.exportDashboardData.bind(exportController));
  }

  async getCoreMetrics(req: Request, res: Response) {
    try {
      const { startDate, endDate, period } = req.query;
      
      const orderQueue = await this.orderService.getOrderQueue('', 'all', 10000, 0);
      const orders = orderQueue.orders;
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const totalCustomers = new Set(orders.map((o: any) => o.customerId)).size;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const completedOrders = orders.filter((o: any) => o.status === 'completed').length;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const metrics: CoreMetrics = {
        totalOrders,
        totalRevenue,
        totalCustomers,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100
      };

      const response: ApiResponse<CoreMetrics> = {
        success: true,
        data: metrics,
        message: 'Core metrics retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get core metrics error:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve core metrics',
        timestamp: Date.now()
      });
    }
  }

  async getRevenueData(req: Request, res: Response) {
    try {
      const { startDate, endDate, period } = req.query;
      
      const orderQueue = await this.orderService.getOrderQueue('', 'all', 10000, 0);
      const orders = orderQueue.orders;
      
      const revenueMap = new Map<string, { revenue: number; orders: number }>();
      
      orders.forEach((order: any) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (!revenueMap.has(date)) {
          revenueMap.set(date, { revenue: 0, orders: 0 });
        }
        const data = revenueMap.get(date)!;
        data.revenue += order.totalAmount || 0;
        data.orders += 1;
      });
      
      const revenueData: RevenueData[] = Array.from(revenueMap.entries())
        .map(([date, data]) => ({
          date,
          revenue: Math.round(data.revenue * 100) / 100,
          orders: data.orders
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const response: ApiResponse<RevenueData[]> = {
        success: true,
        data: revenueData,
        message: 'Revenue data retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get revenue data error:', error);
      res.status(500).json({
        success: false,
        data: [],
        message: 'Failed to retrieve revenue data',
        timestamp: Date.now()
      });
    }
  }

  async getOrderDistribution(req: Request, res: Response) {
    try {
      const { startDate, endDate, period } = req.query;
      
      const orderQueue = await this.orderService.getOrderQueue('', 'all', 10000, 0);
      const orders = orderQueue.orders;
      
      const statusCounts = orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      
      const totalOrders = orders.length;
      const distribution: OrderDistribution[] = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
        percentage: totalOrders > 0 ? Math.round((count as number / totalOrders) * 10000) / 100 : 0
      }));

      const response: ApiResponse<OrderDistribution[]> = {
        success: true,
        data: distribution,
        message: 'Order distribution retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get order distribution error:', error);
      res.status(500).json({
        success: false,
        data: [],
        message: 'Failed to retrieve order distribution',
        timestamp: Date.now()
      });
    }
  }

  async getTopDishes(req: Request, res: Response) {
    try {
      const { startDate, endDate, period } = req.query;
      
      const orderQueue = await this.orderService.getOrderQueue('', 'all', 10000, 0);
      const orders = orderQueue.orders;
      
      const dishSales = new Map<string, { count: number; revenue: number; category: string }>();
      
      orders.forEach((order: any) => {
        order.dishes?.forEach((dish: any) => {
          if (!dishSales.has(dish.name)) {
            dishSales.set(dish.name, { count: 0, revenue: 0, category: dish.category || 'unknown' });
          }
          const data = dishSales.get(dish.name)!;
          data.count += dish.quantity || 1;
          data.revenue += (dish.price || 0) * (dish.quantity || 1);
        });
      });
      
      const topDishes: TopDish[] = Array.from(dishSales.entries())
        .map(([name, data]) => ({
          id: name,
          name,
          category: data.category,
          salesCount: data.count,
          revenue: Math.round(data.revenue * 100) / 100,
          avgRating: 4.5
        }))
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 10);

      const response: ApiResponse<TopDish[]> = {
        success: true,
        data: topDishes,
        message: 'Top dishes retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get top dishes error:', error);
      res.status(500).json({
        success: false,
        data: [],
        message: 'Failed to retrieve top dishes',
        timestamp: Date.now()
      });
    }
  }

  async getCustomerFlow(req: Request, res: Response) {
    try {
      const { startDate, endDate, period } = req.query;
      
      const orderQueue = await this.orderService.getOrderQueue('', 'all', 10000, 0);
      const orders = orderQueue.orders;
      
      const hourlyFlow = new Array(24).fill(0);
      
      orders.forEach((order: any) => {
        const hour = new Date(order.createdAt).getHours();
        hourlyFlow[hour]++;
      });
      
      const customerFlow: CustomerFlow[] = hourlyFlow.map((count, hour) => ({
        hour,
        count
      }));

      const response: ApiResponse<CustomerFlow[]> = {
        success: true,
        data: customerFlow,
        message: 'Customer flow retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get customer flow error:', error);
      res.status(500).json({
        success: false,
        data: [],
        message: 'Failed to retrieve customer flow',
        timestamp: Date.now()
      });
    }
  }

  async getRecentOrders(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const limitNum = parseInt(limit as string) || 10;
      
      const orderQueue = await this.orderService.getOrderQueue('', 'all', limitNum, 0);
      
      const recentOrders: RecentOrder[] = orderQueue.orders.map((order: any) => ({
        id: order.id,
        customerName: order.customerName || 'Unknown',
        items: order.dishes?.map((d: any) => d.name) || [],
        totalAmount: order.totalAmount || 0,
        status: order.status,
        createdAt: order.createdAt
      }));

      const response: ApiResponse<RecentOrder[]> = {
        success: true,
        data: recentOrders,
        message: 'Recent orders retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get recent orders error:', error);
      res.status(500).json({
        success: false,
        data: [],
        message: 'Failed to retrieve recent orders',
        timestamp: Date.now()
      });
    }
  }
}
