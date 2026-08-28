<template>
  <section v-if="safeMedia.length" class="media-gallery" aria-label="Media gallery">
    <div class="gallery-heading">
      <h3>Media</h3>
      <span>{{ safeMedia.length }} {{ safeMedia.length === 1 ? 'item' : 'items' }}</span>
    </div>

    <div
      ref="viewportRef"
      class="carousel-viewport"
      :class="{ dragging: isDragging, moving: isOverflowing && !reducedMotion }"
      @pointerdown="startDrag"
      @pointermove="drag"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @focusin="isFocused = true"
      @focusout="isFocused = false"
    >
      <div class="carousel-track">
        <div ref="firstSetRef" class="media-set">
          <button
            v-for="media in safeMedia"
            :key="media.media_id"
            type="button"
            class="media-card"
            :disabled="isFailed(media)"
            :aria-label="`Open ${mediaLabel(media)}`"
            @click="openViewer(media)"
          >
            <img
              v-if="isImage(media) && !isFailed(media)"
              :src="media.url"
              :alt="`${title} media preview`"
              loading="lazy"
              @error="handleMediaError(media)"
            />
            <video
              v-else-if="isVideo(media) && !isFailed(media)"
              :src="media.url"
              muted
              playsinline
              preload="metadata"
              @error="handleMediaError(media)"
            />
            <span v-else class="document-preview" aria-hidden="true">
              {{ isFailed(media) ? 'Unavailable' : 'Document' }}
            </span>
            <span v-if="isVideo(media) && !isFailed(media)" class="play-marker" aria-hidden="true">▶</span>
            <span class="media-kind">{{ mediaLabel(media) }}</span>
          </button>
        </div>

        <div v-if="isOverflowing" class="media-set" aria-hidden="true">
          <button
            v-for="media in safeMedia"
            :key="`duplicate-${media.media_id}`"
            type="button"
            tabindex="-1"
            class="media-card"
            :disabled="isFailed(media)"
            @click="openViewer(media)"
          >
            <img
              v-if="isImage(media) && !isFailed(media)"
              :src="media.url"
              alt=""
              loading="lazy"
              @error="handleMediaError(media)"
            />
            <video
              v-else-if="isVideo(media) && !isFailed(media)"
              :src="media.url"
              muted
              playsinline
              preload="metadata"
              @error="handleMediaError(media)"
            />
            <span v-else class="document-preview" aria-hidden="true">
              {{ isFailed(media) ? 'Unavailable' : 'Document' }}
            </span>
            <span v-if="isVideo(media) && !isFailed(media)" class="play-marker" aria-hidden="true">▶</span>
            <span class="media-kind">{{ mediaLabel(media) }}</span>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="selectedMedia"
        class="media-viewer"
        role="presentation"
        @click.self="closeViewer"
      >
        <div
          ref="viewerDialogRef"
          class="viewer-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="`${title} ${mediaLabel(selectedMedia)}`"
          tabindex="-1"
        >
          <button type="button" class="viewer-close" aria-label="Close media viewer" @click="closeViewer">
            &times;
          </button>

          <div class="viewer-stage">
            <img
              v-if="isImage(selectedMedia) && !isFailed(selectedMedia)"
              :src="selectedMedia.url"
              :alt="`${title} media`"
              @error="handleMediaError(selectedMedia)"
            />
            <video
              v-else-if="isVideo(selectedMedia) && !isFailed(selectedMedia)"
              :src="selectedMedia.url"
              controls
              playsinline
              @error="handleMediaError(selectedMedia)"
            />
            <iframe
              v-else-if="!isFailed(selectedMedia)"
              :src="selectedMedia.url"
              :title="`${title} document`"
              @error="handleMediaError(selectedMedia)"
            />
            <div v-else class="viewer-fallback">
              <p>This media could not be loaded.</p>
            </div>
          </div>

          <div v-if="isDocument(selectedMedia)" class="viewer-actions">
            <a :href="selectedMedia.url" target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  media: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Portfolio',
  },
});

const emit = defineEmits(['media-error', 'viewer-change']);

const viewportRef = ref(null);
const firstSetRef = ref(null);
const viewerDialogRef = ref(null);
const selectedMediaId = ref(null);
const isOverflowing = ref(false);
const isPointerDown = ref(false);
const isDragging = ref(false);
const isHovered = ref(false);
const isFocused = ref(false);
const reducedMotion = ref(false);
const failedUrls = ref(new Set());

let animationFrame;
let resizeObserver;
let motionQuery;
let previousFrameTime = 0;
let automaticScrollPosition = 0;
let dragStartX = 0;
let dragStartScroll = 0;
let dragDistance = 0;
let suppressClick = false;
let previouslyFocusedElement = null;

const safeMedia = computed(() =>
  (Array.isArray(props.media) ? props.media : []).filter(
    (item) => item && item.media_id && typeof item.url === 'string' && item.url
  )
);

const selectedMedia = computed(() =>
  safeMedia.value.find((item) => item.media_id === selectedMediaId.value) || null
);

const mediaType = (media) => String(media?.media_type || '').toLowerCase();
const isImage = (media) => mediaType(media) === 'image';
const isVideo = (media) => mediaType(media) === 'video';
const isDocument = (media) => !isImage(media) && !isVideo(media);
const mediaLabel = (media) => {
  if (isImage(media)) return 'image';
  if (isVideo(media)) return 'video';
  return 'document';
};
const failureKey = (media) => `${media.media_id}:${media.url}`;
const isFailed = (media) => failedUrls.value.has(failureKey(media));

const handleMediaError = (media) => {
  const key = failureKey(media);
  if (failedUrls.value.has(key)) return;

  failedUrls.value = new Set(failedUrls.value).add(key);
  emit('media-error', media);
};

const measureOverflow = async () => {
  isOverflowing.value = false;
  await nextTick();

  const viewport = viewportRef.value;
  const firstSet = firstSetRef.value;
  if (!viewport || !firstSet) return;

  viewport.scrollLeft = 0;
  automaticScrollPosition = 0;
  isOverflowing.value = firstSet.scrollWidth > viewport.clientWidth + 1;
};

const animate = (time) => {
  const viewport = viewportRef.value;
  const firstSet = firstSetRef.value;
  const paused =
    !isOverflowing.value ||
    reducedMotion.value ||
    isPointerDown.value ||
    isDragging.value ||
    isHovered.value ||
    isFocused.value ||
    Boolean(selectedMedia.value);

  if (viewport && firstSet && !paused) {
    const elapsed = Math.min(time - previousFrameTime, 50);
    automaticScrollPosition += (elapsed / 1000) * 24;
    viewport.scrollLeft = automaticScrollPosition;

    const setWidth = firstSet.offsetWidth;
    if (setWidth && automaticScrollPosition >= setWidth) {
      automaticScrollPosition -= setWidth;
      viewport.scrollLeft = automaticScrollPosition;
    }
  } else if (viewport) {
    automaticScrollPosition = viewport.scrollLeft;
  }

  previousFrameTime = time;
  animationFrame = requestAnimationFrame(animate);
};

const startDrag = (event) => {
  if (!isOverflowing.value || event.button !== 0 || event.isPrimary === false) return;

  isPointerDown.value = true;
  isDragging.value = false;
  dragStartX = event.clientX;
  dragStartScroll = viewportRef.value.scrollLeft;
  dragDistance = 0;
  suppressClick = false;
};

const drag = (event) => {
  if (!isPointerDown.value) return;

  const distance = event.clientX - dragStartX;
  dragDistance = Math.max(dragDistance, Math.abs(distance));

  if (!isDragging.value && dragDistance <= 6) return;

  if (!isDragging.value) {
    isDragging.value = true;
    viewportRef.value.setPointerCapture(event.pointerId);
  }

  event.preventDefault();
  viewportRef.value.scrollLeft = dragStartScroll - distance;
};

const endDrag = (event) => {
  if (!isPointerDown.value && !isDragging.value) return;

  const completedDrag = isDragging.value;

  if (viewportRef.value?.hasPointerCapture(event.pointerId)) {
    viewportRef.value.releasePointerCapture(event.pointerId);
  }

  isPointerDown.value = false;
  isDragging.value = false;
  automaticScrollPosition = viewportRef.value?.scrollLeft || 0;
  suppressClick = completedDrag;
  window.setTimeout(() => {
    suppressClick = false;
  }, 0);
};

const openViewer = async (media) => {
  if (suppressClick || isFailed(media)) return;

  previouslyFocusedElement = document.activeElement;
  selectedMediaId.value = media.media_id;
  emit('viewer-change', true);
  await nextTick();
  viewerDialogRef.value?.focus();
};

const closeViewer = () => {
  selectedMediaId.value = null;
  emit('viewer-change', false);
  nextTick(() => previouslyFocusedElement?.focus?.());
};

const handleKeydown = (event) => {
  if (event.key !== 'Escape' || !selectedMedia.value) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  closeViewer();
};

const handleMotionChange = (event) => {
  reducedMotion.value = event.matches;
};

watch(
  () => safeMedia.value.map((item) => `${item.media_id}:${item.url}`).join('|'),
  () => {
    if (selectedMediaId.value && !selectedMedia.value) closeViewer();
    measureOverflow();
  }
);

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.value = motionQuery.matches;
  motionQuery.addEventListener?.('change', handleMotionChange);

  resizeObserver = new ResizeObserver(measureOverflow);
  if (viewportRef.value) resizeObserver.observe(viewportRef.value);

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  measureOverflow();
  animationFrame = requestAnimationFrame((time) => {
    previousFrameTime = time;
    animate(time);
  });
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame);
  resizeObserver?.disconnect();
  motionQuery?.removeEventListener?.('change', handleMotionChange);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('pointerup', endDrag);
  window.removeEventListener('pointercancel', endDrag);
});
</script>

<style scoped>
.media-gallery {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e8ddd5;
}

[data-theme='dark'] .media-gallery {
  border-top-color: #333;
}

.gallery-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.gallery-heading h3 {
  margin: 0;
  color: #382e28;
  font-size: 1rem;
}

[data-theme='dark'] .gallery-heading h3 {
  color: #f0e0d8;
}

.gallery-heading span {
  color: #8b7355;
  font-size: 0.78rem;
}

.carousel-viewport {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  touch-action: pan-y;
  scrollbar-width: none;
  user-select: none;
}

.carousel-viewport::-webkit-scrollbar {
  display: none;
}

.carousel-viewport:not(.moving) {
  cursor: default;
}

.carousel-viewport.dragging {
  cursor: grabbing;
}

.carousel-track,
.media-set {
  display: flex;
  align-items: stretch;
}

.carousel-track {
  width: max-content;
}

.media-set {
  gap: 0.75rem;
  padding-right: 0.75rem;
}

.media-card {
  position: relative;
  width: 176px;
  height: 108px;
  flex: 0 0 176px;
  padding: 0;
  overflow: hidden;
  border: 1px solid #dfd2c8;
  border-radius: 10px;
  background: #f5eee8;
  color: #382e28;
  cursor: pointer;
}

.media-card:not(:disabled):hover,
.media-card:not(:disabled):focus-visible {
  border-color: #ee9152;
  box-shadow: 0 5px 16px rgba(238, 145, 82, 0.24);
  outline: none;
}

.media-card:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

[data-theme='dark'] .media-card {
  border-color: #3b3734;
  background: #25211f;
  color: #f0e0d8;
}

.media-card img,
.media-card video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.document-preview {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #8b7355;
  font-size: 0.88rem;
  font-weight: 700;
}

.play-marker {
  position: absolute;
  inset: 50% auto auto 50%;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding-left: 2px;
  border-radius: 50%;
  background: rgba(20, 15, 12, 0.72);
  color: white;
  font-size: 0.8rem;
  transform: translate(-50%, -50%);
}

.media-kind {
  position: absolute;
  right: 0.45rem;
  bottom: 0.4rem;
  padding: 0.18rem 0.45rem;
  border-radius: 999px;
  background: rgba(20, 15, 12, 0.72);
  color: white;
  font-size: 0.66rem;
  line-height: 1;
  text-transform: capitalize;
}

.media-viewer {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(13, 11, 10, 0.82);
  backdrop-filter: blur(3px);
}

.viewer-dialog {
  position: relative;
  display: flex;
  width: min(1000px, 94vw);
  height: min(720px, 88vh);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  background: #171411;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  outline: none;
}

.viewer-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.64);
  color: white;
  font-size: 1.55rem;
  line-height: 1;
  cursor: pointer;
}

.viewer-close:hover,
.viewer-close:focus-visible {
  border-color: #ee9152;
  outline: none;
}

.viewer-stage {
  display: grid;
  min-height: 0;
  flex: 1;
  place-items: center;
}

.viewer-stage img,
.viewer-stage video {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer-stage iframe {
  width: 100%;
  height: 100%;
  border: 0;
  background: white;
}

.viewer-fallback {
  color: #f0e0d8;
  text-align: center;
}

.viewer-actions {
  display: flex;
  justify-content: center;
  padding: 0.8rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.viewer-actions a {
  padding: 0.55rem 1rem;
  border-radius: 7px;
  background: #ee9152;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 640px) {
  .media-card {
    width: 148px;
    height: 94px;
    flex-basis: 148px;
  }

  .media-viewer {
    padding: 0.75rem;
  }

  .viewer-dialog {
    width: 100%;
    height: min(78vh, 620px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .media-card {
    scroll-behavior: auto;
  }
}
</style>
