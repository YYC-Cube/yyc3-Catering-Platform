# Badge 徽章

徽章用于显示状态或数量。

## 何时使用

- 显示状态（如成功、警告、错误等）
- 显示数量（如未读消息数）
- 标记重要信息

## 代码演示

### 基础用法

使用 `variant` 属性来设置徽章的样式。

```tsx
import { Badge } from '@/components/UI'

export default function BadgeBasic() {
  return (
    <div class="space-x-2">
      <Badge variant="default">默认</Badge>
      <Badge variant="primary">主要</Badge>
      <Badge variant="success">成功</Badge>
      <Badge variant="warning">警告</Badge>
      <Badge variant="danger">危险</Badge>
    </div>
  )
}
```

### 尺寸

使用 `size` 属性来设置徽章的尺寸。

```tsx
import { Badge } from '@/components/UI'

export default function BadgeSize() {
  return (
    <div class="space-x-2">
      <Badge size="sm">小型</Badge>
      <Badge size="md">中型</Badge>
      <Badge size="lg">大型</Badge>
    </div>
  )
}
```

### 圆角

使用 `rounded` 属性来设置徽章的圆角。

```tsx
import { Badge } from '@/components/UI'

export default function BadgeRounded() {
  return (
    <div class="space-x-2">
      <Badge rounded="none">无圆角</Badge>
      <Badge rounded="sm">小圆角</Badge>
      <Badge rounded="md">中圆角</Badge>
      <Badge rounded="full">全圆角</Badge>
    </div>
  )
}
```

### 计数徽章

使用 `count` 属性来显示数量。

```tsx
import { Badge } from '@/components/UI'

export default function BadgeCount() {
  return (
    <div class="space-x-2">
      <Badge count={5}>消息</Badge>
      <Badge count={99}>通知</Badge>
      <Badge count={100} maxCount={99}>消息</Badge>
    </div>
  )
}
```

### 点状徽章

使用 `dot` 属性来显示点状徽章。

```tsx
import { Badge } from '@/components/UI'

export default function BadgeDot() {
  return (
    <div class="space-x-2">
      <Badge dot>消息</Badge>
      <Badge dot variant="success">在线</Badge>
      <Badge dot variant="danger">离线</Badge>
    </div>
  )
}
```

## API

### Badge Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| variant | 样式类型 | `string` | `default` / `primary` / `success` / `warning` / `danger` | `default` |
| size | 尺寸 | `string` | `sm` / `md` / `lg` | `md` |
| rounded | 圆角 | `string` | `none` / `sm` / `md` / `full` | `md` |
| count | 数量 | `number` | - | - |
| maxCount | 最大数量 | `number` | - | `99` |
| dot | 是否显示点状 | `boolean` | - | `false` |
| className | 自定义类名 | `string` | - | - |

### Badge Slots

| 插槽名 | 说明 |
|--------|------|
| default | 默认内容 |

## 样式定制

### CSS 变量

```css
.badge {
  --badge-bg-color: #3b82f6;
  --badge-text-color: #ffffff;
  --badge-padding-x: 0.5rem;
  --badge-padding-y: 0.25rem;
  --badge-font-size: 0.875rem;
  --badge-border-radius: 0.25rem;
}
```

### 自定义样式

```tsx
<Badge className="custom-badge">自定义徽章</Badge>

<style>
.custom-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  font-weight: bold;
}
</style>
```

## 最佳实践

### 1. 状态指示

```tsx
<Badge variant="success">已激活</Badge>
<Badge variant="warning">待审核</Badge>
<Badge variant="danger">已禁用</Badge>
```

### 2. 数量显示

```tsx
<Badge count={unreadCount}>
  <Button>消息</Button>
</Badge>
```

### 3. 标记重要信息

```tsx
<Badge variant="danger" rounded="full">
  重要
</Badge>
```

## 常见问题

### Q: 如何自定义徽章颜色？

A: 可以通过 `className` 属性添加自定义类名，然后使用 CSS 自定义样式。

### Q: 如何隐藏徽章？

A: 可以通过 `v-if` 或 `v-show` 控制徽章的显示。

### Q: 如何在徽章中显示图标？

A: 可以通过默认插槽在徽章中插入图标。

---

🌹 Badge 组件文档完成！
