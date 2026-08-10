import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout, register } from '../../api/auth';
import type { LoginRequest, RegisterRequest } from '../../api/auth-types';
import { useAuthStore } from '../../store/authStore';

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (request: RegisterRequest) => register(request),
    onSuccess: (auth) => setSession(auth),
  });
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (auth) => setSession(auth),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { refreshToken, clearSession } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await logout(refreshToken).catch(() => {
          // Best-effort server-side revoke; local logout proceeds regardless.
        });
      }
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
