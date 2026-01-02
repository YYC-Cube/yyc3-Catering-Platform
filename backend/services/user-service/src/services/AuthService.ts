/**
 * @fileoverview 认证服务
 * @description 处理用户认证相关业务逻辑，包括密码加密、JWT生成等
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config';
import logger from '../config/logger';
import { User } from '../models/User';

/**
 * 认证服务类
 */
class AuthService {
  /**
   * 加密密码
   * @param password 原始密码
   * @returns 加密后的密码
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  /**
   * 验证密码
   * @param password 原始密码
   * @param hashedPassword 加密后的密码
   * @returns 验证结果
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * 生成JWT令牌
   * @param user 用户信息
   * @returns JWT令牌
   */
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      type: user.type,
      role: user.role_id,
      iat: Date.now(),
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * 生成刷新令牌
   * @param user 用户信息
   * @returns 刷新令牌
   */
  generateRefreshToken(user: User): string {
    const payload = {
      id: user.id,
      refresh_token_id: uuidv4(),
      iat: Date.now(),
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 解码后的令牌信息
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      logger.error('令牌验证失败:', error);
      throw new Error('无效的令牌');
    }
  }

  /**
   * 解析JWT令牌
   * @param token JWT令牌
   * @returns 解码后的令牌信息
   */
  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * 创建或更新用户令牌
   * @param user 用户信息
   * @returns 令牌信息
   */
  async createAuthTokens(user: User): Promise<{
    token: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 更新用户最后登录时间和登录次数
    await User.update(
      {
        last_login_at: new Date(),
        login_count: user.login_count + 1,
        password_error_count: 0, // 登录成功后重置密码错误计数
      },
      {
        where: { id: user.id },
      }
    );

    return {
      token,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * 验证用户身份并生成新令牌
   * @param refreshToken 刷新令牌
   * @returns 新的令牌信息
   */
  async refreshAuthTokens(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    try {
      const decoded = this.verifyToken(refreshToken);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new Error('用户不存在');
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: config.jwt.expiresIn,
      };
    } catch (error) {
      logger.error('刷新令牌失败:', error);
      throw new Error('无效的刷新令牌');
    }
  }
}

// 导出认证服务实例
export default new AuthService();
