/**
 * @fileoverview YYC³餐饮行业智能化平台 - 订单管理功能端到端测试
 * @description 测试订单管理流程，包括订单列表查看、订单详情、状态更新等场景
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { test, expect } from '@playwright/test';

// 测试前先登录的辅助函数
async function login(page: any) {
  await page.goto('/login');
  await page.getByLabel('用户名').fill('admin');
  await page.getByLabel('密码').fill('password123');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test.describe('订单管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 导航到订单管理页面
    await page.getByRole('link', { name: '订单管理' }).click();
    await expect(page).toHaveURL('/orders');
  });

  test('订单列表应该正常加载', async ({ page }) => {
    // 验证页面标题
    await expect(page.getByText('订单列表')).toBeVisible();
    
    // 验证订单列表表格存在
    await expect(page.locator('.order-table')).toBeVisible();
    
    // 验证表格列标题存在
    await expect(page.getByText('订单编号')).toBeVisible();
    await expect(page.getByText('客户信息')).toBeVisible();
    await expect(page.getByText('订单状态')).toBeVisible();
    await expect(page.getByText('订单金额')).toBeVisible();
    await expect(page.getByText('下单时间')).toBeVisible();
  });

  test('应该可以搜索订单', async ({ page }) => {
    // 输入订单编号进行搜索
    const searchInput = page.getByPlaceholder('搜索订单编号');
    await searchInput.fill('ORD001');
    
    // 点击搜索按钮
    await page.getByRole('button', { name: '搜索' }).click();
    
    // 验证搜索结果
    await expect(page.getByText('ORD001')).toBeVisible();
  });

  test('应该可以查看订单详情', async ({ page }) => {
    // 点击第一个订单的详情按钮
    await page.locator('.order-item').first().getByRole('button', { name: '详情' }).click();
    
    // 验证订单详情对话框显示
    await expect(page.locator('.order-detail-dialog')).toBeVisible();
    
    // 验证详情内容存在
    await expect(page.getByText('订单详情')).toBeVisible();
    await expect(page.getByText('菜品列表')).toBeVisible();
    
    // 关闭对话框
    await page.getByRole('button', { name: '关闭' }).click();
    await expect(page.locator('.order-detail-dialog')).not.toBeVisible();
  });

  test('应该可以更新订单状态', async ({ page }) => {
    // 点击第一个订单的状态更新按钮
    await page.locator('.order-item').first().getByRole('button', { name: '更新状态' }).click();
    
    // 选择新状态
    await page.getByRole('combobox', { name: '订单状态' }).selectOption('preparing');
    
    // 点击保存按钮
    await page.getByRole('button', { name: '保存' }).click();
    
    // 验证状态更新成功
    await expect(page.getByText('准备中')).toBeVisible();
    await expect(page.getByText('状态更新成功')).toBeVisible();
  });

  test('应该可以导出订单数据', async ({ page }) => {
    // 点击导出按钮
    await page.getByRole('button', { name: '导出订单' }).click();
    
    // 验证导出功能正常工作（检查下载开始）
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '确认导出' }).click();
    const download = await downloadPromise;
    
    // 验证下载文件的名称和类型
    expect(download.suggestedFilename()).toContain('orders-');
    expect(download.suggestedFilename()).toEndWith('.xlsx');
  });
});
