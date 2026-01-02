<template>
  <div class="order-view">
    <h1>我的订单</h1>
    <p>查看和管理您的订单</p>
    <div class="order-list">
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">订单号: #123456</span>
          <span class="order-status">已完成</span>
        </div>
        <div class="order-content">
          <p>2024-10-15 12:30</p>
          <p>招牌红烧肉 × 1, 清蒸鲈鱼 × 1</p>
          <span class="order-total">总计: ¥106.00</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Order视图组件
</script>

<style scoped lang="scss">
.order-view {
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

  .order-list {
    .order-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      }

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;

        .order-id {
          font-weight: bold;
          color: #333;
        }

        .order-status {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: bold;
          background-color: #67C23A;
          color: white;
        }
      }

      .order-content {
        p {
          text-align: left;
          color: #666;
          margin: 0.5rem 0;
          font-size: 0.95rem;
        }

        .order-total {
          display: block;
          text-align: right;
          color: #F56C6C;
          font-weight: bold;
          margin-top: 1rem;
          font-size: 1.1rem;
        }
      }
    }
  }
}
</style>