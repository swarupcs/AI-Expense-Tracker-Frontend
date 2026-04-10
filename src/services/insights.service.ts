import { useMutation, useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/api/insights.api';

export const insightKeys = {
  anomalies: ['insights', 'anomalies'] as const,
  forecast: (month?: string) => ['insights', 'forecast', month] as const,
  budgetRecommendations: ['insights', 'budget-recommendations'] as const,
  patterns: ['insights', 'patterns'] as const,
  healthScore: ['insights', 'health-score'] as const,
  weeklySummary: ['insights', 'weekly-summary'] as const,
};

export function useAnomalies() {
  return useQuery({
    queryKey: insightKeys.anomalies,
    queryFn: async () => {
      const res = await insightsApi.getAnomalies();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to load anomalies');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useForecast(month?: string) {
  return useQuery({
    queryKey: insightKeys.forecast(month),
    queryFn: async () => {
      const res = await insightsApi.getForecast(month);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to load forecast');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useComparePeriods() {
  return useMutation({
    mutationFn: async (body: {
      period1From: string;
      period1To: string;
      period2From: string;
      period2To: string;
    }) => {
      const res = await insightsApi.compare(body);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Comparison failed');
      return res.data;
    },
  });
}

export function useBudgetRecommendations() {
  return useQuery({
    queryKey: insightKeys.budgetRecommendations,
    queryFn: async () => {
      const res = await insightsApi.getBudgetRecommendations();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to load recommendations');
      return res.data;
    },
    staleTime: 10 * 60_000,
  });
}

export function useSpendingPatterns() {
  return useQuery({
    queryKey: insightKeys.patterns,
    queryFn: async () => {
      const res = await insightsApi.getPatterns();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to load patterns');
      return res.data;
    },
    staleTime: 10 * 60_000,
  });
}

export function useHealthScore() {
  return useQuery({
    queryKey: insightKeys.healthScore,
    queryFn: async () => {
      const res = await insightsApi.getHealthScore();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to load health score');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useWeeklySummary() {
  return useQuery({
    queryKey: insightKeys.weeklySummary,
    queryFn: async () => {
      const res = await insightsApi.getWeeklySummary();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to load weekly summary');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}
