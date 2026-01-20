# Switch 开关

开关选择器。

## 何时使用

- 需要表示开关状态/两种状态之间的切换时。
- 和 `checkbox` 的区别是，`switch` 会立即触发状态改变，而 `checkbox` 一般用于状态标记，需要配合提交操作。

## 代码演示

### 基础用法

```tsx
import { Switch } from '@/components/UI'
import { ref } from 'vue'

export default function SwitchBasic() {
  const checked = ref(false)

  return (
    <Switch v-model={checked.value} />
  )
}
```

### 禁用状态

```tsx
import { Switch } from '@/components/UI'

export default function SwitchDisabled() {
  return (
    <div class="space-y-2">
      <Switch disabled />
      <Switch disabled checked />
    </div>
  )
}
```

### 加载状态

```tsx
import { Switch } from '@/components/UI'
import { ref } from 'vue'

export default function SwitchLoading() {
  const loading = ref(false)
  const checked = ref(false)

  const handleChange = async (value: boolean) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    loading.value = false
  }

  return (
    <Switch
      v-model={checked.value}
      loading={loading.value}
      onChange={handleChange}
    />
  )
}
```

### 自定义颜色

```tsx
import { Switch } from '@/components/UI'
import { ref } from 'vue'

export default function SwitchColor() {
  const checked = ref(false)

  return (
    <div class="space-y-2">
      <Switch v-model={checked.value} color="primary" />
      <Switch v-model={checked.value} color="success" />
      <Switch v-model={checked.value} color="warning" />
      <Switch v-model={checked.value} color="danger" />
    </div>
  )
}
```

### 文字描述

```tsx
import { Switch } from '@/components/UI'
import { ref } from 'vue'

export default function SwitchText() {
  const checked = ref(false)

  return (
    <Switch
      v-model={checked.value}
      checkedText="开"
      uncheckedText="关"
    />
  )
}
```

## API

### Switch Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值 | `boolean` | - | `false` |
| disabled | 是否禁用 | `boolean` | - | `false` |
| loading | 是否加载中 | `boolean` | - | `false` |
| size | 尺寸 | `string` | `sm` / `md` / `lg` | `md` |
| color | 颜色 | `string` | `primary` / `success` / `warning` / `danger` | `primary` |
| checkedText | 选中时的文字 | `string` | - | - |
| uncheckedText | 未选中时的文字 | `string` | - | - |
| onChange | 变化回调 | `Function` | - | - |
| className | 自定义类名 | `string` | - | - |

## 样式定制

### CSS 变量

```css
.switch {
  --switch-width: 44px;
  --switch-height: 22px;
  --switch-bg: #d1d5db;
  --switch-checked-bg: #3b82f6;
  --switch-disabled-bg: #e5e7eb;
  --switch-dot-size: 18px;
  --switch-dot-bg: #ffffff;
}
```

### 自定义样式

```tsx
<Switch className="custom-switch" />

<style>
.custom-switch {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-switch .switch-dot {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
```

## 最佳实践

### 1. 异步操作

```tsx
const handleChange = async (checked: boolean) => {
  loading.value = true
  try {
    await api.updateStatus(checked)
    message.success('更新成功')
  } catch (error) {
    message.error('更新失败')
  } finally {
    loading.value = false
  }
}
```

### 2. 确认操作

```tsx
const handleChange = async (checked: boolean) => {
  if (checked) {
    const confirmed = await confirm('确定要开启吗？')
    if (!confirmed) return false
  }
  return true
}
```

### 3. 权限控制

```tsx
const canEdit = computed(() => {
  return user.value.role === 'admin'
})

<Switch
  v-model={status}
  disabled={!canEdit.value}
/>
```

## 常见问题

### Q: 如何禁用开关？

A: 使用 `disabled` 属性禁用开关。

### Q: 如何实现异步操作？

A: 使用 `loading` 属性和 `onChange` 回调实现异步操作。

### Q: 如何自定义开关颜色？

A: 使用 `color` 属性设置颜色，或使用自定义类名。

---

🌹 Switch 组件文档完成！
