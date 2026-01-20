/**
 * @file YYC³餐饮平台类型定义
 * @description 统一类型定义入口文件
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-19
 */

// ==================== 实体类型 ====================
export * from './entities/user';
export * from './entities/order';
export * from './entities/menu';
export * from './entities/payment';
export * from './entities/table';

// ==================== 服务类型 ====================
export * from './services/api';
export * from './services/cache';
export * from './services/kafka';
export * from './services/gateway';
export * from './services/key-manager';

// ==================== 通用类型 ====================
export * from './common/error';
export * from './common/validation';
export * from './common/pagination';
export * from './common/response';

// ==================== 配置类型 ====================
export * from './config/database';
export * from './config/service';
export * from './config/auth';

// ==================== 工具类型 ====================
export * from './utils/type-converter';

// ==================== 其他类型 ====================
export * from './global';
export * from './unified';
export * from './validation';
export * from './api-versioning';
