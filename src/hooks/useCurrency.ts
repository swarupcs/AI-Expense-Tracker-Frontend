import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '@/services/auth.service';
import { currencyApi, getCurrencySymbol } from '@/api/currency.api';

// ─── User currency ────────────────────────────────────────────────────────────

export function useUserCurrency(): string {
  const { data: settings } = useUserSettings();
  return settings?.currency ?? 'INR';
}

// ─── Exchange rates for a given base ─────────────────────────────────────────

export function useExchangeRates(base: string) {
  return useQuery({
    queryKey: ['currency', 'rates', base.toUpperCase()],
    queryFn: async () => {
      const res = await currencyApi.getRates(base);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to fetch rates');
      return res.data.rates;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!base,
  });
}

// ─── Formatter ───────────────────────────────────────────────────────────────

// Returns a function that formats a number as home currency
export function useFmt(): (amount: number) => string {
  const currency = useUserCurrency();
  return (amount: number) => formatCurrency(amount, currency);
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' || currency === 'IDR' ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString()}`;
  }
}
