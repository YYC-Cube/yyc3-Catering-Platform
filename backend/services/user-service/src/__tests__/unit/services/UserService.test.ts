/**
 * @file UserService测试文件
 * @description 测试用户服务的核心功能
 * @module tests/services/UserService
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import userService from '../../../services/UserService';
import { User, UserStatus, UserType } from '../../../models/User';
import { UserProfile } from '../../../models/UserProfile';
import { UserAddress } from '../../../models/UserAddress';
import { Role } from '../../../models/Role';
import authService from '../../../services/AuthService';

vi.mock('../../../models/User');
vi.mock('../../../models/UserProfile');
vi.mock('../../../models/UserAddress');
vi.mock('../../../models/Role');
vi.mock('../../../services/AuthService');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDefaultRoles', () => {
    it('应该成功创建默认角色', async () => {
      const mockRole = {
        id: '1',
        name: 'admin',
        description: '系统管理员',
        permissions: [],
        status: 'active'
      };

      vi.spyOn(Role, 'findOrCreate').mockResolvedValue([mockRole as any, true]);

      await userService.createDefaultRoles();

      expect(Role.findOrCreate).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        email: 'test@example.com',
        password: 'hashedPassword',
        type: UserType.CUSTOMER,
        status: UserStatus.ACTIVE,
        role_id: '1'
      };

      const mockRole = {
        id: '1',
        name: 'customer'
      };

      const mockProfile = {
        id: '1',
        user_id: '1',
        nickname: '用户8000'
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      vi.spyOn(Role, 'findOne').mockResolvedValue(mockRole as any);
      vi.spyOn(authService, 'hashPassword').mockResolvedValue('hashedPassword');
      vi.spyOn(User, 'create').mockResolvedValue(mockUser as any);
      vi.spyOn(UserProfile, 'create').mockResolvedValue(mockProfile as any);

      const result = await userService.register({
        phone: '13800138000',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).toBeDefined();
      expect(result.phone).toBe('13800138000');
    });

    it('应该拒绝已存在的手机号', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000'
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      await expect(userService.register({
        phone: '13800138000',
        password: 'password123'
      })).rejects.toThrow('该手机号已注册');
    });

    it('应该拒绝已存在的邮箱', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com'
      };

      vi.spyOn(User, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser as any);

      await expect(userService.register({
        phone: '13800138001',
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow('该邮箱已注册');
    });
  });

  describe('login', () => {
    it('应该成功登录', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        password: 'hashedPassword',
        status: UserStatus.ACTIVE,
        password_error_count: 0
      };

      const mockTokens = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresIn: '1h'
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
      vi.spyOn(authService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(authService, 'createAuthTokens').mockResolvedValue(mockTokens);

      const result = await userService.login('13800138000', 'password123');

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBe('jwt-token');
    });

    it('应该拒绝不存在的用户', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(userService.login('13800138000', 'password123'))
        .rejects.toThrow('用户名或密码错误');
    });

    it('应该拒绝被锁定的用户', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        password: 'hashedPassword',
        status: UserStatus.LOCKED
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      await expect(userService.login('13800138000', 'password123'))
        .rejects.toThrow('用户账号已被锁定或禁用');
    });

    it('应该拒绝错误的密码', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        password: 'hashedPassword',
        status: UserStatus.ACTIVE,
        password_error_count: 0
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
      vi.spyOn(authService, 'verifyPassword').mockResolvedValue(false);
      vi.spyOn(User, 'update').mockResolvedValue([1]);

      await expect(userService.login('13800138000', 'wrongpassword'))
        .rejects.toThrow('用户名或密码错误');
    });
  });

  describe('getUserById', () => {
    it('应该成功获取用户信息', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        role: { id: '1', name: 'customer', description: '普通用户' },
        user_profile: { id: '1', nickname: '测试用户' }
      };

      vi.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);

      const result = await userService.getUserById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });

    it('应该返回null当用户不存在', async () => {
      vi.spyOn(User, 'findByPk').mockResolvedValue(null);

      const result = await userService.getUserById('999');

      expect(result).toBeNull();
    });
  });

  describe('getUserByPhone', () => {
    it('应该成功获取用户信息', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        role: { id: '1', name: 'customer' },
        user_profile: { id: '1', nickname: '测试用户' }
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const result = await userService.getUserByPhone('13800138000');

      expect(result).toBeDefined();
      expect(result?.phone).toBe('13800138000');
    });
  });

  describe('getUsers', () => {
    it('应该成功获取用户列表', async () => {
      const mockUsers = [
        { id: '1', phone: '13800138000' },
        { id: '2', phone: '13800138001' }
      ];

      vi.spyOn(User, 'findAndCountAll').mockResolvedValue({
        rows: mockUsers as any,
        count: 2
      });

      const result = await userService.getUsers({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('应该支持关键词搜索', async () => {
      const mockUsers = [{ id: '1', phone: '13800138000' }];

      vi.spyOn(User, 'findAndCountAll').mockResolvedValue({
        rows: mockUsers as any,
        count: 1
      });

      const result = await userService.getUsers({ keyword: '138' });

      expect(result.users).toHaveLength(1);
    });
  });

  describe('updateUser', () => {
    it('应该成功更新用户信息', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        email: 'new@example.com'
      };

      vi.spyOn(User, 'update').mockResolvedValue([1]);
      vi.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);

      const result = await userService.updateUser('1', {
        email: 'new@example.com'
      });

      expect(result).toBeDefined();
      expect(result?.email).toBe('new@example.com');
    });
  });

  describe('deleteUser', () => {
    it('应该成功删除用户', async () => {
      vi.spyOn(User, 'destroy').mockResolvedValue(1);

      const result = await userService.deleteUser('1');

      expect(result).toBe(true);
    });

    it('应该返回false当用户不存在', async () => {
      vi.spyOn(User, 'destroy').mockResolvedValue(0);

      const result = await userService.deleteUser('999');

      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置密码', async () => {
      vi.spyOn(authService, 'hashPassword').mockResolvedValue('newHashedPassword');
      vi.spyOn(User, 'update').mockResolvedValue([1]);

      const result = await userService.resetPassword('1', 'newPassword123');

      expect(result).toBe(true);
    });
  });

  describe('getUserAddresses', () => {
    it('应该成功获取用户地址列表', async () => {
      const mockAddresses = [
        { id: '1', user_id: '1', is_default: true },
        { id: '2', user_id: '1', is_default: false }
      ];

      vi.spyOn(UserAddress, 'findAll').mockResolvedValue(mockAddresses as any);

      const result = await userService.getUserAddresses('1');

      expect(result).toHaveLength(2);
    });
  });

  describe('setDefaultAddress', () => {
    it('应该成功设置默认地址', async () => {
      vi.spyOn(UserAddress, 'update').mockResolvedValue([1]);

      const result = await userService.setDefaultAddress('1', '1');

      expect(result).toBe(true);
    });
  });
});
