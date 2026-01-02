/**
 * YYC³餐饮行业智能化平台 - UI系统入口文件
 * 统一导出样式和组件
 */

// 导出统一样式系统
import './styles/global.scss';

// 导出设计令牌（可选，用于直接引用变量）
// 注意：SCSS变量需要通过CSS变量在JavaScript中使用

export default {
  // 版本信息
  version: '1.0.0',
  
  // 初始化函数
  install(app) {
    // 可以在这里注册全局组件或指令
    console.log('YYC³ UI System installed successfully');
  }
};

// 导出UI系统的核心功能
export * from './styles/design-tokens.scss';
