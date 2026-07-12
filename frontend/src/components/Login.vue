<template>
  <div class="h-screen overflow-hidden bg-[#F3F7FC] font-sans text-[#182338]">
    <div
      class="mx-auto grid h-full max-w-[1760px] grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]"
    >
      <section
        class="relative hidden h-full overflow-hidden bg-[#0B1F4A] px-8 py-7 text-white lg:flex lg:flex-col xl:px-14 xl:py-8"
      >
        <div class="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            class="absolute -left-28 top-[-7rem] h-80 w-80 rounded-full bg-[#2B6CB0]/18 blur-3xl"
          />
          <div
            class="absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-[#1E5AA8]/16 blur-3xl"
          />
        </div>

        <div
          class="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-4"
        >
          <button
            id="login-back-to-landing"
            type="button"
            class="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.06] px-5 text-base font-semibold text-blue-50 transition hover:bg-white/[0.12]"
            @click="goBack"
          >
            <ArrowLeft class="h-4 w-4" />
            Kembali ke Landing Page
          </button>
          <span
            class="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-100/85"
          >
            Internal Workspace
          </span>
        </div>

        <div class="relative z-10 my-auto max-w-3xl py-6 xl:py-8">
          <div
            class="inline-flex max-w-full items-center gap-5 rounded-[28px] bg-white/[0.06] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-sm"
          >
            <div
              class="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white shadow-[0_16px_34px_rgba(255,255,255,0.12)]"
            >
              <KedataLogo :size="48" />
            </div>
            <div class="min-w-0">
              <p
                class="text-xs font-bold uppercase tracking-[0.18em] text-[#9BC6F7]"
              >
                PT Kedata Indonesia Digital
              </p>
              <h1
                class="mt-1 text-[40px] font-extrabold leading-none tracking-[0.12em] text-white"
              >
                FINSTART
              </h1>
              <p
                class="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/80"
              >
                Financial Operations Workspace
              </p>
            </div>
          </div>

          <div class="mt-12 max-w-2xl xl:mt-14">
            <p
              class="text-sm font-bold uppercase tracking-[0.18em] text-[#9BC6F7]"
            >
              Sistem internal PT Kedata
            </p>
            <h2
              class="mt-6 text-[54px] font-extrabold leading-[1.12] text-white xl:text-[64px]"
            >
              Kontrol finansial yang rapi untuk pertumbuhan bisnis.
            </h2>
            <p
              class="login-side-copy mt-7 max-w-2xl text-lg leading-8 text-slate-300/90"
            >
              Finstart menyatukan aktivitas finansial, proyek, transaksi, aset,
              pajak, dan laporan dalam lingkungan kerja yang profesional dan
              mudah dipahami.
            </p>
          </div>

          <div class="login-trust-grid mt-8 grid gap-3 sm:grid-cols-3">
            <div
              v-for="point in trustPoints"
              :key="point.title"
              class="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0B1F4A] shadow-[0_10px_22px_rgba(255,255,255,0.12)]"
              >
                <component :is="point.icon" class="h-4.5 w-4.5" />
              </div>
              <p class="mt-4 text-sm font-bold text-white">{{ point.title }}</p>
              <p class="mt-1.5 text-xs leading-5 text-slate-300/75">
                {{ point.text }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm text-blue-100/75"
        >
          <span>PT Kedata Indonesia Digital © 2026</span>
          <span class="inline-flex items-center gap-2">
            <span
              class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.10)]"
            />
            Workspace aman & aktif
          </span>
        </div>
      </section>

      <section
        class="relative flex h-full items-center justify-center overflow-hidden px-5 py-5 sm:px-8 lg:px-12 xl:px-16"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,90,168,0.09),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(11,31,74,0.06),transparent_42%)]"
        />

        <div class="absolute left-5 top-5 z-20 lg:hidden">
          <button
            id="mobile-back-to-landing"
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-xs font-semibold text-[#53658A] shadow-sm"
            @click="goBack"
          >
            <ArrowLeft class="h-3.5 w-3.5" />
            Kembali
          </button>
        </div>

        <div
          class="login-panel-enter relative z-10 w-full max-w-[760px]"
          role="region"
          aria-label="Form masuk Finstart"
        >
          <div
            class="flex items-start justify-between gap-3 border-b border-[#E8EEF7] pb-4"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_12px_26px_rgba(16,42,86,0.08)]"
              >
                <KedataLogo :size="34" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.20em] text-[#1E5AA8]"
                >
                  PT Kedata Indonesia Digital
                </p>
                <h3
                  class="mt-1 text-[26px] font-extrabold tracking-[0.10em] text-[#0B1F4A]"
                >
                  FINSTART
                </h3>
                <p
                  class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A9AB0]"
                >
                  Financial Operations
                </p>
              </div>
            </div>
            <div
              class="hidden rounded-xl bg-[#F8FBFE] px-2.5 py-2 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B7A90] sm:block"
            >
              Secure<br /><span class="text-[#1E5AA8]">Access</span>
            </div>
          </div>

          <div class="mt-5">
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Akses workspace
            </p>
            <h2
              class="mt-2 text-[28px] font-extrabold tracking-tight text-[#0B1F4A]"
            >
              Selamat Datang Kembali
            </h2>
            <p class="mt-2 text-sm leading-5 text-[#6B7A90]">
              Masuk untuk melanjutkan operasional finansial PT Kedata Indonesia
              Digital.
            </p>
          </div>

          <div
            class="login-info-card mt-4 flex gap-3 rounded-2xl bg-[#F8FBFE] p-3 text-sm text-[#53658A]"
          >
            <Info class="mt-0.5 h-5 w-5 shrink-0 text-[#1E5AA8]" />
            <div>
              <p class="font-bold text-[#102A56]">Akses akun internal</p>
              <p class="mt-1 text-xs leading-5">
                Gunakan akun yang dibuat administrator. Kredensial awal hanya
                tercantum di panduan instalasi dan wajib diganti setelah login
                pertama.
              </p>
            </div>
          </div>

          <div
            v-if="error"
            class="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700"
            role="alert"
          >
            {{ error }}
          </div>
          <div
            v-if="resetNotice"
            class="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-semibold leading-5 text-sky-800"
            role="status"
          >
            {{ resetNotice }}
          </div>

          <form
            v-if="resetToken"
            class="mt-5 space-y-3 rounded-2xl border border-[#DCE7F4] bg-[#F8FBFE] p-4"
            aria-label="Form reset kata sandi"
            @submit.prevent="handleResetPassword"
          >
            <div class="space-y-2">
              <label
                for="reset-token"
                class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#53658A]"
                >Token Reset</label
              >
              <input
                id="reset-token"
                v-model="resetToken"
                class="h-11 w-full rounded-xl border border-[#D1DFEF] bg-white px-3 font-mono text-xs font-semibold text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
              />
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-2">
                <label
                  for="reset-password"
                  class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#53658A]"
                  >Password Baru</label
                >
                <input
                  id="reset-password"
                  v-model="resetPassword"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  class="h-11 w-full rounded-xl border border-[#D1DFEF] bg-white px-3 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="reset-password-confirm"
                  class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#53658A]"
                  >Konfirmasi</label
                >
                <input
                  id="reset-password-confirm"
                  v-model="resetPasswordConfirm"
                  type="password"
                  placeholder="Ulangi password"
                  class="h-11 w-full rounded-xl border border-[#D1DFEF] bg-white px-3 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                />
              </div>
            </div>
            <button
              type="submit"
              :disabled="isResettingPassword"
              class="flex h-11 w-full items-center justify-center rounded-xl bg-[#0B1F4A] px-4 text-xs font-bold text-white transition hover:bg-[#102A56] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {{
                isResettingPassword
                  ? "Menyimpan Password..."
                  : "Simpan Password Baru"
              }}
            </button>
            <p class="text-[11px] leading-5 text-[#70819B]">
              Token ini dibuat oleh sistem, bukan diverifikasi oleh role lain.
              Untuk produksi, token sebaiknya dikirim lewat email atau kanal
              administrator.
            </p>
          </form>

          <form
            class="mt-4 space-y-3"
            novalidate
            @submit.prevent="handleSubmit"
          >
            <div class="space-y-2">
              <label
                for="login-email"
                class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#53658A]"
                >Alamat Email Karyawan</label
              >
              <div class="relative">
                <Mail
                  class="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A9AB0]"
                />
                <input
                  id="login-email"
                  v-model="email"
                  name="email"
                  type="email"
                  placeholder="nama@kedata.id"
                  class="h-11 w-full rounded-xl border border-[#D1DFEF] bg-[#F9FBFD] pl-11 pr-4 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:bg-white focus:ring-4 focus:ring-[#1E5AA8]/10"
                  required
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <label
                  for="login-password"
                  class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#53658A]"
                  >Kata Sandi</label
                >
                <button
                  id="btn-request-password-reset"
                  type="button"
                  class="text-xs font-semibold text-[#1E5AA8] hover:text-[#0B1F4A]"
                  @click="handleRequestReset"
                >
                  Lupa sandi?
                </button>
              </div>
              <div class="relative">
                <Lock
                  class="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A9AB0]"
                />
                <input
                  id="login-password"
                  v-model="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan kata sandi"
                  class="h-11 w-full rounded-xl border border-[#D1DFEF] bg-[#F9FBFD] pl-11 pr-12 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:bg-white focus:ring-4 focus:ring-[#1E5AA8]/10"
                  required
                />
                <button
                  id="btn-show-password"
                  type="button"
                  class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A9AB0] transition hover:bg-[#EEF4FB] hover:text-[#1E5AA8]"
                  :aria-pressed="showPassword"
                  :aria-label="
                    showPassword
                      ? 'Sembunyikan kata sandi'
                      : 'Tampilkan kata sandi'
                  "
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label
                for="login-mfa-code"
                class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#53658A]"
              >
                Kode MFA
                <span class="normal-case font-medium text-[#8A9AB0]"
                  >(hanya bila aktif)</span
                >
              </label>
              <div class="relative">
                <KeyRound
                  class="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A9AB0]"
                />
                <input
                  id="login-mfa-code"
                  :value="mfaCode"
                  name="mfaCode"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="6 digit dari authenticator"
                  class="h-11 w-full rounded-xl border border-[#D1DFEF] bg-[#F9FBFD] pl-11 pr-4 text-sm font-medium tracking-[0.22em] text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:bg-white focus:ring-4 focus:ring-[#1E5AA8]/10"
                  @input="handleMfaInput"
                />
              </div>
              <p class="login-security-note text-[11px] leading-5 text-[#8A9AB0]">
                Abaikan bila autentikasi dua langkah belum diaktifkan untuk akun
                Anda.
              </p>
            </div>

            <p class="login-session-copy text-xs leading-5 text-[#637083]">
              Sesi disimpan sementara pada browser dan dapat dicabut dari
              halaman Pengaturan.
            </p>

            <label
              class="flex cursor-pointer items-start gap-3 rounded-xl bg-[#F8FBFE] px-3 py-2.5 text-xs leading-5 text-[#53658A]"
            >
              <input
                id="login-remember-browser"
                v-model="rememberBrowser"
                type="checkbox"
                class="mt-0.5 h-4 w-4 rounded border-[#BFD0E6] text-[#0B1F4A] focus:ring-[#1E5AA8]"
              />
              <span>
                <span class="block font-bold text-[#0B1F4A]"
                  >Ingat sesi login</span
                >
                <span class="mt-0.5 block"
                  >Sesi tetap tersimpan selama token belum kedaluwarsa. Setelah
                  Keluar Sistem, akun dengan MFA aktif tetap wajib memasukkan
                  token saat login lagi.</span
                >
              </span>
            </label>

            <button
              id="btn-submit-login"
              type="submit"
              :disabled="isLoading"
              class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-sm font-bold text-white shadow-[0_12px_22px_rgba(11,31,74,0.18)] transition hover:bg-[#102A56] disabled:cursor-not-allowed disabled:opacity-75"
            >
              <template v-if="isLoading">
                <ShieldCheck class="h-4 w-4 animate-pulse text-blue-200" />
                Memverifikasi Akses...
              </template>
              <template v-else> Masuk ke Dashboard </template>
            </button>
          </form>

          <div class="mt-4 border-t border-[#E8EEF7] pt-3 text-center">
            <p class="text-[10px] font-medium text-[#94A3B8]">
              Sistem operasional internal PT Kedata Indonesia Digital
            </p>
            <p
              class="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A5B3C6]"
            >
              Enkripsi koneksi & kontrol sesi aktif
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { eventValue } from "../utils/domEvents";
import { ref } from "vue";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  KeyRound,
} from "lucide-vue-next";
import KedataLogo from "./KedataLogo.vue";
import {
  financeApi,
  getApiErrorMessage,
  saveAuthSession,
} from "../services/financeApi.js";

const emit = defineEmits(["login-success", "back"]);

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const mfaCode = ref("");
const rememberBrowser = ref(true);
const isLoading = ref(false);
const error = ref("");
const resetNotice = ref("");
const resetToken = ref("");
const resetPassword = ref("");
const resetPasswordConfirm = ref("");
const isResettingPassword = ref(false);

function clearResetForm() {
  resetNotice.value = "";
  resetToken.value = "";
  resetPassword.value = "";
  resetPasswordConfirm.value = "";
}

function goBack() {
  emit("back");
}

async function handleRequestReset() {
  error.value = "";
  clearResetForm();

  const normalizedEmail = email.value.trim().toLowerCase();
  if (!normalizedEmail) {
    error.value =
      "Masukkan email akun terlebih dahulu untuk meminta reset kata sandi.";
    return;
  }

  try {
    const result = await financeApi.requestPasswordReset(normalizedEmail);
    const token = result?.reset_token;
    resetToken.value = token || "";
    resetNotice.value = token
      ? "Token reset lokal diterima. Buat kata sandi baru melalui form di bawah ini."
      : "Permintaan reset diterima. Hubungi administrator bila kanal reset belum dikonfigurasi.";
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Gagal mengajukan reset kata sandi.",
    );
  }
}

async function handleResetPassword() {
  error.value = "";
  resetNotice.value = "";

  if (!resetToken.value.trim()) {
    error.value = "Token reset wajib diisi.";
    return;
  }

  if (resetPassword.value.length < 8) {
    error.value = "Kata sandi baru minimal 8 karakter.";
    return;
  }

  if (resetPassword.value !== resetPasswordConfirm.value) {
    error.value = "Konfirmasi kata sandi baru belum sama.";
    return;
  }

  isResettingPassword.value = true;
  try {
    await financeApi.resetPassword(
      resetToken.value.trim(),
      resetPassword.value,
    );
    resetToken.value = "";
    resetPassword.value = "";
    resetPasswordConfirm.value = "";
    password.value = "";
    mfaCode.value = "";
    resetNotice.value =
      "Kata sandi berhasil direset. Silakan login memakai kata sandi baru.";
  } catch (resetError) {
    error.value = getApiErrorMessage(resetError, "Gagal reset kata sandi.");
  } finally {
    isResettingPassword.value = false;
  }
}

async function handleSubmit() {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Harap isi alamat email dan kata sandi Anda.";
    return;
  }

  isLoading.value = true;
  try {
    const session = await financeApi.login(
      email.value.trim().toLowerCase(),
      password.value,
      mfaCode.value.trim(),
      rememberBrowser.value,
    );
    saveAuthSession(session, rememberBrowser.value);
    isLoading.value = false;
    emit("login-success", session);
  } catch (loginError) {
    console.error(loginError);
    error.value = getApiErrorMessage(
      loginError,
      "Email atau kata sandi tidak sesuai.",
    );
    isLoading.value = false;
  }
}

function handleMfaInput(event) {
  mfaCode.value = eventValue(event).replace(/\D/g, "").slice(0, 6);
}
</script>

<style scoped>
.login-panel-enter {
  animation: loginPanelEnter 0.56s ease-out both;
}

@keyframes loginPanelEnter {
  from {
    opacity: 0;
    transform: translateY(22px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-height: 880px) {
  .login-info-card,
  .login-security-note,
  .login-session-copy,
  .login-trust-grid {
    display: none;
  }
}

@media (max-height: 760px) {
  .login-side-copy {
    display: none;
  }
}
</style>
