/**
 * @fileoverview 数据库配置文件
 * @description 配置和初始化数据库连接
 * @module database
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Sequelize } from 'sequelize';
import config from './config';
import logger from './logger';

/**
 * 创建数据库连接
 */
let sequelize: Sequelize;

if (config.database.url) {
  // 使用连接URL创建连接
  sequelize = new Sequelize(config.database.url, {
    logging: config.database.logging ? (msg) => logger.debug(msg) : false,
    sync: config.database.sync,
    pool: {
      min: config.database.pool.min,
      max: config.database.pool.max,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle,
    },
  });
} else {
  // 使用配置参数创建连接
  sequelize = new Sequelize({
    database: process.env.DATABASE_NAME || 'yyc3',
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    dialect: process.env.DATABASE_DIALECT as any || 'mysql',
    logging: config.database.logging ? (msg) => logger.debug(msg) : false,
    sync: config.database.sync,
    pool: {
      min: config.database.pool.min,
      max: config.database.pool.max,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle,
    },
  });
}

/**
 * 测试数据库连接
 */
const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

/**
 * 同步数据库模型
 */
const syncDatabase = async (): Promise<void> => {
  if (config.database.sync) {
    try {
      await sequelize.sync();
      logger.info('Database models synchronized successfully');
    } catch (error) {
      logger.error('Error synchronizing database models:', error);
      throw error;
    }
  }
};

export {
  sequelize,
  testDatabaseConnection,
  syncDatabase,
};
