<script lang="tsx">
import { Fragment, defineComponent, h, ref } from "vue";
import { Users, Percent, ShieldCheck, HeartPulse, Plus, Search, CheckCircle2, DollarSign, ArrowRight, Calculator, Landmark, FileText, RefreshCw, AlertTriangle, CreditCard, X, Save, Upload, Building2, UserCircle } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { Pegawai, AkunBukuBesar } from '../types.ts';
interface SdmDanPajakProps {
  activeSection: 'sdm' | 'perpajakan';
  pegawai: Pegawai[];
  akun: AkunBukuBesar[];
  taxes: PajakKewajiban[];
  taxSummary?: any;
  taxCalculationData?: any;
  onAddJournalFromSubledger: (memo: string, amount: number, drCode: string, crCode: string) => Promise<void> | void;
  onCreateTax: (tax: any) => Promise<void> | void;
  onPayTax: (tax: PajakKewajiban, payment: any) => Promise<void> | void;
  showToast: (msg: string) => void;
}
interface PajakKewajiban {
  id: string;
  jenis: 'PPN' | 'PPh 21' | 'PPh 23' | 'PPh 25';
  masaPajak: string;
  nominal: number;
  jatuhTempo: string;
  status: 'Belum Setor' | 'Sudah Setor';
  ntpn?: string;
}
export default defineComponent({
  name: "SdmDanPajak",
  props: ["activeSection", "pegawai", "akun", "taxes", "taxSummary", "taxCalculationData", "onAddJournalFromSubledger", "onCreateTax", "onPayTax", "showToast"],
  setup(props) {
    const {
      activeSection,
      pegawai,
      akun,
      taxSummary,
      taxCalculationData,
      onAddJournalFromSubledger,
      onCreateTax,
      onPayTax,
      showToast
    }: SdmDanPajakProps = props;
    const activeTab = ref(activeSection === 'sdm' ? 'sdm' : 'pajak'),
      setActiveTab = next => activeTab.value = typeof next === "function" ? next(activeTab.value) : next;
    const searchQuery = ref(''),
      setSearchQuery = next => searchQuery.value = typeof next === "function" ? next(searchQuery.value) : next;
    const taxTableTab = ref('unpaid'),
      setTaxTableTab = next => taxTableTab.value = typeof next === "function" ? next(taxTableTab.value) : next;
    const taxTypeFilter = ref('Semua'),
      setTaxTypeFilter = next => taxTypeFilter.value = typeof next === "function" ? next(taxTypeFilter.value) : next;
    const taxSearchQuery = ref(''),
      setTaxSearchQuery = next => taxSearchQuery.value = typeof next === "function" ? next(taxSearchQuery.value) : next; // Modals toggle
    const isBpjsModalOpen = ref(false),
      setIsBpjsModalOpen = next => isBpjsModalOpen.value = typeof next === "function" ? next(isBpjsModalOpen.value) : next;
    const isEmployeeModalOpen = ref(false),
      setIsEmployeeModalOpen = next => isEmployeeModalOpen.value = typeof next === "function" ? next(isEmployeeModalOpen.value) : next;
    const isPayrollModalOpen = ref(false),
      setIsPayrollModalOpen = next => isPayrollModalOpen.value = typeof next === "function" ? next(isPayrollModalOpen.value) : next;
    const isTaxPayModalOpen = ref(false),
      setIsTaxPayModalOpen = next => isTaxPayModalOpen.value = typeof next === "function" ? next(isTaxPayModalOpen.value) : next;
    const isTaxManualModalOpen = ref(false),
      setIsTaxManualModalOpen = next => isTaxManualModalOpen.value = typeof next === "function" ? next(isTaxManualModalOpen.value) : next;
    const taxCalculation = ref({
        period: 'Juli 2026',
        jenis: 'PPh 21' as PajakKewajiban['jenis'],
        base: 'Pendapatan',
        rate: 2,
        dueDate: '2026-07-04'
      }),
      setTaxCalculation = next => taxCalculation.value = typeof next === "function" ? next(taxCalculation.value) : next;
    const manualTaxForm = ref({
        jenis: 'PPN' as PajakKewajiban['jenis'],
        period: 'Juli 2026',
        nominal: 0,
        dueDate: '',
        reference: '',
        notes: ''
      }),
      setManualTaxForm = next => manualTaxForm.value = typeof next === "function" ? next(manualTaxForm.value) : next; // BPJS Rate settings in local state
    const bpjsKesEmployer = ref(4.0),
      setBpjsKesEmployer = next => bpjsKesEmployer.value = typeof next === "function" ? next(bpjsKesEmployer.value) : next; // 4% dibayar perusahaan
    const bpjsKesEmployee = ref(1.0),
      setBpjsKesEmployee = next => bpjsKesEmployee.value = typeof next === "function" ? next(bpjsKesEmployee.value) : next; // 1% dibayar karyawan
    const bpjsJhtEmployer = ref(3.7),
      setBpjsJhtEmployer = next => bpjsJhtEmployer.value = typeof next === "function" ? next(bpjsJhtEmployer.value) : next; // 3.7% JHT perusahaan
    const bpjsJhtEmployee = ref(2.0),
      setBpjsJhtEmployee = next => bpjsJhtEmployee.value = typeof next === "function" ? next(bpjsJhtEmployee.value) : next; // 2% JHT karyawan
    const bpjsJpEmployer = ref(2.0),
      setBpjsJpEmployer = next => bpjsJpEmployer.value = typeof next === "function" ? next(bpjsJpEmployer.value) : next;
    const bpjsJpEmployee = ref(1.0),
      setBpjsJpEmployee = next => bpjsJpEmployee.value = typeof next === "function" ? next(bpjsJpEmployee.value) : next;
    const employeeForm = ref({
        nama: '',
        nip: 'EMP001',
        nik: '',
        email: '',
        whatsapp: '',
        npwp: '',
        jabatan: '',
        departemen: 'Teknologi',
        statusKontrak: 'Karyawan Tetap',
        tanggalBergabung: '2026-07-01',
        bpjsKesehatanNo: '',
        bpjsKesehatanTipe: 'PPU (Penerima Upah)',
        bpjsKesehatanKelas: 'Kelas 1',
        bpjsKetenagakerjaanNo: '',
        gajiPokok: 0,
        bankNama: '',
        noRekening: ''
      }),
      setEmployeeForm = next => employeeForm.value = typeof next === "function" ? next(employeeForm.value) : next; // Tax obligations local mock state
    // Kewajiban pajak berasal dari database melalui API.
    const taxes = ref<any[]>(props.taxes || []);
    const selectedTaxId = ref(''),
      setSelectedTaxId = next => selectedTaxId.value = typeof next === "function" ? next(selectedTaxId.value) : next;
    const taxPaymentAccount = ref('1001'),
      setTaxPaymentAccount = next => taxPaymentAccount.value = typeof next === "function" ? next(taxPaymentAccount.value) : next; // Submit tax settlement
    const handlePayTax = async (e: Event) => {
      e.preventDefault();
      const targetTax = taxes.value.find(t => t.id === selectedTaxId.value);
      if (!targetTax) return;
      await onPayTax(targetTax, {
        accountCode: taxPaymentAccount.value,
        paymentDate: new Date().toISOString().split('T')[0],
        taxNumber: targetTax.ntpn || '',
        notes: '',
      });
      setIsTaxPayModalOpen(false);
    };

    const handleSaveManualTax = async (event: Event) => {
      event.preventDefault();
      if (!manualTaxForm.value.dueDate || manualTaxForm.value.nominal <= 0) {
        showToast('Lengkapi nominal pajak dan tanggal jatuh tempo terlebih dahulu.');
        return;
      }
      await onCreateTax({
        jenis: manualTaxForm.value.jenis,
        masaPajak: manualTaxForm.value.period,
        nominal: Number(manualTaxForm.value.nominal),
        jatuhTempo: manualTaxForm.value.dueDate,
        catatan: `${manualTaxForm.value.reference ? `Referensi: ${manualTaxForm.value.reference}. ` : ''}${manualTaxForm.value.notes || ''}`,
      });
      setTaxTableTab('unpaid');
      setIsTaxManualModalOpen(false);
      setManualTaxForm({ jenis: 'PPN', period: 'Juli 2026', nominal: 0, dueDate: '', reference: '', notes: '' });
    };

    // Run full payroll calculations and disbursements
    const handleProcessPayroll = () => {
      // Calculate total base salary & allowances
      const totalSalary = pegawai.reduce((acc, p) => acc + p.gajiBersih, 0);
      setIsPayrollModalOpen(false);

      // Post to Journal: Debit Beban Gaji (5001) & Credit Kas/Bank (1001)
      onAddJournalFromSubledger(`Pembayaran Gaji Karyawan PT Kedata Indonesia Digital - Masa Juni 2026 (${pegawai.length} Karyawan)`, totalSalary, '5001',
      // Beban Gaji
      '1001' // Kas & Bank
      );
      showToast(`Gaji Juni 2026 untuk ${pegawai.length} karyawan berhasil didistribusikan & diposting ke Jurnal.`);
    };
    const filteredEmployees = pegawai.filter(p => {
      return p.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) || p.jabatan.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
    const totalTaxesOwed = taxes.value.filter(t => t.status === 'Belum Setor').reduce((acc, t) => acc + t.nominal, 0);
    const overdueTaxCount = taxes.value.filter(t => t.status === 'Belum Setor' && new Date(t.jatuhTempo) < new Date()).length;
    const getOutstandingTax = (jenis: PajakKewajiban['jenis']) => taxes.value.find(t => t.jenis === jenis && t.status === 'Belum Setor');
    const getOutstandingTaxAmount = (jenis: PajakKewajiban['jenis']) => taxes.value.filter(t => t.jenis === jenis && t.status === 'Belum Setor').reduce((acc, t) => acc + t.nominal, 0);
    const formatTaxDate = (value: string) => new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const taxDescription = (jenis: PajakKewajiban['jenis'], masaPajak: string) => {
      if (jenis === 'PPN') return `PPN kurang bayar dari transaksi penjualan bulan ${masaPajak.replace(' 2026', '')}.`;
      if (jenis === 'PPh 21') return `PPh 21 karyawan periode ${masaPajak}.`;
      if (jenis === 'PPh 23') return `PPh 23 atas jasa vendor dan layanan profesional.`;
      return `Angsuran pajak periode ${masaPajak}.`;
    };
    const filteredTaxRows = taxes.value.filter(tax => {
      const matchesTab = taxTableTab.value === 'unpaid' ? tax.status === 'Belum Setor' : tax.status === 'Sudah Setor';
      const matchesType = taxTypeFilter.value === 'Semua' || tax.jenis === taxTypeFilter.value;
      const haystack = `${tax.jenis} ${tax.masaPajak} ${tax.status} ${tax.ntpn || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(taxSearchQuery.value.toLowerCase());
      return matchesTab && matchesType && matchesSearch;
    });
    const taxCalculationBase = taxCalculation.value.base === 'Pendapatan'
      ? Number(taxCalculationData?.revenue || 0)
      : taxCalculation.value.base === 'Laba Bersih'
        ? Math.max(Number(taxCalculationData?.net_profit || 0), 0)
        : Number(taxCalculationData?.expense || taxSummary?.total_unpaid || 0);
    const calculatedTax = Math.round(taxCalculationBase * (Number(taxCalculation.value.rate) || 0) / 100);
    const handleCreateTaxDraft = async () => {
      if (!calculatedTax || !taxCalculation.value.dueDate) {
        showToast('Nominal hasil kalkulasi dan jatuh tempo harus tersedia.');
        return;
      }
      await onCreateTax({
        jenis: taxCalculation.value.jenis,
        masaPajak: taxCalculation.value.period,
        nominal: calculatedTax,
        jatuhTempo: taxCalculation.value.dueDate,
        catatan: `Dibuat dari kalkulasi dengan dasar ${taxCalculation.value.base}.`,
      });
      setTaxTableTab('unpaid');
    };
    const resetTaxCalculation = () => {
      setTaxCalculation({
        period: 'Juli 2026',
        jenis: 'PPh 21',
        base: 'Pendapatan',
        rate: 2,
        dueDate: '2026-07-04'
      });
      showToast('Dasar kalkulasi pajak telah diperbarui.');
    };
    const taxCards = [{
      code: 'GL-2200',
      title: 'PPN Kurang Bayar',
      amount: getOutstandingTaxAmount('PPN'),
      taxId: getOutstandingTax('PPN')?.id,
      desc: 'Pajak Keluaran (11%) dari Invoice yang belum disetorkan.',
      accent: 'indigo'
    }, {
      code: 'GL-2210',
      title: 'PPh Pasal 21',
      amount: getOutstandingTaxAmount('PPh 21'),
      taxId: getOutstandingTax('PPh 21')?.id,
      desc: 'Pemotongan pajak atas gaji/upah karyawan bulan berjalan.',
      accent: 'emerald'
    }, {
      code: 'GL-2220',
      title: 'PPh Pasal 23',
      amount: getOutstandingTaxAmount('PPh 23'),
      taxId: getOutstandingTax('PPh 23')?.id,
      desc: 'Pajak atas jasa vendor/pihak ketiga yang dipotong perusahaan.',
      accent: 'rose'
    }];
    const labelClass = 'text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wide';
    const inputClass = 'w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all';
    const Field = ({
      label,
      children,
      dark = false
    }: {
      label: string;
      children: any;
      dark?: boolean;
    }) => <div class="space-y-2">
      <label class={dark ? 'text-[9px] font-extrabold text-[#64708F] uppercase tracking-wide' : labelClass}>{label}</label>
      {children}
    </div>;
    const formatPercentInput = (value: number) => String(value).replace('.', ',');
    const parsePercentInput = (value: string) => Number(value.replace(',', '.')) || 0;
    return () => <div class="space-y-6 font-sans">
      {/* Header switches */}
      {activeTab.value === 'sdm' && <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">Database SDM & Payroll</h1>
          <p class="text-sm text-[#53658A] mt-1">Integrasi HR Compliance, BPJS, dan Manajemen Dokumen Digital.</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button id="btn-open-bpjs-rates" onClick={() => setIsBpjsModalOpen(true)} class="h-10 px-6 rounded-2xl bg-white border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 transition-all">
            <Calculator class="w-4 h-4" /> Tarif BPJS
          </button>
          <button id="btn-register-employee" type="button" onClick={() => setIsEmployeeModalOpen(true)} class="h-10 px-6 rounded-2xl bg-[#0B1F4A] hover:bg-[#102A56] text-white font-extrabold text-sm shadow-lg shadow-[#0B1F4A]/20 flex items-center justify-center gap-2 transition-all">
            <Plus class="w-4 h-4" /> Registrasi Pegawai
          </button>
        </div>
      </div>}

      {/* 1. DIRECTORI SDM & BPJS SETTING view */}
      {activeTab.value === 'sdm' && <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-[#0B1F4A] flex items-center justify-center">
                <Users class="w-6 h-6" />
              </div>
              <div>
                <span class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase">Total Pegawai</span>
                <p class="text-2xl font-extrabold text-[#020B2D] leading-tight">0 Orang</p>
              </div>
            </div>

            <div class="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-[#EEF5FC] text-[#1E5AA8] flex items-center justify-center">
                <ShieldCheck class="w-6 h-6" />
              </div>
              <div>
                <span class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase">Kepatuhan BPJS</span>
                <p class="text-2xl font-extrabold text-[#1E5AA8] leading-tight">100% Aktif</p>
              </div>
            </div>

            <div class="bg-[#10182C] border border-[#10182C] rounded-[26px] p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-900/70 text-[#7C83FF] flex items-center justify-center">
                <DollarSign class="w-7 h-7" />
              </div>
              <div>
                <span class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase">Net Payroll MTD</span>
                <p class="text-2xl font-extrabold text-[#7C83FF] leading-tight">Rp 0</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div class="p-5 border-b border-slate-100">
              <div class="relative w-full max-w-[374px]">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#94A3B8]">
                  <Search class="w-4 h-4" />
                </span>
                <input id="staff-search-box" type="text" value={searchQuery.value} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari pegawai berdasarkan nama atau NIP..." class="w-full h-10 pl-10 pr-4 bg-white border border-[#D8E5F4] rounded-2xl text-sm text-[#1F2A44] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20" />
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-white text-[10px] text-[#94A3B8] uppercase font-extrabold tracking-[0.22em]">
                  <tr>
                    <th class="px-7 py-5">Identitas Pegawai</th>
                    <th class="px-7 py-5">Jabatan & Status</th>
                    <th class="px-7 py-5">Compliance</th>
                    <th class="px-7 py-5 text-[#0B1F4A]">Gaji Bersih (Net)</th>
                    <th class="px-7 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {filteredEmployees.map(staff => {
                  return <tr key={staff.id} class="hover:bg-slate-50 transition-colors">
                        <td class="px-7 py-4">
                          <span class="font-bold text-[#020B2D] block text-sm">{staff.nama}</span>
                          <span class="text-[10px] text-slate-400 font-mono">{staff.id}</span>
                        </td>
                        <td class="px-7 py-4 text-slate-700 font-semibold">{staff.jabatan}<span class="text-[10px] text-slate-400 block">{staff.status}</span></td>
                        <td class="px-7 py-4">
                          <span class={`text-[10px] px-2.5 py-1 rounded-full font-bold ${staff.compliance === 'Patuh' ? 'bg-[#EEF5FC] text-[#0B1F4A]' : 'bg-amber-50 text-amber-700'}`}>{staff.compliance}</span>
                        </td>
                        <td class="px-7 py-4 font-mono font-bold text-[#0B1F4A]">{formatRupiah(staff.gajiBersih)}</td>
                        <td class="px-7 py-4 text-center">
                          <button type="button" class="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider">Detail</button>
                        </td>
                      </tr>;
                })}
                </tbody>
              </table>
            </div>
          </div>
        </div>}

      {/* 2. KEPATUHAN PERPAJAKAN view */}
      {activeTab.value === 'pajak' && <div class="space-y-5">
          <header class="flex flex-col gap-4 border-b border-[#DCE7F4] pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]">Tax Compliance</p>
              <h1 class="mt-1.5 text-[28px] font-semibold tracking-[-0.025em] text-[#102A56]">Perpajakan</h1>
              <p class="mt-1 text-sm leading-6 text-[#6B7A90]">Hitung estimasi pajak dari jurnal posted, buat kewajiban pajak, lalu catat setoran dari Kas atau Bank.</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button id="btn-export-efaktur" type="button" onClick={() => showToast('Export CSV pajak sedang disiapkan.')} class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]">
                <FileText class="h-4 w-4 text-[#1E5AA8]" />
                Export CSV
              </button>
              <button id="btn-draft-spt" type="button" onClick={() => showToast('Dokumen PDF laporan pajak sedang disiapkan.')} class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]">
                <FileText class="h-4 w-4 text-[#1E5AA8]" />
                Cetak / Simpan PDF
              </button>
              <button id="btn-tax-manual" type="button" onClick={() => setIsTaxManualModalOpen(true)} class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]">
                <Plus class="h-4 w-4" />
                Tambah Manual
              </button>
            </div>
          </header>

          <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_10px_28px_rgba(16,42,86,0.045)]">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8CA8]">Kalkulasi Otomatis</p>
                <h2 class="mt-1 text-base font-semibold text-[#102A56]">Estimasi Pajak dari Kinerja Perusahaan</h2>
                <p class="mt-1 text-[12px] leading-5 text-[#6B7A90]">Sistem membaca jurnal posted. Tarif tidak dipaksa oleh sistem; pilih sesuai keputusan finance atau aturan yang berlaku.</p>
              </div>
              <button type="button" onClick={resetTaxCalculation} class="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[11px] font-medium text-[#1E5AA8] transition hover:bg-[#EEF5FF]">
                <RefreshCw class="h-3.5 w-3.5" /> Perbarui Dasar
              </button>
            </div>

            <div class="space-y-4 p-5">
              <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[['Pendapatan Posted', formatRupiah(81800000)], ['Beban Posted', formatRupiah(7426000)], ['Laba Bersih', formatRupiah(74374000)], ['Jurnal Posted', '13']].map(([label, value]) => <div key={label} class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3">
                    <p class="text-[10px] font-medium text-[#8A99AD]">{label}</p>
                    <p class="mt-1 text-sm font-semibold text-[#102A56]">{value}</p>
                  </div>)}
              </div>

              <div class="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_1.1fr_1.15fr_0.9fr_1.1fr]">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Periode</label>
                  <select value={taxCalculation.value.period} onChange={event => setTaxCalculation({
                  ...taxCalculation.value,
                  period: event.target.value
                })} class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10">
                    <option>Juli 2026</option>
                    <option>Juni 2026</option>
                    <option>Mei 2026</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Jenis Pajak</label>
                  <select value={taxCalculation.value.jenis} onChange={event => setTaxCalculation({
                  ...taxCalculation.value,
                  jenis: event.target.value as PajakKewajiban['jenis']
                })} class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10">
                    <option>PPN</option>
                    <option>PPh 21</option>
                    <option>PPh 23</option>
                    <option>PPh 25</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Dasar Perhitungan</label>
                  <select value={taxCalculation.value.base} onChange={event => setTaxCalculation({
                  ...taxCalculation.value,
                  base: event.target.value
                })} class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10">
                    <option>Pendapatan</option>
                    <option>Laba Bersih</option>
                    <option>Beban</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Tarif Pajak (%)</label>
                  <input type="number" min="0" value={taxCalculation.value.rate} onChange={event => setTaxCalculation({
                  ...taxCalculation.value,
                  rate: Number(event.target.value)
                })} class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Jatuh Tempo <span class="font-normal text-[#A5B3C6]">(opsional)</span></label>
                  <input type="date" value={taxCalculation.value.dueDate} onChange={event => setTaxCalculation({
                  ...taxCalculation.value,
                  dueDate: event.target.value
                })} class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1fr_1.15fr]">
                <div class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3">
                  <p class="text-[10px] font-medium text-[#8A99AD]">Dasar {taxCalculation.value.base}</p>
                  <p class="mt-1 text-sm font-semibold text-[#102A56]">{formatRupiah(taxCalculationBase)}</p>
                </div>
                <div class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3">
                  <p class="text-[10px] font-medium text-[#8A99AD]">Tarif Dipilih</p>
                  <p class="mt-1 text-sm font-semibold text-[#102A56]">{taxCalculation.value.rate}%</p>
                </div>
                <div class="rounded-xl border border-[#D7E8FA] bg-[#F7FBFF] px-3.5 py-3">
                  <p class="text-[10px] font-medium text-[#6983A4]">Estimasi {taxCalculation.value.jenis}</p>
                  <p class="mt-1 text-sm font-semibold text-[#1E5AA8]">{formatRupiah(calculatedTax)}</p>
                </div>
                <button type="button" onClick={handleCreateTaxDraft} class="inline-flex h-full min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]">
                  <Calculator class="h-4 w-4" /> Buat Draft dari Kalkulasi
                </button>
              </div>
            </div>
          </section>

          <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {taxCards.map(card => <article key={card.code} class="min-h-[126px] rounded-2xl border border-[#DCE7F4] bg-white p-4 shadow-[0_10px_28px_rgba(16,42,86,0.04)]">
                <p class="text-[11px] font-medium text-[#7A8CA8]">{card.title}</p>
                <p class="mt-2 text-xl font-semibold text-[#102A56]">{formatRupiah(card.amount)}</p>
                <p class="mt-2 text-[11px] leading-5 text-[#8A99AD]">
                  {card.title === 'PPN Kurang Bayar' ? 'PPN yang belum disetor' : card.title === 'PPh Pasal 21' ? 'Kewajiban PPh 21 belum disetor' : 'Kewajiban PPh 23 belum disetor'}
                </p>
              </article>)}
            <article class="min-h-[126px] rounded-2xl border border-[#DCE7F4] bg-white p-4 shadow-[0_10px_28px_rgba(16,42,86,0.04)]">
              <p class="text-[11px] font-medium text-[#7A8CA8]">Status Kepatuhan</p>
              <p class="mt-2 text-xl font-semibold text-[#1E5AA8]">{overdueTaxCount === 0 ? 'Patuh' : 'Perlu Setor'}</p>
              <p class="mt-2 text-[11px] leading-5 text-[#8A99AD]">{overdueTaxCount === 0 ? 'Tidak ada kewajiban melewati jatuh tempo' : `${overdueTaxCount} kewajiban melewati jatuh tempo`}</p>
            </article>
          </section>

          <section class="flex flex-col gap-3 rounded-2xl border border-[#DCE7F4] bg-[#F7FBFF] px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-[11px] font-medium text-[#7A8CA8]">Total Pajak Belum Dibayar</p>
              <p class="mt-1 text-lg font-semibold text-[#102A56]">{formatRupiah(totalTaxesOwed)}</p>
            </div>
            <p class="max-w-xl text-[11px] leading-5 text-[#7A8CA8]">Draft dari kalkulasi belum memengaruhi laporan. Jurnal dibuat saat Finance menerbitkan kewajiban pajak atau mencatat setoran.</p>
          </section>

          <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_10px_28px_rgba(16,42,86,0.045)]">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setTaxTableTab('unpaid')} class={`h-9 rounded-lg px-3 text-[11px] font-medium transition-all ${taxTableTab.value === 'unpaid' ? 'bg-[#0B1F4A] text-white shadow-sm' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`}>
                  Belum Dibayar
                </button>
                <button type="button" onClick={() => setTaxTableTab('history')} class={`h-9 rounded-lg px-3 text-[11px] font-medium transition-all ${taxTableTab.value === 'history' ? 'bg-[#0B1F4A] text-white shadow-sm' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`}>
                  Riwayat Setoran
                </button>
                <select value={taxTypeFilter.value} onChange={event => setTaxTypeFilter(event.target.value as 'Semua' | PajakKewajiban['jenis'])} class="h-9 rounded-lg border border-[#DCE7F4] bg-white px-3 text-[11px] font-medium text-[#64748B] outline-none focus:border-[#1E5AA8]">
                  <option value="Semua">Semua Status</option>
                  <option>PPN</option>
                  <option>PPh 21</option>
                  <option>PPh 23</option>
                  <option>PPh 25</option>
                </select>
              </div>

              <div class="flex w-full items-center gap-2 lg:w-auto">
                <div class="relative min-w-0 flex-1 lg:w-72">
                  <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                  <input type="text" value={taxSearchQuery.value} onChange={event => setTaxSearchQuery(event.target.value)} placeholder="Cari jenis pajak, periode, NTPN..." class="h-9 w-full rounded-lg border border-[#DCE7F4] bg-[#FBFCFE] pl-9 pr-3 text-[11px] text-[#243650] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" />
                </div>
                <button type="button" onClick={() => showToast('Data kewajiban pajak telah diperbarui.')} class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F4] bg-white px-3 text-[11px] font-medium text-[#1E5AA8] transition hover:bg-[#F8FBFE]">
                  <RefreshCw class="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            </div>

            <div class="p-4">
              <div class="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 class="text-sm font-semibold text-[#102A56]">Kewajiban Pajak</h2>
                  <p class="mt-1 text-[11px] leading-5 text-[#7A8CA8]">Alur: kalkulasi atau input manual → draft → terbitkan kewajiban → setor pajak → jurnal dan laporan diperbarui.</p>
                </div>
                <span class="shrink-0 text-[11px] text-[#7A8CA8]">{filteredTaxRows.length} data</span>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-[930px] w-full text-left">
                  <thead class="border-b border-[#E8EEF7] text-[10px] font-medium text-[#7A8CA8]">
                    <tr>
                      <th class="px-3 py-3">Jenis Pajak</th>
                      <th class="px-3 py-3">Periode</th>
                      <th class="px-3 py-3">Keterangan</th>
                      <th class="px-3 py-3 text-right">Nominal</th>
                      <th class="px-3 py-3">Jatuh Tempo</th>
                      <th class="px-3 py-3">Status</th>
                      <th class="px-3 py-3">NTPN</th>
                      <th class="px-3 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#EDF2F8]">
                    {filteredTaxRows.length === 0 ? <tr>
                        <td colSpan={8} class="px-3 py-12 text-center text-sm text-[#8A99AD]">Tidak ada data pajak yang sesuai.</td>
                      </tr> : filteredTaxRows.map(tax => <tr key={tax.id} class="transition hover:bg-[#FAFCFE]">
                          <td class="px-3 py-3.5">
                            <span class="inline-flex rounded-full bg-[#EEF5FF] px-2.5 py-1 text-[10px] font-medium text-[#1E5AA8]">{tax.jenis}</span>
                          </td>
                          <td class="px-3 py-3.5 text-[11px] font-medium text-[#40516A]">{tax.masaPajak}</td>
                          <td class="min-w-[280px] px-3 py-3.5">
                            <p class="text-[11px] leading-4 text-[#40516A]">{taxDescription(tax.jenis, tax.masaPajak)}</p>
                            <p class="mt-1 text-[10px] text-[#8A99AD]">Jurnal: TAX-{tax.id.replace('T-', '0')}</p>
                          </td>
                          <td class="px-3 py-3.5 text-right text-[11px] font-semibold text-[#102A56]">{formatRupiah(tax.nominal)}</td>
                          <td class="px-3 py-3.5 text-[11px] text-[#64748B]">{formatTaxDate(tax.jatuhTempo)}</td>
                          <td class="px-3 py-3.5">
                            <span class={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${tax.status === 'Belum Setor' ? 'bg-[#EEF5FC] text-[#0B1F4A]' : 'bg-[#EEF5FC] text-[#0B1F4A]'}`}>
                              {tax.status === 'Belum Setor' ? 'Belum Dibayar' : 'Sudah Disetor'}
                            </span>
                          </td>
                          <td class="px-3 py-3.5 text-[10px] text-[#64748B]">{tax.ntpn || '—'}</td>
                          <td class="px-3 py-3.5 text-right">
                            {tax.status === 'Belum Setor' ? <button type="button" onClick={() => {
                        setSelectedTaxId(tax.id);
                        setIsTaxPayModalOpen(true);
                      }} class="text-[11px] font-medium text-[#1E5AA8] transition hover:text-[#102A56]">
                                Setor Pajak
                              </button> : <span class="text-[10px] text-[#7A8CA8]">Sudah disetor</span>}
                          </td>
                        </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>}
      {/* 3. SET RATE BPJS MODAL */}
      {isBpjsModalOpen.value && <div class="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-100 rounded-[34px] w-full max-w-[560px] overflow-hidden shadow-2xl">
            <div class="px-8 py-7 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 class="font-extrabold text-lg text-[#111827] uppercase tracking-tight">Tarif BPJS Compliance</h3>
              </div>
              <button id="btn-close-bpjs" onClick={() => setIsBpjsModalOpen(false)} class="w-10 h-10 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="px-8 py-8 space-y-7 text-xs">
              <div class="space-y-5">
                <h4 class="text-[10px] text-[#1E5AA8] font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <HeartPulse class="w-3.5 h-3.5" /> BPJS Kesehatan (%)
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Porsi Perusahaan</label>
                    <input id="bpjs-kes-employer" type="text" inputMode="decimal" value={formatPercentInput(bpjsKesEmployer.value)} onChange={e => setBpjsKesEmployer(parsePercentInput(e.target.value))} class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 font-bold text-[#111827]" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Porsi Pegawai</label>
                    <input id="bpjs-kes-employee" type="text" inputMode="decimal" value={formatPercentInput(bpjsKesEmployee.value)} onChange={e => setBpjsKesEmployee(parsePercentInput(e.target.value))} class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 font-bold text-[#111827]" />
                  </div>
                </div>
              </div>

              <div class="space-y-5">
                <h4 class="text-[10px] text-[#0B1F4A] font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck class="w-3.5 h-3.5" /> BPJS Ketenagakerjaan (%)
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">JHT Perus.</label>
                    <input id="bpjs-jht-employer" type="text" inputMode="decimal" value={formatPercentInput(bpjsJhtEmployer.value)} onChange={e => setBpjsJhtEmployer(parsePercentInput(e.target.value))} class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">JHT Pegawai</label>
                    <input id="bpjs-jht-employee" type="text" inputMode="decimal" value={formatPercentInput(bpjsJhtEmployee.value)} onChange={e => setBpjsJhtEmployee(parsePercentInput(e.target.value))} class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">JP Perus.</label>
                    <input id="bpjs-jp-employer" type="text" inputMode="decimal" value={formatPercentInput(bpjsJpEmployer.value)} onChange={e => setBpjsJpEmployer(parsePercentInput(e.target.value))} class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">JP Pegawai</label>
                    <input id="bpjs-jp-employee" type="text" inputMode="decimal" value={formatPercentInput(bpjsJpEmployee.value)} onChange={e => setBpjsJpEmployee(parsePercentInput(e.target.value))} class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]" />
                  </div>
                </div>
              </div>

              <button id="btn-save-bpjs-rates" onClick={() => {
              setIsBpjsModalOpen(false);
              showToast('Tarif iuran BPJS berhasil diubah.');
            }} class="w-full h-12 bg-[#10182C] hover:bg-[#0B1120] text-white font-extrabold rounded-2xl transition-all uppercase tracking-widest text-xs">
                Simpan Perubahan Konfigurasi
              </button>
            </div>
          </div>
        </div>}

      {/* 4. EMPLOYEE REGISTRATION MODAL */}
      {isEmployeeModalOpen.value && <div class="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 overflow-y-auto">
          <div class="bg-white border border-slate-100 rounded-[40px] w-full max-w-[960px] overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
            <div class="px-10 py-8 border-b border-slate-100 flex justify-between items-start shrink-0">
              <div>
                <h3 class="font-extrabold text-2xl text-[#111827] uppercase tracking-tight">Registrasi Pegawai Baru</h3>
                <span class="text-[10px] text-[#64748B] font-extrabold uppercase tracking-[0.35em] block mt-1">Human Capital Management System</span>
              </div>
              <button id="btn-close-employee-modal" type="button" onClick={() => setIsEmployeeModalOpen(false)} class="w-12 h-12 flex items-center justify-center rounded-2xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X class="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={e => {
            e.preventDefault();
            setIsEmployeeModalOpen(false);
            showToast('Data registrasi pegawai berhasil disiapkan.');
          }} class="overflow-y-auto px-10 py-9 space-y-10 text-xs">
              <section class="space-y-6">
                <div class="flex items-center gap-2.5 pb-3 border-b border-[#D8E5F4]">
                  <UserCircle class="w-4 h-4 text-[#0B1F4A]" />
                  <h4 class="font-extrabold text-[12px] tracking-wider text-[#1F2A44] uppercase">Identitas Legal & Personal</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-5">
                  <Field label="Nama Lengkap Sesuai KTP"><input value={employeeForm.value.nama} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    nama: e.target.value
                  })} class={inputClass} /></Field>
                  <Field label="NIP (System)"><input value={employeeForm.value.nip} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    nip: e.target.value
                  })} class={inputClass} /></Field>
                  <Field label="NIK (16 Digit)"><input value={employeeForm.value.nik} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    nik: e.target.value
                  })} class={inputClass} /></Field>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Field label="Email Perusahaan"><input type="email" value={employeeForm.value.email} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    email: e.target.value
                  })} class={inputClass} /></Field>
                  <Field label="No. WhatsApp"><input value={employeeForm.value.whatsapp} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    whatsapp: e.target.value
                  })} class={inputClass} /></Field>
                  <Field label="NPWP (15/16 Digit)"><input value={employeeForm.value.npwp} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    npwp: e.target.value
                  })} class={inputClass} /></Field>
                </div>
              </section>

              <section class="bg-white border border-[#D8E5F4]/70 rounded-[30px] p-7 space-y-6">
                <div class="flex items-center gap-2.5 pb-3 border-b border-[#D8E5F4]">
                  <Building2 class="w-4 h-4 text-slate-500" />
                  <h4 class="font-extrabold text-[12px] tracking-wider text-[#1F2A44] uppercase">Detail Kepegawaian</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <Field label="Jabatan / Role"><input value={employeeForm.value.jabatan} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    jabatan: e.target.value
                  })} class={inputClass} /></Field>
                  <Field label="Departemen"><select value={employeeForm.value.departemen} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    departemen: e.target.value
                  })} class={inputClass}><option>Teknologi</option><option>Finance</option><option>HR</option><option>Operasional</option></select></Field>
                  <Field label="Status Kontrak"><select value={employeeForm.value.statusKontrak} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    statusKontrak: e.target.value
                  })} class={inputClass}><option>Karyawan Tetap</option><option>Kontrak</option><option>Probation</option></select></Field>
                  <Field label="Tanggal Bergabung"><input type="date" value={employeeForm.value.tanggalBergabung} onChange={e => setEmployeeForm({
                    ...employeeForm.value,
                    tanggalBergabung: e.target.value
                  })} class={inputClass} /></Field>
                </div>
              </section>

              <section class="space-y-6">
                <div class="flex items-center gap-2.5 pb-3 border-b border-[#D8E5F4]">
                  <HeartPulse class="w-4 h-4 text-[#1E5AA8]" />
                  <h4 class="font-extrabold text-[12px] tracking-wider text-[#1F2A44] uppercase">BPJS & Jaminan Sosial</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div class="space-y-5">
                    <span class="inline-flex px-3 py-1 rounded-full bg-[#EEF5FC] text-[#1E5AA8] text-[9px] font-extrabold uppercase">BPJS Kesehatan</span>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="No. Peserta"><input value={employeeForm.value.bpjsKesehatanNo} onChange={e => setEmployeeForm({
                        ...employeeForm.value,
                        bpjsKesehatanNo: e.target.value
                      })} class={inputClass} /></Field>
                      <Field label="Tipe Kepesertaan"><select value={employeeForm.value.bpjsKesehatanTipe} onChange={e => setEmployeeForm({
                        ...employeeForm.value,
                        bpjsKesehatanTipe: e.target.value
                      })} class={inputClass}><option>PPU (Penerima Upah)</option><option>Mandiri</option></select></Field>
                    </div>
                    <Field label="Fasilitas Kelas"><select value={employeeForm.value.bpjsKesehatanKelas} onChange={e => setEmployeeForm({
                      ...employeeForm.value,
                      bpjsKesehatanKelas: e.target.value
                    })} class={inputClass}><option>Kelas 1</option><option>Kelas 2</option><option>Kelas 3</option></select></Field>
                  </div>
                  <div class="space-y-5">
                    <span class="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-[#0B1F4A] text-[9px] font-extrabold uppercase">BPJS Ketenagakerjaan</span>
                    <Field label="No. KPJ"><input value={employeeForm.value.bpjsKetenagakerjaanNo} onChange={e => setEmployeeForm({
                      ...employeeForm.value,
                      bpjsKetenagakerjaanNo: e.target.value
                    })} class={inputClass} /></Field>
                    <div class="space-y-2">
                      <label class={labelClass}>Manfaat Aktif</label>
                      <div class="flex flex-wrap gap-2">
                        {['JKK', 'JKM', 'JHT', 'JP'].map(item => <span key={item} class="px-4 py-2 rounded-xl bg-[#0B1F4A] text-white text-[10px] font-extrabold">{item}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="bg-[#10182C] rounded-[36px] p-8 text-white space-y-7">
                <div class="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <CreditCard class="w-4 h-4 text-[#7C83FF]" />
                  <h4 class="font-extrabold text-[12px] tracking-wider uppercase">Kompensasi & Payroll</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
                  <div class="space-y-5">
                    <Field label="Gaji Pokok (Gross)" dark><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C83FF] font-bold">Rp</span><input type="number" value={employeeForm.value.gajiPokok || ''} onChange={e => setEmployeeForm({
                        ...employeeForm.value,
                        gajiPokok: Number(e.target.value)
                      })} class="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/15 text-white font-bold focus:outline-none" placeholder="0" /></div></Field>
                    <div class="grid grid-cols-2 gap-3">
                      <Field label="Bank Nama" dark><input placeholder="BCA/Mandiri..." value={employeeForm.value.bankNama} onChange={e => setEmployeeForm({
                        ...employeeForm.value,
                        bankNama: e.target.value
                      })} class="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-bold focus:outline-none" /></Field>
                      <Field label="No. Rekening" dark><input value={employeeForm.value.noRekening} onChange={e => setEmployeeForm({
                        ...employeeForm.value,
                        noRekening: e.target.value
                      })} class="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-bold focus:outline-none" /></Field>
                    </div>
                  </div>
                  <div class="rounded-[28px] border border-white/15 bg-white/5 p-7 min-h-[180px]">
                    <div class="flex justify-between items-start">
                      <span class="text-[10px] text-[#9AA4C7] font-extrabold uppercase tracking-wider">Simulasi Gaji Bersih (Net)</span>
                      <span class="px-3 py-1 rounded-full bg-[#EEF5FC]0/20 text-blue-200 text-[9px] font-extrabold uppercase">Pajak Ditanggung Perusahaan</span>
                    </div>
                    <div class="grid grid-cols-2 mt-9">
                      <div>
                        <span class="text-[10px] text-[#9AA4C7] font-bold uppercase">Gaji Kotor</span>
                        <p class="text-3xl font-black mt-2">{formatRupiah(employeeForm.value.gajiPokok)}</p>
                      </div>
                      <div class="text-right">
                        <span class="text-[10px] text-[#9AA4C7] font-bold uppercase">Gaji Bersih</span>
                        <p class="text-4xl font-black mt-2">{formatRupiah(employeeForm.value.gajiPokok)}</p>
                      </div>
                    </div>
                    <p class="text-[9px] text-[#7C849F] italic mt-6">* Perhitungan mencakup potongan iuran BPJS Pegawai sesuai konfigurasi sistem.</p>
                  </div>
                </div>
              </section>

              <section class="space-y-6">
                <div class="flex items-center gap-2.5 pb-3 border-b border-orange-100">
                  <FileText class="w-4 h-4 text-orange-500" />
                  <h4 class="font-extrabold text-[12px] tracking-wider text-[#1F2A44] uppercase">Arsip Dokumen Digital</h4>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {['Upload CV', 'Upload NIK', 'Upload NPWP', 'Upload Ijazah'].map(item => <button key={item} type="button" class="h-36 rounded-[22px] bg-[#F8FAFC] border border-dashed border-[#D8E5F4] flex flex-col items-center justify-center gap-3 text-[#94A3B8]">
                      <span class="w-10 h-10 rounded-2xl bg-[#E8EEF7] flex items-center justify-center"><Upload class="w-5 h-5" /></span>
                      <span class="text-[10px] font-extrabold uppercase">{item}</span>
                      <span class="text-[8px] font-bold uppercase text-slate-300">PDF / Image</span>
                    </button>)}
                </div>
              </section>

              <div class="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 pt-3">
                <button type="button" onClick={() => setIsEmployeeModalOpen(false)} class="h-[52px] border border-[#D8E5F4] rounded-2xl text-[#64748B] font-extrabold uppercase tracking-wider">Batal</button>
                <button id="btn-submit-employee" type="submit" class="h-[52px] bg-[#10182C] hover:bg-[#0B1120] text-white rounded-2xl font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"><CheckCircle2 class="w-4 h-4" /> Selesaikan Registrasi Pegawai</button>
              </div>
            </form>
          </div>
        </div>}

      {/* 5. PROCESS PAYROLL MODAL */}
      {isPayrollModalOpen.value && <div class="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 class="font-extrabold text-sm text-[#0B1F4A]">Proses Payout Payroll Gaji</h3>
                <span class="text-[10px] text-slate-400">Distribusi dana upah bulanan tim Kedata</span>
              </div>
              <button id="btn-close-payroll" onClick={() => setIsPayrollModalOpen(false)} class="text-slate-400 hover:text-slate-600 text-xs font-semibold">
                Batal
              </button>
            </div>

            <div class="p-6 space-y-4 text-xs">
              <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-2 text-blue-900">
                <p class="font-bold">Estimasi Pengeluaran Payroll:</p>
                <div class="font-mono space-y-1 text-xs">
                  <p>&bull; Karyawan Aktif: <span class="font-bold">{pegawai.length} Orang</span></p>
                  <p>&bull; Akumulasi Pokok (80%): <span class="font-bold">{formatRupiah(pegawai.reduce((acc, p) => acc + Math.round(p.gajiBersih * 0.8), 0))}</span></p>
                  <p>&bull; Akumulasi Tunjangan (20%): <span class="font-bold">{formatRupiah(pegawai.reduce((acc, p) => acc + Math.round(p.gajiBersih * 0.2), 0))}</span></p>
                  <p class="border-t border-blue-200 pt-1.5 font-sans font-extrabold text-[#0B1F4A] text-sm">
                    Grand Total: {formatRupiah(pegawai.reduce((acc, p) => acc + p.gajiBersih, 0))}
                  </p>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Sumber Rekening Dana Payout</label>
                <select id="payroll-source-bank" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs">
                  {akun.filter(a => a.kode.startsWith('1001')).map(a => <option key={a.id} value={a.kode}>{a.kode} - {a.nama} ({formatRupiah(a.saldo)})</option>)}
                </select>
              </div>

              <button id="btn-confirm-payout" onClick={handleProcessPayroll} class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white font-semibold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" /> Konfirmasi Disbursmen Payroll Gaji
              </button>
            </div>
          </div>
        </div>}

      {/* 5. TAX MANUAL DRAFT MODAL */}
      {isTaxManualModalOpen.value && <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F42]/45 p-4 backdrop-blur-[2px]">
          <div class="w-full max-w-[620px] overflow-hidden rounded-[22px] border border-[#DCE7F4] bg-white shadow-[0_24px_70px_rgba(16,42,86,0.22)]">
            <div class="flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-6 py-5">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]">Perpajakan</p>
                <h3 class="mt-1 text-base font-semibold text-[#102A56]">Tambah Kewajiban Pajak Manual</h3>
              </div>
              <button id="btn-close-tax-manual" type="button" onClick={() => setIsTaxManualModalOpen(false)} class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] text-[#8091A8] transition hover:bg-white hover:text-[#102A56]" aria-label="Tutup modal tambah pajak">
                <X class="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualTax} class="space-y-4 px-6 py-5">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Jenis Pajak</label>
                  <select value={manualTaxForm.value.jenis} onChange={event => setManualTaxForm({
                  ...manualTaxForm.value,
                  jenis: event.target.value as PajakKewajiban['jenis']
                })} class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10">
                    <option>PPN</option>
                    <option>PPh 21</option>
                    <option>PPh 23</option>
                    <option>PPh 25</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Periode Pajak</label>
                  <select value={manualTaxForm.value.period} onChange={event => setManualTaxForm({
                  ...manualTaxForm.value,
                  period: event.target.value
                })} class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10">
                    <option>Juli 2026</option>
                    <option>Juni 2026</option>
                    <option>Mei 2026</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Nominal Pajak</label>
                  <input type="number" min="0" value={manualTaxForm.value.nominal || ''} onChange={event => setManualTaxForm({
                  ...manualTaxForm.value,
                  nominal: Number(event.target.value)
                })} placeholder="0" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Jatuh Tempo <span class="font-normal text-[#A5B3C6]">(opsional)</span></label>
                  <input type="date" value={manualTaxForm.value.dueDate} onChange={event => setManualTaxForm({
                  ...manualTaxForm.value,
                  dueDate: event.target.value
                })} class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-medium text-[#7A8CA8]">Nomor Referensi <span class="font-normal text-[#A5B3C6]">(opsional)</span></label>
                <input type="text" value={manualTaxForm.value.reference} onChange={event => setManualTaxForm({
                ...manualTaxForm.value,
                reference: event.target.value
              })} placeholder="Nomor e-Billing atau referensi internal" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-medium text-[#7A8CA8]">Keterangan <span class="font-normal text-[#A5B3C6]">(opsional)</span></label>
                <textarea value={manualTaxForm.value.notes} onChange={event => setManualTaxForm({
                ...manualTaxForm.value,
                notes: event.target.value
              })} placeholder="Contoh: Koreksi pajak periode berjalan" class="min-h-[76px] w-full resize-none rounded-lg border border-[#DCE7F4] bg-white px-3 py-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
              </div>

              <div class="flex items-center justify-end gap-2 border-t border-[#E8EEF7] pt-4">
                <button type="button" onClick={() => setIsTaxManualModalOpen(false)} class="h-10 rounded-lg border border-[#DCE7F4] bg-white px-4 text-[12px] font-medium text-[#64748B] transition hover:bg-[#F8FBFE]">
                  Batal
                </button>
                <button id="btn-save-tax-manual" type="submit" class="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]">
                  <Save class="h-4 w-4" /> Simpan Draft Pajak
                </button>
              </div>
            </form>
          </div>
        </div>}

      {/* 5. TAX SSP SETTLEMENT MODAL */}
      {isTaxPayModalOpen.value && <div class="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 class="font-extrabold text-sm text-[#0B1F4A]">Setor Pajak SSP (E-Billing)</h3>
                <span class="text-[10px] text-slate-400">Penyetoran Surat Setoran Pajak ke Bank Persepsi</span>
              </div>
              <button id="btn-close-tax" onClick={() => setIsTaxPayModalOpen(false)} class="text-slate-400 hover:text-slate-600 text-xs font-semibold">
                Batal
              </button>
            </div>

            <form onSubmit={handlePayTax} class="p-6 space-y-4 text-xs">
              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Pilih Kewajiban Pajak Outstanding</label>
                <select id="tax-form-select" value={selectedTaxId.value} onChange={e => setSelectedTaxId(e.target.value)} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs">
                  <option value="">-- Pilih Masa Pajak --</option>
                  {taxes.value.filter(t => t.status !== 'Sudah Setor').map(t => <option key={t.id} value={t.id}>{t.jenis} - Masa {t.masaPajak} ({formatRupiah(t.nominal)})</option>)}
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Sumber Dana Rekening Kas & Bank</label>
                <select id="tax-form-bank" value={taxPaymentAccount.value} onChange={e => setTaxPaymentAccount(e.target.value)} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs">
                  {akun.filter(a => a.tipe === 'Aset').map(a => <option key={a.id} value={a.kode}>{a.kode} - {a.nama}</option>)}
                </select>
              </div>

              <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-500 text-[10px] space-y-1 leading-relaxed">
                <p class="font-bold text-slate-700">Catatan Integrasi DJP:</p>
                <p>Pembayaran akan memproses Surat Setoran Pajak (SSP) secara instan melalui API Bank Persepsi dan menerbitkan Nomor Transaksi Penerimaan Negara (NTPN) resmi.</p>
              </div>

              <button id="btn-tax-submit" type="submit" disabled={!selectedTaxId.value} class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" /> Setor SSP & Dapatkan NTPN
              </button>
            </form>
          </div>
        </div>}
    </div>;
  }
});
</script>
