<template>
  <section class="projects-section">
    <h1 class="section-title">Projects</h1>

    <div class="filter-controls">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search projects..."
        class="search-input"
        @input="handleSearch"
      />
      <select v-model="selectedTech" class="filter-select" @change="handleFilter">
        <option value="">All Technologies</option>
        <option v-for="tech in allTechs" :key="tech" :value="tech">
          {{ tech }}
        </option>
      </select>
      <select v-model="sortOrder" class="filter-select" @change="handleSort">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="alpha">A - Z</option>
      </select>
    </div>

    <div v-if="projectsLoading" class="loading-container">
      <LoadingSpinner text="Loading projects..." />
    </div>

    <div v-else-if="projectsError" class="error-state">
      <p>{{ projectsError }}</p>
      <button @click="fetchProjects" class="retry-small">Retry</button>
    </div>

    <div v-else-if="paginatedProjects.length > 0" class="projects-grid">
      <div
        v-for="project in paginatedProjects"
        :key="project.project_id"
        class="project-card"
        @click="selectProject(project)"
      >
        <div class="card-content">
          <h3 class="project-title">{{ project.project_title }}</h3>
          <p class="project-description">{{ project.project_description }}</p>
          <div class="tech-stack">
            <span
              v-for="tech in JSON.parse(project.technologies || '[]').slice(0, 3)"
              :key="tech"
              class="tech-tag"
            >
              {{ tech }}
            </span>
            <span
              v-if="JSON.parse(project.technologies || '[]').length > 3"
              class="tech-tag more"
            >
              +{{ JSON.parse(project.technologies || '[]').length - 3 }}
            </span>
          </div>
        </div>
        <div class="card-hover-effect"></div>
      </div>
    </div>

    <div
      v-else-if="!projectsLoading && !projectsError && displayedProjects.length === 0"
      class="empty-state"
    >
      <p>No projects found matching your criteria</p>
    </div>

    <div v-else-if="!projectsLoading && !projectsError && projects.length === 0" class="no-data">
      <p>No projects available</p>
    </div>

    <div v-if="!projectsLoading && !projectsError && totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        class="pagination-btn"
        @click="goToPage(currentPage - 1)"
      >
        ← Previous
      </button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        @click="goToPage(currentPage + 1)"
      >
        Next →
      </button>
    </div>

    <ProjectPopup
      v-if="selectedProjectData"
      :project="selectedProjectData"
      @close="selectedProjectData = null"
    />
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { api } from '@/services/api';
import ProjectPopup from './ProjectPopup.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  toastRef: Object,
});

const projects = ref([]);
const projectsLoading = ref(true);
const projectsError = ref(null);

const searchQuery = ref('');
const selectedTech = ref('');
const sortOrder = ref('newest');
const currentPage = ref(1);
const pageSize = 10;

const selectedProjectData = ref(null);

const allTechs = computed(() => {
  const techs = new Set();
  projects.value.forEach((project) => {
    try {
      const projTechs = JSON.parse(project.technologies || '[]');
      projTechs.forEach((t) => techs.add(t));
    } catch (_) {}
  });
  return Array.from(techs).sort();
});

const displayedProjects = computed(() => {
  let filtered = projects.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.project_title.toLowerCase().includes(q) ||
        p.project_description.toLowerCase().includes(q)
    );
  }

  if (selectedTech.value) {
    filtered = filtered.filter((p) => {
      try {
        const techs = JSON.parse(p.technologies || '[]');
        return techs.includes(selectedTech.value);
      } catch (_) {
        return false;
      }
    });
  }

  const sorted = [...filtered];
  switch (sortOrder.value) {
    case 'oldest':
      sorted.sort((a, b) => new Date(a.creation_ts) - new Date(b.creation_ts));
      break;
    case 'alpha':
      sorted.sort((a, b) => a.project_title.localeCompare(b.project_title));
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => new Date(b.creation_ts) - new Date(a.creation_ts));
      break;
  }
  return sorted;
});

const totalPages = computed(() => Math.ceil(displayedProjects.value.length / pageSize));
const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return displayedProjects.value.slice(start, start + pageSize);
});

const resetPagination = () => {
  currentPage.value = 1;
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const selectProject = (project) => {
  selectedProjectData.value = project;
};

watch([searchQuery, selectedTech, sortOrder], resetPagination);

const handleSearch = () => {};
const handleFilter = () => {};
const handleSort = () => {};

const fetchProjects = async () => {
  try {
    projectsLoading.value = true;
    projectsError.value = null;
    const data = await api.getProjects({
      sort: sortOrder.value,
      page: 1,
      pageSize: 100,
    });
    projects.value = data.projects || [];
  } catch (err) {
    projectsError.value = err.message || 'Failed to load projects';
    if (props.toastRef?.addToast) {
      props.toastRef.addToast(projectsError.value, 'error', 'Failed to load projects');
    }
  } finally {
    projectsLoading.value = false;
  }
};

onMounted(fetchProjects);
</script>

<style scoped>
.projects-section {
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
.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.search-input,
.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #d4ccc4;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
  color: #382e28;
}
[data-theme='dark'] .search-input,
[data-theme='dark'] .filter-select {
  background: #1a1a1a;
  border-color: #333;
  color: #f0e0d8;
}
.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #ee9152;
  box-shadow: 0 0 0 3px rgba(238, 145, 82, 0.1);
}
.search-input {
  flex: 1;
  min-width: 200px;
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.project-card {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
  border: 1px solid #e8ddd5;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}
[data-theme='dark'] .project-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border-color: #333;
}
.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  border-color: #f2b689;
}
[data-theme='dark'] .project-card:hover {
  box-shadow: 0 16px 40px rgba(242, 182, 137, 0.2);
}
.card-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.05) 0%, rgba(238, 145, 82, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.project-card:hover .card-hover-effect {
  opacity: 1;
}
.card-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.project-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #382e28;
}
[data-theme='dark'] .project-title {
  color: #f0e0d8;
}
.project-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
[data-theme='dark'] .project-description {
  color: #aaa;
}
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}
.tech-tag {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  background: rgba(238, 145, 82, 0.15);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #ee9152;
}
[data-theme='dark'] .tech-tag {
  background: rgba(242, 182, 137, 0.2);
  color: #f2b689;
}
.tech-tag.more {
  background: #ee9152;
  color: white;
}
[data-theme='dark'] .tech-tag.more {
  background: #f2b689;
  color: #1a1a1a;
}
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
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
[data-theme='dark'] .error-state {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}
.error-state p {
  margin: 0;
  flex: 1;
}
.retry-small {
  padding: 0.4rem 1.2rem;
  background: #ee9152;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.retry-small:hover {
  background: #d47d44;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 145, 82, 0.3);
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
.no-data {
  padding: 2rem;
  text-align: center;
  color: #aaa;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px dashed #ddd;
}
[data-theme='dark'] .no-data {
  color: #666;
  background: rgba(255, 255, 255, 0.02);
  border-color: #333;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(242, 182, 137, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(242, 182, 137, 0.2);
}
[data-theme='dark'] .pagination {
  background: rgba(242, 182, 137, 0.05);
  border-color: rgba(242, 182, 137, 0.1);
}
.pagination-btn {
  padding: 0.6rem 1.2rem;
  background: #f2b689;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.pagination-btn:hover:not(:disabled) {
  background: #ee9152;
  transform: translateY(-2px);
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-info {
  font-weight: 600;
  color: #382e28;
}
[data-theme='dark'] .page-info {
  color: #f0e0d8;
}
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
  }
  .search-input,
  .filter-select {
    width: 100%;
  }
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>