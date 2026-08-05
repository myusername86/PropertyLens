import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../api/auth-types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  displayName: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      displayName: null,
      role: null,
      isAuthenticated: false,
      setSession: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          expiresAt: auth.expiresAt,
          displayName: auth.displayName,
          role: auth.role,
          isAuthenticated: true,
        }),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          displayName: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'propertylens-auth' },
  ),
);