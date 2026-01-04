/**
 * @file 故障记录模型
 * @description 定义故障记录的数据结构
 * @author YYC³团队
 * @version 1.0.0
 */

export interface FaultRecord {
  /**
   * 故障ID
   */
  id: string;
  
  /**
   * 服务ID
   */
  serviceId: string;
  
  /**
   * 故障类型
   */
  faultType: 'critical' | 'warning' | 'info';
  
  /**
   * 故障状态
   */
  status: 'unhealthy' | 'degraded';
  
  /**
   * 故障详情
   */
  details: {
    responseTime: number;
    errorRate: number;
    [key: string]: unknown;
  };
  
  /**
   * 故障检测时间
   */
  detectedAt: Date;
  
  /**
   * 恢复尝试次数
   */
  recoveryAttempts: number;
  
  /**
   * 是否恢复成功
   */
  recovered: boolean;
  
  /**
   * 恢复操作
   */
  recoveryAction: string;
  
  /**
   * 故障解决时间
   */
  resolvedAt: Date | null;
}