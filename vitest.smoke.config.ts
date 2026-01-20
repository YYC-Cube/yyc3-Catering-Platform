import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/smoke/**/*.test.ts',
      'tests/example.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.github/**',
      '**/docs/**',
      '**/*.d.ts',
      '**/unit/**',
      '**/integration/**',
      '**/api/**',
    ],
    reporters: ['default', 'json'],
    outputFile: './test-results/smoke-results.json',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
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
