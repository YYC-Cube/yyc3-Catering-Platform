# TypeScript 类型检查指南

## 概述

TypeScript 编译器提供了强大的静态类型检查功能，帮助在编译时发现错误。

## 配置

项目的 TypeScript 配置位于 `tsconfig.json`，主要配置项：

```json
{
  "compilerOptions": {
    "strict": true,                    // 启用所有严格类型检查
    "noImplicitAny": true,            // 禁止隐式 any
    "strictNullChecks": true,          // 严格 null 检查
    "noUncheckedIndexedAccess": true,    // 索引访问严格检查
    "exactOptionalPropertyTypes": true,  // 精确可选属性类型
    "noImplicitReturns": true,         // 禁止隐式返回
    "noImplicitThis": true,           // 禁止隐式 this
    "noImplicitOverride": true,        // 禁止隐式覆盖
  }
}
```

## 使用方法

### 1. 运行类型检查

```bash
# 检查整个项目
pnpm type-check

# 只检查后端
pnpm type-check:backend

# 只检查前端
pnpm type-check:frontend

# 检查特定文件
pnpm tsc --noEmit backend/services/user-service/src/app.ts
```

### 2. 生成详细报告

```bash
# 生成详细的错误报告
pnpm type-check > type-check-report.txt

# 只显示错误，不显示其他信息
pnpm type-check 2>&1 | grep "error TS"
```

### 3. 监视模式（开发时）

```bash
# 使用 tsc --watch 监视文件变化
pnpm tsc --noEmit --watch
```

## 常见类型错误与解决

### 1. TS2379: 精确可选属性类型错误

**错误信息**:
```
Type 'number | undefined' is not assignable to type 'number' with 'exactOptionalPropertyTypes: true'.
```

**原因**: `exactOptionalPropertyTypes: true` 选项使得 `undefined` 不能赋值给可选属性。

**修复方法**:

```typescript
// ❌ 错误
interface Config {
  value?: number;
}

const config: Config = {
  value: undefined,  // 错误
};

// ✅ 正确 - 不包含该属性
const config: Config = {};

// ✅ 正确 - 使用 Partial 类型
const config: Partial<Config> = {
  value: undefined,
};

// ✅ 正确 - 使用默认值
const config: Config = {
  value: 0,
};
```

### 2. TS2532: 可能为 undefined 的对象

**错误信息**:
```
Object is possibly 'undefined'.
```

**修复方法**:

```typescript
// ❌ 错误
const arr = [1, 2, 3];
const value = arr[arr.length - 1];  // 可能为 undefined

// ✅ 正确 - 使用类型守卫
const value = arr[arr.length - 1];
if (value !== undefined) {
  console.log(value);
}

// ✅ 正确 - 使用非空断言（谨慎使用）
const value = arr[arr.length - 1]!;

// ✅ 正确 - 使用 at() 方法（ES2022+）
const value = arr.at(-1);
```

### 3. TS18048: 属性可能为 undefined

**错误信息**:
```
'property' is possibly 'undefined'.
```

**修复方法**:

```typescript
// ❌ 错误
interface User {
  id?: number;
}
const user: User = {};
console.log(user.id);  // 可能为 undefined

// ✅ 正确 - 使用可选链
console.log(user.id?.toString());

// ✅ 正确 - 使用类型守卫
if (user.id !== undefined) {
  console.log(user.id);
}

// ✅ 正确 - 提供默认值
console.log(user.id ?? 0);
```

### 4. TS4111: 索引签名属性访问

**错误信息**:
```
Property 'name' comes from an index signature, so it must be accessed with ['name'].
```

**原因**: `noPropertyAccessFromIndexSignature: true` 选项要求使用方括号访问索引签名属性。

**修复方法**:

```typescript
// ❌ 错误
interface Data {
  [key: string]: unknown;
}
const data: Data = {};
console.log(data.name);  // 错误

// ✅ 正确
console.log(data['name']);
```

### 5. TS2308: 重复导出错误

**错误信息**:
```
Module has already exported a member named 'TypeName'.
```

**修复方法**:

```typescript
// ❌ 错误
export * from './a';  // 导出 TypeA
export * from './b';  // 也导出 TypeA

// ✅ 正确 - 显式重新导出
export * from './a';
export { TypeA as TypeA_FromB } from './b';

// ✅ 正确 - 从一个地方导出
export { TypeA, TypeB, TypeC } from './unified-types';
```

### 6. TS2322: 类型不兼容

**错误信息**:
```
Type 'X' is not assignable to type 'Y'.
```

**修复方法**:

```typescript
// ❌ 错误
interface User {
  id: number;
}
interface APIUser {
  id: string;
}
const apiUser: APIUser = { id: '123' };
const user: User = apiUser;  // 错误

// ✅ 正确 - 使用类型转换
const user: User = {
  id: parseInt(apiUser.id, 10),
};

// ✅ 正确 - 使用类型断言（谨慎使用）
const user = apiUser as User;

// ✅ 正确 - 使用映射函数
const user = mapAPIUserToUser(apiUser);
```

## 使用统一类型系统

### 导入类型

```typescript
// ✅ 推荐使用 - 导入特定类型
import type { BaseUser, AuthUser, UserRole } from '@yyc3/types/entities/user';
import type { ICacheClient, CacheStrategy } from '@yyc3/types/services/cache';
import type { ApiResponse, PaginatedResponse } from '@yyc3/types/services/api';
import type { AppError, ErrorCode } from '@yyc3/types/common/error';
import type { TypeConverter } from '@yyc3/types/utils/type-converter';

// ✅ 统一导入（导入所有类型）
import * as Types from '@yyc3/types';

// ✅ 别名导入
import { BaseUser as User } from '@yyc3/types/entities/user';
```

### 类型转换

```typescript
// 前端转后端
import { TypeConverter } from '@yyc3/types/utils/type-converter';

const authUser = TypeConverter.frontendUserToAuthUser(frontendUser);

// 后端转前端
const frontendUser = TypeConverter.authUserToFrontendUser(authUser);

// 批量转换
const convertedUsers = TypeConverter.convertUsers(authUsers);

// 转换分页数据
const convertedData = TypeConverter.convertPaginationData(
  apiData,
  (item) => TypeConverter.authUserToFrontendUser(item)
);
```

## VSCode 集成

### 安装 TypeScript 扩展

VSCode 内置了 TypeScript 支持，无需额外安装。

### 配置

在 `.vscode/settings.json` 中添加：

```json
{
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.ts": "explicit"
  }
}
```

## Pre-commit Hook

项目配置了 Husky pre-commit hook，在提交代码前自动运行类型检查：

```bash
# .husky/pre-commit
pnpm type-check || {
  echo "❌ TypeScript 类型检查失败，请修复后再提交"
  exit 1
}
```

## CI/CD 集成

在 CI/CD 流程中，类型检查是必经环节：

```yaml
# .github/workflows/ci.yml
jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm type-check
```

## 高级配置

### 路径别名

在 `tsconfig.json` 中配置的路径别名：

```json
{
  "compilerOptions": {
    "paths": {
      "@yyc3/types/*": ["./types/*"],
      "@yyc3/types/entities/*": ["./types/entities/*"],
      "@yyc3/types/services/*": ["./types/services/*"],
      "@yyc3/types/common/*": ["./types/common/*"]
    }
  }
}
```

### 类型根目录

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"],
    "types": ["node"]
  }
}
```

## 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 编译器选项](https://www.typescriptlang.org/tsconfig)
- [TypeScript 深入理解](https://basarat.gitbook.io/typescript/)
- [类型体操](https://github.com/type-challenges/type-challenges)
