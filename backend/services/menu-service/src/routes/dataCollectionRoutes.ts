/**
 * @file 数据采集与处理路由
 * @description 定义数据采集与处理相关的API路由
 * @module routes/dataCollectionRoutes
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Router, Request, Response, NextFunction } from 'express';
import dataCollectionController from '../controllers/DataCollectionController';

// 创建路由实例
const router: Router = Router();

// 中间件：请求日志
const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};

// 应用中间件
router.use(logRequest);

/**
 * 采集内部数据
 * @route POST /api/v1/data-collection/internal
 * @access 私有
 * @returns {Promise<Response>} 采集结果
 */
router.post('/internal', dataCollectionController.collectInternalData);

/**
 * 采集外部数据
 * @route POST /api/v1/data-collection/external
 * @access 私有
 * @returns {Promise<Response>} 采集结果
 */
router.post('/external', dataCollectionController.collectExternalData);

/**
 * 处理采集的数据
 * @route POST /api/v1/data-collection/process
 * @access 私有
 * @returns {Promise<Response>} 处理结果
 */
router.post('/process', dataCollectionController.processCollectedData);

/**
 * 获取处理后的数据
 * @route GET /api/v1/data-collection/processed
 * @access 私有
 * @returns {Promise<Response>} 处理后的数据
 */
router.get('/processed', dataCollectionController.getProcessedData);

/**
 * 获取所有采集任务
 * @route GET /api/v1/data-collection/collections
 * @access 私有
 * @returns {Promise<Response>} 采集任务列表
 */
router.get('/collections', dataCollectionController.getAllCollections);

/**
 * 获取所有处理任务
 * @route GET /api/v1/data-collection/processings
 * @access 私有
 * @returns {Promise<Response>} 处理任务列表
 */
router.get('/processings', dataCollectionController.getAllProcessings);

/**
 * 注册新的内部数据源
 * @route POST /api/v1/data-collection/register-datasource
 * @access 私有
 * @returns {Promise<Response>} 注册结果
 */
router.post('/register-datasource', dataCollectionController.registerInternalDataSource);

/**
 * 注册新的数据处理策略
 * @route POST /api/v1/data-collection/register-strategy
 * @access 私有
 * @returns {Promise<Response>} 注册结果
 */
router.post('/register-strategy', dataCollectionController.registerProcessingStrategy);

// ----------------------------
// 统计分析接口
// ----------------------------

// 获取菜品销售统计数据
router.get('/statistics/dish-sales', dataCollectionController.getDishSalesStatistics);

// 获取分类销售统计数据
router.get('/statistics/category-sales', dataCollectionController.getCategorySalesStatistics);

// 获取用户交互统计数据
router.get('/statistics/user-interactions', dataCollectionController.getUserInteractionStatistics);

// 获取时段销售统计数据
router.get('/statistics/time-period-sales', dataCollectionController.getTimePeriodSalesStatistics);

// 获取趋势分析数据
router.get('/statistics/trend-analysis', dataCollectionController.getTrendAnalysis);

// 获取菜品推荐效果分析
router.get('/statistics/recommendation-effectiveness', dataCollectionController.getRecommendationEffectiveness);

// 获取热门菜品和分类
router.get('/statistics/popular-items', dataCollectionController.getPopularDishesAndCategories);

export default router;
