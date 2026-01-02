<template>
  <div class="create-experiment-dialog">
    <h2>创建实验</h2>
    <p>这是一个占位组件，用于创建学习进化实验。</p>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

// 定义属性
const props = defineProps<{
  visible: boolean
}>()

// 定义事件
const emit = defineEmits<{
  close: []
  save: []
}>()

// 示例数据
const experimentName = ref('')
const experimentDescription = ref('')
const experimentParameters = ref({})

// 示例方法
const saveExperiment = () => {
  // 这里可以添加保存实验的逻辑
  emit('save')
}

const closeDialog = () => {
  emit('close')
}
</script>

<style scoped>
.create-experiment-dialog {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}
</style>