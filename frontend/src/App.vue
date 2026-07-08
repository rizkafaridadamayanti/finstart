<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { motion, AnimatePresence } from "./compat/motion.js";
import { CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-vue-next";

import SplashScreen from './components/SplashScreen.vue';
import LandingPage from './components/LandingPage.vue';
import Login from './components/Login.vue';
import LoadingScreen from './components/LoadingScreen.vue';
import Sidebar from './components/Sidebar.vue';
import Topbar from './components/Topbar.vue';
import DashboardView from './components/DashboardView.vue';
import CrmView from './components/CrmView.vue';
import BukuBesarDanTransaksi from './components/BukuBesarDanTransaksi.vue';
import PiutangDanUtang from './components/PiutangDanUtang.vue';
import LanggananDanAset from './components/LanggananDanAset.vue';
import SdmDanPajak from './components/SdmDanPajak.vue';
import ProyeksiDanLaporan from './components/ProyeksiDanLaporan.vue';
import PengaturanView from './components/PengaturanView.vue';
import {
  clearAuthSession,
  financeApi,
  getApiErrorMessage,
  getStoredAuthUser,
  hasAuthSession,
} from './services/financeApi.js';
import {
  mapAccount,
  mapAsset,
  mapBill,
  mapClient,
  mapInvoice,
  mapJournalTransaction,
  mapProject,
  mapSubscription,
  mapTax,
} from './services/financeMappers.js';

const ACCOUNT_CODE_ALIASES: Record<string, string[]> = {
  '1001': ['1120', '1110'],
  '1002': ['1110', '1120'],
  '1103': ['1130'],
  '2001': ['2100'],
  '2002': ['2200', '2210', '2211'],
  '4001': ['4100'],
  '4002': ['4100'],
  '5001': ['5100'],
  '5002': ['5100'],
  '5003': ['5100'],
};

const PROJECT_STATUS_TO_API: Record<string, string> = {
  Planning: 'planning',
  Ongoing: 'ongoing',
  Completed: 'completed',
};

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const ACTIVE_TAB_KEY = 'finstart-ui-active-tab';
const VALID_TABS = [
  'dashboard', 'crm', 'bukubesar', 'transaksi', 'piutang', 'utang',
  'langganan', 'aset', 'sdm', 'perpajakan', 'proyeksi', 'laporan', 'pengaturan',
];

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function normalizePeriod(value: string) {
  if (/^\d{4}-\d{2}$/.test(String(value || ''))) return value;
  const text = String(value || '').trim();
  const match = text.match(/^([A-Za-zÀ-ÿ]+)\s+(\d{4})$/);
  if (!match) return currentPeriod();
  const index = MONTHS_ID.findIndex((month) => month.toLowerCase() === match[1].toLowerCase());
  return index >= 0 ? `${match[2]}-${String(index + 1).padStart(2, '0')}` : currentPeriod();
}

function toNumber(value: any) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function formatNotificationTime(value: any) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Baru saja';
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)} jam lalu`;
  return date.toLocaleDateString('id-ID');
}

function mapEmployee(row: any) {
  const employmentLabels: Record<string, string> = {
    permanent: 'Tetap',
    contract: 'Kontrak',
    intern: 'Magang',
    freelance: 'Freelance',
    daily: 'Harian',
  };

  return {
    id: row.employee_code || `EMP-${row.id}`,
    dbId: Number(row.id || 0),
    nama: row.full_name || row.employee_name || row.name || '-',
    jabatan: row.position_name || row.position || '-',
    status: employmentLabels[String(row.employment_type || '').toLowerCase()] || 'Karyawan',
    statusAktif: String(row.employment_status || row.status || 'active').toLowerCase() === 'inactive' ? 'Nonaktif' : 'Aktif',
    compliance: String(row.bpjs_status || '').toLowerCase() === 'active' ? 'Patuh' : 'Tinjauan',
    gajiBersih: toNumber(row.base_salary ?? row.salary),
    _raw: row,
  };
}

function getSavedSessionEmail() {
  return getStoredAuthUser()?.email || '';
}

function getSavedUserEmail() {
  return getStoredAuthUser()?.email || '';
}

function getSavedActiveTab() {
  if (typeof window === 'undefined') return 'dashboard';
  const saved = localStorage.getItem(ACTIVE_TAB_KEY) || 'dashboard';
  return VALID_TABS.includes(saved) ? saved : 'dashboard';
}

function clearSavedSession() {
  if (typeof window === 'undefined') return;
  clearAuthSession();
}

export default defineComponent({
  name: "App",
  setup() {
    const hasSavedSession = hasAuthSession();
    const splashDestination = hasSavedSession ? 'dashboard' : 'landing';
    const screen = ref('splash');
    const setScreen = (next: any) => { screen.value = typeof next === 'function' ? next(screen.value) : next; };
    const activeTab = ref(hasSavedSession ? getSavedActiveTab() : 'dashboard');
    const setActiveTab = (next: any) => {
      const resolved = typeof next === 'function' ? next(activeTab.value) : next;
      activeTab.value = VALID_TABS.includes(resolved) ? resolved : 'dashboard';
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_TAB_KEY, activeTab.value);
      }
    };
    const userEmail = ref(getSavedUserEmail());
    const setUserEmail = (next: any) => { userEmail.value = typeof next === 'function' ? next(userEmail.value) : next; };
    const userRole = ref(String(getStoredAuthUser()?.role_name || 'auditor'));
    const allowedTabs = ref<string[]>(Array.isArray(getStoredAuthUser()?.allowed_tabs) && getStoredAuthUser()?.allowed_tabs?.length
      ? getStoredAuthUser()?.allowed_tabs
      : VALID_TABS);
    const applyAuthenticatedUser = (user: any = {}) => {
      setUserEmail(user?.email || getSavedUserEmail());
      userRole.value = String(user?.role_name || userRole.value || 'auditor');
      const nextAllowedTabs = Array.isArray(user?.allowed_tabs) && user.allowed_tabs.length
        ? user.allowed_tabs.filter((tab: string) => VALID_TABS.includes(tab))
        : VALID_TABS;
      allowedTabs.value = nextAllowedTabs.length ? nextAllowedTabs : ['dashboard'];
      if (!allowedTabs.value.includes(activeTab.value)) {
        setActiveTab(allowedTabs.value.includes('dashboard') ? 'dashboard' : allowedTabs.value[0]);
      }
    };
    const isSidebarCollapsed = ref(true);
    const toggleSidebar = () => { isSidebarCollapsed.value = !isSidebarCollapsed.value; };

    // Semua daftar keuangan di bawah ini berasal dari API backend yang sudah ada.
    const proyek = ref<any[]>([]);
    const klien = ref<any[]>([]);
    const akun = ref<any[]>([]);
    const transaksi = ref<any[]>([]);
    const langganan = ref<any[]>([]);
    const invoices = ref<any[]>([]);
    const bills = ref<any[]>([]);
    const assets = ref<any[]>([]);
    const taxes = ref<any[]>([]);

    // Data SDM berasal dari Master Data Operasional.
    const pegawai = ref<any[]>([]);
    const divisions = ref<any[]>([]);

    const dashboardSummary = ref<any>({
      cash_balance: 0, total_receivable: 0, total_payable: 0,
      total_revenue: 0, total_expense: 0, net_profit: 0,
      active_projects: 0, cashflow_series: [], recent_transactions: [],
    });
    const taxSummary = ref<any>({ total_unpaid: 0, total_paid: 0, total_overdue: 0 });
    const taxCalculation = ref<any>({ revenue: 0, expense: 0, net_profit: 0 });
    const projectionData = ref<any>({ year: new Date().getFullYear(), months: [], summary: {} });
    const projectionScenario = ref('normal');

    // Laporan selalu membaca API. Periode dipilih dari jurnal posted agar data
    // tidak menjadi Rp0 hanya karena tanggal browser tidak cocok dengan data.
    const selectedReportPeriod = ref('');
    const availableReportPeriods = ref<any[]>([]);
    const reportError = ref('');
    const reportData = ref<any>({ income_statement: {}, balance_sheet: {}, cash_flow: {} });
    const dataVersion = ref(0);

    const notifications = ref<any[]>([]);
    const setNotifications = (next: any) => { notifications.value = typeof next === 'function' ? next(notifications.value) : next; };

    const toast = ref({ message: '', visible: false });
    const setToast = (next: any) => { toast.value = typeof next === 'function' ? next(toast.value) : next; };
    const showToast = (message: string) => {
      setToast({ message, visible: true });
      window.setTimeout(() => setToast({ message: '', visible: false }), 4000);
    };

    function replaceList(target: any, values: any[]) {
      target.value.splice(0, target.value.length, ...(Array.isArray(values) ? values : []));
    }

    function pickAccount(code: string, preferredType?: string) {
      const aliases = ACCOUNT_CODE_ALIASES[String(code || '')] || [String(code || '')];
      const direct = aliases
        .map((item) => akun.value.find((account) => String(account.kode) === item))
        .find(Boolean);
      if (direct) return direct;
      if (preferredType) return akun.value.find((account) => account.tipe === preferredType);
      return akun.value[0];
    }

    function accountId(code: string, preferredType?: string) {
      return Number(pickAccount(code, preferredType)?.id || 0);
    }

    async function loadReportData(period: string, options: { silent?: boolean } = {}) {
      const resolvedPeriod = /^\d{4}-\d{2}$/.test(String(period || ''))
        ? String(period)
        : currentPeriod();

      reportError.value = '';
      try {
        const data = await financeApi.get('/reports', { period: resolvedPeriod });
        reportData.value = data || { income_statement: {}, balance_sheet: {}, cash_flow: {} };
        selectedReportPeriod.value = data?.period || resolvedPeriod;
        return true;
      } catch (error) {
        console.error('Gagal memuat laporan', error);
        reportData.value = { income_statement: {}, balance_sheet: {}, cash_flow: {} };
        reportError.value = getApiErrorMessage(error, 'Laporan tidak dapat dimuat dari API.');
        if (!options.silent) showToast(reportError.value);
        return false;
      }
    }

    const handleSelectReportPeriod = async (period: string) => {
      const ok = await loadReportData(period);
      if (ok) {
        dataVersion.value += 1;
        showToast(`Laporan periode ${reportData.value?.period_label || period} berhasil dimuat dari API.`);
      }
    };

    async function loadFinancialData(options: { silent?: boolean } = {}) {
      const period = currentPeriod();
      const year = new Date().getFullYear();

      // Tentukan periode laporan dari jurnal posted, bukan semata tanggal perangkat.
      try {
        const periods = await financeApi.get('/reports/periods');
        availableReportPeriods.value = Array.isArray(periods) ? periods : [];
        const available = availableReportPeriods.value.map((item: any) => String(item.period));
        const preferred = selectedReportPeriod.value && available.includes(selectedReportPeriod.value)
          ? selectedReportPeriod.value
          : (available.includes(period) ? period : (available[0] || period));
        selectedReportPeriod.value = preferred;
      } catch (error) {
        availableReportPeriods.value = [];
        selectedReportPeriod.value = selectedReportPeriod.value || period;
        reportError.value = getApiErrorMessage(error, 'Daftar periode laporan tidak dapat dimuat.');
      }

      const jobs = await Promise.allSettled([
        financeApi.get('/clients'),
        financeApi.get('/projects'),
        financeApi.get('/accounts'),
        financeApi.get('/journal-transactions'),
        financeApi.get('/subscriptions'),
        financeApi.get('/assets'),
        financeApi.get('/invoices'),
        financeApi.get('/bills'),
        financeApi.get('/taxes'),
        financeApi.get('/taxes/summary'),
        financeApi.get('/taxes/calculation', { period }),
        financeApi.get('/projections', { year, scenario: projectionScenario.value }),
        financeApi.get('/reports', { period: selectedReportPeriod.value || period }),
        financeApi.get('/dashboard/summary'),
        financeApi.get('/employees'),
        financeApi.get('/divisions'),
        financeApi.get('/notifications', { limit: 8 }),
      ]);

      const value = (index: number, fallback: any = []) => jobs[index].status === 'fulfilled' ? (jobs[index] as PromiseFulfilledResult<any>).value : fallback;
      replaceList(klien, (value(0) || []).map(mapClient));
      replaceList(proyek, (value(1) || []).map(mapProject));
      replaceList(akun, (value(2) || []).map(mapAccount));
      replaceList(transaksi, (value(3) || []).map(mapJournalTransaction));

      const subscriptionsResponse = value(4, {});
      replaceList(langganan, ((subscriptionsResponse?.subscriptions || subscriptionsResponse || []) as any[])
        .map(mapSubscription));

      const assetsResponse = value(5, {});
      replaceList(assets, ((assetsResponse?.assets || assetsResponse || []) as any[]).map(mapAsset));
      replaceList(invoices, (value(6) || []).map(mapInvoice));
      replaceList(bills, (value(7) || []).map(mapBill));
      replaceList(taxes, (value(8) || []).map(mapTax));
      Object.assign(taxSummary.value, value(9, {}));
      Object.assign(taxCalculation.value, value(10, {}));
      Object.assign(projectionData.value, value(11, {}));
      if (jobs[12].status === 'fulfilled') {
        reportData.value = value(12, {}) || { income_statement: {}, balance_sheet: {}, cash_flow: {} };
        reportError.value = '';
        selectedReportPeriod.value = reportData.value?.period || selectedReportPeriod.value || period;
      } else {
        reportData.value = { income_statement: {}, balance_sheet: {}, cash_flow: {} };
        reportError.value = getApiErrorMessage((jobs[12] as PromiseRejectedResult).reason, 'Laporan tidak dapat dimuat dari API.');
      }
      Object.assign(dashboardSummary.value, value(13, {}));
      replaceList(pegawai, (value(14) || []).map(mapEmployee));
      replaceList(divisions, value(15) || []);
      setNotifications((value(16) || []).map((item: any) => ({
        id: String(item.id),
        text: item.message || item.title || 'Aktivitas sistem baru.',
        type: ['warning', 'success', 'info'].includes(String(item.type || '').toLowerCase()) ? String(item.type).toLowerCase() : 'info',
        time: formatNotificationTime(item.created_at),
        is_read: Boolean(item.is_read),
      })));
      dataVersion.value += 1;

      const failed = jobs.filter((job) => job.status === 'rejected');
      if (failed.length && !options.silent) {
        showToast('Sebagian data belum dapat dimuat. Pastikan backend FinStart aktif di http://localhost:4000.');
      }
      return failed.length === 0;
    }

    function clientPayload(item: any) {
      return {
        company_name: item.namaPerusahaan,
        pic_name: item.pic,
        email: item.email || '',
        phone: item.telepon || '',
        industry: item.bidang || '',
        category: item.bidang || '',
        location: item.lokasi || '',
        address: item.lokasi || '',
        status: item._raw?.status || 'active',
      };
    }

    function projectPayload(item: any) {
      return {
        client_id: Number(item.klienId),
        project_name: item.nama,
        project_code: item._raw?.project_code || `PRJ-${String(Date.now()).slice(-8)}`,
        contract_value: toNumber(item.nilaiKontrak),
        status: PROJECT_STATUS_TO_API[item.status] || 'planning',
        start_date: item.tanggalMulai || null,
        end_date: item.tanggalSelesai || null,
        description: item.catatan || '',
        budget_amount: toNumber(item.anggaran ?? item.budgetAmount),
        milestones: Array.isArray(item.milestones) ? item.milestones : [],
        members: Array.isArray(item.tim)
          ? item.tim.map((member: any) => ({
            employee_id: Number(member.employeeId || member.employee_id || 0) || null,
            name: member.nama || member.name || '',
            role_name: member.jabatan || member.role_name || '',
            allocation_percent: toNumber(member.alokasiPersen ?? member.allocation_percent ?? 100),
            estimated_cost: toNumber(member.estimasiBiaya ?? member.estimated_cost),
          }))
          : [],
      };
    }

    async function withApiFeedback<T>(task: () => Promise<T>, fallback: string): Promise<T | undefined> {
      try {
        return await task();
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, fallback));
        return undefined;
      }
    }

    const handleAddKlien = async (item: any) => withApiFeedback(async () => {
      const created = await financeApi.post('/clients', clientPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Klien berhasil disimpan ke database.');
      return mapClient(created);
    }, 'Gagal menyimpan klien.');

    const handleUpdateKlien = async (item: any) => withApiFeedback(async () => {
      const updated = await financeApi.put(`/clients/${item.id}`, clientPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Data klien berhasil diperbarui.');
      return mapClient(updated);
    }, 'Gagal memperbarui klien.');

    const handleDeleteKlien = async (id: string) => withApiFeedback(async () => {
      await financeApi.delete(`/clients/${id}`);
      await loadFinancialData({ silent: true });
      showToast('Klien berhasil dihapus dari database.');
    }, 'Gagal menghapus klien.');

    const handleAddProyek = async (item: any) => withApiFeedback(async () => {
      const created = await financeApi.post('/projects', projectPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Proyek berhasil disimpan ke database.');
      return mapProject(created);
    }, 'Gagal menyimpan proyek.');

    const handleUpdateProyek = async (item: any) => withApiFeedback(async () => {
      const updated = await financeApi.put(`/projects/${item.id}`, projectPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Data proyek berhasil diperbarui.');
      return mapProject(updated);
    }, 'Gagal memperbarui proyek.');

    const handleDeleteProyek = async (id: string) => withApiFeedback(async () => {
      await financeApi.delete(`/projects/${id}`);
      await loadFinancialData({ silent: true });
      showToast('Proyek berhasil dihapus dari database.');
    }, 'Gagal menghapus proyek.');

    const accountPayload = (item: any) => {
      const typeMap: Record<string, string> = { Aset: 'asset', Kewajiban: 'liability', Modal: 'equity', Pendapatan: 'revenue', Beban: 'expense' };
      return {
        code: item.kode,
        name: item.nama,
        type: typeMap[item.tipe] || item.type || 'asset',
        normal_balance: item.normalBalance || (['Aset', 'Beban'].includes(item.tipe) ? 'debit' : 'credit'),
        opening_balance: toNumber(item.saldo ?? item.openingBalance),
        status: item.status || 'active',
        parent_id: item.parentId || item.parent_id || null,
      };
    };

    const handleAddAkun = async (item: any) => withApiFeedback(async () => {
      await financeApi.post('/accounts', accountPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Akun buku besar berhasil disimpan ke database.');
    }, 'Gagal menyimpan akun buku besar.');

    const handleUpdateAkun = async (account: any, item: any) => withApiFeedback(async () => {
      await financeApi.put(`/accounts/${account.id}`, accountPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Akun buku besar berhasil diperbarui.');
    }, 'Gagal memperbarui akun buku besar.');

    const handleDeleteAkun = async (account: any) => withApiFeedback(async () => {
      await financeApi.delete(`/accounts/${account.id}`);
      await loadFinancialData({ silent: true });
      showToast('Akun buku besar berhasil dihapus.');
    }, 'Akun tidak dapat dihapus karena sudah dipakai jurnal/transaksi. Nonaktifkan akun tersebut sebagai gantinya.');

    async function postJournal(newT: any) {
      const incomingLines = Array.isArray(newT.lines) ? newT.lines : [];
      const lines = incomingLines.length
        ? incomingLines.map((line: any) => {
          const account = pickAccount(line.kode || line.accountCode || line.account_id, line.debit > 0 ? 'Aset' : undefined);
          if (!account) throw new Error(`Akun ${line.kode || line.accountCode || ''} belum tersedia di database.`);
          return {
            account_id: Number(account.id),
            description: newT.keterangan || '',
            debit: toNumber(line.debit),
            credit: toNumber(line.credit),
          };
        })
        : (() => {
          const debit = pickAccount(newT.debitAkun, 'Aset');
          const credit = pickAccount(newT.kreditAkun, 'Pendapatan');
          if (!debit || !credit) throw new Error('Akun debit atau kredit belum tersedia di database.');
          return [
            { account_id: Number(debit.id), description: newT.keterangan || '', debit: toNumber(newT.nominal), credit: 0 },
            { account_id: Number(credit.id), description: newT.keterangan || '', debit: 0, credit: toNumber(newT.nominal) },
          ];
        })();
      return financeApi.post('/journals', {
        voucher_number: newT.refVoucher || `JV-${Date.now()}`,
        transaction_date: newT.tanggal || new Date().toISOString().slice(0, 10),
        description: newT.keterangan || 'Jurnal manual FinStart',
        source_type: 'manual',
        source_id: null,
        division_id: Number(newT.divisionId || newT.division_id || 0) || null,
        lines,
      });
    }

    const handleAddTransaksi = async (item: any) => withApiFeedback(async () => {
      await postJournal(item);
      await loadFinancialData({ silent: true });
      showToast('Jurnal draft berhasil dibuat dan menunggu approval pengguna lain.');
    }, 'Gagal membuat jurnal draft.');

    const handleApproveJournal = async (item: any) => withApiFeedback(async () => {
      await financeApi.post(`/journals/${item.id}/approve`, {});
      await loadFinancialData({ silent: true });
      showToast('Jurnal disetujui dan siap diposting.');
    }, 'Gagal menyetujui jurnal. Pastikan jurnal masih draft dan user memiliki akses approval.');

    const handlePostJournal = async (item: any) => withApiFeedback(async () => {
      await financeApi.post(`/journals/${item.id}/post`, {});
      await loadFinancialData({ silent: true });
      showToast('Jurnal berhasil diposting ke Buku Besar.');
    }, 'Gagal memposting jurnal. Pastikan jurnal sudah disetujui.');

    const handleAddJournalFromSubledger = async (memo: string, amount: number, drCode: string, crCode: string) => {
      await handleAddTransaksi({
        refVoucher: `JV-${Date.now()}`,
        tanggal: new Date().toISOString().slice(0, 10),
        keterangan: memo,
        nominal: amount,
        debitAkun: drCode,
        kreditAkun: crCode,
      });
    };

    const invoicePayload = (form: any) => {
      const project = proyek.value.find((item) => String(item.id) === String(form.proyekId || form.projectId));
      if (!project) throw new Error('Pilih proyek terlebih dahulu.');
      return {
        client_id: Number(project.klienId),
        project_id: Number(project.id),
        invoice_number: form.nomor || form.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        issue_date: form.tanggalKirim || form.issueDate || new Date().toISOString().slice(0, 10),
        due_date: form.jatuhTempo || form.dueDate || form.tanggalKirim || new Date().toISOString().slice(0, 10),
        notes: form.keterangan || form.notes || `Termin proyek ${project.nama}`,
        items: [{ description: form.keterangan || `Termin proyek ${project.nama}`, quantity: 1, unit_price: toNumber(form.nominal) }],
        tax: { ppn_enabled: Boolean(form.ppnEnabled), ppn_rate: toNumber(form.ppnRate) || 0 },
      };
    };

    const handleCreateInvoice = async (form: any) => withApiFeedback(async () => {
      await financeApi.post('/invoices', invoicePayload(form));
      await loadFinancialData({ silent: true });
      showToast('Invoice draft berhasil disimpan. Terbitkan dari daftar setelah diperiksa.');
    }, 'Gagal membuat invoice.');

    const handleUpdateInvoice = async (invoice: any, form: any) => withApiFeedback(async () => {
      await financeApi.put(`/invoices/${invoice.id}`, invoicePayload({ ...form, nomor: form.nomor || invoice.nomor }));
      await loadFinancialData({ silent: true });
      showToast('Invoice draft berhasil diperbarui.');
    }, 'Gagal memperbarui invoice draft.');

    const handleIssueInvoice = async (invoice: any) => withApiFeedback(async () => {
      const revenue = pickAccount('4001', 'Pendapatan');
      await financeApi.post(`/invoices/${invoice.id}/issue`, revenue ? { revenue_account_id: Number(revenue.id) } : {});
      await loadFinancialData({ silent: true });
      showToast(`Invoice ${invoice.nomor} diterbitkan dan jurnal otomatis dibuat.`);
    }, 'Gagal menerbitkan invoice.');

    const handleCancelInvoice = async (invoice: any, reason = '') => withApiFeedback(async () => {
      await financeApi.post(`/invoices/${invoice.id}/cancel`, { cancellation_date: new Date().toISOString().slice(0, 10), reason });
      await loadFinancialData({ silent: true });
      showToast(`Invoice ${invoice.nomor} berhasil dibatalkan.`);
    }, 'Gagal membatalkan invoice. Invoice yang sudah dibayar sebagian harus dikoreksi melalui nota kredit.');

    const handleRecordInvoicePayment = async (invoice: any, payment: any) => withApiFeedback(async () => {
      const cash = pickAccount(payment.accountCode || '1001', 'Aset');
      if (!cash) throw new Error('Akun kas/bank belum tersedia.');
      await financeApi.post(`/invoices/${invoice.id}/payments`, {
        payment_date: payment.paymentDate || new Date().toISOString().slice(0, 10),
        payment_method: 'transfer',
        amount: toNumber(payment.amount || invoice.outstandingAmount || invoice.nominal),
        reference_number: payment.referenceNumber || '',
        notes: payment.notes || '',
        cash_account_id: Number(cash.id),
      });
      await loadFinancialData({ silent: true });
      showToast(`Pelunasan invoice ${invoice.nomor} berhasil dibukukan.`);
    }, 'Gagal mencatat pelunasan invoice.');

    const billPayload = (form: any) => ({
      vendor_name: form.vendor,
      project_id: form.alokasiProyek || form.projectId ? Number(form.alokasiProyek || form.projectId) : null,
      bill_number: form.nomorTagihan || form.billNumber || `BILL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      bill_date: form.tanggalMasuk || form.billDate || new Date().toISOString().slice(0, 10),
      due_date: form.jatuhTempo || form.dueDate || form.tanggalMasuk || new Date().toISOString().slice(0, 10),
      notes: form.keterangan || form.notes || '',
      items: [{ description: form.keterangan || 'Tagihan vendor', quantity: 1, unit_price: toNumber(form.nominal) }],
      tax: { ppn_enabled: Boolean(form.ppnEnabled), ppn_rate: toNumber(form.ppnRate) || 0, pph23_enabled: Boolean(form.pph23Enabled), pph23_rate: toNumber(form.pph23Rate) || 0 },
    });

    const handleCreateBill = async (form: any) => withApiFeedback(async () => {
      await financeApi.post('/bills', billPayload(form));
      await loadFinancialData({ silent: true });
      showToast('Tagihan vendor draft berhasil disimpan. Terbitkan dari daftar setelah diperiksa.');
    }, 'Gagal menyimpan tagihan vendor.');

    const handleUpdateBill = async (bill: any, form: any) => withApiFeedback(async () => {
      await financeApi.put(`/bills/${bill.id}`, billPayload({ ...form, nomorTagihan: form.nomorTagihan || bill.nomorTagihan }));
      await loadFinancialData({ silent: true });
      showToast('Tagihan draft berhasil diperbarui.');
    }, 'Gagal memperbarui tagihan draft.');

    const handleIssueBill = async (bill: any) => withApiFeedback(async () => {
      const expense = pickAccount('5002', 'Beban');
      await financeApi.post(`/bills/${bill.id}/issue`, expense ? { expense_account_id: Number(expense.id) } : {});
      await loadFinancialData({ silent: true });
      showToast(`Tagihan ${bill.nomorTagihan} diterbitkan dan jurnal otomatis dibuat.`);
    }, 'Gagal menerbitkan tagihan.');

    const handleCancelBill = async (bill: any, reason = '') => withApiFeedback(async () => {
      await financeApi.post(`/bills/${bill.id}/cancel`, { cancellation_date: new Date().toISOString().slice(0, 10), reason });
      await loadFinancialData({ silent: true });
      showToast(`Tagihan ${bill.nomorTagihan} berhasil dibatalkan.`);
    }, 'Gagal membatalkan tagihan. Tagihan yang sudah dibayar sebagian harus dikoreksi melalui nota debit.');

    const handlePayBill = async (bill: any, payment: any) => withApiFeedback(async () => {
      const cash = pickAccount(payment.accountCode || '1001', 'Aset');
      if (!cash) throw new Error('Akun kas/bank belum tersedia.');
      await financeApi.post(`/bills/${bill.id}/payments`, {
        payment_date: payment.paymentDate || new Date().toISOString().slice(0, 10),
        payment_method: 'transfer',
        amount: toNumber(payment.amount || bill.outstandingAmount || bill.nominal),
        reference_number: payment.referenceNumber || '',
        notes: payment.notes || '',
        cash_account_id: Number(cash.id),
      });
      await loadFinancialData({ silent: true });
      showToast(`Pembayaran tagihan ${bill.vendor} berhasil dibukukan.`);
    }, 'Gagal mencatat pembayaran tagihan vendor.');

    const handleAddLangganan = async (item: any) => withApiFeedback(async () => {
      const cycle = item.siklus === 'Tahunan' ? 'yearly' : 'monthly';
      await financeApi.post('/subscriptions', {
        subscription_name: item.nama,
        provider_name: item.provider,
        category: item.kategori,
        amount: toNumber(item.biayaIDR || item.biaya),
        billing_cycle: cycle,
        start_date: item.tanggalTagihan || new Date().toISOString().slice(0, 10),
        renewal_date: item.tanggalTagihan || new Date().toISOString().slice(0, 10),
        payment_terms_days: 0,
        status: 'active',
        notes: item.mataUang && item.mataUang !== 'IDR' ? `Nominal asli: ${item.mataUang} ${item.biaya}. Kurs input: ${item.kurs || '-'}.` : '',
      });
      await loadFinancialData({ silent: true });
      showToast('Langganan berhasil disimpan ke database.');
    }, 'Gagal menyimpan langganan.');

    const handleDeleteLangganan = async (id: string) => withApiFeedback(async () => {
      const subscription = langganan.value.find((item) => String(item.id) === String(id));
      const raw = subscription?._raw;
      if (!raw) throw new Error('Data langganan tidak ditemukan.');
      await financeApi.put(`/subscriptions/${id}`, {
        subscription_name: raw.subscription_name,
        provider_name: raw.provider_name,
        category: raw.category,
        amount: toNumber(raw.amount),
        billing_cycle: raw.billing_cycle,
        start_date: String(raw.start_date || '').slice(0, 10),
        renewal_date: String(raw.renewal_date || '').slice(0, 10),
        payment_terms_days: toNumber(raw.payment_terms_days),
        status: 'cancelled',
        notes: raw.notes || '',
      });
      await loadFinancialData({ silent: true });
      showToast('Langganan dinonaktifkan di database.');
    }, 'Gagal menonaktifkan langganan.');

    const handleAddAsset = async (item: any) => withApiFeedback(async () => {
      const cash = pickAccount('1001', 'Aset');
      if (!cash) throw new Error('Akun kas/bank untuk perolehan aset belum tersedia.');
      await financeApi.post('/assets', {
        asset_name: item.nama,
        category: item.kategori,
        acquisition_date: item.tanggalBeli || new Date().toISOString().slice(0, 10),
        acquisition_cost: toNumber(item.hargaBeli),
        useful_life_months: Math.max(1, toNumber(item.masaManfaat) * 12),
        residual_value: toNumber(item.nilaiSisa),
        payment_account_id: Number(cash.id),
        notes: item.penanggungJawab ? `Penanggung jawab: ${item.penanggungJawab}` : '',
      });
      await loadFinancialData({ silent: true });
      showToast('Aset berhasil diregistrasi dan dijurnal ke database.');
    }, 'Gagal meregistrasi aset.');

    const handleUpdateAsset = async (asset: any, item: any) => withApiFeedback(async () => {
      const raw = asset?._raw || {};
      await financeApi.put(`/assets/${asset.id}`, {
        asset_name: item.nama,
        category: item.kategori,
        useful_life_months: Math.max(1, toNumber(item.masaManfaat) * 12),
        residual_value: toNumber(item.nilaiSisa),
        notes: item.penanggungJawab ? `Penanggung jawab: ${item.penanggungJawab}` : (raw.notes || ''),
      });
      await loadFinancialData({ silent: true });
      showToast('Data aset berhasil diperbarui. Harga perolehan tidak diubah agar jurnal akuisisi tetap konsisten.');
    }, 'Gagal memperbarui aset.');

    const handleDisposeAsset = async (asset: any, reason = '') => withApiFeedback(async () => {
      await financeApi.post(`/assets/${asset.id}/dispose`, { disposal_date: new Date().toISOString().slice(0, 10), reason });
      await loadFinancialData({ silent: true });
      showToast(`Aset ${asset.nama} telah dilepas dan jurnal pelepasan dibuat.`);
    }, 'Gagal melepas aset.');

    const handleCreateTax = async (item: any) => withApiFeedback(async () => {
      const created = await financeApi.post('/taxes', {
        tax_type: item.jenis,
        tax_period: normalizePeriod(item.masaPajak),
        amount: toNumber(item.nominal),
        due_date: item.jatuhTempo || new Date().toISOString().slice(0, 10),
        notes: item.catatan || '',
      });
      const expense = pickAccount('5002', 'Beban');
      await financeApi.post(`/taxes/${created.id}/issue`, expense ? { expense_account_id: Number(expense.id) } : {});
      await loadFinancialData({ silent: true });
      showToast('Kewajiban pajak berhasil disimpan dan diposting.');
    }, 'Gagal menyimpan kewajiban pajak.');

    const handlePayTax = async (tax: any, payment: any) => withApiFeedback(async () => {
      const cash = pickAccount(payment.accountCode || '1001', 'Aset');
      if (!cash) throw new Error('Akun kas/bank belum tersedia.');
      await financeApi.post(`/taxes/${tax.id}/pay`, {
        payment_date: payment.paymentDate || new Date().toISOString().slice(0, 10),
        cash_account_id: Number(cash.id),
        tax_number: payment.taxNumber || tax.ntpn || '',
        notes: payment.notes || '',
      });
      await loadFinancialData({ silent: true });
      showToast(`Setoran ${tax.jenis} berhasil dibukukan.`);
    }, 'Gagal mencatat setoran pajak.');

    const handleSaveProjection = async (item: any) => withApiFeedback(async () => {
      const rawMonth = item.month ?? item.bulanProyeksi;
      const month = /^\d{4}-\d{2}$/.test(String(rawMonth || ''))
        ? Number(String(rawMonth).slice(-2))
        : Number(rawMonth || new Date().getMonth() + 1);
      if (!Number.isFinite(month) || month < 1 || month > 12) throw new Error('Bulan target proyeksi tidak valid.');
      const existing = (projectionData.value.months || []).find((row: any) => Number(row.month) === month) || {};
      const isExpense = item.akunType === 'Beban' || String(item.akunName || item.nama || '').toLowerCase().includes('beban') || String(item.akunName || item.nama || '').toLowerCase().includes('expense');
      await financeApi.post('/projections', {
        projection_year: Number(projectionData.value.year || new Date().getFullYear()),
        projection_month: month,
        revenue_target: isExpense ? toNumber(existing.revenue_target) : toNumber(item.nilaiTarget || item.nilai),
        expense_target: isExpense ? toNumber(item.nilaiTarget || item.nilai) : toNumber(existing.expense_target),
        notes: item.catatan || '',
      });
      await loadFinancialData({ silent: true });
      showToast('Target proyeksi berhasil disimpan ke database.');
    }, 'Gagal menyimpan proyeksi.');

    const handleSelectProjectionScenario = async (scenarioKey: string) => {
      projectionScenario.value = ['optimistic', 'normal', 'pessimistic'].includes(String(scenarioKey)) ? String(scenarioKey) : 'normal';
      await loadFinancialData({ silent: true });
    };

    const handleUpdateProjectionScenario = async (scenario: any) => withApiFeedback(async () => {
      await financeApi.put(`/projections/scenarios/${scenario.scenario_key}`, {
        projection_year: Number(projectionData.value.year || new Date().getFullYear()),
        revenue_factor: toNumber(scenario.revenue_factor),
        expense_factor: toNumber(scenario.expense_factor),
        notes: scenario.notes || '',
      });
      await loadFinancialData({ silent: true });
      showToast('Parameter skenario proyeksi berhasil diperbarui.');
    }, 'Gagal memperbarui skenario proyeksi.');

    const handleSaveBudgetAllocation = async (budget: any) => withApiFeedback(async () => {
      const payload = {
        budget_year: Number(budget.budget_year || projectionData.value.year || new Date().getFullYear()),
        budget_month: budget.budget_month === '' || budget.budget_month === null || budget.budget_month === undefined ? null : Number(budget.budget_month),
        scenario_key: budget.scenario_key || projectionScenario.value || 'normal',
        account_id: Number(budget.account_id),
        division_id: budget.division_id ? Number(budget.division_id) : null,
        budget_amount: toNumber(budget.budget_amount),
        notes: budget.notes || '',
      };
      if (budget.id) await financeApi.put(`/projections/budgets/${budget.id}`, payload);
      else await financeApi.post('/projections/budgets', payload);
      await loadFinancialData({ silent: true });
      showToast(budget.id ? 'Budget akun/divisi berhasil diperbarui.' : 'Budget akun/divisi berhasil disimpan.');
    }, 'Gagal menyimpan budget akun/divisi.');

    const handleDeleteBudgetAllocation = async (budget: any) => withApiFeedback(async () => {
      await financeApi.delete(`/projections/budgets/${budget.id}`);
      await loadFinancialData({ silent: true });
      showToast('Budget akun/divisi berhasil dihapus.');
    }, 'Gagal menghapus budget akun/divisi.');

    const handleQuickAction = (action: string) => {
      if (action === 'entri_jurnal') {
        setActiveTab('transaksi');
        showToast('Navigasi ke Transaksi Jurnal. Klik tombol "Entri Jurnal Baru"');
      } else if (action === 'buat_invoice') {
        setActiveTab('piutang');
        showToast('Navigasi ke Piutang Usaha. Klik tombol "Buat Invoice Baru"');
      } else if (action === 'tambah_proyek') {
        setActiveTab('crm');
        showToast('Navigasi ke CRM & Proyek. Klik tombol "Inisiasi Proyek Baru"');
      }
    };

    const handleLoginSuccess = (session: any) => {
      const email = session?.user?.email || getSavedUserEmail();
      applyAuthenticatedUser(session?.user || {});
      setScreen('auth-loading');

      loadFinancialData({ silent: true }).catch(() => {
        // Data tetap bisa dimuat ulang dari dashboard.
      });

      window.setTimeout(() => {
        setScreen('dashboard');
        showToast(`Otentikasi berhasil. Selamat datang ${email.split('@')[0]}!`);
      }, 3000);
    };
    const handleLogout = async () => {
      try {
        await financeApi.logout();
      } catch (error) {
        console.warn(error);
      }
      clearSavedSession();
      setActiveTab('dashboard');
      localStorage.removeItem(ACTIVE_TAB_KEY);
      setScreen('landing');
      showToast('Sesi ditutup. Anda berhasil keluar sistem.');
    };

    let authExpiredHandler: (() => void) | undefined;

    onMounted(() => {
      authExpiredHandler = () => {
        clearSavedSession();
        setActiveTab('dashboard');
        setScreen('login');
        showToast('Sesi server berakhir. Silakan login ulang.');
      };
      window.addEventListener('finstart-auth-expired', authExpiredHandler);

      if (hasSavedSession) {
        financeApi.me()
          .then((session: any) => {
            applyAuthenticatedUser(session?.user || {});
            return loadFinancialData({ silent: true });
          })
          .catch(() => {
            if (authExpiredHandler) authExpiredHandler();
          });
      }
    });

    onUnmounted(() => {
      if (authExpiredHandler) {
        window.removeEventListener('finstart-auth-expired', authExpiredHandler);
      }
    });
    return () => <div class="min-h-screen bg-[#F7F9FC] text-slate-800 antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      
      {/* Dynamic Animated Screen Transitions */}
      <AnimatePresence mode="wait">
        
        {/* SCREEN 1: Dynamic Data Splash Screen */}
        {screen.value === 'splash' && <motion.div key="splash" initial={{
          opacity: 1
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.5
        }}>
            <SplashScreen onComplete={() => setScreen(splashDestination)} />
          </motion.div>}

        {/* SCREEN 2: Premium Corporate Landing Page */}
        {screen.value === 'landing' && <motion.div key="landing" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.5
        }}>
            <LandingPage onLoginClick={() => setScreen('login')} />
          </motion.div>}

        {/* SCREEN 3: Elegant Enterprise Login Panel */}
        {screen.value === 'login' && <motion.div key="login" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} transition={{
          duration: 0.4
        }}>
            <Login onLoginSuccess={handleLoginSuccess} onBackToLanding={() => setScreen('landing')} />
          </motion.div>}

        {/* SCREEN 4: Loading after successful login */}
        {screen.value === 'auth-loading' && <motion.div key="auth-loading" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.35
        }}>
            <LoadingScreen email={userEmail.value} />
          </motion.div>}

        {/* SCREEN 5: Main ERP Dashboard Area */}
        {screen.value === 'dashboard' && <motion.div key="dashboard" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} class="app-shell flex flex-col lg:flex-row h-screen overflow-hidden">
            {/* Navigation Drawer Sidebar */}
            <Sidebar activeTab={activeTab.value} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed.value} onToggleSidebar={toggleSidebar} onLogout={handleLogout} allowedTabs={allowedTabs.value} />

            <button
              id="btn-sidebar-drawer"
              type="button"
              onClick={toggleSidebar}
              style={{
                position: 'fixed',
                left: isSidebarCollapsed.value ? '0px' : '286px',
                top: '58%',
                transform: 'translateY(-50%)',
                zIndex: 99999,
                width: '42px',
                height: '72px',
                alignItems: 'center',
                justifyContent: 'center',
                borderTop: '1px solid #D8E5F4',
                borderRight: '1px solid #D8E5F4',
                borderBottom: '1px solid #D8E5F4',
                borderLeft: 0,
                borderRadius: '0 18px 18px 0',
                background: '#FFFFFF',
                color: '#102A56',
                boxShadow: '0 16px 34px rgba(16,42,86,0.20)',
                transition: 'left 240ms ease, background 180ms ease, color 180ms ease',
              }}
              class="hidden lg:flex hover:!bg-[#0B3A78] hover:!text-white"
              title={isSidebarCollapsed.value ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}
              aria-label={isSidebarCollapsed.value ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}
            >
              {isSidebarCollapsed.value ? <ChevronRight class="h-5 w-5" /> : <ChevronLeft class="h-5 w-5" />}
            </button>

            {/* Right Workspaces Shell */}
            <div
              class="app-workspace flex-1 flex flex-col h-screen min-w-0 overflow-hidden"
              style={{
                '--sidebar-offset': isSidebarCollapsed.value ? '0px' : '286px',
              }}
            >
              <Topbar userEmail={userEmail.value} userRole={userRole.value} onLogout={handleLogout} onOpenSettings={() => setActiveTab('pengaturan')} notifications={notifications.value} />

              {/* Main Contents Panel */}
              <main
                style={{
                  transition: 'padding 260ms ease',
                }}
                class="app-main flex-1 w-full overflow-y-auto px-5 py-7 md:px-10 md:py-10 xl:px-12 xl:py-12"
              >
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab.value} initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} transition={{
                  duration: 0.25
                }} class={`mx-auto min-h-full w-full ${activeTab.value === 'crm' ? 'max-w-[1760px]' : 'max-w-7xl'}`}>
                    {activeTab.value === 'dashboard' && <DashboardView key={`dashboard-${dataVersion.value}`} proyek={proyek.value} klien={klien.value} akun={akun.value} transaksi={transaksi.value} langganan={langganan.value} dashboard={dashboardSummary.value} invoices={invoices.value} bills={bills.value} assets={assets.value} taxes={taxes.value} pegawai={pegawai.value} projectionData={projectionData.value} reportData={reportData.value} setActiveTab={setActiveTab} onQuickAction={handleQuickAction} />}

                    {activeTab.value === 'crm' && <CrmView key={`crm-${dataVersion.value}`} proyek={proyek.value} klien={klien.value} pegawai={pegawai.value} onAddProyek={handleAddProyek} onUpdateProyek={handleUpdateProyek} onAddKlien={handleAddKlien} onUpdateKlien={handleUpdateKlien} onDeleteProyek={handleDeleteProyek} onDeleteKlien={handleDeleteKlien} showToast={showToast} />}

                    {(activeTab.value === 'bukubesar' || activeTab.value === 'transaksi') && <BukuBesarDanTransaksi key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} akun={akun.value} transaksi={transaksi.value} divisions={divisions.value} userRole={userRole.value} onAddAkun={handleAddAkun} onUpdateAkun={handleUpdateAkun} onDeleteAkun={handleDeleteAkun} onAddTransaksi={handleAddTransaksi} onApproveJournal={handleApproveJournal} onPostJournal={handlePostJournal} showToast={showToast} />}

                    {(activeTab.value === 'piutang' || activeTab.value === 'utang') && <PiutangDanUtang key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} proyek={proyek.value} klien={klien.value} akun={akun.value} invoices={invoices.value} bills={bills.value} onCreateInvoice={handleCreateInvoice} onUpdateInvoice={handleUpdateInvoice} onIssueInvoice={handleIssueInvoice} onCancelInvoice={handleCancelInvoice} onRecordInvoicePayment={handleRecordInvoicePayment} onCreateBill={handleCreateBill} onUpdateBill={handleUpdateBill} onIssueBill={handleIssueBill} onCancelBill={handleCancelBill} onPayBill={handlePayBill} showToast={showToast} />}

                    {(activeTab.value === 'langganan' || activeTab.value === 'aset') && <LanggananDanAset key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} langganan={langganan.value} assets={assets.value} onAddLangganan={handleAddLangganan} onDeleteLangganan={handleDeleteLangganan} onAddAsset={handleAddAsset} onUpdateAsset={handleUpdateAsset} onDisposeAsset={handleDisposeAsset} onRefreshData={() => loadFinancialData({ silent: true })} onSwitchSection={setActiveTab} showToast={showToast} />}

                    {(activeTab.value === 'sdm' || activeTab.value === 'perpajakan') && <SdmDanPajak key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} pegawai={pegawai.value} akun={akun.value} taxes={taxes.value} taxSummary={taxSummary.value} taxCalculationData={taxCalculation.value} onAddJournalFromSubledger={handleAddJournalFromSubledger} onCreateTax={handleCreateTax} onPayTax={handlePayTax} onRefreshData={() => loadFinancialData({ silent: true })} showToast={showToast} />}

                    {(activeTab.value === 'proyeksi' || activeTab.value === 'laporan') && <ProyeksiDanLaporan key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} akun={akun.value} transaksi={transaksi.value} proyek={proyek.value} divisions={divisions.value} projectionData={projectionData.value} reportData={reportData.value} reportPeriod={selectedReportPeriod.value} reportPeriods={availableReportPeriods.value} reportError={reportError.value} onSelectReportPeriod={handleSelectReportPeriod} onSaveProjection={handleSaveProjection} onSelectProjectionScenario={handleSelectProjectionScenario} onUpdateProjectionScenario={handleUpdateProjectionScenario} onSaveBudgetAllocation={handleSaveBudgetAllocation} onDeleteBudgetAllocation={handleDeleteBudgetAllocation} showToast={showToast} />}

                    {activeTab.value === 'pengaturan' && <PengaturanView userEmail={userEmail.value} userRole={userRole.value} showToast={showToast} />}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Global Interactive Float Toast Message Alert */}
      <AnimatePresence>
        {toast.value.visible && <motion.div id="global-toast-alert" initial={{
          opacity: 0,
          y: -24,
          scale: 0.94
        }} animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }} exit={{
          opacity: 0,
          y: -18,
          scale: 0.96
        }} class="fixed left-1/2 top-6 z-[10050] w-[min(92vw,440px)] -translate-x-1/2 bg-[#0F172A] border border-blue-900/60 shadow-2xl px-5 py-3.5 rounded-2xl flex items-center gap-3 text-white text-xs">
            <div class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle class="w-3.5 h-3.5 text-white" />
            </div>
            <div class="flex-1">
              <p class="font-bold text-cyan-300">Sistem Notifikasi</p>
              <p class="text-slate-200 mt-0.5 leading-relaxed font-light">{toast.value.message}</p>
            </div>
            <button id="btn-close-toast" onClick={() => setToast({
            message: '',
            visible: false
          })} class="text-slate-400 hover:text-white ml-2 focus:outline-none shrink-0">
              <X class="w-4 h-4" />
            </button>
          </motion.div>}
      </AnimatePresence>
    </div>;
  }
});
</script>
