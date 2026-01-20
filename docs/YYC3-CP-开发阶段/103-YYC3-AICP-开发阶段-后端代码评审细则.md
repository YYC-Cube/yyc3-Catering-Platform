# YYC³餐饮行业智能化平台 - 后端代码评审细则

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档编号 | 103-YYC3-AICP-开发阶段-后端代码评审细则 |
| 文档版本 | v1.0.0 |
| 创建日期 | 2025-01-04 |
| 最后更新 | 2025-01-04 |
| 文档状态 | 已完成 |
| 文档分类 | 开发阶段文档 |

---

## 一、文档概述

### 1.1 文档目的

本文档定义了YYC³餐饮行业智能化平台后端代码的评审细则，为开发团队提供统一的代码质量标准和评审指南，确保代码的可维护性、可扩展性和安全性。

### 1.2 适用范围

本文档适用于YYC³餐饮行业智能化平台所有后端服务代码的评审工作，包括但不限于：

- 网关服务
- 用户服务
- AI助手服务
- 订单服务
- 菜单服务
- 通知服务
- 其他微服务

### 1.3 评审目标

- 提高代码质量和可维护性
- 统一编码风格和最佳实践
- 发现和修复潜在问题
- 促进知识共享和团队成长
- 确保代码符合项目规范

---

## 二、文件结构规范

### 2.1 目录结构

```
backend/
├── gateway/                 # API网关
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由
│   │   ├── utils/          # 工具函数
│   │   ├── types/          # 类型定义
│   │   └── main.ts         # 入口文件
│   └── package.json
├── services/                # 微服务
│   ├── user-service/       # 用户服务
│   ├── ai-assistant/       # AI助手服务
│   └── ...
└── common/                  # 公共模块
    ├── services/           # 公共服务
    ├── utils/              # 公共工具
    └── types/              # 公共类型
```

### 2.2 文件命名规范

- TypeScript文件使用PascalCase：`UserController.ts`
- 配置文件使用camelCase：`gateway.config.ts`
- 工具文件使用camelCase：`logger.ts`
- 类型定义文件使用PascalCase：`GatewayTypes.ts`

### 2.3 文件组织原则

- 每个文件只导出一个主要类或模块
- 相关功能放在同一目录下
- 避免文件过大（建议不超过500行）
- 使用清晰的文件名描述文件内容

---

## 三、代码风格规范

### 3.1 命名规范

#### 3.1.1 变量和函数命名

```typescript
// ✅ 正确 - 使用camelCase
const userName = 'John';
const getUserById = (id: string) => {};

// ❌ 错误 - 使用snake_case
const user_name = 'John';
const get_user_by_id = (id: string) => {};
```

#### 3.1.2 类和接口命名

```typescript
// ✅ 正确 - 使用PascalCase
class UserService {}
interface UserConfig {}
type UserRole = 'admin' | 'user';

// ❌ 错误 - 使用camelCase
class userService {}
interface userConfig {}
```

#### 3.1.3 常量命名

```typescript
// ✅ 正确 - 使用UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 30000;

// ❌ 错误 - 使用camelCase
const maxRetryCount = 3;
const defaultTimeout = 30000;
```

#### 3.1.4 私有成员命名

```typescript
// ✅ 正确 - 使用下划线前缀
class UserService {
  private _logger: Logger;
  private _config: Config;
}

// ❌ 错误 - 不使用前缀
class UserService {
  private logger: Logger;
  private config: Config;
}
```

### 3.2 代码格式化

#### 3.2.1 缩进和空格

- 使用2个空格缩进
- 运算符前后添加空格
- 逗号后添加空格
- 冒号后添加空格

```typescript
// ✅ 正确
const result = a + b;
const user = { id: 1, name: 'John' };

// ❌ 错误
const result=a+b;
const user={id:1,name:'John'};
```

#### 3.2.2 行长度

- 单行代码不超过120个字符
- 长表达式适当换行

```typescript
// ✅ 正确
const result = someVeryLongFunctionName(
  param1,
  param2,
  param3
);

// ❌ 错误
const result = someVeryLongFunctionName(param1, param2, param3, param4, param5, param6, param7, param8);
```

#### 3.2.3 空行使用

- 函数之间添加空行
- 逻辑块之间添加空行
- 导入语句后添加空行

```typescript
// ✅ 正确
import { express } from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(3000);

// ❌ 错误
import { express } from 'express';
const app = express();
app.get('/', (req, res) => {
  res.send('Hello');
});
app.listen(3000);
```

### 3.3 注释规范

#### 3.3.1 文件头注释

```typescript
/**
 * @fileoverview 用户控制器
 * @description 处理用户管理相关的API请求
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
```

#### 3.3.2 类注释

```typescript
/**
 * 用户服务类
 * @description 提供用户相关的业务逻辑处理
 */
class UserService {
  // ...
}
```

#### 3.3.3 方法注释

```typescript
/**
 * 根据ID获取用户信息
 * @param id 用户ID
 * @returns 用户信息
 * @throws {Error} 当用户不存在时抛出错误
 */
async getUserById(id: string): Promise<User | null> {
  // ...
}
```

#### 3.3.4 行内注释

```typescript
// 检查用户状态
if (user.status !== 'active') {
  throw new Error('用户已被禁用');
}

// 生成JWT令牌
const token = jwt.sign(payload, secret);
```

---

## 四、API开发规范

### 4.1 路由设计

#### 4.1.1 RESTful API设计

```typescript
// ✅ 正确 - 使用RESTful风格
router.get('/users', getAllUsers);           // 获取用户列表
router.get('/users/:id', getUserById);        // 获取单个用户
router.post('/users', createUser);            // 创建用户
router.put('/users/:id', updateUser);         // 更新用户
router.delete('/users/:id', deleteUser);      // 删除用户

// ❌ 错误 - 不符合RESTful风格
router.get('/getAllUsers', getAllUsers);
router.get('/getUserById/:id', getUserById);
router.post('/createUser', createUser);
```

#### 4.1.2 路由版本控制

```typescript
// ✅ 正确 - 使用版本控制
router.use('/api/v1/users', userRoutes);
router.use('/api/v2/users', userRoutesV2);

// ❌ 错误 - 不使用版本控制
router.use('/users', userRoutes);
```

### 4.2 控制器规范

#### 4.2.1 控制器结构

```typescript
// ✅ 正确 - 清晰的控制器结构
class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const result = await userService.getAllUsers(req.query);
      return res.status(200).json({
        code: 200,
        message: '获取用户列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取用户列表失败:', error);
      return res.status(500).json({
        code: 500,
        message: error.message || '获取用户列表失败',
      });
    }
  }
}

// ❌ 错误 - 缺少错误处理
class UserController {
  async getAllUsers(req: Request, res: Response) {
    const result = await userService.getAllUsers(req.query);
    return res.json(result);
  }
}
```

#### 4.2.2 请求参数验证

```typescript
// ✅ 正确 - 参数验证
async createUser(req: Request, res: Response) {
  const { username, email, password } = req.body;

  // 验证必填字段
  if (!username || !email || !password) {
    return res.status(400).json({
      code: 400,
      message: '用户名、邮箱和密码为必填项',
    });
  }

  // 验证邮箱格式
  if (!isValidEmail(email)) {
    return res.status(400).json({
      code: 400,
      message: '邮箱格式不正确',
    });
  }

  // ...
}

// ❌ 错误 - 不进行参数验证
async createUser(req: Request, res: Response) {
  const user = await userService.createUser(req.body);
  return res.json(user);
}
```

### 4.3 响应格式规范

#### 4.3.1 成功响应

```typescript
// ✅ 正确 - 统一的成功响应格式
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "123",
    "name": "John"
  }
}

// ❌ 错误 - 不统一的响应格式
{
  "success": true,
  "result": {
    "id": "123",
    "name": "John"
  }
}
```

#### 4.3.2 错误响应

```typescript
// ✅ 正确 - 统一的错误响应格式
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}

// ❌ 错误 - 不统一的错误响应格式
{
  "error": "参数错误",
  "details": "邮箱格式不正确"
}
```

### 4.4 状态码使用规范

```typescript
// ✅ 正确 - 正确使用HTTP状态码
200 OK - 请求成功
201 Created - 资源创建成功
204 No Content - 删除成功
400 Bad Request - 请求参数错误
401 Unauthorized - 未认证
403 Forbidden - 无权限
404 Not Found - 资源不存在
500 Internal Server Error - 服务器错误

// ❌ 错误 - 错误使用HTTP状态码
200 - 资源不存在（应该使用404）
200 - 参数错误（应该使用400）
```

---

## 五、数据库交互规范

### 5.1 数据库连接管理

#### 5.1.1 连接池配置

```typescript
// ✅ 正确 - 合理的连接池配置
const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,              // 最大连接数
  min: 5,               // 最小连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// ❌ 错误 - 不合理的连接池配置
const poolConfig: PoolConfig = {
  max: 100,             // 连接数过多
  min: 0,               // 最小连接数为0
  idleTimeoutMillis: 0, // 不设置空闲超时
};
```

#### 5.1.2 连接释放

```typescript
// ✅ 正确 - 正确释放连接
async getUserById(id: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// ❌ 错误 - 不释放连接
async getUserById(id: string): Promise<User | null> {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}
```

### 5.2 SQL查询规范

#### 5.2.1 参数化查询

```typescript
// ✅ 正确 - 使用参数化查询防止SQL注入
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1 AND status = $2',
  [userId, status]
);

// ❌ 错误 - 拼接SQL字符串
const result = await pool.query(
  `SELECT * FROM users WHERE id = '${userId}' AND status = '${status}'`
);
```

#### 5.2.2 查询字段选择

```typescript
// ✅ 正确 - 只查询需要的字段
const result = await pool.query(
  'SELECT id, name, email FROM users WHERE id = $1',
  [userId]
);

// ❌ 错误 - 查询所有字段
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

#### 5.2.3 分页查询

```typescript
// ✅ 正确 - 使用分页查询
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
const offset = (page - 1) * limit;

const result = await pool.query(
  'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
  [limit, offset]
);

// ❌ 错误 - 不使用分页查询
const result = await pool.query('SELECT * FROM users');
```

### 5.3 事务处理

```typescript
// ✅ 正确 - 正确处理事务
async transferMoney(fromUserId: string, toUserId: string, amount: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2',
      [amount, fromUserId]
    );

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE user_id = $2',
      [amount, toUserId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ❌ 错误 - 不使用事务
async transferMoney(fromUserId: string, toUserId: string, amount: number) {
  await pool.query(
    'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2',
    [amount, fromUserId]
  );

  await pool.query(
    'UPDATE accounts SET balance = balance + $1 WHERE user_id = $2',
    [amount, toUserId]
  );
}
```

### 5.4 数据库模型规范

#### 5.4.1 模型定义

```typescript
// ✅ 正确 - 清晰的模型定义
interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  status: 'active' | 'inactive' | 'locked';
  createdAt: Date;
  updatedAt: Date;
}

class User extends Model<UserAttributes> {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public status!: 'active' | 'inactive' | 'locked';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ❌ 错误 - 不清晰的模型定义
class User extends Model {
  public id: any;
  public username: any;
  public email: any;
  public password: any;
  public status: any;
  public createdAt: any;
  public updatedAt: any;
}
```

#### 5.4.2 模型验证

```typescript
// ✅ 正确 - 添加模型验证
User.init({
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: '邮箱格式不正确' },
      notEmpty: { msg: '邮箱不能为空' }
    }
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: { args: [8, 100], msg: '密码长度必须在8-100个字符之间' }
    }
  }
});

// ❌ 错误 - 不添加验证
User.init({
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});
```

---

## 六、错误处理规范

### 6.1 错误分类

```typescript
// ✅ 正确 - 定义清晰的错误类型
export class AppError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

// ❌ 错误 - 不分类错误
throw new Error('用户不存在');
```

### 6.2 错误处理中间件

```typescript
// ✅ 正确 - 全局错误处理中间件
export const errorHandler = (err: Error | unknown, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = 500;
  let errorResponse = {
    success: false,
    message: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  if (err instanceof AppError) {
    statusCode = err.status;
    errorResponse.message = err.message;
    errorResponse.code = err.code;
  }

  logger.error('Error occurred', {
    error: err instanceof Error ? err.message : String(err),
    path: req.path,
    method: req.method
  });

  res.status(statusCode).json(errorResponse);
};

// ❌ 错误 - 不使用错误处理中间件
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

### 6.3 异步错误处理

```typescript
// ✅ 正确 - 使用asyncHandler包装异步函数
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): ((...args: Parameters<T>) => void) => {
  return (...args: Parameters<T>) => {
    fn(...args).catch(args[2]);
  };
};

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
}));

// ❌ 错误 - 不处理异步错误
router.get('/users/:id', async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
});
```

### 6.4 错误日志记录

```typescript
// ✅ 正确 - 详细的错误日志
logger.error('Error occurred', {
  error: error.message,
  code: errorResponse.code,
  status: statusCode,
  path: req.path,
  method: req.method,
  ip: req.ip,
  userId: req.user?.id,
  context: req.context,
  stack: error.stack
});

// ❌ 错误 - 简单的错误日志
logger.error(error.message);
```

---

## 七、安全实践

### 7.1 认证和授权

#### 7.1.1 JWT认证

```typescript
// ✅ 正确 - 使用JWT认证
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: '无效的令牌' });
  }
};

// ❌ 错误 - 不验证令牌
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  req.user = jwt.decode(token);
  next();
};
```

#### 7.1.2 角色授权

```typescript
// ✅ 正确 - 角色授权中间件
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: '未通过认证' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: '没有访问权限' });
    }
    
    next();
  };
};

router.get('/admin/users', authenticateToken, authorize(['admin']), getAllUsers);

// ❌ 错误 - 不进行角色授权
router.get('/admin/users', getAllUsers);
```

### 7.2 输入验证

```typescript
// ✅ 正确 - 使用验证库进行输入验证
import { z } from 'zod';

const UserSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(0).max(150)
});

async createUser(req: Request, res: Response) {
  try {
    const validatedData = UserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    throw error;
  }
}

// ❌ 错误 - 不进行输入验证
async createUser(req: Request, res: Response) {
  const user = await userService.createUser(req.body);
  res.json(user);
}
```

### 7.3 敏感数据处理

```typescript
// ✅ 正确 - 不记录敏感信息
logger.info('User login', {
  userId: user.id,
  email: user.email,
  timestamp: new Date()
});

// ❌ 错误 - 记录敏感信息
logger.info('User login', {
  userId: user.id,
  email: user.email,
  password: user.password,
  token: token
});
```

### 7.4 SQL注入防护

```typescript
// ✅ 正确 - 使用参数化查询
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ 错误 - 拼接SQL字符串
const result = await pool.query(
  `SELECT * FROM users WHERE id = '${userId}'`
);
```

### 7.5 XSS防护

```typescript
// ✅ 正确 - 对输出进行转义
import xss from 'xss';

const sanitizedInput = xss(req.body.description);

// ❌ 错误 - 不进行转义
const description = req.body.description;
```

---

## 八、性能优化

### 8.1 数据库查询优化

#### 8.1.1 使用索引

```typescript
// ✅ 正确 - 在查询中使用索引
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// 确保email字段有索引
// CREATE INDEX idx_users_email ON users(email);

// ❌ 错误 - 不使用索引
const result = await pool.query(
  'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
  [email]
);
```

#### 8.1.2 避免N+1查询

```typescript
// ✅ 正确 - 使用JOIN避免N+1查询
const result = await pool.query(`
  SELECT u.*, o.id as order_id, o.total as order_total
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.id = $1
`, [userId]);

// ❌ 错误 - N+1查询
const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
```

### 8.2 缓存使用

```typescript
// ✅ 正确 - 使用缓存
async getUserById(id: string): Promise<User | null> {
  const cacheKey = `user:${id}`;
  
  // 先从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 从数据库获取
  const user = await User.findByPk(id);
  
  // 写入缓存
  if (user) {
    await redis.setex(cacheKey, 3600, JSON.stringify(user));
  }
  
  return user;
}

// ❌ 错误 - 不使用缓存
async getUserById(id: string): Promise<User | null> {
  return await User.findByPk(id);
}
```

### 8.3 异步处理

```typescript
// ✅ 正确 - 使用异步处理
async sendWelcomeEmail(userId: string) {
  const user = await User.findByPk(userId);
  await emailService.send(user.email, 'Welcome!');
}

// 不等待邮件发送完成
sendWelcomeEmail(userId).catch(error => {
  logger.error('Failed to send welcome email', error);
});

// ❌ 错误 - 同步处理
async createUser(req: Request, res: Response) {
  const user = await userService.createUser(req.body);
  await emailService.sendWelcomeEmail(user.email); // 阻塞响应
  res.json(user);
}
```

### 8.4 连接池优化

```typescript
// ✅ 正确 - 合理配置连接池
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ❌ 错误 - 不合理的连接池配置
const pool = new Pool({
  max: 100,
  min: 0,
  idleTimeoutMillis: 0,
});
```

---

## 九、测试要求

### 9.1 单元测试

```typescript
// ✅ 正确 - 编写单元测试
describe('UserService', () => {
  describe('getUserById', () => {
    it('应该返回用户信息', async () => {
      const user = await userService.getUserById('123');
      expect(user).toBeDefined();
      expect(user.id).toBe('123');
    });

    it('当用户不存在时应该返回null', async () => {
      const user = await userService.getUserById('999');
      expect(user).toBeNull();
    });
  });
});

// ❌ 错误 - 不编写单元测试
// 没有测试代码
```

### 9.2 集成测试

```typescript
// ✅ 正确 - 编写集成测试
describe('User API', () => {
  it('应该创建用户', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.data.username).toBe('testuser');
  });
});

// ❌ 错误 - 不编写集成测试
// 没有集成测试代码
```

### 9.3 测试覆盖率

- 单元测试覆盖率不低于80%
- 关键业务逻辑覆盖率不低于90%
- 所有公共方法必须有测试

---

## 十、日志规范

### 10.1 日志级别

```typescript
// ✅ 正确 - 正确使用日志级别
logger.debug('Debug information', { userId });
logger.info('User logged in', { userId, timestamp });
logger.warn('Rate limit exceeded', { ip, count });
logger.error('Database connection failed', { error });

// ❌ 错误 - 错误使用日志级别
logger.info('Database connection failed', { error });
logger.debug('User logged in', { userId });
```

### 10.2 日志内容

```typescript
// ✅ 正确 - 详细的日志信息
logger.info('User login', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date()
});

// ❌ 错误 - 简单的日志信息
logger.info('User login');
```

### 10.3 结构化日志

```typescript
// ✅ 正确 - 使用结构化日志
logger.info('Order created', {
  orderId: order.id,
  userId: order.userId,
  total: order.total,
  items: order.items.length,
  timestamp: new Date()
});

// ❌ 错误 - 非结构化日志
logger.info(`Order created: ${order.id} by user ${order.userId} with total ${order.total}`);
```

---

## 十一、代码评审清单

### 11.1 代码质量

- [ ] 代码符合项目编码规范
- [ ] 变量和函数命名清晰易懂
- [ ] 代码结构清晰，逻辑简单
- [ ] 没有重复代码
- [ ] 代码复杂度合理

### 11.2 功能正确性

- [ ] 功能实现符合需求
- [ ] 边界条件处理正确
- [ ] 错误处理完善
- [ ] 输入验证充分
- [ ] 业务逻辑正确

### 11.3 性能优化

- [ ] 数据库查询优化
- [ ] 合理使用缓存
- [ ] 避免不必要的计算
- [ ] 连接池配置合理
- [ ] 异步处理正确

### 11.4 安全性

- [ ] 认证授权正确
- [ ] 输入验证充分
- [ ] SQL注入防护
- [ ] XSS防护
- [ ] 敏感信息保护

### 11.5 可维护性

- [ ] 代码注释充分
- [ ] 模块划分合理
- [ ] 接口设计清晰
- [ ] 错误信息明确
- [ ] 日志记录完善

### 11.6 测试覆盖

- [ ] 单元测试充分
- [ ] 集成测试完善
- [ ] 测试覆盖率达标
- [ ] 测试用例有效
- [ ] 边界测试充分

---

## 十二、常见问题

### 12.1 代码风格问题

**问题**: 代码风格不统一

**解决方案**: 使用ESLint和Prettier统一代码风格

```json
{
  "eslintConfig": {
    "extends": ["@typescript-eslint/recommended"],
    "rules": {
      "indent": ["error", 2],
      "quotes": ["error", "single"],
      "semi": ["error", "always"]
    }
  }
}
```

### 12.2 错误处理问题

**问题**: 错误处理不完善

**解决方案**: 使用全局错误处理中间件

```typescript
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', {
    error: err.message,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    code: 500,
    message: 'Internal Server Error'
  });
};
```

### 12.3 性能问题

**问题**: 数据库查询慢

**解决方案**: 使用索引和优化查询

```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);

-- 优化查询
SELECT id, name, email FROM users WHERE email = $1;
```

### 12.4 安全问题

**问题**: SQL注入风险

**解决方案**: 使用参数化查询

```typescript
// ✅ 正确
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ 错误
const result = await pool.query(`SELECT * FROM users WHERE id = '${userId}'`);
```

---

## 十三、最佳实践

### 13.1 代码组织

- 按功能模块组织代码
- 使用清晰的目录结构
- 避免循环依赖
- 使用依赖注入

### 13.2 错误处理

- 使用自定义错误类
- 提供清晰的错误信息
- 记录详细的错误日志
- 实现优雅降级

### 13.3 性能优化

- 使用缓存减少数据库查询
- 优化数据库查询
- 使用连接池
- 异步处理耗时操作

### 13.4 安全实践

- 使用HTTPS
- 实施认证和授权
- 验证所有输入
- 保护敏感信息

### 13.5 测试策略

- 编写单元测试
- 编写集成测试
- 保持高测试覆盖率
- 使用测试驱动开发

---

## 十四、评审流程

### 14.1 评审前准备

- 确保代码通过本地测试
- 确保代码通过CI/CD检查
- 提供清晰的PR描述
- 标注需要重点关注的部分

### 14.2 评审过程

- 仔细阅读代码
- 检查代码符合规范
- 提供建设性的反馈
- 讨论改进方案

### 14.3 评审后处理

- 及时处理评审意见
- 更新代码和测试
- 重新提交PR
- 关闭已完成的PR

---

## 十五、持续改进

### 15.1 定期回顾

- 定期回顾代码评审流程
- 收集团队反馈
- 优化评审标准
- 更新文档

### 15.2 知识分享

- 分享最佳实践
- 组织技术分享会
- 编写技术文档
- 培训新成员

### 15.3 工具优化

- 使用自动化工具
- 优化CI/CD流程
- 集成代码质量检查
- 提高评审效率

---

## 附录

### A. 相关文档

- [代码规范文档](./097-YYC3-AICP-开发阶段-代码规范.md)
- [前端代码评审细则](./102-YYC3-AICP-开发阶段-前端代码评审细则.md)
- [单元测试文档](./098-YYC3-AICP-开发阶段-单元测试文档.md)
- [集成测试文档](./099-YYC3-AICP-开发阶段-集成测试文档.md)

### B. 参考资源

- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [Node.js最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js指南](https://expressjs.com/zh-cn/guide/routing.html)
- [PostgreSQL文档](https://www.postgresql.org/docs/)

### C. 联系方式

如有疑问或建议，请联系：

- 技术负责人: [待填写]
- 架构师: [待填写]
- 项目经理: [待填写]

---

**文档结束**
