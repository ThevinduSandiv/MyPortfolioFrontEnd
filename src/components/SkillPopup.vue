<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <h2>{{ category.name }}</h2>
      <div class="skills-list">
        <div v-for="skill in category.skills" :key="skill" class="skill-item">
          <span class="skill-icon">▸</span>
          <span class="skill-name">{{ skill }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  category: Object,
  required: true
});
defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
  animation: slideUp 0.3s;
}
[data-theme='dark'] .modal-content { background: #1a1a1a; color: #e0e0e0; }

@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } }

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-content h2 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #382e28;
}
[data-theme='dark'] .modal-content h2 { color: #f0e0d8; }

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(242,182,137,0.1);
  border-radius: 6px;
}

.skill-icon {
  color: #ee9152;
  font-size: 1rem;
}

.skill-name {
  font-weight: 500;
  color: #555;
}
[data-theme='dark'] .skill-name { color: #b0b0b0; }
</style>
