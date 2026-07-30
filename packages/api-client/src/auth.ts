import { apiClient } from './client';
import type { Session, User } from '@workspace/shared-types';

export const authApi = {
  login: (data: any) => apiClient.post<Session>('/api/auth/login', data),
  logout: () => apiClient.post<void>('/api/auth/logout'),
  getCurrentUser: () => apiClient.get<User>('/api/auth/me'),
  refreshToken: () => apiClient.post<Session>('/api/auth/refresh'),
};
