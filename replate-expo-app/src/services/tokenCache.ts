/**
 * Clerk token cache using expo-secure-store
 * Persists Clerk session tokens securely on-device
 */

import * as SecureStore from 'expo-secure-store';
import { TokenCache } from '@clerk/clerk-expo';

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        console.error('SecureStore getToken error:', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        await SecureStore.setItemAsync(key, token);
      } catch (error) {
        console.error('SecureStore saveToken error:', error);
      }
    },
    clearToken: async (key: string) => {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('SecureStore clearToken error:', error);
      }
    },
  };
};

export const tokenCache = createTokenCache();
