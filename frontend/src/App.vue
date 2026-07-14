<template>
  <div
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
          class="dashboard-sidebar-drawer-enter hidden xl:flex hover:!bg-[#0B3A78] hover:!text-white"
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
          <ChevronRight v-if="isSidebarCollapsed" class="h-5 w-5" />
          <ChevronLeft v-else class="h-5 w-5" />
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
                  v-else-if="activeTab === 'piutang' || activeTab === 'utang'"
                  :key="`${activeTab}-${dataVersion}`"
                  :active-section="activeTab"
                  :proyek="proyek"
                  :klien="klien"
                  :akun="akun"
                  :invoices="invoices"
                  :bills="bills"
                />

                <LanggananDanAset
                  v-else-if="activeTab === 'langganan' || activeTab === 'aset'"
                  :key="`${activeTab}-${dataVersion}`"
                  :active-section="activeTab"
                  :langganan="langganan"
                  :assets="assets"
                />

                <SdmDanPajak
                  v-else-if="activeTab === 'sdm' || activeTab === 'perpajakan'"
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
                    activeTab === 'proyeksi' || activeTab === 'laporan'
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
                  :report-periods="availableReportPeriods"
                  :report-error="reportError"
                />

                <PengaturanView
                  v-else
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
import { useAssetActions } from "./composables/useAssetActions";
import { useFinStartApp } from "./composables/useFinStartApp";
import { provideFinStartContext } from "./composables/useFinStartContext";
import { useLedgerActions } from "./composables/useLedgerActions";
import { usePlanningActions } from "./composables/usePlanningActions";
import { useReceivableActions } from "./composables/useReceivableActions";
import { useTaxActions } from "./composables/useTaxActions";

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
} = app;

const refreshData = async () => {
  await loadFinancialData({ silent: true, bumpVersion: false });
};

type PageGuide = {
  eyebrow: string;
  title: string;
  purpose: string;
  steps: [string, string, string];
  output: string;
};

const pageGuides: Record<string, PageGuide> = {
  dashboard: {
    eyebrow: "Ringkasan Operasional",
    title: "Dashboard",
    purpose:
      "Pantau kondisi bisnis hari ini dari data yang sudah tercatat di sistem.",
    steps: [
      "Cek angka utama",
      "Lihat aktivitas terbaru",
      "Buka modul yang perlu ditindaklanjuti",
    ],
    output: "keputusan harian lebih cepat tanpa membuka semua halaman.",
  },
  crm: {
    eyebrow: "Operasional Proyek",
    title: "CRM & Proyek",
    purpose:
      "Kelola proyek dari data klien, tim, tenggat, sampai status pekerjaan.",
    steps: [
      "Input atau pilih klien",
      "Buat proyek dan penanggung jawab",
      "Pantau progres serta profit",
    ],
    output: "proyek tercatat rapi dan mudah dilacak sampai selesai.",
  },
  "master-klien": {
    eyebrow: "Master Data",
    title: "Klien Partner",
    purpose:
      "Simpan data klien dan vendor agar bisa dipakai ulang di proyek, invoice, dan tagihan.",
    steps: [
      "Lengkapi identitas partner",
      "Gunakan saat transaksi",
      "Perbarui bila data berubah",
    ],
    output: "data partner konsisten di seluruh proses keuangan.",
  },
  langganan: {
    eyebrow: "Kontrol Layanan Berkala",
    title: "Langganan",
    purpose:
      "Catat biaya layanan rutin dan pantau tanggal tagihan berikutnya.",
    steps: [
      "Input layanan aktif",
      "Pantau jatuh tempo",
      "Arsipkan layanan berhenti",
    ],
    output: "tagihan langganan tidak terlewat dan status layanan jelas.",
  },
  aset: {
    eyebrow: "Aset Tetap",
    title: "Aset Tetap",
    purpose:
      "Kelola daftar aset perusahaan dan proses penyusutan bulanan ke jurnal.",
    steps: [
      "Catat data aset",
      "Pilih periode penyusutan",
      "Posting hasil ke jurnal",
    ],
    output: "nilai aset dan beban penyusutan tercatat akurat.",
  },
  sdm: {
    eyebrow: "Payroll",
    title: "SDM & Payroll",
    purpose:
      "Kelola pegawai, divisi, jabatan, BPJS, dan proses payroll bulanan.",
    steps: [
      "Atur data dasar pegawai",
      "Proses payroll periode berjalan",
      "Cetak dan posting payroll",
    ],
    output: "gaji, potongan, pajak, dan jurnal payroll tersimpan jelas.",
  },
  perpajakan: {
    eyebrow: "Kewajiban Pajak",
    title: "Perpajakan",
    purpose:
      "Pantau pajak yang belum dibayar dan riwayat setoran yang sudah dicatat.",
    steps: [
      "Cek pajak belum dibayar",
      "Catat setoran/NTPN",
      "Lihat riwayat pembayaran",
    ],
    output: "status pajak mudah dibaca dan bukti setor tersimpan.",
  },
  bukubesar: {
    eyebrow: "Chart of Accounts",
    title: "Buku Besar",
    purpose:
      "Kelola daftar akun yang menjadi dasar pencatatan seluruh jurnal.",
    steps: [
      "Periksa akun aktif",
      "Tambah atau rapikan akun",
      "Gunakan akun pada transaksi",
    ],
    output: "struktur akun rapi dan laporan keuangan lebih mudah disusun.",
  },
  transaksi: {
    eyebrow: "Jurnal",
    title: "Jurnal & Transaksi",
    purpose:
      "Lihat dan kelola semua transaksi yang sudah masuk ke jurnal.",
    steps: [
      "Cari transaksi atau voucher",
      "Periksa debit/kredit",
      "Unduh detail bila diperlukan",
    ],
    output: "jejak transaksi utama bisa diaudit dari satu tempat.",
  },
  piutang: {
    eyebrow: "Arus Kas Masuk",
    title: "Piutang",
    purpose:
      "Kelola invoice pelanggan dari penerbitan sampai pelunasan.",
    steps: [
      "Terbitkan invoice",
      "Pantau outstanding",
      "Catat pelunasan",
    ],
    output: "status piutang berubah otomatis dan transaksi masuk jurnal.",
  },
  utang: {
    eyebrow: "Arus Kas Keluar",
    title: "Utang",
    purpose:
      "Kelola tagihan vendor dari pencatatan sampai pembayaran.",
    steps: [
      "Catat tagihan vendor",
      "Pantau jatuh tempo",
      "Catat pembayaran",
    ],
    output: "utang terbayar hilang dari daftar outstanding dan masuk jurnal.",
  },
  proyeksi: {
    eyebrow: "Rencana Keuangan",
    title: "Proyeksi Bisnis",
    purpose:
      "Bandingkan target bulanan dengan realisasi dari jurnal untuk membaca arah bisnis.",
    steps: [
      "Isi target bulan",
      "Bandingkan realisasi",
      "Evaluasi forecast",
    ],
    output: "rencana bisnis lebih mudah dipantau tanpa input ganda.",
  },
  laporan: {
    eyebrow: "Laporan",
    title: "Laporan Keuangan",
    purpose:
      "Tampilkan laporan berdasarkan transaksi yang sudah diposting.",
    steps: [
      "Pilih periode laporan",
      "Periksa ringkasan",
      "Cetak atau unduh laporan",
    ],
    output: "laporan siap dibaca dari data jurnal yang sudah valid.",
  },
  pengaturan: {
    eyebrow: "Sistem",
    title: "Pengaturan",
    purpose:
      "Atur preferensi workspace dan informasi akun yang dipakai di aplikasi.",
    steps: [
      "Periksa profil workspace",
      "Sesuaikan preferensi",
      "Simpan perubahan",
    ],
    output: "workspace tetap sesuai kebutuhan operasional.",
  },
};

const activePageGuide = computed<PageGuide>(
  () => pageGuides[activeTab.value] ?? pageGuides.dashboard,
);

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
  top: "54%",
  transform: "translateY(-50%)",
  zIndex: 99999,
  width: "34px",
  height: "54px",
  alignItems: "center",
  justifyContent: "center",
  borderTop: "1px solid #D8E5F4",
  borderRight: "1px solid #D8E5F4",
  borderBottom: "1px solid #D8E5F4",
  borderLeft: 0,
  borderRadius: "0 14px 14px 0",
  background: "#FFFFFF",
  color: "#102A56",
  boxShadow: "0 12px 26px rgba(16,42,86,0.14)",
  transition: "left 240ms ease, background 180ms ease, color 180ms ease",
}));
</script>
