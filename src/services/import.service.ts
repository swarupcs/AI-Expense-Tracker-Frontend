import { useMutation } from '@tanstack/react-query';
import { importApi } from '@/api/import.api';
import type { ParsedExpenseEntry } from '@/api/import.api';

export function useParseReceipt() {
  return useMutation({
    mutationFn: async (data: {
      image: string;
      mediaType: string;
      save?: boolean;
    }) => {
      const res = await importApi.parseReceipt(data);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to parse receipt');
      return res.data;
    },
  });
}

export function useParseBulkText() {
  return useMutation({
    mutationFn: async (data: { text: string; save?: boolean }) => {
      const res = await importApi.parseBulkText(data);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to parse text');
      return res.data;
    },
  });
}

export function useImportCsv() {
  return useMutation({
    mutationFn: async (data: {
      csv: string;
      save?: boolean;
      dryRun?: boolean;
    }) => {
      const res = await importApi.importCsv(data);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to import CSV');
      return res.data;
    },
  });
}

export function useConfirmCsvImport() {
  return useMutation({
    mutationFn: async (rows: ParsedExpenseEntry[]) => {
      const res = await importApi.confirmCsvImport(rows);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to confirm import');
      return res.data;
    },
  });
}
