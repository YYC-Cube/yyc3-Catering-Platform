/**
 * @file 知识图谱路由
 * @description 定义菜品知识图谱相关的API路由
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Router } from 'express';
import { knowledgeGraphController } from '../controllers/KnowledgeGraphController';

const router = Router();

// 菜品实体管理
router.post('/entities', knowledgeGraphController.createDishEntity);
router.get('/entities/:id', knowledgeGraphController.getDishEntity);
router.put('/entities/:id', knowledgeGraphController.updateDishEntity);
router.delete('/entities/:id', knowledgeGraphController.deleteDishEntity);
router.get('/entities', knowledgeGraphController.searchDishEntities);

// 关系类型管理
router.post('/relationship-types', knowledgeGraphController.createRelationshipType);
router.get('/relationship-types', knowledgeGraphController.getRelationshipTypes);

// 实体关系管理
router.post('/relationships', knowledgeGraphController.createRelationship);
router.delete('/relationships/:id', knowledgeGraphController.deleteRelationship);

// 实体关系网络
router.get('/entities/:id/network', knowledgeGraphController.getEntityNetwork);

// 知识图谱推荐
router.get('/recommendations/:userId/:entityId', knowledgeGraphController.getRecommendations);

// 图谱可视化
router.get('/visualization', knowledgeGraphController.getGraphVisualization);

// 初始化默认数据
router.post('/initialize', knowledgeGraphController.initializeDefaultData);

export default router;
