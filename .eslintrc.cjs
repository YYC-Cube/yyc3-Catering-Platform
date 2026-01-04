module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    'build',
    'docs',
    'tests',
    'agentic-core',
    'frontend',
    'backend',
    // 忽略旧的类型定义文件
    'types/unified.d.ts',
    'types/global.d.ts',
    'types/api-versioning.d.ts',
    'types/validation.d.ts',
  ],
};
