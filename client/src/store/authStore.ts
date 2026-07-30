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

/**
 * Persisted auth session. Tokens live in localStorage via Zustand's
 * persist middleware — acceptable for this app's threat model (no
 * sensitive PII beyond what the API itself already exposes to an
 * authenticated user). A stricter deployment would move the refresh
 * token to an httpOnly cookie instead.
 */
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
