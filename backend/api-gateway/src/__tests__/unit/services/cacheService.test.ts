/**
 * @fileoverview CacheService 单元测试
 * @description 测试Redis缓存服务的核心功能
 * @module services/cacheService.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-07
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from '../../../services/cacheService';
import type { ICacheClient } from '../../../../../types/services/cache';

vi.mock('@yyc3/redis-cache', () => ({
  createCacheClient: vi.fn(),
  createCacheStrategyManager: vi.fn(),
  createCacheKeyGenerator: vi.fn(),
}));

vi.mock('../../../config/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCacheClient = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  sadd: vi.fn(),
  smembers: vi.fn(),
  disconnect: vi.fn(),
} as unknown as ICacheClient;

const mockKeyGenerator = {
  generate: vi.fn((...parts: string[]) => {
    return `yyc3:${parts.join(':')}`;
  }),
};

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(async () => {
    const { createCacheClient, createCacheStrategyManager, createCacheKeyGenerator } = await import('@yyc3/redis-cache');
    
    vi.mocked(createCacheClient).mockResolvedValue(mockCacheClient);
    vi.mocked(createCacheStrategyManager).mockReturnValue({});
    vi.mocked(createCacheKeyGenerator).mockReturnValue(mockKeyGenerator);

    cacheService = new CacheService({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      defaultTTL: 300,
      keyPrefix: 'yyc3',
      enabled: true,
    });

    await cacheService.initialize();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('应该成功初始化缓存服务', async () => {
      const service = new CacheService({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      });

      await service.initialize();

      expect(service.isEnabled()).toBe(true);
    });

    it('应该在初始化失败时抛出错误', async () => {
      const { createCacheClient } = await import('@yyc3/redis-cache');
      vi.mocked(createCacheClient).mockRejectedValue(new Error('Connection failed'));

      const service = new CacheService({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      });

      await expect(service.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('get', () => {
    it('应该成功获取缓存值', async () => {
      const testData = { id: 1, name: 'test' };
      vi.mocked(mockCacheClient.get).mockResolvedValue(testData);

      const result = await cacheService.get('test-key');

      expect(result).toEqual(testData);
      expect(mockCacheClient.get).toHaveBeenCalledWith('yyc3:test-key');
      expect(cacheService.getStats().hits).toBe(1);
      expect(cacheService.getStats().misses).toBe(0);
    });

    it('应该在缓存未命中时返回null', async () => {
      vi.mocked(mockCacheClient.get).mockResolvedValue(null);

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
      expect(cacheService.getStats().hits).toBe(0);
      expect(cacheService.getStats().misses).toBe(1);
    });

    it('应该在缓存禁用时返回null', async () => {
      cacheService.disable();

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
      expect(mockCacheClient.get).not.toHaveBeenCalled();
    });

    it('应该在skipCache为true时返回null', async () => {
      const result = await cacheService.get('test-key', { skipCache: true });

      expect(result).toBeNull();
      expect(mockCacheClient.get).not.toHaveBeenCalled();
    });

    it('应该使用自定义键', async () => {
      const testData = { id: 1 };
      vi.mocked(mockCacheClient.get).mockResolvedValue(testData);

      await cacheService.get('test-key', { key: 'custom-key' });

      expect(mockCacheClient.get).toHaveBeenCalledWith('custom-key');
    });

    it('应该在获取失败时返回null', async () => {
      vi.mocked(mockCacheClient.get).mockRejectedValue(new Error('Get failed'));

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('应该成功设置缓存', async () => {
      const testData = { id: 1, name: 'test' };
      vi.mocked(mockCacheClient.set).mockResolvedValue(undefined);

      await cacheService.set('test-key', testData);

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'yyc3:test-key',
        testData,
        { ttl: 300 }
      );
    });

    it('应该使用自定义TTL', async () => {
      const testData = { id: 1 };
      vi.mocked(mockCacheClient.set).mockResolvedValue(undefined);

      await cacheService.set('test-key', testData, { ttl: 600 });

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'yyc3:test-key',
        testData,
        { ttl: 600 }
      );
    });

    it('应该使用自定义键', async () => {
      const testData = { id: 1 };
      vi.mocked(mockCacheClient.set).mockResolvedValue(undefined);

      await cacheService.set('test-key', testData, { key: 'custom-key' });

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'custom-key',
        testData,
        { ttl: 300 }
      );
    });

    it('应该在缓存禁用时不设置缓存', async () => {
      cacheService.disable();

      await cacheService.set('test-key', { id: 1 });

      expect(mockCacheClient.set).not.toHaveBeenCalled();
    });

    it('应该在skipCache为true时不设置缓存', async () => {
      await cacheService.set('test-key', { id: 1 }, { skipCache: true });

      expect(mockCacheClient.set).not.toHaveBeenCalled();
    });

    it('应该添加标签', async () => {
      const testData = { id: 1 };
      vi.mocked(mockCacheClient.set).mockResolvedValue(undefined);
      vi.mocked(mockCacheClient.sadd).mockResolvedValue(undefined);

      await cacheService.set('test-key', testData, { tags: ['tag1', 'tag2'] });

      expect(mockCacheClient.sadd).toHaveBeenCalledWith('yyc3:tag:tag1', 'yyc3:test-key');
      expect(mockCacheClient.sadd).toHaveBeenCalledWith('yyc3:tag:tag2', 'yyc3:test-key');
    });
  });

  describe('delete', () => {
    it('应该成功删除缓存', async () => {
      vi.mocked(mockCacheClient.delete).mockResolvedValue(undefined);

      await cacheService.delete('test-key');

      expect(mockCacheClient.delete).toHaveBeenCalledWith('yyc3:test-key');
    });

    it('应该使用自定义键', async () => {
      vi.mocked(mockCacheClient.delete).mockResolvedValue(undefined);

      await cacheService.delete('test-key', { key: 'custom-key' });

      expect(mockCacheClient.delete).toHaveBeenCalledWith('custom-key');
    });
  });

  describe('deletePattern', () => {
    it('应该成功批量删除缓存', async () => {
      vi.mocked(mockCacheClient.delete).mockResolvedValue(undefined);

      await cacheService.deletePattern('test:*');

      expect(mockCacheClient.delete).toHaveBeenCalledWith('test:*');
    });
  });

  describe('clear', () => {
    it('应该成功清除所有缓存', async () => {
      vi.mocked(mockCacheClient.delete).mockResolvedValue(undefined);

      await cacheService.clear();

      expect(mockCacheClient.delete).toHaveBeenCalledWith('yyc3:*');
    });
  });

  describe('deleteByTag', () => {
    it('应该成功按标签删除缓存', async () => {
      const keys = ['key1', 'key2', 'key3'];
      vi.mocked(mockCacheClient.smembers).mockResolvedValue(keys);
      vi.mocked(mockCacheClient.delete).mockResolvedValue(undefined);

      await cacheService.deleteByTag('tag1');

      expect(mockCacheClient.smembers).toHaveBeenCalledWith('yyc3:tag:tag1');
      expect(mockCacheClient.delete).toHaveBeenCalledWith('key1');
      expect(mockCacheClient.delete).toHaveBeenCalledWith('key2');
      expect(mockCacheClient.delete).toHaveBeenCalledWith('key3');
      expect(mockCacheClient.delete).toHaveBeenCalledWith('yyc3:tag:tag1');
    });

    it('应该在标签下没有键时只删除标签键', async () => {
      vi.mocked(mockCacheClient.smembers).mockResolvedValue([]);
      vi.mocked(mockCacheClient.delete).mockResolvedValue(undefined);

      await cacheService.deleteByTag('tag1');

      expect(mockCacheClient.delete).toHaveBeenCalledWith('yyc3:tag:tag1');
    });
  });

  describe('getOrSet', () => {
    it('应该在缓存命中时返回缓存值', async () => {
      const cachedData = { id: 1, name: 'cached' };
      vi.mocked(mockCacheClient.get).mockResolvedValue(cachedData);

      const factory = vi.fn().mockResolvedValue({ id: 1, name: 'fresh' });
      const result = await cacheService.getOrSet('test-key', factory);

      expect(result).toEqual(cachedData);
      expect(factory).not.toHaveBeenCalled();
      expect(mockCacheClient.set).not.toHaveBeenCalled();
    });

    it('应该在缓存未命中时调用工厂函数并设置缓存', async () => {
      const freshData = { id: 1, name: 'fresh' };
      vi.mocked(mockCacheClient.get).mockResolvedValue(null);
      vi.mocked(mockCacheClient.set).mockResolvedValue(undefined);

      const factory = vi.fn().mockResolvedValue(freshData);
      const result = await cacheService.getOrSet('test-key', factory);

      expect(result).toEqual(freshData);
      expect(factory).toHaveBeenCalledOnce();
      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'yyc3:test-key',
        freshData,
        { ttl: 300 }
      );
    });

    it('应该支持自定义选项', async () => {
      const freshData = { id: 1 };
      vi.mocked(mockCacheClient.get).mockResolvedValue(null);
      vi.mocked(mockCacheClient.set).mockResolvedValue(undefined);

      const factory = vi.fn().mockResolvedValue(freshData);
      await cacheService.getOrSet('test-key', factory, { ttl: 600, tags: ['tag1'] });

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'yyc3:test-key',
        freshData,
        { ttl: 600 }
      );
    });
  });

  describe('getStats', () => {
    it('应该返回正确的统计信息', async () => {
      vi.mocked(mockCacheClient.get).mockResolvedValue({ id: 1 });
      await cacheService.get('key1');

      vi.mocked(mockCacheClient.get).mockResolvedValue(null);
      await cacheService.get('key2');

      const stats = cacheService.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.total).toBe(2);
      expect(stats.hitRate).toBe(50);
    });

    it('应该在总请求数为0时返回0%命中率', () => {
      const stats = cacheService.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('应该重置统计信息', async () => {
      vi.mocked(mockCacheClient.get).mockResolvedValue({ id: 1 });
      await cacheService.get('key1');

      cacheService.resetStats();
      const stats = cacheService.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('enable/disable', () => {
    it('应该启用缓存', () => {
      cacheService.disable();
      expect(cacheService.isEnabled()).toBe(false);

      cacheService.enable();
      expect(cacheService.isEnabled()).toBe(true);
    });

    it('应该禁用缓存', () => {
      cacheService.enable();
      expect(cacheService.isEnabled()).toBe(true);

      cacheService.disable();
      expect(cacheService.isEnabled()).toBe(false);
    });
  });

  describe('close', () => {
    it('应该成功关闭缓存服务', async () => {
      vi.mocked(mockCacheClient.disconnect).mockResolvedValue(undefined);

      await cacheService.close();

      expect(mockCacheClient.disconnect).toHaveBeenCalledOnce();
    });
  });
});
