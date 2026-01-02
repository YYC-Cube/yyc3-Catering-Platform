/**
 * @file 日志配置
 * @description 配置应用日志系统，使用winston记录应用运行状态和错误信息
 * @module config/logger
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  format.errors({
    stack: true
  }),
  format.splat(),
  format.json()
);

// 控制台日志格式
const consoleFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  format.errors({
    stack: true
  }),
  format.colorize(),
  format.splat(),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}] ${message}${stack ? '\n' + stack : ''}`;
  })
);

// 创建日志实例
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'menu-service'
  },
  transports: [
    // 控制台输出
    new transports.Console({
      format: consoleFormat
    }),
    // 错误日志 - 按天滚动
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    }),
    // 合并日志 - 按天滚动
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

export default logger;
