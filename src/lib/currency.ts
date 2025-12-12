export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    RMB: '¥'
  };
  return symbols[currency] || '₹';
};
