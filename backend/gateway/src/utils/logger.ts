/**
 * @file 日志工具
 * @description YYC³餐饮行业智能化平台 - 日志记录工具
 * @module utils/logger
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import * as winston from 'winston';
import { config } from '../config/app';

// 定义日志级别
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// 创建日志格式化器
const logFormatter = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({
    stack: true
  }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 创建控制台传输
const consoleTransport = new winston.transports.Console({
  level: config.app.environment === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `[${timestamp}] ${level}: ${message} ${metaString}`;
    })
  )
});

// 创建文件传输（仅生产环境）
const fileTransport = config.app.environment === 'production' ? new winston.transports.File({
  filename: './logs/error.log',
  level: 'error',
  format: logFormatter
}) : null;

// 创建日志实例
export const logger = winston.createLogger({
  levels: logLevels,
  defaultMeta: {
    service: 'api-gateway',
    version: config.app.version,
    environment: config.app.environment
  },
  transports: [
    consoleTransport,
    ...(fileTransport ? [fileTransport] : [])
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: './logs/exceptions.log',
      format: logFormatter
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: './logs/rejections.log',
      format: logFormatter
    })
  ]
});

// 导出日志类型
export type Logger = typeof logger;
