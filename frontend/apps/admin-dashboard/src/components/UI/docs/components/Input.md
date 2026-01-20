# Input 输入框

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 何时使用

- 需要用户输入表单域内容时。
- 提供组合型输入框，带搜索的输入框，还可以进行大小选择。

## 代码演示

### 基础用法

基本的输入框用法。

```tsx
import { Input } from '@/components/UI'

export default function InputBasic() {
  return (
    <div class="space-y-4">
      <Input placeholder="请输入内容" />
      <Input placeholder="请输入密码" type="password" />
    </div>
  )
}
```

### 禁用状态

通过 `disabled` 属性指定是否禁用。

```tsx
import { Input } from '@/components/UI'

export default function InputDisabled() {
  return (
    <Input placeholder="禁用状态" disabled />
  )
}
```

### 可清空

使用 `clearable` 属性即可得到一个可清空的输入框。

```tsx
import { Input } from '@/components/UI'

export default function InputClearable() {
  return (
    <Input placeholder="可清空" clearable />
  )
}
```

### 带图标

通过 `prefix` 和 `suffix` 插槽可以在输入框前后添加图标。

```tsx
import { Input } from '@/components/UI'
import { Search, User } from 'lucide-vue-next'

export default function InputIcon() {
  return (
    <div class="space-y-4">
      <Input placeholder="请输入用户名" prefix={<User size={16} />} />
      <Input placeholder="请输入搜索内容" suffix={<Search size={16} />} />
    </div>
  )
}
```

### 不同尺寸

通过 `size` 属性指定输入框的尺寸。

```tsx
import { Input } from '@/components/UI'

export default function InputSize() {
  return (
    <div class="space-y-4">
      <Input size="sm" placeholder="小型输入框" />
      <Input placeholder="默认输入框" />
      <Input size="lg" placeholder="大型输入框" />
    </div>
  )
}
```

### 复合型输入框

通过前置和后置的插槽可以对输入框进行组合。

```tsx
import { Input } from '@/components/UI'

export default function InputGroup() {
  return (
    <div class="space-y-4">
      <Input
        placeholder="https://example.com"
        prefix="https://"
      />
      <Input
        placeholder="请选择"
        suffix=".com"
      />
    </div>
  )
}
```

## API

### Input Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值 | `string \| number` | - | `''` |
| type | 类型 | `string` | `text` / `password` / `email` / `number` / `tel` / `url` / `search` | `text` |
| placeholder | 占位文本 | `string` | - | `''` |
| disabled | 是否禁用 | `boolean` | - | `false` |
| readonly | 是否只读 | `boolean` | - | `false` |
| required | 是否必填 | `boolean` | - | `false` |
| size | 尺寸 | `string` | `sm` / `md` / `lg` | `md` |
| error | 是否错误状态 | `boolean` | - | `false` |
| errorMessage | 错误提示信息 | `string` | - | `''` |
| prefix | 前置图标或文本 | `string \| Component` | - | - |
| suffix | 后置图标或文本 | `string \| Component` | - | - |
| clearable | 是否可清空 | `boolean` | - | `false` |
| maxLength | 最大输入长度 | `number` | - | - |
| showWordLimit | 是否显示字数统计 | `boolean` | - | `false` |
| autocomplete | 自动完成 | `string` | - | - |

### Input Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值改变时触发 | `(value: string \| number) => void` |
| focus | 获得焦点时触发 | `(event: FocusEvent) => void` |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |
| change | 值改变且失焦后触发 | `(value: string \| number) => void` |
| keydown | 按下键盘时触发 | `(event: KeyboardEvent) => void` |
| keyup | 松开键盘时触发 | `(event: KeyboardEvent) => void` |
| keypress | 按下字符键时触发 | `(event: KeyboardEvent) => void` |
| enter | 按下回车键时触发 | `(event: KeyboardEvent) => void` |
| clear | 点击清空按钮时触发 | `() => void` |

## 样式定制

### 错误状态

```tsx
<Input error errorMessage="请输入有效的内容" />
```

### 自定义样式

```tsx
<Input className="border-2 border-primary-500 rounded-lg" />
```

## 最佳实践

1. **标签**: 始终为输入框提供清晰的标签
2. **占位符**: 使用占位符提供格式提示
3. **验证**: 实时验证用户输入并提供反馈
4. **错误提示**: 显示具体的错误信息帮助用户修正
5. **自动完成**: 为常用输入类型启用自动完成
