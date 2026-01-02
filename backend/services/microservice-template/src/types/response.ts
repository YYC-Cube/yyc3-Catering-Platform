/**
 * @fileoverview API响应类型定义
 * @description 定义API响应的类型和格式
 * @module types/response
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  /**
   * 响应状态码
   */
  code: number;
  
  /**
   * 响应消息
   */
  message: string;
  
  /**
   * 响应数据
   */
  data?: T;
  
  /**
   * 时间戳
   */
  timestamp: string;
  
  /**
   * 跟踪ID
   */
  traceId?: string;
}

/**
 * 分页响应接口
 */
export interface PaginationResponse<T = any> {
  /**
   * 数据列表
   */
  items: T[];
  
  /**
   * 当前页码
   */
  page: number;
  
  /**
   * 每页大小
   */
  limit: number;
  
  /**
   * 总记录数
   */
  total: number;
  
  /**
   * 总页数
   */
  totalPages: number;
  
  /**
   * 是否有下一页
   */
  hasNext: boolean;
  
  /**
   * 是否有上一页
   */
  hasPrevious: boolean;
}

/**
 * 分页请求参数接口
 */
export interface PaginationParams {
  /**
   * 页码
   */
  page?: number;
  
  /**
   * 每页大小
   */
  limit?: number;
}

/**
 * 排序参数接口
 */
export interface SortParams {
  /**
   * 排序字段
   */
  sortBy?: string;
  
  /**
   * 排序方向
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 过滤参数接口
 */
export interface FilterParams {
  /**
   * 过滤条件
   */
  [key: string]: any;
}
