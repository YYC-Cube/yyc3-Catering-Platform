/**
 * @file 个性化推荐服务
 * @description 实现基于用户历史的个性化推荐算法，包括协同过滤和内容推荐
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Recommendation } from '../models/Recommendation';
import { MenuItem } from '../models/MenuItem';
import { DishEntity } from '../models/DishEntity';
import { DataCollection } from '../models/DataCollection';
import { Op, sequelize } from 'sequelize';
import { knowledgeGraphService } from './KnowledgeGraphService';

/**
 * @class PersonalizedRecommendationService
 * @description 个性化推荐服务类，实现基于用户历史的个性化推荐算法
 *              支持协同过滤、内容推荐和混合推荐三种策略
 */
class PersonalizedRecommendationService {
  /**
   * 获取基于用户历史的个性化推荐
   * @param {string} userId 用户ID
   * @param {number} [limit=10] 返回推荐的数量
   * @param {string} [recommendationStrategy='hybrid'] 推荐策略: collaborative | content_based | hybrid
   * @returns {Promise<Recommendation[]>} 个性化推荐列表
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10,
    recommendationStrategy: 'collaborative' | 'content_based' | 'hybrid' = 'hybrid'
  ) {
    switch (recommendationStrategy) {
      case 'collaborative':
        return this.collaborativeFiltering(userId, limit);
      case 'content_based':
        return this.contentBasedRecommendation(userId, limit);
      case 'hybrid':
      default:
        return this.hybridRecommendation(userId, limit);
    }
  }

  /**
   * 协同过滤推荐算法
   * @param {string} userId 用户ID
   * @param {number} [limit=10] 返回推荐的数量
   * @returns {Promise<Recommendation[]>} 基于协同过滤的推荐列表
   */
  async collaborativeFiltering(userId: string, limit: number = 10) {
    // 获取当前用户喜欢的菜品（基于交互和订单）
    const userLikedItems = await Recommendation.findAll({
      where: {
        user_id: userId,
        is_interacted: true,
      },
      attributes: ['menu_item_id'],
      include: [MenuItem],
      limit: 20,
    });

    if (userLikedItems.length === 0) {
      // 如果用户没有历史交互，返回热门推荐
      return this.getPopularRecommendations(limit);
    }

    // 获取与当前用户有相似品味的其他用户
    const similarUsers = await sequelize.query(
      `
      SELECT r2.user_id as similar_user_id,
             COUNT(r2.menu_item_id) as common_items
      FROM recommendations r1
      JOIN recommendations r2 ON r1.menu_item_id = r2.menu_item_id AND r1.user_id != r2.user_id
      WHERE r1.user_id = :userId AND r1.is_interacted = true AND r2.is_interacted = true
      GROUP BY r2.user_id
      ORDER BY common_items DESC
      LIMIT 50
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (similarUsers.length === 0) {
      return this.contentBasedRecommendation(userId, limit);
    }

    // 获取相似用户喜欢的菜品
    const similarUserIds = (similarUsers as any[]).map(user => user.similar_user_id);
    const recommendedItems = await Recommendation.findAll({
      where: {
        user_id: { [Op.in]: similarUserIds },
        menu_item_id: { [Op.notIn]: userLikedItems.map(item => item.menu_item_id) },
        is_interacted: true,
      },
      attributes: [
        'menu_item_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'interaction_count'],
        [sequelize.fn('AVG', sequelize.col('score')), 'avg_score'],
      ],
      include: [MenuItem],
      group: ['menu_item_id', 'menu_item.id'],
      order: [
        [sequelize.literal('interaction_count'), 'DESC'],
        [sequelize.literal('avg_score'), 'DESC'],
      ],
      limit,
    });

    return recommendedItems;
  }

  // 基于内容的推荐
  async contentBasedRecommendation(userId: string, limit: number = 10) {
    // 获取用户历史交互的菜品
    const userInteractions = await Recommendation.findAll({
      where: {
        user_id: userId,
        is_interacted: true,
      },
      attributes: ['menu_item_id'],
      include: [{ model: MenuItem, include: [DishEntity] }],
      limit: 20,
    });

    if (userInteractions.length === 0) {
      return this.getPopularRecommendations(limit);
    }

    // 提取用户喜欢的菜品特征
    const tasteProfiles = new Set<string>();
    const cookingMethods = new Set<string>();
    const ingredients = new Set<string>();

    userInteractions.forEach(interaction => {
      const dishEntity = interaction.menu_item?.dishEntity;
      if (dishEntity) {
        if (dishEntity.tasteProfile) tasteProfiles.add(dishEntity.tasteProfile);
        if (dishEntity.cookingMethod) cookingMethods.add(dishEntity.cookingMethod);
        if (dishEntity.ingredients) {
          dishEntity.ingredients.forEach(ingredient => ingredients.add(ingredient));
        }
      }
    });

    // 查找具有相似特征的其他菜品
    const recommendedItems = await MenuItem.findAll({
      include: [
        {
          model: DishEntity,
          where: {
            [Op.or]: [
              tasteProfiles.size > 0 ? { tasteProfile: { [Op.in]: Array.from(tasteProfiles) } } : {},
              cookingMethods.size > 0 ? { cookingMethod: { [Op.in]: Array.from(cookingMethods) } } : {},
            ],
          },
        },
      ],
      where: {
        id: { [Op.notIn]: userInteractions.map(item => item.menu_item_id) },
      },
      limit,
      order: [['popularity_score', 'DESC']],
    });

    return recommendedItems;
  }

  // 混合推荐算法
  async hybridRecommendation(userId: string, limit: number = 10) {
    // 获取协同过滤和基于内容的推荐结果
    const collaborativeResults = await this.collaborativeFiltering(userId, limit * 2);
    const contentBasedResults = await this.contentBasedRecommendation(userId, limit * 2);

    // 合并结果并去重
    const resultMap = new Map<number, MenuItem>();

    // 为协同过滤结果赋予较高权重
    collaborativeResults.forEach((item, index) => {
      const menuItem = item.menu_item;
      if (menuItem) {
        // 添加权重因子
        (menuItem as any).recommendation_score = 2.0 / (index + 1);
        resultMap.set(menuItem.id, menuItem);
      }
    });

    // 添加基于内容的推荐结果
    contentBasedResults.forEach((item, index) => {
      const menuItem = item;
      if (!resultMap.has(menuItem.id)) {
        (menuItem as any).recommendation_score = 1.0 / (index + 1);
        resultMap.set(menuItem.id, menuItem);
      }
    });

    // 按权重排序并返回
    const sortedResults = Array.from(resultMap.values())
      .sort((a, b) => (b as any).recommendation_score - (a as any).recommendation_score)
      .slice(0, limit);

    return sortedResults;
  }

  // 热门推荐
  async getPopularRecommendations(limit: number = 10) {
    return MenuItem.findAll({
      include: [DishEntity],
      order: [['popularity_score', 'DESC']],
      limit,
    });
  }

  // 新菜推荐
  async getNewArrivals(limit: number = 10) {
    return MenuItem.findAll({
      include: [DishEntity],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  // 保存用户交互记录
  async saveUserInteraction(
    userId: string,
    menuItemId: number,
    interactionType: 'click' | 'order' | 'view' | 'add_to_cart'
  ) {
    let recommendation = await Recommendation.findOne({
      where: {
        user_id: userId,
        menu_item_id: menuItemId,
      },
    });

    if (recommendation) {
      // 更新现有记录
      const updateData: any = {
        is_interacted: true,
      };

      if (interactionType === 'click') {
        updateData.click_count = sequelize.literal('click_count + 1');
      } else if (interactionType === 'order') {
        updateData.order_count = sequelize.literal('order_count + 1');
        updateData.score = 5.0; // 订单给予最高评分
      }

      await recommendation.update(updateData);
    } else {
      // 创建新记录
      await Recommendation.create({
        user_id: userId,
        menu_item_id: menuItemId,
        recommendation_type: 'personalized',
        score: interactionType === 'order' ? 5.0 : 1.0,
        rank: 0,
        is_interacted: true,
        is_active: true,
        click_count: interactionType === 'click' ? 1 : 0,
        order_count: interactionType === 'order' ? 1 : 0,
      });
    }
  }

  // 获取用户的推荐历史
  async getUserRecommendationHistory(userId: string, limit: number = 50) {
    return Recommendation.findAll({
      where: {
        user_id: userId,
      },
      include: [MenuItem],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  // 基于用户浏览历史的实时推荐
  async getRealTimeRecommendations(userId: string, browsingHistory: number[], limit: number = 10) {
    if (browsingHistory.length === 0) {
      return this.getPopularRecommendations(limit);
    }

    // 获取最近浏览的菜品
    const recentItems = await MenuItem.findAll({
      where: {
        id: { [Op.in]: browsingHistory.slice(-10) },
      },
      include: [DishEntity],
    });

    if (recentItems.length === 0) {
      return this.getPopularRecommendations(limit);
    }

    // 提取浏览菜品的特征
    const tasteProfiles = new Set<string>();
    const cookingMethods = new Set<string>();
    const ingredients = new Set<string>();

    recentItems.forEach(item => {
      const dishEntity = item.dishEntity;
      if (dishEntity) {
        if (dishEntity.tasteProfile) tasteProfiles.add(dishEntity.tasteProfile);
        if (dishEntity.cookingMethod) cookingMethods.add(dishEntity.cookingMethod);
        if (dishEntity.ingredients) {
          dishEntity.ingredients.forEach(ingredient => ingredients.add(ingredient));
        }
      }
    });

    // 查找具有相似特征的其他菜品
    return MenuItem.findAll({
      include: [
        {
          model: DishEntity,
          where: {
            [Op.or]: [
              tasteProfiles.size > 0 ? { tasteProfile: { [Op.in]: Array.from(tasteProfiles) } } : {},
              cookingMethods.size > 0 ? { cookingMethod: { [Op.in]: Array.from(cookingMethods) } } : {},
            ],
          },
        },
      ],
      where: {
        id: { [Op.notIn]: browsingHistory },
      },
      limit,
      order: [['popularity_score', 'DESC']],
    });
  }

  // 清理过期推荐
  async cleanupExpiredRecommendations() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Recommendation.destroy({
      where: {
        createdAt: { [Op.lt]: thirtyDaysAgo },
        is_interacted: false,
      },
    });
  }
}

// 导出服务实例
export const personalizedRecommendationService = new PersonalizedRecommendationService();
