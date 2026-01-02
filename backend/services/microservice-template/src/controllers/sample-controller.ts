/**
 * @fileoverview 示例控制器
 * @description 展示如何使用微服务模板开发控制器
 * @module controllers/sample-controller
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { successResponse, paginationResponse } from '../utils/response-helper';
import { ResourceNotFoundException } from '../exceptions/CustomException';
import { SampleService } from '../services/sample-service';
import logger from '../config/logger';

// 创建示例服务实例
const sampleService = new SampleService();

/**
 * 示例ID参数验证模式
 */
const sampleIdParamsSchema = z.object({
  id: z.string().uuid('无效的示例ID'),
});

/**
 * 创建示例请求验证模式
 */
const createSampleRequestSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过100个字符'),
  description: z.string().optional(),
  status: z.boolean().default(true),
  type: z.enum(['TYPE_1', 'TYPE_2', 'TYPE_3']).default('TYPE_1'),
});

/**
 * 更新示例请求验证模式
 */
const updateSampleRequestSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过100个字符').optional(),
  description: z.string().optional(),
  status: z.boolean().optional(),
  type: z.enum(['TYPE_1', 'TYPE_2', 'TYPE_3']).optional(),
});

/**
 * 获取示例列表请求验证模式
 */
const getSampleListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.boolean().optional(),
  type: z.enum(['TYPE_1', 'TYPE_2', 'TYPE_3']).optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 示例控制器类
 */
export class SampleController {
  /**
   * 创建示例
   * @param req 请求对象
   * @param res 响应对象
   */
  public async createSample(req: Request, res: Response): Promise<Response> {
    try {
      // 验证请求参数
      const validatedData = createSampleRequestSchema.parse(req.body);
      
      // 调用服务层创建示例
      const sample = await sampleService.createSample(validatedData);
      
      logger.info('Sample created successfully:', { id: sample.id, name: sample.name });
      
      // 返回成功响应
      return successResponse(res, sample, '示例创建成功', 201);
    } catch (error) {
      // 重新抛出错误，由全局错误处理器处理
      throw error;
    }
  }
  
  /**
   * 获取示例列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getSampleList(req: Request, res: Response): Promise<Response> {
    try {
      // 验证查询参数
      const validatedQuery = getSampleListQuerySchema.parse(req.query);
      
      // 调用服务层获取示例列表
      const { samples, total } = await sampleService.getSampleList(validatedQuery);
      
      logger.info('Sample list retrieved successfully:', { count: samples.length, total });
      
      // 返回分页响应
      return paginationResponse(
        res,
        samples,
        validatedQuery.page,
        validatedQuery.limit,
        total,
        '示例列表获取成功',
      );
    } catch (error) {
      // 重新抛出错误，由全局错误处理器处理
      throw error;
    }
  }
  
  /**
   * 获取示例详情
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getSampleById(req: Request, res: Response): Promise<Response> {
    try {
      // 验证路径参数
      const { id } = sampleIdParamsSchema.parse(req.params);
      
      // 调用服务层获取示例详情
      const sample = await sampleService.getSampleById(id);
      
      if (!sample) {
        throw new ResourceNotFoundException(`示例ID ${id} 不存在`);
      }
      
      logger.info('Sample retrieved successfully:', { id: sample.id, name: sample.name });
      
      // 返回成功响应
      return successResponse(res, sample, '示例详情获取成功');
    } catch (error) {
      // 重新抛出错误，由全局错误处理器处理
      throw error;
    }
  }
  
  /**
   * 更新示例
   * @param req 请求对象
   * @param res 响应对象
   */
  public async updateSample(req: Request, res: Response): Promise<Response> {
    try {
      // 验证路径参数
      const { id } = sampleIdParamsSchema.parse(req.params);
      
      // 验证请求体
      const validatedData = updateSampleRequestSchema.parse(req.body);
      
      // 调用服务层更新示例
      const updatedSample = await sampleService.updateSample(id, validatedData);
      
      if (!updatedSample) {
        throw new ResourceNotFoundException(`示例ID ${id} 不存在`);
      }
      
      logger.info('Sample updated successfully:', { id: updatedSample.id, name: updatedSample.name });
      
      // 返回成功响应
      return successResponse(res, updatedSample, '示例更新成功');
    } catch (error) {
      // 重新抛出错误，由全局错误处理器处理
      throw error;
    }
  }
  
  /**
   * 删除示例
   * @param req 请求对象
   * @param res 响应对象
   */
  public async deleteSample(req: Request, res: Response): Promise<Response> {
    try {
      // 验证路径参数
      const { id } = sampleIdParamsSchema.parse(req.params);
      
      // 调用服务层删除示例
      const deletedSample = await sampleService.deleteSample(id);
      
      if (!deletedSample) {
        throw new ResourceNotFoundException(`示例ID ${id} 不存在`);
      }
      
      logger.info('Sample deleted successfully:', { id: deletedSample.id, name: deletedSample.name });
      
      // 返回成功响应
      return successResponse(res, null, '示例删除成功');
    } catch (error) {
      // 重新抛出错误，由全局错误处理器处理
      throw error;
    }
  }
  
  /**
   * 批量删除示例
   * @param req 请求对象
   * @param res 响应对象
   */
  public async batchDeleteSamples(req: Request, res: Response): Promise<Response> {
    try {
      // 验证请求体
      const { ids } = z.object({
        ids: z.array(z.string().uuid('无效的示例ID')).min(1, '至少需要一个示例ID'),
      }).parse(req.body);
      
      // 调用服务层批量删除示例
      const result = await sampleService.batchDeleteSamples(ids);
      
      logger.info('Samples deleted successfully:', { count: result.deletedCount, ids });
      
      // 返回成功响应
      return successResponse(res, result, `成功删除 ${result.deletedCount} 个示例`);
    } catch (error) {
      // 重新抛出错误，由全局错误处理器处理
      throw error;
    }
  }
}
