# Modal 模态框

模态框对话框，在保留当前页面状态的情况下，提示用户进行相关操作。

## 何时使用

- 需要用户处理事务，又不希望跳转页面以致打断工作流程时，可以使用 `Modal` 在当前页面正中打开一个浮层，承载相应的操作。

## 代码演示

### 基础用法

模态框需要通过 `visible` 属性来控制显示状态。

```tsx
import { Modal, Button } from '@/components/UI'
import { ref } from 'vue'

export default function ModalBasic() {
  const visible = ref(false)

  return (
    <>
      <Button type="primary" onClick={() => visible.value = true}>
        打开模态框
      </Button>
      <Modal
        visible={visible.value}
        title="基础模态框"
        onUpdate:visible={(v) => visible.value = v}
      >
        <p>这是一段内容</p>
      </Modal>
    </>
  )
}
```

### 自定义页脚

自定义底部按钮。

```tsx
import { Modal, Button } from '@/components/UI'
import { ref } from 'vue'

export default function ModalFooter() {
  const visible = ref(false)

  return (
    <>
      <Button type="primary" onClick={() => visible.value = true}>
        自定义页脚
      </Button>
      <Modal
        visible={visible.value}
        title="自定义页脚"
        onUpdate:visible={(v) => visible.value = v}
        footer={
          <div class="flex justify-end gap-2">
            <Button onClick={() => visible.value = false}>取消</Button>
            <Button type="primary" onClick={() => visible.value = false}>
              确认
            </Button>
          </div>
        }
      >
        <p>自定义页脚内容</p>
      </Modal>
    </>
  )
}
```

### 不同尺寸

通过 `width` 属性设置模态框宽度。

```tsx
import { Modal, Button } from '@/components/UI'
import { ref } from 'vue'

export default function ModalSize() {
  const visible = ref(false)
  const size = ref<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md')

  return (
    <>
      <div class="space-x-2">
        <Button onClick={() => { size.value = 'sm'; visible.value = true }}>
          小型
        </Button>
        <Button onClick={() => { size.value = 'md'; visible.value = true }}>
          中型
        </Button>
        <Button onClick={() => { size.value = 'lg'; visible.value = true }}>
          大型
        </Button>
      </div>
      <Modal
        visible={visible.value}
        title="不同尺寸"
        size={size.value}
        onUpdate:visible={(v) => visible.value = v}
      >
        <p>尺寸: {size.value}</p>
      </Modal>
    </>
  )
}
```

### 禁用遮罩关闭

点击遮罩层不关闭模态框。

```tsx
import { Modal, Button } from '@/components/UI'
import { ref } from 'vue'

export default function ModalMaskClosable() {
  const visible = ref(false)

  return (
    <>
      <Button type="primary" onClick={() => visible.value = true}>
        禁用遮罩关闭
      </Button>
      <Modal
        visible={visible.value}
        title="禁用遮罩关闭"
        maskClosable={false}
        onUpdate:visible={(v) => visible.value = v}
      >
        <p>点击遮罩层不会关闭</p>
      </Modal>
    </>
  )
}
```

### 确认对话框

使用 `confirm` 方法快速创建确认对话框。

```tsx
import { Modal, Button } from '@/components/UI'

export default function ModalConfirm() {
  const handleConfirm = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条数据吗？',
      onOk: () => {
        console.log('确认删除')
      },
      onCancel: () => {
        console.log('取消删除')
      },
    })
  }

  return (
    <Button type="danger" onClick={handleConfirm}>
      删除
    </Button>
  )
}
```

## API

### Modal Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| visible | 是否可见 | `boolean` | - | `false` |
| title | 标题 | `string` | - | - |
| width | 宽度 | `string \| number` | - | `520` |
| size | 尺寸 | `string` | `sm` / `md` / `lg` / `xl` / `full` | `md` |
| centered | 是否垂直居中 | `boolean` | - | `false` |
| closable | 是否显示关闭按钮 | `boolean` | - | `true` |
| mask | 是否显示遮罩 | `boolean` | - | `true` |
| maskClosable | 点击遮罩是否关闭 | `boolean` | - | `true` |
| keyboard | 按 ESC 键是否关闭 | `boolean` | - | `true` |
| footer | 自定义页脚 | `VNode` | - | - |
| okText | 确认按钮文字 | `string` | - | `确定` |
| cancelText | 取消按钮文字 | `string` | - | `取消` |
| okButtonProps | 确认按钮属性 | `object` | - | - |
| cancelButtonProps | 取消按钮属性 | `object` | - | - |
| destroyOnClose | 关闭时销毁内容 | `boolean` | - | `false` |
| zIndex | 设置 Modal 的 `z-index` | `number` | - | `1000` |

### Modal Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:visible | 显示状态改变时触发 | `(visible: boolean) => void` |
| ok | 点击确认按钮时触发 | `() => void` |
| cancel | 点击取消按钮时触发 | `() => void` |
| afterClose | 关闭动画结束后触发 | `() => void` |

### Modal Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| confirm | 确认对话框 | `(config: ModalConfig) => void` |
| info | 信息对话框 | `(config: ModalConfig) => void` |
| success | 成功对话框 | `(config: ModalConfig) => void` |
| warning | 警告对话框 | `(config: ModalConfig) => void` |
| error | 错误对话框 | `(config: ModalConfig) => void` |

## 样式定制

### 自定义宽度

```tsx
<Modal width={800}>自定义宽度</Modal>
```

### 垂直居中

```tsx
<Modal centered>垂直居中</Modal>
```

## 最佳实践

1. **标题**: 使用简洁明确的标题
2. **操作**: 主要操作放在右侧，次要操作放在左侧
3. **关闭**: 提供多种关闭方式（按钮、遮罩、ESC键）
4. **确认**: 危险操作需要二次确认
5. **焦点**: 打开时自动聚焦到主要操作按钮
