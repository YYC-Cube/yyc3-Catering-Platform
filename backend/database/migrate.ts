#!/usr/bin/env bun

/**
 * YYC³餐饮行业智能化平台 - 数据库迁移脚本
 * @author YYC³
 * @version 1.0.0
 */

import { Database } from 'bun:sqlite'
import { join } from 'path'
import { readdirSync, statSync } from 'fs'

// 数据库配置
const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'database', 'data', 'yyc3_catering.db')
const MIGRATIONS_PATH = join(process.cwd(), 'database', 'migrations')

interface Migration {
  id: number
  name: string
  executed_at?: string
}

/**
 * 创建数据库连接
 */
function createConnection(): Database {
  try {
    // 确保数据库目录存在
    const dbDir = join(DB_PATH, '..')
    const fs = require('fs')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    const db = new Database(DB_PATH)

    // 启用外键约束
    db.exec('PRAGMA foreign_keys = ON')

    // 设置WAL模式提高并发性能
    db.exec('PRAGMA journal_mode = WAL')

    return db
  } catch (error) {
    console.error('Failed to create database connection:', error)
    process.exit(1)
  }
}

/**
 * 创建迁移记录表
 */
function createMigrationsTable(db: Database): void {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  db.exec(sql)
}

/**
 * 获取已执行的迁移
 */
function getExecutedMigrations(db: Database): Migration[] {
  try {
    const stmt = db.prepare('SELECT * FROM migrations ORDER BY id')
    return stmt.all() as Migration[]
  } catch (error) {
    return []
  }
}

/**
 * 获取所有迁移文件
 */
function getMigrationFiles(): string[] {
  try {
    const files = readdirSync(MIGRATIONS_PATH)
      .filter(file => file.endsWith('.sql'))
      .sort()

    return files
  } catch (error) {
    console.error('Failed to read migrations directory:', error)
    return []
  }
}

/**
 * 执行单个迁移
 */
async function executeMigration(db: Database, fileName: string): Promise<void> {
  const filePath = join(MIGRATIONS_PATH, fileName)

  try {
    console.log(`Executing migration: ${fileName}`)

    // 读取迁移文件内容
    const migrationContent = await Bun.file(filePath).text()

    if (!migrationContent.trim()) {
      console.log(`Migration ${fileName} is empty, skipping...`)
      return
    }

    // 开始事务
    db.exec('BEGIN TRANSACTION')

    try {
      // 执行迁移SQL
      const statements = migrationContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement)
        }
      }

      // 记录迁移
      const stmt = db.prepare('INSERT INTO migrations (name) VALUES (?)')
      stmt.run(fileName)

      // 提交事务
      db.exec('COMMIT')

      console.log(`✓ Migration ${fileName} executed successfully`)
    } catch (error) {
      // 回滚事务
      db.exec('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error(`✗ Failed to execute migration ${fileName}:`, error)
    throw error
  }
}

/**
 * 回滚单个迁移
 */
async function rollbackMigration(db: Database, fileName: string): Promise<void> {
  const rollbackFileName = fileName.replace('.sql', '_rollback.sql')
  const rollbackPath = join(MIGRATIONS_PATH, 'rollback', rollbackFileName)

  try {
    // 检查回滚文件是否存在
    const fs = require('fs')
    if (!fs.existsSync(rollbackPath)) {
      console.log(`Rollback file for ${fileName} not found, skipping...`)
      return
    }

    console.log(`Rolling back migration: ${fileName}`)

    // 读取回滚文件内容
    const rollbackContent = await Bun.file(rollbackPath).text()

    if (!rollbackContent.trim()) {
      console.log(`Rollback for ${fileName} is empty, skipping...`)
      return
    }

    // 开始事务
    db.exec('BEGIN TRANSACTION')

    try {
      // 执行回滚SQL
      const statements = rollbackContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement)
        }
      }

      // 删除迁移记录
      const stmt = db.prepare('DELETE FROM migrations WHERE name = ?')
      stmt.run(fileName)

      // 提交事务
      db.exec('COMMIT')

      console.log(`✓ Migration ${fileName} rolled back successfully`)
    } catch (error) {
      // 回滚事务
      db.exec('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error(`✗ Failed to rollback migration ${fileName}:`, error)
    throw error
  }
}

/**
 * 运行迁移
 */
async function runMigrations(): Promise<void> {
  console.log('Starting database migrations...')
  console.log(`Database: ${DB_PATH}`)

  const db = createConnection()

  try {
    // 创建迁移记录表
    createMigrationsTable(db)

    // 获取已执行的迁移
    const executedMigrations = getExecutedMigrations(db)
    const executedNames = new Set(executedMigrations.map(m => m.name))

    // 获取所有迁移文件
    const migrationFiles = getMigrationFiles()

    if (migrationFiles.length === 0) {
      console.log('No migration files found.')
      return
    }

    // 执行未执行的迁移
    const pendingMigrations = migrationFiles.filter(file => !executedNames.has(file))

    if (pendingMigrations.length === 0) {
      console.log('All migrations are up to date.')
      return
    }

    console.log(`Found ${pendingMigrations.length} pending migrations:`)
    pendingMigrations.forEach(file => console.log(`  - ${file}`))

    // 逐个执行迁移
    for (const file of pendingMigrations) {
      await executeMigration(db, file)
    }

    console.log('✓ All migrations executed successfully!')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

/**
 * 回滚迁移
 */
async function rollbackMigrations(steps: number = 1): Promise<void> {
  console.log(`Rolling back last ${steps} migration(s)...`)
  console.log(`Database: ${DB_PATH}`)

  const db = createConnection()

  try {
    // 创建迁移记录表
    createMigrationsTable(db)

    // 获取已执行的迁移
    const executedMigrations = getExecutedMigrations(db)

    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback.')
      return
    }

    // 获取要回滚的迁移
    const migrationsToRollback = executedMigrations.slice(-steps)

    if (migrationsToRollback.length === 0) {
      console.log('No migrations to rollback.')
      return
    }

    console.log(`Found ${migrationsToRollback.length} migrations to rollback:`)
    migrationsToRollback.forEach(m => console.log(`  - ${m.name}`))

    // 逐个回滚迁移
    for (const migration of migrationsToRollback) {
      await rollbackMigration(db, migration.name)
    }

    console.log('✓ Rollback completed successfully!')

  } catch (error) {
    console.error('Rollback failed:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

/**
 * 显示迁移状态
 */
function showMigrationStatus(): void {
  console.log('Migration Status')
  console.log('================')
  console.log(`Database: ${DB_PATH}`)

  const db = createConnection()

  try {
    // 创建迁移记录表
    createMigrationsTable(db)

    // 获取已执行的迁移
    const executedMigrations = getExecutedMigrations(db)

    // 获取所有迁移文件
    const migrationFiles = getMigrationFiles()

    console.log('\nMigration Files:')
    migrationFiles.forEach(file => {
      const executed = executedMigrations.find(m => m.name === file)
      const status = executed ? '✓ Executed' : '○ Pending'
      const timestamp = executed?.executed_at ? ` (${executed.executed_at})` : ''
      console.log(`  ${status} ${file}${timestamp}`)
    })

    console.log(`\nStatus: ${executedMigrations.length}/${migrationFiles.length} migrations executed`)

  } catch (error) {
    console.error('Failed to get migration status:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

/**
 * 重置数据库
 */
async function resetDatabase(): Promise<void> {
  console.log('⚠️  WARNING: This will delete all data and reset the database!')
  console.log('Database:', DB_PATH)

  // 确认操作
  if (process.argv.includes('--force')) {
    console.log('Force reset enabled.')
  } else {
    console.log('To confirm, run with --force flag')
    process.exit(0)
  }

  try {
    // 删除数据库文件
    const fs = require('fs')
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH)
      console.log('Database file deleted.')
    }

    // 重新创建数据库并运行迁移
    await runMigrations()

    console.log('✓ Database reset successfully!')

  } catch (error) {
    console.error('Failed to reset database:', error)
    process.exit(1)
  }
}

/**
 * 创建新的迁移文件
 */
function createMigration(name: string): void {
  if (!name) {
    console.error('Migration name is required.')
    process.exit(1)
  }

  // 生成文件名
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0]
  const fileName = `${timestamp}_${name}.sql`
  const filePath = join(MIGRATIONS_PATH, fileName)

  // 生成迁移内容
  const migrationContent = `-- YYC³餐饮行业智能化平台 - 数据库迁移
-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description:

-- 请在此处添加您的迁移SQL语句

-- 示例:
-- CREATE TABLE example_table (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
`

  try {
    // 创建迁移文件
    const fs = require('fs')
    fs.writeFileSync(filePath, migrationContent, 'utf8')

    console.log(`✓ Migration file created: ${fileName}`)
    console.log(`Edit the file at: ${filePath}`)

  } catch (error) {
    console.error('Failed to create migration file:', error)
    process.exit(1)
  }
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
YYC³餐饮行业智能化平台 - 数据库迁移工具

用法:
  bun run database/migrate.ts <command> [options]

命令:
  up                  运行所有待执行的迁移
  down [steps]        回滚指定数量的迁移 (默认: 1)
  status              显示迁移状态
  reset --force        重置数据库 (删除所有数据)
  create <name>       创建新的迁移文件

示例:
  bun run database/migrate.ts up
  bun run database/migrate.ts down
  bun run database/migrate.ts down 2
  bun run database/migrate.ts status
  bun run database/migrate.ts reset --force
  bun run database/migrate.ts create add_user_avatar_column

环境变量:
  DB_PATH             数据库文件路径 (默认: database/data/yyc3_catering.db)
`)
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const command = process.argv[2]

  switch (command) {
    case 'up':
      await runMigrations()
      break

    case 'down':
      const steps = parseInt(process.argv[3] || '1')
      await rollbackMigrations(steps)
      break

    case 'status':
      showMigrationStatus()
      break

    case 'reset':
      await resetDatabase()
      break

    case 'create':
      const name = process.argv[3]
      createMigration(name)
      break

    case 'help':
    case '--help':
    case '-h':
      showHelp()
      break

    default:
      console.error('Unknown command:', command)
      showHelp()
      process.exit(1)
  }
}

// 运行主函数
main().catch(error => {
  console.error('Migration script failed:', error)
  process.exit(1)
})