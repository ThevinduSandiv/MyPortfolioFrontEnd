<template>
  <article ref="articleRef" class="article-reader">
    <button type="button" class="back-button" @click="emit('back')">
      <span aria-hidden="true">&larr;</span> Back to journal
    </button>

    <header class="article-header">
      <span class="article-eyebrow">Aviation article</span>
      <h1>{{ postData.title }}</h1>
      <p v-if="postData.excerpt" class="article-excerpt">{{ postData.excerpt }}</p>
      <div class="article-meta">
        <time v-if="displayDateValue" :datetime="displayDateValue">{{ formattedDate }}</time>
        <span v-if="postData.location">{{ postData.location }}</span>
        <span>{{ readTime }} min read</span>
      </div>
    </header>

    <div v-if="detailLoading" class="article-state" role="status">
      <span class="article-spinner" aria-hidden="true"></span>
      <h2>Loading article...</h2>
    </div>

    <div v-else-if="detailError" class="article-state error" role="alert">
      <h2>{{ detailErrorTitle }}</h2>
      <p>{{ detailError }}</p>
      <div class="article-state-actions">
        <button type="button" class="retry-button" @click="loadDetail">Try again</button>
        <button type="button" class="back-button" @click="emit('back')">Back to journal</button>
      </div>
    </div>

    <template v-else>
      <div class="article-cover" :class="{ empty: !coverMedia || coverFailed }">
        <img
          v-if="coverMedia?.media_type === 'image' && !coverFailed"
          :src="coverMedia.url"
          :alt="postData.title"
          @error="handleMediaError(coverMedia)"
        />
        <video
          v-else-if="coverMedia?.media_type === 'video' && !coverFailed"
          :src="coverMedia.url"
          controls
          playsinline
          preload="metadata"
          @error="handleMediaError(coverMedia)"
        ></video>
        <div v-else class="article-fallback" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M8 36 56 20 38 40l-4 16-7-13-13 5 3-8-9-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div class="article-layout">
        <aside class="article-aside">
          <span class="aside-label">Filed under</span>
          <div class="article-tags">
            <span v-for="tag in postData.tags" :key="tag">#{{ tag }}</span>
          </div>
        </aside>
        <div v-if="renderedContent" class="article-content" v-html="renderedContent"></div>
        <p v-else class="article-content empty-copy">This article does not have any written content yet.</p>
      </div>

      <section v-if="remainingMedia.length" class="article-media">
        <MediaGallery
          :media="remainingMedia"
          :title="postData.title"
          @media-error="handleMediaError"
        />
      </section>

      <footer class="article-footer">
        <p>More moments from the aviation journal are waiting in the feed.</p>
        <button type="button" class="back-button bottom" @click="emit('back')">
          <span aria-hidden="true">&larr;</span> Return to Aviation Adventure
        </button>
      </footer>
    </template>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { api } from '@/services/api';
import MediaGallery from '@/components/MediaGallery.vue';
import { calculateReadTime, renderMarkdown } from '@/utils/markdown';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back', 'refreshed', 'detail-error']);

const normalizePost = (post = {}) => ({
  ...post,
  tags: Array.isArray(post.tags) ? post.tags : [],
  media: Array.isArray(post.media) ? post.media : []
});

const postData = ref(normalizePost(props.post));
const detailLoading = ref(true);
const detailError = ref('');
const detailStatus = ref(null);
const failedMediaIds = ref(new Set());
const mediaRefreshAttempts = new Set();
let detailController = null;
let mediaController = null;

const coverMedia = computed(() => postData.value.media[0] || null);
const remainingMedia = computed(() => postData.value.media.slice(1));
const coverFailed = computed(() => coverMedia.value
  ? failedMediaIds.value.has(coverMedia.value.media_id)
  : false);
const renderedContent = computed(() => renderMarkdown(postData.value.content_markdown));
const readTime = computed(() => calculateReadTime(postData.value.content_markdown));
const displayDateValue = computed(() => postData.value.event_date || postData.value.published_at || '');
const formattedDate = computed(() => {
  if (!displayDateValue.value) return '';
  const value = displayDateValue.value;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
});
const detailErrorTitle = computed(() => detailStatus.value === 404
  ? 'Article not found'
  : 'The article could not be loaded');

const loadDetail = async () => {
  detailController?.abort();
  detailController = new AbortController();
  const controller = detailController;

  detailLoading.value = true;
  detailError.value = '';
  detailStatus.value = null;

  try {
    const detail = postData.value.slug
      ? await api.getAviationPostBySlug(postData.value.slug, controller.signal)
      : await api.getAviationPostById(postData.value.post_id, controller.signal);

    postData.value = normalizePost(detail);
    emit('refreshed', postData.value);
  } catch (error) {
    if (error?.name === 'AbortError') return;
    detailStatus.value = error?.status ?? null;
    detailError.value = error?.status === 404
      ? 'This aviation article is no longer available.'
      : (error?.message || 'Please try again in a moment.');
    emit('detail-error', detailError.value);
  } finally {
    if (detailController === controller) {
      detailController = null;
      detailLoading.value = false;
    }
  }
};

const markMediaFailed = (mediaId) => {
  failedMediaIds.value = new Set([...failedMediaIds.value, mediaId]);
};

const handleMediaError = async (media) => {
  const mediaId = media?.media_id;
  const postId = postData.value.post_id;
  if (!mediaId || !postId) return;

  if (mediaRefreshAttempts.has(mediaId)) {
    markMediaFailed(mediaId);
    return;
  }

  mediaRefreshAttempts.add(mediaId);
  const staleUrl = media.url;
  mediaController?.abort();
  mediaController = new AbortController();
  const controller = mediaController;

  try {
    const freshPost = normalizePost(await api.getAviationPostById(postId, controller.signal));
    const freshMedia = freshPost.media.find((item) => item.media_id === mediaId);
    postData.value = freshPost;
    emit('refreshed', freshPost);

    if (!freshMedia || freshMedia.url === staleUrl) markMediaFailed(mediaId);
  } catch (error) {
    if (error?.name !== 'AbortError') markMediaFailed(mediaId);
  } finally {
    if (mediaController === controller) mediaController = null;
  }
};

watch(() => props.post, (nextPost, previousPost) => {
  const changedArticle = nextPost?.post_id !== previousPost?.post_id
    || nextPost?.slug !== previousPost?.slug;
  postData.value = normalizePost(nextPost);

  if (changedArticle) {
    failedMediaIds.value = new Set();
    mediaRefreshAttempts.clear();
    loadDetail();
  }
});

onMounted(loadDetail);
onBeforeUnmount(() => {
  detailController?.abort();
  mediaController?.abort();
});
</script>

<style scoped>
.article-reader {
  width: min(1120px, 100%);
  margin: 0 auto;
  animation: articleIn 0.45s ease both;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.68rem 0.95rem;
  border: 1px solid rgba(139, 115, 85, 0.25);
  border-radius: 999px;
  background: var(--surface-glass);
  color: var(--text-dark);
  font-size: 0.8rem;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(111, 73, 44, 0.08);
}

.back-button:hover { border-color: var(--accent-secondary); transform: translateY(-2px); }

.article-header {
  max-width: 900px;
  margin: 3.4rem auto 2.4rem;
  text-align: center;
}

.article-eyebrow {
  color: var(--accent-secondary);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.article-header h1 {
  margin: 0.65rem 0 1.2rem;
  font-size: clamp(3rem, 8vw, 6.3rem);
  line-height: 0.92;
  letter-spacing: -0.055em;
}

.article-excerpt {
  max-width: 720px;
  margin: 0 auto;
  color: var(--text-secondary);
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  line-height: 1.7;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 1rem;
  margin-top: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
}

.article-meta > * + *::before {
  content: '\00b7';
  margin-right: 1rem;
  color: var(--accent-secondary);
}

.article-state {
  display: grid;
  min-height: 360px;
  place-items: center;
  align-content: center;
  gap: 0.8rem;
  padding: 3rem 1.5rem;
  border: 1px dashed rgba(139, 115, 85, 0.28);
  border-radius: 30px;
  background: var(--surface-glass);
  text-align: center;
}

.article-state h2 { margin: 0; font-size: clamp(1.8rem, 4vw, 2.7rem); }
.article-state p { max-width: 560px; margin: 0; color: var(--text-secondary); }
.article-state-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.7rem; }

.article-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(238, 145, 82, 0.2);
  border-top-color: var(--accent-secondary);
  border-radius: 50%;
  animation: articleSpin 0.8s linear infinite;
}

.retry-button {
  padding: 0.72rem 1.05rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent-secondary);
  color: #21140d;
  font-size: 0.8rem;
  font-weight: 850;
}

.article-cover {
  width: 100%;
  min-height: 430px;
  overflow: hidden;
  border: 1px solid rgba(238, 145, 82, 0.24);
  border-radius: 30px;
  background: #171210;
  box-shadow: var(--shadow-hover);
}

.article-cover img,
.article-cover video {
  width: 100%;
  height: min(64vh, 680px);
  display: block;
  object-fit: cover;
}

.article-fallback {
  display: grid;
  min-height: 430px;
  place-items: center;
  background: radial-gradient(circle at 65% 30%, rgba(242, 182, 137, 0.35), transparent 32%), #211915;
  color: rgba(255, 245, 236, 0.7);
}

.article-fallback svg { width: 100px; }

.article-layout {
  display: grid;
  grid-template-columns: 180px minmax(0, 720px);
  justify-content: center;
  gap: 4rem;
  padding: 4rem 1rem 2rem;
}

.article-aside {
  align-self: start;
  position: sticky;
  top: 2rem;
  padding-top: 0.35rem;
}

.aside-label {
  display: block;
  margin-bottom: 0.8rem;
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.article-tags { display: flex; flex-direction: column; align-items: flex-start; gap: 0.45rem; }
.article-tags span { color: #a55c31; font-size: 0.76rem; font-weight: 750; }
[data-theme='dark'] .article-tags span { color: #f2b689; }

.article-content {
  color: var(--text-primary);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.06rem, 1.8vw, 1.18rem);
  line-height: 1.9;
}

.article-content :deep(p) { margin: 0 0 1.55rem; }
.article-content :deep(p:first-child::first-letter) {
  float: left;
  margin: 0.1em 0.12em 0 0;
  color: var(--accent-secondary);
  font-family: var(--font-display);
  font-size: 4.2em;
  line-height: 0.76;
}
.article-content :deep(h2) {
  margin: 2.8rem 0 1rem;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
}
.article-content :deep(h3) { margin: 2rem 0 0.8rem; font-size: 1.6rem; }
.article-content :deep(ul),
.article-content :deep(ol) { margin: 0 0 1.5rem 1.25rem; }
.article-content :deep(blockquote) {
  margin: 2rem 0;
  padding-left: 1.4rem;
  border-left: 3px solid var(--accent-secondary);
  color: var(--text-secondary);
  font-style: italic;
}
.article-content :deep(a) { text-decoration: underline; }
.article-content.empty-copy { color: var(--text-secondary); font-style: italic; }

.article-media {
  max-width: 900px;
  margin: 1rem auto 3rem;
  padding: 0 1rem;
}

.article-footer {
  display: grid;
  gap: 1rem;
  max-width: 720px;
  margin: 2rem auto 0;
  padding: 2.2rem;
  border-top: 1px solid rgba(139, 115, 85, 0.2);
  text-align: center;
}

.article-footer p { color: var(--text-secondary); }
.back-button.bottom { justify-self: center; }

@keyframes articleIn {
  from { opacity: 0; transform: translateY(14px); }
}

@keyframes articleSpin { to { transform: rotate(360deg); } }

@media (max-width: 760px) {
  .article-header { margin: 2.4rem auto 1.8rem; }
  .article-header h1 { font-size: clamp(2.7rem, 14vw, 4.6rem); }
  .article-cover { min-height: 280px; border-radius: 22px; }
  .article-cover img, .article-cover video { height: min(48vh, 430px); }
  .article-layout { grid-template-columns: 1fr; gap: 1.6rem; padding: 2.5rem 0.3rem 1rem; }
  .article-aside { position: static; }
  .article-tags { flex-direction: row; flex-wrap: wrap; }
}
</style>
