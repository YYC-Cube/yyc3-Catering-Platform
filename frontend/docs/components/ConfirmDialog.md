# ConfirmDialog 组件文档

## 组件概述
ConfirmDialog 是一个基于 Element Plus 的确认对话框组件，用于在执行重要操作前向用户请求确认，支持多种消息类型和自定义操作按钮。

## 组件属性

| 属性名 | 类型 | 默认值 | 描述 |
| ------ | ---- | ------ | ---- |
| modelValue | boolean | false | 对话框显示状态（v-model绑定） |
| title | string | '确认操作' | 对话框标题 |
| message | string | '' | 对话框消息内容 |
| type | 'warning' \| 'success' \| 'error' \| 'info' | 'warning' | 对话框类型，决定图标和样式 |
| confirmText | string | '确认' | 确认按钮文本 |
| cancelText | string | '取消' | 取消按钮文本 |
| width | string \| number | 400 | 对话框宽度 |
| closable | boolean | true | 是否可通过点击遮罩层关闭对话框 |

## 组件事件

| 事件名 | 参数 | 描述 |
| ------ | ---- | ---- |
| 'update:modelValue' | value: boolean | 对话框显示状态更新事件 |
| confirm | - | 用户点击确认按钮时触发 |
| cancel | - | 用户点击取消按钮或关闭对话框时触发 |

## 组件结构
```vue
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="closable"
    :close-on-press-escape="closable"
    @close="handleClose"
  >
    <div class="confirm-dialog__content">
      <div class="confirm-dialog__icon" :class="iconClass">
        {{ icon }}
      </div>
      <div class="confirm-dialog__message">
        {{ message }}
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button type="primary" :class="confirmButtonClass" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
```

## 计算属性

| 计算属性名 | 类型 | 描述 |
| ---------- | ---- | ---- |
| dialogVisible | boolean | 控制对话框显示状态（双向绑定） |
| iconClass | string | 根据对话框类型返回对应的图标样式类 |
| confirmButtonClass | string | 根据对话框类型返回对应的确认按钮样式类 |
| icon | string | 根据对话框类型返回对应的图标 |

## 组件方法

| 方法名 | 参数 | 返回值 | 描述 |
| ------ | ---- | ------ | ---- |
| handleClose | - | void | 处理对话框关闭事件 |
| handleCancel | - | void | 处理用户取消操作 |
| handleConfirm | - | void | 处理用户确认操作 |

## 使用示例

```vue
<template>
  <div class="order-management">
    <el-button type="danger" @click="showDeleteConfirm">删除订单</el-button>
    
    <ConfirmDialog
      v-model="dialogVisible"
      title="删除订单"
      message="确定要删除此订单吗？此操作不可恢复。"
      type="error"
      confirmText="删除"
      cancelText="取消"
      @confirm="handleDelete"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConfirmDialog from '../components/Common/ConfirmDialog.vue';

const dialogVisible = ref(false);

const showDeleteConfirm = () => {
  dialogVisible.value = true;
};

const handleDelete = () => {
  // 执行删除订单逻辑
  console.log('删除订单');
  dialogVisible.value = false;
};

const handleCancel = () => {
  console.log('取消删除');
  dialogVisible.value = false;
};
</script>
```

## 不同类型对话框示例

```vue
<!-- 警告对话框 -->
<ConfirmDialog
  v-model="warningDialogVisible"
  title="警告"
  message="此操作可能会影响系统性能，确定要继续吗？"
  type="warning"
  @confirm="handleWarningConfirm"
/>

<!-- 成功对话框 -->
<ConfirmDialog
  v-model="successDialogVisible"
  title="成功"
  message="操作已成功完成！"
  type="success"
  confirmText="确定"
  @confirm="handleSuccessConfirm"
/>

<!-- 信息对话框 -->
<ConfirmDialog
  v-model="infoDialogVisible"
  title="提示"
  message="您有新的系统通知，请及时查看。"
  type="info"
  @confirm="handleInfoConfirm"
/>
```

## 样式说明

- 对话框采用 Element Plus 统一的设计风格
- 根据不同类型显示不同颜色的图标和确认按钮：
  - warning: 橙色图标和按钮
  - success: 绿色图标和按钮
  - error: 红色图标和按钮
  - info: 蓝色图标和按钮
- 支持自定义对话框宽度和按钮文本
- 可配置是否通过点击遮罩层或按下ESC键关闭对话框

## 版本信息
- 创建日期：2024-10-15
- 版本：1.0.0
- 作者：YYC