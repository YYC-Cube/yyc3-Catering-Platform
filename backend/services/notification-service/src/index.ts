/**
 * @file 通知服务入口文件
 * @description 导出通知服务的主要组件和功能
 * @module index
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

// 导出服务类
export * from './services/NotificationService';
export * from './services/EmailService';
export * from './services/SMSService';
export * from './services/PushNotificationService';
export * from './services/RabbitMQService';

// 导出模型
export * from './models/Notification';
export * from './models/UserNotificationPreference';

// 导出枚举
export * from './enums/NotificationType';

// 导出控制器
export * from './controllers/NotificationController';

// 导出配置
export * from './config/logger';
export * from './config/database';
export * from './config/rabbitmq';
export * from './config/redis';
