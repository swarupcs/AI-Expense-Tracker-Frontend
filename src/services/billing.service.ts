import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingApi, type VerifyPaymentInput } from '@/api/billing.api';

const BILLING_KEY = ['billing'] as const;

export function useBilling() {
  return useQuery({
    queryKey: BILLING_KEY,
    queryFn: async () => {
      const res = await billingApi.getBilling();
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load billing info');
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: async () => {
      const res = await billingApi.subscribe();
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to create subscription');
      return res.data;
    },
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: VerifyPaymentInput) => {
      const res = await billingApi.verifyPayment(data);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Payment verification failed');
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLING_KEY }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await billingApi.cancelSubscription();
      if (!res.success) throw new Error(res.error ?? 'Failed to cancel subscription');
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLING_KEY }),
  });
}
