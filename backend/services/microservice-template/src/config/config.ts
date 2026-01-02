/**
 * @fileoverview 微服务主配置文件
 * @description 集中管理微服务的所有配置项
 * @module config
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 微服务配置
 */
const config = {
  /**
   * 服务信息
   */
  service: {
    /**
     * 服务名称
     */
    name: process.env.SERVICE_NAME || 'microservice-template',
    
    /**
     * 服务版本
     */
    version: process.env.SERVICE_VERSION || '1.0.0',
    
    /**
     * 服务环境
     */
    env: process.env.NODE_ENV || 'development',
  },
  
  /**
   * 服务器配置
   */
  server: {
    /**
     * 监听端口
     */
    port: Number(process.env.PORT) || 3000,
    
    /**
     * 主机地址
     */
    host: process.env.HOST || '0.0.0.0',
  },
  
  /**
   * API配置
   */
  api: {
    /**
     * API基础路径
     */
    basePath: process.env.API_BASE_PATH || '/api/v1',
    
    /**
     * API版本
     */
    version: '1.0.0',
  },
  
  /**
   * 数据库配置
   */
  database: {
    /**
     * 数据库连接URL
     */
    url: process.env.DATABASE_URL,
    
    /**
     * 是否同步数据库模型
     */
    sync: process.env.DATABASE_SYNC === 'true',
    
    /**
     * 是否启用日志
     */
    logging: process.env.DATABASE_LOGGING === 'true',
    
    /**
     * 连接池配置
     */
    pool: {
      min: Number(process.env.DATABASE_POOL_MIN) || 2,
      max: Number(process.env.DATABASE_POOL_MAX) || 10,
      acquire: Number(process.env.DATABASE_POOL_ACQUIRE) || 30000,
      idle: Number(process.env.DATABASE_POOL_IDLE) || 10000,
    },
  },
  
  /**
   * CORS配置
   */
  cors: {
    /**
     * 允许的来源
     */
    origins: process.env.CORS_ORIGINS?.split(',') || ['*'],
    
    /**
     * 允许的方法
     */
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
    /**
     * 允许的头
     */
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  },
  
  /**
   * Helmet配置
   */
  helmet: {
    /**
     * 启用内容安全策略
     */
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
    
    /**
     * 启用HSTS
     */
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  },
  
  /**
   * 请求配置
   */
  request: {
    /**
     * 请求体大小限制
     */
    limit: process.env.REQUEST_LIMIT || '10mb',
  },
  
  /**
   * 分页配置
   */
  pagination: {
    /**
     * 默认页大小
     */
    defaultLimit: Number(process.env.PAGINATION_DEFAULT_LIMIT) || 10,
    
    /**
     * 最大页大小
     */
    maxLimit: Number(process.env.PAGINATION_MAX_LIMIT) || 100,
  },
  
  /**
   * 认证配置
   */
  auth: {
    /**
     * JWT密钥
     */
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    
    /**
     * JWT过期时间
     */
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    
    /**
     * 刷新令牌过期时间
     */
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  },
  
  /**
   * 日志配置
   */
  logger: {
    /**
     * 日志级别
     */
    level: process.env.LOG_LEVEL || 'info',
    
    /**
     * 是否输出到文件
     */
    fileTransport: process.env.LOG_FILE_TRANSPORT === 'true',
    
    /**
     * 日志文件路径
     */
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
};

export default config;
