/**
 * @file 菜品控制器
 * @description 处理菜品相关的HTTP请求
 * @module controllers/MenuItemController
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import { menuItemService } from '../services/MenuItemService';
import logger from '../config/logger';

/**
 * 菜品控制器类
 */
export class MenuItemController {
  /**
   * 创建菜品
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const menuItem = await menuItemService.createMenuItem(req.body);
      res.status(201).json({
        success: true,
        message: '菜品创建成功',
        data: menuItem
      });
    } catch (error: any) {
      logger.error('创建菜品失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建菜品失败'
      });
    }
  }

  /**
   * 获取菜品列表
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId, isActive, isRecommend, minPrice, maxPrice, keyword, page = 1, limit = 20 } = req.query;
      const result = await menuItemService.getMenuItems({
        categoryId: categoryId ? Number(categoryId) : undefined,
        isActive: isActive ? isActive === 'true' : undefined,
        isRecommend: isRecommend ? isRecommend === 'true' : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        keyword: keyword as string,
        page: Number(page),
        limit: Number(limit)
      });

      res.status(200).json({
        success: true,
        message: '获取菜品列表成功',
        data: {
          menuItems: result.menuItems,
          total: result.total,
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error: any) {
      logger.error('获取菜品列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取菜品列表失败'
      });
    }
  }

  /**
   * 获取菜品详情
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getMenuItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const menuItem = await menuItemService.getMenuItemById(Number(id));

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: '菜品不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '获取菜品详情成功',
        data: menuItem
      });
    } catch (error: any) {
      logger.error('获取菜品详情失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取菜品详情失败'
      });
    }
  }

  /**
   * 更新菜品
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const menuItem = await menuItemService.updateMenuItem(Number(id), req.body);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: '菜品不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜品更新成功',
        data: menuItem
      });
    } catch (error: any) {
      logger.error('更新菜品失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新菜品失败'
      });
    }
  }

  /**
   * 删除菜品
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await menuItemService.deleteMenuItem(Number(id));

      if (!success) {
        res.status(404).json({
          success: false,
          message: '菜品不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜品删除成功'
      });
    } catch (error: any) {
      logger.error('删除菜品失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '删除菜品失败'
      });
    }
  }

  /**
   * 更新菜品状态
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateMenuItemStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const menuItem = await menuItemService.updateMenuItemStatus(Number(id), isActive);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: '菜品不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜品状态更新成功',
        data: menuItem
      });
    } catch (error: any) {
      logger.error('更新菜品状态失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新菜品状态失败'
      });
    }
  }

  /**
   * 更新菜品库存
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateMenuItemStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const menuItem = await menuItemService.updateMenuItemStock(Number(id), stock);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: '菜品不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜品库存更新成功',
        data: menuItem
      });
    } catch (error: any) {
      logger.error('更新菜品库存失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新菜品库存失败'
      });
    }
  }

  /**
   * 增加菜品销量
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async incrementMenuItemSales(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity = 1 } = req.body;
      const menuItem = await menuItemService.incrementMenuItemSales(Number(id), quantity);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: '菜品不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '菜品销量更新成功',
        data: menuItem
      });
    } catch (error: any) {
      logger.error('增加菜品销量失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '增加菜品销量失败'
      });
    }
  }

  // ------------------------------
  // 动态定价相关方法
  // ------------------------------

  /**
   * 创建动态价格规则
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async createDynamicPrice(req: Request, res: Response): Promise<void> {
    try {
      const { menuItemId } = req.params;
      const dynamicPrice = await menuItemService.createDynamicPrice({
        menuItemId: Number(menuItemId),
        ...req.body
      });

      res.status(201).json({
        success: true,
        message: '动态价格规则创建成功',
        data: dynamicPrice
      });
    } catch (error: any) {
      logger.error('创建动态价格规则失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建动态价格规则失败'
      });
    }
  }

  /**
   * 获取菜品的动态价格规则列表
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getDynamicPricesByMenuItemId(req: Request, res: Response): Promise<void> {
    try {
      const { menuItemId } = req.params;
      const dynamicPrices = await menuItemService.getDynamicPricesByMenuItemId(Number(menuItemId));

      res.status(200).json({
        success: true,
        message: '获取动态价格规则列表成功',
        data: dynamicPrices
      });
    } catch (error: any) {
      logger.error('获取动态价格规则列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取动态价格规则列表失败'
      });
    }
  }

  /**
   * 获取菜品当前生效的动态价格
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getCurrentDynamicPrice(req: Request, res: Response): Promise<void> {
    try {
      const { menuItemId } = req.params;
      const currentPrice = await menuItemService.getCurrentDynamicPrice(Number(menuItemId));

      res.status(200).json({
        success: true,
        message: '获取当前动态价格成功',
        data: currentPrice
      });
    } catch (error: any) {
      logger.error('获取当前动态价格失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取当前动态价格失败'
      });
    }
  }

  /**
   * 更新动态价格规则
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async updateDynamicPrice(req: Request, res: Response): Promise<void> {
    try {
      const { dynamicPriceId } = req.params;
      const dynamicPrice = await menuItemService.updateDynamicPrice(Number(dynamicPriceId), req.body);

      if (!dynamicPrice) {
        res.status(404).json({
          success: false,
          message: '动态价格规则不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '动态价格规则更新成功',
        data: dynamicPrice
      });
    } catch (error: any) {
      logger.error('更新动态价格规则失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新动态价格规则失败'
      });
    }
  }

  /**
   * 删除动态价格规则
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async deleteDynamicPrice(req: Request, res: Response): Promise<void> {
    try {
      const { dynamicPriceId } = req.params;
      const success = await menuItemService.deleteDynamicPrice(Number(dynamicPriceId));

      if (!success) {
        res.status(404).json({
          success: false,
          message: '动态价格规则不存在'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '动态价格规则删除成功'
      });
    } catch (error: any) {
      logger.error('删除动态价格规则失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '删除动态价格规则失败'
      });
    }
  }

  // ------------------------------
  // 个性化推荐相关方法
  // ------------------------------

  /**
   * 获取用户的个性化推荐菜品
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async getRecommendationsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;
      const recommendations = await menuItemService.getRecommendationsByUserId(Number(userId), Number(limit));

      res.status(200).json({
        success: true,
        message: '获取个性化推荐成功',
        data: recommendations
      });
    } catch (error: any) {
      logger.error('获取个性化推荐失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取个性化推荐失败'
      });
    }
  }

  /**
   * 生成智能推荐
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async generateSmartRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 10, context } = req.query;
      const recommendations = await menuItemService.generateSmartRecommendations(Number(userId), Number(limit), context as string);

      res.status(200).json({
        success: true,
        message: '生成智能推荐成功',
        data: recommendations
      });
    } catch (error: any) {
      logger.error('生成智能推荐失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '生成智能推荐失败'
      });
    }
  }

  /**
   * 追踪推荐使用情况
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async trackRecommendationUsage(req: Request, res: Response): Promise<void> {
    try {
      const { recommendationId } = req.params;
      const { action } = req.body;
      
      // 根据action值构建更新参数
      let updateParams: any = {
        is_used: true,
        used_at: new Date()
      };
      
      if (action === 'click') {
        updateParams.click_count = 1;
      } else if (action === 'order') {
        updateParams.order_count = 1;
      }
      
      const result = await menuItemService.updateRecommendationUsage(Number(recommendationId), updateParams);

      res.status(200).json({
        success: true,
        message: '推荐使用情况追踪成功',
        data: result
      });
    } catch (error: any) {
      logger.error('追踪推荐使用情况失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '追踪推荐使用情况失败'
      });
    }
  }

  /**
   * 训练推荐模型
   * @param req 请求对象
   * @param res 响应对象
   */
  async trainRecommendationModel(req: Request, res: Response): Promise<void> {
    try {
      const trainingData = req.body;
      if (!Array.isArray(trainingData) || trainingData.length === 0) {
        res.status(400).json({ message: '请提供有效的训练数据' });
        return;
      }

      const result = await this.menuItemService.trainRecommendationModel(trainingData);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      logger.error('训练推荐模型失败', error);
      res.status(500).json({ message: '训练推荐模型失败' });
    }
  }

  /**
   * 更新用户画像
   * @param req 请求对象
   * @param res 响应对象
   */
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userData = req.body;

      const result = await this.menuItemService.updateUserProfile(parseInt(userId), userData);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      logger.error('更新用户画像失败', error);
      res.status(500).json({ message: '更新用户画像失败' });
    }
  }

  /**
   * 获取用户画像
   * @param req 请求对象
   * @param res 响应对象
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await this.menuItemService.getUserProfile(parseInt(userId));
      if (profile) {
        res.status(200).json({ success: true, data: profile });
      } else {
        res.status(404).json({ success: false, message: '用户画像不存在' });
      }
    } catch (error) {
      logger.error('获取用户画像失败', error);
      res.status(500).json({ message: '获取用户画像失败' });
    }
  }

  /**
   * 批量生成推荐
   * @param req 请求对象
   * @param res 响应对象
   */
  async batchGenerateRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userIds, context, limit = 10 } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({ message: '请提供有效的用户ID列表' });
        return;
      }

      const results = await this.menuItemService.batchGenerateRecommendations(userIds, context, limit);
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      logger.error('批量生成推荐失败', error);
      res.status(500).json({ message: '批量生成推荐失败' });
    }
  }
}

export const menuItemController = new MenuItemController();
