<template>
  <div class="app-container" :data-theme="currentTheme">
    <InteractiveBackground />
    
    <!-- Floating CV Download Button -->
    <div class="floating-cv-button" @click="downloadCV" title="Download CV">
      <div class="pulse-ring"></div>
      <span class="cv-icon">📄</span>
    </div>

    <!-- Header with Logo and Theme Toggle -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="logo-text">Thevindu Hennayake</h1>
        <ThemeToggle @theme-changed="currentTheme = $event" />
      </div>
    </header>

    <!-- Navigation -->
    <nav class="app-nav" :class="{ 'mobile-open': mobileMenuOpen }">
      <div class="nav-content">
        <div class="nav-main">
          <button
            v-for="page in mainPages"
            :key="page.id"
            :class="['nav-btn', { active: selectedPage.id === page.id }]"
            @click="selectPage(page)"
          >
            {{ page.label }}
          </button>
        </div>
        <div class="nav-special">
          <button
            v-for="page in specialPages"
            :key="page.id"
            :class="['nav-btn special', { active: selectedPage.id === page.id }]"
            @click="selectPage(page)"
          >
            {{ page.label }}
          </button>
        </div>
      </div>
      <button v-if="isMobile" class="nav-close" @click="mobileMenuOpen = false">✕</button>
    </nav>

    <!-- Mobile Menu Toggle -->
    <button v-if="isMobile" class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Main Content -->
    <main class="app-main">
      <component :is="currentComponent" :key="selectedPage.id" :toastRef="toastContainer" />
    </main>

    <!-- Footer -->
    <FooterSection />
    
    <!-- Toast Container -->
    <ToastContainer ref="toastContainer" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import FooterSection from '@/components/FooterSection.vue';
import InteractiveBackground from '@/components/InteractiveBackground.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import HomeSection from '@/components/HomeSection.vue';
import AboutSection from '@/components/AboutSection.vue';
import ProjectsSection from '@/components/ProjectsSection.vue';
import ExperienceSection from '@/components/ExperienceSection.vue';
import ContactSection from '@/components/ContactSection.vue';
import ComingSoon from '@/components/ComingSoon.vue';

const currentTheme = ref('light');
const selectedPage = ref({ id: 1, label: 'Home' });
const mobileMenuOpen = ref(false);
const isMobile = ref(false);
const toastContainer = ref(null);

const mainPages = [
  { id: 1, label: 'Home' },
  { id: 2, label: 'About' },
  { id: 3, label: 'Projects' },
  { id: 4, label: 'Experience' },
  { id: 5, label: 'Contact' }
];

const specialPages = [
  { id: 6, label: 'Aviation Adventure' }
];

const currentComponent = computed(() => {
  switch (selectedPage.value.id) {
    case 1: return HomeSection;
    case 2: return AboutSection;
    case 3: return ProjectsSection;
    case 4: return ExperienceSection;
    case 5: return ContactSection;
    case 6: return ComingSoon;
    default: return ComingSoon;
  }
});

const selectPage = (page) => {
  selectedPage.value = page;
  mobileMenuOpen.value = false;
  window.scrollTo(0, 0);
};

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

const downloadCV = () => {
  const cvData = {
    timestamp: new Date().toISOString()
  };
  
  fetch('/api/cv/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cvData)
  })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Thevindu_Hennayake_CV_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toastContainer.value?.addToast('CV downloaded successfully!', 'success', 'Success');
    })
    .catch(error => {
      console.error('CV download failed:', error);
      toastContainer.value?.addToast('Failed to download CV. Please try again.', 'error', 'Error');
    });
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    currentTheme.value = savedTheme;
  } else if (prefersDark) {
    currentTheme.value = 'dark';
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-light);
  color: var(--text-light);
  transition: background-color 0.5s ease, color 0.5s ease;
}

.app-container[data-theme='dark'] {
  --bg-light: #0f0f0f;
  --text-light: #e0e0e0;
  --bg-light-soft: #1a1a1a;
  --border-light: #333;
}

.app-container[data-theme='light'] {
  --bg-light: #fcf6ef;
  --text-light: #2c2c2c;
  --bg-light-soft: #f9e9d9;
  --border-light: #d4ccc4;
}

/* Floating CV Button */
.floating-cv-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f2b689 0%, #ee9152 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 40;
  box-shadow: 0 8px 24px rgba(242, 182, 137, 0.3);
  transition: all 0.3s ease;
  border: none;
  font-size: 1.5rem;
}

.floating-cv-button:hover {
  transform: scale(1.1) translateY(-4px);
  box-shadow: 0 12px 32px rgba(242, 182, 137, 0.5);
}

.floating-cv-button:active {
  transform: scale(0.95);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #f2b689;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.cv-icon {
  position: relative;
  z-index: 1;
}

/* Header */
.app-header {
  background: linear-gradient(135deg, #f9e9d9 0%, #fcf6ef 100%);
  border-bottom: 2px solid #d4ccc4;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

[data-theme='dark'] .app-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border-bottom-color: #333;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #382e28;
  letter-spacing: -0.5px;
}

[data-theme='dark'] .logo-text {
  color: #f0e0d8;
}

/* Navigation */
.app-nav {
  background: #f9e9d9;
  border-bottom: 2px solid #d4ccc4;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  overflow-x: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

[data-theme='dark'] .app-nav {
  background: #1a1a1a;
  border-bottom-color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.nav-content {
  display: flex;
  gap: 2rem;
  align-items: center;
  max-width: 1400px;
  width: 100%;
}

.nav-main,
.nav-special {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-btn {
  background: transparent;
  border: 2px solid #382e28;
  color: #382e28;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;
}

[data-theme='dark'] .nav-btn {
  border-color: #f0e0d8;
  color: #f0e0d8;
}

.nav-btn:hover {
  background: #f2b689;
  border-color: #f2b689;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 182, 137, 0.2);
}

.nav-btn.active {
  background: #ee9152;
  border-color: #ee9152;
  color: white;
  font-weight: 600;
}

.nav-btn.special {
  font-style: italic;
}

.nav-close {
  display: none;
}

/* Mobile Menu */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 1.5rem;
  right: 2rem;
  z-index: 50;
  background: #f2b689;
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 6px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: #ee9152;
}

.mobile-menu-toggle span {
  width: 24px;
  height: 2px;
  background: white;
  border-radius: 1px;
  transition: all 0.3s ease;
}

/* Main Content */
.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .logo-text {
    font-size: 1.3rem;
  }

  .app-nav {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    padding: 6rem 1rem 2rem;
    gap: 1rem;
    z-index: 40;
    background: #fcf6ef;
  }

  [data-theme='dark'] .app-nav {
    background: #0f0f0f;
  }

  .app-nav.mobile-open {
    display: flex;
  }

  .nav-content {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .nav-main,
  .nav-special {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }

  .nav-close {
    display: block;
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #382e28;
  }

  [data-theme='dark'] .nav-close {
    color: #f0e0d8;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .floating-cv-button {
    bottom: 1rem;
    right: 1rem;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .app-main {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0.75rem;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .floating-cv-button {
    bottom: 0.75rem;
    right: 0.75rem;
  }

  .app-main {
    padding: 0.75rem;
  }
}
</style>
