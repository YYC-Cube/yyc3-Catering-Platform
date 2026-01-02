/**
 * @file Morgan中间件
 * @description YYC³餐饮行业智能化平台 - Morgan HTTP请求日志中间件
 * @module middleware/morgan
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import morgan from 'morgan';
import { logger } from '../utils/logger';

/**
 * Morgan日志格式化器
 */
const morganLogger = {
  write: (message: string): void => {
    // 移除换行符并记录日志
    logger.http(message.trim());
  }
};

/**
 * Morgan中间件配置
 */
export const morganMiddleware = morgan(
  // 自定义日志格式
  ':method :url :status :res[content-length] - :response-time ms',
  {
    // 使用自定义日志写入器
    stream: morganLogger
  }
);
