/**
 * @file 认证配置类型定义
 * @description 认证和授权相关配置
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * JWT 配置
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn?: string;
  issuer?: string;
  audience?: string;
}

/**
 * OAuth 配置
 */
export interface OAuthConfig {
  provider: 'google' | 'facebook' | 'github' | 'wechat';
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope?: string[];
}

/**
 * 认证配置
 */
export interface AuthConfig {
  jwt?: JwtConfig;
  oauth?: OAuthConfig[];
  session?: {
    enabled: boolean;
    secret?: string;
    maxAge?: number;
  };
  password?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}
