<template>
  <div class="menu-view">
    <h1>菜单</h1>
    <p>浏览我们的美味菜品</p>
    <div class="menu-categories">
      <div class="category">
        <h2>热门推荐</h2>
        <div class="dishes">
          <div class="dish-card">
            <h3>招牌红烧肉</h3>
            <p>肥而不腻，入口即化</p>
            <span class="price">¥48.00</span>
          </div>
          <div class="dish-card">
            <h3>清蒸鲈鱼</h3>
            <p>新鲜美味，营养丰富</p>
            <span class="price">¥58.00</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Menu视图组件
</script>

<style scoped lang="scss">
.menu-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    color: #333;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  p {
    color: #666;
    text-align: center;
    margin-bottom: 2rem;
  }

  .menu-categories {
    .category {
      margin-bottom: 2rem;

      h2 {
        color: #409EFF;
        margin-bottom: 1rem;
        border-bottom: 2px solid #409EFF;
        padding-bottom: 0.5rem;
      }

      .dishes {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;

        .dish-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          }

          h3 {
            color: #333;
            margin-bottom: 0.5rem;
          }

          p {
            text-align: left;
            color: #666;
            margin: 0 0 1rem 0;
            font-size: 0.9rem;
          }

          .price {
            color: #F56C6C;
            font-weight: bold;
            font-size: 1.1rem;
          }
        }
      }
    }
  }
}
</style>