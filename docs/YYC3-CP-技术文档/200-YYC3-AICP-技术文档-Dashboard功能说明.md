# YYC³餐饮行业智能化平台 - Dashboard技术文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档编号 | 200-YYC3-AICP-技术文档-Dashboard功能说明 |
| 文档标题 | Dashboard功能技术文档 |
| 文档版本 | 1.0.0 |
| 创建日期 | 2025-01-19 |
| 最后更新 | 2025-01-19 |
| 文档状态 | 正式发布 |
| 作者 | YYC³开发团队 |
| 审核人 | 技术负责人 |
| 批准人 | 项目经理 |

## 文档变更记录

| 版本 | 日期 | 变更内容 | 变更人 | 审核人 |
|------|------|----------|----------|--------|
| 1.0.0 | 2025-01-19 | 初始版本创建 | YYC³开发团队 | 技术负责人 |

## 目录

1. [概述](#1-概述)
2. [功能架构](#2-功能架构)
3. [技术实现](#3-技术实现)
4. [API接口](#4-api接口)
5. [数据模型](#5-数据模型)
6. [测试覆盖](#6-测试覆盖)
7. [部署说明](#7-部署说明)
8. [维护指南](#8-维护指南)

## 1. 概述

### 1.1 功能简介

Dashboard是YYC³餐饮行业智能化平台的核心管理界面，为餐厅管理者提供实时的经营数据监控、订单管理、厨房状态监控、客户流量分析等功能。Dashboard基于Vue 3和Element Plus构建，采用响应式设计，支持多设备访问。

### 1.2 核心特性

- 实时数据展示：营收、订单量、客户数等关键指标实时更新
- 可视化图表：营收趋势、订单分布、热门菜品、客流分析等多维度图表
- 厨房监控：实时显示厨房订单状态、制作进度、平均制作时间
- 订单管理：查看最近订单、订单详情、状态更新
- 数据导出：支持Excel、PDF、CSV格式的数据导出
- 响应式设计：适配桌面端、平板、手机等多种设备

### 1.3 技术栈

- 前端框架：Vue 3 + TypeScript
- UI组件库：Element Plus
- 状态管理：Pinia
- 图表库：ECharts
- HTTP客户端：Axios
- 测试框架：Vitest + @vue/test-utils

## 2. 功能架构

### 2.1 模块划分

```
Dashboard
├── 数据展示模块
│   ├── 核心指标卡片
│   ├── 营收趋势图
│   ├── 订单分布图
│   ├── 热门菜品排行
│   └── 客流分析图
├── 订单管理模块
│   ├── 最近订单列表
│   ├── 订单详情查看
│   └── 订单状态更新
├── 厨房监控模块
│   ├── 厨房状态概览
│   ├── 订单制作进度
│   └── 平均制作时间
└── 数据导出模块
    ├── Excel导出
    ├── PDF导出
    └── CSV导出
```

### 2.2 数据流

```
用户操作 → Dashboard组件 → Pinia Store → API Service → 后端服务
                ↓
            响应式更新
                ↓
            界面刷新
```

## 3. 技术实现

### 3.1 前端组件结构

#### 3.1.1 主视图组件

**文件路径**: `frontend/apps/admin-dashboard/src/views/Dashboard.vue`

**主要功能**:
- 数据加载和刷新
- 日期范围选择
- 数据展示和交互
- 订单详情查看
- 数据导出

**关键代码片段**:
```typescript
const loadCoreMetrics = async () => {
  try {
    metricsLoading.value = true
    await Promise.all([
      dashboardStore.loadDashboardData({
        startDate: dateRange.value[0],
        endDate: dateRange.value[1]
      }),
      kitchenStore.loadKitchenStats()
    ])
  } finally {
    metricsLoading.value = false
  }
}
```

#### 3.1.2 数据展示组件

**核心指标卡片**: `MetricCard.vue`
- 显示营收、订单量、客户数等核心指标
- 支持环比变化显示
- 响应式布局

**营收趋势图**: `RevenueChart.vue`
- 基于ECharts的折线图
- 支持多时间维度切换
- 交互式数据提示

**订单分布图**: `OrderStatusChart.vue`
- 基于ECharts的饼图
- 显示各状态订单占比
- 支持点击筛选

**热门菜品排行**: `TopDishesChart.vue`
- 基于ECharts的柱状图
- 显示菜品销售排行
- 支持销量和营收切换

**客流分析图**: `CustomerFlowChart.vue`
- 基于ECharts的面积图
- 显示时段客流分布
- 支持日期范围筛选

### 3.2 状态管理

#### 3.2.1 Dashboard Store

**文件路径**: `frontend/apps/admin-dashboard/src/stores/dashboard.ts`

**状态定义**:
```typescript
interface DashboardState {
  coreMetrics: CoreMetrics
  revenueData: RevenueData[]
  orderDistribution: OrderDistribution[]
  topDishes: TopDish[]
  customerFlow: CustomerFlowData[]
  recentOrders: Order[]
  tableStatus: TableStatus[]
  loading: boolean
  dateRange: DateRange
  timeRange: TimeRange
}
```

**主要方法**:
- `loadDashboardData`: 加载Dashboard数据
- `exportReport`: 导出报表
- `updateDateRange`: 更新日期范围
- `updateTimeRange`: 更新时间范围

#### 3.2.2 Kitchen Store

**文件路径**: `frontend/apps/admin-dashboard/src/stores/kitchen.ts`

**状态定义**:
```typescript
interface KitchenState {
  kitchenStats: KitchenStats
  kitchenItems: KitchenStatus[]
  loading: boolean
}
```

**主要方法**:
- `loadKitchenStats`: 加载厨房统计数据
- `loadKitchenStatus`: 加载厨房状态
- `updateItemStatus`: 更新厨房项目状态
- `refreshKitchenData`: 刷新厨房数据

### 3.3 API服务

#### 3.3.1 Dashboard API

**文件路径**: `frontend/apps/admin-dashboard/src/api/dashboard.ts`

**主要接口**:
- `getCoreMetrics`: 获取核心指标
- `getRevenueData`: 获取营收数据
- `getOrderDistribution`: 获取订单分布
- `getTopDishes`: 获取热门菜品
- `getCustomerFlow`: 获取客流数据
- `exportReport`: 导出报表

#### 3.3.2 Kitchen API

**文件路径**: `frontend/apps/admin-dashboard/src/api/kitchen.ts`

**主要接口**:
- `getKitchenStats`: 获取厨房统计
- `getKitchenStatus`: 获取厨房状态
- `updateKitchenItemStatus`: 更新厨房项目状态

## 4. API接口

### 4.1 Dashboard API

#### 4.1.1 获取核心指标

**接口地址**: `GET /api/v1/dashboard/metrics`

**请求参数**:
```typescript
interface DashboardFilters {
  startDate?: string
  endDate?: string
  period?: 'today' | 'week' | 'month' | 'year'
}
```

**响应数据**:
```typescript
interface CoreMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  customerCount: number
  orderChange: number
  revenueChange: number
}
```

#### 4.1.2 获取营收数据

**接口地址**: `GET /api/v1/dashboard/revenue`

**请求参数**: 同上

**响应数据**:
```typescript
interface RevenueData {
  date: string
  amount: number
  orders: number
  customers: number
}
```

#### 4.1.3 导出报表

**接口地址**: `POST /api/v1/dashboard/export`

**请求参数**:
```typescript
interface ExportRequest {
  format: 'excel' | 'pdf' | 'csv'
  filters?: DashboardFilters
}
```

**响应数据**: Blob对象

### 4.2 Kitchen API

#### 4.2.1 获取厨房统计

**接口地址**: `GET /api/v1/kitchen/stats`

**响应数据**:
```typescript
interface KitchenStats {
  inProgress: number
  pending: number
  completed: number
  avgPrepTime: number
}
```

#### 4.2.2 获取厨房状态

**接口地址**: `GET /api/v1/kitchen/status`

**响应数据**:
```typescript
interface KitchenStatus {
  id: string
  orderId: string
  dishName: string
  quantity: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  estimatedTime: number
  actualTime?: number
  createdAt: string
  updatedAt: string
}
```

## 5. 数据模型

### 5.1 核心指标模型

```typescript
interface CoreMetrics {
  totalRevenue: number        // 总营收
  totalOrders: number         // 总订单数
  averageOrderValue: number  // 平均订单金额
  customerCount: number      // 客户数
  orderChange: number        // 订单变化率（%）
  revenueChange: number      // 营收变化率（%）
}
```

### 5.2 订单分布模型

```typescript
interface OrderDistribution {
  status: string      // 订单状态
  count: number       // 订单数量
  percentage: number  // 占比（%）
}
```

### 5.3 热门菜品模型

```typescript
interface TopDish {
  id: string         // 菜品ID
  name: string       // 菜品名称
  sales: number      // 销量
  revenue: number   // 营收
  percentage: number // 占比（%）
}
```

### 5.4 客流数据模型

```typescript
interface CustomerFlowData {
  hour: number   // 小时（0-23）
  count: number // 客流量
}
```

## 6. 测试覆盖

### 6.1 单元测试

#### 6.1.1 Dashboard视图测试

**文件路径**: `frontend/apps/admin-dashboard/src/views/__tests__/Dashboard.test.ts`

**测试用例**:
- 基础渲染测试
- 数据加载测试
- 用户信息测试
- UI交互测试

#### 6.1.2 Dashboard API测试

**文件路径**: `frontend/apps/admin-dashboard/src/api/__tests__/dashboard.test.ts`

**测试用例**:
- 核心指标获取测试
- 营收数据获取测试
- 订单分布获取测试
- 热门菜品获取测试
- 客流数据获取测试
- 报表导出测试
- 认证token处理测试

#### 6.1.3 Kitchen API测试

**文件路径**: `frontend/apps/admin-dashboard/src/api/__tests__/kitchen.test.ts`

**测试用例**:
- 厨房统计获取测试
- 厨房状态获取测试
- 厨房项目状态更新测试
- 认证token处理测试
- 错误处理测试

### 6.2 测试覆盖率

当前测试覆盖率目标：80%

已覆盖模块：
- Dashboard视图组件
- Dashboard API服务
- Kitchen API服务
- 数据格式化工具

待完善模块：
- 图表组件测试
- 状态管理测试
- 集成测试

## 7. 部署说明

### 7.1 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- 浏览器支持：Chrome >= 90, Firefox >= 88, Safari >= 14, Edge >= 90

### 7.2 构建部署

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm dev

# 生产环境构建
pnpm build

# 运行测试
pnpm test

# 生成测试覆盖率报告
pnpm test:coverage
```

### 7.3 环境变量配置

```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:3000/api/v1

# WebSocket地址
VITE_WS_URL=ws://localhost:3000

# 应用环境
NODE_ENV=production
```

## 8. 维护指南

### 8.1 常见问题

#### 8.1.1 数据不更新

**问题描述**: Dashboard数据不实时更新

**解决方案**:
1. 检查WebSocket连接状态
2. 确认后端服务正常运行
3. 检查网络连接
4. 手动刷新数据

#### 8.1.2 图表显示异常

**问题描述**: 图表无法正常显示或数据错误

**解决方案**:
1. 检查ECharts版本兼容性
2. 确认数据格式正确
3. 检查浏览器控制台错误
4. 更新图表组件版本

#### 8.1.3 导出功能失败

**问题描述**: 数据导出失败或文件损坏

**解决方案**:
1. 检查后端导出服务状态
2. 确认文件格式支持
3. 检查浏览器下载设置
4. 尝试其他导出格式

### 8.2 性能优化

#### 8.2.1 数据加载优化

- 使用分页加载减少单次数据量
- 实现数据缓存机制
- 优化API请求频率
- 使用虚拟滚动处理大量数据

#### 8.2.2 渲染性能优化

- 使用Vue 3的响应式优化
- 避免不必要的组件重新渲染
- 使用计算属性缓存计算结果
- 优化图表渲染性能

### 8.3 安全建议

- 所有API请求使用HTTPS
- 实施严格的认证和授权
- 定期更新依赖包
- 实施输入验证和输出编码
- 记录和监控安全事件

## 附录

### A. 相关文档

- [YYC³餐饮行业智能化平台 - 产品功能说明书](../YYC3-CP-产品文档/172-YYC3-AICP-产品文档-产品功能说明书.md)
- [YYC³餐饮行业智能化平台 - API文档](../YYC3-CP-API文档/README.md)
- [YYC³餐饮行业智能化平台 - 开发规范](../YYC3-CP-开发阶段/097-YYC3-AICP-开发阶段-代码规范.md)

### B. 技术支持

如有技术问题，请联系：
- 技术支持邮箱：support@yyc3.com
- 技术支持热线：400-XXX-XXXX
- 在线文档：https://docs.yyc3.com

### C. 版本历史

| 版本 | 发布日期 | 主要变更 |
|------|----------|----------|
| 1.0.0 | 2025-01-19 | 初始版本发布，实现基础Dashboard功能 |

---

**文档结束**
