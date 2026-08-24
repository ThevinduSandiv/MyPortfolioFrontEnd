<template>
  <section class="home-section">
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">{{ heroTitle }}</h1>
        <p class="hero-subtitle">{{ heroTagline }}</p>
        <div class="hero-skills">
          <span v-for="skill in topSkills" :key="skill" class="skill-badge">
            {{ skill }}
          </span>
        </div>
      </div>
      <div class="hero-accent"></div>
    </div>

    <!-- Top Projects -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">Featured Projects</h2>
        <div class="title-underline"></div>
      </div>

      <div v-if="loadingProjects" class="loading-container">
        <LoadingSpinner />
      </div>
      <div v-else-if="projectsError" class="error-state">
        <p>{{ projectsError }}</p>
        <button @click="loadProjects" class="retry-btn">Try Again</button>
      </div>
      <div v-else class="projects-grid">
        <transition-group name="fade" tag="div">
          <div
            v-for="project in topProjects"
            :key="project.id"
            class="project-card"
            @click="selectProject(project)"
          >
            <div class="card-content">
              <h3 class="project-title">{{ project.name }}</h3>
              <div class="tech-stack">
                <span v-for="tech in project.technologies.slice(0, 3)" :key="tech" class="tech-tag">
                  {{ tech }}
                </span>
                <span v-if="project.technologies.length > 3" class="tech-tag more">
                  +{{ project.technologies.length - 3 }}
                </span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
        </transition-group>
      </div>
    </section>

    <!-- Recent Achievements -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">Recent Achievements</h2>
        <div class="title-underline"></div>
      </div>

      <div v-if="loadingAchievements" class="loading-container">
        <LoadingSpinner />
      </div>
      <div v-else-if="achievementsError" class="error-state">
        <p>{{ achievementsError }}</p>
        <button @click="loadAchievements" class="retry-btn">Try Again</button>
      </div>
      <div v-else class="achievements-grid">
        <transition-group name="fade" tag="div">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="achievement-card"
            @click="selectAchievement(achievement)"
          >
            <div class="achievement-content">
              <p class="achievement-title">{{ achievement.title }}</p>
              <p class="achievement-date">{{ formatDate(achievement.date) }}</p>
            </div>
          </div>
        </transition-group>
      </div>
    </section>

    <!-- Project Detail Popup -->
    <transition name="modal">
      <ProjectPopup
        v-if="selectedProjectData"
        :project="selectedProjectData"
        @close="selectedProjectData = null"
      />
    </transition>

    <!-- Achievement Detail Popup -->
    <transition name="modal">
      <AchievementPopup
        v-if="selectedAchievementData"
        :achievement="selectedAchievementData"
        @close="selectedAchievementData = null"
      />
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ProjectPopup from './ProjectPopup.vue';
import AchievementPopup from './AchievementPopup.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import api from '@/services/api';

const heroTitle = ref('Thevindu Hennayake');
const heroTagline = ref('Software Engineer & Developer');
const topSkills = ref(['Java', 'C', 'Python']);

const topProjects = ref([]);
const achievements = ref([]);
const loadingProjects = ref(true);
const loadingAchievements = ref(true);
const projectsError = ref('');
const achievementsError = ref('');
const selectedProjectData = ref(null);
const selectedAchievementData = ref(null);

const recentAchievements = computed(() => achievements.value.slice(0, 3));

const loadProjects = async () => {
  loadingProjects.value = true;
  projectsError.value = '';
  try {
    const projects = await api.getProjects();
    // Take first 3 as featured
    topProjects.value = projects.slice(0, 3);
  } catch (error) {
    projectsError.value = error.message;
  } finally {
    loadingProjects.value = false;
  }
};

const loadAchievements = async () => {
  loadingAchievements.value = true;
  achievementsError.value = '';
  try {
    const data = await api.getAchievements();
    achievements.value = data;
  } catch (error) {
    achievementsError.value = error.message;
  } finally {
    loadingAchievements.value = false;
  }
};

const selectProject = (project) => {
  selectedProjectData.value = project;
  document.body.style.overflow = 'hidden';
};

const selectAchievement = (achievement) => {
  selectedAchievementData.value = achievement;
  document.body.style.overflow = 'hidden';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

onMounted(() => {
  loadProjects();
  loadAchievements();
});
</script>

<style scoped>
/* same styles as before plus loading/error classes */
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