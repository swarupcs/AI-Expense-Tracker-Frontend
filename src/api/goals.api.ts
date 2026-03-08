import { request } from './client';
import type { Category } from './expenses.api';

export type GoalType = 'SAVINGS' | 'SPENDING_LIMIT';

export interface FinancialGoal {
  id: number;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  category: Category | null;
  period: string | null;
  deadline: string | null;
  isCompleted: boolean;
  notes: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount?: number;
  category?: Category;
  period?: string;
  deadline?: string;
  notes?: string;
}

export interface UpdateGoalInput {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  category?: Category;
  period?: string;
  deadline?: string;
  isCompleted?: boolean;
  notes?: string;
}

export const goalsApi = {
  list: () => request<FinancialGoal[]>('/goals'),
  create: (data: CreateGoalInput) =>
    request<FinancialGoal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateGoalInput) =>
    request<FinancialGoal>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/goals/${id}`, { method: 'DELETE' }),
};
