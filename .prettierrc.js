/**
 * @file Prettier配置文件
 * @description 定义项目的代码格式化规则
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

module.exports = {
  // 基本配置
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  proseWrap: 'always',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',
  
  // 特定文件类型的配置
  overrides: [
    {
      files: '*.json',
      options: {
        trailingComma: 'none',
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'preserve',
        singleQuote: false,
      },
    },
    {
      files: '*.ts',
      options: {
        trailingComma: 'all',
      },
    },
    {
      files: '*.tsx',
      options: {
        trailingComma: 'all',
      },
    },
  ],
};
