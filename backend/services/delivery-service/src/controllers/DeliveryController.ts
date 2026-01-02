/**
 * @file 配送服务控制器
 * @description 处理配送相关的HTTP请求
 * @module controllers/DeliveryController
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import { deliveryService, CreateDeliveryParams, UpdateDeliveryStatusParams, AssignDeliveryParams, CreateDeliveryRatingParams } from '../services/DeliveryService';
import logger from '../config/logger';

class DeliveryController {
  /**
   * 创建配送
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async createDelivery(req: Request, res: Response): Promise<void> {
    try {
      const params: CreateDeliveryParams = req.body;
      const delivery = await deliveryService.createDelivery(params);
      
      res.status(201).json({
        success: true,
        message: '配送创建成功',
        data: delivery,
      });
    } catch (error) {
      logger.error('创建配送失败', { error: (error as Error).message, body: req.body });
      res.status(400).json({
        success: false,
        message: '创建配送失败',
        error: (error as Error).message,
      });
    }
  }

  /**
   * 获取配送详情
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getDeliveryDetails(req: Request, res: Response): Promise<void> {
    try {
      const { delivery_id } = req.params;
      const delivery = await deliveryService.getDeliveryById(delivery_id);
      
      if (!delivery) {
        res.status(404).json({
          success: false,
          message: '配送不存在',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: '获取配送详情成功',
        data: delivery,
      });
    } catch (error) {
      logger.error('获取配送详情失败', { error: (error as Error).message, delivery_id: req.params.delivery_id });
      res.status(500).json({
        success: false,
        message: '获取配送详情失败',
        error: (error as Error).message,
      });
    }
  }

  /**
   * 获取订单的配送信息
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getDeliveryByOrder(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.params;
      const delivery = await deliveryService.getDeliveryByOrderId(order_id);
      
      if (!delivery) {
        res.status(404).json({
          success: false,
          message: '订单的配送不存在',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: '获取订单配送信息成功',
        data: delivery,
      });
    } catch (error) {
      logger.error('获取订单配送信息失败', { error: (error as Error).message, order_id: req.params.order_id });
      res.status(500).json({
        success: false,
        message: '获取订单配送信息失败',
        error: (error as Error).message,
      });
    }
  }

  /**
   * 更新配送状态
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateDeliveryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { delivery_id } = req.params;
      const { status, reason, operator_id, operator_type } = req.body;
      
      const params: UpdateDeliveryStatusParams = {
        delivery_id,
        status,
        reason,
        operator_id,
        operator_type,
      };
      
      const delivery = await deliveryService.updateDeliveryStatus(params);
      
      res.status(200).json({
        success: true,
        message: '配送状态更新成功',
        data: delivery,
      });
    } catch (error) {
      logger.error('更新配送状态失败', { error: (error as Error).message, params: req.body });
      res.status(400).json({
        success: false,
        message: '更新配送状态失败',
        error: (error as Error).message,
      });
    }
  }

  /**
   * 分配配送任务给骑手
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async assignDelivery(req: Request, res: Response): Promise<void> {
    try {
      const { delivery_id } = req.params;
      const { rider_id } = req.body;
      
      const params: AssignDeliveryParams = {
        delivery_id,
        rider_id,
      };
      
      const assignment = await deliveryService.assignDelivery(params);
      
      res.status(201).json({
        success: true,
        message: '配送任务分配成功',
        data: assignment,
      });
    } catch (error) {
      logger.error('分配配送任务失败', { error: (error as Error).message, params: req.body });
      res.status(400).json({
        success: false,
        message: '分配配送任务失败',
        error: (error as Error).message,
      });
    }
  }

  /**
   * 骑手接受配送任务
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async acceptDelivery(req: Request, res: Response): Promise<void> {
    try {
      const { assignment_id } = req.params;
      const assignment = await deliveryService.acceptDelivery(assignment_id);
      
      res.status(200).json({
        success: true,
        message: '骑手接受配送任务成功',
        data: assignment,
      });
    } catch (error) {
      logger.error('骑手接受配送任务失败', { error: (error as Error).message, assignment_id: req.params.assignment_id });
      res.status(400).json({
        success: false,
        message: '骑手接受配送任务失败',
        error: (error as Error).message,
      });
    }
  }

  /**
   * 骑手拒绝配送任务
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async rejectDelivery(req: Request, res: Response): Promise<void> {
    try {
      const { assignment_id } = req.params;
      const { reason } = req.body;
      
      const assignment = await deliveryService.rejectDelivery(assignment_id, reason);
      
      res.status(200).json({
        success: true,
        message: '骑手拒绝配送任务成功',
        data: assignment,
      });
    } catch (error) {
      logger.error('骑手拒绝配送任务失败', { error: (error as Error).message, assignment_id: req.params.assignment_id });
      res.status(400).json({
        success: false,
        message: '骑手拒绝配送任务失败',
        error: (error as Error).message,
      });
    }
  }

  /**
   * 创建配送评分
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async createDeliveryRating(req: Request, res: Response): Promise<void> {
    try {
      const params: CreateDeliveryRatingParams = req.body;
      const rating = await deliveryService.createDeliveryRating(params);
      
      res.status(201).json({
        success: true,
        message: '创建配送评分成功',
        data: rating,
      });
    } catch (error) {
      logger.error('创建配送评分失败', { error: (error as Error).message, params: req.body });
      res.status(400).json({
        success: false,
        message: '创建配送评分失败',
        error: (error as Error).message,
      });
    }
  }
}

export const deliveryController = new DeliveryController();
export { DeliveryController };