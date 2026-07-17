const numberValue = (value) => Number(value || 0);

const dateOnly = (value) => String(value || "").slice(0, 10);

export function mapClient(row = {}) {
  return {
    id: String(row.id ?? ""),
    namaPerusahaan: row.company_name || row.namaPerusahaan || "-",
    bidang: row.industry || row.category || row.bidang || "-",
    lokasi: row.location || row.address || row.lokasi || "-",
    pic: row.pic_name || row.contact_person || row.pic || "-",
    email: row.email || "",
    telepon: row.phone || row.telepon || "",
    status: row.status || "active",
    _raw: row,
  };
}

const projectStatus = {
  planning: "Planning",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Planning",
};

export function mapProject(row = {}) {
  return {
    id: String(row.id ?? ""),
    nama: row.project_name || row.nama || "-",
    nilaiKontrak: numberValue(row.contract_value ?? row.nilaiKontrak),
    tipeTender: row.procurement_type || row.tipeTender || "Tender Umum",
    status:
      projectStatus[String(row.status || "").toLowerCase()] ||
      row.status ||
      "Planning",
    tanggalMulai: dateOnly(row.start_date || row.tanggalMulai),
    tanggalSelesai: dateOnly(row.end_date || row.tanggalSelesai),
    klienId: String(row.client_id ?? row.klienId ?? ""),
    picKontak: row.client_pic_name || row.pic_kontak || row.picKontak || "-",
    catatan: row.description || row.notes || row.catatan || "",
    tim: Array.isArray(row.team) ? row.team : [],
    anggaran: numberValue(row.budget_amount ?? row.anggaran),
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
    realisasiPendapatan: numberValue(
      row.actual_revenue ?? row.realisasiPendapatan,
    ),
    realisasiBiaya: numberValue(row.actual_cost ?? row.realisasiBiaya),
    selisihAnggaran: numberValue(row.budget_variance ?? row.selisihAnggaran),
    labaAktual: numberValue(row.actual_profit ?? row.labaAktual),
    proyeksiLaba: numberValue(row.forecast_profit ?? row.proyeksiLaba),
    clientName: row.client_name || "",
    _raw: row,
  };
}

const accountTypes = {
  asset: "Aset",
  liability: "Kewajiban",
  equity: "Modal",
  revenue: "Pendapatan",
  expense: "Beban",
};

export function mapAccount(row = {}) {
  return {
    id: String(row.id ?? ""),
    kode: String(row.code ?? row.kode ?? ""),
    nama: row.name || row.nama || "-",
    tipe:
      accountTypes[String(row.type || "").toLowerCase()] || row.tipe || "Aset",
    saldo: numberValue(row.current_balance ?? row.saldo),
    normalBalance: row.normal_balance || "",
    status: row.status || "",
    _raw: row,
  };
}

function accountCodeFromAllocation(value) {
  const found = String(value || "").match(/\b(\d{3,})\b/);
  return found ? found[1] : "";
}

const journalSourceLabels = {
  manual: "Jurnal Manual",
  asset_depreciation: "Jurnal Penyesuaian",
  asset_acquisition: "Perolehan Aset",
  asset_disposal: "Pelepasan Aset",
  subscription: "Langganan",
  invoice: "Invoice",
  invoice_payment: "Pelunasan Invoice",
  bill: "Tagihan Vendor",
  bill_payment: "Pembayaran Tagihan",
  tax_record: "Pajak",
  tax_payment: "Setoran Pajak",
  payroll: "Payroll",
  employee_payroll: "PPh 21",
  vat_closing: "Penutupan PPN",
};

const journalSourceBadgeColors = {
  asset_depreciation: "bg-indigo-50 text-indigo-700 border-indigo-100",
  asset_acquisition: "bg-blue-50 text-blue-700 border-blue-100",
  asset_disposal: "bg-rose-50 text-rose-700 border-rose-100",
  subscription: "bg-sky-50 text-sky-700 border-sky-100",
  invoice: "bg-emerald-50 text-emerald-700 border-emerald-100",
  invoice_payment: "bg-emerald-50 text-emerald-700 border-emerald-100",
  bill: "bg-amber-50 text-amber-700 border-amber-100",
  bill_payment: "bg-amber-50 text-amber-700 border-amber-100",
  tax_record: "bg-purple-50 text-purple-700 border-purple-100",
  tax_payment: "bg-purple-50 text-purple-700 border-purple-100",
  payroll: "bg-cyan-50 text-cyan-700 border-cyan-100",
  employee_payroll: "bg-cyan-50 text-cyan-700 border-cyan-100",
  vat_closing: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
};

function journalSourceLabel(sourceType) {
  return journalSourceLabels[sourceType] || "Jurnal Sistem";
}

function journalSourceBadgeClass(sourceType) {
  return (
    journalSourceBadgeColors[sourceType] ||
    "bg-slate-50 text-slate-600 border-slate-100"
  );
}

const journalStatusDisplay = {
  unposted: "Unposted",
  posted: "Posted",
  canceled: "Canceled",
  "posted-unpaid": "Posted-Unpaid",
  "posted-paid": "Posted-Paid",
  // Alias untuk data lama agar deployment dengan database existing tetap aman.
  draft: "Unposted",
  approved: "Unposted",
  cancelled: "Canceled",
  rejected: "Canceled",
  "posted/unpaid": "Posted-Unpaid",
  "posted/partial": "Posted-Unpaid",
  "posted/paid": "Posted-Paid",
  "posted/overdue": "Posted-Unpaid",
  "posted/draft": "Unposted",
  "posted/issued": "Posted / Unpaid",
  "posted/cancelled": "Canceled",
};

const journalStatusColor = {
  unposted: "bg-amber-50 text-amber-700",
  posted: "bg-emerald-50 text-emerald-700",
  canceled: "bg-rose-50 text-rose-700",
  "posted-unpaid": "bg-sky-50 text-sky-700",
  "posted-paid": "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  approved: "bg-amber-50 text-amber-700",
  cancelled: "bg-rose-50 text-rose-700",
  rejected: "bg-rose-50 text-rose-700",
  "posted/unpaid": "bg-sky-50 text-sky-700",
  "posted/partial": "bg-sky-50 text-sky-700",
  "posted/paid": "bg-emerald-50 text-emerald-700",
  "posted/overdue": "bg-sky-50 text-sky-700",
  "posted/draft": "bg-amber-50 text-amber-700",
  "posted/issued": "bg-sky-50 text-sky-700",
  "posted/cancelled": "bg-rose-50 text-rose-700",
};

export function getJournalStatusDisplay(status) {
  return journalStatusDisplay[status] || status || "Draft";
}

export function getJournalStatusColor(status) {
  return journalStatusColor[status] || "bg-amber-50 text-amber-700";
}

export function mapJournalTransaction(row = {}) {
  const debitAllocations = Array.isArray(row.debit_allocations)
    ? row.debit_allocations
    : [];
  const creditAllocations = Array.isArray(row.credit_allocations)
    ? row.credit_allocations
    : [];

  const rawStatus = row.status || "";
  const sourceType = row.source_type || "";
  const isUnpostedSource = ["invoice_draft", "bill_draft", "tax_draft"].includes(
    sourceType,
  );

  return {
    id: String(row.id ?? ""),
    tanggal: dateOnly(row.tanggal || row.transaction_date),
    refVoucher: row.refVoucher || row.voucher_number || "-",
    keterangan: row.keterangan || row.description || "-",
    nominal: numberValue(row.nominal ?? row.total_debit ?? row.total_credit),
    debitAkun:
      accountCodeFromAllocation(debitAllocations[0]) || row.debitAkun || "",
    kreditAkun:
      accountCodeFromAllocation(creditAllocations[0]) || row.kreditAkun || "",
    isDraft: isUnpostedSource || ["draft", "approved", "unposted"].includes(rawStatus),
    status: rawStatus,
    journal_id: row.journal_id ? Number(row.journal_id) : null,
    journal_status: row.journal_status || null,
    approved_at: row.approved_at || null,
    source_type: sourceType,
    source_label: journalSourceLabel(sourceType || "manual"),
    source_badge_class: journalSourceBadgeClass(sourceType || "manual"),
    source_status: row.source_status || null,
    source_number: row.source_number || null,
    party_name: row.party_name || null,
    debit_allocations: debitAllocations,
    credit_allocations: creditAllocations,
    total_debit: numberValue(row.total_debit),
    total_credit: numberValue(row.total_credit),
    created_by_name: row.created_by_name || "-",
    approved_by_name: row.approved_by_name || "-",
    _raw: row._raw || row,
  };
}

const categoryMap = {
  infrastructure: "Infrastruktur",
  cloud: "Infrastruktur",
  server: "Infrastruktur",
  software: "Software",
  saas: "Software",
  marketing: "Marketing",
};

function mapSubscriptionCategory(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return (
    categoryMap[normalized] ||
    (normalized.includes("cloud") || normalized.includes("infra")
      ? "Infrastruktur"
      : normalized.includes("market")
        ? "Marketing"
        : "Software")
  );
}

export function mapSubscription(row = {}) {
  const cycle = String(row.billing_cycle || row.siklus || "").toLowerCase();
  const amount = numberValue(row.amount ?? row.biaya);
  const monthly = numberValue(row.monthly_equivalent || amount);

  return {
    id: String(row.id ?? ""),
    nama: row.subscription_name || row.nama || "-",
    provider: row.provider_name || row.provider || "-",
    mataUang: row.currency || row.mataUang || "IDR",
    siklus:
      cycle === "yearly" || cycle === "annual" || cycle === "tahunan"
        ? "Tahunan"
        : "Bulanan",
    kategori: mapSubscriptionCategory(row.category || row.kategori),
    biaya: amount,
    biayaIDR: monthly,
    tanggalTagihan: dateOnly(
      row.renewal_date || row.next_billing_date || row.tanggalTagihan,
    ),
    latestBillId: row.latest_bill_id ? String(row.latest_bill_id) : "",
    latestBillNumber: row.latest_bill_number || "",
    latestBillDate: dateOnly(row.latest_bill_date),
    latestBillDueDate: dateOnly(row.latest_bill_due_date),
    latestBillStatus:
      row.latest_bill_display_status || row.latest_bill_status || "",
    latestBillTotalAmount: numberValue(row.latest_bill_total_amount),
    latestBillPaidAmount: numberValue(row.latest_bill_paid_amount),
    latestBillOutstandingAmount: numberValue(
      row.latest_bill_outstanding_amount,
    ),
    generatedBillCount: numberValue(row.generated_bill_count),
    paidBillCount: numberValue(row.paid_bill_count),
    openBillCount: numberValue(row.open_bill_count),
    draftBillCount: numberValue(row.draft_bill_count),
    overdueBillCount: numberValue(row.overdue_bill_count),
    paidJournalCount: numberValue(row.paid_journal_count),
    latestJournalId: row.latest_journal_id ? Number(row.latest_journal_id) : null,
    status: row.status || "",
    _raw: row,
  };
}

export function mapAsset(row = {}) {
  const cost = numberValue(row.acquisition_cost ?? row.hargaBeli);
  const bookValue = numberValue(row.book_value ?? row.nilaiBuku);
  const monthlyDep = numberValue(row.monthly_depreciation);
  return {
    id: String(row.id ?? ""),
    nama: row.asset_name || row.nama || "-",
    kategori: row.category || row.kategori || "-",
    tanggalBeli: dateOnly(row.acquisition_date || row.tanggalBeli),
    hargaBeli: cost,
    penyusutanTahunan: monthlyDep * 12,
    nilaiBuku: bookValue,
    penanggungJawab:
      row.responsible_person ||
      row.penanggungJawab ||
      String(row.notes || "").replace(/^Penanggung jawab:\s*/i, "") ||
      "-",
    status: row.status || "",
    usefulLifeMonths: numberValue(row.useful_life_months),
    residualValue: numberValue(row.residual_value),
    depreciationCount: numberValue(row.depreciation_count),
    lastDepreciationPeriod: row.last_depreciation_period || "",
    _raw: row,
  };
}

const invoiceStatus = {
  paid: "Paid",
  overdue: "Overdue",
  unpaid: "Unpaid",
  partial: "Unpaid",
  draft: "Draft",
  cancelled: "Cancelled",
  posted: "Unpaid",
  issued: "Unpaid",
};

export function mapInvoice(row = {}) {
  const status = String(row.display_status || row.status || "").toLowerCase();
  return {
    id: String(row.id ?? ""),
    nomor: row.invoice_number || row.nomor || "-",
    proyekNama: row.project_name || row.proyekNama || "Operasional Umum",
    klienNama: row.client_name || row.klienNama || "-",
    nominal: numberValue(row.total_amount ?? row.nominal),
    tanggalKirim: dateOnly(row.issue_date || row.tanggalKirim),
    jatuhTempo: dateOnly(row.due_date || row.jatuhTempo),
    status: invoiceStatus[status] || "Unpaid",
    paidAmount: numberValue(row.paid_amount),
    outstandingAmount: numberValue(row.outstanding_amount),
    rawStatus: status,
    _raw: row,
  };
}

const billStatus = {
  paid: "Lunas",
  overdue: "Overdue",
  unpaid: "Belum Bayar",
  partial: "Belum Bayar",
  draft: "Draft",
  cancelled: "Cancelled",
};

export function mapBill(row = {}) {
  const status = String(row.display_status || row.status || "").toLowerCase();
  return {
    id: String(row.id ?? ""),
    vendor: row.vendor_name || row.vendor || "-",
    nomorTagihan: row.bill_number || row.nomorTagihan || "-",
    keterangan: row.notes || row.keterangan || "-",
    nominal: numberValue(
      row.vendor_payable_amount ?? row.total_amount ?? row.nominal,
    ),
    tanggalMasuk: dateOnly(row.bill_date || row.tanggalMasuk),
    jatuhTempo: dateOnly(row.due_date || row.jatuhTempo),
    status: billStatus[status] || "Belum Bayar",
    paidAmount: numberValue(row.paid_amount),
    outstandingAmount: numberValue(row.outstanding_amount),
    projectId: String(row.project_id || ""),
    projectName: row.project_name || "",
    rawStatus: status,
    _raw: row,
  };
}

function formatPeriod(period) {
  const matched = String(period || "").match(/^(\d{4})-(\d{2})$/);
  if (!matched) return period || "-";
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(matched[1]), Number(matched[2]) - 1, 1));
}

const taxLabelMap = {
  ppn: "PPN",
  ppn_output: "PPN",
  ppn_input: "PPN",
  "pph 21": "PPh 21",
  pph21: "PPh 21",
  pph_21: "PPh 21",
  "pph 23": "PPh 23",
  pph23: "PPh 23",
  pph_23: "PPh 23",
  "pph 25": "PPh 25",
  pph25: "PPh 25",
};

export function mapTax(row = {}) {
  const rawType = String(row.tax_type || row.jenis || "").trim();
  const normalized = rawType.toLowerCase().replaceAll("-", "_");
  const status = String(row.display_status || row.status || "").toLowerCase();
  return {
    id: String(row.id ?? ""),
    jenis: taxLabelMap[normalized] || rawType || "PPN",
    masaPajak: formatPeriod(row.tax_period || row.masaPajak),
    nominal: numberValue(row.amount ?? row.nominal),
    jatuhTempo: dateOnly(row.due_date || row.jatuhTempo),
    status: status === "paid" ? "Sudah Setor" : "Belum Setor",
    ntpn: row.tax_number || row.ntpn || "",
    rawStatus: status,
    rawPeriod: row.tax_period || "",
    _raw: row,
  };
}
