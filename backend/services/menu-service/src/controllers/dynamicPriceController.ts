/**
 * @file 动态定价控制器
 * @description 处理动态定价相关的API请求和响应
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Request, Response } from 'express';
import { dynamicPriceService } from '../services/DynamicPriceService';

class DynamicPriceController {
  // 创建动态价格规则
  async createDynamicPrice(req: Request, res: Response) {
    try {
      const data = req.body;
      const dynamicPrice = await dynamicPriceService.createDynamicPrice(data);
      res.status(201).json({ success: true, data: dynamicPrice });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 获取动态价格规则
  async getDynamicPrice(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const dynamicPrice = await dynamicPriceService.getDynamicPrice(id);
      if (!dynamicPrice) {
        return res.status(404).json({ success: false, message: '动态价格规则不存在' });
      }
      res.status(200).json({ success: true, data: dynamicPrice });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 更新动态价格规则
  async updateDynamicPrice(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      const [affectedCount, updatedDynamicPrices] = await dynamicPriceService.updateDynamicPrice(id, data);
      if (affectedCount === 0) {
        return res.status(404).json({ success: false, message: '动态价格规则不存在' });
      }
      res.status(200).json({ success: true, data: updatedDynamicPrices[0] });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 删除动态价格规则
  async deleteDynamicPrice(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const affectedCount = await dynamicPriceService.deleteDynamicPrice(id);
      if (affectedCount === 0) {
        return res.status(404).json({ success: false, message: '动态价格规则不存在' });
      }
      res.status(200).json({ success: true, message: '动态价格规则已删除' });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 获取所有动态价格规则
  async getAllDynamicPrices(req: Request, res: Response) {
    try {
      const filters = req.query;
      const dynamicPrices = await dynamicPriceService.getAllDynamicPrices({
        menu_item_id: filters.menu_item_id ? parseInt(filters.menu_item_id as string) : undefined,
        price_type: filters.price_type as string | undefined,
        is_active: filters.is_active ? (filters.is_active as string).toLowerCase() === 'true' : undefined,
      });
      res.status(200).json({ success: true, data: dynamicPrices });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 计算动态价格
  async calculateDynamicPrice(req: Request, res: Response) {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      const context = req.body;
      const result = await dynamicPriceService.calculateDynamicPrice(menuItemId, context);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 批量计算动态价格
  async batchCalculateDynamicPrice(req: Request, res: Response) {
    try {
      const { menu_item_ids, context } = req.body;
      if (!Array.isArray(menu_item_ids) || menu_item_ids.length === 0) {
        return res.status(400).json({ success: false, message: '菜单项ID数组不能为空' });
      }
      const results = await dynamicPriceService.batchCalculateDynamicPrice(menu_item_ids, context);
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 激活/停用动态价格规则
  async toggleDynamicPriceStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { is_active } = req.body;
      const [affectedCount, updatedDynamicPrices] = await dynamicPriceService.toggleDynamicPriceStatus(id, is_active);
      if (affectedCount === 0) {
        return res.status(404).json({ success: false, message: '动态价格规则不存在' });
      }
      res.status(200).json({ success: true, data: updatedDynamicPrices[0] });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 获取动态价格规则统计
  async getDynamicPriceStats(req: Request, res: Response) {
    try {
      const stats = await dynamicPriceService.getDynamicPriceStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 训练AI价格预测模型
  async trainAIPriceModel(req: Request, res: Response) {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      const { historical_data } = req.body;
      
      if (!Array.isArray(historical_data)) {
        return res.status(400).json({ success: false, message: '历史数据必须是数组' });
      }

      const result = await dynamicPriceService.trainAIPriceModel(menuItemId, historical_data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 使用AI模型预测价格
  async predictPriceWithAI(req: Request, res: Response) {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      const { context, model_config } = req.body;

      const result = await dynamicPriceService.predictPriceWithAI(menuItemId, context, model_config);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // 批量训练AI模型
  async batchTrainAIModels(req: Request, res: Response) {
    try {
      const { training_jobs } = req.body;
      
      if (!Array.isArray(training_jobs)) {
        return res.status(400).json({ success: false, message: '训练任务必须是数组' });
      }

      const results = await dynamicPriceService.batchTrainAIModels(training_jobs);
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }
}

// 导出控制器实例
export const dynamicPriceController = new DynamicPriceController();
