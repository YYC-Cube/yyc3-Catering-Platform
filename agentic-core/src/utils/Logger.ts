/**
 * @file 日志工具类
 * @description 提供统一的日志记录功能
 */

export interface LogOptions {
  timestamp?: boolean;
  level?: LogLevel;
  context?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export class Logger {
  private context?: string;
  private enableDebug: boolean;

  constructor(context?: string, enableDebug: boolean = false) {
    this.context = context;
    this.enableDebug = enableDebug;
  }

  /**
   * 记录调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.enableDebug) {
      this.log('debug', message, ...args);
    }
  }

  /**
   * 记录信息日志
   */
  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  /**
   * 记录错误日志
   */
  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  /**
   * 记录严重错误日志
   */
  critical(message: string, ...args: any[]): void {
    this.log('critical', message, ...args);
  }

  /**
   * 通用日志记录方法
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const context = this.context ? `[${this.context}]` : '';
    const logMessage = `${timestamp} ${level.toUpperCase()} ${context} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, ...args);
        break;
      case 'info':
        console.info(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'error':
        console.error(logMessage, ...args);
        break;
      case 'critical':
        console.error(logMessage, ...args);
        break;
      default:
        console.log(logMessage, ...args);
    }
  }

  /**
   * 设置日志上下文
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * 启用/禁用调试日志
   */
  setDebug(enable: boolean): void {
    this.enableDebug = enable;
  }

  /**
   * 创建带上下文的新日志实例
   */
  createChild(context: string): Logger {
    const fullContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(fullContext, this.enableDebug);
  }
}

// 创建默认日志实例
export const logger = new Logger('AgenticCore', process.env.NODE_ENV === 'development');
