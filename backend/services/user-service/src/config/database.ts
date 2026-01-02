/**
 * @fileoverview 用户服务数据库配置
 * @description 配置和管理用户服务的数据库连接
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Sequelize } from 'sequelize-typescript';
import { config } from './config';
import logger from './logger';

// 创建数据库连接实例
const sequelize = new Sequelize({
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  dialect: config.database.dialect as any,
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    underscored: true,
    timestamps: true,
    paranoid: true, // 软删除
  },
});

// 测试数据库连接
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
}

// 同步数据库模型
async function syncDatabaseModels() {
  try {
    await sequelize.sync({
      alter: config.service.env !== 'production', // 生产环境不使用alter
      force: false, // 不强制删除并重新创建表
    });
    logger.info('数据库模型同步完成');
  } catch (error) {
    logger.error('数据库模型同步失败:', error);
    process.exit(1);
  }
}

// 导出数据库连接和辅助函数
export {
  sequelize,
  testDatabaseConnection,
  syncDatabaseModels,
};
