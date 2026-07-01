<script setup>
import FinStartLogo from '../../assets/finstart-logo.png'

const menuItems = [
  { label: 'Dashboard', routeName: 'dashboard', icon: '⌂' },
  { label: 'CRM & Proyek', routeName: 'crm-project', icon: '◫' },
  { label: 'Buku Besar', routeName: 'general-ledger', icon: '▤' },
  { label: 'Transaksi', routeName: 'transactions', icon: '⇄' },
  { label: 'Langganan', routeName: 'subscriptions', icon: '↻' },
  { label: 'Piutang', routeName: 'receivables', icon: '↓' },
  { label: 'Utang', routeName: 'payables', icon: '↑' },
  { label: 'Proyeksi Bisnis', routeName: 'projections', icon: '◔' },
  { label: 'Perpajakan', routeName: 'taxes', icon: '%' },
  { label: 'SDM', routeName: 'employees', icon: '♙' },
  { label: 'Aset', routeName: 'assets', icon: '▣' },
  { label: 'Laporan', routeName: 'reports', icon: '▥' },
  { label: 'Settings', routeName: 'settings', icon: '⚙' },
]
</script>

<template>
  <aside class="sidebar">
    <RouterLink :to="{ name: 'dashboard' }" class="brand">
      <img :src="FinStartLogo" alt="FinStart logo" class="brand-logo" />
      <span>
        <strong>FinStart</strong>
        <small>Digital Accounting</small>
      </span>
    </RouterLink>

    <p class="menu-caption">MENU UTAMA</p>

    <nav class="menu-list">
      <RouterLink
        v-for="item in menuItems"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        class="menu-item"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>