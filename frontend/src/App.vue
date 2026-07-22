<template>
  <MaintenanceView v-if="maintenanceMode" />

  <div
    v-else
    class="min-h-screen bg-[#F7F9FC] text-slate-800 antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden relative"
  >
    <Transition name="screen" mode="out-in">
      <SplashScreen
        v-if="screen === 'splash'"
        key="splash"
        @complete="navigateToScreen(splashDestination)"
      />

      <LandingPage
        v-else-if="screen === 'landing'"
        key="landing"
        @login="navigateToScreen('login')"
      />

      <Login
        v-else-if="screen === 'login'"
        key="login"
        @login-success="handleLoginSuccess"
        @back="navigateToScreen('landing')"
      />

      <LoadingScreen
        v-else-if="screen === 'auth-loading'"
        key="auth-loading"
        :email="userEmail"
      />

      <div
        v-else
        key="dashboard"
        class="app-shell dashboard-shell-enter flex flex-col xl:flex-row h-screen overflow-hidden"
      >
        <Sidebar
          :active-tab="activeTab"
          :is-collapsed="isSidebarCollapsed"
          :allowed-tabs="allowedTabs"
          @select-tab="selectWorkspace"
          @toggle-sidebar="toggleSidebar"
          @logout="handleLogout"
        />

        <button
          id="btn-sidebar-drawer"
          type="button"
          class="dashboard-sidebar-drawer-enter flex hover:!bg-[#0B3A78] hover:!text-white"
          :style="sidebarToggleStyle"
          :title="
            isSidebarCollapsed
              ? 'Tampilkan teks sidebar'
              : 'Sembunyikan teks sidebar'
          "
          :aria-label="
            isSidebarCollapsed
              ? 'Tampilkan teks sidebar'
              : 'Sembunyikan teks sidebar'
          "
          @click="toggleSidebar"
        >
          <ChevronRight v-if="isSidebarCollapsed" class="h-3 w-3" />
          <ChevronLeft v-else class="h-3 w-3" />
        </button>

        <div
          class="app-workspace flex-1 flex flex-col h-screen min-w-0 overflow-hidden"
          :style="{ '--sidebar-offset': isSidebarCollapsed ? '72px' : '286px' }"
        >
          <div class="dashboard-topbar-enter">
            <Topbar
              :user-email="userEmail"
              :user-role="userRole"
              :notifications="notifications"
              @logout="handleLogout"
              @open-settings="selectWorkspace('pengaturan')"
            />
          </div>

          <main
            class="app-main dashboard-content-enter flex-1 w-full overflow-y-auto px-5 py-7 md:px-10 md:py-10 xl:px-12 xl:py-12"
          >
            <Transition name="tab" mode="out-in">
              <section
                :key="activeTab"
                class="mx-auto min-h-full w-full max-w-7xl"
              >
                <DashboardView
                  v-if="activeTab === 'dashboard'"
                  :key="`dashboard-${dataVersion}`"
                  :proyek="proyek"
                  :klien="klien"
                  :akun="akun"
                  :transaksi="transaksi"
                  :langganan="langganan"
                  :dashboard="dashboardSummary"
                  :invoices="invoices"
                  :bills="bills"
                  :assets="assets"
                  :taxes="taxes"
                  :pegawai="pegawai"
                  :projection-data="projectionData"
                  :report-data="reportData"
                />

                <CrmView
                  v-else-if="activeTab === 'crm'"
                  :key="`crm-${dataVersion}`"
                  :proyek="proyek"
                  :klien="klien"
                  :pegawai="pegawai"
                />

                <CrmView
                  v-else-if="activeTab === 'master-klien'"
                  :key="`master-klien-${dataVersion}`"
                  :proyek="proyek"
                  :klien="klien"
                  :pegawai="pegawai"
                  view-mode="client-master"
                />

                <CrmView
                  v-else-if="activeTab === 'crm-riwayat'"
                  :key="`crm-riwayat-${dataVersion}`"
                  :proyek="proyek"
                  :klien="klien"
                  :pegawai="pegawai"
                  view-mode="riwayat"
                />

                <BukuBesarDanTransaksi
                  v-else-if="
                    activeTab === 'bukubesar' || activeTab === 'transaksi'
                  "
                  :key="`${activeTab}-${dataVersion}`"
                  :active-section="activeTab"
                  :akun="akun"
                  :transaksi="transaksi"
                  :divisions="divisions"
                  :user-role="userRole"
                />

                <PiutangDanUtang
                  v-else-if="
                    activeTab === 'piutang' ||
                    activeTab === 'piutang-pelunasan' ||
                    activeTab === 'utang' ||
                    activeTab === 'utang-pembayaran'
                  "
                  :key="`${activeTab}-${dataVersion}`"
                  :active-section="
                    activeTab.startsWith('piutang') ? 'piutang' : 'utang'
                  "
                  :view-mode="
                    activeTab === 'piutang-pelunasan' ||
                    activeTab === 'utang-pembayaran'
                      ? 'settlement'
                      : 'kelola'
                  "
                  :proyek="proyek"
                  :klien="klien"
                  :akun="akun"
                  :invoices="invoices"
                  :bills="bills"
                />

                <LanggananDanAset
                  v-else-if="
                    activeTab === 'langganan' ||
                    activeTab === 'aset' ||
                    activeTab === 'aset-kategori' ||
                    activeTab === 'aset-riwayat' ||
                    activeTab === 'langganan-riwayat-transaksi' ||
                    activeTab === 'langganan-tagihan' ||
                    activeTab === 'langganan-riwayat-kadaluarsa'
                  "
                  :key="`${activeTab}-${dataVersion}`"
                  :active-section="activeTab"
                  :langganan="langganan"
                  :assets="assets"
                />

                <SdmDanPajak
                  v-else-if="
                    activeTab === 'sdm' ||
                    activeTab === 'sdm-bpjs' ||
                    activeTab === 'sdm-divisi-jabatan' ||
                    activeTab === 'sdm-riwayat-penggajian' ||
                    activeTab === 'sdm-proses-payroll' ||
                    activeTab === 'perpajakan'
                  "
                  :key="`${activeTab}-${dataVersion}`"
                  :active-section="activeTab"
                  :pegawai="pegawai"
                  :akun="akun"
                  :taxes="taxes"
                  :tax-summary="taxSummary"
                  :tax-calculation-data="taxCalculation"
                />

                <ProyeksiDanLaporan
                  v-else-if="
                    activeTab === 'proyeksi' ||
                    activeTab.startsWith('proyeksi-') ||
                    activeTab === 'laporan' ||
                    activeTab.startsWith('laporan-')
                  "
                  :key="`${activeTab}-${dataVersion}`"
                  :active-section="activeTab"
                  :akun="akun"
                  :transaksi="transaksi"
                  :proyek="proyek"
                  :divisions="divisions"
                  :projection-data="projectionData"
                  :report-data="reportData"
                  :report-period="selectedReportPeriod"
                  :report-error="reportError"
                />

                <PengaturanView
                  v-else
                  :active-section="activeTab"
                  :user-email="userEmail"
                  :user-role="userRole"
                />
              </section>
            </Transition>
          </main>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div
        v-if="toast.visible"
        id="global-toast-alert"
        class="fixed left-1/2 top-6 z-[10050] w-[min(92vw,440px)] -translate-x-1/2 bg-[#0F172A] border border-blue-900/60 shadow-2xl px-5 py-3.5 rounded-2xl flex items-center gap-3 text-white text-xs"
      >
        <div
          class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0"
        >
          <CheckCircle class="w-3.5 h-3.5 text-white" />
        </div>
        <div class="flex-1">
          <p class="font-bold text-cyan-300">Sistem Notifikasi</p>
          <p class="text-slate-200 mt-0.5 leading-relaxed font-light">
            {{ toast.message }}
          </p>
        </div>
        <button
          id="btn-close-toast"
          type="button"
          class="text-slate-400 hover:text-white ml-2 focus:outline-none shrink-0"
          @click="hideToast"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  type CSSProperties,
} from "vue";
import { CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-vue-next";

import SplashScreen from "./components/SplashScreen.vue";
import LandingPage from "./components/LandingPage.vue";
import Login from "./components/Login.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
import Sidebar from "./components/Sidebar.vue";
import Topbar from "./components/Topbar.vue";
import MaintenanceView from "./components/MaintenanceView.vue";
import { useAssetActions } from "./composables/useAssetActions";
import { useFinStartApp } from "./composables/useFinStartApp";
import { provideFinStartContext } from "./composables/useFinStartContext";
import { useLedgerActions } from "./composables/useLedgerActions";
import { usePlanningActions } from "./composables/usePlanningActions";
import { useReceivableActions } from "./composables/useReceivableActions";
import { useTaxActions } from "./composables/useTaxActions";

const maintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE === "true";

// Modul dashboard yang besar dimuat ketika dibutuhkan agar bundle awal tetap ringan.
const DashboardView = defineAsyncComponent(
  () => import("./components/DashboardView.vue"),
);
const CrmView = defineAsyncComponent(() => import("./components/CrmView.vue"));
const BukuBesarDanTransaksi = defineAsyncComponent(
  () => import("./components/BukuBesarDanTransaksi.vue"),
);
const PiutangDanUtang = defineAsyncComponent(
  () => import("./components/PiutangDanUtang.vue"),
);
const LanggananDanAset = defineAsyncComponent(
  () => import("./components/LanggananDanAset.vue"),
);
const SdmDanPajak = defineAsyncComponent(
  () => import("./components/SdmDanPajak.vue"),
);
const ProyeksiDanLaporan = defineAsyncComponent(
  () => import("./components/ProyeksiDanLaporan.vue"),
);
const PengaturanView = defineAsyncComponent(
  () => import("./components/PengaturanView.vue"),
);

const app = useFinStartApp();
const {
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
} = app;

const refreshData = async (options: { bumpVersion?: boolean } = {}) => {
  await loadFinancialData({ silent: true, bumpVersion: options.bumpVersion });
};

const ledgerActions = useLedgerActions({
  accounts: akun,
  refreshData,
  notify: showToast,
});
const receivableActions = useReceivableActions({
  projects: proyek,
  accounts: akun,
  refreshData,
  notify: showToast,
});
const assetActions = useAssetActions({
  subscriptions: langganan,
  accounts: akun,
  refreshData,
  notify: showToast,
});
const taxActions = useTaxActions({
  accounts: akun,
  refreshData,
  notify: showToast,
});
const planningActions = usePlanningActions({
  projectionData,
  projectionScenario,
  refreshData,
  notify: showToast,
});

provideFinStartContext({
  notify: showToast,
  refreshData,
  selectWorkspace,
  quickAction: handleQuickAction,
  ledger: ledgerActions,
  receivables: receivableActions,
  assets: assetActions,
  tax: taxActions,
  planning: {
    selectReportPeriod: handleSelectReportPeriod,
    ...planningActions,
  },
});

const sidebarToggleStyle = computed<CSSProperties>(() => ({
  position: "fixed",
  left: isSidebarCollapsed.value ? "72px" : "286px",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 99999,
  width: "16px",
  height: "40px",
  alignItems: "center",
  justifyContent: "center",
  borderTop: "1.5px solid #BFD3EA",
  borderRight: "1.5px solid #BFD3EA",
  borderBottom: "1.5px solid #BFD3EA",
  borderLeft: 0,
  borderRadius: "0 10px 10px 0",
  background: "#E8F0FB",
  color: "#1E5AA8",
  boxShadow: "4px 0 18px rgba(16,42,86,0.12)",
  transition: "left 240ms ease, background 180ms ease, color 180ms ease",
}));
</script>
