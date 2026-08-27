<template>
  <div class="theme-toggle" @click="toggleTheme">
    <div class="toggle-switch" :class="{ active: isDark }">
      <span class="toggle-icon">{{ isDark ? '🌙' : '☀️' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['theme-changed']);
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  emit('theme-changed', theme);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    isDark.value = savedTheme === 'dark';
  } else {
    isDark.value = prefersDark;
  }
  
  const theme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
});
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-switch {
  width: 50px;
  height: 28px;
  background: #d4ccc4;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 2px;
  transition: all 0.3s ease;
  position: relative;
}

[data-theme='dark'] .toggle-switch {
  background: #333;
}

.toggle-switch.active {
  justify-content: flex-end;
  background: #382e28;
}

[data-theme='dark'] .toggle-switch.active {
  background: #f0e0d8;
}

.toggle-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.toggle-switch:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-icon {
  color: white;
}
</style>
