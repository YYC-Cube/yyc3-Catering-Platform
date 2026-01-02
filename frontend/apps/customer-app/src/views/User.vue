<template>
  <div class="user-view">
    <h1>个人中心</h1>
    <p>管理您的账户信息</p>
    <div class="user-profile">
      <div class="profile-header">
        <div class="avatar">
          <img src="https://via.placeholder.com/100" alt="用户头像">
        </div>
        <div class="profile-info">
          <h2>张三</h2>
          <p>138****8888</p>
        </div>
      </div>
      <div class="user-menu">
        <div class="menu-item">
          <span>个人信息</span>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="menu-item">
          <span>地址管理</span>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="menu-item">
          <span>优惠券</span>
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// User视图组件
</script>

<style scoped lang="scss">
.user-view {
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

  .user-profile {
    .profile-header {
      display: flex;
      align-items: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;

      .avatar {
        img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
        }
      }

      .profile-info {
        margin-left: 2rem;

        h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        p {
          text-align: left;
          color: #666;
          margin: 0;
        }
      }
    }

    .user-menu {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

      .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #f5f7fa;
        }

        span {
          color: #333;
          font-size: 0.95rem;
        }

        i {
          color: #909399;
        }
      }
    }
  }
}
</style>