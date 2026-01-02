# YYC³ 微服务开发模板

## 概述

本项目是YYC³智能餐饮平台的微服务开发模板，用于确保所有微服务遵循统一的开发规范、项目结构和配置标准。

## 项目结构

```
.
├── src/
│   ├── config/             # 配置文件目录
│   │   ├── config.ts       # 主配置文件
│   │   ├── database.ts     # 数据库配置
│   │   └── logger.ts       # 日志配置
│   ├── controllers/        # 控制器目录
│   ├── models/             # 数据模型目录
│   ├── services/           # 业务逻辑目录
│   ├── routes/             # 路由配置目录
│   ├── middleware/         # 中间件目录
│   ├── utils/              # 工具函数目录
│   ├── types/              # TypeScript类型定义目录
│   └── app.ts              # 应用入口文件
├── test/                   # 测试文件目录
├── .eslintrc.json          # ESLint配置
├── .prettierrc             # Prettier配置
├── tsconfig.json           # TypeScript配置
├── package.json            # 项目依赖配置
├── .env.example            # 环境变量示例
└── README.md               # 项目说明文档
```

## 开发规范

### 命名规范

- 服务命名：使用小写字母和连字符，如`user-service`
- 代码文件命名：使用小写字母和连字符，如`user-controller.ts`
- 类命名：使用驼峰命名法，首字母大写，如`UserController`
- 函数命名：使用驼峰命名法，首字母小写，如`getUserById`
- 变量命名：使用驼峰命名法，首字母小写，如`userId`
- 常量命名：使用大写字母和下划线，如`MAX_PAGE_SIZE`

### API设计规范

- 使用RESTful API设计原则
- URL路径使用小写字母和连字符，如`/users/{id}/orders`
- HTTP方法使用：GET(查询)、POST(创建)、PUT(更新)、DELETE(删除)、PATCH(部分更新)
- 响应格式统一：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {},
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
  ```

### 错误处理规范

- 使用统一的错误格式
- 错误码使用HTTP状态码
- 提供详细的错误信息
- 生产环境不返回堆栈信息

### 日志规范

- 使用结构化日志
- 日志级别：debug、info、warn、error
- 包含时间戳、服务名、版本、操作类型、操作结果等信息

## 配置管理

### 环境变量

- 使用`.env`文件管理环境变量
- 提供`.env.example`作为示例
- 环境变量命名使用大写字母和下划线，如`DATABASE_URL`

### 配置文件

- 集中管理所有配置
- 区分不同环境的配置（开发、测试、生产）
- 配置项命名使用驼峰命名法

## 开发流程

1. 使用本模板创建新的微服务
2. 根据业务需求实现功能
3. 编写单元测试和集成测试
4. 运行代码检查和格式化
5. 提交代码并创建Pull Request
6. 代码审查通过后合并到主分支

## 构建和部署

### 构建

```bash
npm run build
```

### 启动开发服务器

```bash
npm run dev
```

### 启动生产服务器

```bash
npm run start
```

## 测试

### 运行单元测试

```bash
npm run test:unit
```

### 运行集成测试

```bash
npm run test:integration
```

### 运行所有测试

```bash
npm run test
```

## 代码质量

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 依赖管理

- 使用npm管理依赖
- 定期更新依赖包
- 锁定依赖版本

## 版本控制

- 使用Git进行版本控制
- 遵循语义化版本号规范
- 提交信息清晰明了

## 文档

- 提供详细的API文档
- 定期更新文档
- 文档与代码保持一致

## 安全

- 遵循安全编码规范
- 定期进行安全扫描
- 及时修复安全漏洞

## 性能

- 优化数据库查询
- 使用缓存减少数据库访问
- 定期进行性能测试

## 监控和告警

- 集成Prometheus监控
- 设置告警规则
- 定期查看监控数据

## 贡献

请参考项目的贡献指南。

## 许可证

MIT License
