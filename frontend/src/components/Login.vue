<script lang="tsx">
import { Fragment, defineComponent, h, ref } from "vue";
import { motion } from "../compat/motion.js";
import { ArrowLeft, BadgeCheck, Building2, Eye, EyeOff, Info, Lock, Mail, ShieldCheck, KeyRound } from "lucide-vue-next";
import KedataLogo from './KedataLogo.vue';
import { financeApi, getApiErrorMessage, saveAuthSession } from '../services/financeApi.js';
interface LoginProps {
  onLoginSuccess: (session: any) => void;
  onBackToLanding: () => void;
}
const trustPoints = [{
  icon: ShieldCheck,
  title: 'Akses Terkelola',
  text: 'Kontrol sesi, role, dan aktivitas akses pada satu workspace.'
}, {
  icon: Building2,
  title: 'Operasional Terpadu',
  text: 'Accounting, proyek, tagihan, aset, pajak, serta laporan terhubung.'
}, {
  icon: BadgeCheck,
  title: 'Standar Kerja Konsisten',
  text: 'Tampilan dan proses kerja disusun untuk kebutuhan tim internal perusahaan.'
}];

export default defineComponent({
  name: "Login",
  props: ["onLoginSuccess", "onBackToLanding"],
  setup(props) {
    const {
      onLoginSuccess,
      onBackToLanding
    }: LoginProps = props;
    const email = ref(''),
      setEmail = next => email.value = typeof next === "function" ? next(email.value) : next;
    const password = ref(''),
      setPassword = next => password.value = typeof next === "function" ? next(password.value) : next;
    const showPassword = ref(false),
      setShowPassword = next => showPassword.value = typeof next === "function" ? next(showPassword.value) : next;
    const mfaCode = ref(''),
      setMfaCode = next => mfaCode.value = typeof next === "function" ? next(mfaCode.value) : next;
    const isLoading = ref(false),
      setIsLoading = next => isLoading.value = typeof next === "function" ? next(isLoading.value) : next;
    const error = ref(''),
      setError = next => error.value = typeof next === "function" ? next(error.value) : next;
    const resetNotice = ref(''),
      setResetNotice = next => resetNotice.value = typeof next === "function" ? next(resetNotice.value) : next;
    const handleRequestReset = async () => {
      setError('');
      setResetNotice('');
      const normalizedEmail = email.value.trim().toLowerCase();
      if (!normalizedEmail) {
        setError('Masukkan email akun terlebih dahulu untuk meminta reset kata sandi.');
        return;
      }
      try {
        const result = await financeApi.requestPasswordReset(normalizedEmail);
        const token = result?.reset_token;
        setResetNotice(token
          ? `Token reset pengembangan: ${token}. Gunakan endpoint reset password sesuai prosedur administrator.`
          : 'Permintaan reset diterima. Hubungi administrator bila kanal reset belum dikonfigurasi.');
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Gagal mengajukan reset kata sandi.'));
      }
    };
    const handleSubmit = async (event: Event) => {
      event.preventDefault();
      setError('');
      if (!email.value || !password.value) {
        setError('Harap isi alamat email dan kata sandi Anda.');
        return;
      }
      setIsLoading(true);
      try {
        const session = await financeApi.login(email.value.trim().toLowerCase(), password.value, mfaCode.value.trim());
        saveAuthSession(session);
        setIsLoading(false);
        onLoginSuccess(session);
      } catch (error) {
        console.error(error);
        setError(getApiErrorMessage(error, 'Email atau kata sandi tidak sesuai.'));
        setIsLoading(false);
      }
    };
    return () => <div class="min-h-screen bg-[#F3F7FC] font-sans text-[#182338]">
      <div class="mx-auto grid min-h-screen max-w-[1760px] grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
        <section class="relative hidden overflow-hidden bg-[#0B1F4A] px-10 py-9 text-white lg:flex lg:flex-col xl:px-14 xl:py-12">
          <div class="pointer-events-none absolute inset-0" aria-hidden="true">
            <div class="absolute -left-28 top-[-7rem] h-80 w-80 rounded-full bg-[#2B6CB0]/18 blur-3xl" />
            <div class="absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-[#1E5AA8]/16 blur-3xl" />
            <div class="absolute inset-x-10 top-[23%] h-px bg-white/8" />
            <div class="absolute inset-x-14 bottom-[17%] h-px bg-white/8" />
            <div class="absolute left-[13%] top-[12%] h-[65%] w-px bg-white/5" />
            <div class="absolute right-[12%] top-[10%] h-[70%] w-px bg-white/5" />
          </div>

          <div class="relative z-10 flex items-center justify-between gap-4">
            <button id="login-back-to-landing" type="button" onClick={onBackToLanding} class="inline-flex h-11 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 text-sm font-semibold text-blue-50 transition hover:bg-white/[0.12]">
              <ArrowLeft class="h-4 w-4" /> Kembali ke Landing Page
            </button>
            <span class="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100/85">
              Internal Workspace
            </span>
          </div>

          <div class="relative z-10 my-auto max-w-2xl py-12">
            <div class="inline-flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-sm">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_16px_34px_rgba(255,255,255,0.12)]">
                <KedataLogo size={40} />
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9BC6F7]">PT Kedata Indonesia Digital</p>
                <h1 class="mt-1 text-3xl font-extrabold tracking-[0.16em] text-white">FINSTART</h1>
                <p class="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/80">Financial Operations Workspace</p>
              </div>
            </div>

            <div class="mt-10 max-w-xl">
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9BC6F7]">Sistem internal PT Kedata</p>
              <h2 class="mt-4 text-[42px] font-extrabold leading-[1.13] tracking-tight text-white xl:text-[52px]">
                Kontrol finansial yang rapi untuk pertumbuhan bisnis.
              </h2>
              <p class="mt-5 max-w-lg text-[15px] leading-7 text-slate-300/85">
                Finstart menyatukan aktivitas finansial, proyek, transaksi, aset, pajak, dan laporan dalam lingkungan kerja yang profesional dan mudah dipahami.
              </p>
            </div>

            <div class="mt-10 grid gap-3 sm:grid-cols-3">
              {trustPoints.map(point => {
                const Icon = point.icon;
                return <div key={point.title} class="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0B1F4A] shadow-[0_10px_22px_rgba(255,255,255,0.12)]">
                      <Icon class="h-4.5 w-4.5" />
                    </div>
                    <p class="mt-4 text-sm font-bold text-white">{point.title}</p>
                    <p class="mt-1.5 text-xs leading-5 text-slate-300/75">{point.text}</p>
                  </div>;
              })}
            </div>
          </div>

          <div class="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-blue-100/75">
            <span>PT Kedata Indonesia Digital © 2026</span>
            <span class="inline-flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.10)]" />
              Workspace aman & aktif
            </span>
          </div>
        </section>

        <section class="relative flex items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
          <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,90,168,0.09),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(11,31,74,0.06),transparent_42%)]" />

          <div class="absolute left-5 top-5 z-20 lg:hidden">
            <button id="mobile-back-to-landing" type="button" onClick={onBackToLanding} class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-xs font-semibold text-[#53658A] shadow-sm">
              <ArrowLeft class="h-3.5 w-3.5" /> Kembali
            </button>
          </div>

          <motion.div initial={{
            opacity: 0,
            y: 22
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.56,
            ease: 'easeOut'
          }} class="relative z-10 w-full max-w-[540px] rounded-[30px] border border-[#DCE7F4] bg-white p-7 shadow-[0_24px_70px_rgba(16,42,86,0.10)] sm:p-9" role="region" aria-label="Form masuk Finstart">
            <div class="flex items-start justify-between gap-3 border-b border-[#E8EEF7] pb-6">
              <div class="flex items-center gap-4">
                <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_26px_rgba(16,42,86,0.08)]">
                  <KedataLogo size={40} />
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.20em] text-[#1E5AA8]">PT Kedata Indonesia Digital</p>
                  <h3 class="mt-1 text-[28px] font-extrabold tracking-[0.10em] text-[#0B1F4A]">FINSTART</h3>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A9AB0]">Financial Operations</p>
                </div>
              </div>
              <div class="hidden rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] px-2.5 py-2 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B7A90] sm:block">
                Secure<br /><span class="text-[#1E5AA8]">Access</span>
              </div>
            </div>

            <div class="mt-7">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Akses workspace</p>
              <h2 class="mt-2 text-[30px] font-extrabold tracking-tight text-[#0B1F4A]">Selamat Datang Kembali</h2>
              <p class="mt-2 text-sm leading-6 text-[#6B7A90]">Masuk untuk melanjutkan operasional finansial PT Kedata Indonesia Digital.</p>
            </div>

            <div class="mt-6 flex gap-3 rounded-2xl border border-[#DCE7F4] bg-[#F8FBFE] p-4 text-sm text-[#53658A]">
              <Info class="mt-0.5 h-5 w-5 shrink-0 text-[#1E5AA8]" />
              <div>
                <p class="font-bold text-[#102A56]">Akses akun internal</p>
                <p class="mt-1 text-xs leading-5">Gunakan akun yang dibuat administrator. Kredensial awal hanya tercantum di panduan instalasi dan wajib diganti setelah login pertama.</p>
              </div>
            </div>

            {error.value && <div class="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700" role="alert">
                {error.value}
              </div>}
            {resetNotice.value && <div class="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-semibold leading-5 text-sky-800" role="status">
                {resetNotice.value}
              </div>}

            <form onSubmit={handleSubmit} class="mt-6 space-y-5" noValidate>
              <div class="space-y-2">
                <label for="login-email" class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#53658A]">Alamat Email Karyawan</label>
                <div class="relative">
                  <Mail class="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A9AB0]" />
                  <input id="login-email" name="email" type="email" value={email.value} onChange={event => setEmail(event.target.value)} placeholder="nama@kedata.id" class="h-12 w-full rounded-xl border border-[#D1DFEF] bg-[#F9FBFD] pl-11 pr-4 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:bg-white focus:ring-4 focus:ring-[#1E5AA8]/10" required />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <label for="login-password" class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#53658A]">Kata Sandi</label>
                  <button id="btn-request-password-reset" type="button" onClick={handleRequestReset} class="text-xs font-semibold text-[#1E5AA8] hover:text-[#0B1F4A]">Lupa sandi?</button>
                </div>
                <div class="relative">
                  <Lock class="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A9AB0]" />
                  <input id="login-password" name="password" type={showPassword.value ? 'text' : 'password'} value={password.value} onChange={event => setPassword(event.target.value)} placeholder="Masukkan kata sandi" class="h-12 w-full rounded-xl border border-[#D1DFEF] bg-[#F9FBFD] pl-11 pr-12 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:bg-white focus:ring-4 focus:ring-[#1E5AA8]/10" required />
                  <button id="btn-show-password" type="button" onClick={() => setShowPassword(!showPassword.value)} class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A9AB0] transition hover:bg-[#EEF4FB] hover:text-[#1E5AA8]" aria-pressed={showPassword.value} aria-label={showPassword.value ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                    {showPassword.value ? <EyeOff class="h-4 w-4" /> : <Eye class="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label for="login-mfa-code" class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#53658A]">Kode MFA <span class="normal-case font-medium text-[#8A9AB0]">(hanya bila aktif)</span></label>
                <div class="relative">
                  <KeyRound class="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A9AB0]" />
                  <input id="login-mfa-code" name="mfaCode" inputmode="numeric" maxlength="6" value={mfaCode.value} onChange={event => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 digit dari authenticator" class="h-12 w-full rounded-xl border border-[#D1DFEF] bg-[#F9FBFD] pl-11 pr-4 text-sm font-medium tracking-[0.22em] text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:bg-white focus:ring-4 focus:ring-[#1E5AA8]/10" />
                </div>
                <p class="text-[11px] leading-5 text-[#8A9AB0]">Abaikan bila autentikasi dua langkah belum diaktifkan untuk akun Anda.</p>
              </div>

              <p class="text-xs leading-5 text-[#637083]">Sesi disimpan sementara pada browser dan dapat dicabut dari halaman Pengaturan.</p>

              <button id="btn-submit-login" type="submit" disabled={isLoading.value} class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-sm font-bold text-white shadow-[0_12px_22px_rgba(11,31,74,0.18)] transition hover:bg-[#102A56] disabled:cursor-not-allowed disabled:opacity-75">
                {isLoading.value ? <><ShieldCheck class="h-4 w-4 animate-pulse text-blue-200" /> Memverifikasi Akses...</> : 'Masuk ke Dashboard'}
              </button>
            </form>

            <div class="mt-6 border-t border-[#E8EEF7] pt-4 text-center">
              <p class="text-[10px] font-medium text-[#94A3B8]">Sistem operasional internal PT Kedata Indonesia Digital</p>
              <p class="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A5B3C6]">Enkripsi koneksi & kontrol sesi aktif</p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>;
  }
});
</script>
