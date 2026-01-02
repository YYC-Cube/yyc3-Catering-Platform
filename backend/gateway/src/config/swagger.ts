/**
 * @file Swagger配置
 * @description YYC³餐饮行业智能化平台 - API文档配置
 * @module config/swagger
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './app';
import { logger } from '../utils/logger';

/**
 * Swagger定义配置
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: config.swagger.title,
    description: config.swagger.description,
    version: config.swagger.version,
    contact: {
      name: 'YYC³ Team',
      email: 'support@yyc3.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://${config.app.host}:${config.app.port}`,
      description: config.app.environment === 'development' ? 'Development Server' : 'Production Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          },
          code: {
            type: 'string',
            example: 'ERROR_CODE'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Success message'
          },
          data: {
            type: 'object'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z'
          }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Unauthorized',
              code: 'UNAUTHORIZED',
              timestamp: '2023-01-01T12:00:00Z'
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Forbidden',
              code: 'FORBIDDEN',
              timestamp: '2023-01-01T12:00:00Z'
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Resource not found',
              code: 'NOT_FOUND',
              timestamp: '2023-01-01T12:00:00Z'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Internal server error',
              code: 'INTERNAL_SERVER_ERROR',
              timestamp: '2023-01-01T12:00:00Z'
            }
          }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Health Check',
      description: 'API health check endpoints'
    },
    {
      name: 'AI Assistant',
      description: 'AI assistant service endpoints'
    },
    {
      name: 'Smart Kitchen',
      description: 'Smart kitchen service endpoints'
    },
    {
      name: 'Chain Operation',
      description: 'Chain operation service endpoints'
    },
    {
      name: 'Food Safety',
      description: 'Food safety service endpoints'
    },
    {
      name: 'O2O System',
      description: 'O2O system service endpoints'
    }
  ]
};

/**
 * Swagger JSDoc配置选项
 */
const options = {
  swaggerDefinition,
  // 扫描所有API文件
  apis: ['src/**/*.ts']
};

/**
 * 设置Swagger文档
 */
export const setupSwagger = (app: express.Application): void => {
  try {
    // 生成Swagger文档
    const specs = swaggerJsdoc(options);

    // 配置Swagger UI
    app.use(config.swagger.path, swaggerUi.serve, swaggerUi.setup(specs, {
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        docExpansion: 'none',
        displayRequestDuration: true,
        showExtensions: true,
        showCommonExtensions: true
      },
      customCss: '.swagger-ui .topbar { background-color: #007bff; }'
    }));

    logger.info('Swagger documentation configured', {
      path: config.swagger.path,
      environment: config.app.environment
    });
  } catch (error) {
    logger.error('Failed to configure Swagger documentation', { error });
    // Swagger配置失败不影响应用正常运行
  }
};
