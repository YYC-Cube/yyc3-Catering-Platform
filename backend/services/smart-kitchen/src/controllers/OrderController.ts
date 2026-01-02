/**
 * @file OrderController.ts
 * @description 订单控制器类 - 处理智能厨房系统中的订单相关API请求
 * @module controllers
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
 */
import { Request, Response, Router } from 'express';
import { OrderService } from '../services/OrderService';

// 本地定义ApiResponse接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  requestId?: string;
  success: boolean;
}

// 扩展Request类型
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export class OrderController {
  public router: Router;

  constructor(private orderService: OrderService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/queue', this.getOrderQueue.bind(this));
    this.router.post('/', this.createOrder.bind(this));
    this.router.put('/:orderId/status', this.updateOrderStatus.bind(this));
    this.router.post('/assignment', this.intelligentOrderAssignment.bind(this));
    this.router.get('/:orderId/estimate-time', this.estimateCookingTime.bind(this));
    this.router.get('/:orderId', this.getOrderById.bind(this));
    this.router.put('/:orderId/cancel', this.cancelOrder.bind(this));
  }

  /**
   * 获取订单队列状态
   */
  async getOrderQueue(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params as { restaurantId: string };
      const { status, limit = 50, offset = 0 } = req.query;

      const orderQueue = await this.orderService.getOrderQueue(
        restaurantId,
        status as string,
        Number(limit),
        Number(offset)
      );

      const response: ApiResponse = {
        code: 200,
        message: 'Success',
        data: orderQueue,
        timestamp: Date.now(),
        requestId: req.id || Math.random().toString(36).substr(2, 9),
        success: true
      };

      res.json(response);
    } catch (error) {
      console.error('Get order queue error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 创建新订单
   */
  async createOrder(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params as { restaurantId: string };
      const orderData = {
        restaurantId,
        ...req.body
      };

      const order = await this.orderService.createOrder(orderData);

      const response: ApiResponse = {
        code: 201,
        message: 'Order created successfully',
        data: order,
        timestamp: Date.now(),
        requestId: req.id || Math.random().toString(36).substr(2, 9),
        success: true
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { restaurantId, orderId } = req.params as { restaurantId: string; orderId: string };
      const { status, notes } = req.body;

      const updatedOrder = await this.orderService.updateOrderStatus(
        orderId,
        status,
        notes
      );

      const response: ApiResponse = {
        code: 200,
        message: 'Order status updated successfully',
        data: updatedOrder,
        timestamp: Date.now(),
        requestId: req.id || Math.random().toString(36).substr(2, 9),
        success: true
      };

      res.json(response);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 智能订单分配
   */
  async intelligentOrderAssignment(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params as { restaurantId: string };
      const { orders } = req.body;

      const assignmentResult = await this.orderService.intelligentOrderAssignment(
        restaurantId,
        orders
      );

      const response: ApiResponse = {
        code: 200,
        message: 'Order assignment completed',
        data: assignmentResult,
        timestamp: Date.now(),
        requestId: req.id || Math.random().toString(36).substr(2, 9),
        success: true
      };

      res.json(response);
    } catch (error) {
      console.error('Intelligent order assignment error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 预估出餐时间
   */
  async estimateCookingTime(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params as { restaurantId: string };
      const { orderId } = req.body as { orderId: string };

      const cookingTimeEstimate = await this.orderService.estimateCookingTime(
        orderId
      );

      const response: ApiResponse = {
        code: 200,
        message: 'Cooking time estimated',
        data: cookingTimeEstimate,
        timestamp: Date.now(),
        requestId: req.id || Math.random().toString(36).substr(2, 9),
        success: true
      };

      res.json(response);
    } catch (error) {
      console.error('Estimate cooking time error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取订单详情
   */
  async getOrderById(req: Request, res: Response) {
    try {
      const { restaurantId, orderId } = req.params as { restaurantId: string; orderId: string };

      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          code: 404,
          message: 'Order not found',
          timestamp: Date.now(),
          requestId: req.id || Math.random().toString(36).substr(2, 9),
          success: false
        });
      }

      const response: ApiResponse = {
        code: 200,
        message: 'Success',
        data: order,
        timestamp: Date.now(),
        requestId: req.id || Math.random().toString(36).substr(2, 9),
        success: true
      };

      res.json(response);
    } catch (error) {
      console.error('Get order by ID error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(req: Request, res: Response) {
    try {
      const { restaurantId, orderId } = req.params as { restaurantId: string; orderId: string };
      const { reason } = req.body as { reason?: string };

      const cancelledOrder = await this.orderService.cancelOrder(
        orderId,
        reason
      );

      const response: ApiResponse = {
        code: 200,
        message: 'Order cancelled successfully',
        data: cancelledOrder,
        timestamp: Date.now(),
        requestId: req.id || Math.random().toString(36).substr(2, 9),
        success: true
      };

      res.json(response);
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }
}