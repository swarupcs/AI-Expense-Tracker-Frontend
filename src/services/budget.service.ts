import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetApi, type UpsertBudgetInput } from '@/api/expenses.api';
import { useAuthStore } from '@/store/auth.store';

export const budgetKeys = {
  all: ['budgets'] as const,
  list: () => [...budgetKeys.all, 'list'] as const,
  overview: (month?: string) => [...budgetKeys.all, 'overview', month] as const,
};

export function useBudgets() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: budgetKeys.list(),
    queryFn: async () => {
      const res = await budgetApi.list();
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch budgets');
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useBudgetOverview(month?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: budgetKeys.overview(month),
    queryFn: async () => {
      const res = await budgetApi.overview(month);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch budget overview');
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpsertBudgetInput) => {
      const res = await budgetApi.upsert(data);
      if (!res.success) throw new Error(res.error ?? 'Failed to save budget');
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await budgetApi.delete(id);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete budget');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}
