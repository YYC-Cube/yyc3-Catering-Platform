/**
 * @file 分类服务
 * @description 处理菜单分类的业务逻辑
 * @module services/CategoryService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Category } from '../models/Category';
import logger from '../config/logger';
import { Op, Optional } from 'sequelize';

/**
 * 分类服务类
 */
export class CategoryService {
  /**
   * 创建分类
   * @param categoryData 分类数据
   * @returns 创建的分类
   */
  async createCategory(categoryData: Optional<Category, 'id'>): Promise<Category> {
    try {
      const category = await Category.create(categoryData);
      logger.info(`创建分类成功: ${category.id} - ${category.name}`);
      return category;
    } catch (error) {
      logger.error('创建分类失败:', error);
      throw error;
    }
  }

  /**
   * 获取分类列表
   * @param params 查询参数
   * @returns 分类列表
   */
  async getCategories(params: {
    parentId?: number;
    isActive?: boolean;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<{ categories: Category[]; total: number }> {
    try {
      const { parentId, isActive, keyword, page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const where: any = {};

      if (parentId !== undefined) {
        where.parent_id = parentId;
      }

      if (isActive !== undefined) {
        where.is_active = isActive;
      }

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows } = await Category.findAndCountAll({
        where,
        offset,
        limit,
        order: [['sort_order', 'ASC'], ['id', 'ASC']],
        include: [{ model: Category, as: 'subcategories', separate: true, order: [['sort_order', 'ASC']] }]
      });

      logger.info(`获取分类列表成功，共 ${count} 条记录`);
      return { categories: rows, total: count };
    } catch (error) {
      logger.error('获取分类列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取分类详情
   * @param id 分类ID
   * @returns 分类详情
   */
  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const category = await Category.findByPk(id, {
        include: [{ model: Category, as: 'subcategories', order: [['sort_order', 'ASC']] }]
      });
      return category;
    } catch (error) {
      logger.error(`获取分类详情失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 更新分类
   * @param id 分类ID
   * @param categoryData 更新数据
   * @returns 更新后的分类
   */
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return null;
      }

      await category.update(categoryData);
      logger.info(`更新分类成功: ${id} - ${category.name}`);
      return category;
    } catch (error) {
      logger.error(`更新分类失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 删除分类
   * @param id 分类ID
   * @returns 是否删除成功
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return false;
      }

      await category.destroy();
      logger.info(`删除分类成功: ${id} - ${category.name}`);
      return true;
    } catch (error) {
      logger.error(`删除分类失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 更新分类状态
   * @param id 分类ID
   * @param isActive 是否激活
   * @returns 更新后的分类
   */
  async updateCategoryStatus(id: number, isActive: boolean): Promise<Category | null> {
    try {
      return await this.updateCategory(id, { is_active: isActive });
    } catch (error) {
      logger.error(`更新分类状态失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 批量更新分类排序
   * @param sortData 排序数据
   * @returns 更新数量
   */
  async batchUpdateSortOrder(sortData: { id: number; sortOrder: number }[]): Promise<number> {
    try {
      const promises = sortData.map(item =>
        Category.update({ sort_order: item.sortOrder }, { where: { id: item.id } })
      );

      const results = await Promise.all(promises);
      const updatedCount = results.reduce((sum, [count]) => sum + count, 0);

      logger.info(`批量更新分类排序成功，共更新 ${updatedCount} 条记录`);
      return updatedCount;
    } catch (error) {
      logger.error('批量更新分类排序失败:', error);
      throw error;
    }
  }

  /**
   * 获取分类树
   * @param isActive 是否只获取激活的分类
   * @returns 分类树结构
   */
  async getCategoryTree(isActive?: boolean): Promise<Category[]> {
    try {
      const where: any = { parent_id: null };

      if (isActive !== undefined) {
        where.is_active = isActive;
      }

      const categories = await Category.findAll({
        where,
        order: [['sort_order', 'ASC'], ['id', 'ASC']],
        include: [{ 
          model: Category, 
          as: 'subcategories', 
          order: [['sort_order', 'ASC']],
          include: [{ 
            model: Category, 
            as: 'subcategories', 
            order: [['sort_order', 'ASC']]
          }]
        }]
      });

      logger.info(`获取分类树成功`);
      return categories;
    } catch (error) {
      logger.error('获取分类树失败:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
