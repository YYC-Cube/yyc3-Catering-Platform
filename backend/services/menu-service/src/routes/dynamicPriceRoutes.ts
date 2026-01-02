/**
 * @file 动态定价路由
 * @description 定义动态定价相关的API路由
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Router } from 'express';
import { dynamicPriceController } from '../controllers/dynamicPriceController';

const router = Router();

// 动态价格规则管理
router.post('/rules', dynamicPriceController.createDynamicPrice);
router.get('/rules/:id', dynamicPriceController.getDynamicPrice);
router.put('/rules/:id', dynamicPriceController.updateDynamicPrice);
router.delete('/rules/:id', dynamicPriceController.deleteDynamicPrice);
router.get('/rules', dynamicPriceController.getAllDynamicPrices);
router.put('/rules/:id/status', dynamicPriceController.toggleDynamicPriceStatus);

// 动态价格计算
router.post('/calculate/:menuItemId', dynamicPriceController.calculateDynamicPrice);
router.post('/batch-calculate', dynamicPriceController.batchCalculateDynamicPrice);

// 统计信息
router.get('/stats', dynamicPriceController.getDynamicPriceStats);

// AI价格预测相关API
router.post('/ai/train/:menuItemId', dynamicPriceController.trainAIPriceModel);
router.post('/ai/predict/:menuItemId', dynamicPriceController.predictPriceWithAI);
router.post('/ai/batch-train', dynamicPriceController.batchTrainAIModels);

export default router;
