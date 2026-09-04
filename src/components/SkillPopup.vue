<template>
  <Teleport to="body">
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <button class="close-btn" @click="$emit('close')">✕</button>
      
      <div class="popup-header">
        <h2 class="popup-title">{{ category.name }}</h2>
      </div>

      <div class="popup-body">
        <div class="skills-list">
          <div v-for="skill in category.skills" :key="skill.skill_id" class="skill-item">
            <div class="skill-info">
              <h4 class="skill-name">{{ skill.skill_title }}</h4>
              <p class="skill-description">{{ skill.skill_description }}</p>
            </div>
            <div v-if="skill.yearsOfExperience" class="skill-metrics">
              <span class="years">
                {{ skill.yearsOfExperience }} yrs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
defineProps({
  category: Object
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
  max-width: 550px;
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
  background: linear-gradient(135deg, rgba(238, 145, 82, 0.1) 0%, rgba(242, 182, 137, 0.05) 100%);
}

[data-theme='dark'] .popup-header {
  border-bottom-color: #333;
  background: linear-gradient(135deg, rgba(238, 145, 82, 0.05) 0%, rgba(242, 182, 137, 0.02) 100%);
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
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-item {
  padding: 1rem;
  background: #f9e9d9;
  border-radius: 8px;
  border-left: 4px solid #ee9152;
}

[data-theme='dark'] .skill-item {
  background: #242424;
  border-left-color: #f2b689;
}

.skill-info {
  margin-bottom: 0.75rem;
}

.skill-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
  color: #382e28;
}

[data-theme='dark'] .skill-name {
  color: #f0e0d8;
}

.skill-description {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #666;
  margin: 0;
}

[data-theme='dark'] .skill-description {
  color: #aaa;
}

.skill-metrics {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.years {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8b7355;
  white-space: nowrap;
}

[data-theme='dark'] .years {
  color: #d4b5a0;
}
</style>
