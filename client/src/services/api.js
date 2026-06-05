/**
 * API client for communicating with the RePlate backend
 * All API calls go through this module for consistency
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/donations')
 * @param {Object} options - Fetch options
 * @param {string} token - Clerk session token
 * @returns {Promise<Object>} API response data
 */
const apiRequest = async (endpoint, options = {}, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData (browser sets it automatically with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

// ========================
// Donations API
// ========================

export const donationsAPI = {
  getAll: (token, params = '') => apiRequest(`/donations${params}`, {}, token),
  getById: (token, id) => apiRequest(`/donations/${id}`, {}, token),
  create: (token, formData) =>
    apiRequest('/donations', { method: 'POST', body: formData }, token),
  update: (token, id, data) =>
    apiRequest(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),
  patch: (token, id, data) =>
    apiRequest(`/donations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),
  updateStatus: (token, id, status) =>
    apiRequest(`/donations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token),
  delete: (token, id) =>
    apiRequest(`/donations/${id}`, { method: 'DELETE' }, token),
};

// ========================
// Claims API
// ========================

export const claimsAPI = {
  getAll: (token) => apiRequest('/claims', {}, token),
  create: (token, data) =>
    apiRequest('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
  updateStatus: (token, id, data) =>
    apiRequest(`/claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(typeof data === 'string' ? { status: data } : data),
    }, token),
  cancel: (token, id) =>
    apiRequest(`/claims/${id}`, { method: 'DELETE' }, token),
};

// ========================
// Analytics API
// ========================

export const analyticsAPI = {
  getPublicStats: () => apiRequest('/analytics/public-stats'),
  getOverview: (token) => apiRequest('/analytics/overview', {}, token),
  getUserAnalytics: (token) => apiRequest('/analytics/user', {}, token),
  getTrends: (token) => apiRequest('/analytics/trends', {}, token),
  getLeaderboard: (token) => apiRequest('/analytics/leaderboard', {}, token),
  getCategories: (token) => apiRequest('/analytics/categories', {}, token),
};

// ========================
// AI API
// ========================

export const aiAPI = {
  analyzeFreshness: (token, formData) =>
    apiRequest('/ai/analyze-freshness', {
      method: 'POST',
      body: formData,
    }, token),
  categorize: (token, data) =>
    apiRequest('/ai/categorize', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
};

// ========================
// Notifications API
// ========================

export const notificationsAPI = {
  getAll: (token) => apiRequest('/notifications', {}, token),
  getUnreadCount: (token) => apiRequest('/notifications/unread-count', {}, token),
  markRead: (token, id) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }, token),
  markAllRead: (token) =>
    apiRequest('/notifications/read-all', { method: 'PATCH' }, token),
};

// ========================
// User API
// ========================

export const userAPI = {
  getProfile: (token) => apiRequest('/users/profile', {}, token),
  updateProfile: (token, data) =>
    apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),
  getSettings: (token) => apiRequest('/users/settings', {}, token),
  updateSettings: (token, data) =>
    apiRequest('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),
};

// ========================
// Admin API
// ========================

export const adminAPI = {
  getUsers: (token, params = '') => apiRequest(`/admin/users${params}`, {}, token),
  updateUserRole: (token, userId, role) =>
    apiRequest(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }, token),
  toggleUserStatus: (token, userId, isActive) =>
    apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }, token),
  deleteUser: (token, userId) =>
    apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }, token),
  getDonations: (token, params = '') => apiRequest(`/admin/donations${params}`, {}, token),
  updateDonationStatus: (token, donationId, status) =>
    apiRequest(`/admin/donations/${donationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token),
  getAnalytics: (token) => apiRequest('/admin/analytics', {}, token),
  getActivity: (token) => apiRequest('/admin/activity', {}, token),
};

// ========================
// Auth API
// ========================

export const authAPI = {
  syncUser: (token) =>
    apiRequest('/auth/sync', { method: 'POST' }, token),
  updateRole: (token, role) =>
    apiRequest('/auth/role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }, token),
};

// ========================
// Assistant API
// ========================

export const assistantAPI = {
  sendVoice: (token, formData) =>
    apiRequest('/assistant/voice', { method: 'POST', body: formData }, token),
  sendText: (token, data) =>
    apiRequest('/assistant/text', { method: 'POST', body: JSON.stringify(data) }, token),
};

export default {
  donationsAPI,
  claimsAPI,
  analyticsAPI,
  aiAPI,
  notificationsAPI,
  userAPI,
  adminAPI,
  authAPI,
  assistantAPI,
};
