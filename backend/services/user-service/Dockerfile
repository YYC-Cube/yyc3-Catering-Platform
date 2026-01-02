# 使用官方Node.js镜像作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production=false

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 使用轻量级Node.js镜像作为运行时镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm install --production

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制环境变量模板
COPY .env.example ./

# 暴露服务端口
EXPOSE 3201

# 启动命令
CMD ["npm", "run", "start"]
