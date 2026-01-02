<template>
  <div class="home-view">
    <h1>欢迎使用YYC³餐饮行业智能化平台</h1>
    <p>这是顾客端应用的首页</p>
    <div class="feature-cards">
      <div class="card">
        <h3>智能推荐</h3>
        <p>根据您的口味和历史订单，为您推荐最适合的菜品</p>
      </div>
      <div class="card">
        <h3>快速点餐</h3>
        <p>简单几步即可完成点餐，节省您的时间</p>
      </div>
      <div class="card">
        <h3>订单跟踪</h3>
        <p>实时查看您的订单状态，了解制作进度</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home视图组件
</script>

<style scoped lang="scss">
.home-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    color: #333;
    margin-bottom: 1rem;
    text-align: center;
  }

  p {
    color: #666;
    text-align: center;
    margin-bottom: 2rem;
  }

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;

    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      }

      h3 {
        color: #409EFF;
        margin-bottom: 0.5rem;
      }

      p {
        text-align: left;
        color: #666;
        margin: 0;
      }
    }
  }
}
</style>