<script lang="tsx">
import { Fragment, computed, defineComponent, h, onMounted, ref, Teleport } from "vue";
import { Users, Percent, ShieldCheck, HeartPulse, Plus, Search, CheckCircle2, DollarSign, ArrowRight, Calculator, Landmark, FileText, RefreshCw, AlertTriangle, CreditCard, X, Save, Upload, UserCircle, Eye, Pencil, Trash2, Building2, BriefcaseBusiness, Power } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { Pegawai, AkunBukuBesar } from '../types.ts';
import { financeApi, getApiErrorMessage } from '../services/financeApi.js';
import { TablePagination, latestFirst, pageRows, safePage } from '../utils/tablePagination.tsx';
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
  jenis: 'PPN' | 'PPh 21' | 'PPh 23' | 'PPh 25' | 'PPh Final' | 'PPh Badan' | 'Lainnya';
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

function currentTaxDueDate() {
  const period = currentPayrollPeriod();
  const [year, month] = period.split('-').map(Number);
  const due = new Date(year, month, 10);
  return due.toISOString().slice(0, 10);
}

function formatPeriodLabel(period: string) {
  const [year, month] = String(period || '').split('-').map(Number);
  if (!year || !month) return period || '—';
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function recentTaxPeriods(count = 12) {
  const result: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let index = 0; index < count; index += 1) {
    result.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return result;
}

function asNumber(value: any) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function maskValue(value: any, visible = 4) {
  const text = String(value || '').trim();
  if (!text) return '—';
  if (text.length <= visible) return text;
  return `${'•'.repeat(Math.max(4, text.length - visible))}${text.slice(-visible)}`;
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
    const employeePage = ref(1);
    const masterPage = ref(1);
    const taxPage = ref(1);
    const isBpjsModalOpen = ref(false),
      setIsBpjsModalOpen = next => isBpjsModalOpen.value = typeof next === "function" ? next(isBpjsModalOpen.value) : next;
    const isEmployeeModalOpen = ref(false),
      setIsEmployeeModalOpen = next => isEmployeeModalOpen.value = typeof next === "function" ? next(isEmployeeModalOpen.value) : next;
    const isEmployeeDetailOpen = ref(false),
      setIsEmployeeDetailOpen = next => isEmployeeDetailOpen.value = typeof next === "function" ? next(isEmployeeDetailOpen.value) : next;
    const selectedEmployeeDetail = ref<any>(null);
    const editingEmployee = ref<any>(null);
    const isMasterDataModalOpen = ref(false);
    const isMasterEditorOpen = ref(false);
    const masterDataTab = ref<'division' | 'position'>('division');
    const masterSearch = ref('');
    const masterBusy = ref(false);
    const editingMasterData = ref<any>(null);
    const masterDataForm = ref({
      id: '',
      type: 'division' as 'division' | 'position',
      code: '',
      name: '',
      description: '',
      status: 'active',
      divisionId: '',
    });
    const isPayrollModalOpen = ref(false),
      setIsPayrollModalOpen = next => isPayrollModalOpen.value = typeof next === "function" ? next(isPayrollModalOpen.value) : next;
    const isTaxPayModalOpen = ref(false),
      setIsTaxPayModalOpen = next => isTaxPayModalOpen.value = typeof next === "function" ? next(isTaxPayModalOpen.value) : next;
    const isTaxManualModalOpen = ref(false),
      setIsTaxManualModalOpen = next => isTaxManualModalOpen.value = typeof next === "function" ? next(isTaxManualModalOpen.value) : next;
    const payslipPreview = ref<any>(null);
    const pph21Estimate = ref<any>(null);

    function openEmployeeDetail(employee: any) {
      selectedEmployeeDetail.value = employee;
      setIsEmployeeDetailOpen(true);
    }

    function closeEmployeeDetail() {
      selectedEmployeeDetail.value = null;
      setIsEmployeeDetailOpen(false);
    }

    function employeeDetailSource() {
      return selectedEmployeeDetail.value?._raw || selectedEmployeeDetail.value || {};
    }
    const taxCalculation = ref({
        period: currentPayrollPeriod(),
        jenis: 'PPh 21' as PajakKewajiban['jenis'],
        base: 'Pendapatan',
        rate: 2,
        dueDate: currentTaxDueDate()
      }),
      setTaxCalculation = next => taxCalculation.value = typeof next === "function" ? next(taxCalculation.value) : next;
    const manualTaxForm = ref({
      jenis: 'PPh 21' as PajakKewajiban['jenis'],
      period: currentPayrollPeriod(),
      subjectName: '',
      subjectIdentity: '',
      taxObject: 'Gaji, upah, honorarium, atau imbalan',
      taxBase: 0,
      rate: 0,
      nominal: 0,
      dueDate: '',
      reference: '',
      notes: ''
    });
    const setManualTaxForm = (next: any) => {
      manualTaxForm.value = typeof next === "function"
        ? next(manualTaxForm.value)
        : next;
    };

    const manualTaxOptions: Array<{
      value: PajakKewajiban['jenis'];
      label: string;
      hint: string;
      defaultObject: string;
    }> = [
      {
        value: 'PPh 21',
        label: 'PPh 21',
        hint: 'Pemotongan atas gaji, upah, honorarium, atau imbalan orang pribadi.',
        defaultObject: 'Gaji, upah, honorarium, atau imbalan',
      },
      {
        value: 'PPh 23',
        label: 'PPh 23',
        hint: 'Pemotongan atas jasa, sewa selain tanah/bangunan, atau penghasilan tertentu.',
        defaultObject: 'Jasa / sewa / penghasilan pihak ketiga',
      },
      {
        value: 'PPh 25',
        label: 'PPh 25',
        hint: 'Angsuran PPh badan pada masa pajak berjalan.',
        defaultObject: 'Angsuran PPh badan',
      },
      {
        value: 'PPh Final',
        label: 'PPh Final',
        hint: 'Pajak penghasilan final sesuai objek penghasilan.',
        defaultObject: 'Objek penghasilan final',
      },
      {
        value: 'PPh Badan',
        label: 'PPh Badan',
        hint: 'Kewajiban pajak penghasilan badan.',
        defaultObject: 'Penghasilan kena pajak badan',
      },
      {
        value: 'PPN',
        label: 'PPN',
        hint: 'Koreksi atau kewajiban PPN manual bila diperlukan.',
        defaultObject: 'Koreksi PPN masa',
      },
      {
        value: 'Lainnya',
        label: 'Pajak Lainnya',
        hint: 'Gunakan untuk jenis pajak lain yang belum tersedia.',
        defaultObject: 'Objek pajak lainnya',
      },
    ];

    const manualTaxSubjectLabel = () => {
      if (manualTaxForm.value.jenis === 'PPh 21') return 'Nama Pegawai / Penerima Penghasilan';
      if (manualTaxForm.value.jenis === 'PPh 23') return 'Nama Vendor / Penerima Penghasilan';
      return 'Pihak Terkait (opsional)';
    };

    const manualTaxIdentityLabel = () => {
      if (manualTaxForm.value.jenis === 'PPh 21') return 'NIK / NPWP Pegawai (opsional)';
      if (manualTaxForm.value.jenis === 'PPh 23') return 'NPWP / NIK Vendor (opsional)';
      return 'NPWP / Referensi Pihak Terkait (opsional)';
    };

    const suggestedManualTaxAmount = () => {
      const taxBase = asNumber(manualTaxForm.value.taxBase);
      const rate = asNumber(manualTaxForm.value.rate);

      return Math.round(taxBase * rate / 100);
    };

    const applySuggestedManualTaxAmount = () => {
      const amount = suggestedManualTaxAmount();

      if (amount <= 0) {
        showToast('Isi dasar pengenaan dan tarif terlebih dahulu.');
        return;
      }

      setManualTaxForm({
        ...manualTaxForm.value,
        nominal: amount,
      });
    };

    const selectManualTaxType = (type: PajakKewajiban['jenis']) => {
      const selected = manualTaxOptions.find((item) => item.value === type);

      setManualTaxForm({
        ...manualTaxForm.value,
        jenis: type,
        taxObject: selected?.defaultObject || '',
      });
    };

    const selectedManualTaxOption = () => manualTaxOptions.find((item) => item.value === manualTaxForm.value.jenis);

    const resetManualTaxForm = () => {
      setManualTaxForm({
        jenis: 'PPh 21',
        period: currentPayrollPeriod(),
        subjectName: '',
        subjectIdentity: '',
        taxObject: 'Gaji, upah, honorarium, atau imbalan',
        taxBase: 0,
        rate: 0,
        nominal: 0,
        dueDate: '',
        reference: '',
        notes: '',
      });
    };

    // BPJS Rate settings in local state
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
        employmentStatus: 'active',
        tanggalBergabung: new Date().toISOString().slice(0, 10),
        bpjsKesehatanNo: '',
        bpjsKesehatanTipe: 'PPU (Penerima Upah)',
        bpjsKesehatanKelas: 'Kelas 1',
        bpjsKetenagakerjaanNo: '',
        ptkpStatus: 'TK/0',
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
      overtimeAmount: 0,
      allowanceAmount: 0,
      bonusAmount: 0,
      loanDeduction: 0,
      otherDeduction: 0,
      pph21ManualAmount: 0,
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

      const nominal = asNumber(manualTaxForm.value.nominal) || suggestedManualTaxAmount();
      const jenis = manualTaxForm.value.jenis;
      const subjectName = String(manualTaxForm.value.subjectName || '').trim();

      if (!manualTaxForm.value.dueDate || nominal <= 0) {
        showToast('Isi nominal pajak dan tanggal jatuh tempo terlebih dahulu.');
        return;
      }

      if (['PPh 21', 'PPh 23'].includes(jenis) && !subjectName) {
        showToast(jenis === 'PPh 21'
          ? 'Nama pegawai atau penerima penghasilan wajib diisi.'
          : 'Nama vendor atau penerima penghasilan wajib diisi.');
        return;
      }

      const detailNotes = [
        manualTaxForm.value.taxObject
          ? `Objek: ${manualTaxForm.value.taxObject}.`
          : '',
        subjectName
          ? `Pihak: ${subjectName}.`
          : '',
        manualTaxForm.value.subjectIdentity
          ? `Identitas: ${manualTaxForm.value.subjectIdentity}.`
          : '',
        asNumber(manualTaxForm.value.taxBase) > 0
          ? `Dasar: ${asNumber(manualTaxForm.value.taxBase)}.`
          : '',
        asNumber(manualTaxForm.value.rate) > 0
          ? `Tarif input: ${asNumber(manualTaxForm.value.rate)}%.`
          : '',
        manualTaxForm.value.reference
          ? `Referensi: ${manualTaxForm.value.reference}.`
          : '',
        manualTaxForm.value.notes || '',
      ].filter(Boolean).join(' ');

      await onCreateTax({
        jenis,
        masaPajak: manualTaxForm.value.period,
        nominal,
        jatuhTempo: manualTaxForm.value.dueDate,
        catatan: detailNotes,
      });

      setTaxTableTab('unpaid');
      setIsTaxManualModalOpen(false);
      resetManualTaxForm();
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

    function masterEndpoint(type: 'division' | 'position') {
      return type === 'division' ? '/divisions' : '/positions';
    }

    function masterLabel(type = masterDataTab.value) {
      return type === 'division' ? 'Divisi' : 'Jabatan';
    }

    function resetMasterDataForm(type: 'division' | 'position' = masterDataTab.value, openEditor = true) {
      editingMasterData.value = null;
      masterDataForm.value = {
        id: '',
        type,
        code: '',
        name: '',
        description: '',
        status: 'active',
        divisionId: '',
      };
      isMasterEditorOpen.value = openEditor;
    }

    async function openMasterData(type: 'division' | 'position' = 'division') {
      masterDataTab.value = type;
      masterSearch.value = '';
      resetMasterDataForm(type, false);
      isMasterDataModalOpen.value = true;
      try {
        await refreshMasterData();
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Data master SDM belum dapat dimuat.'));
      }
    }

    function changeMasterTab(type: 'division' | 'position') {
      masterDataTab.value = type;
      masterSearch.value = '';
      resetMasterDataForm(type, false);
    }

    function closeMasterEditor() {
      isMasterEditorOpen.value = false;
      editingMasterData.value = null;
    }

    function masterRows() {
      const source = masterDataTab.value === 'division' ? divisions.value : positions.value;
      const keyword = String(masterSearch.value || '').trim().toLowerCase();
      if (!keyword) return latestFirst(source);
      return latestFirst(source.filter((item: any) => [item.code, item.name, item.description, item.division_name, item.status]
        .some((value) => String(value || '').toLowerCase().includes(keyword))));
    }

    function pagedMasterRows() {
      return pageRows(masterRows(), masterPage.value);
    }

    function editMasterData(item: any, type: 'division' | 'position' = masterDataTab.value) {
      editingMasterData.value = item;
      masterDataForm.value = {
        id: String(item.id || ''),
        type,
        code: String(item.code || ''),
        name: String(item.name || ''),
        description: String(item.description || ''),
        status: String(item.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
        divisionId: type === 'position' ? String(item.division_id || '') : '',
      };
      isMasterEditorOpen.value = true;
    }

    async function saveMasterData(event: Event) {
      event.preventDefault();
      const form = masterDataForm.value;
      const name = String(form.name || '').trim();
      if (!name) {
        showToast(`Nama ${masterLabel(form.type).toLowerCase()} wajib diisi.`);
        return;
      }
      masterBusy.value = true;
      try {
        const payload: any = {
          code: String(form.code || '').trim() || undefined,
          name,
          description: String(form.description || '').trim(),
          status: form.status,
        };
        if (form.type === 'position') payload.division_id = form.divisionId ? Number(form.divisionId) : null;
        if (form.id) await financeApi.put(`${masterEndpoint(form.type)}/${form.id}`, payload);
        else await financeApi.post(masterEndpoint(form.type), payload);
        await refreshMasterData();
        showToast(`${masterLabel(form.type)} berhasil ${form.id ? 'diperbarui' : 'ditambahkan'}.`);
        resetMasterDataForm(form.type, false);
        isMasterEditorOpen.value = false;
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, `Gagal menyimpan ${masterLabel(form.type).toLowerCase()}.`));
      } finally {
        masterBusy.value = false;
      }
    }

    async function toggleMasterStatus(item: any, type: 'division' | 'position' = masterDataTab.value) {
      const nextStatus = String(item.status || 'active').toLowerCase() === 'active' ? 'inactive' : 'active';
      const name = String(item.name || masterLabel(type));
      const action = nextStatus === 'inactive' ? 'menonaktifkan' : 'mengaktifkan';
      if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${name}?`)) return;
      try {
        await financeApi.patch(`${masterEndpoint(type)}/${item.id}/status`, { status: nextStatus });
        await refreshMasterData();
        showToast(`${masterLabel(type)} berhasil ${nextStatus === 'inactive' ? 'dinonaktifkan' : 'diaktifkan'}.`);
      } catch (error) {
        showToast(getApiErrorMessage(error, `Gagal mengubah status ${masterLabel(type).toLowerCase()}.`));
      }
    }

    async function deleteMasterData(item: any, type: 'division' | 'position' = masterDataTab.value) {
      const label = masterLabel(type).toLowerCase();
      const name = String(item.name || label);
      if (!window.confirm(`Hapus ${label} “${name}”? Data yang masih dipakai pegawai tidak dapat dihapus.`)) return;
      try {
        await financeApi.delete(`${masterEndpoint(type)}/${item.id}`);
        await refreshMasterData();
        if (String(editingMasterData.value?.id || '') === String(item.id)) resetMasterDataForm(type, false);
        showToast(`${masterLabel(type)} berhasil dihapus.`);
      } catch (error) {
        showToast(getApiErrorMessage(error, `${masterLabel(type)} tidak dapat dihapus karena masih digunakan.`));
      }
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

    function employeeDatabaseId(employee: any) {
      const raw = employee?._raw || employee || {};
      const id = Number(raw.id ?? employee?.dbId ?? employee?.id);
      return Number.isInteger(id) && id > 0 ? id : 0;
    }

    function resetEmployeeForm() {
      editingEmployee.value = null;
      const defaultDivision = divisions.value.find((item: any) => String(item.status || 'active').toLowerCase() === 'active') || divisions.value[0] || {};
      const defaultPosition = positions.value.find((item: any) => String(item.status || 'active').toLowerCase() === 'active' && (!item.division_id || String(item.division_id) === String(defaultDivision.id || ''))) || positions.value[0] || {};
      setEmployeeForm({ nama: '', nip: '', nik: '', email: '', whatsapp: '', npwp: '', jabatan: '', departemen: '', divisionId: String(defaultDivision.id || ''), positionId: String(defaultPosition.id || ''), statusKontrak: 'Karyawan Tetap', employmentStatus: 'active', tanggalBergabung: todayIso(), bpjsKesehatanNo: '', bpjsKesehatanTipe: 'PPU (Penerima Upah)', bpjsKesehatanKelas: 'Kelas 1', bpjsKetenagakerjaanNo: '', ptkpStatus: 'TK/0', gajiPokok: 0, bankNama: '', noRekening: '' });
    }

    async function openEmployeeForm(employee: any = null) {
      if (!divisions.value.length || !positions.value.length) await refreshMasterData();
      if (!employee) { resetEmployeeForm(); setIsEmployeeModalOpen(true); return; }
      const raw = employee._raw || employee;
      editingEmployee.value = employee;
      setEmployeeForm({
        nama: employee.nama || raw.full_name || raw.name || '', nip: raw.employee_code || '', nik: raw.nik || '', email: raw.email || '', whatsapp: raw.phone || '', npwp: raw.npwp || '', jabatan: employee.jabatan || raw.position_name || '', departemen: raw.division_name || '', divisionId: String(raw.division_id || ''), positionId: String(raw.position_id || ''), statusKontrak: raw.employment_type === 'contract' ? 'Kontrak' : raw.employment_type === 'intern' ? 'Probation' : 'Karyawan Tetap', employmentStatus: String(raw.employment_status || raw.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active', tanggalBergabung: String(raw.join_date || todayIso()).slice(0, 10), bpjsKesehatanNo: raw.bpjs_health_number || '', bpjsKesehatanTipe: 'PPU (Penerima Upah)', bpjsKesehatanKelas: 'Kelas 1', bpjsKetenagakerjaanNo: raw.bpjs_employment_number || '', ptkpStatus: raw.ptkp_status || 'TK/0', gajiPokok: asNumber(raw.base_salary ?? employee.gajiBersih), bankNama: raw.bank_name || '', noRekening: raw.bank_account_number || ''
      });
      setIsEmployeeModalOpen(true);
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
        const payload = {
          employee_code: employeeForm.value.nip || undefined,
          full_name: employeeForm.value.nama,
          nik: employeeForm.value.nik,
          email: employeeForm.value.email || '',
          phone: employeeForm.value.whatsapp || '',
          division_id: divisionId,
          position_id: positionId,
          employment_type: employmentType,
          ptkp_status: employeeForm.value.ptkpStatus || 'TK/0',
          bpjs_status: 'active',
          employment_status: employeeForm.value.employmentStatus || 'active',
          join_date: employeeForm.value.tanggalBergabung || todayIso(),
          npwp: employeeForm.value.npwp || '',
          bpjs_health_number: employeeForm.value.bpjsKesehatanNo || '',
          bpjs_employment_number: employeeForm.value.bpjsKetenagakerjaanNo || '',
          bank_name: employeeForm.value.bankNama || '',
          bank_account_number: employeeForm.value.noRekening || '',
          bank_account_holder: employeeForm.value.nama || '',
          base_salary: asNumber(employeeForm.value.gajiPokok),
        };
        const isEditing = Boolean(editingEmployee.value);
        const employeeId = employeeDatabaseId(editingEmployee.value);
        if (isEditing && !employeeId) {
          throw new Error('ID pegawai tidak valid. Muat ulang halaman lalu coba lagi.');
        }
        if (isEditing) await financeApi.put(`/employees/${employeeId}`, payload);
        else await financeApi.post('/employees', payload);

        resetEmployeeForm();
        setIsEmployeeModalOpen(false);
        await refreshAllData();
        showToast(isEditing ? 'Data pegawai berhasil diperbarui.' : 'Pegawai berhasil disimpan ke database.');
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, 'Gagal menyimpan pegawai.'));
      }
    }

    async function handleDeleteEmployee(employee: any) {
      const employeeId = employeeDatabaseId(employee);
      const employeeName = String(employee?.nama || employee?._raw?.full_name || employee?._raw?.name || 'pegawai');
      if (!employeeId) {
        showToast('ID pegawai tidak valid. Muat ulang halaman lalu coba lagi.');
        return;
      }
      if (!window.confirm(`Hapus ${employeeName}? Tindakan ini hanya tersedia untuk pegawai tanpa riwayat payroll. Jika pegawai sudah tidak bekerja tetapi memiliki riwayat, gunakan status Nonaktif pada form Ubah.`)) return;
      try {
        await financeApi.delete(`/employees/${employeeId}`);
        const selectedId = employeeDatabaseId(selectedEmployeeDetail.value);
        if (selectedId === employeeId) closeEmployeeDetail();
        await refreshAllData();
        showToast('Pegawai berhasil dihapus dari master data.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Pegawai tidak dapat dihapus. Nonaktifkan pegawai yang sudah memiliki riwayat payroll.'));
      }
    }

    function selectedPayrollEmployee() {
      return pegawai.find((item: any) => String(item?._raw?.id || '') === String(payrollForm.value.employeeId || ''));
    }

    async function calculatePayrollPph21() {
      const employee = selectedPayrollEmployee();
      if (!employee) return showToast('Pilih pegawai terlebih dahulu untuk menghitung estimasi PPh 21.');
      const raw = employee._raw || {};
      try {
        const result = await financeApi.post('/taxes/employee-pph21/calculate', {
          employee_name: employee.nama,
          employee_nik: raw.nik || '',
          employee_position: employee.jabatan || '',
          tax_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
          ptkp_status: raw.ptkp_status || 'TK/0',
          base_salary: asNumber(raw.base_salary ?? employee.gajiBersih) + asNumber(payrollForm.value.overtimeAmount) + asNumber(payrollForm.value.bonusAmount),
          allowance_amount: asNumber(payrollForm.value.allowanceAmount),
        });
        pph21Estimate.value = result;
        showToast(result.needs_final_reconciliation ? result.message : 'Estimasi PPh 21 pegawai berhasil dihitung.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal menghitung estimasi PPh 21.'));
      }
    }

    function openPayslipPrint() {
      const slip = payslipPreview.value;
      if (!slip) return;
      const popup = window.open('', '_blank', 'width=760,height=700');
      if (!popup) return showToast('Popup diblokir browser. Izinkan popup untuk mencetak payslip.');
      const rows = [
        ['Pegawai', slip.employee_name || '-'], ['Periode', slip.payroll_period || '-'], ['Tanggal Bayar', slip.payment_date || '-'],
        ['Gaji Pokok', formatRupiah(asNumber(slip.base_salary))], ['Lembur', formatRupiah(asNumber(slip.overtime_amount))], ['Tunjangan', formatRupiah(asNumber(slip.allowance_amount))], ['Bonus', formatRupiah(asNumber(slip.bonus_amount))],
        ['Potongan BPJS Pegawai', formatRupiah(asNumber(slip.employee_bpjs_deduction))], ['Potongan PPh 21', formatRupiah(asNumber(slip.pph21_amount))], ['Potongan Kasbon', formatRupiah(asNumber(slip.loan_deduction))], ['Potongan Lain', formatRupiah(asNumber(slip.other_deduction))],
        ['Gaji Bersih', formatRupiah(asNumber(slip.net_pay))], ['Voucher', slip.voucher_number || '-'],
      ];
      popup.document.write(`<!doctype html><html><head><title>Payslip ${String(slip.employee_name || '').replace(/</g, '')}</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#102A56}table{border-collapse:collapse;width:100%;margin-top:22px}td{padding:10px;border-bottom:1px solid #dce7f4}td:last-child{text-align:right;font-weight:700}.head{border-bottom:2px solid #0b1f4a;padding-bottom:12px}</style></head><body><div class="head"><h2>PT KEDATA INDONESIA DIGITAL</h2><p>Payslip Payroll FinStart</p></div><table>${rows.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join('')}</table></body></html>`);
      popup.document.close();
      popup.focus();
      popup.print();
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
          overtime_amount: asNumber(payrollForm.value.overtimeAmount),
          allowance_amount: asNumber(payrollForm.value.allowanceAmount),
          bonus_amount: asNumber(payrollForm.value.bonusAmount),
          loan_deduction: asNumber(payrollForm.value.loanDeduction),
          other_deduction: asNumber(payrollForm.value.otherDeduction),
          pph21_amount: asNumber(payrollForm.value.pph21ManualAmount) || asNumber(pph21Estimate.value?.pph21_amount),
          notes: 'Payroll diproses dari workspace FinStart.',
        });
        try { payslipPreview.value = await financeApi.get(`/payroll/${result.id}/payslip`); } catch (_) { payslipPreview.value = result; }
        setIsPayrollModalOpen(false);
        await refreshAllData();
        showToast(`Payroll ${result.employee_name || 'pegawai'} berhasil diposting. Payslip tersedia untuk dicetak.`);
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, 'Gagal memproses payroll.'));
      }
    }

    async function handleProcessPayrollBulk() {
      const cashAccountId = Number(payrollForm.value.cashAccountId);
      if (!cashAccountId) return showToast('Pilih akun Kas/Bank sebelum memproses payroll massal.');
      try {
        const result = await financeApi.post('/payroll/process-bulk', {
          payroll_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
          payment_date: payrollForm.value.paymentDate || todayIso(),
          cash_account_id: cashAccountId,
          notes: 'Payroll massal diproses dari workspace FinStart.',
        });
        setIsPayrollModalOpen(false);
        await refreshAllData();
        showToast(`Payroll massal selesai: ${(result.processed || []).length} pegawai diproses, ${(result.skipped || []).length} dilewati.`);
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal memproses payroll massal.'));
      }
    }

    async function downloadPayrollBankTransfer() {
      try {
        const rows = await financeApi.get('/payroll/export/bank-transfer', { period: payrollForm.value.payrollPeriod || currentPayrollPeriod() });
        const header = ['Periode', 'Tanggal Bayar', 'Kode Pegawai', 'Nama Pegawai', 'Bank', 'Nomor Rekening', 'Atas Nama', 'Nominal'];
        const csv = [header, ...(rows || []).map((row: any) => [row.payroll_period, row.payment_date, row.employee_code, row.employee_name, row.bank_name || '', row.bank_account_number || '', row.bank_account_holder || '', asNumber(row.net_pay)])]
          .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        downloadTextFile(`transfer-payroll-${payrollForm.value.payrollPeriod || currentPayrollPeriod()}.csv`, csv);
        showToast('File transfer bank payroll berhasil dibuat.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal membuat file transfer bank.'));
      }
    }
    const filteredEmployees = computed(() => latestFirst((pegawai || []).filter((p: any) => {
      const raw = p?._raw || {};
      const haystack = `${p.nama || raw.full_name || ''} ${p.id || raw.employee_code || ''} ${p.jabatan || raw.position_name || ''} ${raw.division_name || ''} ${raw.employment_status || ''}`.toLowerCase();
      return haystack.includes(searchQuery.value.toLowerCase());
    })));
    const pagedEmployees = computed(() => pageRows(filteredEmployees.value, employeePage.value));
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
      if (jenis === 'PPN') return `Kewajiban atau koreksi PPN masa ${masaPajak}.`;
      if (jenis === 'PPh 21') return `PPh 21 atas pegawai atau penerima penghasilan periode ${masaPajak}.`;
      if (jenis === 'PPh 23') return `PPh 23 atas jasa, sewa, atau penghasilan pihak ketiga periode ${masaPajak}.`;
      if (jenis === 'PPh 25') return `Angsuran PPh 25 periode ${masaPajak}.`;
      if (jenis === 'PPh Final') return `PPh Final atas objek penghasilan periode ${masaPajak}.`;
      if (jenis === 'PPh Badan') return `Kewajiban PPh Badan periode ${masaPajak}.`;
      return `Kewajiban pajak lainnya periode ${masaPajak}.`;
    };
    const filteredTaxRows = computed(() => latestFirst(taxes.value.filter(tax => {
      const matchesTab = taxTableTab.value === 'unpaid' ? tax.status === 'Belum Setor' : tax.status === 'Sudah Setor';
      const matchesType = taxTypeFilter.value === 'Semua' || tax.jenis === taxTypeFilter.value;
      const haystack = `${tax.jenis} ${tax.masaPajak} ${tax.status} ${tax.ntpn || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(taxSearchQuery.value.toLowerCase());
      return matchesTab && matchesType && matchesSearch;
    })));
    const pagedTaxRows = computed(() => pageRows(filteredTaxRows.value, taxPage.value));
    const csvEscape = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const downloadTextFile = (filename: string, content: string, type = 'text/csv;charset=utf-8;') => {
      const blob = new Blob([content], { type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    };
    const escapeHtml = (value: any) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const currentTaxDocumentRows = () => filteredTaxRows.value.length ? filteredTaxRows.value : taxes.value;
    const exportTaxCsv = () => {
      const rows = currentTaxDocumentRows();
      const csvRows = [
        ['Jenis Pajak', 'Masa Pajak', 'Nominal', 'Jatuh Tempo', 'Status', 'NTPN', 'Keterangan'],
        ...rows.map((tax: any) => [
          tax.jenis,
          tax.masaPajak,
          tax.nominal,
          tax.jatuhTempo,
          tax.status,
          tax.ntpn || '',
          taxDescription(tax.jenis, tax.masaPajak),
        ]),
      ];

      downloadTextFile(
        `finstart-pajak-${new Date().toISOString().slice(0, 10)}.csv`,
        csvRows.map(row => row.map(csvEscape).join(',')).join('\n'),
      );
      showToast(`CSV pajak berhasil dibuat (${rows.length} data).`);
    };
    const printTaxReport = () => {
      const rows = currentTaxDocumentRows();
      const popup = window.open('', '_blank', 'width=960,height=720');

      if (!popup) {
        showToast('Popup print diblokir browser. Izinkan popup untuk mencetak laporan pajak.');
        return;
      }

      popup.document.write(`<!doctype html>
        <html>
          <head>
            <title>Laporan Pajak - FinStart</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #102A56; }
              h1, p { margin: 0; }
              .header { border-bottom: 2px solid #0B1F4A; padding-bottom: 14px; text-align: center; }
              .meta { margin-top: 6px; color: #64748B; font-size: 12px; }
              .summary { display: flex; justify-content: space-between; margin-top: 18px; border: 1px solid #DCE7F4; padding: 12px; }
              table { border-collapse: collapse; margin-top: 20px; width: 100%; font-size: 12px; }
              th, td { border-bottom: 1px solid #E2E8F0; padding: 10px; text-align: left; vertical-align: top; }
              th { background: #F8FBFE; color: #53658A; text-transform: uppercase; font-size: 10px; }
              td:nth-child(4), th:nth-child(4) { text-align: right; }
              @media print { body { margin: 18mm; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PT KEDATA INDONESIA DIGITAL</h1>
              <p class="meta">Laporan Kewajiban Pajak - ${escapeHtml(new Date().toLocaleDateString('id-ID'))}</p>
            </div>
            <div class="summary">
              <strong>Total Belum Dibayar</strong>
              <strong>${escapeHtml(formatRupiah(totalTaxesOwed))}</strong>
            </div>
            <table>
              <thead>
                <tr><th>Jenis</th><th>Periode</th><th>Keterangan</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>NTPN</th></tr>
              </thead>
              <tbody>
                ${rows.map((tax: any) => `<tr>
                  <td>${escapeHtml(tax.jenis)}</td>
                  <td>${escapeHtml(tax.masaPajak)}</td>
                  <td>${escapeHtml(taxDescription(tax.jenis, tax.masaPajak))}</td>
                  <td>${escapeHtml(formatRupiah(tax.nominal))}</td>
                  <td>${escapeHtml(formatTaxDate(tax.jatuhTempo))}</td>
                  <td>${escapeHtml(tax.status)}</td>
                  <td>${escapeHtml(tax.ntpn || '-')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>`);
      popup.document.close();
      popup.focus();
      popup.print();
      showToast('Dialog cetak laporan pajak dibuka.');
    };
    const taxPerformanceCards = () => [
      ['Pendapatan Posted', formatRupiah(Number(taxCalculationData?.revenue || 0))],
      ['Beban Posted', formatRupiah(Number(taxCalculationData?.expense || 0))],
      ['Laba Bersih', formatRupiah(Number(taxCalculationData?.net_profit || 0))],
      ['Kewajiban Belum Setor', formatRupiah(Number(taxSummary?.total_unpaid || 0))],
    ];
    const taxPeriodOptions = () => recentTaxPeriods();
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
        period: currentPayrollPeriod(),
        jenis: 'PPh 21',
        base: 'Pendapatan',
        rate: 2,
        dueDate: currentTaxDueDate()
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
    const activeDivisions = () => divisions.value;
    const filteredPositions = () => positions.value.filter((position: any) => {
      if (!employeeForm.value.divisionId) return true;
      return !position.division_id || String(position.division_id) === String(employeeForm.value.divisionId);
    });
    const currentPayrollEmployee = () => selectedPayrollEmployee();
    const currentPayrollAmount = () => {
      const employee = currentPayrollEmployee();
      const raw = employee?._raw || {};
      return asNumber(raw.base_salary ?? employee?.gajiBersih) + asNumber(payrollForm.value.overtimeAmount) + asNumber(payrollForm.value.allowanceAmount) + asNumber(payrollForm.value.bonusAmount);
    };
    const currentPayrollEstimatedNet = () => Math.max(0, currentPayrollAmount() - asNumber(pph21Estimate.value?.pph21_amount || payrollForm.value.pph21ManualAmount) - asNumber(payrollForm.value.loanDeduction) - asNumber(payrollForm.value.otherDeduction));

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
            <Calculator class="w-4 h-4" /> Atur BPJS
          </button>
          <button id="btn-manage-master-data" type="button" onClick={() => openMasterData('division')} class="h-10 px-5 rounded-2xl border border-[#BFD7F5] bg-[#F4F9FF] text-[#0B3A78] font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:bg-[#EAF4FF]">
            <Building2 class="w-4 h-4" /> Kelola Divisi & Jabatan
          </button>
          <button id="btn-register-employee" type="button" onClick={() => openEmployeeForm()} class="h-10 px-5 rounded-2xl bg-[#0B1F4A] hover:bg-[#102A56] text-white font-extrabold text-sm shadow-lg shadow-[#0B1F4A]/20 flex items-center justify-center gap-2 transition-all">
            <Plus class="w-4 h-4" /> Tambah Pegawai
          </button>
          <button id="btn-open-payroll" type="button" onClick={() => {
            const activeEmployees = pegawai.filter((item: any) => String(item?._raw?.employment_status || 'active').toLowerCase() === 'active');
            if (!activeEmployees.length) {
              showToast('Tambahkan pegawai aktif terlebih dahulu.');
              return;
            }
            refreshMasterData();
            setIsPayrollModalOpen(true);
          }} class="h-10 px-5 rounded-2xl bg-[#10182C] hover:bg-[#0B1120] text-white font-extrabold text-sm shadow-lg shadow-[#10182C]/20 flex items-center justify-center gap-2 transition-all">
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
                <input id="staff-search-box" type="text" value={searchQuery.value} onInput={e => setSearchQuery(e.target.value)} placeholder="Cari pegawai berdasarkan nama atau NIP..." class="w-full h-10 pl-10 pr-4 bg-white border border-[#D8E5F4] rounded-2xl text-sm text-[#1F2A44] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20" />
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-white text-[10px] text-[#94A3B8] uppercase font-extrabold tracking-[0.22em]">
                  <tr>
                    <th class="px-7 py-5">Identitas Pegawai</th>
                    <th class="px-7 py-5">Jabatan</th>
                    <th class="px-7 py-5">Status Aktif</th>
                    <th class="px-7 py-5">Compliance</th>
                    <th class="px-7 py-5 text-[#0B1F4A]">Gaji Bersih (Net)</th>
                    <th class="px-7 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {pagedEmployees.value.map(staff => {
                  return <tr key={staff.id} class="hover:bg-slate-50 transition-colors">
                        <td class="px-7 py-4">
                          <span class="font-bold text-[#020B2D] block text-sm">{staff.nama}</span>
                          <span class="text-[10px] text-slate-400 font-mono">{staff.id}</span>
                        </td>
                        <td class="px-7 py-4 text-slate-700 font-semibold">{staff.jabatan}<span class="text-[10px] text-slate-400 block">{staff.status}</span></td>
                        <td class="px-7 py-4"><span class={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${String(staff?._raw?.employment_status || 'active').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{String(staff?._raw?.employment_status || 'active').toLowerCase() === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>
                        <td class="px-7 py-4">
                          <span class={`text-[10px] px-2.5 py-1 rounded-full font-bold ${staff.compliance === 'Patuh' ? 'bg-[#EEF5FC] text-[#0B1F4A]' : 'bg-amber-50 text-amber-700'}`}>{staff.compliance}</span>
                        </td>
                        <td class="px-7 py-4 font-mono font-bold text-[#0B1F4A]">{formatRupiah(staff.gajiBersih)}</td>
                        <td class="px-7 py-4 text-center">
                          <div class="flex justify-center gap-1.5">
                            <button type="button" aria-label={`Detail ${staff.nama || staff.name || 'pegawai'}`} title="Detail" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]" onClick={() => openEmployeeDetail(staff)}><Eye class="h-3.5 w-3.5" /></button>
                            <button type="button" aria-label={`Ubah ${staff.nama || staff.name || 'pegawai'}`} title="Ubah" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F2D49B] bg-[#FFF9EE] text-[#B86A00] transition hover:bg-[#FFF1D7]" onClick={() => openEmployeeForm(staff)}><Pencil class="h-3.5 w-3.5" /></button>
                            <button type="button" aria-label={`Hapus ${staff.nama || staff.name || 'pegawai'}`} title="Hapus" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" onClick={() => handleDeleteEmployee(staff)}><Trash2 class="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>;
                })}
                </tbody>
              </table>
            </div>
            <TablePagination page={employeePage.value} total={filteredEmployees.value.length} onPageChange={(page: number) => employeePage.value = safePage(page, filteredEmployees.value.length)} />
          </div>

          {isMasterDataModalOpen.value && <Teleport to="body">
            <div
              class="master-data-modal-layer bg-[#0B1220]/60 backdrop-blur-sm"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2147483000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw',
                height: '100dvh',
                padding: '24px',
                overflowY: 'auto',
              }}
            >
              <div class="flex flex-col overflow-hidden rounded-[28px] border border-[#DCE7F4] bg-white shadow-[0_28px_90px_rgba(8,25,60,0.38)]" style={{ width: 'min(92vw, 1180px)', maxHeight: 'calc(100dvh - 48px)' }}>
                <div class="flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-5 py-4 sm:px-7 sm:py-5">
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Master Data SDM</p>
                    <h3 class="mt-1 text-xl font-extrabold tracking-tight text-[#102A56]">Kelola Divisi & Jabatan</h3>
                    <p class="mt-1 max-w-2xl text-xs leading-5 text-[#6B7A90]">Tambahkan, ubah, atau hapus master data. Data yang masih digunakan pegawai tidak dapat dihapus secara langsung.</p>
                  </div>
                  <button id="btn-close-master-data" type="button" onClick={() => { isMasterDataModalOpen.value = false; resetMasterDataForm(masterDataTab.value, false); }} class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-[#102A56]" aria-label="Tutup kelola divisi dan jabatan"><X class="h-5 w-5" /></button>
                </div>

                <div class="flex flex-wrap gap-2 border-b border-[#E8EEF7] bg-[#FAFCFF] px-5 py-3 sm:px-7">
                  <button type="button" onClick={() => changeMasterTab('division')} class={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${masterDataTab.value === 'division' ? 'bg-[#0B1F4A] text-white shadow-lg shadow-[#0B1F4A]/15' : 'border border-[#DCE7F4] bg-white text-[#53658A] hover:bg-[#F4F8FD]'}`}><Building2 class="h-4 w-4" /> Divisi <span class={`rounded-full px-1.5 py-0.5 text-[10px] ${masterDataTab.value === 'division' ? 'bg-white/15 text-white' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`}>{divisions.value.length}</span></button>
                  <button type="button" onClick={() => changeMasterTab('position')} class={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${masterDataTab.value === 'position' ? 'bg-[#0B1F4A] text-white shadow-lg shadow-[#0B1F4A]/15' : 'border border-[#DCE7F4] bg-white text-[#53658A] hover:bg-[#F4F8FD]'}`}><BriefcaseBusiness class="h-4 w-4" /> Jabatan <span class={`rounded-full px-1.5 py-0.5 text-[10px] ${masterDataTab.value === 'position' ? 'bg-white/15 text-white' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`}>{positions.value.length}</span></button>
                </div>

                <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <section class="min-w-0 p-5 lg:p-6">
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p class="text-sm font-extrabold text-[#102A56]">Daftar {masterLabel()}</p>
                        <p class="mt-1 text-[11px] text-[#7A8CA8]">Gunakan ikon untuk ubah atau hapus data.</p>
                      </div>
                      <button id="btn-add-master-data" type="button" onClick={() => resetMasterDataForm(masterDataTab.value, true)} class="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-bold text-white shadow-md shadow-[#0B1F4A]/15 transition hover:bg-[#102A56]"><Plus class="h-4 w-4" /> Tambah {masterLabel()}</button>
                    </div>
                    <div class="relative mb-4">
                      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8FA0B8]" />
                      <input id="master-data-search" value={masterSearch.value} onInput={event => masterSearch.value = (event.target as HTMLInputElement).value} placeholder={`Cari kode, nama, atau keterangan ${masterLabel().toLowerCase()}...`} class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-[#FBFDFF] pl-10 pr-3 text-xs font-medium text-[#243650] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                    </div>
                    <div class="overflow-hidden rounded-2xl border border-[#E1EAF5]">
                      <div class="max-h-[min(48dvh,420px)] overflow-y-auto overflow-x-auto">
                        <table class="master-data-table w-full min-w-[720px] table-fixed text-left text-xs" style={{ width: '100%' }}>
                          {masterDataTab.value === 'position'
                            ? <colgroup><col style={{ width: '42%' }} /><col style={{ width: '24%' }} /><col style={{ width: '13%' }} /><col style={{ width: '9%' }} /><col style={{ width: '12%' }} /></colgroup>
                            : <colgroup><col style={{ width: '62%' }} /><col style={{ width: '16%' }} /><col style={{ width: '22%' }} /></colgroup>}
                          <thead class="sticky top-0 z-10 bg-[#EEF5FC] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#28518A]"><tr><th class="px-5 py-3 text-left">Kode / Nama</th>{masterDataTab.value === 'position' && <th class="px-5 py-3 text-left">Divisi</th>}{masterDataTab.value === 'position' && <th class="px-5 py-3 text-left">Status</th>}<th class="px-5 py-3 text-center">Dipakai</th><th class="px-5 py-3 text-right">Aksi</th></tr></thead>
                          <tbody class="divide-y divide-[#EDF2F7] bg-white">
                            {masterRows().length ? pagedMasterRows().map((item: any) => <tr key={`${masterDataTab.value}-${item.id}`} class="hover:bg-[#FAFCFF]">
                              <td class="px-4 py-3"><p class="font-extrabold text-[#102A56]">{item.name}</p><p class="mt-1 text-[10px] text-[#7A8CA8]">{item.code || 'Kode otomatis'}{item.description ? ` · ${item.description}` : ''}</p></td>
                              {masterDataTab.value === 'position' && <td class="px-4 py-3 text-[#53658A]">{item.division_name || 'Semua divisi'}</td>}
                              {masterDataTab.value === 'position' && <td class="px-4 py-3"><span class={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${String(item.status || 'active').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{String(item.status || 'active').toLowerCase() === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>}
                              <td class="px-4 py-3 text-center font-bold text-[#53658A]">{Number(item.employee_count || 0)}</td>
                              <td class="px-4 py-3"><div class="flex justify-end gap-1.5"><button type="button" title={`Ubah ${masterLabel().toLowerCase()}`} aria-label={`Ubah ${masterLabel().toLowerCase()}`} onClick={() => editMasterData(item)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F2D49B] bg-[#FFF9EE] text-[#B86A00] hover:bg-[#FFF1D7]"><Pencil class="h-3.5 w-3.5" /></button>{masterDataTab.value === 'position' && <button type="button" title={String(item.status || 'active').toLowerCase() === 'active' ? 'Nonaktifkan' : 'Aktifkan'} aria-label={String(item.status || 'active').toLowerCase() === 'active' ? 'Nonaktifkan' : 'Aktifkan'} onClick={() => toggleMasterStatus(item)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#C9DBF4] bg-[#F4F9FF] text-[#1E5AA8] hover:bg-[#EAF4FF]"><Power class="h-3.5 w-3.5" /></button>}<button type="button" title={`Hapus ${masterLabel().toLowerCase()}`} aria-label={`Hapus ${masterLabel().toLowerCase()}`} onClick={() => deleteMasterData(item)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 class="h-3.5 w-3.5" /></button></div></td>
                            </tr>) : <tr><td colSpan={masterDataTab.value === 'position' ? 5 : 3} class="px-4 py-12 text-center text-xs text-[#8190A5]">Belum ada data {masterLabel().toLowerCase()} yang sesuai.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <TablePagination page={masterPage.value} total={masterRows().length} onPageChange={(page: number) => masterPage.value = safePage(page, masterRows().length)} />
                  </section>


                </div>
              </div>

              {isMasterEditorOpen.value && <div
                class="bg-[#0B1220]/60 backdrop-blur-sm"
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 2147483200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100vw',
                  height: '100dvh',
                  padding: '24px',
                  overflowY: 'auto',
                  pointerEvents: 'auto',
                }}
              >
                <div class="flex flex-col overflow-hidden rounded-[28px] border border-[#DCE7F4] bg-white shadow-[0_30px_100px_rgba(8,25,60,0.48)]" style={{ width: 'min(92vw, 860px)', maxHeight: 'calc(100dvh - 48px)' }}>
                  <div class="flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-6 py-5">
                    <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Form Master Data</p><h3 class="mt-1 text-lg font-extrabold text-[#102A56]">{masterDataForm.value.id ? `Ubah ${masterLabel(masterDataForm.value.type)}` : `Tambah ${masterLabel(masterDataForm.value.type)}`}</h3><p class="mt-1 text-xs text-[#7A8CA8]">Form dibuat overlay agar sama seperti modal lain dan tombol aksi lebih jelas.</p></div>
                    <button type="button" onClick={closeMasterEditor} class="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-[#102A56]" aria-label="Tutup form master data"><X class="h-5 w-5" /></button>
                  </div>
                  <form onSubmit={saveMasterData} class="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
                    <label class="block text-[11px] font-bold text-[#53658A]">Kode<input value={masterDataForm.value.code} onInput={event => masterDataForm.value = { ...masterDataForm.value, code: (event.target as HTMLInputElement).value }} placeholder={masterDataForm.value.type === 'division' ? 'Contoh: FIN' : 'Contoh: FIN-MGR'} class="mt-1.5 h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-xs text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" /></label>
                    <label class="block text-[11px] font-bold text-[#53658A]">Nama {masterLabel(masterDataForm.value.type)}<input required value={masterDataForm.value.name} onInput={event => masterDataForm.value = { ...masterDataForm.value, name: (event.target as HTMLInputElement).value }} placeholder={masterDataForm.value.type === 'division' ? 'Contoh: Keuangan' : 'Contoh: Finance Manager'} class="mt-1.5 h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-xs text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" /></label>
                    {masterDataForm.value.type === 'position' && <label class="block text-[11px] font-bold text-[#53658A]">Divisi Induk<select value={masterDataForm.value.divisionId} onChange={event => masterDataForm.value = { ...masterDataForm.value, divisionId: (event.target as HTMLSelectElement).value }} class="mt-1.5 h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-xs text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"><option value="">Berlaku untuk semua divisi</option>{divisions.value.map((item: any) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>}
                    <label class="block text-[11px] font-bold text-[#53658A]">Keterangan<textarea value={masterDataForm.value.description} onInput={event => masterDataForm.value = { ...masterDataForm.value, description: (event.target as HTMLTextAreaElement).value }} rows={4} placeholder="Keterangan singkat (opsional)" class="mt-1.5 w-full resize-none rounded-xl border border-[#DCE7F4] bg-white px-3 py-2.5 text-xs text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" /></label>
                    {masterDataForm.value.type === 'position' && <label class="block text-[11px] font-bold text-[#53658A]">Status<select value={masterDataForm.value.status} onChange={event => masterDataForm.value = { ...masterDataForm.value, status: (event.target as HTMLSelectElement).value }} class="mt-1.5 h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-xs text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></label>}
                    <div class="grid gap-3 pt-2 sm:grid-cols-2"><button id="btn-cancel-master-data" type="button" onClick={closeMasterEditor} class="h-11 rounded-xl border border-[#DCE7F4] bg-white px-4 text-xs font-bold text-[#53658A] transition hover:bg-[#F4F8FD]">Batal</button><button id="btn-save-master-data" type="submit" disabled={masterBusy.value} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-bold text-white shadow-md shadow-[#0B1F4A]/15 transition hover:bg-[#102A56] disabled:cursor-not-allowed disabled:opacity-60"><Save class="h-4 w-4" /> {masterBusy.value ? 'Menyimpan...' : 'Simpan'}</button></div>
                  </form>
                </div>
              </div>}
            </div>
          </Teleport>}

          {isEmployeeDetailOpen.value && selectedEmployeeDetail.value && <Teleport to="body">
            <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000]/60 p-4 backdrop-blur-sm">
              <div class="w-full max-w-2xl rounded-[28px] border border-slate-100 bg-white shadow-2xl overflow-hidden">
                <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1E5AA8]">Detail Pegawai</p>
                    <h3 class="mt-1 text-xl font-bold text-[#111827]">{selectedEmployeeDetail.value.nama}</h3>
                    <p class="mt-1 text-xs text-[#64748B]">Informasi profil pegawai dan ringkasan estimasi gaji bersih.</p>
                  </div>
                  <button type="button" class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-slate-600" onClick={closeEmployeeDetail} aria-label="Tutup detail">
                    <X class="w-5 h-5" />
                  </button>
                </div>

                <div class="px-6 py-5"><div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] px-4 py-3 text-xs leading-5 text-[#53658A]">Ringkasan ini tidak mengulang kolom tabel. Detail dipakai untuk data kontak, identitas, BPJS, dan rekening yang diperlukan SDM/payroll.</div></div>
                <div class="grid gap-4 px-6 pb-6 sm:grid-cols-2">
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Email</p><p class="text-sm font-semibold text-[#102A56]">{employeeDetailSource().email || '—'}</p></div>
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">WhatsApp</p><p class="text-sm font-semibold text-[#102A56]">{employeeDetailSource().phone || '—'}</p></div>
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">NIK</p><p class="text-sm font-semibold text-[#102A56]">{maskValue(employeeDetailSource().nik)}</p></div>
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">NPWP</p><p class="text-sm font-semibold text-[#102A56]">{maskValue(employeeDetailSource().npwp)}</p></div>
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">BPJS Kesehatan</p><p class="text-sm font-semibold text-[#102A56]">{maskValue(employeeDetailSource().bpjs_health_number)}</p></div>
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">BPJS Ketenagakerjaan</p><p class="text-sm font-semibold text-[#102A56]">{maskValue(employeeDetailSource().bpjs_employment_number)}</p></div>
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Bank / Atas Nama</p><p class="text-sm font-semibold text-[#102A56]">{employeeDetailSource().bank_name ? `${employeeDetailSource().bank_name} · ${employeeDetailSource().bank_account_holder || selectedEmployeeDetail.value.nama}` : '—'}</p></div>
                  <div class="space-y-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Nomor Rekening</p><p class="text-sm font-semibold text-[#102A56]">{maskValue(employeeDetailSource().bank_account_number)}</p></div>
                  <div class="space-y-2 sm:col-span-2"><p class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Alamat</p><p class="text-sm font-semibold text-[#102A56]">{employeeDetailSource().address || 'Belum diisi'}</p></div>
                </div>

              <div class="flex justify-end border-t border-slate-100 px-6 py-4">
                <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl bg-[#10182C] px-6 text-sm font-semibold text-white shadow-lg shadow-[#10182C]/20 transition hover:bg-[#0B1120]" onClick={closeEmployeeDetail}>Tutup</button>
              </div>
            </div>
          </div></Teleport>}
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
              <button id="btn-export-efaktur" type="button" onClick={exportTaxCsv} class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]">
                <FileText class="h-4 w-4 text-[#1E5AA8]" />
                Export CSV
              </button>
              <button id="btn-draft-spt" type="button" onClick={printTaxReport} class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]">
                <FileText class="h-4 w-4 text-[#1E5AA8]" />
                Cetak / Simpan PDF
              </button>
              <button id="btn-tax-manual" type="button" onClick={() => {
                resetManualTaxForm();
                setIsTaxManualModalOpen(true);
              }} class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]">
                <Plus class="h-4 w-4" />
                Buat Kewajiban Pajak
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
                {taxPerformanceCards().map(([label, value]) => <div key={label} class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3">
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
                    {taxPeriodOptions().map(period => <option key={period} value={period}>{formatPeriodLabel(period)}</option>)}
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
                    <option>PPh Final</option>
                    <option>PPh Badan</option>
                    <option>Lainnya</option>
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
                  <option value="Semua">Semua Jenis Pajak</option>
                  <option>PPN</option>
                  <option>PPh 21</option>
                  <option>PPh 23</option>
                  <option>PPh 25</option>
                  <option>PPh Final</option>
                  <option>PPh Badan</option>
                  <option>Lainnya</option>
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
                <span class="shrink-0 text-[11px] text-[#7A8CA8]">{filteredTaxRows.value.length} data</span>
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
                    {filteredTaxRows.value.length === 0 ? <tr>
                        <td colSpan={8} class="px-3 py-12 text-center text-sm text-[#8A99AD]">Tidak ada data pajak yang sesuai.</td>
                      </tr> : pagedTaxRows.value.map(tax => <tr key={tax.id} class="transition hover:bg-[#FAFCFE]">
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
              <TablePagination page={taxPage.value} total={filteredTaxRows.value.length} onPageChange={(page: number) => taxPage.value = safePage(page, filteredTaxRows.value.length)} />
            </div>
          </section>
        </div>}
      {/* 3. SET RATE BPJS MODAL */}
      {isBpjsModalOpen.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#0B1220]/60 p-4 backdrop-blur-sm">
          <div class="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-[560px] overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
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
      {isEmployeeModalOpen.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#0B1220]/60 p-3 backdrop-blur-sm">
          <div class="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[860px] flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl">
            <div class="flex items-start justify-between border-b border-slate-100 px-7 py-6">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#1E5AA8]">Langkah 2 dari 3</p>
                <h3 class="mt-1 text-xl font-extrabold tracking-tight text-[#111827]">{editingEmployee.value ? 'Ubah Pegawai' : 'Tambah Pegawai'}</h3>
                <p class="mt-1 text-xs leading-5 text-[#64748B]">Isi data wajib terlebih dahulu. Data tambahan dapat dilengkapi kemudian.</p>
              </div>
              <button id="btn-close-employee-modal" type="button" onClick={() => { setIsEmployeeModalOpen(false); resetEmployeeForm(); }} class="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-slate-600">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} class="min-h-0 flex-1 space-y-6 overflow-y-auto px-7 py-6 text-xs">
              <section class="space-y-4">
                <div class="flex items-center gap-2 border-b border-[#D8E5F4] pb-3">
                  <UserCircle class="w-4 h-4 text-[#0B1F4A]" />
                  <h4 class="font-extrabold uppercase tracking-wider text-[#1F2A44]">Data Wajib Pegawai</h4>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Nama Lengkap"><input required value={employeeForm.value.nama} onInput={e => setEmployeeForm({ ...employeeForm.value, nama: e.target.value })} class={inputClass} placeholder="Contoh: Rizka Farida Damayanti" /></Field>
                  <Field label="NIK"><input required value={employeeForm.value.nik} onInput={e => setEmployeeForm({ ...employeeForm.value, nik: e.target.value })} class={inputClass} placeholder="Nomor identitas pegawai" /></Field>
                  <Field label="Email"><input type="email" value={employeeForm.value.email} onInput={e => setEmployeeForm({ ...employeeForm.value, email: e.target.value })} class={inputClass} placeholder="nama@perusahaan.com" /></Field>
                  <Field label="No. WhatsApp"><input value={employeeForm.value.whatsapp} onInput={e => setEmployeeForm({ ...employeeForm.value, whatsapp: e.target.value })} class={inputClass} placeholder="08xxxxxxxxxx" /></Field>
                  <Field label="Divisi"><select required value={employeeForm.value.divisionId} onChange={e => setEmployeeForm({ ...employeeForm.value, divisionId: e.target.value, positionId: '' })} class={inputClass}>
                    <option value="">Pilih divisi</option>
                    {activeDivisions().map((division: any) => <option key={division.id} value={String(division.id)}>{division.name}</option>)}
                  </select></Field>
                  <Field label="Jabatan"><select required value={employeeForm.value.positionId} onChange={e => setEmployeeForm({ ...employeeForm.value, positionId: e.target.value })} class={inputClass}>
                    <option value="">Pilih jabatan</option>
                    {filteredPositions().map((position: any) => <option key={position.id} value={String(position.id)}>{position.name}</option>)}
                  </select></Field>
                  <Field label="Status Kerja"><select value={employeeForm.value.statusKontrak} onChange={e => setEmployeeForm({ ...employeeForm.value, statusKontrak: e.target.value })} class={inputClass}>
                    <option>Karyawan Tetap</option><option>Kontrak</option><option>Probation</option>
                  </select></Field>
                  {editingEmployee.value && <div class="md:col-span-2 rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3">
                    <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
                      <div><p class="font-extrabold text-[#0B1F4A]">Status Pegawai</p><p class="mt-1 text-[11px] leading-5 text-[#6B7A90]">Pilih Nonaktif bila pegawai sudah tidak bekerja. Riwayat payroll tetap tersimpan.</p></div>
                      <select value={employeeForm.value.employmentStatus} onChange={e => setEmployeeForm({ ...employeeForm.value, employmentStatus: e.target.value })} class={inputClass}>
                        <option value="active">Aktif</option><option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                  </div>}
                  <Field label="Status PTKP"><select value={employeeForm.value.ptkpStatus} onChange={e => setEmployeeForm({ ...employeeForm.value, ptkpStatus: e.target.value })} class={inputClass}><option>TK/0</option><option>TK/1</option><option>TK/2</option><option>TK/3</option><option>K/0</option><option>K/1</option><option>K/2</option><option>K/3</option></select></Field>
                  <Field label="Tanggal Bergabung"><input required type="date" value={employeeForm.value.tanggalBergabung} onChange={e => setEmployeeForm({ ...employeeForm.value, tanggalBergabung: e.target.value })} class={inputClass} /></Field>
                  <div class="md:col-span-2"><Field label="Gaji Pokok"><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1E5AA8]">Rp</span><input required type="number" min="0" value={employeeForm.value.gajiPokok || ''} onInput={e => setEmployeeForm({ ...employeeForm.value, gajiPokok: Number(e.target.value) })} class={`${inputClass} pl-12`} placeholder="0" /></div></Field></div>
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
                <button type="button" onClick={() => { setIsEmployeeModalOpen(false); resetEmployeeForm(); }} class="h-11 rounded-xl border border-[#D8E5F4] px-5 font-extrabold text-[#64748B]">Batal</button>
                <button id="btn-submit-employee" type="submit" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10182C] px-6 font-extrabold text-white shadow-lg shadow-[#10182C]/20"><CheckCircle2 class="w-4 h-4" /> {editingEmployee.value ? 'Simpan Perubahan' : 'Simpan Pegawai'}</button>
              </div>
            </form>
          </div>
        </div>}


      {/* 5. PROCESS PAYROLL MODAL */}
      {isPayrollModalOpen.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#000]/60 p-4 backdrop-blur-sm">
          <div class="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
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

            <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-xs">
              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Pegawai yang Diproses</label>
                <select id="payroll-employee" value={payrollForm.value.employeeId} onChange={event => payrollForm.value.employeeId = event.target.value} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs">
                  <option value="">-- Pilih pegawai --</option>
                  {pegawai.filter((employee: any) => String(employee?._raw?.employment_status || 'active').toLowerCase() === 'active').map((employee: any) => <option key={employee?._raw?.id || employee.id} value={String(employee?._raw?.id || '')}>{employee.nama} · {employee.id}</option>)}
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
                  <p>&bull; Penghasilan bruto: <span class="font-bold">{formatRupiah(currentPayrollAmount())}</span></p>
                  <p>&bull; Estimasi take-home pay: <span class="font-bold">{formatRupiah(currentPayrollEstimatedNet())}</span></p>
                  <p>&bull; Net Payroll MTD: <span class="font-bold">{formatRupiah(asNumber(payrollSummary.value.total_net_pay))}</span></p>
                  <p class="border-t border-blue-200 pt-1.5 font-sans font-extrabold text-[#0B1F4A] text-sm">
                    Nilai payroll bruto: {formatRupiah(currentPayrollAmount())}
                  </p>
                </div>
              </div>

              <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-3">
                <p class="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#1E5AA8]">Komponen Payroll & Potongan</p>
                <div class="grid grid-cols-2 gap-2">
                  <label class="text-[10px] text-[#53658A]">Lembur<input type="number" min="0" value={payrollForm.value.overtimeAmount || ''} onChange={event => payrollForm.value.overtimeAmount = asNumber(event.target.value)} class="mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs" /></label>
                  <label class="text-[10px] text-[#53658A]">Tunjangan<input type="number" min="0" value={payrollForm.value.allowanceAmount || ''} onChange={event => payrollForm.value.allowanceAmount = asNumber(event.target.value)} class="mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs" /></label>
                  <label class="text-[10px] text-[#53658A]">Bonus<input type="number" min="0" value={payrollForm.value.bonusAmount || ''} onChange={event => payrollForm.value.bonusAmount = asNumber(event.target.value)} class="mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs" /></label>
                  <label class="text-[10px] text-[#53658A]">Kasbon<input type="number" min="0" value={payrollForm.value.loanDeduction || ''} onChange={event => payrollForm.value.loanDeduction = asNumber(event.target.value)} class="mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs" /></label>
                  <label class="text-[10px] text-[#53658A]">Potongan lain<input type="number" min="0" value={payrollForm.value.otherDeduction || ''} onChange={event => payrollForm.value.otherDeduction = asNumber(event.target.value)} class="mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs" /></label>
                  <label class="text-[10px] text-[#53658A]">PPh 21 manual (Desember)<input type="number" min="0" value={payrollForm.value.pph21ManualAmount || ''} onChange={event => payrollForm.value.pph21ManualAmount = asNumber(event.target.value)} class="mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs" /></label>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Sumber Rekening Dana Payout</label>
                <select id="payroll-source-bank" value={payrollForm.value.cashAccountId} onChange={event => payrollForm.value.cashAccountId = event.target.value} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs">
                  <option value="">-- Pilih Kas/Bank --</option>
                  {payrollAccounts.value.map((account: any) => <option key={account.id} value={String(account.id)}>{account.code} - {account.name}</option>)}
                </select>
              </div>

              <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-3 text-[10px] text-[#53658A]">PPh 21 yang dihitung akan otomatis menjadi potongan payroll dan Utang Pajak pada jurnal. Untuk Desember, isi nominal final setelah rekonsiliasi tahunan resmi.</div>
              {pph21Estimate.value && <div class="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-[#0B1F4A]"><p class="font-semibold">Estimasi PPh 21: {pph21Estimate.value.needs_final_reconciliation ? 'Perlu rekonsiliasi tahunan' : formatRupiah(asNumber(pph21Estimate.value.pph21_amount))}</p><p class="mt-1 text-[10px]">{pph21Estimate.value.message || `TER ${(asNumber(pph21Estimate.value.ter_rate) * 100).toFixed(2)}% · Take home pay ${formatRupiah(asNumber(pph21Estimate.value.take_home_pay))}`}</p></div>}
              <button type="button" onClick={calculatePayrollPph21} class="w-full border border-[#BFD5EE] bg-white text-[#0B1F4A] font-semibold py-2.5 rounded-xl transition-all">Hitung Estimasi PPh 21 Pegawai</button>
              <button id="btn-confirm-payout" onClick={handleProcessPayroll} class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white font-semibold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" /> Proses Payroll Pegawai Ini
              </button>
              <button type="button" onClick={handleProcessPayrollBulk} class="w-full border border-[#0B1F4A] bg-white text-[#0B1F4A] font-semibold py-2.5 rounded-xl transition-all">Proses Semua Pegawai Aktif</button>
              <button type="button" onClick={downloadPayrollBankTransfer} class="w-full text-[#1E5AA8] font-semibold py-1.5 text-xs">Unduh File Transfer Bank Periode Ini</button>
            </div>
          </div>
        </div>}

      {payslipPreview.value && <div class="fixed inset-0 z-[9998] flex items-center justify-center bg-[#000]/60 p-4 backdrop-blur-sm"><div class="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"><div class="flex items-start justify-between border-b border-[#E8EEF7] px-6 py-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Payslip Payroll</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">{payslipPreview.value.employee_name || 'Pegawai'}</h3><p class="mt-1 text-xs text-[#6B7A90]">Periode {payslipPreview.value.payroll_period || '-'}</p></div><button type="button" onClick={() => payslipPreview.value = null} class="rounded-xl p-2 text-[#6B7A90]"><X class="h-5 w-5" /></button></div><div class="space-y-3 px-6 py-5 text-sm"><div class="flex justify-between"><span>Gaji pokok</span><strong>{formatRupiah(asNumber(payslipPreview.value.base_salary))}</strong></div><div class="flex justify-between"><span>Lembur + tunjangan + bonus</span><strong>{formatRupiah(asNumber(payslipPreview.value.overtime_amount) + asNumber(payslipPreview.value.allowance_amount) + asNumber(payslipPreview.value.bonus_amount))}</strong></div><div class="flex justify-between"><span>Potongan BPJS pegawai</span><strong>{formatRupiah(asNumber(payslipPreview.value.employee_bpjs_deduction))}</strong></div><div class="flex justify-between"><span>Potongan PPh 21</span><strong>{formatRupiah(asNumber(payslipPreview.value.pph21_amount))}</strong></div><div class="flex justify-between"><span>Kasbon & potongan lain</span><strong>{formatRupiah(asNumber(payslipPreview.value.loan_deduction) + asNumber(payslipPreview.value.other_deduction))}</strong></div><div class="flex justify-between border-t border-[#E8EEF7] pt-3 text-[#0B1F4A]"><span class="font-semibold">Gaji bersih</span><strong>{formatRupiah(asNumber(payslipPreview.value.net_pay))}</strong></div></div><div class="flex justify-end gap-3 border-t border-[#E8EEF7] px-6 py-4"><button type="button" onClick={() => payslipPreview.value = null} class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium">Tutup</button><button type="button" onClick={openPayslipPrint} class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"><FileText class="h-4 w-4" /> Cetak / Simpan PDF</button></div></div></div>}

      {/* 5. FORM KEWAJIBAN PAJAK: PPh 21, PPh 23, DAN JENIS LAIN */}
      {isTaxManualModalOpen.value && <Teleport to="body">
        <div class="tax-manual-modal-layer fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#111827]/70 p-3 backdrop-blur-sm sm:p-6">
          <div class="tax-manual-card my-3 flex w-full max-w-[840px] flex-col overflow-hidden rounded-[24px] border border-[#DCE7F4] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.38)] sm:my-4">
            <div class="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-4 border-b border-[#E8EEF7] bg-white px-5 py-4 sm:px-6">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]">Form Pajak</p>
                <h3 class="mt-1 text-base font-semibold text-[#102A56]">Buat Kewajiban PPh / Pajak Lainnya</h3>
                <p class="mt-1 text-[11px] leading-5 text-[#6B7A90]">
                  Pilih jenis pajak, isi data inti, lalu simpan kewajiban. Tarif dan nominal tetap dikendalikan oleh Finance.
                </p>
              </div>
              <button id="btn-close-tax-manual" type="button" onClick={() => {
                setIsTaxManualModalOpen(false);
                resetManualTaxForm();
              }} class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] text-[#8091A8] transition hover:bg-white hover:text-[#102A56]" aria-label="Tutup form pajak">
                <X class="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualTax} class="tax-manual-form min-h-0 flex-1 overflow-y-auto space-y-4 px-5 py-4 sm:px-6">
              <section>
                <div class="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[12px] font-semibold text-[#102A56]">1. Template Jenis Pajak</p>
                    <p class="mt-0.5 text-[11px] text-[#7A8CA8]">Pilih template agar field objek dan keterangan awal terisi rapi.</p>
                  </div>
                  <span class="hidden rounded-full bg-[#EEF5FF] px-2.5 py-1 text-[10px] font-semibold text-[#1E5AA8] sm:inline-flex">
                    Data dicatat sebagai kewajiban pajak
                  </span>
                </div>

                <div class="rounded-2xl border border-[#DCE7F4] bg-[#FBFCFE] p-3.5">
                  <div class="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.75fr)] md:items-end">
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-medium text-[#7A8CA8]">Dropdown Template Pajak</label>
                      <select value={manualTaxForm.value.jenis} onChange={event => selectManualTaxType(event.target.value as PajakKewajiban['jenis'])} class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10">
                        {manualTaxOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </div>
                    <div class="rounded-xl border border-[#E6EEF7] bg-white px-3.5 py-3">
                      <p class="text-[10px] font-medium text-[#7A8CA8]">Template Aktif</p>
                      <p class="mt-1 text-[12px] font-semibold text-[#102A56]">{selectedManualTaxOption()?.label}</p>
                    </div>
                  </div>
                  <p class="mt-3 text-[11px] leading-5 text-[#6B7A90]">{selectedManualTaxOption()?.hint}</p>
                </div>
              </section>

              <section class="rounded-2xl border border-[#E6EEF7] bg-[#FBFCFE] p-3.5">
                <div class="mb-3">
                  <p class="text-[12px] font-semibold text-[#102A56]">2. Rincian Kewajiban {manualTaxForm.value.jenis}</p>
                  <p class="mt-1 text-[11px] text-[#7A8CA8]">
                    Untuk PPh 21 dan PPh 23, isi pihak penerima penghasilan agar pencatatan lebih mudah ditelusuri.
                  </p>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">Masa Pajak</label>
                    <input type="month" value={manualTaxForm.value.period} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      period: event.target.value
                    })} class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" required />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">Jatuh Tempo</label>
                    <input type="date" value={manualTaxForm.value.dueDate} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      dueDate: event.target.value
                    })} class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" required />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">{manualTaxSubjectLabel()}</label>
                    <input type="text" value={manualTaxForm.value.subjectName} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      subjectName: event.target.value
                    })} placeholder={manualTaxForm.value.jenis === 'PPh 21' ? 'Contoh: Rizka Farida Damayanti' : manualTaxForm.value.jenis === 'PPh 23' ? 'Contoh: PT Konsultan Nusantara' : 'Opsional'} class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" required={['PPh 21', 'PPh 23'].includes(manualTaxForm.value.jenis)} />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">{manualTaxIdentityLabel()}</label>
                    <input type="text" value={manualTaxForm.value.subjectIdentity} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      subjectIdentity: event.target.value
                    })} placeholder="Opsional" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                  </div>

                  <div class="space-y-1.5 md:col-span-2">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">Objek / Keterangan Pajak</label>
                    <input type="text" value={manualTaxForm.value.taxObject} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      taxObject: event.target.value
                    })} placeholder="Contoh: Jasa desain, gaji bulan berjalan, atau angsuran PPh badan" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-[#E6EEF7] bg-white p-3.5">
                <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p class="text-[12px] font-semibold text-[#102A56]">3. Nominal Pajak</p>
                    <p class="mt-1 text-[11px] text-[#7A8CA8]">Bisa isi nominal langsung atau gunakan kalkulasi sederhana dari dasar pengenaan dan tarif.</p>
                  </div>
                  <button type="button" onClick={applySuggestedManualTaxAmount} class="inline-flex h-9 items-center justify-center rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[11px] font-medium text-[#1E5AA8] transition hover:bg-[#EEF5FF]">
                    Gunakan Hasil Hitung
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">Dasar Pengenaan (opsional)</label>
                    <input type="number" min="0" value={manualTaxForm.value.taxBase || ''} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      taxBase: Number(event.target.value)
                    })} placeholder="0" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">Tarif (%) (opsional)</label>
                    <input type="number" min="0" max="100" step="0.01" value={manualTaxForm.value.rate || ''} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      rate: Number(event.target.value)
                    })} placeholder="0" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]">Nominal Pajak</label>
                    <input type="number" min="1" value={manualTaxForm.value.nominal || ''} onChange={event => setManualTaxForm({
                      ...manualTaxForm.value,
                      nominal: Number(event.target.value)
                    })} placeholder="Wajib diisi" class="h-11 w-full rounded-lg border border-[#1E5AA8] bg-[#F7FBFF] px-3 text-[12px] font-semibold text-[#102A56] outline-none placeholder:text-[#8EA7C3] focus:ring-4 focus:ring-[#1E5AA8]/10" required />
                  </div>
                </div>

                <div class="mt-3 flex flex-col gap-1 rounded-xl bg-[#F7FBFF] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span class="text-[11px] text-[#6B7A90]">Saran dari dasar × tarif</span>
                  <strong class="text-sm text-[#1E5AA8]">{formatRupiah(suggestedManualTaxAmount())}</strong>
                </div>
              </section>

              <section class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Nomor Referensi (opsional)</label>
                  <input type="text" value={manualTaxForm.value.reference} onChange={event => setManualTaxForm({
                    ...manualTaxForm.value,
                    reference: event.target.value
                  })} placeholder="e-Billing, nomor bukti potong, atau referensi internal" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">Catatan Tambahan (opsional)</label>
                  <input type="text" value={manualTaxForm.value.notes} onChange={event => setManualTaxForm({
                    ...manualTaxForm.value,
                    notes: event.target.value
                  })} placeholder="Contoh: Dokumen pendukung tersimpan pada folder pajak" class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" />
                </div>
              </section>

              <div class="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-5 text-amber-800">
                Tarif tidak dipaksakan oleh sistem. Pastikan objek pajak, tarif, dan dokumen pendukung sudah direview oleh Finance sebelum kewajiban diterbitkan.
              </div>

              <div class="sticky bottom-0 z-20 -mx-5 flex flex-col-reverse gap-2 border-t border-[#E8EEF7] bg-white px-5 pb-1 pt-3 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                <button type="button" onClick={() => {
                  setIsTaxManualModalOpen(false);
                  resetManualTaxForm();
                }} class="h-10 rounded-lg border border-[#DCE7F4] bg-white px-4 text-[12px] font-medium text-[#64748B] transition hover:bg-[#F8FBFE]">
                  Batal
                </button>
                <button id="btn-save-tax-manual" type="submit" class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]">
                  <Save class="h-4 w-4" /> Simpan & Terbitkan Kewajiban
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>}

      {/* 5. TAX SSP SETTLEMENT MODAL */}
      {isTaxPayModalOpen.value && <div class="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 class="font-extrabold text-sm text-[#0B1F4A]">Catat Setoran Pajak Internal</h3>
                <span class="text-[10px] text-slate-400">Simpan bukti setoran dari kanal resmi secara internal</span>
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
                <p>FinStart belum terintegrasi langsung ke Bank Persepsi/DJP. Lakukan pembayaran melalui kanal resmi, lalu masukkan NTPN atau nomor bukti setoran pada data pajak bila tersedia.</p>
              </div>

              <button id="btn-tax-submit" type="submit" disabled={!selectedTaxId.value} class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" /> Catat Pembayaran Pajak
              </button>
            </form>
          </div>
        </div>}
    </div>;
  }
});
</script>

<style scoped>
.tax-manual-modal-layer {
  align-items: center;
  background: rgba(15, 23, 42, 0.78) !important;
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  z-index: 10000 !important;
  overscroll-behavior: contain;
}

.tax-manual-card {
  width: min(840px, calc(100vw - 40px));
  max-height: calc(100dvh - 1.5rem);
}

.tax-manual-form {
  max-height: calc(100dvh - 8.5rem);
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

@media (min-width: 640px) {
  .tax-manual-card {
    max-height: calc(100dvh - 2rem);
  }

  .tax-manual-form {
    max-height: calc(100dvh - 9rem);
  }
}
</style>
