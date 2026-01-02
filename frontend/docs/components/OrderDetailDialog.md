# OrderDetailDialog 组件文档

## 组件概述
OrderDetailDialog 是一个用于展示订单详细信息的对话框组件，支持查看订单基本信息、订单明细、订单状态和备注等内容，并提供打印功能。

## 组件接口定义

### Order 接口
```typescript
interface Order {
  id: string;
  orderNumber: string;
  orderTime: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  items: OrderItem[];
  remarks?: string;
  paymentMethod: string;
  deliveryAddress?: string;
}
```

### OrderItem 接口
```typescript
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}
```

## 组件属性

| 属性名 | 类型 | 默认值 | 描述 |
| ------ | ---- | ------ | ---- |
| modelValue | boolean | false | 对话框显示状态（v-model绑定） |
| order | Order | - | 订单数据对象 |

## 组件事件

| 事件名 | 参数 | 描述 |
| ------ | ---- | ---- |
| 'update:modelValue' | value: boolean | 对话框显示状态更新事件 |
| close | - | 对话框关闭事件 |

## 组件结构
```vue
<template>
  <el-dialog
    v-model="dialogVisible"
    title="订单详情"
    width="800px"
    @close="handleClose"
  >
    <div class="order-detail">
      <!-- 订单基本信息 -->
      <div class="order-detail__header">
        <div class="order-detail__info">
          <h3 class="order-detail__number">订单号：{{ order.orderNumber }}</h3>
          <div class="order-detail__meta">
            <span class="order-detail__time">下单时间：{{ order.orderTime }}</span>
            <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
          </div>
        </div>
        <div class="order-detail__actions">
          <el-button type="primary" size="small" @click="handlePrint">打印订单</el-button>
        </div>
      </div>

      <!-- 客户信息 -->
      <div class="order-detail__customer">
        <h4>客户信息</h4>
        <div class="order-detail__customer-info">
          <span>姓名：{{ order.customerName }}</span>
          <span>电话：{{ order.customerPhone }}</span>
          <span v-if="order.deliveryAddress">地址：{{ order.deliveryAddress }}</span>
        </div>
      </div>

      <!-- 订单明细 -->
      <div class="order-detail__items">
        <h4>订单明细</h4>
        <el-table :data="order.items" stripe border>
          <el-table-column prop="name" label="菜品名称" />
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="unitPrice" label="单价" width="100" align="right" formatter="formatPrice" />
          <el-table-column prop="totalPrice" label="小计" width="100" align="right" formatter="formatPrice" />
          <el-table-column prop="note" label="备注" min-width="150" />
        </el-table>
      </div>

      <!-- 订单总计和备注 -->
      <div class="order-detail__footer">
        <div class="order-detail__total">
          <span class="order-detail__total-label">总计：</span>
          <span class="order-detail__total-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="order-detail__payment">
          <span>支付方式：{{ order.paymentMethod }}</span>
        </div>
        <div v-if="order.remarks" class="order-detail__remarks">
          <h4>备注</h4>
          <p>{{ order.remarks }}</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
```

## 组件方法

| 方法名 | 参数 | 返回值 | 描述 |
| ------ | ---- | ------ | ---- |
| handleClose | - | void | 处理对话框关闭事件 |
| handlePrint | - | void | 处理订单打印功能 |
| formatPrice | price: number | string | 格式化价格显示 |

## 计算属性

| 计算属性名 | 类型 | 描述 |
| ---------- | ---- | ---- |
| dialogVisible | boolean | 控制对话框显示状态（双向绑定） |
| statusType | string | 根据订单状态返回Element Plus标签类型 |
| statusText | string | 根据订单状态返回中文状态文本 |

## 使用示例

```vue
<template>
  <div class="order-management">
    <el-button @click="showOrderDetail">查看订单详情</el-button>
    
    <OrderDetailDialog
      v-model="dialogVisible"
      :order="selectedOrder"
      @close="dialogVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OrderDetailDialog from '../components/OrderDetailDialog.vue';

const dialogVisible = ref(false);
const selectedOrder = ref({
  id: '123',
  orderNumber: 'ORD-20241015-0001',
  orderTime: '2024-10-15 14:30:00',
  customerName: '张三',
  customerPhone: '13800138000',
  totalAmount: 128.5,
  status: 'delivering',
  items: [
    {
      id: '456',
      name: '宫保鸡丁',
      quantity: 1,
      unitPrice: 38.0,
      totalPrice: 38.0
    },
    {
      id: '789',
      name: '麻婆豆腐',
      quantity: 1,
      unitPrice: 22.0,
      totalPrice: 22.0,
      note: '少辣'
    }
  ],
  remarks: '尽快送达',
  paymentMethod: '微信支付',
  deliveryAddress: '北京市朝阳区某某街道123号'
});

const showOrderDetail = () => {
  dialogVisible.value = true;
};
</script>
```

## 样式说明

- 对话框采用响应式设计，宽度固定为800px
- 订单信息区域采用卡片式布局，清晰分隔不同信息模块
- 订单状态使用不同颜色的标签标识，便于快速识别
- 订单明细表格支持斑马纹和边框显示，提升可读性

## 版本信息
- 创建日期：2024-10-15
- 版本：1.0.0
- 作者：YYC