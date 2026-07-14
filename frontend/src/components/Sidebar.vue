<template>
  <button
    v-if="!isMobileOpen"
    id="btn-sidebar-mobile-drawer"
    type="button"
    class="dashboard-sidebar-drawer-enter fixed left-0 top-1/2 z-40 flex h-14 w-9 -translate-y-1/2 items-center justify-center rounded-r-2xl border-y border-r border-[#D8E5F4] bg-white/95 text-[#102A56] shadow-[0_12px_28px_rgba(16,42,86,0.14)] transition hover:bg-[#0B3A78] hover:text-white lg:hidden"
    aria-label="Buka sidebar"
    title="Buka sidebar"
    @click="isMobileOpen = true"
  >
    <ChevronRight class="h-5 w-5" />
  </button>

  <aside
    id="desktop-sidebar"
    class="dashboard-sidebar-enter fixed left-0 hidden shrink-0 flex-col border-r border-[#DCE7F4] bg-white text-[#52647E] transition-[width,opacity,transform,border-color] duration-300 lg:flex"
    :class="desktopSidebarClass"
    :style="desktopSidebarStyle"
    :aria-label="isCollapsed ? 'Sidebar ikon' : 'Sidebar navigasi'"
  >
    <nav
      :class="isCollapsed ? 'w-[72px] px-3 py-4' : 'min-w-[286px] px-4 py-6'"
      aria-label="Navigasi utama"
    >
      <div v-if="isCollapsed" class="flex flex-col items-center gap-1.5">
        <section
          v-for="(group, groupIndex) in visibleMenuGroups"
          :key="`desktop-${group.title}`"
          class="flex w-full flex-col items-center gap-1.5"
        >
          <button
            v-for="item in group.items"
            :id="`desktop-sidebar-item-${item.id}`"
            :key="item.id"
            type="button"
            :title="item.label"
            class="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all"
            :class="
              activeTab === item.id
                ? 'bg-[#0B3A78] text-white shadow-[0_10px_22px_rgba(11,58,120,0.24)]'
                : 'text-[#8A99AD] hover:bg-[#F1F7FD] hover:text-[#0E4F9E]'
            "
            :aria-label="item.label"
            @click="navigate(item.id)"
          >
            <span
              v-if="activeTab === item.id"
              class="absolute -left-1.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#2BA7FF]"
            />
            <component
              :is="item.icon"
              class="h-[18px] w-[18px] shrink-0"
              :class="
                activeTab === item.id ? 'text-white' : item.iconClass || ''
              "
            />
          </button>
          <span
            v-if="groupIndex < visibleMenuGroups.length - 1"
            class="my-1 h-px w-8 rounded-full bg-[#E5EDF6]"
          />
        </section>
      </div>

      <div v-else class="space-y-7">
        <section
          v-for="group in visibleMenuGroups"
          :key="`desktop-${group.title}`"
        >
          <p
            class="px-5 pb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8A99AD]"
          >
            {{ group.title }}
          </p>
          <div class="space-y-1.5">
            <button
              v-for="item in group.items"
              :id="`desktop-sidebar-item-${item.id}`"
              :key="item.id"
              type="button"
              class="group flex min-h-[48px] w-full items-center gap-3.5 rounded-xl px-5 py-2.5 text-left text-[13px] font-semibold leading-tight transition-all"
              :class="
                activeTab === item.id
                  ? 'bg-[#0B3A78] text-white shadow-[inset_3px_0_0_#2BA7FF,0_14px_30px_rgba(11,58,120,0.22)]'
                  : 'text-[#52647E] hover:bg-[#F7FAFD] hover:text-[#102A56] hover:shadow-[inset_3px_0_0_rgba(30,90,168,0.28)]'
              "
              @click="navigate(item.id)"
            >
              <component
                :is="item.icon"
                class="h-[18px] w-[18px] shrink-0"
                :class="
                  activeTab === item.id
                    ? 'text-white'
                    : item.iconClass ||
                      'text-[#8A99AD] group-hover:text-[#0E4F9E]'
                "
              />
              <span class="min-w-0 truncate">{{ item.label }}</span>
            </button>
          </div>
        </section>
      </div>
    </nav>

    <div
      :class="
        isCollapsed
          ? 'w-[72px] border-t border-[#E8EEF7] p-3'
          : 'min-w-[286px] border-t border-[#E8EEF7] p-4'
      "
    >
      <button
        id="btn-sidebar-logout"
        type="button"
        :title="isCollapsed ? 'Keluar Sistem' : undefined"
        class="flex w-full items-center rounded-xl text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
        :class="
          isCollapsed
            ? 'h-12 justify-center px-0'
            : 'min-h-[48px] gap-3 px-4 py-3'
        "
        @click="emit('logout')"
      >
        <LogOut class="h-[18px] w-[18px]" />
        <span v-if="!isCollapsed">Keluar Sistem</span>
      </button>
    </div>
  </aside>

  <div
    v-if="isMobileOpen"
    class="fixed inset-x-0 bottom-0 flex bg-black/60 backdrop-blur-sm lg:hidden"
    :style="{ top: '88px', height: 'calc(100vh - 88px)', zIndex: 35 }"
  >
    <aside
      class="flex h-full w-[300px] max-w-[86vw] flex-col border-r border-[#DCE7F4] bg-white text-[#52647E] shadow-2xl"
    >
      <div
        class="grid h-[68px] grid-cols-[minmax(0,1fr)_42px] items-center gap-3 border-b border-[#E8EEF7] px-4"
      >
        <div class="min-w-0">
          <p
            class="truncate text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#102A56]"
          >
            Menu Navigasi
          </p>
          <p class="mt-1 truncate text-[10px] font-semibold text-[#7A8CA8]">
            Pilih ruang kerja operasional
          </p>
        </div>
        <button
          id="btn-mobile-sidebar-close"
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#DCE7F4] text-[#52647E] shadow-[0_8px_18px_rgba(16,42,86,0.08)] transition hover:bg-[#F4F8FC] hover:text-[#102A56]"
          aria-label="Tutup menu"
          @click="isMobileOpen = false"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <nav
        class="flex-1 overflow-y-auto px-3 py-5"
        aria-label="Navigasi mobile"
      >
        <div class="space-y-7">
          <section
            v-for="group in visibleMenuGroups"
            :key="`mobile-${group.title}`"
          >
            <p
              class="px-5 pb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8A99AD]"
            >
              {{ group.title }}
            </p>
            <div class="space-y-1.5">
              <button
                v-for="item in group.items"
                :id="`mobile-sidebar-item-${item.id}`"
                :key="item.id"
                type="button"
                class="group flex min-h-[48px] w-full items-center gap-3.5 rounded-xl px-5 py-2.5 text-left text-[13px] font-semibold leading-tight transition-all"
                :class="
                  activeTab === item.id
                    ? 'bg-[#0B3A78] text-white shadow-[inset_3px_0_0_#2BA7FF,0_14px_30px_rgba(11,58,120,0.22)]'
                    : 'text-[#52647E] hover:bg-[#F7FAFD] hover:text-[#102A56] hover:shadow-[inset_3px_0_0_rgba(30,90,168,0.28)]'
                "
                @click="navigate(item.id)"
              >
                <component
                  :is="item.icon"
                  class="h-[18px] w-[18px] shrink-0"
                  :class="
                    activeTab === item.id
                      ? 'text-white'
                      : item.iconClass ||
                        'text-[#8A99AD] group-hover:text-[#0E4F9E]'
                  "
                />
                <span class="min-w-0 truncate">{{ item.label }}</span>
              </button>
            </div>
          </section>
        </div>
      </nav>

      <div class="border-t border-[#E8EEF7] p-3">
        <button
          id="mobile-btn-logout"
          type="button"
          class="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
          @click="handleMobileLogout"
        >
          <LogOut class="h-[18px] w-[18px]" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
    <button
      class="flex-1 cursor-default"
      type="button"
      aria-label="Tutup menu"
      @click="isMobileOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  ArrowLeftRight,
  Cloud,
  Building2,
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
} from "lucide-vue-next";

const props = defineProps({
  activeTab: { type: String, required: true },
  isCollapsed: { type: Boolean, default: false },
  allowedTabs: { type: Array, default: () => [] },
});

const emit = defineEmits(["select-tab", "toggle-sidebar", "logout"]);

const isMobileOpen = ref(false);

const menuGroups = [
  {
    title: "UTAMA",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "OPERASIONAL",
    items: [
      { id: "crm", label: "CRM & Proyek", icon: Briefcase },
      { id: "master-klien", label: "Klien Partner", icon: Building2 },
      { id: "langganan", label: "Langganan", icon: Cloud },
      { id: "sdm", label: "SDM & Payroll", icon: Users },
      { id: "aset", label: "Aset Tetap", icon: Box },
    ],
  },
  {
    title: "AKUNTANSI",
    items: [
      { id: "bukubesar", label: "Buku Besar", icon: BookOpen },
      { id: "transaksi", label: "Jurnal & Transaksi", icon: ArrowLeftRight },
      {
        id: "piutang",
        label: "Piutang",
        icon: ArrowDownLeft,
        iconClass: "text-[#1E5AA8]",
      },
      {
        id: "utang",
        label: "Utang",
        icon: ArrowUpRight,
        iconClass: "text-rose-400",
      },
      { id: "perpajakan", label: "Perpajakan", icon: Percent },
    ],
  },
  {
    title: "PERENCANAAN & ANALISIS",
    items: [
      { id: "proyeksi", label: "Proyeksi Bisnis", icon: TrendingUp },
      { id: "laporan", label: "Laporan Keuangan", icon: FileText },
    ],
  },
  {
    title: "SISTEM",
    items: [{ id: "pengaturan", label: "Pengaturan", icon: Settings }],
  },
];

const visibleMenuGroups = computed(() => {
  const allItems = menuGroups.flatMap((group) => group.items);
  const allowed =
    Array.isArray(props.allowedTabs) && props.allowedTabs.length
      ? props.allowedTabs
      : allItems.map((item) => item.id);

  return menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => allowed.includes(item.id)),
    }))
    .filter((group) => group.items.length > 0);
});

const desktopSidebarStyle = computed(() => ({
  top: "88px",
  height: "calc(100vh - 88px)",
  zIndex: 35,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarGutter: props.isCollapsed ? "auto" : "stable",
}));

const desktopSidebarClass = computed(() =>
  props.isCollapsed
    ? "finstart-sidebar-rail w-[72px] translate-x-0 opacity-100 shadow-[10px_0_28px_rgba(16,42,86,0.07)]"
    : "w-[286px] translate-x-0 opacity-100 shadow-[18px_0_50px_rgba(16,42,86,0.10)]",
);

function navigate(id) {
  emit("select-tab", id);
  isMobileOpen.value = false;
}

function handleMobileLogout() {
  isMobileOpen.value = false;
  emit("logout");
}
</script>
