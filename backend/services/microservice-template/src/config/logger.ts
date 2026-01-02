/**
 * @fileoverview 日志配置文件
 * @description 配置和初始化应用的日志系统
 * @module logger
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import winston from 'winston';
import config from './config';

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({
    stack: true,
  }),
  winston.format.splat(),
  winston.format.json(),
);

// 创建日志器
const logger = winston.createLogger({
  level: config.logger.level,
  format: logFormat,
  defaultMeta: {
    service: config.service.name,
    version: config.service.version,
    env: config.service.env,
  },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

// 如果启用了文件输出，则添加文件传输
if (config.logger.fileTransport) {
  logger.add(
    new winston.transports.File({
      filename: config.logger.filePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
  );
}

// 开发环境下添加详细日志
if (config.service.env === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint(),
      ),
    }),
  );
}

export default logger;
