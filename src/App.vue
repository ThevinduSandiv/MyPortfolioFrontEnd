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
        <div class="header-actions">
          <ThemeToggle @theme-changed="currentTheme = $event" />
          <button
            v-if="isMobile"
            class="mobile-menu-toggle"
            type="button"
            aria-label="Open navigation menu"
            aria-controls="primary-navigation"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = true"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>

    <button
      v-if="isMobile"
      class="nav-backdrop"
      :class="{ visible: mobileMenuOpen }"
      type="button"
      aria-label="Close navigation menu"
      tabindex="-1"
      @click="mobileMenuOpen = false"
    ></button>

    <!-- Navigation -->
    <nav id="primary-navigation" class="app-nav" :class="{ 'mobile-open': mobileMenuOpen }">
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
      <button
        v-if="isMobile"
        class="nav-close"
        type="button"
        aria-label="Close navigation menu"
        @click="mobileMenuOpen = false"
      >✕</button>
    </nav>

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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import FooterSection from '@/components/FooterSection.vue';
import InteractiveBackground from '@/components/InteractiveBackground.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import HomeSection from '@/components/HomeSection.vue';
import AboutSection from '@/components/AboutSection.vue';
import ProjectsSection from '@/components/ProjectsSection.vue';
import ExperienceSection from '@/components/ExperienceSection.vue';
import ContactSection from '@/components/ContactSection.vue';
import AviationSection from '@/components/AviationSection.vue';
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
    case 6: return AviationSection;
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
  if (!isMobile.value) mobileMenuOpen.value = false;
};

const handleEscape = (event) => {
  if (event.key === 'Escape') mobileMenuOpen.value = false;
};

watch(mobileMenuOpen, (isOpen) => {
  document.body.style.overflow = isOpen && isMobile.value ? 'hidden' : '';
});

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
  window.addEventListener('keydown', handleEscape);
  
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
  window.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
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
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.app-container::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  opacity: 0.34;
  background-image: linear-gradient(rgba(56, 46, 40, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 46, 40, 0.035) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, black, transparent 78%);
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
  position: relative;
  z-index: 20;
  backdrop-filter: blur(18px);
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
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
  position: sticky;
  top: 0;
  z-index: 15;
  backdrop-filter: blur(18px);
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

.nav-special {
  margin-left: auto;
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
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.24), transparent);
  transform: translateX(-120%);
  transition: transform 0.5s ease;
}

.nav-btn:hover::before { transform: translateX(120%); }

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

.nav-backdrop {
  display: none;
}

/* Mobile Menu */
.mobile-menu-toggle {
  display: none;
  background: #f2b689;
  border: 1px solid rgba(255, 255, 255, 0.48);
  width: 42px;
  height: 42px;
  cursor: pointer;
  border-radius: 13px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(238, 145, 82, 0.24);
}

.mobile-menu-toggle:hover {
  background: #ee9152;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(238, 145, 82, 0.34);
}

.mobile-menu-toggle span {
  width: 21px;
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
  position: relative;
  z-index: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    position: sticky;
    top: 0;
    z-index: 30;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid rgba(139, 115, 85, 0.18);
    background: rgba(252, 246, 239, 0.82);
    backdrop-filter: blur(22px) saturate(1.15);
    -webkit-backdrop-filter: blur(22px) saturate(1.15);
    box-shadow: 0 10px 30px rgba(78, 51, 33, 0.08);
  }

  [data-theme='dark'] .app-header {
    background: rgba(15, 15, 15, 0.82);
    border-bottom-color: rgba(242, 182, 137, 0.14);
  }

  .header-content {
    flex-direction: row;
    gap: 0.75rem;
    min-height: 44px;
  }

  .logo-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: clamp(1.05rem, 5vw, 1.3rem);
    letter-spacing: -0.025em;
  }

  .header-actions {
    flex-shrink: 0;
    gap: 0.65rem;
  }

  .nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 39;
    border: 0;
    background: rgba(20, 14, 11, 0.48);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .nav-backdrop.visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .app-nav {
    display: flex;
    position: fixed;
    top: 0;
    left: auto;
    right: 0;
    bottom: 0;
    width: min(88vw, 380px);
    flex-direction: column;
    justify-content: flex-start;
    padding: 5.75rem 1.25rem 2rem;
    gap: 1rem;
    z-index: 40;
    overflow-y: auto;
    background: rgba(252, 246, 239, 0.96);
    border: 0;
    border-left: 1px solid rgba(238, 145, 82, 0.22);
    border-radius: 28px 0 0 28px;
    box-shadow: -24px 0 70px rgba(50, 30, 20, 0.2);
    backdrop-filter: blur(26px) saturate(1.15);
    -webkit-backdrop-filter: blur(26px) saturate(1.15);
    transform: translateX(105%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease, visibility 0.38s ease;
  }

  [data-theme='dark'] .app-nav {
    background: rgba(20, 18, 17, 0.97);
    border-left-color: rgba(242, 182, 137, 0.18);
    box-shadow: -24px 0 70px rgba(0, 0, 0, 0.5);
  }

  .app-nav.mobile-open {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
    display: flex;
  }

  .nav-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.4rem;
    width: 100%;
  }

  .nav-main,
  .nav-special {
    flex-direction: column;
    width: 100%;
    gap: 0.7rem;
  }

  .nav-special {
    margin-left: 0;
    padding-top: 1.15rem;
    border-top: 1px solid rgba(139, 115, 85, 0.2);
  }

  .nav-btn {
    width: 100%;
    min-height: 52px;
    padding: 0.85rem 1rem;
    border-width: 1px;
    border-radius: 14px;
    text-align: left;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.38);
  }

  [data-theme='dark'] .nav-btn {
    background: rgba(255, 255, 255, 0.025);
  }

  .nav-close {
    display: flex;
    position: absolute;
    top: 1.15rem;
    right: 1.2rem;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    background: rgba(238, 145, 82, 0.13);
    border: 1px solid rgba(238, 145, 82, 0.3);
    border-radius: 14px;
    font-size: 1.25rem;
    cursor: pointer;
    color: #382e28;
    transition: transform 0.25s ease, background 0.25s ease;
  }

  .nav-close:hover {
    transform: rotate(8deg) scale(1.05);
    background: rgba(238, 145, 82, 0.24);
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
    padding: 0.65rem 0.75rem;
  }

  .logo-text {
    font-size: 1.05rem;
  }

  .app-nav {
    width: min(92vw, 360px);
    padding-inline: 1rem;
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
