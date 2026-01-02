import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'

// 样式导入
import './styles/globals.scss'
import 'element-plus/theme-chalk/index.css'

// Element Plus 组件导入
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建应用实例
const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 安装插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000
})

// 全局属性
app.config.globalProperties.$env = import.meta.env.MODE

// 错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue Error:', error, info)

  // 在生产环境中，可以发送错误到监控服务
  if (import.meta.env.PROD) {
    // 例如：Sentry.captureException(error)
  }
}

// 警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue Warning:', msg, trace)
}

// 性能监控（仅在开发环境）
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 挂载应用
app.mount('#app')

// PWA 注册（如果启用）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}