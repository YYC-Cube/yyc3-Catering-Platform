/**
 * @file vitest.api-gateway.config.ts
 * @description YYC³餐饮行业智能化平台 - API网关单元测试配置文件
 * @module vitest.api-gateway.config
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
    root: './backend/api-gateway',
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
        '**/*.vue',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.github/**',
      '**/docs/**',
      '**/*.d.ts',
      '**/*.vue',
    ],
    reporters: ['default', 'json'],
    outputFile: './test-results/api-gateway-unit-results.json',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './backend/api-gateway/src'),
      '@backend': path.resolve(__dirname, './backend'),
    },
    extensions: ['.ts', '.js', '.json'],
  },
});