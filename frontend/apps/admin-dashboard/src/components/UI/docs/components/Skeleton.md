# Skeleton 骨架屏

在需要等待加载内容的位置提供一个占位图形组合。

## 何时使用

- 网络较慢，需要长时间等待加载处理的情况下。
- 图文信息内容较多的列表/卡片中。
- 只在第一次加载数据的时候使用。
- 可以被 Spin 完全代替，但是在可用的场景下可以比 Spin 提供更好的视觉效果和用户体验。

## 代码演示

### 基础用法

```tsx
import { Skeleton } from '@/components/UI'

export default function SkeletonBasic() {
  return (
    <div class="space-y-4">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  )
}
```

### 复杂组合

```tsx
import { Skeleton } from '@/components/UI'

export default function SkeletonComplex() {
  return (
    <div class="space-y-4">
      <Skeleton active>
        <Skeleton.Avatar />
        <Skeleton.Title />
        <Skeleton.Paragraph />
      </Skeleton>
    </div>
  )
}
```

### 头像

```tsx
import { Skeleton } from '@/components/UI'

export default function SkeletonAvatar() {
  return (
    <div class="space-x-4">
      <Skeleton.Avatar />
      <Skeleton.Avatar />
      <Skeleton.Avatar />
    </div>
  )
}
```

### 标题

```tsx
import { Skeleton } from '@/components/UI'

export default function SkeletonTitle() {
  return (
    <div class="space-y-4">
      <Skeleton.Title />
      <Skeleton.Title />
      <Skeleton.Title />
    </div>
  )
}
```

### 段落

```tsx
import { Skeleton } from '@/components/UI'

export default function SkeletonParagraph() {
  return (
    <div class="space-y-4">
      <Skeleton.Paragraph />
      <Skeleton.Paragraph />
      <Skeleton.Paragraph />
    </div>
  )
}
```

### 激活动画

```tsx
import { Skeleton } from '@/components/UI'

export default function SkeletonActive() {
  return (
    <div class="space-y-4">
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
    </div>
  )
}
```

### 加载状态

```tsx
import { Skeleton } from '@/components/UI'
import { ref } from 'vue'

export default function SkeletonLoading() {
  const loading = ref(true)

  return (
    <div>
      {loading.value ? (
        <Skeleton active />
      ) : (
        <div>实际内容</div>
      )}
    </div>
  )
}
```

## API

### Skeleton Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| loading | 是否显示骨架屏 | `boolean` | `true` |
| active | 是否显示动画效果 | `boolean` | `false` |
| className | 自定义类名 | `string` | - |

### Skeleton.Avatar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| size | 尺寸 | `string \| number` | `sm` / `md` / `lg` | `md` |
| shape | 形状 | `string` | `circle` / `square` | `circle` |
| className | 自定义类名 | `string` | - |

### Skeleton.Title Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| width | 宽度 | `string \| number` | `100%` |
| className | 自定义类名 | `string` | - |

### Skeleton.Paragraph Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| rows | 行数 | `number` | `3` |
| width | 宽度 | `string \| number \| (string \| number)[]` | - |
| className | 自定义类名 | `string` | - |

## 样式定制

### CSS 变量

```css
.skeleton {
  --skeleton-bg: #e5e7eb;
  --skeleton-highlight: #f3f4f6;
}
```

### 自定义样式

```tsx
<Skeleton className="custom-skeleton" />

<style>
.custom-skeleton {
  --skeleton-bg: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}
</style>
```

## 最佳实践

### 1. 列表骨架屏

```tsx
{loading.value ? (
  <div class="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} active>
        <Skeleton.Avatar />
        <Skeleton.Title />
        <Skeleton.Paragraph />
      </Skeleton>
    ))}
  </div>
) : (
  <List data={data} renderItem={renderItem} />
)}
```

### 2. 卡片骨架屏

```tsx
{loading.value ? (
  <div class="grid grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <Skeleton active>
          <Skeleton.Avatar />
          <Skeleton.Title />
          <Skeleton.Paragraph />
        </Skeleton>
      </Card>
    ))}
  </div>
) : (
  <div class="grid grid-cols-3 gap-4">
    {data.map(item => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </div>
)}
```

### 3. 表格骨架屏

```tsx
{loading.value ? (
  <div class="space-y-2">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} class="flex space-x-2">
        <Skeleton.Paragraph rows={1} width="20%" />
        <Skeleton.Paragraph rows={1} width="30%" />
        <Skeleton.Paragraph rows={1} width="30%" />
        <Skeleton.Paragraph rows={1} width="20%" />
      </div>
    ))}
  </div>
) : (
  <Table columns={columns} data={data} />
)}
```

## 常见问题

### Q: 如何实现骨架屏的动画效果？

A: 使用 `active` 属性实现骨架屏的动画效果。

### Q: 如何自定义骨架屏的样式？

A: 使用 `className` 属性添加自定义类名，然后使用 CSS 自定义样式。

### Q: 如何实现加载状态切换？

A: 使用 `loading` 属性控制骨架屏的显示和隐藏。

---

🌹 Skeleton 组件文档完成！
