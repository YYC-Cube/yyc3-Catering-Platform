import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    exclude: ['node_modules', 'dist', '.git'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/types/**/*.ts'],
      reporter: ['text', 'json', 'html']
    }
  }
});
