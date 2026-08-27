<template>
  <section class="home-section">
    <!-- Hero -->
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

    <!-- Featured Projects -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">Featured Projects</h2>
        <div class="title-underline"></div>
      </div>

      <div v-if="projectsLoading" class="loading-container">
        <LoadingSpinner text="Loading projects..." />
      </div>

      <div v-else-if="projectsError" class="error-state">
        <p>{{ projectsError }}</p>
        <button @click="fetchProjects" class="retry-small">Retry</button>
      </div>

      <div v-else-if="topProjects.length > 0" class="projects-grid">
        <div
          v-for="project in topProjects"
          :key="project.project_id"
          class="project-card"
          @click="selectProject(project)"
        >
          <div class="card-content">
            <h3 class="project-title">{{ project.project_title }}</h3>
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

      <div v-else class="no-data">
        <p>No featured projects available</p>
      </div>
    </section>

    <!-- Recent Achievements -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">Recent Achievements</h2>
        <div class="title-underline"></div>
      </div>

      <div v-if="achievementsLoading" class="loading-container">
        <LoadingSpinner text="Loading achievements..." />
      </div>

      <div v-else-if="achievementsError" class="error-state">
        <p>{{ achievementsError }}</p>
        <button @click="fetchAchievements" class="retry-small">Retry</button>
      </div>

      <div v-else-if="recentAchievements.length > 0" class="achievements-grid">
        <div
          v-for="achievement in recentAchievements"
          :key="achievement.achievement_id"
          class="achievement-card"
          @click="selectAchievement(achievement)"
        >
          <div class="achievement-content">
            <p class="achievement-title">{{ achievement.achievement_title }}</p>
            <p class="achievement-date">{{ formatDate(achievement.earned_ts) }}</p>
          </div>
        </div>
      </div>

      <div v-else class="no-data">
        <p>🎯 No achievements available</p>
      </div>
    </section>

    <!-- Popups -->
    <ProjectPopup
      v-if="selectedProjectData"
      :project="selectedProjectData"
      @close="selectedProjectData = null"
    />

    <AchievementPopup
      v-if="selectedAchievementData"
      :achievement="selectedAchievementData"
      @close="selectedAchievementData = null"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '@/services/api';
import ProjectPopup from './ProjectPopup.vue';
import AchievementPopup from './AchievementPopup.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  toastRef: Object,
});

const heroTitle = ref('Thevindu Hennayake');
const heroTagline = ref('Software Engineer & Developer');
const topSkills = ref([]);

const topProjects = ref([]);
const projectsLoading = ref(true);
const projectsError = ref(null);

const achievements = ref([]);
const achievementsLoading = ref(true);
const achievementsError = ref(null);

const selectedProjectData = ref(null);
const selectedAchievementData = ref(null);

const recentAchievements = computed(() => achievements.value.slice(0, 3));

const selectProject = (project) => {
  selectedProjectData.value = project;
};

const selectAchievement = (achievement) => {
  selectedAchievementData.value = achievement;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
};

const fetchTagline = async () => {
  try {
    const data = await api.getTagline();
    if (data.tagline) heroTagline.value = data.tagline;
    if (data.languages) {
      topSkills.value = data.languages.split(' | ').map((s) => s.trim());
    }
  } catch (_) {
    // ignore
  }
};

const fetchProjects = async () => {
  try {
    projectsLoading.value = true;
    projectsError.value = null;
    const data = await api.getFeaturedProjects(3);
    topProjects.value = data.projects || [];
  } catch (err) {
    projectsError.value = err.message || 'Failed to load projects';
    props.toastRef?.addToast(projectsError.value, 'error', 'Failed to load projects');
  } finally {
    projectsLoading.value = false;
  }
};

const fetchAchievements = async () => {
  try {
    achievementsLoading.value = true;
    achievementsError.value = null;
    const data = await api.getAchievements(5);
    achievements.value = data.achievements || [];
  } catch (err) {
    achievementsError.value = err.message || 'Failed to load achievements';
    props.toastRef?.addToast(achievementsError.value, 'error', 'Failed to load achievements');
  } finally {
    achievementsLoading.value = false;
  }
};

const fetchData = async () => {
  await fetchTagline();
  await fetchProjects();
  await fetchAchievements();
};

onMounted(fetchData);
</script>

<style scoped>
.home-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4rem;
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
.hero {
  position: relative;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.1) 0%, rgba(238, 145, 82, 0.05) 100%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(242, 182, 137, 0.2);
}
[data-theme='dark'] .hero {
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.05) 0%, rgba(238, 145, 82, 0.02) 100%);
  border-color: rgba(242, 182, 137, 0.1);
}
.hero-accent {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(242, 182, 137, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  z-index: 0;
}
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-30px, 30px);
  }
}
.hero-content {
  position: relative;
  z-index: 1;
}
.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #382e28;
  letter-spacing: -0.5px;
}
[data-theme='dark'] .hero-title {
  color: #f0e0d8;
}
.hero-subtitle {
  font-size: 1.3rem;
  color: #8b7355;
  margin: 0 0 1.5rem 0;
  font-weight: 500;
}
[data-theme='dark'] .hero-subtitle {
  color: #d4b5a0;
}
.hero-skills {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.skill-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(238, 145, 82, 0.2);
  border: 1px solid #ee9152;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #ee9152;
  transition: all 0.3s ease;
}
[data-theme='dark'] .skill-badge {
  background: rgba(242, 182, 137, 0.15);
  border-color: #f2b689;
  color: #f2b689;
}
.skill-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 145, 82, 0.2);
  background: rgba(238, 145, 82, 0.3);
}
.content-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: #382e28;
  white-space: nowrap;
}
[data-theme='dark'] .section-title {
  color: #f0e0d8;
}
.title-underline {
  height: 3px;
  flex: 1;
  background: linear-gradient(90deg, #ee9152 0%, rgba(238, 145, 82, 0) 100%);
  border-radius: 2px;
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
[data-theme='dark'] .project-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border-color: #333;
}
.project-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #f2b689;
}
[data-theme='dark'] .project-card:hover {
  box-shadow: 0 12px 32px rgba(242, 182, 137, 0.15);
}
.card-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.1) 0%, rgba(238, 145, 82, 0.05) 100%);
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
}
.project-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #382e28;
}
[data-theme='dark'] .project-title {
  color: #f0e0d8;
}
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tech-tag {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  background: rgba(238, 145, 82, 0.15);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #ee9152;
  white-space: nowrap;
}
[data-theme='dark'] .tech-tag {
  background: rgba(242, 182, 137, 0.2);
  color: #f2b689;
}
.tech-tag.more {
  background: #ee9152;
  color: white;
}
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.achievement-card {
  background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
  border: 1px solid #e8ddd5;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
}
[data-theme='dark'] .achievement-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border-color: #333;
}
.achievement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(242, 182, 137, 0.2);
  border-color: #f2b689;
}
.achievement-content {
  width: 100%;
}
.achievement-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #382e28;
}
[data-theme='dark'] .achievement-title {
  color: #f0e0d8;
}
.achievement-date {
  font-size: 0.9rem;
  color: #8b7355;
  margin: 0;
}
[data-theme='dark'] .achievement-date {
  color: #a08070;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
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
.retry-small:active {
  transform: translateY(0);
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
@media (max-width: 768px) {
  .home-section {
    gap: 2rem;
  }
  .hero {
    padding: 2rem 1.5rem;
  }
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
  .section-title {
    font-size: 1.4rem;
  }
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  .error-state {
    flex-direction: column;
    text-align: center;
  }
}
</style>