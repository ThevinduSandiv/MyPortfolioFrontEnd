<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <button class="close-btn" @click="$emit('close')">✕</button>
      
      <div class="popup-header">
        <h2 class="popup-title">{{ achievement.achievement_title }}</h2>
        <p class="achievement-date">{{ formatDate(achievement.earned_ts) }}</p>
      </div>

      <div class="popup-body">
        <p class="achievement-description">{{ achievement.achievement_description }}</p>
        
        <div class="points-badge">
          <span class="points-value">{{ achievement.achievement_points }} pts</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  achievement: Object
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
  max-width: 450px;
  width: 90%;
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
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
}

[data-theme='dark'] .popup-header {
  border-bottom-color: #333;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.popup-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #382e28;
}

[data-theme='dark'] .popup-title {
  color: #f0e0d8;
}

.achievement-date {
  font-size: 0.9rem;
  color: #8b7355;
  margin: 0;
}

[data-theme='dark'] .achievement-date {
  color: #d4b5a0;
}

.popup-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.achievement-description {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #666;
  margin: 0;
}

[data-theme='dark'] .achievement-description {
  color: #aaa;
}

.points-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 8px;
  color: white;
}

.points-value {
  font-size: 1.3rem;
  font-weight: 700;
}
</style>
