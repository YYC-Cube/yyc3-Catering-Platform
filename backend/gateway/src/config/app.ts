/**
 * YYC³餐饮行业智能化平台 - 应用配置
 */

import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

export const config = {
  app: {
    name: process.env.APP_NAME || 'YYC3 API Gateway',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3101'),
    timezone: process.env.TIMEZONE || 'Asia/Shanghai'
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true
  },

  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // 每15分钟1000次请求
    windowMs: 15 * 60 * 1000 // 15分钟
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'yyc3_catering',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000')
    }
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    database: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'yyc3:',
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3')
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },

  services: {
    aiAssistant: {
      url: process.env.AI_ASSISTANT_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AI_ASSISTANT_TIMEOUT || '30000'),
      retries: parseInt(process.env.AI_ASSISTANT_RETRIES || '3')
    },
    smartKitchen: {
      url: process.env.SMART_KITCHEN_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.SMART_KITCHEN_TIMEOUT || '30000'),
      retries: parseInt(process.env.SMART_KITCHEN_RETRIES || '3')
    },
    chainOperation: {
      url: process.env.CHAIN_OPERATION_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.CHAIN_OPERATION_TIMEOUT || '30000'),
      retries: parseInt(process.env.CHAIN_OPERATION_RETRIES || '3')
    },
    foodSafety: {
      url: process.env.FOOD_SAFETY_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.FOOD_SAFETY_TIMEOUT || '30000'),
      retries: parseInt(process.env.FOOD_SAFETY_RETRIES || '3')
    },
    o2oSystem: {
      url: process.env.O2O_SYSTEM_URL || 'http://localhost:3005',
      timeout: parseInt(process.env.O2O_SYSTEM_TIMEOUT || '30000'),
      retries: parseInt(process.env.O2O_SYSTEM_RETRIES || '3')
    }
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    organizationId: process.env.OPENAI_ORGANIZATION_ID || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
  },

  claude: {
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '2000')
  },

  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    },
    from: process.env.EMAIL_FROM || 'noreply@yyc3.com'
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'aliyun',
    accessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || 'YYC3',
    templateCode: process.env.SMS_TEMPLATE_CODE || ''
  },

  payment: {
    wechat: {
      appId: process.env.WECHAT_APP_ID || '',
      mchId: process.env.WECHAT_MCH_ID || '',
      apiKey: process.env.WECHAT_API_KEY || '',
      notifyUrl: process.env.WECHAT_NOTIFY_URL || ''
    },
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      notifyUrl: process.env.ALIPAY_NOTIFY_URL || ''
    }
  },

  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metricsPath: process.env.METRICS_PATH || '/metrics',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    path: process.env.SWAGGER_PATH || '/docs',
    title: process.env.SWAGGER_TITLE || 'YYC³餐饮行业智能化平台 API文档',
    description: process.env.SWAGGER_DESCRIPTION || 'API接口文档',
    version: process.env.SWAGGER_VERSION || '1.0.0'
  },

  cache: {
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1小时
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600'), // 10分钟
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000')
  }
}

// 验证必需的环境变量
export const validateConfig = (): void => {
  const requiredEnvVars = ['JWT_SECRET']

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }
}

// 开发环境配置检查
if (config.app.environment === 'development') {
  console.log('🔧 Development mode enabled')
  console.log('📊 Configuration:', {
    app: config.app,
    services: Object.keys(config.services),
    environment: config.app.environment
  })
}