<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <div class="cert-header">
        <span class="icon">🏆</span>
        <h2>{{ cert.name }}</h2>
      </div>
      <p class="issuer">{{ cert.issuer }}</p>
      <p class="date">{{ cert.date }}</p>
      <p class="desc">{{ cert.description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cert: Object,
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
@keyframes fadeIn { from { opacity: 0; } }

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
}
[data-theme='dark'] .modal-content { background: #1a1a1a; color: #e0e0e0; }

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.cert-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.icon { font-size: 2.5rem; }

.cert-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #382e28;
}
[data-theme='dark'] .cert-header h2 { color: #f0e0d8; }

.issuer {
  font-weight: 600;
  color: #ee9152;
  margin: 0 0 0.5rem;
}

.date {
  font-size: 0.9rem;
  color: #8b7355;
  margin: 0 0 1rem;
}
[data-theme='dark'] .date { color: #a08070; }

.desc {
  color: #555;
  line-height: 1.6;
  margin: 0;
}
[data-theme='dark'] .desc { color: #b0b0b0; }
</style>
