# Avatar 头像

用来代表用户或事物，支持图片、图标或字符展示。

## 何时使用

- 用户、事物或形状的展示。
- 推荐使用形状来表示事物或人物，展示更加直观。

## 代码演示

### 基础用法

```tsx
import { Avatar } from '@/components/UI'

export default function AvatarBasic() {
  return (
    <div class="space-x-2">
      <Avatar src="https://i.pravatar.cc/150?img=1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" />
    </div>
  )
}
```

### 类型

```tsx
import { Avatar } from '@/components/UI'

export default function AvatarType() {
  return (
    <div class="space-x-2">
      <Avatar src="https://i.pravatar.cc/150?img=1" />
      <Avatar>U</Avatar>
      <Avatar icon="👤" />
    </div>
  )
}
```

### 尺寸

```tsx
import { Avatar } from '@/components/UI'

export default function AvatarSize() {
  return (
    <div class="space-x-2">
      <Avatar size="sm" src="https://i.pravatar.cc/150?img=1" />
      <Avatar size="md" src="https://i.pravatar.cc/150?img=2" />
      <Avatar size="lg" src="https://i.pravatar.cc/150?img=3" />
      <Avatar size={80} src="https://i.pravatar.cc/150?img=4" />
    </div>
  )
}
```

### 形状

```tsx
import { Avatar } from '@/components/UI'

export default function AvatarShape() {
  return (
    <div class="space-x-2">
      <Avatar shape="circle" src="https://i.pravatar.cc/150?img=1" />
      <Avatar shape="square" src="https://i.pravatar.cc/150?img=2" />
    </div>
  )
}
```

### 带徽标

```tsx
import { Avatar, Badge } from '@/components/UI'

export default function AvatarWithBadge() {
  return (
    <div class="space-x-2">
      <Badge count={5}>
        <Avatar src="https://i.pravatar.cc/150?img=1" />
      </Badge>
      <Badge dot>
        <Avatar src="https://i.pravatar.cc/150?img=2" />
      </Badge>
    </div>
  )
}
```

### 组合

```tsx
import { Avatar } from '@/components/UI'

export default function AvatarGroup() {
  return (
    <div class="space-x-2">
      <Avatar src="https://i.pravatar.cc/150?img=1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" />
      <Avatar>+5</Avatar>
    </div>
  )
}
```

## API

### Avatar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片地址 | `string` | - |
| alt | 文本描述 | `string` | - |
| icon | 图标 | `VNode` | - |
| size | 尺寸 | `string \| number` | `sm` / `md` / `lg` | `md` |
| shape | 形状 | `string` | `circle` / `square` | `circle` |
| className | 自定义类名 | `string` | - |

## 样式定制

### CSS 变量

```css
.avatar {
  --avatar-bg: #e5e7eb;
  --avatar-text: #6b7280;
  --avatar-border: #d1d5db;
}
```

### 自定义样式

```tsx
<Avatar className="custom-avatar" src="https://i.pravatar.cc/150?img=1" />

<style>
.custom-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
```

## 最佳实践

### 1. 用户头像

```tsx
<Avatar
  src={user.avatar}
  alt={user.name}
  size="md"
/>
```

### 2. 头像组

```tsx
<div class="flex -space-x-2">
  {users.slice(0, 3).map(user => (
    <Avatar
      key={user.id}
      src={user.avatar}
      size="sm"
    />
  ))}
  {users.length > 3 && (
    <Avatar size="sm">+{users.length - 3}</Avatar>
  )}
</div>
```

### 3. 状态头像

```tsx
<div class="relative">
  <Avatar src={user.avatar} size="lg" />
  <span class={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
    user.online ? 'bg-success-500' : 'bg-neutral-400'
  }`} />
</div>
```

## 常见问题

### Q: 如何自定义头像的尺寸？

A: 使用 `size` 属性设置头像的尺寸。

### Q: 如何实现头像组？

A: 使用多个 Avatar 组件组合实现头像组。

### Q: 如何实现带状态的头像？

A: 使用绝对定位的元素实现带状态的头像。

---

🌹 Avatar 组件文档完成！
