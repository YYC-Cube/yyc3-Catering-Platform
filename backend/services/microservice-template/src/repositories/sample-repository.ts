/**
 * @fileoverview 示例仓库
 * @description 实现示例数据的数据库操作
 * @module repositories/sample-repository
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Sample, SampleCreationAttributes } from '../models/sample';
import { ModelStatic } from 'sequelize';
import { UpdateSampleRequest } from '../services/sample-service';

/**
 * 示例仓库类
 */
export class SampleRepository {
  private model: ModelStatic<Sample>;
  
  /**
   * 构造函数
   */
  constructor() {
    this.model = Sample;
  }
  
  /**
   * 创建示例
   * @param data 创建示例数据
   */
  public async create(data: SampleCreationAttributes): Promise<Sample> {
    return this.model.create(data);
  }
  
  /**
   * 根据ID查找示例
   * @param id 示例ID
   */
  public async findById(id: string): Promise<Sample | null> {
    return this.model.findByPk(id);
  }
  
  /**
   * 查找所有示例
   * @param options 查询选项
   */
  public async findAll(options?: any): Promise<{ rows: Sample[]; count: number }> {
    return this.model.findAndCountAll(options);
  }
  
  /**
   * 更新示例
   * @param id 示例ID
   * @param data 更新数据
   */
  public async update(id: string, data: UpdateSampleRequest): Promise<Sample | null> {
    const [rowsUpdated, [updatedSample]] = await this.model.update(data, {
      where: { id },
      returning: true,
    });
    
    return rowsUpdated > 0 ? updatedSample : null;
  }
  
  /**
   * 删除示例
   * @param id 示例ID
   */
  public async delete(id: string): Promise<number> {
    return this.model.destroy({ where: { id } });
  }
  
  /**
   * 根据条件查找示例
   * @param where 查询条件
   * @param options 其他查询选项
   */
  public async findOne(where: any, options?: any): Promise<Sample | null> {
    return this.model.findOne({ where, ...options });
  }
  
  /**
   * 根据条件统计示例数量
   * @param where 查询条件
   */
  public async count(where: any): Promise<number> {
    return this.model.count({ where });
  }
  
  /**
   * 批量创建示例
   * @param data 示例数据数组
   */
  public async bulkCreate(data: SampleCreationAttributes[]): Promise<Sample[]> {
    return this.model.bulkCreate(data);
  }
  
  /**
   * 批量更新示例
   * @param data 更新数据
   * @param where 查询条件
   */
  public async bulkUpdate(data: any, where: any): Promise<number> {
    return this.model.update(data, { where });
  }
  
  /**
   * 批量删除示例
   * @param where 查询条件
   */
  public async bulkDelete(where: any): Promise<number> {
    return this.model.destroy({ where });
  }
  
  /**
   * 事务处理
   * @param callback 事务回调函数
   */
  public async transaction<T>(callback: (t: any) => Promise<T>): Promise<T> {
    return this.model.sequelize.transaction(callback);
  }
}
