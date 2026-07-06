<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, ref } from "vue";
import { ArrowUpRight, BadgeCheck, Building2, CheckCircle2, ChevronRight, CircleAlert, Clock3, KeyRound, LockKeyhole, Monitor, Save, Shield, Smartphone, UserPlus, Users } from "lucide-vue-next";
import { financeApi, getApiErrorMessage } from '../services/financeApi.js';
interface PengaturanViewProps {
  userEmail: string;
  showToast: (msg: string) => void;
}
type SettingsTab = 'profile' | 'security';
function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} class={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition ${checked ? 'border-[#0B1F4A] bg-[#0B1F4A]' : 'border-[#C9D8E8] bg-[#EEF4FB]'}`}>
      <span class={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>;
}
const roles = [{
  initials: 'FM',
  name: 'Finance Manager',
  detail: 'Kontrol penuh atas finance, laporan, dan persetujuan.',
  access: 'Full access'
}, {
  initials: 'SF',
  name: 'Staff Finance',
  detail: 'Pencatatan jurnal, piutang, utang, dan rekonsiliasi.',
  access: 'Operasional'
}, {
  initials: 'PM',
  name: 'Project Manager',
  detail: 'Akses CRM proyek, klien, dan status anggaran.',
  access: 'Terbatas'
}, {
  initials: 'AU',
  name: 'Auditor',
  detail: 'Akses baca laporan dan histori aktivitas.',
  access: 'Read only'
}];
const sessions = [{
  icon: Monitor,
  label: 'Chrome · Windows 11',
  meta: 'Jakarta, Indonesia · Sesi saat ini',
  current: true
}, {
  icon: Smartphone,
  label: 'Safari · iPhone',
  meta: 'Yogyakarta, Indonesia · 2 jam lalu',
  current: false
}];
const activity = [['MFA diperbarui', 'Finance Manager', 'Hari ini, 09:42'], ['Ekspor laporan arus kas', 'Staff Finance', 'Kemarin, 16:18'], ['Role Project Manager disesuaikan', 'System Admin', '28 Jun 2026']];
export default defineComponent({
  name: "PengaturanView",
  props: ["userEmail", "showToast"],
  setup(props) {
    const {
      userEmail,
      showToast
    }: PengaturanViewProps = props;
    const activeTab = ref('profile'),
      setActiveTab = next => activeTab.value = typeof next === "function" ? next(activeTab.value) : next;
    const twoFactorEnabled = ref(true),
      setTwoFactorEnabled = next => twoFactorEnabled.value = typeof next === "function" ? next(twoFactorEnabled.value) : next;
    const loginAlertsEnabled = ref(true),
      setLoginAlertsEnabled = next => loginAlertsEnabled.value = typeof next === "function" ? next(loginAlertsEnabled.value) : next;
    const profile = ref({
        namaEntitas: '',
        npwp: '',
        mataUang: 'IDR - Indonesian Rupiah',
        tahunFiskal: 'Januari',
        alamat: ''
      }),
      setProfile = next => profile.value = typeof next === "function" ? next(profile.value) : next;

    const companySettings = ref<any>({});
    const isSavingProfile = ref(false);

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    function currencyLabel(currency: string) {
      const labels: Record<string, string> = {
        IDR: 'IDR - Indonesian Rupiah',
        USD: 'USD - United States Dollar',
        EUR: 'EUR - Euro',
      };
      return labels[String(currency || 'IDR').toUpperCase()] || 'IDR - Indonesian Rupiah';
    }

    function currencyCode(label: string) {
      return String(label || 'IDR').split(' - ')[0].trim().toUpperCase() || 'IDR';
    }

    async function loadCompanySettings() {
      try {
        const data = await financeApi.get('/company-settings');
        companySettings.value = data || {};
        const startMonth = Number(data?.fiscal_year_start_month || 1);
        setProfile({
          namaEntitas: data?.company_name || '',
          npwp: data?.npwp || '',
          mataUang: currencyLabel(data?.currency),
          tahunFiskal: monthNames[startMonth - 1] || 'Januari',
          alamat: data?.address || '',
        });
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, 'Gagal memuat pengaturan perusahaan dari database.'));
      }
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
          currency: currencyCode(profile.value.mataUang),
          address: profile.value.alamat,
          fiscal_year: Number(companySettings.value?.fiscal_year || new Date().getFullYear()),
          fiscal_year_start_month: fiscalStartMonth,
        });
        companySettings.value = saved || companySettings.value;
        await loadCompanySettings();
        showToast('Profil perusahaan berhasil disimpan ke database.');
      } catch (error) {
        console.error(error);
        showToast(getApiErrorMessage(error, 'Gagal menyimpan profil perusahaan.'));
      } finally {
        isSavingProfile.value = false;
      }
    }

    onMounted(() => {
      loadCompanySettings();
    });
    const labelClass = 'text-[10px] font-semibold uppercase tracking-[0.14em] text-[#70819B]';
    const inputClass = 'h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10';
    return () => <div class="space-y-7 font-sans">
      <header class="flex flex-col gap-4 border-b border-[#DCE7F4] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]">Konfigurasi Finstart</p>
          <h1 class="mt-1 text-[26px] font-semibold tracking-tight text-[#0B1F4A]">Pengaturan Sistem</h1>
          <p class="mt-1 text-sm text-[#6B7A90]">Kelola identitas bisnis, keamanan akses, dan kontrol operasional workspace.</p>
        </div>
        <div class="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-3.5 py-2.5 text-xs font-medium text-[#0B1F4A]">
          <Shield class="h-4 w-4 text-[#1E5AA8]" /> Workspace terlindungi
        </div>
      </header>

      <div class="rounded-2xl border border-[#DCE7F4] bg-white p-2 shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
        <div class="grid gap-2 sm:grid-cols-2">
          <button id="settings-tab-profile" type="button" onClick={() => setActiveTab('profile')} class={`flex min-h-[64px] items-center gap-3 rounded-xl px-4 text-left transition ${activeTab.value === 'profile' ? 'bg-[#0B1F4A] text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]' : 'text-[#53658A] hover:bg-[#F4F8FC]'}`}>
            <span class={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab.value === 'profile' ? 'bg-white/10' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`}><Building2 class="h-5 w-5" /></span>
            <span><span class="block text-sm font-medium">Profil Perusahaan</span><span class={`mt-0.5 block text-xs ${activeTab.value === 'profile' ? 'text-blue-100/80' : 'text-[#8A98AB]'}`}>Identitas legal & preferensi workspace</span></span>
            <ChevronRight class="ml-auto h-4 w-4" />
          </button>
          <button id="settings-tab-security" type="button" onClick={() => setActiveTab('security')} class={`flex min-h-[64px] items-center gap-3 rounded-xl px-4 text-left transition ${activeTab.value === 'security' ? 'bg-[#0B1F4A] text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]' : 'text-[#53658A] hover:bg-[#F4F8FC]'}`}>
            <span class={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab.value === 'security' ? 'bg-white/10' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`}><Shield class="h-5 w-5" /></span>
            <span><span class="block text-sm font-medium">Keamanan & Akses</span><span class={`mt-0.5 block text-xs ${activeTab.value === 'security' ? 'text-blue-100/80' : 'text-[#8A98AB]'}`}>Role, sesi aktif, dan kontrol keamanan</span></span>
            <ChevronRight class="ml-auto h-4 w-4" />
          </button>
        </div>
      </div>

      {activeTab.value === 'profile' ? <form onSubmit={handleSaveProfile} class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
          <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-3.5"><span class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"><Building2 class="h-6 w-6" /></span><div><h2 class="text-lg font-semibold text-[#0B1F4A]">Profil Perusahaan</h2><p class="mt-1 text-sm text-[#6B7A90]">Identitas legal dan preferensi utama Finstart.</p></div></div>
            <span class="w-fit rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#53658A]">Business profile</span>
          </div>
          <div class="grid gap-5 px-6 py-7 md:grid-cols-2">
            <label class="space-y-2"><span class={labelClass}>Nama Entitas Bisnis</span><input id="settings-company-name" value={profile.value.namaEntitas} onChange={event => setProfile({
              ...profile.value,
              namaEntitas: event.target.value
            })} class={inputClass} /></label>
            <label class="space-y-2"><span class={labelClass}>NPWP Badan</span><input id="settings-company-npwp" value={profile.value.npwp} onChange={event => setProfile({
              ...profile.value,
              npwp: event.target.value
            })} class={inputClass} /></label>
            <label class="space-y-2"><span class={labelClass}>Mata Uang Dasar</span><select id="settings-company-currency" value={profile.value.mataUang} onChange={event => setProfile({
              ...profile.value,
              mataUang: event.target.value
            })} class={inputClass}><option>IDR - Indonesian Rupiah</option><option>USD - United States Dollar</option><option>EUR - Euro</option></select></label>
            <label class="space-y-2"><span class={labelClass}>Tahun Fiskal Dimulai</span><select id="settings-company-fiscal" value={profile.value.tahunFiskal} onChange={event => setProfile({
              ...profile.value,
              tahunFiskal: event.target.value
            })} class={inputClass}>{['Januari', 'April', 'Juli', 'Oktober'].map(item => <option key={item}>{item}</option>)}</select></label>
            <label class="space-y-2 md:col-span-2"><span class={labelClass}>Alamat Kantor Pusat</span><textarea id="settings-company-address" rows={4} value={profile.value.alamat} onChange={event => setProfile({
              ...profile.value,
              alamat: event.target.value
            })} class="min-h-[128px] w-full resize-y rounded-xl border border-[#D8E5F4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10" /></label>
          </div>
          <footer class="flex flex-col gap-3 border-t border-[#E8EEF7] bg-[#FBFDFF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><p class="text-sm text-[#6B7A90]">Perubahan hanya diterapkan pada konfigurasi workspace ini.</p><button id="btn-save-settings" type="submit" disabled={isSavingProfile.value} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] disabled:cursor-not-allowed disabled:opacity-60"><Save class="h-4 w-4" /> {isSavingProfile.value ? 'Menyimpan...' : 'Simpan Perubahan'}</button></footer>
        </form> : <div class="space-y-5">
          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-3.5"><span class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"><Shield class="h-6 w-6" /></span><div><h2 class="text-lg font-semibold text-[#0B1F4A]">Keamanan & Akses</h2><p class="mt-1 text-sm text-[#6B7A90]">Kelola role pengguna, sesi aktif, dan kontrol perlindungan workspace.</p></div></div><button type="button" onClick={() => showToast('Panel pengelolaan pengguna siap digunakan.')} class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-medium text-[#0B1F4A] hover:bg-[#F8FBFE]"><UserPlus class="h-4 w-4" /> Tambah Pengguna</button></div>
            <div class="grid gap-4 px-6 py-6 md:grid-cols-3">
              {[['12', 'Pengguna aktif', 'Akses tim terkelola dengan role berbeda.', Users], ['MFA', 'Verifikasi dua langkah', 'Aktif untuk akun dengan akses pengaturan.', BadgeCheck], ['15 mnt', 'Batas sesi tidak aktif', 'Sesi diakhiri saat tidak ada aktivitas.', Clock3]].map(([value, label, detail, Icon]) => {
              const CardIcon = Icon as typeof Users;
              return <div key={String(label)} class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"><CardIcon class="h-4 w-4" /></span><p class="mt-4 text-2xl font-semibold text-[#0B1F4A]">{String(value)}</p><p class="mt-1 text-sm font-medium text-[#53658A]">{String(label)}</p><p class="mt-1 text-xs leading-5 text-[#8A98AB]">{String(detail)}</p></div>;
            })}
            </div>
          </div>

          <div class="grid gap-5 2xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
            <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
              <div class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"><div><h3 class="text-base font-semibold text-[#0B1F4A]">Role & Hak Akses</h3><p class="mt-1 text-sm text-[#6B7A90]">Struktur akses operasional Finstart.</p></div><button type="button" onClick={() => showToast('Pengaturan role ditampilkan untuk review administrator.')} class="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E5AA8]">Kelola role <ArrowUpRight class="h-4 w-4" /></button></div>
              <div class="divide-y divide-[#EDF2F7] px-6">{roles.map(role => <div key={role.name} class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-xs font-semibold text-[#0B1F4A]">{role.initials}</span><div class="min-w-0"><p class="text-sm font-medium text-[#182338]">{role.name}</p><p class="mt-1 text-xs text-[#6B7A90]">{role.detail}</p></div></div><span class="w-fit rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1 text-[10px] font-medium text-[#53658A]">{role.access}</span></div>)}</div>
            </section>
            <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="border-b border-[#E8EEF7] px-6 py-5"><h3 class="text-base font-semibold text-[#0B1F4A]">Kontrol Keamanan</h3><p class="mt-1 text-sm text-[#6B7A90]">Preferensi perlindungan untuk workspace.</p></div><div class="divide-y divide-[#EDF2F7] px-6"><div class="flex items-center justify-between gap-4 py-5"><div class="flex gap-3"><span class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"><KeyRound class="h-4 w-4" /></span><div><p class="text-sm font-medium text-[#182338]">Autentikasi dua langkah</p><p class="mt-1 text-xs leading-5 text-[#6B7A90]">Minta verifikasi tambahan untuk akun prioritas.</p></div></div><Toggle checked={twoFactorEnabled.value} label="Autentikasi dua langkah" onChange={() => {
                  setTwoFactorEnabled(value => !value);
                  showToast(twoFactorEnabled.value ? 'Autentikasi dua langkah dinonaktifkan.' : 'Autentikasi dua langkah diaktifkan.');
                }} /></div><div class="flex items-center justify-between gap-4 py-5"><div class="flex gap-3"><span class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"><CircleAlert class="h-4 w-4" /></span><div><p class="text-sm font-medium text-[#182338]">Peringatan login baru</p><p class="mt-1 text-xs leading-5 text-[#6B7A90]">Kirim notifikasi ketika akun dipakai dari perangkat baru.</p></div></div><Toggle checked={loginAlertsEnabled.value} label="Peringatan login baru" onChange={() => {
                  setLoginAlertsEnabled(value => !value);
                  showToast(loginAlertsEnabled.value ? 'Peringatan login dinonaktifkan.' : 'Peringatan login diaktifkan.');
                }} /></div></div></section>
          </div>

          <div class="grid gap-5 xl:grid-cols-2">
            <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="border-b border-[#E8EEF7] px-6 py-5"><h3 class="text-base font-semibold text-[#0B1F4A]">Sesi Aktif</h3><p class="mt-1 text-sm text-[#6B7A90]">Pantau perangkat yang menggunakan akun {userEmail}.</p></div><div class="divide-y divide-[#EDF2F7] px-6">{sessions.map(session => {
                const SessionIcon = session.icon;
                return <div key={session.label} class="flex items-center gap-3 py-4"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#1E5AA8]"><SessionIcon class="h-5 w-5" /></span><div class="min-w-0 flex-1"><p class="text-sm font-medium text-[#182338]">{session.label}</p><p class="mt-1 text-xs text-[#6B7A90]">{session.meta}</p></div><span class="rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-2.5 py-1 text-[10px] font-medium text-[#0B1F4A]">{session.current ? 'Aktif' : 'Terverifikasi'}</span></div>;
              })}</div></section>
            <section class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"><div class="border-b border-[#E8EEF7] px-6 py-5"><h3 class="text-base font-semibold text-[#0B1F4A]">Aktivitas Keamanan</h3><p class="mt-1 text-sm text-[#6B7A90]">Jejak perubahan dan aktivitas penting workspace.</p></div><div class="divide-y divide-[#EDF2F7] px-6">{activity.map(([action, owner, time]) => <div key={action} class="flex items-start gap-3 py-4"><span class="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"><CheckCircle2 class="h-4 w-4" /></span><div class="min-w-0"><p class="text-sm font-medium text-[#182338]">{action}</p><p class="mt-1 text-xs text-[#6B7A90]">{owner} · {time}</p></div></div>)}</div></section>
          </div>
        </div>}
    </div>;
  }
});
</script>
