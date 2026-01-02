# MetricCard 组件文档

## 组件概述
MetricCard 是一个用于展示关键业务指标的卡片组件，支持显示指标标题、数值、图标和趋势信息。

## 组件属性

| 属性名 | 类型 | 默认值 | 描述 |
| ------ | ---- | ------ | ---- |
| title | string | - | 指标标题 |
| value | string \| number | - | 指标数值 |
| icon | string | - | 指标图标名称 |
| trend | 'up' \| 'down' \| 'stable' | 'stable' | 指标趋势类型 |
| trendValue | string \| number | '' | 趋势数值 |
| trendUnit | string | '%' | 趋势单位 |
| color | string | '' | 指标数值颜色 |

## 组件结构
```vue
<template>
  <div class="metric-card" :class="{ 'metric-card--hover': isHoverable }">
    <div class="metric-card__header">
      <h3 class="metric-card__title">{{ title }}</h3>
      <span class="metric-card__icon" :style="{ color: iconColor }">{{ icon }}</span>
    </div>
    <div class="metric-card__body">
      <p class="metric-card__value" :style="{ color }">{{ value }}</p>
      <div class="metric-card__trend" :class="trendClass">
        <span class="metric-card__trend-icon">{{ trendIcon }}</span>
        <span class="metric-card__trend-value">{{ trendValue }}{{ trendUnit }}</span>
      </div>
    </div>
  </div>
</template>
```

## 计算属性

| 计算属性名 | 类型 | 描述 |
| ---------- | ---- | ---- |
| iconColor | string | 根据趋势类型返回对应的图标颜色 |
| trendClass | string | 根据趋势类型返回对应的趋势样式类 |
| trendIcon | string | 根据趋势类型返回对应的趋势图标 |

## 使用示例

```vue
<template>
  <div class="dashboard-metrics">
    <MetricCard
      title="总订单数"
      value="1,234"
      icon="📊"
      trend="up"
      trendValue="12.5"
      trendUnit="%"
      color="#3b82f6"
    />
    <MetricCard
      title="总收入"
      value="¥45,678"
      icon="💰"
      trend="down"
      trendValue="3.2"
      trendUnit="%"
    />
    <MetricCard
      title="客户数量"
      value="789"
      icon="👥"
      trend="stable"
      trendValue="0"
      trendUnit="%"
      color="#10b981"
    />
  </div>
</template>

<script setup lang="ts">
import MetricCard from '../components/MetricCard.vue';
</script>
```

## 样式说明

- 卡片使用圆角设计，具有轻微阴影效果
- 支持悬停效果，悬停时阴影加深
- 趋势颜色：
  - 上升趋势：绿色 (#10b981)
  - 下降趋势：红色 (#ef4444)
  - 稳定趋势：灰色 (#6b7280)

## 版本信息
- 创建日期：2024-10-15
- 版本：1.0.0
- 作者：YYC