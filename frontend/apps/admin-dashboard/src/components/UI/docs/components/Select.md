# Select 选择器

下拉选择器。

## 何时使用

- 弹出一个下拉菜单给用户选择操作，用于代替原生的选择器，或者需要一个更优雅的多选器时。
- 当选项少而固定时。
- 当选项较多时，建议使用搜索功能。

## 代码演示

### 基础用法

使用 `options` 属性来设置选项。

```tsx
import { Select } from '@/components/UI'

export default function SelectBasic() {
  const options = [
    { label: '选项一', value: 'option1' },
    { label: '选项二', value: 'option2' },
    { label: '选项三', value: 'option3' },
  ]

  return (
    <Select
      options={options}
      placeholder="请选择"
    />
  )
}
```

### 禁用状态

使用 `disabled` 属性来禁用选择器。

```tsx
import { Select } from '@/components/UI'

export default function SelectDisabled() {
  const options = [
    { label: '选项一', value: 'option1' },
    { label: '选项二', value: 'option2' },
  ]

  return (
    <Select
      disabled
      options={options}
      placeholder="禁用状态"
    />
  )
}
```

### 可清空

使用 `clearable` 属性来显示清空按钮。

```tsx
import { Select } from '@/components/UI'
import { ref } from 'vue'

export default function SelectClearable() {
  const value = ref('option1')
  const options = [
    { label: '选项一', value: 'option1' },
    { label: '选项二', value: 'option2' },
    { label: '选项三', value: 'option3' },
  ]

  return (
    <Select
      v-model={value.value}
      clearable
      options={options}
      placeholder="可清空"
    />
  )
}
```

### 多选模式

使用 `multiple` 属性来启用多选模式。

```tsx
import { Select } from '@/components/UI'
import { ref } from 'vue'

export default function SelectMultiple() {
  const value = ref(['option1', 'option2'])
  const options = [
    { label: '选项一', value: 'option1' },
    { label: '选项二', value: 'option2' },
    { label: '选项三', value: 'option3' },
  ]

  return (
    <Select
      v-model={value.value}
      multiple
      options={options}
      placeholder="多选"
    />
  )
}
```

### 可搜索

使用 `searchable` 属性来启用搜索功能。

```tsx
import { Select } from '@/components/UI'

export default function SelectSearchable() {
  const options = [
    { label: '选项一', value: 'option1' },
    { label: '选项二', value: 'option2' },
    { label: '选项三', value: 'option3' },
  ]

  return (
    <Select
      searchable
      options={options}
      placeholder="可搜索"
    />
  )
}
```

### 分组选项

```tsx
import { Select } from '@/components/UI'

export default function SelectGrouped() {
  const options = [
    {
      label: '分组一',
      value: 'group1',
      children: [
        { label: '选项一', value: 'option1' },
        { label: '选项二', value: 'option2' },
      ]
    },
    {
      label: '分组二',
      value: 'group2',
      children: [
        { label: '选项三', value: 'option3' },
        { label: '选项四', value: 'option4' },
      ]
    },
  ]

  return (
    <Select
      options={options}
      placeholder="分组选项"
    />
  )
}
```

## API

### Select Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值 | `string \| string[]` | - | - |
| options | 选项数据 | `Option[]` | - | - |
| placeholder | 占位文本 | `string` | - | - |
| disabled | 是否禁用 | `boolean` | - | `false` |
| readonly | 是否只读 | `boolean` | - | `false` |
| clearable | 是否可清空 | `boolean` | - | `false` |
| multiple | 是否多选 | `boolean` | - | `false` |
| searchable | 是否可搜索 | `boolean` | - | `false` |
| loading | 是否加载中 | `boolean` | - | `false` |
| size | 尺寸 | `string` | `sm` / `md` / `lg` | `md` |
| onChange | 值变化回调 | `Function` | - | - |
| onClear | 清空回调 | `Function` | - | - |
| onVisibleChange | 显示状态变化回调 | `Function` | - | - |
| className | 自定义类名 | `string` | - | - |

### Option 类型定义

```typescript
interface Option {
  label: string
  value: string | number
  disabled?: boolean
  children?: Option[]
}
```

## 样式定制

### CSS 变量

```css
.select {
  --select-bg-color: #ffffff;
  --select-border-color: #d1d5db;
  --select-text-color: #374151;
  --select-placeholder-color: #9ca3af;
  --select-hover-bg: #f3f4f6;
  --select-selected-bg: #eff6ff;
  --select-disabled-bg: #f9fafb;
  --select-disabled-text: #9ca3af;
}
```

### 自定义样式

```tsx
<Select className="custom-select" options={options} />

<style>
.custom-select {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}
</style>
```

## 最佳实践

### 1. 远程搜索

```tsx
const searchOptions = ref([])
const loading = ref(false)

const handleSearch = async (value: string) => {
  loading.value = true
  try {
    const result = await api.search(value)
    searchOptions.value = result
  } finally {
    loading.value = false
  }
}
```

### 2. 联动选择

```tsx
const province = ref('')
const city = ref('')

const cityOptions = computed(() => {
  return cities.filter(c => c.province === province.value)
})
```

### 3. 默认值设置

```tsx
const value = ref('option1')
```

## 常见问题

### Q: 如何设置默认值？

A: 使用 `v-model` 绑定一个初始值。

### Q: 如何实现远程搜索？

A: 使用 `searchable` 属性和 `onChange` 回调实现远程搜索。

### Q: 如何实现联动选择？

A: 使用 `computed` 计算属性根据第一个选择的值过滤第二个选项。

---

🌹 Select 组件文档完成！
