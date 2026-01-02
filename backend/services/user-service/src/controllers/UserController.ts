/**
 * @fileoverview 用户控制器
 * @description 处理用户管理相关的API请求
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import userService from '../services/UserService';
import logger from '../config/logger';

/**
 * 用户控制器类
 */
class UserController {
  /**
   * 获取所有用户列表
   * @param req 请求对象
   * @param res 响应对象
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, type, status, keyword } = req.query;

      const result = await userService.getAllUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string,
        keyword: keyword as string,
      });

      return res.status(200).json({
        code: 200,
        message: '获取用户列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取用户列表失败:', error);
      return res.status(500).json({
        code: 500,
        message: error.message || '获取用户列表失败',
      });
    }
  }

  /**
   * 根据ID获取用户详情
   * @param req 请求对象
   * @param res 响应对象
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      return res.status(200).json({
        code: 200,
        message: '获取用户详情成功',
        data: user,
      });
    } catch (error: any) {
      logger.error('获取用户详情失败:', error);
      return res.status(500).json({
        code: 500,
        message: error.message || '获取用户详情失败',
      });
    }
  }

  /**
   * 更新用户信息
   * @param req 请求对象
   * @param res 响应对象
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedUser = await userService.updateUser(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      return res.status(200).json({
        code: 200,
        message: '更新用户信息成功',
        data: updatedUser,
      });
    } catch (error: any) {
      logger.error('更新用户信息失败:', error);
      return res.status(400).json({
        code: 400,
        message: error.message || '更新用户信息失败',
      });
    }
  }

  /**
   * 删除用户
   * @param req 请求对象
   * @param res 响应对象
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await userService.deleteUser(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      return res.status(200).json({
        code: 200,
        message: '删除用户成功',
      });
    } catch (error: any) {
      logger.error('删除用户失败:', error);
      return res.status(500).json({
        code: 500,
        message: error.message || '删除用户失败',
      });
    }
  }

  /**
   * 更新用户状态
   * @param req 请求对象
   * @param res 响应对象
   */
  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedUser = await userService.updateUserStatus(id, status);

      if (!updatedUser) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      return res.status(200).json({
        code: 200,
        message: '更新用户状态成功',
        data: updatedUser,
      });
    } catch (error: any) {
      logger.error('更新用户状态失败:', error);
      return res.status(400).json({
        code: 400,
        message: error.message || '更新用户状态失败',
      });
    }
  }

  /**
   * 更新用户密码
   * @param req 请求对象
   * @param res 响应对象
   */
  async updatePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      const result = await userService.updatePassword(id, oldPassword, newPassword);

      if (!result) {
        return res.status(400).json({
          code: 400,
          message: '原密码错误',
        });
      }

      return res.status(200).json({
        code: 200,
        message: '更新密码成功',
      });
    } catch (error: any) {
      logger.error('更新密码失败:', error);
      return res.status(400).json({
        code: 400,
        message: error.message || '更新密码失败',
      });
    }
  }

  /**
   * 重置用户密码
   * @param req 请求对象
   * @param res 响应对象
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await userService.resetPassword(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      return res.status(200).json({
        code: 200,
        message: '密码重置成功',
        data: {
          newPassword: result.newPassword,
        },
      });
    } catch (error: any) {
      logger.error('重置密码失败:', error);
      return res.status(500).json({
        code: 500,
        message: error.message || '重置密码失败',
      });
    }
  }
}

// 导出用户控制器实例
export default new UserController();
