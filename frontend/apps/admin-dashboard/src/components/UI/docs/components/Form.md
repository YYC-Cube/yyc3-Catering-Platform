# Form 表单

具有数据收集、校验和提交功能的表单。

## 何时使用

- 需要对用户输入进行校验时。
- 需要收集用户数据时。

## 代码演示

### 基础用法

使用 `Form`、`FormField`、`FormLabel` 和 `FormError` 组件来创建表单。

```tsx
import { Form, FormField, FormLabel, FormError } from '@/components/UI'
import { Input, Button } from '@/components/UI'

export default function FormBasic() {
  const handleSubmit = (e: Event) => {
    e.preventDefault()
    console.log('表单提交')
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField name="username" label="用户名" required>
        <Input type="text" placeholder="请输入用户名" />
      </FormField>
      <FormField name="password" label="密码" required>
        <Input type="password" placeholder="请输入密码" />
      </FormField>
      <Button type="primary">提交</Button>
    </Form>
  )
}
```

### 表单布局

使用 `layout` 属性来设置表单布局。

```tsx
import { Form, FormField, FormLabel } from '@/components/UI'
import { Input, Button } from '@/components/UI'

export default function FormLayout() {
  return (
    <div class="space-y-4">
      <Form layout="vertical">
        <FormField name="username" label="用户名">
          <Input type="text" placeholder="垂直布局" />
        </FormField>
      </Form>
      <Form layout="horizontal">
        <FormField name="email" label="邮箱">
          <Input type="email" placeholder="水平布局" />
        </FormField>
      </Form>
      <Form layout="inline">
        <FormField name="search" label="搜索">
          <Input type="text" placeholder="内联布局" />
        </FormField>
        <Button type="primary">搜索</Button>
      </Form>
    </div>
  )
}
```

### 表单验证

使用 `error` 属性来显示错误信息。

```tsx
import { Form, FormField, FormLabel, FormError } from '@/components/UI'
import { Input, Button } from '@/components/UI'
import { ref } from 'vue'

export default function FormValidation() {
  const errors = ref({
    username: '',
    password: ''
  })

  const validateForm = () => {
    if (!errors.value.username) {
      errors.value.username = '用户名不能为空'
    }
    if (!errors.value.password) {
      errors.value.password = '密码不能为空'
    }
  }

  return (
    <Form>
      <FormField
        name="username"
        label="用户名"
        required
        error={errors.value.username}
      >
        <Input type="text" placeholder="请输入用户名" />
      </FormField>
      <FormField
        name="password"
        label="密码"
        required
        error={errors.value.password}
      >
        <Input type="password" placeholder="请输入密码" />
      </FormField>
      <Button type="primary" onClick={validateForm}>
        提交
      </Button>
    </Form>
  )
}
```

### 组合使用

```tsx
import { Form, FormField, FormLabel, FormError } from '@/components/UI'
import { Input, Button, Select } from '@/components/UI'

export default function FormCombined() {
  return (
    <Form>
      <FormField name="username" label="用户名" required>
        <Input type="text" placeholder="请输入用户名" />
      </FormField>
      <FormField name="email" label="邮箱" required>
        <Input type="email" placeholder="请输入邮箱" />
      </FormField>
      <FormField name="role" label="角色">
        <Select
          options={[
            { label: '管理员', value: 'admin' },
            { label: '用户', value: 'user' }
          ]}
          placeholder="请选择角色"
        />
      </FormField>
      <Button type="primary">提交</Button>
    </Form>
  )
}
```

## API

### Form Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| layout | 表单布局 | `string` | `vertical` / `horizontal` / `inline` | `vertical` |
| onSubmit | 提交回调 | `Function` | - | - |
| className | 自定义类名 | `string` | - | - |

### FormField Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 字段名 | `string` | - |
| label | 标签文本 | `string` | - |
| required | 是否必填 | `boolean` | `false` |
| error | 错误信息 | `string` | - |
| className | 自定义类名 | `string` | - |

### FormLabel Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| className | 自定义类名 | `string` | - |

### FormError Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| className | 自定义类名 | `string` | - |

## 样式定制

### CSS 变量

```css
.form {
  --form-gap: 1rem;
  --form-label-color: #374151;
  --form-error-color: #ef4444;
  --form-error-bg: #fef2f2;
}
```

### 自定义样式

```tsx
<Form className="custom-form">
  <FormField name="username" label="用户名">
    <Input type="text" />
  </FormField>
</Form>

<style>
.custom-form {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 0.5rem;
}
</style>
```

## 最佳实践

### 1. 表单验证

```tsx
const validate = (values: any) => {
  const errors: Record<string, string> = {}
  
  if (!values.username) {
    errors.username = '用户名不能为空'
  }
  
  return errors
}
```

### 2. 表单提交

```tsx
const handleSubmit = async (values: any) => {
  try {
    await api.submit(values)
    message.success('提交成功')
  } catch (error) {
    message.error('提交失败')
  }
}
```

### 3. 表单重置

```tsx
const resetForm = () => {
  formRef.value?.reset()
}
```

## 常见问题

### Q: 如何自定义表单布局？

A: 可以通过 `layout` 属性设置表单布局，或者使用自定义类名。

### Q: 如何实现表单验证？

A: 可以使用 `error` 属性显示错误信息，或者使用表单验证库。

### Q: 如何重置表单？

A: 可以通过表单的 `reset` 方法重置表单。

---

🌹 Form 组件文档完成！
