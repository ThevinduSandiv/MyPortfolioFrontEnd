<template>
  <section class="coming-soon">
    <div class="coming-soon-container">
      <div class="content">
        <h1 class="title">Coming Soon</h1>
        <p class="subtitle">This page is under development</p>
        <div class="animated-emoji">🚀</div>
        <p class="message">Check back soon for exciting updates!</p>
      </div>

      <!-- Floating elements animation -->
      <div v-for="i in 5" :key="i" class="floating-shape" :style="{ '--delay': i * 0.2 + 's' }"></div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.coming-soon {
  width: 100%;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.coming-soon-container {
  position: relative;
  text-align: center;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #382e28;
  background: linear-gradient(135deg, #ee9152 0%, #f2b689 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme='dark'] .title {
  color: #f0e0d8;
  -webkit-text-fill-color: unset;
  background: unset;
}

.subtitle {
  font-size: 1.3rem;
  color: #8b7355;
  margin: 0 0 1.5rem 0;
}

[data-theme='dark'] .subtitle {
  color: #d4b5a0;
}

.animated-emoji {
  font-size: 4rem;
  margin: 1.5rem 0;
  animation: bounce 2s ease-in-out infinite;
  display: inline-block;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.message {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

[data-theme='dark'] .message {
  color: #aaa;
}

/* Floating shapes */
.floating-shape {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(238, 145, 82, 0.2);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite, rotate 20s linear infinite;
  animation-delay: var(--delay);
}

.floating-shape:nth-child(1) {
  top: -20px;
  left: -20px;
  width: 80px;
  height: 80px;
}

.floating-shape:nth-child(2) {
  top: 50%;
  right: -40px;
  transform: translateY(-50%);
  width: 120px;
  height: 120px;
}

.floating-shape:nth-child(3) {
  bottom: 50px;
  left: 10%;
  width: 60px;
  height: 60px;
}

.floating-shape:nth-child(4) {
  bottom: -30px;
  right: 10%;
  width: 90px;
  height: 90px;
}

.floating-shape:nth-child(5) {
  top: 30%;
  left: 5%;
  width: 70px;
  height: 70px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-30px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .coming-soon {
    min-height: 50vh;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .animated-emoji {
    font-size: 3rem;
  }
}
</style>
