import { defineConfig } from 'vitest/config';
import * as path from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境配置
    environment: 'jsdom',
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.github/',
        'docs/',
        'tests/',
        '**/*.d.ts',
        '**/node_modules/**',
      ],
    },
    // 测试文件匹配模式
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
      'backend/**/*.test.ts',
      'backend/**/*.spec.ts',
      'frontend/**/*.test.ts',
      'frontend/**/*.spec.ts'
    ],
    // 排除的文件
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.github/**',
      '**/docs/**',
      '**/*.d.ts'
    ],
    // 测试报告配置
    reporters: ['default', 'html'],
    // 测试结果输出目录
    outputFile: './test-results/results.json',
  },
  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@backend': path.resolve(__dirname, './backend'),
      '@frontend': path.resolve(__dirname, './frontend'),
      '@utils': path.resolve(__dirname, './utils'),
      // 添加 admin-dashboard 项目的别名支持
      '@admin-dashboard': path.resolve(__dirname, './frontend/apps/admin-dashboard/src'),
    },
  },
});
