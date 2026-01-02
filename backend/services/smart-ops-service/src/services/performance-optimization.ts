/**
 * @file 性能优化服务
 * @description 负责分析系统性能数据并提供优化建议，确保系统高效运行
 * @author YYC³团队
 * @version 1.0.0
 */

import cron from 'node-cron';
import { config } from '../config/config';
import { PerformanceMetric, OptimizationSuggestion } from '../models/performance';

export interface PerformanceData {
  timestamp: Date;
  serviceId: string;
  cpuUsage: number;
  memoryUsage: number;
  diskIops: number;
  networkLatency: number;
  requestCount: number;
  errorCount: number;
  responseTime: number;
}

export class PerformanceOptimizationService {
  private scheduledJob: cron.ScheduledTask | null = null;
  private performanceMetrics: Map<string, PerformanceMetric[]> = new Map();
  private optimizationHistory: Map<string, OptimizationSuggestion[]> = new Map();

  /**
   * 收集性能数据
   * @param serviceId 服务ID
   * @returns 性能数据
   */
  public async collectPerformanceData(serviceId: string): Promise<PerformanceData> {
    try {
      console.log(`[PerformanceOptimizationService] 收集性能数据: ${serviceId}`);
      
      // 模拟性能数据收集
      const performanceData = await this.simulatePerformanceData(serviceId);
      
      // 保存性能指标
      await this.savePerformanceMetric(serviceId, performanceData);
      
      return performanceData;
    } catch (error) {
      console.error(`[PerformanceOptimizationService] 收集性能数据失败: ${serviceId}`, error);
      throw error;
    }
  }

  /**
   * 分析性能数据
   * @param serviceId 服务ID
   * @param timeRange 时间范围（毫秒）
   * @returns 性能分析结果
   */
  public async analyzePerformanceData(serviceId: string, timeRange: number = 3600000): Promise<OptimizationSuggestion[]> {
    try {
      console.log(`[PerformanceOptimizationService] 分析性能数据: ${serviceId}, 时间范围: ${timeRange}ms`);
      
      // 获取指定时间范围内的性能指标
      const metrics = this.getPerformanceMetrics(serviceId, timeRange);
      
      // 分析性能趋势
      const performanceTrends = this.analyzePerformanceTrends(metrics);
      
      // 识别性能瓶颈
      const bottlenecks = this.identifyPerformanceBottlenecks(performanceTrends);
      
      // 生成优化建议
      const suggestions = this.generateOptimizationSuggestions(serviceId, bottlenecks);
      
      // 保存优化建议
      await this.saveOptimizationSuggestions(serviceId, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error(`[PerformanceOptimizationService] 分析性能数据失败: ${serviceId}`, error);
      throw error;
    }
  }

  /**
   * 模拟性能数据收集
   * @param serviceId 服务ID
   * @returns 模拟的性能数据
   */
  private async simulatePerformanceData(serviceId: string): Promise<PerformanceData> {
    // 模拟性能数据
    return {
      timestamp: new Date(),
      serviceId,
      cpuUsage: Math.floor(Math.random() * 80) + 10, // 10-90%
      memoryUsage: Math.floor(Math.random() * 70) + 20, // 20-90%
      diskIops: Math.floor(Math.random() * 1000) + 100, // 100-1100 IOPS
      networkLatency: Math.floor(Math.random() * 100) + 10, // 10-110ms
      requestCount: Math.floor(Math.random() * 1000) + 100, // 100-1100 requests
      errorCount: Math.floor(Math.random() * 20), // 0-20 errors
      responseTime: Math.floor(Math.random() * 500) + 50 // 50-550ms
    };
  }

  /**
   * 保存性能指标
   * @param serviceId 服务ID
   * @param performanceData 性能数据
   */
  private async savePerformanceMetric(serviceId: string, performanceData: PerformanceData): Promise<void> {
    const metric: PerformanceMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...performanceData
    };
    
    // 获取服务的性能指标列表
    const metrics = this.performanceMetrics.get(serviceId) || [];
    metrics.push(metric);
    
    // 只保留最近的性能指标
    const maxMetrics = config.performanceOptimization.maxMetricsPerService;
    if (metrics.length > maxMetrics) {
      metrics.splice(0, metrics.length - maxMetrics);
    }
    
    this.performanceMetrics.set(serviceId, metrics);
  }

  /**
   * 获取性能指标
   * @param serviceId 服务ID
   * @param timeRange 时间范围（毫秒）
   * @returns 性能指标列表
   */
  private getPerformanceMetrics(serviceId: string, timeRange: number): PerformanceMetric[] {
    const metrics = this.performanceMetrics.get(serviceId) || [];
    const cutoffTime = new Date(Date.now() - timeRange);
    
    return metrics.filter(metric => metric.timestamp >= cutoffTime);
  }

  /**
   * 分析性能趋势
   * @param metrics 性能指标列表
   * @returns 性能趋势分析结果
   */
  private analyzePerformanceTrends(metrics: PerformanceMetric[]): any {
    if (metrics.length === 0) {
      return {};
    }
    
    // 计算平均值
    const avgCpuUsage = metrics.reduce((sum, metric) => sum + metric.cpuUsage, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, metric) => sum + metric.memoryUsage, 0) / metrics.length;
    const avgResponseTime = metrics.reduce((sum, metric) => sum + metric.responseTime, 0) / metrics.length;
    const avgErrorCount = metrics.reduce((sum, metric) => sum + metric.errorCount, 0) / metrics.length;
    
    // 分析趋势
    const cpuTrend = this.calculateTrend(metrics.map(m => m.cpuUsage));
    const memoryTrend = this.calculateTrend(metrics.map(m => m.memoryUsage));
    const responseTimeTrend = this.calculateTrend(metrics.map(m => m.responseTime));
    const errorTrend = this.calculateTrend(metrics.map(m => m.errorCount));
    
    return {
      avgCpuUsage,
      avgMemoryUsage,
      avgResponseTime,
      avgErrorCount,
      cpuTrend,
      memoryTrend,
      responseTimeTrend,
      errorTrend,
      metricsCount: metrics.length
    };
  }

  /**
   * 计算趋势
   * @param values 值列表
   * @returns 趋势（positive/negative/stable）
   */
  private calculateTrend(values: number[]): 'positive' | 'negative' | 'stable' {
    if (values.length < 2) {
      return 'stable';
    }
    
    // 计算斜率
    const n = values.length;
    const sumX = n * (n + 1) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i + 1) * val, 0);
    const sumX2 = n * (n + 1) * (2 * n + 1) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // 根据斜率判断趋势
    if (slope > 0.5) {
      return 'positive'; // 上升趋势
    } else if (slope < -0.5) {
      return 'negative'; // 下降趋势
    } else {
      return 'stable'; // 稳定
    }
  }

  /**
   * 识别性能瓶颈
   * @param performanceTrends 性能趋势分析结果
   * @returns 性能瓶颈列表
   */
  private identifyPerformanceBottlenecks(performanceTrends: any): string[] {
    const bottlenecks: string[] = [];
    
    // 检查CPU使用率
    if (performanceTrends.avgCpuUsage > 80) {
      bottlenecks.push('high_cpu_usage');
    }
    
    // 检查内存使用率
    if (performanceTrends.avgMemoryUsage > 85) {
      bottlenecks.push('high_memory_usage');
    }
    
    // 检查响应时间
    if (performanceTrends.avgResponseTime > 500) {
      bottlenecks.push('high_response_time');
    }
    
    // 检查错误率
    if (performanceTrends.avgErrorCount > 10) {
      bottlenecks.push('high_error_rate');
    }
    
    // 检查趋势
    if (performanceTrends.cpuTrend === 'positive' && performanceTrends.avgCpuUsage > 70) {
      bottlenecks.push('increasing_cpu_trend');
    }
    
    if (performanceTrends.memoryTrend === 'positive' && performanceTrends.avgMemoryUsage > 75) {
      bottlenecks.push('increasing_memory_trend');
    }
    
    if (performanceTrends.responseTimeTrend === 'positive' && performanceTrends.avgResponseTime > 400) {
      bottlenecks.push('increasing_response_time_trend');
    }
    
    return bottlenecks;
  }

  /**
   * 生成优化建议
   * @param serviceId 服务ID
   * @param bottlenecks 性能瓶颈列表
   * @returns 优化建议列表
   */
  private generateOptimizationSuggestions(serviceId: string, bottlenecks: string[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // 为每个瓶颈生成优化建议
    for (const bottleneck of bottlenecks) {
      const suggestion = this.createOptimizationSuggestion(serviceId, bottleneck);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }

  /**
   * 创建优化建议
   * @param serviceId 服务ID
   * @param bottleneck 性能瓶颈
   * @returns 优化建议
   */
  private createOptimizationSuggestion(serviceId: string, bottleneck: string): OptimizationSuggestion | null {
    const suggestionTemplates: Record<string, any> = {
      'high_cpu_usage': {
        title: '高CPU使用率',
        description: '服务CPU使用率过高，建议优化代码或增加CPU资源。',
        severity: 'high',
        actions: [
          '优化数据库查询',
          '实现代码缓存',
          '增加服务实例',
          '升级CPU配置'
        ]
      },
      'high_memory_usage': {
        title: '高内存使用率',
        description: '服务内存使用率过高，建议优化内存管理或增加内存资源。',
        severity: 'high',
        actions: [
          '检查内存泄漏',
          '优化数据结构',
          '增加内存配置',
          '实现数据分页'
        ]
      },
      'high_response_time': {
        title: '高响应时间',
        description: '服务响应时间过长，建议优化请求处理流程。',
        severity: 'medium',
        actions: [
          '优化API调用',
          '实现缓存机制',
          '增加服务实例',
          '优化前端资源'
        ]
      },
      'high_error_rate': {
        title: '高错误率',
        description: '服务错误率过高，建议检查代码逻辑和外部依赖。',
        severity: 'high',
        actions: [
          '检查错误日志',
          '修复代码bug',
          '增加重试机制',
          '优化错误处理'
        ]
      },
      'increasing_cpu_trend': {
        title: 'CPU使用率持续上升',
        description: 'CPU使用率呈上升趋势，建议提前扩容或优化。',
        severity: 'medium',
        actions: [
          '监控CPU使用趋势',
          '计划扩容',
          '优化代码性能',
          '实施负载均衡'
        ]
      },
      'increasing_memory_trend': {
        title: '内存使用率持续上升',
        description: '内存使用率呈上升趋势，可能存在内存泄漏。',
        severity: 'high',
        actions: [
          '检查内存泄漏',
          '优化内存管理',
          '增加内存配置',
          '重启服务'
        ]
      },
      'increasing_response_time_trend': {
        title: '响应时间持续上升',
        description: '响应时间呈上升趋势，建议优化服务性能。',
        severity: 'medium',
        actions: [
          '优化请求处理',
          '增加缓存层',
          '扩容服务实例',
          '优化数据库'
        ]
      }
    };
    
    const template = suggestionTemplates[bottleneck];
    if (!template) {
      return null;
    }
    
    return {
      id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      timestamp: new Date(),
      ...template
    };
  }

  /**
   * 保存优化建议
   * @param serviceId 服务ID
   * @param suggestions 优化建议列表
   */
  private async saveOptimizationSuggestions(serviceId: string, suggestions: OptimizationSuggestion[]): Promise<void> {
    const history = this.optimizationHistory.get(serviceId) || [];
    history.push(...suggestions);
    
    // 只保留最近的优化建议
    const maxHistory = config.performanceOptimization.maxOptimizationHistory;
    if (history.length > maxHistory) {
      history.splice(0, history.length - maxHistory);
    }
    
    this.optimizationHistory.set(serviceId, history);
  }

  /**
   * 获取优化建议
   * @param serviceId 服务ID
   * @param timeRange 时间范围（毫秒）
   * @returns 优化建议列表
   */
  public getOptimizationSuggestions(serviceId: string, timeRange: number = 86400000): OptimizationSuggestion[] {
    const history = this.optimizationHistory.get(serviceId) || [];
    const cutoffTime = new Date(Date.now() - timeRange);
    
    return history.filter(suggestion => suggestion.timestamp >= cutoffTime);
  }

  /**
   * 应用优化建议
   * @param suggestionId 建议ID
   * @returns 应用结果
   */
  public async applyOptimizationSuggestion(suggestionId: string): Promise<boolean> {
    try {
      console.log(`[PerformanceOptimizationService] 应用优化建议: ${suggestionId}`);
      
      // 模拟应用优化建议
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`[PerformanceOptimizationService] 优化建议应用成功: ${suggestionId}`);
      return true;
    } catch (error) {
      console.error(`[PerformanceOptimizationService] 应用优化建议失败: ${suggestionId}`, error);
      return false;
    }
  }

  /**
   * 启动定时性能分析任务
   */
  public startScheduledPerformanceAnalysis(): void {
    if (this.scheduledJob) {
      this.scheduledJob.stop();
    }

    // 每5分钟执行一次性能分析
    this.scheduledJob = cron.schedule('*/5 * * * *', async () => {
      console.log('[PerformanceOptimizationService] 执行定时性能分析');
      try {
        // 分析所有服务的性能数据
        const serviceIds = ['api-gateway', 'menu-service', 'order-service', 'payment-service', 'user-service'];
        
        for (const serviceId of serviceIds) {
          await this.collectPerformanceData(serviceId);
          await this.analyzePerformanceData(serviceId);
        }
      } catch (error) {
        console.error('[PerformanceOptimizationService] 定时性能分析失败:', error);
      }
    });

    console.log('[PerformanceOptimizationService] 定时性能分析任务已启动');
  }

  /**
   * 停止定时性能分析任务
   */
  public stopScheduledPerformanceAnalysis(): void {
    if (this.scheduledJob) {
      this.scheduledJob.stop();
      this.scheduledJob = null;
      console.log('[PerformanceOptimizationService] 定时性能分析任务已停止');
    }
  }
}