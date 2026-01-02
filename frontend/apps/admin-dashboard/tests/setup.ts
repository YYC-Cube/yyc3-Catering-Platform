// 导入测试工具
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

// 创建测试应用实例
export function createTestApp(component: any, options: any = {}) {
  const app = createApp(component, options)
  const pinia = createPinia()
  
  app.use(pinia)
  
  return app
}

// 在每个测试后清理DOM
afterEach(() => {
  cleanup()
})
