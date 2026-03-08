import { request } from './client';

export type Plan = 'FREE' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';

export interface PlanLimits {
  expenses: number | null;  // null = unlimited
  aiMessages: number | null;
}

export interface BillingInfo {
  plan: Plan;
  status: SubscriptionStatus;
  razorpaySubId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  usage: {
    expenses: number;
    aiMessages: number;
    limits: PlanLimits;
  };
  keyId: string | null;
  billingEnabled: boolean;
}

export interface SubscribeResult {
  subscriptionId: string;
  keyId: string;
}

export interface VerifyPaymentInput {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}

export const billingApi = {
  getBilling: () => request<BillingInfo>('/billing'),
  subscribe: () => request<SubscribeResult>('/billing/subscribe', { method: 'POST' }),
  verifyPayment: (data: VerifyPaymentInput) =>
    request<{ plan: Plan }>('/billing/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancelSubscription: () =>
    request<{ cancelAtPeriodEnd: boolean }>('/billing/cancel', { method: 'POST' }),
};
