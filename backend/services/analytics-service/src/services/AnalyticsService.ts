/**
 * @file 数据分析服务
 * @description 实现数据分析的核心业务逻辑
 * @module services/AnalyticsService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { AnalyticsData, AnalyticsDataInterface } from '../models/AnalyticsData';
import { UserAnalytics, UserAnalyticsInterface } from '../models/UserAnalytics';
import { OrderAnalytics, OrderAnalyticsInterface } from '../models/OrderAnalytics';
import { AnalyticsType } from '../enums/AnalyticsType';
import { Op } from 'sequelize';
import logger from '../config/logger';
import redisClient from '../config/redis';

/**
 * 数据分析服务类
 */
export class AnalyticsService {
  /**
   * 记录分析数据
   * @param data 分析数据
   * @returns Promise<AnalyticsData>
   */
  async recordAnalyticsData(data: AnalyticsDataInterface): Promise<AnalyticsData> {
    try {
      logger.info('记录分析数据', { data });
      
      // 创建分析数据记录
      const analyticsData = await AnalyticsData.create(data);
      
      // 将数据缓存到Redis以提高查询性能
      const cacheKey = `analytics:${data.type}:${data.timestamp.getDate()}:${data.timestamp.getMonth()}:${data.timestamp.getFullYear()}`;
      await redisClient.set(cacheKey, JSON.stringify(analyticsData), 'EX', 3600);
      
      return analyticsData;
    } catch (error) {
      logger.error('记录分析数据失败', { error, data });
      throw new Error(`记录分析数据失败: ${error.message}`);
    }
  }

  /**
   * 记录用户行为数据
   * @param data 用户行为数据
   * @returns Promise<UserAnalytics>
   */
  async recordUserAnalytics(data: UserAnalyticsInterface): Promise<UserAnalytics> {
    try {
      logger.info('记录用户行为数据', { data });
      
      // 创建用户行为记录
      const userAnalytics = await UserAnalytics.create(data);
      
      // 更新用户活动统计
      await this.updateUserActivityStats(data.userId, data.sessionId);
      
      return userAnalytics;
    } catch (error) {
      logger.error('记录用户行为数据失败', { error, data });
      throw new Error(`记录用户行为数据失败: ${error.message}`);
    }
  }

  /**
   * 记录订单分析数据
   * @param data 订单分析数据
   * @returns Promise<OrderAnalytics>
   */
  async recordOrderAnalytics(data: OrderAnalyticsInterface): Promise<OrderAnalytics> {
    try {
      logger.info('记录订单分析数据', { data });
      
      // 创建订单分析记录
      const orderAnalytics = await OrderAnalytics.create(data);
      
      // 更新每日订单统计
      await this.updateDailyOrderStats(data.orderDate, data.totalAmount);
      
      return orderAnalytics;
    } catch (error) {
      logger.error('记录订单分析数据失败', { error, data });
      throw new Error(`记录订单分析数据失败: ${error.message}`);
    }
  }

  /**
   * 获取分析数据
   * @param type 分析数据类型
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<AnalyticsData[]>
   */
  async getAnalyticsData(
    type: AnalyticsType,
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 100
  ): Promise<{ data: AnalyticsData[]; total: number }> {
    try {
      logger.info('获取分析数据', { type, startDate, endDate, page, limit });
      
      // 计算偏移量
      const offset = (page - 1) * limit;
      
      // 查询分析数据
      const { rows, count } = await AnalyticsData.findAndCountAll({
        where: {
          type,
          timestamp: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['timestamp', 'DESC']],
        limit,
        offset,
      });
      
      return { data: rows, total: count };
    } catch (error) {
      logger.error('获取分析数据失败', { error, type, startDate, endDate });
      throw new Error(`获取分析数据失败: ${error.message}`);
    }
  }

  /**
   * 获取用户行为数据
   * @param userId 用户ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<{ data: UserAnalytics[]; total: number }>
   */
  async getUserAnalytics(
    userId: number,
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 100
  ): Promise<{ data: UserAnalytics[]; total: number }> {
    try {
      logger.info('获取用户行为数据', { userId, startDate, endDate, page, limit });
      
      // 计算偏移量
      const offset = (page - 1) * limit;
      
      // 查询用户行为数据
      const { rows, count } = await UserAnalytics.findAndCountAll({
        where: {
          userId,
          timestamp: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['timestamp', 'DESC']],
        limit,
        offset,
      });
      
      return { data: rows, total: count };
    } catch (error) {
      logger.error('获取用户行为数据失败', { error, userId, startDate, endDate });
      throw new Error(`获取用户行为数据失败: ${error.message}`);
    }
  }

  /**
   * 获取订单分析数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<{ data: OrderAnalytics[]; total: number }>
   */
  async getOrderAnalytics(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 100
  ): Promise<{ data: OrderAnalytics[]; total: number }> {
    try {
      logger.info('获取订单分析数据', { startDate, endDate, page, limit });
      
      // 计算偏移量
      const offset = (page - 1) * limit;
      
      // 查询订单分析数据
      const { rows, count } = await OrderAnalytics.findAndCountAll({
        where: {
          orderDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['orderDate', 'DESC']],
        limit,
        offset,
      });
      
      return { data: rows, total: count };
    } catch (error) {
      logger.error('获取订单分析数据失败', { error, startDate, endDate });
      throw new Error(`获取订单分析数据失败: ${error.message}`);
    }
  }

  /**
   * 获取销售统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns Promise<Record<string, any>>
   */
  async getSalesStats(startDate: Date, endDate: Date): Promise<Record<string, any>> {
    try {
      logger.info('获取销售统计数据', { startDate, endDate });
      
      // 查询订单数据
      const orders = await OrderAnalytics.findAll({
        where: {
          orderDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
      
      // 计算销售统计
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalItems = orders.reduce((sum, order) => sum + order.itemsCount, 0);
      const totalDiscounts = orders.reduce((sum, order) => sum + order.discountAmount, 0);
      
      // 按支付方式分组
      const paymentMethodStats = orders.reduce((acc, order) => {
        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalItems,
        totalDiscounts,
        paymentMethodStats,
      };
    } catch (error) {
      logger.error('获取销售统计数据失败', { error, startDate, endDate });
      throw new Error(`获取销售统计数据失败: ${error.message}`);
    }
  }

  /**
   * 获取用户活动统计
   * @param userId 用户ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns Promise<Record<string, any>>
   */
  async getUserActivityStats(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    try {
      logger.info('获取用户活动统计', { userId, startDate, endDate });
      
      // 查询用户行为数据
      const userActivities = await UserAnalytics.findAll({
        where: {
          userId,
          timestamp: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
      
      // 计算用户活动统计
      const totalEvents = userActivities.length;
      const uniqueSessions = new Set(userActivities.map(activity => activity.sessionId)).size;
      
      // 按事件类型分组
      const eventTypeStats = userActivities.reduce((acc, activity) => {
        acc[activity.event] = (acc[activity.event] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        totalEvents,
        uniqueSessions,
        eventTypeStats,
      };
    } catch (error) {
      logger.error('获取用户活动统计失败', { error, userId, startDate, endDate });
      throw new Error(`获取用户活动统计失败: ${error.message}`);
    }
  }

  /**
   * 更新用户活动统计
   * @param userId 用户ID
   * @param sessionId 会话ID
   */
  private async updateUserActivityStats(userId: number, sessionId: string): Promise<void> {
    try {
      const cacheKey = `user:${userId}:activity`;
      
      // 从Redis获取当前统计数据
      const currentStats = await redisClient.get(cacheKey);
      let stats = currentStats ? JSON.parse(currentStats) : { sessions: [], lastActive: new Date() };
      
      // 如果会话ID不存在，则添加到会话列表
      if (!stats.sessions.includes(sessionId)) {
        stats.sessions.push(sessionId);
      }
      
      // 更新最后活动时间
      stats.lastActive = new Date();
      
      // 将更新后的统计数据保存到Redis
      await redisClient.set(cacheKey, JSON.stringify(stats), 'EX', 86400);
    } catch (error) {
      logger.error('更新用户活动统计失败', { error, userId, sessionId });
    }
  }

  /**
   * 更新每日订单统计
   * @param orderDate 订单日期
   * @param totalAmount 订单金额
   */
  private async updateDailyOrderStats(orderDate: Date, totalAmount: number): Promise<void> {
    try {
      const dateStr = orderDate.toISOString().split('T')[0];
      const cacheKey = `daily:orders:${dateStr}`;
      
      // 从Redis获取当前统计数据
      const currentStats = await redisClient.get(cacheKey);
      let stats = currentStats ? JSON.parse(currentStats) : { count: 0, total: 0, average: 0 };
      
      // 更新统计数据
      stats.count++;
      stats.total += totalAmount;
      stats.average = stats.total / stats.count;
      
      // 将更新后的统计数据保存到Redis
      await redisClient.set(cacheKey, JSON.stringify(stats), 'EX', 604800); // 缓存7天
    } catch (error) {
      logger.error('更新每日订单统计失败', { error, orderDate, totalAmount });
    }
  }

  /**
   * 获取热门产品统计
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param limit 产品数量
   * @returns Promise<Record<string, any>[]>
   */
  async getPopularProducts(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<Record<string, any>[]> {
    try {
      logger.info('获取热门产品统计', { startDate, endDate, limit });
      
      // 查询产品相关的分析数据
      const productData = await AnalyticsData.findAll({
        where: {
          type: AnalyticsType.PRODUCT,
          timestamp: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
      
      // 计算产品统计
      const productStats = productData.reduce((acc, data) => {
        const productId = data.productId;
        if (!productId) return acc;
        
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            views: 0,
            purchases: 0,
            revenue: 0,
          };
        }
        
        // 根据数据内容更新统计
        if (data.data.event === 'view') {
          acc[productId].views++;
        } else if (data.data.event === 'purchase') {
          acc[productId].purchases++;
          acc[productId].revenue += data.data.amount || 0;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      // 按购买量排序并返回前N个产品
      return Object.values(productStats)
        .sort((a, b) => b.purchases - a.purchases)
        .slice(0, limit);
    } catch (error) {
      logger.error('获取热门产品统计失败', { error, startDate, endDate, limit });
      throw new Error(`获取热门产品统计失败: ${error.message}`);
    }
  }
}

// 导出数据分析服务实例
export const analyticsService = new AnalyticsService();
