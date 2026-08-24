<template>
  <div class="loading-spinner">
    <div class="pulse-ring"></div>
    <div class="pulse-ring delay"></div>
    <div class="pulse-ring delay2"></div>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.pulse-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid var(--accent-secondary);
  opacity: 0;
  animation: pulse 1.5s ease-out infinite;
}

.pulse-ring.delay {
  animation-delay: 0.5s;
}

.pulse-ring.delay2 {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: scale(0.3);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>