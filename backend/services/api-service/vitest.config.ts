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
        '**/*.d.ts',
        '**/node_modules/**',
        '**/__tests__/**'
      ]
    },
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts'
    ],
    reporters: ['default', 'html'],
    outputFile: './test-results/results.json'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
