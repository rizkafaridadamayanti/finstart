<script setup>
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Briefcase,
  Cloud,
  FileText,
  LayoutDashboard,
  Percent,
  Settings,
  TrendingUp,
  Users,
  X,
} from 'lucide-vue-next'
import FinStartLogo from '../../assets/finstart-logo.png'

const emit = defineEmits(['toggle-sidebar'])

const menuItems = [
  { label: 'Dashboard', routeName: 'dashboard', icon: LayoutDashboard },
  { label: 'CRM & Proyek', routeName: 'crm-project', icon: Briefcase },
  { label: 'Buku Besar', routeName: 'general-ledger', icon: BookOpen },
  { label: 'Transaksi', routeName: 'transactions', icon: ArrowLeftRight },
  { label: 'Langganan', routeName: 'subscriptions', icon: Cloud },
  { label: 'Piutang', routeName: 'receivables', icon: ArrowDownLeft },
  { label: 'Utang', routeName: 'payables', icon: ArrowUpRight },
  { label: 'Proyeksi Bisnis', routeName: 'projections', icon: TrendingUp },
  { label: 'Perpajakan', routeName: 'taxes', icon: Percent },
  { label: 'SDM', routeName: 'employees', icon: Users },
  { label: 'Aset', routeName: 'assets', icon: Box },
  { label: 'Laporan', routeName: 'reports', icon: FileText },
  { label: 'Settings', routeName: 'settings', icon: Settings },
]
</script>

<template>
  <aside class="sidebar">
    <div class="flex items-center justify-between gap-3 px-5 py-4">
      <RouterLink :to="{ name: 'dashboard' }" class="brand">
        <img :src="FinStartLogo" alt="FinStart logo" class="brand-logo" />
        <span>
          <strong>FinStart</strong>
          <small>Digital Accounting</small>
        </span>
      </RouterLink>
      <button type="button" class="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8E5F4] text-[#102A56] transition hover:bg-[#F4F8FC]" @click="emit('toggle-sidebar')" aria-label="Sembunyikan sidebar">
        <X size="18" />
      </button>
    </div>

    <p class="menu-caption">MENU UTAMA</p>

    <nav class="menu-list">
      <RouterLink
        v-for="item in menuItems"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        class="menu-item"
      >
        <span class="menu-icon">
          <component :is="item.icon" :size="17" :stroke-width="2.2" />
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
