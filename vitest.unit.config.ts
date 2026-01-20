/**
 * @file vitest.unit.config.ts
 * @description YYC³餐饮行业智能化平台 - 单元测试配置文件
 * @module vitest.unit.config
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.github/',
        'docs/',
        'tests/',
        'frontend/',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/*.vue',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
    include: [
      'backend/**/__tests__/unit/**/*.test.ts',
      'backend/**/__tests__/unit/**/*.spec.ts',
      'utils/**/*.test.ts',
      'utils/**/*.spec.ts',
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.spec.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.github/**',
      '**/docs/**',
      '**/*.d.ts',
      '**/*.vue',
      'frontend/**',
      '**/__tests__/integration/**',
      '**/__tests__/e2e/**',
      '**/__tests__/smoke/**',
    ],
    reporters: ['default', 'json'],
    outputFile: './test-results/unit-results.json',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@backend': path.resolve(__dirname, './backend'),
      '@frontend': path.resolve(__dirname, './frontend'),
      '@utils': path.resolve(__dirname, './utils'),
    },
    extensions: ['.ts', '.js', '.json'],
  },
});
