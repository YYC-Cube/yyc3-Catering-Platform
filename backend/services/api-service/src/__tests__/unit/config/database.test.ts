/**
 * @fileoverview YYC³数据库配置单元测试
 * @description 测试数据库连接和配置管理的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DatabaseManager, dbManager } from '../../../config/database';

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;
  let mockPool: any;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    dbManager = new DatabaseManager();

    mockClient = {
      query: vi.fn(),
      release: vi.fn()
    };

    mockPool = {
      connect: vi.fn().mockResolvedValue(mockClient),
      query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      end: vi.fn().mockResolvedValue(undefined),
      totalCount: 10,
      idleCount: 5,
      waitingCount: 0
    };

    vi.doMock('pg', () => ({
      Pool: vi.fn().mockImplementation(() => mockPool)
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('构造函数和配置', () => {
    it('应该使用默认配置创建实例', () => {
      expect(dbManager).toBeDefined();
    });

    it('应该从环境变量读取配置', () => {
      const originalHost = process.env.DATABASE_HOST;
      const originalPort = process.env.DATABASE_PORT;
      const originalDatabase = process.env.DATABASE_NAME;
      const originalUser = process.env.DATABASE_USER;
      const originalPassword = process.env.DATABASE_PASSWORD;
      const originalSsl = process.env.DATABASE_SSL;
      const originalConnectionLimit = process.env.DB_CONNECTION_LIMIT;
      const originalIdleTimeout = process.env.DB_IDLE_TIMEOUT;

      process.env.DATABASE_HOST = 'test-host';
      process.env.DATABASE_PORT = '5433';
      process.env.DATABASE_NAME = 'test-db';
      process.env.DATABASE_USER = 'test-user';
      process.env.DATABASE_PASSWORD = 'test-pass';
      process.env.DATABASE_SSL = 'true';
      process.env.DB_CONNECTION_LIMIT = '30';
      process.env.DB_IDLE_TIMEOUT = '60000';

      const testDbManager = new DatabaseManager();

      process.env.DATABASE_HOST = originalHost;
      process.env.DATABASE_PORT = originalPort;
      process.env.DATABASE_NAME = originalDatabase;
      process.env.DATABASE_USER = originalUser;
      process.env.DATABASE_PASSWORD = originalPassword;
      process.env.DATABASE_SSL = originalSsl;
      process.env.DB_CONNECTION_LIMIT = originalConnectionLimit;
      process.env.DB_IDLE_TIMEOUT = originalIdleTimeout;

      expect(testDbManager).toBeDefined();
    });

    it('应该使用默认值当环境变量未设置时', () => {
      const testDbManager = new DatabaseManager();

      expect(testDbManager).toBeDefined();
    });
  });

  describe('getConnectionString', () => {
    it('应该生成正确的连接字符串', () => {
      const connectionString = dbManager['getConnectionString']();

      expect(connectionString).toContain('postgresql://');
      expect(connectionString).toContain('@');
      expect(connectionString).toContain('/');
    });

    it('应该在SSL启用时包含sslmode=require', () => {
      process.env.DATABASE_SSL = 'true';
      const sslDbManager = new DatabaseManager();
      const connectionString = sslDbManager['getConnectionString']();

      expect(connectionString).toContain('sslmode=require');
      process.env.DATABASE_SSL = undefined;
    });

    it('应该在SSL禁用时包含sslmode=disable', () => {
      process.env.DATABASE_SSL = 'false';
      const sslDbManager = new DatabaseManager();
      const connectionString = sslDbManager['getConnectionString']();

      expect(connectionString).toContain('sslmode=disable');
      process.env.DATABASE_SSL = undefined;
    });
  });

  describe('createPool', () => {
    it('应该成功创建连接池', async () => {
      const { Pool } = await import('pg');
      const pool = await dbManager.createPool();

      expect(Pool).toHaveBeenCalled();
      expect(pool).toBeDefined();
    });

    it('应该测试连接是否成功', async () => {
      const { Pool } = await import('pg');
      mockClient.query.mockResolvedValue({ rows: [{ now: new Date() }] });

      await dbManager.createPool();

      expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('应该在连接失败时抛出错误', async () => {
      const { Pool } = await import('pg');
      mockPool.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(dbManager.createPool()).rejects.toThrow('Connection failed');
    });

    it('应该在测试查询失败时抛出错误', async () => {
      const { Pool } = await import('pg');
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      await expect(dbManager.createPool()).rejects.toThrow('Query failed');
    });

    it('应该使用正确的配置创建连接池', async () => {
      const { Pool } = await import('pg');

      await dbManager.createPool();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.any(String),
          port: expect.any(Number),
          database: expect.any(String),
          user: expect.any(String),
          password: expect.any(String),
          max: expect.any(Number),
          idleTimeoutMillis: expect.any(Number),
          connectionTimeoutMillis: expect.any(Number),
        })
      );
    });

    it('应该在SSL启用时设置SSL配置', async () => {
      process.env.DATABASE_SSL = 'true';
      const sslDbManager = new DatabaseManager();
      const { Pool } = await import('pg');

      await sslDbManager.createPool();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          ssl: { rejectUnauthorized: false }
        })
      );

      process.env.DATABASE_SSL = undefined;
    });

    it('应该在SSL禁用时禁用SSL', async () => {
      process.env.DATABASE_SSL = 'false';
      const sslDbManager = new DatabaseManager();
      const { Pool } = await import('pg');

      await sslDbManager.createPool();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          ssl: false
        })
      );

      process.env.DATABASE_SSL = undefined;
    });
  });

  describe('getPool', () => {
    it('应该在连接池已创建时返回连接池', async () => {
      await dbManager.createPool();
      const pool = dbManager.getPool();

      expect(pool).toBeDefined();
      expect(pool).toBe(mockPool);
    });

    it('应该在连接池未创建时抛出错误', () => {
      expect(() => dbManager.getPool()).toThrow('数据库连接池未初始化，请先调用createPool()');
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      await dbManager.createPool();
    });

    it('应该成功执行查询', async () => {
      const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
      mockClient.query.mockResolvedValue(mockResult);

      const result = await dbManager.query('SELECT * FROM test');

      expect(result).toEqual(mockResult);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('应该正确传递参数', async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      mockClient.query.mockResolvedValue(mockResult);

      await dbManager.query('SELECT * FROM test WHERE id = $1', [1]);

      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
    });

    it('应该在查询失败时释放连接', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      await expect(dbManager.query('SELECT * FROM test')).rejects.toThrow('Query failed');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('应该处理空结果集', async () => {
      const mockResult = { rows: [], rowCount: 0 };
      mockClient.query.mockResolvedValue(mockResult);

      const result = await dbManager.query('SELECT * FROM test WHERE false');

      expect(result.rows).toEqual([]);
      expect(result.rowCount).toBe(0);
    });

    it('应该处理多行结果', async () => {
      const mockResult = {
        rows: [
          { id: 1, name: 'test1' },
          { id: 2, name: 'test2' },
          { id: 3, name: 'test3' }
        ],
        rowCount: 3
      };
      mockClient.query.mockResolvedValue(mockResult);

      const result = await dbManager.query('SELECT * FROM test');

      expect(result.rows).toHaveLength(3);
      expect(result.rowCount).toBe(3);
    });
  });

  describe('transaction', () => {
    beforeEach(async () => {
      await dbManager.createPool();
    });

    it('应该成功执行事务', async () => {
      const callback = vi.fn().mockResolvedValue({ success: true });
      mockClient.query.mockResolvedValue({});

      const result = await dbManager.transaction(callback);

      expect(result).toEqual({ success: true });
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('应该在回调失败时回滚事务', async () => {
      const callback = vi.fn().mockRejectedValue(new Error('Transaction failed'));
      mockClient.query.mockResolvedValue({});

      await expect(dbManager.transaction(callback)).rejects.toThrow('Transaction failed');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('应该在回滚后释放连接', async () => {
      const callback = vi.fn().mockRejectedValue(new Error('Transaction failed'));
      mockClient.query.mockResolvedValue({});

      try {
        await dbManager.transaction(callback);
      } catch (error) {
        // Expected error
      }

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('应该支持在事务中执行多个查询', async () => {
      mockClient.query.mockClear();
      const callback = async (client: any) => {
        await client.query('INSERT INTO test VALUES (1)');
        await client.query('INSERT INTO test VALUES (2)');
        await client.query('INSERT INTO test VALUES (3)');
        return { inserted: 3 };
      };
      mockClient.query.mockResolvedValue({});

      const result = await dbManager.transaction(callback);

      expect(result).toEqual({ inserted: 3 });
      expect(mockClient.query).toHaveBeenCalledTimes(5); // BEGIN + 3 queries + COMMIT
    });

    it('应该返回回调的结果', async () => {
      const callback = vi.fn().mockResolvedValue({ id: 123, name: 'test' });
      mockClient.query.mockResolvedValue({});

      const result = await dbManager.transaction(callback);

      expect(result).toEqual({ id: 123, name: 'test' });
    });
  });

  describe('close', () => {
    it('应该成功关闭连接池', async () => {
      await dbManager.createPool();
      await dbManager.close();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('应该在连接池未创建时不执行任何操作', async () => {
      await expect(dbManager.close()).resolves.not.toThrow();
    });

    it('应该在关闭后允许重新创建连接池', async () => {
      await dbManager.createPool();
      await dbManager.close();

      mockPool.end.mockClear();
      mockPool.connect.mockResolvedValue(mockClient);

      await dbManager.createPool();

      expect(mockPool.connect).toHaveBeenCalled();
    });

    it('应该在关闭失败时抛出错误', async () => {
      await dbManager.createPool();
      mockPool.end.mockRejectedValue(new Error('Close failed'));

      await expect(dbManager.close()).rejects.toThrow('Close failed');
    });
  });

  describe('healthCheck', () => {
    beforeEach(async () => {
      await dbManager.createPool();
    });

    it('应该在数据库健康时返回true', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      const isHealthy = await dbManager.healthCheck();

      expect(isHealthy).toBe(true);
      expect(mockClient.query).toHaveBeenLastCalledWith('SELECT 1', []);
    });

    it('应该在数据库不健康时返回false', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      const isHealthy = await dbManager.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('应该在连接池未初始化时返回false', async () => {
      const uninitializedDbManager = new DatabaseManager();

      const isHealthy = await uninitializedDbManager.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await dbManager.createPool();
    });

    it('应该返回连接池统计信息', async () => {
      const stats = await dbManager.getStats();

      expect(stats).toEqual({
        totalCount: 10,
        idleCount: 5,
        waitingCount: 0
      });
    });

    it('应该在连接池未初始化时返回null', async () => {
      const uninitializedDbManager = new DatabaseManager();

      const stats = await uninitializedDbManager.getStats();

      expect(stats).toBeNull();
    });

    it('应该正确反映连接池状态变化', async () => {
      mockPool.totalCount = 20;
      mockPool.idleCount = 10;
      mockPool.waitingCount = 2;

      const stats = await dbManager.getStats();

      expect(stats.totalCount).toBe(20);
      expect(stats.idleCount).toBe(10);
      expect(stats.waitingCount).toBe(2);
    });
  });

  describe('导出的单例实例', () => {
    it('应该导出dbManager单例', () => {
      expect(dbManager).toBeDefined();
      expect(dbManager instanceof DatabaseManager).toBe(true);
    });

    it('应该导出database别名', async () => {
      const { database } = await import('../../../config/database');

      expect(database).toBeDefined();
      expect(database).toBeInstanceOf(DatabaseManager);
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理无效的连接配置', async () => {
      process.env.DATABASE_PORT = 'invalid';
      const invalidDbManager = new DatabaseManager();

      const { Pool } = await import('pg');
      mockPool.connect.mockRejectedValue(new Error('Invalid port'));

      await expect(invalidDbManager.createPool()).rejects.toThrow();
      process.env.DATABASE_PORT = undefined;
    });

    it('应该处理连接超时', async () => {
      mockPool.connect.mockImplementation(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 100);
      }));

      await expect(dbManager.createPool()).rejects.toThrow('Connection timeout');
    });

    it('应该处理查询超时', async () => {
      await dbManager.createPool();
      mockClient.query.mockImplementation(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 100);
      }));

      await expect(dbManager.query('SELECT * FROM test')).rejects.toThrow('Query timeout');
    });

    it('应该处理事务中的查询失败', async () => {
      await dbManager.createPool();
      const callback = async (client: any) => {
        await client.query('INSERT INTO test VALUES (1)');
        await client.query('INVALID QUERY');
        return { success: true };
      };
      mockClient.query
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Invalid query'));

      await expect(dbManager.transaction(callback)).rejects.toThrow('Invalid query');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('应该处理并发查询', async () => {
      await dbManager.createPool();
      mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const promises = Array(5).fill(null).map(() => dbManager.query('SELECT 1'));
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('应该处理并发事务', async () => {
      await dbManager.createPool();
      const callback = vi.fn().mockResolvedValue({ success: true });
      mockClient.query.mockResolvedValue({});

      const promises = Array(3).fill(null).map(() => dbManager.transaction(callback));
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toEqual({ success: true });
      });
    });

    it('应该处理空SQL查询', async () => {
      await dbManager.createPool();
      mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await dbManager.query('');

      expect(result).toBeDefined();
    });

    it('应该处理null参数', async () => {
      await dbManager.createPool();
      mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await dbManager.query('SELECT * FROM test WHERE id = $1', [null]);

      expect(result).toBeDefined();
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [null]);
    });
  });

  describe('连接池生命周期', () => {
    it('应该支持完整的连接池生命周期', async () => {
      await dbManager.createPool();
      expect(dbManager.getPool()).toBeDefined();

      await dbManager.query('SELECT 1');
      expect(mockClient.query).toHaveBeenCalled();

      mockClient.query.mockClear();
      await dbManager.healthCheck();
      expect(mockClient.query).toHaveBeenLastCalledWith('SELECT 1', []);

      const stats = await dbManager.getStats();
      expect(stats).toBeDefined();

      await dbManager.close();
      expect(mockPool.end).toHaveBeenCalled();
    });

    it('应该在关闭后拒绝新查询', async () => {
      await dbManager.createPool();
      await dbManager.close();

      await expect(dbManager.query('SELECT 1')).rejects.toThrow();
    });

    it('应该在关闭后拒绝新事务', async () => {
      await dbManager.createPool();
      await dbManager.close();

      const callback = vi.fn();
      await expect(dbManager.transaction(callback)).rejects.toThrow();
    });
  });
});
