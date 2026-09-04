<template>
  <div ref="bgContainer" class="interactive-bg" :class="{ 'playback-paused': playbackPaused }">
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

  <!-- Kept outside the negative background stacking context so the pointer
       trail remains visible above section surfaces. -->
  <div class="pointer-trail" :class="{ visible: hasPointer && !playbackPaused }" aria-hidden="true">
    <div class="mouse-glow" :style="mouseGlowStyle" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const bgContainer = ref(null);
const mouseX = ref(0);
const mouseY = ref(0);
const hasPointer = ref(false);
const prefersReducedMotion = ref(false);
const waveTime = ref(0);
const playbackPaused = ref(false);
const activePlaybackSources = new Set();

const HALO_RADIUS = 110;

let targetMouseX = 0;
let targetMouseY = 0;
let animationFrameId;
let previousFrameTime = 0;
let motionQuery;

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
  transform: `translate3d(${mouseX.value}px, ${mouseY.value}px, 0)`,
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

// Pointer tracking
const handlePointerMove = (event) => {
  if (event.pointerType === 'touch') return;

  targetMouseX = event.clientX - HALO_RADIUS;
  targetMouseY = event.clientY - HALO_RADIUS;

  // Place the glow at the pointer immediately when it first appears. Smoothing
  // only applies to subsequent movement, so it never travels from the corner.
  if (!hasPointer.value) {
    mouseX.value = targetMouseX;
    mouseY.value = targetMouseY;
    hasPointer.value = true;
  }
};

const handlePointerOut = (event) => {
  if (!event.relatedTarget) hasPointer.value = false;
};

const handleResize = () => {
  particles.value = generateParticles();
};

const handleMotionPreference = (event) => {
  prefersReducedMotion.value = event.matches;
};

const handleMediaPlayback = (event) => {
  const source = event.detail?.source || 'legacy-media-player';

  if (event.detail?.reset) {
    activePlaybackSources.clear();
  } else if (event.detail?.active) {
    activePlaybackSources.add(source);
  } else {
    activePlaybackSources.delete(source);
  }

  const wasPaused = playbackPaused.value;
  playbackPaused.value = activePlaybackSources.size > 0;

  // The glow is intentionally hidden during playback. When playback stops,
  // restore it at the current pointer instead of letting it trail in from its
  // pre-video position.
  if (wasPaused && !playbackPaused.value && hasPointer.value) {
    mouseX.value = targetMouseX;
    mouseY.value = targetMouseY;
  }
};

// Animation loop
const animate = (frameTime) => {
  const elapsed = previousFrameTime
    ? Math.min(frameTime - previousFrameTime, 50)
    : 16;
  previousFrameTime = frameTime;

  if (!playbackPaused.value) {
    waveTime.value += 1;
  }

  if (hasPointer.value && !playbackPaused.value) {
    // This produces a subtle trail with consistent timing across refresh rates.
    const smoothing = prefersReducedMotion.value
      ? 1
      : 1 - Math.exp(-elapsed / 35);
    mouseX.value += (targetMouseX - mouseX.value) * smoothing;
    mouseY.value += (targetMouseY - mouseY.value) * smoothing;
  }

  animationFrameId = requestAnimationFrame(animate);
};

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion.value = motionQuery.matches;
  motionQuery.addEventListener?.('change', handleMotionPreference);

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerout', handlePointerOut, { passive: true });
  window.addEventListener('resize', handleResize);
  window.addEventListener('portfolio-media-playback', handleMediaPlayback);
  animationFrameId = requestAnimationFrame(animate);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  motionQuery?.removeEventListener?.('change', handleMotionPreference);
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerout', handlePointerOut);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('portfolio-media-playback', handleMediaPlayback);
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

.interactive-bg.playback-paused .shape,
.interactive-bg.playback-paused .particle {
  animation-play-state: paused;
}

.wave-bg {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.geometric-shapes {
  position: absolute;
  z-index: 1;
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

.pointer-trail {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.mouse-glow {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  will-change: transform, opacity;
}

.mouse-glow {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(238, 145, 82, 0.42) 0%,
    rgba(242, 182, 137, 0.24) 26%,
    rgba(238, 145, 82, 0.12) 48%,
    transparent 72%
  );
  filter: blur(8px);
  transition: opacity 0.16s ease-out;
}

.pointer-trail.visible .mouse-glow {
  opacity: 1;
}

[data-theme='dark'] .mouse-glow {
  background: radial-gradient(
    circle,
    rgba(242, 182, 137, 0.46) 0%,
    rgba(238, 145, 82, 0.27) 26%,
    rgba(242, 182, 137, 0.13) 48%,
    transparent 72%
  );
}

@media (hover: none), (pointer: coarse) {
  .pointer-trail {
    display: none;
  }
}

.particles {
  position: absolute;
  z-index: 2;
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
