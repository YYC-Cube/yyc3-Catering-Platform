/**
 * @file 数据分析控制器
 * @description 处理数据分析相关的API请求
 * @module controllers/AnalyticsController
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Request, Response } from 'express';
import { analyticsService } from '../services/AnalyticsService';
import { AnalyticsType } from '../enums/AnalyticsType';
import logger from '../config/logger';

/**
 * 数据分析控制器类
 */
export class AnalyticsController {
  /**
   * 记录分析数据
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async recordAnalyticsData(req: Request, res: Response): Promise<void> {
    try {
      logger.info('记录分析数据请求', { body: req.body });
      
      const data = await analyticsService.recordAnalyticsData(req.body);
      
      res.status(201).json({
        success: true,
        message: '分析数据记录成功',
        data,
      });
    } catch (error) {
      logger.error('记录分析数据请求失败', { error, body: req.body });
      
      res.status(500).json({
        success: false,
        message: '记录分析数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 记录用户行为数据
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async recordUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      logger.info('记录用户行为数据请求', { body: req.body });
      
      const data = await analyticsService.recordUserAnalytics(req.body);
      
      res.status(201).json({
        success: true,
        message: '用户行为数据记录成功',
        data,
      });
    } catch (error) {
      logger.error('记录用户行为数据请求失败', { error, body: req.body });
      
      res.status(500).json({
        success: false,
        message: '记录用户行为数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 记录订单分析数据
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async recordOrderAnalytics(req: Request, res: Response): Promise<void> {
    try {
      logger.info('记录订单分析数据请求', { body: req.body });
      
      const data = await analyticsService.recordOrderAnalytics(req.body);
      
      res.status(201).json({
        success: true,
        message: '订单分析数据记录成功',
        data,
      });
    } catch (error) {
      logger.error('记录订单分析数据请求失败', { error, body: req.body });
      
      res.status(500).json({
        success: false,
        message: '记录订单分析数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取分析数据
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getAnalyticsData(req: Request, res: Response): Promise<void> {
    try {
      logger.info('获取分析数据请求', { query: req.query });
      
      const { type, startDate, endDate, page = 1, limit = 100 } = req.query;
      
      // 验证参数
      if (!type || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
        return;
      }
      
      const analyticsData = await analyticsService.getAnalyticsData(
        type as AnalyticsType,
        new Date(startDate as string),
        new Date(endDate as string),
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.status(200).json({
        success: true,
        message: '获取分析数据成功',
        data: analyticsData.data,
        total: analyticsData.total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      logger.error('获取分析数据请求失败', { error, query: req.query });
      
      res.status(500).json({
        success: false,
        message: '获取分析数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取用户行为数据
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      logger.info('获取用户行为数据请求', { params: req.params, query: req.query });
      
      const { userId } = req.params;
      const { startDate, endDate, page = 1, limit = 100 } = req.query;
      
      // 验证参数
      if (!userId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
        return;
      }
      
      const userAnalytics = await analyticsService.getUserAnalytics(
        parseInt(userId),
        new Date(startDate as string),
        new Date(endDate as string),
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.status(200).json({
        success: true,
        message: '获取用户行为数据成功',
        data: userAnalytics.data,
        total: userAnalytics.total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      logger.error('获取用户行为数据请求失败', { error, params: req.params, query: req.query });
      
      res.status(500).json({
        success: false,
        message: '获取用户行为数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取订单分析数据
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getOrderAnalytics(req: Request, res: Response): Promise<void> {
    try {
      logger.info('获取订单分析数据请求', { query: req.query });
      
      const { startDate, endDate, page = 1, limit = 100 } = req.query;
      
      // 验证参数
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
        return;
      }
      
      const orderAnalytics = await analyticsService.getOrderAnalytics(
        new Date(startDate as string),
        new Date(endDate as string),
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.status(200).json({
        success: true,
        message: '获取订单分析数据成功',
        data: orderAnalytics.data,
        total: orderAnalytics.total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      logger.error('获取订单分析数据请求失败', { error, query: req.query });
      
      res.status(500).json({
        success: false,
        message: '获取订单分析数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取销售统计数据
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getSalesStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('获取销售统计数据请求', { query: req.query });
      
      const { startDate, endDate } = req.query;
      
      // 验证参数
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
        return;
      }
      
      const salesStats = await analyticsService.getSalesStats(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.status(200).json({
        success: true,
        message: '获取销售统计数据成功',
        data: salesStats,
      });
    } catch (error) {
      logger.error('获取销售统计数据请求失败', { error, query: req.query });
      
      res.status(500).json({
        success: false,
        message: '获取销售统计数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取用户活动统计
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getUserActivityStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('获取用户活动统计请求', { params: req.params, query: req.query });
      
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      // 验证参数
      if (!userId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
        return;
      }
      
      const userActivityStats = await analyticsService.getUserActivityStats(
        parseInt(userId),
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.status(200).json({
        success: true,
        message: '获取用户活动统计成功',
        data: userActivityStats,
      });
    } catch (error) {
      logger.error('获取用户活动统计请求失败', { error, params: req.params, query: req.query });
      
      res.status(500).json({
        success: false,
        message: '获取用户活动统计失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取热门产品统计
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getPopularProducts(req: Request, res: Response): Promise<void> {
    try {
      logger.info('获取热门产品统计请求', { query: req.query });
      
      const { startDate, endDate, limit = 10 } = req.query;
      
      // 验证参数
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
        return;
      }
      
      const popularProducts = await analyticsService.getPopularProducts(
        new Date(startDate as string),
        new Date(endDate as string),
        parseInt(limit as string)
      );
      
      res.status(200).json({
        success: true,
        message: '获取热门产品统计成功',
        data: popularProducts,
      });
    } catch (error) {
      logger.error('获取热门产品统计请求失败', { error, query: req.query });
      
      res.status(500).json({
        success: false,
        message: '获取热门产品统计失败',
        error: error.message,
      });
    }
  }
}

// 导出数据分析控制器实例
export const analyticsController = new AnalyticsController();
