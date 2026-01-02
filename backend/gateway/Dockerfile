# YYC³ API网关 Dockerfile
# 多阶段构建，优化镜像大小和安全性

# 构建阶段 - 使用Bun进行依赖安装和构建
FROM oven/bun:1-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=development

# 复制依赖文件（先复制这些文件可以利用Docker缓存）
COPY package.json bun.lockb ./

# 安装依赖（包括开发依赖）
RUN bun install --frozen-lockfile --prod=false

# 复制源代码
COPY . .

# 构建应用
RUN bun run build

# 生产依赖安装阶段 - 只安装生产依赖
FROM oven/bun:1-alpine AS deps

WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lockb ./

# 只安装生产依赖，减少镜像大小
RUN bun install --frozen-lockfile --production

# 生产阶段
FROM oven/bun:1-alpine AS production

# 安全配置
RUN addgroup -g 1001 -S yyc3 && \
    adduser -S yyc3 -u 1001 -G yyc3

# 安装必要的系统包（最小化安装）
RUN apk add --no-cache \
    curl=7.88.1-r1 \
    dumb-init=1.2.5-r1

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV LOG_LEVEL=info
ENV LOG_DIR=/app/logs

# 复制生产依赖
COPY --from=deps --chown=yyc3:yyc3 /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder --chown=yyc3:yyc3 /app/dist ./dist

# 复制必要的配置文件
COPY --from=builder --chown=yyc3:yyc3 /app/package.json ./package.json
COPY --from=builder --chown=yyc3:yyc3 /app/.env.example ./

# 创建必要的目录
RUN mkdir -p $LOG_DIR && \
    chown -R yyc3:yyc3 $LOG_DIR && \
    chmod 755 $LOG_DIR

# 切换到非root用户
USER yyc3

# 暴露端口
EXPOSE $PORT

# 健康检查 - 更详细的健康检查配置
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -s -f -X GET http://localhost:$PORT/health \
  && echo "OK" || exit 1

# 使用dumb-init作为PID 1，确保信号正确处理
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["bun", "run", "start"]