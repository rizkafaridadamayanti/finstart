export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const PRINT_DOCUMENT_STYLES = `
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    margin: 0;
    padding: 40px 48px;
    color: #182338;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 3px solid #0B1F4A;
  }
  .doc-brand { display: flex; align-items: center; gap: 14px; }
  .doc-mark {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0B1F4A, #1E5AA8);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.02em;
  }
  .doc-brand-name { font-size: 15px; font-weight: 700; color: #0B1F4A; letter-spacing: 0.01em; }
  .doc-brand-sub {
    margin-top: 2px;
    font-size: 10px;
    color: #7A8CA8;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .doc-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 999px;
    background: #EEF5FC;
    color: #1E5AA8;
    border: 1px solid #CFE0F4;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  .doc-title { margin: 22px 0 4px; font-size: 20px; font-weight: 700; color: #0B1F4A; }
  .doc-subtitle { margin: 0; font-size: 12px; color: #64748B; }
  .doc-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-top: 20px;
    padding: 16px 18px;
    background: #F8FBFE;
    border: 1px solid #DCE7F4;
    border-radius: 14px;
  }
  .doc-meta-item .label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #7A8CA8;
  }
  .doc-meta-item .value { margin-top: 3px; font-size: 13px; font-weight: 600; color: #182338; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 12px; }
  thead th {
    background: #0B1F4A;
    color: #fff;
    text-align: left;
    padding: 11px 14px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  thead th:first-child { border-top-left-radius: 8px; }
  thead th:last-child { border-top-right-radius: 8px; }
  tbody td { padding: 10px 14px; border-bottom: 1px solid #E8EEF7; color: #243650; }
  tbody tr:nth-child(even) { background: #F8FBFE; }
  td.numeric, th.numeric { text-align: right; font-variant-numeric: tabular-nums; }
  p.doc-note { margin: 18px 0 0; font-size: 12px; line-height: 1.6; color: #40516A; }
  .doc-summary {
    margin-top: 20px;
    padding: 16px 20px;
    border-radius: 14px;
    background: #EEF5FC;
    border: 1px solid #CFE0F4;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
  }
  .doc-summary .row { display: flex; justify-content: space-between; gap: 24px; flex: 1 1 220px; }
  .doc-summary .row .label { font-size: 11px; font-weight: 600; color: #40516A; align-self: center; }
  .doc-summary .row .value { font-size: 14px; font-weight: 700; color: #0B1F4A; }
  .doc-summary .row.total .value { color: #1E5AA8; font-size: 17px; }
  .doc-footer {
    margin-top: 32px;
    padding-top: 14px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #94A3B8;
  }
  @media print {
    body { padding: 18mm; }
  }
`

function buildMetaHtml(metaItems) {
  if (!metaItems.length) return ""
  const items = metaItems
    .map(
      (item) => `
        <div class="doc-meta-item">
          <div class="label">${escapeHtml(item.label)}</div>
          <div class="value">${escapeHtml(item.value)}</div>
        </div>`,
    )
    .join("")
  return `<div class="doc-meta">${items}</div>`
}

function buildSummaryHtml(summaryItems) {
  if (!summaryItems.length) return ""
  const items = summaryItems
    .map(
      (item) => `
        <div class="row${item.emphasize ? " total" : ""}">
          <span class="label">${escapeHtml(item.label)}</span>
          <span class="value">${escapeHtml(item.value)}</span>
        </div>`,
    )
    .join("")
  return `<div class="doc-summary">${items}</div>`
}

/*
  Bangun HTML dokumen cetak dengan tampilan konsisten (letterhead, badge jenis
  dokumen, info grid, tabel, ringkasan, footer) dipakai bersama oleh semua
  laporan yang diunduh/dicetak (Laporan Keuangan, Laporan Pajak, Bukti Jurnal,
  Slip Gaji) agar desainnya seragam dan modern.
*/
export function buildPrintDocumentHtml({
  documentLabel,
  title,
  subtitle = "",
  metaItems = [],
  bodyHtml = "",
  summaryItems = [],
  printedAt = new Date(),
}) {
  const printedDate = printedAt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  const printedTime = printedAt.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)} - FinStart</title>
    <style>${PRINT_DOCUMENT_STYLES}</style>
  </head>
  <body>
    <div class="doc-header">
      <div class="doc-brand">
        <div class="doc-mark">FS</div>
        <div>
          <div class="doc-brand-name">PT KEDATA INDONESIA DIGITAL</div>
          <div class="doc-brand-sub">FinStart Financial System</div>
        </div>
      </div>
      <span class="doc-badge">${escapeHtml(documentLabel)}</span>
    </div>
    <h1 class="doc-title">${escapeHtml(title)}</h1>
    ${subtitle ? `<p class="doc-subtitle">${escapeHtml(subtitle)}</p>` : ""}
    ${buildMetaHtml(metaItems)}
    ${bodyHtml}
    ${buildSummaryHtml(summaryItems)}
    <div class="doc-footer">
      <span>Dokumen dibuat otomatis oleh sistem FinStart.</span>
      <span>Dicetak ${escapeHtml(printedDate)} ${escapeHtml(printedTime)}</span>
    </div>
  </body>
</html>`
}

/*
  Buka popup print browser dan tulis dokumen HTML ke dalamnya. Mengembalikan
  false (dan memanggil notify jika disediakan) kalau popup diblokir browser.
*/
export function openPrintPopup(html, { notify, blockedMessage } = {}) {
  const popup = window.open("", "_blank", "width=980,height=760")
  if (!popup) {
    if (notify) {
      notify(
        blockedMessage ||
          "Popup print diblokir browser. Izinkan popup untuk mencetak dokumen.",
      )
    }
    return false
  }
  popup.document.write(html)
  popup.document.close()
  popup.focus()
  popup.print()
  return true
}
