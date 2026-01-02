/**
 * @file 日志配置模块
 * @description 配置并导出winston日志实例，支持多级别日志记录和文件轮换
 * @module logger
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}] ${info.message}`
  )
);

// 创建日志实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 每日轮换文件
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'payment-service-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    // 错误日志单独记录
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'payment-service-error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      level: 'error',
    }),
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export default logger;