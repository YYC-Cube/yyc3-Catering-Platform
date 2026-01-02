<template>
  <div class="ui-components-test">
    <h1>UI组件测试页面</h1>
    
    <!-- 按钮组件测试 -->
    <section class="component-section">
      <h2>按钮组件测试</h2>
      <div class="component-grid">
        <!-- Primary 按钮 -->
        <div class="component-item">
          <h3>Primary 按钮</h3>
          <ytc-button variant="primary">主要按钮</ytc-button>
          <ytc-button variant="primary" size="small">小型主要按钮</ytc-button>
          <ytc-button variant="primary" size="large">大型主要按钮</ytc-button>
          <ytc-button variant="primary" :disabled="true">禁用主要按钮</ytc-button>
        </div>
        
        <!-- Secondary 按钮 -->
        <div class="component-item">
          <h3>Secondary 按钮</h3>
          <ytc-button variant="secondary">次要按钮</ytc-button>
          <ytc-button variant="secondary" size="small">小型次要按钮</ytc-button>
          <ytc-button variant="secondary" size="large">大型次要按钮</ytc-button>
          <ytc-button variant="secondary" :disabled="true">禁用次要按钮</ytc-button>
        </div>
        
        <!-- Success 按钮 -->
        <div class="component-item">
          <h3>Success 按钮</h3>
          <ytc-button variant="success">成功按钮</ytc-button>
          <ytc-button variant="success" size="small">小型成功按钮</ytc-button>
          <ytc-button variant="success" size="large">大型成功按钮</ytc-button>
          <ytc-button variant="success" :disabled="true">禁用成功按钮</ytc-button>
        </div>
        
        <!-- Warning 按钮 -->
        <div class="component-item">
          <h3>Warning 按钮</h3>
          <ytc-button variant="warning">警告按钮</ytc-button>
          <ytc-button variant="warning" size="small">小型警告按钮</ytc-button>
          <ytc-button variant="warning" size="large">大型警告按钮</ytc-button>
          <ytc-button variant="warning" :disabled="true">禁用警告按钮</ytc-button>
        </div>
        
        <!-- Danger 按钮 -->
        <div class="component-item">
          <h3>Danger 按钮</h3>
          <ytc-button variant="danger">危险按钮</ytc-button>
          <ytc-button variant="danger" size="small">小型危险按钮</ytc-button>
          <ytc-button variant="danger" size="large">大型危险按钮</ytc-button>
          <ytc-button variant="danger" :disabled="true">禁用危险按钮</ytc-button>
        </div>
        
        <!-- Info 按钮 -->
        <div class="component-item">
          <h3>Info 按钮</h3>
          <ytc-button variant="info">信息按钮</ytc-button>
          <ytc-button variant="info" size="small">小型信息按钮</ytc-button>
          <ytc-button variant="info" size="large">大型信息按钮</ytc-button>
          <ytc-button variant="info" :disabled="true">禁用信息按钮</ytc-button>
        </div>
        
        <!-- Text 按钮 -->
        <div class="component-item">
          <h3>Text 按钮</h3>
          <ytc-button variant="text">文本按钮</ytc-button>
          <ytc-button variant="text" size="small">小型文本按钮</ytc-button>
          <ytc-button variant="text" size="large">大型文本按钮</ytc-button>
          <ytc-button variant="text" :disabled="true">禁用文本按钮</ytc-button>
        </div>
        
        <!-- Dashed 按钮 -->
        <div class="component-item">
          <h3>Dashed 按钮</h3>
          <ytc-button variant="dashed">虚线按钮</ytc-button>
          <ytc-button variant="dashed" size="small">小型虚线按钮</ytc-button>
          <ytc-button variant="dashed" size="large">大型虚线按钮</ytc-button>
          <ytc-button variant="dashed" :disabled="true">禁用虚线按钮</ytc-button>
        </div>
        
        <!-- Link 按钮 -->
        <div class="component-item">
          <h3>Link 按钮</h3>
          <ytc-button variant="link">链接按钮</ytc-button>
          <ytc-button variant="link" size="small">小型链接按钮</ytc-button>
          <ytc-button variant="link" size="large">大型链接按钮</ytc-button>
          <ytc-button variant="link" :disabled="true">禁用链接按钮</ytc-button>
        </div>
      </div>
    </section>
    
    <!-- 导航栏组件测试 -->
    <section class="component-section">
      <h2>导航栏组件测试</h2>
      <div class="navigation-test">
        <app-sidebar></app-sidebar>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import YtcButton from '../components/base/YTCButton.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
</script>

<style scoped lang="scss">
.ui-components-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.component-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: var(--color-bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

h1, h2, h3 {
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 10px;
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.component-item {
  padding: 15px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-primary);
}

.component-item button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.navigation-test {
  display: flex;
  height: 500px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}
</style>