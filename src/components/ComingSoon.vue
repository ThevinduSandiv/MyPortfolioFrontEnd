<!-- AI-Generated Content-->


<script setup lang="ts">
// No TypeScript logic needed for animations
const emit = defineEmits(['pageSelected']);
</script>

<template>
  <div class="coming-soon-container">
    <!-- Animated Background Elements -->
<!--    <div class="floating-shapes">-->
<!--      <div class="shape shape-1">☕</div>-->
<!--      <div class="shape shape-2">📝</div>-->
<!--      <div class="shape shape-3">✏️</div>-->
<!--      <div class="shape shape-4">📚</div>-->
<!--      <div class="shape shape-5">🎨</div>-->
<!--      <div class="shape shape-6">💼</div>-->
<!--    </div>-->

    <!-- Main Content -->
    <div class="content">
      <div class="main-title">
        <h1 class="title-text">Coming Soon</h1>
        <div class="animated-underline"></div>
      </div>

      <p class="subtitle">Crafting something beautiful for you</p>

<!--      &lt;!&ndash; Animated Writing Clipart &ndash;&gt;-->
<!--      <div class="writing-animation">-->
<!--        <div class="flex flex-col desk">-->
<!--          <div class="flex flex-row">-->
<!--            <div class="laptop">💻</div>-->
<!--            <div class="coffee">☕</div>-->
<!--            <div class="pen">✏️</div><div class="writer">👨‍💻</div>-->
<!--          </div>-->
<!--          <div class="desk-surface"></div>-->
<!--        </div>-->

<!--      </div>-->

      <!-- Progress Animation -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <p class="progress-text">Working diligently on the next masterpiece...</p>
      </div>

      <!-- Floating Icons -->
      <div class="floating-icons">
        <span class="icon">📱</span>
        <span class="icon">💻</span>
        <span class="icon">🎨</span>
        <span class="icon">🚀</span>
      </div>
    </div>

    <!-- Bottom Animation -->
    <div class="bottom-animation">
      <div class="moving-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coming-soon-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fefaf5 0%, #fcf5eb 100%);
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

/* Floating Shapes */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.shape {
  position: absolute;
  font-size: 2rem;
  animation: float 6s ease-in-out infinite;
  color: var(--heading-color);
}

.shape-1 { top: 10%; left: 10%; animation-delay: 0s; }
.shape-2 { top: 20%; right: 15%; animation-delay: 1s; }
.shape-3 { bottom: 30%; left: 20%; animation-delay: 2s; }
.shape-4 { top: 40%; right: 25%; animation-delay: 3s; }
.shape-5 { bottom: 20%; right: 15%; animation-delay: 4s; }
.shape-6 { top: 60%; left: 30%; animation-delay: 5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

/* Main Content */
.content {
  text-align: center;
  z-index: 10;
  position: relative;
}

.main-title {
  margin-bottom: 2rem;
}

.title-text {
  font-size: 4rem;
  font-weight: bold;
  color: var(--heading-color);
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(56, 46, 40, 0.1);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animated-underline {
  width: 200px;
  height: 4px;
  background: linear-gradient(90deg, #8B7355, #A52A2A, #D2691E, #8B4513);
  margin: 0 auto;
  border-radius: 2px;
  animation: slide 3s ease-in-out infinite;
}

@keyframes slide {
  0%, 100% { transform: scaleX(0.8); }
  50% { transform: scaleX(1.2); }
}

.subtitle {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 3rem;
  animation: fadeInOut 3s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Writing Animation */
.writing-animation {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2rem;
  margin: 3rem 0;
  height: 120px;
}

.desk {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.desk-surface {
  width: 200px;
  height: 8px;
  background: var(--heading-color);
  border-radius: 4px;
}

.laptop {
  font-size: 2.5rem;
  animation: laptopGlow 3s ease-in-out infinite;
}

.coffee {
  font-size: 1.8rem;
  animation: coffeeSteam 4s ease-in-out infinite;
}

.pen {
  font-size: 1.5rem;
  animation: penWrite 2s ease-in-out infinite;
}

.writer {
  font-size: 3rem;
  animation: writerType 1.5s ease-in-out infinite;
}

@keyframes laptopGlow {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-5px) scale(1.1); }
}

@keyframes coffeeSteam {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-3px) rotate(-5deg); }
  75% { transform: translateY(-2px) rotate(5deg); }
}

@keyframes penWrite {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

@keyframes writerType {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

/* Progress Animation */
.progress-container {
  max-width: 400px;
  margin: 2rem auto;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(139, 115, 85, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B7355, #A52A2A);
  border-radius: 4px;
  animation: progressLoad 3s ease-in-out infinite;
}

@keyframes progressLoad {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

.progress-text {
  color: var(--text-color);
  font-size: 0.9rem;
}

/* Floating Icons */
.floating-icons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.icon {
  font-size: 2rem;
  color: var(--heading-color);
  animation: bounce 2s ease-in-out infinite;
}

.icon:nth-child(1) { animation-delay: 0s; }
.icon:nth-child(2) { animation-delay: 0.5s; }
.icon:nth-child(3) { animation-delay: 1s; }
.icon:nth-child(4) { animation-delay: 1.5s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

/* Bottom Animation */
.bottom-animation {
  position: absolute;
  bottom: 20px;
  width: 100%;
}

.moving-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--heading-color);
  border-radius: 50%;
  animation: dotMove 2s ease-in-out infinite;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
.dot:nth-child(4) { animation-delay: 0.6s; }
.dot:nth-child(5) { animation-delay: 0.8s; }

@keyframes dotMove {
  0%, 100% { transform: translateY(0px); opacity: 0.3; }
  50% { transform: translateY(-10px); opacity: 1; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .title-text {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .writing-animation {
    gap: 1rem;
  }

  .desk-surface {
    width: 150px;
  }

  .laptop, .writer {
    font-size: 2rem;
  }
}
</style>