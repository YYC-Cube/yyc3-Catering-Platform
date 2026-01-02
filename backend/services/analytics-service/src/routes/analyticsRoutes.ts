/**
 * @file 数据分析服务路由
 * @description 定义数据分析服务的API端点
 * @module routes/analyticsRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Router } from 'express';
import { analyticsController } from '../controllers/AnalyticsController';

/**
 * 数据分析服务路由
 */
const analyticsRouter = Router();

/**
 * 记录分析数据
 * @route POST /api/analytics/data
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.post('/data', analyticsController.recordAnalyticsData);

/**
 * 记录用户行为数据
 * @route POST /api/analytics/user
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.post('/user', analyticsController.recordUserAnalytics);

/**
 * 记录订单分析数据
 * @route POST /api/analytics/order
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.post('/order', analyticsController.recordOrderAnalytics);

/**
 * 获取分析数据
 * @route GET /api/analytics/data
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.get('/data', analyticsController.getAnalyticsData);

/**
 * 获取用户行为数据
 * @route GET /api/analytics/user/:userId
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.get('/user/:userId', analyticsController.getUserAnalytics);

/**
 * 获取订单分析数据
 * @route GET /api/analytics/order
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.get('/order', analyticsController.getOrderAnalytics);

/**
 * 获取销售统计数据
 * @route GET /api/analytics/sales-stats
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.get('/sales-stats', analyticsController.getSalesStats);

/**
 * 获取用户活动统计
 * @route GET /api/analytics/user-activity/:userId
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.get('/user-activity/:userId', analyticsController.getUserActivityStats);

/**
 * 获取热门产品统计
 * @route GET /api/analytics/popular-products
 * @access 公开
 * @returns {Promise<Response>} 响应结果
 */
analyticsRouter.get('/popular-products', analyticsController.getPopularProducts);

// 导出路由
export default analyticsRouter;
