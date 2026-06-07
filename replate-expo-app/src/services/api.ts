/**
 * API client for communicating with the RePlate backend
 * Port of the web client's api.js adapted for React Native
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000/api';

/**
 * Make an authenticated API request
 */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  token: string | null = null
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData (browser/RN sets it automatically with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ||
        `API Error: ${response.status}`
    );
  }

  return response.json();
};

// ========================
// Donations API
// ========================

export const donationsAPI = {
  getAll: (token: string, params = '') =>
    apiRequest(`/donations${params}`, {}, token),
  getById: (token: string, id: string) =>
    apiRequest(`/donations/${id}`, {}, token),
  create: (token: string, formData: FormData) =>
    apiRequest('/donations', { method: 'POST', body: formData }, token),
  update: (token: string, id: string, data: object) =>
    apiRequest(
      `/donations/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      token
    ),
  patch: (token: string, id: string, data: object) =>
    apiRequest(
      `/donations/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      token
    ),
  updateStatus: (token: string, id: string, status: string) =>
    apiRequest(
      `/donations/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token
    ),
  delete: (token: string, id: string) =>
    apiRequest(`/donations/${id}`, { method: 'DELETE' }, token),
};

// ========================
// Claims API
// ========================

export const claimsAPI = {
  getAll: (token: string) => apiRequest('/claims', {}, token),
  create: (token: string, data: object) =>
    apiRequest('/claims', { method: 'POST', body: JSON.stringify(data) }, token),
  updateStatus: (token: string, id: string, data: string | object) =>
    apiRequest(
      `/claims/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(typeof data === 'string' ? { status: data } : data),
      },
      token
    ),
  cancel: (token: string, id: string) =>
    apiRequest(`/claims/${id}`, { method: 'DELETE' }, token),
};

// ========================
// Analytics API
// ========================

export const analyticsAPI = {
  getPublicStats: () => apiRequest('/analytics/public-stats'),
  getOverview: (token: string) => apiRequest('/analytics/overview', {}, token),
  getUserAnalytics: (token: string) =>
    apiRequest('/analytics/user', {}, token),
  getTrends: (token: string) => apiRequest('/analytics/trends', {}, token),
  getLeaderboard: (token: string) =>
    apiRequest('/analytics/leaderboard', {}, token),
  getCategories: (token: string) =>
    apiRequest('/analytics/categories', {}, token),
};

// ========================
// AI API
// ========================

export const aiAPI = {
  analyzeFreshness: (token: string, formData: FormData) =>
    apiRequest(
      '/ai/analyze-freshness',
      { method: 'POST', body: formData },
      token
    ),
  categorize: (token: string, data: object) =>
    apiRequest(
      '/ai/categorize',
      { method: 'POST', body: JSON.stringify(data) },
      token
    ),
};

// ========================
// Notifications API
// ========================

export const notificationsAPI = {
  getAll: (token: string) => apiRequest('/notifications', {}, token),
  getUnreadCount: (token: string) =>
    apiRequest('/notifications/unread-count', {}, token),
  markRead: (token: string, id: string) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }, token),
  markAllRead: (token: string) =>
    apiRequest('/notifications/read-all', { method: 'PATCH' }, token),
};

// ========================
// User API
// ========================

export const userAPI = {
  getProfile: (token: string) => apiRequest('/users/profile', {}, token),
  updateProfile: (token: string, data: object) =>
    apiRequest(
      '/users/profile',
      { method: 'PUT', body: JSON.stringify(data) },
      token
    ),
  getSettings: (token: string) => apiRequest('/users/settings', {}, token),
  updateSettings: (token: string, data: object) =>
    apiRequest(
      '/users/settings',
      { method: 'PUT', body: JSON.stringify(data) },
      token
    ),
};

// ========================
// Auth API
// ========================

export const authAPI = {
  syncUser: (token: string) =>
    apiRequest('/auth/sync', { method: 'POST' }, token),
  updateRole: (token: string, role: string) =>
    apiRequest(
      '/auth/role',
      { method: 'POST', body: JSON.stringify({ role }) },
      token
    ),
};

// ========================
// Assistant API
// ========================

export const assistantAPI = {
  sendVoice: (token: string, formData: FormData) =>
    apiRequest('/assistant/voice', { method: 'POST', body: formData }, token),
  sendText: (token: string, data: object) =>
    apiRequest(
      '/assistant/text',
      { method: 'POST', body: JSON.stringify(data) },
      token
    ),
};

export default {
  donationsAPI,
  claimsAPI,
  analyticsAPI,
  aiAPI,
  notificationsAPI,
  userAPI,
  authAPI,
  assistantAPI,
};
