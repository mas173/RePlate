import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import type { BackendProfile, ProfileUpdatePayload, UserRole } from '../types/api';

import Constants from 'expo-constants';

const getBaseUrl = () => {
  let url = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://replate-68ip.onrender.com/api';
  
  if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url;
  }
  
  // Auto-detect host IP from Expo Metro server address (crucial for physical devices on same Wi-Fi)
  const debuggerHost = Constants.expoConfig?.hostUri || (Constants.manifest2?.extra as any)?.expoGoLaunchMetadata?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export const setApiTokenGetter = (getter: TokenGetter) => {
  tokenGetter = getter;
};

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!tokenGetter) return config;

  const token = await tokenGetter();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

const withToken = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const authAPI = {
  syncUser: async (token: string) => {
    const response = await apiClient.post('/auth/sync', {}, withToken(token));
    return response.data;
  },
  updateRole: async (token: string, role: UserRole) => {
    const response = await apiClient.post('/auth/role', { role }, withToken(token));
    return response.data;
  },
};

export const userAPI = {
  getProfile: async (token: string): Promise<BackendProfile> => {
    const response = await apiClient.get('/users/profile', withToken(token));
    return response.data.profile;
  },
  updateProfile: async (token: string, profileData: ProfileUpdatePayload) => {
    const response = await apiClient.put('/users/profile', profileData, withToken(token));
    return response.data.profile;
  },
};
