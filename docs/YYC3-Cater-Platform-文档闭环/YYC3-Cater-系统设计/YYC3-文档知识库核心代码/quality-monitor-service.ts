/**
 * @file 质量监控服务
 * @description 提供文档质量的持续监控、趋势分析、预警机制等功能
 * @module services/quality-monitor-service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Document, QualityMetrics, QualityReport, QualityLevel, QualityMonitoringReport } from './document.types';
import { DocumentRepository } from './document.repository';
import { QualityReportRepository } from './quality-report.repository';
import { Logger } from './logger';
import { EventEmitter } from 'events';

export interface QualityTrend {
  date: string;
  avgScore: number;
  documentCount: number;
  categoryScores: Record<string, number>;
}

export interface QualityAlert {
  id: string;
  type: 'degradation' | 'threshold' | 'outlier' | 'stagnation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  documentId?: string;
  message: string;
  metrics: Partial<QualityMetrics>;
  timestamp: Date;
  acknowledged: boolean;
}

export interface MonitoringConfig {
  checkInterval: number; // 检查间隔（分钟）
  qualityThreshold: number; // 质量阈值
  degradationThreshold: number; // 质量下降阈值
  outlierThreshold: number; // 异常值阈值
  stagnationDays: number; // 停滞天数
}

export class QualityMonitorService extends EventEmitter {
  private documentRepository: DocumentRepository;
  private qualityReportRepository: QualityReportRepository;
  private logger: Logger;
  private config: MonitoringConfig;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config?: Partial<MonitoringConfig>) {
    super();
    this.documentRepository = new DocumentRepository();
    this.qualityReportRepository = new QualityReportRepository();
    this.logger = new Logger('QualityMonitorService');
    this.config = {
      checkInterval: 60, // 默认每小时检查一次
      qualityThreshold: 60,
      degradationThreshold: 10,
      outlierThreshold: 20,
      stagnationDays: 30,
      ...config,
    };
  }

  /**
   * 获取配置
   * @returns 监控配置
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    this.logger.info('Monitoring config updated', { config: this.config });
  }

  /**
   * 获取统计信息
   * @returns 统计数据
   */
  async getStatistics(): Promise<{
    totalDocuments: number;
    averageScore: number;
    scoreDistribution: Record<QualityLevel, number>;
    categoryScores: Record<string, { count: number; avgScore: number }>;
    trend: QualityTrend[];
  }> {
    return await this.getQualityStatistics();
  }

  /**
   * 评估文档
   * @param documentId 文档ID
   * @returns 质量报告
   */
  async assessDocument(documentId: string): Promise<QualityReport> {
    try {
      this.logger.info('Assessing document', { documentId });

      const document = await this.documentRepository.getById(documentId);
      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // 执行质量检查
      const alerts = await this.checkDocumentQuality(document);

      // 生成质量报告
      const report = await this.generateQualityReport([document]);

      // 发送警报
      alerts.forEach((alert) => {
        this.emit('quality-alert', alert);
      });

      this.logger.info('Document assessed', { documentId, alertCount: alerts.length });
      return report;
    } catch (error) {
      this.logger.error('Failed to assess document', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取文档质量报告
   * @param documentId 文档ID
   * @param limit 数量限制
   * @returns 报告列表
   */
  async getDocumentReports(documentId: string, limit?: number): Promise<QualityReport[]> {
    try {
      this.logger.info('Getting document reports', { documentId, limit });

      const reports = await this.qualityReportRepository.getByDocumentId(documentId);
      
      // 如果指定了limit，则限制返回数量
      if (limit && limit > 0) {
        return reports.slice(0, limit);
      }
      
      return reports;
    } catch (error) {
      this.logger.error('Failed to get document reports', { documentId, limit, error });
      throw error;
    }
  }

  /**
   * 获取状态
   * @returns 监控状态
   */
  getStatus(): {
    isMonitoring: boolean;
    config: MonitoringConfig;
    lastCheck?: Date;
  } {
    return {
      isMonitoring: !!this.monitoringInterval,
      config: this.getConfig(),
      lastCheck: undefined, // 可以添加最后检查时间记录
    };
  }

  /**
   * 批量确认警报
   * @param alertIds 警报ID列表
   */
  async bulkAcknowledgeAlerts(alertIds: string[]): Promise<void> {
    try {
      this.logger.info('Bulk acknowledging alerts', { alertIds });

      for (const alertId of alertIds) {
        await this.acknowledgeAlert(alertId);
      }

      this.logger.info('Bulk acknowledge completed', { count: alertIds.length });
    } catch (error) {
      this.logger.error('Failed to bulk acknowledge alerts', { alertIds, error });
      throw error;
    }
  }

  /**
   * 启动质量监控
   */
  async startMonitoring(): Promise<void> {
    try {
      this.logger.info('Starting quality monitoring', { config: this.config });

      // 立即执行一次检查
      await this.performQualityCheck();

      // 设置定时检查
      this.monitoringInterval = setInterval(async () => {
        await this.performQualityCheck();
      }, this.config.checkInterval * 60 * 1000);

      this.logger.info('Quality monitoring started successfully');
    } catch (error) {
      this.logger.error('Failed to start quality monitoring', { error });
      throw error;
    }
  }

  /**
   * 停止质量监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      this.logger.info('Quality monitoring stopped');
    }
  }

  /**
   * 执行质量检查
   */
  private async performQualityCheck(): Promise<void> {
    try {
      this.logger.info('Performing quality check');

      // 获取所有文档
      const documents = await this.documentRepository.getAll();

      // 检查每个文档的质量
      const alerts: QualityAlert[] = [];

      for (const document of documents) {
        const documentAlerts = await this.checkDocumentQuality(document);
        alerts.push(...documentAlerts);
      }

      // 检查整体质量趋势
      const trendAlerts = await this.checkQualityTrend(documents);
      alerts.push(...trendAlerts);

      // 发送警报
      alerts.forEach((alert) => {
        this.emit('quality-alert', alert);
      });

      // 保存监控报告
      await this.saveMonitoringReport(documents, alerts);

      this.logger.info('Quality check completed', { alertCount: alerts.length });
    } catch (error) {
      this.logger.error('Failed to perform quality check', { error });
      throw error;
    }
  }

  /**
   * 检查单个文档质量
   * @param document 文档
   * @returns 警报列表
   */
  public async checkDocumentQuality(document: Document): Promise<QualityAlert[]> {
    const alerts: QualityAlert[] = [];

    // 检查质量分数是否低于阈值
    if (document.qualityScore < this.config.qualityThreshold) {
      alerts.push({
        id: `alert-${Date.now()}-${document.id}`,
        type: 'threshold',
        severity: this.getSeverity(document.qualityScore),
        documentId: document.id,
        message: `文档质量分数 ${document.qualityScore} 低于阈值 ${this.config.qualityThreshold}`,
        metrics: document.qualityMetrics,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    // 检查质量是否下降
    const previousVersion = await this.getPreviousVersion(document.id);
    if (previousVersion) {
      const scoreDrop = previousVersion.qualityScore - document.qualityScore;
      if (scoreDrop > this.config.degradationThreshold) {
        alerts.push({
          id: `alert-${Date.now()}-${document.id}`,
          type: 'degradation',
          severity: 'medium',
          documentId: document.id,
          message: `文档质量分数下降 ${scoreDrop} 分（从 ${previousVersion.qualityScore} 到 ${document.qualityScore}）`,
          metrics: document.qualityMetrics,
          timestamp: new Date(),
          acknowledged: false,
        });
      }
    }

    // 检查是否为异常值
    const avgScore = await this.getAverageQualityScore();
    if (Math.abs(document.qualityScore - avgScore) > this.config.outlierThreshold) {
      alerts.push({
        id: `alert-${Date.now()}-${document.id}`,
        type: 'outlier',
        severity: 'low',
        documentId: document.id,
        message: `文档质量分数 ${document.qualityScore} 偏离平均值 ${avgScore.toFixed(2)} 超过 ${this.config.outlierThreshold}`,
        metrics: document.qualityMetrics,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    return alerts;
  }

  /**
   * 检查质量趋势
   * @param documents 文档列表
   * @returns 警报列表
   */
  private async checkQualityTrend(documents: Document[]): Promise<QualityAlert[]> {
    const alerts: QualityAlert[] = [];

    // 获取历史趋势数据
    const trends = await this.getQualityTrend(30); // 最近30天

    if (trends.length < 2) {
      return alerts;
    }

    // 检查整体质量是否下降
    const recentScore = trends[trends.length - 1].avgScore;
    const previousScore = trends[trends.length - 2].avgScore;
    const scoreDrop = previousScore - recentScore;

    if (scoreDrop > this.config.degradationThreshold) {
      alerts.push({
        id: `alert-${Date.now()}-trend`,
        type: 'degradation',
        severity: 'high',
        message: `整体质量分数下降 ${scoreDrop.toFixed(2)} 分（从 ${previousScore.toFixed(2)} 到 ${recentScore.toFixed(2)}）`,
        metrics: {},
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    // 检查质量停滞
    const stagnationDetected = this.detectStagnation(trends);
    if (stagnationDetected) {
      alerts.push({
        id: `alert-${Date.now()}-stagnation`,
        type: 'stagnation',
        severity: 'medium',
        message: `整体质量在过去 ${this.config.stagnationDays} 天内没有显著改善`,
        metrics: {},
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    return alerts;
  }

  /**
   * 获取质量趋势
   * @param days 天数
   * @param category 分类
   * @returns 趋势数据
   */
  async getQualityTrends(days: number = 30, category?: string): Promise<QualityTrend[]> {
    try {
      this.logger.info('Getting quality trends', { days, category });

      const reports = await this.qualityReportRepository.getRecent(days) as QualityMonitoringReport[];
      const trends: QualityTrend[] = [];

      reports.forEach((report) => {
        const trend: QualityTrend = {
          date: report.date,
          avgScore: report.averageScore,
          documentCount: report.documentCount,
          categoryScores: report.categoryScores,
        };

        // 如果指定了分类，只返回该分类的分数
        if (category && report.categoryScores[category]) {
          trend.avgScore = report.categoryScores[category];
          trend.categoryScores = { [category]: report.categoryScores[category] };
        }

        trends.push(trend);
      });

      return trends;
    } catch (error) {
      this.logger.error('Failed to get quality trends', { days, category, error });
      throw error;
    }
  }

  /**
   * 获取质量趋势
   * @param days 天数
   * @returns 趋势数据
   */
  async getQualityTrend(days: number = 30): Promise<QualityTrend[]> {
    try {
      this.logger.info('Getting quality trend', { days });

      const reports = await this.qualityReportRepository.getRecent(days) as QualityMonitoringReport[];
      const trends: QualityTrend[] = [];

      reports.forEach((report) => {
        trends.push({
          date: report.date,
          avgScore: report.averageScore,
          documentCount: report.documentCount,
          categoryScores: report.categoryScores,
        });
      });

      return trends;
    } catch (error) {
      this.logger.error('Failed to get quality trend', { days, error });
      throw error;
    }
  }

  /**
   * 获取质量统计
   * @returns 统计数据
   */
  async getQualityStatistics(): Promise<{
    totalDocuments: number;
    averageScore: number;
    scoreDistribution: Record<QualityLevel, number>;
    categoryScores: Record<string, { count: number; avgScore: number }>;
    trend: QualityTrend[];
  }> {
    try {
      this.logger.info('Getting quality statistics');

      const documents = await this.documentRepository.getAll();
      const totalDocuments = documents.length;
      const averageScore = documents.reduce((sum, doc) => sum + doc.qualityScore, 0) / totalDocuments;

      // 分数分布
      const scoreDistribution: Record<QualityLevel, number> = {
        excellent: 0,
        good: 0,
        acceptable: 0,
        needsImprovement: 0,
        poor: 0,
      };

      documents.forEach((doc) => {
        const level = this.getQualityLevel(doc.qualityScore);
        scoreDistribution[level]++;
      });

      // 分类统计
      const categoryMap = new Map<string, { count: number; totalScore: number }>();
      documents.forEach((doc) => {
        const category = doc.category;
        const existing = categoryMap.get(category) || { count: 0, totalScore: 0 };
        existing.count++;
        existing.totalScore += doc.qualityScore;
        categoryMap.set(category, existing);
      });

      const categoryScores: Record<string, { count: number; avgScore: number }> = {};
      categoryMap.forEach((value, key) => {
        categoryScores[key] = {
          count: value.count,
          avgScore: value.totalScore / value.count,
        };
      });

      // 趋势数据
      const trend = await this.getQualityTrend(30);

      return {
        totalDocuments,
        averageScore,
        scoreDistribution,
        categoryScores,
        trend,
      };
    } catch (error) {
      this.logger.error('Failed to get quality statistics', { error });
      throw error;
    }
  }

  /**
   * 获取质量报告
   * @param date 日期
   * @returns 质量报告
   */
  async getQualityReport(date?: string): Promise<QualityReport | null> {
    try {
      if (date) {
        return await this.qualityReportRepository.getByDate(date);
      } else {
        return await this.qualityReportRepository.getLatest();
      }
    } catch (error) {
      this.logger.error('Failed to get quality report', { date, error });
      throw error;
    }
  }

  /**
   * 生成质量报告
   * @param documents 文档列表
   * @returns 质量报告
   */
  async generateQualityReport(documents?: Document[]): Promise<QualityReport> {
    try {
      this.logger.info('Generating quality report');

      const docs = documents || (await this.documentRepository.getAll());

      // 计算平均分数
      const averageScore = docs.reduce((sum, doc) => sum + doc.qualityScore, 0) / docs.length;

      // 计算分类分数
      const categoryMap = new Map<string, { count: number; totalScore: number }>();
      docs.forEach((doc) => {
        const category = doc.category;
        const existing = categoryMap.get(category) || { count: 0, totalScore: 0 };
        existing.count++;
        existing.totalScore += doc.qualityScore;
        categoryMap.set(category, existing);
      });

      const categoryScores: Record<string, number> = {};
      categoryMap.forEach((value, key) => {
        categoryScores[key] = value.totalScore / value.count;
      });

      // 计算各维度分数
      const dimensionScores: Record<string, number> = {
        completeness: 0,
        accuracy: 0,
        clarity: 0,
        consistency: 0,
        maintainability: 0,
      };

      docs.forEach((doc) => {
        dimensionScores.completeness += doc.qualityMetrics.contentCompleteness;
        dimensionScores.accuracy += doc.qualityMetrics.technicalAccuracy;
        dimensionScores.clarity += doc.qualityMetrics.readability;
        dimensionScores.consistency += doc.qualityMetrics.structureNormalization;
        dimensionScores.maintainability += doc.qualityMetrics.practicality;
      });

      Object.keys(dimensionScores).forEach((dimension) => {
        dimensionScores[dimension] /= docs.length;
      });

      // 识别问题文档
      const problemDocuments = docs
        .filter((doc) => doc.qualityScore < this.config.qualityThreshold)
        .map((doc) => ({
          documentId: doc.id,
          title: doc.title,
          qualityScore: doc.qualityScore,
          issues: this.identifyIssues(doc),
        }));

      // 创建报告
      const report: QualityMonitoringReport = {
        id: `report-${Date.now()}`,
        documentId: '',
        version: '',
        overallScore: averageScore,
        metrics: {
          contentCompleteness: dimensionScores.completeness,
          structureNormalization: dimensionScores.consistency,
          technicalAccuracy: dimensionScores.accuracy,
          readability: dimensionScores.clarity,
          practicality: dimensionScores.maintainability,
        },
        issues: [],
        suggestions: [],
        generatedAt: new Date(),
        generatedBy: 'system',
        date: new Date().toISOString().split('T')[0],
        documentCount: docs.length,
        averageScore,
        categoryScores,
        dimensionScores,
        scoreDistribution: this.calculateScoreDistribution(docs),
        problemDocuments,
        recommendations: this.generateRecommendations(docs),
        createdAt: new Date(),
      };

      // 保存报告
      await this.qualityReportRepository.save(report);

      this.logger.info('Quality report generated', { reportId: report.id });
      return report;
    } catch (error) {
      this.logger.error('Failed to generate quality report', { error });
      throw error;
    }
  }

  /**
   * 生成报告（通用方法）
   * @param options 报告选项
   * @returns 报告数据
   */
  async generateReport(options: {
    type: 'quality' | 'trend' | 'alert' | 'summary';
    startDate?: Date;
    endDate?: Date;
    category?: string;
    documentId?: string;
  }): Promise<any> {
    try {
      this.logger.info('Generating report', { options });

      switch (options.type) {
        case 'quality':
          return await this.generateQualityReport();
        case 'trend':
          const days = options.startDate && options.endDate
            ? Math.ceil((options.endDate.getTime() - options.startDate.getTime()) / (1000 * 60 * 60 * 24))
            : 30;
          return await this.getQualityTrends(days, options.category);
        case 'alert':
          return await this.getAlerts({
            type: undefined,
            severity: undefined,
            acknowledged: false,
            limit: 100,
          });
        case 'summary':
          return await this.getQualityStatistics();
        default:
          throw new Error(`不支持的报告类型: ${options.type}`);
      }
    } catch (error) {
      this.logger.error('Failed to generate report', { options, error });
      throw error;
    }
  }

  /**
   * 导出质量报告
   * @param options 导出选项
   * @returns 导出数据
   */
  async exportQualityReport(options: {
    format: 'json' | 'csv' | 'excel';
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }): Promise<string> {
    try {
      this.logger.info('Exporting quality report', { options });

      // 获取数据
      const statistics = await this.getQualityStatistics();
      const trends = await this.getQualityTrends(
        options.startDate && options.endDate
          ? Math.ceil((options.endDate.getTime() - options.startDate.getTime()) / (1000 * 60 * 60 * 24))
          : 30,
        options.category
      );
      const alerts = await this.getAlerts({ limit: 100 });

      // 根据格式导出
      switch (options.format) {
        case 'json':
          return JSON.stringify({
            statistics,
            trends,
            alerts,
            exportDate: new Date().toISOString(),
          }, null, 2);

        case 'csv':
          return this.generateCSVReport(statistics, trends, alerts);

        case 'excel':
          // 简化实现，返回CSV格式
          // 实际项目中应使用exceljs等库生成Excel文件
          return this.generateCSVReport(statistics, trends, alerts);

        default:
          throw new Error(`不支持的导出格式: ${options.format}`);
      }
    } catch (error) {
      this.logger.error('Failed to export quality report', { options, error });
      throw error;
    }
  }

  /**
   * 生成CSV格式报告
   * @param statistics 统计数据
   * @param trends 趋势数据
   * @param alerts 警报数据
   * @returns CSV字符串
   */
  private generateCSVReport(
    statistics: any,
    trends: QualityTrend[],
    alerts: QualityAlert[]
  ): string {
    const lines: string[] = [];

    // 添加统计信息
    lines.push('=== 质量统计 ===');
    lines.push(`文档总数,${statistics.totalDocuments}`);
    lines.push(`平均分数,${statistics.averageScore.toFixed(2)}`);
    lines.push('');

    // 添加分数分布
    lines.push('=== 分数分布 ===');
    lines.push('等级,数量');
    Object.entries(statistics.scoreDistribution).forEach(([level, count]) => {
      lines.push(`${level},${count}`);
    });
    lines.push('');

    // 添加分类统计
    lines.push('=== 分类统计 ===');
    lines.push('分类,文档数,平均分数');
    Object.entries(statistics.categoryScores).forEach(([category, data]: [string, any]) => {
      lines.push(`${category},${data.count},${data.avgScore.toFixed(2)}`);
    });
    lines.push('');

    // 添加趋势数据
    lines.push('=== 质量趋势 ===');
    lines.push('日期,平均分数,文档数');
    trends.forEach((trend) => {
      lines.push(`${trend.date},${trend.avgScore.toFixed(2)},${trend.documentCount}`);
    });
    lines.push('');

    // 添加警报信息
    lines.push('=== 质量警报 ===');
    lines.push('ID,类型,严重程度,文档ID,消息,时间,已确认');
    alerts.forEach((alert) => {
      lines.push(
        `${alert.id},${alert.type},${alert.severity},${alert.documentId || 'N/A'},${alert.message},${alert.timestamp.toISOString()},${alert.acknowledged}`
      );
    });

    return lines.join('\n');
  }

  /**
   * 获取警报列表
   * @param params 查询参数
   * @returns 警报列表
   */
  async getAlerts(params: {
    type?: string;
    severity?: string;
    acknowledged?: boolean;
    limit?: number;
  } = {}): Promise<QualityAlert[]> {
    try {
      this.logger.info('Getting alerts', { params });

      // 从存储中获取警报（简化实现）
      const allAlerts: QualityAlert[] = [];

      // 过滤
      let filteredAlerts = allAlerts;

      if (params.type) {
        filteredAlerts = filteredAlerts.filter((a) => a.type === params.type);
      }
      if (params.severity) {
        filteredAlerts = filteredAlerts.filter((a) => a.severity === params.severity);
      }
      if (params.acknowledged !== undefined) {
        filteredAlerts = filteredAlerts.filter((a) => a.acknowledged === params.acknowledged);
      }

      // 排序和限制
      filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return filteredAlerts.slice(0, params.limit || 50);
    } catch (error) {
      this.logger.error('Failed to get alerts', { params, error });
      throw error;
    }
  }

  /**
   * 确认警报
   * @param alertId 警报ID
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      this.logger.info('Acknowledging alert', { alertId });

      // 更新警报状态（简化实现）
      this.emit('alert-acknowledged', { alertId });
    } catch (error) {
      this.logger.error('Failed to acknowledge alert', { alertId, error });
      throw error;
    }
  }

  /**
   * 获取质量等级
   * @param score 质量分数
   * @returns 质量等级
   */
  private getQualityLevel(score: number): QualityLevel {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'acceptable';
    if (score >= 40) return 'needsImprovement';
    return 'poor';
  }

  /**
   * 获取严重程度
   * @param score 质量分数
   * @returns 严重程度
   */
  private getSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 40) return 'critical';
    if (score < 50) return 'high';
    if (score < 60) return 'medium';
    return 'low';
  }

  /**
   * 获取上一个版本
   * @param documentId 文档ID
   * @returns 上一个版本的文档
   */
  private async getPreviousVersion(documentId: string): Promise<Document | null> {
    // 简化实现，实际应从版本管理服务获取
    return null;
  }

  /**
   * 获取平均质量分数
   * @returns 平均分数
   */
  private async getAverageQualityScore(): Promise<number> {
    const documents = await this.documentRepository.getAll();
    if (documents.length === 0) return 0;
    return documents.reduce((sum, doc) => sum + doc.qualityScore, 0) / documents.length;
  }

  /**
   * 检测停滞
   * @param trends 趋势数据
   * @returns 是否停滞
   */
  private detectStagnation(trends: QualityTrend[]): boolean {
    if (trends.length < 2) return false;

    const recentScores = trends.slice(-this.config.stagnationDays).map((t) => t.avgScore);
    const avgScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

    // 检查所有分数是否在平均值的±5%范围内
    return recentScores.every((score) => Math.abs(score - avgScore) / avgScore < 0.05);
  }

  /**
   * 识别问题
   * @param document 文档
   * @returns 问题列表
   */
  private identifyIssues(document: Document): string[] {
    const issues: string[] = [];

    if (document.qualityMetrics.contentCompleteness < 60) {
      issues.push('内容不完整');
    }
    if (document.qualityMetrics.technicalAccuracy < 60) {
      issues.push('准确性不足');
    }
    if (document.qualityMetrics.readability < 60) {
      issues.push('表述不清晰');
    }
    if (document.qualityMetrics.structureNormalization < 60) {
      issues.push('一致性不足');
    }
    if (document.qualityMetrics.practicality < 60) {
      issues.push('可维护性不足');
    }

    return issues;
  }

  /**
   * 计算分数分布
   * @param documents 文档列表
   * @returns 分数分布
   */
  private calculateScoreDistribution(documents: Document[]): Record<QualityLevel, number> {
    const distribution: Record<QualityLevel, number> = {
      excellent: 0,
      good: 0,
      acceptable: 0,
      needsImprovement: 0,
      poor: 0,
    };

    documents.forEach((doc) => {
      const level = this.getQualityLevel(doc.qualityScore);
      distribution[level]++;
    });

    return distribution;
  }

  /**
   * 生成建议
   * @param documents 文档列表
   * @returns 建议列表
   */
  private generateRecommendations(documents: Document[]): string[] {
    const recommendations: string[] = [];

    const avgScore = documents.reduce((sum, doc) => sum + doc.qualityScore, 0) / documents.length;

    if (avgScore < 60) {
      recommendations.push('整体质量偏低，建议加强文档审核机制');
    }

    const lowCompletenessDocs = documents.filter((doc) => doc.qualityMetrics.contentCompleteness < 60).length;
    if (lowCompletenessDocs > documents.length * 0.2) {
      recommendations.push('大量文档内容不完整，建议补充缺失内容');
    }

    const lowClarityDocs = documents.filter((doc) => doc.qualityMetrics.readability < 60).length;
    if (lowClarityDocs > documents.length * 0.2) {
      recommendations.push('大量文档表述不清晰，建议优化语言表达');
    }

    return recommendations;
  }

  /**
   * 保存监控报告
   * @param documents 文档列表
   * @param alerts 警报列表
   */
  private async saveMonitoringReport(documents: Document[], alerts: QualityAlert[]): Promise<void> {
    try {
      // 生成并保存质量报告
      await this.generateQualityReport(documents);

      // 保存警报（简化实现）
      this.logger.info('Monitoring report saved', {
        documentCount: documents.length,
        alertCount: alerts.length,
      });
    } catch (error) {
      this.logger.error('Failed to save monitoring report', { error });
      throw error;
    }
  }
}
