/**
 * @file 性能模型
 * @description 定义性能相关的数据结构
 * @author YYC³团队
 * @version 1.0.0
 */

export interface PerformanceMetric {
  /**
   * 指标ID
   */
  id: string;
  
  /**
   * 服务ID
   */
  serviceId: string;
  
  /**
   * 时间戳
   */
  timestamp: Date;
  
  /**
   * CPU使用率（%）
   */
  cpuUsage: number;
  
  /**
   * 内存使用率（%）
   */
  memoryUsage: number;
  
  /**
   * 磁盘IOPS
   */
  diskIops: number;
  
  /**
   * 网络延迟（ms）
   */
  networkLatency: number;
  
  /**
   * 请求计数
   */
  requestCount: number;
  
  /**
   * 错误计数
   */
  errorCount: number;
  
  /**
   * 响应时间（ms）
   */
  responseTime: number;
}

export interface OptimizationSuggestion {
  /**
   * 建议ID
   */
  id: string;
  
  /**
   * 服务ID
   */
  serviceId: string;
  
  /**
   * 时间戳
   */
  timestamp: Date;
  
  /**
   * 建议标题
   */
  title: string;
  
  /**
   * 建议描述
   */
  description: string;
  
  /**
   * 建议严重性
   */
  severity: 'high' | 'medium' | 'low';
  
  /**
   * 建议操作
   */
  actions: string[];
  
  /**
   * 建议状态
   */
  status?: 'pending' | 'implemented' | 'dismissed';
}