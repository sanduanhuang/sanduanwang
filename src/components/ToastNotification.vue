<template>
  <TransitionGroup name="toast" tag="div" class="toast-container">
    <div 
      v-for="toast in toasts" 
      :key="toast.id" 
      :class="['toast-item', `toast-${toast.type}`]"
    >
      <el-icon v-if="toast.type === 'success'" class="toast-icon"><CircleCheck /></el-icon>
      <el-icon v-else-if="toast.type === 'error'" class="toast-icon"><CircleClose /></el-icon>
      <el-icon v-else class="toast-icon"><InfoFilled /></el-icon>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CircleCheck, CircleClose, InfoFilled } from '@element-plus/icons-vue';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
  const id = ++toastId;
  toasts.value.push({ id, message, type });
  
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, duration);
};

defineExpose({ showToast });
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 85px;
  right: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  pointer-events: auto;
  min-width: 200px;
  max-width: 350px;
}

.toast-success {
  background: rgba(34, 197, 94, 0.95);
  color: white;
}

.toast-error {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.toast-info {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  word-break: break-word;
}

.toast-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-leave-active {
  animation: slideOut 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}
</style>
