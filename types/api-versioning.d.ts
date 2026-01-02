// types/api-versioning.d.ts
// 导入统一类型定义
/// <reference path="./unified.d.ts" />

// 保持向后兼容性 - 将 IntelligentHub 命名空间指向 YYC3CateringPlatform
declare namespace IntelligentHub {
  // API版本控制
  type APIVersion = YYC3CateringPlatform.APIVersion;
  // 版本化响应
  type VersionedResponse<T = any> = YYC3CateringPlatform.VersionedResponse<T>;
  // API配置
  type APIConfig = YYC3CateringPlatform.APIConfig;
}