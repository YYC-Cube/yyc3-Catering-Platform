# 使用官方Bun镜像作为基础
FROM oven/bun:latest AS base
WORKDIR /app

# 安装依赖
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# 构建应用
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# 生产环境镜像
FROM base AS production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动服务
CMD ["bun", "run", "start"]
