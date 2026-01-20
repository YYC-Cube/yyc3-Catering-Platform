---
@file: 097-YYC3-AICP-开发阶段-代码规范.md
@description: YYC3-AICP 前端、后端、数据库的统一代码编写规范，保障代码可读性与规范性
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [开发阶段],[代码规范],[编码标准]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 097-YYC3-AICP-开发阶段-代码规范

## 概述

本文档详细描述YYC3-YYC3-AICP-开发阶段-代码规范相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范代码规范相关的业务标准与技术落地要求
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

### 3. 代码规范

#### 3.1 前端代码规范

##### 3.1.1 文件命名规范

**组件文件命名**
- 组件文件使用 PascalCase 命名：`UserProfile.vue`, `OrderManagement.vue`
- 组件内部子组件放在 `components/` 子目录：`components/User/Profile.vue`
- 业务组件以功能模块分组：`components/Order/`, `components/Customer/`

**工具文件命名**
- 工具函数使用 camelCase 命名：`format.ts`, `api-cache.ts`
- 工具文件放在 `utils/` 目录：`utils/format.ts`, `utils/security.ts`

**类型文件命名**
- 类型定义文件使用 camelCase 命名：`auth.ts`, `dashboard.ts`
- 类型文件放在 `types/` 目录：`types/auth.ts`, `types/dashboard.ts`

**API文件命名**
- API文件使用 camelCase 命名：`auth.ts`, `order.ts`
- API文件放在 `api/` 目录：`api/auth.ts`, `api/order.ts`

**Store文件命名**
- Store文件使用 camelCase 命名：`auth.ts`, `dashboard.ts`
- Store文件放在 `stores/` 目录：`stores/auth.ts`, `stores/dashboard.ts`

**视图文件命名**
- 视图文件使用 PascalCase 命名：`Dashboard.vue`, `CustomerManagement.vue`
- 视图文件放在 `views/` 目录：`views/Dashboard.vue`, `views/CustomerManagement.vue`

##### 3.1.2 代码风格规范

**TypeScript代码风格**
- 使用 2 空格缩进
- 使用单引号字符串
- 使用分号结束语句
- 使用 const 和 let，避免使用 var
- 使用箭头函数
- 使用模板字符串

```typescript
// ✅ 正确示例
const userName = 'John Doe'
const getUserInfo = (userId: string): Promise<User> => {
  return api.getUser(userId)
}

// ❌ 错误示例
var userName = "John Doe"
function getUserInfo(userId: string) {
  return api.getUser(userId)
}
```

**Vue组件代码风格**
- 使用 Composition API (setup script)
- 使用 `<script setup>` 语法
- Props 使用 defineProps 定义
- Emits 使用 defineEmits 定义
- 使用 ref 和 reactive 管理响应式数据

```vue
<script setup lang="ts">
// ✅ 正确示例
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'

interface Props {
  userId: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户信息'
})

const emit = defineEmits<{
  (e: 'update', user: User): void
  (e: 'delete', userId: string): void
}>()

const user = ref<User | null>(null)
const loading = ref(false)

const userName = computed(() => user.value?.name || '未知用户')
</script>
```

**CSS样式规范**
- 使用 scoped 样式
- 使用 BEM 命名规范
- 使用 CSS 变量定义主题颜色
- 避免使用 !important

```vue
<style scoped lang="scss">
// ✅ 正确示例
.user-profile {
  &__header {
    display: flex;
    align-items: center;
    
    &--active {
      color: var(--color-primary);
    }
  }
  
  &__content {
    padding: 16px;
  }
}

// ❌ 错误示例
.user-header {
  display: flex !important;
}
</style>
```

##### 3.1.3 组件设计规范

**组件职责单一原则**
- 每个组件只负责一个功能
- 组件应该可复用
- 组件应该易于测试

```vue
<!-- ✅ 正确示例：单一职责 -->
<template>
  <div class="user-avatar">
    <img :src="avatarUrl" :alt="userName" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  avatarUrl: string
  userName: string
}

const props = defineProps<Props>()
</script>

<!-- ❌ 错误示例：职责过多 -->
<template>
  <div class="user-card">
    <img :src="user.avatar" />
    <h2>{{ user.name }}</h2>
    <button @click="editUser">编辑</button>
    <button @click="deleteUser">删除</button>
    <div class="orders">
      <!-- 订单列表 -->
    </div>
  </div>
</template>
```

**组件Props设计**
- Props 必须定义类型
- Props 应该有默认值
- Props 应该进行验证

```typescript
// ✅ 正确示例
interface Props {
  userId: string
  userName?: string
  isActive?: boolean
  onAction?: (id: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  userName: '',
  isActive: false,
  onAction: () => {}
})

// ❌ 错误示例
const props = defineProps({
  userId: String,
  userName: String,
  isActive: Boolean
})
```

**组件Emits设计**
- Emits 必须定义类型
- Emits 应该使用有意义的事件名

```typescript
// ✅ 正确示例
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: string): void
  (e: 'submit', data: FormData): void
}>()

// ❌ 错误示例
const emit = defineEmits(['update', 'delete', 'submit'])
```

##### 3.1.4 TypeScript类型定义规范

**类型定义位置**
- 全局类型定义放在 `types/` 目录
- 组件内部类型定义放在组件文件中
- API相关类型定义放在 `api/` 目录

**类型命名规范**
- 接口使用 PascalCase 命名：`User`, `Order`, `Product`
- 类型别名使用 PascalCase 命名：`UserRole`, `OrderStatus`
- 枚举使用 PascalCase 命名：`UserRole`, `OrderStatus`

```typescript
// ✅ 正确示例
export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  status: UserStatus
}

export type UserRole = 'admin' | 'restaurant_admin' | 'customer'

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended'
}

// ❌ 错误示例
export interface user {
  id: number
  email: string
}

export type userRole = string
```

**类型定义规范**
- 使用 interface 定义对象类型
- 使用 type 定义联合类型、交叉类型
- 使用 enum 定义枚举类型
- 避免使用 any，使用 unknown 代替

```typescript
// ✅ 正确示例
export interface User {
  id: number
  email: string
  name: string
}

export type UserRole = 'admin' | 'restaurant_admin' | 'customer'

export type UserWithRole = User & { role: UserRole }

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed'
}

function processData(data: unknown) {
  // 处理未知类型数据
}

// ❌ 错误示例
export interface User {
  id: any
  email: any
}

function processData(data: any) {
  // 不应该使用 any
}
```

##### 3.1.5 API调用规范

**API文件结构**
- 每个业务模块一个API文件
- 使用类封装API方法
- 统一错误处理

```typescript
// ✅ 正确示例
export class AuthAPI {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>('/auth/login', credentials)
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await httpClient.post<{ success: boolean }>('/auth/logout')
      return response
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }
}

export const authApi = new AuthAPI()

// ❌ 错误示例
export async function login(credentials: LoginRequest) {
  return fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}
```

**HTTP请求规范**
- 使用统一的HTTP客户端
- 统一处理请求头
- 统一处理错误响应

```typescript
// ✅ 正确示例
class HttpClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      headers: defaultHeaders,
      ...options,
    }

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
}

// ❌ 错误示例
async function getData() {
  const response = await fetch('/api/data')
  return response.json()
}
```

##### 3.1.6 状态管理规范

**Store设计规范**
- 使用 Pinia 进行状态管理
- 每个业务模块一个Store
- 使用 Composition API 风格

```typescript
// ✅ 正确示例
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      loading.value = true
      const response = await authApi.login(credentials)
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    login
  }
})

// ❌ 错误示例
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false
  }),
  actions: {
    async login(credentials) {
      // 缺少类型定义
    }
  }
})
```

#### 3.2 后端代码规范

##### 3.2.1 文件与目录结构

**目录结构规范**
```
backend/
├── api-gateway/          # API网关服务
│   ├── src/
│   │   ├── config/      # 配置文件
│   │   ├── middleware/  # 中间件
│   │   ├── routes/      # 路由
│   │   ├── services/    # 服务层
│   │   └── utils/       # 工具函数
│   └── package.json
├── common/              # 公共模块
│   └── services/       # 公共服务
└── shared/             # 共享类型定义
```

**文件命名规范**
- 配置文件使用 camelCase：`logger.ts`, `serviceRegistry.ts`
- 中间件文件使用 camelCase：`authMiddleware.ts`, `rateLimitMiddleware.ts`
- 路由文件使用 camelCase：`apiRoutes.ts`, `healthCheckRoutes.ts`
- 服务文件使用 camelCase：`cacheService.ts`, `kafkaService.ts`
- 工具文件使用 camelCase：`httpStatus.ts`, `logger.ts`

##### 3.2.2 命名规范

**变量命名**
- 使用 camelCase 命名变量：`userName`, `orderId`
- 使用 PascalCase 命名类：`UserService`, `OrderService`
- 使用 UPPER_CASE 命名常量：`MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`

```typescript
// ✅ 正确示例
const userName = 'John Doe'
const MAX_RETRY_COUNT = 3
const DEFAULT_TIMEOUT = 5000

class UserService {
  async getUserById(userId: string): Promise<User> {
    // ...
  }
}

// ❌ 错误示例
const user_name = 'John Doe'
const max_retry_count = 3

class userService {
  async get_user_by_id(userId: string) {
    // ...
  }
}
```

**函数命名**
- 使用动词开头：`getUserById`, `createOrder`, `updateUserProfile`
- 使用 camelCase 命名：`getUserInfo`, `validateToken`
- 异步函数使用 async/await

```typescript
// ✅ 正确示例
async function getUserById(userId: string): Promise<User> {
  return await userRepository.findById(userId)
}

async function createOrder(orderData: OrderData): Promise<Order> {
  return await orderRepository.create(orderData)
}

// ❌ 错误示例
function getUser(userId: string) {
  return userRepository.findById(userId)
}

function user_get(userId: string) {
  return userRepository.findById(userId)
}
```

##### 3.2.3 接口设计规范

**RESTful API设计**
- 使用名词作为资源名称：`/users`, `/orders`, `/products`
- 使用HTTP方法表示操作：GET, POST, PUT, DELETE
- 使用复数形式表示集合：`/users`, `/orders`

```typescript
// ✅ 正确示例
app.get('/api/users', getUsers)           // 获取用户列表
app.get('/api/users/:id', getUserById)    // 获取单个用户
app.post('/api/users', createUser)        // 创建用户
app.put('/api/users/:id', updateUser)      // 更新用户
app.delete('/api/users/:id', deleteUser)  // 删除用户

// ❌ 错误示例
app.get('/api/getUsers', getUsers)
app.post('/api/createUser', createUser)
app.post('/api/updateUser/:id', updateUser)
app.post('/api/deleteUser/:id', deleteUser)
```

**响应格式规范**
- 统一使用 JSON 格式
- 统一响应结构：`{ success: boolean, data?: T, message?: string, error?: string }`

```typescript
// ✅ 正确示例
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: number
}

// 成功响应
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": "用户不存在",
  "code": 404
}

// ❌ 错误示例
{
  "status": "ok",
  "result": {
    "id": 1
  }
}
```

##### 3.2.4 错误处理规范

**错误处理原则**
- 使用 try-catch 捕获错误
- 统一错误响应格式
- 记录错误日志

```typescript
// ✅ 正确示例
async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const user = await userService.getUserById(id)
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在',
        code: 404
      })
      return
    }
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    logger.error('获取用户失败', { error })
    res.status(500).json({
      success: false,
      error: '内部服务器错误',
      code: 500
    })
  }
}

// ❌ 错误示例
async function getUserById(req: Request, res: Response) {
  const user = await userService.getUserById(req.params.id)
  res.json(user)
}
```

**错误类型定义**
- 定义错误类型
- 使用错误中间件统一处理

```typescript
// ✅ 正确示例
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '参数验证失败') {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

// 使用示例
throw new NotFoundError('用户不存在')
throw new ValidationError('邮箱格式不正确')
```

##### 3.2.5 日志规范

**日志级别**
- error: 错误日志
- warn: 警告日志
- info: 信息日志
- debug: 调试日志

```typescript
// ✅ 正确示例
logger.error('用户登录失败', { userId, error })
logger.warn('缓存即将过期', { key, ttl })
logger.info('用户登录成功', { userId })
logger.debug('请求参数', { params })

// ❌ 错误示例
console.log('用户登录成功')
console.error('错误')
```

**日志内容规范**
- 包含关键业务信息
- 包含错误堆栈
- 包含上下文信息

```typescript
// ✅ 正确示例
logger.error('创建订单失败', {
  userId,
  orderData,
  error: error.message,
  stack: error.stack
})

logger.info('订单创建成功', {
  orderId,
  userId,
  amount,
  createdAt: new Date().toISOString()
})

// ❌ 错误示例
logger.error('创建订单失败')
logger.info('订单创建成功')
```

#### 3.3 数据库规范

##### 3.3.1 表设计规范

**表命名规范**
- 使用小写字母和下划线：`users`, `orders`, `order_items`
- 使用复数形式：`users`, `orders`
- 使用有意义的名称：`user_profiles`, `order_items`

```sql
-- ✅ 正确示例
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ 错误示例
CREATE TABLE User (
  ID BIGSERIAL PRIMARY KEY,
  Email VARCHAR(255) NOT NULL
);

CREATE TABLE orderItem (
  id BIGSERIAL PRIMARY KEY,
  orderId BIGINT NOT NULL
);
```

##### 3.3.2 字段命名规范

**字段命名规范**
- 使用小写字母和下划线：`user_id`, `created_at`, `updated_at`
- 使用有意义的名称：`email`, `phone_number`, `order_status`
- 使用统一的前缀：`user_id`, `order_id`, `product_id`

```sql
-- ✅ 正确示例
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ 错误示例
CREATE TABLE users (
  ID BIGSERIAL PRIMARY KEY,
  Email VARCHAR(255) NOT NULL,
  pwd VARCHAR(255) NOT NULL,
  Name VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**字段类型规范**
- 使用 BIGINT 作为主键
- 使用 VARCHAR 存储字符串
- 使用 TIMESTAMP 存储时间
- 使用 DECIMAL 存储金额
- 使用 BOOLEAN 存储布尔值

```sql
-- ✅ 正确示例
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ 错误示例
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_number TEXT NOT NULL,
  total_amount FLOAT NOT NULL,
  is_paid INT DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### 3.3.3 SQL编写规范

**SQL语句规范**
- 使用大写关键字：SELECT, FROM, WHERE, JOIN
- 使用缩进提高可读性
- 使用表别名简化查询

```sql
-- ✅ 正确示例
SELECT 
    u.id,
    u.email,
    u.name,
    o.id AS order_id,
    o.total_amount,
    o.status
FROM 
    users u
INNER JOIN 
    orders o ON u.id = o.user_id
WHERE 
    u.status = 'active'
    AND o.created_at >= '2025-01-01'
ORDER BY 
    o.created_at DESC
LIMIT 100;

-- ❌ 错误示例
select u.id, u.email, u.name, o.id as order_id, o.total_amount, o.status
from users u
inner join orders o on u.id = o.user_id
where u.status = 'active' and o.created_at >= '2025-01-01'
order by o.created_at desc
limit 100;
```

**索引规范**
- 为外键创建索引
- 为常用查询条件创建索引
- 为排序字段创建索引

```sql
-- ✅ 正确示例
-- 主键索引（自动创建）
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY
);

-- 外键索引
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 常用查询条件索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- 复合索引
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 排序字段索引
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ❌ 错误示例
-- 缺少必要索引
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL
);

-- 查询性能差
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
```

##### 3.3.4 索引设计规范

**索引命名规范**
- 使用 `idx_` 前缀：`idx_users_email`, `idx_orders_user_id`
- 使用表名和字段名：`idx_users_email`, `idx_orders_user_id`
- 使用有意义的名称：`idx_orders_user_status_created`

```sql
-- ✅ 正确示例
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ❌ 错误示例
CREATE INDEX index1 ON users(email);
CREATE INDEX user_email_index ON users(email);
CREATE INDEX idx_orders_userId ON orders(user_id);
```

**索引使用原则**
- 为WHERE条件创建索引
- 为JOIN条件创建索引
- 为ORDER BY创建索引
- 避免过度索引
- 定期维护索引

```sql
-- ✅ 正确示例
-- WHERE条件索引
CREATE INDEX idx_users_status ON users(status);

-- JOIN条件索引
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ORDER BY索引
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 复合索引（注意字段顺序）
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at DESC);

-- ❌ 错误示例
-- 过度索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

#### 3.4 通用规范

##### 3.4.1 版本控制规范

**Git提交信息规范**
- 使用约定式提交：`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- 提交信息应该清晰明了
- 提交信息应该包含变更内容

```
# ✅ 正确示例
feat: 添加用户注册功能
fix: 修复登录页面样式问题
docs: 更新API文档
style: 调整代码格式
refactor: 重构用户服务类
test: 添加用户模块测试
chore: 更新依赖包

# ❌ 错误示例
添加功能
修复bug
update
fix
```

**分支管理规范**
- 使用 Git Flow 工作流
- 主分支：`main`, `develop`
- 功能分支：`feature/功能名称`
- 修复分支：`fix/问题描述`
- 发布分支：`release/版本号`

```
# ✅ 正确示例
main
develop
feature/user-registration
feature/order-management
fix/login-error
release/v1.0.0

# ❌ 错误示例
master
dev
user-registration
order
fix-login
release-1.0
```

##### 3.4.2 注释规范

**文件头注释**
```typescript
/**
 * @file 用户认证模块
 * @description 处理用户登录、注册、权限验证等核心功能
 * @module auth
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 */
```

**函数注释**
```typescript
/**
 * @description 根据用户ID获取用户信息
 * @param userId - 用户ID (必填)
 * @returns Promise<User> 用户对象
 * @throws {Error} 当用户不存在时抛出错误
 * @example
 * const user = await getUserById('123')
 * console.log(user.name)
 */
async function getUserById(userId: string): Promise<User> {
  const user = await userRepository.findById(userId)
  if (!user) {
    throw new Error(`用户 ${userId} 不存在`)
  }
  return user
}
```

**行内注释**
```typescript
// ✅ 正确示例
const token = generateToken(user) // 生成JWT token
const isValid = validateEmail(email) // 验证邮箱格式

// 检查用户权限
if (user.role === 'admin') {
  // 管理员有所有权限
  return true
}

// ❌ 错误示例
const token = generateToken(user)
const isValid = validateEmail(email)

if (user.role === 'admin') {
  return true
}
```

##### 3.4.3 安全编码规范

**输入验证**
```typescript
// ✅ 正确示例
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(0).max(150)
})

type User = z.infer<typeof UserSchema>

function createUser(userData: unknown): User {
  return UserSchema.parse(userData)
}

// ❌ 错误示例
function createUser(userData: any) {
  return {
    email: userData.email,
    password: userData.password
  }
}
```

**密码处理**
```typescript
// ✅ 正确示例
import bcrypt from 'bcrypt'

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// ❌ 错误示例
function hashPassword(password: string): string {
  return password // 不应该明文存储密码
}
```

**SQL注入防护**
```typescript
// ✅ 正确示例
async function getUserById(userId: string): Promise<User> {
  const query = 'SELECT * FROM users WHERE id = $1'
  const result = await db.query(query, [userId])
  return result.rows[0]
}

// ❌ 错误示例
async function getUserById(userId: string): Promise<User> {
  const query = `SELECT * FROM users WHERE id = '${userId}'` // SQL注入风险
  const result = await db.query(query)
  return result.rows[0]
}
```

**XSS防护**
```typescript
// ✅ 正确示例
import DOMPurify from 'dompurify'

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}

// ❌ 错误示例
function renderHtml(html: string): string {
  return html // XSS风险
}
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
