# Button 按钮

按钮用于开始一个即时操作。

## 何时使用

标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。

## 代码演示

### 基础用法

使用 `type`、`plain`、`round` 和 `circle` 属性来定义按钮的样式。

```tsx
import { Button } from '@/components/UI'

export default function ButtonBasic() {
  return (
    <div class="space-x-2">
      <Button type="primary">主要按钮</Button>
      <Button>默认按钮</Button>
      <Button type="success">成功按钮</Button>
      <Button type="warning">警告按钮</Button>
      <Button type="danger">危险按钮</Button>
    </div>
  )
}
```

### 禁用状态

按钮不可用状态。

```tsx
import { Button } from '@/components/UI'

export default function ButtonDisabled() {
  return (
    <div class="space-x-2">
      <Button type="primary" disabled>主要按钮</Button>
      <Button disabled>默认按钮</Button>
    </div>
  )
}
```

### 不同尺寸

Button 组件提供除了默认值以外的三种尺寸。

```tsx
import { Button } from '@/components/UI'

export default function ButtonSize() {
  return (
    <div class="space-x-2">
      <Button size="sm">小型按钮</Button>
      <Button>默认按钮</Button>
      <Button size="lg">大型按钮</Button>
    </div>
  )
}
```

### 加载中状态

点击按钮后进行数据加载操作，在按钮上显示加载状态。

```tsx
import { Button } from '@/components/UI'
import { ref } from 'vue'

export default function ButtonLoading() {
  const loading = ref(false)

  const handleClick = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 2000)
  }

  return (
    <Button type="primary" loading={loading.value} onClick={handleClick}>
      加载中
    </Button>
  )
}
```

### 图标按钮

带图标的按钮可增强辨识度（有文字）或节省空间（无文字）。

```tsx
import { Button } from '@/components/UI'
import { Search, Download } from 'lucide-vue-next'

export default function ButtonIcon() {
  return (
    <div class="space-x-2">
      <Button type="primary" icon={<Search size={16} />}>
        搜索
      </Button>
      <Button type="primary" icon={<Download size={16} />} />
    </div>
  )
}
```

## API

### Button Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 类型 | `string` | `primary` / `success` / `warning` / `danger` / `default` | `default` |
| size | 尺寸 | `string` | `sm` / `md` / `lg` | `md` |
| plain | 是否朴素按钮 | `boolean` | - | `false` |
| round | 是否圆角按钮 | `boolean` | - | `false` |
| circle | 是否圆形按钮 | `boolean` | - | `false` |
| loading | 是否加载中状态 | `boolean` | - | `false` |
| disabled | 是否禁用状态 | `boolean` | - | `false` |
| icon | 图标组件 | `Component` | - | - |
| block | 是否块级按钮 | `boolean` | - | `false` |
| danger | 是否危险按钮 | `boolean` | - | `false` |
| ghost | 是否幽灵按钮 | `boolean` | - | `false` |
| link | 是否链接按钮 | `boolean` | - | `false` |

### Button Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发 | `(event: MouseEvent) => void` |

## 样式定制

### 使用 className

```tsx
<Button className="custom-button">自定义按钮</Button>
```

### 使用 Tailwind CSS

```tsx
<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  渐变按钮
</Button>
```

## 最佳实践

1. **主要操作**: 使用 `type="primary"` 突出显示主要操作
2. **次要操作**: 使用默认样式
3. **危险操作**: 使用 `type="danger"` 警示用户
4. **加载状态**: 在异步操作时显示加载状态
5. **禁用状态**: 在不可操作时禁用按钮
