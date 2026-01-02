/**
 * @file 日志配置
 * @description 配置Winston日志系统
 * @module config/logger
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 创建日志目录
const logDir = path.dirname(process.env.LOG_FILE || './logs/notification-service.log');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({
    stack: true,
  }),
  winston.format.splat(),
  winston.format.json()
);

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'notification-service',
  },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: process.env.LOG_FILE || './logs/notification-service-error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: process.env.LOG_FILE || './logs/notification-service.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

export { logger };