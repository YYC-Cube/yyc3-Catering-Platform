/**
 * @fileoverview 用户服务配置文件
 * @description 加载并管理用户服务的所有配置
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 用户服务配置接口
 */
export interface UserServiceConfig {
  // 服务基本配置
  service: {
    name: string;
    version: string;
    port: number;
    env: string;
  };

  // 服务注册与发现
  consul: {
    host: string;
    port: number;
    serviceId: string;
  };

  // 配置中心
  nacos: {
    host: string;
    port: number;
    namespace: string;
    group: string;
    configFile: string;
  };

  // 数据库配置
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    dialect: string;
  };

  // Redis配置
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
  };

  // RabbitMQ配置
  rabbitmq: {
    host: string;
    port: number;
    user: string;
    password: string;
    vhost: string;
  };

  // JWT配置
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // 日志配置
  logging: {
    level: string;
    filePath: string;
  };

  // API配置
  api: {
    prefix: string;
    maxFileSize: string;
    uploadPath: string;
  };
}

/**
 * 用户服务配置
 */
export const config: UserServiceConfig = {
  // 服务基本配置
  service: {
    name: process.env.SERVICE_NAME || 'user-service',
    version: process.env.SERVICE_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3201', 10),
    env: process.env.NODE_ENV || 'development',
  },

  // 服务注册与发现
  consul: {
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT || '8500', 10),
    serviceId: process.env.CONSUL_SERVICE_ID || `user-service-${Date.now()}`,
  },

  // 配置中心
  nacos: {
    host: process.env.NACOS_HOST || 'localhost',
    port: parseInt(process.env.NACOS_PORT || '8848', 10),
    namespace: process.env.NACOS_NAMESPACE || 'yyc3-catering',
    group: process.env.NACOS_GROUP || 'DEFAULT_GROUP',
    configFile: process.env.NACOS_CONFIG_FILE || 'user-service-dev.yaml',
  },

  // 数据库配置
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '123456',
    database: process.env.DATABASE_NAME || 'yyc3_catering',
    dialect: process.env.DATABASE_DIALECT || 'mysql',
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '123456',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // RabbitMQ配置
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    user: process.env.RABBITMQ_USER || 'admin',
    password: process.env.RABBITMQ_PASSWORD || '123456',
    vhost: process.env.RABBITMQ_VHOST || '/yyc3',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // API配置
  api: {
    prefix: process.env.API_PREFIX || '/api/v1',
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
};
