/**
 * @file 菜品路由
 * @description 处理菜品相关的API路由
 * @module routes/menuItemRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { menuItemController } from '../controllers/MenuItemController';

const router = Router();

/**
 * 创建菜品
 * @route POST /api/menu-items
 * @access 私有
 */
router.post('/', menuItemController.createMenuItem);

/**
 * 获取菜品列表
 * @route GET /api/menu-items
 * @access 公开
 */
router.get('/', menuItemController.getMenuItems);

/**
 * 获取菜品详情
 * @route GET /api/menu-items/:id
 * @access 公开
 */
router.get('/:id', menuItemController.getMenuItemById);

/**
 * 更新菜品
 * @route PUT /api/menu-items/:id
 * @access 私有
 */
router.put('/:id', menuItemController.updateMenuItem);

/**
 * 删除菜品
 * @route DELETE /api/menu-items/:id
 * @access 私有
 */
router.delete('/:id', menuItemController.deleteMenuItem);

/**
 * 更新菜品状态
 * @route PATCH /api/menu-items/:id/status
 * @access 私有
 */
router.patch('/:id/status', menuItemController.updateMenuItemStatus);

/**
 * 更新菜品库存
 * @route PATCH /api/menu-items/:id/stock
 * @access 私有
 */
router.patch('/:id/stock', menuItemController.updateMenuItemStock);

/**
 * 增加菜品销量
 * @route PATCH /api/menu-items/:id/sales
 * @access 私有
 */
router.patch('/:id/sales', menuItemController.incrementMenuItemSales);

// ------------------------------
// 动态定价相关路由
// ------------------------------

/**
 * 创建动态价格规则
 * @route POST /api/menu-items/:menuItemId/dynamic-prices
 * @access 私有
 */
router.post('/:menuItemId/dynamic-prices', menuItemController.createDynamicPrice);

/**
 * 获取菜品的动态价格规则列表
 * @route GET /api/menu-items/:menuItemId/dynamic-prices
 * @access 公开
 */
router.get('/:menuItemId/dynamic-prices', menuItemController.getDynamicPricesByMenuItemId);

/**
 * 获取菜品当前生效的动态价格
 * @route GET /api/menu-items/:menuItemId/current-price
 * @access 公开
 */
router.get('/:menuItemId/current-price', menuItemController.getCurrentDynamicPrice);

/**
 * 更新动态价格规则
 * @route PUT /api/dynamic-prices/:dynamicPriceId
 * @access 私有
 */
router.put('/dynamic-prices/:dynamicPriceId', menuItemController.updateDynamicPrice);

/**
 * 删除动态价格规则
 * @route DELETE /api/dynamic-prices/:dynamicPriceId
 * @access 私有
 */
router.delete('/dynamic-prices/:dynamicPriceId', menuItemController.deleteDynamicPrice);

// ------------------------------
// 个性化推荐相关路由
// ------------------------------

/**
 * 获取用户的个性化推荐菜品
 * @route GET /api/recommendations/user/:userId
 * @access 公开
 */
router.get('/recommendations/user/:userId', menuItemController.getRecommendationsByUserId);

/**
 * 生成智能推荐
 * @route POST /api/recommendations/generate/:userId
 * @access 公开
 */
router.post('/recommendations/generate/:userId', menuItemController.generateSmartRecommendations);

/**
 * 追踪推荐使用情况
 * @route POST /api/recommendations/:recommendationId/track
 * @access 公开
 */
router.post('/recommendations/:recommendationId/track', menuItemController.trackRecommendationUsage);

/**
 * 训练推荐模型
 * @route POST /api/recommendations/train
 * @access 私有
 */
router.post('/recommendations/train', menuItemController.trainRecommendationModel);

/**
 * 更新用户画像
 * @route PUT /api/recommendations/user/:userId/profile
 * @access 公开
 */
router.put('/recommendations/user/:userId/profile', menuItemController.updateUserProfile);

/**
 * 获取用户画像
 * @route GET /api/recommendations/user/:userId/profile
 * @access 公开
 */
router.get('/recommendations/user/:userId/profile', menuItemController.getUserProfile);

/**
 * 批量生成推荐
 * @route POST /api/recommendations/batch
 * @access 公开
 */
router.post('/recommendations/batch', menuItemController.batchGenerateRecommendations);

export default router;
