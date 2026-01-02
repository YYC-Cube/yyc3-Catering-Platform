/**
 * @fileoverview YYC³餐饮行业智能化平台 - 登录功能端到端测试
 * @description 测试用户登录流程，包括成功登录、失败登录、表单验证等场景
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { test, expect } from '@playwright/test';

test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页面
    await page.goto('/login');
  });

  test('登录页面应该正常加载', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/登录/);
    
    // 验证登录表单元素存在
    await expect(page.getByLabel('用户名')).toBeVisible();
    await expect(page.getByLabel('密码')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('成功登录应该跳转到仪表盘', async ({ page }) => {
    // 输入有效的登录凭证
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('password123');
    
    // 点击登录按钮
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证是否跳转到仪表盘页面
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('工作台')).toBeVisible();
  });

  test('使用无效凭证登录应该显示错误信息', async ({ page }) => {
    // 输入无效的登录凭证
    await page.getByLabel('用户名').fill('invaliduser');
    await page.getByLabel('密码').fill('invalidpassword');
    
    // 点击登录按钮
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证错误信息显示
    await expect(page.getByText(/用户名或密码错误/)).toBeVisible();
    // 验证仍然在登录页面
    await expect(page).toHaveURL('/login');
  });

  test('空字段登录应该显示验证错误', async ({ page }) => {
    // 不输入任何内容，直接点击登录按钮
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证表单验证错误显示
    await expect(page.getByText(/请输入用户名/)).toBeVisible();
    await expect(page.getByText(/请输入密码/)).toBeVisible();
  });

  test('忘记密码链接应该正常工作', async ({ page }) => {
    // 点击忘记密码链接
    await page.getByRole('link', { name: '忘记密码' }).click();
    
    // 验证是否跳转到忘记密码页面
    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.getByText('忘记密码')).toBeVisible();
  });
});
