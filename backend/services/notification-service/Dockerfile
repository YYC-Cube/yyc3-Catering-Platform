# YYC³ 通知服务 Dockerfile
# 多阶段构建，优化镜像大小和安全性

# 构建阶段
FROM oven/bun:1-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile --prod=false

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM oven/bun:1-alpine AS production

# 安全配置
RUN addgroup -g 1001 -S yyc3 && \
    adduser -S yyc3 -u 1001 -G yyc3

# 安装必要的系统包
RUN apk add --no-cache \
    curl \
    dumb-init

# 设置工作目录
WORKDIR /app

# 复制构建产物和依赖
COPY --from=builder --chown=yyc3:yyc3 /app/dist ./dist
COPY --from=builder --chown=yyc3:yyc3 /app/node_modules ./node_modules
COPY --from=builder --chown=yyc3:yyc3 /app/package.json ./package.json
COPY --from=builder --chown=yyc3:yyc3 /app/.env ./

# 创建必要的目录
RUN mkdir -p logs && \
    chown -R yyc3:yyc3 logs

# 切换到非root用户
USER yyc3

# 暴露端口
EXPOSE 3203

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3203/health || exit 1

# 使用dumb-init作为PID 1
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["pnpm", "run", "start"]