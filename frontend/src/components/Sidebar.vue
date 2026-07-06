<script lang="tsx">
import { Fragment, defineComponent, h, ref } from "vue";
import { LayoutDashboard, Briefcase, BookOpen, ArrowLeftRight, Cloud, ArrowDownLeft, ArrowUpRight, TrendingUp, Percent, Users, Box, FileText, Settings, Menu, X, LogOut } from "lucide-vue-next";
import KedataLogo from './KedataLogo.vue';
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}
export default defineComponent({
  name: "Sidebar",
  props: ["activeTab", "setActiveTab", "isCollapsed", "setIsCollapsed", "onLogout"],
  setup(props) {
    const {
      activeTab,
      setActiveTab,
      isCollapsed,
      setIsCollapsed,
      onLogout
    }: SidebarProps = props;
    const isMobileOpen = ref(false),
      setIsMobileOpen = next => isMobileOpen.value = typeof next === "function" ? next(isMobileOpen.value) : next;
    const menuItems = [{
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard class="h-[18px] w-[18px]" />
    }, {
      id: 'crm',
      label: 'CRM & Proyek',
      icon: <Briefcase class="h-[18px] w-[18px]" />
    }, {
      id: 'bukubesar',
      label: 'Buku Besar',
      icon: <BookOpen class="h-[18px] w-[18px]" />
    }, {
      id: 'transaksi',
      label: 'Transaksi',
      icon: <ArrowLeftRight class="h-[18px] w-[18px]" />
    }, {
      id: 'langganan',
      label: 'Langganan',
      icon: <Cloud class="h-[18px] w-[18px]" />
    }, {
      id: 'piutang',
      label: 'Piutang',
      icon: <ArrowDownLeft class="h-[18px] w-[18px] text-emerald-400" />
    }, {
      id: 'utang',
      label: 'Utang',
      icon: <ArrowUpRight class="h-[18px] w-[18px] text-rose-400" />
    }, {
      id: 'proyeksi',
      label: 'Proyeksi Bisnis',
      icon: <TrendingUp class="h-[18px] w-[18px]" />
    }, {
      id: 'perpajakan',
      label: 'Perpajakan',
      icon: <Percent class="h-[18px] w-[18px]" />
    }, {
      id: 'sdm',
      label: 'SDM',
      icon: <Users class="h-[18px] w-[18px]" />
    }, {
      id: 'aset',
      label: 'Aset',
      icon: <Box class="h-[18px] w-[18px]" />
    }, {
      id: 'laporan',
      label: 'Laporan',
      icon: <FileText class="h-[18px] w-[18px]" />
    }, {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: <Settings class="h-[18px] w-[18px]" />
    }];
    const navigate = (id: string) => {
      setActiveTab(id);
      setIsMobileOpen(false);
    };
    return () => <>
      <div class="sticky top-0 z-30 grid h-[88px] grid-cols-[48px_minmax(0,1fr)_42px] items-center gap-3 border-b border-[#DCE7F4] bg-white/95 px-4 text-[#102A56] shadow-md backdrop-blur-xl lg:hidden">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-[0_10px_24px_rgba(16,42,86,0.12)] ring-1 ring-[#DCE7F4]">
            <KedataLogo class="h-full w-full" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-[18px] font-extrabold leading-none tracking-[0.16em] text-[#102A56]">FINSTART</p>
          <p class="mt-2 truncate text-[9px] font-bold uppercase tracking-[0.2em] text-[#7A8CA8]">Financial Operations</p>
        </div>
        <button id="btn-sidebar-mobile-toggle" onClick={() => setIsMobileOpen(!isMobileOpen.value)} class="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#DCE7F4] bg-white text-[#102A56] shadow-[0_8px_18px_rgba(16,42,86,0.08)] transition hover:bg-[#F4F8FC]" aria-label="Buka menu navigasi">
          {isMobileOpen.value ? <X class="h-5 w-5" /> : <Menu class="h-5 w-5" />}
        </button>
      </div>

      <aside id="desktop-sidebar" class={`${isCollapsed ? 'hidden' : 'hidden lg:flex'} sticky top-0 z-30 h-screen w-[286px] shrink-0 flex-col border-r border-[#DCE7F4] bg-white text-[#52647E] shadow-[18px_0_50px_rgba(16,42,86,0.08)] transition-all duration-300`}>
        <div class="grid h-[88px] grid-cols-[52px_minmax(0,1fr)_42px] items-center gap-3 border-b border-[#E8EEF7] px-4">
          <div class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-[0_12px_26px_rgba(16,42,86,0.12)] ring-1 ring-[#DCE7F4]">
              <KedataLogo class="h-full w-full" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-[20px] font-extrabold leading-none tracking-[0.16em] text-[#102A56]">FINSTART</p>
            <p class="mt-2 truncate text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#7A8CA8]">Financial Operations</p>
          </div>

          <button id="btn-sidebar-collapse" onClick={() => setIsCollapsed(true)} class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#DCE7F4] bg-white text-[#52647E] shadow-[0_8px_18px_rgba(16,42,86,0.08)] transition hover:bg-[#F4F8FC] hover:text-[#102A56] lg:flex" title="Sembunyikan sidebar" aria-label="Sembunyikan sidebar">
            <Menu class="h-5 w-5" />
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <div class="space-y-1">
            {menuItems.map(item => {
              const isActive = activeTab === item.id;
              return <button id={`sidebar-item-${item.id}`} key={item.id} onClick={() => navigate(item.id)} class={`group flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-medium leading-tight transition-all ${isActive ? 'bg-[#0B3A78] text-white shadow-[inset_3px_0_0_#2BA7FF,0_14px_30px_rgba(11,58,120,0.22)]' : 'text-[#52647E] hover:bg-[#F7FAFD] hover:text-[#102A56] hover:shadow-[inset_3px_0_0_rgba(30,90,168,0.28)]'}`} title={isCollapsed ? item.label : undefined}>
                  <span class={`shrink-0 ${isActive ? 'text-white' : 'text-[#8A99AD] group-hover:text-[#0E4F9E]'}`}>{item.icon}</span>
                  <span class="min-w-0 truncate">{item.label}</span>
                </button>;
            })}
          </div>
        </nav>

        <div class="border-t border-[#E8EEF7] p-3">
          <button id="btn-sidebar-logout" onClick={onLogout} class="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700">
            <LogOut class="h-[18px] w-[18px]" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {isMobileOpen.value && <div class="fixed inset-0 z-40 flex bg-black/60 backdrop-blur-sm lg:hidden">
          <aside class="flex h-full w-[300px] max-w-[86vw] flex-col border-r border-[#DCE7F4] bg-white text-[#52647E] shadow-2xl">
            <div class="grid h-[88px] grid-cols-[48px_minmax(0,1fr)_42px] items-center gap-3 border-b border-[#E8EEF7] px-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-[0_10px_24px_rgba(16,42,86,0.12)] ring-1 ring-[#DCE7F4]">
                  <KedataLogo class="h-full w-full" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-[18px] font-extrabold leading-none tracking-[0.16em] text-[#102A56]">FINSTART</p>
                  <p class="mt-2 truncate text-[9px] font-bold uppercase tracking-[0.2em] text-[#7A8CA8]">Financial Operations</p>
                </div>
              <button id="btn-mobile-sidebar-close" onClick={() => setIsMobileOpen(false)} class="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#DCE7F4] text-[#52647E] shadow-[0_8px_18px_rgba(16,42,86,0.08)] transition hover:bg-[#F4F8FC] hover:text-[#102A56]" aria-label="Tutup menu">
                <X class="h-5 w-5" />
              </button>
            </div>

            <nav class="flex-1 overflow-y-auto px-3 py-4">
              <div class="space-y-1">
                {menuItems.map(item => {
                const isActive = activeTab === item.id;
                return <button id={`mobile-sidebar-item-${item.id}`} key={item.id} onClick={() => navigate(item.id)} class={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-medium leading-tight transition-all ${isActive ? 'bg-[#0B3A78] text-white shadow-[inset_3px_0_0_#2BA7FF,0_14px_30px_rgba(11,58,120,0.22)]' : 'text-[#52647E] hover:bg-[#F7FAFD] hover:text-[#102A56]'}`}>
                      <span class={isActive ? 'text-white' : 'text-[#8A99AD]'}>{item.icon}</span>
                      <span class="truncate">{item.label}</span>
                    </button>;
              })}
              </div>
            </nav>

            <div class="border-t border-[#E8EEF7] p-3">
              <button id="mobile-btn-logout" onClick={() => {
              setIsMobileOpen(false);
              onLogout();
            }} class="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium text-rose-600 transition hover:bg-rose-50">
                <LogOut class="h-[18px] w-[18px]" />
                <span>Keluar Sistem</span>
              </button>
            </div>
          </aside>
          <button class="flex-1 cursor-default" onClick={() => setIsMobileOpen(false)} aria-label="Tutup menu" />
        </div>}
    </>;
  }
});
</script>
