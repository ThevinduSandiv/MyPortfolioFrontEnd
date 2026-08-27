<template>
  <div class="toast-container">
    <Toast
      v-for="(toast, idx) in toasts"
      :key="idx"
      :visible="true"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      @close="removeToast(idx)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Toast from './Toast.vue';

const toasts = ref([]);

const addToast = (message, type = 'error', title = '') => {
  const id = Date.now();
  toasts.value.push({ id, message, type, title });
  
  setTimeout(() => {
    removeToast(toasts.value.findIndex(t => t.id === id));
  }, 5000);
};

const removeToast = (idx) => {
  toasts.value.splice(idx, 1);
};

// Expose methods
defineExpose({ addToast, removeToast });
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
  margin-bottom: 10px;
}
</style>
