#!/usr/bin/env node

/**
 * @file 应用索引优化脚本
 * @description 执行数据库索引优化脚本，提高查询性能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// 获取数据库连接配置
const dbConfig = {
  user: process.env.DB_USER || 'yyc3admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'yyc3_catering',
  password: process.env.DB_PASSWORD || 'Yyc3@123456',
  port: parseInt(process.env.DB_PORT || '5432'),
};

// 创建数据库连接池
const pool = new Pool(dbConfig);

/**
 * 读取并执行SQL脚本
 */
async function applyIndexes() {
  console.log('=== YYC³ 数据库索引优化 ===\n');
  
  try {
    // 读取索引优化脚本
    const scriptPath = path.join(__dirname, 'optimize-indexes.sql');
    const sql = fs.readFileSync(scriptPath, 'utf8');
    
    console.log('正在连接到数据库...');
    const client = await pool.connect();
    
    try {
      console.log('开始执行索引优化脚本...');
      const startTime = Date.now();
      
      // 执行SQL脚本
      await client.query(sql);
      
      const endTime = Date.now();
      console.log(`索引优化完成！耗时: ${(endTime - startTime) / 1000}秒`);
      console.log('\n✅ 已创建以下类型索引:');
      console.log('   - 菜品分类相关索引');
      console.log('   - 菜品表补充索引');
      console.log('   - 订单表搜索和过滤索引');
      console.log('   - 订单评价和日志索引');
      console.log('   - 配送分配查询索引');
      console.log('   - 菜品选项相关索引');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ 索引优化执行失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 执行索引优化
applyIndexes();
