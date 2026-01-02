/**
 * @file 日志工具
 * @description 提供统一的日志记录功能
 * @module utils/logger
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  module?: string;
}

export class Logger {
  private module: string;
  private logLevel: LogLevel;

  constructor(module: string, logLevel: LogLevel = LogLevel.INFO) {
    this.module = module;
    this.logLevel = logLevel;
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 记录调试信息
   * @param message 消息
   * @param context 上下文
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * 记录信息
   * @param message 消息
   * @param context 上下文
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * 记录警告
   * @param message 消息
   * @param context 上下文
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * 记录错误
   * @param message 消息
   * @param context 上下文
   */
  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * 记录日志
   * @param level 日志级别
   * @param message 消息
   * @param context 上下文
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      module: this.module,
    };

    // 检查日志级别
    if (!this.shouldLog(level)) {
      return;
    }

    // 格式化日志
    const formatted = this.formatLog(entry);

    // 输出日志
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  /**
   * 检查是否应该记录日志
   * @param level 日志级别
   * @returns 是否应该记录
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const logLevelIndex = levels.indexOf(level);

    return logLevelIndex >= currentLevelIndex;
  }

  /**
   * 格式化日志
   * @param entry 日志条目
   * @returns 格式化后的日志
   */
  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? JSON.stringify(entry.context) : '';

    return `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.message} ${context}`;
  }
}

// 导出默认logger实例
export const logger = new Logger('default');
