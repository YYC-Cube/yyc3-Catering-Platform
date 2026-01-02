/**
 * @fileoverview 示例路由
 * @description 定义示例相关的API路由
 * @module routes/sample-routes
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Router } from 'express';
import { SampleController } from '../controllers/sample-controller';
import { authenticate } from '../middleware/auth';

// 创建示例控制器实例
const sampleController = new SampleController();

// 创建路由实例
const router = Router();

/**
 * 示例路由定义
 */
router.post('/samples', authenticate, sampleController.createSample.bind(sampleController));
router.get('/samples', authenticate, sampleController.getSampleList.bind(sampleController));
router.get('/samples/:id', authenticate, sampleController.getSampleById.bind(sampleController));
router.put('/samples/:id', authenticate, sampleController.updateSample.bind(sampleController));
router.delete('/samples/:id', authenticate, sampleController.deleteSample.bind(sampleController));
router.post('/samples/batch-delete', authenticate, sampleController.batchDeleteSamples.bind(sampleController));

// 导出路由
export default router;
