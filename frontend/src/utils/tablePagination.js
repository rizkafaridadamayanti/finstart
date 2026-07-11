export const TABLE_PAGE_SIZE = 10;

function valueForLatestSort(row) {
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
    if (candidate === undefined || candidate === null || candidate === "")
      continue;
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) return numeric;
    const embeddedNumber = String(candidate).match(/(\d{4,})\D*$/);
    if (embeddedNumber) return Number(embeddedNumber[1]);
    const parsed = Date.parse(String(candidate));
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

export function latestFirst(rows = []) {
  return [...rows].sort(
    (a, b) => valueForLatestSort(b) - valueForLatestSort(a),
  );
}

export function totalPages(total, pageSize = TABLE_PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export function safePage(page, total, pageSize = TABLE_PAGE_SIZE) {
  return Math.min(Math.max(1, Number(page) || 1), totalPages(total, pageSize));
}

export function pageRows(rows = [], page = 1, pageSize = TABLE_PAGE_SIZE) {
  const current = safePage(page, rows.length, pageSize);
  return rows.slice((current - 1) * pageSize, current * pageSize);
}
