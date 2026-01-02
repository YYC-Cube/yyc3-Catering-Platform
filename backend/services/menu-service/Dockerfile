# 菜单服务Dockerfile
# 基于Node.js 18的多阶段构建

# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runner

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制环境变量模板
COPY .env.example .env

# 复制上传目录和日志目录
RUN mkdir -p uploads logs

# 暴露端口
EXPOSE 3201

# 启动命令
CMD ["npm", "run", "start:prod"]
