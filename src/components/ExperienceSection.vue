<template>
  <section class="experience-section">
    <h1 class="section-title">Experience</h1>

    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadExperience" class="retry-btn">Try Again</button>
    </div>
    <div v-else class="timeline">
      <div v-for="exp in experiences" :key="exp.id" class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="exp-header">
            <h3 class="exp-role">{{ exp.role }}</h3>
            <span class="exp-period">{{ formatDate(exp.startDate) }} - {{ exp.endDate ? formatDate(exp.endDate) : 'Present' }}</span>
          </div>
          <p class="exp-company">{{ exp.company }}</p>
          <p class="exp-description">{{ exp.description }}</p>
          <div v-if="exp.highlights" class="highlights">
            <ul>
              <li v-for="(highlight, idx) in exp.highlights" :key="idx">{{ highlight }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import api from '@/services/api';

const experiences = ref([]);
const loading = ref(true);
const error = ref('');

const loadExperience = async () => {
  loading.value = true;
  error.value = '';
  try {
    experiences.value = await api.getExperience();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

onMounted(() => {
  loadExperience();
});
</script>

<style scoped>
/* same styles + loading/error */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
}

.retry-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 1rem;
  cursor: pointer;
}
</style>