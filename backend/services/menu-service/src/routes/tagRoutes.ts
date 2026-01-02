/**
 * @file 标签路由
 * @description 处理标签相关的API路由
 * @module routes/tagRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { tagController } from '../controllers/TagController';

const router = Router();

/**
 * 创建标签
 * @route POST /api/tags
 * @access 私有
 */
router.post('/', tagController.createTag);

/**
 * 获取标签列表
 * @route GET /api/tags
 * @access 公开
 */
router.get('/', tagController.getTags);

/**
 * 获取标签详情
 * @route GET /api/tags/:id
 * @access 公开
 */
router.get('/:id', tagController.getTagById);

/**
 * 更新标签
 * @route PUT /api/tags/:id
 * @access 私有
 */
router.put('/:id', tagController.updateTag);

/**
 * 删除标签
 * @route DELETE /api/tags/:id
 * @access 私有
 */
router.delete('/:id', tagController.deleteTag);

/**
 * 更新标签状态
 * @route PATCH /api/tags/:id/status
 * @access 私有
 */
router.patch('/:id/status', tagController.updateTagStatus);

/**
 * 批量更新标签排序
 * @route PATCH /api/tags/sort
 * @access 私有
 */
router.patch('/sort', tagController.batchUpdateSortOrder);

/**
 * 获取所有激活的标签
 * @route GET /api/tags/active
 * @access 公开
 */
router.get('/active', tagController.getAllActiveTags);

/**
 * 根据标签类型获取标签
 * @route GET /api/tags/type/:tagType
 * @access 公开
 */
router.get('/type/:tagType', tagController.getTagsByType);

export default router;
