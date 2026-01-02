-- 数据库查询性能优化 - 索引创建脚本
-- @file optimize-indexes.sql
-- @description 为现有表添加缺失的索引，提高查询性能
-- @author YYC³
-- @version 1.0.0
-- @created 2025-01-09

-- ================================ --
-- 优化目标：
-- 1. 提升菜品分类查询性能
-- 2. 优化订单搜索和过滤
-- 3. 加速订单评价和日志查询
-- 4. 改进配送分配查询
-- ================================ --

BEGIN;

-- 1. 菜品分类表索引优化
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort_order ON menu_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active);

-- 2. 菜品表索引优化（补充）
CREATE INDEX IF NOT EXISTS idx_menu_items_updated_at ON menu_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_status_restaurant_id ON menu_items(status, restaurant_id);

-- 3. 订单表索引优化（补充）
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders USING GIN (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders USING GIN (customer_phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_payment_status ON orders(status, payment_status);

-- 4. 订单评价表索引优化
CREATE INDEX IF NOT EXISTS idx_order_reviews_order_id ON order_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_order_reviews_customer_id ON order_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_reviews_created_at ON order_reviews(created_at);

-- 5. 订单操作日志表索引优化
CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_logs_action ON order_logs(action);
CREATE INDEX IF NOT EXISTS idx_order_logs_timestamp ON order_logs(timestamp);

-- 6. 配送分配表索引优化
CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_order_id ON order_delivery_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_delivery_personnel_id ON order_delivery_assignments(delivery_personnel_id);
CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_status ON order_delivery_assignments(status);
CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_assigned_at ON order_delivery_assignments(assigned_at);

-- 7. 菜品选项表索引优化
CREATE INDEX IF NOT EXISTS idx_menu_item_options_menu_item_id ON menu_item_options(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_options_sort_order ON menu_item_options(sort_order);

-- 8. 选项选择表索引优化
CREATE INDEX IF NOT EXISTS idx_menu_option_choices_option_id ON menu_option_choices(option_id);
CREATE INDEX IF NOT EXISTS idx_menu_option_choices_is_available ON menu_option_choices(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_option_choices_sort_order ON menu_option_choices(sort_order);

COMMIT;

-- 查看已创建的索引
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;
