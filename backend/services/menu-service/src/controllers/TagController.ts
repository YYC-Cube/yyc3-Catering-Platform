/**
 * @file 标签控制器
 * @description 处理标签相关的HTTP请求
 * @module controllers/TagController
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import { tagService } from '../services/TagService';
import logger from '../config/logger';

/**
 * 标签控制器类
 */
export class TagController {
  /**
   * 创建标签
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async createTag(req: Request, res: Response): Promise<void> {
    try {
      const tag = await tagService.createTag(req.body);
      res.status(201).json({
        success: true,
        message: '标签创建成功',
        data: tag
      });
    } catch (error: any) {
      logger.error('创建标签失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建标签失败'
      });
    }
  }

  /**
   * 获取标签列表
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getTags(req: Request, res: Response): Promise<void> {
    try {
      const { tagType, isActive, keyword, page = 1, limit = 20 } = req.query;
      const result = await tagService.getTags({
        tagType: tagType as string,
        isActive: isActive ? isActive === 'true' : undefined,
        keyword: keyword as string,
        page: Number(page),
        limit: Number(limit)
      });

      res.status(200).json({
        success: true,
        message: '获取标签列表成功',
        data: {
          tags: result.tags,
          total: result.total,
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error: any) {
      logger.error('获取标签列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取标签列表失败'
      });
    }
  }

  /**
   * 获取标签详情
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getTagById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tag = await tagService.getTagById(Number(id));

      if (!tag) {
        res.status(404).json({
          success: false,
          message: '标签不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '获取标签详情成功',
        data: tag
      });
    } catch (error: any) {
      logger.error('获取标签详情失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取标签详情失败'
      });
    }
  }

  /**
   * 更新标签
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tag = await tagService.updateTag(Number(id), req.body);

      if (!tag) {
        res.status(404).json({
          success: false,
          message: '标签不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '标签更新成功',
        data: tag
      });
    } catch (error: any) {
      logger.error('更新标签失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新标签失败'
      });
    }
  }

  /**
   * 删除标签
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await tagService.deleteTag(Number(id));

      if (!success) {
        res.status(404).json({
          success: false,
          message: '标签不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '标签删除成功'
      });
    } catch (error: any) {
      logger.error('删除标签失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '删除标签失败'
      });
    }
  }

  /**
   * 更新标签状态
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateTagStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const tag = await tagService.updateTagStatus(Number(id), isActive);

      if (!tag) {
        res.status(404).json({
          success: false,
          message: '标签不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '标签状态更新成功',
        data: tag
      });
    } catch (error: any) {
      logger.error('更新标签状态失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新标签状态失败'
      });
    }
  }

  /**
   * 批量更新标签排序
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async batchUpdateSortOrder(req: Request, res: Response): Promise<void> {
    try {
      const { sortData } = req.body;
      const updatedCount = await tagService.batchUpdateSortOrder(sortData);

      res.status(200).json({
        success: true,
        message: '批量更新标签排序成功',
        data: { updatedCount }
      });
    } catch (error: any) {
      logger.error('批量更新标签排序失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '批量更新标签排序失败'
      });
    }
  }

  /**
   * 获取所有激活的标签
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getAllActiveTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await tagService.getAllActiveTags();
      res.status(200).json({
        success: true,
        message: '获取激活标签成功',
        data: tags
      });
    } catch (error: any) {
      logger.error('获取激活标签失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取激活标签失败'
      });
    }
  }

  /**
   * 根据标签类型获取标签
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getTagsByType(req: Request, res: Response): Promise<void> {
    try {
      const { tagType } = req.params;
      const tags = await tagService.getTagsByType(tagType);
      res.status(200).json({
        success: true,
        message: `获取标签类型 ${tagType} 成功`,
        data: tags
      });
    } catch (error: any) {
      logger.error('根据标签类型获取标签失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '根据标签类型获取标签失败'
      });
    }
  }
}

export const tagController = new TagController();
