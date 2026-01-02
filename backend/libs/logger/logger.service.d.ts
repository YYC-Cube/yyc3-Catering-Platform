/**
 * @file 日志服务
 * @description 提供统一的日志记录功能
 * @module logger/logger.service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */
/**
 * 日志级别
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    VERBOSE = "verbose"
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
export declare class LoggerService {
    private logger;
    private config;
    /**
     * 构造函数
     * @param config 日志配置
     */
    constructor(config?: Partial<LoggerConfig>);
    /**
     * 获取日志格式
     * @returns winston.Logform.Format
     */
    private getLogFormat;
    /**
     * 获取控制台传输
     * @returns winston.transports.ConsoleTransportInstance
     */
    private getConsoleTransport;
    /**
     * 获取文件传输
     * @returns DailyRotateFile
     */
    private getFileTransport;
    /**
     * 记录错误日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    error(message: string, meta?: any): void;
    /**
     * 记录警告日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    warn(message: string, meta?: any): void;
    /**
     * 记录信息日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    info(message: string, meta?: any): void;
    /**
     * 记录调试日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    debug(message: string, meta?: any): void;
    /**
     * 记录详细日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    verbose(message: string, meta?: any): void;
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLevel(level: LogLevel): void;
    /**
     * 获取当前日志级别
     * @returns LogLevel
     */
    getLevel(): LogLevel;
}
/**
 * 创建日志服务实例
 * @param config 日志配置
 * @returns LoggerService
 */
export declare function createLoggerService(config?: Partial<LoggerConfig>): LoggerService;
/**
 * 默认日志服务实例
 */
export declare const logger: LoggerService;
/**
 * 导出日志方法，方便直接使用
 */
export declare const error: (message: string, meta?: any) => void;
export declare const warn: (message: string, meta?: any) => void;
export declare const info: (message: string, meta?: any) => void;
export declare const debug: (message: string, meta?: any) => void;
export declare const verbose: (message: string, meta?: any) => void;
//# sourceMappingURL=logger.service.d.ts.map