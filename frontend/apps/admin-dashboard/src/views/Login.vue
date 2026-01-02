<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo区域 -->
      <div class="logo-section">
        <img src="/assets/logo.png" alt="YYC³" class="logo" />
        <h1 class="title">YYC³餐饮管理后台</h1>
        <p class="subtitle">基于五高五标五化理念的智能化管理平台</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            size="large"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="captcha" v-if="showCaptcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              prefix-icon="Key"
              size="large"
              class="captcha-input"
              @keyup.enter="handleLogin"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码" />
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">
            记住密码
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
            style="width: 100%"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <!-- 快速入口 -->
        <div class="quick-links">
          <el-divider>快速体验</el-divider>
          <div class="quick-buttons">
            <el-button type="success" plain size="small" @click="quickLogin('admin')">
              管理员体验
            </el-button>
            <el-button type="info" plain size="small" @click="quickLogin('staff')">
              员工端体验
            </el-button>
            <el-button type="warning" plain size="small" @click="quickLogin('customer')">
              顾客端体验
            </el-button>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle-decoration circle-1"></div>
      <div class="circle-decoration circle-2"></div>
      <div class="circle-decoration circle-3"></div>
      <div class="line-decoration line-1"></div>
      <div class="line-decoration line-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  email: 'admin@yyc3.com',
  password: '',
  captcha: '',
  rememberMe: false
})

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度应为6-50个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度应为4位', trigger: 'blur' }
  ]
}

// 状态
const loading = ref(false)
const showCaptcha = ref(false)
const captchaUrl = ref('')

// 方法
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 调用登录接口
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password
    })

    ElMessage.success('登录成功')

    // 跳转到工作台
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Login failed:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')

    // 显示验证码
    if (error.message?.includes('验证码')) {
      showCaptcha.value = true
      refreshCaptcha()
    }
  } finally {
    loading.value = false
  }
}

// 快速登录
const quickLogin = async (type: string) => {
  const credentials = {
    admin: { email: 'admin@yyc3.com', password: 'admin123' },
    staff: { email: 'staff@yyc3.com', password: 'staff123' },
    customer: { email: 'customer@yyc3.com', password: 'customer123' }
  }

  const credential = credentials[type as keyof typeof credentials]
  if (!credential) return

  loginForm.email = credential.email
  loginForm.password = credential.password
  handleLogin()
}

// 刷新验证码
const refreshCaptcha = () => {
  // 模拟验证码
  const code = Math.random().toString(36).substring(2, 6)
  captchaUrl.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="100" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="40" fill="#f0f2f5"/>
      <text x="50%" y="25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
        ${code}
      </text>
    </svg>
  `)}`
}

// 初始化
onMounted(() => {
  // 检查是否有存储的用户信息
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    loginForm.email = user.email
  }

  // 模拟生成验证码
  refreshCaptcha()
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 40px;
  width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.4;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .login-btn {
    height: 44px;
    font-size: 16px;
    border-radius: 6px;
  }
}

.captcha-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 80px;
  height: 40px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--el-color-primary);
  }

  img {
    max-width: 100%;
    max-height: 100%;
  }
}

.quick-links {
  margin-top: 24px;
  text-align: center;

  .quick-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.1;
}

.circle-decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);

  &.circle-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 5%;
    animation: float 6s ease-in-out infinite;
  }

  &.circle-2 {
    width: 150px;
    height: 150px;
    bottom: 10%;
    right: 10%;
    animation: float 8s ease-in-out infinite reverse;
  }

  &.circle-3 {
    width: 100px;
    height: 100px;
    top: 50%;
    left: 15%;
    animation: float 4s ease-in-out infinite;
  }
}

.line-decoration {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);

  &.line-1 {
    width: 300px;
    height: 1px;
    top: 30%;
    left: -50px;
    transform: rotate(45deg);
    animation: line 4s ease-in-out infinite;
  }

  &.line-2 {
    width: 200px;
    height: 1px;
    bottom: 30%;
    right: -50px;
    transform: rotate(-45deg);
    animation: line 6s ease-in-out infinite reverse;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    margin: 20px;
    padding: 30px 20px;
  }

  .quick-buttons {
    .el-button {
      flex: 1;
      min-width: 80px;
    }
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }

  .login-card {
    width: 100%;
    margin: 0;
    padding: 24px;
  }

  .logo-section {
    .title {
      font-size: 20px;
    }

    .subtitle {
      font-size: 13px;
    }
  }

  .quick-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>