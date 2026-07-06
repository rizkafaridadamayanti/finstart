<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, ref } from "vue";
import { Users, Percent, ShieldCheck, HeartPulse, Plus, Search, CheckCircle2, DollarSign, ArrowRight, Calculator, Landmark, FileText, RefreshCw, AlertTriangle, CreditCard, X, Save, Upload, Building2, UserCircle } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { Pegawai, AkunBukuBesar } from '../types.ts';
import { financeApi, getApiErrorMessage } from '../services/financeApi.js';
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
  onRefreshData?: () => Promise<any> | void;
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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentPayrollPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function asNumber(value: any) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}
export default defineComponent({
  name: "SdmDanPajak",
  props: ["activeSection", "pegawai", "akun", "taxes", "taxSummary", "taxCalculationData", "onAddJournalFromSubledger", "onCreateTax", "onPayTax", "onRefreshData", "showToast"],
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
      onRefreshData,
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
    const bpjsKesEmployer = ref(0),
      setBpjsKesEmployer = next => bpjsKesEmployer.value = typeof next === "function" ? next(bpjsKesEmployer.value) : next;
    const bpjsKesEmployee = ref(0),
      setBpjsKesEmployee = next => bpjsKesEmployee.value = typeof next === "function" ? next(bpjsKesEmployee.value) : next;
    const bpjsJhtEmployer = ref(0),
      setBpjsJhtEmployer = next => bpjsJhtEmployer.value = typeof next === "function" ? next(bpjsJhtEmployer.value) : next;
    const bpjsJhtEmployee = ref(0),
      setBpjsJhtEmployee = next => bpjsJhtEmployee.value = typeof next === "function" ? next(bpjsJhtEmployee.value) : next;
    const bpjsJpEmployer = ref(0),
      setBpjsJpEmployer = next => bpjsJpEmployer.value = typeof next === "function" ? next(bpjsJpEmployer.value) : next;
    const bpjsJpEmployee = ref(0),
      setBpjsJpEmployee = next => bpjsJpEmployee.value = typeof next === "function" ? next(bpjsJpEmployee.value) : next;

    const divisions = ref<any[]>([]);
    const positions = ref<any[]>([]);
    const payrollAccounts = ref<any[]>([]);
    const payrollSummary = ref<any>({
      payroll_count: 0,
      total_base_salary: 0,
      total_employee_bpjs_deduction: 0,
      total_employer_bpjs_contribution: 0,
      total_net_pay: 0,
    });
    const employeeForm = ref({
        nama: '',
        nip: '',
        nik: '',
        email: '',
        whatsapp: '',
        npwp: '',
        jabatan: '',
        departemen: '',
        divisionId: '',
        positionId: '',
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
      setEmployeeForm = next => employeeForm.value = typeof next === "function" ? next(employeeForm.value) : next;

    const payrollForm = ref({
      employeeId: '',
      payrollPeriod: currentPayrollPeriod(),
      paymentDate: todayIso(),
      cashAccountId: '',
    });

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

    async function refreshMasterData() {
      const period = payrollForm.value.payrollPeriod || currentPayrollPeriod();
      const jobs = await Promise.allSettled([
        financeApi.get('/divisions'),
        financeApi.get('/positions'),
        financeApi.get('/bpjs-config'),
        financeApi.get('/payroll/summary', { period }),
        financeApi.get('/payroll/accounts'),
      ]);

      const value = (index: number, fallback: any) => jobs[index].status === 'fulfilled'
        ? (jobs[index] as PromiseFulfilledResult<any>).value
        : fallback;

      divisions.value = Array.isArray(value(0, [])) ? value(0, []) : [];
      positions.value = Array.isArray(value(1, [])) ? value(1, []) : [];

      const bpjs = value(2, {});
      setBpjsKesEmployer(asNumber(bpjs.health_company_rate));
      setBpjsKesEmployee(asNumber(bpjs.health_employee_rate));
      setBpjsJhtEmployer(asNumber(bpjs.jht_company_rate));
      setBpjsJhtEmployee(asNumber(bpjs.jht_employee_rate));
      setBpjsJpEmployer(asNumber(bpjs.jp_company_rate));
      setBpjsJpEmployee(asNumber(bpjs.jp_employee_rate));

      Object.assign(payrollSummary.value, value(3, {}));
      payrollAccounts.value = Array.isArray(value(4, [])) ? value(4, []) : [];

      if (!payrollForm.value.employeeId && pegawai.length) {
        payrollForm.value.employeeId = String(pegawai[0]?._raw?.id || '');
      }
      if (!payrollForm.value.cashAccountId && payrollAccounts.value.length) {
        payrollForm.value.cashAccountId = String(payrollAccounts.value[0].id);
      }

      const failed = jobs.find((job) => job.status === 'rejected') as PromiseRejectedResult | undefined;
      if (failed) {
        console.error(failed.reason);
        showToast(getApiErrorMessage(failed.reason, 'Sebagian data SDM belum dapat dimuat.'));
      }
    }

    async function refreshAllData() {
      await refreshMasterData();
      if (onRefreshData) await onRefreshData();
    }

    async function handleSaveBpjs() {
      try {
        await financeApi.put('/bpjs-config', {
          health_company_rate: asNumber(bpjsKesEmployer.value),
          health_employee_rate: asNumber(bpjsKesEmployee.value),
          jht_company_rate: asNumber(bpjsJhtEmployer.value),
          jht_employee_rate: asNumber(bpjsJhtEmployee.value),
          jp_company_rate: asNumber(bpjsJpEmployer.value),
          jp_employee_rate: asNumber(bpjsJpEmployee.value),
          effective_date: todayIso(),
          notes: 'Konfigurasi BPJS diperbarui dari workspace FinStart.',
        });
        await refreshMasterData();
        setIsBpjsModalOpen(false);
        showToast('Tarif iuran BPJS berhasil disimpan ke database.');
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, 'Gagal menyimpan konfigurasi BPJS.'));
      }
    }

    async function handleCreateEmployee(event: Event) {
      event.preventDefault();

      const divisionId = Number(employeeForm.value.divisionId);
      const positionId = Number(employeeForm.value.positionId);
      if (!employeeForm.value.nama || !employeeForm.value.nik || !divisionId || !positionId) {
        showToast('Nama, NIK, divisi, dan jabatan wajib diisi.');
        return;
      }

      const employmentType = employeeForm.value.statusKontrak === 'Karyawan Tetap'
        ? 'permanent'
        : employeeForm.value.statusKontrak === 'Kontrak'
          ? 'contract'
          : 'intern';

      try {
        await financeApi.post('/employees', {
          employee_code: employeeForm.value.nip || undefined,
          full_name: employeeForm.value.nama,
          nik: employeeForm.value.nik,
          email: employeeForm.value.email || '',
          phone: employeeForm.value.whatsapp || '',
          division_id: divisionId,
          position_id: positionId,
          employment_type: employmentType,
          ptkp_status: 'TK/0',
          bpjs_status: 'active',
          employment_status: 'active',
          join_date: employeeForm.value.tanggalBergabung || todayIso(),
          base_salary: asNumber(employeeForm.value.gajiPokok),
        });

        setEmployeeForm({
          nama: '',
          nip: '',
          nik: '',
          email: '',
          whatsapp: '',
          npwp: '',
          jabatan: '',
          departemen: '',
          divisionId: '',
          positionId: '',
          statusKontrak: 'Karyawan Tetap',
          tanggalBergabung: todayIso(),
          bpjsKesehatanNo: '',
          bpjsKesehatanTipe: 'PPU (Penerima Upah)',
          bpjsKesehatanKelas: 'Kelas 1',
          bpjsKetenagakerjaanNo: '',
          gajiPokok: 0,
          bankNama: '',
          noRekening: '',
        });

        setIsEmployeeModalOpen(false);
        await refreshAllData();
        showToast('Pegawai berhasil disimpan ke database.');
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, 'Gagal menyimpan pegawai.'));
      }
    }

    function selectedPayrollEmployee() {
      return pegawai.find((item: any) => String(item?._raw?.id || '') === String(payrollForm.value.employeeId || ''));
    }

    async function handleProcessPayroll() {
      const employeeId = Number(payrollForm.value.employeeId);
      const cashAccountId = Number(payrollForm.value.cashAccountId);
      if (!employeeId || !cashAccountId) {
        showToast('Pilih pegawai dan akun Kas/Bank terlebih dahulu.');
        return;
      }

      try {
        const result = await financeApi.post('/payroll/process', {
          employee_id: employeeId,
          payroll_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
          payment_date: payrollForm.value.paymentDate || todayIso(),
          cash_account_id: cashAccountId,
          notes: 'Payroll diproses dari workspace FinStart.',
        });

        setIsPayrollModalOpen(false);
        await refreshAllData();
        showToast(`Payroll ${result.employee_name || 'pegawai'} berhasil diposting dengan voucher ${result.voucher_number || '-'}.`);
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, 'Gagal memproses payroll.'));
      }
    }
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
    // Vue JSX mengirim isi <Field> sebagai default slot, bukan props.children.
    // Karena itu gunakan slots.default() agar semua input/select di form tampil.
    const Field = (
      { label, dark = false }: { label: string; dark?: boolean },
      { slots }: any,
    ) => <div class="space-y-2">
      <label class={dark ? 'text-[9px] font-extrabold text-[#64708F] uppercase tracking-wide' : labelClass}>{label}</label>
      {slots.default ? slots.default() : null}
    </div>;
    const formatPercentInput = (value: number) => String(value).replace('.', ',');
    const parsePercentInput = (value: string) => Number(value.replace(',', '.')) || 0;

    const employeeCount = () => pegawai.length;
    const activeBpjsCount = () => pegawai.filter((item: any) => String(item?._raw?.bpjs_status || '').toLowerCase() === 'active').length;
    const bpjsCompliancePercent = () => employeeCount() ? Math.round(activeBpjsCount() / employeeCount() * 100) : 0;
    const filteredPositions = () => positions.value.filter((position: any) => {
      const divisionId = Number(employeeForm.value.divisionId || 0);
      return !divisionId || !position.division_id || Number(position.division_id) === divisionId;
    });
    const currentPayrollEmployee = () => selectedPayrollEmployee();
    const currentPayrollAmount = () => asNumber(currentPayrollEmployee()?.gajiBersih);

    onMounted(() => {
      refreshMasterData();
    });

    return () => <div class="space-y-6 font-sans">
      {/* Header switches */}
      {activeTab.value === 'sdm' && <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">Database SDM & Payroll</h1>
          <p class="text-sm text-[#53658A] mt-1">Integrasi HR Compliance, BPJS, dan Manajemen Dokumen Digital.</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button id="btn-open-bpjs-rates" onClick={() => setIsBpjsModalOpen(true)} class="h-10 px-5 rounded-2xl bg-white border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 transition-all">
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF5FC] text-[10px] text-[#1E5AA8]">1</span>
            <Calculator class="w-4 h-4" /> Atur BPJS
          </button>
          <button id="btn-register-employee" type="button" onClick={() => setIsEmployeeModalOpen(true)} class="h-10 px-5 rounded-2xl bg-[#0B1F4A] hover:bg-[#102A56] text-white font-extrabold text-sm shadow-lg shadow-[#0B1F4A]/20 flex items-center justify-center gap-2 transition-all">
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[10px]">2</span>
            <Plus class="w-4 h-4" /> Tambah Pegawai
          </button>
          <button id="btn-open-payroll" type="button" onClick={() => {
            if (!pegawai.length) {
              showToast('Tambahkan pegawai aktif terlebih dahulu.');
              return;
            }
            refreshMasterData();
            setIsPayrollModalOpen(true);
          }} class="h-10 px-5 rounded-2xl bg-[#10182C] hover:bg-[#0B1120] text-white font-extrabold text-sm shadow-lg shadow-[#10182C]/20 flex items-center justify-center gap-2 transition-all">
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[10px]">3</span>
            <DollarSign class="w-4 h-4" /> Proses Payroll
          </button>
        </div>
      </div>}

      {/* 1. DIRECTORI SDM & BPJS SETTING view */}
      {activeTab.value === 'sdm' && <div class="space-y-6">
          <div class="rounded-2xl border border-[#D8E5F4] bg-white px-5 py-4 shadow-sm">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1E5AA8]">Alur cepat</p>
                <p class="mt-1 text-sm font-semibold text-[#0B1F4A]">Atur tarif BPJS sekali, tambah pegawai, lalu proses payroll setiap bulan.</p>
              </div>
              <p class="text-[11px] leading-5 text-[#6B7A90]">Tarif BPJS hanya berlaku untuk payroll baru; payroll yang sudah diposting tidak berubah.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-[#0B1F4A] flex items-center justify-center">
                <Users class="w-6 h-6" />
              </div>
              <div>
                <span class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase">Total Pegawai</span>
                <p class="text-2xl font-extrabold text-[#020B2D] leading-tight">{employeeCount()} Orang</p>
              </div>
            </div>

            <div class="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-[#EEF5FC] text-[#1E5AA8] flex items-center justify-center">
                <ShieldCheck class="w-6 h-6" />
              </div>
              <div>
                <span class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase">Kepatuhan BPJS</span>
                <p class="text-2xl font-extrabold text-[#1E5AA8] leading-tight">{bpjsCompliancePercent()}% Aktif</p>
              </div>
            </div>

            <div class="bg-[#10182C] border border-[#10182C] rounded-[26px] p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-900/70 text-[#7C83FF] flex items-center justify-center">
                <DollarSign class="w-7 h-7" />
              </div>
              <div>
                <span class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase">Net Payroll MTD</span>
                <p class="text-2xl font-extrabold text-[#7C83FF] leading-tight">{formatRupiah(asNumber(payrollSummary.value.total_net_pay))}</p>
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
                <p class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1E5AA8]">Langkah 1 dari 3</p>
                <h3 class="mt-1 font-extrabold text-lg text-[#111827] tracking-tight">Pengaturan Tarif BPJS</h3>
                <p class="mt-1 text-xs text-[#64748B]">Diatur sekali oleh admin dan dipakai untuk payroll berikutnya.</p>
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

              <button id="btn-save-bpjs-rates" onClick={handleSaveBpjs} class="w-full h-12 bg-[#10182C] hover:bg-[#0B1120] text-white font-extrabold rounded-2xl transition-all uppercase tracking-widest text-xs">
                Simpan Tarif BPJS
              </button>
            </div>
          </div>
        </div>}

      {/* 4. EMPLOYEE REGISTRATION MODAL */}
      {isEmployeeModalOpen.value && <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1220]/60 p-3 backdrop-blur-sm">
          <div class="my-6 flex w-full max-w-[760px] flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl">
            <div class="flex items-start justify-between border-b border-slate-100 px-7 py-6">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#1E5AA8]">Langkah 2 dari 3</p>
                <h3 class="mt-1 text-xl font-extrabold tracking-tight text-[#111827]">Tambah Pegawai</h3>
                <p class="mt-1 text-xs leading-5 text-[#64748B]">Isi data wajib terlebih dahulu. Data tambahan dapat dilengkapi kemudian.</p>
              </div>
              <button id="btn-close-employee-modal" type="button" onClick={() => setIsEmployeeModalOpen(false)} class="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-slate-600">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} class="space-y-6 px-7 py-6 text-xs">
              <section class="space-y-4">
                <div class="flex items-center gap-2 border-b border-[#D8E5F4] pb-3">
                  <UserCircle class="w-4 h-4 text-[#0B1F4A]" />
                  <h4 class="font-extrabold uppercase tracking-wider text-[#1F2A44]">Data Wajib Pegawai</h4>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Nama Lengkap"><input required value={employeeForm.value.nama} onChange={e => setEmployeeForm({ ...employeeForm.value, nama: e.target.value })} class={inputClass} placeholder="Contoh: Rizka Farida Damayanti" /></Field>
                  <Field label="NIK"><input required value={employeeForm.value.nik} onChange={e => setEmployeeForm({ ...employeeForm.value, nik: e.target.value })} class={inputClass} placeholder="Nomor identitas pegawai" /></Field>
                  <Field label="Email"><input type="email" value={employeeForm.value.email} onChange={e => setEmployeeForm({ ...employeeForm.value, email: e.target.value })} class={inputClass} placeholder="nama@perusahaan.com" /></Field>
                  <Field label="No. WhatsApp"><input value={employeeForm.value.whatsapp} onChange={e => setEmployeeForm({ ...employeeForm.value, whatsapp: e.target.value })} class={inputClass} placeholder="08xxxxxxxxxx" /></Field>
                  <Field label="Divisi"><select required value={employeeForm.value.divisionId} onChange={e => setEmployeeForm({ ...employeeForm.value, divisionId: e.target.value, positionId: '' })} class={inputClass}>
                    <option value="">Pilih divisi</option>
                    {divisions.value.map((division: any) => <option key={division.id} value={String(division.id)}>{division.name}</option>)}
                  </select></Field>
                  <Field label="Jabatan"><select required value={employeeForm.value.positionId} onChange={e => setEmployeeForm({ ...employeeForm.value, positionId: e.target.value })} class={inputClass}>
                    <option value="">Pilih jabatan</option>
                    {filteredPositions().map((position: any) => <option key={position.id} value={String(position.id)}>{position.name}</option>)}
                  </select></Field>
                  <Field label="Status Kerja"><select value={employeeForm.value.statusKontrak} onChange={e => setEmployeeForm({ ...employeeForm.value, statusKontrak: e.target.value })} class={inputClass}>
                    <option>Karyawan Tetap</option><option>Kontrak</option><option>Probation</option>
                  </select></Field>
                  <Field label="Tanggal Bergabung"><input required type="date" value={employeeForm.value.tanggalBergabung} onChange={e => setEmployeeForm({ ...employeeForm.value, tanggalBergabung: e.target.value })} class={inputClass} /></Field>
                  <div class="md:col-span-2"><Field label="Gaji Pokok"><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1E5AA8]">Rp</span><input required type="number" min="0" value={employeeForm.value.gajiPokok || ''} onChange={e => setEmployeeForm({ ...employeeForm.value, gajiPokok: Number(e.target.value) })} class={`${inputClass} pl-12`} placeholder="0" /></div></Field></div>
                </div>
              </section>

              <details class="rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] px-5 py-4">
                <summary class="cursor-pointer list-none font-extrabold text-[#0B1F4A]">+ Data tambahan (opsional)</summary>
                <p class="mt-2 text-[11px] leading-5 text-[#6B7A90]">Nomor BPJS, bank, dan NIP dapat dilengkapi nanti. Data ini belum diperlukan untuk membuat payroll dasar.</p>
                <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="NIP Sistem"><input value={employeeForm.value.nip} onChange={e => setEmployeeForm({ ...employeeForm.value, nip: e.target.value })} class={inputClass} /></Field>
                  <Field label="Nomor BPJS Kesehatan"><input value={employeeForm.value.bpjsKesehatanNo} onChange={e => setEmployeeForm({ ...employeeForm.value, bpjsKesehatanNo: e.target.value })} class={inputClass} /></Field>
                  <Field label="Nomor KPJ"><input value={employeeForm.value.bpjsKetenagakerjaanNo} onChange={e => setEmployeeForm({ ...employeeForm.value, bpjsKetenagakerjaanNo: e.target.value })} class={inputClass} /></Field>
                  <Field label="Nama Bank"><input value={employeeForm.value.bankNama} onChange={e => setEmployeeForm({ ...employeeForm.value, bankNama: e.target.value })} class={inputClass} /></Field>
                  <Field label="Nomor Rekening"><input value={employeeForm.value.noRekening} onChange={e => setEmployeeForm({ ...employeeForm.value, noRekening: e.target.value })} class={inputClass} /></Field>
                  <Field label="NPWP"><input value={employeeForm.value.npwp} onChange={e => setEmployeeForm({ ...employeeForm.value, npwp: e.target.value })} class={inputClass} /></Field>
                </div>
              </details>

              <div class="flex flex-col-reverse gap-3 border-t border-[#E8EEF7] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsEmployeeModalOpen(false)} class="h-11 rounded-xl border border-[#D8E5F4] px-5 font-extrabold text-[#64748B]">Batal</button>
                <button id="btn-submit-employee" type="submit" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10182C] px-6 font-extrabold text-white shadow-lg shadow-[#10182C]/20"><CheckCircle2 class="w-4 h-4" /> Simpan Pegawai</button>
              </div>
            </form>
          </div>
        </div>}

      {/* 5. PROCESS PAYROLL MODAL */}
      {isPayrollModalOpen.value && <div class="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#1E5AA8]">Langkah 3 dari 3</p>
                <h3 class="mt-1 font-extrabold text-sm text-[#0B1F4A]">Proses Payroll</h3>
                <span class="text-[10px] text-slate-400">Pilih pegawai, periode, dan akun pembayaran.</span>
              </div>
              <button id="btn-close-payroll" onClick={() => setIsPayrollModalOpen(false)} class="text-slate-400 hover:text-slate-600 text-xs font-semibold">
                Batal
              </button>
            </div>

            <div class="p-6 space-y-4 text-xs">
              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Pegawai yang Diproses</label>
                <select id="payroll-employee" value={payrollForm.value.employeeId} onChange={event => payrollForm.value.employeeId = event.target.value} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs">
                  <option value="">-- Pilih pegawai --</option>
                  {pegawai.map((employee: any) => <option key={employee?._raw?.id || employee.id} value={String(employee?._raw?.id || '')}>{employee.nama} · {employee.id}</option>)}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700">Periode Payroll</label>
                  <input id="payroll-period" type="month" value={payrollForm.value.payrollPeriod} onChange={event => payrollForm.value.payrollPeriod = event.target.value} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs" />
                </div>
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700">Tanggal Bayar</label>
                  <input id="payroll-payment-date" type="date" value={payrollForm.value.paymentDate} onChange={event => payrollForm.value.paymentDate = event.target.value} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs" />
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-2 text-blue-900">
                <p class="font-bold">Estimasi Payroll Terpilih:</p>
                <div class="font-mono space-y-1 text-xs">
                  <p>&bull; Pegawai: <span class="font-bold">{currentPayrollEmployee()?.nama || '—'}</span></p>
                  <p>&bull; Gaji Pokok: <span class="font-bold">{formatRupiah(currentPayrollAmount())}</span></p>
                  <p>&bull; Net Payroll MTD: <span class="font-bold">{formatRupiah(asNumber(payrollSummary.value.total_net_pay))}</span></p>
                  <p class="border-t border-blue-200 pt-1.5 font-sans font-extrabold text-[#0B1F4A] text-sm">
                    Nilai Payroll: {formatRupiah(currentPayrollAmount())}
                  </p>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Sumber Rekening Dana Payout</label>
                <select id="payroll-source-bank" value={payrollForm.value.cashAccountId} onChange={event => payrollForm.value.cashAccountId = event.target.value} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs">
                  <option value="">-- Pilih Kas/Bank --</option>
                  {payrollAccounts.value.map((account: any) => <option key={account.id} value={String(account.id)}>{account.code} - {account.name}</option>)}
                </select>
              </div>

              <button id="btn-confirm-payout" onClick={handleProcessPayroll} class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white font-semibold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" /> Proses & Posting Payroll
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
