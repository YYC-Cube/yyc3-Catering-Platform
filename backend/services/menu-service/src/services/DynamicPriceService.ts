/**
 * @file 动态定价服务
 * @description 实现动态定价引擎的核心功能，包括价格规则管理、动态价格计算等
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { DynamicPrice } from '../models/DynamicPrice';
import { MenuItem } from '../models/MenuItem';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

// 模拟AI价格预测模型
class AIPricePredictionModel {
  // 模拟模型训练
  async train(menuItemId: number, historicalData: any[]) {
    console.log(`Training AI model for menu item ${menuItemId} with ${historicalData.length} data points`);
    // 在实际应用中，这里应该调用真正的ML模型训练逻辑
    return {
      model_id: `ai_model_${menuItemId}_${Date.now()}`,
      accuracy: 0.89 + Math.random() * 0.08, // 模拟89-97%的准确率
      trained_at: new Date(),
      menu_item_id: menuItemId
    };
  }

  // 模拟价格预测
  async predict(menuItemId: number, context: any, modelParams: any = {}) {
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('菜单项不存在');
    }

    // 基础价格
    let basePrice = menuItem.price;
    
    // 根据上下文因素进行预测调整
    let predictionAdjustment = 0;

    // 时间因素影响（高峰时段加价）
    if (context.current_time) {
      const hour = parseInt(context.current_time.split(':')[0]);
      // 午餐和晚餐高峰时段（11-14点，17-20点）
      if ((hour >= 11 && hour < 14) || (hour >= 17 && hour < 20)) {
        predictionAdjustment += basePrice * 0.15; // 高峰时段加价15%
      }
    }

    // 星期因素影响（周末加价）
    if (context.day_of_week && (context.day_of_week === 0 || context.day_of_week === 6)) {
      predictionAdjustment += basePrice * 0.10; // 周末加价10%
    }

    // 需求因素影响
    if (context.current_demand) {
      // 需求越高，价格越高
      const demandFactor = Math.min(context.current_demand / 100, 1);
      predictionAdjustment += basePrice * 0.2 * demandFactor; // 最高加价20%
    }

    // 用户分段影响（会员折扣）
    if (context.user_segment && context.user_segment === 'vip') {
      predictionAdjustment -= basePrice * 0.05; // VIP用户折扣5%
    }

    // 应用价格上下限
    const priceFloor = modelParams.price_floor || basePrice * 0.8;
    const priceCeiling = modelParams.price_ceiling || basePrice * 1.5;

    // 计算最终预测价格
    let predictedPrice = basePrice + predictionAdjustment;
    predictedPrice = Math.max(predictedPrice, priceFloor);
    predictedPrice = Math.min(predictedPrice, priceCeiling);

    // 模拟置信度
    const confidence = 0.85 + Math.random() * 0.12; // 85-97%的置信度

    return {
      predicted_price: Math.round(predictedPrice * 100) / 100, // 保留两位小数
      confidence: Math.round(confidence * 100) / 100,
      factors: {
        time_impact: context.current_time ? Math.round((basePrice * 0.15 / predictedPrice) * 100) / 100 : 0,
        day_impact: context.day_of_week ? Math.round((basePrice * 0.10 / predictedPrice) * 100) / 100 : 0,
        demand_impact: context.current_demand ? Math.round((basePrice * 0.2 * (Math.min(context.current_demand / 100, 1)) / predictedPrice) * 100) / 100 : 0,
        user_impact: context.user_segment ? Math.round((basePrice * -0.05 / predictedPrice) * 100) / 100 : 0
      }
    };
  }
}

// 创建AI模型实例
const aiPriceModel = new AIPricePredictionModel();

/**
 * @class DynamicPriceService
 * @description 动态定价服务类，实现动态定价引擎的核心功能
 *              包括价格规则管理、动态价格计算、规则匹配等功能
 */
class DynamicPriceService {
  /**
   * 创建动态价格规则
   * @param {Object} data 动态价格规则数据
   * @param {number} data.menu_item_id 菜单项ID
   * @param {number} data.dynamic_price 动态价格
   * @param {string} data.price_type 价格类型: time_based | demand_based | user_segment | promotion | special_event
   * @param {string} data.rule_name 规则名称
   * @param {Object} data.rule_config 规则配置
   * @param {boolean} data.is_active 是否激活
   * @param {Date} data.effective_from 生效开始日期
   * @param {Date} [data.effective_to] 生效结束日期
   * @param {Object} [data.metadata] 元数据
   * @returns {Promise<DynamicPrice>} 创建的动态价格规则
   */
  async createDynamicPrice(data: {
    menu_item_id: number;
    dynamic_price: number;
    price_type: 'time_based' | 'demand_based' | 'user_segment' | 'promotion' | 'special_event';
    rule_name: string;
    rule_config: {
      start_time?: string;
      end_time?: string;
      day_of_week?: number[];
      user_segment?: string[];
      minimum_order?: number;
      maximum_order?: number;
      demand_threshold?: number;
      discount_percentage?: number;
      markup_percentage?: number;
    };
    is_active: boolean;
    effective_from: Date;
    effective_to?: Date;
    metadata?: Record<string, any>;
  }) {
    return DynamicPrice.create(data);
  }

  /**
   * 获取动态价格规则
   * @param {number} id 动态价格规则ID
   * @returns {Promise<DynamicPrice | null>} 动态价格规则对象，包含关联的菜单项
   */
  async getDynamicPrice(id: number) {
    return DynamicPrice.findByPk(id, {
      include: [{ model: MenuItem }],
    });
  }

  /**
   * 更新动态价格规则
   * @param {number} id 动态价格规则ID
   * @param {Partial<DynamicPrice>} data 要更新的数据
   * @returns {Promise<[number, DynamicPrice[]]>} 更新的行数和更新后的记录
   */
  async updateDynamicPrice(id: number, data: Partial<DynamicPrice>) {
    return DynamicPrice.update(data, { where: { id }, returning: true });
  }

  // 删除动态价格规则
  async deleteDynamicPrice(id: number) {
    return DynamicPrice.destroy({ where: { id } });
  }

  // 获取所有动态价格规则
  async getAllDynamicPrices(filters?: {
    menu_item_id?: number;
    price_type?: string;
    is_active?: boolean;
  }) {
    const whereClause: any = {};
    if (filters?.menu_item_id) {
      whereClause.menu_item_id = filters.menu_item_id;
    }
    if (filters?.price_type) {
      whereClause.price_type = filters.price_type;
    }
    if (filters?.is_active !== undefined) {
      whereClause.is_active = filters.is_active;
    }

    return DynamicPrice.findAll({
      where: whereClause,
      include: [{ model: MenuItem }],
      order: [['createdAt', 'DESC']],
    });
  }

  // 计算动态价格
  async calculateDynamicPrice(menuItemId: number, context?: {
    user_id?: string;
    user_segment?: string;
    current_time?: string;
    day_of_week?: number;
    current_demand?: number;
    order_quantity?: number;
  }) {
    // 获取菜单项
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('菜单项不存在');
    }

    // 获取当前有效的动态价格规则
    const now = new Date();
    const activeRules = await DynamicPrice.findAll({
      where: {
        menu_item_id: menuItemId,
        is_active: true,
        effective_from: { [Op.lte]: now },
        [Op.or]: [
          { effective_to: null },
          { effective_to: { [Op.gte]: now } },
        ],
      },
    });

    if (activeRules.length === 0) {
      return {
        menu_item_id: menuItemId,
        original_price: menuItem.price,
        dynamic_price: menuItem.price,
        applied_rule: null,
      };
    }

    // 根据上下文匹配最佳规则
    const bestRule = this.findBestMatchingRule(activeRules, context);
    
    // 使用最佳规则计算价格
    let finalPrice = menuItem.price;
    let predictionResult = null;

    if (bestRule) {
      if (bestRule.price_type === 'ai_predicted') {
        // 使用AI预测价格
        predictionResult = await aiPriceModel.predict(menuItemId, context, bestRule.rule_config);
        
        // 检查置信度阈值
        if (bestRule.rule_config.confidence_threshold && predictionResult.confidence < bestRule.rule_config.confidence_threshold) {
          // 置信度不足，使用原始价格
          finalPrice = menuItem.price;
        } else {
          // 应用AI预测价格
          finalPrice = predictionResult.predicted_price;
          
          // 应用基础价格调整
          if (bestRule.rule_config.base_price_adjustment) {
            finalPrice += bestRule.rule_config.base_price_adjustment;
          }
        }
      } else {
        // 使用传统规则价格
        finalPrice = bestRule.dynamic_price;
      }
    }

    return {
      menu_item_id: menuItemId,
      original_price: menuItem.price,
      dynamic_price: finalPrice,
      applied_rule: bestRule ? {
        id: bestRule.id,
        rule_name: bestRule.rule_name,
        price_type: bestRule.price_type,
        rule_config: bestRule.rule_config,
      } : null,
      ai_prediction: predictionResult,
    };
  }

  // 批量计算动态价格
  async batchCalculateDynamicPrice(menuItemIds: number[], context?: any) {
    const results: any[] = [];
    for (const id of menuItemIds) {
      try {
        const result = await this.calculateDynamicPrice(id, context);
        results.push(result);
      } catch (error) {
        results.push({
          menu_item_id: id,
          error: (error as Error).message,
        });
      }
    }
    return results;
  }

  // 查找最佳匹配规则
  private findBestMatchingRule(rules: DynamicPrice[], context?: any) {
    let bestRule: DynamicPrice | null = null;
    let highestPriority = -1;

    // 规则优先级：ai_predicted > special_event > promotion > demand_based > user_segment > time_based
    const priorityMap: Record<string, number> = {
      'ai_predicted': 6,
      'special_event': 5,
      'promotion': 4,
      'demand_based': 3,
      'user_segment': 2,
      'time_based': 1,
    };

    for (const rule of rules) {
      const priority = priorityMap[rule.price_type];
      
      // 检查规则是否匹配当前上下文
      if (this.isRuleMatchingContext(rule, context) && priority > highestPriority) {
        bestRule = rule;
        highestPriority = priority;
      }
    }

    return bestRule;
  }

  // 检查规则是否匹配上下文
  private isRuleMatchingContext(rule: DynamicPrice, context?: any) {
    const config = rule.rule_config;
    
    // 时间规则检查
    if (rule.price_type === 'time_based') {
      if (config.start_time && config.end_time && context?.current_time) {
        const currentTime = new Date(`2000-01-01T${context.current_time}`);
        const startTime = new Date(`2000-01-01T${config.start_time}`);
        const endTime = new Date(`2000-01-01T${config.end_time}`);
        
        if (currentTime < startTime || currentTime > endTime) {
          return false;
        }
      }
      
      if (config.day_of_week && context?.day_of_week) {
        if (!config.day_of_week.includes(context.day_of_week)) {
          return false;
        }
      }
    }
    
    // 用户分段规则检查
    if (rule.price_type === 'user_segment' && config.user_segment && context?.user_segment) {
      if (!config.user_segment.includes(context.user_segment)) {
        return false;
      }
    }
    
    // 需求规则检查
    if (rule.price_type === 'demand_based' && config.demand_threshold !== undefined && context?.current_demand) {
      if (context.current_demand < config.demand_threshold) {
        return false;
      }
    }
    
    // 订单数量规则检查
    if (config.minimum_order !== undefined && context?.order_quantity) {
      if (context.order_quantity < config.minimum_order) {
        return false;
      }
    }
    
    if (config.maximum_order !== undefined && context?.order_quantity) {
      if (context.order_quantity > config.maximum_order) {
        return false;
      }
    }
    
    return true;
  }

  // 激活/停用动态价格规则
  async toggleDynamicPriceStatus(id: number, is_active: boolean) {
    return DynamicPrice.update({ is_active }, { where: { id }, returning: true });
  }

  // 获取适用的动态价格规则统计
  async getDynamicPriceStats() {
    return DynamicPrice.findAll({
      attributes: [
        'price_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_active THEN 1 ELSE 0 END')), 'active_count'],
      ],
      group: ['price_type'],
    });
  }

  // 训练AI价格预测模型
  async trainAIPriceModel(menuItemId: number, historicalData: any[]) {
    // 验证菜单项存在
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('菜单项不存在');
    }

    // 训练AI模型
    const trainingResult = await aiPriceModel.train(menuItemId, historicalData);

    // 可以选择保存模型信息到数据库
    return trainingResult;
  }

  // 使用AI模型预测价格（直接调用，不经过规则引擎）
  async predictPriceWithAI(menuItemId: number, context: any, modelConfig: any = {}) {
    // 验证菜单项存在
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('菜单项不存在');
    }

    return aiPriceModel.predict(menuItemId, context, modelConfig);
  }

  // 批量训练AI模型
  async batchTrainAIModels(trainingJobs: Array<{ menu_item_id: number, historical_data: any[] }>) {
    const results = [];
    for (const job of trainingJobs) {
      try {
        const result = await this.trainAIPriceModel(job.menu_item_id, job.historical_data);
        results.push({ success: true, menu_item_id: job.menu_item_id, result });
      } catch (error) {
        results.push({ success: false, menu_item_id: job.menu_item_id, error: (error as Error).message });
      }
    }
    return results;
  }
}

// 导出服务实例
export const dynamicPriceService = new DynamicPriceService();
