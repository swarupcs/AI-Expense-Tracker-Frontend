import { request } from './client';

// ─── Types (mirrors backend onboarding.service.ts) ────────────────────────────

export type OnboardingStep =
  | 'WELCOME'
  | 'INCOME'
  | 'TOP_CATEGORIES'
  | 'SET_BUDGETS'
  | 'SET_GOALS'
  | 'RECURRING'
  | 'COMPLETE';

export interface OnboardingState {
  step: OnboardingStep;
  monthlyIncome?: number;
  topCategories?: string[];
  suggestedBudgets?: Array<{ category: string; amount: number }>;
  confirmedBudgets?: Array<{ category: string; amount: number }>;
  goals?: Array<{ name: string; type: string; targetAmount: number }>;
  recurring?: Array<{ title: string; amount: number; frequency: string }>;
}

export interface OnboardingMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface OnboardingAction {
  type: 'SET_INCOME' | 'SET_BUDGETS' | 'SET_GOALS' | 'COMPLETE';
  payload: Record<string, unknown>;
}

export interface OnboardingResponse {
  message: string;
  nextStep: OnboardingStep;
  state: OnboardingState;
  actions?: OnboardingAction[];
  isComplete: boolean;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const onboardingApi = {
  getWelcome: () =>
    request<{ message: string; initialState: OnboardingState }>(
      '/onboarding/welcome',
    ),

  sendMessage: (body: {
    message: string;
    state: OnboardingState;
    history: OnboardingMessage[];
    applyActions?: boolean;
  }) =>
    request<OnboardingResponse>('/onboarding/message', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
