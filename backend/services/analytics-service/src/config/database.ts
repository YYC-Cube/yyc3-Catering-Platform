/**
 * @file 数据库配置
 * @description 配置Sequelize数据库连接
 * @module config/database
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Sequelize } from 'sequelize-typescript';
import { logger } from './logger';

// 数据库配置选项
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'yyc3_analytics',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dialect: (process.env.DB_DIALECT as any) || 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? (msg) => logger.debug(msg) : false,
  models: [__dirname + '/../models/**/*.ts'],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * 测试数据库连接
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    return true;
  } catch (error) {
    logger.error('数据库连接失败:', error);
    return false;
  }
}

/**
 * 同步数据库模型
 */
async function syncModels() {
  if (process.env.DB_SYNC === 'true') {
    try {
      await sequelize.sync({
        alter: process.env.NODE_ENV !== 'production',
        force: false,
      });
      logger.info('数据库模型同步成功');
    } catch (error) {
      logger.error('数据库模型同步失败:', error);
      throw error;
    }
  }
}

/**
 * 关闭数据库连接
 */
async function closeConnection() {
  try {
    await sequelize.close();
    logger.info('数据库连接已关闭');
  } catch (error) {
    logger.error('关闭数据库连接时出错:', error);
  }
}

/**
 * 重新连接数据库
 */
async function reconnect() {
  try {
    await sequelize.connectionManager.close();
    await sequelize.authenticate();
    logger.info('数据库重新连接成功');
    return true;
  } catch (error) {
    logger.error('数据库重新连接失败:', error);
    return false;
  }
}

/**
 * 数据库服务对象
 */
export const databaseService = {
  sequelize,
  testConnection,
  syncModels,
  closeConnection,
  reconnect,
};
