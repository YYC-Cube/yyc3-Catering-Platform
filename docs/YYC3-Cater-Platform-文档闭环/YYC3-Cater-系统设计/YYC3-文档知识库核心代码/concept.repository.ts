/**
 * @file 概念仓库
 * @description 提供概念数据的持久化存储和查询
 * @module repositories/concept.repository
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Concept } from './document.types';
import { Logger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ConceptRepository {
  private logger: Logger;
  private dataDir: string;
  private conceptsFile: string;
  private concepts: Map<string, Concept>;

  constructor(dataDir: string = '/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-数据') {
    this.logger = new Logger('ConceptRepository');
    this.dataDir = dataDir;
    this.conceptsFile = path.join(dataDir, 'concepts.json');
    this.concepts = new Map();
  }

  /**
   * 初始化仓库
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing concept repository');

      // 确保数据目录存在
      await fs.mkdir(this.dataDir, { recursive: true });

      // 加载现有数据
      await this.load();

      this.logger.info('Concept repository initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize concept repository', { error });
      throw error;
    }
  }

  /**
   * 保存概念
   * @param concept 概念
   */
  async save(concept: Concept): Promise<void> {
    try {
      this.logger.info('Saving concept', { conceptId: concept.id });

      // 添加到内存
      this.concepts.set(concept.id, concept);

      // 持久化
      await this.persist();

      this.logger.info('Concept saved successfully', { conceptId: concept.id });
    } catch (error) {
      this.logger.error('Failed to save concept', { conceptId: concept.id, error });
      throw error;
    }
  }

  /**
   * 批量保存概念
   * @param concepts 概念列表
   */
  async saveAll(concepts: Concept[]): Promise<void> {
    try {
      this.logger.info('Saving concepts', { count: concepts.length });

      // 添加到内存
      concepts.forEach((concept) => {
        this.concepts.set(concept.id, concept);
      });

      // 持久化
      await this.persist();

      this.logger.info('Concepts saved successfully', { count: concepts.length });
    } catch (error) {
      this.logger.error('Failed to save concepts', { error });
      throw error;
    }
  }

  /**
   * 根据ID获取概念
   * @param id 概念ID
   * @returns 概念
   */
  async getById(id: string): Promise<Concept | null> {
    try {
      this.logger.info('Getting concept by ID', { id });

      const concept = this.concepts.get(id);
      return concept || null;
    } catch (error) {
      this.logger.error('Failed to get concept by ID', { id, error });
      throw error;
    }
  }

  /**
   * 根据名称获取概念
   * @param name 概念名称
   * @returns 概念
   */
  async getByName(name: string): Promise<Concept | null> {
    try {
      this.logger.info('Getting concept by name', { name });

      for (const concept of this.concepts.values()) {
        if (concept.name === name) {
          return concept;
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get concept by name', { name, error });
      throw error;
    }
  }

  /**
   * 获取所有概念
   * @returns 概念列表
   */
  async getAll(): Promise<Concept[]> {
    try {
      this.logger.info('Getting all concepts');

      return Array.from(this.concepts.values());
    } catch (error) {
      this.logger.error('Failed to get all concepts', { error });
      throw error;
    }
  }

  /**
   * 根据分类获取概念
   * @param category 分类
   * @returns 概念列表
   */
  async getByCategory(category: string): Promise<Concept[]> {
    try {
      this.logger.info('Getting concepts by category', { category });

      const concepts: Concept[] = [];
      for (const concept of this.concepts.values()) {
        if (concept.category === category) {
          concepts.push(concept);
        }
      }

      return concepts;
    } catch (error) {
      this.logger.error('Failed to get concepts by category', { category, error });
      throw error;
    }
  }

  /**
   * 搜索概念
   * @param query 查询字符串
   * @param category 分类（可选）
   * @param limit 限制数量（可选）
   * @returns 概念列表
   */
  async search(query: string, category?: string, limit?: number): Promise<Concept[]> {
    try {
      this.logger.info('Searching concepts', { query, category, limit });

      const queryLower = query.toLowerCase();
      const results: Concept[] = [];

      for (const concept of this.concepts.values()) {
        // 分类过滤
        if (category && concept.category !== category) {
          continue;
        }

        // 关键词匹配
        if (
          concept.name.toLowerCase().includes(queryLower) ||
          concept.description.toLowerCase().includes(queryLower)
        ) {
          results.push(concept);
        }
      }

      // 限制数量
      if (limit && limit > 0) {
        return results.slice(0, limit);
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to search concepts', { query, category, limit, error });
      throw error;
    }
  }

  /**
   * 获取相关概念
   * @param conceptId 概念ID
   * @param limit 限制数量
   * @returns 相关概念列表
   */
  async getRelated(conceptId: string, limit: number = 10): Promise<Concept[]> {
    try {
      this.logger.info('Getting related concepts', { conceptId, limit });

      const concept = await this.getById(conceptId);
      if (!concept) {
        return [];
      }

      // 获取同一分类下的其他概念
      const relatedConcepts = Array.from(this.concepts.values())
        .filter(c => c.id !== conceptId && c.category === concept.category)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, limit);

      return relatedConcepts;
    } catch (error) {
      this.logger.error('Failed to get related concepts', { conceptId, limit, error });
      throw error;
    }
  }

  /**
   * 更新概念
   * @param id 概念ID
   * @param concept 概念
   */
  async update(id: string, concept: Concept): Promise<void> {
    try {
      this.logger.info('Updating concept', { id });

      // 验证ID
      if (concept.id !== id) {
        throw new Error('Concept ID mismatch');
      }

      // 更新内存
      this.concepts.set(id, concept);

      // 持久化
      await this.persist();

      this.logger.info('Concept updated successfully', { id });
    } catch (error) {
      this.logger.error('Failed to update concept', { id, error });
      throw error;
    }
  }

  /**
   * 删除概念
   * @param id 概念ID
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting concept', { id });

      // 从内存删除
      this.concepts.delete(id);

      // 持久化
      await this.persist();

      this.logger.info('Concept deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete concept', { id, error });
      throw error;
    }
  }

  /**
   * 获取概念统计
   * @returns 统计数据
   */
  async getStatistics(): Promise<{
    totalConcepts: number;
    categoryDistribution: Record<string, number>;
    avgFrequency: number;
    topConcepts: Concept[];
  }> {
    try {
      this.logger.info('Getting concept statistics');

      const concepts = Array.from(this.concepts.values());
      const totalConcepts = concepts.length;

      // 分类分布
      const categoryDistribution: Record<string, number> = {};
      concepts.forEach((concept) => {
        categoryDistribution[concept.category] = (categoryDistribution[concept.category] || 0) + 1;
      });

      // 平均频率
      const avgFrequency = concepts.length > 0
        ? concepts.reduce((sum, concept) => sum + concept.frequency, 0) / concepts.length
        : 0;

      // 热门概念
      const topConcepts = concepts
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      return {
        totalConcepts,
        categoryDistribution,
        avgFrequency,
        topConcepts,
      };
    } catch (error) {
      this.logger.error('Failed to get concept statistics', { error });
      throw error;
    }
  }

  /**
   * 加载数据
   */
  private async load(): Promise<void> {
    try {
      // 检查文件是否存在
      try {
        await fs.access(this.conceptsFile);
      } catch {
        return;
      }

      // 读取文件
      const data = await fs.readFile(this.conceptsFile, 'utf-8');
      const concepts = JSON.parse(data) as Concept[];

      // 加载到内存
      this.concepts.clear();
      concepts.forEach((concept) => {
        this.concepts.set(concept.id, concept);
      });

      this.logger.info('Concepts loaded successfully', { count: concepts.length });
    } catch (error) {
      this.logger.error('Failed to load concepts', { error });
      throw error;
    }
  }

  /**
   * 持久化数据
   */
  private async persist(): Promise<void> {
    try {
      // 转换为数组
      const concepts = Array.from(this.concepts.values());

      // 保存到文件
      const data = JSON.stringify(concepts, null, 2);
      await fs.writeFile(this.conceptsFile, data, 'utf-8');

      this.logger.info('Concepts persisted successfully', { count: concepts.length });
    } catch (error) {
      this.logger.error('Failed to persist concepts', { error });
      throw error;
    }
  }
}
