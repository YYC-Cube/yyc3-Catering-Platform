<template>
  <div class="not-found-view">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <router-link to="/" class="back-home">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// NotFound视图组件
</script>

<style scoped lang="scss">
.not-found-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding: 2rem;

  .not-found-content {
    text-align: center;

    h1 {
      font-size: 8rem;
      font-weight: bold;
      color: #409EFF;
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 2rem;
      color: #333;
      margin: 1rem 0;
    }

    p {
      color: #666;
      margin: 1rem 0 2rem;
      font-size: 1rem;
    }

    .back-home {
      display: inline-block;
      padding: 0.75rem 2rem;
      background-color: #409EFF;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background-color: #66b1ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
      }
    }
  }
}
</style>