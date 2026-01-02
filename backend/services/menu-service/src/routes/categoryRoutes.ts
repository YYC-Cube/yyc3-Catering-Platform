/**
 * @file 菜单分类路由
 * @description 处理菜单分类相关的API路由
 * @module routes/categoryRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { categoryController } from '../controllers/CategoryController';

const router = Router();

/**
 * 创建菜单分类
 * @route POST /api/categories
 * @access 私有
 */
router.post('/', categoryController.createCategory);

/**
 * 获取菜单分类列表
 * @route GET /api/categories
 * @access 公开
 */
router.get('/', categoryController.getCategories);

/**
 * 获取菜单分类详情
 * @route GET /api/categories/:id
 * @access 公开
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * 更新菜单分类
 * @route PUT /api/categories/:id
 * @access 私有
 */
router.put('/:id', categoryController.updateCategory);

/**
 * 删除菜单分类
 * @route DELETE /api/categories/:id
 * @access 私有
 */
router.delete('/:id', categoryController.deleteCategory);

/**
 * 更新菜单分类状态
 * @route PATCH /api/categories/:id/status
 * @access 私有
 */
router.patch('/:id/status', categoryController.updateCategoryStatus);

/**
 * 批量更新菜单分类排序
 * @route PATCH /api/categories/sort
 * @access 私有
 */
router.patch('/sort', categoryController.batchUpdateSortOrder);

/**
 * 获取菜单分类树
 * @route GET /api/categories/tree
 * @access 公开
 */
router.get('/tree', categoryController.getCategoryTree);

export default router;
