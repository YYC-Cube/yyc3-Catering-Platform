#!/usr/bin/env bun

/**
 * YYC³餐饮行业智能化平台 - 数据库备份脚本
 * @author YYC³
 * @version 1.0.0
 */

import { Database } from 'bun:sqlite'
import { join } from 'path'
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'fs'
import { gzip } from 'node:zlib'
import { promisify } from 'node:util'

const gzipAsync = promisify(gzip)

// 数据库配置
const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'database', 'data', 'yyc3_catering.db')
const BACKUP_DIR = process.env.BACKUP_DIR || join(process.cwd(), 'database', 'backups')

interface BackupConfig {
  maxBackups: number
  compressionLevel: number
  includeSchema: boolean
  includeData: boolean
  excludedTables: string[]
}

/**
 * 创建数据库连接
 */
function createConnection(): Database {
  try {
    if (!existsSync(DB_PATH)) {
      throw new Error(`Database file not found: ${DB_PATH}`)
    }

    const db = new Database(DB_PATH)
    db.exec('PRAGMA foreign_keys = ON')
    return db
  } catch (error) {
    console.error('Failed to create database connection:', error)
    process.exit(1)
  }
}

/**
 * 确保备份目录存在
 */
function ensureBackupDir(): void {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }
}

/**
 * 获取数据库表列表
 */
function getTables(db: Database): string[] {
  try {
    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const tables = stmt.all() as { name: string }[]
    return tables.map(table => table.name)
  } catch (error) {
    console.error('Failed to get table list:', error)
    return []
  }
}

/**
 * 获取表结构
 */
function getTableSchema(db: Database, tableName: string): string {
  try {
    const stmt = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`)
    const result = stmt.get() as { sql: string } | undefined
    return result?.sql || ''
  } catch (error) {
    console.error(`Failed to get schema for table ${tableName}:`, error)
    return ''
  }
}

/**
 * 获取表索引
 */
function getTableIndexes(db: Database, tableName: string): string[] {
  try {
    const stmt = db.prepare(`SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name='${tableName}' AND sql IS NOT NULL`)
    const indexes = stmt.all() as { sql: string }[]
    return indexes.map(index => index.sql)
  } catch (error) {
    console.error(`Failed to get indexes for table ${tableName}:`, error)
    return []
  }
}

/**
 * 导出表数据
 */
function exportTableData(db: Database, tableName: string): string {
  try {
    const stmt = db.prepare(`SELECT * FROM ${tableName}`)
    const rows = stmt.all() as any[]

    if (rows.length === 0) {
      return '-- No data in table\n'
    }

    // 获取列信息
    const columns = Object.keys(rows[0])
    const columnDefs = columns.map(col => {
      // 检查列类型
      const typeStmt = db.prepare(`PRAGMA table_info(${tableName})`)
      const typeInfo = typeStmt.all() as { cid: number; name: string; type: string; notnull: number; dflt_value: any; pk: number }[]
      const colType = typeInfo.find(info => info.name === col)?.type || 'TEXT'

      return col
    }).join(', ')

    let sql = `-- Table: ${tableName}\n`
    sql += `-- Columns: ${columnDefs}\n\n`

    // 生成INSERT语句
    for (const row of rows) {
      const values = columns.map(col => {
        const value = row[col]

        if (value === null || value === undefined) {
          return 'NULL'
        }

        if (typeof value === 'number') {
          return value.toString()
        }

        if (typeof value === 'boolean') {
          return value ? '1' : '0'
        }

        // 处理JSON字段
        if (typeof value === 'object') {
          const jsonString = JSON.stringify(value)
          return `'${jsonString.replace(/'/g, "''")}'`
        }

        // 处理字符串
        return `'${value.toString().replace(/'/g, "''")}'`
      })

      sql += `INSERT INTO ${tableName} (${columnDefs}) VALUES (${values.join(', ')});\n`
    }

    sql += `\n-- ${rows.length} rows exported from ${tableName}\n\n`
    return sql
  } catch (error) {
    console.error(`Failed to export data for table ${tableName}:`, error)
    return `-- Failed to export data for table ${tableName}: ${error}\n\n`
  }
}

/**
 * 创建数据库备份
 */
async function createBackup(config: BackupConfig): Promise<string> {
  console.log('Starting database backup...')
  console.log(`Database: ${DB_PATH}`)
  console.log(`Backup dir: ${BACKUP_DIR}`)

  ensureBackupDir()

  const db = createConnection()
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0]
  const backupFileName = `yyc3_catering_backup_${timestamp}.sql`
  const backupFilePath = join(BACKUP_DIR, backupFileName)

  try {
    let backupSQL = ''

    // 添加文件头信息
    backupSQL += `-- YYC³餐饮行业智能化平台 - 数据库备份\n`
    backupSQL += `-- Generated at: ${new Date().toISOString()}\n`
    backupSQL += `-- Database: ${DB_PATH}\n`
    backupSQL += `-- Tables: ${config.excludedTables.length > 0 ? 'All except ' + config.excludedTables.join(', ') : 'All'}\n`
    backupSQL += `-- Include Schema: ${config.includeSchema}\n`
    backupSQL += `-- Include Data: ${config.includeData}\n\n`

    backupSQL += `-- 开始事务\nBEGIN TRANSACTION;\n\n`

    // 获取所有表
    const tables = getTables(db)
    const tablesToBackup = tables.filter(table => !config.excludedTables.includes(table))

    console.log(`Found ${tables.length} tables, backing up ${tablesToBackup.length} tables`)

    // 导出每个表
    for (const table of tablesToBackup) {
      console.log(`Processing table: ${table}`)

      if (config.includeSchema) {
        // 添加表结构
        const schema = getTableSchema(db, table)
        if (schema) {
          backupSQL += `-- 表结构: ${table}\n`
          backupSQL += `DROP TABLE IF EXISTS ${table};\n`
          backupSQL += `${schema};\n\n`

          // 添加索引
          const indexes = getTableIndexes(db, table)
          if (indexes.length > 0) {
            backupSQL += `-- 表索引: ${table}\n`
            indexes.forEach(index => {
              backupSQL += `${index};\n`
            })
            backupSQL += '\n'
          }
        }
      }

      if (config.includeData) {
        // 添加表数据
        backupSQL += exportTableData(db, table)
      }
    }

    backupSQL += `-- 提交事务\nCOMMIT;\n\n`
    backupSQL += `-- 备份完成\n`

    // 写入备份文件
    writeFileSync(backupFilePath, backupSQL, 'utf8')

    // 如果启用压缩，创建压缩文件
    if (config.compressionLevel > 0) {
      const compressedFileName = backupFileName.replace('.sql', '.sql.gz')
      const compressedFilePath = join(BACKUP_DIR, compressedFileName)

      console.log('Compressing backup file...')
      const compressed = await gzipAsync(Buffer.from(backupSQL), { level: config.compressionLevel })
      writeFileSync(compressedFilePath, compressed)

      // 删除未压缩的文件
      require('fs').unlinkSync(backupFilePath)

      console.log(`✓ Backup created and compressed: ${compressedFileName}`)
      return compressedFileName
    } else {
      console.log(`✓ Backup created: ${backupFileName}`)
      return backupFileName
    }

  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

/**
 * 清理旧备份
 */
function cleanupOldBackups(maxBackups: number): void {
  try {
    ensureBackupDir()

    const files = readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz'))
      .map(file => ({
        name: file,
        path: join(BACKUP_DIR, file),
        time: statSync(join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time.getTime() - a.time.getTime())

    if (files.length <= maxBackups) {
      console.log('No old backups to clean up.')
      return
    }

    const filesToDelete = files.slice(maxBackups)
    console.log(`Cleaning up ${filesToDelete.length} old backup(s):`)

    for (const file of filesToDelete) {
      require('fs').unlinkSync(file.path)
      console.log(`  - Deleted: ${file.name}`)
    }

    console.log('✓ Cleanup completed')

  } catch (error) {
    console.error('Failed to cleanup old backups:', error)
  }
}

/**
 * 列出所有备份
 */
function listBackups(): void {
  try {
    ensureBackupDir()

    const files = readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz'))
      .map(file => {
        const filePath = join(BACKUP_DIR, file)
        const stats = statSync(filePath)
        return {
          name: file,
          size: stats.size,
          date: stats.mtime.toISOString(),
          compressed: file.endsWith('.gz')
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))

    if (files.length === 0) {
      console.log('No backup files found.')
      return
    }

    console.log(`Found ${files.length} backup file(s):`)
    console.log('')

    files.forEach(file => {
      const sizeStr = file.compressed ?
        `${(file.size / 1024).toFixed(1)}KB (compressed)` :
        `${(file.size / 1024).toFixed(1)}KB`

      console.log(`  ${file.name}`)
      console.log(`    Size: ${sizeStr}`)
      console.log(`    Date: ${file.date}`)
      console.log('')
    })

  } catch (error) {
    console.error('Failed to list backups:', error)
  }
}

/**
 * 恢复数据库
 */
async function restoreDatabase(backupFileName: string): Promise<void> {
  console.log(`Restoring database from: ${backupFileName}`)
  console.log(`Database: ${DB_PATH}`)

  const backupFilePath = join(BACKUP_DIR, backupFileName)

  // 检查备份文件是否存在
  if (!existsSync(backupFilePath)) {
    console.error(`Backup file not found: ${backupFileName}`)
    process.exit(1)
  }

  try {
    // 如果是压缩文件，先解压
    let sqlContent: string
    if (backupFileName.endsWith('.gz')) {
      console.log('Decompressing backup file...')
      const compressedData = require('fs').readFileSync(backupFilePath)
      const decompressed = await require('node:zlib').gunzipSync(compressedData)
      sqlContent = decompressed.toString('utf8')
    } else {
      sqlContent = require('fs').readFileSync(backupFilePath, 'utf8')
    }

    // 创建新的数据库连接
    const db = new Database(DB_PATH)
    db.exec('PRAGMA foreign_keys = ON')

    try {
      console.log('Executing restore script...')

      // 执行SQL脚本
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement)
        }
      }

      console.log('✓ Database restored successfully!')

    } catch (error) {
      console.error('Failed to execute restore script:', error)
      process.exit(1)
    } finally {
      db.close()
    }

  } catch (error) {
    console.error('Restore failed:', error)
    process.exit(1)
  }
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
YYC³餐饮行业智能化平台 - 数据库备份工具

用法:
  bun run database/backup.ts <command> [options]

命令:
  create                  创建新的数据库备份
  list                    列出所有备份文件
  restore <filename>      从备份文件恢复数据库
  cleanup                 清理旧备份文件

选项:
  --max-backups N         保留最多N个备份文件 (默认: 10)
  --compress LEVEL        压缩级别 0-9 (默认: 6, 0=不压缩)
  --no-schema             不包含表结构
  --no-data               不包含数据
  --exclude TABLE1,TABLE2 排除指定表

示例:
  bun run database/backup.ts create
  bun run database/backup.ts create --max-backups 5 --compress 9
  bun run database/backup.ts list
  bun run database/backup.ts restore yyc3_catering_backup_20240101000000.sql.gz
  bun run database/backup.ts cleanup --max-backups 5

环境变量:
  DB_PATH                 数据库文件路径 (默认: database/data/yyc3_catering.db)
  BACKUP_DIR              备份目录 (默认: database/backups)
`)
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const command = process.argv[2]

  // 解析命令行参数
  const args = process.argv.slice(3)
  const config: BackupConfig = {
    maxBackups: 10,
    compressionLevel: 6,
    includeSchema: true,
    includeData: true,
    excludedTables: []
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--max-backups') {
      config.maxBackups = parseInt(args[++i]) || 10
    } else if (arg === '--compress') {
      config.compressionLevel = parseInt(args[++i]) || 6
    } else if (arg === '--no-schema') {
      config.includeSchema = false
    } else if (arg === '--no-data') {
      config.includeData = false
    } else if (arg === '--exclude') {
      config.excludedTables = args[++i]?.split(',') || []
    } else if (arg === '--help' || arg === '-h') {
      showHelp()
      return
    }
  }

  switch (command) {
    case 'create':
      const backupFile = await createBackup(config)
      cleanupOldBackups(config.maxBackups)
      break

    case 'list':
      listBackups()
      break

    case 'restore':
      const fileName = args.find(arg => !arg.startsWith('--'))
      if (!fileName) {
        console.error('Backup file name is required for restore.')
        process.exit(1)
      }
      await restoreDatabase(fileName)
      break

    case 'cleanup':
      cleanupOldBackups(config.maxBackups)
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
  console.error('Backup script failed:', error)
  process.exit(1)
})