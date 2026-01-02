/**
 * @file 知识图谱控制器
 * @description 处理菜品知识图谱相关的API请求
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Request, Response } from 'express';
import { knowledgeGraphService } from '../services/KnowledgeGraphService';
import { logger } from '../config/logger';

class KnowledgeGraphController {
  // 创建菜品实体
  async createDishEntity(req: Request, res: Response) {
    try {
      const entity = await knowledgeGraphService.createDishEntity(req.body);
      res.status(201).json({ success: true, data: entity });
    } catch (error) {
      logger.error('创建菜品实体失败:', error);
      res.status(400).json({ success: false, error: '创建菜品实体失败' });
    }
  }
  
  // 获取菜品实体
  async getDishEntity(req: Request, res: Response) {
    try {
      const entity = await knowledgeGraphService.getDishEntity(req.params.id);
      if (!entity) {
        return res.status(404).json({ success: false, error: '菜品实体不存在' });
      }
      res.json({ success: true, data: entity });
    } catch (error) {
      logger.error('获取菜品实体失败:', error);
      res.status(500).json({ success: false, error: '获取菜品实体失败' });
    }
  }
  
  // 更新菜品实体
  async updateDishEntity(req: Request, res: Response) {
    try {
      const [updatedRows, [updatedEntity]] = await knowledgeGraphService.updateDishEntity(
        req.params.id,
        req.body
      );
      
      if (updatedRows === 0) {
        return res.status(404).json({ success: false, error: '菜品实体不存在' });
      }
      
      res.json({ success: true, data: updatedEntity });
    } catch (error) {
      logger.error('更新菜品实体失败:', error);
      res.status(400).json({ success: false, error: '更新菜品实体失败' });
    }
  }
  
  // 删除菜品实体
  async deleteDishEntity(req: Request, res: Response) {
    try {
      const deletedRows = await knowledgeGraphService.deleteDishEntity(req.params.id);
      
      if (deletedRows === 0) {
        return res.status(404).json({ success: false, error: '菜品实体不存在' });
      }
      
      res.json({ success: true, message: '菜品实体已删除' });
    } catch (error) {
      logger.error('删除菜品实体失败:', error);
      res.status(500).json({ success: false, error: '删除菜品实体失败' });
    }
  }
  
  // 搜索菜品实体
  async searchDishEntities(req: Request, res: Response) {
    try {
      const query = req.query.q as string || '';
      const entities = await knowledgeGraphService.searchDishEntities(query);
      res.json({ success: true, data: entities });
    } catch (error) {
      logger.error('搜索菜品实体失败:', error);
      res.status(500).json({ success: false, error: '搜索菜品实体失败' });
    }
  }
  
  // 创建关系类型
  async createRelationshipType(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const type = await knowledgeGraphService.createRelationshipType(name, description);
      res.status(201).json({ success: true, data: type });
    } catch (error) {
      logger.error('创建关系类型失败:', error);
      res.status(400).json({ success: false, error: '创建关系类型失败' });
    }
  }
  
  // 获取所有关系类型
  async getRelationshipTypes(req: Request, res: Response) {
    try {
      const types = await knowledgeGraphService.getRelationshipTypes();
      res.json({ success: true, data: types });
    } catch (error) {
      logger.error('获取关系类型失败:', error);
      res.status(500).json({ success: false, error: '获取关系类型失败' });
    }
  }
  
  // 创建实体关系
  async createRelationship(req: Request, res: Response) {
    try {
      const relationship = await knowledgeGraphService.createRelationship(req.body);
      res.status(201).json({ success: true, data: relationship });
    } catch (error) {
      logger.error('创建实体关系失败:', error);
      res.status(400).json({ success: false, error: '创建实体关系失败' });
    }
  }
  
  // 删除实体关系
  async deleteRelationship(req: Request, res: Response) {
    try {
      const deletedRows = await knowledgeGraphService.deleteRelationship(req.params.id);
      
      if (deletedRows === 0) {
        return res.status(404).json({ success: false, error: '实体关系不存在' });
      }
      
      res.json({ success: true, message: '实体关系已删除' });
    } catch (error) {
      logger.error('删除实体关系失败:', error);
      res.status(500).json({ success: false, error: '删除实体关系失败' });
    }
  }
  
  // 获取实体的关系网络
  async getEntityNetwork(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const depth = parseInt(req.query.depth as string) || 2;
      
      const network = await knowledgeGraphService.getEntityNetwork(id, depth);
      
      if (!network) {
        return res.status(404).json({ success: false, error: '菜品实体不存在' });
      }
      
      res.json({ success: true, data: network });
    } catch (error) {
      logger.error('获取实体关系网络失败:', error);
      res.status(500).json({ success: false, error: '获取实体关系网络失败' });
    }
  }
  
  // 基于知识图谱的推荐
  async getRecommendations(req: Request, res: Response) {
    try {
      const { userId, entityId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const recommendations = await knowledgeGraphService.getRecommendationsBasedOnGraph(userId, entityId, limit);
      res.json({ success: true, data: recommendations });
    } catch (error) {
      logger.error('获取知识图谱推荐失败:', error);
      res.status(500).json({ success: false, error: '获取知识图谱推荐失败' });
    }
  }
  
  // 获取图谱可视化数据
  async getGraphVisualization(req: Request, res: Response) {
    try {
      const data = await knowledgeGraphService.getGraphVisualizationData();
      res.json({ success: true, data });
    } catch (error) {
      logger.error('获取图谱可视化数据失败:', error);
      res.status(500).json({ success: false, error: '获取图谱可视化数据失败' });
    }
  }
  
  // 初始化默认数据
  async initializeDefaultData(req: Request, res: Response) {
    try {
      await knowledgeGraphService.initializeDefaultRelationshipTypes();
      res.json({ success: true, message: '默认数据初始化完成' });
    } catch (error) {
      logger.error('初始化默认数据失败:', error);
      res.status(500).json({ success: false, error: '初始化默认数据失败' });
    }
  }
}

// 导出控制器实例
export const knowledgeGraphController = new KnowledgeGraphController();
