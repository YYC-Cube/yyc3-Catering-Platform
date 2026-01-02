-- YYC³餐饮行业智能化平台 - 核心业务表结构
-- 版本: 1.0.0
-- 创建时间: 2024-01-01

-- 扩展用户状态枚举
CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending_verification'
);

-- 扩展用户角色枚举
CREATE TYPE user_role AS ENUM (
    'customer',
    'staff',
    'chef',
    'manager',
    'admin',
    'super_admin'
);

-- 预约状态枚举
CREATE TYPE reservation_status AS ENUM (
    'pending',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled',
    'no_show'
);

-- 订单状态枚举
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'serving',
    'completed',
    'cancelled',
    'refunded'
);

-- 支付状态枚举
CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
);

-- 预约方式枚举
CREATE TYPE reservation_method AS ENUM (
    'online',
    'phone',
    'walk_in',
    'app'
);

-- 座位类型枚举
CREATE TYPE table_type AS ENUM (
    'regular',
    'booth',
    'private_room',
    'bar',
    'outdoor',
    'vip'
);

-- 餐厅信息表
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    cuisine_type VARCHAR(100),
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    opening_hours JSONB, -- 营业时间配置
    capacity INTEGER NOT NULL DEFAULT 100,
    average_price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.0,
    features JSONB, -- 特色标签：['WiFi', '停车', '包间', '室外座位']
    images JSONB, -- 餐厅图片URL数组
    status VARCHAR(20) DEFAULT 'active',
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户扩展表
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    avatar_url VARCHAR(500),
    preferences JSONB, -- 饮食偏好：['素食', '无辣', '清真']
    allergies JSONB, -- 过敏信息：['花生', '海鲜']
    favorite_dishes JSONB, -- 最喜欢的菜品ID数组
    dietary_restrictions JSONB, -- 饮食限制
    loyalty_points INTEGER DEFAULT 0,
    membership_level VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    last_visit_at TIMESTAMPTZ,
    is_vip BOOLEAN DEFAULT FALSE,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 菜品表
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- 原价（用于显示折扣）
    cost_price DECIMAL(10,2), -- 成本价
    calories INTEGER,
    prep_time INTEGER, -- 准备时间（分钟）
    cooking_time INTEGER, -- 烹饪时间（分钟）
    complexity_score INTEGER DEFAULT 1, -- 复杂度评分 1-5
    spice_level INTEGER DEFAULT 0, -- 辣度等级 0-5
    is_signature BOOLEAN DEFAULT FALSE, -- 是否招牌菜
    is_recommended BOOLEAN DEFAULT FALSE, -- 是否推荐
    is_available BOOLEAN DEFAULT TRUE,
    allergens JSONB, -- 过敏原信息
    ingredients JSONB, -- 主要食材
    nutrition_info JSONB, -- 营养信息
    dietary_tags JSONB, -- 饮食标签：['素食', '低卡', '无麸质']
    preparation_method TEXT, -- 制作方法
    storage_requirements JSONB, -- 储存要求
    required_equipment JSONB, -- 所需设备
    popularity_score DECIMAL(5,2) DEFAULT 0.0, -- 人气评分
    order_count INTEGER DEFAULT 0, -- 点单次数
    rating DECIMAL(3,2) DEFAULT 0.0, -- 平均评分
    rating_count INTEGER DEFAULT 0, -- 评分人数
    price_tier VARCHAR(20), -- 价格档次：'budget', 'medium', 'premium'
    menu_section VARCHAR(100), -- 菜单分区
    seasonal_availability JSONB, -- 季节可用性
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 餐桌表
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL,
    table_type table_type NOT NULL DEFAULT 'regular',
    capacity INTEGER NOT NULL DEFAULT 4,
    min_capacity INTEGER DEFAULT 1,
    location VARCHAR(100), -- 位置：'靠窗', '包间', '大厅', '户外'
    features JSONB, -- 桌子特色：['可移动', '儿童椅', '充电口']
    is_accessible BOOLEAN DEFAULT FALSE, -- 是否无障碍
    is_smoking_allowed BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'available', -- available, occupied, reserved, maintenance
    qr_code_url VARCHAR(500), -- 桌码二维码URL
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, table_number)
);

-- 预约表
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    reservation_code VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    party_size INTEGER NOT NULL,
    reservation_time TIMESTAMPTZ NOT NULL,
    estimated_duration INTEGER DEFAULT 120, -- 预估用餐时长（分钟）
    actual_arrival_time TIMESTAMPTZ,
    actual_departure_time TIMESTAMPTZ,
    status reservation_status NOT NULL DEFAULT 'pending',
    reservation_method reservation_method DEFAULT 'online',
    special_requests TEXT,
    preferences JSONB, -- 偏好：['靠窗', '安静', '儿童椅']
    occasion VARCHAR(100), -- 场合：'生日', '纪念日', '商务'
    notes TEXT,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00, -- 押金
    deposit_status VARCHAR(20) DEFAULT 'none', -- none, paid, refunded
    cancellation_reason TEXT,
    cancelled_by VARCHAR(100), -- customer, restaurant, system
    cancellation_time TIMESTAMPTZ,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    no_show_reason TEXT,
    ai_confidence_score DECIMAL(5,4), -- AI推荐信心分数
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_type VARCHAR(20) NOT NULL, -- dine_in, takeaway, delivery
    status order_status NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 1, -- 优先级 1-5
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    service_charge DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(100),
    order_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estimated_ready_time TIMESTAMPTZ,
    actual_ready_time TIMESTAMPTZ,
    delivery_address JSONB, -- 配送地址
    delivery_contact VARCHAR(255), -- 配送联系人
    delivery_phone VARCHAR(20),
    special_instructions TEXT,
    kitchen_notes TEXT, -- 厨房备注
    allergy_alerts JSONB, -- 过敏提醒
    assigned_chef_id UUID,
    cooking_start_time TIMESTAMPTZ,
    cooking_end_time TIMESTAMPTZ,
    preparation_time INTEGER, -- 实际准备时间（分钟）
    is_rush_order BOOLEAN DEFAULT FALSE,
    source VARCHAR(50), -- 订单来源：'app', 'web', 'phone', 'walk_in'
    device_info JSONB, -- 设备信息
    promotion_code VARCHAR(100),
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_used INTEGER DEFAULT 0,
    rating INTEGER, -- 1-5星评分
    review TEXT,
    review_time TIMESTAMPTZ,
    ai_recommendations JSONB, -- AI推荐记录
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单菜品详情表
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    dish_id UUID NOT NULL REFERENCES dishes(id),
    dish_name VARCHAR(255) NOT NULL, -- 冗余字段，防止菜品信息变更
    dish_price DECIMAL(10,2) NOT NULL, -- 下单时的价格
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    special_instructions TEXT,
    customization JSONB, -- 定制要求：['少盐', '不要香菜']
    addons JSONB, -- 加料信息
    removed_ingredients JSONB, -- 去掉的食材
    cooking_preference VARCHAR(100), -- 烹饪偏好：'全熟', '五分熟'
    spice_level INTEGER DEFAULT 0, -- 定制辣度
    is_available BOOLEAN DEFAULT TRUE,
    unavailable_reason TEXT,
    kitchen_status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
    kitchen_notes TEXT,
    preparation_time INTEGER, -- 实际制作时间（分钟）
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 菜品推荐记录表
CREATE TABLE dish_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    dish_id UUID NOT NULL REFERENCES dishes(id),
    recommendation_type VARCHAR(50) NOT NULL, -- personal, popular, seasonal, complementary
    recommendation_score DECIMAL(5,4) NOT NULL,
    recommendation_reason TEXT,
    context JSONB, -- 推荐上下文：{mealTime, weather, groupSize, occasion}
    algorithm_version VARCHAR(20), -- 推荐算法版本
    was_accepted BOOLEAN DEFAULT NULL, -- 是否被接受
    accepted_at TIMESTAMPTZ,
    order_id UUID REFERENCES orders(id), -- 如果被接受，关联的订单
    feedback INTEGER, -- 反馈评分 1-5
    feedback_text TEXT,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 厨房操作记录表
CREATE TABLE kitchen_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    chef_id UUID,
    operation_type VARCHAR(50) NOT NULL, -- start_cooking, finish_cooking, quality_check
    equipment_used JSONB, -- 使用的设备
    temperature_readings JSONB, -- 温度记录
    quality_score INTEGER, -- 质量评分 1-5
    notes TEXT,
    duration_minutes INTEGER, -- 操作持续时间
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 食品安全记录表
CREATE TABLE food_safety_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    check_type VARCHAR(50) NOT NULL, -- temperature, freshness, hygiene, compliance
    item_type VARCHAR(50), -- ingredient, equipment, environment, personnel
    item_id UUID,
    check_result VARCHAR(20) NOT NULL, -- pass, warning, fail, critical
    temperature_celsius DECIMAL(5,2),
    humidity_percent DECIMAL(5,2),
    check_value JSONB, -- 检查数值
    standard_value JSONB, -- 标准数值
    deviation_level VARCHAR(20), -- normal, minor, major, critical
    corrective_action TEXT,
    checked_by UUID NOT NULL,
    checker_name VARCHAR(255) NOT NULL,
    checker_role VARCHAR(100),
    notes TEXT,
    photos JSONB, -- 检查照片URL数组
    next_check_time TIMESTAMPTZ,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 食材库存表
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    ingredient_code VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL, -- kg, L, 个, 盒
    current_quantity DECIMAL(12,4) NOT NULL DEFAULT 0,
    min_quantity DECIMAL(12,4), -- 最低库存量
    max_quantity DECIMAL(12,4), -- 最高库存量
    unit_cost DECIMAL(10,2),
    supplier VARCHAR(255),
    storage_location VARCHAR(100),
    storage_temperature_min DECIMAL(5,2),
    storage_temperature_max DECIMAL(5,2),
    shelf_life_days INTEGER,
    expiry_date DATE,
    batch_number VARCHAR(100),
    quality_grade VARCHAR(20), -- A, B, C
    is_perishable BOOLEAN DEFAULT TRUE,
    allergen_info JSONB,
    nutritional_info JSONB,
    last_restocked_at TIMESTAMPTZ,
    last_counted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active', -- active, low_stock, out_of_stock, expired
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_restaurants_tenant_id ON restaurants(tenant_id);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_tenant_id ON customer_profiles(tenant_id);
CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category_id ON dishes(category_id);
CREATE INDEX idx_dishes_availability ON dishes(is_available);
CREATE INDEX idx_dishes_tenant_id ON dishes(tenant_id);
CREATE INDEX idx_tables_restaurant_id ON tables(restaurant_id);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_table_id ON reservations(table_id);
CREATE INDEX idx_reservations_time ON reservations(reservation_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_time ON orders(order_time);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_dish_id ON order_items(dish_id);
CREATE INDEX idx_dish_recommendations_customer_id ON dish_recommendations(customer_id);
CREATE INDEX idx_dish_recommendations_dish_id ON dish_recommendations(dish_id);
CREATE INDEX idx_kitchen_operations_order_id ON kitchen_operations(order_id);
CREATE INDEX idx_food_safety_records_restaurant_id ON food_safety_records(restaurant_id);
CREATE INDEX idx_food_safety_records_check_type ON food_safety_records(check_type);
CREATE INDEX idx_inventory_items_restaurant_id ON inventory_items(restaurant_id);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有相关表创建更新时间触发器
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dish_recommendations_updated_at BEFORE UPDATE ON dish_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_safety_records_updated_at BEFORE UPDATE ON food_safety_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO restaurants (id, name, code, description, cuisine_type, address, phone, capacity, average_price, tenant_id) VALUES
(gen_random_uuid(), 'YYC³智餐厅', 'YYC3-001', '智能化餐饮体验，融合AI推荐与精准服务', '融合菜', '北京市朝阳区三里屯路19号', '010-12345678', 120, 288.00, 'tenant-001');

COMMENT ON TABLE restaurants IS '餐厅信息表';
COMMENT ON TABLE customer_profiles IS '顾客档案表';
COMMENT ON TABLE dishes IS '菜品信息表';
COMMENT ON TABLE tables IS '餐桌信息表';
COMMENT ON TABLE reservations IS '预约记录表';
COMMENT ON TABLE orders IS '订单信息表';
COMMENT ON TABLE order_items IS '订单菜品详情表';
COMMENT ON TABLE dish_recommendations IS '菜品推荐记录表';
COMMENT ON TABLE kitchen_operations IS '厨房操作记录表';
COMMENT ON TABLE food_safety_records IS '食品安全记录表';
COMMENT ON TABLE inventory_items IS '食材库存表';