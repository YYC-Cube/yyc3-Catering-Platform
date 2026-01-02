/**
 * @file 数据库迁移管理工具
 * @description 提供数据库迁移的创建、执行、回滚等功能
 * @module database/migration-manager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-28
 */

import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 迁移记录表名
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * 迁移接口定义
 */
export interface Migration {
  version: string;
  name: string;
  up: string;
  down?: string;
}

/**
 * 迁移记录接口定义
 */
export interface MigrationRecord {
  version: string;
  name: string;
  executed_at: Date;
}

/**
 * 数据库迁移管理器类
 */
export class MigrationManager {
  private pool: Pool;
  private migrationsDir: string;

  constructor(pool: Pool, migrationsDir?: string) {
    this.pool = pool;
    this.migrationsDir = migrationsDir || path.join(__dirname, 'migrations');
  }

  /**
   * 初始化迁移表
   */
  async init(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
          version VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✓ 迁移表初始化完成');
    } finally {
      client.release();
    }
  }

  /**
   * 获取所有迁移文件
   */
  async getMigrations(): Promise<Migration[]> {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const migrations: Migration[] = [];

    for (const file of files) {
      const filePath = path.join(this.migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 提取版本号和名称
      const match = file.match(/^(\d+)_(.+)\.sql$/);
      if (match) {
        const version = match[1];
        const name = match[2].replace(/-/g, ' ');
        
        migrations.push({
          version,
          name,
          up: content,
        });
      }
    }

    return migrations;
  }

  /**
   * 获取已执行的迁移记录
   */
  async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT version, name, executed_at 
        FROM ${MIGRATIONS_TABLE} 
        ORDER BY version
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * 获取待执行的迁移
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const allMigrations = await this.getMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    const executedVersions = new Set(executedMigrations.map(m => m.version));

    return allMigrations.filter(m => !executedVersions.has(m.version));
  }

  /**
   * 执行单个迁移
   */
  async executeMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 执行迁移SQL
      await client.query(migration.up);

      // 记录迁移
      await client.query(`
        INSERT INTO ${MIGRATIONS_TABLE} (version, name)
        VALUES ($1, $2)
      `, [migration.version, migration.name]);

      await client.query('COMMIT');
      console.log(`✓ 迁移执行成功: ${migration.version}_${migration.name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`✗ 迁移执行失败: ${migration.version}_${migration.name}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 执行所有待执行的迁移
   */
  async migrate(): Promise<void> {
    console.log('开始执行数据库迁移...');
    
    await this.init();
    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log('没有待执行的迁移');
      return;
    }

    console.log(`发现 ${pendingMigrations.length} 个待执行的迁移`);

    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }

    console.log('所有迁移执行完成');
  }

  /**
   * 回滚迁移
   */
  async rollback(version?: string): Promise<void> {
    console.log('开始回滚数据库迁移...');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 获取要回滚的迁移
      let targetVersion: string;
      if (version) {
        targetVersion = version;
      } else {
        // 回滚最后一个迁移
        const result = await client.query(`
          SELECT version 
          FROM ${MIGRATIONS_TABLE} 
          ORDER BY version DESC 
          LIMIT 1
        `);
        if (result.rows.length === 0) {
          console.log('没有可回滚的迁移');
          return;
        }
        targetVersion = result.rows[0].version;
      }

      // 删除迁移记录
      await client.query(`
        DELETE FROM ${MIGRATIONS_TABLE} 
        WHERE version = $1
      `, [targetVersion]);

      await client.query('COMMIT');
      console.log(`✓ 迁移回滚成功: ${targetVersion}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('✗ 迁移回滚失败', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 显示迁移状态
   */
  async status(): Promise<void> {
    console.log('\n数据库迁移状态:');
    console.log('='.repeat(60));

    const allMigrations = await this.getMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    const executedVersions = new Set(executedMigrations.map(m => m.version));

    console.log('\n已执行的迁移:');
    for (const migration of allMigrations.filter(m => executedVersions.has(m.version))) {
      const record = executedMigrations.find(r => r.version === migration.version);
      console.log(`  ✓ ${migration.version} - ${migration.name} (${record?.executed_at.toLocaleString()})`);
    }

    console.log('\n待执行的迁移:');
    const pendingMigrations = allMigrations.filter(m => !executedVersions.has(m.version));
    if (pendingMigrations.length === 0) {
      console.log('  无');
    } else {
      for (const migration of pendingMigrations) {
        console.log(`  ○ ${migration.version} - ${migration.name}`);
      }
    }

    console.log('\n统计:');
    console.log(`  总迁移数: ${allMigrations.length}`);
    console.log(`  已执行: ${executedMigrations.length}`);
    console.log(`  待执行: ${pendingMigrations.length}`);
    console.log('='.repeat(60));
  }

  /**
   * 创建新的迁移文件
   */
  async createMigration(name: string): Promise<string> {
    const timestamp = Date.now();
    const version = timestamp.toString();
    const fileName = `${version}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
    const filePath = path.join(this.migrationsDir, fileName);

    const template = `-- YYC³餐饮行业智能化平台 - 数据库迁移
-- 版本: ${version}
-- 名称: ${name}
-- 创建时间: ${new Date().toLocaleString()}

-- 在此处编写迁移SQL语句

-- 示例: 创建表
-- CREATE TABLE example (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- 示例: 添加列
-- ALTER TABLE users ADD COLUMN new_column VARCHAR(50);

-- 示例: 创建索引
-- CREATE INDEX idx_example_name ON example(name);

-- 完成信息
DO $$
BEGIN
    RAISE NOTICE '迁移执行完成: ${name}';
END $$;
`;

    fs.writeFileSync(filePath, template, 'utf-8');
    console.log(`✓ 迁移文件创建成功: ${fileName}`);
    return filePath;
  }
}

/**
 * 创建迁移管理器实例
 */
export async function createMigrationManager(): Promise<MigrationManager> {
  const { Pool } = await import('pg');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'yyc3_catering',
    user: process.env.DB_USER || 'yanyu',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return new MigrationManager(pool);
}

/**
 * CLI命令行接口
 */
export async function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = await createMigrationManager();

  try {
    switch (command) {
      case 'migrate':
        await manager.migrate();
        break;
      case 'rollback':
        await manager.rollback(args[1]);
        break;
      case 'status':
        await manager.status();
        break;
      case 'create':
        if (!args[1]) {
          console.error('错误: 请指定迁移名称');
          process.exit(1);
        }
        await manager.createMigration(args[1]);
        break;
      default:
        console.log('用法:');
        console.log('  node migration-manager.js migrate     # 执行所有待执行的迁移');
        console.log('  node migration-manager.js rollback    # 回滚最后一个迁移');
        console.log('  node migration-manager.js rollback <version>  # 回滚指定版本的迁移');
        console.log('  node migration-manager.js status      # 显示迁移状态');
        console.log('  node migration-manager.js create <name>  # 创建新的迁移文件');
        process.exit(0);
    }
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI();
}
