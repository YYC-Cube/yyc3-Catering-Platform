/**
 * @fileoverview 用户服务
 * @description 处理用户相关业务逻辑，包括CRUD操作、用户管理等
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { User, UserStatus, UserType } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { UserAddress } from '../models/UserAddress';
import { Role } from '../models/Role';
import authService from './AuthService';
import logger from '../config/logger';
import { Op } from 'sequelize';

/**
 * 用户注册参数
 */
export interface UserRegisterParams {
  phone: string;
  password: string;
  email?: string;
  type?: UserType;
  roleId?: string;
  profile?: {
    nickname?: string;
    gender?: string;
    birthdate?: Date;
  };
}

/**
 * 用户更新参数
 */
export interface UserUpdateParams {
  username?: string;
  email?: string;
  status?: UserStatus;
  type?: UserType;
  roleId?: string;
}

/**
 * 用户服务类
 */
class UserService {
  /**
   * 创建默认角色
   */
  async createDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'admin',
        description: '系统管理员',
        permissions: [
          { resource: '*', actions: ['*'] },
        ],
        status: 'active',
      },
      {
        name: 'merchant',
        description: '商户用户',
        permissions: [
          { resource: 'order', actions: ['create', 'read', 'update'] },
          { resource: 'menu', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'store', actions: ['create', 'read', 'update'] },
        ],
        status: 'active',
      },
      {
        name: 'customer',
        description: '普通用户',
        permissions: [
          { resource: 'order', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'menu', actions: ['read'] },
          { resource: 'store', actions: ['read'] },
        ],
        status: 'active',
      },
      {
        name: 'staff',
        description: '员工用户',
        permissions: [
          { resource: 'order', actions: ['read', 'update'] },
          { resource: 'menu', actions: ['read'] },
        ],
        status: 'active',
      },
    ];

    for (const roleData of defaultRoles) {
      const [role] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData,
      });
      logger.debug(`角色 ${role.name} 创建/获取成功`);
    }
  }

  /**
   * 用户注册
   * @param params 注册参数
   * @returns 注册成功的用户信息
   */
  async register(params: UserRegisterParams): Promise<User> {
    // 检查手机号是否已存在
    const existingUser = await User.findOne({
      where: { phone: params.phone },
    });

    if (existingUser) {
      throw new Error('该手机号已注册');
    }

    // 检查邮箱是否已存在
    if (params.email) {
      const existingEmail = await User.findOne({
        where: { email: params.email },
      });

      if (existingEmail) {
        throw new Error('该邮箱已注册');
      }
    }

    // 获取或创建默认角色
    const roleName = params.type === UserType.ADMIN ? 'admin' : params.type === UserType.MERCHANT ? 'merchant' : 'customer';
    const role = await Role.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error('角色不存在');
    }

    // 加密密码
    const hashedPassword = await authService.hashPassword(params.password);

    // 创建用户
    const user = await User.create({
      phone: params.phone,
      email: params.email,
      password: hashedPassword,
      type: params.type || UserType.CUSTOMER,
      status: UserStatus.ACTIVE,
      role_id: params.roleId || role.id,
    });

    // 创建用户资料
    if (params.profile) {
      await UserProfile.create({
        user_id: user.id,
        nickname: params.profile.nickname,
        gender: params.profile.gender,
        birthdate: params.profile.birthdate,
      });
    } else {
      // 创建默认用户资料
      await UserProfile.create({
        user_id: user.id,
        nickname: `用户${params.phone.slice(-4)}`,
      });
    }

    logger.info(`用户 ${user.phone} 注册成功`);
    return user;
  }

  /**
   * 用户登录
   * @param phone 手机号
   * @param password 密码
   * @returns 登录结果
   */
  async login(phone: string, password: string): Promise<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    // 查找用户
    const user = await User.findOne({
      where: { phone },
    });

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('用户账号已被锁定或禁用');
    }

    // 验证密码
    const isPasswordValid = await authService.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      // 增加密码错误计数
      await User.update(
        {
          password_error_count: user.password_error_count + 1,
          password_locked_at: user.password_error_count >= 5 ? new Date() : null,
          status: user.password_error_count >= 5 ? UserStatus.LOCKED : user.status,
        },
        {
          where: { id: user.id },
        }
      );

      if (user.password_error_count >= 4) {
        throw new Error('密码错误次数过多，账号已被锁定');
      }

      throw new Error('用户名或密码错误');
    }

    // 生成令牌
    const tokens = await authService.createAuthTokens(user);

    logger.info(`用户 ${user.phone} 登录成功`);
    return {
      user,
      ...tokens,
    };
  }

  /**
   * 根据ID获取用户信息
   * @param id 用户ID
   * @returns 用户信息
   */
  async getUserById(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      include: [
        { model: Role, attributes: ['id', 'name', 'description'] },
        { model: UserProfile, attributes: ['id', 'real_name', 'nickname', 'avatar_url'] },
      ],
    });
  }

  /**
   * 根据手机号获取用户信息
   * @param phone 手机号
   * @returns 用户信息
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    return await User.findOne({
      where: { phone },
      include: [
        { model: Role, attributes: ['id', 'name', 'description'] },
        { model: UserProfile, attributes: ['id', 'real_name', 'nickname', 'avatar_url'] },
      ],
    });
  }

  /**
   * 获取用户列表
   * @param params 查询参数
   * @returns 用户列表
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    keyword?: string;
    type?: UserType;
    status?: UserStatus;
  } = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const where = {} as any;

    if (params.keyword) {
      where[Op.or] = [
        { phone: { [Op.like]: `%${params.keyword}%` } },
        { email: { [Op.like]: `%${params.keyword}%` } },
        { '$user_profile.nickname$': { [Op.like]: `%${params.keyword}%` } },
        { '$user_profile.real_name$': { [Op.like]: `%${params.keyword}%` } },
      ];
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.status) {
      where.status = params.status;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      include: [
        { model: Role, attributes: ['id', 'name', 'description'] },
        { model: UserProfile, attributes: ['id', 'real_name', 'nickname', 'avatar_url'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      users: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param params 更新参数
   * @returns 更新后的用户信息
   */
  async updateUser(id: string, params: UserUpdateParams): Promise<User | null> {
    await User.update(params, {
      where: { id },
    });

    logger.info(`用户 ${id} 更新成功`);
    return await this.getUserById(id);
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  async deleteUser(id: string): Promise<boolean> {
    const result = await User.destroy({
      where: { id },
    });

    logger.info(`用户 ${id} 删除成功`);
    return result > 0;
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   * @returns 更新结果
   */
  async resetPassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await authService.hashPassword(newPassword);

    const result = await User.update(
      { password: hashedPassword },
      { where: { id } }
    );

    logger.info(`用户 ${id} 密码重置成功`);
    return result[0] > 0;
  }

  /**
   * 获取用户地址列表
   * @param userId 用户ID
   * @returns 用户地址列表
   */
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return await UserAddress.findAll({
      where: { user_id: userId },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
    });
  }

  /**
   * 更新用户默认地址
   * @param userId 用户ID
   * @param addressId 地址ID
   * @returns 更新结果
   */
  async setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
    // 先将所有地址设为非默认
    await UserAddress.update(
      { is_default: false },
      { where: { user_id: userId } }
    );

    // 再将指定地址设为默认
    const result = await UserAddress.update(
      { is_default: true },
      { where: { id: addressId, user_id: userId } }
    );

    return result[0] > 0;
  }
}

// 导出用户服务实例
export default new UserService();
