/**
 * @file 文档自动摘要生成服务
 * @description 基于NLP和大语言模型的文档摘要生成系统，支持多种摘要策略和自定义配置
 * @module document-summary
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { logger } from './logger';
import { documentRepository } from './document.repository';

/**
 * 摘要类型枚举
 */
export enum SummaryType {
  /** 简短摘要（1-2句话） */
  SHORT = 'short',
  /** 中等摘要（3-5句话） */
  MEDIUM = 'medium',
  /** 详细摘要（6-10句话） */
  DETAILED = 'detailed',
  /** 关键点摘要（要点列表） */
  KEY_POINTS = 'key_points',
  /** 执行摘要（包含关键信息和行动项） */
  EXECUTIVE = 'executive',
}

/**
 * 摘要策略枚举
 */
export enum SummaryStrategy {
  /** 抽取式摘要（从原文中提取关键句子） */
  EXTRACTIVE = 'extractive',
  /** 生成式摘要（生成新的摘要文本） */
  ABSTRACTIVE = 'abstractive',
  /** 混合式摘要（结合抽取和生成） */
  HYBRID = 'hybrid',
}

/**
 * 摘要配置接口
 */
export interface SummaryConfig {
  /** 摘要类型 */
  type: SummaryType;
  /** 摘要策略 */
  strategy: SummaryStrategy;
  /** 最大长度（字符数） */
  maxLength?: number;
  /** 是否包含关键词 */
  includeKeywords?: boolean;
  /** 是否包含关键点 */
  includeKeyPoints?: boolean;
  /** 自定义提示词 */
  customPrompt?: string;
}

/**
 * 摘要结果接口
 */
export interface SummaryResult {
  /** 文档ID */
  documentId: string;
  /** 摘要文本 */
  summary: string;
  /** 关键词列表 */
  keywords: string[];
  /** 关键点列表 */
  keyPoints: string[];
  /** 摘要长度 */
  length: number;
  /** 原文长度 */
  originalLength: number;
  /** 压缩率 */
  compressionRatio: number;
  /** 生成时间（毫秒） */
  generationTime: number;
  /** 置信度分数 */
  confidence: number;
  /** 摘要配置 */
  config: SummaryConfig;
}

/**
 * 文档摘要生成服务类
 */
class DocumentSummaryService {
  private readonly defaultConfig: SummaryConfig = {
    type: SummaryType.MEDIUM,
    strategy: SummaryStrategy.HYBRID,
    maxLength: 500,
    includeKeywords: true,
    includeKeyPoints: true,
  };

  /**
   * 生成文档摘要
   * @param documentId 文档ID
   * @param config 摘要配置
   * @returns 摘要结果
   */
  async generateSummary(
    documentId: string,
    config: Partial<SummaryConfig> = {}
  ): Promise<SummaryResult> {
    const startTime = Date.now();

    try {
      // 合并配置
      const finalConfig: SummaryConfig = {
        ...this.defaultConfig,
        ...config,
      };

      // 获取文档
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // 根据策略生成摘要
      let summary: string;
      switch (finalConfig.strategy) {
        case SummaryStrategy.EXTRACTIVE:
          summary = await this.extractiveSummary(document.content, finalConfig);
          break;
        case SummaryStrategy.ABSTRACTIVE:
          summary = await this.abstractiveSummary(document.content, finalConfig);
          break;
        case SummaryStrategy.HYBRID:
          summary = await this.hybridSummary(document.content, finalConfig);
          break;
        default:
          summary = await this.hybridSummary(document.content, finalConfig);
      }

      // 提取关键词
      const keywords = finalConfig.includeKeywords
        ? this.extractKeywords(document.content)
        : [];

      // 提取关键点
      const keyPoints = finalConfig.includeKeyPoints
        ? this.extractKeyPoints(document.content)
        : [];

      // 计算压缩率
      const originalLength = document.content.length;
      const compressionRatio = originalLength > 0 ? summary.length / originalLength : 0;

      // 计算置信度
      const confidence = this.calculateConfidence(summary, document.content);

      // 计算生成时间
      const generationTime = Date.now() - startTime;

      const result: SummaryResult = {
        documentId,
        summary,
        keywords,
        keyPoints,
        length: summary.length,
        originalLength,
        compressionRatio,
        generationTime,
        confidence,
        config: finalConfig,
      };

      logger.info(`Generated summary for document: ${documentId}`);

      return result;
    } catch (error) {
      logger.error('Error generating summary:', { error });
      throw error;
    }
  }

  /**
   * 批量生成摘要
   * @param documentIds 文档ID列表
   * @param config 摘要配置
   * @returns 摘要结果列表
   */
  async generateBatchSummary(
    documentIds: string[],
    config: Partial<SummaryConfig> = {}
  ): Promise<SummaryResult[]> {
    const results: SummaryResult[] = [];

    for (const documentId of documentIds) {
      try {
        const result = await this.generateSummary(documentId, config);
        results.push(result);
      } catch (error) {
        logger.error(`Error generating summary for document: ${documentId}`, { error });
      }
    }

    return results;
  }

  /**
   * 抽取式摘要
   * @param content 文档内容
   * @param config 摘要配置
   * @returns 摘要文本
   */
  private async extractiveSummary(
    content: string,
    config: SummaryConfig
  ): Promise<string> {
    // 分句
    const sentences = this.splitIntoSentences(content);

    // 计算句子重要性分数
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      score: this.calculateSentenceScore(sentence, content, index, sentences.length),
    }));

    // 按分数排序
    scoredSentences.sort((a, b) => b.score - a.score);

    // 根据摘要类型选择句子数量
    let sentenceCount: number;
    switch (config.type) {
      case SummaryType.SHORT:
        sentenceCount = 2;
        break;
      case SummaryType.MEDIUM:
        sentenceCount = 4;
        break;
      case SummaryType.DETAILED:
        sentenceCount = 8;
        break;
      case SummaryType.KEY_POINTS:
        sentenceCount = 6;
        break;
      case SummaryType.EXECUTIVE:
        sentenceCount = 5;
        break;
      default:
        sentenceCount = 4;
    }

    // 选择前N个句子
    const selectedSentences = scoredSentences
      .slice(0, sentenceCount)
      .map((s) => s.sentence);

    // 按原文顺序排序
    const sortedSentences = selectedSentences.sort((a, b) => {
      return content.indexOf(a) - content.indexOf(b);
    });

    // 组合成摘要
    let summary = sortedSentences.join('。');

    // 根据摘要类型调整格式
    if (config.type === SummaryType.KEY_POINTS) {
      summary = selectedSentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
    } else if (config.type === SummaryType.EXECUTIVE) {
      summary = `关键信息：\n${sortedSentences.join('\n')}`;
    }

    return summary;
  }

  /**
   * 生成式摘要
   * @param content 文档内容
   * @param config 摘要配置
   * @returns 摘要文本
   */
  private async abstractiveSummary(
    content: string,
    config: SummaryConfig
  ): Promise<string> {
    // 构建提示词
    const prompt = this.buildAbstractivePrompt(content, config);

    // 调用大语言模型生成摘要
    const summary = await this.callLLM(prompt);

    return summary;
  }

  /**
   * 混合式摘要
   * @param content 文档内容
   * @param config 摘要配置
   * @returns 摘要文本
   */
  private async hybridSummary(
    content: string,
    config: SummaryConfig
  ): Promise<string> {
    // 先进行抽取式摘要
    const extractiveSummary = await this.extractiveSummary(content, config);

    // 如果是详细摘要或执行摘要，使用生成式摘要进行优化
    if (config.type === SummaryType.DETAILED || config.type === SummaryType.EXECUTIVE) {
      const prompt = `请优化以下摘要，使其更加流畅和准确：\n\n${extractiveSummary}`;
      const optimizedSummary = await this.callLLM(prompt);
      return optimizedSummary;
    }

    return extractiveSummary;
  }

  /**
   * 构建生成式摘要提示词
   * @param content 文档内容
   * @param config 摘要配置
   * @returns 提示词
   */
  private buildAbstractivePrompt(content: string, config: SummaryConfig): string {
    let prompt = `请为以下文档生成摘要：\n\n${content}\n\n`;

    switch (config.type) {
      case SummaryType.SHORT:
        prompt += '请生成1-2句话的简短摘要。';
        break;
      case SummaryType.MEDIUM:
        prompt += '请生成3-5句话的中等长度摘要。';
        break;
      case SummaryType.DETAILED:
        prompt += '请生成6-10句话的详细摘要。';
        break;
      case SummaryType.KEY_POINTS:
        prompt += '请生成要点列表形式的摘要，列出5-7个关键点。';
        break;
      case SummaryType.EXECUTIVE:
        prompt += '请生成执行摘要，包含关键信息、主要发现和建议的行动项。';
        break;
    }

    if (config.customPrompt) {
      prompt += `\n\n${config.customPrompt}`;
    }

    return prompt;
  }

  /**
   * 调用大语言模型
   * @param prompt 提示词
   * @returns 生成的文本
   */
  private async callLLM(prompt: string): Promise<string> {
    try {
      // 这里应该调用实际的LLM API（如GPT-4、Claude-3等）
      // 由于这是一个示例，我们使用模拟实现

      // 模拟LLM调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟生成结果
      const result = this.generateMockLLMResult(prompt);

      return result;
    } catch (error) {
      logger.error('Error calling LLM:', { error });
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * 生成模拟LLM结果（实际应用中应替换为真实的LLM调用）
   * @param prompt 提示词
   * @returns 模拟结果
   */
  private generateMockLLMResult(prompt: string): string {
    // 简化的模拟实现
    // 实际应用中应该调用真实的LLM API

    if (prompt.includes('要点列表')) {
      return `1. 文档知识库系统是一个集成了文档管理、智能检索、质量评估的综合性平台。
2. 系统支持多种文档格式，包括Markdown、PDF、Word等。
3. 智能检索功能支持关键词、语义和混合搜索。
4. 文档质量监控提供多维度评估和实时监控。
5. 系统支持文档协作编辑和自动化审核流程。`;
    } else if (prompt.includes('执行摘要')) {
      return `执行摘要：

关键信息：
YYC³文档知识库系统是一个综合性文档管理平台，集成了文档管理、智能检索、质量评估、使用分析、协作编辑和审核流程等功能。

主要发现：
- 系统采用6层分层架构，具有良好的扩展性和可维护性
- 智能检索引擎支持多种搜索模式，检索准确率>95%
- 文档质量监控系统提供多维度评估，评估时间<2秒
- 协作编辑系统支持实时协作，延迟<100ms

建议行动项：
1. 继续优化智能检索算法，提升检索准确率
2. 扩展文档质量评估维度，提供更全面的评估
3. 增强协作编辑功能，提升用户体验`;
    } else {
      return `YYC³文档知识库系统是一个集成了文档管理、智能检索、质量评估、使用分析、协作编辑和审核流程的综合性平台。系统采用6层分层架构，支持多种文档格式，提供智能检索、质量监控、协作编辑等核心功能。智能检索引擎支持关键词、语义和混合搜索，检索准确率超过95%。文档质量监控系统提供多维度评估和实时监控，评估时间小于2秒。系统还支持实时协作编辑，延迟小于100毫秒。`;
    }
  }

  /**
   * 计算句子重要性分数
   * @param sentence 句子
   * @param content 完整内容
   * @param index 句子索引
   * @param totalSentences 总句子数
   * @returns 分数
   */
  private calculateSentenceScore(
    sentence: string,
    content: string,
    index: number,
    totalSentences: number
  ): number {
    let score = 0;

    // 1. 句子长度分数（适中长度得分更高）
    const length = sentence.length;
    if (length >= 20 && length <= 100) {
      score += 0.3;
    } else if (length >= 10 && length <= 150) {
      score += 0.2;
    }

    // 2. 位置分数（开头和结尾的句子得分更高）
    const position = index / totalSentences;
    if (position < 0.2 || position > 0.8) {
      score += 0.3;
    } else if (position < 0.4 || position > 0.6) {
      score += 0.2;
    }

    // 3. 关键词分数（包含关键词的句子得分更高）
    const keywords = this.extractKeywords(content);
    const keywordCount = keywords.filter((keyword) => sentence.includes(keyword)).length;
    score += Math.min(keywordCount * 0.1, 0.3);

    // 4. 数字和特殊字符分数（包含数字和特殊字符的句子得分更高）
    if (/\d+/.test(sentence)) {
      score += 0.1;
    }

    return score;
  }

  /**
   * 提取关键词
   * @param content 文档内容
   * @returns 关键词列表
   */
  private extractKeywords(content: string): string[] {
    const keywords: string[] = [];
    const stopWords = new Set([
      '的', '是', '在', '和', '了', '有', '我', '你', '他', '她', '它',
      '我们', '你们', '他们', '这', '那', '这个', '那个', '一个', '一些',
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in',
    ]);

    // 简化的关键词提取
    // 实际应用中应该使用TF-IDF、TextRank等算法

    const words = content.split(/[\s,，。！？、\n]+/);
    const wordFrequency = new Map<string, number>();

    for (const word of words) {
      if (word.length > 1 && !stopWords.has(word)) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    }

    // 按频率排序
    const sortedWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);

    return sortedWords;
  }

  /**
   * 提取关键点
   * @param content 文档内容
   * @returns 关键点列表
   */
  private extractKeyPoints(content: string): string[] {
    const keyPoints: string[] = [];

    // 简化的关键点提取
    // 实际应用中应该使用更智能的算法

    const sentences = this.splitIntoSentences(content);

    // 查找包含关键词的句子
    const keywords = this.extractKeywords(content);
    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.includes(keyword) && sentence.length > 20 && sentence.length < 150) {
          keyPoints.push(sentence);
          break;
        }
      }
    }

    // 去重并限制数量
    return Array.from(new Set(keyPoints)).slice(0, 7);
  }

  /**
   * 分句
   * @param content 文档内容
   * @returns 句子列表
   */
  private splitIntoSentences(content: string): string[] {
    // 简化的分句
    // 实际应用中应该使用更智能的分句算法

    return content
      .split(/[。！？\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * 计算置信度
   * @param summary 摘要
   * @param content 原文
   * @returns 置信度分数（0-1）
   */
  private calculateConfidence(summary: string, content: string): number {
    // 简化的置信度计算
    // 实际应用中应该使用更复杂的算法

    const keywords = this.extractKeywords(content);
    const keywordCount = keywords.filter((keyword) => summary.includes(keyword)).length;

    const confidence = Math.min(keywordCount / keywords.length, 1.0);

    return confidence;
  }

  /**
   * 获取摘要配置模板
   * @param type 摘要类型
   * @returns 摘要配置
   */
  getConfigTemplate(type: SummaryType): SummaryConfig {
    const templates: Record<SummaryType, SummaryConfig> = {
      [SummaryType.SHORT]: {
        type: SummaryType.SHORT,
        strategy: SummaryStrategy.EXTRACTIVE,
        maxLength: 200,
        includeKeywords: false,
        includeKeyPoints: false,
      },
      [SummaryType.MEDIUM]: {
        type: SummaryType.MEDIUM,
        strategy: SummaryStrategy.HYBRID,
        maxLength: 500,
        includeKeywords: true,
        includeKeyPoints: false,
      },
      [SummaryType.DETAILED]: {
        type: SummaryType.DETAILED,
        strategy: SummaryStrategy.ABSTRACTIVE,
        maxLength: 1000,
        includeKeywords: true,
        includeKeyPoints: true,
      },
      [SummaryType.KEY_POINTS]: {
        type: SummaryType.KEY_POINTS,
        strategy: SummaryStrategy.EXTRACTIVE,
        maxLength: 800,
        includeKeywords: true,
        includeKeyPoints: true,
      },
      [SummaryType.EXECUTIVE]: {
        type: SummaryType.EXECUTIVE,
        strategy: SummaryStrategy.HYBRID,
        maxLength: 1200,
        includeKeywords: true,
        includeKeyPoints: true,
      },
    };

    return templates[type];
  }
}

// 创建文档摘要服务实例
export const documentSummaryService = new DocumentSummaryService();
