<template>
  <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
    <span class="theme-icon" :class="{ rotating: isAnimating }">
      {{ isDark ? '☀️' : '🌙' }}
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isDark = ref(false);
const isAnimating = ref(false);
const emit = defineEmits(['theme-changed']);

const toggleTheme = () => {
  isAnimating.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 500);

  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  emit('theme-changed', theme);
};

onMounted(() => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark.value = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // Auto-detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
    const theme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }
});
</script>

<style scoped>
.theme-toggle {
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 182, 137, 0.2);
  flex-shrink: 0;
}

.theme-toggle:hover {
  transform: scale(1.08) rotate(10deg);
  box-shadow: 0 4px 16px rgba(242, 182, 137, 0.35);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  display: inline-block;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.theme-icon.rotating {
  transform: rotate(360deg);
}

@media (max-width: 768px) {
  .theme-toggle {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
