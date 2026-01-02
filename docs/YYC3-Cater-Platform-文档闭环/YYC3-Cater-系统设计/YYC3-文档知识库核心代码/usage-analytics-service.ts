/**
 * @file 文档使用分析服务
 * @description 提供文档使用统计和分析功能
 * @module services/usage-analytics-service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { DocumentRepository } from './document.repository';
import { Logger } from './logger';

/**
 * 文档访问事件
 */
export interface DocumentAccessEvent {
  id: string;
  documentId: string;
  userId?: string;
  action: 'view' | 'edit' | 'download' | 'share' | 'comment' | 'search_hit';
  timestamp: Date;
  metadata?: {
    duration?: number;
    searchQuery?: string;
    referrer?: string;
    device?: string;
    location?: string;
  };
}

/**
 * 文档使用统计
 */
export interface DocumentUsageStats {
  documentId: string;
  totalViews: number;
  uniqueViewers: number;
  totalEdits: number;
  totalDownloads: number;
  totalShares: number;
  totalComments: number;
  searchHits: number;
  avgViewDuration: number;
  lastAccessedAt: Date;
  createdAt: Date;
}

/**
 * 用户使用统计
 */
export interface UserUsageStats {
  userId?: string;
  totalDocumentsViewed: number;
  totalDocumentsEdited: number;
  totalDocumentsDownloaded: number;
  totalSearches: number;
  totalComments: number;
  avgSessionDuration: number;
  lastActiveAt: Date;
}

/**
 * 系统使用统计
 */
export interface SystemUsageStats {
  totalDocuments: number;
  totalUsers: number;
  totalViews: number;
  totalEdits: number;
  totalDownloads: number;
  totalShares: number;
  totalComments: number;
  totalSearches: number;
  avgDailyActiveUsers: number;
  avgDailyDocumentViews: number;
  mostViewedDocuments: Array<{
    documentId: string;
    title: string;
    views: number;
  }>;
  mostActiveUsers: Array<{
    userId?: string;
    activities: number;
  }>;
  popularSearchQueries: Array<{
    query: string;
    count: number;
  }>;
}

/**
 * 使用趋势数据
 */
export interface UsageTrend {
  date: string;
  views: number;
  edits: number;
  downloads: number;
  searches: number;
  uniqueUsers: number;
}

/**
 * 文档使用分析服务
 */
export class UsageAnalyticsService {
  private documentRepository: DocumentRepository;
  private logger: Logger;
  private accessEvents: Map<string, DocumentAccessEvent[]> = new Map();
  private documentStats: Map<string, DocumentUsageStats> = new Map();
  private userStats: Map<string, UserUsageStats> = new Map();
  private searchQueries: Map<string, number> = new Map();

  constructor() {
    this.documentRepository = new DocumentRepository();
    this.logger = new Logger('UsageAnalyticsService');
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing usage analytics service');

      // 加载历史数据
      await this.loadHistoricalData();

      this.logger.info('Usage analytics service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize usage analytics service', { error });
      throw error;
    }
  }

  /**
   * 记录文档访问事件
   */
  async recordAccessEvent(event: Omit<DocumentAccessEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const accessEvent: DocumentAccessEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        ...event,
      };

      // 存储访问事件
      const events = this.accessEvents.get(event.documentId) || [];
      events.push(accessEvent);
      this.accessEvents.set(event.documentId, events);

      // 更新文档统计
      await this.updateDocumentStats(event);

      // 更新用户统计
      if (event.userId) {
        await this.updateUserStats(event);
      }

      // 记录搜索查询
      if (event.action === 'search_hit' && event.metadata?.searchQuery) {
        const query = event.metadata.searchQuery.toLowerCase();
        const count = this.searchQueries.get(query) || 0;
        this.searchQueries.set(query, count + 1);
      }

      this.logger.debug('Access event recorded', {
        documentId: event.documentId,
        action: event.action,
        userId: event.userId,
      });
    } catch (error) {
      this.logger.error('Failed to record access event', { error, event });
      throw error;
    }
  }

  /**
   * 获取文档使用统计
   */
  async getDocumentUsageStats(documentId: string): Promise<DocumentUsageStats | null> {
    try {
      const stats = this.documentStats.get(documentId);
      return stats || null;
    } catch (error) {
      this.logger.error('Failed to get document usage stats', { error, documentId });
      throw error;
    }
  }

  /**
   * 获取用户使用统计
   */
  async getUserUsageStats(userId?: string): Promise<UserUsageStats | null> {
    try {
      if (!userId) {
        return null;
      }

      const stats = this.userStats.get(userId);
      return stats || null;
    } catch (error) {
      this.logger.error('Failed to get user usage stats', { error, userId });
      throw error;
    }
  }

  /**
   * 获取系统使用统计
   */
  async getSystemUsageStats(): Promise<SystemUsageStats> {
    try {
      const documentIds = Array.from(this.documentStats.keys());
      const userIds = Array.from(this.userStats.keys());

      // 计算系统级统计
      const totalViews = Array.from(this.documentStats.values())
        .reduce((sum, stats) => sum + stats.totalViews, 0);

      const totalEdits = Array.from(this.documentStats.values())
        .reduce((sum, stats) => sum + stats.totalEdits, 0);

      const totalDownloads = Array.from(this.documentStats.values())
        .reduce((sum, stats) => sum + stats.totalDownloads, 0);

      const totalShares = Array.from(this.documentStats.values())
        .reduce((sum, stats) => sum + stats.totalShares, 0);

      const totalComments = Array.from(this.documentStats.values())
        .reduce((sum, stats) => sum + stats.totalComments, 0);

      const totalSearches = Array.from(this.searchQueries.values())
        .reduce((sum, count) => sum + count, 0);

      // 获取最受欢迎的文档
      const mostViewedDocuments = await this.getMostViewedDocuments(10);

      // 获取最活跃的用户
      const mostActiveUsers = await this.getMostActiveUsers(10);

      // 获取热门搜索查询
      const popularSearchQueries = Array.from(this.searchQueries.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalDocuments: documentIds.length,
        totalUsers: userIds.length,
        totalViews,
        totalEdits,
        totalDownloads,
        totalShares,
        totalComments,
        totalSearches,
        avgDailyActiveUsers: 0, // 需要计算
        avgDailyDocumentViews: 0, // 需要计算
        mostViewedDocuments,
        mostActiveUsers,
        popularSearchQueries,
      };
    } catch (error) {
      this.logger.error('Failed to get system usage stats', { error });
      throw error;
    }
  }

  /**
   * 获取使用趋势
   */
  async getUsageTrends(days: number = 30): Promise<UsageTrend[]> {
    try {
      const trends: UsageTrend[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // 统计该日期的使用数据
        let views = 0;
        let edits = 0;
        let downloads = 0;
        let searches = 0;
        const uniqueUsers = new Set<string>();

        for (const [docId, events] of this.accessEvents.entries()) {
          for (const event of events) {
            const eventDate = event.timestamp.toISOString().split('T')[0];
            if (eventDate === dateStr) {
              switch (event.action) {
                case 'view':
                  views++;
                  break;
                case 'edit':
                  edits++;
                  break;
                case 'download':
                  downloads++;
                  break;
                case 'search_hit':
                  searches++;
                  break;
              }
              if (event.userId) {
                uniqueUsers.add(event.userId);
              }
            }
          }
        }

        trends.push({
          date: dateStr,
          views,
          edits,
          downloads,
          searches,
          uniqueUsers: uniqueUsers.size,
        });
      }

      return trends;
    } catch (error) {
      this.logger.error('Failed to get usage trends', { error, days });
      throw error;
    }
  }

  /**
   * 获取文档访问历史
   */
  async getDocumentAccessHistory(
    documentId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<DocumentAccessEvent[]> {
    try {
      const events = this.accessEvents.get(documentId) || [];
      return events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(offset, offset + limit);
    } catch (error) {
      this.logger.error('Failed to get document access history', { error, documentId });
      throw error;
    }
  }

  /**
   * 获取用户访问历史
   */
  async getUserAccessHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<DocumentAccessEvent[]> {
    try {
      const userEvents: DocumentAccessEvent[] = [];

      for (const events of this.accessEvents.values()) {
        for (const event of events) {
          if (event.userId === userId) {
            userEvents.push(event);
          }
        }
      }

      return userEvents
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(offset, offset + limit);
    } catch (error) {
      this.logger.error('Failed to get user access history', { error, userId });
      throw error;
    }
  }

  /**
   * 导出使用报告
   */
  async exportUsageReport(options: {
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  }): Promise<string> {
    try {
      const { startDate, endDate, format = 'json' } = options;

      const stats = await this.getSystemUsageStats();
      const trends = await this.getUsageTrends(30);

      const report = {
        generatedAt: new Date().toISOString(),
        period: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString(),
        },
        statistics: stats,
        trends,
      };

      if (format === 'json') {
        return JSON.stringify(report, null, 2);
      } else {
        // CSV格式
        const headers = 'Date,Views,Edits,Downloads,Searches,UniqueUsers\n';
        const rows = trends.map(
          (t) => `${t.date},${t.views},${t.edits},${t.downloads},${t.searches},${t.uniqueUsers}`
        );
        return headers + rows.join('\n');
      }
    } catch (error) {
      this.logger.error('Failed to export usage report', { error, options });
      throw error;
    }
  }

  /**
   * 清理旧数据
   */
  async cleanupOldData(retentionDays: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      let cleanedCount = 0;

      for (const [docId, events] of this.accessEvents.entries()) {
        const filteredEvents = events.filter((event) => event.timestamp > cutoffDate);
        if (filteredEvents.length !== events.length) {
          this.accessEvents.set(docId, filteredEvents);
          cleanedCount += events.length - filteredEvents.length;
        }
      }

      this.logger.info('Old data cleaned up', { retentionDays, cleanedCount });
    } catch (error) {
      this.logger.error('Failed to cleanup old data', { error, retentionDays });
      throw error;
    }
  }

  /**
   * 更新文档统计
   */
  private async updateDocumentStats(event: Omit<DocumentAccessEvent, 'id' | 'timestamp'>): Promise<void> {
    let stats = this.documentStats.get(event.documentId);

    if (!stats) {
      // 创建新的文档统计
      const document = await this.documentRepository.findById(event.documentId);
      stats = {
        documentId: event.documentId,
        totalViews: 0,
        uniqueViewers: 0,
        totalEdits: 0,
        totalDownloads: 0,
        totalShares: 0,
        totalComments: 0,
        searchHits: 0,
        avgViewDuration: 0,
        lastAccessedAt: new Date(),
        createdAt: document?.createdAt || new Date(),
      };
      this.documentStats.set(event.documentId, stats);
    }

    // 更新统计
    switch (event.action) {
      case 'view':
        stats.totalViews++;
        if (event.userId) {
          // 检查是否是新的查看者
          const events = this.accessEvents.get(event.documentId) || [];
          const uniqueViewers = new Set(
            events.filter((e) => e.action === 'view').map((e) => e.userId)
          );
          stats.uniqueViewers = uniqueViewers.size;
        }
        break;
      case 'edit':
        stats.totalEdits++;
        break;
      case 'download':
        stats.totalDownloads++;
        break;
      case 'share':
        stats.totalShares++;
        break;
      case 'comment':
        stats.totalComments++;
        break;
      case 'search_hit':
        stats.searchHits++;
        break;
    }

    stats.lastAccessedAt = new Date();
  }

  /**
   * 更新用户统计
   */
  private async updateUserStats(event: Omit<DocumentAccessEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!event.userId) {
      return;
    }

    let stats = this.userStats.get(event.userId);

    if (!stats) {
      stats = {
        userId: event.userId,
        totalDocumentsViewed: 0,
        totalDocumentsEdited: 0,
        totalDocumentsDownloaded: 0,
        totalSearches: 0,
        totalComments: 0,
        avgSessionDuration: 0,
        lastActiveAt: new Date(),
      };
      this.userStats.set(event.userId, stats);
    }

    // 更新统计
    switch (event.action) {
      case 'view':
        stats.totalDocumentsViewed++;
        break;
      case 'edit':
        stats.totalDocumentsEdited++;
        break;
      case 'download':
        stats.totalDocumentsDownloaded++;
        break;
      case 'search_hit':
        stats.totalSearches++;
        break;
      case 'comment':
        stats.totalComments++;
        break;
    }

    stats.lastActiveAt = new Date();
  }

  /**
   * 获取最受欢迎的文档
   */
  private async getMostViewedDocuments(limit: number): Promise<Array<{ documentId: string; title: string; views: number }>> {
    const documents = await Promise.all(
      Array.from(this.documentStats.entries())
        .sort((a, b) => b[1].totalViews - a[1].totalViews)
        .slice(0, limit)
        .map(async ([documentId, stats]) => {
          const document = await this.documentRepository.findById(documentId);
          return {
            documentId,
            title: document?.title || 'Unknown',
            views: stats.totalViews,
          };
        })
    );

    return documents;
  }

  /**
   * 获取最活跃的用户
   */
  private async getMostActiveUsers(limit: number): Promise<Array<{ userId?: string; activities: number }>> {
    return Array.from(this.userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        activities:
          stats.totalDocumentsViewed +
          stats.totalDocumentsEdited +
          stats.totalDocumentsDownloaded +
          stats.totalSearches +
          stats.totalComments,
      }))
      .sort((a, b) => b.activities - a.activities)
      .slice(0, limit);
  }

  /**
   * 加载历史数据
   */
  private async loadHistoricalData(): Promise<void> {
    // TODO: 从持久化存储加载历史数据
    this.logger.info('Historical data loaded');
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
