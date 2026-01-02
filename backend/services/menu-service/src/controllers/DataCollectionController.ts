/**
 * @file 数据采集与处理控制器
 * @description 处理数据采集和处理相关的API请求
 * @module controllers/DataCollectionController
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Request, Response } from 'express';
import dataCollectionService from '../services/DataCollectionService';

export class DataCollectionController {

  /**
   * 采集内部数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async collectInternalData(req: Request, res: Response): Promise<Response> {
    try {
      const { dataType, period, filters } = req.body;
      
      if (!dataType || !period) {
        return res.status(400).json({
          success: false,
          message: '数据类型和时间周期是必需的'
        });
      }

      const result = await dataCollectionService.collectInternalData(dataType, period, filters);
      
      return res.status(200).json({
        success: true,
        message: '内部数据采集成功',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '内部数据采集失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 采集外部数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async collectExternalData(req: Request, res: Response): Promise<Response> {
    try {
      const { source, params } = req.body;
      
      if (!source || !params) {
        return res.status(400).json({
          success: false,
          message: '数据源和参数是必需的'
        });
      }

      const result = await dataCollectionService.collectExternalData(source, params);
      
      return res.status(200).json({
        success: true,
        message: '外部数据采集成功',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '外部数据采集失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 处理采集的数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async processCollectedData(req: Request, res: Response): Promise<Response> {
    try {
      const { collectionId, processingType, config } = req.body;
      
      if (!collectionId || !processingType) {
        return res.status(400).json({
          success: false,
          message: '采集任务ID和处理类型是必需的'
        });
      }

      const result = await dataCollectionService.processCollectedData(
        collectionId,
        processingType,
        config || {}
      );
      
      return res.status(200).json({
        success: true,
        message: '数据处理成功',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '数据处理失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取处理后的数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getProcessedData(req: Request, res: Response): Promise<Response> {
    try {
      const { dataType, period } = req.query;
      
      if (!dataType || !period) {
        return res.status(400).json({
          success: false,
          message: '数据类型和时间周期是必需的'
        });
      }

      const result = await dataCollectionService.getProcessedData(
        String(dataType),
        String(period)
      );
      
      return res.status(200).json({
        success: true,
        message: '获取处理后的数据成功',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取处理后的数据失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取所有采集任务
   * @param req 请求对象
   * @param res 响应对象
   */
  async getAllCollections(req: Request, res: Response): Promise<Response> {
    try {
      const { status, dataType } = req.query;
      const { DataCollection } = require('../models/DataCollection');
      
      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (dataType) whereClause.data_type = dataType;

      const collections = await DataCollection.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: '获取采集任务列表成功',
        data: collections
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取采集任务列表失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取所有处理任务
   * @param req 请求对象
   * @param res 响应对象
   */
  async getAllProcessings(req: Request, res: Response): Promise<Response> {
    try {
      const { status, collectionId } = req.query;
      const { DataProcessing } = require('../models/DataProcessing');
      
      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (collectionId) whereClause.collection_id = collectionId;

      const processings = await DataProcessing.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: '获取处理任务列表成功',
        data: processings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取处理任务列表失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 注册新的内部数据源
   * @param req 请求对象
   * @param res 响应对象
   */
  async registerInternalDataSource(req: Request, res: Response): Promise<Response> {
    try {
      const { type, fetchData } = req.body;
      
      if (!type || typeof fetchData !== 'function') {
        return res.status(400).json({
          success: false,
          message: '数据源类型和fetchData函数是必需的'
        });
      }

      dataCollectionService.registerInternalDataSource({
        type,
        fetchData
      });
      
      return res.status(200).json({
        success: true,
        message: '内部数据源注册成功'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '内部数据源注册失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 注册新的数据处理策略
   * @param req 请求对象
   * @param res 响应对象
   */
  async registerProcessingStrategy(req: Request, res: Response): Promise<Response> {
    try {
      const { type, process } = req.body;
      
      if (!type || typeof process !== 'function') {
        return res.status(400).json({
          success: false,
          message: '处理策略类型和process函数是必需的'
        });
      }

      dataCollectionService.registerProcessingStrategy({
        type,
        process
      });
      
      return res.status(200).json({
        success: true,
        message: '数据处理策略注册成功'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '数据处理策略注册失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ----------------------------
  // 统计分析接口
  // ----------------------------

  /**
   * 获取菜品销售统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getDishSalesStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate, categoryId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '开始日期和结束日期是必需的'
        });
      }

      const statistics = await dataCollectionService.getDishSalesStatistics(
        String(startDate),
        String(endDate),
        categoryId ? parseInt(String(categoryId)) : undefined
      );
      
      return res.status(200).json({
        success: true,
        message: '获取菜品销售统计数据成功',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取菜品销售统计数据失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取分类销售统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getCategorySalesStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '开始日期和结束日期是必需的'
        });
      }

      const statistics = await dataCollectionService.getCategorySalesStatistics(
        String(startDate),
        String(endDate)
      );
      
      return res.status(200).json({
        success: true,
        message: '获取分类销售统计数据成功',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取分类销售统计数据失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取用户交互统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getUserInteractionStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '开始日期和结束日期是必需的'
        });
      }

      const statistics = await dataCollectionService.getUserInteractionStatistics(
        String(startDate),
        String(endDate)
      );
      
      return res.status(200).json({
        success: true,
        message: '获取用户交互统计数据成功',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取用户交互统计数据失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取时段销售统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getTimePeriodSalesStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '开始日期和结束日期是必需的'
        });
      }

      const statistics = await dataCollectionService.getTimePeriodSalesStatistics(
        String(startDate),
        String(endDate)
      );
      
      return res.status(200).json({
        success: true,
        message: '获取时段销售统计数据成功',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取时段销售统计数据失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取趋势分析数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getTrendAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { metric, period } = req.query;
      
      if (!metric || !period) {
        return res.status(400).json({
          success: false,
          message: '指标类型和时间周期是必需的'
        });
      }

      const statistics = await dataCollectionService.getTrendAnalysis(
        metric as 'revenue' | 'orders' | 'clicks',
        period as 'daily' | 'weekly' | 'monthly'
      );
      
      return res.status(200).json({
        success: true,
        message: '获取趋势分析数据成功',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取趋势分析数据失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取菜品推荐效果分析
   * @param req 请求对象
   * @param res 响应对象
   */
  async getRecommendationEffectiveness(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '开始日期和结束日期是必需的'
        });
      }

      const statistics = await dataCollectionService.getRecommendationEffectiveness(
        String(startDate),
        String(endDate)
      );
      
      return res.status(200).json({
        success: true,
        message: '获取菜品推荐效果分析成功',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取菜品推荐效果分析失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取热门菜品和分类
   * @param req 请求对象
   * @param res 响应对象
   */
  async getPopularDishesAndCategories(req: Request, res: Response): Promise<Response> {
    try {
      const { topCount } = req.query;

      const statistics = await dataCollectionService.getPopularDishesAndCategories(
        topCount ? parseInt(String(topCount)) : 10
      );
      
      return res.status(200).json({
        success: true,
        message: '获取热门菜品和分类成功',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '获取热门菜品和分类失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export default new DataCollectionController();
