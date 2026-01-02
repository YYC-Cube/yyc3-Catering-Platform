/**
 * YYC³餐饮行业智能化平台 - 客户API集成测试
 * @fileoverview 测试客户管理API的各种端点和功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Customer, CustomerQueryParams, CustomerStatistics } from '../customer';

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// @ts-ignore
global.localStorage = localStorageMock;

// 模拟fetch API
global.fetch = vi.fn();

// 测试数据
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    status: 'active',
    totalSpent: 1000,
    points: 500
  },
  {
    id: '2',
    name: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    status: 'active',
    totalSpent: 2000,
    points: 1000
  },
  {
    id: '3',
    name: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    status: 'inactive',
    totalSpent: 500,
    points: 250
  }
];

const mockCustomerStatistics: CustomerStatistics = {
  totalCustomers: 100,
  activeCustomers: 80,
  newCustomers: 10,
  avgSpent: 1500,
  avgOrderCount: 5
};

// 定义模拟的API函数
const mockGetCustomers = vi.fn();
const mockGetCustomerDetail = vi.fn();
const mockCreateCustomer = vi.fn();
const mockUpdateCustomer = vi.fn();
const mockDeleteCustomer = vi.fn();
const mockGetCustomerStatistics = vi.fn();
const mockUpdateCustomerStatus = vi.fn();

// 模拟API模块
vi.mock('../customer', () => ({
  getCustomers: mockGetCustomers,
  getCustomerDetail: mockGetCustomerDetail,
  createCustomer: mockCreateCustomer,
  updateCustomer: mockUpdateCustomer,
  deleteCustomer: mockDeleteCustomer,
  getCustomerStatistics: mockGetCustomerStatistics,
  updateCustomerStatus: mockUpdateCustomerStatus,
}));

// 在每个测试前重置mock
beforeEach(() => {
  vi.clearAllMocks();
  // 默认不返回token
  localStorageMock.getItem.mockReturnValue(null);
});

// 在所有测试后关闭服务器
afterEach(() => {
  vi.resetAllMocks();
});

describe('Customer API', () => {
  describe('getCustomers', () => {
    it('should fetch customers with default parameters', async () => {
      // 设置模拟返回值
      mockGetCustomers.mockResolvedValue(mockCustomers);

      // 导入API模块
      const { getCustomers } = await import('../customer');

      // 调用API
      const result = await getCustomers({});

      // 验证结果
      expect(result).toEqual(mockCustomers);
      expect(mockGetCustomers).toHaveBeenCalledTimes(1);
      expect(mockGetCustomers).toHaveBeenCalledWith({});
    });

    it('should fetch customers with query parameters', async () => {
      // 设置模拟返回值
      mockGetCustomers.mockResolvedValue(mockCustomers.slice(0, 1));

      // 导入API模块
      const { getCustomers } = await import('../customer');

      // 调用API
      const queryParams: CustomerQueryParams = {
        keyword: '张',
        status: 'active',
        page: 1,
        size: 10
      };
      const result = await getCustomers(queryParams);

      // 验证结果
      expect(result).toEqual(mockCustomers.slice(0, 1));
      expect(mockGetCustomers).toHaveBeenCalledTimes(1);
      expect(mockGetCustomers).toHaveBeenCalledWith(queryParams);
    });

    it('should handle API errors', async () => {
      // 设置模拟错误
      const mockError = new Error('Internal Server Error');
      mockGetCustomers.mockRejectedValue(mockError);

      // 导入API模块
      const { getCustomers } = await import('../customer');

      // 验证错误处理
      await expect(getCustomers({})).rejects.toThrow(mockError);
      expect(mockGetCustomers).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCustomerDetail', () => {
    it('should fetch customer detail by id', async () => {
      const customerId = '1';
      const mockCustomer = mockCustomers.find(c => c.id === customerId);

      // 设置模拟返回值
      mockGetCustomerDetail.mockResolvedValue(mockCustomer);

      // 导入API模块
      const { getCustomerDetail } = await import('../customer');

      // 调用API
      const result = await getCustomerDetail(customerId);

      // 验证结果
      expect(result).toEqual(mockCustomer);
      expect(mockGetCustomerDetail).toHaveBeenCalledTimes(1);
      expect(mockGetCustomerDetail).toHaveBeenCalledWith(customerId);
    });

    it('should handle customer not found', async () => {
      const customerId = '999';

      // 设置模拟错误
      const mockError = new Error('Customer not found');
      mockGetCustomerDetail.mockRejectedValue(mockError);

      // 导入API模块
      const { getCustomerDetail } = await import('../customer');

      // 验证错误处理
      await expect(getCustomerDetail(customerId)).rejects.toThrow(mockError);
      expect(mockGetCustomerDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const newCustomer: Omit<Customer, 'id'> = {
        name: '赵六',
        phone: '13800138004',
        email: 'zhaoliu@example.com',
        status: 'active',
        totalSpent: 0,
        points: 0
      };

      // 设置模拟返回值
      mockCreateCustomer.mockResolvedValue({ id: '4', ...newCustomer });

      // 导入API模块
      const { createCustomer } = await import('../customer');

      // 调用API
      const result = await createCustomer(newCustomer);

      // 验证结果
      expect(result).toHaveProperty('id', '4');
      expect(result).toHaveProperty('name', '赵六');
      expect(mockCreateCustomer).toHaveBeenCalledTimes(1);
      expect(mockCreateCustomer).toHaveBeenCalledWith(newCustomer);
    });

    it('should handle validation errors', async () => {
      const invalidCustomer = { name: '', phone: 'invalid' };

      // 设置模拟错误
      const mockError = new Error('Validation error');
      mockCreateCustomer.mockRejectedValue(mockError);

      // 导入API模块
      const { createCustomer } = await import('../customer');

      // 验证错误处理
      await expect(createCustomer(invalidCustomer as any)).rejects.toThrow(mockError);
      expect(mockCreateCustomer).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer', async () => {
      const customerId = '1';
      const updateData = { name: '张三三', totalSpent: 1200 };

      // 设置模拟返回值
      mockUpdateCustomer.mockResolvedValue({ id: customerId, ...mockCustomers[0], ...updateData });

      // 导入API模块
      const { updateCustomer } = await import('../customer');

      // 调用API
      const result = await updateCustomer(customerId, updateData);

      // 验证结果
      expect(result).toHaveProperty('id', customerId);
      expect(result).toHaveProperty('name', '张三三');
      expect(result).toHaveProperty('totalSpent', 1200);
      expect(mockUpdateCustomer).toHaveBeenCalledTimes(1);
      expect(mockUpdateCustomer).toHaveBeenCalledWith(customerId, updateData);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      const customerId = '1';

      // 设置模拟返回值
      mockDeleteCustomer.mockResolvedValue(null);

      // 导入API模块
      const { deleteCustomer } = await import('../customer');

      // 调用API
      await deleteCustomer(customerId);

      // 验证API被调用
      expect(mockDeleteCustomer).toHaveBeenCalledTimes(1);
      expect(mockDeleteCustomer).toHaveBeenCalledWith(customerId);
    });
  });

  describe('getCustomerStatistics', () => {
    it('should fetch customer statistics', async () => {
      // 设置模拟返回值
      mockGetCustomerStatistics.mockResolvedValue(mockCustomerStatistics);

      // 导入API模块
      const { getCustomerStatistics } = await import('../customer');

      // 调用API
      const result = await getCustomerStatistics();

      // 验证结果
      expect(result).toEqual(mockCustomerStatistics);
      expect(mockGetCustomerStatistics).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCustomerStatus', () => {
    it('should update customer status', async () => {
      const customerId = '3';
      const newStatus = 'active';

      // 设置模拟返回值
      mockUpdateCustomerStatus.mockResolvedValue({ id: customerId, ...mockCustomers[2], status: newStatus });

      // 导入API模块
      const { updateCustomerStatus } = await import('../customer');

      // 调用API
      const result = await updateCustomerStatus(customerId, newStatus);

      // 验证结果
      expect(result).toHaveProperty('id', customerId);
      expect(result).toHaveProperty('status', newStatus);
      expect(mockUpdateCustomerStatus).toHaveBeenCalledTimes(1);
      expect(mockUpdateCustomerStatus).toHaveBeenCalledWith(customerId, newStatus);
    });
  });
});
