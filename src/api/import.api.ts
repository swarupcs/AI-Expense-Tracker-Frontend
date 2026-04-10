import { request } from './client';
import type { Category } from './expenses.api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedReceipt {
  title: string;
  amount: number;
  currency: string;
  category: Category;
  date: string;
  merchant?: string;
  notes?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ParseReceiptResponse {
  parsed: ParsedReceipt;
  saved: boolean;
  expenseId: number | null;
}

export interface ParsedExpenseEntry {
  title: string;
  amount: number;
  category: Category;
  date?: string | null;
  notes?: string | null;
}

export interface BulkParseResult {
  expenses: ParsedExpenseEntry[];
  unparsed: string[];
  totalAmount: number;
  saved: boolean;
  savedCount: number;
}

export interface CsvRow {
  date: string;
  title: string;
  amount: number;
  category: Category;
  raw: Record<string, string>;
}

export interface CsvImportResult {
  preview: CsvRow[];
  totalRows: number;
  totalAmount: number;
  errors: string[];
  dryRun: boolean;
  saved: boolean;
  savedCount: number;
  message: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const importApi = {
  parseReceipt: (data: { image: string; mediaType: string; save?: boolean }) =>
    request<ParseReceiptResponse>('/import/receipt', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  parseBulkText: (data: { text: string; save?: boolean }) =>
    request<BulkParseResult>('/import/bulk-text', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  importCsv: (data: { csv: string; save?: boolean; dryRun?: boolean }) =>
    request<CsvImportResult>('/import/csv', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmCsvImport: (rows: ParsedExpenseEntry[]) =>
    request<{ savedCount: number }>('/import/csv/confirm', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    }),
};
