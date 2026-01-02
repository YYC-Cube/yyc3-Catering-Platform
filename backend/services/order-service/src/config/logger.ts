/**
 * @file 日志配置文件
 * @description 配置应用程序的日志系统
 * @author YYC³
 * @version 1.0.0
 */
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// 定义日志级别
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 日志格式配置
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({
    stack: true
  }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台日志格式
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.colorize(),
  winston.format.simple()
);

// 创建日志记录器
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports: [
    // 每日轮换文件
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'order-service-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_FILE_MAX_DAYS || '14d',
      level: 'info'
    }),
    // 错误日志文件
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'order-service-error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_FILE_MAX_DAYS || '14d',
      level: 'error'
    })
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'order-service-exception-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_FILE_MAX_DAYS || '14d'
    })
  ]
});

// 在开发环境下添加控制台输出
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

export default logger;