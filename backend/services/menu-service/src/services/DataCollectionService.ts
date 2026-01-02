/**
 * @file 数据采集与处理服务
 * @description 实现数据采集、处理和提供的核心逻辑
 * @module services/DataCollectionService
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { DataCollection } from '../models/DataCollection';
import { DataProcessing } from '../models/DataProcessing';
import { MenuItem } from '../models/MenuItem';
import { Category } from '../models/Category';
import { Recommendation } from '../models/Recommendation';
import { DataCollection as DataCollectionModel } from '../models/DataCollection';
import { sequelize, Op } from 'sequelize';
import { DishEntity } from '../models/DishEntity';

// 内部数据源接口定义
interface InternalDataSource {
  type: string;
  fetchData(params: any): Promise<any>;
}

// 外部数据源接口定义
interface ExternalDataSource {
  name: string;
  fetchData(params: any): Promise<any>;
}

// 数据处理策略接口定义
interface DataProcessingStrategy {
  type: string;
  process(data: any, config: any): Promise<any>;
}

export class DataCollectionService {
  // 内部数据源集合
  private internalDataSources: Map<string, InternalDataSource> = new Map();
  
  // 外部数据源集合
  private externalDataSources: Map<string, ExternalDataSource> = new Map();
  
  // 数据处理策略集合
  private processingStrategies: Map<string, DataProcessingStrategy> = new Map();

  constructor() {
    this.initializeDataSources();
    this.initializeProcessingStrategies();
  }

  /**
   * 初始化内部数据源
   */
  private initializeDataSources(): void {
    // 注册内部数据源
    this.internalDataSources.set('menu_items', {
      type: 'menu_items',
      fetchData: async (params: any) => {
        const { period, filters } = params;
        return await MenuItem.findAll({
          where: filters,
          order: [['created_at', 'DESC']]
        });
      }
    });

    this.internalDataSources.set('categories', {
      type: 'categories',
      fetchData: async (params: any) => {
        return await Category.findAll();
      }
    });

    // 注册外部数据源
    this.externalDataSources.set('weather', {
      name: 'weather',
      fetchData: async (params: any) => {
        // 模拟天气数据采集
        const { city, date } = params;
        return {
          city,
          date,
          temperature: Math.floor(Math.random() * 35),
          humidity: Math.floor(Math.random() * 100),
          condition: ['晴', '多云', '阴', '雨'][Math.floor(Math.random() * 4)]
        };
      }
    });

    this.externalDataSources.set('competitor_prices', {
      name: 'competitor_prices',
      fetchData: async (params: any) => {
        // 模拟竞争对手价格数据采集
        const { restaurantId, dishTypes } = params;
        return {
          competitor_id: `competitor_${Math.floor(Math.random() * 100)}`,
          restaurant_id: restaurantId,
          dish_types: dishTypes,
          prices: {
            '宫保鸡丁': 28,
            '鱼香肉丝': 26,
            '回锅肉': 32
          },
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * 初始化数据处理策略
   */
  private initializeProcessingStrategies(): void {
    // 数据清洗策略
    this.processingStrategies.set('clean', {
      type: 'clean',
      process: async (data: any, config: any) => {
        // 实现数据清洗逻辑
        if (Array.isArray(data)) {
          return data.filter(item => {
            // 去除空值和无效数据
            return item && Object.values(item).some(val => val !== null && val !== undefined && val !== '');
          });
        }
        return data;
      }
    });

    // 数据转换策略
    this.processingStrategies.set('transform', {
      type: 'transform',
      process: async (data: any, config: any) => {
        // 实现数据转换逻辑
        if (Array.isArray(data)) {
          return data.map(item => {
            // 根据配置转换字段
            const transformedItem: any = {};
            if (config.fieldMappings) {
              Object.keys(config.fieldMappings).forEach(sourceField => {
                const targetField = config.fieldMappings[sourceField];
                transformedItem[targetField] = item[sourceField];
              });
            }
            return transformedItem;
          });
        }
        return data;
      }
    });

    // 数据标准化策略
    this.processingStrategies.set('normalize', {
      type: 'normalize',
      process: async (data: any, config: any) => {
        // 实现数据标准化逻辑
        if (Array.isArray(data)) {
          return data.map(item => {
            // 价格标准化示例
            if (item.price && config.priceStandardization) {
              item.price = Number(item.price.toFixed(2));
            }
            return item;
          });
        }
        return data;
      }
    });
  }

  /**
   * 采集内部数据
   * @param dataType 数据类型
   * @param period 时间周期
   * @returns 采集结果
   */
  async collectInternalData(dataType: string, period: string, filters?: any): Promise<any> {
    // 创建采集任务记录
    const collection = await DataCollection.create({
      source_type: 'internal',
      source_name: dataType,
      source_config: JSON.stringify({ period, filters }),
      data_type: dataType,
      status: 'running'
    });

    try {
      // 获取数据源并采集数据
      const dataSource = this.internalDataSources.get(dataType);
      if (!dataSource) {
        throw new Error(`未找到内部数据源: ${dataType}`);
      }

      const rawData = await dataSource.fetchData({ period, filters });
      const result = JSON.stringify(rawData);

      // 更新采集任务状态
      await collection.update({
        status: 'completed',
        record_count: Array.isArray(rawData) ? rawData.length : 1,
        result_info: result
      });

      return { success: true, data: rawData, collectionId: collection.id };
    } catch (error) {
      // 更新采集任务状态为失败
      await collection.update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }

  /**
   * 采集外部数据
   * @param source 数据源名称
   * @param params 采集参数
   * @returns 采集结果
   */
  async collectExternalData(source: string, params: any): Promise<any> {
    // 创建采集任务记录
    const collection = await DataCollection.create({
      source_type: 'external',
      source_name: source,
      source_config: JSON.stringify(params),
      data_type: source,
      status: 'running'
    });

    try {
      // 获取数据源并采集数据
      const dataSource = this.externalDataSources.get(source);
      if (!dataSource) {
        throw new Error(`未找到外部数据源: ${source}`);
      }

      const rawData = await dataSource.fetchData(params);
      const result = JSON.stringify(rawData);

      // 更新采集任务状态
      await collection.update({
        status: 'completed',
        record_count: 1,
        result_info: result
      });

      return { success: true, data: rawData, collectionId: collection.id };
    } catch (error) {
      // 更新采集任务状态为失败
      await collection.update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }

  /**
   * 处理采集的数据
   * @param collectionId 采集任务ID
   * @param processingType 处理类型
   * @param config 处理配置
   * @returns 处理结果
   */
  async processCollectedData(collectionId: number, processingType: string, config: any): Promise<any> {
    // 获取采集任务
    const collection = await DataCollection.findByPk(collectionId);
    if (!collection) {
      throw new Error(`未找到采集任务: ${collectionId}`);
    }

    // 创建处理任务记录
    const processing = await DataProcessing.create({
      collection_id: collectionId,
      processing_name: `${processingType}_processing`,
      processing_type: processingType,
      processing_config: JSON.stringify(config),
      status: 'running'
    });

    try {
      // 获取处理策略
      const strategy = this.processingStrategies.get(processingType);
      if (!strategy) {
        throw new Error(`未找到处理策略: ${processingType}`);
      }

      // 获取原始数据
      const rawData = JSON.parse(collection.result_info || '{}');
      
      // 执行数据处理
      const processedData = await strategy.process(rawData, config);
      const result = JSON.stringify(processedData);

      // 更新处理任务状态
      await processing.update({
        status: 'completed',
        processed_count: Array.isArray(processedData) ? processedData.length : 1,
        result_info: result
      });

      return { success: true, data: processedData, processingId: processing.id };
    } catch (error) {
      // 更新处理任务状态为失败
      await processing.update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }

  /**
   * 获取处理后的数据
   * @param dataType 数据类型
   * @param period 时间周期
   * @returns 处理后的数据
   */
  async getProcessedData(dataType: string, period: string): Promise<any> {
    // 查询最近完成的数据采集任务
    const collection = await DataCollection.findOne({
      where: {
        data_type: dataType,
        status: 'completed'
      },
      order: [['created_at', 'DESC']]
    });

    if (!collection) {
      throw new Error(`未找到类型为 ${dataType} 的已完成数据采集任务`);
    }

    // 查询关联的处理任务
    const processing = await DataProcessing.findOne({
      where: {
        collection_id: collection.id,
        status: 'completed'
      },
      order: [['created_at', 'DESC']]
    });

    if (processing) {
      return JSON.parse(processing.result_info || '{}');
    } else {
      // 如果没有处理任务，返回原始数据
      return JSON.parse(collection.result_info || '{}');
    }
  }

  /**
   * 注册新的内部数据源
   * @param source 内部数据源
   */
  registerInternalDataSource(source: InternalDataSource): void {
    this.internalDataSources.set(source.type, source);
  }

  /**
   * 注册新的外部数据源
   * @param source 外部数据源
   */
  registerExternalDataSource(source: ExternalDataSource): void {
    this.externalDataSources.set(source.name, source);
  }

  /**
   * 注册新的数据处理策略
   * @param strategy 数据处理策略
   */
  registerProcessingStrategy(strategy: DataProcessingStrategy): void {
    this.processingStrategies.set(strategy.type, strategy);
  }

  // ----------------------------
  // 数据统计与分析功能
  // ----------------------------

  /**
   * 获取菜品销售统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param categoryId 分类ID（可选）
   * @returns 菜品销售统计
   */
  async getDishSalesStatistics(startDate: string, endDate: string, categoryId?: number): Promise<any> {
    const whereClause: any = {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    // 使用Sequelize聚合函数获取统计数据
    const statistics = await MenuItem.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'price',
        'category_id',
        [sequelize.fn('SUM', sequelize.literal('COALESCE(order_count, 0)')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.literal('COALESCE(order_count, 0) * price')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.literal('COALESCE(rating, 0)')), 'avg_rating']
      ],
      include: [Category],
      group: ['MenuItem.id', 'category.id'],
      order: [
        [sequelize.literal('total_revenue'), 'DESC']
      ]
    });

    return statistics;
  }

  /**
   * 获取分类销售统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 分类销售统计
   */
  async getCategorySalesStatistics(startDate: string, endDate: string): Promise<any> {
    return await sequelize.query(
      `
      SELECT c.id, c.name, 
             COUNT(m.id) as dish_count,
             SUM(COALESCE(m.order_count, 0)) as total_orders,
             SUM(COALESCE(m.order_count, 0) * m.price) as total_revenue
      FROM categories c
      LEFT JOIN menu_items m ON c.id = m.category_id
      WHERE m.createdAt BETWEEN :startDate AND :endDate
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
      `,
      {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      }
    );
  }

  /**
   * 获取用户交互统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 用户交互统计
   */
  async getUserInteractionStatistics(startDate: string, endDate: string): Promise<any> {
    return await Recommendation.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      attributes: [
        'recommendation_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_recommendations'],
        [sequelize.fn('SUM', sequelize.literal('COALESCE(click_count, 0)')), 'total_clicks'],
        [sequelize.fn('SUM', sequelize.literal('COALESCE(order_count, 0)')), 'total_orders'],
        [sequelize.literal('SUM(COALESCE(click_count, 0)) / COUNT(id) * 100'), 'click_through_rate'],
        [sequelize.literal('SUM(COALESCE(order_count, 0)) / COUNT(id) * 100'), 'conversion_rate']
      ],
      group: ['recommendation_type'],
      order: [
        [sequelize.literal('total_recommendations'), 'DESC']
      ]
    });
  }

  /**
   * 获取时段销售统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 时段销售统计
   */
  async getTimePeriodSalesStatistics(startDate: string, endDate: string): Promise<any> {
    // 按小时统计销售数据
    const hourlyStatistics = await sequelize.query(
      `
      SELECT 
        EXTRACT(HOUR FROM createdAt) as hour,
        COUNT(*) as order_count,
        SUM(price) as revenue
      FROM menu_items
      WHERE createdAt BETWEEN :startDate AND :endDate
      GROUP BY EXTRACT(HOUR FROM createdAt)
      ORDER BY hour
      `,
      {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 按星期几统计销售数据
    const weeklyStatistics = await sequelize.query(
      `
      SELECT 
        EXTRACT(DOW FROM createdAt) as day_of_week,
        COUNT(*) as order_count,
        SUM(price) as revenue
      FROM menu_items
      WHERE createdAt BETWEEN :startDate AND :endDate
      GROUP BY EXTRACT(DOW FROM createdAt)
      ORDER BY day_of_week
      `,
      {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      }
    );

    return {
      hourly: hourlyStatistics,
      weekly: weeklyStatistics
    };
  }

  /**
   * 获取趋势分析数据
   * @param metric 指标类型
   * @param period 时间周期
   * @returns 趋势分析数据
   */
  async getTrendAnalysis(metric: 'revenue' | 'orders' | 'clicks', period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    let dateFormat = '%Y-%m-%d';
    let interval = '1 day';

    if (period === 'weekly') {
      dateFormat = '%Y-%U';
      interval = '1 week';
    } else if (period === 'monthly') {
      dateFormat = '%Y-%m';
      interval = '1 month';
    }

    const query = `
      SELECT 
        DATE_FORMAT(createdAt, '${dateFormat}') as period,
        COUNT(*) as order_count,
        SUM(price) as revenue
      FROM menu_items
      GROUP BY DATE_FORMAT(createdAt, '${dateFormat}')
      ORDER BY period
    `;

    if (metric === 'clicks') {
      const clickQuery = `
        SELECT 
          DATE_FORMAT(createdAt, '${dateFormat}') as period,
          SUM(click_count) as click_count
        FROM recommendations
        GROUP BY DATE_FORMAT(createdAt, '${dateFormat}')
        ORDER BY period
      `;
      return await sequelize.query(clickQuery, { type: sequelize.QueryTypes.SELECT });
    }

    return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  }

  /**
   * 获取菜品推荐效果分析
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 推荐效果分析
   */
  async getRecommendationEffectiveness(startDate: string, endDate: string): Promise<any> {
    return await Recommendation.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      attributes: [
        'menu_item_id',
        'recommendation_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'recommendation_count'],
        [sequelize.fn('SUM', sequelize.literal('COALESCE(click_count, 0)')), 'total_clicks'],
        [sequelize.fn('SUM', sequelize.literal('COALESCE(order_count, 0)')), 'total_orders'],
        [sequelize.literal('SUM(COALESCE(click_count, 0)) / COUNT(id) * 100'), 'click_through_rate'],
        [sequelize.literal('SUM(COALESCE(order_count, 0)) / COUNT(id) * 100'), 'conversion_rate']
      ],
      include: [MenuItem],
      group: ['menu_item_id', 'recommendation_type', 'menu_item.id'],
      order: [
        [sequelize.literal('recommendation_count'), 'DESC']
      ]
    });
  }

  /**
   * 获取热门菜品和分类
   * @param topCount 返回数量
   * @returns 热门菜品和分类
   */
  async getPopularDishesAndCategories(topCount: number = 10): Promise<any> {
    // 获取热门菜品
    const popularDishes = await MenuItem.findAll({
      attributes: [
        'id',
        'name',
        'price',
        'category_id',
        [sequelize.fn('SUM', sequelize.literal('COALESCE(order_count, 0)')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.literal('COALESCE(order_count, 0) * price')), 'total_revenue']
      ],
      include: [Category],
      group: ['MenuItem.id', 'category.id'],
      order: [
        [sequelize.literal('total_orders'), 'DESC']
      ],
      limit: topCount
    });

    // 获取热门分类
    const popularCategories = await sequelize.query(
      `
      SELECT c.id, c.name, 
             SUM(COALESCE(m.order_count, 0)) as total_orders,
             SUM(COALESCE(m.order_count, 0) * m.price) as total_revenue
      FROM categories c
      JOIN menu_items m ON c.id = m.category_id
      GROUP BY c.id, c.name
      ORDER BY total_orders DESC
      LIMIT :limit
      `,
      {
        replacements: { limit: topCount },
        type: sequelize.QueryTypes.SELECT
      }
    );

    return {
      popularDishes,
      popularCategories
    };
  }
}

export default new DataCollectionService();
