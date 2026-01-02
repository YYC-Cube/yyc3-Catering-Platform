# =============================================================================
# YYC³餐饮平台 - API服务
# Dockerfile - 企业级容器化部署配置
# =============================================================================
# @project YYC³-Catering-Platform
# @module yyc3-catering-api-service
# @version 1.0.0
# @author YYC³ Development Team <dev@yyc3.red>
# @license MIT <https://opensource.org/licenses/MIT>
# =============================================================================

# 使用官方Bun镜像作为基础镜像
FROM oven/bun:1.1-alpine as base

# 设置工作目录
WORKDIR /app

# 安装安全更新和必要的系统依赖
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    dumb-init \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# 设置时区
ENV TZ=Asia/Shanghai

# =============================================================================
# 构建阶段
# =============================================================================
FROM base as builder

# 复制package文件
COPY package.json bun.lockb ./

# 安装依赖（包括开发依赖）
RUN bun install --frozen-lockfile --production=false

# 复制源代码
COPY . .

# 构建应用
RUN bun run build

# 运行类型检查和代码质量检查
RUN bun run type-check && \
    bun run lint

# =============================================================================
# 生产阶段
# =============================================================================
FROM base as production

# 创建非root用户
RUN addgroup --system --gid 1001 yyc3 && \
    adduser --system --uid 1001 --gid 1001 --shell /bin/false yyc3

# 设置工作目录
WORKDIR /app

# 安装生产依赖
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production && \
    bun cache clean

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 创建必要的目录并设置权限
RUN mkdir -p /app/logs /app/temp && \
    chown -R yyc3:yyc3 /app

# 切换到非root用户
USER yyc3

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT}/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 暴露端口
EXPOSE 3000

# 使用dumb-init作为PID 1
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["bun", "dist/app.js"]