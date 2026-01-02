/**
 * @fileoverview 用户服务路由定义
 * @description 定义用户服务的所有API路由
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express from 'express';
import authController from '../controllers/AuthController';
import userController from '../controllers/UserController';
import { authenticateToken, checkRole, checkUserType } from '../middleware/authMiddleware';

const router = express.Router();

// 认证相关路由（无需认证）
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// 需要认证的路由
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);

// 用户管理路由（需要管理员权限）
router.get('/users', authenticateToken, checkRole(['admin', 'manager']), userController.getAllUsers);
router.get('/users/:id', authenticateToken, checkRole(['admin', 'manager']), userController.getUserById);
router.put('/users/:id', authenticateToken, checkRole(['admin', 'manager']), userController.updateUser);
router.delete('/users/:id', authenticateToken, checkRole(['admin']), userController.deleteUser);
router.patch('/users/:id/status', authenticateToken, checkRole(['admin', 'manager']), userController.updateUserStatus);
router.patch('/users/:id/password', authenticateToken, checkRole(['admin', 'manager']), userController.updatePassword);
router.post('/users/:id/reset-password', authenticateToken, checkRole(['admin']), userController.resetPassword);

// 用户自身操作路由
router.put('/profile', authenticateToken, (req, res) => {
  // 将请求转发到用户控制器的更新方法
  const userId = (req as any).user?.id;
  (req as any).params.id = userId;
  userController.updateUser(req, res);
});

router.patch('/password', authenticateToken, (req, res) => {
  // 将请求转发到用户控制器的更新密码方法
  const userId = (req as any).user?.id;
  (req as any).params.id = userId;
  userController.updatePassword(req, res);
});

export default router;
