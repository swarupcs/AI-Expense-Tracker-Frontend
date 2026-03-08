import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsApi, type CreateGoalInput, type UpdateGoalInput } from '@/api/goals.api';

const GOALS_KEY = ['goals'] as const;

export function useGoals() {
  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: async () => {
      const res = await goalsApi.list();
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load goals');
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGoalInput) => {
      const res = await goalsApi.create(data);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to create goal');
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateGoalInput }) => {
      const res = await goalsApi.update(id, data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update goal');
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await goalsApi.delete(id);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete goal');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}
