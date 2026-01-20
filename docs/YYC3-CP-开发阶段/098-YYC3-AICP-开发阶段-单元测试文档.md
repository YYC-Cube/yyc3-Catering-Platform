---
@file: 098-YYC3-AICP-开发阶段-单元测试文档.md
@description: YYC3-AICP 单元测试的用例、覆盖率要求、执行规范的完整文档
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [开发阶段],[单元测试],[质量保障]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 098-YYC3-AICP-开发阶段-单元测试文档

## 概述

本文档详细描述YYC3-YYC3-AICP-开发阶段-单元测试文档相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范单元测试文档相关的业务标准与技术落地要求
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

### 3. 单元测试实施规范

#### 3.1 测试框架配置

##### 3.1.1 Vitest 配置

项目使用 Vitest 作为主要测试框架，配置文件位于项目根目录的 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: ['node_modules/**', '**/__tests__/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    setupFiles: ['./tests/setup.ts'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    maxConcurrency: 5
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**配置说明：**
- `globals: true` - 全局启用测试 API，无需手动导入
- `environment: 'node'` - 测试运行环境为 Node.js
- `coverage` - 代码覆盖率配置
  - `provider: 'v8'` - 使用 v8 作为覆盖率提供者
  - `reporter` - 支持多种报告格式（终端文本、JSON、HTML）
  - `thresholds` - 覆盖率阈值要求
- `setupFiles` - 测试前置设置文件
- `testMatch` - 测试文件匹配模式
- `maxConcurrency: 5` - 最大并发测试数

##### 3.1.2 Bun Test 配置

后端 API 测试使用 Bun Test 框架，适用于高性能测试场景：

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
```

**Bun Test 特性：**
- 原生支持 TypeScript
- 极快的测试执行速度
- 与 Bun 运行时深度集成
- 支持快照测试

#### 3.2 测试文件组织规范

##### 3.2.1 文件命名规范

测试文件应遵循以下命名规范：

- **单元测试文件**：`*.test.ts` 或 `*.spec.ts`
- **测试目录**：`__tests__/` 或 `tests/`
- **测试文件位置**：与源文件同级或同级目录下的 `__tests__` 目录

**示例目录结构：**

```
src/
├── utils/
│   ├── format.ts
│   └── __tests__/
│       └── format.test.ts
├── services/
│   ├── orderService.ts
│   └── orderService.test.ts
tests/
├── api/
│   ├── orders.test.ts
│   └── auth.test.ts
├── unit/
│   └── ...
└── integration/
    └── ...
```

##### 3.2.2 测试套件结构

每个测试文件应包含以下结构：

```typescript
// 文件头注释
/**
 * YYC³餐饮行业智能化平台 - 订单API测试
 * @author YYC³
 * @version 1.0.0
 */

// 导入依赖
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { OrderService } from '@/services/orderService'

// 测试数据定义
interface TestData {
  // ...
}

// 测试工具函数
function createTestData(): TestData {
  // ...
}

// 主测试套件
describe('OrderService', () => {
  // 全局钩子
  beforeAll(async () => {
    // 在所有测试前执行一次
  })

  afterAll(async () => {
    // 在所有测试后执行一次
  })

  // 子测试套件
  describe('createOrder', () => {
    // 局部钩子
    beforeEach(async () => {
      // 在每个测试前执行
    })

    afterEach(async () => {
      // 在每个测试后执行
    })

    // 测试用例
    it('应该成功创建订单', async () => {
      // 测试逻辑
      const result = await OrderService.createOrder(orderData)
      expect(result.success).toBe(true)
    })

    it('应该验证必填字段', async () => {
      // 测试逻辑
      await expect(
        OrderService.createOrder({})
      ).rejects.toThrow('必填字段缺失')
    })
  })
})
```

#### 3.3 测试用例编写规范

##### 3.3.1 测试用例命名规范

测试用例名称应清晰描述测试意图，遵循以下格式：

- **正面测试**：`应该 [预期行为]`
- **负面测试**：`应该 [预期错误情况]`
- **边界测试**：`应该处理 [边界条件]`

**示例：**

```typescript
it('应该成功创建新订单', async () => { })
it('应该验证必填字段', async () => { })
it('应该处理空订单列表', async () => { })
it('应该拒绝未认证的请求', async () => { })
```

##### 3.3.2 测试断言规范

使用 `expect` API 进行断言，确保测试结果清晰明确：

```typescript
// 基本断言
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()

// 数组断言
expect(array).toHaveLength(length)
expect(array).toContain(item)
expect(array).toMatchObject(expected)

// 异常断言
await expect(promise).rejects.toThrow('error message')
await expect(promise).resolves.toBe(expected)

// 异步断言
await expect(asyncFunction()).resolves.toEqual(expected)

// 数值断言
expect(number).toBeGreaterThan(value)
expect(number).toBeLessThan(value)
expect(number).toBeCloseTo(value, precision)

// 字符串断言
expect(string).toMatch(/regex/)
expect(string).toContain(substring)
```

##### 3.3.3 测试数据管理

**测试数据创建：**

```typescript
// 使用工厂函数创建测试数据
function createOrderData(overrides: Partial<OrderData> = {}): OrderData {
  return {
    storeId: 1,
    tableNumber: 'A01',
    orderType: 'dine_in',
    items: [
      {
        itemId: 1,
        quantity: 2
      }
    ],
    ...overrides
  }
}

// 使用示例
it('应该成功创建订单', async () => {
  const orderData = createOrderData({
    tableNumber: 'B02',
    specialRequests: '不要辣'
  })
  const result = await OrderService.createOrder(orderData)
  expect(result.success).toBe(true)
})
```

**测试数据清理：**

```typescript
describe('OrderService', () => {
  let testDatabase: TestDatabase

  beforeAll(async () => {
    testDatabase = new TestDatabase()
    await testDatabase.connect()
  })

  afterAll(async () => {
    await testDatabase.disconnect()
  })

  beforeEach(async () => {
    await testDatabase.cleanup()
    await testDatabase.seedTestData()
  })
})
```

#### 3.4 测试覆盖范围

##### 3.4.1 覆盖率要求

项目要求达到以下覆盖率标准：

| 指标 | 最低要求 | 推荐值 |
|------|---------|--------|
| 行覆盖率 (Lines) | 80% | 90% |
| 函数覆盖率 (Functions) | 80% | 90% |
| 分支覆盖率 (Branches) | 70% | 85% |
| 语句覆盖率 (Statements) | 80% | 90% |

**覆盖率检查命令：**

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看覆盖率报告
npm run test:coverage:report

# 生成 HTML 覆盖率报告
npm run test:coverage:html
```

##### 3.4.2 覆盖率报告

覆盖率报告生成在 `coverage/` 目录：

- `coverage/index.html` - HTML 格式的详细报告
- `coverage/coverage-final.json` - JSON 格式的覆盖率数据
- `coverage/lcov.info` - LCOV 格式，用于 CI/CD 集成

#### 3.5 Mock 和 Stub 使用

##### 3.5.1 Mock 函数

使用 `vi.fn()` 创建 Mock 函数：

```typescript
import { vi } from 'vitest'

describe('UserService', () => {
  it('应该调用外部 API', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ id: 1, name: 'Test User' })
    
    const result = await UserService.getUser(1, mockApiCall)
    
    expect(mockApiCall).toHaveBeenCalledWith(1)
    expect(mockApiCall).toHaveBeenCalledTimes(1)
    expect(result.name).toBe('Test User')
  })
})
```

##### 3.5.2 Mock 模块

使用 `vi.mock()` Mock 整个模块：

```typescript
import { vi } from 'vitest'
import { UserService } from '@/services/userService'

// Mock 数据库模块
vi.mock('@/lib/database', () => ({
  default: {
    query: vi.fn(),
    transaction: vi.fn()
  }
}))

describe('UserService', () => {
  it('应该从数据库获取用户', async () => {
    const mockDb = await import('@/lib/database')
    mockDb.default.query.mockResolvedValue([{ id: 1, name: 'Test' }])
    
    const user = await UserService.findById(1)
    expect(user.name).toBe('Test')
  })
})
```

##### 3.5.3 Mock 时间

使用 `vi.useFakeTimers()` Mock 时间：

```typescript
import { vi } from 'vitest'

describe('定时任务', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该每秒执行一次', () => {
    const callback = vi.fn()
    setInterval(callback, 1000)
    
    vi.advanceTimersByTime(3000)
    
    expect(callback).toHaveBeenCalledTimes(3)
  })
})
```

#### 3.6 异步测试

##### 3.6.1 Promise 测试

```typescript
it('应该成功处理异步操作', async () => {
  const result = await asyncFunction()
  expect(result).toBe('success')
})

it('应该正确处理 Promise 错误', async () => {
  await expect(asyncFunction()).rejects.toThrow('error message')
})
```

##### 3.6.2 回调测试

```typescript
it('应该正确处理回调', (done) => {
  callbackFunction((error, result) => {
    expect(error).toBeNull()
    expect(result).toBe('success')
    done()
  })
})
```

#### 3.7 测试最佳实践

##### 3.7.1 AAA 模式

每个测试用例应遵循 AAA（Arrange-Act-Assert）模式：

```typescript
it('应该成功创建订单', async () => {
  // Arrange - 准备测试数据
  const orderData = createOrderData()
  const expectedOrder = { id: 1, ...orderData }
  
  // Act - 执行被测试的操作
  const result = await OrderService.createOrder(orderData)
  
  // Assert - 验证结果
  expect(result).toEqual(expectedOrder)
})
```

##### 3.7.2 测试独立性

每个测试用例应独立运行，不依赖其他测试：

```typescript
describe('OrderService', () => {
  beforeEach(async () => {
    // 每个测试前重置状态
    await resetDatabase()
  })

  it('测试用例1', async () => {
    // 独立的测试逻辑
  })

  it('测试用例2', async () => {
    // 不依赖测试用例1
  })
})
```

##### 3.7.3 测试可读性

使用描述性的测试名称和清晰的断言：

```typescript
// ❌ 不好的示例
it('test1', () => {
  expect(x).toBe(y)
})

// ✅ 好的示例
it('当用户余额不足时，应该返回支付失败错误', async () => {
  const result = await PaymentService.processPayment({
    userId: 1,
    amount: 1000,
    balance: 500
  })
  expect(result.success).toBe(false)
  expect(result.error.code).toBe('INSUFFICIENT_BALANCE')
})
```

#### 3.8 测试执行和 CI/CD 集成

##### 3.8.1 本地测试命令

```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test orders.test.ts

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试并更新快照
npm run test:update-snapshot
```

##### 3.8.2 CI/CD 集成

在 GitHub Actions 中集成测试：

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test:coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

#### 3.9 测试示例

##### 3.9.1 API 测试示例

```typescript
/**
 * 订单API测试
 */
describe('订单API', () => {
  let authToken: string
  let testOrderId: number

  beforeAll(async () => {
    // 获取认证令牌
    const authResponse = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpass'
      })
    })
    authToken = authResponse.data.token
  })

  describe('POST /orders', () => {
    it('应该成功创建新订单', async () => {
      const orderData = {
        storeId: 1,
        tableNumber: 'A01',
        orderType: 'dine_in',
        items: [
          {
            itemId: 1,
            quantity: 2
          }
        ]
      }

      const response = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(orderData)
      })

      expect(response.success).toBe(true)
      expect(response.data.orderNo).toMatch(/^ORD\d{12}$/)
      expect(response.data.status).toBe('pending')
    })

    it('应该验证必填字段', async () => {
      const invalidOrderData = {
        tableNumber: 'A01'
        // 缺少必填字段
      }

      const response = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(invalidOrderData)
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /orders/:id', () => {
    beforeEach(async () => {
      const orderResponse = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          storeId: 1,
          items: [{ itemId: 1, quantity: 1 }]
        })
      })
      testOrderId = orderResponse.data.id
    })

    it('应该获取订单详情', async () => {
      const response = await apiRequest(`/orders/${testOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.success).toBe(true)
      expect(response.data.id).toBe(testOrderId)
    })

    it('应该返回404对于不存在的订单', async () => {
      const response = await apiRequest('/orders/99999', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.statusCode).toBe(404)
    })
  })
})
```

##### 3.9.2 工具函数测试示例

```typescript
/**
 * 格式化工具函数测试
 */
describe('formatCurrency', () => {
  it('应该正确格式化货币', () => {
    expect(formatCurrency(1234.56)).toBe('¥1,234.56')
    expect(formatCurrency(1000000)).toBe('¥1,000,000.00')
    expect(formatCurrency(0)).toBe('¥0.00')
  })

  it('应该支持不同货币符号', () => {
    expect(formatCurrency(1234.56, '$')).toBe('$1,234.56')
    expect(formatCurrency(1234.56, '€')).toBe('€1,234.56')
  })

  it('应该处理无效输入', () => {
    expect(formatCurrency(NaN)).toBe('¥0.00')
    expect(formatCurrency(null as unknown as number)).toBe('¥0.00')
  })
})

describe('formatOrderStatus', () => {
  it('应该正确格式化订单状态', () => {
    expect(formatOrderStatus('pending')).toBe('待确认')
    expect(formatOrderStatus('confirmed')).toBe('已确认')
    expect(formatOrderStatus('preparing')).toBe('制作中')
    expect(formatOrderStatus('completed')).toBe('已完成')
    expect(formatOrderStatus('cancelled')).toBe('已取消')
  })

  it('应该返回原始状态对于未知状态', () => {
    expect(formatOrderStatus('unknown')).toBe('unknown')
  })
})

describe('formatInventoryStatus', () => {
  it('应该正确格式化库存状态', () => {
    // 缺货
    expect(formatInventoryStatus(0, 10, 1000)).toEqual({
      status: 'danger',
      text: '缺货',
      color: 'var(--color-danger)',
      percentage: 0
    })

    // 库存不足
    expect(formatInventoryStatus(5, 10, 1000)).toEqual({
      status: 'warning',
      text: '库存不足 (5)',
      color: 'var(--color-warning)',
      percentage: 0.5
    })

    // 库存正常
    expect(formatInventoryStatus(500, 10, 1000)).toEqual({
      status: 'sufficient',
      text: '库存正常 (500)',
      color: 'var(--color-success)',
      percentage: 50
    })
  })
})
```

#### 3.10 测试问题排查

##### 3.10.1 常见问题

**问题1：测试超时**

```typescript
// 增加超时时间
it('应该完成长时间操作', async () => {
  // 测试逻辑
}, 10000) // 10秒超时
```

**问题2：异步测试未完成**

```typescript
// 确保返回 Promise 或使用 async/await
it('应该正确处理异步操作', async () => {
  await asyncFunction()
  expect(true).toBe(true)
})
```

**问题3：Mock 未生效**

```typescript
// 确保在导入前进行 Mock
vi.mock('@/lib/database')
import { Database } from '@/lib/database'
```

##### 3.10.2 调试技巧

```typescript
// 使用 console.log 调试
it('应该...', async () => {
  const result = await function()
  console.log('Result:', result)
  expect(result).toBe(expected)
})

// 使用 test.only 只运行特定测试
it.only('应该...', async () => {
  // 只运行这个测试
})

// 使用 test.skip 跳过测试
it.skip('应该...', async () => {
  // 跳过这个测试
})
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
