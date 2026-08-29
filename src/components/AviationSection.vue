<template>
  <section ref="sectionRef" class="aviation-section">
    <AviationArticleView
      v-if="selectedArticle"
      :post="selectedArticle"
      @back="closeArticle"
      @refreshed="replacePost"
      @detail-error="notifyDetailError"
    />

    <template v-else>
      <header class="aviation-hero" :class="{ 'has-hero-media': heroImageUrl }">
        <img
          v-if="heroImageUrl"
          class="hero-media"
          :src="heroImageUrl"
          alt="Aviation Adventure"
          @error="refreshHeroMedia"
        />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="hero-eyebrow">A personal aviation journal</span>
          <h1>Aviation<br />Adventure</h1>
          <p>A little corner of my portfolio for aviation, flying, airports and moments worth capturing.</p>
          <a class="explore-link" href="#aviation-feed" @click="scrollToFeed">
            Explore the journal <span aria-hidden="true">&darr;</span>
          </a>
        </div>
        <div class="hero-caption" aria-hidden="true">
          <span>Moments</span><span>Stories</span><span>Articles</span>
        </div>
      </header>

      <div id="aviation-feed" class="feed-heading">
        <div>
          <span class="section-kicker">Latest entries</span>
          <h2>The journal</h2>
        </div>
        <p>Photography, movement and stories from around the runway.</p>
      </div>

      <div class="filter-shell">
        <div class="filters" role="group" aria-label="Filter aviation posts">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            :class="['filter-button', { active: activeFilter === filter.value }]"
            :aria-pressed="activeFilter === filter.value"
            @click="changeFilter(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="feed-status" aria-live="polite">
        <span>{{ pagination.totalCount }} {{ pagination.totalCount === 1 ? 'entry' : 'entries' }}</span>
        <span>{{ activeFilterLabel }}</span>
      </div>

      <div v-if="loading && !posts.length" class="feed-loading" role="status">
        <span></span><span></span><span></span>
        <p>Preparing the journal...</p>
      </div>

      <div v-else-if="initialError" class="feed-message" role="alert">
        <h3>The journal could not be loaded</h3>
        <p>{{ initialError }}</p>
        <button type="button" class="primary-button" @click="loadPosts(true)">Try again</button>
      </div>

      <div v-else-if="!posts.length" class="feed-message">
        <h3>No aviation stories yet.</h3>
        <p v-if="activeFilter !== 'all'">There are no {{ activeFilterLabel.toLowerCase() }} to show yet.</p>
        <button v-if="activeFilter !== 'all'" type="button" class="secondary-button" @click="changeFilter('all')">View all entries</button>
      </div>

      <div v-else class="aviation-grid">
        <AviationPostCard
          v-for="post in posts"
          :key="post.post_id"
          :post="post"
          @open="openPost"
          @media-error="refreshMedia"
        />
      </div>

      <p v-if="loadMoreError" class="load-more-error" role="alert">{{ loadMoreError }}</p>

      <div v-if="pagination.hasNextPage" class="load-more-wrap">
        <button type="button" class="load-more-button" :disabled="loadingMore" @click="loadMore">
          <span>{{ loadingMore ? 'Loading...' : loadMoreError ? 'Try load more again' : 'Load more' }}</span>
          <span v-if="!loadingMore" aria-hidden="true">&darr;</span>
        </button>
      </div>

      <p v-else-if="posts.length" class="end-note">You have reached the beginning of this adventure.</p>
    </template>

    <Teleport to="body">
      <Transition name="viewer-transition">
        <AviationPostViewer
          v-if="selectedPost"
          :post="selectedPost"
          @close="selectedPost = null"
          @refreshed="replacePost"
          @detail-error="notifyDetailError"
        />
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { api } from '@/services/api';
import AviationArticleView from './aviation/AviationArticleView.vue';
import AviationPostCard from './aviation/AviationPostCard.vue';
import AviationPostViewer from './aviation/AviationPostViewer.vue';

const props = defineProps({
  toastRef: {
    type: Object,
    default: null
  }
});

const filters = [
  { label: 'All', value: 'all', postType: null },
  { label: 'Moments', value: 'moment', postType: 'moment' },
  { label: 'Stories', value: 'story', postType: 'story' },
  { label: 'Articles', value: 'article', postType: 'article' }
];

const emptyPagination = () => ({
  currentPage: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
});

const normalizePost = (post = {}) => ({
  ...post,
  tags: Array.isArray(post.tags) ? post.tags : [],
  media: Array.isArray(post.media) ? post.media : []
});

const sectionRef = ref(null);
const posts = ref([]);
const activeFilter = ref('all');
const loading = ref(false);
const loadingMore = ref(false);
const initialError = ref('');
const loadMoreError = ref('');
const selectedPost = ref(null);
const selectedArticle = ref(null);
const pagination = ref(emptyPagination());
const heroImageUrl = ref('');
const heroPostId = ref('');
const refreshAttempts = new Set();
const backgroundControllers = new Set();
let feedController = null;
let loadMoreController = null;
let feedRequestSequence = 0;
let heroInitialized = false;
let heroRefreshAttempted = false;
let savedFeedScroll = 0;

const activeFilterConfig = computed(() => filters.find((filter) => filter.value === activeFilter.value) || filters[0]);
const activeFilterLabel = computed(() => activeFilterConfig.value.label);

const notifyError = (message, title = 'Aviation Adventure') => {
  props.toastRef?.addToast?.(message, 'error', title);
};

const currentPageScroll = () => Math.max(
  window.scrollY || 0,
  document.documentElement.scrollTop || 0,
  document.body.scrollTop || 0
);

const setPageScroll = (top, behavior = 'auto') => {
  const options = { top: Math.max(0, top || 0), behavior };
  window.scrollTo(options);
  document.documentElement.scrollTo?.(options);
  document.body.scrollTo?.(options);
};

const setHeroFromPosts = (availablePosts) => {
  if (heroInitialized) return;
  heroInitialized = true;

  const featuredPosts = availablePosts.filter((post) => post.featured);
  const candidates = [...featuredPosts, ...availablePosts.filter((post) => !post.featured)];
  const heroPost = candidates.find((post) => post.media.some((media) => media.media_type === 'image'));
  const heroMedia = heroPost?.media.find((media) => media.media_type === 'image');

  heroPostId.value = heroPost?.post_id || '';
  heroImageUrl.value = heroMedia?.url || '';
};

const loadPosts = async (reset = false) => {
  feedController?.abort();
  loadMoreController?.abort();
  const controller = new AbortController();
  const requestSequence = ++feedRequestSequence;
  feedController = controller;

  if (reset) {
    posts.value = [];
    pagination.value = emptyPagination();
  }

  initialError.value = '';
  loadMoreError.value = '';
  loading.value = true;

  try {
    const result = await api.getAviationPosts({
      page: 1,
      pageSize: 12,
      postType: activeFilterConfig.value.postType
    }, controller.signal);

    if (controller.signal.aborted || requestSequence !== feedRequestSequence) return;

    const freshPosts = Array.isArray(result?.posts) ? result.posts.map(normalizePost) : [];
    posts.value = freshPosts;
    pagination.value = result?.pagination || emptyPagination();

    if (activeFilter.value === 'all') setHeroFromPosts(freshPosts);
  } catch (error) {
    if (error?.name === 'AbortError' || requestSequence !== feedRequestSequence) return;
    initialError.value = error?.message || 'Please try again in a moment.';
    notifyError(initialError.value, 'Could not load aviation posts');
  } finally {
    if (requestSequence === feedRequestSequence) {
      loading.value = false;
      if (feedController === controller) feedController = null;
    }
  }
};

const loadMore = async () => {
  if (loadingMore.value || !pagination.value.hasNextPage) return;

  loadMoreController?.abort();
  const controller = new AbortController();
  const filterAtRequest = activeFilter.value;
  const nextPage = pagination.value.currentPage + 1;
  loadMoreController = controller;
  loadMoreError.value = '';
  loadingMore.value = true;

  try {
    const result = await api.getAviationPosts({
      page: nextPage,
      pageSize: 12,
      postType: activeFilterConfig.value.postType
    }, controller.signal);

    if (controller.signal.aborted || filterAtRequest !== activeFilter.value) return;

    const existingIds = new Set(posts.value.map((post) => post.post_id));
    const additionalPosts = (Array.isArray(result?.posts) ? result.posts : [])
      .map(normalizePost)
      .filter((post) => !existingIds.has(post.post_id));

    posts.value = [...posts.value, ...additionalPosts];
    pagination.value = result?.pagination || pagination.value;
  } catch (error) {
    if (error?.name === 'AbortError') return;
    loadMoreError.value = error?.message || 'Older entries could not be loaded.';
    notifyError(loadMoreError.value, 'Could not load more posts');
  } finally {
    if (loadMoreController === controller) loadMoreController = null;
    loadingMore.value = false;
  }
};

const changeFilter = (filter) => {
  if (activeFilter.value === filter) return;
  activeFilter.value = filter;
  refreshAttempts.clear();
  loadPosts(true);
};

const openPost = async (post) => {
  if (post.post_type === 'article') {
    savedFeedScroll = currentPageScroll();
    selectedArticle.value = normalizePost(post);
    await nextTick();
    const top = sectionRef.value?.getBoundingClientRect().top + currentPageScroll() - 18;
    setPageScroll(top, 'smooth');
    return;
  }

  selectedPost.value = normalizePost(post);
};

const closeArticle = async () => {
  selectedArticle.value = null;
  await nextTick();
  setPageScroll(savedFeedScroll, 'auto');
};

const replacePost = (freshPost) => {
  const normalized = normalizePost(freshPost);
  posts.value = posts.value.map((post) => post.post_id === normalized.post_id ? normalized : post);
  if (selectedPost.value?.post_id === normalized.post_id) selectedPost.value = normalized;
  if (selectedArticle.value?.post_id === normalized.post_id) selectedArticle.value = normalized;
};

const refreshMedia = async ({ post, media }) => {
  if (!post?.post_id || !media?.media_id || refreshAttempts.has(media.media_id)) return;
  refreshAttempts.add(media.media_id);

  const controller = new AbortController();
  backgroundControllers.add(controller);
  try {
    const refreshed = await api.getAviationPostById(post.post_id, controller.signal);
    replacePost(refreshed);
  } catch (error) {
    if (error?.name !== 'AbortError') notifyError('This media could not be refreshed.', 'Media unavailable');
  } finally {
    backgroundControllers.delete(controller);
  }
};

const refreshHeroMedia = async () => {
  const failedUrl = heroImageUrl.value;
  if (!heroPostId.value || heroRefreshAttempted) {
    heroImageUrl.value = '';
    return;
  }

  heroRefreshAttempted = true;
  const controller = new AbortController();
  backgroundControllers.add(controller);
  try {
    const refreshed = normalizePost(await api.getAviationPostById(heroPostId.value, controller.signal));
    const freshImage = refreshed.media.find((media) => media.media_type === 'image');
    heroImageUrl.value = freshImage?.url && freshImage.url !== failedUrl ? freshImage.url : '';
    replacePost(refreshed);
  } catch (_) {
    heroImageUrl.value = '';
  } finally {
    backgroundControllers.delete(controller);
  }
};

const notifyDetailError = (message) => {
  notifyError(message || 'This aviation post could not be loaded.', 'Could not load post');
};

const scrollToFeed = (event) => {
  event.preventDefault();
  document.querySelector('#aviation-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

onMounted(() => loadPosts(true));

onBeforeUnmount(() => {
  feedController?.abort();
  loadMoreController?.abort();
  backgroundControllers.forEach((controller) => controller.abort());
  backgroundControllers.clear();
});
</script>

<style scoped>
.aviation-section {
  width: 100%;
  padding-bottom: 4rem;
  animation: sectionReveal 0.7s ease both;
}

.aviation-hero {
  position: relative;
  display: flex;
  min-height: clamp(390px, 52vw, 560px);
  align-items: flex-end;
  overflow: hidden;
  border: 1px solid rgba(242, 182, 137, 0.24);
  border-radius: 32px;
  background:
    radial-gradient(circle at 72% 28%, rgba(242, 182, 137, 0.38), transparent 32%),
    linear-gradient(145deg, #4a3024 0%, #241814 55%, #130f0d 100%);
  box-shadow: 0 28px 80px rgba(70, 39, 22, 0.25);
  isolation: isolate;
}

.hero-media {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 58%;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(24, 15, 11, 0.86) 0%, rgba(24, 15, 11, 0.48) 52%, rgba(24, 15, 11, 0.12) 100%),
    linear-gradient(0deg, rgba(24, 15, 11, 0.65), transparent 56%);
}

.hero-content {
  width: min(720px, 76%);
  padding: clamp(2rem, 5vw, 4.8rem);
  color: white;
}

.hero-eyebrow,
.section-kicker {
  color: #f7b984;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-content h1 {
  margin: 0.65rem 0 1rem;
  color: #fff8f2;
  font-size: clamp(4rem, 10vw, 8.4rem);
  font-weight: 700;
  line-height: 0.76;
  letter-spacing: -0.065em;
  text-shadow: 0 8px 36px rgba(15, 8, 5, 0.38);
}

.hero-content p {
  max-width: 570px;
  margin: 0;
  color: rgba(255, 246, 239, 0.84);
  font-size: clamp(0.95rem, 1.8vw, 1.14rem);
  line-height: 1.7;
}

.explore-link {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 1.55rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(255, 245, 237, 0.55);
  color: #fff8f2;
  font-size: 0.78rem;
  font-weight: 800;
}

.explore-link:hover { color: #f7b984; }

.hero-caption {
  position: absolute;
  right: 2rem;
  bottom: 1.8rem;
  display: flex;
  gap: 1.25rem;
  color: rgba(255, 248, 242, 0.62);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-caption span + span::before {
  content: '·';
  margin-right: 1.25rem;
  color: #f7b984;
}

.feed-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  padding: 4.5rem 0 1.6rem;
  scroll-margin-top: 2rem;
}

.feed-heading h2 {
  margin: 0.2rem 0 0;
  font-size: clamp(3rem, 7vw, 5.5rem);
  line-height: 0.92;
  letter-spacing: -0.055em;
}

.feed-heading > p {
  max-width: 370px;
  margin: 0 0 0.4rem;
  color: var(--text-secondary);
  text-align: right;
  line-height: 1.6;
}

.filter-shell {
  position: sticky;
  top: 0.6rem;
  z-index: 10;
  margin: 0 -0.45rem;
  padding: 0.55rem 0.45rem;
  overflow: hidden;
  border-radius: 18px;
  background: color-mix(in srgb, var(--bg-primary) 76%, transparent);
  backdrop-filter: blur(18px) saturate(1.15);
}

.filters {
  display: flex;
  gap: 0.55rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.filters::-webkit-scrollbar { display: none; }

.filter-button {
  flex: none;
  padding: 0.65rem 1rem;
  border: 1px solid rgba(139, 115, 85, 0.24);
  border-radius: 999px;
  background: var(--surface-glass);
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 750;
  white-space: nowrap;
}

.filter-button:hover { border-color: var(--accent-secondary); color: var(--text-dark); }
.filter-button.active {
  border-color: transparent;
  background: var(--gradient-accent);
  color: white;
  box-shadow: 0 9px 22px rgba(238, 145, 82, 0.25);
}

.feed-status {
  display: flex;
  justify-content: space-between;
  padding: 1.4rem 0 0.9rem;
  color: var(--text-secondary);
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.aviation-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 1.35rem;
  align-items: start;
}

.feed-loading,
.feed-message {
  display: grid;
  min-height: 340px;
  place-items: center;
  align-content: center;
  gap: 0.8rem;
  padding: 2rem;
  border: 1px dashed rgba(139, 115, 85, 0.28);
  border-radius: 24px;
  color: var(--text-secondary);
  text-align: center;
}

.feed-loading { grid-template-columns: repeat(3, 8px); }
.feed-loading span { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-secondary); animation: loadingDot 0.9s ease-in-out infinite alternate; }
.feed-loading span:nth-child(2) { animation-delay: 0.15s; }
.feed-loading span:nth-child(3) { animation-delay: 0.3s; }
.feed-loading p { grid-column: 1 / -1; }
.feed-message h3 { font-size: 2rem; }
.feed-message p { max-width: 440px; }

.primary-button,
.secondary-button,
.load-more-button {
  border-radius: 999px;
  font-weight: 800;
}

.primary-button,
.load-more-button {
  border: 0;
  background: var(--gradient-accent);
  color: white;
}

.primary-button { padding: 0.75rem 1rem; }
.secondary-button { padding: 0.75rem 1rem; border: 1px solid var(--accent-secondary); background: transparent; color: var(--text-dark); }

.load-more-wrap { display: grid; place-items: center; padding: 3rem 0 0; }
.load-more-error {
  margin: 2rem auto -1.5rem;
  color: #b25f34;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}
[data-theme='dark'] .load-more-error { color: #f2b689; }
.load-more-button {
  display: inline-flex;
  min-width: 160px;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 0.85rem 1.3rem;
  box-shadow: 0 12px 28px rgba(238, 145, 82, 0.25);
}
.load-more-button:disabled { cursor: wait; opacity: 0.65; }
.load-more-button:hover:not(:disabled) { transform: translateY(-3px); }

.end-note {
  margin: 3rem 0 0;
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 1.2rem;
  text-align: center;
}

.viewer-transition-enter-active,
.viewer-transition-leave-active { transition: opacity 0.2s ease; }
.viewer-transition-enter-from,
.viewer-transition-leave-to { opacity: 0; }

@keyframes loadingDot { to { transform: translateY(-8px); opacity: 0.42; } }

@media (max-width: 760px) {
  .aviation-hero { min-height: 470px; border-radius: 24px; background-position: 58% center; }
  .hero-content { width: 100%; padding: 2rem 1.45rem 2.4rem; }
  .hero-content h1 { font-size: clamp(4rem, 19vw, 6.3rem); }
  .hero-content p { max-width: 88%; }
  .hero-caption { display: none; }
  .feed-heading { display: block; padding-top: 3.5rem; }
  .feed-heading > p { margin-top: 1rem; text-align: left; }
  .filter-shell { top: 4.5rem; margin-right: -0.75rem; border-radius: 16px 0 0 16px; }
  .aviation-grid { gap: 1rem; }
}

@media (max-width: 480px) {
  .aviation-hero { min-height: 430px; border-radius: 20px; }
  .hero-content { padding: 1.6rem 1.15rem 2rem; }
  .hero-content h1 { margin-bottom: 0.9rem; font-size: clamp(3.5rem, 18vw, 5rem); }
  .hero-content p { max-width: 100%; font-size: 0.9rem; }
  .feed-heading h2 { font-size: 3.5rem; }
}
</style>
