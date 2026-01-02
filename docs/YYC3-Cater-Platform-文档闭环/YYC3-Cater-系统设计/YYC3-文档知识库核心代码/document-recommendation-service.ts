/**
 * @file 文档智能推荐引擎服务
 * @description 基于多维度分析的智能文档推荐系统，支持内容推荐、协同过滤和混合策略
 * @module document-recommendation
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { logger } from './logger';
import { documentRepository } from './document.repository';
import { documentSimilarityService } from './document-similarity-service';
import { SimilarityMethod } from './document-similarity-service';

/**
 * 推荐策略枚举
 */
export enum RecommendationStrategy {
  /** 基于内容的推荐 */
  CONTENT_BASED = 'content_based',
  /** 协同过滤推荐 */
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  /** 混合推荐 */
  HYBRID = 'hybrid',
  /** 热门文档推荐 */
  POPULAR = 'popular',
  /** 最新文档推荐 */
  LATEST = 'latest',
  /** 相关文档推荐 */
  SIMILAR = 'similar',
}

/**
 * 用户行为类型
 */
export enum UserActionType {
  /** 查看 */
  VIEW = 'view',
  /** 下载 */
  DOWNLOAD = 'download',
  /** 收藏 */
  FAVORITE = 'favorite',
  /** 分享 */
  SHARE = 'share',
  /** 评论 */
  COMMENT = 'comment',
  /** 点赞 */
  LIKE = 'like',
}

/**
 * 用户行为记录接口
 */
export interface UserAction {
  /** 用户ID */
  userId: string;
  /** 文档ID */
  documentId: string;
  /** 行为类型 */
  actionType: UserActionType;
  /** 行为时间 */
  timestamp: Date;
  /** 行为评分（1-5） */
  rating?: number;
}

/**
 * 推荐结果接口
 */
export interface RecommendationResult {
  /** 文档ID */
  documentId: string;
  /** 文档标题 */
  title: string;
  /** 推荐分数 */
  score: number;
  /** 推荐原因 */
  reason: string;
  /** 相似度分数 */
  similarityScore?: number;
  /** 推荐策略 */
  strategy: RecommendationStrategy;
  /** 分类 */
  category?: string;
  /** 标签 */
  tags?: string[];
}

/**
 * 推荐请求接口
 */
export interface RecommendationRequest {
  /** 用户ID */
  userId?: string;
  /** 文档ID（用于相关文档推荐） */
  documentId?: string;
  /** 推荐策略 */
  strategy?: RecommendationStrategy;
  /** 推荐数量 */
  limit?: number;
  /** 过滤条件 */
  filters?: {
    /** 分类过滤 */
    category?: string;
    /** 标签过滤 */
    tags?: string[];
    /** 日期范围 */
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

/**
 * 用户偏好接口
 */
export interface UserPreference {
  /** 用户ID */
  userId: string;
  /** 偏好的分类 */
  preferredCategories: string[];
  /** 偏好的标签 */
  preferredTags: string[];
  /** 偏好的关键词 */
  preferredKeywords: string[];
  /** 平均评分 */
  avgRating: number;
  /** 活跃度 */
  activityLevel: 'low' | 'medium' | 'high';
}

/**
 * 文档智能推荐引擎服务类
 */
class DocumentRecommendationService {
  private userActions: Map<string, UserAction[]> = new Map();
  private userPreferences: Map<string, UserPreference> = new Map();

  /**
   * 获取推荐文档
   * @param request 推荐请求
   * @returns 推荐结果列表
   */
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    const {
      userId,
      documentId,
      strategy = RecommendationStrategy.HYBRID,
      limit = 10,
      filters,
    } = request;

    try {
      let recommendations: RecommendationResult[] = [];

      // 根据策略生成推荐
      switch (strategy) {
        case RecommendationStrategy.CONTENT_BASED:
          recommendations = await this.getContentBasedRecommendations(userId!, limit, filters);
          break;
        case RecommendationStrategy.COLLABORATIVE_FILTERING:
          recommendations = await this.getCollaborativeFilteringRecommendations(
            userId!,
            limit,
            filters
          );
          break;
        case RecommendationStrategy.HYBRID:
          recommendations = await this.getHybridRecommendations(userId!, limit, filters);
          break;
        case RecommendationStrategy.POPULAR:
          recommendations = await this.getPopularRecommendations(limit, filters);
          break;
        case RecommendationStrategy.LATEST:
          recommendations = await this.getLatestRecommendations(limit, filters);
          break;
        case RecommendationStrategy.SIMILAR:
          if (!documentId) {
            throw new Error('相关文档推荐需要提供文档ID');
          }
          recommendations = await this.getSimilarRecommendations(documentId!, limit, filters);
          break;
        default:
          recommendations = await this.getHybridRecommendations(userId!, limit, filters);
      }

      // 应用过滤条件
      if (filters) {
        recommendations = await this.applyFilters(recommendations, filters);
      }

      // 限制返回数量
      recommendations = recommendations.slice(0, limit);

      logger.info(`Generated ${recommendations.length} recommendations for user ${userId}`);

      return recommendations;
    } catch (error) {
      logger.error('Error generating recommendations:', { error });
      throw error;
    }
  }

  /**
   * 记录用户行为
   * @param action 用户行为
   */
  async recordUserAction(action: UserAction): Promise<void> {
    try {
      // 获取或创建用户行为记录
      const actions = this.userActions.get(action.userId) || [];
      actions.push(action);
      this.userActions.set(action.userId, actions);

      // 更新用户偏好
      await this.updateUserPreference(action.userId);

      logger.info(`Recorded user action: ${action.userId} - ${action.actionType} - ${action.documentId}`);
    } catch (error) {
      logger.error('Error recording user action:', { error });
      throw error;
    }
  }

  /**
   * 获取用户偏好
   * @param userId 用户ID
   * @returns 用户偏好
   */
  async getUserPreference(userId: string): Promise<UserPreference> {
    let preference = this.userPreferences.get(userId);

    if (!preference) {
      // 计算用户偏好
      preference = await this.calculateUserPreference(userId);
      this.userPreferences.set(userId, preference);
    }

    return preference;
  }

  /**
   * 基于内容的推荐
   * @param userId 用户ID
   * @param limit 推荐数量
   * @param filters 过滤条件
   * @returns 推荐结果
   */
  private async getContentBasedRecommendations(
    userId: string,
    limit: number,
    filters?: RecommendationRequest['filters']
  ): Promise<RecommendationResult[]> {
    // 获取用户偏好
    const preference = await this.getUserPreference(userId);

    // 获取所有文档
    const allDocuments = await documentRepository.findAll();

    // 计算每个文档与用户偏好的匹配度
    const recommendations: RecommendationResult[] = [];

    for (const doc of allDocuments) {
      // 跳过用户已查看的文档
      const userActions = this.userActions.get(userId) || [];
      const viewedDocIds = userActions.map((a) => a.documentId);
      if (viewedDocIds.includes(doc.id)) {
        continue;
      }

      // 计算匹配分数
      let score = 0;
      const reasons: string[] = [];

      // 分类匹配
      if (doc.category && preference.preferredCategories.includes(doc.category)) {
        score += 0.4;
        reasons.push(`与您偏好的分类"${doc.category}"匹配`);
      }

      // 标签匹配
      if (doc.tags) {
        const matchedTags = doc.tags.filter((tag) => preference.preferredTags.includes(tag));
        if (matchedTags.length > 0) {
          score += (matchedTags.length / doc.tags.length) * 0.3;
          reasons.push(`包含您感兴趣的标签: ${matchedTags.join(', ')}`);
        }
      }

      // 关键词匹配
      const keywords = this.extractKeywords(doc.content);
      const matchedKeywords = keywords.filter((kw) => preference.preferredKeywords.includes(kw));
      if (matchedKeywords.length > 0) {
        score += (matchedKeywords.length / keywords.length) * 0.3;
        reasons.push(`包含相关关键词: ${matchedKeywords.slice(0, 3).join(', ')}`);
      }

      if (score > 0) {
        recommendations.push({
          documentId: doc.id,
          title: doc.title,
          score,
          reason: reasons.join('; '),
          strategy: RecommendationStrategy.CONTENT_BASED,
          category: doc.category,
          tags: doc.tags,
        });
      }
    }

    // 按分数排序
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
  }

  /**
   * 协同过滤推荐
   * @param userId 用户ID
   * @param limit 推荐数量
   * @param filters 过滤条件
   * @returns 推荐结果
   */
  private async getCollaborativeFilteringRecommendations(
    userId: string,
    limit: number,
    filters?: RecommendationRequest['filters']
  ): Promise<RecommendationResult[]> {
    // 获取用户行为
    const userActions = this.userActions.get(userId) || [];
    if (userActions.length === 0) {
      // 新用户，返回热门推荐
      return this.getPopularRecommendations(limit, filters);
    }

    // 获取用户查看的文档ID
    const viewedDocIds = userActions.map((a) => a.documentId);

    // 找到相似用户
    const similarUsers = await this.findSimilarUsers(userId);

    // 收集相似用户查看过但当前用户未查看的文档
    const recommendedDocs = new Map<string, { count: number; score: number }>();

    for (const similarUser of similarUsers) {
      const similarUserActions = this.userActions.get(similarUser.userId) || [];

      for (const action of similarUserActions) {
        // 跳过当前用户已查看的文档
        if (viewedDocIds.includes(action.documentId)) {
          continue;
        }

        // 计算推荐分数
        const actionWeight = this.getActionWeight(action.actionType);
        const score = similarUser.similarity * actionWeight;

        const existing = recommendedDocs.get(action.documentId);
        if (existing) {
          existing.count += 1;
          existing.score += score;
        } else {
          recommendedDocs.set(action.documentId, { count: 1, score });
        }
      }
    }

    // 转换为推荐结果
    const recommendations: RecommendationResult[] = [];
    const allDocuments = await documentRepository.findAll();

    for (const [documentId, data] of recommendedDocs.entries()) {
      const doc = allDocuments.find((d) => d.id === documentId);
      if (doc) {
        recommendations.push({
          documentId,
          title: doc.title,
          score: data.score / data.count,
          reason: `${data.count}位相似用户也浏览了此文档`,
          strategy: RecommendationStrategy.COLLABORATIVE_FILTERING,
          category: doc.category,
          tags: doc.tags,
        });
      }
    }

    // 按分数排序
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
  }

  /**
   * 混合推荐
   * @param userId 用户ID
   * @param limit 推荐数量
   * @param filters 过滤条件
   * @returns 推荐结果
   */
  private async getHybridRecommendations(
    userId: string,
    limit: number,
    filters?: RecommendationRequest['filters']
  ): Promise<RecommendationResult[]> {
    // 获取基于内容的推荐
    const contentBasedRecs = await this.getContentBasedRecommendations(userId, limit * 2, filters);

    // 获取协同过滤推荐
    const collaborativeRecs = await this.getCollaborativeFilteringRecommendations(
      userId,
      limit * 2,
      filters
    );

    // 合并推荐结果
    const combinedRecs = new Map<string, RecommendationResult>();

    // 添加基于内容的推荐（权重0.4）
    for (const rec of contentBasedRecs) {
      const existing = combinedRecs.get(rec.documentId);
      if (existing) {
        existing.score = Math.max(existing.score, rec.score * 0.4);
        existing.reason += `; ${rec.reason}`;
      } else {
        combinedRecs.set(rec.documentId, {
          ...rec,
          score: rec.score * 0.4,
          reason: rec.reason,
        });
      }
    }

    // 添加协同过滤推荐（权重0.6）
    for (const rec of collaborativeRecs) {
      const existing = combinedRecs.get(rec.documentId);
      if (existing) {
        existing.score = Math.max(existing.score, rec.score * 0.6);
        existing.reason += `; ${rec.reason}`;
      } else {
        combinedRecs.set(rec.documentId, {
          ...rec,
          score: rec.score * 0.6,
          reason: rec.reason,
        });
      }
    }

    // 转换为数组并排序
    const recommendations = Array.from(combinedRecs.values());
    recommendations.sort((a, b) => b.score - a.score);

    // 更新推荐策略
    recommendations.forEach((rec) => {
      rec.strategy = RecommendationStrategy.HYBRID;
    });

    return recommendations;
  }

  /**
   * 热门文档推荐
   * @param limit 推荐数量
   * @param filters 过滤条件
   * @returns 推荐结果
   */
  private async getPopularRecommendations(
    limit: number,
    filters?: RecommendationRequest['filters']
  ): Promise<RecommendationResult[]> {
    // 统计每个文档的访问次数
    const docStats = new Map<string, { views: number; downloads: number; likes: number }>();

    for (const actions of this.userActions.values()) {
      for (const action of actions) {
        const stats = docStats.get(action.documentId) || { views: 0, downloads: 0, likes: 0 };

        switch (action.actionType) {
          case UserActionType.VIEW:
            stats.views += 1;
            break;
          case UserActionType.DOWNLOAD:
            stats.downloads += 1;
            break;
          case UserActionType.LIKE:
            stats.likes += 1;
            break;
        }

        docStats.set(action.documentId, stats);
      }
    }

    // 计算热门分数
    const recommendations: RecommendationResult[] = [];
    const allDocuments = await documentRepository.findAll();

    for (const [documentId, stats] of docStats.entries()) {
      const doc = allDocuments.find((d) => d.id === documentId);
      if (doc) {
        // 计算热度分数
        const score = stats.views * 1 + stats.downloads * 3 + stats.likes * 5;

        recommendations.push({
          documentId,
          title: doc.title,
          score,
          reason: `热门文档（${stats.views}次查看, ${stats.downloads}次下载, ${stats.likes}次点赞）`,
          strategy: RecommendationStrategy.POPULAR,
          category: doc.category,
          tags: doc.tags,
        });
      }
    }

    // 按分数排序
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
  }

  /**
   * 最新文档推荐
   * @param limit 推荐数量
   * @param filters 过滤条件
   * @returns 推荐结果
   */
  private async getLatestRecommendations(
    limit: number,
    filters?: RecommendationRequest['filters']
  ): Promise<RecommendationResult[]> {
    // 获取所有文档
    const allDocuments = await documentRepository.findAll();

    // 按创建时间排序
    const sortedDocs = [...allDocuments].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // 转换为推荐结果
    const recommendations: RecommendationResult[] = sortedDocs.map((doc) => ({
      documentId: doc.id,
      title: doc.title,
      score: 1, // 最新文档分数相同
      reason: '最新上传的文档',
      strategy: RecommendationStrategy.LATEST,
      category: doc.category,
      tags: doc.tags,
    }));

    return recommendations;
  }

  /**
   * 相关文档推荐
   * @param documentId 文档ID
   * @param limit 推荐数量
   * @param filters 过滤条件
   * @returns 推荐结果
   */
  private async getSimilarRecommendations(
    documentId: string,
    limit: number,
    filters?: RecommendationRequest['filters']
  ): Promise<RecommendationResult[]> {
    // 使用相似度服务查找相似文档
    const similarDocs = await documentSimilarityService.findSimilarDocuments(
      documentId,
      0.3,
      limit,
      SimilarityMethod.COSINE
    );

    // 转换为推荐结果
    const allDocuments = await documentRepository.findAll();
    const recommendations: RecommendationResult[] = [];

    for (const similarDoc of similarDocs) {
      const doc = allDocuments.find((d) => d.id === similarDoc.documentId2);
      if (doc) {
        recommendations.push({
          documentId: doc.id,
          title: doc.title,
          score: similarDoc.similarityScore,
          reason: `与当前文档相似度${(similarDoc.similarityScore * 100).toFixed(1)}%`,
          similarityScore: similarDoc.similarityScore,
          strategy: RecommendationStrategy.SIMILAR,
          category: doc.category,
          tags: doc.tags,
        });
      }
    }

    return recommendations;
  }

  /**
   * 查找相似用户
   * @param userId 用户ID
   * @returns 相似用户列表
   */
  private async findSimilarUsers(
    userId: string
  ): Promise<Array<{ userId: string; similarity: number }>> {
    const targetActions = this.userActions.get(userId) || [];
    const targetDocIds = new Set(targetActions.map((a) => a.documentId));

    const similarUsers: Array<{ userId: string; similarity: number }> = [];

    for (const [otherUserId, otherActions] of this.userActions.entries()) {
      if (otherUserId === userId) {
        continue;
      }

      const otherDocIds = new Set(otherActions.map((a) => a.documentId));

      // 计算Jaccard相似度
      const intersection = new Set([...targetDocIds].filter((id) => otherDocIds.has(id)));
      const union = new Set([...targetDocIds, ...otherDocIds]);

      const similarity = union.size > 0 ? intersection.size / union.size : 0;

      if (similarity > 0.1) {
        similarUsers.push({ userId: otherUserId, similarity });
      }
    }

    // 按相似度排序
    similarUsers.sort((a, b) => b.similarity - a.similarity);

    return similarUsers.slice(0, 10);
  }

  /**
   * 计算用户偏好
   * @param userId 用户ID
   * @returns 用户偏好
   */
  private async calculateUserPreference(userId: string): Promise<UserPreference> {
    const actions = this.userActions.get(userId) || [];

    if (actions.length === 0) {
      return {
        userId,
        preferredCategories: [],
        preferredTags: [],
        preferredKeywords: [],
        avgRating: 0,
        activityLevel: 'low',
      };
    }

    // 统计分类偏好
    const categoryCount = new Map<string, number>();
    const tagCount = new Map<string, number>();
    const keywordCount = new Map<string, number>();
    let totalRating = 0;
    let ratedCount = 0;

    for (const action of actions) {
      const doc = await documentRepository.findById(action.documentId);
      if (!doc) continue;

      // 分类
      if (doc.category) {
        categoryCount.set(doc.category, (categoryCount.get(doc.category) || 0) + 1);
      }

      // 标签
      if (doc.tags) {
        for (const tag of doc.tags) {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        }
      }

      // 关键词
      const keywords = this.extractKeywords(doc.content);
      for (const keyword of keywords) {
        keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
      }

      // 评分
      if (action.rating) {
        totalRating += action.rating;
        ratedCount++;
      }
    }

    // 提取Top偏好
    const preferredCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    const preferredTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);

    const preferredKeywords = Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((entry) => entry[0]);

    // 计算活跃度
    const activityLevel = actions.length > 20 ? 'high' : actions.length > 5 ? 'medium' : 'low';

    return {
      userId,
      preferredCategories,
      preferredTags,
      preferredKeywords,
      avgRating: ratedCount > 0 ? totalRating / ratedCount : 0,
      activityLevel,
    };
  }

  /**
   * 更新用户偏好
   * @param userId 用户ID
   */
  private async updateUserPreference(userId: string): Promise<void> {
    const preference = await this.calculateUserPreference(userId);
    this.userPreferences.set(userId, preference);
  }

  /**
   * 获取行为权重
   * @param actionType 行为类型
   * @returns 权重值
   */
  private getActionWeight(actionType: UserActionType): number {
    const weights: Record<UserActionType, number> = {
      [UserActionType.VIEW]: 1,
      [UserActionType.DOWNLOAD]: 3,
      [UserActionType.FAVORITE]: 4,
      [UserActionType.SHARE]: 3,
      [UserActionType.COMMENT]: 2,
      [UserActionType.LIKE]: 2,
    };

    return weights[actionType] || 1;
  }

  /**
   * 提取关键词
   * @param text 文本
   * @returns 关键词列表
   */
  private extractKeywords(text: string): string[] {
    // 简化的关键词提取
    return text
      .toLowerCase()
      .split(/[\s,，。！？、\n]+/)
      .filter((word) => word.length > 1);
  }

  /**
   * 应用过滤条件
   * @param recommendations 推荐结果
   * @param filters 过滤条件
   * @returns 过滤后的推荐结果
   */
  private async applyFilters(
    recommendations: RecommendationResult[],
    filters: RecommendationRequest['filters']
  ): Promise<RecommendationResult[]> {
    let filtered = recommendations;

    // 分类过滤
    if (filters?.category) {
      filtered = filtered.filter((rec) => rec.category === filters.category);
    }

    // 标签过滤
    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter((rec) => {
        if (!rec.tags) return false;
        return filters.tags!.some((tag) => rec.tags!.includes(tag));
      });
    }

    // 日期范围过滤
    if (filters?.dateRange) {
      const allDocuments = await documentRepository.findAll();
      filtered = filtered.filter((rec) => {
        const doc = allDocuments.find((d) => d.id === rec.documentId);
        if (!doc || !doc.createdAt) return false;

        const docDate = new Date(doc.createdAt);
        return (
          docDate >= filters.dateRange!.start && docDate <= filters.dateRange!.end
        );
      });
    }

    return filtered;
  }

  /**
   * 获取推荐统计
   * @param userId 用户ID
   * @returns 推荐统计信息
   */
  async getRecommendationStats(userId: string) {
    const preference = await this.getUserPreference(userId);
    const userActions = this.userActions.get(userId) || [];

    return {
      userId,
      totalActions: userActions.length,
      activityLevel: preference.activityLevel,
      preferredCategories: preference.preferredCategories,
      preferredTags: preference.preferredTags.slice(0, 5),
      avgRating: preference.avgRating,
      lastAction: userActions.length > 0 ? userActions[userActions.length - 1].timestamp : null,
    };
  }
}

// 创建文档推荐服务实例
export const documentRecommendationService = new DocumentRecommendationService();
