/**
 * @file 文档智能分类服务
 * @description 基于机器学习和NLP的文档自动分类系统，支持多标签分类、自定义分类规则和智能分类建议
 * @module document-classification
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { logger } from './logger';
import { documentRepository } from './document.repository';

/**
 * 分类规则接口
 */
export interface ClassificationRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 目标分类 */
  category: string;
  /** 关键词列表 */
  keywords: string[];
  /** 权重（0-1） */
  weight: number;
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/**
 * 分类结果接口
 */
export interface ClassificationResult {
  /** 文档ID */
  documentId: string;
  /** 主要分类 */
  primaryCategory: string;
  /** 分类置信度 */
  confidence: number;
  /** 所有分类及其分数 */
  allCategories: Array<{
    category: string;
    score: number;
  }>;
  /** 分类时间（毫秒） */
  classificationTime: number;
  /** 使用的规则 */
  usedRules: string[];
  /** 分类方法 */
  method: 'rule-based' | 'ml-based' | 'hybrid';
}

/**
 * 分类统计接口
 */
export interface ClassificationStats {
  /** 总文档数 */
  totalDocuments: number;
  /** 已分类文档数 */
  classifiedDocuments: number;
  /** 未分类文档数 */
  unclassifiedDocuments: number;
  /** 分类覆盖率 */
  coverageRate: number;
  /** 各分类的文档数量 */
  categoryDistribution: Record<string, number>;
  /** 平均分类置信度 */
  avgConfidence: number;
}

/**
 * 文档智能分类服务类
 */
class DocumentClassificationService {
  private rules: Map<string, ClassificationRule> = new Map();
  private readonly defaultRules: ClassificationRule[] = [
    {
      id: 'rule-001',
      name: '技术文档',
      category: '技术文档',
      keywords: ['技术', '开发', '架构', 'API', '代码', '系统', '框架', '数据库', '算法'],
      weight: 0.9,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'rule-002',
      name: '产品文档',
      category: '产品文档',
      keywords: ['产品', '功能', '需求', '用户', '体验', '设计', '交互', '界面'],
      weight: 0.9,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'rule-003',
      name: '运营文档',
      category: '运营文档',
      keywords: ['运营', '推广', '营销', '活动', '用户增长', '数据分析', '市场'],
      weight: 0.9,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'rule-004',
      name: '管理文档',
      category: '管理文档',
      keywords: ['管理', '流程', '制度', '规范', '标准', '团队', '项目', '计划'],
      weight: 0.9,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'rule-005',
      name: '培训文档',
      category: '培训文档',
      keywords: ['培训', '教程', '学习', '指南', '入门', '教程', '教学', '课程'],
      weight: 0.9,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  constructor() {
    // 初始化默认规则
    this.defaultRules.forEach((rule) => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * 分类文档
   * @param documentId 文档ID
   * @param method 分类方法
   * @returns 分类结果
   */
  async classifyDocument(
    documentId: string,
    method: 'rule-based' | 'ml-based' | 'hybrid' = 'hybrid'
  ): Promise<ClassificationResult> {
    const startTime = Date.now();

    try {
      // 获取文档
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // 根据方法分类
      let result: ClassificationResult;
      switch (method) {
        case 'rule-based':
          result = await this.ruleBasedClassification(document);
          break;
        case 'ml-based':
          result = await this.mlBasedClassification(document);
          break;
        case 'hybrid':
          result = await this.hybridClassification(document);
          break;
        default:
          result = await this.hybridClassification(document);
      }

      // 更新文档分类
      await documentRepository.update(documentId, {
        category: result.primaryCategory,
        metadata: {
          ...document.metadata,
          classification: result,
        },
      } as any);

      // 计算分类时间
      result.classificationTime = Date.now() - startTime;

      logger.info(`Classified document: ${documentId} as ${result.primaryCategory}`);

      return result;
    } catch (error) {
      logger.error('Error classifying document:', { error });
      throw error;
    }
  }

  /**
   * 批量分类文档
   * @param documentIds 文档ID列表
   * @param method 分类方法
   * @returns 分类结果列表
   */
  async classifyBatchDocuments(
    documentIds: string[],
    method: 'rule-based' | 'ml-based' | 'hybrid' = 'hybrid'
  ): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];

    for (const documentId of documentIds) {
      try {
        const result = await this.classifyDocument(documentId, method);
        results.push(result);
      } catch (error) {
        logger.error(`Error classifying document: ${documentId}`, { error });
      }
    }

    return results;
  }

  /**
   * 基于规则的分类
   * @param document 文档
   * @returns 分类结果
   */
  private async ruleBasedClassification(document: any): Promise<ClassificationResult> {
    const categoryScores = new Map<string, number>();
    const usedRules: string[] = [];

    // 获取启用的规则
    const enabledRules = Array.from(this.rules.values()).filter((rule) => rule.enabled);

    // 计算每个分类的分数
    for (const rule of enabledRules) {
      let score = 0;
      const matchedKeywords: string[] = [];

      // 检查标题
      for (const keyword of rule.keywords) {
        if (document.title.includes(keyword)) {
          score += rule.weight * 2;
          matchedKeywords.push(keyword);
        }
      }

      // 检查内容
      for (const keyword of rule.keywords) {
        const matches = (document.content.match(new RegExp(keyword, 'g')) || []).length;
        if (matches > 0) {
          score += rule.weight * matches * 0.5;
          matchedKeywords.push(keyword);
        }
      }

      // 如果有匹配的关键词，记录使用的规则
      if (matchedKeywords.length > 0) {
        usedRules.push(rule.id);
      }

      // 累加分数
      categoryScores.set(rule.category, (categoryScores.get(rule.category) || 0) + score);
    }

    // 转换为数组并排序
    const sortedCategories = Array.from(categoryScores.entries())
      .map(([category, score]) => ({ category, score }))
      .sort((a, b) => b.score - a.score);

    // 如果没有匹配的分类，使用默认分类
    if (sortedCategories.length === 0) {
      return {
        documentId: document.id,
        primaryCategory: '未分类',
        confidence: 0,
        allCategories: [],
        classificationTime: 0,
        usedRules: [],
        method: 'rule-based',
      };
    }

    // 计算置信度
    const maxScore = sortedCategories[0].score;
    const confidence = Math.min(maxScore / 5, 1.0);

    return {
      documentId: document.id,
      primaryCategory: sortedCategories[0].category,
      confidence,
      allCategories: sortedCategories,
      classificationTime: 0,
      usedRules,
      method: 'rule-based',
    };
  }

  /**
   * 基于机器学习的分类
   * @param document 文档
   * @returns 分类结果
   */
  private async mlBasedClassification(document: any): Promise<ClassificationResult> {
    // 这里应该使用实际的机器学习模型
    // 由于这是一个示例，我们使用模拟实现

    // 模拟ML分类延迟
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 模拟分类结果
    const categories = ['技术文档', '产品文档', '运营文档', '管理文档', '培训文档'];
    const scores = categories.map((category) => ({
      category,
      score: Math.random(),
    }));

    // 排序
    scores.sort((a, b) => b.score - a.score);

    return {
      documentId: document.id,
      primaryCategory: scores[0].category,
      confidence: scores[0].score,
      allCategories: scores,
      classificationTime: 0,
      usedRules: [],
      method: 'ml-based',
    };
  }

  /**
   * 混合分类
   * @param document 文档
   * @returns 分类结果
   */
  private async hybridClassification(document: any): Promise<ClassificationResult> {
    // 基于规则的分类
    const ruleBasedResult = await this.ruleBasedClassification(document);

    // 基于机器学习的分类
    const mlBasedResult = await this.mlBasedClassification(document);

    // 合并结果
    const categoryScores = new Map<string, number>();

    // 添加规则分类的分数（权重0.6）
    for (const cat of ruleBasedResult.allCategories) {
      categoryScores.set(cat.category, (categoryScores.get(cat.category) || 0) + cat.score * 0.6);
    }

    // 添加ML分类的分数（权重0.4）
    for (const cat of mlBasedResult.allCategories) {
      categoryScores.set(cat.category, (categoryScores.get(cat.category) || 0) + cat.score * 0.4);
    }

    // 转换为数组并排序
    const sortedCategories = Array.from(categoryScores.entries())
      .map(([category, score]) => ({ category, score }))
      .sort((a, b) => b.score - a.score);

    // 计算置信度
    const maxScore = sortedCategories[0].score;
    const confidence = Math.min(maxScore / 5, 1.0);

    return {
      documentId: document.id,
      primaryCategory: sortedCategories[0].category,
      confidence,
      allCategories: sortedCategories,
      classificationTime: 0,
      usedRules: ruleBasedResult.usedRules,
      method: 'hybrid',
    };
  }

  /**
   * 添加分类规则
   * @param rule 分类规则
   * @returns 规则ID
   */
  addRule(rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newRule: ClassificationRule = {
      ...rule,
      id: ruleId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.rules.set(ruleId, newRule);
    logger.info(`Added classification rule: ${ruleId}`);

    return ruleId;
  }

  /**
   * 更新分类规则
   * @param ruleId 规则ID
   * @param updates 更新内容
   */
  updateRule(ruleId: string, updates: Partial<ClassificationRule>): void {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }

    const updatedRule = {
      ...rule,
      ...updates,
      id: ruleId,
      updatedAt: Date.now(),
    };

    this.rules.set(ruleId, updatedRule);
    logger.info(`Updated classification rule: ${ruleId}`);
  }

  /**
   * 删除分类规则
   * @param ruleId 规则ID
   */
  deleteRule(ruleId: string): void {
    this.rules.delete(ruleId);
    logger.info(`Deleted classification rule: ${ruleId}`);
  }

  /**
   * 获取所有分类规则
   * @returns 分类规则列表
   */
  getAllRules(): ClassificationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取分类规则
   * @param ruleId 规则ID
   * @returns 分类规则
   */
  getRule(ruleId: string): ClassificationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * 获取分类统计
   * @returns 分类统计
   */
  async getClassificationStats(): Promise<ClassificationStats> {
    // 获取所有文档
    const allDocuments = await documentRepository.findAll();

    // 统计分类信息
    const totalDocuments = allDocuments.length;
    const classifiedDocuments = allDocuments.filter((doc) => doc.category && doc.category !== '未分类').length;
    const unclassifiedDocuments = totalDocuments - classifiedDocuments;
    const coverageRate = totalDocuments > 0 ? classifiedDocuments / totalDocuments : 0;

    // 统计各分类的文档数量
    const categoryDistribution: Record<string, number> = {};
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const doc of allDocuments) {
      if (doc.category) {
        categoryDistribution[doc.category] = (categoryDistribution[doc.category] || 0) + 1;

        if (doc.metadata?.classification?.confidence) {
          totalConfidence += doc.metadata.classification.confidence;
          confidenceCount++;
        }
      }
    }

    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    return {
      totalDocuments,
      classifiedDocuments,
      unclassifiedDocuments,
      coverageRate,
      categoryDistribution,
      avgConfidence,
    };
  }

  /**
   * 获取分类建议
   * @param documentId 文档ID
   * @returns 分类建议
   */
  async getClassificationSuggestions(documentId: string): Promise<Array<{
    category: string;
    confidence: number;
    reasons: string[];
  }>> {
    const document = await documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const suggestions: Array<{
      category: string;
      confidence: number;
      reasons: string[];
    }> = [];

    // 基于规则生成建议
    const enabledRules = Array.from(this.rules.values()).filter((rule) => rule.enabled);

    for (const rule of enabledRules) {
      const matchedKeywords: string[] = [];

      // 检查标题
      for (const keyword of rule.keywords) {
        if (document.title.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }

      // 检查内容
      for (const keyword of rule.keywords) {
        const matches = (document.content.match(new RegExp(keyword, 'g')) || []).length;
        if (matches > 0) {
          matchedKeywords.push(keyword);
        }
      }

      // 如果有匹配的关键词，生成建议
      if (matchedKeywords.length > 0) {
        const confidence = Math.min(matchedKeywords.length * 0.2, 1.0);
        suggestions.push({
          category: rule.category,
          confidence,
          reasons: [`匹配关键词: ${matchedKeywords.join(', ')}`],
        });
      }
    }

    // 按置信度排序
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions.slice(0, 5);
  }
}

// 创建文档分类服务实例
export const documentClassificationService = new DocumentClassificationService();
