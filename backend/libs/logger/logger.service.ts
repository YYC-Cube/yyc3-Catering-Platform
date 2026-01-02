/**
 * @file 日志服务
 * @description 提供统一的日志记录功能
 * @module logger/logger.service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import winston, { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  level: LogLevel;
  filePath: string;
  maxFiles: string;
  maxSize: string;
  format: string;
}

/**
 * 日志服务类
 */
export class LoggerService {
  private logger: winston.Logger;
  private config: LoggerConfig;

  /**
   * 构造函数
   * @param config 日志配置
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level || LogLevel.INFO,
      filePath: config.filePath || './logs/app.log',
      maxFiles: config.maxFiles || '14d',
      maxSize: config.maxSize || '20m',
      format: config.format || 'json',
      ...config,
    };

    // 创建日志目录
    const logDir = path.dirname(this.config.filePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // 创建日志记录器
    this.logger = createLogger({
      level: this.config.level,
      format: this.getLogFormat(),
      transports: [this.getConsoleTransport(), this.getFileTransport()],
    });
  }

  /**
   * 获取日志格式
   * @returns winston.Logform.Format
   */
  private getLogFormat(): winston.Logform.Format {
    const formats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
    ];

    if (this.config.format === 'json') {
      formats.push(winston.format.json());
    } else {
      formats.push(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} ${level}: ${message}${metaString}`;
        })
      );
    }

    return format.combine(...formats);
  }

  /**
   * 获取控制台传输
   * @returns winston.transports.ConsoleTransportInstance
   */
  private getConsoleTransport(): winston.transports.ConsoleTransportInstance {
    return new winston.transports.Console();
  }

  /**
   * 获取文件传输
   * @returns DailyRotateFile
   */
  private getFileTransport(): DailyRotateFile {
    return new DailyRotateFile({
      filename: this.config.filePath,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: this.config.maxSize,
      maxFiles: this.config.maxFiles,
    });
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param meta 附加信息
   */
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param meta 附加信息
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param meta 附加信息
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param meta 附加信息
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * 记录详细日志
   * @param message 日志消息
   * @param meta 附加信息
   */
  verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.logger.level = level;
  }

  /**
   * 获取当前日志级别
   * @returns LogLevel
   */
  getLevel(): LogLevel {
    return this.config.level;
  }
}

/**
 * 创建日志服务实例
 * @param config 日志配置
 * @returns LoggerService
 */
export function createLoggerService(config: Partial<LoggerConfig> = {}): LoggerService {
  return new LoggerService(config);
}

/**
 * 默认日志服务实例
 */
export const logger = createLoggerService();

/**
 * 导出日志方法，方便直接使用
 */
export const error = logger.error.bind(logger);
export const warn = logger.warn.bind(logger);
export const info = logger.info.bind(logger);
export const debug = logger.debug.bind(logger);
export const verbose = logger.verbose.bind(logger);
