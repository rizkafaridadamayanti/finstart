import { h } from 'vue';

export const TABLE_PAGE_SIZE = 10;

function valueForLatestSort(row: any) {
  const raw = row?._raw || row || {};
  const candidates = [
    raw.created_at,
    raw.updated_at,
    raw.transaction_date,
    raw.date,
    raw.tanggal,
    raw.tanggalKirim,
    raw.tanggalMasuk,
    raw.tanggalBeli,
    raw.tanggalTagihan,
    raw.jatuhTempo,
    raw.due_date,
    raw.id,
    row?.id,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === '') continue;
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) return numeric;
    const embeddedNumber = String(candidate).match(/(\d{4,})\D*$/);
    if (embeddedNumber) return Number(embeddedNumber[1]);
    const parsed = Date.parse(String(candidate));
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

export function latestFirst<T>(rows: T[] = []): T[] {
  return [...rows].sort((a: any, b: any) => valueForLatestSort(b) - valueForLatestSort(a));
}

export function totalPages(total: number, pageSize = TABLE_PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export function safePage(page: number, total: number, pageSize = TABLE_PAGE_SIZE) {
  return Math.min(Math.max(1, Number(page) || 1), totalPages(total, pageSize));
}

export function pageRows<T>(rows: T[] = [], page = 1, pageSize = TABLE_PAGE_SIZE): T[] {
  const current = safePage(page, rows.length, pageSize);
  return rows.slice((current - 1) * pageSize, current * pageSize);
}

export function TablePagination(props: {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}) {
  const pageSize = props.pageSize || TABLE_PAGE_SIZE;
  const pages = totalPages(props.total, pageSize);
  const current = safePage(props.page, props.total, pageSize);
  const start = props.total ? (current - 1) * pageSize + 1 : 0;
  const end = Math.min(props.total, current * pageSize);
  const disabledClass = 'cursor-not-allowed opacity-45';
  const buttonClass = 'inline-flex h-8 items-center justify-center rounded-lg border border-[#D8E5F4] bg-white px-3 text-[11px] font-bold text-[#0B1F4A] transition hover:bg-[#F8FBFE] disabled:cursor-not-allowed disabled:opacity-45';

  return (
    <div class="flex flex-col gap-2 border-t border-[#E8EEF7] bg-white px-4 py-3 text-xs text-[#6B7A90] sm:flex-row sm:items-center sm:justify-between">
      <span>Menampilkan {start}-{end} dari {props.total} data terbaru</span>
      <div class="flex items-center gap-2">
        <button type="button" disabled={current <= 1} onClick={() => props.onPageChange(current - 1)} class={`${buttonClass} ${current <= 1 ? disabledClass : ''}`}>Sebelumnya</button>
        <span class="min-w-[72px] text-center text-[11px] font-bold text-[#0B1F4A]">Hal {current}/{pages}</span>
        <button type="button" disabled={current >= pages} onClick={() => props.onPageChange(current + 1)} class={`${buttonClass} ${current >= pages ? disabledClass : ''}`}>Berikutnya</button>
      </div>
    </div>
  );
}
