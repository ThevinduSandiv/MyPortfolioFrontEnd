// src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Custom error class for user-friendly messages
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Generic fetch wrapper
 * @param {string} endpoint - e.g., '/projects'
 * @param {Object} options - fetch options
 * @returns {Promise<any>} - parsed JSON data
 */
const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Handle specific status codes with friendly messages
      let message;
      switch (response.status) {
        case 405:
          message = 'This action is not allowed right now. Please try again later.';
          break;
        case 404:
          message = 'The resource you are looking for could not be found.';
          break;
        case 500:
          message = 'Something went wrong on our end. Please try again later.';
          break;
        default:
          message = 'An unexpected error occurred. Please try again.';
      }
      throw new ApiError(message, response.status);
    }

    // If response is empty (e.g., for POST that returns nothing), return null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors or CORS
    throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0);
  }
};

/**
 * API methods
 */
export const api = {
  // Contact
  sendContactMessage: (data) => fetchData('/contact/send', { method: 'POST', body: JSON.stringify(data) }),

  // CV download
  downloadCV: () => fetchData('/cv/generate', { method: 'POST' }),

  // Projects
  getProjects: () => fetchData('/projects'),

  // Experience
  getExperience: () => fetchData('/experience'),

  // Skills & Certifications
  getSkills: () => fetchData('/skills'),
  getCertifications: () => fetchData('/certifications'),

  // Achievements
  getAchievements: () => fetchData('/achievements'),

  // About / Bio
  getBio: () => fetchData('/about'),
};

export default api;