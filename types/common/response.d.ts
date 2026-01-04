/**
 * @file 通用响应类型定义
 * @description 统一的 API 响应格式
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 基础响应接口
 */
export interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  requestId: string;
}

/**
 * 成功响应
 */
export interface SuccessResponse<T = unknown> extends BaseResponse<T> {
  success: true;
  data: T;
}

/**
 * 失败响应
 */
export interface FailureResponse extends BaseResponse {
  success: false;
  error: string;
}

/**
 * 分页结果
 */
export interface PaginationResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T = unknown> extends BaseResponse<PaginationResult<T>> {
  success: true;
  data: PaginationResult<T>;
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse<T = unknown> {
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
