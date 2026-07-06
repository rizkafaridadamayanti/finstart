<script lang="tsx">
import { Fragment, defineComponent, h, ref } from "vue";
import { Bell, ChevronDown, ShieldAlert, CheckCircle2, DollarSign, LogOut, Menu } from "lucide-vue-next";
interface TopbarProps {
  userEmail: string;
  onLogout: () => void;
  notifications: {
    id: string;
    text: string;
    type: 'warning' | 'info' | 'success';
    time: string;
  }[];
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}
export default defineComponent({
  name: "Topbar",
  props: ["userEmail", "onLogout", "notifications", "isSidebarCollapsed", "setIsSidebarCollapsed"],
  setup(props) {
    const {
      userEmail,
      onLogout,
      notifications,
      isSidebarCollapsed,
      setIsSidebarCollapsed
    }: TopbarProps = props;
    const isProfileOpen = ref(false),
      setIsProfileOpen = next => isProfileOpen.value = typeof next === "function" ? next(isProfileOpen.value) : next;
    const isNotifOpen = ref(false),
      setIsNotifOpen = next => isNotifOpen.value = typeof next === "function" ? next(isNotifOpen.value) : next; // Dynamic day/date formatted in Indonesian
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formattedDate = today.toLocaleDateString('id-ID', options);
    return () => <header class="sticky top-0 z-20 grid h-[88px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/70 bg-white/82 px-5 shadow-[0_12px_34px_rgba(16,42,86,0.07)] backdrop-blur-2xl md:px-8">
      <div class="flex min-w-0 items-center gap-3">
        {isSidebarCollapsed && <button id="btn-sidebar-show" type="button" onClick={() => setIsSidebarCollapsed(false)} class="hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#0B3A78]/10 bg-[#0B3A78] text-white shadow-xl transition-colors hover:bg-[#082E61] lg:flex" title="Tampilkan sidebar">
            <Menu class="w-5 h-5" />
          </button>}
        <div class="min-w-0">
          <div class="flex min-w-0 items-center gap-3">
            <div class="truncate text-[21px] font-extrabold tracking-[-0.02em] text-[#102A56]">Finstart</div>
            <span class="hidden h-1.5 w-1.5 rounded-full bg-[#2BA7FF] sm:block" />
            <span class="hidden rounded-full border border-[#DCE7F4] bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#52647E] shadow-[0_8px_18px_rgba(16,42,86,0.05)] md:inline-flex">
              CFO Workspace
            </span>
          </div>
          <div class="hidden truncate text-[10px] font-bold uppercase tracking-[0.24em] text-[#7A8CA8] sm:block">Finance Command Center</div>
        </div>
      </div>

      {/* 2. Right Actions: Date, Notification bell, profile dropdown */}
      <div class="flex min-w-0 items-center gap-3">
        {/* Date string */}
        <span class="hidden whitespace-nowrap text-[12px] font-medium text-[#8492A6] xl:block">
          {formattedDate}
        </span>

        {/* Dynamic Notification bell */}
        <div class="relative">
          <button id="btn-notif-bell" onClick={() => setIsNotifOpen(!isNotifOpen.value)} class="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D8E5F4] bg-white/92 text-[#64748B] shadow-[0_10px_24px_rgba(16,42,86,0.07)] transition hover:bg-white hover:text-[#0B1F4A]">
            <Bell class="w-4 h-4" />
            {notifications.length > 0 && <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />}
          </button>

          {/* Notification Menu Card */}
          {isNotifOpen.value && <div class="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl">
              <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span class="font-bold text-xs text-[#0B1F4A]">Notifikasi Finansial</span>
                <span class="text-[10px] bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded-full font-semibold">{notifications.length} Info</span>
              </div>

              <div class="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notifications.length === 0 ? <div class="p-6 text-center text-slate-400 font-light">
                    Tidak ada notifikasi baru harian.
                  </div> : notifications.map(notif => <div key={notif.id} class="p-4 hover:bg-slate-50 flex gap-3">
                      <div class="shrink-0 mt-0.5">
                        {notif.type === 'warning' && <ShieldAlert class="w-4 h-4 text-rose-500" />}
                        {notif.type === 'success' && <CheckCircle2 class="w-4 h-4 text-emerald-500" />}
                        {notif.type === 'info' && <DollarSign class="w-4 h-4 text-blue-500" />}
                      </div>
                      <div class="space-y-1">
                        <p class="text-slate-700 leading-relaxed">{notif.text}</p>
                        <span class="text-[10px] text-slate-400 block font-mono">{notif.time}</span>
                      </div>
                    </div>)}
              </div>
            </div>}
        </div>

        {/* User profile dropdown info */}
        <div class="relative">
          <button id="btn-profile-dropdown" onClick={() => setIsProfileOpen(!isProfileOpen.value)} class="grid h-12 min-w-[190px] grid-cols-[34px_minmax(0,1fr)_16px] items-center gap-3 rounded-2xl border border-[#D8E5F4] bg-white/92 px-2.5 shadow-[0_10px_24px_rgba(16,42,86,0.07)] transition-colors hover:bg-white max-sm:min-w-0 max-sm:grid-cols-[34px_16px]">
            {/* Mock User Avatar */}
            <div class="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#0B3A78] text-xs font-extrabold text-white shadow-lg shadow-[#1E5AA8]/20">
              {userEmail.slice(0, 2).toUpperCase()}
            </div>
            <div class="hidden min-w-0 flex-col text-left sm:flex">
              <span class="block truncate text-xs font-bold text-slate-700">{userEmail.split('@')[0]}</span>
              <span class="block truncate text-[9px] font-semibold uppercase leading-3 text-slate-400">Finance Manager</span>
            </div>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu Card */}
          {isProfileOpen.value && <div class="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl">
              <div class="p-4 bg-slate-50 border-b border-slate-100">
                <span class="text-[10px] uppercase font-bold text-[#2563EB] block">Hak Akses</span>
                <span class="text-xs font-bold text-slate-800 block truncate">{userEmail}</span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">PT Kedata Indonesia Digital</span>
              </div>

              <div class="p-2 text-xs divide-y divide-slate-100">
                <div class="py-1">
                  <button onClick={() => setIsProfileOpen(false)} class="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Ubah Password
                  </button>
                  <button onClick={() => setIsProfileOpen(false)} class="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Profil Saya
                  </button>
                </div>
                <div class="py-1">
                  <button onClick={() => {
                  setIsProfileOpen(false);
                  onLogout();
                }} class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold flex items-center gap-2">
                    <LogOut class="w-4 h-4" /> Keluar Sesi
                  </button>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </header>;
  }
});
</script>
