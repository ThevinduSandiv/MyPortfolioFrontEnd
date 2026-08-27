<!-- AboutSection.vue - Updated with API Integration -->
<template>
  <section class="about-section">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading about information...</p>
    </div>

    <!-- Error State - Full Page Error -->
    <div v-else-if="error && !aboutData.bio" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchAboutData" class="retry-button">Retry</button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Bio Section -->
      <div class="bio-section">
        <h1 class="bio-title">Hi, I'm Thevindu</h1>
        <p class="bio-text">{{ aboutData.bio || defaultBio }}</p>
      </div>

      <!-- Skills Section -->
      <div class="skills-container">
        <div class="category-section">
          <h2 class="category-title">Skills</h2>
          <div class="title-line"></div>

          <!-- Skills Error State -->
          <div v-if="skillsError" class="section-error">
            <p>{{ skillsError }}</p>
            <button @click="fetchAboutData" class="retry-small">Retry</button>
          </div>

          <!-- Skills Content -->
          <div v-else-if="aboutData.skillCategories && aboutData.skillCategories.length > 0" class="skills-grid">
            <div
              v-for="category in aboutData.skillCategories"
              :key="category.name"
              class="skill-category-card"
              @click="openSkillPopup(category)"
            >
              <h3>{{ category.name }}</h3>
              <div class="skill-preview">
                <span 
                  v-for="(skill, i) in category.skills.slice(0, 2)" 
                  :key="i" 
                  class="skill-dot"
                >●</span>
                <span v-if="category.skills.length > 2" class="more-skills">
                  +{{ category.skills.length - 2 }}
                </span>
              </div>
            </div>
          </div>

          <!-- No Skills Data -->
          <div v-else class="no-data">
            <p>No skills data available</p>
          </div>
        </div>

        <!-- Education Section -->
        <div class="category-section">
          <h2 class="category-title">Education</h2>
          <div class="title-line"></div>

          <!-- Education Error State -->
          <div v-if="educationError" class="section-error">
            <p>{{ educationError }}</p>
            <button @click="fetchAboutData" class="retry-small">Retry</button>
          </div>

          <!-- Education Content -->
          <div v-else-if="aboutData.education && aboutData.education.length > 0" class="education-timeline">
            <div v-for="edu in aboutData.education" :key="edu.education_id" class="education-item">
              <div class="edu-dot"></div>
              <div class="edu-content">
                <h3>{{ edu.education_title }}</h3>
                <p class="edu-school">{{ edu.institution_name }}</p>
                <p class="edu-date">{{ formatEducationDate(edu) }}</p>
              </div>
            </div>
          </div>

          <!-- No Education Data -->
          <div v-else class="no-data">
            <p>No education data available</p>
          </div>
        </div>

        <!-- Certifications Section -->
        <div class="category-section">
          <h2 class="category-title">Certifications</h2>
          <div class="title-line"></div>

          <!-- Certifications Error State -->
          <div v-if="certificationsError" class="section-error">
            <p>{{ certificationsError }}</p>
            <button @click="fetchAboutData" class="retry-small">Retry</button>
          </div>

          <!-- Certifications Content -->
          <div v-else-if="aboutData.certifications && aboutData.certifications.length > 0" class="cert-grid">
            <div
              v-for="cert in aboutData.certifications"
              :key="cert.achievement_id"
              class="cert-card"
              @click="openCertPopup(cert)"
            >
              <span class="cert-icon">🏆</span>
              <h4>{{ cert.achievement_title }}</h4>
              <p>{{ cert.achievement_description }}</p>
            </div>
          </div>

          <!-- No Certifications Data -->
          <div v-else class="no-data">
            <p>No certifications available</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Skill Detail Popup -->
    <transition name="modal">
      <SkillPopup
        v-if="selectedSkillCategory"
        :category="selectedSkillCategory"
        @close="closeSkillPopup"
      />
    </transition>

    <!-- Certification Detail Popup -->
    <transition name="modal">
      <CertPopup
        v-if="selectedCert"
        :cert="selectedCert"
        @close="closeCertPopup"
      />
    </transition>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SkillPopup from './SkillPopup.vue';
import CertPopup from './CertPopup.vue';
import { api } from '@/services/api';

// State
const loading = ref(true);
const error = ref(null);
const skillsError = ref(null);
const educationError = ref(null);
const certificationsError = ref(null);

const aboutData = ref({
  bio: '',
  skillCategories: [],
  education: [],
  certifications: []
});

const selectedSkillCategory = ref(null);
const selectedCert = ref(null);

// Default bio as fallback only
const defaultBio = 'I recently graduated with a Bachelor of Computing (Software Engineering) from Curtin University. To broaden my technical perspective, I chose electives in Machine Learning and Machine Perception, complementing my core proficiency in Python, Java, network security, and mobile development. This has given me a practical introduction to AI concepts alongside a robust software engineering skill set. I am eager to apply and expand these skills in a real-world context while also planning to pursue further postgraduate studies to deepen my specialization in the field.';

// Format education date
const formatEducationDate = (edu) => {
  if (!edu.start_ts && !edu.end_ts) return '';
  
  const startYear = edu.start_ts ? new Date(edu.start_ts).getFullYear() : '';
  const endYear = edu.end_ts ? new Date(edu.end_ts).getFullYear() : 'Present';
  
  if (startYear) {
    return `${startYear} - ${endYear}`;
  }
  return endYear;
};

// Fetch about data from API
const fetchAboutData = async () => {
  loading.value = true;
  error.value = null;
  skillsError.value = null;
  educationError.value = null;
  certificationsError.value = null;
  
  try {
    const response = await api.getAbout();
    
    // Set bio with fallback
    aboutData.value.bio = response.bio || defaultBio;
    
    // Handle skills - show error if missing
    if (response.skillCategories) {
      aboutData.value.skillCategories = response.skillCategories;
    } else {
      skillsError.value = 'Unable to load skills data';
      aboutData.value.skillCategories = [];
    }
    
    // Handle education - show error if missing
    if (response.education) {
      aboutData.value.education = response.education;
    } else {
      educationError.value = 'Unable to load education data';
      aboutData.value.education = [];
    }
    
    // Handle certifications - show error if missing
    if (response.certifications) {
      aboutData.value.certifications = response.certifications;
    } else {
      certificationsError.value = 'Unable to load certifications data';
      aboutData.value.certifications = [];
    }
    
  } catch (err) {
    console.error('Error fetching about data:', err);
    error.value = err.message || 'Unable to load about information. Please try again later.';
    
    // Only keep bio fallback, clear other data
    aboutData.value = {
      bio: defaultBio,
      skillCategories: [],
      education: [],
      certifications: []
    };
    
    skillsError.value = 'Unable to load skills data';
    educationError.value = 'Unable to load education data';
    certificationsError.value = 'Unable to load certifications data';
  } finally {
    loading.value = false;
  }
};

// Popup handlers
const openSkillPopup = (category) => {
  selectedSkillCategory.value = category;
  document.body.style.overflow = 'hidden';
};

const closeSkillPopup = () => {
  selectedSkillCategory.value = null;
  document.body.style.overflow = '';
};

const openCertPopup = (cert) => {
  selectedCert.value = cert;
  document.body.style.overflow = 'hidden';
};

const closeCertPopup = () => {
  selectedCert.value = null;
  document.body.style.overflow = '';
};

// Lifecycle
onMounted(() => {
  fetchAboutData();
});
</script>

<style scoped>
.about-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
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

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
  min-height: 400px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e8ddd5;
  border-top: 4px solid #ee9152;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #8b7355;
  font-size: 1.1rem;
}

[data-theme='dark'] .loading-container p {
  color: #a08070;
}

/* Error State - Full Page */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
  min-height: 400px;
  text-align: center;
}

.error-message {
  color: #dc3545;
  font-size: 1.1rem;
  max-width: 500px;
}

/* Section Error State */
.section-error {
  padding: 1.5rem;
  background: rgba(220, 53, 69, 0.05);
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 8px;
  text-align: center;
  color: #dc3545;
}

.section-error p {
  margin: 0 0 0.75rem 0;
}

.retry-button,
.retry-small {
  background: #ee9152;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button {
  padding: 0.8rem 2rem;
  font-size: 1rem;
}

.retry-small {
  padding: 0.4rem 1.2rem;
  font-size: 0.85rem;
}

.retry-button:hover,
.retry-small:hover {
  background: #d47d44;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 145, 82, 0.3);
}

.retry-button:active,
.retry-small:active {
  transform: translateY(0);
}

/* No Data State */
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

/* Bio Section */
.bio-section {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.1) 0%, rgba(238, 145, 82, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(242, 182, 137, 0.2);
}

[data-theme='dark'] .bio-section {
  background: linear-gradient(135deg, rgba(242, 182, 137, 0.05) 0%, rgba(238, 145, 82, 0.02) 100%);
  border-color: rgba(242, 182, 137, 0.1);
}

.bio-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #382e28;
}

[data-theme='dark'] .bio-title {
  color: #f0e0d8;
}

.bio-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
  margin: 0;
}

[data-theme='dark'] .bio-text {
  color: #b0b0b0;
}

/* Skills Container */
.skills-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.category-section {
  width: 100%;
}

.category-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #382e28;
}

[data-theme='dark'] .category-title {
  color: #f0e0d8;
}

.title-line {
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #ee9152 0%, rgba(238, 145, 82, 0) 100%);
  border-radius: 2px;
  margin-bottom: 1.5rem;
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.skill-category-card {
  background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
  border: 1px solid #e8ddd5;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

[data-theme='dark'] .skill-category-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border-color: #333;
}

.skill-category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #f2b689;
}

[data-theme='dark'] .skill-category-card:hover {
  box-shadow: 0 12px 32px rgba(242, 182, 137, 0.15);
}

.skill-category-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #382e28;
}

[data-theme='dark'] .skill-category-card h3 {
  color: #f0e0d8;
}

.skill-preview {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 1.2rem;
  color: #ee9152;
}

.more-skills {
  font-size: 0.85rem;
  background: rgba(238, 145, 82, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
}

/* Education Timeline */
.education-timeline {
  position: relative;
  padding-left: 30px;
}

.education-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #ee9152 0%, rgba(238, 145, 82, 0) 100%);
}

.education-item {
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
}

.education-item:last-child {
  margin-bottom: 0;
}

.edu-dot {
  position: absolute;
  left: -32px;
  top: 6px;
  width: 12px;
  height: 12px;
  background: #ee9152;
  border: 3px solid white;
  border-radius: 50%;
  z-index: 1;
}

[data-theme='dark'] .edu-dot {
  border-color: #0f0f0f;
}

.edu-content {
  flex: 1;
}

.edu-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
  color: #382e28;
}

[data-theme='dark'] .edu-content h3 {
  color: #f0e0d8;
}

.edu-school {
  font-size: 0.95rem;
  color: #8b7355;
  margin: 0 0 0.2rem 0;
  font-weight: 500;
}

[data-theme='dark'] .edu-school {
  color: #d4b5a0;
}

.edu-date {
  font-size: 0.9rem;
  color: #aaa;
  margin: 0;
}

[data-theme='dark'] .edu-date {
  color: #808080;
}

/* Certifications Grid */
.cert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
}

.cert-card {
  background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
  border: 1px solid #e8ddd5;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

[data-theme='dark'] .cert-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border-color: #333;
}

.cert-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(242, 182, 137, 0.2);
  border-color: #f2b689;
}

.cert-icon {
  font-size: 2rem;
}

.cert-card h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: #382e28;
}

[data-theme='dark'] .cert-card h4 {
  color: #f0e0d8;
}

.cert-card p {
  font-size: 0.85rem;
  color: #8b7355;
  margin: 0;
}

[data-theme='dark'] .cert-card p {
  color: #a08070;
}

/* Modal Transitions */
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
  .about-section {
    gap: 2rem;
  }

  .bio-section {
    padding: 1.5rem;
  }

  .bio-title {
    font-size: 1.6rem;
  }

  .bio-text {
    font-size: 0.95rem;
  }

  .category-title {
    font-size: 1.3rem;
  }

  .skills-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .cert-grid {
    grid-template-columns: 1fr;
  }

  .education-timeline {
    padding-left: 25px;
  }

  .education-timeline::before {
    left: 2px;
  }

  .edu-dot {
    left: -29px;
  }
}
</style>