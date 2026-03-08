import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recurringApi, type CreateRecurringInput, type UpdateRecurringInput } from '@/api/expenses.api';
import { useAuthStore } from '@/store/auth.store';

export const recurringKeys = {
  all: ['recurring'] as const,
  list: () => [...recurringKeys.all, 'list'] as const,
};

export function useRecurringExpenses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: recurringKeys.list(),
    queryFn: async () => {
      const res = await recurringApi.list();
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch recurring expenses');
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRecurringInput) => {
      const res = await recurringApi.create(data);
      if (!res.success) throw new Error(res.error ?? 'Failed to create recurring expense');
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRecurringInput }) => {
      const res = await recurringApi.update(id, data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update recurring expense');
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await recurringApi.delete(id);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete recurring expense');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}
