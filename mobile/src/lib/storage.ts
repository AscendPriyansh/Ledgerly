import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types/api';

const AUTH_TOKEN_KEY = 'miniledger_auth_token';
const AUTH_USER_KEY = 'miniledger_auth_user';
const THEME_MODE_KEY = 'miniledger_theme_mode';

// In-memory fallback for web environment where SecureStore is not supported
const memoryStore = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStore.set(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key) ?? memoryStore.get(key) ?? null;
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const Storage = {
  async getAuthToken(): Promise<string | null> {
    try {
      return await getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setAuthToken(token: string): Promise<void> {
    await setItem(AUTH_TOKEN_KEY, token);
  },

  async clearAuthToken(): Promise<void> {
    try {
      await deleteItem(AUTH_TOKEN_KEY);
    } catch {}
  },

  async getAuthUser(): Promise<User | null> {
    try {
      const raw = await getItem(AUTH_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async setAuthUser(user: User): Promise<void> {
    await setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  async clearAuthUser(): Promise<void> {
    try {
      await deleteItem(AUTH_USER_KEY);
    } catch {}
  },

  async clearAll(): Promise<void> {
    await Promise.all([this.clearAuthToken(), this.clearAuthUser()]);
  },

  async getThemeMode(): Promise<'light' | 'dark' | 'system' | null> {
    try {
      const mode = await getItem(THEME_MODE_KEY);
      if (mode === 'light' || mode === 'dark' || mode === 'system') {
        return mode;
      }
      return null;
    } catch {
      return null;
    }
  },

  async setThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    await setItem(THEME_MODE_KEY, mode);
  },
};
