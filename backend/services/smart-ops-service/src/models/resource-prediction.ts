/**
 * @file 资源预测模型
 * @description 定义资源预测相关的数据结构
 * @author YYC³团队
 * @version 1.0.0
 */

export interface ResourcePrediction {
  /**
   * 预测ID
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
   * 预测时间范围
   */
  timeRange: {
    /**
     * 开始时间
     */
    start: Date;
    
    /**
     * 结束时间
     */
    end: Date;
  };
  
  /**
   * 资源类型
   */
  resourceType: 'cpu' | 'memory' | 'disk' | 'network';
  
  /**
   * 预测值
   */
  predictionValue: number;
  
  /**
   * 实际值
   */
  actualValue?: number;
  
  /**
   * 预测准确性
   */
  accuracy?: number;
}

export interface ResourceForecast {
  /**
   * 服务ID
   */
  serviceId: string;
  
  /**
   * 预测时间点
   */
  forecastTime: Date;
  
  /**
   * CPU预测（%）
   */
  cpuPrediction: number;
  
  /**
   * 内存预测（%）
   */
  memoryPrediction: number;
  
  /**
   * 磁盘预测（%）
   */
  diskPrediction: number;
  
  /**
   * 网络预测（MB/s）
   */
  networkPrediction: number;
  
  /**
   * 预测置信度
   */
  confidence: number;
  
  /**
   * 建议操作
   */
  suggestions: string[];
}