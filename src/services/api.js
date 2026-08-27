// src/services/api.js
const API_BASE_URL = 'https://portfoliobackend-ts7g.onrender.com/api';

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

export const api = {
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
      const response = await fetch(`${API_BASE_URL}/projects/featured?limit=${limit}`);
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
      const response = await fetch(`${API_BASE_URL}/projects?${query}`);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  async getProject(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // About Endpoint
  async getAbout() {
    try {
      const response = await fetch(`${API_BASE_URL}/about`);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // Achievements Endpoint
  async getAchievements(limit = 3) {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements/recent?limit=${limit}`);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
    }
  },

  // Experience Endpoint
  async getExperience(sort = 'newest') {
    try {
      const response = await fetch(`${API_BASE_URL}/experience?sort=${sort}`);
      if (!response.ok) throw { response };
      return await response.json();
    } catch (error) {
      throw { message: handleError(error) };
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
