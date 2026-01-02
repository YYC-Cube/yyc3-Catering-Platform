/**
 * @file 菜单分类控制器
 * @description 处理菜单分类相关的HTTP请求
 * @module controllers/CategoryController
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import { categoryService } from '../services/CategoryService';
import logger from '../config/logger';

/**
 * 菜单分类控制器类
 */
export class CategoryController {
  /**
   * 创建菜单分类
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: '菜单分类创建成功',
        data: category
      });
    } catch (error: any) {
      logger.error('创建菜单分类失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建菜单分类失败'
      });
    }
  }

  /**
   * 获取菜单分类列表
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const { parentId, isActive, keyword, page = 1, limit = 20 } = req.query;
      const result = await categoryService.getCategories({
        parentId: parentId ? Number(parentId) : undefined,
        isActive: isActive ? isActive === 'true' : undefined,
        keyword: keyword as string,
        page: Number(page),
        limit: Number(limit)
      });

      res.status(200).json({
        success: true,
        message: '获取菜单分类列表成功',
        data: {
          categories: result.categories,
          total: result.total,
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error: any) {
      logger.error('获取菜单分类列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取菜单分类列表失败'
      });
    }
  }

  /**
   * 获取菜单分类详情
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(Number(id));

      if (!category) {
        res.status(404).json({
          success: false,
          message: '菜单分类不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '获取菜单分类详情成功',
        data: category
      });
    } catch (error: any) {
      logger.error('获取菜单分类详情失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取菜单分类详情失败'
      });
    }
  }

  /**
   * 更新菜单分类
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.updateCategory(Number(id), req.body);

      if (!category) {
        res.status(404).json({
          success: false,
          message: '菜单分类不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜单分类更新成功',
        data: category
      });
    } catch (error: any) {
      logger.error('更新菜单分类失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新菜单分类失败'
      });
    }
  }

  /**
   * 删除菜单分类
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await categoryService.deleteCategory(Number(id));

      if (!success) {
        res.status(404).json({
          success: false,
          message: '菜单分类不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜单分类删除成功'
      });
    } catch (error: any) {
      logger.error('删除菜单分类失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '删除菜单分类失败'
      });
    }
  }

  /**
   * 更新菜单分类状态
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const category = await categoryService.updateCategoryStatus(Number(id), isActive);

      if (!category) {
        res.status(404).json({
          success: false,
          message: '菜单分类不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜单分类状态更新成功',
        data: category
      });
    } catch (error: any) {
      logger.error('更新菜单分类状态失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新菜单分类状态失败'
      });
    }
  }

  /**
   * 批量更新菜单分类排序
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async batchUpdateSortOrder(req: Request, res: Response): Promise<void> {
    try {
      const { sortData } = req.body;
      const updatedCount = await categoryService.batchUpdateSortOrder(sortData);

      res.status(200).json({
        success: true,
        message: '批量更新菜单分类排序成功',
        data: { updatedCount }
      });
    } catch (error: any) {
      logger.error('批量更新菜单分类排序失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '批量更新菜单分类排序失败'
      });
    }
  }

  /**
   * 获取菜单分类树
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getCategoryTree(req: Request, res: Response): Promise<void> {
    try {
      const { isActive } = req.query;
      const categoryTree = await categoryService.getCategoryTree(isActive ? isActive === 'true' : undefined);

      res.status(200).json({
        success: true,
        message: '获取菜单分类树成功',
        data: categoryTree
      });
    } catch (error: any) {
      logger.error('获取菜单分类树失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取菜单分类树失败'
      });
    }
  }
}

export const categoryController = new CategoryController();
