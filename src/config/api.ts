// Central API client — all backend calls go through here

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStats {
  total: number;
  count: number;
  average: number;
  byCategory: Array<{ category: string; amount: number; count: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  category?: string;
  search?: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category?: string;
  date?: string;
}

export interface UpdateExpenseInput {
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error ?? `HTTP ${res.status}` };
  }

  return res.json();
}

// ─── Expenses API ─────────────────────────────────────────────────────────────

export const expensesApi = {
  list: (filters?: ExpenseFilters) => {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
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
};

// ─── Chat SSE API ─────────────────────────────────────────────────────────────

export type StreamMessageType =
  | { type: 'ai'; payload: { text: string } }
  | {
      type: 'toolCall:start';
      payload: { name: string; args: Record<string, unknown> };
    }
  | {
      type: 'tool';
      payload: { name: string; result: Record<string, unknown> };
    };

interface ChatStreamCallbacks {
  onMessage: (msg: StreamMessageType) => void;
  onError?: (err: Error) => void;
  onDone?: () => void;
}

export function streamChat(
  query: string,
  threadId: string,
  callbacks: ChatStreamCallbacks,
): () => void {
  let isCancelled = false;

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, threadId }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!isCancelled) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let pendingData = '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            pendingData = line.slice(6);
          } else if (line === '' && pendingData) {
            try {
              const parsed = JSON.parse(pendingData) as StreamMessageType;
              if (parsed.type) callbacks.onMessage(parsed);
            } catch {
              // skip malformed
            }
            pendingData = '';
          }
        }
      }

      callbacks.onDone?.();
    } catch (err) {
      if (!isCancelled) {
        callbacks.onError?.(
          err instanceof Error ? err : new Error(String(err)),
        );
      }
    }
  })();

  return () => {
    isCancelled = true;
  };
}
