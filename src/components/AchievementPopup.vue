<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">✕</button>

      <div class="modal-header">
        <h2>{{ achievement.title }}</h2>
        <p class="date">{{ formatDate(achievement.date) }}</p>
      </div>

      <div class="modal-body">
        <p class="description">{{ achievement.description }}</p>

        <div v-if="achievement.details" class="details-section">
          <h3>Details</h3>
          <p>{{ achievement.details }}</p>
        </div>

        <div v-if="achievement.images && achievement.images.length > 0" class="media-section">
          <h3>Media</h3>
          <div class="media-carousel">
            <img v-for="(img, idx) in achievement.images"
                 :key="idx"
                 :src="img"
                 :alt="`Achievement ${idx + 1}`"
                 class="media-item"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  achievement: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
}

[data-theme='dark'] .modal-content {
  background: #1a1a1a;
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
  padding: 2rem;
  border-bottom: 1px solid rgba(242, 182, 137, 0.2);
}

.modal-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #382e28;
}

[data-theme='dark'] .modal-header h2 {
  color: #f0e0d8;
}

.date {
  margin: 0;
  font-size: 0.95rem;
  color: #8b7355;
  font-weight: 500;
}

[data-theme='dark'] .date {
  color: #a08070;
}

.modal-body {
  padding: 2rem;
}

.description {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #555;
  margin: 0 0 1.5rem 0;
}

[data-theme='dark'] .description {
  color: #b0b0b0;
}

.details-section,
.media-section {
  margin-top: 1.5rem;
}

.details-section h3,
.media-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #382e28;
}

[data-theme='dark'] .details-section h3,
[data-theme='dark'] .media-section h3 {
  color: #f0e0d8;
}

.details-section p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

[data-theme='dark'] .details-section p {
  color: #b0b0b0;
}

.media-carousel {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.media-item {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.media-item:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 95vw;
  }

  .modal-header,
  .modal-body {
    padding: 1.5rem 1rem;
  }

  .modal-header h2 {
    font-size: 1.4rem;
  }
}
</style>
