// src/utils/format.ts
// Formatting utility functions

/**
 * Format number as Indonesian Rupiah currency (IDR)
 * @param amount numeric amount
 * @returns formatted currency string (e.g. Rp10.000)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
