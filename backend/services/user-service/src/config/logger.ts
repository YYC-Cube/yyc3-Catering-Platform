/**
 * @fileoverview 用户服务日志配置
 * @description 配置和管理用户服务的日志系统
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { config } from './config';

// 确保日志目录存在
if (!fs.existsSync(config.logging.filePath)) {
  fs.mkdirSync(config.logging.filePath, { recursive: true });
}

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台日志格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf((info) => {
    return `${info.timestamp} [${info.level}] ${info.message}${
      info.stack ? `\n${info.stack}` : ''
    }`;
  })
);

// 日志传输配置
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: consoleFormat,
    level: config.logging.level,
  }),
  
  // 按天滚动的错误日志
  new DailyRotateFile({
    filename: path.join(config.logging.filePath, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: logFormat,
  }),
  
  // 按天滚动的所有日志
  new DailyRotateFile({
    filename: path.join(config.logging.filePath, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: config.logging.level,
    format: logFormat,
  })
];

// 创建日志实例
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// 导出日志实例
export default logger;
