import { onMounted, onUnmounted, ref } from "vue";
import {
  clearAuthSession,
  financeApi,
  getApiErrorMessage,
  getStoredAuthUser,
  hasAuthSession,
} from "../services/financeApi.js";
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
} from "../services/financeMappers.js";

const ACTIVE_TAB_KEY = "finstart-ui-active-tab";
const VALID_TABS = [
  "dashboard",
  "crm",
  "bukubesar",
  "transaksi",
  "piutang",
  "utang",
  "langganan",
  "aset",
  "master-klien",
  "sdm",
  "perpajakan",
  "proyeksi",
  "laporan",
  "pengaturan",
];

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function toNumber(value: any) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function formatNotificationTime(value: any) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Baru saja";
  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 60000),
  );
  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)} jam lalu`;
  return date.toLocaleDateString("id-ID");
}

function mapEmployee(row: any) {
  const employmentLabels: Record<string, string> = {
    permanent: "Tetap",
    contract: "Kontrak",
    intern: "Magang",
    freelance: "Freelance",
    daily: "Harian",
  };

  return {
    id: row.employee_code || `EMP-${row.id}`,
    dbId: Number(row.id || 0),
    nama: row.full_name || row.employee_name || row.name || "-",
    jabatan: row.position_name || row.position || "-",
    status:
      employmentLabels[String(row.employment_type || "").toLowerCase()] ||
      "Karyawan",
    statusAktif:
      String(row.employment_status || row.status || "active").toLowerCase() ===
      "inactive"
        ? "Nonaktif"
        : "Aktif",
    compliance:
      String(row.bpjs_status || "").toLowerCase() === "active"
        ? "Patuh"
        : "Tinjauan",
    gajiBersih: toNumber(row.base_salary ?? row.salary),
    _raw: row,
  };
}

function getSavedUserEmail() {
  return getStoredAuthUser()?.email || "";
}

function getSavedActiveTab() {
  if (typeof window === "undefined") return "dashboard";
  const saved = localStorage.getItem(ACTIVE_TAB_KEY) || "dashboard";
  return VALID_TABS.includes(saved) ? saved : "dashboard";
}

function normalizeAllowedTabs(tabs: string[]) {
  const allowed = tabs.filter((tab: string) => VALID_TABS.includes(tab));
  if (allowed.includes("crm") && !allowed.includes("master-klien")) {
    allowed.push("master-klien");
  }
  return allowed;
}

function clearSavedSession() {
  if (typeof window === "undefined") return;
  clearAuthSession();
}

export function useFinStartApp() {
  const hasSavedSession = hasAuthSession();
  const splashDestination = hasSavedSession ? "dashboard" : "landing";
  const screen = ref("splash");
  const navigateToScreen = (next: any) => {
    screen.value = next;
  };
  const activeTab = ref(hasSavedSession ? getSavedActiveTab() : "dashboard");
  const selectWorkspace = (workspace: string) => {
    activeTab.value = VALID_TABS.includes(workspace) ? workspace : "dashboard";
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTab.value);
    }
  };
  const userEmail = ref(getSavedUserEmail());
  const userRole = ref(String(getStoredAuthUser()?.role_name || "auditor"));
  const allowedTabs = ref<string[]>(
    Array.isArray(getStoredAuthUser()?.allowed_tabs) &&
      getStoredAuthUser()?.allowed_tabs?.length
      ? normalizeAllowedTabs(getStoredAuthUser()?.allowed_tabs)
      : VALID_TABS,
  );
  const applyAuthenticatedUser = (user: any = {}) => {
    userEmail.value = user?.email || getSavedUserEmail();
    userRole.value = String(user?.role_name || userRole.value || "auditor");
    const nextAllowedTabs =
      Array.isArray(user?.allowed_tabs) && user.allowed_tabs.length
        ? normalizeAllowedTabs(user.allowed_tabs)
        : VALID_TABS;
    allowedTabs.value = nextAllowedTabs.length
      ? nextAllowedTabs
      : ["dashboard"];
    if (!allowedTabs.value.includes(activeTab.value)) {
      selectWorkspace(
        allowedTabs.value.includes("dashboard")
          ? "dashboard"
          : allowedTabs.value[0],
      );
    }
  };
  const isSidebarCollapsed = ref(window.innerWidth < 1280);
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };

  if (typeof window !== "undefined") {
    const mql = window.matchMedia("(min-width: 1280px)");
    const onBreakpoint = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!e.matches) isSidebarCollapsed.value = true;
    };
    mql.addEventListener("change", onBreakpoint);
    onBreakpoint(mql);
  }

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
    cash_balance: 0,
    total_receivable: 0,
    total_payable: 0,
    total_revenue: 0,
    total_expense: 0,
    net_profit: 0,
    active_projects: 0,
    cashflow_series: [],
    recent_transactions: [],
  });
  const taxSummary = ref<any>({
    total_unpaid: 0,
    total_paid: 0,
    total_overdue: 0,
  });
  const taxCalculation = ref<any>({ revenue: 0, expense: 0, net_profit: 0 });
  const projectionData = ref<any>({
    year: new Date().getFullYear(),
    months: [],
    summary: {},
  });
  const projectionScenario = ref("normal");

  // Laporan selalu membaca API. Periode dipilih dari jurnal posted agar data
  // tidak menjadi Rp0 hanya karena tanggal browser tidak cocok dengan data.
  const selectedReportPeriod = ref("");
  const availableReportPeriods = ref<any[]>([]);
  const reportError = ref("");
  const reportData = ref<any>({
    income_statement: {},
    balance_sheet: {},
    cash_flow: {},
  });
  const dataVersion = ref(0);

  const notifications = ref<any[]>([]);

  const toast = ref({ message: "", visible: false });
  const hideToast = () => {
    toast.value = { message: "", visible: false };
  };
  const showToast = (message: string) => {
    toast.value = { message, visible: true };
    window.setTimeout(hideToast, 4000);
  };

  function replaceList(target: any, values: any[]) {
    target.value.splice(
      0,
      target.value.length,
      ...(Array.isArray(values) ? values : []),
    );
  }

  async function loadReportData(
    period: string,
    options: { silent?: boolean } = {},
  ) {
    const resolvedPeriod = /^\d{4}-\d{2}$/.test(String(period || ""))
      ? String(period)
      : currentPeriod();

    reportError.value = "";
    try {
      const data = await financeApi.get("/reports", { period: resolvedPeriod });
      reportData.value = data || {
        income_statement: {},
        balance_sheet: {},
        cash_flow: {},
      };
      selectedReportPeriod.value = data?.period || resolvedPeriod;
      return true;
    } catch (error) {
      console.error("Gagal memuat laporan", error);
      reportData.value = {
        income_statement: {},
        balance_sheet: {},
        cash_flow: {},
      };
      reportError.value = getApiErrorMessage(
        error,
        "Laporan tidak dapat dimuat dari API.",
      );
      if (!options.silent) showToast(reportError.value);
      return false;
    }
  }

  const handleSelectReportPeriod = async (period: string) => {
    const ok = await loadReportData(period);
    if (ok) {
      dataVersion.value += 1;
      showToast(
        `Laporan periode ${reportData.value?.period_label || period} berhasil dimuat dari API.`,
      );
    }
  };

  async function loadFinancialData(
    options: { silent?: boolean; bumpVersion?: boolean } = {},
  ) {
    const period = currentPeriod();
    const year = new Date().getFullYear();

    // Tentukan periode laporan dari jurnal posted, bukan semata tanggal perangkat.
    try {
      const periods = await financeApi.get("/reports/periods");
      availableReportPeriods.value = Array.isArray(periods) ? periods : [];
      const available = availableReportPeriods.value.map((item: any) =>
        String(item.period),
      );
      const preferred =
        selectedReportPeriod.value &&
        available.includes(selectedReportPeriod.value)
          ? selectedReportPeriod.value
          : available.includes(period)
            ? period
            : available[0] || period;
      selectedReportPeriod.value = preferred;
    } catch (error) {
      availableReportPeriods.value = [];
      selectedReportPeriod.value = selectedReportPeriod.value || period;
      reportError.value = getApiErrorMessage(
        error,
        "Daftar periode laporan tidak dapat dimuat.",
      );
    }

    const jobs = await Promise.allSettled([
      financeApi.get("/clients"),
      financeApi.get("/projects"),
      financeApi.get("/accounts"),
      financeApi.get("/journal-transactions"),
      financeApi.get("/subscriptions"),
      financeApi.get("/assets"),
      financeApi.get("/invoices"),
      financeApi.get("/bills"),
      financeApi.get("/taxes"),
      financeApi.get("/taxes/summary"),
      financeApi.get("/taxes/calculation", { period }),
      financeApi.get("/projections", {
        year,
        scenario: projectionScenario.value,
      }),
      financeApi.get("/reports", {
        period: selectedReportPeriod.value || period,
      }),
      financeApi.get("/dashboard/summary"),
      financeApi.get("/employees"),
      financeApi.get("/divisions"),
      financeApi.get("/notifications", { limit: 8 }),
    ]);

    const value = (index: number, fallback: any = []) =>
      jobs[index].status === "fulfilled"
        ? (jobs[index] as PromiseFulfilledResult<any>).value
        : fallback;
    replaceList(klien, (value(0) || []).map(mapClient));
    replaceList(proyek, (value(1) || []).map(mapProject));
    replaceList(akun, (value(2) || []).map(mapAccount));
    replaceList(transaksi, (value(3) || []).map(mapJournalTransaction));

    const subscriptionsResponse = value(4, {});
    replaceList(
      langganan,
      (
        (subscriptionsResponse?.subscriptions ||
          subscriptionsResponse ||
          []) as any[]
      ).map(mapSubscription),
    );

    const assetsResponse = value(5, {});
    replaceList(
      assets,
      ((assetsResponse?.assets || assetsResponse || []) as any[]).map(mapAsset),
    );
    replaceList(invoices, (value(6) || []).map(mapInvoice));
    replaceList(bills, (value(7) || []).map(mapBill));
    replaceList(taxes, (value(8) || []).map(mapTax));
    Object.assign(taxSummary.value, value(9, {}));
    Object.assign(taxCalculation.value, value(10, {}));
    Object.assign(projectionData.value, value(11, {}));
    if (jobs[12].status === "fulfilled") {
      reportData.value = value(12, {}) || {
        income_statement: {},
        balance_sheet: {},
        cash_flow: {},
      };
      reportError.value = "";
      selectedReportPeriod.value =
        reportData.value?.period || selectedReportPeriod.value || period;
    } else {
      reportData.value = {
        income_statement: {},
        balance_sheet: {},
        cash_flow: {},
      };
      reportError.value = getApiErrorMessage(
        (jobs[12] as PromiseRejectedResult).reason,
        "Laporan tidak dapat dimuat dari API.",
      );
    }
    Object.assign(dashboardSummary.value, value(13, {}));
    replaceList(pegawai, (value(14) || []).map(mapEmployee));
    replaceList(divisions, value(15) || []);
    notifications.value = (value(16) || []).map((item: any) => ({
      id: String(item.id),
      text: item.message || item.title || "Aktivitas sistem baru.",
      type: ["warning", "success", "info"].includes(
        String(item.type || "").toLowerCase(),
      )
        ? String(item.type).toLowerCase()
        : "info",
      time: formatNotificationTime(item.created_at),
      is_read: Boolean(item.is_read),
    }));
    if (options.bumpVersion !== false) {
      dataVersion.value += 1;
    }

    const failed = jobs.filter((job) => job.status === "rejected");
    if (failed.length && !options.silent) {
      showToast(
        "Sebagian data belum dapat dimuat. Pastikan backend FinStart aktif di http://localhost:4000.",
      );
    }
    return failed.length === 0;
  }

  const handleQuickAction = (action: string) => {
    if (action === "entri_jurnal") {
      selectWorkspace("transaksi");
      showToast(
        'Navigasi ke Transaksi Jurnal. Klik tombol "Entri Jurnal Baru"',
      );
    } else if (action === "buat_invoice") {
      selectWorkspace("piutang");
      showToast('Navigasi ke Piutang Usaha. Klik tombol "Buat Invoice Baru"');
    } else if (action === "tambah_proyek") {
      selectWorkspace("crm");
      showToast('Navigasi ke CRM & Proyek. Klik tombol "Inisiasi Proyek Baru"');
    }
  };

  const handleLoginSuccess = (session: any) => {
    const email = session?.user?.email || getSavedUserEmail();
    applyAuthenticatedUser(session?.user || {});
    navigateToScreen("auth-loading");

    loadFinancialData({ silent: true }).catch(() => {
      // Data tetap bisa dimuat ulang dari dashboard.
    });

    window.setTimeout(() => {
      navigateToScreen("dashboard");
      showToast(`Otentikasi berhasil. Selamat datang ${email.split("@")[0]}!`);
    }, 3000);
  };
  const handleLogout = async () => {
    try {
      await financeApi.logout();
    } catch (error) {
      console.warn(error);
    }
    clearSavedSession();
    selectWorkspace("dashboard");
    localStorage.removeItem(ACTIVE_TAB_KEY);
    navigateToScreen("landing");
    showToast("Sesi ditutup. Anda berhasil keluar sistem.");
  };

  let authExpiredHandler: (() => void) | undefined;

  onMounted(() => {
    authExpiredHandler = () => {
      clearSavedSession();
      selectWorkspace("dashboard");
      navigateToScreen("login");
      showToast("Sesi server berakhir. Silakan login ulang.");
    };
    window.addEventListener("finstart-auth-expired", authExpiredHandler);

    if (hasSavedSession) {
      financeApi
        .me()
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
      window.removeEventListener("finstart-auth-expired", authExpiredHandler);
    }
  });

  return {
    splashDestination,
    screen,
    navigateToScreen,
    activeTab,
    selectWorkspace,
    userEmail,
    userRole,
    allowedTabs,
    isSidebarCollapsed,
    toggleSidebar,
    proyek,
    klien,
    akun,
    transaksi,
    langganan,
    invoices,
    bills,
    assets,
    taxes,
    pegawai,
    divisions,
    dashboardSummary,
    taxSummary,
    taxCalculation,
    projectionData,
    projectionScenario,
    selectedReportPeriod,
    availableReportPeriods,
    reportError,
    reportData,
    dataVersion,
    notifications,
    toast,
    hideToast,
    showToast,
    handleLoginSuccess,
    handleLogout,
    loadFinancialData,
    handleQuickAction,
    handleSelectReportPeriod,
  };
}
