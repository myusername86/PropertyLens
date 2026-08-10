import { api } from './client';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from './auth-types';

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return api<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function login(request: LoginRequest): Promise<AuthResponse> {
  return api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function changePassword(request: ChangePasswordRequest): Promise<void> {
  return api<void>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await api<void>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
