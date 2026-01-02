/**
 * @file 质量报告仓库
 * @description 提供质量报告数据的持久化存储和查询
 * @module repositories/quality-report.repository
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { QualityReport } from './document.types';
import { Logger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class QualityReportRepository {
  private logger: Logger;
  private dataDir: string;
  private reportsDir: string;

  constructor(dataDir: string = '/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-数据') {
    this.logger = new Logger('QualityReportRepository');
    this.dataDir = dataDir;
    this.reportsDir = path.join(dataDir, 'quality-reports');
  }

  /**
   * 初始化仓库
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing quality report repository');

      // 确保报告目录存在
      await fs.mkdir(this.reportsDir, { recursive: true });

      this.logger.info('Quality report repository initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize quality report repository', { error });
      throw error;
    }
  }

  /**
   * 保存质量报告
   * @param report 质量报告
   */
  async save(report: QualityReport): Promise<void> {
    try {
      this.logger.info('Saving quality report', { reportId: report.id, date: report.generatedAt });

      // 确保目录存在
      await fs.mkdir(this.reportsDir, { recursive: true });

      // 保存到文件
      const dateStr = report.generatedAt.toISOString().split('T')[0];
      const reportFile = path.join(this.reportsDir, `${dateStr}.json`);
      const data = JSON.stringify(report, null, 2);
      await fs.writeFile(reportFile, data, 'utf-8');

      this.logger.info('Quality report saved successfully', { reportId: report.id });
    } catch (error) {
      this.logger.error('Failed to save quality report', { reportId: report.id, error });
      throw error;
    }
  }

  /**
   * 根据日期获取质量报告
   * @param date 日期
   * @returns 质量报告
   */
  async getByDate(date: string): Promise<QualityReport | null> {
    try {
      this.logger.info('Getting quality report by date', { date });

      const reportFile = path.join(this.reportsDir, `${date}.json`);

      // 检查文件是否存在
      try {
        await fs.access(reportFile);
      } catch {
        return null;
      }

      // 读取文件
      const data = await fs.readFile(reportFile, 'utf-8');
      const report = JSON.parse(data) as QualityReport;

      this.logger.info('Quality report retrieved successfully', { reportId: report.id });
      return report;
    } catch (error) {
      this.logger.error('Failed to get quality report by date', { date, error });
      throw error;
    }
  }

  /**
   * 获取最新的质量报告
   * @returns 质量报告
   */
  async getLatest(): Promise<QualityReport | null> {
    try {
      this.logger.info('Getting latest quality report');

      // 获取所有报告文件
      const files = await fs.readdir(this.reportsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      if (jsonFiles.length === 0) {
        return null;
      }

      // 按日期排序，获取最新的
      jsonFiles.sort().reverse();
      const latestFile = jsonFiles[0];

      // 读取文件
      const reportFile = path.join(this.reportsDir, latestFile);
      const data = await fs.readFile(reportFile, 'utf-8');
      const report = JSON.parse(data) as QualityReport;

      this.logger.info('Latest quality report retrieved successfully', { reportId: report.id });
      return report;
    } catch (error) {
      this.logger.error('Failed to get latest quality report', { error });
      throw error;
    }
  }

  /**
   * 获取最近的质量报告
   * @param days 天数
   * @returns 质量报告列表
   */
  async getRecent(days: number = 30): Promise<QualityReport[]> {
    try {
      this.logger.info('Getting recent quality reports', { days });

      // 获取所有报告文件
      const files = await fs.readdir(this.reportsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      // 计算截止日期
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // 过滤并排序
      const reports: QualityReport[] = [];
      for (const file of jsonFiles) {
        const dateStr = file.replace('.json', '');
        const fileDate = new Date(dateStr);

        if (fileDate >= cutoffDate) {
          const reportFile = path.join(this.reportsDir, file);
          const data = await fs.readFile(reportFile, 'utf-8');
          const report = JSON.parse(data) as QualityReport;
          reports.push(report);
        }
      }

      // 按日期排序
      reports.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

      this.logger.info('Recent quality reports retrieved successfully', { count: reports.length });
      return reports;
    } catch (error) {
      this.logger.error('Failed to get recent quality reports', { days, error });
      throw error;
    }
  }

  /**
   * 根据文档ID获取质量报告
   * @param documentId 文档ID
   * @returns 质量报告列表
   */
  async getByDocumentId(documentId: string): Promise<QualityReport[]> {
    try {
      this.logger.info('Getting quality reports by document ID', { documentId });

      // 获取所有报告文件
      const files = await fs.readdir(this.reportsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      // 读取所有报告并过滤
      const reports: QualityReport[] = [];
      for (const file of jsonFiles) {
        const reportFile = path.join(this.reportsDir, file);
        const data = await fs.readFile(reportFile, 'utf-8');
        const report = JSON.parse(data) as QualityReport;
        
        if (report.documentId === documentId) {
          reports.push(report);
        }
      }

      // 按日期排序
      reports.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

      this.logger.info('Quality reports by document ID retrieved successfully', { documentId, count: reports.length });
      return reports;
    } catch (error) {
      this.logger.error('Failed to get quality reports by document ID', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取所有质量报告
   * @returns 质量报告列表
   */
  async getAll(): Promise<QualityReport[]> {
    try {
      this.logger.info('Getting all quality reports');

      // 获取所有报告文件
      const files = await fs.readdir(this.reportsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      // 读取所有报告
      const reports: QualityReport[] = [];
      for (const file of jsonFiles) {
        const reportFile = path.join(this.reportsDir, file);
        const data = await fs.readFile(reportFile, 'utf-8');
        const report = JSON.parse(data) as QualityReport;
        reports.push(report);
      }

      // 按日期排序
      reports.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

      this.logger.info('All quality reports retrieved successfully', { count: reports.length });
      return reports;
    } catch (error) {
      this.logger.error('Failed to get all quality reports', { error });
      throw error;
    }
  }

  /**
   * 根据日期范围获取质量报告
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 质量报告列表
   */
  async getByDateRange(startDate: string, endDate: string): Promise<QualityReport[]> {
    try {
      this.logger.info('Getting quality reports by date range', { startDate, endDate });

      // 获取所有报告文件
      const files = await fs.readdir(this.reportsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      // 过滤日期范围
      const reports: QualityReport[] = [];
      for (const file of jsonFiles) {
        const dateStr = file.replace('.json', '');

        if (dateStr >= startDate && dateStr <= endDate) {
          const reportFile = path.join(this.reportsDir, file);
          const data = await fs.readFile(reportFile, 'utf-8');
          const report = JSON.parse(data) as QualityReport;
          reports.push(report);
        }
      }

      // 按日期排序
      reports.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

      this.logger.info('Quality reports retrieved successfully', { count: reports.length });
      return reports;
    } catch (error) {
      this.logger.error('Failed to get quality reports by date range', { startDate, endDate, error });
      throw error;
    }
  }

  /**
   * 删除质量报告
   * @param date 日期
   */
  async delete(date: string): Promise<void> {
    try {
      this.logger.info('Deleting quality report', { date });

      const reportFile = path.join(this.reportsDir, `${date}.json`);

      // 检查文件是否存在
      try {
        await fs.access(reportFile);
      } catch {
        return;
      }

      // 删除文件
      await fs.unlink(reportFile);

      this.logger.info('Quality report deleted successfully', { date });
    } catch (error) {
      this.logger.error('Failed to delete quality report', { date, error });
      throw error;
    }
  }

  /**
   * 获取质量报告统计
   * @returns 统计数据
   */
  async getStatistics(): Promise<{
    totalReports: number;
    dateRange: { start: string; end: string };
    avgScore: number;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      this.logger.info('Getting quality report statistics');

      const reports = await this.getAll();

      if (reports.length === 0) {
        return {
          totalReports: 0,
          dateRange: { start: '', end: '' },
          avgScore: 0,
          trend: 'stable',
        };
      }

      const totalReports = reports.length;
      const dateRange = {
        start: reports[0].generatedAt.toISOString().split('T')[0],
        end: reports[reports.length - 1].generatedAt.toISOString().split('T')[0],
      };

      // 计算平均分数
      const avgScore = reports.reduce((sum, report) => sum + report.overallScore, 0) / reports.length;

      // 计算趋势
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (reports.length >= 2) {
        const recentAvg = reports.slice(-5).reduce((sum, r) => sum + r.overallScore, 0) / Math.min(5, reports.length);
        const olderAvg = reports.slice(0, -5).reduce((sum, r) => sum + r.overallScore, 0) / Math.max(1, reports.length - 5);

        if (recentAvg > olderAvg + 2) {
          trend = 'improving';
        } else if (recentAvg < olderAvg - 2) {
          trend = 'declining';
        }
      }

      return {
        totalReports,
        dateRange,
        avgScore,
        trend,
      };
    } catch (error) {
      this.logger.error('Failed to get quality report statistics', { error });
      throw error;
    }
  }
}
