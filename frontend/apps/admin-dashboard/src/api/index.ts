/**
 * YYC³餐饮行业智能化平台 - API入口文件
 */

export * from './auth'
export * from './menu'
export * from './order'
export * from './member'
export * from './marketing'
export * from './payment'

// 导出默认API实例
export { authApi } from './auth'
export { menuApi } from './menu'
export { orderApi } from './order'
export { memberApi } from './member'
export { marketingApi } from './marketing'
export { paymentApi } from './payment'