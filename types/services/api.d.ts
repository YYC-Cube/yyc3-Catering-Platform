/**
 * @file API 通用类型定义
 * @description 服务间通信和 API 响应类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * API 响应基础接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
  requestId: string;
}

/**
 * API 错误接口
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
  field?: string;
}

/**
 * 分页数据接口
 */
export interface PageData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> extends ApiResponse<PageData<T>> {}

/**
 * 分页查询参数
 */
export interface PageQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  keyword?: string;
}

/**
 * 批量操作结果
 */
export interface BatchResult<T = unknown> {
  success: number;
  failed: number;
  total: number;
  results: Array<{
    id: string;
    success: boolean;
    message?: string;
    data?: T;
  }>;
}

/**
 * 排序参数
 */
export interface SortOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * 筛选条件
 */
export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like';
  value: unknown;
}

/**
 * 查询请求
 */
export interface QueryRequest {
  page?: PageQuery;
  filters?: FilterCondition[];
  sort?: SortOrder[];
  fields?: string[];
}
