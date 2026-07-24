<template>
  <aside
    id="desktop-sidebar"
    class="dashboard-sidebar-enter fixed left-0 shrink-0 flex-col border-r border-[#DCE7F4] bg-white text-[#52647E] transition-[width,opacity,transform,border-color] duration-300 flex"
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
              isCollapsedItemActive(item)
                ? 'bg-[#0B3A78] text-white shadow-[0_10px_22px_rgba(11,58,120,0.24)]'
                : 'text-[#8A99AD] hover:bg-[#F1F7FD] hover:text-[#0E4F9E]'
            "
            :aria-label="item.label"
            @click="navigate(firstNavigableId(item))"
          >
            <span
              v-if="isCollapsedItemActive(item)"
              class="absolute -left-1.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#2BA7FF]"
            />
            <component
              :is="item.icon"
              class="h-[18px] w-[18px] shrink-0"
              :class="
                isCollapsedItemActive(item) ? 'text-white' : item.iconClass || ''
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
            <div v-for="item in group.items" :key="item.id" class="space-y-1">
              <button
                :id="`desktop-sidebar-item-${item.id}`"
                type="button"
                class="group flex min-h-[48px] w-full items-center gap-3.5 rounded-xl px-5 py-2.5 text-left text-[13px] font-semibold leading-tight transition-all"
                :class="
                  isItemActive(item)
                    ? 'bg-[#0B3A78] text-white shadow-[inset_3px_0_0_#2BA7FF,0_14px_30px_rgba(11,58,120,0.22)]'
                    : 'text-[#52647E] hover:bg-[#F7FAFD] hover:text-[#102A56] hover:shadow-[inset_3px_0_0_rgba(30,90,168,0.28)]'
                "
                :aria-expanded="hasChildren(item) ? isExpanded(item) : undefined"
                @click="handleItemClick(item)"
              >
                <component
                  :is="item.icon"
                  class="h-[18px] w-[18px] shrink-0"
                  :class="
                    isItemActive(item)
                      ? 'text-white'
                      : item.iconClass ||
                        'text-[#8A99AD] group-hover:text-[#0E4F9E]'
                  "
                />
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                <template v-if="hasChildren(item)">
                  <ChevronDown
                    v-if="isExpanded(item)"
                    class="h-4 w-4 shrink-0 text-[#8A99AD]"
                  />
                  <ChevronRight v-else class="h-4 w-4 shrink-0 text-[#8A99AD]" />
                </template>
              </button>
              <div
                v-if="hasChildren(item) && isExpanded(item)"
                class="space-y-1 pl-3"
                :style="{ marginLeft: '34px', borderLeft: '1px solid #E5EDF6' }"
              >
                <button
                  v-for="child in item.children"
                  :id="`desktop-sidebar-item-${child.id}`"
                  :key="child.id"
                  type="button"
                  class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] font-semibold leading-tight transition-all"
                  :class="
                    activeTab === child.id
                      ? 'bg-[#0B3A78] text-white'
                      : 'text-[#6B7A90] hover:bg-[#F7FAFD] hover:text-[#102A56]'
                  "
                  @click="navigate(child.id)"
                >
                  <component
                    :is="child.icon"
                    class="h-4 w-4 shrink-0"
                    :class="activeTab === child.id ? 'text-white' : 'text-[#8A99AD]'"
                  />
                  <span class="min-w-0 truncate">{{ child.label }}</span>
                </button>
              </div>
            </div>
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
</template>

<script setup>
import { computed, ref, watch, nextTick } from "vue";
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
  LogOut,
  Clock,
  ClipboardList,
  History,
  Wallet,
  CalendarX,
  Calculator,
  DollarSign,
  Tags,
  ChevronRight,
  ChevronDown,
  Scale,
  ListChecks,
  Shield,
  LineChart,
  PiggyBank,
  Landmark,
  CreditCard,
} from "lucide-vue-next";

const props = defineProps({
  activeTab: { type: String, required: true },
  isCollapsed: { type: Boolean, default: false },
  allowedTabs: { type: Array, default: () => [] },
});

const emit = defineEmits(["select-tab", "toggle-sidebar", "logout"]);

const menuGroups = [
  {
    title: "UTAMA",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "OPERASIONAL",
    items: [
      {
        id: "crm-group",
        label: "CRM & Proyek",
        icon: Briefcase,
        groupOnly: true,
        children: [
          { id: "crm", label: "Kelola Proyek", icon: ClipboardList },
          { id: "crm-riwayat", label: "Riwayat Proyek", icon: Clock },
        ],
      },
      { id: "master-klien", label: "Klien Partner", icon: Building2 },
      {
        id: "langganan-group",
        label: "Langganan",
        icon: Cloud,
        groupOnly: true,
        children: [
          { id: "langganan", label: "Kelola Langganan", icon: ClipboardList },
          {
            id: "langganan-riwayat-transaksi",
            label: "Riwayat Transaksi",
            icon: History,
          },
          {
            id: "langganan-tagihan",
            label: "Tagihan Berikutnya",
            icon: Wallet,
          },
          {
            id: "langganan-riwayat-kadaluarsa",
            label: "Riwayat Kadaluarsa",
            icon: CalendarX,
          },
        ],
      },
      {
        id: "sdm-group",
        label: "SDM & Payroll",
        icon: Users,
        groupOnly: true,
        children: [
          { id: "sdm", label: "Kelola Pegawai", icon: ClipboardList },
          { id: "sdm-bpjs", label: "Atur BPJS", icon: Calculator },
          {
            id: "sdm-divisi-jabatan",
            label: "Kelola Divisi & Jabatan",
            icon: Building2,
          },
          {
            id: "sdm-riwayat-penggajian",
            label: "Riwayat Penggajian",
            icon: History,
          },
          {
            id: "sdm-proses-payroll",
            label: "Proses Payroll",
            icon: DollarSign,
          },
        ],
      },
      {
        id: "aset-group",
        label: "Aset Tetap",
        icon: Box,
        groupOnly: true,
        children: [
          { id: "aset", label: "Kelola Aset", icon: ClipboardList },
          { id: "aset-kategori", label: "Kategori Aset", icon: Tags },
          { id: "aset-riwayat", label: "Riwayat Aset", icon: History },
        ],
      },
    ],
  },
  {
    title: "AKUNTANSI",
    items: [
      { id: "bukubesar", label: "Buku Besar", icon: BookOpen },
      { id: "transaksi", label: "Jurnal & Transaksi", icon: ArrowLeftRight },
      {
        id: "piutang-group",
        label: "Piutang",
        icon: ArrowDownLeft,
        iconClass: "text-[#1E5AA8]",
        groupOnly: true,
        children: [
          { id: "piutang", label: "Kelola Piutang", icon: FileText },
          { id: "piutang-pelunasan", label: "Catat Pelunasan", icon: Landmark },
        ],
      },
      {
        id: "utang-group",
        label: "Utang",
        icon: ArrowUpRight,
        iconClass: "text-rose-400",
        groupOnly: true,
        children: [
          { id: "utang", label: "Kelola Utang", icon: FileText },
          { id: "utang-pembayaran", label: "Catat Pembayaran", icon: CreditCard },
        ],
      },
      { id: "perpajakan", label: "Perpajakan", icon: Percent },
    ],
  },
  {
    title: "PERENCANAAN & ANALISIS",
    items: [
      {
        id: "proyeksi-group",
        label: "Proyeksi Bisnis",
        icon: TrendingUp,
        groupOnly: true,
        children: [
          { id: "proyeksi", label: "Skenario & Target", icon: TrendingUp },
          {
            id: "proyeksi-roadmap",
            label: "Roadmap Pertumbuhan",
            icon: LineChart,
          },
          {
            id: "proyeksi-anggaran",
            label: "Kontrol Anggaran",
            icon: PiggyBank,
          },
        ],
      },
      {
        id: "laporan-group",
        label: "Laporan Keuangan",
        icon: FileText,
        groupOnly: true,
        children: [
          { id: "laporan", label: "Laba Rugi", icon: ClipboardList },
          { id: "laporan-neraca", label: "Neraca", icon: Scale },
          { id: "laporan-aruskas", label: "Arus Kas", icon: Wallet },
          {
            id: "laporan-trialbalance",
            label: "Trial Balance",
            icon: ListChecks,
          },
          { id: "laporan-bukubesar", label: "Buku Besar", icon: BookOpen },
          {
            id: "laporan-umurtagih",
            label: "Umur Piutang",
            icon: ArrowDownLeft,
          },
          {
            id: "laporan-umurutang",
            label: "Umur Utang",
            icon: ArrowUpRight,
          },
          { id: "laporan-pajak", label: "Laporan Pajak", icon: Percent },
          { id: "laporan-payroll", label: "Biaya Payroll", icon: DollarSign },
          { id: "laporan-aset", label: "Aset & Penyusutan", icon: Box },
          {
            id: "laporan-profitproyek",
            label: "Profit Proyek",
            icon: Briefcase,
          },
        ],
      },
    ],
  },
  {
    title: "SISTEM",
    items: [
      {
        id: "pengaturan-group",
        label: "Pengaturan",
        icon: Settings,
        groupOnly: true,
        children: [
          { id: "pengaturan", label: "Profil Perusahaan", icon: Building2 },
          {
            id: "pengaturan-keamanan",
            label: "Keamanan & Akses",
            icon: Shield,
          },
        ],
      },
    ],
  },
];

const visibleMenuGroups = computed(() => {
  const allItems = menuGroups
    .flatMap((group) => group.items)
    .flatMap((item) => [item, ...(item.children || [])]);
  const allowed =
    Array.isArray(props.allowedTabs) && props.allowedTabs.length
      ? props.allowedTabs
      : allItems.map((item) => item.id);

  return menuGroups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) =>
          item.children
            ? {
                ...item,
                children: item.children.filter((child) =>
                  allowed.includes(child.id),
                ),
              }
            : item,
        )
        .filter((item) =>
          item.children ? item.children.length > 0 : allowed.includes(item.id),
        ),
    }))
    .filter((group) => group.items.length > 0);
});

const itemsWithChildren = menuGroups
  .flatMap((group) => group.items)
  .filter((item) => item.children && item.children.length);

function parentIdForTab(tab) {
  const parent = itemsWithChildren.find((item) =>
    item.children.some((child) => child.id === tab),
  );
  return parent ? parent.id : null;
}

// Which group renders expanded is normally derived straight from activeTab
// (pure, recomputed on every render — never stale). manualExpandOverride only
// exists for the "browsing without navigating" case: the user clicked a
// group's own header to open/close it while sitting on an unrelated tab (or
// to force-close a group whose child page they're currently on). Any actual
// navigation invalidates that override immediately, so the very next render
// falls back to the tab-derived answer with no watcher-timing window where
// the old group could still read as expanded.
const manualExpandOverride = ref(null);

watch(
  () => props.activeTab,
  () => {
    manualExpandOverride.value = null;
  },
);

function hasChildren(item) {
  return !!(item.children && item.children.length);
}

function isItemActive(item) {
  if (hasChildren(item)) {
    if (props.activeTab === item.id) return true;
    if (isExpanded(item)) return true;
    // Falling back to "the active tab lives in this section" must not fire
    // while a DIFFERENT group is manually peeked open - otherwise both rows
    // read as active at once (e.g. peeking "Piutang" while still parked on
    // a "Utang" page left Utang's row navy too).
    if (
      itemsWithChildren.some(
        (group) => group.id !== item.id && isExpanded(group),
      )
    ) {
      return false;
    }
    return item.children.some((child) => child.id === props.activeTab);
  }
  // Leaf item: only show active if it's the current page, and no unrelated
  // group is expanded right now (only one row should read as selected).
  if (props.activeTab !== item.id) return false;
  return !itemsWithChildren.some((group) => isExpanded(group));
}

function isCollapsedItemActive(item) {
  if (props.activeTab === item.id) return true;
  return (item.children || []).some((child) => child.id === props.activeTab);
}

function firstNavigableId(item) {
  return hasChildren(item) ? item.children[0].id : item.id;
}

// Expanding a group inserts new rows above whatever comes after it, shifting
// those items down. A click landing right after that shift (within the same
// render tick) can hit the wrong item (whatever moved under the cursor)
// instead of the one the user aimed for. Briefly ignore navigation to
// anything except the group's own new children so that misfire can't happen.
// The guard is lifted as soon as the DOM reflects the shift (nextTick), so a
// deliberate follow-up click on a different, unrelated menu item — which
// always lands well after that tick — is never swallowed.
let layoutShiftGuardActive = false;
let layoutShiftGuardExceptIds = null;

function handleItemClick(item) {
  if (!hasChildren(item)) {
    navigate(item.id);
    return;
  }
  const wasExpanded = isExpanded(item);
  toggleExpanded(item.id);
  if (!wasExpanded) {
    layoutShiftGuardActive = true;
    layoutShiftGuardExceptIds = new Set(item.children.map((child) => child.id));
    nextTick(() => {
      layoutShiftGuardActive = false;
    });
  }
}

function isExpanded(item) {
  if (manualExpandOverride.value) {
    // A manual override, once set, is authoritative for every group — not
    // just the one it names — so opening group Y also visually closes
    // whichever group X was expanded purely because activeTab lived inside
    // it (only one sub-sidebar is ever shown at a time).
    return (
      manualExpandOverride.value.id === item.id &&
      manualExpandOverride.value.expanded
    );
  }
  return parentIdForTab(props.activeTab) === item.id;
}

function toggleExpanded(id) {
  const currentlyExpanded = isExpanded({ id });
  manualExpandOverride.value = { id, expanded: !currentlyExpanded };
}

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
  const isExempt = layoutShiftGuardExceptIds?.has(id);
  if (layoutShiftGuardActive && !isExempt) return;
  // Clicking any actual page link always resolves whatever group is merely
  // "peeked open" back to the tab-derived truth. This has to happen here
  // (not just via the activeTab watcher) because clicking the page you're
  // already on doesn't change activeTab, so no watcher would ever fire.
  manualExpandOverride.value = null;
  emit("select-tab", id);
}
</script>
