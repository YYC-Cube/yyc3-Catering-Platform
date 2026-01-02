/**
 * @file 文档质量持续改进服务
 * @description 提供文档质量评估、自动化检查、改进建议和趋势分析功能
 * @module document-quality-improvement
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { logger } from './logger';
import { documentRepository } from './document.repository';

/**
 * 质量维度枚举
 */
export enum QualityDimension {
  /** 内容完整性 */
  CONTENT_COMPLETENESS = 'content_completeness',
  /** 结构清晰度 */
  STRUCTURE_CLARITY = 'structure_clarity',
  /** 语言准确性 */
  LANGUAGE_ACCURACY = 'language_accuracy',
  /** 格式规范性 */
  FORMAT_CONSISTENCY = 'format_consistency',
  /** 可读性 */
  READABILITY = 'readability',
  /** 可维护性 */
  MAINTAINABILITY = 'maintainability',
  /** 时效性 */
  TIMELINESS = 'timeliness',
  /** 相关性 */
  RELEVANCE = 'relevance',
}

/**
 * 质量等级
 */
export enum QualityGrade {
  /** 优秀 */
  EXCELLENT = 'excellent',
  /** 良好 */
  GOOD = 'good',
  /** 一般 */
  FAIR = 'fair',
  /** 需要改进 */
  NEEDS_IMPROVEMENT = 'needs_improvement',
  /** 不合格 */
  POOR = 'poor',
}

/**
 * 质量指标接口
 */
export interface QualityMetric {
  /** 指标名称 */
  name: QualityDimension;
  /** 指标分数（0-100） */
  score: number;
  /** 权重 */
  weight: number;
  /** 加权分数 */
  weightedScore: number;
  /** 问题描述 */
  issues: string[];
  /** 改进建议 */
  suggestions: string[];
}

/**
 * 质量评估结果接口
 */
export interface QualityAssessment {
  /** 文档ID */
  documentId: string;
  /** 总体分数（0-100） */
  overallScore: number;
  /** 质量等级 */
  grade: QualityGrade;
  /** 各维度指标 */
  metrics: QualityMetric[];
  /** 评估时间 */
  assessedAt: Date;
  /** 评估者 */
  assessor?: string;
}

/**
 * 改进建议接口
 */
export interface ImprovementSuggestion {
  /** 建议ID */
  id: string;
  /** 文档ID */
  documentId: string;
  /** 优先级 */
  priority: 'high' | 'medium' | 'low';
  /** 建议类型 */
  type: string;
  /** 建议描述 */
  description: string;
  /** 具体步骤 */
  steps: string[];
  /** 预期效果 */
  expectedImpact: string;
  /** 状态 */
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 质量趋势数据接口
 */
export interface QualityTrendData {
  /** 日期 */
  date: Date;
  /** 平均分数 */
  averageScore: number;
  /** 文档数量 */
  documentCount: number;
  /** 各等级分布 */
  gradeDistribution: Record<QualityGrade, number>;
}

/**
 * 质量报告接口
 */
export interface QualityReport {
  /** 报告ID */
  id: string;
  /** 报告类型 */
  type: 'daily' | 'weekly' | 'monthly';
  /** 报告周期 */
  period: {
    start: Date;
    end: Date;
  };
  /** 总体统计 */
  summary: {
    totalDocuments: number;
    averageScore: number;
    gradeDistribution: Record<QualityGrade, number>;
    improvedDocuments: number;
    degradedDocuments: number;
  };
  /** 质量趋势 */
  trends: QualityTrendData[];
  /** 主要问题 */
  topIssues: Array<{ issue: string; count: number; percentage: number }>;
  /** 改进建议 */
  recommendations: string[];
  /** 生成时间 */
  generatedAt: Date;
}

/**
 * 文档质量持续改进服务类
 */
class DocumentQualityImprovementService {
  private qualityHistory: Map<string, QualityAssessment[]> = new Map();
  private improvementSuggestions: Map<string, ImprovementSuggestion[]> = new Map();

  /**
   * 评估文档质量
   * @param documentId 文档ID
   * @param assessor 评估者（可选）
   * @returns 质量评估结果
   */
  async assessDocumentQuality(documentId: string, assessor?: string): Promise<QualityAssessment> {
    try {
      const doc = await documentRepository.findById(documentId);
      if (!doc) {
        throw new Error(`文档 ${documentId} 不存在`);
      }

      // 评估各个质量维度
      const metrics: QualityMetric[] = [
        this.assessContentCompleteness(doc),
        this.assessStructureClarity(doc),
        this.assessLanguageAccuracy(doc),
        this.assessFormatConsistency(doc),
        this.assessReadability(doc),
        this.assessMaintainability(doc),
        this.assessTimeliness(doc),
        this.assessRelevance(doc),
      ];

      // 计算总体分数
      const totalWeightedScore = metrics.reduce((sum, m) => sum + m.weightedScore, 0);
      const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
      const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      // 确定质量等级
      const grade = this.determineGrade(overallScore);

      const assessment: QualityAssessment = {
        documentId,
        overallScore,
        grade,
        metrics,
        assessedAt: new Date(),
        assessor,
      };

      // 保存评估历史
      const history = this.qualityHistory.get(documentId) || [];
      history.push(assessment);
      this.qualityHistory.set(documentId, history);

      // 生成改进建议
      await this.generateImprovementSuggestions(assessment);

      logger.info(`Assessed quality for document ${documentId}: ${overallScore.toFixed(1)} (${grade})`);

      return assessment;
    } catch (error) {
      logger.error('Error assessing document quality:', { error });
      throw error;
    }
  }

  /**
   * 批量评估文档质量
   * @param documentIds 文档ID列表
   * @param assessor 评估者（可选）
   * @returns 质量评估结果列表
   */
  async assessBatchDocumentQuality(
    documentIds: string[],
    assessor?: string
  ): Promise<QualityAssessment[]> {
    const assessments: QualityAssessment[] = [];

    for (const documentId of documentIds) {
      try {
        const assessment = await this.assessDocumentQuality(documentId, assessor);
        assessments.push(assessment);
      } catch (error) {
        logger.error(`Failed to assess document ${documentId}:`, { error });
      }
    }

    return assessments;
  }

  /**
   * 获取改进建议
   * @param documentId 文档ID
   * @returns 改进建议列表
   */
  async getImprovementSuggestions(documentId: string): Promise<ImprovementSuggestion[]> {
    const suggestions = this.improvementSuggestions.get(documentId) || [];
    return suggestions.filter((s) => s.status !== 'dismissed');
  }

  /**
   * 更新改进建议状态
   * @param suggestionId 建议ID
   * @param status 新状态
   * @returns 更新后的建议
   */
  async updateSuggestionStatus(
    suggestionId: string,
    status: ImprovementSuggestion['status']
  ): Promise<ImprovementSuggestion | null> {
    for (const suggestions of this.improvementSuggestions.values()) {
      const suggestion = suggestions.find((s) => s.id === suggestionId);
      if (suggestion) {
        suggestion.status = status;
        logger.info(`Updated suggestion ${suggestionId} status to ${status}`);
        return suggestion;
      }
    }

    return null;
  }

  /**
   * 获取质量趋势
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 质量趋势数据
   */
  async getQualityTrends(startDate: Date, endDate: Date): Promise<QualityTrendData[]> {
    const trendData: Map<string, QualityTrendData> = new Map();

    // 按日期聚合评估数据
    for (const [documentId, assessments] of this.qualityHistory.entries()) {
      for (const assessment of assessments) {
        const assessmentDate = assessment.assessedAt;
        if (assessmentDate < startDate || assessmentDate > endDate) {
          continue;
        }

        const dateKey = assessmentDate.toISOString().split('T')[0];
        const existing = trendData.get(dateKey) || {
          date: assessmentDate,
          averageScore: 0,
          documentCount: 0,
          gradeDistribution: {
            [QualityGrade.EXCELLENT]: 0,
            [QualityGrade.GOOD]: 0,
            [QualityGrade.FAIR]: 0,
            [QualityGrade.NEEDS_IMPROVEMENT]: 0,
            [QualityGrade.POOR]: 0,
          },
        };

        existing.averageScore =
          (existing.averageScore * existing.documentCount + assessment.overallScore) /
          (existing.documentCount + 1);
        existing.documentCount += 1;
        existing.gradeDistribution[assessment.grade] += 1;

        trendData.set(dateKey, existing);
      }
    }

    // 转换为数组并排序
    return Array.from(trendData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * 生成质量报告
   * @param type 报告类型
   * @param period 报告周期
   * @returns 质量报告
   */
  async generateQualityReport(
    type: 'daily' | 'weekly' | 'monthly',
    period: { start: Date; end: Date }
  ): Promise<QualityReport> {
    // 获取周期内的所有评估
    const assessmentsInPeriod: QualityAssessment[] = [];

    for (const assessments of this.qualityHistory.values()) {
      for (const assessment of assessments) {
        if (assessment.assessedAt >= period.start && assessment.assessedAt <= period.end) {
          assessmentsInPeriod.push(assessment);
        }
      }
    }

    // 计算总体统计
    const totalDocuments = new Set(assessmentsInPeriod.map((a) => a.documentId)).size;
    const averageScore =
      assessmentsInPeriod.length > 0
        ? assessmentsInPeriod.reduce((sum, a) => sum + a.overallScore, 0) / assessmentsInPeriod.length
        : 0;

    const gradeDistribution: Record<QualityGrade, number> = {
      [QualityGrade.EXCELLENT]: 0,
      [QualityGrade.GOOD]: 0,
      [QualityGrade.FAIR]: 0,
      [QualityGrade.NEEDS_IMPROVEMENT]: 0,
      [QualityGrade.POOR]: 0,
    };

    for (const assessment of assessmentsInPeriod) {
      gradeDistribution[assessment.grade] += 1;
    }

    // 计算改进和退化的文档数量
    let improvedDocuments = 0;
    let degradedDocuments = 0;

    for (const [documentId, assessments] of this.qualityHistory.entries()) {
      const periodAssessments = assessments.filter(
        (a) => a.assessedAt >= period.start && a.assessedAt <= period.end
      );

      if (periodAssessments.length >= 2) {
        const firstScore = periodAssessments[0].overallScore;
        const lastScore = periodAssessments[periodAssessments.length - 1].overallScore;

        if (lastScore > firstScore + 5) {
          improvedDocuments++;
        } else if (lastScore < firstScore - 5) {
          degradedDocuments++;
        }
      }
    }

    // 获取质量趋势
    const trends = await this.getQualityTrends(period.start, period.end);

    // 统计主要问题
    const issueCount = new Map<string, number>();
    for (const assessment of assessmentsInPeriod) {
      for (const metric of assessment.metrics) {
        for (const issue of metric.issues) {
          issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
        }
      }
    }

    const totalIssues = Array.from(issueCount.values()).reduce((sum, count) => sum + count, 0);
    const topIssues = Array.from(issueCount.entries())
      .map(([issue, count]) => ({
        issue,
        count,
        percentage: totalIssues > 0 ? (count / totalIssues) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 生成改进建议
    const recommendations = this.generateRecommendations(averageScore, gradeDistribution, topIssues);

    const report: QualityReport = {
      id: `report-${Date.now()}`,
      type,
      period,
      summary: {
        totalDocuments,
        averageScore,
        gradeDistribution,
        improvedDocuments,
        degradedDocuments,
      },
      trends,
      topIssues,
      recommendations,
      generatedAt: new Date(),
    };

    logger.info(`Generated ${type} quality report for period ${period.start.toISOString()} to ${period.end.toISOString()}`);

    return report;
  }

  /**
   * 评估内容完整性
   * @param doc 文档
   * @returns 质量指标
   */
  private assessContentCompleteness(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // 检查标题
    if (!doc.title || doc.title.trim().length === 0) {
      issues.push('文档缺少标题');
      score -= 20;
    } else if (doc.title.length < 5) {
      issues.push('标题过短，建议至少5个字符');
      score -= 10;
    }

    // 检查内容长度
    if (!doc.content || doc.content.length < 100) {
      issues.push('文档内容过短，建议至少100个字符');
      score -= 30;
    }

    // 检查分类
    if (!doc.category) {
      issues.push('文档缺少分类');
      score -= 15;
    }

    // 检查标签
    if (!doc.tags || doc.tags.length === 0) {
      issues.push('文档缺少标签');
      score -= 10;
    } else if (doc.tags.length < 2) {
      suggestions.push('建议添加更多标签以提高文档可发现性');
      score -= 5;
    }

    return {
      name: QualityDimension.CONTENT_COMPLETENESS,
      score: Math.max(0, score),
      weight: 0.2,
      weightedScore: Math.max(0, score) * 0.2,
      issues,
      suggestions,
    };
  }

  /**
   * 评估结构清晰度
   * @param doc 文档
   * @returns 质量指标
   */
  private assessStructureClarity(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // 检查内容结构
    if (doc.content) {
      const hasHeadings = /^#+\s/.test(doc.content);
      const hasLists = /^[-*+]\s|^\d+\.\s/.test(doc.content);
      const hasCodeBlocks = /```[\s\S]*?```/.test(doc.content);

      if (!hasHeadings) {
        suggestions.push('建议使用标题（#）来组织文档结构');
        score -= 15;
      }

      if (!hasLists) {
        suggestions.push('建议使用列表来组织要点');
        score -= 10;
      }

      if (!hasCodeBlocks) {
        suggestions.push('如包含代码，建议使用代码块（```）');
        score -= 5;
      }
    }

    return {
      name: QualityDimension.STRUCTURE_CLARITY,
      score: Math.max(0, score),
      weight: 0.15,
      weightedScore: Math.max(0, score) * 0.15,
      issues,
      suggestions,
    };
  }

  /**
   * 评估语言准确性
   * @param doc 文档
   * @returns 质量指标
   */
  private assessLanguageAccuracy(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (doc.content) {
      // 检查拼写错误（简化版）
      const misspellings = this.detectMisspellings(doc.content);
      if (misspellings.length > 0) {
        issues.push(`发现${misspellings.length}处可能的拼写错误`);
        score -= Math.min(20, misspellings.length * 2);
      }

      // 检查语法问题（简化版）
      const grammarIssues = this.detectGrammarIssues(doc.content);
      if (grammarIssues.length > 0) {
        issues.push(`发现${grammarIssues.length}处可能的语法问题`);
        score -= Math.min(15, grammarIssues.length * 3);
      }

      // 检查术语一致性
      const termInconsistencies = this.detectTermInconsistencies(doc.content);
      if (termInconsistencies.length > 0) {
        suggestions.push('建议统一术语使用');
        score -= 10;
      }
    }

    return {
      name: QualityDimension.LANGUAGE_ACCURACY,
      score: Math.max(0, score),
      weight: 0.15,
      weightedScore: Math.max(0, score) * 0.15,
      issues,
      suggestions,
    };
  }

  /**
   * 评估格式规范性
   * @param doc 文档
   * @returns 质量指标
   */
  private assessFormatConsistency(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (doc.content) {
      // 检查标题层级
      const headingLevels = doc.content.match(/^#+\s/g);
      if (headingLevels) {
        const levels = headingLevels.map((h: string) => h.trim().length);
        const hasSkippedLevels = levels.some((level: number, i: number) => i > 0 && level - levels[i - 1] > 1);
        if (hasSkippedLevels) {
          issues.push('标题层级不连续，建议按顺序使用');
          score -= 15;
        }
      }

      // 检查空行使用
      const excessiveEmptyLines = doc.content.match(/\n{3,}/g);
      if (excessiveEmptyLines && excessiveEmptyLines.length > 5) {
        suggestions.push('建议减少连续空行数量');
        score -= 5;
      }
    }

    return {
      name: QualityDimension.FORMAT_CONSISTENCY,
      score: Math.max(0, score),
      weight: 0.1,
      weightedScore: Math.max(0, score) * 0.1,
      issues,
      suggestions,
    };
  }

  /**
   * 评估可读性
   * @param doc 文档
   * @returns 质量指标
   */
  private assessReadability(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (doc.content) {
      // 计算平均句子长度
      const sentences = doc.content.split(/[。！？.!?]+/).filter((s: string) => s.trim().length > 0);
      const avgSentenceLength =
        sentences.length > 0
          ? doc.content.length / sentences.length
          : 0;

      if (avgSentenceLength > 100) {
        suggestions.push('建议缩短句子长度以提高可读性');
        score -= 10;
      }

      // 计算段落长度
      const paragraphs = doc.content.split(/\n\n+/).filter((p: string) => p.trim().length > 0);
      const longParagraphs = paragraphs.filter((p: string) => p.length > 500);
      if (longParagraphs.length > paragraphs.length * 0.3) {
        suggestions.push('建议将长段落拆分为多个短段落');
        score -= 15;
      }
    }

    return {
      name: QualityDimension.READABILITY,
      score: Math.max(0, score),
      weight: 0.1,
      weightedScore: Math.max(0, score) * 0.1,
      issues,
      suggestions,
    };
  }

  /**
   * 评估可维护性
   * @param doc 文档
   * @returns 质量指标
   */
  private assessMaintainability(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // 检查文档元数据
    if (!doc.createdAt) {
      issues.push('文档缺少创建时间');
      score -= 10;
    }

    if (!doc.updatedAt) {
      issues.push('文档缺少更新时间');
      score -= 10;
    }

    if (!doc.author) {
      issues.push('文档缺少作者信息');
      score -= 10;
    }

    // 检查版本信息
    if (!doc.version) {
      suggestions.push('建议添加版本信息');
      score -= 5;
    }

    return {
      name: QualityDimension.MAINTAINABILITY,
      score: Math.max(0, score),
      weight: 0.1,
      weightedScore: Math.max(0, score) * 0.1,
      issues,
      suggestions,
    };
  }

  /**
   * 评估时效性
   * @param doc 文档
   * @returns 质量指标
   */
  private assessTimeliness(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (doc.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(doc.updatedAt).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate > 365) {
        issues.push('文档已超过1年未更新');
        score -= 30;
      } else if (daysSinceUpdate > 180) {
        suggestions.push('文档已超过6个月未更新，建议检查内容是否需要更新');
        score -= 15;
      } else if (daysSinceUpdate > 90) {
        suggestions.push('文档已超过3个月未更新');
        score -= 5;
      }
    } else {
      issues.push('文档缺少更新时间信息');
      score -= 20;
    }

    return {
      name: QualityDimension.TIMELINESS,
      score: Math.max(0, score),
      weight: 0.1,
      weightedScore: Math.max(0, score) * 0.1,
      issues,
      suggestions,
    };
  }

  /**
   * 评估相关性
   * @param doc 文档
   * @returns 质量指标
   */
  private assessRelevance(doc: any): QualityMetric {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // 检查文档分类与内容的匹配度（简化版）
    if (doc.category && doc.content) {
      const categoryKeywords = this.getCategoryKeywords(doc.category);
      const contentLower = doc.content.toLowerCase();
      const matchedKeywords = categoryKeywords.filter((kw) => contentLower.includes(kw));

      if (matchedKeywords.length === 0) {
        suggestions.push('文档内容可能与分类不匹配');
        score -= 20;
      } else if (matchedKeywords.length < categoryKeywords.length * 0.5) {
        suggestions.push('建议检查文档分类是否准确');
        score -= 10;
      }
    }

    return {
      name: QualityDimension.RELEVANCE,
      score: Math.max(0, score),
      weight: 0.1,
      weightedScore: Math.max(0, score) * 0.1,
      issues,
      suggestions,
    };
  }

  /**
   * 确定质量等级
   * @param score 总体分数
   * @returns 质量等级
   */
  private determineGrade(score: number): QualityGrade {
    if (score >= 90) return QualityGrade.EXCELLENT;
    if (score >= 75) return QualityGrade.GOOD;
    if (score >= 60) return QualityGrade.FAIR;
    if (score >= 40) return QualityGrade.NEEDS_IMPROVEMENT;
    return QualityGrade.POOR;
  }

  /**
   * 生成改进建议
   * @param assessment 质量评估结果
   */
  private async generateImprovementSuggestions(assessment: QualityAssessment): Promise<void> {
    const suggestions: ImprovementSuggestion[] = [];

    for (const metric of assessment.metrics) {
      for (const issue of metric.issues) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          documentId: assessment.documentId,
          priority: metric.score < 60 ? 'high' : metric.score < 80 ? 'medium' : 'low',
          type: metric.name,
          description: issue,
          steps: this.generateImprovementSteps(metric.name, issue),
          expectedImpact: `预计提升${metric.name}维度分数5-10分`,
          status: 'pending',
          createdAt: new Date(),
        });
      }

      for (const suggestion of metric.suggestions) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          documentId: assessment.documentId,
          priority: 'low',
          type: metric.name,
          description: suggestion,
          steps: this.generateImprovementSteps(metric.name, suggestion),
          expectedImpact: `预计提升${metric.name}维度分数2-5分`,
          status: 'pending',
          createdAt: new Date(),
        });
      }
    }

    this.improvementSuggestions.set(assessment.documentId, suggestions);
  }

  /**
   * 生成改进步骤
   * @param dimension 质量维度
   * @param issue 问题描述
   * @returns 改进步骤
   */
  private generateImprovementSteps(dimension: QualityDimension, issue: string): string[] {
    const stepMap: Record<QualityDimension, Record<string, string[]>> = {
      [QualityDimension.CONTENT_COMPLETENESS]: {
        '文档缺少标题': ['添加文档标题', '确保标题描述文档内容'],
        '文档内容过短': ['补充文档内容', '添加详细说明和示例'],
        '文档缺少分类': ['选择合适的文档分类', '确保分类准确反映文档内容'],
        '文档缺少标签': ['添加相关标签', '使用关键词作为标签'],
      },
      [QualityDimension.STRUCTURE_CLARITY]: {
        '建议使用标题': ['使用 # ## ### 等标题标记', '按层级组织内容'],
        '建议使用列表': ['使用 - 或数字列表', '组织要点信息'],
      },
      [QualityDimension.LANGUAGE_ACCURACY]: {
        '发现拼写错误': ['使用拼写检查工具', '逐句检查并修正'],
        '发现语法问题': ['使用语法检查工具', '参考语法规则修正'],
      },
      [QualityDimension.FORMAT_CONSISTENCY]: {
        '标题层级不连续': ['按顺序使用标题层级', '避免跳级使用'],
      },
      [QualityDimension.READABILITY]: {
        '建议缩短句子': ['拆分长句', '使用简单句式'],
        '建议拆分段落': ['将长段落分成多个短段落', '每段控制在200-300字'],
      },
      [QualityDimension.MAINTAINABILITY]: {
        '文档缺少创建时间': ['添加文档创建时间', '使用标准格式'],
        '文档缺少更新时间': ['添加文档更新时间', '每次更新时更新时间'],
        '文档缺少作者信息': ['添加作者信息', '包含作者姓名和联系方式'],
      },
      [QualityDimension.TIMELINESS]: {
        '文档已超过1年未更新': ['检查文档内容是否过时', '更新过时信息'],
        '文档已超过6个月未更新': ['检查文档是否需要更新', '添加最新信息'],
      },
      [QualityDimension.RELEVANCE]: {
        '文档内容可能与分类不匹配': ['检查文档分类是否准确', '调整分类或内容'],
      },
    };

    return stepMap[dimension]?.[issue] || ['分析问题', '制定改进计划', '实施改进', '验证效果'];
  }

  /**
   * 生成报告建议
   * @param averageScore 平均分数
   * @param gradeDistribution 等级分布
   * @param topIssues 主要问题
   * @returns 建议列表
   */
  private generateRecommendations(
    averageScore: number,
    gradeDistribution: Record<QualityGrade, number>,
    topIssues: Array<{ issue: string; count: number; percentage: number }>
  ): string[] {
    const recommendations: string[] = [];

    // 基于平均分数的建议
    if (averageScore < 60) {
      recommendations.push('整体文档质量较低，建议进行全面质量提升计划');
    } else if (averageScore < 75) {
      recommendations.push('文档质量有待提升，建议重点关注低分文档');
    } else if (averageScore >= 90) {
      recommendations.push('文档质量优秀，建议继续保持并分享最佳实践');
    }

    // 基于等级分布的建议
    const totalDocs = Object.values(gradeDistribution).reduce((sum, count) => sum + count, 0);
    if (totalDocs > 0) {
      const poorPercentage = (gradeDistribution[QualityGrade.POOR] / totalDocs) * 100;
      if (poorPercentage > 10) {
        recommendations.push(`有${poorPercentage.toFixed(1)}%的文档质量不合格，需要立即改进`);
      }
    }

    // 基于主要问题的建议
    if (topIssues.length > 0) {
      recommendations.push(`主要问题集中在：${topIssues.slice(0, 3).map((i) => i.issue).join('、')}`);
    }

    return recommendations;
  }

  /**
   * 检测拼写错误（简化版）
   * @param text 文本
   * @returns 拼写错误列表
   */
  private detectMisspellings(text: string): string[] {
    // 简化实现，实际应该使用拼写检查库
    const commonMisspellings = ['teh', 'adn', 'don\'t', 'can\'t', 'won\'t', 'should', 'because'];
    const found: string[] = [];

    for (const misspelling of commonMisspellings) {
      if (text.toLowerCase().includes(misspelling)) {
        found.push(misspelling);
      }
    }

    return found;
  }

  /**
   * 检测语法问题（简化版）
   * @param text 文本
   * @returns 语法问题列表
   */
  private detectGrammarIssues(text: string): string[] {
    // 简化实现，实际应该使用语法检查库
    const issues: string[] = [];

    // 检查连续空格
    if (/\s{2,}/.test(text)) {
      issues.push('存在连续空格');
    }

    // 检查句子末尾标点
    const sentences = text.split(/[。！？.!?]+/);
    const lastSentence = sentences[sentences.length - 1];
    if (lastSentence.trim().length > 0) {
      issues.push('文档末尾缺少标点符号');
    }

    return issues;
  }

  /**
   * 检测术语不一致（简化版）
   * @param text 文本
   * @returns 不一致术语列表
   */
  private detectTermInconsistencies(text: string): string[] {
    // 简化实现，实际应该建立术语词典
    const inconsistentTerms: string[] = [];

    // 检查常见术语变体
    const termVariants = [
      ['用户', '使用者', 'user'],
      ['文档', '文件', 'document'],
      ['系统', '平台', 'system'],
    ];

    for (const variants of termVariants) {
      const foundVariants = variants.filter((variant) => text.includes(variant));
      if (foundVariants.length > 1) {
        inconsistentTerms.push(`术语不一致：${foundVariants.join('、')}`);
      }
    }

    return inconsistentTerms;
  }

  /**
   * 获取分类关键词
   * @param category 分类
   * @returns 关键词列表
   */
  private getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      '技术文档': ['技术', '开发', '代码', 'API', '架构'],
      '产品文档': ['产品', '功能', '需求', '用户', '体验'],
      '运营文档': ['运营', '推广', '营销', '活动', '数据'],
      '管理文档': ['管理', '流程', '制度', '规范', '标准'],
    };

    return keywordMap[category] || [];
  }

  /**
   * 获取质量统计
   * @returns 质量统计信息
   */
  async getQualityStats() {
    const allAssessments: QualityAssessment[] = [];

    for (const assessments of this.qualityHistory.values()) {
      allAssessments.push(...assessments);
    }

    if (allAssessments.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        gradeDistribution: {},
        lastAssessmentDate: null,
      };
    }

    const averageScore =
      allAssessments.reduce((sum, a) => sum + a.overallScore, 0) / allAssessments.length;

    const gradeDistribution: Record<QualityGrade, number> = {
      [QualityGrade.EXCELLENT]: 0,
      [QualityGrade.GOOD]: 0,
      [QualityGrade.FAIR]: 0,
      [QualityGrade.NEEDS_IMPROVEMENT]: 0,
      [QualityGrade.POOR]: 0,
    };

    for (const assessment of allAssessments) {
      gradeDistribution[assessment.grade] += 1;
    }

    const lastAssessmentDate = allAssessments.reduce(
      (max, a) => (a.assessedAt > max ? a.assessedAt : max),
      allAssessments[0].assessedAt
    );

    return {
      totalAssessments: allAssessments.length,
      averageScore,
      gradeDistribution,
      lastAssessmentDate,
    };
  }
}

// 创建文档质量改进服务实例
export const documentQualityImprovementService = new DocumentQualityImprovementService();
