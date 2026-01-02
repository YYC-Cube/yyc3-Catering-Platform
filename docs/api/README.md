# YYC³ 餐饮平台 API 文档

欢迎使用 YYC³ 餐饮平台的 API 文档。本文档详细描述了平台提供的所有 API 接口，包括请求参数、响应格式、错误码等信息。

## 文档结构

- [API 网关](/docs/api/api-gateway.md) - API 网关的接口和配置
- [用户服务](/docs/api/user-service.md) - 用户管理相关接口
- [餐厅服务](/docs/api/restaurant-service.md) - 餐厅和菜品管理接口
- [订单服务](/docs/api/order-service.md) - 订单管理接口
- [通知服务](/docs/api/notification-service.md) - 通知管理接口
- [支付服务](/docs/api/payment-service.md) - 支付相关接口

## 认证方式

平台使用 JWT (JSON Web Token) 进行认证。获取令牌后，需要在请求头中添加 `Authorization: Bearer <token>`。

## 统一响应格式

所有 API 接口的响应格式统一如下：

```json
{
  "success": true,  // 请求是否成功
  "data": {},       // 响应数据（请求成功时）
  "error": "",     // 错误信息（请求失败时）
  "code": "",      // 错误码（请求失败时）
  "timestamp": ""  // 响应时间戳
}
```

## 错误码

| 错误码 | 描述 |
|-------|------|
| UNAUTHORIZED | 未授权访问 |
| FORBIDDEN | 权限不足 |
| NOT_FOUND | 资源不存在 |
| BAD_REQUEST | 请求参数错误 |
| INTERNAL_SERVER_ERROR | 服务器内部错误 |
| TOO_MANY_REQUESTS | 请求过于频繁 |

## 版本控制

API 版本通过 URL 路径进行控制，例如：`/api/v1/users`。

## 联系我们

如有任何问题或建议，请联系 YYC³ 团队。

## 更新日志

- v1.0.0 (2025-01-30) - 初始版本
