---

**@file**：YYC³-Docker容器化部署技巧
**@description**：YYC³餐饮行业智能化平台的Docker容器化部署技巧
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：YYC³,文档

---
# 🔖 YYC³ Docker容器化部署技巧

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 属性 | 内容 |
|------|------|
| **文档标题** | YYC³ Docker容器化部署技巧 |
| **文档类型** | 技巧类文档 |
| **所属阶段** | 部署发布 |
| **遵循规范** | YYC³ 团队标准化规范 v1.0.0 |
| **版本号** | v1.0.0 |
| **创建日期** | 2025-01-30 |
| **作者** | YYC³ Team |
| **更新日期** | 2025-01-30 |

---

## 📑 目录

1. [Docker基础配置](#1-docker基础配置)
2. [多阶段构建](#2-多阶段构建)
3. [镜像优化](#3-镜像优化)
4. [容器编排](#4-容器编排)
5. [网络管理](#5-网络管理)
6. [存储管理](#6-存储管理)
7. [安全加固](#7-安全加固)
8. [性能优化](#8-性能优化)
9. [故障排查](#9-故障排查)
10. [最佳实践](#10-最佳实践)

---

## 1. 概述

### 1.1 功能说明

### 1.2 技术栈

### 1.3 开发环境

## 2. 实现方案

### 2.1 代码结构

### 2.2 核心逻辑

### 2.3 数据处理

## 3. 接口文档

### 3.1 API接口

### 3.2 请求参数

### 3.3 响应格式

## 4. 测试方案

### 4.1 单元测试

### 4.2 集成测试

### 4.3 测试用例

## 5. 部署指南

### 5.1 环境准备

### 5.2 部署步骤

### 5.3 验证方法

## 6. 常见问题

### 6.1 问题排查

### 6.2 解决方案

## 1. Docker基础配置

### 1.1 Dockerfile基础

```dockerfile
# Next.js应用Dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置构建环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 构建应用
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 设置环境变量
ENV NODE_ENV production
ENV PORT 3200
ENV HOSTNAME "0.0.0.0"

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3200

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3200/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server.js"]
```

### 1.2 .dockerignore配置

```dockerignore
# 依赖
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 测试
coverage
.nyc_output

# 构建输出
.next
out
dist
build

# IDE
.vscode
.idea
*.swp
*.swo
*~

# Git
.git
.gitignore
.gitattributes

# 文档
README.md
CHANGELOG.md
docs

# CI/CD
.github
.gitlab-ci.yml
.travis.yml

# 环境变量
.env
.env.local
.env.*.local

# 其他
.DS_Store
*.log
```

### 1.3 Docker Compose配置

```yaml
version: '3.8'

services:
  # Next.js应用
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: yyc3-web
    ports:
      - "3200:3200"
    environment:
      - NODE_ENV=production
      - PORT=3200
      - DATABASE_URL=postgresql://yyc3:yyc3pass@postgres:5432/yyc3db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - yyc3-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3200/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: yyc3-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=yyc3db
      - POSTGRES_USER=yyc3
      - POSTGRES_PASSWORD=yyc3pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - yyc3-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U yyc3 -d yyc3db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: yyc3-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - yyc3-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: yyc3-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - web
    restart: unless-stopped
    networks:
      - yyc3-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  yyc3-network:
    driver: bridge
```

---

## 2. 多阶段构建

### 2.1 前端多阶段构建

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装所有依赖（包括devDependencies）
RUN npm ci

# 复制源代码
COPY . .

# 设置构建环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 构建应用
RUN npm run build

# 生产运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 安装生产运行时依赖
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制生产依赖
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 设置环境变量
ENV NODE_ENV production
ENV PORT 3200
ENV HOSTNAME "0.0.0.0"

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3200

# 使用dumb-init作为PID 1
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["node", "server.js"]
```

### 2.2 后端多阶段构建

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* tsconfig.json ./

# 安装所有依赖
RUN npm ci

# 复制源代码
COPY src ./src

# 编译TypeScript
RUN npm run build

# 生产运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache dumb-init curl

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# 复制生产依赖
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# 复制编译后的代码
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# 设置环境变量
ENV NODE_ENV production
ENV PORT 3201

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3201

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3201/health || exit 1

# 使用dumb-init作为PID 1
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["node", "dist/index.js"]
```

### 2.3 静态资源多阶段构建

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建静态资源
RUN npm run build

# Nginx运行阶段
FROM nginx:alpine AS runner

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义Nginx配置
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/out /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. 镜像优化

### 3.1 镜像层优化

```dockerfile
# ❌ 不好的做法 - 多层RUN命令
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache git
RUN apk add --no-cache curl
RUN apk add --no-cache python3
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# ✅ 好的做法 - 合并RUN命令
FROM node:18-alpine
WORKDIR /app

# 合并安装命令
RUN apk add --no-cache \
    git \
    curl \
    python3

# 复制并安装依赖
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 复制源代码并构建
COPY . .
RUN npm run build
```

### 3.2 镜像大小优化

```dockerfile
# 使用alpine基础镜像
FROM node:18-alpine AS base

# 清理不必要的文件
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && npm install -g npm \
    && apk del .build-deps

# 使用多阶段构建减少最终镜像大小
FROM node:18-alpine AS runner
COPY --from=builder /app/dist ./dist

# 清理npm缓存
RUN npm cache clean --force

# 删除不必要的文件
RUN rm -rf /tmp/* /root/.npm /root/.cache
```

### 3.3 构建缓存优化

```dockerfile
# 利用Docker构建缓存

# 1. 先复制依赖文件（变化少）
COPY package.json package-lock.json* ./

# 2. 安装依赖（利用缓存）
RUN npm ci --only=production

# 3. 再复制源代码（变化多）
COPY . .

# 4. 构建应用
RUN npm run build

# 5. 使用.dockerignore排除不需要的文件
# 在.dockerignore中添加：
node_modules
npm-debug.log
.git
.next
```

---

## 4. 容器编排

### 4.1 Docker Compose编排

```yaml
version: '3.8'

services:
  # Web应用
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    image: yyc3/web:latest
    container_name: yyc3-web
    ports:
      - "3200:3200"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - frontend
      - backend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s

  # API服务
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    image: yyc3/api:latest
    container_name: yyc3-api
    ports:
      - "3201:3201"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - backend

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: yyc3-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: yyc3-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: yyc3-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - web
      - api
    restart: unless-stopped
    networks:
      - frontend

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

### 4.2 Docker Swarm编排

```yaml
version: '3.8'

services:
  web:
    image: yyc3/web:latest
    deploy:
      mode: replicated
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 5s
        order: stop-first
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
      placement:
        constraints:
          - node.labels.role == web
    ports:
      - "3200:3200"
    networks:
      - frontend
      - backend

  postgres:
    image: postgres:15-alpine
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.labels.role == database
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend

volumes:
  postgres_data:
    driver: local

networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay
    internal: true
```

---

## 5. 网络管理

### 5.1 自定义网络

```yaml
version: '3.8'

services:
  web:
    image: yyc3/web:latest
    networks:
      - frontend
      - backend

  api:
    image: yyc3/api:latest
    networks:
      - backend

  postgres:
    image: postgres:15-alpine
    networks:
      - backend

networks:
  frontend:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
          ip_range: 172.20.10.0/24
          gateway: 172.20.10.1

  backend:
    driver: bridge
    internal: true
    ipam:
      driver: default
      config:
        - subnet: 172.21.0.0/16
          ip_range: 172.21.10.0/24
          gateway: 172.21.10.1
```

### 5.2 网络别名

```yaml
version: '3.8'

services:
  web:
    image: yyc3/web:latest
    networks:
      frontend:
        aliases:
          - web.yyc3.local
          - app.yyc3.local

  api:
    image: yyc3/api:latest
    networks:
      backend:
        aliases:
          - api.yyc3.local
          - backend.yyc3.local

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

### 5.3 DNS配置

```yaml
version: '3.8'

services:
  web:
    image: yyc3/web:latest
    dns:
      - 8.8.8.8
      - 8.8.4.4
    dns_search:
      - yyc3.local

  api:
    image: yyc3/api:latest
    extra_hosts:
      - "postgres.yyc3.local:192.168.1.100"
      - "redis.yyc3.local:192.168.1.101"
```

---

## 6. 存储管理

### 6.1 数据卷

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    volumes:
      # 命名卷
      - postgres_data:/var/lib/postgresql/data
      # 绑定挂载
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
      # 临时卷
      - postgres_tmp:/tmp

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/postgres
  postgres_tmp:
    driver: local
```

### 6.2 数据卷备份

```bash
#!/bin/bash

# Docker数据卷备份脚本

BACKUP_DIR="/backup/docker/$(date +%Y%m%d)"
VOLUME_NAME="yyc3_postgres_data"

echo "=== Docker数据卷备份 ==="
echo "备份目录: $BACKUP_DIR"
echo "数据卷: $VOLUME_NAME"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据卷
docker run --rm \
  -v $VOLUME_NAME:/data:ro \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/$VOLUME_NAME.tar.gz -C /data .

echo "✅ 备份完成: $BACKUP_DIR/$VOLUME_NAME.tar.gz"

# 恢复命令
echo ""
echo "=== 恢复命令 ==="
echo "docker run --rm \\"
echo "  -v $VOLUME_NAME:/data \\"
echo "  -v $BACKUP_DIR:/backup \\"
echo "  alpine tar xzf /backup/$VOLUME_NAME.tar.gz -C /data"
```

### 6.3 数据卷清理

```bash
#!/bin/bash

# Docker数据卷清理脚本

echo "=== Docker数据卷清理 ==="

# 查看未使用的数据卷
echo "未使用的数据卷:"
docker volume ls -f dangling=true

# 清理未使用的数据卷
read -p "是否清理未使用的数据卷? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker volume prune -f
  echo "✅ 清理完成"
fi

# 查看所有数据卷
echo ""
echo "所有数据卷:"
docker volume ls
```

---

## 7. 安全加固

### 7.1 非root用户运行

```dockerfile
FROM node:18-alpine

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置工作目录
WORKDIR /app

# 复制文件并设置权限
COPY --chown=nextjs:nodejs package.json ./
RUN npm ci --only=production

COPY --chown=nextjs:nodejs . .

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3200

# 启动应用
CMD ["node", "server.js"]
```

### 7.2 只读文件系统

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制文件
COPY --chown=nextjs:nodejs package.json ./
RUN npm ci --only=production

COPY --chown=nextjs:nodejs . .

# 创建临时目录
RUN mkdir -p /tmp && chown -R nextjs:nodejs /tmp

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3200

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3200/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 只读文件系统（除了/tmp）
CMD ["node", "server.js"]
```

### 7.3 安全扫描

```bash
#!/bin/bash

# Docker镜像安全扫描脚本

IMAGE_NAME=$1

if [ -z "$IMAGE_NAME" ]; then
  echo "用法: $0 <镜像名称>"
  exit 1
fi

echo "=== Docker镜像安全扫描 ==="
echo "镜像: $IMAGE_NAME"

# 使用Trivy扫描漏洞
echo "1. 使用Trivy扫描漏洞..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --severity HIGH,CRITICAL $IMAGE_NAME

# 使用Docker Bench检查安全配置
echo ""
echo "2. 使用Docker Bench检查安全配置..."
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/lib/systemd:/usr/lib/systemd \
  -v /etc:/etc --label docker_bench_security \
  docker/docker-bench-security

echo "✅ 安全扫描完成"
```

---

## 8. 性能优化

### 8.1 资源限制

```yaml
version: '3.8'

services:
  web:
    image: yyc3/web:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    ports:
      - "3200:3200"

  postgres:
    image: postgres:15-alpine
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### 8.2 构建优化

```dockerfile
# 使用BuildKit优化构建
# syntax=docker/dockerfile:1

FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 利用缓存挂载
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN --mount=type=cache,target=/root/.npm \
    npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV NODE_ENV production
ENV PORT 3200
ENV HOSTNAME "0.0.0.0"

USER nextjs

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3200/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

### 8.3 性能监控

```bash
#!/bin/bash

# Docker容器性能监控脚本

echo "=== Docker容器性能监控 ==="

# 查看容器资源使用情况
echo "1. 容器资源使用情况:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# 查看容器详细信息
echo ""
echo "2. 容器详细信息:"
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"

# 查看容器日志
echo ""
echo "3. 容器日志（最近100行）:"
docker logs --tail=100 yyc3-web

# 查看容器进程
echo ""
echo "4. 容器进程:"
docker top yyc3-web

# 查看容器网络
echo ""
echo "5. 容器网络:"
docker network inspect yyc3-network
```

---

## 9. 故障排查

### 9.1 容器故障排查

```bash
#!/bin/bash

# Docker容器故障排查脚本

CONTAINER_NAME=$1

if [ -z "$CONTAINER_NAME" ]; then
  echo "用法: $0 <容器名称>"
  exit 1
fi

echo "=== Docker容器故障排查 ==="
echo "容器: $CONTAINER_NAME"
echo ""

# 1. 检查容器状态
echo "1. 容器状态:"
docker ps -a --filter "name=$CONTAINER_NAME" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. 检查容器日志
echo "2. 容器日志（最近100行）:"
docker logs --tail=100 $CONTAINER_NAME
echo ""

# 3. 检查容器详细信息
echo "3. 容器详细信息:"
docker inspect $CONTAINER_NAME | jq '.[0] | {State: .State, Config: .Config, HostConfig: .HostConfig}'
echo ""

# 4. 检查容器进程
echo "4. 容器进程:"
docker top $CONTAINER_NAME
echo ""

# 5. 检查容器资源使用
echo "5. 容器资源使用:"
docker stats --no-stream $CONTAINER_NAME
echo ""

# 6. 进入容器检查
echo "6. 进入容器检查（可选）:"
read -p "是否进入容器? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker exec -it $CONTAINER_NAME sh
fi
```

### 9.2 网络故障排查

```bash
#!/bin/bash

# Docker网络故障排查脚本

NETWORK_NAME=$1

if [ -z "$NETWORK_NAME" ]; then
  echo "用法: $0 <网络名称>"
  exit 1
fi

echo "=== Docker网络故障排查 ==="
echo "网络: $NETWORK_NAME"
echo ""

# 1. 检查网络状态
echo "1. 网络状态:"
docker network inspect $NETWORK_NAME | jq '.[0] | {Name: .Name, Driver: .Driver, Subnet: .IPAM.Config}'
echo ""

# 2. 检查网络中的容器
echo "2. 网络中的容器:"
docker network inspect $NETWORK_NAME | jq '.[0].Containers | to_entries[] | {Name: .value.Name, IPv4: .value.IPv4Address}'
echo ""

# 3. 测试网络连通性
echo "3. 测试网络连通性:"
CONTAINER=$(docker ps -q --filter "network=$NETWORK_NAME" | head -1)
if [ -n "$CONTAINER" ]; then
  docker exec $CONTAINER ping -c 3 google.com
else
  echo "网络中没有运行的容器"
fi
echo ""

# 4. 检查DNS解析
echo "4. 检查DNS解析:"
if [ -n "$CONTAINER" ]; then
  docker exec $CONTAINER nslookup google.com
fi
```

### 9.3 存储故障排查

```bash
#!/bin/bash

# Docker存储故障排查脚本

echo "=== Docker存储故障排查 ==="

# 1. 检查磁盘使用情况
echo "1. 磁盘使用情况:"
df -h
echo ""

# 2. 检查Docker数据目录
echo "2. Docker数据目录:"
du -sh /var/lib/docker/*
echo ""

# 3. 检查数据卷
echo "3. 数据卷:"
docker volume ls
echo ""

# 4. 检查未使用的数据卷
echo "4. 未使用的数据卷:"
docker volume ls -f dangling=true
echo ""

# 5. 检查镜像
echo "5. 镜像:"
docker images
echo ""

# 6. 检查未使用的镜像
echo "6. 未使用的镜像:"
docker images -f dangling=true
```

---

## 10. 最佳实践

### 10.1 镜像构建最佳实践

```dockerfile
# ✅ 最佳实践示例

# 1. 使用官方基础镜像
FROM node:18-alpine

# 2. 使用明确的标签
# ❌ FROM node:latest
# ✅ FROM node:18-alpine

# 3. 合并RUN命令
RUN apk add --no-cache \
    git \
    curl \
    python3

# 4. 利用构建缓存
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 5. 使用.dockerignore
# 在.dockerignore中添加不需要的文件

# 6. 使用非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 7. 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3200/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 8. 使用多阶段构建
# 减少最终镜像大小

# 9. 使用BuildKit
# syntax=docker/dockerfile:1

# 10. 添加元数据
LABEL maintainer="YYC³ <admin@0379.email>"
LABEL version="1.0.0"
LABEL description="YYC³ Web Application"
```

### 10.2 容器运行最佳实践

```yaml
# ✅ 最佳实践示例

version: '3.8'

services:
  web:
    image: yyc3/web:latest

    # 1. 使用资源限制
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

    # 2. 使用健康检查
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3200/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # 3. 使用重启策略
    restart: unless-stopped

    # 4. 使用自定义网络
    networks:
      - frontend
      - backend

    # 5. 使用环境变量文件
    env_file:
      - .env.production

    # 6. 使用只读文件系统
    read_only: true
    tmpfs:
      - /tmp

    # 7. 使用日志驱动
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

    # 8. 使用依赖关系
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
```

### 10.3 安全最佳实践

```dockerfile
# ✅ 安全最佳实践示例

FROM node:18-alpine

# 1. 使用非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 2. 使用只读文件系统
# 在docker-compose.yml中设置
# read_only: true

# 3. 删除不必要的包
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && npm install -g npm \
    && apk del .build-deps

# 4. 使用最小权限
# 不要使用 --privileged 标志

# 5. 使用安全扫描
# 定期运行 Trivy 扫描

# 6. 使用 secrets 管理敏感信息
# 不要在 Dockerfile 中硬编码密码

# 7. 使用官方镜像
# 不要使用不受信任的镜像

# 8. 定期更新基础镜像
# 使用最新版本的基础镜像

# 9. 使用安全标签
LABEL security.scan="trivy"
LABEL security.policy="YYC³ Security Policy"

# 10. 使用签名镜像
# 使用 Docker Content Trust
```

---

## 📄 文档标尾

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

- [🔖 YYC³ K8s部署运维技巧](YYC3-Cater-部署发布/技巧类/02-YYC3-Cater--技巧类-K8s部署运维技巧.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ 灰度发布风险控制技巧](YYC3-Cater-部署发布/技巧类/05-YYC3-Cater--技巧类-灰度发布风险控制技巧.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ 部署问题排查指南](YYC3-Cater-部署发布/技巧类/04-YYC3-Cater--技巧类-部署问题排查指南.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ CI/CD流水线搭建与优化技巧](YYC3-Cater-部署发布/技巧类/03-YYC3-Cater--技巧类-CI_CD流水线搭建与优化技巧.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ 智能化需求优先级排序方法](YYC3-Cater-需求规划/技巧类/03-YYC3-Cater--技巧类-智能化需求优先级排序方法.md) - YYC3-Cater-需求规划/技巧类
