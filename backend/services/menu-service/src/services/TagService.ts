/**
 * @file 标签服务
 * @description 处理菜品标签的业务逻辑
 * @module services/TagService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Tag } from '../models/Tag';
import logger from '../config/logger';
import { Op, Optional } from 'sequelize';

/**
 * 标签服务类
 */
export class TagService {
  /**
   * 创建标签
   * @param tagData 标签数据
   * @returns 创建的标签
   */
  async createTag(tagData: Optional<Tag, 'id'>): Promise<Tag> {
    try {
      const tag = await Tag.create(tagData);
      logger.info(`创建标签成功: ${tag.id} - ${tag.name}`);
      return tag;
    } catch (error) {
      logger.error('创建标签失败:', error);
      throw error;
    }
  }

  /**
   * 获取标签列表
   * @param params 查询参数
   * @returns 标签列表
   */
  async getTags(params: {
    tagType?: string;
    isActive?: boolean;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tags: Tag[]; total: number }> {
    try {
      const { tagType, isActive, keyword, page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const where: any = {};

      if (tagType) {
        where.tag_type = tagType;
      }

      if (isActive !== undefined) {
        where.is_active = isActive;
      }

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows } = await Tag.findAndCountAll({
        where,
        offset,
        limit,
        order: [['sort_order', 'ASC'], ['id', 'ASC']]
      });

      logger.info(`获取标签列表成功，共 ${count} 条记录`);
      return { tags: rows, total: count };
    } catch (error) {
      logger.error('获取标签列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取标签详情
   * @param id 标签ID
   * @returns 标签详情
   */
  async getTagById(id: number): Promise<Tag | null> {
    try {
      const tag = await Tag.findByPk(id);
      return tag;
    } catch (error) {
      logger.error(`获取标签详情失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 更新标签
   * @param id 标签ID
   * @param tagData 更新数据
   * @returns 更新后的标签
   */
  async updateTag(id: number, tagData: Partial<Tag>): Promise<Tag | null> {
    try {
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return null;
      }

      await tag.update(tagData);
      logger.info(`更新标签成功: ${id} - ${tag.name}`);
      return tag;
    } catch (error) {
      logger.error(`更新标签失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 删除标签
   * @param id 标签ID
   * @returns 是否删除成功
   */
  async deleteTag(id: number): Promise<boolean> {
    try {
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return false;
      }

      await tag.destroy();
      logger.info(`删除标签成功: ${id} - ${tag.name}`);
      return true;
    } catch (error) {
      logger.error(`删除标签失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 更新标签状态
   * @param id 标签ID
   * @param isActive 是否激活
   * @returns 更新后的标签
   */
  async updateTagStatus(id: number, isActive: boolean): Promise<Tag | null> {
    try {
      return await this.updateTag(id, { is_active: isActive });
    } catch (error) {
      logger.error(`更新标签状态失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 批量更新标签排序
   * @param sortData 排序数据
   * @returns 更新数量
   */
  async batchUpdateSortOrder(sortData: { id: number; sortOrder: number }[]): Promise<number> {
    try {
      const promises = sortData.map(item =>
        Tag.update({ sort_order: item.sortOrder }, { where: { id: item.id } })
      );

      const results = await Promise.all(promises);
      const updatedCount = results.reduce((sum, [count]) => sum + count, 0);

      logger.info(`批量更新标签排序成功，共更新 ${updatedCount} 条记录`);
      return updatedCount;
    } catch (error) {
      logger.error('批量更新标签排序失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有激活的标签
   * @returns 激活的标签列表
   */
  async getAllActiveTags(): Promise<Tag[]> {
    try {
      return await Tag.findAll({
        where: { is_active: true },
        order: [['sort_order', 'ASC'], ['id', 'ASC']]
      });
    } catch (error) {
      logger.error('获取激活标签失败:', error);
      throw error;
    }
  }

  /**
   * 根据标签类型获取标签
   * @param tagType 标签类型
   * @returns 标签列表
   */
  async getTagsByType(tagType: string): Promise<Tag[]> {
    try {
      return await Tag.findAll({
        where: { tag_type: tagType, is_active: true },
        order: [['sort_order', 'ASC'], ['id', 'ASC']]
      });
    } catch (error) {
      logger.error(`获取标签类型 ${tagType} 失败:`, error);
      throw error;
    }
  }
}

export const tagService = new TagService();
