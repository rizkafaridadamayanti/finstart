<script lang="tsx">
import { Fragment, computed, defineComponent, h, ref } from "vue";
import { AlertCircle, BarChart3, CalendarDays, CheckCircle2, Download, FileSpreadsheet, Pencil, Plus, Printer, RefreshCw, Target, Trash2, TrendingUp, X } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { AkunBukuBesar, Proyek, Transaksi } from '../types.ts';
import ConfirmDialog from './common/ConfirmDialog.vue';
import { TablePagination, latestFirst, pageRows, safePage } from '../utils/tablePagination.tsx';
interface ProyeksiDanLaporanProps {
  activeSection: 'proyeksi' | 'laporan';
  akun: AkunBukuBesar[];
  transaksi: Transaksi[];
  proyek: Proyek[];
  divisions?: any[];
  projectionData?: any;
  reportData?: any;
  reportPeriod?: string;
  reportPeriods?: any[];
  reportError?: string;
  onSelectReportPeriod?: (period: string) => Promise<void> | void;
  onSaveProjection: (data: any) => Promise<void> | void;
  onSelectProjectionScenario?: (scenarioKey: string) => Promise<void> | void;
  onUpdateProjectionScenario?: (scenario: any) => Promise<void> | void;
  onSaveBudgetAllocation?: (budget: any) => Promise<void> | void;
  onDeleteBudgetAllocation?: (budget: any) => Promise<void> | void;
  showToast: (msg: string) => void;
}
interface AnnualTarget {
  id: string;
  nama: string;
  nilaiTarget: number;
  nilaiRealisasi: number;
  satuan: 'Rupiah' | 'Persen' | 'Klien';
}
type ReportType = 'labarugi' | 'neraca' | 'aruskas' | 'trialbalance' | 'bukubesar' | 'umurtagih' | 'umurutang' | 'pajak' | 'payroll' | 'aset' | 'profitproyek';
const currentMonthIso = () => new Date().toISOString().slice(0, 7);
const currencyOrUnit = (value: number, unit: AnnualTarget['satuan']) => {
  if (unit === 'Rupiah') return formatRupiah(value);
  if (unit === 'Persen') return `${value.toLocaleString('id-ID')}%`;
  return `${value.toLocaleString('id-ID')} Klien`;
};
const reportTabs: {
  id: ReportType;
  label: string;
  short: string;
}[] = [
  { id: 'labarugi', label: 'Laba Rugi', short: 'Laba Rugi' },
  { id: 'neraca', label: 'Neraca', short: 'Neraca' },
  { id: 'aruskas', label: 'Arus Kas', short: 'Arus Kas' },
  { id: 'trialbalance', label: 'Trial Balance', short: 'Trial Balance' },
  { id: 'bukubesar', label: 'Buku Besar', short: 'Buku Besar' },
  { id: 'umurtagih', label: 'Umur Piutang', short: 'Umur Piutang' },
  { id: 'umurutang', label: 'Umur Utang', short: 'Umur Utang' },
  { id: 'pajak', label: 'Laporan Pajak', short: 'Pajak' },
  { id: 'payroll', label: 'Biaya Payroll', short: 'Payroll' },
  { id: 'aset', label: 'Aset & Penyusutan', short: 'Aset' },
  { id: 'profitproyek', label: 'Profit Proyek', short: 'Profit Proyek' },
];
export default defineComponent({
  name: "ProyeksiDanLaporan",
  props: ["activeSection", "akun", "transaksi", "proyek", "divisions", "projectionData", "reportData", "reportPeriod", "reportPeriods", "reportError", "onSelectReportPeriod", "onSaveProjection", "onSelectProjectionScenario", "onUpdateProjectionScenario", "onSaveBudgetAllocation", "onDeleteBudgetAllocation", "showToast"],
  setup(props) {
    const {
      activeSection,
      akun,
      transaksi,
      proyek,
      divisions = [],
      projectionData,
      reportData,
      reportPeriod = '',
      reportPeriods = [],
      reportError = '',
      onSelectReportPeriod,
      onSaveProjection,
      onSelectProjectionScenario,
      onUpdateProjectionScenario,
      onSaveBudgetAllocation,
      onDeleteBudgetAllocation,
      showToast
    }: ProyeksiDanLaporanProps = props as ProyeksiDanLaporanProps;
    const isForecast = activeSection === 'proyeksi';
    const activeReportType = ref<ReportType>('labarugi'),
      setActiveReportType = next => activeReportType.value = typeof next === "function" ? next(activeReportType.value) : next;
    const isTargetModalOpen = ref(false),
      setIsTargetModalOpen = next => isTargetModalOpen.value = typeof next === "function" ? next(isTargetModalOpen.value) : next;
    const editingTargetId = ref('');
    const isPrintModalOpen = ref(false),
      setIsPrintModalOpen = next => isPrintModalOpen.value = typeof next === "function" ? next(isPrintModalOpen.value) : next;
    const selectedScenarioKey = ref(String(projectionData?.scenario?.scenario_key || 'normal')),
      setSelectedScenarioKey = next => selectedScenarioKey.value = typeof next === "function" ? next(selectedScenarioKey.value) : next;
    const scenarioForm = ref({
      scenario_key: String(projectionData?.scenario?.scenario_key || 'normal'),
      revenue_factor: Number(projectionData?.scenario?.revenue_factor || 1),
      expense_factor: Number(projectionData?.scenario?.expense_factor || 1),
      notes: String(projectionData?.scenario?.notes || '')
    }),
      setScenarioForm = next => scenarioForm.value = typeof next === "function" ? next(scenarioForm.value) : next;
    const budgetForm = ref({
      id: '',
      budget_year: Number(projectionData?.year || new Date().getFullYear()),
      budget_month: '',
      scenario_key: String(projectionData?.scenario?.scenario_key || 'normal'),
      account_id: '',
      division_id: '',
      budget_amount: 0,
      notes: ''
    }),
      setBudgetForm = next => budgetForm.value = typeof next === "function" ? next(budgetForm.value) : next;
    const deleteBudgetConfirm = ref<any>(null);
    const targetPage = ref(1);
    const budgetPage = ref(1);
    const targetDetailPage = ref(1);
    const reportPage = ref(1);
    const projectionSummary = projectionData?.summary || {};
    const targets = ref<AnnualTarget[]>([
      {
        id: `TARGET-REV-${projectionData?.year || new Date().getFullYear()}`,
        nama: 'Target Pendapatan',
        nilaiTarget: Number(projectionSummary.revenue_target || 0),
        nilaiRealisasi: Number(projectionSummary.revenue_actual || 0),
        satuan: 'Rupiah',
      },
      {
        id: `TARGET-EXP-${projectionData?.year || new Date().getFullYear()}`,
        nama: 'Target Beban Operasional',
        nilaiTarget: Number(projectionSummary.expense_target || 0),
        nilaiRealisasi: Number(projectionSummary.expense_actual || 0),
        satuan: 'Rupiah',
      },
      {
        id: `TARGET-PROFIT-${projectionData?.year || new Date().getFullYear()}`,
        nama: 'Target Laba Bersih',
        nilaiTarget: Number(projectionSummary.profit_target || 0),
        nilaiRealisasi: Number(projectionSummary.profit_actual || 0),
        satuan: 'Rupiah',
      },
    ]);
    const newTarget = ref({
        akunId: '',
        nilaiTarget: 0,
        nilaiRealisasi: 0,
        satuan: 'Rupiah' as AnnualTarget['satuan'],
        bulanProyeksi: currentMonthIso()
      }),
      setNewTarget = next => newTarget.value = typeof next === "function" ? next(newTarget.value) : next;
    const achievementAverage = computed(() => {
      if (!targets.value.length) return 0;
      return Math.round(targets.value.reduce((sum, target) => sum + Math.min(100, target.nilaiRealisasi / Math.max(target.nilaiTarget, 1) * 100), 0) / targets.value.length);
    });

    const projectionMonths = Array.isArray(projectionData?.months) ? projectionData.months : [];
    const projectionScenarios = Array.isArray(projectionData?.scenarios) ? projectionData.scenarios : [];
    const budgetAllocations = Array.isArray(projectionData?.budget_allocations) ? projectionData.budget_allocations : [];
    const orderedTargets = computed(() => latestFirst(targets.value));
    const orderedBudgetAllocations = computed(() => latestFirst(budgetAllocations));
    const pagedTargets = computed(() => pageRows(orderedTargets.value, targetPage.value));
    const pagedBudgetAllocations = computed(() => pageRows(orderedBudgetAllocations.value, budgetPage.value));
    const pagedTargetDetails = computed(() => pageRows(orderedTargets.value, targetDetailPage.value));
    const budgetSummary = projectionData?.budget_summary || {};
    const currentScenario = projectionData?.scenario || { scenario_key: 'normal', label: 'Normal', revenue_factor: 1, expense_factor: 1 };
    const selectScenario = async (scenario: any) => {
      const key = String(scenario?.scenario_key || scenario || 'normal');
      setSelectedScenarioKey(key);
      setScenarioForm({
        scenario_key: key,
        revenue_factor: Number(scenario?.revenue_factor || 1),
        expense_factor: Number(scenario?.expense_factor || 1),
        notes: String(scenario?.notes || '')
      });
      setBudgetForm({ ...budgetForm.value, scenario_key: key });
      if (onSelectProjectionScenario) await onSelectProjectionScenario(key);
    };
    const saveScenario = async () => {
      if (!onUpdateProjectionScenario) return;
      if (Number(scenarioForm.value.revenue_factor) <= 0 || Number(scenarioForm.value.expense_factor) <= 0) {
        showToast('Faktor pendapatan dan beban harus lebih dari 0.');
        return;
      }
      await onUpdateProjectionScenario({ ...scenarioForm.value, scenario_key: selectedScenarioKey.value });
    };
    const resetBudgetForm = () => setBudgetForm({
      id: '',
      budget_year: Number(projectionData?.year || new Date().getFullYear()),
      budget_month: '',
      scenario_key: selectedScenarioKey.value || 'normal',
      account_id: '',
      division_id: '',
      budget_amount: 0,
      notes: ''
    });
    const editBudget = (budget: any) => setBudgetForm({
      id: String(budget.id),
      budget_year: Number(budget.budget_year || projectionData?.year || new Date().getFullYear()),
      budget_month: budget.budget_month ? String(budget.budget_month) : '',
      scenario_key: String(budget.scenario_key || selectedScenarioKey.value || 'normal'),
      account_id: String(budget.account_id || ''),
      division_id: budget.division_id ? String(budget.division_id) : '',
      budget_amount: Number(budget.budget_amount || 0),
      notes: String(budget.notes || '')
    });
    const saveBudget = async (event: Event) => {
      event.preventDefault();
      if (!onSaveBudgetAllocation) return;
      if (!budgetForm.value.account_id) {
        showToast('Pilih akun buku besar untuk budget.');
        return;
      }
      if (Number(budgetForm.value.budget_amount) < 0) {
        showToast('Nilai budget tidak boleh negatif.');
        return;
      }
      await onSaveBudgetAllocation({ ...budgetForm.value, scenario_key: selectedScenarioKey.value || budgetForm.value.scenario_key });
      resetBudgetForm();
    };
    const deleteBudget = async (budget: any) => {
      if (!onDeleteBudgetAllocation) return;
      deleteBudgetConfirm.value = budget;
    };
    const confirmDeleteBudget = async () => {
      if (!onDeleteBudgetAllocation || !deleteBudgetConfirm.value) return;
      const budget = deleteBudgetConfirm.value;
      deleteBudgetConfirm.value = null;
      await onDeleteBudgetAllocation(budget);
      if (String(budgetForm.value.id) === String(budget.id)) resetBudgetForm();
    };
    const roadmapBase = projectionMonths.length ? projectionMonths : [{ label: 'Tahun 1', forecast_revenue: 0, revenue_target: 0, revenue_actual: 0, expense_target: 0, expense_actual: 0 }];
    const roadmapRows = roadmapBase.slice(0, 6).map((item: any, index: number) => {
      const revenueTarget = Number(item.revenue_target || item.forecast_revenue || 0);
      const revenueForecast = Number(item.forecast_revenue || item.revenue_actual || revenueTarget || 0);
      const revenueActual = Number(item.revenue_actual || revenueForecast || 0);
      const expenseTarget = Number(item.expense_target || 0);
      const expenseForecast = Number(item.forecast_expense || item.expense_actual || expenseTarget || 0);
      const expenseActual = Number(item.expense_actual || expenseForecast || 0);
      return {
        label: item.short_label || item.label || `Bulan ${index + 1}`,
        revenueTarget,
        revenueForecast,
        revenueActual,
        expenseTarget,
        expenseForecast,
        expenseActual,
        value: Number((Math.max(revenueTarget, revenueForecast, revenueActual, expenseTarget, expenseForecast, expenseActual) / 1000000000).toFixed(1)),
      };
    });
    const roadmapMax = Math.max(...roadmapRows.flatMap(item => [item.revenueTarget, item.revenueForecast, item.revenueActual, item.expenseTarget, item.expenseForecast, item.expenseActual]), 1);
    const roadmapChartWidth = 1000;
    const roadmapChartHeight = 300;
    const roadmapChartPadding = {
      left: 56,
      right: 28,
      top: 22,
      bottom: 46,
    };
    const roadmapChartRows = roadmapRows.map((item, index) => {
      const usableWidth = roadmapChartWidth - roadmapChartPadding.left - roadmapChartPadding.right;
      const usableHeight = roadmapChartHeight - roadmapChartPadding.top - roadmapChartPadding.bottom;
      const x = roadmapChartPadding.left + (roadmapRows.length <= 1 ? usableWidth / 2 : (index * usableWidth) / Math.max(roadmapRows.length - 1, 1));
      const projectY = (value: number) => roadmapChartPadding.top + (1 - Number(value || 0) / roadmapMax) * usableHeight;
      return {
        ...item,
        x,
        revenueTargetY: projectY(item.revenueTarget),
        revenueForecastY: projectY(item.revenueForecast),
        revenueActualY: projectY(item.revenueActual),
        expenseTargetY: projectY(item.expenseTarget),
        expenseForecastY: projectY(item.expenseForecast),
        expenseActualY: projectY(item.expenseActual),
      };
    });
    const roadmapLinePoints = (key: 'revenueTargetY' | 'revenueForecastY' | 'revenueActualY' | 'expenseTargetY' | 'expenseForecastY' | 'expenseActualY') => roadmapChartRows.length
      ? roadmapChartRows.map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x} ${item[key]}`).join(' ')
      : '';
    const firstAccountByType = (type: string) => akun.find((item: any) => String(item.tipe || '').toLowerCase() === type.toLowerCase()) || akun.find((item: any) => ['Pendapatan', 'Beban'].includes(String(item.tipe || ''))) || akun[0];
    const openTargetModal = (target: AnnualTarget | null = null) => {
      editingTargetId.value = target?.id || '';
      const targetName = String(target?.nama || '').toLowerCase();
      const selectedAccount = targetName.includes('beban') || targetName.includes('expense') ? firstAccountByType('Beban') : firstAccountByType('Pendapatan');
      setNewTarget({
        akunId: selectedAccount ? String(selectedAccount.id) : '',
        nilaiTarget: Number(target?.nilaiTarget || 0),
        nilaiRealisasi: Number(target?.nilaiRealisasi || 0),
        satuan: target?.satuan || 'Rupiah',
        bulanProyeksi: currentMonthIso()
      });
      setIsTargetModalOpen(true);
    };
    const closeTargetModal = () => {
      editingTargetId.value = '';
      setIsTargetModalOpen(false);
    };
    const handleSaveTarget = async (event: Event) => {
      event.preventDefault();
      const selected = akun.find(item => String(item.id) === String(newTarget.value.akunId));
      if (!selected) {
        showToast('Pilih akun buku besar terlebih dahulu.');
        return;
      }
      if (newTarget.value.satuan !== 'Rupiah') {
        showToast('Target API saat ini mendukung nilai Rupiah untuk pendapatan dan beban.');
        return;
      }
      if (!onSaveProjection) { showToast('Handler simpan target belum tersedia.'); return; }
      await onSaveProjection({
        ...newTarget.value,
        akunType: selected.tipe,
        akunName: selected.nama,
        nilai: Number(newTarget.value.nilaiTarget),
        month: Number(String(newTarget.value.bulanProyeksi || '').slice(-2)),
      });
      setNewTarget({ akunId: '', nilaiTarget: 0, nilaiRealisasi: 0, satuan: 'Rupiah', bulanProyeksi: currentMonthIso() });
      editingTargetId.value = '';
      setIsTargetModalOpen(false);
    };

    const reportPeriodLabel = reportData?.period_label || (reportPeriod ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(`${reportPeriod}-01T00:00:00`)) : 'periode berjalan');
    const hasReportData = () => Boolean(reportData?.period && !reportError);
    const selectReportPeriod = async (period: string) => {
      if (!/^\d{4}-\d{2}$/.test(String(period || '')) || !onSelectReportPeriod) return;
      await onSelectReportPeriod(period);
    };
    const reportRows = () => {
      const income = reportData?.income_statement || {};
      const balance = reportData?.balance_sheet || {};
      const cashFlow = reportData?.cash_flow || {};
      const trialBalance = reportData?.trial_balance || {};
      const ledger = reportData?.general_ledger || {};
      const receivableAging = reportData?.receivable_aging || {};
      const payableAging = reportData?.payable_aging || {};
      const taxReport = reportData?.tax_report || {};
      const payrollReport = reportData?.payroll_report || {};
      const assetReport = reportData?.asset_report || {};
      const projectProfitability = reportData?.project_profitability || {};
      const money = (value: any) => formatRupiah(Number(value || 0));

      if (activeReportType.value === 'labarugi') {
        const revenues = (income.revenue_items || []).map((item: any) => [`${item.code || ''} · ${item.name || 'Pendapatan'}`, 'Pendapatan Operasional', money(item.amount)]);
        const expenses = (income.expense_items || []).map((item: any) => [`${item.code || ''} · ${item.name || 'Beban'}`, 'Beban Operasional', `(${money(item.amount)})`]);
        return { title: 'Laporan Laba Rugi', subtitle: `Masa laporan ${reportPeriodLabel}`, columns: ['Kode / Uraian', 'Kelompok', 'Nilai'], rows: [...revenues, ...expenses], totals: [['Total Pendapatan Operasional', money(income.total_revenue)], ['Total Beban Operasional', `(${money(income.total_expense)})`], ['Laba Bersih Berjalan', money(income.net_profit)]] };
      }
      if (activeReportType.value === 'neraca') {
        const flatten = (items: any[], group: string) => (items || []).map((item: any) => [`${item.code || ''} · ${item.name || '-'}`, group, money(item.balance)]);
        return { title: 'Laporan Posisi Keuangan', subtitle: `Per ${reportPeriodLabel} · Mata uang Rupiah`, columns: ['Kode / Uraian', 'Kelompok', 'Nilai'], rows: [...flatten(balance.assets, 'Aset'), ...flatten(balance.liabilities, 'Kewajiban'), ...flatten(balance.equity, 'Ekuitas')], totals: [['Total Aset', money(balance.total_assets)], ['Total Kewajiban', money(balance.total_liabilities)], ['Total Ekuitas', money(balance.total_equity)]] };
      }
      if (activeReportType.value === 'aruskas') {
        const cashRows = [
          ...(cashFlow.operating_items || []).map((item: any) => ['Operasional', item.description || '-', money(item.amount)]),
          ...(cashFlow.investing_items || []).map((item: any) => ['Investasi', item.description || '-', money(item.amount)]),
          ...(cashFlow.financing_items || []).map((item: any) => ['Pendanaan', item.description || '-', money(item.amount)]),
        ];
        return { title: 'Laporan Arus Kas', subtitle: `Ringkasan arus kas ${reportPeriodLabel}`, columns: ['Aktivitas', 'Keterangan', 'Nilai'], rows: cashRows, totals: [['Kenaikan Kas Bersih', money(cashFlow.net_cash_increase)], ['Saldo Awal Kas', money(cashFlow.beginning_cash)], ['Saldo Akhir Kas', money(cashFlow.ending_cash)]] };
      }
      if (activeReportType.value === 'trialbalance') {
        return { title: 'Trial Balance', subtitle: `Saldo akun per ${reportPeriodLabel}`, columns: ['Kode / Akun', 'Debit', 'Kredit'], rows: (trialBalance.items || []).map((item: any) => [`${item.code || ''} · ${item.name || '-'}`, money(item.debit), money(item.credit)]), totals: [['Total Debit', money(trialBalance.total_debit)], ['Total Kredit', money(trialBalance.total_credit)], ['Selisih', money(trialBalance.difference)]] };
      }
      if (activeReportType.value === 'bukubesar') {
        return { title: 'Buku Besar', subtitle: `Periode ${reportPeriodLabel}`, columns: ['Tanggal / Referensi', 'Akun & Uraian', 'Mutasi'], rows: (ledger.items || []).map((item: any) => [`${item.transaction_date || '-'} · ${item.voucher_number || '-'}`, `${item.account_code || item.code || '-'} · ${item.account_name || item.name || item.description || '-'}`, `D ${money(item.debit)} / K ${money(item.credit)}`]), totals: [['Jumlah baris', String((ledger.items || []).length)], ['Periode', reportPeriodLabel]] };
      }
      if (activeReportType.value === 'umurtagih') {
        return { title: 'Laporan Umur Piutang', subtitle: `Piutang outstanding per ${reportPeriodLabel}`, columns: ['Invoice / Klien', 'Kelompok Umur', 'Outstanding'], rows: (receivableAging.items || []).map((item: any) => [`${item.invoice_number || '-'} · ${item.client_name || '-'}`, item.aging_bucket || 'Belum dikelompokkan', money(item.outstanding_amount)]), totals: [['Total Piutang Outstanding', money(receivableAging.total_outstanding)]] };
      }
      if (activeReportType.value === 'umurutang') {
        return { title: 'Laporan Umur Utang', subtitle: `Utang outstanding per ${reportPeriodLabel}`, columns: ['Tagihan / Vendor', 'Kelompok Umur', 'Outstanding'], rows: (payableAging.items || []).map((item: any) => [`${item.bill_number || '-'} · ${item.vendor_name || '-'}`, item.aging_bucket || 'Belum dikelompokkan', money(item.outstanding_amount)]), totals: [['Total Utang Outstanding', money(payableAging.total_outstanding)]] };
      }
      if (activeReportType.value === 'pajak') {
        return { title: 'Laporan Pajak Internal', subtitle: `Pencatatan pajak periode ${reportPeriodLabel}; bukan bukti pelaporan DJP/e-Faktur.`, columns: ['Jenis Pajak', 'Periode / Status', 'Nilai'], rows: (taxReport.items || []).map((item: any) => [item.tax_type || item.name || '-', `${item.period || item.tax_period || '-'} · ${item.status || '-'}`, money(item.amount)]), totals: [['Total Kewajiban Pajak Tercatat', money(taxReport.total)]] };
      }
      if (activeReportType.value === 'payroll') {
        const summary = payrollReport.summary || {};
        return { title: 'Laporan Biaya Payroll', subtitle: `Payroll periode ${reportPeriodLabel}`, columns: ['Pegawai', 'Periode / Status', 'Gaji Bersih'], rows: (payrollReport.items || []).map((item: any) => [item.employee_name || item.full_name || '-', `${item.payroll_period || item.period || '-'} · ${item.status || '-'}`, money(item.net_salary || item.net_pay || item.total_net_salary)]), totals: [['Total Gaji Bersih', money(summary.total_net_salary || summary.net_salary)], ['Jumlah Payroll', String(summary.total_records || (payrollReport.items || []).length)]] };
      }
      if (activeReportType.value === 'aset') {
        return { title: 'Laporan Aset & Penyusutan', subtitle: `Aset aktif dan penyusutan periode ${reportPeriodLabel}`, columns: ['Kode / Aset', 'Penyusutan Periode', 'Nilai Buku'], rows: (assetReport.items || []).map((item: any) => [`${item.asset_code || '-'} · ${item.asset_name || item.name || '-'}`, money(item.period_depreciation), money(item.book_value)]), totals: [['Total Nilai Buku', money(assetReport.total_book_value)], ['Total Penyusutan Periode', money(assetReport.total_period_depreciation)]] };
      }
      return { title: 'Laporan Profitabilitas Proyek', subtitle: `${reportPeriodLabel}. ${projectProfitability.note || 'Biaya aktual mengikuti alokasi tagihan vendor.'}`, columns: ['Proyek', 'Pendapatan / Biaya', 'Laba'], rows: (projectProfitability.items || []).map((item: any) => [item.project_name || item.name || '-', `Pendapatan ${money(item.billed_amount)} · Biaya ${money(item.actual_cost)}`, money(item.profit)]), totals: [['Total Laba Proyek', money(projectProfitability.total_profit)]] };
    };
    const currentReport = computed(() => reportRows());
    const pagedReportRows = computed(() => pageRows(currentReport.value.rows, reportPage.value));
    const downloadTextFile = (filename: string, content: string, type = 'text/plain;charset=utf-8;') => {
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
    const exportCurrentReportExcel = () => {
      const report = currentReport.value;
      const tableRows = [report.columns, ...report.rows, ...report.totals.map((total: any) => [total[0], '', total[1] || ''])];
      const worksheet = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><tr><th colspan="3">PT Kedata Indonesia Digital</th></tr><tr><th colspan="3">${escapeHtml(report.title)}</th></tr><tr><td colspan="3">${escapeHtml(report.subtitle)}</td></tr><tr><td colspan="3"></td></tr>${tableRows.map((row: any, index: number) => `<tr>${row.map((cell: any) => index === 0 ? `<th>${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
      downloadTextFile(`finstart-${activeReportType.value}-${new Date().toISOString().slice(0, 10)}.xls`, `\ufeff${worksheet}`, 'application/vnd.ms-excel;charset=utf-8;');
      showToast('File Excel laporan berhasil dibuat.');
    };
    const printCurrentReport = () => {
      const report = currentReport.value;
      const popup = window.open('', '_blank', 'width=960,height=720');

      if (!popup) {
        showToast('Popup print diblokir browser. Izinkan popup untuk mencetak laporan.');
        return;
      }

      popup.document.write(`<!doctype html>
        <html>
          <head>
            <title>${escapeHtml(report.title)} - FinStart</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #102A56; }
              h1, h2, p { margin: 0; }
              .header { border-bottom: 2px solid #0B1F4A; padding-bottom: 14px; text-align: center; }
              .meta { margin-top: 6px; color: #64748B; font-size: 12px; }
              table { border-collapse: collapse; margin-top: 24px; width: 100%; font-size: 12px; }
              th, td { border-bottom: 1px solid #E2E8F0; padding: 10px; text-align: left; }
              th { background: #F8FBFE; color: #53658A; text-transform: uppercase; font-size: 10px; }
              td:last-child, th:last-child { text-align: right; }
              .totals { margin-top: 18px; border-top: 1px solid #CBD5E1; padding-top: 12px; }
              .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-weight: 700; }
              @media print { body { margin: 18mm; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PT KEDATA INDONESIA DIGITAL</h1>
              <p class="meta">${escapeHtml(report.title)} - ${escapeHtml(report.subtitle)}</p>
              <p class="meta">Dicetak ${escapeHtml(new Date().toLocaleDateString('id-ID'))}</p>
            </div>
            <table>
              <thead><tr>${report.columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
              <tbody>${report.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
            <div class="totals">${report.totals.map(total => `<div class="total-row"><span>${escapeHtml(total[0])}</span><span>${escapeHtml(total[1])}</span></div>`).join('')}</div>
          </body>
        </html>`);
      popup.document.close();
      popup.focus();
      popup.print();
      showToast('Dialog cetak laporan dibuka.');
    };
    return () => <div class="space-y-7 font-sans">
      <header class="flex flex-col gap-4 border-b border-[#DCE7F4] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-start gap-4">
          <span class="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D7E5F5] bg-white text-[#0B1F4A] shadow-[0_8px_20px_rgba(11,31,74,0.05)]">
            {isForecast ? <TrendingUp class="h-5 w-5" /> : <FileSpreadsheet class="h-5 w-5" />}
          </span>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]">Financial Planning & Reporting</p>
            <h1 class="mt-1 text-[26px] font-semibold tracking-tight text-[#0B1F4A]">
              {isForecast ? 'Proyeksi Bisnis Tahunan' : 'Laporan Keuangan'}
            </h1>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-[#6B7A90]">
              {isForecast ? 'Pantau target bisnis, realisasi performa, dan roadmap pertumbuhan finansial secara terstruktur.' : 'Tinjau laporan keuangan utama dalam format tabel yang siap digunakan untuk evaluasi manajemen.'}
            </p>
          </div>
        </div>
        <div class="flex w-full flex-wrap gap-3 lg:w-auto">
          {isForecast ? <button id="btn-open-target-modal" onClick={() => openTargetModal()} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56]">
              <Plus class="h-4 w-4" /> Tambah Target
            </button> : <>
              <button onClick={exportCurrentReportExcel} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-semibold text-[#0B1F4A] transition hover:bg-[#F8FBFE]">
                <FileSpreadsheet class="h-4 w-4" /> Unduh Excel
              </button>
              <button id="btn-print-reports" onClick={() => setIsPrintModalOpen(true)} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56]">
                <Printer class="h-4 w-4" /> Cetak / Simpan PDF
              </button>
            </>}
        </div>
      </header>

      {!isForecast && <section class="space-y-4">
        <div class="flex flex-col gap-3 rounded-2xl border border-[#DCE7F4] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(11,31,74,0.04)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E5AA8]">Sumber Data API</p>
            <p class="mt-1 text-sm text-[#53658A]">Pilih periode dari jurnal yang sudah berstatus <strong>posted</strong>. Laporan tidak lagi memakai angka Rp0 saat API gagal.</p>
          </div>
          <label class="flex w-full flex-col gap-1 sm:w-[220px]">
            <span class="text-[10px] font-bold uppercase tracking-[0.13em] text-[#70819B]">Periode laporan</span>
            <select value={reportPeriod} onChange={(event) => selectReportPeriod(event.target.value)} class="h-10 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]">
              {reportPeriods.length === 0 && <option value={reportPeriod || ''}>{reportPeriod || 'Tidak ada periode posted'}</option>}
              {reportPeriods.map((item: any) => <option key={item.period} value={item.period}>{item.label || item.period}</option>)}
            </select>
          </label>
        </div>

        {reportError && <div class="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle class="mt-0.5 h-5 w-5 shrink-0" />
          <div><p class="font-semibold">Laporan belum dapat dimuat dari API.</p><p class="mt-1 text-xs leading-5">{reportError}</p></div>
        </div>}
      </section>}

      {isForecast ? <section class="space-y-5">
          <div class="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
              <div class="flex flex-col gap-2 border-b border-[#E8EEF7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Scenario Planning</p><h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Skenario Optimistis, Normal, dan Pesimistis</h2><p class="mt-1 text-sm text-[#6B7A90]">Pilih skenario untuk melihat target tersesuaikan tanpa mengubah realisasi jurnal.</p></div>
                <span class="inline-flex w-fit rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-2 text-xs font-semibold text-[#0B1F4A]">Aktif: {currentScenario.label || 'Normal'}</span>
              </div>
              <div class="grid gap-3 p-5 md:grid-cols-3">
                {projectionScenarios.map((scenario: any) => <button key={scenario.scenario_key} type="button" onClick={() => selectScenario(scenario)} class={`rounded-2xl border p-4 text-left transition ${String(currentScenario.scenario_key) === String(scenario.scenario_key) ? 'border-[#1E5AA8] bg-[#EEF5FC] shadow-sm' : 'border-[#E2EAF4] bg-white hover:border-[#BFD6F1] hover:bg-[#FBFDFF]'}`}>
                    <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5AA8]">{scenario.label || scenario.scenario_key}</p>
                    <p class="mt-3 text-sm font-semibold text-[#182338]">Pendapatan × {Number(scenario.revenue_factor || 1).toFixed(2)}</p>
                    <p class="mt-1 text-sm font-semibold text-[#53658A]">Beban × {Number(scenario.expense_factor || 1).toFixed(2)}</p>
                    <p class="mt-3 text-[11px] leading-4 text-[#6B7A90]">{scenario.notes || 'Parameter target tahunan.'}</p>
                  </button>)}
              </div>
              <div class="border-t border-[#E8EEF7] bg-[#FBFDFF] px-5 py-4">
                <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px_auto]">
                  <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Catatan skenario aktif</span><input value={scenarioForm.value.notes} onChange={event => setScenarioForm({ ...scenarioForm.value, notes: event.target.value })} placeholder="Catatan asumsi" class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs text-[#182338]" /></label>
                  <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Faktor pendapatan</span><input type="number" min="0.01" step="0.01" value={scenarioForm.value.revenue_factor} onChange={event => setScenarioForm({ ...scenarioForm.value, revenue_factor: Number(event.target.value) })} class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]" /></label>
                  <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Faktor beban</span><input type="number" min="0.01" step="0.01" value={scenarioForm.value.expense_factor} onChange={event => setScenarioForm({ ...scenarioForm.value, expense_factor: Number(event.target.value) })} class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]" /></label>
                  <button type="button" onClick={saveScenario} class="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#102A56]">Simpan Parameter</button>
                </div>
              </div>
            </div>
            <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div class="rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#70819B]">Kas & Bank</p><p class="mt-2 text-lg font-extrabold text-[#0B1F4A]">{formatRupiah(Number(projectionSummary.cash_balance || 0))}</p><p class="mt-1 text-[11px] text-[#6B7A90]">Saldo akun kas/bank aktif.</p></div>
              <div class="rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#70819B]">Burn Rate Bulanan</p><p class="mt-2 text-lg font-extrabold text-[#B45309]">{formatRupiah(Number(projectionSummary.monthly_burn_rate || 0))}</p><p class="mt-1 text-[11px] text-[#6B7A90]">Rata-rata beban posted atau forecast.</p></div>
              <div class="rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#70819B]">Runway</p><p class="mt-2 text-lg font-extrabold text-[#047857]">{projectionSummary.runway_months === null || projectionSummary.runway_months === undefined ? 'Belum dapat dihitung' : `${Number(projectionSummary.runway_months).toLocaleString('id-ID', { maximumFractionDigits: 1 })} bulan`}</p><p class="mt-1 text-[11px] text-[#6B7A90]">Kas dibagi burn rate bulanan.</p></div>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">FY2026 Business Target</p>
                <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">KPI Performance Targets</h2>
                <p class="mt-1 text-sm text-[#6B7A90]">Realisasi kumulatif dibanding target tahunan perusahaan.</p>
              </div>
              <div class="inline-flex w-fit items-center gap-3 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-2.5">
                <Target class="h-4 w-4 text-[#1E5AA8]" />
                <span class="text-xs text-[#6B7A90]">Rata-rata capaian</span>
                <span class="text-sm font-semibold text-[#0B1F4A]">{achievementAverage.value}%</span>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[820px] text-left text-sm">
                <thead class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">
                  <tr>
                    <th class="px-6 py-4">Target Bisnis</th>
                    <th class="px-6 py-4 text-right">Target Tahunan</th>
                    <th class="px-6 py-4 text-right">Realisasi</th>
                    <th class="px-6 py-4">Progress</th>
                    <th class="px-6 py-4 text-right">Status</th>
                    <th class="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#EDF2F7]">
                  {pagedTargets.value.map(target => {
                  const percent = Math.min(100, Math.round(target.nilaiRealisasi / Math.max(target.nilaiTarget, 1) * 100));
                  return <tr key={target.id} class="hover:bg-[#FBFDFF]">
                        <td class="px-6 py-5">
                          <p class="font-semibold text-[#182338]">{target.nama}</p>
                          <p class="mt-1 text-xs text-[#8A98AB]">ID Target: {target.id}</p>
                        </td>
                        <td class="px-6 py-5 text-right font-medium text-[#0B1F4A]">{currencyOrUnit(target.nilaiTarget, target.satuan)}</td>
                        <td class="px-6 py-5 text-right font-semibold text-[#1E5AA8]">{currencyOrUnit(target.nilaiRealisasi, target.satuan)}</td>
                        <td class="px-6 py-5">
                          <div class="flex min-w-[160px] items-center gap-3">
                            <div class="h-2 flex-1 overflow-hidden rounded-full bg-[#E8EEF7]">
                              <div class="h-full rounded-full bg-[#1E5AA8]" style={{
                            width: `${percent}%`
                          }} />
                            </div>
                            <span class="w-10 text-right text-xs font-semibold text-[#0B1F4A]">{percent}%</span>
                          </div>
                        </td>
                        <td class="px-6 py-5 text-right">
                          <span class="inline-flex rounded-full border border-[#CFE0F4] bg-[#EEF5FC] px-3 py-1 text-[10px] font-semibold text-[#0B1F4A]">On track</span>
                        </td>
                        <td class="px-6 py-5 text-center">
                          <button type="button" onClick={() => openTargetModal(target)} class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8E5F4] bg-white text-[#1E5AA8] transition hover:bg-[#EEF5FC]" title="Edit target"><Pencil class="h-4 w-4" /></button>
                        </td>
                      </tr>;
                })}
                </tbody>
              </table>
            </div>
            <TablePagination page={targetPage.value} total={orderedTargets.value.length} onPageChange={(page: number) => targetPage.value = safePage(page, orderedTargets.value.length)} />
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Financial Growth Roadmap</p>
                <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Roadmap Pertumbuhan Finansial</h2>
                <p class="mt-1 text-sm text-[#6B7A90]">Grafik target dan realisasi bulanan yang diambil dari data proyeksi API.</p>
              </div>
              <div class="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-3.5 py-2 text-xs font-semibold text-[#0B1F4A]">
                <BarChart3 class="h-4 w-4 text-[#1E5AA8]" /> Tahun {projectionData?.year || new Date().getFullYear()} · {formatRupiah(Number(projectionSummary.forecast_revenue || projectionSummary.revenue_target || 0))}
              </div>
            </div>

            <div class="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
              <div class="finance-chart-shell rounded-2xl border border-[#E2EBF6] p-4">
                <div class="overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${roadmapChartWidth} ${roadmapChartHeight}`}
                    class="modern-finance-chart h-auto w-full min-w-[760px]"
                    role="img"
                    aria-label="Grafik roadmap pendapatan dan beban bulanan"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="roadmap-income-stroke" x1={roadmapChartPadding.left} x2={roadmapChartWidth - roadmapChartPadding.right} y1="0" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="55%" stopColor="#0EA5E9" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                      <linearGradient id="roadmap-expense-stroke" x1={roadmapChartPadding.left} x2={roadmapChartWidth - roadmapChartPadding.right} y1="0" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#F43F5E" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                      <linearGradient id="roadmap-target-stroke" x1={roadmapChartPadding.left} x2={roadmapChartWidth - roadmapChartPadding.right} y1="0" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#64748B" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <filter id="roadmap-line-glow" x="-10%" y="-30%" width="120%" height="160%">
                        <feGaussianBlur stdDeviation="2.8" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {[32, 74, 116, 158].map(y => <line key={y} x1="0" y1={y} x2={roadmapChartWidth} y2={y} class="modern-chart-grid" />)}

                    <line
                      x1={roadmapChartPadding.left}
                      x2={roadmapChartWidth - roadmapChartPadding.right}
                      y1={roadmapChartHeight - roadmapChartPadding.bottom}
                      y2={roadmapChartHeight - roadmapChartPadding.bottom}
                      class="modern-chart-axis"
                    />

                    <line
                      x1={roadmapChartPadding.left}
                      x2={roadmapChartPadding.left}
                      y1={roadmapChartPadding.top}
                      y2={roadmapChartHeight - roadmapChartPadding.bottom}
                      class="modern-chart-axis"
                    />

                    {roadmapChartRows.length > 0 && <path d={roadmapLinePoints('revenueTargetY')} fill="none" stroke="url(#roadmap-target-stroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" class="modern-chart-target-line" />}
                    {roadmapChartRows.length > 0 && <path d={roadmapLinePoints('expenseTargetY')} fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" class="modern-chart-target-line modern-chart-target-line-muted" />}
                    {roadmapChartRows.length > 0 && <path d={roadmapLinePoints('expenseForecastY')} fill="none" stroke="url(#roadmap-expense-stroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" class="modern-chart-line modern-chart-line-secondary" filter="url(#roadmap-line-glow)" />}
                    {roadmapChartRows.length > 0 && <path d={roadmapLinePoints('revenueForecastY')} fill="none" stroke="url(#roadmap-income-stroke)" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" class="modern-chart-line modern-chart-line-primary" filter="url(#roadmap-line-glow)" />}

                    {roadmapChartRows.map((item, index) => <Fragment key={item.label}>
                      <circle cx={item.x} cy={item.revenueForecastY} r="5.2" fill="white" stroke="url(#roadmap-income-stroke)" strokeWidth="3" class="modern-chart-dot" style={{ animationDelay: `${0.48 + index * 0.07}s` }} />
                      <circle cx={item.x} cy={item.expenseForecastY} r="4.7" fill="white" stroke="url(#roadmap-expense-stroke)" strokeWidth="2.8" class="modern-chart-dot" style={{ animationDelay: `${0.58 + index * 0.07}s` }} />
                      <text x={item.x} y={roadmapChartHeight - 18} textAnchor="middle" fill="#8291A8" fontSize="9" fontWeight="500">
                        {item.label}
                      </text>
                    </Fragment>)}
                  </svg>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#6B7A90]">
                  <span class="inline-flex items-center gap-2"><i class="finance-chart-swatch finance-chart-swatch-primary" /> Realisasi pendapatan</span>
                  <span class="inline-flex items-center gap-2"><i class="finance-chart-swatch finance-chart-swatch-target" /> Target pendapatan</span>
                  <span class="inline-flex items-center gap-2"><i class="finance-chart-swatch finance-chart-swatch-secondary" /> Realisasi beban</span>
                  <span class="inline-flex items-center gap-2"><i class="finance-chart-swatch finance-chart-swatch-muted" /> Target beban</span>
                </div>
              </div>

              <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-[#FBFDFF]">
                <div class="border-b border-[#E8EEF7] px-5 py-4">
                  <h3 class="text-sm font-semibold text-[#0B1F4A]">Milestone Tahunan</h3>
                  <p class="mt-1 text-xs text-[#6B7A90]">Ringkasan target roadmap</p>
                </div>
                <div class="divide-y divide-[#E8EEF7]">
                  {roadmapRows.map(item => <div key={item.label} class="flex items-center justify-between px-5 py-4">
                      <span class="text-sm font-medium text-[#182338]">{item.label}</span>
                      <span class="text-sm font-semibold text-[#0B1F4A]">Rp {item.value}B</span>
                    </div>)}
                </div>
              </div>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Budget Control</p><h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Budget per Akun dan Divisi</h2><p class="mt-1 text-sm text-[#6B7A90]">Bandingkan budget dengan realisasi dari jurnal posted pada akun dan divisi yang sama.</p></div>
              <div class="grid w-full grid-cols-3 gap-3 text-right lg:w-auto lg:min-w-[420px]"><div class="rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3"><p class="text-[10px] font-bold uppercase text-[#70819B]">Budget</p><p class="mt-1 text-sm font-extrabold text-[#0B1F4A]">{formatRupiah(Number(budgetSummary.total_budget || 0))}</p></div><div class="rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3"><p class="text-[10px] font-bold uppercase text-[#70819B]">Realisasi</p><p class="mt-1 text-sm font-extrabold text-[#0B1F4A]">{formatRupiah(Number(budgetSummary.total_actual || 0))}</p></div><div class="rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3"><p class="text-[10px] font-bold uppercase text-[#70819B]">Selisih</p><p class={`mt-1 text-sm font-extrabold ${Number(budgetSummary.total_variance || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{formatRupiah(Number(budgetSummary.total_variance || 0))}</p></div></div>
            </div>
            <form onSubmit={saveBudget} class="grid gap-4 border-b border-[#E8EEF7] bg-[#FBFDFF] p-5 md:grid-cols-2 lg:grid-cols-3">
              <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Akun</span><select required value={budgetForm.value.account_id} onChange={event => setBudgetForm({ ...budgetForm.value, account_id: event.target.value })} class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"><option value="">Pilih akun</option>{akun.filter((account: any) => ['Pendapatan', 'Beban'].includes(account.tipe)).map((account: any) => <option key={account.id} value={account.id}>{account.kode} · {account.nama}</option>)}</select></label>
              <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Divisi</span><select value={budgetForm.value.division_id} onChange={event => setBudgetForm({ ...budgetForm.value, division_id: event.target.value })} class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"><option value="">Semua / operasional umum</option>{divisions.filter((division: any) => String(division.status || 'active') === 'active').map((division: any) => <option key={division.id} value={division.id}>{division.code ? `${division.code} · ` : ''}{division.name}</option>)}</select></label>
              <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Bulan</span><select value={budgetForm.value.budget_month} onChange={event => setBudgetForm({ ...budgetForm.value, budget_month: event.target.value })} class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"><option value="">Tahunan</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{String(index + 1).padStart(2, '0')}</option>)}</select></label>
              <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Nilai budget</span><input required type="number" min="0" value={budgetForm.value.budget_amount || ''} onChange={event => setBudgetForm({ ...budgetForm.value, budget_amount: Number(event.target.value) })} class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]" /></label>
              <label class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">Catatan budget</span><input value={budgetForm.value.notes} onChange={event => setBudgetForm({ ...budgetForm.value, notes: event.target.value })} placeholder="Contoh: Anggaran biaya cloud divisi engineering" class="h-11 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs text-[#182338]" /></label>
              <div class="flex items-end gap-2"><button type="submit" class="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#0B1F4A] px-3 text-sm font-semibold text-white hover:bg-[#102A56]">{budgetForm.value.id ? 'Perbarui' : 'Simpan'}</button>{budgetForm.value.id && <button type="button" onClick={resetBudgetForm} class="inline-flex h-11 items-center justify-center rounded-xl border border-[#D8E5F4] px-5 text-sm font-semibold text-[#53658A]">Batal</button>}</div>
            </form>
            <div class="overflow-x-auto"><table class="w-full min-w-[900px] text-left text-sm"><thead class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"><tr><th class="px-5 py-3">Akun / Divisi</th><th class="px-5 py-3">Periode</th><th class="px-5 py-3 text-right">Budget</th><th class="px-5 py-3 text-right">Realisasi</th><th class="px-5 py-3 text-right">Selisih</th><th class="px-5 py-3">Catatan</th><th class="px-5 py-3 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-[#EDF2F7]">{orderedBudgetAllocations.value.length === 0 ? <tr><td colSpan={7} class="px-5 py-7 text-center text-sm text-[#8A98AB]">Belum ada budget untuk skenario {currentScenario.label || 'Normal'}.</td></tr> : pagedBudgetAllocations.value.map((budget: any) => <tr key={budget.id} class="hover:bg-[#FBFDFF]"><td class="px-5 py-3"><p class="font-semibold text-[#182338]">{budget.account_code} · {budget.account_name}</p><p class="mt-1 text-[10px] text-[#6B7A90]">{budget.division_name || 'Operasional umum'}</p></td><td class="px-5 py-3 text-xs text-[#53658A]">{budget.budget_month ? `Bulan ${String(budget.budget_month).padStart(2, '0')}` : 'Tahunan'}</td><td class="px-5 py-3 text-right font-semibold text-[#0B1F4A]">{formatRupiah(Number(budget.budget_amount || 0))}</td><td class="px-5 py-3 text-right font-semibold text-[#1E5AA8]">{formatRupiah(Number(budget.actual_amount || 0))}</td><td class={`px-5 py-3 text-right font-semibold ${Number(budget.variance_amount || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{formatRupiah(Number(budget.variance_amount || 0))}</td><td class="px-5 py-3 text-xs text-[#6B7A90]">{budget.notes || '-'}</td><td class="px-5 py-3 text-right"><div class="flex justify-end gap-1"><button type="button" aria-label={`Ubah budget ${budget.account_name || ''}`} title="Ubah" onClick={() => editBudget(budget)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"><Pencil class="h-3.5 w-3.5" /></button><button type="button" aria-label={`Hapus budget ${budget.account_name || ''}`} title="Hapus" onClick={() => deleteBudget(budget)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"><Trash2 class="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div>
            <TablePagination page={budgetPage.value} total={orderedBudgetAllocations.value.length} onPageChange={(page: number) => budgetPage.value = safePage(page, orderedBudgetAllocations.value.length)} />
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-2 border-b border-[#E8EEF7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-[#0B1F4A]">Catatan & Target Akun</h2>
                <p class="mt-1 text-sm text-[#6B7A90]">Daftar target yang terhubung dengan akun buku besar dan rencana periode mendatang.</p>
              </div>
              <span class="text-xs font-medium text-[#6B7A90]">{proyek.length} proyek terhubung · {transaksi.length} jurnal tersedia</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">
                  <tr><th class="px-6 py-4">Akun / Target</th><th class="px-6 py-4">Bulan Proyeksi</th><th class="px-6 py-4 text-right">Nilai Target</th><th class="px-6 py-4">Catatan Finansial</th><th class="px-6 py-4 text-center">Aksi</th></tr>
                </thead>
                <tbody class="divide-y divide-[#EDF2F7]">
                  {pagedTargetDetails.value.map((target, index) => <tr key={`${target.id}-detail`} class="hover:bg-[#FBFDFF]">
                      <td class="px-6 py-4"><p class="font-medium text-[#182338]">{target.nama}</p><p class="mt-1 text-xs text-[#8A98AB]">{target.id}</p></td>
                      <td class="px-6 py-4 text-[#53658A]">{currentMonthIso()}</td>
                      <td class="px-6 py-4 text-right font-semibold text-[#0B1F4A]">{currencyOrUnit(target.nilaiTarget, target.satuan)}</td>
                      <td class="px-6 py-4 text-[#6B7A90]">Dipantau bersama realisasi dan arus kas operasional.</td>
                      <td class="px-6 py-4 text-center"><button type="button" onClick={() => openTargetModal(target)} class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8E5F4] bg-white text-[#1E5AA8] transition hover:bg-[#EEF5FC]" title="Edit target"><Pencil class="h-4 w-4" /></button></td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <TablePagination page={targetDetailPage.value} total={orderedTargets.value.length} onPageChange={(page: number) => targetDetailPage.value = safePage(page, orderedTargets.value.length)} />
          </div>
        </section> : <section class="space-y-5">
          <div class="rounded-2xl border border-[#DCE7F4] bg-white p-2 shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-2 sm:flex-row">
              {reportTabs.map(tab => <button key={tab.id} id={`report-type-${tab.id}`} onClick={() => setActiveReportType(tab.id)} class={`flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition ${activeReportType.value === tab.id ? 'bg-[#0B1F4A] text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)]' : 'text-[#53658A] hover:bg-[#F4F8FC] hover:text-[#0B1F4A]'}`}>
                  {tab.label}
                </button>)}
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="border-b border-[#E8EEF7] px-6 py-6 text-center">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]">Financial Statement</p>
              <h2 class="mt-2 text-xl font-semibold text-[#0B1F4A]">{currentReport.value.title}</h2>
              <p class="mt-1 text-sm text-[#6B7A90]">{currentReport.value.subtitle}</p>
              <p class="mt-2 text-xs text-[#8A98AB]">PT Kedata Indonesia Digital · Mata Uang Rupiah (Rp)</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">
                  <tr>{currentReport.value.columns.map((column, index) => <th key={column} class={`px-6 py-4 ${index === 2 ? 'text-right' : ''}`}>{column}</th>)}</tr>
                </thead>
                <tbody class="divide-y divide-[#EDF2F7]">
                  {!reportError && currentReport.value.rows.length === 0 && <tr><td colSpan={3} class="px-6 py-9 text-center text-sm text-[#7A8CA8]">{hasReportData() ? `Belum ada data untuk ${reportPeriodLabel}.` : 'Menunggu data laporan dari API.'}</td></tr>}
                  {pagedReportRows.value.map(row => <tr key={row.join('-')} class="hover:bg-[#FBFDFF]">
                      <td class="px-6 py-4 font-medium text-[#182338]">{row[0]}</td>
                      <td class="px-6 py-4 text-[#6B7A90]">{row[1]}</td>
                      <td class={`px-6 py-4 text-right font-semibold ${row[2].startsWith('(') ? 'text-[#B74B62]' : 'text-[#0B1F4A]'}`}>{row[2]}</td>
                    </tr>)}
                </tbody>
                <tfoot class="border-t border-[#DCE7F4] bg-[#EEF5FC]">
                  {currentReport.value.totals.map((total, index) => <tr key={total[0]} class={index === currentReport.value.totals.length - 1 ? 'bg-[#E4F0FF]' : ''}>
                      <td colSpan={2} class="px-6 py-4 text-sm font-semibold text-[#0B1F4A]">{total[0]}</td>
                      <td class={`px-6 py-4 text-right text-sm font-semibold ${total[1].startsWith('(') ? 'text-[#B74B62]' : 'text-[#0B1F4A]'}`}>{total[1]}</td>
                    </tr>)}
                </tfoot>
              </table>
            </div>
            <TablePagination page={reportPage.value} total={currentReport.value.rows.length} onPageChange={(page: number) => reportPage.value = safePage(page, currentReport.value.rows.length)} />
          </div>
        </section>}

      {isTargetModalOpen.value && <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm">
          <div class="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] border border-[#DCE7F4] bg-white shadow-[0_24px_70px_rgba(11,31,74,0.22)]">
            <div class="flex items-start justify-between border-b border-[#E8EEF7] px-7 py-6">
              <div class="flex items-start gap-3">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#0B1F4A]"><Target class="h-5 w-5" /></span>
                <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Business Planning</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">{editingTargetId.value ? 'Edit Target Proyeksi' : 'Tambah Target Proyeksi'}</h3><p class="mt-1 text-sm text-[#6B7A90]">Tetapkan target yang dapat dipantau bersama realisasi.</p></div>
              </div>
              <button onClick={closeTargetModal} class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2EAF4] text-[#8A98AB] hover:bg-[#F8FBFE]"><X class="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveTarget} class="flex-1 overflow-y-auto px-7 py-6">
              <div class="grid gap-5 md:grid-cols-2">
                <label class="space-y-2 md:col-span-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Akun Buku Besar</span><select required value={newTarget.value.akunId} onChange={event => setNewTarget({
                  ...newTarget.value,
                  akunId: event.target.value
                })} class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"><option value="">Pilih akun buku besar</option>{akun.map(item => <option key={item.id} value={item.id}>{item.kode} · {item.nama}</option>)}</select></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Target Nilai</span><input type="number" min="0" required value={newTarget.value.nilaiTarget || ''} onChange={event => setNewTarget({
                  ...newTarget.value,
                  nilaiTarget: Number(event.target.value)
                })} placeholder="0" class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]" /></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Satuan</span><select value={newTarget.value.satuan} onChange={event => setNewTarget({
                  ...newTarget.value,
                  satuan: event.target.value as AnnualTarget['satuan']
                })} class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"><option value="Rupiah">Rupiah</option><option value="Persen">Persen</option><option value="Klien">Klien</option></select></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Realisasi Saat Ini</span><input type="number" min="0" value={newTarget.value.nilaiRealisasi || ''} onChange={event => setNewTarget({
                  ...newTarget.value,
                  nilaiRealisasi: Number(event.target.value)
                })} placeholder="0" class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]" /></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Bulan Proyeksi</span><input type="month" value={newTarget.value.bulanProyeksi} onChange={event => setNewTarget({
                  ...newTarget.value,
                  bulanProyeksi: event.target.value
                })} class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]" /></label>
              </div>
              <div class="mt-7 flex flex-col-reverse gap-3 border-t border-[#E8EEF7] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={closeTargetModal} class="h-11 rounded-xl border border-[#D8E5F4] bg-white px-5 text-sm font-medium text-[#53658A]">Batal</button><button type="submit" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]"><CheckCircle2 class="h-4 w-4" /> {editingTargetId.value ? 'Simpan Perubahan Target' : 'Simpan Target'}</button></div>
            </form>
          </div>
        </div>}

      {isPrintModalOpen.value && <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm">
          <div class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(11,31,74,0.22)]">
            <div class="flex items-center justify-between border-b border-[#E8EEF7] px-7 py-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Print Preview</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Pratinjau Laporan Keuangan</h3></div><button onClick={() => setIsPrintModalOpen(false)} class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2EAF4] text-[#8A98AB]"><X class="h-5 w-5" /></button></div>
            <div class="flex-1 overflow-y-auto p-8"><div class="border border-slate-200 p-8"><div class="border-b-2 border-[#0B1F4A] pb-4 text-center"><h4 class="text-lg font-semibold text-[#0B1F4A]">PT KEDATA INDONESIA DIGITAL</h4><p class="mt-1 text-xs text-[#6B7A90]">Laporan {currentReport.value.title} · {currentReport.value.subtitle}</p></div><table class="mt-6 w-full text-left text-sm"><thead class="border-b border-slate-300 text-xs uppercase text-slate-500"><tr><th class="py-3">Uraian</th><th class="py-3">Kelompok</th><th class="py-3 text-right">Nilai</th></tr></thead><tbody>{currentReport.value.rows.map(row => <tr key={row.join('-')} class="border-b border-slate-100"><td class="py-3">{row[0]}</td><td class="py-3">{row[1]}</td><td class="py-3 text-right">{row[2]}</td></tr>)}</tbody></table><div class="mt-6 space-y-2 border-t border-slate-300 pt-4">{currentReport.value.totals.map(total => <div key={total[0]} class="flex justify-between font-semibold"><span>{total[0]}</span><span>{total[1]}</span></div>)}</div></div></div>
            <div class="flex justify-end gap-3 border-t border-[#E8EEF7] px-7 py-5"><button onClick={() => setIsPrintModalOpen(false)} class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-sm font-medium text-[#53658A]">Tutup</button><button onClick={printCurrentReport} class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-sm font-semibold text-white"><Printer class="h-4 w-4" /> Simpan PDF</button></div>
          </div>
        </div>}

      <ConfirmDialog
        open={!!deleteBudgetConfirm.value}
        eyebrow="Konfirmasi Penghapusan"
        title="Hapus budget akun/divisi?"
        message="Budget yang dihapus tidak lagi dipakai dalam perbandingan target, realisasi, dan selisih skenario."
        details={[
          { label: 'Akun', value: `${deleteBudgetConfirm.value?.account_code || ''} ${deleteBudgetConfirm.value?.account_name || ''}`.trim() || '-' },
          { label: 'Divisi', value: deleteBudgetConfirm.value?.division_name || 'Operasional umum' },
          { label: 'Budget', value: formatRupiah(Number(deleteBudgetConfirm.value?.budget_amount || 0)) },
        ]}
        impactItems={[
          'Budget hilang dari daftar skenario aktif.',
          'Catatan budget terkait juga ikut dihapus.',
        ]}
        confirmLabel="Hapus Budget"
        onCancel={() => deleteBudgetConfirm.value = null}
        onConfirm={confirmDeleteBudget}
      />
    </div>;
  }
});
</script>

<style scoped>
.finance-chart-shell {
  background:
    radial-gradient(circle at 16% 12%, rgba(14, 165, 233, 0.12), transparent 30%),
    radial-gradient(circle at 88% 18%, rgba(20, 184, 166, 0.1), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.92));
  border-radius: 18px;
}

.modern-finance-chart {
  overflow: visible;
  filter: drop-shadow(0 16px 26px rgba(16, 42, 86, 0.08));
}

.modern-chart-grid {
  stroke: #e5edf7;
  stroke-width: 1;
  stroke-dasharray: 4 6;
}

.modern-chart-axis {
  stroke: #cbd7e6;
  stroke-width: 1.35;
}

.modern-chart-line {
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: finance-chart-draw 1.18s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.modern-chart-line-secondary {
  animation-delay: 0.1s;
}

.modern-chart-target-line {
  opacity: 0;
  stroke-dasharray: 10 9;
  animation: finance-chart-fade-slide 0.7s ease-out 0.24s forwards;
}

.modern-chart-target-line-muted {
  animation-delay: 0.32s;
}

.modern-chart-dot {
  opacity: 0;
  transform: scale(0.35);
  transform-box: fill-box;
  transform-origin: center;
  animation: finance-chart-dot-pop 0.48s cubic-bezier(0.2, 1.35, 0.35, 1) forwards;
  filter: drop-shadow(0 4px 8px rgba(16, 42, 86, 0.16));
}

.finance-chart-swatch {
  display: inline-flex;
  height: 3px;
  width: 22px;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(16, 42, 86, 0.12);
}

.finance-chart-swatch-primary {
  background: linear-gradient(90deg, #2563eb, #0ea5e9 55%, #14b8a6);
}

.finance-chart-swatch-secondary {
  background: linear-gradient(90deg, #f43f5e, #f59e0b);
}

.finance-chart-swatch-target {
  background: linear-gradient(90deg, #64748b, #8b5cf6);
}

.finance-chart-swatch-muted {
  background: linear-gradient(90deg, #cbd5e1, #94a3b8);
}

@keyframes finance-chart-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes finance-chart-fade-slide {
  from {
    opacity: 0;
    transform: translateY(7px);
  }

  to {
    opacity: 0.88;
    transform: translateY(0);
  }
}

@keyframes finance-chart-dot-pop {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
