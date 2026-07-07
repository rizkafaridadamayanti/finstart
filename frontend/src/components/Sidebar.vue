<script lang="tsx">
import { defineComponent, ref, toRefs } from 'vue'
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  ArrowLeftRight,
  Cloud,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Users,
  Box,
  FileText,
  Settings,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-vue-next'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isCollapsed: boolean
  onToggleSidebar?: () => void
  onLogout: () => void
  allowedTabs?: string[]
}

export default defineComponent({
  name: 'Sidebar',
  props: ['activeTab', 'setActiveTab', 'isCollapsed', 'onToggleSidebar', 'onLogout', 'allowedTabs'],
  setup(props) {
    const { activeTab, isCollapsed } = toRefs(props as SidebarProps)
    const { setActiveTab, onLogout, allowedTabs }: SidebarProps = props as SidebarProps
    const isMobileOpen = ref(false)

    const menuGroups = [
      {
        title: 'UTAMA',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
      },
      {
        title: 'OPERASIONAL',
        items: [
          { id: 'crm', label: 'CRM & Proyek', icon: Briefcase },
          { id: 'langganan', label: 'Langganan', icon: Cloud },
          { id: 'sdm', label: 'SDM & Payroll', icon: Users },
          { id: 'aset', label: 'Aset Tetap', icon: Box },
        ],
      },
      {
        title: 'AKUNTANSI',
        items: [
          { id: 'bukubesar', label: 'Buku Besar', icon: BookOpen },
          { id: 'transaksi', label: 'Jurnal & Transaksi', icon: ArrowLeftRight },
          { id: 'piutang', label: 'Piutang', icon: ArrowDownLeft, iconClass: 'text-[#1E5AA8]' },
          { id: 'utang', label: 'Utang', icon: ArrowUpRight, iconClass: 'text-rose-400' },
          { id: 'perpajakan', label: 'Perpajakan', icon: Percent },
        ],
      },
      {
        title: 'PERENCANAAN & ANALISIS',
        items: [
          { id: 'proyeksi', label: 'Proyeksi Bisnis', icon: TrendingUp },
          { id: 'laporan', label: 'Laporan Keuangan', icon: FileText },
        ],
      },
      {
        title: 'SISTEM',
        items: [
          { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
        ],
      },
    ]

    const visibleMenuGroups = () => {
      const allItems = menuGroups.flatMap((group) => group.items)
      const allowed = Array.isArray(allowedTabs) && allowedTabs.length
        ? allowedTabs
        : allItems.map((item) => item.id)

      return menuGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => allowed.includes(item.id)),
        }))
        .filter((group) => group.items.length > 0)
    }

    const navigate = (id: string) => {
      setActiveTab(id)
      isMobileOpen.value = false
    }

    const renderNavigation = (scope: 'desktop' | 'mobile') => (
      <div class="space-y-7">
        {visibleMenuGroups().map((group) => (
          <section key={`${scope}-${group.title}`}>
            <p class="px-5 pb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8A99AD]">
              {group.title}
            </p>
            <div class="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon as any
                const isActive = activeTab.value === item.id
                return (
                  <button
                    id={`${scope}-sidebar-item-${item.id}`}
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    class={`group flex min-h-[48px] w-full items-center gap-3.5 rounded-xl px-5 py-2.5 text-left text-[13px] font-semibold leading-tight transition-all ${
                      isActive
                        ? 'bg-[#0B3A78] text-white shadow-[inset_3px_0_0_#2BA7FF,0_14px_30px_rgba(11,58,120,0.22)]'
                        : 'text-[#52647E] hover:bg-[#F7FAFD] hover:text-[#102A56] hover:shadow-[inset_3px_0_0_rgba(30,90,168,0.28)]'
                    }`}
                  >
                    <Icon class={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-white' : item.iconClass || 'text-[#8A99AD] group-hover:text-[#0E4F9E]'}`} />
                    <span class="min-w-0 truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    )

    return () => (
      <>
        {!isMobileOpen.value && <button
          id="btn-sidebar-mobile-drawer"
          type="button"
          onClick={() => { isMobileOpen.value = true }}
          class="fixed left-0 top-1/2 z-40 flex h-14 w-9 -translate-y-1/2 items-center justify-center rounded-r-2xl border-y border-r border-[#D8E5F4] bg-white/95 text-[#102A56] shadow-[0_12px_28px_rgba(16,42,86,0.14)] transition hover:bg-[#0B3A78] hover:text-white lg:hidden"
          aria-label="Buka sidebar"
          title="Buka sidebar"
        >
          <ChevronRight class="h-5 w-5" />
        </button>}

        <aside
          id="desktop-sidebar"
          style={{
            top: '88px',
            height: 'calc(100vh - 88px)',
            zIndex: 35,
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollbarGutter: 'stable',
          }}
          class={`fixed left-0 hidden shrink-0 flex-col border-r border-[#DCE7F4] bg-white text-[#52647E] shadow-[18px_0_50px_rgba(16,42,86,0.10)] transition-[width,opacity,transform,border-color] duration-300 lg:flex ${
            isCollapsed.value
              ? 'w-0 -translate-x-full overflow-hidden border-r-transparent opacity-0 pointer-events-none'
              : 'w-[286px] translate-x-0 opacity-100'
          }`}
          aria-hidden={isCollapsed.value}
        >
          <nav class="min-w-[286px] px-4 py-6" aria-label="Navigasi utama">
            {renderNavigation('desktop')}
          </nav>

          <div class="min-w-[286px] border-t border-[#E8EEF7] p-4">
            <button
              id="btn-sidebar-logout"
              type="button"
              onClick={onLogout}
              class="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut class="h-[18px] w-[18px]" />
              <span>Keluar Sistem</span>
            </button>
          </div>
        </aside>

        {isMobileOpen.value && (
          <div
            style={{
              top: '88px',
              height: 'calc(100vh - 88px)',
              zIndex: 35,
            }}
            class="fixed inset-x-0 bottom-0 flex bg-black/60 backdrop-blur-sm lg:hidden"
          >
            <aside class="flex h-full w-[300px] max-w-[86vw] flex-col border-r border-[#DCE7F4] bg-white text-[#52647E] shadow-2xl">
              <div class="grid h-[68px] grid-cols-[minmax(0,1fr)_42px] items-center gap-3 border-b border-[#E8EEF7] px-4">
                <div class="min-w-0">
                  <p class="truncate text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#102A56]">Menu Navigasi</p>
                  <p class="mt-1 truncate text-[10px] font-semibold text-[#7A8CA8]">Pilih ruang kerja operasional</p>
                </div>
                <button
                  id="btn-mobile-sidebar-close"
                  type="button"
                  onClick={() => { isMobileOpen.value = false }}
                  class="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#DCE7F4] text-[#52647E] shadow-[0_8px_18px_rgba(16,42,86,0.08)] transition hover:bg-[#F4F8FC] hover:text-[#102A56]"
                  aria-label="Tutup menu"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>

              <nav class="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigasi mobile">
                {renderNavigation('mobile')}
              </nav>

              <div class="border-t border-[#E8EEF7] p-3">
                <button
                  id="mobile-btn-logout"
                  type="button"
                  onClick={() => { isMobileOpen.value = false; onLogout() }}
                  class="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut class="h-[18px] w-[18px]" />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </aside>
            <button class="flex-1 cursor-default" type="button" onClick={() => { isMobileOpen.value = false }} aria-label="Tutup menu" />
          </div>
        )}
      </>
    )
  },
})
</script>
