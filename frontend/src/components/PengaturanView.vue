<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, ref } from "vue";
import {
  ArrowUpRight, BadgeCheck, Building2, CheckCircle2, ChevronRight, CircleAlert,
  Clock3, KeyRound, LockKeyhole, Monitor, Plus, Save, Shield, Smartphone,
  UserPlus, Users, X,
} from "lucide-vue-next";
import { financeApi, getApiErrorMessage } from '../services/financeApi.js';

interface PengaturanViewProps {
  userEmail: string;
  userRole?: string;
  showToast: (msg: string) => void;
}
type SettingsTab = 'profile' | 'security';

function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={onChange} class={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition disabled:cursor-not-allowed disabled:opacity-55 ${checked ? 'border-[#0B1F4A] bg-[#0B1F4A]' : 'border-[#C9D8E8] bg-[#EEF4FB]'}`}>
    <span class={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>;
}

function formatTime(value: any) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: 'Administrator', finance_manager: 'Finance Manager', finance: 'Staff Finance',
    hr: 'Human Resources', tax: 'Pajak', project_manager: 'Project Manager', director: 'Direktur', auditor: 'Auditor',
  };
  return labels[String(role || '').toLowerCase()] || String(role || 'Role internal');
}

export default defineComponent({
  name: 'PengaturanView',
  props: ['userEmail', 'userRole', 'showToast'],
  setup(props) {
    const { userEmail, userRole, showToast }: PengaturanViewProps = props;
    const activeTab = ref<SettingsTab>('profile');
    const profile = ref({ namaEntitas: '', npwp: '', mataUang: 'IDR - Indonesian Rupiah', tahunFiskal: 'Januari', alamat: '' });
    const companySettings = ref<any>({});
    const securitySettings = ref<any>({ login_alerts: true, session_alerts: true, mfa_status: 'not_configured', mfa_pending: false });
    const roles = ref<any[]>([]);
    const users = ref<any[]>([]);
    const sessions = ref<any[]>([]);
    const activity = ref<any[]>([]);
    const isSavingProfile = ref(false);
    const isSavingSecurity = ref(false);
    const isPasswordOpen = ref(false);
    const isUserModalOpen = ref(false);
    const passwordForm = ref({ current_password: '', new_password: '', confirm_password: '' });
    const newUser = ref({ name: '', email: '', phone: '', role_id: '', password: '' });
    const mfaSetup = ref({ open: false, secret: '', otpauth_url: '', code: '' });
    const mfaDisable = ref({ open: false, code: '', password: '' });
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const inputClass = 'h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10';
    const labelClass = 'text-[10px] font-semibold uppercase tracking-[0.14em] text-[#70819B]';
    const isAdmin = () => String(userRole || '').toLowerCase() === 'admin';

    async function loadCompanySettings() {
      try {
        const data = await financeApi.get('/company-settings');
        companySettings.value = data || {};
        const startMonth = Number(data?.fiscal_year_start_month || 1);
        profile.value = {
          namaEntitas: data?.company_name || '',
          npwp: data?.npwp || '',
          mataUang: 'IDR - Indonesian Rupiah',
          tahunFiskal: monthNames[startMonth - 1] || 'Januari',
          alamat: data?.address || '',
        };
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal memuat pengaturan perusahaan.'));
      }
    }

    async function loadSecurityData() {
      const jobs = await Promise.allSettled([
        financeApi.get('/auth/security-settings'),
        financeApi.get('/auth/sessions'),
        financeApi.get('/roles'),
        financeApi.get('/users'),
        financeApi.get('/audit', { limit: 30 }),
      ]);
      const value = (index: number, fallback: any) => jobs[index].status === 'fulfilled' ? (jobs[index] as PromiseFulfilledResult<any>).value : fallback;
      securitySettings.value = { ...securitySettings.value, ...(value(0, {}) || {}) };
      sessions.value = Array.isArray(value(1, [])) ? value(1, []) : [];
      roles.value = Array.isArray(value(2, [])) ? value(2, []) : [];
      users.value = Array.isArray(value(3, [])) ? value(3, []) : [];
      activity.value = Array.isArray(value(4, [])) ? value(4, []) : [];
    }

    async function handleSaveProfile(event: Event) {
      event.preventDefault();
      isSavingProfile.value = true;
      try {
        const fiscalStartMonth = Math.max(1, monthNames.indexOf(profile.value.tahunFiskal) + 1);
        const saved = await financeApi.put('/company-settings', {
          ...companySettings.value,
          company_name: profile.value.namaEntitas,
          npwp: profile.value.npwp,
          currency: 'IDR',
          address: profile.value.alamat,
          fiscal_year: Number(companySettings.value?.fiscal_year || new Date().getFullYear()),
          fiscal_year_start_month: fiscalStartMonth,
        });
        companySettings.value = saved || companySettings.value;
        await loadCompanySettings();
        showToast('Profil perusahaan berhasil disimpan. FinStart saat ini menggunakan Rupiah (IDR).');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal menyimpan profil perusahaan.'));
      } finally {
        isSavingProfile.value = false;
      }
    }

    async function saveSecurity(next: any) {
      isSavingSecurity.value = true;
      try {
        const saved = await financeApi.put('/auth/security-settings', next);
        securitySettings.value = { ...securitySettings.value, ...(saved || next) };
        showToast('Preferensi keamanan berhasil disimpan.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal menyimpan preferensi keamanan.'));
      } finally {
        isSavingSecurity.value = false;
      }
    }

    async function beginMfaSetup() {
      try {
        const data = await financeApi.post('/auth/mfa/setup', {});
        mfaSetup.value = { open: true, secret: data?.secret || '', otpauth_url: data?.otpauth_url || '', code: '' };
        await loadSecurityData();
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal menyiapkan MFA.'));
      }
    }

    async function confirmMfa(event: Event) {
      event.preventDefault();
      try {
        await financeApi.post('/auth/mfa/confirm', { code: mfaSetup.value.code });
        mfaSetup.value = { open: false, secret: '', otpauth_url: '', code: '' };
        await loadSecurityData();
        showToast('Autentikasi dua langkah berhasil diaktifkan.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Kode MFA tidak valid.'));
      }
    }

    async function disableMfa(event: Event) {
      event.preventDefault();
      try {
        await financeApi.post('/auth/mfa/disable', { code: mfaDisable.value.code, password: mfaDisable.value.password });
        mfaDisable.value = { open: false, code: '', password: '' };
        await loadSecurityData();
        showToast('Autentikasi dua langkah dinonaktifkan.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Password atau kode MFA tidak valid.'));
      }
    }

    async function closeSession(session: any) {
      try {
        await financeApi.delete(`/auth/sessions/${session.id}`);
        await loadSecurityData();
        showToast(session.current_session ? 'Sesi ini ditutup. Silakan login kembali.' : 'Sesi aktif berhasil ditutup.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal menutup sesi.'));
      }
    }

    async function changePassword(event: Event) {
      event.preventDefault();
      if (passwordForm.value.new_password.length < 8) return showToast('Password baru minimal 8 karakter.');
      if (passwordForm.value.new_password !== passwordForm.value.confirm_password) return showToast('Konfirmasi password belum sama.');
      try {
        await financeApi.post('/auth/password/change', {
          current_password: passwordForm.value.current_password,
          new_password: passwordForm.value.new_password,
        });
        passwordForm.value = { current_password: '', new_password: '', confirm_password: '' };
        isPasswordOpen.value = false;
        showToast('Password berhasil diubah. Sesi lain telah ditutup.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal mengubah password.'));
      }
    }

    async function createUser(event: Event) {
      event.preventDefault();
      try {
        await financeApi.post('/users', { ...newUser.value, role_id: Number(newUser.value.role_id), status: 'active' });
        newUser.value = { name: '', email: '', phone: '', role_id: '', password: '' };
        isUserModalOpen.value = false;
        await loadSecurityData();
        showToast('Pengguna baru berhasil dibuat.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal membuat pengguna baru.'));
      }
    }

    onMounted(() => {
      loadCompanySettings();
      loadSecurityData();
    });

    return () => <div class="space-y-7 font-sans">
      <header class="flex flex-col gap-4 border-b border-[#DCE7F4] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]">Konfigurasi Finstart</p><h1 class="mt-1 text-[26px] font-semibold tracking-tight text-[#0B1F4A]">Pengaturan Sistem</h1><p class="mt-1 text-sm text-[#6B7A90]">Kelola identitas perusahaan, keamanan akses, dan aktivitas yang benar-benar tersimpan di server.</p></div>
        <div class="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-3.5 py-2.5 text-xs font-medium text-[#0B1F4A]"><Shield class="h-4 w-4 text-[#1E5AA8]" /> {roleLabel(userRole || '')}</div>
      </header>

      <div class="rounded-2xl border border-[#DCE7F4] bg-white p-2 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => activeTab.value = 'profile'} class={`flex min-h-[64px] items-center gap-3 rounded-xl px-4 text-left transition ${activeTab.value === 'profile' ? 'bg-[#0B1F4A] text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]' : 'text-[#53658A] hover:bg-[#F4F8FC]'}`}><span class={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab.value === 'profile' ? 'bg-white/10' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`}><Building2 class="h-5 w-5" /></span><span><span class="block text-sm font-medium">Profil Perusahaan</span><span class={`mt-0.5 block text-xs ${activeTab.value === 'profile' ? 'text-blue-100/80' : 'text-[#8A98AB]'}`}>Identitas legal dan mata uang operasional</span></span><ChevronRight class="ml-auto h-4 w-4" /></button>
        <button type="button" onClick={() => activeTab.value = 'security'} class={`flex min-h-[64px] items-center gap-3 rounded-xl px-4 text-left transition ${activeTab.value === 'security' ? 'bg-[#0B1F4A] text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]' : 'text-[#53658A] hover:bg-[#F4F8FC]'}`}><span class={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab.value === 'security' ? 'bg-white/10' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`}><Shield class="h-5 w-5" /></span><span><span class="block text-sm font-medium">Keamanan & Akses</span><span class={`mt-0.5 block text-xs ${activeTab.value === 'security' ? 'text-blue-100/80' : 'text-[#8A98AB]'}`}>Role, sesi aktif, dan audit trail</span></span><ChevronRight class="ml-auto h-4 w-4" /></button>
      </div></div>

      {activeTab.value === 'profile' ? <form onSubmit={handleSaveProfile} class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
        <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-3.5"><span class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"><Building2 class="h-6 w-6" /></span><div><h2 class="text-lg font-semibold text-[#0B1F4A]">Profil Perusahaan</h2><p class="mt-1 text-sm text-[#6B7A90]">FinStart internal menggunakan Rupiah (IDR); kurs dan multi-currency belum diaktifkan.</p></div></div><span class="w-fit rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#53658A]">Business profile</span></div>
        <div class="grid gap-5 px-6 py-7 md:grid-cols-2">
          <label class="space-y-2"><span class={labelClass}>Nama Entitas Bisnis</span><input value={profile.value.namaEntitas} onChange={event => profile.value = { ...profile.value, namaEntitas: event.target.value }} class={inputClass} /></label>
          <label class="space-y-2"><span class={labelClass}>NPWP Badan</span><input value={profile.value.npwp} onChange={event => profile.value = { ...profile.value, npwp: event.target.value }} class={inputClass} /></label>
          <label class="space-y-2"><span class={labelClass}>Mata Uang Dasar</span><input value="IDR - Indonesian Rupiah" disabled class={`${inputClass} cursor-not-allowed bg-[#F8FBFE] text-[#70819B]`} /></label>
          <label class="space-y-2"><span class={labelClass}>Tahun Fiskal Dimulai</span><select value={profile.value.tahunFiskal} onChange={event => profile.value = { ...profile.value, tahunFiskal: event.target.value }} class={inputClass}>{['Januari', 'April', 'Juli', 'Oktober'].map(item => <option key={item}>{item}</option>)}</select></label>
          <label class="space-y-2 md:col-span-2"><span class={labelClass}>Alamat Kantor Pusat</span><textarea rows={4} value={profile.value.alamat} onChange={event => profile.value = { ...profile.value, alamat: event.target.value }} class="min-h-[128px] w-full resize-y rounded-xl border border-[#D8E5F4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" /></label>
        </div>
        <footer class="flex flex-col gap-3 border-t border-[#E8EEF7] bg-[#FBFDFF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><p class="text-sm text-[#6B7A90]">Perubahan tersimpan pada konfigurasi workspace ini.</p><button type="submit" disabled={isSavingProfile.value} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] disabled:cursor-not-allowed disabled:opacity-60"><Save class="h-4 w-4" /> {isSavingProfile.value ? 'Menyimpan...' : 'Simpan Perubahan'}</button></footer>
      </form> : <div class="space-y-5">
        <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-3.5"><span class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"><Shield class="h-6 w-6" /></span><div><h2 class="text-lg font-semibold text-[#0B1F4A]">Keamanan & Akses</h2><p class="mt-1 text-sm text-[#6B7A90]">Data role, sesi, dan aktivitas di bawah ini diambil dari API server.</p></div></div>{isAdmin() ? <button type="button" onClick={() => isUserModalOpen.value = true} class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-medium text-[#0B1F4A] hover:bg-[#F8FBFE]"><UserPlus class="h-4 w-4" /> Tambah Pengguna</button> : <span class="text-xs text-[#8A98AB]">Manajemen pengguna hanya untuk Administrator</span>}</div>
          <div class="grid gap-4 px-6 py-6 md:grid-cols-3">
            <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"><Users class="h-4 w-4" /></span><p class="mt-4 text-2xl font-semibold text-[#0B1F4A]">{users.value.length || '-'}</p><p class="mt-1 text-sm font-medium text-[#53658A]">Pengguna terdaftar</p><p class="mt-1 text-xs leading-5 text-[#8A98AB]">Daftar aktual dari database pengguna.</p></div>
            <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"><BadgeCheck class="h-4 w-4" /></span><p class="mt-4 text-lg font-semibold text-[#0B1F4A]">{securitySettings.value.mfa_status === 'enabled' ? 'Aktif' : (securitySettings.value.mfa_status === 'pending' ? 'Menunggu konfirmasi' : 'Belum aktif')}</p><p class="mt-1 text-sm font-medium text-[#53658A]">Autentikasi dua langkah</p><p class="mt-1 text-xs leading-5 text-[#8A98AB]">MFA TOTP dapat diaktifkan dari Kontrol Keamanan di bawah.</p></div>
            <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"><Clock3 class="h-4 w-4" /></span><p class="mt-4 text-2xl font-semibold text-[#0B1F4A]">{sessions.value.length}</p><p class="mt-1 text-sm font-medium text-[#53658A]">Sesi server aktif</p><p class="mt-1 text-xs leading-5 text-[#8A98AB]">Sesi dapat ditutup dari daftar perangkat di bawah.</p></div>
          </div>
        </div>

        <div class="grid gap-5 2xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
          <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"><div><h3 class="text-base font-semibold text-[#0B1F4A]">Role & Hak Akses</h3><p class="mt-1 text-sm text-[#6B7A90]">Role berikut berasal dari tabel roles; pembatasan juga diterapkan pada API.</p></div>{isAdmin() && <span class="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E5AA8]">Kelola API role <ArrowUpRight class="h-4 w-4" /></span>}</div><div class="divide-y divide-[#EDF2F7] px-6">{roles.value.length ? roles.value.map(role => <div key={role.id} class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-xs font-semibold text-[#0B1F4A]">{String(role.name || 'R').slice(0, 2).toUpperCase()}</span><div class="min-w-0"><p class="text-sm font-medium text-[#182338]">{roleLabel(role.name)}</p><p class="mt-1 text-xs text-[#6B7A90]">{role.description || 'Role operasional FinStart.'}</p></div></div><span class="w-fit rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1 text-[10px] font-medium text-[#53658A]">{Number(role.user_count || 0)} pengguna</span></div>) : <p class="py-6 text-sm text-[#8A98AB]">Data role tidak tersedia untuk hak akses akun ini.</p>}</div></section>
          <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="border-b border-[#E8EEF7] px-6 py-5"><h3 class="text-base font-semibold text-[#0B1F4A]">Kontrol Keamanan</h3><p class="mt-1 text-sm text-[#6B7A90]">Pengaturan yang tersedia benar-benar disimpan di server.</p></div><div class="divide-y divide-[#EDF2F7] px-6"><div class="flex items-center justify-between gap-4 py-5"><div class="flex gap-3"><span class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"><KeyRound class="h-4 w-4" /></span><div><p class="text-sm font-medium text-[#182338]">Autentikasi dua langkah</p><p class="mt-1 text-xs leading-5 text-[#6B7A90]">Gunakan aplikasi authenticator berbasis TOTP untuk melindungi login akun Anda.</p></div></div>{securitySettings.value.mfa_status === 'enabled' ? <button type="button" onClick={() => mfaDisable.value = { open: true, code: '', password: '' }} class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">Nonaktifkan</button> : <button type="button" onClick={beginMfaSetup} class="rounded-xl bg-[#0B1F4A] px-3 py-2 text-[10px] font-semibold text-white">{securitySettings.value.mfa_status === 'pending' ? 'Atur ulang' : 'Aktifkan MFA'}</button>}</div><div class="flex items-center justify-between gap-4 py-5"><div class="flex gap-3"><span class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"><CircleAlert class="h-4 w-4" /></span><div><p class="text-sm font-medium text-[#182338]">Peringatan login baru</p><p class="mt-1 text-xs leading-5 text-[#6B7A90]">Notifikasi saat sesi login baru dibuat.</p></div></div><Toggle checked={Boolean(securitySettings.value.login_alerts)} disabled={isSavingSecurity.value} label="Peringatan login baru" onChange={() => saveSecurity({ ...securitySettings.value, login_alerts: !securitySettings.value.login_alerts })} /></div><div class="flex items-center justify-between gap-4 py-5"><div class="flex gap-3"><span class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"><Monitor class="h-4 w-4" /></span><div><p class="text-sm font-medium text-[#182338]">Peringatan sesi</p><p class="mt-1 text-xs leading-5 text-[#6B7A90]">Notifikasi ketika sesi perangkat ditutup atau berubah.</p></div></div><Toggle checked={Boolean(securitySettings.value.session_alerts)} disabled={isSavingSecurity.value} label="Peringatan sesi" onChange={() => saveSecurity({ ...securitySettings.value, session_alerts: !securitySettings.value.session_alerts })} /></div><div class="flex justify-end py-4"><button type="button" onClick={() => isPasswordOpen.value = !isPasswordOpen.value} class="inline-flex items-center gap-2 text-xs font-semibold text-[#1E5AA8]"><LockKeyhole class="h-4 w-4" /> Ubah kata sandi</button></div>{isPasswordOpen.value && <form onSubmit={changePassword} class="space-y-3 border-t border-[#EDF2F7] py-4"><input required type="password" value={passwordForm.value.current_password} onChange={event => passwordForm.value = { ...passwordForm.value, current_password: event.target.value }} placeholder="Password saat ini" class={inputClass} /><input required type="password" value={passwordForm.value.new_password} onChange={event => passwordForm.value = { ...passwordForm.value, new_password: event.target.value }} placeholder="Password baru (minimal 8 karakter)" class={inputClass} /><input required type="password" value={passwordForm.value.confirm_password} onChange={event => passwordForm.value = { ...passwordForm.value, confirm_password: event.target.value }} placeholder="Konfirmasi password baru" class={inputClass} /><button type="submit" class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white">Simpan Password</button></form>}</div></section>
        </div>

        <div class="grid gap-5 xl:grid-cols-2">
          <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="border-b border-[#E8EEF7] px-6 py-5"><h3 class="text-base font-semibold text-[#0B1F4A]">Sesi Aktif</h3><p class="mt-1 text-sm text-[#6B7A90]">Perangkat yang sedang menggunakan akun Anda atau dapat Anda kelola.</p></div><div class="divide-y divide-[#EDF2F7] px-6">{sessions.value.length ? sessions.value.map(session => <div key={session.id} class="flex items-center gap-3 py-4"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#1E5AA8]">{String(session.user_agent || '').toLowerCase().includes('mobile') ? <Smartphone class="h-5 w-5" /> : <Monitor class="h-5 w-5" />}</span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-[#182338]">{session.user_name || userEmail}</p><p class="mt-1 truncate text-xs text-[#6B7A90]">{session.ip_address || 'IP tidak tersedia'} · {formatTime(session.created_at)}</p></div><div class="flex items-center gap-2"><span class="rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-2.5 py-1 text-[10px] font-medium text-[#0B1F4A]">{session.current_session ? 'Saat ini' : 'Aktif'}</span><button type="button" onClick={() => closeSession(session)} class="text-[10px] font-semibold text-rose-600">Tutup</button></div></div>) : <p class="py-6 text-sm text-[#8A98AB]">Tidak ada sesi yang dapat ditampilkan.</p>}</div></section>
          <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="border-b border-[#E8EEF7] px-6 py-5"><h3 class="text-base font-semibold text-[#0B1F4A]">Aktivitas Keamanan & Audit</h3><p class="mt-1 text-sm text-[#6B7A90]">Jejak aktivitas dari tabel activity_logs.</p></div><div class="divide-y divide-[#EDF2F7] px-6">{activity.value.length ? activity.value.slice(0, 10).map(item => <div key={item.id} class="flex items-start gap-3 py-4"><span class="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"><CheckCircle2 class="h-4 w-4" /></span><div class="min-w-0"><p class="text-sm font-medium text-[#182338]">{item.activity || item.description || 'Aktivitas sistem'}</p><p class="mt-1 text-xs text-[#6B7A90]">{item.user_name || item.user_email || 'Sistem'} · {formatTime(item.created_at)}</p></div></div>) : <p class="py-6 text-sm text-[#8A98AB]">Belum ada aktivitas audit yang dapat ditampilkan.</p>}</div></section>
        </div>
      </div>}

      {mfaSetup.value.open && <div class="fixed inset-0 z-[110] flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm"><div class="w-full max-w-xl overflow-hidden rounded-[24px] bg-white shadow-2xl"><div class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Keamanan Akun</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Aktifkan MFA TOTP</h3></div><button type="button" onClick={() => mfaSetup.value = { open: false, secret: '', otpauth_url: '', code: '' }} class="rounded-xl p-2 text-[#6B7A90]"><X class="h-5 w-5" /></button></div><form onSubmit={confirmMfa} class="space-y-4 p-6"><p class="text-sm leading-6 text-[#53658A]">Tambahkan secret berikut ke Google Authenticator, Microsoft Authenticator, atau aplikasi TOTP lain. Setelah itu masukkan kode enam digit yang muncul.</p><div class="rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] p-4"><p class={labelClass}>Secret TOTP</p><code class="mt-2 block break-all text-sm font-bold tracking-[0.12em] text-[#0B1F4A]">{mfaSetup.value.secret}</code><p class="mt-3 text-[11px] leading-5 text-[#70819B]">URI untuk aplikasi yang mendukung impor: {mfaSetup.value.otpauth_url}</p></div><input required inputmode="numeric" maxlength="6" value={mfaSetup.value.code} onChange={event => mfaSetup.value = { ...mfaSetup.value, code: event.target.value.replace(/\D/g, '').slice(0, 6) }} placeholder="Kode 6 digit" class={inputClass} /><div class="flex justify-end gap-3"><button type="button" onClick={() => mfaSetup.value = { open: false, secret: '', otpauth_url: '', code: '' }} class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium">Batal</button><button type="submit" class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white">Konfirmasi MFA</button></div></form></div></div>}
      {mfaDisable.value.open && <div class="fixed inset-0 z-[110] flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm"><div class="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"><div class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Keamanan Akun</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Nonaktifkan MFA</h3></div><button type="button" onClick={() => mfaDisable.value = { open: false, code: '', password: '' }} class="rounded-xl p-2 text-[#6B7A90]"><X class="h-5 w-5" /></button></div><form onSubmit={disableMfa} class="space-y-4 p-6"><p class="text-sm leading-6 text-[#53658A]">Masukkan password dan kode authenticator saat ini untuk menonaktifkan MFA.</p><input required type="password" value={mfaDisable.value.password} onChange={event => mfaDisable.value = { ...mfaDisable.value, password: event.target.value }} placeholder="Password saat ini" class={inputClass} /><input required inputmode="numeric" maxlength="6" value={mfaDisable.value.code} onChange={event => mfaDisable.value = { ...mfaDisable.value, code: event.target.value.replace(/\D/g, '').slice(0, 6) }} placeholder="Kode MFA 6 digit" class={inputClass} /><div class="flex justify-end gap-3"><button type="button" onClick={() => mfaDisable.value = { open: false, code: '', password: '' }} class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium">Batal</button><button type="submit" class="h-10 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white">Nonaktifkan</button></div></form></div></div>}

      {isUserModalOpen.value && <div class="fixed inset-0 z-[100] flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm"><div class="w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-2xl"><div class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Administrator</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Tambah Pengguna</h3></div><button type="button" onClick={() => isUserModalOpen.value = false} class="rounded-xl p-2 text-[#6B7A90]"><X class="h-5 w-5" /></button></div><form onSubmit={createUser} class="space-y-4 p-6"><input required value={newUser.value.name} onChange={event => newUser.value = { ...newUser.value, name: event.target.value }} placeholder="Nama pengguna" class={inputClass} /><input required type="email" value={newUser.value.email} onChange={event => newUser.value = { ...newUser.value, email: event.target.value }} placeholder="Email" class={inputClass} /><input value={newUser.value.phone} onChange={event => newUser.value = { ...newUser.value, phone: event.target.value }} placeholder="Nomor telepon (opsional)" class={inputClass} /><select required value={newUser.value.role_id} onChange={event => newUser.value = { ...newUser.value, role_id: event.target.value }} class={inputClass}><option value="">Pilih role</option>{roles.value.map(role => <option key={role.id} value={role.id}>{roleLabel(role.name)}</option>)}</select><input required minLength={8} type="password" value={newUser.value.password} onChange={event => newUser.value = { ...newUser.value, password: event.target.value }} placeholder="Password awal (minimal 8 karakter)" class={inputClass} /><div class="flex justify-end gap-3 pt-2"><button type="button" onClick={() => isUserModalOpen.value = false} class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium">Batal</button><button type="submit" class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"><Plus class="h-4 w-4" /> Buat Pengguna</button></div></form></div></div>}
    </div>;
  },
});
</script>
