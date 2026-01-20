import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/integration/**/*.test.ts',
      'backend/services/ai-assistant/src/test/**/*.test.ts',
      'backend/api-gateway/src/__tests__/integration/**/*.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.github/**',
      '**/docs/**',
      '**/*.d.ts',
      '**/unit/**',
      '**/smoke/**',
      '**/api/**',
    ],
    reporters: ['default', 'json'],
    outputFile: './test-results/integration-results.json',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@backend': path.resolve(__dirname, './backend'),
      '@frontend': path.resolve(__dirname, './frontend'),
      '@utils': path.resolve(__dirname, './utils'),
    },
  },
});
