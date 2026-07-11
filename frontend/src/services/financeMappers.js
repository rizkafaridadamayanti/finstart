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

export function mapJournalTransaction(row = {}) {
  const debitAllocations = Array.isArray(row.debit_allocations)
    ? row.debit_allocations
    : [];
  const creditAllocations = Array.isArray(row.credit_allocations)
    ? row.credit_allocations
    : [];

  return {
    id: String(row.id ?? ""),
    tanggal: dateOnly(row.transaction_date || row.tanggal),
    refVoucher: row.voucher_number || row.refVoucher || "-",
    keterangan: row.description || row.keterangan || "-",
    nominal: numberValue(row.total_debit ?? row.total_credit ?? row.nominal),
    debitAkun:
      accountCodeFromAllocation(debitAllocations[0]) || row.debitAkun || "",
    kreditAkun:
      accountCodeFromAllocation(creditAllocations[0]) || row.kreditAkun || "",
    isDraft: row.status === "draft",
    status: row.status || "",
    _raw: row,
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
