/**
 * @file KitchenController.ts
 * @description 厨房控制器类 - 处理Dashboard厨房相关API请求
 * @module controllers
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 */
import { Request, Response, Router } from 'express';
import { OrderService } from '../services/OrderService';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

export interface KitchenStats {
  inProgress: number;
  pending: number;
  completed: number;
  avgPrepTime: number;
}

export interface KitchenStatus {
  id: string;
  orderId: string;
  dishName: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  actualTime?: number;
  createdAt: string;
  updatedAt: string;
}

export class KitchenController {
  public router: Router;

  constructor(private orderService: OrderService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/stats', this.getKitchenStats.bind(this));
    this.router.get('/status', this.getKitchenStatus.bind(this));
    this.router.patch('/items/:itemId/status', this.updateKitchenItemStatus.bind(this));
  }

  async getKitchenStats(req: Request, res: Response) {
    try {
      const orderQueue = await this.orderService.getOrderQueue('', 'all', 1000, 0);
      
      const inProgress = orderQueue.orders.filter((o: any) => o.status === 'in_progress').length;
      const pending = orderQueue.orders.filter((o: any) => o.status === 'pending').length;
      const completed = orderQueue.orders.filter((o: any) => o.status === 'completed').length;
      
      const avgPrepTime = orderQueue.orders.length > 0 
        ? Math.round(orderQueue.orders.reduce((sum: number, o: any) => sum + (o.estimatedTime || 0), 0) / orderQueue.orders.length)
        : 0;

      const stats: KitchenStats = {
        inProgress,
        pending,
        completed,
        avgPrepTime
      };

      const response: ApiResponse<KitchenStats> = {
        success: true,
        data: stats,
        message: 'Kitchen stats retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get kitchen stats error:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve kitchen stats',
        timestamp: Date.now()
      });
    }
  }

  async getKitchenStatus(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const orderQueue = await this.orderService.getOrderQueue('', status as string || 'all', 1000, 0);
      
      const kitchenStatus: KitchenStatus[] = orderQueue.orders.map((order: any) => ({
        id: order.id,
        orderId: order.id,
        dishName: order.dishes?.[0]?.name || 'Unknown',
        quantity: order.dishes?.[0]?.quantity || 1,
        status: order.status,
        priority: order.priority || 'medium',
        estimatedTime: order.estimatedTime || 0,
        actualTime: order.actualTime,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));

      const response: ApiResponse<KitchenStatus[]> = {
        success: true,
        data: kitchenStatus,
        message: 'Kitchen status retrieved successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Get kitchen status error:', error);
      res.status(500).json({
        success: false,
        data: [],
        message: 'Failed to retrieve kitchen status',
        timestamp: Date.now()
      });
    }
  }

  async updateKitchenItemStatus(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { status } = req.body;

      const updatedOrder = await this.orderService.updateOrderStatus(itemId, status, '');

      const response: ApiResponse<boolean> = {
        success: true,
        data: true,
        message: 'Kitchen item status updated successfully',
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Update kitchen item status error:', error);
      res.status(500).json({
        success: false,
        data: false,
        message: 'Failed to update kitchen item status',
        timestamp: Date.now()
      });
    }
  }
}
