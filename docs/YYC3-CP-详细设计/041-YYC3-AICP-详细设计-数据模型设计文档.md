---
@file: 041-YYC3-AICP-详细设计-数据模型设计文档.md
@description: YYC3-AICP 业务数据模型的详细定义，包含实体、属性、关系与约束规则
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [详细设计],[数据模型],[业务实体]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 041-YYC3-AICP-详细设计-数据模型设计文档

## 概述

本文档详细描述YYC3-YYC3-AICP-详细设计-数据模型设计文档相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范数据模型设计文档相关的业务标准与技术落地要求
- 为项目相关人员提供清晰的参考依据
- 保障相关模块开发、实施、运维的一致性与规范性

### 2. 设计原则

#### 2.1 五高原则
- **高可用性**：确保系统7x24小时稳定运行
- **高性能**：优化响应时间和处理能力
- **高安全性**：保护用户数据和隐私安全
- **高扩展性**：支持业务快速扩展
- **高可维护性**：便于后续维护和升级

#### 2.2 五标体系
- **标准化**：统一的技术和流程标准
- **规范化**：严格的开发和管理规范
- **自动化**：提高开发效率和质量
- **智能化**：利用AI技术提升能力
- **可视化**：直观的监控和管理界面

#### 2.3 五化架构
- **流程化**：标准化的开发流程
- **文档化**：完善的文档体系
- **工具化**：高效的开发工具链
- **数字化**：数据驱动的决策
- **生态化**：开放的生态系统

### 3. 数据模型设计文档

#### 3.1 客户管理基础数据模型

##### 3.1.1 客户表 (customers)

```sql
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    birthday DATE,
    avatar VARCHAR(255),
    member_level_id VARCHAR(36),
    points INT NOT NULL DEFAULT 0,
    total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_orders INT NOT NULL DEFAULT 0,
    last_visit_at TIMESTAMP,
    last_order_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    source VARCHAR(50),
    register_ip VARCHAR(50),
    register_device VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_member_level (member_level_id),
    INDEX idx_created_at (created_at),
    INDEX idx_last_visit_at (last_visit_at)
);
```

**字段说明**：
- `id`: 主键，UUID
- `name`: 客户姓名
- `phone`: 手机号，唯一
- `email`: 邮箱地址
- `gender`: 性别
- `birthday`: 生日
- `avatar`: 头像URL
- `member_level_id`: 会员等级ID
- `points`: 积分
- `total_spent`: 累计消费金额
- `total_orders`: 累计订单数
- `last_visit_at`: 最后访问时间
- `last_order_at`: 最后下单时间
- `status`: 状态
- `source`: 注册来源
- `register_ip`: 注册IP
- `register_device`: 注册设备
- `metadata`: 元数据，JSON格式

##### 3.1.2 客户分群表 (customer_groups)

```sql
CREATE TABLE customer_groups (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    group_type VARCHAR(50) NOT NULL CHECK (group_type IN ('manual', 'auto', 'rfm', 'lifecycle')),
    conditions JSONB,
    color VARCHAR(20) DEFAULT '#409EFF',
    icon VARCHAR(50),
    priority INT NOT NULL DEFAULT 0,
    member_count INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_group_type (group_type),
    INDEX idx_enabled (enabled),
    INDEX idx_priority (priority)
);
```

**字段说明**：
- `id`: 主键，UUID
- `name`: 分群名称
- `description`: 分群描述
- `group_type`: 分群类型
- `conditions`: 分群条件，JSON格式
- `color`: 显示颜色
- `icon`: 显示图标
- `priority`: 优先级
- `member_count`: 成员数量
- `enabled`: 是否启用
- `created_by`: 创建人ID
- `created_at`: 创建时间
- `updated_at`: 更新时间

##### 3.1.3 客户分群成员表 (customer_group_members)

```sql
CREATE TABLE customer_group_members (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    added_by VARCHAR(36),
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255),
    FOREIGN KEY (group_id) REFERENCES customer_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_group_customer (group_id, customer_id),
    INDEX idx_group_id (group_id),
    INDEX idx_customer_id (customer_id)
);
```

**字段说明**：
- `id`: 主键，UUID
- `group_id`: 分群ID
- `customer_id`: 客户ID
- `added_by`: 添加人ID
- `added_at`: 添加时间
- `reason`: 添加原因

##### 3.1.4 客户标签表 (customer_tags)

```sql
CREATE TABLE customer_tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#67C23A',
    tag_type VARCHAR(50) NOT NULL CHECK (tag_type IN ('behavior', 'preference', 'custom', 'system')),
    usage_count INT NOT NULL DEFAULT 0,
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag_type (tag_type),
    INDEX idx_usage_count (usage_count)
);
```

**字段说明**：
- `id`: 主键，UUID
- `name`: 标签名称
- `description`: 标签描述
- `color`: 显示颜色
- `tag_type`: 标签类型
- `usage_count`: 使用次数
- `created_by`: 创建人ID
- `created_at`: 创建时间
- `updated_at`: 更新时间

##### 3.1.5 客户标签关联表 (customer_tag_relations)

```sql
CREATE TABLE customer_tag_relations (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    tagged_by VARCHAR(36),
    tagged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES customer_tags(id) ON DELETE CASCADE,
    UNIQUE KEY uk_customer_tag (customer_id, tag_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_tag_id (tag_id)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID
- `tag_id`: 标签ID
- `tagged_by`: 标记人ID
- `tagged_at`: 标记时间
- `reason`: 标记原因

##### 3.1.6 客户状态历史表 (customer_status_history)

```sql
CREATE TABLE customer_status_history (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(36),
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_new_status (new_status)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID
- `old_status`: 旧状态
- `new_status`: 新状态
- `changed_by`: 变更人ID
- `changed_at`: 变更时间
- `reason`: 变更原因

##### 3.1.7 客户偏好表 (customer_preferences)

```sql
CREATE TABLE customer_preferences (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    preference_type VARCHAR(50) NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_customer_type_key (customer_id, preference_type, preference_key),
    INDEX idx_customer_id (customer_id),
    INDEX idx_preference_type (preference_type)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID
- `preference_type`: 偏好类型
- `preference_key`: 偏好键
- `preference_value`: 偏好值
- `created_at`: 创建时间
- `updated_at`: 更新时间

##### 3.1.8 客户地址表 (customer_addresses)

```sql
CREATE TABLE customer_addresses (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    detailed_address VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN NOT NULL DEFAULT false,
    address_type VARCHAR(20) CHECK (address_type IN ('home', 'work', 'other')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_is_default (is_default)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID
- `contact_name`: 联系人姓名
- `contact_phone`: 联系电话
- `province`: 省份
- `city`: 城市
- `district`: 区县
- `detailed_address`: 详细地址
- `postal_code`: 邮编
- `is_default`: 是否默认地址
- `address_type`: 地址类型
- `created_at`: 创建时间
- `updated_at`: 更新时间

#### 3.2 客户生命周期管理数据模型

##### 3.2.1 客户生命周期表 (customer_lifecycle)

```sql
CREATE TABLE customer_lifecycle (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    current_stage VARCHAR(50) NOT NULL,
    previous_stage VARCHAR(50),
    stage_changed_at TIMESTAMP NOT NULL,
    days_in_current_stage INT NOT NULL DEFAULT 0,
    total_days_in_lifecycle INT NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_current_stage (current_stage),
    INDEX idx_stage_changed_at (stage_changed_at)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID，外键关联customers表
- `current_stage`: 当前生命周期阶段
- `previous_stage`: 上一个生命周期阶段
- `stage_changed_at`: 阶段变更时间
- `days_in_current_stage`: 在当前阶段停留天数
- `total_days_in_lifecycle`: 生命周期总天数
- `metadata`: 元数据，JSON格式存储额外信息

##### 3.2.2 生命周期阶段历史表 (lifecycle_stage_history)

```sql
CREATE TABLE lifecycle_stage_history (
    id VARCHAR(36) PRIMARY KEY,
    lifecycle_id VARCHAR(36) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    entered_at TIMESTAMP NOT NULL,
    exited_at TIMESTAMP,
    duration INT,
    transition_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lifecycle_id) REFERENCES customer_lifecycle(id) ON DELETE CASCADE,
    INDEX idx_lifecycle_id (lifecycle_id),
    INDEX idx_stage (stage),
    INDEX idx_entered_at (entered_at)
);
```

**字段说明**：
- `id`: 主键，UUID
- `lifecycle_id`: 生命周期ID，外键关联customer_lifecycle表
- `stage`: 阶段名称
- `entered_at`: 进入阶段时间
- `exited_at`: 离开阶段时间
- `duration`: 停留时长（秒）
- `transition_reason`: 转换原因

##### 3.2.3 生命周期规则表 (lifecycle_rules)

```sql
CREATE TABLE lifecycle_rules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    from_stage VARCHAR(50)[] NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_enabled (enabled),
    INDEX idx_priority (priority)
);
```

**字段说明**：
- `id`: 主键，UUID
- `name`: 规则名称
- `description`: 规则描述
- `from_stage`: 源阶段数组
- `to_stage`: 目标阶段
- `conditions`: 触发条件，JSON格式
- `priority`: 优先级，数值越大优先级越高
- `enabled`: 是否启用

##### 3.2.4 客户事件表 (customer_events)

```sql
CREATE TABLE customer_events (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_event_type (event_type),
    INDEX idx_occurred_at (occurred_at),
    INDEX idx_processed (processed)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID
- `event_type`: 事件类型
- `event_data`: 事件数据，JSON格式
- `occurred_at`: 事件发生时间
- `processed`: 是否已处理

##### 3.2.5 RFM评分表 (rfm_scores)

```sql
CREATE TABLE rfm_scores (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL UNIQUE,
    recency_score DECIMAL(5,2) NOT NULL,
    frequency_score DECIMAL(5,2) NOT NULL,
    monetary_score DECIMAL(5,2) NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    customer_level VARCHAR(50) NOT NULL,
    level_label VARCHAR(50) NOT NULL,
    level_color VARCHAR(20) NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_total_score (total_score),
    INDEX idx_customer_level (customer_level)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID，唯一
- `recency_score`: 最近消费得分
- `frequency_score`: 消费频率得分
- `monetary_score`: 消费金额得分
- `total_score`: 总得分
- `customer_level`: 客户等级
- `level_label`: 等级标签
- `level_color`: 等级颜色
- `calculated_at`: 计算时间

##### 3.2.6 关怀提醒表 (care_reminders)

```sql
CREATE TABLE care_reminders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    rule_id VARCHAR(36) NOT NULL,
    care_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    channels VARCHAR(50)[] NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES care_reminder_rules(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_priority (priority)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID
- `rule_id`: 规则ID
- `care_type`: 关怀类型
- `content`: 关怀内容
- `channels`: 发送渠道数组
- `priority`: 优先级
- `scheduled_at`: 计划发送时间
- `sent_at`: 实际发送时间
- `status`: 状态
- `result`: 发送结果，JSON格式

##### 3.2.7 关怀提醒规则表 (care_reminder_rules)

```sql
CREATE TABLE care_reminder_rules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(20) NOT NULL,
    trigger_condition JSONB NOT NULL,
    care_type VARCHAR(50) NOT NULL,
    content_template TEXT NOT NULL,
    channels VARCHAR(50)[] NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_enabled (enabled),
    INDEX idx_trigger_type (trigger_type),
    INDEX idx_priority (priority)
);
```

**字段说明**：
- `id`: 主键，UUID
- `name`: 规则名称
- `description`: 规则描述
- `trigger_type`: 触发类型
- `trigger_condition`: 触发条件，JSON格式
- `care_type`: 关怀类型
- `content_template`: 内容模板
- `channels`: 发送渠道数组
- `priority`: 优先级
- `enabled`: 是否启用

##### 3.2.8 流失预测表 (churn_predictions)

```sql
CREATE TABLE churn_predictions (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL UNIQUE,
    churn_probability DECIMAL(5,4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    risk_factors VARCHAR(255)[] NOT NULL,
    predicted_churn_date TIMESTAMP NOT NULL,
    recommendations TEXT[] NOT NULL,
    assigned_to VARCHAR(36),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_status (status),
    INDEX idx_predicted_churn_date (predicted_churn_date)
);
```

**字段说明**：
- `id`: 主键，UUID
- `customer_id`: 客户ID，唯一
- `churn_probability`: 流失概率
- `risk_level`: 风险等级
- `risk_factors`: 风险因素数组
- `predicted_churn_date`: 预测流失日期
- `recommendations`: 建议措施数组
- `assigned_to`: 分配给谁
- `status`: 状态

#### 3.2 数据模型关系图

```
customers (1) ----< (1) customer_lifecycle
                         |
                         | (1)
                         |
                         v
                 lifecycle_stage_history (*)

customers (1) ----< (*) customer_events

customers (1) ----< (1) rfm_scores

customers (1) ----< (*) care_reminders
                         |
                         | (*)
                         |
                         v
                 care_reminder_rules (1)

customers (1) ----< (1) churn_predictions

customer_lifecycle (1) ----< (*) lifecycle_rules
```

#### 3.3 数据模型约束与索引

##### 3.3.1 主键约束
所有表都使用UUID作为主键，确保全局唯一性。

##### 3.3.2 外键约束
- `customer_lifecycle.customer_id` → `customers.id`
- `lifecycle_stage_history.lifecycle_id` → `customer_lifecycle.id`
- `customer_events.customer_id` → `customers.id`
- `rfm_scores.customer_id` → `customers.id`
- `care_reminders.customer_id` → `customers.id`
- `care_reminders.rule_id` → `care_reminder_rules.id`
- `churn_predictions.customer_id` → `customers.id`

##### 3.3.3 唯一约束
- `rfm_scores.customer_id`: 每个客户只能有一个RFM评分
- `churn_predictions.customer_id`: 每个客户只能有一个流失预测

##### 3.3.4 索引优化
- 为所有外键字段创建索引，提高关联查询性能
- 为常用查询字段创建索引，如`status`、`enabled`、`priority`等
- 为时间字段创建索引，支持时间范围查询

#### 3.4 数据模型使用示例

##### 3.4.1 查询客户生命周期信息
```sql
SELECT 
    cl.*,
    c.name AS customer_name,
    c.phone AS customer_phone
FROM customer_lifecycle cl
JOIN customers c ON cl.customer_id = c.id
WHERE cl.customer_id = 'customer-uuid';
```

##### 3.4.2 查询客户阶段历史
```sql
SELECT 
    lsh.stage,
    lsh.entered_at,
    lsh.exited_at,
    lsh.duration,
    lsh.transition_reason
FROM lifecycle_stage_history lsh
WHERE lsh.lifecycle_id = 'lifecycle-uuid'
ORDER BY lsh.entered_at DESC;
```

##### 3.4.3 查询高风险流失客户
```sql
SELECT 
    cp.*,
    c.name AS customer_name,
    c.phone AS customer_phone
FROM churn_predictions cp
JOIN customers c ON cp.customer_id = c.id
WHERE cp.risk_level = 'high'
  AND cp.status = 'pending'
ORDER BY cp.churn_probability DESC
LIMIT 100;
```

##### 3.4.4 查询待处理关怀提醒
```sql
SELECT 
    cr.*,
    c.name AS customer_name,
    c.phone AS customer_phone,
    crr.name AS rule_name
FROM care_reminders cr
JOIN customers c ON cr.customer_id = c.id
LEFT JOIN care_reminder_rules crr ON cr.rule_id = crr.id
WHERE cr.status = 'pending'
ORDER BY cr.priority DESC, cr.scheduled_at ASC
LIMIT 100;
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
