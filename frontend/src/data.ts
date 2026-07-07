// Pembantu format nominal untuk seluruh tampilan aktif FinStart.
export const formatRupiah = (value: number): string => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(Number(value || 0));
