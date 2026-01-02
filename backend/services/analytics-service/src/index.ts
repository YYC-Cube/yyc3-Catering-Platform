/**
 * @file 数据分析服务入口文件
 * @description 导出主要组件和功能
 * @module index
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

// 导出服务类
export { analyticsService } from './services/AnalyticsService';

// 导出模型
export { AnalyticsData } from './models/AnalyticsData';
export { UserAnalytics } from './models/UserAnalytics';
export { OrderAnalytics } from './models/OrderAnalytics';

// 导出枚举
export { AnalyticsType } from './enums/AnalyticsType';

// 导出控制器
export { analyticsController } from './controllers/AnalyticsController';

// 导出配置
export { dbConfig } from './config/database';
export { redisConfig } from './config/redis';
export { logger } from './config/logger';

// 导出应用和启动函数
export { default as app } from './app';
export { startApp } from './app';
