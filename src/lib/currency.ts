export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    RMB: '¥'
  };
  return symbols[currency] || '₹';
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
};
