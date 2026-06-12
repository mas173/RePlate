import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        console.error('SecureStore.getItemAsync error:', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.error('SecureStore.setItemAsync error:', err);
      }
    },
    async clearToken(key: string) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (err) {
        console.error('SecureStore.deleteItemAsync error:', err);
      }
    },
  };
};

// SecureStore is only supported on native platforms. For web, Clerk will use localStorage/cookies automatically.
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
