// src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';
const FRESH_CONTENT_OPTIONS = { cache: 'no-store' };

const handleError = (error) => {
  if (error.response?.status === 405) {
    return 'This feature is not available yet. Please try again later.';
  }
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  if (error.response?.status === 503) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  return error.response?.data?.error || 'Something went wrong. Please try again.';
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (response.ok) return response.json();

  let responseError = '';
  try {
    const payload = await response.json();
    responseError = payload?.error || payload?.message || '';
  } catch (_) {
    // Use the shared status-based fallback when the API has no JSON error body.
  }

  const error = new Error(responseError || handleError({ response }));
  error.status = response.status;
  throw error;
};

export const api = {
  // Startup endpoint. The caller deliberately checks for an exact HTTP 200
  // before allowing the portfolio to render.
  async checkBackendHealth(signal) {
    return fetch(`${API_BASE_URL}/Test`, {
      method: 'HEAD',
      cache: 'no-store',
      signal
    });
  },

  // Portfolio Endpoints
  async getTagline() {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/tagline`);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // Projects Endpoints
  async getFeaturedProjects(limit = 3) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/featured?limit=${limit}`,
        FRESH_CONTENT_OPTIONS
      );
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  async getProjects(params = {}) {
    try {
      const query = new URLSearchParams({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        sort: params.sort || 'newest',
        ...(params.search && { search: params.search }),
        ...(params.technology && { technology: params.technology })
      });
      const response = await fetch(`${API_BASE_URL}/projects?${query}`, FRESH_CONTENT_OPTIONS);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  async getProject(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, FRESH_CONTENT_OPTIONS);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // About Endpoint
  async getAbout() {
    try {
      const response = await fetch(`${API_BASE_URL}/about`, FRESH_CONTENT_OPTIONS);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // Achievements Endpoint
  async getAchievements(limit = 3) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/achievements/recent?limit=${limit}`,
        FRESH_CONTENT_OPTIONS
      );
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // Experience Endpoint
  async getExperience(sort = 'newest') {
    try {
      const response = await fetch(`${API_BASE_URL}/experience?sort=${sort}`, FRESH_CONTENT_OPTIONS);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // Aviation Adventure Endpoints
  async getAviationPosts(params = {}, signal) {
    const query = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 12
    });

    if (params.postType) query.set('postType', params.postType);
    if (typeof params.featured === 'boolean') query.set('featured', String(params.featured));
    if (params.tag) query.set('tag', params.tag);

    try {
      return await requestJson(`${API_BASE_URL}/AviationPosts?${query}`, {
        ...FRESH_CONTENT_OPTIONS,
        signal
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      throw { message: error?.message || handleError(error), status: error?.status };
    }
  },

  async getAviationPostById(id, signal) {
    try {
      return await requestJson(
        `${API_BASE_URL}/AviationPosts/${encodeURIComponent(id)}`,
        { ...FRESH_CONTENT_OPTIONS, signal }
      );
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      throw { message: error?.message || handleError(error), status: error?.status };
    }
  },

  async getAviationPostBySlug(slug, signal) {
    try {
      return await requestJson(
        `${API_BASE_URL}/AviationPosts/slug/${encodeURIComponent(slug)}`,
        { ...FRESH_CONTENT_OPTIONS, signal }
      );
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      throw { message: error?.message || handleError(error), status: error?.status };
    }
  },

  // Contact Endpoint
  async sendContact(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw { response };

      // A successful contact submission does not require a response payload.
      // Read the body safely so an empty 2xx response still resolves normally.
      const responseText = await response.text();
      if (!responseText.trim()) return { success: true };

      try {
        return JSON.parse(responseText);
      } catch (_) {
        return { success: true };
      }
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // CV Generation
  async generateCV(options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/cv/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      if (!response.ok) throw { response };
      return await response.blob();
    } catch (error) {
      throw { message: handleError(error) };
    }
  }
};
