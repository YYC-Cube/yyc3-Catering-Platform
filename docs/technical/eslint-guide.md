# ESLint 使用指南

## 概述

ESLint 是 JavaScript 和 TypeScript 代码的静态分析工具，用于识别潜在问题和强制代码风格。

## 配置

本项目使用 ESLint Flat Config 格式（ESLint v9+），配置文件位于 `.eslintrc.js`。

### 主要规则

```javascript
{
  // TypeScript 相关
  '@typescript-eslint/no-explicit-any': 'error',        // 禁止使用 any 类型
  '@typescript-eslint/explicit-module-boundary-types': 'error',  // 强制模块边界类型定义
  '@typescript-eslint/no-floating-promises': 'warn',             // 警告未处理的 Promise
  '@typescript-eslint/no-misused-promises': 'error',            // 禁止 Promise 误用
  '@typescript-eslint/no-unnecessary-type-assertion': 'error', // 禁止不必要的类型断言

  // 基本规则
  'no-console': 'warn',
  'no-debugger': 'error',
  'no-var': 'error',
  'prefer-const': 'error',
}
```

## 使用方法

### 1. 运行 ESLint 检查

```bash
# 检查整个项目
pnpm lint

# 只检查后端
pnpm lint:backend

# 只检查前端
pnpm lint:frontend

# 检查特定文件
pnpm eslint backend/services/user-service/src/app.ts
```

### 2. 自动修复问题

```bash
# 自动修复可以修复的问题
pnpm lint --fix

# 只检查并修复特定目录
pnpm eslint backend --ext .ts --fix
```

### 3. 针对特定规则检查

```bash
# 只检查 no-explicit-any 规则
pnpm eslint . --rule '@typescript-eslint/no-explicit-any'
```

## 常见问题与解决

### 1. `no-explicit-any` 错误

**错误信息**:
```
@typescript-eslint/no-explicit-any: Unexpected any. Specify a different type.
```

**修复方法**:

```typescript
// ❌ 错误
function processData(data: any) {
  return data.value;
}

// ✅ 正确 - 使用泛型
function processData<T>(data: { value: T }) {
  return data.value;
}

// ✅ 正确 - 使用接口
interface Data {
  value: string;
}
function processData(data: Data) {
  return data.value;
}

// ✅ 正确 - 使用 unknown
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

### 2. `no-floating-promises` 警告

**警告信息**:
```
@typescript-eslint/no-floating-promises: Promises must be awaited, or appropriately handled.
```

**修复方法**:

```typescript
// ❌ 错误
function fetchData() {
  return axios.get('/api/data'); // 未处理的 Promise
}

// ✅ 正确
async function fetchData() {
  const response = await axios.get('/api/data');
  return response.data;
}

// ✅ 正确 - 明确返回 Promise
function fetchData(): Promise<Data> {
  return axios.get('/api/data').then(res => res.data);
}
```

### 3. `explicit-module-boundary-types` 错误

**错误信息**:
```
@typescript-eslint/explicit-module-boundary-types: Missing return type on function.
```

**修复方法**:

```typescript
// ❌ 错误
export function getUser(id: string) {
  return users.find(u => u.id === id);
}

// ✅ 正确
export function getUser(id: string): User | undefined {
  return users.find(u => u.id === id);
}

// ✅ 正确 - 使用泛型
export function getUser<T extends { id: string }>(id: string): T | undefined {
  return users.find(u => u.id === id) as T | undefined;
}
```

### 4. `no-unnecessary-type-assertion` 错误

**错误信息**:
```
@typescript-eslint/no-unnecessary-type-assertion: This assertion is unnecessary since it does not change the type of the expression.
```

**修复方法**:

```typescript
// ❌ 错误
const value = data as any;

// ✅ 正确 - 使用具体类型
const value = data as DataType;

// ✅ 正确 - 使用类型守卫
if (typeof data === 'object' && data !== null) {
  const value = data;
}
```

## VSCode 集成

### 安装 ESLint 扩展

在 VSCode 中安装 [ESLint 扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### 配置

在 `.vscode/settings.json` 中添加：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Pre-commit Hook

项目配置了 Husky pre-commit hook，在提交代码前自动运行 ESLint：

```bash
# .husky/pre-commit
pnpm lint || {
  echo "❌ ESLint 检查失败，请修复后再提交"
  exit 1
}
```

## 禁用规则

如果需要在特定文件中禁用某个规则：

```typescript
// 禁用整个文件
/* eslint-disable @typescript-eslint/no-explicit-any */

// 禁用下一行
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getData();

// 禁用特定行
const data: any = getData(); // eslint-disable-line @typescript-eslint/no-explicit-any
```

## CI/CD 集成

在 CI/CD 流程中，ESLint 检查是必经环节：

```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
```

## 相关资源

- [ESLint 官方文档](https://eslint.org/docs/latest/)
- [@typescript-eslint/eslint-plugin](https://typescript-eslint.io/rules/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
