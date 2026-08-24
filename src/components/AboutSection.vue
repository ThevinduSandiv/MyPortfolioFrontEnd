<template>
  <section class="about-section">
    <!-- Bio Section -->
    <div class="bio-section">
      <h1 class="bio-title">Hi, I'm Thevindu</h1>
      <p class="bio-text">{{ bioText }}</p>
    </div>

    <!-- Skills Section -->
    <div class="skills-container">
      <div class="category-section">
        <h2 class="category-title">Skills</h2>
        <div class="title-line"></div>

        <div v-if="loadingSkills" class="loading-container">
          <LoadingSpinner />
        </div>
        <div v-else-if="skillsError" class="error-state">
          <p>{{ skillsError }}</p>
          <button @click="loadSkills" class="retry-btn">Try Again</button>
        </div>
        <div v-else class="skills-grid">
          <div
            v-for="(category, idx) in skillCategories"
            :key="idx"
            class="skill-category-card"
            @click="openSkillPopup(category)"
          >
            <h3>{{ category.name }}</h3>
            <div class="skill-preview">
              <span v-for="(skill, i) in category.skills.slice(0, 2)" :key="i" class="skill-dot">●</span>
              <span v-if="category.skills.length > 2" class="more-skills">+{{ category.skills.length - 2 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Education Section -->
      <div class="category-section">
        <h2 class="category-title">Education</h2>
        <div class="title-line"></div>

        <div v-if="loadingEducation" class="loading-container">
          <LoadingSpinner />
        </div>
        <div v-else-if="educationError" class="error-state">
          <p>{{ educationError }}</p>
          <button @click="loadEducation" class="retry-btn">Try Again</button>
        </div>
        <div v-else class="education-timeline">
          <div v-for="edu in education" :key="edu.id" class="education-item">
            <div class="edu-dot"></div>
            <div class="edu-content">
              <h3>{{ edu.degree }}</h3>
              <p class="edu-school">{{ edu.school }}</p>
              <p class="edu-date">{{ edu.year }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Certifications Section -->
      <div class="category-section">
        <h2 class="category-title">Certifications</h2>
        <div class="title-line"></div>

        <div v-if="loadingCerts" class="loading-container">
          <LoadingSpinner />
        </div>
        <div v-else-if="certsError" class="error-state">
          <p>{{ certsError }}</p>
          <button @click="loadCerts" class="retry-btn">Try Again</button>
        </div>
        <div v-else class="cert-grid">
          <div
            v-for="cert in certifications"
            :key="cert.id"
            class="cert-card"
            @click="openCertPopup(cert)"
          >
            <span class="cert-icon">🏆</span>
            <h4>{{ cert.name }}</h4>
            <p>{{ cert.issuer }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Detail Popup -->
    <transition name="modal">
      <SkillPopup
        v-if="selectedSkillCategory"
        :category="selectedSkillCategory"
        @close="selectedSkillCategory = null"
      />
    </transition>

    <!-- Certification Detail Popup -->
    <transition name="modal">
      <CertPopup
        v-if="selectedCert"
        :cert="selectedCert"
        @close="selectedCert = null"
      />
    </transition>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SkillPopup from './SkillPopup.vue';
import CertPopup from './CertPopup.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import api from '@/services/api';

const bioText = ref('');
const skillCategories = ref([]);
const education = ref([]);
const certifications = ref([]);

const loadingSkills = ref(true);
const loadingEducation = ref(true);
const loadingCerts = ref(true);

const skillsError = ref('');
const educationError = ref('');
const certsError = ref('');

const selectedSkillCategory = ref(null);
const selectedCert = ref(null);

const loadSkills = async () => {
  loadingSkills.value = true;
  skillsError.value = '';
  try {
    skillCategories.value = await api.getSkills();
  } catch (error) {
    skillsError.value = error.message;
  } finally {
    loadingSkills.value = false;
  }
};

const loadEducation = async () => {
  loadingEducation.value = true;
  educationError.value = '';
  try {
    education.value = await api.getBio(); // Or separate endpoint
  } catch (error) {
    educationError.value = error.message;
  } finally {
    loadingEducation.value = false;
  }
};

const loadCerts = async () => {
  loadingCerts.value = true;
  certsError.value = '';
  try {
    certifications.value = await api.getCertifications();
  } catch (error) {
    certsError.value = error.message;
  } finally {
    loadingCerts.value = false;
  }
};

const openSkillPopup = (category) => {
  selectedSkillCategory.value = category;
  document.body.style.overflow = 'hidden';
};

const openCertPopup = (cert) => {
  selectedCert.value = cert;
  document.body.style.overflow = 'hidden';
};

onMounted(() => {
  loadSkills();
  loadEducation();
  loadCerts();
  // Fetch bio text
  api.getBio().then(data => bioText.value = data.bio || '').catch(() => bioText.value = '');
});
</script>

<style scoped>
/* same as before plus loading/error styles */
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