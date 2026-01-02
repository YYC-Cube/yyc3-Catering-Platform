---

**@file**：YYC³-编码规范手册
**@description**：YYC³餐饮行业智能化平台的编码规范手册
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：YYC³,文档

---
# 🔖 YYC³ 编码规范手册

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 属性 | 内容 |
|------|------|
| **文档标题** | YYC³ 编码规范手册 |
| **文档类型** | 技巧类文档 |
| **所属阶段** | 开发实施 |
| **遵循规范** | YYC³ 团队标准化规范 v1.0.0 |
| **版本号** | v1.0.0 |
| **创建日期** | 2025-01-30 |
| **作者** | YYC³ Team |
| **更新日期** | 2025-01-30 |

---

## 📑 目录

1. [概述](#1-概述)
2. [命名规范](#2-命名规范)
3. [代码格式](#3-代码格式)
4. [注释规范](#4-注释规范)
5. [代码质量](#5-代码质量)
6. [错误处理](#6-错误处理)
7. [性能优化](#7-性能优化)
8. [安全规范](#8-安全规范)
9. [测试规范](#9-测试规范)
10. [版本控制](#10-版本控制)

---

## 1. 概述

### 1.1 规范目的

本规范旨在提高代码质量、可读性和可维护性，确保团队成员编写一致、高质量的代码。

### 1.2 适用范围

本规范适用于 YYC³ 餐饮管理平台的所有代码，包括但不限于：
- TypeScript/JavaScript 代码
- Python 代码
- SQL 代码
- 配置文件

### 1.3 核心原则

- **可读性优先**：代码应该像文章一样易读
- **一致性**：保持代码风格一致
- **简洁性**：避免不必要的复杂性
- **可维护性**：便于后续维护和扩展

---

## 2. 命名规范

### 2.1 通用规则

#### 2.1.1 命名原则

- 使用有意义的名称，避免缩写
- 遵循语言惯例
- 保持一致性
- 避免使用保留字

#### 2.1.2 语言选择

- 使用英文命名
- 避免使用拼音
- 避免使用中文

### 2.2 TypeScript/JavaScript 命名

#### 2.2.1 变量命名

使用 **camelCase**（小驼峰命名法）：

```typescript
// ✅ 正确
const userName = 'John';
const userAge = 25;
const isLoggedIn = true;

// ❌ 错误
const user_name = 'John';
const UserAge = 25;
const isloggedin = true;
```

#### 2.2.2 常量命名

使用 **UPPER_SNAKE_CASE**（大写下划线命名法）：

```typescript
// ✅ 正确
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;

// ❌ 错误
const maxRetryCount = 3;
const apiBaseUrl = 'https://api.example.com';
```

#### 2.2.3 函数命名

使用 **camelCase**，以动词开头：

```typescript
// ✅ 正确
function getUserInfo(userId: string): Promise<User> {
  // ...
}

function calculateTotal(price: number, quantity: number): number {
  // ...
}

function validateEmail(email: string): boolean {
  // ...
}

// ❌ 错误
function UserInfo(userId: string): Promise<User> {
  // ...
}

function total(price: number, quantity: number): number {
  // ...
}
```

#### 2.2.4 类命名

使用 **PascalCase**（大驼峰命名法）：

```typescript
// ✅ 正确
class UserService {
  // ...
}

class OrderController {
  // ...
}

class ProductRepository {
  // ...
}

// ❌ 错误
class userService {
  // ...
}

class order_controller {
  // ...
}
```

#### 2.2.5 接口命名

使用 **PascalCase**，以 **I** 开头：

```typescript
// ✅ 正确
interface IUser {
  id: string;
  name: string;
  email: string;
}

interface IOrderService {
  createOrder(order: IOrder): Promise<IOrder>;
  getOrder(orderId: string): Promise<IOrder>;
}

// ❌ 错误
interface User {
  id: string;
  name: string;
  email: string;
}

interface IorderService {
  createOrder(order: IOrder): Promise<IOrder>;
}
```

#### 2.2.6 类型别名命名

使用 **PascalCase**，不以 **I** 开头：

```typescript
// ✅ 正确
type UserRole = 'admin' | 'user' | 'guest';
type OrderStatus = 'pending' | 'processing' | 'completed';
type ProductCategory = 'food' | 'beverage' | 'dessert';

// ❌ 错误
type userRole = 'admin' | 'user' | 'guest';
type IOrderStatus = 'pending' | 'processing' | 'completed';
```

#### 2.2.7 枚举命名

使用 **PascalCase**，枚举值使用 **UPPER_SNAKE_CASE**：

```typescript
// ✅ 正确
enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// ❌ 错误
enum orderStatus {
  pending = 'pending',
  processing = 'processing',
  completed = 'completed'
}

enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}
```

#### 2.2.8 文件命名

使用 **kebab-case**（短横线命名法）：

```typescript
// ✅ 正确
// file: user-service.ts
export class UserService {
  // ...
}

// file: order-controller.ts
export class OrderController {
  // ...
}

// file: product-repository.ts
export class ProductRepository {
  // ...
}

// ❌ 错误
// file: userService.ts
export class UserService {
  // ...
}

// file: order_controller.ts
export class OrderController {
  // ...
}
```

### 2.3 Python 命名

#### 2.3.1 变量命名

使用 **snake_case**（下划线命名法）：

```python
# ✅ 正确
user_name = 'John'
user_age = 25
is_logged_in = True

# ❌ 错误
userName = 'John'
userAge = 25
isloggedin = True
```

#### 2.3.2 常量命名

使用 **UPPER_SNAKE_CASE**：

```python
# ✅ 正确
MAX_RETRY_COUNT = 3
API_BASE_URL = 'https://api.example.com'
DEFAULT_PAGE_SIZE = 20

# ❌ 错误
max_retry_count = 3
api_base_url = 'https://api.example.com'
```

#### 2.3.3 函数命名

使用 **snake_case**，以动词开头：

```python
# ✅ 正确
def get_user_info(user_id: str) -> dict:
    pass

def calculate_total(price: float, quantity: int) -> float:
    pass

def validate_email(email: str) -> bool:
    pass

# ❌ 错误
def UserInfo(user_id: str) -> dict:
    pass

def total(price: float, quantity: int) -> float:
    pass
```

#### 2.3.4 类命名

使用 **PascalCase**：

```python
# ✅ 正确
class UserService:
    pass

class OrderController:
    pass

class ProductRepository:
    pass

# ❌ 错误
class userService:
    pass

class order_controller:
    pass
```

#### 2.3.5 文件命名

使用 **snake_case**：

```python
# ✅ 正确
# file: user_service.py
class UserService:
    pass

# file: order_controller.py
class OrderController:
    pass

# ❌ 错误
# file: userService.py
class UserService:
    pass

# file: order-controller.py
class OrderController:
    pass
```

---

## 3. 代码格式

### 3.1 缩进

使用 **2 个空格**缩进，不使用 Tab：

```typescript
// ✅ 正确
function calculateTotal(price: number, quantity: number): number {
  const subtotal = price * quantity;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  return total;
}

// ❌ 错误
function calculateTotal(price: number, quantity: number): number {
    const subtotal = price * quantity;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return total;
}
```

### 3.2 行长度

每行代码不超过 **100 个字符**：

```typescript
// ✅ 正确
const result = await fetch(
  'https://api.example.com/users?page=1&limit=20&sort=name'
);

// ❌ 错误
const result = await fetch('https://api.example.com/users?page=1&limit=20&sort=name');
```

### 3.3 空行

在函数、类、逻辑块之间添加空行：

```typescript
// ✅ 正确
function getUserInfo(userId: string): Promise<User> {
  const user = await userRepository.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

function updateUser(userId: string, data: UpdateUserDto): Promise<User> {
  const user = await userRepository.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const updatedUser = await userRepository.update(userId, data);
  return updatedUser;
}

// ❌ 错误
function getUserInfo(userId: string): Promise<User> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
function updateUser(userId: string, data: UpdateUserDto): Promise<User> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const updatedUser = await userRepository.update(userId, data);
  return updatedUser;
}
```

### 3.4 分号

在语句末尾使用分号：

```typescript
// ✅ 正确
const userName = 'John';
const userAge = 25;
console.log(userName, userAge);

// ❌ 错误
const userName = 'John'
const userAge = 25
console.log(userName, userAge)
```

### 3.5 引号

使用 **单引号**，除非字符串中包含单引号：

```typescript
// ✅ 正确
const message = 'Hello, World!';
const greeting = "It's a beautiful day!";

// ❌ 错误
const message = "Hello, World!";
const greeting = 'It\'s a beautiful day!';
```

---

## 4. 注释规范

### 4.1 文件头注释

每个文件都应包含文件头注释：

```typescript
/**
 * @file 用户服务模块
 * @description 处理用户相关的业务逻辑
 * @module user
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
```

### 4.2 函数注释

使用 JSDoc 格式注释函数：

```typescript
/**
 * 获取用户信息
 * @description 根据用户ID获取用户详细信息
 * @param userId - 用户ID
 * @returns Promise<User> 用户对象
 * @throws {Error} 当用户不存在时抛出错误
 * @example
 * ```typescript
 * const user = await getUserInfo('user-123');
 * console.log(user.name);
 * ```
 */
async function getUserInfo(userId: string): Promise<User> {
  const user = await userRepository.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}
```

### 4.3 类注释

使用 JSDoc 格式注释类：

```typescript
/**
 * 用户服务类
 * @description 处理用户相关的业务逻辑
 * @class UserService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */
class UserService {
  /**
   * 创建用户
   * @description 创建新用户
   * @param userData - 用户数据
   * @returns Promise<User> 创建的用户对象
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    // ...
  }
}
```

### 4.4 行内注释

在复杂逻辑处添加行内注释：

```typescript
// 计算订单总额，包括商品总额、运费和税费
const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shipping = subtotal > 100 ? 0 : 10; // 满100元免运费
const tax = subtotal * 0.1; // 10%税费
const total = subtotal + shipping + tax;
```

### 4.5 TODO 注释

使用 TODO 标记待办事项：

```typescript
// TODO: 添加缓存机制以提高性能
async function getUserInfo(userId: string): Promise<User> {
  const user = await userRepository.findById(userId);
  return user;
}

// TODO: 需要优化这个查询，考虑添加索引
async function getOrdersByUser(userId: string): Promise<Order[]> {
  const orders = await orderRepository.findByUserId(userId);
  return orders;
}
```

---

## 5. 代码质量

### 5.1 单一职责原则

每个函数只做一件事：

```typescript
// ✅ 正确
function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

function calculateTotal(subtotal: number, tax: number, shipping: number): number {
  return subtotal + tax + shipping;
}

// ❌ 错误
function calculateOrderTotal(items: OrderItem[], taxRate: number, shipping: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shipping;
  return total;
}
```

### 5.2 函数长度

函数不超过 **50 行**：

```typescript
// ✅ 正确
function validateUser(user: User): ValidationResult {
  if (!user.name) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (!user.email) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!isValidEmail(user.email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}

// ❌ 错误
function validateUser(user: User): ValidationResult {
  if (!user.name) {
    return { valid: false, error: 'Name is required' };
  }
  if (!user.email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!isValidEmail(user.email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (!user.phone) {
    return { valid: false, error: 'Phone is required' };
  }
  if (!isValidPhone(user.phone)) {
    return { valid: false, error: 'Invalid phone format' };
  }
  if (!user.address) {
    return { valid: false, error: 'Address is required' };
  }
  // ... 更多验证逻辑
  return { valid: true };
}
```

### 5.3 避免魔法数字

使用常量代替魔法数字：

```typescript
// ✅ 正确
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;
const TAX_RATE = 0.1;

async function fetchData(url: string): Promise<Data> {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRY_COUNT) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      retryCount++;
    }
  }
  
  throw new Error('Failed to fetch data');
}

// ❌ 错误
async function fetchData(url: string): Promise<Data> {
  let retryCount = 0;
  
  while (retryCount < 3) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      retryCount++;
    }
  }
  
  throw new Error('Failed to fetch data');
}
```

### 5.4 避免深层嵌套

使用提前返回避免深层嵌套：

```typescript
// ✅ 正确
function processOrder(order: Order): ProcessResult {
  if (!order) {
    return { success: false, error: 'Order is required' };
  }
  
  if (order.status !== 'pending') {
    return { success: false, error: 'Order is not pending' };
  }
  
  if (!order.items || order.items.length === 0) {
    return { success: false, error: 'Order has no items' };
  }
  
  // 处理订单
  return { success: true };
}

// ❌ 错误
function processOrder(order: Order): ProcessResult {
  if (order) {
    if (order.status === 'pending') {
      if (order.items && order.items.length > 0) {
        // 处理订单
        return { success: true };
      } else {
        return { success: false, error: 'Order has no items' };
      }
    } else {
      return { success: false, error: 'Order is not pending' };
    }
  } else {
    return { success: false, error: 'Order is required' };
  }
}
```

---

## 6. 错误处理

### 6.1 错误捕获

使用 try-catch 捕获错误：

```typescript
// ✅ 正确
async function getUserInfo(userId: string): Promise<User> {
  try {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    logger.error('Failed to get user info', { userId, error });
    throw error;
  }
}

// ❌ 错误
async function getUserInfo(userId: string): Promise<User> {
  const user = await userRepository.findById(userId);
  return user;
}
```

### 6.2 错误类型

定义自定义错误类型：

```typescript
// ✅ 正确
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// 使用
function validateUser(user: User): void {
  if (!user.name) {
    throw new ValidationError('Name is required', 'name');
  }
  
  if (!user.email) {
    throw new ValidationError('Email is required', 'email');
  }
}
```

### 6.3 错误日志

记录详细的错误信息：

```typescript
// ✅ 正确
async function processOrder(orderId: string): Promise<Order> {
  try {
    const order = await orderRepository.findById(orderId);
    
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }
    
    const processedOrder = await orderService.process(order);
    return processedOrder;
  } catch (error) {
    logger.error('Failed to process order', {
      orderId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// ❌ 错误
async function processOrder(orderId: string): Promise<Order> {
  try {
    const order = await orderRepository.findById(orderId);
    const processedOrder = await orderService.process(order);
    return processedOrder;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

---

## 7. 性能优化

### 7.1 避免不必要的计算

使用缓存避免重复计算：

```typescript
// ✅ 正确
class UserService {
  private cache: Map<string, User> = new Map();
  
  async getUserInfo(userId: string): Promise<User> {
    // 检查缓存
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }
    
    // 从数据库获取
    const user = await userRepository.findById(userId);
    
    // 存入缓存
    this.cache.set(userId, user);
    
    return user;
  }
}

// ❌ 错误
class UserService {
  async getUserInfo(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    return user;
  }
}
```

### 7.2 使用异步操作

使用 async/await 处理异步操作：

```typescript
// ✅ 正确
async function fetchUserData(userId: string): Promise<UserData> {
  const [user, orders, preferences] = await Promise.all([
    userRepository.findById(userId),
    orderRepository.findByUserId(userId),
    preferenceRepository.findByUserId(userId)
  ]);
  
  return {
    user,
    orders,
    preferences
  };
}

// ❌ 错误
async function fetchUserData(userId: string): Promise<UserData> {
  const user = await userRepository.findById(userId);
  const orders = await orderRepository.findByUserId(userId);
  const preferences = await preferenceRepository.findByUserId(userId);
  
  return {
    user,
    orders,
    preferences
  };
}
```

### 7.3 避免内存泄漏

及时清理资源：

```typescript
// ✅ 正确
class DataProcessor {
  private timer?: NodeJS.Timeout;
  
  startProcessing(): void {
    this.timer = setInterval(() => {
      this.process();
    }, 1000);
  }
  
  stopProcessing(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}

// ❌ 错误
class DataProcessor {
  startProcessing(): void {
    setInterval(() => {
      this.process();
    }, 1000);
  }
}
```

---

## 8. 安全规范

### 8.1 输入验证

验证所有输入：

```typescript
// ✅ 正确
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function createUser(userData: CreateUserDto): User {
  if (!userData.email || !validateEmail(userData.email)) {
    throw new ValidationError('Invalid email', 'email');
  }
  
  if (!userData.password || userData.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters', 'password');
  }
  
  // 创建用户
  return userRepository.create(userData);
}

// ❌ 错误
function createUser(userData: CreateUserDto): User {
  return userRepository.create(userData);
}
```

### 8.2 密码安全

使用安全的密码哈希：

```typescript
// ✅ 正确
import bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ❌ 错误
function hashPassword(password: string): string {
  return password; // 不安全！
}
```

### 8.3 SQL 注入防护

使用参数化查询：

```typescript
// ✅ 正确
async function getUserByEmail(email: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [users] = await database.execute(query, [email]);
  return users[0] || null;
}

// ❌ 错误
async function getUserByEmail(email: string): Promise<User | null> {
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  const [users] = await database.execute(query);
  return users[0] || null;
}
```

---

## 9. 测试规范

### 9.1 单元测试

为每个函数编写单元测试：

```typescript
// ✅ 正确
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const user = await userService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });
    
    it('should throw error if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      await expect(userService.createUser(userData))
        .rejects.toThrow('Email already exists');
    });
  });
});

// ❌ 错误
describe('UserService', () => {
  it('should work', async () => {
    const user = await userService.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    
    expect(user).toBeDefined();
  });
});
```

### 9.2 测试覆盖率

保持测试覆盖率在 **80% 以上**：

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看覆盖率报告
open coverage/lcov-report/index.html
```

---

## 10. 版本控制

### 10.1 Git 提交信息

使用 Conventional Commits 规范：

```bash
# ✅ 正确
feat: 添加用户注册功能

fix: 修复订单计算错误

docs: 更新API文档

style: 格式化代码

refactor: 重构用户服务

perf: 优化数据库查询

test: 添加单元测试

chore: 更新依赖

# ❌ 错误
添加用户注册功能

修复bug

update
```

### 10.2 分支管理

使用 Git Flow 分支模型：

```bash
# 主分支
main        # 生产环境
develop     # 开发环境

# 功能分支
feature/user-registration
feature/order-management

# 修复分支
bugfix/login-error

# 发布分支
release/v1.0.0

# 热修复分支
hotfix/critical-bug
```

---

## 📄 文档标尾 (Footer)

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」




## 概述

### 概述

本文档提供了实用的技巧和方法，帮助开发者提高工作效率和代码质量。

#### 适用场景

- 日常开发工作
- 代码优化和重构
- 问题排查和调试
- 性能优化和调优

#### 预期收益

- 提高开发效率
- 减少代码错误
- 优化系统性能
- 提升代码可维护性



## 核心概念

### 核心概念

#### 关键术语

- **技巧**：经过实践验证的有效方法
- **最佳实践**：业界公认的优秀做法
- **模式**：可重复使用的解决方案
- **原则**：指导设计的基本准则

#### 核心原理

1. **DRY原则**（Don't Repeat Yourself）
   - 避免代码重复
   - 提取公共逻辑
   - 使用函数和类封装

2. **KISS原则**（Keep It Simple, Stupid）
   - 保持简单
   - 避免过度设计
   - 优先可读性

3. **YAGNI原则**（You Aren't Gonna Need It）
   - 只实现当前需要的功能
   - 避免过度工程
   - 保持代码精简



## 实施步骤

### 实施步骤

#### 步骤1：准备工作

```bash
# 安装必要工具
npm install -g typescript eslint prettier

# 初始化项目
npm init -y
npm install --save-dev typescript @types/node
```

#### 步骤2：配置环境

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### 步骤3：编写代码

```typescript
// 创建主文件
// src/index.ts
function main() {
  console.log('Hello, YYC³!');
}

main();
```

#### 步骤4：测试验证

```bash
# 运行代码
npm run dev

# 运行测试
npm test
```



## 代码示例

### 代码示例

#### 示例1：基础用法

```typescript
// 简单示例
function greet(name: string): string {
  return `Hello, ${name}!`;
}

const message = greet('YYC³');
console.log(message); // 输出: Hello, YYC³!
```

#### 示例2：高级用法

```typescript
// 异步操作
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// 使用示例
fetchData('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

#### 示例3：错误处理

```typescript
// 自定义错误类
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 使用示例
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('email', '邮箱格式不正确');
  }
}

try {
  validateEmail('invalid-email');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`验证失败: ${error.field} - ${error.message}`);
  }
}
```



## 注意事项

### 注意事项

#### 常见陷阱

1. **异步操作错误**
```typescript
// ❌ 错误：没有等待异步操作
async function processData() {
  const data = fetchData(); // 忘记await
  console.log(data); // 输出Promise对象
}

// ✅ 正确：使用await
async function processData() {
  const data = await fetchData();
  console.log(data); // 输出实际数据
}
```

2. **内存泄漏**
```typescript
// ❌ 错误：没有清理事件监听器
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []); // 缺少清理函数

// ✅ 正确：清理事件监听器
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### 性能注意事项

1. **避免不必要的重渲染**
```typescript
// ❌ 错误：每次都创建新对象
<Component data={{ value: 1 }} />

// ✅ 正确：使用useMemo缓存
const memoizedData = useMemo(() => ({ value: 1 }), []);
<Component data={memoizedData} />
```

2. **避免大对象传递**
```typescript
// ❌ 错误：传递整个大对象
<Component user={user} />

// ✅ 正确：只传递需要的属性
<Component userName={user.name} userId={user.id} />
```



## 最佳实践

### 最佳实践

#### 代码规范

1. **命名规范**
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 类：PascalCase
class UserService { }

// 接口：PascalCase，前缀I（可选）
interface IUserService { }
```

2. **注释规范**
```typescript
/**
 * 创建用户
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {Error} 当邮箱已存在时抛出错误
 */
async function createUser(
  email: string, 
  password: string
): Promise<User> {
  // 实现
}
```

#### 错误处理

```typescript
// 统一错误处理
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // 记录未预期的错误
  logger.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});
```

#### 日志记录

```typescript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用日志
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```



## 常见问题

### 常见问题

#### Q1: 如何处理异步错误？

**A**: 使用try-catch捕获异步错误：

```typescript
async function handleRequest() {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

#### Q2: 如何优化React组件性能？

**A**: 使用以下优化技术：

1. **React.memo**：避免不必要的重渲染
2. **useMemo**：缓存计算结果
3. **useCallback**：缓存函数引用
4. **代码分割**：懒加载组件

```typescript
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);
  return <div>{processedData}</div>;
});
```

#### Q3: 如何管理应用状态？

**A**: 根据应用复杂度选择合适的状态管理方案：

1. **简单应用**：使用React Context API
2. **中等应用**：使用Zustand或Redux Toolkit
3. **复杂应用**：使用Redux + 中间件

```typescript
// Zustand示例
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));
```



## 案例分析

### 案例分析

#### 案例1：性能优化

**问题**：页面加载时间过长，用户体验差。

**分析**：
- 首次内容绘制(FCP)：3.2秒
- 最大内容绘制(LCP)：5.8秒
- 累积布局偏移(CLS)：0.25

**解决方案**：
1. 实现代码分割和懒加载
2. 优化图片加载（使用WebP格式，添加loading="lazy"）
3. 启用Gzip压缩
4. 使用CDN加速静态资源

**结果**：
- FCP：1.2秒（↓62.5%）
- LCP：2.1秒（↓63.8%）
- CLS：0.08（↓68%）

#### 案例2：错误处理改进

**问题**：错误信息不清晰，难以定位问题。

**分析**：
- 错误信息过于简单
- 缺少错误上下文
- 没有错误追踪

**解决方案**：
1. 实现自定义错误类
2. 添加错误堆栈追踪
3. 集成错误监控工具（Sentry）
4. 实现错误日志记录

**结果**：
- 错误定位时间减少70%
- 错误解决率提高40%
- 用户投诉减少60%

#### 案例3：代码重构

**问题**：代码重复率高，维护困难。

**分析**：
- 代码重复率：35%
- 函数平均长度：120行
- 圈复杂度：15

**解决方案**：
1. 提取公共逻辑到工具函数
2. 使用设计模式重构
3. 拆分大函数
4. 添加单元测试

**结果**：
- 代码重复率：8%（↓77%）
- 函数平均长度：35行（↓71%）
- 圈复杂度：5（↓67%）


## 相关文档

- [🔖 YYC³ 开发效率提升技巧集](YYC3-Cater-开发实施/技巧类/03-YYC3-Cater--技巧类-开发效率提升技巧集.md) - YYC3-Cater-开发实施/技巧类
- [🔖 YYC³ 版本控制最佳实践](YYC3-Cater-开发实施/技巧类/02-YYC3-Cater--技巧类-版本控制最佳实践.md) - YYC3-Cater-开发实施/技巧类
- [常见开发架构问题解决方案](YYC3-Cater-开发实施/技巧类/04-YYC3-Cater--技巧类-常见开发架构问题解决方案.md) - YYC3-Cater-开发实施/技巧类
- [AI模型开发调优技巧](YYC3-Cater-开发实施/技巧类/05-YYC3-Cater--技巧类-AI模型开发调优技巧.md) - YYC3-Cater-开发实施/技巧类
- [YYC³智能餐饮平台 - 技术实现指南](YYC3-Cater-开发实施/架构类/08-YYC3-Cater--架构类-技术实现指南.md) - YYC3-Cater-开发实施/架构类
