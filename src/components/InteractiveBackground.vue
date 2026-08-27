<template>
  <div class="interactive-bg" ref="bgContainer">
    <!-- Wave/Liquid Background -->
    <svg class="wave-bg" viewBox="0 0 1200 800" preserveAspectRatio="none">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :style="{ stopColor: waveColor1, stopOpacity: 0.15 }" />
          <stop offset="50%" :style="{ stopColor: waveColor2, stopOpacity: 0.08 }" />
          <stop offset="100%" :style="{ stopColor: waveColor3, stopOpacity: 0.03 }" />
        </linearGradient>
      </defs>

      <!-- Animated waves -->
      <path :d="wave1Path" :style="{ fill: 'url(#waveGradient)', filter: 'url(#blur)' }" />
      <path :d="wave2Path" :style="{ fill: 'url(#waveGradient)', filter: 'url(#blur)' }" />
    </svg>

    <!-- Geometric Elements -->
    <div class="geometric-shapes">
      <div
        v-for="(shape, idx) in geometricShapes"
        :key="idx"
        class="shape"
        :style="{
          left: shape.x + '%',
          top: shape.y + '%',
          width: shape.size + 'px',
          height: shape.size + 'px',
          opacity: shape.opacity,
          '--rotation': shape.rotation + 'deg',
          '--delay': idx * 0.1 + 's'
        }"
        :class="shape.type"
      />
    </div>

    <!-- Mouse Glow Effect -->
    <div class="mouse-glow" :style="mouseGlowStyle" />

    <!-- Animated Particles -->
    <div class="particles">
      <div
        v-for="(particle, idx) in particles"
        :key="idx"
        class="particle"
        :style="{
          left: particle.x + 'px',
          top: particle.y + 'px',
          width: particle.size + 'px',
          height: particle.size + 'px',
          opacity: particle.opacity,
          '--duration': particle.duration + 's',
          '--delay': particle.delay + 's'
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const bgContainer = ref(null);
const mouseX = ref(0);
const mouseY = ref(0);
const time = ref(0);
const waveTime = ref(0);

// Wave colors based on theme
const waveColor1 = computed(() => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return isDark ? '#f2b689' : '#ee9152';
});

const waveColor2 = computed(() => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return isDark ? '#d4b5a0' : '#f2b689';
});

const waveColor3 = computed(() => '#382e28');

// Wave paths with animation
const wave1Path = computed(() => {
  const points = [];
  for (let i = 0; i <= 1200; i += 50) {
    const y = 400 + Math.sin((i / 1200) * Math.PI * 2 + waveTime.value * 0.005) * 40;
    points.push(`${i},${y}`);
  }
  points.push('1200,800');
  points.push('0,800');
  return `M${points.join('L')}Z`;
});

const wave2Path = computed(() => {
  const points = [];
  for (let i = 0; i <= 1200; i += 50) {
    const y = 450 + Math.sin((i / 1200) * Math.PI * 2 + waveTime.value * 0.003 + Math.PI) * 50;
    points.push(`${i},${y}`);
  }
  points.push('1200,800');
  points.push('0,800');
  return `M${points.join('L')}Z`;
});

// Geometric shapes
const geometricShapes = ref([
  { x: 10, y: 15, size: 120, type: 'circle', opacity: 0.05, rotation: 0 },
  { x: 85, y: 70, size: 80, type: 'square', opacity: 0.04, rotation: 45 },
  { x: 50, y: 10, size: 100, type: 'triangle', opacity: 0.03, rotation: 30 },
  { x: 25, y: 60, size: 90, type: 'circle', opacity: 0.04, rotation: 0 },
  { x: 70, y: 30, size: 110, type: 'square', opacity: 0.05, rotation: 20 }
]);

// Mouse glow effect
const mouseGlowStyle = computed(() => ({
  left: mouseX.value + 'px',
  top: mouseY.value + 'px',
  boxShadow: `0 0 80px 40px rgba(238, 145, 82, 0.15), 0 0 120px 60px rgba(242, 182, 137, 0.1)`
}));

// Particles
const particles = ref(generateParticles());

function generateParticles() {
  return Array.from({ length: 20 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 4 + 1,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5
  }));
}

// Mouse move handler
const handleMouseMove = (e) => {
  mouseX.value = e.clientX - 40;
  mouseY.value = e.clientY - 40;
};

// Animation loop
const animate = () => {
  time.value += 1;
  waveTime.value += 1;
  requestAnimationFrame(animate);
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  animate();

  // Regenerate particles on resize
  window.addEventListener('resize', () => {
    particles.value = generateParticles();
  });
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.interactive-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: var(--bg-light);
  transition: background-color 0.5s ease;
}

.wave-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.geometric-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border: 1px solid rgba(238, 145, 82, 0.1);
  animation: float 20s ease-in-out infinite;
  animation-delay: var(--delay);
  transform: rotate(var(--rotation));
}

[data-theme='dark'] .shape {
  border-color: rgba(242, 182, 137, 0.1);
}

.shape.circle {
  border-radius: 50%;
}

.shape.square {
  border-radius: 8px;
}

.shape.triangle {
  border: none;
  width: 0 !important;
  height: 0 !important;
  border-left: calc(var(--size) / 2) solid transparent;
  border-right: calc(var(--size) / 2) solid transparent;
  border-bottom: var(--size) solid rgba(238, 145, 82, 0.08);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(var(--rotation));
  }
  50% {
    transform: translateY(-30px) rotate(calc(var(--rotation) + 10deg));
  }
}

.mouse-glow {
  position: fixed;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  pointer-events: none;
  mix-blend-mode: screen;
  transition: all 0.1s ease-out;
  filter: blur(40px);
}

[data-theme='dark'] .mouse-glow {
  mix-blend-mode: lighten;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(238, 145, 82, 0.8), transparent);
  animation: float-particle var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

[data-theme='dark'] .particle {
  background: radial-gradient(circle, rgba(242, 182, 137, 0.6), transparent);
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(100px) scale(0);
    opacity: 0;
  }
}

/* Custom mouse cursor */
::selection {
  background: rgba(238, 145, 82, 0.3);
}
</style>
