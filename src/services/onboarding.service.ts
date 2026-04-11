import { useMutation, useQuery } from '@tanstack/react-query';
import { onboardingApi } from '@/api/onboarding.api';
import type { OnboardingState, OnboardingMessage } from '@/api/onboarding.api';

export function useOnboardingWelcome() {
  return useQuery({
    queryKey: ['onboarding', 'welcome'],
    queryFn: async () => {
      const res = await onboardingApi.getWelcome();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to load onboarding');
      return res.data;
    },
    staleTime: Infinity, // never re-fetch during session
    retry: 1,
  });
}

export function useSendOnboardingMessage() {
  return useMutation({
    mutationFn: async (body: {
      message: string;
      state: OnboardingState;
      history: OnboardingMessage[];
      applyActions?: boolean;
    }) => {
      const res = await onboardingApi.sendMessage(body);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to send message');
      return res.data;
    },
  });
}
