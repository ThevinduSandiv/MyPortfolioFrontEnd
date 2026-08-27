<template>
  <section class="experience-section">
    <h1 class="section-title">Experience</h1>

    <div v-if="experienceLoading" class="loading-container">
      <LoadingSpinner text="Loading experience..." />
    </div>

    <div v-else-if="experienceError" class="error-state">
      <p>{{ experienceError }}</p>
    </div>

    <div v-else-if="experience.length > 0" class="experience-timeline">
      <div
        v-for="(exp, idx) in experience"
        :key="exp.exp_id"
        class="experience-item"
        :class="{ 'current': exp.isCurrent }"
      >
        <div class="timeline-marker">
          <div v-if="exp.isCurrent" class="current-badge">Current</div>
        </div>
        <div class="experience-content">
          <div class="experience-header">
            <h3 class="exp-title">{{ exp.exp_title }}</h3>
            <span v-if="exp.isCurrent" class="current-indicator">🔴 Active</span>
          </div>
          <p class="exp-date">{{ formatDate(exp.start_ts) }} - {{ formatDate(exp.end_ts, exp.isCurrent) }}</p>
          <p class="exp-description">{{ exp.exp_description }}</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No experience entries yet</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  toastRef: Object
});

const experience = ref([]);
const experienceLoading = ref(true);
const experienceError = ref(null);

const formatDate = (dateString, isCurrent = false) => {
  if (!dateString || isCurrent) return 'Present';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

const fetchExperience = async () => {
  try {
    experienceLoading.value = true;
    const data = await api.getExperience('newest');
    experience.value = data.experience || [];
    experienceError.value = null;
  } catch (error) {
    experienceError.value = error.message;
    props.toastRef?.addToast(error.message, 'error', 'Failed to load experience');
  } finally {
    experienceLoading.value = false;
  }
};

onMounted(() => {
  fetchExperience();
});
</script>

<style scoped>
.experience-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #382e28;
}

[data-theme='dark'] .section-title {
  color: #f0e0d8;
}

/* Experience Timeline */
.experience-timeline {
  position: relative;
  padding-left: 2rem;
}

.experience-timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #ee9152 0%, rgba(238, 145, 82, 0.3) 50%, transparent 100%);
}

.experience-item {
  position: relative;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e8ddd5;
  transition: all 0.3s ease;
}

[data-theme='dark'] .experience-item {
  border-bottom-color: #333;
}

.experience-item:last-child {
  border-bottom: none;
}

.experience-item.current {
  background: linear-gradient(135deg, rgba(238, 145, 82, 0.05) 0%, rgba(242, 182, 137, 0.02) 100%);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(238, 145, 82, 0.15);
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  padding-left: 3.5rem;
}

[data-theme='dark'] .experience-item.current {
  background: linear-gradient(135deg, rgba(238, 145, 82, 0.03) 0%, rgba(242, 182, 137, 0.01) 100%);
  border-color: rgba(238, 145, 82, 0.1);
}

.timeline-marker {
  position: absolute;
  left: -10px;
  top: 6px;
  width: 18px;
  height: 18px;
  background: #f2b689;
  border: 3px solid white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

[data-theme='dark'] .timeline-marker {
  border-color: #0f0f0f;
}

.experience-item:hover .timeline-marker {
  transform: scale(1.3);
  background: #ee9152;
}

.experience-item.current .timeline-marker {
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
}

.current-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
}

.experience-item.current .current-badge {
  opacity: 1;
}

.experience-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.exp-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: #382e28;
}

[data-theme='dark'] .exp-title {
  color: #f0e0d8;
}

.current-indicator {
  font-size: 0.8rem;
  font-weight: 600;
  color: #10b981;
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.exp-date {
  font-size: 0.9rem;
  color: #8b7355;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
}

[data-theme='dark'] .exp-date {
  color: #d4b5a0;
}

.exp-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #666;
  margin: 0;
}

[data-theme='dark'] .exp-description {
  color: #aaa;
}

/* Loading & Error States */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.error-state {
  padding: 2rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  color: #dc2626;
}

[data-theme='dark'] .error-state {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #8b7355;
  font-size: 1.1rem;
}

[data-theme='dark'] .empty-state {
  color: #a08070;
}

/* Responsive */
@media (max-width: 768px) {
  .experience-item.current {
    margin-left: -1rem;
    margin-right: -1rem;
    padding: 1rem;
    padding-left: 2rem;
  }

  .exp-title {
    font-size: 1.1rem;
  }

  .exp-description {
    font-size: 0.9rem;
  }
}
</style>
