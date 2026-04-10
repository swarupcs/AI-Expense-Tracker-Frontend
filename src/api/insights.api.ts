import { request } from './client';
import type { Category } from './expenses.api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpendingAnomaly {
  category: Category;
  currentSpend: number;
  historicalAvg: number;
  percentageIncrease: number;
  severity: 'HIGH' | 'MEDIUM';
}

export interface MonthForecast {
  month: string;
  daysElapsed: number;
  daysRemaining: number;
  daysInMonth: number;
  spentSoFar: number;
  dailyAverage: number;
  projectedTotal: number;
  projectedRemaining: number;
  lastMonthTotal: number;
  vsLastMonthPct: number | null;
  totalBudget: number;
  projectedVsBudgetPct: number | null;
}

export interface PeriodComparison {
  period1: {
    from: string;
    to: string;
    total: number;
    count: number;
    byCategory: Record<string, number>;
  };
  period2: {
    from: string;
    to: string;
    total: number;
    count: number;
    byCategory: Record<string, number>;
  };
  totalDiff: number;
  totalPctChange: number | null;
  direction: 'increased' | 'decreased' | 'unchanged';
  categoryBreakdown: Array<{
    category: string;
    period1: number;
    period2: number;
    diff: number;
    pctChange: number | null;
  }>;
}

export interface BudgetRecommendation {
  category: string;
  averageSpend: number;
  maxSpend: number;
  recommendedBudget: number;
  currentBudget: number | null;
  action: 'SET_NEW' | 'INCREASE' | 'DECREASE' | 'MAINTAIN';
}

export interface SpendingPattern {
  topSpendingDayOfWeek: string;
  topSpendingWeekOfMonth: number;
  averageDailySpend: number;
  highSpendDays: Array<{ date: string; amount: number }>;
  categoryTrends: Array<{
    category: string;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    trendPct: number;
  }>;
}

export interface FinancialHealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: Array<{
    metric: string;
    score: number;
    maxScore: number;
    description: string;
  }>;
  recommendations: string[];
}

export interface WeeklyInsightData {
  fromDate: string;
  toDate: string;
  total: number;
  count: number;
  currency: string;
  topCategory: string | null;
  topCategoryAmount: number;
  vsLastWeekPct: number | null;
  anomalies: SpendingAnomaly[];
  budgetWarnings: Array<{ category: string; percentage: number }>;
  byCategory: Array<{ category: string; amount: number; count: number }>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const insightsApi = {
  getAnomalies: () =>
    request<{
      anomalies: SpendingAnomaly[];
      hasAnomalies: boolean;
      count: number;
    }>('/insights/anomalies'),

  getForecast: (month?: string) => {
    const qs = month ? `?month=${month}` : '';
    return request<MonthForecast>(`/insights/forecast${qs}`);
  },

  compare: (body: {
    period1From: string;
    period1To: string;
    period2From: string;
    period2To: string;
  }) =>
    request<PeriodComparison>('/insights/compare', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getBudgetRecommendations: () =>
    request<BudgetRecommendation[]>('/insights/budget-recommendations'),

  getPatterns: () => request<SpendingPattern>('/insights/patterns'),

  getHealthScore: () => request<FinancialHealthScore>('/insights/health-score'),

  getWeeklySummary: () =>
    request<WeeklyInsightData>('/insights/weekly-summary'),
};
