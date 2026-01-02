/**
 * @file API网关日志配置
 * @description 配置API网关的日志系统
 * @module config/logger
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { createLoggerService, LogLevel } from '@libs/logger/logger.service';

/**
 * 日志配置
 */
const loggerConfig = {
  level: (process.env['LOG_LEVEL'] as LogLevel) || LogLevel.INFO,
  filePath: process.env['LOG_FILE_PATH'] || './logs/api-gateway.log',
  maxFiles: process.env['LOG_MAX_FILES'] || '14d',
  maxSize: process.env['LOG_MAX_SIZE'] || '20m',
  format: process.env['LOG_FORMAT'] || 'json',
};

/**
 * 创建日志服务实例
 */
const logger = createLoggerService(loggerConfig);

export { logger };
