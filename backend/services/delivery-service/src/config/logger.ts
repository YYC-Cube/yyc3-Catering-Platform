/**
 * @file 日志配置
 * @description 配置并导出winston日志系统
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
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 定义日志级别
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs/delivery-service.log');
const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || '20m';
const LOG_MAX_FILES = process.env.LOG_MAX_FILES || '5';

// 配置日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let logMessage = `${timestamp} [${level}] ${message}`;
    if (Object.keys(metadata).length) {
      logMessage += ` ${JSON.stringify(metadata)}`;
    }
    return logMessage;
  })
);

// 创建日志传输
const transports = [
  // 控制台输出
  new winston.transports.Console({
    level: LOG_LEVEL,
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }),
  // 文件输出
  new winston.transports.File({
    level: LOG_LEVEL,
    filename: LOG_FILE_PATH,
    format: logFormat,
    maxsize: parseInt(LOG_MAX_SIZE),
    maxFiles: parseInt(LOG_MAX_FILES),
    tailable: true
  }),
  // 错误日志文件
  new winston.transports.File({
    level: 'error',
    filename: path.join(__dirname, '../../logs/delivery-service-errors.log'),
    format: logFormat,
    maxsize: parseInt(LOG_MAX_SIZE),
    maxFiles: parseInt(LOG_MAX_FILES),
    tailable: true
  })
];

// 创建日志记录器
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/delivery-service-exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/delivery-service-rejections.log'),
      format: logFormat
    })
  ]
});

// 导出日志记录器
export default logger;