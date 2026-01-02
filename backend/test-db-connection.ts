/**
 * @file PostgreSQL数据库连接测试脚本
 * @description 测试PostgreSQL主数据库连接和基本功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// 加载环境变量
const envPath = path.join(process.cwd(), '.env');
console.log(`📂 加载环境变量文件: ${envPath}`);
console.log(`📂 文件是否存在: ${fs.existsSync(envPath)}`);

const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error(`⚠️  警告: 无法加载 .env 文件: ${envResult.error.message}`);
} else {
  console.log(`✅ 环境变量已加载`);
}

// 调试输出环境变量
console.log('\n🔍 环境变量检查:');
console.log(`  DB_HOST: ${process.env.DB_HOST}`);
console.log(`  DB_PORT: ${process.env.DB_PORT}`);
console.log(`  DB_NAME: ${process.env.DB_NAME}`);
console.log(`  DB_USER: ${process.env.DB_USER}`);
console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '***已设置***' : '未设置'}`);
console.log(`  DB_POOL_MAX: ${process.env.DB_POOL_MAX}`);
console.log(`  DB_POOL_MIN: ${process.env.DB_POOL_MIN}`);
console.log('');

/**
 * 颜色输出工具
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * 打印带颜色的消息
 */
function printMessage(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * 打印分隔线
 */
function printSeparator() {
  console.log(colors.cyan + '='.repeat(60) + colors.reset);
}

/**
 * 数据库配置
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'yyc3_catering',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};

/**
 * 测试数据库连接
 */
async function testDatabaseConnection() {
  printSeparator();
  printMessage('🔍 PostgreSQL 数据库连接测试', colors.bright + colors.blue);
  printSeparator();

  // 显示配置信息
  printMessage('\n📋 数据库配置:', colors.bright + colors.yellow);
  console.log(`  主机: ${dbConfig.host}`);
  console.log(`  端口: ${dbConfig.port}`);
  console.log(`  数据库: ${dbConfig.database}`);
  console.log(`  用户: ${dbConfig.user}`);
  console.log(`  最大连接数: ${dbConfig.max}`);
  console.log(`  最小连接数: ${dbConfig.min}`);

  const pool = new Pool(dbConfig);

  try {
    printMessage('\n🔄 正在连接数据库...', colors.cyan);

    // 测试1: 基本连接测试
    printMessage('\n测试 1: 基本连接测试', colors.bright + colors.green);
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();

    printMessage('✅ 连接成功!', colors.green);
    console.log(`  当前时间: ${result.rows[0].current_time}`);
    console.log(`  PostgreSQL版本: ${result.rows[0].version.split(',')[0]}`);

    // 测试2: 数据库信息查询
    printMessage('\n测试 2: 数据库信息查询', colors.bright + colors.green);
    const dbInfo = await pool.query(`
      SELECT
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);

    printMessage('✅ 查询成功!', colors.green);
    console.log(`  数据库名: ${dbInfo.rows[0].database}`);
    console.log(`  当前用户: ${dbInfo.rows[0].user}`);
    console.log(`  服务器地址: ${dbInfo.rows[0].server_address}`);
    console.log(`  服务器端口: ${dbInfo.rows[0].server_port}`);

    // 测试3: 连接池状态
    printMessage('\n测试 3: 连接池状态', colors.bright + colors.green);
    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };

    printMessage('✅ 连接池状态:', colors.green);
    console.log(`  总连接数: ${poolStats.totalCount}`);
    console.log(`  空闲连接数: ${poolStats.idleCount}`);
    console.log(`  等待连接数: ${poolStats.waitingCount}`);

    // 测试4: 表查询
    printMessage('\n测试 4: 查询数据库表', colors.bright + colors.green);
    const tablesResult = await pool.query(`
      SELECT
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
      LIMIT 10
    `);

    if (tablesResult.rows.length > 0) {
      printMessage(`✅ 找到 ${tablesResult.rows.length} 个表:`, colors.green);
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name} (${row.table_type})`);
      });
    } else {
      printMessage('⚠️  数据库中没有表', colors.yellow);
    }

    // 测试5: 性能测试
    printMessage('\n测试 5: 查询性能测试', colors.bright + colors.green);
    const iterations = 100;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await pool.query('SELECT 1 as test');
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const avgTime = duration / iterations;

    printMessage('✅ 性能测试完成:', colors.green);
    console.log(`  执行次数: ${iterations}`);
    console.log(`  总耗时: ${duration}ms`);
    console.log(`  平均耗时: ${avgTime.toFixed(2)}ms`);
    console.log(`  QPS: ${(iterations / (duration / 1000)).toFixed(2)}`);

    // 测试6: 连接池压力测试
    printMessage('\n测试 6: 连接池压力测试', colors.bright + colors.green);
    const concurrentQueries = 10;
    const queryPromises = [];

    for (let i = 0; i < concurrentQueries; i++) {
      queryPromises.push(
        pool.query(`SELECT pg_sleep(0.1) as sleep, ${i} as query_id`)
      );
    }

    const stressTestStart = Date.now();
    await Promise.all(queryPromises);
    const stressTestDuration = Date.now() - stressTestStart;

    printMessage('✅ 压力测试完成:', colors.green);
    console.log(`  并发查询数: ${concurrentQueries}`);
    console.log(`  总耗时: ${stressTestDuration}ms`);
    console.log(`  连接池状态: 总数=${pool.totalCount}, 空闲=${pool.idleCount}`);

    // 最终连接池状态
    printMessage('\n📊 最终连接池状态:', colors.bright + colors.yellow);
    const finalStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
    console.log(`  总连接数: ${finalStats.totalCount}`);
    console.log(`  空闲连接数: ${finalStats.idleCount}`);
    console.log(`  等待连接数: ${finalStats.waitingCount}`);

    printMessage('\n' + '='.repeat(60), colors.cyan);
    printMessage('🎉 所有测试通过! 数据库连接正常工作。', colors.bright + colors.green);
    printMessage('='.repeat(60) + '\n', colors.cyan);

    return true;
  } catch (error) {
    printMessage('\n' + '='.repeat(60), colors.red);
    printMessage('❌ 数据库连接测试失败!', colors.bright + colors.red);
    printMessage('='.repeat(60) + '\n', colors.red);

    console.error('错误详情:', error);

    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        printMessage('\n💡 可能的原因:', colors.yellow);
        console.log('  1. PostgreSQL服务未启动');
        console.log('  2. 主机地址或端口配置错误');
        console.log('  3. 防火墙阻止连接');
        console.log('  4. 网络连接问题');
      } else if (error.message.includes('authentication')) {
        printMessage('\n💡 可能的原因:', colors.yellow);
        console.log('  1. 用户名或密码错误');
        console.log('  2. 用户权限不足');
        console.log('  3. pg_hba.conf配置问题');
      } else if (error.message.includes('database')) {
        printMessage('\n💡 可能的原因:', colors.yellow);
        console.log('  1. 数据库不存在');
        console.log('  2. 数据库权限不足');
      }
    }

    return false;
  } finally {
    // 关闭连接池
    await pool.end();
    printMessage('🔌 连接池已关闭', colors.cyan);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const success = await testDatabaseConnection();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('测试脚本执行失败:', error);
    process.exit(1);
  }
}

// 运行测试
main();
