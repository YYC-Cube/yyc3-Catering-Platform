# 贡献指南

感谢您对 YYC³餐饮行业智能化平台的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、测试和反馈。

## 📋 目录

- [开发环境搭建](#开发环境搭建)
- [代码规范](#代码规范)
- [提交流程](#提交流程)
- [代码审查](#代码审查)
- [测试要求](#测试要求)
- [文档贡献](#文档贡献)
- [社区准则](#社区准则)

## 🛠️ 开发环境搭建

### 系统要求

- **Node.js**: 18.0+ (推荐使用最新LTS版本)
- **Bun**: 1.0+ (推荐包管理器)
- **PostgreSQL**: 16+
- **Redis**: 7+
- **Docker**: 20.10+ (可选)
- **Git**: 2.30+

### 快速开始

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 项目
   # 然后克隆你的 Fork
   git clone https://github.com/YOUR_USERNAME/yyc3-catering-platform.git
   cd yyc3-catering-platform
   ```

2. **安装依赖**
   ```bash
   # 使用 Bun (推荐)
   bun install

   # 或使用 npm
   npm install
   ```

3. **环境配置**
   ```bash
   # 复制环境配置文件
   cp .env.example .env

   # 编辑配置文件
   vim .env
   ```

4. **数据库设置**
   ```bash
   # 启动 PostgreSQL 和 Redis
   docker-compose up -d postgres redis

   # 运行数据库迁移
   bun run migrate
   ```

5. **启动开发服务器**
   ```bash
   # 启动后端服务
   bun run dev:backend

   # 启动前端应用 (新终端)
   bun run dev:frontend
   ```

### IDE 配置

我们推荐使用 [Visual Studio Code](https://code.visualstudio.com/) 并安装以下扩展：

- **Vue Language Features (Volar)**
- **TypeScript Importer**
- **ESLint**
- **Prettier**
- **GitLens**
- **Thunder Client** (API 测试)

## 📝 代码规范

### TypeScript/JavaScript 规范

我们使用 ESLint 和 Prettier 来保持代码风格一致：

```bash
# 检查代码规范
bun run lint

# 自动修复
bun run lint:fix

# 格式化代码
bun run format
```

#### 命名规范

- **文件名**: 使用 PascalCase (如 `OrderController.ts`)
- **类名**: 使用 PascalCase (如 `OrderService`)
- **接口名**: 使用 PascalCase (如 `IOrderRepository`)
- **变量名**: 使用 camelCase (如 `orderData`)
- **常量名**: 使用 UPPER_SNAKE_CASE (如 `MAX_RETRY_COUNT`)
- **函数名**: 使用 camelCase，动词开头 (如 `createOrder`, `validateInput`)

#### 类型注解

```typescript
// ✅ 好的做法
interface OrderRequest {
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
}

async function createOrder(request: OrderRequest): Promise<Order> {
  // 实现
}

// ❌ 避免使用 any
function processData(data: any): any {
  // 避免
}
```

### Vue.js 规范

#### 组件命名

```typescript
// ✅ 使用 PascalCase
export default defineComponent({
  name: 'CustomerApp',
  // ...
});
```

#### 组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入
import { ref, computed, onMounted } from 'vue';

// Props 定义
interface Props {
  orderId: string;
  customerName: string;
}

const props = defineProps<Props>();

// Emits 定义
interface Emits {
  orderCompleted: [orderId: string];
  error: [error: Error];
}

const emit = defineEmits<Emits>();

// 响应式状态
const isLoading = ref(false);
const orderData = ref<Order | null>(null);

// 计算属性
const orderStatus = computed(() => {
  return orderData.value?.status || 'unknown';
});

// 方法
const loadOrder = async () => {
  // 实现
};

// 生命周期
onMounted(() => {
  loadOrder();
});
</script>

<style lang="scss" scoped>
// 样式
</style>
```

### 数据库规范

#### 表命名

- 使用复数形式 (如 `orders`, `customers`)
- 使用 snake_case (如 `order_items`, `food_safety_records`)

#### 字段命名

- 使用 snake_case (如 `customer_id`, `created_at`)
- 主键统一使用 `id`
- 外键使用 `{table}_id` 格式
- 时间字段使用 `*_at` 后缀 (如 `created_at`, `updated_at`)

## 🔄 提交流程

### 分支策略

我们使用 Git Flow 分支模型：

- `main`: 生产环境分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支
- `release/*`: 发布分支

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能提交
git commit -m "feat(order): add order status tracking"

# 修复提交
git commit -m "fix(kitchen): resolve cooking time calculation error"

# 文档提交
git commit -m "docs(api): update order API documentation"

# 样式提交
git commit -m "style(ui): fix button alignment"

# 重构提交
git commit -m "refactor(service): extract order validation logic"

# 测试提交
git commit -m "test(order): add unit tests for order service"

# 构建提交
git commit -m "build(deps): update vue to version 3.4.0"
```

### Pull Request 流程

1. **创建分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **开发和测试**
   ```bash
   # 开发功能
   # 运行测试
   bun run test
   bun run lint
   bun run type-check
   ```

3. **提交和推送**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

4. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

5. **合并代码**
   - 至少需要一个代码审查者的批准
   - 所有 CI 检查必须通过
   - 解决冲突后合并到 `develop` 分支

## 👀 代码审查

### 审查清单

**功能性**
- [ ] 代码实现了预期的功能
- [ ] 边界条件处理正确
- [ ] 错误处理完善
- [ ] 性能考虑充分

**代码质量**
- [ ] 代码遵循项目规范
- [ ] 变量和函数命名清晰
- [ ] 代码结构合理
- [ ] 没有重复代码

**安全性**
- [ ] 输入验证充分
- [ ] 没有安全漏洞
- [ ] 敏感信息处理正确
- [ ] 权限控制合理

**测试**
- [ ] 单元测试覆盖核心功能
- [ ] 集成测试验证主要流程
- [ ] 测试用例有意义
- [ ] 测试数据合适

### 审查流程

1. **自动审查**：CI/CD 管道自动运行检查
2. **人工审查**：至少一个团队成员审查
3. **反馈处理**：根据反馈修改代码
4. **最终批准**：审查者批准合并

## 🧪 测试要求

### 测试类型

- **单元测试**: 测试单个函数或组件
- **集成测试**: 测试模块间的交互
- **端到端测试**: 测试完整的用户流程
- **性能测试**: 测试系统性能

### 测试工具

- **后端**: Bun Test
- **前端**: Vitest + Vue Test Utils
- **E2E**: Playwright
- **API**: Thunder Client / Postman

### 测试命令

```bash
# 运行所有测试
bun test

# 运行单元测试
bun test:unit

# 运行集成测试
bun test:integration

# 运行E2E测试
bun test:e2e

# 测试覆盖率
bun test:coverage
```

### 测试编写指南

#### 单元测试示例

```typescript
// OrderService.test.ts
import { test, expect, describe, beforeEach } from 'bun:test';
import { OrderService } from '../OrderService';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService(/* dependencies */);
  });

  test('should create order successfully', async () => {
    const orderData = {
      customerId: 'customer-123',
      items: [
        { dishId: 'dish-1', quantity: 2 }
      ],
      totalAmount: 58.00
    };

    const result = await orderService.createOrder(orderData);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.status).toBe('pending');
    expect(result.customerId).toBe(orderData.customerId);
  });

  test('should throw error for invalid order data', async () => {
    const invalidOrderData = {
      customerId: '', // 无效的客户ID
      items: [],
      totalAmount: -10 // 无效金额
    };

    await expect(orderService.createOrder(invalidOrderData))
      .rejects.toThrow('Invalid order data');
  });
});
```

## 📚 文档贡献

### 文档类型

- **API 文档**: OpenAPI 规范
- **架构文档**: 系统设计和架构说明
- **用户指南**: 功能使用说明
- **开发文档**: 开发环境和流程说明

### 文档编写规范

- 使用 Markdown 格式
- 包含示例代码
- 添加适当的截图
- 保持文档更新

## 🤝 社区准则

### 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境，无论：

- 性别、性别认同和表达
- 性取向
- 残疾
- 外貌
- 身体大小
- 种族
- 年龄
- 宗教

### 预期行为

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不当行为

- 使用性化的语言或图像
- 人身攻击或政治攻击
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息
- 其他在专业环境中可能被认为不当的行为

## 🎯 贡献重点

### 当前优先级

1. **核心功能完善**
   - 智能预约系统
   - 智能点单推荐
   - 厨房管理优化

2. **AI功能增强**
   - 推荐算法优化
   - 自然语言处理
   - 图像识别功能

3. **移动端应用**
   - 顾客端APP
   - 员工端APP
   - 管理后台优化

4. **性能优化**
   - 数据库查询优化
   - 前端性能优化
   - 缓存策略改进

### 欢迎的贡献

- 🐛 Bug 报告和修复
- ✨ 新功能开发
- 📝 文档改进
- 🧪 测试用例添加
- 🎨 UI/UX 改进
- 🔧 性能优化
- 🌐 国际化支持
- 📊 数据分析功能

## 📞 联系我们

如果您有任何问题或建议，请通过以下方式联系我们：

- **GitHub Issues**: [项目 Issues 页面](https://github.com/yyc3/catering-platform/issues)
- **GitHub Discussions**: [项目 Discussions 页面](https://github.com/yyc3/catering-platform/discussions)
- **邮箱**: dev@yyc3.com

---

感谢您的贡献！🙏

**YYC³餐饮行业智能化平台开发团队**