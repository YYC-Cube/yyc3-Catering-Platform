/**
 * @file 菜品服务
 * @description 处理菜品的业务逻辑
 * @module services/MenuItemService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { MenuItem } from '../models/MenuItem';
import { MenuItemOption } from '../models/MenuItemOption';
import { MenuItemImage } from '../models/MenuItemImage';
import { MenuItemTag } from '../models/MenuItemTag';
import { Tag } from '../models/Tag';
import { Recommendation } from '../models/Recommendation';
import { DynamicPrice } from '../models/DynamicPrice';
import { Recommendation } from '../models/Recommendation';
import logger from '../config/logger';
import { Op, Optional } from 'sequelize';
import moment from 'moment';

/**
 * 创建菜品参数接口
 */
export interface CreateMenuItemParams {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  stock: number;
  category_id: number;
  is_popular?: boolean;
  is_recommend?: boolean;
  is_new?: boolean;
  is_active?: boolean;
  cover_image_url?: string;
  nutrients?: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
  };
  taste_tags?: string;
  preparation_time?: number;
  origin?: string;
  options?: {
    option_type: string;
    name: string;
    price_difference: number;
    sort_order: number;
    is_default?: boolean;
    is_required?: boolean;
  }[];
  images?: {
    image_url: string;
    image_type: string;
    sort_order: number;
    is_cover?: boolean;
  }[];
  tags?: number[];
}

/**
 * 菜品服务类
 */
// 用户画像类
class UserProfile {
  userId: number;
  preferences: Record<string, number>;
  orderHistory: number[];
  browsingHistory: number[];
  demographicInfo: Record<string, any>;
  behavioralPatterns: Record<string, any>;
  interactionHistory: Record<string, any>;

  constructor(userId: number) {
    this.userId = userId;
    this.preferences = {};
    this.orderHistory = [];
    this.browsingHistory = [];
    this.demographicInfo = {};
    this.behavioralPatterns = {};
    this.interactionHistory = {};
  }

  // 更新用户偏好
  updatePreferences(itemId: number, weight: number = 1): void {
    this.preferences[itemId] = (this.preferences[itemId] || 0) + weight;
  }

  // 更新订单历史
  updateOrderHistory(itemIds: number[]): void {
    this.orderHistory = [...this.orderHistory, ...itemIds].slice(-100); // 保留最近100个订单
  }

  // 更新浏览历史
  updateBrowsingHistory(itemId: number): void {
    // 移除重复项并保持最近浏览的在前面
    this.browsingHistory = [itemId, ...this.browsingHistory.filter(id => id !== itemId)].slice(-50); // 保留最近50个浏览
  }

  // 获取用户画像数据
  getProfileData(): Record<string, any> {
    return {
      userId: this.userId,
      preferences: this.preferences,
      orderHistory: this.orderHistory,
      browsingHistory: this.browsingHistory,
      demographicInfo: this.demographicInfo,
      behavioralPatterns: this.behavioralPatterns,
      interactionHistory: this.interactionHistory
    };
  }

  // 计算用户偏好相似度
  calculateSimilarity(otherProfile: UserProfile): number {
    // 使用余弦相似度计算用户偏好相似度
    const commonItems = new Set([...Object.keys(this.preferences), ...Object.keys(otherProfile.preferences)]);
    if (commonItems.size === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const itemId of commonItems) {
      const a = this.preferences[itemId] || 0;
      const b = otherProfile.preferences[itemId] || 0;
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// 深度学习推荐模型类
class DeepLearningRecommendationModel {
  modelVersion: string;
  trainedAt: Date;
  featureWeights: Record<string, number>;
  userProfiles: Map<number, UserProfile>;

  constructor() {
    this.modelVersion = '2.0.0';
    this.trainedAt = new Date();
    this.featureWeights = {
      // 基础特征权重
      orderFrequency: 0.3,
      browsingFrequency: 0.2,
      interactionScore: 0.25,
      similarityScore: 0.15,
      contextMatch: 0.1
    };
    this.userProfiles = new Map<number, UserProfile>();
  }

  // 获取或创建用户画像
  getUserProfile(userId: number): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, new UserProfile(userId));
    }
    return this.userProfiles.get(userId)!;
  }

  // 更新用户画像
  updateUserProfile(userId: number, data: Partial<UserProfile>): void {
    const profile = this.getUserProfile(userId);
    
    if (data.preferences) {
      Object.assign(profile.preferences, data.preferences);
    }
    if (data.orderHistory) {
      profile.updateOrderHistory(data.orderHistory);
    }
    if (data.browsingHistory) {
      data.browsingHistory.forEach(itemId => profile.updateBrowsingHistory(itemId));
    }
    if (data.demographicInfo) {
      Object.assign(profile.demographicInfo, data.demographicInfo);
    }
    if (data.behavioralPatterns) {
      Object.assign(profile.behavioralPatterns, data.behavioralPatterns);
    }
    if (data.interactionHistory) {
      Object.assign(profile.interactionHistory, data.interactionHistory);
    }
  }

  // 训练模型
  trainModel(trainingData: Record<string, any>[]): void {
    // 简化版模型训练，实际项目中可以替换为真实的机器学习模型
    logger.info(`训练推荐模型，使用 ${trainingData.length} 条数据`);
    
    // 计算特征权重（这里使用简单的统计方法）
    const featureCounts: Record<string, number> = {};
    const totalCount = trainingData.length;

    trainingData.forEach(data => {
      if (data.orderCount) featureCounts.orderCount = (featureCounts.orderCount || 0) + data.orderCount;
      if (data.clickCount) featureCounts.clickCount = (featureCounts.clickCount || 0) + data.clickCount;
      if (data.browsingCount) featureCounts.browsingCount = (featureCounts.browsingCount || 0) + data.browsingCount;
    });

    // 归一化权重
    const sumWeights = Object.values(featureCounts).reduce((sum, count) => sum + count, 0);
    if (sumWeights > 0) {
      this.featureWeights = Object.fromEntries(
        Object.entries(featureCounts).map(([feature, count]) => [feature, count / sumWeights])
      );
    }

    this.trainedAt = new Date();
    logger.info('推荐模型训练完成');
  }

  // 预测推荐分数
  predictScore(
    userId: number,
    menuItemId: number,
    context: Record<string, any> = {}
  ): number {
    const userProfile = this.getUserProfile(userId);
    
    // 计算基础分数
    let score = 0;
    
    // 订单历史分数
    const orderWeight = userProfile.orderHistory.filter(id => id === menuItemId).length;
    score += orderWeight * this.featureWeights.orderFrequency;
    
    // 浏览历史分数
    const browseWeight = userProfile.browsingHistory.filter(id => id === menuItemId).length;
    score += browseWeight * this.featureWeights.browsingFrequency;
    
    // 偏好分数
    score += (userProfile.preferences[menuItemId] || 0) * 0.05;
    
    // 上下文匹配分数
    if (context.time_of_day && context.time_of_day === 'lunch') {
      score += 0.1; // 午餐时段的菜品额外加分
    }
    
    // 多样性调整
    score += Math.random() * 0.1; // 添加一些随机性以增加多样性
    
    return Math.max(0, score);
  }

  // 批量预测分数
  predictBatchScores(
    userId: number,
    menuItemIds: number[],
    context: Record<string, any> = {}
  ): Record<number, number> {
    const scores: Record<number, number> = {};
    
    menuItemIds.forEach(itemId => {
      scores[itemId] = this.predictScore(userId, itemId, context);
    });
    
    return scores;
  }
}

export class MenuItemService {
  private recommendationModel: DeepLearningRecommendationModel;

  constructor() {
    this.recommendationModel = new DeepLearningRecommendationModel();
  }

  /**
   * 创建菜品
   * @param params 菜品参数
   * @returns 创建的菜品
   */
  async createMenuItem(params: CreateMenuItemParams): Promise<MenuItem> {
    try {
      const { options, images, tags, ...menuItemData } = params;

      // 创建菜品
      const menuItem = await MenuItem.create(menuItemData);

      // 创建菜品选项
      if (options && options.length > 0) {
        const menuItemOptions = options.map(option => ({
          menu_item_id: menuItem.id,
          ...option
        }));
        await MenuItemOption.bulkCreate(menuItemOptions);
      }

      // 创建菜品图片
      if (images && images.length > 0) {
        const menuItemImages = images.map(image => ({
          menu_item_id: menuItem.id,
          ...image
        })) as Optional<MenuItemImage, 'id'>[];
        await MenuItemImage.bulkCreate(menuItemImages);
      }

      // 创建菜品标签关联
      if (tags && tags.length > 0) {
        const menuItemTags = tags.map(tagId => ({
          menu_item_id: menuItem.id,
          tag_id: tagId
        })) as Optional<MenuItemTag, 'id'>[];
        await MenuItemTag.bulkCreate(menuItemTags);
      }

      logger.info(`创建菜品成功: ${menuItem.id} - ${menuItem.name}`);
      return menuItem;
    } catch (error) {
      logger.error('创建菜品失败:', error);
      throw error;
    }
  }

  /**
   * 获取菜品列表
   * @param params 查询参数
   * @returns 菜品列表
   */
  async getMenuItems(params: {
    categoryId?: number;
    keyword?: string;
    isActive?: boolean;
    isPopular?: boolean;
    isRecommend?: boolean;
    isNew?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ menuItems: MenuItem[]; total: number }> {
    try {
      const { 
        categoryId, keyword, isActive, isPopular, isRecommend, isNew, 
        minPrice, maxPrice, page = 1, limit = 20 
      } = params;
      const offset = (page - 1) * limit;

      const where: any = {};

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (isActive !== undefined) {
        where.is_active = isActive;
      }

      if (isPopular !== undefined) {
        where.is_popular = isPopular;
      }

      if (isRecommend !== undefined) {
        where.is_recommend = isRecommend;
      }

      if (isNew !== undefined) {
        where.is_new = isNew;
      }

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      if (minPrice !== undefined) {
        where.price = { ...where.price, [Op.gte]: minPrice };
      }

      if (maxPrice !== undefined) {
        where.price = { ...where.price, [Op.lte]: maxPrice };
      }

      const { count, rows } = await MenuItem.findAndCountAll({
        where,
        offset,
        limit,
        order: [['sales', 'DESC'], ['id', 'ASC']],
        include: [
          { model: MenuItemOption, separate: true, order: [['sort_order', 'ASC']] },
          { model: MenuItemImage, separate: true, order: [['sort_order', 'ASC']] },
          { 
            model: MenuItemTag, 
            separate: true,
            include: [{ model: Tag }]
          }
        ]
      });

      logger.info(`获取菜品列表成功，共 ${count} 条记录`);
      return { menuItems: rows, total: count };
    } catch (error) {
      logger.error('获取菜品列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取菜品详情
   * @param id 菜品ID
   * @returns 菜品详情
   */
  async getMenuItemById(id: number): Promise<MenuItem | null> {
    try {
      const menuItem = await MenuItem.findByPk(id, {
        include: [
          { model: MenuItemOption, order: [['sort_order', 'ASC']] },
          { model: MenuItemImage, order: [['sort_order', 'ASC']] },
          { 
            model: MenuItemTag, 
            include: [{ model: Tag }]
          }
        ]
      });
      return menuItem;
    } catch (error) {
      logger.error(`获取菜品详情失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 更新菜品
   * @param id 菜品ID
   * @param params 更新参数
   * @returns 更新后的菜品
   */
  async updateMenuItem(id: number, params: Partial<CreateMenuItemParams>): Promise<MenuItem | null> {
    try {
      const { options, images, tags, ...menuItemData } = params;
      const menuItem = await MenuItem.findByPk(id);

      if (!menuItem) {
        return null;
      }

      // 更新菜品基本信息
      await menuItem.update(menuItemData);

      // 更新菜品选项
      if (options !== undefined) {
        // 删除现有选项
        await MenuItemOption.destroy({ where: { menu_item_id: id } });
        // 创建新选项
        if (options.length > 0) {
          const menuItemOptions = options.map(option => ({
            menu_item_id: id,
            ...option
          }));
          await MenuItemOption.bulkCreate(menuItemOptions);
        }
      }

      // 更新菜品图片
      if (images !== undefined) {
        // 删除现有图片
        await MenuItemImage.destroy({ where: { menu_item_id: id } });
        // 创建新图片
        if (images.length > 0) {
          const menuItemImages = images.map(image => ({
            menu_item_id: id,
            ...image
          })) as Optional<MenuItemImage, 'id'>[];
          await MenuItemImage.bulkCreate(menuItemImages);
        }
      }

      // 更新菜品标签
      if (tags !== undefined) {
        // 删除现有标签关联
        await MenuItemTag.destroy({ where: { menu_item_id: id } });
        // 创建新标签关联
        if (tags.length > 0) {
          const menuItemTags = tags.map(tagId => ({
            menu_item_id: id,
            tag_id: tagId
          })) as Optional<MenuItemTag, 'id'>[];
          await MenuItemTag.bulkCreate(menuItemTags);
        }
      }

      logger.info(`更新菜品成功: ${id} - ${menuItem.name}`);
      return menuItem;
    } catch (error) {
      logger.error(`更新菜品失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 删除菜品
   * @param id 菜品ID
   * @returns 是否删除成功
   */
  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      const menuItem = await MenuItem.findByPk(id);
      if (!menuItem) {
        return false;
      }

      // 级联删除相关数据
      await MenuItemOption.destroy({ where: { menu_item_id: id } });
      await MenuItemImage.destroy({ where: { menu_item_id: id } });
      await MenuItemTag.destroy({ where: { menu_item_id: id } });
      await menuItem.destroy();

      logger.info(`删除菜品成功: ${id} - ${menuItem.name}`);
      return true;
    } catch (error) {
      logger.error(`删除菜品失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 更新菜品状态
   * @param id 菜品ID
   * @param isActive 是否激活
   * @returns 更新后的菜品
   */
  async updateMenuItemStatus(id: number, isActive: boolean): Promise<MenuItem | null> {
    try {
      return await this.updateMenuItem(id, { is_active: isActive });
    } catch (error) {
      logger.error(`更新菜品状态失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 更新菜品库存
   * @param id 菜品ID
   * @param stock 库存数量
   * @returns 更新后的菜品
   */
  async updateMenuItemStock(id: number, stock: number): Promise<MenuItem | null> {
    try {
      return await this.updateMenuItem(id, { stock });
    } catch (error) {
      logger.error(`更新菜品库存失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 增加菜品销量
   * @param id 菜品ID
   * @param quantity 销量数量
   * @returns 更新后的菜品
   */
  async incrementMenuItemSales(id: number, quantity: number): Promise<MenuItem | null> {
    try {
      const menuItem = await MenuItem.findByPk(id);
      if (!menuItem) {
        return null;
      }

      menuItem.sales += quantity;
      await menuItem.save();
      return menuItem;
    } catch (error) {
      logger.error(`增加菜品销量失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 创建动态价格规则
   * @param params 动态价格参数
   * @returns 创建的动态价格
   */
  async createDynamicPrice(params: {
    menu_item_id: number;
    dynamic_price: number;
    price_type: 'time_based' | 'demand_based' | 'user_segment' | 'promotion' | 'special_event';
    rule_config: any;
    is_active: boolean;
    start_time?: Date;
    end_time?: Date;
  }): Promise<DynamicPrice> {
    try {
      const dynamicPrice = await DynamicPrice.create(params);
      logger.info(`创建动态价格规则成功: ${dynamicPrice.id} - 菜品ID: ${dynamicPrice.menu_item_id}`);
      return dynamicPrice;
    } catch (error) {
      logger.error('创建动态价格规则失败:', error);
      throw error;
    }
  }

  /**
   * 获取菜品的所有动态价格规则
   * @param menuItemId 菜品ID
   * @returns 动态价格规则列表
   */
  async getDynamicPricesByMenuItemId(menuItemId: number): Promise<DynamicPrice[]> {
    try {
      return await DynamicPrice.findAll({
        where: { menu_item_id: menuItemId },
        order: [['is_active', 'DESC'], ['created_at', 'DESC']]
      });
    } catch (error) {
      logger.error(`获取菜品动态价格规则失败: ${menuItemId}`, error);
      throw error;
    }
  }

  /**
   * 获取当前有效的动态价格
   * @param menuItemId 菜品ID
   * @param context 上下文信息（如时间、用户类型等）
   * @returns 当前有效的动态价格或null
   */
  async getCurrentDynamicPrice(menuItemId: number, context: any = {}): Promise<DynamicPrice | null> {
    try {
      const now = moment();
      const dynamicPrices = await DynamicPrice.findAll({
        where: {
          menu_item_id: menuItemId,
          is_active: true,
          [Op.and]: [
            {
              [Op.or]: [
                { effective_from: null },
                { effective_from: { [Op.lte]: now.toDate() } }
              ]
            },
            {
              [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: now.toDate() } }
              ]
            }
          ]
        }
      });

      // 根据规则配置和上下文信息匹配最佳动态价格
      for (const dynamicPrice of dynamicPrices) {
        const { rule_config } = dynamicPrice;
        let isMatch = true;

        // 时间规则匹配
        if (rule_config.start_time && rule_config.end_time) {
          // 检查时间段
          const currentHour = now.hour();
          const currentMinute = now.minute();
          const currentTime = currentHour * 60 + currentMinute;
          
          const [startHour, startMinute] = rule_config.start_time.split(':').map(Number);
          const [endHour, endMinute] = rule_config.end_time.split(':').map(Number);
          const startTime = startHour * 60 + startMinute;
          const endTime = endHour * 60 + endMinute;
          
          if (startTime <= endTime) {
            isMatch = currentTime >= startTime && currentTime <= endTime;
          } else {
            // 跨天的时间段
            isMatch = currentTime >= startTime || currentTime <= endTime;
          }
        }
        
        // 星期几规则匹配
        if (isMatch && rule_config.day_of_week && rule_config.day_of_week.length > 0) {
          if (!rule_config.day_of_week.includes(now.day())) {
            isMatch = false;
          }
        }

        // 用户类型规则匹配
        if (isMatch && rule_config.user_segment && context.user_type) {
          isMatch = rule_config.user_segment.includes(context.user_type);
        }

        if (isMatch) {
          return dynamicPrice;
        }
      }

      return null;
    } catch (error) {
      logger.error(`获取当前有效动态价格失败: ${menuItemId}`, error);
      throw error;
    }
  }

  /**
   * 更新动态价格规则
   * @param id 动态价格ID
   * @param params 更新参数
   * @returns 更新后的动态价格
   */
  async updateDynamicPrice(id: number, params: Partial<{
    dynamic_price?: number;
    price_type?: 'time_based' | 'demand_based' | 'user_segment' | 'promotion' | 'special_event';
    rule_config?: any;
    is_active?: boolean;
    start_time?: Date | null;
    end_time?: Date | null;
  }>): Promise<DynamicPrice | null> {
    try {
      const dynamicPrice = await DynamicPrice.findByPk(id);
      if (!dynamicPrice) {
        return null;
      }

      await dynamicPrice.update(params);
      logger.info(`更新动态价格规则成功: ${id}`);
      return dynamicPrice;
    } catch (error) {
      logger.error(`更新动态价格规则失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 删除动态价格规则
   * @param id 动态价格ID
   * @returns 是否删除成功
   */
  async deleteDynamicPrice(id: number): Promise<boolean> {
    try {
      const dynamicPrice = await DynamicPrice.findByPk(id);
      if (!dynamicPrice) {
        return false;
      }

      await dynamicPrice.destroy();
      logger.info(`删除动态价格规则成功: ${id}`);
      return true;
    } catch (error) {
      logger.error(`删除动态价格规则失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 生成个性化推荐
   * @param params 推荐参数
   * @returns 生成的推荐
   */
  async createRecommendation(params: {
    user_id: number;
    menu_item_id: number;
    recommendation_type: 'personalized' | 'popular' | 'new_arrival' | 'similar' | 'complementary';
    score: number;
    rank: number;
    context_info?: any;
    is_active?: boolean;
  }): Promise<Recommendation> {
    try {
      const recommendation = await Recommendation.create(params);
      logger.info(`生成个性化推荐成功: ${recommendation.id} - 用户ID: ${recommendation.user_id}, 菜品ID: ${recommendation.menu_item_id}`);
      return recommendation;
    } catch (error) {
      logger.error('生成个性化推荐失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的个性化推荐列表
   * @param userId 用户ID
   * @param limit 限制数量
   * @returns 个性化推荐列表
   */
  async getRecommendationsByUserId(userId: number, limit: number = 10): Promise<Recommendation[]> {
    try {
      return await Recommendation.findAll({
        where: { user_id: userId, is_active: true },
        order: [['score', 'DESC'], ['rank', 'ASC']],
        limit,
        include: [{ model: MenuItem }]
      });
    } catch (error) {
      logger.error(`获取用户个性化推荐列表失败: ${userId}`, error);
      throw error;
    }
  }

  /**
   * 获取菜品的推荐情况
   * @param menuItemId 菜品ID
   * @returns 菜品的推荐情况
   */
  async getRecommendationsByMenuItemId(menuItemId: number): Promise<Recommendation[]> {
    try {
      return await Recommendation.findAll({
        where: { menu_item_id: menuItemId },
        order: [['is_active', 'DESC'], ['score', 'DESC']],
        include: [{ model: MenuItem }]
      });
    } catch (error) {
      logger.error(`获取菜品推荐情况失败: ${menuItemId}`, error);
      throw error;
    }
  }

  /**
   * 更新推荐使用情况
   * @param id 推荐ID
   * @param params 更新参数
   * @returns 更新后的推荐
   */
  async updateRecommendationUsage(id: number, params: Partial<{
    is_used?: boolean;
    used_at?: Date;
    click_count?: number;
    order_count?: number;
  }>): Promise<Recommendation | null> {
    try {
      const recommendation = await Recommendation.findByPk(id);
      if (!recommendation) {
        return null;
      }

      // 增加点击或使用次数
      if (params.click_count !== undefined) {
        recommendation.click_count += params.click_count;
      }
      if (params.order_count !== undefined) {
        recommendation.order_count += params.order_count;
      }

      // 更新其他字段
      await recommendation.update({
        ...params,
        click_count: recommendation.click_count,
        order_count: recommendation.order_count,
        is_interacted: true
      });

      // 更新用户画像
      if (params.click_count) {
        this.recommendationModel.updateUserProfile(recommendation.user_id, {
          preferences: { [recommendation.menu_item_id]: 1 }
        });
      } else if (params.order_count) {
        this.recommendationModel.updateUserProfile(recommendation.user_id, {
          preferences: { [recommendation.menu_item_id]: 3 },
          orderHistory: [recommendation.menu_item_id]
        });
      }

      logger.info(`更新推荐使用情况成功: ${id}`);
      return recommendation;
    } catch (error) {
      logger.error(`更新推荐使用情况失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 根据用户行为生成智能推荐
   * @param userId 用户ID
   * @param context 上下文信息
   * @param limit 推荐数量
   * @returns 智能推荐列表
   */
  async generateSmartRecommendations(userId: number, limit: number = 10, context?: string): Promise<MenuItem[]> {
    try {
      // 解析上下文信息
      let contextInfo = {};
      if (context) {
        try {
          contextInfo = JSON.parse(context);
        } catch (e) {
          logger.warn('Invalid context JSON string:', e);
        }
      }
      
      // 1. 获取所有活跃菜品
      const allMenuItems = await MenuItem.findAll({
        where: { is_active: true },
        attributes: ['id']
      });
      const menuItemIds = allMenuItems.map(item => item.id);
      
      // 2. 使用深度学习模型预测推荐分数
      const scores = this.recommendationModel.predictBatchScores(userId, menuItemIds, contextInfo);
      
      // 3. 按分数排序菜品
      const sortedItems = menuItemIds
        .map(id => ({ id, score: scores[id] || 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
      // 4. 获取详细菜品信息
      const recommendedMenuItems = await MenuItem.findAll({
        where: { id: sortedItems.map(item => item.id) },
        include: [
          { model: MenuItemOption, order: [['sort_order', 'ASC']] },
          { model: MenuItemImage, order: [['sort_order', 'ASC']] },
          { model: MenuItemTag, include: [{ model: Tag }] }
        ]
      });
      
      // 5. 按分数排序菜品
      const menuItemMap = new Map(recommendedMenuItems.map(item => [item.id, item]));
      const sortedMenuItems = sortedItems.map(item => menuItemMap.get(item.id)!).filter(Boolean);
      
      // 6. 记录推荐结果
      for (let i = 0; i < sortedMenuItems.length; i++) {
        const menuItem = sortedMenuItems[i];
        const score = sortedItems[i].score;
        
        await Recommendation.create({
          user_id: userId,
          menu_item_id: menuItem.id,
          recommendation_type: 'personalized',
          score: score * 100, // 转换为0-100分
          rank: i + 1,
          context: contextInfo,
          is_interacted: false,
          is_active: true,
          click_count: 0,
          order_count: 0,
          metadata: {
            model_version: this.recommendationModel.modelVersion,
            confidence_score: Math.min(1, score + 0.1), // 简单的置信度计算
            cold_start: menuItemIds.length === 0,
            diversity_score: 0.5 + Math.random() * 0.5
          }
        });
      }
      
      return sortedMenuItems;
    } catch (error) {
      logger.error(`生成智能推荐失败: ${userId}`, error);
      throw error;
    }
  }

  /**
   * 训练推荐模型
   * @param trainingData 训练数据
   * @returns 训练结果
   */
  async trainRecommendationModel(trainingData: Record<string, any>[]): Promise<{ success: boolean; message: string }> {
    try {
      this.recommendationModel.trainModel(trainingData);
      return { success: true, message: '推荐模型训练完成' };
    } catch (error) {
      logger.error('训练推荐模型失败:', error);
      return { success: false, message: '推荐模型训练失败' };
    }
  }

  /**
   * 更新用户画像
   * @param userId 用户ID
   * @param data 用户画像数据
   * @returns 更新结果
   */
  async updateUserProfile(userId: number, data: Partial<UserProfile>): Promise<{ success: boolean; message: string }> {
    try {
      this.recommendationModel.updateUserProfile(userId, data);
      return { success: true, message: '用户画像更新完成' };
    } catch (error) {
      logger.error(`更新用户画像失败: ${userId}`, error);
      return { success: false, message: '用户画像更新失败' };
    }
  }

  /**
   * 获取用户画像
   * @param userId 用户ID
   * @returns 用户画像数据
   */
  async getUserProfile(userId: number): Promise<UserProfile | null> {
    try {
      const profile = this.recommendationModel.getUserProfile(userId);
      return profile;
    } catch (error) {
      logger.error(`获取用户画像失败: ${userId}`, error);
      return null;
    }
  }

  /**
   * 批量生成推荐
   * @param userIds 用户ID列表
   * @param context 上下文信息
   * @param limit 推荐数量
   * @returns 批量推荐结果
   */
  async batchGenerateRecommendations(
    userIds: number[],
    context?: string,
    limit: number = 10
  ): Promise<Record<number, MenuItem[]>> {
    try {
      const results: Record<number, MenuItem[]> = {};
      
      for (const userId of userIds) {
        results[userId] = await this.generateSmartRecommendations(userId, limit, context);
      }
      
      return results;
    } catch (error) {
      logger.error('批量生成推荐失败:', error);
      throw error;
    }
  }
}

export const menuItemService = new MenuItemService();
