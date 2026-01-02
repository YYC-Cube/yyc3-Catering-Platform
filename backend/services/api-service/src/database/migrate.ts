/**
 * @fileoverview YYC³数据库迁移脚本
 * @description 创建数据库表结构和初始化数据
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { dbManager } from '../config/database';

/**
 * 数据库迁移类
 */
export class DatabaseMigration {
  /**
   * 执行数据库迁移
   */
  async run(): Promise<void> {
    console.log('🚀 开始数据库迁移...');

    try {
      // 初始化数据库连接
      await dbManager.createPool();

      await this.createTables();
      await this.createIndexes();
      await this.seedData();
      console.log('✅ 数据库迁移完成！');
    } catch (error) {
      console.error('❌ 数据库迁移失败:', error);
      throw error;
    } finally {
      // 关闭数据库连接
      await dbManager.close();
    }
  }

  /**
   * 创建数据表
   */
  private async createTables(): Promise<void> {
    console.log('📝 创建数据表...');

    const tables = [
      // 用户表
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar_url VARCHAR(500),
        role VARCHAR(50) DEFAULT 'customer',
        status VARCHAR(20) DEFAULT 'active',
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 餐厅表
      `CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        logo_url VARCHAR(500),
        cover_image_url VARCHAR(500),
        address TEXT NOT NULL,
        coordinates POINT,
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(500),
        opening_hours JSONB DEFAULT '{}',
        cuisine_type VARCHAR(100),
        price_range INTEGER CHECK (price_range >= 1 AND price_range <= 5),
        rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        status VARCHAR(20) DEFAULT 'active',
        features JSONB DEFAULT '[]',
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 菜品分类表
      `CREATE TABLE IF NOT EXISTS menu_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id UUID,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url VARCHAR(500),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 菜品表
      `CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id UUID,
        category_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        images JSONB DEFAULT '[]',
        price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        original_price DECIMAL(10,2) CHECK (original_price >= 0),
        spicy_level VARCHAR(20) DEFAULT 'none',
        prep_time INTEGER DEFAULT 0 CHECK (prep_time >= 0),
        tags JSONB DEFAULT '[]',
        ingredients JSONB DEFAULT '[]',
        allergens JSONB DEFAULT '[]',
        nutrition JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'available',
        sort_order INTEGER DEFAULT 0,
        is_recommended BOOLEAN DEFAULT false,
        is_popular BOOLEAN DEFAULT false,
        is_new BOOLEAN DEFAULT false,
        is_seasonal BOOLEAN DEFAULT false,
        season_start DATE,
        season_end DATE,
        rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 菜品选项表
      `CREATE TABLE IF NOT EXISTS menu_item_options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id UUID,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) DEFAULT 'single', -- single, multiple
        required BOOLEAN DEFAULT false,
        max_choices INTEGER,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 选项选择表
      `CREATE TABLE IF NOT EXISTS menu_option_choices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        option_id UUID,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT true
      )`,

      // 订单表
      `CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id),
        order_type VARCHAR(20) DEFAULT 'dine_in', -- dine_in, takeaway, delivery
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        items JSONB NOT NULL DEFAULT '[]',
        price_breakdown JSONB NOT NULL DEFAULT '{}',
        delivery_info JSONB,
        scheduled_time TIMESTAMP WITH TIME ZONE,
        estimated_ready_time TIMESTAMP WITH TIME ZONE,
        actual_ready_time TIMESTAMP WITH TIME ZONE,
        delivery_start_time TIMESTAMP WITH TIME ZONE,
        delivery_end_time TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        source VARCHAR(20) DEFAULT 'web', -- web, mobile, mini_program, phone, in_store
        promo_code VARCHAR(50),
        promo_discount DECIMAL(10,2) DEFAULT 0,
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 订单评价表
      `CREATE TABLE IF NOT EXISTS order_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID,
        customer_id UUID,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        food_quality INTEGER CHECK (food_quality >= 1 AND food_quality <= 5),
        service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
        delivery_quality INTEGER CHECK (delivery_quality >= 1 AND delivery_quality <= 5),
        images JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 订单操作日志表
      `CREATE TABLE IF NOT EXISTS order_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        operator_id UUID,
        operator_name VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 配送员表
      `CREATE TABLE IF NOT EXISTS delivery_personnel (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        avatar_url VARCHAR(500),
        rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        delivery_count INTEGER DEFAULT 0,
        current_location POINT,
        status VARCHAR(20) DEFAULT 'available', -- available, busy, offline
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 配送分配表
      `CREATE TABLE IF NOT EXISTS order_delivery_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID,
        delivery_personnel_id UUID,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        estimated_delivery_time TIMESTAMP WITH TIME ZONE,
        actual_delivery_time TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'assigned' -- assigned, picked_up, delivering, delivered
      )`
    ];

    for (const sql of tables) {
      await dbManager.query(sql);
    }

    console.log('✅ 数据表创建完成');
  }

  /**
   * 创建索引
   */
  private async createIndexes(): Promise<void> {
    console.log('🔍 创建数据库索引...');

    const indexes = [
      // 用户表索引
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',

      // 餐厅表索引
      'CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name)',
      'CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type)',
      'CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status)',
      'CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants USING GIST(coordinates)',

      // 菜品表索引
      'CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_status ON menu_items(status)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_tags ON menu_items USING GIN(tags)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_ingredients ON menu_items USING GIN(ingredients)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_rating ON menu_items(rating)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_popular ON menu_items(is_popular, rating)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_recommended ON menu_items(is_recommended, rating)',

      // 订单表索引
      'CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)',
      'CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)',
      "CREATE INDEX IF NOT EXISTS idx_orders_total ON orders USING GIN((price_breakdown->'total'))",

      // 配送员表索引
      'CREATE INDEX IF NOT EXISTS idx_delivery_personnel_phone ON delivery_personnel(phone)',
      'CREATE INDEX IF NOT EXISTS idx_delivery_personnel_status ON delivery_personnel(status)',
      'CREATE INDEX IF NOT EXISTS idx_delivery_personnel_location ON delivery_personnel USING GIST(current_location)',
      
      // 性能优化索引 - 2025-01-09
      
      // 1. 菜品分类表索引优化
      'CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant_id ON menu_categories(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_categories_sort_order ON menu_categories(sort_order)',
      'CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active)',
      
      // 2. 菜品表索引优化（补充）
      'CREATE INDEX IF NOT EXISTS idx_menu_items_updated_at ON menu_items(updated_at)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_status_restaurant_id ON menu_items(status, restaurant_id)',
      
      // 3. 订单表索引优化（补充）
      'CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status_payment_status ON orders(status, payment_status)',
      
      // 4. 订单评价表索引优化
      'CREATE INDEX IF NOT EXISTS idx_order_reviews_order_id ON order_reviews(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_reviews_customer_id ON order_reviews(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_reviews_created_at ON order_reviews(created_at)',
      
      // 5. 订单操作日志表索引优化
      'CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_logs(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_logs_action ON order_logs(action)',
      'CREATE INDEX IF NOT EXISTS idx_order_logs_timestamp ON order_logs(timestamp)',
      
      // 6. 配送分配表索引优化
      'CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_order_id ON order_delivery_assignments(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_delivery_personnel_id ON order_delivery_assignments(delivery_personnel_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_status ON order_delivery_assignments(status)',
      'CREATE INDEX IF NOT EXISTS idx_order_delivery_assignments_assigned_at ON order_delivery_assignments(assigned_at)',
      
      // 7. 菜品选项相关索引优化
      'CREATE INDEX IF NOT EXISTS idx_menu_item_options_menu_item_id ON menu_item_options(menu_item_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_item_options_sort_order ON menu_item_options(sort_order)',
      'CREATE INDEX IF NOT EXISTS idx_menu_option_choices_option_id ON menu_option_choices(option_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_option_choices_is_available ON menu_option_choices(is_available)',
      'CREATE INDEX IF NOT EXISTS idx_menu_option_choices_sort_order ON menu_option_choices(sort_order)'
    ];

    for (const sql of indexes) {
      await dbManager.query(sql);
    }

    console.log('✅ 数据库索引创建完成');
  }

  /**
   * 初始化数据
   */
  private async seedData(): Promise<void> {
    console.log('🌱 初始化基础数据...');

    // 检查是否已经有数据
    const userCount = await dbManager.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('ℹ️ 数据库已有数据，跳过初始化');
      return;
    }

    // 创建默认管理员用户
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123456', 10);

    await dbManager.query(`
      INSERT INTO users (email, phone, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['admin@0379.love', '13800138000', hashedPassword, 'YYC³', '管理员', 'admin']);

    // 创建示例餐厅
    const restaurantResult = await dbManager.query(`
      INSERT INTO restaurants (name, description, address, phone, email, cuisine_type, price_range, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      'YYC³ 智能餐厅',
      '融合传统与现代的智能餐饮体验',
      '北京市朝阳区建国路88号',
      '010-88888888',
      'restaurant@0379.love',
      '融合菜',
      3,
      (await dbManager.query('SELECT id FROM users WHERE email = $1', ['admin@0379.love'])).rows[0].id
    ]);

    const restaurantId = restaurantResult.rows[0].id;

    // 创建菜品分类
    const categories = [
      { name: '开胃菜', description: '精致开胃，开启美食之旅' },
      { name: '汤品', description: '滋补汤品，温暖身心' },
      { name: '主菜', description: '招牌主菜，匠心制作' },
      { name: '甜品', description: '精致甜品，完美收尾' },
      { name: '饮品', description: '特色饮品，清爽解腻' }
    ];

    for (const category of categories) {
      await dbManager.query(`
        INSERT INTO menu_categories (restaurant_id, name, description)
        VALUES ($1, $2, $3)
      `, [restaurantId, category.name, category.description]);
    }

    console.log('✅ 基础数据初始化完成');
  }
}

// 执行迁移
if (import.meta.main) {
  const migration = new DatabaseMigration();
  migration.run()
    .then(() => {
      console.log('🎉 数据库迁移成功完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 数据库迁移失败:', error);
      process.exit(1);
    });
}

