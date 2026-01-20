# Card 卡片

将信息聚合在卡片容器中展示。

## 何时使用

- 需要突出显示某个内容时
- 需要将相关内容分组展示时
- 需要展示图片、文本、操作按钮等内容时

## 代码演示

### 基础用法

包含标题、内容和操作。

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/UI'

export default function CardBasic() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>卡片标题</CardTitle>
      </CardHeader>
      <CardContent>
        <p>这是卡片的内容区域</p>
      </CardContent>
      <CardFooter>
        <button class="px-4 py-2 bg-primary-600 text-white rounded-lg">
          确认
        </button>
      </CardFooter>
    </Card>
  )
}
```

### 简单卡片

只有内容区域的简单卡片。

```tsx
import { Card } from '@/components/UI'

export default function CardSimple() {
  return (
    <Card>
      <p>这是一个简单的卡片</p>
    </Card>
  )
}
```

### 带图片

卡片可以包含图片。

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/UI'

export default function CardImage() {
  return (
    <Card className="max-w-sm">
      <img
        src="/placeholder-image.jpg"
        alt="示例图片"
        class="w-full h-48 object-cover rounded-t-lg"
      />
      <CardHeader>
        <CardTitle>带图片的卡片</CardTitle>
      </CardHeader>
      <CardContent>
        <p>这是卡片的内容描述</p>
      </CardContent>
    </Card>
  )
}
```

### 可悬停

鼠标悬停时显示阴影效果。

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/UI'

export default function CardHover() {
  return (
    <Card hoverable>
      <CardHeader>
        <CardTitle>可悬停卡片</CardTitle>
      </CardHeader>
      <CardContent>
        <p>鼠标悬停查看效果</p>
      </CardContent>
    </Card>
  )
}
```

### 加载状态

卡片加载时的占位状态。

```tsx
import { Card } from '@/components/UI'

export default function CardLoading() {
  return (
    <Card loading>
      <p>加载中...</p>
    </Card>
  )
}
```

## API

### Card Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| hoverable | 是否可悬停 | `boolean` | - | `false` |
| bordered | 是否有边框 | `boolean` | - | `true` |
| shadow | 阴影等级 | `string` | `none` / `sm` / `md` / `lg` / `xl` | `md` |
| padding | 内边距 | `string` | `none` / `sm` / `md` / `lg` | `md` |
| loading | 是否加载中 | `boolean` | - | `false` |

### CardHeader Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| divider | 是否显示分隔线 | `boolean` | - | `false` |

### CardTitle Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| level | 标题级别 | `number` | `1` / `2` / `3` / `4` / `5` / `6` | `3` |

### CardContent Props

无特定属性

### CardFooter Props

无特定属性

## 样式定制

### 自定义阴影

```tsx
<Card shadow="xl">超大阴影</Card>
```

### 无边框

```tsx
<Card bordered={false}>无边框卡片</Card>
```

### 自定义内边距

```tsx
<Card padding="lg">大内边距</Card>
```

## 最佳实践

1. **内容分组**: 使用卡片将相关内容分组
2. **视觉层次**: 使用阴影和边框区分卡片
3. **交互反馈**: 为可操作的卡片添加悬停效果
4. **加载状态**: 在数据加载时显示加载状态
5. **响应式**: 确保卡片在不同屏幕尺寸下正常显示
