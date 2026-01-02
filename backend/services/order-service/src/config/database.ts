/**
 * @file 数据库配置文件
 * @description 配置Sequelize数据库连接
 * @author YYC³
 * @version 1.0.0
 */
import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import logger from './logger';

// 数据库连接配置
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'order_service_db',
  dialect: 'mysql',
  logging: (sql: string) => {
    logger.debug(`SQL: ${sql}`);
  },
  models: [path.join(__dirname, '../models/**/*.ts')],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member;
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 测试数据库连接
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

// 同步数据库模型
export const syncDatabase = async (): Promise<boolean> => {
  try {
    await sequelize.sync({
      alter: process.env.NODE_ENV === 'development'
    });
    logger.info('Database models synchronized successfully');
    return true;
  } catch (error) {
    logger.error('Error synchronizing database models:', error);
    return false;
  }
};

export default sequelize;