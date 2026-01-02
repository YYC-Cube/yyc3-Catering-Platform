/**
 * @file 知识图谱仓库
 * @description 提供知识图谱数据的持久化存储和查询
 * @module repositories/graph.repository
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { KnowledgeGraph } from './document.types';
import { Logger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class GraphRepository {
  private logger: Logger;
  private dataDir: string;
  private graphFile: string;

  constructor(dataDir: string = '/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-数据') {
    this.logger = new Logger('GraphRepository');
    this.dataDir = dataDir;
    this.graphFile = path.join(dataDir, 'knowledge-graph.json');
  }

  /**
   * 初始化仓库
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing graph repository');

      // 确保数据目录存在
      await fs.mkdir(this.dataDir, { recursive: true });

      this.logger.info('Graph repository initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize graph repository', { error });
      throw error;
    }
  }

  /**
   * 保存知识图谱
   * @param graph 知识图谱
   */
  async save(graph: KnowledgeGraph): Promise<void> {
    try {
      this.logger.info('Saving knowledge graph', { graphId: graph.id });

      // 确保数据目录存在
      await fs.mkdir(this.dataDir, { recursive: true });

      // 保存到文件
      const data = JSON.stringify(graph, null, 2);
      await fs.writeFile(this.graphFile, data, 'utf-8');

      this.logger.info('Knowledge graph saved successfully', { graphId: graph.id });
    } catch (error) {
      this.logger.error('Failed to save knowledge graph', { graphId: graph.id, error });
      throw error;
    }
  }

  /**
   * 获取最新的知识图谱
   * @returns 知识图谱
   */
  async getLatest(): Promise<KnowledgeGraph | null> {
    try {
      this.logger.info('Getting latest knowledge graph');

      // 检查文件是否存在
      try {
        await fs.access(this.graphFile);
      } catch {
        return null;
      }

      // 读取文件
      const data = await fs.readFile(this.graphFile, 'utf-8');
      const graph = JSON.parse(data) as KnowledgeGraph;

      this.logger.info('Knowledge graph retrieved successfully', { graphId: graph.id });
      return graph;
    } catch (error) {
      this.logger.error('Failed to get latest knowledge graph', { error });
      throw error;
    }
  }

  /**
   * 根据ID获取知识图谱
   * @param id 图谱ID
   * @returns 知识图谱
   */
  async getById(id: string): Promise<KnowledgeGraph | null> {
    try {
      this.logger.info('Getting knowledge graph by ID', { id });

      const graph = await this.getLatest();
      if (graph && graph.id === id) {
        return graph;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get knowledge graph by ID', { id, error });
      throw error;
    }
  }

  /**
   * 根据版本号获取知识图谱
   * @param version 版本号
   * @returns 知识图谱
   */
  async getByVersion(version: string): Promise<KnowledgeGraph | null> {
    try {
      this.logger.info('Getting knowledge graph by version', { version });

      const graph = await this.getLatest();
      if (graph && graph.version === version) {
        return graph;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get knowledge graph by version', { version, error });
      throw error;
    }
  }

  /**
   * 获取所有知识图谱
   * @returns 知识图谱列表
   */
  async getAll(): Promise<KnowledgeGraph[]> {
    try {
      this.logger.info('Getting all knowledge graphs');

      const graph = await this.getLatest();
      return graph ? [graph] : [];
    } catch (error) {
      this.logger.error('Failed to get all knowledge graphs', { error });
      throw error;
    }
  }

  /**
   * 更新知识图谱
   * @param id 图谱ID
   * @param graph 知识图谱
   */
  async update(id: string, graph: KnowledgeGraph): Promise<void> {
    try {
      this.logger.info('Updating knowledge graph', { id });

      // 验证ID
      if (graph.id !== id) {
        throw new Error('Graph ID mismatch');
      }

      // 保存更新
      await this.save(graph);

      this.logger.info('Knowledge graph updated successfully', { id });
    } catch (error) {
      this.logger.error('Failed to update knowledge graph', { id, error });
      throw error;
    }
  }

  /**
   * 删除知识图谱
   * @param id 图谱ID
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting knowledge graph', { id });

      // 检查文件是否存在
      try {
        await fs.access(this.graphFile);
      } catch {
        return;
      }

      // 删除文件
      await fs.unlink(this.graphFile);

      this.logger.info('Knowledge graph deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete knowledge graph', { id, error });
      throw error;
    }
  }

  /**
   * 根据版本号删除知识图谱
   * @param version 版本号
   */
  async deleteByVersion(version: string): Promise<void> {
    try {
      this.logger.info('Deleting knowledge graph by version', { version });

      const graph = await this.getByVersion(version);
      if (graph) {
        await this.delete(graph.id);
      }

      this.logger.info('Knowledge graph deleted successfully by version', { version });
    } catch (error) {
      this.logger.error('Failed to delete knowledge graph by version', { version, error });
      throw error;
    }
  }

  /**
   * 删除所有知识图谱
   */
  async deleteAll(): Promise<void> {
    try {
      this.logger.info('Deleting all knowledge graphs');

      // 检查文件是否存在
      try {
        await fs.access(this.graphFile);
      } catch {
        return;
      }

      // 删除文件
      await fs.unlink(this.graphFile);

      this.logger.info('All knowledge graphs deleted successfully');
    } catch (error) {
      this.logger.error('Failed to delete all knowledge graphs', { error });
      throw error;
    }
  }

  /**
   * 获取所有知识图谱版本
   * @returns 图谱版本列表
   */
  async getAllVersions(): Promise<KnowledgeGraph[]> {
    try {
      this.logger.info('Getting all graph versions');

      const graph = await this.getLatest();
      return graph ? [graph] : [];
    } catch (error) {
      this.logger.error('Failed to get all graph versions', { error });
      throw error;
    }
  }
}
