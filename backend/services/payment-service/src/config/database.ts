/**
 * @file 数据库配置模块
 * @description 配置Sequelize数据库连接，定义数据库模型关系，提供数据库操作工具
 * @module database
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Sequelize } from 'sequelize';
import logger from './logger';

// 从环境变量获取数据库配置
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  logger.error('缺少数据库配置环境变量');
  process.exit(1);
}

// 创建Sequelize实例
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'mysql',
  logging: (sql: string) => logger.debug(sql),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
});

/**
 * 测试数据库连接
 */
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

/**
 * 同步数据库模型
 */
export const syncDatabaseModels = async (): Promise<void> => {
  try {
    await sequelize.sync({
      alter: process.env.NODE_ENV !== 'production',
      force: false,
    });
    logger.info('数据库模型同步完成');
  } catch (error) {
    logger.error('数据库模型同步失败:', error);
    process.exit(1);
  }
};

export default sequelize;