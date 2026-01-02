/**
 * YYC³餐饮行业智能化平台 - 日志服务
 * 提供统一的日志记录功能
 * @module common/services/LoggerService
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LoggerConfig {
  level: LogLevel;
  serviceName?: string;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
}

/**
 * 日志服务类
 * 提供统一的日志记录接口
 */
export class Logger {
  private config: LoggerConfig;
  private componentName: string;

  /**
   * 构造函数
   * @param componentName 组件名称
   * @param config 日志配置
   */
  constructor(componentName: string, config: Partial<LoggerConfig> = {}) {
    this.componentName = componentName;
    this.config = {
      level: LogLevel.INFO,
      serviceName: process.env.SERVICE_NAME || 'unknown',
      enableConsole: true,
      enableFile: false,
      ...config
    };
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param data 附加数据
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param data 附加数据
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param data 附加数据
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param data 附加数据
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 记录致命错误日志
   * @param message 日志消息
   * @param data 附加数据
   */
  fatal(message: string, data?: any): void {
    this.log(LogLevel.FATAL, message, data);
  }

  /**
   * 核心日志记录方法
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // 检查日志级别是否需要记录
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        service: this.config.serviceName,
        component: this.componentName,
        message,
        ...(data ? { data } : {})
      };

      // 输出到控制台
      if (this.config.enableConsole) {
        this.consoleLog(logEntry);
      }

      // 输出到文件
      if (this.config.enableFile && this.config.filePath) {
        this.fileLog(logEntry);
      }
    }
  }

  /**
   * 检查是否需要记录该级别的日志
   * @param level 日志级别
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  /**
   * 输出日志到控制台
   * @param logEntry 日志条目
   */
  private consoleLog(logEntry: any): void {
    const { timestamp, level, service, component, message, data } = logEntry;
    const formattedMessage = `${timestamp} [${service}] [${component}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage, data);
        break;
    }
  }

  /**
   * 输出日志到文件
   * @param logEntry 日志条目
   */
  private fileLog(logEntry: any): void {
    // 简单的文件日志实现，实际项目中可以使用更专业的日志库
    try {
      const fs = require('fs');
      const logString = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.config.filePath!, logString, 'utf8');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }
}
