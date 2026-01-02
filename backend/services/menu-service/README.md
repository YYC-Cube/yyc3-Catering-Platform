# YYC³ 菜单服务

> 智能餐饮平台菜单服务 - 管理餐厅菜单、分类、菜品和标签的微服务

## 概述

YYC³菜单服务是智能餐饮平台的核心微服务之一，负责管理餐厅的菜单结构、菜品分类、菜品信息和标签系统。该服务提供了完整的CRUD操作和高级查询功能，支持多餐厅管理、菜品变体、价格管理和库存控制。

## 功能特性

- 📋 **菜单分类管理**：支持多级分类、分类排序和状态管理
- 🍽️ **菜品管理**：完整的菜品信息管理，包括价格、描述、图片、规格等
- 🏷️ **标签系统**：灵活的标签管理，支持按类型和状态筛选
- 📦 **库存管理**：实时库存跟踪和更新
- 💰 **价格管理**：支持基础价格和特殊价格设置
- 📊 **统计功能**：菜品销量统计和热门菜品分析
- 🔒 **权限控制**：基于角色的API访问控制
- 📱 **多端支持**：同时支持管理后台和移动端API

## 技术栈

- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT
- **日志**: Winston + DailyRotateFile
- **API文档**: Swagger (计划中)
- **测试**: Vitest + Supertest
- **容器化**: Docker

## 快速开始

### 环境要求

- Node.js 18.x+
- MySQL 8.0+
- npm 9.x+
- TypeScript 5.x+

### 安装

```bash
# 克隆仓库
git clone git@github.com:yyc3/yyc3-service-menu.git
cd yyc3-service-menu

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件配置数据库和服务信息
```

### 运行

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 开发模式下运行测试
npm run test:watch
```

## API文档

### 分类管理

- `POST /api/categories` - 创建分类
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类
- `PATCH /api/categories/:id/status` - 更新分类状态
- `PATCH /api/categories/sort` - 批量更新分类排序
- `GET /api/categories/tree` - 获取分类树

### 菜品管理

- `POST /api/menu-items` - 创建菜品
- `GET /api/menu-items` - 获取菜品列表
- `GET /api/menu-items/:id` - 获取菜品详情
- `PUT /api/menu-items/:id` - 更新菜品
- `DELETE /api/menu-items/:id` - 删除菜品
- `PATCH /api/menu-items/:id/status` - 更新菜品状态
- `PATCH /api/menu-items/:id/stock` - 更新菜品库存
- `PATCH /api/menu-items/:id/sales` - 增加菜品销量

### 标签管理

- `POST /api/tags` - 创建标签
- `GET /api/tags` - 获取标签列表
- `GET /api/tags/:id` - 获取标签详情
- `PUT /api/tags/:id` - 更新标签
- `DELETE /api/tags/:id` - 删除标签
- `PATCH /api/tags/:id/status` - 更新标签状态
- `PATCH /api/tags/sort` - 批量更新标签排序
- `GET /api/tags/active` - 获取所有激活的标签
- `GET /api/tags/type/:tagType` - 根据标签类型获取标签

## 项目结构

```
├── src/
│   ├── config/          # 配置文件
│   │   ├── logger.ts    # 日志配置
│   │   └── database.ts  # 数据库配置
│   ├── controllers/     # 控制器
│   │   ├── CategoryController.ts
│   │   ├── MenuItemController.ts
│   │   └── TagController.ts
│   ├── models/          # 数据模型
│   │   ├── Category.ts
│   │   ├── MenuItem.ts
│   │   ├── MenuItemOption.ts
│   │   ├── MenuItemImage.ts
│   │   ├── Tag.ts
│   │   └── MenuItemTag.ts
│   ├── routes/          # 路由配置
│   │   ├── categoryRoutes.ts
│   │   ├── menuItemRoutes.ts
│   │   └── tagRoutes.ts
│   ├── services/        # 业务逻辑
│   │   ├── CategoryService.ts
│   │   ├── MenuItemService.ts
│   │   └── TagService.ts
│   └── app.ts           # 应用入口
├── .env                 # 环境变量
├── .env.example         # 环境变量模板
├── Dockerfile           # Docker配置
├── tsconfig.json        # TypeScript配置
└── package.json         # 项目配置
```

## 开发指南

### 代码风格

- 使用TypeScript严格模式
- 遵循ESLint和Prettier规范
- 函数和方法使用JSDoc注释
- 文件头包含标准注释模板

### 提交规范

```
feat: 添加新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试更新
chore: 构建或依赖更新
```

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t yyc3-menu-service .

# 运行容器
docker run -d -p 3201:3201 --name menu-service yyc3-menu-service
```

### Docker Compose

```yaml
version: '3.8'
services:
  menu-service:
    build: .
    ports:
      - "3201:3201"
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=menu_service_db
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=menu_service_db
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

## 监控与日志

- **健康检查**: `GET /health`
- **日志路径**: `./logs/`
- **日志级别**: info, warn, error
- **日志轮换**: 每日自动轮换

## 贡献指南

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

MIT License - 详见LICENSE文件

## 联系方式

- 📧 **邮箱**: contact@yyc3.com
- 🌐 **官网**: https://yyc3.com
- 📱 **微信**: yyc3_official

---

**YYC³** - 言启象限 | 语枢未来

All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence
