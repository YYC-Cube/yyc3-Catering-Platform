/**
 * @fileoverview 认证控制器
 * @description 处理用户认证相关的API请求
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import userService from '../services/UserService';
import authService from '../services/AuthService';
import logger from '../config/logger';

/**
 * 认证控制器类
 */
class AuthController {
  /**
   * 用户注册
   * @param req 请求对象
   * @param res 响应对象
   */
  async register(req: Request, res: Response) {
    try {
      const { phone, password, email, type, roleId, profile } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          code: 400,
          message: '手机号和密码不能为空',
        });
      }

      const user = await userService.register({
        phone,
        password,
        email,
        type,
        roleId,
        profile,
      });

      return res.status(201).json({
        code: 201,
        message: '注册成功',
        data: user,
      });
    } catch (error: any) {
      logger.error('注册失败:', error);
      return res.status(400).json({
        code: 400,
        message: error.message || '注册失败',
      });
    }
  }

  /**
   * 用户登录
   * @param req 请求对象
   * @param res 响应对象
   */
  async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          code: 400,
          message: '手机号和密码不能为空',
        });
      }

      const result = await userService.login(phone, password);

      return res.status(200).json({
        code: 200,
        message: '登录成功',
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error: any) {
      logger.error('登录失败:', error);
      return res.status(400).json({
        code: 400,
        message: error.message || '登录失败',
      });
    }
  }

  /**
   * 刷新令牌
   * @param req 请求对象
   * @param res 响应对象
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          code: 400,
          message: '刷新令牌不能为空',
        });
      }

      const result = await authService.refreshAuthTokens(refreshToken);

      return res.status(200).json({
        code: 200,
        message: '令牌刷新成功',
        data: {
          token: result.token,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error: any) {
      logger.error('刷新令牌失败:', error);
      return res.status(400).json({
        code: 400,
        message: error.message || '刷新令牌失败',
      });
    }
  }

  /**
   * 获取当前用户信息
   * @param req 请求对象
   * @param res 响应对象
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          code: 401,
          message: '未授权',
        });
      }

      const userService = require('../services/UserService').default;
      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      return res.status(200).json({
        code: 200,
        message: '获取用户信息成功',
        data: user,
      });
    } catch (error: any) {
      logger.error('获取当前用户信息失败:', error);
      return res.status(500).json({
        code: 500,
        message: error.message || '获取用户信息失败',
      });
    }
  }

  /**
   * 登出
   * @param req 请求对象
   * @param res 响应对象
   */
  async logout(req: Request, res: Response) {
    try {
      // TODO: 实现登出逻辑，例如清除token
      return res.status(200).json({
        code: 200,
        message: '登出成功',
      });
    } catch (error: any) {
      logger.error('登出失败:', error);
      return res.status(500).json({
        code: 500,
        message: error.message || '登出失败',
      });
    }
  }
}

// 导出认证控制器实例
export default new AuthController();
