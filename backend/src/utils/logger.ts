/**
 * YYC³餐饮行业智能化平台 - 日志工具
 * @description 结构化日志记录，支持多种日志级别和输出格式
 * @author YYC³
 * @version 1.0.0
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  requestId?: string
  userId?: string
  module?: string
  action?: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  metadata?: Record<string, any>
}

export interface LoggerConfig {
  level: LogLevel
  format: 'json' | 'text'
  output: 'console' | 'file' | 'both'
  filePath?: string
  maxFileSize?: number
  maxFiles?: number
  enableColors: boolean
  includeTimestamp: boolean
  includeRequestId: boolean
  modules?: string[]
  excludeModules?: string[]
}

class Logger {
  private config: LoggerConfig
  private static instance: Logger
  private logBuffer: LogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      format: 'json',
      output: 'console',
      enableColors: true,
      includeTimestamp: true,
      includeRequestId: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    }

    // 设置定时刷新
    this.startFlushInterval()
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config)
    }
    return Logger.instance
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 记录错误日志
   */
  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context)
  }

  /**
   * 记录警告日志
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * 记录信息日志
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * 记录调试日志
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * 记录跟踪日志
   */
  trace(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, context)
  }

  /**
   * 记录性能日志
   */
  performance(action: string, duration: number, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, `Performance: ${action}`, {
      ...context,
      action,
      duration,
      type: 'performance'
    })
  }

  /**
   * 记录API请求日志
   */
  api(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: Record<string, any>
  ): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    this.log(level, `API ${method} ${url} ${statusCode}`, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'api'
    })
  }

  /**
   * 记录数据库操作日志
   */
  database(operation: string, table: string, duration: number, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, `DB ${operation} on ${table}`, {
      ...context,
      operation,
      table,
      duration,
      type: 'database'
    })
  }

  /**
   * 记录业务操作日志
   */
  business(action: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, `Business: ${action}`, {
      ...context,
      action,
      type: 'business'
    })
  }

  /**
   * 记录安全相关日志
   */
  security(event: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, `Security: ${event}`, {
      ...context,
      event,
      type: 'security'
    })
  }

  /**
   * 创建子日志器
   */
  child(module: string, defaultContext?: Record<string, any>): ChildLogger {
    return new ChildLogger(this, module, defaultContext)
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // 检查日志级别
    if (level > this.config.level) {
      return
    }

    // 检查模块过滤
    const moduleName = context?.module
    if (moduleName) {
      if (this.config.excludeModules?.includes(moduleName)) {
        return
      }
      if (this.config.modules && !this.config.modules.includes(moduleName)) {
        return
      }
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      requestId: context?.requestId,
      userId: context?.userId,
      module: moduleName,
      action: context?.action,
      duration: context?.duration,
      metadata: context?.metadata
    }

    // 处理错误信息
    if (context?.error) {
      entry.error = {
        name: context.error.name,
        message: context.error.message,
        stack: context.error.stack,
        code: context.error.code
      }
    }

    // 添加到缓冲区
    this.logBuffer.push(entry)

    // 如果是错误级别，立即刷新
    if (level <= LogLevel.WARN) {
      this.flush()
    }
  }

  /**
   * 刷新日志缓冲区
   */
  private flush(): void {
    if (this.logBuffer.length === 0) {
      return
    }

    const entries = [...this.logBuffer]
    this.logBuffer = []

    entries.forEach(entry => {
      const formatted = this.formatLogEntry(entry)

      switch (this.config.output) {
        case 'console':
          this.writeToConsole(formatted, entry.level)
          break
        case 'file':
          this.writeToFile(formatted)
          break
        case 'both':
          this.writeToConsole(formatted, entry.level)
          this.writeToFile(formatted)
          break
      }
    })
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry)
    }

    // 文本格式
    const levelStr = LogLevel[entry.level].padEnd(5)
    const timestamp = this.config.includeTimestamp ? `[${entry.timestamp}] ` : ''
    const module = entry.module ? `[${entry.module}] ` : ''
    const requestId = this.config.includeRequestId && entry.requestId ? `[${entry.requestId}] ` : ''

    let message = `${timestamp}${levelStr} ${requestId}${module}${entry.message}`

    // 添加上下文信息
    if (entry.context) {
      const contextStr = Object.entries(entry.context)
        .filter(([key]) => !['module', 'requestId', 'error'].includes(key))
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ')

      if (contextStr) {
        message += ` ${contextStr}`
      }
    }

    // 添加性能信息
    if (entry.duration) {
      message += ` duration=${entry.duration}ms`
    }

    return message
  }

  /**
   * 写入控制台
   */
  private writeToConsole(message: string, level: LogLevel): void {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // 红色
      [LogLevel.WARN]: '\x1b[33m',  // 黄色
      [LogLevel.INFO]: '\x1b[36m',  // 青色
      [LogLevel.DEBUG]: '\x1b[37m', // 白色
      [LogLevel.TRACE]: '\x1b[90m'  // 灰色
    }

    const reset = '\x1b[0m'
    const color = this.config.enableColors ? colors[level] || '' : ''

    switch (level) {
      case LogLevel.ERROR:
        console.error(`${color}${message}${reset}`)
        break
      case LogLevel.WARN:
        console.warn(`${color}${message}${reset}`)
        break
      case LogLevel.INFO:
        console.info(`${color}${message}${reset}`)
        break
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.log(`${color}${message}${reset}`)
        break
    }
  }

  /**
   * 写入文件
   */
  private writeToFile(message: string): void {
    if (!this.config.filePath) {
      return
    }

    try {
      const fs = require('fs')
      const path = require('path')

      // 确保目录存在
      const dir = path.dirname(this.config.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // 检查文件大小并轮转
      if (fs.existsSync(this.config.filePath)) {
        const stats = fs.statSync(this.config.filePath)
        if (stats.size >= this.config.maxFileSize!) {
          this.rotateLogFile()
        }
      }

      // 写入日志
      fs.appendFileSync(this.config.filePath, message + '\n')
    } catch (error) {
      console.error('Failed to write log to file:', error)
    }
  }

  /**
   * 轮转日志文件
   */
  private rotateLogFile(): void {
    const fs = require('fs')
    const path = require('path')

    const basePath = this.config.filePath!
    const ext = path.extname(basePath)
    const name = path.basename(basePath, ext)

    // 删除最老的日志文件
    const oldestFile = `${name}.${this.config.maxFiles}${ext}`
    const oldestPath = path.join(path.dirname(basePath), oldestFile)
    if (fs.existsSync(oldestPath)) {
      fs.unlinkSync(oldestPath)
    }

    // 重命名现有文件
    for (let i = this.config.maxFiles! - 1; i > 0; i--) {
      const currentFile = i === 1 ? basePath : `${name}.${i}${ext}`
      const nextFile = `${name}.${i + 1}${ext}`
      const currentPath = path.join(path.dirname(basePath), currentFile)
      const nextPath = path.join(path.dirname(basePath), nextFile)

      if (fs.existsSync(currentPath)) {
        fs.renameSync(currentPath, nextPath)
      }
    }
  }

  /**
   * 启动定时刷新
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 1000) // 每秒刷新一次
  }

  /**
   * 停止日志器
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flush()
  }

  /**
   * 获取日志统计
   */
  getStats(): {
    bufferSize: number
    config: LoggerConfig
  } {
    return {
      bufferSize: this.logBuffer.length,
      config: { ...this.config }
    }
  }
}

/**
 * 子日志器类
 */
export class ChildLogger {
  constructor(
    private parent: Logger,
    private module: string,
    private defaultContext?: Record<string, any>
  ) {}

  error(message: string, context?: Record<string, any>): void {
    this.parent.error(message, { ...this.defaultContext, module: this.module, ...context })
  }

  warn(message: string, context?: Record<string, any>): void {
    this.parent.warn(message, { ...this.defaultContext, module: this.module, ...context })
  }

  info(message: string, context?: Record<string, any>): void {
    this.parent.info(message, { ...this.defaultContext, module: this.module, ...context })
  }

  debug(message: string, context?: Record<string, any>): void {
    this.parent.debug(message, { ...this.defaultContext, module: this.module, ...context })
  }

  trace(message: string, context?: Record<string, any>): void {
    this.parent.trace(message, { ...this.defaultContext, module: this.module, ...context })
  }

  performance(action: string, duration: number, context?: Record<string, any>): void {
    this.parent.performance(action, duration, { ...this.defaultContext, module: this.module, ...context })
  }

  api(method: string, url: string, statusCode: number, duration: number, context?: Record<string, any>): void {
    this.parent.api(method, url, statusCode, duration, { ...this.defaultContext, module: this.module, ...context })
  }

  database(operation: string, table: string, duration: number, context?: Record<string, any>): void {
    this.parent.database(operation, table, duration, { ...this.defaultContext, module: this.module, ...context })
  }

  business(action: string, context?: Record<string, any>): void {
    this.parent.business(action, { ...this.defaultContext, module: this.module, ...context })
  }

  security(event: string, context?: Record<string, any>): void {
    this.parent.security(event, { ...this.defaultContext, module: this.module, ...context })
  }
}

/**
 * 默认日志器实例
 */
export const logger = Logger.getInstance({
  level: process.env.LOG_LEVEL ? LogLevel[process.env.LOG_LEVEL.toUpperCase() as keyof typeof LogLevel] : LogLevel.INFO,
  format: process.env.LOG_FORMAT as 'json' | 'text' || 'json',
  output: process.env.LOG_OUTPUT as 'console' | 'file' | 'both' || 'console',
  filePath: process.env.LOG_FILE,
  enableColors: process.env.NODE_ENV !== 'production',
  includeTimestamp: true,
  includeRequestId: true
})

/**
 * 性能监控装饰器
 */
export function logPerformance(action?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value
    const actionName = action || `${target.constructor.name}.${propertyName}`

    descriptor.value = async function (...args: any[]) {
      const start = Date.now()
      try {
        const result = await method.apply(this, args)
        const duration = Date.now() - start
        logger.performance(actionName, duration, {
          class: target.constructor.name,
          method: propertyName,
          success: true
        })
        return result
      } catch (error) {
        const duration = Date.now() - start
        logger.performance(actionName, duration, {
          class: target.constructor.name,
          method: propertyName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 导出日志器单例
 */
export default logger