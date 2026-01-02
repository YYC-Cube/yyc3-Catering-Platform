# YYC³ 智慧后厨服务

## 项目简介

YYC³ 智慧后厨服务是一个为餐饮行业设计的智能化后厨管理系统，提供订单管理、厨师调度、资源分配和性能优化等核心功能。该服务基于 Node.js 和 TypeScript 开发，采用 Redis 进行缓存优化，提高系统响应速度和并发处理能力。

## 功能特点

### 订单管理
- 订单接收与状态跟踪
- 订单优先级计算
- 订单队列缓存
- 订单状态更新与通知

### 厨师调度系统
- 厨师技能匹配算法
- 厨师工作量动态分配
- 厨师评分与优先级排序
- 厨师可用性管理

### 资源管理
- 厨房设备资源监控
- 资源使用优化
- 资源冲突解决

### 性能优化
- Redis 缓存集成
- 菜品信息缓存
- 订单队列缓存
- 缓存自动失效与更新

## 技术栈

- **开发语言**: TypeScript
- **运行环境**: Node.js 18+
- **框架**: Express
- **数据库**: PostgreSQL + Redis
- **缓存**: Redis 5.10+
- **消息队列**: Bull
- **测试框架**: Vitest
- **构建工具**: TypeScript Compiler
- **代码规范**: ESLint + Prettier

## 安装与配置

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Redis >= 6.0.0
- PostgreSQL >= 13.0.0

### 安装步骤

1. 克隆项目代码

```bash
git clone <repository-url>
cd yyc3-catering-platform/backend/services/smart-kitchen
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

创建 `.env` 文件并配置以下环境变量：

```env
# 服务器配置
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/yyc3_smart_kitchen

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

4. 构建项目

```bash
pnpm build
```

5. 启动服务

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm start
```

## 项目结构

```text
src/
├── app/                     # Express 应用
│   ├── controllers/         # 控制器
│   ├── middlewares/         # 中间件
│   ├── routes/              # 路由
│   └── app.ts               # 应用入口
├── models/                  # 数据模型
├── repositories/            # 数据仓库
├── services/                # 业务服务
│   ├── OrderService.ts      # 订单服务
│   ├── ChefService.ts       # 厨师服务
│   ├── KitchenResourceService.ts  # 厨房资源服务
│   └── CacheService.ts      # 缓存服务
├── types/                   # TypeScript 类型定义
├── utils/                   # 工具函数
├── config/                  # 配置文件
├── tests/                   # 测试文件
└── index.ts                 # 程序入口
```

## 核心服务

### OrderService

订单服务是智慧后厨系统的核心，负责订单的创建、处理、状态管理和分发。

**主要功能**：
- 创建新订单
- 获取订单队列（支持缓存）
- 更新订单状态
- 取消订单
- 计算订单复杂度
- 计算订单优先级

### CacheService

缓存服务提供统一的 Redis 缓存操作接口，支持缓存的增删改查和自动失效管理。

**主要功能**：
- 设置缓存
- 获取缓存
- 删除缓存
- 清除缓存
- 基于模式删除缓存
- 带缓存的获取操作（自动处理缓存逻辑）

### ChefService

厨师服务负责厨师的管理和调度，包括技能匹配、工作量分配和可用性管理。

### KitchenResourceService

厨房资源服务负责管理厨房设备资源的使用和分配，避免资源冲突。

## API 文档

### 订单管理 API

#### 获取订单队列

```http
GET /api/orders/queue
```

**参数**：
- `restaurantId`: 餐厅 ID
- `status`: 订单状态（可选）
- `limit`: 每页数量
- `page`: 页码

**返回**：
```json
{
  "orders": [],
  "totalCount": 0,
  "currentStatus": "pending"
}
```

#### 创建新订单

```http
POST /api/orders
```

**请求体**：
```json
{
  "restaurantId": "restaurant-1",
  "customerId": "customer-1",
  "dishes": [
    {
      "dishId": "dish-1",
      "name": "Test Dish",
      "quantity": 1,
      "price": 50
    }
  ],
  "totalAmount": 50
}
```

#### 更新订单状态

```http
PUT /api/orders/:orderId/status
```

**请求体**：
```json
{
  "status": "completed"
}
```

## 性能优化

### Redis 缓存策略

1. **订单队列缓存**：
   - 缓存基于餐厅 ID 和状态的订单队列
   - 缓存有效期：60 秒
   - 订单状态变更时自动清除缓存

2. **菜品信息缓存**：
   - 缓存菜品的复杂度、烹饪时间等信息
   - 缓存有效期：1 小时
   - 支持批量获取和缓存

### 厨师调度算法优化

- 基于厨师技能、当前工作量和历史评分进行综合排序
- 支持订单优先级权重调整
- 动态计算厨师匹配度

## 测试

### 运行单元测试

```bash
pnpm test
```

### 运行测试并生成覆盖率报告

```bash
pnpm test --coverage
```

## 部署

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY dist ./dist
COPY .env ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

构建并运行 Docker 容器：

```bash
docker build -t yyc3-smart-kitchen .
docker run -p 3000:3000 --env-file .env yyc3-smart-kitchen
```

## 监控与日志

### 日志配置

项目使用 Winston 进行日志管理，支持控制台和文件输出，并按日期轮换日志文件。

### 性能监控

- 集成 Prometheus 监控
- 支持指标收集和可视化

## 贡献

欢迎提交 Issue 和 Pull Request！

### 代码规范

- 遵循 TypeScript 编码规范
- 使用 ESLint 和 Prettier 进行代码检查和格式化
- 提交前运行 `pnpm lint` 和 `pnpm test`

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系 YYC³ 开发团队。

---

YYC³ 智慧后厨服务 - 提升餐饮行业效率的智能化解决方案
