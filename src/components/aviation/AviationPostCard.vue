<template>
  <article
    :class="[
      'aviation-card',
      `type-${post.post_type}`,
      { featured: post.featured, portrait: isPortrait }
    ]"
    role="button"
    tabindex="0"
    :aria-label="`${post.post_type}: ${post.title}`"
    @click="emit('open', post)"
    @keydown.enter="emit('open', post)"
    @keydown.space.prevent="emit('open', post)"
  >
    <div class="card-media" :class="{ empty: !primaryMedia || mediaFailed }">
      <template v-if="primaryMedia && !mediaFailed">
        <img
          v-if="primaryMedia.media_type === 'image'"
          :src="primaryMedia.url"
          :alt="post.title"
          loading="lazy"
          @load="measureMedia"
          @error="handleMediaError(primaryMedia)"
        />
        <video
          v-else-if="primaryMedia.media_type === 'video'"
          :src="primaryMedia.url"
          :poster="posterImage?.url"
          muted
          playsinline
          preload="metadata"
          aria-hidden="true"
          @loadedmetadata="measureMedia"
          @error="handleMediaError(primaryMedia)"
        ></video>
        <div v-else class="document-preview">
          <span>Open media</span>
        </div>
      </template>
      <div v-else class="media-fallback" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none">
          <path d="M8 36 56 20 38 40l-4 16-7-13-13 5 3-8-9-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="media-shade"></div>
      <span class="post-type">{{ typeLabel }}</span>
      <span v-if="primaryMedia?.media_type === 'video'" class="play-indicator" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 7 8 5-8 5V7Z"/></svg>
      </span>
      <span v-if="post.media?.length > 1" class="media-count">{{ post.media.length }} media</span>
    </div>

    <div class="card-copy">
      <div class="card-meta">
        <time v-if="displayDateValue" :datetime="displayDateValue">{{ formattedDate }}</time>
        <span v-if="post.location">{{ post.location }}</span>
      </div>
      <h2>{{ post.title }}</h2>
      <p>{{ post.excerpt }}</p>
      <div class="card-footer">
        <div class="tag-list" aria-label="Post tags">
          <span v-for="tag in visibleTags" :key="tag">#{{ tag }}</span>
        </div>
        <span v-if="post.post_type === 'article'" class="read-action">Read more <span aria-hidden="true">&rarr;</span></span>
        <span v-else class="read-action">View <span aria-hidden="true">&rarr;</span></span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['open', 'media-error']);
const isPortrait = ref(false);
const mediaFailed = ref(false);

const primaryMedia = computed(() => Array.isArray(props.post.media) ? props.post.media[0] : null);
const posterImage = computed(() =>
  Array.isArray(props.post.media)
    ? props.post.media.find((item) => item.media_type === 'image')
    : null
);
const visibleTags = computed(() => Array.isArray(props.post.tags) ? props.post.tags.slice(0, 3) : []);
const typeLabel = computed(() => ({ moment: 'Moment', story: 'Story', article: 'Article' })[props.post.post_type] || 'Journal');
const displayDateValue = computed(() => props.post.event_date || props.post.published_at || '');
const formattedDate = computed(() => {
  if (!displayDateValue.value) return '';
  const rawDate = displayDateValue.value;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? `${rawDate}T00:00:00` : rawDate);
  return Number.isNaN(date.getTime())
    ? rawDate
    : new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
});

const measureMedia = (event) => {
  const element = event.currentTarget;
  const width = element.naturalWidth || element.videoWidth || 0;
  const height = element.naturalHeight || element.videoHeight || 0;
  isPortrait.value = height > width * 1.12;
};

const handleMediaError = (media) => {
  mediaFailed.value = true;
  emit('media-error', { post: props.post, media });
};

watch(() => primaryMedia.value?.url, () => {
  mediaFailed.value = false;
});
</script>

<style scoped>
.aviation-card {
  grid-column: span 4;
  align-self: start;
  overflow: hidden;
  border: 1px solid rgba(139, 115, 85, 0.18);
  border-radius: 24px;
  background: var(--surface-glass-strong);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  outline: none;
  backdrop-filter: blur(18px);
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
}

.aviation-card:hover,
.aviation-card:focus-visible {
  transform: translateY(-8px);
  border-color: rgba(238, 145, 82, 0.62);
  box-shadow: var(--shadow-hover);
}

.aviation-card.featured {
  grid-column: span 8;
}

.aviation-card.type-story:not(.featured),
.aviation-card.type-article:not(.featured) {
  grid-column: span 6;
}

.aviation-card.portrait:not(.featured) {
  grid-column: span 4;
}

.card-media {
  position: relative;
  min-height: 240px;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #251d18;
}

.featured .card-media {
  aspect-ratio: 16 / 8.5;
  min-height: 330px;
}

.portrait .card-media {
  aspect-ratio: 4 / 5;
}

.card-media img,
.card-media video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.aviation-card:hover .card-media img,
.aviation-card:hover .card-media video {
  transform: scale(1.035);
}

.card-media video {
  pointer-events: none;
}

.media-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 14, 10, 0.06) 45%, rgba(20, 14, 10, 0.64) 100%);
  pointer-events: none;
}

.post-type,
.media-count {
  position: absolute;
  z-index: 1;
  top: 1rem;
  padding: 0.42rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 999px;
  background: rgba(29, 20, 15, 0.62);
  color: #fff8f2;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
}

.post-type { left: 1rem; }
.media-count { right: 1rem; letter-spacing: 0.04em; text-transform: none; }

.play-indicator {
  position: absolute;
  z-index: 1;
  inset: 50% auto auto 50%;
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 50%;
  background: rgba(29, 20, 15, 0.56);
  color: white;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(10px);
}

.play-indicator svg { width: 26px; height: 26px; }

.media-fallback,
.document-preview {
  width: 100%;
  height: 100%;
  display: grid;
  min-height: inherit;
  place-items: center;
  background:
    radial-gradient(circle at 70% 25%, rgba(242, 182, 137, 0.32), transparent 34%),
    linear-gradient(145deg, #382e28, #191310);
  color: rgba(255, 245, 236, 0.72);
}

.media-fallback svg { width: 74px; }

.card-copy {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.35rem 1.4rem 1.45rem;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 1rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 650;
}

.card-meta span::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 3px;
  margin: 0 0.5rem 0.18rem 0;
  border-radius: 50%;
  background: var(--accent-secondary);
}

.card-copy h2 {
  margin: 0;
  font-size: clamp(1.45rem, 2.6vw, 2.15rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.card-copy p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.94rem;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.2rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.65rem;
  color: #a55c31;
  font-size: 0.72rem;
  font-weight: 700;
}

[data-theme='dark'] .tag-list { color: #f2b689; }

.read-action {
  flex: none;
  color: var(--text-dark);
  font-size: 0.77rem;
  font-weight: 800;
}

@media (max-width: 1020px) {
  .aviation-card,
  .aviation-card.portrait:not(.featured) { grid-column: span 6; }
  .aviation-card.featured { grid-column: span 12; }
}

@media (max-width: 680px) {
  .aviation-card,
  .aviation-card.featured,
  .aviation-card.type-story:not(.featured),
  .aviation-card.type-article:not(.featured),
  .aviation-card.portrait:not(.featured) { grid-column: 1 / -1; }

  .aviation-card { border-radius: 19px; }
  .card-media, .featured .card-media { min-height: 230px; aspect-ratio: 4 / 3; }
  .portrait .card-media { aspect-ratio: 4 / 5; }
  .card-copy { padding: 1.15rem; }
}
</style>
