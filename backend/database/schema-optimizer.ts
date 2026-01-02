/**
 * @file 数据库Schema优化脚本
 * @description 优化数据库表结构、索引和约束
 * @module database
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Pool } from 'pg';
import { logger } from '../libs/logger';

/**
 * 数据库Schema优化类
 */
export class SchemaOptimizer {
  constructor(private pool: Pool) {}

  /**
   * 执行所有优化
   */
  public async optimize(): Promise<void> {
    logger.info('Starting database schema optimization');

    try {
      await this.createIndexes();
      await this.createConstraints();
      await this.createViews();
      await this.createFunctions();
      await this.analyzeTables();

      logger.info('Database schema optimization completed successfully');
    } catch (error) {
      logger.error('Database schema optimization failed', error);
      throw error;
    }
  }

  /**
   * 创建性能优化索引
   */
  private async createIndexes(): Promise<void> {
    const indexes = [
      // 用户表索引
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)',

      // 门店表索引
      'CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id)',
      'CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status)',
      'CREATE INDEX IF NOT EXISTS idx_stores_location ON stores USING GIST(location)',
      'CREATE INDEX IF NOT EXISTS idx_stores_business_hours ON stores(business_hours)',

      // 菜单项表索引
      'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_store ON menu_items(store_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_availability ON menu_items(is_available)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_price ON menu_items(price)',

      // 订单表索引
      'CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_orders_delivery_time ON orders(delivery_time)',

      // 订单项表索引
      'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_items_menu ON order_items(menu_item_id)',

      // 复合索引
      'CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_store_category ON menu_items(store_id, category_id, is_available)',
    ];

    for (const indexSql of indexes) {
      try {
        await this.pool.query(indexSql);
        logger.debug(`Index created: ${indexSql.split('idx_')[1]?.split(' ')[0]}`);
      } catch (error) {
        logger.warn(`Failed to create index: ${indexSql}`, error);
      }
    }
  }

  /**
   * 创建约束
   */
  private async createConstraints(): Promise<void> {
    const constraints = [
      // 外键约束
      'ALTER TABLE stores ADD CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE',
      'ALTER TABLE menu_items ADD CONSTRAINT fk_menu_items_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE',
      'ALTER TABLE menu_items ADD CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL',
      'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE',
      'ALTER TABLE orders ADD CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE',
      'ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE',
      'ALTER TABLE order_items ADD CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT',

      // 检查约束
      'ALTER TABLE users ADD CONSTRAINT chk_users_email CHECK (email ~* \'^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$\')',
      'ALTER TABLE users ADD CONSTRAINT chk_users_phone CHECK (phone_number ~* \'^\\+?[1-9]\\d{1,14}$\')',
      'ALTER TABLE menu_items ADD CONSTRAINT chk_menu_items_price CHECK (price >= 0)',
      'ALTER TABLE orders ADD CONSTRAINT chk_orders_total CHECK (total_amount >= 0)',
      'ALTER TABLE orders ADD CONSTRAINT chk_orders_status CHECK (status IN (\'pending\', \'confirmed\', \'preparing\', \'ready\', \'delivering\', \'completed\', \'cancelled\'))',
    ];

    for (const constraintSql of constraints) {
      try {
        await this.pool.query(constraintSql);
        logger.debug(`Constraint created successfully`);
      } catch (error) {
        if (error.code !== '42P07') { // 忽略已存在的约束
          logger.warn(`Failed to create constraint: ${constraintSql}`, error);
        }
      }
    }
  }

  /**
   * 创建视图
   */
  private async createViews(): Promise<void> {
    const views = [
      // 门店统计视图
      `CREATE OR REPLACE VIEW store_statistics AS
       SELECT
         s.id,
         s.name,
         s.status,
         COUNT(DISTINCT o.id) as total_orders,
         COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
         SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
         AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END) as average_order_value,
         COUNT(DISTINCT mi.id) as menu_items_count
       FROM stores s
       LEFT JOIN orders o ON s.id = o.store_id
       LEFT JOIN menu_items mi ON s.id = mi.store_id
       GROUP BY s.id, s.name, s.status`,

      // 热门菜单项视图
      `CREATE OR REPLACE VIEW popular_menu_items AS
       SELECT
         mi.id,
         mi.name,
         mi.store_id,
         s.name as store_name,
         mi.price,
         COUNT(oi.id) as order_count,
         SUM(oi.quantity) as total_quantity
       FROM menu_items mi
       JOIN stores s ON mi.store_id = s.id
       LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
       WHERE mi.is_available = true
       GROUP BY mi.id, mi.name, mi.store_id, s.name, mi.price
       ORDER BY total_quantity DESC`,

      // 客户订单统计视图
      `CREATE OR REPLACE VIEW customer_order_statistics AS
       SELECT
         u.id,
         u.name,
         u.email,
         COUNT(DISTINCT o.id) as total_orders,
         SUM(o.total_amount) as total_spent,
         AVG(o.total_amount) as average_order_value,
         MAX(o.created_at) as last_order_date
       FROM users u
       LEFT JOIN orders o ON u.id = o.customer_id
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name, u.email`,
    ];

    for (const viewSql of views) {
      try {
        await this.pool.query(viewSql);
        logger.debug(`View created successfully`);
      } catch (error) {
        logger.warn(`Failed to create view: ${viewSql}`, error);
      }
    }
  }

  /**
   * 创建存储函数
   */
  private async createFunctions(): Promise<void> {
    const functions = [
      // 计算订单总金额函数
      `CREATE OR REPLACE FUNCTION calculate_order_total(order_id UUID)
       RETURNS NUMERIC AS $$
       DECLARE
         total NUMERIC := 0;
       BEGIN
         SELECT SUM(oi.quantity * mi.price) INTO total
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = order_id;
         RETURN COALESCE(total, 0);
       END;
       $$ LANGUAGE plpgsql;`,

      // 更新订单状态函数
      `CREATE OR REPLACE FUNCTION update_order_status(order_id UUID, new_status VARCHAR)
       RETURNS BOOLEAN AS $$
       BEGIN
         UPDATE orders
         SET status = new_status,
             updated_at = NOW()
         WHERE id = order_id;
         RETURN FOUND;
       END;
       $$ LANGUAGE plpgsql;`,

      // 获取门店可用菜单项函数
      `CREATE OR REPLACE FUNCTION get_available_menu_items(store_id UUID)
       RETURNS TABLE (
         id UUID,
         name VARCHAR,
         description TEXT,
         price NUMERIC,
         category_id UUID,
         image_url VARCHAR
       ) AS $$
       BEGIN
         RETURN QUERY
         SELECT mi.id, mi.name, mi.description, mi.price, mi.category_id, mi.image_url
         FROM menu_items mi
         WHERE mi.store_id = store_id AND mi.is_available = true
         ORDER BY mi.category_id, mi.name;
       END;
       $$ LANGUAGE plpgsql;`,
    ];

    for (const funcSql of functions) {
      try {
        await this.pool.query(funcSql);
        logger.debug(`Function created successfully`);
      } catch (error) {
        logger.warn(`Failed to create function: ${funcSql}`, error);
      }
    }
  }

  /**
   * 分析表统计信息
   */
  private async analyzeTables(): Promise<void> {
    const tables = [
      'users',
      'roles',
      'user_roles',
      'user_sessions',
      'stores',
      'store_staff',
      'menu_categories',
      'menu_items',
      'orders',
      'order_items',
    ];

    for (const table of tables) {
      try {
        await this.pool.query(`ANALYZE ${table}`);
        logger.debug(`Table analyzed: ${table}`);
      } catch (error) {
        logger.warn(`Failed to analyze table: ${table}`, error);
      }
    }
  }

  /**
   * 获取表统计信息
   */
  public async getTableStats(): Promise<any[]> {
    const query = `
      SELECT
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      ORDER BY schemaname, tablename
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  /**
   * 获取索引使用统计
   */
  public async getIndexStats(): Promise<any[]> {
    const query = `
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      ORDER BY schemaname, tablename, indexname
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  /**
   * 获取查询性能统计
   */
  public async getQueryStats(): Promise<any[]> {
    const query = `
      SELECT
        query,
        calls,
        total_time,
        mean_time,
        max_time,
        stddev_time
      FROM pg_stat_statements
      ORDER BY total_time DESC
      LIMIT 20
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.warn('pg_stat_statements extension not available');
      return [];
    }
  }
}

/**
 * 执行数据库优化
 */
export const optimizeDatabase = async (pool: Pool): Promise<void> => {
  const optimizer = new SchemaOptimizer(pool);
  await optimizer.optimize();
};
