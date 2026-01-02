/**
 * @fileoverview 示例服务
 * @description 实现示例相关的业务逻辑
 * @module services/sample-service
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Sample } from '../models/sample';
import { SampleRepository } from '../repositories/sample-repository';
import { ResourceNotFoundException } from '../exceptions/CustomException';

/**
 * 创建示例请求接口
 */
export interface CreateSampleRequest {
  name: string;
  description?: string;
  status: boolean;
  type: 'TYPE_1' | 'TYPE_2' | 'TYPE_3';
}

/**
 * 更新示例请求接口
 */
export interface UpdateSampleRequest {
  name?: string;
  description?: string;
  status?: boolean;
  type?: 'TYPE_1' | 'TYPE_2' | 'TYPE_3';
}

/**
 * 获取示例列表请求接口
 */
export interface GetSampleListRequest {
  page: number;
  limit: number;
  status?: boolean;
  type?: 'TYPE_1' | 'TYPE_2' | 'TYPE_3';
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * 批量删除示例结果接口
 */
export interface BatchDeleteSamplesResult {
  deletedCount: number;
  failedIds: string[];
}

/**
 * 示例服务类
 */
export class SampleService {
  private sampleRepository: SampleRepository;
  
  /**
   * 构造函数
   */
  constructor() {
    this.sampleRepository = new SampleRepository();
  }
  
  /**
   * 创建示例
   * @param data 创建示例数据
   */
  public async createSample(data: CreateSampleRequest): Promise<Sample> {
    return this.sampleRepository.create(data);
  }
  
  /**
   * 获取示例列表
   * @param params 查询参数
   */
  public async getSampleList(params: GetSampleListRequest): Promise<{ samples: Sample[]; total: number }> {
    // 计算偏移量
    const offset = (params.page - 1) * params.limit;
    
    // 构建查询条件
    const where = {} as any;
    
    if (params.status !== undefined) {
      where.status = params.status;
    }
    
    if (params.type) {
      where.type = params.type;
    }
    
    if (params.search) {
      where.name = { [Op.like]: `%${params.search}%` };
    }
    
    // 构建排序条件
    const order = [[params.sortBy, params.sortOrder]];
    
    // 查询数据
    const { rows: samples, count: total } = await this.sampleRepository.findAll({
      where,
      offset,
      limit: params.limit,
      order,
    });
    
    return { samples, total };
  }
  
  /**
   * 获取示例详情
   * @param id 示例ID
   */
  public async getSampleById(id: string): Promise<Sample | null> {
    return this.sampleRepository.findById(id);
  }
  
  /**
   * 更新示例
   * @param id 示例ID
   * @param data 更新数据
   */
  public async updateSample(id: string, data: UpdateSampleRequest): Promise<Sample | null> {
    // 检查示例是否存在
    const sample = await this.sampleRepository.findById(id);
    
    if (!sample) {
      return null;
    }
    
    // 更新示例
    return this.sampleRepository.update(id, data);
  }
  
  /**
   * 删除示例
   * @param id 示例ID
   */
  public async deleteSample(id: string): Promise<Sample | null> {
    // 检查示例是否存在
    const sample = await this.sampleRepository.findById(id);
    
    if (!sample) {
      return null;
    }
    
    // 删除示例
    await this.sampleRepository.delete(id);
    
    return sample;
  }
  
  /**
   * 批量删除示例
   * @param ids 示例ID列表
   */
  public async batchDeleteSamples(ids: string[]): Promise<BatchDeleteSamplesResult> {
    const result: BatchDeleteSamplesResult = {
      deletedCount: 0,
      failedIds: [],
    };
    
    for (const id of ids) {
      try {
        const deleted = await this.deleteSample(id);
        
        if (deleted) {
          result.deletedCount++;
        } else {
          result.failedIds.push(id);
        }
      } catch (error) {
        result.failedIds.push(id);
      }
    }
    
    return result;
  }
  
  /**
   * 批量更新示例状态
   * @param ids 示例ID列表
   * @param status 状态
   */
  public async batchUpdateSampleStatus(ids: string[], status: boolean): Promise<{ updatedCount: number; failedIds: string[] }> {
    const result = {
      updatedCount: 0,
      failedIds: [],
    };
    
    for (const id of ids) {
      try {
        const updated = await this.updateSample(id, { status });
        
        if (updated) {
          result.updatedCount++;
        } else {
          result.failedIds.push(id);
        }
      } catch (error) {
        result.failedIds.push(id);
      }
    }
    
    return result;
  }
}
