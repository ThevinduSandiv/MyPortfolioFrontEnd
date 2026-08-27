<template>
  <button
    class="theme-toggle"
    :class="{ active: isDark }"
    type="button"
    role="switch"
    :aria-checked="isDark"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleTheme"
  >
    <span class="toggle-track" aria-hidden="true">
      <span class="stars"><i></i><i></i><i></i></span>
      <span class="toggle-thumb">
        <svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none">
          <path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z" fill="currentColor" />
        </svg>
      </span>
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['theme-changed']);
const isDark = ref(false);

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  emit('theme-changed', theme);
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme(isDark.value ? 'dark' : 'light');
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  isDark.value = savedTheme ? savedTheme === 'dark' : prefersDark;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
});
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.toggle-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 62px;
  height: 34px;
  padding: 3px;
  overflow: hidden;
  border: 1px solid rgba(139, 115, 85, 0.28);
  border-radius: 999px;
  background: linear-gradient(135deg, #f8d6bb 0%, #ef9b62 100%);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.65), 0 6px 18px rgba(151, 91, 50, 0.18);
  transition: background 0.45s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}

.theme-toggle.active .toggle-track {
  border-color: rgba(242, 182, 137, 0.22);
  background: linear-gradient(135deg, #171311 0%, #46362f 100%);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 7px 20px rgba(0, 0, 0, 0.3);
}

.toggle-thumb {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 50%;
  color: #e87932;
  background: rgba(255, 252, 248, 0.94);
  box-shadow: 0 4px 12px rgba(91, 48, 24, 0.24);
  transform: translateX(0);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease;
}

.theme-toggle.active .toggle-thumb {
  color: #f4d7c4;
  background: rgba(64, 48, 42, 0.96);
  border-color: rgba(255, 225, 207, 0.22);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.42);
  transform: translateX(28px);
}

.theme-icon {
  position: absolute;
  width: 17px;
  height: 17px;
  transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.sun-icon { opacity: 1; transform: rotate(0) scale(1); }
.moon-icon { opacity: 0; transform: rotate(-35deg) scale(0.6); }
.theme-toggle.active .sun-icon { opacity: 0; transform: rotate(90deg) scale(0.55); }
.theme-toggle.active .moon-icon { opacity: 1; transform: rotate(0) scale(1); }

.stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateX(-5px);
  transition: opacity 0.35s ease, transform 0.45s ease;
}

.stars i {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #f8d7c2;
  box-shadow: 0 0 5px rgba(248, 215, 194, 0.8);
}

.stars i:nth-child(1) { top: 8px; left: 10px; }
.stars i:nth-child(2) { top: 19px; left: 17px; width: 3px; height: 3px; }
.stars i:nth-child(3) { top: 12px; left: 25px; }
.theme-toggle.active .stars { opacity: 1; transform: translateX(0); }

.theme-toggle:hover .toggle-track {
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.65), 0 9px 24px rgba(151, 91, 50, 0.28);
}

.theme-toggle.active:hover .toggle-track {
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 9px 25px rgba(0, 0, 0, 0.42);
}

.theme-toggle:active .toggle-thumb { width: 29px; }
.theme-toggle.active:active .toggle-thumb { transform: translateX(25px); }

.theme-toggle:focus-visible {
  outline: 3px solid rgba(238, 145, 82, 0.42);
  outline-offset: 3px;
}

@media (max-width: 480px) {
  .toggle-track { width: 58px; height: 32px; }
  .toggle-thumb { width: 24px; height: 24px; }
  .theme-toggle.active .toggle-thumb { transform: translateX(26px); }
  .theme-toggle.active:active .toggle-thumb { transform: translateX(23px); }
}
</style>
