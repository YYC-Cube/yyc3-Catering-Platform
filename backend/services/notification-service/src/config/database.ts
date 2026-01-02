/**
 * @file 数据库配置
 * @description 配置Sequelize数据库连接和模型同步
 * @module config/database
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'yyc3_notification_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: (msg) => logger.debug('数据库查询: %s', msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+08:00', // 设置时区为北京时间
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      paranoid: true, // 软删除
    },
  }
);

/**
 * 测试数据库连接
 */
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败: %s', (error as Error).message);
    process.exit(1);
  }
};

/**
 * 同步数据库模型
 */
const syncModels = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    logger.info('数据库模型同步成功');
  } catch (error) {
    logger.error('数据库模型同步失败: %s', (error as Error).message);
    process.exit(1);
  }
};

export { sequelize, testConnection, syncModels };