# YYC³ 智能编程项目规则

> **YYC³（YanYu Cloud Cube）**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***英文***：*All Realms Converge at Cloud Nexus, DeepStack Ignites a New Era*

---

**@file**：YYC³-智能编程项目规则
**@description**：YYC³团队智能编程项目开发规范，包含代码、文档、Git工作流等全方位标准
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：项目规则,开发规范,代码标准,文档规范,YYC³

---

## 📋 目录

- [🎯 核心理念](#-核心理念)
- [📝 文档头部信息标准](#-文档头部信息标准)
- [🏷️ 项目命名规范](#️-项目命名规范)
- [📄 代码文件标头格式](#-代码文件标头格式)
- [📚 文档文件格式标准](#-文档文件格式标准)
- [📖 README文件格式标准](#-readme文件格式标准)
- [🗂️ 文件和目录命名规范](#️-文件和目录命名规范)
- [📦 标准化模板文件](#-标准化模板文件)
- [🔄 Git分支管理策略](#-git分支管理策略)
- [📝 Conventional Commits规范](#-conventional-commits规范)
- [🔒 安全规范](#-安全规范)
- [⚡ 核心规范速查表](#-核心规范速查表)
- [❓ FAQ（常见问题）](#-faq常见问题)
- [🛠️ 实施建议](#️-实施建议)
- [📞 联系信息](#-联系信息)

---

## 🎯 核心理念

YYC³ 智能编程框架基于 **「五高五标五化」** 核心理念构建：

### 五高原则

- **高可用性** - 系统稳定运行，故障自动恢复
- **高性能** - 响应迅速，资源利用高效
- **高安全性** - 数据加密，权限严格控制
- **高扩展性** - 模块化设计，易于功能扩展
- **高可维护性** - 代码清晰，文档完善

### 五标体系

- **标准化** - 统一的代码风格和文档格式
- **规范化** - 遵循行业最佳实践
- **自动化** - 自动化测试、构建、部署
- **智能化** - AI辅助开发，智能代码生成
- **可视化** - 清晰的架构图和流程图

### 五化架构

- **流程化** - 明确的开发流程和工作流
- **文档化** - 完善的技术文档和API文档
- **工具化** - 高效的开发工具和辅助脚本
- **数字化** - 数据驱动的决策和优化
- **生态化** - 开放的技术生态和社区协作

---

## 📝 文档头部信息标准

所有文档文件必须包含标准化的头部信息，格式如下：

```markdown
**@file**：{文档名称}
**@description**：{文档描述}
**@author**：YYC³
**@version**：{版本号，格式：v1.0.0}
**@created**：{创建日期，格式：YYYY-MM-DD}
**@updated**：{最后更新日期，格式：YYYY-MM-DD}
**@status**：{文档状态：draft/review/approved/published/deprecated/archived}
**@tags**：{标签1,标签2,标签3}
```

### 状态说明

| 状态 | 说明 |
|------|------|
| `draft` | 草稿，正在编写中 |
| `review` | 待审核，等待团队审查 |
| `approved` | 已审核通过，可以使用 |
| `published` | 已发布，正式生效 |
| `deprecated` | 已废弃，不再维护 |
| `archived` | 已归档，仅作参考 |

---

## 🏷️ 项目命名规范

### 项目命名模板

```
yyc3-[项目类型]-[项目名称]
```

### 项目类型说明

| 类型 | 用途 | 示例 |
|------|------|------|
| `app` | 应用程序 | `yyc3-app-catering-platform` |
| `lib` | 库/框架 | `yyc3-lib-core-utils` |
| `tool` | 工具 | `yyc3-tool-deploy-script` |
| `service` | 微服务 | `yyc3-service-user-auth` |
| `widget` | UI组件 | `yyc3-widget-chat-box` |
| `plugin` | 插件 | `yyc3-plugin-ai-assistant` |

### 命名规则

- 使用小写字母和连字符（kebab-case）
- 以 `yyc3-` 前缀开头
- 项目名称使用英文，清晰描述功能
- 避免使用缩写，除非是通用缩写

### 示例

✅ **正确示例**：
- `yyc3-app-catering-platform`
- `yyc3-service-order-management`
- `yyc3-lib-payment-gateway`

❌ **错误示例**：
- `yyc3-catering`（缺少项目类型）
- `YYC3-App-Catering`（使用大写字母）
- `yyc3-app-catering_platform`（使用下划线）

---

## 📄 代码文件标头格式

### TypeScript/JavaScript 文件标头

```typescript
/**
 * @fileoverview {文件简要描述}
 * @description {详细功能说明}
 * @author YYC³
 * @version 1.0.0
 * @created {创建日期 YYYY-MM-DD}
 * @modified {最后修改日期 YYYY-MM-DD}
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 文件内容...
```

### React 组件文件标头

```tsx
/**
 * @fileoverview {组件名称}组件
 * @description {组件功能描述和用途说明}
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import React from 'react';

// 组件实现...
```

### API 路由文件标头

```typescript
/**
 * @fileoverview {服务名称}API服务
 * @description {服务功能描述和API接口说明}
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';

// API实现...
```

### 函数/方法文档模板

```typescript
/**
 * {函数名称}
 * @param param1 - 参数说明
 * @param param2 - 参数说明
 * @returns 返回值说明
 * @example
 * ```typescript
 * const result = {functionName}('example', { option1: 'value' });
 * console.log(result);
 * ```
 */
```

---

## 📚 文档文件格式标准

### Markdown 文档结构

```markdown
# 文档标题

> 文档简短描述

## 文档信息
- 文档类型：{类型}
- 版本号：{版本}
- 创建日期：{日期}
- 最后更新：{日期}

## 目录
- [章节1](#章节1)
- [章节2](#章节2)

## 章节1
内容...

## 章节2
内容...
```

### API 文档格式

```markdown
# API接口文档 - {模块名称}

## 1. 接口概述
简要描述模块功能和适用场景

## 2. 认证方式
说明接口认证机制

## 3. 接口列表
详细的API接口说明

## 4. 错误码说明
错误代码和处理方式

## 5. 示例代码
使用示例和最佳实践
```

---

## 📖 README文件格式标准

### 标准 README 结构

```markdown
# 🚀 YYC³ - {项目名称}

<div align="center">

**YYC³（YanYu Cloud Cube）**
**标语**：万象归元于云枢 | 深栈智启新纪元
***英文***：*All Realms Converge at Cloud Nexus, DeepStack Ignites a New Era*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

---

**项目描述**：{简短描述项目功能和用途}

[快速开始](#-快速开始) • [功能特色](#-功能特色) • [文档](#-文档) • [贡献](#-贡献指南)

</div>

---

## 📋 目录
- [🎯 项目概述](#-项目概述)
- [⚡ 快速开始](#-快速开始)
- [🚀 功能特色](#-功能特色)
- [🛠️ 技术栈](#️-技术栈)
- [📁 项目结构](#-项目结构)
- [🚀 部署指南](#-部署指南)
- [📖 文档](#-文档)
- [🤝 贡献指南](#-贡献指南)
- [📄 开源协议](#-开源协议)

---

## 🎯 项目概述

### 项目背景
{详细描述项目背景、需求和解决的问题}

### 项目目标
{说明项目的核心目标和预期效果}

### 核心价值
- 🚀 **高效开发**：{价值点1}
- 🤖 **智能助手**：{价值点2}
- 🔄 **自动化流程**：{价值点3}
- 📱 **多端支持**：{价值点4}

---

## ⚡ 快速开始

### 环境要求
- **Node.js**：18+
- **TypeScript**：5.0+
- **Git**：2.30+
- **Docker**：20.10+ (可选)

### 安装运行

```bash
# 克隆项目
git clone https://github.com/yyc3/{项目名称}.git
cd {项目名称}

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 🚀 功能特色
{列出核心功能和技术亮点}

---

## 🛠️ 技术栈
{列出使用的技术栈}

---

## 📁 项目结构
{展示项目目录结构}

---

## 🚀 部署指南
{提供部署说明}

---

## 📖 文档
{链接到相关文档}

---

## 🤝 贡献指南
{说明如何贡献代码}

---

## 📄 开源协议
本项目采用 [MIT License](./LICENSE) 开源协议。

---

<div align="center">

**联系我们**：<admin@0379.email>
**官方网站**：<https://yyc3.com>
**GitHub**：<https://github.com/YYC-Cube>

Made with ❤️ by YYC³ Team

**让我们一起构建更智能的开发环境！** 🚀

</div>
```

---

## 🗂️ 文件和目录命名规范

### 文件命名规范

| 文件类型 | 命名格式 | 示例 |
|---------|---------|------|
| 组件文件 | PascalCase.tsx | `UserProfile.tsx` |
| 工具文件 | camelCase.ts | `userService.ts` |
| 配置文件 | kebab-case.config.js | `webpack.config.js` |
| 文档文件 | kebab-case.md | `api-documentation.md` |
| 样式文件 | kebab-case.module.css | `button-styles.module.css` |
| 测试文件 | *.test.ts | `userService.test.ts` |

### 目录命名规范

- 使用小写字母和连字符（kebab-case）
- 目录名清晰描述内容
- 避免使用缩写

### 示例

✅ **正确示例**：
```
src/
├── components/
│   ├── UserProfile/
│   │   ├── UserProfile.tsx
│   │   ├── UserProfile.test.tsx
│   │   └── index.ts
├── services/
│   ├── user-service.ts
│   └── auth-service.ts
├── utils/
│   ├── date-utils.ts
│   └── string-utils.ts
└── types/
    └── user-types.ts
```

---

## 📦 标准化模板文件

### Dockerfile 模板

```dockerfile
# === Docker 多阶段构建 ===

# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

# 安装 dumb-init 用于正确处理信号
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 从构建阶段复制生产依赖和构建文件
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# 创建必要的目录
RUN mkdir -p logs uploads && \
    chown -R nextjs:nodejs logs uploads

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用 (使用dumb-init确保正确处理信号)
CMD ["dumb-init", "node", "dist/index.js"]
```

### docker-compose.yml 模板

```yaml
version: '3.8'

# 环境变量定义
x-environment: &default-environment
  NODE_ENV: production
  PORT: 3000
  DB_HOST: postgres
  DB_PORT: 5432
  DB_NAME: yyc3_project
  DB_USER: yyc3_user
  REDIS_HOST: redis
  REDIS_PORT: 6379

# 通用服务配置
x-service: &default-service
  restart: unless-stopped
  networks:
    - yyc3-network

# 数据卷定义
volumes:
  postgres_data:
  redis_data:
  logs:
  uploads:

# 网络定义
networks:
  yyc3-network:
    driver: bridge

# 服务定义
services:
  # 主应用服务
  app:
    <<: *default-service
    build:
      context: .
      dockerfile: Dockerfile
    container_name: yyc3_app
    ports:
      - "3000:3000"
    volumes:
      - logs:/app/logs
      - uploads:/app/uploads
    environment:
      <<: *default-environment
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL数据库
  postgres:
    <<: *default-service
    image: postgres:15
    container_name: yyc3_postgres
    environment:
      POSTGRES_DB: yyc3_project
      POSTGRES_USER: yyc3_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U yyc3_user -d yyc3_project"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    <<: *default-service
    image: redis:7-alpine
    container_name: yyc3_redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

## 🔄 Git分支管理策略

### 分支模型

我们采用基于Git Flow的分支模型，主要包含以下几类分支：

#### 主要分支（长期存在）

| 分支名称 | 用途 | 保护措施 |
|---------|------|---------|
| `main` | 生产环境代码，保持稳定 | 强制PR合并，需要代码审查 |
| `develop` | 开发环境代码，包含所有已完成的功能 | 强制PR合并，需要通过所有测试 |

#### 临时分支（完成后删除）

| 分支类型 | 命名格式 | 用途 | 起始分支 | 目标分支 |
|---------|---------|------|---------|---------|
| Feature | `feature/功能名称` | 开发新功能 | `develop` | `develop` |
| Bugfix | `bugfix/问题描述` | 修复开发环境中的bug | `develop` | `develop` |
| Hotfix | `hotfix/紧急问题描述` | 修复生产环境中的紧急bug | `main` | `main` 和 `develop` |
| Release | `release/版本号` | 准备发布新版本 | `develop` | `main` 和 `develop` |

### 分支命名规范

- **Feature分支**：`feature/用户认证系统`、`feature/数据可视化功能`
- **Bugfix分支**：`bugfix/登录页面响应式问题`、`bugfix/API超时错误`
- **Hotfix分支**：`hotfix/生产环境数据泄露漏洞`、`hotfix/支付功能异常`
- **Release分支**：`release/1.0.0`、`release/2.1.0-beta`

### 分支操作流程

#### 创建功能分支

```bash
git checkout develop
git pull origin develop
git checkout -b feature/新功能名称
git push origin feature/新功能名称
```

#### 创建修复分支

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/问题描述
git push origin bugfix/问题描述
```

#### 创建紧急修复分支

```bash
git checkout main
git pull origin main
git checkout -b hotfix/紧急问题
git push origin hotfix/紧急问题
```

#### 合并分支

1. 完成开发后，提交Pull Request到目标分支
2. 等待代码审查和自动化测试通过
3. 合并分支并删除临时分支

---

## 📝 Conventional Commits规范

我们采用 **Conventional Commits** 规范，确保提交消息清晰、一致且可自动化处理。

### 提交消息格式

```markdown
<类型>[可选 范围]: <描述>

[可选 主体]

[可选 页脚]
```

### 提交类型

| 类型 | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 新增用户认证系统` |
| `fix` | 修复bug | `fix: 解决登录页面响应式问题` |
| `docs` | 文档更新 | `docs: 更新API文档` |
| `style` | 代码格式调整 | `style: 统一代码缩进` |
| `refactor` | 代码重构 | `refactor: 优化数据库查询性能` |
| `test` | 测试相关 | `test: 添加单元测试用例` |
| `chore` | 构建或辅助工具变动 | `chore: 更新依赖版本` |
| `perf` | 性能优化 | `perf: 减少页面加载时间` |
| `ci` | CI/CD配置变更 | `ci: 优化GitHub Actions工作流` |
| `revert` | 回滚提交 | `revert: feat: 新增用户认证系统` |

### 范围

范围用于指定提交影响的模块或组件，可选但推荐使用：

```bash
# 影响核心模块
git commit -m "feat(core): 新增日志记录功能"

# 影响媒体模块
git commit -m "fix(media): 修复视频处理bug"

# 影响用户界面
git commit -m "style(ui): 更新按钮样式"
```

### 描述

- 简洁明了，不超过50个字符
- 使用祈使句，现在时态（"add"而不是"added"或"adds"）
- 首字母小写，结尾不使用句号

### 主体

详细描述提交的内容，可选：

- 解释为什么要做这个更改
- 更改的具体内容
- 与之前行为的对比

```bash
git commit -m "feat: 新增用户认证系统

实现了基于JWT的用户认证系统，支持邮箱和密码登录，包含：
- 用户注册和登录接口
- JWT令牌生成和验证
- 密码加密存储
- 认证中间件"
```

### 页脚

用于指定不兼容变更、关联问题等，可选：

```bash
git commit -m "feat: 重构API接口

重构了用户相关的API接口，提高了性能和可维护性

BREAKING CHANGE: 用户接口路径从/users改为/api/users
Closes #123"
```

### 示例

```bash
# 简单功能提交
git commit -m "feat: 新增搜索功能"

# 带范围的修复提交
git commit -m "fix(auth): 修复JWT令牌过期问题"

# 带主体和页脚的复杂提交
git commit -m "refactor(store): 重构状态管理

将Redux替换为Zustand，减少代码复杂度并提高性能

BREAKING CHANGE: 状态管理API完全变更，需要更新所有组件
Refs #456"
```

---

## 🔒 安全规范

### 代码安全

- [ ] 禁止在代码中硬编码密钥、密码、Token等敏感信息
- [ ] 所有敏感数据必须通过环境变量或配置管理工具管理
- [ ] 使用HTTPS进行所有外部API调用
- [ ] 实现输入验证和输出编码，防止注入攻击
- [ ] 使用参数化查询防止SQL注入
- [ ] 实现CSRF防护机制
- [ ] 设置适当的安全头（CSP、X-Frame-Options等）

### 密码安全

- [ ] 使用强密码策略（至少8位，包含大小写字母、数字、特殊字符）
- [ ] 使用bcrypt或argon2等安全算法加密存储密码
- [ ] 实现密码强度检测
- [ ] 实现账户锁定机制防止暴力破解

### 数据保护

- [ ] 敏感数据在传输和存储时必须加密
- [ ] 实现数据脱敏机制，避免在前端暴露敏感信息
- [ ] 定期备份重要数据
- [ ] 遵守数据隐私法规（GDPR等）

### 访问控制

- [ ] 实现基于角色的访问控制（RBAC）
- [ ] 使用JWT进行无状态认证
- [ ] 定期轮换API密钥和访问令牌
- [ ] 实现API限流防止滥用

### 安全审计

- [ ] 定期进行安全扫描和漏洞检测
- [ ] 记录所有安全相关事件和操作日志
- [ ] 建立安全事件响应流程
- [ ] 定期更新依赖包，修复已知漏洞

---

## ⚡ 核心规范速查表

### 文件命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 组件 | PascalCase.tsx | `UserProfile.tsx` |
| 服务 | camelCase.ts | `userService.ts` |
| 工具 | camelCase.ts | `dateUtils.ts` |
| 类型 | *.types.ts | `userTypes.ts` |
| 测试 | *.test.ts | `userService.test.ts` |

### Git提交

```bash
# 新功能
git commit -m "feat: 新增功能描述"

# 修复bug
git commit -m "fix: 修复问题描述"

# 文档更新
git commit -m "docs: 更新文档说明"

# 代码重构
git commit -m "refactor: 重构说明"
```

### 代码注释

```typescript
/**
 * 函数描述
 * @param param1 - 参数说明
 * @returns 返回值说明
 */
function functionName(param1: string): string {
  // 实现
}
```

### 环境变量

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yyc3_project
DB_USER=yyc3_user
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

---

## ❓ FAQ（常见问题）

### Q1: 如何创建新项目？

**A**: 按照项目命名规范创建项目：
```bash
yyc3-[项目类型]-[项目名称]
```

例如：
```bash
yyc3-app-catering-platform
yyc3-service-user-auth
```

### Q2: 如何编写符合规范的提交消息？

**A**: 使用Conventional Commits规范：
```bash
<类型>[可选 范围]: <描述>
```

示例：
```bash
feat: 新增用户认证功能
fix(auth): 修复登录超时问题
docs: 更新API文档
```

### Q3: 如何处理敏感信息？

**A**: 
1. 永远不要在代码中硬编码敏感信息
2. 使用环境变量管理配置
3. 创建 `.env.example` 文件作为模板
4. 将 `.env` 文件添加到 `.gitignore`

### Q4: 如何编写单元测试？

**A**: 
1. 测试文件命名：`*.test.ts`
2. 使用 Jest 或 Vitest 测试框架
3. 测试覆盖率要求：关键路径 > 80%
4. 遵循 AAA 模式（Arrange-Act-Assert）

### Q5: 如何进行代码审查？

**A**: 
1. 提交 Pull Request
2. 等待至少 1 位团队成员审查
3. 确保所有自动化测试通过
4. 解决审查意见后合并

### Q6: 如何处理紧急修复？

**A**: 
1. 从 `main` 分支创建 `hotfix/` 分支
2. 修复问题并提交
3. 合并到 `main` 和 `develop`
4. 删除临时分支

### Q7: 如何更新依赖包？

**A**: 
```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 更新到最新版本
npm install package@latest
```

### Q8: 如何配置开发环境？

**A**: 
1. 克隆项目仓库
2. 安装依赖：`npm install`
3. 复制环境变量：`cp .env.example .env`
4. 编辑 `.env` 文件
5. 启动开发服务器：`npm run dev`

---

## 🛠️ 实施建议

### 团队协作

1. **定期代码审查**：每周至少进行一次团队代码审查会议
2. **知识分享**：每月组织技术分享会，分享最佳实践
3. **文档维护**：保持文档与代码同步更新
4. **工具统一**：使用统一的开发工具和配置

### 开发流程

1. **需求分析**：明确需求，制定开发计划
2. **分支创建**：从 `develop` 分支创建功能分支
3. **开发实现**：遵循编码规范，编写测试
4. **代码审查**：提交PR，等待审查通过
5. **合并部署**：合并到 `develop`，部署到测试环境
6. **发布上线**：从 `develop` 创建 `release` 分支，合并到 `main`

### 质量保证

1. **自动化测试**：确保所有测试通过才能合并
2. **代码覆盖率**：保持测试覆盖率在 80% 以上
3. **性能监控**：使用性能监控工具跟踪关键指标
4. **安全扫描**：定期进行安全扫描和漏洞检测

### 持续改进

1. **收集反馈**：定期收集团队和用户反馈
2. **优化流程**：根据反馈持续优化开发流程
3. **技术升级**：关注新技术，适时升级技术栈
4. **文档完善**：不断完善文档，提高可维护性

---

## 📞 联系信息

- **团队邮箱**：<admin@0379.email>
- **官方网站**：<https://yyc3.com>
- **GitHub**：<https://github.com/YYC-Cube>
- **文档仓库**：<https://github.com/YYC-Cube/docs>

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

**Made with ❤️ by YYC³ Team**

**让我们一起构建更智能的开发环境！** 🚀

</div>
