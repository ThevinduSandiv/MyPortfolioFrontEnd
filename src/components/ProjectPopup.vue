<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">✕</button>

      <div class="modal-header">
        <h2>{{ project.name }}</h2>
      </div>

      <!-- Images/Videos Carousel -->
      <div v-if="project.images && project.images.length > 0" class="media-carousel">
        <div class="media-container">
          <img v-if="currentMediaIndex < project.images.length"
               :src="project.images[currentMediaIndex]"
               :alt="project.name"
               class="media-item"
          />
        </div>
        <div v-if="project.images.length > 1" class="carousel-controls">
          <button @click="previousMedia" class="nav-btn">←</button>
          <span class="media-counter">{{ currentMediaIndex + 1 }} / {{ project.images.length }}</span>
          <button @click="nextMedia" class="nav-btn">→</button>
        </div>
      </div>
      <div v-else class="media-placeholder">
        📸 No images available
      </div>

      <!-- Project Details -->
      <div class="modal-body">
        <div class="section">
          <h3>Description</h3>
          <p>{{ project.description }}</p>
        </div>

        <div class="section">
          <h3>Technologies Used</h3>
          <div class="tech-list">
            <span v-for="tech in project.technologies" :key="tech" class="tech-badge">
              {{ tech }}
            </span>
          </div>
        </div>

        <div v-if="project.links && project.links.length > 0" class="section">
          <h3>Links</h3>
          <div class="links-list">
            <a v-for="link in project.links" :key="link.url"
               :href="link.url"
               target="_blank"
               class="link-btn">
              {{ link.label }} →
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  project: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

const currentMediaIndex = ref(0);

const nextMedia = () => {
  if (currentMediaIndex.value < currentMediaIndex.value.length - 1) {
    currentMediaIndex.value++;
  }
};

const previousMedia = () => {
  if (currentMediaIndex.value > 0) {
    currentMediaIndex.value--;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
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

.modal-content {
  background: var(--bg-modal, white);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
}

[data-theme='dark'] .modal-content {
  --bg-modal: #1a1a1a;
  color: #e0e0e0;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #8b7355;
  z-index: 101;
  transition: all 0.2s ease;
}

[data-theme='dark'] .modal-close {
  color: #d4b5a0;
}

.modal-close:hover {
  transform: scale(1.2) rotate(90deg);
}

.modal-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(242, 182, 137, 0.2);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #382e28;
}

[data-theme='dark'] .modal-header h2 {
  color: #f0e0d8;
}

.media-carousel {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.05), transparent);
}

.media-container {
  width: 100%;
  height: 300px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
}

[data-theme='dark'] .media-container {
  background: #242424;
}

.media-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.media-item:hover {
  transform: scale(1.05);
}

.media-placeholder {
  text-align: center;
  color: #8b7355;
  font-size: 2rem;
  padding: 2rem;
}

[data-theme='dark'] .media-placeholder {
  color: #a08070;
}

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.nav-btn {
  background: #f2b689;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #ee9152;
  transform: translateY(-2px);
}

.media-counter {
  font-size: 0.9rem;
  color: #8b7355;
  min-width: 80px;
  text-align: center;
}

[data-theme='dark'] .media-counter {
  color: #a08070;
}

.modal-body {
  padding: 2rem;
}

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #382e28;
}

[data-theme='dark'] .section h3 {
  color: #f0e0d8;
}

.section p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

[data-theme='dark'] .section p {
  color: #b0b0b0;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: rgba(238, 145, 82, 0.2);
  border: 1px solid #ee9152;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #ee9152;
}

[data-theme='dark'] .tech-badge {
  background: rgba(242, 182, 137, 0.15);
  border-color: #f2b689;
  color: #f2b689;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-btn {
  display: inline-block;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
}

.link-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(238, 145, 82, 0.3);
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 95vw;
  }

  .modal-header,
  .modal-body {
    padding: 1.5rem 1rem;
  }

  .media-container {
    height: 200px;
  }
}
</style>
