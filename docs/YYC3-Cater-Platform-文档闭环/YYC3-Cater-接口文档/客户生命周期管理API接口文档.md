# YYC³餐饮行业智能化平台 - 客户生命周期管理API接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | YYC³餐饮行业智能化平台客户生命周期管理API接口文档 |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-01-20 |
| 最后更新 | 2026-01-20 |
| 文档状态 | 正式版 |

---

## 目录

1. [接口概述](#1-接口概述)
2. [通用说明](#2-通用说明)
3. [客户生命周期接口](#3-客户生命周期接口)
4. [RFM分析接口](#4-rfm分析接口)
5. [流失预测接口](#5-流失预测接口)
6. [关怀提醒接口](#6-关怀提醒接口)
7. [客户分群接口](#7-客户分群接口)
8. [客户标签接口](#8-客户标签接口)
9. [错误码说明](#9-错误码说明)
10. [附录](#10-附录)

---

## 1. 接口概述

### 1.1 接口说明

本文档描述YYC³餐饮行业智能化平台客户生命周期管理相关的API接口，包括客户生命周期管理、RFM分析、流失预测、关怀提醒、客户分群、客户标签等功能。

### 1.2 接口地址

- **测试环境**：`http://test-api.yyc3.com/api/v1`
- **生产环境**：`https://api.yyc3.com/api/v1`

### 1.3 认证方式

所有接口需要在请求头中携带认证Token：

```http
Authorization: Bearer {token}
```

---

## 2. 通用说明

### 2.1 请求格式

#### 2.1.1 GET请求

```http
GET /api/v1/customers?page=1&size=20
```

#### 2.1.2 POST请求

```http
POST /api/v1/customers
Content-Type: application/json

{
  "name": "张三",
  "phone": "13800138000"
}
```

#### 2.1.3 PUT请求

```http
PUT /api/v1/customers/{id}
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com"
}
```

#### 2.1.4 DELETE请求

```http
DELETE /api/v1/customers/{id}
```

### 2.2 响应格式

#### 2.2.1 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

#### 2.2.2 失败响应

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "name",
      "message": "客户名称不能为空"
    }
  ]
}
```

### 2.3 分页参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页数量，默认20 |

### 2.4 分页响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      // 数据列表
    ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

---

## 3. 客户生命周期接口

### 3.1 获取客户生命周期信息

#### 3.1.1 接口说明

获取指定客户的生命周期信息。

#### 3.1.2 请求方式

```http
GET /api/v1/customers/{customerId}/lifecycle
```

#### 3.1.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| customerId | string | path | 是 | 客户ID |

#### 3.1.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "lifecycle-001",
    "customerId": "customer-001",
    "currentStage": "active",
    "previousStage": "new",
    "stageChangedAt": "2026-01-15T00:00:00Z",
    "daysInCurrentStage": 5,
    "totalDaysInLifecycle": 30,
    "metadata": {
      "rfmScore": 12,
      "customerLevel": "VIP"
    },
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-20T00:00:00Z"
  }
}
```

### 3.2 更新客户生命周期阶段

#### 3.2.1 接口说明

手动更新客户的生命周期阶段。

#### 3.2.2 请求方式

```http
PUT /api/v1/customers/{customerId}/lifecycle/stage
```

#### 3.2.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| customerId | string | path | 是 | 客户ID |
| stage | string | body | 是 | 新阶段 |
| reason | string | body | 是 | 变更原因 |

#### 3.2.4 请求示例

```json
{
  "stage": "loyal",
  "reason": "客户消费频次和金额达到忠诚客户标准"
}
```

#### 3.2.5 响应示例

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "lifecycle-001",
    "customerId": "customer-001",
    "currentStage": "loyal",
    "previousStage": "active",
    "stageChangedAt": "2026-01-20T00:00:00Z",
    "daysInCurrentStage": 0,
    "totalDaysInLifecycle": 35
  }
}
```

### 3.3 获取生命周期阶段历史

#### 3.3.1 接口说明

获取客户的生命周期阶段变更历史。

#### 3.3.2 请求方式

```http
GET /api/v1/customers/{customerId}/lifecycle/history
```

#### 3.3.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| customerId | string | path | 是 | 客户ID |
| page | number | query | 否 | 页码 |
| size | number | query | 否 | 每页数量 |

#### 3.3.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "history-001",
        "lifecycleId": "lifecycle-001",
        "stage": "active",
        "enteredAt": "2026-01-15T00:00:00Z",
        "exitedAt": "2026-01-20T00:00:00Z",
        "duration": 432000,
        "transitionReason": "客户活跃度提升",
        "createdAt": "2026-01-15T00:00:00Z"
      },
      {
        "id": "history-002",
        "lifecycleId": "lifecycle-001",
        "stage": "new",
        "enteredAt": "2026-01-01T00:00:00Z",
        "exitedAt": "2026-01-15T00:00:00Z",
        "duration": 1209600,
        "transitionReason": "首次下单",
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "total": 2,
    "page": 1,
    "size": 20
  }
}
```

### 3.4 获取生命周期统计数据

#### 3.4.1 接口说明

获取客户生命周期的统计数据。

#### 3.4.2 请求方式

```http
GET /api/v1/lifecycle/statistics
```

#### 3.4.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| startDate | string | query | 否 | 开始日期 |
| endDate | string | query | 否 | 结束日期 |

#### 3.4.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCustomers": 1000,
    "potentialCustomers": 100,
    "newCustomers": 200,
    "activeCustomers": 400,
    "loyalCustomers": 200,
    "dormantCustomers": 80,
    "churnedCustomers": 20,
    "stageDistribution": [
      {
        "stage": "potential",
        "count": 100,
        "percentage": 10
      },
      {
        "stage": "new",
        "count": 200,
        "percentage": 20
      },
      {
        "stage": "active",
        "count": 400,
        "percentage": 40
      },
      {
        "stage": "loyal",
        "count": 200,
        "percentage": 20
      },
      {
        "stage": "dormant",
        "count": 80,
        "percentage": 8
      },
      {
        "stage": "churned",
        "count": 20,
        "percentage": 2
      }
    ]
  }
}
```

### 3.5 获取生命周期流转趋势

#### 3.5.1 接口说明

获取客户生命周期阶段的流转趋势数据。

#### 3.5.2 请求方式

```http
GET /api/v1/lifecycle/flow-trend
```

#### 3.5.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| startDate | string | query | 否 | 开始日期 |
| endDate | string | query | 否 | 结束日期 |
| granularity | string | query | 否 | 时间粒度（day/week/month），默认day |

#### 3.5.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "trends": [
      {
        "date": "2026-01-01",
        "potentialToNew": 10,
        "newToActive": 15,
        "activeToLoyal": 5,
        "loyalToDormant": 2,
        "dormantToChurned": 1,
        "churnedToActive": 3
      },
      {
        "date": "2026-01-02",
        "potentialToNew": 12,
        "newToActive": 18,
        "activeToLoyal": 6,
        "loyalToDormant": 1,
        "dormantToChurned": 2,
        "churnedToActive": 4
      }
    ]
  }
}
```

### 3.6 获取客户留存率趋势

#### 3.6.1 接口说明

获取客户留存率趋势数据。

#### 3.6.2 请求方式

```http
GET /api/v1/lifecycle/retention-trend
```

#### 3.6.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| startDate | string | query | 否 | 开始日期 |
| endDate | string | query | 否 | 结束日期 |
| period | number | query | 否 | 留存周期（天），默认30 |

#### 3.6.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "trends": [
      {
        "date": "2026-01-01",
        "newCustomers": 50,
        "retentionRate": 0.85,
        "retentionCount": 42,
        "churnCount": 8
      },
      {
        "date": "2026-01-02",
        "newCustomers": 55,
        "retentionRate": 0.82,
        "retentionCount": 45,
        "churnCount": 10
      }
    ]
  }
}
```

### 3.7 获取客户生命周期价值分布

#### 3.7.1 接口说明

获取客户生命周期价值（CLV）分布数据。

#### 3.7.2 请求方式

```http
GET /api/v1/lifecycle/clv-distribution
```

#### 3.7.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| startDate | string | query | 否 | 开始日期 |
| endDate | string | query | 否 | 结束日期 |

#### 3.7.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "distribution": [
      {
        "range": "0-100",
        "count": 100,
        "percentage": 10
      },
      {
        "range": "100-500",
        "count": 300,
        "percentage": 30
      },
      {
        "range": "500-1000",
        "count": 400,
        "percentage": 40
      },
      {
        "range": "1000-5000",
        "count": 150,
        "percentage": 15
      },
      {
        "range": "5000+",
        "count": 50,
        "percentage": 5
      }
    ],
    "averageCLV": 850.00,
    "totalCLV": 850000.00
  }
}
```

### 3.8 导出生命周期报告

#### 3.8.1 接口说明

导出客户生命周期报告。

#### 3.8.2 请求方式

```http
GET /api/v1/lifecycle/export
```

#### 3.8.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| startDate | string | query | 否 | 开始日期 |
| endDate | string | query | 否 | 结束日期 |
| format | string | query | 否 | 导出格式（pdf/excel），默认excel |

#### 3.8.4 响应

返回文件流，Content-Type为`application/pdf`或`application/vnd.ms-excel`。

---

## 4. RFM分析接口

### 4.1 计算客户RFM评分

#### 4.1.1 接口说明

批量计算客户的RFM评分。

#### 4.1.2 请求方式

```http
POST /api/v1/rfm/calculate
```

#### 4.1.3 请求参数

```json
{
  "customerIds": ["customer-001", "customer-002"]
}
```

#### 4.1.4 响应示例

```json
{
  "code": 200,
  "message": "计算成功",
  "data": [
    {
      "id": "rfm-001",
      "customerId": "customer-001",
      "recencyScore": 5,
      "frequencyScore": 4,
      "monetaryScore": 5,
      "rfmScore": 14,
      "customerLevel": "超级VIP",
      "calculatedAt": "2026-01-20T00:00:00Z"
    },
    {
      "id": "rfm-002",
      "customerId": "customer-002",
      "recencyScore": 3,
      "frequencyScore": 2,
      "monetaryScore": 3,
      "rfmScore": 8,
      "customerLevel": "会员",
      "calculatedAt": "2026-01-20T00:00:00Z"
    }
  ]
}
```

### 4.2 获取RFM评分列表

#### 4.2.1 接口说明

获取客户的RFM评分列表。

#### 4.2.2 请求方式

```http
GET /api/v1/rfm/scores
```

#### 4.2.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| customerId | string | query | 否 | 客户ID |
| customerLevel | string | query | 否 | 客户等级 |
| minScore | number | query | 否 | 最小RFM评分 |
| maxScore | number | query | 否 | 最大RFM评分 |
| page | number | query | 否 | 页码 |
| size | number | query | 否 | 每页数量 |

#### 4.2.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "rfm-001",
        "customerId": "customer-001",
        "customerName": "张三",
        "customerPhone": "13800138000",
        "recencyScore": 5,
        "frequencyScore": 4,
        "monetaryScore": 5,
        "rfmScore": 14,
        "customerLevel": "超级VIP",
        "calculatedAt": "2026-01-20T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

### 4.3 获取RFM统计数据

#### 4.3.1 接口说明

获取RFM分析的统计数据。

#### 4.3.2 请求方式

```http
GET /api/v1/rfm/statistics
```

#### 4.3.3 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCustomers": 1000,
    "averageRFMScore": 10.5,
    "customerLevelDistribution": [
      {
        "level": "超级VIP",
        "count": 100,
        "percentage": 10
      },
      {
        "level": "VIP",
        "count": 200,
        "percentage": 20
      },
      {
        "level": "会员",
        "count": 400,
        "percentage": 40
      },
      {
        "level": "普通",
        "count": 250,
        "percentage": 25
      },
      {
        "level": "低价值",
        "count": 50,
        "percentage": 5
      }
    ],
    "recencyDistribution": [
      {
        "score": 5,
        "count": 200,
        "percentage": 20
      },
      {
        "score": 4,
        "count": 250,
        "percentage": 25
      },
      {
        "score": 3,
        "count": 300,
        "percentage": 30
      },
      {
        "score": 2,
        "count": 150,
        "percentage": 15
      },
      {
        "score": 1,
        "count": 100,
        "percentage": 10
      }
    ],
    "frequencyDistribution": [
      {
        "score": 5,
        "count": 150,
        "percentage": 15
      },
      {
        "score": 4,
        "count": 200,
        "percentage": 20
      },
      {
        "score": 3,
        "count": 350,
        "percentage": 35
      },
      {
        "score": 2,
        "count": 200,
        "percentage": 20
      },
      {
        "score": 1,
        "count": 100,
        "percentage": 10
      }
    ],
    "monetaryDistribution": [
      {
        "score": 5,
        "count": 100,
        "percentage": 10
      },
      {
        "score": 4,
        "count": 150,
        "percentage": 15
      },
      {
        "score": 3,
        "count": 250,
        "percentage": 25
      },
      {
        "score": 2,
        "count": 300,
        "percentage": 30
      },
      {
        "score": 1,
        "count": 200,
        "percentage": 20
      }
    ]
  }
}
```

---

## 5. 流失预测接口

### 5.1 预测客户流失

#### 5.1.1 接口说明

批量预测客户流失概率。

#### 5.1.2 请求方式

```http
POST /api/v1/churn-predictions/predict
```

#### 5.1.3 请求参数

```json
{
  "customerIds": ["customer-001", "customer-002"]
}
```

#### 5.1.4 响应示例

```json
{
  "code": 200,
  "message": "预测成功",
  "data": [
    {
      "id": "churn-001",
      "customerId": "customer-001",
      "customerName": "张三",
      "customerPhone": "13800138000",
      "customerEmail": "zhangsan@example.com",
      "churnProbability": 0.75,
      "riskLevel": "high",
      "riskFactors": [
        "60天未消费",
        "消费频次下降50%",
        "满意度评分3.0分"
      ],
      "predictedChurnDate": "2026-03-20T00:00:00Z",
      "recommendations": [
        "立即联系客户了解情况",
        "提供专属优惠券",
        "安排客户回访"
      ],
      "assignedTo": null,
      "status": "pending",
      "createdAt": "2026-01-20T00:00:00Z",
      "updatedAt": "2026-01-20T00:00:00Z"
    },
    {
      "id": "churn-002",
      "customerId": "customer-002",
      "customerName": "李四",
      "customerPhone": "13800138001",
      "customerEmail": "lisi@example.com",
      "churnProbability": 0.35,
      "riskLevel": "medium",
      "riskFactors": [
        "30天未消费"
      ],
      "predictedChurnDate": "2026-04-20T00:00:00Z",
      "recommendations": [
        "发送关怀短信",
        "提供会员优惠"
      ],
      "assignedTo": null,
      "status": "pending",
      "createdAt": "2026-01-20T00:00:00Z",
      "updatedAt": "2026-01-20T00:00:00Z"
    }
  ]
}
```

### 5.2 获取流失预测列表

#### 5.2.1 接口说明

获取客户流失预测列表。

#### 5.2.2 请求方式

```http
GET /api/v1/churn-predictions
```

#### 5.2.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| riskLevel | string | query | 否 | 风险等级（high/medium/low） |
| status | string | query | 否 | 状态（pending/in_progress/resolved/closed） |
| page | number | query | 否 | 页码 |
| size | number | query | 否 | 每页数量 |

#### 5.2.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "churn-001",
        "customerId": "customer-001",
        "customerName": "张三",
        "customerPhone": "13800138000",
        "churnProbability": 0.75,
        "riskLevel": "high",
        "riskFactors": [
          "60天未消费",
          "消费频次下降50%"
        ],
        "predictedChurnDate": "2026-03-20T00:00:00Z",
        "assignedTo": "user-001",
        "status": "in_progress",
        "createdAt": "2026-01-20T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "size": 20
  }
}
```

### 5.3 分配流失预警

#### 5.3.1 接口说明

将流失预警分配给指定负责人。

#### 5.3.2 请求方式

```http
PATCH /api/v1/churn-predictions/{alertId}/assign
```

#### 5.3.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| alertId | string | path | 是 | 预警ID |
| assignedTo | string | body | 是 | 负责人ID |

#### 5.3.4 请求示例

```json
{
  "assignedTo": "user-001"
}
```

#### 5.3.5 响应示例

```json
{
  "code": 200,
  "message": "分配成功",
  "data": {
    "id": "churn-001",
    "assignedTo": "user-001",
    "status": "in_progress",
    "updatedAt": "2026-01-20T00:00:00Z"
  }
}
```

### 5.4 解决流失预警

#### 5.4.1 接口说明

标记流失预警为已解决。

#### 5.4.2 请求方式

```http
PATCH /api/v1/churn-predictions/{alertId}/resolve
```

#### 5.4.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| alertId | string | path | 是 | 预警ID |
| resolutionNotes | string | body | 是 | 解决说明 |

#### 5.4.4 请求示例

```json
{
  "resolutionNotes": "已联系客户，客户表示会继续消费"
}
```

#### 5.4.5 响应示例

```json
{
  "code": 200,
  "message": "解决成功",
  "data": {
    "id": "churn-001",
    "status": "resolved",
    "resolutionNotes": "已联系客户，客户表示会继续消费",
    "updatedAt": "2026-01-20T00:00:00Z"
  }
}
```

### 5.5 关闭流失预警

#### 5.5.1 接口说明

关闭流失预警。

#### 5.5.2 请求方式

```http
PATCH /api/v1/churn-predictions/{alertId}/close
```

#### 5.5.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| alertId | string | path | 是 | 预警ID |

#### 5.5.4 响应示例

```json
{
  "code": 200,
  "message": "关闭成功",
  "data": {
    "id": "churn-001",
    "status": "closed",
    "updatedAt": "2026-01-20T00:00:00Z"
  }
}
```

### 5.6 获取流失统计数据

#### 5.6.1 接口说明

获取流失预测的统计数据。

#### 5.6.2 请求方式

```http
GET /api/v1/churn-predictions/statistics
```

#### 5.6.3 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPredictions": 100,
    "highRiskCount": 20,
    "mediumRiskCount": 50,
    "lowRiskCount": 30,
    "pendingCount": 60,
    "inProgressCount": 25,
    "resolvedCount": 10,
    "closedCount": 5,
    "averageChurnProbability": 0.45,
    "churnTrend": [
      {
        "date": "2026-01-01",
        "churnCount": 5,
        "churnRate": 0.05
      },
      {
        "date": "2026-01-02",
        "churnCount": 4,
        "churnRate": 0.04
      }
    ]
  }
}
```

### 5.7 获取流失趋势分析

#### 5.7.1 接口说明

获取流失趋势分析数据。

#### 5.7.2 请求方式

```http
GET /api/v1/churn-predictions/trends
```

#### 5.7.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| startDate | string | query | 否 | 开始日期 |
| endDate | string | query | 否 | 结束日期 |
| granularity | string | query | 否 | 时间粒度（day/week/month），默认day |

#### 5.7.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "trends": [
      {
        "date": "2026-01-01",
        "highRiskCount": 2,
        "mediumRiskCount": 5,
        "lowRiskCount": 3,
        "totalChurned": 5,
        "churnRate": 0.05
      },
      {
        "date": "2026-01-02",
        "highRiskCount": 3,
        "mediumRiskCount": 4,
        "lowRiskCount": 2,
        "totalChurned": 4,
        "churnRate": 0.04
      }
    ]
  }
}
```

### 5.8 导出流失预警报告

#### 5.8.1 接口说明

导出流失预警报告。

#### 5.8.2 请求方式

```http
GET /api/v1/churn-predictions/export
```

#### 5.8.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| startDate | string | query | 否 | 开始日期 |
| endDate | string | query | 否 | 结束日期 |
| format | string | query | 否 | 导出格式（pdf/excel），默认excel |

#### 5.8.4 响应

返回文件流，Content-Type为`application/pdf`或`application/vnd.ms-excel`。

---

## 6. 关怀提醒接口

### 6.1 获取关怀提醒列表

#### 6.1.1 接口说明

获取客户关怀提醒列表。

#### 6.1.2 请求方式

```http
GET /api/v1/care-reminders
```

#### 6.1.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| customerId | string | query | 否 | 客户ID |
| reminderType | string | query | 否 | 提醒类型 |
| status | string | query | 否 | 状态（pending/sent/failed） |
| page | number | query | 否 | 页码 |
| size | number | query | 否 | 每页数量 |

#### 6.1.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "reminder-001",
        "customerId": "customer-001",
        "customerName": "张三",
        "customerPhone": "13800138000",
        "reminderType": "revisit",
        "title": "7天未消费关怀",
        "content": "亲爱的张三，您已经7天没有光顾了，我们想念您！",
        "channel": "sms",
        "priority": "medium",
        "scheduledAt": "2026-01-20T00:00:00Z",
        "sentAt": null,
        "status": "pending",
        "result": null,
        "createdAt": "2026-01-20T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

### 6.2 发送关怀提醒

#### 6.2.1 接口说明

发送关怀提醒。

#### 6.2.2 请求方式

```http
POST /api/v1/care-reminders/{reminderId}/send
```

#### 6.2.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| reminderId | string | path | 是 | 提醒ID |

#### 6.2.4 响应示例

```json
{
  "code": 200,
  "message": "发送成功",
  "data": {
    "id": "reminder-001",
    "status": "sent",
    "sentAt": "2026-01-20T00:00:00Z",
    "result": {
      "channel": "sms",
      "messageId": "msg-001",
      "status": "delivered"
    }
  }
}
```

### 6.3 标记关怀提醒为已发送

#### 6.3.1 接口说明

标记关怀提醒为已发送，并记录发送结果。

#### 6.3.2 请求方式

```http
PATCH /api/v1/care-reminders/{reminderId}/sent
```

#### 6.3.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| reminderId | string | path | 是 | 提醒ID |
| result | object | body | 是 | 发送结果 |

#### 6.3.4 请求示例

```json
{
  "result": {
    "channel": "sms",
    "messageId": "msg-001",
    "status": "delivered"
  }
}
```

#### 6.3.5 响应示例

```json
{
  "code": 200,
  "message": "标记成功",
  "data": {
    "id": "reminder-001",
    "status": "sent",
    "sentAt": "2026-01-20T00:00:00Z",
    "result": {
      "channel": "sms",
      "messageId": "msg-001",
      "status": "delivered"
    }
  }
}
```

### 6.4 获取关怀提醒规则列表

#### 6.4.1 接口说明

获取关怀提醒规则列表。

#### 6.4.2 请求方式

```http
GET /api/v1/care-reminders/rules
```

#### 6.4.3 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "rule-001",
      "name": "7天未消费关怀",
      "description": "客户7天未消费时发送关怀短信",
      "triggerType": "time",
      "triggerCondition": {
        "daysSinceLastOrder": 7
      },
      "reminderType": "revisit",
      "channel": "sms",
      "template": "亲爱的{name}，您已经{days}天没有光顾了，我们想念您！",
      "priority": "medium",
      "enabled": true,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### 6.5 创建关怀提醒规则

#### 6.5.1 接口说明

创建关怀提醒规则。

#### 6.5.2 请求方式

```http
POST /api/v1/care-reminders/rules
```

#### 6.5.3 请求参数

```json
{
  "name": "7天未消费关怀",
  "description": "客户7天未消费时发送关怀短信",
  "triggerType": "time",
  "triggerCondition": {
    "daysSinceLastOrder": 7
  },
  "reminderType": "revisit",
  "channel": "sms",
  "template": "亲爱的{name}，您已经{days}天没有光顾了，我们想念您！",
  "priority": "medium",
  "enabled": true
}
```

#### 6.5.4 响应示例

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "rule-001",
    "name": "7天未消费关怀",
    "description": "客户7天未消费时发送关怀短信",
    "triggerType": "time",
    "triggerCondition": {
      "daysSinceLastOrder": 7
    },
    "reminderType": "revisit",
    "channel": "sms",
    "template": "亲爱的{name}，您已经{days}天没有光顾了，我们想念您！",
    "priority": "medium",
    "enabled": true,
    "createdAt": "2026-01-20T00:00:00Z"
  }
}
```

### 6.6 更新关怀提醒规则

#### 6.6.1 接口说明

更新关怀提醒规则。

#### 6.6.2 请求方式

```http
PUT /api/v1/care-reminders/rules/{ruleId}
```

#### 6.6.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| ruleId | string | path | 是 | 规则ID |
| name | string | body | 否 | 规则名称 |
| description | string | body | 否 | 规则描述 |
| enabled | boolean | body | 否 | 是否启用 |

#### 6.6.4 响应示例

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "rule-001",
    "name": "7天未消费关怀",
    "enabled": false,
    "updatedAt": "2026-01-20T00:00:00Z"
  }
}
```

### 6.7 删除关怀提醒规则

#### 6.7.1 接口说明

删除关怀提醒规则。

#### 6.7.2 请求方式

```http
DELETE /api/v1/care-reminders/rules/{ruleId}
```

#### 6.7.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| ruleId | string | path | 是 | 规则ID |

#### 6.7.4 响应示例

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 7. 客户分群接口

### 7.1 获取客户分群列表

#### 7.1.1 接口说明

获取客户分群列表。

#### 7.1.2 请求方式

```http
GET /api/v1/customer-groups
```

#### 7.1.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| groupType | string | query | 否 | 分群类型 |
| enabled | boolean | query | 否 | 是否启用 |
| page | number | query | 否 | 页码 |
| size | number | query | 否 | 每页数量 |

#### 7.1.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "group-001",
        "name": "高价值客户",
        "description": "RFM评分大于等于13的客户",
        "groupType": "rfm",
        "conditions": {
          "rfmScore": {
            "operator": ">=",
            "value": 13
          }
        },
        "color": "#409EFF",
        "icon": "user",
        "priority": 1,
        "memberCount": 100,
        "enabled": true,
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "size": 20
  }
}
```

### 7.2 创建客户分群

#### 7.2.1 接口说明

创建客户分群。

#### 7.2.2 请求方式

```http
POST /api/v1/customer-groups
```

#### 7.2.3 请求参数

```json
{
  "name": "高价值客户",
  "description": "RFM评分大于等于13的客户",
  "groupType": "rfm",
  "conditions": {
    "rfmScore": {
      "operator": ">=",
      "value": 13
    }
  },
  "color": "#409EFF",
  "icon": "user",
  "priority": 1,
  "enabled": true
}
```

#### 7.2.4 响应示例

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "group-001",
    "name": "高价值客户",
    "groupType": "rfm",
    "memberCount": 0,
    "enabled": true,
    "createdAt": "2026-01-20T00:00:00Z"
  }
}
```

### 7.3 获取分群成员列表

#### 7.3.1 接口说明

获取指定分群的成员列表。

#### 7.3.2 请求方式

```http
GET /api/v1/customer-groups/{groupId}/members
```

#### 7.3.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| groupId | string | path | 是 | 分群ID |
| page | number | query | 否 | 页码 |
| size | number | query | 否 | 每页数量 |

#### 7.3.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "member-001",
        "groupId": "group-001",
        "customerId": "customer-001",
        "customerName": "张三",
        "customerPhone": "13800138000",
        "addedBy": "user-001",
        "addedAt": "2026-01-20T00:00:00Z",
        "reason": "RFM评分符合条件"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

### 7.4 添加客户到分群

#### 7.4.1 接口说明

添加客户到指定分群。

#### 7.4.2 请求方式

```http
POST /api/v1/customer-groups/{groupId}/members
```

#### 7.4.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| groupId | string | path | 是 | 分群ID |
| customerIds | string[] | body | 是 | 客户ID列表 |
| reason | string | body | 否 | 添加原因 |

#### 7.4.4 请求示例

```json
{
  "customerIds": ["customer-001", "customer-002"],
  "reason": "RFM评分符合条件"
}
```

#### 7.4.5 响应示例

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "success": 2,
    "failed": 0,
    "errors": []
  }
}
```

### 7.5 从分群移除客户

#### 7.5.1 接口说明

从指定分群移除客户。

#### 7.5.2 请求方式

```http
DELETE /api/v1/customer-groups/{groupId}/members/{customerId}
```

#### 7.5.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| groupId | string | path | 是 | 分群ID |
| customerId | string | path | 是 | 客户ID |

#### 7.5.4 响应示例

```json
{
  "code": 200,
  "message": "移除成功"
}
```

### 7.6 获取客户分群统计

#### 7.6.1 接口说明

获取客户分群的统计数据。

#### 7.6.2 请求方式

```http
GET /api/v1/customer-groups/statistics
```

#### 7.6.3 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalGroups": 10,
    "manualGroups": 3,
    "autoGroups": 2,
    "rfmGroups": 3,
    "lifecycleGroups": 2,
    "totalMembers": 500,
    "avgMembersPerGroup": 50
  }
}
```

---

## 8. 客户标签接口

### 8.1 获取客户标签列表

#### 8.1.1 接口说明

获取客户标签列表。

#### 8.1.2 请求方式

```http
GET /api/v1/customer-tags
```

#### 8.1.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| tagType | string | query | 否 | 标签类型 |
| page | number | query | 否 | 页码 |
| size | number | query | 否 | 每页数量 |

#### 8.1.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "tag-001",
        "name": "高消费",
        "description": "累计消费金额大于5000元",
        "color": "#67C23A",
        "tagType": "behavior",
        "usageCount": 100,
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "size": 20
  }
}
```

### 8.2 创建客户标签

#### 8.2.1 接口说明

创建客户标签。

#### 8.2.2 请求方式

```http
POST /api/v1/customer-tags
```

#### 8.2.3 请求参数

```json
{
  "name": "高消费",
  "description": "累计消费金额大于5000元",
  "color": "#67C23A",
  "tagType": "behavior"
}
```

#### 8.2.4 响应示例

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "tag-001",
    "name": "高消费",
    "tagType": "behavior",
    "usageCount": 0,
    "createdAt": "2026-01-20T00:00:00Z"
  }
}
```

### 8.3 为客户添加标签

#### 8.3.1 接口说明

为客户添加标签。

#### 8.3.2 请求方式

```http
POST /api/v1/customers/{customerId}/tags
```

#### 8.3.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| customerId | string | path | 是 | 客户ID |
| tagId | string | body | 是 | 标签ID |
| reason | string | body | 否 | 添加原因 |

#### 8.3.4 请求示例

```json
{
  "tagId": "tag-001",
  "reason": "客户消费金额达到标准"
}
```

#### 8.3.5 响应示例

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": "relation-001",
    "customerId": "customer-001",
    "tagId": "tag-001",
    "taggedBy": "user-001",
    "taggedAt": "2026-01-20T00:00:00Z",
    "reason": "客户消费金额达到标准"
  }
}
```

### 8.4 从客户移除标签

#### 8.4.1 接口说明

从客户移除标签。

#### 8.4.2 请求方式

```http
DELETE /api/v1/customers/{customerId}/tags/{tagId}
```

#### 8.4.3 请求参数

| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| customerId | string | path | 是 | 客户ID |
| tagId | string | path | 是 | 标签ID |

#### 8.4.4 响应示例

```json
{
  "code": 200,
  "message": "移除成功"
}
```

### 8.5 获取客户标签统计

#### 8.5.1 接口说明

获取客户标签的统计数据。

#### 8.5.2 请求方式

```http
GET /api/v1/customer-tags/statistics
```

#### 8.5.3 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalTags": 50,
    "behaviorTags": 20,
    "preferenceTags": 15,
    "customTags": 10,
    "systemTags": 5,
    "totalTaggedCustomers": 800,
    "avgTagsPerCustomer": 2.5,
    "topUsedTags": [
      {
        "tagId": "tag-001",
        "tagName": "高消费",
        "usageCount": 100
      },
      {
        "tagId": "tag-002",
        "tagName": "活跃",
        "usageCount": 80
      }
    ]
  }
}
```

---

## 9. 错误码说明

### 9.1 通用错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 9.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 客户不存在 |
| 1002 | 客户已存在 |
| 1003 | 客户状态不允许此操作 |
| 2001 | 分群不存在 |
| 2002 | 客户已在分群中 |
| 2003 | 分群类型不允许此操作 |
| 3001 | 标签不存在 |
| 3002 | 客户已有此标签 |
| 4001 | RFM评分计算失败 |
| 4002 | 流失预测失败 |
| 5001 | 关怀提醒发送失败 |
| 5002 | 关怀提醒规则冲突 |

---

## 10. 附录

### 10.1 数据类型说明

| 类型 | 说明 |
|------|------|
| string | 字符串 |
| number | 数字 |
| boolean | 布尔值 |
| object | 对象 |
| array | 数组 |
| date | 日期，格式为ISO 8601 |

### 10.2 枚举值说明

#### 10.2.1 生命周期阶段

| 值 | 说明 |
|------|------|
| potential | 潜在客户 |
| new | 新客户 |
| active | 活跃客户 |
| loyal | 忠诚客户 |
| dormant | 休眠客户 |
| churned | 流失客户 |

#### 10.2.2 客户等级

| 值 | 说明 |
|------|------|
| 超级VIP | RFM评分13-15 |
| VIP | RFM评分10-12 |
| 会员 | RFM评分7-9 |
| 普通 | RFM评分4-6 |
| 低价值 | RFM评分1-3 |

#### 10.2.3 风险等级

| 值 | 说明 |
|------|------|
| high | 高危（流失概率>=70%） |
| medium | 中危（流失概率40%-70%） |
| low | 低危（流失概率<40%） |

#### 10.2.4 分群类型

| 值 | 说明 |
|------|------|
| manual | 手动分群 |
| auto | 自动分群 |
| rfm | RFM分群 |
| lifecycle | 生命周期分群 |

#### 10.2.5 标签类型

| 值 | 说明 |
|------|------|
| behavior | 行为标签 |
| preference | 偏好标签 |
| custom | 自定义标签 |
| system | 系统标签 |

### 10.3 相关文档

- [用户操作手册](../YYC3-Cater-用户指南/YYC3-Cater-用户操作手册.md)
- [开发文档](../YYC3-Cater-开发文档/客户管理模块开发文档.md)
- [数据模型设计文档](../../YYC3-CP-详细设计/041-YYC3-AICP-详细设计-数据模型设计文档.md)

### 10.4 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2026-01-20 | 初始版本 |

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
