/**
 * YYC³餐饮行业智能化平台 - 环境变量和全局类型声明
 */

// 扩展 ImportMeta 接口，添加 env 属性
declare interface ImportMeta {
  env: {
    BASE_URL: string;
    MODE: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
  };
}

// 扩展 Window 接口，添加全局属性
declare interface Window {
  echarts?: any;
  __VUE_APP__?: any;
  __DEV_TOOLS__?: {
    $app?: any;
    $pinia?: any;
    $router?: any;
    $echarts?: any;
  };
  __VUE_DEVTOOLS_GLOBAL_HOOK__?: {
    force?: boolean;
  };
}

// 声明 Vue 组件全局属性
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $echarts: any;
    $env: string;
    $pinia: any;
    $router: any;
  }
}

export {}
