/**
 * @file 数据库配置
 * @description 配置并导出Sequelize数据库连接和模型同步功能
 * @module config/database
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import logger from './logger';

// 加载环境变量
dotenv.config();

// 数据库配置
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'yyc3_delivery_db',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: (process.env.DB_DIALECT as any) || 'mysql',
  logging: process.env.DB_LOGGING === 'true',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+08:00', // 设置时区为北京时间
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
};

// 创建Sequelize实例
const sequelize = new Sequelize(DB_CONFIG);

// 连接数据库
const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败', { error: (error as Error).message });
    throw error;
  }
};

// 同步数据库模型
const syncModels = async (): Promise<void> => {
  try {
    // 动态导入模型
    // 注意：实际项目中应该直接导入所有模型类
    // 这里使用动态导入是为了避免循环依赖
    const modelsPath = __dirname + '/../models/*.model.ts';
    const modelFiles = require('glob').sync(modelsPath);
    
    for (const file of modelFiles) {
      const modelModule = await import(file);
      const model = modelModule.default || modelModule[Object.keys(modelModule)[0]];
      if (model) {
        sequelize.addModels([model]);
      }
    }

    // 同步模型
    await sequelize.sync({
      alter: process.env.NODE_ENV === 'development', // 开发环境下自动修改表结构
      force: false, // 禁止强制删除并重新创建表
    });

    logger.info('数据库模型同步成功');
  } catch (error) {
    logger.error('数据库模型同步失败', { error: (error as Error).message });
    throw error;
  }
};

// 导出Sequelize实例和工具函数
export { sequelize, connectDB, syncModels };