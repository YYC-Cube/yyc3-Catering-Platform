/**
 * @file 知识图谱服务
 * @description 实现菜品知识图谱的核心功能，包括实体管理、关系管理、图谱查询等
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { DishEntity } from '../models/DishEntity';
import { RelationshipType } from '../models/RelationshipType';
import { EntityRelationship } from '../models/EntityRelationship';
import { KnowledgeGraphQuery } from '../models/KnowledgeGraphQuery';
import { MenuItem } from '../models/MenuItem';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

class KnowledgeGraphService {
  // 创建菜品实体
  async createDishEntity(data: {
    name: string;
    type: string;
    description?: string;
    nutritionInfo?: any;
    ingredients?: string[];
    cookingMethod?: string;
    tasteProfile?: string;
    menuItemId?: string;
  }) {
    const { menuItemId, ...entityData } = data;
    
    const transaction = await sequelize.transaction();
    
    try {
      const entity = await DishEntity.create(entityData, { transaction });
      
      // 如果提供了菜单项ID，建立关联
      if (menuItemId) {
        const menuItem = await MenuItem.findByPk(menuItemId, { transaction });
        if (menuItem) {
          await menuItem.update({ knowledge_graph_entity_id: entity.id }, { transaction });
        }
      }
      
      await transaction.commit();
      return entity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // 获取菜品实体
  async getDishEntity(id: string) {
    return DishEntity.findByPk(id, {
      include: [
        { model: EntityRelationship, as: 'outgoingRelationships' },
        { model: EntityRelationship, as: 'incomingRelationships' },
      ],
    });
  }
  
  // 更新菜品实体
  async updateDishEntity(id: string, data: Partial<DishEntity>) {
    return DishEntity.update(data, { where: { id }, returning: true });
  }
  
  // 删除菜品实体
  async deleteDishEntity(id: string) {
    return DishEntity.destroy({ where: { id } });
  }
  
  // 搜索菜品实体
  async searchDishEntities(query: string) {
    return DishEntity.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { tasteProfile: { [Op.like]: `%${query}%` } },
        ],
      },
    });
  }
  
  // 创建关系类型
  async createRelationshipType(name: string, description?: string) {
    return RelationshipType.create({ name, description });
  }
  
  // 获取所有关系类型
  async getRelationshipTypes() {
    return RelationshipType.findAll();
  }
  
  // 创建实体关系
  async createRelationship(data: {
    sourceEntityId: string;
    targetEntityId: string;
    relationshipTypeId: string;
    description?: string;
  }) {
    return EntityRelationship.create(data);
  }
  
  // 删除实体关系
  async deleteRelationship(id: string) {
    return EntityRelationship.destroy({ where: { id } });
  }
  
  // 获取实体的关系网络
  async getEntityNetwork(entityId: string, depth: number = 2) {
    const entity = await this.getDishEntity(entityId);
    if (!entity) return null;
    
    // 使用递归实现深度查询
    const visitedEntities = new Set<string>();
    const allRelations: any[] = [];
    const allEntities: any[] = [];
    
    // 递归查询函数
    async function traverse(entityId: string, currentDepth: number) {
      if (currentDepth > depth || visitedEntities.has(entityId)) {
        return;
      }
      
      visitedEntities.add(entityId);
      
      // 获取当前实体
      const currentEntity = await DishEntity.findByPk(entityId);
      if (currentEntity) {
        allEntities.push(currentEntity);
      }
      
      // 获取所有外出关系
      const outgoingRelations = await EntityRelationship.findAll({
        where: { sourceEntityId: entityId },
        include: [
          { model: DishEntity, as: 'targetEntity' },
          { model: RelationshipType },
        ],
      });
      
      // 获取所有进入关系
      const incomingRelations = await EntityRelationship.findAll({
        where: { targetEntityId: entityId },
        include: [
          { model: DishEntity, as: 'sourceEntity' },
          { model: RelationshipType },
        ],
      });
      
      // 添加到结果集
      allRelations.push(...outgoingRelations, ...incomingRelations);
      
      // 递归查询下一层
      for (const rel of outgoingRelations) {
        await traverse(rel.targetEntityId, currentDepth + 1);
      }
      
      for (const rel of incomingRelations) {
        await traverse(rel.sourceEntityId, currentDepth + 1);
      }
    }
    
    // 开始递归查询
    await traverse(entityId, 1);
    
    // 去重关系
    const uniqueRelations = Array.from(new Map(allRelations.map(item => [item.id, item])).values());
    
    return {
      entity,
      entities: Array.from(new Map(allEntities.map(item => [item.id, item])).values()),
      relationships: uniqueRelations,
    };
  }
  
  // 基于知识图谱的推荐
  async getRecommendationsBasedOnGraph(userId: string, entityId: string, limit: number = 5) {
    // 简单实现：基于口味和烹饪方法相似性推荐
    const entity = await this.getDishEntity(entityId);
    if (!entity) return [];
    
    // 查找具有相同口味或烹饪方法的其他实体
    const similarEntities = await DishEntity.findAll({
      where: {
        id: { [Op.ne]: entityId },
        [Op.or]: [
          { tasteProfile: entity.tasteProfile },
          { cookingMethod: entity.cookingMethod },
        ],
      },
      limit,
    });
    
    return similarEntities;
  }
  
  // 保存查询历史
  async saveQueryHistory(queryText: string, queryResults: any, executionTime: number) {
    return KnowledgeGraphQuery.create({ queryText, queryResults, executionTime });
  }
  
  // 获取查询历史
  async getQueryHistory(limit: number = 10) {
    return KnowledgeGraphQuery.findAll({
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
  
  // 图谱可视化数据
  async getGraphVisualizationData() {
    const entities = await DishEntity.findAll();
    const relationships = await EntityRelationship.findAll({
      include: [{ model: RelationshipType }],
    });
    
    return {
      nodes: entities.map(entity => ({
        id: entity.id,
        label: entity.name,
        type: entity.type,
        attributes: {
          tasteProfile: entity.tasteProfile,
          cookingMethod: entity.cookingMethod,
        },
      })),
      edges: relationships.map(rel => ({
        id: rel.id,
        source: rel.sourceEntityId,
        target: rel.targetEntityId,
        label: rel.relationshipType?.name,
        description: rel.description,
      })),
    };
  }
  
  // 初始化默认关系类型
  async initializeDefaultRelationshipTypes() {
    const defaultTypes = [
      { name: '相似口味', description: '具有相似口味特征的菜品' },
      { name: '相似烹饪方法', description: '使用相似烹饪方法的菜品' },
      { name: '搭配推荐', description: '推荐一起食用的菜品' },
      { name: '替代菜品', description: '可以互相替代的菜品' },
      { name: '包含配料', description: '包含相同或相似配料的菜品' },
      { name: '营养互补', description: '营养成分互补的菜品' },
    ];
    
    for (const type of defaultTypes) {
      await RelationshipType.findOrCreate({ where: { name: type.name }, defaults: type });
    }
  }
}

// 导出服务实例
export const knowledgeGraphService = new KnowledgeGraphService();
