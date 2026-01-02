---

**@file**：YYC³-数据库架构详细设计文档
**@description**：YYC³餐饮行业智能化平台的数据库架构详细设计文档，包含数据库设计原则、表结构设计、索引设计、分库分表策略、数据迁移方案等核心内容
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：架构设计,数据库,YYC³,数据存储

---
# 🔖 YYC³ 数据库架构详细设计文档

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 属性 | 内容 |
|------|------|
| **文档标题** | YYC³ 数据库架构详细设计文档 |
| **文档类型** | 架构设计类文档 |
| **所属阶段** | 架构设计 |
| **遵循规范** | YYC³ 团队标准化规范 v1.0.0 |
| **版本号** | v1.0.0 |
| **创建日期** | 2025-01-30 |
| **作者** | YYC³ Team |
| **更新日期** | 2025-01-30 |

---

## 📑 目录

1. [架构概述](#1-架构概述)
2. [数据库设计原则](#2-数据库设计原则)
3. [数据库选型](#3-数据库选型)
4. [核心数据库设计](#4-核心数据库设计)
5. [缓存设计](#5-缓存设计)
6. [数据迁移策略](#6-数据迁移策略)
7. [备份与恢复](#7-备份与恢复)
8. [性能优化](#8-性能优化)
9. [安全策略](#9-安全策略)
10. [监控与维护](#10-监控与维护)

---

## 1. 概述

### 1.1 设计目标

本架构设计文档旨在为YYC³餐饮行业智能化平台提供清晰、完整的技术架构指导。主要目标包括：

- **可扩展性**：支持业务快速扩展，模块化设计便于功能迭代
- **高性能**：优化系统性能，确保高并发场景下的稳定运行
- **高可用性**：实现系统高可用，故障自动恢复，保障业务连续性
- **安全性**：建立完善的安全体系，保护数据和系统安全
- **易维护性**：代码结构清晰，文档完善，便于团队协作和维护

通过本架构设计，确保平台能够满足当前业务需求，并为未来的发展奠定坚实基础。

### 1.2 设计原则

架构设计遵循以下核心原则：

- **单一职责原则**：每个模块只负责一个明确的业务功能
- **开闭原则**：对扩展开放，对修改关闭，便于功能扩展
- **依赖倒置原则**：高层模块不依赖低层模块，都依赖抽象
- **接口隔离原则**：使用细粒度的接口，避免接口污染
- **最少知识原则**：模块间最小化依赖，降低耦合度

同时遵循YYC³「五高五标五化」核心理念：
- **五高**：高可用、高性能、高安全、高扩展、高可维护
- **五标**：标准化、规范化、自动化、智能化、可视化
- **五化**：流程化、文档化、工具化、数字化、生态化

### 1.3 技术选型

技术栈选择基于以下考虑：

**前端技术栈**
- React 18+：采用现代化前端框架，组件化开发
- TypeScript 5.0+：类型安全，提高代码质量
- Next.js 14+：SSR/SSG支持，优化SEO和性能
- Tailwind CSS：原子化CSS，快速构建UI

**后端技术栈**
- Node.js 18+：高性能JavaScript运行时
- Express/Fastify：轻量级Web框架
- PostgreSQL 15+：关系型数据库，ACID保证
- Redis 7+：缓存和会话存储

**基础设施**
- Docker：容器化部署，环境一致性
- Kubernetes：容器编排，自动化运维
- Nginx：反向代理和负载均衡
- Prometheus + Grafana：监控和告警

**开发工具**
- Git：版本控制
- ESLint + Prettier：代码规范
- Jest + Vitest：单元测试
- GitHub Actions：CI/CD自动化

## 2. 架构设计

### 2.1 整体架构

YYC³餐饮行业智能化平台采用分层架构设计，从上到下分为以下层次：

**表现层（Presentation Layer）**
- Web前端：React + Next.js构建的单页应用
- 移动端：响应式设计，支持多设备访问
- 管理后台：独立的管理界面

**应用层（Application Layer）**
- API网关：统一入口，路由分发
- 业务服务：订单、用户、商品等核心业务逻辑
- 认证授权：JWT认证，RBAC权限控制

**领域层（Domain Layer）**
- 领域模型：核心业务实体和规则
- 领域服务：复杂业务逻辑封装
- 仓储接口：数据访问抽象

**基础设施层（Infrastructure Layer）**
- 数据库：PostgreSQL主从架构
- 缓存：Redis集群
- 消息队列：RabbitMQ/Kafka
- 文件存储：OSS/MinIO

**跨层关注点**
- 日志监控：ELK Stack
- 配置管理：Apollo/Nacos
- 服务发现：Consul/Eureka
- 链路追踪：Jaeger/SkyWalking

### 2.2 模块划分

系统按照业务领域划分为以下核心模块：

**用户模块（User Module）**
- 用户注册、登录、认证
- 用户信息管理
- 权限和角色管理

**商品模块（Product Module）**
- 商品信息管理
- 商品分类和标签
- 库存管理

**订单模块（Order Module）**
- 订单创建和支付
- 订单状态流转
- 订单查询和统计

**支付模块（Payment Module）**
- 支付接口集成
- 支付状态同步
- 退款处理

**营销模块（Marketing Module）**
- 优惠券管理
- 促销活动
- 会员积分

**报表模块（Report Module）**
- 销售报表
- 数据分析
- 可视化展示

**系统模块（System Module）**
- 配置管理
- 日志管理
- 监控告警

### 2.3 数据流向

## 3. 技术实现

### 3.1 核心技术

### 3.2 关键算法

### 3.3 性能优化

## 4. 接口设计

### 4.1 API接口

### 4.2 数据接口

### 4.3 消息接口

## 5. 部署方案

### 5.1 部署架构

### 5.2 配置管理

### 5.3 监控告警

## 6. 附录

### 6.1 术语表

### 6.2 参考资料

## 1. 架构概述

### 1.1 数据库架构层次

YYC³ 餐饮管理平台采用多层数据库架构：

```
┌─────────────────────────────────────────┐
│         应用层 (Application)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         ORM 层 (Prisma/Sequelize)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      缓存层 (Redis/Memcached)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      数据库层 (PostgreSQL/MySQL)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      存储层 (SSD/NVMe)                  │
└─────────────────────────────────────────┘
```

### 1.2 数据库架构特点

- **高可用性**：主从复制、读写分离
- **高性能**：缓存加速、索引优化
- **高扩展性**：分库分表、水平扩展
- **数据一致性**：事务支持、ACID 特性
- **数据安全**：备份恢复、权限控制

### 1.3 技术选型

| 组件 | 技术选型 | 版本 | 用途 |
|------|---------|------|------|
| 关系型数据库 | PostgreSQL | 15+ | 主数据存储 |
| 缓存数据库 | Redis | 7+ | 会话缓存、热点数据 |
| ORM 框架 | Prisma | 5+ | 数据访问层 |
| 数据库连接池 | pg-pool | 3+ | 连接管理 |
| 数据迁移 | Prisma Migrate | 5+ | 版本控制 |

---

## 2. 数据库设计原则

### 2.1 设计原则

- **规范化**：遵循第三范式（3NF）
- **性能优先**：合理反规范化
- **可扩展性**：预留扩展空间
- **数据完整性**：约束和触发器
- **安全性**：最小权限原则

### 2.2 命名规范

- **表名**：使用蛇形命名法（snake_case），复数形式
- **字段名**：使用蛇形命名法（snake_case），单数形式
- **索引名**：`idx_表名_字段名`
- **外键名**：`fk_表名_字段名`
- **主键名**：`id`

### 2.3 字段类型规范

| 数据类型 | PostgreSQL 类型 | 说明 |
|---------|----------------|------|
| 主键 | BIGINT | 自增主键 |
| 字符串 | VARCHAR(n) | 可变长度字符串 |
| 文本 | TEXT | 长文本 |
| 整数 | INTEGER | 整数 |
| 小数 | DECIMAL(10,2) | 金额等精确数值 |
| 布尔 | BOOLEAN | 真/假 |
| 日期时间 | TIMESTAMP | 时间戳 |
| JSON | JSONB | JSON 数据 |

---

## 3. 数据库选型

### 3.1 PostgreSQL 选型理由

**优势：**
- 开源免费，社区活跃
- 支持丰富的数据类型（JSONB、数组等）
- 强大的查询优化器
- 完善的事务支持
- 优秀的扩展性
- 高可用性支持

**适用场景：**
- 复杂查询需求
- 数据完整性要求高
- 需要事务支持
- 需要扩展数据类型

### 3.2 Redis 选型理由

**优势：**
- 高性能读写
- 丰富的数据结构
- 持久化支持
- 主从复制
- 集群支持

**适用场景：**
- 会话存储
- 热点数据缓存
- 排行榜
- 消息队列
- 分布式锁

---

## 4. 核心数据库设计

### 4.1 用户相关表

#### 4.1.1 用户表 (users)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.email IS '用户邮箱';
COMMENT ON COLUMN users.phone IS '用户手机号';
COMMENT ON COLUMN users.password_hash IS '密码哈希';
COMMENT ON COLUMN users.role IS '用户角色：admin, manager, staff, user';
COMMENT ON COLUMN users.status IS '用户状态：active, inactive, suspended, deleted';
```

#### 4.1.2 用户会话表 (user_sessions)

```sql
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 注释
COMMENT ON TABLE user_sessions IS '用户会话表';
COMMENT ON COLUMN user_sessions.token IS '访问令牌';
COMMENT ON COLUMN user_sessions.refresh_token IS '刷新令牌';
COMMENT ON COLUMN user_sessions.device_info IS '设备信息';
```

### 4.2 商户相关表

#### 4.2.1 商户表 (merchants)

```sql
CREATE TABLE merchants (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    business_type VARCHAR(50) NOT NULL,
    business_hours JSONB,
    address VARCHAR(500),
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'China',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_merchants_user_id ON merchants(user_id);
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchants_verification_status ON merchants(verification_status);
CREATE INDEX idx_merchants_city ON merchants(city);
CREATE INDEX idx_merchants_rating ON merchants(rating);
CREATE INDEX idx_merchants_created_at ON merchants(created_at);

-- 注释
COMMENT ON TABLE merchants IS '商户表';
COMMENT ON COLUMN merchants.business_type IS '业务类型：restaurant, cafe, bar, etc.';
COMMENT ON COLUMN merchants.business_hours IS '营业时间 JSON';
COMMENT ON COLUMN merchants.status IS '状态：pending, active, inactive, suspended';
COMMENT ON COLUMN merchants.verification_status IS '认证状态：unverified, verified, rejected';
```

#### 4.2.2 商户设置表 (merchant_settings)

```sql
CREATE TABLE merchant_settings (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'CNY',
    language VARCHAR(10) DEFAULT 'zh-CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    tax_rate DECIMAL(5, 4) DEFAULT 0,
    service_fee_rate DECIMAL(5, 4) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    free_delivery_threshold DECIMAL(10, 2),
    notification_settings JSONB,
    payment_methods JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(merchant_id)
);

-- 注释
COMMENT ON TABLE merchant_settings IS '商户设置表';
COMMENT ON COLUMN merchant_settings.tax_rate IS '税率';
COMMENT ON COLUMN merchant_settings.service_fee_rate IS '服务费率';
```

### 4.3 商品相关表

#### 4.3.1 商品分类表 (product_categories)

```sql
CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES product_categories(id) ON DELETE CASCADE,
    icon_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_product_categories_merchant_id ON product_categories(merchant_id);
CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX idx_product_categories_sort_order ON product_categories(sort_order);

-- 注释
COMMENT ON TABLE product_categories IS '商品分类表';
```

#### 4.3.2 商品表 (products)

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES product_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    images JSONB,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'piece',
    stock_quantity INTEGER DEFAULT 0,
    min_stock_quantity INTEGER DEFAULT 0,
    max_stock_quantity INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    attributes JSONB,
    nutrition_info JSONB,
    allergen_info JSONB,
    preparation_time INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at);

-- 全文搜索索引
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('chinese', name));
CREATE INDEX idx_products_description_search ON products USING gin(to_tsvector('chinese', description));

-- 注释
COMMENT ON TABLE products IS '商品表';
COMMENT ON COLUMN products.attributes IS '商品属性 JSON';
COMMENT ON COLUMN products.nutrition_info IS '营养信息 JSON';
COMMENT ON COLUMN products.allergen_info IS '过敏原信息 JSON';
```

#### 4.3.3 商品规格表 (product_variants)

```sql
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- 注释
COMMENT ON TABLE product_variants IS '商品规格表';
```

### 4.4 订单相关表

#### 4.4.1 订单表 (orders)

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in',
    table_number VARCHAR(20),
    delivery_address JSONB,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    payment_time TIMESTAMP,
    notes TEXT,
    estimated_time TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_completed_at ON orders(completed_at);

-- 注释
COMMENT ON TABLE orders IS '订单表';
COMMENT ON COLUMN orders.status IS '订单状态：pending, confirmed, preparing, ready, completed, cancelled';
COMMENT ON COLUMN orders.order_type IS '订单类型：dine_in, takeout, delivery';
COMMENT ON COLUMN orders.payment_status IS '支付状态：unpaid, processing, paid, failed, refunded';
```

#### 4.4.2 订单明细表 (order_items)

```sql
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_variant_id BIGINT REFERENCES product_variants(id),
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 注释
COMMENT ON TABLE order_items IS '订单明细表';
```

#### 4.4.3 订单状态历史表 (order_status_history)

```sql
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);

-- 注释
COMMENT ON TABLE order_status_history IS '订单状态历史表';
```

### 4.5 支付相关表

#### 4.5.1 支付记录表 (payments)

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(200),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_time TIMESTAMP,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_time TIMESTAMP,
    gateway_response JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- 注释
COMMENT ON TABLE payments IS '支付记录表';
COMMENT ON COLUMN payments.status IS '支付状态：pending, processing, completed, failed, refunded';
```

### 4.6 库存相关表

#### 4.6.1 库存记录表 (inventory_logs)

```sql
CREATE TABLE inventory_logs (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_variant_id BIGINT REFERENCES product_variants(id),
    type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason VARCHAR(100),
    reference_type VARCHAR(50),
    reference_id BIGINT,
    operator_id BIGINT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_inventory_logs_merchant_id ON inventory_logs(merchant_id);
CREATE INDEX idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_type ON inventory_logs(type);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at);

-- 注释
COMMENT ON TABLE inventory_logs IS '库存记录表';
COMMENT ON COLUMN inventory_logs.type IS '类型：in, out, adjustment, transfer';
```

### 4.7 客户相关表

#### 4.7.1 客户表 (customers)

```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(500),
    city VARCHAR(100),
    birthday DATE,
    gender VARCHAR(10),
    level VARCHAR(20) DEFAULT 'normal',
    points INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    last_order_at TIMESTAMP,
    tags JSONB,
    preferences JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_level ON customers(level);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- 注释
COMMENT ON TABLE customers IS '客户表';
COMMENT ON COLUMN customers.level IS '客户等级：normal, vip, premium';
```

### 4.8 营销相关表

#### 4.8.1 优惠券表 (coupons)

```sql
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    applicable_products JSONB,
    applicable_categories JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_coupons_merchant_id ON coupons(merchant_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);

-- 注释
COMMENT ON TABLE coupons IS '优惠券表';
COMMENT ON COLUMN coupons.type IS '类型：public, private';
COMMENT ON COLUMN coupons.discount_type IS '折扣类型：percentage, fixed_amount';
```

#### 4.8.2 用户优惠券表 (user_coupons)

```sql
CREATE TABLE user_coupons (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'unused',
    used_at TIMESTAMP,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(coupon_id);
CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_customer_id ON user_coupons(customer_id);
CREATE INDEX idx_user_coupons_status ON user_coupons(status);
CREATE INDEX idx_user_coupons_expires_at ON user_coupons(expires_at);

-- 注释
COMMENT ON TABLE user_coupons IS '用户优惠券表';
COMMENT ON COLUMN user_coupons.status IS '状态：unused, used, expired';
```

---

## 5. 缓存设计

### 5.1 缓存策略

#### 5.1.1 缓存类型

| 缓存类型 | 用途 | 过期时间 |
|---------|------|---------|
| 会话缓存 | 用户会话数据 | 24 小时 |
| 热点数据 | 频繁访问的商品、商户 | 1 小时 |
| 查询缓存 | 复杂查询结果 | 30 分钟 |
| 计数器缓存 | 订单数、浏览数等 | 实时更新 |

#### 5.1.2 缓存键设计

```
# 会话缓存
session:{user_id}:{session_id}

# 商户缓存
merchant:{merchant_id}
merchant:products:{merchant_id}
merchant:categories:{merchant_id}

# 商品缓存
product:{product_id}
product:variants:{product_id}

# 用户缓存
user:{user_id}
user:profile:{user_id}

# 订单缓存
order:{order_id}
order:items:{order_id}
```

### 5.2 Redis 配置

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true
});

export default redis;
```

---

## 6. 数据迁移策略

### 6.1 迁移工具

使用 Prisma Migrate 进行数据库迁移：

```typescript
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        BigInt   @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 6.2 迁移流程

```bash
# 创建迁移
npx prisma migrate dev --name add_user_table

# 应用迁移
npx prisma migrate deploy

# 重置数据库（开发环境）
npx prisma migrate reset

# 生成客户端
npx prisma generate
```

### 6.3 迁移最佳实践

- 每次迁移前备份数据库
- 使用事务确保迁移原子性
- 在测试环境先验证迁移
- 准备回滚脚本
- 记录迁移历史

---

## 7. 备份与恢复

### 7.1 备份策略

#### 7.1.1 全量备份

```bash
# 每天凌晨 2 点进行全量备份
pg_dump -h localhost -U postgres -d yyc3_catering \
  -F c -f /backup/yyc3_catering_$(date +%Y%m%d).backup
```

#### 7.1.2 增量备份

```bash
# 每小时进行增量备份
pg_dump -h localhost -U postgres -d yyc3_catering \
  --format=directory --file=/backup/incremental/$(date +%Y%m%d_%H)
```

#### 7.1.3 备份保留策略

- 全量备份：保留 7 天
- 增量备份：保留 24 小时
- 归档备份：每月保留 1 份

### 7.2 恢复策略

#### 7.2.1 全量恢复

```bash
# 恢复全量备份
pg_restore -h localhost -U postgres -d yyc3_catering \
  /backup/yyc3_catering_20250130.backup
```

#### 7.2.2 时间点恢复

```bash
# 恢复到指定时间点
pg_restore -h localhost -U postgres -d yyc3_catering \
  --recovery-target-time="2025-01-30 10:00:00" \
  /backup/yyc3_catering_20250130.backup
```

---

## 8. 性能优化

### 8.1 索引优化

#### 8.1.1 创建索引

```sql
-- 单列索引
CREATE INDEX idx_users_email ON users(email);

-- 复合索引
CREATE INDEX idx_orders_merchant_status ON orders(merchant_id, status);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- 表达式索引
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
```

#### 8.1.2 索引维护

```sql
-- 分析索引使用情况
SELECT * FROM pg_stat_user_indexes;

-- 重建索引
REINDEX INDEX idx_users_email;

-- 清理表
VACUUM ANALYZE users;
```

### 8.2 查询优化

#### 8.2.1 查询计划分析

```sql
-- 查看查询计划
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE merchant_id = 1 AND status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
```

#### 8.2.2 查询优化技巧

- 使用索引字段进行过滤
- 避免 SELECT *
- 使用 LIMIT 限制结果集
- 避免在 WHERE 子句中使用函数
- 合理使用 JOIN

### 8.3 连接池配置

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // 最大连接数
  min: 5, // 最小连接数
  idleTimeoutMillis: 30000, // 空闲超时
  connectionTimeoutMillis: 2000, // 连接超时
  acquireTimeoutMillis: 10000, // 获取连接超时
});

export default pool;
```

---

## 9. 安全策略

### 9.1 访问控制

#### 9.1.1 用户权限

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE yyc3_catering TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 创建应用用户
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE yyc3_catering TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

#### 9.1.2 行级安全

```sql
-- 启用行级安全
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY merchant_isolation ON orders
  FOR ALL
  TO app_user
  USING (merchant_id = current_setting('app.merchant_id')::bigint);
```

### 9.2 数据加密

#### 9.2.1 传输加密

- 使用 SSL/TLS 加密数据库连接
- 配置强制 SSL 连接

```bash
# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

#### 9.2.2 存储加密

- 敏感字段使用 pgcrypto 加密
- 密码使用 bcrypt 哈希

```sql
-- 创建扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 加密数据
SELECT encrypt('sensitive data', 'encryption_key', 'aes');
```

### 9.3 审计日志

```sql
-- 创建审计日志表
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, table_name, record_id, new_data)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, old_data, new_data)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, old_data)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 10. 监控与维护

### 10.1 性能监控

#### 10.1.1 慢查询监控

```sql
-- 启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = '1000'; -- 1秒

-- 查看慢查询
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### 10.1.2 连接监控

```sql
-- 查看当前连接
SELECT * FROM pg_stat_activity;

-- 查看连接统计
SELECT state, COUNT(*)
FROM pg_stat_activity
GROUP BY state;
```

### 10.2 容量规划

#### 10.2.1 磁盘空间监控

```sql
-- 查看表大小
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### 10.2.2 数据增长预测

```sql
-- 查看数据增长趋势
SELECT
    date_trunc('day', created_at) AS day,
    COUNT(*) AS records
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

### 10.3 定期维护

#### 10.3.1 定期清理

```bash
# 每周执行 VACUUM
0 2 * * 0 psql -U postgres -d yyc3_catering -c "VACUUM ANALYZE;"

# 每月清理过期数据
0 3 1 * * psql -U postgres -d yyc3_catering -c "DELETE FROM user_sessions WHERE expires_at < NOW();"
```

#### 10.3.2 统计信息更新

```sql
-- 更新统计信息
ANALYZE;

-- 更新特定表统计信息
ANALYZE orders;
```

---

## 📄 文档标尾 (Footer)

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」




## 概述

### 架构概述

本架构文档详细描述了系统的整体架构设计，包括架构目标、设计原则、技术选型等关键信息。

#### 架构目标

- **高可用性**：确保系统稳定运行，故障自动恢复
- **高性能**：响应迅速，资源利用高效
- **高安全性**：数据加密，权限严格控制
- **高扩展性**：模块化设计，易于功能扩展
- **高可维护性**：代码清晰，文档完善

#### 设计原则

- **单一职责**：每个组件只负责一个功能
- **开闭原则**：对扩展开放，对修改关闭
- **依赖倒置**：依赖抽象而非具体实现
- **接口隔离**：使用细粒度的接口
- **迪米特法则**：最少知识原则



## 架构设计

### 架构设计

#### 整体架构

系统采用分层架构设计，包括：

- **表现层**：负责用户界面和交互
- **应用层**：处理业务逻辑
- **业务层**：实现核心业务功能
- **数据层**：管理数据存储和访问
- **基础设施层**：提供基础服务支持

#### 模块划分

系统划分为多个独立模块，每个模块负责特定功能：

- **用户模块**：用户管理和认证
- **订单模块**：订单处理和管理
- **支付模块**：支付集成和处理
- **通知模块**：消息通知和推送
- **报表模块**：数据统计和分析

#### 技术选型

- **前端框架**：React / Vue
- **后端框架**：Node.js / Express / Fastify
- **数据库**：PostgreSQL / MongoDB
- **缓存**：Redis
- **消息队列**：RabbitMQ / Kafka



## 技术实现

### 技术实现

#### 核心技术栈

```typescript
// 核心依赖
{
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "express": "^4.18.0",
    "prisma": "^5.0.0",
    "redis": "^4.6.0"
  }
}
```

#### 关键实现

1. **服务层实现**
```typescript
class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // 验证输入
    this.validateUserData(data);
    
    // 加密密码
    const hashedPassword = await this.hashPassword(data.password);
    
    // 创建用户
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });
    
    return user;
  }
}
```

2. **中间件实现**
```typescript
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '令牌无效' });
  }
};
```



## 部署方案

### 部署方案

#### 部署架构

采用容器化部署方案，使用Docker和Kubernetes进行编排。

#### 部署步骤

1. **环境准备**
```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 安装Kubernetes
# 根据操作系统选择相应的安装方式
```

2. **构建镜像**
```bash
# 构建应用镜像
docker build -t yyc3-app:latest .

# 推送到镜像仓库
docker push registry.example.com/yyc3-app:latest
```

3. **部署到Kubernetes**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyc3-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yyc3-app
  template:
    metadata:
      labels:
        app: yyc3-app
    spec:
      containers:
      - name: app
        image: registry.example.com/yyc3-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

4. **配置服务**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: yyc3-app-service
spec:
  selector:
    app: yyc3-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```



## 性能优化

### 性能优化

#### 前端优化

1. **代码分割**
```typescript
// 路由级别代码分割
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

2. **缓存策略**
```typescript
// React.memo 避免不必要的重渲染
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.value}</div>;
});

// useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

#### 后端优化

1. **数据库优化**
```typescript
// 使用索引
CREATE INDEX idx_user_email ON users(email);

// 查询优化
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  },
  where: {
    active: true
  },
  take: 100
});
```

2. **缓存策略**
```typescript
// Redis缓存
async function getUser(id: string): Promise<User> {
  const cacheKey = `user:${id}`;
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 从数据库获取
  const user = await prisma.user.findUnique({ where: { id } });
  
  // 写入缓存
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
}
```



## 安全考虑

### 安全考虑

#### 认证与授权

1. **JWT认证**
```typescript
// 生成JWT令牌
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// 验证JWT令牌
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

2. **RBAC授权**
```typescript
// 角色权限检查
function checkPermission(user: User, resource: string, action: string): boolean {
  const permissions = rolePermissions[user.role];
  return permissions.some(p => 
    p.resource === resource && p.actions.includes(action)
  );
}
```

#### 数据保护

1. **输入验证**
```typescript
// 使用Zod进行输入验证
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/),
  name: z.string().min(2)
});

const validated = createUserSchema.parse(input);
```

2. **数据加密**
```typescript
// 使用bcrypt加密密码
const hashedPassword = await bcrypt.hash(password, 10);

// 验证密码
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### 安全头配置

```typescript
// Express安全头配置
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```



## 监控告警

### 监控告警

#### 监控指标

1. **系统指标**
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络I/O

2. **应用指标**
- 请求量(RPS)
- 响应时间
- 错误率
- 并发用户数

3. **业务指标**
- 用户注册数
- 订单创建数
- 支付成功率
- 用户活跃度

#### 监控工具

```typescript
// Prometheus指标收集
import { Counter, Histogram, Gauge } from 'prom-client';

const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const responseTime = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route']
});

// 使用中间件记录指标
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
    responseTime.observe({
      method: req.method,
      route: req.route?.path || req.path
    }, duration);
  });
  
  next();
});
```

#### 告警规则

```yaml
groups:
- name: api_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "API错误率过高"
      description: "5分钟内错误率超过5%"
  
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API响应时间过长"
      description: "95%分位响应时间超过1秒"
```



## 最佳实践

### 最佳实践

#### 代码规范

1. **命名规范**
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 类：PascalCase
class UserService { }

// 接口：PascalCase，前缀I（可选）
interface IUserService { }
```

2. **注释规范**
```typescript
/**
 * 创建用户
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {Error} 当邮箱已存在时抛出错误
 */
async function createUser(
  email: string, 
  password: string
): Promise<User> {
  // 实现
}
```

#### 错误处理

```typescript
// 统一错误处理
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // 记录未预期的错误
  logger.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});
```

#### 日志记录

```typescript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用日志
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```


## 相关文档

- [🔖 YYC³ 数据架构详细设计文档](YYC3-Cater-架构设计/架构类/04-YYC3-Cater--架构类-数据架构详细设计文档.md) - YYC3-Cater-架构设计/架构类
- [YYC3 初现系统色](YYC3-Cater-架构设计/架构类/16-YYC3-Cater--架构类-系统色设计规范.md) - YYC3-Cater-架构设计/架构类
- [🔖 YYC³ 监控架构设计文档](YYC3-Cater-架构设计/架构类/09-YYC3-Cater--架构类-监控架构设计文档.md) - YYC3-Cater-架构设计/架构类
- [🔖 YYC³ 部署架构设计文档](YYC3-Cater-架构设计/架构类/07-YYC3-Cater--架构类-部署架构设计文档.md) - YYC3-Cater-架构设计/架构类
- [🔖 YYC³ 智能架构设计文档](YYC3-Cater-架构设计/架构类/08-YYC3-Cater--架构类-智能架构设计文档.md) - YYC3-Cater-架构设计/架构类
