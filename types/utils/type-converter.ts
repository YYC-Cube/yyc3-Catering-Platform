/**
 * @file 类型转换工具
 * @description 前后端类型转换工具
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

import type {
  AuthUser,
  FrontendUser,
} from '../entities/user';
import { UserRole } from '../entities/user'; // 用 import 而不是 import type
import type { PageData } from '../services/api';

/**
 * 类型转换类
 */
export class TypeConverter {
  /**
   * 前端用户转后端认证用户
   */
  static frontendUserToAuthUser(frontendUser: FrontendUser): AuthUser {
    return {
      id: String(frontendUser.id),
      email: frontendUser.email,
      name: frontendUser.name,
      avatar: frontendUser.avatar,
      phone: frontendUser.phone,
      status: frontendUser.status,
      createdAt: frontendUser.createdAt,
      lastLoginAt: frontendUser.lastLoginAt,
      roles: [frontendUser.role],
      permissions: [],
    } as AuthUser;
  }

  /**
   * 后端认证用户转前端用户
   */
  static authUserToFrontendUser(authUser: AuthUser): FrontendUser {
    const primaryRole = authUser.roles[0] || UserRole.CUSTOMER;
    return {
      id: parseInt(authUser.id, 10) || 0,
      email: authUser.email,
      name: authUser.name || '',
      role: primaryRole,
      avatar: authUser.avatar,
      phone: authUser.phone,
      status: authUser.status,
      createdAt: typeof authUser.createdAt === 'string'
        ? authUser.createdAt
        : authUser.createdAt.toISOString(),
      lastLoginAt: authUser.lastLoginAt
        ? typeof authUser.lastLoginAt === 'string'
          ? authUser.lastLoginAt
          : authUser.lastLoginAt.toISOString()
        : undefined,
    } as FrontendUser;
  }

  /**
   * 字符串 ID 转数字 ID
   */
  static stringIdToNumber(id: string): number {
    const num = parseInt(id, 10);
    if (isNaN(num)) {
      throw new Error(`Invalid ID format: ${id}`);
    }
    return num;
  }

  /**
   * 数字 ID 转字符串 ID
   */
  static numberIdToString(id: number): string {
    return String(id);
  }

  /**
   * 日期对象转 ISO 字符串
   */
  static dateToISOString(date: Date | string): string {
    return typeof date === 'string' ? date : date.toISOString();
  }

  /**
   * ISO 字符串转日期对象
   */
  static isoStringToDate(isoString: string): Date {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${isoString}`);
    }
    return date;
  }

  /**
   * 批量转换用户
   */
  static convertUsers(authUsers: AuthUser[]): FrontendUser[] {
    return authUsers.map(this.authUserToFrontendUser);
  }

  /**
   * 转换分页数据
   */
  static convertPaginationData<T, U>(
    data: PageData<T>,
    converter: (item: T) => U
  ): PageData<U> {
    return {
      ...data,
      items: data.items.map(converter),
    };
  }
}
