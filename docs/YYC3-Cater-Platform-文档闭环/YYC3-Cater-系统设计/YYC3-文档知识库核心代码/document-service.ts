/**
 * @file 文档管理服务
 * @description 提供文档的CRUD操作、版本管理、分类管理等功能
 * @module services/document-service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentVersion, DocumentStatus } from './document.types';
import { DocumentRepository } from './document.repository';
import { VersionRepository } from './version.repository';
import { QualityAssessmentService } from './quality-assessment.service';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { Logger } from './logger';

export class DocumentService {
  private documentRepository: DocumentRepository;
  private versionRepository: VersionRepository;
  private qualityService: QualityAssessmentService;
  private graphService: KnowledgeGraphService;
  private logger: Logger;

  constructor() {
    this.documentRepository = new DocumentRepository();
    this.versionRepository = new VersionRepository();
    this.qualityService = new QualityAssessmentService();
    this.graphService = new KnowledgeGraphService();
    this.logger = new Logger('DocumentService');
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing document service');
      await this.documentRepository.initialize();
      await this.versionRepository.initialize();
      this.logger.info('Document service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize document service', { error });
      throw error;
    }
  }

  /**
   * 创建新文档
   * @param data 文档数据
   * @returns 创建的文档
   */
  async createDocument(data: {
    title: string;
    description?: string;
    content: string;
    category: string;
    subcategory?: string;
    tags?: string[];
    keywords?: string[];
    author: string;
  }): Promise<Document> {
    try {
      this.logger.info('Creating document', { title: data.title });

      // 生成文档ID
      const documentId = uuidv4();

      // 评估文档质量
      const qualityScore = await this.qualityService.assessDocument(data.content);

      // 创建文档对象
      const document: Document = {
        id: documentId,
        number: `DOC-${Date.now()}`, // 生成文档编号
        title: data.title,
        description: data.description || '',
        content: data.content,
        category: data.category,
        subcategory: data.subcategory || '',
        tags: data.tags || [],
        keywords: data.keywords || [],
        qualityScore: qualityScore.overallScore,
        qualityMetrics: qualityScore.metrics,
        version: '1.0.0',
        versions: [],
        status: DocumentStatus.DRAFT,
        viewCount: 0,
        likeCount: 0,
        shareCount: 0,
        commentCount: 0,
        references: [],
        referencedBy: [],
        relatedDocuments: [],
        author: data.author,
        createdAt: new Date(),
        updatedAt: new Date(),
        concepts: [],
      };

      // 保存文档
      await this.documentRepository.create(document);

      // 创建初始版本
      await this.createVersion(documentId, '1.0.0', data.content, '初始版本', data.author);

      // 提取概念并更新知识图谱
      const concepts = await this.extractConcepts(data.content);
      document.concepts = concepts;
      await this.graphService.addDocumentToGraph(document);

      this.logger.info('Document created successfully', { documentId });
      return document;
    } catch (error) {
      this.logger.error('Failed to create document', { error });
      throw error;
    }
  }

  /**
   * 获取文档详情
   * @param documentId 文档ID
   * @returns 文档详情
   */
  async getDocument(documentId: string): Promise<Document | null> {
    try {
      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        return null;
      }

      // 增加浏览次数
      await this.incrementViewCount(documentId);

      return document;
    } catch (error) {
      this.logger.error('Failed to get document', { documentId, error });
      throw error;
    }
  }

  /**
   * 更新文档
   * @param documentId 文档ID
   * @param data 更新数据
   * @returns 更新后的文档
   */
  async updateDocument(
    documentId: string,
    data: {
      title?: string;
      description?: string;
      content?: string;
      category?: string;
      subcategory?: string;
      tags?: string[];
      keywords?: string[];
    }
  ): Promise<Document | null> {
    try {
      this.logger.info('Updating document', { documentId });

      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        return null;
      }

      // 更新字段
      if (data.title) document.title = data.title;
      if (data.description !== undefined) document.description = data.description;
      if (data.content) document.content = data.content;
      if (data.category) document.category = data.category;
      if (data.subcategory !== undefined) document.subcategory = data.subcategory;
      if (data.tags) document.tags = data.tags;
      if (data.keywords) document.keywords = data.keywords;

      // 如果内容发生变化,重新评估质量
      if (data.content) {
        const qualityScore = await this.qualityService.assessDocument(data.content);
        document.qualityScore = qualityScore.overallScore;
        document.qualityMetrics = qualityScore.metrics;

        // 提取概念
        const concepts = await this.extractConcepts(data.content);
        document.concepts = concepts;

        // 更新知识图谱
        await this.graphService.updateDocumentInGraph(document);
      }

      document.updatedAt = new Date();

      // 保存更新
      await this.documentRepository.update(documentId, document);

      this.logger.info('Document updated successfully', { documentId });
      return document;
    } catch (error) {
      this.logger.error('Failed to update document', { documentId, error });
      throw error;
    }
  }

  /**
   * 删除文档
   * @param documentId 文档ID
   * @returns 是否删除成功
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.logger.info('Deleting document', { documentId });

      // 从知识图谱中删除
      await this.graphService.removeDocumentFromGraph(documentId);

      // 删除文档
      const result = await this.documentRepository.delete(documentId);

      if (result) {
        this.logger.info('Document deleted successfully', { documentId });
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to delete document', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取文档列表
   * @param filters 过滤条件
   * @param pagination 分页参数
   * @returns 文档列表和总数
   */
  async getDocuments(
    filters: {
      category?: string;
      subcategory?: string;
      tags?: string[];
      keywords?: string[];
      author?: string;
      status?: DocumentStatus;
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
      const result = await this.documentRepository.findMany(filters, pagination);
      return result;
    } catch (error) {
      this.logger.error('Failed to get documents', { filters, pagination, error });
      throw error;
    }
  }

  /**
   * 获取所有文档（别名方法）
   * @returns 文档列表
   */
  async getAllDocuments(): Promise<Document[]> {
    try {
      const result = await this.documentRepository.findAll();
      return result;
    } catch (error) {
      this.logger.error('Failed to get all documents', { error });
      throw error;
    }
  }

  /**
   * 根据分类获取文档（别名方法）
   * @param category 分类
   * @returns 文档列表
   */
  async getDocumentsByCategory(category: string): Promise<Document[]> {
    try {
      const result = await this.documentRepository.getByCategory(category);
      return result;
    } catch (error) {
      this.logger.error('Failed to get documents by category', { category, error });
      throw error;
    }
  }

  /**
   * 根据状态获取文档（别名方法）
   * @param status 状态
   * @returns 文档列表
   */
  async getDocumentsByStatus(status: string): Promise<Document[]> {
    try {
      const result = await this.documentRepository.getByStatus(status);
      return result;
    } catch (error) {
      this.logger.error('Failed to get documents by status', { status, error });
      throw error;
    }
  }

  /**
   * 创建文档版本
   * @param documentId 文档ID
   * @param version 版本号
   * @param content 内容
   * @param changes 变更说明
   * @param author 作者
   * @returns 创建的版本
   */
  async createVersion(
    documentId: string,
    version: string,
    content: string,
    changes: string,
    author: string
  ): Promise<DocumentVersion> {
    try {
      this.logger.info('Creating document version', { documentId, version });

      const documentVersion: DocumentVersion = {
        id: uuidv4(),
        documentId,
        version,
        status: DocumentStatus.DRAFT,
        content,
        changes,
        author,
        createdAt: new Date(),
      };

      await this.versionRepository.save(documentVersion);

      // 更新文档的版本列表
      const document = await this.documentRepository.findById(documentId);
      if (document) {
        document.versions.push(documentVersion);
        document.version = version;
        await this.documentRepository.update(documentId, document);
      }

      this.logger.info('Document version created successfully', {
        documentId,
        version,
      });

      return documentVersion;
    } catch (error) {
      this.logger.error('Failed to create document version', {
        documentId,
        version,
        error,
      });
      throw error;
    }
  }

  /**
   * 获取文档版本列表
   * @param documentId 文档ID
   * @returns 版本列表
   */
  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const versions = await this.versionRepository.getByDocumentId(documentId);
      return versions;
    } catch (error) {
      this.logger.error('Failed to get document versions', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取文档版本详情
   * @param documentId 文档ID
   * @param version 版本号
   * @returns 版本详情
   */
  async getVersion(
    documentId: string,
    version: string
  ): Promise<DocumentVersion | null> {
    try {
      const documentVersion = await this.versionRepository.getByDocumentIdAndVersion(
        documentId,
        version
      );
      return documentVersion;
    } catch (error) {
      this.logger.error('Failed to get document version', {
        documentId,
        version,
        error,
      });
      throw error;
    }
  }

  /**
   * 恢复文档到指定版本
   * @param documentId 文档ID
   * @param version 要恢复的版本号
   * @param author 操作者
   * @returns 恢复后的文档
   */
  async restoreVersion(
    documentId: string,
    version: string,
    author: string
  ): Promise<Document | null> {
    try {
      this.logger.info('Restoring document version', { documentId, version });

      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        return null;
      }

      // 获取要恢复的版本
      const targetVersion = await this.versionRepository.getByDocumentIdAndVersion(
        documentId,
        version
      );

      if (!targetVersion) {
        throw new Error(`版本 ${version} 不存在`);
      }

      // 保存当前内容作为新版本
      const currentVersion = this.incrementVersion(document.version);
      await this.createVersion(
        documentId,
        currentVersion,
        document.content,
        `恢复前备份 (从版本 ${version} 恢复)`,
        author
      );

      // 恢复内容
      document.content = targetVersion.content;
      document.version = this.incrementVersion(currentVersion);
      document.updatedAt = new Date();

      // 重新评估质量
      const qualityScore = await this.qualityService.assessDocument(document.content);
      document.qualityScore = qualityScore.overallScore;
      document.qualityMetrics = qualityScore.metrics;

      // 提取概念
      const concepts = await this.extractConcepts(document.content);
      document.concepts = concepts;

      // 更新知识图谱
      await this.graphService.updateDocumentInGraph(document);

      // 保存更新
      await this.documentRepository.update(documentId, document);

      this.logger.info('Document version restored successfully', {
        documentId,
        version,
        newVersion: document.version,
      });

      return document;
    } catch (error) {
      this.logger.error('Failed to restore document version', {
        documentId,
        version,
        error,
      });
      throw error;
    }
  }

  /**
   * 增加版本号
   * @param version 当前版本号
   * @returns 新版本号
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2] += 1; // 增加补丁版本号
    return parts.join('.');
  }

  /**
   * 发布文档
   * @param documentId 文档ID
   * @returns 发布后的文档
   */
  async publishDocument(documentId: string): Promise<Document | null> {
    try {
      this.logger.info('Publishing document', { documentId });

      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        return null;
      }

      document.status = DocumentStatus.PUBLISHED;
      document.publishedAt = new Date();
      document.updatedAt = new Date();

      await this.documentRepository.update(documentId, document);

      this.logger.info('Document published successfully', { documentId });
      return document;
    } catch (error) {
      this.logger.error('Failed to publish document', { documentId, error });
      throw error;
    }
  }

  /**
   * 归档文档
   * @param documentId 文档ID
   * @returns 归档后的文档
   */
  async archiveDocument(documentId: string): Promise<Document | null> {
    try {
      this.logger.info('Archiving document', { documentId });

      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        return null;
      }

      document.status = DocumentStatus.ARCHIVED;
      document.updatedAt = new Date();

      await this.documentRepository.update(documentId, document);

      this.logger.info('Document archived successfully', { documentId });
      return document;
    } catch (error) {
      this.logger.error('Failed to archive document', { documentId, error });
      throw error;
    }
  }

  /**
   * 增加浏览次数
   * @param documentId 文档ID
   */
  private async incrementViewCount(documentId: string): Promise<void> {
    try {
      await this.documentRepository.incrementViewCount(documentId);
    } catch (error) {
      this.logger.error('Failed to increment view count', { documentId, error });
    }
  }

  /**
   * 提取文档中的概念
   * @param content 文档内容
   * @returns 概念列表
   */
  private async extractConcepts(content: string): Promise<string[]> {
    try {
      // 这里可以调用NLP服务提取概念
      // 暂时使用简单的关键词提取
      const concepts: string[] = [];

      // 提取标题作为概念
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        concepts.push(titleMatch[1].trim());
      }

      // 提取二级标题作为概念
      const subtitleMatches = content.match(/^##\s+(.+)$/gm);
      if (subtitleMatches) {
        subtitleMatches.forEach((match) => {
          const subtitle = match.replace(/^##\s+/, '').trim();
          if (subtitle.length > 2 && subtitle.length < 20) {
            concepts.push(subtitle);
          }
        });
      }

      // 去重
      return [...new Set(concepts)];
    } catch (error) {
      this.logger.error('Failed to extract concepts', { error });
      return [];
    }
  }

  /**
   * 获取相关文档
   * @param documentId 文档ID
   * @param limit 数量限制
   * @returns 相关文档列表
   */
  async getRelatedDocuments(
    documentId: string,
    limit: number = 10
  ): Promise<Document[]> {
    try {
      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        return [];
      }

      // 从知识图谱获取相关文档
      const relatedDocumentIds = await this.graphService.getRelatedDocuments(
        documentId,
        limit
      );

      // 获取文档详情
      const documents = await this.documentRepository.findByIds(relatedDocumentIds);

      return documents;
    } catch (error) {
      this.logger.error('Failed to get related documents', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取文档统计信息
   * @param filters 过滤条件
   * @returns 统计信息
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
      const stats = await this.documentRepository.getStatistics(filters);
      return stats;
    } catch (error) {
      this.logger.error('Failed to get statistics', { filters, error });
      throw error;
    }
  }
}
