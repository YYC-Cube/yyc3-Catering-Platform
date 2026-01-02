// types/global.d.ts
// 导入统一类型定义
/// <reference path="./unified.d.ts" />

// 保持向后兼容性 - 将 IntelligentHub 命名空间指向 YYC3CateringPlatform
declare namespace IntelligentHub {
  // 基础响应接口
  type BaseResponse<T = any> = YYC3CateringPlatform.BaseResponse<T>;
  // 分页响应接口
  type PaginatedResponse<T = any> = YYC3CateringPlatform.PaginatedResponse<T>;
  // 分页结果
  type PageResult<T = any> = YYC3CateringPlatform.PageResult<T>;
  // 错误响应接口
  type ErrorResponse = YYC3CateringPlatform.ErrorResponse;
  // 验证错误接口
  type ValidationError = YYC3CateringPlatform.ValidationError;
  // 排序参数
  type SortOrder = YYC3CateringPlatform.SortOrder;
  // 分页查询参数
  type PageQuery = YYC3CateringPlatform.PageQuery;
  // 时间范围查询
  type TimeRangeQuery = YYC3CateringPlatform.TimeRangeQuery;
  // 批量操作响应
  type BatchResponse<T = any> = YYC3CateringPlatform.BatchResponse<T>;
}