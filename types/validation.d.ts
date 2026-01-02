// types/validation.d.ts
// 导入统一类型定义
/// <reference path="./unified.d.ts" />

// 保持向后兼容性 - 将 IntelligentHub 命名空间指向 YYC3CateringPlatform
declare namespace IntelligentHub {
  // 基础验证规则
  type BaseValidation = YYC3CateringPlatform.BaseValidation;
  // 数字验证
  type NumberValidation = YYC3CateringPlatform.NumberValidation;
  // 日期验证
  type DateValidation = YYC3CateringPlatform.DateValidation;
  // 文件验证
  type FileValidation = YYC3CateringPlatform.FileValidation;
  // 业务验证规则
  type BusinessValidation = YYC3CateringPlatform.BusinessValidation;
}