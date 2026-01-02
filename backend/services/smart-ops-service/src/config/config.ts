/**
 * @file 智能运维服务配置文件
 * @description 定义服务的各项参数设置
 * @author YYC³团队
 * @version 1.0.0
 */

import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  server: {
    host: string;
    port: number;
  };
  database: {
    url: string;
    name: string;
  };
  redis: {
    url: string;
    port: number;
    host: string;
  };
  resourcePrediction: {
    enabled: boolean;
    predictionInterval: number; // 毫秒
    predictionWindow: number; // 小时
  };
  faultRecovery: {
    enabled: boolean;
    detectionInterval: number; // 毫秒
    recoveryAttempts: number;
    recoveryTimeout: number; // 毫秒
  };
  performanceOptimization: {
    enabled: boolean;
    optimizationInterval: number; // 毫秒
    cpuThreshold: number; // 百分比
    memoryThreshold: number; // 百分比
  };
  backupRecovery: {
    enabled: boolean;
    backupInterval: number; // 毫秒
    backupRetentionDays: number;
    backupPath: string;
  };
}

export const config: Config = {
  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.SERVER_PORT || '3205', 10),
  },
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
    name: process.env.DATABASE_NAME || 'smart_ops',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    host: process.env.REDIS_HOST || 'localhost',
  },
  resourcePrediction: {
    enabled: process.env.RESOURCE_PREDICTION_ENABLED === 'true' || true,
    predictionInterval: parseInt(process.env.RESOURCE_PREDICTION_INTERVAL || '3600000', 10), // 默认1小时
    predictionWindow: parseInt(process.env.RESOURCE_PREDICTION_WINDOW || '24', 10), // 默认预测24小时
  },
  faultRecovery: {
    enabled: process.env.FAULT_RECOVERY_ENABLED === 'true' || true,
    detectionInterval: parseInt(process.env.FAULT_DETECTION_INTERVAL || '60000', 10), // 默认1分钟
    recoveryAttempts: parseInt(process.env.RECOVERY_ATTEMPTS || '3', 10),
    recoveryTimeout: parseInt(process.env.RECOVERY_TIMEOUT || '30000', 10), // 默认30秒
  },
  performanceOptimization: {
    enabled: process.env.PERFORMANCE_OPTIMIZATION_ENABLED === 'true' || true,
    optimizationInterval: parseInt(process.env.OPTIMIZATION_INTERVAL || '300000', 10), // 默认5分钟
    cpuThreshold: parseInt(process.env.CPU_THRESHOLD || '80', 10), // CPU使用率超过80%触发优化
    memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD || '85', 10), // 内存使用率超过85%触发优化
  },
  backupRecovery: {
    enabled: process.env.BACKUP_RECOVERY_ENABLED === 'true' || true,
    backupInterval: parseInt(process.env.BACKUP_INTERVAL || '43200000', 10), // 默认12小时
    backupRetentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10), // 保留7天备份
    backupPath: process.env.BACKUP_PATH || './backups',
  },
};