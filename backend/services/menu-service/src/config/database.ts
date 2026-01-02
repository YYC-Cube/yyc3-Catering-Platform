/**
 * @file 数据库配置
 * @description 配置数据库连接和模型同步
 * @module config/database
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Sequelize } from 'sequelize-typescript';
import logger from './logger';
import { Category, DataCollection, DataProcessing, DishEntity, DynamicPrice, EntityRelationship, KnowledgeGraphQuery, MenuItem, MenuItemImage, MenuItemOption, MenuItemTag, Recommendation, RelationshipType, Tag } from '../models';

// 数据库连接配置
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'menu_service',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+08:00',
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
    freezeTableName: true
  },
  models: [Category, DataCollection, DataProcessing, DishEntity, DynamicPrice, EntityRelationship, KnowledgeGraphQuery, MenuItem, MenuItemImage, MenuItemOption, MenuItemTag, Recommendation, RelationshipType, Tag]
});

/**
 * 测试数据库连接
 * @returns {Promise<boolean>} 连接是否成功
 */
async function testDatabaseConnection(): Promise<boolean> {
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
 * @param force 是否强制同步（删除现有表）
 * @returns {Promise<void>}
 */
async function syncDatabase(force: boolean = false): Promise<void> {
  try {
    await sequelize.sync({ force });
    logger.info(`数据库模型同步成功${force ? '（强制模式）' : ''}`);
  } catch (error) {
    logger.error('数据库模型同步失败:', error);
    throw error;
  }
}

export {
  sequelize,
  testDatabaseConnection,
  syncDatabase
};

export default sequelize;
