-- YYC³餐饮行业智能化平台 - PostgreSQL数据库初始化脚本
-- 创建时间: 2025-12-28
-- 版本: v1.0.0
-- 数据库: PostgreSQL 14+

-- 设置客户端编码
SET client_encoding = 'UTF8';

-- ================================
-- 1. 创建自定义枚举类型
-- ================================

-- 用户角色枚举
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'admin', 'manager', 'staff');

-- 用户状态枚举
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'locked');

-- 门店状态枚举
CREATE TYPE store_status_enum AS ENUM ('active', 'inactive', 'maintenance');

-- 员工职位枚举
CREATE TYPE staff_position_enum AS ENUM ('manager', 'cashier', 'waiter', 'kitchen', 'cleaner', 'security');

-- 员工状态枚举
CREATE TYPE staff_status_enum AS ENUM ('active', 'resigned', 'suspended');

-- 订单类型枚举
CREATE TYPE order_type_enum AS ENUM ('dine_in', 'takeaway', 'delivery');

-- 用餐模式枚举
CREATE TYPE dining_mode_enum AS ENUM ('single', 'group', 'buffet');

-- 订单状态枚举
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'serving', 'completed', 'cancelled', 'refunded');

-- 支付状态枚举
CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'paid', 'refunded', 'partial_refunded');

-- 支付方式枚举
CREATE TYPE payment_method_enum AS ENUM ('cash', 'alipay', 'wechat', 'unionpay', 'credit_card', 'member_balance', 'mixed');

-- 订单来源枚举
CREATE TYPE order_source_enum AS ENUM ('pos', 'mobile', 'web', 'weapp', 'phone');

-- 订单优先级枚举
CREATE TYPE order_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');

-- 厨房状态枚举
CREATE TYPE kitchen_status_enum AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');

-- 会员性别枚举
CREATE TYPE member_gender_enum AS ENUM ('male', 'female', 'unknown');

-- 会员来源枚举
CREATE TYPE member_source_enum AS ENUM ('register', 'import', 'staff_add');

-- 会员状态枚举
CREATE TYPE member_status_enum AS ENUM ('active', 'inactive', 'blacklisted');

-- 积分交易类型枚举
CREATE TYPE points_transaction_type_enum AS ENUM ('earn', 'redeem', 'expire', 'adjust', 'gift');

-- 积分来源枚举
CREATE TYPE points_source_enum AS ENUM ('order', 'refund', 'activity', 'manual', 'system');

-- 营销活动类型枚举
CREATE TYPE activity_type_enum AS ENUM ('coupon', 'discount', 'points_exchange', 'flash_sale', 'group_buy', 'lucky_draw', 'recommend_reward');

-- 营销活动状态枚举
CREATE TYPE activity_status_enum AS ENUM ('draft', 'published', 'active', 'paused', 'expired', 'cancelled');

-- 优惠券类型枚举
CREATE TYPE coupon_type_enum AS ENUM ('fixed_amount', 'percentage', 'free_shipping', 'gift');

-- 优惠券状态枚举
CREATE TYPE coupon_status_enum AS ENUM ('active', 'used', 'expired');

-- 支付配置方法枚举
CREATE TYPE payment_config_method_enum AS ENUM ('alipay', 'wechat', 'unionpay', 'cash', 'credit_card', 'debit_card', 'digital_wallet', 'member_balance');

-- 支付交易状态枚举
CREATE TYPE payment_transaction_status_enum AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'partially_refunded');

-- 退款状态枚举
CREATE TYPE refund_status_enum AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled');

-- 系统配置类型枚举
CREATE TYPE config_type_enum AS ENUM ('string', 'number', 'boolean', 'json', 'array');

-- HTTP方法枚举
CREATE TYPE http_method_enum AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH');

-- ================================
-- 2. 创建更新时间触发器函数
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 3. 用户相关表
-- ================================

-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    role user_role_enum NOT NULL DEFAULT 'staff',
    status user_status_enum NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    login_count INTEGER NOT NULL DEFAULT 0,
    password_changed_at TIMESTAMP,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.password_hash IS '密码哈希';
COMMENT ON COLUMN users.salt IS '密码盐值';
COMMENT ON COLUMN users.full_name IS '全名';
COMMENT ON COLUMN users.phone IS '手机号';
COMMENT ON COLUMN users.avatar IS '头像URL';
COMMENT ON COLUMN users.role IS '角色';
COMMENT ON COLUMN users.status IS '状态';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN users.last_login_ip IS '最后登录IP';
COMMENT ON COLUMN users.login_count IS '登录次数';
COMMENT ON COLUMN users.password_changed_at IS '密码修改时间';
COMMENT ON COLUMN users.two_factor_enabled IS '是否启用双因子认证';
COMMENT ON COLUMN users.two_factor_secret IS '双因子认证密钥';
COMMENT ON COLUMN users.email_verified_at IS '邮箱验证时间';
COMMENT ON COLUMN users.phone_verified_at IS '手机验证时间';

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 角色权限表
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS '角色权限表';
COMMENT ON COLUMN roles.id IS '角色ID';
COMMENT ON COLUMN roles.name IS '角色名称';
COMMENT ON COLUMN roles.display_name IS '显示名称';
COMMENT ON COLUMN roles.description IS '描述';
COMMENT ON COLUMN roles.permissions IS '权限列表';
COMMENT ON COLUMN roles.is_system IS '是否系统角色';

CREATE INDEX idx_roles_is_system ON roles(is_system);

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 用户角色关联表
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by BIGINT REFERENCES users(id),
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE user_roles IS '用户角色关联表';
COMMENT ON COLUMN user_roles.id IS '关联ID';
COMMENT ON COLUMN user_roles.user_id IS '用户ID';
COMMENT ON COLUMN user_roles.role_id IS '角色ID';
COMMENT ON COLUMN user_roles.assigned_by IS '分配人ID';
COMMENT ON COLUMN user_roles.assigned_at IS '分配时间';
COMMENT ON COLUMN user_roles.expires_at IS '过期时间';

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- 用户会话表
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_sessions IS '用户会话表';
COMMENT ON COLUMN user_sessions.id IS '会话ID';
COMMENT ON COLUMN user_sessions.user_id IS '用户ID';
COMMENT ON COLUMN user_sessions.session_token IS '会话令牌';
COMMENT ON COLUMN user_sessions.refresh_token IS '刷新令牌';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP地址';
COMMENT ON COLUMN user_sessions.user_agent IS '用户代理';
COMMENT ON COLUMN user_sessions.device_info IS '设备信息';
COMMENT ON COLUMN user_sessions.is_active IS '是否活跃';
COMMENT ON COLUMN user_sessions.expires_at IS '过期时间';

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 4. 门店相关表
-- ================================

-- 门店表
CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    store_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    longitude DECIMAL(10,7),
    latitude DECIMAL(10,7),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    business_hours JSONB,
    area DECIMAL(8,2),
    capacity INTEGER,
    manager_id BIGINT REFERENCES users(id),
    status store_status_enum NOT NULL DEFAULT 'active',
    opening_date DATE,
    logo VARCHAR(255),
    images JSONB,
    features JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE stores IS '门店表';
COMMENT ON COLUMN stores.id IS '门店ID';
COMMENT ON COLUMN stores.store_code IS '门店编码';
COMMENT ON COLUMN stores.name IS '门店名称';
COMMENT ON COLUMN stores.description IS '描述';
COMMENT ON COLUMN stores.address IS '地址';
COMMENT ON COLUMN stores.longitude IS '经度';
COMMENT ON COLUMN stores.latitude IS '纬度';
COMMENT ON COLUMN stores.phone IS '电话';
COMMENT ON COLUMN stores.email IS '邮箱';
COMMENT ON COLUMN stores.business_hours IS '营业时间';
COMMENT ON COLUMN stores.area IS '面积(平方米)';
COMMENT ON COLUMN stores.capacity IS '容纳人数';
COMMENT ON COLUMN stores.manager_id IS '店长ID';
COMMENT ON COLUMN stores.status IS '状态';
COMMENT ON COLUMN stores.opening_date IS '开业日期';
COMMENT ON COLUMN stores.logo IS '门店Logo';
COMMENT ON COLUMN stores.images IS '门店图片';
COMMENT ON COLUMN stores.features IS '特色服务';

CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_manager_id ON stores(manager_id);
CREATE INDEX idx_stores_status ON stores(status);

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 门店员工表
CREATE TABLE store_staff (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position staff_position_enum NOT NULL,
    salary DECIMAL(10,2),
    hire_date DATE NOT NULL,
    status staff_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, user_id)
);

COMMENT ON TABLE store_staff IS '门店员工表';
COMMENT ON COLUMN store_staff.id IS 'ID';
COMMENT ON COLUMN store_staff.store_id IS '门店ID';
COMMENT ON COLUMN store_staff.user_id IS '用户ID';
COMMENT ON COLUMN store_staff.position IS '职位';
COMMENT ON COLUMN store_staff.salary IS '薪资';
COMMENT ON COLUMN store_staff.hire_date IS '入职日期';
COMMENT ON COLUMN store_staff.status IS '状态';

CREATE INDEX idx_store_staff_user_id ON store_staff(user_id);
CREATE INDEX idx_store_staff_position ON store_staff(position);

CREATE TRIGGER update_store_staff_updated_at
    BEFORE UPDATE ON store_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 5. 菜单相关表
-- ================================

-- 菜品分类表
CREATE TABLE menu_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menu_categories IS '菜品分类表';
COMMENT ON COLUMN menu_categories.id IS '分类ID';
COMMENT ON COLUMN menu_categories.name IS '分类名称';
COMMENT ON COLUMN menu_categories.description IS '描述';
COMMENT ON COLUMN menu_categories.image IS '分类图片';
COMMENT ON COLUMN menu_categories.sort_order IS '排序';
COMMENT ON COLUMN menu_categories.is_active IS '是否启用';
COMMENT ON COLUMN menu_categories.store_id IS '门店ID(为空表示全局分类)';

CREATE INDEX idx_menu_categories_store_id ON menu_categories(store_id);
CREATE INDEX idx_menu_categories_sort_order ON menu_categories(sort_order);

CREATE TRIGGER update_menu_categories_updated_at
    BEFORE UPDATE ON menu_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 菜品表
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    item_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL REFERENCES menu_categories(id),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost DECIMAL(10,2),
    unit VARCHAR(20) NOT NULL DEFAULT '份',
    image VARCHAR(255),
    images JSONB,
    nutrition_info JSONB,
    allergen_info JSONB,
    preparation_time INTEGER,
    spicy_level SMALLINT DEFAULT 0,
    is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    is_signature BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    daily_limit INTEGER,
    tags JSONB,
    store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menu_items IS '菜品表';
COMMENT ON COLUMN menu_items.id IS '菜品ID';
COMMENT ON COLUMN menu_items.item_code IS '菜品编码';
COMMENT ON COLUMN menu_items.name IS '菜品名称';
COMMENT ON COLUMN menu_items.description IS '描述';
COMMENT ON COLUMN menu_items.category_id IS '分类ID';
COMMENT ON COLUMN menu_items.price IS '价格';
COMMENT ON COLUMN menu_items.original_price IS '原价';
COMMENT ON COLUMN menu_items.cost IS '成本';
COMMENT ON COLUMN menu_items.unit IS '单位';
COMMENT ON COLUMN menu_items.image IS '图片';
COMMENT ON COLUMN menu_items.images IS '多张图片';
COMMENT ON COLUMN menu_items.nutrition_info IS '营养信息';
COMMENT ON COLUMN menu_items.allergen_info IS '过敏原信息';
COMMENT ON COLUMN menu_items.preparation_time IS '制作时间(分钟)';
COMMENT ON COLUMN menu_items.spicy_level IS '辣度等级(0-5)';
COMMENT ON COLUMN menu_items.is_recommended IS '是否推荐';
COMMENT ON COLUMN menu_items.is_signature IS '是否招牌菜';
COMMENT ON COLUMN menu_items.is_available IS '是否可售';
COMMENT ON COLUMN menu_items.sort_order IS '排序';
COMMENT ON COLUMN menu_items.daily_limit IS '每日限量';
COMMENT ON COLUMN menu_items.tags IS '标签';
COMMENT ON COLUMN menu_items.store_id IS '门店ID(为空表示全局菜品)';
COMMENT ON COLUMN menu_items.created_by IS '创建人ID';

CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_price ON menu_items(price);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_is_recommended ON menu_items(is_recommended);
CREATE INDEX idx_menu_items_store_id ON menu_items(store_id);
CREATE INDEX idx_menu_items_created_by ON menu_items(created_by);

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 菜品规格表
CREATE TABLE menu_item_specs (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menu_item_specs IS '菜品规格表';
COMMENT ON COLUMN menu_item_specs.id IS '规格ID';
COMMENT ON COLUMN menu_item_specs.item_id IS '菜品ID';
COMMENT ON COLUMN menu_item_specs.name IS '规格名称';
COMMENT ON COLUMN menu_item_specs.price IS '价格';
COMMENT ON COLUMN menu_item_specs.cost IS '成本';
COMMENT ON COLUMN menu_item_specs.description IS '描述';
COMMENT ON COLUMN menu_item_specs.sort_order IS '排序';
COMMENT ON COLUMN menu_item_specs.is_available IS '是否可售';

CREATE INDEX idx_menu_item_specs_item_id ON menu_item_specs(item_id);

CREATE TRIGGER update_menu_item_specs_updated_at
    BEFORE UPDATE ON menu_item_specs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 菜品选项组表
CREATE TABLE menu_option_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    min_selections INTEGER NOT NULL DEFAULT 0,
    max_selections INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menu_option_groups IS '菜品选项组表';
COMMENT ON COLUMN menu_option_groups.id IS '选项组ID';
COMMENT ON COLUMN menu_option_groups.name IS '选项组名称';
COMMENT ON COLUMN menu_option_groups.description IS '描述';
COMMENT ON COLUMN menu_option_groups.min_selections IS '最少选择数';
COMMENT ON COLUMN menu_option_groups.max_selections IS '最多选择数';
COMMENT ON COLUMN menu_option_groups.is_required IS '是否必选';
COMMENT ON COLUMN menu_option_groups.sort_order IS '排序';

CREATE INDEX idx_menu_option_groups_sort_order ON menu_option_groups(sort_order);

CREATE TRIGGER update_menu_option_groups_updated_at
    BEFORE UPDATE ON menu_option_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 菜品选项表
CREATE TABLE menu_options (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES menu_option_groups(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menu_options IS '菜品选项表';
COMMENT ON COLUMN menu_options.id IS '选项ID';
COMMENT ON COLUMN menu_options.group_id IS '选项组ID';
COMMENT ON COLUMN menu_options.name IS '选项名称';
COMMENT ON COLUMN menu_options.price IS '价格';
COMMENT ON COLUMN menu_options.description IS '描述';
COMMENT ON COLUMN menu_options.sort_order IS '排序';
COMMENT ON COLUMN menu_options.is_available IS '是否可售';

CREATE INDEX idx_menu_options_group_id ON menu_options(group_id);

CREATE TRIGGER update_menu_options_updated_at
    BEFORE UPDATE ON menu_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 菜品选项关联表
CREATE TABLE menu_item_option_relations (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES menu_option_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, group_id)
);

COMMENT ON TABLE menu_item_option_relations IS '菜品选项关联表';
COMMENT ON COLUMN menu_item_option_relations.id IS '关联ID';
COMMENT ON COLUMN menu_item_option_relations.item_id IS '菜品ID';
COMMENT ON COLUMN menu_item_option_relations.group_id IS '选项组ID';

CREATE INDEX idx_menu_item_option_relations_item_id ON menu_item_option_relations(item_id);
CREATE INDEX idx_menu_item_option_relations_group_id ON menu_item_option_relations(group_id);

-- ================================
-- 6. 会员相关表
-- ================================

-- 会员等级表
CREATE TABLE member_levels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(7),
    min_points INTEGER NOT NULL DEFAULT 0,
    max_points INTEGER,
    discount_rate DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    points_rate DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    birthday_points INTEGER NOT NULL DEFAULT 0,
    benefits JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE member_levels IS '会员等级表';
COMMENT ON COLUMN member_levels.id IS '等级ID';
COMMENT ON COLUMN member_levels.name IS '等级名称';
COMMENT ON COLUMN member_levels.description IS '描述';
COMMENT ON COLUMN member_levels.icon IS '等级图标';
COMMENT ON COLUMN member_levels.color IS '等级颜色';
COMMENT ON COLUMN member_levels.min_points IS '最低积分要求';
COMMENT ON COLUMN member_levels.max_points IS '最高积分要求';
COMMENT ON COLUMN member_levels.discount_rate IS '折扣率';
COMMENT ON COLUMN member_levels.points_rate IS '积分倍率';
COMMENT ON COLUMN member_levels.birthday_points IS '生日额外积分';
COMMENT ON COLUMN member_levels.benefits IS '权益';
COMMENT ON COLUMN member_levels.sort_order IS '排序';
COMMENT ON COLUMN member_levels.is_active IS '是否启用';

CREATE INDEX idx_member_levels_min_points ON member_levels(min_points);
CREATE INDEX idx_member_levels_sort_order ON member_levels(sort_order);

CREATE TRIGGER update_member_levels_updated_at
    BEFORE UPDATE ON member_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 会员表
CREATE TABLE members (
    id BIGSERIAL PRIMARY KEY,
    member_no VARCHAR(20) NOT NULL UNIQUE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    nickname VARCHAR(50),
    real_name VARCHAR(50),
    gender member_gender_enum DEFAULT 'unknown',
    birthday DATE,
    avatar VARCHAR(255),
    level_id BIGINT NOT NULL REFERENCES member_levels(id),
    points INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_spent DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    order_count INTEGER NOT NULL DEFAULT 0,
    last_order_at TIMESTAMP,
    last_visit_at TIMESTAMP,
    preferences JSONB,
    tags JSONB,
    source member_source_enum NOT NULL DEFAULT 'register',
    status member_status_enum NOT NULL DEFAULT 'active',
    remark TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE members IS '会员表';
COMMENT ON COLUMN members.id IS '会员ID';
COMMENT ON COLUMN members.member_no IS '会员号';
COMMENT ON COLUMN members.user_id IS '关联用户ID';
COMMENT ON COLUMN members.phone IS '手机号';
COMMENT ON COLUMN members.email IS '邮箱';
COMMENT ON COLUMN members.nickname IS '昵称';
COMMENT ON COLUMN members.real_name IS '真实姓名';
COMMENT ON COLUMN members.gender IS '性别';
COMMENT ON COLUMN members.birthday IS '生日';
COMMENT ON COLUMN members.avatar IS '头像';
COMMENT ON COLUMN members.level_id IS '等级ID';
COMMENT ON COLUMN members.points IS '积分';
COMMENT ON COLUMN members.total_points IS '总积分(包含已使用的)';
COMMENT ON COLUMN members.balance IS '账户余额';
COMMENT ON COLUMN members.total_spent IS '累计消费';
COMMENT ON COLUMN members.order_count IS '订单数量';
COMMENT ON COLUMN members.last_order_at IS '最后下单时间';
COMMENT ON COLUMN members.last_visit_at IS '最后访问时间';
COMMENT ON COLUMN members.preferences IS '偏好设置';
COMMENT ON COLUMN members.tags IS '标签';
COMMENT ON COLUMN members.source IS '来源';
COMMENT ON COLUMN members.status IS '状态';
COMMENT ON COLUMN members.remark IS '备注';

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_level_id ON members(level_id);
CREATE INDEX idx_members_points ON members(points);
CREATE INDEX idx_members_total_spent ON members(total_spent);
CREATE INDEX idx_members_status ON members(status);

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 会员积分记录表
CREATE TABLE member_points_transactions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    type points_transaction_type_enum NOT NULL,
    points INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    source points_source_enum NOT NULL,
    source_id BIGINT,
    description VARCHAR(255),
    expires_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE member_points_transactions IS '会员积分记录表';
COMMENT ON COLUMN member_points_transactions.id IS '记录ID';
COMMENT ON COLUMN member_points_transactions.member_id IS '会员ID';
COMMENT ON COLUMN member_points_transactions.transaction_id IS '交易编号';
COMMENT ON COLUMN member_points_transactions.type IS '类型';
COMMENT ON COLUMN member_points_transactions.points IS '积分数(正为获得，负为消耗)';
COMMENT ON COLUMN member_points_transactions.balance IS '变动后余额';
COMMENT ON COLUMN member_points_transactions.source IS '来源';
COMMENT ON COLUMN member_points_transactions.source_id IS '来源ID';
COMMENT ON COLUMN member_points_transactions.description IS '描述';
COMMENT ON COLUMN member_points_transactions.expires_at IS '过期时间';
COMMENT ON COLUMN member_points_transactions.created_by IS '操作人ID';

CREATE INDEX idx_member_points_transactions_member_id ON member_points_transactions(member_id);
CREATE INDEX idx_member_points_transactions_type ON member_points_transactions(type);
CREATE INDEX idx_member_points_transactions_source ON member_points_transactions(source);
CREATE INDEX idx_member_points_transactions_created_at ON member_points_transactions(created_at);

-- ================================
-- 7. 订单相关表
-- ================================

-- 订单表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    store_id BIGINT NOT NULL REFERENCES stores(id),
    member_id BIGINT REFERENCES members(id),
    table_number VARCHAR(20),
    order_type order_type_enum NOT NULL DEFAULT 'dine_in',
    dining_mode dining_mode_enum NOT NULL DEFAULT 'single',
    people_count INTEGER,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    points_used INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    coupon_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    member_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status order_status_enum NOT NULL DEFAULT 'pending',
    payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
    payment_method payment_method_enum,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    delivery_address TEXT,
    estimated_time INTEGER,
    actual_time INTEGER,
    special_requests TEXT,
    cancellation_reason TEXT,
    refund_reason TEXT,
    staff_notes TEXT,
    rating SMALLINT,
    review TEXT,
    source order_source_enum NOT NULL DEFAULT 'pos',
    channel VARCHAR(50),
    priority order_priority_enum NOT NULL DEFAULT 'normal',
    kitchen_notes TEXT,
    is_takeaway BOOLEAN NOT NULL DEFAULT FALSE,
    is_express BOOLEAN NOT NULL DEFAULT FALSE,
    ordered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    ready_at TIMESTAMP,
    served_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE orders IS '订单表';
COMMENT ON COLUMN orders.id IS '订单ID';
COMMENT ON COLUMN orders.order_no IS '订单号';
COMMENT ON COLUMN orders.store_id IS '门店ID';
COMMENT ON COLUMN orders.member_id IS '会员ID';
COMMENT ON COLUMN orders.table_number IS '桌号';
COMMENT ON COLUMN orders.order_type IS '订单类型';
COMMENT ON COLUMN orders.dining_mode IS '用餐模式';
COMMENT ON COLUMN orders.people_count IS '用餐人数';
COMMENT ON COLUMN orders.subtotal IS '小计';
COMMENT ON COLUMN orders.discount_amount IS '折扣金额';
COMMENT ON COLUMN orders.service_fee IS '服务费';
COMMENT ON COLUMN orders.delivery_fee IS '配送费';
COMMENT ON COLUMN orders.tax_amount IS '税费';
COMMENT ON COLUMN orders.total_amount IS '总金额';
COMMENT ON COLUMN orders.paid_amount IS '已付金额';
COMMENT ON COLUMN orders.points_used IS '使用的积分';
COMMENT ON COLUMN orders.points_earned IS '获得的积分';
COMMENT ON COLUMN orders.coupon_amount IS '优惠券金额';
COMMENT ON COLUMN orders.member_discount IS '会员折扣';
COMMENT ON COLUMN orders.status IS '状态';
COMMENT ON COLUMN orders.payment_status IS '支付状态';
COMMENT ON COLUMN orders.payment_method IS '支付方式';
COMMENT ON COLUMN orders.contact_name IS '联系人姓名';
COMMENT ON COLUMN orders.contact_phone IS '联系电话';
COMMENT ON COLUMN orders.delivery_address IS '配送地址';
COMMENT ON COLUMN orders.estimated_time IS '预计时间(分钟)';
COMMENT ON COLUMN orders.actual_time IS '实际时间(分钟)';
COMMENT ON COLUMN orders.special_requests IS '特殊要求';
COMMENT ON COLUMN orders.cancellation_reason IS '取消原因';
COMMENT ON COLUMN orders.refund_reason IS '退款原因';
COMMENT ON COLUMN orders.staff_notes IS '员工备注';
COMMENT ON COLUMN orders.rating IS '评分(1-5)';
COMMENT ON COLUMN orders.review IS '评价内容';
COMMENT ON COLUMN orders.source IS '订单来源';
COMMENT ON COLUMN orders.priority IS '优先级';
COMMENT ON COLUMN orders.kitchen_notes IS '厨房备注';
COMMENT ON COLUMN orders.is_takeaway IS '是否外卖';
COMMENT ON COLUMN orders.is_express IS '是否加急';
COMMENT ON COLUMN orders.ordered_at IS '下单时间';
COMMENT ON COLUMN orders.confirmed_at IS '确认时间';
COMMENT ON COLUMN orders.ready_at IS '准备好时间';
COMMENT ON COLUMN orders.served_at IS '上菜时间';
COMMENT ON COLUMN orders.completed_at IS '完成时间';
COMMENT ON COLUMN orders.cancelled_at IS '取消时间';
COMMENT ON COLUMN orders.refunded_at IS '退款时间';

CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_member_id ON orders(member_id);
CREATE INDEX idx_orders_table_number ON orders(table_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at);
CREATE INDEX idx_orders_total_amount ON orders(total_amount);

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 订单明细表
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES menu_items(id),
    item_name VARCHAR(100) NOT NULL,
    spec_id BIGINT REFERENCES menu_item_specs(id),
    spec_name VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    kitchen_status kitchen_status_enum NOT NULL DEFAULT 'pending',
    special_requests TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_items IS '订单明细表';
COMMENT ON COLUMN order_items.id IS '明细ID';
COMMENT ON COLUMN order_items.order_id IS '订单ID';
COMMENT ON COLUMN order_items.item_id IS '菜品ID';
COMMENT ON COLUMN order_items.item_name IS '菜品名称(冗余)';
COMMENT ON COLUMN order_items.spec_id IS '规格ID';
COMMENT ON COLUMN order_items.spec_name IS '规格名称';
COMMENT ON COLUMN order_items.quantity IS '数量';
COMMENT ON COLUMN order_items.unit_price IS '单价';
COMMENT ON COLUMN order_items.total_price IS '小计';
COMMENT ON COLUMN order_items.cost_price IS '成本价';
COMMENT ON COLUMN order_items.kitchen_status IS '厨房状态';
COMMENT ON COLUMN order_items.special_requests IS '特殊要求';
COMMENT ON COLUMN order_items.sort_order IS '排序';

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_item_id ON order_items(item_id);
CREATE INDEX idx_order_items_kitchen_status ON order_items(kitchen_status);

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 订单选项表
CREATE TABLE order_item_options (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_id BIGINT NOT NULL REFERENCES menu_options(id),
    option_name VARCHAR(50) NOT NULL,
    option_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_item_options IS '订单选项表';
COMMENT ON COLUMN order_item_options.id IS '选项ID';
COMMENT ON COLUMN order_item_options.order_item_id IS '订单明细ID';
COMMENT ON COLUMN order_item_options.option_id IS '选项ID';
COMMENT ON COLUMN order_item_options.option_name IS '选项名称';
COMMENT ON COLUMN order_item_options.option_price IS '选项价格';
COMMENT ON COLUMN order_item_options.quantity IS '数量';
COMMENT ON COLUMN order_item_options.total_price IS '小计';

CREATE INDEX idx_order_item_options_order_item_id ON order_item_options(order_item_id);
CREATE INDEX idx_order_item_options_option_id ON order_item_options(option_id);

-- 订单状态历史表
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    operator_id BIGINT REFERENCES users(id),
    operator_name VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_status_history IS '订单状态历史表';
COMMENT ON COLUMN order_status_history.id IS '历史ID';
COMMENT ON COLUMN order_status_history.order_id IS '订单ID';
COMMENT ON COLUMN order_status_history.from_status IS '原状态';
COMMENT ON COLUMN order_status_history.to_status IS '新状态';
COMMENT ON COLUMN order_status_history.reason IS '变更原因';
COMMENT ON COLUMN order_status_history.operator_id IS '操作人ID';
COMMENT ON COLUMN order_status_history.operator_name IS '操作人姓名';
COMMENT ON COLUMN order_status_history.notes IS '备注';

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_operator_id ON order_status_history(operator_id);

-- ================================
-- 8. 营销相关表
-- ================================

-- 营销活动表
CREATE TABLE marketing_activities (
    id BIGSERIAL PRIMARY KEY,
    activity_id VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type activity_type_enum NOT NULL,
    status activity_status_enum NOT NULL DEFAULT 'draft',
    banner VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER NOT NULL DEFAULT 0,
    target_audience JSONB,
    conditions JSONB,
    rewards JSONB,
    statistics JSONB,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE marketing_activities IS '营销活动表';
COMMENT ON COLUMN marketing_activities.id IS '活动ID';
COMMENT ON COLUMN marketing_activities.activity_id IS '活动编号';
COMMENT ON COLUMN marketing_activities.name IS '活动名称';
COMMENT ON COLUMN marketing_activities.description IS '活动描述';
COMMENT ON COLUMN marketing_activities.type IS '活动类型';
COMMENT ON COLUMN marketing_activities.status IS '状态';
COMMENT ON COLUMN marketing_activities.banner IS '活动横幅';
COMMENT ON COLUMN marketing_activities.start_time IS '开始时间';
COMMENT ON COLUMN marketing_activities.end_time IS '结束时间';
COMMENT ON COLUMN marketing_activities.max_participants IS '最大参与人数';
COMMENT ON COLUMN marketing_activities.current_participants IS '当前参与人数';
COMMENT ON COLUMN marketing_activities.target_audience IS '目标人群';
COMMENT ON COLUMN marketing_activities.conditions IS '参与条件';
COMMENT ON COLUMN marketing_activities.rewards IS '奖励设置';
COMMENT ON COLUMN marketing_activities.statistics IS '统计数据';
COMMENT ON COLUMN marketing_activities.created_by IS '创建人ID';

CREATE INDEX idx_marketing_activities_type ON marketing_activities(type);
CREATE INDEX idx_marketing_activities_status ON marketing_activities(status);
CREATE INDEX idx_marketing_activities_start_time ON marketing_activities(start_time);
CREATE INDEX idx_marketing_activities_end_time ON marketing_activities(end_time);
CREATE INDEX idx_marketing_activities_created_by ON marketing_activities(created_by);

CREATE TRIGGER update_marketing_activities_updated_at
    BEFORE UPDATE ON marketing_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 优惠券表
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    coupon_id VARCHAR(32) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type coupon_type_enum NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    user_limit INTEGER,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    status coupon_status_enum NOT NULL DEFAULT 'active',
    target_audience JSONB,
    applicable_items JSONB,
    excluded_items JSONB,
    activity_id BIGINT REFERENCES marketing_activities(id),
    member_id BIGINT REFERENCES members(id),
    used_at TIMESTAMP,
    used_order_id VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE coupons IS '优惠券表';
COMMENT ON COLUMN coupons.id IS '优惠券ID';
COMMENT ON COLUMN coupons.coupon_id IS '优惠券编号';
COMMENT ON COLUMN coupons.code IS '优惠券码';
COMMENT ON COLUMN coupons.name IS '优惠券名称';
COMMENT ON COLUMN coupons.description IS '描述';
COMMENT ON COLUMN coupons.type IS '类型';
COMMENT ON COLUMN coupons.value IS '面值';
COMMENT ON COLUMN coupons.min_order_amount IS '最低消费金额';
COMMENT ON COLUMN coupons.max_discount_amount IS '最大优惠金额';
COMMENT ON COLUMN coupons.usage_limit IS '使用次数限制';
COMMENT ON COLUMN coupons.usage_count IS '已使用次数';
COMMENT ON COLUMN coupons.user_limit IS '每人限用次数';
COMMENT ON COLUMN coupons.valid_from IS '有效开始时间';
COMMENT ON COLUMN coupons.valid_until IS '有效结束时间';
COMMENT ON COLUMN coupons.status IS '状态';
COMMENT ON COLUMN coupons.target_audience IS '目标人群';
COMMENT ON COLUMN coupons.applicable_items IS '适用商品';
COMMENT ON COLUMN coupons.excluded_items IS '排除商品';
COMMENT ON COLUMN coupons.activity_id IS '关联活动ID';
COMMENT ON COLUMN coupons.member_id IS '领取会员ID';
COMMENT ON COLUMN coupons.used_at IS '使用时间';
COMMENT ON COLUMN coupons.used_order_id IS '使用的订单ID';

CREATE INDEX idx_coupons_type ON coupons(type);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX idx_coupons_activity_id ON coupons(activity_id);
CREATE INDEX idx_coupons_member_id ON coupons(member_id);

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 9. 支付相关表
-- ================================

-- 支付配置表
CREATE TABLE payment_configs (
    id BIGSERIAL PRIMARY KEY,
    method payment_config_method_enum NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE payment_configs IS '支付配置表';
COMMENT ON COLUMN payment_configs.id IS '配置ID';
COMMENT ON COLUMN payment_configs.method IS '支付方式';
COMMENT ON COLUMN payment_configs.name IS '配置名称';
COMMENT ON COLUMN payment_configs.display_name IS '显示名称';
COMMENT ON COLUMN payment_configs.description IS '描述';
COMMENT ON COLUMN payment_configs.enabled IS '是否启用';
COMMENT ON COLUMN payment_configs.config IS '配置信息';

CREATE INDEX idx_payment_configs_enabled ON payment_configs(enabled);

CREATE TRIGGER update_payment_configs_updated_at
    BEFORE UPDATE ON payment_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 支付交易表
CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    order_id VARCHAR(32),
    payment_method payment_method_enum NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    status payment_transaction_status_enum NOT NULL DEFAULT 'pending',
    payment_time TIMESTAMP,
    failure_reason TEXT,
    external_transaction_id VARCHAR(128),
    gateway_response JSONB,
    refund_amount DECIMAL(10,2),
    refunded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE payment_transactions IS '支付交易表';
COMMENT ON COLUMN payment_transactions.id IS '交易ID';
COMMENT ON COLUMN payment_transactions.transaction_id IS '交易号';
COMMENT ON COLUMN payment_transactions.order_id IS '关联订单号';
COMMENT ON COLUMN payment_transactions.payment_method IS '支付方式';
COMMENT ON COLUMN payment_transactions.amount IS '金额';
COMMENT ON COLUMN payment_transactions.currency IS '货币';
COMMENT ON COLUMN payment_transactions.status IS '状态';
COMMENT ON COLUMN payment_transactions.payment_time IS '支付时间';
COMMENT ON COLUMN payment_transactions.failure_reason IS '失败原因';
COMMENT ON COLUMN payment_transactions.external_transaction_id IS '外部交易号';
COMMENT ON COLUMN payment_transactions.gateway_response IS '网关响应';
COMMENT ON COLUMN payment_transactions.refund_amount IS '退款金额';
COMMENT ON COLUMN payment_transactions.refunded_at IS '退款时间';

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_payment_method ON payment_transactions(payment_method);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_payment_time ON payment_transactions(payment_time);

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 退款记录表
CREATE TABLE refund_records (
    id BIGSERIAL PRIMARY KEY,
    refund_id VARCHAR(64) NOT NULL UNIQUE,
    transaction_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(32),
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status refund_status_enum NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP,
    failure_reason TEXT,
    external_refund_id VARCHAR(128),
    gateway_response JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE refund_records IS '退款记录表';
COMMENT ON COLUMN refund_records.id IS '退款ID';
COMMENT ON COLUMN refund_records.refund_id IS '退款号';
COMMENT ON COLUMN refund_records.transaction_id IS '原交易号';
COMMENT ON COLUMN refund_records.order_id IS '订单号';
COMMENT ON COLUMN refund_records.amount IS '退款金额';
COMMENT ON COLUMN refund_records.reason IS '退款原因';
COMMENT ON COLUMN refund_records.status IS '状态';
COMMENT ON COLUMN refund_records.processed_at IS '处理时间';
COMMENT ON COLUMN refund_records.failure_reason IS '失败原因';
COMMENT ON COLUMN refund_records.external_refund_id IS '外部退款号';
COMMENT ON COLUMN refund_records.gateway_response IS '网关响应';

CREATE INDEX idx_refund_records_transaction_id ON refund_records(transaction_id);
CREATE INDEX idx_refund_records_order_id ON refund_records(order_id);
CREATE INDEX idx_refund_records_status ON refund_records(status);
CREATE INDEX idx_refund_records_processed_at ON refund_records(processed_at);

CREATE TRIGGER update_refund_records_updated_at
    BEFORE UPDATE ON refund_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 10. 系统相关表
-- ================================

-- 系统配置表
CREATE TABLE system_configs (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description VARCHAR(255),
    type config_type_enum NOT NULL DEFAULT 'string',
    category VARCHAR(50),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_configs IS '系统配置表';
COMMENT ON COLUMN system_configs.id IS '配置ID';
COMMENT ON COLUMN system_configs.key IS '配置键';
COMMENT ON COLUMN system_configs.value IS '配置值';
COMMENT ON COLUMN system_configs.description IS '描述';
COMMENT ON COLUMN system_configs.type IS '数据类型';
COMMENT ON COLUMN system_configs.category IS '配置分类';
COMMENT ON COLUMN system_configs.is_public IS '是否公开';
COMMENT ON COLUMN system_configs.sort_order IS '排序';

CREATE INDEX idx_system_configs_category ON system_configs(category);
CREATE INDEX idx_system_configs_is_public ON system_configs(is_public);

CREATE TRIGGER update_system_configs_updated_at
    BEFORE UPDATE ON system_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 操作日志表
CREATE TABLE operation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    username VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    resource_name VARCHAR(255),
    method http_method_enum,
    path VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    duration INTEGER,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE operation_logs IS '操作日志表';
COMMENT ON COLUMN operation_logs.id IS '日志ID';
COMMENT ON COLUMN operation_logs.user_id IS '用户ID';
COMMENT ON COLUMN operation_logs.username IS '用户名';
COMMENT ON COLUMN operation_logs.action IS '操作动作';
COMMENT ON COLUMN operation_logs.resource_type IS '资源类型';
COMMENT ON COLUMN operation_logs.resource_id IS '资源ID';
COMMENT ON COLUMN operation_logs.resource_name IS '资源名称';
COMMENT ON COLUMN operation_logs.method IS 'HTTP方法';
COMMENT ON COLUMN operation_logs.path IS '请求路径';
COMMENT ON COLUMN operation_logs.ip_address IS 'IP地址';
COMMENT ON COLUMN operation_logs.user_agent IS '用户代理';
COMMENT ON COLUMN operation_logs.request_data IS '请求数据';
COMMENT ON COLUMN operation_logs.response_data IS '响应数据';
COMMENT ON COLUMN operation_logs.status_code IS '状态码';
COMMENT ON COLUMN operation_logs.duration IS '耗时(毫秒)';
COMMENT ON COLUMN operation_logs.error_message IS '错误信息';

CREATE INDEX idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_action ON operation_logs(action);
CREATE INDEX idx_operation_logs_resource_type ON operation_logs(resource_type);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at);

-- 数据字典表
CREATE TABLE data_dictionaries (
    id BIGSERIAL PRIMARY KEY,
    group_code VARCHAR(50) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_value VARCHAR(255),
    description VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_code, item_code)
);

COMMENT ON TABLE data_dictionaries IS '数据字典表';
COMMENT ON COLUMN data_dictionaries.id IS '字典ID';
COMMENT ON COLUMN data_dictionaries.group_code IS '分组编码';
COMMENT ON COLUMN data_dictionaries.group_name IS '分组名称';
COMMENT ON COLUMN data_dictionaries.item_code IS '项目编码';
COMMENT ON COLUMN data_dictionaries.item_name IS '项目名称';
COMMENT ON COLUMN data_dictionaries.item_value IS '项目值';
COMMENT ON COLUMN data_dictionaries.description IS '描述';
COMMENT ON COLUMN data_dictionaries.sort_order IS '排序';
COMMENT ON COLUMN data_dictionaries.is_active IS '是否启用';

CREATE INDEX idx_data_dictionaries_group_code ON data_dictionaries(group_code);
CREATE INDEX idx_data_dictionaries_sort_order ON data_dictionaries(sort_order);

CREATE TRIGGER update_data_dictionaries_updated_at
    BEFORE UPDATE ON data_dictionaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 11. 插入初始数据
-- ================================

-- 插入默认角色
INSERT INTO roles (name, display_name, description, permissions, is_system) VALUES
('super_admin', '超级管理员', '系统超级管理员，拥有所有权限', '["*"]'::JSONB, TRUE),
('admin', '管理员', '系统管理员，拥有大部分权限', '["users.*","orders.*","menu.*","reports.*","system.settings"]'::JSONB, TRUE),
('manager', '经理', '门店经理，拥有门店相关权限', '["orders.*","menu.*","reports.*"]'::JSONB, TRUE),
('staff', '员工', '普通员工，基础操作权限', '["orders.create","orders.update","menu.read"]'::JSONB, TRUE);

-- 插入默认会员等级
INSERT INTO member_levels (name, description, icon, color, min_points, discount_rate, points_rate, benefits, sort_order) VALUES
('普通会员', '注册用户默认等级', 'bronze', '#CD7F32', 0, 1.0000, 1.0000, '["生日礼券", "会员活动"]'::JSONB, 1),
('银卡会员', '消费满1000元升级', 'silver', '#C0C0C0', 100, 0.9500, 1.2000, '["9.5折优惠", "生日礼券", "会员活动", "优先服务"]'::JSONB, 2),
('金卡会员', '消费满5000元升级', 'gold', '#FFD700', 500, 0.9000, 1.5000, '["9折优惠", "生日礼券", "会员活动", "优先服务", "专属客服"]'::JSONB, 3),
('钻石会员', '消费满20000元升级', 'diamond', '#B9F2FF', 2000, 0.8500, 2.0000, '["8.5折优惠", "生日礼券", "会员活动", "优先服务", "专属客服", "免费配送"]'::JSONB, 4);

-- 插入默认系统配置
INSERT INTO system_configs (key, value, description, type, category, is_public) VALUES
('site_name', 'YYC³餐饮管理系统', '网站名称', 'string', 'basic', TRUE),
('site_description', '专业的餐饮行业智能化管理平台', '网站描述', 'string', 'basic', TRUE),
('system_timezone', 'Asia/Shanghai', '系统时区', 'string', 'basic', FALSE),
('system_currency', 'CNY', '系统货币', 'string', 'basic', TRUE),
('order_auto_confirm_minutes', '5', '订单自动确认时间(分钟)', 'number', 'order', FALSE),
('order_auto_cancel_minutes', '15', '订单自动取消时间(分钟)', 'number', 'order', FALSE),
('points_rate', '100', '消费1元获得积分', 'number', 'member', TRUE),
('points_to_money_rate', '100', '100积分抵扣1元', 'number', 'member', TRUE);

-- 插入数据字典
INSERT INTO data_dictionaries (group_code, group_name, item_code, item_name, item_value, description, sort_order) VALUES
('order_status', '订单状态', 'pending', '待确认', 'pending', '订单已创建，等待确认', 1),
('order_status', '订单状态', 'confirmed', '已确认', 'confirmed', '订单已确认，开始准备', 2),
('order_status', '订单状态', 'preparing', '制作中', 'preparing', '正在制作菜品', 3),
('order_status', '订单状态', 'ready', '已完成', 'ready', '菜品制作完成', 4),
('order_status', '订单状态', 'serving', '上菜中', 'serving', '正在上菜', 5),
('order_status', '订单状态', 'completed', '已完成', 'completed', '订单已完成', 6),
('order_status', '订单状态', 'cancelled', '已取消', 'cancelled', '订单已取消', 7),
('order_status', '订单状态', 'refunded', '已退款', 'refunded', '订单已退款', 8);

-- ================================
-- 完成
-- ================================

-- 输出完成信息
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'YYC³餐饮行业智能化平台数据库初始化完成';
    RAISE NOTICE '========================================';
    RAISE NOTICE '数据库版本: v1.0.0';
    RAISE NOTICE '创建时间: 2025-12-28';
    RAISE NOTICE '========================================';
END $$;
