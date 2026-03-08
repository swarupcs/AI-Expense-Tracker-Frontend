import { request } from './client';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
}

export const currencyApi = {
  getRates: (base: string) =>
    request<ExchangeRates>(`/currency/rates?base=${base.toUpperCase()}`),
};

// ─── Supported currencies ─────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee',         symbol: '₹'   },
  { code: 'USD', name: 'US Dollar',             symbol: '$'   },
  { code: 'EUR', name: 'Euro',                  symbol: '€'   },
  { code: 'GBP', name: 'British Pound',         symbol: '£'   },
  { code: 'JPY', name: 'Japanese Yen',          symbol: '¥'   },
  { code: 'CAD', name: 'Canadian Dollar',       symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar',     symbol: 'A$'  },
  { code: 'CHF', name: 'Swiss Franc',           symbol: 'Fr'  },
  { code: 'CNY', name: 'Chinese Yuan',          symbol: '¥'   },
  { code: 'SGD', name: 'Singapore Dollar',      symbol: 'S$'  },
  { code: 'AED', name: 'UAE Dirham',            symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal',           symbol: '﷼'  },
  { code: 'MYR', name: 'Malaysian Ringgit',     symbol: 'RM'  },
  { code: 'THB', name: 'Thai Baht',             symbol: '฿'  },
  { code: 'IDR', name: 'Indonesian Rupiah',     symbol: 'Rp'  },
  { code: 'PHP', name: 'Philippine Peso',       symbol: '₱'  },
  { code: 'KRW', name: 'South Korean Won',      symbol: '₩'  },
  { code: 'HKD', name: 'Hong Kong Dollar',      symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar',    symbol: 'NZ$' },
  { code: 'BRL', name: 'Brazilian Real',        symbol: 'R$'  },
  { code: 'MXN', name: 'Mexican Peso',          symbol: 'MX$' },
  { code: 'ZAR', name: 'South African Rand',    symbol: 'R'   },
  { code: 'TRY', name: 'Turkish Lira',          symbol: '₺'  },
  { code: 'PKR', name: 'Pakistani Rupee',       symbol: '₨'  },
  { code: 'BDT', name: 'Bangladeshi Taka',      symbol: '৳'  },
  { code: 'LKR', name: 'Sri Lankan Rupee',      symbol: 'Rs'  },
  { code: 'NPR', name: 'Nepalese Rupee',        symbol: 'Rs'  },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}
