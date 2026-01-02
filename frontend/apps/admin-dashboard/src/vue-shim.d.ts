/**
 * Vue组件类型声明文件
 */
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: any
  export default zhCn
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '*.json' {
  const content: Record<string, any>
  export default content
}

declare module 'echarts' {
  const echarts: any
  export default echarts
}
