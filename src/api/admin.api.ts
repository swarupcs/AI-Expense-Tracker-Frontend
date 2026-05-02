import { request } from './client';
import type { PublicUser } from './auth.api';

export interface AdminUser extends PublicUser {
  settings?: {
    llmProvider: string | null;
    llmModel: string | null;
  };
  _count: {
    expenses: number;
    chatMessages: number;
    toolCallLogs: number;
  };
}

export interface GlobalSettings {
  id: number;
  llmProvider: string;
  llmModel: string | null;
  updatedAt: string;
}

export const adminApi = {
  getUsers: () => request<AdminUser[]>('/admin/users'),
  getGlobalSettings: () => request<GlobalSettings>('/admin/settings'),
  updateGlobalSettings: (data: { llmProvider: string; llmModel?: string }) =>
    request<GlobalSettings>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUserSettings: (userId: number, data: { llmProvider: string | null; llmModel: string | null }) =>
    request<AdminUser>(`/admin/users/${userId}/settings`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
