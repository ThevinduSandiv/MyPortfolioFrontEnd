<template>
  <section class="projects-section">
    <h1 class="section-title">Projects</h1>

    <!-- Search & Filter -->
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

    <!-- Loading State -->
    <div v-if="projectsLoading" class="loading-container">
      <LoadingSpinner text="Loading projects..." />
    </div>

    <!-- Error State -->
    <div v-else-if="projectsError" class="error-state">
      <p>{{ projectsError }}</p>
    </div>

    <!-- Projects Grid -->
    <div v-else class="projects-grid">
      <div
        v-for="project in displayedProjects"
        :key="project.project_id"
        class="project-card"
        @click="selectProject(project)"
      >
        <div class="card-content">
          <h3 class="project-title">{{ project.project_title }}</h3>
          <p class="project-description">{{ project.project_description }}</p>
          <div class="tech-stack">
            <span v-for="tech in JSON.parse(project.technologies || '[]').slice(0, 3)" :key="tech" class="tech-tag">
              {{ tech }}
            </span>
          </div>
        </div>
        <div class="card-footer">
          <span class="points">{{ project.project_points }} pts</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!projectsLoading && displayedProjects.length === 0" class="empty-state">
      <p>No projects found matching your criteria</p>
    </div>

    <!-- Pagination -->
    <div v-if="!projectsLoading && totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        class="pagination-btn"
        @click="currentPage--"
      >
        ← Previous
      </button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        @click="currentPage++"
      >
        Next →
      </button>
    </div>

    <!-- Project Detail Popup -->
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
import { api } from '@/services/api';
import ProjectPopup from './ProjectPopup.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  toastRef: Object
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
  projects.value.forEach(project => {
    const projTechs = JSON.parse(project.technologies || '[]');
    projTechs.forEach(tech => techs.add(tech));
  });
  return Array.from(techs).sort();
});

const displayedProjects = computed(() => {
  let filtered = projects.value;

  if (searchQuery.value) {
    filtered = filtered.filter(p =>
      p.project_title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.project_description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (selectedTech.value) {
    filtered = filtered.filter(p =>
      JSON.parse(p.technologies || '[]').includes(selectedTech.value)
    );
  }

  return filtered;
});

const totalPages = computed(() => Math.ceil(displayedProjects.value.length / pageSize));

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return displayedProjects.value.slice(start, start + pageSize);
});

const selectProject = (project) => {
  selectedProjectData.value = project;
  document.body.style.overflow = 'hidden';
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleFilter = () => {
  currentPage.value = 1;
};

const handleSort = () => {
  currentPage.value = 1;
};

const fetchProjects = async () => {
  try {
    projectsLoading.value = true;
    const data = await api.getProjects({
      sort: sortOrder.value,
      page: 1,
      pageSize: 100
    });
    projects.value = data.projects || [];
    projectsError.value = null;
  } catch (error) {
    projectsError.value = error.message;
    props.toastRef?.addToast(error.message, 'error', 'Failed to load projects');
  } finally {
    projectsLoading.value = false;
  }
};

onMounted(() => {
  fetchProjects();
});
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

/* Filter Controls */
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

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
  border: 1px solid #e8ddd5;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
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
}

[data-theme='dark'] .project-description {
  color: #aaa;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e8ddd5;
}

[data-theme='dark'] .card-footer {
  border-top-color: #333;
}

.points {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ee9152;
}

[data-theme='dark'] .points {
  color: #f2b689;
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

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9e9d9;
  border-radius: 8px;
}

[data-theme='dark'] .pagination {
  background: #1a1a1a;
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

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
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
