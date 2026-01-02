# 通知服务 API 文档

## 概述

通知服务负责发送和管理各种类型的通知，包括短信、邮件和推送通知。

## 基础信息

- 服务名称：notification-service
- 默认端口：3203
- 环境变量：
  - `PORT`：服务端口
  - `SERVICE_NAME`：服务名称
  - `NODE_ENV`：运行环境
  - `DB_HOST`：数据库主机
  - `DB_PORT`：数据库端口
  - `DB_NAME`：数据库名称
  - `DB_USER`：数据库用户名
  - `DB_PASSWORD`：数据库密码
  - `RABBITMQ_URL`：RabbitMQ 连接 URL
  - `SMTP_HOST`：SMTP 服务器地址
  - `SMTP_PORT`：SMTP 服务器端口
  - `SMTP_USER`：SMTP 用户名
  - `SMTP_PASSWORD`：SMTP 密码
  - `SMS_API_KEY`：短信 API 密钥
  - `PUSH_API_KEY`：推送 API 密钥

## 认证

所有接口都需要认证，认证方式为 JWT。

## 接口列表

### 创建通知

**请求**
- 方法：POST
- 路径：/api/notifications
- 认证：需要
- 请求体：

```json
{
  "userId": "string",
  "type": "order_created",
  "title": "订单创建成功",
  "content": "您的订单已成功创建，订单号：123456",
  "data": {
    "orderId": "123456",
    "orderAmount": 99.9
  },
  "channels": ["email", "sms", "push"]
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "type": "order_created",
    "title": "订单创建成功",
    "content": "您的订单已成功创建，订单号：123456",
    "data": {
      "orderId": "123456",
      "orderAmount": 99.9
    },
    "channels": ["email", "sms", "push"],
    "status": "pending",
    "createdAt": "2025-01-30T08:00:00Z",
    "updatedAt": "2025-01-30T08:00:00Z"
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

### 获取用户通知列表

**请求**
- 方法：GET
- 路径：/api/notifications
- 认证：需要
- 查询参数：
  - `page`：页码（默认 1）
  - `pageSize`：每页数量（默认 20）
  - `status`：通知状态（可选：pending, sent, failed）
  - `type`：通知类型（可选）

**响应**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "order_created",
        "title": "订单创建成功",
        "content": "您的订单已成功创建，订单号：123456",
        "status": "sent",
        "read": true,
        "createdAt": "2025-01-30T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

### 获取通知详情

**请求**
- 方法：GET
- 路径：/api/notifications/:id
- 认证：需要
- 路径参数：
  - `id`：通知 ID

**响应**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "type": "order_created",
    "title": "订单创建成功",
    "content": "您的订单已成功创建，订单号：123456",
    "data": {
      "orderId": "123456",
      "orderAmount": 99.9
    },
    "channels": ["email", "sms", "push"],
    "status": "sent",
    "read": true,
    "createdAt": "2025-01-30T08:00:00Z",
    "updatedAt": "2025-01-30T08:01:00Z"
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

### 标记通知为已读

**请求**
- 方法：PUT
- 路径：/api/notifications/:id/read
- 认证：需要
- 路径参数：
  - `id`：通知 ID

**响应**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "read": true
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

### 标记所有通知为已读

**请求**
- 方法：PUT
- 路径：/api/notifications/read-all
- 认证：需要

**响应**

```json
{
  "success": true,
  "data": {
    "count": 10
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

### 获取用户通知偏好

**请求**
- 方法：GET
- 路径：/api/notifications/preferences
- 认证：需要

**响应**

```json
{
  "success": true,
  "data": {
    "orderCreated": true,
    "orderUpdated": true,
    "orderCancelled": true,
    "paymentSuccess": true,
    "paymentFailed": true,
    "promotion": true,
    "system": true,
    "enableEmail": true,
    "enableSms": false,
    "enablePush": true
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

### 更新用户通知偏好

**请求**
- 方法：PUT
- 路径：/api/notifications/preferences
- 认证：需要
- 请求体：

```json
{
  "orderCreated": true,
  "orderUpdated": true,
  "orderCancelled": true,
  "paymentSuccess": true,
  "paymentFailed": true,
  "promotion": false,
  "system": true,
  "enableEmail": true,
  "enableSms": true,
  "enablePush": true
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "orderCreated": true,
    "orderUpdated": true,
    "orderCancelled": true,
    "paymentSuccess": true,
    "paymentFailed": true,
    "promotion": false,
    "system": true,
    "enableEmail": true,
    "enableSms": true,
    "enablePush": true
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

### 发送测试通知

**请求**
- 方法：POST
- 路径：/api/notifications/test
- 认证：需要
- 请求体：

```json
{
  "channels": ["email", "sms", "push"]
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "message": "测试通知已发送"
  },
  "timestamp": "2025-01-30T08:00:00Z"
}
```

## 通知类型

| 类型 | 描述 |
|------|------|
| order_created | 订单创建 |
| order_updated | 订单更新 |
| order_cancelled | 订单取消 |
| order_delivered | 订单送达 |
| payment_success | 支付成功 |
| payment_failed | 支付失败 |
| promotion | 促销活动 |
| system | 系统通知 |
| review_request | 评价请求 |

## 通知渠道

| 渠道 | 描述 |
|------|------|
| email | 邮件 |
| sms | 短信 |
| push | 推送通知 |

## 联系我们

如有任何问题或建议，请联系 YYC³ 团队。
