<template>
  <div class="coming-soon">
    <div class="content">
      <div class="animated-title">
        <h1>Coming Soon</h1>
        <div class="underline"></div>
      </div>
      <p class="subtitle">Something fancy and cool is being built here...</p>

      <div class="floating-elements">
        <span class="element" style="--delay: 0s">✈️</span>
        <span class="element" style="--delay: 0.5s">🛫</span>
        <span class="element" style="--delay: 1s">🌍</span>
        <span class="element" style="--delay: 1.5s">🚀</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <p class="progress-text">Working on this masterpiece...</p>
    </div>
  </div>
</template>

<script setup>
// Coming soon page logic
</script>

<style scoped>
.coming-soon {
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(242,182,137,0.1) 0%, rgba(238,145,82,0.05) 100%);
  border-radius: 12px;
  animation: fadeIn 0.6s;
}

@keyframes fadeIn { from { opacity: 0; } }

[data-theme='dark'] .coming-soon {
  background: linear-gradient(135deg, rgba(242,182,137,0.05) 0%, rgba(238,145,82,0.02) 100%);
}

.content {
  text-align: center;
  z-index: 1;
}

.animated-title {
  margin-bottom: 1.5rem;
}

.animated-title h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  color: #382e28;
  animation: scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1);
}

[data-theme='dark'] .animated-title h1 {
  color: #f0e0d8;
}

@keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } }

.underline {
  height: 4px;
  width: 200px;
  margin: 1rem auto 0;
  background: linear-gradient(90deg, #ee9152, #f2b689);
  border-radius: 2px;
  animation: slideIn 0.8s ease-out 0.2s both;
}

@keyframes slideIn { from { width: 0; } }

.subtitle {
  font-size: 1.3rem;
  color: #8b7355;
  margin: 1.5rem 0 2rem;
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } }

[data-theme='dark'] .subtitle { color: #d4b5a0; }

.floating-elements {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  font-size: 2.5rem;
}

.element {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.progress-bar {
  width: 300px;
  height: 8px;
  background: rgba(238,145,82,0.2);
  border-radius: 4px;
  margin: 2rem auto;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f2b689, #ee9152);
  border-radius: 4px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

.progress-text {
  font-size: 0.9rem;
  color: #8b7355;
  margin: 1rem 0 0;
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

[data-theme='dark'] .progress-text { color: #a08070; }

@media (max-width: 768px) {
  .coming-soon {
    min-height: 400px;
  }
  .animated-title h1 {
    font-size: 2.5rem;
  }
  .subtitle {
    font-size: 1rem;
  }
  .floating-elements {
    font-size: 1.8rem;
    gap: 1rem;
  }
}
</style>
