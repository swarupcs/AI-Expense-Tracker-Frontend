import { request } from './client';

export type Category =
  | 'DINING'
  | 'SHOPPING'
  | 'TRANSPORT'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'HEALTH'
  | 'EDUCATION'
  | 'OTHER';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface ExpenseStats {
  total: number;
  count: number;
  average: number;
  max: number;
  min: number;
  byCategory: Array<{ category: Category; amount: number; count: number }>;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  category?: Category;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category?: Category;
  date?: string;
  notes?: string;
}

export interface UpdateExpenseInput {
  title?: string;
  amount?: number;
  category?: Category;
  date?: string;
  notes?: string;
}

export const expensesApi = {
  list: (filters?: ExpenseFilters) => {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return request<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`);
  },
  stats: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return request<ExpenseStats>(`/expenses/stats${qs ? `?${qs}` : ''}`);
  },
  get: (id: number) => request<Expense>(`/expenses/${id}`),
  create: (data: CreateExpenseInput) =>
    request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateExpenseInput) =>
    request<Expense>(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/expenses/${id}`, { method: 'DELETE' }),
  bulkDelete: (ids: number[]) =>
    request<{ count: number }>('/expenses', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
};
