# YYC³ UI 组件库文档

## 📚 组件库概述

YYC³ UI 组件库是基于 Vue 3 + TypeScript + Tailwind CSS 构建的现代化 UI 组件库，专为餐饮行业智能化平台设计。

### 🎯 设计原则

- **一致性**: 统一的视觉风格和交互模式
- **可访问性**: 遵循 WCAG 2.1 标准
- **响应式**: 适配各种屏幕尺寸
- **主题化**: 支持明暗主题切换
- **类型安全**: 完整的 TypeScript 类型定义
- **性能优化**: 轻量级、高性能

### 📦 组件分类

#### 基础组件
- [Input](./components/Input.md) - 输入框
- [Card](./components/Card.md) - 卡片
- [Badge](./components/Badge.md) - 徽章
- [Alert](./components/Alert.md) - 警告提示

#### 表单组件
- [Form](./components/Form.md) - 表单
- [Select](./components/Select.md) - 选择器
- [Checkbox](./components/Checkbox.md) - 复选框
- [Radio](./components/Radio.md) - 单选框
- [Switch](./components/Switch.md) - 开关

#### 导航组件
- [Dropdown](./components/Dropdown.md) - 下拉菜单
- [Breadcrumb](./components/Breadcrumb.md) - 面包屑
- [Pagination](./components/Pagination.md) - 分页

#### 数据展示组件
- [Table](./components/Table.md) - 表格
- [List](./components/List.md) - 列表
- [Tree](./components/Tree.md) - 树形控件
- [Timeline](./components/Timeline.md) - 时间轴

#### 反馈组件
- [Modal](./components/Modal.md) - 模态框
- [Drawer](./components/Drawer.md) - 抽屉
- [Dialog](./components/Dialog.md) - 对话框
- [Tooltip](./components/Tooltip.md) - 提示框

#### 布局组件
- [Layout](./components/Layout.md) - 布局
- [Grid](./components/Grid.md) - 网格
- [Space](./components/Space.md) - 间距
- [Flex](./components/Flex.md) - 弹性布局

#### 其他组件
- [Avatar](./components/Avatar.md) - 头像
- [Divider](./components/Divider.md) - 分割线
- [Skeleton](./components/Skeleton.md) - 骨架屏
- [Empty](./components/Empty.md) - 空状态

### 🚀 快速开始

#### 安装

```bash
pnpm install
```

#### 使用

```tsx
import { Button, Input, Card } from '@/components/UI'

export default function App() {
  return (
    <Card>
      <Input placeholder="请输入内容" />
      <Button type="primary">提交</Button>
    </Card>
  )
}
```

### 🎨 主题配置

#### 主题变量

```typescript
// src/config/theme.ts
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // ... 其他颜色
  },
}
```

#### 使用主题

```tsx
import { ThemeProvider } from '@/components/UI/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  )
}
```

### 📖 开发指南

#### 组件开发规范

1. **命名规范**: 使用 PascalCase 命名组件
2. **类型定义**: 所有 props 必须有类型定义
3. **样式规范**: 使用 Tailwind CSS 类名
4. **文档注释**: 每个组件必须有完整的 JSDoc 注释
5. **测试覆盖**: 每个组件必须有单元测试

#### 组件模板

```tsx
/**
 * @fileoverview 组件描述
 * @description 详细说明
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, type PropType } from 'vue'
import { cn } from '@/utils/cn'

export const ComponentName = defineComponent({
  name: 'ComponentName',
  props: {
    // props 定义
  },
  emits: ['event-name'],
  setup(props, { emit, slots }) {
    // 逻辑实现
    return () => (
      // JSX 渲染
    )
  },
})
```

### 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 📄 许可证

MIT License
