/**
 * Vite 环境类型定义
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_ENABLE_MOCK: string;
  // 添加其他环境变量的类型定义
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
