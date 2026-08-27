<template>
  <transition name="toast-fade">
    <div v-if="visible" :class="['toast', type]">
      <div class="toast-icon">{{ icon }}</div>
      <div class="toast-content">
        <p class="toast-title">{{ title }}</p>
        <p class="toast-message">{{ message }}</p>
      </div>
      <button class="toast-close" @click="emit('close')">✕</button>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  visible: Boolean,
  type: {
    type: String,
    default: 'error' // 'error', 'success', 'info', 'warning'
  },
  title: String,
  message: String
});

const emit = defineEmits(['close']);

const icon = computed(() => {
  const icons = {
    error: '❌',
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️'
  };
  return icons[type] || '❌';
});
</script>

<script>
import { computed } from 'vue';
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

[data-theme='dark'] .toast {
  background: #1a1a1a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.info {
  border-left: 4px solid #3b82f6;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
}

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin: 0 0 0.3rem 0;
  color: #382e28;
  font-size: 0.95rem;
}

[data-theme='dark'] .toast-title {
  color: #f0e0d8;
}

.toast-message {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

[data-theme='dark'] .toast-message {
  color: #b0b0b0;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #382e28;
}

[data-theme='dark'] .toast-close:hover {
  color: #f0e0d8;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(400px);
}
</style>
