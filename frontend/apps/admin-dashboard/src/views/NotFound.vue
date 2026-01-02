<template>
  <div class="not-found">
    <div class="container">
      <div class="content">
        <div class="error-code">404</div>
        <div class="error-title">页面不存在</div>
        <div class="error-description">
          抱歉，您访问的页面不存在或已被移除
        </div>
        <div class="actions">
          <el-button type="primary" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上页
          </el-button>
        </div>
        <div class="suggestions">
          <h4>您可能想要：</h4>
          <ul>
            <li><a href="/dashboard">经营数据看板</a></li>
            <li><a href="/orders">订单管理</a></li>
            <li><a href="/reservations">预订管理</a></li>
            <li><a href="/menu">菜单管理</a></li>
            <li><a href="/customers">客户管理</a></li>
          </ul>
        </div>
      </div>
      <div class="illustration">
        <div class="plate">
          <div class="plate-inner"></div>
        </div>
        <div class="chopsticks">
          <div class="chopstick chopstick-1"></div>
          <div class="chopstick chopstick-2"></div>
        </div>
        <div class="steam">
          <div class="steam-particle steam-1"></div>
          <div class="steam-particle steam-2"></div>
          <div class="steam-particle steam-3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 1200px;
  width: 100%;
}

.content {
  text-align: center;
  color: white;
  flex: 1;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.actions .el-button {
  height: 44px;
  padding: 0 24px;
  font-size: 16px;
  border-radius: 22px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.actions .el-button--primary {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
}

.actions .el-button--default {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
}

.suggestions {
  text-align: left;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.suggestions h4 {
  color: white;
  font-size: 18px;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  margin-bottom: 8px;
}

.suggestions a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
  display: inline-block;
  padding: 4px 0;

  &:hover {
    color: white;
    transform: translateX(4px);
  }
}

.illustration {
  flex: 0 0 300px;
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plate {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: float 6s ease-in-out infinite;
}

.plate-inner {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f8f8f8 0%, #e8e8e8 100%);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chopsticks {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.chopstick {
  width: 4px;
  height: 180px;
  background: linear-gradient(180deg, #d4a574 0%, #b8935f 100%);
  border-radius: 2px;
  position: absolute;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chopstick-1 {
  transform: rotate(-15deg);
  transform-origin: center bottom;
  animation: drop 2s ease-in-out infinite;
}

.chopstick-2 {
  transform: rotate(15deg);
  transform-origin: center bottom;
  animation: drop 2s ease-in-out infinite 0.5s;
}

.steam {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
}

.steam-particle {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  position: absolute;
  animation: steam-rise 3s ease-in-out infinite;
}

.steam-1 {
  left: -20px;
  animation-delay: 0s;
}

.steam-2 {
  left: 0px;
  animation-delay: 1s;
}

.steam-3 {
  left: 20px;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes drop {
  0%, 100% {
    transform: rotate(-15deg) translateY(0);
  }
  50% {
    transform: rotate(-25deg) translateY(-10px);
  }
}

@keyframes steam-rise {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  20% {
    opacity: 0.8;
    transform: translateY(-20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px) scale(1.5);
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .container {
    gap: 60px;
  }

  .illustration {
    flex: 0 0 250px;
    height: 250px;
  }

  .plate {
    width: 160px;
    height: 160px;
  }

  .plate-inner {
    width: 130px;
    height: 130px;
  }

  .chopstick {
    height: 140px;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }

  .illustration {
    order: -1;
    flex: 0 0 200px;
    height: 200px;
  }

  .plate {
    width: 140px;
    height: 140px;
  }

  .plate-inner {
    width: 110px;
    height: 110px;
  }

  .chopstick {
    height: 120px;
  }

  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 28px;
  }

  .error-description {
    font-size: 16px;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .actions .el-button {
    width: 200px;
  }

  .suggestions {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .not-found {
    padding: 16px;
  }

  .error-code {
    font-size: 60px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 14px;
    margin-bottom: 30px;
  }

  .actions .el-button {
    height: 40px;
    font-size: 14px;
    width: 160px;
  }

  .suggestions {
    padding: 20px;
  }

  .suggestions h4 {
    font-size: 16px;
  }

  .suggestions a {
    font-size: 14px;
  }
}
</style>