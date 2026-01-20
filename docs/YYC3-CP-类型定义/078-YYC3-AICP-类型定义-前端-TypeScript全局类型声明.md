---
@file: 078-YYC3-AICP-类型定义-前端-TypeScript全局类型声明.md
@description: YYC3-AICP 前端TS全局公共类型、接口、枚举的统一声明与约束
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [类型定义],[前端],[TypeScript]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 078-YYC3-AICP-类型定义-前端-TypeScript全局类型声明

## 概述

本文档详细描述YYC3-YYC3-AICP-类型定义-前端-TypeScript全局类型声明相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范前端-TypeScript全局类型声明相关的业务标准与技术落地要求
- 为项目相关人员提供清晰的参考依据
- 保障相关模块开发、实施、运维的一致性与规范性

### 2. 设计原则

#### 2.1 五高原则
- **高可用性**：确保系统7x24小时稳定运行
- **高性能**：优化响应时间和处理能力
- **高安全性**：保护用户数据和隐私安全
- **高扩展性**：支持业务快速扩展
- **高可维护性**：便于后续维护和升级

#### 2.2 五标体系
- **标准化**：统一的技术和流程标准
- **规范化**：严格的开发和管理规范
- **自动化**：提高开发效率和质量
- **智能化**：利用AI技术提升能力
- **可视化**：直观的监控和管理界面

#### 2.3 五化架构
- **流程化**：标准化的开发流程
- **文档化**：完善的文档体系
- **工具化**：高效的开发工具链
- **数字化**：数据驱动的决策
- **生态化**：开放的生态系统

### 3. 前端-TypeScript全局类型声明

#### 3.1 类型定义规范

YYC³项目采用统一的TypeScript类型定义体系，确保前后端类型一致性。

#### 3.2 ID类型统一规范

**核心原则**：所有实体ID统一使用 `string` 类型（UUID格式）

```typescript
// ✅ 正确：使用string类型的UUID
interface User {
  id: string;
  name: string;
  email: string;
}

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
}

// ❌ 错误：不要使用number类型
interface UserOld {
  id: number;  // 已废弃
  name: string;
}
```

#### 3.3 核心实体类型定义

**用户相关类型**：
- `User`: 用户基础信息
- `FrontendUser`: 前端用户接口（统一ID为string）
- `UserRole`: 用户角色枚举
- `UserStatus`: 用户状态枚举

**订单相关类型**：
- `Order`: 订单基础信息
- `OrderStatus`: 订单状态枚举
- `OrderItem`: 订单项
- `PaymentInfo`: 支付信息

**菜单相关类型**：
- `MenuItem`: 菜品信息
- `MenuCategory`: 菜品分类
- `MenuTag`: 菜品标签

#### 3.4 类型转换工具

项目提供类型转换工具，处理前后端数据格式转换：

```typescript
import { typeConverter } from '@/utils/type-converter';

// 转换后端数据到前端格式
const frontendUser = typeConverter.toFrontendUser(backendUserData);

// 验证数据格式
const isValid = typeConverter.validateUser(userData);
```

#### 3.5 类型定义文件结构

```
types/
├── entities/           # 实体类型定义
│   ├── user.d.ts       # 用户相关类型
│   ├── order.d.ts      # 订单相关类型
│   └── menu.d.ts       # 菜单相关类型
├── enums/              # 枚举定义
│   ├── user.ts         # 用户枚举
│   └── order.ts        # 订单枚举
└── utils/              # 类型工具
    └── type-converter.ts  # 类型转换器
```

#### 3.6 使用示例

```typescript
// 在Vue组件中使用
import type { User, Order, OrderStatus } from '@/types/entities/user';

interface ComponentProps {
  user: User;
  orders: Order[];
  onOrderUpdate: (orderId: string, status: OrderStatus) => void;
}

// 类型安全的数据访问
const userName = user.name;  // ✅ 类型安全
const userId = user.id;      // ✅ string类型
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
