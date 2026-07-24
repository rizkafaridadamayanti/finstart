<template>
  <div class="space-y-7 font-sans">
    <header
      class="workspace-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <p
          class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]"
        >
          Konfigurasi Finstart
        </p>
        <h1
          class="mt-1 text-[20px] sm:text-[26px] font-semibold tracking-tight text-[#0B1F4A]"
        >
          Pengaturan Sistem
        </h1>
        <p class="mt-1 text-sm text-[#6B7A90]">
          Kelola identitas perusahaan, keamanan akses, dan aktivitas yang
          benar-benar tersimpan di server.
        </p>
      </div>
    </header>
    <form
      v-if="activeTab === 'profile'"
      class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      @submit="handleSaveProfile"
    >
      <div
        class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-3.5">
          <span
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"
            ><Building2 class="h-6 w-6"
          /></span>
          <div>
            <h2 class="text-lg font-semibold text-[#0B1F4A]">
              Profil Perusahaan
            </h2>
            <p class="mt-1 text-sm text-[#6B7A90]">
              FinStart internal menggunakan Rupiah (IDR); kurs dan
              multi-currency belum diaktifkan.
            </p>
          </div>
        </div>
        <span
          class="w-fit rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#53658A]"
          >Business profile</span
        >
      </div>
      <div class="grid gap-5 px-6 py-7 md:grid-cols-2">
        <label class="space-y-2"
          ><span :class="labelClass">Nama Entitas Bisnis</span
          ><input
            :value="profile.namaEntitas"
            :class="inputClass"
            @change="profile = { ...profile, namaEntitas: eventValue($event) }" /></label
        ><label class="space-y-2"
          ><span :class="labelClass">NPWP Badan</span
          ><input
            :value="profile.npwp"
            :class="inputClass"
            @change="profile = { ...profile, npwp: eventValue($event) }" /></label
        ><label class="space-y-2"
          ><span :class="labelClass">Mata Uang Dasar</span
          ><input
            value="IDR - Indonesian Rupiah"
            disabled
            :class="`${inputClass} cursor-not-allowed bg-[#F8FBFE] text-[#70819B]`" /></label
        ><label class="space-y-2"
          ><span :class="labelClass">Tahun Fiskal Dimulai</span
          ><select
            :value="profile.tahunFiskal"
            :class="inputClass"
            @change="profile = { ...profile, tahunFiskal: eventValue($event) }"
          >
            <option
              v-for="item in ['Januari', 'April', 'Juli', 'Oktober']"
              :key="item"
            >
              {{ item }}
            </option>
          </select></label
        ><label class="space-y-2 md:col-span-2"
          ><span :class="labelClass">Alamat Kantor Pusat</span
          ><textarea
            :rows="4"
            :value="profile.alamat"
            class="min-h-[128px] w-full resize-y rounded-xl border border-[#D8E5F4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
            @change="profile = { ...profile, alamat: eventValue($event) }"
          />
        </label>
      </div>
      <footer
        class="flex flex-col gap-3 border-t border-[#E8EEF7] bg-[#FBFDFF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm text-[#6B7A90]">
          Perubahan tersimpan pada konfigurasi workspace ini.
        </p>
        <button
          type="submit"
          :disabled="isSavingProfile"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save class="h-4 w-4" /><template v-if="isSavingProfile"
            >Menyimpan...</template
          ><template v-else>Simpan Perubahan</template>
        </button>
      </footer>
    </form>
    <div v-else class="space-y-5">
      <div
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-3.5">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"
              ><Shield class="h-6 w-6"
            /></span>
            <div>
              <h2 class="text-lg font-semibold text-[#0B1F4A]">
                Keamanan &amp; Akses
              </h2>
              <p class="mt-1 text-sm text-[#6B7A90]">
                Data role, sesi, dan aktivitas di bawah ini diambil dari API
                server.
              </p>
            </div>
          </div>
        </div>
        <div class="grid gap-4 px-6 py-6 md:grid-cols-2">
          <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"
              ><Users class="h-4 w-4"
            /></span>
            <p class="mt-4 text-2xl font-semibold text-[#0B1F4A]">
              {{ users.length || "-" }}
            </p>
            <p class="mt-1 text-sm font-medium text-[#53658A]">
              Pengguna terdaftar
            </p>
            <p class="mt-1 text-xs leading-5 text-[#8A98AB]">
              Daftar aktual dari database pengguna.
            </p>
          </div>
          <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"
              ><Clock3 class="h-4 w-4"
            /></span>
            <p class="mt-4 text-2xl font-semibold text-[#0B1F4A]">
              {{ sessions.length }}
            </p>
            <p class="mt-1 text-sm font-medium text-[#53658A]">
              Sesi server aktif
            </p>
            <p class="mt-1 text-xs leading-5 text-[#8A98AB]">
              Sesi dapat ditutup dari daftar perangkat di bawah.
            </p>
          </div>
        </div>
      </div>
      <div
        class="grid gap-5 2xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]"
      >
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div
            class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"
          >
            <div>
              <h3 class="text-base font-semibold text-[#0B1F4A]">
                Hak Akses Internal
              </h3>
              <p class="mt-1 text-sm text-[#6B7A90]">
                Satu jenis role: Keuangan Internal. Jumlah akun login tetap bisa
                lebih dari satu orang.
              </p>
            </div>
            <span
              class="inline-flex shrink-0 whitespace-nowrap rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1 text-[10px] font-bold text-[#0B1F4A]"
              >1 akses</span
            >
          </div>
          <div class="px-6 py-5">
            <div class="space-y-4">
              <div
                class="flex flex-col gap-3 rounded-2xl border border-[#DCE7F4] bg-[#F8FBFE] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-semibold text-[#0B1F4A] shadow-sm"
                    >FI</span
                  >
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-[#182338]">
                      Akses Internal FinStart
                    </p>
                    <p class="mt-1 text-xs leading-5 text-[#6B7A90]">
                      Digunakan oleh tim keuangan/internal. Banyak pengguna bisa
                      dibuat, semuanya memakai akses yang sama.
                    </p>
                  </div>
                </div>
                <span
                  class="w-fit shrink-0 whitespace-nowrap rounded-full border border-[#D8E5F4] bg-white px-3 py-1 text-[10px] font-medium text-[#53658A]"
                  >{{
                    Number(internalFinanceRole().user_count || users.length || 0)
                  }}
                  pengguna</span
                >
              </div>

              <div class="rounded-2xl border border-[#DCE7F4] bg-white">
                <div
                  class="flex flex-col gap-1 border-b border-[#EDF2F7] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-[#0B1F4A]">
                      Daftar Pengguna
                    </p>
                    <p class="text-xs text-[#6B7A90]">
                      Akun yang bisa digunakan untuk login workspace ini.
                    </p>
                  </div>
                  <span class="text-[11px] font-semibold text-[#6B7A90]">
                    {{ users.length }} akun
                  </span>
                </div>

                <div v-if="users.length" class="divide-y divide-[#EDF2F7]">
                  <div
                    v-for="user in users"
                    :key="user.id || user.email"
                    class="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_auto_auto_auto] md:items-center"
                  >
                    <div class="flex min-w-0 items-center gap-3">
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-xs font-bold text-[#0B1F4A]"
                      >
                        {{ String(user.name || user.email || "U").slice(0, 2).toUpperCase() }}
                      </span>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-[#182338]">
                          {{ user.name || "-" }}
                        </p>
                        <p class="truncate text-xs text-[#6B7A90]">
                          {{ user.email || "-" }}
                        </p>
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                        :class="user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'"
                      >
                        {{ user.status === "active" ? "Aktif" : "Nonaktif" }}
                      </span>
                      <span
                        class="rounded-full border border-[#D8E5F4] px-2.5 py-1 text-[10px] font-semibold text-[#53658A]"
                      >
                        {{ Number(user.active_session_count || 0) }} sesi
                      </span>
                    </div>
                    <p class="text-xs text-[#6B7A90] md:text-right">
                      Login terakhir:
                      <span class="font-semibold text-[#182338]">
                        {{ formatTime(user.last_login_at) }}
                      </span>
                    </p>
                    <button
                      v-if="!isCurrentUser(user)"
                      type="button"
                      title="Hapus pengguna"
                      class="inline-flex h-8 w-8 shrink-0 items-center justify-center justify-self-end rounded-lg border border-rose-100 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                      @click="requestDeleteUser(user)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div v-else class="px-4 py-6 text-sm text-[#6B7A90]">
                  Belum ada pengguna dari server.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div class="border-b border-[#E8EEF7] px-6 py-5">
            <h3 class="text-base font-semibold text-[#0B1F4A]">
              Kontrol Keamanan
            </h3>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Pengaturan yang tersedia benar-benar disimpan di server.
            </p>
          </div>
          <div class="divide-y divide-[#EDF2F7] px-6">
            <div class="flex items-center justify-between gap-4 py-5">
              <div class="flex gap-3">
                <span
                  class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"
                  ><CircleAlert class="h-4 w-4"
                /></span>
                <div>
                  <p class="text-sm font-medium text-[#182338]">
                    Peringatan login baru
                  </p>
                  <p class="mt-1 text-xs leading-5 text-[#6B7A90]">
                    Notifikasi saat sesi login baru dibuat.
                  </p>
                </div>
              </div>
              <SettingsToggle
                :checked="Boolean(securitySettings.login_alerts)"
                :disabled="isSavingSecurity"
                label="Peringatan login baru"
                @update:checked="saveSecurity({
                      ...securitySettings,
                      login_alerts: $event,
                    })"
              />
            </div>
            <div class="flex items-center justify-between gap-4 py-5">
              <div class="flex gap-3">
                <span
                  class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"
                  ><Monitor class="h-4 w-4"
                /></span>
                <div>
                  <p class="text-sm font-medium text-[#182338]">
                    Peringatan sesi
                  </p>
                  <p class="mt-1 text-xs leading-5 text-[#6B7A90]">
                    Notifikasi ketika sesi perangkat ditutup atau berubah.
                  </p>
                </div>
              </div>
              <SettingsToggle
                :checked="Boolean(securitySettings.session_alerts)"
                :disabled="isSavingSecurity"
                label="Peringatan sesi"
                @update:checked="saveSecurity({
                      ...securitySettings,
                      session_alerts: $event,
                    })"
              />
            </div>
          </div>
        </section>
      </div>
      <div class="grid gap-5 xl:grid-cols-2">
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div class="border-b border-[#E8EEF7] px-6 py-5">
            <h3 class="text-base font-semibold text-[#0B1F4A]">Sesi Aktif</h3>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Perangkat yang sedang menggunakan akun Anda atau dapat Anda
              kelola.
            </p>
          </div>
          <div class="divide-y divide-[#EDF2F7] px-6">
            <template v-if="sessions.length"
              ><div
                v-for="session in sessions"
                :key="session.id"
                class="flex items-center gap-3 py-4"
              >
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#1E5AA8]"
                  ><Smartphone
                    v-if="
                      String(session.user_agent || '')
                        .toLowerCase()
                        .includes('mobile')
                    "
                    class="h-5 w-5" /><Monitor v-else class="h-5 w-5"
                /></span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-[#182338]">
                    {{ session.user_name || userEmail }}
                  </p>
                  <p class="mt-1 truncate text-xs text-[#6B7A90]">
                    {{ session.ip_address || "IP tidak tersedia" }} ·
                    {{ formatTime(session.created_at) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-2.5 py-1 text-[10px] font-medium text-[#0B1F4A]"
                    ><template v-if="session.current_session">Saat ini</template
                    ><template v-else>Aktif</template></span
                  ><button
                    type="button"
                    class="text-[10px] font-semibold text-rose-600"
                    @click="closeSession(session)"
                  >
                    Tutup
                  </button>
                </div>
              </div></template
            >
            <p v-else class="py-6 text-sm text-[#8A98AB]">
              Tidak ada sesi yang dapat ditampilkan.
            </p>
          </div>
        </section>
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div class="border-b border-[#E8EEF7] px-6 py-5">
            <h3 class="text-base font-semibold text-[#0B1F4A]">
              Aktivitas Keamanan &amp; Audit
            </h3>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Jejak aktivitas dari tabel activity_logs.
            </p>
          </div>
          <div class="divide-y divide-[#EDF2F7] px-6">
            <template v-if="activity.length"
              ><div
                v-for="item in activity.slice(0, 10)"
                :key="item.id"
                class="flex items-start gap-3 py-4"
              >
                <span
                  class="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"
                  ><CheckCircle2 class="h-4 w-4"
                /></span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-[#182338]">
                    {{
                      item.activity || item.description || "Aktivitas sistem"
                    }}
                  </p>
                  <p class="mt-1 text-xs text-[#6B7A90]">
                    {{ item.user_name || item.user_email || "Sistem" }} ·
                    {{ formatTime(item.created_at) }}
                  </p>
                </div>
              </div></template
            >
            <p v-else class="py-6 text-sm text-[#8A98AB]">
              Belum ada aktivitas audit yang dapat ditampilkan.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
  <ConfirmDialog
    :open="!!deleteUserConfirm"
    eyebrow="Konfirmasi Hapus"
    title="Hapus pengguna ini?"
    :message="`Akun '${deleteUserConfirm?.email || deleteUserConfirm?.name}' tidak akan bisa lagi login ke workspace ini. Tindakan ini tidak bisa dibatalkan.`"
    confirm-label="Hapus Pengguna"
    variant="danger"
    @cancel="closeDeleteUserConfirm"
    @confirm="confirmDeleteUser"
  />
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { computed, onMounted, ref } from "vue";
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Monitor,
  Save,
  Shield,
  Smartphone,
  Trash2,
  Users,
} from "lucide-vue-next";
import SettingsToggle from "./settings/SettingsToggle.vue";
import ConfirmDialog from "./common/ConfirmDialog.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
import {
  clearAuthSession,
  financeApi,
  getApiErrorMessage,
  getStoredAuthUser,
} from "../services/financeApi.js";

interface PengaturanViewProps {
  activeSection?: string;
  userEmail: string;
  userRole?: string;
}
type SettingsTab = "profile" | "security";

function formatTime(value: any) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

const props = defineProps<PengaturanViewProps>();
const userEmail = computed(() => props.userEmail);

const { notify } = useFinStartContext();
// Which sub-view shows now comes from the sidebar ("pengaturan" -> Profil
// Perusahaan, "pengaturan-keamanan" -> Keamanan & Akses).
const activeTab = computed<SettingsTab>(() =>
  props.activeSection === "pengaturan-keamanan" ? "security" : "profile",
);
const profile = ref({
  namaEntitas: "",
  npwp: "",
  mataUang: "IDR - Indonesian Rupiah",
  tahunFiskal: "Januari",
  alamat: "",
});
const companySettings = ref<any>({});
const securitySettings = ref<any>({
  login_alerts: true,
  session_alerts: true,
});
const roles = ref<any[]>([]);
const users = ref<any[]>([]);
const sessions = ref<any[]>([]);
const activity = ref<any[]>([]);
const isSavingProfile = ref(false);
const isSavingSecurity = ref(false);
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const inputClass =
  "h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10";
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[#70819B]";
const internalFinanceRole = () =>
  roles.value.find(
    (role: any) => String(role.name || "").toLowerCase() === "finance_manager",
  ) ||
  roles.value[0] || { id: "1", name: "finance_manager", user_count: 0 };

async function loadCompanySettings() {
  try {
    const data = await financeApi.get("/company-settings");
    companySettings.value = data || {};
    const startMonth = Number(data?.fiscal_year_start_month || 1);
    profile.value = {
      namaEntitas: data?.company_name || "",
      npwp: data?.npwp || "",
      mataUang: "IDR - Indonesian Rupiah",
      tahunFiskal: monthNames[startMonth - 1] || "Januari",
      alamat: data?.address || "",
    };
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memuat pengaturan perusahaan."));
  }
}

async function loadSecurityData() {
  const jobs = await Promise.allSettled([
    financeApi.get("/auth/security-settings"),
    financeApi.get("/auth/sessions"),
    financeApi.get("/roles"),
    financeApi.get("/users"),
    financeApi.get("/audit", { limit: 30 }),
  ]);
  const value = (index: number, fallback: any) =>
    jobs[index].status === "fulfilled"
      ? (jobs[index] as PromiseFulfilledResult<any>).value
      : fallback;
  securitySettings.value = {
    ...securitySettings.value,
    ...(value(0, {}) || {}),
  };
  sessions.value = Array.isArray(value(1, [])) ? value(1, []) : [];
  roles.value = Array.isArray(value(2, [])) ? value(2, []) : [];
  users.value = Array.isArray(value(3, [])) ? value(3, []) : [];
  activity.value = Array.isArray(value(4, [])) ? value(4, []) : [];
}

const currentUserId = () => getStoredAuthUser()?.id;
const isCurrentUser = (user: any) =>
  String(user?.id ?? "") === String(currentUserId() ?? "");

const deleteUserConfirm = ref<any>(null);
const isDeletingUser = ref(false);
const requestDeleteUser = (user: any) => {
  deleteUserConfirm.value = user;
};
const closeDeleteUserConfirm = () => {
  deleteUserConfirm.value = null;
};
const confirmDeleteUser = async () => {
  const target = deleteUserConfirm.value;
  if (!target || isDeletingUser.value) return;
  isDeletingUser.value = true;
  try {
    await financeApi.delete(`/users/${target.id}`);
    users.value = users.value.filter(
      (user: any) => String(user.id) !== String(target.id),
    );
    notify(`Pengguna ${target.email || target.name} berhasil dihapus.`);
    deleteUserConfirm.value = null;
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menghapus pengguna."));
  } finally {
    isDeletingUser.value = false;
  }
};

async function handleSaveProfile(event: Event) {
  event.preventDefault();
  isSavingProfile.value = true;
  try {
    const fiscalStartMonth = Math.max(
      1,
      monthNames.indexOf(profile.value.tahunFiskal) + 1,
    );
    const saved = await financeApi.put("/company-settings", {
      ...companySettings.value,
      company_name: profile.value.namaEntitas,
      npwp: profile.value.npwp,
      currency: "IDR",
      address: profile.value.alamat,
      fiscal_year: Number(
        companySettings.value?.fiscal_year || new Date().getFullYear(),
      ),
      fiscal_year_start_month: fiscalStartMonth,
    });
    companySettings.value = saved || companySettings.value;
    await loadCompanySettings();
    notify(
      "Profil perusahaan berhasil disimpan. FinStart saat ini menggunakan Rupiah (IDR).",
    );
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menyimpan profil perusahaan."));
  } finally {
    isSavingProfile.value = false;
  }
}

async function saveSecurity(next: any) {
  isSavingSecurity.value = true;
  try {
    const saved = await financeApi.put("/auth/security-settings", next);
    securitySettings.value = {
      ...securitySettings.value,
      ...(saved || next),
    };
    notify("Preferensi keamanan berhasil disimpan.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menyimpan preferensi keamanan."));
  } finally {
    isSavingSecurity.value = false;
  }
}

async function closeSession(session: any) {
  try {
    await financeApi.delete(`/auth/sessions/${session.id}`);
    if (session.current_session) {
      // The token this tab uses just got revoked server-side; any further
      // API call would 401. Log out immediately instead of refetching
      // security data with a now-dead token.
      clearAuthSession();
      window.dispatchEvent(new CustomEvent("finstart-auth-expired"));
      return;
    }
    await loadSecurityData();
    notify("Sesi aktif berhasil ditutup.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menutup sesi."));
  }
}

onMounted(() => {
  loadCompanySettings();
  loadSecurityData();
});
</script>
