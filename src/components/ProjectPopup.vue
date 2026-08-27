<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <button class="close-btn" @click="$emit('close')">✕</button>
      
      <div class="popup-header">
        <h2 class="popup-title">{{ project.project_title }}</h2>
      </div>

      <div class="popup-body">
        <p class="popup-description">{{ project.project_description }}</p>
        
        <div class="tech-stack">
          <h4>Technologies:</h4>
          <div class="tech-list">
            <span v-for="tech in JSON.parse(project.technologies || '[]')" :key="tech" class="tech-badge">
              {{ tech }}
            </span>
          </div>
        </div>

        <div v-if="project.github_link" class="links-section">
          <a :href="project.github_link" target="_blank" rel="noopener" class="link-btn github">
            🔗 GitHub Repository
          </a>
        </div>

        <div class="points-badge">
          <span class="points-label">Rating:</span>
          <span class="points-value">{{ project.project_points }}/100</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  project: Object
});

defineEmits(['close']);
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.popup-content {
  position: relative;
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

[data-theme='dark'] .popup-content {
  background: #1a1a1a;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #382e28;
  z-index: 10;
  transition: transform 0.2s ease;
}

[data-theme='dark'] .close-btn {
  color: #f0e0d8;
}

.close-btn:hover {
  transform: scale(1.2);
}

.popup-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 2px solid #e8ddd5;
}

[data-theme='dark'] .popup-header {
  border-bottom-color: #333;
}

.popup-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #382e28;
}

[data-theme='dark'] .popup-title {
  color: #f0e0d8;
}

.popup-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.popup-description {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #666;
  margin: 0;
}

[data-theme='dark'] .popup-description {
  color: #aaa;
}

.tech-stack {
  background: #f9e9d9;
  padding: 1rem;
  border-radius: 8px;
}

[data-theme='dark'] .tech-stack {
  background: #242424;
}

.tech-stack h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #382e28;
}

[data-theme='dark'] .tech-stack h4 {
  color: #f0e0d8;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #ee9152;
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.links-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.link-btn {
  padding: 0.75rem 1.5rem;
  background: #ee9152;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.link-btn:hover {
  background: #f2b689;
  transform: translateY(-2px);
}

.points-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  border-radius: 8px;
  color: white;
}

.points-label {
  font-weight: 600;
}

.points-value {
  font-size: 1.2rem;
  font-weight: 700;
}
</style>
