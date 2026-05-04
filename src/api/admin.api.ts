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

export interface AdminUserDetails extends AdminUser {
  expenses: Array<{
    id: number;
    title: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
  }>;
  chatMessages: Array<{
    id: number;
    role: string;
    content: string;
    createdAt: string;
  }>;
  toolCallLogs: Array<{
    id: number;
    toolName: string;
    success: boolean;
    durationMs: number | null;
    createdAt: string;
  }>;
}

export interface GlobalSettings {
  id: number;
  llmProvider: string;
  llmModel: string | null;
  updatedAt: string;
}

export const adminApi = {
  getUsers: () => request<AdminUser[]>('/admin/users'),
  getUserDetails: (id: number) => request<AdminUserDetails>(`/admin/users/${id}`),
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
