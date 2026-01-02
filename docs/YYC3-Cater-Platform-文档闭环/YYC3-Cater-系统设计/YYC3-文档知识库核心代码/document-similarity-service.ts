/**
 * @file 文档相似度分析服务
 * @description 基于NLP和文本挖掘的文档相似度分析系统，支持多种相似度计算方法和批量分析
 * @module document-similarity
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { logger } from './logger';
import { documentRepository } from './document.repository';

/**
 * 相似度计算方法枚举
 */
export enum SimilarityMethod {
  /** 余弦相似度 */
  COSINE = 'cosine',
  /** Jaccard相似度 */
  JACCARD = 'jaccard',
  /** 编辑距离 */
  EDIT_DISTANCE = 'edit_distance',
  /** 欧氏距离 */
  EUCLIDEAN = 'euclidean',
  /** TF-IDF相似度 */
  TF_IDF = 'tf_idf',
  /** 词向量相似度 */
  WORD_EMBEDDING = 'word_embedding',
}

/**
 * 相似度分析结果接口
 */
export interface SimilarityResult {
  /** 文档1 ID */
  documentId1: string;
  /** 文档2 ID */
  documentId2: string;
  /** 相似度分数（0-1） */
  similarityScore: number;
  /** 相似度等级 */
  similarityLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  /** 计算方法 */
  method: SimilarityMethod;
  /** 计算时间（毫秒） */
  computationTime: number;
  /** 匹配的关键词 */
  matchedKeywords: string[];
  /** 不匹配的关键词 */
  unmatchedKeywords: string[];
}

/**
 * 批量相似度分析结果接口
 */
export interface BatchSimilarityResult {
  /** 目标文档ID */
  targetDocumentId: string;
  /** 相似度结果列表 */
  similarities: SimilarityResult[];
  /** 分析时间（毫秒） */
  analysisTime: number;
}

/**
 * 相似度统计接口
 */
export interface SimilarityStats {
  /** 总文档数 */
  totalDocuments: number;
  /** 分析的文档对数 */
  analyzedPairs: number;
  /** 平均相似度 */
  avgSimilarity: number;
  /** 相似度分布 */
  similarityDistribution: {
    very_low: number;
    low: number;
    medium: number;
    high: number;
    very_high: number;
  };
  /** 最相似的文档对 */
  mostSimilarPairs: SimilarityResult[];
  /** 最不相似的文档对 */
  leastSimilarPairs: SimilarityResult[];
}

/**
 * 文档相似度分析服务类
 */
class DocumentSimilarityService {
  private readonly similarityThresholds = {
    very_high: 0.8,
    high: 0.6,
    medium: 0.4,
    low: 0.2,
  };

  /**
   * 计算两个文档的相似度
   * @param documentId1 文档1 ID
   * @param documentId2 文档2 ID
   * @param method 相似度计算方法
   * @returns 相似度结果
   */
  async calculateSimilarity(
    documentId1: string,
    documentId2: string,
    method: SimilarityMethod = SimilarityMethod.COSINE
  ): Promise<SimilarityResult> {
    const startTime = Date.now();

    try {
      // 获取文档
      const doc1 = await documentRepository.findById(documentId1);
      const doc2 = await documentRepository.findById(documentId2);

      if (!doc1 || !doc2) {
        throw new Error('Document not found');
      }

      // 根据方法计算相似度
      let similarityScore: number;
      switch (method) {
        case SimilarityMethod.COSINE:
          similarityScore = this.calculateCosineSimilarity(doc1.content, doc2.content);
          break;
        case SimilarityMethod.JACCARD:
          similarityScore = this.calculateJaccardSimilarity(doc1.content, doc2.content);
          break;
        case SimilarityMethod.EDIT_DISTANCE:
          similarityScore = this.calculateEditDistanceSimilarity(doc1.content, doc2.content);
          break;
        case SimilarityMethod.EUCLIDEAN:
          similarityScore = this.calculateEuclideanSimilarity(doc1.content, doc2.content);
          break;
        case SimilarityMethod.TF_IDF:
          similarityScore = await this.calculateTFIDFSimilarity(doc1.content, doc2.content);
          break;
        case SimilarityMethod.WORD_EMBEDDING:
          similarityScore = await this.calculateWordEmbeddingSimilarity(doc1.content, doc2.content);
          break;
        default:
          similarityScore = this.calculateCosineSimilarity(doc1.content, doc2.content);
      }

      // 计算相似度等级
      const similarityLevel = this.getSimilarityLevel(similarityScore);

      // 提取匹配和不匹配的关键词
      const keywords1 = this.extractKeywords(doc1.content);
      const keywords2 = this.extractKeywords(doc2.content);
      const matchedKeywords = keywords1.filter((k) => keywords2.includes(k));
      const unmatchedKeywords = keywords1.filter((k) => !keywords2.includes(k));

      // 计算计算时间
      const computationTime = Date.now() - startTime;

      const result: SimilarityResult = {
        documentId1,
        documentId2,
        similarityScore,
        similarityLevel,
        method,
        computationTime,
        matchedKeywords,
        unmatchedKeywords,
      };

      logger.info(`Calculated similarity between ${documentId1} and ${documentId2}: ${similarityScore}`);

      return result;
    } catch (error) {
      logger.error('Error calculating similarity:', { error });
      throw error;
    }
  }

  /**
   * 批量计算相似度
   * @param targetDocumentId 目标文档ID
   * @param documentIds 文档ID列表
   * @param method 相似度计算方法
   * @returns 批量相似度结果
   */
  async calculateBatchSimilarity(
    targetDocumentId: string,
    documentIds: string[],
    method: SimilarityMethod = SimilarityMethod.COSINE
  ): Promise<BatchSimilarityResult> {
    const startTime = Date.now();

    try {
      const similarities: SimilarityResult[] = [];

      for (const documentId of documentIds) {
        if (documentId !== targetDocumentId) {
          try {
            const result = await this.calculateSimilarity(targetDocumentId, documentId, method);
            similarities.push(result);
          } catch (error) {
            logger.error(`Error calculating similarity for document: ${documentId}`, { error });
          }
        }
      }

      // 按相似度排序
      similarities.sort((a, b) => b.similarityScore - a.similarityScore);

      const analysisTime = Date.now() - startTime;

      return {
        targetDocumentId,
        similarities,
        analysisTime,
      };
    } catch (error) {
      logger.error('Error calculating batch similarity:', { error });
      throw error;
    }
  }

  /**
   * 计算余弦相似度
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度分数（0-1）
   */
  private calculateCosineSimilarity(text1: string, text2: string): number {
    // 提取词频向量
    const vec1 = this.getWordFrequency(text1);
    const vec2 = this.getWordFrequency(text2);

    // 计算点积
    let dotProduct = 0;
    for (const word in vec1) {
      if (word in vec2) {
        dotProduct += vec1[word] * vec2[word];
      }
    }

    // 计算向量长度
    const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));

    // 计算余弦相似度
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * 计算Jaccard相似度
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度分数（0-1）
   */
  private calculateJaccardSimilarity(text1: string, text2: string): number {
    const set1 = new Set(this.tokenize(text1));
    const set2 = new Set(this.tokenize(text2));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.size / union.size;
  }

  /**
   * 计算编辑距离相似度
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度分数（0-1）
   */
  private calculateEditDistanceSimilarity(text1: string, text2: string): number {
    const distance = this.editDistance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);

    if (maxLength === 0) {
      return 1;
    }

    return 1 - distance / maxLength;
  }

  /**
   * 计算编辑距离
   * @param text1 文本1
   * @param text2 文本2
   * @returns 编辑距离
   */
  private editDistance(text1: string, text2: string): number {
    const m = text1.length;
    const n = text2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (text1[i - 1] === text2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * 计算欧氏距离相似度
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度分数（0-1）
   */
  private calculateEuclideanSimilarity(text1: string, text2: string): number {
    const vec1 = this.getWordFrequency(text1);
    const vec2 = this.getWordFrequency(text2);

    // 获取所有词汇
    const allWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

    // 计算欧氏距离
    let sum = 0;
    for (const word of allWords) {
      const diff = (vec1[word] || 0) - (vec2[word] || 0);
      sum += diff * diff;
    }

    const distance = Math.sqrt(sum);
    const maxDistance = Math.sqrt(
      Object.values(vec1).reduce((sum, val) => sum + val * val, 0) +
      Object.values(vec2).reduce((sum, val) => sum + val * val, 0)
    );

    if (maxDistance === 0) {
      return 1;
    }

    return 1 - distance / maxDistance;
  }

  /**
   * 计算TF-IDF相似度
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度分数（0-1）
   */
  private async calculateTFIDFSimilarity(text1: string, text2: string): Promise<number> {
    // 简化的TF-IDF实现
    // 实际应用中应该使用完整的TF-IDF算法

    const vec1 = this.getWordFrequency(text1);
    const vec2 = this.getWordFrequency(text2);

    // 计算TF-IDF权重
    const allWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    const totalDocs = 2; // 简化：只有两个文档

    const tfidf1: Record<string, number> = {};
    const tfidf2: Record<string, number> = {};

    for (const word of allWords) {
      const tf1 = vec1[word] || 0;
      const tf2 = vec2[word] || 0;
      const df = (vec1[word] ? 1 : 0) + (vec2[word] ? 1 : 0);
      const idf = Math.log(totalDocs / (df + 1));

      tfidf1[word] = tf1 * idf;
      tfidf2[word] = tf2 * idf;
    }

    // 计算余弦相似度
    return this.calculateCosineSimilarityFromVectors(tfidf1, tfidf2);
  }

  /**
   * 计算词向量相似度
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度分数（0-1）
   */
  private async calculateWordEmbeddingSimilarity(text1: string, text2: string): Promise<number> {
    // 这里应该使用实际的词向量模型（如Word2Vec、BERT等）
    // 由于这是一个示例，我们使用模拟实现

    // 模拟词向量计算延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 模拟相似度计算
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    const intersection = words1.filter((w) => words2.includes(w));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.length / union.size;
  }

  /**
   * 从向量计算余弦相似度
   * @param vec1 向量1
   * @param vec2 向量2
   * @returns 相似度分数（0-1）
   */
  private calculateCosineSimilarityFromVectors(
    vec1: Record<string, number>,
    vec2: Record<string, number>
  ): number {
    let dotProduct = 0;
    for (const word in vec1) {
      if (word in vec2) {
        dotProduct += vec1[word] * vec2[word];
      }
    }

    const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * 获取词频向量
   * @param text 文本
   * @returns 词频向量
   */
  private getWordFrequency(text: string): Record<string, number> {
    const tokens = this.tokenize(text);
    const frequency: Record<string, number> = {};

    for (const token of tokens) {
      frequency[token] = (frequency[token] || 0) + 1;
    }

    return frequency;
  }

  /**
   * 分词
   * @param text 文本
   * @returns 词汇列表
   */
  private tokenize(text: string): string[] {
    // 简化的分词
    // 实际应用中应该使用更智能的分词算法

    return text
      .toLowerCase()
      .split(/[\s,，。！？、\n]+/)
      .filter((word) => word.length > 1);
  }

  /**
   * 提取关键词
   * @param text 文本
   * @returns 关键词列表
   */
  private extractKeywords(text: string): string[] {
    const tokens = this.tokenize(text);
    const frequency: Record<string, number> = {};

    for (const token of tokens) {
      frequency[token] = (frequency[token] || 0) + 1;
    }

    // 按频率排序
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((entry) => entry[0]);
  }

  /**
   * 获取相似度等级
   * @param score 相似度分数
   * @returns 相似度等级
   */
  private getSimilarityLevel(score: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
    if (score >= this.similarityThresholds.very_high) {
      return 'very_high';
    } else if (score >= this.similarityThresholds.high) {
      return 'high';
    } else if (score >= this.similarityThresholds.medium) {
      return 'medium';
    } else if (score >= this.similarityThresholds.low) {
      return 'low';
    } else {
      return 'very_low';
    }
  }

  /**
   * 获取相似度统计
   * @param documentIds 文档ID列表
   * @param method 相似度计算方法
   * @returns 相似度统计
   */
  async getSimilarityStats(
    documentIds: string[],
    method: SimilarityMethod = SimilarityMethod.COSINE
  ): Promise<SimilarityStats> {
    const similarities: SimilarityResult[] = [];

    // 计算所有文档对的相似度
    for (let i = 0; i < documentIds.length; i++) {
      for (let j = i + 1; j < documentIds.length; j++) {
        try {
          const result = await this.calculateSimilarity(documentIds[i], documentIds[j], method);
          similarities.push(result);
        } catch (error) {
          logger.error(`Error calculating similarity for documents: ${documentIds[i]}, ${documentIds[j]}`, { error });
        }
      }
    }

    // 计算统计信息
    const avgSimilarity =
      similarities.length > 0
        ? similarities.reduce((sum, s) => sum + s.similarityScore, 0) / similarities.length
        : 0;

    // 相似度分布
    const similarityDistribution = {
      very_low: similarities.filter((s) => s.similarityLevel === 'very_low').length,
      low: similarities.filter((s) => s.similarityLevel === 'low').length,
      medium: similarities.filter((s) => s.similarityLevel === 'medium').length,
      high: similarities.filter((s) => s.similarityLevel === 'high').length,
      very_high: similarities.filter((s) => s.similarityLevel === 'very_high').length,
    };

    // 最相似的文档对
    const mostSimilarPairs = [...similarities]
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);

    // 最不相似的文档对
    const leastSimilarPairs = [...similarities]
      .sort((a, b) => a.similarityScore - b.similarityScore)
      .slice(0, 5);

    return {
      totalDocuments: documentIds.length,
      analyzedPairs: similarities.length,
      avgSimilarity,
      similarityDistribution,
      mostSimilarPairs,
      leastSimilarPairs,
    };
  }

  /**
   * 查找相似文档
   * @param documentId 文档ID
   * @param threshold 相似度阈值
   * @param limit 返回数量限制
   * @param method 相似度计算方法
   * @returns 相似文档列表
   */
  async findSimilarDocuments(
    documentId: string,
    threshold: number = 0.5,
    limit: number = 10,
    method: SimilarityMethod = SimilarityMethod.COSINE
  ): Promise<SimilarityResult[]> {
    // 获取所有文档
    const allDocuments = await documentRepository.findAll();
    const documentIds = allDocuments.map((doc) => doc.id).filter((id) => id !== documentId);

    // 批量计算相似度
    const batchResult = await this.calculateBatchSimilarity(documentId, documentIds, method);

    // 过滤和限制结果
    return batchResult.similarities
      .filter((s) => s.similarityScore >= threshold)
      .slice(0, limit);
  }
}

// 创建文档相似度服务实例
export const documentSimilarityService = new DocumentSimilarityService();
