<template>
  <section
    class="startup-loader"
    :class="`theme-${theme}`"
    aria-live="polite"
    aria-label="Preparing portfolio"
  >
    <div class="startup-atmosphere" aria-hidden="true"></div>

    <div class="orbit orbit-one" aria-hidden="true">
      <span class="orbit-icon orbit-code">&lt;/&gt;</span>
      <span class="orbit-icon orbit-star">✦</span>
    </div>
    <div class="orbit orbit-two" aria-hidden="true">
      <span class="orbit-icon orbit-plane">✈</span>
      <span class="orbit-icon orbit-camera">▣</span>
    </div>

    <div class="startup-content">
      <img :src="portfolioLogo" class="startup-logo" alt="Thevindu Hennayake" />
      <p class="startup-name">Thevindu Hennayake</p>
      <p class="startup-message">{{ message }}</p>
      <div class="startup-progress" aria-hidden="true"><span></span></div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import portfolioLogo from '@/assets/portfolioLogo.png';
import { api } from '@/services/api';

defineProps({
  theme: {
    type: String,
    default: 'light'
  }
});

const emit = defineEmits(['ready']);

const messages = [
  'Waking up the workshop — there’s good work ahead.',
  'Ideas, pixels, and a little momentum — almost ready.',
  'The workshop lights are on. The portfolio is catching up.',
  'A quiet moment while the engine gets moving.'
];

const messageIndex = ref(0);
const message = computed(() => messages[messageIndex.value]);
const minimumDisplayMs = 2000 + Math.round(Math.random() * 1000);
const retryDelayMs = 1500;
const startedAt = performance.now();
let retryTimer;
let messageTimer;
let controller;
let destroyed = false;

const delay = (milliseconds) => new Promise((resolve) => {
  retryTimer = window.setTimeout(resolve, milliseconds);
});

const waitForBackend = async () => {
  while (!destroyed) {
    controller = new AbortController();

    try {
      const response = await api.checkBackendHealth(controller.signal);
      if (response.status === 200) {
        const remainingDelay = Math.max(0, minimumDisplayMs - (performance.now() - startedAt));
        if (remainingDelay) await delay(remainingDelay);
        if (!destroyed) emit('ready');
        return;
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }

    await delay(retryDelayMs);
  }
};

onMounted(() => {
  messageTimer = window.setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % messages.length;
  }, 2800);
  waitForBackend();
});

onUnmounted(() => {
  destroyed = true;
  controller?.abort();
  window.clearTimeout(retryTimer);
  window.clearInterval(messageTimer);
});
</script>

<style scoped>
.startup-loader {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 2rem;
  color: var(--text-light);
  background: var(--bg-light);
  isolation: isolate;
}

.startup-atmosphere {
  position: absolute;
  z-index: -2;
  width: min(78vw, 70rem);
  aspect-ratio: 1.55;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(238, 145, 82, 0.2), rgba(242, 182, 137, 0.08) 42%, transparent 70%);
  filter: blur(18px);
}

.startup-content { width: min(100%, 39rem); text-align: center; }

.startup-logo {
  display: block;
  width: clamp(7rem, 16vw, 10.5rem);
  height: auto;
  margin: 0 auto 1.15rem;
  object-fit: contain;
}

.startup-name {
  color: var(--text-dark);
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 5vw, 4.2rem);
  line-height: 1;
}

.startup-message {
  min-height: 3rem;
  margin: 2.25rem auto 1.2rem;
  color: var(--text-secondary);
  font-size: clamp(0.94rem, 1.7vw, 1.08rem);
}

.startup-progress {
  width: min(100%, 28rem);
  height: 2px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 99px;
  background: color-mix(in srgb, var(--text-secondary) 26%, transparent);
}

.startup-progress span {
  display: block;
  width: 34%;
  height: 100%;
  border-radius: inherit;
  background: var(--gradient-accent);
  box-shadow: 0 0 13px rgba(238, 145, 82, 0.7);
  animation: loaderSweep 1.55s ease-in-out infinite;
}

.orbit {
  position: absolute;
  width: min(72vw, 62rem);
  aspect-ratio: 1.8;
  border: 1px solid rgba(238, 145, 82, 0.32);
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  pointer-events: none;
}

.orbit-one { transform: rotate(-16deg); animation: orbitDrift 18s linear infinite; }
.orbit-two { width: min(56vw, 46rem); transform: rotate(26deg); animation: orbitDriftReverse 14s linear infinite; }
.orbit-icon { position: absolute; color: var(--accent-secondary); font-size: clamp(1rem, 2vw, 1.6rem); line-height: 1; text-shadow: 0 0 14px rgba(238, 145, 82, 0.35); }
.orbit-code { top: 8%; left: 22%; }
.orbit-star { right: 13%; bottom: 17%; }
.orbit-plane { top: 5%; right: 20%; transform: rotate(16deg); }
.orbit-camera { bottom: 2%; left: 14%; }

.theme-dark .startup-logo { filter: invert(88%) sepia(19%) saturate(537%) hue-rotate(325deg) brightness(103%) contrast(95%); }
.theme-dark .startup-atmosphere { background: radial-gradient(ellipse, rgba(238, 145, 82, 0.19), rgba(242, 182, 137, 0.08) 42%, transparent 70%); }

@keyframes loaderSweep { 0% { transform: translateX(-115%); } 58%, 100% { transform: translateX(330%); } }
@keyframes orbitDrift { to { transform: rotate(344deg); } }
@keyframes orbitDriftReverse { to { transform: rotate(-334deg); } }

@media (prefers-reduced-motion: reduce) {
  .startup-progress span, .orbit { animation: none; }
  .startup-progress span { width: 48%; transform: translateX(55%); }
}

@media (max-width: 560px) {
  .startup-loader { padding: 1.5rem; }
  .startup-logo { width: 7.6rem; }
  .startup-message { max-width: 19rem; margin-top: 1.75rem; }
  .orbit { width: 125vw; }
  .orbit-two { width: 98vw; }
}
</style>
