/**
 * @file 智能检索引擎服务
 * @description 提供文档的智能检索、语义搜索、相似度计算等功能
 * @module services/search-service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Document } from './document.types';
import { DocumentRepository } from './document.repository';
import { KnowledgeGraphService } from './knowledge-graph-service';
import { Logger } from './logger';

export interface SearchResult {
  document: Document;
  score: number;
  relevance: number;
  highlights: string[];
  matchedConcepts: string[];
}

export interface SearchParams {
  query: string;
  category?: string;
  minQualityScore?: number;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

export interface SemanticSearchParams extends SearchParams {
  threshold?: number;
  useKnowledgeGraph?: boolean;
}

export class SearchService {
  private documentRepository: DocumentRepository;
  private knowledgeGraphService: KnowledgeGraphService;
  private logger: Logger;

  constructor() {
    this.documentRepository = new DocumentRepository();
    this.knowledgeGraphService = new KnowledgeGraphService();
    this.logger = new Logger('SearchService');
  }

  /**
   * 关键词搜索
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async keywordSearch(params: SearchParams): Promise<SearchResult[]> {
    try {
      this.logger.info('Performing keyword search', { query: params.query });

      const documents = await this.documentRepository.getAll();
      const results: SearchResult[] = [];

      // 构建查询词列表
      const queryTerms = this.tokenizeQuery(params.query);

      for (const document of documents) {
        // 过滤条件
        if (params.category && document.category !== params.category) {
          continue;
        }
        if (params.minQualityScore && document.qualityScore < params.minQualityScore) {
          continue;
        }

        // 计算匹配分数
        const score = this.calculateKeywordScore(document, queryTerms);

        if (score > 0) {
          const highlights = this.extractHighlights(document, queryTerms);
          const matchedConcepts = this.findMatchedConcepts(document, queryTerms);

          results.push({
            document,
            score,
            relevance: this.normalizeScore(score),
            highlights,
            matchedConcepts,
          });
        }
      }

      // 排序和分页
      results.sort((a, b) => b.score - a.score);
      const offset = params.offset || 0;
      const limit = params.limit || 10;

      return results.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error('Failed to perform keyword search', { params, error });
      throw error;
    }
  }

  /**
   * 语义搜索
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async semanticSearch(params: SemanticSearchParams): Promise<SearchResult[]> {
    try {
      this.logger.info('Performing semantic search', { query: params.query });

      const documents = await this.documentRepository.getAll();
      const results: SearchResult[] = [];

      // 获取查询的语义向量（简化版，实际应使用嵌入模型）
      const queryVector = this.computeSemanticVector(params.query);

      for (const document of documents) {
        // 过滤条件
        if (params.category && document.category !== params.category) {
          continue;
        }
        if (params.minQualityScore && document.qualityScore < params.minQualityScore) {
          continue;
        }

        // 计算语义相似度
        const documentVector = this.computeSemanticVector(
          document.title + ' ' + document.content
        );
        const similarity = this.computeCosineSimilarity(queryVector, documentVector);

        if (similarity >= (params.threshold || 0.3)) {
          const queryTerms = this.tokenizeQuery(params.query);
          const highlights = this.extractHighlights(document, queryTerms);
          const matchedConcepts = this.findMatchedConcepts(document, queryTerms);

          results.push({
            document,
            score: similarity,
            relevance: similarity,
            highlights,
            matchedConcepts,
          });
        }
      }

      // 使用知识图谱增强结果
      if (params.useKnowledgeGraph) {
        await this.enrichWithKnowledgeGraph(results, params.query);
      }

      // 排序和分页
      results.sort((a, b) => b.score - a.score);
      const offset = params.offset || 0;
      const limit = params.limit || 10;

      return results.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error('Failed to perform semantic search', { params, error });
      throw error;
    }
  }

  /**
   * 混合搜索（关键词+语义）
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async hybridSearch(params: SemanticSearchParams): Promise<SearchResult[]> {
    try {
      this.logger.info('Performing hybrid search', { query: params.query });

      // 执行关键词搜索
      const keywordResults = await this.keywordSearch(params);

      // 执行语义搜索
      const semanticResults = await this.semanticSearch(params);

      // 合并结果
      const resultMap = new Map<string, SearchResult>();

      // 添加关键词结果
      keywordResults.forEach((result) => {
        resultMap.set(result.document.id, {
          ...result,
          score: result.score * 0.6, // 关键词权重60%
        });
      });

      // 合并语义结果
      semanticResults.forEach((result) => {
        const existing = resultMap.get(result.document.id);
        if (existing) {
          // 如果已存在，合并分数
          existing.score += result.score * 0.4; // 语义权重40%
        } else {
          resultMap.set(result.document.id, {
            ...result,
            score: result.score * 0.4,
          });
        }
      });

      // 转换为数组并排序
      const results = Array.from(resultMap.values());
      results.sort((a, b) => b.score - a.score);

      // 分页
      const offset = params.offset || 0;
      const limit = params.limit || 10;

      return results.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error('Failed to perform hybrid search', { params, error });
      throw error;
    }
  }

  /**
   * 概念搜索
   * @param concepts 概念列表
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async conceptSearch(
    concepts: string[],
    params: Omit<SearchParams, 'query'>
  ): Promise<SearchResult[]> {
    try {
      this.logger.info('Performing concept search', { concepts });

      const documents = await this.documentRepository.getAll();
      const results: SearchResult[] = [];

      for (const document of documents) {
        // 过滤条件
        if (params.category && document.category !== params.category) {
          continue;
        }
        if (params.minQualityScore && document.qualityScore < params.minQualityScore) {
          continue;
        }

        // 计算概念匹配度
        const matchedConcepts = document.concepts.filter((c) => concepts.includes(c));
        const score = matchedConcepts.length / concepts.length;

        if (score > 0) {
          results.push({
            document,
            score,
            relevance: score,
            highlights: [],
            matchedConcepts,
          });
        }
      }

      // 排序和分页
      results.sort((a, b) => b.score - a.score);
      const offset = params.offset || 0;
      const limit = params.limit || 10;

      return results.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error('Failed to perform concept search', { concepts, params, error });
      throw error;
    }
  }

  /**
   * 获取相关文档
   * @param documentId 文档ID
   * @param limit 数量限制
   * @returns 推荐文档列表
   */
  async getRelatedDocuments(
    documentId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    try {
      this.logger.info('Getting related documents', { documentId, limit });

      // 从知识图谱获取相关文档
      const relatedDocIds = await this.knowledgeGraphService.getRelatedDocuments(
        documentId,
        limit * 2 // 获取更多候选
      );

      const documents = await this.documentRepository.getByIds(relatedDocIds);
      const results: SearchResult[] = [];

      for (const document of documents) {
        // 计算相似度分数
        const score = await this.calculateDocumentSimilarity(documentId, document.id);

        results.push({
          document,
          score,
          relevance: score,
          highlights: [],
          matchedConcepts: [],
        });
      }

      // 排序并返回
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get related documents', { documentId, limit, error });
      throw error;
    }
  }

  /**
   * 相关文档推荐
   * @param documentId 文档ID
   * @param limit 数量限制
   * @returns 推荐文档列表
   */
  async recommendRelatedDocuments(
    documentId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    return this.getRelatedDocuments(documentId, limit);
  }

  /**
   * 搜索建议
   * @param query 查询字符串
   * @param limit 数量限制
   * @returns 建议列表
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      this.logger.info('Getting search suggestions', { query });

      const documents = await this.documentRepository.getAll();
      const suggestions = new Set<string>();

      // 从标题提取建议
      documents.forEach((doc) => {
        const title = doc.title.toLowerCase();
        const queryLower = query.toLowerCase();

        if (title.includes(queryLower)) {
          // 提取包含查询词的短语
          const words = title.split(/\s+/);
          words.forEach((word) => {
            if (word.includes(queryLower) && word.length > 2) {
              suggestions.add(word);
            }
          });
        }
      });

      // 从概念提取建议
      documents.forEach((doc) => {
        doc.concepts.forEach((concept) => {
          const conceptLower = concept.toLowerCase();
          const queryLower = query.toLowerCase();

          if (conceptLower.includes(queryLower)) {
            suggestions.add(concept);
          }
        });
      });

      // 返回最相关的建议
      return Array.from(suggestions)
        .filter((s) => s.length > 2)
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get search suggestions', { query, error });
      throw error;
    }
  }

  /**
   * 搜索统计
   * @param query 查询字符串
   * @returns 统计信息
   */
  async getSearchStatistics(query: string): Promise<{
    totalResults: number;
    categoryDistribution: Record<string, number>;
    conceptDistribution: Record<string, number>;
    avgQualityScore: number;
  }> {
    try {
      const results = await this.hybridSearch({
        query,
        limit: 1000, // 获取更多结果用于统计
      });

      const categoryDistribution: Record<string, number> = {};
      const conceptDistribution: Record<string, number> = {};
      let totalQualityScore = 0;

      results.forEach((result) => {
        // 分类分布
        const category = result.document.category;
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;

        // 概念分布
        result.matchedConcepts.forEach((concept) => {
          conceptDistribution[concept] = (conceptDistribution[concept] || 0) + 1;
        });

        // 质量分数
        totalQualityScore += result.document.qualityScore;
      });

      return {
        totalResults: results.length,
        categoryDistribution,
        conceptDistribution,
        avgQualityScore: results.length > 0 ? totalQualityScore / results.length : 0,
      };
    } catch (error) {
      this.logger.error('Failed to get search statistics', { query, error });
      throw error;
    }
  }

  /**
   * 分词查询
   * @param query 查询字符串
   * @returns 词列表
   */
  private tokenizeQuery(query: string): string[] {
    // 简单的分词逻辑（实际应使用更复杂的分词器）
    return query
      .toLowerCase()
      .split(/[\s,，、。.!?！?]+/)
      .filter((term) => term.length > 1);
  }

  /**
   * 计算关键词分数
   * @param document 文档
   * @param queryTerms 查询词列表
   * @returns 分数
   */
  private calculateKeywordScore(document: Document, queryTerms: string[]): number {
    let score = 0;
    const content = (document.title + ' ' + document.content).toLowerCase();

    queryTerms.forEach((term) => {
      // 标题匹配权重更高
      if (document.title.toLowerCase().includes(term)) {
        score += 2.0;
      }
      // 内容匹配
      const matches = (content.match(new RegExp(term, 'g')) || []).length;
      score += matches * 0.5;
      // 概念匹配
      if (document.concepts.some((c) => c.toLowerCase().includes(term))) {
        score += 1.5;
      }
    });

    return score;
  }

  /**
   * 计算语义向量（简化版）
   * @param text 文本
   * @returns 向量
   */
  private computeSemanticVector(text: string): Map<string, number> {
    const vector = new Map<string, number>();
    const words = this.tokenizeQuery(text);

    // 简单的词频向量
    words.forEach((word) => {
      vector.set(word, (vector.get(word) || 0) + 1);
    });

    // 归一化
    const magnitude = Math.sqrt(
      Array.from(vector.values()).reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude > 0) {
      vector.forEach((val, key) => {
        vector.set(key, val / magnitude);
      });
    }

    return vector;
  }

  /**
   * 计算余弦相似度
   * @param vec1 向量1
   * @param vec2 向量2
   * @returns 相似度
   */
  private computeCosineSimilarity(
    vec1: Map<string, number>,
    vec2: Map<string, number>
  ): number {
    let dotProduct = 0;

    vec1.forEach((val1, key) => {
      const val2 = vec2.get(key) || 0;
      dotProduct += val1 * val2;
    });

    return dotProduct; // 向量已归一化
  }

  /**
   * 提取高亮片段
   * @param document 文档
   * @param queryTerms 查询词列表
   * @returns 高亮片段列表
   */
  private extractHighlights(document: Document, queryTerms: string[]): string[] {
    const highlights: string[] = [];
    const content = document.content;

    queryTerms.forEach((term) => {
      const regex = new RegExp(`.{0,50}${term}.{0,50}`, 'gi');
      const matches = content.match(regex);

      if (matches) {
        matches.slice(0, 2).forEach((match) => {
          highlights.push(match.trim());
        });
      }
    });

    return highlights.slice(0, 5); // 最多返回5个高亮
  }

  /**
   * 查找匹配的概念
   * @param document 文档
   * @param queryTerms 查询词列表
   * @returns 匹配的概念列表
   */
  private findMatchedConcepts(document: Document, queryTerms: string[]): string[] {
    return document.concepts.filter((concept) =>
      queryTerms.some((term) => concept.toLowerCase().includes(term))
    );
  }

  /**
   * 使用知识图谱增强搜索结果
   * @param results 搜索结果
   * @param query 查询字符串
   */
  private async enrichWithKnowledgeGraph(
    results: SearchResult[],
    query: string
  ): Promise<void> {
    try {
      // 为每个结果查找相关文档
      for (const result of results) {
        const relatedDocs = await this.knowledgeGraphService.getRelatedDocuments(
          result.document.id,
          3
        );

        // 如果相关文档也匹配查询，增加分数
        for (const relatedDocId of relatedDocs) {
          const relatedDoc = results.find((r) => r.document.id === relatedDocId);
          if (relatedDoc) {
            result.score += 0.2; // 增加知识图谱关联分数
          }
        }
      }
    } catch (error) {
      this.logger.warn('Failed to enrich with knowledge graph', { error });
    }
  }

  /**
   * 计算文档相似度
   * @param docId1 文档ID1
   * @param docId2 文档ID2
   * @returns 相似度分数
   */
  private async calculateDocumentSimilarity(
    docId1: string,
    docId2: string
  ): Promise<number> {
    try {
      const doc1 = await this.documentRepository.getById(docId1);
      const doc2 = await this.documentRepository.getById(docId2);

      if (!doc1 || !doc2) {
        return 0;
      }

      // 计算概念重叠度
      const commonConcepts = doc1.concepts.filter((c) => doc2.concepts.includes(c));
      const conceptSimilarity =
        commonConcepts.length /
        Math.sqrt(doc1.concepts.length * doc2.concepts.length);

      // 计算引用关系
      const citationSimilarity = 0;
      if (doc1.references.includes(docId2) || doc2.references.includes(docId1)) {
        // 引用关系增加相似度
      }

      // 综合相似度
      return conceptSimilarity * 0.7 + citationSimilarity * 0.3;
    } catch (error) {
      this.logger.error('Failed to calculate document similarity', { docId1, docId2, error });
      return 0;
    }
  }

  /**
   * 归一化分数
   * @param score 原始分数
   * @returns 归一化分数
   */
  private normalizeScore(score: number): number {
    return Math.min(1.0, score / 10); // 假设最大分数为10
  }

  /**
   * 导出搜索结果
   * @param results 搜索结果
   * @param format 导出格式 (json | csv | excel)
   * @returns 导出数据
   */
  async exportSearchResults(
    results: SearchResult[],
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<string> {
    try {
      this.logger.info('Exporting search results', { count: results.length, format });

      switch (format) {
        case 'json':
          return this.exportAsJSON(results);
        case 'csv':
          return this.exportAsCSV(results);
        case 'excel':
          return this.exportAsExcel(results);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      this.logger.error('Failed to export search results', { count: results.length, format, error });
      throw error;
    }
  }

  /**
   * 导出为JSON格式
   * @param results 搜索结果
   * @returns JSON字符串
   */
  private exportAsJSON(results: SearchResult[]): string {
    const data = results.map((result) => ({
      id: result.document.id,
      title: result.document.title,
      category: result.document.category,
      author: result.document.author,
      createdAt: result.document.createdAt,
      qualityScore: result.document.qualityScore,
      score: result.score,
      relevance: result.relevance,
      highlights: result.highlights,
      matchedConcepts: result.matchedConcepts,
    }));

    return JSON.stringify(data, null, 2);
  }

  /**
   * 导出为CSV格式
   * @param results 搜索结果
   * @returns CSV字符串
   */
  private exportAsCSV(results: SearchResult[]): string {
    const headers = [
      'ID',
      'Title',
      'Category',
      'Author',
      'Created At',
      'Quality Score',
      'Score',
      'Relevance',
      'Highlights',
      'Matched Concepts',
    ];

    const rows = results.map((result) => [
      result.document.id,
      `"${result.document.title.replace(/"/g, '""')}"`,
      result.document.category,
      result.document.author,
      result.document.createdAt.toISOString(),
      result.document.qualityScore.toString(),
      result.score.toFixed(4),
      result.relevance.toFixed(4),
      `"${result.highlights.join('; ').replace(/"/g, '""')}"`,
      `"${result.matchedConcepts.join('; ').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * 导出为Excel格式（简化版，实际应使用xlsx库）
   * @param results 搜索结果
   * @returns CSV字符串（Excel兼容）
   */
  private exportAsExcel(results: SearchResult[]): string {
    // 简化实现：返回CSV格式，Excel可以打开
    // 实际实现应使用xlsx等库生成真正的Excel文件
    return this.exportAsCSV(results);
  }

  /**
   * 获取搜索历史
   * @param limit 数量限制
   * @returns 搜索历史
   */
  async getSearchHistory(limit: number = 10): Promise<Array<{
    query: string;
    timestamp: Date;
    resultsCount: number;
  }>> {
    try {
      this.logger.info('Getting search history', { limit });

      // 简化实现：返回空数组
      // 实际实现应从数据库或缓存中读取搜索历史
      return [];
    } catch (error) {
      this.logger.error('Failed to get search history', { limit, error });
      throw error;
    }
  }

  /**
   * 清除搜索历史
   */
  async clearSearchHistory(): Promise<void> {
    try {
      this.logger.info('Clearing search history');

      // 简化实现：空操作
      // 实际实现应从数据库或缓存中清除搜索历史
    } catch (error) {
      this.logger.error('Failed to clear search history', { error });
      throw error;
    }
  }

  /**
   * 获取热门搜索词
   * @param limit 数量限制
   * @returns 热门搜索词列表
   */
  async getTrendingSearches(limit: number = 10): Promise<Array<{
    query: string;
    count: number;
  }>> {
    try {
      this.logger.info('Getting trending searches', { limit });

      // 简化实现：返回空数组
      // 实际实现应从数据库或缓存中读取热门搜索词
      return [];
    } catch (error) {
      this.logger.error('Failed to get trending searches', { limit, error });
      throw error;
    }
  }
}

// 导出searchService实例供其他模块使用
export const searchService = new SearchService();
