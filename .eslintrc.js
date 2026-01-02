/**
 * @file ESLint配置文件
 * @description 定义项目的代码风格检查规则
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier', // 确保prettier规则覆盖ESLint规则
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import', 'promise'],
  rules: {
    // 基本规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // 由@typescript-eslint/no-unused-vars替代
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'indent': 'off', // 由@typescript-eslint/indent替代
    
    // TypeScript规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/semi': ['error', 'always'],
    
    // Import规则
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'off', // 由TypeScript的模块解析处理
    'import/named': 'off', // 由TypeScript的类型检查处理
    
    // Promise规则
    'promise/always-return': 'error',
    'promise/no-native': 'off',
    'promise/catch-or-return': 'error',
    'promise/no-nesting': 'warn',
  },
  ignorePatterns: ['dist', 'node_modules', '*.d.ts', 'frontend/node_modules', 'frontend/dist'],
};
