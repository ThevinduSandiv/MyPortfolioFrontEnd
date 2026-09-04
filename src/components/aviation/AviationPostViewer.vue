<template>
  <div class="viewer-overlay" @click.self="closeViewer">
    <article
      ref="dialogRef"
      class="viewer-dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`aviation-viewer-${postData.post_id}`"
      tabindex="-1"
      @keydown="trapFocus"
    >
      <button ref="closeButtonRef" type="button" class="close-button" aria-label="Close post" @click="closeViewer">
        &times;
      </button>

      <section class="media-panel" aria-label="Post media">
        <div class="media-stage">
          <template v-if="activeMedia && !failedMedia.has(activeMedia.media_id)">
            <img
              v-if="activeMedia.media_type === 'image'"
              :key="activeMedia.media_id"
              :src="activeMedia.url"
              :alt="`${postData.title}, media ${activeIndex + 1}`"
              @error="handleMediaError(activeMedia)"
            />
            <video
              v-else-if="activeMedia.media_type === 'video'"
              :key="activeMedia.media_id"
              ref="videoRef"
              :src="activeMedia.url"
              controls
              playsinline
              preload="auto"
              @loadstart="markVideoBuffering"
              @waiting="markVideoBuffering"
              @stalled="markVideoBuffering"
              @canplay="markVideoReady"
              @playing="handleVideoPlaying"
              @pause="handleVideoPause"
              @ended="handleVideoPause"
              @error="handleVideoError(activeMedia)"
            ></video>
            <a
              v-else
              :href="activeMedia.url"
              class="document-link"
              target="_blank"
              rel="noopener noreferrer"
            >Open document</a>
          </template>
          <div v-else class="media-empty">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M8 36 56 20 38 40l-4 16-7-13-13 5 3-8-9-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <span>{{ activeMedia ? 'Media unavailable' : 'No media for this post' }}</span>
          </div>

          <div
            v-if="activeMedia?.media_type === 'video' && videoBuffering && !failedMedia.has(activeMedia.media_id)"
            class="video-buffering"
            role="status"
          >
            <span aria-hidden="true"></span>
            Buffering video...
          </div>

          <template v-if="safeMedia.length > 1">
            <button type="button" class="media-nav previous" aria-label="Previous media" @click="showPrevious">
              <span aria-hidden="true">&larr;</span>
            </button>
            <button type="button" class="media-nav next" aria-label="Next media" @click="showNext">
              <span aria-hidden="true">&rarr;</span>
            </button>
            <span class="media-position">{{ activeIndex + 1 }} / {{ safeMedia.length }}</span>
          </template>
        </div>

        <div v-if="safeMedia.length > 1" class="thumbnail-strip" aria-label="Choose media">
          <button
            v-for="(media, index) in safeMedia"
            :key="media.media_id"
            type="button"
            :class="['thumbnail', { active: index === activeIndex }]"
            :aria-label="`Show media ${index + 1}`"
            :aria-current="index === activeIndex ? 'true' : undefined"
            @click="selectMedia(index)"
          >
            <img v-if="media.media_type === 'image'" :src="media.url" alt="" />
            <span v-else-if="media.media_type === 'video'" class="thumbnail-type">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 7 8 5-8 5V7Z"/></svg>
              Video
            </span>
            <span v-else class="thumbnail-type">File</span>
          </button>
        </div>
      </section>

      <section class="content-panel">
        <span class="viewer-eyebrow">Aviation {{ postData.post_type }}</span>
        <h2 :id="`aviation-viewer-${postData.post_id}`">{{ postData.title }}</h2>

        <div class="post-meta">
          <time v-if="displayDateValue" :datetime="displayDateValue">{{ formattedDate }}</time>
          <span v-if="postData.location">{{ postData.location }}</span>
        </div>

        <p v-if="postData.excerpt" class="excerpt">{{ postData.excerpt }}</p>

        <div v-if="detailLoading" class="detail-state" role="status">
          <span class="detail-spinner" aria-hidden="true"></span>
          <p>Loading the full post...</p>
        </div>
        <div v-else-if="detailError" class="detail-state error" role="alert">
          <p>{{ detailError }}</p>
          <button type="button" @click="loadDetail">Try again</button>
        </div>
        <div v-else-if="renderedContent" class="story-content" v-html="renderedContent"></div>

        <div v-if="postData.tags?.length" class="viewer-tags" aria-label="Post tags">
          <span v-for="tag in postData.tags" :key="tag">#{{ tag }}</span>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { api } from '@/services/api';
import { renderMarkdown } from '@/utils/markdown';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'refreshed', 'detail-error']);
const dialogRef = ref(null);
const closeButtonRef = ref(null);
const videoRef = ref(null);
const normalizePost = (post = {}) => ({
  ...post,
  tags: Array.isArray(post.tags) ? post.tags : [],
  media: Array.isArray(post.media) ? post.media : []
});
const postData = ref(normalizePost(props.post));
const activeIndex = ref(0);
const failedMedia = ref(new Set());
const detailLoading = ref(true);
const detailError = ref('');
const videoBuffering = ref(true);
const refreshAttempts = new Set();
let detailController = null;
let previousBodyOverflow = '';
let previouslyFocused = null;
let viewerClosing = false;
const playbackSource = `aviation-viewer-${props.post.post_id}`;

const safeMedia = computed(() => Array.isArray(postData.value.media) ? postData.value.media : []);
const activeMedia = computed(() => safeMedia.value[activeIndex.value] || null);
const renderedContent = computed(() => renderMarkdown(postData.value.content_markdown));
const displayDateValue = computed(() => postData.value.event_date || postData.value.published_at || '');
const formattedDate = computed(() => {
  if (!displayDateValue.value) return '';
  const rawDate = displayDateValue.value;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? `${rawDate}T00:00:00` : rawDate);
  return Number.isNaN(date.getTime())
    ? rawDate
    : new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
});

const pauseVideo = () => videoRef.value?.pause?.();

const releaseVideo = () => {
  const video = videoRef.value;
  if (!video) return;
  video.pause?.();
  video.removeAttribute('src');
  video.load?.();
};

const markVideoBuffering = () => {
  videoBuffering.value = true;
};

const markVideoReady = () => {
  videoBuffering.value = false;
};

const setBackgroundPlaybackState = (active) => {
  window.dispatchEvent(new CustomEvent('portfolio-media-playback', {
    detail: { active, source: playbackSource }
  }));
};

const handleVideoPlaying = () => {
  markVideoReady();
  setBackgroundPlaybackState(true);
};

const handleVideoPause = () => {
  setBackgroundPlaybackState(false);
};

const handleVideoError = (media) => {
  setBackgroundPlaybackState(false);
  handleMediaError(media);
};

const selectMedia = (index) => {
  setBackgroundPlaybackState(false);
  pauseVideo();
  activeIndex.value = index;
  videoBuffering.value = safeMedia.value[index]?.media_type === 'video';
};

const showPrevious = () => selectMedia((activeIndex.value - 1 + safeMedia.value.length) % safeMedia.value.length);
const showNext = () => selectMedia((activeIndex.value + 1) % safeMedia.value.length);

const detailErrorMessage = (error) => error?.status === 404
  ? 'This aviation post is no longer available.'
  : error?.message || 'The full post could not be loaded.';

const mergeDetailWithoutResettingMedia = (detail) => {
  const normalizedDetail = normalizePost(detail);
  const currentMediaById = new Map(
    safeMedia.value.map((media) => [media.media_id, media])
  );

  return {
    ...normalizedDetail,
    media: normalizedDetail.media.map((media) => {
      const currentMedia = currentMediaById.get(media.media_id);
      return currentMedia?.url
        ? { ...media, url: currentMedia.url }
        : media;
    })
  };
};

const loadDetail = async () => {
  if (!postData.value.post_id) return;
  detailController?.abort();
  const controller = new AbortController();
  detailController = controller;
  detailLoading.value = true;
  detailError.value = '';

  try {
    const detail = mergeDetailWithoutResettingMedia(
      await api.getAviationPostById(postData.value.post_id, controller.signal)
    );
    if (controller.signal.aborted) return;
    postData.value = detail;
    activeIndex.value = Math.min(activeIndex.value, Math.max(0, detail.media.length - 1));
    emit('refreshed', detail);
  } catch (error) {
    if (error?.name === 'AbortError') return;
    detailError.value = detailErrorMessage(error);
    emit('detail-error', detailError.value);
  } finally {
    if (detailController === controller) {
      detailController = null;
      detailLoading.value = false;
    }
  }
};

const handleMediaError = async (media) => {
  if (viewerClosing || !media?.media_id) return;
  videoBuffering.value = false;
  if (refreshAttempts.has(media.media_id)) {
    failedMedia.value = new Set([...failedMedia.value, media.media_id]);
    return;
  }

  refreshAttempts.add(media.media_id);
  const controller = new AbortController();
  detailController?.abort();
  detailController = controller;
  try {
    const refreshed = normalizePost(await api.getAviationPostById(postData.value.post_id, controller.signal));
    const refreshedMedia = refreshed.media?.find((item) => item.media_id === media.media_id);
    postData.value = refreshed;
    emit('refreshed', refreshed);
    if (!refreshedMedia || refreshedMedia.url === media.url) {
      failedMedia.value = new Set([...failedMedia.value, media.media_id]);
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
    failedMedia.value = new Set([...failedMedia.value, media.media_id]);
  } finally {
    if (detailController === controller) {
      detailController = null;
      detailLoading.value = false;
    }
  }
};

const closeViewer = () => {
  viewerClosing = true;
  setBackgroundPlaybackState(false);
  releaseVideo();
  emit('close');
};

const focusableElements = () => Array.from(dialogRef.value?.querySelectorAll(
  'button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])'
) || []);

const trapFocus = (event) => {
  if (event.key !== 'Tab') return;
  const elements = focusableElements();
  if (!elements.length) return;
  const first = elements[0];
  const last = elements[elements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeViewer();
  } else if (event.key === 'ArrowLeft' && safeMedia.value.length > 1) {
    showPrevious();
  } else if (event.key === 'ArrowRight' && safeMedia.value.length > 1) {
    showNext();
  }
};

watch(
  () => props.post,
  (post) => {
    const changedPost = postData.value.post_id !== post.post_id;
    postData.value = normalizePost(post);
    if (changedPost) {
      activeIndex.value = 0;
      failedMedia.value = new Set();
      refreshAttempts.clear();
      loadDetail();
    }
  }
);

onMounted(async () => {
  previouslyFocused = document.activeElement;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', handleKeydown);
  await nextTick();
  closeButtonRef.value?.focus();
  loadDetail();
});

onBeforeUnmount(() => {
  detailController?.abort();
  setBackgroundPlaybackState(false);
  releaseVideo();
  document.body.style.overflow = previousBodyOverflow;
  window.removeEventListener('keydown', handleKeydown);
  previouslyFocused?.focus?.();
});
</script>

<style scoped>
.viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(17, 12, 10, 0.82);
  animation: viewerFade 0.22s ease-out;
}

.viewer-dialog {
  position: relative;
  display: grid;
  width: min(1220px, 96vw);
  height: min(90vh, 860px);
  height: min(90dvh, 860px);
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.78fr);
  grid-template-rows: minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid rgba(242, 182, 137, 0.3);
  border-radius: 26px;
  background: var(--surface-glass-strong);
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.46);
  outline: none;
  animation: viewerRise 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.close-button {
  position: absolute;
  z-index: 6;
  top: 1rem;
  right: 1rem;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 50%;
  background: rgba(25, 17, 13, 0.7);
  color: white;
  font-size: 1.7rem;
  line-height: 1;
  backdrop-filter: blur(12px);
}

.close-button:hover { background: #ee9152; }

.media-panel {
  display: flex;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: #15110f;
}

.media-stage {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 0;
  min-width: 0;
  flex: 1;
  place-items: center;
  overflow: hidden;
  contain: layout paint;
}

.media-stage img,
.media-stage video {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-width: none;
  max-height: none;
  object-fit: contain;
  background: #0d0b0a;
}

.video-buffering {
  position: absolute;
  z-index: 3;
  inset: 50% auto auto 50%;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 999px;
  background: rgba(18, 13, 11, 0.82);
  color: white;
  font-size: 0.75rem;
  font-weight: 750;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.video-buffering span {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #f2b689;
  border-radius: 50%;
  animation: detailSpin 0.75s linear infinite;
}

.document-link {
  padding: 0.8rem 1.1rem;
  border-radius: 999px;
  background: var(--gradient-accent);
  color: white;
  font-weight: 800;
}

.media-empty {
  display: grid;
  gap: 1rem;
  place-items: center;
  color: rgba(255, 242, 232, 0.65);
}

.media-empty svg { width: 96px; }

.media-nav {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 50%;
  background: rgba(25, 17, 13, 0.62);
  color: white;
  font-size: 1.15rem;
  transform: translateY(-50%);
  backdrop-filter: blur(10px);
}

.media-nav:hover { background: #ee9152; }
.media-nav.previous { left: 1rem; }
.media-nav.next { right: 1rem; }

.media-position {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: rgba(25, 17, 13, 0.68);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
}

.thumbnail-strip {
  display: flex;
  height: 98px;
  flex: 0 0 98px;
  gap: 0.65rem;
  padding: 0.75rem;
  overflow-x: auto;
  background: #100d0c;
  scrollbar-width: thin;
}

.thumbnail {
  width: 88px;
  min-width: 88px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 11px;
  background: #2d2521;
  color: white;
  opacity: 0.62;
}

.thumbnail.active { border-color: #f2b689; opacity: 1; }
.thumbnail img { width: 100%; height: 100%; display: block; object-fit: cover; }

.thumbnail-type {
  display: grid;
  height: 100%;
  place-items: center;
  align-content: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
}

.thumbnail-type svg { width: 22px; }

.content-panel {
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 3.2rem 2.25rem 2.3rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  background:
    radial-gradient(circle at 90% 5%, rgba(242, 182, 137, 0.18), transparent 28%),
    var(--surface-glass-strong);
}

.viewer-eyebrow {
  color: var(--accent-secondary);
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.content-panel h2 {
  margin: 0.6rem 0 1rem;
  font-size: clamp(2rem, 4vw, 3.35rem);
  line-height: 0.99;
  letter-spacing: -0.04em;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
}

.post-meta span::before {
  content: '·';
  margin-right: 1rem;
  color: var(--accent-secondary);
}

.excerpt {
  margin: 1.4rem 0 0;
  color: var(--text-dark);
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.7;
}

.detail-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.35rem;
  padding: 1rem;
  border: 1px solid rgba(238, 145, 82, 0.2);
  border-radius: 14px;
  background: rgba(238, 145, 82, 0.07);
  color: var(--text-secondary);
  font-size: 0.84rem;
}

.detail-state p { margin: 0; }

.detail-state.error {
  align-items: flex-start;
  flex-direction: column;
}

.detail-state button {
  padding: 0.5rem 0.8rem;
  border: 0;
  border-radius: 999px;
  background: var(--gradient-accent);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
}

.detail-spinner {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border: 2px solid rgba(238, 145, 82, 0.25);
  border-top-color: var(--accent-secondary);
  border-radius: 50%;
  animation: detailSpin 0.8s linear infinite;
}

.story-content {
  margin-top: 1.35rem;
  color: var(--text-secondary);
  font-size: 0.94rem;
  line-height: 1.78;
}

.story-content :deep(p) { margin: 0 0 1rem; }
.story-content :deep(h2) { margin: 1.7rem 0 0.7rem; font-size: 1.55rem; line-height: 1.15; }
.story-content :deep(a) { text-decoration: underline; }

.viewer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.6rem;
}

.viewer-tags span {
  padding: 0.38rem 0.68rem;
  border: 1px solid rgba(238, 145, 82, 0.25);
  border-radius: 999px;
  background: rgba(238, 145, 82, 0.1);
  color: #a55c31;
  font-size: 0.72rem;
  font-weight: 750;
}

[data-theme='dark'] .viewer-tags span { color: #f2b689; }

@keyframes viewerFade { from { opacity: 0; } }
@keyframes viewerRise { from { opacity: 0; transform: translateY(18px) scale(0.985); } }
@keyframes detailSpin { to { transform: rotate(360deg); } }

@media (max-width: 860px) {
  .viewer-overlay { align-items: end; padding: 0; }

  .viewer-dialog {
    width: 100%;
    height: 94vh;
    height: 94dvh;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    border-radius: 24px 24px 0 0;
  }

  .media-panel {
    height: clamp(280px, 56vh, 540px);
    height: clamp(280px, 56dvh, 540px);
    min-height: 0;
    overflow: hidden;
  }
  .media-stage { min-height: 0; }
  .content-panel { height: auto; overflow: visible; padding: 2rem 1.4rem 2.4rem; }
  .close-button { position: fixed; top: 1rem; right: 1rem; }
}

@media (max-width: 520px) {
  .media-panel {
    height: clamp(240px, 50vh, 440px);
    height: clamp(240px, 50dvh, 440px);
    min-height: 0;
  }
  .thumbnail-strip { height: 82px; flex-basis: 82px; }
  .thumbnail { width: 72px; min-width: 72px; }
  .media-nav { width: 42px; height: 42px; }
}
</style>
