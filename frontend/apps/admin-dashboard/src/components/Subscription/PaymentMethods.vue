<template>
  <div class="payment-methods">
    <!-- 添加支付方式按钮 -->
    <div class="add-payment-section">
      <el-card>
        <div class="add-payment-content">
          <div class="add-payment-info">
            <h3>管理支付方式</h3>
            <p>添加或管理您的支付方式，用于订阅费用结算</p>
          </div>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加支付方式
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 支付方式列表 -->
    <div class="payment-methods-list">
      <el-card v-if="paymentMethods.length > 0">
        <div class="payment-cards">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="payment-card"
            :class="{ 'default': method.isDefault }"
          >
            <!-- 默认标签 -->
            <div v-if="method.isDefault" class="default-badge">
              <el-tag type="success" size="small">默认</el-tag>
            </div>

            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="payment-type">
                <el-icon class="type-icon">
                  <CreditCard v-if="method.type === 'card'" />
                  <Wallet v-else-if="method.type === 'alipay'" />
                  <Iphone v-else-if="method.type === 'wechat'" />
                  <Bank v-else />
                </el-icon>
                <span class="type-name">{{ getPaymentTypeName(method.type) }}</span>
              </div>
              <div class="card-actions">
                <el-dropdown trigger="click" @command="(command) => handleCommand(command, method)">
                  <el-button size="small" text>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="setDefault"
                        v-if="!method.isDefault"
                      >
                        设为默认
                      </el-dropdown-item>
                      <el-dropdown-item command="edit">
                        编辑信息
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="remove"
                        divided
                        :disabled="paymentMethods.length === 1"
                      >
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <!-- 支付信息 -->
            <div class="payment-info">
              <div v-if="method.type === 'card' && method.card" class="card-info">
                <div class="card-brand">
                  <el-icon>
                    <CreditCard />
                  </el-icon>
                  <span>{{ getCardBrandName(method.card.brand) }}</span>
                </div>
                <div class="card-number">
                  **** **** **** {{ method.card.last4 }}
                </div>
                <div class="card-expiry">
                  有效期 {{ formatExpiryDisplay(method.card.expiryMonth, method.card.expiryYear) }}
                </div>
              </div>

              <div v-else-if="method.type === 'alipay'" class="alipay-info">
                <div class="alipay-logo">
                  <el-icon><Wallet /></el-icon>
                </div>
                <div class="alipay-details">
                  <div class="account-info">支付宝账户</div>
                  <div v-if="method.billing" class="billing-email">{{ method.billing.email }}</div>
                </div>
              </div>

              <div v-else-if="method.type === 'wechat'" class="wechat-info">
                <div class="wechat-logo">
                  <el-icon><Iphone /></el-icon>
                </div>
                <div class="wechat-details">
                  <div class="account-info">微信支付</div>
                  <div v-if="method.billing" class="billing-email">{{ method.billing.email }}</div>
                </div>
              </div>

              <div v-else class="bank-info">
                <div class="bank-logo">
                  <el-icon><Bank /></el-icon>
                </div>
                <div class="bank-details">
                  <div class="account-info">银行账户</div>
                  <div v-if="method.billing" class="billing-name">{{ method.billing.name }}</div>
                </div>
              </div>
            </div>

            <!-- 账单信息 -->
            <div v-if="method.billing" class="billing-info">
              <div class="billing-details">
                <div class="billing-name">
                  {{ method.billing.name }}
                </div>
                <div class="billing-contact">
                  {{ method.billing.email }}
                  <span v-if="method.billing.phone">· {{ method.billing.phone }}</span>
                </div>
                <div v-if="method.billing.address" class="billing-address">
                  {{ formatAddress(method.billing.address) }}
                </div>
              </div>
            </div>

            <!-- 添加时间 -->
            <div class="added-date">
              添加于 {{ formatDate(method.createdAt) }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 无支付方式时的提示 -->
      <el-empty v-else description="还没有添加支付方式">
        <template #image>
          <el-icon size="100"><CreditCard /></el-icon>
        </template>
        <el-button type="primary" @click="showAddDialog = true">
          添加支付方式
        </el-button>
      </el-empty>
    </div>

    <!-- 添加支付方式对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingMethod ? '编辑支付方式' : '添加支付方式'"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form
        ref="paymentFormRef"
        :model="paymentForm"
        :rules="paymentRules"
        label-width="120px"
      >
        <!-- 支付方式类型 -->
        <el-form-item label="支付方式" prop="type">
          <el-radio-group v-model="paymentForm.type" :disabled="!!editingMethod">
            <el-radio-button label="card">
              <el-icon><CreditCard /></el-icon>
              银行卡
            </el-radio-button>
            <el-radio-button label="alipay">
              <el-icon><Wallet /></el-icon>
              支付宝
            </el-radio-button>
            <el-radio-button label="wechat">
              <el-icon><Iphone /></el-icon>
              微信支付
            </el-radio-button>
            <el-radio-button label="bank_account">
              <el-icon><Bank /></el-icon>
              银行转账
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 银行卡信息 -->
        <template v-if="paymentForm.type === 'card' && !editingMethod">
          <el-form-item label="银行卡号" prop="cardNumber">
            <el-input
              v-model="paymentForm.cardNumber"
              placeholder="请输入银行卡号"
              maxlength="19"
              @input="formatCardNumber"
            />
          </el-form-item>
          <el-form-item label="持卡人姓名" prop="cardholderName">
            <el-input
              v-model="paymentForm.cardholderName"
              placeholder="请输入持卡人姓名"
            />
          </el-form-item>
          <el-form-item label="有效期" prop="expiry">
            <el-input
              v-model="paymentForm.expiry"
              placeholder="MM/YY"
              maxlength="5"
              @input="formatExpiry"
            />
          </el-form-item>
          <el-form-item label="CVV" prop="cvv">
            <el-input
              v-model="paymentForm.cvv"
              placeholder="请输入CVV"
              maxlength="4"
              show-password
            />
          </el-form-item>
        </template>

        <!-- 支付宝/微信支付 -->
        <template v-if="(paymentForm.type === 'alipay' || paymentForm.type === 'wechat') && !editingMethod">
          <el-form-item label="账户信息" prop="accountId">
            <el-input
              v-model="paymentForm.accountId"
              :placeholder="`请输入${paymentForm.type === 'alipay' ? '支付宝' : '微信'}账户`"
            />
          </el-form-item>
        </template>

        <!-- 账单信息 -->
        <el-divider>账单信息</el-divider>
        <el-form-item label="姓名" prop="billingName">
          <el-input
            v-model="paymentForm.billingName"
            placeholder="请输入姓名"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="billingEmail">
          <el-input
            v-model="paymentForm.billingEmail"
            placeholder="请输入邮箱"
            type="email"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="billingPhone">
          <el-input
            v-model="paymentForm.billingPhone"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item label="地址" prop="billingAddress">
          <el-input
            v-model="paymentForm.billingAddress"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="paymentForm.isDefault" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleAddPaymentMethod"
          :loading="submitting"
        >
          {{ editingMethod ? '保存修改' : '添加支付方式' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="删除支付方式"
      width="400px"
    >
      <p>确定要删除这个支付方式吗？删除后无法恢复。</p>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button
          type="danger"
          @click="handleDeletePaymentMethod"
          :loading="deleting"
        >
          确定删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, CreditCard, Wallet, MoreFilled
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { subscriptionAPI } from '@/api/subscription'
import type { PaymentMethod } from '@/api/subscription'

// Emits
const emit = defineEmits<{
  updated: []
}>()

// 响应式数据
const paymentMethods = ref<PaymentMethod[]>([])
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingMethod = ref<PaymentMethod | null>(null)
const methodToDelete = ref<PaymentMethod | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const paymentFormRef = ref<FormInstance>()

// 表单数据
const paymentForm = reactive({
  type: 'card',
  cardNumber: '',
  cardholderName: '',
  expiry: '',
  cvv: '',
  accountId: '',
  billingName: '',
  billingEmail: '',
  billingPhone: '',
  billingAddress: '',
  isDefault: false
})

// 表单验证规则
const paymentRules: FormRules = {
  type: [
    { required: true, message: '请选择支付方式类型', trigger: 'change' }
  ],
  cardNumber: [
    { required: true, message: '请输入银行卡号', trigger: 'blur' },
    { pattern: /^\d{16,19}$/, message: '请输入有效的银行卡号', trigger: 'blur' }
  ],
  cardholderName: [
    { required: true, message: '请输入持卡人姓名', trigger: 'blur' }
  ],
  expiry: [
    { required: true, message: '请输入有效期', trigger: 'blur' },
    { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: '请输入有效的有效期 (MM/YY)', trigger: 'blur' }
  ],
  cvv: [
    { required: true, message: '请输入CVV', trigger: 'blur' },
    { pattern: /^\d{3,4}$/, message: '请输入有效的CVV', trigger: 'blur' }
  ],
  accountId: [
    { required: true, message: '请输入账户信息', trigger: 'blur' }
  ],
  billingName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  billingEmail: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  billingPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  billingAddress: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
}

// 生命周期
onMounted(() => {
  loadPaymentMethods()
})

// 方法
const loadPaymentMethods = async () => {
  try {
    const response = await subscriptionAPI.getPaymentMethods()
    if (response.success && response.data) {
      paymentMethods.value = response.data
    }
  } catch (error) {
    console.error('Load payment methods failed:', error)
    ElMessage.error('加载支付方式失败')
  }
}

const getPaymentTypeName = (type: string) => {
  const names = {
    card: '银行卡',
    alipay: '支付宝',
    wechat: '微信支付',
    bank_account: '银行转账'
  }
  return names[type] || type
}

const getCardBrandName = (brand: string) => {
  const brands = {
    visa: 'Visa',
    mastercard: 'MasterCard',
    amex: 'American Express',
    discover: 'Discover',
    jcb: 'JCB',
    unionpay: '银联'
  }
  return brands[brand] || brand.toUpperCase()
}

const formatCardNumber = () => {
  // 移除所有非数字字符
  let value = paymentForm.cardNumber.replace(/\D/g, '')
  // 每4位添加一个空格
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  paymentForm.cardNumber = value
}

const formatExpiry = () => {
  // 移除所有非数字字符
  let value = paymentForm.expiry.replace(/\D/g, '')
  // 添加斜杠
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  paymentForm.expiry = value
}

const formatExpiryDisplay = (month: number, year: number) => {
  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
}

const formatAddress = (address: any) => {
  return `${address.line1}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleCommand = async (command: string, method: PaymentMethod) => {
  switch (command) {
    case 'setDefault':
      await setAsDefault(method)
      break
    case 'edit':
      editPaymentMethod(method)
      break
    case 'remove':
      confirmDelete(method)
      break
  }
}

const setAsDefault = async (method: PaymentMethod) => {
  try {
    const response = await subscriptionAPI.setDefaultPaymentMethod(method.id)
    if (response.success) {
      ElMessage.success('已设为默认支付方式')
      await loadPaymentMethods()
      emit('updated')
    }
  } catch (error) {
    console.error('Set default payment method failed:', error)
    ElMessage.error('设置默认支付方式失败')
  }
}

const editPaymentMethod = (method: PaymentMethod) => {
  editingMethod.value = method
  // 填充表单数据
  paymentForm.type = method.type
  paymentForm.billingName = method.billing?.name || ''
  paymentForm.billingEmail = method.billing?.email || ''
  paymentForm.billingPhone = method.billing?.phone || ''
  paymentForm.billingAddress = method.billing?.address?.line1 || ''
  paymentForm.isDefault = method.isDefault
  showAddDialog.value = true
}

const confirmDelete = (method: PaymentMethod) => {
  methodToDelete.value = method
  showDeleteDialog.value = true
}

const handleAddPaymentMethod = async () => {
  if (!paymentFormRef.value) return

  try {
    await paymentFormRef.value.validate()
    submitting.value = true

    const params: any = {
      type: paymentForm.type,
      isDefault: paymentForm.isDefault,
      billing: {
        name: paymentForm.billingName,
        email: paymentForm.billingEmail,
        phone: paymentForm.billingPhone,
        address: {
          line1: paymentForm.billingAddress,
          city: '', // 可以从地址中解析
          state: '',
          postalCode: '',
          country: 'CN'
        }
      }
    }

    if (paymentForm.type === 'card') {
      // 这里应该调用支付服务提供商的API来获取支付方式ID
      // const paymentMethodId = await createCardPaymentMethod(...)
      params.paymentMethodId = 'temp_card_id'
    } else if (paymentForm.type === 'alipay' || paymentForm.type === 'wechat') {
      // params.paymentMethodId = await createDigitalPaymentMethod(...)
      params.paymentMethodId = 'temp_digital_id'
      params.accountId = paymentForm.accountId
    }

    const response = await subscriptionAPI.addPaymentMethod(params)

    if (response.success) {
      ElMessage.success(editingMethod.value ? '修改成功' : '添加成功')
      showAddDialog.value = false
      resetForm()
      await loadPaymentMethods()
      emit('updated')
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error: any) {
    if (error.message !== 'validation failed') {
      console.error('Add payment method failed:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleDeletePaymentMethod = async () => {
  if (!methodToDelete.value) return

  try {
    deleting.value = true
    const response = await subscriptionAPI.removePaymentMethod(methodToDelete.value.id)

    if (response.success) {
      ElMessage.success('删除成功')
      showDeleteDialog.value = false
      methodToDelete.value = null
      await loadPaymentMethods()
      emit('updated')
    }
  } catch (error) {
    console.error('Delete payment method failed:', error)
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const resetForm = () => {
  if (paymentFormRef.value) {
    paymentFormRef.value.resetFields()
  }
  Object.assign(paymentForm, {
    type: 'card',
    cardNumber: '',
    cardholderName: '',
    expiry: '',
    cvv: '',
    accountId: '',
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    isDefault: false
  })
  editingMethod.value = null
}

// 监听对话框关闭
const handleDialogClose = () => {
  resetForm()
}
</script>

<style lang="scss" scoped>
.payment-methods {
  .add-payment-section {
    margin-bottom: 24px;

    .el-card {
      .add-payment-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .add-payment-info {
          h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }

          p {
            margin: 0;
            color: #909399;
            font-size: 14px;
          }
        }
      }
    }
  }

  .payment-methods-list {
    .payment-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;

      .payment-card {
        background: white;
        border: 2px solid #e4e7ed;
        border-radius: 12px;
        padding: 20px;
        position: relative;
        transition: all 0.3s ease;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
        }

        &.default {
          border-color: #67c23a;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .default-badge {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .payment-type {
            display: flex;
            align-items: center;
            gap: 8px;

            .type-icon {
              font-size: 20px;
              color: #409eff;
            }

            .type-name {
              font-weight: 600;
              color: #303133;
            }
          }
        }

        .payment-info {
          margin-bottom: 16px;

          .card-info {
            .card-brand {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 8px;
              color: #606266;
              font-size: 14px;
            }

            .card-number {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }

            .card-expiry {
              color: #909399;
              font-size: 14px;
            }
          }

          .alipay-info, .wechat-info, .bank-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .alipay-logo, .wechat-logo, .bank-logo {
              width: 40px;
              height: 40px;
              border-radius: 8px;
              background: #f0f9ff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              color: #409eff;
            }

            .alipay-details, .wechat-details, .bank-details {
              .account-info {
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .billing-email, .billing-name {
                color: #909399;
                font-size: 14px;
              }
            }
          }
        }

        .billing-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;

          .billing-details {
            .billing-name {
              font-weight: 600;
              color: #303133;
              margin-bottom: 4px;
            }

            .billing-contact {
              color: #606266;
              font-size: 14px;
              margin-bottom: 4px;
            }

            .billing-address {
              color: #909399;
              font-size: 13px;
            }
          }
        }

        .added-date {
          color: #c0c4cc;
          font-size: 12px;
          text-align: center;
        }
      }
    }
  }

  .el-empty {
    padding: 60px 0;
  }
}

// 对话框样式
:deep(.el-dialog) {
  .el-divider {
    margin: 24px 0;
  }

  .el-radio-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}

@media (max-width: 768px) {
  .payment-methods {
    .payment-cards {
      grid-template-columns: 1fr;
    }

    .add-payment-content {
      flex-direction: column;
      gap: 16px;
      align-items: stretch !important;
    }
  }
}
</style>