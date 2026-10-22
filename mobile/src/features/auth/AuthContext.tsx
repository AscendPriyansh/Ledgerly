import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Storage } from '../../lib/storage';
import { registerUnauthorizedHandler } from '../../api/client';
import { User } from '../../types/api';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const [savedToken, savedUser] = await Promise.all([
          Storage.getAuthToken(),
          Storage.getAuthUser(),
        ]);
        if (savedToken) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (error) {
        console.warn('Failed to load auth state from storage', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const logout = async () => {
    try {
      await Storage.clearAll();
    } catch {}
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logout();
    });
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await Promise.all([
      Storage.setAuthToken(newToken),
      Storage.setAuthUser(newUser),
    ]);
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = async (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged: User = { ...prev, ...updatedFields };
      Storage.setAuthUser(merged).catch(() => {});
      return merged;
    });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
