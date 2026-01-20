---
@file: 024-YYC3-AICP-架构设计-数据库设计文档.md
@description: YYC3-AICP 数据库表结构、关系、索引、分库分表的详细设计，保障数据存储规范
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [架构设计],[数据库],[表结构设计]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 024-YYC3-AICP-架构设计-数据库设计文档

## 概述

本文档详细描述YYC3-AICP餐饮管理平台的数据库设计方案,包括表结构设计、关系设计、索引设计、分库分表策略等内容,确保数据存储的规范性、高性能和可扩展性。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC3-AICP餐饮管理平台是一个基于「五高五标五化」理念的智能化餐饮管理系统,为餐饮企业提供从菜单管理、订单处理、库存管理到财务分析的全流程数字化解决方案。

#### 1.2 文档目标
- 规范数据库表结构设计,确保数据一致性
- 优化索引设计,提升查询性能
- 设计合理的分库分表策略,支持数据量增长
- 建立数据关系模型,确保数据完整性
- 提供数据库迁移和版本管理方案

### 2. 设计原则

#### 2.1 五高原则
- **高可用性**: 数据库集群部署,主从复制,故障自动切换
- **高性能**: 合理索引设计,查询优化,读写分离
- **高安全性**: 数据加密,访问控制,审计日志
- **高扩展性**: 分库分表,水平扩展,垂直扩展
- **高可维护性**: 标准化命名,版本管理,监控告警

#### 2.2 五标体系
- **标准化**: 统一的表命名规范、字段命名规范
- **规范化**: 遵循数据库范式,减少数据冗余
- **自动化**: 自动化迁移脚本,自动化备份恢复
- **智能化**: 智能索引推荐,智能查询优化
- **可视化**: 数据库监控可视化,性能分析可视化

#### 2.3 五化架构
- **流程化**: 数据库变更流程化,审批流程化
- **文档化**: 完善的数据库文档,变更记录文档化
- **工具化**: 数据库管理工具,迁移工具化
- **数字化**: 数据字典数字化,元数据管理数字化
- **生态化**: 与监控、日志、告警系统集成

### 3. 数据库设计

#### 3.1 数据库架构

##### 3.1.1 数据库选型

| 数据库类型 | 版本 | 用途 | 特点 |
|-----------|------|------|------|
| PostgreSQL | 15.0 | 主数据库 | ACID事务,JSON支持,全文搜索 |
| Redis | 7.2.0 | 缓存数据库 | 高性能,内存存储,数据结构丰富 |
| MinIO | RELEASE.2023 | 对象存储 | 分布式,兼容S3,高性能 |
| Elasticsearch | 8.11.0 | 搜索引擎 | 全文搜索,聚合分析,实时性 |

##### 3.1.2 数据库部署架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用层 (Application Layer)                │
│                    (NestJS Services)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────────────────────────────────┐
                │                      数据访问层 (Data Access Layer)       │
                │                    (Prisma ORM)                          │
                └─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┬───────────────┐
              ▼               ▼               ▼               ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │  PostgreSQL   │ │     Redis     │ │    MinIO      │ │Elasticsearch  │
    │   主从复制    │ │   主从复制    │ │   分布式存储  │ │   集群部署    │
    │   读写分离    │ │   集群部署    │ │               │ │               │
    └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

#### 3.2 表结构设计

##### 3.2.1 用户相关表

###### users (用户表)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'locked')),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

###### user_profiles (用户档案表)

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  real_name VARCHAR(50),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  address VARCHAR(200),
  city VARCHAR(50),
  province VARCHAR(50),
  country VARCHAR(50) DEFAULT 'China',
  id_card VARCHAR(18),
  preferences JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

##### 3.2.2 角色权限表

###### roles (角色表)

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_code ON roles(code);
CREATE INDEX idx_roles_status ON roles(status);
```

###### permissions (权限表)

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_permissions_resource ON permissions(resource);
```

###### role_permissions (角色权限关联表)

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
```

###### user_roles (用户角色关联表)

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
```

##### 3.2.3 菜单相关表

###### categories (菜品分类表)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_code ON categories(code);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);
```

###### menus (菜单表)

```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10, 2) CHECK (original_price >= 0),
  cost_price DECIMAL(10, 2) CHECK (cost_price >= 0),
  unit VARCHAR(20) DEFAULT '份',
  specifications JSONB,
  tags TEXT[],
  nutrition_info JSONB,
  allergens TEXT[],
  preparation_time INTEGER,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menus_category_id ON menus(category_id);
CREATE INDEX idx_menus_code ON menus(code);
CREATE INDEX idx_menus_status ON menus(status);
CREATE INDEX idx_menus_price ON menus(price);
CREATE INDEX idx_menus_tags ON menus USING GIN(tags);
```

###### menu_reviews (菜单评价表)

```sql
CREATE TABLE menu_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  reply TEXT,
  replied_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_reviews_menu_id ON menu_reviews(menu_id);
CREATE INDEX idx_menu_reviews_user_id ON menu_reviews(user_id);
CREATE INDEX idx_menu_reviews_order_id ON menu_reviews(order_id);
CREATE INDEX idx_menu_reviews_rating ON menu_reviews(rating);
CREATE INDEX idx_menu_reviews_status ON menu_reviews(status);
CREATE INDEX idx_menu_reviews_created_at ON menu_reviews(created_at DESC);
```

##### 3.2.4 订单相关表

###### orders (订单表)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  actual_amount DECIMAL(10, 2) NOT NULL CHECK (actual_amount >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'serving', 'completed', 'cancelled', 'refunded')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paying', 'paid', 'refunded', 'partial_refunded')),
  payment_method VARCHAR(20),
  payment_time TIMESTAMP,
  remark TEXT,
  delivery_address JSONB,
  delivery_time TIMESTAMP,
  estimated_time INTEGER,
  actual_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at DESC);
```

###### order_items (订单明细表)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
  menu_name VARCHAR(100) NOT NULL,
  menu_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  specifications JSONB,
  remark TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_id ON order_items(menu_id);
CREATE INDEX idx_order_items_status ON order_items(status);
```

##### 3.2.5 库存相关表

###### inventory (库存表)

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID UNIQUE NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit VARCHAR(20) DEFAULT '份',
  min_stock INTEGER DEFAULT 10 CHECK (min_stock >= 0),
  max_stock INTEGER DEFAULT 1000 CHECK (max_stock >= 0),
  warning_stock INTEGER DEFAULT 20 CHECK (warning_stock >= 0),
  status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'low', 'out_of_stock')),
  last_restocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_menu_id ON inventory(menu_id);
CREATE INDEX idx_inventory_status ON inventory(status);
```

###### inventory_logs (库存变动日志表)

```sql
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('in', 'out', 'adjust', 'loss')),
  quantity INTEGER NOT NULL,
  before_quantity INTEGER NOT NULL,
  after_quantity INTEGER NOT NULL,
  reason VARCHAR(100),
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_logs_inventory_id ON inventory_logs(inventory_id);
CREATE INDEX idx_inventory_logs_menu_id ON inventory_logs(menu_id);
CREATE INDEX idx_inventory_logs_change_type ON inventory_logs(change_type);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at DESC);
```

##### 3.2.6 财务相关表

###### transactions (交易记录表)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_no VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'partial_refund')),
  payment_method VARCHAR(20) NOT NULL,
  payment_channel VARCHAR(50),
  transaction_status VARCHAR(20) DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'success', 'failed', 'cancelled')),
  third_party_transaction_no VARCHAR(100),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_transaction_no ON transactions(transaction_no);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

###### refunds (退款记录表)

```sql
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_no VARCHAR(50) UNIQUE NOT NULL,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  refund_reason TEXT,
  refund_status VARCHAR(20) DEFAULT 'pending' CHECK (refund_status IN ('pending', 'processing', 'success', 'failed', 'cancelled')),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refunds_refund_no ON refunds(refund_no);
CREATE INDEX idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_user_id ON refunds(user_id);
CREATE INDEX idx_refunds_status ON refunds(refund_status);
CREATE INDEX idx_refunds_created_at ON refunds(created_at DESC);
```

##### 3.2.7 营销相关表

###### coupons (优惠券表)

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  coupon_type VARCHAR(20) NOT NULL CHECK (coupon_type IN ('fixed', 'percentage', 'free_delivery')),
  value DECIMAL(10, 2) NOT NULL CHECK (value >= 0),
  min_amount DECIMAL(10, 2) DEFAULT 0 CHECK (min_amount >= 0),
  max_discount DECIMAL(10, 2) CHECK (max_discount >= 0),
  total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
  used_quantity INTEGER DEFAULT 0 CHECK (used_quantity >= 0),
  per_user_limit INTEGER DEFAULT 1 CHECK (per_user_limit > 0),
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  applicable_menus TEXT[],
  applicable_categories TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_valid_period ON coupons(valid_from, valid_until);
```

###### user_coupons (用户优惠券表)

```sql
CREATE TABLE user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired')),
  used_at TIMESTAMP,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, coupon_id, created_at)
);

CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(coupon_id);
CREATE INDEX idx_user_coupons_status ON user_coupons(status);
CREATE INDEX idx_user_coupons_valid_period ON user_coupons(valid_from, valid_until);
```

##### 3.2.8 桌台相关表

###### tables (桌台表)

```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_no VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  area VARCHAR(50),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  table_type VARCHAR(20) CHECK (table_type IN ('standard', 'vip', 'private_room', 'outdoor')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  qr_code_url VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tables_table_no ON tables(table_no);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_area ON tables(area);
```

###### table_reservations (桌台预订表)

```sql
CREATE TABLE table_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reservation_no VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(50) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  reservation_time TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 120,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_table_reservations_table_id ON table_reservations(table_id);
CREATE INDEX idx_table_reservations_user_id ON table_reservations(user_id);
CREATE INDEX idx_table_reservations_reservation_no ON table_reservations(reservation_no);
CREATE INDEX idx_table_reservations_reservation_time ON table_reservations(reservation_time);
CREATE INDEX idx_table_reservations_status ON table_reservations(status);
```

##### 3.2.9 报表相关表

###### daily_reports (日报表)

```sql
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE UNIQUE NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_customers INTEGER NOT NULL DEFAULT 0,
  average_order_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_refunds INTEGER NOT NULL DEFAULT 0,
  total_refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  peak_hour INTEGER,
  peak_hour_orders INTEGER,
  top_menu_id UUID,
  top_menu_quantity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_reports_report_date ON daily_reports(report_date DESC);
```

##### 3.2.10 系统配置表

###### system_configs (系统配置表)

```sql
CREATE TABLE system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_configs_config_key ON system_configs(config_key);
```

###### audit_logs (审计日志表)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

#### 3.3 分库分表设计

##### 3.3.1 分库分表策略

###### 分库策略

- **按业务域分库**: 将不同业务域的数据分散到不同的数据库实例
  - 用户库: users, user_profiles, roles, permissions, role_permissions, user_roles
  - 业务库: menus, categories, orders, order_items, tables, table_reservations
  - 库存库: inventory, inventory_logs
  - 财务库: transactions, refunds
  - 营销库: coupons, user_coupons
  - 报表库: daily_reports
  - 系统库: system_configs, audit_logs

###### 分表策略

- **订单表按时间分表**: 按月分表,orders_202601, orders_202602, ...
- **订单明细表按时间分表**: order_items_202601, order_items_202602, ...
- **库存日志表按时间分表**: inventory_logs_202601, inventory_logs_202602, ...
- **审计日志表按时间分表**: audit_logs_202601, audit_logs_202602, ...

##### 3.3.2 分表实现

```sql
-- 创建订单表分表函数
CREATE OR REPLACE FUNCTION create_order_partition_table()
RETURNS void AS $$
DECLARE
    start_date DATE := '2026-01-01';
    end_date DATE := '2026-12-31';
    current_date DATE;
    table_name TEXT;
BEGIN
    current_date := start_date;
    WHILE current_date <= end_date LOOP
        table_name := 'orders_' || to_char(current_date, 'YYYYMM');
        
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS %I (
                LIKE orders INCLUDING ALL
            ) INHERITS (orders)',
            table_name
        );
        
        EXECUTE format('
            CREATE INDEX IF NOT EXISTS idx_%s_user_id ON %I(user_id)',
            table_name, table_name
        );
        
        EXECUTE format('
            CREATE INDEX IF NOT EXISTS idx_%s_status ON %I(status)',
            table_name, table_name
        );
        
        EXECUTE format('
            CREATE INDEX IF NOT EXISTS idx_%s_created_at ON %I(created_at DESC)',
            table_name, table_name
        );
        
        current_date := current_date + INTERVAL '1 month';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 执行分表创建
SELECT create_order_partition_table();
```

#### 3.4 数据库索引优化

##### 3.4.1 索引设计原则

- **为WHERE子句创建索引**: 为经常用于查询条件的字段创建索引
- **为JOIN操作创建索引**: 为外键字段创建索引
- **为排序操作创建索引**: 为经常用于ORDER BY的字段创建索引
- **避免过度索引**: 索引会占用存储空间并影响写入性能
- **使用复合索引**: 为经常一起查询的多个字段创建复合索引
- **使用部分索引**: 为特定条件的数据创建索引,减少索引大小

##### 3.4.2 索引优化示例

```sql
-- 复合索引优化
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at DESC);

-- 部分索引优化
CREATE INDEX idx_active_menus ON menus(id) WHERE status = 'active';

-- 表达式索引
CREATE INDEX idx_menus_price_discount ON menus((price - original_price)) WHERE original_price > 0;

-- 全文搜索索引
CREATE INDEX idx_menus_name_search ON menus USING GIN(to_tsvector('chinese', name));
CREATE INDEX idx_menus_description_search ON menus USING GIN(to_tsvector('chinese', description));
```

#### 3.5 数据库视图设计

##### 3.5.1 订单汇总视图

```sql
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.order_no,
    o.user_id,
    u.username,
    u.phone,
    o.table_id,
    t.table_no,
    t.name AS table_name,
    o.order_type,
    o.total_amount,
    o.discount_amount,
    o.actual_amount,
    o.status,
    o.payment_status,
    o.payment_method,
    o.payment_time,
    o.remark,
    o.delivery_address,
    o.delivery_time,
    o.created_at,
    o.updated_at,
    COUNT(oi.id) AS item_count,
    STRING_AGG(oi.menu_name || ' x' || oi.quantity, ', ') AS items_summary
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.username, u.phone, t.table_no, t.name;
```

##### 3.5.2 库存预警视图

```sql
CREATE OR REPLACE VIEW inventory_warning AS
SELECT 
    i.id,
    i.menu_id,
    m.name AS menu_name,
    m.category_id,
    c.name AS category_name,
    i.quantity,
    i.unit,
    i.min_stock,
    i.max_stock,
    i.warning_stock,
    i.status,
    CASE 
        WHEN i.quantity = 0 THEN '缺货'
        WHEN i.quantity < i.min_stock THEN '库存不足'
        WHEN i.quantity < i.warning_stock THEN '库存预警'
        ELSE '正常'
    END AS warning_level,
    i.last_restocked_at
FROM inventory i
JOIN menus m ON i.menu_id = m.id
JOIN categories c ON m.category_id = c.id
WHERE i.status != 'normal'
ORDER BY i.quantity ASC;
```

#### 3.6 数据库触发器设计

##### 3.6.1 库存自动更新触发器

```sql
-- 创建库存自动更新函数
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 订单创建时扣减库存
        UPDATE inventory 
        SET quantity = quantity - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE menu_id = NEW.menu_id;
        
        -- 插入库存变动日志
        INSERT INTO inventory_logs (
            inventory_id,
            menu_id,
            change_type,
            quantity,
            before_quantity,
            after_quantity,
            reason,
            order_id
        )
        SELECT 
            i.id,
            i.menu_id,
            'out',
            NEW.quantity,
            i.quantity + NEW.quantity,
            i.quantity,
            '订单扣减',
            NEW.order_id
        FROM inventory i
        WHERE i.menu_id = NEW.menu_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 订单取消时恢复库存
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            UPDATE inventory 
            SET quantity = quantity + NEW.quantity,
                updated_at = CURRENT_TIMESTAMP
            WHERE menu_id = NEW.menu_id;
            
            INSERT INTO inventory_logs (
                inventory_id,
                menu_id,
                change_type,
                quantity,
                before_quantity,
                after_quantity,
                reason,
                order_id
            )
            SELECT 
                i.id,
                i.menu_id,
                'in',
                NEW.quantity,
                i.quantity - NEW.quantity,
                i.quantity,
                '订单取消恢复',
                NEW.order_id
            FROM inventory i
            WHERE i.menu_id = NEW.menu_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_inventory_on_order_items
AFTER INSERT OR UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_order();
```

##### 3.6.2 更新时间自动更新触发器

```sql
-- 创建更新时间自动更新函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表创建触发器
CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_menus_updated_at
BEFORE UPDATE ON menus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 3.7 数据库存储过程设计

##### 3.7.1 生成订单号存储过程

```sql
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS VARCHAR AS $$
DECLARE
    order_no VARCHAR(50);
    date_prefix VARCHAR(8);
    sequence_num INTEGER;
BEGIN
    date_prefix := to_char(CURRENT_TIMESTAMP, 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_no, 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE order_no LIKE date_prefix || '%';
    
    order_no := date_prefix || LPAD(sequence_num::TEXT, 8, '0');
    
    RETURN order_no;
END;
$$ LANGUAGE plpgsql;
```

##### 3.7.2 订单统计存储过程

```sql
CREATE OR REPLACE FUNCTION calculate_daily_statistics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    total_orders INTEGER;
    total_amount DECIMAL(10, 2);
    total_customers INTEGER;
    average_order_value DECIMAL(10, 2);
    total_refunds INTEGER;
    total_refund_amount DECIMAL(10, 2);
    peak_hour INTEGER;
    peak_hour_orders INTEGER;
    top_menu_id UUID;
    top_menu_quantity INTEGER;
BEGIN
    -- 计算订单总数
    SELECT COUNT(*)
    INTO total_orders
    FROM orders
    WHERE DATE(created_at) = target_date
    AND status != 'cancelled';
    
    -- 计算总金额
    SELECT COALESCE(SUM(actual_amount), 0)
    INTO total_amount
    FROM orders
    WHERE DATE(created_at) = target_date
    AND status != 'cancelled';
    
    -- 计算客户总数
    SELECT COUNT(DISTINCT user_id)
    INTO total_customers
    FROM orders
    WHERE DATE(created_at) = target_date
    AND status != 'cancelled';
    
    -- 计算平均订单价值
    average_order_value := CASE 
        WHEN total_orders > 0 THEN total_amount / total_orders
        ELSE 0
    END;
    
    -- 计算退款统计
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO total_refunds, total_refund_amount
    FROM refunds
    WHERE DATE(created_at) = target_date
    AND refund_status = 'success';
    
    -- 计算高峰时段
    SELECT EXTRACT(HOUR FROM created_at), COUNT(*)
    INTO peak_hour, peak_hour_orders
    FROM orders
    WHERE DATE(created_at) = target_date
    AND status != 'cancelled'
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- 计算热门菜品
    SELECT menu_id, SUM(quantity)
    INTO top_menu_id, top_menu_quantity
    FROM order_items
    WHERE order_id IN (
        SELECT id FROM orders WHERE DATE(created_at) = target_date
    )
    GROUP BY menu_id
    ORDER BY SUM(quantity) DESC
    LIMIT 1;
    
    -- 插入或更新日报表
    INSERT INTO daily_reports (
        report_date,
        total_orders,
        total_amount,
        total_customers,
        average_order_value,
        total_refunds,
        total_refund_amount,
        peak_hour,
        peak_hour_orders,
        top_menu_id,
        top_menu_quantity
    ) VALUES (
        target_date,
        total_orders,
        total_amount,
        total_customers,
        average_order_value,
        total_refunds,
        total_refund_amount,
        peak_hour,
        peak_hour_orders,
        top_menu_id,
        top_menu_quantity
    )
    ON CONFLICT (report_date)
    DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_amount = EXCLUDED.total_amount,
        total_customers = EXCLUDED.total_customers,
        average_order_value = EXCLUDED.average_order_value,
        total_refunds = EXCLUDED.total_refunds,
        total_refund_amount = EXCLUDED.total_refund_amount,
        peak_hour = EXCLUDED.peak_hour,
        peak_hour_orders = EXCLUDED.peak_hour_orders,
        top_menu_id = EXCLUDED.top_menu_id,
        top_menu_quantity = EXCLUDED.top_menu_quantity,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

#### 3.8 数据库备份与恢复

##### 3.8.1 备份策略

- **全量备份**: 每天凌晨2点进行全量备份
- **增量备份**: 每小时进行增量备份
- **日志备份**: 实时备份WAL日志
- **异地备份**: 每天将备份文件同步到异地存储

##### 3.8.2 备份脚本

```bash
#!/bin/bash
# PostgreSQL备份脚本

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/data/backup/postgresql"
DB_NAME="yyc3_catering"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 全量备份
pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} \
    -F c -f ${BACKUP_DIR}/full_backup_${DATE}.dump

# 压缩备份文件
gzip ${BACKUP_DIR}/full_backup_${DATE}.dump

# 删除7天前的备份
find ${BACKUP_DIR} -name "full_backup_*.dump.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_DIR}/full_backup_${DATE}.dump.gz"
```

##### 3.8.3 恢复脚本

```bash
#!/bin/bash
# PostgreSQL恢复脚本

BACKUP_FILE=$1
DB_NAME="yyc3_catering"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

if [ -z "${BACKUP_FILE}" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# 解压备份文件
gunzip ${BACKUP_FILE}

# 恢复数据库
pg_restore -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} \
    -c -v ${BACKUP_FILE%.gz}

echo "Restore completed from: ${BACKUP_FILE}"
```

#### 3.9 数据库监控与优化

##### 3.9.1 性能监控指标

- **连接数监控**: 监控数据库连接数,避免连接泄漏
- **查询性能监控**: 监控慢查询,优化SQL语句
- **锁等待监控**: 监控锁等待时间,避免死锁
- **缓存命中率监控**: 监控缓存命中率,优化缓存策略
- **磁盘I/O监控**: 监控磁盘读写性能,优化存储配置

##### 3.9.2 慢查询优化

```sql
-- 启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- 查看慢查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 分析查询执行计划
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20;
```

#### 3.10 数据库安全设计

##### 3.10.1 访问控制

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE yyc3_catering TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 创建读写用户
CREATE USER readwrite_user WITH PASSWORD 'readwrite_password';
GRANT CONNECT ON DATABASE yyc3_catering TO readwrite_user;
GRANT USAGE ON SCHEMA public TO readwrite_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO readwrite_user;
```

##### 3.10.2 数据加密

- **传输加密**: 使用SSL/TLS加密数据库连接
- **存储加密**: 使用文件系统加密或数据库透明加密
- **字段加密**: 敏感字段使用AES加密存储

```sql
-- 创建加密函数
CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, key::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 创建解密函数
CREATE OR REPLACE FUNCTION decrypt_data(encrypted_data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'hex'), key::bytea, 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql;
```

### 4. 数据库迁移与版本管理

#### 4.1 迁移工具

使用Prisma作为ORM和迁移工具,提供类型安全的数据库访问和自动迁移功能。

#### 4.2 迁移流程

1. **创建迁移文件**: 使用Prisma CLI创建迁移文件
2. **编写迁移SQL**: 在迁移文件中编写数据库变更SQL
3. **测试迁移**: 在测试环境验证迁移脚本
4. **执行迁移**: 在生产环境执行迁移
5. **验证结果**: 验证迁移结果,确保数据完整性

#### 4.3 迁移示例

```typescript
// prisma/migrations/20260104_add_menu_specifications/migration.sql

-- 添加菜单规格字段
ALTER TABLE menus ADD COLUMN specifications JSONB;

-- 更新现有数据
UPDATE menus SET specifications = '{}'::jsonb WHERE specifications IS NULL;

-- 添加索引
CREATE INDEX idx_menus_specifications ON menus USING GIN(specifications);
```

### 5. 总结

本文档详细描述了YYC3-AICP餐饮管理平台的数据库设计方案,包括:

- 数据库架构设计,包括数据库选型和部署架构
- 完整的表结构设计,涵盖用户、角色权限、菜单、订单、库存、财务、营销、桌台、报表、系统配置等所有业务域
- 分库分表策略,支持数据量增长和性能优化
- 索引优化设计,提升查询性能
- 视图和触发器设计,简化复杂查询和自动化业务逻辑
- 存储过程设计,封装复杂业务逻辑
- 备份与恢复策略,保障数据安全
- 监控与优化方案,确保数据库性能
- 安全设计,保护敏感数据
- 迁移与版本管理,支持数据库演进

通过遵循本文档的设计规范,可以确保数据库的规范性、高性能、可扩展性和安全性,为YYC3-AICP餐饮管理平台提供坚实的数据存储基础。

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
