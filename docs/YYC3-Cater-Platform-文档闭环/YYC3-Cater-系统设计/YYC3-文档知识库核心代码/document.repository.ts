/**
 * @file 文档仓库
 * @description 提供文档数据的持久化存储和查询
 * @module repositories/document.repository
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Document, DocumentVersion, DocumentStatus } from './document.types';
import { Logger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class DocumentRepository {
  private logger: Logger;
  private dataDir: string;
  private documentsFile: string;
  private documents: Map<string, Document>;

  constructor(dataDir: string = '/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-数据') {
    this.logger = new Logger('DocumentRepository');
    this.dataDir = dataDir;
    this.documentsFile = path.join(dataDir, 'documents.json');
    this.documents = new Map();
  }

  /**
   * 初始化仓库
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing document repository');

      // 确保数据目录存在
      await fs.mkdir(this.dataDir, { recursive: true });

      // 加载现有数据
      await this.load();

      this.logger.info('Document repository initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize document repository', { error });
      throw error;
    }
  }

  /**
   * 保存文档
   * @param document 文档
   */
  async save(document: Document): Promise<void> {
    try {
      this.logger.info('Saving document', { documentId: document.id });

      // 添加到内存
      this.documents.set(document.id, document);

      // 持久化
      await this.persist();

      this.logger.info('Document saved successfully', { documentId: document.id });
    } catch (error) {
      this.logger.error('Failed to save document', { documentId: document.id, error });
      throw error;
    }
  }

  /**
   * 创建文档（别名方法）
   * @param document 文档
   */
  async create(document: Document): Promise<void> {
    return this.save(document);
  }

  /**
   * 批量保存文档
   * @param documents 文档列表
   */
  async saveAll(documents: Document[]): Promise<void> {
    try {
      this.logger.info('Saving documents', { count: documents.length });

      // 添加到内存
      documents.forEach((document) => {
        this.documents.set(document.id, document);
      });

      // 持久化
      await this.persist();

      this.logger.info('Documents saved successfully', { count: documents.length });
    } catch (error) {
      this.logger.error('Failed to save documents', { error });
      throw error;
    }
  }

  /**
   * 根据ID获取文档
   * @param id 文档ID
   * @returns 文档
   */
  async getById(id: string): Promise<Document | null> {
    try {
      this.logger.info('Getting document by ID', { id });

      const document = this.documents.get(id);
      return document || null;
    } catch (error) {
      this.logger.error('Failed to get document by ID', { id, error });
      throw error;
    }
  }

  /**
   * 根据ID获取文档（别名方法）
   * @param id 文档ID
   * @returns 文档
   */
  async findById(id: string): Promise<Document | null> {
    return this.getById(id);
  }

  /**
   * 根据ID列表获取文档
   * @param ids 文档ID列表
   * @returns 文档列表
   */
  async getByIds(ids: string[]): Promise<Document[]> {
    try {
      this.logger.info('Getting documents by IDs', { count: ids.length });

      const documents: Document[] = [];
      for (const id of ids) {
        const document = this.documents.get(id);
        if (document) {
          documents.push(document);
        }
      }

      return documents;
    } catch (error) {
      this.logger.error('Failed to get documents by IDs', { ids, error });
      throw error;
    }
  }

  /**
   * 根据ID列表获取文档（别名方法）
   * @param ids 文档ID列表
   * @returns 文档列表
   */
  async findByIds(ids: string[]): Promise<Document[]> {
    return this.getByIds(ids);
  }

  /**
   * 根据编号获取文档
   * @param number 文档编号
   * @returns 文档
   */
  async getByNumber(number: string): Promise<Document | null> {
    try {
      this.logger.info('Getting document by number', { number });

      for (const document of this.documents.values()) {
        if (document.number === number) {
          return document;
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get document by number', { number, error });
      throw error;
    }
  }

  /**
   * 获取所有文档
   * @returns 文档列表
   */
  async getAll(): Promise<Document[]> {
    try {
      this.logger.info('Getting all documents');

      return Array.from(this.documents.values());
    } catch (error) {
      this.logger.error('Failed to get all documents', { error });
      throw error;
    }
  }

  /**
   * 获取所有文档（别名方法）
   * @returns 文档列表
   */
  async findAll(): Promise<Document[]> {
    return this.getAll();
  }

  /**
   * 根据分类获取文档
   * @param category 分类
   * @returns 文档列表
   */
  async getByCategory(category: string): Promise<Document[]> {
    try {
      this.logger.info('Getting documents by category', { category });

      const documents: Document[] = [];
      for (const document of this.documents.values()) {
        if (document.category === category) {
          documents.push(document);
        }
      }

      return documents;
    } catch (error) {
      this.logger.error('Failed to get documents by category', { category, error });
      throw error;
    }
  }

  /**
   * 根据状态获取文档
   * @param status 状态
   * @returns 文档列表
   */
  async getByStatus(status: string): Promise<Document[]> {
    try {
      this.logger.info('Getting documents by status', { status });

      const documents: Document[] = [];
      for (const document of this.documents.values()) {
        if (document.status === status) {
          documents.push(document);
        }
      }

      return documents;
    } catch (error) {
      this.logger.error('Failed to get documents by status', { status, error });
      throw error;
    }
  }

  /**
   * 搜索文档
   * @param query 查询字符串
   * @returns 文档列表
   */
  async search(query: string): Promise<Document[]> {
    try {
      this.logger.info('Searching documents', { query });

      const queryLower = query.toLowerCase();
      const results: Document[] = [];

      for (const document of this.documents.values()) {
        if (
          document.title.toLowerCase().includes(queryLower) ||
          document.content.toLowerCase().includes(queryLower) ||
          document.number.toLowerCase().includes(queryLower)
        ) {
          results.push(document);
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to search documents', { query, error });
      throw error;
    }
  }

  /**
   * 查询多个文档（支持过滤和分页）
   * @param filters 过滤条件
   * @param pagination 分页参数
   * @returns 文档列表和总数
   */
  async findMany(
    filters: {
      category?: string;
      subcategory?: string;
      tags?: string[];
      keywords?: string[];
      author?: string;
      status?: string;
      minQualityScore?: number;
      maxQualityScore?: number;
      search?: string;
    } = {},
    pagination: {
      page: number;
      pageSize: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = { page: 1, pageSize: 20 }
  ): Promise<{ documents: Document[]; total: number }> {
    try {
      this.logger.info('Finding documents', { filters, pagination });

      let documents = Array.from(this.documents.values());

      // 应用过滤条件
      if (filters.category) {
        documents = documents.filter(doc => doc.category === filters.category);
      }
      if (filters.subcategory) {
        documents = documents.filter(doc => doc.subcategory === filters.subcategory);
      }
      if (filters.tags && filters.tags.length > 0) {
        documents = documents.filter(doc =>
          filters.tags!.some(tag => doc.tags.includes(tag))
        );
      }
      if (filters.keywords && filters.keywords.length > 0) {
        documents = documents.filter(doc =>
          filters.keywords!.some(keyword => doc.keywords.includes(keyword))
        );
      }
      if (filters.author) {
        documents = documents.filter(doc => doc.author === filters.author);
      }
      if (filters.status) {
        documents = documents.filter(doc => doc.status === filters.status);
      }
      if (filters.minQualityScore !== undefined) {
        documents = documents.filter(doc => doc.qualityScore >= filters.minQualityScore!);
      }
      if (filters.maxQualityScore !== undefined) {
        documents = documents.filter(doc => doc.qualityScore <= filters.maxQualityScore!);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        documents = documents.filter(doc =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.content.toLowerCase().includes(searchLower) ||
          doc.description.toLowerCase().includes(searchLower)
        );
      }

      // 计算总数
      const total = documents.length;

      // 排序
      if (pagination.sortBy) {
        documents.sort((a, b) => {
          const aValue = (a as any)[pagination.sortBy!];
          const bValue = (b as any)[pagination.sortBy!];
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return pagination.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // 分页
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedDocuments = documents.slice(startIndex, endIndex);

      return {
        documents: paginatedDocuments,
        total
      };
    } catch (error) {
      this.logger.error('Failed to find documents', { filters, pagination, error });
      throw error;
    }
  }

  /**
   * 更新文档
   * @param id 文档ID
   * @param document 文档
   */
  async update(id: string, document: Document): Promise<void> {
    try {
      this.logger.info('Updating document', { id });

      // 验证ID
      if (document.id !== id) {
        throw new Error('Document ID mismatch');
      }

      // 更新内存
      this.documents.set(id, document);

      // 持久化
      await this.persist();

      this.logger.info('Document updated successfully', { id });
    } catch (error) {
      this.logger.error('Failed to update document', { id, error });
      throw error;
    }
  }

  /**
   * 删除文档
   * @param id 文档ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.logger.info('Deleting document', { id });

      // 检查文档是否存在
      const exists = this.documents.has(id);
      if (!exists) {
        return false;
      }

      // 从内存删除
      this.documents.delete(id);

      // 持久化
      await this.persist();

      this.logger.info('Document deleted successfully', { id });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete document', { id, error });
      throw error;
    }
  }

  /**
   * 增加浏览次数
   * @param id 文档ID
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      this.logger.info('Incrementing view count', { id });

      const document = this.documents.get(id);
      if (!document) {
        throw new Error('Document not found');
      }

      // 增加浏览次数
      document.viewCount = (document.viewCount || 0) + 1;
      document.updatedAt = new Date();

      // 持久化
      await this.persist();

      this.logger.info('View count incremented successfully', { id, viewCount: document.viewCount });
    } catch (error) {
      this.logger.error('Failed to increment view count', { id, error });
      throw error;
    }
  }

  /**
   * 获取文档统计
   * @param filters 过滤条件
   * @returns 统计数据
   */
  async getStatistics(filters: {
    category?: string;
    author?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{
    totalDocuments: number;
    publishedDocuments: number;
    draftDocuments: number;
    averageQualityScore: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
  }> {
    try {
      this.logger.info('Getting document statistics', { filters });

      let documents = Array.from(this.documents.values());

      // 应用过滤条件
      if (filters.category) {
        documents = documents.filter(doc => doc.category === filters.category);
      }
      if (filters.author) {
        documents = documents.filter(doc => doc.author === filters.author);
      }
      if (filters.startDate) {
        documents = documents.filter(doc => doc.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        documents = documents.filter(doc => doc.createdAt <= filters.endDate!);
      }

      const totalDocuments = documents.length;

      // 统计已发布和草稿文档
      const publishedDocuments = documents.filter(doc => doc.status === DocumentStatus.PUBLISHED).length;
      const draftDocuments = documents.filter(doc => doc.status === DocumentStatus.DRAFT).length;

      // 平均质量分数
      const averageQualityScore = documents.length > 0
        ? documents.reduce((sum, document) => sum + document.qualityScore, 0) / documents.length
        : 0;

      // 总浏览次数、点赞数、分享数
      const totalViews = documents.reduce((sum, document) => sum + (document.viewCount || 0), 0);
      const totalLikes = documents.reduce((sum, document) => sum + (document.likeCount || 0), 0);
      const totalShares = documents.reduce((sum, document) => sum + (document.shareCount || 0), 0);

      return {
        totalDocuments,
        publishedDocuments,
        draftDocuments,
        averageQualityScore,
        totalViews,
        totalLikes,
        totalShares,
      };
    } catch (error) {
      this.logger.error('Failed to get document statistics', { filters, error });
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
        await fs.access(this.documentsFile);
      } catch {
        return;
      }

      // 读取文件
      const data = await fs.readFile(this.documentsFile, 'utf-8');
      const documents = JSON.parse(data) as Document[];

      // 加载到内存
      this.documents.clear();
      documents.forEach((document) => {
        this.documents.set(document.id, document);
      });

      this.logger.info('Documents loaded successfully', { count: documents.length });
    } catch (error) {
      this.logger.error('Failed to load documents', { error });
      throw error;
    }
  }

  /**
   * 持久化数据
   */
  private async persist(): Promise<void> {
    try {
      // 转换为数组
      const documents = Array.from(this.documents.values());

      // 保存到文件
      const data = JSON.stringify(documents, null, 2);
      await fs.writeFile(this.documentsFile, data, 'utf-8');

      this.logger.info('Documents persisted successfully', { count: documents.length });
    } catch (error) {
      this.logger.error('Failed to persist documents', { error });
      throw error;
    }
  }
}

// 导出默认documentRepository实例
export const documentRepository = new DocumentRepository();
