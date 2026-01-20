---
@file: 105-YYC3-AICP-开发阶段-本地开发环境配置.md
@description: YYC3-AICP 开发人员本地环境的搭建、配置、调试的完整指南
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [开发阶段],[环境配置],[本地开发]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 105-YYC3-AICP-开发阶段-本地开发环境配置

## 概述

本文档详细描述YYC3-YYC3-AICP-开发阶段-本地开发环境配置相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范本地开发环境配置相关的业务标准与技术落地要求
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

### 3. 本地开发环境配置

#### 3.1 系统要求

**硬件要求**
- CPU: 4核心及以上
- 内存: 8GB及以上(推荐16GB)
- 硬盘: 50GB可用空间
- 网络: 稳定的互联网连接

**软件要求**
- 操作系统: macOS 10.15+, Windows 10+, Linux (Ubuntu 20.04+)
- Node.js: >=18.0.0
- pnpm: >=8.0.0
- Docker: >=20.10.0
- Docker Compose: >=2.0.0
- Git: >=2.30.0

#### 3.2 必需软件安装

##### 3.2.1 Node.js 安装

**macOS**
```bash
# 使用 Homebrew 安装
brew install node@18

# 验证安装
node --version
npm --version
```

**Windows**
```bash
# 下载并安装 Node.js LTS 版本
# 访问: https://nodejs.org/
```

**Linux (Ubuntu)**
```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

##### 3.2.2 pnpm 安装

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

##### 3.2.3 Docker 安装

**macOS**
```bash
# 下载并安装 Docker Desktop for Mac
# 访问: https://www.docker.com/products/docker-desktop

# 验证安装
docker --version
docker-compose --version
```

**Windows**
```bash
# 下载并安装 Docker Desktop for Windows
# 访问: https://www.docker.com/products/docker-desktop

# 验证安装
docker --version
docker-compose --version
```

**Linux (Ubuntu)**
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt-get install docker-compose-plugin

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录后验证安装
docker --version
docker compose version
```

##### 3.2.4 Git 安装

**macOS**
```bash
# macOS 通常已预装 Git
# 如果没有,使用 Homebrew 安装
brew install git

# 验证安装
git --version
```

**Windows**
```bash
# 下载并安装 Git for Windows
# 访问: https://git-scm.com/download/win
```

**Linux (Ubuntu)**
```bash
sudo apt-get update
sudo apt-get install git

# 验证安装
git --version
```

##### 3.2.5 数据库工具安装

**PostgreSQL 客户端**
```bash
# macOS
brew install postgresql@15

# Windows
# 下载并安装 PostgreSQL
# 访问: https://www.postgresql.org/download/windows/

# Linux (Ubuntu)
sudo apt-get install postgresql-client
```

**Redis 客户端**
```bash
# macOS
brew install redis

# Windows
# 下载并安装 Redis for Windows
# 访问: https://github.com/microsoftarchive/redis/releases

# Linux (Ubuntu)
sudo apt-get install redis-tools
```

#### 3.3 项目初始化

##### 3.3.1 克隆项目仓库

```bash
# 克隆项目
git clone https://github.com/yyc3/catering-platform.git
cd catering-platform

# 查看项目结构
ls -la
```

##### 3.3.2 安装依赖

```bash
# 安装所有工作区依赖
pnpm install

# 验证依赖安装
pnpm list --depth=0
```

##### 3.3.3 环境变量配置

**复制环境变量模板**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量文件
nano .env.local
```

**环境变量配置说明**

```bash
# 应用配置
NODE_ENV=development
PORT=8080
HOST=localhost

# 应用密钥(开发环境可使用默认值)
APP_SECRET=dev-secret-key-change-in-production
JWT_SECRET=dev-jwt-secret-change-in-production
ENCRYPTION_KEY=dev-encryption-key-32-chars-long

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yyc3_my
DB_USER=yyc3
DB_PASSWORD=yyc3_my
DB_SSL=false

# Redis 缓存配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX=yyc3:

# AI 服务配置(开发环境可使用Mock)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7

# 开发模式配置
DEV_MOCK_AI=false
DEV_MOCK_PAYMENT=true
DEV_MOCK_SMS=true
DEV_MOCK_EMAIL=true

# 调试配置
DEBUG_SQL=false
DEBUG_REQUESTS=false
DEBUG_AI_RESPONSES=false

# 热重载配置
HOT_RELOAD=true
LIVE_RELOAD=true
```

#### 3.4 Docker Compose 配置

##### 3.4.1 启动基础服务

```bash
# 进入网关目录
cd backend/gateway

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

##### 3.4.2 服务说明

**API 网关服务 (gateway)**
- 端口: 8080
- 调试端口: 9229
- 健康检查: http://localhost:8080/health

**Redis 缓存服务 (redis)**
- 端口: 6379
- 密码: ${REDIS_PASSWORD}

**Consul 服务发现 (consul)**
- 端口: 8500
- Web UI: http://localhost:8500

**Nginx 反向代理 (nginx)**
- HTTP 端口: 80
- HTTPS 端口: 443

**Prometheus 监控 (prometheus)**
- 端口: 9090
- Web UI: http://localhost:9090

**Grafana 可视化 (grafana)**
- 端口: 3001
- Web UI: http://localhost:3001
- 默认用户: admin
- 默认密码: ${GRAFANA_PASSWORD}

**Jaeger 链路追踪 (jaeger)**
- Web UI: http://localhost:16686

##### 3.4.3 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v

# 停止服务并删除镜像
docker-compose down --rmi all
```

#### 3.5 开发工作流程

##### 3.5.1 启动开发环境

**启动所有服务**
```bash
# 在项目根目录
pnpm dev

# 或者分别启动前端和后端
pnpm dev:admin      # 启动管理后台
pnpm dev:customer    # 启动客户应用
pnpm dev:staff      # 启动员工应用
pnpm dev:backend    # 启动后端服务
```

**启动特定服务**
```bash
# 只启动管理后台
pnpm dev:admin

# 只启动后端服务
pnpm dev:backend
```

##### 3.5.2 数据库迁移

```bash
# 运行数据库迁移
pnpm db:migrate

# 回滚数据库迁移
pnpm db:migrate:rollback

# 填充测试数据
pnpm db:seed
```

##### 3.5.3 代码质量检查

```bash
# 运行 ESLint 检查
pnpm lint

# 运行类型检查
pnpm type-check

# 代码格式化
pnpm format

# 检查代码格式
pnpm format:check
```

##### 3.5.4 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行集成测试
pnpm test:integration

# 运行端到端测试
pnpm test:e2e

# 生成测试覆盖率报告
pnpm test:coverage

# 运行冒烟测试
pnpm test:smoke
```

##### 3.5.5 构建项目

```bash
# 构建所有项目
pnpm build

# 只构建前端
pnpm build:frontend

# 只构建后端
pnpm build:backend
```

#### 3.6 常见问题排查

##### 3.6.1 端口冲突

**问题**: 端口已被占用

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :8080

# 杀死占用端口的进程
kill -9 <PID>

# 或者修改环境变量中的端口配置
```

##### 3.6.2 Docker 服务启动失败

**问题**: Docker 容器无法启动

**解决方案**:
```bash
# 查看容器日志
docker-compose logs <service-name>

# 重启 Docker 服务
sudo systemctl restart docker

# 清理 Docker 缓存
docker system prune -a
```

##### 3.6.3 数据库连接失败

**问题**: 无法连接到数据库

**解决方案**:
```bash
# 检查数据库服务状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 验证数据库连接
psql -h localhost -U yyc3 -d yyc3_my

# 检查环境变量配置
cat .env.local | grep DB_
```

##### 3.6.4 Redis 连接失败

**问题**: 无法连接到 Redis

**解决方案**:
```bash
# 检查 Redis 服务状态
docker-compose ps redis

# 查看 Redis 日志
docker-compose logs redis

# 验证 Redis 连接
redis-cli -h localhost -p 6379 -a your-redis-password ping

# 检查环境变量配置
cat .env.local | grep REDIS_
```

##### 3.6.5 依赖安装失败

**问题**: pnpm install 失败

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装依赖
pnpm install

# 如果仍然失败,尝试使用 npm
npm install
```

##### 3.6.6 权限问题

**问题**: Docker 权限错误

**解决方案**:
```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker

# 验证权限
docker ps
```

#### 3.7 开发工具推荐

##### 3.7.1 代码编辑器

**VS Code**
```bash
# 安装 VS Code
# 访问: https://code.visualstudio.com/

# 推荐扩展
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Vue Language Features (Volar)
- Docker
- GitLens
- Thunder Client (API 测试)
```

##### 3.7.2 数据库管理工具

**DBeaver**
```bash
# 下载并安装 DBeaver
# 访问: https://dbeaver.io/download/

# 连接配置
- Host: localhost
- Port: 5432
- Database: yyc3_my
- Username: yyc3
- Password: yyc3_my
```

**RedisInsight**
```bash
# 下载并安装 RedisInsight
# 访问: https://redis.com/redis-enterprise/redis-insight/

# 连接配置
- Host: localhost
- Port: 6379
- Password: your-redis-password
```

##### 3.7.3 API 测试工具

**Thunder Client (VS Code 扩展)**
```bash
# 在 VS Code 中安装 Thunder Client 扩展
# 用于 API 接口测试和调试
```

**Postman**
```bash
# 下载并安装 Postman
# 访问: https://www.postman.com/downloads/
```

#### 3.8 性能优化建议

##### 3.8.1 Docker 资源限制

```yaml
# 在 docker-compose.yml 中添加资源限制
services:
  gateway:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

##### 3.8.2 Node.js 性能优化

```bash
# 使用 Node.js 性能分析
node --prof app.js

# 使用 Chrome DevTools 进行性能分析
node --inspect app.js
```

##### 3.8.3 数据库性能优化

```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);

-- 分析查询性能
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

#### 3.9 安全注意事项

##### 3.9.1 环境变量安全

```bash
# 不要将 .env 文件提交到版本控制
echo ".env" >> .gitignore

# 使用强密码
# 生成随机密码
openssl rand -base64 32
```

##### 3.9.2 数据库安全

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 定期备份数据库
pg_dump -h localhost -U yyc3 yyc3_my > backup.sql
```

##### 3.9.3 API 安全

```typescript
// 启用 HTTPS
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(443);
```

#### 3.10 开发最佳实践

##### 3.10.1 代码规范

- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 进行类型检查
- 编写单元测试和集成测试
- 添加有意义的代码注释

##### 3.10.2 Git 工作流

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/your-feature-name

# 创建 Pull Request
```

##### 3.10.3 文档维护

- 及时更新相关文档
- 记录重要的设计决策
- 维护 API 文档
- 编写清晰的 README

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
