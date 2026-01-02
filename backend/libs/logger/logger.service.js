"use strict";
/**
 * @file 日志服务
 * @description 提供统一的日志记录功能
 * @module logger/logger.service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verbose = exports.debug = exports.info = exports.warn = exports.error = exports.logger = exports.LoggerService = exports.LogLevel = void 0;
exports.createLoggerService = createLoggerService;
const winston_1 = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * 日志级别
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["VERBOSE"] = "verbose";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * 日志服务类
 */
class LoggerService {
    /**
     * 构造函数
     * @param config 日志配置
     */
    constructor(config = {}) {
        this.config = {
            level: config.level || LogLevel.INFO,
            filePath: config.filePath || './logs/app.log',
            maxFiles: config.maxFiles || '14d',
            maxSize: config.maxSize || '20m',
            format: config.format || 'json',
            ...config,
        };
        // 创建日志目录
        const logDir = path_1.default.dirname(this.config.filePath);
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir, { recursive: true });
        }
        // 创建日志记录器
        this.logger = (0, winston_1.createLogger)({
            level: this.config.level,
            format: this.getLogFormat(),
            transports: [this.getConsoleTransport(), this.getFileTransport()],
        });
    }
    /**
     * 获取日志格式
     * @returns winston.Logform.Format
     */
    getLogFormat() {
        const formats = [
            winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston_1.default.format.errors({ stack: true }),
            winston_1.default.format.splat(),
        ];
        if (this.config.format === 'json') {
            formats.push(winston_1.default.format.json());
        }
        else {
            formats.push(winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString = Object.keys(meta).length
                    ? ` ${JSON.stringify(meta)}`
                    : '';
                return `${timestamp} ${level}: ${message}${metaString}`;
            }));
        }
        return winston_1.format.combine(...formats);
    }
    /**
     * 获取控制台传输
     * @returns winston.transports.ConsoleTransportInstance
     */
    getConsoleTransport() {
        return new winston_1.default.transports.Console();
    }
    /**
     * 获取文件传输
     * @returns DailyRotateFile
     */
    getFileTransport() {
        return new winston_daily_rotate_file_1.default({
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
    error(message, meta) {
        this.logger.error(message, meta);
    }
    /**
     * 记录警告日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    /**
     * 记录信息日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    info(message, meta) {
        this.logger.info(message, meta);
    }
    /**
     * 记录调试日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    /**
     * 记录详细日志
     * @param message 日志消息
     * @param meta 附加信息
     */
    verbose(message, meta) {
        this.logger.verbose(message, meta);
    }
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLevel(level) {
        this.config.level = level;
        this.logger.level = level;
    }
    /**
     * 获取当前日志级别
     * @returns LogLevel
     */
    getLevel() {
        return this.config.level;
    }
}
exports.LoggerService = LoggerService;
/**
 * 创建日志服务实例
 * @param config 日志配置
 * @returns LoggerService
 */
function createLoggerService(config = {}) {
    return new LoggerService(config);
}
/**
 * 默认日志服务实例
 */
exports.logger = createLoggerService();
/**
 * 导出日志方法，方便直接使用
 */
exports.error = exports.logger.error.bind(exports.logger);
exports.warn = exports.logger.warn.bind(exports.logger);
exports.info = exports.logger.info.bind(exports.logger);
exports.debug = exports.logger.debug.bind(exports.logger);
exports.verbose = exports.logger.verbose.bind(exports.logger);
//# sourceMappingURL=logger.service.js.map