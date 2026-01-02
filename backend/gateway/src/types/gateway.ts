/**
 * @fileoverview YYC³ API网关类型定义
 * @description 网关相关的TypeScript类型接口定义
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-08
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export interface GatewayConfig {
  server: ServerConfig;
  serviceRegistry: ServiceRegistryConfig;
  authentication: AuthenticationConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
  cors: CorsConfig;
  routes: RouteConfig[];
  cache: CacheConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  errorHandling: ErrorHandlingConfig;
}

export interface ServerConfig {
  host: string;
  port: number;
  env: string;
}

export interface ServiceRegistryConfig {
  enabled: boolean;
  type: 'consul' | 'etcd' | 'eureka';
  consul?: ConsulConfig;
  etcd?: EtcdConfig;
  eureka?: EurekaConfig;
}

export interface ConsulConfig {
  host: string;
  port: number;
  serviceName: string;
  healthCheckInterval: number;
  healthCheckTimeout: number;
}

export interface EtcdConfig {
  hosts: string[];
  serviceName: string;
  ttl: number;
}

export interface EurekaConfig {
  host: string;
  port: number;
  serviceName: string;
  instanceId: string;
}

export interface AuthenticationConfig {
  enabled: boolean;
  jwt: JWTConfig;
  excludePaths: string[];
}

export interface JWTConfig {
  secret: string;
  algorithms: string[];
  issuer: string;
  audience: string;
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (req: any) => string;
  // 新增：限流策略类型
  strategy?: 'fixed' | 'sliding' | 'adaptive' | 'token-bucket';
  // 新增：IP白名单
  whitelist?: string[];
  // 新增：限流响应配置
  response?: {
    statusCode: number;
    message: string;
  };
  // 新增：路由级别的限流配置
  routeSpecific?: Record<string, {
    maxRequests: number;
    windowMs: number;
  }>;
}

// 加密配置
export interface EncryptionConfig {
  enabled: boolean;
  keyStorePath?: string;
  keyExpiration?: number;
  autoRotate?: boolean;
  rotationInterval?: number;
  backupStrategy?: 'keep_all' | 'keep_last_7_days' | 'keep_last_30_days';
  excludedPaths?: string[];
  includedPaths?: string[];
}

export interface LoggingConfig {
  level: string;
  format: 'json' | 'text';
  requestIdHeader: string;
  requestLogging: RequestLoggingConfig;
  responseLogging: ResponseLoggingConfig;
}

export interface RequestLoggingConfig {
  enabled: boolean;
  includeHeaders: string[];
  includeBody: boolean;
}

export interface ResponseLoggingConfig {
  enabled: boolean;
  includeHeaders: string[];
  includeBody: boolean;
}

export interface CorsConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

export interface RouteConfig {
  path: string;
  target: string;
  methods: string[];
  timeout: number;
  retries: number;
  authentication?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
  };
  circuitBreaker?: {
    enabled: boolean;
    threshold: number;
    timeout: number;
  };
}

export interface CacheConfig {
  enabled: boolean;
  type: 'redis' | 'memory';
  redis?: RedisConfig;
  memory?: MemoryCacheConfig;
  ttl: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  ttl: number;
}

export interface MemoryCacheConfig {
  maxSize: number;
  ttl: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricsConfig;
  healthCheck: HealthCheckConfig;
  alerts: AlertingConfig;
  rootCauseAnalysis: RootCauseAnalysisConfig;
}

export interface MetricsConfig {
  enabled: boolean;
  path: string;
  labels: Record<string, string>;
  collectionInterval: number;
  retentionDays: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  path: string;
  interval: number;
  timeout: number;
  retryCount: number;
}

export interface AlertingConfig {
  enabled: boolean;
  rules: AlertRule[];
  notifications: NotificationConfig;
  muteIntervals: MuteInterval[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'notification' | 'webhook' | 'log';
  target: string;
  template?: string;
}

export interface NotificationConfig {
  email?: EmailNotificationConfig;
  webhook?: WebhookNotificationConfig;
  sms?: SMSNotificationConfig;
}

export interface EmailNotificationConfig {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
}

export interface WebhookNotificationConfig {
  enabled: boolean;
  url: string;
  headers?: Record<string, string>;
}

export interface SMSNotificationConfig {
  enabled: boolean;
  provider: string;
  apiKey: string;
  phoneNumbers: string[];
}

export interface MuteInterval {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  reason: string;
}

export interface RootCauseAnalysisConfig {
  enabled: boolean;
  correlationInterval: number;
  maxCandidates: number;
  autoRemediation: boolean;
  remediationRules: RemediationRule[];
}

export interface RemediationRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface SecurityConfig {
  helmet: HelmetConfig;
  compression: CompressionConfig;
}

export interface HelmetConfig {
  enabled: boolean;
  contentSecurityPolicy: {
    directives: Record<string, string[]>;
  };
}

export interface CompressionConfig {
  enabled: boolean;
  threshold: number;
  level: number;
}

export interface ErrorHandlingConfig {
  enabled: boolean;
  logging: boolean;
  includeStackTrace: boolean;
  defaultResponse: {
    success: boolean;
    error: string;
    code: string;
    timestamp: boolean;
  };
}

export interface ServiceHealth {
  service: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureTime?: Date;
  nextAttempt?: Date;
}

export interface GatewayMetrics {
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
  services: Record<string, ServiceMetrics>;
}

export interface ServiceMetrics {
  requests: number;
  errors: number;
  averageResponseTime: number;
  lastRequest: Date;
}

export interface RequestContext {
  id: string;
  startTime: number;
  method: string;
  path: string;
  headers: Record<string, string>;
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface ServiceRequest {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
  query: Record<string, string>;
}

export interface ServiceResponse {
  status: number;
  headers: Record<string, string>;
  body?: any;
}

export interface ProxyError extends Error {
  code: string;
  statusCode: number;
  service?: string;
  originalError?: Error;
}