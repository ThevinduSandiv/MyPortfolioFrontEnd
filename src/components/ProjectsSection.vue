<template>
  <section class="projects-section">
    <h1 class="section-title">All Projects</h1>

    <!-- Search, Filter, Sort -->
    <div class="controls-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search by title or language..."
      />
      <select v-model="selectedFilter" class="filter-select">
        <option value="">All Technologies</option>
        <option v-for="tech in allTechs" :key="tech" :value="tech">{{ tech }}</option>
      </select>
      <select v-model="sortBy" class="sort-select">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="alpha">Alphabetical</option>
      </select>
    </div>

    <!-- Loading / Error / Empty -->
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadProjects" class="retry-btn">Try Again</button>
    </div>
    <div v-else-if="filteredProjects.length > 0" class="projects-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
        @click="selectProject(project)"
      >
        <h3>{{ project.name }}</h3>
        <p class="description">{{ project.description.substring(0, 100) }}...</p>
        <div class="tech-stack">
          <span v-for="tech in project.technologies.slice(0, 3)" :key="tech" class="tech">{{ tech }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No projects found matching your criteria</p>
    </div>

    <!-- Project Popup -->
    <transition name="modal">
      <ProjectPopup
        v-if="selectedProjectData"
        :project="selectedProjectData"
        @close="selectedProjectData = null"
      />
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ProjectPopup from './ProjectPopup.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import api from '@/services/api';

const allProjects = ref([]);
const loading = ref(true);
const error = ref('');

const searchQuery = ref('');
const selectedFilter = ref('');
const sortBy = ref('newest');
const selectedProjectData = ref(null);

const allTechs = computed(() => {
  const techs = new Set();
  allProjects.value.forEach(p => p.technologies.forEach(t => techs.add(t)));
  return Array.from(techs).sort();
});

const filteredProjects = computed(() => {
  let filtered = allProjects.value;

  if (searchQuery.value) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (selectedFilter.value) {
    filtered = filtered.filter(p => p.technologies.includes(selectedFilter.value));
  }

  if (sortBy.value === 'alpha') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return filtered;
});

const loadProjects = async () => {
  loading.value = true;
  error.value = '';
  try {
    allProjects.value = await api.getProjects();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const selectProject = (project) => {
  selectedProjectData.value = project;
  document.body.style.overflow = 'hidden';
};

onMounted(() => {
  loadProjects();
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