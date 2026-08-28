<template>
  <div class="popup-overlay" @click.self="closePopup">
    <article
      ref="dialogRef"
      class="popup-content"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`project-title-${projectData.project_id}`"
      :aria-busy="isRefreshing"
      tabindex="-1"
    >
      <header class="popup-header">
        <div>
          <span class="popup-eyebrow">Project</span>
          <h2 :id="`project-title-${projectData.project_id}`" class="popup-title">
            {{ projectData.project_title }}
          </h2>
        </div>
        <button type="button" class="close-btn" aria-label="Close project" @click="closePopup">
          &times;
        </button>
      </header>

      <div class="popup-body">
        <p class="popup-description">{{ projectData.project_description }}</p>

        <section v-if="technologies.length" class="tech-stack" aria-label="Technologies">
          <h3>Technologies</h3>
          <div class="tech-list">
            <span v-for="tech in technologies" :key="tech" class="tech-badge">
              {{ tech }}
            </span>
          </div>
        </section>

        <nav v-if="projectLinks.length" class="links-section" aria-label="Project links">
          <a
            v-for="link in projectLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="link-btn"
          >
            {{ link.label }}
          </a>
        </nav>

        <MediaGallery
          :media="media"
          :title="projectData.project_title"
          @media-error="refreshExpiredMedia"
          @viewer-change="viewerOpen = $event"
        />
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { api } from '@/services/api';
import MediaGallery from './MediaGallery.vue';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const dialogRef = ref(null);
const projectData = ref({ ...props.project });
const isRefreshing = ref(false);
const viewerOpen = ref(false);
const refreshAttempts = new Set();
let previousBodyOverflow = '';
let activeRefresh = null;

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

const normalizeHttpUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const parsed = new URL(value.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed;
  } catch (_) {
    return null;
  }
};

const technologies = computed(() =>
  parseJsonArray(projectData.value.technologies).filter((tech) => typeof tech === 'string' && tech.trim())
);

const projectLinks = computed(() => {
  const links = [];
  const seen = new Set();

  const github = normalizeHttpUrl(projectData.value.github_link);
  if (github) {
    seen.add(github.href);
    links.push({ label: 'GitHub Repository', url: github.href });
  }

  parseJsonArray(projectData.value.other_links).forEach((value) => {
    const parsed = normalizeHttpUrl(value);
    if (!parsed || seen.has(parsed.href)) return;

    seen.add(parsed.href);
    links.push({
      label: parsed.hostname.replace(/^www\./i, '') || 'Project link',
      url: parsed.href,
    });
  });

  return links;
});

const media = computed(() =>
  Array.isArray(projectData.value.media) ? projectData.value.media : []
);

const fetchProjectDetails = async () => {
  if (!projectData.value.project_id) return;
  if (activeRefresh) return activeRefresh;

  activeRefresh = (async () => {
    try {
      isRefreshing.value = true;
      const freshProject = await api.getProject(projectData.value.project_id);
      projectData.value = freshProject;
    } catch (_) {
      // Keep the list response visible if the detail refresh is temporarily unavailable.
    } finally {
      isRefreshing.value = false;
      activeRefresh = null;
    }
  })();

  return activeRefresh;
};

const refreshExpiredMedia = async (failedMedia) => {
  if (!failedMedia?.media_id || refreshAttempts.has(failedMedia.media_id)) return;

  refreshAttempts.add(failedMedia.media_id);
  await fetchProjectDetails();
};

const closePopup = () => emit('close');

const handleKeydown = (event) => {
  if (event.key === 'Escape' && !viewerOpen.value && !event.defaultPrevented) {
    event.preventDefault();
    closePopup();
  }
};

watch(
  () => props.project,
  (project) => {
    projectData.value = { ...project };
    refreshAttempts.clear();
  }
);

onMounted(async () => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', handleKeydown);
  await nextTick();
  dialogRef.value?.focus();
  fetchProjectDetails();
});

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow;
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(24, 18, 15, 0.72);
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-out;
}

.popup-content {
  width: min(860px, 94vw);
  max-height: min(86vh, 780px);
  overflow-y: auto;
  border: 1px solid #e5d8ce;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(25, 16, 11, 0.35);
  outline: none;
  animation: slideUp 0.25s ease-out;
}

[data-theme='dark'] .popup-content {
  border-color: #38322f;
  background: #1a1a1a;
}

.popup-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.6rem 1.8rem 1.25rem;
  border-bottom: 1px solid #e8ddd5;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
}

[data-theme='dark'] .popup-header {
  border-bottom-color: #333;
  background: rgba(26, 26, 26, 0.96);
}

.popup-eyebrow {
  display: block;
  margin-bottom: 0.3rem;
  color: #ee9152;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.popup-title {
  margin: 0;
  color: #382e28;
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1.2;
}

[data-theme='dark'] .popup-title {
  color: #f0e0d8;
}

.close-btn {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border: 1px solid #dfd2c8;
  border-radius: 50%;
  background: transparent;
  color: #382e28;
  font-size: 1.55rem;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover,
.close-btn:focus-visible {
  border-color: #ee9152;
  color: #ee9152;
  outline: none;
}

[data-theme='dark'] .close-btn {
  border-color: #444;
  color: #f0e0d8;
}

.popup-body {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  padding: 1.6rem 1.8rem 1.8rem;
}

.popup-description {
  margin: 0;
  color: #62564f;
  font-size: 1rem;
  line-height: 1.75;
  white-space: pre-line;
}

[data-theme='dark'] .popup-description {
  color: #bdb0a8;
}

.tech-stack h3 {
  margin: 0 0 0.65rem;
  color: #382e28;
  font-size: 0.88rem;
}

[data-theme='dark'] .tech-stack h3 {
  color: #f0e0d8;
}

.tech-list,
.links-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tech-badge {
  padding: 0.35rem 0.7rem;
  border: 1px solid rgba(238, 145, 82, 0.25);
  border-radius: 999px;
  background: rgba(238, 145, 82, 0.11);
  color: #9b552d;
  font-size: 0.76rem;
  font-weight: 700;
}

[data-theme='dark'] .tech-badge {
  color: #f2b689;
}

.link-btn {
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: #ee9152;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease;
}

.link-btn:hover,
.link-btn:focus-visible {
  background: #d77d42;
  outline: none;
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

@media (max-width: 640px) {
  .popup-overlay {
    align-items: end;
    padding: 0;
  }

  .popup-content {
    width: 100%;
    max-height: 92vh;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 16px 16px 0 0;
  }

  .popup-header,
  .popup-body {
    padding-right: 1.2rem;
    padding-left: 1.2rem;
  }
}
</style>
