<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, ref } from "vue";
import { motion, AnimatePresence } from "./compat/motion.js";
import { CheckCircle, X } from "lucide-vue-next";
import { INITIAL_PEGAWAI } from './data.ts';

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
import { financeApi, getApiErrorMessage } from './services/financeApi.js';
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

export default defineComponent({
  name: "App",
  setup() {
    const screen = ref('splash');
    const setScreen = (next: any) => { screen.value = typeof next === 'function' ? next(screen.value) : next; };
    const activeTab = ref('dashboard');
    const setActiveTab = (next: any) => { activeTab.value = typeof next === 'function' ? next(activeTab.value) : next; };
    const userEmail = ref('finance@kedata.id');
    const setUserEmail = (next: any) => { userEmail.value = typeof next === 'function' ? next(userEmail.value) : next; };
    const isSidebarCollapsed = ref(false);
    const setIsSidebarCollapsed = (next: any) => { isSidebarCollapsed.value = typeof next === 'function' ? next(isSidebarCollapsed.value) : next; };

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

    // Payroll tetap memakai data sementara hingga Master Data Operasional tersedia.
    const pegawai = ref<any[]>(INITIAL_PEGAWAI);

    const dashboardSummary = ref<any>({
      cash_balance: 0, total_receivable: 0, total_payable: 0,
      total_revenue: 0, total_expense: 0, net_profit: 0,
      active_projects: 0, cashflow_series: [], recent_transactions: [],
    });
    const taxSummary = ref<any>({ total_unpaid: 0, total_paid: 0, total_overdue: 0 });
    const taxCalculation = ref<any>({ revenue: 0, expense: 0, net_profit: 0 });
    const projectionData = ref<any>({ year: new Date().getFullYear(), months: [], summary: {} });
    const reportData = ref<any>({ income_statement: {}, balance_sheet: {}, cash_flow: {} });
    const dataVersion = ref(0);

    const notifications = ref<any[]>([
      { id: 'n-1', text: 'Data keuangan disinkronkan langsung dari backend FinStart.', type: 'info', time: 'Baru Saja' },
    ]);
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

    async function loadFinancialData(options: { silent?: boolean } = {}) {
      const period = currentPeriod();
      const year = new Date().getFullYear();
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
        financeApi.get('/projections', { year }),
        financeApi.get('/reports', { period }),
        financeApi.get('/dashboard/summary'),
      ]);

      const value = (index: number, fallback: any = []) => jobs[index].status === 'fulfilled' ? (jobs[index] as PromiseFulfilledResult<any>).value : fallback;
      replaceList(klien, (value(0) || []).map(mapClient));
      replaceList(proyek, (value(1) || []).map(mapProject));
      replaceList(akun, (value(2) || []).map(mapAccount));
      replaceList(transaksi, (value(3) || []).map(mapJournalTransaction));

      const subscriptionsResponse = value(4, {});
      replaceList(langganan, ((subscriptionsResponse?.subscriptions || subscriptionsResponse || []) as any[])
        .filter((row) => String(row.status || '').toLowerCase() !== 'cancelled')
        .map(mapSubscription));

      const assetsResponse = value(5, {});
      replaceList(assets, ((assetsResponse?.assets || assetsResponse || []) as any[]).map(mapAsset));
      replaceList(invoices, (value(6) || []).map(mapInvoice));
      replaceList(bills, (value(7) || []).map(mapBill));
      replaceList(taxes, (value(8) || []).map(mapTax));
      Object.assign(taxSummary.value, value(9, {}));
      Object.assign(taxCalculation.value, value(10, {}));
      Object.assign(projectionData.value, value(11, {}));
      Object.assign(reportData.value, value(12, {}));
      Object.assign(dashboardSummary.value, value(13, {}));
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
      };
    }

    async function withApiFeedback(task: () => Promise<void>, fallback: string) {
      try {
        await task();
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, fallback));
      }
    }

    const handleAddKlien = async (item: any) => withApiFeedback(async () => {
      await financeApi.post('/clients', clientPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Klien berhasil disimpan ke database.');
    }, 'Gagal menyimpan klien.');

    const handleUpdateKlien = async (item: any) => withApiFeedback(async () => {
      await financeApi.put(`/clients/${item.id}`, clientPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Data klien berhasil diperbarui.');
    }, 'Gagal memperbarui klien.');

    const handleDeleteKlien = async (id: string) => withApiFeedback(async () => {
      await financeApi.delete(`/clients/${id}`);
      await loadFinancialData({ silent: true });
      showToast('Klien berhasil dihapus dari database.');
    }, 'Gagal menghapus klien.');

    const handleAddProyek = async (item: any) => withApiFeedback(async () => {
      await financeApi.post('/projects', projectPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Proyek berhasil disimpan ke database.');
    }, 'Gagal menyimpan proyek.');

    const handleUpdateProyek = async (item: any) => withApiFeedback(async () => {
      await financeApi.put(`/projects/${item.id}`, projectPayload(item));
      await loadFinancialData({ silent: true });
      showToast('Data proyek berhasil diperbarui.');
    }, 'Gagal memperbarui proyek.');

    const handleDeleteProyek = async (id: string) => withApiFeedback(async () => {
      await financeApi.delete(`/projects/${id}`);
      await loadFinancialData({ silent: true });
      showToast('Proyek berhasil dihapus dari database.');
    }, 'Gagal menghapus proyek.');

    const handleAddAkun = async (item: any) => withApiFeedback(async () => {
      const typeMap: Record<string, string> = { Aset: 'asset', Kewajiban: 'liability', Modal: 'equity', Pendapatan: 'revenue', Beban: 'expense' };
      await financeApi.post('/accounts', {
        code: item.kode,
        name: item.nama,
        type: typeMap[item.tipe] || 'asset',
        normal_balance: ['Aset', 'Beban'].includes(item.tipe) ? 'debit' : 'credit',
        opening_balance: toNumber(item.saldo),
        status: 'active',
      });
      await loadFinancialData({ silent: true });
      showToast('Akun buku besar berhasil disimpan ke database.');
    }, 'Gagal menyimpan akun buku besar.');

    async function postJournal(newT: any) {
      const debit = pickAccount(newT.debitAkun, 'Aset');
      const credit = pickAccount(newT.kreditAkun, 'Pendapatan');
      if (!debit || !credit) throw new Error('Akun debit atau kredit belum tersedia di database.');
      const draft = await financeApi.post('/journals', {
        voucher_number: newT.refVoucher || `JV-${Date.now()}`,
        transaction_date: newT.tanggal || new Date().toISOString().slice(0, 10),
        description: newT.keterangan || 'Jurnal manual FinStart',
        source_type: 'manual',
        source_id: null,
        lines: [
          { account_id: Number(debit.id), description: newT.keterangan || '', debit: toNumber(newT.nominal), credit: 0 },
          { account_id: Number(credit.id), description: newT.keterangan || '', debit: 0, credit: toNumber(newT.nominal) },
        ],
      });
      await financeApi.post(`/journals/${draft.id}/approve`, {});
      await financeApi.post(`/journals/${draft.id}/post`, {});
    }

    const handleAddTransaksi = async (item: any) => withApiFeedback(async () => {
      await postJournal(item);
      await loadFinancialData({ silent: true });
      showToast('Jurnal berhasil diposting ke database.');
    }, 'Gagal memposting jurnal.');

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

    const handleCreateInvoice = async (form: any) => withApiFeedback(async () => {
      const project = proyek.value.find((item) => String(item.id) === String(form.proyekId));
      if (!project) throw new Error('Pilih proyek terlebih dahulu.');
      const draft = await financeApi.post('/invoices', {
        client_id: Number(project.klienId),
        project_id: Number(project.id),
        invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        issue_date: form.tanggalKirim || new Date().toISOString().slice(0, 10),
        due_date: form.jatuhTempo || form.tanggalKirim || new Date().toISOString().slice(0, 10),
        notes: '',
        items: [{ description: `Termin proyek ${project.nama}`, quantity: 1, unit_price: toNumber(form.nominal) }],
        tax: { ppn_enabled: false, ppn_rate: 0 },
      });
      const revenue = pickAccount('4001', 'Pendapatan');
      await financeApi.post(`/invoices/${draft.id}/issue`, revenue ? { revenue_account_id: Number(revenue.id) } : {});
      await loadFinancialData({ silent: true });
      showToast('Invoice berhasil disimpan dan diposting ke jurnal.');
    }, 'Gagal membuat invoice.');

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

    const handleCreateBill = async (form: any) => withApiFeedback(async () => {
      const draft = await financeApi.post('/bills', {
        vendor_name: form.vendor,
        project_id: form.alokasiProyek ? Number(form.alokasiProyek) : null,
        bill_number: form.nomorTagihan || `BILL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        bill_date: form.tanggalMasuk || new Date().toISOString().slice(0, 10),
        due_date: form.jatuhTempo || form.tanggalMasuk || new Date().toISOString().slice(0, 10),
        notes: form.keterangan || '',
        items: [{ description: form.keterangan || 'Tagihan vendor', quantity: 1, unit_price: toNumber(form.nominal) }],
        tax: { ppn_enabled: false, ppn_rate: 0 },
      });
      const expense = pickAccount('5002', 'Beban');
      await financeApi.post(`/bills/${draft.id}/issue`, expense ? { expense_account_id: Number(expense.id) } : {});
      await loadFinancialData({ silent: true });
      showToast('Tagihan vendor berhasil disimpan dan diposting ke jurnal.');
    }, 'Gagal menyimpan tagihan vendor.');

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
        amount: toNumber(item.biaya || item.biayaIDR),
        billing_cycle: cycle,
        start_date: item.tanggalTagihan || new Date().toISOString().slice(0, 10),
        renewal_date: item.tanggalTagihan || new Date().toISOString().slice(0, 10),
        payment_terms_days: 0,
        status: 'active',
        notes: '',
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
      const month = Number(item.bulanProyeksi || item.month || new Date().getMonth() + 1);
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

    const handleLoginSuccess = (email: string) => {
      setUserEmail(email);
      setScreen('auth-loading');

      loadFinancialData({ silent: true }).catch(() => {
        // Data tetap bisa dimuat ulang dari dashboard.
      });

      window.setTimeout(() => {
        setScreen('dashboard');
        showToast(`Otentikasi berhasil. Selamat datang ${email.split('@')[0]}!`);
      }, 3000);
    };
    const handleLogout = () => {
      setScreen('landing');
      showToast('Sesi ditutup. Anda berhasil keluar sistem.');
    };

    onMounted(() => { loadFinancialData({ silent: true }); });
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
            <SplashScreen onComplete={() => setScreen('landing')} />
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
            <Sidebar activeTab={activeTab.value} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed.value} setIsCollapsed={setIsSidebarCollapsed} onLogout={handleLogout} />

            {/* Right Workspaces Shell */}
            <div class="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
              <Topbar userEmail={userEmail.value} onLogout={handleLogout} notifications={notifications.value} isSidebarCollapsed={isSidebarCollapsed.value} setIsSidebarCollapsed={setIsSidebarCollapsed} />

              {/* Main Contents Panel */}
              <main class="app-main flex-1 overflow-y-auto p-4 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab.value} initial={{
                  opacity: 0,
                  y: 15
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -15
                }} transition={{
                  duration: 0.25
                }} class="mx-auto h-full max-w-7xl">
                    {activeTab.value === 'dashboard' && <DashboardView key={`dashboard-${dataVersion.value}`} proyek={proyek.value} klien={klien.value} akun={akun.value} transaksi={transaksi.value} langganan={langganan.value} dashboard={dashboardSummary.value} invoices={invoices.value} setActiveTab={setActiveTab} onQuickAction={handleQuickAction} />}

                    {activeTab.value === 'crm' && <CrmView key={`crm-${dataVersion.value}`} proyek={proyek.value} klien={klien.value} pegawai={pegawai.value} onAddProyek={handleAddProyek} onUpdateProyek={handleUpdateProyek} onAddKlien={handleAddKlien} onUpdateKlien={handleUpdateKlien} onDeleteProyek={handleDeleteProyek} onDeleteKlien={handleDeleteKlien} showToast={showToast} />}

                    {(activeTab.value === 'bukubesar' || activeTab.value === 'transaksi') && <BukuBesarDanTransaksi key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} akun={akun.value} transaksi={transaksi.value} onAddAkun={handleAddAkun} onAddTransaksi={handleAddTransaksi} showToast={showToast} />}

                    {(activeTab.value === 'piutang' || activeTab.value === 'utang') && <PiutangDanUtang key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} proyek={proyek.value} klien={klien.value} akun={akun.value} invoices={invoices.value} bills={bills.value} onCreateInvoice={handleCreateInvoice} onRecordInvoicePayment={handleRecordInvoicePayment} onCreateBill={handleCreateBill} onPayBill={handlePayBill} showToast={showToast} />}

                    {(activeTab.value === 'langganan' || activeTab.value === 'aset') && <LanggananDanAset key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} langganan={langganan.value} assets={assets.value} onAddLangganan={handleAddLangganan} onDeleteLangganan={handleDeleteLangganan} onAddAsset={handleAddAsset} showToast={showToast} />}

                    {(activeTab.value === 'sdm' || activeTab.value === 'perpajakan') && <SdmDanPajak key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} pegawai={pegawai.value} akun={akun.value} taxes={taxes.value} taxSummary={taxSummary.value} taxCalculationData={taxCalculation.value} onAddJournalFromSubledger={handleAddJournalFromSubledger} onCreateTax={handleCreateTax} onPayTax={handlePayTax} showToast={showToast} />}

                    {(activeTab.value === 'proyeksi' || activeTab.value === 'laporan') && <ProyeksiDanLaporan key={`${activeTab.value}-${dataVersion.value}`} activeSection={activeTab.value} akun={akun.value} transaksi={transaksi.value} proyek={proyek.value} projectionData={projectionData.value} reportData={reportData.value} onSaveProjection={handleSaveProjection} showToast={showToast} />}

                    {activeTab.value === 'pengaturan' && <PengaturanView userEmail={userEmail.value} showToast={showToast} />}
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
          y: 50,
          scale: 0.9
        }} animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }} exit={{
          opacity: 0,
          y: 20,
          scale: 0.95
        }} class="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-blue-900/60 shadow-2xl px-5 py-3.5 rounded-2xl flex items-center gap-3 text-white text-xs max-w-sm">
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
