/**
 * @file 质量评估服务
 * @description 提供文档质量评估功能
 * @module services/quality-assessment.service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { QualityMetrics, QualityReport, QualityIssue } from './document.types';
import { Logger } from './logger';

export class QualityAssessmentService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('QualityAssessmentService');
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing quality assessment service');
  }

  /**
   * 评估文档质量
   * @param content 文档内容
   * @returns 质量报告
   */
  async assessDocument(content: string): Promise<{
    overallScore: number;
    metrics: QualityMetrics;
    issues: QualityIssue[];
    suggestions: string[];
  }> {
    try {
      this.logger.info('Assessing document quality');

      // 评估各维度
      const metrics = await this.assessMetrics(content);

      // 计算综合评分
      const overallScore = this.calculateOverallScore(metrics);

      // 识别问题
      const issues = await this.identifyIssues(content, metrics);

      // 生成建议
      const suggestions = this.generateSuggestions(issues);

      return {
        overallScore,
        metrics,
        issues,
        suggestions,
      };
    } catch (error) {
      this.logger.error('Failed to assess document quality', { error });
      throw error;
    }
  }

  /**
   * 评估质量指标
   * @param content 文档内容
   * @returns 质量指标
   */
  async assessMetrics(content: string): Promise<QualityMetrics> {
    try {
      // 内容完整性
      const contentCompleteness = this.assessContentCompleteness(content);

      // 结构规范化
      const structureNormalization = this.assessStructureNormalization(content);

      // 技术准确性
      const technicalAccuracy = this.assessTechnicalAccuracy(content);

      // 可读性
      const readability = this.assessReadability(content);

      // 实用性
      const practicality = this.assessPracticality(content);

      return {
        contentCompleteness,
        structureNormalization,
        technicalAccuracy,
        readability,
        practicality,
      };
    } catch (error) {
      this.logger.error('Failed to assess metrics', { error });
      throw error;
    }
  }

  /**
   * 评估内容完整性
   * @param content 文档内容
   * @returns 完整性评分
   */
  private assessContentCompleteness(content: string): number {
    let score = 0;

    // 检查是否有标题
    const hasTitle = /^#\s+.+/m.test(content);
    if (hasTitle) score += 20;

    // 检查是否有描述
    const hasDescription = content.length > 100;
    if (hasDescription) score += 20;

    // 检查是否有章节
    const hasSections = (content.match(/^##\s+.+/gm) || []).length >= 2;
    if (hasSections) score += 20;

    // 检查是否有代码示例
    const hasCodeExamples = /```[\s\S]*?```/.test(content);
    if (hasCodeExamples) score += 20;

    // 检查是否有列表
    const hasLists = /^[\s]*[-*+]\s+/m.test(content);
    if (hasLists) score += 20;

    return Math.min(score, 100);
  }

  /**
   * 评估结构规范化
   * @param content 文档内容
   * @returns 规范化评分
   */
  private assessStructureNormalization(content: string): number {
    let score = 0;

    // 检查标题层级
    const hasProperHeadings = /^#{1,6}\s+.+/m.test(content);
    if (hasProperHeadings) score += 25;

    // 检查段落分隔
    const hasParagraphs = /\n\n/.test(content);
    if (hasParagraphs) score += 25;

    // 检查代码块格式
    const hasCodeBlocks = /```[\s\S]*?```/.test(content);
    if (hasCodeBlocks) score += 25;

    // 检查链接格式
    const hasLinks = /\[.+\]\(.+\)/.test(content);
    if (hasLinks) score += 25;

    return Math.min(score, 100);
  }

  /**
   * 评估技术准确性
   * @param content 文档内容
   * @returns 准确性评分
   */
  private assessTechnicalAccuracy(content: string): number {
    // 这里可以集成更复杂的NLP分析
    let score = 70; // 基础分

    // 检查是否有技术术语
    const hasTechnicalTerms = /API|SDK|HTTP|JSON|XML|SQL|JavaScript|TypeScript|Python/i.test(content);
    if (hasTechnicalTerms) score += 10;

    // 检查是否有代码片段
    const hasCodeSnippets = /```[\s\S]*?```/.test(content);
    if (hasCodeSnippets) score += 10;

    // 检查是否有配置示例
    const hasConfigExamples = /config|settings|options/i.test(content);
    if (hasConfigExamples) score += 10;

    return Math.min(score, 100);
  }

  /**
   * 评估可读性
   * @param content 文档内容
   * @returns 可读性评分
   */
  private assessReadability(content: string): number {
    let score = 0;

    // 检查平均句子长度
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    if (avgSentenceLength < 100) score += 30;
    else if (avgSentenceLength < 150) score += 20;
    else if (avgSentenceLength < 200) score += 10;

    // 检查段落长度
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;

    if (avgParagraphLength < 500) score += 30;
    else if (avgParagraphLength < 800) score += 20;
    else if (avgParagraphLength < 1200) score += 10;

    // 检查是否有格式化
    const hasFormatting = /(\*\*|__|~~|`)/.test(content);
    if (hasFormatting) score += 20;

    // 检查是否有列表
    const hasLists = /^[\s]*[-*+]\s+/m.test(content);
    if (hasLists) score += 20;

    return Math.min(score, 100);
  }

  /**
   * 评估实用性
   * @param content 文档内容
   * @returns 实用性评分
   */
  private assessPracticality(content: string): number {
    let score = 0;

    // 检查是否有示例
    const hasExamples = /示例|example|演示/i.test(content);
    if (hasExamples) score += 25;

    // 检查是否有步骤
    const hasSteps = /步骤|step|1\.|2\.|3\./i.test(content);
    if (hasSteps) score += 25;

    // 检查是否有注意事项
    const hasNotes = /注意|note|warning/i.test(content);
    if (hasNotes) score += 25;

    // 检查是否有FAQ
    const hasFAQ = /FAQ|常见问题|问答/i.test(content);
    if (hasFAQ) score += 25;

    return Math.min(score, 100);
  }

  /**
   * 计算综合评分
   * @param metrics 质量指标
   * @returns 综合评分
   */
  private calculateOverallScore(metrics: QualityMetrics): number {
    const weights = {
      contentCompleteness: 0.3,
      structureNormalization: 0.2,
      technicalAccuracy: 0.25,
      readability: 0.15,
      practicality: 0.1,
    };

    return (
      metrics.contentCompleteness * weights.contentCompleteness +
      metrics.structureNormalization * weights.structureNormalization +
      metrics.technicalAccuracy * weights.technicalAccuracy +
      metrics.readability * weights.readability +
      metrics.practicality * weights.practicality
    );
  }

  /**
   * 识别问题
   * @param content 文档内容
   * @param metrics 质量指标
   * @returns 问题列表
   */
  private async identifyIssues(content: string, metrics: QualityMetrics): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];

    // 内容完整性问题
    if (metrics.contentCompleteness < 60) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: '文档内容不够完整',
        suggestion: '建议添加更多章节和示例',
      });
    }

    // 结构规范化问题
    if (metrics.structureNormalization < 60) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: '文档结构不够规范',
        suggestion: '建议使用标准的Markdown格式',
      });
    }

    // 技术准确性问题
    if (metrics.technicalAccuracy < 60) {
      issues.push({
        type: 'warning',
        category: 'technical',
        message: '文档技术准确性有待提高',
        suggestion: '建议添加更多技术细节和代码示例',
      });
    }

    // 可读性问题
    if (metrics.readability < 60) {
      issues.push({
        type: 'warning',
        category: 'readability',
        message: '文档可读性有待提高',
        suggestion: '建议优化句子和段落长度',
      });
    }

    // 实用性问题
    if (metrics.practicality < 60) {
      issues.push({
        type: 'warning',
        category: 'practicality',
        message: '文档实用性有待提高',
        suggestion: '建议添加更多示例和步骤说明',
      });
    }

    return issues;
  }

  /**
   * 生成建议
   * @param issues 问题列表
   * @returns 建议列表
   */
  private generateSuggestions(issues: QualityIssue[]): string[] {
    const suggestions: string[] = [];

    for (const issue of issues) {
      if (issue.suggestion) {
        suggestions.push(issue.suggestion);
      }
    }

    // 添加通用建议
    if (suggestions.length === 0) {
      suggestions.push('文档质量良好，继续保持');
    } else {
      suggestions.push('建议定期更新文档内容');
      suggestions.push('建议添加更多实际应用场景');
    }

    return suggestions;
  }

  /**
   * 提取关键词
   * @param content 文档内容
   * @returns 关键词列表
   */
  async extractKeywords(content: string): Promise<string[]> {
    try {
      // 简单的关键词提取
      const words = content
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 2);

      // 统计词频
      const wordCount = new Map<string, number>();
      for (const word of words) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }

      // 排序并返回前20个关键词
      return Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word]) => word);
    } catch (error) {
      this.logger.error('Failed to extract keywords', { error });
      throw error;
    }
  }

  /**
   * 评估质量
   * @param content 文档内容
   * @returns 质量指标
   */
  async assessQuality(content: string): Promise<QualityMetrics> {
    return await this.assessMetrics(content);
  }
}
