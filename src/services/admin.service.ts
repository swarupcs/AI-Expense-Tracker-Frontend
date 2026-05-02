import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser, type GlobalSettings } from '@/api/admin.api';

export const adminKeys = {
  users: ['admin', 'users'] as const,
  settings: ['admin', 'settings'] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async () => {
      const res = await adminApi.getUsers();
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load users');
      return res.data;
    },
  });
}

export function useGlobalSettings() {
  return useQuery({
    queryKey: adminKeys.settings,
    queryFn: async () => {
      const res = await adminApi.getGlobalSettings();
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load settings');
      return res.data;
    },
  });
}

export function useUpdateGlobalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { llmProvider: string; llmModel?: string }) => {
      const res = await adminApi.updateGlobalSettings(data);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to update settings');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings });
    },
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: { llmProvider: string | null; llmModel: string | null } }) => {
      const res = await adminApi.updateUserSettings(userId, data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update user settings');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}
