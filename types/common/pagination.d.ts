/**
 * @file 分页类型定义
 * @description 分页查询相关类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 排序方向
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * 排序参数
 */
export interface SortParam {
  field: string;
  direction: SortDirection;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortDirection;
  keyword?: string;
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
 * 时间范围查询
 */
export interface TimeRangeQuery {
  startTime?: Date | string;
  endTime?: Date | string;
}

/**
 * 范围查询
 */
export interface RangeQuery {
  min?: number | Date;
  max?: number | Date;
}
