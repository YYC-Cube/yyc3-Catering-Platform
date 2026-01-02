/**
 * @fileoverview 数据库连接测试脚本
 * @description 测试数据库连接并查看现有表结构
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { dbManager } from '../config/database';

async function testConnection(): Promise<void> {
  console.log('🔍 测试数据库连接...');

  try {
    // 初始化数据库连接
    await dbManager.createPool();
    console.log('✅ 数据库连接成功');

    // 查看现有表
    const tablesResult = await dbManager.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 现有数据表:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name} (${row.table_type})`);
    });

    // 查看users表结构
    try {
      const usersSchema = await dbManager.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      if (usersSchema.rows.length > 0) {
        console.log('\n👤 users表结构:');
        usersSchema.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable}) ${col.column_default || ''}`);
        });
      }
    } catch (error) {
      console.log('ℹ️ users表不存在或无法访问');
    }

    // 测试简单查询
    try {
      const result = await dbManager.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('\n⏰ 数据库信息:');
      console.log(`  时间: ${result.rows[0].current_time}`);
      console.log(`  版本: ${result.rows[0].pg_version}`);
    } catch (error) {
      console.log('❌ 基础查询失败:', error);
    }

  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  } finally {
    // 关闭数据库连接
    await dbManager.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行测试
testConnection().catch(console.error);