<template>
  <div class="popup-overlay" @click.self="closePopup">
    <article
      ref="dialogRef"
      class="popup-content"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`achievement-title-${achievementData.achievement_id}`"
      :aria-busy="isRefreshing"
      tabindex="-1"
    >
      <header class="popup-header">
        <div>
          <span class="popup-eyebrow">Achievement</span>
          <h2 :id="`achievement-title-${achievementData.achievement_id}`" class="popup-title">
            {{ achievementData.achievement_title }}
          </h2>
          <p v-if="formattedDate" class="achievement-date">{{ formattedDate }}</p>
        </div>
        <button type="button" class="close-btn" aria-label="Close achievement" @click="closePopup">
          &times;
        </button>
      </header>

      <div class="popup-body">
        <p class="achievement-description">{{ achievementData.achievement_description }}</p>

        <MediaGallery
          :media="media"
          :title="achievementData.achievement_title"
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
  achievement: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const dialogRef = ref(null);
const achievementData = ref({ ...props.achievement });
const isRefreshing = ref(false);
const viewerOpen = ref(false);
const refreshAttempts = new Set();
let previousBodyOverflow = '';

const media = computed(() =>
  Array.isArray(achievementData.value.media) ? achievementData.value.media : []
);

const formattedDate = computed(() => {
  if (!achievementData.value.earned_ts) return '';

  const date = new Date(achievementData.value.earned_ts);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const refreshExpiredMedia = async (failedMedia) => {
  if (
    !failedMedia?.media_id ||
    refreshAttempts.has(failedMedia.media_id) ||
    isRefreshing.value
  ) return;

  refreshAttempts.add(failedMedia.media_id);

  try {
    isRefreshing.value = true;
    const response = await api.getAchievements(5);
    const freshAchievement = (response.achievements || []).find(
      (item) => item.achievement_id === achievementData.value.achievement_id
    );
    if (freshAchievement) achievementData.value = freshAchievement;
  } catch (_) {
    // Keep the existing achievement visible if refreshing the URL fails.
  } finally {
    isRefreshing.value = false;
  }
};

const closePopup = () => emit('close');

const handleKeydown = (event) => {
  if (event.key === 'Escape' && !viewerOpen.value && !event.defaultPrevented) {
    event.preventDefault();
    closePopup();
  }
};

watch(
  () => props.achievement,
  (achievement) => {
    achievementData.value = { ...achievement };
    refreshAttempts.clear();
  }
);

onMounted(async () => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', handleKeydown);
  await nextTick();
  dialogRef.value?.focus();
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
  width: min(780px, 94vw);
  max-height: min(86vh, 740px);
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 244, 239, 0.98));
  backdrop-filter: blur(10px);
}

[data-theme='dark'] .popup-header {
  border-bottom-color: #333;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(31, 28, 26, 0.98));
}

.popup-eyebrow {
  display: block;
  margin-bottom: 0.3rem;
  color: #10a271;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.popup-title {
  margin: 0;
  color: #382e28;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  line-height: 1.2;
}

[data-theme='dark'] .popup-title {
  color: #f0e0d8;
}

.achievement-date {
  margin: 0.45rem 0 0;
  color: #8b7355;
  font-size: 0.86rem;
  font-weight: 600;
}

[data-theme='dark'] .achievement-date {
  color: #d4b5a0;
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

.achievement-description {
  margin: 0;
  color: #62564f;
  font-size: 1rem;
  line-height: 1.75;
  white-space: pre-line;
}

[data-theme='dark'] .achievement-description {
  color: #bdb0a8;
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
