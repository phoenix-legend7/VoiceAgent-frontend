// Currency conversion utilities
export type Currency = 'USD' | 'AUD' | 'EUR' | 'GBP' | 'CAD' | 'NZD';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD (base currency)
}

// Exchange rates relative to USD (these would ideally come from an API)
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 1.0,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rate: 1.55, // 1 USD = 1.55 AUD (approximate)
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.92, // 1 USD = 0.92 EUR (approximate)
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.79, // 1 USD = 0.79 GBP (approximate)
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    rate: 1.36, // 1 USD = 1.36 CAD (approximate)
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    rate: 1.68, // 1 USD = 1.68 NZD (approximate)
  },
};

// Get currency from local storage or default to USD
export function getSelectedCurrency(): Currency {
  const stored = localStorage.getItem('selectedCurrency');
  if (stored && stored in CURRENCIES) {
    return stored as Currency;
  }
  return 'USD';
}

// Save selected currency to local storage
export function setSelectedCurrency(currency: Currency): void {
  localStorage.setItem('selectedCurrency', currency);
}

// Convert amount from USD cents to target currency
export function convertFromUSDCents(cents: number, targetCurrency: Currency): number {
  const usdAmount = cents / 100;
  const currencyInfo = CURRENCIES[targetCurrency];
  return usdAmount * currencyInfo.rate;
}

// Convert amount from target currency to USD cents
export function convertToUSDCents(amount: number, sourceCurrency: Currency): number {
  const currencyInfo = CURRENCIES[sourceCurrency];
  const usdAmount = amount / currencyInfo.rate;
  return Math.round(usdAmount * 100);
}

// Format amount with currency symbol
export function formatCurrency(amount: number, currency: Currency): string {
  const currencyInfo = CURRENCIES[currency];
  return `${currencyInfo.symbol}${amount.toFixed(2)}`;
}
