/**
 * YYC³餐饮行业智能化平台 - 多租户中间件
 * 处理租户识别、权限验证、数据隔离
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getDatabaseManager } from '../config/database';

export interface TenantContext {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: Record<string, any>;
  limits: {
    maxUsers: number;
    maxOrders: number;
    maxStorage: number;
  };
  subscription: {
    plan: string;
    expiresAt: Date;
    features: string[];
  };
  createdAt?: Date;
}

export interface AuthenticatedRequest extends Request {
  tenant?: TenantContext;
  user?: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

export class TenantMiddleware {
  private logger;
  private tenantCache: Map<string, TenantContext> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5分钟缓存

  constructor() {
    this.logger = logger;
  }

  /**
   * 主要中间件函数
   */
  middleware() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        // 跳过不需要租户验证的路径
        if (this.isPublicPath(req.path)) {
          return next();
        }

        // 提取租户信息
        const tenant = await this.extractTenant(req);
        if (!tenant) {
          return res.status(400).json({
            code: 400,
            message: 'Tenant information is required',
            timestamp: Date.now(),
            success: false
          });
        }

        // 验证租户状态
        if (!this.isValidTenant(tenant)) {
          return res.status(403).json({
            code: 403,
            message: 'Tenant is not active',
            timestamp: Date.now(),
            success: false
          });
        }

        // 检查订阅限制
        if (!await this.checkSubscriptionLimits(tenant, req)) {
          return res.status(429).json({
            code: 429,
            message: 'Tenant subscription limits exceeded',
            timestamp: Date.now(),
            success: false
          });
        }

        // 将租户信息附加到请求对象
        req.tenant = tenant;

        // 设置数据库租户上下文
        this.setDatabaseTenantContext(tenant);

        this.logger.debug(`Tenant context set: ${tenant.id} (${tenant.name})`);

        next();

      } catch (error) {
        this.logger.error('Tenant middleware error:', error);
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
          timestamp: Date.now(),
          success: false
        });
      }
    };
  }

  /**
   * 提取租户信息
   */
  private async extractTenant(req: Request): Promise<TenantContext | null> {
    let tenantId: string | null = null;

    // 1. 从Header中提取（优先级最高）
    const tenantHeader = req.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      tenantId = tenantHeader;
    }

    // 2. 从子域名中提取
    if (!tenantId && req.hostname) {
      const subdomain = this.extractSubdomain(req.hostname);
      if (subdomain) {
        tenantId = await this.getTenantIdBySubdomain(subdomain);
      }
    }

    // 3. 从JWT Token中提取
    if (!tenantId && req.headers.authorization) {
      tenantId = await this.extractTenantFromToken(req.headers.authorization);
    }

    // 4. 从查询参数中提取（仅用于开发环境）
    if (!tenantId && process.env.NODE_ENV === 'development') {
      tenantId = req.query.tenant as string;
    }

    if (!tenantId) {
      return null;
    }

    // 从缓存或数据库获取租户信息
    return await this.getTenantById(tenantId);
  }

  /**
   * 从缓存或数据库获取租户信息
   */
  private async getTenantById(tenantId: string): Promise<TenantContext | null> {
    // 检查缓存
    const cached = this.tenantCache.get(tenantId);
    if (cached && cached.createdAt && Date.now() - cached.createdAt.getTime() < this.cacheTimeout) {
      return cached;
    }

    try {
      const db = getDatabaseManager();
      const result = await db.query(
        `SELECT
          id, name, code, status, settings, limits,
          subscription_plan as plan, subscription_expires_at as expiresAt,
          subscription_features as features
        FROM tenants
        WHERE id = $1 AND deleted_at IS NULL`,
        [tenantId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const tenant: TenantContext = {
        id: row.id,
        name: row.name,
        code: row.code,
        status: row.status,
        settings: row.settings || {},
        limits: row.limits || {
          maxUsers: 100,
          maxOrders: 1000,
          maxStorage: 1073741824 // 1GB
        },
        subscription: {
          plan: row.plan || 'basic',
          expiresAt: row.expiresAt || new Date(),
          features: row.features || []
        },
        createdAt: new Date()
      };

      // 更新缓存
      this.tenantCache.set(tenantId, tenant);

      return tenant;

    } catch (error) {
      this.logger.error('Failed to get tenant by ID:', error);
      return null;
    }
  }

  /**
   * 验证租户状态
   */
  private isValidTenant(tenant: TenantContext): boolean {
    return tenant.status === 'active' && new Date() < tenant.subscription.expiresAt;
  }

  /**
   * 检查订阅限制
   */
  private async checkSubscriptionLimits(tenant: TenantContext, req: Request): Promise<boolean> {
    try {
      const db = getDatabaseManager();

      // 检查用户数量限制
      const userCount = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE tenant_id = $1 AND deleted_at IS NULL',
        [tenant.id]
      );

      if (userCount.rows[0].count >= tenant.limits.maxUsers) {
        // 如果是创建用户请求，拒绝
        if (req.path.includes('/users') && req.method === 'POST') {
          return false;
        }
      }

      // 检查订单数量限制
      const orderCount = await db.query(
        'SELECT COUNT(*) as count FROM orders WHERE tenant_id = $1 AND created_at >= $2',
        [tenant.id, new Date(new Date().setDate(1)).toISOString()] // 本月订单
      );

      if (orderCount.rows[0].count >= tenant.limits.maxOrders) {
        // 如果是创建订单请求，拒绝
        if (req.path.includes('/orders') && req.method === 'POST') {
          return false;
        }
      }

      return true;

    } catch (error) {
      this.logger.error('Failed to check subscription limits:', error);
      return true; // 出错时允许继续，避免阻塞正常业务
    }
  }

  /**
   * 设置数据库租户上下文
   */
  private setDatabaseTenantContext(tenant: TenantContext): void {
    // 这里可以设置一些全局变量或环境变量
    // 供后续的数据库操作使用
    process.env.TENANT_ID = tenant.id;
    process.env.TENANT_NAME = tenant.name;
  }

  /**
   * 提取子域名
   */
  private extractSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');

    // 移除常见的域名后缀
    const commonSuffixes = ['com', 'net', 'org', 'cn', 'localhost'];

    if (parts.length > 2) {
      const potentialSubdomain = parts[0];

      // 排除常见的子域名
      const excludeSubdomains = ['www', 'api', 'admin', 'app', 'm'];

      if (!excludeSubdomains.includes(potentialSubdomain)) {
        return potentialSubdomain;
      }
    }

    return null;
  }

  /**
   * 根据子域名获取租户ID
   */
  private async getTenantIdBySubdomain(subdomain: string): Promise<string | null> {
    try {
      const db = getDatabaseManager();
      const result = await db.query(
        'SELECT id FROM tenants WHERE code = $1 AND deleted_at IS NULL',
        [subdomain]
      );

      return result.rows.length > 0 ? result.rows[0].id : null;

    } catch (error) {
      this.logger.error('Failed to get tenant ID by subdomain:', error);
      return null;
    }
  }

  /**
   * 从JWT Token中提取租户ID
   */
  private async extractTenantFromToken(authorization: string): Promise<string | null> {
    try {
      const token = authorization.replace('Bearer ', '');

      // 这里应该使用JWT库解析token
      // 简化处理，实际应该验证token签名
      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload.tenantId || null;

    } catch (error) {
      this.logger.error('Failed to extract tenant from token:', error);
      return null;
    }
  }

  /**
   * 判断是否为公共路径
   */
  private isPublicPath(path: string): boolean {
    const publicPaths = [
      '/health',
      '/metrics',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/docs',
      '/api-docs',
      '/static',
      '/favicon.ico'
    ];

    return publicPaths.some(publicPath =>
      path === publicPath || path.startsWith(publicPath + '/')
    );
  }

  /**
   * 清除缓存
   */
  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.tenantCache.delete(tenantId);
    } else {
      this.tenantCache.clear();
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.tenantCache.size,
      keys: Array.from(this.tenantCache.keys())
    };
  }
}

// 创建中间件实例
export const tenantMiddleware = new TenantMiddleware().middleware();

// 导出其他功能
export const tenantUtils = {
  clearCache: (tenantId?: string) => {
    const middleware = new TenantMiddleware();
    middleware.clearCache(tenantId);
  },

  getCacheStats: () => {
    const middleware = new TenantMiddleware();
    return middleware.getCacheStats();
  }
};