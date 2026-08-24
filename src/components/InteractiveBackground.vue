<template>
  <div class="interactive-bg" ref="bgRef"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const bgRef = ref(null);
let canvas, ctx, animationId;
let particles = [];
let mouse = { x: 0, y: 0 };
let isMoving = false;

const COLORS = {
  light: {
    wave: 'rgba(242, 182, 137, 0.15)',
    particle: 'rgba(238, 145, 82, 0.2)',
    line: 'rgba(238, 145, 82, 0.08)',
  },
  dark: {
    wave: 'rgba(242, 182, 137, 0.1)',
    particle: 'rgba(242, 182, 137, 0.15)',
    line: 'rgba(242, 182, 137, 0.06)',
  },
};

const getThemeColors = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  return COLORS[theme] || COLORS.light;
};

const initCanvas = () => {
  canvas = bgRef.value;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  createParticles();
  animate();
  window.addEventListener('resize', resizeCanvas);
};

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const createParticles = () => {
  const count = Math.min(window.innerWidth / 15, 80);
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }
};

const drawWave = () => {
  const colors = getThemeColors();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw fluid wave based on mouse position
  const waveWidth = 200;
  const waveHeight = 80;
  const amplitude = 60;
  const frequency = 0.01;

  for (let y = 0; y < canvas.height; y += waveHeight) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 10) {
      const offset = Math.sin(x * frequency + y * 0.01 + mouse.x * 0.01) * amplitude;
      ctx.lineTo(x, y + offset);
    }
    ctx.strokeStyle = colors.wave;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw geometric grid with mouse influence
  const gridSize = 80;
  for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
      const distX = Math.abs(x - mouse.x);
      const distY = Math.abs(y - mouse.y);
      const dist = Math.sqrt(distX * distX + distY * distY);
      const influence = Math.max(0, 1 - dist / 400);
      const alpha = influence * 0.3;
      ctx.strokeStyle = `rgba(238, 145, 82, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + gridSize, y + gridSize);
      ctx.moveTo(x + gridSize, y);
      ctx.lineTo(x, y + gridSize);
      ctx.stroke();
    }
  }

  // Draw particles that repel/attract to mouse
  particles.forEach((p) => {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 150) {
      const force = (150 - distance) / 150;
      p.vx += (dx / distance) * force * 0.2;
      p.vy += (dy / distance) * force * 0.2;
    }
    // Limit speed
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 1) {
      p.vx *= 0.95;
      p.vy *= 0.95;
    }
    p.x += p.vx;
    p.y += p.vy;

    // Wrap around edges
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = colors.particle;
    ctx.fill();
  });
};

const animate = () => {
  drawWave();
  animationId = requestAnimationFrame(animate);
};

const handleMouseMove = (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  isMoving = true;
};

onMounted(() => {
  initCanvas();
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.interactive-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
}
</style>